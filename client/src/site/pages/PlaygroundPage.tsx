import { useMemo, useState } from 'react';
import { Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { SiteLayout } from '../components/SiteLayout';
import { archiveItems, projectItems, type SiteItem } from '../content/siteData';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';

type ProjectFilter = 'all' | 'developer' | 'ai' | 'learning' | 'game';

function categoryOf(item: SiteItem): Exclude<ProjectFilter, 'all'> {
  if (item.section === 'game') return 'game';
  if (item.section === 'ai') return 'ai';
  if (item.section === 'learning' || item.section === 'productivity') return 'learning';
  return 'developer';
}

function matches(item: SiteItem, tab: ProjectFilter, query: string): boolean {
  const searchable = `${item.title} ${item.description} ${item.tags.join(' ')} ${item.requirements.join(' ')}`.toLowerCase();
  return (tab === 'all' || categoryOf(item) === tab) && searchable.includes(query.trim().toLowerCase());
}

function ProjectCard({ item, index }: { item: SiteItem; index: number }) {
  const { pathFor } = useLanguage();
  return <Link to={item.id === 'chatdvt' ? pathFor('/discord') : item.href} className="experiment-card">
    <div className="experiment-card__top">
      <span className="experiment-card__icon"><item.icon size={20} /></span>
      <span className="experiment-card__index">{String(index + 1).padStart(2, '0')}</span>
    </div>
    {item.id === 'chatdvt' && <img className="experiment-card__bot" src="/images/chibi/chatdvt.jpg" alt="" width={68} height={68} />}<h3>{item.title}</h3>
    <p>{item.description}</p>
    <div className="site-tags site-tags--status">
      <span className={item.status === 'stable' ? 'is-stable' : 'is-beta'}>{item.status === 'stable' ? 'Stable' : 'Beta'}</span>
      {item.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
      {item.requirements.slice(0, 1).map((requirement) => <span key={requirement} className="is-requirement">{requirement}</span>)}
    </div>
  </Link>;
}

export function PlaygroundPage() {
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const en = locale === 'en';
  const tabs: Array<{ label: string; value: ProjectFilter }> = [
    { label: t('playground.all'), value: 'all' }, { label: 'Developer Tools', value: 'developer' }, { label: 'AI Lab', value: 'ai' }, { label: 'Learning & Productivity', value: 'learning' }, { label: 'Games', value: 'game' },
  ];
  usePageMeta('Projects & Lab — Sản phẩm và công cụ | Đặng Văn Tiến', {
    description: 'Các sản phẩm nổi bật, công cụ cho developer, dự án AI, learning app và web game do Đặng Văn Tiến xây dựng.',
    keywords: 'Đặng Văn Tiến projects, mobile developer tools, ChatDVT, web app, AI lab, side project',
    schema: 'collection',
  });
  usePageTracker('ProjectsAndLab');

  const [tab, setTab] = useState<ProjectFilter>('all');
  const [query, setQuery] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const featured = projectItems
    .filter((item) => item.visibility === 'featured')
    .sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));
  const spotlight = featured[0];
  const featuredRest = featured.slice(1);

  const publicItems = useMemo(
    () => projectItems.filter((item) => item.visibility === 'public' && matches(item, tab, query)),
    [tab, query],
  );
  const visibleArchive = useMemo(
    () => archiveItems.filter((item) => matches(item, tab, query)),
    [tab, query],
  );

  if (!spotlight) return null;

  return <SiteLayout>
    <section className="page-hero">
      <div className="site-container page-hero__grid"><div>
        <p className="site-kicker">Projects & Lab</p>
        <h1>{en ? 'An idea.' : 'Có ý tưởng.'}<br /><em>{en ? 'I try building it.' : 'Mình thử làm.'}</em></h1>
        <p className="page-hero__aside">{t('playground.intro')}</p>
      </div><aside className="practice-note"><small>PERSONAL WORK</small><h2>{en ? <>Experiment.<br />Use it.<br />Improve.</> : <>Thử nghiệm.<br />Đưa vào dùng.<br />Rồi cải tiến.</>}</h2><p>{en ? 'Personal projects, separate from company work.' : 'Project cá nhân, tách biệt với công việc công ty.'}</p></aside></div>
    </section>

    <section className="site-container site-section">
      <Link to={spotlight.id === 'mobile-toolkit' ? pathFor('/mobile') : spotlight.href} className="playground-spotlight">
        <div className="playground-spotlight__copy">
          <small>Featured · {spotlight.status}</small>
          <h2>{spotlight.title}</h2>
          <p>{spotlight.description}</p>
          <div className="site-tags">{spotlight.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <span className="playground-spotlight__link">{t('playground.explore')} <b>↗</b></span>
        </div>
        <div className="playground-spotlight__visual"><span>BUILD · TEST · DEBUG</span><div className="tool-pills"><span>Android Toolbox</span><span>Deep Link</span><span>WebView</span><span>QR Generator</span></div><strong>React Native & Android</strong></div>
      </Link>

      <div className="projects-section-heading">
        <div><small>SELECTED WORK</small><h2>{t('playground.selected')}</h2></div><p>{t('playground.selectedDesc')}</p>
      </div>
      <div className="experiment-grid experiment-grid--featured">
        {featuredRest.map((item, index) => <ProjectCard key={item.id} item={item} index={index} />)}
      </div>

      <div className="projects-section-heading projects-section-heading--browse">
        <div><small>PUBLIC PROJECTS</small><h2>{t('playground.more')}</h2></div><p>{t('playground.moreDesc')}</p>
      </div>
      <div className="filter-bar">
        <div className="filter-tabs">{tabs.map((item) => <button type="button" aria-pressed={tab === item.value} key={item.value} className={tab === item.value ? 'is-active' : ''} onClick={() => setTab(item.value)}>{item.label}</button>)}</div>
        <input className="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('playground.search')} aria-label={t('playground.search')} />
      </div>
      <div className="experiment-grid">
        {publicItems.map((item, index) => <ProjectCard key={item.id} item={item} index={index} />)}
      </div>
      {publicItems.length === 0 && <div className="projects-empty">{t('playground.empty')}</div>}

      <div className="archive-panel">
        <div><small>ARCHIVE</small><h2>{t('playground.archive')}</h2><p>{t('playground.archiveDesc')}</p></div>
        <button type="button" className="site-button" onClick={() => setShowArchive((value) => !value)} aria-expanded={showArchive}>
          <Archive size={17} /> {showArchive ? t('playground.hideArchive') : t('playground.showArchive', { count: archiveItems.length })}
        </button>
      </div>
      {showArchive && <>
        <div className="experiment-grid experiment-grid--archive">
          {visibleArchive.map((item, index) => <ProjectCard key={item.id} item={item} index={index} />)}
        </div>
        {visibleArchive.length === 0 && <div className="projects-empty">{en ? 'No archived projects match these filters.' : 'Archive không có mục phù hợp với bộ lọc.'}</div>}
      </>}
    </section>
  </SiteLayout>;
}
