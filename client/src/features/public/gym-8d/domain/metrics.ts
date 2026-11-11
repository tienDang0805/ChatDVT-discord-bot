import { DEFAULT_USER_PROFILE } from '../data/workouts';
import type { ProfileInput, WeightLogEntry } from '../types/gym';
import { addDaysISO, diffDaysISO, formatVNShortDate, getTodayISO, minutesToHHMM, parseHHMM } from './dateUtils';

export interface CircadianTimelineItem {
  time: string;
  title: string;
  detail: string;
  mascot: string;
  highlight?: boolean;
}

export interface CircadianSchedule {
  wakeTime: string;
  sleepTime: string;
  bedPrepTime: string;
  preWorkoutMealTime: string;
  postWorkoutMealTime: string;
  caffeineCutoffTime: string;
  timelineItems: CircadianTimelineItem[];
}

export interface MealSlotPlan {
  time: string;
  slot: string;
  kcal: number;
  proteinG: number;
  suggestion: string;
}

export interface CalculatedMetrics {
  profile: ProfileInput;
  bmi: number;
  bmiCategory: string;
  bmiBadgeColor: 'green' | 'amber' | 'orange' | 'red';
  lbm: number;
  bodyFatPct: number;
  ibw: number;
  adjustedWeight: number;
  bmr: number;
  tdee: number;
  targetKcal: number;
  calorieDelta: number;
  weeklyRateKg: number;
  weeksToGoal: number;
  proteinG: number;
  proteinRuleNote: string;
  fatG: number;
  carbG: number;
  waterMl: number;
  waterLiters: number;
  zone2Min: number;
  zone2Max: number;
  jointSafeMode: boolean;
  circadianSchedule: CircadianSchedule;
  dynamicMealPlan: MealSlotPlan[];
}

export function buildCircadianSchedule(
  workoutTimeStr: string,
  waterMl: number,
  targetKcal: number,
  proteinG: number,
  preSleepLeadMin: number
): CircadianSchedule {
  const wkMin = parseHHMM(workoutTimeStr);
  const isMorning = wkMin <= 9 * 60;
  const wakeMin = isMorning ? wkMin - 45 : 6 * 60 + 30;
  const sleepMin = wakeMin - 7.5 * 60;
  const leadMin = Math.max(15, Math.min(90, Number(preSleepLeadMin) || 30));
  const bedPrepMin = sleepMin - leadMin;
  const preMealMin = isMorning ? wkMin - 35 : wkMin - 75;
  const postMealMin = wkMin + 75;
  const caffeineCutoffMin = sleepMin - 8 * 60;

  const wakeTime = minutesToHHMM(wakeMin);
  const sleepTime = minutesToHHMM(sleepMin);
  const bedPrepTime = minutesToHHMM(bedPrepMin);
  const preWorkoutMealTime = minutesToHHMM(preMealMin);
  const postWorkoutMealTime = minutesToHHMM(postMealMin);
  const caffeineCutoffTime = minutesToHHMM(caffeineCutoffMin);

  const timelineItems: CircadianTimelineItem[] = [
    {
      time: wakeTime,
      title: 'Thức dậy · Uống 400ml nước ấm',
      detail: 'Đi lại nhẹ nhàng xả áp lực đĩa đệm cột sống trước khi tập tạ.',
      mascot: 'morningBananaCoffee',
    },
    {
      time: preWorkoutMealTime,
      title: 'Nạp năng lượng trước tập',
      detail: '1 quả chuối chín + Cafe đen không đường hoặc 1/2 muỗng Whey.',
      mascot: 'morningBananaCoffee',
    },
    {
      time: minutesToHHMM(wkMin),
      title: 'Ca Tập Chính (55 phút)',
      detail: 'Khởi động kỹ khớp vai/gối 5p · Tập 5 bài chính + 12p Đi bộ dốc Zone 2.',
      mascot: 'benchPress',
      highlight: true,
    },
    {
      time: postWorkoutMealTime,
      title: `Bữa phục hồi cơ (~${Math.round(proteinG * 0.3)}g Đạm)`,
      detail: 'Nạp ngay Whey + Phở bò tái nạc / Cơm ức gà để tổng hợp cơ bắp.',
      mascot: 'nutritionVn',
    },
    {
      time: caffeineCutoffTime,
      title: 'Ngưng trà đậm & Cafein',
      detail: `Uống đủ ${Number((waterMl / 1000).toFixed(1))}L nước rải đều tới 19:30 (${targetKcal} kcal/ngày).`,
      mascot: 'restHydration',
    },
    {
      time: bedPrepTime,
      title: `Chuông nhắc chuẩn bị đi ngủ (Trước ${leadMin}p)`,
      detail: `Soạn sẵn đồ tập sáng mai, tắt màn hình xanh để lên giường lúc ${sleepTime}.`,
      mascot: 'sleep6am',
      highlight: true,
    },
  ];

  return {
    wakeTime,
    sleepTime,
    bedPrepTime,
    preWorkoutMealTime,
    postWorkoutMealTime,
    caffeineCutoffTime,
    timelineItems,
  };
}

