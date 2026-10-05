import type { ComponentType } from 'react';
import { stripLocalePrefix } from './shared/i18n';

const loaders = {
  '/': () => import('./site/pages/HomePage').then(module => module.HomePage),
  '/me': () => import('./site/pages/MePage').then(module => module.MePage),
  '/playground': () => import('./site/pages/PlaygroundPage').then(module => module.PlaygroundPage),
  '/discord': () => import('./site/pages/DiscordPage').then(module => module.DiscordPage),
  '/chat': () => import('./site/pages/ChatDVTChatPage').then(module => module.ChatDVTChatPage),
  '/blog': () => import('./site/pages/BlogPage').then(module => module.BlogPage),
};

export function loadPublicPage(pathname: string): Promise<ComponentType> {
  const base = stripLocalePrefix(pathname);
  if (base.startsWith('/blog/')) return import('./site/pages/BlogArticlePage').then(module => module.BlogArticlePage);
  const loader = loaders[base as keyof typeof loaders];
  if (!loader) throw new Error(`No public page loader for ${pathname}`);
  return loader();
}
