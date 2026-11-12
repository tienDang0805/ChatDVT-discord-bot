import React, { useState } from 'react';
import type { WeightLogEntry } from '../types/gym';

interface WeightTrackerSummary {
  effectiveLogs: WeightLogEntry[];
  firstWeightKg: number;
  latestWeightKg: number;
  targetWeightKg: number;
  deltaFromStart: number;
  remainingToGoal: number;
  progressPct: number;
  nextWeighInShort: string;
  daysUntilNextWeighIn: number;
  hasLoggedToday: boolean;
  isWeighInDueToday: boolean;
}

interface WeightChartCardProps {
  summary: WeightTrackerSummary;
  weighInIntervalDays: 7 | 14;
  onLogWeight: (kg: number) => void;
  onChangeInterval: (days: 7 | 14) => void;
}

export const WeightChartCard: React.FC<WeightChartCardProps> = ({
  summary,
  weighInIntervalDays,
  onLogWeight,
  onChangeInterval,
}) => {
  const [draftKg, setDraftKg] = useState<string>(() => String(summary.latestWeightKg));

  const points = summary.effectiveLogs.slice(-10);
  const allVals = [...points.map((p) => p.weight), summary.targetWeightKg];
  const minW = Math.floor(Math.min(...allVals) - 2);
  const maxW = Math.ceil(Math.max(...allVals) + 2);
  const span = Math.max(4, maxW - minW);

  const svgW = 320;
  const svgH = 128;
  const padX = 24;
  const padY = 18;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  const toY = (w: number) => padY + plotH - ((w - minW) / span) * plotH;
  const toX = (idx: number) =>
    points.length <= 1 ? svgW / 2 : padX + (idx / (points.length - 1)) * plotW;

  const polylinePoints = points.map((p, i) => `${toX(i)},${toY(p.weight)}`).join(' ');
  const targetY = toY(summary.targetWeightKg);

  const stepDraft = (delta: number) => {
    const cur = Number(draftKg) || summary.latestWeightKg;
    const next = Math.max(40, Math.min(200, Math.round((cur + delta) * 10) / 10));
    setDraftKg(String(next));
  };

  const handleSave = () => {
    const val = Number(draftKg);
    if (!val || val < 38 || val > 200) return;
    onLogWeight(val);
  };

  return (
    <div className="g8d-card">
      <div className="g8d-row-between">
        <div>
          <div className="g8d-kicker">TIẾN ĐỘ CÂN NẶNG</div>
          <div className="g8d-card-title">
            {summary.latestWeightKg} kg{' '}
            <span className="g8d-muted-inline">mục tiêu {summary.targetWeightKg} kg</span>
          </div>
        </div>
        <span className={`g8d-badge ${summary.deltaFromStart <= 0 ? 'is-green' : 'is-orange'}`}>
          {summary.deltaFromStart > 0 ? `+${summary.deltaFromStart}` : summary.deltaFromStart} kg
        </span>
      </div>

      <div className="g8d-progress-track" style={{ marginTop: 8 }}>
        <div className="g8d-progress-fill is-green" style={{ width: `${summary.progressPct}%` }} />
      </div>
      <div className="g8d-row-between g8d-tiny-meta" style={{ marginTop: 5 }}>
        <span>Đạt {summary.progressPct}% chặng đường</span>
        <span>Còn {summary.remainingToGoal} kg · Kỳ cân tới: {summary.nextWeighInShort}</span>
      </div>

      <div className="g8d-chart-box">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="128" role="img" aria-label="Biểu đồ cân nặng">
          <line
            x1={padX}
            y1={targetY}
            x2={svgW - padX}
            y2={targetY}
            stroke="#1E8754"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x={svgW - padX} y={Math.max(12, targetY - 4)} textAnchor="end" fontSize="9.5" fill="#1E8754" fontWeight="700">
            Đích {summary.targetWeightKg}kg
          </text>

          {points.length > 1 && (
            <polyline
              fill="none"
              stroke="#FF7A2F"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          )}

          {points.map((pt, idx) => {
            const cx = toX(idx);
            const cy = toY(pt.weight);
            return (
              <g key={`${pt.isoDate}-${idx}`}>
                <circle cx={cx} cy={cy} r="4.5" fill="#FFFDF9" stroke="#2B2118" strokeWidth="2" />
                <text x={cx} y={Math.max(11, cy - 8)} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#2B2118">
                  {pt.weight}
                </text>
                <text x={cx} y={svgH - 3} textAnchor="middle" fontSize="8.5" fill="#7C6B5D">
                  {pt.dateLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="g8d-weigh-input-row">
        <button type="button" className="g8d-step-btn" onClick={() => stepDraft(-0.5)}>
          −0.5
        </button>
        <input
          type="number"
          inputMode="decimal"
          enterKeyHint="done"
          step="0.1"
          value={draftKg}
          onChange={(e) => setDraftKg(e.target.value)}
          className="g8d-num-input"
          aria-label="Số kg hôm nay"
        />
        <button type="button" className="g8d-step-btn" onClick={() => stepDraft(0.5)}>
          +0.5
        </button>
        <button type="button" className="g8d-btn-primary" onClick={handleSave}>
          Lưu
        </button>
      </div>

      <div className="g8d-row-between" style={{ marginTop: 12 }}>
        <span className="g8d-tiny-meta">Chu kỳ nhắc cân buổi sáng:</span>
        <div className="g8d-seg-mini">
          <button
            type="button"
            className={weighInIntervalDays === 7 ? 'is-active' : ''}
            onClick={() => onChangeInterval(7)}
          >
            Mỗi 7 ngày
          </button>
          <button
            type="button"
            className={weighInIntervalDays === 14 ? 'is-active' : ''}
            onClick={() => onChangeInterval(14)}
          >
            Mỗi 14 ngày
          </button>
        </div>
      </div>
    </div>
  );
};
