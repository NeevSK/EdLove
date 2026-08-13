import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase } from '@powersync/web';
import { WASQLiteAdapter } from '@repo/core/adapters/powersync/wasqlite.adapter';
import { AppSchema, injectNativePowerSyncDB } from '@repo/core/powersync';
import { SingleActivePowerSyncRuntime } from '@repo/core/adapters/powersync/singleActivePowerSyncRuntime';
import { BrowserPowerSyncAccountCoordinator } from '@repo/core/adapters/powersync/browserAccountCoordinator';
import { connectPowerSyncRuntime } from '@repo/core/adapters/powersync/connectionLifecycle';
import { useStore } from '@repo/core/store/useStore';
import { type PropsWithChildren, useEffect, useState } from 'react';

type PowerSyncProviderProps = PropsWithChildren;
const powerSyncRuntime = new SingleActivePowerSyncRuntime<PowerSyncDatabase>();
const browserAccountCoordinator = new BrowserPowerSyncAccountCoordinator();

/**
 * Web PowerSync provider.
 *
 * The browser build uses PowerSync's WASQLite/OPFS adapter. It is a real
 * local database path, separate from the native SQLCipher implementation.
 */
export function PowerSyncProvider({ children }: PowerSyncProviderProps) {
  const [db, setDb] = useState<PowerSyncDatabase | null>(null);
  const accountId = useStore((state) => state.user?.id ?? null);
  const isPowerSyncEnabled = useStore((state) => state.flags.isPowerSyncEnabled);

  useEffect(() => {
    let active = true;
    setDb(null);
    const activeAccountId = accountId;

    const unsubscribe = browserAccountCoordinator.subscribe((signal) => {
      if (signal.accountId !== activeAccountId) {
        void powerSyncRuntime.deactivate().catch((error) => {
          console.error('[PowerSync] Failed to stop after another tab changed account:', error);
        });
        setDb(null);
      }
    });
    browserAccountCoordinator.announce(activeAccountId);

    if (!isPowerSyncEnabled || !activeAccountId) {
      void powerSyncRuntime.deactivate().catch((error) => {
        console.error('[PowerSync] Failed to deactivate inactive web runtime:', error);
      });
      return () => {
        active = false;
        unsubscribe();
      };
    }
    const resolvedAccountId = activeAccountId as string;

    async function initDB() {
      const powersyncDb = await powerSyncRuntime.activate(resolvedAccountId, async () => {
        const adapter = new WASQLiteAdapter(resolvedAccountId);
        const source = await adapter.createDatabaseFactory(resolvedAccountId);
        const database = new PowerSyncDatabase({
          schema: source.schema,
          database: source.database,
        });
        const drizzleDb = wrapPowerSyncWithDrizzle(database, { schema: AppSchema });

        injectNativePowerSyncDB(database, drizzleDb);
        if (source.sync) {
          void connectPowerSyncRuntime(database, source.sync, resolvedAccountId).catch((error) => {
            // OPFS-backed local reads/writes remain available while offline.
            console.warn('[PowerSync] Web first sync unavailable:', error);
          });
        }
        return database;
      });

      if (active) setDb(powersyncDb);
    }

    void initDB().catch((error) => {
      console.error('❌ [PowerSync] Web initialization failed:', error);
    });

    return () => {
      active = false;
      unsubscribe();
      void powerSyncRuntime.deactivate().catch((error) => {
        console.error('[PowerSync] Web runtime cleanup failed:', error);
      });
    };
  }, [accountId, isPowerSyncEnabled]);

  if (!db) return null;

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
}
