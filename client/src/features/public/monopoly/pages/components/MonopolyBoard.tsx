import React, { useState } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS, STATION_RENTS, getStationTiles } from '../../game/boardData';
import { BOARD_SIZE } from '../../game/constants';
import { PropertyCard } from './PropertyCard';

interface MonopolyBoardProps {
  gameState: GameState;
  myPlayerId?: string;
  visualPositions?: Record<string, number>;
  animatingPlayerId?: string | null;
  onTileClick?: (tile: TileDef) => void;
  centerOverlay?: React.ReactNode;
}

const TILES_PER_SIDE = 9;

function getTileGridPosition(index: number): { row: number; col: number } {
  if (index === 0) return { row: 10, col: 10 };
  if (index >= 1 && index <= 8) return { row: 10, col: 10 - index };
  if (index === 9) return { row: 10, col: 1 };
  if (index >= 10 && index <= 17) return { row: 10 - (index - 9), col: 1 };
  if (index === 18) return { row: 1, col: 1 };
  if (index >= 19 && index <= 26) return { row: 1, col: 1 + (index - 18) };
  if (index === 27) return { row: 1, col: 10 };
  if (index >= 28 && index <= 35) return { row: 1 + (index - 27), col: 10 };
  return { row: 1, col: 1 };
}

const GROUP_STYLES: Record<string, { bar: string; border: string; glow: string; text: string; bg: string }> = {
  green: {
    bar: 'bg-gradient-to-r from-emerald-400 to-green-500',
    border: 'border-emerald-500/80',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    text: 'text-emerald-400',
    bg: 'rgba(16,185,129,0.15)'
  },
  blue: {
    bar: 'bg-gradient-to-r from-sky-400 to-cyan-500',
    border: 'border-sky-500/80',
    glow: 'shadow-[0_0_8px_rgba(56,189,248,0.3)]',
    text: 'text-sky-400',
    bg: 'rgba(56,189,248,0.15)'
  },
  yellow: {
    bar: 'bg-gradient-to-r from-amber-300 to-yellow-400',
    border: 'border-amber-400/80',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    text: 'text-amber-400',
    bg: 'rgba(245,158,11,0.15)'
  },
  red: {
    bar: 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500',
    border: 'border-rose-500/80',
    glow: 'shadow-[0_0_8px_rgba(244,63,94,0.3)]',
    text: 'text-rose-400',
    bg: 'rgba(244,63,94,0.15)'
  },
  purple: {
    bar: 'bg-gradient-to-r from-violet-500 to-purple-600',
    border: 'border-violet-500/80',
    glow: 'shadow-[0_0_10px_rgba(139,92,246,0.4)]',
    text: 'text-violet-400',
    bg: 'rgba(139,92,246,0.15)'
  }
};

const TILE_ICONS: Record<number, string> = {
  1: '🛵', 2: '📦', 3: '🏡', 4: '💸', 5: '🚌', 6: '🍇', 7: '🏭', 8: '❓',
  10: '🎓', 11: '🌉', 12: '📦', 13: '🏘️', 14: '🚂', 15: '🚦', 16: '❓', 17: '✈️',
  19: '☕', 20: '🏙️', 21: '📦', 22: '💎', 23: '✈️', 24: '🌸', 25: '💸', 26: '🏖️',
  28: '🏞️', 29: '🏢', 30: '❓', 31: '🏪', 32: '🚄', 33: '🏛️', 34: '👑', 35: '🏰'
};

