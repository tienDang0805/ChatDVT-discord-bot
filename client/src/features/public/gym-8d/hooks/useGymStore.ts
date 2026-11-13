import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EXERCISES } from '../data/exercises';
import { VN_FOODS } from '../data/foods';
import { GYM_SESSION_PRESETS } from '../data/gyms';
import { SESSION_ALLOWED_SLOT_GROUPS, WORKOUT_SESSIONS } from '../data/workouts';
import { addDaysISO, diffDaysISO, formatVNShortDate, getTodayISO, parseISODate } from '../domain/dateUtils';
import { buildWeightTrackerSummary, calculateMetrics } from '../domain/metrics';
import {
  checkSetBeatsHistoricalPR,
  computePersonalRecords,
  getEffectiveSessionExerciseIds,
  getEffectiveSetsForDay,
} from '../domain/overload';
import {
  buildDayScheduleEntry,
  buildDynamicMonth,
  buildDynamicWeek,
  buildStreakSummary,
  calculateSessionCompletion,
  resolveBestLoggedSession,
} from '../domain/schedule';
import {
  CANONICAL_STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  DEVICE_SYNC_CODE_STORAGE_KEY,
  countStateActivityScore,
  createFreshDefaultState,
  generateRandomSyncCode,
  loadAndMigrateLocalState,
  mergeGymStates,
  migrateRawState,
  normalizeSyncCode,
  saveLocalStateSafely,
} from '../domain/storage';
import type {
  AgentActionProposal,
  AgentChatMessage,
  CoachPersonaId,
  CustomMacroItem,
  GymBranchId,
  GymStateV10,
  ProfileInput,
  PushPrefs,
  SessionId,
  SetEntry,
  WeekdayRule,
  WorkoutSessionId,
} from '../types/gym';
import { playGymChime } from './useWallClockRestTimer';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline';

export interface OnboardingSetupPayload {
  name: string;
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: 'cut' | 'recomp' | 'bulk';
  workoutTime: string;
  coachPersona: CoachPersonaId;
  customSyncCode?: string;
}

export interface ToastBanner {
  title: string;
  body: string;
  tone?: 'orange' | 'green' | 'gold';
}

