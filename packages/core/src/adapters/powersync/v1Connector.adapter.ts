import type { PowerSyncBackendConnector, PowerSyncCredentials } from '@powersync/common';
import type { AppContractClient } from '@repo/core/api/v1/contract';

/** The local upload queue, as much of the PowerSync database as uploading needs. */
interface CrudQueue {
  getNextCrudTransaction(): Promise<{ crud: readonly { table: string }[] } | null>;
}

/**
 * The PowerSync connector on the v1 API. Credentials come from `identity.syncGrant`, a
 * short-lived grant for the signed-in account. No v1 capability accepts synced writes yet, so
 * `uploadData` leaves them queued and fails, which makes PowerSync retry later; completing the
 * transaction would discard them. Each domain adds its write path when its card is admitted.
 */
export function createV1SyncConnector(
  client: { identity: Pick<AppContractClient['identity'], 'syncGrant'> },
  /** Re-checked on every call: account, rollout, network and read policy can change mid-session. */
  isAdmitted: () => boolean = () => true,
) {
  return {
    async fetchCredentials(): Promise<PowerSyncCredentials | null> {
      if (!isAdmitted()) return null;
      try {
        const grant = await client.identity.syncGrant();
        return {
          endpoint: grant.endpoint,
          token: grant.token,
          expiresAt: new Date(grant.expiresAt * 1000),
        };
      } catch (error) {
        // Signed out: null tells PowerSync to stop instead of retrying.
        const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined;
        if (code === 'UNAUTHORIZED') return null;
        throw error;
      }
    },

    async uploadData(database: CrudQueue): Promise<void> {
      if (!isAdmitted()) throw new Error('Sync is not admitted now; local writes kept queued.');
      const transaction = await database.getNextCrudTransaction();
      if (!transaction) return;
      const tables = [...new Set(transaction.crud.map((entry) => entry.table))].sort();
      throw new Error(`No v1 capability accepts writes to ${tables.join(', ')} yet; kept queued.`);
    },
  } satisfies PowerSyncBackendConnector;
}
