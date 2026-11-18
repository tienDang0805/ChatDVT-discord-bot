import type { ReactNode } from 'react';

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

function Barcode({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="msc-art__wash" width="58" height="35" rx="3" />
      <path d="M8 8v19m9-19v19m10-19v19m8-19v19m13-19v19" strokeWidth="2.5" />
      <path d="M12 8v19m10-19v19m9-19v19m9-19v19m4-19v19m8-19v19" />
    </g>
  );
}

const diagrams: Record<Exclude<TechnologyId, 'ts'>, ReactNode> = {
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
      <path className="msc-art__quiet" d="M9 72h158M57 73V54m62 19V54" />
      <path d="M50 54h76M55 53a33 23 0 0 1 66 0M66 54V37m22 17V31m22 23V37" />
      <rect className="msc-art__surface" x="9" y="39" width="40" height="30" rx="5" />
      <path d="M23 49l-5 5 5 5m12-10 5 5-5 5m-4-12-4 14" />
      <rect className="msc-art__surface" x="127" y="39" width="40" height="30" rx="5" />
      <rect x="138" y="47" width="18" height="15" rx="3" />
      <path d="M147 43v4m-5 11h10" />
      <path className="msc-art__robot-eyes" d="M143 53h.1m8 0h.1" strokeWidth="2.7" />
      <circle className="msc-art__signal msc-art__bridge" cx="49" cy="54" r="2.8" />
    </>
  ),
  nodejs: (
    <>
      <path className="msc-art__quiet" d="M36 38h104M36 56h104" />
      <path className="msc-art__surface" d="M88 20l21 12v26L88 70 67 58V32z" />
      <path d="M80 54V36l16 18V36" />
      <rect className="msc-art__surface" x="10" y="32" width="26" height="30" rx="5" />
      <path d="M17 41h12v9h-7l-3 3v-3h-2z" />
      <rect className="msc-art__surface" x="140" y="32" width="26" height="30" rx="5" />
      <path d="M153 40c0 4 2 6 6 6-4 0-6 2-6 6 0-4-2-6-6-6 4 0 6-2 6-6z" />
      <circle className="msc-art__signal msc-art__request" cx="38" cy="38" r="2.6" />
      <circle className="msc-art__signal msc-art__reply" cx="138" cy="56" r="2.6" />
    </>
  ),
  kotlin: (
    <>
      <path className="msc-art__quiet" d="M22 44h24m84 0h24" />
      <path d="M38 44h13l22-22h26l26 22h13" />
      <path className="msc-art__secondary" d="M38 44h13l22 22h26l26-22h13" />
      <circle className="msc-art__surface" cx="22" cy="44" r="7" />
      <rect className="msc-art__surface" x="77" y="16" width="14" height="12" rx="3" />
      <rect className="msc-art__surface msc-art__secondary" x="77" y="60" width="14" height="12" rx="3" />
      <circle className="msc-art__ink" cx="154" cy="44" r="7" />
      <circle className="msc-art__signal msc-art__worker" cx="29" cy="44" r="2.6" />
      <circle className="msc-art__signal msc-art__worker" data-lower cx="29" cy="44" r="2.6" />
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
  camerax: (
    <>
      <path className="msc-art__quiet" d="M17 26V13h17m108 0h17v13M17 65v13h17m108 0h17V65" />
      <Barcode x={25} y={24} />
      <Barcode x={94} y={33} />
      <path className="msc-art__scanline" d="M23 46h130" />
    </>
  ),
  maven: (
    <>
      <path className="msc-art__quiet" d="M88 61v13m0 0H48v4m40-4h40v4" />
      <path className="msc-art__surface" d="M88 12l26 13v23L88 61 62 48V25z" />
      <path d="M62 25l26 13 26-13m-26 13v23M75 18l26 13v9" />
      <rect className="msc-art__ink" x="37" y="78" width="22" height="8" rx="2" />
      <rect className="msc-art__ink" x="117" y="78" width="22" height="8" rx="2" />
      <BranchSignals y={61} />
    </>
  ),
};

export function MobileStackIllustration({ technology }: { technology: TechnologyId }) {
  if (technology === 'ts') {
    return (
      <pre className="msc-art__code"><code><b>type</b>{' Scan = {\n'}<span className="msc-art__code-field">{'  code: '}<b>string</b></span>{'\n}'}</code></pre>
    );
  }

  return (
    <svg viewBox="0 0 176 92" className="msc-art__diagram" aria-hidden="true">
      {diagrams[technology]}
    </svg>
  );
}
