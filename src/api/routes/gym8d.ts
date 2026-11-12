import { Router } from 'express';
import crypto from 'node:crypto';
import https from 'node:https';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import { GoogleGenAI } from '@google/genai';
import { WEB_CHAT_MODEL_FALLBACKS } from '../../config/constants';
import { prisma } from '../../database/prisma';
import { geminiCore, retryWithBackoff, type WebChatHistoryMessage } from '../../shared/services/gemini-core';
import { JWT_SECRET } from '../middleware/auth';
import { preventResponseCaching } from '../client-files';
import {
  generateVapidKeys,
  sendWebPushNotification,
  type VapidKeys,
  type WebPushPayload,
} from '../../services/webPushVapid';

const router = Router();
const MAX_PAYLOAD_CHARS = 2 * 1024 * 1024;
const VAPID_BOT_CONFIG_KEY = 'gym8d-vapid-keys';
const ULTRA_PROXY_CONFIG_KEY = 'gym8d-ultra-proxy';
const DEFAULT_CHATDVT_AVATAR = '/images/chibi/chatdvt.jpg';
const DEFAULT_CLIPROXY_BASE_URL = process.env.CLIPROXY_BASE_URL || 'http://127.0.0.1:8317/v1';
const DEFAULT_CLIPROXY_API_KEY = process.env.CLIPROXY_API_KEY || 'sk-local-ultra-key';

let tablesEnsured = false;
let cachedVapidKeys: VapidKeys | null = null;
let cronStarted = false;
let cachedBotIdentity: { name: string; avatar: string; fetchedAt: number } | null = null;
const activeRestTimers = new Map<string, NodeJS.Timeout>();
const firedDailyPushKeys = new Set<string>();

const SESSION_TITLES: Record<string, string> = {
  press_day: 'Buổi 1: Đẩy (Ngực · Vai · Tay sau)',
  pull_day: 'Buổi 2: Kéo (Vai · Xô · Tay trước)',
  legs_day: 'Buổi 3: Chân (Đùi · Mông · Bắp chân)',
  upper_day: 'Buổi Thứ 7 tự chọn (Thân trên)',
};

