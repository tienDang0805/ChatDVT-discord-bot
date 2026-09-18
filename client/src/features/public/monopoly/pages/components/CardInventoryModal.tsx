import React from 'react';
import type { PlayerState } from '../../game/types';
import { CHANCE_CARDS, COMMUNITY_CARDS } from '../../game/boardData';

interface CardInventoryModalProps {
  player: PlayerState;
  onClose: () => void;
}

const ALL_HOLDABLE_CARDS = [
  ...CHANCE_CARDS.filter(c => c.effect.type === 'hold_insurance' || c.effect.type === 'hold_jail_free'),
  ...COMMUNITY_CARDS.filter(c => c.effect.type === 'hold_insurance' || c.effect.type === 'hold_jail_free')
];

function getCardInfo(cardKey: string) {
  if (cardKey === 'INSURANCE') {
    return {
      name: 'Bảo Hiểm VIP',
      icon: '🛡️',
      description: 'Miễn tiền thuê 1 lần khi bước vào ô của đối thủ. Tự động sử dụng.',
      color: 'from-blue-600 to-cyan-700',
      border: 'border-blue-500/60',
      textColor: 'text-blue-300'
    };
  }
  if (cardKey === 'GET_OUT_JAIL') {
    return {
      name: 'Thẻ Ra Tù',
      icon: '🚪',
      description: 'Sử dụng khi bị giam trong tù để ra tù miễn phí. Chọn trong JAIL_ACTION.',
      color: 'from-emerald-600 to-teal-700',
      border: 'border-emerald-500/60',
      textColor: 'text-emerald-300'
    };
  }
  return {
    name: cardKey,
    icon: '🃏',
    description: 'Thẻ đặc biệt',
    color: 'from-slate-600 to-zinc-700',
    border: 'border-slate-500/60',
    textColor: 'text-slate-300'
  };
}

export const CardInventoryModal: React.FC<CardInventoryModalProps> = ({
  player,
  onClose
}) => {
  const cardCounts: Record<string, number> = {};
  player.cards.forEach(key => {
    cardCounts[key] = (cardCounts[key] || 0) + 1;
  });

  const uniqueCards = Object.keys(cardCounts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#131923] border-2 border-violet-500/50 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.2)] overflow-hidden">
        <div className="bg-gradient-to-r from-violet-800 via-purple-900 to-violet-800 p-4 text-center border-b-2 border-violet-400/60 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
          <div className="text-lg">🎴</div>
          <div className="text-sm font-black text-white mt-1">TÚI ĐỒ CỦA BẠN</div>
          <div className="text-[10px] text-violet-300/80 font-semibold">
            {player.cards.length} thẻ đang giữ
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {uniqueCards.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2 opacity-40">🃏</div>
              <div className="text-xs text-slate-400 font-bold">Chưa có thẻ nào</div>
              <div className="text-[10px] text-slate-500 mt-1">
                Thu thập thẻ từ ô Cơ Hội và Khí Vận
              </div>
            </div>
          ) : (
            uniqueCards.map(cardKey => {
              const info = getCardInfo(cardKey);
              const count = cardCounts[cardKey];
              return (
                <div
                  key={cardKey}
                  className={`relative rounded-2xl overflow-hidden border-2 ${info.border} shadow-lg`}
                >
                  <div className={`bg-gradient-to-r ${info.color} px-4 py-3 flex items-center gap-3`}>
                    <span className="text-3xl drop-shadow-lg">{info.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        {info.name}
                        {count > 1 && (
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-black">
                            ×{count}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/80 mt-0.5">{info.description}</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 px-4 py-2 text-[10px] text-slate-400 font-semibold">
                    ⏳ Tự động sử dụng khi cần
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
