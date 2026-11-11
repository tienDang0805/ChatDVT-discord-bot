import { EXERCISES } from '../data/exercises';
import { VN_FOODS } from '../data/foods';
import { GYM_BRANCHES } from '../data/gyms';
import { WORKOUT_SESSIONS } from '../data/workouts';
import type {
  DayScheduleEntry,
  GymStateV10,
  PersonalRecordEntry,
  WorkoutSessionId,
} from '../types/gym';
import { DAY_SHORT_NAMES, addDaysISO, formatVNShortDate } from './dateUtils';
import type { CalculatedMetrics } from './metrics';
import { getEffectiveSessionExerciseIds, getEffectiveSetsForDay } from './overload';

export interface BuildCoachingDigestParams {
  todayISO: string;
  selectedDay: DayScheduleEntry;
  effectiveSessionId: WorkoutSessionId;
  state: GymStateV10;
  metrics: CalculatedMetrics;
  timeline14: DayScheduleEntry[];
  currentStreak: number;
  bestStreak: number;
  personalRecords: Record<string, PersonalRecordEntry>;
}

function sumDayNutrition(state: GymStateV10, dISO: string) {
  const servings = state.foodServingsByDate[dISO] || {};
  const customs = state.customMacrosByDate[dISO] || [];
  let kcal = 0;
  let protein = 0;
  let carb = 0;
  let fat = 0;
  const items: string[] = [];
  const catalogEntries: Array<{
    foodId: string;
    name: string;
    servings: number;
    kcal: number;
    protein: number;
  }> = [];
  const customEntries: Array<{
    id: string;
    name: string;
    kcal: number;
    protein: number;
  }> = [];

  for (const [fid, qty] of Object.entries(servings)) {
    if (!qty || qty <= 0) continue;
    const f = VN_FOODS.find((x) => x.id === fid);
    if (!f) continue;
    const itemKcal = Math.round(f.kcal * qty);
    const itemProtein = Math.round(f.protein * qty);
    kcal += itemKcal;
    protein += itemProtein;
    carb += Math.round(f.carb * qty);
    fat += Math.round(f.fat * qty);
    items.push(`[Catalog foodId=${fid}] ${qty}x ${f.name} (${itemKcal}kcal, ${itemProtein}g đạm)`);
    catalogEntries.push({ foodId: fid, name: f.name, servings: qty, kcal: itemKcal, protein: itemProtein });
  }
  for (const c of customs) {
    const cKcal = Number(c.kcal) || 0;
    const cProtein = Number(c.protein) || 0;
    kcal += cKcal;
    protein += cProtein;
    carb += Number(c.carb) || 0;
    fat += Number(c.fat) || 0;
    items.push(`[Custom] ${c.name} (${cKcal}kcal, ${cProtein}g đạm)`);
    customEntries.push({ id: c.id, name: c.name, kcal: cKcal, protein: cProtein });
  }
  const waterMl = Number(state.waterByDate[dISO] || 0);
  return { kcal, protein, carb, fat, waterMl, items, catalogEntries, customEntries };
}

