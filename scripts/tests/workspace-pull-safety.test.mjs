import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { assertCleanPullDestination, confirmWorkspacePull } from '../lib/workspace-pull-safety.mjs';

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'workspace-pull-safety-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', directory, ...args], { stdio: 'pipe' });
  git('init');
  writeFileSync(join(directory, 'tracked.txt'), 'baseline');
  git('add', 'tracked.txt');
  git('-c', 'user.name=Safety Test', '-c', 'user.email=safety@example.invalid', 'commit', '-m', 'fixture');
  return { directory, git };
}

test('accepts a clean real Git destination', (t) => {
  assert.doesNotThrow(() => assertCleanPullDestination(fixture(t).directory));
});

for (const state of ['modified', 'staged', 'untracked']) {
  test(`refuses a ${state} destination before preview or copying`, async (t) => {
    const { directory, git } = fixture(t);
    writeFileSync(join(directory, state === 'untracked' ? 'new.txt' : 'tracked.txt'), 'local work');
    if (state === 'staged') git('add', 'tracked.txt');
    let previewed = false;
    await assert.rejects(confirmWorkspacePull(directory, () => { previewed = true; }), /Pull refused/);
    assert.equal(previewed, false);
  });
}

test('fails closed if Git cannot inspect the destination', () => {
  assert.throws(() => assertCleanPullDestination(join(tmpdir(), 'nonexistent-pull-destination')));
});

test('preview failure prevents confirmation and copy', async (t) => {
  const { directory } = fixture(t);
  await assert.rejects(confirmWorkspacePull(directory, () => { throw new Error('preview failed'); }), /preview failed/);
});

test('noninteractive pull shows preview but cannot authorize copying', async (t) => {
  const { directory } = fixture(t);
  assert.equal(Boolean(process.stdin.isTTY && process.stdout.isTTY), false);
  let previewed = false;
  await assert.rejects(confirmWorkspacePull(directory, () => { previewed = true; }), /interactive terminal/);
  assert.equal(previewed, true);
});
