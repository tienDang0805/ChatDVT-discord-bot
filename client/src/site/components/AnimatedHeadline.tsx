import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { MotionStyle, MotionValue } from 'framer-motion';
import { useSiteMotion } from './Mascot';

type Point = { x: number; y: number };
function Glyph({ letter, index, count, center, pointerX, pointerY, active }: { letter: string; index: number; count: number; center: Point; pointerX: MotionValue<number>; pointerY: MotionValue<number>; active: MotionValue<number> }) {
  const influence = useTransform([pointerX, pointerY, active], ([x,y,on]: number[]) => on ? Math.max(0, 1 - Math.hypot(x - center.x, (y - center.y) * 1.25) / 95) : 0);
  const proximity = useSpring(influence, { stiffness: 320, damping: 28, mass: .6 });
  const y = useTransform(proximity, value => -8 * value);
  const scale = useTransform(proximity, value => 1 + .085 * value);
  return <motion.span className="headline-letter" style={{ y, scale, '--hover-influence': proximity, '--letter-tone': `${index / Math.max(count - 1, 1) * 100}%`, '--letter-color': ['var(--layered-amber)', 'var(--headline-lilac)', 'var(--headline-blue)', 'var(--site-cool)'][Math.floor(index / count * 4)] } as MotionStyle}>{letter === ' ' ? '\u00a0' : letter}</motion.span>;
}

// The heading keeps a single accessible name; decorative glyphs animate without reflow.
export function AnimatedHeadline({ lines, id, className = 'lh-headline lh-enter' }: { lines: string[]; id: string; className?: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const text = lines.join('\n');
  const { enabled } = useSiteMotion();
  const [centers, setCenters] = useState<Point[]>([]);
  const pointerX = useMotionValue(-1000), pointerY = useMotionValue(-1000), active = useMotionValue(0);
  useEffect(() => {
    const element = heading.current;
    if (!element) return;
    let alive = true;
    const measure = () => {
      if (alive) setCenters([...element.querySelectorAll<HTMLElement>('.headline-letter')].map(glyph => ({ x: glyph.offsetLeft + glyph.offsetWidth / 2, y: glyph.offsetTop + glyph.offsetHeight / 2 })));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element); measure();
    void document.fonts.ready.then(measure);
    return () => { alive = false; observer.disconnect(); };
  }, [text]);
  useEffect(() => { if (!enabled) active.set(0); }, [enabled, active]);
  function track(event: PointerEvent<HTMLHeadingElement>) {
    if (!enabled || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - bounds.left); pointerY.set(event.clientY - bounds.top); active.set(1);
  }
  return <h1 ref={heading} id={id} className={className} aria-label={lines.join(' ')} onPointerEnter={track} onPointerMove={track} onPointerLeave={() => active.set(0)}>
    {lines.map((line, row) => <span key={line} className={'headline-line' + (row === 1 ? ' headline-line--accent' : '')} aria-hidden="true">{Array.from(line.normalize('NFC')).map((letter, index, letters) => <Glyph key={index} letter={letter} index={index} count={letters.length} center={centers[lines.slice(0, row).reduce((sum, previous) => sum + Array.from(previous.normalize('NFC')).length, 0) + index] || { x: 0, y: 0 }} pointerX={pointerX} pointerY={pointerY} active={active} />)}</span>)}
  </h1>;
}
