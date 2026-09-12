'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';

export type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

export function createBrowserSupabaseClient(): BrowserSupabaseClient | null {
  const config = supabaseConfig();
  if (!config) return null;

  return createBrowserClient(config.url, config.publishableKey);
}
