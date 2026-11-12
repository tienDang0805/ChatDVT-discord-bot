import { DEFAULT_USER_PROFILE } from '../data/workouts';
import type {
  AgentChatMessage,
  CoachPersonaId,
  CustomMacroItem,
  GymStateV10,
  PushPrefs,
  SetEntry,
} from '../types/gym';
import { diffDaysISO, formatVNShortDate, getTodayISO } from './dateUtils';
import { buildDefaultWeeklyPattern } from './schedule';

export const CANONICAL_STORAGE_KEY = '8d_gym_state';
export const BACKUP_STORAGE_KEY = '8d_gym_state_backup';
export const DEVICE_SYNC_CODE_STORAGE_KEY = '8d_gym_device_sync_code_v1';
export const CURRENT_SCHEMA_VERSION = 10;

const SYNC_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRandomSyncCode(): string {
  let suffix = '';
  const cryptoObj = typeof globalThis !== 'undefined' ? (globalThis as any).crypto : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const arr = new Uint8Array(5);
    cryptoObj.getRandomValues(arr);
    for (let i = 0; i < arr.length; i += 1) {
      suffix += SYNC_ALPHABET[arr[i] % SYNC_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < 5; i += 1) {
      suffix += SYNC_ALPHABET[Math.floor(Math.random() * SYNC_ALPHABET.length)];
    }
  }
  return `G8D${suffix}`;
}

export function getOrCreateDeviceSyncCode(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'G8DLOCAL';
  }
  try {
    const urlCode = new URLSearchParams(window.location.search).get('code');
    if (urlCode) {
      const cleanUrl = String(urlCode)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '')
        .slice(0, 32);
      if (cleanUrl.length >= 2) {
        localStorage.setItem(DEVICE_SYNC_CODE_STORAGE_KEY, cleanUrl);
        return cleanUrl;
      }
    }
    const saved = localStorage.getItem(DEVICE_SYNC_CODE_STORAGE_KEY);
    if (saved && saved.trim().length >= 2) {
      return saved.trim().toUpperCase();
    }
    const created = generateRandomSyncCode();
    localStorage.setItem(DEVICE_SYNC_CODE_STORAGE_KEY, created);
    return created;
  } catch {
    return generateRandomSyncCode();
  }
}

export const HISTORICAL_STORAGE_KEYS = [
  '8d_gym_mobile_v8_ppl_1011',
  '8d_gym_mobile_v7_pro',
  '8d_gym_mobile_v6_fresh',
  '8d_gym_mobile_v5',
  '8d_gym_mobile_v4',
  '8d_gym_mobile_v3',
  '8d_gym_mobile_v2',
  '8d_gym_mobile_v1',
];

export const DEFAULT_PUSH_PREFS: PushPrefs = {
  masterEnabled: true,
  sleepReminder: true,
  morningWake: true,
  streakGuard: true,
  weighInReminder: true,
  restTimerPush: true,
};

export function normalizeSyncCode(rawCode?: string | null, fallbackCode?: string): string {
  const cleaned = String(rawCode || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 32);
  if (cleaned.length >= 2) return cleaned;
  if (fallbackCode && fallbackCode.trim().length >= 2) {
    return fallbackCode.trim().toUpperCase();
  }
  return getOrCreateDeviceSyncCode();
}

export function countDoneSetsInDayMap(dayMap?: Record<string, SetEntry[]>): number {
  if (!dayMap || typeof dayMap !== 'object') return 0;
  return Object.values(dayMap).reduce((sum, sets) => {
    if (!Array.isArray(sets)) return sum;
    return sum + sets.filter((s) => s && s.done).length;
  }, 0);
}

