import React, { useState, useMemo } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS, STATION_RENTS, getStationTiles } from '../../game/boardData';
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

function getBuildingVisual(level: number): React.ReactNode {
  if (level === 0) return null;
  if (level >= 4) {
    return (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="w-5 h-5 rounded-sm flex items-center justify-center text-xs"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
            boxShadow: '0 2px 0 #92400e, 0 3px 6px rgba(0,0,0,0.6), 0 0 10px rgba(245,158,11,0.6)',
            transform: 'perspective(60px) rotateX(10deg)'
          }}>⭐</div>
      </div>
    );
  }
  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex gap-[2px]">
      {Array.from({ length: level }).map((_, i) => (
        <div key={i} className="w-[6px] h-[8px] rounded-t-sm"
          style={{
            background: level === 3
              ? 'linear-gradient(to bottom, #fbbf24, #d97706)'
              : level === 2
              ? 'linear-gradient(to bottom, #34d399, #059669)'
              : 'linear-gradient(to bottom, #a3e635, #65a30d)',
            boxShadow: `0 2px 0 rgba(0,0,0,0.4), 0 0 4px ${level >= 3 ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.4)'}`
          }} />
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
  const currPlayer = gameState.players[gameState.currentPlayerIndex];
  const [activeTileIndex, setActiveTileIndex] = useState<number>(0);
  const [modalTile, setModalTile] = useState<TileDef | null>(null);

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

  const inspectedTile = BOARD_TILES[activeTileIndex] || BOARD_TILES[0];
  const inspectedOwner = getOwner(inspectedTile.index);
  const inspectedBuildLevel = inspectedOwner ? (inspectedOwner.buildings[inspectedTile.index] || 0) : 0;
  const cornerIndices = [0, 9, 18, 27];

  return (
    <div className="w-full h-full flex items-center justify-center select-none" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes tokenBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-14px) scale(1.15); }
          60% { transform: translateY(-4px) scale(1.05); }
        }
        @keyframes tileGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(245,158,11,0.3); }
          50% { box-shadow: 0 0 16px rgba(245,158,11,0.6); }
        }
        .board-tile {
          transition: transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.18s ease;
          transform-style: preserve-3d;
          cursor: pointer;
          position: relative;
        }
        .board-tile:hover {
          transform: translateY(-3px) scale(1.04);
          z-index: 25 !important;
        }
        .board-tile::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 2px;
          right: 2px;
          height: 4px;
          border-radius: 0 0 4px 4px;
          background: rgba(0,0,0,0.5);
          filter: blur(1px);
          z-index: -1;
        }
        .tile-active {
          animation: tileGlow 1.5s ease-in-out infinite;
        }
        .token-hop {
          animation: tokenBounce 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <div
        className="relative rounded-[20px] sm:rounded-[24px] transition-transform duration-500"
        style={{
          width: 'min(680px, calc(100vh - 100px), calc(100vw - 360px))',
          aspectRatio: '1',
          transform: 'rotateX(28deg) rotateZ(-0.5deg)',
          transformOrigin: 'center 65%',
          background: `
            linear-gradient(145deg, #4a3520 0%, #3b2918 15%, #2d1f10 30%, #261a0d 50%, #2d1f10 70%, #3b2918 85%, #4a3520 100%)
          `,
          boxShadow: `
            0 35px 70px rgba(0,0,0,0.95),
            0 10px 0 #3d2510,
            0 14px 0 #2d1a0a,
            0 18px 0 #1f1207,
            0 -2px 0 #6b4c2a,
            inset 0 0 30px rgba(0,0,0,0.5),
            0 0 60px rgba(139,69,19,0.15)
          `,
          borderTop: '3px solid #8b6938',
          borderLeft: '3px solid #7a5a2e',
          borderRight: '4px solid #5c3d1e',
          borderBottom: '6px solid #3d2510'
        }}
      >
        <div
          className="absolute inset-0 rounded-[20px] sm:rounded-[24px] pointer-events-none z-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(139,92,19,0.08) 14px, rgba(139,92,19,0.08) 15px),
              repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(0,0,0,0.05) 30px, rgba(0,0,0,0.05) 31px)
            `
          }}
        />

        <div className="absolute inset-[10px] sm:inset-[12px] rounded-[16px] overflow-hidden z-10"
          style={{
            border: '2px solid rgba(139,92,19,0.6)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.7)'
          }}
        >
          <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-[2px] p-[2px] rounded-[14px] relative"
            style={{ background: '#0a0f1a' }}
          >
            {BOARD_TILES.map((tile, idx) => {
              const pos = getTileGridPosition(idx);
              const isCorner = cornerIndices.includes(idx);
              const owner = getOwner(idx);
              const buildLevel = owner ? (owner.buildings[idx] || 0) : 0;
              const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;
              const playersHere = playersByTile[idx] || [];
              const hasHoppingPlayer = playersHere.some(p => p.id === animatingPlayerId);
              const isInspected = activeTileIndex === idx;
              const isStation = tile.type === 'station';
              const cornerData = isCorner ? CORNER_DATA[idx] : null;

              const tileBg = isCorner
                ? cornerData!.bg
                : owner
                ? `linear-gradient(180deg, ${owner.tokenColor}30 0%, #0d1520 100%)`
                : isStation
                ? 'linear-gradient(180deg, #1a2538 0%, #0f1a2a 100%)'
                : 'linear-gradient(180deg, #141e30 0%, #0c1320 100%)';

              const tileShadow = owner
                ? `0 3px 0 ${owner.tokenColor}40, 0 5px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`
                : isCorner
                ? '0 3px 0 rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 2px 0 rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)';

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveTileIndex(idx)}
                  onClick={() => {
                    setActiveTileIndex(idx);
                    if (onTileClick) onTileClick(tile);
                  }}
                  style={{
                    gridRow: pos.row,
                    gridColumn: pos.col,
                    background: tileBg,
                    boxShadow: hasHoppingPlayer
                      ? `0 0 18px rgba(245,158,11,0.8), ${tileShadow}`
                      : isInspected
                      ? `0 0 12px rgba(245,158,11,0.4), ${tileShadow}`
                      : tileShadow,
                    borderLeft: owner && !isCorner ? `2px solid ${owner.tokenColor}60` : undefined,
                    borderRight: owner && !isCorner ? `2px solid ${owner.tokenColor}30` : undefined,
                  }}
                  className={`board-tile rounded-md overflow-visible flex flex-col ${
                    hasHoppingPlayer ? 'z-30 scale-[1.05]' : isInspected ? 'tile-active z-20' : ''
                  }`}
                >
                  {groupColor && (
                    <div className="h-[5px] w-full shrink-0 rounded-t-md relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${groupColor.dark}, ${groupColor.main}, ${groupColor.light}, ${groupColor.main}, ${groupColor.dark})`,
                        boxShadow: `0 2px 4px ${groupColor.glow}, inset 0 -1px 0 ${groupColor.dark}`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-[2px]" />
                    </div>
                  )}

                  {isStation && !isCorner && (
                    <div className="h-[5px] w-full shrink-0 rounded-t-md"
                      style={{
                        background: 'linear-gradient(90deg, #64748b, #cbd5e1, #f1f5f9, #cbd5e1, #64748b)',
                        boxShadow: '0 2px 4px rgba(203,213,225,0.3), inset 0 -1px 0 #475569'
                      }}
                    />
                  )}

                  {owner && !isCorner && (
                    <div className="absolute top-0 right-0 z-20">
                      <div className="w-[14px] h-[14px] rounded-bl-md overflow-hidden flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${owner.tokenColor}, ${owner.tokenColor}cc)`,
                          boxShadow: `0 1px 3px rgba(0,0,0,0.5)`
                        }}>
                        {owner.avatar ? (
                          <img src={owner.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ fontSize: '7px' }}>{owner.tokenEmoji}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col items-center justify-center px-[2px] overflow-hidden pointer-events-none min-h-0">
                    {isCorner && cornerData ? (
                      <div className="flex flex-col items-center justify-center text-center gap-0.5 p-0.5">
                        <span className="text-base sm:text-lg drop-shadow-lg">{cornerData.icon}</span>
                        <span className="text-[7px] sm:text-[8px] font-black tracking-wider"
                          style={{
                            color: idx === 0 ? '#6ee7b7' : idx === 18 ? '#fcd34d' : idx === 27 ? '#fca5a5' : '#e2e8f0',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                          }}>
                          {cornerData.label}
                        </span>
                        <span className="text-[7px] font-extrabold px-1 py-[1px] rounded-sm"
                          style={{
                            background: 'rgba(0,0,0,0.5)',
                            color: idx === 0 ? '#34d399' : '#94a3b8'
                          }}>
                          {idx === 18 ? `${gameState.freeParkingPool}Đ` : cornerData.sub}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] sm:text-xs drop-shadow-md leading-none mt-[2px]">
                          {tile.stationIcon || '🏠'}
                        </span>
                        <div className="w-full text-center px-[1px] mt-[1px]">
                          <div className="text-[7px] sm:text-[8px] font-extrabold text-slate-100 truncate leading-none"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                            {tile.name.length > 8 ? tile.name.substring(0, 7) + '…' : tile.name}
                          </div>
                        </div>
                        {tile.price && (
                          <span className="text-[6px] sm:text-[7px] font-black mt-[1px] px-[4px] py-[1px] rounded-full"
                            style={{
                              background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                              color: '#1c1917',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                              textShadow: 'none'
                            }}>
                            {tile.price}Đ
                          </span>
                        )}
                        {tile.taxAmount && (
                          <span className="text-[6px] sm:text-[7px] font-black mt-[1px] px-[4px] py-[1px] rounded-full"
                            style={{
                              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                              color: '#fff',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.4)'
                            }}>
                            -{tile.taxAmount}Đ
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {getBuildingVisual(buildLevel)}

                  {playersHere.length > 0 && (
                    <div className="absolute inset-x-0 -bottom-2 flex items-center justify-center gap-[2px] z-40 pointer-events-none">
                      {playersHere.map(p => {
                        const isHopping = animatingPlayerId === p.id;
                        const isTurn = p.id === currPlayer?.id;
                        return (
                          <div key={p.id}
                            className={`relative flex flex-col items-center ${isHopping ? 'token-hop z-50' : 'z-40'}`}
                          >
                            <div className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] rounded-full overflow-hidden flex items-center justify-center"
                              style={{
                                border: `2px solid ${p.tokenColor}`,
                                background: '#0a0f1a',
                                boxShadow: isTurn
                                  ? `0 3px 8px rgba(0,0,0,0.8), 0 0 12px ${p.tokenColor}80, 0 0 20px rgba(245,158,11,0.4)`
                                  : `0 3px 8px rgba(0,0,0,0.8), 0 0 6px ${p.tokenColor}40`
                              }}>
                              {p.avatar ? (
                                <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[9px]">{p.tokenEmoji}</span>
                              )}
                            </div>
                            {isTurn && (
                              <div className="absolute -top-1 -right-1 w-[8px] h-[8px] rounded-full animate-ping"
                                style={{ background: '#fbbf24', boxShadow: '0 0 4px #fbbf24' }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="col-start-2 col-end-10 row-start-2 row-end-10 rounded-xl relative z-10 flex flex-col"
              style={{
                background: `
                  radial-gradient(ellipse at 40% 40%, #0d4a2e 0%, #0a3d25 30%, #073320 60%, #052a19 100%)
                `,
                border: '3px solid #8b6938',
                boxShadow: `
                  inset 0 0 40px rgba(0,0,0,0.8),
                  inset 0 2px 0 rgba(139,92,19,0.3),
                  0 -1px 0 rgba(139,92,19,0.4),
                  0 0 15px rgba(16,185,129,0.08)
                `
              }}
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
                    repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.03) 8px, rgba(0,0,0,0.03) 9px)
                  `
                }}
              />

              <div className="w-full shrink-0 flex items-center justify-between gap-2 px-2.5 py-2 rounded-t-xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
                  borderBottom: '1px solid rgba(139,92,19,0.3)'
                }}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span className="text-sm sm:text-base">{inspectedTile.stationIcon || '🏠'}</span>
                  <div className="truncate min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] font-black text-white truncate"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        {inspectedTile.name}
                      </span>
                      {inspectedTile.group && (
                        <span className="text-[7px] font-black px-1.5 py-[1px] rounded-full"
                          style={{
                            background: GROUP_COLORS[inspectedTile.group]?.main,
                            color: '#fff',
                            boxShadow: `0 1px 3px ${GROUP_COLORS[inspectedTile.group]?.glow}`
                          }}>
                          {inspectedTile.group.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-300 font-semibold truncate">
                      {inspectedOwner
                        ? `👑 ${inspectedOwner.username} • ${BUILD_LEVELS[inspectedBuildLevel]?.name || 'Đất trống'}`
                        : inspectedTile.price ? 'Chưa có chủ' : (inspectedTile.flavor || '')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {inspectedTile.price && (
                    <div className="text-right hidden sm:block">
                      <div className="text-[7px] uppercase font-bold text-slate-500">Giá</div>
                      <div className="text-[11px] font-black" style={{ color: '#fbbf24' }}>{inspectedTile.price}Đ</div>
                    </div>
                  )}
                  <button type="button"
                    onClick={() => setModalTile(inspectedTile)}
                    className="px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,19,0.4), rgba(139,92,19,0.2))',
                      border: '1px solid rgba(139,92,19,0.6)',
                      color: '#fbbf24',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >📖 Sổ Đỏ</button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center p-1.5 overflow-visible relative z-20">
                {centerOverlay}
              </div>

              <div className="w-full shrink-0 flex items-center justify-between text-[9px] sm:text-[10px] font-black px-2.5 py-1.5 rounded-b-xl"
                style={{
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
                  borderTop: '1px solid rgba(139,92,19,0.3)',
                  color: '#d4a855'
                }}
              >
                <span>👑 VÒNG {gameState.round}/{gameState.maxRounds}</span>
                <span>☕ Quỹ: {gameState.freeParkingPool}Đ</span>
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
