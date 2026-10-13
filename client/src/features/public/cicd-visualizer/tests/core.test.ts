import test from 'node:test';
import ELK from 'elkjs/lib/elk.bundled.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeWorkflow } from '../core/analyzeWorkflow';
import { expandMatrix } from '../core/matrix';
import { editorText, rawToEditorOffset, editorToRawOffset } from '../core/sourceOffsets';
import { buildGraph } from '../core/graph';
import { layoutGraph } from '../layout/layoutGraph';
import { summaryExport } from '../utils/exportWorkflow';
import { scriptAnnotations, inheritedSettings, stepSummary } from '../core/explain';
const parse = (rawText: string) => analyzeWorkflow({ id: 'test', filename: 'workflow.yml', rawText, revision: 4 });
const base = (steps = '- run: echo hello') => `name: Test\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      ${steps.replaceAll('\n', '\n      ')}\n`;
const example = readFileSync(new URL('./fixtures/alibaba-vm.yml', import.meta.url), 'utf8');

test('supplied deployment is one job, seven declared steps; SSH annotations do not create jobs', () => {
 const r = parse(example); assert.equal(r.status, 'ready'); assert.equal(r.model!.jobs.length, 1);
 const job = r.model!.jobs[0]; assert.equal(job.steps.length, 7);
 assert.equal(job.steps.filter(s => s.kind === 'action').length, 4);
 assert.equal(job.steps.filter(s => s.kind === 'run').length, 3);
 const graph = buildGraph(r.model!, 'detailed', [job.id]);
 assert.equal(graph.nodes.filter(n => n.kind === 'step').length, 7);
 assert.equal(graph.edges.filter(e => e.kind === 'sequence').length, 6);
 assert.ok(scriptAnnotations(job.steps[6].with.script as string, false).length > 0);
});

test('independent jobs stay parallel; fan-in only connects declared needs', async () => {
 const r = parse(`on: [push, pull_request]\njobs:\n  lint:\n    runs-on: ubuntu-latest\n    steps: [{run: npm run lint}]\n  test:\n    runs-on: ubuntu-latest\n    steps: [{run: npm test}]\n  deploy:\n    needs: [lint, test]\n    uses: org/repo/.github/workflows/deploy.yml@main\n`);
 assert.equal(r.status, 'ready'); assert.equal(r.completeness, 'complete');
 const g = buildGraph(r.model!, 'overview', []);
 assert.equal(g.edges.filter(e => e.kind === 'dependency').length, 2);
 assert.equal(g.edges.filter(e => e.kind === 'trigger').length, 4);
 assert.equal(r.model!.jobs[2].steps.length, 0);
 const laid = await layoutGraph(g, new ELK());
 assert.ok(laid.nodes.every(n => Number.isFinite(n.position.x) && Number.isFinite(n.position.y)));
 assert.equal(laid.nodes.find(n=>n.id===r.model!.jobs[0].id)!.position.x, laid.nodes.find(n=>n.id===r.model!.jobs[1].id)!.position.x);
});

test('missing dependencies, self-dependencies and cycles are diagnosed', () => {
 for (const needs of ['missing', 'build']) {
 const r = parse(base().replace('runs-on:', `needs: ${needs}\n    runs-on:`));
 assert.equal(r.status, 'invalid'); assert.ok(r.diagnostics.some(d => d.code === (needs === 'missing' ? 'JOB_NEEDS_MISSING' : 'JOB_DEPENDENCY_CYCLE')));
 }
 const r = parse('on: push\njobs:\n  a: {needs: b, runs-on: ubuntu-latest, steps: [{run: a}]}\n  b: {needs: a, runs-on: ubuntu-latest, steps: [{run: b}]}');
 assert.equal(r.diagnostics.filter(d => d.code === 'JOB_DEPENDENCY_CYCLE').length, 2);
});

