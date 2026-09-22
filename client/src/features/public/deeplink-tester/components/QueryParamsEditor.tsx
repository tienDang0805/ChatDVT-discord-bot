import React from 'react';
import { Plus, Trash2, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { QueryParam } from '../types/deeplink';

interface QueryParamsEditorProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
}

export const QueryParamsEditor: React.FC<QueryParamsEditorProps> = ({
  params,
  onChange,
}) => {
  const handleToggle = (id: string) => {
    onChange(
      params.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleUpdateKey = (id: string, newKey: string) => {
    onChange(
      params.map((p) => (p.id === id ? { ...p, key: newKey } : p))
    );
  };

  const handleUpdateValue = (id: string, newValue: string) => {
    onChange(
      params.map((p) => (p.id === id ? { ...p, value: newValue } : p))
    );
  };

  const handleRemove = (id: string) => {
    onChange(params.filter((p) => p.id !== id));
  };

  const handleAdd = () => {
    const newParam: QueryParam = {
      id: `param_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: '',
      value: '',
      enabled: true,
    };
    onChange([...params, newParam]);
  };

  const handleEncodeValue = (id: string) => {
    onChange(
      params.map((p) => {
        if (p.id === id) {
          try {
            return { ...p, value: encodeURIComponent(p.value) };
          } catch {
            return p;
          }
        }
        return p;
      })
    );
  };

  const handleDecodeValue = (id: string) => {
    onChange(
      params.map((p) => {
        if (p.id === id) {
          try {
            return { ...p, value: decodeURIComponent(p.value) };
          } catch {
            return p;
          }
        }
        return p;
      })
    );
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Query Parameters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {params.length > 0
                ? `${params.filter((p) => p.enabled).length}/${params.length} tham số đang kích hoạt`
                : 'Chưa có tham số query'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {params.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 px-2 py-1 transition-colors"
            >
              Xóa hết
            </button>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus size={14} />
            Thêm param
          </button>
        </div>
      </div>

      {params.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
            URL chưa có query parameters nào (?key=value)
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-semibold"
          >
            + Thêm tham số đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {params.map((param) => (
            <div
              key={param.id}
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border transition-all ${
                param.enabled
                  ? 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-850'
                  : 'bg-slate-100/40 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-850/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={() => handleToggle(param.id)}
                  title={param.enabled ? 'Vô hiệu hóa tham số' : 'Kích hoạt tham số'}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => handleUpdateKey(param.id, e.target.value)}
                    placeholder="Key (vd: id, token)"
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-7 relative">
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => handleUpdateValue(param.id, e.target.value)}
                    placeholder="Value (vd: 1234, https://...)"
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEncodeValue(param.id)}
                  className="px-2 py-1 text-[10px] font-mono rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  title="URL Encode giá trị này"
                >
                  enc
                </button>
                <button
                  type="button"
                  onClick={() => handleDecodeValue(param.id)}
                  className="px-2 py-1 text-[10px] font-mono rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  title="URL Decode giá trị này"
                >
                  dec
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(param.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  title="Xóa tham số"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
