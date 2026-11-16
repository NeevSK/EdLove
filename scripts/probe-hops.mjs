// Live probe of every hop from this machine: the version each service reports, where it runs
// (DNS and reverse DNS), and latency (first call, then the median of four more). Not a test: it
// measures the real services. Run: doppler run --project gurudevi-mobile --config dev -- node scripts/probe-hops.mjs
// Writes reports/hops/<timestamp>.json; prints no secrets.
import { promises as dns } from 'node:dns';
import { createRequire } from 'node:module';

import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire(new URL('../apps/sanctuary-api/package.json', import.meta.url));
const pg = require('pg');
const env = process.env;
const N = 5;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const time = async (fn) => { const t = performance.now(); const r = await fn(); return [performance.now() - t, r]; };
async function sample(fn) {
  const ms = []; let last;
  for (let i = 0; i < N; i++) { const [t, r] = await time(fn); ms.push(t); last = r; }
  return { first: Math.round(ms[0]), median: Math.round(median(ms.slice(1))), last };
}
async function where(host) {
  try {
    const [ip] = await dns.resolve4(host).catch(() => dns.resolve6(host));
    const ptr = await dns.reverse(ip).catch(() => []);
    return `${ip} ${ptr[0] ?? ''}`.trim();
  } catch (e) { return `dns: ${e.code}`; }
}
const out = {};
const supabase = new URL(env.EXPO_PUBLIC_SUPABASE_URL);
const anon = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 1. Postgres (direct connection the API uses)
{
  const dbHost = new URL(env.DATABASE_URL).hostname;
  const connect = await sample(async () => { const c = new pg.Client({ connectionString: env.DATABASE_URL }); await c.connect(); await c.end(); });
  const c = new pg.Client({ connectionString: env.DATABASE_URL }); await c.connect();
  const q = await sample(() => c.query('select 1'));
  const v = (await c.query("select version() v, current_setting('server_version') s, (select count(*) from pg_extension)::int ext, (select string_agg(extname||' '||extversion, ', ' order by extname) from pg_extension where extname in ('pg_net','pgcrypto','pg_graphql','supabase_vault','pg_cron','pgsodium','pg_stat_statements','pgjwt','uuid-ossp')) e")).rows[0];
  const slots = (await c.query("select count(*)::int n from pg_replication_slots where slot_name like 'powersync%'")).rows[0].n;
  await c.end();
  out.postgres = { host: dbHost.replace(/^[^.]+/, '*'), where: await where(dbHost), version: v.s, extensions: v.e, extensionCount: v.ext, powersyncSlots: slots, connectMs: connect, queryMs: { first: q.first, median: q.median } };
}
// 2. Supabase Auth, table API (PostgREST), JWKS
const head = anon ? { apikey: anon } : {};
for (const [name, path] of [['auth', '/auth/v1/health'], ['postgrest', '/rest/v1/'], ['jwks', '/auth/v1/.well-known/jwks.json']]) {
  const r = await sample(async () => { const res = await fetch(new URL(path, supabase), { headers: head }); const body = await res.text(); return { status: res.status, server: res.headers.get('server'), via: res.headers.get('via'), cf: res.headers.get('cf-ray')?.split('-')[1], body }; });
  let version;
  try { const j = JSON.parse(r.last.body); version = j.version ?? j.info?.version ?? j.swagger; } catch {}
  out[`supabase_${name}`] = { status: r.last.status, version, server: r.last.server, edgePop: r.last.cf, firstMs: r.first, medianMs: r.median };
}
out.supabase_where = await where(supabase.hostname);
// 3. PowerSync Cloud: liveness and service headers
{
  const ps = new URL(env.EXPO_PUBLIC_POWERSYNC_URL ?? env.POWERSYNC_URL);
  const r = await sample(async () => { const res = await fetch(new URL('/probes/liveness', ps)); await res.text(); return { status: res.status, server: res.headers.get('server'), version: res.headers.get('x-powersync-version') ?? res.headers.get('powersync-version') }; });
  out.powersync = { where: await where(ps.hostname), status: r.last.status, server: r.last.server, version: r.last.version, firstMs: r.first, medianMs: r.median };
}
// 4. Render API (what devices call today)
{
  const api = new URL(env.EXPO_PUBLIC_API_URL);
  const r = await sample(async () => { const res = await fetch(new URL('/health/live', api)); return { status: res.status, body: (await res.text()).slice(0, 120), server: res.headers.get('server'), rndr: res.headers.get('rndr-id') ? 'yes' : 'no', cf: res.headers.get('cf-ray')?.split('-')[1] }; });
  out.render_api = { where: await where(api.hostname), status: r.last.status, body: r.last.body, server: r.last.server, edgePop: r.last.cf, firstMs: r.first, medianMs: r.median };
}
// 5. GrowthBook flags CDN
{
  const host = env.EXPO_PUBLIC_GROWTHBOOK_API_HOST;
  if (host) {
    const r = await sample(async () => { const res = await fetch(new URL(`/api/features/${env.EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY}`, host)); await res.text(); return { status: res.status, server: res.headers.get('server'), cf: res.headers.get('cf-ray')?.split('-')[1] }; });
    out.growthbook = { where: await where(new URL(host).hostname), status: r.last.status, server: r.last.server, edgePop: r.last.cf, firstMs: r.first, medianMs: r.median };
  }
}
out.measuredAt = new Date().toISOString();
const dir = new URL('../reports/hops/', import.meta.url);
mkdirSync(dir, { recursive: true });
const file = new URL(`${out.measuredAt.replace(/[:.]/g, '-')}.json`, dir);
writeFileSync(file, `${JSON.stringify(out, null, 1)}
`);
console.log(JSON.stringify(out, null, 1));
