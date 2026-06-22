import { type Context, type Next } from 'hono';

interface RateLimitInfo {
  tokens: number;
  lastRefill: number;
}

const clientBuckets = new Map<string, RateLimitInfo>();
const LIMIT = 10; // max requests
const REFILL_RATE = 60000; // time window in ms (1 minute)

export async function rateLimit(c: Context, next: Next) {
  const user = c.get('user');
  const clientId = user?.id || c.req.header('x-forwarded-for') || 'ip-anonymous';

  const now = Date.now();
  let bucket = clientBuckets.get(clientId);

  if (!bucket) {
    bucket = { tokens: LIMIT, lastRefill: now };
    clientBuckets.set(clientId, bucket);
  }

  // Refill tokens based on time elapsed
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_RATE) {
    bucket.tokens = LIMIT;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    c.status(429);
    return c.json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit for AI calls. Please wait a minute and try again.',
    });
  }

  bucket.tokens--;
  await next();
}
