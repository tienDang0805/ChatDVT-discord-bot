import { useState, useEffect } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { PageShell } from '../../../../shared/components/PageShell';

const API = import.meta.env.VITE_API_URL || '';

const QUICK_ANSWERS = [
  { answer: '🔮 Chắc chắn rồi.', type: 'positive', emoji: '🔮' },
  { answer: '✨ Mọi dấu hiệu đều nói CÓ.', type: 'positive', emoji: '✨' },
  { answer: '🌟 Không nghi ngờ gì cả.', type: 'positive', emoji: '🌟' },
  { answer: '☀️ Vâng, chắc chắn.', type: 'positive', emoji: '☀️' },
  { answer: '💫 Bạn có thể trông cậy vào điều đó.', type: 'positive', emoji: '💫' },
  { answer: '🌈 Như ta thấy, CÓ.', type: 'positive', emoji: '🌈' },
  { answer: '👍 Rất có thể.', type: 'positive', emoji: '👍' },
  { answer: '🍀 Triển vọng tốt.', type: 'positive', emoji: '🍀' },
  { answer: '⭐ CÓ.', type: 'positive', emoji: '⭐' },
  { answer: '💎 Các dấu hiệu chỉ về CÓ.', type: 'positive', emoji: '💎' },
  { answer: '🌀 Hỏi lại sau nhé...', type: 'neutral', emoji: '🌀' },
  { answer: '🔄 Chưa rõ, thử lại đi.', type: 'neutral', emoji: '🔄' },
  { answer: '🤔 Tập trung hơn rồi hỏi lại.', type: 'neutral', emoji: '🤔' },
  { answer: '💭 Giờ chưa thể tiên đoán.', type: 'neutral', emoji: '💭' },
  { answer: '🌫️ Sương mù che phủ câu trả lời...', type: 'neutral', emoji: '🌫️' },
  { answer: '🙅 Đừng trông cậy vào điều đó.', type: 'negative', emoji: '🙅' },
  { answer: '❌ Câu trả lời là KHÔNG.', type: 'negative', emoji: '❌' },
  { answer: '🌑 Nguồn tin nói KHÔNG.', type: 'negative', emoji: '🌑' },
  { answer: '👎 Triển vọng không tốt.', type: 'negative', emoji: '👎' },
  { answer: '⛈️ Rất không chắc.', type: 'negative', emoji: '⛈️' },
];

