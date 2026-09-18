import React, { useState, useMemo } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
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

function getTileGridPosition(index: number): { row: number; col: number; side: 'bottom' | 'left' | 'top' | 'right' | 'corner' } {
  if (index === 0) return { row: 10, col: 10, side: 'corner' };
  if (index >= 1 && index <= 8) return { row: 10, col: 10 - index, side: 'bottom' };
  if (index === 9) return { row: 10, col: 1, side: 'corner' };
  if (index >= 10 && index <= 17) return { row: 10 - (index - 9), col: 1, side: 'left' };
  if (index === 18) return { row: 1, col: 1, side: 'corner' };
  if (index >= 19 && index <= 26) return { row: 1, col: 1 + (index - 18), side: 'top' };
  if (index === 27) return { row: 1, col: 10, side: 'corner' };
  if (index >= 28 && index <= 35) return { row: 1 + (index - 27), col: 10, side: 'right' };
  return { row: 1, col: 1, side: 'corner' };
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
    name: '🌿 NGOẠI THÀNH',
    headerGradient: 'linear-gradient(90deg, #047857, #10b981, #34d399, #10b981, #047857)',
    glow: 'rgba(16,185,129,0.7)',
    tintBg: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #dcfce7 100%)',
    border: '#4ade80',
    accent: '#15803d'
  },
  blue: {
    name: '🌊 VEN ĐÔ',
    headerGradient: 'linear-gradient(90deg, #0369a1, #0284c7, #38bdf8, #0284c7, #0369a1)',
    glow: 'rgba(2,132,199,0.7)',
    tintBg: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)',
    border: '#38bdf8',
    accent: '#0369a1'
  },
  yellow: {
    name: '👑 ĐẤT VÀNG',
    headerGradient: 'linear-gradient(90deg, #b45309, #f59e0b, #fde047, #f59e0b, #b45309)',
    glow: 'rgba(245,158,11,0.7)',
    tintBg: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%)',
    border: '#facc15',
    accent: '#b45309'
  },
  red: {
    name: '🔥 TÂY NGUYÊN',
    headerGradient: 'linear-gradient(90deg, #9f1239, #e11d48, #fb7185, #e11d48, #9f1239)',
    glow: 'rgba(225,29,72,0.7)',
    tintBg: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 50%, #ffe4e6 100%)',
    border: '#fb7185',
    accent: '#be123c'
  },
  purple: {
    name: '💎 CAO CẤP',
    headerGradient: 'linear-gradient(90deg, #5b21b6, #7c3aed, #c084fc, #7c3aed, #5b21b6)',
    glow: 'rgba(124,58,237,0.7)',
    tintBg: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 50%, #ede9fe 100%)',
    border: '#c084fc',
    accent: '#6d28d9'
  }
};

const CORNER_DATA: Record<number, { icon: string; label: string; sub: string; bg: string; textDark?: boolean }> = {
  0: { icon: '🏁', label: 'XUẤT PHÁT', sub: '+200Đ', bg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)', textDark: true },
  9: { icon: '🔒', label: 'TÙ', sub: 'GIAM GIỮ', bg: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)' },
  18: { icon: '☕', label: 'NGHỈ CHÂN', sub: 'QUỸ CHUNG', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)' },
  27: { icon: '🚔', label: 'VÀO TÙ', sub: 'ĐỪNG CHẠY', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)' }
};

