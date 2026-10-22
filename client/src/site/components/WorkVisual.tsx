import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';

const boxes = [{ x: 28, y: 63, w: 78, h: 105 }, { x: 131, y: 41, w: 91, h: 127 }, { x: 248, y: 75, w: 79, h: 93 }];

function MultiObjectScan() {
  return <svg viewBox="0 0 360 210" fill="none" aria-hidden="true">
    <path d="M14 39V25H29M331 25H346V39M14 177V191H29M331 191H346V177" className="vision-frame" />
    <path d="M20 177H340" className="visual-grid-line" />
    {boxes.map((box, index) => <g key={index}>
      <rect x={box.x + 5} y={box.y + 5} width={box.w - 10} height={box.h - 9} rx="3" className="vision-package" />
      <path d={`M${box.x + box.w / 2} ${box.y + 5}v22m-13 -22v15h26V${box.y + 5}`} className="vision-seam" />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="4" className={'vision-bound vision-bound--' + index} />
      <text x={box.x + 3} y={box.y - 8} className="vision-box-label">BOX 0{index + 1}</text>
      <rect x={box.x + 13} y={box.y + box.h - 40} width={box.w - 26} height="25" rx="2" className="vision-barcode-bound" />
      {Array.from({ length: 12 }, (_, bar) => <path key={bar} d={`M${box.x + 18 + bar * (box.w - 37) / 12} ${box.y + box.h - 35}v15`} strokeWidth={bar % 3 === 0 ? 2.4 : 1} className="vision-barcode" />)}
    </g>)}
    <rect x="12" y="22" width="45" height="170" className="vision-scan-wash" />
    <path d="M18 22V192" className="vision-scan-beam" />
  </svg>;
}

function RobotMap({ running }: { running: boolean }) {
  return <svg viewBox="0 0 360 210" fill="none" aria-hidden="true">
    <defs><pattern id="robot-map-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" className="map-grid" /></pattern></defs>
    <rect x="15" y="18" width="330" height="177" rx="9" fill="url(#robot-map-grid)" className="map-border" />
    <path d="M29 30H104V112H29M167 30V45M167 110V178H218V110H167M310 110V178H328" className="map-wall" />
    <path d="M42 170H130V70H280V160" className="map-route-base" />
    <path d="M42 170H130V70H280V160" className="map-route-ink" />
    <rect x="29" y="157" width="26" height="26" rx="5" className="map-dock" />
    <text x="28" y="149" className="map-label">DOCK</text>
    <circle cx="130" cy="70" r="5" className="map-checkpoint" /><text x="113" y="55" className="map-label">POINT A</text>
    <circle cx="280" cy="160" r="6" className="map-checkpoint map-checkpoint--target" /><text x="253" y="186" className="map-label">POINT B</text>
    <motion.g initial={false} animate={running ? { x: [42,130,130,280,280], y: [170,170,70,70,160] } : { x: 42, y: 170 }} transition={running ? { duration: 8, times: [0,.2,.43,.77,1], ease: 'linear', repeat: Infinity, repeatType: 'reverse' } : { duration: 0 }} className="map-robot">
      <circle r="19" className="map-robot-signal" /><circle r="11" className="map-robot-body" /><rect x="-7" y="-5" width="14" height="10" rx="4" className="map-robot-face" /><circle cx="-3" cy="-1" r="1.2" className="map-robot-eye" /><circle cx="3" cy="-1" r="1.2" className="map-robot-eye" /><path d="M0 -11V-15M-3 -15H3" className="map-robot-antenna" />
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
    <div className="work-visual-top"><span>{['MULTI-OBJECT VISION', 'APP ↔ NATIVE', 'ROBOT NAVIGATION'][kind]}</span><small>{en ? 'ILLUSTRATION' : 'MINH HOẠ'}</small></div>
    {kind === 0 ? <MultiObjectScan /> : kind === 2 ? <RobotMap running={running} /> : <div className="native-bridge" aria-hidden="true"><div className="native-bridge-nodes"><span>JS</span><i /><span>NATIVE</span><i /><span>DEVICE</span></div><div className="native-queue"><span>OFFLINE QUEUE</span><i /><i /><i /><b>↗ SYNC</b></div></div>}
    <div className="work-visual-bottom">{kind === 0 ? <><span>FRAME</span><i>→</i><strong>TFLite</strong><i>→</i><strong>ML Kit</strong></> : kind === 2 ? <><span>RN UI</span><i>→</i><strong>Java Bridge</strong><i>→</i><span>Vendor SDK</span></> : <><span>REACT NATIVE</span><i>→</i><strong>{en ? 'Real devices' : 'Thiết bị thật'}</strong></>}</div>
  </div>;
}
