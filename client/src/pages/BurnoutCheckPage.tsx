import { useState, useEffect, useRef } from 'react';
import { Loader2, RotateCcw, Sparkles, Heart, AlertTriangle } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';
import { PageShell } from '../components/PageShell';

const API = import.meta.env.VITE_API_URL || '';

interface Option { label: string; text: string; score: number; }
interface Question { id: number; text: string; category: string; options: Option[]; }
interface Result {
  burnoutLevel: number; verdict: string; verdictEmoji: string; title: string;
  analysis: string; redFlags?: string[]; shouldQuit: string; quitAdvice: string; selfCare: string[]; funFact: string;
}

const CAT_LABEL: Record<string, string> = { physical: '💪 Thể chất', mental: '🧠 Tinh thần', social: '👥 Công sở', motivation: '🔥 Động lực' };

export const BurnoutCheckPage = () => {
  const [jobInfo, setJobInfo] = useState('');
  const [phase, setPhase] = useState<'intro' | 'genQ' | 'quiz' | 'analyzing' | 'result'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; chosen: string; score: number; category: string }[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = 'Burnout Check | devtiendang.blog'; }, []);
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth' }); }, [result]);

  const genQuestions = async () => {
    setPhase('genQ'); setError('');
    try {
      const res = await fetch(`${API}/api/burnout-check/questions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobInfo: jobInfo.trim(), geminiApiKey: getStoredGeminiKey() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions || []);
      setAnswers([]);
      setStep(0);
      setPhase('quiz');
    } catch (e: any) { setError(e.message || 'Lỗi!'); setPhase('intro'); }
  };

  const answer = (q: Question, opt: Option) => {
    const newAnswers = [...answers, { question: q.text, chosen: opt.text, score: opt.score, category: q.category }];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 250);
    } else {
      setTimeout(() => analyze(newAnswers), 400);
    }
  };

  const analyze = async (ans: typeof answers) => {
    setPhase('analyzing'); setError('');
    const totalScore = ans.reduce((s, a) => s + a.score, 0);
    const maxScore = ans.length * 4;
    try {
      const res = await fetch(`${API}/api/burnout-check/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: ans, jobInfo: jobInfo.trim(), totalScore, maxScore, geminiApiKey: getStoredGeminiKey() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data); setPhase('result');
    } catch (e: any) { setError(e.message || 'Lỗi!'); setPhase('quiz'); setStep(questions.length - 1); }
  };

  const reset = () => { setPhase('intro'); setStep(0); setQuestions([]); setAnswers([]); setResult(null); setError(''); };

  const pct = phase === 'quiz' && questions.length ? ((step + 1) / questions.length) * 100 : 0;

  const levelClass = (l: number) => l <= 30 ? 'text-emerald-500' : l <= 60 ? 'text-yellow-500' : l <= 85 ? 'text-red-500' : 'text-violet-500';
  const verdictBgClass = (v: string) => v.includes('XANH') ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25' : v.includes('VÀNG') ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/25' : v.includes('ĐỎ') ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25' : 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/25';
  const quitClass = (s: string) => s === 'stay' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : s === 'consider' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30';
  const quitLabel = (s: string) => s === 'stay' ? '✅ Nên ở lại' : s === 'consider' ? '🤔 Cân nhắc nghiêm túc' : '🚪 Nên nghỉ thật';

  const optClasses = [
    'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500/40',
    'bg-yellow-50 dark:bg-yellow-500/5 border-yellow-200 dark:border-yellow-500/20 hover:border-yellow-400 dark:hover:border-yellow-500/40',
    'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-500/40',
    'bg-violet-50 dark:bg-violet-500/5 border-violet-200 dark:border-violet-500/20 hover:border-violet-400 dark:hover:border-violet-500/40',
  ];

  return (
    <PageShell title="Burnout Check" subtitle="AI tạo câu hỏi · AI phân tích" icon="🔥" maxWidth="2xl">
      {phase === 'intro' && (
        <div className="fade-up bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🧯</div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">Bạn có đang Burnout?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">AI tạo 10 câu hỏi tình huống độc đáo dựa trên công việc của bạn.<br />Trả lời xong → AI phân tích mức burnout + tư vấn nên ở hay đi.</p>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Công việc hiện tại (tuỳ chọn)</label>
            <input type="text" value={jobInfo} onChange={e => setJobInfo(e.target.value)} placeholder="VD: Dev 3 năm ở công ty outsource..." className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" />
          </div>
          <GeminiKeyInput accent="orange" />
          {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center mt-2">⚠️ {error}</div>}
          <button onClick={genQuestions} className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2">
            <Sparkles size={18} /> BẮT ĐẦU KIỂM TRA
          </button>
        </div>
      )}

      {phase === 'genQ' && (
        <div className="fade-up text-center py-16">
          <Loader2 size={40} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-orange-500 font-bold text-lg">AI đang tạo câu hỏi riêng cho bạn...</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">10 tình huống thực tế, không nhạt 🔥</p>
        </div>
      )}

      {phase === 'quiz' && questions.length > 0 && (
        <div>
          <div className="bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <div key={step} className="fade-up bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Câu {step + 1}/{questions.length}</span>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">{CAT_LABEL[questions[step].category] || questions[step].category}</span>
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed mb-5">{questions[step].text}</p>
            <div className="space-y-2">
              {questions[step].options.map((opt, i) => (
                <button key={i} onClick={() => answer(questions[step], opt)} className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left text-sm transition-all ${optClasses[i]} text-slate-700 dark:text-slate-300`}>
                  <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-extrabold text-orange-500 shrink-0 mt-0.5">{opt.label}</span>
                  <span className="leading-relaxed">{opt.text}</span>
                </button>
              ))}
            </div>
            {step > 0 && <button onClick={() => { setStep(step - 1); setAnswers(a => a.slice(0, -1)); }} className="mt-3 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-400 dark:text-slate-500 text-xs font-semibold hover:text-orange-500 dark:hover:text-orange-400 transition-colors">← Quay lại</button>}
          </div>
          {error && <p className="text-red-500 text-center mt-3 text-sm">⚠️ {error}</p>}
        </div>
      )}

      {phase === 'analyzing' && (
        <div className="fade-up text-center py-16">
          <Loader2 size={40} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-orange-500 font-bold text-lg">AI đang phân tích mức độ cháy sạch...</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Đọc tín hiệu SOS từ tâm hồn bạn 🧠</p>
        </div>
      )}

      {phase === 'result' && result && (
        <div ref={resultRef} className="fade-up space-y-3.5">
          <div className={`bg-white dark:bg-[#131923] border rounded-2xl p-6 text-center shadow-sm ${verdictBgClass(result.verdict)}`}>
            <div className="text-5xl mb-1">{result.verdictEmoji}</div>
            <h2 className={`text-xl font-extrabold mb-1 ${levelClass(result.burnoutLevel)}`}>{result.title}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{result.verdict}</p>
            <div className="bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 via-red-500 to-violet-500 rounded-full" style={{ width: `${result.burnoutLevel}%`, transition: 'width 1.5s cubic-bezier(.4,0,.2,1)' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500"><span>0% Chill</span><span>50%</span><span>100% Cháy</span></div>
            <div className={`mt-4 inline-block px-5 py-2.5 rounded-xl border font-black text-2xl ${verdictBgClass(result.verdict)} ${levelClass(result.burnoutLevel)}`}>{result.burnoutLevel}%</div>
          </div>

          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">📊 Phân tích</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{result.analysis}</p>
          </div>

          {result.redFlags && result.redFlags.length > 0 && (
            <div className="bg-white dark:bg-[#131923] border border-red-200 dark:border-red-500/15 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">🚩 Red Flags</p>
              {result.redFlags.map((f, i) => (
                <div key={i} className="flex gap-2 items-start mb-1.5">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">🚪 Nên nghỉ việc không?</p>
            <div className={`inline-block px-3.5 py-1.5 rounded-lg border text-sm font-bold mb-3 ${quitClass(result.shouldQuit)}`}>{quitLabel(result.shouldQuit)}</div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{result.quitAdvice}</p>
          </div>

          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">💆 Chăm sóc bản thân</p>
            <div className="space-y-2">
              {(result.selfCare || []).map((tip, i) => (
                <div key={i} className="flex gap-2.5 items-start p-3 bg-slate-50 dark:bg-[#1f2937] rounded-xl border border-slate-100 dark:border-slate-700">
                  <Heart size={14} className="text-orange-500 mt-0.5 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/15 rounded-2xl p-4 text-center">
            <p className="text-orange-600 dark:text-orange-400 text-sm italic leading-relaxed">💡 {result.funFact}</p>
          </div>

          <button onClick={reset} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Kiểm tra lại
          </button>
        </div>
      )}
    </PageShell>
  );
};
