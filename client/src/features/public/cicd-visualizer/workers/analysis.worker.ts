import { analyzeWorkflow } from '../core/analyzeWorkflow';
import type { WorkerRequest, WorkerResponse } from './protocol';
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'ANALYZE') return;
  try {
    const response: WorkerResponse = { type: 'ANALYSIS_RESULT', requestId: request.requestId, documentId: request.document.id, revision: request.document.revision, result: analyzeWorkflow(request.document) };
    self.postMessage(response);
  } catch { self.postMessage({ type: 'OPERATION_ERROR', requestId: request.requestId, code: 'ANALYSIS_FAILED' } satisfies WorkerResponse); }
};
