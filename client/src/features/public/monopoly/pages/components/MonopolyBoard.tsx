import React, { useState } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
import { PropertyCard } from './PropertyCard';

interface MonopolyBoardProps {
  gameState: GameState;
  myPlayerId: string;
  onTileClick?: (tile: TileDef) => void;
  centerOverlay?: React.ReactNode;
}

const TILE_GRID_POSITIONS: Record<number, { row: number; col: number }> = {
  0: { row: 8, col: 8 },
  1: { row: 8, col: 7 },
  2: { row: 8, col: 6 },
  3: { row: 8, col: 5 },
  4: { row: 8, col: 4 },
  5: { row: 8, col: 3 },
  6: { row: 8, col: 2 },
  7: { row: 8, col: 1 },
  8: { row: 7, col: 1 },
  9: { row: 6, col: 1 },
  10: { row: 5, col: 1 },
  11: { row: 4, col: 1 },
  12: { row: 3, col: 1 },
  13: { row: 2, col: 1 },
  14: { row: 1, col: 1 },
  15: { row: 1, col: 2 },
  16: { row: 1, col: 3 },
  17: { row: 1, col: 4 },
  18: { row: 1, col: 5 },
  19: { row: 1, col: 6 },
  20: { row: 1, col: 7 },
  21: { row: 1, col: 8 },
  22: { row: 2, col: 8 },
  23: { row: 3, col: 8 },
  24: { row: 4, col: 8 },
  25: { row: 5, col: 8 },
  26: { row: 6, col: 8 },
  27: { row: 7, col: 8 },
};

const GROUP_STYLES: Record<string, { bar: string; badge: string; border: string }> = {
  green: {
    bar: 'bg-gradient-to-r from-emerald-500 to-green-600',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    border: 'hover:border-emerald-400'
  },
  blue: {
    bar: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    border: 'hover:border-blue-400'
  },
  yellow: {
    bar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    border: 'hover:border-amber-400'
  },
  red: {
    bar: 'bg-gradient-to-r from-rose-500 via-red-600 to-amber-600',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    border: 'hover:border-rose-400 ring-1 ring-rose-500/30'
  }
};

const TILE_ICONS: Record<number, string> = {
  1: '🛵',
  2: '🤝',
  3: '🏡',
  4: '🚨',
  5: '🚌',
  6: '🍇',
  8: '🎓',
  9: '❓',
  10: '🏙️',
  11: '🌉',
  12: '🚂',
  13: '🏘️',
  15: '☕',
  16: '🤝',
  17: '🚦',
  18: '🏭',
  19: '🚄',
  20: '❓',
  22: '🏞️',
  23: '❓',
  24: '🏢',
  25: '💸',
  26: '🏪',
  27: '🏰'
};

