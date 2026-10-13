import type { ELK } from 'elkjs/lib/elk-api.js';
import type { GraphProjection } from '../core/types';

/** ELK arranges job groups. Their folded step positions stay relative to the job. */
export async function layoutGraph(graph: GraphProjection, elk: Pick<ELK, 'layout'>): Promise<GraphProjection> {
  const top = graph.nodes.filter(n => !n.parentId);
  const ids = new Set(top.map(n => n.id));
  const layout = await elk.layout({
    id: 'workflow',
    layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.spacing.nodeNode': '50', 'elk.layered.spacing.nodeNodeBetweenLayers': '70', 'elk.padding': '[top=24,left=24,bottom=24,right=24]' },
    children: top.map(n => ({ id: n.id, width: n.width, height: n.height })),
    edges: graph.edges.filter(e => ids.has(e.source) && ids.has(e.target)).map(e => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  });
  const positions = new Map(layout.children?.map(n => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
  return { ...graph, nodes: graph.nodes.map(n => ({ ...n, position: positions.get(n.id) ?? n.position })) };
}
