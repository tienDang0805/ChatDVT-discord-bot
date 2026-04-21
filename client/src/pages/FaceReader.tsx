import { useState, useRef } from 'react';
import { ScanFace, Upload, Sparkles, Coins, Heart, Skull, Zap, MessageSquare, Bot, Send, Activity, UserCircle } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface FaceReadingResult {
  overview: string;
  wealth: string;
  love: string;
  healthSocial: string;
  roast: string;
  advice: string;
}

export const FaceReader = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [chatMsgs, setChatMsgs] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ảnh quá lớn. Vui lòng chọn ảnh < 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const generateReading = async () => {
    if (!imageFile) {
      setError('Hãy upload một bức ảnh cận mặt để thầy soi nhé!');
      return;
    }

    const apiKey = getStoredGeminiKey();
    if (!apiKey) {
      setError('Vui lòng nhập Gemini API Key (bên trên) để thầy mở thiên nhãn!');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('geminiApiKey', apiKey);

    try {
      const res = await fetch(`${API_BASE}/api/face-reader`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Thầy bói đang bận chạy KPI, thử lại sau nhé!');
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
      setChatMsgs(prev => [...prev, { role: 'ai', text: 'Nhập API Key trước khi hỏi thầy nhé!' }]);
      return;
    }

    const q = chatInput.trim();
    setChatInput('');
    setChatMsgs(prev => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch(`${API_BASE}/api/face-reader/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, faceResult: result, chatHistory: chatMsgs, geminiApiKey: apiKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi kết nối âm phủ');
      setChatMsgs(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err: any) {
      setChatMsgs(prev => [...prev, { role: 'ai', text: 'Lỗi: ' + err.message }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <PageShell title="Tướng Thuật AI" subtitle="Thầy soi tiền tài, tình duyên, và nghiệp chướng của bạn" icon="👁️" accentColor="orange" maxWidth="3xl">
      <div className="mb-6">
        <GeminiKeyInput />
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ScanFace size={16} /> Gửi Căn Cước Tâm Linh
        </h2>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a2332] hover:border-orange-500/50 transition-colors group relative overflow-hidden"
        >
          {imagePreview ? (
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-orange-500/20 shadow-lg">
              <img src={imagePreview} alt="Face Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white font-bold flex items-center gap-2">
                  <Upload size={16} /> Đổi ảnh
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Click hoặc Kéo thả ảnh vào đây</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">Chụp cận mặt, rõ ngũ quan để thầy soi cho chuẩn nhé (Max 5MB)</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <button 
          onClick={generateReading}
          disabled={loading || !imageFile}
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <><Sparkles size={18} className="animate-spin" /> Thầy đang mở Thiên Nhãn...</>
          ) : (
            <><ScanFace size={18} /> Soi Tướng Ngay</>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-4 fade-up">
          <div className="bg-slate-50 dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm group hover:border-blue-500/50 transition-colors">
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <UserCircle size={16} /> Tổng Quan Tam Đình & Khí Sắc
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{result.overview}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-amber-500/50 transition-colors">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Coins size={16} /> Quan Lộc & Tài Bạch
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.wealth}</p>
            </div>
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-pink-500/50 transition-colors">
              <h3 className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Heart size={16} /> Phu Thê & Tử Tức
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.love}</p>
            </div>
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/50 transition-colors md:col-span-2">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity size={16} /> Tật Ách & Nô Bộc
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.healthSocial}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-violet-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors" />
            <div className="relative">
              <h3 className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Skull size={16} className="animate-bounce" /> Vạch Mặt Nghiệp Chướng
              </h3>
              <p className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-4 border-violet-500 pl-4">
                "{result.roast}"
              </p>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
              <Zap size={24} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Lời Khuyên Cải Vận</h3>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{result.advice}</p>
            </div>
          </div>

          <div className="bg-[#131923] border border-orange-500/20 rounded-2xl overflow-hidden shadow-sm mt-8">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-orange-500/20 bg-orange-500/5">
              <Bot size={18} className="text-orange-500"/><span className="text-sm font-bold text-orange-500 uppercase tracking-wider">Hỏi Thêm Thầy Bói</span>
            </div>
            <div className="max-h-[350px] overflow-y-auto p-4 space-y-3" style={{scrollbarWidth:'thin',scrollbarColor:'#1f2937 transparent'}}>
              {chatMsgs.length === 0 && (
                <div className="text-center py-6">
                  <Bot size={36} className="text-orange-500/50 mx-auto mb-3"/>
                  <p className="text-slate-500 text-sm mb-4">Bạn muốn hỏi chi tiết hơn về đường tài lộc hay tình duyên?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Bao giờ con mới giàu?', 'Crush hiện tại có hợp không?', 'Sao dạo này xui quá thầy?'].map((q,i)=>(
                      <button key={i} onClick={()=>{setChatInput(q);}} className="px-3 py-1.5 bg-slate-800 rounded-lg border border-orange-500/30 text-xs text-slate-300 hover:text-orange-400 hover:border-orange-500/50 transition">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMsgs.map((m,i)=>(
                <div key={i} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}>
                  {m.role==='ai' && <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 mt-0.5"><Bot size={16} className="text-white"/></div>}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role==='user'?'bg-orange-500/20 border border-orange-500/30 text-orange-100 rounded-tr-sm':'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-sm'}`}>{m.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0"><Bot size={16} className="text-white"/></div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3.5">
                    <div className="flex gap-1.5"><span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div className="p-3 border-t border-orange-500/20 bg-orange-500/5">
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleChat()}} placeholder="Nhập câu hỏi cho thầy..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 outline-none transition"/>
                <button onClick={handleChat} disabled={!chatInput.trim()||chatLoading} className="w-11 flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition-colors"><Send size={16}/></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default FaceReader;