export function calculateMetrics(input?: Partial<ProfileInput>): CalculatedMetrics {
  const p: ProfileInput = {
    ...(DEFAULT_USER_PROFILE as unknown as ProfileInput),
    ...(input || {}),
  };
  const gender = p.gender === 'female' ? 'female' : 'male';
  const age = Math.max(14, Math.min(80, Number(p.age) || 27));
  const heightCm = Math.max(140, Math.min(215, Number(p.heightCm) || 182));
  const weightKg = Math.max(35, Math.min(200, Number(p.weightKg) || 115));
  const targetWeightKg = Math.max(35, Math.min(180, Number(p.targetWeightKg) || 95));
  const activity = Math.max(1.2, Math.min(1.9, Number(p.activity) || 1.375));
  const goal = ['cut', 'recomp', 'bulk'].includes(p.goal) ? p.goal : 'cut';
  const workoutTime = p.workoutTime || '06:00';
  const preSleepLeadMin = Math.max(15, Math.min(90, Number(p.preSleepLeadMin) || 30));

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Bình thường (Chuẩn Châu Á)';
  let bmiBadgeColor: CalculatedMetrics['bmiBadgeColor'] = 'green';
  if (bmi < 18.5) {
    bmiCategory = 'Thiếu cân';
    bmiBadgeColor = 'amber';
  } else if (bmi >= 30) {
    bmiCategory = 'Béo phì độ II · Ưu tiên bảo vệ khớp';
    bmiBadgeColor = 'red';
  } else if (bmi >= 25) {
    bmiCategory = 'Béo phì độ I (Châu Á)';
    bmiBadgeColor = 'orange';
  } else if (bmi >= 23) {
    bmiCategory = 'Thừa cân nhẹ';
    bmiBadgeColor = 'amber';
  }

  const rawLbm =
    gender === 'male'
      ? 0.407 * weightKg + 0.267 * heightCm - 19.2
      : 0.252 * weightKg + 0.473 * heightCm - 48.3;
  const lbm = Number(Math.max(weightKg * 0.48, Math.min(weightKg * 0.88, rawLbm)).toFixed(1));
  const bodyFatPct = Number(Math.max(8, Math.min(52, ((weightKg - lbm) / weightKg) * 100)).toFixed(1));

  const ibw = Number((22.5 * heightM * heightM).toFixed(1));
  const adjustedWeight = Number((weightKg > ibw * 1.2 ? ibw + 0.35 * (weightKg - ibw) : weightKg).toFixed(1));

  const bmr = Math.round(
    10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161)
  );
  const tdee = Math.round(bmr * activity);

  let targetKcal = tdee;
  if (goal === 'cut') {
    const deficit = bmi >= 30 ? 750 : 550;
    targetKcal = Math.max(gender === 'male' ? 1750 : 1400, Math.round((tdee - deficit) / 10) * 10);
  } else if (goal === 'bulk') {
    targetKcal = Math.round((tdee + 280) / 10) * 10;
  }

  const calorieDelta = targetKcal - tdee;
  const weeklyRateKg = Number(((calorieDelta * 7) / 7700).toFixed(2));
  const weightDiff = Math.abs(weightKg - targetWeightKg);
  const weeksToGoal =
    Math.abs(weeklyRateKg) > 0.05 ? Math.max(1, Math.ceil(weightDiff / Math.abs(weeklyRateKg))) : 0;

  const proteinG = Math.round((lbm * (goal === 'cut' ? 2.3 : 2.0)) / 5) * 5;
  const proteinRuleNote = `Tính theo ${lbm}kg cơ nạc (LBM × ${goal === 'cut' ? '2.3' : '2.0'}g) chống mất cơ khi giảm mỡ.`;

  const minFat = gender === 'male' ? 55 : 45;
  const fatG = Math.max(minFat, Math.round((adjustedWeight * 0.75) / 2) * 2);
  const remainingKcal = Math.max(240, targetKcal - proteinG * 4 - fatG * 9);
  const carbG = Math.round(remainingKcal / 4);

  const waterMl = Math.round((adjustedWeight * 35 + 500) / 100) * 100;
  const waterLiters = Number((waterMl / 1000).toFixed(1));

  const maxHr = 220 - age;
  const zone2Min = Math.round(maxHr * 0.63);
  const zone2Max = Math.round(maxHr * 0.74);
  const jointSafeMode = bmi >= 28 || (gender === 'male' && weightKg >= 95);

  const circadianSchedule = buildCircadianSchedule(
    workoutTime,
    waterMl,
    targetKcal,
    proteinG,
    preSleepLeadMin
  );

  const wkMin = parseHHMM(workoutTime);
  const dynamicMealPlan: MealSlotPlan[] = [
    {
      time: circadianSchedule.preWorkoutMealTime,
      slot: 'Bữa 1 · Trước tập',
      kcal: Math.round(targetKcal * 0.1),
      proteinG: Math.round(proteinG * 0.1),
      suggestion: '1 quả chuối chín + Cafe đen không đường (hoặc 1/2 muỗng Whey Isolate).',
    },
    {
      time: circadianSchedule.postWorkoutMealTime,
      slot: 'Bữa 2 · Sau tập (Sáng)',
      kcal: Math.round(targetKcal * 0.28),
      proteinG: Math.round(proteinG * 0.3),
      suggestion: '1 muỗng Whey + Phở bò tái nạc (bớt bánh) hoặc 3 trứng + Bánh mì đen.',
    },
    {
      time: minutesToHHMM(Math.max(wkMin + 330, 12 * 60)),
      slot: 'Bữa 3 · Bữa trưa',
      kcal: Math.round(targetKcal * 0.3),
      proteinG: Math.round(proteinG * 0.3),
      suggestion: '1 bát cơm vừa + 200g ức gà / thăn bò / cá áp chảo + 1 đĩa rau luộc lớn.',
    },
    {
      time: '16:15',
      slot: 'Bữa 4 · Bữa phụ chiều',
      kcal: Math.round(targetKcal * 0.1),
      proteinG: Math.round(proteinG * 0.12),
      suggestion: '1 hộp sữa chua Hy Lạp không đường + 1 quả ổi / táo xanh.',
    },
    {
      time: '19:00',
      slot: 'Bữa 5 · Bữa tối gọn nhẹ',
      kcal: Math.round(targetKcal * 0.22),
      proteinG: Math.round(proteinG * 0.18),
      suggestion: '200g cá hồi / ức gà / đậu hũ + canh rau xanh, giảm 50% tinh bột buổi tối.',
    },
  ];

  return {
    profile: {
      ...p,
      gender,
      age,
      heightCm,
      weightKg,
      targetWeightKg,
      activity,
      goal: goal as ProfileInput['goal'],
      workoutTime,
      preSleepLeadMin,
    },
    bmi,
    bmiCategory,
    bmiBadgeColor,
    lbm,
    bodyFatPct,
    ibw,
    adjustedWeight,
    bmr,
    tdee,
    targetKcal,
    calorieDelta,
    weeklyRateKg,
    weeksToGoal,
    proteinG,
    proteinRuleNote,
    fatG,
    carbG,
    waterMl,
    waterLiters,
    zone2Min,
    zone2Max,
    jointSafeMode,
    circadianSchedule,
    dynamicMealPlan,
  };
}

