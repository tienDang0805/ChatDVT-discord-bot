import { EXERCISES } from '../data/exercises';
import { MIN_WORKOUT_COMPLETION_PCT, WORKOUT_SESSIONS } from '../data/workouts';
import type {
  DayScheduleEntry,
  DayStatusRecord,
  ProfileInput,
  SessionId,
  SessionProgressSummary,
  SetEntry,
  WeekdayRule,
  WorkoutSessionId,
} from '../types/gym';
import {
  DAY_SHORT_NAMES,
  addDaysISO,
  diffDaysISO,
  formatISODate,
  formatVNDate,
  formatVNShortDate,
  getMondayISO,
  getTodayISO,
  minutesToHHMM,
  pad2,
  parseHHMM,
  parseISODate,
} from './dateUtils';
import { getEffectiveSessionExerciseIds } from './overload';

export function buildDefaultWeeklyPattern(): Record<number, WeekdayRule> {
  return {
    1: { sessionId: 'rest', workoutTime: '06:00' },
    2: { sessionId: 'press_day', workoutTime: '06:00' },
    3: { sessionId: 'pull_day', workoutTime: '06:00' },
    4: { sessionId: 'rest', workoutTime: '06:00' },
    5: { sessionId: 'legs_day', workoutTime: '06:00' },
    6: { sessionId: 'rest', workoutTime: '07:00', isOptionalDay: true },
    0: { sessionId: 'rest', workoutTime: '07:00' },
  };
}

export function calculateSessionCompletion(
  sessionId: string,
  dayLogs?: Record<string, SetEntry[]>,
  sessionSwaps?: Record<string, string>,
  customSessionLists?: Record<string, string[]>
): SessionProgressSummary {
  const sess = WORKOUT_SESSIONS[sessionId as WorkoutSessionId];
  if (!sess) {
    return {
      totalExercises: 0,
      completedExercises: 0,
      totalSetsCount: 0,
      completedSetsCount: 0,
      totalTargetReps: 0,
      completedRepsCount: 0,
      totalVolumeKg: 0,
      exercisePct: 0,
      setPct: 0,
      repPct: 0,
      completionPct: 0,
      minRequiredPct: MIN_WORKOUT_COMPLETION_PCT,
      minRequiredExercises: 0,
      minRequiredSets: 0,
      minRequiredReps: 0,
      meetsThreshold: false,
    };
  }

  const activeExIds = getEffectiveSessionExerciseIds(sessionId, sessionSwaps, customSessionLists);
  const logs = dayLogs || {};
  const totalExercises = activeExIds.length;
  let completedExercises = 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  let totalTargetReps = 0;
  let completedRepsCount = 0;
  let totalVolumeKg = 0;

  for (const exId of activeExIds) {
    const ex = EXERCISES[exId];
    const sets = Array.isArray(logs[exId]) ? logs[exId] : ex?.defaultSets || [];
    const exTotalSets = sets.length;
    let exDoneSets = 0;
    let exTargetReps = 0;
    let exDoneReps = 0;

    for (const s of sets) {
      const r = Math.max(1, Number(s?.reps) || 0);
      const w = Math.max(0, Number(s?.weight) || 0);
      exTargetReps += r;
      if (s?.done) {
        exDoneSets += 1;
        exDoneReps += r;
        totalVolumeKg += w * r;
      }
    }

    totalSetsCount += exTotalSets;
    completedSetsCount += exDoneSets;
    totalTargetReps += exTargetReps;
    completedRepsCount += exDoneReps;

    const exSetPct = exTotalSets > 0 ? (exDoneSets / exTotalSets) * 100 : 0;
    const exRepPct = exTargetReps > 0 ? (exDoneReps / exTargetReps) * 100 : 0;
    if (Math.max(exSetPct, exRepPct) >= MIN_WORKOUT_COMPLETION_PCT) {
      completedExercises += 1;
    }
  }

  const exercisePct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const setPct = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;
  const repPct = totalTargetReps > 0 ? Math.round((completedRepsCount / totalTargetReps) * 100) : 0;
  const completionPct = Math.max(exercisePct, setPct, repPct);

  const minRequiredExercises = Math.max(1, Math.ceil(totalExercises * (MIN_WORKOUT_COMPLETION_PCT / 100)));
  const minRequiredSets = Math.max(1, Math.ceil(totalSetsCount * (MIN_WORKOUT_COMPLETION_PCT / 100)));
  const minRequiredReps = Math.max(1, Math.ceil(totalTargetReps * (MIN_WORKOUT_COMPLETION_PCT / 100)));

  return {
    totalExercises,
    completedExercises,
    totalSetsCount,
    completedSetsCount,
    totalTargetReps,
    completedRepsCount,
    totalVolumeKg: Math.round(totalVolumeKg),
    exercisePct,
    setPct,
    repPct,
    completionPct,
    minRequiredPct: MIN_WORKOUT_COMPLETION_PCT,
    minRequiredExercises,
    minRequiredSets,
    minRequiredReps,
    meetsThreshold: completionPct >= MIN_WORKOUT_COMPLETION_PCT,
  };
}

