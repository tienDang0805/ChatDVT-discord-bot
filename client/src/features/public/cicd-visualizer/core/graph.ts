import { asRecord, displayValue, LIMITS } from './types';
import type { GraphEdge, GraphMode, GraphNode, GraphProjection, Workflow } from './types';

/** Fold steps into reading rows. Only declared jobs/steps become execution nodes. */
export function buildGraph(workflow: Workflow, mode: GraphMode, expanded: string[]): GraphProjection {
  const nodes: GraphNode[] = [], edges: GraphEdge[] = [];
  const triggerNodes = workflow.triggers.map((t, i): GraphNode => ({ id: `${workflow.id}/trigger/${i}`, modelRef: `${workflow.id}/trigger/${i}`, kind: 'trigger', position: { x: 0, y: 0 }, width: 220, height: 106, label: t.event, caption: displayValue(asRecord(t.config).branches ?? asRecord(t.config).paths ?? t.config) }));
  nodes.push(...triggerNodes);
  const existing = new Map(workflow.jobs.map(j => [j.key, j]));
  let truncated = false;
  for (const job of workflow.jobs) {
    const show = mode === 'detailed' && expanded.includes(job.id) && job.steps.length > 0;
    const room = LIMITS.visibleNodes - nodes.length - (workflow.jobs.length - workflow.jobs.indexOf(job));
    const steps = show ? job.steps.slice(0, Math.max(0, room)) : [];
    if (show && steps.length !== job.steps.length) truncated = true;
    const columns = Math.min(4, steps.length || 1);
    const width = show ? Math.max(350, columns * 238 + (columns - 1) * 38 + 48) : 350;
    const height = show ? 92 + Math.ceil(steps.length / columns) * 210 + 24 : 140;
    nodes.push({ id: job.id, modelRef: job.id, kind: 'job', position: { x: 0, y: 0 }, width, height, label: job.name, caption: displayValue(job.reusableCall ?? job.runner), category: job.kind });
    steps.forEach((step, i) => {
      const row = Math.floor(i / columns), slot = i % columns;
      const column = row % 2 === 0 ? slot : columns - slot - 1;
      nodes.push({ id: step.id, modelRef: step.id, parentId: job.id, kind: 'step', position: { x: 24 + column * 276, y: 92 + row * 210 }, width: 238, height: 172, label: step.name, caption: step.actionRef ?? (step.script?.split('\n').find(line => line.trim() && !line.trim().startsWith('#')) ?? '—'), category: step.kind, order: step.order });
      if (i > 0) {
        const turn = slot === 0;
        edges.push({ id: `seq/${steps[i - 1].id}/${step.id}`, source: steps[i - 1].id, target: step.id, kind: 'sequence', sourceHandle: turn ? 'bottom' : row % 2 === 0 ? 'right' : 'left', targetHandle: turn ? 'top' : row % 2 === 0 ? 'left' : 'right' });
      }
    });
    for (const dependency of job.needs) {
      const predecessor = existing.get(dependency);
      if (predecessor) edges.push({ id: `needs/${predecessor.id}/${job.id}`, source: predecessor.id, target: job.id, kind: 'dependency' });
    }
    if (!job.needs.length) for (const t of triggerNodes) edges.push({ id: `${t.id}/${job.id}`, source: t.id, target: job.id, kind: 'trigger' });
  }
  return { nodes, edges, truncated };
}
