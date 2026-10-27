import { SovereignError } from '@repo/core/types/Errors';
import { Hono } from 'hono';
import { verifySupabaseSessionDetails } from '../adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from '../authenticatedAccount';
import { createSyncCredentials, getSyncPublicKeys } from '../syncCredentials';

export function createAuthSyncRoutes() {
  const router = new Hono<{ Bindings: Record<string, string> }>();
  router.use('*', async (c, next) => {
    c.header('Cache-Control', 'private, no-store');
    c.header('Vary', 'Authorization', { append: true });
    await next();
  });
  router.get('/sync-jwks', async (c) => {
    try {
      return c.json(await getSyncPublicKeys(c.env ?? {}));
    } catch {
      return c.json({ error: 'SYNC_CREDENTIALS_UNAVAILABLE' }, 503);
    }
  });
  router.post('/sync-credentials', async (c) => {
    const authorization = c.req.header('Authorization');
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim())
      return c.json({ error: 'AUTH_REQUIRED' }, 401);
    try {
      const environment = c.env ?? {};
      const verified = await verifySupabaseSessionDetails(authorization.slice(7), environment);
      if (!verified) return c.json({ error: 'AUTH_REQUIRED' }, 401);
      if (verified.user.is_anonymous !== false)
        return c.json({ error: 'IDENTIFIED_ACCOUNT_REQUIRED' }, 403);
      const account = await resolveAuthenticatedAccount(
        verified.claims.sub,
        environment.DATABASE_URL,
      );
      const expiresAt: unknown = verified.claims.exp;
      if (typeof expiresAt !== 'number' || expiresAt <= Math.floor(Date.now() / 1000))
        return c.json({ error: 'AUTH_REQUIRED' }, 401);
      return c.json(await createSyncCredentials(account.id, expiresAt, environment));
    } catch (error) {
      if (error instanceof SovereignError && error.details.status === 401)
        return c.json({ error: 'AUTH_REQUIRED' }, 401);
      return c.json({ error: 'SYNC_CREDENTIALS_UNAVAILABLE' }, 503);
    }
  });
  return router;
}
