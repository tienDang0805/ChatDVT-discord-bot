import { LIMITS } from '../core/types';
import type { WorkerRequest, WorkerResponse } from '../workers/protocol';

export interface WorkerLike {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: WorkerRequest): void;
  terminate(): void;
}

export class WorkerClient {
  private factory: () => WorkerLike;
  private worker?: WorkerLike;
  private reject?: (error: Error) => void;
  private timer?: ReturnType<typeof setTimeout>;
  private sequence = 0;
  constructor(factory: () => WorkerLike) { this.factory = factory; }
  cancel() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.reject) {
      const reject = this.reject; this.reject = undefined;
      if (this.worker) { this.worker.onmessage = null; this.worker.onerror = null; this.worker.terminate(); }
      this.worker = undefined;
      reject(new Error('CANCELLED'));
    }
  }
  dispose() { this.cancel(); this.worker?.terminate(); this.worker = undefined; }
  run(request: WorkerRequest, timeout = LIMITS.timeout): Promise<WorkerResponse> {
    this.cancel();
    const requestId = ++this.sequence;
    return new Promise((resolve, reject) => {
      try { this.worker ??= this.factory(); } catch { reject(new Error('WORKER_UNAVAILABLE')); return; }
      this.reject = reject;
      const finish = (error?: string, response?: WorkerResponse) => {
        if (this.timer) clearTimeout(this.timer);
        this.timer = undefined; this.reject = undefined;
        if (error) { this.worker?.terminate(); this.worker = undefined; reject(new Error(error)); }
        else if (response) resolve(response);
      };
      this.worker.onmessage = event => {
        if (event.data.requestId !== requestId) return;
        if (event.data.type === 'OPERATION_ERROR') finish(event.data.code);
        else finish(undefined, event.data);
      };
      this.worker.onerror = () => finish('WORKER_FAILED');
      this.timer = setTimeout(() => finish('WORKER_TIMEOUT'), timeout);
      try { this.worker.postMessage({ ...request, requestId }); } catch { finish('WORKER_FAILED'); }
    });
  }
}
