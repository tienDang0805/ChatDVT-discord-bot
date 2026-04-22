import { useRef, useState } from 'react';
import { Swords, Sparkles, Trophy, Skull, ExternalLink, Bot, Send, ThumbsUp, ThumbsDown, Star, ArrowRight, X } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Recommendation {
  name: string; price: string; whyGood: string; whyBad: string; bestFor: string; notFor: string;
}
interface ConsultResult {
  greeting: string; recommendations: Recommendation[]; topPick: string; topPickReason: string; bonusTip: string;
  sources: {title:string;uri:string}[];
}
interface SpecRow {
  category: string; p1: string; p2: string; winner: 'p1'|'p2'|'draw'; comment: string;
}
interface CompareResult {
  product1: {name:string;shortName:string}; product2: {name:string;shortName:string};
  specs: SpecRow[]; score: {p1:number;p2:number}; overallWinner: 'p1'|'p2';
  verdict: string; roast: string; sources: {title:string;uri:string}[];
}

const CATEGORIES = ['Điện thoại','Laptop','Tablet','Tai nghe','Đồng hồ thông minh','Máy ảnh','Loa bluetooth','Màn hình','Bàn phím cơ','Chuột gaming'];
const PURPOSES = ['Gaming','Chụp ảnh / Quay phim','Làm việc / Văn phòng','Học tập','Xem phim / Giải trí','Đồ họa / Dựng phim','Lập trình','Đa năng'];
const PRIORITIES = ['Pin trâu','Camera đẹp','Màn hình lớn','Nhẹ & mỏng','Hiệu năng cao','Giá rẻ nhất có thể','Bền bỉ','Âm thanh tốt'];