const DAY_SHORT: Record<number, string> = {
  0: 'Chủ Nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

function fetchDiscordBotUserViaRest(token: string): Promise<{ name: string; avatar: string } | null> {
  return new Promise((resolve) => {
    const req = https.request(
      'https://discord.com/api/v10/users/@me',
      {
        method: 'GET',
        headers: {
          Authorization: `Bot ${token}`,
          'User-Agent': 'Gym8D-BotIdentity/1.0',
        },
        timeout: 4000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          resolve(null);
          return;
        }
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.id && parsed?.avatar) {
              const ext = String(parsed.avatar).startsWith('a_') ? 'gif' : 'webp';
              resolve({
                name: String(parsed.global_name || parsed.username || 'ChatDVT'),
                avatar: `https://cdn.discordapp.com/avatars/${parsed.id}/${parsed.avatar}.${ext}?size=128`,
              });
              return;
            }
          } catch {}
          resolve(null);
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

export async function ensureGymTablesExist(): Promise<void> {
  if (tablesEnsured) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GymUserState" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "code" TEXT NOT NULL,
      "schemaVersion" INTEGER NOT NULL DEFAULT 10,
      "data" TEXT NOT NULL DEFAULT '{}',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "GymUserState_code_key" ON "GymUserState"("code");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GymPushSubscription" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "code" TEXT NOT NULL,
      "endpoint" TEXT NOT NULL,
      "p256dh" TEXT NOT NULL,
      "auth" TEXT NOT NULL,
      "userAgent" TEXT NOT NULL DEFAULT '',
      "prefsJson" TEXT NOT NULL DEFAULT '{}',
      "enabled" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "GymPushSubscription_endpoint_key" ON "GymPushSubscription"("endpoint");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GymPushSubscription_code_idx" ON "GymPushSubscription"("code");
  `);
  tablesEnsured = true;
}

export async function getOrCreateVapidKeys(): Promise<VapidKeys> {
  if (cachedVapidKeys) return cachedVapidKeys;
  await ensureGymTablesExist();
  const existing = await prisma.botConfig.findUnique({
    where: { key: VAPID_BOT_CONFIG_KEY },
  });
  if (existing && existing.features) {
    try {
      const parsed = JSON.parse(existing.features);
      if (parsed && parsed.publicKey && parsed.privateKeyJwk) {
        cachedVapidKeys = parsed as VapidKeys;
        return cachedVapidKeys;
      }
    } catch {}
  }
  const fresh = generateVapidKeys();
  await prisma.botConfig.upsert({
    where: { key: VAPID_BOT_CONFIG_KEY },
    update: { features: JSON.stringify(fresh) },
    create: {
      key: VAPID_BOT_CONFIG_KEY,
      systemPrompts: '{}',
      features: JSON.stringify(fresh),
    },
  });
  cachedVapidKeys = fresh;
  return fresh;
}

function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (cleaned.length < 2 || cleaned.length > 32) return null;
  return cleaned;
}

function countDoneSets(dayMap: Record<string, any> | undefined): number {
  if (!dayMap || typeof dayMap !== 'object') return 0;
  return Object.values(dayMap).reduce((sum: number, sets: any) => {
    if (!Array.isArray(sets)) return sum;
    return sum + sets.filter((s) => s && s.done).length;
  }, 0);
}

function scoreState(stateObj: Record<string, any> | null | undefined): number {
  if (!stateObj || typeof stateObj !== 'object') return 0;
  const logs = stateObj.logsByDate && typeof stateObj.logsByDate === 'object' ? stateObj.logsByDate : {};
  const statuses = stateObj.dayStatusByDate && typeof stateObj.dayStatusByDate === 'object' ? stateObj.dayStatusByDate : {};
  const weights = Array.isArray(stateObj.weightLogs) ? stateObj.weightLogs : [];
  const doneSetsTotal = Object.values(logs).reduce((acc: number, dm: any) => acc + countDoneSets(dm), 0);
  return doneSetsTotal * 10 + Object.keys(statuses).length * 25 + Math.max(0, weights.length - 1) * 5;
}

function mergeServerAndClientState(existing: Record<string, any>, incoming: Record<string, any>): Record<string, any> {
  const existingScore = scoreState(existing);
  const incomingScore = scoreState(incoming);
  const existingTime = Date.parse(String(existing.updatedAt || '')) || 0;
  const incomingTime = Date.parse(String(incoming.updatedAt || '')) || Date.now();

  const preferIncomingScalars = incomingScore > 0 || existingScore === 0 || incomingTime >= existingTime;
  const primary = preferIncomingScalars && !(existingScore > 0 && incomingScore === 0) ? incoming : existing;
  const secondary = primary === incoming ? existing : incoming;

  const mergedLogsByDate: Record<string, any> = {};
  const allLogDates = new Set([
    ...Object.keys(existing.logsByDate || {}),
    ...Object.keys(incoming.logsByDate || {}),
  ]);
  for (const dISO of allLogDates) {
    const eDay = existing.logsByDate?.[dISO] || {};
    const iDay = incoming.logsByDate?.[dISO] || {};
    const exIds = new Set([...Object.keys(eDay), ...Object.keys(iDay)]);
    const mergedDay: Record<string, any> = {};
    for (const exId of exIds) {
      const eSets = Array.isArray(eDay[exId]) ? eDay[exId] : null;
      const iSets = Array.isArray(iDay[exId]) ? iDay[exId] : null;
      if (eSets && !iSets) mergedDay[exId] = eSets;
      else if (iSets && !eSets) mergedDay[exId] = iSets;
      else if (eSets && iSets) {
        const eDone = eSets.filter((s: any) => s && s.done).length;
        const iDone = iSets.filter((s: any) => s && s.done).length;
        if (iDone > eDone) mergedDay[exId] = iSets;
        else if (eDone > iDone) mergedDay[exId] = eSets;
        else mergedDay[exId] = primary === incoming ? iSets : eSets;
      }
    }
    if (Object.keys(mergedDay).length > 0) {
      mergedLogsByDate[dISO] = mergedDay;
    }
  }

  const mergedStatusByDate: Record<string, any> = {};
  const allStatusDates = new Set([
    ...Object.keys(existing.dayStatusByDate || {}),
    ...Object.keys(incoming.dayStatusByDate || {}),
  ]);
  for (const dISO of allStatusDates) {
    const eSt = existing.dayStatusByDate?.[dISO];
    const iSt = incoming.dayStatusByDate?.[dISO];
    if (eSt && !iSt) mergedStatusByDate[dISO] = eSt;
    else if (iSt && !eSt) mergedStatusByDate[dISO] = iSt;
    else if (eSt && iSt) {
      if (iSt.status === 'done' && eSt.status !== 'done') mergedStatusByDate[dISO] = iSt;
      else if (eSt.status === 'done' && iSt.status !== 'done') mergedStatusByDate[dISO] = eSt;
      else mergedStatusByDate[dISO] = primary === incoming ? iSt : eSt;
    }
  }

  const weightMap: Record<string, any> = {};
  for (const w of Array.isArray(secondary.weightLogs) ? secondary.weightLogs : []) {
    if (w && typeof w.isoDate === 'string') weightMap[w.isoDate] = w;
  }
  for (const w of Array.isArray(primary.weightLogs) ? primary.weightLogs : []) {
    if (w && typeof w.isoDate === 'string') weightMap[w.isoDate] = w;
  }
  const mergedWeightLogs = Object.values(weightMap).sort((a: any, b: any) =>
    String(a.isoDate).localeCompare(String(b.isoDate))
  );

  const mergedWaterByDate: Record<string, number> = {
    ...(secondary.waterByDate || {}),
    ...(primary.waterByDate || {}),
  };
  for (const dISO of Object.keys(secondary.waterByDate || {})) {
    mergedWaterByDate[dISO] = Math.max(
      Number(primary.waterByDate?.[dISO] || 0),
      Number(secondary.waterByDate?.[dISO] || 0)
    );
  }

  const primaryMsgs = Array.isArray(primary.agentMessages) ? primary.agentMessages : [];
  const secondaryMsgs = Array.isArray(secondary.agentMessages) ? secondary.agentMessages : [];

  return {
    ...secondary,
    ...primary,
    schemaVersion: Math.max(Number(existing.schemaVersion || 10), Number(incoming.schemaVersion || 10)),
    updatedAt: new Date().toISOString(),
    logsByDate: mergedLogsByDate,
    dayStatusByDate: mergedStatusByDate,
    weightLogs: mergedWeightLogs.length > 0 ? mergedWeightLogs : primary.weightLogs,
    waterByDate: mergedWaterByDate,
    foodsByDate: { ...(secondary.foodsByDate || {}), ...(primary.foodsByDate || {}) },
    foodServingsByDate: { ...(secondary.foodServingsByDate || {}), ...(primary.foodServingsByDate || {}) },
    customMacrosByDate: { ...(secondary.customMacrosByDate || {}), ...(primary.customMacrosByDate || {}) },
    dateOverrides: { ...(secondary.dateOverrides || {}), ...(primary.dateOverrides || {}) },
    sessionSwaps: { ...(secondary.sessionSwaps || {}), ...(primary.sessionSwaps || {}) },
    customSessionLists: { ...(secondary.customSessionLists || {}), ...(primary.customSessionLists || {}) },
    activePresetBySession: { ...(secondary.activePresetBySession || {}), ...(primary.activePresetBySession || {}) },
    dayNotesByDate: { ...(secondary.dayNotesByDate || {}), ...(primary.dayNotesByDate || {}) },
    agentAutoApply: Boolean(primary.agentAutoApply),
    agentMessages: (primaryMsgs.length >= secondaryMsgs.length ? primaryMsgs : secondaryMsgs).slice(-28),
    pushPrefs: { ...(secondary.pushPrefs || {}), ...(primary.pushPrefs || {}) },
  };
}

export async function dispatchPushToCode(code: string, payload: WebPushPayload): Promise<number> {
  await ensureGymTablesExist();
  const vapid = await getOrCreateVapidKeys();
  const subs: Array<any> = await (prisma as any).gymPushSubscription.findMany({
    where: { code, enabled: true },
  });
  let sentCount = 0;
  for (const sub of subs) {
    try {
      const result = await sendWebPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapid
      );
      if (result.ok) {
        sentCount += 1;
      } else if (result.expired) {
        await (prisma as any).gymPushSubscription.deleteMany({
          where: { endpoint: sub.endpoint },
        });
      }
    } catch (err: any) {
      console.warn('[Gym8D Push] Failed sending to endpoint:', err?.message || err);
    }
  }
  return sentCount;
}

router.get('/gym8d/bot-identity', preventResponseCaching, async (_req, res) => {
  try {
    const now = Date.now();
    if (cachedBotIdentity && now - cachedBotIdentity.fetchedAt < 3600_000) {
      return res.json(cachedBotIdentity);
    }
    const token = process.env.DISCORD_TOKEN?.trim();
    if (token) {
      const live = await fetchDiscordBotUserViaRest(token);
      if (live) {
        cachedBotIdentity = { ...live, fetchedAt: now };
        return res.json(cachedBotIdentity);
      }
    }
    return res.json({ name: 'ChatDVT', avatar: DEFAULT_CHATDVT_AVATAR });
  } catch {
    return res.json({ name: 'ChatDVT', avatar: DEFAULT_CHATDVT_AVATAR });
  }
});

router.get('/gym8d/load/:code', preventResponseCaching, async (req, res) => {
  try {
    const code = normalizeCode(req.params.code);
    if (!code) {
      return res.status(400).json({ error: 'Mã đồng bộ phải từ 2-32 ký tự chữ/số' });
    }
    await ensureGymTablesExist();
    const record = await (prisma as any).gymUserState.findUnique({
      where: { code },
    });
    if (!record) {
      return res.status(404).json({ error: 'Chưa có dữ liệu trên đám mây cho mã này' });
    }
    return res.json({
      code: record.code,
      schemaVersion: record.schemaVersion,
      updatedAt: record.updatedAt,
      data: JSON.parse(record.data || '{}'),
    });
  } catch (err: any) {
    console.error('[Gym8D Load] Error:', err?.message || err);
    return res.status(500).json({ error: 'Load failed' });
  }
});

router.post('/gym8d/sync', preventResponseCaching, async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code);
    if (!code) {
      return res.status(400).json({ error: 'Mã đồng bộ phải từ 2-32 ký tự chữ/số' });
    }
    const incomingData = req.body?.data;
    if (!incomingData || typeof incomingData !== 'object' || Array.isArray(incomingData)) {
      return res.status(400).json({ error: 'Missing valid state data object' });
    }
    const rawSerialized = JSON.stringify(incomingData);
    if (rawSerialized.length > MAX_PAYLOAD_CHARS) {
      return res.status(413).json({ error: 'State payload exceeds 2MB limit' });
    }

    await ensureGymTablesExist();
    const forceOverwrite = Boolean(req.body?.forceOverwrite);
    const schemaVersion = Math.max(1, Number(req.body?.schemaVersion) || 10);

    const existingRecord = await (prisma as any).gymUserState.findUnique({
      where: { code },
    });

    let finalDataObj = incomingData;
    if (existingRecord && !forceOverwrite) {
      try {
        const existingParsed = JSON.parse(existingRecord.data || '{}');
        finalDataObj = mergeServerAndClientState(existingParsed, incomingData);
      } catch {
        finalDataObj = incomingData;
      }
    }

    const saved = await (prisma as any).gymUserState.upsert({
      where: { code },
      update: {
        schemaVersion,
        data: JSON.stringify(finalDataObj),
      },
      create: {
        code,
        schemaVersion,
        data: JSON.stringify(finalDataObj),
      },
    });

    return res.json({
      success: true,
      code: saved.code,
      schemaVersion: saved.schemaVersion,
      updatedAt: saved.updatedAt,
      mergedData: finalDataObj,
    });
  } catch (err: any) {
    console.error('[Gym8D Sync] Error:', err?.message || err);
    return res.status(500).json({ error: 'Sync failed' });
  }
});

router.get('/gym8d/push/vapid-public-key', preventResponseCaching, async (_req, res) => {
  try {
    const vapid = await getOrCreateVapidKeys();
    return res.json({ publicKey: vapid.publicKey });
  } catch (err: any) {
    console.error('[Gym8D VAPID] Error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load VAPID public key' });
  }
});

router.post('/gym8d/push/subscribe', preventResponseCaching, async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code) || 'TIEN8D';
    const sub = req.body?.subscription;
    const endpoint = typeof sub?.endpoint === 'string' ? sub.endpoint : '';
    const p256dh = typeof sub?.keys?.p256dh === 'string' ? sub.keys.p256dh : '';
    const auth = typeof sub?.keys?.auth === 'string' ? sub.keys.auth : '';
    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({ error: 'Invalid Web Push subscription payload' });
    }
    await ensureGymTablesExist();
    const userAgent = String(req.body?.userAgent || req.headers['user-agent'] || '').slice(0, 300);
    const prefsJson = JSON.stringify(req.body?.prefs || {});

    await (prisma as any).gymPushSubscription.upsert({
      where: { endpoint },
      update: { code, p256dh, auth, userAgent, prefsJson, enabled: true },
      create: { code, endpoint, p256dh, auth, userAgent, prefsJson, enabled: true },
    });

    if (req.body?.sendWelcome) {
      await dispatchPushToCode(code, {
        title: 'Gấu Gym 8D · Đã bật thông báo iOS',
        body: 'Từ giờ iPhone của bạn sẽ nhận chuông nhắc ngủ, báo thức tập và đếm giờ nghỉ hiệp ngay cả khi khóa màn hình.',
        tag: 'gym8d-welcome-push',
        url: '/gym8D',
      });
    }

    const activeCount = await (prisma as any).gymPushSubscription.count({
      where: { code, enabled: true },
    });
    return res.json({ success: true, code, activeDevices: activeCount });
  } catch (err: any) {
    console.error('[Gym8D Push Subscribe] Error:', err?.message || err);
    return res.status(500).json({ error: 'Subscribe failed' });
  }
});

router.post('/gym8d/push/unsubscribe', preventResponseCaching, async (req, res) => {
  try {
    const endpoint = typeof req.body?.endpoint === 'string' ? req.body.endpoint : '';
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    await ensureGymTablesExist();
    await (prisma as any).gymPushSubscription.deleteMany({ where: { endpoint } });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Unsubscribe failed' });
  }
});

router.post('/gym8d/push/test', preventResponseCaching, async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code) || 'TIEN8D';
    const delaySec = Math.max(0, Math.min(30, Number(req.body?.delaySec ?? 5)));
    await ensureGymTablesExist();
    const subCount = await (prisma as any).gymPushSubscription.count({
      where: { code, enabled: true },
    });
    if (subCount === 0) {
      return res.status(404).json({ error: 'Chưa có thiết bị nào đăng ký nhận thông báo cho mã này' });
    }
    setTimeout(() => {
      dispatchPushToCode(code, {
        title: 'Thông báo iOS — Gấu Gym 8D',
        body: 'Thông báo đẩy trực tiếp từ máy chủ qua Apple APNs đã hoạt động trên màn hình khóa.',
        tag: `gym8d-test-${Date.now()}`,
        url: '/gym8D',
        urgent: true,
      }).catch(() => {});
    }, delaySec * 1000);
    return res.json({ success: true, scheduledInSec: delaySec, devices: subCount });
  } catch {
    return res.status(500).json({ error: 'Test push failed' });
  }
});

router.post('/gym8d/push/rest-timer', preventResponseCaching, async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code) || 'TIEN8D';
    const delaySec = Math.max(5, Math.min(600, Number(req.body?.delaySec || 90)));
    const exerciseName = String(req.body?.exerciseName || 'Bài tập').slice(0, 80);
    const nextSetLabel = String(req.body?.nextSetLabel || 'Vào hiệp tiếp theo').slice(0, 100);

    const existing = activeRestTimers.get(code);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      activeRestTimers.delete(code);
      dispatchPushToCode(code, {
        title: `Hết giờ nghỉ · ${exerciseName}`,
        body: `${nextSetLabel} — Giữ đúng nhịp độ để tối ưu kích thích cơ.`,
        tag: `gym8d-rest-${code}`,
        url: '/gym8D?tab=workout',
        urgent: true,
      }).catch(() => {});
    }, delaySec * 1000);

    activeRestTimers.set(code, timeout);
    return res.json({ success: true, scheduledInSec: delaySec });
  } catch {
    return res.status(500).json({ error: 'Rest timer push schedule failed' });
  }
});

router.post('/gym8d/push/rest-timer/cancel', preventResponseCaching, (req, res) => {
  const code = normalizeCode(req.body?.code) || 'TIEN8D';
  const existing = activeRestTimers.get(code);
  if (existing) {
    clearTimeout(existing);
    activeRestTimers.delete(code);
  }
  return res.json({ success: true });
});

function parseHHMMToMin(hhmm: string): number {
  const [h, m] = String(hhmm || '06:00').split(':').map(Number);
  return Math.max(0, Math.min(23, h || 6)) * 60 + Math.max(0, Math.min(59, m || 0));
}

function minToHHMM(totalMin: number): string {
  const norm = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = Math.round(norm % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getVietnamNowParts(now = new Date()) {
  const vnMs = now.getTime() + 7 * 3600 * 1000;
  const vn = new Date(vnMs);
  const y = vn.getUTCFullYear();
  const mo = String(vn.getUTCMonth() + 1).padStart(2, '0');
  const d = String(vn.getUTCDate()).padStart(2, '0');
  const hh = String(vn.getUTCHours()).padStart(2, '0');
  const mm = String(vn.getUTCMinutes()).padStart(2, '0');
  const todayDow = vn.getUTCDay();

  const tmr = new Date(vnMs + 86400 * 1000);
  const ty = tmr.getUTCFullYear();
  const tmo = String(tmr.getUTCMonth() + 1).padStart(2, '0');
  const td = String(tmr.getUTCDate()).padStart(2, '0');

  return {
    todayISO: `${y}-${mo}-${d}`,
    tomorrowISO: `${ty}-${tmo}-${td}`,
    hhmm: `${hh}:${mm}`,
    todayDow,
    tomorrowDow: tmr.getUTCDay(),
  };
}

export async function runGym8dPushTick(now = new Date()): Promise<void> {
  await ensureGymTablesExist();
  const activeSubs: Array<any> = await (prisma as any).gymPushSubscription.findMany({
    where: { enabled: true },
  });
  if (activeSubs.length === 0) return;

  const codes = Array.from(new Set(activeSubs.map((s) => String(s.code))));
  const { todayISO, tomorrowISO, hhmm, todayDow, tomorrowDow } = getVietnamNowParts(now);

  if (firedDailyPushKeys.size > 600) {
    firedDailyPushKeys.clear();
  }

  for (const code of codes) {
    const stateRec = await (prisma as any).gymUserState.findUnique({ where: { code } });
    if (!stateRec || !stateRec.data) continue;
    let state: Record<string, any>;
    try {
      state = JSON.parse(stateRec.data);
    } catch {
      continue;
    }

    const pushPrefs = state.pushPrefs || {};
    if (state.preSleepAlertEnabled === false && pushPrefs.masterEnabled === false) continue;

    const weeklyPattern = state.weeklyPattern || {
      1: { sessionId: 'rest', workoutTime: '06:00' },
      2: { sessionId: 'press_day', workoutTime: '06:00' },
      3: { sessionId: 'pull_day', workoutTime: '06:00' },
      4: { sessionId: 'rest', workoutTime: '06:00' },
      5: { sessionId: 'legs_day', workoutTime: '06:00' },
      6: { sessionId: 'rest', workoutTime: '07:00' },
      0: { sessionId: 'rest', workoutTime: '07:00' },
    };
    const overrides = state.dateOverrides || {};
    const dayStatuses = state.dayStatusByDate || {};
    const profile = state.profileInput || {};
    const leadMin = Math.max(15, Math.min(90, Number(profile.preSleepLeadMin || 30)));

    const todayRule = overrides[todayISO] || weeklyPattern[todayDow] || { sessionId: 'rest', workoutTime: '06:00' };
    const tomorrowRule = overrides[tomorrowISO] || weeklyPattern[tomorrowDow] || { sessionId: 'rest', workoutTime: '06:00' };
    const todaySessId = String(todayRule.sessionId || 'rest');
    const tomorrowSessId = String(tomorrowRule.sessionId || 'rest');
    const tmrWorkoutMin = parseHHMMToMin(tomorrowRule.workoutTime || profile.workoutTime || '06:00');
    const tmrWakeMin = tmrWorkoutMin <= 540 ? tmrWorkoutMin - 45 : 390;
    const sleepMin = tmrWakeMin - 450;
    const bedPrepHHMM = minToHHMM(sleepMin - leadMin);
    const sleepHHMM = minToHHMM(sleepMin);

    const todayWorkoutMin = parseHHMMToMin(todayRule.workoutTime || profile.workoutTime || '06:00');
    const todayWakeHHMM = minToHHMM(todayWorkoutMin <= 540 ? todayWorkoutMin - 45 : 390);

    const bedKey = `${code}_${todayISO}_bed_${hhmm}`;
    if (pushPrefs.sleepReminder !== false && hhmm === bedPrepHHMM && !firedDailyPushKeys.has(bedKey)) {
      firedDailyPushKeys.add(bedKey);
      const tmrLabel = SESSION_TITLES[tomorrowSessId];
      await dispatchPushToCode(code, {
        title: `Chuẩn bị đi ngủ (${bedPrepHHMM})`,
        body: tmrLabel
          ? `Sáng mai (${DAY_SHORT[tomorrowDow]}) ca ${tomorrowRule.workoutTime || '06:00'}: ${tmrLabel}. Soạn đồ tập và lên giường trước ${sleepHHMM}.`
          : `Ngày mai (${DAY_SHORT[tomorrowDow]}) nghỉ hồi phục cơ. Lên giường trước ${sleepHHMM} để cơ bắp tái tạo tối đa.`,
        tag: bedKey,
        url: '/gym8D?tab=schedule',
      });
    }

    const wakeKey = `${code}_${todayISO}_wake_${hhmm}`;
    if (
      pushPrefs.morningWake !== false &&
      SESSION_TITLES[todaySessId] &&
      hhmm === todayWakeHHMM &&
      !firedDailyPushKeys.has(wakeKey)
    ) {
      firedDailyPushKeys.add(wakeKey);
      await dispatchPushToCode(code, {
        title: `Thức dậy đi tập · Ca ${todayRule.workoutTime || '06:00'}`,
        body: `Hôm nay: ${SESSION_TITLES[todaySessId]}. Uống 400ml nước ấm và ăn nhẹ trước khi tới phòng tập.`,
        tag: wakeKey,
        url: '/gym8D?tab=workout',
      });
    }

    const streakKey = `${code}_${todayISO}_streak_2000`;
    const todayStatus = dayStatuses[todayISO]?.status;
    if (
      pushPrefs.streakGuard !== false &&
      hhmm === '20:00' &&
      SESSION_TITLES[todaySessId] &&
      todayStatus !== 'done' &&
      todayStatus !== 'missed' &&
      !firedDailyPushKeys.has(streakKey)
    ) {
      firedDailyPushKeys.add(streakKey);
      await dispatchPushToCode(code, {
        title: 'Chưa chốt buổi tập hôm nay',
        body: `Bạn có lịch ${SESSION_TITLES[todaySessId]} hôm nay. Vào ứng dụng chốt hoàn thành hoặc báo nghỉ để giữ chuỗi kỷ luật.`,
        tag: streakKey,
        url: '/gym8D?tab=coach',
      });
    }

    const weighKey = `${code}_${todayISO}_weigh_0630`;
    if (pushPrefs.weighInReminder !== false && hhmm === '06:30' && !firedDailyPushKeys.has(weighKey)) {
      const interval = Number(state.weighInIntervalDays) === 14 ? 14 : 7;
      const startISO = String(state.startDateISO || todayISO);
      const diffDays = Math.round(
        (Date.parse(`${todayISO}T12:00:00Z`) - Date.parse(`${startISO}T12:00:00Z`)) / 86400000
      );
      const alreadyWeighed = Array.isArray(state.weightLogs) && state.weightLogs.some((w: any) => w?.isoDate === todayISO);
      if (diffDays >= 0 && diffDays % interval === 0 && !alreadyWeighed) {
        firedDailyPushKeys.add(weighKey);
        await dispatchPushToCode(code, {
          title: 'Hôm nay tới kỳ cân định kỳ',
          body: 'Bước lên cân lúc bụng rỗng buổi sáng và báo số kg cho ChatDVT hoặc cập nhật vào biểu đồ.',
          tag: weighKey,
          url: '/gym8D?tab=coach',
        });
      }
    }
  }
}

const agentRateMap = new Map<string, { count: number; resetAt: number }>();
const ultraUnlockRateMap = new Map<string, { count: number; resetAt: number }>();

function checkUltraUnlockRateLimit(ip: string): boolean {
  const now = Date.now();
  const cur = ultraUnlockRateMap.get(ip);
  if (!cur || now > cur.resetAt) {
    if (ultraUnlockRateMap.size > 300) ultraUnlockRateMap.clear();
    ultraUnlockRateMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (cur.count >= 8) return false;
  cur.count += 1;
  return true;
}

function safeVerifyOwnerPasskey(candidate: unknown): boolean {
  const expected = (process.env.GYM8D_ULTRA_PASSKEY || process.env.ADMIN_PASSWORD || '').trim();
  if (!expected || typeof candidate !== 'string' || !candidate.trim()) return false;
  const a = crypto.createHash('sha256').update(candidate.trim(), 'utf8').digest();
  const b = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

function verifyUltraOwnerJwt(rawHeader: unknown): boolean {
  if (typeof rawHeader !== 'string' || !rawHeader.trim()) return false;
  try {
    const decoded: any = jwt.verify(rawHeader.trim(), JWT_SECRET);
    return Boolean(decoded && decoded.role === 'gym8d_ultra_owner');
  } catch {
    return false;
  }
}

async function resolveCliProxySettings(): Promise<{ baseUrl: string; apiKey: string }> {
  let baseUrl = DEFAULT_CLIPROXY_BASE_URL;
  let apiKey = DEFAULT_CLIPROXY_API_KEY;
  try {
    const row = await prisma.botConfig.findUnique({ where: { key: ULTRA_PROXY_CONFIG_KEY } });
    if (row?.systemPrompts) {
      const parsed = JSON.parse(row.systemPrompts);
      if (typeof parsed.baseUrl === 'string' && parsed.baseUrl.startsWith('http')) {
        baseUrl = parsed.baseUrl.replace(/\/+$/, '');
      }
      if (typeof parsed.apiKey === 'string' && parsed.apiKey.trim()) {
        apiKey = parsed.apiKey.trim();
      }
    }
  } catch {}
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

function maskProxyUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return 'CLIProxyAPI';
  }
}

async function probeCliProxyStatus(
  baseUrl: string,
  apiKey: string
): Promise<{ online: boolean; reason: string; models: string[] }> {
  const nodeFetch: any = (globalThis as any).fetch;
  if (typeof nodeFetch !== 'function') {
    return { online: false, reason: 'no_fetch_runtime', models: [] };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await nodeFetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { online: false, reason: `HTTP ${res.status}`, models: [] };
    }
    const body: any = await res.json().catch(() => ({}));
    const models: string[] = Array.isArray(body?.data)
      ? body.data.map((m: any) => String(m?.id || '').trim()).filter(Boolean)
      : [];
    return { online: true, reason: 'CLIProxyAPI trực tuyến', models };
  } catch (err: any) {
    const code = err?.cause?.code || err?.code || (err?.name === 'AbortError' ? 'TIMEOUT' : '');
    return {
      online: false,
      reason: String(code || err?.message || 'ECONNREFUSED').slice(0, 60),
      models: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

function formatEngineLabel(model: string, tier: 'ultra' | 'free'): string {
  const m = String(model || '').toLowerCase();
  if (tier === 'ultra') {
    if (m.includes('carbon')) return 'Carbon High · Ultra';
    if (m.includes('argon')) return 'Argon High · Ultra';
    if (m.includes('3.8-flash')) return 'Flash 3.8 · Ultra';
    return `${model} · Ultra`;
  }
  if (m.includes('3.5-flash-lite')) return 'Flash 3.5 Lite · Free';
  if (m.includes('3.1-flash-lite')) return 'Flash 3.1 Lite · Free';
  if (m.includes('gemma')) return 'Gemma 4 · Free';
  return `${model} · Free`;
}

router.get('/gym8d/ultra/status', preventResponseCaching, async (req, res) => {
  const isOwner = verifyUltraOwnerJwt(req.headers['x-gym8d-ultra-token']);
  if (!isOwner) {
    return res.json({ unlocked: false });
  }
  const cfg = await resolveCliProxySettings();
  const probe = await probeCliProxyStatus(cfg.baseUrl, cfg.apiKey);
  return res.json({
    unlocked: true,
    proxyOnline: probe.online,
    proxyReason: probe.reason,
    availableModels: probe.models,
    proxyUrlMasked: maskProxyUrl(cfg.baseUrl),
  });
});

router.post('/gym8d/ultra/unlock', preventResponseCaching, async (req, res) => {
  const ip = String(req.headers['cf-connecting-ip'] || req.ip || 'local');
  if (!checkUltraUnlockRateLimit(ip)) {
    return res.status(429).json({ error: 'Thử sai quá nhiều lần, vui lòng đợi 15 phút.' });
  }
  if (!safeVerifyOwnerPasskey(req.body?.passkey)) {
    return res.status(401).json({ error: 'Mật khẩu chủ sở hữu không chính xác.' });
  }

  const customUrl = typeof req.body?.customProxyUrl === 'string' ? req.body.customProxyUrl.trim() : '';
  const customKey = typeof req.body?.customProxyKey === 'string' ? req.body.customProxyKey.trim() : '';
  if (customUrl || customKey) {
    const cur = await resolveCliProxySettings();
    const payload = JSON.stringify({
      baseUrl: customUrl && /^https?:\/\//i.test(customUrl) ? customUrl.replace(/\/+$/, '') : cur.baseUrl,
      apiKey: customKey || cur.apiKey,
    });
    await prisma.botConfig.upsert({
      where: { key: ULTRA_PROXY_CONFIG_KEY },
      update: { systemPrompts: payload },
      create: { key: ULTRA_PROXY_CONFIG_KEY, systemPrompts: payload, features: '{}' },
    });
  }

  const cfg = await resolveCliProxySettings();
  const probe = await probeCliProxyStatus(cfg.baseUrl, cfg.apiKey);
  const token = jwt.sign({ role: 'gym8d_ultra_owner', v: 1 }, JWT_SECRET, { expiresIn: '365d' });
  return res.json({
    ok: true,
    token,
    proxyOnline: probe.online,
    proxyReason: probe.reason,
    availableModels: probe.models,
    proxyUrlMasked: maskProxyUrl(cfg.baseUrl),
  });
});

function checkAgentRateLimit(ip: string): boolean {
  const now = Date.now();
  const cur = agentRateMap.get(ip);
  if (!cur || now > cur.resetAt) {
    if (agentRateMap.size > 500) agentRateMap.clear();
    agentRateMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (cur.count >= 40) return false;
  cur.count += 1;
  return true;
}

function stripLeadingEmoji(str: string): string {
  return String(str || '')
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/gu, '')
    .trim();
}

function normalizeSessionIdAlias(raw: unknown): string | null {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return null;
  if (s === 'press_day' || s === 'push_day' || s === 'press' || s === 'push' || s.includes('đẩy') || s.includes('ngực')) {
    return 'press_day';
  }
  if (s === 'pull_day' || s === 'pull' || s === 'back' || s.includes('kéo') || s.includes('xô')) {
    return 'pull_day';
  }
  if (s === 'legs_day' || s === 'leg_day' || s === 'legs' || s === 'leg' || s.includes('chân')) {
    return 'legs_day';
  }
  if (s === 'upper_day' || s === 'upper' || s === 'fullbody' || s.includes('thân trên')) {
    return 'upper_day';
  }
  if (s === 'rest' || s === 'off' || s === 'rest_day' || s.includes('nghỉ')) {
    return 'rest';
  }
  return null;
}

function normalizeDayOfWeekKey(rawKey: string): number | null {
  const k = String(rawKey || '').trim().toLowerCase();
  if (/^[0-6]$/.test(k)) return Number(k);
  if (k === '7' || k === 'cn' || k.includes('chủ nhật') || k === 'sun' || k === 'sunday') return 0;
  if (k === 't2' || k.includes('thứ 2') || k === 'mon' || k === 'monday') return 1;
  if (k === 't3' || k.includes('thứ 3') || k === 'tue' || k === 'tuesday') return 2;
  if (k === 't4' || k.includes('thứ 4') || k === 'wed' || k === 'wednesday') return 3;
  if (k === 't5' || k.includes('thứ 5') || k === 'thu' || k === 'thursday') return 4;
  if (k === 't6' || k.includes('thứ 6') || k === 'fri' || k === 'friday') return 5;
  if (k === 't7' || k.includes('thứ 7') || k === 'sat' || k === 'saturday') return 6;
  return null;
}

function normalizeHistoryModelContent(rawContent: string): string {
  const trimmed = String(rawContent || '').trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed.slice(0, 1800);
  }
  return JSON.stringify({
    reply: trimmed.slice(0, 1400),
    proposals: [],
  });
}

async function generateGymAgentJsonWithFallback(params: {
  message: string;
  history: WebChatHistoryMessage[];
  systemInstruction: string;
  temperature?: number;
  maxOutputTokens?: number;
  ultra?: { enabled: boolean; preferredModel?: string };
}): Promise<{ text: string; model: string; tier: 'ultra' | 'free'; fallbackNote?: string }> {
  let ultraFailReason = '';

  // 1. Exclusive Owner Ultra Path via CLIProxyAPI (locked by signed JWT)
  if (params.ultra?.enabled && params.ultra.preferredModel !== 'free') {
    const { baseUrl, apiKey } = await resolveCliProxySettings();
    const allowedUltra = ['gemini-4-carbon-high', 'gemini-3.8-flash-high', 'gemini-4-argon-high'];
    const pref = allowedUltra.includes(String(params.ultra.preferredModel))
      ? String(params.ultra.preferredModel)
      : 'gemini-4-carbon-high';
    const ultraChain = Array.from(new Set([pref, ...allowedUltra]));

    for (const ultraModel of ultraChain) {
      const nodeFetch: any = (globalThis as any).fetch;
      if (typeof nodeFetch !== 'function') break;
      const ultraSys = `${params.systemInstruction}\n\n[THÔNG TIN HỆ THỐNG THỰC TẾ: Lượt này đang chạy trực tiếp bằng model "${ultraModel}" (${formatEngineLabel(
        ultraModel,
        'ultra'
      )}) qua CLIProxyAPI riêng của Tiến. Nếu Tiến hỏi đang chạy model gì, hãy báo chính xác tên model này.]`;
      const openAiMessages = [
        { role: 'system', content: ultraSys },
        ...params.history.map((h) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content:
            h.role === 'model' ? normalizeHistoryModelContent(h.content) : h.content.slice(0, 1400),
        })),
        { role: 'user', content: params.message },
      ];
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20_000);
      try {
        const res = await nodeFetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: ultraModel,
            reasoning_effort: 'low',
            temperature: params.temperature ?? 0.25,
            response_format: { type: 'json_object' },
            messages: openAiMessages,
          }),
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data: any = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          const text = typeof content === 'string' ? content.trim() : '';
          if (text) {
            console.info(`[Gym8D Ultra CLIProxy] Response generated by ${ultraModel}`);
            return { text, model: ultraModel, tier: 'ultra' };
          }
        } else {
          ultraFailReason = `HTTP ${res.status}`;
          console.warn(`[Gym8D Ultra CLIProxy] ${ultraModel} returned HTTP ${res.status}`);
          if (res.status === 401 || res.status === 403) {
            break;
          }
        }
      } catch (uErr: any) {
        const code = uErr?.cause?.code || uErr?.code || (uErr?.name === 'AbortError' ? 'TIMEOUT' : '');
        ultraFailReason = String(code || uErr?.message || 'ECONNREFUSED').slice(0, 48);
        console.warn(`[Gym8D Ultra CLIProxy] ${ultraModel} unreachable: ${uErr?.message || uErr}`);
        break; // If proxy host is unreachable, fall through immediately to Free API
      } finally {
        clearTimeout(timer);
      }
    }
  }

  // 2. Standard 3-Tier Free Gemini API Fallback
  const apiKey = await geminiCore.getApiKey('global');
  if (!apiKey) throw new Error('Missing Gemini API key');

  const ai = new GoogleGenAI({ apiKey });
  const normalizedHistory = params.history.map((item) => ({
    role: item.role,
    parts: [
      {
        text:
          item.role === 'model'
            ? normalizeHistoryModelContent(item.content)
            : item.content.slice(0, 1400),
      },
    ],
  }));

  let lastError: any;
  for (const model of WEB_CHAT_MODEL_FALLBACKS) {
    try {
      const isGemma = model.toLowerCase().startsWith('gemma');
      const freeSys = `${params.systemInstruction}\n\n[THÔNG TIN HỆ THỐNG THỰC TẾ: Lượt này đang chạy bằng model "${model}" (${formatEngineLabel(
        model,
        'free'
      )})${
        ultraFailReason ? ` do CLIProxyAPI trên Server chưa phản hồi (${ultraFailReason})` : ''
      }. Nếu Tiến hỏi đang chạy model gì, hãy báo trung thực tên model thực tế này.]`;
      const contents = isGemma
        ? [
            ...normalizedHistory,
            {
              role: 'user' as const,
              parts: [
                {
                  text: `${freeSys}\n\n---\nTin nhắn người dùng (TRẢ VỀ DUY NHẤT 1 JSON OBJECT):\n${params.message}`,
                },
              ],
            },
          ]
        : [
            ...normalizedHistory,
            { role: 'user' as const, parts: [{ text: params.message }] },
          ];

      const response = await retryWithBackoff(
        () =>
          ai.models.generateContent({
            model,
            contents,
            config: {
              ...(isGemma ? {} : { systemInstruction: freeSys }),
              ...(isGemma ? {} : { responseMimeType: 'application/json' }),
              temperature: params.temperature ?? 0.25,
              topP: 0.9,
              maxOutputTokens: params.maxOutputTokens ?? 2400,
              httpOptions: { timeout: 22_000 },
            },
          }),
        1,
        600,
        22_000
      );

      const text = response.text?.trim();
      if (!text) throw new Error('Empty JSON response');
      console.info(`[Gym8D Agent JSON] Response generated by ${model}`);
      return {
        text,
        model,
        tier: 'free',
        fallbackNote: ultraFailReason
          ? `CLIProxyAPI Server chưa thông (${ultraFailReason})`
          : undefined,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gym8D Agent JSON] ${model} failed: ${err?.message || err}`);
    }
  }
  throw lastError || new Error('All Gym8D agent models failed');
}

