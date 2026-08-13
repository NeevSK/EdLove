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
import { SingleActivePowerSyncRuntime } from '@repo/core/adapters/powersync/singleActivePowerSyncRuntime';
import { connectPowerSyncRuntime } from '@repo/core/adapters/powersync/connectionLifecycle';
import { useStore } from '@repo/core/store/useStore';
import { type PropsWithChildren, useEffect, useState } from 'react';

type PowerSyncProviderProps = PropsWithChildren;
const powerSyncRuntime = new SingleActivePowerSyncRuntime<PowerSyncDatabase>();

export function PowerSyncProvider({ children }: PowerSyncProviderProps) {
  const [db, setDb] = useState<PowerSyncDatabase | null>(null);
  const accountId = useStore((state) => state.user?.id ?? null);
  const isPowerSyncEnabled = useStore((state) => state.flags.isPowerSyncEnabled);

  useEffect(() => {
    let active = true;
    setDb(null);
    const activeAccountId = accountId;

    if (!isPowerSyncEnabled || !activeAccountId) {
      void powerSyncRuntime.deactivate().catch((error) => {
        console.error('[PowerSync] Failed to deactivate inactive runtime:', error);
      });
      return () => {
        active = false;
      };
    }
    const resolvedAccountId = activeAccountId as string;

    async function initDB() {
      try {
        const powersyncDb = await powerSyncRuntime.activate(resolvedAccountId, async () => {
          const adapter = new OPSQLiteAdapter(resolvedAccountId);
          const source = await adapter.createDatabaseFactory(resolvedAccountId);
          const database = new PowerSyncDatabase({
            schema: source.schema,
            database: source.database,
          });
          const drizzleDb = wrapPowerSyncWithDrizzle(database, { schema: AppSchema });

          injectNativePowerSyncDB(database, drizzleDb);
          if (source.sync) {
            void connectPowerSyncRuntime(database, source.sync, resolvedAccountId).catch((error) => {
              // Local reads/writes remain available while the sync stream is
              // offline; PowerSync will retry when connectivity returns.
              console.warn('[PowerSync] Native first sync unavailable:', error);
            });
          }
          return database;
        });

        if (active) setDb(powersyncDb);
      } catch (error) {
        console.error('❌ [PowerSync] Native JSI initialization failed:', error);
      }
    }

    void initDB();

    return () => {
      active = false;
      void powerSyncRuntime.deactivate().catch((error) => {
        console.error('[PowerSync] Native runtime cleanup failed:', error);
      });
    };
  }, [accountId, isPowerSyncEnabled]);

  if (!db) {
    // Return null or splash screen during fast JSI load sequence (<20ms)
    return null;
  }

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
}
