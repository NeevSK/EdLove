import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { SovereignError } from '@repo/core/types/Errors';
import { Hono } from 'hono';
import { z } from 'zod';
import { verifySupabaseSession } from '../adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from '../authenticatedAccount';
import { appendAuthSessionAudit } from '../authSessionAudit';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const otpSchema = z.object({
  email: z.email(),
  emailRedirectTo: z.url().optional(),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});
const providerSession = z
  .object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    expires_in: z.number().positive(),
    token_type: z.literal('bearer'),
    user: z.object({ id: z.uuid() }).passthrough(),
  })
  .passthrough();

function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).ENV) {
    return (globalThis as any).ENV[key];
  }
  return undefined;
}

function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL')?.trim();
  const key =
    getEnv('SUPABASE_PUBLISHABLE_KEY') ||
    getEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
    getEnv('SUPABASE_ANON_KEY') ||
    getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  return { url, key };
}

export function createAuthGatewayRoutes() {
  const router = new Hono();

  // All auth gateway responses must be strictly uncacheable
  router.use('*', async (c, next) => {
    await next();
    c.header('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
    c.header('Pragma', 'no-cache');
  });

  router.post('/sign-in', async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid credentials payload', details: parsed.error.issues }, 400);
    }

    const { email, password } = parsed.data;
    const { url, key } = getSupabaseConfig();

    if (!url || !key) {
      return c.json({ error: 'Authentication service is currently misconfigured.' }, 503);
    }

    try {
      const response = await secureApiFetch(
        `${url.replace(/\/+$/, '')}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(5000),
          cache: 'no-store',
          headers: {
            apikey: key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        if (response.body) await response.body.cancel();
        if (response.status === 429)
          return c.json({ error: 'Too many authentication attempts.' }, 429);
        if (response.status >= 500)
          return c.json({ error: 'Authentication provider is unavailable.' }, 503);
        return c.json({ error: 'Invalid email or password' }, 401);
      }

      const data = providerSession.parse(await response.json());
      return c.json({ session: data });
    } catch {
      return c.json({ error: 'Authentication gateway encountered an internal error' }, 502);
    }
  });

  router.post('/otp', async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = otpSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid OTP payload', details: parsed.error.issues }, 400);
    }

    const { email, emailRedirectTo } = parsed.data;
    const { url, key } = getSupabaseConfig();

    if (!url || !key) {
      return c.json({ error: 'Authentication service is currently misconfigured.' }, 503);
    }

    try {
      const endpoint = new URL(`${url.replace(/\/+$/, '')}/auth/v1/otp`);
      if (emailRedirectTo) endpoint.searchParams.set('redirect_to', emailRedirectTo);
      const response = await secureApiFetch(endpoint, {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
        headers: {
          apikey: key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        if (response.body) await response.body.cancel();
        if (response.status === 429)
          return c.json({ error: 'Too many authentication attempts.' }, 429);
        if (response.status >= 500)
          return c.json({ error: 'Authentication provider is unavailable.' }, 503);
        return c.json({ error: 'Could not send magic link' }, 400);
      }

      if (response.body) await response.body.cancel();
      return c.json({ ok: true, message: 'Magic link dispatched' });
    } catch {
      return c.json({ error: 'Authentication gateway encountered an internal error' }, 502);
    }
  });

  router.post('/refresh', async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = refreshSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid refresh payload' }, 400);
    }

    const { refresh_token } = parsed.data;
    const { url, key } = getSupabaseConfig();

    if (!url || !key) {
      return c.json({ error: 'Authentication service is currently misconfigured.' }, 503);
    }

    try {
      const response = await secureApiFetch(
        `${url.replace(/\/+$/, '')}/auth/v1/token?grant_type=refresh_token`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(5000),
          cache: 'no-store',
          headers: {
            apikey: key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token }),
        },
      );

      if (!response.ok) {
        if (response.body) await response.body.cancel();
        if (response.status === 429)
          return c.json({ error: 'Too many authentication attempts.' }, 429);
        if (response.status >= 500)
          return c.json({ error: 'Authentication provider is unavailable.' }, 503);
        return c.json({ error: 'Refresh token invalid or expired' }, 401);
      }

      const data = providerSession.parse(await response.json());
      return c.json({ session: data });
    } catch {
      return c.json({ error: 'Session refresh failed' }, 502);
    }
  });

  router.post('/sign-out', async (c) => {
    const authHeader = c.req.header('Authorization');
    const { url, key } = getSupabaseConfig();

    if (!authHeader?.startsWith('Bearer ') || !authHeader.slice(7).trim()) {
      return c.json({ error: 'A bearer session is required.' }, 401);
    }
    if (!url || !key)
      return c.json({ error: 'Authentication service is currently misconfigured.' }, 503);
    const operationId = crypto.randomUUID();
    let accountId: string;
    try {
      const verified = await verifySupabaseSession(authHeader.slice(7));
      if (!verified) return c.json({ error: 'A live bearer session is required.' }, 401);
      accountId = (await resolveAuthenticatedAccount(verified.sub)).id;
      await appendAuthSessionAudit(accountId, operationId, 'initiated');
    } catch (error) {
      if (error instanceof SovereignError && error.details.status === 401) {
        return c.json({ error: 'A live bearer session is required.' }, 401);
      }
      return c.json({ error: 'Session revocation audit is unavailable.' }, 503);
    }
    let confirmed = false;
    try {
      const response = await secureApiFetch(
        `${url.replace(/\/+$/, '')}/auth/v1/logout?scope=global`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(5000),
          cache: 'no-store',
          headers: {
            apikey: key,
            Authorization: authHeader,
          },
        },
      );
      if (response.body) await response.body.cancel();
      confirmed = response.ok;
    } catch {
      confirmed = false;
    }
    try {
      await appendAuthSessionAudit(accountId, operationId, confirmed ? 'confirmed' : 'unconfirmed');
    } catch {
      return c.json({ error: 'Session revocation receipt is unavailable.', operationId }, 503);
    }
    if (!confirmed) {
      return c.json({ error: 'Remote session revocation was not confirmed.' }, 502);
    }

    return c.json({ ok: true });
  });

  return router;
}