export function countStateActivityScore(stateObj?: Partial<GymStateV10> | null): number {
  if (!stateObj || typeof stateObj !== 'object') return 0;
  const logs = stateObj.logsByDate && typeof stateObj.logsByDate === 'object' ? stateObj.logsByDate : {};
  const statuses = stateObj.dayStatusByDate && typeof stateObj.dayStatusByDate === 'object' ? stateObj.dayStatusByDate : {};
  const weights = Array.isArray(stateObj.weightLogs) ? stateObj.weightLogs : [];
  const doneSetsTotal = Object.values(logs).reduce((acc, dm) => acc + countDoneSetsInDayMap(dm), 0);
  return doneSetsTotal * 10 + Object.keys(statuses).length * 25 + Math.max(0, weights.length - 1) * 5;
}

import { addDaysISO } from './dateUtils';

function backfillMissingProposalsOnLegacyMessage(msg: AgentChatMessage, nowISO: string): AgentChatMessage {
  if (msg.role !== 'assistant' || (msg.proposals && msg.proposals.length > 0)) return msg;
  const txt = msg.text || '';
  if (/reset\s*trạng\s*thái\s*buổi\s*tập/i.test(txt)) {
    return {
      ...msg,
      proposals: [
        {
          type: 'clear_workout_logs',
          scope: 'all',
          labelSummary: 'Xoá toàn bộ log buổi tập đã hoàn thành (reset chuỗi về 0)',
        },
      ],
      selectedIndices: [0],
    };
  }
  if (/dồn\s*Buổi\s*Kéo[\s\S]*Thứ\s*5/i.test(txt)) {
    const thuISO = addDaysISO(nowISO, 1);
    return {
      ...msg,
      proposals: [
        {
          type: 'reschedule_day',
          dateISO: thuISO,
          sessionId: 'pull_day',
          workoutTime: '06:00',
          scope: 'single',
          labelSummary: 'Dời Buổi Kéo (Vai · Xô · Tay trước) sang Thứ 5 lúc 06:00',
        },
      ],
      selectedIndices: [0],
      selfAudit: msg.selfAudit || {
        passed: true,
        safetyCheck: 'Bố trí Buổi Kéo vào Thứ 5 giúp giữ nhịp 4 buổi/tuần mà vẫn nghỉ hồi phục hôm nay.',
      },
    };
  }
  if (
    /1\.230\s*kcal/i.test(txt) &&
    /(?:bấm|nhấn)\s*(?:ngay\s*)?nút\s*(?:bên\s*)?dưới/i.test(txt)
  ) {
    return {
      ...msg,
      proposals: [
        {
          type: 'replace_day_nutrition',
          dateISO: nowISO,
          items: [
            { name: 'Sáng: 1 ly bạc xỉu + Pocari', kcal: 230, protein: 4, carb: 42, fat: 5 },
            { name: 'Trưa: Cơm mực rim, top mỡ, chả trứng, canh chua cá + nước mía', kcal: 1000, protein: 41, carb: 138, fat: 30 },
          ],
          labelSummary: 'Ghi đè lại thực đơn hôm nay chuẩn 1.230 kcal · 45g Đạm (xoá dữ liệu thừa cũ)',
        },
      ],
      selectedIndices: [0],
      selfAudit: msg.selfAudit || {
        passed: true,
        safetyCheck: 'Đã gọt bỏ phần cộng trùng dữ liệu cũ để khớp chuẩn 1.230 kcal thực tế.',
        estimateNote: 'Ước lượng thực tế ~75–80%',
      },
    };
  }
  if (
    /4\s*buổi/i.test(txt) &&
    /(?:bấm|nhấn)\s*(?:ngay\s*)?nút\s*(?:bên\s*)?dưới/i.test(txt)
  ) {
    return {
      ...msg,
      proposals: [
        {
          type: 'update_strategy',
          goal: 'cut',
          targetWeightKg: 95,
          workoutTime: '06:00',
          labelSummary: 'Áp dụng chiến lược Giảm mỡ giữ cơ (đích 95kg · 2.290 kcal · 175g Đạm)',
        },
        {
          type: 'set_weekly_split',
          days: {
            '1': { sessionId: 'rest', workoutTime: '06:00' },
            '2': { sessionId: 'press_day', workoutTime: '06:00' },
            '3': { sessionId: 'pull_day', workoutTime: '06:00' },
            '4': { sessionId: 'rest', workoutTime: '06:00' },
            '5': { sessionId: 'legs_day', workoutTime: '06:00' },
            '6': { sessionId: 'upper_day', workoutTime: '07:00' },
            '0': { sessionId: 'rest', workoutTime: '07:00' },
          },
          labelSummary: 'Áp dụng lịch tập 4 buổi/tuần (T3 Đẩy · T4 Kéo · T6 Chân · T7 Thân trên)',
        },
      ],
      selectedIndices: [0, 1],
      selfAudit: msg.selfAudit || {
        passed: true,
        safetyCheck: 'Tần suất 4 buổi/tuần xen kẽ ngày nghỉ bảo vệ khớp gối ở mức 115kg.',
      },
    };
  }
  return msg;
}