export const MagicBallPage = () => {
  const [question, setQuestion] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [result, setResult] = useState<{answer:string;type:string;emoji:string}|null>(null);
  const [mode, setMode] = useState<'quick'|'ai'>('quick');
  const [history, setHistory] = useState<{q:string;a:string;type:string}[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Cầu Pha Lê AI | devtiendang.blog'; }, []);

  const shake = async () => {
    if (!question.trim() || isShaking) return;
    setError(''); setResult(null); setIsShaking(true);

    if (mode === 'quick') {
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
      const ans = QUICK_ANSWERS[Math.floor(Math.random() * QUICK_ANSWERS.length)];
      setResult(ans);
      setHistory(p => [{ q: question.trim(), a: ans.answer, type: ans.type }, ...p].slice(0, 20));
      setIsShaking(false);
    } else {
      try {
        const res = await fetch(`${API}/api/magic-ball`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question: question.trim(), geminiApiKey: getStoredGeminiKey() }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResult(data);
        setHistory(p => [{ q: question.trim(), a: data.answer, type: data.type }, ...p].slice(0, 20));
      } catch (e: any) { setError(e.message || 'Lỗi!'); }
      finally { setIsShaking(false); }
    }
  };

  const reset = () => { setResult(null); setQuestion(''); };

  const typeTextClass = (t: string) => t === 'positive' ? 'text-emerald-500 dark:text-emerald-400' : t === 'negative' ? 'text-red-500 dark:text-red-400' : 'text-violet-500 dark:text-violet-400';
  const typeBorderClass = (t: string) => t === 'positive' ? 'border-emerald-300 dark:border-emerald-500/30' : t === 'negative' ? 'border-red-300 dark:border-red-500/30' : 'border-violet-300 dark:border-violet-500/30';
  const typeBgClass = (t: string) => t === 'positive' ? 'bg-emerald-50 dark:bg-emerald-500/10' : t === 'negative' ? 'bg-red-50 dark:bg-red-500/10' : 'bg-violet-50 dark:bg-violet-500/10';

  return (
    <PageShell title="Cầu Pha Lê" subtitle="Magic 8 Ball" icon="🔮" maxWidth="2xl" stars>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes shake{0%,100%{transform:translate(0,0) rotate(0)}10%{transform:translate(-8px,4px) rotate(-3deg)}20%{transform:translate(6px,-6px) rotate(2deg)}30%{transform:translate(-4px,8px) rotate(-2deg)}40%{transform:translate(8px,-4px) rotate(3deg)}50%{transform:translate(-6px,6px) rotate(-1deg)}60%{transform:translate(4px,-8px) rotate(2deg)}70%{transform:translate(-8px,4px) rotate(-3deg)}80%{transform:translate(6px,-6px) rotate(1deg)}90%{transform:translate(-4px,8px) rotate(-2deg)}}
        @keyframes ballGlow{0%,100%{box-shadow:0 0 30px rgba(139,92,246,.15),0 0 60px rgba(139,92,246,.05)}50%{box-shadow:0 0 50px rgba(139,92,246,.3),0 0 100px rgba(139,92,246,.1)}}
        @keyframes pulseRing{0%{transform:scale(.8);opacity:.5}100%{transform:scale(1.6);opacity:0}}
        .ball-float{animation:float 4s ease-in-out infinite}
        .ball-shake{animation:shake 1.5s ease-in-out}
        .ball-glow{animation:ballGlow 3s ease-in-out infinite}
      `}</style>

      <div className="flex justify-center mb-8">
        <div className="relative">
          {isShaking && (
            <div className="absolute -inset-5 rounded-full border-2 border-violet-300 dark:border-violet-500/30" style={{animation:'pulseRing 1s ease-out infinite'}}/>
          )}
          <div
            className={`${isShaking ? 'ball-shake' : result ? '' : 'ball-float'} w-48 h-48 rounded-full flex items-center justify-center cursor-pointer transition-shadow duration-500 bg-gradient-to-br from-slate-200 via-slate-100 to-white dark:from-[#2d1b69] dark:via-[#0f0a2e] dark:to-[#050310] border-2 border-slate-300 dark:border-violet-500/20 shadow-lg dark:shadow-[0_0_40px_rgba(139,92,246,.15)]`}
            onClick={shake}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all ${result ? `${typeBgClass(result.type)} ${typeBorderClass(result.type)}` : 'bg-slate-50 dark:bg-violet-500/10 border-slate-200 dark:border-violet-500/20'}`}>
              {isShaking ? (
                <Loader2 size={28} className="text-violet-500 dark:text-violet-400 animate-spin" />
              ) : result ? (
                <span className="text-3xl">{result.emoji}</span>
              ) : (
                <span className="text-2xl text-slate-300 dark:text-slate-600 font-black">8</span>
              )}
            </div>
          </div>
          <div className="absolute top-[15%] left-[25%] w-8 h-4 rounded-full bg-gradient-to-b from-white/40 dark:from-white/10 to-transparent -rotate-[30deg] pointer-events-none"/>
        </div>
      </div>

      {result && !isShaking && (
        <div className={`fade-up text-center mb-6 p-5 ${typeBgClass(result.type)} border ${typeBorderClass(result.type)} rounded-2xl`}>
          <p className={`text-lg md:text-xl font-bold ${typeTextClass(result.type)} leading-relaxed`}>{result.answer}</p>
          <button onClick={reset} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-500/50 transition-colors">
            <RotateCcw size={14}/> Hỏi lại
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <input
          type="text" value={question} onChange={e=>setQuestion(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter')shake()}}
          placeholder="Đặt câu hỏi Yes/No..."
          disabled={isShaking}
          className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3.5 text-[15px] outline-none focus:border-orange-500 transition-colors mb-3 placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />

        <div className="flex gap-2 mb-3">
          {(['quick','ai'] as const).map(m => (
            <button key={m} onClick={()=>setMode(m)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border ${mode===m ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30 text-orange-500 dark:text-orange-400' : 'bg-slate-50 dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}>
              {m==='quick' ? '⚡ Nhanh' : '🤖 AI'}
            </button>
          ))}
        </div>

        {mode==='ai' && <GeminiKeyInput accent="purple"/>}
        {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center mt-2">⚠️ {error}</div>}

        <button onClick={shake} disabled={isShaking||!question.trim()} className="w-full mt-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-wider text-[15px] flex items-center justify-center gap-2">
          {isShaking ? <><Loader2 size={18} className="animate-spin"/> Đang lắc...</> : '🔮 Lắc Cầu Pha Lê'}
        </button>
      </div>

      {history.length > 0 && (
        <div className="fade-up mt-6">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Lịch sử hỏi</p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{scrollbarWidth:'thin'}}>
            {history.map((h,i) => (
              <div key={i} className="p-3 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-colors">
                <p className="text-slate-400 dark:text-slate-500 mb-1">❓ {h.q}</p>
                <p className={`font-semibold ${typeTextClass(h.type)}`}>{h.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-slate-300 dark:text-slate-700 text-[10px] mt-8 font-mono">
        Chế độ Nhanh dùng câu trả lời random · Chế độ AI dùng Gemini
      </p>
    </PageShell>
  );
};
