import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

function checkMigration(sql) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'supabase-grants-test-'));
  try {
    const scripts = path.join(root, 'scripts');
    const migrations = path.join(root, 'apps/gurudevi-mobile/supabase/migrations');
    fs.mkdirSync(scripts, { recursive: true });
    fs.mkdirSync(migrations, { recursive: true });
    const checker = path.join(scripts, 'check-supabase-migration-grants.mjs');
    fs.copyFileSync(new URL('../check-supabase-migration-grants.mjs', import.meta.url), checker);
    fs.writeFileSync(path.join(migrations, '20261025000000_fixture.sql'), sql);
    return spawnSync(process.execPath, [checker], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('G1 grant gate distinguishes private schema from public table names', () => {
  const result = checkMigration('CREATE TABLE IF NOT EXISTS private.account_clock (id int);');
  assert.equal(result.status, 0, result.stderr);
});

test('G1 grant gate still rejects public tables without a grant decision', () => {
  for (const name of ['public.account_clock', 'account_clock']) {
    const result = checkMigration(`CREATE TABLE ${name} (id int);`);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /public.account_clock has no explicit/);
  }
});

test('G1 grant gate accepts an explicit public-table revoke', () => {
  const result = checkMigration(
    'CREATE TABLE public.account_clock (id int); REVOKE ALL ON TABLE public.account_clock FROM anon, authenticated;',
  );
  assert.equal(result.status, 0, result.stderr);
});
