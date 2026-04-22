import React, { useState, useRef, useEffect } from 'react';
import { Upload, Scan, AlertTriangle, Share2 } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { PageShell } from '../../../../shared/components/PageShell';

interface FeatureRating {
  part: string;
  comment: string;
  rating: number;
}

interface AnalysisResult {
  score: number;
  overall: string;
  features: FeatureRating[];
  advice: string;
}

// --- COMPONENT: IMAGE UPLOADER ---
const ImageUploaderCard = ({ image, fileInputRef, onUpload, onStart, onReset, isScanning, hasResult }: any) => {
  return (
    <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
      {!image ? (
        <div 
          className="border-2 border-dashed border-slate-600 hover:border-orange-500 rounded-lg h-80 flex flex-col items-center justify-center cursor-pointer transition-colors group relative bg-[#0d1117]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} className="text-slate-500 group-hover:text-orange-500 mb-4 group-hover:-translate-y-2 transition-all" />
          <p className="text-slate-400 font-bold group-hover:text-white transition-colors">BẤM VÀO ĐÂY ĐỂ TẢI ẢNH LÊN</p>
          <p className="text-xs text-slate-600 mt-2">Chấp nhận JPG, PNG, WEBP (Tối đa xạo lồng)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="relative flex-1 min-h-[320px] rounded-lg overflow-hidden border border-slate-700 bg-black">
          <img src={image} alt="Target" className="w-full h-full object-contain" />
          
          {isScanning && (
            <>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-[url('https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/matrix-rain.gif')] opacity-10 mix-blend-screen pointer-events-none" />
            </>
          )}
          {hasResult && (
             <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(239,68,68,0.3)] pointer-events-none" />
          )}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        {image && !isScanning && !hasResult && (
          <button 
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold py-3 rounded hover:from-orange-500 hover:to-pink-500 transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            <Scan size={20} /> PHÂN TÍCH NGAY
          </button>
        )}
        {image && (
          <button 
            onClick={onReset}
            disabled={isScanning}
            className="px-6 bg-[#1f2937] text-slate-300 font-bold py-3 rounded hover:bg-[#374151] border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full flex-1"
          >
            Huỷ/Đổi Ảnh
          </button>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: TERMINAL SCANNER ---
const TerminalScanner = ({ logs, scanProgress, isScanning }: any) => {
  return (
    <div className="bg-black border border-slate-800 rounded-xl p-6 font-mono text-sm shadow-2xl flex flex-col h-full min-h-[400px]">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-slate-500 font-bold tracking-widest text-xs">AI_CONSOLE_V3.1.sys</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 text-green-400">
        {logs.map((log: string, index: number) => (
          <div key={index} className="flex gap-2">
            <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
            <span className={index === logs.length - 1 && isScanning ? 'animate-pulse' : ''}>
              {log}
            </span>
          </div>
        ))}
        {isScanning && (
          <div className="mt-4">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300 ease-out"
                style={{ width: scanProgress + '%' }}
              />
            </div>
            <p className="text-cyan-400 mt-2 text-xs">Đang nạp dữ liệu... {scanProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: RESULT DASHBOARD ---
const ResultDashboard = ({ result, shareResult }: { result: AnalysisResult, shareResult: () => void }) => {
  return (
    <div className="bg-[#0b0f19] border border-red-500/30 rounded-xl p-6 md:p-8 shadow-[0_0_40px_rgba(239,68,68,0.1)] flex flex-col h-full animate-fade-in relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] pointer-events-none rounded-full" />
      
      {/* Header & Score */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border-b border-slate-800 pb-6 mb-6 relative z-10">
        <div className="flex-1 text-center md:text-left">
           <h4 className="flex items-center justify-center md:justify-start gap-2 text-red-500 font-bold mb-2 uppercase tracking-widest text-sm">
             <AlertTriangle size={18} /> HỒ SƠ TỘI PHẠM NHAN SẮC
           </h4>
           <p className="text-slate-300 text-lg md:text-xl italic leading-relaxed">
             "{result.overall}"
           </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl min-w-[140px] text-center shrink-0 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
           <p className="text-slate-500 text-xs font-bold uppercase mb-1">DEEP-SCAN SCORE</p>
           <div className="text-5xl font-black text-red-500 tracking-tighter">
             {result.score}<span className="text-xl text-red-500/50">PTS</span>
           </div>
        </div>
      </div>

      {/* Grid Features */}
      <div className="mb-4">
         <h5 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Chi tiết cấu trúc sinh học:</h5>
         <div className="grid sm:grid-cols-2 gap-4">
           {result.features.map((f, i) => (
             <div key={i} className="bg-[#121826] border border-slate-800 hover:border-slate-600 transition-colors rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden group">
               <div className="absolute left-0 top-0 w-1 h-full bg-slate-800 group-hover:bg-cyan-500 transition-colors" />
               <div className="flex justify-between items-center pl-2">
                 <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">{f.part}</span>
                 <span className="text-pink-500 font-bold bg-pink-500/10 px-2 py-1 rounded text-xs">{f.rating}/10</span>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed pl-2">{f.comment}</p>
             </div>
           ))}
         </div>
      </div>

      {/* Advice Block */}
      <div className="mt-auto pt-6">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg relative overflow-hidden">
           <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500" />
           <p className="text-yellow-500 text-xs font-bold uppercase mb-2 flex items-center gap-2 pl-2">
              <AlertTriangle size={14} /> KIẾN NGHỊ TỪ HỆ THỐNG
           </p>
           <p className="text-yellow-100/80 text-sm md:text-base pl-2">{result.advice}</p>
        </div>

        <button 
          onClick={shareResult}
          className="w-full mt-4 bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-100 py-4 rounded-lg flex items-center justify-center gap-3 font-bold transition-all active:scale-95 text-sm uppercase tracking-wider"
        >
          <Share2 size={18} /> COPY KẾT QUẢ ĐỂ KHÈ TRẺ TRÂU
        </button>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export const HandsomeAnalyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Máy Quét Nhan Sắc AI | devtiendang.blog";
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Chỉ chấp nhận file ảnh thôi ba nội!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800; // Tiết kiệm Token API

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Nén ảnh chất lượng 70% ra base64
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImage(compressedBase64);
          setResult(null);
          setLogs([]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsScanning(true);
    setScanProgress(0);
    setResult(null);
    setLogs(["Đang khởi động cảm biến lượng tử...", "Thiết lập kết nối với Gemini AI..."]);

    const analysisSteps = [
      "Tải ảnh màn hình lên máy chủ trung tâm...",
      "Quét cấu trúc võng mạc và xương hàm...",
      "Phân tích hệ thống nhận diện tội phạm nội y...",
      "Đo lường mức độ xảo quyệt...",
      "Tổng hợp độ xạo lồng bằng Deep Learning...",
      "Phân tích dữ liệu phản hồi từ vệ tinh..."
    ];

    let step = 0;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        return next > 95 ? 95 : next;
      });

      if (step < analysisSteps.length) {
        setLogs(prev => [...prev, analysisSteps[step]]);
        step++;
      }
    }, 800);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/handsome-analyzer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image, geminiApiKey: getStoredGeminiKey() })
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      
      if (!response.ok) {
        setResult({
          score: -999,
          overall: data.error || "Lỗi cmnr, tao từ chối phân tích bức ảnh này.",
          features: [{ part: "Toàn thân", comment: "Lỗi kết nối hoặc AI bị choáng váng.", rating: 0 }],
          advice: "Nên đeo khẩu trang tạm thời hoặc ra ngoài hít thở, sau đó thử lại."
        });
        setLogs(prev => [...prev, "ERROR: Xảy ra lỗi lượng tử."]);
      } else {
        setResult(data.result);
        setLogs(prev => [...prev, "Xuất kết quả thành công."]);
      }
    } catch (error) {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      setResult({
        score: -999,
        overall: "Mất kết nối với vệ tinh AI. Có thể nhan sắc này gây nghẽn băng thông vũ trụ.",
        features: [
          { part: "Toàn thân", comment: "Lỗi kết nối hoặc AI bị choáng váng.", rating: 0 }
        ],
        advice: "Nên đeo khẩu trang tạm thời hoặc ra ngoài hít thở, sau đó thử lại."
      });
      setLogs(prev => [...prev, "ERROR: Mất kết nối Gemini!"]);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsScanning(false);
    setLogs([]);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const shareResult = () => {
    if (result) {
      navigator.clipboard.writeText(`Máy Quét AI ChatDVT đã chấm tao ${result.score} điểm:\n"${result.overall}"\nVô thử coi m độ đẹp trai bao nhiêu: devtiendang.blog/handsome`);
      alert("Đã copy kết quả xạo chó! Gửi ngay cho crush để bị block.");
    }
  };

  return (
    <PageShell title="DIẾP-LOING-NING 3000" subtitle="AI Nhan Sắc Scanner" icon="" maxWidth="6xl">
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>

        {/* TRẠNG THÁI 1: CHƯA UPLOAD & TRẠNG THÁI 2: ĐANG UPLOAD / QUÉT */}
        {!result && (
          <div className="flex justify-center transition-all duration-500">
            <div className={`w-full transition-all duration-500 ${image && isScanning ? 'grid lg:grid-cols-2 gap-8' : 'max-w-2xl'}`}>
              <ImageUploaderCard 
                image={image} 
                fileInputRef={fileInputRef} 
                onUpload={handleImageUpload} 
                onStart={startAnalysis} 
                onReset={reset} 
                isScanning={isScanning} 
                hasResult={false} 
              />
              {!isScanning && <div className="mt-4"><GeminiKeyInput accent="amber" /></div>}
              
              {image && isScanning && (
                <div className="animate-fade-in">
                  <TerminalScanner logs={logs} scanProgress={scanProgress} isScanning={isScanning} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRẠNG THÁI 3: KẾT QUẢ HIỂN THỊ */}
        {result && (
           <div className="grid lg:grid-cols-[1fr_2.5fr] gap-8 transition-all duration-700 animate-fade-in items-stretch">
             {/* Thu nhỏ Ảnh sang cột trái */}
             <div className="hidden lg:block h-full">
               <ImageUploaderCard 
                 image={image} 
                 fileInputRef={fileInputRef} 
                 onUpload={handleImageUpload} 
                 onStart={startAnalysis} 
                 onReset={reset} 
                 isScanning={false} 
                 hasResult={true} 
               />
             </div>
             
             {/* Result Dashboard chiếm trọn không gian lớn bên phải */}
             <ResultDashboard result={result} shareResult={shareResult} />
             
             {/* Nút reset cho mobile (Nằm dưới cùng màn result) */}
             <div className="lg:hidden w-full">
               <button 
                 onClick={reset}
                 className="px-6 bg-[#1f2937] text-slate-300 font-bold py-4 rounded-xl hover:bg-[#374151] border border-slate-700 transition-colors w-full uppercase tracking-wider text-sm"
               >
                 Phân Tích Ảnh Khác
               </button>
             </div>
           </div>
        )}

    </PageShell>
  );
};
