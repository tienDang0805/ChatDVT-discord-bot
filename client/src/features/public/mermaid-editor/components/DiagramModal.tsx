import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Code2, Eye, ZoomIn, ZoomOut, Maximize2, Save, Paintbrush, Type, Square, CircleDot, Trash2 } from 'lucide-react';
import mermaid from 'mermaid';
import { parseNodeStyles, extractNodeIds, getNodeLabel, applyNodeStyle, removeNodeStyle, updateNodeLabel, PRESET_COLORS, type NodeStyle } from '../utils/styleUtils';

interface DiagramModalProps {
  code: string;
  index: number;
  theme: string;
  onSave: (code: string) => void;
  onClose: () => void;
}

interface SelectedNode {
  nodeId: string;
  label: string;
  style: NodeStyle;
}

export const DiagramModal = ({ code, index, theme, onSave, onClose }: DiagramModalProps) => {
  const [editCode, setEditCode] = useState(code);
  const [zoom, setZoom] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  const renderDiagram = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      renderCountRef.current++;
      const id = `modal-d-${renderCountRef.current}-${Date.now()}`;
      mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', securityLevel: 'loose', fontFamily: 'system-ui, sans-serif' });
      const { svg } = await mermaid.render(id, editCode);
      previewRef.current.innerHTML = svg;
      const svgEl = previewRef.current.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = '100%';
        svgEl.style.height = 'auto';
        svgEl.removeAttribute('height');
      }
      requestAnimationFrame(() => attachNodeInteractions());
    } catch (err: any) {
      if (previewRef.current) previewRef.current.innerHTML = `<div class="text-red-500 text-sm p-4 font-mono">⚠️ ${err?.message || 'Syntax error'}</div>`;
    }
  }, [editCode, theme]);

  const attachNodeInteractions = useCallback(() => {
    if (!previewRef.current) return;
    const svgEl = previewRef.current.querySelector('svg');
    if (!svgEl) return;
    const nodeIds = extractNodeIds(editCode);
    const styleMap = parseNodeStyles(editCode);
    const allNodes = svgEl.querySelectorAll('.node, .cluster');

    allNodes.forEach(node => {
      const el = node as SVGElement;
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', () => { el.style.filter = 'brightness(1.1) drop-shadow(0 0 8px rgba(249,115,22,0.6))'; });
      el.addEventListener('mouseleave', () => { el.style.filter = ''; });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const nid = matchNodeId(el, nodeIds);
        if (nid) {
          const label = getNodeLabel(editCode, nid);
          const style = styleMap.get(nid) || { fill: '#ffffff', stroke: '#333333', color: '#000000', strokeWidth: '2' };
          setSelectedNode({ nodeId: nid, label, style });
        }
      });
    });
  }, [editCode]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 350);
    return () => clearTimeout(timer);
  }, [renderDiagram]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (selectedNode) setSelectedNode(null); else onClose(); } };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, selectedNode]);

  const updateCode = (newCode: string) => {
    setEditCode(newCode);
    setHasChanges(newCode !== code);
  };

  const handleSave = () => {
    onSave(editCode);
    setHasChanges(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      updateCode(editCode.substring(0, start) + '    ' + editCode.substring(end));
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
  };

  const handleStyleChange = (key: keyof NodeStyle, value: string) => {
    if (!selectedNode) return;
    const newStyle = { ...selectedNode.style, [key]: value };
    const newCode = applyNodeStyle(editCode, selectedNode.nodeId, newStyle);
    updateCode(newCode);
    setSelectedNode({ ...selectedNode, style: newStyle });
  };

  const handleLabelChange = (newLabel: string) => {
    if (!selectedNode) return;
    const newCode = updateNodeLabel(editCode, selectedNode.nodeId, newLabel);
    updateCode(newCode);
    setSelectedNode({ ...selectedNode, label: newLabel });
  };

  const handleRemoveStyle = () => {
    if (!selectedNode) return;
    updateCode(removeNodeStyle(editCode, selectedNode.nodeId));
    setSelectedNode(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[calc(100%-16px)] h-[calc(100%-16px)] bg-white dark:bg-[#131923] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f2937] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">📊 Diagram #{index + 1}</span>
            {hasChanges && <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full animate-pulse">UNSAVED</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1.5 text-slate-400 hover:text-orange-500 rounded-lg transition-colors" title="Zoom out"><ZoomOut size={14} /></button>
            <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-1.5 text-slate-400 hover:text-orange-500 rounded-lg transition-colors" title="Zoom in"><ZoomIn size={14} /></button>
            <button onClick={() => setZoom(100)} className="p-1.5 text-slate-400 hover:text-orange-500 rounded-lg transition-colors" title="Fit"><Maximize2 size={14} /></button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            {hasChanges && (
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm">
                <Save size={12} /> Lưu (⌘S)
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Đóng (Esc)"><X size={16} /></button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="w-[35%] border-r border-slate-200 dark:border-slate-800 flex flex-col min-w-0">
            <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2332] flex items-center gap-2 shrink-0">
              <Code2 size={12} className="text-orange-500" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">CODE</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#0d1117] px-1.5 py-0.5 rounded-full">{editCode.split('\n').length}L</span>
            </div>
            <textarea
              value={editCode}
              onChange={e => updateCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-[12px] leading-[20px] p-3 resize-none outline-none overflow-auto caret-orange-500"
              style={{ tabSize: 4 }}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a2332] flex items-center gap-2 shrink-0">
              <Eye size={12} className="text-orange-500" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">PREVIEW</span>
              <span className="text-[10px] text-slate-400">Click node để chỉnh style →</span>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center" onClick={() => setSelectedNode(null)}>
              <div
                ref={previewRef}
                className="[&_svg]:max-w-full [&_svg]:h-auto transition-transform duration-150"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              />
            </div>
          </div>

          {selectedNode && (
            <div className="w-[260px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923] overflow-auto p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paintbrush size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedNode.nodeId}</span>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-50 dark:hover:bg-[#1a2332] rounded-lg" title="Đóng"><X size={12} className="text-slate-400" /></button>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase tracking-widest"><Type size={10} /> Label</label>
                <input type="text" value={selectedNode.label} onChange={e => handleLabelChange(e.target.value)} className="w-full px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 transition-colors" />
              </div>

              <ColorField label="Fill" icon={<Square size={10} />} value={selectedNode.style.fill} onChange={v => handleStyleChange('fill', v)} />
              <ColorField label="Stroke" icon={<CircleDot size={10} />} value={selectedNode.style.stroke} onChange={v => handleStyleChange('stroke', v)} />
              <ColorField label="Text" icon={<Type size={10} />} value={selectedNode.style.color} onChange={v => handleStyleChange('color', v)} />

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Stroke Width</label>
                <input type="range" min="1" max="6" value={selectedNode.style.strokeWidth} onChange={e => handleStyleChange('strokeWidth', e.target.value)} className="w-full accent-orange-500" />
                <div className="text-[10px] text-slate-400 text-right">{selectedNode.style.strokeWidth}px</div>
              </div>

              <div className="h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all" style={{ backgroundColor: selectedNode.style.fill, borderColor: selectedNode.style.stroke, color: selectedNode.style.color, borderWidth: `${selectedNode.style.strokeWidth}px` }}>
                {selectedNode.label || selectedNode.nodeId}
              </div>

              <button onClick={handleRemoveStyle} className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-all">
                <Trash2 size={10} /> Xóa style
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ColorField = ({ label, icon, value, onChange }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase tracking-widest">{icon} {label}</label>
    <div className="flex items-center gap-1.5">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent shrink-0" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 outline-none focus:border-orange-500 transition-colors min-w-0" />
    </div>
    <div className="flex flex-wrap gap-0.5">
      {PRESET_COLORS.slice(0, 12).map(c => (
        <button key={c} onClick={() => onChange(c)} className={`w-4 h-4 rounded transition-all hover:scale-125 ${value === c ? 'ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-[#131923]' : 'border border-slate-200 dark:border-slate-700'}`} style={{ backgroundColor: c }} title={c} />
      ))}
    </div>
  </div>
);

function matchNodeId(el: Element, nodeIds: string[]): string | null {
  const elId = el.id || '';
  for (const nid of nodeIds) { if (elId.includes(nid)) return nid; }
  const text = el.textContent?.trim() || '';
  for (const nid of nodeIds) { if (text === nid || text.includes(nid)) return nid; }
  return null;
}
