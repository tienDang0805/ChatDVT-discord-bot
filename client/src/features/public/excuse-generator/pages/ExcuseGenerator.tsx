import { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Check, RotateCcw, Frown, Sparkles } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { PageShell } from '../../../../shared/components/PageShell';

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
      const res = await fetch(`${API_BASE}/api/excuse-generator`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ geminiApiKey: getStoredGeminiKey() }) });
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
    <PageShell title="Máy Tạo Lý Do Nghỉ Phép" subtitle="AI-powered · Sếp cạn lời" icon="🚨" maxWidth="3xl">
      <style>{`
        @keyframes zoomIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 text-sm px-4 py-2 rounded-full mb-8 font-bold inline-flex items-center gap-2">
        <AlertTriangle size={16} /> Báo Động Đỏ: Hết Động Lực Làm Việc
      </div>

      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-16" style={{animation:'zoomIn .3s ease-out'}}>
          <button
            onClick={generateExcuse}
            className="group relative w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center transition-all duration-100 hover:scale-95 active:scale-90 shadow-[0_0_80px_rgba(239,68,68,0.3)] hover:shadow-[0_0_100px_rgba(239,68,68,0.5)]"
            style={{
              background: 'radial-gradient(circle at center, #ef4444 0%, #b91c1c 80%, #7f1d1d 100%)',
              border: '8px solid #450a0a'
            }}
          >
            <div className="absolute inset-2 rounded-full border-4 border-white/20" />
            <div className="absolute top-10 w-24 h-4 bg-white/30 rounded-full blur-sm" />
            <AlertTriangle size={56} className="text-white/90 mb-3 drop-shadow-lg" />
            <span className="text-2xl md:text-3xl font-black text-white/90 uppercase tracking-wider drop-shadow-md">ẤN ĐỂ NGHỈ</span>
          </button>
          <p className="mt-10 text-slate-400 dark:text-slate-500 font-medium animate-pulse text-center text-sm">
            ⚠️ Cảnh báo: Sử dụng quá liều có thể dẫn đến thất nghiệp thật.
          </p>
          <div className="mt-4 w-64"><GeminiKeyInput accent="amber" /></div>
          {error && <div className="mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm">{error}</div>}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-spin flex items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-[#0d1117] rounded-full flex items-center justify-center">
                <span className="text-3xl animate-bounce">🤖</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-500">Đang Vận Công Bịa Chuyện...</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Đang scan bộ não của sếp để tìm điểm mù phòng thủ</p>
          </div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-5" style={{animation:'slideUp .4s ease-out'}}>
          <div className="flex justify-between items-center">
            <button onClick={generateExcuse} className="flex items-center gap-2 bg-white dark:bg-[#1f2937] hover:bg-slate-50 dark:hover:bg-[#374151] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 px-4 py-2 rounded-xl transition-colors font-medium text-sm">
              <RotateCcw size={16} /> Quay Lại Lần Nữa
            </button>
          </div>

          <div className="relative bg-red-50 dark:bg-red-500/5 border-2 border-red-200 dark:border-red-500/20 rounded-2xl p-6 md:p-8 overflow-hidden">
            <Sparkles className="absolute top-4 right-4 text-orange-300 dark:text-orange-500/40" size={48} />
            <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Lý Do Tuyệt Mật
            </h2>
            <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight mb-6">"{data.excuse}"</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-[#131923] rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Tỉ Lệ Thành Công</p>
                <p className="text-2xl font-black text-orange-500 flex items-baseline gap-1">
                  {data.successRate} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ 100%</span>
                </p>
              </div>
              <div className="bg-white dark:bg-[#131923] rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Phản Ứng Của Sếp</p>
                <div className="flex items-start gap-2 mt-1">
                  <Frown className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">"{data.bossReaction}"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span className="bg-slate-100 dark:bg-[#1f2937] text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700">✉️ Template Copy</span>
              </h3>
              <button onClick={copyToClipboard} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-sm transition-all border ${copied ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' : 'bg-slate-50 dark:bg-[#1f2937] hover:bg-slate-100 dark:hover:bg-[#374151] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                {copied ? <><Check size={16} /> Đã Copy</> : <><Copy size={16} /> Copy Nhanh</>}
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-[#0d1117] p-4 rounded-xl font-mono text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
              {data.template}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
