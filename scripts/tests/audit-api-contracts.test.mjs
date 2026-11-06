import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const api = path.join(root, 'apps/sanctuary-api');
const cli = path.join(api, 'node_modules/tsx/dist/cli.mjs');
const script = path.join(root, 'scripts/audit-api-contracts.ts');
const defaultReport = path.join(root, 'docs/architecture/api-contract-inventory.json');

function run(args) {
  const result = spawnSync(
    process.execPath,
    [cli, '--tsconfig', path.join(root, 'tsconfig.json'), script, ...args],
    { cwd: api, encoding: 'utf8', timeout: 30000 },
  );
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return result;
}

test('read-only inventory JSON is deterministic and leaves the default report untouched', () => {
  const before = existsSync(defaultReport) ? readFileSync(defaultReport) : null;
  const first = run(['--stdout']);
  const second = run(['--stdout']);
  const report = JSON.parse(first.stdout);
  assert.equal(first.stdout, second.stdout);
  assert.equal(report.schemaVersion, 2);
  assert.equal(report.scope, 'declared-contract-sources');
  assert.ok(report.limitations.length > 0);
  for (const source of ['onboarding', 'privacy', 'dailyContent']) {
    const routes = report.routes.filter((route) => route.source === source);
    assert.ok(routes.length > 0, `missing native source ${source}`);
    assert.ok(routes.every((route) => route.representation === 'native-orpc'));
    assert.ok(routes.every((route) => route.runtimeStatus === 'unverified'));
    assert.ok(routes.every((route) => route.authorizationStatus === 'unverified'));
    assert.ok(routes.every((route) => route.persistenceStatus === 'unverified'));
  }
  assert.equal(
    first.status,
    report.findings.some((finding) => finding.severity === 'error') ? 1 : 0,
  );
  assert.equal(second.status, first.status);
  assert.deepEqual(existsSync(defaultReport) ? readFileSync(defaultReport) : null, before);
});

test('explicit output is reproducible and a modified report is preserved', () => {
  const directory = mkdtempSync(path.join(root, 'reports/api-inventory-fixture-'));
  const output = path.join(directory, 'inventory.json');
  try {
    const first = run(['--output', output]);
    const original = readFileSync(output, 'utf8');
    assert.equal(run(['--output', output]).status, first.status);
    assert.equal(readFileSync(output, 'utf8'), original);
    const edited = `${original}\nUser-owned report note\n`;
    writeFileSync(output, edited);
    const rejected = run(['--output', output]);
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /Refusing to overwrite a modified or untracked report/);
    assert.equal(readFileSync(output, 'utf8'), edited);
    const ignoredDirectory = path.join(directory, 'node_modules');
    mkdirSync(ignoredDirectory);
    const ignoredOutput = path.join(ignoredDirectory, 'ignored-inventory.json');
    writeFileSync(ignoredOutput, 'User-owned ignored report');
    assert.equal(
      spawnSync('git', ['check-ignore', '--quiet', ignoredOutput], { cwd: root }).status,
      0,
    );
    const ignored = run(['--output', ignoredOutput]);
    assert.equal(ignored.status, 1);
    assert.match(ignored.stderr, /Refusing to overwrite a modified or untracked report/);
    assert.equal(readFileSync(ignoredOutput, 'utf8'), 'User-owned ignored report');
  } finally {
    const resolved = path.resolve(directory);
    assert.ok(resolved.startsWith(`${path.resolve(root, 'reports')}${path.sep}`));
    rmSync(resolved, { recursive: true });
  }
});

test('invalid CLI options fail without writing a report', () => {
  assert.equal(run(['--stdout', '--output', 'unused-inventory.json']).status, 1);
  assert.equal(run(['--stdout', '--output=']).status, 1);
  assert.match(run(['--output=']).stderr, /nonempty file path/);
  const unknown = run(['--not-an-option']);
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /Unknown option/);
});
