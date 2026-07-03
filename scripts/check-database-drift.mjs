#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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
const options = { outDir: DEFAULT_OUT_DIR, dryRun: false, noWrite: false };
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--dry-run') options.dryRun = true;
  else if (arg === '--no-write') options.noWrite = true;
  else if (arg === '--out-dir' && args[i + 1]) {
    options.outDir = path.resolve(ROOT, args[i + 1]);
    i += 1;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readSupabaseQuery(sql) {
  const tempFile = path.join(APP_DIR, '.temp_query.sql');
  fs.writeFileSync(tempFile, sql, 'utf8');
  try {
    const output = execSync('npx supabase db query --linked -o json -f .temp_query.sql', {
      cwd: APP_DIR,
      encoding: 'utf8',
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

ensureDir(options.outDir);

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
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
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
  })),
  ignoreWarnings: ignoreManifest.warnings,
};

if (!options.noWrite) {
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  fs.writeFileSync(summaryPath, JSON.stringify({ ...summary, ignoreWarnings: ignoreManifest.warnings }, null, 2) + '\n', 'utf8');
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
