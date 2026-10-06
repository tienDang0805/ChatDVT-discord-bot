import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout } from '../components/SiteLayout';
import { FeatureArt } from '../components/FeatureArt';
import { categories, categoryNames, categoryOf, collectionArchive, collectionDescription, collectionItems } from '../content/collection';
import type { CollectionCategory } from '../content/collection';
import type { SiteItem } from '../content/siteData';

function FeatureLink({ item, children, className = '' }: { item: SiteItem; children: React.ReactNode; className?: string }) {
  const { pathFor } = useLanguage();
  const href = item.id === 'chatdvt' ? pathFor('/discord') : item.href;
  return item.id === 'rn-guide' ? <a className={className} href={href}>{children}</a> : <Link className={className} to={href}>{children}</Link>;
}
function ProjectEntry({ item, onDetail }: { item: SiteItem; onDetail: (item: SiteItem, trigger: HTMLButtonElement) => void }) {
  const { locale } = useLanguage(), en = locale === 'en';
  const category = categoryOf(item), rich = ['deeplink', 'mermaid', 'survivor'].includes(item.id);
  return <article data-project-card data-category={category} data-id={item.id} className={'project-product ' + (rich ? 'rich ' : '') + (category === 'fun' ? 'fun-product' : category === 'tools' ? 'tools-product' : '')}>
    <div className="product-art">{item.id === 'deeplink' ? <img src="/images/deeplink-tool-live.jpg" alt={en ? 'Actual Deep Link Tester interface' : 'Giao diện thật của Deep Link Tester'} loading="lazy" /> : <FeatureArt id={item.id} label={(en ? 'Chibi illustration: ' : 'Minh họa chibi: ') + item.title} />}</div>
    <div className="product-body"><div className="product-top"><p className="eyebrow">{categoryNames[category][en ? 1 : 0]}</p><span className="status">{item.status}</span></div><h2>{item.title}</h2><p>{collectionDescription(item, en)}</p>{item.requirements.length > 0 && <div className="requirements">{item.requirements.join(' · ')}</div>}<div className="product-actions"><FeatureLink item={item}>{en ? 'Open now' : 'Mở ngay'} ↗</FeatureLink><button type="button" data-feature-peek={item.id} onClick={event => onDetail(item, event.currentTarget)}>{en ? 'Details' : 'Xem chi tiết'}</button></div></div>
  </article>;
}
export function PlaygroundPage() {
  const { locale } = useLanguage(), en = locale === 'en';
  const [params, setParams] = useSearchParams();
  const raw = params.get('category');
  // Earlier collection bookmarks remain useful after the three-family redesign.
  const value = ({ ai: 'tools', learning: 'tools', game: 'fun' } as Record<string, string>)[raw || ''] || raw;
  const category: CollectionCategory = categories.includes(value as CollectionCategory) ? value as CollectionCategory : 'all';
  const query = params.get('q') || '';
  const [detail, setDetail] = useState<SiteItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null), detailTrigger = useRef<HTMLButtonElement | null>(null);
  usePageMeta('Playground — Đặng Văn Tiến', { description: en ? 'Explore a few features, games and fun little tools made by Tiến.' : 'Tool, game và mấy project Tiến làm ngoài giờ.', schema: 'collection' });
  usePageTracker('Playground');
  function update(key: string, val: string) { const next = new URLSearchParams(params); if (!val || val === 'all') next.delete(key); else next.set(key, val); setParams(next, { replace: true }); }
  const matches = (item: SiteItem) => (category === 'all' || categoryOf(item) === category) && `${item.title} ${collectionDescription(item, en)} ${item.description} ${item.tags.join(' ')} ${item.requirements.join(' ')}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale));
  const items = collectionItems.filter(matches), archive = collectionArchive.filter(matches);
  function showDetail(item: SiteItem, trigger: HTMLButtonElement) { detailTrigger.current = trigger; setDetail(item); dialog.current?.showModal(); }
  return <SiteLayout><section className="hybrid-view hybrid-b selected-playground">
    <div className="play-opening"><div><p className="eyebrow">{en ? 'COME PLAY A LITTLE' : 'TOOL, GAME & SIDE PROJECT'}</p><h1>Playground</h1><p className="lede">{en ? 'A few features, games and fun little tools I made. Pick something you like and give it a try.' : 'Một vài thứ mình đã làm và đang nghịch. Có tool cho công việc, game và vài thử nghiệm với AI.'}</p></div></div>
    <div className="collection-toolbar"><div className="filters" aria-label={en ? 'Playground categories' : 'Nhóm Playground'}>{categories.map(tab => <button key={tab} type="button" data-filter={tab} aria-pressed={category === tab} onClick={() => update('category', tab)}>{categoryNames[tab][en ? 1 : 0]}</button>)}</div><label className="search-label"><span>{en ? 'Search Playground' : 'Tìm trong Playground'}</span><input id="project-search" type="search" value={query} onChange={event => update('q', event.target.value)} placeholder={en ? 'Deep link, quiz, notes…' : 'Ví dụ: deep link, quiz, ghi chú'} /></label><span id="project-count" role="status">{items.length} {en ? 'items' : 'mục'}</span></div>

    <div id="b-collection" className="collection">{items.map(item => <ProjectEntry key={item.id} item={item} onDetail={showDetail} />)}</div>
    {items.length === 0 && <div className="empty"><h2>{en ? 'Nothing matches yet.' : 'Không tìm thấy tool hoặc game phù hợp.'}</h2><p>{en ? 'Try another word or open the whole Playground.' : 'Thử từ khóa khác hoặc xóa bộ lọc.'}</p><button className="button ink" type="button" data-reset onClick={() => setParams({})}>{en ? 'Clear filters' : 'Xóa bộ lọc'}</button></div>}
    <details className="archive"><summary>{en ? 'Earlier experiments' : 'Thử nghiệm cũ'} <span>Archive · {collectionArchive.length} {en ? 'items' : 'mục'}</span></summary><div id="b-archive">{archive.map(item => <FeatureLink key={item.id} item={item}><strong>{item.title} ↗</strong><p>{collectionDescription(item, en)}</p><small>Archive · {item.status}{item.requirements.length > 0 && ' · ' + item.requirements.join(' · ')}</small></FeatureLink>)}{archive.length === 0 && <p role="status">{en ? 'No archived items match.' : 'Không có mục nào khớp bộ lọc.'}</p>}</div></details>
    <dialog ref={dialog} className="research-dialog" aria-labelledby="feature-detail-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onClose={() => detailTrigger.current?.focus({ preventScroll: true })}><button className="dialog-close" type="button" aria-label={en ? 'Close details' : 'Đóng chi tiết'} onClick={() => dialog.current?.close()}>{en ? 'Close' : 'Đóng'} ×</button><h2 id="feature-detail-title">{detail?.title}</h2>{detail && <><FeatureArt id={detail.id} label={(en ? 'Chibi illustration: ' : 'Minh họa chibi: ') + detail.title} /><p>{collectionDescription(detail, en)}</p><p>{detail.status} · {detail.tags.join(' · ')}</p>{detail.requirements.length > 0 && <p>{detail.requirements.join(' · ')}</p>}<FeatureLink item={detail}>{en ? 'Open ' : 'Mở '}{detail.title} ↗</FeatureLink></>}</dialog>
  </section></SiteLayout>;
}
