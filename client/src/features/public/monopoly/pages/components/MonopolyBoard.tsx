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
  green: { main: '#10b981', dark: '#065f46', light: '#6ee7b7', glow: 'rgba(16,185,129,0.5)' },
  blue: { main: '#3b82f6', dark: '#1e3a8a', light: '#93c5fd', glow: 'rgba(59,130,246,0.5)' },
  yellow: { main: '#f59e0b', dark: '#92400e', light: '#fcd34d', glow: 'rgba(245,158,11,0.5)' },
  red: { main: '#ef4444', dark: '#7f1d1d', light: '#fca5a5', glow: 'rgba(239,68,68,0.5)' },
  purple: { main: '#8b5cf6', dark: '#4c1d95', light: '#c4b5fd', glow: 'rgba(139,92,246,0.5)' }
};

const CORNER_DATA: Record<number, { icon: string; label: string; sub: string; bg: string }> = {
  0: { icon: '🏁', label: 'XUẤT PHÁT', sub: '+200Đ', bg: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)' },
  9: { icon: '🔒', label: 'TÙ', sub: 'GIAM GIỮ', bg: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)' },
  18: { icon: '☕', label: 'NGHỈ CHÂN', sub: 'QUỸ CHUNG', bg: 'linear-gradient(135deg, #b45309 0%, #92400e 50%, #78350f 100%)' },
  27: { icon: '🚔', label: 'VÀO TÙ', sub: 'ĐỪNG CHẠY', bg: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)' }
};

