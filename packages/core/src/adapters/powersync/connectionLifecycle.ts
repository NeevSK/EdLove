import type {
  CommonPowerSyncDatabase,
  PowerSyncBackendConnector,
  SyncStatus,
} from '@powersync/common';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';

type ConnectionStatus = Pick<
  SyncStatus,
  | 'connected'
  | 'connecting'
  | 'downloading'
  | 'uploading'
  | 'hasSynced'
  | 'downloadError'
  | 'uploadError'
>;
type LifecycleDatabase = Pick<CommonPowerSyncDatabase, 'connect' | 'waitForFirstSync'> & {
  registerListener: (listener: { statusChanged: (status: ConnectionStatus) => void }) => () => void;
};
const FIRST_SYNC_TIMEOUT_MS = 30_000;

/** Remote connection observation lives until its owner aborts, independently of local database access. */
export async function connectPowerSyncRuntime(
  database: LifecycleDatabase,
  connector: PowerSyncBackendConnector,
  accountId: string,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) return;
  const firstSync = new AbortController();
  const unregister = database.registerListener({
    statusChanged: (status) => {
      if (signal.aborted) return;
      sovereignBus.emit('powersync:status', {
        accountId,
        connected: status.connected,
        connecting: status.connecting,
        downloading: status.downloading,
        uploading: status.uploading,
        hasSynced: status.hasSynced,
        error: status.downloadError?.message ?? status.uploadError?.message ?? null,
      });
    },
  });
  const dispose = () => {
    firstSync.abort();
    unregister();
  };
  signal.addEventListener('abort', dispose, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await database.connect(connector);
    if (signal.aborted) return;
    timer = setTimeout(
      () => firstSync.abort(new Error('PowerSync first sync timed out')),
      FIRST_SYNC_TIMEOUT_MS,
    );
    await database.waitForFirstSync(firstSync.signal);
    if (signal.aborted) return;
    if (firstSync.signal.aborted) throw firstSync.signal.reason;
    sovereignBus.emit('powersync:first_sync_complete', { accountId });
  } catch (error) {
    if (signal.aborted) return;
    sovereignBus.emit('powersync:unavailable', { reason: 'service_down' });
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
