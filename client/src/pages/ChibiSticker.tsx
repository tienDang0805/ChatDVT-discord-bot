import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Sparkles, Download, RotateCcw, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';
import { PageShell } from '../components/PageShell';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PRESET_POSES = [
  { id: 'wave', label: 'Vẫy tay chào', emoji: '👋' },
  { id: 'gift', label: 'Cầm quà tặng', emoji: '🎁' },
  { id: 'bear', label: 'Ôm gấu bông', emoji: '🧸' },
  { id: 'heart', label: 'Cầm trái tim', emoji: '❤️' },
  { id: 'balloon', label: 'Cầm bóng bay', emoji: '🎈' },
  { id: 'selfie', label: 'Selfie', emoji: '🤳' },
  { id: 'cookie', label: 'Ăn vặt cookie', emoji: '🍪' },
  { id: 'sleep', label: 'Ngủ gật', emoji: '😴' },
  { id: 'party', label: 'Ăn mừng party', emoji: '🎉' },
  { id: 'flower', label: 'Cầm hoa', emoji: '🌸' },
  { id: 'angry', label: 'Giận dỗi', emoji: '😤' },
  { id: 'cry', label: 'Khóc nhè', emoji: '😢' },
  { id: 'love', label: 'Thả tim', emoji: '💕' },
  { id: 'peace', label: 'Dấu hiệu V', emoji: '✌️' },
  { id: 'thumbup', label: 'Like thả ga', emoji: '👍' },
];

const CHIBI_STYLES = [
  { id: 'kawaii', label: 'Kawaii', emoji: '🌟' },
  { id: 'anime-sd', label: 'Anime SD', emoji: '⚔️' },
  { id: 'line-sticker', label: 'LINE Sticker', emoji: '💬' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
  { id: 'pixel', label: 'Pixel Art', emoji: '👾' },
];

const BACKGROUNDS = [
  { id: 'transparent', label: 'Trong suốt', emoji: '🔲' },
  { id: 'white', label: 'Trắng', emoji: '⬜' },
  { id: 'gradient', label: 'Gradient', emoji: '🌈' },
];

const IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', label: 'Nano Banana', tier: '⚡ Nhanh', desc: 'Nhanh, tiết kiệm token' },
  { id: 'gemini-3.1-flash-image-preview', label: 'Nano Banana 2', tier: '🎯 Cân bằng', desc: 'Chất lượng tốt, tốc độ ổn' },
  { id: 'gemini-3-pro-image-preview', label: 'Nano Banana Pro', tier: '👑 Premium', desc: 'Chất lượng cao nhất' },
];