function sanitizeAgentMessages(raw: unknown, nowISO = getTodayISO()): AgentChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        typeof m.id === 'string' &&
        typeof m.text === 'string' &&
        !String(m.text).includes('Unexpected token \'<\'')
    )
    .slice(-28)
    .map((m) =>
      backfillMissingProposalsOnLegacyMessage(
        {
          id: m.id,
          role: m.role === 'user' ? 'user' : 'assistant',
          text: m.text,
          createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date().toISOString(),
          proposals: Array.isArray(m.proposals) ? m.proposals : undefined,
          selectedIndices: Array.isArray(m.selectedIndices) ? m.selectedIndices : undefined,
          applied: Boolean(m.applied),
          undone: Boolean(m.undone),
          quickReplies: Array.isArray(m.quickReplies) ? m.quickReplies : undefined,
          selfAudit: m.selfAudit && typeof m.selfAudit === 'object' ? m.selfAudit : null,
        },
        nowISO
      )
    );
}

export function createFreshDefaultState(todayOverride?: string): GymStateV10 {
  const nowISO = todayOverride || getTodayISO();
  const starterWeight = Number(DEFAULT_USER_PROFILE.weightKg) || 72;
  const hasExplicitUrlCode =
    typeof window !== 'undefined' &&
    Boolean(new URLSearchParams(window.location.search).get('code')?.trim());
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    syncCode: getOrCreateDeviceSyncCode(),
    lastSyncedAt: null,
    hasOnboarded: hasExplicitUrlCode,
    coachPersona: 'standard',
    installBannerDismissed: false,
    profileInput: { ...(DEFAULT_USER_PROFILE as any), barbellWeightKg: 20 },
    startDateISO: nowISO,
    weeklyPattern: buildDefaultWeeklyPattern(),
    dateOverrides: {},
    logsByDate: {},
    dayStatusByDate: {},
    dayNotesByDate: {},
    agentAutoApply: false,
    agentMessages: [],
    activeSessionId: 'press_day',
    sessionSwaps: {},
    waterByDate: {},
    foodsByDate: {},
    foodServingsByDate: {},
    customMacrosByDate: {},
    preSleepAlertEnabled: true,
    pushPrefs: { ...DEFAULT_PUSH_PREFS },
    icsInstalledAt: null,
    weighInIntervalDays: 7,
    weightLogs: [
      {
        isoDate: nowISO,
        dateLabel: formatVNShortDate(nowISO),
        weight: starterWeight,
        note: 'Cân nặng khởi điểm',
      },
    ],
    selectedGymId: 'tng_uvk',
    customSessionLists: {},
    activePresetBySession: {},
  };
}

