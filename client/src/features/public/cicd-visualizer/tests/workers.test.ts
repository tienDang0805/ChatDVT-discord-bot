import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkerClient } from '../hooks/workerClient';
import type { WorkerLike } from '../hooks/workerClient';
import type { WorkerRequest, WorkerResponse } from '../workers/protocol';
class FakeWorker implements WorkerLike {
 onmessage: WorkerLike['onmessage']=null; onerror: WorkerLike['onerror']=null; message?: WorkerRequest; terminated=false;
 postMessage(message:WorkerRequest){this.message=message;}
 terminate(){this.terminated=true;}
 respond(requestId:number){this.onmessage?.({data:{type:'OPERATION_ERROR',requestId,code:'EXPECTED_RESPONSE'}} as MessageEvent<WorkerResponse>);}
}
const request: WorkerRequest={type:'ANALYZE',requestId:0,document:{id:'a',filename:'a.yml',revision:1,rawText:'on: push'}};
test('replacement cancels and terminates pending worker; late/stale response cannot complete new request', async()=>{
 const workers:FakeWorker[]=[];const client=new WorkerClient(()=>{const w=new FakeWorker();workers.push(w);return w;});
 const old=client.run(request);const cancelled=assert.rejects(old,/CANCELLED/);
 const next=client.run(request);await cancelled;assert.equal(workers[0].terminated,true);
 workers[1].respond(1);assert.equal(workers[1].terminated,false);
 const result=assert.rejects(next,/EXPECTED_RESPONSE/);workers[1].respond(2);await result;client.dispose();
});
test('timeout terminates worker and next request can recover',async()=>{
 const workers:FakeWorker[]=[];const client=new WorkerClient(()=>{const w=new FakeWorker();workers.push(w);return w;});
 await assert.rejects(client.run(request,15),/WORKER_TIMEOUT/);assert.equal(workers[0].terminated,true);
 const next=client.run(request);const result=assert.rejects(next,/EXPECTED_RESPONSE/);workers[1].respond(2);await result;client.dispose();
});
test('postMessage and construction failures produce bounded errors',async()=>{
 const failed=new WorkerClient(()=>{throw new Error('unavailable');});await assert.rejects(failed.run(request),/WORKER_UNAVAILABLE/);
 const broken=new WorkerClient(()=>({onmessage:null,onerror:null,postMessage(){throw new Error('clone');},terminate(){}}));
 await assert.rejects(broken.run(request),/WORKER_FAILED/);broken.dispose();
});
