import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Route, Routes } from 'react-router-dom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { resources } from './shared/i18n/resources';
import { localeFromPath, stripLocalePrefix } from './shared/i18n';
import { LanguageProvider } from './shared/i18n/LanguageContext';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import { AppShell } from './shared/components/AppShell';
import { PageMetaCollector, type CollectedPageMeta } from './shared/contexts/PageMetaCollector';
import { PublicPageDataContext, type PublicPageData } from './shared/contexts/PublicPageData';
import { HomePage } from './site/pages/HomePage';
import { MePage } from './site/pages/MePage';
import { PlaygroundPage } from './site/pages/PlaygroundPage';
import { DiscordPage } from './site/pages/DiscordPage';
import { ChatDVTChatPage } from './site/pages/ChatDVTChatPage';
import { BlogPage } from './site/pages/BlogPage';
import { BlogArticlePage } from './site/pages/BlogArticlePage';
export { DEFAULT_BLOG_POST } from './shared/data/defaultBlogPost';

const pages = {
  '/': HomePage, '/me': MePage, '/playground': PlaygroundPage,
  '/discord': DiscordPage, '/chat': ChatDVTChatPage, '/blog': BlogPage,
};

export function canRenderPage(pathname: string): boolean {
  const base = stripLocalePrefix(pathname);
  return base in pages || /^\/blog\/[^/]+$/.test(base);
}

export function renderPage(url: string, data?: PublicPageData) {
  const pathname = new URL(url, 'https://devtiendang.blog').pathname;
  const base = stripLocalePrefix(pathname);
  const Page = pages[base as keyof typeof pages] || BlogArticlePage;
  // Requests for VI and EN must never share a mutable translation instance.
  const i18n = createInstance();
  void i18n.init({ resources, lng: localeFromPath(pathname), fallbackLng: 'vi', defaultNS: 'common',
    initAsync: false, interpolation: { escapeValue: false }, react: { useSuspense: false } });
  let meta: CollectedPageMeta | undefined;
  const html = renderToString(
    <I18nextProvider i18n={i18n}><StaticRouter location={url}>
      <LanguageProvider><ThemeProvider><PublicPageDataContext.Provider value={data || null}>
        <PageMetaCollector.Provider value={value => { meta = value; }}>
          <AppShell><Suspense fallback={null}><Routes>
            <Route path={base.startsWith('/blog/') ? (pathname.startsWith('/en/') ? '/en/blog/:slug' : '/blog/:slug') : pathname} element={<Page />} />
          </Routes></Suspense></AppShell>
        </PageMetaCollector.Provider>
      </PublicPageDataContext.Provider></ThemeProvider></LanguageProvider>
    </StaticRouter></I18nextProvider>,
  );
  if (!meta || html.includes('<!--$!-->')) throw new Error(`Public rendering did not finish for ${pathname}`);
  return { html, meta };
}
