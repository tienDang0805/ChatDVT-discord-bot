import React, { useState, useEffect, useRef } from 'react';
import type { GameLogEntry } from '../../game/types';
import { sounds } from '../../utils/audio';

interface MonopolyActionToastProps {
  logs: GameLogEntry[];
}

interface ToastData {
  id: string;
  icon: string;
  title: string;
  message: string;
  category: 'rent' | 'buy' | 'build' | 'buyout';
  styleGradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

export const MonopolyActionToast: React.FC<MonopolyActionToastProps> = ({ logs }) => {
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const lastProcessedKeyRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!logs || logs.length === 0) return;
    const latestLog = logs[0];
    const logKey = `${latestLog.timestamp}_${latestLog.category}_${latestLog.message}`;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastProcessedKeyRef.current = logKey;
      return;
    }

    if (logKey === lastProcessedKeyRef.current) return;
    lastProcessedKeyRef.current = logKey;

    let toastConfig: Omit<ToastData, 'id' | 'message'> | null = null;
    const cat = latestLog.category;
    const msg = latestLog.message;

    if (cat === 'rent' || msg.includes('tiền thuê')) {
      toastConfig = {
        icon: '💸',
        title: 'BỊ TRỪ TIỀN THUÊ NHÀ!',
        category: 'rent',
        styleGradient: 'from-red-950 via-rose-900 to-red-950',
        borderColor: 'border-rose-500',
        glowColor: 'rgba(244, 63, 94, 0.85)',
        textColor: 'text-rose-300'
      };
      sounds.playCoin();
    } else if (cat === 'buy' || msg.includes('đã mua')) {
      toastConfig = {
        icon: '🏠',
        title: 'MUA BẤT ĐỘNG SẢN THÀNH CÔNG!',
        category: 'buy',
        styleGradient: 'from-emerald-950 via-teal-900 to-emerald-950',
        borderColor: 'border-emerald-400',
        glowColor: 'rgba(16, 185, 129, 0.85)',
        textColor: 'text-emerald-300'
      };
      sounds.playCoin();
    } else if (cat === 'build' || msg.includes('nâng cấp')) {
      toastConfig = {
        icon: '🔨',
        title: 'NÂNG CẤP BẤT ĐỘNG SẢN!',
        category: 'build',
        styleGradient: 'from-amber-950 via-yellow-900 to-amber-950',
        borderColor: 'border-amber-400',
        glowColor: 'rgba(245, 158, 11, 0.9)',
        textColor: 'text-amber-300'
      };
      sounds.playDoubleDice();
    } else if (cat === 'buyout' || msg.includes('THÂU TÓM')) {
      toastConfig = {
        icon: '⚡',
        title: 'THÂU TÓM BẤT ĐỘNG SẢN!',
        category: 'buyout',
        styleGradient: 'from-orange-950 via-purple-900 to-orange-950',
        borderColor: 'border-amber-400',
        glowColor: 'rgba(249, 115, 22, 0.9)',
        textColor: 'text-amber-200'
      };
      sounds.playDoubleDice();
    }

    if (toastConfig) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setActiveToast({
        id: logKey,
        icon: toastConfig.icon,
        title: toastConfig.title,
        message: latestLog.message,
        category: toastConfig.category,
        styleGradient: toastConfig.styleGradient,
        borderColor: toastConfig.borderColor,
        glowColor: toastConfig.glowColor,
        textColor: toastConfig.textColor
      });

      timerRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 4200);
    }
  }, [logs]);

  if (!activeToast) return null;

  return (
    <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none">
      <div
        className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${activeToast.styleGradient} border-2 ${activeToast.borderColor} shadow-2xl backdrop-blur-md max-w-[92vw] sm:max-w-lg ${
          activeToast.category === 'rent' ? 'animate-bounce' : 'animate-bounce-subtle'
        }`}
        style={{
          boxShadow: `0 0 35px ${activeToast.glowColor}, 0 10px 25px rgba(0,0,0,0.85)`
        }}
      >
        <div className="w-11 h-11 rounded-xl bg-black/60 border border-white/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
          {activeToast.icon}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${activeToast.textColor} flex items-center gap-1.5`}>
            <span>{activeToast.title}</span>
          </div>
          <div className="text-xs sm:text-[13.5px] font-extrabold text-white truncate mt-0.5 drop-shadow">
            {activeToast.message}
          </div>
        </div>

        <button
          onClick={() => setActiveToast(null)}
          className="text-white/70 hover:text-white text-sm font-black px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
        >
          ✕
        </button>

        <div className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full overflow-hidden bg-white/20">
          <div
            className="h-full bg-white/90 rounded-full animate-progress-shrink"
            style={{ animationDuration: '4200ms' }}
          />
        </div>
      </div>
    </div>
  );
};
export default MonopolyActionToast;
