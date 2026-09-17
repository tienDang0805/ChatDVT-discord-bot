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

const GROUP_STYLES: Record<string, { bar: string; border: string; glow: string; text: string }> = {
  green: {
    bar: 'bg-gradient-to-r from-emerald-400 to-green-500',
    border: 'border-emerald-400/80 hover:border-emerald-300',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    text: 'text-emerald-400'
  },
  blue: {
    bar: 'bg-gradient-to-r from-sky-400 to-cyan-500',
    border: 'border-sky-400/80 hover:border-sky-300',
    glow: 'shadow-[0_0_12px_rgba(56,189,248,0.4)]',
    text: 'text-sky-400'
  },
  yellow: {
    bar: 'bg-gradient-to-r from-amber-300 to-yellow-400',
    border: 'border-amber-400/80 hover:border-amber-300',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    text: 'text-amber-400'
  },
  red: {
    bar: 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500',
    border: 'border-rose-400/80 hover:border-rose-300 ring-1 ring-rose-400/50',
    glow: 'shadow-[0_0_18px_rgba(244,63,94,0.5)]',
    text: 'text-rose-400'
  }
};

const TILE_ICONS: Record<number, string> = {
  1: '🛵',
  2: '📦',
  3: '🏡',
  4: '💸',
  5: '🚌',
  6: '🍇',
  8: '🎓',
  9: '❓',
  10: '🏙️',
  11: '🌉',
  12: '🚂',
  13: '🏘️',
  15: '☕',
  16: '📦',
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
  const [viewMode, setViewMode] = useState<'tilt' | 'flat'>('tilt');
  const currPlayer = gameState.players[gameState.currentPlayerIndex];
  const [activeTileIndex, setActiveTileIndex] = useState<number>(() => {
    return currPlayer ? currPlayer.position : 0;
  });
  const [modalTile, setModalTile] = useState<TileDef | null>(null);

  const playersByTile: Record<number, PlayerState[]> = {};
  gameState.players.forEach(p => {
    if (p.isEliminated) return;
    const tilePos = visualPositions[p.id] !== undefined ? visualPositions[p.id] : p.position;
    if (!playersByTile[tilePos]) playersByTile[tilePos] = [];
    playersByTile[tilePos].push(p);
  });

  const getOwner = (tileIndex: number) => {
    return gameState.players.find(p => !p.isEliminated && p.properties.includes(tileIndex));
  };

  const handleTileHover = (tile: TileDef) => {
    setActiveTileIndex(tile.index);
  };

  const handleTileSelect = (tile: TileDef) => {
    setActiveTileIndex(tile.index);
    if (onTileClick) onTileClick(tile);
  };

  const inspectedTile = BOARD_TILES[activeTileIndex] || BOARD_TILES[0];
  const inspectedOwner = getOwner(inspectedTile.index);
  const inspectedBuildLevel = inspectedOwner ? (inspectedOwner.buildings[inspectedTile.index] || 0) : 0;
  const inspectedGroup = inspectedTile.group ? GROUP_STYLES[inspectedTile.group] : null;

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 select-none" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes chibiHop {
          0% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-22px) scale(1.25);
            filter: drop-shadow(0 14px 6px rgba(0,0,0,0.7));
          }
          75% {
            transform: translateY(-3px) scale(1.08);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        .animate-chibi-hop {
          animation: chibiHop 0.22s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <div
        className="relative w-[min(560px,calc(100vh-100px),calc(100vw-360px))] sm:w-[min(590px,calc(100vh-100px),calc(100vw-360px))] aspect-square rounded-[26px] p-2 bg-gradient-to-br from-[#2c1a0e] via-[#1a2538] to-[#1d0e04] border-4 border-amber-400/90 transition-transform duration-300 shadow-[0_20px_45px_rgba(0,0,0,0.9),0_6px_0_#78350f,0_12px_0_#451a03]"
        style={{
          transform: viewMode === 'tilt' ? 'rotateX(14deg)' : 'none',
          transformOrigin: 'center 75%'
        }}
      >
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 rounded-2xl bg-[#090f1a] p-1.5 relative">
          {BOARD_TILES.map((tile, idx) => {
            const pos = TILE_GRID_POSITIONS[idx];
            const isCorner = idx === 0 || idx === 7 || idx === 14 || idx === 21;
            const owner = getOwner(idx);
            const buildLevel = owner ? (owner.buildings[idx] || 0) : 0;
            const groupStyle = tile.group ? GROUP_STYLES[tile.group] : null;
            const playersHere = playersByTile[idx] || [];
            const hasHoppingPlayer = playersHere.some(p => p.id === animatingPlayerId);
            const isInspected = inspectedTile.index === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => handleTileHover(tile)}
                onClick={() => handleTileSelect(tile)}
                style={{
                  gridRow: pos.row,
                  gridColumn: pos.col
                }}
                className={`relative flex flex-col justify-between rounded-xl overflow-visible cursor-pointer transition-all duration-150 border-2 border-b-4 border-r-2 text-left ${
                  hasHoppingPlayer
                    ? 'ring-4 ring-amber-300 bg-[#2b3e5e] z-30 shadow-[0_0_18px_rgba(245,158,11,0.9)] scale-[1.02]'
                    : isInspected
                    ? 'ring-2 ring-amber-400 bg-[#24354d] z-20 shadow-lg scale-[1.01]'
                    : isCorner
                    ? 'shadow-md border-b-4 border-slate-950/80'
                    : 'bg-gradient-to-b from-[#1c273a] to-[#0f1726] border-slate-950/80 hover:bg-[#253650] hover:-translate-y-0.5'
                } ${
                  idx === 0
                    ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border-emerald-300 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : idx === 7
                    ? 'bg-gradient-to-br from-slate-700 via-zinc-800 to-slate-950 border-slate-400 text-slate-200'
                    : idx === 14
                    ? 'bg-gradient-to-br from-amber-700 via-yellow-800 to-amber-950 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : idx === 21
                    ? 'bg-gradient-to-br from-rose-700 via-red-800 to-indigo-950 border-rose-400 text-rose-100'
                    : groupStyle
                    ? `${groupStyle.border} ${groupStyle.glow}`
                    : 'border-slate-800'
                } ${owner ? 'ring-1 ring-amber-400' : ''}`}
              >
                {owner && (
                  <div
                    className="absolute top-0 right-0 z-10 flex items-center gap-0.5 px-1 py-0.2 rounded-bl-md text-[8px] font-black text-white shadow border-b border-l border-white/30"
                    style={{ backgroundColor: owner.tokenColor }}
                  >
                    <span>{owner.tokenEmoji}</span>
                  </div>
                )}

                {tile.group && (
                  <div className={`h-2 w-full shrink-0 ${groupStyle?.bar || 'bg-slate-600'} rounded-t-sm border-b border-white/30`} />
                )}

                <div className="flex-1 flex flex-col items-center justify-between p-0.5 sm:p-1 overflow-hidden pointer-events-none">
                  {idx === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl drop-shadow">🏁</span>
                      <span className="text-[7px] sm:text-[8px] font-black text-amber-200 mt-0.5 bg-black/50 px-1 py-0.2 rounded">
                        +200Đ
                      </span>
                    </div>
                  )}

                  {idx === 7 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl drop-shadow">🔒</span>
                      <span className="text-[7px] text-amber-300 font-extrabold bg-black/50 px-1 py-0.2 rounded mt-0.5">
                        TÙ
                      </span>
                    </div>
                  )}

                  {idx === 14 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl drop-shadow">☕</span>
                      <span className="text-[7px] font-black text-amber-300 bg-black/50 px-1 py-0.2 rounded mt-0.5">
                        {gameState.freeParkingPool}Đ
                      </span>
                    </div>
                  )}

                  {idx === 21 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl drop-shadow">🚔</span>
                      <span className="text-[7px] text-rose-200 font-extrabold bg-black/50 px-1 py-0.2 rounded mt-0.5">
                        BẮT
                      </span>
                    </div>
                  )}

                  {!isCorner && (
                    <>
                      <div className="flex items-center justify-center">
                        <span className="text-sm sm:text-base drop-shadow">{TILE_ICONS[idx] || '📍'}</span>
                      </div>
                      <div className="w-full text-center px-0.5">
                        <div className="text-[8px] sm:text-[9px] font-black text-slate-200 truncate leading-tight">
                          {tile.name}
                        </div>
                      </div>
                      {tile.price && (
                        <div className="mt-0.5">
                          <span className="text-[7px] sm:text-[8px] font-black text-slate-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-1 sm:px-1.5 py-0.2 rounded-full shadow-sm">
                            {tile.price}Đ
                          </span>
                        </div>
                      )}
                      {tile.taxAmount && (
                        <div className="mt-0.5">
                          <span className="text-[7px] sm:text-[8px] font-black text-white bg-rose-600 px-1 py-0.2 rounded-full shadow-sm">
                            -{tile.taxAmount}Đ
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {buildLevel > 0 && (
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center px-1 py-0.2 rounded-full bg-slate-950 border border-amber-400 shadow-md text-[9px]"
                  >
                    <span>{BUILD_LEVELS[buildLevel]?.icon}</span>
                  </div>
                )}

                {playersHere.length > 0 && (
                  <div className="absolute inset-x-0 -bottom-1 flex items-center justify-center gap-0.5 z-30 pointer-events-none">
                    {playersHere.map(p => {
                      const isHopping = animatingPlayerId === p.id;
                      const isTurn = p.id === currPlayer?.id;

                      return (
                        <div
                          key={p.id}
                          className={`relative flex flex-col items-center justify-center transition-all ${
                            isHopping ? 'animate-chibi-hop z-40' : 'z-30'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-[0_6px_14px_rgba(0,0,0,0.9)] border-2 overflow-hidden flex items-center justify-center bg-slate-950 ${
                              isTurn ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-black scale-110 animate-pulse' : ''
                            }`}
                            style={{ borderColor: p.tokenColor }}
                            title={`${p.username} (${p.money}Đ)`}
                          >
                            {p.avatar ? (
                              <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs">{p.tokenEmoji}</span>
                            )}
                          </div>
                          <div
                            className="text-[7px] font-black px-1 rounded-full bg-black/95 text-white truncate max-w-[44px] -mt-1 shadow-md border border-white/20 text-center"
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

          <div
            className="col-start-2 col-end-8 row-start-2 row-end-8 rounded-2xl bg-gradient-to-br from-[#0a3824] via-[#07281a] to-[#04170f] border-2 border-amber-400/60 shadow-[inset_0_0_35px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.15)] p-2 sm:p-2.5 flex flex-col items-center justify-between z-10"
          >
            <div className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-black/70 border border-amber-400/30 shadow-inner">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xl sm:text-2xl">{TILE_ICONS[inspectedTile.index] || '📍'}</span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white truncate">{inspectedTile.name}</span>
                    {inspectedGroup && (
                      <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full border ${inspectedGroup.border} ${inspectedGroup.text}`}>
                        {inspectedTile.group?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold truncate">
                    {inspectedOwner ? `Chủ: ${inspectedOwner.username} (${BUILD_LEVELS[inspectedBuildLevel]?.name || 'Cấp 0'})` : 'Chưa có chủ sở hữu'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {inspectedTile.price && (
                  <div className="text-right hidden sm:block">
                    <div className="text-[8px] uppercase font-bold text-slate-400">Giá mua</div>
                    <div className="text-xs font-black text-amber-300">{inspectedTile.price}Đ</div>
                  </div>
                )}
                {inspectedTile.baseRent && (
                  <div className="text-right hidden sm:block">
                    <div className="text-[8px] uppercase font-bold text-slate-400">Thuê</div>
                    <div className="text-xs font-black text-emerald-400">{inspectedTile.baseRent * (BUILD_LEVELS[inspectedBuildLevel]?.rentMultiplier || 1)}Đ</div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setModalTile(inspectedTile)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-[10px] font-black transition-all cursor-pointer shadow hover:scale-105"
                >
                  📖 Sổ Đỏ
                </button>
              </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center my-1 overflow-visible">
              {centerOverlay}
            </div>

            <div className="w-full flex items-center justify-between text-[10px] font-bold text-amber-300/85 px-1">
              <span>👑 VÒNG {gameState.round}/{gameState.maxRounds}</span>
              <button
                type="button"
                onClick={() => setViewMode(prev => prev === 'tilt' ? 'flat' : 'tilt')}
                className="px-2 py-0.5 rounded-md bg-black/50 hover:bg-black/80 border border-amber-400/30 text-[9px] font-black text-amber-300 transition-all cursor-pointer"
              >
                {viewMode === 'tilt' ? '📐 2.5D Nghiêng' : '🧭 Trực diện'}
              </button>
              <span>☕ Quỹ: {gameState.freeParkingPool}Đ</span>
            </div>
          </div>
        </div>
      </div>

      {modalTile && (
        <PropertyCard
          tile={modalTile}
          owner={getOwner(modalTile.index)}
          buildLevel={getOwner(modalTile.index)?.buildings[modalTile.index] || 0}
          onClose={() => setModalTile(null)}
        />
      )}
    </div>
  );
};
