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
  return <div className="layered-home"><section className="lh-hero layered-container">
    <div className="lh-intro"><Block width="65%" /><Heading /><Copy lines={4} /><Actions /></div>
    <div className="mobile-stack"><Block width="60%" /><div className="site-skeleton-stack">{[0, 1, 2, 3].map(i => <Block key={i} />)}</div><Block width="80%" /></div>
  </section><div className="lh-baseline layered-container"><Block width="70%" /></div></div>;
}

function IntroSkeleton({ art = false }: { art?: boolean }) {
  return <header className={'page-intro' + (art ? ' page-intro--with-art' : '')}><div className="page-intro-copy"><p className="page-eyebrow"><Block width="40%" /></p><Heading /><Copy lines={2} /></div>{art && <div className="page-intro-art"><Block className="site-skeleton-bot" /></div>}</header>;
}

function PlaygroundSkeleton() {
  return <section className="hybrid-view hybrid-b selected-playground">
    <div className="site-container"><IntroSkeleton /></div>
    <div className="collection-toolbar"><div className="filters">{[0, 1, 2, 3].map(i => <Block key={i} className="site-skeleton-pill" />)}</div><div className="search-label"><Block className="site-skeleton-field" /></div></div>
    <div className="collection"><article className="project-product rich"><div className="product-body"><Block width="40%" /><Block className="site-skeleton-subtitle" /><Copy /><Actions /></div><div className="product-art"><Block className="site-skeleton-art" /></div></article></div>
  </section>;
}

function MeSkeleton() {
  return <div className="me-profile"><section className="me-hero me-wrap"><div className="me-hero-grid"><div className="me-hero-copy"><p className="me-eyebrow"><Block width="25%" /></p><Heading /><Copy lines={4} /><Actions /></div><aside className="me-facts"><Block className="site-skeleton-portrait" /><Copy lines={5} /></aside></div></section><section className="me-work me-wrap"><div className="me-work-grid">{[0, 1, 2].map(i => <article className="me-work-card" key={i}><Block className="site-skeleton-subtitle" /><Copy lines={4} /></article>)}</div></section></div>;
}

function DiscordSkeleton() {
  return <section className="hybrid-view hybrid-b selected-discord"><div className="site-container"><IntroSkeleton art /><Actions /></div><div className="proof-intro page-shell"><Block width="25%" /><Block className="site-skeleton-subtitle" /><Copy lines={2} /></div></section>;
}

function BlogSkeleton() {
  return <section className="hybrid-view hybrid-a selected-blog"><div className="page-shell"><IntroSkeleton art /><Block width="15%" /><article className="blog-feature"><div className="article-number"><Block className="site-skeleton-art" /></div><div className="blog-feature-copy"><Block width="40%" /><Block className="site-skeleton-subtitle" /><Copy /><Actions /></div></article></div></section>;
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

function AppsSkeleton() {
  return <section className="site-container apps-page"><IntroSkeleton /><article className="apps-featured"><div className="apps-featured-image"><Block className="site-skeleton-art" /></div><div className="apps-featured-copy"><Block className="site-skeleton-subtitle" /><Copy lines={4} /><Actions /></div></article></section>;
}

const skeletons = { home: HomeSkeleton, playground: PlaygroundSkeleton, apps: AppsSkeleton, me: MeSkeleton, discord: DiscordSkeleton, blog: BlogSkeleton, article: BlogArticleSkeleton, chat: ChatSkeleton, ecosystem: EcosystemSkeleton };

// Eagerly imported by App: the current site shell/CSS must exist before lazy pages load.
export function SiteLoadingFallback({ view }: { view: SiteLoadingView }) {
  const { locale } = useLanguage();
  const Skeleton = skeletons[view];
  return <SiteLayout hideFooter={view === 'chat'}><div data-site-loading={view}>
    <p className="sr-only" role="status">{locale === 'en' ? 'Loading page…' : 'Đang tải trang…'}</p>
    <div className="site-skeleton" aria-hidden="true" aria-busy="true"><Skeleton /></div>
  </div></SiteLayout>;
}
