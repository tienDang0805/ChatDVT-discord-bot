import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { GameState, TileDef, PlayerState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
import { BOARD_SIZE } from '../../game/constants';

interface MonopolyBoardProps {
  gameState: GameState;
  myPlayerId: string;
  onTileClick?: (tile: TileDef) => void;
  centerOverlay?: React.ReactNode;
}

const GROUP_COLORS: Record<string, string> = {
  green: '#10b981',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  red: '#ef4444'
};

interface TileRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export const MonopolyBoard: React.FC<MonopolyBoardProps> = ({
  gameState,
  myPlayerId,
  onTileClick,
  centerOverlay
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardDimension, setBoardDimension] = useState(700);
  const [inspectedTile, setInspectedTile] = useState<TileDef | null>(null);
  const animPosRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const size = Math.min(width, 760);
        setBoardDimension(Math.max(size, 340));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTileRects = useCallback((size: number): TileRect[] => {
    const cornerSize = size * 0.16;
    const regularCount = 6;
    const regularWidth = (size - 2 * cornerSize) / regularCount;
    const tileHeight = cornerSize;
    const rects: TileRect[] = new Array(BOARD_SIZE);

    rects[0] = { x: size - cornerSize, y: size - cornerSize, width: cornerSize, height: cornerSize, rotation: 0 };

    for (let i = 1; i <= 6; i++) {
      rects[i] = {
        x: size - cornerSize - i * regularWidth,
        y: size - tileHeight,
        width: regularWidth,
        height: tileHeight,
        rotation: 0
      };
    }

    rects[7] = { x: 0, y: size - cornerSize, width: cornerSize, height: cornerSize, rotation: 90 };

    for (let i = 1; i <= 6; i++) {
      rects[7 + i] = {
        x: 0,
        y: size - cornerSize - i * regularWidth,
        width: tileHeight,
        height: regularWidth,
        rotation: 90
      };
    }

    rects[14] = { x: 0, y: 0, width: cornerSize, height: cornerSize, rotation: 180 };

    for (let i = 1; i <= 6; i++) {
      rects[14 + i] = {
        x: cornerSize + (i - 1) * regularWidth,
        y: 0,
        width: regularWidth,
        height: tileHeight,
        rotation: 180
      };
    }

    rects[21] = { x: size - cornerSize, y: 0, width: cornerSize, height: cornerSize, rotation: 270 };

    for (let i = 1; i <= 6; i++) {
      rects[21 + i] = {
        x: size - tileHeight,
        y: cornerSize + (i - 1) * regularWidth,
        width: tileHeight,
        height: regularWidth,
        rotation: 270
      };
    }

    return rects;
  }, []);

  const getTileCenter = useCallback((rect: TileRect): [number, number] => {
    return [rect.x + rect.width / 2, rect.y + rect.height / 2];
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = boardDimension;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const tileRects = getTileRects(size);

    gameState.players.forEach(p => {
      if (animPosRef.current[p.id] === undefined) {
        animPosRef.current[p.id] = p.position;
      }
    });

    const render = () => {
      gameState.players.forEach(p => {
        const current = animPosRef.current[p.id] ?? p.position;
        const target = p.position;
        let diff = target - current;
        if (diff < -BOARD_SIZE / 2) diff += BOARD_SIZE;
        if (diff > BOARD_SIZE / 2) diff -= BOARD_SIZE;

        if (Math.abs(diff) > 0.02) {
          animPosRef.current[p.id] = (current + diff * 0.15) % BOARD_SIZE;
          if (animPosRef.current[p.id] < 0) animPosRef.current[p.id] += BOARD_SIZE;
        } else {
          animPosRef.current[p.id] = target;
        }
      });

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, size, size);

      const cornerSize = size * 0.16;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cornerSize, cornerSize, size - 2 * cornerSize, size - 2 * cornerSize);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cornerSize, cornerSize, size - 2 * cornerSize, size - 2 * cornerSize);

      tileRects.forEach((rect, idx) => {
        const tile = BOARD_TILES[idx];
        if (!tile) return;

        const isInspected = inspectedTile?.index === idx;
        ctx.fillStyle = isInspected ? '#1e293b' : '#111827';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

        ctx.strokeStyle = isInspected ? '#f59e0b' : '#1f2937';
        ctx.lineWidth = isInspected ? 2 : 1;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        const owner = gameState.players.find(p => !p.isEliminated && p.properties.includes(idx));
        if (owner) {
          ctx.fillStyle = owner.tokenColor;
          if (idx <= 6) {
            ctx.fillRect(rect.x, rect.y, rect.width, 3);
          } else if (idx <= 13) {
            ctx.fillRect(rect.x + rect.width - 3, rect.y, 3, rect.height);
          } else if (idx <= 20) {
            ctx.fillRect(rect.x, rect.y + rect.height - 3, rect.width, 3);
          } else {
            ctx.fillRect(rect.x, rect.y, 3, rect.height);
          }
        }

        if (tile.group) {
          ctx.fillStyle = GROUP_COLORS[tile.group] || '#64748b';
          const headerDepth = Math.max(rect.height * 0.22, 10);
          if (idx <= 6) {
            ctx.fillRect(rect.x, rect.y, rect.width, headerDepth);
          } else if (idx <= 13) {
            ctx.fillRect(rect.x + rect.width - headerDepth, rect.y, headerDepth, rect.height);
          } else if (idx <= 20) {
            ctx.fillRect(rect.x, rect.y + rect.height - headerDepth, rect.width, headerDepth);
          } else {
            ctx.fillRect(rect.x, rect.y, headerDepth, rect.height);
          }
        }

        ctx.save();
        const [cx, cy] = getTileCenter(rect);
        ctx.translate(cx, cy);

        if (idx === 0) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏁', 0, -12);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('BẮT ĐẦU', 0, 6);
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('+200Đ', 0, 18);
        } else if (idx === 7) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔒', 0, -10);
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('Ở TÙ', 0, 8);
        } else if (idx === 14) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('☕', 0, -12);
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('CÀ PHÊ 8D', 0, 5);
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`${gameState.freeParkingPool}Đ`, 0, 18);
        } else if (idx === 21) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚔', 0, -10);
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('VÀO TÙ', 0, 8);
        } else {
          let textAngle = 0;
          if (idx > 0 && idx < 7) textAngle = 0;
          else if (idx > 7 && idx < 14) textAngle = Math.PI / 2;
          else if (idx > 14 && idx < 21) textAngle = Math.PI;
          else if (idx > 21 && idx < 28) textAngle = -Math.PI / 2;

          ctx.rotate(textAngle);

          ctx.fillStyle = '#e2e8f0';
          ctx.font = `bold ${Math.max(Math.floor(size * 0.014), 9)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const words = tile.name.split(' ');
          if (words.length > 2) {
            ctx.fillText(words.slice(0, 2).join(' '), 0, -12);
            ctx.fillText(words.slice(2).join(' '), 0, -2);
          } else {
            ctx.fillText(tile.name, 0, -8);
          }

          if (tile.price) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = `bold ${Math.max(Math.floor(size * 0.013), 8)}px sans-serif`;
            ctx.fillText(`${tile.price}Đ`, 0, 10);
          } else if (tile.type === 'tax') {
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText(`-${tile.taxAmount}Đ`, 0, 10);
          } else if (tile.type === 'chance' || tile.type === 'community') {
            ctx.fillStyle = '#a855f7';
            ctx.font = '12px sans-serif';
            ctx.fillText(tile.type === 'chance' ? '❓' : '👥', 0, 8);
          }

          if (owner) {
            const buildLevel = owner.buildings[idx] || 0;
            if (buildLevel > 0) {
              const bDef = BUILD_LEVELS[buildLevel];
              ctx.font = '10px sans-serif';
              ctx.fillText(bDef.icon, 0, 22);
            }
          }
        }

        ctx.restore();
      });

      const playersAtTile: Record<number, PlayerState[]> = {};
      gameState.players.forEach(p => {
        if (p.isEliminated) return;
        const posKey = Math.floor(animPosRef.current[p.id] ?? p.position);
        if (!playersAtTile[posKey]) playersAtTile[posKey] = [];
        playersAtTile[posKey].push(p);
      });

      gameState.players.forEach(p => {
        if (p.isEliminated) return;
        const currentFloatPos = animPosRef.current[p.id] ?? p.position;
        const baseIdx = Math.floor(currentFloatPos) % BOARD_SIZE;
        const nextIdx = (baseIdx + 1) % BOARD_SIZE;
        const fraction = currentFloatPos - Math.floor(currentFloatPos);

        const rectBase = tileRects[baseIdx];
        const rectNext = tileRects[nextIdx];
        if (!rectBase || !rectNext) return;

        const [cx1, cy1] = getTileCenter(rectBase);
        const [cx2, cy2] = getTileCenter(rectNext);

        let tokenX = cx1 + (cx2 - cx1) * fraction;
        let tokenY = cy1 + (cy2 - cy1) * fraction;

        const group = playersAtTile[baseIdx] || [];
        const pIndexInGroup = group.findIndex(pl => pl.id === p.id);
        if (group.length > 1 && fraction < 0.1) {
          const angle = (pIndexInGroup / group.length) * Math.PI * 2;
          const radius = Math.min(rectBase.width, rectBase.height) * 0.25;
          tokenX += Math.cos(angle) * radius;
          tokenY += Math.sin(angle) * radius;
        }

        ctx.save();
        ctx.shadowColor = p.tokenColor;
        ctx.shadowBlur = 10;

        ctx.fillStyle = p.tokenColor;
        ctx.beginPath();
        const tokenRadius = Math.max(size * 0.024, 13);
        ctx.arc(tokenX, tokenY, tokenRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = `${Math.floor(tokenRadius * 1.3)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.tokenEmoji, tokenX, tokenY + 1);

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, boardDimension, getTileRects, getTileCenter, inspectedTile]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (boardDimension / rect.width);
    const clickY = (e.clientY - rect.top) * (boardDimension / rect.height);

    const tileRects = getTileRects(boardDimension);
    for (let i = 0; i < tileRects.length; i++) {
      const tr = tileRects[i];
      if (clickX >= tr.x && clickX <= tr.x + tr.width && clickY >= tr.y && clickY <= tr.y + tr.height) {
        const clickedTile = BOARD_TILES[i];
        setInspectedTile(clickedTile);
        if (onTileClick) onTileClick(clickedTile);
        break;
      }
    }
  };

  const cornerPx = boardDimension * 0.16;

  return (
    <div ref={containerRef} className="relative flex items-center justify-center p-2 select-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="rounded-3xl shadow-2xl border border-slate-800 cursor-pointer"
      />

      <div
        className="absolute pointer-events-auto flex flex-col items-center justify-center"
        style={{
          width: `${boardDimension - 2 * cornerPx - 16}px`,
          height: `${boardDimension - 2 * cornerPx - 16}px`
        }}
      >
        {centerOverlay}
      </div>

      {inspectedTile && (
        <div className="absolute bottom-4 left-4 z-20 bg-[#131923]/95 border border-slate-700 p-3 rounded-xl shadow-xl max-w-xs text-xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-white text-sm">{inspectedTile.name}</span>
            <button
              onClick={() => setInspectedTile(null)}
              className="text-slate-400 hover:text-white text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-400 italic mb-2">{inspectedTile.flavor}</p>
          {inspectedTile.price && (
            <div className="flex justify-between text-slate-300">
              <span>Giá mua:</span>
              <span className="font-extrabold text-amber-400">{inspectedTile.price}Đ</span>
            </div>
          )}
          {inspectedTile.baseRent && (
            <div className="flex justify-between text-slate-300">
              <span>Thuê gốc:</span>
              <span className="font-extrabold text-amber-400">{inspectedTile.baseRent}Đ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
