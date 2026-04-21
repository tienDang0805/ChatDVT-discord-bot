import { useRef, useState } from 'react';
import { MoonStar, Sparkles, BrainCircuit, Eye, Hash, MessageSquare, Bot, Send } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface DreamResult {
  psychology: string;
  mysticism: string;
  luckyNumbers: string;
  summary: string;
}

export const DreamInterpreter = () => {
  const [dream, setDream] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamResult | null>(null);
  const [error, setError] = useState('');

  const [chatMsgs, setChatMsgs] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const generateReading = async () => {
    if (!dream.trim() || dream.length < 10) {
      setError('Kể chi tiết thêm tí đi fen, ngắn quá thầy khó giải!');
      return;
    }

    const apiKey = getStoredGeminiKey();
    if (!apiKey) {
      setError('Vui lòng nhập Gemini API Key (bên trên) để gọi hồn Chu Công!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/dream-interpreter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream, geminiApiKey: apiKey }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Chu Công đang ngủ quên, thử lại sau nhé!');
      setResult(data);
      setChatMsgs([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const apiKey = getStoredGeminiKey();
    if (!apiKey) {
      setChatMsgs(prev => [...prev, { role: 'ai', text: 'Nhập API Key trước khi hỏi Chu Công nhé!' }]);
      return;
    }

    const q = chatInput.trim();
    setChatInput('');
    setChatMsgs(prev => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch(`${API_BASE}/api/dream-interpreter/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, dreamResult: result, dreamContext: dream, chatHistory: chatMsgs, geminiApiKey: apiKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi kết nối bồng lai tiên cảnh');
      setChatMsgs(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err: any) {
      setChatMsgs(prev => [...prev, { role: 'ai', text: 'Lỗi: ' + err.message }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <PageShell title="Giải Mộng AI" subtitle="Chu Công giải mộng: Đoán điềm tâm linh & phân tích khoa học" icon="🌙" accentColor="orange" maxWidth="3xl">
      <div className="mb-6">
        <GeminiKeyInput />
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MoonStar size={16} /> Chiết Tự Giấc Mơ
        </h2>

        <div className="relative">
          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="Kể lại giấc mơ của bạn đêm qua... (VD: Mình mơ thấy bị rụng răng, sếp rượt chạy vòng vòng công ty...)"
            className="w-full bg-slate-50 dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-5 py-4 outline-none focus:border-orange-500 dark:focus:border-orange-500/50 transition-colors resize-none min-h-[140px]"
          />
          <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400">
            {dream.length} ký tự
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <button 
          onClick={generateReading}
          disabled={loading || dream.trim().length < 5}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <><Sparkles size={18} className="animate-spin" /> Đang triệu hồi Chu Công...</>
          ) : (
            <><Sparkles size={18} /> Giải Mã Ngay</>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-4 fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-cyan-500/50 transition-colors">
              <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <BrainCircuit size={16} /> Góc Nhìn Tâm Lý Học
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.psychology}</p>
            </div>
            
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-violet-500/50 transition-colors">
              <h3 className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Eye size={16} /> Điềm Báo Tâm Linh
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.mysticism}</p>
            </div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Hash size={14} /> Con Số Hợp Vibe
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tham khảo cho vui, nghiêm cấm cờ bạc nhé 😂</p>
            </div>
            <div className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest bg-white dark:bg-[#131923] px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              {result.luckyNumbers}
            </div>
          </div>

          <div className="bg-slate-800 dark:bg-[#1a2332] text-white rounded-2xl p-5 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-semibold italic relative z-10">"{result.summary}"</p>
          </div>

          <div className="bg-[#131923] border border-indigo-500/20 rounded-2xl overflow-hidden shadow-sm mt-8">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-indigo-500/20 bg-indigo-500/5">
              <Bot size={18} className="text-indigo-400"/><span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Trò Chuyện Với Chu Công</span>
            </div>
            <div className="max-h-[350px] overflow-y-auto p-4 space-y-3" style={{scrollbarWidth:'thin',scrollbarColor:'#1f2937 transparent'}}>
              {chatMsgs.length === 0 && (
                <div className="text-center py-6">
                  <Bot size={36} className="text-indigo-500/50 mx-auto mb-3"/>
                  <p className="text-slate-500 text-sm mb-4">Bạn muốn hỏi thêm chi tiết nào trong giấc mơ không?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Ý nghĩa sâu xa hơn là gì?', 'Mình nên làm gì tiếp theo?', 'Vậy có báo mộng số nào khác không?'].map((q,i)=>(
                      <button key={i} onClick={()=>{setChatInput(q);}} className="px-3 py-1.5 bg-slate-800 rounded-lg border border-indigo-500/30 text-xs text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 transition">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMsgs.map((m,i)=>(
                <div key={i} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}>
                  {m.role==='ai' && <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><Bot size={16} className="text-white"/></div>}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role==='user'?'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100 rounded-tr-sm':'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-sm'}`}>{m.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0"><Bot size={16} className="text-white"/></div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3.5">
                    <div className="flex gap-1.5"><span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div className="p-3 border-t border-indigo-500/20 bg-indigo-500/5">
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleChat()}} placeholder="Hỏi Chu Công..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none transition"/>
                <button onClick={handleChat} disabled={!chatInput.trim()||chatLoading} className="w-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"><Send size={16}/></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default DreamInterpreter;
