import { useEffect, useMemo } from 'react';
import { Background, BackgroundVariant, Controls, Handle, MarkerType, Position, ReactFlow, ReactFlowProvider, useNodesState, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { ArrowDownToLine, Box, Code2, Cpu, GitBranch, GitFork, Package, Terminal } from 'lucide-react';
import type { GraphNode, GraphProjection, Job, Step, Workflow } from '../core/types';
import { stepCategory, stepSummary } from '../core/explain';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import '@xyflow/react/dist/style.css';

type NodeData = Record<string, unknown> & { node: GraphNode; step?: Step; job?: Job; en: boolean; toggleJob: (id: string) => void; expanded: boolean; overview: boolean };
type WorkflowNode = Node<NodeData>;
const iconByCategory = { checkout: GitBranch, setup: Box, transfer: ArrowDownToLine, terminal: Terminal, package: Package, action: Code2 };

function Ports() {
  return <>{(['left', 'right', 'top', 'bottom'] as const).map(side => <span key={side}><Handle type="source" id={side} position={Position[side === 'left' ? 'Left' : side === 'right' ? 'Right' : side === 'top' ? 'Top' : 'Bottom']} /><Handle type="target" id={side} position={Position[side === 'left' ? 'Left' : side === 'right' ? 'Right' : side === 'top' ? 'Top' : 'Bottom']} /></span>)}</>;
}
function StepCard({ data, selected }: NodeProps<WorkflowNode>) {
  const { node, step, en } = data;
  const category = step ? stepCategory(step) : 'action', Icon = iconByCategory[category as keyof typeof iconByCategory] ?? Code2;
  return <div className={`cicd-step-card category-${category} ${selected ? 'is-selected' : ''}`}>
    <Ports /><div className="cicd-node-top"><span className="cicd-node-number">{node.order}</span><span>{node.category === 'run' ? 'run' : 'uses'}</span>{step?.condition !== undefined && <span className="cicd-condition">if</span>}</div>
    <Icon size={29} strokeWidth={1.6} className="cicd-node-icon" />
    <strong>{node.label}</strong><p>{step ? stepSummary(step, en) : ''}</p>
    <code>{node.caption}</code>
  </div>;
}
function JobCard({ data, selected }: NodeProps<WorkflowNode>) {
  const { node, job, en } = data;
  return <div className={`cicd-job-card ${data.overview || !data.expanded ? 'is-collapsed' : ''} ${selected ? 'is-selected' : ''}`}>
    <Handle type="target" position={Position.Left} /><Handle type="source" position={Position.Right} />
    <div className="cicd-job-heading"><Cpu size={22} /><div><strong>{node.label}</strong><code>{job?.kind === 'reusable' ? 'workflow reference' : 'runs-on'}: {node.caption}</code></div>
      {job?.matrix && <span className="cicd-badge">matrix · {job.matrix.count ?? '?'}</span>}
      {job?.condition !== undefined && <span className="cicd-badge">if</span>}
      {!data.overview && !!job?.steps.length && <button className="nodrag cicd-expand" onClick={e => { e.stopPropagation(); data.toggleJob(node.id); }} aria-label={(data.expanded ? (en ? 'Collapse ' : 'Thu gọn ') : (en ? 'Expand ' : 'Mở ')) + node.label}>{data.expanded ? '−' : '+'}</button>}
    </div>
    {(data.overview || !data.expanded) && <p className="cicd-job-meta">{job?.steps.length ?? 0} steps{job?.kind === 'reusable' && ' · ' + (en ? 'Unresolved reference' : 'Tham chiếu chưa mở rộng')}</p>}
  </div>;
}
function TriggerCard({ data, selected }: NodeProps<WorkflowNode>) {
  return <div className={`cicd-trigger-card ${selected ? 'is-selected' : ''}`}><Handle type="source" position={Position.Right} /><GitFork size={24} /><strong>{data.node.label}</strong><span>{data.en ? 'Trigger' : 'Kích hoạt'}</span><code>{data.node.caption === '—' ? '' : data.node.caption}</code></div>;
}
const nodeTypes = { step: StepCard, job: JobCard, trigger: TriggerCard };
function FitGraph({ graph }: { graph: GraphProjection }) {
  const { fitView } = useReactFlow();
  useEffect(() => { const frame = requestAnimationFrame(() => void fitView({ padding: 0.12, duration: 0 })); return () => cancelAnimationFrame(frame); }, [graph, fitView]);
  return null;
}

function Canvas({ graph, model, en, selectedId, onSelect, expanded, onToggleJob, overview }: { graph: GraphProjection; model: Workflow; en: boolean; selectedId?: string; onSelect: (id: string) => void; expanded: string[]; onToggleJob: (id: string) => void; overview: boolean }) {
  const { theme } = useTheme();
  const steps = useMemo(() => new Map(model.jobs.flatMap(j => j.steps.map(s => [s.id, s] as const))), [model]);
  const jobs = useMemo(() => new Map(model.jobs.map(j => [j.id, j])), [model]);
  const seed = useMemo(() => graph.nodes.map(n => ({ id: n.id, type: n.kind, position: n.position, parentId: n.parentId, extent: n.parentId ? 'parent' as const : undefined, width: n.width, height: n.height, style: { width: n.width, height: n.height }, data: { node: n, step: steps.get(n.id), job: jobs.get(n.id), en, toggleJob: onToggleJob, expanded: expanded.includes(n.id), overview } })), [graph, steps, jobs, en, onToggleJob, expanded, overview]);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(seed);
  useEffect(() => { setNodes(seed); }, [seed, setNodes]);
  const displayed = nodes.map(n => ({ ...n, selected: n.id === selectedId }));
  const edges = graph.edges.map(edge => ({ ...edge, sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: edge.kind === 'dependency' ? (theme === 'dark' ? '#aac4ff' : '#164bd4') : (theme === 'dark' ? '#36f5ed' : '#00686c'), width: 18, height: 18 }, className: 'cicd-edge-' + edge.kind, focusable: false, selectable: false }));
  return <ReactFlow<WorkflowNode> nodes={displayed} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onNodeClick={(_, node) => onSelect(node.id)} nodesConnectable={false} nodesDraggable={false} edgesReconnectable={false} deleteKeyCode={null} minZoom={0.12} maxZoom={1.8} fitView aria-label={en ? 'Workflow diagram' : 'Sơ đồ workflow'}>
    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--site-line)" /><Controls showInteractive={false} /><FitGraph graph={graph} />
  </ReactFlow>;
}
export function WorkflowCanvas(props: Parameters<typeof Canvas>[0]) {
  return <ReactFlowProvider><div className="cicd-canvas" data-testid="workflow-canvas" onKeyDownCapture={event => {
    const target = event.target as HTMLElement;
    if ((event.key === 'Enter' || event.key === ' ') && target.classList.contains('react-flow__node') && target.dataset.id) {
      event.preventDefault(); event.stopPropagation(); props.onSelect(target.dataset.id);
    }
  }}><Canvas {...props} /></div></ReactFlowProvider>;
}
