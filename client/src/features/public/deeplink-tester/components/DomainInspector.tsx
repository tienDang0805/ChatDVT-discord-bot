import React, { useState } from 'react';
import { Globe, Search, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { AssociationAuditResponse } from '../types/deeplink';

export const DomainInspector: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssociationAuditResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showIosRaw, setShowIosRaw] = useState(false);
  const [showAndroidRaw, setShowAndroidRaw] = useState(false);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await axios.get<AssociationAuditResponse>('/api/deeplink/check-association', {
        params: { domain: domain.trim() },
      });
      setResult(response.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Không thể kiểm tra domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 dark:text-teal-400">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Domain Association Validator (AASA & AssetLinks)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kiểm tra tính hợp lệ của Universal Links (iOS) và Android App Links trên web server
            </p>
          </div>
        </div>

        <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Nhập domain (ví dụ: shopee.vn hoặc myapp.com)"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 shadow-sm shadow-teal-500/20 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra Domain'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <XCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍏</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">iOS Universal Links (AASA)</h4>
                  <span className="text-[11px] font-mono text-slate-400 block truncate max-w-[240px]">
                    {result.ios.url}
                  </span>
                </div>
              </div>

              {result.ios.status === 200 && result.ios.isValidJson && result.ios.errors.length === 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Hợp lệ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle size={12} /> Cần khắc phục
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">HTTP Status:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {result.ios.status || 'Không thể kết nối'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">HTTP Redirects:</span>
                <span className={result.ios.hasRedirect ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                  {result.ios.hasRedirect ? 'Phát hiện Redirect (Apple CẤM)' : 'Không Redirect (Chuẩn)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Content-Type:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                  {result.ios.contentType || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Định dạng JSON:</span>
                <span className={result.ios.isValidJson ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {result.ios.isValidJson ? 'Hợp lệ' : 'Sai cú pháp JSON'}
                </span>
              </div>
            </div>

            {result.ios.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">Lỗi phát hiện:</span>
                {result.ios.errors.map((err, idx) => (
                  <p key={idx} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1">
                    <span>•</span> <span>{err}</span>
                  </p>
                ))}
              </div>
            )}

            {result.ios.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">Cảnh báo:</span>
                {result.ios.warnings.map((warn, idx) => (
                  <p key={idx} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                    <span>•</span> <span>{warn}</span>
                  </p>
                ))}
              </div>
            )}

            {result.ios.data && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowIosRaw(!showIosRaw)}
                  className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
                >
                  <span>Xem nội dung JSON gốc (AASA)</span>
                  {showIosRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showIosRaw && (
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(result.ios.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Android App Links (assetlinks)</h4>
                  <span className="text-[11px] font-mono text-slate-400 block truncate max-w-[240px]">
                    {result.android.url}
                  </span>
                </div>
              </div>

              {result.android.status === 200 && result.android.isValidJson && result.android.errors.length === 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Hợp lệ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle size={12} /> Cần khắc phục
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">HTTP Status:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {result.android.status || 'Không thể kết nối'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Content-Type:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                  {result.android.contentType || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Định dạng JSON:</span>
                <span className={result.android.isValidJson ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {result.android.isValidJson ? 'Hợp lệ' : 'Sai cú pháp JSON'}
                </span>
              </div>
            </div>

            {result.android.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">Lỗi phát hiện:</span>
                {result.android.errors.map((err, idx) => (
                  <p key={idx} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1">
                    <span>•</span> <span>{err}</span>
                  </p>
                ))}
              </div>
            )}

            {result.android.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">Cảnh báo:</span>
                {result.android.warnings.map((warn, idx) => (
                  <p key={idx} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                    <span>•</span> <span>{warn}</span>
                  </p>
                ))}
              </div>
            )}

            {result.android.data && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAndroidRaw(!showAndroidRaw)}
                  className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
                >
                  <span>Xem nội dung JSON gốc (assetlinks)</span>
                  {showAndroidRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showAndroidRaw && (
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(result.android.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
