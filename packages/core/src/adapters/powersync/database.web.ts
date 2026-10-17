/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonPowerSyncDatabase } from '@powersync/common';
import { createSecureDrizzleProxy } from './secureDrizzleProxy';

let _instance: CommonPowerSyncDatabase | null = null;
let _drizzleInstance: any = null;

export function getPowerSyncDB(): CommonPowerSyncDatabase {
  if (!_instance) throw new Error('PowerSync web runtime is not initialized');
  return _instance;
}

export function getDrizzleDB(): any {
  if (!_drizzleInstance) throw new Error('PowerSync web Drizzle runtime is not initialized');
  return _drizzleInstance;
}

export function injectNativePowerSyncDB(nativeDb: any, nativeDrizzleDb: any): void {
  _instance = nativeDb;
  _drizzleInstance = createSecureDrizzleProxy(nativeDrizzleDb);
}

export function getActivePowerSyncDB(): CommonPowerSyncDatabase | null {
  return _instance;
}

export async function disconnectPowerSync(options?: { clear?: boolean }): Promise<void> {
  if (_instance && options?.clear && 'disconnectAndClear' in _instance) {
    await (_instance as any).disconnectAndClear();
  } else if (_instance && 'close' in _instance) {
    await (_instance as any).close({ disconnect: true });
  } else if (_instance && 'disconnect' in _instance) {
    await (_instance as any).disconnect();
  }
  _instance = null;
  _drizzleInstance = null;
}

export async function clearPowerSyncAccount(): Promise<void> {
  await disconnectPowerSync({ clear: true });
}
