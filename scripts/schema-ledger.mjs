// Schema ledger: every table and column, classified by where it exists (live database,
// schema.zmodel) and who uses it (API SQL, client direct reads, device schema, sync streams).
// It decides nothing: each row is one item for a person to judge. The live side comes from
// ZenStack's own introspection (`zen db pull` into a temp file); schema.zmodel is never written.
// Run: doppler run --project gurudevi-mobile --config dev -- node scripts/schema-ledger.mjs
// Writes reports/schema-ledger.json and reports/schema-ledger.md.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const schemaDir = join(root, 'packages/schema');
const pulled = join(mkdtempSync(join(tmpdir(), 'schema-ledger-')), 'pulled.zmodel');
// The installed ZenStack CLI, run by node directly so no shell parses the arguments.
const cliPackage = createRequire(join(schemaDir, 'package.json')).resolve('@zenstackhq/cli/package.json');
const { bin } = JSON.parse(readFileSync(cliPackage, 'utf8'));
const cli = join(dirname(cliPackage), typeof bin === 'string' ? bin : Object.values(bin)[0]);
execFileSync(process.execPath, [cli, 'db', 'pull', '--schema', 'schema.zmodel', '-o', pulled, '--always-map', '--no-version-check'], {
  cwd: schemaDir,
  stdio: ['ignore', 'ignore', 'inherit'],
});

// A field is a column when its type is a scalar or a declared enum; any other type is a relation.
const SCALARS = new Set(['String', 'Int', 'BigInt', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json', 'Bytes', 'Unsupported']);

/** Tables of a zmodel file: table name → { model, columns: Map<column, type> }. */
function parseZmodel(text) {
  const models = new Map();
  const enums = new Set([...text.matchAll(/^enum\s+(\w+)/gm)].map((x) => x[1]));
  for (const m of text.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
    const body = m[2] ?? '';
    const table = body.match(/@@map\(["']([^"']+)["']\)/)?.[1] ?? m[1];
    const columns = new Map();
    for (const line of body.split(/\r?\n/)) {
      const f = line.match(/^\s+(\w+)\s+(\w+)(\[\])?(\?)?(.*)$/);
      if (!f || line.trim().startsWith('//') || line.trim().startsWith('@@')) continue;
      const [, field, type, list, , rest] = f;
      if (!SCALARS.has(type) && !enums.has(type)) continue;
      const column = (rest ?? '').match(/@map\(["']([^"']+)["']\)/)?.[1] ?? field;
      columns.set(column, `${type}${list ?? ''}`);
    }
    models.set(table, { model: m[1], columns });
  }
  return models;
}

const files = (dir, test) => {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.') || ['node_modules', 'dist', 'build', '__tests__', 'NUL'].includes(e.name)) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (test(e.name) && !/\.test\.|\.spec\./.test(e.name)) out.push(p);
    }
  };
  walk(dir);
  return out;
};
const usage = (paths, pattern) => {
  const hits = new Map();
  for (const p of paths)
    for (const m of readFileSync(p, 'utf8').matchAll(pattern)) {
      const t = m[1];
      if (!hits.has(t)) hits.set(t, new Set());
      hits.get(t).add(relative(root, p).replaceAll('\\', '/'));
    }
  return hits;
};

