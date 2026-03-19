import { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Check, RotateCcw, Frown, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface ExcuseData {
  excuse: string;
  bossReaction: string;
  successRate: string;
  template: string;
}

export default function ExcuseGenerator() {
  const [data, setData] = useState<ExcuseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Máy Tạo Lý Do Nghỉ Phép | devtiendang.blog';
  }, []);

  const generateExcuse = async () => {
    setLoading(true);
    setError('');
    setData(null);
    setCopied(false);
    try {
      const res = await fetch(`${API_BASE}/api/excuse-generator`, { method: 'POST' });
      if (!res.ok) throw new Error('Server lỗi');
      const json: ExcuseData = await res.json();
      setData(json);
    } catch {
      setError('Hệ thống sập rồi, nay chắc chắn phải đi làm!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (data?.template) {
      navigator.clipboard.writeText(data.template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center relative z-10 w-full">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-1.5 rounded-full mb-6 font-bold shadow-lg shadow-red-500/10">
          <AlertTriangle size={16} /> Báo Động Đỏ: Hết Động Lực Làm Việc
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 leading-tight">
          Máy Tạo Lý Do <br className="md:hidden" /> Nghỉ Phép
        </h1>
        <p className="text-slate-400 text-lg">Được hỗ trợ bởi AI — Đảm bảo sếp cạn lời, đuổi thẳng cổ.</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 w-full flex-1 flex flex-col items-center relative z-10">
        
        {/* Big Emergency Button */}
        {!data && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 animate-[zoomIn_0.3s_ease-out]">
            <button
              onClick={generateExcuse}
              className="group relative w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-100 hover:scale-95 active:scale-90 shadow-[0_0_100px_rgba(239,68,68,0.4)] hover:shadow-[0_0_120px_rgba(239,68,68,0.6)]"
              style={{
                background: 'radial-gradient(circle at center, #ef4444 0%, #b91c1c 80%, #7f1d1d 100%)',
                border: '8px solid #450a0a'
              }}
            >
              <div className="absolute inset-2 rounded-full border-4 border-white/20" />
              <div className="absolute top-10 w-24 h-4 bg-white/30 rounded-full blur-sm" />
              <AlertTriangle size={64} className="text-white/90 mb-4 drop-shadow-lg" />
              <span className="text-3xl font-black text-white/90 uppercase tracking-wider drop-shadow-md">ẤN ĐỂ NGHỈ</span>
            </button>
            <p className="mt-12 text-slate-500 font-medium animate-pulse text-center">
              ⚠️ Cảnh báo: Sử dụng quá liều có thể dẫn đến thất nghiệp thật.
            </p>
            {error && <p className="text-red-400 mt-4 bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-20">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-spin flex items-center justify-center">
                 <div className="w-24 h-24 bg-[#09090b] rounded-full flex items-center justify-center">
                   <span className="text-4xl animate-bounce">🤖</span>
                 </div>
              </div>
            </div>
            <div className="text-center space-y-2">
               <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Đang Vận Công Bịa Chuyện...</h3>
               <p className="text-slate-400">Đang scan bộ não của sếp để tìm điểm mù phòng thủ</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="w-full space-y-6 pb-20 animate-[slideUp_0.4s_ease-out]">
            {/* Action Header */}
            <div className="flex justify-between items-center mb-8">
               <button 
                 onClick={generateExcuse}
                 className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
               >
                 <RotateCcw size={16} /> Quay Lại Lần Nữa
               </button>
            </div>

            {/* Main Excuse Card */}
            <div className="relative bg-gradient-to-br from-red-500/10 to-transparent border-2 border-red-500/30 rounded-3xl p-6 md:p-8 overflow-hidden backdrop-blur-sm">
               <Sparkles className="absolute top-4 right-4 text-orange-500/40" size={48} />
               <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <AlertTriangle size={14} /> Lý Do Tuyệt Mật
               </h2>
               <p className="text-2xl md:text-3xl font-black text-white leading-tight mb-8">"{data.excuse}"</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tỉ Lệ Thành Công</p>
                    <p className="text-3xl font-black text-orange-400 flex items-baseline gap-1">
                      {data.successRate} <span className="text-sm font-normal text-slate-500">/ 100%</span>
                    </p>
                 </div>
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Phản Ứng Của Sếp Của Bạn</p>
                    <div className="flex items-start gap-3 mt-1">
                       <Frown className="text-red-400 shrink-0 mt-0.5" size={20} />
                       <p className="text-sm font-medium text-slate-300 italic">"{data.bossReaction}"</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Email Template Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-300 flex items-center gap-2">
                  <span className="bg-slate-800 text-xs px-2 py-1 rounded">✉️ Template Copy</span>
                </h3>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {copied ? <><Check size={16} /> Đã Copy</> : <><Copy size={16} /> Copy Nhanh</>}
                </button>
              </div>
              
              <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed border border-white/5">
                {data.template}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
