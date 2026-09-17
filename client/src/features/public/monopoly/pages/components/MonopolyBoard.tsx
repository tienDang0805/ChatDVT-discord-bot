import React, { useState } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
import { PropertyCard } from './PropertyCard';

interface MonopolyBoardProps {
  gameState: GameState;
  myPlayerId: string;
  visualPositions?: Record<string, number>;
  animatingPlayerId?: string | null;
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

const GROUP_STYLES: Record<string, { bar: string; badge: string; border: string; glow: string }> = {
  green: {
    bar: 'bg-gradient-to-r from-emerald-500 to-green-600',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    border: 'hover:border-emerald-400 border-emerald-900/40',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]'
  },
  blue: {
    bar: 'bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-600',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    border: 'hover:border-blue-400 border-blue-900/40',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.2)]'
  },
  yellow: {
    bar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    border: 'hover:border-amber-400 border-amber-900/40',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]'
  },
  red: {
    bar: 'bg-gradient-to-r from-rose-500 via-red-600 to-amber-600',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    border: 'hover:border-rose-400 border-red-900/60 ring-1 ring-rose-500/40',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]'
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
  myPlayerId,
  visualPositions = {},
  animatingPlayerId = null,
  onTileClick,
  centerOverlay
}) => {
  const [inspectedTile, setInspectedTile] = useState<TileDef | null>(null);

  const playersByTile: Record<number, PlayerState[]> = {};
  gameState.players.forEach(p => {
    if (p.isEliminated) return;
    const tilePos = visualPositions[p.id] !== undefined ? visualPositions[p.id] : p.position;
    if (!playersByTile[tilePos]) playersByTile[tilePos] = [];
    playersByTile[tilePos].push(p);
  });

  const handleTileClick = (tile: TileDef) => {
    setInspectedTile(tile);
    if (onTileClick) onTileClick(tile);
  };

  const getOwner = (tileIndex: number) => {
    return gameState.players.find(p => !p.isEliminated && p.properties.includes(tileIndex));
  };

  const currPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="w-full flex flex-col items-center justify-center p-1 sm:p-2 select-none">
      <style>{`
        @keyframes chibiHop {
          0% {
            transform: translateY(0) scale(1);
          }
          35% {
            transform: translateY(-24px) scale(1.35) rotate(-8deg);
            filter: drop-shadow(0 14px 10px rgba(0,0,0,0.6));
          }
          70% {
            transform: translateY(-4px) scale(1.1) rotate(2deg);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        .animate-chibi-hop {
          animation: chibiHop 0.22s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <div className="relative w-full max-w-[860px] aspect-square rounded-[32px] p-2 sm:p-3 bg-gradient-to-br from-[#26170d] via-[#121a2e] to-[#1e1309] border-4 border-amber-500/80 shadow-[0_0_60px_rgba(245,158,11,0.35)]">
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-amber-400/80 shadow-md border border-white/50" />
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400/80 shadow-md border border-white/50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-amber-400/80 shadow-md border border-white/50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-amber-400/80 shadow-md border border-white/50" />

        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5 rounded-2xl bg-[#0a0f1d] p-1 sm:p-1.5 relative">
          {BOARD_TILES.map((tile, idx) => {
            const pos = TILE_GRID_POSITIONS[idx];
            const isCorner = idx === 0 || idx === 7 || idx === 14 || idx === 21;
            const owner = getOwner(idx);
            const buildLevel = owner ? (owner.buildings[idx] || 0) : 0;
            const groupStyle = tile.group ? GROUP_STYLES[tile.group] : null;
            const playersHere = playersByTile[idx] || [];
            const hasHoppingPlayer = playersHere.some(p => p.id === animatingPlayerId);

            return (
              <div
                key={idx}
                onClick={() => handleTileClick(tile)}
                style={{ gridRow: pos.row, gridColumn: pos.col }}
                className={`relative flex flex-col justify-between rounded-xl overflow-hidden cursor-pointer transition-all duration-150 border text-left ${
                  hasHoppingPlayer
                    ? 'ring-2 ring-amber-400 bg-[#1e293b] scale-102 z-20 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : isCorner
                    ? 'bg-gradient-to-br from-[#1b253b] via-[#101726] to-[#0d1424] border-amber-500/60 shadow-inner'
                    : 'bg-[#101626]/95 hover:bg-[#19243d] border-slate-800/90'
                } ${groupStyle ? groupStyle.border : ''} ${
                  owner ? 'ring-1 ring-amber-400/40' : ''
                }`}
              >
                {owner && (
                  <div
                    className="absolute top-0 right-0 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-bl-lg text-[9px] font-black text-white shadow-md"
                    style={{ backgroundColor: owner.tokenColor }}
                    title={`Chủ đất: ${owner.username}`}
                  >
                    <span>{owner.tokenEmoji}</span>
                    <span className="hidden sm:inline text-[8px]">{owner.username.slice(0, 4)}</span>
                  </div>
                )}

                {tile.group && (
                  <div className={`h-2 sm:h-2.5 w-full shrink-0 ${groupStyle?.bar || 'bg-slate-600'}`} />
                )}

                <div className="flex-1 flex flex-col justify-between p-1 sm:p-1.5 overflow-hidden">
                  {idx === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl animate-bounce">🏁</span>
                      <span className="text-[10px] sm:text-xs font-black text-amber-300 leading-tight mt-0.5">XUẤT PHÁT</span>
                      <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 mt-0.5">+200Đ LƯƠNG</span>
                    </div>
                  )}

                  {idx === 7 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-2xl">🔒</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-slate-200 leading-tight">KHÁM CHÍ HÒA</span>
                      <span className="text-[8px] sm:text-[9px] text-amber-400/80 font-bold">Thăm Tù / Ở Tù</span>
                    </div>
                  )}

                  {idx === 14 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-2xl animate-pulse">☕</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-amber-300 leading-tight">CÀ PHÊ 8D</span>
                      <span className="text-[8px] sm:text-[10px] font-black text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-full mt-0.5 border border-amber-500/30">
                        {gameState.freeParkingPool}Đ
                      </span>
                    </div>
                  )}

                  {idx === 21 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-2xl animate-bounce">🚔</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-rose-400 leading-tight">CÔNG AN BẮT</span>
                      <span className="text-[8px] sm:text-[9px] text-rose-300/80 font-bold">Nồng Độ Cồn</span>
                    </div>
                  )}

                  {!isCorner && (
                    <>
                      <div className="flex items-center justify-between gap-0.5">
                        <span className="text-xs sm:text-sm">{TILE_ICONS[idx] || '📍'}</span>
                        {owner && (
                          <div className="flex items-center gap-0.5 bg-black/40 px-1 py-0.5 rounded border border-amber-500/30" title={BUILD_LEVELS[buildLevel]?.name}>
                            <span className="text-[10px] sm:text-xs">{BUILD_LEVELS[buildLevel]?.icon}</span>
                            {buildLevel > 0 && (
                              <span className="text-[8px] sm:text-[9px] font-black text-amber-300">
                                {buildLevel}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="my-auto truncate">
                        <div className="text-[9px] sm:text-[11px] font-black text-white leading-tight truncate">
                          {tile.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-bold">
                        {tile.price && (
                          <span className="text-amber-300 font-black">{tile.price}Đ</span>
                        )}
                        {tile.type === 'tax' && (
                          <span className="text-rose-400 font-black">-{tile.taxAmount}Đ</span>
                        )}
                        {tile.type === 'chance' && (
                          <span className="text-purple-300 text-[8px] font-black uppercase">Cơ Hội</span>
                        )}
                        {tile.type === 'community' && (
                          <span className="text-cyan-300 text-[8px] font-black uppercase">Cộng Đồng</span>
                        )}
                        {tile.type === 'station' && (
                          <span className="text-amber-400 font-black">{tile.price}Đ</span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {playersHere.length > 0 && (
                  <div className="absolute inset-x-0 bottom-0.5 flex items-center justify-center gap-1 z-30 pointer-events-none">
                    {playersHere.map(p => {
                      const isHopping = animatingPlayerId === p.id;
                      const isTurn = p.id === currPlayer?.id;

                      return (
                        <div
                          key={p.id}
                          className={`relative flex flex-col items-center justify-center transition-all ${
                            isHopping ? 'animate-chibi-hop scale-130 z-40' : 'hover:scale-125 z-30'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.9)] border-2 overflow-hidden flex items-center justify-center bg-slate-950 ${
                              isTurn ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black' : ''
                            }`}
                            style={{ borderColor: p.tokenColor }}
                            title={`${p.username} (${p.money}Đ)`}
                          >
                            {p.avatar ? (
                              <img
                                src={p.avatar}
                                alt={p.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs">{p.tokenEmoji}</span>
                            )}
                          </div>
                          <div
                            className="text-[7px] sm:text-[8px] font-black px-1 rounded-sm bg-black/90 text-white truncate max-w-[40px] -mt-1 shadow border border-white/20"
                            style={{ color: p.tokenColor }}
                          >
                            {p.username.slice(0, 4)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="col-start-2 col-end-8 row-start-2 row-end-8 rounded-2xl bg-gradient-to-br from-[#0c2217] via-[#09151c] to-[#120f1c] border-2 border-amber-600/40 p-2 sm:p-4 flex flex-col items-center justify-between shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="w-full flex items-center justify-between text-xs px-2 z-10">
              <div className="flex items-center gap-1.5 bg-slate-950/70 border border-amber-500/30 px-3 py-1 rounded-full text-amber-300 font-black">
                <span>👑</span>
                <span>VÒNG {gameState.round}/{gameState.maxRounds}</span>
              </div>

              <div className="text-[10px] text-slate-400 font-bold">
                Bấm vào ô để xem Giấy Chứng Nhận (Sổ Đỏ)
              </div>
            </div>

            <div className="z-10 flex-1 flex items-center justify-center w-full">
              {centerOverlay}
            </div>

            <div className="w-full flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 z-10">
              <span className="text-amber-400">Đắk Nông Vương Quốc</span>
              <span>•</span>
              <span>8D Gaming Squad</span>
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
