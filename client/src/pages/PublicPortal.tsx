import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Cat, Sparkles, Github, Rocket, Heart, Coffee, AlertTriangle, Wallet, X } from 'lucide-react';

export const PublicPortal = () => {
  const features = [
    {
      id: 'quiz',
      number: '01',
      title: 'Web Quiz AI',
      description: 'Chơi trắc nghiệm Real-time với câu hỏi do Bot ChatDVT gen bằng AI tự động.',
      icon: BrainCircuit,
      href: '/quiz',
      author: 'Gấu bự (Tiến Đặng lúc sảng đá)'
    },
    {
      id: 'pets',
      number: '02',
      title: 'Hệ Thống Pet Hub',
      description: 'Giao diện xem danh sách Thú cưng đáng yêu, tiến hoá, và bảng xếp hạng Pet Server.',
      icon: Cat,
      href: '/petlandingpage',
      author: 'Lãng tử content ( Là Tiến Đặng lúc làm content)'
    },
    {
      id: 'tutien',
      number: '03',
      title: 'Tu Tiên Giới',
      description: 'Hệ thống Tu luyện Cảnh giới, độ kiếp, pháp bảo và thế giới quan RPG Text-based.',
      icon: Sparkles,
      href: '/tutien',
      author: 'Phì Đế (Tiến Đặng lúc đói)'
    },
    {
      id: 'github',
      number: '04',
      title: 'ChatDVT Source Code',
      description: 'Mã nguồn mở Discord Bot - Tích hợp AI, Game Economy, Leveling.',
      icon: Github,
      href: 'https://github.com/tienDang0805/ChatDVT-discord-bot',
      author: 'Tiến Đặng (Lúc lập trình viên)',
      external: true
    },
    {
      id: 'food-wheel',
      number: '05',
      title: 'Hôm Nay Ăn Gì?',
      description: 'Thầy AI phong thuỷ chọn giúp bạn. 5 món ăn, 1 vòng quay, vô tri hoàn toàn.',
      icon: Coffee,
      href: '/food-wheel',
      author: 'Tiến Đặng (Lúc k biết ăn gì)',

    },
    {
      id: 'excuse-generator',
      number: '06',
      title: 'Tạo Lý Do Nghỉ Phép',
      description: 'Máy phát điện lý do nghỉ phép vô tri, giúp bạn dõng dạc xin sếp nghỉ hưu non.',
      icon: AlertTriangle,
      href: '/excuse-generator',
      author: 'ChatDVT (Lúc lười biếng)',
    }
  ];

  const chibiImages = [
    'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/chibi-bear.jpg',
    'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/chibi-rain.jpg',
    'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/phide.jpg'
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % chibiImages.length);
    }, 2000); // Đổi ảnh mỗi 2 giây
    return () => clearInterval(interval);
  }, []);

  // Thay đổi tiêu đề và icon trên tab Chrome khi vào trang này
  useEffect(() => {
    document.title = "devtiendang.blog | Portal";
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = "https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/chibi-bear.jpg";
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans selection:bg-orange-500/30">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-between mb-20 relative">
          
          {/* Tag VOL.01 */}
          <div className="absolute top-0 right-4 lg:right-0 rotate-12 bg-orange-500 text-white font-black px-4 py-1 text-sm tracking-wider shadow-lg z-10">
            VOL.01 / 2026
          </div>

          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
              devtiendang.<span className="text-orange-500">blog</span>
            </h1>
            
            <div className="border-l-4 border-orange-500 pl-5 space-y-3">
              <p className="text-xl font-bold text-slate-300">
                Make by Tien Dang form 8D with love 
              </p>
              <p className="text-slate-400 leading-relaxed max-w-2xl">
                  Bot Discord Tiến Đặng Làm Cho mấy thằng Mọi 8D 
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
                <a href="https://discord.gg/" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#374151] border border-orange-500/50 text-orange-400 hover:text-orange-300 px-6 py-3 rounded-md font-bold transition-all">
                  <Rocket size={18} /> Tham gia Discord
              </a>
              {/* <a href="/rankings" className="flex items-center gap-2 bg-[#161b22] hover:bg-[#1f242c] border border-slate-700 text-slate-300 px-6 py-3 rounded-md font-bold transition-all">
                <Trophy size={18} className="text-emerald-500" /> Bảng Xếp Hạng
              </a> */}
                <a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer" className="flex items-center bg-[#161b22] hover:bg-[#1f242c] border border-slate-700 rounded-md overflow-hidden transition-all group">
                  <div className="flex items-center gap-2 px-4 py-3 text-slate-300 font-bold border-r border-slate-700">
                    <Github size={18} /> STARS
                  </div>
                  <div className="bg-[#007acc] px-4 py-3 text-white font-bold group-hover:bg-[#005c99] transition-colors">
                    100+
                  </div>
                </a>
            </div>
          </div>

          {/* Chibi Illustration Area */}
          <div className="lg:w-1/3 shrink-0 flex flex-col items-center">
             <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
                {chibiImages.map((src, idx) => (
                  <img 
                    key={src}
                    src={src} 
                    alt={`Tiến Đặng Vibe ${idx}`} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ))}
                
                {/* Fallback box nếu user chưa upload ảnh */}
                <div className="absolute inset-0 -z-10 bg-[#161b22] flex items-center justify-center text-slate-600 text-sm text-center p-4">
                  (Vui lòng lưu 3 ảnh chibi vào<br/>client/public/images/chibi-bear.jpg<br/>chibi-rain.jpg<br/>phide.jpg)
                </div>
             </div>
             <p className="mt-4 text-sm text-slate-500 font-medium italic animate-pulse">Vibe code đang chuyển hoá...</p>
          </div>
        </div>

        {/* Goal Section */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden">
           <div className="flex flex-wrap justify-between items-center mb-6">
              <h3 className="text-orange-400 font-bold flex items-center gap-2 uppercase tracking-wider">
                <Heart size={18} className="animate-pulse" /> Mục Tiêu Tháng: Nuôi Server (Bằng cơm mặn)
              </h3>
           </div>
           
           <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-orange-500">0</span>
              <span className="text-slate-500 font-medium">/ 69.000.000 VNĐ</span>
           </div>

           {/* Progress bar */}
           <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mt-4">
              <div className="absolute top-0 left-0 h-full w-[45%] bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"></div>
              {/* Glow dot */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[45%] -ml-2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#f97316]"></div>
           </div>
           <div className="flex justify-between text-xs text-slate-600 mt-2 font-bold">
              <span>0 đ</span>
              <span>300.000 đ</span>
           </div>
        </div>

        {/* Donate / Nuôi Em Section */}
        <div className="mb-16">
           <h3 className="text-xl font-bold flex items-center gap-2 tracking-wider text-slate-200 mb-6">
             <Coffee size={24} className="text-amber-500" /> Donate Nuôi Dev
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* VCB */}
              <div className="bg-[#131923] border border-slate-800 hover:border-green-500/50 transition-colors p-6 rounded-xl flex items-center gap-6 group">
                 <div 
                   className="w-24 h-40 sm:w-32 sm:h-48 shrink-0 bg-white rounded-xl p-1.5 border-2 border-green-500 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-lg hover:shadow-green-500/20 transition-all"
                   onClick={() => setSelectedImage('https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-vcb.jpg')}
                   title="Click để phóng to"
                 >
                    <img 
                      src="https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-vcb.jpg" 
                      alt="Vietcombank QR" 
                      className="absolute inset-0 w-full h-full object-cover z-10 bg-white group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                    <div className="text-[10px] text-slate-400 text-center leading-tight">
                      Vui lòng lưu ảnh<br/><span className="font-bold text-slate-600">qr-vcb.jpg</span><br/>vào client/public/images/
                    </div>
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xl font-bold text-green-500 mb-1 flex items-center gap-2"><Wallet size={18} /> Vietcombank</h4>
                    <p className="text-white font-mono text-xl mb-1 tracking-wider"></p>
                    <p className="text-slate-500 text-sm font-medium">Chủ TK: DANG VAN TIEN</p>
                 </div>
              </div>

              {/* MoMo */}
              <div className="bg-[#131923] border border-slate-800 hover:border-pink-500/50 transition-colors p-6 rounded-xl flex items-center gap-6 group">
                 <div 
                   className="w-24 h-40 sm:w-32 sm:h-48 shrink-0 bg-white rounded-xl p-1.5 border-2 border-pink-500 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-lg hover:shadow-pink-500/20 transition-all"
                   onClick={() => setSelectedImage('https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-momo.jpg')}
                   title="Click để phóng to"
                 >
                    <img 
                      src="https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-momo.jpg" 
                      alt="MoMo QR" 
                      className="absolute inset-0 w-full h-full object-cover z-10 bg-white group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                    <div className="text-[10px] text-slate-400 text-center leading-tight">
                      Vui lòng lưu ảnh<br/><span className="font-bold text-slate-600">qr-momo.jpg</span><br/>vào client/public/images/
                    </div>
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xl font-bold text-pink-500 mb-1 flex items-center gap-2"><Wallet size={18} /> MoMo</h4>
                    <p className="text-white font-mono text-xl mb-1 tracking-wider">*******725</p>
                    <p className="text-slate-500 text-sm font-medium">Chủ TK: DANG VAN TIEN</p>
                 </div>
              </div>

           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
           <button className="bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition-colors">Tất cả ({features.length})</button>
           <button className="bg-[#1f2937] text-slate-300 font-medium border border-slate-700 py-2 px-4 rounded hover:bg-[#374151] transition-colors">🎮 Game (2)</button>
           <button className="bg-[#1f2937] text-slate-300 font-medium border border-slate-700 py-2 px-4 rounded hover:bg-[#374151] transition-colors">🚀 Tiện ích (2)</button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => (
             item.external ? (
                <a
                  key={item.id}
                  href={item.href}
                  rel="noopener noreferrer"
                  className="group relative bg-[#131923] border border-slate-800 hover:border-orange-500/50 p-8 rounded-xl overflow-hidden transition-all hover:-translate-y-1 block min-h-[220px]"
                >
                   {/* Big Number Background */}
                   <span className="absolute top-4 right-4 text-7xl font-black text-slate-800/30 group-hover:text-slate-700/30 transition-colors pointer-events-none select-none">
                     {item.number}
                   </span>
                   
                   <div className="relative z-10 flex flex-col h-full">
                      <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-orange-400 transition-colors flex items-center gap-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm flex-1">
                        {item.description}
                      </p>
                      <div className="mt-8 text-sm font-medium text-slate-500">
                        bởi <span className="text-orange-500">{item.author}</span>
                      </div>
                   </div>
                </a>
             ) : (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group relative bg-[#131923] border border-slate-800 hover:border-orange-500/50 p-8 rounded-xl overflow-hidden transition-all hover:-translate-y-1 block min-h-[220px]"
                >
                   {/* Big Number Background */}
                   <span className="absolute top-4 right-4 text-7xl font-black text-slate-800/30 group-hover:text-slate-700/30 transition-colors pointer-events-none select-none">
                     {item.number}
                   </span>
                   
                   <div className="relative z-10 flex flex-col h-full">
                      <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-orange-400 transition-colors flex items-center gap-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm flex-1">
                        {item.description}
                      </p>
                      <div className="mt-8 text-sm font-medium text-slate-500">
                        bởi <span className="text-orange-500">{item.author}</span>
                      </div>
                   </div>
                </Link>
             )
          ))}
        </div>

      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div 
           className="fixed inset-0 z-50 bg-[#0d1117]/95 backdrop-blur-md flex justify-center items-center p-4 sm:p-8 cursor-zoom-out"
           onClick={() => setSelectedImage(null)}
        >
           <button 
             className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-3 rounded-full transition-all"
             onClick={() => setSelectedImage(null)}
           >
             <X size={28} />
           </button>
           <img 
              src={selectedImage} 
              alt="QR Cận Cảnh" 
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl ring-4 ring-white/10" 
              onClick={(e) => e.stopPropagation()} 
           />
        </div>
      )}
    </div>
  );
};
