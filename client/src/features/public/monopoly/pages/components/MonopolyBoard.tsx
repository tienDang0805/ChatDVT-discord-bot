import React, { useState } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
import { getDisplayedRent, getTilePrice } from '../../game/economy';
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
  7: { icon: '🔒', label: 'TÙ', sub: 'GIAM GIỮ', bg: 'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)' },
  14: { icon: '☕', label: 'CÀ PHÊ 8D', sub: 'NGHỈ CHÂN', bg: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)' },
  21: { icon: '🚔', label: 'VÀO TÙ', sub: 'CÔNG AN BẮT', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)' }
};

function getTileGridPosition(index: number): { row: number; col: number; side: 'bottom' | 'left' | 'top' | 'right' | 'corner' } {
  if (index === 0) return { row: 8, col: 8, side: 'corner' };
  if (index >= 1 && index <= 6) return { row: 8, col: 8 - index, side: 'bottom' };
  if (index === 7) return { row: 8, col: 1, side: 'corner' };
  if (index >= 8 && index <= 13) return { row: 8 - (index - 7), col: 1, side: 'left' };
  if (index === 14) return { row: 1, col: 1, side: 'corner' };
  if (index >= 15 && index <= 20) return { row: 1, col: 1 + (index - 14), side: 'top' };
  if (index === 21) return { row: 1, col: 8, side: 'corner' };
  if (index >= 22 && index <= 27) return { row: 1 + (index - 21), col: 8, side: 'right' };
  return { row: 8, col: 8, side: 'corner' };
}

