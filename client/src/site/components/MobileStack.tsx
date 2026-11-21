import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useInView } from 'framer-motion';
import { ArrowLeft, ArrowRight, BatteryFull, Signal, Wifi } from 'lucide-react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';
import { MobileStackIllustration, type TechnologyId } from './MobileStackIllustration';

type TranslatedText = [vi: string, en: string];

interface OrbSpec {
  id: TechnologyId;
  label: string;
  title?: string;
  description: TranslatedText;
  caption: TranslatedText;
  color: string;
  size: 'lg' | 'md';
  // Positions in the connector diagram.
  cx: number;
  cy: number;
  portX: number;
  portY: number;
}

const ORBS: OrbSpec[] = [
  // Left Arc: App UI, TypeScript, Native Bridge, Backend API
  {
    id: 'rn',
    label: 'React Native',
    description: ['Mình làm giao diện CRM bằng React Native.', 'I build CRM interfaces with React Native.'],
    caption: ['Cùng một component trên iOS và Android', 'One component across iOS and Android'],
    color: '#61dafb',
    size: 'lg',
    cx: 47,
    cy: 86,
    portX: 158,
    portY: 118,
  },
  {
    id: 'ts',
    label: 'TypeScript',
    description: ['Mình dùng TypeScript cho blog và ChatDVT.', 'I use TypeScript for my blog and ChatDVT.'],
    caption: ['Kiểu chuyên mục dùng chung cho blog và API', 'Blog categories shared by the client and API'],
    color: '#3178c6',
    size: 'md',
    cx: 44,
    cy: 182,
    portX: 158,
    portY: 192,
  },
  {
    id: 'java',
    label: 'Java · Bridge',
    title: 'Woni Robot',
    description: ['Debug SDK hãng và bridge trên tablet Woni.', 'I debugged the vendor SDK on Woni’s tablet.'],
    caption: ['Tablet → Java → SDK hãng', 'Tablet → Java → vendor SDK'],
    color: '#f89820',
    size: 'md',
    cx: 44,
    cy: 278,
    portX: 158,
    portY: 266,
  },
  {
    id: 'nodejs',
    label: 'Node.js · Bot',
    title: 'ChatDVT',
    description: ['Bot Discord mình viết bằng Node.js và Discord.js.', 'My Discord bot built with Node.js and Discord.js.'],
    caption: ['Discord ↔ ChatDVT ↔ Gemini', 'Discord ↔ ChatDVT ↔ Gemini'],
    color: '#5fa04e',
    size: 'md',
    cx: 47,
    cy: 374,
    portX: 158,
    portY: 340,
  },
  // Right Arc: Kotlin, Android, CameraX, Native SDK
  {
    id: 'kotlin',
    label: 'Kotlin',
    description: ['Chỉ chạy nhận diện lúc chụp để preview mượt hơn.', 'Run inference at capture time to keep the preview responsive.'],
    caption: ['Kết quả đọc mã được gom theo từng hộp', 'Barcode results are grouped by box'],
    color: '#7f52ff',
    size: 'lg',
    cx: 492,
    cy: 86,
    portX: 382,
    portY: 118,
  },
  {
    id: 'android',
    label: 'Android',
    description: ['Nâng cấp app Android cũ để hỗ trợ trang nhớ 16 KB.', 'I upgraded a legacy app for 16 KB page sizes.'],
    caption: ['Gradle, NDK và thư viện native', 'Gradle, NDK and native libraries'],
    color: '#3ddc84',
    size: 'lg',
    cx: 500,
    cy: 182,
    portX: 382,
    portY: 192,
  },
  {
    id: 'camerax',
    label: 'CameraX',
    description: ['CameraX chụp ảnh, TFLite tìm hộp, ML Kit đọc mã.', 'CameraX captures, TFLite finds boxes, and ML Kit reads codes.'],
    caption: ['Nhiều mã trong từng hộp, cùng một ảnh', 'Multiple barcodes per box in one image'],
    color: '#2dd4bf',
    size: 'md',
    cx: 500,
    cy: 278,
    portX: 382,
    portY: 266,
  },
  {
    id: 'maven',
    label: 'Native SDK',
    description: ['Maven Publish phát hành từng phiên bản SDK.', 'Maven Publish releases each SDK version.'],
    caption: ['Team chọn phiên bản trong Gradle', 'Teams select the version in Gradle'],
    color: '#edc777',
    size: 'md',
    cx: 500,
    cy: 374,
    portX: 382,
    portY: 340,
  },
];

