import React from 'react';
import type { GameState } from '../../game/types';
import { BOARD_TILES } from '../../game/boardData';

interface AuctionModalProps {
  gameState: GameState;
  myPlayerId: string;
  onBid: (amount: number) => void;
}

function roundToTen(value: number): number {
  return Math.max(10, Math.round(value / 10) * 10);
}

export const AuctionModal: React.FC<AuctionModalProps> = ({ gameState, myPlayerId, onBid }) => {
  const auction = gameState.auctionState;
  if (!auction) return null;

  const tile = BOARD_TILES[auction.tileIndex];
  const me = gameState.players.find(player => player.id === myPlayerId);
  const currentBidder = gameState.players.find(player => player.id === auction.currentBidderId);
  const increment = roundToTen(10 * gameState.economy.worldScale);
  const minimumBid = auction.currentBidderId ? auction.currentBid + increment : auction.startPrice;
  const quickBid = minimumBid + roundToTen(50 * gameState.economy.worldScale);
  const canBid = Boolean(me && !me.isEliminated && me.money >= minimumBid && auction.currentBidderId !== myPlayerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-amber-400/70 bg-gradient-to-b from-[#1b2234] to-[#0b1020] shadow-[0_0_55px_rgba(245,158,11,0.35)]">
        <div className="border-b border-amber-400/30 bg-amber-500/10 px-5 py-4 text-center">
          <div className="text-3xl">🔨</div>
          <h2 className="mt-1 text-lg font-black text-amber-300">ĐẤU GIÁ CÔNG KHAI</h2>
          <p className="text-sm font-extrabold text-white">{tile?.name || 'Bất động sản'}</p>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giá mở cửa</div>
              <div className="mt-1 text-lg font-black text-slate-200">{auction.startPrice}Đ</div>
            </div>
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Giá hiện tại</div>
              <div className="mt-1 text-lg font-black text-amber-300">{auction.currentBid || '—'}{auction.currentBid ? 'Đ' : ''}</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/70 px-3 py-2 text-center text-xs text-slate-300">
            {currentBidder
              ? <><strong className="text-white">{currentBidder.username}</strong> đang dẫn đầu</>
              : 'Chưa có người trả giá'}
            <span className="ml-2 font-black text-amber-400">• {gameState.turnTimer}s</span>
          </div>

          {me && (
            <div className="text-center text-xs text-slate-400">
              Số dư của bạn: <strong className="text-emerald-400">{me.money}Đ</strong>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!canBid}
              onClick={() => onBid(minimumBid)}
              className={`rounded-xl px-3 py-3 text-xs font-black transition-all ${canBid
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'}`}
            >
              TRẢ {minimumBid}Đ
            </button>
            <button
              type="button"
              disabled={!canBid || (me?.money || 0) < quickBid}
              onClick={() => onBid(quickBid)}
              className={`rounded-xl px-3 py-3 text-xs font-black transition-all ${canBid && (me?.money || 0) >= quickBid
                ? 'bg-orange-600 text-white hover:bg-orange-500 active:scale-95'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'}`}
            >
              ÉP GIÁ {quickBid}Đ
            </button>
          </div>

          <p className="text-center text-[10px] leading-relaxed text-slate-500">
            Bỏ mua sẽ mở đấu giá cho toàn bộ người chơi. Người trả cao nhất khi hết giờ nhận tài sản.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuctionModal;
