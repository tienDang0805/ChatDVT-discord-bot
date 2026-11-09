import type { Request, Response, NextFunction } from 'express';
import type { CorsOptions } from 'cors';

const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://devtiendang.blog',
  'https://www.devtiendang.blog',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]);

const DISCORD_ACTIVITY_ORIGIN_RE = /^https:\/\/([a-z0-9-]+\.)?(discord\.com|discordapp\.com|discordsays\.com)$/i;

function getExtraAllowedOrigins(): Set<string> {
  const raw = process.env.CORS_ALLOWED_ORIGINS || '';
  return new Set(
    raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function isOriginAllowed(origin?: string | null): boolean {
  // Requests without an Origin header (same-origin navigation, server webhooks, curl) are allowed.
  if (!origin) return true;
  const normalized = origin.trim();
  if (DEFAULT_ALLOWED_ORIGINS.has(normalized)) return true;
  if (DISCORD_ACTIVITY_ORIGIN_RE.test(normalized)) return true;
  if (getExtraAllowedOrigins().has(normalized)) return true;
  return false;
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(), payment=()');
  // Allow framing only on self and Discord Embedded Activity domains to prevent Clickjacking without breaking Discord games.
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.discord.com https://*.discordapp.com https://*.discordsays.com; object-src 'none'; base-uri 'self'",
  );

  const forwardedProto = req.headers['x-forwarded-proto'];
  if (req.secure || forwardedProto === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

interface RateBucket {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  maxWithCustomKey?: number;
  message?: string;
  silent204?: boolean;
}

export function getClientIp(req: Request): string {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }
  return (req.ip || 'unknown').replace(/^::ffff:/, '');
}

export function createRateLimiter(options: RateLimiterOptions) {
  const buckets = new Map<string, RateBucket>();
  const { windowMs, max, maxWithCustomKey, message = 'Too many requests, please try again later.', silent204 = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (buckets.size > 5000) {
      for (const [key, bucket] of buckets.entries()) {
        if (now >= bucket.resetAt) buckets.delete(key);
      }
    }

    const ip = getClientIp(req);
    const hasCustomKey =
      typeof maxWithCustomKey === 'number' &&
      typeof req.body?.geminiApiKey === 'string' &&
      req.body.geminiApiKey.trim().length > 10;
    const effectiveMax = hasCustomKey ? maxWithCustomKey! : max;

    let bucket = buckets.get(ip);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      buckets.set(ip, bucket);
    } else {
      bucket.count += 1;
    }

    const remaining = Math.max(0, effectiveMax - bucket.count);
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader('X-RateLimit-Limit', String(effectiveMax));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (bucket.count > effectiveMax) {
      res.setHeader('Retry-After', String(retryAfterSec));
      if (silent204) {
        return res.status(204).end();
      }
      return res.status(429).json({ error: message, retryAfterSec });
    }

    next();
  };
}

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.',
});

export const aiPublicRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 12,
  maxWithCustomKey: 30,
  message: 'Bạn thao tác quá nhanh. Vui lòng chờ ít giây hoặc nhập Gemini API Key cá nhân.',
});

export const trackRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  silent204: true,
});

const socketAiBuckets = new Map<string, RateBucket>();
export function allowSocketAiEvent(ip: string, maxPerMinute = 8): boolean {
  const now = Date.now();
  if (socketAiBuckets.size > 2000) {
    for (const [key, bucket] of socketAiBuckets.entries()) {
      if (now >= bucket.resetAt) socketAiBuckets.delete(key);
    }
  }
  const normalizedIp = (ip || 'unknown').replace(/^::ffff:/, '');
  const bucket = socketAiBuckets.get(normalizedIp);
  if (!bucket || now >= bucket.resetAt) {
    socketAiBuckets.set(normalizedIp, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= maxPerMinute;
}
