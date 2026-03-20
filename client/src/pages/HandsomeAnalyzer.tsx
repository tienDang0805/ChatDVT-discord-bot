import React, { useState, useRef, useEffect } from 'react';
import { Upload, Scan, AlertTriangle, Share2, CornerUpLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const roasts = [
  "Độ đẹp trai: -99%. AI từ chối phân tích vì lo ngại hỏng cảm biến quang học.",
  "Độ đẹp trai: 1%. Điểm số này tương đương với vẻ đẹp của một củ khoai tây lùi.",
  "Cảnh báo: Hàm lượng nhan sắc dưới mức tối thiểu do WHO quy định. Khuyên dùng thêm app chỉnh ảnh.",
  "Độ đẹp trai: 5%. Nếu nhan sắc là tội ác thì bạn hoàn toàn vô tội.",
  "Xác nhận: Gương mặt mang tính chất phòng thủ cao. Có thể dùng để xua đuổi tà ma.",
  "Phân tích hoàn tất: Vui lòng không nhìn vào gương sau 12h đêm để tránh tự doạ mình.",
  "Độ đẹp trai: Error 404. Not found. Thử lại ở kiếp sau.",
  "Kết luận của AI: Vẻ đẹp tiềm ẩn... nhưng tìm rà gắt gao vẫn không thấy.",
  "Độ đẹp trai: 10%. Giao diện khá thân thiện với môi trường, đặc biệt là phù hợp với hệ sinh thái đầm lầy.",
  "Cảnh báo đỏ: Nhan sắc này làm vi phạm tiêu chuẩn cộng đồng của ChatDVT. Cấm xuất hiện trên livestream."
];

export const HandsomeAnalyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
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
        setImage(event.target?.result as string);
        setResult(null);
        setLogs([]);
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
      const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
      setResult("Sever AI chết ngang do nhan sắc này quá tải băng thông. Trả về kết quả dự phòng: " + randomRoast);
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
      navigator.clipboard.writeText(`Máy Quét AI ChatDVT đã đánh giá tao: "${result}"\nVô thử coi m độ đẹp trai bao nhiêu: devtiendang.blog/handsome`);
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
              <div className="mt-4 p-4 border border-red-500/50 bg-red-500/10 rounded animate-[pulse_1s_ease-in-out_1]">
                <h4 className="flex items-center gap-2 text-red-500 font-bold mb-2 uppercase tracking-wide">
                  <AlertTriangle size={18} /> KẾT QUẢ PHÂN TÍCH ĐÍCH TÔN
                </h4>
                <p className="text-white text-base md:text-lg leading-relaxed mb-4">
                  {result}
                </p>
                <button 
                  onClick={shareResult}
                  className="w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-100 py-2 rounded flex items-center justify-center gap-2 font-bold transition-colors"
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
