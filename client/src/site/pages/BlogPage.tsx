import { usePublicPageData } from '../../shared/contexts/PublicPageData';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedBlogPosts } from '../../shared/api';
import { DEFAULT_BLOG_POST } from '../../shared/data/defaultBlogPost';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import type { BlogPostSummary } from '../../shared/types/blog';
import { SiteLayout } from '../components/SiteLayout';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { Mascot } from '../components/Mascot';

function formatDate(value: string | null, locale: 'vi' | 'en', draft: string): string {
  if (!value) return draft;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
    .format(new Date(value))
    .replaceAll('/', '.');
}

export function BlogPage() {
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const initialData = usePublicPageData();
  const initialPosts = initialData?.posts;
  const [posts, setPosts] = useState<BlogPostSummary[]>(initialPosts || [DEFAULT_BLOG_POST]);
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
      .catch(() => { /* Keep the server-rendered list during a temporary API failure. */ });
  }, []);

  return <SiteLayout><section className="hybrid-view hybrid-a selected-blog"><div className="page-shell">
    <div className="page-opening blog-opening"><div><p className="eyebrow">BLOG / {locale === 'en' ? 'TIẾN’S NOTES' : 'GHI CHÉP CỦA TIẾN'}</p><h1>{locale === 'en' ? <>Code done.<br /><em>A story to tell.</em></> : <>Code xong.<br /><em>Kể một chút.</em></>}</h1><p>{locale === 'en' ? 'Things I learned and stories behind a side project.' : 'Mấy thứ mình học được khi làm app, làm bot và tự mò side project.'}</p></div><div className="blog-circle story-scene"><Mascot character="tien" size={185} action="coffee" /><span>{locale === 'en' ? 'A real story to start with.' : 'Ghi lại cho khỏi quên.'}</span></div></div>
    <p className="blog-count">{t('blog.posts', { count: posts.length })}{locale === 'en' && ' · Articles keep their authored language.'}</p>
    {posts.map((post, index) => <article className="blog-feature" key={post.slug}><div className="article-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}<span>{post.slug === DEFAULT_BLOG_POST.slug ? <>CHATDVT<br />{locale === 'en' ? 'PART 1' : 'PHẦN 1'}</> : (locale === 'en' ? 'NOTES' : 'GHI CHÉP')}</span></div><div className="blog-feature-copy"><p className="eyebrow"><time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt, locale, t('blog.draft'))}</time> · {t('blog.minuteRead', { count: post.readingMinutes })}</p><h2><Link to={pathFor('/blog/' + post.slug)}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="button blue" to={pathFor('/blog/' + post.slug)}>{t('blog.read')} ↗</Link></div></article>)}

  </div></section></SiteLayout>;
}
