/**
 * PowerSyncProvider — Native Local-First SQLCipher & Drizzle Engine (May 2026)
 *
 * This is the heart of the local-first architecture on the native mobile client.
 * It does the following:
 * 1. Generates and manages a secure device-bound AES-256 key via Expo SecureStore.
 * 2. Initializes the high-performance JSI-based C++ database engine (op-sqlite)
 *    configured with SQLCipher full-disk page encryption.
 * 3. Bridges the Drizzle ORM schema using DrizzleAppSchema to compile PowerSync sync rules.
 * 4. Wraps the native connection with Drizzle ORM to provide complete type-safety.
 * 5. Injects the native JSI database singletons into the shared @repo/core package
 *    to support zero-latency offline mutations and compiled AST reactive queries.
 *
 * @see https://docs.powersync.com/usage/use-case-examples/drizzle
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase } from '@powersync/react-native';
import { OPSQLiteAdapter } from '@repo/core/adapters/powersync/opsqlite.adapter';
import { AppSchema, injectNativePowerSyncDB } from '@repo/core/powersync';
import { useStore } from '@repo/core/store/useStore';
import { type PropsWithChildren, useEffect, useState } from 'react';

type PowerSyncProviderProps = PropsWithChildren;

export function PowerSyncProvider({ children }: PowerSyncProviderProps) {
  const [db, setDb] = useState<PowerSyncDatabase | null>(null);
  const accountId = useStore((state) => state.user?.id ?? 'anonymous');

  useEffect(() => {
    let active = true;

    async function initDB() {
      try {
        const adapter = new OPSQLiteAdapter(accountId);
        const factory = await adapter.createDatabaseFactory(accountId);
        const powersyncDb = new PowerSyncDatabase(factory as any);
        const drizzleDb = wrapPowerSyncWithDrizzle(powersyncDb as any, { schema: AppSchema });

        injectNativePowerSyncDB(powersyncDb, drizzleDb);
        if (active) setDb(powersyncDb);
      } catch (error) {
        console.error('❌ [PowerSync] Native JSI initialization failed:', error);
      }
    }

    void initDB();

    return () => {
      active = false;
    };
  }, [accountId]);

  if (!db) {
    // Return null or splash screen during fast JSI load sequence (<20ms)
    return null;
  }

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
}
