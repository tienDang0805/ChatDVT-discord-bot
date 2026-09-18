import React, { useState } from 'react';
import type { GameState, PlayerState } from '../../game/types';
import { BOARD_SIZE } from '../../game/constants';
import { BOARD_TILES, BUILD_LEVELS, getStationTiles } from '../../game/boardData';
import { sounds } from '../../utils/audio';
import { PlayerDetailModal } from './PlayerDetailModal';
import { CardInventoryModal } from './CardInventoryModal';

const GROUP_TOTALS: Record<string, number> = {
  green: 4,
  blue: 5,
  yellow: 5,
  red: 3,
  purple: 3
};

const GROUP_TILES: Record<string, number[]> = {};
BOARD_TILES.forEach(t => {
  if (t.group) {
    if (!GROUP_TILES[t.group]) GROUP_TILES[t.group] = [];
    GROUP_TILES[t.group].push(t.index);
  }
});
Object.keys(GROUP_TILES).forEach(g => {
  GROUP_TOTALS[g] = GROUP_TILES[g].length;
});

interface MonopolyTopBarProps {
  gameState: GameState;
  myPlayerId: string;
  onOpenTrade?: () => void;
  onOpenLog?: () => void;
  onBackToMenu?: () => void;
}

export const MonopolyTopBar: React.FC<MonopolyTopBarProps> = ({
  gameState,
  myPlayerId,
  onOpenTrade,
  onOpenLog,
  onBackToMenu
}) => {
  const { currentPlayerIndex, players, round, maxRounds, turnTimer, freeParkingPool, phase } = gameState;
  const currPlayer = players[currentPlayerIndex];
  const isMyTurn = currPlayer?.id === myPlayerId;
  const [audioEnabled, setAudioEnabled] = useState(sounds.isEnabled());
  const myPlayer = players.find(p => p.id === myPlayerId);
  const [showCards, setShowCards] = useState(false);

  const toggleSound = () => {
    const next = !audioEnabled;
    sounds.setEnabled(next);
    setAudioEnabled(next);
  };

  const cardCount = myPlayer?.cards?.length || 0;

  return (
    <>
      <div className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-[#121928] via-[#0d1422] to-[#121928] border-b-2 border-amber-400/40 shadow-xl select-none shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs font-black shadow border border-slate-700 active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>←</span>
              <span>Thoát</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xl animate-bounce">🎲</span>
            <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 tracking-wider hidden sm:inline">
              CỜ TỶ PHÚ 8D
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-black tracking-widest shadow">
              VÒNG {round}/{maxRounds}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-950/80 to-yellow-950/50 border border-amber-400/50 px-3 py-1 rounded-xl shadow-inner text-xs">
            <span className="text-base">☕</span>
            <span className="text-[10px] text-amber-300/80 font-bold hidden md:inline">Quỹ:</span>
            <span className="font-black text-amber-300 text-xs sm:text-sm">{freeParkingPool.toLocaleString()}Đ</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-2">
          <div className="text-center truncate">
            <span className={`text-xs font-black px-4 py-1.5 rounded-full border shadow-lg transition-all ${
              isMyTurn
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-amber-200 animate-pulse font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105'
                : 'bg-slate-900/90 text-amber-300/90 border-slate-700/80'
            }`}>
              {isMyTurn ? '🔥 ĐANG LÀ LƯỢT CỦA BẠN' : `⏳ Lượt của ${currPlayer?.username || 'đối thủ'}...`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" className="text-slate-800" fill="transparent" />
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="currentColor"
                strokeWidth="3"
                className={turnTimer <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}
                fill="transparent"
                strokeDasharray={75.4}
                strokeDashoffset={75.4 - (turnTimer / 30) * 75.4}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-[10px] font-black ${turnTimer <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-300'}`}>
              {turnTimer}s
            </span>
          </div>

          <button
            onClick={toggleSound}
            className={`p-1.5 px-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              audioEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>

          <button
            onClick={() => setShowCards(true)}
            className="relative px-2.5 py-1.5 rounded-xl bg-violet-900/60 hover:bg-violet-800/80 text-violet-200 hover:text-white transition-all text-xs font-black shadow border border-violet-600/50 cursor-pointer"
            title="Xem thẻ đang giữ"
          >
            🎴 Túi Đồ
            {cardCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[8px] font-black flex items-center justify-center shadow">
                {cardCount}
              </span>
            )}
          </button>

          {onOpenLog && (
            <button
              onClick={onOpenLog}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs font-black shadow border border-slate-700 cursor-pointer"
              title="Nhật ký trận đấu"
            >
              📜 Nhật ký
            </button>
          )}

          {onOpenTrade && phase === 'BUILD_PHASE' && isMyTurn && (
            <button
              onClick={onOpenTrade}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-black shadow-md shadow-indigo-600/30 cursor-pointer animate-pulse border border-indigo-400"
            >
              🤝 Giao dịch
            </button>
          )}
        </div>
      </div>

      {showCards && myPlayer && (
        <CardInventoryModal player={myPlayer} onClose={() => setShowCards(false)} />
      )}
    </>
  );
};

interface MonopolyPlayerCardProps {
  player: PlayerState;
  isCurrentTurn: boolean;
  isMe: boolean;
  gameState: GameState;
  onClick?: () => void;
}

export const MonopolyPlayerCard: React.FC<MonopolyPlayerCardProps> = ({
  player,
  isCurrentTurn,
  isMe,
  gameState,
  onClick
}) => {
  const stationTiles = getStationTiles();
  const stationCount = player.properties.filter(t => stationTiles.includes(t)).length;

  const progress: Record<string, number> = {};
  Object.keys(GROUP_TILES).forEach(g => {
    progress[g] = player.properties.filter(t => GROUP_TILES[g].includes(t)).length;
  });

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-2.5 border-2 transition-all duration-200 select-none shadow-lg cursor-pointer hover:scale-[1.02] ${
        player.isEliminated
          ? 'bg-rose-950/20 border-rose-900/30 opacity-40 grayscale'
          : isCurrentTurn
          ? 'bg-gradient-to-br from-[#2f1f0e] via-[#1a2538] to-[#131d2d] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/50 scale-[1.02]'
          : 'bg-gradient-to-b from-[#162032]/95 to-[#0e1625]/95 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-2 truncate">
          <div
            className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0 border-2 flex items-center justify-center bg-slate-950"
            style={{ borderColor: player.tokenColor }}
          >
            {player.avatar ? (
              <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{player.tokenEmoji}</span>
            )}
            <span className="absolute bottom-0 right-0 text-[10px] drop-shadow">{player.tokenEmoji}</span>
          </div>

          <div className="truncate">
            <div className="text-xs font-black text-white truncate flex items-center gap-1">
              {player.username}
              {isMe && <span className="text-[9px] text-amber-400 font-extrabold">(Bạn)</span>}
            </div>
            <div className="text-[10px] text-slate-400 font-bold">
              Đang ở ô {player.position}/{BOARD_SIZE}
            </div>
          </div>
        </div>

        {isCurrentTurn && !player.isEliminated && (
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow animate-pulse shrink-0">
            LƯỢT
          </span>
        )}
      </div>

      <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2">
        <div className="flex items-center gap-1 font-black text-amber-300 text-sm">
          <span>💰</span>
          <span>{player.isEliminated ? 'PHÁ SẢN' : `${player.money.toLocaleString()}Đ`}</span>
        </div>
        <div className="text-[11px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md">
          {player.properties.length} BĐS
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 py-1 px-1 rounded-xl bg-slate-900/80 text-center text-[9px] font-black border border-slate-800">
        {Object.keys(GROUP_TILES).slice(0, 3).map(group => {
          const complete = progress[group] === GROUP_TOTALS[group];
          const colorClasses: Record<string, string> = {
            green: complete ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/50' : 'text-emerald-400/80',
            blue: complete ? 'text-sky-300 bg-blue-950/60 border border-blue-500/50' : 'text-sky-400/80',
            yellow: complete ? 'text-amber-300 bg-amber-950/60 border border-amber-500/50' : 'text-amber-400/80'
          };
          const icons: Record<string, string> = { green: '🟢', blue: '🔵', yellow: '🟡' };
          return (
            <div key={group} className={`rounded px-0.5 ${colorClasses[group] || ''}`}>
              {icons[group]}{progress[group]}/{GROUP_TOTALS[group]}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-1 mt-1 px-1 text-center text-[9px] font-black">
        {Object.keys(GROUP_TILES).slice(3, 5).map(group => {
          const complete = progress[group] === GROUP_TOTALS[group];
          const colorClasses: Record<string, string> = {
            red: complete ? 'text-rose-300 bg-rose-950/60 border border-rose-500/50' : 'text-rose-400/80',
            purple: complete ? 'text-violet-300 bg-violet-950/60 border border-violet-500/50' : 'text-violet-400/80'
          };
          const icons: Record<string, string> = { red: '🔴', purple: '🟣' };
          return (
            <div key={group} className={`rounded px-0.5 ${colorClasses[group] || ''}`}>
              {icons[group]}{progress[group]}/{GROUP_TOTALS[group]}
            </div>
          );
        })}
        <div className={`rounded px-0.5 ${
          stationCount >= 4 ? 'text-amber-300 bg-amber-950/60 border border-amber-500/50 font-extrabold' : 'text-slate-400/80'
        }`}>
          🚉{stationCount}/4
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-1.5">
        {player.inJail && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/70 text-rose-200 font-black border border-rose-600/50 shadow">
            🔒 Khám ({player.jailTurns}/3)
          </span>
        )}
        {player.skipNextTurn && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/70 text-amber-200 font-black border border-amber-600/50 shadow">
            💩 Mất lượt
          </span>
        )}
        {player.cards.length > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-900/70 text-violet-200 font-black border border-violet-600/50 shadow">
            🎴 {player.cards.length} thẻ
          </span>
        )}
      </div>
    </div>
  );
};
