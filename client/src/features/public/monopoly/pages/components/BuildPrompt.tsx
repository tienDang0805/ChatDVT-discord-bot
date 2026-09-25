import React from 'react';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
import type { GameState, TileDef } from '../../game/types';
import { getBuildCost, getDisplayedRent } from '../../game/economy';

interface BuildPromptProps {
  tileIndex: number;
  gameState: GameState;
  playerMoney: number;
  currentLevel: number;
  timer: number;
  onAccept: () => void;
  onSkip: () => void;
}

const GROUP_COLORS: Record<string, string> = {
  green: '#10b981',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6'
};

export const BuildPrompt: React.FC<BuildPromptProps> = ({
  tileIndex,
  gameState,
  playerMoney,
  currentLevel,
  timer,
  onAccept,
  onSkip
}) => {
  const tile: TileDef = BOARD_TILES[tileIndex] || BOARD_TILES[0];
  const nextLevel = currentLevel + 1;
  const nextConfig = BUILD_LEVELS[nextLevel];
  const currentConfig = BUILD_LEVELS[currentLevel];

  if (!nextConfig) return null;

  const cost = getBuildCost(gameState, tileIndex, nextLevel);
  const canAfford = playerMoney >= cost;
  const groupColor = tile.group ? GROUP_COLORS[tile.group] || '#64748b' : '#64748b';
  const owner = gameState.players.find(p => p.properties.includes(tileIndex));
  const currentRent = getDisplayedRent(gameState, tileIndex, currentLevel, owner?.id);
  const nextRent = getDisplayedRent(gameState, tileIndex, nextLevel, owner?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #131923 0%, #0d1117 100%)',
          border: `2px solid ${groupColor}88`,
          boxShadow: `0 0 40px ${groupColor}30, 0 20px 60px rgba(0,0,0,0.6)`
        }}
      >
        <div
          className="px-5 py-4 text-center relative"
          style={{ backgroundColor: `${groupColor}18`, borderBottom: `3px solid ${groupColor}` }}
        >
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-400 flex items-center justify-center gap-1.5">
            <span>🏡</span>
            <span>ĐẤT CỦA BẠN — CƠ HỘI NÂNG CẤP</span>
          </div>
          <h3 className="text-xl font-black text-white mt-1.5 tracking-wide">{tile.name}</h3>
          <p className="text-[11px] text-slate-400 italic mt-0.5">{tile.flavor}</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 bg-slate-900/80 rounded-2xl p-3 border border-slate-800 text-center">
              <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Hiện tại</div>
              <div className="text-lg mt-0.5">{currentConfig?.icon}</div>
              <div className="text-[11px] font-black text-slate-300">{currentConfig?.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Thuê: {currentRent}Đ</div>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <span className="text-xl text-emerald-400 animate-pulse">→</span>
            </div>

            <div
              className="flex-1 rounded-2xl p-3 border text-center"
              style={{
                backgroundColor: `${groupColor}12`,
                borderColor: `${groupColor}50`
              }}
            >
              <div className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Nâng lên</div>
              <div className="text-lg mt-0.5">{nextConfig.icon}</div>
              <div className="text-[11px] font-black text-white">{nextConfig.name}</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Thuê: {nextRent}Đ</div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Chi phí</div>
              <div className="text-lg font-black text-amber-300">{cost}Đ</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Số dư</div>
              <div className={`text-base font-black ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                {playerMoney.toLocaleString()}Đ
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] font-bold text-slate-400">
            ⏱ <span className="text-amber-400 font-black">{timer}s</span>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onAccept}
              disabled={!canAfford}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg ${
                canAfford
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              🔨 Nâng Cấp ({cost}Đ)
            </button>

            <button
              onClick={onSkip}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Bỏ Qua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
