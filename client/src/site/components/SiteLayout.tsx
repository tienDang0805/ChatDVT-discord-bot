import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import '../styles/index.css';

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
    { label: t('nav.mobile'), href: '/mobile' }, { label: t('nav.projects'), href: '/playground' },
    { label: t('nav.discord'), href: '/discord' }, { label: t('nav.chat'), href: '/chat' },
    { label: t('nav.blog'), href: '/blog' }, { label: t('nav.about'), href: '/me' },
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

  return <div className="site-root">
    <a href="#site-main" className="site-skip-link">{locale === 'en' ? 'Skip to content' : 'Đến nội dung chính'}</a>
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link to={pathFor('/')} className="site-wordmark" aria-label={t('a11y.home')}><span>Đặng Văn Tiến</span><i>.</i></Link>
        <nav className="site-nav" aria-label={t('a11y.primaryNav')}>
          {nav.map(item => <Link key={item.href} to={pathFor(item.href)} aria-current={pathname === pathFor(item.href) || (item.href === '/blog' && pathname.startsWith(pathFor('/blog/'))) ? 'page' : undefined} className={pathname === pathFor(item.href) || (item.href === '/blog' && pathname.startsWith(pathFor('/blog/'))) ? 'is-active' : ''}>{item.label}</Link>)}
        </nav>
        <div className="site-header__actions">
          <a className="site-icon-button" href="https://github.com/tienDang0805" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
          <SiteLanguages />
          <button className="site-icon-button" onClick={toggleTheme} aria-label={t('a11y.changeTheme')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button ref={menuTrigger} type="button" aria-expanded={open} aria-controls="site-mobile-nav" className="site-icon-button site-menu-button" onClick={() => setOpen(true)} aria-label={t('a11y.openMenu')}><Menu size={20} /></button>
        </div>
      </div>
    </header>

    {open && <div ref={menu} id="site-mobile-nav" className="site-mobile-nav" role="dialog" aria-modal="true" aria-label={t('a11y.primaryNav')}>
      <div className="site-mobile-nav__top"><span className="site-wordmark"><span>Đặng Văn Tiến</span><i>.</i></span><SiteLanguages /><button className="site-icon-button" onClick={() => { setOpen(false); menuTrigger.current?.focus(); }} aria-label={t('a11y.closeMenu')}><X size={20} /></button></div>
      <nav>{nav.map((item, index) => <Link key={item.href} to={pathFor(item.href)}><small>0{index + 1}</small>{item.label}</Link>)}</nav>
      <p>Mobile Developer · React Native · Android/Kotlin</p>
    </div>}

    <main id="site-main" tabIndex={-1}>{children}</main>
    {!hideFooter && <footer className="site-footer">
      <div className="site-container site-footer__grid">
        <div><span className="site-wordmark"><span>Đặng Văn Tiến</span><i>.</i></span><p>{t('footer.role')}</p></div>
        <div className="site-footer__links">{nav.map(item => <Link key={item.href} to={pathFor(item.href)}>{item.label}</Link>)}</div>
        <div className="site-footer__meta">© 2026 · {locale === 'en' ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}<br />React · TypeScript</div>
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