function TechLogo({ id }: { id: TechnologyId }) {
  switch (id) {
    case 'rn':
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="3.2" fill="var(--orb-c)" />
          <ellipse cx="18" cy="18" rx="13.5" ry="5.2" fill="none" stroke="var(--orb-c)" strokeWidth="2" />
          <ellipse cx="18" cy="18" rx="13.5" ry="5.2" fill="none" stroke="var(--orb-c)" strokeWidth="2" transform="rotate(60 18 18)" />
          <ellipse cx="18" cy="18" rx="13.5" ry="5.2" fill="none" stroke="var(--orb-c)" strokeWidth="2" transform="rotate(120 18 18)" />
        </svg>
      );
    case 'kotlin':
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M7 7h22L18 18 7 29z" fill="#ac7ef5" />
          <path d="M7 29l11-11 11 11z" fill="#e98675" />
        </svg>
      );
    case 'android':
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M11 13L8.5 8.6a.8.8 0 0 1 1.4-.8l2.5 4.3a12.6 12.6 0 0 1 11.2 0l2.5-4.3a.8.8 0 1 1 1.4.8L25 13a10.8 10.8 0 0 1 4.2 8.8v1.7H6.8v-1.7A10.8 10.8 0 0 1 11 13z" fill="#3ddc84" />
          <circle cx="13.8" cy="18" r="1.5" fill="#061510" />
          <circle cx="22.2" cy="18" r="1.5" fill="#061510" />
          <rect x="9" y="25" width="18" height="5" rx="2.5" fill="#3ddc84" opacity=".9" />
        </svg>
      );
    case 'ts':
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <rect x="5" y="5" width="26" height="26" rx="6" fill="#3178c6" />
          <path d="M10.5 15.2h9v2.2h-3.2V27h-2.6v-9.6h-3.2v-2.2zm15 7.5c0 2.4-1.8 3.9-4.5 3.9-1.8 0-3.2-.5-4.1-1.3l1.3-1.9c.7.6 1.7 1.1 2.7 1.1 1.1 0 1.8-.4 1.8-1.2 0-.7-.6-1-2-1.5-2-.7-3.2-1.5-3.2-3.3 0-2.1 1.7-3.5 4.1-3.5 1.6 0 2.8.4 3.6 1.1l-1.2 1.9c-.6-.4-1.5-.8-2.4-.8-1 0-1.5.4-1.5 1.1 0 .7.6 1 2 1.5 2 .7 3.4 1.5 3.4 2.9z" fill="#fff" />
        </svg>
      );
    case 'java':
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M15 6.5c2.2 2.4-2.4 4.6-.5 7.2 1.3 1.8 3.8 2.8 2.2 6M20.5 9.2c1.7 2-1.7 3.8-.3 5.8 1.1 1.4 2.8 2.4 1.3 4.8" fill="none" stroke="#f97316" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M9 22h14.5v2.8a6 6 0 0 1-6 6h-2.5a6 6 0 0 1-6-6V22z" fill="#38bdf8" />
          <path d="M23.5 22.8h2.2a2.5 2.5 0 0 1 0 5h-2.2" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
        </svg>
      );
    case 'camerax':
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <rect x="5" y="8" width="26" height="20" rx="5" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="6" fill="none" stroke="#ccfbf1" strokeWidth="2.1" />
          <circle cx="18" cy="18" r="2.5" fill="#2dd4bf" />
          <circle cx="26" cy="12.5" r="1.4" fill="#fbbf24" />
        </svg>
      );
    case 'nodejs':
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <polygon points="18,4.5 29.5,11 29.5,25 18,31.5 6.5,25 6.5,11" fill="#16a34a" />
          <path d="M14 22V13.5l8 4.8v4l-4 2.3-4-2.6z" fill="#dcfce7" />
        </svg>
      );
    case 'maven':
      return null;
  }
}

