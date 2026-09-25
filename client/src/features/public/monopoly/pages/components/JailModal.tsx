import React from 'react';
import type { PlayerState, JailAction } from '../../game/types';
import { MAX_JAIL_TURNS } from '../../game/constants';

interface JailModalProps {
  player: PlayerState;
  isMyTurn: boolean;
  bailAmount: number;
  onAction: (action: JailAction) => void;
}

export const JailModal: React.FC<JailModalProps> = ({
  player,
  isMyTurn,
  bailAmount,
  onAction
}) => {
  const canAffordBail = player.money >= bailAmount;
  const hasJailCard = player.cards.includes('GET_OUT_JAIL');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#131923] border border-red-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-scale-up">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-3xl shadow-inner">
          🔒
        </div>

        <div>
          <h3 className="text-xl font-black text-white">ĐANG Ở TRONG TÙ</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isMyTurn ? 'Chọn cách xử lý để được tự do' : `Đang chờ ${player.username} đưa ra quyết định...`}
          </p>
          <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold">
            Số lượt đã ở: {player.jailTurns}/{MAX_JAIL_TURNS}
          </div>
        </div>

        {isMyTurn ? (
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onAction('pay')}
              disabled={!canAffordBail}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              💰 Nộp bảo lãnh {bailAmount}Đ (Ra tù ngay)
            </button>

            <button
              onClick={() => onAction('roll')}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all shadow-md"
            >
              🎲 Tung xúc xắc (Trúng đôi = Ra tù miễn phí)
            </button>

            {hasJailCard && (
              <button
                onClick={() => onAction('card')}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
              >
                🚪 Dùng Thẻ Ra Tù
              </button>
            )}
          </div>
        ) : (
          <div className="py-4 text-xs text-slate-500 italic">
            Người chơi đang cân nhắc nộp phạt hoặc lắc xúc xắc đôi...
          </div>
        )}
      </div>
    </div>
  );
};
