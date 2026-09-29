import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../../shared/api';

export const WebChatPrompt = () => {
  const [prompt, setPrompt] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const fetchPrompt = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/web-chat/prompt');
      const text = res.data.prompt || '';
      setPrompt(text);
      setOriginalPrompt(text);
      setCharCount(text.length);
    } catch (err) {
      console.error('Failed to fetch prompt:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await api.post('/web-chat/prompt', { prompt });
      setOriginalPrompt(prompt);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save prompt:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
    setCharCount(originalPrompt.length);
  };

  const hasChanges = prompt !== originalPrompt;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={24} className="text-orange-500" />
            Web Chat Prompt
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cấu hình System Prompt cho AI chatDVT trên web (widget chat)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium animate-pulse">
              <CheckCircle2 size={16} /> Đã lưu!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
              <AlertCircle size={16} /> Lỗi lưu!
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || prompt.trim().length === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Save size={14} /> {isSaving ? 'Đang lưu...' : 'Lưu Prompt'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#0d1117]/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">System Prompt</span>
            {hasChanges && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Chưa lưu
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{charCount.toLocaleString()} ký tự</span>
            <button
              onClick={() => setShowPreview(p => !p)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-500 transition-colors"
            >
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPreview ? 'Ẩn' : 'Xem'} preview
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="p-5 min-h-[300px] prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed bg-transparent p-0 m-0 border-none">
              {prompt || '(Prompt trống — Web Chat sẽ không hoạt động)'}
            </pre>
          </div>
        ) : (
          <textarea
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value);
              setCharCount(e.target.value.length);
            }}
            placeholder="Nhập system prompt cho ChatDVT Web Chat..."
            className="w-full min-h-[300px] p-5 text-sm text-slate-800 dark:text-slate-200 bg-transparent outline-none resize-y placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono leading-relaxed"
            spellCheck={false}
          />
        )}
      </div>

      <div className="bg-slate-100 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">💡 Hướng dẫn</h3>
        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <li>• Prompt này <strong>chỉ áp dụng cho widget chat trên web</strong>, không ảnh hưởng Discord bot.</li>
          <li>• Persona, quy tắc và danh mục route đều chỉ lấy từ ô này; backend không nối thêm prompt ẩn.</li>
          <li>• Prompt càng rõ ràng → AI trả lời càng đúng ý bạn.</li>
          <li>• Nên định nghĩa: tên bot, phong cách, ngôn ngữ, giới hạn.</li>
          <li>• Prompt này là nguồn cấu hình duy nhất; để trống thì Web Chat không thể hoạt động.</li>
          <li>• Thay đổi có hiệu lực ngay lập tức sau khi lưu (không cần restart).</li>
        </ul>
      </div>
    </div>
  );
};

export default WebChatPrompt;