export function resolveBestLoggedSession(
  preferredSessionId: SessionId,
  dayLogs?: Record<string, SetEntry[]>,
  sessionSwaps?: Record<string, string>,
  customSessionLists?: Record<string, string[]>
): {
  sessionId: SessionId;
  bestWorkoutSessionId: WorkoutSessionId;
  progress: SessionProgressSummary;
} {
  const logs = dayLogs || {};
  const hasAnyDoneSet = Object.values(logs).some(
    (sets) => Array.isArray(sets) && sets.some((s) => s && s.done)
  );
  const isPrefValid = Boolean(
    preferredSessionId && preferredSessionId !== 'rest' && WORKOUT_SESSIONS[preferredSessionId]
  );
  const prefId: WorkoutSessionId = isPrefValid ? (preferredSessionId as WorkoutSessionId) : 'press_day';
  const prefProgress = calculateSessionCompletion(prefId, logs, sessionSwaps, customSessionLists);

  if (!hasAnyDoneSet) {
    return {
      sessionId: isPrefValid ? preferredSessionId : 'rest',
      bestWorkoutSessionId: prefId,
      progress: isPrefValid ? prefProgress : calculateSessionCompletion('rest'),
    };
  }

  if (isPrefValid && prefProgress.meetsThreshold) {
    return {
      sessionId: preferredSessionId,
      bestWorkoutSessionId: prefId,
      progress: prefProgress,
    };
  }

  let bestId: WorkoutSessionId = prefId;
  let bestProg = prefProgress;
  (Object.keys(WORKOUT_SESSIONS) as WorkoutSessionId[]).forEach((candId) => {
    const prog = calculateSessionCompletion(candId, logs, sessionSwaps, customSessionLists);
    if (
      prog.completionPct > bestProg.completionPct ||
      (prog.completionPct === bestProg.completionPct && prog.completedSetsCount > bestProg.completedSetsCount)
    ) {
      bestId = candId;
      bestProg = prog;
    }
  });

  if (bestProg.completedSetsCount > 0) {
    return {
      sessionId: bestId,
      bestWorkoutSessionId: bestId,
      progress: bestProg,
    };
  }

  return {
    sessionId: isPrefValid ? preferredSessionId : 'rest',
    bestWorkoutSessionId: prefId,
    progress: prefProgress,
  };
}

export interface ScheduleBuilderOptions {
  todayISO?: string;
  startDateISO?: string;
  weeklyPattern?: Record<number, WeekdayRule>;
  dateOverrides?: Record<string, Partial<WeekdayRule>>;
  logsByDate?: Record<string, Record<string, SetEntry[]>>;
  dayStatusByDate?: Record<string, DayStatusRecord>;
  sessionSwaps?: Record<string, string>;
  customSessionLists?: Record<string, string[]>;
  preSleepLeadMin?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  weeklyRateKg?: number;
  weighInIntervalDays?: number;
}

