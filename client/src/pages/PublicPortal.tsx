import { Link } from 'react-router-dom';
import { BrainCircuit, Cat, ScrollText, Github, ChevronRight, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../contexts/ThemeContext';

export const PublicPortal = () => {
  const { theme } = useTheme();

  const features = [
    {
      id: 'quiz',
      title: 'Web Quiz AI',
      description: 'Tham gia trò chơi trắc nghiệm theo thời gian thực được tạo bởi AI Gemini tấu hài. Không cần đăng nhập!',
      icon: BrainCircuit,
      href: '/quiz',
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'pets',
      title: 'Hệ Thống Pet Hub',
      description: 'Xem danh sách các Thú cưng đáng yêu, tiến hoá, điểm danh rèn luyện hàng ngày và bảng xếp hạng Pet Server.',
      icon: Cat,
      href: '/petlandingpage',
      color: 'from-amber-400 to-orange-500',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'tutien',
      title: 'Tu Tiên Giới',
      description: 'Hệ thống Tu luyện Cảnh giới, độ kiếp, pháp bảo và thế giới quan RPG Text-based phong phú.',
      icon: Sparkles,
      href: '/tutien',
      color: 'from-emerald-400 to-teal-500',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'github',
      title: 'Giới Thiệu ChatDVT',
      description: 'Mã nguồn mở ChatDVT Discord Bot - Tích hợp AI, Game Economy, Leveling và rất nhiều tính năng giải trí.',
      icon: Github,
      href: 'https://github.com/tienDang0805/ChatDVT-discord-bot',
      color: 'from-slate-700 to-slate-900',
      bgLight: 'bg-slate-100',
      bgDark: 'dark:bg-slate-800/50',
      textColor: 'text-slate-800 dark:text-slate-300',
      external: true
    }
  ];

  return (
    <div className={clsx("min-h-screen transition-colors duration-300", theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50')}>
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
         <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30 mb-6 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ScrollText size={40} className="text-white relative z-10" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
             ChatDVT <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Public Portal</span>
           </h1>
           <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
             Khám phá các tính năng giải trí công khai của Server. Không cần quyền Admin, không cần đăng nhập, tham gia ngay để giải trí vô tận.
           </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8">
          {features.map((item) => (
             item.external ? (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    "group relative p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row gap-6 items-start hover:-translate-y-1",
                    item.bgLight, item.bgDark
                  )}
                >
                   <div className={clsx("w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br text-white", item.color)}>
                     <item.icon size={32} />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                        {item.title} <ChevronRight size={18} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                        {item.description}
                      </p>
                   </div>
                </a>
             ) : (
                <Link
                  key={item.id}
                  to={item.href}
                  target="_blank"
                  className={clsx(
                    "group relative p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row gap-6 items-start hover:-translate-y-1",
                    item.bgLight, item.bgDark
                  )}
                >
                   <div className={clsx("w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br text-white", item.color)}>
                     <item.icon size={32} />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                        {item.title} <ChevronRight size={18} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                        {item.description}
                      </p>
                   </div>
                </Link>
             )
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
               Designed for <span className="text-primary font-bold">ChatDVT</span> Server Ecosystem.
            </p>
        </div>
      </div>
    </div>
  );
};
