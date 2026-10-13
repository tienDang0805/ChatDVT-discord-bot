import { isAlias, isMap, isSeq, LineCounter, parseDocument } from 'yaml';
import { expandMatrix } from './matrix';
import { asRecord, LIMITS } from './types';
import type { AnalysisResult, Diagnostic, Job, SourceDocument, SourceRef, Step, Trigger } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const pick = (record: Record<string, unknown>, keys: string[]) => Object.fromEntries(keys.filter(k => k in record).map(k => [k, record[k]]));
const knownRoot = new Set(['name', 'run-name', 'on', 'jobs', 'env', 'defaults', 'permissions', 'concurrency']);
const knownJob = new Set(['name', 'needs', 'runs-on', 'if', 'steps', 'uses', 'with', 'secrets', 'strategy', 'env', 'defaults', 'permissions', 'concurrency', 'environment', 'container', 'services', 'timeout-minutes', 'continue-on-error', 'outputs', 'snapshot']);
const knownStep = new Set(['id', 'name', 'run', 'uses', 'with', 'env', 'if', 'shell', 'working-directory', 'timeout-minutes', 'continue-on-error']);

export function analyzeWorkflow(input: SourceDocument, providerHint?: 'github'): AnalysisResult {
  const result: AnalysisResult = { schemaVersion: 1, documentId: input.id, revision: input.revision, provider: 'unknown', status: 'ready', completeness: 'complete', diagnostics: [] };
  const fail = (code: string, category: Diagnostic['category'], status: AnalysisResult['status'], sourceRef?: SourceRef): AnalysisResult => {
    result.status = status; result.completeness = 'partial';
    result.diagnostics.push({ code, severity: 'error', category, sourceRef }); return result;
  };
  if (!input.rawText.trim()) return fail('INPUT_EMPTY', 'syntax', 'invalid');
  if (new TextEncoder().encode(input.rawText).length > LIMITS.fileBytes) return fail('INPUT_LIMIT', 'limit', 'limited');
  const counter = new LineCounter();
  const span = (range?: readonly number[] | null): SourceRef => {
    const startOffset = range?.[0] ?? 0;
    const pos = counter.linePos(startOffset);
    return { documentId: input.id, revision: input.revision, startOffset, endOffset: range?.[1] ?? input.rawText.length, line: pos.line, column: pos.col };
  };
  try {
    // Parse raw text directly so CRLF/BOM/Unicode offsets match the editor exactly.
    const doc = parseDocument(input.rawText, { version: '1.2', lineCounter: counter, prettyErrors: false, uniqueKeys: true, merge: false, stringKeys: true });
    if (doc.errors.length) {
      for (const error of doc.errors) result.diagnostics.push({ code: error.code === 'DUPLICATE_KEY' ? 'YAML_DUPLICATE_KEY' : error.code === 'MULTIPLE_DOCS' ? 'YAML_MULTI_DOCUMENT' : 'YAML_SYNTAX', severity: 'error', category: 'syntax', params: { message: error.message }, sourceRef: span(error.pos) });
      result.status = 'invalid'; result.completeness = 'partial'; return result;
    }
    for (const warning of doc.warnings) result.diagnostics.push({ code: 'FEATURE_UNSUPPORTED', severity: 'warning', category: 'support', params: { field: warning.code }, sourceRef: span(warning.pos) });
    const queue: { node: unknown; depth: number }[] = [{ node: doc.contents, depth: 0 }];
    let count = 0;
    const mergeRefs: SourceRef[] = [];
    while (queue.length) {
      const { node, depth } = queue.pop()!;
      if (++count > LIMITS.astNodes || depth > LIMITS.depth) return fail('ANALYSIS_LIMIT', 'limit', 'limited');
      if (isMap(node)) for (const pair of node.items) {
        if (String(pair.key) === '<<') mergeRefs.push(span((pair.key as { range?: readonly number[] } | null)?.range));
        queue.push({ node: pair.key, depth: depth + 1 }, { node: pair.value, depth: depth + 1 });
      }
      else if (isSeq(node)) for (const child of node.items) queue.push({ node: child, depth: depth + 1 });
    }
    const source = (path: (string | number)[]): SourceRef => {
      let current: unknown = doc.contents;
      const aliases: SourceRef[] = [];
      for (const key of path) {
        let hops = 0;
        while (isAlias(current) && hops++ < LIMITS.depth) { aliases.push(span(current.range)); current = current.resolve(doc); }
        if (isMap(current) || isSeq(current)) current = current.get(key, true);
        else break;
      }
      if (isAlias(current)) {
        const aliasRef = span(current.range), definition = current.resolve(doc);
        return { ...aliasRef, relatedRefs: [span(definition?.range)] };
      }
      const ref = span((current as { range?: readonly number[] } | null)?.range);
      return aliases.length ? { ...ref, relatedRefs: aliases } : ref;
    };
    let raw: unknown;
    try { raw = doc.toJS({ maxAliasCount: 100 }); }
    catch { return fail('ANALYSIS_LIMIT', 'limit', 'limited'); }
    // Aliases may form cycles or amplify the tree. Bound the expanded data too,
    // before traversing matrices/config or sending it across a worker boundary.
    const active = new Set<object>();
    let values = 0;
    const bounded = (value: unknown, depth = 0): boolean => {
      if (++values > LIMITS.astNodes || depth > LIMITS.depth) return false;
      if (!value || typeof value !== 'object') return true;
      if (active.has(value)) return false;
      active.add(value);
      const valid = Object.values(value).every(child => bounded(child, depth + 1));
      active.delete(value); return valid;
    };
    if (!bounded(raw)) return fail('ANALYSIS_LIMIT', 'limit', 'limited');
    if (!isRecord(raw)) return fail('PROVIDER_UNSUPPORTED', 'support', 'unsupported', source([]));
    const azure = 'stages' in raw || ('trigger' in raw && ('jobs' in raw || 'steps' in raw));
    const gitlab = !('jobs' in raw) && ('stages' in raw || Object.values(raw).some(value => isRecord(value) && ('script' in value || 'stage' in value)));
    if (!(('on' in raw && 'jobs' in raw) || providerHint === 'github') || azure || gitlab) {
      result.provider = gitlab ? 'gitlab' : azure ? 'azure' : 'unknown';
      return fail('PROVIDER_UNSUPPORTED', 'support', 'unsupported', source([]));
    }
    result.provider = 'github';
    const diagnostics = result.diagnostics;
    mergeRefs.forEach(sourceRef => diagnostics.push({ code: 'FEATURE_UNSUPPORTED', severity: 'warning', category: 'support', sourceRef, params: { field: 'YAML merge (<<)' } }));
    const add = (code: string, severity: Diagnostic['severity'], category: Diagnostic['category'], path: (string | number)[], params?: Record<string, string>) => diagnostics.push({ code, severity, category, sourceRef: source(path), params });
    const unknownFields = (data: Record<string, unknown>, known: Set<string>, path: (string | number)[]) => {
      for (const key of Object.keys(data)) if (!known.has(key)) add('FEATURE_UNSUPPORTED', 'warning', 'support', [...path, key], { field: key });
    };
    unknownFields(raw, knownRoot, []);
    if (!isRecord(raw.jobs) || !Object.keys(raw.jobs).length) return fail('WORKFLOW_INVALID', 'semantic', 'invalid', source(['jobs']));
    const jobEntries = Object.entries(raw.jobs);
    if (jobEntries.length > LIMITS.jobs) return fail('ANALYSIS_LIMIT', 'limit', 'limited', source(['jobs']));
    const triggers: Trigger[] = [];
    if (typeof raw.on === 'string') triggers.push({ event: raw.on, config: null, sourceRef: source(['on']) });
    else if (Array.isArray(raw.on) && raw.on.every(v => typeof v === 'string')) raw.on.forEach((event, i) => triggers.push({ event, config: null, sourceRef: source(['on', i]) }));
    else if (isRecord(raw.on)) for (const [event, config] of Object.entries(raw.on)) triggers.push({ event, config, sourceRef: source(['on', event]) });
    else add('WORKFLOW_INVALID', 'error', 'semantic', ['on']);
    if (!triggers.length) add('WORKFLOW_INVALID', 'error', 'semantic', ['on']);
    if (triggers.length > 100) return fail('ANALYSIS_LIMIT', 'limit', 'limited', source(['on']));
    const jobs: Job[] = [];
    let stepCount = 0;
    for (const [key, jobValue] of jobEntries) {
      const path = ['jobs', key];
      if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key) || !isRecord(jobValue)) { add('JOB_INVALID', 'error', 'semantic', path, { job: key }); continue; }
      const data = jobValue;
      unknownFields(data, knownJob, path);
      const id = `${input.id}/job/${key}`;
      const needs = typeof data.needs === 'string' ? [data.needs] : Array.isArray(data.needs) && data.needs.every(v => typeof v === 'string') ? data.needs as string[] : [];
      if (data.needs !== undefined && !needs.length) add('JOB_NEEDS_INVALID', 'error', 'semantic', [...path, 'needs']);
      const reusable = typeof data.uses === 'string';
      if (data.uses !== undefined && !reusable) add('JOB_INVALID', 'error', 'semantic', [...path, 'uses']);
      if (reusable && data.steps !== undefined || reusable && data['runs-on'] !== undefined) add('JOB_INVALID', 'error', 'semantic', path);
      if (!reusable && (data['runs-on'] === undefined || !Array.isArray(data.steps) || !data.steps.length)) add('JOB_INVALID', 'error', 'semantic', path);
      const steps: Step[] = [];
      const seen = new Set<string>();
      if (!reusable && Array.isArray(data.steps)) {
        if ((stepCount += data.steps.length) > LIMITS.steps) return fail('ANALYSIS_LIMIT', 'limit', 'limited', source([...path, 'steps']));
        data.steps.forEach((value, i) => {
          const stepPath = [...path, 'steps', i];
          if (!isRecord(value)) { add('STEP_DEFINITION_INVALID', 'error', 'semantic', stepPath); return; }
          unknownFields(value, knownStep, stepPath);
          for (const field of ['env', 'with']) if (value[field] !== undefined && !isRecord(value[field])) add('STEP_DEFINITION_INVALID', 'error', 'semantic', [...stepPath, field]);
          const isRun = typeof value.run === 'string', isAction = typeof value.uses === 'string';
          if (isRun === isAction || ('run' in value && !isRun) || ('uses' in value && !isAction)) add('STEP_DEFINITION_INVALID', 'error', 'semantic', stepPath);
          const declaredId = typeof value.id === 'string' ? value.id : undefined;
          if (value.id !== undefined && (!declaredId || !/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(declaredId))) add('STEP_DEFINITION_INVALID', 'error', 'semantic', [...stepPath, 'id']);
          const duplicate = !!declaredId && seen.has(declaredId);
          if (duplicate) add('STEP_ID_DUPLICATE', 'error', 'semantic', [...stepPath, 'id']);
          if (declaredId) seen.add(declaredId);
          const label = typeof value.name === 'string' ? value.name : isAction ? value.uses as string : isRun ? (value.run as string).trim().split('\n')[0].slice(0, 80) : `Step ${i + 1}`;
          steps.push({ id: `${id}/step/${declaredId && !duplicate ? declaredId : '#' + i}`, declaredId, name: label, order: i + 1, kind: isRun && !isAction ? 'run' : isAction && !isRun ? 'action' : 'unknown', sourceRef: source(stepPath), actionRef: isAction ? value.uses as string : undefined, script: isRun ? value.run as string : undefined, condition: value.if, with: asRecord(value.with), env: asRecord(value.env), settings: pick(value, ['shell', 'working-directory', 'timeout-minutes', 'continue-on-error']), raw: value });
        });
      }
      const strategy = asRecord(data.strategy);
      const matrix = strategy.matrix !== undefined ? expandMatrix(strategy.matrix) : undefined;
      if (matrix && matrix.kind !== 'static') add(matrix.kind === 'dynamic' ? 'MATRIX_DYNAMIC' : matrix.kind === 'limited' ? 'MATRIX_LIMIT' : 'MATRIX_INVALID', matrix.kind === 'invalid' ? 'error' : 'info', matrix.kind === 'invalid' ? 'semantic' : matrix.kind === 'limited' ? 'limit' : 'unresolved', [...path, 'strategy', 'matrix']);
      if (reusable) add('REFERENCE_UNRESOLVED', 'info', 'unresolved', [...path, 'uses'], { target: data.uses as string });
      jobs.push({ id, key, name: typeof data.name === 'string' ? data.name : key, sourceRef: source(path), kind: reusable ? 'reusable' : 'job', runner: data['runs-on'], needs: [...new Set(needs)], condition: data.if, steps, matrix, reusableCall: reusable ? data.uses as string : undefined, settings: pick(data, ['env', 'defaults', 'permissions', 'concurrency', 'environment', 'container', 'services', 'timeout-minutes', 'continue-on-error', 'outputs', 'strategy', 'with', 'secrets']), raw: data });
    }
    const byKey = new Map(jobs.map(job => [job.key, job]));
    for (const job of jobs) for (const need of job.needs) if (!byKey.has(need)) add('JOB_NEEDS_MISSING', 'error', 'semantic', ['jobs', job.key, 'needs'], { job: need });
    // Iterative topological check, bounded by the job budget. Missing edges are not fabricated.
    const pending = new Map(jobs.map(job => [job.key, job.needs.filter(key => byKey.has(key)).length]));
    const ready = jobs.filter(job => pending.get(job.key) === 0).map(job => job.key);
    let visited = 0;
    while (ready.length) {
      const key = ready.pop()!; visited++;
      for (const job of jobs) if (job.needs.includes(key)) { const left = pending.get(job.key)! - 1; pending.set(job.key, left); if (!left) ready.push(job.key); }
    }
    if (visited !== jobs.length) for (const job of jobs.filter(j => pending.get(j.key)! > 0)) add('JOB_DEPENDENCY_CYCLE', 'error', 'semantic', ['jobs', job.key, 'needs']);
    result.model = { id: input.id + '/workflow', name: typeof raw.name === 'string' ? raw.name : input.filename, sourceRef: source([]), triggers, jobs, settings: pick(raw, ['run-name', 'env', 'defaults', 'permissions', 'concurrency']), rawExtensions: Object.fromEntries(Object.entries(raw).filter(([k]) => !knownRoot.has(k))) };
    if (diagnostics.some(d => d.severity === 'error')) result.status = 'invalid';
    if (diagnostics.some(d => d.category === 'support' || d.category === 'limit') || result.status !== 'ready') result.completeness = 'partial';
    return result;
  } catch {
    return fail('YAML_SYNTAX', 'syntax', 'invalid');
  }
}
