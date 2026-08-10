#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import {
  classifyDrift,
  loadStructuredIgnoreManifest,
  parseZModelAst,
  renderDriftReport,
} from './lib/database-drift-ast.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ZMODEL_PATH = path.join(ROOT, 'packages', 'schema', 'schema.zmodel');
const APP_DIR = path.join(ROOT, 'apps', 'gurudevi-mobile');
const DEFAULT_OUT_DIR = path.join(APP_DIR, 'reports', 'db-drift');
const IGNORE_MANIFEST_PATH = path.join(ROOT, '.driftignore.ast.json');

const args = process.argv.slice(2);
const options = { outDir: DEFAULT_OUT_DIR, dryRun: false, noWrite: false, failOnDrift: false };
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--dry-run') {
    options.dryRun = true;
    options.noWrite = true;
  }
  else if (arg === '--no-write') options.noWrite = true;
  else if (arg === '--fail-on-drift') options.failOnDrift = true;
  else if (arg === '--out-dir' && args[i + 1]) {
    options.outDir = path.resolve(ROOT, args[i + 1]);
    i += 1;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

const TEXT_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.sql', '.zmodel', '.json']);
const SKIPPED_DIRS = new Set([
  'node_modules', '.git', 'reports', 'dist', 'build', '.expo', 'coverage',
  '.vercel', '.astro', 'archives', 'public', 'old', 'old_docs', 'generated', 'data',
]);

function collectTextFiles(root, files = []) {
  if (!fs.existsSync(root)) return files;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIPPED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (fullPath.includes(`${path.sep}src${path.sep}generated`)) continue;
      collectTextFiles(fullPath, files);
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectUsage(objectName, files) {
  const escapedName = objectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escapedName}\\b`, 'g');
  let count = 0;
  const references = [];
  for (const file of files) {
    const matches = fs.readFileSync(file, 'utf8').match(pattern);
    if (!matches) continue;
    count += matches.length;
    if (references.length < 8) references.push(path.relative(ROOT, file).replaceAll('\\', '/'));
  }
  return { count, references };
}

function readSupabaseQuery(sql) {
  const tempFile = path.join(APP_DIR, '.temp_query.sql');
  fs.writeFileSync(tempFile, sql, 'utf8');
  try {
    const output = execFileSync('npx.cmd', ['supabase', 'db', 'query', '--linked', '-o', 'json', '-f', tempFile], {
      cwd: APP_DIR,
      encoding: 'utf8',
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (!output) return [];
    const parsed = JSON.parse(output);
    if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.rows)) {
      return parsed.rows;
    }
    return Array.isArray(parsed) ? parsed : [];
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

if (!fs.existsSync(ZMODEL_PATH)) {
  console.error(`schema.zmodel not found at: ${ZMODEL_PATH}`);
  process.exit(1);
}

if (!options.noWrite) ensureDir(options.outDir);

const parsed = await parseZModelAst(ZMODEL_PATH);
if (!parsed.success) {
  console.error('Failed to parse ZModel AST:');
  for (const err of parsed.errors) console.error(`- ${err}`);
  process.exit(1);
}

const ignoreManifest = loadStructuredIgnoreManifest(IGNORE_MANIFEST_PATH);
const ignorePatterns = ignoreManifest.entries;
if (ignoreManifest.warnings && ignoreManifest.warnings.length > 0) {
  console.warn('Ignore Manifest Warnings:');
  for (const warn of ignoreManifest.warnings) {
    console.warn(`  - ${warn}`);
  }
}

let dbColumns;
let dbPoliciesRows;
let dbTablesRows;

try {
  dbColumns = readSupabaseQuery(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);
  dbPoliciesRows = readSupabaseQuery(`
    SELECT tablename, policyname, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `);
  dbTablesRows = readSupabaseQuery(`
    SELECT c.relname AS tablename, c.relkind, c.relrowsecurity AS rowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
    ORDER BY c.relname;
  `);
} catch (error) {
  console.error('Failed to query Supabase.');
  console.error(String(error.message || error));
  process.exit(1);
}

const dbSchema = {};
for (const row of dbColumns) {
  if (!dbSchema[row.table_name]) dbSchema[row.table_name] = {};
  dbSchema[row.table_name][row.column_name] = {
    type: row.data_type,
    isNullable: row.is_nullable === 'YES',
  };
}

const dbPolicies = {};
for (const row of dbPoliciesRows) {
  if (!dbPolicies[row.tablename]) dbPolicies[row.tablename] = [];
  dbPolicies[row.tablename].push(row);
}

const summary = classifyDrift(parsed.models, dbSchema, dbTablesRows, dbPolicies, ignorePatterns);
const today = new Date().toISOString().split('T')[0];
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const snapshotPath = path.join(options.outDir, `${timestamp}-database-snapshot.json`);
const summaryPath = path.join(options.outDir, `${timestamp}-database-drift-summary.json`);
const reportPath = path.join(options.outDir, `${today}-database-drift-scorecard.md`);
const inventoryPath = path.join(options.outDir, 'database-inventory.json');
const inventoryReportPath = path.join(options.outDir, 'database-inventory.md');

const relationKindLabels = {
  r: 'table',
  p: 'partitioned-table',
  v: 'view',
  m: 'materialized-view',
  f: 'foreign-table',
};

const codeFiles = [
  ...collectTextFiles(path.join(ROOT, 'apps')),
  ...collectTextFiles(path.join(ROOT, 'packages')),
].filter((file) => {
  const extension = path.extname(file).toLowerCase();
  const normalized = file.replaceAll('\\', '/');
  return ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'].includes(extension)
    && !normalized.includes('/supabase/migrations/')
    && !normalized.includes('/i18n/locales/')
    && !path.basename(file).startsWith('package.')
    && !path.basename(file).includes('.config.');
});
const migrationFiles = collectTextFiles(path.join(APP_DIR, 'supabase', 'migrations'));

const inventory = Object.keys(dbSchema)
  .sort()
  .map((tableName) => {
    const relation = dbTablesRows.find((row) => row.tablename === tableName);
    const modeled = Boolean(parsed.models[tableName]);
    const ignored = summary.ignoredTables.includes(tableName);
    const relationKind = relationKindLabels[relation?.relkind] ?? 'unknown';
    let classification = 'needs-review';
    if (modeled) classification = 'modeled';
    else if (ignored) classification = 'platform-managed';
    else if (relationKind === 'view' || relationKind === 'materialized-view') classification = 'derived-view';
    else if (relationKind === 'foreign-table') classification = 'foreign-table';

    return {
      object: tableName,
      relationKind,
      modeled,
      classification,
      reviewState: modeled || ignored ? 'accepted' : 'needs-review',
      owner: modeled ? 'Gurudevi schema' : null,
      reason: modeled ? 'Described by packages/schema/schema.zmodel' : null,
      policyCount: (dbPolicies[tableName] || []).length,
      rlsEnabled: Boolean(relation?.rowsecurity),
      columns: Object.keys(dbSchema[tableName]),
      codeUsage: collectUsage(tableName, codeFiles),
      migrationUsage: collectUsage(tableName, migrationFiles),
    };
  });

const inventoryCounts = inventory.reduce((counts, item) => {
  counts[item.classification] = (counts[item.classification] || 0) + 1;
  return counts;
}, {});

const snapshot = {
  generatedAt: new Date().toISOString(),
  sourceOfTruth: {
    zmodel: 'packages/schema/schema.zmodel',
    db: 'linked Supabase database via CLI',
    ignoreFile: '.driftignore.ast.json',
  },
  counts: {
    zmodelTables: Object.keys(parsed.models).length,
    dbTables: Object.keys(dbSchema).length,
    ignoredTables: summary.ignoredTables.length,
    totalChecks: summary.totalChecks,
    passedChecks: summary.passedChecks,
    score: summary.score,
  },
  tables: Object.keys(dbSchema).map((tableName) => ({
    table: tableName,
    ignored: summary.ignoredTables.includes(tableName),
    modeled: Boolean(parsed.models[tableName]),
    policyCount: (dbPolicies[tableName] || []).length,
    rlsEnabled: Boolean(dbTablesRows.find((row) => row.tablename === tableName)?.rowsecurity),
    relationKind: dbTablesRows.find((row) => row.tablename === tableName)?.relkind ?? null,
  })),
  ignoreWarnings: ignoreManifest.warnings,
};

if (!options.noWrite) {
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  fs.writeFileSync(summaryPath, JSON.stringify({ ...summary, ignoreWarnings: ignoreManifest.warnings }, null, 2) + '\n', 'utf8');
  fs.writeFileSync(
    inventoryPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      source: 'linked Supabase database via CLI',
      model: 'packages/schema/schema.zmodel',
      reviewRule: 'Every unmodeled non-system object remains needs-review until explicitly classified.',
      counts: inventoryCounts,
      objects: inventory,
    }, null, 2) + '\n',
    'utf8',
  );
  const inventoryRows = inventory
    .filter((item) => item.reviewState === 'needs-review')
    .map((item) => `| ${item.object} | ${item.relationKind} | ${item.classification} | ${item.codeUsage.count} | ${item.migrationUsage.count} | ${item.policyCount} | ${item.rlsEnabled ? 'yes' : 'no'} | pending |`)
    .join('\n');
  fs.writeFileSync(
    inventoryReportPath,
    `# Database Object Inventory\n\nGenerated: ${new Date().toISOString()}\n\n` +
      `This is a review queue, not an ignore list. Unmodeled objects remain pending until an owner and reason are recorded.\n\n` +
      `## Counts\n\n${Object.entries(inventoryCounts).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\n` +
      `## Pending objects\n\n| Object | Kind | Classification | Code refs | Migration refs | Policies | RLS | Owner/reason |\n| --- | --- | --- | ---: | ---: | ---: | --- | --- |\n${inventoryRows || '| None | — | — | — | — | — | — | — |'}\n`,
    'utf8',
  );
  fs.writeFileSync(
    reportPath,
    renderDriftReport({
      today,
      score: summary.score,
      counts: snapshot.counts,
      stats: summary.stats,
      structuralDrifts: summary.structuralDrifts,
      policyDrifts: summary.policyDrifts,
      snapshotPath,
      summaryPath,
      ignoreManifestPath: IGNORE_MANIFEST_PATH,
      ignoreWarnings: ignoreManifest.warnings,
    }),
    'utf8',
  );
}

console.log('======================================================================');
console.log('AST Drift Auditor');
console.log('======================================================================');
console.log(`Score: ${summary.score}/100`);
console.log(`Snapshot: ${snapshotPath}`);
console.log(`Summary: ${summaryPath}`);
console.log(`Report: ${reportPath}`);
console.log(`Inventory: ${inventoryPath}`);
console.log(`Inventory review queue: ${inventoryReportPath}`);

if (options.failOnDrift && (summary.structuralDrifts.length > 0 || summary.policyDrifts.length > 0)) {
  process.exitCode = 1;
}
