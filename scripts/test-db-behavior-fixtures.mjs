#!/usr/bin/env node

const required = [
  'SUPABASE_TEST_URL',
  'SUPABASE_TEST_ANON_KEY',
  'SUPABASE_TEST_USER_EMAIL',
  'SUPABASE_TEST_USER_PASSWORD',
  'SUPABASE_TEST_FORBIDDEN_SCHOOL_ID',
  'SUPABASE_TEST_INACTIVE_INVITE_CODE',
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`NOT RUN: authenticated DB fixtures are required (${missing.join(', ')}).`);
  console.error('Provide staging/test-only values; this suite never creates users or writes rows.');
  process.exitCode = 2;
  process.exit();
}

const { createClient } = await import('@supabase/supabase-js');

const client = createClient(process.env.SUPABASE_TEST_URL, process.env.SUPABASE_TEST_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: signInError } = await client.auth.signInWithPassword({
  email: process.env.SUPABASE_TEST_USER_EMAIL,
  password: process.env.SUPABASE_TEST_USER_PASSWORD,
});
if (signInError) throw new Error(`Fixture sign-in failed: ${signInError.message}`);

let failures = 0;
function expect(condition, message) {
  if (condition) console.log(`PASS ${message}`);
  else {
    failures += 1;
    console.error(`FAIL ${message}`);
  }
}

const forbiddenMembership = await client
  .from('school_memberships')
  .select('id')
  .eq('school_id', process.env.SUPABASE_TEST_FORBIDDEN_SCHOOL_ID)
  .limit(1);
expect(!forbiddenMembership.error, 'forbidden membership query completes under RLS');
expect((forbiddenMembership.data ?? []).length === 0, 'cross-school membership rows are not visible');

const inactiveInvite = await client
  .from('invite_codes')
  .select('id')
  .eq('code', process.env.SUPABASE_TEST_INACTIVE_INVITE_CODE)
  .eq('is_active', true)
  .maybeSingle();
expect(!inactiveInvite.error || inactiveInvite.error.code === 'PGRST116', 'inactive invite lookup is RLS-safe');
expect(!inactiveInvite.data, 'inactive invite is not redeemable through active-code visibility');

const forbiddenClaims = await client
  .from('school_registry_claims')
  .select('id')
  .eq('school_id', process.env.SUPABASE_TEST_FORBIDDEN_SCHOOL_ID)
  .limit(1);
expect(!forbiddenClaims.error, 'forbidden registry-claim query completes under RLS');
expect((forbiddenClaims.data ?? []).length === 0, 'cross-school registry claims are not visible');

if (failures) {
  console.error(`Fixture behavior suite failed with ${failures} finding(s).`);
  process.exitCode = 1;
} else {
  console.log('Fixture behavior suite passed.');
}
