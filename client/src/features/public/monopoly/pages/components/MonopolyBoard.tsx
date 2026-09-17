import React, { useState } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
import { PropertyCard } from './PropertyCard';

interface MonopolyBoardProps {
  gameState: GameState;
  myPlayerId?: string;
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

const GROUP_STYLES: Record<string, { bar: string; border: string; glow: string }> = {
  green: {
    bar: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500',
    border: 'border-emerald-500/70 hover:border-emerald-300',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
  },
  blue: {
    bar: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500',
    border: 'border-blue-500/70 hover:border-blue-300',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
  },
  yellow: {
    bar: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400',
    border: 'border-amber-500/70 hover:border-amber-300',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]'
  },
  red: {
    bar: 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500',
    border: 'border-rose-500/80 hover:border-rose-300 ring-1 ring-rose-400/50',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]'
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
    <div className="w-full h-full flex items-center justify-center p-0 select-none">
      <style>{`
        @keyframes chibiHop {
          0% {
            transform: translateY(0) scale(1);
          }
          35% {
            transform: translateY(-22px) scale(1.35) rotate(-8deg);
            filter: drop-shadow(0 14px 10px rgba(0,0,0,0.7));
          }
          70% {
            transform: translateY(-3px) scale(1.1) rotate(2deg);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        .animate-chibi-hop {
          animation: chibiHop 0.22s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <div className="relative w-full h-full max-w-[min(650px,calc(100vh-80px))] max-h-[min(650px,calc(100vh-80px))] aspect-square rounded-[28px] p-2 bg-gradient-to-br from-[#3b2210] via-[#1a2538] to-[#2e1708] border-4 border-amber-400 shadow-[0_0_45px_rgba(245,158,11,0.4)]">
        <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-md border border-white" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-md border border-white" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-md border border-white" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-md border border-white" />

        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 rounded-2xl bg-[#0b1220] p-1 relative">
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
                className={`relative flex flex-col justify-between rounded-xl overflow-hidden cursor-pointer transition-all duration-150 border-2 text-left shadow-md ${
                  hasHoppingPlayer
                    ? 'ring-4 ring-amber-300 bg-[#283b58] scale-105 z-30 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                    : isCorner
                    ? 'shadow-lg'
                    : 'bg-gradient-to-b from-[#223048] to-[#121c2d] hover:bg-[#2b3d5b]'
                } ${
                  idx === 0
                    ? 'bg-gradient-to-br from-red-600 via-amber-600 to-rose-700 border-amber-300 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : idx === 7
                    ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-zinc-950 border-slate-500 text-slate-200'
                    : idx === 14
                    ? 'bg-gradient-to-br from-amber-600 via-orange-800 to-amber-950 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : idx === 21
                    ? 'bg-gradient-to-br from-rose-700 via-red-800 to-blue-950 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : groupStyle
                    ? `${groupStyle.border} ${groupStyle.glow}`
                    : 'border-slate-700/90'
                } ${owner ? 'ring-2 ring-amber-400' : ''}`}
              >
                {owner && (
                  <div
                    className="absolute top-0 right-0 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-bl-lg text-[8px] font-black text-white shadow-md border-b border-l border-white/30"
                    style={{ backgroundColor: owner.tokenColor }}
                    title={`Chủ đất: ${owner.username}`}
                  >
                    <span>{owner.tokenEmoji}</span>
                    <span className="hidden sm:inline text-[7px]">{owner.username.slice(0, 3)}</span>
                  </div>
                )}

                {tile.group && (
                  <div className={`h-2 sm:h-2.5 w-full shrink-0 ${groupStyle?.bar || 'bg-slate-600'} border-b border-white/20`} />
                )}

                <div className="flex-1 flex flex-col justify-between p-1 overflow-hidden">
                  {idx === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-2xl animate-bounce">🏁</span>
                      <span className="text-[9px] sm:text-[11px] font-black text-amber-200 tracking-wider">XUẤT PHÁT</span>
                      <span className="text-[8px] sm:text-[10px] font-black text-white mt-0.5 bg-black/40 px-1.5 py-0.5 rounded-full border border-amber-300/50">
                        +200Đ
                      </span>
                    </div>
                  )}

                  {idx === 7 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-2xl">🔒</span>
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-100 leading-tight">KHÁM CHÍ HÒA</span>
                      <span className="text-[8px] sm:text-[9px] text-amber-300 font-extrabold bg-black/40 px-1 rounded mt-0.5">
                        Thăm / Tù
                      </span>
                    </div>
                  )}

                  {idx === 14 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-2xl animate-pulse">☕</span>
                      <span className="text-[9px] sm:text-[10px] font-black text-amber-200 leading-tight">CÀ PHÊ 8D</span>
                      <span className="text-[8px] sm:text-[10px] font-black text-amber-300 bg-black/50 px-1.5 py-0.5 rounded-full mt-0.5 border border-amber-400/40">
                        {gameState.freeParkingPool}Đ
                      </span>
                    </div>
                  )}

                  {idx === 21 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-2xl animate-bounce">🚔</span>
                      <span className="text-[9px] sm:text-[10px] font-black text-rose-200 leading-tight">CÔNG AN BẮT</span>
                      <span className="text-[7px] sm:text-[8px] text-rose-100 font-extrabold bg-black/50 px-1 rounded mt-0.5">
                        Vào Tù Ngay
                      </span>
                    </div>
                  )}

                  {!isCorner && (
                    <>
                      <div className="flex items-center justify-between gap-0.5">
                        <span className="text-xs sm:text-sm drop-shadow">{TILE_ICONS[idx] || '📍'}</span>
                        {owner && (
                          <div className="flex items-center gap-0.5 bg-black/60 px-1 py-0.5 rounded border border-amber-400/60 shadow" title={BUILD_LEVELS[buildLevel]?.name}>
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
                        <div className="text-[9px] sm:text-[11px] font-black text-white leading-tight truncate drop-shadow-sm">
                          {tile.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold">
                        {tile.price && (
                          <span className="text-slate-950 font-black bg-gradient-to-r from-amber-300 to-yellow-400 px-1.5 py-0.5 rounded shadow-sm text-[8px]">
                            {tile.price}Đ
                          </span>
                        )}
                        {tile.type === 'tax' && (
                          <span className="text-white font-black bg-rose-600 px-1 rounded text-[8px]">-{tile.taxAmount}Đ</span>
                        )}
                        {tile.type === 'chance' && (
                          <span className="text-purple-200 font-black bg-purple-900/80 px-1 rounded text-[8px]">CƠ HỘI</span>
                        )}
                        {tile.type === 'community' && (
                          <span className="text-cyan-200 font-black bg-cyan-900/80 px-1 rounded text-[8px]">CỘNG ĐỒNG</span>
                        )}
                        {tile.type === 'station' && (
                          <span className="text-slate-950 font-black bg-gradient-to-r from-amber-300 to-yellow-400 px-1.5 py-0.5 rounded shadow-sm text-[8px]">
                            {tile.price}Đ
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {playersHere.length > 0 && (
                  <div className="absolute inset-x-0 bottom-0.5 flex items-center justify-center gap-0.5 z-30 pointer-events-none">
                    {playersHere.map(p => {
                      const isHopping = animatingPlayerId === p.id;
                      const isTurn = p.id === currPlayer?.id;

                      return (
                        <div
                          key={p.id}
                          className={`relative flex flex-col items-center justify-center transition-all ${
                            isHopping ? 'animate-chibi-hop scale-140 z-40' : 'hover:scale-125 z-30'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.9)] border-2 overflow-hidden flex items-center justify-center bg-slate-950 ${
                              isTurn ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-black scale-110' : ''
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
                            className="text-[7px] sm:text-[8px] font-black px-1 rounded bg-black/95 text-white truncate max-w-[36px] -mt-1 shadow-md border border-white/30"
                            style={{ color: p.tokenColor }}
                          >
                            {p.username.slice(0, 3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="col-start-2 col-end-8 row-start-2 row-end-8 rounded-2xl bg-gradient-to-br from-[#0e5439] via-[#093d29] to-[#072418] border-2 border-amber-400/80 p-2 sm:p-3 flex flex-col items-center justify-between shadow-[inset_0_0_35px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_75%)] pointer-events-none" />

            <div className="w-full flex items-center justify-between text-xs px-1 z-10">
              <div className="flex items-center gap-1.5 bg-black/70 border border-amber-400/50 px-3 py-1 rounded-full text-amber-300 font-black text-xs shadow-md">
                <span className="text-base">👑</span>
                <span>VÒNG {gameState.round}/{gameState.maxRounds}</span>
              </div>

              <div className="text-[10px] text-amber-200 font-bold bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/20 hidden sm:inline">
                Bấm vào ô để xem Sổ Đỏ Chính Chủ
              </div>
            </div>

            <div className="z-10 flex-1 flex items-center justify-center w-full my-auto">
              {centerOverlay}
            </div>

            <div className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-amber-300/90 z-10">
              <span>ĐẮK NÔNG VƯƠNG QUỐC</span>
              <span>★</span>
              <span>8D SQUAD</span>
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
