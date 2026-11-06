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
  kicker: string;
  title: string;
  subtitle: string;
  badge: string;
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
// Palette strictly harmonized with devtiendang.blog: Teal-Mint (#2dd4bf), Ice-Cyan (#38bdf8), Warm Amber (#e5b869)
const ORBS: OrbSpec[] = [
  // Left Arc: App UI, TypeScript, Native Bridge, Backend API
  {
    id: 'rn',
    label: 'React Native',
    kicker: '01 / CROSS-PLATFORM UI',
    title: 'React Native',
    subtitle: 'iOS & Android · Fabric 60fps',
    badge: '60 FPS',
    specs: ['RN 0.74+', 'Hermes JIT', 'Reanimated'],
    scene: 'rn',
    color: '#38bdf8',
    size: 'lg',
    cx: 76,
    cy: 76,
    depth: 1.35,
    floatDelay: '0s',
  },
  {
    id: 'ts',
    label: 'TypeScript',
    kicker: '01 / STATIC TYPING',
    title: 'TypeScript',
    subtitle: 'Strict Type-Safe Contracts',
    badge: 'TS 5.x',
    specs: ['Strict Mode', 'Typed Hooks', 'SDK Schema'],
    scene: 'rn',
    color: '#60a5fa',
    size: 'md',
    cx: 46,
    cy: 180,
    depth: 1.05,
    floatDelay: '-1.4s',
  },
  {
    id: 'java',
    label: 'Java · Bridge',
    kicker: '02 / NATIVE BRIDGE',
    title: 'Java · Bridge',
    subtitle: 'ReactMethod · JSI & JNI',
    badge: 'JSI',
    specs: ['JNI Bridge', 'Events', 'Zero-Copy'],
    scene: 'sdk',
    color: '#e5b869',
    size: 'md',
    cx: 46,
    cy: 282,
    depth: 1.1,
    floatDelay: '-1.6s',
  },
  {
    id: 'nodejs',
    label: 'Node.js · API',
    kicker: '03 / BACKEND & BOT',
    title: 'Node.js · API',
    subtitle: 'Express · MySQL · ChatDVT',
    badge: '200 OK',
    specs: ['REST API', 'Prisma ORM', 'WebSocket'],
    scene: 'backend',
    color: '#e5b869',
    size: 'md',
    cx: 76,
    cy: 384,
    depth: 1.15,
    floatDelay: '-2.5s',
  },
  // Right Arc: Kotlin, Android, CameraX, Native SDK
  {
    id: 'kotlin',
    label: 'Kotlin',
    kicker: '02 / ANDROID NATIVE',
    title: 'Kotlin Native',
    subtitle: 'Coroutines · Multi-Box SDK',
    badge: 'KOTLIN',
    specs: ['Coroutines', 'StateFlow', 'Jetpack'],
    scene: 'sdk',
    color: '#2dd4bf',
    size: 'lg',
    cx: 464,
    cy: 76,
    depth: 1.4,
    floatDelay: '-0.9s',
  },
  {
    id: 'android',
    label: 'Android',
    kicker: '02 / SYSTEM RUNTIME',
    title: 'Android SDK',
    subtitle: 'Hardware Camera & NDK',
    badge: 'API 34',
    specs: ['NDK / JNI', 'Lifecycle', 'Low RAM'],
    scene: 'sdk',
    color: '#3ddc84',
    size: 'lg',
    cx: 494,
    cy: 180,
    depth: 1.25,
    floatDelay: '-2.1s',
  },
  {
    id: 'camerax',
    label: 'CameraX',
    kicker: '02 / VISION PIPELINE',
    title: 'CameraX Vision',
    subtitle: 'Real-Time Barcode & Box',
    badge: '14 MS',
    specs: ['YUV_420', 'ML Kit', 'TFLite SDK'],
    scene: 'sdk',
    color: '#5eead4',
    size: 'md',
    cx: 494,
    cy: 282,
    depth: 0.95,
    floatDelay: '-2.9s',
  },
  {
    id: 'maven',
    label: 'Native SDK',
    kicker: '02 / SDK PACKAGING',
    title: 'Native AAR SDK',
    subtitle: 'Gradle · Maven Distribution',
    badge: 'v2.4',
    specs: ['Maven AAR', 'ProGuard', 'Offline DB'],
    scene: 'sdk',
    color: '#eab308',
    size: 'md',
    cx: 464,
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
    kicker: string;
    title: string;
    subtitle: string;
    badge: string;
    specs: [string, string, string];
  }
> = {
  rn: {
    icon: 'rn',
    kicker: '01 / CROSS-PLATFORM UI',
    title: 'React Native · TS',
    subtitle: 'iOS & Android · Fabric 60fps',
    badge: '60 FPS',
    specs: ['RN 0.74+', 'TypeScript 5', 'Reanimated'],
  },
  sdk: {
    icon: 'kotlin',
    kicker: '02 / NATIVE VISION SDK',
    title: 'Kotlin · Android',
    subtitle: 'CameraX · Multi-Barcode SDK',
    badge: '99.4%',
    specs: ['Kotlin', 'CameraX', 'Maven AAR'],
  },
  backend: {
    icon: 'nodejs',
    kicker: '03 / BACKEND & AI BOT',
    title: 'Node.js · API',
    subtitle: 'Express · MySQL · ChatDVT',
    badge: '18 MS',
    specs: ['Node.js', 'REST / WS', 'Prisma SQL'],
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

// Uncluttered, editorial OLED screen canvas: zero nested plastic boxes, pure vector art centerpiece + clean typography
function PhoneVisualScene({ scene, focusedOrb }: { scene: SceneMode; focusedOrb: OrbSpec | null }) {
  const activeMeta = focusedOrb
    ? {
        icon: focusedOrb.id,
        kicker: focusedOrb.kicker,
        title: focusedOrb.title,
        subtitle: focusedOrb.subtitle,
        badge: focusedOrb.badge,
        specs: focusedOrb.specs,
      }
    : DEFAULT_SCENE_SPEC[scene];

  return (
    <div className={'msc-scene msc-scene--' + scene}>
      {/* Unboxed Editorial Screen Header */}
      <div className="msc-screen-head">
        <div className="msc-screen-head__top">
          <span className="msc-screen-kicker">{activeMeta.kicker}</span>
          <b className="msc-screen-badge">{activeMeta.badge}</b>
        </div>
        <div className="msc-screen-brand">
          <span className="msc-screen-brand__logo">
            <TechLogo id={activeMeta.icon} />
          </span>
          <div className="msc-screen-brand__text">
            <strong>{activeMeta.title}</strong>
            <span>{activeMeta.subtitle}</span>
          </div>
        </div>
      </div>

      {/* Pure Vector 3D/AR Visual Centerpiece (Open Canvas, No Box Clutter) */}
      <div className="msc-canvas">
        {scene === 'rn' && (
          <svg viewBox="0 0 184 148" className="msc-canvas-svg" aria-hidden="true">
            <defs>
              <linearGradient id="rn-card-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="rn-wave-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Subtle background grid */}
            <line x1="0" y1="36" x2="184" y2="36" stroke="rgba(255,255,255,0.04)" />
            <line x1="0" y1="74" x2="184" y2="74" stroke="rgba(255,255,255,0.04)" />
            <line x1="0" y1="112" x2="184" y2="112" stroke="rgba(255,255,255,0.04)" />

            {/* Back Layer: Android Surface Card */}
            <g className="msc-svg-float-slow">
              <rect x="38" y="6" width="134" height="52" rx="11" fill="rgba(15,23,42,0.82)" stroke="rgba(94,234,212,0.3)" strokeWidth="1" />
              <circle cx="52" cy="20" r="3.2" fill="#2dd4bf" />
              <text x="60" y="23" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace" fontWeight="700">ANDROID · FABRIC</text>
              <rect x="48" y="31" width="74" height="4.5" rx="2.2" fill="rgba(255,255,255,0.16)" />
              <rect x="48" y="40" width="50" height="4.5" rx="2.2" fill="rgba(45,212,191,0.38)" />
              <rect x="138" y="16" width="24" height="20" rx="5" fill="rgba(45,212,191,0.14)" stroke="rgba(45,212,191,0.42)" />
              <text x="150" y="29" textAnchor="middle" fill="#5eead4" fontSize="7" fontFamily="monospace" fontWeight="700">JSI</text>
            </g>

            {/* Front Layer: iOS / React Native Live Card + Smooth Frame Curve */}
            <g className="msc-svg-float">
              <rect x="12" y="54" width="146" height="84" rx="13" fill="url(#rn-card-a)" stroke="rgba(56,189,248,0.48)" strokeWidth="1.2" />
              <circle cx="25" cy="69" r="3.5" fill="#38bdf8" />
              <text x="33" y="72" fill="#f8fafc" fontSize="7.8" fontFamily="monospace" fontWeight="700">iOS · Reanimated</text>
              <text x="148" y="72" textAnchor="end" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" fontWeight="700">0.8ms</text>

              {/* Smooth Bezier Wave inside card */}
              <path d="M 20 118 C 42 114, 54 94, 78 99 C 102 104, 116 84, 136 89 C 142 91, 146 86, 149 84 L 149 128 L 20 128 Z" fill="url(#rn-wave-fill)" />
              <path d="M 20 118 C 42 114, 54 94, 78 99 C 102 104, 116 84, 136 89 C 142 91, 146 86, 149 84" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              <circle cx="136" cy="89" r="3" fill="#38bdf8" />
              <circle cx="78" cy="99" r="2.5" fill="#5eead4" />
            </g>
          </svg>
        )}

        {scene === 'sdk' && (
          <svg viewBox="0 0 184 148" className="msc-canvas-svg" aria-hidden="true">
            <defs>
              <linearGradient id="sdk-laser" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0" />
                <stop offset="50%" stopColor="#2dd4bf" stopOpacity="1" />
                <stop offset="100%" stopColor="#e5b869" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Clean Optical Viewfinder Corner Reticles (No Heavy Box) */}
            <path d="M 14 24 L 14 12 L 26 12" fill="none" stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 158 12 L 170 12 L 170 24" fill="none" stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 14 124 L 14 136 L 26 136" fill="none" stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 158 136 L 170 136 L 170 124" fill="none" stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" />

            {/* Target 1: Crisp Vector Barcode Detection */}
            <g transform="translate(24, 22)">
              <rect x="0" y="0" width="136" height="46" rx="8" fill="rgba(45,212,191,0.08)" stroke="rgba(45,212,191,0.5)" strokeWidth="1.2" />
              <g fill="#e2e8f0" transform="translate(12, 11)">
                <rect x="0" y="0" width="3" height="24" rx="1" />
                <rect x="6" y="0" width="1.5" height="24" opacity="0.6" />
                <rect x="11" y="0" width="4" height="24" rx="1" />
                <rect x="18" y="0" width="2" height="24" />
                <rect x="23" y="0" width="1.5" height="24" opacity="0.5" />
                <rect x="28" y="0" width="4.5" height="24" rx="1" />
                <rect x="36" y="0" width="2" height="24" />
                <rect x="41" y="0" width="3" height="24" rx="1" />
                <rect x="47" y="0" width="1.5" height="24" opacity="0.6" />
                <rect x="52" y="0" width="4" height="24" rx="1" />
                <rect x="59" y="0" width="2.5" height="24" />
              </g>
              <rect x="86" y="13" width="38" height="20" rx="5" fill="rgba(45,212,191,0.2)" />
              <text x="105" y="26" textAnchor="middle" fill="#5eead4" fontSize="8.5" fontFamily="monospace" fontWeight="700">99.4%</text>
            </g>

            {/* Target 2: 3D Wireframe Parcel Box + TFLite Lock */}
            <g transform="translate(24, 80)">
              <rect x="0" y="0" width="136" height="44" rx="8" fill="rgba(229,184,105,0.08)" stroke="rgba(229,184,105,0.45)" strokeWidth="1.2" />
              <path d="M 22 11 L 34 17 L 34 31 L 22 37 L 10 31 L 10 17 Z" fill="rgba(229,184,105,0.18)" stroke="#e5b869" strokeWidth="1.3" />
              <path d="M 10 17 L 22 23 L 34 17 M 22 23 L 22 37" fill="none" stroke="#e5b869" strokeWidth="1.2" />
              <text x="44" y="20" fill="#f8fafc" fontSize="8" fontFamily="monospace" fontWeight="700">BOX #02 · LOCKED</text>
              <text x="44" y="32" fill="#e5b869" fontSize="7.2" fontFamily="monospace">CameraX · JNI · 14ms</text>
            </g>

            {/* Animated Sweeping Laser Scanline */}
            <g className="msc-svg-laser">
              <line x1="16" y1="0" x2="168" y2="0" stroke="url(#sdk-laser)" strokeWidth="2.2" />
            </g>
          </svg>
        )}

        {scene === 'backend' && (
          <svg viewBox="0 0 184 148" className="msc-canvas-svg" aria-hidden="true">
            <defs>
              <linearGradient id="api-wave-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e5b869" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#e5b869" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Live Node Topology: Mobile -> Node.js API -> MySQL / AI */}
            <path d="M 38 42 Q 92 14 146 42" fill="none" stroke="rgba(229,184,105,0.35)" strokeWidth="1.5" strokeDasharray="3 4" />
            <path d="M 38 42 Q 92 70 146 42" fill="none" stroke="rgba(45,212,191,0.35)" strokeWidth="1.5" strokeDasharray="3 4" />

            {/* Left Node: Mobile Client */}
            <rect x="12" y="24" width="50" height="36" rx="9" fill="rgba(15,23,42,0.85)" stroke="rgba(56,189,248,0.45)" strokeWidth="1.2" />
            <text x="37" y="40" textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" fontWeight="700">MOBILE</text>
            <text x="37" y="51" textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">REST/WS</text>

            {/* Center Hub: Node.js API */}
            <circle cx="92" cy="42" r="21" fill="rgba(15,23,42,0.92)" stroke="#e5b869" strokeWidth="1.5" />
            <text x="92" y="40" textAnchor="middle" fill="#f8fafc" fontSize="7.5" fontFamily="monospace" fontWeight="700">NODE.JS</text>
            <text x="92" y="50" textAnchor="middle" fill="#e5b869" fontSize="6.5" fontFamily="monospace">18ms</text>

            {/* Right Node: MySQL & Gemini */}
            <rect x="122" y="24" width="50" height="36" rx="9" fill="rgba(15,23,42,0.85)" stroke="rgba(45,212,191,0.45)" strokeWidth="1.2" />
            <text x="147" y="40" textAnchor="middle" fill="#2dd4bf" fontSize="7.5" fontFamily="monospace" fontWeight="700">MYSQL</text>
            <text x="147" y="51" textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">PRISMA</text>

            {/* Bottom Throughput Area Curve */}
            <path d="M 12 130 C 38 124, 56 96, 84 104 C 112 112, 132 86, 156 92 C 164 94, 168 88, 172 86 L 172 138 L 12 138 Z" fill="url(#api-wave-fill)" />
            <path d="M 12 130 C 38 124, 56 96, 84 104 C 112 112, 132 86, 156 92 C 164 94, 168 88, 172 86" fill="none" stroke="#e5b869" strokeWidth="2" strokeLinecap="round" />
            <text x="16" y="88" fill="#94a3b8" fontSize="7" fontFamily="monospace">POST /v1/sdk/scan</text>
            <text x="168" y="80" textAnchor="end" fill="#2dd4bf" fontSize="7.5" fontFamily="monospace" fontWeight="700">200 OK</text>
          </svg>
        )}
      </div>

      {/* Minimal Uncluttered Spec Tags */}
      <div className="msc-spec-chips">
        {activeMeta.specs.map((item) => (
          <span key={item} className="msc-spec-chip">
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
