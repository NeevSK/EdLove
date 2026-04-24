import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SECRET_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Standard Supabase client (respects RLS).
 * Use this for client-side operations or non-privileged background tasks.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 'God Mode' Supabase client (bypasses RLS).
 * ONLY for use in protected Inngest handlers / server-side orchestration.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