export function migrateRawState(rawObj: any, todayOverride?: string): GymStateV10 | null {
  if (!rawObj || typeof rawObj !== 'object') return null;
  const nowISO = todayOverride || getTodayISO();
  const base = createFreshDefaultState(nowISO);

  const rawLogs: Record<string, Record<string, SetEntry[]>> =
    rawObj.logsByDate && typeof rawObj.logsByDate === 'object' ? { ...rawObj.logsByDate } : {};

  Object.keys(rawLogs).forEach((dateKey) => {
    if (diffDaysISO(dateKey, nowISO) > 0) {
      const futureMap = rawLogs[dateKey] || {};
      if (countDoneSetsInDayMap(futureMap) > 0) {
        const todayMap = { ...(rawLogs[nowISO] || {}) };
        Object.keys(futureMap).forEach((exId) => {
          const fSets = futureMap[exId];
          if (Array.isArray(fSets) && fSets.some((s) => s && s.done)) {
            todayMap[exId] = fSets;
          }
        });
        rawLogs[nowISO] = todayMap;
        delete rawLogs[dateKey];
      }
    }
  });

  const waterByDate: Record<string, number> =
    rawObj.waterByDate && typeof rawObj.waterByDate === 'object' ? { ...rawObj.waterByDate } : {};
  if (typeof rawObj.waterDrankMl === 'number' && rawObj.waterDrankMl > 0) {
    const srcDate = typeof rawObj.lastNutritionDateISO === 'string' ? rawObj.lastNutritionDateISO : nowISO;
    if (waterByDate[srcDate] === undefined) {
      waterByDate[srcDate] = rawObj.waterDrankMl;
    }
  }

  const foodsByDate: Record<string, string[]> =
    rawObj.foodsByDate && typeof rawObj.foodsByDate === 'object' ? { ...rawObj.foodsByDate } : {};
  if (Array.isArray(rawObj.loggedFoodIds) && rawObj.loggedFoodIds.length > 0) {
    const srcDate = typeof rawObj.lastNutritionDateISO === 'string' ? rawObj.lastNutritionDateISO : nowISO;
    if (!Array.isArray(foodsByDate[srcDate])) {
      foodsByDate[srcDate] = [...rawObj.loggedFoodIds];
    }
  }

  const foodServingsByDate: Record<string, Record<string, number>> =
    rawObj.foodServingsByDate && typeof rawObj.foodServingsByDate === 'object'
      ? { ...rawObj.foodServingsByDate }
      : {};

  for (const [dISO, idList] of Object.entries(foodsByDate)) {
    if (!Array.isArray(idList) || idList.length === 0) continue;
    if (!foodServingsByDate[dISO]) {
      const map: Record<string, number> = {};
      for (const fid of idList) {
        map[fid] = (map[fid] || 0) + 1;
      }
      foodServingsByDate[dISO] = map;
    }
  }

  const customMacrosByDate: Record<string, CustomMacroItem[]> =
    rawObj.customMacrosByDate && typeof rawObj.customMacrosByDate === 'object'
      ? { ...rawObj.customMacrosByDate }
      : {};

  let startDateISO = typeof rawObj.startDateISO === 'string' ? rawObj.startDateISO : nowISO;
  if (diffDaysISO(startDateISO, nowISO) > 0) startDateISO = nowISO;
  const allDates = [
    ...Object.keys(rawLogs),
    ...Object.keys(rawObj.dayStatusByDate || {}),
  ]
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  if (allDates.length > 0 && diffDaysISO(allDates[0], startDateISO) < 0) {
    startDateISO = allDates[0];
  }

  return {
    ...base,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: typeof rawObj.updatedAt === 'string' ? rawObj.updatedAt : base.updatedAt,
    syncCode: normalizeSyncCode(rawObj.syncCode),
    lastSyncedAt: rawObj.lastSyncedAt || null,
    hasOnboarded: rawObj.hasOnboarded !== undefined ? Boolean(rawObj.hasOnboarded) : true,
    coachPersona: (rawObj.coachPersona === 'savage' ? 'savage' : 'standard') as CoachPersonaId,
    installBannerDismissed: Boolean(rawObj.installBannerDismissed),
    profileInput: { ...base.profileInput, ...(rawObj.profileInput || {}) },
    startDateISO,
    weeklyPattern: rawObj.weeklyPattern || base.weeklyPattern,
    dateOverrides: rawObj.dateOverrides && typeof rawObj.dateOverrides === 'object' ? rawObj.dateOverrides : {},
    logsByDate: rawLogs,
    dayStatusByDate:
      rawObj.dayStatusByDate && typeof rawObj.dayStatusByDate === 'object' ? rawObj.dayStatusByDate : {},
    dayNotesByDate:
      rawObj.dayNotesByDate && typeof rawObj.dayNotesByDate === 'object' ? rawObj.dayNotesByDate : {},
    agentAutoApply: Boolean(rawObj.agentAutoApply),
    agentMessages: sanitizeAgentMessages(rawObj.agentMessages, nowISO),
    activeSessionId:
      rawObj.activeSessionId && rawObj.activeSessionId !== 'rest' ? rawObj.activeSessionId : 'press_day',
    sessionSwaps: rawObj.sessionSwaps && typeof rawObj.sessionSwaps === 'object' ? rawObj.sessionSwaps : {},
    waterByDate,
    foodsByDate,
    foodServingsByDate,
    customMacrosByDate,
    preSleepAlertEnabled: rawObj.preSleepAlertEnabled ?? true,
    pushPrefs: { ...DEFAULT_PUSH_PREFS, ...(rawObj.pushPrefs || {}) },
    icsInstalledAt: rawObj.icsInstalledAt || null,
    weighInIntervalDays: Number(rawObj.weighInIntervalDays) === 14 ? 14 : 7,
    weightLogs:
      Array.isArray(rawObj.weightLogs) && rawObj.weightLogs.length > 0
        ? rawObj.weightLogs
        : [
            {
              isoDate: nowISO,
              dateLabel: formatVNShortDate(nowISO),
              weight: Number(rawObj.profileInput?.weightKg || DEFAULT_USER_PROFILE.weightKg || 72),
              note: 'Cân nặng khởi điểm',
            },
          ],
    selectedGymId: rawObj.selectedGymId || 'tng_uvk',
    customSessionLists:
      rawObj.customSessionLists && typeof rawObj.customSessionLists === 'object' ? rawObj.customSessionLists : {},
    activePresetBySession:
      rawObj.activePresetBySession && typeof rawObj.activePresetBySession === 'object'
        ? rawObj.activePresetBySession
        : {},
  };
}