export function buildDayScheduleEntry(isoDate: string, opts: ScheduleBuilderOptions = {}): DayScheduleEntry {
  const todayISO = opts.todayISO || getTodayISO();
  const tomorrowISO = addDaysISO(todayISO, 1);
  const startDateISO = opts.startDateISO || todayISO;
  const weeklyPattern = opts.weeklyPattern || buildDefaultWeeklyPattern();
  const dateOverrides = opts.dateOverrides || {};
  const logsByDate = opts.logsByDate || {};
  const dayStatusByDate = opts.dayStatusByDate || {};
  const preSleepLeadMin = Math.max(15, Math.min(90, Number(opts.preSleepLeadMin) || 30));

  const dt = parseISODate(isoDate);
  const dow = dt.getDay();
  const dayShort = DAY_SHORT_NAMES[dow];
  const patternRule = weeklyPattern[dow] || { sessionId: 'rest', workoutTime: '06:00' };
  const override = dateOverrides[isoDate] || {};
  const statusRecord = dayStatusByDate[isoDate] || null;
  const dayLogs = logsByDate[isoDate] || {};
  const hasAnyLoggedSets = Object.values(dayLogs).some(
    (sets) => Array.isArray(sets) && sets.some((s) => s && s.done)
  );

  const rawBeforeStart = diffDaysISO(isoDate, startDateISO) < 0;
  const isBeforeStart =
    rawBeforeStart &&
    isoDate !== todayISO &&
    !override.sessionId &&
    !statusRecord?.status &&
    !hasAnyLoggedSets;

  const baseSessionId: SessionId =
    override.sessionId ||
    statusRecord?.sessionId ||
    (isBeforeStart ? 'rest' : patternRule.sessionId || 'rest');

  const resolved = resolveBestLoggedSession(
    baseSessionId,
    dayLogs,
    opts.sessionSwaps,
    opts.customSessionLists
  );
  const sessionId = resolved.sessionId;
  const workoutTime = override.workoutTime || patternRule.workoutTime || '06:00';
  const isWorkoutDay = sessionId !== 'rest' && Boolean(WORKOUT_SESSIONS[sessionId]);

  const wkMin = parseHHMM(workoutTime);
  const isMorning = wkMin <= 9 * 60;
  const wakeMin = isMorning ? wkMin - 45 : 6 * 60 + 30;
  const sleepMin = wakeMin - 7.5 * 60;
  const bedPrepMin = sleepMin - preSleepLeadMin;
  const sleepTargetTime = minutesToHHMM(sleepMin);
  const preSleepAlertTime = minutesToHHMM(bedPrepMin);
  const wakeAlertTime = minutesToHHMM(wakeMin);

  const sess = isWorkoutDay ? WORKOUT_SESSIONS[sessionId as WorkoutSessionId] : undefined;
  const prog = resolved.progress;

  const isToday = isoDate === todayISO;
  const isTomorrow = isoDate === tomorrowISO;
  const isFirstWorkout = isoDate === startDateISO;
  const isPastDay = diffDaysISO(isoDate, todayISO) < 0;
  const isFutureDay = diffDaysISO(isoDate, todayISO) > 0;
  const isSaturdayOptional = dow === 6;
  const daysFromToday = diffDaysISO(isoDate, todayISO);
  const daysSinceStart = diffDaysISO(isoDate, startDateISO);
  const weighInIntervalDays = Number(opts.weighInIntervalDays) === 14 ? 14 : 7;
  const isWeighInDay = daysSinceStart >= 0 && daysSinceStart % weighInIntervalDays === 0;
  const weighInIndex = isWeighInDay ? Math.floor(daysSinceStart / weighInIntervalDays) + 1 : null;

  const explicitStatus = statusRecord?.status || null;
  const isCompleted =
    !isFutureDay &&
    isWorkoutDay &&
    prog.meetsThreshold &&
    (explicitStatus === 'done' || (explicitStatus !== 'missed' && prog.completionPct >= 100));
  const isMissed =
    !isFutureDay &&
    !isBeforeStart &&
    isWorkoutDay &&
    (explicitStatus === 'missed' || (!isCompleted && isPastDay && !isSaturdayOptional));

  const kcalBurned = isCompleted ? (sess ? sess.durationMin * 7 : 350) : 0;
  const isUnreportedToday = isToday && isWorkoutDay && !isCompleted && !isMissed;
  const canReportStatus = !isFutureDay && (isWorkoutDay || isCompleted || isMissed || isToday);
  const lockReason = isFutureDay
    ? `Chưa tới ngày tập (còn ${daysFromToday} ngày)`
    : isBeforeStart
    ? `Trước ngày mở màn (${formatVNShortDate(startDateISO)})`
    : !isWorkoutDay
    ? 'Ngày nghỉ hồi phục'
    : null;

  let badge = dayShort;
  if (isCompleted) badge = 'Đã tập Done';
  else if (isMissed) badge = 'Bỏ tập · Cần bù';
  else if (isToday) badge = isWorkoutDay ? 'Hôm nay · Lịch tập' : 'Hôm nay · Nghỉ cơ';
  else if (isTomorrow) badge = 'Ngày mai';
  else if (isSaturdayOptional) badge = isWorkoutDay ? 'T7 · Đang Bật' : 'T7 · Optional';
  else if (isWorkoutDay && sess) badge = sess.shortName;
  else badge = dow === 0 ? 'Chủ Nhật · Off' : 'Nghỉ hồi phục';

  let note = '';
  if (isCompleted && sess) {
    note = `Đã xong ${sess.shortName} (${prog.completedSetsCount}/${prog.totalSetsCount} hiệp · ${prog.totalVolumeKg.toLocaleString('vi-VN')}kg).`;
  } else if (isMissed && sess) {
    note = `Bỏ lỡ ${sess.shortName} (${formatVNShortDate(isoDate)}) — có thể dời bù sang ngày nghỉ kế tiếp.`;
  } else if (isWorkoutDay && sess) {
    note = `${sess.shortName} lúc ${workoutTime} · Chuông ngủ ${preSleepAlertTime}.`;
  } else {
    note = 'Nghỉ hồi phục cơ, đi bộ nhẹ 7.000 bước và uống đủ nước.';
  }

  return {
    id: `day_${isoDate}`,
    isoDate,
    dayOfWeek: dow,
    dayShort,
    dayNumber: dt.getDate(),
    dateLabel: formatVNDate(isoDate),
    shortDate: formatVNShortDate(isoDate),
    badge,
    isToday,
    isTomorrow,
    isFirstWorkout,
    isBeforeStart,
    isPastDay,
    isFutureDay,
    isSaturdayOptional,
    daysFromToday,
    isWeighInDay,
    weighInIndex,
    isUnreportedToday,
    canReportStatus,
    lockReason,
    isWorkoutDay,
    isOverridden: Boolean(dateOverrides[isoDate]),
    sessionId,
    workoutTime,
    preSleepAlertTime,
    sleepTargetTime,
    wakeAlertTime,
    completedSetsCount: prog.completedSetsCount,
    totalSetsCount: prog.totalSetsCount,
    completedExercisesCount: prog.completedExercises,
    totalExercisesCount: prog.totalExercises,
    completedRepsCount: prog.completedRepsCount,
    totalTargetReps: prog.totalTargetReps,
    completionPct: prog.completionPct,
    exercisePct: prog.exercisePct,
    setPct: prog.setPct,
    repPct: prog.repPct,
    minRequiredExercises: prog.minRequiredExercises,
    minRequiredSets: prog.minRequiredSets,
    minRequiredReps: prog.minRequiredReps,
    meetsCompletionThreshold: prog.meetsThreshold,
    totalVolumeKg: prog.totalVolumeKg,
    kcalBurned,
    explicitStatus,
    completedAt: statusRecord?.completedAt || null,
    isCompleted,
    isMissed,
    note,
  };
}

