import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required env vars: SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const SUPABASE_URL: string = supabaseUrl;
const SUPABASE_KEY: string = supabaseKey;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  }
});

async function verify() {
  console.log('--- Verifying Guest Onboarding Fix ---');
  
  // 1. Attempt Anonymous Sign-In
  console.log('Attempting anonymous sign-in...');
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  
  if (authError) {
    console.error('❌ Auth Error:', authError.message);
    process.exit(1);
  }
  
  const user = authData.user;
  if (!user) {
    console.error('❌ Auth Error: No user returned');
    process.exit(1);
  }
  console.log('✅ Auth successful! User ID:', user.id);
  
  // 2. Resolve internal user ID from auth context
  console.log('Resolving internal user ID via get_my_id()...');
  const { data: internalUserId, error: internalIdError } = await supabase.rpc('get_my_id');

  if (internalIdError || !internalUserId) {
    console.error('❌ Identity Resolution Error:', internalIdError?.message ?? 'No internal user ID returned');
    process.exit(1);
  }

  // 3. Check public.users table using resolved internal ID
  console.log('Checking public.users table for internal record...');
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', internalUserId)
    .single();
    
  if (profileError) {
    console.error('❌ Profile Error:', profileError.message);
    process.exit(1);
  }
  
  console.log('✅ Profile found in public.users!');
  console.log('Profile details:', JSON.stringify(profile, null, 2));
  
  console.log('--- Verification Complete: SUCCESS ---');
}

verify().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
