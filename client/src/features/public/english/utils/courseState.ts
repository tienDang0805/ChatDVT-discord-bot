import { COURSE_SKELETON } from './courseGenerator';

const STORAGE_KEY = 'eng_course_state';

export interface WrongAnswer {
  section: 'vocab' | 'reading_tf' | 'reading_mc' | 'grammar';
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface UnitProgress {
  vocabDone: boolean;
  readingDone: boolean;
  grammarDone: boolean;
  conversationRead: boolean;
  writingDone: boolean;
  wrongAnswers: WrongAnswer[];
  vocabCorrect: number;
  vocabTotal: number;
  readingCorrect: number;
  readingTotal: number;
  grammarCorrect: number;
  grammarTotal: number;
}

export interface CourseState {
  unlockedUnits: string[];
  completedUnits: string[];
  unitProgress: Record<string, UnitProgress>;
  completedAt: Record<string, number>;
}

const DEFAULT_UNIT_PROGRESS: UnitProgress = {
  vocabDone: false, readingDone: false, grammarDone: false,
  conversationRead: false, writingDone: false, wrongAnswers: [],
  vocabCorrect: 0, vocabTotal: 0, readingCorrect: 0, readingTotal: 0,
  grammarCorrect: 0, grammarTotal: 0,
};

export const getCourseState = (): CourseState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { unlockedUnits: parsed.unlockedUnits || [COURSE_SKELETON[0]?.id || 'unit_1'], completedUnits: parsed.completedUnits || [], unitProgress: parsed.unitProgress || {}, completedAt: parsed.completedAt || {} };
    }
  } catch {}
  return {
    unlockedUnits: [COURSE_SKELETON[0]?.id || 'unit_1'],
    completedUnits: [],
    unitProgress: {},
    completedAt: {},
  };
};

export const saveCourseState = (state: CourseState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getUnitProgress = (unitId: string): UnitProgress => {
  const state = getCourseState();
  return state.unitProgress[unitId] || { ...DEFAULT_UNIT_PROGRESS };
};

export const saveUnitProgress = (unitId: string, progress: Partial<UnitProgress>) => {
  const state = getCourseState();
  state.unitProgress[unitId] = { ...(state.unitProgress[unitId] || { ...DEFAULT_UNIT_PROGRESS }), ...progress };
  saveCourseState(state);
};

export const addWrongAnswer = (unitId: string, wrong: WrongAnswer) => {
  const state = getCourseState();
  const up = state.unitProgress[unitId] || { ...DEFAULT_UNIT_PROGRESS };
  up.wrongAnswers.push(wrong);
  state.unitProgress[unitId] = up;
  saveCourseState(state);
};

export const completeUnitAndUnlockNext = (currentUnitId: string) => {
  const state = getCourseState();
  if (!state.completedUnits.includes(currentUnitId)) {
    state.completedUnits.push(currentUnitId);
    if (!state.completedAt) state.completedAt = {};
    state.completedAt[currentUnitId] = Date.now();
  }
  
  const currentIndex = COURSE_SKELETON.findIndex(u => u.id === currentUnitId);
  if (currentIndex >= 0 && currentIndex < COURSE_SKELETON.length - 1) {
    const nextUnitId = COURSE_SKELETON[currentIndex + 1].id;
    if (!state.unlockedUnits.includes(nextUnitId)) {
      state.unlockedUnits.push(nextUnitId);
    }
  }
  saveCourseState(state);
};

