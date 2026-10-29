import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, X } from 'lucide-react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { frameStats } from './frameStats';

const STORAGE_KEY = 'dvt_fps_pill_open';

export function FrameMonitor({ placement = 'floating' }: { placement?: 'floating' | 'header' }) {
  const { locale } = useLanguage(), en = locale === 'en';
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fps, setFps] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const isDesktop = window.innerWidth > 960;
      setOpen(saved === null ? isDesktop : saved === '1');
    } catch {
      setOpen(window.innerWidth > 960);
    }
  }, []);

  function updateOpen(next: boolean) {
    setOpen(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* ignore storage errors */
    }
  }

  useEffect(() => {
    if (!open) {
      setFps(null);
      return;
    }
    let frame = 0;
    let previous: number | undefined;
    let published = 0;
    const samples: number[] = [];

    const tick = (now: number) => {
      if (previous !== undefined && now > previous) {
        samples.push(now - previous);
        if (samples.length > 120) samples.shift();
      }
      previous = now;
      if (now - published >= 450 && samples.length >= 2) {
        const stats = frameStats(samples);
        if (stats) setFps(Math.round(stats.fps));
        published = now;
      }
      frame = requestAnimationFrame(tick);
    };

    const visibility = () => {
      cancelAnimationFrame(frame);
      previous = undefined;
      samples.length = 0;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };

    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [open]);

  const close = () => {
    updateOpen(false);
    trigger.current?.focus();
  };

  const pill = open && mounted ? (
    <aside
      id="frame-monitor-panel"
      className="frame-monitor-pill"
      aria-label={en ? 'Live frame monitor' : 'Đo FPS trực tiếp'}
    >
      <i className="frame-monitor-pill__dot" aria-hidden="true" />
      <span className="frame-monitor-pill__label">
        {en ? 'This tab, right now' : 'Tab này, ngay lúc này'}
      </span>
      <span className="frame-monitor-pill__fps">
        <strong>{fps ?? 60}</strong> fps
      </span>
      <button
        type="button"
        className="frame-monitor-pill__close"
        onClick={close}
        aria-label={en ? 'Hide FPS monitor' : 'Ẩn thẻ đo FPS'}
        title={en ? 'Hide FPS monitor' : 'Ẩn thẻ đo FPS'}
      >
        <X size={14} strokeWidth={2.2} />
      </button>
    </aside>
  ) : null;

  return (
    <div
      className={'frame-monitor frame-monitor--' + placement}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={'frame-monitor-trigger' + (open ? ' is-active' : '')}
        aria-pressed={open}
        aria-expanded={open}
        aria-controls="frame-monitor-panel"
        onClick={() => updateOpen(!open)}
        title={
          open
            ? en
              ? 'Turn off FPS pill'
              : 'Tắt thẻ đo FPS'
            : en
              ? 'Turn on FPS pill'
              : 'Bật thẻ đo FPS'
        }
      >
        <Activity size={14} />
        <span>FPS</span>
        <i />
      </button>
      {mounted && typeof document !== 'undefined' ? createPortal(pill, document.body) : null}
    </div>
  );
}
