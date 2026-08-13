const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Supabase anon keys are sunset in 2026 — use the new publishable API key instead
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    'Missing required environment variables.\n' +
      'Run this command through Doppler: pnpm run tools:check-schools',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);

async function checkSchools() {
  console.log('Querying schools...');
  const { data, error } = await supabase.from('schools').select('id, name, type');

  if (error) {
    console.error('Error fetching schools:', error);
  } else {
    console.log('Found schools:', data);
  }
}

checkSchools().catch((error) => {
  console.error('School check failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
