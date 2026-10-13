import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalysisResult, GraphMode, GraphProjection, SourceDocument } from '../core/types';
import { WorkerClient } from './workerClient';

export interface AnalysisPacket { result: AnalysisResult; document: SourceDocument }
interface RecordEntry { latest?: AnalysisPacket; good?: AnalysisPacket }

export function useWorkflowAnalysis(document: SourceDocument, mode: GraphMode, expanded: string[]) {
  const clients = useMemo(() => ({
    analysis: new WorkerClient(() => new Worker(new URL('../workers/analysis.worker.ts', import.meta.url), { type: 'module' })),
    layout: new WorkerClient(() => new Worker(new URL('../workers/layout.worker.ts', import.meta.url), { type: 'module' })),
  }), []);
  const [records, setRecords] = useState<Record<string, RecordEntry>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [layingOut, setLayingOut] = useState(false);
  const [error, setError] = useState<string>();
  const [graph, setGraph] = useState<GraphProjection>();
  const active = useRef(document); active.current = document;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clients.analysis.dispose(); clients.layout.dispose(); };
  }, [clients]);
  useEffect(() => { clients.analysis.cancel(); setAnalyzing(false); setError(undefined); }, [document.id, document.revision, clients]);
  const analyze = useCallback(async (snapshot: SourceDocument) => {
    setAnalyzing(true); setError(undefined);
    try {
      const response = await clients.analysis.run({ type: 'ANALYZE', requestId: 0, document: snapshot });
      if (!mounted.current || active.current.id !== snapshot.id || active.current.revision !== snapshot.revision || response.type !== 'ANALYSIS_RESULT') return;
      const packet = { result: response.result, document: snapshot };
      setRecords(previous => ({ ...previous, [snapshot.id]: { latest: packet, good: response.result.status === 'ready' ? packet : previous[snapshot.id]?.good } }));
      setAnalyzing(false);
    } catch (e) {
      if ((e as Error).message !== 'CANCELLED' && mounted.current && active.current.id === snapshot.id && active.current.revision === snapshot.revision) { setError((e as Error).message); setAnalyzing(false); }
    }
  }, [clients]);
  const entry = records[document.id];
  const shown = entry?.latest?.result.model ? entry.latest : entry?.good;
  const latest = entry?.latest;
  const model = shown?.result.model;
  const layoutGeneration = useRef(0);
  const expandedKey = expanded.join('\u0000');
  useEffect(() => {
    const generation = ++layoutGeneration.current;
    clients.layout.cancel(); setGraph(undefined);
    if (!model || !shown) { setLayingOut(false); return; }
    setLayingOut(true); setError(undefined);
    void clients.layout.run({ type: 'LAYOUT', requestId: 0, documentId: shown.document.id, revision: shown.document.revision, viewRevision: generation, workflow: model, mode, expanded: expandedKey.split('\u0000').filter(Boolean) }).then(response => {
      if (!mounted.current || generation !== layoutGeneration.current || response.type !== 'LAYOUT_RESULT' || response.viewRevision !== generation) return;
      setGraph(response.graph); setLayingOut(false);
    }).catch(e => {
      if ((e as Error).message !== 'CANCELLED' && mounted.current && generation === layoutGeneration.current) { setError((e as Error).message); setLayingOut(false); }
    });
    return () => { clients.layout.cancel(); };
  }, [model, shown, mode, expandedKey, clients]);
  return { analyze, analyzing, layingOut, graph, error, latest, shown, stale: (!!latest && latest.document.revision !== document.revision) || (!!shown && shown !== latest) };
}
