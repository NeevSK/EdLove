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
    async setSessionDuration(remember: boolean) {
      // Session duration is handled by Supabase JWT expiry settings.
      // The "Remember me" checkbox sets a custom claim that the server can use
      // to adjust cookie max-age on subsequent requests.
      // This is non-fatal - session persistence works via default Supabase behavior.
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
