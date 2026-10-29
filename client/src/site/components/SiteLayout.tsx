import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, Copy, Facebook, Github, Linkedin, Mail, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import '../styles/index.css';
import { MascotMotion, MotionControl, useSiteMotion } from './Mascot';
import { SiteCommandPalette } from './SiteCommandPalette';
import { FrameMonitor } from './FrameMonitor';
import { ScrollLayerBackdrop } from './ScrollLayerBackdrop';
import { profile } from '../content/profileData';

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
  const [copiedEmail, setCopiedEmail] = useState(false);
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

  function handleCopyEmail() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profile.email).catch(() => {});
    }
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 1800);
  }

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
          <FrameMonitor placement="header" />
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
    {!hideFooter && <footer className="site-footer" id="contact">
      <div className="site-container">
        <div className="footer-ducmai">
          {!hideFooterContact && (
            <div className="footer-ducmai__intro">
              <div className="footer-ducmai__topline">
                <span className="footer-ducmai__kicker">
                  <b>04</b>
                  <i aria-hidden="true" />
                  {locale === 'en' ? 'CONTACT / DEVTIENDANG.BLOG' : 'LIÊN HỆ / DEVTIENDANG.BLOG'}
                </span>
                <span className="footer-ducmai__status">
                  <i aria-hidden="true" />
                  {locale === 'en' ? 'HO CHI MINH CITY · AVAILABLE' : 'TP. HỒ CHÍ MINH · SẴN SÀNG KẾT NỐI'}
                </span>
              </div>

              <h2 className="footer-ducmai__headline">
                {locale === 'en' ? (
                  <>
                    Have a <em>React Native</em> or <em>Kotlin</em> project in mind? <span>Say hello.</span>
                  </>
                ) : (
                  <>
                    Có chuyện về <em>React Native</em> hay <em>Kotlin</em> muốn trao đổi? <span>Kết nối nhé.</span>
                  </>
                )}
              </h2>
            </div>
          )}

          <div className="footer-ducmai__cards" role="list">
            <div className="footer-card footer-card--email" role="listitem">
              <span className="footer-card__sheen" aria-hidden="true" />
              <a className="footer-card__link" href={'mailto:' + profile.email}>
                <div className="footer-card__top">
                  <span className="footer-card__badge">
                    <Mail size={14} strokeWidth={1.8} aria-hidden="true" />
                    01 // DIRECT
                  </span>
                </div>
                <strong className="footer-card__title">
                  Email <span aria-hidden="true">↗</span>
                </strong>
                <small className="footer-card__handle">{profile.email}</small>
              </a>
              <button
                type="button"
                className={'footer-card__copy' + (copiedEmail ? ' is-copied' : '')}
                onClick={handleCopyEmail}
                title={copiedEmail ? (locale === 'en' ? 'Copied!' : 'Đã chép!') : (locale === 'en' ? 'Copy email' : 'Chép email')}
                aria-label={locale === 'en' ? 'Copy email address' : 'Sao chép địa chỉ email'}
              >
                {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedEmail ? (locale === 'en' ? 'Copied' : 'Đã chép') : 'Copy'}</span>
              </button>
            </div>

            <a className="footer-card footer-card--linkedin" role="listitem" href={profile.linkedin} target="_blank" rel="noreferrer">
              <span className="footer-card__sheen" aria-hidden="true" />
              <div className="footer-card__top">
                <span className="footer-card__badge">
                  <Linkedin size={14} strokeWidth={1.8} aria-hidden="true" />
                  02 // NETWORK
                </span>
                <em className="footer-card__tag">PRO</em>
              </div>
              <strong className="footer-card__title">
                LinkedIn <span aria-hidden="true">↗</span>
              </strong>
              <small className="footer-card__handle">in/đặng-văn-tiến</small>
            </a>

            <a className="footer-card footer-card--github" role="listitem" href={profile.github} target="_blank" rel="noreferrer">
              <span className="footer-card__sheen" aria-hidden="true" />
              <div className="footer-card__top">
                <span className="footer-card__badge">
                  <Github size={14} strokeWidth={1.8} aria-hidden="true" />
                  03 // CODE &amp; SDK
                </span>
                <em className="footer-card__tag">REPOS</em>
              </div>
              <strong className="footer-card__title">
                GitHub <span aria-hidden="true">↗</span>
              </strong>
              <small className="footer-card__handle">@tienDang0805</small>
            </a>

            <a className="footer-card footer-card--facebook" role="listitem" href={profile.facebook} target="_blank" rel="noreferrer">
              <span className="footer-card__sheen" aria-hidden="true" />
              <div className="footer-card__top">
                <span className="footer-card__badge">
                  <Facebook size={14} strokeWidth={1.8} aria-hidden="true" />
                  04 // SOCIAL
                </span>
                <em className="footer-card__tag">DIRECT</em>
              </div>
              <strong className="footer-card__title">
                Facebook <span aria-hidden="true">↗</span>
              </strong>
              <small className="footer-card__handle">fb.com/dvtien8599</small>
            </a>
          </div>
        </div>
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
