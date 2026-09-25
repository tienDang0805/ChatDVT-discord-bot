import React from 'react';
import type { TileDef, PlayerState, GameState } from '../../game/types';
import { BUILD_LEVELS, getStationTiles } from '../../game/boardData';
import { BUYOUT_MAX_LEVEL } from '../../game/constants';
import { calculateBuyoutPreview, getDisplayedRent, getStationRent, getTilePrice } from '../../game/economy';

interface PropertyCardProps {
  tile: TileDef;
  owner?: PlayerState;
  buildLevel?: number;
  gameState?: GameState;
  onClose: () => void;
}

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; name: string }> = {
  green: { bg: 'from-emerald-600 to-green-700', border: 'border-emerald-500', text: 'text-emerald-400', name: 'Ngoại Thành' },
  blue: { bg: 'from-blue-600 to-cyan-700', border: 'border-blue-500', text: 'text-blue-400', name: 'Ven Trung Tâm' },
  yellow: { bg: 'from-amber-500 to-yellow-600', border: 'border-amber-400', text: 'text-amber-400', name: 'Đất Vàng Sài Gòn' },
  red: { bg: 'from-red-600 to-rose-700', border: 'border-red-500', text: 'text-red-400', name: 'Đắk Nông Quý Tộc 👑' },
  purple: { bg: 'from-violet-600 to-purple-700', border: 'border-violet-500', text: 'text-violet-400', name: 'Đất Thần Thánh 💎' }
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  tile,
  owner,
  buildLevel = 0,
  gameState,
  onClose
}) => {
  const groupInfo = tile.group ? GROUP_COLORS[tile.group] : null;

  const ownerStationCount = owner && gameState
    ? owner.properties.filter(t => getStationTiles().includes(t)).length
    : 0;
  const currentPlayer = gameState?.players[gameState.currentPlayerIndex];
  const buyoutQuote = gameState && owner && currentPlayer && currentPlayer.id !== owner.id
    ? calculateBuyoutPreview(gameState, currentPlayer.id, tile.index)
    : null;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-[#131923] border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden cursor-default"
      >
        <div className="bg-gradient-to-r from-red-800 via-rose-900 to-red-800 p-4 text-center border-b-2 border-amber-400 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
            <span>🇻🇳</span>
            <span>CỘNG HÒA XÃ HỘI CHỦ NGHĨA 8D</span>
          </div>
          <div className="text-xs uppercase font-extrabold text-amber-200 mt-0.5 tracking-wider">
            {tile.type === 'station' ? 'GIẤY PHÉP KHAI THÁC VẬN TẢI' : 'GIẤY CHỨNG NHẬN QUYỀN SỬ DỤNG ĐẤT'}
          </div>
          <div className="text-[9px] text-amber-300/80 italic font-semibold">
            {tile.type === 'station' ? '(KIẾN TRÚC ĐẶC BIỆT)' : '(SỔ ĐỎ CHÍNH CHỦ)'}
          </div>
        </div>

        {groupInfo && (
          <div className={`py-2 px-4 bg-gradient-to-r ${groupInfo.bg} text-white text-center shadow-md`}>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Khu Vực: {groupInfo.name}
            </span>
          </div>
        )}

        {tile.type === 'station' && (
          <div className="py-2 px-4 bg-gradient-to-r from-slate-600 to-zinc-700 text-white text-center shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest">
              {tile.stationIcon} Kiến Trúc Đặc Biệt — Không Thể Nâng Cấp
            </span>
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-black text-white tracking-wide">{tile.name}</h3>
            <p className="text-xs text-slate-300 italic mt-0.5">{tile.flavor}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Giá Mua</span>
              <span className="text-base font-black text-amber-400">
                {gameState && tile.price ? `${getTilePrice(gameState, tile.index).toLocaleString()}Đ` : 'Đặc biệt'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chủ Sở Hữu</span>
              {owner ? (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs">{owner.tokenEmoji}</span>
                  <span className="text-xs font-black text-white truncate max-w-[90px]">
                    {owner.username}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-400">Đang Trống</span>
              )}
            </div>
          </div>

          {tile.type === 'property' && (
            <>
              <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                  <span>Biểu Phí Thu Tiền Nhà</span>
                  {owner && <span className="text-amber-400 font-bold">Cấp {buildLevel}/4</span>}
                </div>
                {BUILD_LEVELS.map(lvl => {
                  const rent = gameState ? getDisplayedRent(gameState, tile.index, lvl.level, owner?.id) : 0;
                  const isCurrent = lvl.level === buildLevel && owner;
                  return (
                    <div
                      key={lvl.level}
                      className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{lvl.icon}</span>
                        <span>{lvl.name}</span>
                      </div>
                      <span className="font-extrabold">{rent}Đ</span>
                    </div>
                  );
                })}
              </div>

              {owner && buildLevel < BUYOUT_MAX_LEVEL && tile.price && buyoutQuote && (
                <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30 text-xs">
                  <div className="text-[10px] font-black text-rose-400 uppercase mb-1">Giá Thâu Tóm</div>
                  <div className="text-amber-300 font-black">{buyoutQuote.buyerPays.toLocaleString()}Đ <span className="text-slate-400 font-normal">(gồm {buyoutQuote.transactionFee}Đ phí)</span></div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Nâng lên cấp {BUYOUT_MAX_LEVEL} ({BUILD_LEVELS[BUYOUT_MAX_LEVEL]?.name}) để chặn thâu tóm</div>
                </div>
              )}

              {owner && buildLevel >= BUYOUT_MAX_LEVEL && (
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 font-bold text-center">
                  🏰 ĐÃ MIỄN NHIỄM THÂU TÓM (Cấp MAX)
                </div>
              )}
            </>
          )}

          {tile.type === 'station' && (
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                {tile.stationIcon} Biểu Phí Vận Tải
              </div>
              <div className="text-[10px] text-amber-300/80 mb-2 italic">
                Sở hữu cả 4 Ga/Sân Bay/Bến Xe → THẮNG NGAY!
              </div>
              {[1, 2, 3, 4].map(count => {
                const rent = gameState ? getStationRent(gameState, count) : 0;
                const isCurrentCount = ownerStationCount === count && owner;
                return (
                  <div key={count} className={`flex justify-between py-1 px-2 rounded-lg ${
                    isCurrentCount ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-300'
                  }`}>
                    <span>{count === 4 ? `🏆 Sở hữu ${count} ga:` : `Sở hữu ${count} ga:`}</span>
                    <span className="font-bold text-amber-400">{count === 4 ? `${rent}Đ + THẮNG!` : `${rent}Đ`}</span>
                  </div>
                );
              })}
              <div className="text-[10px] text-slate-500 mt-1 italic text-center">
                Không thể nâng cấp • Không thể bị thâu tóm
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-black text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            Đóng Sổ Đỏ
          </button>
        </div>
      </div>
    </div>
  );
};
export default PropertyCard;
