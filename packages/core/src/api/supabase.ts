import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { storage } from '../lib/storage';

// Configuration from environment variables
const supabaseUrl = process.env['EXPO_PUBLIC_SUPABASE_URL'];
const supabasePublishableKey = process.env['EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

// Validate environment variables
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase credentials. Please check your .env file.\n' +
      'Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );
}

/**
 * Standard Supabase client for the Sanctuary platform.
 * Uses the Sovereign StorageManager to ensure platform-agnostic persistence.
 *
 * FETCH OVERRIDE NOTE:
 * The global.fetch override below strips 'onboarding_status' from Supabase
 * PostgREST requests. This is a targeted fix for a schema-level ghost column
 * that PostgREST sometimes injects into queries from stale schema cache.
 * Scope: ONLY applies to requests made by this specific Supabase client
 * instance, NOT to global fetch. This is intentional and safe.
 */
export const __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Wrap StorageManager to satisfy Supabase's GoTrue storage interface
    storage: {
      getItem: (key: string) => storage.getString(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    fetch: (url, options) => {
      // Scoped sanitization: strip known ghost PostgREST params.
      // Only remove params that are NEVER valid for any Supabase API endpoint.
      const GHOST_PARAMS = ['onboarding_status'] as const;
      let sanitizedUrl: string;
      try {
        const urlStr = typeof url === 'string' ? url : url instanceof Request ? url.url : String(url);
        const urlObj = new URL(urlStr);
        let didStrip = false;
        for (const param of GHOST_PARAMS) {
          if (urlObj.searchParams.has(param)) {
            urlObj.searchParams.delete(param);
            didStrip = true;
            if (__DEV__) {
              console.warn(`[Supabase] Stripped ghost param '${param}' from ${urlObj.pathname}`);
            }
          }
        }
        sanitizedUrl = didStrip ? urlObj.toString() : urlStr;
      } catch {
        sanitizedUrl = typeof url === 'string' ? url : url instanceof Request ? url.url : String(url);
      }
      return fetch(sanitizedUrl, options);
    },
  },
});
