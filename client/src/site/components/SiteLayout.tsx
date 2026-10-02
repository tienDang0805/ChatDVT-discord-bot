import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import '../styles/index.css';
import { MascotMotion, MotionControl } from './Mascot';
import { profile } from '../content/profileData';

function SiteBrand() {
  return <><span className="brand-device" aria-hidden="true">DVT<i /></span><span className="brand-name"><strong>devtiendang</strong><small>Mobile Developer</small></span></>;
}

function SiteLanguages() {
  const { locale, changeLocale } = useLanguage();
  return <div className="site-languages" aria-label="Language / Ngôn ngữ">{(['vi','en'] as const).map(value => <button key={value} type="button" aria-pressed={locale === value} onClick={() => changeLocale(value)}>{value.toUpperCase()}</button>)}</div>;
}

export function SiteLayout({ children, hideFooter = false }: { children: React.ReactNode; hideFooter?: boolean }) {
  const { pathname, hash } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const nav = [
    { label: 'Playground', href: '/playground' },
    { label: t('nav.discord'), href: '/discord' }, { label: t('nav.chat'), href: '/chat' },
    { label: t('nav.blog'), href: '/blog' }, { label: 'Me', href: '/me' },
  ];

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const frame = window.requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'auto' });
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

  return <MascotMotion><div className="site-root site-direction-b site-hybrid">
    <a href="#site-main" className="site-skip-link">{locale === 'en' ? 'Skip to content' : 'Đến nội dung chính'}</a>
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link to={pathFor('/')} className="site-brand" aria-label={t('a11y.home')}><SiteBrand /></Link>
        <nav className="site-nav" aria-label={t('a11y.primaryNav')}>
          {nav.map(item => <Link key={item.href} to={pathFor(item.href)} aria-current={pathname === pathFor(item.href) || (item.href === '/blog' && pathname.startsWith(pathFor('/blog/'))) ? 'page' : undefined} className={pathname === pathFor(item.href) || (item.href === '/blog' && pathname.startsWith(pathFor('/blog/'))) ? 'is-active' : ''}>{item.label}</Link>)}
        </nav>
        <div className="site-header__actions">
          <MotionControl />
          <SiteLanguages />
          <button className="site-icon-button" onClick={toggleTheme} aria-label={t('a11y.changeTheme')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button ref={menuTrigger} type="button" aria-expanded={open} aria-controls="site-mobile-nav" className="site-icon-button site-menu-button" onClick={() => setOpen(true)} aria-label={t('a11y.openMenu')}><Menu size={20} /></button>
        </div>
      </div>
    </header>

    {open && <div ref={menu} id="site-mobile-nav" className="site-mobile-nav" role="dialog" aria-modal="true" aria-label={t('a11y.primaryNav')}>
      <div className="site-mobile-nav__top"><span className="site-brand"><SiteBrand /></span><SiteLanguages /><button className="site-icon-button" onClick={() => { setOpen(false); menuTrigger.current?.focus(); }} aria-label={t('a11y.closeMenu')}><X size={20} /></button></div>
      <nav>{nav.map((item, index) => <Link key={item.href} to={pathFor(item.href)}><small>0{index + 1}</small>{item.label}</Link>)}</nav>
      <p>Mobile Developer · React Native · Android/Kotlin</p>
      <MotionControl />
    </div>}

    <main id="site-main" tabIndex={-1}>{children}</main>
    {!hideFooter && <footer className="site-footer">
      <div className="site-container">
        <div className="footer-contact"><div><p className="site-kicker">{locale === 'en' ? 'LET’S TALK' : 'LIÊN HỆ TIẾN'}</p><h2>{locale === 'en' ? 'Have a mobile project in mind?' : 'Có chuyện về mobile muốn trao đổi?'}</h2></div><a className="footer-email" href={'mailto:' + profile.email}>{locale === 'en' ? 'Send me an email' : 'Gửi email cho mình'} ↗</a></div>
        <div className="site-footer__grid">
          <div className="footer-profile"><Link className="site-brand" to={pathFor('/')} aria-label={t('a11y.home')}><SiteBrand /></Link><h3>Đặng Văn Tiến</h3><p>Mobile Software Engineer<br />React Native · Android · Kotlin<br />{locale === 'en' ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</p><div className="footer-social"><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div>
          <div className="footer-column"><h3>{locale === 'en' ? 'Explore' : 'Khám phá'}</h3><Link to={pathFor('/')}>{locale === 'en' ? 'Home' : 'Trang chủ'}</Link>{nav.map(item => <Link key={item.href} to={pathFor(item.href)}>{item.label}</Link>)}</div>
          <div className="footer-column"><h3>{locale === 'en' ? 'Explore Playground' : 'Khám phá Playground'}</h3><Link to={pathFor('/playground?category=mobile')}>{locale === 'en' ? 'Mobile experiments' : 'Thử nghiệm Mobile'} ↗</Link><Link to={pathFor('/playground?category=tools')}>{locale === 'en' ? 'Try a tool' : 'Nghịch một tool'} ↗</Link><Link to={pathFor('/playground?category=fun')}>{locale === 'en' ? 'Games & fun' : 'Game & giải trí'} ↗</Link><Link to="/deeplink-tester">Deep Link Tester</Link><Link to="/qr-generator">QR Generator</Link></div>
          <div className="footer-column footer-bot"><h3>ChatDVT</h3><span className="footer-bot-label">AI CHAT BOT · WEB & DISCORD</span><p>{locale === 'en' ? 'Tiến’s AI chat bot. Here to chat and introduce this website, and available on Discord too.' : 'AI chat bot của Tiến. Trò chuyện, giới thiệu website này và cũng có mặt trên Discord.'}</p><Link to={pathFor('/chat')}>{locale === 'en' ? 'Chat now' : 'Chat ngay'} ↗</Link><Link to={pathFor('/discord')}>{locale === 'en' ? 'ChatDVT on Discord' : 'ChatDVT trên Discord'} ↗</Link><a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer">{locale === 'en' ? 'Source code' : 'Mã nguồn'} ↗</a></div>
        </div><div className="site-footer__meta">© 2026 Đặng Văn Tiến<span>{locale === 'en' ? 'Mobile work, side projects and stories about ChatDVT.' : 'Công việc mobile, side project và chuyện về ChatDVT.'}</span></div>
      </div>
    </footer>}
  </div></MascotMotion>;
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p>{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>;
}

export function ArrowLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to} className="arrow-link"><span>{children}</span><b>↗</b></Link>;
}
