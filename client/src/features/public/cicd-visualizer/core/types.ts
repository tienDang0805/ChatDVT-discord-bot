export const LIMITS = { fileBytes: 1024 * 1024, workspaceBytes: 5 * 1024 * 1024, files: 10, astNodes: 30000, depth: 80, jobs: 200, steps: 3000, visibleNodes: 500, matrixCompute: 4096, matrixPreview: 50, timeout: 5000 };

export interface SourceDocument { id: string; filename: string; rawText: string; revision: number }
export interface SourceRef { documentId: string; revision: number; startOffset: number; endOffset: number; line: number; column: number; relatedRefs?: SourceRef[] }
export interface Diagnostic { code: string; severity: 'error' | 'warning' | 'info'; category: 'syntax' | 'semantic' | 'support' | 'limit' | 'unresolved'; params?: Record<string, string>; sourceRef?: SourceRef }
export interface Matrix { kind: 'static' | 'dynamic' | 'limited' | 'invalid'; count?: number; preview: Record<string, unknown>[]; raw: unknown }
export interface Step {
  id: string; declaredId?: string; name: string; order: number; kind: 'run' | 'action' | 'unknown';
  sourceRef: SourceRef; actionRef?: string; script?: string; condition?: unknown;
  with: Record<string, unknown>; env: Record<string, unknown>; settings: Record<string, unknown>; raw: Record<string, unknown>;
}
export interface Job {
  id: string; key: string; name: string; sourceRef: SourceRef; kind: 'job' | 'reusable';
  runner: unknown; needs: string[]; condition?: unknown; steps: Step[]; matrix?: Matrix;
  reusableCall?: string; settings: Record<string, unknown>; raw: Record<string, unknown>;
}
export interface Trigger { event: string; config: unknown; sourceRef: SourceRef }
export interface Workflow { id: string; name: string; sourceRef: SourceRef; triggers: Trigger[]; jobs: Job[]; settings: Record<string, unknown>; rawExtensions: Record<string, unknown> }
export interface AnalysisResult {
  schemaVersion: 1; documentId: string; revision: number;
  provider: 'github' | 'gitlab' | 'azure' | 'unknown'; status: 'ready' | 'invalid' | 'unsupported' | 'limited';
  completeness: 'complete' | 'partial'; model?: Workflow; diagnostics: Diagnostic[];
}
export type GraphMode = 'detailed' | 'overview';
export interface GraphNode {
  id: string; kind: 'trigger' | 'job' | 'step'; modelRef: string; parentId?: string;
  position: { x: number; y: number }; width: number; height: number;
  label: string; caption: string; category?: string; order?: number;
}
export interface GraphEdge { id: string; source: string; target: string; kind: 'trigger' | 'dependency' | 'sequence'; sourceHandle?: string; targetHandle?: string }
export interface GraphProjection { nodes: GraphNode[]; edges: GraphEdge[]; truncated: boolean }

export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function displayValue(value: unknown): string {
  if (value === undefined || value === null) return '—';
  return typeof value === 'string' ? value : JSON.stringify(value);
}
