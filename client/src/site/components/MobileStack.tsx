import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';

type OrbId =
  | 'rn'
  | 'kotlin'
  | 'android'
  | 'ts'
  | 'java'
  | 'camerax'
  | 'maven'
  | 'nodejs';

type SceneMode = 'rn' | 'sdk' | 'backend';

interface OrbSpec {
  id: OrbId;
  label: string;
  title: string;
  subtitle: string;
  badge: string;
  role: string;
  metricLabel: string;
  metricValue: string;
  specs: [string, string, string];
  scene: SceneMode;
  color: string;
  size: 'lg' | 'md';
  // Position in 540x460 viewBox
  cx: number;
  cy: number;
  depth: number;
  floatDelay: string;
}

// Symmetric 4+4 constellation around the central flagship smartphone (270, 230)
const ORBS: OrbSpec[] = [
  // Left Arc: App UI, TypeScript, Native Bridge, Backend API
  {
    id: 'rn',
    label: 'React Native',
    title: 'React Native',
    subtitle: 'iOS · Android · Hermes',
    badge: '60 FPS',
    role: 'Cross-Platform UI Engine',
    metricLabel: 'UI Frame Time',
    metricValue: '0.8 ms · Fabric',
    specs: ['RN 0.74+', 'Native Mod', 'Reanimated'],
    scene: 'rn',
    color: '#38bdf8',
    size: 'lg',
    cx: 82,
    cy: 78,
    depth: 1.35,
    floatDelay: '0s',
  },
  {
    id: 'ts',
    label: 'TypeScript',
    title: 'TypeScript',
    subtitle: 'Strict Typed Mobile',
    badge: 'TS 5.x',
    role: 'End-to-End Type Safety',
    metricLabel: 'Type Coverage',
    metricValue: '100% · Strict',
    specs: ['Strict TS', 'Typed Hook', 'SDK Types'],
    scene: 'rn',
    color: '#3b82f6',
    size: 'md',
    cx: 50,
    cy: 180,
    depth: 1.05,
    floatDelay: '-1.4s',
  },
  {
    id: 'java',
    label: 'Java · Bridge',
    title: 'Java · Bridge',
    subtitle: 'ReactMethod · JNI',
    badge: 'BRIDGE',
    role: 'Native Module Bridge',
    metricLabel: 'Bridge Latency',
    metricValue: '< 1.2 ms · JSI',
    specs: ['JNI Bridge', 'Events', 'Zero-Copy'],
    scene: 'sdk',
    color: '#f97316',
    size: 'md',
    cx: 50,
    cy: 282,
    depth: 1.1,
    floatDelay: '-1.6s',
  },
  {
    id: 'nodejs',
    label: 'Node.js · API',
    title: 'Node.js · API',
    subtitle: 'Express · MySQL',
    badge: '200 OK',
    role: 'Backend & Realtime Bot',
    metricLabel: 'API Response',
    metricValue: '18 ms · Prisma',
    specs: ['REST API', 'Prisma ORM', 'WebSocket'],
    scene: 'backend',
    color: '#22c55e',
    size: 'md',
    cx: 82,
    cy: 384,
    depth: 1.15,
    floatDelay: '-2.5s',
  },
  // Right Arc: Kotlin, Android, CameraX, Native SDK
  {
    id: 'kotlin',
    label: 'Kotlin',
    title: 'Kotlin Native',
    subtitle: 'Multi-Box · SDK',
    badge: 'KOTLIN',
    role: 'Android Native Core',
    metricLabel: 'Concurrency',
    metricValue: 'Coroutines · Flow',
    specs: ['Coroutines', 'StateFlow', 'Jetpack'],
    scene: 'sdk',
    color: '#a855f7',
    size: 'lg',
    cx: 458,
    cy: 78,
    depth: 1.4,
    floatDelay: '-0.9s',
  },
  {
    id: 'android',
    label: 'Android',
    title: 'Android SDK',
    subtitle: 'Camera & Lifecycle',
    badge: 'API 34',
    role: 'System & Hardware Layer',
    metricLabel: 'Target Runtime',
    metricValue: 'Android 14 · NDK',
    specs: ['NDK / JNI', 'Lifecycle', 'Low RAM'],
    scene: 'sdk',
    color: '#3ddc84',
    size: 'lg',
    cx: 490,
    cy: 180,
    depth: 1.25,
    floatDelay: '-2.1s',
  },
  {
    id: 'camerax',
    label: 'CameraX',
    title: 'CameraX Vision',
    subtitle: '60fps Frame Scan',
    badge: '14 MS',
    role: 'Real-Time Vision Stream',
    metricLabel: 'Frame Analyzer',
    metricValue: 'YUV_420 · 60fps',
    specs: ['YUV_420', 'ML Kit', 'TFLite SDK'],
    scene: 'sdk',
    color: '#c084fc',
    size: 'md',
    cx: 490,
    cy: 282,
    depth: 0.95,
    floatDelay: '-2.9s',
  },
  {
    id: 'maven',
    label: 'Native SDK',
    title: 'Native AAR SDK',
    subtitle: 'Gradle · Maven AAR',
    badge: 'v2.4',
    role: 'Enterprise Mobile SDK',
    metricLabel: 'Distribution',
    metricValue: 'Maven · ProGuard',
    specs: ['Maven AAR', 'ProGuard', 'Offline DB'],
    scene: 'sdk',
    color: '#eab308',
    size: 'md',
    cx: 458,
    cy: 384,
    depth: 1.05,
    floatDelay: '-0.5s',
  },
];

