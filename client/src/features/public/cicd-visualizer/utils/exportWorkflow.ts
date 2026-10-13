import { toSvg } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import type { AnalysisResult, GraphProjection, Workflow } from '../core/types';

export function summaryExport(model: Workflow, result: AnalysisResult, graph: GraphProjection) {
  // Explicit allowlist: do not serialize model.raw, env, scripts, diagnostics params or sourceText.
  const names = new Map(model.jobs.flatMap(job => job.steps.map(step => [step.id, typeof step.raw.name === 'string' ? step.name : step.actionRef ?? `Step ${step.order}`] as const)));
  return { exportSchemaVersion: 1, provider: result.provider, workflow: model.name, scope: graph.truncated ? 'limited projection' : 'current projection', counts: { jobs: model.jobs.length, steps: model.jobs.reduce((n, j) => n + j.steps.length, 0) }, nodes: graph.nodes.map(n => ({ id: n.id, kind: n.kind, name: names.get(n.id) ?? n.label, parentId: n.parentId })), edges: graph.edges.map(e => ({ source: e.source, target: e.target, kind: e.kind })), diagnostics: result.diagnostics.map(d => ({ code: d.code, severity: d.severity, line: d.sourceRef?.line })) };
}

export async function graphImage(container: HTMLElement, backgroundColor: string): Promise<string> {
  const viewport = container.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewport) throw new Error('EXPORT_FAILED');
  const elements = [...container.querySelectorAll<HTMLElement>('.react-flow__node')];
  const nodes = elements.map(el => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    let x = matrix.m41, y = matrix.m42;
    const parentId = el.dataset.parentid;
    if (parentId) { const parent = elements.find(n => n.dataset.id === parentId); if (parent) { const p = new DOMMatrix(getComputedStyle(parent).transform); x += p.m41; y += p.m42; } }
    return { id: el.dataset.id ?? '', position: { x, y }, width: el.offsetWidth, height: el.offsetHeight, data: {} };
  });
  const bounds = getNodesBounds(nodes);
  const width = 1600, height = Math.max(800, Math.min(6000, Math.ceil(bounds.height / Math.max(bounds.width, 1) * width + 160)));
  const view = getViewportForBounds(bounds, width, height, 0.01, 1.5, 0.08);
  await document.fonts.ready;
  const svgUrl = await toSvg(viewport, { backgroundColor, width, height, cacheBust: false, style: { width: width + 'px', height: height + 'px', transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: '0 0' } });
  // html-to-image deep-clones SVG children without their stylesheet rules.
  // Materialize edge strokes in the export SVG before rasterizing it.
  const svgDocument = new DOMParser().parseFromString(decodeURIComponent(svgUrl.slice(svgUrl.indexOf(',') + 1)), 'image/svg+xml');
  const originalPaths = [...viewport.querySelectorAll<SVGPathElement>('.react-flow__edge-path')];
  svgDocument.querySelectorAll('.react-flow__edge-path').forEach((path, i) => {
    if (!originalPaths[i]) return;
    const style = getComputedStyle(originalPaths[i]);
    path.setAttribute('stroke', style.stroke); path.setAttribute('stroke-width', style.strokeWidth); path.setAttribute('fill', 'none');
  });
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve(); image.onerror = () => reject(new Error('EXPORT_FAILED'));
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svgDocument));
  });
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d'); if (!context) throw new Error('EXPORT_FAILED');
  context.fillStyle = backgroundColor; context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0); return canvas.toDataURL('image/png');
}
export function downloadFile(content: Blob | string, filename: string) {
  const link = document.createElement('a');
  const url = typeof content === 'string' ? content : URL.createObjectURL(content);
  link.href = url; link.download = filename; link.click();
  if (typeof content !== 'string') setTimeout(() => URL.revokeObjectURL(url), 1000);
}
