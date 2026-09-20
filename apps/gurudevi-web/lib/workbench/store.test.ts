import type { WorkbenchTaskInput } from '@repo/core/types';
import { describe, expect, it } from 'vitest';
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

describe('DomainWorkbenchStore', () => {
  it('browser storage restores the shared workbench snapshot into a new adapter', () => {
    const storage = createMemoryWorkbenchStorage();
    const first = new DomainWorkbenchStore('self', { storage });
    first.open(task('fire-journal'), '2026-09-15T10:00:00.000Z');

    const second = new DomainWorkbenchStore('self', { storage });
    const restored = second.rehydrate();

    expect(restored?.unavailableTaskKeys.length).toBe(0);
    expect(second.getSnapshot().tasks.length).toBe(1);
    expect(second.getSnapshot().focusedTaskKey).toBe('self:fire-journal');
  });

  it('closing a background task retains focus chosen by the shared policy', () => {
    const store = new DomainWorkbenchStore('self', { storage: createMemoryWorkbenchStorage() });
    store.open(task('fire-journal'), '2026-09-15T10:00:00.000Z');
    store.open(task('daily-pulse'), '2026-09-15T10:05:00.000Z');
    store.focus('self:fire-journal', '2026-09-15T10:10:00.000Z');

    const result = store.close('self:daily-pulse');

    expect(result.kind).toBe('focused-task');
    expect(store.getSnapshot().focusedTaskKey).toBe('self:fire-journal');
    expect(store.getSnapshot().tasks.length).toBe(1);
  });
});
