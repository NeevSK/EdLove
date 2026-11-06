import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase } from '@powersync/react-native';
import { injectNativePowerSyncDB } from '@repo/core/adapters/powersync/database';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { SingleActivePowerSyncRuntime } from '@repo/core/adapters/powersync/singleActivePowerSyncRuntime';
import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { createAccountDatabaseOptions } from '@/lib/powerSyncDatabase';

type Runtime = {
  accountId: string;
  database: PowerSyncDatabase;
};
const powerSyncRuntime = new SingleActivePowerSyncRuntime<PowerSyncDatabase>();

/** Account lifecycle owns local SQL. Rollout/network/read policy only admit remote synchronization. */
export function PowerSyncProvider({ children }: PropsWithChildren) {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const user = useAuthStore((state) => state.user);
  const accountId = user?.id ?? null;
  const isLocalOnly = isLocalOnlyIdentity(user);

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
          setRuntime({ accountId: owner, database });
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
