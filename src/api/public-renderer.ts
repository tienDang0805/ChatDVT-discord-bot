import fs from 'fs';
import path from 'path';
import type { RequestHandler } from 'express';
import { prisma } from '../database/prisma';
import { injectSeoMeta, type RouteMeta } from './seo';
import type { BlogPost, BlogPostSummary } from '../shared/blogTypes';
import type { BlogPost as DatabaseBlogPost } from '@prisma/client';

export const RENDERER_DIRECTORY = path.resolve(__dirname, '../../dist/seo');

interface PublicData {
  pathname: string;
  posts?: BlogPostSummary[];
  post?: BlogPost | null;
}
interface Renderer {
  DEFAULT_BLOG_POST: BlogPost;
  canRenderPage: (pathname: string) => boolean;
  renderPage: (url: string, data?: PublicData) => { html: string; meta: RouteMeta };
}

function serializePost<T extends Omit<DatabaseBlogPost, 'content'>>(post: T) {
  return { ...post, status: 'published' as const,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() };
}

export function loadPublicRenderer(): Renderer {
  return require(path.join(RENDERER_DIRECTORY, 'renderer.cjs'));
}

export function readClientTemplate(buildPath: string): string {
  const shell = path.resolve(buildPath, '../../dist/seo/app-shell.html');
  return fs.readFileSync(fs.existsSync(shell) ? shell : path.join(buildPath, 'index.html'), 'utf8');
}

export function renderPublicHtml(template: string, url: string, data?: PublicData): string {
  const renderer = loadPublicRenderer();
  const pathname = new URL(url, 'https://devtiendang.blog').pathname;
  const rendered = renderer.renderPage(url, data);
  let html = injectSeoMeta(template, pathname, rendered.meta);
  // Render the same visible page for visitors and crawlers. No bot detection.
  html = html.replace('<html lang=', '<html class="dark" lang=');
  html = html.replace(/\s*<noscript>[\s\S]*?<\/noscript>/g, '');
  html = html.replace('<div id="root"></div>', () => `<div id="root" data-ssr="true">${rendered.html}</div>`);
  if (data) {
    // Embedded JSON is data, never executable HTML (including titles containing </script>).
    const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    html = html.replace('</body>', () => `<script id="public-page-data" type="application/json">${json}</script>\n</body>`);
  }
  return html;
}

export function createPublicPageHandler(buildPath: string): RequestHandler {
  const template = readClientTemplate(buildPath);
  const renderer = loadPublicRenderer();
  return async (req, res, next) => {
    if (!renderer.canRenderPage(req.path)) return next();
    // Discord embedded activities use the SPA entry, not the portfolio homepage.
    if (req.path === '/' && ('frame_id' in req.query || 'instance_id' in req.query)) {
      return res.type('html').set('Cache-Control', 'no-cache, max-age=0, must-revalidate')
        .set('X-Robots-Tag', 'noindex, nofollow').send(injectSeoMeta(template, '/activity'));
    }
    const basePath = req.path.replace(/^\/en(?=\/|$)/, '') || '/';
    let data: PublicData | undefined;
    let status = 200;
    try {
      if (basePath === '/blog') {
        const posts = await prisma.blogPost.findMany({
          where: { status: 'published' }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          select: { id: true, title: true, slug: true, excerpt: true, status: true,
            readingMinutes: true, publishedAt: true, createdAt: true, updatedAt: true },
        });
        const { content: _content, ...defaultSummary } = renderer.DEFAULT_BLOG_POST;
        data = { pathname: req.path, posts: posts.some(post => post.slug === renderer.DEFAULT_BLOG_POST.slug)
          ? posts.map(serializePost) : [...posts.map(serializePost), defaultSummary] };
      } else if (basePath.startsWith('/blog/')) {
        const slug = basePath.slice('/blog/'.length);
        const post = await prisma.blogPost.findFirst({ where: { slug, status: 'published' } });
        data = { pathname: req.path, post: post ? serializePost(post) : (slug === renderer.DEFAULT_BLOG_POST.slug ? renderer.DEFAULT_BLOG_POST : null) };
        if (!data.post) status = 404;
      }
      const html = renderPublicHtml(template, req.originalUrl, data);
      res.type('html').set('Cache-Control', status >= 400 ? 'no-store' : 'no-cache, max-age=0, must-revalidate');
      if (status >= 400 || req.path === '/en/blog' || req.path.startsWith('/en/blog/')) res.set('X-Robots-Tag', 'noindex, nofollow');
      return res.status(status).send(html);
    } catch (error) {
      console.error(`[SEO] Public rendering failed for ${req.path}:`, error);
      res.set('Cache-Control', 'no-store').set('X-Robots-Tag', 'noindex, nofollow');
      return res.status(503).type('html').send('<!doctype html><html lang="vi"><head><meta name="robots" content="noindex"><title>Tạm thời không thể tải trang</title></head><body><h1>Tạm thời không thể tải trang</h1><p>Vui lòng thử lại sau.</p></body></html>');
    }
  };
}
