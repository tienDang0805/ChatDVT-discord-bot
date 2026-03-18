import { Link } from 'react-router-dom';
import { BrainCircuit, Cat, Sparkles, Github, Rocket, Trophy, Star } from 'lucide-react';

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
    }
  ];

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
              devtien.<span className="text-orange-500">blog</span>
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
             <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl group">
                {/* 
                  Sử dụng hai ảnh Chibi đổi qua lại khi hover để tạo hiệu ứng "Vibe".
                  Bạn hãy nhớ chép 2 ảnh bạn vừa gửi vào thư mục client/public/images/
                */}
                <img 
                  src="/images/chibi-bear.jpg" 
                  alt="Tiến Đặng Chibi" 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <img 
                  src="/images/chibi-rain.jpg" 
                  alt="Tiến Đặng Vibe Code" 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {/* Fallback box nếu user chưa upload ảnh */}
                <div className="absolute inset-0 -z-10 bg-[#161b22] flex items-center justify-center text-slate-600 text-sm text-center p-4">
                  (Vui lòng lưu 2 ảnh chibi vào<br/>client/public/images/chibi-bear.jpg<br/>và chibi-rain.jpg)
                </div>
             </div>
             <p className="mt-4 text-sm text-slate-500 font-medium italic animate-pulse">Hover để đổi vibe...</p>
          </div>
        </div>

        {/* Goal Section */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 md:p-8 mb-16 relative overflow-hidden">
           <div className="flex flex-wrap justify-between items-center mb-6">
              <h3 className="text-orange-400 font-bold flex items-center gap-2 uppercase tracking-wider">
                <Star size={18} /> Mục Tiêu Server
              </h3>
              <a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded font-medium text-sm flex items-center gap-2 transition-all">
                <Github size={16} /> Ủng hộ 1 Star trên Github
              </a>
           </div>
           
           <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-orange-500">80</span>
              <span className="text-slate-500 font-medium">/ 100 members active</span>
           </div>

           {/* Progress bar */}
           <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mt-4">
              <div className="absolute top-0 left-0 h-full w-[80%] bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"></div>
              {/* Glow dot */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[80%] -ml-2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#f97316]"></div>
           </div>
           <div className="flex justify-between text-xs text-slate-600 mt-2 font-bold">
              <span>0</span>
              <span>100</span>
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
                  target="_blank"
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
                  target="_blank"
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
    </div>
  );
};
