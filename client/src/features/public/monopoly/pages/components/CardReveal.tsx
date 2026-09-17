import React from 'react';
import type { CardDef } from '../../game/types';

interface CardRevealProps {
  card: CardDef;
  isMyTurn: boolean;
  timer: number;
  onDismiss: () => void;
}

export const CardReveal: React.FC<CardRevealProps> = ({
  card,
  isMyTurn,
  timer,
  onDismiss
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#1a2333] to-[#0f172a] border border-purple-500/50 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden animate-scale-up">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black mb-4">
          <span>✨</span> THẺ BÀI MAY RỦI 8D
        </div>

        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-600/30 to-amber-600/30 border border-purple-400/40 flex items-center justify-center text-4xl shadow-inner mb-3 animate-bounce">
          {card.icon}
        </div>

        <h3 className="text-xl font-black text-white mb-1.5">{card.name}</h3>
        <p className="text-sm font-semibold text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 mb-4">
          {card.description}
        </p>

        <div className="text-xs text-slate-400 mb-4">
          Tự động tiếp tục sau: <span className="text-amber-400 font-extrabold">{timer}s</span>
        </div>

        {isMyTurn && (
          <button
            onClick={onDismiss}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-600/30 active:scale-98 transition-all"
          >
            ✓ ĐÃ HIỂU & ÁP DỤNG
          </button>
        )}
      </div>
    </div>
  );
};
