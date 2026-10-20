import { Hono } from 'hono';
import { z } from 'zod';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const otpSchema = z.object({
  email: z.string().email(),
  emailRedirectTo: z.string().url().optional(),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

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
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
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
      // In local testing/dev when Supabase is not directly connected
      if (getEnv('NODE_ENV') === 'test' || getEnv('NODE_ENV') === 'development') {
        return c.json({
          session: {
            access_token: 'test-sovereign-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: { id: 'test-user-id', email },
          },
        });
      }
      return c.json({ error: 'Authentication service is currently misconfigured.' }, 503);
    }

    try {
      assertSecureApiUrl(url);
      const response = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`[SENTINEL AUDIT LOG] Failed sign-in attempt for: ${email.slice(0, 3)}***`);
        return c.json(
          { error: errorData.error_description || errorData.msg || 'Invalid email or password' },
          401,
        );
      }

      const data = await response.json();
      console.info(`[SENTINEL AUDIT LOG] Sovereign Auth Sign-In Succeeded for User: "${data.user?.id}"`);
      return c.json({ session: data });
    } catch (err) {
      console.error('[SENTINEL AUDIT LOG] Auth gateway upstream failure:', err);
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
      if (getEnv('NODE_ENV') === 'test' || getEnv('NODE_ENV') === 'development') {
        return c.json({ ok: true, message: 'Magic link dispatched (test mode)' });
      }
      return c.json({ error: 'Authentication service is currently misconfigured.' }, 503);
    }

    try {
      assertSecureApiUrl(url);
      const response = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          apikey: key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, options: { emailRedirectTo } }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return c.json({ error: errorData.msg || 'Could not send magic link' }, 400);
      }

      console.info(`[SENTINEL AUDIT LOG] Magic link dispatched for: ${email.slice(0, 3)}***`);
      return c.json({ ok: true, message: 'Magic link dispatched' });
    } catch (err) {
      console.error('[SENTINEL AUDIT LOG] OTP upstream failure:', err);
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
      if (getEnv('NODE_ENV') === 'test' || getEnv('NODE_ENV') === 'development') {
        return c.json({
          session: {
            access_token: 'test-refreshed-token',
            refresh_token: 'test-new-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: { id: 'test-user-id' },
          },
        });
      }
      return c.json({ error: 'Authentication service is currently misconfigured.' }, 503);
    }

    try {
      assertSecureApiUrl(url);
      const response = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          apikey: key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token }),
      });

      if (!response.ok) {
        return c.json({ error: 'Refresh token invalid or expired' }, 401);
      }

      const data = await response.json();
      return c.json({ session: data });
    } catch (err) {
      return c.json({ error: 'Session refresh failed' }, 502);
    }
  });

  router.post('/sign-out', async (c) => {
    const authHeader = c.req.header('Authorization');
    const { url, key } = getSupabaseConfig();

    if (url && key && authHeader?.startsWith('Bearer ')) {
      try {
        await fetch(`${url.replace(/\/+$/, '')}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: authHeader,
          },
        });
      } catch {
        // Sign-out revocation should be best-effort
      }
    }

    console.info('[SENTINEL AUDIT LOG] Sovereign Session Signed Out');
    return c.json({ ok: true });
  });

  return router;
}
