import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';
import { MultiBoxScan } from './MobileWorkIllustrations';
import { WoniLobbyDemo } from './WoniLobbyDemo';

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
    {kind === 0 ? <MultiBoxScan en={en} /> : kind === 2 ? <WoniLobbyDemo animate={enabled} inView={visible && foreground} en={en} /> : <div className="native-bridge" aria-hidden="true"><div className="native-bridge-nodes"><span>JS</span><i /><span>NATIVE</span><i /><span>DEVICE</span></div><div className="native-queue"><span>OFFLINE QUEUE</span><i /><i /><i /><b>↗ SYNC</b></div></div>}
    <div className="work-visual-bottom">{kind === 0 ? <><span>CameraX</span><i>→</i><strong>TFLite</strong><i>→</i><strong>ML Kit</strong></> : kind === 2 ? <><span>Tablet</span><i>→</i><strong>Java bridge</strong><i>→</i><span>{en ? 'Vendor SDK' : 'SDK hãng'}</span></> : <><span>REACT NATIVE</span><i>→</i><strong>{en ? 'Real devices' : 'Thiết bị thật'}</strong></>}</div>
  </div>;
}
