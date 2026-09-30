import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { SiteLayout } from '../components/SiteLayout';
import { mobileItems } from '../content/siteData';
import { useTranslation } from 'react-i18next';

export function MobilePage() {
  const { t } = useTranslation('site');
  const groups = [
    { ids: ['android-toolbox', 'deeplink', 'webview', 'qr'], eyebrow: 'Mobile', title: t('mobile.quick'), description: t('mobile.quickDesc') },
    { ids: ['rn-guide'], eyebrow: t('mobile.docs'), title: 'React Native Guide', description: t('mobile.guideDesc') },
  ];
  usePageMeta('Mobile Utility — React Native & Android | Tiến Đặng', {
    description: 'Các công cụ mình dùng khi làm mobile: Android Toolbox qua USB, kiểm tra deep link, WebView, tạo QR, cùng tài liệu React Native và Android/Kotlin.',
    keywords: 'mobile utility, React Native, Android, Kotlin, deep link tester, WebView simulator, QR generator',
    schema: 'collection',
  });
  usePageTracker('MobileUtility');
  return <SiteLayout>
    <section className="page-hero"><div className="site-container page-hero__grid"><div><p className="site-kicker">React Native · Android/Kotlin</p><h1>Mobile Utility</h1><p className="page-hero__aside">{t('mobile.intro')}</p></div></div></section>
    <div className="site-container">
      {groups.map(group => { const items = mobileItems.filter(item => group.ids.includes(item.id)); return <section key={group.title} className="utility-groups"><aside className="utility-sidebar"><small>{group.eyebrow}</small><h2>{group.title}</h2><p>{group.description}</p></aside><div className="utility-list">{items.map(item => <Link key={item.id} to={item.href} className="utility-row"><span className="utility-row__icon"><item.icon size={19} /></span><div><h3>{item.title}</h3><p>{item.description}</p><div className="site-tags site-tags--status"><span className={item.status === 'stable' ? 'is-stable' : 'is-beta'}>{item.status === 'stable' ? 'Stable' : 'Beta'}</span>{item.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}{item.requirements.map(requirement => <span key={requirement} className="is-requirement">{requirement}</span>)}</div></div><b>↗</b></Link>)}</div></section>; })}
    </div>
  </SiteLayout>;
}
