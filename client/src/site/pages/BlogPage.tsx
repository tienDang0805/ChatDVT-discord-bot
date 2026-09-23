import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublishedBlogPosts } from '../../shared/api';
import { DEFAULT_BLOG_POST } from '../../shared/data/defaultBlogPost';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import type { BlogPostSummary } from '../../shared/types/blog';
import { SiteLayout } from '../components/SiteLayout';

function formatDate(value: string | null): string {
  if (!value) return 'Bản nháp';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(value))
    .replaceAll('/', '.');
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([DEFAULT_BLOG_POST]);
  usePageMeta('Blog — Tiến Đặng', 'Mấy bài mình viết lại trong lúc làm mobile, ChatDVT và các project cá nhân.');
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
        <h1>Viết lại cho khỏi quên</h1>
        <p className="page-hero__aside">Chuyện làm app, làm bot và mấy lần tự mò rồi vỡ ra được một thứ gì đó.</p>
      </div></div>
    </section>

    <section className="site-container blog-index">
      <p className="blog-index__count">{String(posts.length).padStart(2, '0')} bài viết</p>
      {posts.map((post) => <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
        <div className="blog-card__meta"><span>{post.slug === DEFAULT_BLOG_POST.slug ? 'ChatDVT · Phần 1' : 'Ghi chép'}</span><span><Clock size={13} /> {post.readingMinutes} phút đọc</span></div>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <div className="blog-card__footer"><time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time><span>Đọc bài <ArrowUpRight size={16} /></span></div>
      </Link>)}
    </section>
  </SiteLayout>;
}
