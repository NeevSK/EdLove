#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDir = path.join(root, 'apps', 'gurudevi-mobile');
const migrationsDir = path.join(appDir, 'supabase', 'migrations');

const localIds = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql') && !name.includes(`${path.sep}archive${path.sep}`))
  .map((name) => name.match(/^(\d{14})_/)?.[1])
  .filter(Boolean);

const duplicates = localIds.filter((id, index) => localIds.indexOf(id) !== index);
const output = execFileSync(
  'npx.cmd',
  ['supabase', 'migration', 'list', '--linked', '--output-format', 'json'],
  { cwd: appDir, encoding: 'utf8', shell: process.platform === 'win32' },
).trim();
const parsed = JSON.parse(output);
const remoteRows = parsed.migrations ?? [];
const unapplied = remoteRows.filter((row) => row.local && row.remote !== row.local);
const missingRemote = remoteRows.filter((row) => row.local && !row.remote);
const remoteOnly = remoteRows.filter((row) => row.remote && !row.local);

console.log(`Migration state: ${localIds.length} local migration files, ${remoteRows.length} linked records.`);
if (duplicates.length) console.error(`Duplicate local migration IDs: ${[...new Set(duplicates)].join(', ')}`);
if (unapplied.length) console.error(`Mismatched migration records: ${unapplied.map((row) => row.local).join(', ')}`);
if (missingRemote.length) console.error(`Local migrations not applied remotely: ${missingRemote.map((row) => row.local).join(', ')}`);
if (remoteOnly.length) console.error(`Remote migrations absent locally: ${remoteOnly.map((row) => row.remote).join(', ')}`);

if (duplicates.length || unapplied.length || missingRemote.length || remoteOnly.length) {
  process.exitCode = 1;
} else {
  console.log('PASS: local and linked migration histories are aligned.');
}
