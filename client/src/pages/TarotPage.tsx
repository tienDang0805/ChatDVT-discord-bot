import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Sparkles, Loader2, RotateCcw, SendHorizontal, Bot } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';
import { TAROT_DECK, TOPICS, POSITIONS, drawThreeCards, TarotCard } from '../data/tarotCards';

const API = import.meta.env.VITE_API_URL || '';

interface DrawnCard { card: TarotCard; isReversed: boolean; flipped: boolean; }
interface CardResult { position: string; interpretation: string; energy: string; keywords: string[]; }
interface TarotResult { overallReading: string; cards: CardResult[]; advice: string; luckyInfo: { element: string; color: string; number: number; timing: string }; spiritMessage: string; }

export const TarotPage = () => {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [phase, setPhase] = useState<'input'|'draw'|'loading'|'result'>('input');
  const [result, setResult] = useState<TarotResult|null>(null);
  const [error, setError] = useState('');
  const [loadStep, setLoadStep] = useState(0);
  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'ai';text:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const steps = ['🔮 Kết nối năng lượng...','🌙 Đọc biểu tượng...','✨ Giải mã thông điệp...','🎴 Hoàn thiện bói toán...'];
  useEffect(() => { document.title = 'Bói Bài Tarot AI | devtiendang.blog'; }, []);
  useEffect(() => { if (phase==='loading') { const t=setInterval(()=>setLoadStep(p=>(p+1)%steps.length),2200); return ()=>clearInterval(t); } }, [phase]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [chatMsgs]);
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({behavior:'smooth',block:'start'}); }, [result]);

  const startDraw = () => {
    if (!topic) { setError('Chọn chủ đề trước!'); return; }
    setError('');
    const cards = drawThreeCards();
    setDrawn(cards.map(c => ({ ...c, flipped: false })));
    setPhase('draw');
  };

  const flipCard = (idx: number) => {
    setDrawn(prev => {
      const next = [...prev];
      if (next[idx].flipped) return next;
      next[idx] = { ...next[idx], flipped: true };
      const allFlipped = next.every(c => c.flipped);
      if (allFlipped) setTimeout(submitReading, 800, next);
      return next;
    });
  };

  const submitReading = async (cards: DrawnCard[]) => {
    setPhase('loading'); setLoadStep(0);
    const drawnCards = cards.map((c,i) => ({ name: c.card.name, nameVi: c.card.nameVi, position: POSITIONS[i], isReversed: c.isReversed }));
    try {
      const topicValue = TOPICS.find(t => t.id === topic)?.value || topic;
      const res = await fetch(`${API}/api/tarot`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ topic: topicValue, question, drawnCards, geminiApiKey: getStoredGeminiKey() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result); setPhase('result');
    } catch (e: any) { setError(e.message||'Lỗi!'); setPhase('draw'); }
  };

  const sendChat = async () => {
    if (!chatInput.trim()||!result||chatLoading) return;
    const q = chatInput.trim(); setChatInput('');
    setChatMsgs(p=>[...p,{role:'user',text:q}]); setChatLoading(true);
    try {
      const drawnCards = drawn.map((c,i)=>({name:c.card.name,nameVi:c.card.nameVi,position:POSITIONS[i],isReversed:c.isReversed}));
      const res = await fetch(`${API}/api/tarot/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,tarotResult:result,drawnCards,chatHistory:chatMsgs.slice(-10),geminiApiKey:getStoredGeminiKey()})});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMsgs(p=>[...p,{role:'ai',text:data.answer}]);
    } catch(e:any) { setChatMsgs(p=>[...p,{role:'ai',text:'⚠️ '+(e.message||'Lỗi')}]); }
    finally { setChatLoading(false); setTimeout(()=>chatInputRef.current?.focus(),100); }
  };

  const reset = () => { setPhase('input'); setResult(null); setDrawn([]); setError(''); setChatMsgs([]); setChatInput(''); setQuestion(''); };

  const energyColor = (e: string) => e === 'positive' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : e === 'negative' ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  const energyLabel = (e: string) => e === 'positive' ? '☀️ Tích cực' : e === 'negative' ? '🌑 Tiêu cực' : '🌓 Trung tính';

  return (
    <div className="min-h-screen font-sans relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0d0618 40%, #060412 100%)', color: '#e5e7eb' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .6s ease-out both}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .shimmer{background-size:200% auto;animation:shimmer 3s linear infinite}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .float{animation:float 3s ease-in-out infinite}
        @keyframes cardFlip{from{transform:rotateY(180deg)}to{transform:rotateY(0deg)}}
        .card-flip{animation:cardFlip .8s ease-out}
        .card-container{perspective:1000px}
        .card-inner{transition:transform .8s;transform-style:preserve-3d;position:relative}
        .card-inner.flipped{transform:rotateY(180deg)}
        .card-front,.card-back{backface-visibility:hidden;position:absolute;inset:0;border-radius:12px;overflow:hidden}
        .card-back{transform:rotateY(180deg)}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,.2)}50%{box-shadow:0 0 40px rgba(139,92,246,.5)}}
        .glow{animation:glow 2.5s ease-in-out infinite}
        .star{position:absolute;width:2px;height:2px;background:white;border-radius:50%;animation:twinkle 3s infinite}
        @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:1}}
      `}</style>

      {Array.from({length:30}).map((_,i)=>(
        <div key={i} className="star" style={{left:`${Math.random()*100}%`,top:`${Math.random()*60}%`,animationDelay:`${Math.random()*3}s`,opacity:Math.random()*0.5+0.1}} />
      ))}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-14 relative z-10">
        <header className="flex items-center gap-3 mb-10">
          <Link to="/" className="text-slate-500 hover:text-violet-400 transition p-2.5 bg-[#0f0a1a] rounded-xl border border-violet-900/40"><CornerUpLeft size={20}/></Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 shimmer">🎴 Tarot AI</h1>
            <p className="text-violet-900 text-xs md:text-sm mt-0.5 tracking-wider uppercase">Past · Present · Future</p>
          </div>
        </header>

        {/* INPUT */}
        {phase==='input' && (
          <div className="max-w-lg mx-auto fade-up">
            <div className="bg-[#0f0a1a] border border-violet-500/15 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"/>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-3 shadow-lg glow"><span className="text-2xl">🎴</span></div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Trải Bài Tarot</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">Chọn chủ đề, đặt câu hỏi, rồi rút 3 lá bài để khám phá thông điệp từ vũ trụ.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-violet-400 mb-3 uppercase tracking-widest">Chủ đề bói</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TOPICS.map(t=>(
                      <button key={t.id} onClick={()=>{setTopic(t.id);setError('')}} className={`py-3 px-3 rounded-xl text-sm font-bold transition-all border ${topic===t.id?'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/10':'bg-[#1a1028] border-violet-900/30 text-slate-400 hover:border-violet-500/30 hover:text-violet-300'}`}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-violet-400 mb-2 uppercase tracking-widest">Câu hỏi (tuỳ chọn)</label>
                  <input type="text" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="VD: Em có nên nhảy việc không?" className="w-full bg-[#1a1028] border border-violet-900/40 focus:border-violet-500 text-white rounded-xl px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600"/>
                </div>
                <GeminiKeyInput accent="purple"/>
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">⚠️ {error}</div>}
                <button onClick={startDraw} className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2.5 text-base shadow-lg shadow-violet-500/20 active:scale-[0.98] uppercase tracking-wider">
                  <Sparkles size={20}/> Xào Bài & Rút
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DRAW PHASE */}
        {phase==='draw' && (
          <div className="fade-up text-center">
            <p className="text-violet-300 text-lg font-bold mb-2">Chạm vào từng lá bài để lật</p>
            <p className="text-slate-500 text-sm mb-8">Hãy tập trung vào câu hỏi trong đầu khi lật bài</p>
            <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
              {drawn.map((d,i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">{POSITIONS[i]}</span>
                  <div className="card-container cursor-pointer" onClick={()=>flipCard(i)} style={{width:'140px',height:'240px'}}>
                    <div className={`card-inner w-full h-full ${d.flipped?'flipped':''}`}>
                      <div className="card-front bg-gradient-to-br from-violet-900 to-indigo-900 border-2 border-violet-500/40 flex items-center justify-center shadow-xl hover:shadow-violet-500/30 transition-shadow">
                        <div className="text-center">
                          <span className="text-4xl block mb-2">🎴</span>
                          <span className="text-violet-300 text-xs font-bold uppercase tracking-widest">Lật bài</span>
                        </div>
                      </div>
                      <div className="card-back border-2 border-violet-400/50 shadow-xl bg-[#1a1028]">
                        <img src={d.card.image} alt={d.card.name} className="w-full h-full object-cover" style={{transform:d.isReversed?'rotate(180deg)':'none'}} onError={e=>{(e.target as HTMLImageElement).src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 240"><rect fill="%231a1028" width="140" height="240"/><text x="70" y="120" text-anchor="middle" fill="%238b5cf6" font-size="40">🎴</text></svg>';}}/>
                      </div>
                    </div>
                  </div>
                  {d.flipped && (
                    <div className="fade-up text-center max-w-[160px]">
                      <p className="text-white text-xs font-bold">{d.card.nameVi}</p>
                      <p className="text-violet-400 text-[10px]">{d.card.name}</p>
                      {d.isReversed && <span className="text-[10px] text-red-400 font-bold">↕ Ngược</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {error && <p className="text-red-400 mt-6">{error}</p>}
          </div>
        )}

        {/* LOADING */}
        {phase==='loading' && (
          <div className="flex flex-col items-center justify-center py-20 fade-up">
            <div className="relative w-28 h-28 mb-6">
              <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-10"/>
              <div className="absolute inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full animate-spin flex items-center justify-center">
                <div className="w-20 h-20 bg-[#060412] rounded-full flex items-center justify-center"><span className="text-3xl">🔮</span></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-2">{steps[loadStep]}</h3>
            <p className="text-slate-500 text-sm">Pháp sư đang giải mã thông điệp từ các lá bài...</p>
          </div>
        )}

        {/* RESULTS */}
        {phase==='result' && result && (
          <div ref={resultRef} className="space-y-6 fade-up">
            <div className="flex justify-between items-center">
              <h3 className="text-violet-400 font-bold uppercase tracking-widest flex items-center gap-2 text-sm"><Sparkles size={16}/> Kết Quả Trải Bài</h3>
              <button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-400 border border-violet-900/30 bg-[#0f0a1a] px-3 py-1.5 rounded-lg hover:text-violet-400 hover:border-violet-500/40 transition"><RotateCcw size={14}/> Rút lại</button>
            </div>

            {/* Cards drawn */}
            <div className="flex justify-center gap-3 md:gap-6 flex-wrap">
              {drawn.map((d,i)=>(
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">{POSITIONS[i]}</span>
                  <div className="w-[90px] h-[155px] md:w-[110px] md:h-[190px] rounded-xl overflow-hidden border-2 border-violet-500/30 shadow-lg shadow-violet-500/10">
                    <img src={d.card.image} alt={d.card.name} className="w-full h-full object-cover" style={{transform:d.isReversed?'rotate(180deg)':'none'}}/>
                  </div>
                  <p className="text-white text-xs font-bold text-center">{d.card.nameVi}</p>
                  {d.isReversed && <span className="text-[10px] text-red-400">↕ Ngược</span>}
                </div>
              ))}
            </div>

            {/* Overall */}
            <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"/>
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">🔮 Tổng Quan</p>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed">{result.overallReading}</p>
              <div className="mt-5 pt-5 border-t border-violet-500/15">
                <p className="text-violet-300 italic text-sm md:text-base leading-relaxed">✨ "{result.spiritMessage}"</p>
              </div>
            </div>

            {/* Card interpretations */}
            <div className="grid md:grid-cols-3 gap-4">
              {(result.cards||[]).map((c,i) => (
                <div key={i} className="bg-[#0f0a1a] border border-violet-900/40 rounded-2xl p-5 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">{c.position}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${energyColor(c.energy)}`}>{energyLabel(c.energy)}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">{c.interpretation}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.keywords||[]).map((k,j)=>(<span key={j} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px] border border-violet-500/20">{k}</span>))}
                  </div>
                </div>
              ))}
            </div>

            {/* Lucky + Advice */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0f0a1a] border border-violet-900/40 rounded-2xl p-5">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">🍀 May Mắn</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{e:'🔥',l:'Nguyên tố',v:result.luckyInfo?.element},{e:'🎨',l:'Màu',v:result.luckyInfo?.color},{e:'🔢',l:'Số',v:String(result.luckyInfo?.number)},{e:'⏰',l:'Thời điểm',v:result.luckyInfo?.timing}].map((x,i)=>(
                    <div key={i} className="bg-[#1a1028] rounded-xl p-3 text-center">
                      <p className="text-lg mb-0.5">{x.e}</p><p className="text-[10px] text-slate-500">{x.l}</p><p className="text-xs text-white font-semibold mt-0.5">{x.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0f0a1a] border border-violet-900/40 rounded-2xl p-5">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">💡 Lời Khuyên</p>
                <p className="text-slate-300 text-sm leading-relaxed">{result.advice}</p>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-[#0f0a1a] border border-violet-500/20 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-violet-900/40 bg-[#0d081a]">
                <Bot size={18} className="text-violet-400"/><span className="text-sm font-bold text-violet-400 uppercase tracking-wider">Hỏi Pháp Sư Tarot</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto p-4 space-y-3" style={{scrollbarWidth:'thin',scrollbarColor:'#1e1040 transparent'}}>
                {chatMsgs.length===0 && (
                  <div className="text-center py-8">
                    <Bot size={36} className="text-violet-900 mx-auto mb-3"/>
                    <p className="text-slate-500 text-sm mb-4">Hỏi thêm về ý nghĩa các lá bài</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Lá bài này có ý nghĩa gì sâu hơn?','Tôi nên làm gì tiếp theo?','Mối quan hệ hiện tại sao?','Năng lượng tuần này?'].map((q,i)=>(
                        <button key={i} onClick={()=>{setChatInput(q);chatInputRef.current?.focus()}} className="px-3 py-1.5 bg-[#1a1028] rounded-lg border border-violet-900/40 text-xs text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition">{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMsgs.map((m,i)=>(
                  <div key={i} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}>
                    {m.role==='ai' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><Bot size={16} className="text-white"/></div>}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role==='user'?'bg-violet-500/20 border border-violet-500/30 text-violet-100 rounded-tr-sm':'bg-[#1a1028] border border-violet-900/40 text-slate-300 rounded-tl-sm'}`}>{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0"><Bot size={16} className="text-white"/></div>
                    <div className="bg-[#1a1028] border border-violet-900/40 rounded-2xl rounded-tl-sm px-4 py-3.5">
                      <div className="flex gap-1.5"><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
              <div className="p-3 border-t border-violet-900/40 bg-[#0d081a]">
                <div className="flex gap-2">
                  <input ref={chatInputRef} type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat()}}} placeholder="Hỏi thêm về vận mệnh..." className="flex-1 bg-[#1a1028] border border-violet-900/40 focus:border-violet-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-slate-600" disabled={chatLoading}/>
                  <button onClick={sendChat} disabled={chatLoading||!chatInput.trim()} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-xl hover:brightness-110 transition disabled:opacity-30 active:scale-95"><SendHorizontal size={18}/></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
