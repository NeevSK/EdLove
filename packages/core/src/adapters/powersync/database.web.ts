/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonPowerSyncDatabase } from '@powersync/common';
import { PowerSyncDatabaseRegistry } from './databaseRegistry';
import { createSecureDrizzleProxy } from './secureDrizzleProxy';
import type { PowerSyncRuntimeOwnership } from './singleActivePowerSyncRuntime';

const registry = new PowerSyncDatabaseRegistry<ReturnType<typeof createSecureDrizzleProxy>>(
  createSecureDrizzleProxy,
);

export function getPowerSyncDB(): CommonPowerSyncDatabase {
  const database = registry.database;
  if (!database) throw new Error('PowerSync web runtime is not initialized');
  return database;
}

export function getDrizzleDB(): any {
  const drizzle = registry.getDrizzle();
  if (!drizzle) throw new Error('PowerSync web Drizzle runtime is not initialized');
  return drizzle;
}

export function injectNativePowerSyncDB(
  nativeDb: any,
  nativeDrizzleDb: any,
  ownership?: PowerSyncRuntimeOwnership,
): void {
  registry.inject(nativeDb, nativeDrizzleDb, ownership);
}

export function getActivePowerSyncDB(): CommonPowerSyncDatabase | null {
  return registry.activeDatabase;
}

export function disconnectPowerSync(options?: { clear?: boolean }): Promise<void> {
  return registry.disconnect(options);
}

export async function clearPowerSyncAccount(): Promise<void> {
  await disconnectPowerSync({ clear: true });
}