function replyPromisesActionButton(replyText: string): boolean {
  return /(?:bấm|nhấn|chạm)\s*(?:ngay\s*)?nút|nút\s*(?:bên\s*)?dưới|bấm\s*áp\s*dụng|chốt\s*đơn|chuẩn\s*bị\s*sẵn\s*lệnh|cập\s*nhật\s*(?:lại\s*)?(?:dữ\s*liệu|chiến\s*lược|lịch\s*tập|vào\s*hệ\s*thống)/i.test(
    String(replyText || '')
  );
}

function userRequestsActionOrSchedule(msgText: string): boolean {
  return /(?:chỉnh|sửa|tính|cập\s*nhật)\s*lại|xoá|xóa|reset|làm\s*lại\s*từ\s*đầu|ghi\s*đè|đưa\s*ra\s*lịch|lịch\s*(?:tập\s*)?tham\s*khảo|kế\s*hoạch\s*(?:tuần\s*)?tiếp\s*theo|review\s*(?:giúp\s*tao\s*)?(?:thể\s*trạng|chiến\s*lược|lịch)|tổng\s*kết\s*(?:giúp\s*tao\s*)?tuần|nút\s*nào\s*để\s*bấm|không\s*có\s*nút|đổi\s*bài|hạ\s*tạ|tạ\s*nặng/i.test(
    String(msgText || '')
  );
}