export function MobileStack() {
  const { locale } = useLanguage();
  const { demoEnabled } = useSiteMotion();
  const en = locale === 'en';
  const languageIndex = en ? 1 : 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [foreground, setForeground] = useState(false);
  const device = useRef<HTMLDivElement>(null);
  const visible = useInView(device, { amount: .25 });
  const activeOrb = ORBS[activeIndex];

  useEffect(() => {
    const update = () => setForeground(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return (
    <div className="mobile-stack mobile-stack--constellation" data-demo-motion style={{ '--msc-accent': activeOrb.color } as CSSProperties}>
      <div className="msc-stage">
        <svg className="msc-streams" viewBox="0 0 540 460" preserveAspectRatio="none" aria-hidden="true">
          {ORBS.map((orb) => {
            const controlX = orb.cx < 270 ? orb.cx + 68 : orb.cx - 68;
            const path = `M ${orb.cx} ${orb.cy} C ${controlX} ${orb.cy}, ${orb.portX} ${orb.portY}, ${orb.portX} ${orb.portY}`;
            return <path key={orb.id} d={path} className={orb.id === activeOrb.id ? 'msc-stream is-lit' : 'msc-stream'} />;
          })}
        </svg>

        <div className="msc-device-wrap" ref={device} data-running={demoEnabled && visible && foreground}>
          <div className="msc-device">
            <div className="msc-screen">
              <div className="msc-system-bar" aria-hidden="true">
                <span>10:24</span>
                <span className="msc-camera" />
                <span className="msc-system-bar__icons"><Wifi /><Signal /><BatteryFull /></span>
              </div>
              <div id="mobile-tech-detail" className="msc-screen__content" aria-live="polite" aria-atomic="true">
                <div>
                  <h3>{activeOrb.title ?? activeOrb.label}</h3>
                  <p>{activeOrb.description[languageIndex]}</p>
                </div>
                <figure className="msc-art" key={activeOrb.id}>
                  <div className="msc-art__canvas">
                    <MobileStackIllustration technology={activeOrb.id} en={en} />
                  </div>
                  <figcaption>{activeOrb.caption[languageIndex]}</figcaption>
                </figure>
              </div>
              <div className="msc-screen-nav" role="group" aria-label={en ? 'Technology navigation' : 'Điều hướng công nghệ'}>
                <button type="button" aria-controls="mobile-tech-detail" onClick={() => setActiveIndex(index => (index + ORBS.length - 1) % ORBS.length)}>
                  <ArrowLeft size={14} aria-hidden="true" />{en ? 'Back' : 'Trước'}
                </button>
                <button type="button" aria-controls="mobile-tech-detail" onClick={() => setActiveIndex(index => (index + 1) % ORBS.length)}>
                  {en ? 'Next' : 'Tiếp'}<ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="msc-home-indicator" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="msc-orbs" role="group" aria-label={en ? 'Technologies' : 'Công nghệ'}>
          {ORBS.map((orb, index) => (
            <button
              key={orb.id}
              type="button"
              className={'msc-orb msc-orb--' + orb.size}
              style={{
                left: `${orb.cx / 540 * 100}%`,
                top: `${orb.cy / 460 * 100}%`,
                '--orb-c': orb.color,
              } as CSSProperties}
              aria-controls="mobile-tech-detail"
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <span className="msc-orb__logo"><TechLogo id={orb.id} /></span>
              <span className="msc-orb__name">{orb.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
