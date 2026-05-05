import { useEffect } from 'react';

function getOS(): string {
  const ua = navigator.userAgent;
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) {
    const ver = ua.match(/Mac OS X ([\d_]+)/);
    return ver ? `macOS ${ver[1].replace(/_/g, '.')}` : 'macOS';
  }
  if (/iPhone|iPad/.test(ua)) {
    const ver = ua.match(/OS ([\d_]+)/);
    return `iOS ${ver ? ver[1].replace(/_/g, '.') : ''}`.trim();
  }
  if (/Android/.test(ua)) {
    const ver = ua.match(/Android ([\d.]+)/);
    return `Android ${ver ? ver[1] : ''}`.trim();
  }
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return ua.match(/Edg\/([\d.]+)/)?.[0]?.replace('Edg', 'Edge') || 'Edge';
  if (/OPR\//.test(ua)) return `Opera/${ua.match(/OPR\/([\d.]+)/)?.[1] || ''}`;
  if (/SamsungBrowser/.test(ua)) return `Samsung/${ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || ''}`;
  if (/Firefox\//.test(ua)) return ua.match(/Firefox\/[\d.]+/)?.[0] || 'Firefox';
  if (/CriOS\//.test(ua)) return `Chrome/${ua.match(/CriOS\/([\d.]+)/)?.[1] || ''}`;
  if (/Chrome\//.test(ua)) return ua.match(/Chrome\/[\d.]+/)?.[0] || 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    const ver = ua.match(/Version\/([\d.]+)/);
    return `Safari/${ver ? ver[1] : ''}`;
  }
  return 'Unknown';
}

export function usePageTracker(pageName: string): void {
  useEffect(() => {
    const payload = {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      os: getOS(),
      browser: getBrowser(),
      screenSize: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', blob);
    } else {
      fetch('/api/track', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  }, [pageName]);
}
