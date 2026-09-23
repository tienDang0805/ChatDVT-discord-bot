import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { SiteLayout } from '../components/SiteLayout';
import { utilityItems } from '../content/siteData';

const groups: Array<{ ids: string[]; eyebrow: string; title: string; description: string }> = [
  { ids: ['deeplink', 'webview', 'qr'], eyebrow: 'Mobile', title: 'Công cụ test nhanh', description: 'Mấy thứ mình hay cần khi làm React Native, Android và iOS.' },
  { ids: ['rn-guide'], eyebrow: 'Tài liệu', title: 'React Native Guide', description: 'Ghi chú học và làm React Native, tách riêng khỏi các tài liệu không liên quan đến mobile.' },
];

export function MobilePage() {
  usePageMeta('Mobile Utility — React Native & Android | Tiến Đặng', {
    description: 'Các công cụ mình dùng khi làm mobile: kiểm tra deep link, WebView, tạo QR, cùng tài liệu React Native và Android/Kotlin.',
    keywords: 'mobile utility, React Native, Android, Kotlin, deep link tester, WebView simulator, QR generator',
    schema: 'collection',
  });
  usePageTracker('MobileUtility');
  return <SiteLayout>
    <section className="page-hero"><div className="site-container page-hero__grid"><div><p className="site-kicker">React Native · Android/Kotlin</p><h1>Mobile Utility</h1><p className="page-hero__aside">Deep link, WebView, QR và ghi chú React Native mình gom lại để dùng hằng ngày.</p></div></div></section>
    <div className="site-container">
      {groups.map(group => { const items = utilityItems.filter(item => group.ids.includes(item.id)); return <section key={group.title} className="utility-groups"><aside className="utility-sidebar"><small>{group.eyebrow}</small><h2>{group.title}</h2><p>{group.description}</p></aside><div className="utility-list">{items.map(item => <Link key={item.id} to={item.href} className="utility-row"><span className="utility-row__icon"><item.icon size={19} /></span><div><h3>{item.title}</h3><p>{item.description}</p><div className="site-tags">{item.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div></div><b>↗</b></Link>)}</div></section>; })}
    </div>
  </SiteLayout>;
}
