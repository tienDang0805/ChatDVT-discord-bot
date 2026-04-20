import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Loader2, RotateCcw, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';

const API = import.meta.env.VITE_API_URL || '';

const QUESTIONS = [
  { q: 'Bạn cảm thấy kiệt sức về thể chất/tinh thần sau giờ làm?', cat: 'exhaustion' },
  { q: 'Bạn mất hứng thú với công việc đang làm?', cat: 'cynicism' },
  { q: 'Bạn cảm thấy công việc không còn ý nghĩa?', cat: 'cynicism' },
  { q: 'Bạn khó tập trung, hay quên, sai sót nhiều hơn?', cat: 'inefficacy' },
  { q: 'Bạn cảm thấy bị quá tải, việc gì cũng gấp?', cat: 'exhaustion' },
  { q: 'Bạn mất ngủ hoặc ngủ quá nhiều vì stress công việc?', cat: 'exhaustion' },
  { q: 'Bạn thấy mình "diễn" vui vẻ ở công ty?', cat: 'cynicism' },
  { q: 'Bạn sợ/ghét ngày Chủ Nhật vì ngày mai phải đi làm?', cat: 'cynicism' },
  { q: 'Bạn cảm thấy nỗ lực không được ghi nhận?', cat: 'inefficacy' },
  { q: 'Bạn hay cáu gắt, dễ nổi nóng hơn bình thường?', cat: 'exhaustion' },
];

const LEVELS = ['Không bao giờ', 'Hiếm khi', 'Thỉnh thoảng', 'Thường xuyên', 'Luôn luôn'];

interface Result {
  burnoutLevel: number; verdict: string; verdictEmoji: string; title: string;
  analysis: string; shouldQuit: string; quitAdvice: string; selfCare: string[]; funFact: string;
}

