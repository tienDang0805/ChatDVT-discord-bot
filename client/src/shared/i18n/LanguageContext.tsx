import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n, { APP_LANGUAGE_KEY, type AppLocale, localeFromPath, localizePath } from './index';

interface LanguageContextValue {
  locale: AppLocale;
  changeLocale: (locale: AppLocale) => void;
  pathFor: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname === '/login' || location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const [adminLocale, setAdminLocale] = useState<AppLocale>(() => localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'vi');
  const locale = isAdmin ? adminLocale : localeFromPath(location.pathname);

  useEffect(() => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    localStorage.setItem(APP_LANGUAGE_KEY, locale);
  }, [locale]);

  const changeLocale = useCallback((next: AppLocale) => {
    localStorage.setItem(APP_LANGUAGE_KEY, next);
    if (isAdmin) {
      setAdminLocale(next);
      void i18n.changeLanguage(next);
      document.documentElement.lang = next;
      window.dispatchEvent(new CustomEvent('app-language-changed', { detail: next }));
      return;
    }
    navigate(`${localizePath(location.pathname, next)}${location.search}${location.hash}`);
  }, [isAdmin, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const sync = () => {
      const next = localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'vi';
      setAdminLocale(next);
      void i18n.changeLanguage(next);
    };
    window.addEventListener('app-language-changed', sync);
    return () => window.removeEventListener('app-language-changed', sync);
  }, [isAdmin]);

  const value = useMemo(() => ({ locale, changeLocale, pathFor: (path: string) => localizePath(path, locale) }), [changeLocale, locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
