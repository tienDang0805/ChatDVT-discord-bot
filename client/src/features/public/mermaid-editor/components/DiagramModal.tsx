import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Code2, ZoomIn, ZoomOut, Maximize2, Save, Paintbrush, Type, Square, CircleDot, Trash2, Plus, Link2, Layers, HelpCircle, PanelLeftClose, PanelLeft } from 'lucide-react';
import mermaid from 'mermaid';
import { parseNodeStyles, extractNodeIds, getNodeLabel, applyNodeStyle, removeNodeStyle, updateNodeLabel, PRESET_COLORS, type NodeStyle } from '../utils/styleUtils';
import { SHAPES, parseNodes, generateNodeId, insertConnection, changeNodeShape, getChartType, getComponents, insertSnippet, type ShapeType, type DiagramComponent } from '../utils/diagramBuilder';

interface DiagramModalProps { code: string; index: number; theme: string; onSave: (c: string) => void; onClose: () => void; }
interface SelectedNode { nodeId: string; label: string; style: NodeStyle; shape: ShapeType; }
interface SelectedLine { lineIndex: number; original: string; text: string; }

const CHART_LABELS: Record<string, string> = { flowchart: '🔀 Flowchart', sequence: '📨 Sequence', state: '🔄 State', er: '📋 ER Diagram', class: '📦 Class', gantt: '📊 Gantt', pie: '🥧 Pie', mindmap: '🧠 Mindmap', git: '🌿 Git Graph', unknown: '📄 Diagram' };

