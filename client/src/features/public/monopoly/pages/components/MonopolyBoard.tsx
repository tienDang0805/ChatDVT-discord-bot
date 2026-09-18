import React, { useState } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS, STATION_RENTS } from '../../game/boardData';
import { PropertyCard } from './PropertyCard';

interface MonopolyBoardProps {
  gameState: GameState;
  myPlayerId?: string;
  visualPositions?: Record<string, number>;
  animatingPlayerId?: string | null;
  selectedTileIndex?: number;
  onTileClick?: (tile: TileDef) => void;
  centerOverlay?: React.ReactNode;
}

const GROUP_CONFIG: Record<string, {
  name: string;
  headerGradient: string;
  glow: string;
  tintBg: string;
  border: string;
  accent: string;
}> = {
  green: {
    name: 'NGOẠI THÀNH',
    headerGradient: 'linear-gradient(90deg, #047857, #10b981, #047857)',
    glow: 'rgba(16,185,129,0.7)',
    tintBg: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 55%, #dcfce7 100%)',
    border: '#22c55e',
    accent: '#15803d'
  },
  blue: {
    name: 'VEN ĐÔ',
    headerGradient: 'linear-gradient(90deg, #0369a1, #0284c7, #0369a1)',
    glow: 'rgba(2,132,199,0.7)',
    tintBg: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 55%, #e0f2fe 100%)',
    border: '#0ea5e9',
    accent: '#0369a1'
  },
  yellow: {
    name: 'ĐẤT VÀNG',
    headerGradient: 'linear-gradient(90deg, #b45309, #f59e0b, #b45309)',
    glow: 'rgba(245,158,11,0.7)',
    tintBg: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 55%, #fef3c7 100%)',
    border: '#eab308',
    accent: '#b45309'
  },
  red: {
    name: 'TÂY NGUYÊN',
    headerGradient: 'linear-gradient(90deg, #9f1239, #e11d48, #9f1239)',
    glow: 'rgba(225,29,72,0.7)',
    tintBg: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 55%, #ffe4e6 100%)',
    border: '#f43f5e',
    accent: '#be123c'
  },
  purple: {
    name: 'CAO CẤP',
    headerGradient: 'linear-gradient(90deg, #5b21b6, #7c3aed, #5b21b6)',
    glow: 'rgba(124,58,237,0.7)',
    tintBg: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 55%, #ede9fe 100%)',
    border: '#a855f7',
    accent: '#6d28d9'
  }
};

