/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PowerSyncDatabase as PowerSyncDatabaseType } from './powersync-shim';
import { AppSchema } from './schema';

type QueryLike = {
  findFirst: (_args?: any) => Promise<null>;
};

type ChainLike = Promise<never[]> & {
  where: () => ChainLike;
  orderBy: () => ChainLike;
  limit: () => Promise<never[]>;
  values: () => ChainLike;
  onConflictDoUpdate: () => ChainLike;
  execute: () => Promise<never[]>;
};

function createChainLike(): ChainLike {
  const result: any = Promise.resolve([]);
  result.where = () => result;
  result.orderBy = () => result;
  result.limit = () => Promise.resolve([]);
  result.values = () => result;
  result.onConflictDoUpdate = () => result;
  result.execute = () => Promise.resolve([]);
  return result;
}

function createWebPowerSyncDatabase(): PowerSyncDatabaseType {
  const queryProxy = new Proxy(
    {},
    {
      get: () =>
        ({
          findFirst: async () => null,
        }) satisfies QueryLike,
    },
  );

  return new Proxy(
    {
      schema: AppSchema,
      query: queryProxy,
      connect: async () => undefined,
      select: () => createChainLike(),
      insert: () => createChainLike(),
      update: () => createChainLike(),
      delete: () => createChainLike(),
      transaction: async (callback: (...args: any[]) => any) => callback({}),
      writeLock: async (callback: (...args: any[]) => any) => callback(),
      readLock: async (callback: (...args: any[]) => any) => callback(),
      disconnect: async () => undefined,
    },
    {
      get(target, prop) {
        if (prop in target) {
          return Reflect.get(target, prop);
        }

        return () => createChainLike();
      },
    },
  ) as PowerSyncDatabaseType;
}

let _instance: PowerSyncDatabaseType | null = null;

export function getPowerSyncDB(): PowerSyncDatabaseType {
  if (!_instance) {
    _instance = createWebPowerSyncDatabase();
  }
  return _instance;
}

export function getDrizzleDB(): any {
  return getPowerSyncDB();
}

export function injectNativePowerSyncDB(_nativeDb: any, _nativeDrizzleDb: any): void {
  // Web never injects native JSI instances.
}

export async function disconnectPowerSync(): Promise<void> {
  _instance = null;
}