export const MonopolyBoard: React.FC<MonopolyBoardProps> = ({
  gameState,
  onTileClick,
  centerOverlay
}) => {
  const [inspectedTile, setInspectedTile] = useState<TileDef | null>(null);

  const playersByTile: Record<number, PlayerState[]> = {};
  gameState.players.forEach(p => {
    if (p.isEliminated) return;
    if (!playersByTile[p.position]) playersByTile[p.position] = [];
    playersByTile[p.position].push(p);
  });

  const handleTileClick = (tile: TileDef) => {
    setInspectedTile(tile);
    if (onTileClick) onTileClick(tile);
  };

  const getOwner = (tileIndex: number) => {
    return gameState.players.find(p => !p.isEliminated && p.properties.includes(tileIndex));
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-1 sm:p-3 select-none">
      <div className="relative w-full max-w-[840px] aspect-square rounded-3xl p-1.5 sm:p-2.5 bg-gradient-to-br from-[#1a120b] via-[#0d1624] to-[#120e0a] border-4 border-amber-600/70 shadow-[0_0_50px_rgba(217,119,6,0.3)]">
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5 rounded-2xl bg-[#090d16] p-1 sm:p-1.5 relative">
          {BOARD_TILES.map((tile, idx) => {
            const pos = TILE_GRID_POSITIONS[idx];
            const isCorner = idx === 0 || idx === 7 || idx === 14 || idx === 21;
            const owner = getOwner(idx);
            const buildLevel = owner ? (owner.buildings[idx] || 0) : 0;
            const groupStyle = tile.group ? GROUP_STYLES[tile.group] : null;
            const playersHere = playersByTile[idx] || [];

            return (
              <div
                key={idx}
                onClick={() => handleTileClick(tile)}
                style={{ gridRow: pos.row, gridColumn: pos.col }}
                className={`relative flex flex-col justify-between rounded-xl overflow-hidden cursor-pointer transition-all duration-150 border text-left ${
                  isCorner
                    ? 'bg-gradient-to-br from-[#1b2436] to-[#0f172a] border-amber-500/50 shadow-inner'
                    : 'bg-[#111827]/90 hover:bg-[#1f293d] border-slate-800'
                } ${groupStyle ? groupStyle.border : ''} ${
                  owner ? 'ring-1' : ''
                }`}
                style-prop={{}}
              >
                {owner && (
                  <div
                    className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 z-10 flex items-center justify-center rounded-bl-lg text-[9px] font-bold text-white shadow"
                    style={{ backgroundColor: owner.tokenColor }}
                    title={`Chủ đất: ${owner.username}`}
                  >
                    {owner.tokenEmoji}
                  </div>
                )}

                {tile.group && (
                  <div className={`h-1.5 sm:h-2 w-full ${groupStyle?.bar || 'bg-slate-600'}`} />
                )}

                <div className="flex-1 flex flex-col justify-between p-1 sm:p-1.5 overflow-hidden">
                  {idx === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl animate-bounce">🏁</span>
                      <span className="text-[10px] sm:text-xs font-black text-white leading-tight mt-0.5">XUẤT PHÁT</span>
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-400">+200Đ</span>
                    </div>
                  )}

                  {idx === 7 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl">🔒</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-slate-200 leading-tight">KHÁM CHÍ HÒA</span>
                      <span className="text-[8px] sm:text-[9px] text-slate-400">Ở Tù / Thăm</span>
                    </div>
                  )}

                  {idx === 14 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl">☕</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-amber-300 leading-tight">CÀ PHÊ 8D</span>
                      <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-400">
                        {gameState.freeParkingPool}Đ
                      </span>
                    </div>
                  )}

                  {idx === 21 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl animate-pulse">🚔</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-rose-400 leading-tight">CÔNG AN BẮT</span>
                      <span className="text-[8px] sm:text-[9px] text-rose-300/80">Nồng độ cồn</span>
                    </div>
                  )}

                  {!isCorner && (
                    <>
                      <div className="flex items-center justify-between gap-0.5">
                        <span className="text-xs sm:text-sm">{TILE_ICONS[idx] || '📍'}</span>
                        {buildLevel > 0 && (
                          <div className="flex items-center gap-0.5" title={BUILD_LEVELS[buildLevel]?.name}>
                            <span className="text-[10px] sm:text-xs">{BUILD_LEVELS[buildLevel]?.icon}</span>
                            <span className="text-[8px] sm:text-[9px] font-black text-amber-300">
                              {'★'.repeat(buildLevel)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="truncate my-auto">
                        <div className="text-[9px] sm:text-[11px] font-black text-white leading-tight truncate">
                          {tile.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-bold">
                        {tile.price && (
                          <span className="text-amber-300 font-extrabold">{tile.price}Đ</span>
                        )}
                        {tile.type === 'tax' && (
                          <span className="text-rose-400 font-extrabold">-{tile.taxAmount}Đ</span>
                        )}
                        {tile.type === 'chance' && (
                          <span className="text-purple-300 text-[8px] font-black">CƠ HỘI</span>
                        )}
                        {tile.type === 'community' && (
                          <span className="text-cyan-300 text-[8px] font-black">KHÍ VẬN</span>
                        )}
                        {tile.type === 'station' && (
                          <span className="text-amber-400 font-extrabold">{tile.price}Đ</span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {playersHere.length > 0 && (
                  <div className="absolute inset-x-0 bottom-0.5 flex items-center justify-center gap-0.5 z-20 pointer-events-none">
                    {playersHere.map(p => (
                      <div
                        key={p.id}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-[0_2px_8px_rgba(0,0,0,0.8)] border-2 border-white transform transition-transform hover:scale-125 animate-bounce"
                        style={{ backgroundColor: p.tokenColor }}
                        title={p.username}
                      >
                        {p.tokenEmoji}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div
            style={{ gridRow: '2 / 8', gridColumn: '2 / 8' }}
            className="relative rounded-2xl bg-gradient-to-br from-[#0a1420] via-[#080d17] to-[#120a06] border-2 border-amber-600/30 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🎲</span>
                <h1 className="text-base sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  CỜ TỶ PHÚ 8D
                </h1>
                <span className="text-xl sm:text-2xl">👑</span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-200/60 font-semibold tracking-widest uppercase">
                Bản Sắc Việt Nam • Đắk Nông Vương Quốc
              </p>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center justify-center my-auto">
              {centerOverlay}
            </div>

            <div className="relative z-10 w-full flex items-center justify-between px-2 text-[10px] sm:text-xs text-slate-400 font-semibold border-t border-slate-800/80 pt-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Bàn Cờ Trực Tuyến</span>
              </div>
              <div className="text-amber-400 font-bold">
                Quy Tắc: Gom Nhóm Màu ➔ Xây Nhà
              </div>
            </div>
          </div>
        </div>
      </div>

      {inspectedTile && (
        <PropertyCard
          tile={inspectedTile}
          owner={getOwner(inspectedTile.index)}
          buildLevel={getOwner(inspectedTile.index)?.buildings[inspectedTile.index] || 0}
          onClose={() => setInspectedTile(null)}
        />
      )}
    </div>
  );
};
export default MonopolyBoard;
