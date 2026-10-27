import { supabaseAuthStorage } from '@repo/core/lib/authStorage';
import { createClient } from '@supabase/supabase-js';
import { assertSecureApiUrl, secureApiFetch } from '../api/transportSecurity';

type PublicRuntimeConfig = {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

const getExpoPublicRuntime = (): PublicRuntimeConfig | undefined => {
  try {
    // Only access global Expo constants if available
    const Constants = (globalThis as any).expo?.modules?.ExponentConstants ?? null;
    return Constants?.expoConfig?.extra?.publicRuntime;
  } catch {
    return undefined;
  }
};

const publicRuntime = getExpoPublicRuntime();

let supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  publicRuntime?.supabaseUrl;
let supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  publicRuntime?.supabasePublishableKey;
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
      console.warn(`[Supabase] Stripped ghost param 'onboarding_status' from ${urlObj.pathname}`);
    }
    return urlObj.toString();
  } catch {
    return urlStr;
  }
};

if (!supabaseUrl || !supabasePublishableKey) {
  if (
    process.env.NODE_ENV === 'test' ||
    typeof window !== 'undefined' ||
    process.env.NODE_ENV === 'development'
  ) {
    supabaseUrl = supabaseUrl || 'https://mock-supabase-url.supabase.co';
    supabasePublishableKey = supabasePublishableKey || 'mock-supabase-key';
  } else {
    throw new Error(
      'Missing Supabase credentials. Please check your .env file.\n' +
        'Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );
  }
}

assertSecureApiUrl(supabaseUrl);

const supabaseOptions: any = {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof globalThis.window !== 'undefined',
  },
  global: {
    fetch: (url: Parameters<typeof fetch>[0], options?: Parameters<typeof fetch>[1]) => {
      const sanitizedUrl = sanitizeSupabaseUrl(url);
      return secureApiFetch(sanitizedUrl, options);
    },
  },
};

/** Canonical client owned by the Supabase adapter boundary. */
export const supabaseClient = createClient(supabaseUrl, supabasePublishableKey, supabaseOptions);
