import { clearPowerSyncAccount, disconnectPowerSync } from '@repo/core/adapters/powersync/database';
import {
  type IssuedSnapshot,
  storePermissionSnapshot,
} from '@repo/core/adapters/powersync/permissionSnapshot.adapter';

/** The on-device database (PowerSync): connection lifetime and the signed permission snapshot. */
export const localDatabase = {
  disconnect: (): Promise<void> => disconnectPowerSync(),
  /** Drops the account's replicated rows; used when an account's work is discarded. */
  clearAccount: (): Promise<void> => clearPowerSyncAccount(),
  /** Keeps the signed snapshot row so permissions survive a restart with no network. */
  storePermissionSnapshot: (issued: IssuedSnapshot): Promise<void> =>
    storePermissionSnapshot(issued),
};
