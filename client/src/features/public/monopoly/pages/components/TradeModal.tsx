import React, { useState } from 'react';
import type { GameState, TradeState, TradeOffer } from '../../game/types';
import { BOARD_TILES } from '../../game/boardData';

interface TradeModalProps {
  gameState: GameState;
  myPlayerId: string;
  onProposeTrade: (proposal: TradeState) => void;
  onRespondTrade: (response: 'accept' | 'reject') => void;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  gameState,
  myPlayerId,
  onProposeTrade,
  onRespondTrade,
  onClose
}) => {
  const me = gameState.players.find(p => p.id === myPlayerId);
  const otherPlayers = gameState.players.filter(p => p.id !== myPlayerId && !p.isEliminated);

  const [targetPlayerId, setTargetPlayerId] = useState<string>(otherPlayers[0]?.id || '');
  const [offerMoney, setOfferMoney] = useState<number>(0);
  const [offerProps, setOfferProps] = useState<number[]>([]);
  const [requestMoney, setRequestMoney] = useState<number>(0);
  const [requestProps, setRequestProps] = useState<number[]>([]);

  const incomingTrade = gameState.tradeState;
  const isIncomingForMe = incomingTrade && incomingTrade.toPlayerId === myPlayerId;
  const isOutgoingFromMe = incomingTrade && incomingTrade.fromPlayerId === myPlayerId;

  const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);

  const toggleOfferProp = (idx: number) => {
    setOfferProps(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const toggleRequestProp = (idx: number) => {
    setRequestProps(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPlayerId) return;

    const offering: TradeOffer = { money: offerMoney, properties: offerProps };
    const requesting: TradeOffer = { money: requestMoney, properties: requestProps };

    onProposeTrade({
      fromPlayerId: myPlayerId,
      toPlayerId: targetPlayerId,
      offering,
      requesting,
      timer: 20
    });
  };

  if (isIncomingForMe && incomingTrade) {
    const fromP = gameState.players.find(p => p.id === incomingTrade.fromPlayerId);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-md bg-[#131923] border border-indigo-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scale-up">
          <div className="text-3xl">🤝</div>
          <h3 className="text-xl font-black text-white">ĐỀ NGHỊ GIAO DỊCH</h3>
          <p className="text-xs text-slate-300">
            <strong className="text-indigo-400">{fromP?.username}</strong> muốn giao dịch với bạn!
          </p>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Họ Trao Cho Bạn</div>
              <div className="text-sm font-extrabold text-amber-300 mb-1">{incomingTrade.offering.money}Đ</div>
              <div className="space-y-1">
                {incomingTrade.offering.properties.map(tIdx => (
                  <div key={tIdx} className="text-xs text-slate-300 font-semibold truncate">
                    • {BOARD_TILES[tIdx]?.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-red-400 mb-1">Họ Muốn Nhận</div>
              <div className="text-sm font-extrabold text-amber-300 mb-1">{incomingTrade.requesting.money}Đ</div>
              <div className="space-y-1">
                {incomingTrade.requesting.properties.map(tIdx => (
                  <div key={tIdx} className="text-xs text-slate-300 font-semibold truncate">
                    • {BOARD_TILES[tIdx]?.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onRespondTrade('accept')}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
            >
              ✓ Đồng ý giao dịch
            </button>
            <button
              onClick={() => onRespondTrade('reject')}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
            >
              ✕ Từ chối
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isOutgoingFromMe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-sm bg-[#131923] border border-slate-700 rounded-3xl p-6 text-center shadow-2xl space-y-4">
          <div className="text-3xl animate-bounce">⏳</div>
          <h3 className="text-lg font-black text-white">Đang gửi lời mời giao dịch...</h3>
          <p className="text-xs text-slate-400">Chờ đối phương cân nhắc phản hồi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#131923] border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>🤝</span> THỎA THUẬN GIAO DỊCH
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmitProposal} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">
              Chọn Đối Tác Giao Dịch
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {otherPlayers.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTargetPlayerId(p.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center gap-2 ${
                    targetPlayerId === p.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{p.tokenEmoji}</span>
                  <span className="truncate">{p.username}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase">Bạn Trao Đi</div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Tiền mặt (Tối đa {me?.money || 0}Đ)</label>
                <input
                  type="number"
                  min="0"
                  max={me?.money || 0}
                  value={offerMoney}
                  onChange={(e) => setOfferMoney(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">BĐS của bạn:</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(me?.properties || []).map(idx => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerProps.includes(idx)}
                        onChange={() => toggleOfferProp(idx)}
                        className="rounded"
                      />
                      <span className="truncate">{BOARD_TILES[idx]?.name}</span>
                    </label>
                  ))}
                  {(me?.properties || []).length === 0 && (
                    <div className="text-[10px] text-slate-500 italic">Không có BĐS</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase">Bạn Muốn Nhận</div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Tiền mặt (Họ có {targetPlayer?.money || 0}Đ)</label>
                <input
                  type="number"
                  min="0"
                  max={targetPlayer?.money || 0}
                  value={requestMoney}
                  onChange={(e) => setRequestMoney(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">BĐS của họ:</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(targetPlayer?.properties || []).map(idx => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestProps.includes(idx)}
                        onChange={() => toggleRequestProp(idx)}
                        className="rounded"
                      />
                      <span className="truncate">{BOARD_TILES[idx]?.name}</span>
                    </label>
                  ))}
                  {(targetPlayer?.properties || []).length === 0 && (
                    <div className="text-[10px] text-slate-500 italic">Không có BĐS</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!targetPlayerId}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🚀 GỬI LỜI MỜI GIAO DỊCH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
