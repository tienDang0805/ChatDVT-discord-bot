import React, { useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { SvgIcon } from '../components/Icons';
import { WeightChartCard } from '../components/WeightChartCard';
import { resolveMascotAsset } from '../data/assets';
import { WORKOUT_SESSIONS } from '../data/workouts';
import { DAY_TINY_NAMES } from '../domain/dateUtils';
import type { CalculatedMetrics } from '../domain/metrics';
import type {
  DayScheduleEntry,
  SessionId,
  WeekdayRule,
  WeightLogEntry,
  WorkoutSessionId,
} from '../types/gym';

interface ScheduleViewProps {
  todayISO: string;
  selectedDay: DayScheduleEntry;
  tomorrowEntry: DayScheduleEntry;
  weeklyPattern: Record<number, WeekdayRule>;
  dayNotesByDate: Record<string, string>;
  nextRestDayForMakeup: DayScheduleEntry | null;
  dynamicWeek: {
    weekOffset: number;
    weekRangeLabel: string;
    programWeekNumber: number;
    isDeloadWeek: boolean;
    mesocycleTitle: string;
    days: DayScheduleEntry[];
  };
  dynamicMonth: {
    monthOffset: number;
    monthTitle: string;
    cells: Array<{ inCurrentMonth: boolean; entry: DayScheduleEntry }>;
  };
  metrics: CalculatedMetrics;
  weightTracker: {
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
  };
  weighInIntervalDays: 7 | 14;
  pushSubscribed: boolean;
  onSelectDate: (isoDate: string) => void;
  onChangeWeekOffset: (next: number) => void;
  onChangeMonthOffset: (next: number) => void;
  onOpenWorkoutForDate: (isoDate: string, sessionId?: WorkoutSessionId) => void;
  onSetDayStatus: (
    isoDate: string,
    status: 'done' | 'missed' | null,
    preferred?: WorkoutSessionId
  ) => void;
  onMarkDayOff: (isoDate: string) => void;
  onRestoreDayWorkout: (isoDate: string) => void;
  onSetDayNote: (isoDate: string, note: string) => void;
  onApplyWeeklySplitPreset: (mode: 'spaced' | 'consecutive' | 'toggle_sat') => void;
  onMakeupMissed: (missedDateISO: string, missedSessionId: SessionId) => void;
  onUpdateDaySchedule: (
    isoDate: string,
    dow: number,
    patch: Partial<WeekdayRule>,
    scope: 'recurring' | 'single'
  ) => void;
  onLogWeight: (kg: number) => void;
  onChangeWeighInterval: (days: 7 | 14) => void;
  onOpenPushSettings: () => void;
  onOpenCoach: (prefill?: string, returnLabel?: string) => void;
}

const WORKOUT_TIME_OPTIONS = ['05:30', '06:00', '06:30', '07:00', '17:00', '18:00', '19:00'];
const SESSION_CHOICES: Array<{ id: SessionId; label: string; sub: string }> = [
  { id: 'press_day', label: 'Buổi 1: Đẩy (Ngực · Vai · Tay sau)', sub: '55 phút · 6 bài' },
  { id: 'pull_day', label: 'Buổi 2: Kéo (Vai · Xô · Tay trước)', sub: '55 phút · 6 bài' },
  { id: 'legs_day', label: 'Buổi 3: Chân (Đùi · Mông · Bắp chân)', sub: '55 phút · 6 bài' },
  { id: 'upper_day', label: 'Buổi Thứ 7 tự chọn (Thân trên)', sub: '55 phút · Tự chọn' },
  { id: 'rest', label: 'Nghỉ hồi phục cơ / Cho Off', sub: 'Giãn cơ · Giữ nguyên chuỗi kỷ luật' },
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  todayISO,
  selectedDay,
  tomorrowEntry,
  weeklyPattern,
  dayNotesByDate,
  nextRestDayForMakeup,
  dynamicWeek,
  dynamicMonth,
  metrics,
  weightTracker,
  weighInIntervalDays,
  pushSubscribed,
  onSelectDate,
  onChangeWeekOffset,
  onChangeMonthOffset,
  onOpenWorkoutForDate,
  onSetDayStatus,
  onMarkDayOff,
  onRestoreDayWorkout,
  onSetDayNote,
  onApplyWeeklySplitPreset,
  onMakeupMissed,
  onUpdateDaySchedule,
  onLogWeight,
  onChangeWeighInterval,
  onOpenPushSettings,
  onOpenCoach,
}) => {
  const [subTab, setSubTab] = useState<'calendar' | 'weight' | 'sleep'>('calendar');
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');
  const [editingDay, setEditingDay] = useState<DayScheduleEntry | null>(null);
  const [editScope, setEditScope] = useState<'single' | 'recurring'>('single');
  const [draftSession, setDraftSession] = useState<SessionId>('press_day');
  const [draftTime, setDraftTime] = useState<string>('06:00');

  const openEditSheet = (day: DayScheduleEntry) => {
    setEditingDay(day);
    setDraftSession(day.sessionId);
    setDraftTime(day.workoutTime || '06:00');
    setEditScope('single');
  };

  const saveEditSheet = () => {
    if (!editingDay) return;
    onUpdateDaySchedule(
      editingDay.isoDate,
      editingDay.dayOfWeek,
      { sessionId: draftSession, workoutTime: draftTime },
      editScope
    );
    setEditingDay(null);
  };

  const isSpacedPPL =
    weeklyPattern?.[2]?.sessionId === 'press_day' &&
    weeklyPattern?.[3]?.sessionId === 'pull_day' &&
    weeklyPattern?.[5]?.sessionId === 'legs_day';
  const isConsecutivePPL =
    weeklyPattern?.[2]?.sessionId === 'press_day' &&
    weeklyPattern?.[3]?.sessionId === 'pull_day' &&
    weeklyPattern?.[4]?.sessionId === 'legs_day';
  const isSatEnabled = Boolean(
    weeklyPattern?.[6]?.sessionId && weeklyPattern[6].sessionId !== 'rest'
  );

  const selectedSess =
    selectedDay.sessionId !== 'rest'
      ? WORKOUT_SESSIONS[selectedDay.sessionId as WorkoutSessionId]
      : null;
  const selectedNote = dayNotesByDate[selectedDay.isoDate] || '';

  return (
    <div className="g8d-view-stack">
      <div className="g8d-subtabs">
        <button
          type="button"
          className={subTab === 'calendar' ? 'is-active' : ''}
          onClick={() => setSubTab('calendar')}
        >
          Lịch Tập
        </button>
        <button
          type="button"
          className={subTab === 'weight' ? 'is-active' : ''}
          onClick={() => setSubTab('weight')}
        >
          Cân Nặng ({weightTracker.latestWeightKg}kg)
        </button>
        <button
          type="button"
          className={subTab === 'sleep' ? 'is-active' : ''}
          onClick={() => setSubTab('sleep')}
        >
          Nhịp Ngủ
        </button>
      </div>

      {subTab === 'calendar' && (
        <>
          <div
            className={`g8d-card g8d-checkin-card ${
              selectedDay.isCompleted
                ? 'is-done'
                : selectedDay.isMissed
                ? 'is-missed'
                : selectedDay.sessionId === 'rest'
                ? 'is-off'
                : 'is-pending'
            }`}
          >
            <div className="g8d-row-between">
              <div className="g8d-row-gap" style={{ minWidth: 0 }}>
                <img
                  src={resolveMascotAsset(selectedSess ? selectedSess.mascot : 'restHydration')}
                  alt=""
                  width={48}
                  height={48}
                  className="g8d-ex-avatar"
                />
                <div style={{ minWidth: 0 }}>
                  <div className="g8d-kicker">
                    {selectedDay.isToday ? 'HÔM NAY · ' : ''}
                    {selectedDay.dayShort.toUpperCase()} ({selectedDay.shortDate})
                  </div>
                  <div className="g8d-card-title" style={{ fontSize: 15 }}>
                    {selectedDay.isCompleted
                      ? 'Đã hoàn thành buổi tập · +1 chuỗi'
                      : selectedDay.isMissed
                      ? 'Đã báo bận / Chưa tập'
                      : selectedSess
                      ? `${selectedSess.shortName} (${selectedDay.workoutTime})`
                      : 'Ngày nghỉ hồi phục cơ'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="g8d-pill-btn g8d-pill-btn-touch"
                onClick={() => openEditSheet(selectedDay)}
              >
                Đổi lịch
              </button>
            </div>

            {!selectedDay.isFutureDay ? (
              <div className="g8d-checkin-btn-grid">
                {!selectedDay.isCompleted ? (
                  <button
                    type="button"
                    className="g8d-btn-green"
                    onClick={() =>
                      onSetDayStatus(
                        selectedDay.isoDate,
                        'done',
                        selectedSess ? (selectedDay.sessionId as WorkoutSessionId) : undefined
                      )
                    }
                  >
                    Đã tập xong
                  </button>
                ) : (
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={() => onSetDayStatus(selectedDay.isoDate, null)}
                  >
                    Bỏ chốt xong
                  </button>
                )}

                {selectedDay.sessionId !== 'rest' ? (
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={() => onMarkDayOff(selectedDay.isoDate)}
                  >
                    Cho nghỉ cơ
                  </button>
                ) : (
                  <button
                    type="button"
                    className="g8d-btn-primary"
                    onClick={() => onRestoreDayWorkout(selectedDay.isoDate)}
                  >
                    Mở buổi tập
                  </button>
                )}

                {selectedDay.isMissed && nextRestDayForMakeup ? (
                  <button
                    type="button"
                    className="g8d-btn-primary"
                    onClick={() => onMakeupMissed(selectedDay.isoDate, selectedDay.sessionId)}
                  >
                    Dời bù {nextRestDayForMakeup.dayShort}
                  </button>
                ) : selectedDay.sessionId !== 'rest' && !selectedDay.isCompleted ? (
                  <button
                    type="button"
                    className="g8d-btn-danger-outline"
                    onClick={() => onSetDayStatus(selectedDay.isoDate, 'missed')}
                  >
                    Báo bận
                  </button>
                ) : (
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={() =>
                      onOpenWorkoutForDate(
                        selectedDay.isoDate,
                        selectedSess ? (selectedDay.sessionId as WorkoutSessionId) : undefined
                      )
                    }
                  >
                    Xem bài tập
                  </button>
                )}
              </div>
            ) : (
              <div className="g8d-tiny-meta" style={{ marginTop: 8 }}>
                Ngày tương lai ({selectedDay.dateLabel}) — Có thể xem trước giáo án hoặc đổi buổi tập.
              </div>
            )}

            <div className="g8d-note-row">
              <span className="g8d-note-tag">Ghi chú</span>
              <input
                type="text"
                enterKeyHint="done"
                value={selectedNote}
                onChange={(e) => onSetDayNote(selectedDay.isoDate, e.target.value)}
                placeholder={`Ghi chú ngày ${selectedDay.shortDate} (cảm giác cơ, mức tạ...)`}
                className="g8d-note-input"
              />
            </div>
          </div>

          <div className="g8d-card g8d-calendar-card">
            <div className="g8d-row-between" style={{ marginBottom: 10 }}>
              <div className="g8d-cal-nav">
                <button
                  type="button"
                  className="g8d-nav-arrow"
                  onClick={() =>
                    calendarMode === 'week'
                      ? onChangeWeekOffset(dynamicWeek.weekOffset - 1)
                      : onChangeMonthOffset(dynamicMonth.monthOffset - 1)
                  }
                  aria-label="Lùi"
                >
                  <SvgIcon name="chevronLeft" size={18} />
                </button>
                <div>
                  <div className="g8d-cal-range">
                    {calendarMode === 'week' ? dynamicWeek.weekRangeLabel : dynamicMonth.monthTitle}
                  </div>
                  <div className="g8d-tiny-meta">{dynamicWeek.mesocycleTitle}</div>
                </div>
                <button
                  type="button"
                  className="g8d-nav-arrow"
                  onClick={() =>
                    calendarMode === 'week'
                      ? onChangeWeekOffset(dynamicWeek.weekOffset + 1)
                      : onChangeMonthOffset(dynamicMonth.monthOffset + 1)
                  }
                  aria-label="Tiến"
                >
                  <SvgIcon name="chevronRight" size={18} />
                </button>
              </div>

              <div className="g8d-seg-mini">
                {(dynamicWeek.weekOffset !== 0 || dynamicMonth.monthOffset !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      onChangeWeekOffset(0);
                      onChangeMonthOffset(0);
                      onSelectDate(todayISO);
                    }}
                  >
                    Hôm nay
                  </button>
                )}
                <button
                  type="button"
                  className={calendarMode === 'week' ? 'is-active' : ''}
                  onClick={() => setCalendarMode('week')}
                >
                  Tuần
                </button>
                <button
                  type="button"
                  className={calendarMode === 'month' ? 'is-active' : ''}
                  onClick={() => setCalendarMode('month')}
                >
                  Tháng
                </button>
              </div>
            </div>

            {calendarMode === 'week' && (
              <>
                <div className="g8d-split-bar">
                  <button
                    type="button"
                    className={isSpacedPPL ? 'is-active' : ''}
                    onClick={() => onApplyWeeklySplitPreset('spaced')}
                  >
                    T3 · T4 · T6 Giãn
                  </button>
                  <button
                    type="button"
                    className={isConsecutivePPL ? 'is-active' : ''}
                    onClick={() => onApplyWeeklySplitPreset('consecutive')}
                  >
                    T3 · T4 · T5 Liền
                  </button>
                  <button
                    type="button"
                    className={isSatEnabled ? 'is-sat-on' : 'is-sat-off'}
                    onClick={() => onApplyWeeklySplitPreset('toggle_sat')}
                  >
                    {isSatEnabled ? 'T7: Bật' : 'T7: Nghỉ'}
                  </button>
                </div>

                <div className="g8d-legend-strip">
                  <span>
                    <i className="is-done" /> Đã tập xong
                  </span>
                  <span>
                    <i className="is-missed" /> Báo bận
                  </span>
                  <span>
                    <i className="is-tmr" /> Mai tập
                  </span>
                  <span>
                    <i className="is-off" /> Ngày nghỉ
                  </span>
                </div>

                {[dynamicWeek.days.slice(0, 4), dynamicWeek.days.slice(4, 7)].map(
                  (rowDays, rIdx) => (
                    <div
                      key={rIdx}
                      className={`g8d-bento-row ${rIdx === 0 ? 'cols-4' : 'cols-3'}`}
                    >
                      {rowDays.map((d) => {
                        const isSel = d.isoDate === selectedDay.isoDate;
                        const isTmr = d.isoDate === tomorrowEntry.isoDate;
                        const sess =
                          d.sessionId !== 'rest'
                            ? WORKOUT_SESSIONS[d.sessionId as WorkoutSessionId]
                            : null;
                        const hasNote = Boolean(dayNotesByDate[d.isoDate]);
                        const stateCls = d.isCompleted
                          ? 'is-done'
                          : d.isMissed
                          ? 'is-missed'
                          : !sess
                          ? 'is-off'
                          : isTmr
                          ? 'is-tomorrow'
                          : 'is-workout';

                        return (
                          <button
                            key={d.isoDate}
                            type="button"
                            onClick={() => onSelectDate(d.isoDate)}
                            className={`g8d-bento-day ${stateCls} ${
                              isSel ? 'is-selected' : ''
                            } ${d.isToday ? 'is-today' : ''}`}
                          >
                            <div className="g8d-bento-top">
                              <span>{DAY_TINY_NAMES[d.dayOfWeek]}</span>
                              <strong>{d.dayNumber}</strong>
                            </div>

                            <img
                              src={resolveMascotAsset(sess ? sess.mascot : 'restHydration')}
                              alt=""
                              width={36}
                              height={36}
                              className="g8d-bento-mascot"
                              loading="lazy"
                            />

                            <div className="g8d-bento-label">
                              {d.isCompleted
                                ? 'ĐÃ XONG'
                                : d.isMissed
                                ? 'BÁO BẬN'
                                : sess
                                ? sess.calendarLabel
                                : 'NGHỈ CƠ'}
                            </div>

                            <div className="g8d-bento-sub">
                              {hasNote
                                ? 'Có ghi chú'
                                : sess
                                ? d.workoutTime
                                : `Ngủ ${d.sleepTargetTime}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                )}
              </>
            )}

            {calendarMode === 'month' && (
              <div>
                <div className="g8d-month-head">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((lbl) => (
                    <span key={lbl}>{lbl}</span>
                  ))}
                </div>
                <div className="g8d-month-grid">
                  {dynamicMonth.cells.map(({ inCurrentMonth, entry }) => {
                    const isSel = entry.isoDate === selectedDay.isoDate;
                    return (
                      <button
                        key={entry.isoDate}
                        type="button"
                        onClick={() => onSelectDate(entry.isoDate)}
                        className={`g8d-month-cell ${!inCurrentMonth ? 'is-dim' : ''} ${
                          entry.isCompleted
                            ? 'is-done-cell'
                            : entry.isMissed
                            ? 'is-missed-cell'
                            : ''
                        } ${isSel ? 'is-selected' : ''} ${entry.isToday ? 'is-today' : ''}`}
                      >
                        <span className="g8d-month-num">{entry.dayNumber}</span>
                        <span
                          className={`g8d-month-dot ${
                            entry.isCompleted
                              ? 'is-done'
                              : entry.isMissed
                              ? 'is-missed'
                              : entry.isWorkoutDay
                              ? 'is-workout'
                              : ''
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="g8d-smart-strip">
            <div className="g8d-smart-strip-text">
              <strong>Ngủ trước {selectedDay.sleepTargetTime}</strong> · Mai ({tomorrowEntry.dayShort}):{' '}
              {tomorrowEntry.sessionId !== 'rest'
                ? WORKOUT_SESSIONS[tomorrowEntry.sessionId as WorkoutSessionId]?.shortName
                : 'Nghỉ hồi phục cơ'}
            </div>
            <button
              type="button"
              className="g8d-smart-strip-btn"
              onClick={() =>
                onOpenCoach(
                  'Review lịch tập tuần này giúp tao và sắp xếp lại sao cho hợp lý nhất:',
                  'Lịch Tập'
                )
              }
            >
              Nhờ ChatDVT xếp
            </button>
          </div>
        </>
      )}

      {subTab === 'weight' && (
        <WeightChartCard
          summary={weightTracker}
          weighInIntervalDays={weighInIntervalDays}
          onLogWeight={onLogWeight}
          onChangeInterval={onChangeWeighInterval}
        />
      )}

      {subTab === 'sleep' && (
        <div className="g8d-card">
          <div className="g8d-row-between">
            <div>
              <div className="g8d-kicker">ĐỒNG HỒ SINH HỌC CA TẬP {metrics.profile.workoutTime}</div>
              <div className="g8d-card-title">Lịch Ngủ & Phục Hồi 24 Giờ</div>
            </div>
            <button
              type="button"
              className="g8d-pill-btn g8d-pill-btn-touch"
              onClick={onOpenPushSettings}
            >
              {pushSubscribed ? 'Thông báo: Bật' : 'Bật thông báo'}
            </button>
          </div>

          <div className="g8d-timeline-list" style={{ marginTop: 12 }}>
            {metrics.circadianSchedule.timelineItems.map((item) => (
              <div
                key={`${item.time}-${item.title}`}
                className={`g8d-timeline-row ${item.highlight ? 'is-highlight' : ''}`}
              >
                <img
                  src={resolveMascotAsset(item.mascot)}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="g8d-timeline-mascot"
                />
                <div className="g8d-timeline-body">
                  <div className="g8d-timeline-head">
                    <span className="g8d-time-chip">{item.time}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <div className="g8d-tiny-meta">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomSheet
        open={Boolean(editingDay)}
        title={editingDay ? `Chỉnh lịch ${editingDay.dayShort} (${editingDay.shortDate})` : ''}
        subtitle="Đổi buổi tập, cho nghỉ cơ hoặc chỉnh giờ vào ca"
        onClose={() => setEditingDay(null)}
      >
        <div className="g8d-stack-sm">
          <div className="g8d-seg-mini g8d-w-full">
            <button
              type="button"
              className={editScope === 'single' ? 'is-active' : ''}
              onClick={() => setEditScope('single')}
            >
              Chỉ ngày {editingDay?.shortDate}
            </button>
            <button
              type="button"
              className={editScope === 'recurring' ? 'is-active' : ''}
              onClick={() => setEditScope('recurring')}
            >
              Mọi {editingDay?.dayShort} hàng tuần
            </button>
          </div>

          <div className="g8d-kicker">CHỌN GIÁO ÁN HOẶC CHO NGHỈ</div>
          <div className="g8d-stack-xs">
            {SESSION_CHOICES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`g8d-choice-row ${draftSession === opt.id ? 'is-selected' : ''}`}
                onClick={() => setDraftSession(opt.id)}
              >
                <div>
                  <div className="g8d-choice-title">{opt.label}</div>
                  <div className="g8d-tiny-meta">{opt.sub}</div>
                </div>
                {draftSession === opt.id && <SvgIcon name="check" size={16} color="#E85D1A" />}
              </button>
            ))}
          </div>

          {draftSession !== 'rest' && (
            <>
              <div className="g8d-kicker">GIỜ VÀO CA TẬP</div>
              <div className="g8d-chip-wrap">
                {WORKOUT_TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`g8d-time-opt ${draftTime === t ? 'is-active' : ''}`}
                    onClick={() => setDraftTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}

          <button type="button" className="g8d-btn-primary g8d-w-full" onClick={saveEditSheet}>
            Lưu thay đổi lịch
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
