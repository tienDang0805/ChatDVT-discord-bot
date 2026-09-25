import React from 'react';
import { BOARD_TILES, BUILD_LEVELS } from '../../game/boardData';
import type { GameState, TileDef } from '../../game/types';
import { getRentAtLevel, getStationRent, getTilePrice } from '../../game/economy';

interface BuyPromptProps {
  tileIndex: number;
  gameState: GameState;
  playerMoney: number;
  discount?: number;
  timer: number;
  isMyTurn: boolean;
  isBuyout?: boolean;
  currentOwnerName?: string;
  onBuy: () => void;
  onSkip: () => void;
}

const GROUP_COLORS: Record<string, string> = {
  green: '#10b981',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6'
};

export const BuyPrompt: React.FC<BuyPromptProps> = ({
  tileIndex,
  gameState,
  playerMoney,
  discount = 1,
  timer,
  isMyTurn,
  isBuyout = false,
  currentOwnerName,
  onBuy,
  onSkip
}) => {
  const tile: TileDef = BOARD_TILES[tileIndex] || BOARD_TILES[0];
  const originalPrice = getTilePrice(gameState, tileIndex);
  const finalPrice = isBuyout
    ? gameState.pendingBuyoutQuote?.buyerPays || 0
    : Math.round(originalPrice * discount / 10) * 10;
  const canAfford = playerMoney >= finalPrice;
  const remainingRatio = (playerMoney - finalPrice) / gameState.economy.startMoney;
  const safety = remainingRatio > 0.4
    ? { label: 'AN TOÀN', color: 'text-emerald-400' }
    : remainingRatio >= 0.2
      ? { label: 'CẦN CÂN NHẮC', color: 'text-amber-400' }
      : { label: 'ALL-IN RỦI RO CAO', color: 'text-rose-400' };
  const groupColor = tile.group ? GROUP_COLORS[tile.group] || '#64748b' : '#64748b';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm bg-[#131923] border-2 border-amber-500/80 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden">
        <div
          className="p-4 text-center border-b border-slate-700/50 relative"
          style={{ backgroundColor: `${groupColor}25`, borderTop: `5px solid ${groupColor}` }}
        >
          <div className="text-[10px] uppercase tracking-widest font-black text-amber-300 flex items-center justify-center gap-1">
            <span>📜</span>
            <span>{isBuyout ? 'CƠ HỘI THÂU TÓM BĐS ĐỐI THỦ' : 'GIẤY CHỨNG NHẬN ĐẤT ĐAI (SỔ ĐỎ)'}</span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">{tile.name}</h3>
          <p className="text-xs text-slate-300 italic mt-0.5">{tile.flavor}</p>
          {isBuyout && currentOwnerName && (
            <div className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black">
              Chủ hiện tại: {currentOwnerName}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                {isBuyout ? 'Tổng tiền bên mua trả' : 'Giá Niêm Yết'}
              </div>
              <div className="text-lg font-black text-amber-300">
                {finalPrice.toLocaleString()}Đ
                {!isBuyout && discount < 1 && (
                  <span className="ml-2 text-xs line-through text-slate-500 font-normal">
                    {originalPrice}Đ
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tiền Của Bạn</div>
              <div className={`text-base font-black ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                {playerMoney.toLocaleString()}Đ
              </div>
              {canAfford && <div className={`text-[9px] font-black ${safety.color}`}>{safety.label} • còn {(playerMoney - finalPrice).toLocaleString()}Đ</div>}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-3 border border-slate-800 space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Biểu Phí Thu Tiền Nhà Dự Kiến
            </div>

            {tile.type === 'station' ? (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Sở hữu 1 ga:</span>
                  <span className="font-bold text-amber-300">{getStationRent(gameState, 1)}Đ</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sở hữu 2 ga:</span>
                  <span className="font-bold text-amber-300">{getStationRent(gameState, 2)}Đ</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sở hữu 3 ga:</span>
                  <span className="font-bold text-amber-300">{getStationRent(gameState, 3)}Đ</span>
                </div>
                <div className="flex justify-between text-amber-300 font-black bg-amber-500/10 py-1 px-1 rounded-lg border border-amber-500/30">
                  <span>🏆 Sở hữu 4 ga:</span>
                  <span>{getStationRent(gameState, 4)}Đ + THẮNG!</span>
                </div>
                <div className="text-[10px] text-slate-500 italic text-center mt-1">
                  Không thể nâng cấp • Không thể bị thâu tóm
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                {BUILD_LEVELS.map(lvl => {
                  const rent = getRentAtLevel(gameState, tileIndex, lvl.level);
                  return (
                    <div key={lvl.level} className="flex items-center justify-between text-slate-300 py-0.5">
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

          {isBuyout && gameState.pendingBuyoutQuote && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-300"><span>Giá trị đất + công trình</span><strong>{gameState.pendingBuyoutQuote.assetValue.toLocaleString()}Đ</strong></div>
              <div className="flex justify-between text-slate-300"><span>Chủ cũ nhận</span><strong className="text-emerald-400">{gameState.pendingBuyoutQuote.ownerReceives.toLocaleString()}Đ</strong></div>
              <div className="flex justify-between text-slate-300"><span>Phí ngân hàng 10%</span><strong className="text-rose-400">{gameState.pendingBuyoutQuote.transactionFee.toLocaleString()}Đ</strong></div>
              {gameState.pendingBuyoutQuote.setPremiumApplied && <div className="text-amber-300 font-bold">⚠️ Đã cộng premium chiến lược do ảnh hưởng bộ màu.</div>}
            </div>
          )}

          <div className="text-center text-xs font-bold text-slate-400">
            Thời gian quyết định: <span className="text-amber-400 font-black">{timer}s</span>
          </div>

          {isMyTurn ? (
            <div className="flex gap-2 pt-1">
              <button
                onClick={onBuy}
                disabled={!canAfford}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wide transition-all shadow-lg ${
                  canAfford
                    ? isBuyout
                      ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-rose-600/30 active:scale-95 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isBuyout ? `⚡ Mua Lại (${finalPrice}Đ)` : `💰 Mua Đất (${finalPrice}Đ)`}
              </button>

              <button
                onClick={onSkip}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
              >
                Bỏ Qua
              </button>
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400 italic">
              Đang chờ người chơi hiện tại quyết định...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BuyPrompt;
