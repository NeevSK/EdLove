import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qzoawolfkuwiuyaoiybz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Nt2qdjI6uKQHFQuyeqZJww_cjKYiV8W';

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
  
  // 2. Check public.users table
  console.log('Checking public.users table for record...');
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
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
