import {
  academicCycleMachine,
  createAcademicCycleActor,
  executeCycleRolloverEffect,
  resolveCycleStorageKey,
  restoreCycleSnapshot,
  saveCycleSnapshot,
} from '@repo/admin/machines/academicCycleMachine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

vi.mock('@repo/core/lib/storage.adapter', () => {
  const store = new Map<string, string>();
  return {
    buildPartitionedKey: vi.fn(
      ({ tenantId, userId, entityId, feature }) =>
        `sanctuary:${tenantId || 'global'}:${userId || 'anon'}:${entityId || 'root'}:${feature}`,
    ),
    storage: {
      getStringAsync: vi.fn(async (key: string) => store.get(key) ?? null),
      setAsync: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      deleteAsync: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: () => store.clear(),
    },
  };
});

describe('AcademicCycleMachine v6 (XState v6 + Effect-TS v4)', () => {
  it('starts in planning with clean context', () => {
    const actor = createAcademicCycleActor({ schoolId: 'school-789' });
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe('planning');
    expect(snapshot.context.schoolId).toBe('school-789');
    expect(snapshot.context.status).toBe('planning');
    expect(snapshot.context.lockedGradesCount).toBe(0);
  });

  it('configures cycle metadata and activates term', () => {
    const actor = createAcademicCycleActor({ schoolId: 'school-789' });
    actor.send({
      type: 'CONFIGURE_CYCLE',
      name: 'Semester 1 2026/2027',
      startDate: '2026-09-01',
      endDate: '2027-01-31',
    });

    expect(actor.getSnapshot().context.name).toBe('Semester 1 2026/2027');
    expect(actor.getSnapshot().context.startDate).toBe('2026-09-01');

    actor.send({ type: 'ACTIVATE_TERM', cycleId: 'cycle-sem1-2026' });
    expect(actor.getSnapshot().value).toBe('active_term');
    expect(actor.getSnapshot().context.cycleId).toBe('cycle-sem1-2026');
  });

  it('advances through review_and_lock and locks grades', () => {
    const actor = createAcademicCycleActor({
      schoolId: 'school-789',
      cycleId: 'cycle-sem1-2026',
    });
    actor.send({ type: 'ACTIVATE_TERM', cycleId: 'cycle-sem1-2026' });
    actor.send({ type: 'INITIATE_LOCK' });

    expect(actor.getSnapshot().value).toBe('review_and_lock');

    actor.send({ type: 'CONFIRM_LOCK_GRADES', lockedCount: 342 });
    expect(actor.getSnapshot().value).toBe('rollover_staging');
    expect(actor.getSnapshot().context.lockedGradesCount).toBe(342);
  });

  it('completes rollover to archived state', () => {
    const actor = createAcademicCycleActor({
      schoolId: 'school-789',
      cycleId: 'cycle-sem1-2026',
    });
    actor.send({ type: 'ACTIVATE_TERM', cycleId: 'cycle-sem1-2026' });
    actor.send({ type: 'INITIATE_LOCK' });
    actor.send({ type: 'CONFIRM_LOCK_GRADES', lockedCount: 342 });

    expect(actor.getSnapshot().value).toBe('rollover_staging');

    actor.send({
      type: 'EXECUTE_ROLLOVER_SUCCESS',
      migratedCount: 340,
      newCycleId: 'cycle-sem2-2027',
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('archived');
    expect(snapshot.status).toBe('done');
    expect(snapshot.context.migratedStudentsCount).toBe(340);
  });

  it('guards against ghost dispatches in executeCycleRolloverEffect', async () => {
    const actor = createAcademicCycleActor({ schoolId: 'school-789' });
    (actor as any).stop?.();

    const mockDeps = {
      lockTermGrades: vi.fn(),
      stageStudentPromotions: vi.fn(),
    };

    const result = await executeCycleRolloverEffect({
      schoolId: 'school-789',
      cycleId: 'cycle-sem1-2026',
      nextCycleId: 'cycle-sem2-2027',
      deps: mockDeps,
      actor,
    });

    expect(mockDeps.lockTermGrades).not.toHaveBeenCalled();
    expect(result._tag).toBe('Success');
  });

  it('saves and restores cycle state using partitioned key standard', async () => {
    const key = resolveCycleStorageKey({
      schoolId: 'school-789',
      cycleId: 'cycle-sem1-2026',
    });

    expect(key).toBe('sanctuary:school-789:anon:cycle-sem1-2026:academic_cycle_state');

    const state = {
      name: 'Semester 1 2026/2027',
      status: 'review_and_lock' as const,
      lockedGradesCount: 150,
    };

    await saveCycleSnapshot(key, state);
    const restored = await restoreCycleSnapshot(key);
    expect(restored).toEqual(state);
  });
});
