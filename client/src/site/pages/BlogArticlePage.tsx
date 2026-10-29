import { usePublicPageData } from '../../shared/contexts/PublicPageData';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getPublishedBlogPost } from '../../shared/api';
import { DEFAULT_BLOG_POST } from '../../shared/data/defaultBlogPost';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { getBlogCategoryMeta, type BlogPost } from '../../shared/types/blog';
import { sanitizeBlogHtml } from '../../shared/utils/sanitizeBlogHtml';
import { enhanceBlogCodeBlocks } from '../../shared/utils/blogCodeHighlight';
import { SiteLayout } from '../components/SiteLayout';
import { BlogArticleSkeleton } from '../components/SiteLoadingFallback';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { CHATDVT_HISTORY_PATH, CHATDVT_HISTORY_DESCRIPTION } from '../../../../src/shared/chatdvt';

function formatDate(value: string | null, locale: 'vi' | 'en'): string {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
    .format(new Date(value))
    .replaceAll('/', '.');
}

function copyTextFallback(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function BlogArticlePage() {
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const { slug = '' } = useParams();
  const initialData = usePublicPageData();
  const initialPost = initialData?.pathname.replace(/^\/en(?=\/|$)/, '') === `/blog/${slug}` ? initialData.post : undefined;
  const fallback = slug === DEFAULT_BLOG_POST.slug ? DEFAULT_BLOG_POST : null;
  const [post, setPost] = useState<BlogPost | null>(initialPost === undefined ? fallback : initialPost);
  const [loading, setLoading] = useState(initialPost === undefined);
  const copyTimers = useRef<Map<HTMLButtonElement, number>>(new Map());

  const safeContent = useMemo(
    () => (post ? enhanceBlogCodeBlocks(sanitizeBlogHtml(post.content), locale) : ''),
    [post, locale]
  );
  const firstImage = useMemo(() => post?.content.match(/<img[^>]+src="((?:https?:\/\/|\/)[^"]+)"/i)?.[1], [post?.content]);
  const isChatDvtHistory = !!post && `/blog/${post.slug}` === CHATDVT_HISTORY_PATH;

  usePageMeta(post?.title || 'Bài viết — Tiến Đặng', {
    description: isChatDvtHistory ? CHATDVT_HISTORY_DESCRIPTION : post?.excerpt || 'Bài viết trên devtiendang.blog.',
    image: firstImage,
    type: 'article',
    schema: 'article',
    noIndex: !post && !loading,
    publishedTime: post?.publishedAt,
    modifiedTime: post?.updatedAt,
  });
  usePageTracker(`BlogArticle:${slug}`);

  useEffect(() => {
    const timers = copyTimers.current;
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (initialPost !== undefined) {
      setPost(initialPost);
      setLoading(false);
      return;
    }
    let alive = true;
    setPost(fallback);
    setLoading(true);
    getPublishedBlogPost(slug)
      .then(value => { if (alive) setPost(value); })
      .catch(() => { if (alive) setPost(fallback); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug, initialPost, fallback]);

  const handleProseClick = useCallback(
    async (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>('button[data-copy-code]');
      if (!button) return;

      const frame = button.closest('.blog-code-frame');
      const codeEl = frame?.querySelector('pre code') || frame?.querySelector('pre');
      const rawText = codeEl?.textContent || '';
      if (!rawText) return;

      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(rawText);
          copied = true;
        } catch {
          copied = copyTextFallback(rawText);
        }
      } else {
        copied = copyTextFallback(rawText);
      }

      if (!copied) return;

      const labelEl = button.querySelector('.blog-code-copy__text');
      button.setAttribute('data-copied', 'true');
      if (labelEl) labelEl.textContent = locale === 'en' ? 'Copied' : 'Đã chép';

      const prevTimer = copyTimers.current.get(button);
      if (prevTimer) window.clearTimeout(prevTimer);

      const timerId = window.setTimeout(() => {
        button.removeAttribute('data-copied');
        if (labelEl) labelEl.textContent = 'Copy';
        copyTimers.current.delete(button);
      }, 2000);
      copyTimers.current.set(button, timerId);
    },
    [locale]
  );

  if (loading && !post) {
    return <SiteLayout><div className="site-skeleton"><p role="status" className="sr-only">{t('blog.loading')}</p><div aria-hidden="true" aria-busy="true"><BlogArticleSkeleton /></div></div></SiteLayout>;
  }

  if (!post) {
    return <SiteLayout><div className="site-container blog-state"><p className="site-kicker">404</p><h1>{t('blog.notFound')}</h1><Link to={pathFor('/blog')}>{t('blog.back')}</Link></div></SiteLayout>;
  }

  const publishedDate = formatDate(post.publishedAt, locale);
  const categoryMeta = getBlogCategoryMeta(post.category, post);

  return <SiteLayout>
    <article className="site-container blog-article selected-article">
      <header className="blog-article__header">
        <p className="site-kicker blog-article__eyebrow">
          <Link to={pathFor('/blog')}>BLOG</Link>
          <span aria-hidden="true">/</span>
          <Link to={pathFor(`/blog?category=${categoryMeta.id}`)}>{post.slug === DEFAULT_BLOG_POST.slug ? `${categoryMeta.shortBadge[locale]} · CHATDVT 01` : categoryMeta.shortBadge[locale]}</Link>
        </p>
        <h1>{post.title}</h1>
        <div className="blog-article__meta">
          <Link to={pathFor('/me')} className="blog-article__author">
            <img src="/images/tien-dang-profile.jpg" alt="Đặng Văn Tiến" width={38} height={38} loading="eager" decoding="async" />
            <div>
              <strong>Đặng Văn Tiến</strong>
              <span>Mobile Developer</span>
            </div>
          </Link>
          <div className="blog-article__stats">
            {publishedDate && <time dateTime={post.publishedAt || undefined}>{publishedDate}</time>}
            {publishedDate && <span aria-hidden="true">·</span>}
            <span><Clock size={13} /> {t('blog.minuteRead', { count: post.readingMinutes })}</span>
          </div>
        </div>
      </header>
      <div className="blog-prose" onClick={handleProseClick} dangerouslySetInnerHTML={{ __html: safeContent }} />
      <footer className="blog-article__footer">
        <span>{isChatDvtHistory ? 'ChatDVT · 01' : 'devtiendang.blog'}</span>
        <div className="blog-article__footer-links">
          {isChatDvtHistory && <>
            <Link to={pathFor('/discord')}>{locale === 'en' ? 'Explore ChatDVT' : 'Xem ChatDVT'} ↗</Link>
            <Link to={pathFor('/me')}>Đặng Văn Tiến ↗</Link>
          </>}
          <Link className="blog-article__more" to={pathFor('/blog')}>{t('blog.more')} ↗</Link>
        </div>
      </footer>
    </article>
  </SiteLayout>;
}
