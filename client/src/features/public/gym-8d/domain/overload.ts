import { EXERCISES } from '../data/exercises';
import { SESSION_ALLOWED_SLOT_GROUPS, WORKOUT_SESSIONS } from '../data/workouts';
import type {
  ExerciseDef,
  GymBranchId,
  PersonalRecordEntry,
  PreviousExercisePerf,
  SetEntry,
  WorkoutSessionId,
} from '../types/gym';
import { diffDaysISO, formatVNShortDate } from './dateUtils';

export function estimateEpley1RM(weight: number, reps: number): number {
  const w = Number(weight) || 0;
  const r = Math.max(1, Number(reps) || 1);
  if (w <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + Math.min(20, r) / 30) * 10) / 10;
}

/**
 * Finds the most recent completed session for `exId` strictly on a date != `targetDateISO`
 * (prefers past dates <= targetDateISO, falls back to any other logged date if inspecting earlier days).
 */
export function getPreviousExercisePerf(
  exId: string,
  targetDateISO: string,
  logsByDate: Record<string, Record<string, SetEntry[]>>
): PreviousExercisePerf | null {
  const candidateDates = Object.keys(logsByDate || {})
    .filter((d) => d !== targetDateISO && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .filter((d) => {
      const sets = logsByDate[d]?.[exId];
      return Array.isArray(sets) && sets.some((s) => s && s.done);
    })
    .sort((a, b) => diffDaysISO(b, a)); // descending newest first

  if (candidateDates.length === 0) return null;

  const priorDates = candidateDates.filter((d) => diffDaysISO(d, targetDateISO) < 0);
  const bestDateISO = priorDates[0] || candidateDates[0];
  const rawSets = logsByDate[bestDateISO][exId] || [];
  const doneWorkSets = rawSets.filter((s) => s && s.done && s.type !== 'W');
  const doneAnySets = doneWorkSets.length > 0 ? doneWorkSets : rawSets.filter((s) => s && s.done);

  let bestWeight = 0;
  let bestReps = 0;
  let bestE1RM = 0;
  for (const s of doneAnySets) {
    const w = Number(s.weight) || 0;
    const r = Number(s.reps) || 0;
    const e1rm = estimateEpley1RM(w, r);
    if (w > bestWeight || (w === bestWeight && r > bestReps)) {
      bestWeight = w;
      bestReps = r;
    }
    if (e1rm > bestE1RM) bestE1RM = e1rm;
  }

  const ex = EXERCISES[exId];
  const upperRepTarget = ex?.repRange?.[1] || 12;
  const allWorkSetsHitTop =
    doneWorkSets.length >= 2 &&
    doneWorkSets.every(
      (s) => (Number(s.reps) || 0) >= upperRepTarget || s.effort === 'easy'
    );

  const bumpStep = ex?.usesBarbell || bestWeight >= 35 ? 2.5 : 2;
  const suggestBumpKg = bestWeight > 0 && allWorkSetsHitTop ? bumpStep : 0;
  const suggestReason =
    suggestBumpKg > 0
      ? `Buổi ${formatVNShortDate(bestDateISO)} đạt đủ ${upperRepTarget} reps các hiệp chính — Gợi ý tăng +${suggestBumpKg}kg!`
      : null;

  return {
    lastDateISO: bestDateISO,
    lastDateShort: formatVNShortDate(bestDateISO),
    sets: rawSets,
    bestWeight,
    bestReps,
    bestE1RM,
    suggestBumpKg,
    suggestReason,
  };
}

/**
 * Builds sets for `(targetDateISO, exId)`:
 * - Returns existing sets on `targetDateISO` if already edited/logged.
 * - Otherwise pre-fills weights & reps from the user's REAL last session (`getPreviousExercisePerf`)!
 * - Falls back to `EXERCISES[exId].defaultSets` only when never logged before.
 */
export function getEffectiveSetsForDay(
  exId: string,
  targetDateISO: string,
  logsByDate: Record<string, Record<string, SetEntry[]>>
): SetEntry[] {
  const existing = logsByDate?.[targetDateISO]?.[exId];
  const prevPerf = getPreviousExercisePerf(exId, targetDateISO, logsByDate);

  if (Array.isArray(existing) && existing.length > 0) {
    if (!prevPerf) return existing;
    // Refresh `prev` hint dynamically if it still holds generic placeholder text
    return existing.map((s, idx) => {
      const prevSet = prevPerf.sets[idx] || prevPerf.sets[prevPerf.sets.length - 1];
      const dynamicPrev =
        prevSet && prevSet.done
          ? `${prevPerf.lastDateShort}: ${prevSet.weight}kg × ${prevSet.reps}`
          : `${prevPerf.lastDateShort}: ${prevPerf.bestWeight}kg × ${prevPerf.bestReps}`;
      const isGeneric = !s.prev || s.prev === 'Mức gợi ý' || s.prev === 'Khởi động khớp';
      return isGeneric ? { ...s, prev: dynamicPrev } : s;
    });
  }

  const ex = EXERCISES[exId];
  if (!ex) return [];

  if (prevPerf && prevPerf.sets.length > 0) {
    return prevPerf.sets.map((ps, idx) => {
      const fallback = ex.defaultSets[idx] || ex.defaultSets[ex.defaultSets.length - 1];
      const w = Number(ps.weight ?? fallback?.weight ?? 0);
      const r = Number(ps.reps ?? fallback?.reps ?? 10);
      return {
        type: ps.type || fallback?.type || String(idx + 1),
        prev: `${prevPerf.lastDateShort}: ${w}kg × ${r}`,
        weight: w,
        reps: r,
        effort: ps.type === 'W' ? 'warmup' : 'good',
        done: false,
      };
    });
  }

  return ex.defaultSets.map((s) => ({ ...s, done: false }));
}

export function computePersonalRecords(
  logsByDate: Record<string, Record<string, SetEntry[]>>
): Record<string, PersonalRecordEntry> {
  const records: Record<string, PersonalRecordEntry> = {};
  const datesChrono = Object.keys(logsByDate || {})
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort((a, b) => diffDaysISO(a, b));

  for (const dISO of datesChrono) {
    const dayMap = logsByDate[dISO] || {};
    for (const [exId, sets] of Object.entries(dayMap)) {
      if (!Array.isArray(sets)) continue;
      const ex = EXERCISES[exId];
      if (!ex) continue;
      for (const s of sets) {
        if (!s || !s.done) continue;
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        const e1rm = estimateEpley1RM(w, r);
        const cur = records[exId];
        if (!cur) {
          records[exId] = {
            exerciseId: exId,
            exerciseName: ex.shortName || ex.name,
            mascot: ex.mascot,
            slotGroup: ex.slotGroup,
            maxWeight: w,
            repsAtMaxWeight: r,
            maxWeightDateShort: formatVNShortDate(dISO),
            bestE1RM: e1rm,
            totalDoneSetsAllTime: 1,
          };
        } else {
          cur.totalDoneSetsAllTime += 1;
          if (w > cur.maxWeight || (w === cur.maxWeight && r > cur.repsAtMaxWeight)) {
            cur.maxWeight = w;
            cur.repsAtMaxWeight = r;
            cur.maxWeightDateShort = formatVNShortDate(dISO);
          }
          if (e1rm > cur.bestE1RM) {
            cur.bestE1RM = e1rm;
          }
        }
      }
    }
  }
  return records;
}

export function checkSetBeatsHistoricalPR(
  exId: string,
  set: SetEntry,
  currentDateISO: string,
  logsByDate: Record<string, Record<string, SetEntry[]>>
): boolean {
  if (!set || set.type === 'W') return false;
  const w = Number(set.weight) || 0;
  const r = Number(set.reps) || 0;
  if (w <= 0 || r <= 0) return false;

  let prevMaxW = 0;
  let prevBestE1RM = 0;
  let hadPriorHistory = false;

  for (const [dISO, dayMap] of Object.entries(logsByDate || {})) {
    if (dISO === currentDateISO) continue;
    const sets = dayMap?.[exId];
    if (!Array.isArray(sets)) continue;
    for (const s of sets) {
      if (!s || !s.done || s.type === 'W') continue;
      const sw = Number(s.weight) || 0;
      const sr = Number(s.reps) || 0;
      if (sw > 0) hadPriorHistory = true;
      if (sw > prevMaxW) prevMaxW = sw;
      const e1 = estimateEpley1RM(sw, sr);
      if (e1 > prevBestE1RM) prevBestE1RM = e1;
    }
  }

  if (!hadPriorHistory) return false;
  const curE1RM = estimateEpley1RM(w, r);
  return w > prevMaxW || curE1RM > prevBestE1RM;
}

export function getEffectiveSessionExerciseIds(
  sessionId: string,
  sessionSwaps?: Record<string, string>,
  customSessionLists?: Record<string, string[]>
): string[] {
  const sess = WORKOUT_SESSIONS[sessionId as WorkoutSessionId] || WORKOUT_SESSIONS.press_day;
  const custom = customSessionLists?.[sessionId];
  const baseList = Array.isArray(custom) && custom.length > 0 ? custom : sess.exerciseIds;
  const swaps = sessionSwaps || {};
  return baseList.map((origId) => {
    const key = `${sessionId}__${origId}`;
    return swaps[key] && EXERCISES[swaps[key]] ? swaps[key] : origId;
  });
}

export function getSwapCandidatesForSlot(
  sessionId: string,
  slotOriginalId: string,
  currentExId: string,
  gymBranchId: GymBranchId
): { sameGroup: ExerciseDef[]; otherInSession: ExerciseDef[] } {
  const activeEx = EXERCISES[currentExId] || EXERCISES[slotOriginalId] || EXERCISES.incline_db_press;
  const targetGroup = activeEx.slotGroup || 'chest_press';
  const allExercises = Object.values(EXERCISES);

  const filterByGym = (ex: ExerciseDef) => {
    if (!gymBranchId || gymBranchId === 'all') return true;
    return !Array.isArray(ex.availableGyms) || ex.availableGyms.includes(gymBranchId);
  };

  const sameGroup = allExercises
    .filter((ex) => ex.slotGroup === targetGroup && filterByGym(ex))
    .sort((a, b) => (a.priorityRank || 9) - (b.priorityRank || 9));

  const allowedGroups = SESSION_ALLOWED_SLOT_GROUPS[sessionId] || [targetGroup];
  const otherInSession = allExercises
    .filter((ex) => ex.slotGroup !== targetGroup && allowedGroups.includes(ex.slotGroup) && filterByGym(ex))
    .sort((a, b) => (a.priorityRank || 9) - (b.priorityRank || 9));

  return { sameGroup, otherInSession };
}

export function getSessionAddableExercises(
  sessionId: string,
  currentEffectiveIds: string[],
  gymBranchId: GymBranchId
): ExerciseDef[] {
  const allowedGroups = SESSION_ALLOWED_SLOT_GROUPS[sessionId] || [];
  return Object.values(EXERCISES)
    .filter((ex) => !currentEffectiveIds.includes(ex.id))
    .filter((ex) => allowedGroups.length === 0 || allowedGroups.includes(ex.slotGroup))
    .filter((ex) => gymBranchId === 'all' || !ex.availableGyms || ex.availableGyms.includes(gymBranchId))
    .sort((a, b) => (a.priorityRank || 9) - (b.priorityRank || 9));
}
