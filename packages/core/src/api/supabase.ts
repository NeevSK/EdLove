import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { storage } from '../lib/storage';

// Configuration from environment variables
const supabaseUrl = process.env['EXPO_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey =
  process.env['EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] || process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please check your .env file.\n' +
      'Required: EXPO_PUBLIC_SUPABASE_URL and (EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY)',
  );
}

/**
 * Standard Supabase client for the Sanctuary platform.
 * Uses the Sovereign StorageManager to ensure platform-agnostic persistence.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});
