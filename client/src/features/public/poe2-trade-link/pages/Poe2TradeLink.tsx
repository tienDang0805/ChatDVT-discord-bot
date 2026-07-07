import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Search,
} from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';
import type { BuildTradeLinkResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const DEFAULT_INPUT = 'ring, weighted flat damage > 50, count 1 res bất kỳ >= 40, online only, max 1 divine';
const LEAGUES = ['Runes of Aldur', 'Standard', 'Hardcore'] as const;
const EXAMPLES = [
  DEFAULT_INPUT,
  'abyss tablet profit, desecrated currency 25, rare monster 20, additional modifiers 2',
  'tablet có count 1 dòng rarity trên 15',
] as const;

type SuccessfulResult = Extract<BuildTradeLinkResult, { ok: true }>;

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <pre className="max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-emerald-300 dark:border-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

export const Poe2TradeLink = () => {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [league, setLeague] = useState<(typeof LEAGUES)[number]>('Runes of Aldur');
  const [result, setResult] = useState<SuccessfulResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  useEffect(() => {
    if (window.location.pathname.endsWith('/mock')) {
      setError('This is a mock trade link. Return to the builder to generate another search.');
    }
  }, []);

  const outputUrl = useMemo(() => {
    if (!result) return '';
    return new URL(result.url, window.location.origin).toString();
  }, [result]);

  const generate = async () => {
    if (!input.trim()) {
      setError('Enter a trade idea first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch(`${API_BASE}/api/poe2-trade/build-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim(), league }),
      });
      const data = await response.json() as BuildTradeLinkResult;
      if (!response.ok || !data.ok) {
        throw new Error(data.ok ? 'Could not build trade link.' : data.error);
      }
      setResult(data);
    } catch (requestError) {
      setError(
        `Could not build trade link: ${
          requestError instanceof Error ? requestError.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!outputUrl) return;
    await navigator.clipboard.writeText(outputUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const openTradeSearch = () => {
    if (!outputUrl) return;
    window.open(outputUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageShell
      title="PoE2 Trade Link Builder"
      subtitle="Natural language to official trade search"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#161b22]">
          <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 dark:border-slate-800 dark:from-amber-500/10 dark:to-orange-500/5 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                <Search size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Describe the item you want</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The server parses your intent and creates a PoE2 trade search.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 md:p-7">
            <div>
              <label htmlFor="trade-input" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                Trade idea
              </label>
              <textarea
                id="trade-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="VD: ring, weighted flat damage > 50, count 1 res bất kỳ >= 40, online only, max 1 divine"
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#0d1117] dark:text-slate-100"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((example, index) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setInput(example)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-amber-500/70 dark:hover:text-amber-400"
                  >
                    Example {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="trade-league" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                League
              </label>
              <select
                id="trade-league"
                value={league}
                onChange={(event) => setLeague(event.target.value as (typeof LEAGUES)[number])}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#0d1117] dark:text-slate-100"
              >
                {LEAGUES.map((leagueName) => (
                  <option key={leagueName} value={leagueName}>{leagueName}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={generate}
              disabled={loading || !input.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-amber-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={19} className="animate-spin" /> : <Link2 size={19} />}
              {loading ? 'Generating...' : 'Generate Trade Link'}
            </button>
          </div>
        </section>

        {result && (
          <section className="fade-up space-y-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-500/25 dark:bg-[#161b22] md:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Official Trade Link
              </p>
              <a
                href={outputUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all text-sm text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-amber-600 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-amber-400"
              >
                {outputUrl}
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={openTradeSearch}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
              >
                <ExternalLink size={18} />
                Open Trade Search
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-500/70 dark:hover:text-amber-400"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>

            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDebugOpen((open) => !open)}
                className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-600 dark:text-slate-300"
                aria-expanded={debugOpen}
              >
                Debug
                {debugOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {debugOpen && (
                <div className="mt-4 space-y-5">
                  <JsonBlock title="Parsed Intent" value={result.intent} />
                  <JsonBlock title="Resolved Stats" value={result.resolved} />
                  <JsonBlock title="Compiled Query" value={result.compiledQuery} />
                  <JsonBlock title="Search Response" value={result.rawResponse} />
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
};

export default Poe2TradeLink;

