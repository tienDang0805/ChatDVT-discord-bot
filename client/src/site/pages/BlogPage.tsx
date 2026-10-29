import { usePublicPageData } from '../../shared/contexts/PublicPageData';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPublishedBlogPosts } from '../../shared/api';
import { BLOG_COVER_IMAGES, DEFAULT_BLOG_POST, FALLBACK_BLOG_SUMMARIES } from '../../shared/data/defaultBlogPost';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import {
  BLOG_CATEGORIES,
  getBlogCategoryMeta,
  inferBlogCategory,
  isBlogCategoryId,
  type BlogCategoryId,
  type BlogPostSummary,
} from '../../shared/types/blog';
import { PageIntro } from '../components/PageIntro';
import { SiteLayout } from '../components/SiteLayout';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { Mascot } from '../components/Mascot';

function formatDate(value: string | null, locale: 'vi' | 'en', draft: string): string {
  if (!value) return draft;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
    .format(new Date(value))
    .replaceAll('/', '.');
}

export function BlogPage() {
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const en = locale === 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get('category');
  const activeCategory: 'all' | BlogCategoryId = isBlogCategoryId(rawCategory) ? rawCategory : 'all';

  const initialData = usePublicPageData();
  const initialPosts = initialData?.posts;
  const [posts, setPosts] = useState<BlogPostSummary[]>(initialPosts || FALLBACK_BLOG_SUMMARIES);

  usePageMeta(en ? 'Mobile, bots and side projects — Tiến’s blog' : 'Blog về mobile, bot và side project | Tiến Đặng', {
    description: en
      ? 'Notes from building mobile apps, AI agents, ChatDVT and personal projects.'
      : 'Ghi chép theo chủ đề Kể chuyện, Mobile, AI và Side Project của Tiến Đặng.',
    keywords: 'blog mobile developer, AI Agent, MCP, React Native, Android, ChatDVT, Discord bot, side project, Tiến Đặng',
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

  const postsByCategory = useMemo(() => {
    const map: Record<BlogCategoryId, BlogPostSummary[]> = {
      story: [],
      mobile: [],
      ai: [],
      'side-project': [],
    };
    for (const post of posts) {
      const cat = inferBlogCategory(post);
      map[cat].push(post);
    }
    return map;
  }, [posts]);

  const orderedCategories = useMemo(() => {
    const withPosts = BLOG_CATEGORIES.filter((cat) => postsByCategory[cat.id].length > 0).sort((a, b) => {
      const aTop = postsByCategory[a.id][0]?.publishedAt || '';
      const bTop = postsByCategory[b.id][0]?.publishedAt || '';
      return bTop.localeCompare(aTop);
    });
    const empty = BLOG_CATEGORIES.filter((cat) => postsByCategory[cat.id].length === 0);
    return { withPosts, empty };
  }, [postsByCategory]);

  const selectCategory = (cat: 'all' | BlogCategoryId) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'all') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next, { replace: true });
  };

  const renderArticleCard = (post: BlogPostSummary, index: number) => {
    const catMeta = getBlogCategoryMeta(post.category, post);
    return (
      <article className="blog-feature" key={post.slug} data-blog-category={catMeta.id}>
        <div className="article-number" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
          <span>
            {post.slug === DEFAULT_BLOG_POST.slug ? (
              <>
                CHATDVT
                <br />
                {en ? 'PART 1' : 'PHẦN 1'}
              </>
            ) : (
              catMeta.shortBadge[locale]
            )}
          </span>
        </div>
        <div className="blog-feature-copy">
          <p className="eyebrow">
            <button
              type="button"
              className="blog-inline-category"
              onClick={() => selectCategory(catMeta.id)}
            >
              {catMeta.label[locale]}
            </button>
            <span aria-hidden="true"> · </span>
            <time dateTime={post.publishedAt || undefined}>
              {formatDate(post.publishedAt, locale, t('blog.draft'))}
            </time>
            <span aria-hidden="true"> · </span>
            <span>{t('blog.minuteRead', { count: post.readingMinutes })}</span>
          </p>
          <h2>
            <Link to={pathFor('/blog/' + post.slug)}>{post.title}</Link>
          </h2>
          <p>{post.excerpt}</p>
          <Link className="button blue" to={pathFor('/blog/' + post.slug)}>
            {t('blog.read')} ↗
          </Link>
        </div>
      </article>
    );
  };

  const selectedCategoryMeta = activeCategory === 'all' ? null : getBlogCategoryMeta(activeCategory);
  const selectedCategoryPosts = activeCategory === 'all' ? posts : postsByCategory[activeCategory];

  return (
    <SiteLayout>
      <section className="hybrid-view hybrid-a selected-blog">
        <div className="page-shell">
          <PageIntro
            id="blog-title"
            eyebrow={en ? 'BLOG / TIẾN’S NOTES' : 'BLOG / GHI CHÉP CỦA TIẾN'}
            lines={en ? ['Code done.', 'A story to tell.'] : ['Code xong.', 'Kể một chút.']}
            description={
              <p>
                {en
                  ? 'Notes from building mobile apps, AI agents, ChatDVT and side projects.'
                  : 'Mấy thứ mình học được khi làm app, vọc AI Agent, làm bot và tự mò side project.'}
              </p>
            }
            aside={
              <div className="page-mascot-note">
                <Mascot character="tien" size={185} action="coffee" />
                <span>{en ? 'Notes to come back to.' : 'Ghi lại cho khỏi quên.'}</span>
              </div>
            }
          />

          <div className="blog-category-toolbar" role="navigation" aria-label={en ? 'Blog categories' : 'Chuyên mục bài viết'}>
            <div className="blog-category-pills" role="tablist" aria-label={en ? 'Filter by category' : 'Chọn chuyên mục'}>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                className={`blog-category-pill${activeCategory === 'all' ? ' is-active' : ''}`}
                aria-pressed={activeCategory === 'all'}
                onClick={() => selectCategory('all')}
              >
                <i className="blog-pill-dot" aria-hidden="true" />
                <span>{en ? 'All topics' : 'Tất cả'}</span>
                <b>{posts.length}</b>
              </button>
              {BLOG_CATEGORIES.map((cat) => {
                const count = postsByCategory[cat.id].length;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-blog-filter={cat.id}
                    className={`blog-category-pill${isActive ? ' is-active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => selectCategory(cat.id)}
                  >
                    <i className="blog-pill-dot" aria-hidden="true" />
                    <span>{cat.label[locale]}</span>
                    <b>{count}</b>
                  </button>
                );
              })}
            </div>
            <p className="blog-count blog-active-indicator" aria-live="polite">
              <span className="blog-active-indicator__label">
                {en ? 'Viewing:' : 'Đang xem:'}{' '}
                <strong>
                  {selectedCategoryMeta ? selectedCategoryMeta.label[locale] : en ? 'All categories' : 'Tất cả chuyên mục'}
                </strong>
              </span>
              <span aria-hidden="true"> · </span>
              <span>{t('blog.posts', { count: selectedCategoryPosts.length })}</span>
            </p>
          </div>

          {activeCategory === 'all' ? (
            <div className="blog-category-sections">
              {orderedCategories.withPosts.map((cat, groupIdx) => {
                const groupPosts = postsByCategory[cat.id];
                return (
                  <section key={cat.id} className="blog-category-group" aria-label={cat.label[locale]}>
                    <header className="blog-category-group__header">
                      <div className="blog-category-group__title-row">
                        <span className="blog-category-group__kicker">
                          {String(groupIdx + 1).padStart(2, '0')} / {cat.shortBadge[locale]}
                        </span>
                        <strong className="blog-category-group__name">{cat.label[locale]}</strong>
                        <span className="blog-category-group__count">
                          {groupPosts.length} {en ? (groupPosts.length === 1 ? 'post' : 'posts') : 'bài viết'}
                        </span>
                      </div>
                      <p className="blog-category-group__desc">{cat.description[locale]}</p>
                    </header>
                    {groupPosts.map((post, idx) => renderArticleCard(post, idx))}
                  </section>
                );
              })}

              {orderedCategories.empty.length > 0 && (
                <aside className="blog-upcoming-categories" aria-label={en ? 'Upcoming categories' : 'Chuyên mục sắp lên bài'}>
                  <p className="blog-upcoming-categories__kicker">
                    {en ? 'OTHER TOPICS · IN PROGRESS' : 'CHUYÊN MỤC KHÁC · ĐANG SOẠN BÀI'}
                  </p>
                  <div className="blog-upcoming-categories__grid">
                    {orderedCategories.empty.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className="blog-upcoming-card"
                        onClick={() => selectCategory(cat.id)}
                      >
                        <div className="blog-upcoming-card__top">
                          <span>{cat.shortBadge[locale]}</span>
                          <small>{en ? 'Coming soon' : 'Sắp có bài'}</small>
                        </div>
                        <strong>{cat.label[locale]}</strong>
                        <p>{cat.description[locale]}</p>
                      </button>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          ) : (
            <div className="blog-category-sections">
              {selectedCategoryMeta && (
                <section className="blog-category-group" aria-label={selectedCategoryMeta.label[locale]}>
                  <header className="blog-category-group__header">
                    <div className="blog-category-group__title-row">
                      <span className="blog-category-group__kicker">{selectedCategoryMeta.shortBadge[locale]}</span>
                      <strong className="blog-category-group__name">{selectedCategoryMeta.label[locale]}</strong>
                      <span className="blog-category-group__count">
                        {selectedCategoryPosts.length} {en ? (selectedCategoryPosts.length === 1 ? 'post' : 'posts') : 'bài viết'}
                      </span>
                    </div>
                    <p className="blog-category-group__desc">{selectedCategoryMeta.description[locale]}</p>
                  </header>

                  {selectedCategoryPosts.length > 0 ? (
                    selectedCategoryPosts.map((post, idx) => renderArticleCard(post, idx))
                  ) : (
                    <div className="blog-category-empty">
                      <p>
                        {en
                          ? `No published articles in "${selectedCategoryMeta.label.en}" yet. I am drafting notes for this topic.`
                          : `Chưa có bài viết nào được xuất bản trong mục "${selectedCategoryMeta.label.vi}". Mình đang soạn dở mấy bài thực chiến cho chủ đề này.`}
                      </p>
                      <button type="button" className="button blue" onClick={() => selectCategory('all')}>
                        {en ? 'View all articles' : 'Xem tất cả bài viết'}
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