const SCENE_ORDER: SceneMode[] = ['rn', 'sdk', 'backend'];

const DEFAULT_SCENE_SPEC: Record<
  SceneMode,
  {
    icon: OrbId;
    title: string;
    subtitle: string;
    badge: string;
    role: string;
    metricLabel: string;
    metricValue: string;
    specs: [string, string, string];
  }
> = {
  rn: {
    icon: 'rn',
    title: 'React Native · TS',
    subtitle: 'iOS · Android · Hermes',
    badge: '60 FPS',
    role: 'Cross-Platform App UI',
    metricLabel: 'UI Thread',
    metricValue: '0.8 ms · 60 FPS',
    specs: ['RN 0.74+', 'TypeScript', 'Native Mod'],
  },
  sdk: {
    icon: 'kotlin',
    title: 'Kotlin · Android',
    subtitle: 'CameraX · Native SDK',
    badge: '99.4%',
    role: 'Multi-Barcode & Box SDK',
    metricLabel: 'Vision Lock',
    metricValue: '14 ms · 99.4%',
    specs: ['Kotlin', 'CameraX', 'Maven AAR'],
  },
  backend: {
    icon: 'nodejs',
    title: 'Node.js · API',
    subtitle: 'Express · MySQL',
    badge: '18 MS',
    role: 'REST API & ChatDVT Bot',
    metricLabel: 'Throughput',
    metricValue: '200 OK · 18 ms',
    specs: ['Node.js', 'REST / WS', 'MySQL'],
  },
};

