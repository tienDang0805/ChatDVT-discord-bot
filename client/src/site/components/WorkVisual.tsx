import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';
import { MultiBoxScan, TabletRobot } from './MobileWorkIllustrations';

function RobotMap({ running, en }: { running: boolean; en: boolean }) {
  return <svg viewBox="0 0 360 210" fill="none" aria-hidden="true">
    <defs><pattern id="robot-map-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" className="map-grid" /></pattern></defs>
    <rect x="15" y="18" width="330" height="177" rx="9" fill="url(#robot-map-grid)" className="map-border" />
    <path d="M29 30H104V112H29M167 30V45M167 110V178H218V110H167M310 110V178H328" className="map-wall" />
    <path d="M42 170H130V70H280V160" className="map-route-base" />
    <path d="M42 170H130V70H280V160" className="map-route-ink" />
    <rect x="29" y="157" width="26" height="26" rx="5" className="map-dock" />
    <text x="28" y="149" className="map-label">{en ? 'Dock' : 'Đế sạc'}</text>
    <circle cx="130" cy="70" r="4" className="map-checkpoint" />
    <circle cx="280" cy="160" r="6" className="map-checkpoint map-checkpoint--target" /><text x="280" y="187" textAnchor="middle" className="map-label">{en ? 'Counter' : 'Quầy giao dịch'}</text>
    <motion.g initial={false} animate={running ? { x: [42,130,130,280,280], y: [170,170,70,70,160] } : { x: 42, y: 170 }} transition={running ? { duration: 8, times: [0,.2,.43,.77,1], ease: 'linear', repeat: Infinity, repeatType: 'reverse' } : { duration: 0 }} className="map-robot">
      <g transform="scale(.56)"><TabletRobot /></g>
    </motion.g>
  </svg>;
}

export function WorkVisual({ kind }: { kind: number }) {
  const { locale } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const element = useRef<HTMLDivElement>(null);
  const visible = useInView(element, { amount: .3 });
  const [foreground, setForeground] = useState(true);
  useEffect(() => {
    const update = () => setForeground(!document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const running = enabled && visible && foreground;
  return <div ref={element} className={'work-visual work-visual--' + kind} data-running={running}>
    <div className="work-visual-top"><span>{['MULTI-OBJECT VISION', 'APP ↔ NATIVE', (en ? 'WONI TABLET CONTROL' : 'ĐIỀU KHIỂN WONI TỪ TABLET')][kind]}</span><small>{en ? 'ILLUSTRATION' : 'MINH HOẠ'}</small></div>
    {kind === 0 ? <MultiBoxScan /> : kind === 2 ? <RobotMap running={running} en={en} /> : <div className="native-bridge" aria-hidden="true"><div className="native-bridge-nodes"><span>JS</span><i /><span>NATIVE</span><i /><span>DEVICE</span></div><div className="native-queue"><span>OFFLINE QUEUE</span><i /><i /><i /><b>↗ SYNC</b></div></div>}
    <div className="work-visual-bottom">{kind === 0 ? <><span>CameraX</span><i>→</i><strong>TFLite</strong><i>→</i><strong>ML Kit</strong></> : kind === 2 ? <><span>Tablet</span><i>→</i><strong>Java bridge</strong><i>→</i><span>{en ? 'Vendor SDK' : 'SDK hãng'}</span></> : <><span>REACT NATIVE</span><i>→</i><strong>{en ? 'Real devices' : 'Thiết bị thật'}</strong></>}</div>
  </div>;
}
