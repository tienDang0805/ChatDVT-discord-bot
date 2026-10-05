export type SiteLoadingView = 'home' | 'playground' | 'discord' | 'chat' | 'blog' | 'article' | 'me' | 'ecosystem';

// Match portfolio routes only; /english and Discord activities are separate apps.
export function siteLoadingView(pathname: string): SiteLoadingView | null {
  const path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  if (path === '/') return 'home';
  if (/^\/blog\/[^/]+\/?$/.test(path)) return 'article';
  if (path === '/mobile') return 'playground';
  if (path === '/chatDVT') return 'discord';
  const views: Record<string, SiteLoadingView> = {
    '/playground': 'playground', '/discord': 'discord', '/chat': 'chat',
    '/blog': 'blog', '/me': 'me', '/ecosystem': 'ecosystem',
  };
  return views[path] ?? null;
}