function TechLogo({ id }: { id: OrbId }) {
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
          <defs>
            <linearGradient id="ms-kt" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#7f52ff" />
              <stop offset="50%" stopColor="#c711e1" />
              <stop offset="100%" stopColor="#ff6b00" />
            </linearGradient>
          </defs>
          <path d="M7 7h22L18 18l11 11H7V7z" fill="url(#ms-kt)" />
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
          <rect x="5" y="8" width="26" height="20" rx="5" fill="#7c3aed" />
          <circle cx="18" cy="18" r="6" fill="none" stroke="#ede9fe" strokeWidth="2.2" />
          <circle cx="18" cy="18" r="2.6" fill="#38bdf8" />
          <circle cx="26" cy="12.5" r="1.5" fill="#f472b6" />
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

// Full-bleed flagship smartphone screen with rich mobile OS widgets, live SVG visuals & stack telemetry
function PhoneVisualScene({ scene, focusedOrb }: { scene: SceneMode; focusedOrb: OrbSpec | null }) {
  const activeMeta = focusedOrb
    ? {
        icon: focusedOrb.id,
        title: focusedOrb.title,
        subtitle: focusedOrb.subtitle,
        badge: focusedOrb.badge,
        role: focusedOrb.role,
        metricLabel: focusedOrb.metricLabel,
        metricValue: focusedOrb.metricValue,
        specs: focusedOrb.specs,
      }
    : DEFAULT_SCENE_SPEC[scene];

  if (scene === 'rn') {
    return (
      <div className="msc-scene msc-scene--rn">
        {/* Hero Glass Card: Active Framework & Role */}
        <div className="msc-hero-card is-cyan">
          <div className="msc-hero-card__top">
            <div className="msc-hero-card__logo is-spin-slow">
              <TechLogo id={activeMeta.icon} />
            </div>
            <div className="msc-hero-card__titles">
              <strong>{activeMeta.title}</strong>
              <span>{activeMeta.subtitle}</span>
            </div>
            <b className="msc-hero-card__badge">{activeMeta.badge}</b>
          </div>

          {/* Live SVG Smooth Bezier Frame-Timing Wave + Platform Pills */}
          <div className="msc-hero-wave">
            <svg viewBox="0 0 170 40" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="msc-rn-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.48" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,34 C24,31 38,20 64,24 C90,28 108,17 134,21 C152,24 160,18 170,19 L170,40 L0,40 Z"
                fill="url(#msc-rn-grad)"
              />
              <path
                d="M0,34 C24,31 38,20 64,24 C90,28 108,17 134,21 C152,24 160,18 170,19"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                className="msc-wave-stroke"
              />
            </svg>
            <div className="msc-hero-wave__overlay">
              <span>{activeMeta.metricLabel}</span>
              <b>{activeMeta.metricValue}</b>
            </div>
          </div>
        </div>

        {/* Interactive Mobile App Stack Cards (Real Logos + Progress Meters) */}
        <div className="msc-stack-list">
          <div className="msc-stack-item is-active">
            <span className="msc-stack-item__ico"><TechLogo id="rn" /></span>
            <div className="msc-stack-item__body">
              <div className="msc-stack-item__row">
                <b>React Native</b>
                <em>iOS · Android</em>
              </div>
              <div className="msc-progress"><i style={{ width: '94%', background: '#38bdf8' }} /></div>
            </div>
          </div>
          <div className="msc-stack-item">
            <span className="msc-stack-item__ico"><TechLogo id="ts" /></span>
            <div className="msc-stack-item__body">
              <div className="msc-stack-item__row">
                <b>TypeScript 5</b>
                <em>Strict · Hooks</em>
              </div>
              <div className="msc-progress"><i style={{ width: '90%', background: '#3b82f6' }} /></div>
            </div>
          </div>
        </div>

        {/* Spec Chips */}
        <div className="msc-spec-chips">
          {activeMeta.specs.map((item) => (
            <span key={item} className="msc-spec-chip">
              <i />
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (scene === 'sdk') {
    return (
      <div className="msc-scene msc-scene--sdk">
        {/* Hero Glass Card: Active Native SDK / Vision Stack */}
        <div className="msc-hero-card is-purple">
          <div className="msc-hero-card__top">
            <div className="msc-hero-card__logo">
              <TechLogo id={activeMeta.icon} />
            </div>
            <div className="msc-hero-card__titles">
              <strong>{activeMeta.title}</strong>
              <span>{activeMeta.subtitle}</span>
            </div>
            <b className="msc-hero-card__badge">{activeMeta.badge}</b>
          </div>
        </div>

        {/* Realistic Android CameraX AR Viewfinder HUD */}
        <div className="msc-scanner-frame">
          <div className="msc-scanner-grid" aria-hidden="true" />
          <i className="msc-laser-line" />

          <div className="msc-target-box is-box1">
            <span className="msc-corner-tl" /><span className="msc-corner-tr" />
            <span className="msc-corner-bl" /><span className="msc-corner-br" />
            <div className="msc-barcode-bars">
              <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
            <b>99.4%</b>
          </div>

          <div className="msc-scanner-bottom">
            <div className="msc-ar-box">
              <span className="msc-ar-dot" />
              <span>BOX #02 · TFLite</span>
              <b>14ms</b>
            </div>
          </div>
        </div>

        {/* 4-Node Native Pipeline Bar */}
        <div className="msc-native-flow">
          <span>CameraX</span>
          <i>→</i>
          <span>Kotlin</span>
          <i>→</i>
          <span>JNI</span>
          <i>→</i>
          <b className="is-amber">AAR</b>
        </div>

        {/* Spec Chips */}
        <div className="msc-spec-chips">
          {activeMeta.specs.map((item) => (
            <span key={item} className="msc-spec-chip">
              <i />
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="msc-scene msc-scene--ai">
      {/* Hero Glass Card: Node.js API & ChatDVT */}
      <div className="msc-hero-card is-green">
        <div className="msc-hero-card__top">
          <div className="msc-hero-card__logo">
            <TechLogo id={activeMeta.icon} />
          </div>
          <div className="msc-hero-card__titles">
            <strong>{activeMeta.title}</strong>
            <span>{activeMeta.subtitle}</span>
          </div>
          <b className="msc-hero-card__badge">{activeMeta.badge}</b>
        </div>

        {/* Live Server Throughput Sparkline */}
        <div className="msc-hero-wave">
          <svg viewBox="0 0 170 40" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="msc-node-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,34 C22,30 40,19 65,24 C92,28 112,17 138,21 C154,23 162,18 170,17 L170,40 L0,40 Z"
              fill="url(#msc-node-grad)"
            />
            <path
              d="M0,34 C22,30 40,19 65,24 C92,28 112,17 138,21 C154,23 162,18 170,17"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              className="msc-wave-stroke"
            />
          </svg>
          <div className="msc-hero-wave__overlay">
            <span>{activeMeta.metricLabel}</span>
            <b>{activeMeta.metricValue}</b>
          </div>
        </div>
      </div>

      {/* Live API & ChatDVT Stream Cards */}
      <div className="msc-api-stage">
        <div className="msc-api-row">
          <span className="msc-http-method is-post">POST</span>
          <span className="msc-http-path">/v1/sdk/scan</span>
          <b className="msc-http-status">200 · 18ms</b>
        </div>
        <div className="msc-api-row">
          <span className="msc-http-method is-ws">WS</span>
          <span className="msc-http-path">/chatdvt/stream</span>
          <div className="msc-typing-wave">
            <i /><i /><i /><i />
          </div>
        </div>
        <div className="msc-api-row">
          <span className="msc-http-method is-post">SQL</span>
          <span className="msc-http-path">Prisma · MySQL</span>
          <b className="msc-http-status">SYNCED ✓</b>
        </div>
      </div>

      {/* Spec Chips */}
      <div className="msc-spec-chips">
        {activeMeta.specs.map((item) => (
          <span key={item} className="msc-spec-chip">
            <i />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MobileStack() {
  const { locale } = useLanguage(), en = locale === 'en';
  const { enabled: motionEnabled } = useSiteMotion();
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [hoveredOrb, setHoveredOrb] = useState<OrbSpec | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motionEnabled || isPaused || hoveredOrb !== null) return;
    const timer = window.setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % SCENE_ORDER.length);
    }, 2900);
    return () => window.clearInterval(timer);
  }, [motionEnabled, isPaused, hoveredOrb]);

  const activeScene: SceneMode = hoveredOrb ? hoveredOrb.scene : SCENE_ORDER[sceneIndex];

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
    const ny = ((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
    setTilt({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  }

  function handlePointerLeave() {
    setTilt({ x: 0, y: 0 });
    setHoveredOrb(null);
    setIsPaused(false);
  }

  return (
    <div
      ref={stageRef}
      className={'mobile-stack mobile-stack--constellation is-scene-' + activeScene}
      onMouseEnter={() => setIsPaused(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="msc-stage">
        {/* Ambient Aurora Glow */}
        <div className="msc-aurora" aria-hidden="true" />

        {/* Curved Animated Energy Streams Connecting Orbs -> Central Phone */}
        <svg className="msc-streams" viewBox="0 0 540 460" aria-hidden="true">
          <defs>
            <radialGradient id="msc-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle Orbital Rings */}
          <circle cx="270" cy="230" r="148" className="msc-orbit-ring" />
          <circle cx="270" cy="230" r="204" className="msc-orbit-ring is-outer" />

          {ORBS.map((orb) => {
            const isLit = orb.scene === activeScene;
            // Control point for an organic curved bezier arc toward (270, 230)
            const midX = (orb.cx + 270) / 2 + (orb.cy - 230) * 0.16;
            const midY = (orb.cy + 230) / 2 - (orb.cx - 270) * 0.14;
            const d = `M ${orb.cx} ${orb.cy} Q ${Math.round(midX)} ${Math.round(midY)} 270 230`;

            return (
              <g key={orb.id} className={'msc-stream-group' + (isLit ? ' is-lit' : '')}>
                <path d={d} className="msc-stream-base" style={{ '--orb-c': orb.color } as React.CSSProperties} />
                <path
                  d={d}
                  className="msc-stream-pulse"
                  style={
                    {
                      '--orb-c': orb.color,
                      animationDelay: orb.floatDelay,
                    } as React.CSSProperties
                  }
                />
              </g>
            );
          })}
        </svg>

        {/* CENTRAL 3D TILTED SMARTPHONE HUB */}
        <div
          className="msc-device-wrap"
          style={{
            transform: `perspective(950px) rotateX(${(-tilt.y * 7).toFixed(2)}deg) rotateY(${(tilt.x * 9).toFixed(2)}deg) translate3d(${(tilt.x * 6).toFixed(1)}px, ${(tilt.y * 6).toFixed(1)}px, 0)`,
          }}
        >
          <div
            className="msc-device"
            onClick={() => setSceneIndex((prev) => (prev + 1) % SCENE_ORDER.length)}
            role="button"
            tabIndex={0}
            aria-label={en ? 'Interactive mobile showcase — click to switch scene' : 'Màn hình mô phỏng trực quan — bấm để chuyển cảnh'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSceneIndex((prev) => (prev + 1) % SCENE_ORDER.length);
              }
            }}
          >
            {/* Specular Glass Glare Overlay */}
            <div className="msc-device__glare" aria-hidden="true" />

            {/* EDGE-TO-EDGE FULL-BLEED OLED DISPLAY */}
            <div className="msc-oled">
              {/* Top OS Status Bar & Dynamic Island Embedded Inside Screen */}
              <div className="msc-statusbar" aria-hidden="true">
                <span className="msc-statusbar__time">9:41</span>
                <div className="msc-device__notch">
                  <span className="msc-notch-cam" />
                  <div className="msc-notch-wave">
                    <b /><b /><b />
                  </div>
                  <i />
                </div>
                <div className="msc-statusbar__icons">
                  <svg viewBox="0 0 14 10" className="msc-status-svg">
                    <rect x="0.5" y="6.5" width="2" height="3" rx="0.6" fill="currentColor" />
                    <rect x="3.8" y="4.5" width="2" height="5" rx="0.6" fill="currentColor" />
                    <rect x="7.1" y="2.5" width="2" height="7" rx="0.6" fill="currentColor" />
                    <rect x="10.4" y="0.5" width="2" height="9" rx="0.6" fill="currentColor" />
                  </svg>
                  <span className="msc-battery">
                    <i />
                  </span>
                </div>
              </div>

              <PhoneVisualScene scene={activeScene} focusedOrb={hoveredOrb} />

              {/* Frosted Glass Mobile Dock + Home Indicator Inside OLED Screen */}
              <div className="msc-device__bottom" aria-hidden="true">
                <div className="msc-dock">
                  {([
                    { mode: 'rn' as SceneMode, label: 'UI · RN', icon: 'rn' as OrbId },
                    { mode: 'sdk' as SceneMode, label: 'Native', icon: 'kotlin' as OrbId },
                    { mode: 'backend' as SceneMode, label: 'API', icon: 'nodejs' as OrbId },
                  ]).map((tab, idx) => (
                    <button
                      key={tab.mode}
                      type="button"
                      tabIndex={-1}
                      className={'msc-dock__btn' + (activeScene === tab.mode ? ' is-on' : '')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredOrb(null);
                        setSceneIndex(idx);
                      }}
                    >
                      <span className="msc-dock__ico"><TechLogo id={tab.icon} /></span>
                      <b>{tab.label}</b>
                    </button>
                  ))}
                </div>
                <div className="msc-device__homebar" />
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING 3D GLASS ORBS FOR FRAMEWORKS, LANGUAGES & PRODUCTS */}
        <div className="msc-orbs" role="group" aria-label={en ? 'Tech stack and products' : 'Ngôn ngữ, Framework và Sản phẩm'}>
          {ORBS.map((orb) => {
            const isLit = orb.scene === activeScene;
            const leftPct = (orb.cx / 540) * 100;
            const topPct = (orb.cy / 460) * 100;
            const px = (tilt.x * -14 * orb.depth).toFixed(1);
            const py = (tilt.y * -12 * orb.depth).toFixed(1);

            return (
              <button
                key={orb.id}
                type="button"
                className={
                  'msc-orb msc-orb--' +
                  orb.size +
                  (isLit ? ' is-lit' : '') +
                  (hoveredOrb?.id === orb.id ? ' is-hovered' : '')
                }
                style={
                  {
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    '--orb-c': orb.color,
                    '--orb-delay': orb.floatDelay,
                    '--orb-px': `${px}px`,
                    '--orb-py': `${py}px`,
                  } as React.CSSProperties
                }
                onMouseEnter={() => {
                  setHoveredOrb(orb);
                  setSceneIndex(SCENE_ORDER.indexOf(orb.scene));
                }}
                onFocus={() => {
                  setHoveredOrb(orb);
                  setSceneIndex(SCENE_ORDER.indexOf(orb.scene));
                }}
                onBlur={() => setHoveredOrb(null)}
                onClick={() => {
                  setHoveredOrb(orb);
                  setSceneIndex(SCENE_ORDER.indexOf(orb.scene));
                }}
              >
                <span className="msc-orb__halo" aria-hidden="true" />
                <span className="msc-orb__core">
                  <TechLogo id={orb.id} />
                </span>
                <span className="msc-orb__label">{orb.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
