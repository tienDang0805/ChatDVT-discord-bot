import { useState } from 'react';
import { ArrowUpRight, Braces, FileCode, Terminal, X } from 'lucide-react';
import { asRecord, displayValue } from '../core/types';
import type { Job, SourceRef, Step, Workflow } from '../core/types';
import { inheritedSettings, maskedConfig, scriptAnnotations, stepSummary } from '../core/explain';

const pretty = (value: unknown) => JSON.stringify(maskedConfig(value), null, 2);
export function InspectorPanel({ model, sourceText, selectedId, en, stale, onSource, onClose }: { model: Workflow; sourceText: string; selectedId: string; en: boolean; stale: boolean; onSource: (ref: SourceRef) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'details' | 'source' | 'config'>('details');
  const job = model.jobs.find(j => j.id === selectedId || j.steps.some(s => s.id === selectedId));
  const step = job?.steps.find(s => s.id === selectedId);
  const triggerIndex = Number(selectedId.split('/trigger/')[1]);
  const trigger = Number.isInteger(triggerIndex) ? model.triggers[triggerIndex] : undefined;
  const ref = step?.sourceRef ?? job?.sourceRef ?? trigger?.sourceRef ?? model.sourceRef;
  const title = step?.name ?? job?.name ?? trigger?.event ?? model.name;
  const inherited = job ? inheritedSettings(model, job, step) : undefined;
  const config = step?.raw ?? job?.raw ?? trigger?.config ?? model.settings;
  const script = step?.script ?? (typeof step?.with.script === 'string' ? step.with.script : undefined);
  const inputs = Object.fromEntries(Object.entries(step?.with ?? {}).filter(([key]) => key !== 'script'));
  return <section className="cicd-inspector" aria-label={en ? 'Selection details' : 'Chi tiết đang chọn'}>
    <header><div><p className="cicd-kicker">{step ? `STEP ${step.order} · ${step.kind}` : job ? 'JOB' : 'TRIGGER'}</p><h2>{title}</h2></div><div><button className="cicd-button" disabled={stale} onClick={() => onSource(ref)}><FileCode size={15} />{en ? 'View YAML' : 'Xem YAML'}<ArrowUpRight size={14} /></button><button className="cicd-icon-button" onClick={onClose} aria-label={en ? 'Close details' : 'Đóng chi tiết'}><X size={18} /></button></div></header>
    <div className="cicd-detail-tabs" role="tablist" aria-label={en ? 'Detail views' : 'Nội dung chi tiết'}>{([['details', en ? 'Details' : 'Chi tiết'], ['source', 'YAML'], ['config', en ? 'Configuration' : 'Cấu hình']] as const).map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)} onKeyDown={event => {
      const keys = ['details', 'source', 'config'] as const, index = keys.indexOf(key);
      const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : undefined;
      if (next === undefined) return; event.preventDefault(); setTab(keys[next]);
      (event.currentTarget.parentElement?.querySelectorAll('button')[next] as HTMLButtonElement | undefined)?.focus();
    }}>{label}</button>)}</div>
    {tab === 'source' ? <div className="cicd-source-excerpt"><p>{en ? 'Original source' : 'Nguồn gốc'} · {en ? 'line' : 'dòng'} {ref.line}:{ref.column}{stale && ' · ' + (en ? 'Previous revision' : 'Bản trước')}</p><pre><code>{sourceText.slice(ref.startOffset, ref.endOffset)}</code></pre>{ref.relatedRefs?.map((related, i) => <button key={i} className="cicd-link-button" disabled={stale} onClick={() => onSource(related)}>{en ? 'Related source at line' : 'Nguồn liên quan tại dòng'} {related.line} ↗</button>)}</div>
      : tab === 'config' ? <div className="cicd-source-excerpt"><p>{en ? 'Declared configuration · sensitive literal fields are masked.' : 'Cấu hình khai báo · các field nhạy cảm dạng literal được che.'}</p><pre><code>{pretty(config)}</code></pre></div>
      : <div className="cicd-detail-body">
        <div className="cicd-detail-summary"><Braces size={22} /><div><p>{step ? stepSummary(step, en) : job ? (en ? 'Job configuration and prerequisites from this workflow.' : 'Cấu hình và điều kiện phụ thuộc của job trong workflow.') : (en ? 'An alternative event that can trigger this workflow.' : 'Một sự kiện có thể kích hoạt workflow này.')}</p><code>{step?.actionRef ?? job?.reusableCall ?? (job ? displayValue(job.runner) : trigger?.event)}</code></div></div>
        {job && <div className="cicd-facts"><Fact label="Job" value={job.key} /><Fact label={en ? 'Runner / reference' : 'Runner / tham chiếu'} value={job.reusableCall ?? job.runner} /><Fact label="needs" value={job.needs.length ? job.needs : '—'} /><Fact label="if" value={step?.condition ?? job.condition} /></div>}
        {trigger && <pre className="cicd-config-block"><code>{pretty(trigger.config)}</code></pre>}
        {Object.keys(inputs).length > 0 && <section><h3>Action inputs · with</h3><pre className="cicd-config-block"><code>{pretty(inputs)}</code></pre></section>}
        {!!job?.matrix && <section><h3>Matrix · {job.matrix.kind === 'static' ? `${job.matrix.count} ${en ? 'variants' : 'biến thể'}` : en ? 'Unresolved / limited' : 'Chưa xác định / giới hạn'}</h3><p>{en ? 'Bounded preview of static combinations; this does not execute the variants.' : 'Preview có giới hạn của các tổ hợp tĩnh; không chạy các biến thể này.'}</p><pre className="cicd-config-block"><code>{pretty(job.matrix.preview.length ? job.matrix.preview : job.matrix.raw)}</code></pre></section>}
        {inherited && (inherited.env.length > 0 || Object.keys(inherited.defaults).length > 0) && <section><h3>{en ? 'Inherited configuration' : 'Cấu hình kế thừa'}</h3>{inherited.env.length > 0 && <div className="cicd-env-list">{inherited.env.map(binding => <div key={binding.key}><code>{binding.key}</code><span>{displayValue(maskedConfig(binding.value, binding.key))}</span><small>{binding.origin}</small></div>)}</div>}{Object.keys(inherited.defaults).length > 0 && <pre className="cicd-config-block"><code>{pretty(inherited.defaults)}</code></pre>}</section>}
        {script && <details><summary><Terminal size={16} />{step?.kind === 'action' ? 'with.script' : 'run'} · {en ? 'Read the script' : 'Đọc script'}</summary><pre className="cicd-config-block"><code>{script}</code></pre></details>}
        <details><summary>{en ? 'All declared fields' : 'Tất cả field đã khai báo'}</summary><pre className="cicd-config-block"><code>{pretty(config)}</code></pre></details>
      </div>}
  </section>;
}
function Fact({ label, value }: { label: string; value: unknown }) { return <div><dt>{label}</dt><dd>{displayValue(maskedConfig(value, label))}</dd></div>; }

/** Reference-inspired contextual lane. These annotations are never execution nodes. */
export function ScriptLane({ step, job, en }: { step: Step; job: Job; en: boolean }) {
  const script = typeof step.with.script === 'string' ? step.with.script : undefined;
  if (!script) return null;
  const notes = scriptAnnotations(script, en);
  if (!notes.length) return null;
  const target = asRecord(step.with);
  return <section className="cicd-script-lane"><header><div><p className="cicd-kicker">{en ? 'READING THE SCRIPT' : 'ĐỌC SCRIPT TRONG ACTION'}</p><h2>{step.name}</h2><p>{en ? 'Grouped from declared command lines. These are annotations inside this step, not additional jobs or a run result.' : 'Nhóm từ các dòng lệnh khai báo. Đây là phần giải thích trong step, không phải job mới hay kết quả chạy.'}</p></div><code>{displayValue(maskedConfig(target.host ?? job.runner, 'host'))}</code></header><div className="cicd-script-stages">{notes.map((note, i) => <article key={note.label}><span>{i + 1}</span><h3>{note.label}</h3><pre><code>{note.lines.join('\n')}</code></pre></article>)}</div></section>;
}
