import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { SiteLayout } from '../components/SiteLayout';
import { playgroundItems, utilityItems, type SiteItem } from '../content/siteData';

type PlaygroundFilter = 'all' | 'game' | 'ai' | 'tool';

const tabs: Array<{ label: string; value: PlaygroundFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Game', value: 'game' },
  { label: 'AI', value: 'ai' },
  { label: 'Công cụ', value: 'tool' },
];

const selectedUtilityIds = ['mermaid', 'cv', 'english'];
const selectedItems = [
  ...playgroundItems,
  ...utilityItems.filter(item => selectedUtilityIds.includes(item.id)),
];

function categoryOf(item: SiteItem): Exclude<PlaygroundFilter, 'all'> {
  if (item.kind === 'game') return 'game';
  if (item.kind === 'ai') return 'ai';
  return 'tool';
}

export function PlaygroundPage() {
  usePageMeta('Playground — Tiến Đặng');
  usePageTracker('Playground');
  const [tab, setTab] = useState<PlaygroundFilter>('all');
  const [query, setQuery] = useState('');
  const featured = playgroundItems.find(item => item.id === 'survivor')!;
  const FeaturedIcon = featured.icon;
  const items = useMemo(() => selectedItems.filter(item => item.id !== featured.id && (tab === 'all' || categoryOf(item) === tab) && `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())), [featured.id, tab, query]);

  return <SiteLayout>
    <section className="page-hero"><div className="site-container page-hero__grid"><div><p className="site-kicker">Playground</p><h1>Mấy thứ làm vì vui</h1><p className="page-hero__aside">Một vài game, demo AI và công cụ mình thấy đáng giữ lại.</p></div></div></section>
    <section className="site-container site-section">
      <Link to={featured.href} className="playground-spotlight">
        <div className="playground-spotlight__copy"><small>Game nổi bật</small><h2>{featured.title}</h2><p>{featured.description}</p><div className="site-tags">{featured.tags.map(tag => <span key={tag}>{tag}</span>)}</div><span className="playground-spotlight__link">Chơi thử <b>↗</b></span></div>
        <div className="playground-spotlight__visual"><span>50 WAVES</span><FeaturedIcon size={92} strokeWidth={1.25} /><strong>8D ARENA</strong></div>
      </Link>
      <div className="filter-bar"><div className="filter-tabs">{tabs.map(item => <button key={item.value} className={tab === item.value ? 'is-active' : ''} onClick={() => setTab(item.value)}>{item.label}</button>)}</div><input className="site-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm theo tên..." aria-label="Tìm trong Playground" /></div>
      <div className="experiment-grid">
        {items.map((item, index) => <Link key={item.id} to={item.href} className="experiment-card"><div className="experiment-card__top"><span className="experiment-card__icon"><item.icon size={20} /></span><span className="experiment-card__index">{String(index + 1).padStart(2, '0')}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="site-tags">{item.tags.slice(0, 2).map(tag => <span key={tag}>{tag}</span>)}</div></Link>)}
      </div>
      {items.length === 0 && <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--site-muted)' }}>Không tìm thấy mục phù hợp.</div>}
    </section>
  </SiteLayout>;
}
