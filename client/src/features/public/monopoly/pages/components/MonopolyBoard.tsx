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

const GROUP_COLORS: Record<string, { main: string; dark: string; light: string; glow: string }> = {
  green: { main: '#10b981', dark: '#059669', light: '#a7f3d0', glow: 'rgba(16,185,129,0.6)' },
  blue: { main: '#0284c7', dark: '#0369a1', light: '#bae6fd', glow: 'rgba(2,132,199,0.6)' },
  yellow: { main: '#f59e0b', dark: '#d97706', light: '#fef3c7', glow: 'rgba(245,158,11,0.6)' },
  red: { main: '#e11d48', dark: '#be123c', light: '#fecdd3', glow: 'rgba(225,29,72,0.6)' },
  purple: { main: '#7c3aed', dark: '#6d28d9', light: '#ede9fe', glow: 'rgba(124,58,237,0.6)' }
};

const CORNER_DATA: Record<number, { icon: string; label: string; sub: string; bg: string; textDark?: boolean }> = {
  0: { icon: '🏁', label: 'XUẤT PHÁT', sub: '+200Đ', bg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)', textDark: true },
  9: { icon: '🔒', label: 'TÙ', sub: 'GIAM GIỮ', bg: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)' },
  18: { icon: '☕', label: 'NGHỈ CHÂN', sub: 'QUỸ CHUNG', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)' },
  27: { icon: '🚔', label: 'VÀO TÙ', sub: 'ĐỪNG CHẠY', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)' }
};

