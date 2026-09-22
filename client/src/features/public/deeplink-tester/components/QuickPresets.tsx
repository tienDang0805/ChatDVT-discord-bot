import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { DeeplinkPreset } from '../types/deeplink';
import { DEFAULT_PRESETS } from '../utils/presets';

interface QuickPresetsProps {
  onSelectPreset: (preset: DeeplinkPreset) => void;
}

const STORAGE_KEY = 'chatdvt_custom_deeplink_presets';

export const QuickPresets: React.FC<QuickPresetsProps> = ({ onSelectPreset }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vietnam' | 'social' | 'system' | 'standard' | 'custom'>('all');
  const [customPresets, setCustomPresets] = useState<DeeplinkPreset[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customPackage, setCustomPackage] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;

    const newPreset: DeeplinkPreset = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: 'custom',
      url: customUrl.trim(),
      description: customDesc.trim() || 'Hồ sơ deeplink tùy chỉnh',
      packageName: customPackage.trim() || undefined,
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setCustomName('');
    setCustomUrl('');
    setCustomPackage('');
    setCustomDesc('');
    setIsAdding(false);
    setSelectedCategory('custom');
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const allList = [...customPresets, ...DEFAULT_PRESETS];
  const filteredPresets =
    selectedCategory === 'all'
      ? allList
      : allList.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Thư Viện Mẫu & Custom App</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Chọn nhanh các schema phổ biến hoặc tự lưu schema riêng</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
        >
          <Plus size={14} />
          {isAdding ? 'Đóng form' : 'Lưu schema dự án'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSaveCustom} className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Thêm Hồ Sơ Deeplink Mới
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tên App / Dự án *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="vd: App Công Ty (Staging)"
                required
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                URL Scheme Mẫu *
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="vd: mycorp://open?env=staging"
                required
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Package Name Android (tùy chọn)
              </label>
              <input
                type="text"
                value={customPackage}
                onChange={(e) => setCustomPackage(e.target.value)}
                placeholder="vd: com.company.internal"
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Mô tả
              </label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Mục đích test..."
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
            >
              Lưu Preset
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs scrollbar-none">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'custom', label: `Dự án riêng (${customPresets.length})` },
          { id: 'vietnam', label: 'App Việt Nam' },
          { id: 'social', label: 'Mạng xã hội' },
          { id: 'standard', label: 'Cấu trúc chuẩn' },
          { id: 'system', label: 'Hệ thống' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className="group relative p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-850 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                  {preset.name}
                </span>
                {preset.category === 'custom' && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustom(preset.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity"
                    title="Xóa preset này"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5">
                {preset.description}
              </p>
            </div>
            <code className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200/80 dark:border-slate-800">
              {preset.url}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};
