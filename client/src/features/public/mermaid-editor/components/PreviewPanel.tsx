import { useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface PreviewPanelProps {
  svgHtml: string;
  error: string | null;
  zoom: number;
  onZoomChange: (z: number) => void;
}

export const PreviewPanel = ({ svgHtml, error, zoom, onZoomChange }: PreviewPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && svgHtml) {
      containerRef.current.innerHTML = svgHtml;
      const svgEl = containerRef.current.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = '100%';
        svgEl.style.height = 'auto';
        svgEl.removeAttribute('height');
      }
    }
  }, [svgHtml]);

  const handleFitView = () => {
    onZoomChange(100);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1b26] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-[#16161e] border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onZoomChange(Math.max(25, zoom - 25))}
            className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] font-mono text-slate-500 min-w-[40px] text-center">{zoom}%</span>
          <button
            onClick={() => onZoomChange(Math.min(300, zoom + 25))}
            className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleFitView}
            className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all ml-1"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 flex items-center justify-center"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)' }}
      >
        {error ? (
          <div className="text-center space-y-3 max-w-md">
            <div className="text-6xl">🔧</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Diagram syntax error. Hãy kiểm tra lại code.
            </p>
          </div>
        ) : svgHtml ? (
          <div
            ref={containerRef}
            className="transition-transform duration-200 origin-center"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        ) : (
          <div className="text-center space-y-3">
            <div className="text-6xl animate-pulse">✨</div>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Đang render diagram...</p>
          </div>
        )}
      </div>
    </div>
  );
};
