import React from 'react';
import type { GameState, PlayerState } from '../../game/types';
import { BOARD_SIZE } from '../../game/constants';

interface MonopolyHUDProps {
  gameState: GameState;
  myPlayerId: string;
  onOpenTrade?: () => void;
  onOpenLog?: () => void;
  onBackToMenu?: () => void;
}

export const MonopolyHUD: React.FC<MonopolyHUDProps> = ({
  gameState,
  myPlayerId,
  onOpenTrade,
  onOpenLog,
  onBackToMenu
}) => {
  const { players, currentPlayerIndex, round, maxRounds, turnTimer, activeEvent, freeParkingPool, phase } = gameState;
  const currPlayer = players[currentPlayerIndex];
  const isMyTurn = currPlayer?.id === myPlayerId;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-2 sm:px-4 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#131923]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:px-5 shadow-xl">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Về Menu Game"
            >
              <span>←</span>
              <span className="hidden sm:inline">Menu</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                CỜ TỶ PHÚ 8D
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Vòng {round}/{maxRounds}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isMyTurn ? '🔥 ĐẾN LƯỢT BẠN' : `Đang đợi ${currPlayer?.username || 'đối thủ'}...`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-700/40 px-3 py-1.5 rounded-xl">
            <span className="text-lg">☕</span>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-amber-400/80">Quỹ Cà Phê 8D</div>
              <div className="text-xs sm:text-sm font-extrabold text-amber-300">{freeParkingPool}Đ</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" className="text-slate-800" fill="transparent" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={turnTimer <= 5 ? 'text-red-500' : 'text-orange-500'}
                  fill="transparent"
                  strokeDasharray={100}
                  strokeDashoffset={100 - (turnTimer / 30) * 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute text-xs font-black ${turnTimer <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                {turnTimer}s
              </span>
            </div>

            {onOpenLog && (
              <button
                onClick={onOpenLog}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold"
                title="Xem Nhật Ký Trận"
              >
                📜 Nhật ký
              </button>
            )}

            {onOpenTrade && phase === 'BUILD_PHASE' && isMyTurn && (
              <button
                onClick={onOpenTrade}
                className="p-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                🤝 Giao dịch
              </button>
            )}
          </div>
        </div>
      </div>

      {activeEvent && (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-red-950/60 via-amber-950/40 to-red-950/60 border border-red-500/40 rounded-xl px-4 py-2 text-xs text-red-200 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeEvent.icon}</span>
            <span className="font-black text-amber-300">{activeEvent.name}:</span>
            <span className="text-slate-200">{activeEvent.description}</span>
          </div>
          <span className="font-bold text-amber-400 shrink-0">
            Còn {gameState.eventRoundsLeft} vòng
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {players.map((p, idx) => {
          const isTurn = idx === currentPlayerIndex;
          const isMe = p.id === myPlayerId;

          return (
            <div
              key={p.id}
              className={`relative rounded-xl p-2.5 sm:p-3 border transition-all duration-200 ${
                p.isEliminated
                  ? 'bg-red-950/20 border-red-900/30 opacity-50 grayscale'
                  : isTurn
                  ? 'bg-orange-950/30 border-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/50'
                  : 'bg-[#131923]/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm shrink-0"
                    style={{ backgroundColor: `${p.tokenColor}25`, borderColor: p.tokenColor, borderWidth: '1px' }}
                  >
                    {p.tokenEmoji}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-extrabold text-white truncate flex items-center gap-1">
                      {p.username}
                      {isMe && <span className="text-[10px] text-orange-400 font-bold">(Bạn)</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">Ô số {p.position}/{BOARD_SIZE}</div>
                  </div>
                </div>

                {isTurn && !p.isEliminated && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
                    Lượt
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-amber-300 text-sm">
                  {p.isEliminated ? 'ĐÃ LOẠI' : `${p.money.toLocaleString()}Đ`}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {p.properties.length} BĐS
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {p.inJail && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900/60 text-red-300 font-bold border border-red-700/50">
                    🔒 Tù ({p.jailTurns}/3)
                  </span>
                )}
                {p.skipNextTurn && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-bold border border-amber-700/50">
                    💩 Mất lượt
                  </span>
                )}
                {p.cards.includes('INSURANCE') && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-blue-900/60 text-blue-300 font-bold" title="Bảo hiểm VIP">
                    🛡️
                  </span>
                )}
                {p.cards.includes('GET_OUT_JAIL') && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-green-900/60 text-green-300 font-bold" title="Thẻ Ra Tù">
                    🚪
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
