import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Facebook,
  MessageCircle,
  RotateCcw,
  Save,
  Settings2,
} from 'lucide-react';
import api from '../../../../shared/api';
import { useTranslation } from 'react-i18next';

const MAX_PROMPT_LENGTH = 50_000;

export const FacebookChatPrompt = () => {
  const { t, i18n } = useTranslation('admin');
  const isEn = i18n.resolvedLanguage === 'en';
  const [prompt, setPrompt] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [profileError, setProfileError] = useState('');

  const fetchPrompt = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await api.get('/facebook/prompt');
      const text = response.data.prompt || '';
      setPrompt(text);
      setOriginalPrompt(text);
      setUpdatedAt(response.data.updatedAt || null);
    } catch (error: any) {
      console.error('Failed to fetch Facebook prompt:', error);
      setLoadError(error.response?.data?.error || (isEn ? 'Unable to load the Facebook prompt.' : 'Không tải được Facebook prompt.'));
    } finally {
      setIsLoading(false);
    }
  }, [isEn]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const normalizedPrompt = prompt.trim();
  const hasChanges = prompt !== originalPrompt;
  const isTooLong = prompt.length > MAX_PROMPT_LENGTH;
  const canSave = hasChanges && normalizedPrompt.length > 0 && !isTooLong && !isSaving;

  const lastUpdatedLabel = useMemo(() => {
    if (!updatedAt) return isEn ? 'Never saved' : 'Chưa từng lưu';
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(updatedAt));
  }, [isEn, updatedAt]);

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);
    setSaveStatus('idle');
    setSaveError('');
    try {
      const response = await api.post('/facebook/prompt', { prompt: normalizedPrompt });
      const savedPrompt = response.data.prompt || normalizedPrompt;
      setPrompt(savedPrompt);
      setOriginalPrompt(savedPrompt);
      setUpdatedAt(response.data.updatedAt || new Date().toISOString());
      setSaveStatus('success');
      window.setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Failed to save Facebook prompt:', error);
      setSaveError(error.response?.data?.error || (isEn ? 'Unable to save the Facebook prompt.' : 'Không lưu được Facebook prompt.'));
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
    setSaveStatus('idle');
    setSaveError('');
  };

  const handleSetupProfile = async () => {
    setIsSettingUpProfile(true);
    setProfileStatus('idle');
    setProfileError('');
    try {
      await api.post('/facebook/setup-profile');
      setProfileStatus('success');
      window.setTimeout(() => setProfileStatus('idle'), 5000);
    } catch (error: any) {
      console.error('Failed to configure Messenger profile:', error);
      setProfileError(error.response?.data?.error || (isEn ? 'Unable to configure the Messenger menu.' : 'Không cấu hình được menu Messenger.'));
      setProfileStatus('error');
    } finally {
      setIsSettingUpProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-400">{isEn ? 'Loading Facebook prompt...' : 'Đang tải Facebook prompt...'}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={30} />
          <p className="font-semibold text-slate-900 dark:text-white">{loadError}</p>
          <button
            onClick={fetchPrompt}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            {isEn ? 'Try again' : 'Thử lại'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
            <Facebook size={25} className="text-blue-600" />
            {t('pages.facebook')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.facebookDesc')}
          </p>
          <p className="mt-1 text-xs text-slate-400">{isEn ? 'Updated' : 'Cập nhật'}: {lastUpdatedLabel}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-500">
              <CheckCircle2 size={16} /> {isEn ? 'Saved and applied' : 'Đã lưu và áp dụng'}
            </span>
          )}
          {profileStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-500">
              <CheckCircle2 size={16} /> {isEn ? 'Menu configured' : 'Đã cấu hình menu'}
            </span>
          )}
          <button
            onClick={handleSetupProfile}
            disabled={isSettingUpProfile}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Settings2 size={14} /> {isSettingUpProfile ? (isEn ? 'Configuring...' : 'Đang cấu hình...') : (isEn ? 'Configure FB menu' : 'Cấu hình menu FB')}
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-[#1f2937] dark:text-slate-400"
          >
            <RotateCcw size={14} /> {isEn ? 'Undo' : 'Hoàn tác'}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={14} /> {isSaving ? (isEn ? 'Saving...' : 'Đang lưu...') : (isEn ? 'Save Prompt' : 'Lưu Prompt')}
          </button>
        </div>
      </div>

      {(saveStatus === 'error' || isTooLong) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{isTooLong ? (isEn ? `Prompt exceeds the ${MAX_PROMPT_LENGTH.toLocaleString('en-US')} character limit.` : `Prompt vượt giới hạn ${MAX_PROMPT_LENGTH.toLocaleString('vi-VN')} ký tự.`) : saveError}</span>
        </div>
      )}

      {profileStatus === 'error' && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#131923]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/50 dark:bg-[#0d1117]/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Messenger System Prompt</span>
            {hasChanges && (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                {isEn ? 'Unsaved' : 'Chưa lưu'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={isTooLong ? 'text-xs text-red-500' : 'text-xs text-slate-400'}>
              {prompt.length.toLocaleString(isEn ? 'en-US' : 'vi-VN')} / {MAX_PROMPT_LENGTH.toLocaleString(isEn ? 'en-US' : 'vi-VN')}
            </span>
            <button
              onClick={() => setShowPreview(current => !current)}
              className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-blue-600"
            >
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPreview ? (isEn ? 'Hide' : 'Ẩn') : (isEn ? 'Show' : 'Xem')} preview
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="min-h-[420px] p-5">
            <pre className="m-0 whitespace-pre-wrap border-none bg-transparent p-0 font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {prompt || (isEn ? '(Empty prompt — the Messenger bot cannot respond)' : '(Prompt trống — bot Messenger sẽ không trả lời được)')}
            </pre>
          </div>
        ) : (
          <textarea
            value={prompt}
            onChange={event => {
              setPrompt(event.target.value);
              setSaveStatus('idle');
              setSaveError('');
            }}
            placeholder={isEn ? 'Enter the system prompt for ChatDVT on Facebook Messenger...' : 'Nhập system prompt cho ChatDVT trên Facebook Messenger...'}
            className="min-h-[420px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-600"
            spellCheck={false}
          />
        )}
      </div>

      <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
          <MessageCircle size={15} /> {isEn ? 'Current Messenger flow' : 'Flow Messenger đang dùng'}
        </h3>
        <ul className="space-y-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <li>• {isEn ? 'This prompt only applies to Facebook Messenger; Web Chat and Discord are unaffected.' : 'Prompt này chỉ áp dụng cho Facebook Messenger; Web Chat và Discord không bị ảnh hưởng.'}</li>
          <li>• {isEn ? 'The backend reads this prompt directly and applies it immediately without a server restart.' : 'Backend lấy prompt trực tiếp từ đây và áp dụng ngay, không cần restart server.'}</li>
          <li>• {isEn ? 'The bot uses the latest 10 turns, shows typing status, and sends bubbles with natural delays.' : 'Bot tự dùng lịch sử 10 lượt gần nhất, bật trạng thái đang nhập và gửi từng bong bóng có độ trễ tự nhiên.'}</li>
          <li>• {isEn ? <>Output is a JSON array with 1–3 items. Normal messages use strings; CTAs use objects with <code>text</code> and <code>button</code>.</> : <>Output là JSON array gồm 1–3 phần tử. Tin thường dùng chuỗi; CTA dùng object có <code>text</code> và <code>button</code>.</>}</li>
          <li>• {isEn ? <>Buttons only accept HTTPS URLs on <code>devtiendang.blog</code>. Website links in normal text are automatically split into separate bubbles.</> : <>Nút chỉ nhận URL HTTPS thuộc <code>devtiendang.blog</code>. Link website nằm trong câu thường sẽ tự được tách thành bong bóng riêng.</>}</li>
          <li>• {isEn ? <>Click <strong>Configure FB menu</strong> once after deployment to register the greeting, Get Started button, and Play Quiz menu with Meta.</> : <>Bấm <strong>Cấu hình menu FB</strong> một lần sau deploy để đăng ký lời chào, nút Bắt đầu và menu Chơi Quiz với Meta.</>}</li>
          <li>• {isEn ? <>Users can start a Quiz from the menu, a quick button, or by sending <code>quiz</code>; sessions last 30 minutes.</> : <>Người dùng có thể bắt đầu Quiz bằng menu, nút nhanh hoặc nhắn <code>quiz</code>; session tồn tại 30 phút.</>}</li>
          <li>• {isEn ? 'Messenger does not render Markdown; request short plain-text answers and mention devtiendang.blog only when relevant.' : 'Messenger không render Markdown; nên yêu cầu câu ngắn, plain text và chỉ giới thiệu devtiendang.blog khi đúng ngữ cảnh.'}</li>
          <li>• {isEn ? 'An empty prompt is blocked because the bot no longer includes a default system prompt in source code.' : 'Để trống bị chặn vì bot không còn chứa system prompt mặc định trong source code.'}</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookChatPrompt;
