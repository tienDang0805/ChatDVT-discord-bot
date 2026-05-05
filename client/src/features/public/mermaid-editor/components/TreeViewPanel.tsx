import { useState } from 'react';
import { ChevronRight, ChevronDown, GitBranch, Link2, Tag, Layout } from 'lucide-react';
import type { TreeNode } from '../utils/mermaidHelpers';

interface TreeViewPanelProps {
  tree: TreeNode[];
  onNodeClick?: (line: number) => void;
}

const typeIcons: Record<TreeNode['type'], React.ReactNode> = {
  diagram: <Layout size={13} className="text-orange-500" />,
  node: <Tag size={13} className="text-sky-400" />,
  connection: <Link2 size={13} className="text-emerald-400" />,
  section: <GitBranch size={13} className="text-orange-400" />,
  keyword: <Tag size={13} className="text-pink-400" />,
};

const TreeNodeView = ({ node, depth, onNodeClick }: { node: TreeNode; depth: number; onNodeClick?: (line: number) => void }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(p => !p);
          if (node.line != null && onNodeClick) onNodeClick(node.line);
        }}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-left hover:bg-slate-50 dark:hover:bg-[#1a2332] rounded-md transition-colors group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={12} className="text-slate-400 shrink-0" /> : <ChevronRight size={12} className="text-slate-400 shrink-0" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {typeIcons[node.type]}
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300 truncate group-hover:text-orange-500 transition-colors">
          {node.label}
        </span>
        {node.line != null && (
          <span className="ml-auto text-[10px] text-slate-400 font-mono shrink-0">L{node.line + 1}</span>
        )}
      </button>
      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNodeView key={child.id} node={child} depth={depth + 1} onNodeClick={onNodeClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeViewPanel = ({ tree, onNodeClick }: TreeViewPanelProps) => {
  if (tree.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">
        Nhập code để hiển thị cấu trúc
      </div>
    );
  }

  return (
    <div className="py-2 overflow-auto max-h-full">
      {tree.map(node => (
        <TreeNodeView key={node.id} node={node} depth={0} onNodeClick={onNodeClick} />
      ))}
    </div>
  );
};
