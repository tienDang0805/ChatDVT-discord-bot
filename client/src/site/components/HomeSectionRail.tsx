import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';

const sections = [
  { id: 'home', label: ['Giới thiệu', 'Overview'] },
  { id: 'work', label: ['Công việc', 'Work'] },
  { id: 'agentic-flow', label: ['Agentic flow', 'Agentic flow'] },
  { id: 'projects', label: ['Dự án cá nhân', 'Projects'] },
  { id: 'writing', label: ['Ghi chép', 'Writing'] },
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
      sections.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * .38) next = index;
      });
      if (next !== current.current) { current.current = next; setActive(next); }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);
  function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 100, behavior: enabled ? 'smooth' : 'auto' });
  }
  return <nav className="home-section-rail" aria-label={en ? 'Homepage sections' : 'Các phần trang chủ'}>{sections.map((section,index) => <a key={section.id} href={'#' + section.id} onClick={event => go(event, section.id)} aria-current={active === index ? 'location' : undefined} aria-label={`L${index} · ${section.label[en ? 1 : 0]}`}><span className="rail-tooltip" aria-hidden="true">{section.label[en ? 1 : 0]}</span><span className="rail-circle" aria-hidden="true">L{index}</span></a>)}</nav>;
}
