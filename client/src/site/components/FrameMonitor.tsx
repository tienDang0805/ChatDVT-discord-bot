import { useEffect, useRef, useState } from 'react';
import { Activity, X } from 'lucide-react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';
import { frameStats } from './frameStats';

export function FrameMonitor({ placement = 'floating' }: { placement?: 'floating' | 'header' }) {
  const { locale } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState<{ stats: NonNullable<ReturnType<typeof frameStats>>; samples: number[] } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    let frame = 0, previous: number | undefined, published = 0;
    const samples: number[] = [];
    const tick = (now: number) => {
      if (previous !== undefined && now > previous) {
        samples.push(now - previous);
        if (samples.length > 120) samples.shift();
      }
      previous = now;
      if (now - published >= 500 && samples.length >= 2) {
        const stats = frameStats(samples);
        if (stats) setReading({ stats, samples: samples.slice(-60) });
        published = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame); previous = undefined; samples.length = 0;
      setReading(null);
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', visibility); };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const stats = reading?.stats;
  const limit = Math.max(40, stats ? stats.cadence * 3 : 50);
  return <div className={'frame-monitor frame-monitor--' + placement} onKeyDown={event => { if (event.key === 'Escape' && open) { event.stopPropagation(); close(); } }}>
    <button ref={trigger} type="button" className="frame-monitor-trigger" aria-expanded={open} aria-controls="frame-monitor-panel" onClick={() => { setReading(null); setOpen(value => !value); }}><Activity size={14} /><span>FPS</span><i /></button>
    {open && <section id="frame-monitor-panel" className="frame-monitor-panel" aria-label={en ? 'Live frame monitor' : 'Đo FPS trực tiếp'}>
      <div className="frame-monitor-heading"><i /><h2>{en ? 'This tab, right now' : 'Tab này, ngay lúc này'}</h2><button type="button" onClick={close} aria-label={en ? 'Close FPS monitor' : 'Đóng bảng FPS'}><X size={16} /></button></div>
      <dl className="frame-monitor-stats"><div><dt>fps</dt><dd>{stats ? Math.round(stats.fps) : '—'}</dd></div><div><dt>p95 ms</dt><dd>{stats ? stats.p95.toFixed(1) : '—'}</dd></div><div><dt>RAF ≈ Hz</dt><dd>{stats?.rafHz ?? '—'}</dd></div><div><dt>CSS 3D</dt><dd className="frame-monitor-mode">{enabled ? 'on' : 'static'}</dd></div></dl>
      <svg className="frame-monitor-chart" viewBox="0 0 300 64" role="img" aria-label={en ? 'Recent frame durations; horizontal line is estimated frame budget' : 'Thời gian các frame gần nhất; đường ngang là ngân sách frame ước tính'}>
        {reading?.samples.map((value, index) => <rect key={index} x={index * 5} y={64 - Math.min(64, value / limit * 64)} width="3" height={Math.min(64, value / limit * 64)} className={value > reading.stats.cadence * 1.5 ? 'is-slow' : ''} />)}
        <line x1="0" x2="300" y1={64 - (stats?.cadence ?? 16.67) / limit * 64} y2={64 - (stats?.cadence ?? 16.67) / limit * 64} />
      </svg>
      <p>{en ? 'Measured with requestAnimationFrame. RAF cadence is estimated; this is not a GPU or monitor refresh-rate reading.' : 'Đo bằng requestAnimationFrame. Nhịp RAF là ước tính, không phải thông số GPU hay tần số màn hình.'}</p>
    </section>}
  </div>;
}
