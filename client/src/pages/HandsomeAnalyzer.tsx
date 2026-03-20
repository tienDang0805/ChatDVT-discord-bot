import React, { useState, useRef, useEffect } from 'react';
import { Upload, Scan, AlertTriangle, Share2, CornerUpLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        // AI có thể delay lâu, giữ thanh tiến trình chạy chậm lại khi gần đích
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
        body: JSON.stringify({ imageBase64: image })
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      
      if (!response.ok) {
        setResult(data.error || "Lỗi cmnr, tao từ chối phân tích bức ảnh này.");
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
    <div className="min-h-screen bg-[#0d1117] text-slate-200 py-12 px-6 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-slate-400 hover:text-orange-500 transition-colors p-2 bg-[#161b22] rounded border border-slate-800">
            <CornerUpLeft size={20} />
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 uppercase tracking-widest flex items-center gap-3">
            <Scan size={36} className="text-orange-500" /> DIẾP-LOING-NING 3000
          </h1>
        </div>

        <p className="text-slate-400 mb-8 max-w-2xl border-l-4 border-pink-500 pl-4">
          Công nghệ phân tích khuôn mặt "Deep Learning" chạy bằng cơm mặn của ChatDVT. Gửi ảnh lên để nhận về sự thật phũ phàng. Dữ liệu của mày sẽ KHÔNG bị lưu lại vì server nghèo không có dung lượng.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Cột Upload và Hiển thị ảnh */}
          <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
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
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="relative h-80 w-full rounded-lg overflow-hidden border border-slate-700 bg-black">
                <img src={image} alt="Target" className="w-full h-full object-contain" />
                
                {/* Hiệu ứng Scanning Line */}
                {isScanning && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 bg-[url('https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/matrix-rain.gif')] opacity-10 mix-blend-screen pointer-events-none" />
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-4">
              {image && !isScanning && !result && (
                <button 
                  onClick={startAnalysis}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold py-3 rounded hover:from-orange-500 hover:to-pink-500 transition-all flex justify-center items-center gap-2 active:scale-95"
                >
                  <Scan size={20} /> PHÂN TÍCH NGAY
                </button>
              )}
              {image && (
                <button 
                  onClick={reset}
                  disabled={isScanning}
                  className="px-6 bg-[#1f2937] text-slate-300 font-bold rounded hover:bg-[#374151] border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Huỷ/Đổi Ảnh
                </button>
              )}
            </div>
          </div>

          {/* Cột Terminal / Logs / Kết quả */}
          <div className="bg-black border border-slate-800 rounded-xl p-6 font-mono text-sm shadow-2xl flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-slate-500 font-bold tracking-widest text-xs">AI_CONSOLE_V3.1.sys</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-green-400">
              {logs.map((log, index) => (
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

            {result && (
              <div className="mt-4 animate-[pulse_1s_ease-in-out_1] flex flex-col gap-4">
                <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg flex items-center justify-between">
                   <div>
                      <h4 className="flex items-center gap-2 text-red-500 font-bold mb-1 uppercase tracking-wide text-[10px] md:text-sm">
                        <AlertTriangle size={14} /> DEEP-SCAN SCORE
                      </h4>
                      <div className="text-3xl md:text-5xl font-black text-red-500">
                         {result.score} <span className="text-lg text-red-500/50">PTS</span>
                      </div>
                   </div>
                   <div className="text-right flex-1 ml-4 border-l border-red-500/30 pl-4">
                      <p className="text-white/90 text-xs md:text-sm italic">"{result.overall}"</p>
                   </div>
                </div>

                <div className="grid gap-2 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                  {result.features.map((f, i) => (
                     <div key={i} className="p-3 bg-[#161b22] border border-slate-700/50 rounded flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                           <span className="text-cyan-400 font-bold text-[10px] md:text-xs uppercase bg-cyan-400/10 px-2 py-0.5 rounded">Vùng: {f.part}</span>
                           <span className="text-pink-500 font-bold text-xs">{f.rating}/10</span>
                        </div>
                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">{f.comment}</p>
                     </div>
                  ))}
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                   <p className="text-yellow-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><AlertTriangle size={12} /> KIẾN NGHỊ TỪ HỆ THỐNG:</p>
                   <p className="text-yellow-100/90 text-xs md:text-sm">{result.advice}</p>
                </div>

                <button 
                  onClick={shareResult}
                  className="w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-100 py-2.5 rounded flex items-center justify-center gap-2 font-bold transition-all active:scale-95 text-xs md:text-sm mt-1"
                >
                  <Share2 size={16} /> COPY KẾT QUẢ ĐỂ KHÈ TRẺ TRÂU
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
