import React, { useState } from 'react';
import { Terminal, Copy, Check, Info } from 'lucide-react';
import { generateAdbCommand, generateSimctlCommand } from '../utils/urlParser';

interface CliCommandGeneratorProps {
  url: string;
  defaultPackage?: string;
}

export const CliCommandGenerator: React.FC<CliCommandGeneratorProps> = ({
  url,
  defaultPackage = '',
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const [packageName, setPackageName] = useState(defaultPackage);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (defaultPackage && !packageName) {
      setPackageName(defaultPackage);
    }
  }, [defaultPackage]);

  const adbCommand = generateAdbCommand(url || 'myapp://path', packageName);
  const simctlCommand = generateSimctlCommand(url || 'myapp://path');

  const currentCommand = activePlatform === 'android' ? adbCommand : simctlCommand;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white">
            <Terminal size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">CLI Command Generator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sinh lệnh test trên Emulator & Simulator</p>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-850 rounded-xl">
          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activePlatform === 'android'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Android (ADB)
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('ios')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activePlatform === 'ios'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            iOS (xcrun simctl)
          </button>
        </div>
      </div>

      {activePlatform === 'android' && (
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Package Name đích (tùy chọn - chỉ định rõ app nhận intent):
          </label>
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="vd: com.example.myapp hoặc com.mservice.momotransfer"
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      )}

      <div className="relative group mb-3">
        <pre className="p-3.5 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border border-slate-800 leading-relaxed shadow-inner">
          {currentCommand}
        </pre>

        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'Đã copy' : 'Copy'}
        </button>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
        {activePlatform === 'android' ? (
          <span>
            Chạy trong terminal khi đang kết nối điện thoại qua USB debugging hoặc đang mở Android Emulator.
          </span>
        ) : (
          <span>
            Chạy trực tiếp trong terminal trên macOS khi iOS Simulator đang khởi chạy (booted).
          </span>
        )}
      </div>
    </div>
  );
};
