import type { CommonPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/common';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';

type LifecycleDatabase = CommonPowerSyncDatabase & {
  registerListener?: (listener: { statusChanged?: (status: unknown) => void }) => () => void;
  waitForFirstSync?: () => Promise<void>;
};

const FIRST_SYNC_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('PowerSync first sync timed out')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Connects a runtime while keeping offline local operation available. */
export async function connectPowerSyncRuntime(
  database: LifecycleDatabase,
  connector: PowerSyncBackendConnector,
  accountId: string,
): Promise<void> {
  database.registerListener?.({
    statusChanged: (status: any) => {
      sovereignBus.emit('powersync:status', {
        accountId,
        connected: Boolean(status?.connected),
        connecting: Boolean(status?.connecting),
        downloading: Boolean(status?.downloading),
        uploading: Boolean(status?.uploading),
        hasSynced: status?.hasSynced,
        error: status?.downloadError?.message ?? status?.uploadError?.message ?? null,
      });
    },
  });

  try {
    await database.connect(connector);
    if (database.waitForFirstSync) {
      await withTimeout(database.waitForFirstSync(), FIRST_SYNC_TIMEOUT_MS);
    }
    sovereignBus.emit('powersync:first_sync_complete', { accountId });
  } catch (error) {
    sovereignBus.emit('powersync:unavailable', {
      reason: 'service_down',
    });
    throw error;
  }
}
