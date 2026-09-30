import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../../../shared/api';
import type { AppLocale } from '../../../../shared/i18n';

type PromptMap = Record<AppLocale, string>;
const EMPTY_PROMPTS: PromptMap = { vi: '', en: '' };

export const WebChatPrompt = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const [activeLocale, setActiveLocale] = useState<AppLocale>('vi');
  const [prompts, setPrompts] = useState<PromptMap>(EMPTY_PROMPTS);
  const [originals, setOriginals] = useState<PromptMap>(EMPTY_PROMPTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/web-chat/prompts');
      const next: PromptMap = { vi: res.data.prompts?.vi || '', en: res.data.prompts?.en || '' };
      setPrompts(next);
      setOriginals(next);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPrompts(); }, [fetchPrompts]);
  const prompt = prompts[activeLocale];
  const hasChanges = prompt !== originals[activeLocale];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await api.post(`/web-chat/prompts/${activeLocale}`, { prompt });
      setOriginals((current) => ({ ...current, [activeLocale]: prompt }));
      setSaveStatus('success');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (isLoading) return <div className="flex min-h-[400px] items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-3 border-orange-500 border-t-transparent" /><p className="text-sm text-slate-400">{t('loading', { ns: 'common' })}</p></div></div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white"><Sparkles size={24} className="text-orange-500" />{t('webPrompt.title')}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('webPrompt.description')}</p></div>
      <div className="flex items-center gap-2">
        {saveStatus === 'success' && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-500"><CheckCircle2 size={16} />{t('webPrompt.saved')}</span>}
        {saveStatus === 'error' && <span className="flex items-center gap-1.5 text-sm font-medium text-red-500"><AlertCircle size={16} />{t('webPrompt.saveError')}</span>}
        <button onClick={() => setPrompts((current) => ({ ...current, [activeLocale]: originals[activeLocale] }))} disabled={!hasChanges} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:bg-[#1f2937] dark:text-slate-400"><RotateCcw size={14} />{t('reset', { ns: 'common' })}</button>
        <button onClick={() => void handleSave()} disabled={!hasChanges || isSaving || !prompt.trim()} className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"><Save size={14} />{isSaving ? t('saving', { ns: 'common' }) : t('webPrompt.savePrompt')}</button>
      </div>
    </div>

    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-[#0d1117]">
      {(['vi', 'en'] as const).map((locale) => <button key={locale} onClick={() => { setActiveLocale(locale); setSaveStatus('idle'); }} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeLocale === locale ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-800 dark:text-orange-400' : 'text-slate-500'}`}>{locale === 'vi' ? t('webPrompt.viTab') : t('webPrompt.enTab')}{!prompts[locale].trim() && <span className="ml-2 text-amber-500">●</span>}</button>)}
    </div>

    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#131923]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/50 dark:bg-[#0d1117]/50">
        <div className="flex items-center gap-3"><span className="text-xs font-bold uppercase tracking-widest text-orange-500">System Prompt · {activeLocale.toUpperCase()}</span>{hasChanges && <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">{t('webPrompt.unsaved')}</span>}</div>
        <div className="flex items-center gap-3"><span className="text-xs text-slate-400">{t('webPrompt.characters', { count: prompt.length })}</span><button onClick={() => setShowPreview((value) => !value)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-500">{showPreview ? <EyeOff size={13} /> : <Eye size={13} />}{showPreview ? t('webPrompt.hide') : t('webPrompt.show')} {t('webPrompt.preview')}</button></div>
      </div>
      {showPreview ? <div className="min-h-[300px] p-5"><pre className="m-0 whitespace-pre-wrap border-none bg-transparent p-0 font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">{prompt || t('webPrompt.empty')}</pre></div> : <textarea value={prompt} onChange={(event) => setPrompts((current) => ({ ...current, [activeLocale]: event.target.value }))} placeholder={t('webPrompt.placeholder')} className="min-h-[300px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed text-slate-800 outline-none dark:text-slate-200" spellCheck={activeLocale === 'en'} lang={activeLocale} />}
    </div>

    <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-[#0d1117]"><h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{t('webPrompt.guide')}</h3><ul className="space-y-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400"><li>• {t('webPrompt.guide1')}</li><li>• {t('webPrompt.guide2')}</li><li>• {t('webPrompt.guide3')}</li><li>• UI: {i18n.resolvedLanguage?.toUpperCase()} · Prompt: {activeLocale.toUpperCase()}</li></ul></div>
  </div>;
};

export default WebChatPrompt;
