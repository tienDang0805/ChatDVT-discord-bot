import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import '../styles/index.css';
import { MascotMotion, MotionControl, useSiteMotion } from './Mascot';
import { SiteCommandPalette } from './SiteCommandPalette';
import { FrameMonitor } from './FrameMonitor';
import { ScrollLayerBackdrop } from './ScrollLayerBackdrop';
import { profile } from '../content/profileData';
import { collectionItems } from '../content/collection';

function SiteBrand() {
  return <><span className="brand-device" aria-hidden="true">DVT<i /></span><span className="brand-name"><strong>devtiendang</strong><small>{profile.role}</small></span></>;
}

function SiteLanguages() {
  const { locale, changeLocale } = useLanguage();
  return <div className="site-languages" aria-label="Language / Ngôn ngữ">{(['vi','en'] as const).map(value => <button key={value} type="button" aria-pressed={locale === value} onClick={() => changeLocale(value)}>{value.toUpperCase()}</button>)}</div>;
}

type SiteLayoutProps = { children: React.ReactNode; hideFooter?: boolean; hideFooterContact?: boolean };

export function SiteLayout(props: SiteLayoutProps) {
  return <MascotMotion><SiteFrame {...props} /></MascotMotion>;
}

function SiteFrame({ children, hideFooter = false, hideFooterContact = false }: SiteLayoutProps) {
  const { pathname, hash } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const { enabled } = useSiteMotion();
  const path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  const page = path === '/' ? 'home' : path.startsWith('/apps') ? 'apps' : path.startsWith('/blog') ? 'blog' : path === '/me' ? 'me' : path === '/chat' ? 'chat' : path === '/discord' ? 'discord' : path === '/ecosystem' ? 'ecosystem' : path === '/playground' || path === '/cicd-visualizer' ? 'playground' : 'other';
  const nav = [
    { label: 'Playground', href: '/playground' },
    { label: locale === 'en' ? 'Apps' : 'Ứng dụng', href: '/apps' },
    { label: t('nav.discord'), href: '/discord' }, { label: t('nav.chat'), href: '/chat' },
    { label: t('nav.blog'), href: '/blog' }, { label: 'Me', href: '/me' },
  ];
  const isActive = (href: string) => pathname === pathFor(href)
    || (href === '/playground' && page === 'playground')
    || (['/blog', '/apps'].includes(href) && pathname.startsWith(pathFor(`${href}/`)));

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  useEffect(() => {
    if (!hash) return;
    let targetId: string;
    try { targetId = decodeURIComponent(hash.slice(1)); } catch { return; }
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 100, behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const elements = () => [...(menu.current?.querySelectorAll<HTMLElement>('a, button') || [])];
    elements()[0]?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); menuTrigger.current?.focus(); }
      if (event.key === 'Tab') {
        const nodes = elements(), first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return <div className="site-root site-direction-b site-hybrid site-layered" data-page={page} data-motion={enabled ? 'on' : 'off'}>
    <ScrollLayerBackdrop page={page} path={path} />
    <a href="#site-main" className="site-skip-link">{locale === 'en' ? 'Skip to content' : 'Đến nội dung chính'}</a>
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link to={pathFor('/')} className="site-brand" aria-label={t('a11y.home')} onClick={() => { if (pathname === pathFor('/')) window.scrollTo({ top: 0, behavior: enabled ? 'smooth' : 'auto' }); }}><SiteBrand /></Link>
        <nav className="site-nav" aria-label={t('a11y.primaryNav')}>
          {nav.map(item => <Link key={item.href} data-nav={item.href.slice(1)} to={pathFor(item.href)} aria-current={isActive(item.href) ? 'page' : undefined} className={isActive(item.href) ? 'is-active' : ''}>{item.label}</Link>)}
        </nav>
        <div className="site-header__actions">
          <SiteCommandPalette />
          <FrameMonitor key={pathname} placement="header" />
          <MotionControl />
          <SiteLanguages />
          <button className="site-icon-button" onClick={toggleTheme} aria-label={t('a11y.changeTheme')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button ref={menuTrigger} type="button" aria-expanded={open} aria-controls="site-mobile-nav" className="site-icon-button site-menu-button" onClick={() => setOpen(true)} aria-label={t('a11y.openMenu')}><Menu size={20} /></button>
        </div>
      </div>
    </header>

    {open && <div ref={menu} id="site-mobile-nav" className="site-mobile-nav" role="dialog" aria-modal="true" aria-label={t('a11y.primaryNav')}>
      <div className="site-mobile-nav__top"><span className="site-brand"><SiteBrand /></span><SiteLanguages /><button className="site-icon-button" onClick={() => { setOpen(false); menuTrigger.current?.focus(); }} aria-label={t('a11y.closeMenu')}><X size={20} /></button></div>
      <nav>{nav.map((item, index) => <Link key={item.href} data-nav={item.href.slice(1)} aria-current={isActive(item.href) ? 'page' : undefined} to={pathFor(item.href)}><small>0{index + 1}</small>{item.label}</Link>)}</nav>
      <p>{profile.role} · React Native · Android/Kotlin</p>
      <MotionControl />
    </div>}

    <main id="site-main" tabIndex={-1}>{children}</main>
    {!hideFooter && <footer className="site-footer">
      <div className="site-container">
        {!hideFooterContact && <div className="footer-contact" id="contact"><div><p className="site-kicker">{locale === 'en' ? 'LET’S TALK' : 'LIÊN HỆ TIẾN'}</p><h2>{locale === 'en' ? 'Have a mobile project in mind?' : 'Có chuyện về mobile muốn trao đổi?'}</h2></div><a className="footer-email" href={'mailto:' + profile.email}>{locale === 'en' ? 'Send me an email' : 'Gửi email cho mình'} ↗</a></div>}
        <div className="site-footer__grid">
          <div className="footer-profile"><Link className="site-brand" to={pathFor('/')} aria-label={t('a11y.home')}><SiteBrand /></Link><h3>Đặng Văn Tiến</h3><p>{profile.role}<br />React Native · Android · Kotlin<br />{locale === 'en' ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</p><div className="footer-social"><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div>
          <div className="footer-column"><h3>{locale === 'en' ? 'Pages' : 'Các trang'}</h3><Link to={pathFor('/')}>{locale === 'en' ? 'Home' : 'Trang chủ'}</Link>{nav.map(item => <Link key={item.href} to={pathFor(item.href)}>{item.label}</Link>)}</div>
          <div className="footer-column"><h3>Playground</h3><Link to={pathFor('/playground')}>{locale === 'en' ? 'Explore Playground' : 'Khám phá Playground'} ↗</Link>{collectionItems.filter(item => item.id === 'cicd').map(item => <Link key={item.id} to={pathFor(item.href)}>{item.title}</Link>)}</div>
          <div className="footer-column footer-bot"><h3>{locale === 'en' ? 'Links' : 'Liên kết'}</h3><span className="footer-bot-label">SIDE PROJECTS · SOURCE CODE</span><p>{locale === 'en' ? 'A few side projects and their source code.' : 'Mấy project mình làm ngoài giờ và source code.'}</p><Link to={pathFor('/chat')}>{locale === 'en' ? 'Chat now' : 'Chat ngay'} ↗</Link><Link to={pathFor('/discord')}>{locale === 'en' ? 'Discord Bot' : 'Discord Bot'} ↗</Link><a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer">{locale === 'en' ? 'Source code' : 'Mã nguồn'} ↗</a></div>
        </div><div className="site-footer__meta">© 2026 Đặng Văn Tiến<span>{locale === 'en' ? 'devtiendang.blog — my personal website, where I keep things I build and find interesting.' : 'devtiendang.blog Web site cá nhân nơi lưu trữ những gì mình làm và thấy hay'}</span></div>
      </div>
    </footer>}
  </div>;
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p>{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>;
}

export function ArrowLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to} className="arrow-link"><span>{children}</span><b>↗</b></Link>;
}
