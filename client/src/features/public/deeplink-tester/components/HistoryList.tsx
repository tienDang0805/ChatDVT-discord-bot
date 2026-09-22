import React from 'react';
import { History, Star, Trash2, Clock, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../types/deeplink';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (url: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const formatTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes}p trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h trước`;
  return new Date(ts).toLocaleDateString();
};

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelect,
  onToggleFavorite,
  onDelete,
  onClearAll,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <History size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Lịch Sử Kiểm Thử</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Các liên kết đã test gần đây trong trình duyệt</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
        >
          Xóa lịch sử
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.url)}
            className="group flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-850 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                className={`p-1 rounded transition-colors ${
                  item.isFavorite
                    ? 'text-amber-500'
                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                }`}
                title={item.isFavorite ? 'Bỏ ghim' : 'Ghim yêu thích'}
              >
                <Star size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
              </button>

              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate block">
                  {item.url}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock size={10} />
                  {formatTime(item.timestamp)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                title="Xóa khỏi lịch sử"
              >
                <Trash2 size={13} />
              </button>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
