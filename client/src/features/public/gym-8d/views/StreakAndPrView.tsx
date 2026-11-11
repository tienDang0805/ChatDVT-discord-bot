import React from 'react';
import { resolveMascotAsset } from '../data/assets';
import { WORKOUT_SESSIONS } from '../data/workouts';
import { DAY_TINY_NAMES } from '../domain/dateUtils';
import type {
  DayScheduleEntry,
  PersonalRecordEntry,
  SessionId,
  WorkoutSessionId,
} from '../types/gym';

interface StreakSummary {
  currentStreak: number;
  bestStreak: number;
  doneCount: number;
  missedCount: number;
  totalVolumeKg: number;
  totalKcalBurned: number;
  totalSetsDone: number;
  doneDays: DayScheduleEntry[];
  missedDays: DayScheduleEntry[];
  timeline14: DayScheduleEntry[];
  nextRestDayForMakeup: DayScheduleEntry | null;
}

interface StreakAndPrViewProps {
  streakSummary: StreakSummary;
  personalRecords: Record<string, PersonalRecordEntry>;
  dayNotesByDate: Record<string, string>;
  onOpenWorkoutForDate: (isoDate: string, sessionId?: WorkoutSessionId) => void;
  onMakeupMissed: (missedDateISO: string, missedSessionId: SessionId) => void;
  onOpenCoach: (prefill?: string, returnLabel?: string) => void;
}

