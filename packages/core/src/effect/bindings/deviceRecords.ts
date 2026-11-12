import {
  clearPendingGateAction,
  getPendingGateAction,
  type PendingGateAction,
  setPendingGateAction,
} from '@repo/core/lib/pendingGateAction.adapter';
import { TenantPartitionedStorageAdapter } from '@repo/core/lib/tenantStorage.adapter';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

/** Storage partitioned to one tenant and user, for a perspective's local records. */
export const createTenantStorage = (base: IStorage, namespace: string, userId: string): IStorage =>
  new TenantPartitionedStorageAdapter(base, namespace, userId);

/** The one gated action kept across sign-in, replayed once the gate opens. */
export const pendingGate = {
  get: (): Promise<PendingGateAction | null> => getPendingGateAction(),
  set: (action: PendingGateAction): Promise<void> => setPendingGateAction(action),
  clear: (): Promise<void> => clearPendingGateAction(),
};