function renderBuildingVisual(level: number): React.ReactNode {
  if (level === 0) return null;
  if (level >= 4) {
    return (
      <div
        className="absolute -top-3 left-1/2 pointer-events-none z-30 flex flex-col items-center"
        style={{
          transform: 'translateX(-50%) rotateZ(45deg) rotateX(-60deg)',
          transformOrigin: 'bottom center'
        }}
      >
        <div
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-xs font-black shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #fef08a, #f59e0b, #b45309)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.8), 0 0 10px rgba(245,158,11,0.8)',
            border: '1px solid #fef08a'
          }}
        >
          ⭐
        </div>
        <div className="w-4 h-1.5 rounded-full bg-black/60 blur-[1px] -mt-0.5" />
      </div>
    );
  }
  return (
    <div
      className="absolute -top-2.5 left-1/2 pointer-events-none z-30 flex items-center justify-center gap-0.5"
      style={{
        transform: 'translateX(-50%) rotateZ(45deg) rotateX(-60deg)',
        transformOrigin: 'bottom center'
      }}
    >
      {Array.from({ length: level }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="w-2 sm:w-2.5 h-3 sm:h-3.5 rounded-t-sm"
            style={{
              background:
                level === 3
                  ? 'linear-gradient(to bottom, #fbbf24, #b45309)'
                  : level === 2
                  ? 'linear-gradient(to bottom, #34d399, #047857)'
                  : 'linear-gradient(to bottom, #a3e635, #4d7c0f)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.4)',
              border: '0.5px solid rgba(255,255,255,0.2)'
            }}
          />
          <div className="w-2.5 h-1 rounded-full bg-black/50 blur-[0.5px]" />
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
          0%, 100% { transform: rotateZ(45deg) rotateX(-60deg) translateY(0) scale(1); }
          40% { transform: rotateZ(45deg) rotateX(-60deg) translateY(-18px) scale(1.2); }
          70% { transform: rotateZ(45deg) rotateX(-60deg) translateY(-6px) scale(1.08); }
        }
        @keyframes tileHoverPulse {
          0%, 100% { box-shadow: inset 0 0 0 1.5px rgba(251,191,36,0.9), 0 0 15px rgba(245,158,11,0.5); }
          50% { box-shadow: inset 0 0 0 2px rgba(251,191,36,1), 0 0 24px rgba(245,158,11,0.85); }
        }
        .iso-tile {
          transform-style: preserve-3d;
          transition: transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.18s ease;
          cursor: pointer;
          position: relative;
        }
        .iso-tile:hover {
          transform: translateZ(8px) scale(1.04);
          z-index: 25 !important;
        }
        .iso-tile-active {
          animation: tileHoverPulse 1.6s ease-in-out infinite;
          transform: translateZ(10px) scale(1.05);
          z-index: 26 !important;
        }
        .token-hop-billboard {
          animation: boardTokenHop 0.32s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      <div
        className="relative transition-transform duration-500 rounded-3xl"
        style={{
          width: 'min(650px, calc(100vw - 360px), calc(84vh - 80px))',
          aspectRatio: '1',
          transform: 'rotateX(60deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, #3d2412 0%, #281609 50%, #170c04 100%)',
          border: '4px solid #5a3418',
          boxShadow: `
            0 2px 0 #42230d,
            0 4px 0 #3a1e0b,
            0 6px 0 #321909,
            0 8px 0 #2a1407,
            0 10px 0 #221005,
            0 12px 0 #1a0c04,
            0 14px 0 #120803,
            0 16px 0 #0c0502,
            0 22px 30px rgba(0,0,0,0.85),
            0 40px 70px rgba(0,0,0,0.95)
          `
        }}
      >
        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-amber-400/90 rounded-tl-lg pointer-events-none z-30" />
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-amber-400/90 rounded-tr-lg pointer-events-none z-30" />
        <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-amber-400/90 rounded-bl-lg pointer-events-none z-30" />
        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-amber-400/90 rounded-br-lg pointer-events-none z-30" />

        <div
          className="absolute inset-[8px] sm:inset-[10px] rounded-2xl overflow-hidden z-10"
          style={{
            border: '2px solid rgba(217, 119, 6, 0.4)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
          }}
        >
          <div
            className="w-full h-full grid grid-cols-10 grid-rows-10 gap-[2px] p-[2px] rounded-xl relative"
            style={{ background: '#0a0f18' }}
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
                ? `linear-gradient(180deg, ${owner.tokenColor}38 0%, #0e1724 100%)`
                : isStation
                ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(180deg, #182234 0%, #0c121e 100%)';

              const tileShadow = isCorner
                ? 'inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.6)'
                : owner
                ? `inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.7), 0 3px 6px rgba(0,0,0,0.6)`
                : 'inset 1px 1px 0 rgba(255,255,255,0.12), inset -1px -1px 0 rgba(0,0,0,0.6), 0 2px 5px rgba(0,0,0,0.5)';

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
                      ? `0 0 20px rgba(245,158,11,0.9), ${tileShadow}`
                      : tileShadow,
                    border: owner && !isCorner ? `2px solid ${owner.tokenColor}` : undefined
                  }}
                  className={`iso-tile rounded-md overflow-visible flex flex-col justify-between ${
                    hasHoppingPlayer ? 'z-30' : isInspected ? 'iso-tile-active z-20' : 'z-10'
                  }`}
                >
                  {groupColor && (
                    <div
                      className="h-[6px] w-full shrink-0 rounded-t-md relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${groupColor.dark}, ${groupColor.main}, ${groupColor.light}, ${groupColor.main}, ${groupColor.dark})`,
                        boxShadow: `0 1px 4px ${groupColor.glow}`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-[2px]" />
                    </div>
                  )}

                  {isStation && !isCorner && (
                    <div
                      className="h-[6px] w-full shrink-0 rounded-t-md relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(90deg, #475569, #94a3b8, #f8fafc, #94a3b8, #475569)',
                        boxShadow: '0 1px 4px rgba(148,163,184,0.4)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent h-[2px]" />
                    </div>
                  )}

                  {owner && !isCorner && (
                    <div className="absolute top-0 right-0 z-20">
                      <div
                        className="w-4 h-4 rounded-bl-md overflow-hidden flex items-center justify-center border-l border-b border-black/40"
                        style={{
                          background: `linear-gradient(135deg, ${owner.tokenColor}, #0f172a)`,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.7)'
                        }}
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
                        <span className="text-base sm:text-lg drop-shadow-md">{cornerData.icon}</span>
                        <span
                          className="text-[8px] sm:text-[9px] font-black tracking-wider leading-none"
                          style={{
                            color: idx === 0 ? '#6ee7b7' : idx === 18 ? '#fcd34d' : idx === 27 ? '#fca5a5' : '#e2e8f0',
                            textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                          }}
                        >
                          {cornerData.label}
                        </span>
                        <span
                          className="text-[7px] font-extrabold px-1 py-[1px] rounded-sm mt-0.5"
                          style={{
                            background: 'rgba(0,0,0,0.6)',
                            color: idx === 0 ? '#34d399' : '#cbd5e1'
                          }}
                        >
                          {idx === 18 ? `${gameState.freeParkingPool}Đ` : cornerData.sub}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs sm:text-sm drop-shadow leading-none mt-0.5">
                          {tile.stationIcon || '🏠'}
                        </span>
                        <div className="w-full text-center px-0.5 my-0.5 flex items-center justify-center">
                          <span
                            className="text-[8px] sm:text-[9px] font-black text-slate-100 text-center leading-tight break-words line-clamp-2"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                          >
                            {tile.name}
                          </span>
                        </div>
                        {tile.price && (
                          <span
                            className="text-[7px] sm:text-[8px] font-black px-1.5 py-[1px] rounded-full leading-none mb-0.5"
                            style={{
                              background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                              color: '#1c1917',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}
                          >
                            {tile.price}Đ
                          </span>
                        )}
                        {tile.taxAmount && (
                          <span
                            className="text-[7px] sm:text-[8px] font-black px-1.5 py-[1px] rounded-full leading-none mb-0.5"
                            style={{
                              background: 'linear-gradient(135deg, #ef4444, #991b1b)',
                              color: '#fff',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}
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
                                    transform: 'rotateZ(45deg) rotateX(-60deg)',
                                    transformOrigin: 'bottom center'
                                  }
                                : {
                                    transformOrigin: 'bottom center'
                                  }
                            }
                          >
                            <div
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center relative"
                              style={{
                                border: `2.5px solid ${p.tokenColor}`,
                                background: '#0a0f1a',
                                boxShadow: isTurn
                                  ? `0 4px 10px rgba(0,0,0,0.9), 0 0 14px ${p.tokenColor}, 0 0 20px rgba(245,158,11,0.6)`
                                  : `0 3px 8px rgba(0,0,0,0.8), 0 0 8px ${p.tokenColor}60`
                              }}
                            >
                              {p.avatar ? (
                                <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs">{p.tokenEmoji}</span>
                              )}
                              {isTurn && (
                                <div
                                  className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full animate-ping"
                                  style={{ background: '#fbbf24' }}
                                />
                              )}
                            </div>
                            <div
                              className="w-5 h-2 rounded-full mt-0.5"
                              style={{
                                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 80%)'
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
                background: 'radial-gradient(ellipse at center, #0e4b30 0%, #083420 50%, #052316 100%)',
                border: '3px solid #8b6938',
                boxShadow: `
                  inset 0 0 50px rgba(0,0,0,0.9),
                  inset 0 2px 0 rgba(217,119,6,0.4),
                  0 0 20px rgba(16,185,129,0.1)
                `
              }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 60%),
                    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.08) 10px, rgba(0,0,0,0.08) 11px)
                  `
                }}
              />

              <div
                className="absolute top-3 left-3 flex flex-col items-center justify-center p-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '1.5px solid rgba(245,158,11,0.5)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.7)',
                  transform: 'rotateZ(12deg)'
                }}
              >
                <span className="text-xl">🎴</span>
                <span className="text-[8px] font-black text-amber-300 mt-0.5">CƠ HỘI</span>
              </div>

              <div
                className="absolute bottom-3 right-3 flex flex-col items-center justify-center p-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '1.5px solid rgba(139,92,246,0.5)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.7)',
                  transform: 'rotateZ(-15deg)'
                }}
              >
                <span className="text-xl">🔮</span>
                <span className="text-[8px] font-black text-purple-300 mt-0.5">KHÍ VẬN</span>
              </div>

              <div
                className="absolute top-3 right-3 flex flex-col items-center p-1.5 rounded-md"
                style={{
                  background: 'linear-gradient(135deg, #065f46, #047857)',
                  border: '1px solid #34d399',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-8deg)'
                }}
              >
                <span className="text-xs font-black text-emerald-100">💵 500K</span>
              </div>

              <div
                className="absolute bottom-3 left-3 flex flex-col items-center p-1.5 rounded-md"
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                  border: '1px solid #60a5fa',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(10deg)'
                }}
              >
                <span className="text-xs font-black text-blue-100">💵 200K</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-400/40 flex flex-col items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)',
                    boxShadow: '0 0 25px rgba(245,158,11,0.2)'
                  }}
                >
                  <span className="text-2xl sm:text-3xl drop-shadow-md">👑</span>
                  <span
                    className="text-[9px] sm:text-[10px] font-black tracking-widest text-amber-300 mt-1"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
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
