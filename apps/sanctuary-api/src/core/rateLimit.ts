import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import type { Context, Next } from 'hono';

export type RateLimitState = {
  count: number;
  resetAt: number;
};

export interface RateLimitStore {
  increment(key: string, windowMs: number, now?: number): Promise<RateLimitState>;
}

/**
 * Development-safe fallback. It is deliberately bounded and lazily cleaned;
 * production deployments should provide a shared store so limits survive
 * process restarts and multiple instances.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly entries = new Map<string, RateLimitState>();
  private readonly maxEntries: number;

  constructor(maxEntries = 10_000) {
    this.maxEntries = maxEntries;
  }

  async increment(key: string, windowMs: number, now = Date.now()): Promise<RateLimitState> {
    for (const [entryKey, entry] of this.entries) {
      if (entry.resetAt <= now) this.entries.delete(entryKey);
    }

    if (!this.entries.has(key) && this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey) this.entries.delete(oldestKey);
    }

    const existing = this.entries.get(key);
    const state =
      existing && existing.resetAt > now
        ? { count: existing.count + 1, resetAt: existing.resetAt }
        : { count: 1, resetAt: now + windowMs };
    this.entries.set(key, state);
    return state;
  }
}

/**
 * Shared fixed-window store backed by the platform Postgres instance. The
 * upsert is atomic, so concurrent API instances cannot over-issue a bucket.
 */
export class PostgresRateLimitStore implements RateLimitStore {
  private lastPruneAt = 0;

  async increment(key: string, windowMs: number, now = Date.now()): Promise<RateLimitState> {
    if (now - this.lastPruneAt > 60 * 1000) {
      this.lastPruneAt = now;
      await executeDatabaseCommand(
        `DELETE FROM api_rate_limit_buckets WHERE reset_at < now() - interval '1 hour'`,
      );
    }

    const rows = await queryDatabaseRows<{ count: number; remaining_ms: number }>(
      `WITH bucket AS (
         INSERT INTO api_rate_limit_buckets (bucket_key, count, reset_at)
         VALUES ($1, 1, now() + ($2::numeric * interval '1 millisecond'))
         ON CONFLICT (bucket_key) DO UPDATE SET
           count = CASE
             WHEN api_rate_limit_buckets.reset_at <= now() THEN 1
             ELSE api_rate_limit_buckets.count + 1
           END,
           reset_at = CASE
             WHEN api_rate_limit_buckets.reset_at <= now()
               THEN now() + ($2::numeric * interval '1 millisecond')
             ELSE api_rate_limit_buckets.reset_at
           END
         RETURNING count, reset_at
       )
       SELECT count, GREATEST(0, EXTRACT(EPOCH FROM (reset_at - now())) * 1000) AS remaining_ms
       FROM bucket`,
      [key, windowMs],
    );

    const row = rows[0];
    if (!row) throw new Error('RateLimitStoreUnavailable');
    return { count: Number(row.count), resetAt: now + Number(row.remaining_ms) };
  }
}

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  prefix: string;
  store?: RateLimitStore;
  key?: (context: Context) => string;
};

const defaultStore = new InMemoryRateLimitStore();

export function createConfiguredRateLimitStore(): RateLimitStore {
  return typeof process !== 'undefined' && process.env.RATE_LIMIT_STORE === 'postgres'
    ? new PostgresRateLimitStore()
    : defaultStore;
}

function trustedClientKey(context: Context): string {
  const user = context.get('user') as { id?: string } | undefined;
  if (user?.id && user.id !== 'anonymous') return `user:${user.id}`;

  const configuredHeader =
    typeof process !== 'undefined'
      ? process.env.RATE_LIMIT_TRUSTED_PROXY_HEADER || 'CF-Connecting-IP'
      : 'CF-Connecting-IP';
  if (configuredHeader) {
    const value = context.req.header(configuredHeader);
    if (value) return `proxy:${value.split(',')[0].trim()}`;
  }
  return 'anonymous';
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  const store = options.store ?? defaultStore;
  const key = options.key ?? trustedClientKey;

  return async (context: Context, next: Next) => {
    const now = Date.now();
    const state = await store.increment(`${options.prefix}:${key(context)}`, options.windowMs, now);
    const remaining = Math.max(0, options.limit - state.count);
    const retryAfter = Math.max(1, Math.ceil((state.resetAt - now) / 1000));

    context.header('X-RateLimit-Limit', String(options.limit));
    context.header('X-RateLimit-Remaining', String(remaining));
    context.header('X-RateLimit-Reset', String(retryAfter));

    if (state.count > options.limit) {
      context.header('Retry-After', String(retryAfter));
      return context.json(
        { error: 'RATE_LIMITED', message: 'Rate limit exceeded. Please try again later.' },
        429,
      );
    }

    return next();
  };
}
