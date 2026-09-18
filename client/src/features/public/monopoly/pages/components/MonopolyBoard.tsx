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
    glow: 'rgba(16,185,129,0.8)',
    tintBg: 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 50%, #d1fae5 100%)',
    border: '#10b981',
    accent: '#047857'
  },
  blue: {
    name: 'VEN ĐÔ',
    headerGradient: 'linear-gradient(90deg, #0369a1, #0284c7, #0369a1)',
    glow: 'rgba(2,132,199,0.8)',
    tintBg: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)',
    border: '#0284c7',
    accent: '#0369a1'
  },
  yellow: {
    name: 'ĐẤT VÀNG',
    headerGradient: 'linear-gradient(90deg, #b45309, #f59e0b, #b45309)',
    glow: 'rgba(245,158,11,0.8)',
    tintBg: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%)',
    border: '#f59e0b',
    accent: '#b45309'
  },
  red: {
    name: 'TÂY NGUYÊN',
    headerGradient: 'linear-gradient(90deg, #9f1239, #e11d48, #9f1239)',
    glow: 'rgba(225,29,72,0.8)',
    tintBg: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 50%, #ffe4e6 100%)',
    border: '#e11d48',
    accent: '#9f1239'
  },
  purple: {
    name: 'CAO CẤP',
    headerGradient: 'linear-gradient(90deg, #5b21b6, #7c3aed, #5b21b6)',
    glow: 'rgba(124,58,237,0.8)',
    tintBg: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 50%, #ede9fe 100%)',
    border: '#7c3aed',
    accent: '#5b21b6'
  }
};

const CORNER_DATA: Record<number, { icon: string; label: string; sub: string; bg: string; textDark?: boolean }> = {
  0: { icon: '🏁', label: 'XUẤT PHÁT', sub: '+200Đ', bg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)', textDark: true },
  9: { icon: '🔒', label: 'TÙ', sub: 'GIAM GIỮ', bg: 'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)' },
  18: { icon: '☕', label: 'CÀ PHÊ 8D', sub: 'NGHỈ CHÂN', bg: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)' },
  27: { icon: '🚔', label: 'VÀO TÙ', sub: 'CÔNG AN BẮT', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)' }
};

function getTileGridPosition(index: number): { row: number; col: number; side: 'bottom' | 'left' | 'top' | 'right' | 'corner' } {
  if (index === 0) return { row: 10, col: 10, side: 'corner' };
  if (index >= 1 && index <= 8) return { row: 10, col: 10 - index, side: 'bottom' };
  if (index === 9) return { row: 10, col: 1, side: 'corner' };
  if (index >= 10 && index <= 17) return { row: 10 - (index - 9), col: 1, side: 'left' };
  if (index === 18) return { row: 1, col: 1, side: 'corner' };
  if (index >= 19 && index <= 26) return { row: 1, col: 1 + (index - 18), side: 'top' };
  if (index === 27) return { row: 1, col: 10, side: 'corner' };
  if (index >= 28 && index <= 35) return { row: 1 + (index - 27), col: 10, side: 'right' };
  return { row: 10, col: 10, side: 'corner' };
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

function render3DBuildingModel(level: number, ownerColor: string = '#f59e0b'): React.ReactNode {
  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-none z-30 flex flex-col items-center select-none"
      style={{
        transform: 'translate(-50%, -50%) rotateZ(45deg) rotateX(-54deg) translateY(-8px)',
        transformOrigin: 'bottom center'
      }}
    >
      <div className="relative flex flex-col items-center drop-shadow-[0_8px_12px_rgba(0,0,0,0.65)]">
        <div className="absolute -top-3.5 -right-2 flex items-start z-20">
          <div className="w-[2px] h-4 bg-amber-200 shadow-sm" />
          <div
            className="w-3 h-2 shadow-sm"
            style={{
              background: ownerColor,
              clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
            }}
          />
        </div>

        {level === 0 && (
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-amber-900 border border-amber-500 flex items-center justify-center text-[10px] shadow-lg">
              🐶
            </div>
          </div>
        )}

        {level === 1 && (
          <div className="flex flex-col items-center">
            <div
              className="w-6 h-3 bg-gradient-to-r from-red-600 to-rose-700 shadow-md"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="w-5 h-4 bg-gradient-to-b from-amber-100 to-amber-200 border border-amber-900 flex items-center justify-center shadow-inner -mt-0.5">
              <div className="w-1.5 h-2 bg-amber-900 rounded-t-sm" />
            </div>
          </div>
        )}

        {level === 2 && (
          <div className="flex flex-col items-center">
            <div
              className="w-7 h-3.5 bg-gradient-to-r from-sky-600 to-blue-700 shadow-md"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="w-6 h-6 bg-gradient-to-b from-sky-50 to-sky-200 border border-sky-950 flex flex-col items-center justify-between p-0.5 shadow-inner -mt-0.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-sky-900" />
                <div className="w-1.5 h-1.5 bg-sky-900" />
              </div>
              <div className="w-2 h-2.5 bg-amber-900 rounded-t-sm" />
            </div>
          </div>
        )}

        {level === 3 && (
          <div className="flex flex-col items-center">
            <div className="w-6 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-600 rounded-t-sm" />
            <div className="w-7 h-9 bg-gradient-to-b from-slate-100 via-amber-50 to-slate-200 border-2 border-amber-700 flex flex-col items-center justify-around py-0.5 shadow-xl -mt-0.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-amber-800" />
                <div className="w-1.5 h-1.5 bg-amber-800" />
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-amber-800" />
                <div className="w-1.5 h-1.5 bg-amber-800" />
              </div>
              <div className="w-2.5 h-3 bg-amber-950 rounded-t-sm" />
            </div>
          </div>
        )}

        {level === 4 && (
          <div className="flex flex-col items-center animate-pulse">
            <div className="text-base leading-none -mb-1 drop-shadow-[0_0_8px_rgba(245,158,11,1)]">👑</div>
            <div
              className="w-8 h-4 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 border border-amber-600 shadow-lg"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="w-8 h-10 bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-500 border-2 border-amber-800 flex flex-col items-center justify-between py-1 shadow-[0_0_15px_rgba(245,158,11,0.8)] -mt-0.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-amber-900 rounded-sm" />
                <div className="w-2 h-2 bg-amber-900 rounded-sm" />
              </div>
              <div className="w-3 h-4 bg-slate-950 rounded-t-sm border border-amber-300" />
            </div>
          </div>
        )}
      </div>

      <div className="w-7 h-2 rounded-full bg-black/50 blur-[1px] mt-0.5" />
    </div>
  );
}

