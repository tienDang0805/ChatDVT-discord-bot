import { useState } from 'react';
import { MoonStar, Sparkles, BrainCircuit, Eye, Hash } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import GeminiKeyInput, { getStoredGeminiKey } from '../components/GeminiKeyInput';

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        </div>
      )}
    </PageShell>
  );
};

export default DreamInterpreter;
