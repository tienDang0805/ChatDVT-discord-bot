import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout } from './SiteLayout';
import type { SiteLoadingView } from './siteLoadingView';

function Block({ className = '', width }: { className?: string; width?: string }) {
  return <span className={`site-skeleton-block ${className}`} style={width ? { width } : undefined} />;
}

function Copy({ lines = 3 }: { lines?: number }) {
  return <div className="site-skeleton-copy">{Array.from({ length: lines }, (_, i) => <Block key={i} width={i === lines - 1 ? '68%' : '100%'} />)}</div>;
}

function Heading({ lines = 2, level = 1 }: { lines?: number; level?: 1 | 2 }) {
  const Tag = level === 1 ? 'h1' : 'h2';
  return <Tag className="site-skeleton-heading">{Array.from({ length: lines }, (_, i) => <Block key={i} width={i ? '92%' : '72%'} />)}</Tag>;
}

function Actions() {
  return <div className="site-skeleton-actions"><Block className="site-skeleton-pill" /><Block className="site-skeleton-pill" /></div>;
}

function Guide({ className = '' }: { className?: string }) {
  return <div className={`guide-stage site-skeleton-guide ${className}`}><Block className="site-skeleton-avatar" /><div className="guide-speech"><p className="eyebrow"><Block width="65%" /></p><Copy lines={6} /><div className="site-skeleton-actions">{[0, 1, 2].map(i => <Block key={i} className="site-skeleton-pill" />)}</div></div></div>;
}

function HomeSkeleton() {
  return <section className="hybrid-view hybrid-a selected-home">
    <div className="home-landscape">
      <div className="home-copy"><p className="eyebrow light"><Block width="65%" /></p><Heading /><Copy lines={4} /><div className="home-stack"><Block className="site-skeleton-tag" /><Block className="site-skeleton-tag" /><Block className="site-skeleton-tag" /></div><Actions /></div>
      <div className="discovery-scene story-scene"><Block className="home-tien site-skeleton-figure" /><div className="scene-sign mobile-sign"><Copy lines={2} /></div><div className="scene-sign fun-sign"><Copy lines={2} /></div><div className="scene-sign tools-sign"><Copy lines={2} /></div></div>
      <Guide className="home-guide" />
    </div>
    <div className="home-follow page-shell"><div className="section-intro"><Block width="55%" /><Heading level={2} /><Copy /></div><div className="home-paths">{[0, 1].map(i => <div className="home-path" key={i}><Block className="site-skeleton-art" /><div><Block className="site-skeleton-subtitle" /><Copy /></div></div>)}</div></div>
  </section>;
}

function PlaygroundSkeleton() {
  return <section className="hybrid-view hybrid-b selected-playground">
    <div className="play-opening"><div><p className="eyebrow"><Block width="45%" /></p><Heading lines={1} /><Copy lines={2} /></div><Guide className="play-guide" /></div>
    <div className="collection-toolbar"><div className="filters">{[0, 1, 2, 3].map(i => <Block key={i} className="site-skeleton-pill" />)}</div><div className="search-label"><Block className="site-skeleton-field" /></div></div>
    <div className="collection">{[0, 1, 2].map(i => <article key={i} className={`project-product${i === 0 ? ' rich' : ''}`}><div className="product-body"><Block width="40%" /><Block className="site-skeleton-subtitle" /><Copy /><Actions /></div><div className="product-art"><Block className="site-skeleton-art" /></div></article>)}</div>
  </section>;
}

function MeSkeleton() {
  return <section className="hybrid-view hybrid-b selected-me">
    <div className="me-stage band profile-stage"><div className="portrait-wrap"><Block className="site-skeleton-portrait" /><Block width="60%" /></div><div><p className="eyebrow"><Block width="45%" /></p><Heading /><Copy lines={2} /><Actions /></div></div>
    <div className="work-section"><div className="work-heading"><Block width="40%" /><Block className="site-skeleton-subtitle" /><Copy lines={2} /></div><ol className="contribution-list">{[0, 1, 2].map(i => <li key={i}><Block className="site-skeleton-subtitle" /><Copy lines={2} /></li>)}</ol></div>
  </section>;
}

