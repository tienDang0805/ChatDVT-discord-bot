import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil, Check, X, Expand } from 'lucide-react';
import { DiagramBlock } from './DiagramBlock';
import type { ParsedBlock } from '../utils/styleUtils';

interface DocumentViewProps {
  blocks: ParsedBlock[];
  theme: string;
  onUpdateBlock: (blockIndex: number, newContent: string) => void;
  onExpandDiagram: (blockIndex: number) => void;
}

export const DocumentView = ({ blocks, theme, onUpdateBlock, onExpandDiagram }: DocumentViewProps) => {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <div className="text-center space-y-3">
          <div className="text-6xl">📄</div>
          <p className="text-sm font-medium">Import file .md hoặc nhập code để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <div key={block.id}>
          {block.type === 'markdown' ? (
            <EditableMarkdown content={block.content} onSave={(v) => onUpdateBlock(block.index, v)} />
          ) : (
            <div className="relative group">
              <button
                onClick={() => onExpandDiagram(block.index)}
                className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all shadow-sm active:scale-95"
                title="Phóng to · Edit style"
              >
                <Expand size={10} /> Edit & Style
              </button>
              <DiagramBlock code={block.content} blockId={block.id} theme={theme} onClickNode={() => onExpandDiagram(block.index)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const EditableMarkdown = ({ content, onSave }: { content: string; onSave: (v: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const handleStartEdit = useCallback(() => { setEditValue(content); setEditing(true); }, [content]);

  const handleSave = useCallback(() => { onSave(editValue); setEditing(false); }, [editValue, onSave]);

  const handleCancel = useCallback(() => { setEditValue(content); setEditing(false); }, [content]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') handleCancel();
  }, [handleSave, handleCancel]);

  if (editing) {
    return (
      <div className="border border-orange-500/50 rounded-lg overflow-hidden bg-white dark:bg-[#131923]">
        <div className="flex items-center justify-between px-3 py-1 bg-orange-500/5 border-b border-orange-500/20">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">✏️ Editing</span>
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-md hover:bg-orange-600 transition-colors"><Check size={10} /> Lưu</button>
            <button onClick={handleCancel} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>
          </div>
        </div>
        <textarea
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-transparent text-slate-800 dark:text-slate-200 font-mono text-[12px] leading-relaxed p-3 resize-none outline-none"
          style={{ height: `${Math.max(80, editValue.split('\n').length * 20 + 16)}px` }}
        />
      </div>
    );
  }

  const trimmed = content.trim();
  if (!trimmed) return null;

  return (
    <div className="relative group cursor-pointer" onClick={handleStartEdit}>
      <button className="absolute top-0 right-0 z-10 p-1 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Edit">
        <Pencil size={10} />
      </button>
      <div className="rounded-lg hover:bg-slate-50/50 dark:hover:bg-[#1a2332]/50 transition-colors px-2 py-1 -mx-2 -my-1 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50">
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-white prose-h1:text-xl prose-h1:font-black prose-h2:text-base prose-h2:font-bold prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-1.5 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:text-[13px] prose-strong:text-slate-800 dark:prose-strong:text-slate-200 prose-code:text-orange-500 prose-code:bg-orange-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-blockquote:border-orange-500 prose-blockquote:bg-orange-500/5 prose-blockquote:py-0.5 prose-blockquote:rounded-r-lg prose-table:text-xs prose-th:bg-slate-100 dark:prose-th:bg-[#1f2937] prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-hr:border-slate-200 dark:prose-hr:border-slate-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
