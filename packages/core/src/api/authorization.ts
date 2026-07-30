import { createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';

const client = createSovereignClient(SOVEREIGN_API_URL);

/**
 * Requests a fresh server-owned snapshot. The response is intentionally not
 * treated as the local authority; PowerSync delivers the signed projection
 * into the local database, where scope, policy-version, expiry, and signature
 * are verified before use.
 */
export async function refreshPermissionSnapshotOnServer(): Promise<void> {
  const response = await client.api.authorization['permission-snapshot'].$get();
  if (!response.ok) {
    throw new Error(`Permission snapshot refresh failed (${response.status})`);
  }
}
