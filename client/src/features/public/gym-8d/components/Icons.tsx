import React from 'react';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
}

export const SvgIcon: React.FC<IconProps> = ({
  name,
  size = 18,
  color = 'currentColor',
  strokeWidth = 2.0,
  filled = false,
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { flexShrink: 0 },
  };

  switch (name) {
    case 'calendar':
      if (filled) {
        return (
          <svg {...common}>
            <rect x="3" y="4.5" width="18" height="16.5" rx="4" fill={color} stroke={color} strokeWidth={1.6} />
            <line x1="8" y1="2.5" x2="8" y2="6" stroke={color} strokeWidth={2.2} />
            <line x1="16" y1="2.5" x2="16" y2="6" stroke={color} strokeWidth={2.2} />
            <line x1="3.8" y1="9.5" x2="20.2" y2="9.5" stroke="#FFFDF9" strokeWidth={1.8} />
            <circle cx="8.5" cy="14.2" r="1.2" fill="#FFFDF9" stroke="none" />
            <circle cx="12" cy="14.2" r="1.2" fill="#FFFDF9" stroke="none" />
            <circle cx="15.5" cy="14.2" r="1.2" fill="#FFFDF9" stroke="none" />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16.5" rx="4" />
          <line x1="16" y1="2.5" x2="16" y2="6" />
          <line x1="8" y1="2.5" x2="8" y2="6" />
          <line x1="3" y1="9.5" x2="21" y2="9.5" />
        </svg>
      );
    case 'dumbbell':
      if (filled) {
        return (
          <svg {...common}>
            <rect x="2" y="8.5" width="3" height="7" rx="1.3" fill={color} stroke={color} strokeWidth={1.4} />
            <rect x="5" y="6" width="3.5" height="12" rx="1.5" fill={color} stroke={color} strokeWidth={1.4} />
            <line x1="8.5" y1="12" x2="15.5" y2="12" stroke={color} strokeWidth={2.8} />
            <rect x="15.5" y="6" width="3.5" height="12" rx="1.5" fill={color} stroke={color} strokeWidth={1.4} />
            <rect x="19" y="8.5" width="3" height="7" rx="1.3" fill={color} stroke={color} strokeWidth={1.4} />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <rect x="2" y="9" width="2.8" height="6" rx="1.1" />
          <rect x="4.8" y="6.5" width="3.4" height="11" rx="1.3" />
          <line x1="8.2" y1="12" x2="15.8" y2="12" />
          <rect x="15.8" y="6.5" width="3.4" height="11" rx="1.3" />
          <rect x="19.2" y="9" width="2.8" height="6" rx="1.1" />
        </svg>
      );
    case 'flame':
      return (
        <svg {...common} fill={filled ? color : 'none'}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'utensils':
      if (filled) {
        return (
          <svg {...common}>
            <path d="M4 3v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3" strokeWidth={2} />
            <path d="M7 3v18" strokeWidth={2.2} />
            <path d="M19 3c-2.8 0-4.5 2.4-4.5 6.2 0 2.1 1.1 3.3 2.5 3.6h2V3Z" fill={color} stroke={color} strokeWidth={1.6} />
            <path d="M19 12.8V21" strokeWidth={2.2} />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <path d="M4 3v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3" />
          <path d="M7 3v18" />
          <path d="M19 3c-2.6 0-4.2 2.3-4.2 6 0 2 1 3.2 2.4 3.5H19V3Z" />
          <path d="M19 12.5V21" />
        </svg>
      );
    case 'user':
      if (filled) {
        return (
          <svg {...common}>
            <circle cx="12" cy="8" r="4.3" fill={color} stroke={color} strokeWidth={1.5} />
            <path d="M5 19.5c0-3.4 3.1-5.8 7-5.8s7 2.4 7 5.8c0 .8-.6 1.5-1.4 1.5H6.4c-.8 0-1.4-.7-1.4-1.5Z" fill={color} stroke={color} strokeWidth={1.5} />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4.3" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common} fill={filled ? color : 'none'}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" fill="none" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'chevronDown':
      return (
        <svg {...common}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case 'chevronLeft':
      return (
        <svg {...common}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg {...common}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'arrowLeft':
      return (
        <svg {...common}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case 'swap':
      return (
        <svg {...common}>
          <polyline points="17 2 21 6 17 10" />
          <path d="M3 11V9a3 3 0 0 1 3-3h15" />
          <polyline points="7 22 3 18 7 14" />
          <path d="M21 13v2a3 3 0 0 1-3 3H3" />
        </svg>
      );
    case 'undo':
      return (
        <svg {...common}>
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'droplet':
      return (
        <svg {...common}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      );
    case 'iosShare':
      return (
        <svg {...common}>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case 'mic':
      return (
        <svg {...common}>
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      );
    case 'send':
      return (
        <svg {...common}>
          <line x1="12" y1="19" x2="12" y2="5" strokeWidth={2.4} />
          <polyline points="5 12 12 5 19 12" strokeWidth={2.4} />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...common}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...common}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};
