import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase } from '@powersync/react-native';
import { connectPowerSyncRuntime } from '@repo/core/adapters/powersync/connectionLifecycle';
import { injectNativePowerSyncDB } from '@repo/core/adapters/powersync/database';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { SingleActivePowerSyncRuntime } from '@repo/core/adapters/powersync/singleActivePowerSyncRuntime';
import type { SyncConnection } from '@repo/core/adapters/powersync/syncPipe';
import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { networkMonitor } from '@repo/core/platform/drivers/networkMonitor';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { createAccountDatabaseOptions } from '@/lib/powerSyncDatabase';
import { createAccountSyncConnection } from '@/lib/syncConnection';

type Runtime = {
  accountId: string;
  database: PowerSyncDatabase;
  /** `null` when this build has no PowerSync instance: the database stays local-only. */
  connection: SyncConnection | null;
};
const powerSyncRuntime = new SingleActivePowerSyncRuntime<PowerSyncDatabase>();

/** The signed-in, identified account whose database is the active one. */
function owns(owner: string, database: PowerSyncDatabase): boolean {
  const user = useAuthStore.getState().user;
  return user?.id === owner && !isLocalOnlyIdentity(user) && powerSyncRuntime.isActive(owner, database);
}

/** Remote sync is also admitted by rollout, network and read policy; local data never waits on it. */
function syncAdmitted(owner: string, database: PowerSyncDatabase): boolean {
  return (
    owns(owner, database) &&
    useFeatureStore.getState().flags.isPowerSyncEnabled &&
    networkMonitor.getSnapshot().status === 'online' &&
    useTemporalStore.getState().readPolicy === 'live'
  );
}

/** Account lifecycle owns local SQL. Rollout/network/read policy only admit remote synchronization. */
export function PowerSyncProvider({ children }: PropsWithChildren) {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const user = useAuthStore((state) => state.user);
  const accountId = user?.id ?? null;
  const isLocalOnly = isLocalOnlyIdentity(user);
  const isPowerSyncEnabled = useFeatureStore((state) => state.flags.isPowerSyncEnabled);
  const readPolicy = useTemporalStore((state) => state.readPolicy);
  const { isOnline } = useOfflineStatus();

  useEffect(() => {
    let active = true;
    if (!accountId || isLocalOnly) {
      void powerSyncRuntime.deactivate().catch((error) => {
        console.error('[PowerSync] Failed to deactivate inactive runtime:', error);
      });
      return () => {
        active = false;
      };
    }
    const owner = accountId;
    async function initDB() {
      try {
        const database = await powerSyncRuntime.activate(owner, async () => {
          const database = new PowerSyncDatabase(await createAccountDatabaseOptions(owner));
          const drizzle = wrapPowerSyncWithDrizzle(database, { schema: AppSchema });
          injectNativePowerSyncDB(database, drizzle, {
            isActive: () => owns(owner, database),
            release: (clear) => powerSyncRuntime.deactivateIfCurrent(database, clear),
          });
          return database;
        });
        if (active) {
          const connection = createAccountSyncConnection(owner, () =>
            syncAdmitted(owner, database)
          );
          setRuntime({ accountId: owner, database, connection });
        }
      } catch (error) {
        console.error('[PowerSync] Native database initialization failed:', error);
      }
    }
    void initDB();
    return () => {
      active = false;
      void powerSyncRuntime.deactivate().catch((error) => {
        console.error('[PowerSync] Native runtime cleanup failed:', error);
      });
    };
  }, [accountId, isLocalOnly]);

  useEffect(() => {
    if (!runtime || runtime.accountId !== accountId || isLocalOnly) return undefined;
    const controller = new AbortController();
    const { database, connection } = runtime;
    const allowSync = Boolean(connection) && isPowerSyncEnabled && isOnline && readPolicy === 'live';
    void powerSyncRuntime
      .runIfActive(runtime.accountId, database, controller, async () => {
        await database.disconnect();
        if (controller.signal.aborted || !allowSync || !connection) return;
        await connectPowerSyncRuntime(database, connection, runtime.accountId, controller.signal);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          console.warn(
            '[PowerSync] Remote synchronization unavailable; local data retained:',
            error
          );
      });
    return () => controller.abort();
  }, [runtime, accountId, isLocalOnly, isPowerSyncEnabled, isOnline, readPolicy]);

  if (
    !runtime ||
    !accountId ||
    isLocalOnly ||
    runtime.accountId !== accountId ||
    !powerSyncRuntime.isActive(accountId, runtime.database)
  )
    return <>{children}</>;

  return <PowerSyncContext.Provider value={runtime.database}>{children}</PowerSyncContext.Provider>;
}
