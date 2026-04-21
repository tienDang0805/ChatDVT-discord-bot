import { useState, useRef } from 'react';
import { ScanFace, Upload, Sparkles, Coins, Heart, Skull, Zap } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import GeminiKeyInput, { getStoredGeminiKey } from '../components/GeminiKeyInput';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface FaceReadingResult {
  wealth: string;
  love: string;
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-amber-500/50 transition-colors">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Coins size={16} /> Cung Tài Lộc
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.wealth}</p>
            </div>
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-pink-500/50 transition-colors">
              <h3 className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Heart size={16} /> Đường Tình Duyên
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.love}</p>
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

          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-2xl p-5 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
              <Zap size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Thầy Phán</h3>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{result.advice}</p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default FaceReader;
