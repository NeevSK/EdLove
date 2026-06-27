import { createClient } from '@supabase/supabase-js';
import { supabaseAuthStorage } from '../lib/authStorage';

// Configuration from environment variables
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const baseFetch = globalThis.fetch.bind(globalThis);

// Validate environment variables
if (!supabaseUrl || !supabasePublishableKey) {
  if (process.env.NODE_ENV === 'test') {
    supabaseUrl = 'https://mock-supabase-url.supabase.co';
    supabasePublishableKey = 'mock-supabase-key';
  } else {
    throw new Error(
      'Missing Supabase credentials. Please check your .env file.\n' +
        'Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );
  }
}

const supabaseOptions: any = {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof globalThis.window !== 'undefined',
  },
  global: {
    fetch: (url: Parameters<typeof fetch>[0], options?: Parameters<typeof fetch>[1]) => {
      // Scoped sanitization: strip known ghost PostgREST params.
      // Only remove params that are NEVER valid for any Supabase API endpoint.
      const GHOST_PARAMS = ['onboarding_status'] as const;
      let sanitizedUrl: string;
      try {
        const urlStr =
          typeof url === 'string'
            ? url
            : typeof Request !== 'undefined' && url instanceof Request
              ? url.url
              : String(url);
        const urlObj = new URL(urlStr);
        let didStrip = false;
        for (const param of GHOST_PARAMS) {
          if (urlObj.searchParams.has(param)) {
            urlObj.searchParams.delete(param);
            didStrip = true;
            if (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__) {
              console.warn(`[Supabase] Stripped ghost param '${param}' from ${urlObj.pathname}`);
            }
          }
        }
        sanitizedUrl = didStrip ? urlObj.toString() : urlStr;
      } catch {
        sanitizedUrl =
          typeof url === 'string'
            ? url
            : typeof Request !== 'undefined' && url instanceof Request
              ? url.url
              : String(url);
      }
      return baseFetch(sanitizedUrl, options);
    },
  },
};

/**
 * Standard Supabase client for the Sanctuary platform.
 * Uses the Sovereign StorageManager to ensure platform-agnostic persistence.
 */
export const __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ = createClient(
  supabaseUrl,
  supabasePublishableKey,
  supabaseOptions,
);
