import { useRef, useEffect, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface DiagramBlockProps {
  code: string;
  blockId: string;
  theme: string;
  onClickNode?: () => void;
}

export const DiagramBlock = ({ code, blockId, theme, onClickNode }: DiagramBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const renderCountRef = useRef(0);

  const renderDiagram = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      renderCountRef.current += 1;
      const renderId = `diagram-${blockId}-${renderCountRef.current}`;
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'system-ui, sans-serif',
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        sequence: { useMaxWidth: true },
      });
      const { svg } = await mermaid.render(renderId, code);
      containerRef.current.innerHTML = svg;
      setError(null);

      if (onClickNode) {
        requestAnimationFrame(() => {
          const svgEl = containerRef.current?.querySelector('svg');
          if (!svgEl) return;
          const nodes = svgEl.querySelectorAll('.node, .cluster');
          nodes.forEach(node => {
            const el = node as SVGElement;
            el.style.cursor = 'pointer';
            el.addEventListener('mouseenter', () => { el.style.filter = 'brightness(1.08) drop-shadow(0 0 4px rgba(249,115,22,0.4))'; });
            el.addEventListener('mouseleave', () => { el.style.filter = ''; });
            el.addEventListener('click', (e) => { e.stopPropagation(); onClickNode(); });
          });
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Syntax error');
      if (containerRef.current) containerRef.current.innerHTML = '';
    }
  }, [code, theme, blockId, onClickNode]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 350);
    return () => clearTimeout(timer);
  }, [renderDiagram]);

  return (
    <div className="relative group">
      <div className="flex items-center justify-end gap-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 z-10">
        <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1 text-slate-400 hover:text-orange-500 bg-white/90 dark:bg-[#1f2937]/90 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm" title="Zoom out"><ZoomOut size={11} /></button>
        <span className="text-[9px] font-mono text-slate-400 bg-white/90 dark:bg-[#1f2937]/90 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-1 text-slate-400 hover:text-orange-500 bg-white/90 dark:bg-[#1f2937]/90 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm" title="Zoom in"><ZoomIn size={11} /></button>
        <button onClick={() => setZoom(100)} className="p-1 text-slate-400 hover:text-orange-500 bg-white/90 dark:bg-[#1f2937]/90 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm" title="Fit"><Maximize2 size={11} /></button>
      </div>

      <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923] p-4 shadow-sm">
        {error ? (
          <div className="text-center py-6 space-y-2">
            <div className="text-3xl">🔧</div>
            <p className="text-red-500 text-xs font-mono break-all max-w-md mx-auto">{error}</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto transition-transform duration-150 origin-top-left"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        )}
      </div>
    </div>
  );
};
