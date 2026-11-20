import type { CSSProperties } from 'react';

const parcels = [
  { x: 27, y: 53, serial: 'SN-DangVanTien', pid: '2000000000015' },
  { x: 136, y: 36, serial: 'SN-ChatDVT', pid: '2000000000022' },
  { x: 245, y: 57, serial: 'SN-MobileEngineer', pid: '2000000000039' },
];
const bars = [2, 6, 9, 14, 17, 22, 26, 29, 34, 37, 41, 45, 49, 54];

export function MultiBoxScan({ en }: { en: boolean }) {
  return (
    <svg className="vision-diagram" viewBox="0 0 360 210" fill="none" role="img"
      aria-label={en ? 'Scan illustration: capture three boxes, confirm six barcodes, then show the serial number and PID for each box.' : 'Minh hoạ quét: chụp ba hộp, xác nhận sáu mã vạch, rồi xem Serial Number và PID theo từng hộp.'}>
      <g className="vision-preview" aria-hidden="true">
        <path d="M14 43V25h18m296 0h18v18m0 122v18h-18m-296 0H14v-18" className="vision-frame" />
        {parcels.map(({ x, y }, boxIndex) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <rect className="vision-package" x="4" y="7" width="80" height="101" rx="4" />
            <path className="vision-seam" d="m4 23 80 0M35 7v16h17V7" />
            <rect className="vision-bound" width="88" height="112" rx="5" />
            {[39, 75].map((top, index) => (
              <g key={top} transform={`translate(13 ${top})`}>
                <rect className="vision-barcode-bound" width="62" height="25" rx="2" />
                {bars.map((bar, barIndex) => (
                  <path className="vision-barcode" key={bar} d={`M${bar + 3} 5v15`} strokeWidth={(barIndex + index) % 3 ? 1.3 : 2.5} />
                ))}
                <g className="vision-check" style={{ '--vision-check-delay': `${(boxIndex * 2 + index) * 110}ms` } as CSSProperties}>
                  <circle cx="62" cy="4" r="10" />
                  <path d="m57.5 4 3 3 5.5-6" />
                </g>
              </g>
            ))}
          </g>
        ))}
        <circle className="vision-shutter-ring" cx="180" cy="193" r="11" />
        <circle className="vision-shutter" cx="180" cy="193" r="7" />
        <rect className="vision-capture" x="15" y="26" width="330" height="156" rx="9" />
      </g>
      <g className="vision-results" aria-hidden="true">
        <text className="vision-results-title" x="15" y="27">{en ? 'Results' : 'Kết quả'}</text>
        <text className="vision-results-note" x="345" y="26" textAnchor="end">{en ? 'Sample data' : 'Dữ liệu mẫu'}</text>
        <text className="vision-results-label" x="80" y="57">Serial Number</text>
        <text className="vision-results-label" x="230" y="57">PID (EAN)</text>
        {parcels.map(({ serial, pid }, index) => {
          const row = 67 + index * 43;
          return (
            <g key={serial}>
              <rect className="vision-result-row" x="15" y={row} width="330" height="37" rx="5" />
              <text className="vision-results-box" x="26" y={row + 24}>{en ? 'Box' : 'Hộp'} {index + 1}</text>
              <text className="vision-results-value" x="80" y={row + 24}>{serial}</text>
              <text className="vision-results-value" x="230" y={row + 24}>{pid}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function TabletRobot() {
  return (
    <g className="tablet-robot">
      <path className="tablet-robot__dark" d="M-22-9h46v4c0 3-8 5-23 5s-23-2-23-5z" />
      <path className="tablet-robot__body" d="M-16-16h31l7 5c2 2 2 3 1 4-3 3-14 4-23 4s-23-1-24-5c0-2 3-5 8-8z" />
      <path className="tablet-robot__shade" d="M-22-8c5 2 15 3 23 3 11 0 19-1 22-3v2c-3 3-13 4-22 4S-19-3-22-6z" />
      <path className="tablet-robot__core" d="M-5-61h10v14H-5z" />
      <path className="tablet-robot__body" d="M-10-52h18c9 0 15 4 16 10l2 12c.5 3-1 5-4 5h-3l-3 12c-3 3-9 5-16 5s-13-2-16-5l-3-12h-3c-3 0-4-2-4-5l2-12c1-6 6-10 14-10z" />
      <path className="tablet-robot__shade" d="M11-52c7 1 12 5 13 10l2 12c.5 3-1 5-4 5h-3l-3 12c-2 2-6 4-10 4l6-17 2-17c0-4-1-7-3-9zM-19-26l-3 1v-5l2-12 3-4z" />
      <path className="tablet-robot__core" d="M-9-21H8l1 4H-8z" />
      <rect className="tablet-robot__dark" x="-13" y="-46" width="26" height="22" rx="3.5" />
      <rect className="tablet-robot__display" x="-10.5" y="-43.5" width="21" height="17" rx="2" />
      <path className="tablet-robot__detail" d="M-7-39.5h10m-10 4h14m-14 4h8" />
      <path className="tablet-robot__body" d="M-16-62c0-8 7-13 16-13s16 5 16 13c0 6-5 10-16 10s-16-4-16-10z" />
      <path className="tablet-robot__shade" d="M9-73c5 2 7 6 7 11 0 6-5 10-16 10l-3-.2c12-1 14-6 14-11 0-3-1-7-2-10z" />
      <path className="tablet-robot__dark" d="M-11-65c0-3 2-4 5-4H6c3 0 5 1 5 4s-2 5-5 5H-6c-3 0-5-2-5-5z" />
      <circle className="tablet-robot__sensor" cx="0" cy="-64.5" r="1.6" />
    </g>
  );
}
