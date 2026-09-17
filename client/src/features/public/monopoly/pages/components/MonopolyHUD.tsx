import React, { useState } from 'react';
import type { GameState } from '../../game/types';
import { BOARD_SIZE } from '../../game/constants';
import { sounds } from '../../utils/audio';

interface MonopolyHUDProps {
  gameState: GameState;
  myPlayerId: string;
  onOpenTrade?: () => void;
  onOpenLog?: () => void;
  onBackToMenu?: () => void;
}

const GROUP_TOTALS = {
  green: 3,
  blue: 3,
  yellow: 4,
  red: 4
};

const GROUP_TILES = {
  green: [1, 3, 6],
  blue: [8, 11, 13],
  yellow: [10, 15, 17, 18],
  red: [22, 24, 26, 27]
};

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
  const [audioEnabled, setAudioEnabled] = useState(sounds.isEnabled());

  const toggleSound = () => {
    const next = !audioEnabled;
    sounds.setEnabled(next);
    setAudioEnabled(next);
  };

  const getGroupProgress = (properties: number[]) => {
    return {
      green: properties.filter(t => GROUP_TILES.green.includes(t)).length,
      blue: properties.filter(t => GROUP_TILES.blue.includes(t)).length,
      yellow: properties.filter(t => GROUP_TILES.yellow.includes(t)).length,
      red: properties.filter(t => GROUP_TILES.red.includes(t)).length
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-2.5 px-2 sm:px-4 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#131923]/95 backdrop-blur-md border border-amber-600/30 rounded-2xl p-2.5 sm:px-5 shadow-xl">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow"
              title="Về Menu"
            >
              <span>←</span>
              <span className="hidden sm:inline">Menu</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">CỜ TỶ PHÚ 8D</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Vòng {round}/{maxRounds}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                {isMyTurn ? '🔥 ĐANG LÀ LƯỢT CỦA BẠN' : `Đang đợi ${currPlayer?.username || 'đối thủ'}...`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950/60 to-amber-900/30 border border-amber-600/40 px-3 py-1.5 rounded-xl shadow-inner">
            <span className="text-xl">☕</span>
            <div className="text-right">
              <div className="text-[9px] uppercase font-black text-amber-300/80">Quỹ Cà Phê 8D</div>
              <div className="text-xs sm:text-sm font-black text-amber-300">{freeParkingPool}Đ</div>
            </div>
          </div>

          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-9 h-9 transform -rotate-90">
              <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" className="text-slate-800" fill="transparent" />
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
                className={turnTimer <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}
                fill="transparent"
                strokeDasharray={88}
                strokeDashoffset={88 - (turnTimer / 30) * 88}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-[10px] font-black ${turnTimer <= 5 ? 'text-rose-400 font-extrabold' : 'text-slate-200'}`}>
              {turnTimer}s
            </span>
          </div>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all text-xs font-bold ${
              audioEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>

          {onOpenLog && (
            <button
              onClick={onOpenLog}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold shadow"
              title="Nhật ký trận đấu"
            >
              📜 Nhật ký
            </button>
          )}

          {onOpenTrade && phase === 'BUILD_PHASE' && isMyTurn && (
            <button
              onClick={onOpenTrade}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-black shadow-lg shadow-indigo-600/30"
            >
              🤝 Giao dịch
            </button>
          )}
        </div>
      </div>

      {activeEvent && (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-red-950/70 via-amber-950/50 to-red-950/70 border border-amber-500/50 rounded-xl px-4 py-2 text-xs text-amber-200 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeEvent.icon}</span>
            <span className="font-black text-amber-300 uppercase">{activeEvent.name}:</span>
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
          const progress = getGroupProgress(p.properties);

          return (
            <div
              key={p.id}
              className={`relative rounded-2xl p-2.5 sm:p-3 border transition-all duration-200 ${
                p.isEliminated
                  ? 'bg-rose-950/20 border-rose-900/30 opacity-40 grayscale'
                  : isTurn
                  ? 'bg-gradient-to-br from-amber-950/40 to-[#181d28] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                  : 'bg-[#131923]/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-sm font-black shadow shrink-0"
                    style={{ backgroundColor: `${p.tokenColor}25`, borderColor: p.tokenColor, borderWidth: '1.5px' }}
                  >
                    {p.tokenEmoji}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-black text-white truncate flex items-center gap-1">
                      {p.username}
                      {isMe && <span className="text-[10px] text-amber-400 font-bold">(Bạn)</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Ô số {p.position}/{BOARD_SIZE}
                    </div>
                  </div>
                </div>

                {isTurn && !p.isEliminated && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] uppercase tracking-wider shadow animate-pulse">
                    LƯỢT
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs my-1">
                <span className="font-black text-amber-300 text-sm">
                  {p.isEliminated ? 'ĐÃ LOẠI' : `${p.money.toLocaleString()}Đ`}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {p.properties.length} BĐS
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 py-1 px-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center text-[9px] font-black">
                <div className={progress.green === GROUP_TOTALS.green ? 'text-emerald-400 underline font-black' : 'text-emerald-300/60'}>
                  🟢 {progress.green}/{GROUP_TOTALS.green}
                </div>
                <div className={progress.blue === GROUP_TOTALS.blue ? 'text-blue-400 underline font-black' : 'text-blue-300/60'}>
                  🔵 {progress.blue}/{GROUP_TOTALS.blue}
                </div>
                <div className={progress.yellow === GROUP_TOTALS.yellow ? 'text-amber-400 underline font-black' : 'text-amber-300/60'}>
                  🟡 {progress.yellow}/{GROUP_TOTALS.yellow}
                </div>
                <div className={progress.red === GROUP_TOTALS.red ? 'text-rose-400 underline font-black' : 'text-rose-300/60'}>
                  🔴 {progress.red}/{GROUP_TOTALS.red}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-1.5">
                {p.inJail && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-bold border border-rose-700/50">
                    🔒 Khám ({p.jailTurns}/3)
                  </span>
                )}
                {p.skipNextTurn && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-bold border border-amber-700/50">
                    💩 Mất lượt
                  </span>
                )}
                {p.cards.includes('INSURANCE') && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-bold" title="Bảo hiểm VIP">
                    🛡️ Miễn thuê
                  </span>
                )}
                {p.cards.includes('GET_OUT_JAIL') && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-bold" title="Thẻ Ra Tù">
                    🚪 Ra tù free
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
export default MonopolyHUD;
