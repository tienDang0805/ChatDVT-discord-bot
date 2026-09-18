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
        className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-white via-slate-100 to-slate-200 shadow-[0_12px_24px_rgba(0,0,0,0.65),inset_0_-2px_4px_rgba(0,0,0,0.2)] border-2 border-slate-200 transform transition-all duration-150 ${
          isRolling
            ? index === 0
              ? 'rotate-[-20deg] scale-110 animate-bounce'
              : 'rotate-[20deg] scale-110 animate-bounce'
            : 'hover:scale-105'
        }`}
      >
        {dots.map(([top, left], idx) => (
          <div
            key={idx}
            className={`absolute rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] -translate-x-1/2 -translate-y-1/2 ${
              value === 1
                ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gradient-to-br from-red-500 to-rose-700'
                : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-br from-slate-900 to-black'
            }`}
            style={{ top: `${top}%`, left: `${left}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="flex items-center gap-3.5 py-1">
        {renderDie(displayDice[0], 0)}
        {renderDie(displayDice[1], 1)}
      </div>

      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950/75 border border-amber-400/40 shadow-lg text-amber-300 font-black text-xs backdrop-blur-[2px]">
            <span className="text-slate-300 font-medium text-[11px]">Tổng nút:</span>
            <span className="text-amber-300 font-black text-sm">{displayDice[0] + displayDice[1]}</span>
          </div>
          {isDoubles && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg animate-pulse border border-amber-200">
              🎲 NỔ ĐÔI — ĐI TIẾP!
            </span>
          )}
        </div>

        {isMyTurn && (
          <button
            onClick={handleRollClick}
            disabled={!canRoll || isRolling}
            className={`px-8 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-2xl ${
              canRoll && !isRolling
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-[0_5px_0_#9a3412,0_12px_24px_rgba(245,158,11,0.6)] hover:scale-105 active:translate-y-1 active:shadow-[0_1px_0_#9a3412] cursor-pointer animate-pulse border-2 border-amber-200'
                : 'bg-slate-900/80 text-slate-500 border border-slate-700/50 cursor-not-allowed shadow'
            }`}
          >
            {isRolling ? '🎲 Đang tung xúc xắc...' : '🎲 TUNG XÚC XẮC'}
          </button>
        )}
      </div>
    </div>
  );
};
export default DiceRoller;
