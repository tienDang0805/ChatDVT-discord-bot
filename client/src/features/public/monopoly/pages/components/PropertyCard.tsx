import React from 'react';
import type { TileDef, PlayerState } from '../../game/types';
import { BUILD_LEVELS, STATION_RENTS } from '../../game/boardData';

interface PropertyCardProps {
  tile: TileDef;
  owner?: PlayerState;
  buildLevel?: number;
  onClose: () => void;
}

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; name: string }> = {
  green: { bg: 'from-emerald-600 to-green-700', border: 'border-emerald-500', text: 'text-emerald-400', name: 'Ngoại Thành' },
  blue: { bg: 'from-blue-600 to-cyan-700', border: 'border-blue-500', text: 'text-blue-400', name: 'Ven Trung Tâm' },
  yellow: { bg: 'from-amber-500 to-yellow-600', border: 'border-amber-400', text: 'text-amber-400', name: 'Đất Vàng Sài Gòn' },
  red: { bg: 'from-red-600 to-rose-700', border: 'border-red-500', text: 'text-red-400', name: 'Đắk Nông Quý Tộc 👑' }
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  tile,
  owner,
  buildLevel = 0,
  onClose
}) => {
  const groupInfo = tile.group ? GROUP_COLORS[tile.group] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#131923] border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        <div className="bg-gradient-to-r from-red-800 via-rose-900 to-red-800 p-4 text-center border-b-2 border-amber-400 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center text-xs font-bold transition-all"
          >
            ✕
          </button>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
            <span>🇻🇳</span>
            <span>CỘNG HÒA XÃ HỘI CHỦ NGHĨA 8D</span>
          </div>
          <div className="text-xs uppercase font-extrabold text-amber-200 mt-0.5 tracking-wider">
            GIẤY CHỨNG NHẬN QUYỀN SỬ DỤNG ĐẤT
          </div>
          <div className="text-[9px] text-amber-300/80 italic font-semibold">(SỔ ĐỎ CHÍNH CHỦ)</div>
        </div>

        {groupInfo && (
          <div className={`py-2 px-4 bg-gradient-to-r ${groupInfo.bg} text-white text-center shadow-md`}>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Khu Vực: {groupInfo.name}
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
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Giá Mua Đất</span>
              <span className="text-base font-black text-amber-400">
                {tile.price ? `${tile.price}Đ` : 'Đặc biệt'}
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
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>Biểu Phí Thu Tiền Nhà</span>
                <span className="text-amber-400 font-bold">Cấp {buildLevel}/4</span>
              </div>
              {BUILD_LEVELS.map(lvl => {
                const rent = (tile.baseRent || 10) * lvl.rentMultiplier;
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
          )}

          {tile.type === 'station' && (
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                Biểu Phí Bến Xe / Nhà Ga
              </div>
              <div className="flex justify-between text-slate-300 py-0.5">
                <span>Sở hữu 1 bến ga:</span>
                <span className="font-bold text-amber-400">{STATION_RENTS[1]}Đ</span>
              </div>
              <div className="flex justify-between text-slate-300 py-0.5">
                <span>Sở hữu 2 bến ga:</span>
                <span className="font-bold text-amber-400">{STATION_RENTS[2]}Đ</span>
              </div>
              <div className="flex justify-between text-slate-300 py-0.5">
                <span>Sở hữu 3 bến ga:</span>
                <span className="font-bold text-amber-400">{STATION_RENTS[3]}Đ</span>
              </div>
            </div>
          )}

          <div className="pt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-black text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            >
              Đóng Sổ Đỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PropertyCard;
