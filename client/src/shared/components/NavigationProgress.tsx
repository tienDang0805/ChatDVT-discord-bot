import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const NavigationProgress = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(location.pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const rafRef = useRef<number>();

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    setVisible(true);
    setProgress(0);

    rafRef.current = requestAnimationFrame(() => {
      setProgress(30);
    });

    timerRef.current = setTimeout(() => {
      setProgress(70);
    }, 100);

    const finish = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 250);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(finish);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[10001] h-[3px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.7)]"
        style={{
          width: `${progress}%`,
          transition: progress === 0
            ? 'none'
            : progress === 100
              ? 'width 200ms ease-out'
              : 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
};
