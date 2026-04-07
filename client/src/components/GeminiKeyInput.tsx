import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';

const STORAGE_KEY = 'gemini_custom_api_key';

export const useGeminiKey = () => {
  const [key, setKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

  const saveKey = (newKey: string) => {
    setKey(newKey);
    if (newKey) localStorage.setItem(STORAGE_KEY, newKey);
    else localStorage.removeItem(STORAGE_KEY);
  };

  return { geminiKey: key, saveGeminiKey: saveKey };
};

export const getStoredGeminiKey = () => localStorage.getItem(STORAGE_KEY) || '';

export const GeminiKeyInput = ({ accent = 'purple' }: { accent?: 'purple' | 'pink' | 'blue' | 'amber' }) => {
  const { geminiKey, saveGeminiKey } = useGeminiKey();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(geminiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setInput(geminiKey); }, [geminiKey]);

  const accentMap = {
    purple: { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10', hover: 'hover:border-purple-500/50', btn: 'from-purple-600 to-pink-600', focusBorder: 'focus:border-purple-500' },
    pink: { border: 'border-pink-500/30', text: 'text-pink-400', bg: 'bg-pink-500/10', hover: 'hover:border-pink-500/50', btn: 'from-pink-600 to-rose-600', focusBorder: 'focus:border-pink-500' },
    blue: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10', hover: 'hover:border-blue-500/50', btn: 'from-blue-600 to-cyan-600', focusBorder: 'focus:border-blue-500' },
    amber: { border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10', hover: 'hover:border-amber-500/50', btn: 'from-amber-600 to-orange-600', focusBorder: 'focus:border-amber-500' },
  };
  const a = accentMap[accent];

  const handleSave = () => {
    saveGeminiKey(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    saveGeminiKey('');
    setInput('');
  };

  return (
    <div className={`rounded-xl border ${geminiKey ? 'border-emerald-500/30 bg-emerald-500/5' : `border-slate-800/50 ${a.bg}`} transition-all`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left">
        <Key size={14} className={geminiKey ? 'text-emerald-400' : a.text} />
        <span className={`text-xs font-semibold ${geminiKey ? 'text-emerald-400' : 'text-slate-400'}`}>
          {geminiKey ? '✓ Đang dùng API Key của bạn' : 'Sử dụng API Key của bạn (tùy chọn)'}
        </span>
        <span className={`ml-auto text-xs text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Nhập Gemini API Key để dùng quota riêng. Lấy key tại{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className={`${a.text} underline`}>Google AI Studio</a>.
            Key chỉ lưu trên trình duyệt của bạn.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={show ? 'text' : 'password'}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full bg-[#111827] border border-slate-700 ${a.focusBorder} text-white rounded-lg px-3 py-2 pr-9 text-sm outline-none transition placeholder:text-slate-700 font-mono`}
              />
              <button onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button onClick={handleSave} disabled={!input.trim()} className={`px-3 py-2 rounded-lg bg-gradient-to-r ${a.btn} text-white text-xs font-bold disabled:opacity-30 transition active:scale-95`}>
              {saved ? <Check size={14} /> : 'Lưu'}
            </button>
            {geminiKey && (
              <button onClick={handleClear} className="px-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition active:scale-95">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
