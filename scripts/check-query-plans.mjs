#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDir = path.join(root, 'apps', 'gurudevi-mobile');
const tempFile = path.join(appDir, '.temp_query_plan.sql');

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

const cases = [
  {
    name: 'canonical school discovery',
    sql: `EXPLAIN (FORMAT JSON)
      SELECT id, census_no, name
      FROM public.edu_schools
      WHERE name ILIKE '%school%'
      ORDER BY name
      LIMIT 20`,
  },
  {
    name: 'school membership lookup',
    sql: `EXPLAIN (FORMAT JSON)
      SELECT id, user_id, school_id, role, status
      FROM public.school_memberships
      WHERE user_id = '00000000-0000-0000-0000-000000000000'
        AND status = 'active'`,
  },
  {
    name: 'invite redemption lookup',
    sql: `EXPLAIN (FORMAT JSON)
      SELECT id, school_id, role, uses_count, max_uses
      FROM public.invite_codes
      WHERE code = 'GURU-000000-TEACH'
        AND is_active = true`,
  },
  {
    name: 'notification feed',
    sql: `EXPLAIN (FORMAT JSON)
      SELECT id, type, title, body, created_at
      FROM public.notifications
      WHERE user_id = '00000000-0000-0000-0000-000000000000'
      ORDER BY created_at DESC
      LIMIT 50`,
  },
  {
    name: 'registry claim queue',
    sql: `EXPLAIN (FORMAT JSON)
      SELECT id, school_id, edu_school_id, status, created_at
      FROM public.school_registry_claims
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT 50`,
  },
];

function unwrapPlan(rows) {
  const value = rows[0]?.['QUERY PLAN'] ?? rows[0]?.['query plan'] ?? rows[0]?.query_plan ?? rows[0];
  if (typeof value === 'string') return JSON.parse(value)[0]?.Plan;
  if (Array.isArray(value)) return value[0]?.Plan ?? value[0];
  return value?.Plan ?? value;
}

function summarize(plan) {
  if (!plan) return 'no plan';
  const relation = plan['Relation Name'] ? ` relation=${plan['Relation Name']}` : '';
  const index = plan['Index Name'] ? ` index=${plan['Index Name']}` : '';
  return `${plan['Node Type'] ?? 'unknown'}${relation}${index}`;
}

let failed = false;
for (const item of cases) {
  try {
    const plan = unwrapPlan(query(item.sql));
    if (!plan) {
      failed = true;
      console.error(`FAIL ${item.name}: no plan returned`);
      continue;
    }
    console.log(`PASS ${item.name}: ${summarize(plan)}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${item.name}: ${error.message}`);
  }
}

if (failed) process.exitCode = 1;
