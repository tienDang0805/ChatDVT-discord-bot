import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, FileText, Maximize, Minimize } from 'lucide-react';

// --- DATA TYPES ---
export type TreeNodeData = {
    id: string;
    label: string;
    text: string;
    children: TreeNodeData[];
    isExpanded: boolean;
};

// --- HELPER: JSON <-> TREE ---
export function jsonToTree(json: any, prefix = 'root'): TreeNodeData[] {
    if (!json || typeof json !== 'object') return [];
    return Object.entries(json)
        // Bỏ qua các key hệ thống bắt đầu bằng __
        .filter(([k]) => !k.startsWith('__'))
        .map(([key, value], idx) => {
            const nodeId = `${prefix}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
            if (typeof value === 'object' && value !== null) {
                // Nếu node cha có text lưu trong '__rootText', lấy ra
                const objValue = value as Record<string, any>;
                const nodeText = objValue['__rootText'] || '';
                return {
                    id: nodeId,
                    label: key,
                    text: nodeText,
                    children: jsonToTree(value, nodeId),
                    isExpanded: true
                };
            }
            // Là string thuần túy
            return {
                id: nodeId,
                label: key,
                text: typeof value === 'string' ? value : '',
                children: [],
                isExpanded: true
            };
    });
}

export function treeToJson(nodes: TreeNodeData[]): any {
    const json: Record<string, any> = {};
    nodes.forEach(node => {
        if (node.children.length > 0) {
             const childJson: Record<string, any> = treeToJson(node.children);
             if (node.text.trim()) {
                  childJson['__rootText'] = node.text;
             }
             json[node.label || 'Khối_Mới'] = childJson;
        } else {
             json[node.label || 'Khối_Mới'] = node.text;
        }
    });
    return json;
}

// --- TREE NODE COMPONENT ĐỆ QUY ---
interface TreeNodeProps {
    node: TreeNodeData;
    depth: number;
    onUpdate: (id: string, updates: Partial<TreeNodeData>) => void;
    onDelete: (id: string) => void;
    onAddChild: (parentId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, onUpdate, onDelete, onAddChild }) => {
    const hasChildren = node.children.length > 0;
    
    // Auto-resize textarea
    const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
        onUpdate(node.id, { text: e.target.value });
    };

    return (
        <div className="flex flex-col mb-4">
            {/* Thanh Tiêu Đề Node */}
            <div 
                className={`group flex items-start gap-2 relative transition-all`}
                style={{ paddingLeft: `${depth * 28}px` }}
            >
                 {depth > 0 && (
                     <div 
                         className="absolute left-0 top-0 bottom-[-16px] border-l-2 border-slate-700/30 rounded-bl-xl"
                         style={{ left: `${(depth - 1) * 28 + 14}px`, width: '14px', borderBottom: '2px solid rgba(51, 65, 85, 0.3)' }}
                     />
                 )}
                 
                 <div className="flex-1 bg-[#1a1d27] border border-slate-700/50 rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all hover:bg-[#1f2334]">
                      {/* Băng Khóa/Tên */}
                      <div className="flex items-center px-3 py-2 bg-[#151822] border-b border-slate-700/50">
                           <button 
                               onClick={() => onUpdate(node.id, { isExpanded: !node.isExpanded })}
                               className="p-1 mr-1 text-slate-500 hover:text-emerald-400 bg-slate-800/50 rounded hover:bg-slate-700 transition"
                           >
                               {node.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                           </button>
                           
                           <input 
                               value={node.label}
                               onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                               className="flex-1 bg-transparent text-[14px] font-bold text-emerald-400 focus:outline-none placeholder-slate-600 tracking-wide uppercase"
                               placeholder="TÊN KHỐI (VD: ROOT)"
                           />
                           
                           <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                               <button 
                                   onClick={() => onAddChild(node.id)}
                                   className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary/80 rounded transition-colors"
                                   title="Tạo Khối Con (Ấp trong Khối này)"
                               >
                                   <Plus size={12} /> Khối Con
                               </button>
                               <button 
                                   onClick={() => onDelete(node.id)}
                                   className="p-1.5 text-slate-500 hover:text-white bg-slate-800 hover:bg-red-500 rounded transition-colors"
                                   title="Xóa cả dòng họ khối này"
                               >
                                   <Trash2 size={13} />
                               </button>
                           </div>
                      </div>
                      
                      {/* Nội dung (Có thể ẩn nếu Collapse) */}
                      {node.isExpanded && (
                           <div className="p-1 relative">
                                <textarea
                                    value={node.text}
                                    onChange={handleTextareaInput}
                                    style={{ height: 'auto', minHeight: '60px' }}
                                    ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                                    className="w-full bg-transparent text-slate-300 font-sans text-[15px] leading-7 p-3 focus:outline-none resize-none overflow-hidden"
                                    placeholder={hasChildren ? "Mô tả ngắn của khối cha (Ít dùng)..." : "Nội dung văn bản Prompt..."}
                                    spellCheck={false}
                                />
                           </div>
                      )}
                 </div>
            </div>

            {/* Các Node Con (Đệ Quy) */}
            {node.isExpanded && node.children.length > 0 && (
                 <div className="mt-3 relative">
                      {node.children.map(child => (
                           <TreeNode 
                               key={child.id}
                               node={child}
                               depth={depth + 1}
                               onUpdate={onUpdate}
                               onDelete={onDelete}
                               onAddChild={onAddChild}
                           />
                      ))}
                 </div>
            )}
        </div>
    );
};

// --- MAIN EDITOR COMPONENTS ---
interface TreeEditorProps {
    initialJson: any;
    onChange: (json: any) => void;
}

export const TreeEditor: React.FC<TreeEditorProps> = ({ initialJson, onChange }) => {
    const [nodes, setNodes] = useState<TreeNodeData[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Khởi tạo gốc
    useEffect(() => {
        let initialNodes = jsonToTree(initialJson);
        if (initialNodes.length === 0) {
             initialNodes = [{
                 id: 'block_root',
                 label: 'VAI_TRO',
                 text: '',
                 children: [],
                 isExpanded: true
             }];
        }
        setNodes(initialNodes);
    }, [initialJson]);

    // Lắng nghe thay đổi gửi ra ngoài
    useEffect(() => {
        const timer = setTimeout(() => {
             onChange(treeToJson(nodes));
        }, 300);
        return () => clearTimeout(timer);
    }, [nodes, onChange]);

    // Sửa nội dung Node bằng đệ quy Tree
    const handleUpdateNode = (id: string, updates: Partial<TreeNodeData>) => {
        setNodes(prev => {
            const updateInTree = (list: TreeNodeData[]): TreeNodeData[] => {
                return list.map(n => {
                    if (n.id === id) return { ...n, ...updates };
                    if (n.children.length > 0) return { ...n, children: updateInTree(n.children) };
                    return n;
                });
            };
            return updateInTree(prev);
        });
    };

    const handleDeleteNode = (id: string) => {
        setNodes(prev => {
             const removeInTree = (list: TreeNodeData[]): TreeNodeData[] => {
                  return list.filter(n => n.id !== id).map(n => ({
                       ...n,
                       children: removeInTree(n.children)
                  }));
             };
             return removeInTree(prev);
        });
    };

    const handleAddChild = (parentId: string) => {
        setNodes(prev => {
             const addInTree = (list: TreeNodeData[]): TreeNodeData[] => {
                  return list.map(n => {
                       if (n.id === parentId) {
                            return {
                                ...n,
                                isExpanded: true,
                                children: [...n.children, {
                                    id: `block_${Math.random().toString(36).substr(2)}`,
                                    label: 'KHỐI_CON',
                                    text: '',
                                    children: [],
                                    isExpanded: true
                                }]
                            };
                       }
                       if (n.children.length > 0) {
                            return { ...n, children: addInTree(n.children) };
                       }
                       return n;
                  });
             };
             return addInTree(prev);
        });
    };

    const handleAddRoot = () => {
         setNodes(prev => [
             ...prev, 
             {
                 id: `block_${Math.random().toString(36).substr(2)}`,
                 label: 'KHỐI_GỐC_MỚI',
                 text: '',
                 children: [],
                 isExpanded: true
             }
         ]);
    };

    return (
        <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0d0f16] flex flex-col w-screen h-screen' : 'absolute inset-0 bg-[#0d0f16] flex flex-col'}`}>
            {/* Header Control */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-[#11131a] border-b border-slate-700/50">
                 <div className="flex items-center gap-3">
                     <FileText size={18} className="text-emerald-400" />
                     <h2 className="text-[15px] font-bold text-slate-200">Data Tree Editor</h2>
                 </div>
                 <div className="flex gap-2">
                     <button onClick={handleAddRoot} className="flex items-center gap-2 px-4 py-2 bg-primary/90 hover:bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
                         <Plus size={16} /> Thêm Khối Gốc
                     </button>
                     <button 
                         onClick={() => setIsFullscreen(!isFullscreen)} 
                         className="flex items-center gap-2 px-3 py-2 bg-[#1a1d27] border border-slate-600 text-slate-300 hover:text-white rounded-xl shadow-lg hover:bg-slate-700 transition-all"
                         title="Full Screen"
                     >
                         {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                     </button>
                 </div>
            </div>

            {/* Canvas List */}
            <div className={`p-6 overflow-y-auto custom-scrollbar flex-1 ${isFullscreen ? 'px-[15%] pt-10' : ''}`}>
                 {nodes.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 font-mono italic">
                           Thư mục Trống. Hãy Thêm Khối Gốc...
                      </div>
                 ) : (
                      nodes.map(node => (
                           <TreeNode 
                               key={node.id}
                               node={node}
                               depth={0}
                               onUpdate={handleUpdateNode}
                               onDelete={handleDeleteNode}
                               onAddChild={handleAddChild}
                           />
                      ))
                 )}
                 <div className="h-20" /> {/* Padding bottom */}
            </div>
        </div>
    );
};
