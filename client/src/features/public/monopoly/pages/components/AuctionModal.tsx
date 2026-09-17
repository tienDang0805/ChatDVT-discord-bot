import React, { useState } from 'react';
import type { AuctionState, PlayerState } from '../../game/types';
import { BOARD_TILES } from '../../game/boardData';
import { MIN_BID_INCREMENT } from '../../game/constants';

interface AuctionModalProps {
  auctionState: AuctionState;
  players: PlayerState[];
  myPlayerId: string;
  onPlaceBid: (amount: number) => void;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  auctionState,
  players,
  myPlayerId,
  onPlaceBid
}) => {
  const { tileIndex, currentBid, currentBidderId, timer } = auctionState;
  const tile = BOARD_TILES[tileIndex];
  const me = players.find(p => p.id === myPlayerId);
  const currentBidder = players.find(p => p.id === currentBidderId);
  const minNextBid = currentBid + MIN_BID_INCREMENT;
  const [customBid, setCustomBid] = useState<number>(minNextBid);

  const canBidMin = (me?.money || 0) >= minNextBid;
  const isWinning = currentBidderId === myPlayerId;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBid >= minNextBid && (me?.money || 0) >= customBid) {
      onPlaceBid(customBid);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#131923] border border-amber-500/40 rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-scale-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
          <span>📢</span> ĐẤU GIÁ BẤT ĐỘNG SẢN
        </div>

        <div>
          <h3 className="text-xl font-black text-white">{tile?.name}</h3>
          <p className="text-xs text-slate-400 italic">{tile?.flavor}</p>
          <div className="text-xs text-slate-500 mt-0.5">Giá gốc: {tile?.price}Đ</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs uppercase font-bold text-slate-400">Giá Cao Nhất Hiện Tại</div>
          <div className="text-3xl font-black text-amber-400">{currentBid}Đ</div>
          <div className="text-xs text-slate-300">
            Người đang dẫn đầu:{' '}
            <span className="font-extrabold text-white">
              {currentBidder ? `${currentBidder.username} ${isWinning ? '(Bạn)' : ''}` : 'Chưa có ai đặt'}
            </span>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Thời gian vòng bid: <span className="text-red-400 font-black text-sm">{timer}s</span>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onPlaceBid(currentBid + 10)}
              disabled={!canBidMin || isWinning}
              className="flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +10Đ ({currentBid + 10}Đ)
            </button>
            <button
              onClick={() => onPlaceBid(currentBid + 50)}
              disabled={(me?.money || 0) < currentBid + 50 || isWinning}
              className="flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +50Đ ({currentBid + 50}Đ)
            </button>
            <button
              onClick={() => onPlaceBid(currentBid + 100)}
              disabled={(me?.money || 0) < currentBid + 100 || isWinning}
              className="flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +100Đ ({currentBid + 100}Đ)
            </button>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="number"
              min={minNextBid}
              max={me?.money || 0}
              value={customBid}
              onChange={(e) => setCustomBid(Number(e.target.value))}
              placeholder={`Tối thiểu ${minNextBid}Đ`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={customBid < minNextBid || (me?.money || 0) < customBid || isWinning}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Bid Ngay
            </button>
          </form>
        </div>

        <div className="text-[11px] text-slate-400">
          Tiền mặt của bạn: <span className="text-emerald-400 font-bold">{me?.money || 0}Đ</span>
        </div>
      </div>
    </div>
  );
};