test('syntax, duplicate keys, multi-document and other providers are explicit failures', () => {
 assert.equal(parse('jobs: [').status, 'invalid');
 assert.ok(parse(base().replace('on: push', 'on: push\non: pull_request')).diagnostics.some(d => d.code === 'YAML_DUPLICATE_KEY'));
 assert.ok(parse(base() + '\n---\non: push').diagnostics.some(d => d.code === 'YAML_MULTI_DOCUMENT'));
 assert.equal(parse('stages: [build]\ncompile: {script: npm run build}').provider, 'gitlab');
 assert.equal(parse('trigger: [main]\njobs: [{job: Build, steps: [{script: npm run build}]}]').provider, 'azure');
 assert.equal(parse('arbitrary: text').status, 'unsupported');
 assert.equal(parse(base().replace('build:', 'script:')).provider, 'github');
});

test('raw scripts, expressions and unknown fields retained with UTF-16 CRLF/BOM/Unicode spans', () => {
 const text = '\ufeff' + base('- name: Kiểm tra 🚀\n  if: ${{ github.ref == \'refs/heads/main\' }}\n  run: |\n    echo "héllo 🚀"\n    npm test\n  custom: retained').replaceAll('\n', '\r\n');
 const r = parse(text), step = r.model!.jobs[0].steps[0];
 assert.equal(r.status, 'ready'); assert.equal(r.completeness, 'partial');
 assert.equal(step.condition, "${{ github.ref == 'refs/heads/main' }}");
 assert.equal(step.raw.custom, 'retained'); assert.match(step.script!, /npm test/);
 assert.match(text.slice(step.sourceRef.startOffset, step.sourceRef.endOffset), /name: Kiểm tra 🚀/);
 assert.equal(step.sourceRef.revision, 4); assert.equal(step.sourceRef.line, 7);
 assert.ok(r.diagnostics.some(d => d.code === 'FEATURE_UNSUPPORTED'));
});

test('alias provenance retained; cyclic, excessive and deep input bounded; merge warns', () => {
 const r = parse('on: push\nx-step: &step {run: echo hello}\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps: [*step]');
 assert.ok(r.model!.jobs[0].steps[0].sourceRef.relatedRefs?.length);
 assert.equal(parse(base().replace('on: push', 'on: push\nx-loop: &loop {self: *loop}')).status, 'limited');
 assert.equal(parse('x: ' + '['.repeat(90) + '1' + ']'.repeat(90)).status, 'limited');
 assert.equal(parse('a'.repeat(1024 * 1024 + 1)).status, 'limited');
 const merged = parse(base('- run: echo hello\n  env: {<<: {FOO: bar}, BAZ: value}'));
 assert.ok(merged.diagnostics.some(d => d.params?.field === 'YAML merge (<<)'));
});

test('matrix include augments originals, exclude removes combinations, dynamic stays symbolic', () => {
 const m = expandMatrix({ fruit: ['apple', 'pear'], animal: ['cat', 'dog'], include: [{color:'green'}, {color:'pink',animal:'cat'}, {fruit:'apple',shape:'circle'}, {fruit:'banana'}, {fruit:'banana',animal:'cat'}] });
 assert.equal(m.count, 6); assert.deepEqual(m.preview[0], {fruit:'apple',animal:'cat',color:'pink',shape:'circle'});
 assert.equal(expandMatrix({os:['linux','win'],node:[20,22],exclude:[{os:'win',node:20}]}).count,3);
 assert.equal(expandMatrix({include:[{os:'linux'},{os:'win'}]}).count,2);
 assert.equal(expandMatrix('${{ fromJSON(needs.setup.outputs.matrix) }}').kind,'dynamic');
 assert.equal(expandMatrix({os:['${{ inputs.os }}']}).kind,'dynamic');
 assert.equal(expandMatrix({os:'linux'}).kind,'invalid');
 assert.equal(expandMatrix({a:Array.from({length:100},(_,i)=>i),b:Array.from({length:100},(_,i)=>i)}).kind,'limited');
 const preview = expandMatrix({a:Array.from({length:70},(_,i)=>i)}); assert.equal(preview.count,70);assert.equal(preview.preview.length,50);
});

