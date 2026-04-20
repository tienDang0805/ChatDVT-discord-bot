import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Loader2, RotateCcw } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';

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

  const typeColor = (t: string) => t === 'positive' ? '#22c55e' : t === 'negative' ? '#ef4444' : '#a78bfa';
  const typeBg = (t: string) => t === 'positive' ? 'rgba(34,197,94,.1)' : t === 'negative' ? 'rgba(239,68,68,.1)' : 'rgba(167,139,250,.1)';

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 50% 20%, #0f0a2e 0%, #080518 50%, #050310 100%)', color:'#e5e7eb', fontFamily:'system-ui, sans-serif', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes shake{0%,100%{transform:translate(0,0) rotate(0)}10%{transform:translate(-8px,4px) rotate(-3deg)}20%{transform:translate(6px,-6px) rotate(2deg)}30%{transform:translate(-4px,8px) rotate(-2deg)}40%{transform:translate(8px,-4px) rotate(3deg)}50%{transform:translate(-6px,6px) rotate(-1deg)}60%{transform:translate(4px,-8px) rotate(2deg)}70%{transform:translate(-8px,4px) rotate(-3deg)}80%{transform:translate(6px,-6px) rotate(1deg)}90%{transform:translate(-4px,8px) rotate(-2deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(139,92,246,.3),0 0 60px rgba(139,92,246,.1)}50%{box-shadow:0 0 50px rgba(139,92,246,.5),0 0 100px rgba(139,92,246,.2)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulseRing{0%{transform:scale(.8);opacity:.5}100%{transform:scale(1.6);opacity:0}}
        @keyframes starTwinkle{0%,100%{opacity:.1}50%{opacity:.8}}
        .ball-float{animation:float 4s ease-in-out infinite}
        .ball-shake{animation:shake 1.5s ease-in-out}
        .ball-glow{animation:glow 3s ease-in-out infinite}
        .fade-up{animation:fadeUp .5s ease-out both}
        .shimmer-text{background-size:200% auto;animation:shimmer 3s linear infinite}
      `}</style>

      {Array.from({length:40}).map((_,i)=>(
        <div key={i} style={{position:'absolute',width:Math.random()>0.7?3:2,height:Math.random()>0.7?3:2,background:'white',borderRadius:'50%',left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`starTwinkle ${2+Math.random()*3}s ${Math.random()*3}s infinite`,opacity:0.1+Math.random()*0.3}}/>
      ))}

      <div style={{ maxWidth:500, margin:'0 auto', padding:'32px 16px', position:'relative', zIndex:10 }}>
        <header style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40 }}>
          <Link to="/" style={{ color:'#6b7280', padding:10, background:'#0f0a1a', borderRadius:12, border:'1px solid rgba(139,92,246,.2)', display:'flex', textDecoration:'none' }}><CornerUpLeft size={20}/></Link>
          <div>
            <h1 style={{ fontSize:'clamp(22px,6vw,32px)', fontWeight:900, background:'linear-gradient(135deg,#a78bfa,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundSize:'200% auto', animation:'shimmer 3s linear infinite' }}>🔮 Cầu Pha Lê</h1>
            <p style={{ color:'rgba(139,92,246,.4)', fontSize:12, letterSpacing:3, textTransform:'uppercase' }}>Magic 8 Ball</p>
          </div>
        </header>

        {/* Ball */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
          <div style={{ position:'relative' }}>
            {isShaking && (
              <div style={{ position:'absolute', inset:-20, borderRadius:'50%', border:'2px solid rgba(139,92,246,.3)', animation:'pulseRing 1s ease-out infinite' }}/>
            )}
            <div className={isShaking ? 'ball-shake' : result ? '' : 'ball-float'} style={{ width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%, #2d1b69, #0f0a2e 60%, #050310)', boxShadow: result ? `0 0 40px ${typeColor(result.type)}40, 0 0 80px ${typeColor(result.type)}15, inset 0 0 30px rgba(0,0,0,.5)` : '0 0 40px rgba(139,92,246,.3), 0 0 80px rgba(139,92,246,.1), inset 0 0 30px rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', cursor: !isShaking && question.trim() ? 'pointer' : 'default', transition:'box-shadow .5s' }} onClick={shake}>
              <div style={{ width:90, height:90, borderRadius:'50%', background: result ? `radial-gradient(circle, ${typeBg(result.type)}, rgba(0,0,0,.8))` : 'radial-gradient(circle, rgba(139,92,246,.15), rgba(0,0,0,.8))', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(139,92,246,.2)', transition:'all .5s' }}>
                {isShaking ? (
                  <Loader2 size={28} style={{ color:'#a78bfa', animation:'spin 1s linear infinite' }} />
                ) : result ? (
                  <span style={{ fontSize:32 }}>{result.emoji}</span>
                ) : (
                  <span style={{ fontSize:28, opacity:.6 }}>8</span>
                )}
              </div>
            </div>
            <div style={{ position:'absolute', top:'15%', left:'25%', width:30, height:15, borderRadius:'50%', background:'linear-gradient(180deg, rgba(255,255,255,.15), transparent)', transform:'rotate(-30deg)', pointerEvents:'none' }}/>
          </div>
        </div>

        {/* Answer */}
        {result && !isShaking && (
          <div className="fade-up" style={{ textAlign:'center', marginBottom:24, padding:'20px 24px', background:'rgba(15,10,26,.8)', border:`1px solid ${typeColor(result.type)}30`, borderRadius:16, backdropFilter:'blur(10px)' }}>
            <p style={{ fontSize:'clamp(16px,4.5vw,20px)', fontWeight:700, color: typeColor(result.type), lineHeight:1.6 }}>{result.answer}</p>
            <button onClick={reset} style={{ marginTop:12, display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.3)', borderRadius:10, color:'#a78bfa', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              <RotateCcw size={14}/> Hỏi lại
            </button>
          </div>
        )}

        {/* Input */}
        <div className="fade-up" style={{ background:'rgba(15,10,26,.6)', border:'1px solid rgba(139,92,246,.15)', borderRadius:20, padding:'20px 20px 16px', backdropFilter:'blur(10px)' }}>
          <input type="text" value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')shake()}} placeholder="Đặt câu hỏi Yes/No..." disabled={isShaking} style={{ width:'100%', background:'rgba(26,16,40,.8)', border:'1px solid rgba(139,92,246,.25)', borderRadius:12, padding:'14px 16px', color:'#e5e7eb', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:12 }}/>

          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {(['quick','ai'] as const).map(m => (
              <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:'10px 0', borderRadius:10, border: mode===m ? '1px solid rgba(139,92,246,.5)' : '1px solid rgba(139,92,246,.15)', background: mode===m ? 'rgba(139,92,246,.15)' : 'transparent', color: mode===m ? '#c4b5fd' : '#6b7280', fontSize:13, fontWeight:700, cursor:'pointer', textTransform:'uppercase', letterSpacing:1, transition:'all .2s' }}>
                {m==='quick' ? '⚡ Nhanh' : '🤖 AI'}
              </button>
            ))}
          </div>

          {mode==='ai' && <GeminiKeyInput accent="purple"/>}
          {error && <p style={{ color:'#ef4444', fontSize:13, textAlign:'center', marginTop:8 }}>⚠️ {error}</p>}

          <button onClick={shake} disabled={isShaking||!question.trim()} style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background: isShaking||!question.trim() ? 'rgba(139,92,246,.2)' : 'linear-gradient(135deg,#7c3aed,#6366f1)', color:'white', fontSize:15, fontWeight:700, cursor: isShaking||!question.trim() ? 'not-allowed' : 'pointer', opacity: isShaking||!question.trim() ? 0.5 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:12, transition:'all .2s', letterSpacing:1, textTransform:'uppercase' }}>
            {isShaking ? <><Loader2 size={18} style={{animation:'spin 1s linear infinite'}}/> Đang lắc...</> : '🔮 Lắc Cầu Pha Lê'}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="fade-up" style={{ marginTop:24 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(139,92,246,.5)', textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>Lịch sử hỏi</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:300, overflowY:'auto' }}>
              {history.map((h,i) => (
                <div key={i} style={{ padding:'10px 14px', background:'rgba(15,10,26,.5)', border:'1px solid rgba(139,92,246,.1)', borderRadius:12, fontSize:13 }}>
                  <p style={{ color:'#6b7280', marginBottom:4 }}>❓ {h.q}</p>
                  <p style={{ color: typeColor(h.type), fontWeight:600 }}>{h.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign:'center', color:'rgba(139,92,246,.2)', fontSize:10, marginTop:32, fontFamily:'monospace' }}>
          Chế độ Nhanh dùng câu trả lời random · Chế độ AI dùng Gemini
        </p>
      </div>
    </div>
  );
};
