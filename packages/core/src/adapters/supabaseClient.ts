import { createClient } from '@supabase/supabase-js';
import { supabaseAuthStorage } from '@repo/core/lib/authStorage';

let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const baseFetch = globalThis.fetch.bind(globalThis);

const urlStringFromInput = (url: Parameters<typeof fetch>[0]): string =>
  typeof url === 'string'
    ? url
    : typeof Request !== 'undefined' && url instanceof Request
      ? url.url
      : String(url);

const sanitizeSupabaseUrl = (url: Parameters<typeof fetch>[0]): string => {
  const urlStr = urlStringFromInput(url);
  try {
    const urlObj = new URL(urlStr);
    if (!urlObj.searchParams.has('onboarding_status')) return urlStr;
    urlObj.searchParams.delete('onboarding_status');
    if (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__) {
      console.warn(
        `[Supabase] Stripped ghost param 'onboarding_status' from ${urlObj.pathname}`,
      );
    }
    return urlObj.toString();
  } catch {
    return urlStr;
  }
};

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
      return baseFetch(sanitizeSupabaseUrl(url), options);
    },
  },
};

/** Canonical client owned by the Supabase adapter boundary. */
export const supabaseClient = createClient(
  supabaseUrl,
  supabasePublishableKey,
  supabaseOptions,
);
