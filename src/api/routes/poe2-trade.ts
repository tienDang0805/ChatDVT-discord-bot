import { Router } from 'express';
import { z } from 'zod';
import { buildTradeLink } from '../../features/poe2-trade-link';

const router = Router();
const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const buildLinkRequestSchema = z.object({
  input: z.string().trim().min(1).max(2000),
  league: z.string().trim().min(1).max(100).optional(),
}).strict();

router.post('/poe2-trade/build-link', async (req, res) => {
  const now = Date.now();
  const clientKey = req.ip || 'unknown';
  const bucket = requestBuckets.get(clientKey);
  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      ok: false,
      error: 'Too many trade-link requests. Please wait a minute and try again.',
    });
  } else {
    bucket.count += 1;
  }

  const request = buildLinkRequestSchema.safeParse(req.body);
  if (!request.success) {
    return res.status(400).json({
      ok: false,
      error: request.error.issues[0]?.message || 'Invalid request body.',
    });
  }

  const league = request.data.league
    || process.env.POE2_DEFAULT_LEAGUE
    || 'Runes of Aldur';
  const result = await buildTradeLink(request.data.input, league);
  return res.status(result.ok ? 200 : 422).json(result);
});

export default router;