export const ChibiSticker = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [mode, setMode] = useState<'real' | 'chibi-ref'>('real');
  const [chibiStyle, setChibiStyle] = useState('kawaii');
  const [background, setBackground] = useState('transparent');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash-image');
  const [selectedPoses, setSelectedPoses] = useState<string[]>([]);
  const [customPose, setCustomPose] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Chibi Sticker AI | devtiendang.blog';
  }, []);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Chỉ hỗ trợ file ảnh!'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Ảnh tối đa 5MB!'); return; }
    setImageFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, []);

  const togglePose = (label: string) => {
    setSelectedPoses(prev =>
      prev.includes(label)
        ? prev.filter(p => p !== label)
        : prev.length < 9 ? [...prev, label] : prev
    );
  };

  const addCustomPose = () => {
    const trimmed = customPose.trim();
    if (!trimmed || selectedPoses.length >= 9) return;
    if (!selectedPoses.includes(trimmed)) {
      setSelectedPoses(prev => [...prev, trimmed]);
    }
    setCustomPose('');
  };

  const generate = async () => {
    if (!imageFile) { setError('Upload ảnh trước!'); return; }
    setLoading(true);
    setError('');
    setResultImages([]);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('mode', mode);
    formData.append('chibiStyle', chibiStyle);
    formData.append('background', background);
    formData.append('poses', JSON.stringify(selectedPoses));
    formData.append('geminiApiKey', getStoredGeminiKey() || '');
    formData.append('aiModel', aiModel);

    try {
      const res = await fetch(`${API_BASE}/api/chibi-sticker`, { method: 'POST', body: formData });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Lỗi server'); }
      const data = await res.json();
      setResultImages(data.images || []);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo sticker!');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (base64: string, idx: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `chibi-sticker-${idx + 1}.png`;
    link.click();
  };

  const downloadAll = () => {
    resultImages.forEach((img, i) => {
      setTimeout(() => downloadImage(img, i), i * 200);
    });
  };

  const reset = () => {
    setResultImages([]);
    setError('');
  };

  const inputClass = 'w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all';

  return (
    <PageShell title="Chibi Sticker AI" subtitle="Biến ảnh thật thành bộ sticker siêu cute" icon="🎨" maxWidth="3xl">
      <style>{`
        @keyframes bounce-draw{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-8px) rotate(-5deg)}75%{transform:translateY(-4px) rotate(5deg)}}
        .bounce-draw{animation:bounce-draw 2s ease-in-out infinite}
        @keyframes sticker-pop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
        .sticker-pop{animation:sticker-pop .5s cubic-bezier(.34,1.56,.64,1) both}
      `}</style>

      {!resultImages.length && !loading && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-8 shadow-sm space-y-5">

            <div>
              <label className="block text-sm font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-2">Chế Độ</label>
              <div className="flex bg-slate-100 dark:bg-[#0d1117] rounded-xl p-1 gap-1">
                <button onClick={() => setMode('real')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'real' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>📸 Từ ảnh thật</button>
                <button onClick={() => setMode('chibi-ref')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'chibi-ref' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>🎨 Từ chibi có sẵn</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-2">
                {mode === 'real' ? 'Upload Ảnh Thật' : 'Upload Ảnh Chibi Tham Chiếu'} *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:border-violet-500/50 ${imagePreview ? 'border-violet-500 bg-violet-500/5' : 'border-slate-300 dark:border-slate-700'}`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                    <button onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={32} className="mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500">Kéo thả hoặc click để chọn ảnh</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, WEBP — tối đa 5MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-2">Chibi Style</label>
              <div className="grid grid-cols-5 gap-2">
                {CHIBI_STYLES.map(s => (
                  <button key={s.id} onClick={() => setChibiStyle(s.id)} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-semibold transition-all ${chibiStyle === s.id ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 scale-[1.02]' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-500/50'}`}>
                    <span className="text-base">{s.emoji}</span>
                    <span className="text-[10px]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-2">Nền</label>
              <div className="flex gap-2">
                {BACKGROUNDS.map(b => (
                  <button key={b.id} onClick={() => setBackground(b.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${background === b.id ? 'bg-violet-500 text-white shadow' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-violet-500/50'}`}>
                    <span>{b.emoji}</span> {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-2">AI Model</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {IMAGE_MODELS.map(m => (
                  <button key={m.id} onClick={() => setAiModel(m.id)} className={`flex flex-col items-start p-3 rounded-xl text-left transition-all ${aiModel === m.id ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-500/50'}`}>
                    <span className="text-xs font-black">{m.tier}</span>
                    <span className="text-[10px] font-semibold mt-0.5">{m.label}</span>
                    <span className={`text-[9px] mt-0.5 ${aiModel === m.id ? 'text-white/70' : 'text-slate-400'}`}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">Chọn Pose ({selectedPoses.length}/9)</label>
                {selectedPoses.length > 0 && <button onClick={() => setSelectedPoses([])} className="text-[10px] text-slate-400 hover:text-red-400">Xóa hết</button>}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {PRESET_POSES.map(p => (
                  <button key={p.id} onClick={() => togglePose(p.label)} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${selectedPoses.includes(p.label) ? 'bg-violet-500 text-white shadow' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-500/50'}`}>
                    <span>{p.emoji}</span> <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" value={customPose} onChange={e => setCustomPose(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomPose()} placeholder="✍️ Gõ pose riêng rồi Enter..." className={inputClass} maxLength={40} />
                <button onClick={addCustomPose} disabled={!customPose.trim() || selectedPoses.length >= 9} className="px-4 py-2 bg-violet-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 shrink-0">+</button>
              </div>
              {selectedPoses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedPoses.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 font-semibold">
                      {i + 1}. {p}
                      <button onClick={() => setSelectedPoses(prev => prev.filter((_, j) => j !== i))} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Để trống → dùng 9 pose mặc định</p>
            </div>

            <GeminiKeyInput accent="violet" />

            {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm">{error}</div>}

            <button onClick={generate} disabled={!imageFile} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-black text-lg rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:shadow-none transition-all disabled:cursor-not-allowed active:scale-[0.98] uppercase tracking-wider">
              <Sparkles size={22} />
              Tạo Sticker
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
            <span className="text-5xl bounce-draw">🎨</span>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-violet-500">Đang vẽ sticker...</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 animate-pulse">AI đang chibi hoá nhân vật của bạn 🖌️</p>
          </div>
        </div>
      )}

      {resultImages.length > 0 && (
        <div ref={resultRef} className="space-y-5">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-white" />
                <h2 className="text-white font-black text-lg">Bộ Sticker</h2>
              </div>
              <button onClick={downloadAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all">
                <Download size={14} /> Tải tất cả
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className={`grid ${resultImages.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
                {resultImages.map((img, i) => (
                  <div key={i} className="sticker-pop group relative bg-slate-50 dark:bg-[#0d1117] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ animationDelay: `${i * 0.1}s` }}>
                    <img src={`data:image/png;base64,${img}`} alt={`Sticker ${i + 1}`} className="w-full aspect-square object-contain p-2" loading="lazy" />
                    <button onClick={() => downloadImage(img, i)} className="absolute bottom-2 right-2 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]">
              <RotateCcw size={16} /> Tạo Bộ Mới
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default ChibiSticker;