function stripFalseButtonPromise(replyText: string): string {
  const lines = String(replyText || '').split('\n');
  const cleaned = lines.filter(
    (line) =>
      !/(?:bấm|nhấn|chạm)\s*(?:ngay\s*)?nút|nút\s*(?:bên\s*)?dưới\s*để/i.test(line.trim())
  );
  return cleaned.join('\n').trim() || String(replyText || '').trim();
}

function parseAgentJsonResponse(rawText: string): {
  reply: string;
  proposals: any[];
  quickReplies: string[];
  selfAudit: any;
} {
  const trimmed = String(rawText || '').trim();
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const extractObj = (obj: any) => ({
    reply: String(obj.reply || 'Đã phân tích và chuẩn bị phương án bên dưới cho mày.'),
    proposals: Array.isArray(obj.proposals) ? obj.proposals : [],
    quickReplies: Array.isArray(obj.quickReplies)
      ? obj.quickReplies.filter((x: unknown) => typeof x === 'string' && x.trim()).slice(0, 4)
      : [],
    selfAudit: obj.selfAudit && typeof obj.selfAudit === 'object' ? obj.selfAudit : null,
  });

  try {
    const parsed = JSON.parse(stripped);
    if (parsed && typeof parsed === 'object') {
      return extractObj(parsed);
    }
  } catch {}

  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      const sub = JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
      if (sub && typeof sub === 'object' && ('reply' in sub || 'proposals' in sub)) {
        return extractObj(sub);
      }
    } catch {}
  }

  return {
    reply: trimmed || 'Mình đã ghi nhận yêu cầu của bạn.',
    proposals: [],
    quickReplies: [],
    selfAudit: null,
  };
}

