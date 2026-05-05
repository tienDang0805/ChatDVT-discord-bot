import { useRef, useEffect, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface DiagramBlockProps {
  code: string;
  blockId: string;
  theme: string;
  onClickNode?: () => void;
}

export const DiagramBlock = ({ code, blockId, theme, onClickNode }: DiagramBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
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
    } catch (err: any) {
      setError(err?.message || 'Syntax error');
      if (containerRef.current) containerRef.current.innerHTML = '';
    }
  }, [code, theme, blockId]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 350);
    return () => clearTimeout(timer);
  }, [renderDiagram]);

  return (
    <div
      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923] p-4 shadow-sm cursor-pointer hover:border-orange-500/50 transition-colors"
      onClick={onClickNode}
      title="Click để mở editor"
    >
      {error ? (
        <div className="text-center py-4">
          <div className="text-2xl mb-1">🔧</div>
          <p className="text-red-500 text-xs font-mono break-all max-w-md mx-auto">{error}</p>
        </div>
      ) : (
        <div ref={containerRef} className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
      )}
    </div>
  );
};
