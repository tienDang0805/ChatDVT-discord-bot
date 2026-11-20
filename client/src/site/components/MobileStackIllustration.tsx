import type { ReactNode } from 'react';
import { BLOG_CATEGORY_IDS } from '../../shared/types/blog';
import { MultiBoxScan, TabletRobot } from './MobileWorkIllustrations';

export type TechnologyId = 'rn' | 'kotlin' | 'android' | 'ts' | 'java' | 'camerax' | 'maven' | 'nodejs';

function AppPreview({ x, y, inset }: { x: number; y: number; inset: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="msc-art__surface" width="42" height="52" rx="6" />
      {inset}
      <rect className="msc-art__wash msc-art__preview-row" x="6" y="14" width="30" height="12" rx="3" />
      <path d="M11 20h3m4 0h11" />
      <path className="msc-art__quiet" d="M11 33h3m4 0h11m-18 10h3m4 0h11" />
    </g>
  );
}

function BranchSignals({ y }: { y: number }) {
  return <>
    <circle className="msc-art__signal msc-art__branch" cx="88" cy={y} r="2.6" />
    <circle className="msc-art__signal msc-art__branch" data-right cx="88" cy={y} r="2.6" />
  </>;
}

const diagrams: Record<'rn' | 'java' | 'nodejs' | 'android', ReactNode> = {
  rn: (
    <>
      <rect className="msc-art__ink" x="78" y="5" width="20" height="12" rx="3" />
      <path d="M88 17v8m-40 9v-4h80v4" />
      <AppPreview x={27} y={34} inset={<path className="msc-art__quiet" d="M18 6h6" />} />
      <AppPreview x={107} y={34} inset={<circle className="msc-art__ink" cx="21" cy="7" r="1.2" />} />
      <BranchSignals y={17} />
    </>
  ),
  java: (
    <>
      <path className="msc-art__quiet" d="M19 77h132" strokeDasharray="3 4" />
      <path className="msc-art__surface" d="M11 77v-8h9v8M151 77V55h15v22z" />
      <path className="msc-art__quiet" d="M154 60h9m-9 4h7" />
      <g transform="translate(45 76)">
        <g className="msc-art__robot-drive"><TabletRobot /></g>
      </g>
    </>
  ),
  nodejs: (
    <>
      <path className="msc-art__quiet" d="M36 38h104M36 56h104" />
      <path className="msc-art__surface" d="M88 20l21 12v26L88 70 67 58V32z" />
      <path d="M80 54V36l16 18V36" />
      <g className="msc-art__discord">
        <rect x="10" y="32" width="26" height="30" rx="5" />
        <path d="M17 41h12v9h-7l-3 3v-3h-2z" />
      </g>
      <rect className="msc-art__surface" x="140" y="32" width="26" height="30" rx="5" />
      <path d="M153 40c0 4 2 6 6 6-4 0-6 2-6 6 0-4-2-6-6-6 4 0 6-2 6-6z" />
      <circle className="msc-art__signal msc-art__request" cx="38" cy="38" r="2.6" />
      <circle className="msc-art__signal msc-art__reply" cx="138" cy="56" r="2.6" />
    </>
  ),
  android: (
    <>
      <path className="msc-art__quiet" d="M46 54l42 19 42-19M46 65l42 19 42-19" />
      <path className="msc-art__surface" d="M42 43l46-20 46 20-46 20z" />
      <path className="msc-art__ink" d="M73 37a15 13 0 0 1 30 0z" />
      <path d="M79 28l-4-5m22 5 4-5" />
      <path className="msc-art__cutout" d="M82 33h.1m12 0h.1" />
      <path className="msc-art__layer-signal" d="M46 54l42 19 42-19" />
    </>
  ),
};

export function MobileStackIllustration({ technology, en }: { technology: TechnologyId; en: boolean }) {
  switch (technology) {
    case 'ts':
      return (
        <div className="msc-art__type">
          <code>BlogCategoryId</code>
          <ul>{BLOG_CATEGORY_IDS.map(category => (
            <li key={category}><code>{category}</code></li>
          ))}</ul>
        </div>
      );
    case 'kotlin':
      return (
        <ol className="msc-art__steps">
          <li>{en ? 'Capture image' : 'Chụp ảnh'}</li>
          <li>{en ? 'Detect · TFLite' : 'TFLite tìm hộp'}</li>
          <li>{en ? 'Decode · ML Kit' : 'ML Kit đọc mã'}</li>
        </ol>
      );
    case 'camerax':
      return <MultiBoxScan en={en} />;
    case 'maven':
      return (
        <dl className="msc-art__release">
          <div className="msc-art__registry"><dt>{en ? 'Private Maven' : 'Maven riêng'}</dt><dd>Repsy</dd></div>
          <div className="msc-art__dependency">
            <dt><code>implementation(</code></dt>
            <dd><code>{'"groupId:'}<wbr />artifactId:<wbr /><strong>version</strong>{'")'}</code></dd>
          </div>
        </dl>
      );
    default:
      return (
        <svg viewBox="0 0 176 92" className="msc-art__diagram" aria-hidden="true">
          {diagrams[technology]}
        </svg>
      );
  }
}
