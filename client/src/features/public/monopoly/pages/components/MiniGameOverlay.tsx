import React, { useState, useEffect } from 'react';

interface MiniGameOverlayProps {
  onComplete: (rewardMoney: number) => void;
  worldScale: number;
}

export const MiniGameOverlay: React.FC<MiniGameOverlayProps> = ({ onComplete, worldScale }) => {
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      const earned = Math.round(Math.min(tapCount * 10, 250) * worldScale / 10) * 10;
      const timer = setTimeout(() => {
        onComplete(earned);
      }, 1500);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  const handleTap = () => {
    if (timeLeft > 0) {
      setTapCount(prev => prev + 1);
    }
  };

  const earned = Math.round(Math.min(tapCount * 10, 250) * worldScale / 10) * 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#1a2333] to-[#0f172a] border border-amber-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-scale-up">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
          ⚡ MINI-GAME: BẤM NHANH NHẬN TIỀN
        </div>

        <h3 className="text-xl font-black text-white">Chạm liên tục để gom tiền thưởng!</h3>

        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold">Thời gian</div>
            <div className="text-2xl font-black text-red-400">{timeLeft}s</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold">Số lần bấm</div>
            <div className="text-2xl font-black text-amber-400">{tapCount}</div>
          </div>
        </div>

        {!isFinished ? (
          <button
            onClick={handleTap}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white font-black text-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-90 transition-transform flex items-center justify-center select-none"
          >
            BẤM! 👆
          </button>
        ) : (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl animate-bounce">
            <div className="text-xs text-emerald-300 font-bold">Xong! Bạn nhận được:</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">+{earned}Đ</div>
          </div>
        )}
      </div>
    </div>
  );
};
