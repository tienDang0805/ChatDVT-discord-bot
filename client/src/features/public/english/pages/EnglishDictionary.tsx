import { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { Search, Volume2, Loader2, BookOpen } from 'lucide-react';
import axios from 'axios';
import { playTTS } from '../utils/tts';

interface DictionaryResult {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string; synonyms?: string[] }[];
  }[];
}

export const EnglishDictionary = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try { setRecentSearches(JSON.parse(localStorage.getItem('eng_recent_searches') || '[]')); } catch {}
  }, []);

  const searchWord = useCallback(async (word: string) => {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true); setError(''); setResult(null); setQuery(trimmed);

    try {
      const cache = JSON.parse(localStorage.getItem('eng_dict_cache') || '{}');
      if (cache[trimmed]) { setResult(cache[trimmed]); setLoading(false); return; }

      const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${trimmed}`);
      const entry = data[0];
      setResult(entry);
      cache[trimmed] = entry;
      const keys = Object.keys(cache);
      if (keys.length > 100) delete cache[keys[0]];
      localStorage.setItem('eng_dict_cache', JSON.stringify(cache));

      const recent = [trimmed, ...recentSearches.filter(r => r !== trimmed)].slice(0, 10);
      setRecentSearches(recent);
      localStorage.setItem('eng_recent_searches', JSON.stringify(recent));
    } catch {
      setError('Word not found. Try a different word.');
    } finally { setLoading(false); }
  }, [recentSearches]);

  const playAudio = useCallback((url?: string, word?: string) => {
    if (url) { new Audio(url).play().catch(() => {}); }
    else if (word) { playTTS(word, 0.8); }
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); searchWord(query); };
  const audioUrl = result?.phonetics?.find(p => p.audio)?.audio;
  const phoneticText = result?.phonetic || result?.phonetics?.find(p => p.text)?.text;

  return (
    <PageShell title="Quick Dictionary" subtitle="Tra từ nhanh · Nghe phát âm chuẩn" icon="🔍" backTo="/english">
      <div className="space-y-6 fade-up">

        <form onSubmit={handleSubmit} className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search a word..."
            className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-500 transition-colors"
            autoFocus
          />
        </form>

        {recentSearches.length > 0 && !result && !loading && (
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(w => (
              <button key={w} onClick={() => searchWord(w)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-orange-500/50 hover:text-orange-500 transition-all font-bold">
                {w}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin text-orange-500" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Looking up...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <button
                onClick={() => playAudio(audioUrl, result.word)}
                className="mt-1 w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 transition-colors active:scale-90 shrink-0"
              >
                <Volume2 size={20} />
              </button>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">{result.word}</h2>
                {phoneticText && <p className="text-sm text-slate-400 dark:text-slate-500 font-mono">{phoneticText}</p>}
              </div>
            </div>

            {result.meanings?.map((meaning, mi) => (
              <div key={mi} className="p-5 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
                <label className="block text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-3">
                  {meaning.partOfSpeech}
                </label>
                <div className="space-y-3">
                  {meaning.definitions.slice(0, 3).map((def, di) => (
                    <div key={di}>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="text-slate-400 dark:text-slate-500 font-bold mr-1.5">{di + 1}.</span>
                        {def.definition}
                      </p>
                      {def.example && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-1 pl-4 leading-relaxed">"{def.example}"</p>
                      )}
                      {def.synonyms && def.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 pl-4">
                          {def.synonyms.slice(0, 5).map((syn, si) => (
                            <button key={si} onClick={() => searchWord(syn)} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1f2937] text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors font-bold">
                              {syn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-3" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Gõ từ tiếng Anh để tra nghĩa</p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default EnglishDictionary;