export function buildDynamicWeek(weekOffset: number, opts: ScheduleBuilderOptions = {}) {
  const todayISO = opts.todayISO || getTodayISO();
  const baseMondayISO = getMondayISO(todayISO);
  const targetMondayISO = addDaysISO(baseMondayISO, Number(weekOffset || 0) * 7);
  const targetSundayISO = addDaysISO(targetMondayISO, 6);

  const startDateISO = opts.startDateISO || todayISO;
  const startMondayISO = getMondayISO(startDateISO);
  const weeksSinceStart = Math.floor(diffDaysISO(targetMondayISO, startMondayISO) / 7);
  const programWeekNumber = weeksSinceStart >= 0 ? weeksSinceStart + 1 : 1;
  const cycleWeek = ((programWeekNumber - 1) % 4) + 1;
  const isDeloadWeek = cycleWeek === 4 && weeksSinceStart >= 0;

  let mesocycleTitle = `Tuần ${programWeekNumber} · Tích Lũy & Chuẩn Kỹ Thuật`;
  if (cycleWeek === 2) mesocycleTitle = `Tuần ${programWeekNumber} · Tăng Tải Tuần Tiến (+Tạ/Rep)`;
  else if (cycleWeek === 3) mesocycleTitle = `Tuần ${programWeekNumber} · Đỉnh Khối Lượng Chu Kỳ`;
  else if (isDeloadWeek) mesocycleTitle = `Tuần ${programWeekNumber} · DELOAD Hồi Phục Sụn Khớp`;

  const days: DayScheduleEntry[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(buildDayScheduleEntry(addDaysISO(targetMondayISO, i), opts));
  }

  return {
    weekOffset,
    mondayISO: targetMondayISO,
    sundayISO: targetSundayISO,
    weekRangeLabel: `${formatVNShortDate(targetMondayISO)} – ${formatVNDate(targetSundayISO)}`,
    programWeekNumber,
    cycleWeek,
    isDeloadWeek,
    mesocycleTitle,
    days,
  };
}

