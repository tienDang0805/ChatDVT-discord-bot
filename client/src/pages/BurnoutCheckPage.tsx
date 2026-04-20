import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Loader2, RotateCcw, Sparkles, Heart, AlertTriangle } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';

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
  const gc = (l: number) => l <= 30 ? '#22c55e' : l <= 60 ? '#eab308' : l <= 85 ? '#ef4444' : '#a855f7';
  const vBg = (v: string) => v.includes('XANH') ? 'rgba(34,197,94,.08)' : v.includes('VÀNG') ? 'rgba(234,179,8,.08)' : v.includes('ĐỎ') ? 'rgba(239,68,68,.08)' : 'rgba(168,85,247,.08)';
  const vBd = (v: string) => v.includes('XANH') ? 'rgba(34,197,94,.25)' : v.includes('VÀNG') ? 'rgba(234,179,8,.25)' : v.includes('ĐỎ') ? 'rgba(239,68,68,.25)' : 'rgba(168,85,247,.25)';
  const qc = (s: string) => s === 'stay' ? '#22c55e' : s === 'consider' ? '#eab308' : '#ef4444';
  const ql = (s: string) => s === 'stay' ? '✅ Nên ở lại' : s === 'consider' ? '🤔 Cân nhắc nghiêm túc' : '🚪 Nên nghỉ thật';
  const optColors = ['rgba(34,197,94,.08)', 'rgba(234,179,8,.08)', 'rgba(239,68,68,.08)', 'rgba(168,85,247,.08)'];
  const optBorders = ['rgba(34,197,94,.2)', 'rgba(234,179,8,.2)', 'rgba(239,68,68,.2)', 'rgba(168,85,247,.2)'];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a12 0%, #111118 50%, #0a0a12 100%)', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .45s ease-out both}
      `}</style>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '32px 16px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Link to="/" style={{ color: '#6b7280', padding: 10, background: '#111118', borderRadius: 12, border: '1px solid rgba(251,146,60,.2)', display: 'flex', textDecoration: 'none' }}><CornerUpLeft size={20} /></Link>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,6vw,28px)', fontWeight: 900, color: '#fb923c' }}>🔥 Burnout Check</h1>
            <p style={{ color: 'rgba(251,146,60,.4)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>AI tạo câu hỏi · AI phân tích</p>
          </div>
        </header>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="fade-up" style={{ background: '#111118', border: '1px solid rgba(251,146,60,.12)', borderRadius: 20, padding: '28px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🧯</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fb923c', marginBottom: 8 }}>Bạn có đang Burnout?</h2>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>AI tạo 10 câu hỏi tình huống độc đáo dựa trên công việc của bạn.<br />Trả lời xong → AI phân tích mức burnout + tư vấn nên ở hay đi.</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Công việc hiện tại (tuỳ chọn)</label>
              <input type="text" value={jobInfo} onChange={e => setJobInfo(e.target.value)} placeholder="VD: Dev 3 năm ở công ty outsource, Designer freelance..." style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(251,146,60,.2)', borderRadius: 12, padding: '12px 16px', color: '#e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <GeminiKeyInput accent="orange" />
            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: 8, fontSize: 13 }}>⚠️ {error}</p>}
            <button onClick={genQuestions} style={{ width: '100%', marginTop: 16, padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: 1 }}>
              <Sparkles size={18} /> BẮT ĐẦU KIỂM TRA
            </button>
          </div>
        )}

        {/* GENERATING QUESTIONS */}
        {phase === 'genQ' && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={40} style={{ color: '#fb923c', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p style={{ color: '#fb923c', fontWeight: 700, fontSize: 16 }}>AI đang tạo câu hỏi riêng cho bạn...</p>
            <p style={{ color: '#4b5563', fontSize: 13, marginTop: 8 }}>10 tình huống thực tế, không nhạt 🔥</p>
          </div>
        )}

        {/* QUIZ */}
        {phase === 'quiz' && questions.length > 0 && (
          <div>
            <div style={{ background: '#1a1a24', borderRadius: 10, height: 6, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#f97316,#ef4444)', borderRadius: 10, transition: 'width .3s', width: `${pct}%` }} />
            </div>
            <div key={step} className="fade-up" style={{ background: '#111118', border: '1px solid rgba(251,146,60,.12)', borderRadius: 20, padding: '24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2 }}>Câu {step + 1}/{questions.length}</span>
                <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(251,146,60,.08)', color: '#fb923c', border: '1px solid rgba(251,146,60,.15)', fontWeight: 600 }}>{CAT_LABEL[questions[step].category] || questions[step].category}</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#e5e7eb', lineHeight: 1.7, marginBottom: 18 }}>{questions[step].text}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {questions[step].options.map((opt, i) => (
                  <button key={i} onClick={() => answer(questions[step], opt)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1px solid ${optBorders[i]}`, background: optColors[i], color: '#d1d5db', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', textAlign: 'left', lineHeight: 1.5 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fb923c', flexShrink: 0, marginTop: 1 }}>{opt.label}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
              {step > 0 && <button onClick={() => { setStep(step - 1); setAnswers(a => a.slice(0, -1)); }} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(251,146,60,.15)', background: 'transparent', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}>← Quay lại</button>}
            </div>
            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: 12 }}>⚠️ {error}</p>}
          </div>
        )}

        {/* ANALYZING */}
        {phase === 'analyzing' && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={40} style={{ color: '#fb923c', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p style={{ color: '#fb923c', fontWeight: 700, fontSize: 16 }}>AI đang phân tích mức độ cháy sạch...</p>
            <p style={{ color: '#4b5563', fontSize: 13, marginTop: 8 }}>Đọc tín hiệu SOS từ tâm hồn bạn 🧠</p>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && result && (
          <div ref={resultRef} className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#111118', border: `1px solid ${vBd(result.verdict)}`, borderRadius: 20, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 4 }}>{result.verdictEmoji}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: gc(result.burnoutLevel), marginBottom: 4 }}>{result.title}</h2>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>{result.verdict}</p>
              <div style={{ background: '#1a1a24', borderRadius: 10, height: 14, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #22c55e, #eab308, #ef4444, #a855f7)', borderRadius: 10, width: `${result.burnoutLevel}%`, transition: 'width 1.5s cubic-bezier(.4,0,.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b5563' }}><span>0% Chill</span><span>50%</span><span>100% Cháy</span></div>
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: vBg(result.verdict), border: `1px solid ${vBd(result.verdict)}`, fontSize: 28, fontWeight: 900, color: gc(result.burnoutLevel) }}>{result.burnoutLevel}%</div>
            </div>

            <div style={{ background: '#111118', border: '1px solid rgba(251,146,60,.1)', borderRadius: 16, padding: '18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>📊 Phân tích</p>
              <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.7 }}>{result.analysis}</p>
            </div>

            {result.redFlags && result.redFlags.length > 0 && (
              <div style={{ background: '#111118', border: '1px solid rgba(239,68,68,.15)', borderRadius: 16, padding: '18px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>🚩 Red Flags</p>
                {result.redFlags.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                    <AlertTriangle size={14} style={{ color: '#ef4444', marginTop: 3, flexShrink: 0 }} />
                    <span style={{ color: '#d1d5db', fontSize: 13, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#111118', border: '1px solid rgba(251,146,60,.1)', borderRadius: 16, padding: '18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>🚪 Nên nghỉ việc không?</p>
              <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 8, background: `${qc(result.shouldQuit)}15`, border: `1px solid ${qc(result.shouldQuit)}40`, color: qc(result.shouldQuit), fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{ql(result.shouldQuit)}</div>
              <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.7 }}>{result.quitAdvice}</p>
            </div>

            <div style={{ background: '#111118', border: '1px solid rgba(251,146,60,.1)', borderRadius: 16, padding: '18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>💆 Chăm sóc bản thân</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(result.selfCare || []).map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: '#0d0d1a', borderRadius: 10, border: '1px solid rgba(251,146,60,.08)' }}>
                    <Heart size={14} style={{ color: '#fb923c', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ color: '#d1d5db', fontSize: 13, lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(251,146,60,.05)', border: '1px solid rgba(251,146,60,.15)', borderRadius: 16, padding: '14px 18px', textAlign: 'center' }}>
              <p style={{ color: '#fb923c', fontSize: 13, fontStyle: 'italic', lineHeight: 1.6 }}>💡 {result.funFact}</p>
            </div>

            <button onClick={reset} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <RotateCcw size={16} /> Kiểm tra lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
