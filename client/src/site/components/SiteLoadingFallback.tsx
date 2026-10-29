import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout } from './SiteLayout';
import type { SiteLoadingView } from './siteLoadingView';

function Block({ className = '', width }: { className?: string; width?: string }) {
  return <span className={`site-skeleton-block ${className}`.trim()} style={width ? { width } : undefined} />;
}

function Copy({ lines = 3 }: { lines?: number }) {
  return (
    <div className="site-skeleton-copy">
      {Array.from({ length: lines }, (_, i) => (
        <Block key={i} width={i === lines - 1 ? '68%' : '100%'} />
      ))}
    </div>
  );
}

function Heading({ lines = 2, level = 1 }: { lines?: number; level?: 1 | 2 }) {
  const Tag = level === 1 ? 'h1' : 'h2';
  return (
    <Tag className="site-skeleton-heading">
      {Array.from({ length: lines }, (_, i) => (
        <Block key={i} width={i ? '92%' : '72%'} />
      ))}
    </Tag>
  );
}

function Actions() {
  return (
    <div className="site-skeleton-actions">
      <Block className="site-skeleton-pill" />
      <Block className="site-skeleton-pill" />
    </div>
  );
}

function IntroSkeleton({ art = false, actions = false }: { art?: boolean; actions?: boolean }) {
  return (
    <header className={'page-intro' + (art ? ' page-intro--with-art' : '')}>
      <div className="page-intro-copy">
        <p className="page-eyebrow">
          <Block width="40%" />
        </p>
        <Heading />
        <Copy lines={2} />
        {actions && <Actions />}
      </div>
      {art && (
        <div className="page-intro-art">
          <Block className="site-skeleton-bot" />
        </div>
      )}
    </header>
  );
}

