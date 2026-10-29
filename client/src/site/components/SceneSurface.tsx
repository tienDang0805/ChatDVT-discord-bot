/** Decorative technical drawings projected onto the glass stack (pure vector paths, zero text nodes). */
export function SceneSurface({ index }: { index: number }) {
  return <svg className="scene-surface" viewBox="0 0 460 210" fill="none" aria-hidden="true">
    {index === 0 ? <>
      <rect x="14" y="12" width="128" height="185" rx="12" /><rect x="25" y="25" width="106" height="18" rx="4" className="scene-fill" />
      <circle cx="40" cy="64" r="8" className="scene-fill" /><path d="M56 61h48M56 68h31" /><rect x="25" y="86" width="106" height="51" rx="6" className="scene-fill" />
      <path d="M25 151h106M25 161h83M25 171h93M58 186h41" />
      <rect x="166" y="12" width="279" height="87" rx="8" /><rect x="178" y="25" width="255" height="9" rx="3" className="scene-fill" />
      <path d="M178 48h92M178 59h138M178 70h111M178 81h66" /><rect x="166" y="114" width="130" height="83" rx="7" /><rect x="311" y="114" width="134" height="83" rx="7" />
      <path d="M180 134h56M180 145h99M180 156h78M325 134h65M325 145h104M325 156h81" />
      <rect x="180" y="174" width="48" height="10" rx="3" className="scene-fill" /><rect x="325" y="174" width="48" height="10" rx="3" className="scene-fill" />
    </> : index === 1 ? <>
      <path d="M18 24h168M36 48h96M36 72h184M36 96h142M18 120h28" />
      <path d="M20 152h112l25 24h119l24-24h135" /><rect x="20" y="142" width="74" height="36" rx="5" className="scene-solid" /><rect x="177" y="158" width="91" height="36" rx="5" className="scene-solid" /><rect x="345" y="132" width="91" height="46" rx="5" className="scene-solid" />
      <path d="M35 160h44M194 176h56M362 155h56" /><circle cx="308" cy="152" r="4" className="scene-fill" />
      <path d="M338 22v73M349 22v73M360 22v73M371 22v73M382 22v73M393 22v73M404 22v73M415 22v73" opacity=".25" />
    </> : index === 2 ? <>
      <path d="M106 48h246q62 0 62 57t-62 57H106q-62 0-62-57t62-57Z" strokeDasharray="5 7" />
      {[[62,30],[300,30],[300,143],[62,143]].map(([x,y], idx) => <g key={idx}><rect x={x} y={y} width="101" height="38" rx="6" className="scene-solid" /><path d={`M${x + 18} ${y + 19}h64`} /></g>)}
      <path d="M162 104h135M162 117h135" /><circle cx="235" cy="48" r="4" className="scene-fill" /><circle cx="235" cy="162" r="4" className="scene-fill" />
    </> : index === 3 ? <>
      <rect x="156" y="14" width="144" height="183" rx="8" strokeDasharray="4 6" opacity=".5" /><path d="M177 32h72" />
      <path d="M54 83h348M54 129h348M395 76l8 7-8 7M62 122l-8 7 8 7" />
      {[14,169,326].map((x) => <g key={x}><rect x={x} y="87" width="116" height="39" rx="6" className="scene-solid" /><path d={`M${x + 20} 107h76`} /></g>)}
      <path d="M30 162h96M187 162h96M222 177v13h148" /><circle cx="369" cy="190" r="4" className="scene-fill" />
    </> : <>
      <path d="M18 28h140M18 51h267M18 65h229M18 79h254" />
      <rect x="18" y="101" width="272" height="88" rx="6" className="scene-fill" /><path d="M32 122h112M49 145h164M32 168h28" />
      <rect x="315" y="19" width="128" height="170" rx="6" /><path d="M330 37h82M330 49h64M330 74h97M330 86h77M330 98h91M330 123h82M330 135h63M330 147h99" />
    </>}
  </svg>;
}