export function saveLocalStateSafely(stateObj: GymStateV10): void {
  if (typeof localStorage === 'undefined' || !stateObj) return;
  try {
    const prevRaw = localStorage.getItem(CANONICAL_STORAGE_KEY);
    if (prevRaw) {
      localStorage.setItem(BACKUP_STORAGE_KEY, prevRaw);
    }
    localStorage.setItem(
      CANONICAL_STORAGE_KEY,
      JSON.stringify({
        ...stateObj,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: stateObj.updatedAt || new Date().toISOString(),
      })
    );
  } catch {}
}

export function loadAndMigrateLocalState(todayOverride?: string): GymStateV10 {
  const nowISO = todayOverride || getTodayISO();
  if (typeof localStorage === 'undefined') return createFreshDefaultState(nowISO);

  const candidateKeys = [CANONICAL_STORAGE_KEY, ...HISTORICAL_STORAGE_KEYS, BACKUP_STORAGE_KEY];
  let bestState: GymStateV10 | null = null;
  let bestScore = -1;
  let migratedFromLegacy = false;

  candidateKeys.forEach((key, idx) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const migrated = migrateRawState(parsed, nowISO);
      if (!migrated) return;
      const score = countStateActivityScore(migrated);
      if (idx === 0) {
        bestState = migrated;
        bestScore = score;
      } else if (score > bestScore || !bestState) {
        bestState = migrated;
        bestScore = score;
        migratedFromLegacy = true;
      }
    } catch {}
  });

  if (bestState) {
    if (migratedFromLegacy) saveLocalStateSafely(bestState);
    return bestState;
  }
  return createFreshDefaultState(nowISO);
}

