import React from 'react';
import type { GameLogEntry } from '../../game/types';

interface GameLogProps {
  logs: GameLogEntry[];
  onClose: () => void;
}

export const GameLog: React.FC<GameLogProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#131923] border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh] animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>📜</span> NHẬT KÝ VÁN ĐẤU
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {logs.map((entry, idx) => {
            const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
              >
                <span className="text-base shrink-0">{entry.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium break-words leading-relaxed">
                    {entry.message}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{timeStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
