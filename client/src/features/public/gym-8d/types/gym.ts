export type SessionId = 'press_day' | 'pull_day' | 'legs_day' | 'upper_day' | 'rest';
export type WorkoutSessionId = Exclude<SessionId, 'rest'>;
export type GymBranchId = 'all' | 'tng_uvk' | 'ways_ql13';
export type EffortKey = 'warmup' | 'easy' | 'good' | 'hard' | 'max';
export type ActiveTabId = 'coach' | 'schedule' | 'workout' | 'streak' | 'nutrition' | 'profile' | 'settings';

export interface SetEntry {
  type: string;
  prev: string;
  weight: number;
  reps: number;
  effort?: EffortKey | string;
  done: boolean;
}

export interface ExerciseDef {
  id: string;
  name: string;
  shortName: string;
  muscle: string;
  equipment: string;
  mascot: string;
  tier: string;
  priorityRank: number;
  repRange: [number, number] | number[];
  defaultRestSec: number;
  usesBarbell: boolean;
  jointSafe: boolean;
  angleCue: string;
  tempoCue: string;
  whyItWorks: string;
  formSteps: string[];
  cues: string;
  mistake: string;
  swapOptions: string[];
  swapReason: string;
  videoUrl: string;
  videoId: string;
  videoAuthor: string;
  videoTitle: string;
  defaultSets: SetEntry[];
  progressionBadge: string;
  slotGroup: string;
  availableGyms: string[];
  machineBrand: string;
  gymSetup: Record<string, string>;
  zoneCategory: string;
  zoneLabel: string;
}

export interface WorkoutSessionDef {
  id: WorkoutSessionId;
  code: string;
  calendarLabel: string;
  focusShort: string;
  shortName: string;
  title: string;
  subtitle: string;
  durationMin: number;
  mascot: string;
  targetMuscles: string;
  sessionRationale: string;
  exerciseIds: string[];
}

export interface WorkoutSplitDef {
  id: string;
  name: string;
  badge: string;
  daysPerWeek: number;
  description: string;
  sessions: Array<{
    id: string;
    title: string;
    durationMin: number;
    mascot: string;
    exerciseIds: string[];
  }>;
}

export interface GymBranchZone {
  zoneName: string;
  machines: string[];
}

export interface GymBranch {
  id: GymBranchId;
  shortName: string;
  badge: string;
  name: string;
  address: string;
  hours: string;
  highlights: string[];
  zones: GymBranchZone[];
}

export interface GymSessionPreset {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  sessions: Record<string, string[]>;
}

export interface FoodCategoryDef {
  id: string;
  label: string;
  shortLabel: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  mealTag: string;
  giLevel: string;
  portion: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  fiber: number;
  tip: string;
}

export interface CustomMacroItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

export interface ProfileInput {
  id?: string;
  label?: string;
  shortLabel?: string;
  name?: string;
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activity: number;
  goal: 'cut' | 'recomp' | 'bulk';
  workoutTime: string;
  preSleepLeadMin: number;
  daysPerWeek: number;
  barbellWeightKg?: number;
}

export interface WeightLogEntry {
  isoDate: string;
  dateLabel: string;
  weight: number;
  note: string;
}

export interface WeekdayRule {
  sessionId: SessionId;
  workoutTime: string;
  isOptionalDay?: boolean;
}

export interface DayStatusRecord {
  status: 'done' | 'missed';
  sessionId: SessionId;
  completedAt?: string | null;
  updatedAt?: string;
}

export interface PushPrefs {
  masterEnabled: boolean;
  sleepReminder: boolean;
  morningWake: boolean;
  streakGuard: boolean;
  weighInReminder: boolean;
  restTimerPush: boolean;
}

export interface PreviousExercisePerf {
  lastDateISO: string;
  lastDateShort: string;
  sets: SetEntry[];
  bestWeight: number;
  bestReps: number;
  bestE1RM: number;
  suggestBumpKg: number;
  suggestReason: string | null;
}

export interface PersonalRecordEntry {
  exerciseId: string;
  exerciseName: string;
  mascot: string;
  slotGroup: string;
  maxWeight: number;
  repsAtMaxWeight: number;
  maxWeightDateShort: string;
  bestE1RM: number;
  totalDoneSetsAllTime: number;
}

export interface SessionProgressSummary {
  totalExercises: number;
  completedExercises: number;
  totalSetsCount: number;
  completedSetsCount: number;
  totalTargetReps: number;
  completedRepsCount: number;
  totalVolumeKg: number;
  exercisePct: number;
  setPct: number;
  repPct: number;
  completionPct: number;
  minRequiredPct: number;
  minRequiredExercises: number;
  minRequiredSets: number;
  minRequiredReps: number;
  meetsThreshold: boolean;
}

export interface DayScheduleEntry {
  id: string;
  isoDate: string;
  dayOfWeek: number;
  dayShort: string;
  dayNumber: number;
  dateLabel: string;
  shortDate: string;
  badge: string;
  isToday: boolean;
  isTomorrow: boolean;
  isFirstWorkout: boolean;
  isBeforeStart: boolean;
  isPastDay: boolean;
  isFutureDay: boolean;
  isSaturdayOptional: boolean;
  daysFromToday: number;
  isWeighInDay: boolean;
  weighInIndex: number | null;
  isUnreportedToday: boolean;
  canReportStatus: boolean;
  lockReason: string | null;
  isWorkoutDay: boolean;
  isOverridden: boolean;
  sessionId: SessionId;
  workoutTime: string;
  preSleepAlertTime: string;
  sleepTargetTime: string;
  wakeAlertTime: string;
  completedSetsCount: number;
  totalSetsCount: number;
  completedExercisesCount: number;
  totalExercisesCount: number;
  completedRepsCount: number;
  totalTargetReps: number;
  completionPct: number;
  exercisePct: number;
  setPct: number;
  repPct: number;
  minRequiredExercises: number;
  minRequiredSets: number;
  minRequiredReps: number;
  meetsCompletionThreshold: boolean;
  totalVolumeKg: number;
  kcalBurned: number;
  explicitStatus: 'done' | 'missed' | null;
  completedAt: string | null;
  isCompleted: boolean;
  isMissed: boolean;
  note: string;
}

