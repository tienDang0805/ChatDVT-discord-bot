import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

export type AppLocale = 'vi' | 'en';
export const APP_LANGUAGE_KEY = 'app_language';

export function localeFromPath(pathname: string): AppLocale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'vi';
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') return '/';
  return pathname.startsWith('/en/') ? pathname.slice(3) || '/' : pathname;
}

export function localizePath(path: string, locale: AppLocale): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const clean = stripLocalePrefix(path);
  return locale === 'en' ? (clean === '/' ? '/en' : `/en${clean}`) : clean;
}

const initialLocale = localeFromPath(typeof window === 'undefined' ? '/' : window.location.pathname);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'vi',
  supportedLngs: ['vi', 'en'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

if (typeof document !== 'undefined') document.documentElement.lang = initialLocale;

export default i18n;
