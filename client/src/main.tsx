import React, { type ComponentType } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './site/styles/index.css'
import { PublicPageDataContext } from './shared/contexts/PublicPageData';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import './shared/i18n';
import { LanguageProvider } from './shared/i18n/LanguageContext';

const root = document.getElementById('root')!;
const bootstrap = document.getElementById('public-page-data');
const pageData = bootstrap ? JSON.parse(bootstrap.textContent || 'null') : null;
function app(initialPage?: { pathname: string; Component: ComponentType }) {
  return (
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <PublicPageDataContext.Provider value={pageData}><App initialPage={initialPage} /></PublicPageDataContext.Provider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
  );
}
async function mount() {
  if (root.dataset.ssr !== 'true') {
    ReactDOM.createRoot(root).render(app());
    return;
  }
  try {
    const { loadPublicPage } = await import('./loadPublicPage');
    const Component = await loadPublicPage(window.location.pathname);
    // Hydrate with the page already available, before preferences update contexts.
    ReactDOM.hydrateRoot(root, app({ pathname: window.location.pathname, Component }));
  } catch (error) {
    // A blocked/missing JS chunk must not replace readable server HTML with an error screen.
    console.error('Public page hydration failed:', error);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'site-hydration-retry';
    retry.textContent = window.location.pathname.startsWith('/en')
      ? 'Interactive features could not load. Reload page.' : 'Chưa tải được tính năng tương tác. Bấm để tải lại.';
    retry.addEventListener('click', () => window.location.reload());
    root.before(retry);
  }
}
void mount();