export const BurnoutCheckPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(0));
  const [jobInfo, setJobInfo] = useState('');
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'loading' | 'result'>('intro');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = 'Burnout Check | devtiendang.blog'; }, []);
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth' }); }, [result]);

  const answer = (val: number) => {
    const next = [...answers]; next[step] = val; setAnswers(next);
    if (step < QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 200);
    else setTimeout(() => submit(next), 400);
  };

  const submit = async (ans: number[]) => {
    setPhase('loading'); setError('');
    try {
      const payload = ans.map((v, i) => ({ question: QUESTIONS[i].q, value: v, category: QUESTIONS[i].cat }));
      const res = await fetch(`${API}/api/burnout-check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: payload, jobInfo: jobInfo.trim(), geminiApiKey: getStoredGeminiKey() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data); setPhase('result');
    } catch (e: any) { setError(e.message || 'Lỗi!'); setPhase('quiz'); setStep(QUESTIONS.length - 1); }
  };

  const reset = () => { setPhase('intro'); setStep(0); setAnswers(new Array(QUESTIONS.length).fill(0)); setResult(null); setJobInfo(''); };

  const pct = phase === 'quiz' ? ((step + 1) / QUESTIONS.length) * 100 : 0;
  const gaugeColor = (lvl: number) => lvl <= 30 ? '#22c55e' : lvl <= 60 ? '#eab308' : lvl <= 85 ? '#ef4444' : '#a855f7';
  const verdictBg = (v: string) => v.includes('XANH') ? 'rgba(34,197,94,.1)' : v.includes('VÀNG') ? 'rgba(234,179,8,.1)' : v.includes('ĐỎ') ? 'rgba(239,68,68,.1)' : 'rgba(168,85,247,.1)';
  const verdictBorder = (v: string) => v.includes('XANH') ? 'rgba(34,197,94,.3)' : v.includes('VÀNG') ? 'rgba(234,179,8,.3)' : v.includes('ĐỎ') ? 'rgba(239,68,68,.3)' : 'rgba(168,85,247,.3)';
  const quitColor = (s: string) => s === 'stay' ? '#22c55e' : s === 'consider' ? '#eab308' : '#ef4444';
  const quitLabel = (s: string) => s === 'stay' ? '✅ Nên ở lại' : s === 'consider' ? '🤔 Cân nhắc nghiêm túc' : '🚪 Nên nghỉ thật';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a12 0%, #111118 50%, #0a0a12 100%)', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease-out both}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes fillGauge{from{width:0}to{width:var(--target)}}
      `}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Link to="/" style={{ color: '#6b7280', padding: 10, background: '#111118', borderRadius: 12, border: '1px solid rgba(251,146,60,.2)', display: 'flex', textDecoration: 'none' }}><CornerUpLeft size={20} /></Link>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,6vw,28px)', fontWeight: 900, color: '#fb923c' }}>🔥 Burnout Check</h1>
            <p style={{ color: 'rgba(251,146,60,.4)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Tôi có đang cháy sạch?</p>
          </div>
        </header>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="fade-up" style={{ background: '#111118', border: '1px solid rgba(251,146,60,.12)', borderRadius: 20, padding: '28px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🧯</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fb923c', marginBottom: 8 }}>Bạn có đang Burnout?</h2>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>10 câu hỏi nhanh · AI phân tích · Tư vấn nên ở hay nên đi</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Công việc hiện tại (tuỳ chọn)</label>
              <input type="text" value={jobInfo} onChange={e => setJobInfo(e.target.value)} placeholder="VD: Dev 3 năm ở công ty outsource" style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(251,146,60,.2)', borderRadius: 12, padding: '12px 16px', color: '#e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <GeminiKeyInput accent="orange" />
            <button onClick={() => setPhase('quiz')} style={{ width: '100%', marginTop: 16, padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: 1 }}>
              <Sparkles size={18} /> BẮT ĐẦU KIỂM TRA
            </button>
          </div>
        )}

        {/* QUIZ */}
        {phase === 'quiz' && (
          <div className="fade-up">
            <div style={{ background: '#1a1a24', borderRadius: 10, height: 6, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#f97316,#ef4444)', borderRadius: 10, transition: 'width .3s', width: `${pct}%` }} />
            </div>
            <div key={step} className="fade-up" style={{ background: '#111118', border: '1px solid rgba(251,146,60,.12)', borderRadius: 20, padding: '24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2 }}>Câu {step + 1}/{QUESTIONS.length}</span>
                <span style={{ fontSize: 11, color: '#4b5563' }}>{QUESTIONS[step].cat === 'exhaustion' ? '😩 Kiệt sức' : QUESTIONS[step].cat === 'cynicism' ? '😒 Hoài nghi' : '📉 Hiệu suất'}</span>
              </div>
              <p style={{ fontSize: 17, fontWeight: 600, color: '#e5e7eb', lineHeight: 1.6, marginBottom: 20 }}>{QUESTIONS[step].q}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LEVELS.map((label, i) => {
                  const val = i + 1;
                  const selected = answers[step] === val;
                  return (
                    <button key={i} onClick={() => answer(val)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: selected ? '1px solid rgba(251,146,60,.5)' : '1px solid rgba(251,146,60,.1)', background: selected ? 'rgba(251,146,60,.1)' : '#0d0d1a', color: selected ? '#fb923c' : '#9ca3af', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: selected ? 'rgba(251,146,60,.2)' : 'rgba(251,146,60,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: selected ? '#fb923c' : '#4b5563', flexShrink: 0 }}>{val}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
              {step > 0 && <button onClick={() => setStep(step - 1)} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(251,146,60,.15)', background: 'transparent', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}>← Quay lại</button>}
            </div>
            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: 12 }}>⚠️ {error}</p>}
          </div>
        )}

        {/* LOADING */}
        {phase === 'loading' && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={40} style={{ color: '#fb923c', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p style={{ color: '#fb923c', fontWeight: 700, fontSize: 16 }}>Đang phân tích mức độ cháy sạch...</p>
            <p style={{ color: '#4b5563', fontSize: 13, marginTop: 8 }}>AI đang đọc tín hiệu SOS từ tâm hồn bạn 🧠</p>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && result && (
          <div ref={resultRef} className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Gauge */}
            <div style={{ background: '#111118', border: `1px solid ${verdictBorder(result.verdict)}`, borderRadius: 20, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 4 }}>{result.verdictEmoji}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: gaugeColor(result.burnoutLevel), marginBottom: 4 }}>{result.title}</h2>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>{result.verdict}</p>
              <div style={{ background: '#1a1a24', borderRadius: 10, height: 14, overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, #22c55e, #eab308, #ef4444, #a855f7)`, borderRadius: 10, width: `${result.burnoutLevel}%`, transition: 'width 1.5s cubic-bezier(.4,0,.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b5563' }}>
                <span>0% Chill</span><span>50%</span><span>100% Cháy</span>
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: verdictBg(result.verdict), border: `1px solid ${verdictBorder(result.verdict)}`, fontSize: 28, fontWeight: 900, color: gaugeColor(result.burnoutLevel) }}>
                {result.burnoutLevel}%
              </div>
            </div>

            {/* Analysis */}
            <div style={{ background: '#111118', border: '1px solid rgba(251,146,60,.1)', borderRadius: 16, padding: '18px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>📊 Phân tích</p>
              <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.7 }}>{result.analysis}</p>
            </div>

            {/* Should Quit */}
            <div style={{ background: '#111118', border: '1px solid rgba(251,146,60,.1)', borderRadius: 16, padding: '18px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>🚪 Nên nghỉ việc không?</p>
              <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 8, background: `${quitColor(result.shouldQuit)}15`, border: `1px solid ${quitColor(result.shouldQuit)}40`, color: quitColor(result.shouldQuit), fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                {quitLabel(result.shouldQuit)}
              </div>
              <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.7 }}>{result.quitAdvice}</p>
            </div>

            {/* Self Care */}
            <div style={{ background: '#111118', border: '1px solid rgba(251,146,60,.1)', borderRadius: 16, padding: '18px 18px' }}>
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

            {/* Fun Fact */}
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
