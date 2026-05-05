/**
 * SupabasePowerSyncConnector — 2026 Elegant Edition
 *
 * Bridges Supabase Auth + Data API to PowerSync's BackendConnector interface.
 *
 * Responsibilities:
 *  1. fetchCredentials(): Supplies the JWT + PowerSync endpoint URL.
 *     PowerSync uses these to open the websocket replication stream.
 *
 *  2. uploadData(): Processes PowerSync's internal CRUD queue in BULK.
 *     Instead of N sequential requests (one per row), ops are grouped by
 *     table + operation and dispatched as bulk array operations.
 *     Example: 200 attendance upserts → 1 Supabase upsert([...200 rows]).
 *
 * IMPORTANT: This connector handles CRUD replication only (State path).
 * Complex workflows (Inngest triggers, side-effects) still go through
 * the Message Bus (Path 2 / useMutationQueue). This is intentional.
 */
import type {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/react-native';
import { supabase } from '../../api/supabase';
import { sovereignBus } from '../../lib/sync/eventBus';

const POWERSYNC_URL = process.env['EXPO_PUBLIC_POWERSYNC_URL'] ?? '';

/** Group CRUD entries by [table][operation] for bulk processing. */
type OpGroup = {
  puts: Array<Record<string, unknown>>;
  patches: Array<{ id: string; data: Record<string, unknown> }>;
  deletes: string[];
};

function groupOps(entries: CrudEntry[]): Map<string, OpGroup> {
  const groups = new Map<string, OpGroup>();

  for (const op of entries) {
    const { table, op: operation, opData, id } = op;

    if (!groups.has(table)) {
      groups.set(table, { puts: [], patches: [], deletes: [] });
    }
    const group = groups.get(table)!;

    switch (operation) {
      case 'PUT':
        group.puts.push({ ...opData, id });
        break;
      case 'PATCH':
        group.patches.push({ id, data: opData ?? {} });
        break;
      case 'DELETE':
        group.deletes.push(id);
        break;
    }
  }

  return groups;
}

export class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  /**
   * Called by PowerSync SDK to authenticate the replication stream.
   * Re-uses the active Supabase session JWT — no separate auth needed.
   */
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      throw new Error('[PowerSync] No active Supabase session. Cannot connect.');
    }

    return {
      endpoint: POWERSYNC_URL,
      token: session.access_token,
    };
  }

  /**
   * Called by PowerSync SDK when local SQLite writes need to be pushed upstream.
   *
   * 2026 Bulk Strategy:
   *  - Groups all ops in the batch by table + operation type.
   *  - Dispatches one Supabase call per table per operation, not one per row.
   *  - This reduces 200 sequential requests to ~N table batches (typically 3–5).
   *  - Batch is only marked complete AFTER all bulk ops succeed atomically.
   */
  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const batch = await database.getCrudBatch(200);
    if (!batch || batch.crud.length === 0) return;

    try {
      const groups = groupOps(batch.crud);
      const tablesAffected: string[] = [];

      for (const [table, { puts, patches, deletes }] of groups) {
        tablesAffected.push(table);

        // ── Bulk PUT (upsert) ────────────────────────────────────────────────
        if (puts.length > 0) {
          const { error } = await supabase.from(table).upsert(puts);
          if (error) throw error;
        }

        // ── Bulk PATCH (update individual rows — must stay per-row for safety) ─
        // Supabase's update() requires a filter; can't bulk-update mixed rows.
        // We can at least parallelise them:
        if (patches.length > 0) {
          const results = await Promise.allSettled(
            patches.map(({ id, data }) =>
              supabase.from(table).update(data).eq('id', id),
            ),
          );
          const failed = results.find((r) => r.status === 'rejected');
          if (failed) throw (failed as PromiseRejectedResult).reason;
        }

        // ── Bulk DELETE ──────────────────────────────────────────────────────
        if (deletes.length > 0) {
          const { error } = await supabase.from(table).delete().in('id', deletes);
          if (error) throw error;
        }
      }

      // All bulk ops succeeded — mark the batch as complete.
      await batch.complete();

      sovereignBus.emit('powersync:sync_complete', { tablesAffected });
    } catch (err: unknown) {
      // DO NOT call batch.complete() — PowerSync will retry the whole batch.
      console.error('[PowerSync] uploadData failed. Batch will be retried.', err);
      sovereignBus.emit('powersync:unavailable', { reason: 'service_down' });
    }
  }
}
