import { buildGraph } from '../core/graph';
import { layoutGraph } from '../layout/layoutGraph';
import ELK from 'elkjs/lib/elk-api.js';
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url';
import type { WorkerRequest, WorkerResponse } from './protocol';
// Use the small API client and a native ELK worker, so the algorithm bundle
// is loaded once and never enters the page or fake-worker environment.
const elk = new ELK({ workerFactory: () => new Worker(elkWorkerUrl) });
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'LAYOUT') return;
  try {
    const graph = await layoutGraph(buildGraph(request.workflow, request.mode, request.expanded), elk);
    self.postMessage({ type: 'LAYOUT_RESULT', requestId: request.requestId, documentId: request.documentId, revision: request.revision, viewRevision: request.viewRevision, graph } satisfies WorkerResponse);
  } catch { self.postMessage({ type: 'OPERATION_ERROR', requestId: request.requestId, code: 'LAYOUT_FAILED' } satisfies WorkerResponse); }
};
