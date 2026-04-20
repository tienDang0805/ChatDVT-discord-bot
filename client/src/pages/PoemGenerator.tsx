import { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, Check, RotateCcw, BookOpen, Feather } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';
import { PageShell } from '../components/PageShell';

const API_BASE = import.meta.env.VITE_API_URL || '';

const POEM_TYPES = [
  { id: 'luc-bat', label: 'Lục Bát', emoji: '🎋' },
  { id: 'tu-do', label: 'Tự Do', emoji: '🕊️' },
  { id: '5-chu', label: '5 Chữ', emoji: '✋' },
  { id: '7-chu', label: '7 Chữ', emoji: '🌸' },
  { id: '8-chu', label: '8 Chữ', emoji: '🌊' },
  { id: 'duong-luat', label: 'Đường Luật', emoji: '🏯' },
  { id: 'song-that-luc-bat', label: 'Song Thất Lục Bát', emoji: '🎎' },
  { id: 'haiku', label: 'Haiku', emoji: '🍃' },
  { id: 'sonnet', label: 'Sonnet', emoji: '🌹' },
];

const STYLES = [
  { id: 'lang-man', label: 'Lãng Mạn', emoji: '💕' },
  { id: 'tru-tinh', label: 'Trữ Tình', emoji: '🌙' },
  { id: 'hien-dai', label: 'Hiện Đại', emoji: '⚡' },
  { id: 'co-dien', label: 'Cổ Điển', emoji: '📜' },
  { id: 'hai-huoc', label: 'Hài Hước', emoji: '😂' },
  { id: 'triet-ly', label: 'Triết Lý', emoji: '🧘' },
  { id: 'bi-ai', label: 'Bi Ai', emoji: '😢' },
  { id: 'hung-trang', label: 'Hùng Tráng', emoji: '⚔️' },
];

const MOODS = ['Vui vẻ', 'Buồn', 'Nhớ nhung', 'Cô đơn', 'Yêu đương', 'Giận dữ', 'Bình yên', 'Hoài niệm'];

const QUICK_CONTEXTS = [
  'Mùa thu lá vàng rơi',
  'Đêm trăng sáng, cô gái bên dòng sông',
  'Người lính xa nhà nhớ quê',
  'Tình yêu đầu tan vỡ',
  'Ký ức tuổi thơ êm đềm',
  'Bình minh trên biển',
];

interface PoemResult {
  title: string;
  poem: string;
  explanation: string;
  techniques: string[];
}

