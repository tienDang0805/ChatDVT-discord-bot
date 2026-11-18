import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';
import { MobileStackIllustration, type TechnologyId } from './MobileStackIllustration';

type TranslatedText = [vi: string, en: string];

interface OrbSpec {
  id: TechnologyId;
  label: string;
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
    color: '#65c7ef',
    size: 'lg',
    cx: 47,
    cy: 86,
    portX: 158,
    portY: 118,
  },
  {
    id: 'ts',
    label: 'TypeScript',
    description: ['Khai báo kiểu cho dữ liệu app nhận từ SDK.', 'Define the shape of data an app receives from an SDK.'],
    caption: ['Ví dụ dữ liệu khi quét mã', 'Example scan result'],
    color: '#80a6f4',
    size: 'md',
    cx: 44,
    cy: 182,
    portX: 158,
    portY: 192,
  },
  {
    id: 'java',
    label: 'Java · Bridge',
    description: ['Mình viết bridge Java để app gọi SDK của robot.', 'Java connects the app to the robot SDK.'],
    caption: ['React Native → Java → SDK robot', 'React Native → Java → robot SDK'],
    color: '#e7a37d',
    size: 'md',
    cx: 44,
    cy: 278,
    portX: 158,
    portY: 266,
  },
  {
    id: 'nodejs',
    label: 'Node.js · API',
    description: ['ChatDVT nhận tin nhắn Discord rồi gọi Gemini.', 'ChatDVT sends Discord chats to Gemini.'],
    caption: ['Discord ↔ ChatDVT ↔ Gemini', 'Discord ↔ ChatDVT ↔ Gemini'],
    color: '#8bbe91',
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
    description: ['Mình viết SDK quét mã trên Android bằng Kotlin.', 'I built an Android scanning SDK in Kotlin.'],
    caption: ['Ví dụ coroutine tách hai tác vụ', 'Example of two concurrent tasks'],
    color: '#c2a2ef',
    size: 'lg',
    cx: 492,
    cy: 86,
    portX: 382,
    portY: 118,
  },
  {
    id: 'android',
    label: 'Android',
    description: ['Android cấp quyền và cung cấp API để app dùng camera.', 'Android manages permissions and gives apps camera access.'],
    caption: ['App → Android → camera', 'App → Android → camera'],
    color: '#a4cd7e',
    size: 'lg',
    cx: 500,
    cy: 182,
    portX: 382,
    portY: 192,
  },
  {
    id: 'camerax',
    label: 'CameraX',
    description: ['CameraX cấp hình, ML Kit đọc mã vạch.', 'CameraX supplies frames. ML Kit reads the barcodes.'],
    caption: ['Hai mã trong cùng một khung hình', 'Two barcodes in one frame'],
    color: '#76d1bf',
    size: 'md',
    cx: 500,
    cy: 278,
    portX: 382,
    portY: 266,
  },
  {
    id: 'maven',
    label: 'Native SDK',
    description: ['Mình đóng gói SDK để các team tích hợp qua Maven.', 'I package the SDK so other teams can integrate it via Maven.'],
    caption: ['Một thư viện, nhiều ứng dụng', 'One library, multiple apps'],
    color: '#e5c173',
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
          <circle cx="18" cy="18" r="3.2" fill="#38bdf8" />
          <ellipse cx="18" cy="18" rx="13.5" ry="5.2" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <ellipse cx="18" cy="18" rx="13.5" ry="5.2" fill="none" stroke="#38bdf8" strokeWidth="2" transform="rotate(60 18 18)" />
          <ellipse cx="18" cy="18" rx="13.5" ry="5.2" fill="none" stroke="#38bdf8" strokeWidth="2" transform="rotate(120 18 18)" />
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
      return (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M18 5l12 7v12l-12 7-12-7V12l12-7z" fill="#ca8a04" />
          <path d="M6 12l12 7 12-7M18 19v12" stroke="#fef08a" strokeWidth="2.1" fill="none" />
        </svg>
      );
  }
}

export function MobileStack() {
  const { locale } = useLanguage();
  const { enabled } = useSiteMotion();
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
    <div className="mobile-stack mobile-stack--constellation" style={{ '--msc-accent': activeOrb.color } as CSSProperties}>
      <div className="msc-stage">
        <svg className="msc-streams" viewBox="0 0 540 460" preserveAspectRatio="none" aria-hidden="true">
          {ORBS.map((orb) => {
            const controlX = orb.cx < 270 ? orb.cx + 68 : orb.cx - 68;
            const path = `M ${orb.cx} ${orb.cy} C ${controlX} ${orb.cy}, ${orb.portX} ${orb.portY}, ${orb.portX} ${orb.portY}`;
            return <path key={orb.id} d={path} className={orb.id === activeOrb.id ? 'msc-stream is-lit' : 'msc-stream'} />;
          })}
        </svg>

        <div className="msc-device-wrap" ref={device} data-running={enabled && visible && foreground}>
          <div className="msc-device">
            <div className="msc-screen">
              <div className="msc-camera" aria-hidden="true" />
              <div id="mobile-tech-detail" className="msc-screen__content" aria-live="polite" aria-atomic="true">
                <div>
                  <h3>{activeOrb.label}</h3>
                  <p>{activeOrb.description[languageIndex]}</p>
                </div>
                <figure className="msc-art" key={activeOrb.id}>
                  <div className="msc-art__canvas">
                    <MobileStackIllustration technology={activeOrb.id} />
                  </div>
                  <figcaption>{activeOrb.caption[languageIndex]}</figcaption>
                </figure>
              </div>
              <button
                type="button"
                className="msc-next"
                aria-controls="mobile-tech-detail"
                onClick={() => setActiveIndex(index => (index + 1) % ORBS.length)}
              >
                {en ? 'Next' : 'Tiếp theo'}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
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
