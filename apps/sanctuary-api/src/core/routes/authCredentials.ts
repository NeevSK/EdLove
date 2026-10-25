import { CredentialInventorySchema } from '@repo/core/api/credentialInventory';
import { CredentialUnlinkRequestSchema } from '@repo/core/api/credentialUnlink';
import { PasswordChangeRequestSchema } from '@repo/core/api/passwordChange';
import { SovereignError } from '@repo/core/types/Errors';
import { Hono } from 'hono';
import { verifySupabaseSessionDetails } from '../adapters/verifySupabaseSession';
import { changeCredentialPassword, unlinkCredentialIdentity } from '../authCredentialCommands';
import { resolveAuthenticatedAccount } from '../authenticatedAccount';

export function createAuthCredentialRoutes() {
  const router = new Hono<{ Bindings: Record<string, string> }>();
  router.use('*', async (c, next) => {
    c.header('Cache-Control', 'private, no-store');
    c.header('Vary', 'Authorization', { append: true });
    await next();
  });
  router.get('/credentials', async (c) => {
    const authorization = c.req.header('Authorization');
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim()) {
      return c.json({ error: 'AUTH_REQUIRED' }, 401);
    }
    try {
      const environment: Record<string, string> = c.env ?? {};
      const verified = await verifySupabaseSessionDetails(authorization.slice(7), environment);
      if (!verified) return c.json({ error: 'AUTH_REQUIRED' }, 401);
      const account = await resolveAuthenticatedAccount(
        verified.claims.sub,
        environment.DATABASE_URL,
      );
      if (verified.user.is_anonymous === undefined || !verified.user.identities) {
        throw SovereignError.unavailable('AUTH_CREDENTIAL_INVENTORY_UNAVAILABLE');
      }
      return c.json(
        CredentialInventorySchema.parse({
          accountId: account.id,
          provider: 'supabase',
          anonymous: verified.user.is_anonymous,
          identities: verified.user.identities.map((identity) => ({
            id: identity.identity_id,
            provider: identity.provider,
          })),
        }),
      );
    } catch (error) {
      if (error instanceof SovereignError && error.details.status === 401) {
        return c.json({ error: 'AUTH_REQUIRED' }, 401);
      }
      return c.json({ error: 'AUTH_CREDENTIAL_INVENTORY_UNAVAILABLE' }, 503);
    }
  });
  router.post('/credentials/password', async (c) => {
    const authorization = c.req.header('Authorization');
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim())
      return c.json({ error: 'AUTH_REQUIRED' }, 401);
    const parsed = PasswordChangeRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'INVALID_PASSWORD_CHANGE' }, 400);
    const operationId = crypto.randomUUID();
    try {
      const result = await changeCredentialPassword(
        authorization,
        parsed.data,
        c.env ?? {},
        operationId,
      );
      return c.json(result.body, result.status);
    } catch (error) {
      if (error instanceof SovereignError && error.details.status === 401)
        return c.json({ error: 'AUTH_REQUIRED' }, 401);
      return c.json({ error: 'AUTH_PASSWORD_CHANGE_UNAVAILABLE', operationId }, 503);
    }
  });
  router.post('/credentials/identities/unlink', async (c) => {
    const authorization = c.req.header('Authorization');
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim())
      return c.json({ error: 'AUTH_REQUIRED' }, 401);
    const parsed = CredentialUnlinkRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'INVALID_CREDENTIAL_UNLINK' }, 400);
    const operationId = crypto.randomUUID();
    try {
      const result = await unlinkCredentialIdentity(
        authorization,
        parsed.data.identityId,
        c.env ?? {},
        operationId,
      );
      return c.json(result.body, result.status);
    } catch (error) {
      if (error instanceof SovereignError && error.details.status === 401)
        return c.json({ error: 'AUTH_REQUIRED' }, 401);
      return c.json({ error: 'CREDENTIAL_UNLINK_UNAVAILABLE', operationId }, 503);
    }
  });
  return router;
}