export function useGymStore() {
  const todayISO = useMemo(() => getTodayISO(), []);
  const tomorrowISO = useMemo(() => addDaysISO(todayISO, 1), [todayISO]);

  const [state, setState] = useState<GymStateV10>(() => loadAndMigrateLocalState(todayISO));
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO);
  const [nutritionDateISO, setNutritionDateISO] = useState<string>(todayISO);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('idle');
  const [toast, setToast] = useState<ToastBanner | null>(null);

  const latestStateRef = useRef<GymStateV10>(state);
  latestStateRef.current = state;
  const initialCloudDoneRef = useRef(false);
  const suppressNextAutoPushRef = useRef(false);

  const showToast = useCallback((title: string, body: string, tone: ToastBanner['tone'] = 'orange') => {
    setToast({ title, body, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const updateState = useCallback((updater: (prev: GymStateV10) => GymStateV10) => {
    setState((prev) => {
      const next = {
        ...updater(prev),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
      };
      latestStateRef.current = next;
      saveLocalStateSafely(next);
      return next;
    });
  }, []);

  const setAgentMessages = useCallback(
    (updater: AgentChatMessage[] | ((prev: AgentChatMessage[]) => AgentChatMessage[])) => {
      updateState((prev) => {
        const cur = prev.agentMessages || [];
        const nextMsgs = typeof updater === 'function' ? updater(cur) : updater;
        return { ...prev, agentMessages: nextMsgs.slice(-28) };
      });
    },
    [updateState]
  );

  const restoreSnapshot = useCallback(
    (snapshot: GymStateV10, preserveMessages?: AgentChatMessage[]) => {
      const restored: GymStateV10 = {
        ...snapshot,
        agentMessages: preserveMessages ?? latestStateRef.current.agentMessages ?? snapshot.agentMessages ?? [],
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
      };
      latestStateRef.current = restored;
      saveLocalStateSafely(restored);
      setState(restored);
      showToast('Đã hoàn tác thay đổi', 'Dữ liệu đã khôi phục về trạng thái trước khi áp dụng.', 'orange');
    },
    [showToast]
  );

  const pushToCloud = useCallback(
    async (snapshot?: GymStateV10, targetCode?: string, notify = false, forceOverwrite = false) => {
      if (typeof window === 'undefined' || window.location.protocol === 'file:') {
        setSyncStatus('offline');
        return false;
      }
      const payloadState = snapshot || latestStateRef.current;
      const cleanCode = normalizeSyncCode(targetCode || payloadState.syncCode);
      try {
        setSyncStatus('syncing');
        const res = await fetch('/api/gym8d/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: cleanCode,
            schemaVersion: CURRENT_SCHEMA_VERSION,
            forceOverwrite,
            data: payloadState,
          }),
          keepalive: true,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        const hhmm = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
        setSyncStatus('synced');
        setState((prev) => {
          const base =
            body?.mergedData &&
            !forceOverwrite &&
            countStateActivityScore(body.mergedData) > countStateActivityScore(prev)
              ? migrateRawState(body.mergedData, todayISO) || prev
              : prev;
          const updated = { ...base, lastSyncedAt: hhmm };
          saveLocalStateSafely(updated);
          return updated;
        });
        if (notify) {
          showToast(`Đã lưu đồng bộ (${cleanCode})`, `Cập nhật lên máy chủ lúc ${hhmm}.`, 'green');
        }
        return true;
      } catch {
        setSyncStatus('offline');
        if (notify) {
          showToast('Đã lưu trên thiết bị', 'Khi có kết nối mạng, ứng dụng sẽ tự động đồng bộ.', 'orange');
        }
        return false;
      }
    },
    [showToast, todayISO]
  );

  const pullFromCloud = useCallback(
    async (targetCode?: string, notify = false, replaceLocalIfDifferentCode = false) => {
      if (typeof window === 'undefined' || window.location.protocol === 'file:') {
        initialCloudDoneRef.current = true;
        setSyncStatus('offline');
        return false;
      }
      const cleanCode = normalizeSyncCode(targetCode || latestStateRef.current.syncCode);
      try {
        setSyncStatus('syncing');
        const res = await fetch(`/api/gym8d/load/${encodeURIComponent(cleanCode)}`, { cache: 'no-store' });
        if (res.status === 404) {
          initialCloudDoneRef.current = true;
          await pushToCloud({ ...latestStateRef.current, syncCode: cleanCode }, cleanCode, false, true);
          if (notify) {
            showToast(`Khởi tạo mã ${cleanCode}`, 'Đã lưu dữ liệu hiện tại lên máy chủ.', 'green');
          }
          return true;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        if (payload?.data) {
          const localSnap = latestStateRef.current;
          const merged = replaceLocalIfDifferentCode
            ? migrateRawState(payload.data, todayISO) || mergeGymStates(localSnap, payload.data, todayISO)
            : mergeGymStates(localSnap, payload.data, todayISO);
          const hhmm = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
          const withStamp: GymStateV10 = {
            ...merged,
            hasOnboarded: true,
            syncCode: cleanCode,
            lastSyncedAt: hhmm,
          };
          try {
            localStorage.setItem(DEVICE_SYNC_CODE_STORAGE_KEY, cleanCode);
          } catch {}
          suppressNextAutoPushRef.current = true;
          latestStateRef.current = withStamp;
          saveLocalStateSafely(withStamp);
          setState(withStamp);
          initialCloudDoneRef.current = true;
          setSyncStatus('synced');
          if (!replaceLocalIfDifferentCode && countStateActivityScore(localSnap) > countStateActivityScore(payload.data)) {
            await pushToCloud(withStamp, cleanCode, false, true);
          }
          if (notify) {
            showToast(
              `Đồng bộ hoàn tất (${cleanCode})`,
              `Đã tải ${Object.keys(withStamp.dayStatusByDate).length} buổi tập và ${withStamp.weightLogs.length} mốc cân.`,
              'green'
            );
          }
          return true;
        }
        initialCloudDoneRef.current = true;
        setSyncStatus('synced');
        return false;
      } catch {
        initialCloudDoneRef.current = true;
        setSyncStatus('offline');
        if (notify) {
          showToast('Chưa kết nối được máy chủ', 'Dữ liệu trên thiết bị vẫn được giữ an toàn.', 'orange');
        }
        return false;
      }
    },
    [pushToCloud, showToast, todayISO]
  );

  useEffect(() => {
    if (!state.hasOnboarded) return;
    pullFromCloud(latestStateRef.current.syncCode, false);
  }, [pullFromCloud, state.hasOnboarded]);

  useEffect(() => {
    if (!state.hasOnboarded || !initialCloudDoneRef.current) return;
    if (suppressNextAutoPushRef.current) {
      suppressNextAutoPushRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      pushToCloud(state, state.syncCode, false, true);
    }, 900);
    return () => clearTimeout(timer);
  }, [pushToCloud, state]);

  useEffect(() => {
    const onVisChange = () => {
      if (
        document.visibilityState === 'hidden' &&
        latestStateRef.current.hasOnboarded &&
        initialCloudDoneRef.current
      ) {
        pushToCloud(latestStateRef.current, latestStateRef.current.syncCode, false, true);
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [pushToCloud]);

  const metrics = useMemo(() => calculateMetrics(state.profileInput), [state.profileInput]);

  const scheduleOpts = useMemo(
    () => ({
      todayISO,
      startDateISO: state.startDateISO,
      weeklyPattern: state.weeklyPattern,
      dateOverrides: state.dateOverrides,
      logsByDate: state.logsByDate,
      dayStatusByDate: state.dayStatusByDate,
      sessionSwaps: state.sessionSwaps,
      customSessionLists: state.customSessionLists,
      preSleepLeadMin: state.profileInput.preSleepLeadMin,
      currentWeightKg: metrics.profile.weightKg,
      targetWeightKg: metrics.profile.targetWeightKg,
      weeklyRateKg: metrics.weeklyRateKg,
      weighInIntervalDays: state.weighInIntervalDays,
    }),
    [metrics, state, todayISO]
  );

  const dynamicWeek = useMemo(() => buildDynamicWeek(weekOffset, scheduleOpts), [scheduleOpts, weekOffset]);
  const dynamicMonth = useMemo(() => buildDynamicMonth(monthOffset, scheduleOpts), [monthOffset, scheduleOpts]);
  const selectedDay = useMemo(
    () => buildDayScheduleEntry(selectedDateISO, scheduleOpts),
    [scheduleOpts, selectedDateISO]
  );
  const todayEntry = useMemo(() => buildDayScheduleEntry(todayISO, scheduleOpts), [scheduleOpts, todayISO]);
  const tomorrowEntry = useMemo(() => buildDayScheduleEntry(tomorrowISO, scheduleOpts), [scheduleOpts, tomorrowISO]);
  const streakSummary = useMemo(() => buildStreakSummary(scheduleOpts), [scheduleOpts]);
  const personalRecords = useMemo(() => computePersonalRecords(state.logsByDate), [state.logsByDate]);

  const weightTracker = useMemo(
    () =>
      buildWeightTrackerSummary({
        todayISO,
        weighInIntervalDays: state.weighInIntervalDays,
        initialWeightKg: state.weightLogs[0]?.weight || metrics.profile.weightKg,
        currentWeightKg: metrics.profile.weightKg,
        targetWeightKg: metrics.profile.targetWeightKg,
        weeklyRateKg: metrics.weeklyRateKg,
        weightLogs: state.weightLogs,
      }),
    [metrics, state.weighInIntervalDays, state.weightLogs, todayISO]
  );

  const effectiveSessionId: WorkoutSessionId =
    selectedDay.sessionId !== 'rest' ? (selectedDay.sessionId as WorkoutSessionId) : state.activeSessionId;

  const updateProfileField = useCallback(
    <K extends keyof ProfileInput>(field: K, value: ProfileInput[K]) => {
      updateState((prev) => {
        const nextProfile = { ...prev.profileInput, [field]: value };
        if (field === 'weightKg' || field === 'targetWeightKg') {
          const w = Number(nextProfile.weightKg) || 115;
          const tw = Number(nextProfile.targetWeightKg) || 95;
          if (tw < w - 1 && nextProfile.goal === 'bulk') nextProfile.goal = 'cut';
          else if (tw > w + 1 && nextProfile.goal === 'cut') nextProfile.goal = 'bulk';
        }
        let nextWeightLogs = prev.weightLogs;
        if (field === 'weightKg') {
          const cleanW = Math.round(Number(value) * 10) / 10;
          const list = [...prev.weightLogs];
          const idx = list.findIndex((x) => x.isoDate === todayISO);
          const entry = {
            isoDate: todayISO,
            dateLabel: formatVNShortDate(todayISO),
            weight: cleanW,
            note: list.length <= 1 ? 'Cân nặng khởi điểm' : 'Cập nhật cân nặng',
          };
          if (idx >= 0) list[idx] = entry;
          else list.push(entry);
          nextWeightLogs = list;
        }
        return { ...prev, profileInput: nextProfile, weightLogs: nextWeightLogs };
      });
    },
    [todayISO, updateState]
  );

  const logNewWeight = useCallback(
    (rawKg: number) => {
      const cleanW = Math.max(38, Math.min(200, Math.round(Number(rawKg) * 10) / 10));
      updateState((prev) => {
        const list = [...prev.weightLogs];
        const idx = list.findIndex((x) => x.isoDate === todayISO);
        const entry = {
          isoDate: todayISO,
          dateLabel: formatVNShortDate(todayISO),
          weight: cleanW,
          note: `Cân định kỳ (${formatVNShortDate(todayISO)})`,
        };
        if (idx >= 0) list[idx] = entry;
        else list.push(entry);
        return {
          ...prev,
          profileInput: { ...prev.profileInput, weightKg: cleanW },
          weightLogs: list,
        };
      });
      showToast(`Đã lưu cân nặng: ${cleanW} kg`, 'Các chỉ số BMI, Calo và Đạm mục tiêu đã cập nhật.', 'green');
    },
    [showToast, todayISO, updateState]
  );

  const setDayNote = useCallback(
    (isoDate: string, noteText: string) => {
      updateState((prev) => {
        const nextNotes = { ...(prev.dayNotesByDate || {}) };
        if (!noteText.trim()) {
          delete nextNotes[isoDate];
        } else {
          nextNotes[isoDate] = noteText.slice(0, 240);
        }
        return { ...prev, dayNotesByDate: nextNotes };
      });
    },
    [updateState]
  );

  const mutateExerciseSets = useCallback(
    (
      isoDate: string,
      sessionId: WorkoutSessionId,
      exId: string,
      transform: (currentSets: SetEntry[]) => SetEntry[]
    ): { updatedSets: SetEntry[]; newlyHitPR: boolean } => {
      const safeDate = diffDaysISO(isoDate, todayISO) > 0 ? todayISO : isoDate;
      let resultSets: SetEntry[] = [];
      let newlyHitPR = false;

      updateState((prev) => {
        const currentSets = getEffectiveSetsForDay(exId, safeDate, prev.logsByDate);
        const nextSets = transform(currentSets);
        resultSets = nextSets;

        for (let i = 0; i < nextSets.length; i++) {
          if (!currentSets[i]?.done && nextSets[i]?.done) {
            if (checkSetBeatsHistoricalPR(exId, nextSets[i], safeDate, prev.logsByDate)) {
              newlyHitPR = true;
            }
          }
        }

        const nextDayLogs = { ...(prev.logsByDate[safeDate] || {}), [exId]: nextSets };
        const nextLogsByDate = { ...prev.logsByDate, [safeDate]: nextDayLogs };
        const prog = calculateSessionCompletion(
          sessionId,
          nextDayLogs,
          prev.sessionSwaps,
          prev.customSessionLists
        );

        const nextOverrides = { ...prev.dateOverrides };
        const nextStatuses = { ...prev.dayStatusByDate };
        if (prog.meetsThreshold) {
          nextOverrides[safeDate] = { ...(nextOverrides[safeDate] || {}), sessionId };
          if (prog.completionPct >= 100) {
            const hhmm = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
            nextStatuses[safeDate] = { status: 'done', sessionId, completedAt: hhmm };
          }
        }

        const nextStart =
          diffDaysISO(safeDate, prev.startDateISO) < 0 ? safeDate : prev.startDateISO;

        return {
          ...prev,
          startDateISO: nextStart,
          logsByDate: nextLogsByDate,
          dateOverrides: nextOverrides,
          dayStatusByDate: nextStatuses,
        };
      });

      if (newlyHitPR) {
        playGymChime('pr');
        const exName = EXERCISES[exId]?.shortName || exId;
        showToast('Kỷ lục cá nhân mới (PR)', `Bạn vừa vượt mốc kỷ lục bài ${exName}.`, 'gold');
      }

      return { updatedSets: resultSets, newlyHitPR };
    },
    [showToast, todayISO, updateState]
  );

  const setDayStatus = useCallback(
    (
      isoDate: string,
      status: 'done' | 'missed' | null,
      preferredSession?: WorkoutSessionId,
      options?: { quickComplete?: boolean; note?: string }
    ): boolean => {
      if (diffDaysISO(isoDate, todayISO) > 0) {
        showToast('Chưa tới ngày tập', 'Chỉ có thể chốt trạng thái cho hôm nay hoặc ngày đã qua.', 'orange');
        return false;
      }
      const snap = latestStateRef.current;
      const entry = buildDayScheduleEntry(isoDate, {
        ...scheduleOpts,
        logsByDate: snap.logsByDate,
        dayStatusByDate: snap.dayStatusByDate,
      });
      const prefId: WorkoutSessionId =
        preferredSession ||
        (entry.sessionId !== 'rest' ? (entry.sessionId as WorkoutSessionId) : snap.activeSessionId);
      const resolved = resolveBestLoggedSession(
        prefId,
        snap.logsByDate[isoDate],
        snap.sessionSwaps,
        snap.customSessionLists
      );
      const effSessionId =
        status === 'done' && resolved.progress.meetsThreshold
          ? resolved.bestWorkoutSessionId
          : prefId;

      let finalProg = calculateSessionCompletion(
        effSessionId,
        snap.logsByDate[isoDate],
        snap.sessionSwaps,
        snap.customSessionLists
      );

      const allowQuickComplete = options?.quickComplete !== false;
      if (status === 'done' && !finalProg.meetsThreshold && !allowQuickComplete) {
        showToast(
          `Chưa đạt 70% buổi tập (${finalProg.completionPct}%)`,
          `Cần hoàn thành tối thiểu ${finalProg.minRequiredSets}/${finalProg.totalSetsCount} hiệp.`,
          'orange'
        );
        return false;
      }

      const hhmm = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
      let autoCompletedSets = false;

      updateState((prev) => {
        const nextStatuses = { ...prev.dayStatusByDate };
        const nextOverrides = { ...prev.dateOverrides };
        const nextLogsByDate = { ...prev.logsByDate };
        const nextNotes = { ...(prev.dayNotesByDate || {}) };

        if (options?.note !== undefined) {
          if (options.note.trim()) nextNotes[isoDate] = options.note.trim().slice(0, 240);
        }

        if (!status) {
          delete nextStatuses[isoDate];
          if (nextLogsByDate[isoDate]) {
            const resetDayLogs: Record<string, SetEntry[]> = {};
            for (const [exKey, setsArr] of Object.entries(nextLogsByDate[isoDate])) {
              if (Array.isArray(setsArr)) {
                resetDayLogs[exKey] = setsArr.map((s) => ({ ...s, done: false }));
              }
            }
            nextLogsByDate[isoDate] = resetDayLogs;
          }
          const dow = parseISODate(isoDate).getDay();
          const ruleSess = prev.weeklyPattern[dow]?.sessionId || 'rest';
          if (ruleSess === 'rest' && nextOverrides[isoDate]?.sessionId) {
            delete nextOverrides[isoDate];
          }
        } else if (status === 'done') {
          const dayLogs = { ...(prev.logsByDate[isoDate] || {}) };
          const curProg = calculateSessionCompletion(
            effSessionId,
            dayLogs,
            prev.sessionSwaps,
            prev.customSessionLists
          );
          if (!curProg.meetsThreshold && allowQuickComplete) {
            autoCompletedSets = true;
            const activeIds = getEffectiveSessionExerciseIds(
              effSessionId,
              prev.sessionSwaps,
              prev.customSessionLists
            );
            for (const exId of activeIds) {
              const baseSets = getEffectiveSetsForDay(exId, isoDate, prev.logsByDate);
              dayLogs[exId] = baseSets.map((s) => ({ ...s, done: true }));
            }
            nextLogsByDate[isoDate] = dayLogs;
            finalProg = calculateSessionCompletion(
              effSessionId,
              dayLogs,
              prev.sessionSwaps,
              prev.customSessionLists
            );
          } else {
            finalProg = curProg;
          }

          nextStatuses[isoDate] = {
            status: 'done',
            sessionId: effSessionId,
            completedAt: hhmm,
          };
          nextOverrides[isoDate] = { ...(nextOverrides[isoDate] || {}), sessionId: effSessionId };
        } else {
          nextStatuses[isoDate] = {
            status: 'missed',
            sessionId: effSessionId,
            completedAt: null,
          };
          if (entry.sessionId === 'rest') {
            nextOverrides[isoDate] = { ...(nextOverrides[isoDate] || {}), sessionId: effSessionId };
          }
        }

        return {
          ...prev,
          startDateISO: diffDaysISO(isoDate, prev.startDateISO) < 0 ? isoDate : prev.startDateISO,
          logsByDate: nextLogsByDate,
          dayStatusByDate: nextStatuses,
          dateOverrides: nextOverrides,
          dayNotesByDate: nextNotes,
        };
      });

      if (status === 'done') {
        playGymChime('notify');
        showToast(
          'Đã chốt hoàn thành buổi tập (+1 chuỗi)',
          autoCompletedSets
            ? `${WORKOUT_SESSIONS[effSessionId].shortName} · Tổng khối lượng ${finalProg.totalVolumeKg.toLocaleString('vi-VN')}kg.`
            : `${WORKOUT_SESSIONS[effSessionId].shortName} (${finalProg.completionPct}%) · ${finalProg.totalVolumeKg.toLocaleString('vi-VN')}kg.`,
          'green'
        );
      } else if (!status) {
        showToast(
          `Đã bỏ chốt ngày ${formatVNShortDate(isoDate)}`,
          'Trạng thái buổi tập đã trở về chưa hoàn thành.',
          'orange'
        );
      } else if (status === 'missed') {
        const restDay = streakSummary.nextRestDayForMakeup;
        showToast(
          `Đã ghi nhận báo bận (${formatVNShortDate(isoDate)})`,
          restDay
            ? `Có thể dời lịch tập bù sang ${restDay.dayShort} (${restDay.shortDate}) để giữ chuỗi.`
            : 'Có thể dời sang ngày nghỉ kế tiếp để giữ chuỗi.',
          'orange'
        );
      }
      return true;
    },
    [scheduleOpts, showToast, streakSummary.nextRestDayForMakeup, todayISO, updateState]
  );

  const markDayOff = useCallback(
    (isoDate: string, note?: string) => {
      updateState((prev) => {
        const nextStatuses = { ...prev.dayStatusByDate };
        delete nextStatuses[isoDate];
        const nextLogsByDate = { ...prev.logsByDate };
        if (nextLogsByDate[isoDate]) {
          const resetDayLogs: Record<string, SetEntry[]> = {};
          for (const [exKey, setsArr] of Object.entries(nextLogsByDate[isoDate])) {
            if (Array.isArray(setsArr)) {
              resetDayLogs[exKey] = setsArr.map((s) => ({ ...s, done: false }));
            }
          }
          nextLogsByDate[isoDate] = resetDayLogs;
        }
        const nextNotes = { ...(prev.dayNotesByDate || {}) };
        if (note && note.trim()) {
          nextNotes[isoDate] = note.trim().slice(0, 240);
        }
        return {
          ...prev,
          logsByDate: nextLogsByDate,
          dayStatusByDate: nextStatuses,
          dayNotesByDate: nextNotes,
          dateOverrides: {
            ...prev.dateOverrides,
            [isoDate]: { ...(prev.dateOverrides[isoDate] || {}), sessionId: 'rest' },
          },
        };
      });
      showToast(
        `Đã chuyển ngày ${formatVNShortDate(isoDate)} sang nghỉ cơ`,
        'Nghỉ hồi phục chủ động — chuỗi kỷ luật vẫn giữ nguyên.',
        'green'
      );
    },
    [showToast, updateState]
  );

  const restoreDayWorkout = useCallback(
    (isoDate: string, fallbackSession?: WorkoutSessionId) => {
      const dow = parseISODate(isoDate).getDay();
      updateState((prev) => {
        const nextOverrides = { ...prev.dateOverrides };
        const ruleSess = prev.weeklyPattern[dow]?.sessionId;
        if (ruleSess && ruleSess !== 'rest') {
          delete nextOverrides[isoDate];
        } else {
          nextOverrides[isoDate] = {
            ...(nextOverrides[isoDate] || {}),
            sessionId: fallbackSession || prev.activeSessionId || 'press_day',
          };
        }
        return { ...prev, dateOverrides: nextOverrides };
      });
      showToast('Đã mở lại buổi tập', `Sẵn sàng ghi hiệp cho ngày ${formatVNShortDate(isoDate)}.`, 'green');
    },
    [showToast, updateState]
  );

  const applyWeeklySplitPreset = useCallback(
    (mode: 'spaced' | 'consecutive' | 'toggle_sat') => {
      updateState((prev) => {
        if (mode === 'toggle_sat') {
          const isSatOn = prev.weeklyPattern[6]?.sessionId && prev.weeklyPattern[6].sessionId !== 'rest';
          const nextOverrides = { ...prev.dateOverrides };
          Object.keys(nextOverrides).forEach((d) => {
            if (parseISODate(d).getDay() === 6 && !prev.dayStatusByDate[d]) {
              delete nextOverrides[d];
            }
          });
          return {
            ...prev,
            dateOverrides: nextOverrides,
            weeklyPattern: {
              ...prev.weeklyPattern,
              6: {
                sessionId: isSatOn ? 'rest' : 'upper_day',
                workoutTime: '07:00',
                isOptionalDay: true,
              },
            },
          };
        }

        const nextPattern: Record<number, WeekdayRule> =
          mode === 'spaced'
            ? {
                ...prev.weeklyPattern,
                1: { sessionId: 'rest', workoutTime: '06:00' },
                2: { sessionId: 'press_day', workoutTime: '06:00' },
                3: { sessionId: 'pull_day', workoutTime: '06:00' },
                4: { sessionId: 'rest', workoutTime: '06:00' },
                5: { sessionId: 'legs_day', workoutTime: '06:00' },
              }
            : {
                ...prev.weeklyPattern,
                1: { sessionId: 'rest', workoutTime: '06:00' },
                2: { sessionId: 'press_day', workoutTime: '06:00' },
                3: { sessionId: 'pull_day', workoutTime: '06:00' },
                4: { sessionId: 'legs_day', workoutTime: '06:00' },
                5: { sessionId: 'rest', workoutTime: '06:00' },
              };
        return { ...prev, weeklyPattern: nextPattern };
      });
      showToast('Đã cập nhật khung lịch tuần', 'Các buổi tập trong tuần đã sắp xếp lại.', 'green');
    },
    [showToast, updateState]
  );

  const makeupMissedSession = useCallback(
    (missedDateISO: string, missedSessionId: SessionId) => {
      const restTarget = streakSummary.nextRestDayForMakeup;
      if (!restTarget || missedSessionId === 'rest') return;
      updateState((prev) => {
        const nextStatuses = { ...prev.dayStatusByDate };
        delete nextStatuses[missedDateISO];
        return {
          ...prev,
          dayStatusByDate: nextStatuses,
          dateOverrides: {
            ...prev.dateOverrides,
            [missedDateISO]: { sessionId: 'rest' },
            [restTarget.isoDate]: {
              sessionId: missedSessionId,
              workoutTime: prev.profileInput.workoutTime || '06:00',
            },
          },
        };
      });
      showToast(
        `Đã dời lịch bù sang ${restTarget.dayShort} (${restTarget.shortDate})`,
        'Chuỗi kỷ luật đã được bảo toàn.',
        'green'
      );
    },
    [showToast, streakSummary.nextRestDayForMakeup, updateState]
  );

  const updateScheduleForDay = useCallback(
    (isoDate: string, dow: number, patch: Partial<WeekdayRule>, scope: 'recurring' | 'single') => {
      updateState((prev) => {
        if (scope === 'recurring') {
          const nextOverrides = { ...prev.dateOverrides };
          delete nextOverrides[isoDate];
          return {
            ...prev,
            weeklyPattern: {
              ...prev.weeklyPattern,
              [dow]: { ...(prev.weeklyPattern[dow] || { sessionId: 'rest', workoutTime: '06:00' }), ...patch },
            },
            dateOverrides: nextOverrides,
            activeSessionId:
              patch.sessionId && patch.sessionId !== 'rest'
                ? (patch.sessionId as WorkoutSessionId)
                : prev.activeSessionId,
          };
        }
        return {
          ...prev,
          dateOverrides: {
            ...prev.dateOverrides,
            [isoDate]: { ...(prev.dateOverrides[isoDate] || {}), ...patch },
          },
          activeSessionId:
            patch.sessionId && patch.sessionId !== 'rest'
              ? (patch.sessionId as WorkoutSessionId)
              : prev.activeSessionId,
        };
      });
    },
    [updateState]
  );

  const swapExerciseInSlot = useCallback(
    (sessionId: WorkoutSessionId, originalSlotId: string, targetExId: string) => {
      updateState((prev) => ({
        ...prev,
        sessionSwaps: { ...prev.sessionSwaps, [`${sessionId}__${originalSlotId}`]: targetExId },
      }));
      const ex = EXERCISES[targetExId];
      if (ex) showToast(`Đã đổi sang ${ex.shortName}`, ex.cues, 'green');
    },
    [showToast, updateState]
  );

  const addExerciseToSession = useCallback(
    (sessionId: WorkoutSessionId, newExId: string) => {
      const ex = EXERCISES[newExId];
      if (!ex) return;
      const allowed = SESSION_ALLOWED_SLOT_GROUPS[sessionId] || [];
      if (allowed.length > 0 && !allowed.includes(ex.slotGroup)) return;
      updateState((prev) => {
        const base =
          prev.customSessionLists[sessionId]?.length > 0
            ? [...prev.customSessionLists[sessionId]]
            : [...WORKOUT_SESSIONS[sessionId].exerciseIds];
        if (!base.includes(newExId)) base.push(newExId);
        return {
          ...prev,
          customSessionLists: { ...prev.customSessionLists, [sessionId]: base },
        };
      });
      showToast(`Đã thêm ${ex.shortName}`, `Đã bổ sung vào ${WORKOUT_SESSIONS[sessionId].shortName}.`, 'green');
    },
    [showToast, updateState]
  );

  const removeExerciseFromSession = useCallback(
    (sessionId: WorkoutSessionId, slotIdx: number) => {
      updateState((prev) => {
        const base =
          prev.customSessionLists[sessionId]?.length > 0
            ? [...prev.customSessionLists[sessionId]]
            : [...WORKOUT_SESSIONS[sessionId].exerciseIds];
        if (base.length <= 3) return prev;
        base.splice(slotIdx, 1);
        return {
          ...prev,
          customSessionLists: { ...prev.customSessionLists, [sessionId]: base },
        };
      });
    },
    [updateState]
  );

  const applyGymPreset = useCallback(
    (sessionId: WorkoutSessionId, presetId: string, gymId?: GymBranchId) => {
      const preset = GYM_SESSION_PRESETS[presetId] || GYM_SESSION_PRESETS.default;
      const nextList = preset?.sessions?.[sessionId] || WORKOUT_SESSIONS[sessionId].exerciseIds;
      updateState((prev) => {
        const nextSwaps = { ...prev.sessionSwaps };
        Object.keys(nextSwaps).forEach((k) => {
          if (k.startsWith(`${sessionId}__`)) delete nextSwaps[k];
        });
        return {
          ...prev,
          selectedGymId: gymId || prev.selectedGymId,
          customSessionLists: { ...prev.customSessionLists, [sessionId]: [...nextList] },
          activePresetBySession: { ...prev.activePresetBySession, [sessionId]: presetId },
          sessionSwaps: nextSwaps,
        };
      });
    },
    [updateState]
  );

  const addWaterMl = useCallback(
    (deltaMl: number, dateISO = nutritionDateISO) => {
      updateState((prev) => {
        const cur = Number(prev.waterByDate[dateISO] || 0);
        const nextVal = deltaMl === 0 ? 0 : Math.max(0, Math.min(9000, cur + deltaMl));
        return {
          ...prev,
          waterByDate: { ...prev.waterByDate, [dateISO]: nextVal },
        };
      });
    },
    [nutritionDateISO, updateState]
  );

  const adjustFoodServing = useCallback(
    (foodId: string, delta: number, dateISO = nutritionDateISO) => {
      updateState((prev) => {
        const dayMap = { ...(prev.foodServingsByDate[dateISO] || {}) };
        const nextQty = Math.max(0, Math.min(10, Math.round(((dayMap[foodId] || 0) + delta) * 2) / 2));
        if (nextQty <= 0) delete dayMap[foodId];
        else dayMap[foodId] = nextQty;
        return {
          ...prev,
          foodServingsByDate: { ...prev.foodServingsByDate, [dateISO]: dayMap },
        };
      });
    },
    [nutritionDateISO, updateState]
  );

  const addCustomMacroEntry = useCallback(
    (item: Omit<CustomMacroItem, 'id'>, dateISO = nutritionDateISO) => {
      const entry: CustomMacroItem = {
        ...item,
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      };
      updateState((prev) => ({
        ...prev,
        customMacrosByDate: {
          ...prev.customMacrosByDate,
          [dateISO]: [...(prev.customMacrosByDate[dateISO] || []), entry],
        },
      }));
      showToast(`Đã cộng ${entry.name}`, `+${entry.kcal} kcal · +${entry.protein}g Đạm`, 'green');
    },
    [nutritionDateISO, showToast, updateState]
  );

  const removeCustomMacroEntry = useCallback(
    (entryId: string, dateISO = nutritionDateISO) => {
      updateState((prev) => ({
        ...prev,
        customMacrosByDate: {
          ...prev.customMacrosByDate,
          [dateISO]: (prev.customMacrosByDate[dateISO] || []).filter((x) => x.id !== entryId),
        },
      }));
    },
    [nutritionDateISO, updateState]
  );

  const applyAgentProposals = useCallback(
    (proposals: AgentActionProposal[]): GymStateV10 => {
      const snapshotBefore: GymStateV10 = JSON.parse(JSON.stringify(latestStateRef.current));
      const hhmm = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

      updateState((prev) => {
        const next: GymStateV10 = JSON.parse(JSON.stringify(prev));

        for (const act of proposals) {
          if (act.type === 'add_food_catalog') {
            if (!VN_FOODS.some((f) => f.id === act.foodId)) continue;
            const dISO = act.dateISO || todayISO;
            const dayMap = { ...(next.foodServingsByDate[dISO] || {}) };
            const qty = Math.max(0.5, Math.min(8, Number(act.servings) || 1));
            dayMap[act.foodId] = Math.round(((dayMap[act.foodId] || 0) + qty) * 2) / 2;
            next.foodServingsByDate[dISO] = dayMap;
          } else if (act.type === 'add_custom_food') {
            const dISO = act.dateISO || todayISO;
            const entry: CustomMacroItem = {
              id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: String(act.name || 'Món ăn').slice(0, 80),
              kcal: Math.max(0, Math.round(Number(act.kcal) || 0)),
              protein: Math.max(0, Math.round(Number(act.protein) || 0)),
              carb: Math.max(0, Math.round(Number(act.carb) || 0)),
              fat: Math.max(0, Math.round(Number(act.fat) || 0)),
            };
            next.customMacrosByDate[dISO] = [...(next.customMacrosByDate[dISO] || []), entry];
          } else if (act.type === 'add_water') {
            const dISO = act.dateISO || todayISO;
            const cur = Number(next.waterByDate[dISO] || 0);
            next.waterByDate[dISO] = Math.max(0, Math.min(9000, cur + (Number(act.amountMl) || 250)));
          } else if (act.type === 'set_water') {
            const dISO = act.dateISO || todayISO;
            next.waterByDate[dISO] = Math.max(0, Math.min(9000, Math.round(Number(act.waterMl) || 0)));
          } else if (act.type === 'remove_food_item') {
            const dISO = act.dateISO || todayISO;
            if (act.foodId) {
              const dayMap = { ...(next.foodServingsByDate[dISO] || {}) };
              delete dayMap[act.foodId];
              next.foodServingsByDate[dISO] = dayMap;
              if (Array.isArray(next.foodsByDate[dISO])) {
                next.foodsByDate[dISO] = next.foodsByDate[dISO].filter((id) => id !== act.foodId);
              }
            }
            if (act.customNameMatch) {
              const needle = act.customNameMatch.trim().toLowerCase();
              const prevList = next.customMacrosByDate[dISO] || [];
              next.customMacrosByDate[dISO] = prevList.filter(
                (x) => !x.name.toLowerCase().includes(needle) && x.id !== act.customNameMatch
              );
            }
          } else if (act.type === 'replace_day_nutrition') {
            const dISO = act.dateISO || todayISO;
            next.foodServingsByDate[dISO] = {};
            next.foodsByDate[dISO] = [];
            const cleanItems: CustomMacroItem[] = (act.items || []).map((rawItem, idx) => ({
              id: `ai_rep_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
              name: String(rawItem.name || 'Bữa ăn').slice(0, 80),
              kcal: Math.max(0, Math.round(Number(rawItem.kcal) || 0)),
              protein: Math.max(0, Math.round(Number(rawItem.protein) || 0)),
              carb: Math.max(0, Math.round(Number(rawItem.carb) || 0)),
              fat: Math.max(0, Math.round(Number(rawItem.fat) || 0)),
            }));
            next.customMacrosByDate[dISO] = cleanItems;
            if (typeof act.waterMl === 'number' && !Number.isNaN(act.waterMl)) {
              next.waterByDate[dISO] = Math.max(0, Math.min(9000, Math.round(act.waterMl)));
            }
          } else if (act.type === 'swap_exercise') {
            const sid: WorkoutSessionId = WORKOUT_SESSIONS[act.sessionId] ? act.sessionId : effectiveSessionId;
            if (!EXERCISES[act.toExId]) continue;
            const baseList =
              next.customSessionLists[sid]?.length > 0
                ? [...next.customSessionLists[sid]]
                : [...WORKOUT_SESSIONS[sid].exerciseIds];
            const idx = baseList.findIndex(
              (origId) =>
                origId === act.fromExId ||
                next.sessionSwaps[`${sid}__${origId}`] === act.fromExId
            );
            if (idx >= 0) {
              const origSlotId = baseList[idx];
              next.sessionSwaps[`${sid}__${origSlotId}`] = act.toExId;
            } else if (!baseList.includes(act.toExId)) {
              baseList.push(act.toExId);
              next.customSessionLists[sid] = baseList;
            }
          } else if (act.type === 'set_session_exercises') {
            const sid: WorkoutSessionId = WORKOUT_SESSIONS[act.sessionId] ? act.sessionId : effectiveSessionId;
            const validIds = (act.exerciseIds || []).filter((id) => Boolean(EXERCISES[id]));
            if (validIds.length >= 2) {
              Object.keys(next.sessionSwaps).forEach((k) => {
                if (k.startsWith(`${sid}__`)) delete next.sessionSwaps[k];
              });
              next.customSessionLists[sid] = validIds;
              next.activeSessionId = sid;
            }
          } else if (act.type === 'log_exercise_sets') {
            if (!EXERCISES[act.exId]) continue;
            const dISO = diffDaysISO(act.dateISO || todayISO, todayISO) > 0 ? todayISO : act.dateISO || todayISO;
            const count = Math.max(1, Math.min(8, Math.round(Number(act.setsCount) || 3)));
            const w = Math.max(0, Number(act.weightKg) || 0);
            const r = Math.max(1, Math.round(Number(act.reps) || 10));
            const ef = act.effort || 'good';
            const sets: SetEntry[] = [];
            for (let i = 1; i <= count; i++) {
              sets.push({
                type: String(i),
                prev: 'ChatDVT ghi nhận',
                weight: w,
                reps: r,
                effort: ef,
                done: true,
              });
            }
            next.logsByDate[dISO] = { ...(next.logsByDate[dISO] || {}), [act.exId]: sets };
          } else if (act.type === 'adjust_exercise_sets') {
            if (!EXERCISES[act.exId]) continue;
            const dISO = diffDaysISO(act.dateISO || todayISO, todayISO) > 0 ? todayISO : act.dateISO || todayISO;
            const curSets = getEffectiveSetsForDay(act.exId, dISO, next.logsByDate);
            const newW = Math.max(0, Math.round(Number(act.newWeightKg || 0) * 10) / 10);
            const newR = Math.max(1, Math.round(Number(act.newReps || 8)));
            const targetWorkSets = act.setsCount
              ? Math.max(1, Math.min(6, Math.round(act.setsCount)))
              : Math.max(2, curSets.filter((s) => s.type !== 'W').length);

            const updatedSets: SetEntry[] = [];
            const warmups = curSets.filter((s) => s.type === 'W');
            if (warmups.length > 0) {
              updatedSets.push({
                ...warmups[0],
                weight: Math.max(0, Math.round(newW * 0.55 * 2) / 2),
              });
            }
            let workIdx = 1;
            if (act.loggedHeavySet && act.loggedHeavySet.weightKg > 0) {
              updatedSets.push({
                type: String(workIdx++),
                prev: 'Hiệp nặng đã thử',
                weight: act.loggedHeavySet.weightKg,
                reps: Math.max(1, act.loggedHeavySet.reps),
                effort: 'max',
                done: true,
              });
            }
            while (workIdx <= targetWorkSets) {
              updatedSets.push({
                type: String(workIdx),
                prev: `Điều chỉnh vừa sức (RPE 8)`,
                weight: newW,
                reps: newR,
                effort: 'good',
                done: false,
              });
              workIdx += 1;
            }
            next.logsByDate[dISO] = { ...(next.logsByDate[dISO] || {}), [act.exId]: updatedSets };
          } else if (act.type === 'set_day_status') {
            const dISO = diffDaysISO(act.dateISO || todayISO, todayISO) > 0 ? todayISO : act.dateISO || todayISO;
            if (act.note && act.note.trim()) {
              next.dayNotesByDate[dISO] = act.note.trim().slice(0, 240);
            }
            if (act.status === 'off') {
              delete next.dayStatusByDate[dISO];
              if (next.logsByDate[dISO]) {
                for (const exKey of Object.keys(next.logsByDate[dISO])) {
                  next.logsByDate[dISO][exKey] = (next.logsByDate[dISO][exKey] || []).map((s) => ({ ...s, done: false }));
                }
              }
              next.dateOverrides[dISO] = { ...(next.dateOverrides[dISO] || {}), sessionId: 'rest' };
            } else if (act.status === 'clear') {
              delete next.dayStatusByDate[dISO];
              if (next.logsByDate[dISO]) {
                for (const exKey of Object.keys(next.logsByDate[dISO])) {
                  next.logsByDate[dISO][exKey] = (next.logsByDate[dISO][exKey] || []).map((s) => ({ ...s, done: false }));
                }
              }
            } else if (act.status === 'missed') {
              const sid = act.sessionId && WORKOUT_SESSIONS[act.sessionId] ? act.sessionId : effectiveSessionId;
              next.dayStatusByDate[dISO] = { status: 'missed', sessionId: sid, completedAt: null };
            } else if (act.status === 'done') {
              const sid = act.sessionId && WORKOUT_SESSIONS[act.sessionId] ? act.sessionId : effectiveSessionId;
              const dayLogs = { ...(next.logsByDate[dISO] || {}) };
              const prog = calculateSessionCompletion(sid, dayLogs, next.sessionSwaps, next.customSessionLists);
              if (!prog.meetsThreshold) {
                const activeIds = getEffectiveSessionExerciseIds(sid, next.sessionSwaps, next.customSessionLists);
                for (const exId of activeIds) {
                  const baseSets = getEffectiveSetsForDay(exId, dISO, next.logsByDate);
                  dayLogs[exId] = baseSets.map((s) => ({ ...s, done: true }));
                }
                next.logsByDate[dISO] = dayLogs;
              }
              next.dayStatusByDate[dISO] = { status: 'done', sessionId: sid, completedAt: hhmm };
              next.dateOverrides[dISO] = { ...(next.dateOverrides[dISO] || {}), sessionId: sid };
            }
          } else if (act.type === 'clear_workout_logs') {
            if (act.scope === 'all') {
              next.dayStatusByDate = {};
              next.logsByDate = {};
            } else {
              const dISO = act.dateISO || todayISO;
              delete next.dayStatusByDate[dISO];
              delete next.logsByDate[dISO];
            }
          } else if (act.type === 'clear_nutrition_logs') {
            if (act.scope === 'all') {
              next.foodServingsByDate = {};
              next.foodsByDate = {};
              next.customMacrosByDate = {};
              next.waterByDate = {};
            } else {
              const dISO = act.dateISO || todayISO;
              next.foodServingsByDate[dISO] = {};
              next.foodsByDate[dISO] = [];
              next.customMacrosByDate[dISO] = [];
              next.waterByDate[dISO] = 0;
            }
          } else if (act.type === 'reschedule_day') {
            const dISO = act.dateISO || todayISO;
            const dow = parseISODate(dISO).getDay();
            const patch: Partial<WeekdayRule> = { sessionId: act.sessionId };
            if (act.workoutTime) patch.workoutTime = act.workoutTime;
            if (act.scope === 'recurring') {
              delete next.dateOverrides[dISO];
              next.weeklyPattern[dow] = {
                ...(next.weeklyPattern[dow] || { sessionId: 'rest', workoutTime: '06:00' }),
                ...patch,
              };
            } else {
              next.dateOverrides[dISO] = { ...(next.dateOverrides[dISO] || {}), ...patch };
            }
            if (act.sessionId !== 'rest') {
              next.activeSessionId = act.sessionId;
            }
          } else if (act.type === 'set_weekly_split') {
            const nextPattern = { ...next.weeklyPattern };
            for (const [dowStr, rule] of Object.entries(act.days || {})) {
              const dow = Number(dowStr);
              if (Number.isNaN(dow) || dow < 0 || dow > 6 || !rule) continue;
              nextPattern[dow] = {
                sessionId: rule.sessionId,
                workoutTime: rule.workoutTime || next.profileInput.workoutTime || '06:00',
                isOptionalDay: dow === 6,
              };
            }
            // Clear future unlogged overrides so new weekly split takes immediate effect
            for (const dKey of Object.keys(next.dateOverrides)) {
              if (!next.dayStatusByDate[dKey] && diffDaysISO(dKey, todayISO) >= 0) {
                delete next.dateOverrides[dKey];
              }
            }
            next.weeklyPattern = nextPattern;
          } else if (act.type === 'update_strategy') {
            const nextProfile = { ...next.profileInput, goal: act.goal };
            if (act.gender === 'male' || act.gender === 'female') {
              nextProfile.gender = act.gender;
            }
            if (act.age && act.age >= 14 && act.age <= 90) {
              nextProfile.age = Math.round(act.age);
            }
            if (act.heightCm && act.heightCm >= 120 && act.heightCm <= 230) {
              nextProfile.heightCm = Math.round(act.heightCm);
            }
            if (act.weightKg && act.weightKg >= 35 && act.weightKg <= 260) {
              const cleanCurrentW = Math.round(act.weightKg * 10) / 10;
              nextProfile.weightKg = cleanCurrentW;
              const wList = [...next.weightLogs];
              const wIdx = wList.findIndex((x) => x.isoDate === todayISO);
              const wEntry = {
                isoDate: todayISO,
                dateLabel: formatVNShortDate(todayISO),
                weight: cleanCurrentW,
                note: `Cập nhật từ InBody / ChatDVT (${formatVNShortDate(todayISO)})`,
              };
              if (wIdx >= 0) wList[wIdx] = wEntry;
              else wList.push(wEntry);
              next.weightLogs = wList;
            }
            if (act.targetWeightKg && act.targetWeightKg >= 35 && act.targetWeightKg <= 220) {
              nextProfile.targetWeightKg = Math.round(act.targetWeightKg * 10) / 10;
            }
            if (act.workoutTime && /^\d{2}:\d{2}$/.test(act.workoutTime)) {
              nextProfile.workoutTime = act.workoutTime;
            }
            nextProfile.shortLabel = `${nextProfile.weightKg}kg · ${nextProfile.heightCm}cm`;
            next.profileInput = nextProfile;
          } else if (act.type === 'log_weight') {
            const cleanW = Math.max(38, Math.min(200, Math.round((Number(act.weightKg) || 115) * 10) / 10));
            const list = [...next.weightLogs];
            const idx = list.findIndex((x) => x.isoDate === todayISO);
            const entry = {
              isoDate: todayISO,
              dateLabel: formatVNShortDate(todayISO),
              weight: cleanW,
              note: `ChatDVT ghi nhận (${formatVNShortDate(todayISO)})`,
            };
            if (idx >= 0) list[idx] = entry;
            else list.push(entry);
            next.weightLogs = list;
            next.profileInput = { ...next.profileInput, weightKg: cleanW };
          }
        }

        return next;
      });

      playGymChime('notify');
      showToast(
        `Đã áp dụng ${proposals.length} cập nhật từ ChatDVT`,
        'Dữ liệu đã lưu tự động — có thể bấm Hoàn tác ngay trong cuộc trò chuyện.',
        'green'
      );

      return snapshotBefore;
    },
    [effectiveSessionId, showToast, todayISO, updateState]
  );

  const nutritionTotalsForSelectedDate = useMemo(() => {
    const servingsMap = state.foodServingsByDate[nutritionDateISO] || {};
    const customList = state.customMacrosByDate[nutritionDateISO] || [];
    let kcal = 0;
    let protein = 0;
    let carb = 0;
    let fat = 0;
    let itemCount = 0;

    for (const [fid, qty] of Object.entries(servingsMap)) {
      if (!qty || qty <= 0) continue;
      const food = VN_FOODS.find((f) => f.id === fid);
      if (!food) continue;
      kcal += Math.round(food.kcal * qty);
      protein += Math.round(food.protein * qty);
      carb += Math.round(food.carb * qty);
      fat += Math.round(food.fat * qty);
      itemCount += 1;
    }
    for (const c of customList) {
      kcal += Number(c.kcal) || 0;
      protein += Number(c.protein) || 0;
      carb += Number(c.carb) || 0;
      fat += Number(c.fat) || 0;
      itemCount += 1;
    }

    const waterMl = Number(state.waterByDate[nutritionDateISO] || 0);
    return { kcal, protein, carb, fat, itemCount, waterMl, servingsMap, customList };
  }, [nutritionDateISO, state.customMacrosByDate, state.foodServingsByDate, state.waterByDate]);

  const updatePushPref = useCallback(
    <K extends keyof PushPrefs>(key: K, val: PushPrefs[K]) => {
      updateState((prev) => ({
        ...prev,
        pushPrefs: { ...prev.pushPrefs, [key]: val },
        preSleepAlertEnabled: key === 'sleepReminder' ? Boolean(val) : prev.preSleepAlertEnabled,
      }));
    },
    [updateState]
  );

  const setSyncCodeAndPull = useCallback(
    async (rawNewCode: string) => {
      const trimmed = String(rawNewCode || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '')
        .slice(0, 32);
      if (trimmed.length < 2) {
        showToast('Mã chưa hợp lệ', 'Vui lòng nhập từ 2 ký tự chữ hoặc số trở lên.', 'orange');
        return;
      }
      const prevCode = latestStateRef.current.syncCode;
      const isDifferentCode = trimmed !== prevCode;
      try {
        localStorage.setItem(DEVICE_SYNC_CODE_STORAGE_KEY, trimmed);
      } catch {}
      updateState((prev) => ({ ...prev, syncCode: trimmed, hasOnboarded: true }));
      await pullFromCloud(trimmed, true, isDifferentCode);
    },
    [pullFromCloud, showToast, updateState]
  );

  const restoreExistingCodeOnOnboarding = useCallback(
    async (rawCode: string): Promise<boolean> => {
      const trimmed = String(rawCode || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '')
        .slice(0, 32);
      if (trimmed.length < 2) {
        showToast('Mã chưa hợp lệ', 'Nhập đúng mã đồng bộ (tối thiểu 2 ký tự chữ/số).', 'orange');
        return false;
      }
      try {
        setSyncStatus('syncing');
        const res = await fetch(`/api/gym8d/load/${encodeURIComponent(trimmed)}`, {
          cache: 'no-store',
        });
        if (res.status === 404) {
          setSyncStatus('idle');
          showToast(
            `Chưa tìm thấy mã ${trimmed}`,
            'Kiểm tra lại mã đồng bộ từ máy cũ hoặc thiết lập hồ sơ mới bên dưới.',
            'orange'
          );
          return false;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const migrated = migrateRawState(payload?.data || {}, todayISO);
        if (!migrated) throw new Error('Invalid state');
        const hhmm = `${String(new Date().getHours()).padStart(2, '0')}:${String(
          new Date().getMinutes()
        ).padStart(2, '0')}`;
        const restored: GymStateV10 = {
          ...migrated,
          syncCode: trimmed,
          hasOnboarded: true,
          lastSyncedAt: hhmm,
        };
        try {
          localStorage.setItem(DEVICE_SYNC_CODE_STORAGE_KEY, trimmed);
        } catch {}
        suppressNextAutoPushRef.current = true;
        initialCloudDoneRef.current = true;
        latestStateRef.current = restored;
        saveLocalStateSafely(restored);
        setState(restored);
        setSyncStatus('synced');
        showToast(
          `Đã khôi phục hồ sơ (${trimmed})`,
          `Tải thành công ${Object.keys(restored.dayStatusByDate).length} buổi tập và dữ liệu thể trạng.`,
          'green'
        );
        return true;
      } catch {
        setSyncStatus('offline');
        showToast('Không tải được máy chủ', 'Kiểm tra kết nối mạng rồi thử lại nhé.', 'orange');
        return false;
      }
    },
    [showToast, todayISO]
  );

  const completeOnboarding = useCallback(
    async (setup: OnboardingSetupPayload): Promise<boolean> => {
      const cleanName = setup.name.trim().slice(0, 40);
      const w = Math.min(260, Math.max(35, Number(setup.weightKg) || 72));
      const tw = Math.min(220, Math.max(35, Number(setup.targetWeightKg) || 66));
      const h = Math.min(230, Math.max(120, Math.round(Number(setup.heightCm) || 172)));
      const a = Math.min(90, Math.max(14, Math.round(Number(setup.age) || 26)));
      const cleanCode = normalizeSyncCode(
        setup.customSyncCode || latestStateRef.current.syncCode
      );

      // Prevent accidentally overwriting an existing user's cloud profile when creating a brand-new profile
      if (typeof window !== 'undefined' && window.location.protocol !== 'file:') {
        try {
          const checkRes = await fetch(`/api/gym8d/load/${encodeURIComponent(cleanCode)}`, {
            cache: 'no-store',
          });
          if (checkRes.ok) {
            showToast(
              `Mã ${cleanCode} đã có người dùng`,
              'Hãy đổi sang mã cá nhân khác hoặc bấm Khôi phục nếu đây là mã cũ của bạn.',
              'orange'
            );
            return false;
          }
        } catch {
          // Offline mode: proceed with local profile creation
        }
      }

      try {
        localStorage.setItem(DEVICE_SYNC_CODE_STORAGE_KEY, cleanCode);
      } catch {}

      const nextState: GymStateV10 = {
        ...latestStateRef.current,
        syncCode: cleanCode,
        hasOnboarded: true,
        coachPersona: setup.coachPersona,
        agentMessages: [],
        profileInput: {
          ...latestStateRef.current.profileInput,
          name: cleanName,
          gender: setup.gender,
          age: a,
          heightCm: h,
          weightKg: w,
          targetWeightKg: tw,
          goal: setup.goal,
          workoutTime: setup.workoutTime || '18:00',
          shortLabel: `${w}kg · ${h}cm`,
          label: `${cleanName || 'Hồ sơ'} · ${w}kg · ${h}cm`,
        },
        weightLogs: [
          {
            isoDate: todayISO,
            dateLabel: formatVNShortDate(todayISO),
            weight: w,
            note: 'Cân nặng khởi điểm',
          },
        ],
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
      };

      suppressNextAutoPushRef.current = true;
      initialCloudDoneRef.current = true;
      latestStateRef.current = nextState;
      saveLocalStateSafely(nextState);
      setState(nextState);
      await pushToCloud(nextState, cleanCode, false, true);
      showToast(
        `Chào ${cleanName || 'bạn'} · Mã ${cleanCode}`,
        'Hồ sơ cá nhân đã tạo riêng biệt và lưu đồng bộ an toàn.',
        'green'
      );
      return true;
    },
    [pushToCloud, showToast, todayISO]
  );

  const setCoachPersona = useCallback(
    (persona: CoachPersonaId) => {
      updateState((prev) => ({ ...prev, coachPersona: persona }));
      showToast(
        persona === 'savage'
          ? 'Đã bật giọng Cà Khịa ChatDVT'
          : 'Đã chuyển về giọng Chuẩn PT',
        persona === 'savage'
          ? 'Chuẩn mỏ hỗn Discord 8D — lười tập hay ăn bậy là bị bóc phốt thẳng mặt.'
          : 'Chuyên nghiệp, thẳng thắn và khích lệ kỷ luật bền bỉ.',
        persona === 'savage' ? 'orange' : 'green'
      );
    },
    [showToast, updateState]
  );

  const exportBackupJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(latestStateRef.current, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gau-gym-8d-${latestStateRef.current.syncCode}-${todayISO}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã xuất bản sao lưu JSON', 'Lưu file này để dự phòng an toàn.', 'green');
  }, [showToast, todayISO]);

  const importBackupJSON = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const migrated = migrateRawState(parsed, todayISO);
        if (!migrated) throw new Error('Invalid JSON');
        latestStateRef.current = migrated;
        saveLocalStateSafely(migrated);
        setState(migrated);
        await pushToCloud(migrated, migrated.syncCode, false, true);
        showToast('Đã khôi phục dữ liệu', 'Lịch sử tập luyện và dinh dưỡng đã cập nhật.', 'green');
      } catch {
        showToast('File không hợp lệ', 'Vui lòng chọn đúng file .json xuất từ Gấu Gym 8D.', 'orange');
      }
    },
    [pushToCloud, showToast, todayISO]
  );

  const resetAllDataConfirmed = useCallback(async () => {
    const newDeviceCode = generateRandomSyncCode();
    try {
      localStorage.setItem(DEVICE_SYNC_CODE_STORAGE_KEY, newDeviceCode);
      localStorage.removeItem(CANONICAL_STORAGE_KEY);
    } catch {}
    const fresh = createFreshDefaultState(todayISO);
    fresh.syncCode = newDeviceCode;
    fresh.hasOnboarded = false;
    initialCloudDoneRef.current = false;
    latestStateRef.current = fresh;
    saveLocalStateSafely(fresh);
    setState(fresh);
    showToast('Đã tạo mới hồ sơ thiết bị', 'Bạn có thể thiết lập hồ sơ mới hoặc nhập lại mã đồng bộ cũ.', 'orange');
  }, [showToast, todayISO]);

  return {
    state,
    todayISO,
    tomorrowISO,
    selectedDateISO,
    setSelectedDateISO,
    nutritionDateISO,
    setNutritionDateISO,
    weekOffset,
    setWeekOffset,
    monthOffset,
    setMonthOffset,
    syncStatus,
    toast,
    showToast,
    dismissToast,
    metrics,
    dynamicWeek,
    dynamicMonth,
    selectedDay,
    todayEntry,
    tomorrowEntry,
    streakSummary,
    personalRecords,
    weightTracker,
    effectiveSessionId,
    nutritionTotalsForSelectedDate,
    updateState,
    setAgentMessages,
    updateProfileField,
    logNewWeight,
    setDayNote,
    mutateExerciseSets,
    setDayStatus,
    markDayOff,
    restoreDayWorkout,
    applyWeeklySplitPreset,
    makeupMissedSession,
    updateScheduleForDay,
    swapExerciseInSlot,
    addExerciseToSession,
    removeExerciseFromSession,
    applyGymPreset,
    addWaterMl,
    adjustFoodServing,
    addCustomMacroEntry,
    removeCustomMacroEntry,
    applyAgentProposals,
    restoreSnapshot,
    updatePushPref,
    pushToCloud,
    pullFromCloud,
    setSyncCodeAndPull,
    restoreExistingCodeOnOnboarding,
    completeOnboarding,
    setCoachPersona,
    exportBackupJSON,
    importBackupJSON,
    resetAllDataConfirmed,
  };
}
