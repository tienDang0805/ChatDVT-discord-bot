import { useState, useEffect } from 'react';
import { Loader2, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';
import { PageShell } from '../components/PageShell';

const API = import.meta.env.VITE_API_URL || '';

const STYLES = [
  { id: 'deep', label: '🌙 Deep', desc: 'Sâu lắng, triết lý' },
  { id: 'funny', label: '😂 Hài', desc: 'Tự giễu, cười ra nước mắt' },
  { id: 'savage', label: '🔥 Savage', desc: 'Gắt, slay, queen energy' },
  { id: 'poetic', label: '🌸 Thơ', desc: 'Lãng mạn, vần điệu' },
  { id: 'chill', label: '☁️ Chill', desc: 'Bình thản, kệ hết' },
];

const MOOD_CLASSES: Record<string, { text: string; bg: string; border: string }> = {
  melancholy: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/25' },
  hopeful: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/25' },
  savage: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/25' },
  dreamy: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/25' },
  numb: { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-500/10', border: 'border-slate-300 dark:border-slate-500/25' },
  fierce: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/25' },
  peaceful: { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10', border: 'border-teal-200 dark:border-teal-500/25' },
};

const TECHNIQUE_LABELS: Record<string, { icon: string; label: string }> = {
  metaphor: { icon: '🪞', label: 'Ẩn dụ' },
  metonymy: { icon: '🔄', label: 'Hoán dụ' },
  rhyme: { icon: '🎵', label: 'Vần' },
  antithesis: { icon: '⚖️', label: 'Tương phản' },
  wordplay: { icon: '🎯', label: 'Chơi chữ' },
};

const getMoodClass = (mood: string) => MOOD_CLASSES[mood] || MOOD_CLASSES.melancholy;
const getTechnique = (t: string) => TECHNIQUE_LABELS[t] || { icon: '✨', label: t };

export const DeepStatusPage = () => {
  const [context, setContext] = useState('');
  const [style, setStyle] = useState('deep');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<{ text: string; mood: string; technique?: string }[]>([]);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => { document.title = 'Gen Status Deep | devtiendang.blog'; }, []);

  const generate = async () => {
    if (!context.trim() || loading) return;
    setError(''); setLoading(true); setStatuses([]);
    try {
      const res = await fetch(`${API}/api/deep-status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: context.trim(), style, language, geminiApiKey: getStoredGeminiKey() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatuses(data.statuses || []);
    } catch (e: any) { setError(e.message || 'Lỗi!'); }
    finally { setLoading(false); }
  };

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const SUGGESTIONS_VI = ['Vừa chia tay xong', 'Mệt mỏi với công việc', 'Đêm nay mất ngủ', 'Thấy cô đơn giữa đám đông', 'Crush không nhắn lại', 'Cuộc sống bình yên quá'];
  const SUGGESTIONS_EN = ['Just got heartbroken', 'Tired of pretending', 'Late night overthinking', 'Feeling lost', 'Missing someone', 'Growing in silence'];
  const suggestions = language === 'en' ? SUGGESTIONS_EN : SUGGESTIONS_VI;

  return (
    <PageShell title="Gen Status Deep" subtitle="Caption · Status · Quotes" icon="✍️" maxWidth="2xl">
      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-bold text-orange-500 uppercase tracking-widest">Ngôn ngữ</label>
          <div className="flex bg-slate-100 dark:bg-[#1f2937] rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {([['vi', '🇻🇳 Tiếng Việt'], ['en', '🇬🇧 English']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setLanguage(val)} className={`px-3.5 py-1.5 text-xs font-semibold transition-colors border-none ${language === val ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}>{label}</button>
            ))}
          </div>
        </div>

        <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">{language === 'en' ? 'Mood / Context' : 'Tâm trạng / Ngữ cảnh'}</label>
        <textarea value={context} onChange={e => setContext(e.target.value)} placeholder={language === 'en' ? "What's on your mind?" : 'Đang nghĩ gì? Đang buồn/vui/giận/cô đơn vì...?'} rows={3} disabled={loading} className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-sm outline-none focus:border-orange-500 transition-colors resize-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600" />

        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setContext(s)} className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-400 dark:text-slate-500 text-[11px] hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors">{s}</button>
          ))}
        </div>

        <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">{language === 'en' ? 'Style' : 'Phong cách'}</label>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setStyle(s.id)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${style === s.id ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/40 text-orange-500 dark:text-orange-400' : 'bg-slate-50 dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/30'}`}>{s.label}</button>
          ))}
        </div>

        <GeminiKeyInput accent="purple" />
        {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center mt-2">⚠️ {error}</div>}

        <button onClick={generate} disabled={loading || !context.trim()} className="w-full mt-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-wider flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> {language === 'en' ? 'Generating...' : 'Đang deep...'}</> : <><Sparkles size={18} /> {language === 'en' ? 'GENERATE' : 'TẠO STATUS'}</>}
        </button>
      </div>

      {statuses.length > 0 && (
        <div className="fade-up mb-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">{language === 'en' ? 'Results' : 'Kết quả'}</p>
            <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131923] text-slate-500 dark:text-slate-400 text-xs font-semibold hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors"><RefreshCw size={12} /> {language === 'en' ? 'Regenerate' : 'Gen lại'}</button>
          </div>
          <div className="space-y-2.5">
            {statuses.map((s, i) => {
              const mc = getMoodClass(s.mood);
              const tc = s.technique ? getTechnique(s.technique) : null;
              return (
                <div key={i} className="fade-up bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-colors" style={{ animationDelay: `${i * 80}ms` }}>
                  <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium mb-3">{s.text}</p>
                  <div className="flex justify-between items-center flex-wrap gap-1.5">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${mc.text} ${mc.bg} ${mc.border}`}>{s.mood}</span>
                      {tc && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">{tc.icon} {tc.label}</span>}
                    </div>
                    <button onClick={() => copy(s.text, i)} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${copiedIdx === i ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/30'}`}>
                      {copiedIdx === i ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-center text-slate-300 dark:text-slate-700 text-[10px] mt-6 font-mono">
        {language === 'en' ? 'AI-generated captions with literary techniques · Copy & paste' : 'AI tạo status với biện pháp tu từ · Copy paste lên MXH'}
      </p>
    </PageShell>
  );
};