export function calculatePlates(totalKg: number, barKg = 20): {
  barKg: number;
  perSideKg: number;
  platesPerSide: Array<{ weight: number; count: number }>;
} {
  const bar = Number(barKg) || 20;
  const target = Math.max(bar, Number(totalKg) || bar);
  let rem = Number(((target - bar) / 2).toFixed(2));
  const denominations = [20, 15, 10, 5, 2.5, 1.25];
  const platesPerSide: Array<{ weight: number; count: number }> = [];

  for (const d of denominations) {
    if (rem >= d - 0.01) {
      const count = Math.floor((rem + 0.01) / d);
      platesPerSide.push({ weight: d, count });
      rem = Number((rem - count * d).toFixed(2));
    }
  }

  return {
    barKg: bar,
    perSideKg: Number(((target - bar) / 2).toFixed(2)),
    platesPerSide,
  };
}

export function buildWeightTrackerSummary(options: {
  todayISO?: string;
  startDateISO?: string;
  weighInIntervalDays?: number;
  initialWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  weeklyRateKg: number;
  weightLogs: WeightLogEntry[];
}) {
  const todayISO = options.todayISO || getTodayISO();
  const intervalDays = Number(options.weighInIntervalDays) === 14 ? 14 : 7;
  const targetWeight = Number(options.targetWeightKg || 95);

  const normalized = (options.weightLogs || [])
    .filter((l) => l && l.isoDate && Number(l.weight) > 0)
    .sort((a, b) => diffDaysISO(a.isoDate, b.isoDate));

  const effectiveLogs: WeightLogEntry[] =
    normalized.length > 0
      ? normalized
      : [
          {
            isoDate: todayISO,
            dateLabel: formatVNShortDate(todayISO),
            weight: options.currentWeightKg,
            note: 'Cân nặng khởi điểm',
          },
        ];

  const firstLog = effectiveLogs[0];
  const latestLog = effectiveLogs[effectiveLogs.length - 1];
  const deltaFromStart = Number((latestLog.weight - firstLog.weight).toFixed(1));
  const remainingToGoal = Number(Math.abs(targetWeight - latestLog.weight).toFixed(1));
  const totalSpan = Math.max(0.5, Math.abs(targetWeight - firstLog.weight));
  const achievedSpan = Math.max(0, firstLog.weight - latestLog.weight);
  const progressPct = Math.min(100, Math.round((achievedSpan / totalSpan) * 100));

  const daysSinceLastLog = Math.max(0, diffDaysISO(todayISO, latestLog.isoDate));
  const nextWeighInISO = addDaysISO(latestLog.isoDate, intervalDays);
  const daysUntilNextWeighIn = Math.max(0, diffDaysISO(nextWeighInISO, todayISO));
  const hasLoggedToday = normalized.some((l) => l.isoDate === todayISO);
  const isWeighInDueToday = !hasLoggedToday && (daysUntilNextWeighIn === 0 || daysSinceLastLog >= intervalDays);

  return {
    effectiveLogs,
    firstWeightKg: firstLog.weight,
    latestWeightKg: latestLog.weight,
    targetWeightKg: targetWeight,
    deltaFromStart,
    remainingToGoal,
    progressPct,
    nextWeighInISO,
    nextWeighInShort: formatVNShortDate(nextWeighInISO),
    daysUntilNextWeighIn,
    hasLoggedToday,
    isWeighInDueToday,
  };
}
