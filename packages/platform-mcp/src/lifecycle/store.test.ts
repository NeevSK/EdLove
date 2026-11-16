import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { transaction } from '../coordinationStore.js';
import {
  finishLifecycleOperation,
  readLifecycle,
  readLifecycleHistory,
  readLifecycleOperation,
  withLifecycleStore,
  writeLifecycle,
  writeLifecycleOperation,
} from './store.js';

const temporaryDirectories: string[] = [];

function databasePath(): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'lifecycle-store-'));
  temporaryDirectories.push(directory);
  return path.join(directory, 'coordination.sqlite');
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('lifecycle SQLite persistence', () => {
  it('creates and compares lifecycle revisions across store reopen', () => {
    const path = databasePath();
    withLifecycleStore(path, (db) => {
      writeLifecycle(db, {
        id: 'feature-one',
        revision: 0,
        expectedRevision: null,
        state: { featureId: 'ai.assistant', sourceVersions: ['a1'] },
      });
    });

    expect(withLifecycleStore(path, (db) => readLifecycle(db, 'feature-one'))).toEqual({
      featureId: 'ai.assistant',
      sourceVersions: ['a1'],
    });

    withLifecycleStore(path, (db) => {
      writeLifecycle(db, {
        id: 'feature-one',
        revision: 1,
        expectedRevision: 0,
        state: { featureId: 'ai.assistant', sourceVersions: ['a2'] },
      });
    });
    expect(withLifecycleStore(path, (db) => readLifecycle(db, 'feature-one'))).toEqual({
      featureId: 'ai.assistant',
      sourceVersions: ['a2'],
    });
  });

  it('rejects create conflicts and stale compare-and-swap revisions without overwriting state', () => {
    const path = databasePath();
    withLifecycleStore(path, (db) => {
      writeLifecycle(db, {
        id: 'feature-one',
        revision: 0,
        expectedRevision: null,
        state: { value: 'first' },
      });
      writeLifecycle(db, {
        id: 'feature-one',
        revision: 1,
        expectedRevision: 0,
        state: { value: 'updated' },
      });
      expect(() =>
        writeLifecycle(db, {
          id: 'feature-one',
          revision: 0,
          expectedRevision: null,
          state: { value: 'overwrite' },
        }),
      ).toThrow('revision_conflict');
      expect(() =>
        writeLifecycle(db, {
          id: 'feature-one',
          revision: 1,
          expectedRevision: 0,
          state: { value: 'stale' },
        }),
      ).toThrow('revision_conflict');
      expect(readLifecycle(db, 'feature-one')).toEqual({ value: 'updated' });
    });
  });

  it('records unique operations and returns parsed, ordered history', () => {
    const path = databasePath();
    withLifecycleStore(path, (db) => {
      writeLifecycle(db, {
        id: 'feature-one',
        revision: 0,
        expectedRevision: null,
        state: { sourceVersions: ['s1'] },
      });
      writeLifecycleOperation(db, {
        id: 'feature-one',
        operationId: 'create',
        payload: JSON.stringify({ action: 'create', sourceVersions: ['s1'] }),
        result: { status: 'finished', readiness: 'blocked' },
        revision: 0,
        createdAt: '2026-11-11T00:00:00.000Z',
      });
      expect(readLifecycleOperation(db, 'feature-one', 'create')).toEqual({
        payload: JSON.stringify({ action: 'create', sourceVersions: ['s1'] }),
        result: { status: 'finished', readiness: 'blocked' },
      });
      expect(() =>
        writeLifecycleOperation(db, {
          id: 'feature-one',
          operationId: 'create',
          payload: '{}',
          result: { status: 'finished' },
          revision: 0,
          createdAt: '2026-11-11T00:00:01.000Z',
        }),
      ).toThrow('operation_conflict');
      expect(readLifecycleHistory(db, 'feature-one')).toEqual([
        {
          operationId: 'create',
          payload: { action: 'create', sourceVersions: ['s1'] },
          result: { status: 'finished', readiness: 'blocked' },
          revision: 0,
          createdAt: '2026-11-11T00:00:00.000Z',
        },
      ]);
    });
  });

  it('caps operation history at the most recent 1000 records in revision order', () => {
    const path = databasePath();
    withLifecycleStore(path, (db) =>
      transaction(db, () => {
        writeLifecycle(db, {
          id: 'feature-one',
          revision: 0,
          expectedRevision: null,
          state: { revision: 0 },
        });
        for (let revision = 0; revision <= 1004; revision += 1) {
          if (revision > 0) {
            writeLifecycle(db, {
              id: 'feature-one',
              revision,
              expectedRevision: revision - 1,
              state: { revision },
            });
          }
          writeLifecycleOperation(db, {
            id: 'feature-one',
            operationId: `operation-${revision}`,
            payload: JSON.stringify({ revision }),
            result: { status: 'finished' },
            revision,
            createdAt: `2026-11-11T00:00:${String(revision % 60).padStart(2, '0')}.000Z`,
          });
        }
        const history = readLifecycleHistory(db, 'feature-one');
        expect(history).toHaveLength(1000);
        expect(history[0]?.revision).toBe(5);
        expect(history.at(-1)?.revision).toBe(1004);
      }),
    );
  });

  it('finishes an existing operation state and rejects a missing operation', () => {
    const path = databasePath();
    withLifecycleStore(path, (db) => {
      writeLifecycle(db, {
        id: 'feature-one',
        revision: 0,
        expectedRevision: null,
        state: { value: 'queued' },
      });
      expect(() =>
        finishLifecycleOperation(db, 'feature-one', 'missing', { value: 'done' }),
      ).toThrow('lifecycle_operation_not_found');
      writeLifecycleOperation(db, {
        id: 'feature-one',
        operationId: 'check-one',
        payload: JSON.stringify({ checkId: 'c4-validate' }),
        result: { revision: 0, toolRuns: [{ checkId: 'c4-validate', status: 'pending' }] },
        revision: 0,
        createdAt: '2026-11-11T00:00:00.000Z',
      });
      const completedState = {
        revision: 0,
        toolRuns: [{ checkId: 'c4-validate', status: 'finished', ok: true }],
      };
      finishLifecycleOperation(db, 'feature-one', 'check-one', completedState);
      expect(readLifecycleOperation(db, 'feature-one', 'check-one')?.result).toEqual(
        completedState,
      );
    });
  });

  it('rolls back lifecycle state and operation together in the caller transaction', () => {
    const path = databasePath();
    withLifecycleStore(path, (db) => {
      expect(() =>
        transaction(db, () => {
          writeLifecycle(db, {
            id: 'feature-one',
            revision: 0,
            expectedRevision: null,
            state: { value: 'uncommitted' },
          });
          writeLifecycleOperation(db, {
            id: 'feature-one',
            operationId: 'create',
            payload: JSON.stringify({ action: 'create' }),
            result: { status: 'finished' },
            revision: 0,
            createdAt: '2026-11-11T00:00:00.000Z',
          });
          throw new Error('rollback');
        }),
      ).toThrow('rollback');
      expect(() => readLifecycle(db, 'feature-one')).toThrow('lifecycle_not_found');
      expect(readLifecycleOperation(db, 'feature-one', 'create')).toBeNull();
      expect(readLifecycleHistory(db, 'feature-one')).toEqual([]);
    });
  });

  it('rejects operations for missing lifecycle records or stale revisions', () => {
    const path = databasePath();
    withLifecycleStore(path, (db) => {
      const input = {
        id: 'feature-one',
        operationId: 'action',
        payload: '{}',
        result: { status: 'finished' },
        revision: 0,
        createdAt: '2026-11-11T00:00:00.000Z',
      };
      expect(() => writeLifecycleOperation(db, input)).toThrow('lifecycle_not_found');
      writeLifecycle(db, { id: 'feature-one', revision: 0, expectedRevision: null, state: {} });
      writeLifecycle(db, { id: 'feature-one', revision: 1, expectedRevision: 0, state: {} });
      expect(() => writeLifecycleOperation(db, input)).toThrow('revision_conflict');
    });
  });
});