function getBuildingDots(level: number): React.ReactNode {
  if (level === 0) return null;
  if (level === 4) {
    return (
      <div className="flex items-center justify-center gap-0.5">
        <span className="text-[8px]">⭐</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_3px_rgba(16,185,129,0.8)]" />
      ))}
    </div>
  );
}

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

  const cornerIndices = [0, 9, 18, 27];
  const isCorner = (idx: number) => cornerIndices.includes(idx);

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 select-none" style={{ perspective: '900px' }}>
      <style>{`
        @keyframes chibiHop {
          0% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-18px) scale(1.2); filter: drop-shadow(0 12px 5px rgba(0,0,0,0.7)); }
          75% { transform: translateY(-3px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-chibi-hop { animation: chibiHop 0.22s cubic-bezier(0.25, 1, 0.5, 1); }
        .tile-3d {
          transition: all 0.15s ease;
          transform-style: preserve-3d;
        }
        .tile-3d:hover {
          transform: translateY(-2px);
          z-index: 25 !important;
        }
        .tile-owned {
          box-shadow: 0 4px 0 rgba(0,0,0,0.4), 0 6px 12px rgba(0,0,0,0.3);
        }
      `}</style>

      <div
        className="relative w-[min(660px,calc(100vh-90px),calc(100vw-350px))] sm:w-[min(680px,calc(100vh-90px),calc(100vw-350px))] aspect-square rounded-[28px] p-2.5 transition-transform duration-300"
        style={{
          transform: viewMode === 'tilt' ? 'rotateX(22deg)' : 'none',
          transformOrigin: 'center 70%',
          background: 'linear-gradient(135deg, #3d2b1a 0%, #2a1f14 30%, #1a2538 70%, #1d1408 100%)',
          boxShadow: viewMode === 'tilt'
            ? '0 30px 60px rgba(0,0,0,0.9), 0 8px 0 #5c3d1e, 0 14px 0 #3d2510, 0 0 40px rgba(245,158,11,0.15)'
            : '0 20px 45px rgba(0,0,0,0.9), 0 6px 0 #5c3d1e',
          border: '4px solid rgba(245,158,11,0.7)',
          borderBottom: viewMode === 'tilt' ? '6px solid rgba(245,158,11,0.5)' : '4px solid rgba(245,158,11,0.7)'
        }}
      >
        <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-[3px] rounded-2xl bg-[#080e18] p-1.5 relative" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
          {BOARD_TILES.map((tile, idx) => {
            const pos = getTileGridPosition(idx);
            const corner = isCorner(idx);
            const owner = getOwner(idx);
            const buildLevel = owner ? (owner.buildings[idx] || 0) : 0;
            const groupStyle = tile.group ? GROUP_STYLES[tile.group] : null;
            const playersHere = playersByTile[idx] || [];
            const hasHoppingPlayer = playersHere.some(p => p.id === animatingPlayerId);
            const isInspected = activeTileIndex === idx;
            const isStation = tile.type === 'station';

            return (
              <div
                key={idx}
                onMouseEnter={() => handleTileHover(tile)}
                onClick={() => handleTileSelect(tile)}
                style={{
                  gridRow: pos.row,
                  gridColumn: pos.col,
                  backgroundColor: owner ? `${owner.tokenColor}15` : undefined
                }}
                className={`relative flex flex-col justify-between rounded-lg overflow-visible cursor-pointer tile-3d text-left ${
                  hasHoppingPlayer
                    ? 'ring-2 ring-amber-300 z-30 scale-[1.03]'
                    : isInspected
                    ? 'ring-2 ring-amber-400/80 z-20 scale-[1.01]'
                    : ''
                } ${corner
                    ? ''
                    : owner
                    ? 'tile-owned'
                    : 'hover:bg-[#1a2a42]'
                } ${
                  idx === 0
                    ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 border-2 border-emerald-400/70'
                    : idx === 9
                    ? 'bg-gradient-to-br from-slate-700 via-zinc-800 to-slate-950 border-2 border-slate-500/60'
                    : idx === 18
                    ? 'bg-gradient-to-br from-amber-700 via-yellow-800 to-amber-950 border-2 border-amber-400/70'
                    : idx === 27
                    ? 'bg-gradient-to-br from-rose-700 via-red-800 to-rose-950 border-2 border-rose-400/70'
                    : isStation
                    ? 'bg-gradient-to-b from-[#1e2d44] to-[#101a2a] border-2 border-slate-500/60'
                    : owner
                    ? `border-2 bg-gradient-to-b from-[#1c273a] to-[#0f1726]`
                    : 'bg-gradient-to-b from-[#161f30] to-[#0c1320] border border-slate-800/60'
                }`}
                style={{
                  ...( owner && !corner ? { borderColor: `${owner.tokenColor}90` } : {}),
                  ...(hasHoppingPlayer ? { boxShadow: `0 0 15px rgba(245,158,11,0.8)` } : {})
                } as React.CSSProperties}
              >
                {owner && !corner && (
                  <div className="absolute top-0 right-0 z-10">
                    <div
                      className="w-4 h-4 rounded-bl-md rounded-tr-lg overflow-hidden border-b border-l border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: owner.tokenColor }}
                    >
                      {owner.avatar ? (
                        <img src={owner.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[7px]">{owner.tokenEmoji}</span>
                      )}
                    </div>
                  </div>
                )}

                {tile.group && (
                  <div className={`h-[5px] w-full shrink-0 ${groupStyle?.bar || 'bg-slate-600'} rounded-t-sm`} />
                )}

                {isStation && (
                  <div className="h-[5px] w-full shrink-0 bg-gradient-to-r from-slate-400 via-white to-slate-400 rounded-t-sm" />
                )}

                <div className="flex-1 flex flex-col items-center justify-center p-0.5 overflow-hidden pointer-events-none">
                  {corner ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-lg sm:text-xl drop-shadow">
                        {idx === 0 ? '🏁' : idx === 9 ? '🔒' : idx === 18 ? '☕' : '🚔'}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-black mt-0.5 px-1 rounded bg-black/50"
                        style={{ color: idx === 0 ? '#6ee7b7' : idx === 18 ? '#fcd34d' : idx === 27 ? '#fca5a5' : '#cbd5e1' }}
                      >
                        {idx === 0 ? '+200Đ' : idx === 9 ? 'TÙ' : idx === 18 ? `${gameState.freeParkingPool}Đ` : 'BẮT'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm drop-shadow leading-none">
                        {tile.stationIcon || TILE_ICONS[idx] || '📍'}
                      </span>
                      <div className="w-full text-center px-0.5 mt-0.5">
                        <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-100 truncate leading-tight">
                          {tile.name.length > 8 ? tile.name.substring(0, 7) + '…' : tile.name}
                        </div>
                      </div>
                      {tile.price && (
                        <span className="text-[7px] sm:text-[8px] font-black text-slate-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-1 rounded-full shadow-sm mt-0.5">
                          {tile.price}Đ
                        </span>
                      )}
                      {tile.taxAmount && (
                        <span className="text-[7px] sm:text-[8px] font-black text-white bg-rose-600 px-1 rounded-full shadow-sm mt-0.5">
                          -{tile.taxAmount}Đ
                        </span>
                      )}
                    </>
                  )}
                </div>

                {buildLevel > 0 && !corner && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    {getBuildingDots(buildLevel)}
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
                          className={`relative flex flex-col items-center transition-all ${
                            isHopping ? 'animate-chibi-hop z-40' : 'z-30'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] border-2 overflow-hidden flex items-center justify-center bg-slate-950 ${
                              isTurn ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-black scale-110' : ''
                            }`}
                            style={{ borderColor: p.tokenColor }}
                            title={`${p.username} (${p.money}Đ)`}
                          >
                            {p.avatar ? (
                              <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px]">{p.tokenEmoji}</span>
                            )}
                          </div>
                          <div
                            className="text-[6px] font-black px-1 rounded-full bg-black/95 truncate max-w-[36px] -mt-0.5 shadow border border-white/15 text-center"
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
            className="col-start-2 col-end-10 row-start-2 row-end-10 rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between z-10"
            style={{
              background: 'linear-gradient(135deg, #0a3824 0%, #061f14 50%, #04170f 100%)',
              border: '2px solid rgba(245,158,11,0.5)',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(16,185,129,0.1)'
            }}
          >
            <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-black/70 border border-amber-400/30 shadow-inner">
              <div className="flex items-center gap-2 truncate">
                <span className="text-lg sm:text-xl">{TILE_ICONS[inspectedTile.index] || inspectedTile.stationIcon || '📍'}</span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-white truncate">{inspectedTile.name}</span>
                    {inspectedGroup && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${inspectedGroup.border} ${inspectedGroup.text}`}>
                        {inspectedTile.group?.toUpperCase()}
                      </span>
                    )}
                    {inspectedTile.type === 'station' && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full border border-slate-400/50 text-slate-300">
                        GA/SÂN BAY
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold truncate">
                    {inspectedOwner
                      ? `Chủ: ${inspectedOwner.username} ${inspectedTile.type === 'property' ? `(${BUILD_LEVELS[inspectedBuildLevel]?.name})` : ''}`
                      : inspectedTile.price ? 'Chưa có chủ sở hữu' : inspectedTile.flavor}
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
                {inspectedTile.type === 'station' && inspectedOwner && (
                  <div className="text-right hidden sm:block">
                    <div className="text-[8px] uppercase font-bold text-slate-400">Thuê</div>
                    <div className="text-xs font-black text-emerald-400">
                      {STATION_RENTS[Math.min(inspectedOwner.properties.filter(t => getStationTiles().includes(t)).length, STATION_RENTS.length - 1)]}Đ
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setModalTile(inspectedTile)}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-[10px] font-black transition-all cursor-pointer shadow hover:scale-105"
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
                {viewMode === 'tilt' ? '📐 2.5D' : '🧭 Flat'}
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
          gameState={gameState}
          onClose={() => setModalTile(null)}
        />
      )}
    </div>
  );
};
