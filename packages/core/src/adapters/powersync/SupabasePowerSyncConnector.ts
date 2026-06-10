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

import { createSovereignClient, SOVEREIGN_API_URL } from '../../api/base';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import { sovereignBus } from '../../lib/sync/eventBus';
import type {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from './powersync-shim';

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL ?? '';

export class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  /**
   * Called by PowerSync SDK to authenticate the replication stream.
   * Re-uses the active Supabase session JWT — no separate auth needed.
   */
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const {
      data: { session },
      error,
    } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession();

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
   * 2026 Bulk Canonical Gateway Strategy:
   *  - Encapsulates all transactional CRUD operations in the batch.
   *  - Routes them in a single REST request to Sanctuary API `/api/powersync/upload`.
   *  - Relies authoritatively on server-side Cedar + ZenStack ReBAC gates.
   */
  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const batch = await database.getCrudBatch(200);
    if (!batch || batch.crud.length === 0) return;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession();

      if (sessionError || !session) {
        throw new Error('[PowerSync] No active session. Cannot upload data.');
      }

      const client = createSovereignClient(SOVEREIGN_API_URL);

      console.log(
        `[PowerSync] Uploading transactional batch of ${batch.crud.length} mutations through Sanctuary API.`,
      );

      const res = await (client.api as any).powersync.upload.$post(
        {
          json: {
            crud: batch.crud.map((c) => ({
              id: c.id,
              op: c.op,
              table: c.table,
              opData: c.opData,
            })),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!res.ok) {
        const errorData = (await res.json()) as any;
        throw new Error(errorData.message || `Sanctuary API sync failed with status ${res.status}`);
      }

      // Sync batch succeeded upstream — mark the batch as complete in SQLite.
      await batch.complete();

      const tablesAffected = Array.from(new Set(batch.crud.map((c) => c.table)));
      sovereignBus.emit('powersync:sync_complete', { tablesAffected });
    } catch (err: unknown) {
      // DO NOT call batch.complete() — PowerSync will retry the whole batch.
      console.error('[PowerSync] uploadData failed. Batch will be retried.', err);
      sovereignBus.emit('powersync:unavailable', { reason: 'service_down' });
    }
  }
}
