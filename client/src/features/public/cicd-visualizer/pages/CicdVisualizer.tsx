import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileCode, FolderOpen, GitBranch, Loader2, Plus, Upload, Workflow as WorkflowIcon, X } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';
import { SiteLayout } from '../../../../site/components/SiteLayout';
import { useLanguage } from '../../../../shared/i18n/LanguageContext';
import { diagnosticText } from '../core/diagnostics';
import { LIMITS } from '../core/types';
import type { GraphMode, SourceDocument, SourceRef } from '../core/types';
import { samples } from '../data/samples';
import { useWorkflowAnalysis } from '../hooks/useWorkflowAnalysis';
import { YamlEditor } from '../components/YamlEditor';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { InspectorPanel, ScriptLane } from '../components/InspectorPanel';
import { downloadFile, graphImage, summaryExport } from '../utils/exportWorkflow';
import '../styles.css';

const initial: SourceDocument = { id: 'paste', filename: 'pasted-workflow.yml', rawText: '', revision: 0 };
const bytes = (text: string) => new TextEncoder().encode(text).length;
export function CicdVisualizer() {
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  const [documents, setDocuments] = useState<SourceDocument[]>([initial]);
  const [activeId, setActiveId] = useState(initial.id);
  const document = documents.find(d => d.id === activeId) ?? documents[0];
  const [mode, setMode] = useState<GraphMode>('detailed');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [editorOpen, setEditorOpen] = useState(true), [outlineOpen, setOutlineOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 760);
  const [auto, setAuto] = useState(false), [sampleId, setSampleId] = useState(samples[0].id);
  const [source, setSource] = useState<SourceRef>();
  const [importError, setImportError] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const [intent, setIntent] = useState<{ id: string; revision: number; token: number }>();
  const [exporting, setExporting] = useState(false);
  const [exportData, setExportData] = useState<{ kind: 'png' | 'json'; content: string }>();
  const fileInput = useRef<HTMLInputElement>(null), diagram = useRef<HTMLDivElement>(null), exportDialog = useRef<HTMLDialogElement>(null);
  const engine = useWorkflowAnalysis(document, mode, expanded);
  const model = engine.shown?.result.model;
  const lastRevision = engine.latest?.document.revision;
  const diagnostics = engine.latest?.result.diagnostics ?? [];
  const [operationError, setOperationError] = useState<string>();
  const selectedJob = model?.jobs.find(j => j.id === selectedId || j.steps.some(s => s.id === selectedId));
  const selectedStep = selectedJob?.steps.find(s => s.id === selectedId);
  const exportKey = `${document.id}:${document.revision}:${mode}:${expanded.join(',')}`;
  const currentExportKey = useRef(exportKey); currentExportKey.current = exportKey;
  const canExport = !!model && !!engine.graph && !engine.stale && engine.latest?.result.status === 'ready' && !engine.analyzing && !engine.layingOut;
  const closeEditorAfterAnalysis = useRef(true);
  const requestAnalysis = useCallback((snapshot: SourceDocument, closeEditor = true) => { closeEditorAfterAnalysis.current = closeEditor; setIntent({ id: snapshot.id, revision: snapshot.revision, token: Date.now() + Math.random() }); }, []);
  useEffect(() => {
    if (intent?.id === document.id && intent.revision === document.revision) void engine.analyze(document);
    // document changes invalidate the intent instead of re-running a previous request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, engine.analyze]);
  useEffect(() => {
    if (!auto || !document.rawText.trim()) return;
    const timer = setTimeout(() => requestAnalysis(document, false), 400);
    return () => clearTimeout(timer);
  }, [auto, document, requestAnalysis]);
  useEffect(() => {
    if (!model) return;
    setExpanded(model.jobs.map(j => j.id));
    if (model.jobs.length > 3) setMode('overview');
    const script = model.jobs.flatMap(j => j.steps).find(s => typeof s.with.script === 'string');
    setSelectedId(script?.id ?? model.jobs[0]?.steps[0]?.id ?? model.jobs[0]?.id);
  }, [model]);
  useEffect(() => {
    if (!engine.latest || lastRevision !== document.revision) return;
    if (engine.latest.result.status === 'ready') { if (closeEditorAfterAnalysis.current) setEditorOpen(false); }
    else setEditorOpen(true);
  }, [engine.latest, lastRevision, document.revision]);
  useEffect(() => { if (auto) setEditorOpen(true); }, [auto]);
  useEffect(() => { if (exportData) exportDialog.current?.showModal(); }, [exportData]);
  const edit = useCallback((rawText: string) => {
    setDocuments(previous => previous.map(d => d.id === activeId ? { ...d, rawText, revision: d.revision + 1 } : d)); setSource(undefined); setOperationError(undefined);
  }, [activeId]);
  const select = useCallback((id: string) => { setSelectedId(id); }, []);
  const toggleJob = useCallback((id: string) => setExpanded(previous => previous.includes(id) ? previous.filter(key => key !== id) : [...previous, id]), []);
  const jumpSource = (ref: SourceRef) => { if (ref.documentId !== document.id || ref.revision !== document.revision) return; setSource({ ...ref }); setEditorOpen(true); };
  const cursor = (offset: number) => {
    if (!model || engine.stale) return;
    const candidates = model.jobs.flatMap(job => [{ id: job.id, sourceRef: job.sourceRef }, ...job.steps]);
    const match = candidates.filter(item => item.sourceRef.startOffset <= offset && item.sourceRef.endOffset > offset).sort((a, b) => (a.sourceRef.endOffset - a.sourceRef.startOffset) - (b.sourceRef.endOffset - b.sourceRef.startOffset))[0];
    if (match) setSelectedId(match.id);
  };
  const addDocument = (next: SourceDocument) => {
    const retained = documents.filter(d => d.id !== next.id && !(d.id === initial.id && !d.rawText.trim()));
    if (retained.length >= LIMITS.files || retained.reduce((sum, d) => sum + bytes(d.rawText), bytes(next.rawText)) > LIMITS.workspaceBytes) { setImportError(en ? 'Workspace limit: 10 files / 5 MiB.' : 'Giới hạn workspace: 10 file / 5 MiB.'); return; }
    setDocuments([...retained, next]); setActiveId(next.id); setImportError(undefined); setSource(undefined);
    requestAnalysis(next);
  };
  const useSample = () => { const sample = samples.find(s => s.id === sampleId)!; const previous = documents.find(d => d.id === 'sample/' + sample.id); addDocument({ id: 'sample/' + sample.id, filename: sample.filename, rawText: sample.text, revision: (previous?.revision ?? -1) + 1 }); };
  const importFiles = async (files: FileList | File[]) => {
    setImportError(undefined);
    const list = Array.from(files);
    const retained = documents.filter(d => !(d.id === initial.id && !d.rawText.trim()));
    if (list.length + retained.length > LIMITS.files || list.reduce((sum, f) => sum + f.size, retained.reduce((sum, d) => sum + bytes(d.rawText), 0)) > LIMITS.workspaceBytes) { setImportError(en ? 'Workspace limit: 10 files / 5 MiB.' : 'Giới hạn workspace: 10 file / 5 MiB.'); return; }
    try {
      const imported: SourceDocument[] = [];
      for (const file of list) {
        if (!/\.ya?ml$/i.test(file.name)) throw new Error(en ? 'Choose .yml or .yaml files.' : 'Chọn file .yml hoặc .yaml.');
        if (file.size > LIMITS.fileBytes) throw new Error(diagnosticText({ code: 'INPUT_LIMIT' }, en));
        const rawText = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
        imported.push({ id: crypto.randomUUID(), filename: file.name, rawText, revision: 0 });
      }
      if (!imported.length) return;
      setDocuments([...retained, ...imported]); setActiveId(imported[0].id); setSource(undefined); requestAnalysis(imported[0]);
    } catch (e) { setImportError((e as Error).message || (en ? 'Could not read UTF-8 YAML.' : 'Chưa đọc được YAML UTF-8.')); }
  };
  const newDocument = () => {
    if (documents.length >= LIMITS.files) return setImportError(en ? 'At most 10 files.' : 'Tối đa 10 file.');
    const next = { id: crypto.randomUUID(), filename: `workflow-${documents.length + 1}.yml`, rawText: '', revision: 0 };
    setDocuments([...documents, next]); setActiveId(next.id); setEditorOpen(true); setSource(undefined);
  };
  const prepareExport = async (kind: 'png' | 'json') => {
    if (!canExport || !model || !engine.graph || !engine.shown) return;
    setOperationError(undefined); setExporting(true);
    const key = exportKey;
    try {
      const content = kind === 'json' ? JSON.stringify(summaryExport(model, engine.shown.result, engine.graph), null, 2) : await graphImage(diagram.current!, getComputedStyle(diagram.current!).getPropertyValue('--site-bg').trim() || '#141b2a');
      if (currentExportKey.current === key) setExportData({ kind, content });
      else setOperationError(en ? 'The workflow changed. Export again.' : 'Workflow đã thay đổi. Hãy xuất lại.');
    } catch { setOperationError(diagnosticText({ code: 'EXPORT_FAILED' }, en)); }
    finally { setExporting(false); }
  };

  return <SiteLayout hideFooterContact><div className="cicd-page"><PageShell title="CI/CD Visualizer" backTo={pathFor('/playground')} backLabel="Playground" maxWidth="6xl">
    <div className="cicd-intro"><div><p className="cicd-kicker">PLAYGROUND / DEVELOPER TOOLS</p><p className="cicd-lede">{en ? 'Turn a YAML file into a workflow you can explore.' : 'Biến file YAML thành workflow có thể khám phá từng bước.'}</p></div><span className="cicd-local-note"><span />{en ? 'Processed in your browser' : 'Xử lý ngay trong trình duyệt'}</span></div>
    <input ref={fileInput} type="file" multiple accept=".yml,.yaml" className="cicd-visually-hidden" tabIndex={-1} onChange={event => { if (event.target.files) void importFiles(event.target.files); event.target.value = ''; }} />
    <div className="cicd-toolbar"><div className="cicd-toolbar-group"><button className="cicd-button" onClick={() => fileInput.current?.click()}><Upload size={16} />{en ? 'Import YAML' : 'Import YAML'}</button><button className="cicd-icon-button" onClick={newDocument} aria-label={en ? 'New YAML' : 'Tạo YAML mới'}><Plus size={18} /></button><select aria-label={en ? 'Workflow samples' : 'Workflow mẫu'} value={sampleId} onChange={e => setSampleId(e.target.value)}>{samples.map(s => <option key={s.id} value={s.id}>{s.name[en ? 1 : 0]}</option>)}</select><button className="cicd-button" onClick={useSample}>{en ? 'Use example' : 'Dùng ví dụ'}</button></div><div className="cicd-toolbar-group"><button className="cicd-button is-primary" onClick={() => requestAnalysis(document)} disabled={engine.analyzing || !document.rawText.trim()}>{engine.analyzing ? <Loader2 size={16} className="cicd-spin" /> : <WorkflowIcon size={16} />}Visualize ↗</button><button className="cicd-button" disabled={!canExport || exporting || outlineOpen} title={outlineOpen ? (en ? 'Open the diagram to export PNG' : 'Mở sơ đồ để xuất PNG') : undefined} onClick={() => void prepareExport('png')}><Download size={16} />PNG</button><button className="cicd-button" disabled={!canExport || exporting} onClick={() => void prepareExport('json')}>JSON</button></div></div>
    <div className="cicd-document-bar"><label><FolderOpen size={16} /><select aria-label={en ? 'Current workflow file' : 'File workflow đang mở'} value={document.id} onChange={e => { const next = documents.find(d => d.id === e.target.value)!; setActiveId(next.id); setSource(undefined); if (next.rawText.trim()) requestAnalysis(next); else setEditorOpen(true); }}>{documents.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}</select></label><div><button className="cicd-link-button" aria-pressed={editorOpen} onClick={() => setEditorOpen(v => !v)}><FileCode size={15} />{editorOpen ? (en ? 'Hide YAML' : 'Ẩn YAML') : (en ? 'Open YAML' : 'Mở YAML')}</button><label className="cicd-auto"><input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} />{en ? 'Auto update' : 'Tự cập nhật'}</label></div></div>
    {importError && <p className="cicd-alert" role="alert">{importError}</p>}
    {(operationError || engine.error) && <p className="cicd-alert" role="alert">{operationError ?? diagnosticText({ code: engine.error! }, en)}</p>}
    {diagnostics.length > 0 && <section className="cicd-diagnostics" aria-label={en ? 'Analysis diagnostics' : 'Thông báo phân tích'}><div><strong>{engine.latest?.result.status === 'invalid' ? (en ? 'Fix the configuration' : 'Cấu hình cần sửa') : en ? 'Analysis notes' : 'Ghi chú phân tích'}</strong><span>{diagnostics.length}</span></div><ul>{diagnostics.map((d, i) => <li key={i} data-severity={d.severity}><button onClick={() => d.sourceRef && jumpSource(d.sourceRef)} disabled={!d.sourceRef || d.sourceRef.revision !== document.revision}><span>{d.severity === 'error' ? '!' : '·'}</span>{diagnosticText(d, en)}{d.sourceRef && <small>{en ? 'line' : 'dòng'} {d.sourceRef.line}:{d.sourceRef.column}</small>}</button></li>)}</ul></section>}
    {engine.stale && <p className="cicd-stale" role="status">{en ? 'Showing results from previous YAML. Visualize the updated source to refresh.' : 'Đang hiển thị kết quả của YAML trước. Bấm Visualize để phân tích nội dung mới.'}</p>}
    <div className={`cicd-workspace ${editorOpen ? 'with-editor' : ''}`} onDragOver={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); setDragging(true); } }} onDragLeave={() => setDragging(false)} onDrop={event => { if (event.dataTransfer.files.length) { event.preventDefault(); setDragging(false); void importFiles(event.dataTransfer.files); } }}>
      {editorOpen && <section className="cicd-editor-panel"><header><strong>{document.filename}</strong><span>YAML</span></header><YamlEditor document={document} en={en} diagnostics={diagnostics} source={source} onChange={edit} onCursor={cursor} /><footer>{en ? 'Paste or edit a GitHub Actions workflow here.' : 'Paste hoặc sửa workflow GitHub Actions tại đây.'}</footer></section>}
      <section ref={diagram} className="cicd-graph-panel"><header><div><GitBranch size={20} /><div><p className="cicd-kicker">GITHUB ACTIONS</p><h2>{model?.name ?? (en ? 'Your workflow starts here' : 'Workflow bắt đầu từ đây')}</h2></div></div>{model && <div className="cicd-metrics"><span><b>{model.jobs.length}</b> jobs</span><span><b>{model.jobs.reduce((n, j) => n + j.steps.length, 0)}</b> steps</span></div>}</header>
        {model && <div className="cicd-viewbar"><div role="group" aria-label={en ? 'Diagram mode' : 'Chế độ sơ đồ'}><button aria-pressed={mode === 'detailed'} onClick={() => setMode('detailed')}>{en ? 'Detailed' : 'Chi tiết'}</button><button aria-pressed={mode === 'overview'} onClick={() => setMode('overview')}>{en ? 'Overview' : 'Tổng quan'}</button></div><button className="cicd-link-button" aria-pressed={outlineOpen} onClick={() => setOutlineOpen(v => !v)}>{en ? 'Read as a list' : 'Đọc dạng danh sách'}</button>{mode === 'detailed' && <button className="cicd-link-button" onClick={() => setExpanded(expanded.length ? [] : model.jobs.map(j => j.id))}>{expanded.length ? (en ? 'Collapse jobs' : 'Thu gọn jobs') : (en ? 'Expand jobs' : 'Mở jobs')}</button>}</div>}
        {engine.analyzing || engine.layingOut ? <div className="cicd-loading" role="status"><Loader2 className="cicd-spin" size={27} /><p>{engine.analyzing ? (en ? 'Reading the workflow…' : 'Đang đọc workflow…') : (en ? 'Arranging the diagram…' : 'Đang bố trí sơ đồ…')}</p></div>
          : model && engine.graph ? <><div className={outlineOpen ? 'cicd-canvas-hidden' : ''}><WorkflowCanvas graph={engine.graph} model={model} en={en} selectedId={selectedId} onSelect={select} expanded={expanded} onToggleJob={toggleJob} overview={mode === 'overview'} /></div><div className={`cicd-outline ${outlineOpen ? 'is-open' : ''}`}><ol>{model.jobs.map(job => <li key={job.id}><button aria-pressed={selectedId === job.id} onClick={() => select(job.id)}><b>{job.name}</b><span>{job.kind === 'reusable' ? job.reusableCall : String(job.runner)}</span></button><ol>{job.steps.map(step => <li key={step.id}><button aria-pressed={selectedId === step.id} onClick={() => select(step.id)}><span className="cicd-node-number">{step.order}</span><span>{step.name}</span><code>{step.kind}</code></button></li>)}</ol></li>)}</ol></div></>
          : <div className={`cicd-empty ${dragging ? 'is-dragging' : ''}`}><div className="cicd-empty-symbol"><WorkflowIcon size={43} strokeWidth={1.2} /></div><h3>{en ? 'From YAML to a clear picture.' : 'Từ YAML đến một sơ đồ rõ ràng.'}</h3><p>{en ? 'Drop a .yml / .yaml file, paste into the editor, or open an example. No account or API key needed.' : 'Thả file .yml / .yaml, paste vào editor hoặc mở ví dụ. Không cần tài khoản hay API key.'}</p><button className="cicd-button is-primary" onClick={() => fileInput.current?.click()}><Upload size={16} />{en ? 'Choose a workflow' : 'Chọn workflow'}</button><button className="cicd-link-button" onClick={useSample}>{en ? 'Explore the example' : 'Xem workflow mẫu'} ↗</button></div>}
        <footer><span>{en ? 'Arrows show declared order and dependencies.' : 'Mũi tên chỉ thứ tự khai báo và quan hệ phụ thuộc.'}</span><span>{en ? 'Static view · no run status' : 'Cấu hình tĩnh · không phải trạng thái chạy'}</span></footer>
      </section>
    </div>
    {engine.graph?.truncated && <p className="cicd-stale">{en ? 'The diagram reached its 500-node display budget. Collapse jobs or use the outline to read the full model.' : 'Sơ đồ chạm giới hạn 500 node. Thu gọn jobs hoặc đọc đầy đủ bằng danh sách.'}</p>}
    {selectedStep && selectedJob && <ScriptLane step={selectedStep} job={selectedJob} en={en} />}
    {model && selectedId && engine.shown && <InspectorPanel model={model} sourceText={engine.shown.document.rawText} selectedId={selectedId} en={en} stale={engine.stale} onSource={jumpSource} onClose={() => setSelectedId(undefined)} />}
    <p className="cicd-footnote">{en ? 'Your YAML stays in this tab. External actions and referenced workflows are shown as references; their internals are not executed or fetched.' : 'YAML ở trong tab này. Action bên ngoài và workflow được gọi hiển thị dưới dạng tham chiếu; không chạy hay tự tải nội dung bên trong.'}</p>
    <dialog ref={exportDialog} className="cicd-export-dialog" onClose={() => setExportData(undefined)} onClick={event => { if (event.target === event.currentTarget) exportDialog.current?.close(); }}><header><h2>{en ? 'Export preview' : 'Xem trước bản xuất'}</h2><button className="cicd-icon-button" onClick={() => exportDialog.current?.close()} aria-label={en ? 'Close export' : 'Đóng bản xuất'}><X size={19} /></button></header><p>{en ? 'Current graph projection. JSON summaries exclude raw YAML, scripts and environment values. Node labels may contain your own text.' : 'Sơ đồ theo phạm vi đang xem. JSON summary không kèm YAML gốc, script hay giá trị env. Nhãn node vẫn có thể chứa nội dung bạn đặt.'}</p>{exportData?.kind === 'png' ? <img src={exportData.content} alt={en ? 'Workflow image export preview' : 'Xem trước ảnh workflow'} /> : <pre><code>{exportData?.content}</code></pre>}<button className="cicd-button is-primary" onClick={() => { if (exportData) downloadFile(exportData.kind === 'png' ? exportData.content : new Blob([exportData.content], { type: 'application/json' }), 'workflow.' + exportData.kind); }}><Download size={16} />{en ? 'Download' : 'Tải xuống'}</button></dialog>
  </PageShell></div></SiteLayout>;
}

export default CicdVisualizer;
