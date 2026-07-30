import { execFileSync } from 'node:child_process';

const execute = process.argv.includes('--execute');
const connectionUrl = process.env.FEATURE_LIFECYCLE_DB_URL;

const TABLE_QUERY = `
select json_build_object(
  'tableExists', exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'feature_flags'
  ),
  'updatedAtColumnExists', exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'feature_flags'
      and column_name = 'updated_at'
  )
)::text;
`.trim();

const DATA_QUERY = `
select json_build_object(
  'rowCount', count(*)::bigint,
  'lastLegacyWrite', max(updated_at)
)::text
from public.feature_flags;
`.trim();

function fail(message) {
  console.error(`Legacy FeatureFlag schema check failed: ${message}`);
  process.exitCode = 1;
}

function printReadOnlyProcedure() {
  console.log('Read-only production check. No database mutation is performed.');
  console.log('Set FEATURE_LIFECYCLE_DB_URL in a controlled operator environment, then run:');
  console.log('  pnpm feature-lifecycle:schema-check -- --execute');
  console.log('\nEquivalent SQL:');
  console.log(TABLE_QUERY);
  console.log(DATA_QUERY);
}

function connectionEnvironment(urlValue) {
  const url = new URL(urlValue);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('FEATURE_LIFECYCLE_DB_URL must use a PostgreSQL connection URL.');
  }

  const environment = { ...process.env };
  environment.PGHOST = url.hostname;
  environment.PGPORT = url.port || '5432';
  environment.PGUSER = decodeURIComponent(url.username);
  environment.PGPASSWORD = decodeURIComponent(url.password);
  environment.PGDATABASE = url.pathname.replace(/^\//, '') || 'postgres';
  const sslMode = url.searchParams.get('sslmode') || 'require';
  if (!['require', 'verify-full'].includes(sslMode)) {
    throw new Error('FEATURE_LIFECYCLE_DB_URL must use sslmode=require or sslmode=verify-full.');
  }
  environment.PGSSLMODE = sslMode;
  return environment;
}

function query(sql, environment) {
  return execFileSync(
    'psql',
    [
      '-X',
      '--no-psqlrc',
      '--quiet',
      '--tuples-only',
      '--no-align',
      '--set',
      'ON_ERROR_STOP=1',
      '-c',
      sql,
    ],
    { env: environment, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ).trim();
}

try {
  if (!execute) {
    printReadOnlyProcedure();
    process.exit(0);
  }
  if (!connectionUrl) {
    throw new Error('FEATURE_LIFECYCLE_DB_URL is required with --execute.');
  }

  const environment = connectionEnvironment(connectionUrl);
  const schema = JSON.parse(query(TABLE_QUERY, environment));
  console.log(JSON.stringify({ schema }, null, 2));

  if (!schema.tableExists) {
    console.log('Legacy table is absent; no schema retirement migration is required.');
    process.exit(0);
  }
  if (!schema.updatedAtColumnExists) {
    throw new Error(
      'public.feature_flags exists but updated_at is absent; inspect schema manually.',
    );
  }

  const data = JSON.parse(query(DATA_QUERY, environment));
  console.log(JSON.stringify({ data }, null, 2));
  console.log(
    'This is evidence only. Obtain owner, retention, backup, and deployment-window approvals before any drop migration.',
  );
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
