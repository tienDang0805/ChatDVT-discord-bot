import { useCallback, useEffect, useRef, useState } from 'react';

const REST_STORAGE_KEY = '8d_gym_wallclock_rest_v1';

export interface RestTimerState {
  active: boolean;
  endsAtMs: number;
  totalSec: number;
  remainingSec: number;
  exerciseName: string;
  nextSetLabel: string;
}

export function playGymChime(type: 'rest' | 'notify' | 'pr' = 'rest'): void {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes =
      type === 'pr'
        ? [523.25, 659.25, 783.99, 1046.5]
        : type === 'notify'
        ? [659.25, 880, 1046.5]
        : [880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.36);
    });
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 90, 200]);
    }
  } catch {}
}

function readPersistedTimer(): Omit<RestTimerState, 'remainingSec'> | null {
  try {
    const raw = sessionStorage.getItem(REST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.active && Number(parsed.endsAtMs) > Date.now()) {
      return parsed;
    }
    sessionStorage.removeItem(REST_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function useWallClockRestTimer(syncCode: string, enableServerPush: boolean) {
  const [timer, setTimer] = useState<RestTimerState>(() => {
    const saved = typeof window !== 'undefined' ? readPersistedTimer() : null;
    if (saved) {
      const rem = Math.max(0, Math.ceil((saved.endsAtMs - Date.now()) / 1000));
      return { ...saved, remainingSec: rem, active: rem > 0 };
    }
    return {
      active: false,
      endsAtMs: 0,
      totalSec: 120,
      remainingSec: 0,
      exerciseName: '',
      nextSetLabel: '',
    };
  });

  const syncRef = useRef({ syncCode, enableServerPush });
  syncRef.current = { syncCode, enableServerPush };

  const notifyServerRestTimer = useCallback(
    (delaySec: number, exerciseName: string, nextSetLabel: string) => {
      if (!syncRef.current.enableServerPush || typeof window === 'undefined') return;
      if (window.location.protocol === 'file:') return;
      fetch('/api/gym8d/push/rest-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: syncRef.current.syncCode,
          delaySec,
          exerciseName,
          nextSetLabel,
        }),
        keepalive: true,
      }).catch(() => {});
    },
    []
  );

  const cancelServerRestTimer = useCallback(() => {
    if (typeof window === 'undefined' || window.location.protocol === 'file:') return;
    fetch('/api/gym8d/push/rest-timer/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: syncRef.current.syncCode }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  const startRestTimer = useCallback(
    (durationSec: number, exerciseName: string, nextSetLabel: string) => {
      const cleanSec = Math.max(10, Math.min(600, Math.round(durationSec || 90)));
      const endsAtMs = Date.now() + cleanSec * 1000;
      const nextState: RestTimerState = {
        active: true,
        endsAtMs,
        totalSec: cleanSec,
        remainingSec: cleanSec,
        exerciseName,
        nextSetLabel,
      };
      setTimer(nextState);
      try {
        sessionStorage.setItem(REST_STORAGE_KEY, JSON.stringify(nextState));
      } catch {}
      notifyServerRestTimer(cleanSec, exerciseName, nextSetLabel);
    },
    [notifyServerRestTimer]
  );

  const adjustRestTimer = useCallback(
    (deltaSec: number) => {
      setTimer((prev) => {
        if (!prev.active) return prev;
        const nextEndsAt = prev.endsAtMs + deltaSec * 1000;
        const nextRem = Math.max(0, Math.ceil((nextEndsAt - Date.now()) / 1000));
        if (nextRem <= 0) {
          try {
            sessionStorage.removeItem(REST_STORAGE_KEY);
          } catch {}
          cancelServerRestTimer();
          return { ...prev, active: false, remainingSec: 0, endsAtMs: 0 };
        }
        const nextTotal = Math.max(prev.totalSec, nextRem);
        const updated = {
          ...prev,
          endsAtMs: nextEndsAt,
          totalSec: nextTotal,
          remainingSec: nextRem,
        };
        try {
          sessionStorage.setItem(REST_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        notifyServerRestTimer(nextRem, prev.exerciseName, prev.nextSetLabel);
        return updated;
      });
    },
    [cancelServerRestTimer, notifyServerRestTimer]
  );

  const stopRestTimer = useCallback(() => {
    try {
      sessionStorage.removeItem(REST_STORAGE_KEY);
    } catch {}
    cancelServerRestTimer();
    setTimer((prev) => ({ ...prev, active: false, remainingSec: 0, endsAtMs: 0 }));
  }, [cancelServerRestTimer]);

  useEffect(() => {
    if (!timer.active || timer.endsAtMs <= 0) return;

    const recalculate = () => {
      const rem = Math.max(0, Math.ceil((timer.endsAtMs - Date.now()) / 1000));
      if (rem <= 0) {
        try {
          sessionStorage.removeItem(REST_STORAGE_KEY);
        } catch {}
        playGymChime('rest');
        setTimer((prev) => ({ ...prev, active: false, remainingSec: 0, endsAtMs: 0 }));
      } else {
        setTimer((prev) => (prev.remainingSec === rem ? prev : { ...prev, remainingSec: rem }));
      }
    };

    recalculate();
    const interval = setInterval(recalculate, 300);
    const onVisChange = () => {
      if (document.visibilityState === 'visible') recalculate();
    };
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('focus', recalculate);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('focus', recalculate);
    };
  }, [timer.active, timer.endsAtMs]);

  return {
    restTimer: timer,
    startRestTimer,
    adjustRestTimer,
    stopRestTimer,
  };
}
