import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const baseUrl = process.env.DATABASE_URL;
if (!baseUrl) throw new Error('DATABASE_URL is required through runtime secret injection');
if (process.env.API_DATABASE_CREATE_ACK !== 'create-isolated-database')
  throw new Error(
    'Explicit API_DATABASE_CREATE_ACK=create-isolated-database is required for isolated database provisioning',
  );
const name = `pjc_api_foundation_${randomUUID().replaceAll('-', '')}`;
const quoted = `"${name}"`;
const admin = new Pool({
  connectionString: baseUrl,
  max: 1,
  connectionTimeoutMillis: 8000,
  statement_timeout: 10000,
});
let created = false;
let fixture: Pool | undefined;
try {
  // Only the new prefixed database is mutated. The configured DB supplies the
  // connection and CREATE DATABASE authority; none of its application rows change.
  await admin.query(`create database ${quoted}`);
  created = true;
  console.info({ event: 'api.database_fixture.created', database: name });
  const isolatedUrl = new URL(baseUrl);
  isolatedUrl.pathname = `/${name}`;
  fixture = new Pool({
    connectionString: isolatedUrl.toString(),
    max: 1,
    connectionTimeoutMillis: 8000,
    statement_timeout: 10000,
  });
  await fixture.query(`
    create schema auth;
    create table public.users (id uuid primary key, deleted_at timestamptz,
      display_name text, onboarding_completed boolean not null default false);
    create table public.auth_identities (
      user_id uuid not null references public.users(id), provider text not null,
      provider_user_id text not null, unique(provider,provider_user_id));
    create table auth.users (id uuid primary key, deleted_at timestamptz, banned_until timestamptz);
    create table auth.sessions (id uuid primary key, user_id uuid not null references auth.users(id), not_after timestamptz);
    create table public.bonds (id uuid primary key, user_id uuid not null references public.users(id),
      entity_id text not null, entity_type text not null, capacity text not null,
      citizenship text not null default 'FIRST_CLASS', status text not null, valid_from timestamptz not null, valid_until timestamptz);
    create table public.user_rewards(id uuid primary key, user_id uuid not null references public.users(id));
  `);
  await fixture.query(`
    create function auth.uid() returns uuid language sql stable as $$
      select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
    $$;
  `);
  // The resolver is taken from the actual identity migration. Hosted Auth's
  // token issuance and lifecycle triggers remain explicit fixture substitutions.
  const identityMigration = await readFile(
    new URL(
      '../../gurudevi-mobile/supabase/migrations/20261015150000_server_owned_auth_identity.sql',
      import.meta.url,
    ),
    'utf8',
  );
  const resolver = identityMigration.match(
    /CREATE OR REPLACE FUNCTION public\.get_my_id\(\)[\s\S]*?GRANT EXECUTE ON FUNCTION public\.get_my_id\(\) TO authenticated, anon, service_role;/,
  )?.[0];
  if (!resolver) throw new Error('Canonical identity resolver migration is missing');
  await fixture.query(resolver);
  await fixture.query('grant usage on schema public,auth to authenticated');
  const rewardsPolicies = await readFile(
    new URL(
      '../../gurudevi-mobile/supabase/migrations/20260309000000_identity_rls_fix.sql',
      import.meta.url,
    ),
    'utf8',
  );
  const rewardsSection = rewardsPolicies.slice(
    rewardsPolicies.indexOf('DROP POLICY IF EXISTS "Users can view own rewards"'),
    rewardsPolicies.indexOf('-- ── user_growth_state'),
  );
  if (!rewardsSection.includes('ON public.user_rewards FOR UPDATE'))
    throw new Error('Reward policy authority missing');
  await fixture.query(rewardsSection);
  await fixture.query('grant select,insert,update on public.user_rewards to authenticated');
  for (const migration of [
    '20260726000000_feature_access_snapshot_contract.sql',
    '20260726000001_entity_scoped_permission_snapshots.sql',
    '20261014120000_operation_receipts.sql',
    '20261024183000_external_effect_intents.sql',
    '20261030020000_api_operation_foundation.sql',
    '20261030022000_api_request_budgets.sql',
    '20261030021000_user_rewards_rls_boundary.sql',
    '20261104010000_api_command_audit.sql',
    '20261015160000_omnichannel_authority_foundation.sql',
    '20261106020000_records_and_grants.sql',
  ]) {
    await fixture.query(
      await readFile(
        new URL(`../../gurudevi-mobile/supabase/migrations/${migration}`, import.meta.url),
        'utf8',
      ),
    );
  }
  // Start from the old open grant, then apply the real fix, so the scenario proves the fix.
  await fixture.query('grant insert, update, delete on public.bonds to authenticated');
  const serverOwnedBonds = (
    await readFile(
      new URL(
        '../../gurudevi-mobile/supabase/migrations/20261106010000_server_owned_bonds_and_citizenship.sql',
        import.meta.url,
      ),
      'utf8',
    )
  ).match(/revoke insert, update, delete, truncate on table public\.bonds from anon, authenticated;/)?.[0];
  if (!serverOwnedBonds) throw new Error('Server-owned bonds revoke is missing');
  await fixture.query(serverOwnedBonds);
  const accountCutover = await readFile(
    new URL(
      '../../gurudevi-mobile/supabase/migrations/20261025010000_canonical_uuidv8_accounts.sql',
      import.meta.url,
    ),
    'utf8',
  );
  const policyCutover = accountCutover.match(
    /-- Existing business RLS refers to accounts\.[\s\S]*?(DO \$\$[\s\S]*?\n\$\$;)/,
  )?.[1];
  if (!policyCutover) throw new Error('Canonical account RLS cutover is missing');
  await fixture.query(policyCutover);
  await fixture.end();
  fixture = undefined;
  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        'node_modules/vitest/vitest.mjs',
        'run',
        '--config',
        'vitest.foundation-database.config.ts',
        ...process.argv.slice(2),
      ],
      {
        cwd: fileURLToPath(new URL('..', import.meta.url)),
        env: {
          ...process.env,
          DATABASE_URL: isolatedUrl.toString(),
          API_TEST_DATABASE_URL: isolatedUrl.toString(),
          API_DATABASE_TEST_ACK: 'isolated-foundation',
          API_DATABASE_TEST: '1',
        },
        stdio: 'inherit',
        windowsHide: true,
      },
    );
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
  process.exitCode = exitCode;
} catch {
  console.error({ event: 'api.database_fixture.failed' });
  process.exitCode = 1;
} finally {
  if (fixture) await fixture.end();
  if (created) {
    // Name is generated locally; this cannot target the supplied database.
    await admin.query(`drop database ${quoted} with (force)`);
    const residue = await admin.query('select datname from pg_database where datname=$1', [name]);
    if (residue.rowCount !== 0) throw new Error('Isolated database cleanup did not complete');
    console.info({ event: 'api.database_fixture.cleaned', database: name });
  }
  await admin.end();
}
