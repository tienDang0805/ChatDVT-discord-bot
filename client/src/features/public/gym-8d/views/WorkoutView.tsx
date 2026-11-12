import React, { useMemo, useRef, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { SvgIcon } from '../components/Icons';
import { resolveMascotAsset } from '../data/assets';
import { EXERCISES } from '../data/exercises';
import { GYM_BRANCHES, GYM_SESSION_PRESETS } from '../data/gyms';
import { WORKOUT_SESSIONS } from '../data/workouts';
import { DAY_TINY_NAMES, addDaysISO, normalizeVNSearch } from '../domain/dateUtils';
import { calculatePlates } from '../domain/metrics';
import {
  estimateEpley1RM,
  getEffectiveSessionExerciseIds,
  getEffectiveSetsForDay,
  getPreviousExercisePerf,
  getSessionAddableExercises,
  getSwapCandidatesForSlot,
} from '../domain/overload';
import { calculateSessionCompletion } from '../domain/schedule';
import type {
  DayScheduleEntry,
  ExerciseDef,
  GymBranchId,
  PersonalRecordEntry,
  SetEntry,
  WorkoutSessionId,
} from '../types/gym';

interface WorkoutViewProps {
  todayISO: string;
  selectedDay: DayScheduleEntry;
  weekDays: DayScheduleEntry[];
  effectiveSessionId: WorkoutSessionId;
  selectedGymId: GymBranchId;
  barbellWeightKg: number;
  logsByDate: Record<string, Record<string, SetEntry[]>>;
  sessionSwaps: Record<string, string>;
  customSessionLists: Record<string, string[]>;
  activePresetBySession: Record<string, string>;
  personalRecords: Record<string, PersonalRecordEntry>;
  onSelectDate: (isoDate: string) => void;
  onSelectSession: (sessionId: WorkoutSessionId) => void;
  onSelectGymBranch: (gymId: GymBranchId) => void;
  onApplyGymPreset: (sessionId: WorkoutSessionId, presetId: string, gymId?: GymBranchId) => void;
  onMutateSets: (
    isoDate: string,
    sessionId: WorkoutSessionId,
    exId: string,
    transform: (sets: SetEntry[]) => SetEntry[]
  ) => { updatedSets: SetEntry[]; newlyHitPR: boolean };
  onSwapExercise: (sessionId: WorkoutSessionId, originalSlotId: string, targetExId: string) => void;
  onAddExercise: (sessionId: WorkoutSessionId, newExId: string) => void;
  onRemoveExercise: (sessionId: WorkoutSessionId, slotIdx: number) => void;
  onFinishDayDone: (isoDate: string, sessionId: WorkoutSessionId) => void;
  onUndoDayDone: (isoDate: string) => void;
  onMarkDayOff: (isoDate: string) => void;
  onRestoreDayWorkout: (isoDate: string, fallbackSession?: WorkoutSessionId) => void;
  onOpenCoach: (prefill?: string, returnLabel?: string) => void;
  onStartRestTimer: (sec: number, exName: string, nextLabel: string) => void;
}

const SESSION_TABS: Array<{ id: WorkoutSessionId; short: string }> = [
  { id: 'press_day', short: 'Đẩy' },
  { id: 'pull_day', short: 'Kéo' },
  { id: 'legs_day', short: 'Chân' },
  { id: 'upper_day', short: 'T7' },
];

const EFFORT_OPTIONS = [
  { id: 'warmup', label: 'Khởi động' },
  { id: 'easy', label: 'Nhẹ · RPE 6' },
  { id: 'good', label: 'Chuẩn · RPE 8' },
  { id: 'hard', label: 'Nặng · RPE 9' },
  { id: 'max', label: 'Quá sức' },
];

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  selectedDay,
  weekDays,
  effectiveSessionId,
  selectedGymId,
  barbellWeightKg,
  logsByDate,
  sessionSwaps,
  customSessionLists,
  activePresetBySession,
  personalRecords,
  onSelectDate,
  onSelectSession,
  onSelectGymBranch,
  onApplyGymPreset,
  onMutateSets,
  onSwapExercise,
  onAddExercise,
  onRemoveExercise,
  onFinishDayDone,
  onUndoDayDone,
  onMarkDayOff,
  onRestoreDayWorkout,
  onOpenCoach,
  onStartRestTimer,
}) => {
  const [focusedExSlot, setFocusedExSlot] = useState<{
    origId: string;
    exId: string;
    index: number;
  } | null>(null);
  const [swapTarget, setSwapTarget] = useState<{ origId: string; exId: string } | null>(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [gymSheetOpen, setGymSheetOpen] = useState(false);
  const [openSetupAcc, setOpenSetupAcc] = useState(false);
  const [openFormAcc, setOpenFormAcc] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const sessionDef = WORKOUT_SESSIONS[effectiveSessionId] || WORKOUT_SESSIONS.press_day;
  const baseIds =
    customSessionLists[effectiveSessionId]?.length > 0
      ? customSessionLists[effectiveSessionId]
      : sessionDef.exerciseIds;

  const effectiveIds = useMemo(
    () => getEffectiveSessionExerciseIds(effectiveSessionId, sessionSwaps, customSessionLists),
    [customSessionLists, effectiveSessionId, sessionSwaps]
  );

  const progress = useMemo(
    () =>
      calculateSessionCompletion(
        effectiveSessionId,
        logsByDate[selectedDay.isoDate],
        sessionSwaps,
        customSessionLists
      ),
    [customSessionLists, effectiveSessionId, logsByDate, selectedDay.isoDate, sessionSwaps]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = t ? { x: t.clientX, y: t.clientY } : null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || focusedExSlot) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    const nextDate = addDaysISO(selectedDay.isoDate, dx < 0 ? 1 : -1);
    onSelectDate(nextDate);
  };

  if (focusedExSlot) {
    const ex: ExerciseDef | undefined = EXERCISES[focusedExSlot.exId];
    if (!ex) {
      setFocusedExSlot(null);
      return null;
    }

    const sets = getEffectiveSetsForDay(ex.id, selectedDay.isoDate, logsByDate);
    const prevPerf = getPreviousExercisePerf(ex.id, selectedDay.isoDate, logsByDate);
    const prRecord = personalRecords[ex.id];
    const weightStep = ex.usesBarbell || sets.some((s) => s.weight >= 30) ? 2.5 : 1;
    const heaviestWorkWeight = Math.max(
      barbellWeightKg,
      ...sets.filter((s) => s.type !== 'W').map((s) => Number(s.weight) || 0)
    );
    const currentWorkWeight =
      sets.find((s) => s.type !== 'W')?.weight || sets[0]?.weight || 20;
    const plateBreakdown = ex.usesBarbell
      ? calculatePlates(heaviestWorkWeight, barbellWeightKg)
      : null;

    const applyOverloadBump = (bumpKg: number) => {
      onMutateSets(selectedDay.isoDate, effectiveSessionId, ex.id, (cur) =>
        cur.map((s) =>
          s.type === 'W'
            ? s
            : { ...s, weight: Math.max(0, Math.round((Number(s.weight) + bumpKg) * 10) / 10) }
        )
      );
    };

    const updateSingleSet = (idx: number, patch: Partial<SetEntry>) => {
      const { updatedSets } = onMutateSets(
        selectedDay.isoDate,
        effectiveSessionId,
        ex.id,
        (cur) => cur.map((s, i) => (i === idx ? { ...s, ...patch } : s))
      );
      if (patch.done === true) {
        const nextUndoneIdx = updatedSets.findIndex((s, i) => i > idx && !s.done);
        const nextLabel =
          nextUndoneIdx >= 0
            ? `Chuẩn bị Hiệp ${updatedSets[nextUndoneIdx].type}: ${updatedSets[nextUndoneIdx].weight}kg × ${updatedSets[nextUndoneIdx].reps}`
            : 'Đã hoàn thành bài này — Chuyển sang bài kế tiếp.';
        onStartRestTimer(ex.defaultRestSec || 90, ex.shortName, nextLabel);
      }
    };

    const addSetRow = () => {
      onMutateSets(selectedDay.isoDate, effectiveSessionId, ex.id, (cur) => {
        const last = cur[cur.length - 1] || { weight: 20, reps: 10, prev: '' };
        const workCount = cur.filter((s) => s.type !== 'W').length;
        return [
          ...cur,
          {
            type: String(workCount + 1),
            prev: last.prev || '',
            weight: last.weight,
            reps: last.reps,
            effort: 'good',
            done: false,
          },
        ];
      });
    };

    const removeLastSetRow = () => {
      onMutateSets(selectedDay.isoDate, effectiveSessionId, ex.id, (cur) =>
        cur.length <= 1 ? cur : cur.slice(0, -1)
      );
    };

    return (
      <div className="g8d-view-stack">
        <div className="g8d-detail-topbar">
          <button
            type="button"
            className="g8d-back-btn"
            onClick={() => {
              setFocusedExSlot(null);
              setOpenSetupAcc(false);
              setOpenFormAcc(false);
            }}
          >
            <SvgIcon name="chevronLeft" size={17} />
            <span>Danh sách bài ({progress.completionPct}%)</span>
          </button>

          <button
            type="button"
            className="g8d-pill-btn g8d-pill-btn-touch"
            onClick={() =>
              setSwapTarget({ origId: focusedExSlot.origId, exId: focusedExSlot.exId })
            }
          >
            <SvgIcon name="swap" size={15} />
            <span>Đổi máy khác</span>
          </button>
        </div>

        <div className="g8d-card g8d-ex-detail-head">
          <div className="g8d-ex-head-row">
            <img
              src={resolveMascotAsset(ex.mascot)}
              alt={ex.shortName}
              width={56}
              height={56}
              className="g8d-ex-mascot-lg"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="g8d-ex-badges-line">
                <span className="g8d-mini-tag is-orange">
                  Bài #{focusedExSlot.index + 1} · {ex.tier}
                </span>
                <span className="g8d-mini-tag">
                  {ex.repRange[0]}–{ex.repRange[1]} reps
                </span>
                <span className="g8d-mini-tag">Nghỉ {ex.defaultRestSec}s</span>
              </div>
              <h2 className="g8d-ex-detail-title">{ex.name}</h2>
              <div className="g8d-tiny-meta">
                {ex.muscle} · {ex.equipment}
              </div>
            </div>
          </div>

          <div className="g8d-overload-banner">
            <div style={{ minWidth: 0 }}>
              {prevPerf ? (
                <div className="g8d-overload-line">
                  <strong>Kỳ trước ({prevPerf.lastDateShort}):</strong> Đỉnh{' '}
                  <strong>
                    {prevPerf.bestWeight}kg × {prevPerf.bestReps}
                  </strong>{' '}
                  <span className="g8d-tiny-meta">(1RM ~{prevPerf.bestE1RM}kg)</span>
                </div>
              ) : (
                <div className="g8d-overload-line">
                  <strong>Lần đầu tập bài này:</strong> Chọn mức tạ vừa sức làm mốc chuẩn tuần sau
                </div>
              )}
              {prRecord && (
                <div className="g8d-tiny-meta" style={{ color: '#9A6700', fontWeight: 700 }}>
                  Kỷ lục cá nhân: {prRecord.maxWeight}kg × {prRecord.repsAtMaxWeight} ({prRecord.maxWeightDateShort})
                </div>
              )}
            </div>

            <button
              type="button"
              className={`g8d-overload-btn ${prevPerf?.suggestBumpKg ? 'is-ready' : ''}`}
              onClick={() => applyOverloadBump(prevPerf?.suggestBumpKg || weightStep)}
            >
              +{prevPerf?.suggestBumpKg || weightStep}kg
            </button>
          </div>
          {prevPerf?.suggestReason && (
            <div className="g8d-overload-reason">{prevPerf.suggestReason}</div>
          )}
        </div>

        <div className="g8d-card">
          <div className="g8d-row-between" style={{ marginBottom: 10 }}>
            <div className="g8d-kicker">GHI NHẬN HIỆP TẬP ({selectedDay.shortDate})</div>
            <span className="g8d-tiny-meta">Chốt hiệp tự đếm nghỉ {ex.defaultRestSec}s</span>
          </div>

          <div className="g8d-set-list">
            {sets.map((s, idx) => {
              const isWarmup = s.type === 'W';
              const isSetPR =
                !isWarmup &&
                s.done &&
                prRecord &&
                (s.weight > prRecord.maxWeight ||
                  estimateEpley1RM(s.weight, s.reps) >= prRecord.bestE1RM);

              return (
                <div
                  key={`${ex.id}-set-${idx}`}
                  className={`g8d-set-row ${s.done ? 'is-done' : ''} ${isWarmup ? 'is-warmup' : ''}`}
                >
                  <div className="g8d-set-top">
                    <div className="g8d-set-meta-left">
                      <span className={`g8d-set-badge ${isWarmup ? 'is-w' : ''}`}>
                        {isWarmup ? 'Khởi động' : `Hiệp ${s.type}`}
                      </span>
                      <span className="g8d-tiny-meta">{s.prev}</span>
                      {isSetPR && <span className="g8d-pr-chip">PR mới</span>}
                    </div>

                    <button
                      type="button"
                      className={`g8d-check-btn ${s.done ? 'is-done' : ''}`}
                      onClick={() => updateSingleSet(idx, { done: !s.done })}
                    >
                      <SvgIcon name="check" size={14} strokeWidth={2.7} />
                      <span>{s.done ? 'Đã chốt' : 'Chốt hiệp'}</span>
                    </button>
                  </div>

                  <div className="g8d-set-controls">
                    <div className="g8d-stepper">
                      <button
                        type="button"
                        aria-label="Giảm mức tạ"
                        onClick={() =>
                          updateSingleSet(idx, {
                            weight: Math.max(0, Math.round((s.weight - weightStep) * 10) / 10),
                          })
                        }
                      >
                        −
                      </button>
                      <div className="g8d-stepper-val">
                        <input
                          type="number"
                          inputMode="decimal"
                          enterKeyHint="done"
                          step="0.5"
                          value={s.weight}
                          onChange={(e) =>
                            updateSingleSet(idx, {
                              weight: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          aria-label="Mức tạ kg"
                        />
                        <span>kg</span>
                      </div>
                      <button
                        type="button"
                        aria-label="Tăng mức tạ"
                        onClick={() =>
                          updateSingleSet(idx, {
                            weight: Math.round((s.weight + weightStep) * 10) / 10,
                          })
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className="g8d-stepper">
                      <button
                        type="button"
                        aria-label="Giảm số lần lặp"
                        onClick={() =>
                          updateSingleSet(idx, { reps: Math.max(1, (Number(s.reps) || 1) - 1) })
                        }
                      >
                        −
                      </button>
                      <div className="g8d-stepper-val">
                        <input
                          type="number"
                          inputMode="numeric"
                          enterKeyHint="done"
                          value={s.reps}
                          onChange={(e) =>
                            updateSingleSet(idx, {
                              reps: Math.max(1, Math.round(Number(e.target.value) || 1)),
                            })
                          }
                          aria-label="Số lần lặp"
                        />
                        <span>reps</span>
                      </div>
                      <button
                        type="button"
                        aria-label="Tăng số lần lặp"
                        onClick={() =>
                          updateSingleSet(idx, { reps: (Number(s.reps) || 0) + 1 })
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {!isWarmup && (
                    <div className="g8d-effort-row">
                      {EFFORT_OPTIONS.slice(1).map((ef) => (
                        <button
                          key={ef.id}
                          type="button"
                          className={`g8d-effort-chip ${s.effort === ef.id ? 'is-active' : ''}`}
                          onClick={() => updateSingleSet(idx, { effort: ef.id })}
                        >
                          {ef.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="g8d-set-footer">
            <button type="button" className="g8d-pill-btn g8d-pill-btn-touch" onClick={addSetRow}>
              + Thêm hiệp
            </button>
            {sets.length > 1 && (
              <button
                type="button"
                className="g8d-pill-btn g8d-pill-btn-touch"
                onClick={removeLastSetRow}
              >
                − Bớt hiệp cuối
              </button>
            )}
          </div>

          {plateBreakdown && (
            <div className="g8d-plate-box">
              <strong>Tính bánh tạ ({heaviestWorkWeight}kg):</strong> Đòn {plateBreakdown.barKg}kg + mỗi bên{' '}
              {plateBreakdown.platesPerSide.length > 0
                ? plateBreakdown.platesPerSide.map((p) => `${p.count}×${p.weight}kg`).join(' + ')
                : 'Không lắp thêm bánh'}
            </div>
          )}

          <div className="g8d-workout-ai-strip" style={{ marginTop: 12 }}>
            <span className="g8d-tiny-meta">
              Mức tạ {currentWorkWeight}kg thấy quá nặng, hụt rep hay mỏi khớp?
            </span>
            <button
              type="button"
              className="g8d-ai-inline-btn"
              onClick={() =>
                onOpenCoach(
                  `Bài ${ex.shortName} hôm nay mức ${currentWorkWeight}kg (mục tiêu ${ex.repRange[0]}–${ex.repRange[1]} reps) tao nâng thấy nặng quá không đủ rep/set, tư vấn hướng xử lý và chỉnh lại mức tạ hợp lý giúp tao`,
                  ex.shortName
                )
              }
            >
              Hỏi ChatDVT
            </button>
          </div>
        </div>

        <div className="g8d-card g8d-accordion-card">
          <button
            type="button"
            className="g8d-accordion-trigger"
            onClick={() => setOpenSetupAcc((v) => !v)}
          >
            <span>Vị trí & Setup máy tại Phòng Tập</span>
            <SvgIcon name="chevronDown" size={17} />
          </button>
          {openSetupAcc && (
            <div className="g8d-accordion-body">
              {ex.gymSetup?.tng_uvk && (
                <div className="g8d-setup-item">
                  <strong>The New Gym 58D UVK:</strong> {ex.gymSetup.tng_uvk}
                </div>
              )}
              {ex.gymSetup?.ways_ql13 && (
                <div className="g8d-setup-item">
                  <strong>Ways Station 361 QL13:</strong> {ex.gymSetup.ways_ql13}
                </div>
              )}
              <div className="g8d-setup-item">
                <strong>Góc & Nhịp chuẩn:</strong> {ex.angleCue} · {ex.tempoCue}
              </div>
            </div>
          )}
        </div>

        <div className="g8d-card g8d-accordion-card">
          <button
            type="button"
            className="g8d-accordion-trigger"
            onClick={() => setOpenFormAcc((v) => !v)}
          >
            <span>Tư thế chuẩn, lỗi cần tránh & video mẫu</span>
            <SvgIcon name="chevronDown" size={17} />
          </button>
          {openFormAcc && (
            <div className="g8d-accordion-body">
              <ol className="g8d-form-steps">
                {ex.formSteps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
              <div className="g8d-setup-item">
                <strong>Tránh lỗi:</strong> {ex.mistake}
              </div>
              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="g8d-btn-outline g8d-w-full"
                  style={{ marginTop: 10, textAlign: 'center', textDecoration: 'none', display: 'block' }}
                >
                  Xem video kỹ thuật ({ex.videoAuthor})
                </a>
              )}
            </div>
          )}
        </div>

        {renderSwapSheet()}
      </div>
    );
  }

  function renderSwapSheet() {
    const candidates = swapTarget
      ? getSwapCandidatesForSlot(
          effectiveSessionId,
          swapTarget.origId,
          swapTarget.exId,
          selectedGymId
        )
      : { sameGroup: [], otherInSession: [] };
    const q = normalizeVNSearch(swapSearch);
    const filterFn = (item: ExerciseDef) =>
      !q ||
      normalizeVNSearch(item.name).includes(q) ||
      normalizeVNSearch(item.muscle).includes(q) ||
      normalizeVNSearch(item.equipment).includes(q);

    return (
      <BottomSheet
        open={Boolean(swapTarget)}
        title="Đổi Máy / Bài Tập Tương Đương"
        subtitle="Khi máy đang đông người tập — tự động lọc theo cơ sở của bạn"
        onClose={() => {
          setSwapTarget(null);
          setSwapSearch('');
        }}
      >
        <div className="g8d-stack-sm">
          <input
            type="search"
            enterKeyHint="search"
            placeholder="Tìm tên máy hoặc nhóm cơ..."
            value={swapSearch}
            onChange={(e) => setSwapSearch(e.target.value)}
            className="g8d-search-input"
          />

          <div className="g8d-kicker">CÙNG NHÓM CƠ THAY THẾ TRỰC TIẾP</div>
          <div className="g8d-stack-xs">
            {candidates.sameGroup.filter(filterFn).map((cand) => (
              <button
                key={cand.id}
                type="button"
                className={`g8d-choice-row ${cand.id === swapTarget?.exId ? 'is-selected' : ''}`}
                onClick={() => {
                  if (!swapTarget) return;
                  onSwapExercise(effectiveSessionId, swapTarget.origId, cand.id);
                  if (focusedExSlot && focusedExSlot.origId === swapTarget.origId) {
                    setFocusedExSlot({ ...focusedExSlot, exId: cand.id });
                  }
                  setSwapTarget(null);
                  setSwapSearch('');
                }}
              >
                <div className="g8d-row-gap">
                  <img
                    src={resolveMascotAsset(cand.mascot)}
                    alt=""
                    width={38}
                    height={38}
                    className="g8d-mini-avatar"
                    loading="lazy"
                  />
                  <div>
                    <div className="g8d-choice-title">{cand.shortName}</div>
                    <div className="g8d-tiny-meta">
                      {cand.equipment} · {cand.tier}
                    </div>
                  </div>
                </div>
                {cand.id === swapTarget?.exId && <span className="g8d-mini-tag is-orange">Đang chọn</span>}
              </button>
            ))}
          </div>

          {candidates.otherInSession.filter(filterFn).length > 0 && (
            <>
              <div className="g8d-kicker">CÁC BÀI PHỤ HỢP KHÁC TRONG BUỔI</div>
              <div className="g8d-stack-xs">
                {candidates.otherInSession.filter(filterFn).map((cand) => (
                  <button
                    key={cand.id}
                    type="button"
                    className="g8d-choice-row"
                    onClick={() => {
                      if (!swapTarget) return;
                      onSwapExercise(effectiveSessionId, swapTarget.origId, cand.id);
                      if (focusedExSlot && focusedExSlot.origId === swapTarget.origId) {
                        setFocusedExSlot({ ...focusedExSlot, exId: cand.id });
                      }
                      setSwapTarget(null);
                      setSwapSearch('');
                    }}
                  >
                    <div className="g8d-row-gap">
                      <img
                        src={resolveMascotAsset(cand.mascot)}
                        alt=""
                        width={38}
                        height={38}
                        className="g8d-mini-avatar"
                        loading="lazy"
                      />
                      <div>
                        <div className="g8d-choice-title">{cand.shortName}</div>
                        <div className="g8d-tiny-meta">{cand.muscle}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    );
  }

  const addableExercises = getSessionAddableExercises(
    effectiveSessionId,
    effectiveIds,
    selectedGymId
  );

  return (
    <div
      className="g8d-view-stack"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="g8d-day-strip">
        {weekDays.map((d) => {
          const isSel = d.isoDate === selectedDay.isoDate;
          return (
            <button
              key={d.isoDate}
              type="button"
              onClick={() => onSelectDate(d.isoDate)}
              className={`g8d-day-pill ${
                d.isCompleted ? 'is-done-pill' : d.isMissed ? 'is-missed-pill' : ''
              } ${isSel ? 'is-selected' : ''} ${d.isToday ? 'is-today' : ''}`}
            >
              <span className="g8d-day-pill-dow">{DAY_TINY_NAMES[d.dayOfWeek]}</span>
              <strong className="g8d-day-pill-num">{d.dayNumber}</strong>
              <span className="g8d-day-pill-status">
                {d.isCompleted ? 'Xong' : d.isMissed ? 'Bận' : d.isWorkoutDay ? 'Tập' : 'Nghỉ'}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDay.sessionId === 'rest' && !selectedDay.isCompleted && (
        <div className="g8d-card g8d-off-banner">
          <div className="g8d-row-between">
            <div>
              <div className="g8d-kicker">NGÀY ĐANG CHỌN ({selectedDay.shortDate})</div>
              <div className="g8d-card-title">Đang là ngày nghỉ hồi phục cơ</div>
              <div className="g8d-tiny-meta">
                Nghỉ ngơi giữ chuỗi kỷ luật, hoặc bấm mở tập nếu hôm nay muốn vào bài.
              </div>
            </div>
            <button
              type="button"
              className="g8d-btn-primary"
              onClick={() => onRestoreDayWorkout(selectedDay.isoDate, effectiveSessionId)}
            >
              Mở tập
            </button>
          </div>
        </div>
      )}

      <div className={`g8d-card g8d-workout-topcard ${selectedDay.isCompleted ? 'is-done-card' : ''}`}>
        <div className="g8d-session-switch-row">
          <div className="g8d-session-tabs">
            {SESSION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={effectiveSessionId === tab.id ? 'is-active' : ''}
                onClick={() => onSelectSession(tab.id)}
              >
                {tab.short}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="g8d-gym-chip"
            onClick={() => setGymSheetOpen(true)}
          >
            <span>{GYM_BRANCHES[selectedGymId]?.shortName || 'Phòng tập'}</span>
            <SvgIcon name="chevronDown" size={14} />
          </button>
        </div>

        <div className="g8d-workout-progress-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="g8d-workout-title-compact">
              {sessionDef.shortName} · <span className="g8d-orange-txt">{progress.completionPct}%</span>
            </div>
            <div className="g8d-progress-track" style={{ marginTop: 6 }}>
              <div
                className={`g8d-progress-fill ${progress.meetsThreshold ? 'is-green' : ''}`}
                style={{ width: `${progress.completionPct}%` }}
              />
            </div>
            <div className="g8d-tiny-meta" style={{ marginTop: 4 }}>
              {progress.completedSetsCount}/{progress.totalSetsCount} hiệp · Tổng{' '}
              {progress.totalVolumeKg.toLocaleString('vi-VN')}kg
            </div>
          </div>

          <div className="g8d-row-gap">
            {!selectedDay.isCompleted ? (
              <>
                <button
                  type="button"
                  className="g8d-btn-green"
                  onClick={() => onFinishDayDone(selectedDay.isoDate, effectiveSessionId)}
                >
                  Tập xong
                </button>
                {selectedDay.sessionId !== 'rest' && !selectedDay.isFutureDay && (
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={() => onMarkDayOff(selectedDay.isoDate)}
                  >
                    Nghỉ
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                className="g8d-btn-outline"
                onClick={() => onUndoDayDone(selectedDay.isoDate)}
              >
                Đã xong · Bỏ
              </button>
            )}
          </div>
        </div>

        <div className="g8d-workout-ai-strip">
          <span className="g8d-tiny-meta">
            {selectedDay.isCompleted
              ? 'Đã tính vào chuỗi kỷ luật tuần này.'
              : 'Kẹt máy, mỏi vai/lưng hoặc muốn chỉnh giáo án?'}
          </span>
          <button
            type="button"
            className="g8d-ai-inline-btn"
            onClick={() =>
              onOpenCoach(
                `Đổi các bài trong ${sessionDef.shortName} hôm nay giúp tao cho phù hợp với: `,
                'Buổi Tập'
              )
            }
          >
            Nhờ ChatDVT đổi bài
          </button>
        </div>
      </div>

      <div className="g8d-exercise-list">
        {effectiveIds.map((exId, index) => {
          const origId = baseIds[index] || exId;
          const ex = EXERCISES[exId];
          if (!ex) return null;

          const sets = getEffectiveSetsForDay(ex.id, selectedDay.isoDate, logsByDate);
          const doneSets = sets.filter((s) => s.done).length;
          const prevPerf = getPreviousExercisePerf(ex.id, selectedDay.isoDate, logsByDate);
          const prRec = personalRecords[ex.id];
          const isAllDone = sets.length > 0 && doneSets === sets.length;

          return (
            <div
              key={`${origId}-${exId}-${index}`}
              className={`g8d-ex-card ${isAllDone ? 'is-done' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setFocusedExSlot({ origId, exId: ex.id, index })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFocusedExSlot({ origId, exId: ex.id, index });
                }
              }}
            >
              <img
                src={resolveMascotAsset(ex.mascot)}
                alt={ex.shortName}
                width={52}
                height={52}
                loading={index < 4 ? 'eager' : 'lazy'}
                className="g8d-ex-avatar"
              />

              <div className="g8d-ex-body">
                <div className="g8d-ex-top-meta">
                  <span className="g8d-ex-rank">#{index + 1}</span>
                  <span className="g8d-ex-zone">{ex.zoneLabel}</span>
                  {prevPerf?.suggestBumpKg ? (
                    <span className="g8d-ex-overload-tag">+{prevPerf.suggestBumpKg}kg</span>
                  ) : prRec ? (
                    <span className="g8d-ex-pr-tag">PR {prRec.maxWeight}kg</span>
                  ) : null}
                </div>

                <div className="g8d-ex-name">{ex.shortName}</div>

                <div className="g8d-ex-subline">
                  {prevPerf ? (
                    <span>
                      Kỳ trước ({prevPerf.lastDateShort}):{' '}
                      <strong>
                        {prevPerf.bestWeight}kg × {prevPerf.bestReps}
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Mức tạ: {sets[sets.length - 1]?.weight || 0}kg × {ex.repRange[0]}–{ex.repRange[1]}
                    </span>
                  )}
                </div>
              </div>

              <div className="g8d-ex-right" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={`g8d-ex-count-pill ${
                    isAllDone ? 'is-done' : doneSets > 0 ? 'is-part' : ''
                  }`}
                  onClick={() => setFocusedExSlot({ origId, exId: ex.id, index })}
                  aria-label={`Mở bài ${ex.shortName}, đã chốt ${doneSets} trên ${sets.length} hiệp`}
                >
                  {doneSets}/{sets.length}
                </button>
                <button
                  type="button"
                  className="g8d-ex-swap-mini"
                  onClick={() => setSwapTarget({ origId, exId: ex.id })}
                  title="Đổi máy tập"
                  aria-label={`Đổi máy cho bài ${ex.shortName}`}
                >
                  <SvgIcon name="swap" size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="g8d-row-gap" style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          className="g8d-btn-outline"
          style={{ flex: 1 }}
          onClick={() => setAddOpen(true)}
        >
          + Thêm bài vào buổi ({effectiveIds.length})
        </button>
        {effectiveIds.length > 4 && (
          <button
            type="button"
            className="g8d-btn-outline"
            onClick={() => onRemoveExercise(effectiveSessionId, effectiveIds.length - 1)}
          >
            − Bớt bài cuối
          </button>
        )}
      </div>

      {renderSwapSheet()}

      <BottomSheet
        open={addOpen}
        title="Thêm Bài Tập Vào Giáo Án"
        subtitle={`Bổ sung vào ${sessionDef.shortName}`}
        onClose={() => setAddOpen(false)}
      >
        <div className="g8d-stack-xs">
          {addableExercises.map((cand) => (
            <button
              key={cand.id}
              type="button"
              className="g8d-choice-row"
              onClick={() => {
                onAddExercise(effectiveSessionId, cand.id);
                setAddOpen(false);
              }}
            >
              <div className="g8d-row-gap">
                <img
                  src={resolveMascotAsset(cand.mascot)}
                  alt=""
                  width={38}
                  height={38}
                  className="g8d-mini-avatar"
                  loading="lazy"
                />
                <div>
                  <div className="g8d-choice-title">{cand.shortName}</div>
                  <div className="g8d-tiny-meta">
                    {cand.muscle} · {cand.equipment}
                  </div>
                </div>
              </div>
              <SvgIcon name="plus" size={17} />
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={gymSheetOpen}
        title="Chọn Cơ Sở Phòng Tập & Dàn Máy"
        subtitle="Tối ưu thứ tự khu vực máy để di chuyển gọn nhất"
        onClose={() => setGymSheetOpen(false)}
      >
        <div className="g8d-stack-sm">
          <div className="g8d-kicker">CƠ SỞ ĐANG TẬP HÔM NAY</div>
          <div className="g8d-stack-xs">
            {(['tng_uvk', 'ways_ql13', 'all'] as GymBranchId[]).map((gid) => {
              const br = GYM_BRANCHES[gid];
              return (
                <button
                  key={gid}
                  type="button"
                  className={`g8d-choice-row ${selectedGymId === gid ? 'is-selected' : ''}`}
                  onClick={() => onSelectGymBranch(gid)}
                >
                  <div>
                    <div className="g8d-choice-title">{br.shortName}</div>
                    <div className="g8d-tiny-meta">{br.address}</div>
                  </div>
                  {selectedGymId === gid && <SvgIcon name="check" size={16} color="#E85D1A" />}
                </button>
              );
            })}
          </div>

          <div className="g8d-kicker">BỘ MÁY GỢI Ý CHO {sessionDef.shortName.toUpperCase()}</div>
          <div className="g8d-stack-xs">
            {Object.values(GYM_SESSION_PRESETS).map((preset) => {
              const curPreset = activePresetBySession[effectiveSessionId] || 'default';
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`g8d-choice-row ${curPreset === preset.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    onApplyGymPreset(effectiveSessionId, preset.id);
                    setGymSheetOpen(false);
                  }}
                >
                  <div>
                    <div className="g8d-choice-title">{preset.label}</div>
                    <div className="g8d-tiny-meta">{preset.description}</div>
                  </div>
                  {curPreset === preset.id && <SvgIcon name="check" size={16} color="#E85D1A" />}
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
