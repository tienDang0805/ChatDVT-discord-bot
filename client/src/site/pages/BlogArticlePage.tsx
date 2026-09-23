import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getPublishedBlogPost } from '../../shared/api';
import { DEFAULT_BLOG_POST } from '../../shared/data/defaultBlogPost';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import type { BlogPost } from '../../shared/types/blog';
import { sanitizeBlogHtml } from '../../shared/utils/sanitizeBlogHtml';
import { SiteLayout } from '../components/SiteLayout';

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(value))
    .replaceAll('/', '.');
}

export function BlogArticlePage() {
  const { slug = '' } = useParams();
  const fallback = slug === DEFAULT_BLOG_POST.slug ? DEFAULT_BLOG_POST : null;
  const [post, setPost] = useState<BlogPost | null>(fallback);
  const [loading, setLoading] = useState(true);
  const safeContent = useMemo(() => post ? sanitizeBlogHtml(post.content) : '', [post]);
  usePageMeta(post?.title || 'Bài viết — Tiến Đặng', {
    description: post?.excerpt || 'Bài viết trên devtiendang.blog.',
    type: 'article',
    schema: 'article',
    noIndex: !post && !loading,
    publishedTime: post?.publishedAt,
    modifiedTime: post?.updatedAt,
  });
  usePageTracker(`BlogArticle:${slug}`);

  useEffect(() => {
    setLoading(true);
    getPublishedBlogPost(slug)
      .then(setPost)
      .catch(() => setPost(fallback))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading && !post) {
    return <SiteLayout><div className="site-container blog-state">Đang tải bài viết...</div></SiteLayout>;
  }

  if (!post) {
    return <SiteLayout><div className="site-container blog-state"><p className="site-kicker">404</p><h1>Không tìm thấy bài viết</h1><Link to="/blog">Quay lại Blog</Link></div></SiteLayout>;
  }

  return <SiteLayout>
    <article className="site-container blog-article">
      <Link to="/blog" className="blog-back"><ArrowLeft size={15} /> Blog</Link>
      <header className="blog-article__header">
        <p className="site-kicker">{post.slug === DEFAULT_BLOG_POST.slug ? 'ChatDVT · Phần 1' : 'Ghi chép'}</p>
        <h1>{post.title}</h1>
        <div className="blog-article__meta"><time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time><span><Clock size={14} /> {post.readingMinutes} phút đọc</span></div>
      </header>
      <div className="blog-prose" dangerouslySetInnerHTML={{ __html: safeContent }} />
      <footer className="blog-article__footer"><span>{post.slug === DEFAULT_BLOG_POST.slug ? 'ChatDVT · Phần 1' : 'devtiendang.blog'}</span><Link to="/blog">Xem các bài khác</Link></footer>
    </article>
  </SiteLayout>;
}
