import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';
import { MultiBoxScan } from './MobileWorkIllustrations';
import { MobileSystemsDemo } from './MobileSystemsDemo';
import { WoniLobbyDemo } from './WoniLobbyDemo';

const titles = {
  scanner: ['CameraX · Quét mã', 'CameraX · Barcode scan'],
  systems: ['React Native · Hệ thống mobile', 'React Native · Mobile systems'],
  robot: ['Woni · Sảnh ngân hàng', 'Woni · Bank lobby'],
} as const;

function ScannerDemo({ en }: { en: boolean }) {
  const [single, setSingle] = useState(false);
  return <>
    <div className="work-options work-scan-modes" role="group" aria-label={en ? 'Scan mode' : 'Chế độ quét'}>
      <button type="button" aria-pressed={single} onClick={() => setSingle(true)}>{en ? 'Single Mode' : 'Chế độ đơn'}</button>
      <button type="button" aria-pressed={!single} onClick={() => setSingle(false)}>{en ? 'Multiple Mode' : 'Chế độ nhiều'}</button>
    </div>
    <MultiBoxScan key={single ? 'single' : 'multi'} en={en} single={single} />
    <div className="work-visual-bottom">
      <span>CameraX</span><i aria-hidden="true">→</i><strong>TFLite</strong><i aria-hidden="true">→</i><strong>ML Kit</strong><i aria-hidden="true">→</i><span>SN / PID</span>
    </div>
  </>;
}

export function WorkVisual({ kind }: { kind: keyof typeof titles }) {
  const { locale } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const element = useRef<HTMLDivElement>(null);
  const visible = useInView(element, { amount: .25 });
  const [foreground, setForeground] = useState(true);
  useEffect(() => {
    const update = () => setForeground(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const running = enabled && visible && foreground;

  return <div ref={element} className={'work-visual work-visual--' + kind} data-running={running} data-motion={enabled}>
    <div className="work-visual-top">
      <span>{titles[kind][en ? 1 : 0]}</span>
      {kind === 'scanner' && <small>{en ? 'Sample data' : 'Dữ liệu mẫu'}</small>}
      {kind === 'robot' && <small>{en ? 'Simulation' : 'Mô phỏng'}</small>}
    </div>
    {kind === 'scanner' ? <ScannerDemo en={en} />
      : kind === 'systems' ? <MobileSystemsDemo en={en} />
      : <WoniLobbyDemo animate={enabled} inView={visible && foreground} en={en} />}
  </div>;
}