export const PoemGenerator = () => {
  const [poemType, setPoemType] = useState('');
  const [customPoemType, setCustomPoemType] = useState('');
  const [style, setStyle] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [context, setContext] = useState('');
  const [wish, setWish] = useState('');
  const [mood, setMood] = useState('');
  const [keywords, setKeywords] = useState('');
  const [language, setLanguage] = useState('vi');
  const [lineCount, setLineCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PoemResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Tạo Thơ AI | devtiendang.blog';
  }, []);

  const generate = async () => {
    const finalType = customPoemType.trim() || poemType;
    const finalStyle = customStyle.trim() || style;
    if (!finalType) { setError('Chọn hoặc nhập thể loại thơ!'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/poem-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poemType: finalType, style: finalStyle, context, wish, mood, keywords, language, lineCount, geminiApiKey: getStoredGeminiKey() }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Lỗi server'); }
      const data: PoemResult = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (err: any) {
      setError(err.message || 'Thi hứng đang dở dang, thử lại nhé!');
    } finally {
      setLoading(false);
    }
  };

  const copyPoem = () => {
    if (!result) return;
    const text = `${result.title}\n\n${result.poem}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null);
    setError('');
  };

  return (
    <PageShell title="Tạo Thơ AI" subtitle="Đại Thi Hào · Bậc Thầy Thi Ca" icon="🪶" maxWidth="3xl">
      <style>{`
        @keyframes quillWrite{0%{transform:rotate(-5deg) translateY(0)}50%{transform:rotate(5deg) translateY(-3px)}100%{transform:rotate(-5deg) translateY(0)}}
        .quill-write{animation:quillWrite 1.5s ease-in-out infinite}
        @keyframes poemFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .poem-fade{animation:poemFadeIn .8s ease-out both}
      `}</style>

      {!result && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-8 shadow-sm space-y-6">

            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-500 dark:text-orange-400 text-xs font-bold uppercase tracking-widest">🇻🇳 Tiếng Việt</span>
              <div className="flex bg-slate-100 dark:bg-[#0d1117] rounded-lg p-0.5">
                <button onClick={() => setLanguage('vi')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'vi' ? 'bg-orange-500 text-white shadow' : 'text-slate-500'}`}>🇻🇳 Việt</button>
                <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-orange-500 text-white shadow' : 'text-slate-500'}`}>🇬🇧 English</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-3">Thể Loại Thơ *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {POEM_TYPES.map(t => (
                  <button key={t.id} onClick={() => { setPoemType(t.id); setCustomPoemType(''); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl text-sm font-semibold transition-all ${poemType === t.id && !customPoemType ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-500/50'}`}>
                    <span className="text-lg">{t.emoji}</span>
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                ))}
              </div>
              <input type="text" value={customPoemType} onChange={e => { setCustomPoemType(e.target.value); if (e.target.value) setPoemType(''); }} placeholder="✍️ Hoặc gõ thể loại riêng: VD: Thơ 4 chữ, Thơ tình..." className={`mt-2 w-full bg-slate-50 dark:bg-[#0d1117] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all ${customPoemType ? 'border-orange-500 dark:border-orange-500' : 'border-slate-200 dark:border-slate-700'}`} maxLength={50} />
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-3">Phong Cách</label>
              <div className="grid grid-cols-4 gap-2">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => { setStyle(style === s.id ? '' : s.id); setCustomStyle(''); }} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-semibold transition-all ${style === s.id && !customStyle ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-500/50'}`}>
                    <span className="text-base">{s.emoji}</span>
                    <span className="text-[10px]">{s.label}</span>
                  </button>
                ))}
              </div>
              <input type="text" value={customStyle} onChange={e => { setCustomStyle(e.target.value); if (e.target.value) setStyle(''); }} placeholder="✍️ Hoặc gõ phong cách riêng: VD: Rap, Underground..." className={`mt-2 w-full bg-slate-50 dark:bg-[#0d1117] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all ${customStyle ? 'border-purple-500 dark:border-purple-500' : 'border-slate-200 dark:border-slate-700'}`} maxLength={50} />
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-2">Tâm Trạng</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button key={m} onClick={() => setMood(mood === m ? '' : m)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${mood === m ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-orange-500/50'}`}>{m}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-2">Mô Tả Bối Cảnh</label>
              <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="VD: Chiều hoàng hôn, cánh đồng lúa chín vàng, đôi bạn trẻ ngồi bên nhau..." rows={3} className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none" maxLength={300} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_CONTEXTS.map(q => (
                  <button key={q} onClick={() => setContext(q)} className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">{q}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-2">Mong Muốn Của Bạn</label>
              <input type="text" value={wish} onChange={e => setWish(e.target.value)} placeholder="VD: Thơ tặng mẹ nhân ngày sinh nhật, lời lẽ ấm áp..." className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" maxLength={200} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-2">Từ Khóa</label>
                <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="VD: trăng, gió, lá vàng" className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-2">Số Câu</label>
                <input type="number" value={lineCount} onChange={e => setLineCount(e.target.value)} placeholder="Tự động" min={2} max={40} className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
              </div>
            </div>

            <GeminiKeyInput accent="orange" />

            {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm">{error}</div>}

            <button onClick={generate} disabled={!poemType && !customPoemType.trim()} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:shadow-none transition-all disabled:cursor-not-allowed active:scale-[0.98] uppercase tracking-wider">
              <Sparkles size={22} />
              Sáng Tác
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-5xl quill-write">🪶</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-orange-500">Đại Thi Hào Đang Sáng Tác...</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 animate-pulse">Vần thơ đang chảy trên đầu ngọn bút</p>
          </div>
        </div>
      )}

      {result && (
        <div ref={resultRef} className="poem-fade space-y-6">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 flex items-center gap-3">
              <Feather size={20} className="text-white" />
              <h2 className="text-white font-black text-lg tracking-wide">{result.title}</h2>
            </div>

            <div className="px-6 md:px-10 py-8 md:py-12">
              <div className="text-center space-y-1">
                {result.poem.split('\n').map((line, i) => (
                  <p key={i} className={`text-base md:text-lg leading-relaxed md:leading-loose ${line.trim() === '' ? 'h-4' : 'text-slate-700 dark:text-slate-200'}`} style={{ fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'italic' }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 space-y-3">
              {result.explanation && (
                <div className="flex gap-2">
                  <BookOpen size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{result.explanation}</p>
                </div>
              )}
              {result.techniques?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.techniques.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-200 dark:border-purple-500/25">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={copyPoem} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-orange-500/50 transition-all active:scale-[0.98]">
              {copied ? <><Check size={16} className="text-emerald-500" /> Đã Copy!</> : <><Copy size={16} className="text-slate-400" /> Copy Thơ</>}
            </button>
            <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]">
              <RotateCcw size={16} /> Sáng Tác Mới
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default PoemGenerator;
