import React from 'react';
import type { RestTimerState } from '../hooks/useWallClockRestTimer';
import { pad2 } from '../domain/dateUtils';
import { SvgIcon } from './Icons';

interface FloatingRestBarProps {
  timer: RestTimerState;
  onAdjust: (deltaSec: number) => void;
  onStop: () => void;
}

export const FloatingRestBar: React.FC<FloatingRestBarProps> = ({ timer, onAdjust, onStop }) => {
  if (!timer.active || timer.remainingSec <= 0) return null;

  const mins = Math.floor(timer.remainingSec / 60);
  const secs = timer.remainingSec % 60;
  const pct = Math.max(0, Math.min(100, Math.round((timer.remainingSec / Math.max(1, timer.totalSec)) * 100)));

  return (
    <div className="g8d-floating-rest" role="status" aria-live="polite">
      <div className="g8d-floating-rest-top">
        <div className="g8d-floating-rest-clock">
          <SvgIcon name="clock" size={14} color="#FDBA74" />
          <span>{pad2(mins)}:{pad2(secs)}</span>
        </div>
        <div className="g8d-floating-rest-meta">
          <div className="g8d-floating-rest-ex">{timer.exerciseName || 'Nghỉ giữa hiệp'}</div>
          <div className="g8d-floating-rest-next">{timer.nextSetLabel}</div>
        </div>
        <div className="g8d-floating-rest-actions">
          <button type="button" onClick={() => onAdjust(-15)} className="g8d-rest-chip">
            -15s
          </button>
          <button type="button" onClick={() => onAdjust(30)} className="g8d-rest-chip">
            +30s
          </button>
          <button type="button" onClick={onStop} className="g8d-rest-chip g8d-rest-skip">
            Bỏ qua
          </button>
        </div>
      </div>
      <div className="g8d-floating-rest-track">
        <div className="g8d-floating-rest-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
