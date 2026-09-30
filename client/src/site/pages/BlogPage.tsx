import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublishedBlogPosts } from '../../shared/api';
import { DEFAULT_BLOG_POST } from '../../shared/data/defaultBlogPost';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import type { BlogPostSummary } from '../../shared/types/blog';
import { SiteLayout } from '../components/SiteLayout';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';

function formatDate(value: string | null, locale: 'vi' | 'en', draft: string): string {
  if (!value) return draft;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(value))
    .replaceAll('/', '.');
}

export function BlogPage() {
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const [posts, setPosts] = useState<BlogPostSummary[]>([DEFAULT_BLOG_POST]);
  usePageMeta('Blog về mobile, bot và side project | Tiến Đặng', {
    description: 'Mấy bài mình viết lại trong lúc làm mobile, ChatDVT và các project cá nhân.',
    keywords: 'blog mobile developer, React Native, Android, ChatDVT, Discord bot, side project, Tiến Đặng',
    schema: 'blog',
  });
  usePageTracker('Blog');

  useEffect(() => {
    getPublishedBlogPosts()
      .then((data) => {
        const hasDefaultPost = data.some((post) => post.slug === DEFAULT_BLOG_POST.slug);
        setPosts(hasDefaultPost ? data : [...data, DEFAULT_BLOG_POST]);
      })
      .catch(() => setPosts([DEFAULT_BLOG_POST]));
  }, []);

  return <SiteLayout>
    <section className="page-hero blog-hero">
      <div className="site-container page-hero__grid"><div>
        <p className="site-kicker">Blog</p>
        <h1>{t('blog.title')}</h1>
        <p className="page-hero__aside">{t('blog.intro')}</p>
      </div></div>
    </section>

    <section className="site-container blog-index">
      <p className="blog-index__count">{t('blog.posts', { count: posts.length })}</p>
      {posts.map((post) => <Link key={post.slug} to={pathFor(`/blog/${post.slug}`)} className="blog-card">
        <div className="blog-card__meta"><span>{post.slug === DEFAULT_BLOG_POST.slug ? 'ChatDVT · 01' : t('blog.notes')}</span><span><Clock size={13} /> {t('blog.minuteRead', { count: post.readingMinutes })}</span></div>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <div className="blog-card__footer"><time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt, locale, t('blog.draft'))}</time><span>{t('blog.read')} <ArrowUpRight size={16} /></span></div>
      </Link>)}
    </section>
  </SiteLayout>;
}
