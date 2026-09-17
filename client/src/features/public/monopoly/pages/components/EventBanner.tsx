import React from 'react';
import type { GlobalEventDef } from '../../game/types';

interface EventBannerProps {
  event: GlobalEventDef;
  onDismiss: () => void;
}

export const EventBanner: React.FC<EventBannerProps> = ({ event, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#241219] to-[#0f172a] border border-red-500/60 rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-scale-up">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-900/40 border border-red-500/40 flex items-center justify-center text-4xl shadow-inner animate-pulse">
          {event.icon}
        </div>

        <div>
          <div className="inline-block px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-widest mb-1.5">
            SỰ KIỆN TOÀN CỤC ĐỘT XUẤT
          </div>
          <h3 className="text-xl font-black text-white">{event.name}</h3>
        </div>

        <div className="bg-black/40 border border-slate-800 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed font-semibold">
          {event.description}
          {event.duration > 0 && (
            <div className="mt-2 text-amber-400 font-extrabold">
              Hiệu lực kéo dài: {event.duration} vòng
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all"
        >
          ✓ TIẾP TỤC VÁN ĐẤU
        </button>
      </div>
    </div>
  );
};
