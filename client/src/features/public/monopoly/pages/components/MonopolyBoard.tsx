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
    <div className="w-full h-full flex items-center justify-center p-2 select-none overflow-visible" style={{ perspective: '1200px', perspectiveOrigin: '50% 48%' }}>
      <style>{`
        @keyframes chibiHopIso {
          0% {
            transform: translateY(0) scale(1) rotateZ(45deg) rotateX(-55deg);
          }
          40% {
            transform: translateY(-34px) scale(1.4) rotateZ(45deg) rotateX(-55deg);
            filter: drop-shadow(0 20px 10px rgba(0,0,0,0.7));
          }
          75% {
            transform: translateY(-4px) scale(1.1) rotateZ(45deg) rotateX(-55deg);
          }
          100% {
            transform: translateY(0) scale(1) rotateZ(45deg) rotateX(-55deg);
          }
        }
        .animate-chibi-hop-iso {
          animation: chibiHopIso 0.22s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <div
        className="relative w-[520px] h-[520px] sm:w-[580px] sm:h-[580px] md:w-[620px] md:h-[620px] aspect-square rounded-[28px] p-2 bg-gradient-to-br from-[#3b2210] via-[#1a2538] to-[#2e1708] border-4 border-amber-400 transition-transform duration-300"
        style={{
          transform: 'rotateX(55deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
          boxShadow: '0 2px 0 #b45309, 0 5px 0 #92400e, 0 9px 0 #78350f, 0 14px 0 #451a03, 0 20px 0 #291202, 0 26px 0 #180901, 0 35px 50px rgba(0, 0, 0, 0.85)'
        }}
      >
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1.5 rounded-2xl bg-[#0b1220] p-1.5 relative" style={{ transformStyle: 'preserve-3d' }}>
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
                  gridColumn: pos.col,
                  transformStyle: 'preserve-3d',
                  transform: isInspected ? 'translateZ(10px)' : 'translateZ(0px)'
                }}
                className={`relative flex flex-col justify-between rounded-xl overflow-visible cursor-pointer transition-all duration-150 border-2 text-left ${
                  hasHoppingPlayer
                    ? 'ring-4 ring-amber-300 bg-[#2b3e5e] z-30 shadow-[0_0_20px_rgba(245,158,11,0.9)]'
                    : isInspected
                    ? 'ring-2 ring-amber-400 bg-[#283952] z-20 shadow-lg'
                    : isCorner
                    ? 'shadow-md'
                    : 'bg-gradient-to-b from-[#223048] to-[#121c2d] hover:bg-[#2c3d5a]'
                } ${
                  idx === 0
                    ? 'bg-gradient-to-br from-red-600 via-amber-600 to-rose-700 border-amber-300 text-white'
                    : idx === 7
                    ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-zinc-950 border-slate-500 text-slate-200'
                    : idx === 14
                    ? 'bg-gradient-to-br from-amber-600 via-orange-800 to-amber-950 border-amber-400 text-amber-100'
                    : idx === 21
                    ? 'bg-gradient-to-br from-rose-700 via-red-800 to-blue-950 border-rose-400 text-rose-100'
                    : groupStyle
                    ? `${groupStyle.border} ${groupStyle.glow}`
                    : 'border-slate-700/80'
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
                  <div className={`h-2 w-full shrink-0 ${groupStyle?.bar || 'bg-slate-600'} rounded-t-sm border-b border-white/20`} />
                )}

                <div className="flex-1 flex flex-col items-center justify-between p-1 overflow-hidden pointer-events-none">
                  {idx === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-xl">🏁</span>
                      <span className="text-[8px] font-black text-amber-200 mt-0.5 bg-black/40 px-1 rounded">+200Đ</span>
                    </div>
                  )}

                  {idx === 7 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-xl">🔒</span>
                      <span className="text-[7px] text-amber-300 font-extrabold bg-black/40 px-1 rounded mt-0.5">TÙ</span>
                    </div>
                  )}

                  {idx === 14 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-xl">☕</span>
                      <span className="text-[7px] font-black text-amber-300 bg-black/40 px-1 rounded mt-0.5">{gameState.freeParkingPool}Đ</span>
                    </div>
                  )}

                  {idx === 21 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-xl">🚔</span>
                      <span className="text-[7px] text-rose-200 font-extrabold bg-black/40 px-1 rounded mt-0.5">BẮT</span>
                    </div>
                  )}

                  {!isCorner && (
                    <>
                      <span className="text-base drop-shadow">{TILE_ICONS[idx] || '📍'}</span>
                      {tile.price && (
                        <span className="text-[8px] font-black text-slate-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-1.5 py-0.2 rounded-full shadow-sm">
                          {tile.price}Đ
                        </span>
                      )}
                    </>
                  )}
                </div>

                {buildLevel > 0 && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center px-1 py-0.5 rounded-full bg-slate-950 border border-amber-400 shadow-md text-[10px]"
                    style={{
                      transform: 'translateX(-50%) rotateZ(45deg) rotateX(-55deg)',
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <span>{BUILD_LEVELS[buildLevel]?.icon}</span>
                  </div>
                )}

                {playersHere.length > 0 && (
                  <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 z-30 pointer-events-none">
                    {playersHere.map(p => {
                      const isHopping = animatingPlayerId === p.id;
                      const isTurn = p.id === currPlayer?.id;

                      return (
                        <div
                          key={p.id}
                          className={`relative flex flex-col items-center justify-center transition-all ${
                            isHopping ? 'animate-chibi-hop-iso z-40' : 'z-30'
                          }`}
                          style={{
                            transform: isHopping ? undefined : 'rotateZ(45deg) rotateX(-55deg)',
                            transformOrigin: 'bottom center',
                            transformStyle: 'preserve-3d'
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.9)] border-2 overflow-hidden flex items-center justify-center bg-slate-950 ${
                              isTurn ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-black scale-110 animate-pulse' : ''
                            }`}
                            style={{ borderColor: p.tokenColor }}
                            title={`${p.username} (${p.money}Đ)`}
                          >
                            {p.avatar ? (
                              <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm">{p.tokenEmoji}</span>
                            )}
                          </div>
                          <div
                            className="text-[8px] font-black px-1 rounded-full bg-black/95 text-white truncate max-w-[48px] -mt-1 shadow-md border border-white/30 text-center"
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
            className="col-start-2 col-end-8 row-start-2 row-end-8 rounded-3xl bg-gradient-to-br from-[#0c442e]/95 via-[#082b1d]/95 to-[#061e14]/95 border-2 border-amber-400/90 shadow-[0_0_40px_rgba(245,158,11,0.3),inset_0_0_40px_rgba(0,0,0,0.8)] p-3 flex flex-col items-center justify-between z-20 pointer-events-auto"
            style={{
              transform: 'rotateZ(45deg) rotateX(-55deg)',
              transformOrigin: 'center center',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="w-full flex items-center justify-between gap-2 p-2 rounded-2xl bg-black/70 border border-amber-400/40 shadow-inner">
              <div className="flex items-center gap-2 truncate">
                <span className="text-2xl">{TILE_ICONS[inspectedTile.index] || '📍'}</span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white truncate">{inspectedTile.name}</span>
                    {inspectedGroup && (
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${inspectedGroup.border} ${inspectedGroup.text}`}>
                        {inspectedTile.group?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold truncate">
                    {inspectedOwner ? `Chủ sở hữu: ${inspectedOwner.username} (${BUILD_LEVELS[inspectedBuildLevel]?.name || 'Cấp 0'})` : 'Chưa có chủ sở hữu'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {inspectedTile.price && (
                  <div className="text-right">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Giá mua</div>
                    <div className="text-xs font-black text-amber-300">{inspectedTile.price}Đ</div>
                  </div>
                )}
                {inspectedTile.baseRent && (
                  <div className="text-right">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Giá thuê</div>
                    <div className="text-xs font-black text-emerald-400">{inspectedTile.baseRent * (BUILD_LEVELS[inspectedBuildLevel]?.rentMultiplier || 1)}Đ</div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setModalTile(inspectedTile)}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-black transition-all cursor-pointer"
                >
                  Sổ Đỏ
                </button>
              </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center my-1">
              {centerOverlay}
            </div>

            <div className="w-full flex items-center justify-between text-[10px] font-bold text-amber-300/80 px-1">
              <span>👑 VÒNG {gameState.round}/{gameState.maxRounds}</span>
              <span>ĐẮK NÔNG VƯƠNG QUỐC • 8D</span>
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
