import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';

const sections = [
  { id: 'home', code: '00', label: ['Mở đầu', 'Overview'] },
  { id: 'work', code: '01', label: ['Công việc', 'Work'] },
  { id: 'agentic-flow', code: 'AI', label: ['Agentic Flow', 'Agentic flow'] },
  { id: 'projects', code: '02', label: ['Dự án', 'Projects'] },
  { id: 'writing', code: '03', label: ['Ghi chép', 'Writing'] },
  { id: 'contact', code: '04', label: ['Liên hệ', 'Contact'] },
] as const;

export function HomeSectionRail() {
  const { locale } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const [active, setActive] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let next = 0;
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120;
      if (nearBottom) {
        next = sections.length - 1;
      } else {
        sections.forEach((section, index) => {
          const element = document.getElementById(section.id);
          if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.42) next = index;
        });
      }
      if (next !== current.current) {
        current.current = next;
        setActive(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 92,
      behavior: enabled ? 'smooth' : 'auto',
    });
  }

  return (
    <nav className="home-section-rail" aria-label={en ? 'Homepage sections' : 'Mục lục trang chủ'}>
      {sections.map((section, index) => {
        const isCurrent = active === index;
        const name = section.label[en ? 1 : 0];
        return (
          <a
            key={section.id}
            href={'#' + section.id}
            onClick={(event) => go(event, section.id)}
            aria-current={isCurrent ? 'location' : undefined}
            aria-label={`${section.code} · ${name}`}
            className={isCurrent ? 'is-active' : undefined}
          >
            <span className="rail-tooltip" aria-hidden="true">
              <i className="rail-status-dot" />
              <b>{name}</b>
            </span>
            <span className="rail-circle" aria-hidden="true">
              {section.code}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
