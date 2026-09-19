import assert from 'node:assert/strict';
import test from 'node:test';
import type { WorkbenchTaskInput } from '@repo/core/types';
import { createMemoryWorkbenchStorage } from './storage';
import { DomainWorkbenchStore } from './store';

function task(featureId: string): Omit<WorkbenchTaskInput, 'domain'> {
  return {
    featureId,
    route: `/self?feature=${featureId}`,
    title: featureId,
    temporalBinding: { kind: 'follow-domain' },
    localStatePolicy: 'none',
  };
}

test('browser storage restores the shared workbench snapshot into a new adapter', () => {
  const storage = createMemoryWorkbenchStorage();
  const first = new DomainWorkbenchStore('self', { storage });
  first.open(task('fire-journal'), '2026-09-15T10:00:00.000Z');

  const second = new DomainWorkbenchStore('self', { storage });
  const restored = second.rehydrate();

  assert.equal(restored?.unavailableTaskKeys.length, 0);
  assert.equal(second.getSnapshot().tasks.length, 1);
  assert.equal(second.getSnapshot().focusedTaskKey, 'self:fire-journal');
});

test('closing a background task retains focus chosen by the shared policy', () => {
  const store = new DomainWorkbenchStore('self', { storage: createMemoryWorkbenchStorage() });
  store.open(task('fire-journal'), '2026-09-15T10:00:00.000Z');
  store.open(task('daily-pulse'), '2026-09-15T10:05:00.000Z');
  store.focus('self:fire-journal', '2026-09-15T10:10:00.000Z');

  const result = store.close('self:daily-pulse');

  assert.equal(result.kind, 'focused-task');
  assert.equal(store.getSnapshot().focusedTaskKey, 'self:fire-journal');
  assert.equal(store.getSnapshot().tasks.length, 1);
});