function HomeSkeleton() {
  return (
    <div className="layered-home">
      <section className="lh-hero layered-container">
        <div className="lh-intro">
          <Block width="62%" />
          <Heading />
          <Copy lines={3} />
          <Actions />
        </div>

        <div className="mobile-stack mobile-stack--holo">
          <div className="stack-overline">
            <Block width="48%" />
            <Block width="16%" />
          </div>
          <div className="stack-perspective stack-perspective--holo">
            <div className="holo-stage-inner">
              <div className="holo-conduit">
                {[0, 1, 2, 3].map((i) => (
                  <Block key={i} className="site-skeleton-conduit-node" />
                ))}
              </div>
              <div className="holo-rig">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="site-skeleton-holo-deck">
                    <div className="site-skeleton-holo-deck__left">
                      <Block width="70%" />
                      <Block width="88%" />
                    </div>
                    <Block className="site-skeleton-holo-deck__viz" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="stack-controls">
            <Block className="site-skeleton-selector-bar" />
          </div>
        </div>
      </section>

      <div className="lh-baseline layered-container">
        <div className="lh-expertise">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Block width="55%" />
              <Block className="site-skeleton-expertise-val" width="80%" />
            </div>
          ))}
        </div>
        <div className="lh-location">
          <Block width="140px" />
        </div>
      </div>

      <section className="lh-section layered-container">
        <Block width="28%" />
        <div className="lh-section-heading">
          <Heading level={2} />
          <Copy lines={2} />
        </div>
        <div className="lh-work-grid">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <article className="lh-work-card">
                <Block width="45%" />
                <Block className="site-skeleton-subtitle" />
                <Copy lines={3} />
                <Block className="site-skeleton-work-visual" />
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="lh-section lh-writing-c layered-container">
        <Block width="32%" />
        <div className="lh-writing-c__header">
          <div style={{ flex: 1 }}>
            <Heading level={2} lines={1} />
            <Block width="58%" />
          </div>
          <Block className="site-skeleton-pill" />
        </div>
        <div className="lh-segmented-wrap">
          <div className="lh-segmented-control">
            {[0, 1, 2, 3, 4].map((i) => (
              <Block key={i} className="site-skeleton-segment-pill" />
            ))}
          </div>
          <Block width="170px" />
        </div>
        <div className="lh-blog-grid-c">
          {[0, 1, 2].map((i) => (
            <div key={i} className="lh-blog-card-c">
              <div className="lh-blog-card-c__preview">
                <div className="lh-blog-card-c__hud">
                  <Block width="32%" />
                  <Block width="24%" />
                </div>
                <Block className="site-skeleton-blog-cover" />
              </div>
              <div className="lh-blog-card-c__body">
                <Block width="45%" />
                <Block className="site-skeleton-subtitle" />
                <Copy lines={2} />
                <Block width="36%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlaygroundSkeleton() {
  return (
    <section className="hybrid-view hybrid-b selected-playground">
      <div className="site-container">
        <IntroSkeleton />
      </div>
      <div className="collection-toolbar">
        <div className="filters">
          {[0, 1, 2, 3].map((i) => (
            <Block key={i} className="site-skeleton-pill" />
          ))}
        </div>
        <div className="search-label">
          <Block className="site-skeleton-field" />
        </div>
      </div>
      <div className="collection">
        {[0, 1].map((i) => (
          <article key={i} className="project-product rich">
            <div className="product-art">
              <Block className="site-skeleton-art" />
            </div>
            <div className="product-body">
              <Block width="40%" />
              <Block className="site-skeleton-subtitle" />
              <Copy lines={3} />
              <Actions />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MeSkeleton() {
  return (
    <div className="me-profile">
      <section className="me-hero me-wrap">
        <div className="me-hero-grid">
          <div className="me-hero-copy">
            <p className="me-eyebrow">
              <Block width="25%" />
            </p>
            <Heading />
            <Copy lines={4} />
            <Actions />
          </div>
          <aside className="me-facts">
            <Block className="site-skeleton-portrait" />
            <Copy lines={4} />
          </aside>
        </div>
      </section>
      <section className="me-work me-wrap">
        <div className="me-work-grid">
          {[0, 1, 2].map((i) => (
            <article className="me-work-card" key={i}>
              <Block width="35%" />
              <Block className="site-skeleton-subtitle" />
              <Copy lines={4} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DiscordSkeleton() {
  return (
    <section className="hybrid-view hybrid-b selected-discord">
      <div className="site-container">
        <IntroSkeleton art actions />
      </div>
      <div className="proof-section">
        <div className="proof-intro">
          <Block width="35%" />
          <Block className="site-skeleton-subtitle" />
          <Copy lines={2} />
          <div className="site-skeleton-actions">
            {[0, 1, 2].map((i) => (
              <Block key={i} className="site-skeleton-tag" />
            ))}
          </div>
        </div>
        <div id="proof-panel">
          <Block className="site-skeleton-art site-skeleton-proof" />
        </div>
      </div>
    </section>
  );
}

function BlogSkeleton() {
  return (
    <section className="hybrid-view hybrid-a selected-blog">
      <div className="page-shell">
        <IntroSkeleton art />
        <div className="blog-category-toolbar">
          <div className="blog-category-pills">
            {[0, 1, 2, 3, 4].map((i) => (
              <Block key={i} className="site-skeleton-cat-pill" />
            ))}
          </div>
          <div className="blog-category-summary">
            <Block width="220px" />
          </div>
        </div>
        <div className="blog-category-sections">
          <section className="blog-category-group">
            <header className="blog-category-group__header">
              <div className="blog-category-group__title-row">
                <Block width="90px" />
                <Block width="180px" />
                <Block width="70px" />
              </div>
              <Block width="52%" />
            </header>
            {[0, 1].map((i) => (
              <article key={i} className="blog-feature">
                <div className="article-number">
                  <Block className="site-skeleton-art" />
                </div>
                <div className="blog-feature-copy">
                  <Block width="38%" />
                  <Block className="site-skeleton-subtitle" />
                  <Copy lines={3} />
                  <Block className="site-skeleton-pill" />
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </section>
  );
}

export function BlogArticleSkeleton() {
  return (
    <article className="site-container blog-article selected-article">
      <header className="blog-article__header">
        <p className="site-kicker blog-article__eyebrow">
          <Block width="26%" />
        </p>
        <Heading />
        <div className="blog-article__meta">
          <div className="blog-article__author">
            <Block className="site-skeleton-chat-avatar" />
            <div style={{ width: 150 }}>
              <Block width="85%" />
              <Block width="60%" />
            </div>
          </div>
          <div className="blog-article__stats">
            <Block width="150px" />
          </div>
        </div>
      </header>
      <div className="blog-prose site-skeleton-prose">
        <Copy lines={4} />
        <Block className="site-skeleton-article-figure" />
        <Block className="site-skeleton-subtitle" />
        <Copy lines={5} />
      </div>
    </article>
  );
}

function ChatSkeleton() {
  return (
    <section className="chatdvt-page chatdvt-page--tour hybrid-view hybrid-b selected-chat">
      <div className="chatdvt-main">
        <header className="chatdvt-chat-header">
          <div className="chatdvt-chat-identity">
            <Block className="site-skeleton-chat-avatar" />
            <div>
              <Block className="site-skeleton-subtitle" />
              <Block />
            </div>
          </div>
          <div className="chatdvt-toolbar">
            <Block className="site-skeleton-tag" />
            <Block className="site-skeleton-tag" />
          </div>
        </header>
        <div className="chatdvt-thread">
          <article className="chatdvt-welcome">
            <Block width="35%" />
            <Block className="site-skeleton-subtitle" />
            <Copy lines={2} />
            <div className="chatdvt-suggestions">
              {[0, 1, 2, 3].map((i) => (
                <Block className="site-skeleton-suggestion" key={i} />
              ))}
            </div>
          </article>
        </div>
        <div className="chatdvt-composer-wrap">
          <Block className="site-skeleton-subtitle" />
          <div className="chatdvt-composer">
            <Block className="site-skeleton-field" />
          </div>
          <Block width="65%" />
        </div>
      </div>
      <aside className="chatdvt-directory">
        <p className="site-kicker">
          <Block width="55%" />
        </p>
        <h2 className="site-skeleton-heading">
          <Block width="72%" />
          <Block width="92%" />
        </h2>
        <Block className="site-skeleton-figure" />
        {[0, 1, 2, 3].map((i) => (
          <div className="site-skeleton-directory-link" key={i}>
            <Block width="55%" />
            <Block width="82%" />
          </div>
        ))}
      </aside>
    </section>
  );
}

function EcosystemSkeleton() {
  return (
    <div className="ecosystem-page">
      <section className="site-container ecosystem-hero">
        <div className="ecosystem-hero__copy">
          <p className="ecosystem-kicker">
            <Block width="50%" />
          </p>
          <Heading />
          <Copy lines={3} />
          <Actions />
        </div>
        <div className="ecosystem-orbit">
          <Block className="site-skeleton-bot" />
        </div>
      </section>
      <section className="ecosystem-proof">
        <div className="site-container ecosystem-proof__grid">
          {[0, 1, 2, 3].map((i) => (
            <div className="ecosystem-proof__item" key={i}>
              <Copy lines={2} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AppsSkeleton() {
  const { pathname } = useLocation();
  const isWallpaperDetail = pathname.includes('td-wallpaperengine');

  if (isWallpaperDetail) {
    return (
      <article className="site-container apps-page wallpaper-page">
        <Block width="160px" />
        <header className="wallpaper-opening">
          <div>
            <p className="site-kicker">
              <Block width="38%" />
            </p>
            <Heading lines={1} />
            <Block className="site-skeleton-subtitle" />
            <Copy lines={3} />
            <Actions />
          </div>
          <aside className="wallpaper-facts">
            <Copy lines={6} />
          </aside>
        </header>
        <figure className="wallpaper-preview">
          <Block className="site-skeleton-wallpaper-hero" />
        </figure>
      </article>
    );
  }

  return (
    <section className="site-container apps-page">
      <IntroSkeleton />
      <article className="apps-featured">
        <div className="apps-featured-image">
          <Block className="site-skeleton-art" />
        </div>
        <div className="apps-featured-copy">
          <Block width="42%" />
          <Block className="site-skeleton-subtitle" />
          <Copy lines={4} />
          <Actions />
        </div>
      </article>
    </section>
  );
}

const skeletons = {
  home: HomeSkeleton,
  playground: PlaygroundSkeleton,
  apps: AppsSkeleton,
  me: MeSkeleton,
  discord: DiscordSkeleton,
  blog: BlogSkeleton,
  article: BlogArticleSkeleton,
  chat: ChatSkeleton,
  ecosystem: EcosystemSkeleton,
};

// Eagerly imported by App: the current site shell/CSS must exist before lazy pages load.
export function SiteLoadingFallback({ view }: { view: SiteLoadingView }) {
  const { locale } = useLanguage();
  const Skeleton = skeletons[view];
  return (
    <SiteLayout hideFooter={view === 'chat'} hideFooterContact={view === 'me'}>
      <div data-site-loading={view}>
        <p className="sr-only" role="status">
          {locale === 'en' ? 'Loading page…' : 'Đang tải trang…'}
        </p>
        <div className="site-skeleton" aria-hidden="true" aria-busy="true">
          <Skeleton />
        </div>
      </div>
    </SiteLayout>
  );
}
