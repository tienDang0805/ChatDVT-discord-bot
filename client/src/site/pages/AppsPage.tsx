import { Link } from 'react-router-dom';
import { WALLPAPER_APP } from '../../../../src/shared/desktopApps';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout } from '../components/SiteLayout';

export function AppsPage() {
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  usePageMeta(en ? 'Apps & software' : 'Ứng dụng & phần mềm', {
    description: en ? 'Apps and software built by Đặng Văn Tiến. TD-WallpaperEngine for Windows, with screenshots, downloads and source code.' : 'Các app và phần mềm Đặng Văn Tiến tự làm. TD-WallpaperEngine cho Windows, kèm ảnh giao diện, bản tải và source code.',
    schema: 'collection',
  });
  usePageTracker('Apps');
  return <SiteLayout><div className="site-container apps-page">
    <header className="apps-opening"><p className="site-kicker">{en ? 'APPS BY TIẾN' : 'APP MÌNH LÀM'}</p><h1>{en ? 'Apps & software.' : 'Ứng dụng & phần mềm.'}</h1><p>{en ? 'A few apps I made and found useful, so I’m sharing them for you to try hehe.' : 'Mấy app mình làm thấy dùng được nên chia sẻ cho ae dùng thử hehe'}</p></header>
    <article className="apps-featured">
      <Link className="apps-featured-image" to={pathFor(WALLPAPER_APP.path)} aria-label={en ? 'About TD-WallpaperEngine' : 'Xem TD-WallpaperEngine'}><img src={WALLPAPER_APP.image} alt={en ? 'TD-WallpaperEngine library and wallpaper preview on Windows' : 'Thư viện và màn hình xem trước hình nền của TD-WallpaperEngine trên Windows'} width={1380} height={880} /></Link>
      <div className="apps-featured-copy"><p className="site-kicker">WINDOWS 10 / 11 · 64-BIT</p><h2><Link to={pathFor(WALLPAPER_APP.path)}>{WALLPAPER_APP.name}</Link></h2><p>{WALLPAPER_APP.description[locale]}</p><p>{en ? 'Runs independently of Steam and Wallpaper Engine. English and Vietnamese are supported.' : 'Chạy độc lập với Steam và Wallpaper Engine. Có giao diện tiếng Việt và tiếng Anh.'}</p><div className="apps-tags"><span>{en ? 'Video wallpapers' : 'Hình nền video'}</span><span>{en ? 'Scheduled rotation' : 'Tự đổi hình nền'}</span><span>C# / WPF</span></div><div className="apps-actions"><Link className="apps-button" to={pathFor(WALLPAPER_APP.path)}>{en ? 'About the app' : 'Xem ứng dụng'} →</Link><a className="apps-text-link" href={WALLPAPER_APP.releasesUrl} target="_blank" rel="noreferrer">{en ? 'Download for Windows' : 'Tải cho Windows'} ↗</a></div></div>
    </article>
  </div></SiteLayout>;
}