test('node budget retains all jobs and never fabricates truncated sequence endpoints', () => {
 const steps=Array.from({length:550},(_,i)=>`- name: Step ${i}\n  run: echo ${i}`).join('\n');
 const r=parse(base(steps)), g=buildGraph(r.model!,'detailed',r.model!.jobs.map(j=>j.id));
 assert.equal(g.nodes.length,500);assert.equal(g.truncated,true);assert.equal(r.model!.jobs[0].steps.length,550);
 const ids=new Set(g.nodes.map(n=>n.id));assert.ok(g.edges.every(e=>ids.has(e.source)&&ids.has(e.target)));
 assert.equal(buildGraph(r.model!,'overview',[]).nodes.length,2);
});

test('invalid duplicate step IDs still have distinct graph keys', () => {
 const r=parse(base('- id: same\n  run: echo a\n- id: same\n  run: echo b'));
 assert.equal(r.status,'invalid');const ids=r.model!.jobs[0].steps.map(s=>s.id);assert.equal(new Set(ids).size,2);
});

test('environment precedence is tracked, JSON summary excludes raw scripts and config values', () => {
 const r=parse(base('- name: Build\n  run: echo SCRIPT_SENTINEL\n  env: {TOKEN: SECRET_SENTINEL, COMMON: step}').replace('jobs:','env: {COMMON: workflow, GLOBAL: value}\njobs:').replace('runs-on:','env: {COMMON: job}\n    runs-on:'));
 const job=r.model!.jobs[0],step=job.steps[0];
 const inherited=inheritedSettings(r.model!,job,step);assert.ok(inherited);
 const json=JSON.stringify(summaryExport(r.model!,r,buildGraph(r.model!,'detailed',[job.id])));
 assert.doesNotMatch(json,/SCRIPT_SENTINEL|SECRET_SENTINEL|rawText|script|TOKEN/);
});

test('JSON summary never uses a nameless run command as its name', () => {
 const r=parse(base('- run: echo HIDDEN_SCRIPT_SENTINEL'));
 const json=JSON.stringify(summaryExport(r.model!,r,buildGraph(r.model!,'detailed',r.model!.jobs.map(j=>j.id))));
 assert.doesNotMatch(json,/HIDDEN_SCRIPT_SENTINEL/);assert.match(json,/Step 1/);
});

test('unknown actions retain their reference without inferring transfer from arbitrary inputs', () => {
 const r=parse(base('- uses: vendor/unknown-action@v9\n  with: {source: input, target: output}'));
 const step=r.model!.jobs[0].steps[0];assert.equal(step.kind,'action');assert.equal(step.actionRef,'vendor/unknown-action@v9');
 assert.equal(step.with.target,'output');assert.match(stepSummary(step,true),/Invoke an action/);
});

test('editor/source positions map CRLF, BOM and Unicode without changing raw input', () => {
 const raw='\ufeffon: push\r\njobs:\r\n  build:\r\n    runs-on: ubuntu-latest\r\n    steps:\r\n      - name: Build 🚀\r\n        run: npm test\r\n';
 const r=parse(raw), ref=r.model!.jobs[0].steps[0].sourceRef, normalized=editorText(raw);
 assert.equal(rawToEditorOffset(raw,ref.startOffset),normalized.indexOf('name: Build 🚀'));
 assert.equal(editorToRawOffset(raw,normalized.indexOf('npm test')),raw.indexOf('npm test'));
 assert.equal(editorToRawOffset(raw,rawToEditorOffset(raw,ref.endOffset)),ref.endOffset);
 assert.equal(raw.slice(ref.startOffset,ref.endOffset).includes('\r\n'),true);
});

test('unresolved YAML tags surface support warnings instead of silently claiming completeness', () => {
 const r=parse(base('- run: !custom echo hello'));assert.equal(r.status,'ready');assert.equal(r.completeness,'partial');assert.ok(r.diagnostics.some(d=>d.code==='FEATURE_UNSUPPORTED'));
});
