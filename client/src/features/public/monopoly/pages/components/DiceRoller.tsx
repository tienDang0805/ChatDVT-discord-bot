import React, { useState, useEffect } from 'react';

interface DiceRollerProps {
  lastDice: [number, number];
  isMyTurn: boolean;
  canRoll: boolean;
  onRoll: () => void;
}

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
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

    let counter = 0;
    const interval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      counter++;
      if (counter >= 10) {
        clearInterval(interval);
        setIsRolling(false);
        onRoll();
      }
    }, 60);
  };

  const renderDie = (value: number) => {
    const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1];
    return (
      <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white to-slate-200 shadow-xl border border-slate-300 transform transition-transform duration-100 ${
        isRolling ? 'rotate-12 scale-105 animate-bounce' : 'hover:scale-105'
      }`}>
        {dots.map(([top, left], idx) => (
          <div
            key={idx}
            className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 shadow-inner -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${top}%`, left: `${left}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        {renderDie(displayDice[0])}
        {renderDie(displayDice[1])}
      </div>

      <div className="text-center">
        <div className="text-xs font-bold text-slate-400 mb-1">
          Tổng điểm: <span className="text-amber-400 font-extrabold text-sm">{displayDice[0] + displayDice[1]}</span>
          {displayDice[0] === displayDice[1] && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
              ĐÔI XÚC XẮC!
            </span>
          )}
        </div>

        <button
          onClick={handleRollClick}
          disabled={!canRoll || isRolling}
          className={`px-6 py-2.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 shadow-lg ${
            canRoll && !isRolling
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/30 hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
              : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed'
          }`}
        >
          {isRolling ? '🎲 Đang tung...' : isMyTurn ? '🎲 TUNG XÚC XẮC' : 'Chờ đối thủ tung'}
        </button>
      </div>
    </div>
  );
};
