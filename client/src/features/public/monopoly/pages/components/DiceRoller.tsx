import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio';

interface DiceRollerProps {
  lastDice: [number, number];
  isMyTurn: boolean;
  canRoll: boolean;
  onRoll: () => void;
}

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[26, 26], [74, 26], [26, 50], [74, 50], [26, 74], [74, 74]],
};

export const DiceRoller: React.FC<DiceRollerProps> = ({
  lastDice,
  isMyTurn,
  canRoll,
  onRoll
}) => {
  const [displayDice, setDisplayDice] = useState<[number, number]>(lastDice);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    setDisplayDice(lastDice);
  }, [lastDice]);

  const handleRollClick = () => {
    if (!canRoll || isRolling) return;
    setIsRolling(true);
    sounds.playDiceRoll();

    let counter = 0;
    const interval = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDisplayDice([d1, d2]);
      counter++;
      if (counter >= 12) {
        clearInterval(interval);
        setIsRolling(false);
        onRoll();
      }
    }, 50);
  };

  const isDoubles = displayDice[0] === displayDice[1] && displayDice[0] > 0;

  const renderDie = (value: number, index: number) => {
    const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1];
    return (
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_-3px_6px_rgba(0,0,0,0.2)] border-2 border-slate-200/90 transform transition-all duration-150 ${
          isRolling
            ? index === 0
              ? 'rotate-[-20deg] scale-110 animate-bounce'
              : 'rotate-[20deg] scale-110 animate-bounce'
            : 'hover:scale-105 hover:-translate-y-1'
        }`}
      >
        {dots.map(([top, left], idx) => (
          <div
            key={idx}
            className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-slate-900 to-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${top}%`, left: `${left}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-2.5 select-none">
      <div className="flex items-center gap-4 py-1">
        {renderDie(displayDice[0], 0)}
        {renderDie(displayDice[1], 1)}
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
          <span>Tổng số nút:</span>
          <span className="text-amber-300 font-black text-base px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
            {displayDice[0] + displayDice[1]}
          </span>
          {isDoubles && (
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-lg animate-pulse">
              🎲 ĐÔI XÚC XẮC — ĐI TIẾP!
            </span>
          )}
        </div>

        <button
          onClick={handleRollClick}
          disabled={!canRoll || isRolling}
          className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-xl ${
            canRoll && !isRolling
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 cursor-pointer animate-pulse border border-amber-300/40'
              : 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed'
          }`}
        >
          {isRolling ? '🎲 Đang đổ xúc xắc...' : isMyTurn ? '🎲 TUNG XÚC XẮC (LƯỢT BẠN)' : 'Chờ đối thủ tung'}
        </button>
      </div>
    </div>
  );
};
export default DiceRoller;
