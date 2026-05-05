import { useRef, useCallback } from 'react';
import { Code2, Copy, RotateCcw, Check } from 'lucide-react';
import { DEFAULT_CODE } from '../utils/mermaidHelpers';

interface EditorPanelProps {
  code: string;
  onChange: (code: string) => void;
  error: string | null;
  lineCount: number;
}

export const EditorPanel = ({ code, onChange, error, lineCount }: EditorPanelProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copiedRef = useRef(false);
  const [copied, setCopied] = [copiedRef.current, (v: boolean) => { copiedRef.current = v; }];

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    const btn = document.getElementById('copy-btn-icon');
    if (btn) {
      btn.classList.add('text-emerald-400');
      setTimeout(() => btn.classList.remove('text-emerald-400'), 1500);
    }
  }, [code]);

  const handleReset = useCallback(() => {
    onChange(DEFAULT_CODE);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  }, [code, onChange]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#131923] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-[#1f2937] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Editor</span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#0d1117] px-2 py-0.5 rounded-full">
            {lineCount} lines
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-[#1a2332] rounded-lg transition-all"
            title="Copy code"
          >
            <Copy size={14} id="copy-btn-icon" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-[#1a2332] rounded-lg transition-all"
            title="Reset to default"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="w-12 shrink-0 bg-slate-50 dark:bg-[#1f2937] border-r border-slate-200 dark:border-slate-800 overflow-hidden select-none">
          <div className="pt-3 text-right pr-3">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-[11px] leading-[22px] text-slate-400 dark:text-slate-600 font-mono">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-[13px] leading-[22px] p-3 resize-none outline-none overflow-auto caret-orange-500"
          style={{ tabSize: 4 }}
        />
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-red-500/10 border-t border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span className="break-all">{error}</span>
        </div>
      )}
    </div>
  );
};
