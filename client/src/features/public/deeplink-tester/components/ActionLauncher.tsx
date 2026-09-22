import React, { useState } from 'react';
import { Play, ExternalLink, Timer, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ActionLauncherProps {
  url: string;
  onLaunchSuccess?: () => void;
}

export const ActionLauncher: React.FC<ActionLauncherProps> = ({ url, onLaunchSuccess }) => {
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [timeoutMs, setTimeoutMs] = useState(2000);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'warn'>('info');

  const handleDirectLaunch = () => {
    if (!url) return;

    setStatusMessage(`Đang phát lệnh điều hướng đến: ${url}`);
    setStatusType('info');

    const link = document.createElement('a');
    link.href = url;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onLaunchSuccess) {
      onLaunchSuccess();
    }

    setTimeout(() => {
      setStatusMessage('Đã gửi yêu cầu mở App đến trình duyệt.');
      setStatusType('success');
    }, 600);
  };

  const handleLaunchWithFallback = () => {
    if (!url) return;
    if (!fallbackUrl) {
      setStatusMessage('Vui lòng nhập Fallback URL trước khi thử nghiệm fallback.');
      setStatusType('warn');
      return;
    }

    setStatusMessage(`Đang mở deeplink. Nếu không mở được app trong ${timeoutMs / 1000}s, sẽ chuyển hướng sang fallback URL...`);
    setStatusType('info');

    const startTime = Date.now();
    let hasHidden = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hasHidden = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const link = document.createElement('a');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onLaunchSuccess) {
      onLaunchSuccess();
    }

    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      const elapsed = Date.now() - startTime;
      if (!hasHidden && elapsed >= timeoutMs) {
        setStatusMessage(`Hết thời gian chờ (${timeoutMs / 1000}s). Trình duyệt chưa chuyển sang app, đang điều hướng sang fallback URL...`);
        setStatusType('warn');
        window.location.href = fallbackUrl;
      } else {
        setStatusMessage('Đã chuyển ngữ cảnh sang App thành công (trang web bị ẩn).');
        setStatusType('success');
      }
    }, timeoutMs);
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
          <Play size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Trình Kích Hoạt & Fallback</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mở trực tiếp trên trình duyệt hoặc mô phỏng chuyển tiếp</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleDirectLaunch}
          disabled={!url}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          <ExternalLink size={16} />
          Kích hoạt Deeplink ngay (Launch App)
        </button>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Timer size={14} className="text-orange-500" />
            <span>Mô phỏng Fallback khi chưa cài App</span>
          </div>

          <div className="space-y-2">
            <input
              type="url"
              value={fallbackUrl}
              onChange={(e) => setFallbackUrl(e.target.value)}
              placeholder="Fallback URL (vd: https://play.google.com/store/apps/details?id=...)"
              className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Timeout:</span>
                <select
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(Number(e.target.value))}
                  className="px-2 py-1 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value={1500}>1.5s</option>
                  <option value={2000}>2.0s</option>
                  <option value={3000}>3.0s</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleLaunchWithFallback}
                disabled={!url || !fallbackUrl}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white disabled:opacity-40 transition-all active:scale-95"
              >
                Chạy thử Fallback
              </button>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 border transition-all ${
              statusType === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : statusType === 'warn'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
            }`}
          >
            {statusType === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
