import React, { useState } from 'react';
import type { GameLogEntry, LogCategory } from '../../game/types';

interface GameLogProps {
  logs: GameLogEntry[];
  onClose: () => void;
}

const CATEGORY_STYLES: Record<LogCategory, { label: string; bg: string; border: string; text: string }> = {
  rent: { label: 'Thuê', bg: 'bg-rose-950/40', border: 'border-rose-800/50', text: 'text-rose-300' },
  buy: { label: 'Mua', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', text: 'text-emerald-300' },
  build: { label: 'Xây', bg: 'bg-amber-950/40', border: 'border-amber-800/50', text: 'text-amber-300' },
  card: { label: 'Thẻ', bg: 'bg-violet-950/40', border: 'border-violet-800/50', text: 'text-violet-300' },
  event: { label: 'Sự kiện', bg: 'bg-cyan-950/40', border: 'border-cyan-800/50', text: 'text-cyan-300' },
  jail: { label: 'Tù', bg: 'bg-orange-950/40', border: 'border-orange-800/50', text: 'text-orange-300' },
  trade: { label: 'Giao dịch', bg: 'bg-indigo-950/40', border: 'border-indigo-800/50', text: 'text-indigo-300' },
  buyout: { label: 'Thâu tóm', bg: 'bg-red-950/40', border: 'border-red-800/50', text: 'text-red-300' },
  system: { label: 'Hệ thống', bg: 'bg-slate-900/40', border: 'border-slate-800/50', text: 'text-slate-300' },
  move: { label: 'Di chuyển', bg: 'bg-blue-950/40', border: 'border-blue-800/50', text: 'text-blue-300' }
};

type FilterTab = 'all' | 'transaction' | 'event' | 'mine';

export const GameLog: React.FC<GameLogProps> = ({ logs, onClose }) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredLogs = logs.filter(entry => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'transaction') return ['rent', 'buy', 'build', 'trade', 'buyout'].includes(entry.category);
    if (activeFilter === 'event') return ['event', 'card', 'jail'].includes(entry.category);
    return true;
  });

  const tabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: '📋' },
    { key: 'transaction', label: 'Giao dịch', icon: '💰' },
    { key: 'event', label: 'Sự kiện', icon: '⚡' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#131923] border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh] animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>📜</span> NHẬT KÝ VÁN ĐẤU
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-3 px-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredLogs.map((entry, idx) => {
            const style = CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.system;
            const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${style.bg} ${style.border}`}
              >
                <span className="text-base shrink-0">{entry.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold break-words leading-relaxed ${style.text}`}>
                    {entry.message}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-500">{timeStr}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black border ${style.border} ${style.text}`}>
                      {style.label}
                    </span>
                    {entry.round > 0 && (
                      <span className="text-[8px] text-slate-600">Vòng {entry.round}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface LiveTickerProps {
  logs: GameLogEntry[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ logs }) => {
  const recentLogs = logs.slice(0, 2);

  if (recentLogs.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-0.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-xl border border-slate-800/60 select-none">
      {recentLogs.map((entry, idx) => {
        const style = CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.system;
        return (
          <div key={idx} className={`flex items-center gap-1.5 text-[10px] ${idx === 0 ? 'opacity-100' : 'opacity-60'}`}>
            <span className="text-xs shrink-0">{entry.icon}</span>
            <span className={`truncate font-semibold ${style.text}`}>{entry.message}</span>
          </div>
        );
      })}
    </div>
  );
};