const CORNER_DATA: Record<number, { icon: string; label: string; sub: string; bg: string; textDark?: boolean }> = {
  0: { icon: '🏁', label: 'XUẤT PHÁT', sub: '+200Đ', bg: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)', textDark: true },
  9: { icon: '🔒', label: 'TÙ / THĂM TÙ', sub: 'KHÔNG DI CHUYỂN', bg: 'linear-gradient(135deg, #475569 0%, #334155 60%, #1e293b 100%)' },
  18: { icon: '☕', label: 'CÀ PHÊ 8D', sub: 'NGHỈ CHÂN', bg: 'linear-gradient(135deg, #d97706 0%, #b45309 60%, #78350f 100%)' },
  27: { icon: '🚔', label: 'VÀO TÙ NGAY', sub: 'CÔNG AN BẮT', bg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 60%, #7f1d1d 100%)' }
};

function getTileGridPosition(index: number): { row: number; col: number; orientation: 'bottom' | 'left' | 'top' | 'right' | 'corner' } {
  if (index === 0) return { row: 10, col: 10, orientation: 'corner' };
  if (index >= 1 && index <= 8) return { row: 10, col: 10 - index, orientation: 'bottom' };
  if (index === 9) return { row: 10, col: 1, orientation: 'corner' };
  if (index >= 10 && index <= 17) return { row: 10 - (index - 9), col: 1, orientation: 'left' };
  if (index === 18) return { row: 1, col: 1, orientation: 'corner' };
  if (index >= 19 && index <= 26) return { row: 1, col: 1 + (index - 18), orientation: 'top' };
  if (index === 27) return { row: 1, col: 10, orientation: 'corner' };
  if (index >= 28 && index <= 35) return { row: 1 + (index - 27), col: 10, orientation: 'right' };
  return { row: 10, col: 10, orientation: 'corner' };
}

function getTileCenterPercent(index: number): { x: number; y: number } {
  const colCenters = [6.31, 17.29, 26.64, 35.98, 45.33, 54.67, 64.02, 73.37, 82.71, 93.69];
  const rowCenters = [6.31, 17.29, 26.64, 35.98, 45.33, 54.67, 64.02, 73.37, 82.71, 93.69];
  const pos = getTileGridPosition(index);
  return {
    x: colCenters[pos.col - 1],
    y: rowCenters[pos.row - 1]
  };
}

function renderBuildingBadge(level: number): React.ReactNode {
  if (level === 0) {
    return (
      <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-200 border border-amber-400/60 shadow-sm leading-none flex items-center gap-0.5">
        <span>🐶</span>
        <span>CẤP 0</span>
      </span>
    );
  }
  if (level === 1) {
    return (
      <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-emerald-700 text-white border border-emerald-300 shadow-sm leading-none flex items-center gap-0.5">
        <span>⭐</span>
        <span>CẤP 1</span>
      </span>
    );
  }
  if (level === 2) {
    return (
      <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-sky-700 text-white border border-sky-300 shadow-sm leading-none flex items-center gap-0.5">
        <span>⭐⭐</span>
        <span>CẤP 2</span>
      </span>
    );
  }
  if (level === 3) {
    return (
      <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-amber-600 text-amber-100 border border-amber-300 shadow-sm leading-none flex items-center gap-0.5">
        <span>⭐⭐⭐</span>
        <span>CẤP 3</span>
      </span>
    );
  }
  return (
    <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-slate-950 border border-white shadow-md leading-none flex items-center gap-0.5 animate-pulse">
      <span>👑</span>
      <span>LANDMARK</span>
    </span>
  );
}

export const MonopolyBoard: React.FC<MonopolyBoardProps> = ({
  gameState,
  myPlayerId,
  visualPositions = {},
  animatingPlayerId = null,
  selectedTileIndex,
  onTileClick,
  centerOverlay
}) => {
  const currPlayer = gameState.players[gameState.currentPlayerIndex];
  const [internalTileIndex, setInternalTileIndex] = useState<number>(0);
  const [modalTile, setModalTile] = useState<TileDef | null>(null);

  const activeIndex = selectedTileIndex !== undefined ? selectedTileIndex : internalTileIndex;

  const getOwner = (tileIndex: number) => {
    return gameState.players.find(p => !p.isEliminated && p.properties.includes(tileIndex));
  };

  const cornerIndices = [0, 9, 18, 27];

  const activePlayers = gameState.players.filter(p => !p.isEliminated);
  const playersOnTileCount: Record<number, number> = {};
  activePlayers.forEach(p => {
    const tilePos = visualPositions[p.id] !== undefined ? visualPositions[p.id] : p.position;
    playersOnTileCount[tilePos] = (playersOnTileCount[tilePos] || 0) + 1;
  });

  const playerTileIndexMap: Record<number, PlayerState[]> = {};
  activePlayers.forEach(p => {
    const tilePos = visualPositions[p.id] !== undefined ? visualPositions[p.id] : p.position;
    if (!playerTileIndexMap[tilePos]) playerTileIndexMap[tilePos] = [];
    playerTileIndexMap[tilePos].push(p);
  });

  return (
    <div className="w-full h-full flex items-center justify-center select-none overflow-visible relative p-1 sm:p-2">
      <style>{`
        @keyframes pawnBounceHop {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
          50% { transform: translate(-50%, -50%) translateY(-22px) scale(1.22); }
        }
        @keyframes activeTileGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.4)); }
          50% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.95)); }
        }
        @keyframes landingGlow {
          0%, 100% { box-shadow: inset 0 0 12px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.9); }
          50% { box-shadow: inset 0 0 24px rgba(245, 158, 11, 0.9), 0 0 35px rgba(251, 191, 36, 1); }
        }
        .flat-tile {
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out;
        }
        .flat-tile:hover {
          transform: scale(1.025);
          z-index: 25 !important;
        }
        .flat-tile-selected {
          border-color: #fbbf24 !important;
          animation: activeTileGlow 1.8s ease-in-out infinite;
          z-index: 22 !important;
        }
        .pawn-hopping {
          animation: pawnBounceHop 0.28s ease-in-out infinite;
        }
      `}</style>

      <div
        className="relative rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_0_6px_#78350f,0_0_0_10px_#b45309,0_0_0_12px_#451a03]"
        style={{
          width: 'min(94vw, calc(100vh - 72px))',
          height: 'min(94vw, calc(100vh - 72px))',
          aspectRatio: '1',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
          padding: '6px'
        }}
      >
        <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden relative border-2 border-amber-500/60 shadow-inner">
          <div
            className="w-full h-full grid gap-[3px] p-[3px] rounded-xl relative"
            style={{
              background: '#0f172a',
              gridTemplateColumns: '1.35fr repeat(8, 1fr) 1.35fr',
              gridTemplateRows: '1.35fr repeat(8, 1fr) 1.35fr'
            }}
          >
            {BOARD_TILES.map((tile, idx) => {
              const pos = getTileGridPosition(idx);
              const isCorner = cornerIndices.includes(idx);
              const owner = getOwner(idx);
              const buildLevel = owner ? (owner.buildings[idx] || 0) : 0;
              const groupConf = tile.group ? GROUP_CONFIG[tile.group] : null;
              const isInspected = activeIndex === idx;
              const isStation = tile.type === 'station';
              const isTax = tile.type === 'tax';
              const isChance = tile.type === 'chance';
              const isCommunity = tile.type === 'community';
              const isResort = idx === 35;
              const cornerData = isCorner ? CORNER_DATA[idx] : null;

              const isLandingTarget = animatingPlayerId !== null && (visualPositions[animatingPlayerId] === idx);

              const tileBg = isCorner
                ? cornerData!.bg
                : owner && tile.type === 'property'
                ? `linear-gradient(180deg, ${owner.tokenColor}25 0%, #ffffff 40%, #f8fafc 70%, ${owner.tokenColor}30 100%)`
                : isStation
                ? 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)'
                : isResort
                ? 'linear-gradient(180deg, #faf5ff 0%, #ede9fe 40%, #ddd6fe 100%)'
                : isTax
                ? 'linear-gradient(180deg, #fef2f2 0%, #ffffff 50%, #fee2e2 100%)'
                : isChance
                ? 'linear-gradient(180deg, #fff7ed 0%, #ffffff 50%, #ffedd5 100%)'
                : isCommunity
                ? 'linear-gradient(180deg, #eef2ff 0%, #ffffff 50%, #e0e7ff 100%)'
                : groupConf
                ? groupConf.tintBg
                : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)';

              const tileBorder = isLandingTarget
                ? '3px solid #fbbf24'
                : isCorner
                ? '2px solid #64748b'
                : owner
                ? `2.5px solid ${owner.tokenColor}`
                : isStation
                ? '2px solid #f59e0b'
                : isResort
                ? '2.5px solid #8b5cf6'
                : isTax
                ? '1.5px solid #ef4444'
                : isChance
                ? '1.5px solid #f97316'
                : isCommunity
                ? '1.5px solid #6366f1'
                : groupConf
                ? `2px solid ${groupConf.border}`
                : '1.5px solid #94a3b8';

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setInternalTileIndex(idx);
                    if (onTileClick) onTileClick(tile);
                  }}
                  style={{
                    gridRow: pos.row,
                    gridColumn: pos.col,
                    background: tileBg,
                    border: tileBorder,
                    cursor: 'pointer'
                  }}
                  className={`flat-tile rounded-md overflow-hidden flex flex-col justify-between relative shadow-sm ${
                    isLandingTarget ? 'animate-[landingGlow_1.2s_ease-in-out_infinite] z-20' : isInspected ? 'flat-tile-selected z-10' : 'z-0'
                  }`}
                >
                  {owner && !isCorner ? (
                    <div
                      className="h-[16px] sm:h-[18px] w-full shrink-0 flex items-center justify-between px-1 overflow-hidden border-b border-white/40"
                      style={{
                        background: `linear-gradient(90deg, ${owner.tokenColor}, #0f172a 90%)`,
                        boxShadow: `0 1px 4px ${owner.tokenColor}`
                      }}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full overflow-hidden shrink-0 border border-white bg-slate-900 flex items-center justify-center shadow-sm">
                          {owner.avatar ? (
                            <img src={owner.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px]">{owner.tokenEmoji}</span>
                          )}
                        </div>
                        <span className="text-[7.5px] sm:text-[9px] font-black text-white truncate max-w-[50px] leading-none uppercase drop-shadow">
                          {owner.username}
                        </span>
                      </div>
                      <span className="text-[7px] sm:text-[8px] font-black text-amber-300 shrink-0 leading-none">
                        {isStation ? 'TRẠM' : buildLevel === 4 ? '👑 MAX' : `Lv.${buildLevel}`}
                      </span>
                    </div>
                  ) : (
                    <>
                      {groupConf && !isResort && (
                        <div
                          className="h-[14px] sm:h-[16px] w-full shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: groupConf.headerGradient,
                            boxShadow: `0 1px 3px ${groupConf.glow}`
                          }}
                        >
                          <span className="text-[7px] sm:text-[8.5px] font-black text-white tracking-wider uppercase leading-none drop-shadow-sm">
                            {groupConf.name}
                          </span>
                        </div>
                      )}

                      {isResort && (
                        <div
                          className="h-[14px] sm:h-[16px] w-full shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #4c1d95, #7c3aed, #c084fc, #7c3aed, #4c1d95)',
                            boxShadow: '0 1px 4px rgba(124,58,237,0.7)'
                          }}
                        >
                          <span className="text-[7.5px] sm:text-[9px] font-black text-amber-200 tracking-wider uppercase leading-none drop-shadow">
                            👑 RESORT 5⭐
                          </span>
                        </div>
                      )}

                      {isStation && (
                        <div
                          className="h-[14px] sm:h-[16px] w-full shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #92400e, #d97706, #fbbf24, #d97706, #92400e)',
                            boxShadow: '0 1px 4px rgba(245,158,11,0.7)'
                          }}
                        >
                          <span className="text-[7.5px] sm:text-[9px] font-black text-slate-950 tracking-wider uppercase leading-none">
                            ⭐ TRẠM ĐẶC BIỆT ⭐
                          </span>
                        </div>
                      )}

                      {isTax && (
                        <div
                          className="h-[13px] sm:h-[15px] w-full shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #881337, #dc2626, #f87171, #dc2626, #881337)',
                            boxShadow: '0 1px 3px rgba(220,38,38,0.6)'
                          }}
                        >
                          <span className="text-[7.5px] sm:text-[8.5px] font-black text-white tracking-wider uppercase leading-none">
                            🚨 NỘP PHẠT
                          </span>
                        </div>
                      )}

                      {isChance && (
                        <div
                          className="h-[13px] sm:h-[15px] w-full shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #c2410c, #ea580c, #fdba74, #ea580c, #c2410c)',
                            boxShadow: '0 1px 3px rgba(234,88,12,0.6)'
                          }}
                        >
                          <span className="text-[7.5px] sm:text-[8.5px] font-black text-white tracking-wider uppercase leading-none">
                            🎴 CƠ HỘI
                          </span>
                        </div>
                      )}

                      {isCommunity && (
                        <div
                          className="h-[13px] sm:h-[15px] w-full shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #4338ca, #6366f1, #a5b4fc, #6366f1, #4338ca)',
                            boxShadow: '0 1px 3px rgba(99,102,241,0.6)'
                          }}
                        >
                          <span className="text-[7.5px] sm:text-[8.5px] font-black text-white tracking-wider uppercase leading-none">
                            🎁 KHÍ VẬN
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="w-full flex-1 flex flex-col items-center justify-center px-0.5 pointer-events-none min-h-0 overflow-hidden">
                    {isCorner && cornerData ? (
                      <div className="flex flex-col items-center justify-center text-center gap-0.5 p-1 w-full h-full">
                        <span className="text-2xl sm:text-3xl drop-shadow">{cornerData.icon}</span>
                        <span
                          className={`text-[9px] sm:text-[11px] font-black tracking-wider leading-tight text-center ${
                            cornerData.textDark ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {cornerData.label}
                        </span>
                        <span
                          className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full mt-0.5 shadow-sm ${
                            cornerData.textDark
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black/75 text-amber-300'
                          }`}
                        >
                          {idx === 18 ? `${gameState.freeParkingPool}Đ` : cornerData.sub}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className={`drop-shadow-sm leading-none mt-0.5 ${isStation || isResort ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'}`}>
                          {tile.stationIcon || (isTax ? '🚨' : isChance ? '🎴' : isCommunity ? '🎁' : isResort ? '🏰' : '🏠')}
                        </span>
                        <div className="w-full text-center px-0.5 my-0.5 flex items-center justify-center">
                          <span
                            className={`font-black text-center leading-tight break-words truncate max-w-full ${
                              isStation
                                ? 'text-[8.5px] sm:text-[10.5px] text-amber-950 font-black'
                                : isResort
                                ? 'text-[9px] sm:text-[11px] text-violet-950 font-black'
                                : 'text-[8.5px] sm:text-[10px] text-slate-900'
                            }`}
                          >
                            {tile.name}
                          </span>
                        </div>

                        {owner && !isStation && !isCorner && (
                          <div className="flex items-center justify-center my-0.5">
                            {renderBuildingBadge(buildLevel)}
                          </div>
                        )}

                        {owner && (tile.type === 'property' || isStation) ? (
                          <span className="text-[7.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 bg-rose-600 text-white shadow-sm border border-rose-300 flex items-center gap-0.5">
                            <span className="opacity-90">Thuê:</span>
                            <span className="text-yellow-200 font-black">
                              {(() => {
                                if (isStation) {
                                  const stCount = gameState.players.find(p => p.id === owner.id)?.properties.filter(t => BOARD_TILES[t]?.type === 'station').length || 1;
                                  return STATION_RENTS[stCount] || STATION_RENTS[1];
                                }
                                return Math.floor((tile.baseRent || 10) * (BUILD_LEVELS[buildLevel]?.rentMultiplier || 1));
                              })()}Đ
                            </span>
                          </span>
                        ) : tile.price ? (
                          <span
                            className={`text-[7.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 shadow-sm ${
                              isStation
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border border-amber-300 font-black'
                                : isResort
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border border-violet-400 font-black'
                                : 'bg-amber-300 text-amber-950 border border-amber-400'
                            }`}
                          >
                            {tile.price}Đ
                          </span>
                        ) : null}

                        {tile.taxAmount && (
                          <span
                            className="text-[7.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 bg-rose-600 text-white shadow-sm"
                          >
                            -{tile.taxAmount}Đ
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            <div
              className="col-start-2 col-end-10 row-start-2 row-end-10 rounded-xl relative z-10 flex flex-col overflow-hidden select-none pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, #15803d 0%, #166534 40%, #14532d 75%, #052e16 100%)',
                border: '3px solid #f59e0b',
                boxShadow: `
                  inset 0 0 60px rgba(5,46,22,0.9),
                  inset 0 2px 0 rgba(254,240,138,0.5),
                  0 0 25px rgba(21,128,61,0.4)
                `
              }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 65%),
                    repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 16px)
                  `
                }}
              />

              <div
                className="absolute top-4 left-4 flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-amber-400/70 shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)'
                }}
              >
                <span className="text-2xl">🎴</span>
                <span className="text-[9px] font-black text-amber-300 mt-0.5 tracking-wider">CƠ HỘI</span>
              </div>

              <div
                className="absolute bottom-4 right-4 flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-purple-400/70 shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)'
                }}
              >
                <span className="text-2xl">🎁</span>
                <span className="text-[9px] font-black text-purple-300 mt-0.5 tracking-wider">KHÍ VẬN</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-amber-300/30 flex flex-col items-center justify-center opacity-35 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(254,240,138,0.15) 0%, transparent 70%)',
                    boxShadow: '0 0 30px rgba(245,158,11,0.2)'
                  }}
                >
                  <span className="text-4xl sm:text-5xl drop-shadow-lg">👑</span>
                  <span
                    className="text-[11px] sm:text-[13px] font-black tracking-widest text-amber-200 mt-1 uppercase"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
                  >
                    CỜ TỶ PHÚ 8D
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none z-30">
            {activePlayers.map(player => {
              const currentTile = visualPositions[player.id] !== undefined ? visualPositions[player.id] : player.position;
              const coords = getTileCenterPercent(currentTile);
              const isTurn = player.id === currPlayer?.id;
              const isHopping = animatingPlayerId === player.id;

              const siblings = playerTileIndexMap[currentTile] || [];
              const siblingIndex = siblings.findIndex(s => s.id === player.id);
              const totalSiblings = siblings.length;

              let offsetX = 0;
              let offsetY = 0;
              if (totalSiblings === 2) {
                offsetX = siblingIndex === 0 ? -12 : 12;
                offsetY = siblingIndex === 0 ? -10 : 10;
              } else if (totalSiblings === 3) {
                if (siblingIndex === 0) { offsetX = -13; offsetY = -10; }
                else if (siblingIndex === 1) { offsetX = 13; offsetY = -10; }
                else { offsetX = 0; offsetY = 12; }
              } else if (totalSiblings >= 4) {
                if (siblingIndex === 0) { offsetX = -13; offsetY = -13; }
                else if (siblingIndex === 1) { offsetX = 13; offsetY = -13; }
                else if (siblingIndex === 2) { offsetX = -13; offsetY = 13; }
                else { offsetX = 13; offsetY = 13; }
              }

              return (
                <div
                  key={player.id}
                  className="absolute"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
                    transition: 'left 0.28s cubic-bezier(0.22, 1, 0.36, 1), top 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
                    zIndex: isHopping ? 60 : isTurn ? 50 : 40
                  }}
                >
                  <div className={`relative flex flex-col items-center ${isHopping ? 'pawn-hopping' : ''}`}>
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_6px_16px_rgba(0,0,0,0.8)] border-[3px] bg-slate-950 transition-transform duration-150"
                      style={{
                        borderColor: player.tokenColor,
                        boxShadow: isTurn
                          ? `0 0 20px ${player.tokenColor}, 0 0 28px rgba(245,158,11,0.9), 0 8px 18px rgba(0,0,0,0.85)`
                          : `0 0 12px ${player.tokenColor}99, 0 6px 14px rgba(0,0,0,0.7)`
                      }}
                    >
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base sm:text-lg">{player.tokenEmoji}</span>
                      )}

                      {isTurn && (
                        <div
                          className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full animate-ping"
                          style={{ background: '#fbbf24' }}
                        />
                      )}
                    </div>

                    <div
                      className="px-2 py-0.5 rounded-full mt-1 leading-none shadow-md max-w-[68px] truncate text-center flex items-center gap-1 border border-white/40"
                      style={{
                        background: player.tokenColor,
                        color: '#ffffff'
                      }}
                    >
                      <span className="text-[8px] sm:text-[9px] font-black truncate leading-none uppercase drop-shadow">
                        {player.username}
                      </span>
                    </div>

                    <div
                      className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] -mt-[1px] shadow-sm"
                      style={{ borderTopColor: player.tokenColor }}
                    />

                    <div
                      className="w-7 h-2 rounded-full mt-0.5 blur-[1px] transition-transform duration-200"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 75%)',
                        transform: isHopping ? 'scale(0.65)' : 'scale(1)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
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
export default MonopolyBoard;