export function mergeGymStates(localRaw: any, remoteRaw: any, todayOverride?: string): GymStateV10 {
  const nowISO = todayOverride || getTodayISO();
  const local = migrateRawState(localRaw, nowISO);
  const remote = migrateRawState(remoteRaw, nowISO);
  if (!local && !remote) return createFreshDefaultState(nowISO);
  if (!local) return remote!;
  if (!remote) return local;

  const localTime = Date.parse(local.updatedAt || '') || 0;
  const remoteTime = Date.parse(remote.updatedAt || '') || 0;
  const localScore = countStateActivityScore(local);
  const remoteScore = countStateActivityScore(remote);
  const isFreshLocalInstall = !local.lastSyncedAt && localScore === 0 && (local.agentMessages || []).length === 0;
  const preferRemote = isFreshLocalInstall ? remoteScore > 0 || remoteTime > 0 : remoteTime > localTime;
  const primary = preferRemote ? remote : local;
  const secondary = preferRemote ? local : remote;

  const mergedLogsByDate: GymStateV10['logsByDate'] = !isFreshLocalInstall
    ? { ...primary.logsByDate }
    : { ...secondary.logsByDate, ...primary.logsByDate };

  const mergedStatusByDate: GymStateV10['dayStatusByDate'] = !isFreshLocalInstall
    ? { ...primary.dayStatusByDate }
    : { ...secondary.dayStatusByDate, ...primary.dayStatusByDate };

  const weightByDate: Record<string, GymStateV10['weightLogs'][number]> = {};
  for (const w of secondary.weightLogs) if (w?.isoDate) weightByDate[w.isoDate] = w;
  for (const w of primary.weightLogs) if (w?.isoDate) weightByDate[w.isoDate] = w;
  const mergedWeightLogs = Object.values(weightByDate).sort((a, b) => diffDaysISO(a.isoDate, b.isoDate));

  const mergedWaterByDate = { ...secondary.waterByDate, ...primary.waterByDate };
  const mergedFoodsByDate = { ...secondary.foodsByDate, ...primary.foodsByDate };
  const mergedFoodServingsByDate = { ...secondary.foodServingsByDate, ...primary.foodServingsByDate };
  const mergedCustomMacrosByDate = { ...secondary.customMacrosByDate, ...primary.customMacrosByDate };

  const primaryMsgs = primary.agentMessages || [];
  const secondaryMsgs = secondary.agentMessages || [];
  const mergedMsgs =
    primaryMsgs.length > 0
      ? primaryMsgs
      : secondaryMsgs;

  const earliestDates = [local.startDateISO, remote.startDateISO, ...Object.keys(mergedLogsByDate), ...Object.keys(mergedStatusByDate)]
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();

  return {
    ...primary,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date(Math.max(localTime, remoteTime, Date.now())).toISOString(),
    syncCode: normalizeSyncCode(local.syncCode || remote.syncCode),
    installBannerDismissed: Boolean(local.installBannerDismissed || remote.installBannerDismissed),
    startDateISO: earliestDates[0] || primary.startDateISO,
    dateOverrides: { ...secondary.dateOverrides, ...primary.dateOverrides },
    sessionSwaps: { ...secondary.sessionSwaps, ...primary.sessionSwaps },
    customSessionLists: { ...secondary.customSessionLists, ...primary.customSessionLists },
    activePresetBySession: { ...secondary.activePresetBySession, ...primary.activePresetBySession },
    logsByDate: mergedLogsByDate,
    dayStatusByDate: mergedStatusByDate,
    weightLogs: mergedWeightLogs.length > 0 ? mergedWeightLogs : primary.weightLogs,
    waterByDate: mergedWaterByDate,
    foodsByDate: mergedFoodsByDate,
    foodServingsByDate: mergedFoodServingsByDate,
    customMacrosByDate: mergedCustomMacrosByDate,
    dayNotesByDate: { ...(secondary.dayNotesByDate || {}), ...(primary.dayNotesByDate || {}) },
    agentAutoApply: Boolean(primary.agentAutoApply),
    agentMessages: mergedMsgs.slice(-28),
    pushPrefs: { ...secondary.pushPrefs, ...primary.pushPrefs },
  };
}
