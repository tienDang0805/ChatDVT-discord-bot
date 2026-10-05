import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useLanguage } from '../../shared/i18n/LanguageContext';

type Character = 'tien' | 'chatdvt';
type Action = 'idle' | 'wave' | 'talk' | 'coffee' | 'tablet-show';
interface Strip { file: string; frames: number; fps: number; loop: boolean }
interface Metadata { pageMascot: { directions: string; grid: { rows: number; cols: number } }; animations: Record<string, Strip> }
const metadata = new Map<Character, Promise<Metadata | null>>();
const Motion = createContext({ enabled: false, reduced: false, paused: false, toggle: () => {} });
const PAUSE_KEY = 'portfolio-motion-paused';

export function MascotMotion({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    try { setPaused(sessionStorage.getItem(PAUSE_KEY) === '1'); } catch { /* Optional preference. */ }
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  function toggle() {
    setPaused(value => { const next = !value; try { sessionStorage.setItem(PAUSE_KEY, next ? '1' : '0'); } catch { /* Storage is optional. */ } return next; });
  }
  return <Motion.Provider value={{ enabled: !paused && !reduced, reduced, paused, toggle }}>{children}</Motion.Provider>;
}

export function MotionControl() {
  const { enabled, reduced, toggle } = useContext(Motion);
  const { locale } = useLanguage();
  const en = locale === 'en';
  return <button type="button" className="site-motion-control" aria-pressed={!enabled} disabled={reduced} onClick={toggle}>
    {reduced ? (en ? 'Motion reduced by your device' : 'Chuyển động đã giảm theo máy') : enabled ? (en ? 'Reduce motion' : 'Giảm chuyển động') : (en ? 'Enable motion' : 'Bật chuyển động')}
  </button>;
}

export function Mascot({ character, size = 160, action = 'idle', className = '' }: { character: Character; size?: number; action?: Action; className?: string }) {
  const { enabled } = useContext(Motion);
  const actor = useRef<HTMLDivElement>(null);
  const sprite = useRef<HTMLSpanElement>(null);
  const [meta, setMeta] = useState<Metadata | null>(null);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const base = `/mascots/${character}/`;
  useEffect(() => {
    let alive = true;
    if (!metadata.has(character)) metadata.set(character, fetch(base + 'meta.json').then(r => r.ok ? r.json() : null).catch(() => null));
    void metadata.get(character)?.then(value => { if (alive) setMeta(value); });
    return () => { alive = false; };
  }, [character, base]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false), { threshold: .2 });
    if (actor.current) observer.observe(actor.current);
    const sync = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  useEffect(() => {
    const el = actor.current, art = sprite.current;
    if (!el || !art) return;
    const grid = meta?.pageMascot.grid || { rows: 3, cols: 3 };
    let interval: number | undefined, alive = true, playing = false;
    function idle(col = Math.floor(grid.cols / 2), row = Math.floor(grid.rows / 2)) {
      art!.style.backgroundImage = `url('${base + (meta?.pageMascot.directions || 'directions.webp')}')`;
      art!.style.backgroundSize = `${grid.cols * 100}% ${grid.rows * 100}%`;
      art!.style.backgroundPosition = `${col * 100 / (grid.cols - 1)}% ${row * 100 / (grid.rows - 1)}%`;
      el!.dataset.renderState = 'idle';
    }
    idle();
    const moving = enabled && visible && foreground;
    const strip = meta?.animations[action];
    if (moving && action !== 'idle' && strip) {
      const image = new Image();
      image.onload = () => {
        if (!alive) return;
        let frame = 0; playing = true;
        el.dataset.renderState = action;
        art.style.backgroundImage = `url('${base + strip.file}')`;
        art.style.backgroundSize = `${strip.frames * 100}% 100%`;
        const draw = () => { art.style.backgroundPosition = `${strip.frames > 1 ? frame * 100 / (strip.frames - 1) : 0}% 0`; };
        draw();
        // Existing kit actions run briefly; they do not keep looping next to reading text.
        interval = window.setInterval(() => {
          if (++frame >= strip.frames) { window.clearInterval(interval); playing = false; idle(); return; }
          draw();
        }, 1000 / strip.fps);
      };
      image.src = base + strip.file;
    }
    const fine = matchMedia('(pointer: fine)');
    function gaze(event: PointerEvent) {
      if (!moving || !fine.matches || playing) return;
      const r = el!.getBoundingClientRect(), dx = event.clientX - r.left - r.width / 2, dy = event.clientY - r.top - r.height / 2;
      idle(1 + (Math.abs(dx) > r.width * .35 ? Math.sign(dx) : 0), 1 + (Math.abs(dy) > r.height * .35 ? Math.sign(dy) : 0));
    }
    const center = () => { if (!playing) idle(); };
    if (moving) { window.addEventListener('pointermove', gaze, { passive: true }); document.addEventListener('pointerleave', center); }
    return () => { alive = false; window.clearInterval(interval); window.removeEventListener('pointermove', gaze); document.removeEventListener('pointerleave', center); };
  }, [action, base, enabled, foreground, meta, visible]);
  return <div ref={actor} className={'mascot-actor ' + className} data-character={character} data-render-state="idle" role="img" aria-label={character === 'tien' ? 'Mascot Tiến' : 'Mascot ChatDVT'} style={{ '--size': `${size}px` } as CSSProperties}>
    <span ref={sprite} className="mascot-sprite" style={{ backgroundImage: `url('${base}directions.webp')` }} />
  </div>;
}
