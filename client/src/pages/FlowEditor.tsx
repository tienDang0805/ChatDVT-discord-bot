import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Position,
  Handle
} from '@xyflow/react';
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, GripHorizontal, Maximize, Minimize } from 'lucide-react';

// === KIỂU DỮ LIỆU CUSTOM NODE ===
export type PromptNodeData = {
    label: string;
    text: string;
    onChange: (id: string, field: 'label' | 'text', value: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, text: string, label: string) => void;
};

// === CUSTOM NODE UI ===
const PromptBlockNode = ({ id, data }: { id: string, data: PromptNodeData }) => {
    return (
        <div className="bg-[#1b1f2b] border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-2xl min-w-[300px] w-full max-w-[450px]
                        hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all">
            {/* Input handle (from parent) */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-2 border-[#151822]" />
            
            <div className="flex items-center justify-between bg-[#13151c] px-3 py-2 border-b border-slate-700/80 cursor-grab active:cursor-grabbing group">
                <div className="flex items-center gap-2 w-full">
                     <GripHorizontal size={14} className="text-slate-600 group-hover:text-primary transition-colors" />
                     <input 
                         className="flex-1 bg-transparent text-[14px] font-bold text-emerald-400 focus:outline-none placeholder-slate-600 uppercase tracking-wider nodrag"
                         value={data.label}
                         onChange={(e) => data.onChange(id, 'label', e.target.value)}
                         placeholder="TÊN KHỐI LỆNH"
                     />
                </div>
                <button 
                     onClick={() => data.onDelete(id)}
                     className="p-1 px-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors nodrag ml-2" title="Xóa"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            
            <div className="p-3 bg-[#171a24] cursor-text" onClick={() => data.onEdit(id, data.text, data.label)}>
                <div className="w-full h-20 text-slate-400 font-sans text-sm leading-relaxed overflow-hidden text-ellipsis whitespace-pre-wrap flex items-center justify-center border border-dashed border-slate-700/50 rounded-lg hover:border-primary/50 hover:text-slate-300 transition-colors bg-[#11131a]">
                     {data.text ? (
                         <div className="w-full h-full p-2 text-left opacity-80 pointer-events-none">
                              {data.text.length > 80 ? data.text.substring(0, 80) + '...' : data.text}
                         </div>
                     ) : (
                         <span className="flex items-center gap-2 text-xs italic opacity-50"><Plus size={14}/> Click để soạn thảo</span>
                     )}
                </div>
            </div>

            {/* Output handle (to children) */}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-400 border-2 border-[#151822]" />
        </div>
    );
};

const nodeTypes = {
    promptBlock: PromptBlockNode
};

// === HELPER: Json Sang Nodes/Edges ===
function buildFlowFromJson(jsonData: any) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    function traverse(data: any, parentId: string | null = null, depth: number = 0, px: number = 250) {
        if (!data || typeof data !== 'object') return;
        
        const keys = Object.keys(data).filter(k => !k.startsWith('__'));
        
        // Cân bằng tọa độ X
        const startX = px - ((keys.length - 1) * 350) / 2;

        keys.forEach((key, index) => {
             const value = data[key];
             const nodeId = `node_${Math.random().toString(36).substring(7)}`;
             
             const isText = typeof value === 'string';
             
             nodes.push({
                 id: nodeId,
                 type: 'promptBlock',
                 position: { x: startX + (index * 350), y: depth * 250 + 50 },
                 data: { label: key, text: isText ? value : '' }
             });

             if (parentId) {
                 edges.push({
                     id: `e_${parentId}-${nodeId}`,
                     source: parentId,
                     target: nodeId,
                     type: 'smoothstep',
                     animated: true,
                     style: { stroke: '#10b981', strokeWidth: 2 }
                 });
             }

             if (!isText && typeof value === 'object') {
                  traverse(value, nodeId, depth + 1, startX + (index * 350));
             }
        });
    }

    if (Object.keys(jsonData).length === 0) {
         // Default init node
         nodes.push({
             id: 'node_init',
             type: 'promptBlock',
             position: { x: 250, y: 50 },
             data: { label: 'VAI TRÒ (CORE)', text: '' }
         });
    } else {
         traverse(jsonData);
    }

    return { nodes, edges };
}

// === HELPER: Nodes/Edges Sang Json (Để gửi API) ===
function buildJsonFromFlow(nodes: Node[], edges: Edge[]) {
    const jsonStr: any = {};
    
    // Tìm gốc: Node nào ko có Edge target (tức ko ai chỉ vào nó)
    const targetIds = new Set(edges.map(e => e.target));
    const rootNodes = nodes.filter(n => !targetIds.has(n.id));

    function buildTree(node: Node): any {
        // Tìm các node con của node này
        const childEdges = edges.filter(e => e.source === node.id);
        const children = childEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as Node[];

        const label = node.data.label as string;
        const text = node.data.text as string;

        if (children.length === 0) {
            return { [label || 'Unnamed']: text };
        } else {
            const childrenData: any = children.reduce((acc: any, child: Node) => {
                 return { ...acc, ...buildTree(child) };
            }, {});
            // Nếu Node cha có Text, ta lưu nó vào key '__rootText' (chỉ định dang con)
            if (text.trim() !== '') {
                 childrenData['__rootText'] = text; 
            }
            return { [label || 'Unnamed']: childrenData };
        }
    }

    rootNodes.forEach(rn => {
        Object.assign(jsonStr, buildTree(rn));
    });

    return jsonStr;
}

// === MAIN EDITOR COMPONENT ===
interface Props {
    initialJson: any;
    onChange: (json: any) => void;
}

export const FlowEditor: React.FC<Props> = ({ initialJson, onChange }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // State cho Modal (lưu cả id và text tạm thời đang gõ)
    const [editingNode, setEditingNode] = useState<{id: string, text: string, label: string} | null>(null);

    // Init state from parsed JSON
    useEffect(() => {
         const { nodes: n, edges: e } = buildFlowFromJson(initialJson);
         // Phải tiêm lại hàm onChange/onDelete vào data
         const mappedNodes = n.map(node => ({
             ...node,
             data: {
                 ...node.data,
                 onChange: handleNodeDataChange,
                 onDelete: handleNodeDelete,
                 onEdit: handleOpenEditModal
             }
         }));
         setNodes(mappedNodes);
         setEdges(e);
    }, [initialJson]);

    // Lắng nghe nodes/edges thay đổi -> Sync JSON ra cha
    useEffect(() => {
        if (nodes.length > 0) {
            // Dùng setTimeout xíu để đảm bảo React State đã commit
            const timer = setTimeout(() => {
                const newJson = buildJsonFromFlow(nodes, edges);
                onChange(newJson);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [nodes, edges]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge({ 
            ...connection, 
            animated: true, 
            type: 'smoothstep',
            style: { stroke: '#10b981', strokeWidth: 2 } 
        }, eds));
    }, []);

    // Mutation
    const handleNodeDataChange = (id: string, field: 'label' | 'text', value: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            [field]: value,
                        },
                    };
                }
                return node;
            })
        );
    };

    const handleNodeDelete = (id: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter(e => e.source !== id && e.target !== id));
    };

    const handleOpenEditModal = (id: string, text: string, label: string) => {
        setEditingNode({ id, text, label });
    };

    const handleSaveModal = () => {
        if (editingNode) {
            handleNodeDataChange(editingNode.id, 'text', editingNode.text);
            handleNodeDataChange(editingNode.id, 'label', editingNode.label);
            setEditingNode(null);
        }
    };

    const handleAddFloatingNode = () => {
         const newNode: Node = {
             id: `node_${Math.random().toString(36).substring(7)}`,
             type: 'promptBlock',
             position: { x: 50, y: 50 },
             data: { label: 'NEW_BLOCK', text: '', onChange: handleNodeDataChange, onDelete: handleNodeDelete, onEdit: handleOpenEditModal }
         };
         setNodes(nds => [...nds, newNode]);
    };

    return (
        <div style={{ width: '100%', height: '100%' }} className={`bg-[#0d0f16] transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'relative'}`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="custom-react-flow"
            >
                <Background color="#1e293b" gap={16} size={1} />
                <Controls className="bg-[#1a1d27] border-slate-700/50 fill-slate-300" />
            </ReactFlow>

             {/* Helper UI Buttons */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <button 
                     onClick={handleAddFloatingNode}
                     className="bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 >
                     <Plus size={16} /> Bốc Khối Mới
                 </button>
                 <button 
                     onClick={() => setIsFullscreen(!isFullscreen)}
                     className="bg-[#1a1d27]/90 hover:bg-[#252a38] text-slate-300 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg border border-slate-700/50 transition-all"
                     title="Toàn Màn Hình"
                 >
                     {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                 </button>
                 <div className="bg-[#1a1d27]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 text-xs text-slate-400 font-mono flex items-center shadow-lg">
                      💡 Kéo chuột từ cục màu xanh lá tròn xuống cục vuông ở Node khác để nối.
                 </div>
            </div>

            {/* Modal Edit / Popup Siêu To Khổng Lồ */}
            {editingNode && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                     <div className="bg-[#1a1d27] border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
                          {/* Modal Header */}
                          <div className="flex items-center justify-between px-6 py-4 bg-[#13151c] border-b border-slate-700/80">
                               <div className="flex-1 mr-4">
                                   <p className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-wider">Tên Mảng Dữ Liệu (NODE KEY)</p>
                                   <input 
                                        type="text"
                                        value={editingNode.label}
                                        onChange={(e) => setEditingNode(prev => prev ? {...prev, label: e.target.value} : null)}
                                        className="bg-[#0f111a] text-lg font-bold text-emerald-400 w-1/2 px-3 py-2 rounded-lg border border-slate-700/50 focus:border-primary/50 focus:outline-none transition-colors"
                                        placeholder="Tên Nhãn (VD: VAI_TRO)"
                                   />
                               </div>
                               <button 
                                    onClick={() => setEditingNode(null)}
                                    className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors bg-slate-800/50 hover:bg-slate-700"
                               >
                                    Đóng (Hủy)
                               </button>
                               <button 
                                    onClick={handleSaveModal}
                                    className="px-6 py-2 ml-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                               >
                                    Chốt Lưu
                               </button>
                          </div>
                          
                          {/* Modal Body / Editor */}
                          <div className="flex-1 bg-[#0d0f16] flex flex-col p-6">
                              <p className="text-xs text-slate-500 font-mono mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                  TEXT CONTENT (NỘI DUNG PROMPT)
                              </p>
                              <textarea 
                                  className="w-full flex-1 bg-[#13151c] text-slate-200 font-sans text-[15px] leading-8 p-6 rounded-xl border border-slate-700/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none custom-scrollbar"
                                  value={editingNode.text}
                                  onChange={(e) => setEditingNode(prev => prev ? {...prev, text: e.target.value} : null)}
                                  placeholder="Gõ thoải mái vào đây, càng dài càng tốt..."
                                  spellCheck={false}
                              />
                          </div>
                     </div>
                </div>
            )}
            
        </div>
    );
};
