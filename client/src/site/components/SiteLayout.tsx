import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../shared/contexts/ThemeContext';

const nav = [
  { label: 'Playground', href: '/playground' },
  { label: 'Mobile', href: '/mobile' },
  { label: 'Discord Bot', href: '/discord' },
  { label: 'Blog', href: '/blog' },
  { label: 'Me', href: '/me' },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return <div className="site-root">
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link to="/" className="site-wordmark" aria-label="Tiến Đặng home"><span>Tiến Đặng</span><i>.</i></Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {nav.map(item => <Link key={item.href} to={item.href} className={pathname === item.href || (item.href === '/blog' && pathname.startsWith('/blog/')) ? 'is-active' : ''}>{item.label}</Link>)}
        </nav>
        <div className="site-header__actions">
          <a className="site-icon-button" href="https://github.com/tienDang0805" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
          <button className="site-icon-button" onClick={toggleTheme} aria-label="Đổi giao diện">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="site-icon-button site-menu-button" onClick={() => setOpen(true)} aria-label="Mở menu"><Menu size={20} /></button>
        </div>
      </div>
    </header>

    {open && <div className="site-mobile-nav" role="dialog" aria-modal="true">
      <div className="site-mobile-nav__top"><span className="site-wordmark"><span>Tiến Đặng</span><i>.</i></span><button className="site-icon-button" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={20} /></button></div>
      <nav>{nav.map((item, index) => <Link key={item.href} to={item.href}><small>0{index + 1}</small>{item.label}</Link>)}</nav>
      <p>Mobile Developer · React Native · Android/Kotlin</p>
    </div>}

    <main>{children}</main>
    <footer className="site-footer">
      <div className="site-container site-footer__grid">
        <div><span className="site-wordmark"><span>Tiến Đặng</span><i>.</i></span><p>Mobile Developer — React Native và Android/Kotlin.</p></div>
        <div className="site-footer__links"><Link to="/playground">Playground</Link><Link to="/mobile">Mobile</Link><Link to="/discord">Discord Bot</Link><Link to="/blog">Blog</Link><Link to="/me">Me</Link></div>
        <div className="site-footer__meta">© 2026 · TP. Hồ Chí Minh<br />React · TypeScript</div>
      </div>
    </footer>
  </div>;
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p>{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>;
}

export function ArrowLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to} className="arrow-link"><span>{children}</span><b>↗</b></Link>;
}
