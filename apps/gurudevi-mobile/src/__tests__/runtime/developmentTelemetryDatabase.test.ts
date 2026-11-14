import { beforeEach, describe, expect, it, vi } from 'vitest';

const sqlite = vi.hoisted(() => {
  const state = {
    inTransaction: false,
    maximumConcurrentTransactions: 0,
    transactionCount: 0,
    executed: [] as string[],
    queried: [] as string[],
  };
  const db = {
    execAsync: async () => undefined,
    getFirstAsync: async () => ({ user_version: 0 }),
    runAsync: async (query: string) => {
      state.executed.push(query.trim().split(/\s+/).slice(0, 3).join(' '));
      return { changes: 1, lastInsertRowId: 1 };
    },
    getAllAsync: async (query: string) => {
      state.queried.push(query);
      return [];
    },
    withTransactionAsync: async (task: () => Promise<void>) => {
      if (state.inTransaction) throw new Error('cannot start a transaction within a transaction');
      state.inTransaction = true;
      state.transactionCount += 1;
      state.maximumConcurrentTransactions = Math.max(state.maximumConcurrentTransactions, 1);
      try {
        await task();
      } finally {
        state.inTransaction = false;
      }
    },
  };
  return { state, db };
});

vi.mock('expo-sqlite', () => ({ openDatabaseAsync: vi.fn(async () => sqlite.db) }));

describe('development telemetry SQLite write serialization', () => {
  beforeEach(() => {
    vi.resetModules();
    sqlite.state.inTransaction = false;
    sqlite.state.maximumConcurrentTransactions = 0;
    sqlite.state.transactionCount = 0;
    sqlite.state.executed.length = 0;
    sqlite.state.queried.length = 0;
  });

  it('serializes recorder batches, source manifests and explicit session removal', async () => {
    const database = await import('@/telemetry/developmentTelemetryDatabase');
    await Promise.all([
      database.appendDevelopmentTelemetry([
        {
          schema: 1,
          session: 'trace-fixture',
          sequence: 1,
          at_ms: 1,
          wall_time_ms: 10,
          source: 'rn-devtools-trace',
          name: 'startup',
          attributes: { ts: 1000, dur: 5000 },
        },
      ]),
      database.writeDevelopmentTelemetrySource('trace-fixture', {
        source: 'rn-devtools-trace',
        state: 'complete',
        details: 'Imported test trace.',
        updated_at_ms: 10,
      }),
      database.deleteDevelopmentTelemetrySession('trace-fixture'),
    ]);

    expect(sqlite.state.maximumConcurrentTransactions).toBe(1);
    expect(sqlite.state.transactionCount).toBe(3);
    expect(sqlite.state.executed).toContain('DELETE FROM diagnostic_events');
    expect(sqlite.state.executed).toContain('DELETE FROM diagnostic_sources');
    expect(sqlite.state.executed).toContain('DELETE FROM diagnostic_sessions');
    expect(sqlite.state.inTransaction).toBe(false);
  });

  it('returns session-wide source totals without inheriting timeline page limits', async () => {
    const database = await import('@/telemetry/developmentTelemetryDatabase');
    await database.listDevelopmentTelemetryEventCounts('trace-fixture');

    expect(sqlite.state.queried[0]).toContain('GROUP BY source ORDER BY source');
    expect(sqlite.state.queried[0]).toContain('WHERE session = ?');
    expect(sqlite.state.queried[0]).not.toContain('LIMIT');
  });
});
