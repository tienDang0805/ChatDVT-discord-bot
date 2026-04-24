import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRecovered, setShowRecovered] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowRecovered(true);
        setTimeout(() => setShowRecovered(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (isOnline && !showRecovered) return null;

  return (
    <>
      <style>{`
        @keyframes offlineSlideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
        @keyframes offlinePulse{0%,100%{opacity:1}50%{opacity:.6}}
        .offline-banner{animation:offlineSlideDown .3s ease-out}
        .offline-dot{animation:offlinePulse 1.5s ease-in-out infinite}
      `}</style>

      {!isOnline && (
        <div className="offline-banner fixed top-0 inset-x-0 z-[10000] bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 px-4 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
          <WifiOff size={14} className="shrink-0" />
          <span className="text-sm font-bold">Mất kết nối mạng</span>
          <span className="text-xs text-red-200 hidden sm:inline">— Một số tính năng sẽ không hoạt động</span>
          <span className="offline-dot ml-2 w-2 h-2 bg-white rounded-full shrink-0" />
        </div>
      )}

      {showRecovered && isOnline && (
        <div className="offline-banner fixed top-0 inset-x-0 z-[10000] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 px-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30">
          <Wifi size={14} className="shrink-0" />
          <span className="text-sm font-bold">Đã kết nối lại!</span>
        </div>
      )}
    </>
  );
};
