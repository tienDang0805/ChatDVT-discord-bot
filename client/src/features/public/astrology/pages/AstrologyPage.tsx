import { useState, useRef, useEffect } from 'react';
import { MoonStar, Sun, Cloud, Sparkles, Loader2, SendHorizontal, Bot, BookOpen, Quote, RotateCcw } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { PageShell } from '../../../../shared/components/PageShell';

interface AstrologyTheme {
  canchi: string;
  amDuong: string;
  banMenh: string;
  cuc: string;
}

interface House {
  name: string;
  stars: string;
  description: string;
}

interface AstrologyResult {
  summary: AstrologyTheme;
  overview: string;
  houses: House[];
  currentYearForecast: string;
  advice: string;
  spiritQuote: string;
}

export const AstrologyPage = () => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Nam');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AstrologyResult | null>(null);

  const [chatMsgs, setChatMsgs] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Tử Vi AI Phương Đông | devtiendang.blog'; }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const steps = ['An sao bản mệnh...', 'Lập thế 12 cung...', 'Luận giải đại vận...', 'Đúc kết thiên cơ...'];
  useEffect(() => {
    if (isLoading) {
      const t = setInterval(() => setLoadingStep(s => (s + 1) % steps.length), 2500);
      return () => clearInterval(t);
    }
  }, [isLoading]);

  const submit = async () => {
    if (!fullName.trim() || !birthDate || !birthTime) {
      setError('Vui lòng nhập đầy đủ để thầy lấy lá số!');
      return;
    }
    setError(''); setIsLoading(true); setResult(null); setLoadingStep(0);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/astrology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), gender, birthDate, birthTime, geminiApiKey: getStoredGeminiKey() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } catch (e: any) {
      setError(e.message || 'Lệnh bài bị từ chối!');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !result || chatLoading) return;
    const q = chatInput.trim(); setChatInput('');
    setChatMsgs(p => [...p, { role: 'user', text: q }]); setChatLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/astrology/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, gender, birthDate, birthTime, question: q, astrologyResult: result, chatHistory: chatMsgs.slice(-10), geminiApiKey: getStoredGeminiKey() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMsgs(p => [...p, { role: 'ai', text: data.answer }]);
    } catch (e: any) {
      setChatMsgs(p => [...p, { role: 'ai', text: '⚠️ Thầy đang bối rối: ' + (e.message || 'Lỗi') }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  };

  const reset = () => {
    setResult(null); setError(''); setChatMsgs([]); setChatInput('');
  };

  return (
    <PageShell title="Tử Vi AI Phương Đông" subtitle="Mệnh Hảo Bất Như Vận Hảo" icon="🌙" maxWidth="4xl">
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(15px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .gold-border { border-color: rgba(212, 175, 55, 0.3); }
        .gold-text { background: linear-gradient(135deg, #FFDF73, #D4AF37, #997A15); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gold-bg { background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05)); }
      `}</style>

        {/* INPUT FORM */}
        {!result && (
          <div className="max-w-xl mx-auto fade-in">
            <div className="bg-[#110606] border border-red-900/40 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
               
               <div className="space-y-5">
                 <div>
                   <label className="block text-xs font-bold text-[#D4AF37] mb-2 uppercase tracking-widest">Họ Tên Đương Số</label>
                   <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="VD: Nguyễn Văn A" className="w-full bg-[#1a0a0a] border border-red-900/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 text-[#e5e7eb] rounded-xl px-4 py-3.5 text-sm md:text-base outline-none transition uppercase" disabled={isLoading} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#D4AF37] mb-2 uppercase tracking-widest">Giới Tính</label>
                      <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-[#1a0a0a] border border-red-900/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 text-[#e5e7eb] rounded-xl px-4 py-3.5 text-sm md:text-base outline-none transition" disabled={isLoading}>
                         <option value="Nam">Nam Nhân</option>
                         <option value="Nữ">Nữ Nhân</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#D4AF37] mb-2 uppercase tracking-widest">Giờ Sinh</label>
                      <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} className="w-full bg-[#1a0a0a] border border-red-900/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 text-[#e5e7eb] rounded-xl px-4 py-3.5 text-sm md:text-base outline-none transition [color-scheme:dark]" disabled={isLoading} />
                    </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-[#D4AF37] mb-2 uppercase tracking-widest">Ngày Sinh (Dương Lịch)</label>
                   <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-[#1a0a0a] border border-red-900/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 text-[#e5e7eb] rounded-xl px-4 py-3.5 text-sm md:text-base outline-none transition [color-scheme:dark]" disabled={isLoading} />
                 </div>

                 <GeminiKeyInput accent="amber" />
                 
                 {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">⚠️ {error}</div>}

                 <button onClick={submit} disabled={isLoading} className="w-full bg-gradient-to-r from-[#8a1c1c] to-[#4a0d0d] hover:from-[#a02222] hover:to-[#5e1313] text-[#FFDF73] border border-[#D4AF37]/50 font-bold py-4 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2.5 text-base shadow-[0_4px_20px_rgba(138,28,28,0.3)] shadow-[#8a1c1c]/20 uppercase tracking-widest mt-2 active:scale-95">
                   {isLoading ? <><Loader2 size={18} className="animate-spin" /> {steps[loadingStep]}</> : <><Sparkles size={18} /> Lập Lá Số AI</>}
                 </button>
               </div>

            </div>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div ref={resultRef} className="space-y-6 fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="gold-text font-bold uppercase tracking-widest flex items-center gap-2"><BookOpen size={20} /> Lá Số Thiên Cơ</h3>
                <button onClick={reset} className="flex items-center gap-1.5 text-xs text-[#a3947c] border border-red-900/30 bg-[#110606] px-3 py-1.5 rounded-lg hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition">
                  <RotateCcw size={14} /> Làm lá số mới
                </button>
             </div>

             {/* FOUR PILLARS SUMMARY */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {[ 
                 { label: 'Can Chi', val: result.summary.canchi }, 
                 { label: 'Âm Dương', val: result.summary.amDuong }, 
                 { label: 'Bản Mệnh', val: result.summary.banMenh }, 
                 { label: 'Phân Cục', val: result.summary.cuc } 
               ].map((item, i) => (
                 <div key={i} className="bg-[#110606] border border-[#D4AF37]/20 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] text-[#a3947c] uppercase tracking-widest mb-1.5">{item.label}</span>
                    <span className="text-sm md:text-base font-bold text-[#e5e7eb]">{item.val}</span>
                 </div>
               ))}
             </div>

             {/* OVERVIEW */}
             <div className="gold-bg border border-[#D4AF37]/30 p-6 md:p-8 rounded-2xl shadow-xl relative mt-8">
                <Quote className="absolute -top-4 -left-2 text-[#D4AF37]/20 rotate-180" size={64} />
                <p className="text-base md:text-lg text-[#e5e7eb] leading-relaxed relative z-10 font-medium" style={{ fontFamily: 'serif' }}>
                  "{result.overview}"
                </p>
                <div className="mt-4 pt-4 border-t border-[#D4AF37]/20 text-right">
                   <p className="text-[#D4AF37] text-sm italic">— AI Đại Sư Phê Chú</p>
                </div>
             </div>

             {/* THE HOUSES (12 Cung nhưng tóm gọn 6) */}
             <div className="mt-8">
                <h4 className="gold-text font-bold uppercase tracking-widest mb-5 ml-1">Lục Cung Trọng Điểm</h4>
                <div className="grid md:grid-cols-2 gap-4">
                   {result.houses.map((house, i) => (
                     <div key={i} className="bg-[#110606] border border-red-900/40 rounded-xl p-5 hover:border-[#D4AF37]/40 transition-colors shadow-lg">
                        <div className="flex items-center justify-between mb-3 border-b border-red-900/30 pb-3">
                           <h5 className="font-bold text-[#D4AF37] uppercase tracking-widest text-sm flex items-center gap-2"><Sun size={14} /> {house.name}</h5>
                        </div>
                        <p className="text-xs text-[#a3947c] mb-2 font-mono bg-red-900/10 px-2 py-1 rounded inline-block">Chiếu: {house.stars}</p>
                        <p className="text-sm text-[#d1d5db] leading-relaxed">{house.description}</p>
                     </div>
                   ))}
                </div>
             </div>

             {/* FORECAST & ADVICE */}
             <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-[#110606] border border-red-900/40 rounded-xl p-5 md:p-6 shadow-lg">
                   <h5 className="font-bold text-[#D4AF37] uppercase tracking-widest text-sm mb-3">Đại Vận Năm Nay</h5>
                   <p className="text-sm text-[#d1d5db] leading-relaxed">{result.currentYearForecast}</p>
                </div>
                <div className="bg-[#110606] border border-red-900/40 rounded-xl p-5 md:p-6 shadow-lg">
                   <h5 className="font-bold text-[#D4AF37] uppercase tracking-widest text-sm mb-3">Lời Khuyên Tu Tâm</h5>
                   <p className="text-sm text-[#d1d5db] leading-relaxed">{result.advice}</p>
                   <p className="mt-4 text-xs font-serif text-[#D4AF37] italic opacity-80 pt-3 border-t border-red-900/30">📜 {result.spiritQuote}</p>
                </div>
             </div>

             {/* CHAT WITH MASTER */}
             <div className="bg-[#110606] border border-[#D4AF37]/30 rounded-2xl shadow-2xl mt-8 overflow-hidden relative">
                <div className="flex items-center gap-3 px-6 py-4 bg-[#1a0a0a] border-b border-[#D4AF37]/20">
                   <Bot size={20} className="text-[#D4AF37]" />
                   <h4 className="font-bold text-[#D4AF37] uppercase tracking-widest text-sm">Hỏi Thầy Tử Vi</h4>
                </div>
                
                <div className="p-4 md:p-6 h-[400px] overflow-y-auto space-y-4 custom-scrollbar bg-gradient-to-b from-[#110606] to-[#0a0505]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#8a1c1c transparent' }}>
                   {chatMsgs.length === 0 && (
                     <div className="text-center py-12">
                        <Cloud size={48} className="text-red-900/40 mx-auto mb-4" />
                        <p className="text-[#a3947c] text-sm">Có vướng bận gì về vận mệnh, hãy hỏi lão phu...</p>
                     </div>
                   )}
                   {chatMsgs.map((m, i) => (
                      <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                         {m.role === 'ai' && <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 bg-[#1a0a0a]"><Bot size={14} className="text-[#D4AF37]"/></div>}
                         <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#8a1c1c]/20 border border-[#8a1c1c]/30 text-[#e5e7eb] rounded-tr-sm' : 'bg-[#1a0a0a] border border-[#D4AF37]/10 text-[#d1d5db] rounded-tl-sm'}`}>
                           {m.text}
                         </div>
                      </div>
                   ))}
                   {chatLoading && (
                      <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center shrink-0 bg-[#1a0a0a]"><Bot size={14} className="text-[#D4AF37]"/></div>
                         <div className="bg-[#1a0a0a] border border-[#D4AF37]/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center">
                            <Loader2 size={16} className="text-[#D4AF37] animate-spin" />
                         </div>
                      </div>
                   )}
                   <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-[#1a0a0a] border-t border-[#D4AF37]/20">
                   <div className="flex gap-2 relative">
                      <input 
                        ref={chatInputRef} type="text" value={chatInput} 
                        onChange={e => setChatInput(e.target.value)} 
                        onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
                        placeholder="Thưa thầy, năm nay con chuyển việc được không?"
                        className="flex-1 bg-[#0a0505] border border-red-900/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 text-[#e5e7eb] rounded-xl pl-4 pr-12 py-3.5 text-sm outline-none transition placeholder:text-red-900/50"
                        disabled={chatLoading}
                      />
                      <button 
                        onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                        className="absolute right-2 top-1.5 bottom-1.5 bg-[#D4AF37] hover:bg-[#FFDF73] text-[#110606] px-3 rounded-lg font-bold transition flex items-center justify-center disabled:opacity-50"
                      >
                        <SendHorizontal size={18} />
                      </button>
                   </div>
                </div>
             </div>

          </div>
        )}
    </PageShell>
  );
}
