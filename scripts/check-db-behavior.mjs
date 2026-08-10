#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDir = path.join(root, 'apps', 'gurudevi-mobile');
const tempFile = path.join(appDir, '.temp_db_behavior_query.sql');

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

const functionNames = [
  'claim_invite_code',
  'approve_school_join_request',
  'approve_school_registry_claim',
  'create_school_invite_code',
];

const functions = query(`
  SELECT p.proname AS function_name,
         p.prosecdef AS security_definer,
         pg_get_functiondef(p.oid) AS definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN (${functionNames.map((name) => `'${name}'`).join(', ')})
`);

const policies = query(`
  SELECT tablename AS table_name, policyname, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('schools', 'school_memberships', 'school_registry_claims', 'invite_codes')
`);

let failures = 0;
function requireCheck(condition, message) {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    failures += 1;
    console.error(`FAIL ${message}`);
  }
}

for (const name of functionNames) {
  const matches = functions.filter((row) => row.function_name === name);
  requireCheck(matches.length > 0, `${name} exists`);
  for (const fn of matches) {
    const definition = String(fn.definition ?? '').toLowerCase();
    requireCheck(fn.security_definer === true || fn.security_definer === 'true', `${name} is SECURITY DEFINER`);
    requireCheck(definition.includes('search_path') && definition.includes('public') && definition.includes('pg_temp'), `${name} pins a safe search_path`);
    requireCheck(definition.includes('auth.uid()'), `${name} binds the authenticated caller`);
  }
}

const createInvite = functions.find((row) => row.function_name === 'create_school_invite_code');
const createInviteDefinition = String(createInvite?.definition ?? '').toLowerCase();
requireCheck(createInviteDefinition.includes('idempotency_key'), 'invite creation is idempotency-aware');
requireCheck(createInviteDefinition.includes('has_capacity_in_school'), 'invite creation checks school capacity');

const approvalChecks = [
  ['approve_school_join_request', ['school_memberships', 'user_entitlement_grants', 'bonds']],
  ['approve_school_registry_claim', ['schools', 'school_registry_claims']],
  ['claim_invite_code', ['bonds', 'user_entitlement_grants', 'invite_codes']],
];
for (const [name, requiredTables] of approvalChecks) {
  const definition = String(functions.find((row) => row.function_name === name)?.definition ?? '').toLowerCase();
  for (const table of requiredTables) {
    requireCheck(definition.includes(table), `${name} contains the ${table} authority step`);
  }
}

const policyByTable = new Map();
for (const policy of policies) {
  const list = policyByTable.get(policy.table_name) ?? [];
  list.push(policy);
  policyByTable.set(policy.table_name, list);
}
for (const table of ['schools', 'school_memberships', 'school_registry_claims', 'invite_codes']) {
  requireCheck((policyByTable.get(table) ?? []).length > 0, `${table} has live RLS policies`);
}

const invitePolicies = policyByTable.get('invite_codes') ?? [];
requireCheck(
  invitePolicies.some((policy) => `${policy.qual ?? ''}${policy.with_check ?? ''}`.toLowerCase().includes('is_active')),
  'invite-code visibility is constrained by active status',
);

if (failures) {
  console.error(`DB behavior audit failed with ${failures} finding(s).`);
  process.exitCode = 1;
} else {
  console.log('DB behavior audit passed.');
}
