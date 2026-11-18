import type { ReactNode } from 'react';

export type TechnologyId = 'rn' | 'kotlin' | 'android' | 'ts' | 'java' | 'camerax' | 'maven' | 'nodejs';

function AppPreview({ x, y, inset }: { x: number; y: number; inset: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="msc-art__surface" width="42" height="52" rx="6" />
      {inset}
      <rect className="msc-art__wash" x="7" y="15" width="28" height="15" rx="3" />
      <path className="msc-art__quiet" d="M8 35h20m-20 4h14" />
      <rect className="msc-art__ink" x="7" y="44" width="12" height="3" rx="1.5" />
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
    </>
  ),
  java: (
    <>
      <path className="msc-art__quiet" d="M9 72h158M57 73V54m62 19V54" />
      <path d="M50 54h76M55 53a33 23 0 0 1 66 0M66 54V37m22 17V31m22 23V37" />
      <rect className="msc-art__surface" x="9" y="39" width="40" height="30" rx="5" />
      <path d="M23 49l-5 5 5 5m12-10 5 5-5 5m-4-12-4 14" />
      <rect className="msc-art__surface" x="127" y="39" width="40" height="30" rx="5" />
      <path d="M141 48h12v12h-12zm-3 3h3m-3 6h3m12-6h3m-3 6h3m-12-12v3m6-3v3m-6 12v3m6-3v3" />
    </>
  ),
  nodejs: (
    <>
      <path className="msc-art__quiet" d="M10 38h50m56 18h50" />
      <path d="M33 38h20l-5-5m5 5-5 5m76 13h19l-5-5m5 5-5 5" />
      <path className="msc-art__surface" d="M88 18l23 14v27L88 73 65 59V32z" />
      <path d="M78 61V37l20 24V36" />
      <circle className="msc-art__ink" cx="17" cy="38" r="3.5" />
      <circle className="msc-art__ink" cx="159" cy="56" r="3.5" />
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
    </>
  ),
  android: (
    <>
      <path className="msc-art__quiet" d="M46 54l42 19 42-19M46 65l42 19 42-19" />
      <path className="msc-art__surface" d="M42 43l46-20 46 20-46 20z" />
      <path className="msc-art__ink" d="M73 37a15 13 0 0 1 30 0z" />
      <path d="M79 28l-4-5m22 5 4-5" />
      <path className="msc-art__cutout" d="M82 33h.1m12 0h.1" />
    </>
  ),
  camerax: (
    <>
      <path className="msc-art__quiet" d="M17 26V13h17m108 0h17v13M17 65v13h17m108 0h17V65" />
      <rect className="msc-art__wash" x="43" y="24" width="90" height="44" rx="3" />
      <path d="M55 32v28m7-28v28m10-28v28m8-28v28m8-28v28m12-28v28m8-28v28m10-28v28" strokeWidth="2.7" />
      <path d="M48 32v28m19-28v28m29-28v28m17-28v28m11-28v28" />
      <path className="msc-art__scanline" d="M28 46h120" />
    </>
  ),
  maven: (
    <>
      <path className="msc-art__quiet" d="M88 56v14m0 0H42v8m46-8h46v8" />
      <path className="msc-art__surface" d="M88 12l26 13v23L88 61 62 48V25z" />
      <path d="M62 25l26 13 26-13m-26 13v23M75 18l26 13v9" />
      <rect className="msc-art__ink" x="31" y="77" width="22" height="8" rx="2" />
      <rect className="msc-art__ink" x="123" y="77" width="22" height="8" rx="2" />
    </>
  ),
};

export function MobileStackIllustration({ technology }: { technology: TechnologyId }) {
  if (technology === 'ts') {
    return (
      <pre className="msc-art__code"><code><b>type</b>{' Frame = {\n  width: '}<b>number</b>{'\n}'}</code></pre>
    );
  }

  return (
    <svg viewBox="0 0 176 92" className="msc-art__diagram" aria-hidden="true">
      {diagrams[technology]}
    </svg>
  );
}
