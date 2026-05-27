import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

interface PageShellProps {
  title: string;
  subtitle?: string;
  icon?: string;
  maxWidth?: '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  accentColor?: string;
  backTo?: string;
  children: React.ReactNode;
  stars?: boolean;
}

const maxWidthMap: Record<string, string> = {
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
  '5xl': 'max-w-7xl',
  '6xl': 'max-w-[1440px]',
};

export const PageShell = ({
  title,
  subtitle,
  icon,
  maxWidth = '5xl',
  backTo = '/',
  children,
  stars = false,
}: PageShellProps) => {
  usePageMeta(title);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 relative">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease-out both}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .shimmer-text{background-size:200% auto;animation:shimmer 3s linear infinite}
        @keyframes starTwinkle{0%,100%{opacity:.1}50%{opacity:.7}}
      `}</style>

      {stars && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[2px] bg-slate-400 dark:bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animation: `starTwinkle ${2 + Math.random() * 3}s ${Math.random() * 3}s infinite`,
                opacity: 0.1 + Math.random() * 0.3,
              }}
            />
          ))}
        </div>
      )}

      <div className={`${maxWidthMap[maxWidth]} mx-auto px-3 sm:px-6 md:px-8 py-4 md:py-14 pb-24 md:pb-14 relative z-10`}>
        <header className="flex items-center gap-3 mb-6 md:mb-10">
          <Link
            to={backTo}
            className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all p-2 bg-white dark:bg-[#1f2937] hover:bg-slate-50 dark:hover:bg-[#283547] rounded-full border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-center w-10 h-10 active:scale-90"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate flex items-center gap-1.5">
              {icon && <span className="shrink-0">{icon}</span>}
              <span className="truncate">{title}</span>
            </h1>
            {subtitle && (
              <p className="text-slate-400 dark:text-slate-500 text-[10px] md:text-sm mt-0.5 tracking-wider uppercase truncate">
                {subtitle}
              </p>
            )}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};
