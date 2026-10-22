import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useSiteMotion } from './Mascot';
import { SceneSurface } from './SceneSurface';

const layers = [
  { id: 'home', name: 'REACT NATIVE / INTERFACE', foot: 'COMPONENTS · STATE · NAVIGATION' },
  { id: 'work', name: 'ANDROID / NATIVE SDK', foot: 'KOTLIN · JAVA · DEVICE BRIDGE' },
  { id: 'agentic-flow', name: 'ANTIGRAVITY / CODEX', foot: 'PLAN → BUILD → REVIEW → VERIFY' },
  { id: 'projects', name: 'CHATDVT / MESSAGE FLOW', foot: 'DISCORD.JS · EC2 · GEMINI' },
  { id: 'writing', name: 'DEVTIENDANG / NOTES', foot: 'MOBILE · SIDE PROJECTS · BLOG' },
];
const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));

/** One fixed 3D scene; frame values are updated directly, without React renders. */
export function ScrollLayerBackdrop({ page = 'home', path = '/' }: { page?: string; path?: string }) {
  const { enabled } = useSiteMotion();
  const root = useRef<HTMLDivElement>(null), camera = useRef<HTMLDivElement>(null);
  const planes = useRef<(HTMLDivElement | null)[]>([]);
  const quiet = page === 'chat' || path.includes('/blog/') || path.includes('cicd-visualizer');
  useEffect(() => {
    const scene = root.current, rig = camera.current;
    if (!scene || !rig) return;
    let frame = 0, previous = 0, anchors: number[] = [], travel = 1;
    let target = 0, progress = 0, pointerX = 0, pointerY = 0, x = 0, y = 0;
    let hasDrawn = false;
    const home = page === 'home';
    const main = document.getElementById('site-main');
    const fine = matchMedia('(pointer: fine)');
    const measure = () => {
      anchors = layers.map((layer, i) => i === 0 ? 0 : Math.max(1, (document.getElementById(layer.id)?.getBoundingClientRect().top ?? 0) + window.scrollY - window.innerHeight * .4));
      travel = Math.max(window.innerHeight * 1.15, (main?.scrollHeight ?? 0) - window.innerHeight * .35);
    };
    const sample = () => {
      target = 0;
      if (home) {
        for (let i = 0; i < anchors.length - 1; i++) if (window.scrollY >= anchors[i]) target = i + clamp((window.scrollY - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]));
      } else target = clamp(window.scrollY / travel) * 4;
      if (!enabled) target = Math.floor(target);
    };
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      const dt = previous ? Math.min(64, Math.max(0, now - previous)) : 16;
      previous = now;
      const blend = enabled ? 1 - Math.exp(-dt / 110) : 1;
      progress += (target - progress) * blend;
      x += ((enabled ? pointerX : 0) - x) * blend;
      y += ((enabled ? pointerY : 0) - y) * blend;
      const active = Math.min(4, Math.floor(progress + .001));
      scene.dataset.layer = String(active);
      scene.dataset.progress = progress.toFixed(3);
      scene.style.setProperty('--scene-reveal', String(home ? clamp(window.scrollY / Math.max(1, anchors[1] * .7)) : 1));
      rig.style.transform = `rotateX(${53 + y * 4}deg) rotateY(${-9 + x * 7}deg) rotateZ(${-29 + x * 2 + progress * .8}deg)`;
      planes.current.forEach((plane, i) => {
        if (!plane) return;
        const distance = i - progress;
        const peel = clamp(-distance), eased = peel * peel * (3 - 2 * peel);
        plane.style.transform = `translate3d(${eased * 660}px,${-eased * 430}px,${-Math.max(0, distance) * 83 + eased * 260}px) rotateZ(${eased * 15}deg) rotateX(${-eased * 9}deg)`;
        plane.style.opacity = String(distance < -1 ? 0 : (1 - eased) * (i === active ? 1 : .83));
        plane.dataset.active = String(i === active);
      });
      if (enabled && (Math.abs(target - progress) > .001 || Math.abs(pointerX - x) > .001 || Math.abs(pointerY - y) > .001)) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); };
    const scroll = () => { sample(); schedule(); };
    const resize = () => { measure(); sample(); if (!hasDrawn) { progress = target; hasDrawn = true; } schedule(); };
    const pointer = (event: PointerEvent) => {
      if (!enabled || !fine.matches || window.innerWidth < 760 || event.pointerType !== 'mouse') return;
      pointerX = clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
      pointerY = clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);
      schedule();
    };
    const leave = () => { pointerX = 0; pointerY = 0; schedule(); };
    const visibility = () => {
      scene.dataset.visible = String(!document.hidden);
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (!document.hidden) resize();
    };
    const observer = new ResizeObserver(resize);
    if (main) observer.observe(main);
    if (home) layers.forEach(layer => { const section = document.getElementById(layer.id); if (section) observer.observe(section); });
    resize(); visibility();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', pointer, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', pointer); document.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', visibility); };
  }, [enabled, page, path]);
  return <div ref={root} className={'site-depth-scene' + (quiet ? ' site-depth-scene--quiet' : '')} style={{ '--scene-reveal': page === 'home' ? 0 : 1 } as CSSProperties} data-motion={enabled ? 'on' : 'off'} data-visible="true" aria-hidden="true">
    <div className="scene-atmosphere" />
    <div className="scene-dust">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${42 + (i * 23 % 57)}%`, top: `${8 + (i * 17 % 83)}%`, animationDelay: `${-i * 1.7}s`, animationDuration: `${13 + i % 5 * 3}s` }} />)}</div>
    <div className="scene-perspective"><div className="scene-float"><div ref={camera} className="scene-camera">
      <div className="scene-foundation" />
      {layers.map((layer, i) => <div key={layer.id} ref={el => { planes.current[i] = el; }} className={'scene-glass scene-glass--' + i} style={{ transform: `translateZ(${-i * 83}px)` }}>
        <div className="scene-glass-header"><span><i />{layer.name}</span><small>0{i + 1}</small></div>
        <SceneSurface index={i} />
        <div className="scene-glass-footer"><span>{layer.foot}</span><i /><i /><i /></div>
      </div>)}
    </div></div></div>
    <div className="scene-reading-shade" />
  </div>;
}
