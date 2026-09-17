import React from 'react';
import { BOARD_TILES, BUILD_LEVELS, STATION_RENTS } from '../../game/boardData';
import type { TileDef } from '../../game/types';

interface BuyPromptProps {
  tileIndex: number;
  playerMoney: number;
  discount?: number;
  timer: number;
  isMyTurn: boolean;
  onBuy: () => void;
  onSkip: () => void;
}

const GROUP_COLORS: Record<string, string> = {
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  red: '#ef4444'
};

export const BuyPrompt: React.FC<BuyPromptProps> = ({
  tileIndex,
  playerMoney,
  discount = 1,
  timer,
  isMyTurn,
  onBuy,
  onSkip
}) => {
  const tile: TileDef = BOARD_TILES[tileIndex] || BOARD_TILES[0];
  const originalPrice = tile.price || 100;
  const finalPrice = Math.floor(originalPrice * discount);
  const canAfford = playerMoney >= finalPrice;
  const groupColor = tile.group ? GROUP_COLORS[tile.group] || '#64748b' : '#64748b';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#131923] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transform animate-scale-up">
        <div
          className="p-4 text-center border-b border-slate-700/50"
          style={{ backgroundColor: `${groupColor}20`, borderTop: `4px solid ${groupColor}` }}
        >
          <div className="text-[11px] uppercase tracking-widest font-extrabold text-slate-400">
            {tile.type === 'station' ? 'Bến Xe / Nhà Ga' : `Bất Động Sản • Nhóm ${tile.group || 'Khác'}`}
          </div>
          <h3 className="text-xl font-black text-white mt-1">{tile.name}</h3>
          <p className="text-xs text-slate-300 italic mt-0.5">{tile.flavor}</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase">Giá Niêm Yết</div>
              <div className="text-lg font-black text-amber-300">
                {finalPrice}Đ
                {discount < 1 && (
                  <span className="ml-2 text-xs line-through text-slate-500 font-normal">
                    {originalPrice}Đ
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-bold uppercase">Tiền Của Bạn</div>
              <div className={`text-base font-extrabold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                {playerMoney}Đ
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Biểu Phí Thuê
            </div>

            {tile.type === 'station' ? (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Sở hữu 1 bến:</span>
                  <span className="font-bold text-amber-300">{STATION_RENTS[1]}Đ</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sở hữu 2 bến:</span>
                  <span className="font-bold text-amber-300">{STATION_RENTS[2]}Đ</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sở hữu 3 bến:</span>
                  <span className="font-bold text-amber-300">{STATION_RENTS[3]}Đ</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                {BUILD_LEVELS.map(lvl => {
                  const rent = (tile.baseRent || 10) * lvl.rentMultiplier;
                  return (
                    <div key={lvl.level} className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{lvl.icon}</span>
                        <span>{lvl.name}</span>
                      </div>
                      <span className="font-bold text-amber-300">{rent}Đ</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-center text-xs font-bold text-slate-400">
            Thời gian quyết định: <span className="text-orange-400 font-black">{timer}s</span>
          </div>

          {isMyTurn ? (
            <div className="flex gap-2 pt-1">
              <button
                onClick={onBuy}
                disabled={!canAfford}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all shadow-lg ${
                  canAfford
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                💰 Mua ({finalPrice}Đ)
              </button>

              <button
                onClick={onSkip}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-98"
              >
                ❌ Bỏ qua (Đấu giá)
              </button>
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400 italic">
              Đang chờ người chơi hiện tại quyết định mua hoặc đưa ra đấu giá...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
