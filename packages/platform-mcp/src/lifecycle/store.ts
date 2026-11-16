import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { withStore } from '../coordinationStore.js';

const lifecycleRowSchema = z.strictObject({
  id: z.string(),
  revision: z.number().int().nonnegative(),
  state: z.string(),
});
const operationRowSchema = z.strictObject({
  operation_id: z.string(),
  payload: z.string(),
  result: z.string(),
  revision: z.number().int().nonnegative(),
  created_at: z.string(),
});
const maximumHistoryRows = 1000;

export type LifecycleHistoryRecord = {
  operationId: string;
  payload: unknown;
  result: unknown;
  revision: number;
  createdAt: string;
};

export type LifecycleOperation = {
  payload: string;
  result: unknown;
};

export function withLifecycleStore<T>(databasePath: string, operation: (db: DatabaseSync) => T): T {
  return withStore(databasePath, (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS lifecycle_records (
        id TEXT PRIMARY KEY,
        revision INTEGER NOT NULL CHECK (revision >= 0),
        state TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS lifecycle_operations (
        lifecycle_id TEXT NOT NULL,
        operation_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        result TEXT NOT NULL,
        revision INTEGER NOT NULL CHECK (revision >= 0),
        created_at TEXT NOT NULL,
        UNIQUE (lifecycle_id, operation_id)
      );
      CREATE INDEX IF NOT EXISTS lifecycle_operations_revision
        ON lifecycle_operations (lifecycle_id, revision);
    `);
    return operation(db);
  });
}

export function readLifecycle(db: DatabaseSync, id: string): unknown {
  const row = db.prepare('SELECT id, revision, state FROM lifecycle_records WHERE id = ?').get(id);
  if (!row) throw new Error('lifecycle_not_found');
  const parsedRow = lifecycleRowSchema.parse(row);
  const state: unknown = JSON.parse(parsedRow.state);
  return state;
}

export function readLifecycleIndex(db: DatabaseSync): { states: unknown[]; truncated: boolean } {
  const rows = db.prepare('SELECT state FROM lifecycle_records ORDER BY id LIMIT 1001').all();
  return {
    states: rows
      .slice(0, 1000)
      .map((row) => JSON.parse(z.object({ state: z.string() }).parse(row).state)),
    truncated: rows.length > 1000,
  };
}

export function readLifecycleOperation(
  db: DatabaseSync,
  id: string,
  operationId: string,
): LifecycleOperation | null {
  const row = db
    .prepare(
      'SELECT payload, result FROM lifecycle_operations WHERE lifecycle_id = ? AND operation_id = ?',
    )
    .get(id, operationId);
  if (!row) return null;
  const parsedRow = z.strictObject({ payload: z.string(), result: z.string() }).parse(row);
  const result: unknown = JSON.parse(parsedRow.result);
  return { payload: parsedRow.payload, result };
}

export function writeLifecycle(
  db: DatabaseSync,
  input: { id: string; state: unknown; revision: number; expectedRevision: number | null },
): void {
  const revision = z.number().int().min(0).safe().parse(input.revision);
  const serializedState = JSON.stringify(input.state);
  if (serializedState === undefined) throw new Error('invalid_lifecycle_state');

  if (input.expectedRevision === null) {
    if (revision !== 0) throw new Error('revision_conflict');
    const result = db
      .prepare(
        'INSERT INTO lifecycle_records (id, revision, state) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING',
      )
      .run(input.id, revision, serializedState);
    if (Number(result.changes) !== 1) throw new Error('revision_conflict');
    return;
  }

  const expectedRevision = z.number().int().min(0).safe().parse(input.expectedRevision);
  if (revision !== expectedRevision + 1) throw new Error('revision_conflict');
  const result = db
    .prepare('UPDATE lifecycle_records SET revision = ?, state = ? WHERE id = ? AND revision = ?')
    .run(revision, serializedState, input.id, expectedRevision);
  if (Number(result.changes) !== 1) throw new Error('revision_conflict');
}

export function writeLifecycleOperation(
  db: DatabaseSync,
  input: {
    id: string;
    operationId: string;
    payload: string;
    result: unknown;
    revision: number;
    createdAt: string;
  },
): void {
  const revision = z.number().int().min(0).safe().parse(input.revision);
  try {
    JSON.parse(input.payload);
  } catch {
    throw new Error('invalid_operation_payload');
  }
  const serializedResult = JSON.stringify(input.result);
  if (serializedResult === undefined) throw new Error('invalid_operation_result');
  const result = db
    .prepare(`
    INSERT INTO lifecycle_operations (lifecycle_id, operation_id, payload, result, revision, created_at)
    SELECT ?, ?, ?, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM lifecycle_records WHERE id = ? AND revision = ?)
    ON CONFLICT (lifecycle_id, operation_id) DO NOTHING
  `)
    .run(
      input.id,
      input.operationId,
      input.payload,
      serializedResult,
      revision,
      input.createdAt,
      input.id,
      revision,
    );
  if (Number(result.changes) === 1) return;
  const record = db.prepare('SELECT revision FROM lifecycle_records WHERE id = ?').get(input.id);
  if (!record) throw new Error('lifecycle_not_found');
  const parsedRecord = z.strictObject({ revision: z.number().int().nonnegative() }).parse(record);
  if (parsedRecord.revision !== revision) throw new Error('revision_conflict');
  throw new Error('operation_conflict');
}

export function finishLifecycleOperation(
  db: DatabaseSync,
  id: string,
  operationId: string,
  result: unknown,
): void {
  const serializedResult = JSON.stringify(result);
  if (serializedResult === undefined) throw new Error('invalid_operation_result');
  const row = db
    .prepare('SELECT result FROM lifecycle_operations WHERE lifecycle_id = ? AND operation_id = ?')
    .get(id, operationId);
  if (!row) throw new Error('lifecycle_operation_not_found');
  const current = z.strictObject({ result: z.string() }).parse(row);
  const update = db
    .prepare(`
    UPDATE lifecycle_operations SET result = ?
    WHERE lifecycle_id = ? AND operation_id = ? AND result = ?
  `)
    .run(serializedResult, id, operationId, current.result);
  if (Number(update.changes) !== 1) throw new Error('lifecycle_operation_changed');
}

export function readLifecycleHistory(db: DatabaseSync, id: string): LifecycleHistoryRecord[] {
  const rows = db
    .prepare(`
    SELECT operation_id, payload, result, revision, created_at
    FROM lifecycle_operations
    WHERE lifecycle_id = ?
    ORDER BY revision DESC, operation_id DESC
    LIMIT ?
  `)
    .all(id, maximumHistoryRows);
  return rows
    .map((row) => {
      const parsedRow = operationRowSchema.parse(row);
      const payload: unknown = JSON.parse(parsedRow.payload);
      const result: unknown = JSON.parse(parsedRow.result);
      return {
        operationId: parsedRow.operation_id,
        payload,
        result,
        revision: parsedRow.revision,
        createdAt: parsedRow.created_at,
      };
    })
    .reverse();
}