/**
 * Layer 2 Deterministic AI Self-Audit & Proposal Sanitizer:
 * Verifies catalog IDs, clamps weights/servings, guards joint safety for 115kg bodyweight,
 * checks sustainable weekly frequency, and cleans emoji clutter from labels.
 */
function auditAndOptimizeAgentOutput(
  parsed: { reply: string; proposals: any[]; quickReplies: string[]; selfAudit: any },
  todayISO: string,
  catalog: { exercises?: Array<{ id: string; jointSafe?: boolean }>; foods?: Array<{ id: string }> },
  ctx: any
) {
  const validSessionIds = new Set(['press_day', 'pull_day', 'legs_day', 'upper_day', 'rest']);
  const validExIds = new Set((catalog.exercises || []).map((e) => e.id));
  const validFoodIds = new Set((catalog.foods || []).map((f) => f.id));
  const outProposals: any[] = [];
  const autoAdjustments: string[] = [];
  let hasNutritionProposal = false;
  let hasWorkoutOrStrategyProposal = false;

  const rawList = Array.isArray(parsed.proposals) ? parsed.proposals : [];

  for (const item of rawList.slice(0, 14)) {
    if (!item || typeof item !== 'object' || typeof item.type !== 'string') continue;
    const labelSummary = stripLeadingEmoji(item.labelSummary || '');
    if (!labelSummary) continue;
    const rawType = item.type.trim().toLowerCase();
    const normalizedType =
      rawType === 'delete_workout_logs' ||
      rawType === 'reset_workout_logs' ||
      rawType === 'reset_workouts' ||
      rawType === 'clear_workouts'
        ? 'clear_workout_logs'
        : rawType === 'reset_nutrition' ||
          rawType === 'delete_food_logs' ||
          rawType === 'clear_foods'
        ? 'clear_nutrition_logs'
        : rawType;

    switch (normalizedType) {
      case 'add_food_catalog':
        if (typeof item.foodId === 'string' && (validFoodIds.size === 0 || validFoodIds.has(item.foodId))) {
          hasNutritionProposal = true;
          outProposals.push({
            type: 'add_food_catalog',
            dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
            foodId: item.foodId,
            servings: Math.max(0.5, Math.min(8, Number(item.servings) || 1)),
            labelSummary,
          });
        }
        break;

      case 'add_custom_food': {
        hasNutritionProposal = true;
        const kcal = Math.max(5, Math.min(3500, Math.round(Number(item.kcal) || 0)));
        const protein = Math.max(0, Math.min(250, Math.round(Number(item.protein) || 0)));
        const carb = Math.max(0, Math.min(400, Math.round(Number(item.carb) || 0)));
        const fat = Math.max(0, Math.min(180, Math.round(Number(item.fat) || 0)));
        outProposals.push({
          type: 'add_custom_food',
          dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
          name: stripLeadingEmoji(item.name || 'Món ăn').slice(0, 80),
          kcal,
          protein,
          carb,
          fat,
          labelSummary,
        });
        break;
      }

      case 'add_water':
        hasNutritionProposal = true;
        outProposals.push({
          type: 'add_water',
          dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
          amountMl: Math.max(-3000, Math.min(5000, Math.round(Number(item.amountMl) || 250))),
          labelSummary,
        });
        break;

      case 'set_water':
        hasNutritionProposal = true;
        outProposals.push({
          type: 'set_water',
          dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
          waterMl: Math.max(0, Math.min(9000, Math.round(Number(item.waterMl) || 0))),
          labelSummary,
        });
        break;

      case 'remove_food_item':
        if (
          (typeof item.foodId === 'string' && item.foodId.trim()) ||
          (typeof item.customNameMatch === 'string' && item.customNameMatch.trim())
        ) {
          hasNutritionProposal = true;
          outProposals.push({
            type: 'remove_food_item',
            dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
            foodId: typeof item.foodId === 'string' ? item.foodId.trim() : undefined,
            customNameMatch:
              typeof item.customNameMatch === 'string' ? item.customNameMatch.trim() : undefined,
            labelSummary,
          });
        }
        break;

      case 'replace_day_nutrition':
        if (Array.isArray(item.items)) {
          const cleanItems = item.items
            .filter((x: any) => x && typeof x === 'object')
            .slice(0, 12)
            .map((x: any) => ({
              name: stripLeadingEmoji(String(x.name || 'Bữa ăn')).slice(0, 80),
              kcal: Math.max(0, Math.min(4000, Math.round(Number(x.kcal) || 0))),
              protein: Math.max(0, Math.min(300, Math.round(Number(x.protein) || 0))),
              carb: Math.max(0, Math.min(500, Math.round(Number(x.carb) || 0))),
              fat: Math.max(0, Math.min(200, Math.round(Number(x.fat) || 0))),
            }));
          hasNutritionProposal = true;
          outProposals.push({
            type: 'replace_day_nutrition',
            dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
            items: cleanItems,
            waterMl:
              typeof item.waterMl === 'number' && !Number.isNaN(item.waterMl)
                ? Math.max(0, Math.min(9000, Math.round(item.waterMl)))
                : undefined,
            labelSummary,
          });
        }
        break;

      case 'swap_exercise':
        if (
          typeof item.fromExId === 'string' &&
          typeof item.toExId === 'string' &&
          (validExIds.size === 0 || validExIds.has(item.toExId))
        ) {
          hasWorkoutOrStrategyProposal = true;
          outProposals.push({
            type: 'swap_exercise',
            sessionId:
              validSessionIds.has(item.sessionId) && item.sessionId !== 'rest'
                ? item.sessionId
                : ctx?.effectiveSessionId || 'press_day',
            fromExId: item.fromExId,
            toExId: item.toExId,
            labelSummary,
          });
        }
        break;

      case 'set_session_exercises':
        if (Array.isArray(item.exerciseIds)) {
          const filtered = item.exerciseIds
            .map(String)
            .filter((id: string) => validExIds.size === 0 || validExIds.has(id));
          if (filtered.length >= 2) {
            hasWorkoutOrStrategyProposal = true;
            outProposals.push({
              type: 'set_session_exercises',
              sessionId:
                validSessionIds.has(item.sessionId) && item.sessionId !== 'rest'
                  ? item.sessionId
                  : ctx?.effectiveSessionId || 'press_day',
              exerciseIds: filtered.slice(0, 7),
              labelSummary,
            });
          }
        }
        break;

      case 'log_exercise_sets':
        if (typeof item.exId === 'string' && (validExIds.size === 0 || validExIds.has(item.exId))) {
          hasWorkoutOrStrategyProposal = true;
          outProposals.push({
            type: 'log_exercise_sets',
            dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
            sessionId:
              validSessionIds.has(item.sessionId) && item.sessionId !== 'rest'
                ? item.sessionId
                : ctx?.effectiveSessionId || 'press_day',
            exId: item.exId,
            weightKg: Math.max(0, Math.min(350, Number(item.weightKg) || 0)),
            reps: Math.max(1, Math.min(40, Math.round(Number(item.reps) || 10))),
            setsCount: Math.max(1, Math.min(8, Math.round(Number(item.setsCount) || 3))),
            effort: ['warmup', 'easy', 'good', 'hard', 'max'].includes(item.effort)
              ? item.effort
              : 'good',
            labelSummary,
          });
        }
        break;

      case 'adjust_exercise_sets':
        if (typeof item.exId === 'string' && (validExIds.size === 0 || validExIds.has(item.exId))) {
          hasWorkoutOrStrategyProposal = true;
          const newWeightKg = Math.max(0, Math.min(350, Math.round(Number(item.newWeightKg || 0) * 2) / 2));
          const newReps = Math.max(4, Math.min(25, Math.round(Number(item.newReps) || 8)));
          outProposals.push({
            type: 'adjust_exercise_sets',
            dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
            sessionId:
              validSessionIds.has(item.sessionId) && item.sessionId !== 'rest'
                ? item.sessionId
                : ctx?.effectiveSessionId || 'press_day',
            exId: item.exId,
            newWeightKg,
            newReps,
            setsCount: item.setsCount
              ? Math.max(2, Math.min(6, Math.round(Number(item.setsCount))))
              : undefined,
            loggedHeavySet:
              item.loggedHeavySet && Number(item.loggedHeavySet.weightKg) > 0
                ? {
                    weightKg: Math.max(0, Number(item.loggedHeavySet.weightKg)),
                    reps: Math.max(1, Math.round(Number(item.loggedHeavySet.reps) || 4)),
                  }
                : undefined,
            labelSummary,
          });
        }
        break;

      case 'set_day_status': {
        const rawStatus = String(item.status || '').trim().toLowerCase();
        const normStatus =
          rawStatus === 'reset' ||
          rawStatus === 'undone' ||
          rawStatus === 'pending' ||
          rawStatus === 'scheduled' ||
          rawStatus === 'uncheck'
            ? 'clear'
            : rawStatus === 'rest'
            ? 'off'
            : rawStatus;
        if (['done', 'off', 'missed', 'clear'].includes(normStatus)) {
          hasWorkoutOrStrategyProposal = true;
          outProposals.push({
            type: 'set_day_status',
            dateISO: typeof item.dateISO === 'string' ? item.dateISO : todayISO,
            status: normStatus,
            sessionId:
              validSessionIds.has(item.sessionId) && item.sessionId !== 'rest'
                ? item.sessionId
                : undefined,
            note: typeof item.note === 'string' ? stripLeadingEmoji(item.note).slice(0, 240) : undefined,
            labelSummary,
          });
        }
        break;
      }

      case 'clear_workout_logs':
        hasWorkoutOrStrategyProposal = true;
        outProposals.push({
          type: 'clear_workout_logs',
          scope: item.scope === 'date' ? 'date' : 'all',
          dateISO:
            typeof item.dateISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dateISO)
              ? item.dateISO
              : todayISO,
          labelSummary,
        });
        break;

      case 'clear_nutrition_logs':
        hasNutritionProposal = true;
        outProposals.push({
          type: 'clear_nutrition_logs',
          scope: item.scope === 'all' ? 'all' : 'date',
          dateISO:
            typeof item.dateISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dateISO)
              ? item.dateISO
              : todayISO,
          labelSummary,
        });
        break;

      case 'reschedule_day': {
        const normSess = normalizeSessionIdAlias(item.sessionId);
        if (normSess && validSessionIds.has(normSess)) {
          hasWorkoutOrStrategyProposal = true;
          outProposals.push({
            type: 'reschedule_day',
            dateISO:
              typeof item.dateISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dateISO)
                ? item.dateISO
                : todayISO,
            sessionId: normSess,
            workoutTime: typeof item.workoutTime === 'string' ? item.workoutTime : undefined,
            scope: item.scope === 'recurring' ? 'recurring' : 'single',
            labelSummary,
          });
        }
        break;
      }

      case 'set_weekly_split':
        if (item.days && typeof item.days === 'object') {
          const cleanDays: Record<string, { sessionId: string; workoutTime?: string }> = {};
          let workoutDayCount = 0;
          for (const [k, v] of Object.entries(item.days as Record<string, any>)) {
            const dow = normalizeDayOfWeekKey(k);
            const rawSess = typeof v === 'string' ? v : v?.sessionId;
            const normSess = normalizeSessionIdAlias(rawSess);
            if (dow === null || !normSess || !validSessionIds.has(normSess)) continue;
            if (normSess !== 'rest') workoutDayCount += 1;
            cleanDays[String(dow)] = {
              sessionId: normSess,
              workoutTime: typeof v?.workoutTime === 'string' ? v.workoutTime : undefined,
            };
          }
          if (Object.keys(cleanDays).length > 0) {
            if (workoutDayCount > 5) {
              autoAdjustments.push('Giữ tần suất <= 5 buổi/tuần để khớp gối & thần kinh phục hồi tốt khi giảm mỡ.');
            }
            hasWorkoutOrStrategyProposal = true;
            outProposals.push({
              type: 'set_weekly_split',
              days: cleanDays,
              labelSummary,
            });
          }
        }
        break;

      case 'update_strategy':
        if (['cut', 'recomp', 'bulk'].includes(item.goal)) {
          hasWorkoutOrStrategyProposal = true;
          outProposals.push({
            type: 'update_strategy',
            goal: item.goal,
            targetWeightKg:
              Number(item.targetWeightKg) >= 50 && Number(item.targetWeightKg) <= 160
                ? Math.round(Number(item.targetWeightKg) * 10) / 10
                : undefined,
            workoutTime:
              typeof item.workoutTime === 'string' && /^\d{2}:\d{2}$/.test(item.workoutTime)
                ? item.workoutTime
                : undefined,
            labelSummary,
          });
        }
        break;

      case 'log_weight':
        if (Number(item.weightKg) > 38 && Number(item.weightKg) < 220) {
          outProposals.push({
            type: 'log_weight',
            weightKg: Math.round(Number(item.weightKg) * 10) / 10,
            labelSummary,
          });
        }
        break;
    }
  }

  let finalAudit: any = null;
  const rawAudit = parsed.selfAudit;
  if (rawAudit && typeof rawAudit === 'object' && rawAudit.safetyCheck) {
    finalAudit = {
      passed: true,
      safetyCheck: stripLeadingEmoji(String(rawAudit.safetyCheck)).slice(0, 160),
      estimateNote: rawAudit.estimateNote
        ? stripLeadingEmoji(String(rawAudit.estimateNote)).slice(0, 120)
        : hasNutritionProposal
        ? 'Ước lượng khẩu phần thực tế ~75–80%'
        : undefined,
      autoAdjustments: autoAdjustments.length > 0 ? autoAdjustments : undefined,
    };
  } else if (hasNutritionProposal || hasWorkoutOrStrategyProposal) {
    finalAudit = {
      passed: true,
      safetyCheck: hasWorkoutOrStrategyProposal
        ? `Phù hợp thể trạng ${ctx?.bodyAndStrategy?.currentWeightKg || 115}kg · Ưu tiên bảo vệ khớp`
        : 'Đảm bảo cân đối Đạm & tổng Calo mục tiêu trong ngày',
      estimateNote: hasNutritionProposal ? 'Ước lượng thực tế ~75–80%' : undefined,
    };
  }

  return {
    reply: parsed.reply,
    proposals: outProposals,
    quickReplies: parsed.quickReplies.map((q) => stripLeadingEmoji(q)).filter(Boolean),
    selfAudit: finalAudit,
  };
}