export type UltraModelChoice =
  | 'gemini-4-carbon-high'
  | 'gemini-3.8-flash-high'
  | 'gemini-4-argon-high'
  | 'free';

export interface AgentSelfAudit {
  passed: boolean;
  safetyCheck: string;
  estimateNote?: string;
  habitCheck?: string;
  autoAdjustments?: string[];
  engineLabel?: string;
}

export type AgentActionProposal =
  | {
      type: 'add_food_catalog';
      dateISO: string;
      foodId: string;
      servings: number;
      labelSummary: string;
    }
  | {
      type: 'add_custom_food';
      dateISO: string;
      name: string;
      kcal: number;
      protein: number;
      carb: number;
      fat: number;
      labelSummary: string;
    }
  | {
      type: 'add_water';
      dateISO: string;
      amountMl: number;
      labelSummary: string;
    }
  | {
      type: 'set_water';
      dateISO: string;
      waterMl: number;
      labelSummary: string;
    }
  | {
      type: 'remove_food_item';
      dateISO: string;
      foodId?: string;
      customNameMatch?: string;
      labelSummary: string;
    }
  | {
      type: 'replace_day_nutrition';
      dateISO: string;
      items: Array<{
        name: string;
        kcal: number;
        protein: number;
        carb: number;
        fat: number;
      }>;
      waterMl?: number;
      labelSummary: string;
    }
  | {
      type: 'swap_exercise';
      sessionId: WorkoutSessionId;
      fromExId: string;
      toExId: string;
      labelSummary: string;
    }
  | {
      type: 'set_session_exercises';
      sessionId: WorkoutSessionId;
      exerciseIds: string[];
      labelSummary: string;
    }
  | {
      type: 'log_exercise_sets';
      dateISO: string;
      sessionId: WorkoutSessionId;
      exId: string;
      weightKg: number;
      reps: number;
      setsCount: number;
      effort?: EffortKey;
      labelSummary: string;
    }
  | {
      type: 'adjust_exercise_sets';
      dateISO: string;
      sessionId: WorkoutSessionId;
      exId: string;
      newWeightKg: number;
      newReps: number;
      setsCount?: number;
      loggedHeavySet?: { weightKg: number; reps: number };
      labelSummary: string;
    }
  | {
      type: 'set_day_status';
      dateISO: string;
      status: 'done' | 'off' | 'missed' | 'clear';
      sessionId?: WorkoutSessionId;
      note?: string;
      labelSummary: string;
    }
  | {
      type: 'clear_workout_logs';
      scope: 'all' | 'date';
      dateISO?: string;
      labelSummary: string;
    }
  | {
      type: 'clear_nutrition_logs';
      scope: 'all' | 'date';
      dateISO?: string;
      labelSummary: string;
    }
  | {
      type: 'reschedule_day';
      dateISO: string;
      sessionId: SessionId;
      workoutTime?: string;
      scope?: 'single' | 'recurring';
      labelSummary: string;
    }
  | {
      type: 'set_weekly_split';
      days: Record<string, { sessionId: SessionId; workoutTime?: string }>;
      labelSummary: string;
    }
  | {
      type: 'update_strategy';
      goal: 'cut' | 'recomp' | 'bulk';
      targetWeightKg?: number;
      workoutTime?: string;
      labelSummary: string;
    }
  | {
      type: 'log_weight';
      weightKg: number;
      labelSummary: string;
    };

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  proposals?: AgentActionProposal[];
  selectedIndices?: number[];
  applied?: boolean;
  undone?: boolean;
  quickReplies?: string[];
  selfAudit?: AgentSelfAudit | null;
}

export interface GymStateV10 {
  schemaVersion: number;
  updatedAt: string;
  syncCode: string;
  lastSyncedAt: string | null;
  hasOnboarded: boolean;
  installBannerDismissed: boolean;
  profileInput: ProfileInput;
  startDateISO: string;
  weeklyPattern: Record<number, WeekdayRule>;
  dateOverrides: Record<string, Partial<WeekdayRule>>;
  logsByDate: Record<string, Record<string, SetEntry[]>>;
  dayStatusByDate: Record<string, DayStatusRecord>;
  dayNotesByDate: Record<string, string>;
  agentAutoApply: boolean;
  agentMessages?: AgentChatMessage[];
  activeSessionId: WorkoutSessionId;
  sessionSwaps: Record<string, string>;
  waterByDate: Record<string, number>;
  foodsByDate: Record<string, string[]>;
  foodServingsByDate: Record<string, Record<string, number>>;
  customMacrosByDate: Record<string, CustomMacroItem[]>;
  preSleepAlertEnabled: boolean;
  pushPrefs: PushPrefs;
  icsInstalledAt: string | null;
  weighInIntervalDays: 7 | 14;
  weightLogs: WeightLogEntry[];
  selectedGymId: GymBranchId;
  customSessionLists: Record<string, string[]>;
  activePresetBySession: Record<string, string>;
}