export const DiagramModal = ({ code, index, theme, onSave, onClose }: DiagramModalProps) => {
  const [editCode, setEditCode] = useState(code);
  const [zoom, setZoom] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [selectedLine, setSelectedLine] = useState<SelectedLine | null>(null);
  const [editLineValue, setEditLineValue] = useState('');
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeComponent, setActiveComponent] = useState<DiagramComponent | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  const chartType = getChartType(editCode);
  const components = getComponents(chartType);
  const isFlowchart = chartType === 'flowchart';
  const allNodes = isFlowchart ? parseNodes(editCode) : [];

  const autoFit = useCallback(() => {
    if (!previewRef.current || !containerRef.current) return;
    const svg = previewRef.current.querySelector('svg');
    if (!svg) return;
    const vb = svg.getAttribute('viewBox')?.split(' ').map(Number);
    const sw = vb ? vb[2] : parseFloat(svg.getAttribute('width') || '0') || svg.getBoundingClientRect().width / (zoom / 100);
    const sh = vb ? vb[3] : parseFloat(svg.getAttribute('height') || '0') || svg.getBoundingClientRect().height / (zoom / 100);
    const cr = containerRef.current.getBoundingClientRect();
    if (sw <= 0 || sh <= 0) return;
    const fw = (cr.width - 48) / sw * 100;
    const fh = (cr.height - 48) / sh * 100;
    setZoom(Math.max(75, Math.min(Math.round(sw / sh > 2 ? fw : Math.min(fw, fh)), 500)));
  }, [zoom]);

  const renderDiagram = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      renderCountRef.current++;
      const id = `md-${renderCountRef.current}-${Date.now()}`;
      mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', securityLevel: 'loose', fontFamily: 'system-ui, sans-serif' });
      const { svg } = await mermaid.render(id, editCode);
      previewRef.current.innerHTML = svg;
      const svgEl = previewRef.current.querySelector('svg');
      if (svgEl) { svgEl.style.maxWidth = 'none'; svgEl.style.height = 'auto'; svgEl.removeAttribute('height'); }
      requestAnimationFrame(() => attachInteractions());
      if (renderCountRef.current <= 2) requestAnimationFrame(autoFit);
    } catch (err: any) {
      if (previewRef.current) previewRef.current.innerHTML = `<div class="text-red-500 text-sm p-4 font-mono">⚠️ ${err?.message || 'Syntax error'}</div>`;
    }
  }, [editCode, theme, autoFit]);

  const findCodeLine = useCallback((text: string): SelectedLine | null => {
    const lines = editCode.split('\n');
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(clean) || line.replace(/["'`]/g, '').includes(clean)) {
        return { lineIndex: i, original: line, text: clean };
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const normLine = lines[i].replace(/\s+/g, ' ').trim().toLowerCase();
      if (normLine.includes(clean.toLowerCase()) || clean.toLowerCase().includes(normLine.replace(/["'`]/g, ''))) {
        return { lineIndex: i, original: lines[i], text: clean };
      }
    }
    return null;
  }, [editCode]);

  const attachInteractions = useCallback(() => {
    if (!previewRef.current) return;
    const svgEl = previewRef.current.querySelector('svg');
    if (!svgEl) return;

    const selectors = isFlowchart
      ? '.node, .cluster'
      : '.actor, .messageText, .noteText, .labelText, .statediagram-state, .state-note, .er.entityBox, .er.entityLabel, .classGroup, .task, .slice, .mindmap-node, .label, [class*="label"], text, .edgeLabel';

    const nodeIds = isFlowchart ? extractNodeIds(editCode) : [];
    const styleMap = isFlowchart ? parseNodeStyles(editCode) : new Map();
    const parsedNodes = isFlowchart ? parseNodes(editCode) : [];

    svgEl.querySelectorAll(selectors).forEach(node => {
      const el = node as SVGElement;
      if (el.closest('[data-click-bound]')) return;
      el.setAttribute('data-click-bound', '1');
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', () => { el.style.filter = 'brightness(1.1) drop-shadow(0 0 6px rgba(249,115,22,0.5))'; });
      el.addEventListener('mouseleave', () => { el.style.filter = ''; });
      el.addEventListener('click', (e) => {
        e.stopPropagation();

        if (isFlowchart) {
          const nid = matchNodeId(el, nodeIds);
          if (nid) {
            if (connectMode) {
              if (!connectFrom) setConnectFrom(nid);
              else if (nid !== connectFrom) { update(insertConnection(editCode, connectFrom, nid, 'arrow')); setConnectFrom(null); setConnectMode(false); }
              return;
            }
            const label = getNodeLabel(editCode, nid);
            const style = styleMap.get(nid) || { fill: '#ffffff', stroke: '#333333', color: '#000000', strokeWidth: '2' };
            const parsed = parsedNodes.find(n => n.id === nid);
            setSelectedNode({ nodeId: nid, label, style, shape: parsed?.shape || 'rect' });
            setSelectedLine(null);
            return;
          }
        }

        const clickedText = el.textContent?.trim() || '';
        if (!clickedText) return;
        const found = findCodeLine(clickedText);
        if (found) {
          setSelectedLine(found);
          setEditLineValue(found.original);
          setSelectedNode(null);
        }
      });
    });
  }, [editCode, connectMode, connectFrom, isFlowchart, findCodeLine]);

  useEffect(() => { const t = setTimeout(renderDiagram, 350); return () => clearTimeout(t); }, [renderDiagram]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeComponent) { setActiveComponent(null); return; }
        if (selectedLine) { setSelectedLine(null); return; }
        if (connectMode) { setConnectMode(false); setConnectFrom(null); return; }
        if (selectedNode) { setSelectedNode(null); return; }
        onClose();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, selectedNode, connectMode, activeComponent]);

  const update = (c: string) => { setEditCode(c); setHasChanges(c !== code); };
  const save = () => { onSave(editCode); setHasChanges(false); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') { e.preventDefault(); const ta = e.currentTarget; const s = ta.selectionStart; update(editCode.substring(0, s) + '    ' + editCode.substring(ta.selectionEnd)); requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 4; }); }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
  };

  const openComponent = (comp: DiagramComponent) => {
    const defaults: Record<string, string> = {};
    comp.fields.forEach(f => { defaults[f.name] = f.options?.[0]?.value || ''; });
    setFormValues(defaults);
    setActiveComponent(comp);
  };

  const submitComponent = () => {
    if (!activeComponent) return;
    const snippet = activeComponent.generate(formValues);
    update(insertSnippet(editCode, snippet));
    setActiveComponent(null);
    setFormValues({});
  };

  const handleStyleChange = (k: keyof NodeStyle, v: string) => { if (!selectedNode) return; const ns = { ...selectedNode.style, [k]: v }; update(applyNodeStyle(editCode, selectedNode.nodeId, ns)); setSelectedNode({ ...selectedNode, style: ns }); };
  const handleLabelChange = (nl: string) => { if (!selectedNode) return; update(updateNodeLabel(editCode, selectedNode.nodeId, nl)); setSelectedNode({ ...selectedNode, label: nl }); };
  const handleShapeChange = (ns: ShapeType) => { if (!selectedNode) return; update(changeNodeShape(editCode, selectedNode.nodeId, ns)); setSelectedNode({ ...selectedNode, shape: ns }); };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[calc(100%-16px)] h-[calc(100%-16px)] bg-white dark:bg-[#131923] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f2937] shrink-0 gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">#{index + 1}</span>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{CHART_LABELS[chartType] || chartType}</span>
            {hasChanges && <span className="text-[10px] font-bold text-orange-500 animate-pulse">●</span>}
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 overflow-x-auto max-w-[60%]">
            {components.map(comp => (
              <button key={comp.id} onClick={() => openComponent(comp)} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${activeComponent?.id === comp.id ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2332]'}`}>
                <span>{comp.icon}</span> {comp.label}
              </button>
            ))}
            {isFlowchart && (
              <button onClick={() => { setConnectMode(!connectMode); setConnectFrom(null); }} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${connectMode ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2332]'}`}>
                <Link2 size={11} /> Nối
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setShowCode(p => !p)} className={`p-1.5 rounded-md transition-all ${showCode ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-orange-500'}`} title="Code">{showCode ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}</button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1 text-slate-400 hover:text-orange-500 rounded-md"><ZoomOut size={14} /></button>
            <span className="text-[11px] font-mono text-slate-400 min-w-[32px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(500, z + 25))} className="p-1 text-slate-400 hover:text-orange-500 rounded-md"><ZoomIn size={14} /></button>
            <button onClick={autoFit} className="p-1 text-slate-400 hover:text-orange-500 rounded-md" title="Auto fit"><Maximize2 size={14} /></button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <button onClick={() => setShowHelp(p => !p)} className={`p-1.5 rounded-md transition-all ${showHelp ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-orange-500'}`}><HelpCircle size={14} /></button>
            {hasChanges && <button onClick={save} className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg active:scale-95 shadow-sm"><Save size={11} /> Lưu</button>}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"><X size={16} /></button>
          </div>
        </div>

        {connectMode && (
          <div className="px-3 py-1.5 bg-orange-500/10 border-b border-orange-500/20 text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2 shrink-0">
            <Link2 size={12} />
            {connectFrom ? <>Click node <b>đích</b> để nối từ <code className="bg-orange-500/20 px-1 rounded">{connectFrom}</code></> : <>Click node <b>nguồn</b></>}
            <button onClick={() => { setConnectMode(false); setConnectFrom(null); }} className="ml-auto text-[10px] text-slate-500 hover:text-red-500 underline">Hủy</button>
          </div>
        )}

        {showHelp && (
          <div className="px-4 py-2.5 bg-orange-500/5 border-b border-orange-500/20 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-orange-500">📖 Hướng dẫn — {CHART_LABELS[chartType]}</span>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <div>➕ Toolbar hiển thị <b>components</b> theo loại diagram</div>
              <div>📝 Click component → điền form → thêm vào syntax</div>
              {isFlowchart && <><div>🖱️ <b>Click node</b> → style panel bên phải</div><div>🔗 <b>Nối</b> → click A → click B → tạo arrow</div></>}
              <div>◧ Toggle <b>Code editor</b> bên trái</div>
              <div>💾 <b>⌘S</b> lưu — <b>Esc</b> đóng</div>
              <div>🔍 <b>Auto Fit</b> → zoom vừa màn hình</div>
              <div>📊 Hỗ trợ: Flowchart, Sequence, State, ER, Class, Gantt, Pie, Mindmap, Git</div>
            </div>
          </div>
        )}

        {activeComponent && (
          <div className="px-4 py-3 bg-orange-500/5 border-b border-orange-500/20 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-orange-500">{activeComponent.icon} Thêm {activeComponent.label}</span>
              <button onClick={() => setActiveComponent(null)} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
            </div>
            <div className="flex items-end gap-2 flex-wrap">
              {activeComponent.fields.map(f => (
                <div key={f.name} className="flex-1 min-w-[120px] max-w-[200px]">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 block">{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={formValues[f.name] || ''} onChange={e => setFormValues(p => ({ ...p, [f.name]: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500">
                      {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.name === 'attrs' || f.name === 'methods' ? (
                    <textarea value={formValues[f.name] || ''} onChange={e => setFormValues(p => ({ ...p, [f.name]: e.target.value }))} placeholder={f.placeholder} rows={2} className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 resize-none font-mono" />
                  ) : (
                    <input value={formValues[f.name] || ''} onChange={e => setFormValues(p => ({ ...p, [f.name]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && submitComponent()} placeholder={f.placeholder} className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500" autoFocus={activeComponent.fields[0] === f} />
                  )}
                </div>
              ))}
              <button onClick={submitComponent} className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shrink-0">+ Thêm</button>
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#0d1117] rounded-md px-2 py-1 overflow-x-auto">
              Preview: <span className="text-orange-400">{activeComponent.generate(formValues)}</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex min-h-0">
          {showCode && (
            <div className="w-[30%] border-r border-slate-200 dark:border-slate-800 flex flex-col min-w-0">
              <div className="px-3 py-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2332] flex items-center gap-2 shrink-0">
                <Code2 size={11} className="text-orange-500" /><span className="text-[10px] font-bold text-slate-500">CODE</span>
              </div>
              <textarea value={editCode} onChange={e => update(e.target.value)} onKeyDown={handleKeyDown} spellCheck={false} className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-[11px] leading-[18px] p-2 resize-none outline-none overflow-auto caret-orange-500" style={{ tabSize: 4 }} />
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0" ref={containerRef}>
            <div className="flex-1 overflow-auto p-4" onClick={() => { setSelectedNode(null); setSelectedLine(null); }}>
              <div ref={previewRef} className="[&_svg]:h-auto transition-transform duration-150 mx-auto" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }} />
            </div>
          </div>

          {(selectedNode || selectedLine) && (
            <div className="w-[280px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923] overflow-auto p-3 space-y-2.5">
              {selectedNode && isFlowchart ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Paintbrush size={13} className="text-orange-500" /><span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedNode.nodeId}</span></div>
                    <button onClick={() => setSelectedNode(null)} className="p-0.5 hover:bg-slate-100 dark:hover:bg-[#1a2332] rounded-md"><X size={12} className="text-slate-400" /></button>
                  </div>
                  <Field label="Label" icon={<Type size={9} />}><input type="text" value={selectedNode.label} onChange={e => handleLabelChange(e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500" /></Field>
                  <Field label="Shape" icon={<Square size={9} />}>
                    <div className="grid grid-cols-4 gap-1">{SHAPES.map(s => (
                      <button key={s.type} onClick={() => handleShapeChange(s.type)} className={`p-1.5 rounded-md text-sm text-center border ${selectedNode.shape === s.type ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 dark:bg-[#1f2937] text-slate-500 border-slate-200 dark:border-slate-700 hover:border-orange-500/50'}`} title={s.label}>{s.icon}</button>
                    ))}</div>
                  </Field>
                  <ColorRow label="Fill" value={selectedNode.style.fill} onChange={v => handleStyleChange('fill', v)} />
                  <ColorRow label="Stroke" value={selectedNode.style.stroke} onChange={v => handleStyleChange('stroke', v)} />
                  <ColorRow label="Text" value={selectedNode.style.color} onChange={v => handleStyleChange('color', v)} />
                  <div className="h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: selectedNode.style.fill, borderColor: selectedNode.style.stroke, color: selectedNode.style.color }}>{selectedNode.label || selectedNode.nodeId}</div>
                  <button onClick={() => { update(removeNodeStyle(editCode, selectedNode.nodeId)); setSelectedNode(null); }} className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20"><Trash2 size={10} /> Xóa style</button>
                  {allNodes.length > 0 && (
                    <Field label={`Nodes (${allNodes.length})`} icon={<Layers size={9} />}>
                      <div className="space-y-0.5 max-h-[140px] overflow-auto">{allNodes.map(n => (
                        <button key={n.id} onClick={() => { const st = parseNodeStyles(editCode).get(n.id) || { fill: '#ffffff', stroke: '#333333', color: '#000000', strokeWidth: '2' }; setSelectedNode({ nodeId: n.id, label: n.label, style: st, shape: n.shape }); }} className={`w-full text-left px-2 py-1 rounded-md text-[10px] font-mono truncate ${n.id === selectedNode.nodeId ? 'bg-orange-500/10 text-orange-500 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-[#1a2332]'}`}>
                          {SHAPES.find(s => s.type === n.shape)?.icon} {n.id}: {n.label}
                        </button>
                      ))}</div>
                    </Field>
                  )}
                </>
              ) : selectedLine ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Paintbrush size={13} className="text-orange-500" /><span className="text-xs font-bold text-slate-700 dark:text-slate-200">✏️ Edit Element</span></div>
                    <button onClick={() => setSelectedLine(null)} className="p-0.5 hover:bg-slate-100 dark:hover:bg-[#1a2332] rounded-md"><X size={12} className="text-slate-400" /></button>
                  </div>
                  <div className="text-[10px] text-slate-400">Clicked: <span className="text-orange-500 font-bold">"{selectedLine.text}"</span></div>
                  <div className="text-[9px] text-slate-400 font-mono">Dòng {selectedLine.lineIndex + 1}</div>
                  <Field label="Code dòng này" icon={<Code2 size={9} />}>
                    <textarea value={editLineValue} onChange={e => setEditLineValue(e.target.value)} rows={3} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 font-mono resize-none" />
                  </Field>
                  <div className="flex gap-1">
                    <button onClick={() => {
                      const lines = editCode.split('\n');
                      lines[selectedLine.lineIndex] = editLineValue;
                      update(lines.join('\n'));
                      setSelectedLine(null);
                    }} className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg transition-all">✅ Áp dụng</button>
                    <button onClick={() => {
                      const lines = editCode.split('\n');
                      lines.splice(selectedLine.lineIndex, 1);
                      update(lines.join('\n'));
                      setSelectedLine(null);
                    }} className="px-3 py-1.5 border border-red-200 dark:border-red-500/20 text-red-500 text-[11px] font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">🗑️</button>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Context (±2 dòng)</div>
                    <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-2 font-mono text-[10px] leading-[16px] overflow-x-auto">
                      {editCode.split('\n').slice(Math.max(0, selectedLine.lineIndex - 2), selectedLine.lineIndex + 3).map((line, i) => {
                        const actualLine = Math.max(0, selectedLine.lineIndex - 2) + i;
                        const isActive = actualLine === selectedLine.lineIndex;
                        return <div key={i} className={`${isActive ? 'text-orange-500 font-bold bg-orange-500/10 -mx-1 px-1 rounded' : 'text-slate-500'}`}>{actualLine + 1}: {line || ' '}</div>;
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-1"><label className="flex items-center gap-1 text-[9px] font-bold text-orange-500 uppercase tracking-widest">{icon} {label}</label>{children}</div>
);
const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <Field label={label} icon={<CircleDot size={9} />}>
    <div className="flex items-center gap-1.5">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent shrink-0" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 outline-none focus:border-orange-500 min-w-0" />
    </div>
    <div className="flex flex-wrap gap-0.5">{PRESET_COLORS.slice(0, 10).map(c => (
      <button key={c} onClick={() => onChange(c)} className={`w-4 h-4 rounded hover:scale-125 ${value === c ? 'ring-1 ring-orange-500 ring-offset-1 dark:ring-offset-[#131923]' : 'border border-slate-200 dark:border-slate-700'}`} style={{ backgroundColor: c }} />
    ))}</div>
  </Field>
);
function matchNodeId(el: Element, nodeIds: string[]): string | null {
  const id = el.id || '';
  for (const n of nodeIds) { if (id.includes(n)) return n; }
  const t = el.textContent?.trim() || '';
  for (const n of nodeIds) { if (t === n || t.includes(n)) return n; }
  return null;
}
