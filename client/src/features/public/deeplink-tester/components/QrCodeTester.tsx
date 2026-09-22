import React, { useRef, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { QrCode as QrIcon, Download, Smartphone, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface QrCodeTesterProps {
  url: string;
}

export const QrCodeTester: React.FC<QrCodeTesterProps> = ({ url }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(200);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      const imgUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = `deeplink-qr-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col items-center">
      <div className="w-full flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
            <QrIcon size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Live QR Code</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Quét bằng Camera điện thoại thực tế</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <button
            type="button"
            onClick={() => setQrSize((prev) => Math.max(160, prev - 20))}
            className="p-1 hover:text-slate-700 dark:hover:text-slate-300 rounded transition-colors"
            title="Thu nhỏ QR"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-mono w-10 text-center">{qrSize}px</span>
          <button
            type="button"
            onClick={() => setQrSize((prev) => Math.min(280, prev + 20))}
            className="p-1 hover:text-slate-700 dark:hover:text-slate-300 rounded transition-colors"
            title="Phóng to QR"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700/80 flex items-center justify-center mb-4 transition-all"
      >
        {url ? (
          <QRCode
            value={url}
            size={qrSize}
            qrStyle="squares"
            eyeRadius={8}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        ) : (
          <div
            style={{ width: qrSize, height: qrSize }}
            className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 border border-dashed border-slate-200 rounded-xl"
          >
            <QrIcon size={32} />
            <span className="text-xs mt-2">Chưa có URL</span>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!url}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all active:scale-95"
        >
          {downloaded ? <Check size={14} className="text-emerald-500" /> : <Download size={14} />}
          {downloaded ? 'Đã tải ảnh' : 'Tải mã QR (PNG)'}
        </button>
      </div>

      <div className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <Smartphone size={15} className="shrink-0 mt-0.5 text-purple-500" />
        <span className="leading-snug">
          Mở ứng dụng <strong>Camera gốc (iOS)</strong> hoặc <strong>Google Lens (Android)</strong> quét để kích hoạt trực tiếp App native, tránh việc link bị WebView nội bộ (Zalo, Messenger) chặn.
        </span>
      </div>
    </div>
  );
};
