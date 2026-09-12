import {
  createBrowserSupabaseClient,
  type BrowserSupabaseClient,
} from '../../../lib/supabase/browser';
export { safeReturnPath, signInPath } from './routeSafety';

type BrowserSession = NonNullable<Awaited<ReturnType<BrowserSupabaseClient['auth']['getSession']>>['data']['session']>;
type BrowserUser = BrowserSession['user'];

export type BrowserAuthRuntime = Readonly<{
  client: BrowserSupabaseClient;
  bootstrapIdentity: () => Promise<
    | Readonly<{ status: 'authenticated'; session: BrowserSession; user: BrowserUser }>
    | Readonly<{ status: 'signed-out'; session: null; user: null }>
    | Readonly<{ status: 'unavailable'; session: null; user: null; error: Error }>
  >;
}>;

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
  };
}
