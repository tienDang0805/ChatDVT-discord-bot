import { useLanguage } from '../i18n/LanguageContext';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, changeLocale } = useLanguage();
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800 ${compact ? 'h-9' : ''}`}
      role="group"
      aria-label={locale === 'vi' ? 'Chọn ngôn ngữ' : 'Choose language'}
    >
      {(['vi', 'en'] as const).map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => changeLocale(language)}
          aria-pressed={locale === language}
          className={`rounded-md px-2 py-1 text-[11px] font-black tracking-wide transition-colors ${
            locale === language
              ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400'
              : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200'
          }`}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