function renderBuildingVisual(level: number): React.ReactNode {
  if (level === 0) return null;
  if (level >= 4) {
    return (
      <div
        className="absolute -top-4 left-1/2 pointer-events-none z-30 flex flex-col items-center"
        style={{
          transform: 'translateX(-50%) rotateZ(45deg) rotateX(-54deg)',
          transformOrigin: 'bottom center'
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #fef08a, #f59e0b, #b45309)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.7), 0 0 16px rgba(245,158,11,0.9)',
            border: '2px solid #ffffff'
          }}
        >
          ⭐
        </div>
        <div className="w-5 h-2 rounded-full bg-black/60 blur-[1px] -mt-0.5" />
      </div>
    );
  }
  return (
    <div
      className="absolute -top-3 left-1/2 pointer-events-none z-30 flex items-center justify-center gap-0.5"
      style={{
        transform: 'translateX(-50%) rotateZ(45deg) rotateX(-54deg)',
        transformOrigin: 'bottom center'
      }}
    >
      {Array.from({ length: level }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="w-3 h-4 rounded-t-sm"
            style={{
              background:
                level === 3
                  ? 'linear-gradient(to bottom, #fbbf24, #b45309)'
                  : level === 2
                  ? 'linear-gradient(to bottom, #34d399, #047857)'
                  : 'linear-gradient(to bottom, #a3e635, #4d7c0f)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.7)',
              border: '0.5px solid rgba(0,0,0,0.15)'
            }}
          />
          <div className="w-2.5 h-1 rounded-full bg-black/40 blur-[0.5px]" />
        </div>
      ))}
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
          0%, 100% { transform: rotateZ(45deg) rotateX(-54deg) translateY(0) scale(1); }
          40% { transform: rotateZ(45deg) rotateX(-54deg) translateY(-22px) scale(1.25); }
          70% { transform: rotateZ(45deg) rotateX(-54deg) translateY(-8px) scale(1.1); }
        }
        @keyframes tileHoverPulse {
          0%, 100% { box-shadow: inset 0 0 0 2px rgba(245,158,11,0.95), 0 0 18px rgba(245,158,11,0.7); }
          50% { box-shadow: inset 0 0 0 3px rgba(245,158,11,1), 0 0 28px rgba(245,158,11,0.95); }
        }
        .iso-tile {
          transform-style: preserve-3d;
          transition: transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.18s ease;
          cursor: pointer;
          position: relative;
        }
        .iso-tile:hover {
          transform: translateZ(12px) scale(1.06);
          z-index: 25 !important;
        }
        .iso-tile-active {
          animation: tileHoverPulse 1.6s ease-in-out infinite;
          transform: translateZ(14px) scale(1.07);
          z-index: 26 !important;
        }
        .token-hop-billboard {
          animation: boardTokenHop 0.32s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      <div
        className="relative transition-transform duration-500 rounded-[30px]"
        style={{
          width: 'min(860px, calc((100vw - 40px) * 0.72), calc((100vh - 100px) * 1.2))',
          aspectRatio: '1',
          transform: 'rotateX(54deg) rotateZ(-45deg)',
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
              const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;
              const playersHere = playersByTile[idx] || [];
              const hasHoppingPlayer = playersHere.some(p => p.id === animatingPlayerId);
              const isInspected = activeIndex === idx;
              const isStation = tile.type === 'station';
              const cornerData = isCorner ? CORNER_DATA[idx] : null;

              const tileBg = isCorner
                ? cornerData!.bg
                : owner
                ? `linear-gradient(180deg, #ffffff 0%, ${owner.tokenColor}20 60%, #e2e8f0 100%)`
                : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)';

              const tileShadow = isCorner
                ? 'inset 1px 1px 0 rgba(255,255,255,1), inset -1px -1px 0 rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.2)'
                : owner
                ? `inset 1px 1px 0 rgba(255,255,255,1), inset -1px -1px 0 rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.25)`
                : 'inset 1px 1px 0 rgba(255,255,255,1), inset -1px -1px 0 rgba(148,163,184,0.35), 0 2px 5px rgba(0,0,0,0.18)';

              return (
                <div
                  key={idx}
                  onMouseEnter={() => {
                    setInternalTileIndex(idx);
                    if (onTileClick) onTileClick(tile);
                  }}
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
                    border: owner && !isCorner ? `2.5px solid ${owner.tokenColor}` : '1.5px solid #94a3b8'
                  }}
                  className={`iso-tile rounded-md overflow-visible flex flex-col justify-between ${
                    hasHoppingPlayer ? 'z-30' : isInspected ? 'iso-tile-active z-20' : 'z-10'
                  }`}
                >
                  {groupColor && (
                    <div
                      className="h-[7px] w-full shrink-0 rounded-t-sm relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${groupColor.dark}, ${groupColor.main}, ${groupColor.light}, ${groupColor.main}, ${groupColor.dark})`,
                        boxShadow: `0 1px 4px ${groupColor.glow}`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent h-[2px]" />
                    </div>
                  )}

                  {isStation && !isCorner && (
                    <div
                      className="h-[7px] w-full shrink-0 rounded-t-sm relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(90deg, #0284c7, #38bdf8, #e0f2fe, #38bdf8, #0284c7)',
                        boxShadow: '0 1px 4px rgba(2,132,199,0.5)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-transparent h-[2px]" />
                    </div>
                  )}

                  {owner && !isCorner && (
                    <div className="absolute top-0.5 right-0.5 z-20">
                      <div
                        className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center border border-white shadow-md"
                        style={{ background: owner.tokenColor }}
                      >
                        {owner.avatar ? (
                          <img src={owner.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ fontSize: '8px' }}>{owner.tokenEmoji}</span>
                        )}
                      </div>
                    </div>
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
                        <span className="text-sm sm:text-base drop-shadow-sm leading-none mt-0.5">
                          {tile.stationIcon || '🏠'}
                        </span>
                        <div className="w-full text-center px-0.5 my-0.5 flex items-center justify-center">
                          <span
                            className="text-[9.5px] sm:text-[11px] font-black text-slate-900 text-center leading-tight break-words"
                          >
                            {tile.name}
                          </span>
                        </div>
                        {tile.price && (
                          <span
                            className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 bg-amber-300 text-amber-950 border border-amber-400 shadow-sm"
                          >
                            {tile.price}Đ
                          </span>
                        )}
                        {tile.taxAmount && (
                          <span
                            className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none mb-0.5 bg-rose-600 text-white shadow-sm"
                          >
                            -{tile.taxAmount}Đ
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {renderBuildingVisual(buildLevel)}

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
