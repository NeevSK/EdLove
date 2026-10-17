import { orpcClient } from '@repo/core/api/orpcClient';

/**
 * Requests a fresh server-owned snapshot. The response is intentionally not
 * treated as the local authority; PowerSync delivers the signed projection
 * into the local database, where scope, policy-version, expiry, and signature
 * are verified before use.
 */
export async function refreshPermissionSnapshotOnServer(): Promise<void> {
  try {
    await orpcClient.authorization.refresh();
  } catch (error: any) {
    throw new Error(`Permission snapshot refresh failed (${error.message || error.status || 'unknown'})`);
  }
}
