import { queryDatabaseRows } from '@repo/database/client';
import { Hono } from 'hono';

const healthRoutes = new Hono();

const environment = () =>
  typeof process !== 'undefined' && process.env ? process.env.NODE_ENV || 'unknown' : 'unknown';

// Liveness intentionally has no external dependency checks.
healthRoutes.get('/health/live', (c) =>
  c.json({ status: 'ok', service: 'sanctuary-api', environment: environment() }),
);

// Readiness checks dependencies required to serve authenticated traffic.
healthRoutes.get('/health/ready', async (c) => {
  const databaseUrl =
    (c.env as { DATABASE_URL?: string } | undefined)?.DATABASE_URL ||
    (typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined);
  if (!databaseUrl) {
    return c.json({ status: 'not_ready', reason: 'database_configuration_missing' }, 503);
  }

  try {
    await queryDatabaseRows<{ ok: number }>('SELECT 1 AS ok');
    if (typeof process !== 'undefined' && process.env.RATE_LIMIT_STORE === 'postgres') {
      await queryDatabaseRows<{ ok: number }>(
        'SELECT 1 AS ok FROM public.api_rate_limit_buckets LIMIT 1',
      );
    }
    return c.json({ status: 'ready', service: 'sanctuary-api' });
  } catch {
    return c.json({ status: 'not_ready', reason: 'database_unreachable' }, 503);
  }
});

export { healthRoutes };