function getTileCenterPercent(index: number): { x: number; y: number } {
  const colCenters = [6.90, 19.83, 31.90, 43.97, 56.03, 68.10, 80.17, 93.10];
  const rowCenters = [6.90, 19.83, 31.90, 43.97, 56.03, 68.10, 80.17, 93.10];
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
        transform: 'translate(-50%, -50%) rotateZ(45deg) rotateX(-50deg) translateY(-10px)',
        transformOrigin: 'bottom center'
      }}
    >
      <div className="relative flex flex-col items-center drop-shadow-[0_10px_16px_rgba(0,0,0,0.7)]">
        <div className="absolute -top-4 -right-2.5 flex items-start z-20">
          <div className="w-[2px] h-4.5 bg-amber-200 shadow-sm" />
          <div
            className="w-3.5 h-2.5 shadow-sm"
            style={{
              background: ownerColor,
              clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
            }}
          />
        </div>

        {level === 0 && (
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-400 flex items-center justify-center text-xs shadow-lg">
              🐶
            </div>
          </div>
        )}

        {level === 1 && (
          <div className="flex flex-col items-center">
            <div
              className="w-7 h-3.5 bg-gradient-to-r from-red-600 to-rose-700 shadow-md"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="w-6 h-5 bg-gradient-to-b from-amber-100 to-amber-200 border border-amber-900 flex items-center justify-center shadow-inner -mt-0.5">
              <div className="w-2 h-2.5 bg-amber-900 rounded-t-sm" />
            </div>
          </div>
        )}

        {level === 2 && (
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-4 bg-gradient-to-r from-sky-600 to-blue-700 shadow-md"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="w-7 h-7 bg-gradient-to-b from-sky-50 to-sky-200 border border-sky-950 flex flex-col items-center justify-between p-0.5 shadow-inner -mt-0.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-sky-900" />
                <div className="w-1.5 h-1.5 bg-sky-900" />
              </div>
              <div className="w-2.5 h-3 bg-amber-900 rounded-t-sm" />
            </div>
          </div>
        )}

        {level === 3 && (
          <div className="flex flex-col items-center">
            <div className="w-7 h-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-600 rounded-t-sm" />
            <div className="w-8 h-10 bg-gradient-to-b from-slate-100 via-amber-50 to-slate-200 border-2 border-amber-700 flex flex-col items-center justify-around py-1 shadow-xl -mt-0.5">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-amber-800" />
                <div className="w-1.5 h-1.5 bg-amber-800" />
              </div>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-amber-800" />
                <div className="w-1.5 h-1.5 bg-amber-800" />
              </div>
              <div className="w-3 h-3.5 bg-amber-950 rounded-t-sm" />
            </div>
          </div>
        )}

        {level === 4 && (
          <div className="flex flex-col items-center animate-pulse">
            <div className="text-lg leading-none -mb-1 drop-shadow-[0_0_10px_rgba(245,158,11,1)]">👑</div>
            <div
              className="w-10 h-5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 border border-amber-600 shadow-lg"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="w-9 h-12 bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-500 border-2 border-amber-800 flex flex-col items-center justify-between py-1 shadow-[0_0_20px_rgba(245,158,11,0.9)] -mt-0.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-amber-900 rounded-sm" />
                <div className="w-2 h-2 bg-amber-900 rounded-sm" />
              </div>
              <div className="w-3.5 h-5 bg-slate-950 rounded-t-sm border border-amber-300" />
            </div>
          </div>
        )}
      </div>

      <div className="w-9 h-2.5 rounded-full bg-black/55 blur-[1px] mt-0.5" />
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

  const cornerIndices = [0, 7, 14, 21];

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
          0%, 100% { transform: rotateZ(45deg) rotateX(-50deg) translateY(0) scale(1); }
          50% { transform: rotateZ(45deg) rotateX(-50deg) translateY(-24px) scale(1.2); }
        }
        @keyframes tileHoverGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.4)); }
          50% { filter: drop-shadow(0 0 14px rgba(245, 158, 11, 1)); }
        }
        @keyframes landingPulse {
          0%, 100% { box-shadow: inset 0 0 18px rgba(245, 158, 11, 0.7), 0 0 30px rgba(245, 158, 11, 0.95); }
          50% { box-shadow: inset 0 0 36px rgba(245, 158, 11, 1), 0 0 50px rgba(251, 191, 36, 1); }
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
        @keyframes criticalBurn {
          0%, 100% { filter: saturate(1) drop-shadow(0 0 3px rgba(239,68,68,0.7)); }
          50% { filter: saturate(1.35) drop-shadow(0 0 11px rgba(249,115,22,1)); }
        }
        .critical-burn {
          animation: criticalBurn 1.15s ease-in-out infinite;
        }
      `}</style>

      <div
        className="relative transition-transform duration-500 rounded-3xl"
        style={{
          width: 'min(820px, 70vw, calc((100vh - 60px) * 0.98))',
          height: 'min(820px, 70vw, calc((100vh - 60px) * 0.98))',
          aspectRatio: '1',
          transform: 'rotateX(44deg) rotateZ(-45deg) translateY(-1%) scale(1)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, #78350f 0%, #592506 30%, #3e1903 70%, #290f02 100%)',
          border: '9px solid #92400e',
          boxShadow: `
            0 4px 0 #592506,
            0 8px 0 #3e1903,
            0 12px 0 #290f02,
            0 16px 0 #180801,
            0 20px 0 #0d0400,
            0 30px 50px rgba(0,0,0,0.8),
            0 55px 100px rgba(0,0,0,0.92)
          `
        }}
      >
        <div
          className="absolute inset-[6px] rounded-2xl overflow-hidden z-10 border-2 border-amber-400/80 shadow-inner"
        >
          <div
            className="w-full h-full grid gap-[3px] p-[2px] rounded-xl relative"
            style={{
              background: '#0f172a',
              gridTemplateColumns: '1.6fr repeat(6, 1.4fr) 1.6fr',
              gridTemplateRows: '1.6fr repeat(6, 1.4fr) 1.6fr'
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
              const isResort = idx === 27;
              const cornerData = isCorner ? CORNER_DATA[idx] : null;

              const isLandingTarget = animatingPlayerId !== null && (visualPositions[animatingPlayerId] === idx);

              const tileBg = isCorner
                ? cornerData!.bg
                : owner && tile.type === 'property'
                ? `linear-gradient(180deg, ${owner.tokenColor}25 0%, #ffffff 45%, #f8fafc 100%)`
                : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)';

              const tileBorder = isLandingTarget
                ? '3px solid #fbbf24'
                : isCorner
                ? '2px solid #64748b'
                : owner
                ? `2.5px solid ${owner.tokenColor}`
                : '1.5px solid #cbd5e1';

              const tileIcon = tile.stationIcon || (isTax ? '🚨' : isChance ? '🎴' : isCommunity ? '🎁' : isResort ? '🏰' : null);
              const isSpecial = isStation || isTax || isChance || isCommunity || isResort;

              const headerGradient = isResort
                ? 'linear-gradient(90deg, #4c1d95, #7c3aed)'
                : isStation
                ? 'linear-gradient(90deg, #92400e, #d97706)'
                : isTax
                ? 'linear-gradient(90deg, #881337, #dc2626)'
                : isChance
                ? 'linear-gradient(90deg, #c2410c, #ea580c)'
                : isCommunity
                ? 'linear-gradient(90deg, #4338ca, #6366f1)'
                : groupConf
                ? groupConf.headerGradient
                : '#64748b';

              const riskLabel = tile.riskTier === 'critical' ? 'CRITICAL' : tile.riskTier === 'hot' ? 'HOT ZONE' : '';
              const headerTitle = isResort ? 'RESORT' : isStation ? 'TRẠM' : isTax ? 'PHẠT' : isChance ? 'CƠ HỘI' : isCommunity ? 'KHÍ VẬN' : riskLabel || groupConf?.name || '';

              const renderPriceBadge = (extraClass = '') => {
                if (owner && (tile.type === 'property' || isStation)) {
                  const rentAmount = getDisplayedRent(gameState, tile.index, buildLevel, owner.id);
                  return (
                    <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded-full leading-none bg-rose-600 text-white shadow-xs border border-rose-300 whitespace-nowrap ${extraClass}`}>
                      {rentAmount}Đ
                    </span>
                  );
                }
                if (tile.price) {
                  return (
                    <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded-full leading-none bg-amber-200 text-amber-950 border border-amber-400 shadow-xs whitespace-nowrap ${extraClass}`}>
                      {getTilePrice(gameState, tile.index)}Đ
                    </span>
                  );
                }
                if (tile.taxAmount) {
                  return (
                    <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded-full leading-none bg-rose-600 text-white shadow-xs whitespace-nowrap ${extraClass}`}>
                      -{gameState.economy.taxAmounts[tile.index] || tile.taxAmount}Đ
                    </span>
                  );
                }
                return null;
              };

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
                    cursor: 'pointer',
                    boxShadow: tile.riskTier === 'critical'
                      ? 'inset 0 0 0 2px rgba(239,68,68,0.65), 0 0 14px rgba(239,68,68,0.7)'
                      : tile.riskTier === 'hot'
                        ? 'inset 0 0 0 1px rgba(249,115,22,0.55), 0 0 8px rgba(249,115,22,0.45)'
                        : undefined
                  }}
                  className={`iso-tile rounded-md overflow-hidden relative shadow-sm ${tile.riskTier === 'critical' && buildLevel >= 3 ? 'critical-burn' : ''} ${
                    isLandingTarget ? 'animate-[landingPulse_1.2s_ease-in-out_infinite] z-20' : isInspected ? 'iso-tile-selected z-15' : 'z-0'
                  }`}
                >
                  {isCorner && cornerData ? (
                    <div className="flex flex-col items-center justify-center text-center gap-1 p-1 w-full h-full select-none">
                      <span className="text-xl sm:text-2xl drop-shadow">{cornerData.icon}</span>
                      <span
                        className={`text-[9.5px] sm:text-[10.5px] font-black tracking-wider leading-tight text-center ${
                          cornerData.textDark ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {cornerData.label}
                      </span>
                      <span
                        className={`text-[8px] sm:text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap ${
                          cornerData.textDark
                            ? 'bg-emerald-600 text-white'
                            : 'bg-black/75 text-amber-300'
                        }`}
                      >
                        {idx === 14 ? `${gameState.freeParkingPool}Đ` : idx === 0 ? `+${gameState.economy.goSalary}Đ` : cornerData.sub}
                      </span>
                    </div>
                  ) : pos.side === 'bottom' ? (
                    <div className="w-full h-full flex flex-col items-stretch justify-between p-0.5 select-none overflow-hidden">
                      <div
                        className="h-[13px] w-full shrink-0 flex items-center justify-center rounded-t-xs shadow-xs overflow-hidden"
                        style={{ background: owner ? `linear-gradient(90deg, ${owner.tokenColor}, #0f172a)` : headerGradient }}
                      >
                        <span className="text-[7px] font-black text-white uppercase tracking-wider truncate px-0.5">
                          {owner ? (isStation ? `${owner.username} • TRẠM` : `${owner.username} • Lv.${buildLevel}`) : headerTitle}
                        </span>
                      </div>
                      <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-0.5 py-0.5 min-h-0 overflow-hidden">
                        {isSpecial && <span className="text-[10px] leading-none mb-0.5 shrink-0">{tileIcon}</span>}
                        <span
                          className="font-black text-slate-900 leading-tight text-center max-w-full"
                          style={{
                            fontSize: tile.name.length <= 8 ? '8.5px' : tile.name.length <= 11 ? '8px' : '7.5px',
                            textShadow: '0 1px 2px rgba(255,255,255,0.95)',
                            wordBreak: 'keep-all',
                            whiteSpace: tile.name.length <= 10 ? 'nowrap' : 'normal'
                          }}
                        >
                          {tile.name}
                        </span>
                      </div>
                      <div className="shrink-0 pb-0.5 flex items-center justify-center">
                        {renderPriceBadge()}
                      </div>
                    </div>
                  ) : pos.side === 'top' ? (
                    <div className="w-full h-full flex flex-col items-stretch justify-between p-0.5 select-none overflow-hidden">
                      <div className="shrink-0 pt-0.5 flex items-center justify-center">
                        {renderPriceBadge()}
                      </div>
                      <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-0.5 py-0.5 min-h-0 overflow-hidden">
                        {isSpecial && <span className="text-[10px] leading-none mb-0.5 shrink-0">{tileIcon}</span>}
                        <span
                          className="font-black text-slate-900 leading-tight text-center max-w-full"
                          style={{
                            fontSize: tile.name.length <= 8 ? '8.5px' : tile.name.length <= 11 ? '8px' : '7.5px',
                            textShadow: '0 1px 2px rgba(255,255,255,0.95)',
                            wordBreak: 'keep-all',
                            whiteSpace: tile.name.length <= 10 ? 'nowrap' : 'normal'
                          }}
                        >
                          {tile.name}
                        </span>
                      </div>
                      <div
                        className="h-[13px] w-full shrink-0 flex items-center justify-center rounded-b-xs shadow-xs overflow-hidden"
                        style={{ background: owner ? `linear-gradient(90deg, ${owner.tokenColor}, #0f172a)` : headerGradient }}
                      >
                        <span className="text-[7px] font-black text-white uppercase tracking-wider truncate px-0.5">
                          {owner ? (isStation ? `${owner.username} • TRẠM` : `${owner.username} • Lv.${buildLevel}`) : headerTitle}
                        </span>
                      </div>
                    </div>
                  ) : pos.side === 'left' ? (
                    <div className="w-full h-full relative overflow-hidden select-none flex items-center justify-center">
                      <div
                        className="flex flex-col items-stretch justify-between p-0.5 select-none overflow-hidden absolute"
                        style={{
                          width: 'calc(100% * 14 / 16)',
                          height: 'calc(100% * 16 / 14)',
                          transform: 'rotate(90deg)'
                        }}
                      >
                        <div
                          className="h-[13px] w-full shrink-0 flex items-center justify-center rounded-t-xs shadow-xs overflow-hidden"
                          style={{ background: owner ? `linear-gradient(90deg, ${owner.tokenColor}, #0f172a)` : headerGradient }}
                        >
                          <span className="text-[7px] font-black text-white uppercase tracking-wider truncate px-0.5">
                            {owner ? (isStation ? `${owner.username} • TRẠM` : `${owner.username} • Lv.${buildLevel}`) : headerTitle}
                          </span>
                        </div>
                        <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-0.5 py-0.5 min-h-0 overflow-hidden">
                          {isSpecial && <span className="text-[10px] leading-none mb-0.5 shrink-0">{tileIcon}</span>}
                          <span
                            className="font-black text-slate-900 leading-tight text-center max-w-full"
                            style={{
                              fontSize: tile.name.length <= 8 ? '8.5px' : tile.name.length <= 11 ? '8px' : '7.5px',
                              textShadow: '0 1px 2px rgba(255,255,255,0.95)',
                              wordBreak: 'keep-all',
                              whiteSpace: tile.name.length <= 10 ? 'nowrap' : 'normal'
                            }}
                          >
                            {tile.name}
                          </span>
                          {owner && (
                            <span className="text-[7px] font-bold text-amber-800 leading-none mt-0.5 truncate max-w-full">
                              {owner.username} • {isStation ? 'TRẠM' : `Lv.${buildLevel}`}
                            </span>
                          )}
                        </div>
                        <div className="shrink-0 pb-0.5 flex items-center justify-center">
                          {renderPriceBadge()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative overflow-hidden select-none flex items-center justify-center">
                      <div
                        className="flex flex-col items-stretch justify-between p-0.5 select-none overflow-hidden absolute"
                        style={{
                          width: 'calc(100% * 14 / 16)',
                          height: 'calc(100% * 16 / 14)',
                          transform: 'rotate(90deg)'
                        }}
                      >
                        <div className="shrink-0 pt-0.5 flex items-center justify-center">
                          {renderPriceBadge()}
                        </div>
                        <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-0.5 py-0.5 min-h-0 overflow-hidden">
                          {isSpecial && <span className="text-[10px] leading-none mb-0.5 shrink-0">{tileIcon}</span>}
                          <span
                            className="font-black text-slate-900 leading-tight text-center max-w-full"
                            style={{
                              fontSize: tile.name.length <= 8 ? '8.5px' : tile.name.length <= 11 ? '8px' : '7.5px',
                              textShadow: '0 1px 2px rgba(255,255,255,0.95)',
                              wordBreak: 'keep-all',
                              whiteSpace: tile.name.length <= 10 ? 'nowrap' : 'normal'
                            }}
                          >
                            {tile.name}
                          </span>
                          {owner && (
                            <span className="text-[7px] font-bold text-amber-800 leading-none mt-0.5 truncate max-w-full">
                              {owner.username} • {isStation ? 'TRẠM' : `Lv.${buildLevel}`}
                            </span>
                          )}
                        </div>
                        <div
                          className="h-[13px] w-full shrink-0 flex items-center justify-center rounded-b-xs shadow-xs overflow-hidden"
                          style={{ background: owner ? `linear-gradient(90deg, ${owner.tokenColor}, #0f172a)` : headerGradient }}
                        >
                          <span className="text-[7px] font-black text-white uppercase tracking-wider truncate px-0.5">
                            {owner ? (isStation ? `${owner.username} • TRẠM` : `${owner.username} • Lv.${buildLevel}`) : headerTitle}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {owner && !isStation && !isCorner && render3DBuildingModel(buildLevel, owner.tokenColor)}
                </div>
              );
            })}

            <div
              className="col-start-2 col-end-8 row-start-2 row-end-8 rounded-xl relative z-10 flex flex-col overflow-hidden select-none pointer-events-none"
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
                className="absolute top-4 left-4 flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-amber-400/80 shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)'
                }}
              >
                <span className="text-2xl">🎴</span>
                <span className="text-[9px] font-black text-amber-300 mt-0.5 tracking-wider">CƠ HỘI</span>
              </div>

              <div
                className="absolute bottom-4 right-4 flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-purple-400/80 shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)'
                }}
              >
                <span className="text-2xl">🎁</span>
                <span className="text-[9px] font-black text-purple-300 mt-0.5 tracking-wider">KHÍ VẬN</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-amber-300/30 flex flex-col items-center justify-center opacity-30 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(254,240,138,0.15) 0%, transparent 70%)',
                    boxShadow: '0 0 35px rgba(245,158,11,0.25)'
                  }}
                >
                  <span className="text-4xl sm:text-5xl drop-shadow-xl">👑</span>
                  <span
                    className="text-[11px] sm:text-[13px] font-black tracking-widest text-amber-200 mt-1 uppercase"
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
                            transform: 'rotateZ(45deg) rotateX(-50deg)',
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
