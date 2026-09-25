import React from 'react';
import type { GameState } from '../../game/types';
import { calculateNetWorth } from '../../game/economy';

interface GameOverScreenProps {
  gameState: GameState;
  myPlayerId: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  gameState,
  myPlayerId,
  onPlayAgain,
  onBackToMenu
}) => {
  const rankedPlayers = [...gameState.players].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return calculateNetWorth(gameState, b.id) - calculateNetWorth(gameState, a.id);
  });

  const winner = rankedPlayers[0];
  const isWinnerMe = winner?.id === myPlayerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#131923] border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-scale-up">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-5xl shadow-inner">
          🏆
        </div>

        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            KẾT THÚC VÁN ĐẤU
          </div>
          <h2 className="text-2xl font-black text-white">
            {isWinnerMe ? '🎉 CHÚC MỪNG BẠN ĐÃ THẮNG!' : `👑 ${winner?.username} ĐÃ VÔ ĐỊCH!`}
          </h2>
        </div>

        <div className="space-y-2">
          {rankedPlayers.map((p, idx) => {
            const netWorth = calculateNetWorth(gameState, p.id);
            const isMe = p.id === myPlayerId;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  idx === 0
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                    : isMe
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black w-6 text-slate-400">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                    style={{ backgroundColor: `${p.tokenColor}25`, border: `1px solid ${p.tokenColor}` }}
                  >
                    {p.tokenEmoji}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-white flex items-center gap-1">
                      {p.username}
                      {isMe && <span className="text-[10px] text-orange-400">(Bạn)</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Thu thuê: {p.totalRentCollected}Đ • Nộp thuê: {p.totalRentPaid}Đ
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-amber-300">
                    {p.isEliminated ? 'Phá sản' : `${netWorth.toLocaleString()}Đ`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {p.properties.length} BĐS
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
          >
            🔄 Chơi Lại Ván Mới
          </button>
          <button
            onClick={onBackToMenu}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all"
          >
            ← Về Menu Game
          </button>
        </div>
      </div>
    </div>
  );
};
