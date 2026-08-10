/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PowerSyncDatabase as PowerSyncDatabaseType } from '@repo/core/adapters/powersync/powersync-shim';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { createSecureDrizzleProxy } from './secureDrizzleProxy';

type QueryLike = {
  findFirst: (_args?: any) => Promise<null>;
};

function createChainLike(): any {
  const result: any = Promise.resolve([]);
  const chainProxy = new Proxy(result, {
    get(target, prop) {
      if (prop === 'then') {
        return (onfulfilled?: any, onrejected?: any) => {
          return Promise.resolve([]).then(onfulfilled, onrejected);
        };
      }
      if (prop === 'execute') {
        return async () => [];
      }
      return () => chainProxy;
    },
  });
  return chainProxy;
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
let _drizzleInstance: any = null;

export function getPowerSyncDB(): PowerSyncDatabaseType {
  if (!_instance) {
    _instance = createWebPowerSyncDatabase();
  }
  return _instance;
}

export function getDrizzleDB(): any {
  if (!_drizzleInstance) {
    _drizzleInstance = getPowerSyncDB();
  }
  return _drizzleInstance;
}

export function injectNativePowerSyncDB(nativeDb: any, nativeDrizzleDb: any): void {
  _instance = nativeDb;
  _drizzleInstance = createSecureDrizzleProxy(nativeDrizzleDb);
}

export async function disconnectPowerSync(): Promise<void> {
  _instance = null;
  _drizzleInstance = null;
}
