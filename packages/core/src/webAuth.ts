import { BrowserStorageAdapter } from '@repo/core/adapters/web/BrowserStorageAdapter';
import { storage } from '@repo/core/lib/storage';
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';

export type BrowserAuthRuntimeConfig = Readonly<{
  supabaseUrl: string;
  supabasePublishableKey: string;
}>;

export type BrowserIdentityBootstrap =
  | Readonly<{ status: 'authenticated'; session: Session; user: User }>
  | Readonly<{ status: 'signed-out'; session: null; user: null }>
  | Readonly<{ status: 'unavailable'; session: null; user: null; error: Error }>;

export type BrowserAuthRuntime = Readonly<{
  client: SupabaseClient;
  bootstrapIdentity: () => Promise<BrowserIdentityBootstrap>;
}>;

let browserStorageAdapter: BrowserStorageAdapter | undefined;

function requireBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Browser auth runtime can only be created in a browser client boundary.');
  }
}

function registerBrowserStorage(): void {
  browserStorageAdapter ??= new BrowserStorageAdapter();
  storage.registerAdapter(browserStorageAdapter);
}

const supabaseBrowserStorage = {
  async getItem(key: string): Promise<string | null> {
    return (await storage.getStringAsync(key)) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    storage.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    storage.delete(key);
  },
};

async function bootstrapBrowserIdentity(client: SupabaseClient): Promise<BrowserIdentityBootstrap> {
  try {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session) return { status: 'signed-out', session: null, user: null };

    return {
      status: 'authenticated',
      session: data.session,
      user: data.session.user,
    };
  } catch (cause) {
    return {
      status: 'unavailable',
      session: null,
      user: null,
      error: cause instanceof Error ? cause : new Error('Unable to read the browser session.'),
    };
  }
}

/**
 * Creates a browser-only Supabase boundary after persistent browser storage is registered.
 * Importing this module is SSR-safe; calling this factory is intentionally client-only.
 */
export function createBrowserAuthRuntime(config: BrowserAuthRuntimeConfig): BrowserAuthRuntime {
  requireBrowser();
  registerBrowserStorage();

  const client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      storage: supabaseBrowserStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return { client, bootstrapIdentity: () => bootstrapBrowserIdentity(client) };
}
