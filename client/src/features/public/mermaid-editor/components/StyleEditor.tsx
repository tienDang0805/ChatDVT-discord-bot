import { Paintbrush, X, Type, Square, CircleDot, Trash2 } from 'lucide-react';
import { NodeStyle, PRESET_COLORS, applyNodeStyle, removeNodeStyle, updateNodeLabel } from '../utils/styleUtils';

interface StyleEditorProps {
  nodeId: string;
  nodeLabel: string;
  style: NodeStyle;
  code: string;
  onCodeChange: (code: string) => void;
  onClose: () => void;
}

export const StyleEditor = ({ nodeId, nodeLabel, style, code, onCodeChange, onClose }: StyleEditorProps) => {
  const handleStyleChange = (key: keyof NodeStyle, value: string) => {
    const newStyle = { ...style, [key]: value };
    onCodeChange(applyNodeStyle(code, nodeId, newStyle));
  };

  const handleLabelChange = (newLabel: string) => {
    onCodeChange(updateNodeLabel(code, nodeId, newLabel));
  };

  const handleRemoveStyle = () => {
    onCodeChange(removeNodeStyle(code, nodeId));
    onClose();
  };

  return (
    <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 w-72 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paintbrush size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Style: {nodeId}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-50 dark:hover:bg-[#1a2332] rounded-lg transition-colors" title="Đóng">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-orange-500 uppercase tracking-widest">
          <Type size={12} /> Label
        </label>
        <input
          type="text"
          value={nodeLabel}
          onChange={e => handleLabelChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      <ColorField label="Fill" icon={<Square size={12} />} value={style.fill} onChange={v => handleStyleChange('fill', v)} />
      <ColorField label="Stroke" icon={<CircleDot size={12} />} value={style.stroke} onChange={v => handleStyleChange('stroke', v)} />
      <ColorField label="Text" icon={<Type size={12} />} value={style.color} onChange={v => handleStyleChange('color', v)} />

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">Stroke Width</label>
        <input
          type="range"
          min="1"
          max="6"
          value={style.strokeWidth}
          onChange={e => handleStyleChange('strokeWidth', e.target.value)}
          className="w-full accent-orange-500"
        />
        <div className="text-[10px] text-slate-400 text-right">{style.strokeWidth}px</div>
      </div>

      <div
        className="h-12 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all"
        style={{ backgroundColor: style.fill, borderColor: style.stroke, color: style.color, borderWidth: `${style.strokeWidth}px` }}
      >
        {nodeLabel || nodeId}
      </div>

      <button
        onClick={handleRemoveStyle}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:border-red-500/50 transition-all"
      >
        <Trash2 size={12} /> Xóa style node này
      </button>
    </div>
  );
};

const ColorField = ({ label, icon, value, onChange }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-orange-500 uppercase tracking-widest">
      {icon} {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 outline-none focus:border-orange-500 transition-colors"
      />
    </div>
    <div className="flex flex-wrap gap-1">
      {PRESET_COLORS.slice(0, 12).map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-md border transition-all hover:scale-110 ${value === c ? 'border-orange-500 ring-2 ring-orange-500/30 scale-110' : 'border-slate-200 dark:border-slate-700'}`}
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  </div>
);