export const TechDuel = () => {
  const [step, setStep] = useState<'consult'|'recommend'|'compare'>('consult');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [purpose, setPurpose] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [priorityInput, setPriorityInput] = useState('');
  const [currentDevice, setCurrentDevice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consultResult, setConsultResult] = useState<ConsultResult|null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult|null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'ai',text:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleConsult = async () => {
    if (!category.trim()) { setError('Cho tao biết mày muốn mua gì đi!'); return; }
    const apiKey = getStoredGeminiKey();
    if (!apiKey) { setError('Nhập Gemini API Key trước!'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/tech-duel/consult`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({category,budget,purpose,priority:priorities.join(', '),currentDevice,geminiApiKey:apiKey})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConsultResult(data); setStep('recommend'); setChatMsgs([]);
    } catch (err:any) { setError(err.message); } finally { setLoading(false); }
  };

  const toggleSelect = (name:string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n=>n!==name) : prev.length<2 ? [...prev,name] : [prev[1],name]);
  };

  const handleCompare = async () => {
    if (selected.length!==2) { setError('Chọn đúng 2 sản phẩm!'); return; }
    const apiKey = getStoredGeminiKey();
    if (!apiKey) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/tech-duel/compare`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({product1:selected[0],product2:selected[1],usage:purpose,geminiApiKey:apiKey})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCompareResult(data); setStep('compare');
    } catch (err:any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleChat = async () => {
    if (!chatInput.trim()||chatLoading) return;
    const apiKey = getStoredGeminiKey(); if (!apiKey) return;
    const q = chatInput.trim(); setChatInput('');
    setChatMsgs(prev=>[...prev,{role:'user',text:q}]); setChatLoading(true);
    setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:'smooth'}),100);
    try {
      const ctx = compareResult ? `So kèo ${compareResult.product1.name} vs ${compareResult.product2.name}: ${compareResult.verdict}` : consultResult ? `Tư vấn ${category}, recommend: ${consultResult.topPick}` : '';
      const res = await fetch(`${API_BASE}/api/tech-duel/chat`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({question:q,context:ctx,chatHistory:chatMsgs,geminiApiKey:apiKey})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMsgs(prev=>[...prev,{role:'ai',text:data.text}]);
    } catch (err:any) { setChatMsgs(prev=>[...prev,{role:'ai',text:'Lỗi: '+err.message}]); }
    finally { setChatLoading(false); setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:'smooth'}),100); }
  };

  const renderChat = () => (
    <div className="bg-[#131923] border border-orange-500/20 rounded-2xl overflow-hidden shadow-sm mt-6">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-orange-500/20 bg-orange-500/5">
        <Bot size={18} className="text-orange-500"/><span className="text-sm font-bold text-orange-500 uppercase tracking-wider">Hỏi Thêm</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto p-4 space-y-3" style={{scrollbarWidth:'thin'}}>
        {chatMsgs.length===0 && <p className="text-slate-500 text-sm text-center py-4">Hỏi thêm bất cứ điều gì về sản phẩm!</p>}
        {chatMsgs.map((m,i)=>(
          <div key={i} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}>
            {m.role==='ai'&&<div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 mt-0.5"><Bot size={14} className="text-white"/></div>}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role==='user'?'bg-orange-500/20 border border-orange-500/30 text-orange-100 rounded-tr-sm':'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-sm'}`}>{m.text}</div>
          </div>
        ))}
        {chatLoading&&<div className="flex gap-3"><div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0"><Bot size={14} className="text-white"/></div><div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3"><div className="flex gap-1.5"><span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"/><span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div></div></div>}
        <div ref={chatEndRef}/>
      </div>
      <div className="p-3 border-t border-orange-500/20 bg-orange-500/5 flex gap-2">
        <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleChat()}} placeholder="Hỏi thêm..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 outline-none transition"/>
        <button onClick={handleChat} disabled={!chatInput.trim()||chatLoading} className="w-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition-colors"><Send size={16}/></button>
      </div>
    </div>
  );

  return (
    <PageShell title="Tư Vấn & So Kèo" subtitle="Nói cho tao biết mày cần gì, tao tìm cho." icon="⚔️" accentColor="orange" maxWidth="4xl">
      <div className="mb-6"><GeminiKeyInput /></div>

      <div className="flex items-center gap-3 mb-6">
        {['consult','recommend','compare'].map((s,i)=>(
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step===s||(['recommend','compare'].indexOf(step)>=i)?'bg-orange-500 text-white':'bg-slate-700 text-slate-400'}`}>{i+1}</div>
            <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${step===s?'text-orange-400':'text-slate-500'}`}>{s==='consult'?'Nhu cầu':s==='recommend'?'Gợi ý':'So kèo'}</span>
            {i<2&&<ArrowRight size={14} className="text-slate-600 hidden sm:inline"/>}
          </div>
        ))}
      </div>

      {step==='consult'&&(
        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-5">Mày cần mua gì?</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">Muốn mua gì? *</label>
              <input type="text" value={category} onChange={e=>setCategory(e.target.value)} placeholder="VD: Điện thoại, Laptop gaming, Tai nghe chống ồn..." className="w-full bg-slate-50 dark:bg-[#1a2332] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 transition mb-2"/>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c=><button key={c} onClick={()=>setCategory(c)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${category===c?'bg-orange-500/20 border-orange-500 text-orange-400':'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}>{c}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">Ngân sách</label>
                <input type="text" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="VD: 15-20 triệu, dưới 10 triệu..." className="w-full bg-slate-50 dark:bg-[#1a2332] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 transition"/>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">Mục đích chính</label>
                <input type="text" value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="VD: Chơi Valorant, edit video, học online..." className="w-full bg-slate-50 dark:bg-[#1a2332] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 transition mb-2"/>
                <div className="flex flex-wrap gap-1.5">
                  {PURPOSES.map(p=><button key={p} onClick={()=>setPurpose(p)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${purpose===p?'bg-orange-500/20 border-orange-500 text-orange-400':'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}>{p}</button>)}
                </div>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">Điều quan trọng với bạn (thêm nhiều)</label>
              {priorities.length>0&&(
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {priorities.map((p,i)=>(
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 border border-blue-500/40 rounded-lg text-[11px] text-blue-400 font-medium">
                      {p}<button onClick={()=>setPriorities(prev=>prev.filter((_,idx)=>idx!==i))} className="hover:text-red-400 transition"><X size={10}/></button>
                    </span>
                  ))}
                </div>
              )}
              <input type="text" value={priorityInput} onChange={e=>setPriorityInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&priorityInput.trim()){setPriorities(prev=>[...prev,priorityInput.trim()]);setPriorityInput('');}}} placeholder="Gõ rồi Enter — VD: pin trâu, chụp đêm đẹp, không lag..." className="w-full bg-slate-50 dark:bg-[#1a2332] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500 transition mb-2"/>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map(p=><button key={p} onClick={()=>{if(!priorities.includes(p))setPriorities(prev=>[...prev,p]);}} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${priorities.includes(p)?'bg-blue-500/20 border-blue-500/40 text-blue-400':'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}>{p}</button>)}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">Đang dùng gì? (tùy chọn)</label>
              <input type="text" value={currentDevice} onChange={e=>setCurrentDevice(e.target.value)} placeholder="VD: iPhone 13, Laptop Asus cũ 5 năm..." className="w-full bg-slate-50 dark:bg-[#1a2332] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500 transition"/>
            </div>
          </div>
          {error&&<p className="mt-3 text-red-400 text-sm text-center bg-red-500/10 rounded-xl py-2">{error}</p>}
          <button onClick={handleConsult} disabled={loading||!category.trim()} className="w-full mt-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
            {loading?<><Sparkles size={18} className="animate-spin"/>Đang tìm... (~15s)</>:<><Sparkles size={18}/>TƯ VẤN CHO TAO</>}
          </button>
        </div>
      )}

      {step==='recommend'&&consultResult&&(
        <div className="space-y-4 fade-up">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
            <p className="text-sm text-orange-200 font-medium">{consultResult.greeting}</p>
          </div>

          <div className="space-y-3">
            {consultResult.recommendations.map((r,i)=>(
              <div key={i} onClick={()=>toggleSelect(r.name)} className={`bg-white dark:bg-[#131923] border rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${selected.includes(r.name)?'border-orange-500 ring-2 ring-orange-500/30':'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {consultResult.topPick===r.name&&<Star size={14} className="text-amber-400 fill-amber-400"/>}
                      <h3 className="text-sm font-bold text-slate-200">{r.name}</h3>
                    </div>
                    <p className="text-orange-400 font-bold text-xs">{r.price}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected.includes(r.name)?'bg-orange-500 border-orange-500':'border-slate-600'}`}>
                    {selected.includes(r.name)&&<span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2"><ThumbsUp size={12} className="text-emerald-400 shrink-0 mt-0.5"/><p className="text-slate-300">{r.whyGood}</p></div>
                  <div className="flex gap-2"><ThumbsDown size={12} className="text-red-400 shrink-0 mt-0.5"/><p className="text-slate-400">{r.whyBad}</p></div>
                  <p className="text-slate-500"><span className="text-emerald-400">✓</span> {r.bestFor} · <span className="text-red-400">✗</span> {r.notFor}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Top Pick</h3>
            <p className="text-sm text-slate-200 font-medium">{consultResult.topPickReason}</p>
            <p className="text-xs text-slate-400 mt-2 italic">💡 {consultResult.bonusTip}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={()=>{setStep('consult');setConsultResult(null);setSelected([]);}} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-bold transition">← Thay đổi nhu cầu</button>
            <button onClick={handleCompare} disabled={selected.length!==2||loading} className="flex-1 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
              {loading?<><Sparkles size={16} className="animate-spin"/>Đang so...</>:<><Swords size={16}/>So kèo {selected.length}/2</>}
            </button>
          </div>
          {error&&<p className="text-red-400 text-sm text-center">{error}</p>}
          {renderChat()}
        </div>
      )}

      {step==='compare'&&compareResult&&(
        <div className="space-y-4 fade-up">
          <div className="bg-gradient-to-r from-blue-600/10 via-transparent to-red-600/10 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-center flex-1">
                <div className={`text-3xl font-black ${compareResult.overallWinner==='p1'?'text-blue-500':'text-slate-400'}`}>{compareResult.score?.p1||0}</div>
                <p className="text-xs font-bold text-blue-400 mt-1">{compareResult.product1?.shortName}</p>
                {compareResult.overallWinner==='p1'&&<Trophy size={18} className="text-amber-400 mx-auto mt-1"/>}
              </div>
              <div className="text-xl font-black text-slate-500">VS</div>
              <div className="text-center flex-1">
                <div className={`text-3xl font-black ${compareResult.overallWinner==='p2'?'text-red-500':'text-slate-400'}`}>{compareResult.score?.p2||0}</div>
                <p className="text-xs font-bold text-red-400 mt-1">{compareResult.product2?.shortName}</p>
                {compareResult.overallWinner==='p2'&&<Trophy size={18} className="text-amber-400 mx-auto mt-1"/>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#131923] border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="grid grid-cols-[1fr_2fr_2fr_auto] gap-0">
              <div className="bg-slate-800/50 px-3 py-2.5 font-bold text-slate-500 uppercase">Hạng mục</div>
              <div className="bg-blue-500/10 px-3 py-2.5 font-bold text-blue-500 uppercase text-center truncate">{compareResult.product1?.shortName}</div>
              <div className="bg-red-500/10 px-3 py-2.5 font-bold text-red-500 uppercase text-center truncate">{compareResult.product2?.shortName}</div>
              <div className="bg-slate-800/50 px-3 py-2.5 font-bold text-slate-500 text-center">W</div>
              {(compareResult.specs||[]).map((s,i)=>(
                <div key={i} className="contents">
                  <div className={`px-3 py-3 font-semibold text-slate-300 border-t border-slate-800 ${i%2===0?'bg-slate-800/20':''}`}>{s.category}</div>
                  <div className={`px-3 py-3 text-slate-400 border-t border-slate-800 ${s.winner==='p1'?'bg-blue-500/5 font-medium text-blue-400':i%2===0?'bg-slate-800/20':''}`}>{s.p1}</div>
                  <div className={`px-3 py-3 text-slate-400 border-t border-slate-800 ${s.winner==='p2'?'bg-red-500/5 font-medium text-red-400':i%2===0?'bg-slate-800/20':''}`}>{s.p2}</div>
                  <div className={`px-3 py-3 border-t border-slate-800 flex items-center justify-center ${i%2===0?'bg-slate-800/20':''}`}>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.winner==='p1'?'bg-blue-500/20 text-blue-400':s.winner==='p2'?'bg-red-500/20 text-red-400':'bg-slate-500/20 text-slate-400'}`}>{s.winner==='p1'?'P1':s.winner==='p2'?'P2':'='}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Trophy size={14}/>Kết Luận</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{compareResult.verdict}</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
            <div className="relative">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Skull size={14} className="animate-bounce"/>Cà Khịa</h3>
              <p className="text-sm text-slate-200 italic">"{compareResult.roast}"</p>
            </div>
          </div>

          {compareResult.sources?.length>0&&(
            <div className="bg-[#131923] border border-slate-800 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5"><ExternalLink size={12}/>Nguồn</h3>
              <div className="flex flex-wrap gap-2">
                {compareResult.sources.slice(0,6).map((s,i)=><a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 text-[11px] text-slate-400 hover:text-orange-400 transition truncate max-w-[180px]">{s.title||`Nguồn ${i+1}`}</a>)}
              </div>
            </div>
          )}

          <button onClick={()=>{setStep('recommend');setCompareResult(null);}} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-bold transition">← Quay lại gợi ý</button>
          {renderChat()}
        </div>
      )}
    </PageShell>
  );
};

export default TechDuel;
