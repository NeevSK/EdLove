#!/usr/bin/env node
/**
 * Web stack gate (decision: docs/decisions/2026-11-12-web-stack-astro-vite.md).
 *
 * Two ratchets in tooling/web-stack-ratchet.json, both only allowed to go down:
 *
 * 1. nextImportFiles: files in apps/gurudevi-web/app and lib importing `next/*`. Each one is a screen
 *    still tied to Next; the client build runs them through stand-ins in apps/gurudevi-web/spa/next.
 * 2. exploreBackendClients: backend clients found in the Explore bundle. Explore has no account, no
 *    API and no database, so the goal is an empty list. A client not on the list fails; one on the
 *    list that has gone is reported so the list can shrink.
 * 3. directDatabaseCalls: table queries, stored procedures, storage and realtime channels called
 *    straight from web code. The web client reaches data only through the v1 API; the goal is 0.
 *
 *   node scripts/check-web-stack.mjs            check (builds the Explore bundle first)
 *   node scripts/check-web-stack.mjs --no-build check an existing apps/gurudevi-web/dist-explore
 *   node scripts/check-web-stack.mjs --lower    write lower numbers after an improvement (never higher)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const WEB = path.join(ROOT, 'apps/gurudevi-web');
const RATCHET = path.join(ROOT, 'tooling/web-stack-ratchet.json');
const args = new Set(process.argv.slice(2));

// A string that only appears in the bundle when that client's code is in it.
const BACKEND_CLIENTS = {
  'supabase-auth': 'GoTrueClient',
  'supabase-realtime': 'RealtimeClient',
  'supabase-host': 'supabase.co',
  'sanctuary-api': '/api/v1',
  powersync: 'PowerSyncDatabase',
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === 'node_modules' ? [] : walk(p);
    return /\.tsx?$/.test(d.name) ? [p] : [];
  });
}

const NEXT_IMPORT = /from\s+['"]next(\/[a-z-]+)?['"]/;
const DATABASE_CALL =
  /\.from\(\s*['"`][a-z_]+['"`]\s*\)|\.rpc\(\s*['"`]|\.storage\s*\.\s*from\(|\.channel\(\s*['"`]|\.removeChannel\(/g;
const nextImportFiles = ['app', 'lib']
  .flatMap((d) => walk(path.join(WEB, d)))
  .filter((f) => NEXT_IMPORT.test(fs.readFileSync(f, 'utf8'))).length;
const directDatabaseCalls = ['app', 'lib', 'spa']
  .flatMap((d) => walk(path.join(WEB, d)))
  .filter((f) => !/\.test\.tsx?$/.test(f))
  .reduce((sum, f) => sum + (fs.readFileSync(f, 'utf8').match(DATABASE_CALL)?.length ?? 0), 0);

if (!args.has('--no-build')) {
  execFileSync('pnpm', ['exec', 'vite', 'build', '--mode', 'explore', '--logLevel', 'error'], {
    cwd: WEB,
    stdio: 'inherit',
  });
}
const assets = path.join(WEB, 'dist-explore/assets');
if (!fs.existsSync(assets)) throw new Error('No Explore bundle: run without --no-build first.');
const bundle = fs
  .readdirSync(assets)
  .filter((f) => f.endsWith('.js'))
  .map((f) => fs.readFileSync(path.join(assets, f), 'utf8'))
  .join('\n');
const exploreBackendClients = Object.entries(BACKEND_CLIENTS)
  .filter(([, marker]) => bundle.includes(marker))
  .map(([name]) => name)
  .sort();

const ceiling = JSON.parse(fs.readFileSync(RATCHET, 'utf8'));
const failures = [];
if (nextImportFiles > ceiling.nextImportFiles)
  failures.push(
    `next/* importing files rose to ${nextImportFiles} (ceiling ${ceiling.nextImportFiles})`,
  );
if (directDatabaseCalls > ceiling.directDatabaseCalls)
  failures.push(
    `direct database calls rose to ${directDatabaseCalls} (ceiling ${ceiling.directDatabaseCalls})`,
  );
const added = exploreBackendClients.filter((c) => !ceiling.exploreBackendClients.includes(c));
if (added.length) failures.push(`Explore bundle gained backend clients: ${added.join(', ')}`);
const gone = ceiling.exploreBackendClients.filter((c) => !exploreBackendClients.includes(c));

console.log(`next/* importing files   ${nextImportFiles} (ceiling ${ceiling.nextImportFiles})`);
console.log(
  `direct database calls    ${directDatabaseCalls} (ceiling ${ceiling.directDatabaseCalls})`,
);
console.log(
  `Explore backend clients  ${exploreBackendClients.join(', ') || 'none'} (allowed ${ceiling.exploreBackendClients.join(', ') || 'none'})`,
);
if (gone.length) console.log(`Improved: ${gone.join(', ')} left the Explore bundle.`);

if (failures.length) {
  for (const f of failures) console.error(`[FAIL] ${f}`);
  process.exit(1);
}
if (
  args.has('--lower') &&
  (nextImportFiles < ceiling.nextImportFiles ||
    directDatabaseCalls < ceiling.directDatabaseCalls ||
    gone.length)
) {
  fs.writeFileSync(
    RATCHET,
    `${JSON.stringify({ ...ceiling, nextImportFiles: Math.min(nextImportFiles, ceiling.nextImportFiles), directDatabaseCalls: Math.min(directDatabaseCalls, ceiling.directDatabaseCalls), exploreBackendClients: ceiling.exploreBackendClients.filter((c) => !gone.includes(c)) }, null, 2)}\n`,
  );
  console.log('Ceilings lowered.');
}
console.log('[PASS] web stack');