router.post('/gym8d/agent-chat', preventResponseCaching, async (req, res) => {
  try {
    const ip = String(req.headers['cf-connecting-ip'] || req.ip || 'local');
    if (!checkAgentRateLimit(ip)) {
      return res.status(429).json({ error: 'Bạn gửi hơi nhanh, đợi vài giây rồi nhắn tiếp nhé.' });
    }

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 2000) {
      return res.status(400).json({ error: 'Tin nhắn không hợp lệ (tối đa 2000 ký tự).' });
    }

    const ctx = req.body?.context || {};
    const catalog = req.body?.catalog || {};
    const todayISO = typeof ctx.todayISO === 'string' ? ctx.todayISO : getVietnamNowParts().todayISO;
    const userDisplayName = typeof ctx.userName === 'string' && ctx.userName.trim() ? ctx.userName.trim() : 'bạn';

    const personaHint =
      `Bạn là ChatDVT — trợ lý AI cá nhân kiêm HLV thể hình & dinh dưỡng đồng hành hằng ngày của ${userDisplayName} (mã hồ sơ: ${ctx.syncCode || 'GYM8D'}). Xưng tao - mày gần gũi, hài hước duyên dáng như anh em tập chung lâu năm, thẳng thắn vào trọng tâm nhưng LUÔN tôn trọng, khích lệ tinh thần và truyền động lực bền bỉ (TUYỆT ĐỐI KHÔNG chửi bới, miệt thị ngoại hình hay dùng từ ngữ xúc phạm). Hãy dựa đúng vào Thứ/Ngày thực tế trong "todayDayLabel" và "upcoming7DaysCalendar" khi tư vấn dời lịch.`;

    const systemInstruction = `${personaHint}

QUY TẮC PHONG CÁCH (CHỐNG AI SLOP):
- TUYỆT ĐỐI KHÔNG lạm dụng icon/emoji trang trí lòe loẹt ở đầu dòng hay trong nút bấm (tối đa 0-1 biểu tượng thật cần thiết trong cả tin nhắn, ưu tiên chữ tiếng Việt gãy gọn, rõ ý, dùng gạch đầu dòng "- " và in đậm "**...**" cho các con số quan trọng).
- Nhãn "labelSummary" trong mảng proposals PHẢI viết sạch sẽ, KHÔNG có emoji ở đầu.

QUY TẮC SỐNG CÒN VỀ NÚT BẤM ("proposals"):
- Giao diện ứng dụng CHỈ hiển thị thẻ nút bấm "Áp dụng thay đổi" khi mảng "proposals" có ít nhất 1 object hành động hợp lệ!
- BẤT CỨ KHI NÀO mày đề xuất lịch tập tham khảo, đổi chiến lược (Cut/Recomp/Bulk), tổng kết tuần kèm kế hoạch tuần tới, điều chỉnh mức tạ, thêm món ăn, hoặc sửa/tính lại tổng calo trong ngày -> BẮT BUỘC PHẢI điền đầy đủ các hành động tương ứng vào mảng "proposals"!
- Nếu người dùng thắc mắc sao tổng calo bị lệch/cộng dồn dữ liệu cũ hoặc nhờ chỉnh lại tổng ăn uống trong ngày (hãy kiểm tra kỹ "nutritionToday.catalogEntries" và "nutritionToday.customEntries"): BẮT BUỘC dùng "replace_day_nutrition" để ghi đè lại danh sách món ăn chuẩn xác của cả ngày đó (xoá sạch các món bị trùng/dư cũ), hoặc dùng "remove_food_item" để xoá đúng món thừa!
- Nếu câu trả lời chỉ thuần túy trò chuyện/hỏi lại mà mảng "proposals" rỗng ([]), TUYỆT ĐỐI KHÔNG ĐƯỢC viết các câu như "Bấm nút bên dưới để cập nhật".

VAI TRÒ & QUY TRÌNH HUẤN LUYỆN THÓI QUEN HẰNG NGÀY:
1) GHI NHẬN TẬP LUYỆN / NGHỈ TẬP / DỜI LỊCH 1 CHẠM:
   - Tiến báo tập xong -> tạo proposal "set_day_status" ("status": "done") kèm "note".
   - Tiến báo bận/xin nghỉ hôm nay -> tạo "set_day_status" ("status": "off" để giữ chuỗi hoặc "missed") và gợi ý "reschedule_day" sang ngày nghỉ gần nhất nếu hợp lý.
   - Người dùng nhờ XOÁ HẾT LOG BUỔI TẬP ĐÃ DONE / RESET TẬP LUYỆN TỪ ĐẦU -> BẮT BUỘC tạo proposal "clear_workout_logs" ("scope": "all") (hoặc "scope": "date" nếu chỉ xoá 1 ngày cụ thể)! Nếu nhờ xoá hết món ăn/nước uống -> dùng "clear_nutrition_logs"!
2) XỬ LÝ MỨC TẠ NẶNG QUÁ / KHÔNG ĐỦ REP HOẶC ĐAU MỎI KHỚP:
   - Giải thích ngắn gọn nguyên nhân (do nhảy tạ hơi gắt, nghỉ chưa đủ, hoặc góc máy chưa hợp thể trạng ${ctx?.bodyAndStrategy?.currentWeightKg || 115}kg).
   - Đưa ra đường lối rõ ràng (ví dụ hạ 10–15% mức tạ về vùng RPE 8 kiểm soát chuẩn 8–10 reps, hoặc đổi sang máy có đệm tựa bảo vệ lưng/gối) VÀ tạo ngay proposal "adjust_exercise_sets" (hoặc "swap_exercise") để Tiến bấm áp dụng ngay!
3) THỐNG KÊ ĂN UỐNG BUỔI TỐI (CHỈ CẦN ĐỘ CHÍNH XÁC 70–80%) & HỎI LẠI KHI QUÁ MƠ HỒ:
   - Nếu Tiến kể các món ăn/nước uống đã đủ đoán khẩu phần phổ biến ở Việt Nam (ví dụ "1 tô phở bò, 2 quả trứng, 1 ly cafe sữa, tầm 2 lít nước"), hãy TỰ ƯỚC LƯỢNG NGAY ở mức 75–80% thực tế (dùng "add_food_catalog" nếu khớp danh mục hoặc "add_custom_food" + "add_water"), đồng thời tổng hợp nhanh trong "reply" xem cộng xong hôm nay đạt khoảng bao nhiêu kcal / đạm so với mục tiêu!
   - NẾU thông tin món ăn quá chung chung khiến sai số quá lớn (ví dụ chỉ nói "nay đi ăn nhậu", "ăn bún ngoài quán với uống trà sữa", "ăn cơm tiệm nhiều đồ ăn" mà chưa rõ món gì/cỡ nào/mấy chén): HÃY HỎI LẠI 1–2 câu cực ngắn gọn trong "reply", chỉ tạo proposal cho những món đã rõ (hoặc để mảng "proposals": []), VÀ điền 2–3 lựa chọn trả lời nhanh vào mảng "quickReplies" (ví dụ: ["Cơm sườn 1 dĩa vừa + canh (~650 kcal)", "Ăn khá no thêm thịt/trứng (~850 kcal)", "Tính mức trung bình giúp tao"]) để Tiến chạm 1 phát trả lời luôn!
4) TỔNG KẾT TUẦN & REVIEW THỂ TRẠNG / CHIẾN LƯỢC (GIẢM MỠ GIỮ CƠ · SIẾT NÉT · TĂNG CƠ):
   - Dựa trực tiếp vào số liệu thật trong BỐI CẢNH 7–14 NGÀY bên dưới (BMI, % mỡ, TDEE, số buổi hoàn thành/bỏ lỡ, tổng tạ, các hiệp bị quá sức, trung bình Calo & Đạm).
   - Khi Tiến hỏi review thể trạng/chiến lược: phân tích thẳng thắn vì sao thể trạng hiện tại (${ctx?.bodyAndStrategy?.currentWeightKg || 115}kg, cao ${ctx?.bodyAndStrategy?.heightCm || 182}cm) nên ưu tiên chiến lược nào (thường là Giảm mỡ giữ cơ thâm hụt vừa phải kết hợp tạ giữ cơ nạc và đi bộ dốc bảo vệ khớp gối, so sánh rõ với Siết nét Recomp và Tăng cơ Bulk), sau đó đưa ra LỊCH TẬP THAM KHẢO rõ ràng và kèm proposals ("update_strategy" + "set_weekly_split" + "set_session_exercises" nếu cần) để Tiến xem trước và bấm Áp dụng!
5) AI TỰ AUDIT AI & TỐI ƯU HÓA ("selfAudit"):
   - Trước khi chốt JSON, tự kiểm tra lại lời khuyên & proposals của chính mình: Mức calo có bị ép thấp dưới BMR (${ctx?.bodyAndStrategy?.bmrKcal || 2100} kcal) gây mất cơ/bỏ cuộc không? Bài tập có an toàn cho khớp gối & lưng dưới ở mức cân ${ctx?.bodyAndStrategy?.currentWeightKg || 115}kg không? Lịch tập có dễ duy trì thành thói quen lâu dài không? Ghi tóm tắt 1 câu kiểm duyệt ngắn gọn vào "selfAudit.safetyCheck".

BỐI CẢNH & DỮ LIỆU THẬT 7–14 NGÀY CỦA TIẾN:
${JSON.stringify(ctx)}

DANH MỤC MÓN VIỆT CÓ SẴN (foodId):
${JSON.stringify(catalog.foods || [])}

DANH MỤC BÀI TẬP CHUẨN (exId - BẮT BUỘC DÙNG ĐÚNG id TRONG DANH SÁCH NÀY KHI DÙNG swap_exercise / set_session_exercises / adjust_exercise_sets / log_exercise_sets):
${JSON.stringify(catalog.exercises || [])}

ĐỊNH DẠNG JSON TRẢ VỀ BẮT BUỘC (DUY NHẤT 1 JSON OBJECT HỢP LỆ, KHÔNG BỌC MARKDOWN):
{
  "reply": "Nội dung trả lời mạch lạc, truyền động lực, phân tích rõ ràng (dùng \\n\\n tách đoạn ngắn hoặc - gạch đầu dòng khi liệt kê)",
  "quickReplies": [],
  "selfAudit": {
    "safetyCheck": "Tóm tắt 1 câu tự kiểm duyệt an toàn khớp / sàn BMR / tính duy trì thói quen",
    "estimateNote": "Ghi chú ngắn nếu có ước lượng ~75-80% calo (hoặc để trống)"
  },
  "proposals": [
    // Chọn 0 hoặc nhiều action chuẩn xác dưới đây (labelSummary KHÔNG chứa emoji):
    // { "type": "add_food_catalog", "dateISO": "${todayISO}", "foodId": "pho_bo_tai", "servings": 1, "labelSummary": "Thêm 1 tô Phở bò tái nạc (430 kcal · 32g Đạm)" }
    // { "type": "add_custom_food", "dateISO": "${todayISO}", "name": "Bún bò Huế tái nạc", "kcal": 520, "protein": 34, "carb": 60, "fat": 14, "labelSummary": "Thêm Bún bò Huế tái nạc (~520 kcal · 34g Đạm)" }
    // { "type": "replace_day_nutrition", "dateISO": "${todayISO}", "items": [{ "name": "Sáng: Bạc xỉu + Pocari", "kcal": 230, "protein": 4, "carb": 42, "fat": 5 }, { "name": "Trưa: Cơm mực rim, chả trứng, canh chua cá + nước mía", "kcal": 1000, "protein": 41, "carb": 138, "fat": 30 }], "labelSummary": "Ghi đè chuẩn lại thực đơn hôm nay: 1.230 kcal · 45g Đạm (xoá dữ liệu thừa cũ)" }
    // { "type": "remove_food_item", "dateISO": "${todayISO}", "foodId": "pho_bo_tai", "labelSummary": "Xoá món Phở bò tái nạc bị ghi dư" }
    // { "type": "add_water", "dateISO": "${todayISO}", "amountMl": 2000, "labelSummary": "Cộng 2.000ml nước uống trong ngày" }
    // { "type": "set_water", "dateISO": "${todayISO}", "waterMl": 1500, "labelSummary": "Đặt lại tổng nước hôm nay: 1.500ml" }
    // { "type": "adjust_exercise_sets", "dateISO": "${ctx.selectedDateISO || todayISO}", "sessionId": "${ctx.effectiveSessionId || 'press_day'}", "exId": "incline_db_press", "newWeightKg": 20, "newReps": 10, "setsCount": 3, "loggedHeavySet": { "weightKg": 24, "reps": 5 }, "labelSummary": "Hạ Đẩy ngực tạ đơn xuống 20kg x 10 reps (RPE 8 kiểm soát khớp)" }
    // { "type": "swap_exercise", "sessionId": "${ctx.effectiveSessionId || 'press_day'}", "fromExId": "lat_pulldown", "toExId": "one_arm_db_row", "labelSummary": "Đổi Kéo xô rộng sang Chèo tạ đơn 1 tay" }
    // { "type": "set_session_exercises", "sessionId": "press_day", "exerciseIds": ["machine_chest_press", "incline_db_press", "machine_shoulder_press", "lateral_raise", "tricep_pushdown"], "labelSummary": "Cập nhật giáo án Buổi Đẩy (5 bài êm khớp vai)" }
    // { "type": "log_exercise_sets", "dateISO": "${ctx.selectedDateISO || todayISO}", "sessionId": "${ctx.effectiveSessionId || 'press_day'}", "exId": "machine_chest_press", "weightKg": 45, "reps": 10, "setsCount": 3, "effort": "good", "labelSummary": "Ghi Đẩy ngực máy: 3 hiệp x 45kg x 10 reps" }
    // { "type": "set_day_status", "dateISO": "${ctx.selectedDateISO || todayISO}", "status": "done", "sessionId": "${ctx.effectiveSessionId || 'press_day'}", "note": "Hoàn thành tốt", "labelSummary": "Chốt hoàn thành buổi tập hôm nay (+1 chuỗi)" }
    // { "type": "clear_workout_logs", "scope": "all", "labelSummary": "Xoá toàn bộ log buổi tập đã hoàn thành (reset chuỗi về 0)" }
    // { "type": "clear_nutrition_logs", "scope": "date", "dateISO": "${todayISO}", "labelSummary": "Xoá sạch dữ liệu ăn uống & nước ngày hôm nay" }
    // { "type": "reschedule_day", "dateISO": "${todayISO}", "sessionId": "pull_day", "workoutTime": "06:00", "scope": "single", "labelSummary": "Dời Buổi Kéo sang ngày ... lúc 06:00" }
    // { "type": "set_weekly_split", "days": { "1": { "sessionId": "rest" }, "2": { "sessionId": "press_day", "workoutTime": "06:00" }, "3": { "sessionId": "pull_day", "workoutTime": "06:00" }, "4": { "sessionId": "rest" }, "5": { "sessionId": "legs_day", "workoutTime": "06:00" }, "6": { "sessionId": "upper_day", "workoutTime": "07:00" }, "0": { "sessionId": "rest" } }, "labelSummary": "Áp dụng lịch tập 4 buổi/tuần (T3 Đẩy · T4 Kéo · T6 Chân · T7 Thân trên)" }
    // { "type": "update_strategy", "goal": "cut", "targetWeightKg": 95, "workoutTime": "06:00", "labelSummary": "Chuyển chiến lược sang Giảm mỡ giữ cơ (đích 95kg)" }
    // { "type": "log_weight", "weightKg": 114.2, "labelSummary": "Cập nhật cân nặng hôm nay: 114.2 kg" }
  ]
}`;

    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const validHistory: WebChatHistoryMessage[] = [];
    for (const h of rawHistory.slice(-8)) {
      if (!h || typeof h.content !== 'string' || !h.content.trim()) continue;
      const role: 'user' | 'model' = h.role === 'user' ? 'user' : 'model';
      if (validHistory.length === 0 && role !== 'user') continue;
      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === role) continue;
      validHistory.push({ role, content: h.content.slice(0, 1800) });
    }
    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
      validHistory.pop();
    }

    const isUltraOwner = verifyUltraOwnerJwt(req.headers['x-gym8d-ultra-token']);
    const requestedUltraModel =
      typeof req.body?.ultraModel === 'string' ? req.body.ultraModel : 'gemini-4-carbon-high';

    const aiRes = await generateGymAgentJsonWithFallback({
      message,
      history: validHistory,
      systemInstruction,
      temperature: 0.25,
      maxOutputTokens: 2400,
      ultra: { enabled: isUltraOwner, preferredModel: requestedUltraModel },
    });

    const parsed = parseAgentJsonResponse(aiRes.text);
    let audited = auditAndOptimizeAgentOutput(parsed, todayISO, catalog, ctx);

    // Layer 3 Self-Healing Guardrail: If reply promised an action button (or user asked for an update/plan)
    // yet proposals came back empty, run a fast deterministic extraction pass so the button ALWAYS appears.
    if (
      audited.proposals.length === 0 &&
      audited.quickReplies.length === 0 &&
      (replyPromisesActionButton(audited.reply) || userRequestsActionOrSchedule(message))
    ) {
      try {
        const repairRes = await generateGymAgentJsonWithFallback({
          message: `TIN NHẮN NGƯỜI DÙNG: ${message}\n\nNỘI DUNG PHÂN TÍCH VỪA TẠO:\n${audited.reply}\n\nNHIỆM VỤ BẮT BUỘC: Hãy chuyển hóa chính xác yêu cầu/nội dung trên thành mảng "proposals" hợp lệ (dùng clear_workout_logs nếu xoá hết log buổi tập done, clear_nutrition_logs nếu xoá hết ăn uống, replace_day_nutrition nếu chỉnh/ghi đè lại tổng calo ngày hôm nay, update_strategy + set_weekly_split nếu đề xuất chiến lược & lịch tập tuần, adjust_exercise_sets nếu chỉnh mức tạ/rep, add_custom_food/add_food_catalog nếu thêm món ăn). Giữ nguyên "reply".`,
          history: [],
          systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 1800,
          ultra: { enabled: isUltraOwner, preferredModel: requestedUltraModel },
        });
        const repairedParsed = parseAgentJsonResponse(repairRes.text);
        const repairedAudited = auditAndOptimizeAgentOutput(
          {
            reply: audited.reply,
            proposals: repairedParsed.proposals,
            quickReplies: repairedParsed.quickReplies,
            selfAudit: repairedParsed.selfAudit || audited.selfAudit,
          },
          todayISO,
          catalog,
          ctx
        );
        if (repairedAudited.proposals.length > 0) {
          audited = repairedAudited;
        }
      } catch (repairErr: any) {
        console.warn('[Gym8D Agent Repair] Skipped:', repairErr?.message || repairErr);
      }
    }

    if (audited.proposals.length === 0) {
      audited = {
        ...audited,
        reply: stripFalseButtonPromise(audited.reply),
      };
    }

    const engineLabel = formatEngineLabel(aiRes.model, aiRes.tier);
    const enrichedAudit = audited.selfAudit
      ? {
          ...audited.selfAudit,
          engineLabel,
          modelId: aiRes.model,
          tier: aiRes.tier,
          fallbackNote: aiRes.fallbackNote,
        }
      : {
          passed: true,
          safetyCheck: '',
          engineLabel,
          modelId: aiRes.model,
          tier: aiRes.tier,
          fallbackNote: aiRes.fallbackNote,
        };

    return res.json({
      reply: audited.reply,
      proposals: audited.proposals,
      quickReplies: audited.quickReplies,
      selfAudit: enrichedAudit,
      model: aiRes.model,
      tier: aiRes.tier,
      fallbackNote: aiRes.fallbackNote,
    });
  } catch (err: any) {
    console.error('[Gym8D Agent] Error:', err?.message || err);
    return res.status(500).json({
      error: 'ChatDVT đang bận xử lý một nhịp, thử bấm gửi lại nhé.',
    });
  }
});

export function startGym8dPushScheduler(): void {
  if (cronStarted) return;
  cronStarted = true;
  cron.schedule('* * * * *', () => {
    runGym8dPushTick().catch((err) => {
      console.error('[Gym8D Push Cron] Error:', err?.message || err);
    });
  });
  console.log('Gym8D Native Web Push scheduler active (1m tick, UTC+7).');
}

export default router;
