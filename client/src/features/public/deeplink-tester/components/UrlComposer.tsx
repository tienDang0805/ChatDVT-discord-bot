import React, { useState } from 'react';
import { Copy, Check, Clipboard, Trash2, Share2, Link as LinkIcon, AlertCircle, ShieldCheck } from 'lucide-react';
import { ParsedDeeplink } from '../types/deeplink';

interface UrlComposerProps {
  url: string;
  parsed: ParsedDeeplink;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const UrlComposer: React.FC<UrlComposerProps> = ({
  url,
  parsed,
  onChange,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch {}
  };

  const handleShare = async () => {
    if (!url) return;
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?link=${encodeURIComponent(url)}`;
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  };

  const handleQuickEncode = () => {
    if (!url) return;
    try {
      onChange(encodeURI(url));
    } catch {}
  };

  const handleQuickDecode = () => {
    if (!url) return;
    try {
      onChange(decodeURIComponent(url));
    } catch {}
  };

  const getTypeBadge = () => {
    switch (parsed.type) {
      case 'universal_link':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Universal Link / App Link</span>;
      case 'custom_scheme':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Custom Scheme ({parsed.scheme}://)</span>;
      case 'android_intent':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Android Intent URI</span>;
      case 'system':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">System Scheme ({parsed.scheme}:)</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Unknown Protocol</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
            <LinkIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Deeplink URL Composer</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nhập hoặc paste URL cần kiểm thử</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getTypeBadge()}
        </div>
      </div>

      <div className="relative mb-3">
        <textarea
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ví dụ: myapp://order/detail?id=1234&source=portal hoặc https://example.com/item/1"
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none shadow-inner"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          >
            <Clipboard size={14} />
            Dán clipboard
          </button>
          <button
            type="button"
            onClick={handleQuickDecode}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
            title="Decode URL-encoded characters"
          >
            Decode
          </button>
          <button
            type="button"
            onClick={handleQuickEncode}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
            title="Encode URI characters"
          >
            Encode
          </button>
          {url && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95"
            >
              <Trash2 size={13} />
              Xóa
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={!url}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all active:scale-95"
            title="Sao chép link chia sẻ cấu hình test này"
          >
            {shared ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            {shared ? 'Đã copy link share' : 'Share test link'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!url}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 shadow-sm shadow-orange-500/20 transition-all active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Đã sao chép' : 'Sao chép URL'}
          </button>
        </div>
      </div>

      {url && parsed.scheme && (
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Scheme</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 truncate block">{parsed.scheme}://</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Host</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 truncate block">{parsed.host || '(none)'}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Path</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 truncate block">{parsed.path || '/'}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Query Count</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 block">{parsed.params.length} tham số</span>
          </div>
        </div>
      )}

      {parsed.errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{parsed.errorMessage}</span>
        </div>
      )}
    </div>
  );
};