const live = parseZmodel(readFileSync(pulled, 'utf8'));
const declared = parseZmodel(readFileSync(join(schemaDir, 'schema.zmodel'), 'utf8'));
const ts = (n) => /\.(ts|tsx|mjs)$/.test(n);
const clientFiles = ['apps/gurudevi-web', 'apps/gurudevi-mobile', 'packages/core/src', 'packages/classroom'].flatMap((d) => files(join(root, d), ts));
// Integration tests create their own fixture tables; they aren't API usage.
const apiFiles = files(join(root, 'apps/sanctuary-api/src'), ts).filter((p) => !p.includes('.integration.'));
const deviceSchema = readFileSync(join(root, 'packages/core/src/adapters/powersync/schema.ts'), 'utf8');
// Tables the device keeps for itself and never replicates (LOCAL_ONLY_TABLES, camelCase names).
const localOnly = new Set(
  [...(deviceSchema.match(/LOCAL_ONLY_TABLES = new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? '').matchAll(/'(\w+)'/g)].map((m) =>
    (m[1] ?? '').replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
  ),
);
const users = {
  // `public.x(` is a function call, not a table.
  api: usage(apiFiles, /\bpublic\.([a-z_][a-z0-9_]*)\b(?!\s*\()/g),
  // `storage.from('bucket')` names a storage bucket, not a table.
  clientDirect: usage(clientFiles, /(?<!storage)\.from\(\s*['"]([a-z_][a-z0-9_]*)['"]/g),
  device: usage([join(root, 'packages/core/src/adapters/powersync/schema.ts')], /(?:sqliteTable|table)\(\s*['"]([a-z_][a-z0-9_]*)['"]/g),
  sync: usage([join(root, 'powersync/sync-config.yaml')], /\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/gi),
};

const tables = [...new Set([...live.keys(), ...declared.keys(), ...Object.values(users).flatMap((u) => [...u.keys()])])].sort();
const rows = tables.map((table) => {
  const inDb = live.get(table);
  const inModel = declared.get(table);
  const usedBy = Object.fromEntries(Object.entries(users).map(([k, u]) => [k, [...(u.get(table) ?? [])]]).filter(([, v]) => v.length > 0));
  const columns = inDb && inModel
    ? {
        dbOnly: [...inDb.columns.keys()].filter((c) => !inModel.columns.has(c)),
        modelOnly: [...inModel.columns.keys()].filter((c) => !inDb.columns.has(c)),
      }
    : undefined;
  const deviceOnly = Object.keys(usedBy).join() === 'device' && localOnly.has(table);
  const state = inDb && inModel
    ? columns && (columns.dbOnly.length || columns.modelOnly.length) ? 'both, columns differ' : 'both, columns match'
    : inDb ? 'database only' : deviceOnly ? 'device local-only' : inModel ? 'model only (no table)' : 'used, exists nowhere';
  return { table, state, usedBy: Object.keys(usedBy), usedByFiles: usedBy, columns };
});

const count = (s) => rows.filter((r) => r.state === s).length;
const states = ['both, columns match', 'both, columns differ', 'database only', 'model only (no table)', 'used, exists nowhere', 'device local-only'];
const generatedAt = new Date().toISOString();
writeFileSync(join(root, 'reports/schema-ledger.json'), `${JSON.stringify({ generatedAt, rows }, null, 1)}\n`);
const used = rows.filter((r) => r.usedBy.length > 0 || r.state !== 'database only');
writeFileSync(
  join(root, 'reports/schema-ledger.md'),
  [
    '# Schema ledger',
    '',
    `Generated ${generatedAt} by \`scripts/schema-ledger.mjs\` from the live database (zen db pull) and \`packages/schema/schema.zmodel\`.`,
    'Each row is one item to judge; the ledger decides nothing.',
    '',
    '| State | Tables |',
    '| --- | --- |',
    ...states.map((s) => `| ${s} | ${count(s)} |`),
    '',
    `Rows below: every table that is used somewhere, declared in the model, or missing (${used.length} of ${rows.length}). Database-only tables nothing uses are in the JSON.`,
    '',
    '| Table | State | Used by | Columns only in database | Columns only in model |',
    '| --- | --- | --- | --- | --- |',
    ...used.map((r) => `| \`${r.table}\` | ${r.state} | ${r.usedBy.join(', ') || '—'} | ${r.columns?.dbOnly.join(', ') || '—'} | ${r.columns?.modelOnly.join(', ') || '—'} |`),
    '',
  ].join('\n'),
);
console.log(Object.fromEntries(states.map((s) => [s, count(s)])), `rows=${rows.length}`);
