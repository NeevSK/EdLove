import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncContext } from '@powersync/react';
import { type PowerSyncBackendConnector, PowerSyncDatabase } from '@powersync/react-native';
import { connectPowerSyncRuntime } from '@repo/core/adapters/powersync/connectionLifecycle';
import { injectNativePowerSyncDB } from '@repo/core/adapters/powersync/database';
import { SupabasePowerSyncConnector } from '@repo/core/adapters/powersync/SupabasePowerSyncConnector';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { SingleActivePowerSyncRuntime } from '@repo/core/adapters/powersync/singleActivePowerSyncRuntime';
import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { createAccountDatabaseOptions } from '@/lib/powerSyncDatabase';

type Runtime = {
  accountId: string;
  database: PowerSyncDatabase;
  connector: PowerSyncBackendConnector;
};
const powerSyncRuntime = new SingleActivePowerSyncRuntime<PowerSyncDatabase>();

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
            isActive: () =>
              useAuthStore.getState().user?.id === owner &&
              !isLocalOnlyIdentity(useAuthStore.getState().user) &&
              powerSyncRuntime.isActive(owner, database),
            release: (clear) => powerSyncRuntime.deactivateIfCurrent(database, clear),
          });
          return database;
        });
        if (active) {
          const connector = new SupabasePowerSyncConnector(
            owner,
            () =>
              useAuthStore.getState().user?.id === owner &&
              !isLocalOnlyIdentity(useAuthStore.getState().user) &&
              powerSyncRuntime.isActive(owner, database) &&
              useFeatureStore.getState().flags.isPowerSyncEnabled &&
              networkManager.getSnapshot().status === 'online' &&
              useTemporalStore.getState().readPolicy === 'live',
          );
          setRuntime({ accountId: owner, database, connector });
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
    const { database, connector } = runtime;
    const allowSync = isPowerSyncEnabled && isOnline && readPolicy === 'live';
    void powerSyncRuntime
      .runIfActive(runtime.accountId, database, controller, async () => {
        await database.disconnect();
        if (controller.signal.aborted || !allowSync) return;
        await connectPowerSyncRuntime(database, connector, runtime.accountId, controller.signal);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          console.warn(
            '[PowerSync] Remote synchronization unavailable; local data retained:',
            error,
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
