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
      const result = await client.auth.signInWithPassword({ email, password });
      return {
        data: { session: result.data.session, user: result.data.user },
        error: result.error ? new Error(result.error.message) : null,
      };
    },
    async signInWithOtp({ email, emailRedirectTo }) {
      // The configured SDK owns the PKCE verifier and challenge used by the callback.
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