export const StreakAndPrView: React.FC<StreakAndPrViewProps> = ({
  streakSummary,
  personalRecords,
  dayNotesByDate,
  onOpenWorkoutForDate,
  onMakeupMissed,
  onOpenCoach,
}) => {
  const prList = Object.values(personalRecords).sort(
    (a, b) => b.bestE1RM - a.bestE1RM || b.maxWeight - a.maxWeight
  );

  const latestMissed = streakSummary.missedDays[0] || null;

  return (
    <div className="g8d-view-stack">
      <div className="g8d-stat-grid-4">
        <div className="g8d-stat-box is-orange">
          <span className="g8d-stat-val">{streakSummary.currentStreak}</span>
          <span className="g8d-stat-lbl">Chuỗi hiện tại</span>
        </div>
        <div className="g8d-stat-box">
          <span className="g8d-stat-val">{streakSummary.bestStreak}</span>
          <span className="g8d-stat-lbl">Kỷ lục chuỗi</span>
        </div>
        <div className="g8d-stat-box">
          <span className="g8d-stat-val">{streakSummary.doneCount}</span>
          <span className="g8d-stat-lbl">Buổi hoàn tất</span>
        </div>
        <div className="g8d-stat-box">
          <span className="g8d-stat-val">
            {streakSummary.totalVolumeKg >= 1000
              ? `${(streakSummary.totalVolumeKg / 1000).toFixed(1)}t`
              : `${streakSummary.totalVolumeKg}kg`}
          </span>
          <span className="g8d-stat-lbl">Tổng khối lượng</span>
        </div>
      </div>

      <div className="g8d-smart-strip">
        <div className="g8d-smart-strip-text">
          <strong>Tổng kết tuần & Lộ trình kế tiếp:</strong> Phân tích buổi tập, kỷ lục và dinh dưỡng để điều chỉnh tuần tới.
        </div>
        <button
          type="button"
          className="g8d-smart-strip-btn"
          onClick={() =>
            onOpenCoach(
              'Tổng kết tiến độ tập luyện, chuỗi kỷ luật và ăn uống tuần này giúp tao, rồi đề xuất kế hoạch tuần tới',
              'Chuỗi & Kỷ Lục'
            )
          }
        >
          Nhờ ChatDVT review
        </button>
      </div>

      {latestMissed && streakSummary.nextRestDayForMakeup && (
        <div className="g8d-card g8d-rescue-card">
          <div className="g8d-row-between">
            <div>
              <div className="g8d-kicker">BẢO TOÀN CHUỖI KỶ LUẬT</div>
              <div className="g8d-card-title">
                Bù buổi {latestMissed.dayShort} ({latestMissed.shortDate})
              </div>
              <div className="g8d-tiny-meta">
                Dời sang ngày nghỉ gần nhất:{' '}
                <strong>
                  {streakSummary.nextRestDayForMakeup.dayShort} ({streakSummary.nextRestDayForMakeup.shortDate})
                </strong>
              </div>
            </div>
            <button
              type="button"
              className="g8d-btn-primary"
              onClick={() => onMakeupMissed(latestMissed.isoDate, latestMissed.sessionId)}
            >
              Dời tập bù
            </button>
          </div>
        </div>
      )}

      <div className="g8d-card">
        <div className="g8d-row-between" style={{ marginBottom: 8 }}>
          <div className="g8d-kicker">CHUỖI 14 NGÀY GẦN NHẤT</div>
          <span className="g8d-tiny-meta">{streakSummary.totalSetsDone} hiệp đã chốt</span>
        </div>

        <div className="g8d-chain-14">
          {streakSummary.timeline14.map((d) => (
            <button
              key={d.isoDate}
              type="button"
              onClick={() =>
                d.sessionId !== 'rest'
                  ? onOpenWorkoutForDate(d.isoDate, d.sessionId as WorkoutSessionId)
                  : undefined
              }
              className={`g8d-chain-cell ${
                d.isCompleted
                  ? 'is-done'
                  : d.isMissed
                  ? 'is-missed'
                  : d.isWorkoutDay
                  ? 'is-workout'
                  : 'is-rest'
              } ${d.isToday ? 'is-today' : ''}`}
            >
              <span className="g8d-chain-dow">{DAY_TINY_NAMES[d.dayOfWeek]}</span>
              <strong>{d.dayNumber}</strong>
              <span className="g8d-chain-mark">
                {d.isCompleted ? 'Xong' : d.isMissed ? 'Bận' : d.isWorkoutDay ? 'Tập' : '–'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="g8d-card">
        <div className="g8d-row-between" style={{ marginBottom: 8 }}>
          <div>
            <div className="g8d-kicker">SỨC MẠNH & TĂNG TẢI TUẦN TIẾN</div>
            <div className="g8d-card-title">Bảng Kỷ Lục Cá Nhân (PR)</div>
          </div>
          <span className="g8d-badge is-orange">{prList.length} bài</span>
        </div>

        {prList.length === 0 ? (
          <div className="g8d-empty-box">
            <img
              src={resolveMascotAsset('prTrophy')}
              alt=""
              width={60}
              height={60}
              className="g8d-empty-mascot"
            />
            <div className="g8d-tiny-meta">
              Chốt hiệp ở bất kỳ bài tập nào hoặc báo mức tạ cho ChatDVT để hệ thống tự lưu mốc kỷ lục cho các tuần sau.
            </div>
          </div>
        ) : (
          <div className="g8d-stack-xs">
            {prList.map((rec) => (
              <div key={rec.exerciseId} className="g8d-pr-row">
                <img
                  src={resolveMascotAsset(rec.mascot)}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="g8d-mini-avatar"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">{rec.exerciseName}</div>
                  <div className="g8d-tiny-meta">
                    Đạt ngày {rec.maxWeightDateShort} · Tổng {rec.totalDoneSetsAllTime} hiệp
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="g8d-pr-weight">
                    {rec.maxWeight}kg × {rec.repsAtMaxWeight}
                  </div>
                  <div className="g8d-tiny-meta">1RM ~{rec.bestE1RM}kg</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {streakSummary.doneDays.length > 0 && (
        <div className="g8d-card">
          <div className="g8d-kicker">NHẬT KÝ BUỔI TẬP ĐÃ HOÀN THÀNH</div>
          <div className="g8d-stack-xs" style={{ marginTop: 8 }}>
            {streakSummary.doneDays.slice(0, 8).map((d) => {
              const sess = WORKOUT_SESSIONS[d.sessionId as WorkoutSessionId];
              return (
                <div
                  key={d.isoDate}
                  className="g8d-history-item g8d-row-between"
                  onClick={() =>
                    d.sessionId !== 'rest' &&
                    onOpenWorkoutForDate(d.isoDate, d.sessionId as WorkoutSessionId)
                  }
                >
                  <div>
                    <div>
                      <strong>
                        {d.dayShort} ({d.shortDate})
                      </strong>{' '}
                      · {sess?.shortName || d.sessionId}
                    </div>
                    {dayNotesByDate[d.isoDate] && (
                      <div className="g8d-tiny-meta">Ghi chú: {dayNotesByDate[d.isoDate]}</div>
                    )}
                  </div>
                  <span className="g8d-badge is-green">
                    {d.totalVolumeKg.toLocaleString('vi-VN')}kg
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