export function buildDynamicMonth(monthOffset: number, opts: ScheduleBuilderOptions = {}) {
  const todayISO = opts.todayISO || getTodayISO();
  const todayDt = parseISODate(todayISO);
  const firstOfMonth = new Date(todayDt.getFullYear(), todayDt.getMonth() + Number(monthOffset || 0), 1, 12, 0, 0);
  const year = firstOfMonth.getFullYear();
  const month = firstOfMonth.getMonth();
  const firstISO = formatISODate(firstOfMonth);
  const gridStartMondayISO = getMondayISO(firstISO);

  const cells: Array<{ inCurrentMonth: boolean; entry: DayScheduleEntry }> = [];
  for (let i = 0; i < 42; i++) {
    const dISO = addDaysISO(gridStartMondayISO, i);
    const dt = parseISODate(dISO);
    cells.push({
      inCurrentMonth: dt.getMonth() === month && dt.getFullYear() === year,
      entry: buildDayScheduleEntry(dISO, opts),
    });
  }

  return {
    monthOffset,
    monthTitle: `Tháng ${month + 1} / ${year}`,
    cells,
  };
}

export function buildStreakSummary(opts: ScheduleBuilderOptions = {}) {
  const todayISO = opts.todayISO || getTodayISO();
  const allEntries: DayScheduleEntry[] = [];
  for (let offset = -28; offset <= 7; offset++) {
    allEntries.push(buildDayScheduleEntry(addDaysISO(todayISO, offset), opts));
  }

  const doneDays = allEntries
    .filter((d) => d.isCompleted)
    .sort((a, b) => diffDaysISO(b.isoDate, a.isoDate));
  const missedDays = allEntries
    .filter((d) => d.isMissed)
    .sort((a, b) => diffDaysISO(b.isoDate, a.isoDate));

  let bestStreak = 0;
  let running = 0;
  allEntries.forEach((d) => {
    if (d.isCompleted) {
      running += 1;
      if (running > bestStreak) bestStreak = running;
    } else if (d.isMissed) {
      running = 0;
    }
  });

  let currentStreak = 0;
  const pastOrTodayWorkouts = allEntries.filter(
    (d) => (d.isWorkoutDay || d.isCompleted || d.isMissed) && diffDaysISO(d.isoDate, todayISO) <= 0
  );
  for (let i = pastOrTodayWorkouts.length - 1; i >= 0; i--) {
    const item = pastOrTodayWorkouts[i];
    if (item.isCompleted) currentStreak += 1;
    else if (item.isMissed) break;
  }

  const totalVolumeKg = doneDays.reduce((acc, d) => acc + (d.totalVolumeKg || 0), 0);
  const totalKcalBurned = doneDays.reduce((acc, d) => acc + (d.kcalBurned || 0), 0);
  const totalSetsDone = doneDays.reduce((acc, d) => acc + (d.completedSetsCount || 0), 0);

  const mondayISO = getMondayISO(todayISO);
  const timeline14: DayScheduleEntry[] = [];
  for (let i = 0; i < 14; i++) {
    timeline14.push(buildDayScheduleEntry(addDaysISO(mondayISO, i), opts));
  }

  const nextRestDayForMakeup =
    allEntries.find(
      (d) =>
        diffDaysISO(d.isoDate, opts.startDateISO || todayISO) >= 0 &&
        diffDaysISO(d.isoDate, todayISO) >= 0 &&
        !d.isWorkoutDay &&
        !d.isCompleted
    ) || null;

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    doneCount: doneDays.length,
    missedCount: missedDays.length,
    totalVolumeKg,
    totalKcalBurned,
    totalSetsDone,
    doneDays,
    missedDays,
    timeline14,
    nextRestDayForMakeup,
  };
}