function renderBuildingVisual(level: number, ownerColor?: string): React.ReactNode {
  const flagColor = ownerColor || '#f59e0b';

  if (level === 0) {
    return (
      <div
        className="absolute -top-3.5 left-1/2 pointer-events-none z-30 flex flex-col items-center"
        style={{
          transform: 'translateX(-50%) rotateZ(45deg) rotateX(-48deg)',
          transformOrigin: 'bottom center'
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-2.5 -right-2 flex items-start">
            <div className="w-[1.5px] h-3 bg-amber-900 shadow-sm" />
            <div
              className="w-2.5 h-1.5 shadow-sm"
              style={{
                background: flagColor,
                clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
              }}
            />
          </div>
          <div
            className="w-5 h-2 rounded-t-sm"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #991b1b)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />
          <div
            className="w-4 h-3 rounded-b-sm flex items-center justify-center -mt-0.5 border border-amber-950"
            style={{
              background: 'linear-gradient(to bottom, #d97706, #78350f)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
            }}
          >
            <span className="text-[8px] leading-none">🐶</span>
          </div>
        </div>
        <div className="w-5 h-1 rounded-full bg-black/60 blur-[0.8px] mt-0.5" />
      </div>
    );
  }

  if (level === 1) {
    return (
      <div
        className="absolute -top-4 left-1/2 pointer-events-none z-30 flex flex-col items-center"
        style={{
          transform: 'translateX(-50%) rotateZ(45deg) rotateX(-48deg)',
          transformOrigin: 'bottom center'
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-3 -right-2 flex items-start">
            <div className="w-[1.5px] h-3.5 bg-amber-300 shadow-sm" />
            <div
              className="w-3 h-2 shadow-sm"
              style={{
                background: flagColor,
                clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
              }}
            />
          </div>
          <div
            className="w-6 h-3 rounded-t-sm"
            style={{
              background: 'linear-gradient(135deg, #f97316, #c2410c)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.55)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />
          <div
            className="w-5 h-3.5 rounded-b-sm flex items-center justify-center -mt-0.5 border border-amber-300"
            style={{
              background: 'linear-gradient(to bottom, #fef3c7, #fde68a)',
              boxShadow: '0 3px 6px rgba(0,0,0,0.5)'
            }}
          >
            <div className="w-2 h-2 rounded-sm bg-sky-600 border border-white shadow-inner" />
          </div>
        </div>
        <div className="w-6 h-1.5 rounded-full bg-black/60 blur-[0.8px] mt-0.5" />
      </div>
    );
  }

  if (level === 2) {
    return (
      <div
        className="absolute -top-5 left-1/2 pointer-events-none z-30 flex flex-col items-center"
        style={{
          transform: 'translateX(-50%) rotateZ(45deg) rotateX(-48deg)',
          transformOrigin: 'bottom center'
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-3.5 -right-2.5 flex items-start">
            <div className="w-[1.5px] h-4 bg-slate-300 shadow-sm" />
            <div
              className="w-3.5 h-2 shadow-sm"
              style={{
                background: flagColor,
                clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
              }}
            />
          </div>
          <div
            className="w-7 h-2.5 rounded-t-sm"
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.6)'
            }}
          />
          <div
            className="w-6 h-5 rounded-b-sm flex flex-col items-center justify-between p-0.5 border border-slate-300"
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #e2e8f0)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.55)'
            }}
          >
            <div className="flex gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-sm bg-sky-500 border border-white shadow-inner" />
              <div className="w-1.5 h-1.5 rounded-sm bg-sky-500 border border-white shadow-inner" />
            </div>
            <div className="w-2.5 h-2 rounded-t-sm bg-amber-700 border border-white/70" />
          </div>
        </div>
        <div className="w-7 h-1.5 rounded-full bg-black/65 blur-[1px] mt-0.5" />
      </div>
    );
  }

  if (level === 3) {
    return (
      <div
        className="absolute -top-6 left-1/2 pointer-events-none z-30 flex flex-col items-center"
        style={{
          transform: 'translateX(-50%) rotateZ(45deg) rotateX(-48deg)',
          transformOrigin: 'bottom center'
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-4 -right-3 flex items-start">
            <div className="w-0.5 h-4.5 bg-amber-400 shadow-sm" />
            <div
              className="w-4 h-2.5 shadow-sm"
              style={{
                background: flagColor,
                clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
              }}
            />
          </div>
          <div
            className="w-8 h-3 rounded-t-md"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #b45309)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.65)'
            }}
          />
          <div
            className="w-7 h-6 rounded-b-sm flex flex-col items-center justify-between p-0.5 border border-amber-300"
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #fef3c7)',
              boxShadow: '0 5px 10px rgba(0,0,0,0.6), 0 0 10px rgba(245,158,11,0.5)'
            }}
          >
            <div className="flex gap-1 mt-0.5">
              <div className="w-2 h-1.5 rounded-sm bg-amber-400 border border-white shadow-inner" />
              <div className="w-2 h-1.5 rounded-sm bg-amber-400 border border-white shadow-inner" />
            </div>
            <div className="flex gap-1 mb-0.5">
              <div className="w-2 h-1.5 rounded-sm bg-sky-500 border border-white shadow-inner" />
              <div className="w-2 h-1.5 rounded-sm bg-sky-500 border border-white shadow-inner" />
            </div>
          </div>
        </div>
        <div className="w-8 h-2 rounded-full bg-black/70 blur-[1px] mt-0.5" />
      </div>
    );
  }

  return (
    <div
      className="absolute -top-8 left-1/2 pointer-events-none z-30 flex flex-col items-center"
      style={{
        transform: 'translateX(-50%) rotateZ(45deg) rotateX(-48deg)',
        transformOrigin: 'bottom center'
      }}
    >
      <div className="relative flex flex-col items-center animate-bounce-subtle">
        <div className="absolute -top-4 -left-3 flex items-start">
          <div
            className="w-3.5 h-2.5 shadow-sm"
            style={{
              background: flagColor,
              clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)'
            }}
          />
          <div className="w-0.5 h-5 bg-amber-300 shadow-sm" />
        </div>
        <div className="absolute -top-4 -right-3 flex items-start">
          <div className="w-0.5 h-5 bg-amber-300 shadow-sm" />
          <div
            className="w-3.5 h-2.5 shadow-sm"
            style={{
              background: flagColor,
              clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
            }}
          />
        </div>
        <div
          className="w-8 h-4 rounded-t-full flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, #fef08a, #f59e0b, #b45309)',
            boxShadow: '0 0 16px rgba(245,158,11,1)'
          }}
        >
          👑
        </div>
        <div
          className="w-9 h-7 rounded-md flex flex-col items-center justify-between p-0.5 border-2 border-white -mt-0.5"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #92400e 100%)',
            boxShadow: '0 6px 14px rgba(0,0,0,0.75), 0 0 20px rgba(245,158,11,0.95)'
          }}
        >
          <div className="text-[8px] font-black text-white tracking-widest leading-none mt-0.5 drop-shadow">
            MAX
          </div>
          <div className="flex gap-1.5 mb-0.5">
            <div className="w-2 h-2 rounded-sm bg-amber-200 border border-white shadow-inner" />
            <div className="w-2 h-2 rounded-sm bg-amber-200 border border-white shadow-inner" />
          </div>
        </div>
      </div>
      <div className="w-10 h-2.5 rounded-full bg-black/75 blur-[1.2px] mt-0.5" />
    </div>
  );
}