function DiscordSkeleton() {
  return <section className="hybrid-view hybrid-b selected-discord">
    <div className="discord-stage band primary-stage"><div><p className="eyebrow"><Block width="70%" /></p><Heading /><Copy lines={4} /><Actions /></div><Block className="site-skeleton-bot" /></div>
    <div className="proof-intro page-shell"><Block width="25%" /><Block className="site-skeleton-subtitle" /><Copy lines={2} /></div>
  </section>;
}

function BlogSkeleton() {
  return <section className="hybrid-view hybrid-a selected-blog"><div className="page-shell">
    <div className="page-opening blog-opening"><div><p className="eyebrow"><Block width="55%" /></p><Heading /><Copy lines={2} /></div><div className="blog-circle story-scene"><Block className="site-skeleton-figure" /></div></div>
    <Block width="15%" /><article className="blog-feature"><div className="article-number"><Block className="site-skeleton-art" /></div><div className="blog-feature-copy"><Block width="40%" /><Block className="site-skeleton-subtitle" /><Copy /><Actions /></div></article>
  </div></section>;
}

export function BlogArticleSkeleton() {
  return <article className="site-container blog-article selected-article"><Block width="12%" /><header className="blog-article__header"><p className="site-kicker"><Block width="25%" /></p><Heading /><Block width="40%" /></header><div className="blog-prose site-skeleton-prose"><Copy lines={5} /><Copy lines={4} /><Block className="site-skeleton-subtitle" /><Copy lines={5} /></div></article>;
}

function ChatSkeleton() {
  return <section className="chatdvt-page chatdvt-page--tour hybrid-view hybrid-b selected-chat">
    <div className="chatdvt-main"><header className="chatdvt-chat-header"><div className="chatdvt-chat-identity"><Block className="site-skeleton-chat-avatar" /><div><Block className="site-skeleton-subtitle" /><Block /></div></div><div className="chatdvt-toolbar"><Block className="site-skeleton-pill" /></div></header>
      <div className="chatdvt-thread"><article className="chatdvt-welcome"><Block width="40%" /><Block className="site-skeleton-subtitle" /><Copy /><div className="chatdvt-suggestions">{[0, 1, 2, 3].map(i => <Block className="site-skeleton-suggestion" key={i} />)}</div></article></div>
      <div className="chatdvt-composer-wrap"><Block className="site-skeleton-subtitle" /><div className="chatdvt-composer"><Block className="site-skeleton-field" /></div><Block width="65%" /></div>
    </div>
    <aside className="chatdvt-directory"><p className="site-kicker"><Block width="55%" /></p><h2 className="site-skeleton-heading"><Block width="72%" /><Block width="92%" /></h2><Guide className="chat-guide" />{[0, 1, 2, 3].map(i => <div className="site-skeleton-directory-link" key={i}><Block width="75%" /></div>)}</aside>
  </section>;
}

function EcosystemSkeleton() {
  return <div className="ecosystem-page"><section className="site-container ecosystem-hero"><div className="ecosystem-hero__copy"><p className="ecosystem-kicker"><Block width="50%" /></p><Heading /><Copy lines={4} /><Actions /></div><div className="ecosystem-orbit"><Block className="site-skeleton-bot" /></div></section><section className="ecosystem-proof">{[0, 1, 2, 3].map(i => <div className="ecosystem-proof__item" key={i}><Copy lines={2} /></div>)}</section></div>;
}

const skeletons = { home: HomeSkeleton, playground: PlaygroundSkeleton, me: MeSkeleton, discord: DiscordSkeleton, blog: BlogSkeleton, article: BlogArticleSkeleton, chat: ChatSkeleton, ecosystem: EcosystemSkeleton };

// Eagerly imported by App: the current site shell/CSS must exist before lazy pages load.
export function SiteLoadingFallback({ view }: { view: SiteLoadingView }) {
  const { locale } = useLanguage();
  const Skeleton = skeletons[view];
  return <SiteLayout hideFooter={view === 'chat'}><div data-site-loading={view}>
    <p className="sr-only" role="status">{locale === 'en' ? 'Loading page…' : 'Đang tải trang…'}</p>
    <div className="site-skeleton" aria-hidden="true" aria-busy="true"><Skeleton /></div>
  </div></SiteLayout>;
}