export function generateICSCalendar(scheduleList: DayScheduleEntry[], profile: ProfileInput): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GauGym8D//PersonalCoach//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Gấu Gym 8D — Lịch Tập & Ngủ',
  ];

  for (const day of scheduleList) {
    if (!day.isWorkoutDay) continue;
    const sess = WORKOUT_SESSIONS[day.sessionId as WorkoutSessionId];
    if (!sess) continue;
    const compactDate = day.isoDate.replace(/-/g, '');
    const [wh, wm] = day.workoutTime.split(':').map(Number);
    const endMin = wh * 60 + wm + sess.durationMin;
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;

    lines.push(
      'BEGIN:VEVENT',
      `UID:gym8d-workout-${compactDate}@devtiendang.blog`,
      `DTSTART:${compactDate}T${pad2(wh)}${pad2(wm)}00`,
      `DTEND:${compactDate}T${pad2(eh)}${pad2(em)}00`,
      `SUMMARY:🏋️ ${sess.shortName}`,
      `DESCRIPTION:${sess.targetMuscles} — Uống đủ nước & tích hiệp trên Gấu Gym 8D`,
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Chuẩn bị vào ca tập Gấu Gym 8D',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  const firstDay = scheduleList[0]?.isoDate || getTodayISO();
  const weighCompact = firstDay.replace(/-/g, '');
  const intervalWeeks = Number(profile.daysPerWeek) === 14 ? 2 : 1;
  lines.push(
    'BEGIN:VEVENT',
    `UID:gym8d-weighin-${weighCompact}@devtiendang.blog`,
    `DTSTART:${weighCompact}T063000`,
    `DTEND:${weighCompact}T064000`,
    `RRULE:FREQ=WEEKLY;INTERVAL=${intervalWeeks}`,
    'SUMMARY:⚖️ Cân Định Kỳ Buổi Sáng — Gấu Gym 8D',
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Bước lên cân lúc bụng rỗng và cập nhật biểu đồ',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );
  return lines.join('\r\n');
}
