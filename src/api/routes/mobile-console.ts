import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma';
import { bot } from '../../bot/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();

export interface MobileVisitorRecord {
  id: string;
  ip: string;
  source: string;
  page: string;
  city: string;
  isp: string;
  os: string;
  browser: string;
  gpuRenderer: string;
  humanScore: number;
  verdict: 'HUMAN' | 'HEADLESS_BOT' | 'SCRAPER' | 'SOCIAL_BOT';
  verdictLabel: string;
  dwellSec: number;
  scrollPct: number;
  timestamp: string;
  signals: Array<{ layer: string; detail: string; delta: string; positive: boolean }>;
}

const blockedIps = new Set<string>();
const autoBlockedUntil = new Map<string, number>();
const recentVisitors: MobileVisitorRecord[] = [];
const ipBurstMap = new Map<string, { count: number; windowStart: number }>();
const AUTO_BLOCK_DURATION_MS = 15 * 60 * 1000;
const AUTO_BLOCK_BURST_THRESHOLD = 80;

export function scoreVisitorRequest(input: {
  ip: string;
  userAgent: string;
  page: string;
  referrer?: string;
  os?: string;
  browser?: string;
  city?: string;
  isp?: string;
  hosting?: boolean;
  webdriver?: boolean;
  gpuRenderer?: string;
  touchSupport?: boolean;
  dwellSec?: number;
  scrollPct?: number;
  burstCount5s?: number;
}): MobileVisitorRecord {
  let score = 50;
  const signals: Array<{ layer: string; detail: string; delta: string; positive: boolean }> = [];
  const ua = input.userAgent || '';
  const gpu = input.gpuRenderer || 'Apple GPU';
  const dwell = input.dwellSec ?? 12;
  const scroll = input.scrollPct ?? 45;
  const burst = input.burstCount5s ?? 1;

  if (/HTTrack|wget|curl|python-requests|Scrapy|Go-http-client|libwww-perl/i.test(ua) || burst > 20) {
    score -= 60;
    signals.push({
      layer: 'Lớp 1 · Bẫy Cào Source',
      detail: `${ua.slice(0, 36)} (${burst} req/5s)`,
      delta: '-60đ',
      positive: false,
    });
  } else {
    score += 15;
    signals.push({
      layer: 'Lớp 1 · HTTP Header',
      detail: 'Trình duyệt chuẩn · Tốc độ tải bình thường',
      delta: '+15đ',
      positive: true,
    });
  }

  if (input.webdriver || /HeadlessChrome|Playwright|Puppeteer|PhantomJS/i.test(ua) || /SwiftShader|llvmpipe/i.test(gpu)) {
    score -= 45;
    signals.push({
      layer: 'Lớp 2 · WebGL & Webdriver',
      detail: `webdriver=${Boolean(input.webdriver)} · GPU: ${gpu}`,
      delta: '-45đ',
      positive: false,
    });
  } else {
    score += 20;
    signals.push({
      layer: 'Lớp 2 · Phần cứng GPU',
      detail: `webdriver=false · ${gpu}`,
      delta: '+20đ',
      positive: true,
    });
  }

  if (input.hosting || /Amazon|DigitalOcean|Hetzner|OVH|Linode|Vultr|Choopa|Google Cloud/i.test(input.isp || '')) {
    score -= 35;
    signals.push({
      layer: 'Lớp 3 · IP-API ASN',
      detail: `Datacenter/Hosting (${input.isp || 'Cloud ASN'})`,
      delta: '-35đ',
      positive: false,
    });
  } else {
    score += 20;
    signals.push({
      layer: 'Lớp 3 · Nhà mạng ISP',
      detail: `${input.city || 'Việt Nam'} (${input.isp || 'Residential ISP'})`,
      delta: '+20đ',
      positive: true,
    });
  }

  if (dwell >= 3 || scroll > 0 || input.touchSupport) {
    score += 15;
    signals.push({
      layer: 'Lớp 4 · Nhịp tim Tương tác',
      detail: `Đọc ${dwell}s · Cuộn ${scroll}%`,
      delta: '+15đ',
      positive: true,
    });
  }

  const finalScore = Math.max(1, Math.min(99, score));
  let verdict: MobileVisitorRecord['verdict'] = 'HUMAN';
  let verdictLabel = `Người thật · ${finalScore}%`;
  if (/HTTrack|wget|curl|Scrapy|python/i.test(ua) || burst > 20) {
    verdict = 'SCRAPER';
    verdictLabel = `Cào Source · ${finalScore}%`;
  } else if (/facebookexternalhit|LinkedInBot|Twitterbot|Discordbot/i.test(ua)) {
    verdict = 'SOCIAL_BOT';
    verdictLabel = `Bot MXH · ${finalScore}%`;
  } else if (finalScore < 45) {
    verdict = 'HEADLESS_BOT';
    verdictLabel = `Headless Bot · ${finalScore}%`;
  }

  let source = 'Direct';
  if (input.referrer && input.referrer !== 'direct') {
    try {
      source = new URL(input.referrer).hostname.replace(/^www\./, '');
    } catch {
      source = input.referrer.slice(0, 24);
    }
  }

  return {
    id: `vis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ip: input.ip,
    source,
    page: input.page || '/',
    city: input.city || 'TP.HCM',
    isp: input.isp || 'ISP',
    os: input.os || 'iOS/macOS',
    browser: input.browser || 'Safari/Chrome',
    gpuRenderer: gpu,
    humanScore: finalScore,
    verdict,
    verdictLabel,
    dwellSec: dwell,
    scrollPct: scroll,
    timestamp: new Date().toISOString(),
    signals,
  };
}

export function recordTrackedVisitor(record: MobileVisitorRecord) {
  recentVisitors.unshift(record);
  if (recentVisitors.length > 100) {
    recentVisitors.pop();
  }
}

export function scraperFirewallMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = (req.ip || 'unknown').replace(/^::ffff:/, '');
  if (blockedIps.has(ip)) {
    return res.status(403).json({ error: 'IP blocked by DVT Console Firewall', ip });
  }
  const now = Date.now();
  const blockedUntil = autoBlockedUntil.get(ip);
  if (blockedUntil) {
    if (now < blockedUntil) {
      return res.status(429).json({ error: 'IP temporarily rate-limited due to excessive burst traffic', ip });
    }
    autoBlockedUntil.delete(ip);
  }

  // Ignore static asset sub-requests when counting burst traffic so normal page loads are unaffected.
  if (/\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|mp3|json|map)$/i.test(req.path)) {
    return next();
  }

  const burst = ipBurstMap.get(ip);
  if (!burst || now - burst.windowStart > 5000) {
    ipBurstMap.set(ip, { count: 1, windowStart: now });
  } else {
    burst.count += 1;
    if (burst.count > AUTO_BLOCK_BURST_THRESHOLD && ip !== '127.0.0.1' && ip !== '::1') {
      autoBlockedUntil.set(ip, now + AUTO_BLOCK_DURATION_MS);
      return res.status(429).json({ error: 'IP temporarily rate-limited due to excessive burst traffic', ip });
    }
  }
  next();
}

// GET /api/mobile/widget-summary — Public lightweight JSON for iOS WidgetKit Extension
router.get('/mobile/widget-summary', async (_req: Request, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [totalChatLogs, messagesToday, totalSystemLogs, latestLog, usersGroup] = await Promise.all([
      prisma.chatLog.count(),
      prisma.chatLog.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.systemLog.count(),
      prisma.chatLog.findFirst({ orderBy: { createdAt: 'desc' } }),
      prisma.chatLog.groupBy({ by: ['userId'] }),
    ]);

    const humansCount = recentVisitors.filter((v) => v.verdict === 'HUMAN').length;
    const botsCount = recentVisitors.filter((v) => v.verdict !== 'HUMAN').length;
    const latestHuman = recentVisitors.find((v) => v.verdict === 'HUMAN');

    res.json({
      updatedAt: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
      ramMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      botOnline: Boolean(bot.user),
      botUsername: bot.user?.username || 'Chat DVT',
      totalUsers: usersGroup.length,
      totalChatLogs,
      messagesToday,
      totalSystemLogs,
      humansToday: humansCount,
      botsBlockedToday: botsCount,
      blockedIpsCount: blockedIps.size,
      latestChat: latestLog
        ? {
            id: latestLog.id,
            username: latestLog.username,
            content: latestLog.content.slice(0, 80),
            createdAt: latestLog.createdAt,
          }
        : null,
      latestHumanVisitor: latestHuman
        ? {
            ip: latestHuman.ip,
            city: latestHuman.city,
            source: latestHuman.source,
            page: latestHuman.page,
            humanScore: latestHuman.humanScore,
          }
        : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Widget summary error' });
  }
});

// GET /api/mobile/visitors — Protected list of tracked visitors + blocked IPs
router.get('/mobile/visitors', authenticateToken, async (_req: Request, res: Response) => {
  res.json({
    visitors: recentVisitors,
    blockedIps: Array.from(blockedIps),
  });
});

// POST /api/mobile/block-ip — Toggle IP block in firewall
router.post('/mobile/block-ip', authenticateToken, async (req: Request, res: Response) => {
  const ip = String(req.body?.ip || '').trim();
  if (!ip) return res.status(400).json({ error: 'Missing IP' });
  if (blockedIps.has(ip)) {
    blockedIps.delete(ip);
  } else {
    blockedIps.add(ip);
  }
  res.json({
    success: true,
    ip,
    blocked: blockedIps.has(ip),
    blockedIps: Array.from(blockedIps),
  });
});

export default router;
