import { COURSE_SKELETON } from './courseGenerator';

const STORAGE_KEY = 'eng_course_state';

export interface CourseState {
  unlockedUnits: string[];
  completedUnits: string[];
}

export const getCourseState = (): CourseState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    unlockedUnits: [COURSE_SKELETON[0]?.id || 'unit_1'],
    completedUnits: [],
  };
};

export const saveCourseState = (state: CourseState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const completeUnitAndUnlockNext = (currentUnitId: string) => {
  const state = getCourseState();
  if (!state.completedUnits.includes(currentUnitId)) {
    state.completedUnits.push(currentUnitId);
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
