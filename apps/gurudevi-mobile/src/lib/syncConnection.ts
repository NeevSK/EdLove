import {
  createSyncConnection,
  type SyncConnection,
  type UploadRoutes,
} from '@repo/core/adapters/powersync/syncPipe';
import { presentFailure } from '@repo/core/lib/failureFeedback.adapter';
import { v1Client } from '@/lib/v1Client';

/**
 * Upload routes: one v1 command per synced table admitted for writing. None are admitted yet.
 * A local change to a synced table stays queued (`SYNC_ROUTE_NOT_ADMITTED`) until its route and
 * command exist; nothing is dropped. See the data stack mental model, section 12.
 */
export const UPLOAD_ROUTES: UploadRoutes = {};

/**
 * The sync connection for one account, or `null` when this build has no PowerSync instance
 * (`EXPO_PUBLIC_POWERSYNC_URL`, from Doppler). The database then stays local-only.
 */
export function createAccountSyncConnection(
  accountId: string,
  isAllowed: () => boolean,
): SyncConnection | null {
  const endpoint = process.env.EXPO_PUBLIC_POWERSYNC_URL;
  if (!endpoint) return null;
  return createSyncConnection({
    accountId,
    endpoint,
    fetchGrant: (signal) => v1Client.identity.syncGrant(undefined, { signal }),
    routes: UPLOAD_ROUTES,
    isAllowed,
    onRejected: ({ error, table }) => presentFailure(error, `sync.upload.${table}`),
  });
}

