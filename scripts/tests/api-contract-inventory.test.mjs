import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const args = [
  'node_modules/tsx/dist/cli.mjs',
  '--tsconfig',
  'tsconfig.json',
  'scripts/audit-api-contracts.ts',
];
const run = (...flags) => spawnSync(process.execPath, [...args, ...flags], { encoding: 'utf8' });

test('stable workspace CLI resolves owned dependencies and reports native declarations only', () => {
  const result = run('--stdout');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    schemaVersion: 3,
    scope: 'canonical-v1-native-contract',
    prefix: '/api/v1',
    procedures: ['identity.scopes', 'identity.session'],
    count: 2,
    limitations: [
      'Declaration inventory only; no runtime, authorization or persistence proof.',
      'An empty foundation is not application feature coverage.',
    ],
  });
});

test('inventory never overwrites a pre-existing report', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'pjc-api-inventory-'));
  const report = path.join(directory, 'report.json');
  try {
    writeFileSync(report, 'owner-report');
    const result = run('--output', report);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(report, 'utf8'), 'owner-report');
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('inventory rejects conflicting, empty and unknown options', () => {
  for (const flags of [['--stdout', '--output', 'unused'], ['--output', ''], ['--unknown']])
    assert.notEqual(run(...flags).status, 0);
});
