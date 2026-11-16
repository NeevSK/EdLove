import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createState, loadSources, project, record, stages } from './controller.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-'));
  fs.writeFileSync(path.join(directory, 'a.txt'), 'stable authority');
  fs.writeFileSync(path.join(directory, 'b.txt'), 'earlier authority');
  const packetFile = path.join(directory, 'work.json');
  fs.writeFileSync(packetFile, JSON.stringify({ workId: 'local-work', sources: [{ id: 'a', file: 'a.txt' }, { id: 'b', file: 'b.txt' }] }));
  return { directory, packetFile, sources: loadSources(packetFile), state: createState(packetFile) };
}
function action(stage, sources, options = {}) {
  return { id: `action-${stage}`, kind: 'record', stage, summary: `Reviewed ${stage}`, evidence: sources.map((source) => ({ sourceId: source.id, sha256: source.sha256 })), unresolved: [], ...options };
}
function completed(fixture) {
  let state = fixture.state;
  for (const stage of stages) state = record(state, action(stage, fixture.sources), fixture.sources).state;
  return state;
}

test('missing prerequisite blocks reconciliation and does not mutate state', () => {
  const f = setup();
  assert.throws(() => record(f.state, action('reconciliation', f.sources), f.sources), /missing_prerequisite/);
  assert.equal(f.state.events.length, 0);
});
test('unknown fields and discriminants cannot bypass action validation', () => {
  const f = setup();
  for (const patch of [{ completed: true }, { kind: 'approve' }, { stage: 'complete' }, { id: '' }, { unresolved: [5] }]) assert.throws(() => record(f.state, action('context', f.sources, patch), f.sources));
});
test('missing, duplicate and fabricated evidence are rejected', () => {
  const f = setup();
  assert.throws(() => record(f.state, action('context', f.sources, { evidence: [] }), f.sources), /incomplete_evidence/);
  assert.throws(() => record(f.state, action('context', f.sources, { evidence: [{ sourceId: 'missing', sha256: '0'.repeat(64) }] }), f.sources), /stale_or_unknown_evidence/);
  const duplicate = action('context', f.sources);
  duplicate.evidence.push(duplicate.evidence[0]);
  assert.throws(() => record(f.state, duplicate, f.sources), /duplicate_evidence/);
});
test('identical repeated action is idempotent including reordered object keys', () => {
  const f = setup();
  const first = action('context', f.sources);
  const state = record(f.state, first, f.sources).state;
  const reordered = Object.fromEntries(Object.entries(first).reverse());
  const replay = record(state, reordered, f.sources);
  assert.equal(replay.duplicate, true);
  assert.equal(replay.state.events.length, 1);
  assert.throws(() => record(state, { ...first, summary: 'different payload' }, f.sources), /action_id_conflict/);
});
test('same action ID cannot conceal changed nested evidence', () => {
  const f = setup();
  const first = action('context', f.sources);
  const state = record(f.state, first, f.sources).state;
  assert.throws(() => record(state, { ...first, evidence: [{ sourceId: 'a', sha256: '0'.repeat(64) }] }, f.sources), /action_id_conflict/);
});
test('all completed stages become stale after a dependency hash changes', () => {
  const f = setup();
  const state = completed(f);
  fs.writeFileSync(path.join(f.directory, 'a.txt'), 'new authority');
  const changed = loadSources(f.packetFile);
  const status = project(state, changed);
  assert.deepEqual(status.completed, []);
  assert.deepEqual(status.invalidated, stages);
  assert.equal(status.canComplete, false);
  assert.throws(() => record(state, action('context', changed), changed), /action_id_conflict|stale_inputs_require_rebase/);
});
test('source membership additions and removals invalidate prior work', () => {
  const f = setup();
  const state = completed(f);
  for (const changed of [f.sources.slice(0, 1), [...f.sources, { id: 'c', sha256: '0'.repeat(64) }]]) {
    const status = project(state, changed);
    assert.equal(status.sourceSetChanged, true);
    assert.equal(status.canComplete, false);
    assert.deepEqual(status.invalidated, stages);
  }
});
test('a source change preserves the valid independent prefix', () => {
  const f = setup();
  let state = record(f.state, action('context', [f.sources[0]]), f.sources).state;
  state = record(state, action('analysis', [f.sources[1]]), f.sources).state;
  fs.writeFileSync(path.join(f.directory, 'b.txt'), 'new authority');
  const status = project(state, loadSources(f.packetFile));
  assert.deepEqual(status.completed, ['context']);
  assert.deepEqual(status.invalidated, ['analysis']);
  assert.equal(status.nextAction, 'analysis');
});
test('remaining material decisions prevent completed status', () => {
  const f = setup();
  let state = f.state;
  for (const stage of stages) state = record(state, action(stage, f.sources, { unresolved: ['Owner decision absent'] }), f.sources).state;
  const status = project(state, f.sources);
  assert.equal(status.nextAction, 'resolve_authority');
  assert.equal(status.canComplete, false);
});
test('forged stage order and unknown persisted state fields are rejected', () => {
  const f = setup();
  assert.throws(() => project({ ...f.state, completed: stages }, f.sources), /invalid_state/);
  assert.throws(() => project({ ...f.state, events: [action('verification', f.sources)] }, f.sources), /invalid_event_order/);
});

test('a later empty action cannot silently clear an earlier material decision', () => {
  const f = setup();
  let state = record(f.state, action('context', f.sources, { unresolved: ['Owner decision absent'] }), f.sources).state;
  for (const stage of stages.slice(1)) state = record(state, action(stage, f.sources), f.sources).state;
  assert.equal(project(state, f.sources).canComplete, false);
  assert.deepEqual(project(state, f.sources).unresolved, ['Owner decision absent']);
});
test('actual process restart recovers state and rebase archives stale history', () => {
  const f = setup();
  const stateFile = path.join(f.directory, 'state.json');
  const invoke = (...args) => {
    const result = spawnSync(process.execPath, [path.join(here, 'controller.mjs'), ...args], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  invoke('init', f.packetFile, stateFile);
  const first = action('context', [f.sources[0]]);
  const second = action('analysis', [f.sources[1]]);
  for (const item of [first, second]) {
    const actionFile = path.join(f.directory, `${item.id}.json`);
    fs.writeFileSync(actionFile, JSON.stringify(item));
    invoke('record', f.packetFile, stateFile, actionFile);
  }
  assert.deepEqual(invoke('status', f.packetFile, stateFile).completed, ['context', 'analysis']);
  fs.writeFileSync(path.join(f.directory, 'b.txt'), 'new authority');
  assert.deepEqual(invoke('status', f.packetFile, stateFile).invalidated, ['analysis']);
  const rebased = invoke('rebase', f.packetFile, stateFile);
  assert.deepEqual(rebased.completed, ['context']);
  assert.equal(rebased.nextAction, 'analysis');
  const archives = fs.readdirSync(f.directory).filter((name) => name.startsWith('state.json.previous-'));
  assert.equal(archives.length, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.directory, archives[0]), 'utf8')).events.length, 2);
});
test('local file ownership can rewrite coherent history and is outside guarantee', () => {
  const f = setup();
  const rewritten = { ...f.state, events: stages.map((stage) => action(stage, f.sources, { summary: 'Unsubstantiated local assertion' })) };
  assert.equal(project(rewritten, f.sources).canComplete, true);
});