export const MonopolyBoard: React.FC<MonopolyBoardProps> = ({
  gameState,
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

  const playersByTile = useMemo(() => {
    const map: Record<number, PlayerState[]> = {};
    gameState.players.forEach(p => {
      if (p.isEliminated) return;
      const tilePos = visualPositions[p.id] !== undefined ? visualPositions[p.id] : p.position;
      if (!map[tilePos]) map[tilePos] = [];
      map[tilePos].push(p);
    });
    return map;
  }, [gameState.players, visualPositions]);

  const getOwner = (tileIndex: number) => {
    return gameState.players.find(p => !p.isEliminated && p.properties.includes(tileIndex));
  };

  const cornerIndices = [0, 9, 18, 27];

  return (
    <div
      className="w-full h-full flex items-center justify-center select-none overflow-visible"
      style={{ perspective: '1200px', perspectiveOrigin: 'center center' }}
    >
      <style>{`
        @keyframes boardTokenHop {
          0%, 100% { transform: rotateZ(45deg) rotateX(-48deg) translateY(0) scale(1); }
          40% { transform: rotateZ(45deg) rotateX(-48deg) translateY(-22px) scale(1.25); }
          70% { transform: rotateZ(45deg) rotateX(-48deg) translateY(-8px) scale(1.1); }
        }
        @keyframes tileHoverPulse {
          0%, 100% { filter: drop-shadow(0 0 0px transparent); }
          50% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.9)); }
        }
        .iso-tile {
          transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
        }
        .iso-tile:hover {
          transform: translateZ(10px) scale(1.04);
          z-index: 25 !important;
        }
        .iso-tile-active {
          animation: tileHoverPulse 1.6s ease-in-out infinite;
          transform: translateZ(12px) scale(1.05);
          z-index: 26 !important;
        }
        .token-hop-billboard {
          animation: boardTokenHop 0.32s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      <div
        className="relative transition-transform duration-500 rounded-[30px]"
        style={{
          width: 'min(880px, calc((100vw - 40px) * 0.75), calc((100vh - 90px) * 1.25))',
          aspectRatio: '1',
          transform: 'rotateX(48deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, #92400e 0%, #78350f 30%, #5c2707 70%, #451a03 100%)',
          border: '8px solid #b45309',
          boxShadow: `
            0 3px 0 #78350f,
            0 6px 0 #5c2707,
            0 9px 0 #451a03,
            0 12px 0 #311302,
            0 15px 0 #1e0b01,
            0 25px 40px rgba(0,0,0,0.5),
            0 45px 80px rgba(0,0,0,0.7)
          `
        }}
      >
        <div
          className="absolute -top-2.5 -left-2.5 w-9 h-9 rounded-tl-2xl flex items-center justify-center pointer-events-none z-30 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0, #94a3b8)',
            border: '2.5px solid #f8fafc'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-inner" />
        </div>
        <div
          className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-tr-2xl flex items-center justify-center pointer-events-none z-30 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0, #94a3b8)',
            border: '2.5px solid #f8fafc'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-inner" />
        </div>
        <div
          className="absolute -bottom-2.5 -left-2.5 w-9 h-9 rounded-bl-2xl flex items-center justify-center pointer-events-none z-30 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0, #94a3b8)',
            border: '2.5px solid #f8fafc'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-inner" />
        </div>
        <div
          className="absolute -bottom-2.5 -right-2.5 w-9 h-9 rounded-br-2xl flex items-center justify-center pointer-events-none z-30 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0, #94a3b8)',
            border: '2.5px solid #f8fafc'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-inner" />
        </div>

        <div
          className="absolute inset-[8px] rounded-2xl overflow-hidden z-10"
          style={{
            border: '2.5px solid rgba(245, 158, 11, 0.8)',
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.6)'
          }}
        >
          <div
            className="w-full h-full grid grid-cols-10 grid-rows-10 gap-[2.5px] p-[2.5px] rounded-xl relative"
            style={{ background: '#cbd5e1' }}
          >
            {BOARD_TILES.map((tile, idx) => {
              const pos = getTileGridPosition(idx);
              const isCorner = cornerIndices.includes(idx);
              const owner = getOwner(idx);
              const buildLevel = owner ? (owner.buildings[idx] || 0) : 0;
              const groupConf = tile.group ? GROUP_CONFIG[tile.group] : null;
              const playersHere = playersByTile[idx] || [];
              const hasHoppingPlayer = playersHere.some(p => p.id === animatingPlayerId);
              const isInspected = activeIndex === idx;
              const isStation = tile.type === 'station';
              const isTax = tile.type === 'tax';
              const isChance = tile.type === 'chance';
              const isCommunity = tile.type === 'community';
              const isResort = idx === 35;
              const cornerData = isCorner ? CORNER_DATA[idx] : null;

              const tileBg = isCorner
                ? cornerData!.bg
                : owner && tile.type === 'property'
                ? `linear-gradient(180deg, ${owner.tokenColor}20 0%, #ffffff 40%, #f8fafc 70%, ${owner.tokenColor}30 100%)`
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

              const tileBorder = isCorner
                ? '1.5px solid #94a3b8'
                : owner
                ? `3px solid ${owner.tokenColor}`
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
                ? `1.5px solid ${groupConf.border}`
                : '1.5px solid #94a3b8';

              const tileShadow = isCorner
                ? 'inset 1px 1px 0 rgba(255,255,255,1), 0 2px 5px rgba(0,0,0,0.18)'
                : owner
                ? `0 0 16px ${owner.tokenColor}aa, inset 0 0 10px ${owner.tokenColor}30, 0 3px 8px rgba(0,0,0,0.3)`
                : isStation
                ? 'inset 0 0 8px rgba(245,158,11,0.35), 0 3px 6px rgba(0,0,0,0.22)'
                : isResort
                ? 'inset 0 0 10px rgba(139,92,246,0.35), 0 3px 6px rgba(0,0,0,0.25)'
                : 'inset 1px 1px 0 rgba(255,255,255,1), inset -1px -1px 0 rgba(148,163,184,0.3), 0 2px 5px rgba(0,0,0,0.18)';

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
                    boxShadow: hasHoppingPlayer
                      ? `0 0 24px rgba(245,158,11,1), ${tileShadow}`
                      : tileShadow,
                    border: tileBorder,
                    cursor: 'pointer'
                  }}
                  className={`iso-tile rounded-md overflow-visible flex flex-col justify-between ${
                    hasHoppingPlayer ? 'z-30' : isInspected ? 'iso-tile-active z-20' : 'z-10'
                  }`}
                >
                  {owner && !isCorner ? (
                    <div
                      className="h-[15px] w-full shrink-0 rounded-t-sm relative flex items-center justify-between px-1 overflow-hidden z-20 border-b border-white/40"
                      style={{
                        background: `linear-gradient(90deg, ${owner.tokenColor}, #0f172a 85%)`,
                        boxShadow: `0 1px 6px ${owner.tokenColor}`
                      }}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-white bg-slate-900 flex items-center justify-center shadow-sm">
                          {owner.avatar ? (
                            <img src={owner.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[7px]">{owner.tokenEmoji}</span>
                          )}
                        </div>
                        <span className="text-[7.5px] sm:text-[8px] font-black text-white truncate max-w-[46px] leading-none uppercase drop-shadow">
                          {owner.username}
                        </span>
                      </div>
                      <span className="text-[7px] font-black text-amber-300 shrink-0 leading-none">
                        {isStation ? 'TRẠM' : buildLevel === 4 ? '👑 MAX' : `Lv.${buildLevel}`}
                      </span>
                    </div>
                  ) : (
                    <>
                      {groupConf && !isResort && (
                        <div
                          className="h-[13px] w-full shrink-0 rounded-t-sm relative flex items-center justify-center overflow-hidden"
                          style={{
                            background: groupConf.headerGradient,
                            boxShadow: `0 1px 4px ${groupConf.glow}`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-[2px]" />
                          <span className="text-[7px] sm:text-[8px] font-black text-white tracking-widest uppercase leading-none drop-shadow-sm">
                            {groupConf.name}
                          </span>
                        </div>
                      )}

                      {isResort && (
                        <div
                          className="h-[14px] w-full shrink-0 rounded-t-sm relative flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #4c1d95, #7c3aed, #c084fc, #7c3aed, #4c1d95)',
                            boxShadow: '0 1px 5px rgba(124,58,237,0.7)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent h-[2px]" />
                          <span className="text-[7.5px] sm:text-[8.5px] font-black text-amber-200 tracking-wider uppercase leading-none drop-shadow">
                            👑 SIÊU RESORT 5⭐
                          </span>
                        </div>
                      )}

                      {isStation && (
                        <div
                          className="h-[14px] w-full shrink-0 rounded-t-sm relative flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #92400e, #d97706, #fbbf24, #d97706, #92400e)',
                            boxShadow: '0 1px 5px rgba(245,158,11,0.7)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent h-[2px]" />
                          <span className="text-[7.5px] sm:text-[8.5px] font-black text-slate-950 tracking-wider uppercase leading-none drop-shadow-sm">
                            ⭐ TRẠM ĐẶC BIỆT ⭐
                          </span>
                        </div>
                      )}

                      {isTax && (
                        <div
                          className="h-[13px] w-full shrink-0 rounded-t-sm relative flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #881337, #dc2626, #f87171, #dc2626, #881337)',
                            boxShadow: '0 1px 4px rgba(220,38,38,0.6)'
                          }}
                        >
                          <span className="text-[7.5px] font-black text-white tracking-wider uppercase leading-none">
                            🚨 NỘP PHẠT
                          </span>
                        </div>
                      )}

                      {isChance && (
                        <div
                          className="h-[13px] w-full shrink-0 rounded-t-sm relative flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #c2410c, #ea580c, #fdba74, #ea580c, #c2410c)',
                            boxShadow: '0 1px 4px rgba(234,88,12,0.6)'
                          }}
                        >
                          <span className="text-[7.5px] font-black text-white tracking-wider uppercase leading-none">
                            🎴 CƠ HỘI
                          </span>
                        </div>
                      )}

                      {isCommunity && (
                        <div
                          className="h-[13px] w-full shrink-0 rounded-t-sm relative flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #4338ca, #6366f1, #a5b4fc, #6366f1, #4338ca)',
                            boxShadow: '0 1px 4px rgba(99,102,241,0.6)'
                          }}
                        >
                          <span className="text-[7.5px] font-black text-white tracking-wider uppercase leading-none">
                            🎁 CỘNG ĐỒNG
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="w-full flex-1 flex flex-col items-center justify-center px-0.5 pointer-events-none min-h-0 overflow-visible">
                    {isCorner && cornerData ? (
                      <div className="flex flex-col items-center justify-center text-center gap-0.5 p-0.5">
                        <span className="text-xl drop-shadow">{cornerData.icon}</span>
                        <span
                          className={`text-[9px] sm:text-[10px] font-black tracking-wider leading-none ${
                            cornerData.textDark ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {cornerData.label}
                        </span>
                        <span
                          className={`text-[8px] font-black px-1.5 py-[1px] rounded-full mt-0.5 shadow-sm ${
                            cornerData.textDark
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black/70 text-amber-300'
                          }`}
                        >
                          {idx === 18 ? `${gameState.freeParkingPool}Đ` : cornerData.sub}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className={`drop-shadow-sm leading-none mt-0.5 ${isStation || isResort ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base'}`}>
                          {tile.stationIcon || (isTax ? '🚨' : isChance ? '🎴' : isCommunity ? '🎁' : isResort ? '🏰' : '🏠')}
                        </span>
                        <div className="w-full text-center px-0.5 my-0.5 flex items-center justify-center">
                          <span
                            className={`font-black text-center leading-tight break-words ${
                              isStation
                                ? 'text-[9px] sm:text-[10.5px] text-amber-950 font-black'
                                : isResort
                                ? 'text-[9.5px] sm:text-[11px] text-violet-950 font-black'
                                : 'text-[9px] sm:text-[10.5px] text-slate-900'
                            }`}
                          >
                            {tile.name}
                          </span>
                        </div>

                        {owner && !isStation && !isCorner && (
                          <div className="flex items-center justify-center my-0.5">
                            <span
                              className={`text-[7.5px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-md leading-none shadow-md border ${
                                buildLevel === 4
                                  ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-slate-950 border-white shadow-[0_0_12px_rgba(245,158,11,1)] animate-pulse'
                                  : buildLevel === 3
                                  ? 'bg-amber-600 text-amber-100 border-amber-300'
                                  : buildLevel === 2
                                  ? 'bg-sky-600 text-sky-100 border-sky-300'
                                  : buildLevel === 1
                                  ? 'bg-emerald-600 text-emerald-100 border-emerald-300'
                                  : 'bg-stone-800 text-stone-200 border-stone-500'
                              }`}
                            >
                              {buildLevel === 4
                                ? '👑 LANDMARK'
                                : buildLevel === 3
                                ? '⭐⭐⭐ CẤP 3'
                                : buildLevel === 2
                                ? '⭐⭐ CẤP 2'
                                : buildLevel === 1
                                ? '⭐ CẤP 1'
                                : '🐕 CẤP 0'}
                            </span>
                          </div>
                        )}

                        {owner && (tile.type === 'property' || isStation) ? (
                          <span className="text-[8px] sm:text-[9.5px] font-black px-2 py-0.5 rounded-full leading-none mb-0.5 bg-rose-600 text-white shadow-md border border-rose-300 flex items-center gap-0.5">
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
                            className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 shadow-sm ${
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
                            className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 bg-rose-600 text-white shadow-sm"
                          >
                            -{tile.taxAmount}Đ
                          </span>
                        )}
                        {isStation && !owner && (
                          <span className="text-[6.5px] sm:text-[7.5px] text-amber-800 font-extrabold leading-none">
                            4 Ô = Thắng
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {owner && !isStation && !isCorner && renderBuildingVisual(buildLevel, owner.tokenColor)}

                  {playersHere.length > 0 && (
                    <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 z-40 pointer-events-none">
                      {playersHere.map(p => {
                        const isHopping = animatingPlayerId === p.id;
                        const isTurn = p.id === currPlayer?.id;
                        return (
                          <div
                            key={p.id}
                            className={`relative flex flex-col items-center ${isHopping ? 'token-hop-billboard z-50' : 'z-40'}`}
                            style={
                              !isHopping
                                ? {
                                    transform: 'rotateZ(45deg) rotateX(-54deg)',
                                    transformOrigin: 'bottom center'
                                  }
                                : {
                                    transformOrigin: 'bottom center'
                                  }
                            }
                          >
                            <div
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex items-center justify-center relative shadow-lg"
                              style={{
                                border: `3px solid ${p.tokenColor}`,
                                background: '#0f172a',
                                boxShadow: isTurn
                                  ? `0 5px 14px rgba(0,0,0,0.8), 0 0 16px ${p.tokenColor}, 0 0 22px rgba(245,158,11,0.8)`
                                  : `0 4px 10px rgba(0,0,0,0.7), 0 0 10px ${p.tokenColor}70`
                              }}
                            >
                              {p.avatar ? (
                                <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm">{p.tokenEmoji}</span>
                              )}
                              {isTurn && (
                                <div
                                  className="absolute top-0 right-0 w-3 h-3 rounded-full animate-ping"
                                  style={{ background: '#fbbf24' }}
                                />
                              )}
                            </div>
                            <div
                              className="w-6 h-2.5 rounded-full mt-0.5"
                              style={{
                                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 80%)'
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div
              className="col-start-2 col-end-10 row-start-2 row-end-10 rounded-xl relative z-10 flex flex-col overflow-hidden select-none pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, #22c55e 0%, #16a34a 35%, #15803d 70%, #14532d 100%)',
                border: '3.5px solid #f59e0b',
                boxShadow: `
                  inset 0 0 55px rgba(20,83,45,0.8),
                  inset 0 2px 0 rgba(254,240,138,0.6),
                  0 0 30px rgba(34,197,94,0.3)
                `
              }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%),
                    repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(0,0,0,0.06) 14px, rgba(0,0,0,0.06) 15px)
                  `
                }}
              />

              <div
                className="absolute top-4 left-4 flex flex-col items-center justify-center p-2 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '2px solid rgba(245,158,11,0.8)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.7)',
                  transform: 'rotateZ(12deg)'
                }}
              >
                <span className="text-2xl">🎴</span>
                <span className="text-[9px] font-black text-amber-300 mt-0.5">CƠ HỘI</span>
              </div>

              <div
                className="absolute bottom-4 right-4 flex flex-col items-center justify-center p-2 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '2px solid rgba(139,92,246,0.8)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.7)',
                  transform: 'rotateZ(-15deg)'
                }}
              >
                <span className="text-2xl">🔮</span>
                <span className="text-[9px] font-black text-purple-300 mt-0.5">KHÍ VẬN</span>
              </div>

              <div
                className="absolute top-4 right-4 flex flex-col items-center p-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  border: '1.5px solid #6ee7b7',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-8deg)'
                }}
              >
                <span className="text-xs font-black text-emerald-100">💵 500K</span>
              </div>

              <div
                className="absolute bottom-4 left-4 flex flex-col items-center p-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: '1.5px solid #7dd3fc',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(10deg)'
                }}
              >
                <span className="text-xs font-black text-sky-100">💵 200K</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-amber-300/40 flex flex-col items-center justify-center opacity-40 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(254,240,138,0.2) 0%, transparent 70%)',
                    boxShadow: '0 0 25px rgba(245,158,11,0.2)'
                  }}
                >
                  <span className="text-3xl sm:text-4xl drop-shadow-lg">👑</span>
                  <span
                    className="text-[10px] sm:text-[11px] font-black tracking-widest text-amber-200 mt-1"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}
                  >
                    CỜ TỶ PHÚ 8D
                  </span>
                </div>
              </div>
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
export default MonopolyBoard;
