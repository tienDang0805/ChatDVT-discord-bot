import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSiteMotion } from './Mascot';

// Content is visible in SSR and without JS. Only an observed entrance animates it.
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const node = useRef<HTMLDivElement>(null);
  const entered = useRef(false);
  const { enabled } = useSiteMotion();
  useEffect(() => {
    const element = node.current;
    if (!element || !enabled || entered.current || !('IntersectionObserver' in window) || typeof element.animate !== 'function') return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || entered.current) return;
      entered.current = true;
      observer.disconnect();
      animation = element.animate([{ opacity: .25, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
    }, { threshold: .08 });
    observer.observe(element);
    return () => { observer.disconnect(); animation?.cancel(); };
  }, [enabled]);
  return <div ref={node} className={className}>{children}</div>;
}
