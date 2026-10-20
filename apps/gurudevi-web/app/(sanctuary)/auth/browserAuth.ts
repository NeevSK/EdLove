import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import {
  type BrowserSupabaseClient,
  createBrowserSupabaseClient,
} from '../../../lib/supabase/browser';

export { safeReturnPath, signInPath } from './routeSafety';

export type BrowserSession = NonNullable<
  Awaited<ReturnType<BrowserSupabaseClient['auth']['getSession']>>['data']['session']
>;
export type BrowserUser = BrowserSession['user'];

export type BrowserAuthRuntime = Readonly<{
  client: BrowserSupabaseClient;
  bootstrapIdentity: () => Promise<
    | Readonly<{ status: 'authenticated'; session: BrowserSession; user: BrowserUser }>
    | Readonly<{ status: 'signed-out'; session: null; user: null }>
    | Readonly<{ status: 'unavailable'; session: null; user: null; error: Error }>
  >;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
    data: { session: BrowserSession | null; user: BrowserUser | null };
    error: Error | null;
  }>;
  signInWithOtp: (credentials: { email: string; emailRedirectTo?: string }) => Promise<{
    data: unknown;
    error: Error | null;
  }>;
  setSessionDuration: (remember: boolean) => Promise<void>;
}>;

const SESSION_DURATION_REMEMBER = 30 * 24 * 60 * 60;
const SESSION_DURATION_DEFAULT = 7 * 24 * 60 * 60;

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return null;
  try {
    assertSecureApiUrl(value);
    return value.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

export function browserAuthRuntime(): BrowserAuthRuntime | null {
  const client = createBrowserSupabaseClient();
  if (!client) return null;

  return {
    client,
    async bootstrapIdentity() {
      try {
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (!data.session) return { status: 'signed-out', session: null, user: null };
        return { status: 'authenticated', session: data.session, user: data.session.user };
      } catch (cause) {
        return {
          status: 'unavailable',
          session: null,
          user: null,
          error: cause instanceof Error ? cause : new Error('Unable to read the browser session.'),
        };
      }
    },
    async signInWithPassword({ email, password }) {
      const origin = apiOrigin();
      if (origin) {
        try {
          const res = await fetch(`${origin}/api/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            cache: 'no-store',
          });

          if (res.ok) {
            const body = await res.json();
            if (body.session?.access_token && body.session?.refresh_token) {
              const { data, error } = await client.auth.setSession({
                access_token: body.session.access_token,
                refresh_token: body.session.refresh_token,
              });
              if (!error && data.session) {
                return { data: { session: data.session, user: data.user }, error: null };
              }
            }
          } else {
            const errorBody = await res.json().catch(() => ({}));
            return {
              data: { session: null, user: null },
              error: new Error(errorBody.error || 'Invalid email or password'),
            };
          }
        } catch {
          // Fall back gracefully to direct client auth if gateway is unreachable
        }
      }

      const result = await client.auth.signInWithPassword({ email, password });
      return {
        data: { session: result.data.session, user: result.data.user },
        error: result.error ? new Error(result.error.message) : null,
      };
    },
    async signInWithOtp({ email, emailRedirectTo }) {
      const origin = apiOrigin();
      if (origin) {
        try {
          const res = await fetch(`${origin}/api/auth/otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, emailRedirectTo }),
            cache: 'no-store',
          });

          if (res.ok) {
            return { data: { ok: true }, error: null };
          }
          const errorBody = await res.json().catch(() => ({}));
          return { data: null, error: new Error(errorBody.error || 'Could not send magic link') };
        } catch {
          // Fall back gracefully to direct client auth
        }
      }

      const result = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo, shouldCreateUser: true },
      });
      return {
        data: result.data,
        error: result.error ? new Error(result.error.message) : null,
      };
    },
    async setSessionDuration(remember: boolean) {
      const duration = remember ? SESSION_DURATION_REMEMBER : SESSION_DURATION_DEFAULT;
      try {
        await client.auth.updateUser({
          data: { session_duration: duration },
        });
      } catch {
        // Intentionally silent - auth flow continues regardless
      }
    },
  };
}
