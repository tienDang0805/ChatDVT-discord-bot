import { SAMPLE_DIAGRAMS } from '../utils/mermaidHelpers';

interface SampleSelectorProps {
  onSelect: (code: string) => void;
}

const LABELS: Record<string, { label: string; emoji: string }> = {
  flowchart: { label: 'Flowchart', emoji: '📊' },
  sequence: { label: 'Sequence', emoji: '🔄' },
  classDiagram: { label: 'Class', emoji: '🏗️' },
  stateDiagram: { label: 'State', emoji: '🔀' },
  erDiagram: { label: 'ER Diagram', emoji: '🗃️' },
  gantt: { label: 'Gantt', emoji: '📅' },
  pie: { label: 'Pie Chart', emoji: '🥧' },
  gitGraph: { label: 'Git Graph', emoji: '🌿' },
  mindmap: { label: 'Mind Map', emoji: '🧠' },
};

export const SampleSelector = ({ onSelect }: SampleSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(SAMPLE_DIAGRAMS).map(([key, code]) => {
        const info = LABELS[key] || { label: key, emoji: '📋' };
        return (
          <button
            key={key}
            onClick={() => onSelect(code)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 hover:text-orange-500 active:scale-95 transition-all shadow-sm"
          >
            {info.emoji} {info.label}
          </button>
        );
      })}
    </div>
  );
};
