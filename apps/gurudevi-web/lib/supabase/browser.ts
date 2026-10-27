'use client';

import { registerTokenResolver } from '@repo/core/api/clientRuntime';
import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';

export type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

export function createBrowserSupabaseClient(): BrowserSupabaseClient | null {
  const config = supabaseConfig();
  if (!config) return null;

  const client = createBrowserClient(config.url, config.publishableKey, {
    global: { fetch: secureApiFetch },
  });
  registerTokenResolver(async () => {
    const { data, error } = await client.auth.getSession();
    if (error) throw new Error('The browser authentication session is unavailable.');
    return data.session?.access_token ?? null;
  });
  return client;
}
