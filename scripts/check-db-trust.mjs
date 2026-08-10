#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDir = path.join(root, 'apps', 'gurudevi-mobile');
const tempFile = path.join(appDir, '.temp_db_trust_query.sql');

function query(sql) {
  fs.writeFileSync(tempFile, sql, 'utf8');
  try {
    const output = execFileSync(
      'npx.cmd',
      ['supabase', 'db', 'query', '--linked', '-o', 'json', '-f', tempFile],
      { cwd: appDir, encoding: 'utf8', shell: process.platform === 'win32' },
    ).trim();
    if (!output) return [];
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) ? parsed : parsed?.rows ?? [];
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

const criticalTables = [
  'schools',
  'school_memberships',
  'school_registry_claims',
  'invite_codes',
  'user_entitlement_grants',
  'notifications',
  'user_push_tokens',
];

const requiredFunctions = [
  'approve_school_join_request',
  'approve_school_registry_claim',
  'create_school_invite_code',
  'claim_invite_code',
];

const requiredIndexes = [
  'school_memberships_user_school_role_status_key',
  'invite_codes_school_creator_idempotency_key',
  'user_push_tokens_user_device_key',
];

const rows = query(`
  SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname IN (${criticalTables.map((t) => `'${t}'`).join(', ')})
`);
const functions = query(`
  SELECT p.proname AS function_name
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname IN (${requiredFunctions.map((f) => `'${f}'`).join(', ')})
`);
const policyCounts = query(`
  SELECT tablename AS table_name, count(*)::int AS policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename IN (${criticalTables.map((t) => `'${t}'`).join(', ')})
  GROUP BY tablename
`);
const indexes = query(`
  SELECT indexname
  FROM pg_indexes
  WHERE schemaname = 'public' AND indexname IN (${requiredIndexes.map((name) => `'${name}'`).join(', ')})
`);

const rls = new Map(rows.map((row) => [row.table_name, row.rls_enabled === true || row.rls_enabled === 'true']));
const presentFunctions = new Set(functions.map((row) => row.function_name));
const missingTables = criticalTables.filter((table) => !rls.has(table));
const disabledRls = criticalTables.filter((table) => rls.has(table) && !rls.get(table));
const missingFunctions = requiredFunctions.filter((name) => !presentFunctions.has(name));
const policyCountByTable = new Map(policyCounts.map((row) => [row.table_name, Number(row.policy_count)]));
const policylessTables = criticalTables.filter((table) => !policyCountByTable.get(table));
const presentIndexes = new Set(indexes.map((row) => row.indexname));
const missingIndexes = requiredIndexes.filter((name) => !presentIndexes.has(name));

console.log(`DB trust audit: ${criticalTables.length} critical tables, ${requiredFunctions.length} authority functions`);
if (missingTables.length) console.error(`Missing critical tables: ${missingTables.join(', ')}`);
if (disabledRls.length) console.error(`RLS disabled: ${disabledRls.join(', ')}`);
if (missingFunctions.length) console.error(`Missing authority functions: ${missingFunctions.join(', ')}`);
if (policylessTables.length) console.error(`Critical tables without RLS policies: ${policylessTables.join(', ')}`);
if (missingIndexes.length) console.error(`Missing trust indexes: ${missingIndexes.join(', ')}`);

if (missingTables.length || disabledRls.length || missingFunctions.length || policylessTables.length || missingIndexes.length) {
  process.exitCode = 1;
} else {
  console.log('PASS: critical tables exist with RLS enabled and authority functions are present.');
}
