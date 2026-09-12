import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseConfig } from './config';

export type ServerSupabaseClient = ReturnType<typeof createServerClient>;

export async function createServerSupabaseClient(): Promise<ServerSupabaseClient | null> {
  const config = supabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can read cookies but cannot mutate their response headers.
        }
      },
    },
  });
}
