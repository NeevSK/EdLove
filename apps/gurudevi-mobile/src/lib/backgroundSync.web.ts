/**
 * Background Sync Task — Web Stub
 *
 * Prevents native background sync execution on the Web platform.
 */

export const BACKGROUND_SYNC_TASK = 'GURUDEVI_BACKGROUND_SYNC';

export async function registerBackgroundSync(): Promise<void> {
  // No-op on Web
}

export async function unregisterBackgroundSync(): Promise<void> {
  // No-op on Web
}

export async function triggerBackgroundSyncForTesting(): Promise<void> {
  // No-op on Web
}