export function buildCoachingDigest({
  todayISO,
  selectedDay,
  effectiveSessionId,
  state,
  metrics,
  timeline14,
  currentStreak,
  bestStreak,
  personalRecords,
}: BuildCoachingDigestParams) {
  // 1. 7-day nutrition digest (today back to -6 days)
  const nutrition7d: Array<{
    dateISO: string;
    shortDate: string;
    kcal: number;
    protein: number;
    waterMl: number;
  }> = [];

  for (let offset = -6; offset <= 0; offset++) {
    const dISO = addDaysISO(todayISO, offset);
    const tot = sumDayNutrition(state, dISO);
    nutrition7d.push({
      dateISO: dISO,
      shortDate: formatVNShortDate(dISO),
      kcal: tot.kcal,
      protein: tot.protein,
      waterMl: tot.waterMl,
    });
  }

  const loggedNutriDays = nutrition7d.filter((d) => d.kcal > 0 || d.waterMl > 0);
  const avgKcal7d =
    loggedNutriDays.length > 0
      ? Math.round(loggedNutriDays.reduce((s, d) => s + d.kcal, 0) / loggedNutriDays.length)
      : 0;
  const avgProtein7d =
    loggedNutriDays.length > 0
      ? Math.round(loggedNutriDays.reduce((s, d) => s + d.protein, 0) / loggedNutriDays.length)
      : 0;
  const avgWaterMl7d =
    loggedNutriDays.length > 0
      ? Math.round(loggedNutriDays.reduce((s, d) => s + d.waterMl, 0) / loggedNutriDays.length)
      : 0;

  const todayNutri = sumDayNutrition(state, todayISO);

  // 2. 14-day workout & adherence digest
  const pastOrToday = timeline14.filter((d) => !d.isFutureDay);
  const last7Entries = pastOrToday.slice(-7);
  const done7d = last7Entries.filter((d) => d.isCompleted);
  const missed7d = last7Entries.filter((d) => d.isMissed);
  const volume7d = done7d.reduce((s, d) => s + (d.totalVolumeKg || 0), 0);

  // Detect struggled / heavy sets in recent logs
  const heavyOrMissedRepSets: Array<{
    dateShort: string;
    exId: string;
    exName: string;
    weight: number;
    reps: number;
    targetRepMin: number;
    effort: string;
  }> = [];

  const recentLogDates = Object.keys(state.logsByDate || {})
    .sort()
    .slice(-10);

  for (const dISO of recentLogDates) {
    const dayMap = state.logsByDate[dISO] || {};
    for (const [exId, sets] of Object.entries(dayMap)) {
      const ex = EXERCISES[exId];
      if (!ex || !Array.isArray(sets)) continue;
      const minRep = Number(ex.repRange?.[0] || 8);
      for (const s of sets) {
        if (!s || s.type === 'W' || !s.done) continue;
        if (s.effort === 'max' || s.effort === 'hard' || s.reps < minRep) {
          heavyOrMissedRepSets.push({
            dateShort: formatVNShortDate(dISO),
            exId,
            exName: ex.shortName,
            weight: s.weight,
            reps: s.reps,
            targetRepMin: minRep,
            effort: String(s.effort || 'good'),
          });
        }
      }
    }
  }

  // Current active session exercises with today's live sets
  const activeExIds = getEffectiveSessionExerciseIds(
    effectiveSessionId,
    state.sessionSwaps,
    state.customSessionLists
  );
  const currentSessionExercises = activeExIds.map((id) => {
    const ex = EXERCISES[id];
    const sets = getEffectiveSetsForDay(id, selectedDay.isoDate, state.logsByDate);
    const workSets = sets.filter((s) => s.type !== 'W');
    return {
      id,
      name: ex?.shortName || id,
      repRange: ex?.repRange || [8, 12],
      currentWeightKg: workSets[0]?.weight ?? 0,
      doneSets: sets.filter((s) => s.done).length,
      totalSets: sets.length,
    };
  });

  // Weekly split summary (Mon=1 .. Sun=0)
  const dowOrder = [1, 2, 3, 4, 5, 6, 0];
  const weeklySplit = dowOrder.map((dow) => {
    const rule = state.weeklyPattern[dow] || { sessionId: 'rest', workoutTime: '06:00' };
    const sessName =
      rule.sessionId !== 'rest'
        ? WORKOUT_SESSIONS[rule.sessionId as WorkoutSessionId]?.shortName || rule.sessionId
        : 'Nghỉ cơ (Off)';
    return {
      dow,
      dayLabel: DAY_SHORT_NAMES[dow],
      sessionId: rule.sessionId,
      sessionName: sessName,
      workoutTime: rule.workoutTime,
    };
  });

  // Recent notes
  const recentNotes = Object.entries(state.dayNotesByDate || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-5)
    .map(([d, note]) => `${formatVNShortDate(d)}: ${note}`);

  // Top PRs
  const topPRs = Object.values(personalRecords)
    .sort((a, b) => b.bestE1RM - a.bestE1RM)
    .slice(0, 5)
    .map((r) => `${r.exerciseName}: ${r.maxWeight}kg x ${r.repsAtMaxWeight}`);

  // Weight trend
  const weights = state.weightLogs || [];
  const startWeight = weights[0]?.weight ?? metrics.profile.weightKg;
  const currentWeight = metrics.profile.weightKg;
  const todayEntryInTimeline = timeline14.find((d) => d.isoDate === todayISO);
  const upcoming7DaysCalendar = timeline14
    .filter((d) => d.isoDate >= todayISO)
    .slice(0, 7)
    .map((d) => ({
      isoDate: d.isoDate,
      dayOfWeek: d.dayOfWeek,
      dayLabel: `${d.dayShort} (${d.shortDate})${d.isToday ? ' — HÔM NAY' : d.isTomorrow ? ' — NGÀY MAI' : ''}`,
      sessionId: d.sessionId,
      workoutTime: d.workoutTime,
      status: d.isCompleted ? 'done' : d.isMissed ? 'missed' : d.sessionId === 'rest' ? 'rest' : 'scheduled',
    }));

  const resolvedUserName =
    metrics.profile.name?.trim() ||
    (state.syncCode === 'TIEN8D' ? 'Tiến' : 'bạn');

  return {
    userName: resolvedUserName,
    syncCode: state.syncCode,
    todayISO,
    todayDayLabel: todayEntryInTimeline
      ? `${todayEntryInTimeline.dayShort} (${todayEntryInTimeline.shortDate})`
      : todayISO,
    upcoming7DaysCalendar,
    selectedDateISO: selectedDay.isoDate,
    selectedDayLabel: `${selectedDay.dayShort} (${selectedDay.shortDate})`,
    selectedDayStatus: selectedDay.isCompleted
      ? 'done'
      : selectedDay.isMissed
      ? 'missed'
      : selectedDay.sessionId === 'rest'
      ? 'off'
      : 'scheduled',
    effectiveSessionId,
    effectiveSessionName: WORKOUT_SESSIONS[effectiveSessionId]?.shortName || effectiveSessionId,
    selectedGym: GYM_BRANCHES[state.selectedGymId]?.shortName || 'The New Gym 58D UVK',
    bodyAndStrategy: {
      gender: metrics.profile.gender,
      age: metrics.profile.age,
      heightCm: metrics.profile.heightCm,
      startWeightKg: startWeight,
      currentWeightKg: currentWeight,
      targetWeightKg: metrics.profile.targetWeightKg,
      weightDeltaKg: Math.round((currentWeight - startWeight) * 10) / 10,
      bmi: metrics.bmi,
      bodyFatPct: metrics.bodyFatPct,
      leanBodyMassKg: metrics.lbm,
      goalStrategy:
        metrics.profile.goal === 'cut'
          ? 'cut (Giảm mỡ giữ cơ)'
          : metrics.profile.goal === 'recomp'
          ? 'recomp (Siết nét đồng thời giữ/tăng cơ)'
          : 'bulk (Tăng cơ)',
      bmrKcal: metrics.bmr,
      tdeeKcal: metrics.tdee,
      targetKcal: metrics.targetKcal,
      targetProteinG: metrics.proteinG,
      targetCarbG: metrics.carbG,
      targetFatG: metrics.fatG,
      targetWaterMl: metrics.waterMl,
      workoutTime: metrics.profile.workoutTime,
      estimatedWeeksToGoal: metrics.weeksToGoal,
    },
    weeklySplit,
    currentSessionExercises,
    workoutSummary7d: {
      currentStreak,
      bestStreak,
      completedSessions7d: done7d.length,
      missedSessions7d: missed7d.length,
      completedDates: done7d.map((d) => `${d.dayShort} ${d.shortDate}`),
      missedDates: missed7d.map((d) => `${d.dayShort} ${d.shortDate}`),
      totalVolumeKg7d: volume7d,
      heavyOrMissedRepSets: heavyOrMissedRepSets.slice(-6),
      topPRs,
      recentNotes,
    },
    nutritionToday: {
      kcal: todayNutri.kcal,
      proteinG: todayNutri.protein,
      carbG: todayNutri.carb,
      fatG: todayNutri.fat,
      waterMl: todayNutri.waterMl,
      loggedItems: todayNutri.items,
      catalogEntries: todayNutri.catalogEntries,
      customEntries: todayNutri.customEntries,
    },
    nutritionSummary7d: {
      loggedDaysCount: loggedNutriDays.length,
      avgKcal: avgKcal7d,
      avgProteinG: avgProtein7d,
      avgWaterMl: avgWaterMl7d,
      dailyBreakdown: nutrition7d,
    },
  };
}