function renderMoneyStack(style: React.CSSProperties): React.ReactNode {
  return (
    <div
      className="absolute pointer-events-none select-none z-10 hidden md:flex flex-col items-center"
      style={style}
    >
      <div
        className="flex flex-col -space-y-2.5 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
        style={{ transform: 'rotateX(54deg) rotateZ(-45deg)' }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-14 h-8 rounded-sm bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-800 border border-emerald-400/80 shadow flex items-center justify-center relative"
          >
            <div className="w-10 h-5 border border-emerald-300/40 rounded-sm flex items-center justify-center">
              <span className="text-[7px] font-black text-emerald-200 opacity-90">💵 $100K</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40" />
          </div>
        ))}
      </div>
    </div>
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
  const playerTileIndexMap: Record<number, PlayerState[]> = {};
  activePlayers.forEach(p => {
    const tilePos = visualPositions[p.id] !== undefined ? visualPositions[p.id] : p.position;
    if (!playerTileIndexMap[tilePos]) playerTileIndexMap[tilePos] = [];
    playerTileIndexMap[tilePos].push(p);
  });

  return (
    <div
      className="w-full h-full flex items-center justify-center select-none overflow-visible relative"
      style={{ perspective: '1600px', perspectiveOrigin: 'center 46%' }}
    >
      <style>{`
        @keyframes pawnHopBillboard {
          0%, 100% { transform: translate(-50%, -50%) rotateZ(45deg) rotateX(-54deg) translateY(0) scale(1); }
          50% { transform: translate(-50%, -50%) rotateZ(45deg) rotateX(-54deg) translateY(-24px) scale(1.22); }
        }
        @keyframes tileHoverGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.4)); }
          50% { filter: drop-shadow(0 0 12px rgba(245, 158, 11, 1)); }
        }
        @keyframes landingPulse {
          0%, 100% { box-shadow: inset 0 0 15px rgba(245, 158, 11, 0.7), 0 0 25px rgba(245, 158, 11, 0.9); }
          50% { box-shadow: inset 0 0 30px rgba(245, 158, 11, 1), 0 0 45px rgba(251, 191, 36, 1); }
        }
        .iso-tile {
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        .iso-tile:hover {
          filter: brightness(1.08);
          z-index: 25 !important;
        }
        .iso-tile-selected {
          animation: tileHoverGlow 1.6s ease-in-out infinite;
          z-index: 22 !important;
        }
        .pawn-hopping-3d {
          animation: pawnHopBillboard 0.28s ease-in-out infinite;
        }
      `}</style>

      {renderMoneyStack({ bottom: '8%', left: '14%' })}
      {renderMoneyStack({ top: '10%', left: '14%' })}
      {renderMoneyStack({ top: '10%', right: '14%' })}
      {renderMoneyStack({ bottom: '8%', right: '14%' })}

      <div
        className="relative transition-transform duration-500 rounded-3xl"
        style={{
          width: 'min(980px, 86vw, calc(100vh - 30px))',
          height: 'min(980px, 86vw, calc(100vh - 30px))',
          aspectRatio: '1',
          transform: 'rotateX(54deg) rotateZ(-45deg) translateY(-2%) scale(1.04)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, #78350f 0%, #592506 30%, #3e1903 70%, #290f02 100%)',
          border: '10px solid #92400e',
          boxShadow: `
            0 4px 0 #592506,
            0 8px 0 #3e1903,
            0 12px 0 #290f02,
            0 16px 0 #180801,
            0 20px 0 #0d0400,
            0 30px 50px rgba(0,0,0,0.8),
            0 50px 90px rgba(0,0,0,0.9)
          `
        }}
      >
        <div
          className="absolute -top-3.5 -left-3.5 w-11 h-11 rounded-tl-2xl flex items-center justify-center pointer-events-none z-30 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1, #64748b)',
            border: '3px solid #f1f5f9'
          }}
        >
          <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
        </div>
        <div
          className="absolute -top-3.5 -right-3.5 w-11 h-11 rounded-tr-2xl flex items-center justify-center pointer-events-none z-30 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1, #64748b)',
            border: '3px solid #f1f5f9'
          }}
        >
          <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
        </div>
        <div
          className="absolute -bottom-3.5 -left-3.5 w-11 h-11 rounded-bl-2xl flex items-center justify-center pointer-events-none z-30 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1, #64748b)',
            border: '3px solid #f1f5f9'
          }}
        >
          <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
        </div>
        <div
          className="absolute -bottom-3.5 -right-3.5 w-11 h-11 rounded-br-2xl flex items-center justify-center pointer-events-none z-30 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1, #64748b)',
            border: '3px solid #f1f5f9'
          }}
        >
          <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
        </div>

        <div
          className="absolute inset-[6px] rounded-2xl overflow-hidden z-10 border-2 border-amber-400/80 shadow-inner"
        >
          <div
            className="w-full h-full grid gap-[2px] p-[2px] rounded-xl relative"
            style={{
              background: '#0f172a',
              gridTemplateColumns: '1.45fr repeat(8, 1fr) 1.45fr',
              gridTemplateRows: '1.45fr repeat(8, 1fr) 1.45fr'
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
                ? `linear-gradient(180deg, ${owner.tokenColor}25 0%, #ffffff 40%, #f8fafc 70%, ${owner.tokenColor}35 100%)`
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
                ? '3.5px solid #fbbf24'
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
                  className={`iso-tile rounded-sm sm:rounded-md overflow-hidden flex flex-col justify-between relative shadow-sm ${
                    isLandingTarget ? 'animate-[landingPulse_1.2s_ease-in-out_infinite] z-20' : isInspected ? 'iso-tile-selected z-15' : 'z-0'
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
                        <span className="text-[7.5px] sm:text-[9px] font-black text-white truncate max-w-[48px] leading-none uppercase drop-shadow">
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
                            boxShadow: `0 1px 4px ${groupConf.glow}`
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
                          className={`text-[9.5px] sm:text-[11px] font-black tracking-wider leading-tight text-center ${
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
                                ? 'text-[8.5px] sm:text-[10px] text-amber-950 font-black'
                                : isResort
                                ? 'text-[9px] sm:text-[10.5px] text-violet-950 font-black'
                                : 'text-[8.5px] sm:text-[10px] text-slate-900'
                            }`}
                          >
                            {tile.name}
                          </span>
                        </div>

                        {owner && (tile.type === 'property' || isStation) ? (
                          <span className="text-[7.5px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 bg-rose-600 text-white shadow-sm border border-rose-300 flex items-center gap-0.5">
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
                            className={`text-[7.5px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 shadow-sm ${
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
                            className="text-[7.5px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 bg-rose-600 text-white shadow-sm"
                          >
                            -{tile.taxAmount}Đ
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {owner && !isStation && !isCorner && render3DBuildingModel(buildLevel, owner.tokenColor)}
                </div>
              );
            })}

            <div
              className="col-start-2 col-end-10 row-start-2 row-end-10 rounded-xl relative z-10 flex flex-col overflow-hidden select-none pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, #15803d 0%, #166534 38%, #14532d 72%, #052e16 100%)',
                border: '3.5px solid #f59e0b',
                boxShadow: `
                  inset 0 0 65px rgba(5,46,22,0.95),
                  inset 0 2px 0 rgba(254,240,138,0.5),
                  0 0 35px rgba(21,128,61,0.4)
                `
              }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 65%),
                    repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0,0,0,0.12) 15px, rgba(0,0,0,0.12) 16px)
                  `
                }}
              />

              <div
                className="absolute top-5 left-5 flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-amber-400/80 shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)'
                }}
              >
                <span className="text-3xl">🎴</span>
                <span className="text-[10px] font-black text-amber-300 mt-1 tracking-wider">CƠ HỘI</span>
              </div>

              <div
                className="absolute bottom-5 right-5 flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-purple-400/80 shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)'
                }}
              >
                <span className="text-3xl">🎁</span>
                <span className="text-[10px] font-black text-purple-300 mt-1 tracking-wider">KHÍ VẬN</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-amber-300/30 flex flex-col items-center justify-center opacity-30 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(254,240,138,0.15) 0%, transparent 70%)',
                    boxShadow: '0 0 35px rgba(245,158,11,0.25)'
                  }}
                >
                  <span className="text-5xl sm:text-6xl drop-shadow-xl">👑</span>
                  <span
                    className="text-[12px] sm:text-[14px] font-black tracking-widest text-amber-200 mt-1 uppercase"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
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
                if (siblingIndex === 0) { offsetX = -14; offsetY = -10; }
                else if (siblingIndex === 1) { offsetX = 14; offsetY = -10; }
                else { offsetX = 0; offsetY = 12; }
              } else if (totalSiblings >= 4) {
                if (siblingIndex === 0) { offsetX = -14; offsetY = -12; }
                else if (siblingIndex === 1) { offsetX = 14; offsetY = -12; }
                else if (siblingIndex === 2) { offsetX = -14; offsetY = 12; }
                else { offsetX = 14; offsetY = 12; }
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
                  <div
                    className={`relative flex flex-col items-center ${isHopping ? 'pawn-hopping-3d' : ''}`}
                    style={
                      !isHopping
                        ? {
                            transform: 'translate(-50%, -50%) rotateZ(45deg) rotateX(-54deg)',
                            transformOrigin: 'bottom center'
                          }
                        : {
                            transformOrigin: 'bottom center'
                          }
                    }
                  >
                    <div
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden flex items-center justify-center relative shadow-[0_8px_20px_rgba(0,0,0,0.85)] border-[3px] bg-slate-950 transition-transform duration-150"
                      style={{
                        borderColor: player.tokenColor,
                        boxShadow: isTurn
                          ? `0 0 22px ${player.tokenColor}, 0 0 32px rgba(245,158,11,0.95), 0 10px 22px rgba(0,0,0,0.9)`
                          : `0 0 14px ${player.tokenColor}aa, 0 8px 16px rgba(0,0,0,0.75)`
                      }}
                    >
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg sm:text-xl">{player.tokenEmoji}</span>
                      )}

                      {isTurn && (
                        <div
                          className="absolute top-0 right-0 w-4 h-4 rounded-full animate-ping"
                          style={{ background: '#fbbf24' }}
                        />
                      )}
                    </div>

                    <div
                      className="px-2.5 py-0.5 rounded-full mt-1 leading-none shadow-lg max-w-[75px] truncate text-center flex items-center gap-1 border border-white/50"
                      style={{
                        background: player.tokenColor,
                        color: '#ffffff'
                      }}
                    >
                      <span className="text-[8.5px] sm:text-[9.5px] font-black truncate leading-none uppercase drop-shadow">
                        {player.username}
                      </span>
                    </div>

                    <div
                      className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[7px] -mt-[1px] shadow-sm"
                      style={{ borderTopColor: player.tokenColor }}
                    />

                    <div
                      className="w-8 h-2.5 rounded-full mt-0.5 blur-[1px] transition-transform duration-200"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 75%)',
                        transform: isHopping ? 'scale(0.6)' : 'scale(1)'
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
