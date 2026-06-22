import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase } from '@powersync/web';
import { WASQLiteAdapter } from '@repo/core/adapters/powersync/wasqlite.adapter';
import { AppSchema, injectNativePowerSyncDB } from '@repo/core/powersync';
import { useStore } from '@repo/core/store/useStore';
import { type PropsWithChildren, useEffect, useState } from 'react';

type PowerSyncProviderProps = PropsWithChildren;

/**
 * Web PowerSync provider.
 *
 * The browser build intentionally skips native SQLite/SQLCipher bootstrap.
 * Shared web-safe adapters resolve through platform-specific core shims.
 */
export function PowerSyncProvider({ children }: PowerSyncProviderProps) {
  const [db, setDb] = useState<PowerSyncDatabase | null>(null);
  const accountId = useStore((state) => state.user?.id ?? 'anonymous');

  useEffect(() => {
    let active = true;

    async function initDB() {
      const adapter = new WASQLiteAdapter(accountId);
      const factory = await adapter.createDatabaseFactory(accountId);
      const powersyncDb = new PowerSyncDatabase(factory as any);

      const drizzleDb = wrapPowerSyncWithDrizzle(powersyncDb as any, { schema: AppSchema });

      injectNativePowerSyncDB(powersyncDb, drizzleDb);

      if (active) setDb(powersyncDb);
    }

    void initDB().catch((error) => {
      console.error('❌ [PowerSync] Web initialization failed:', error);
    });

    return () => {
      active = false;
    };
  }, [accountId]);

  if (!db) return null;

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
}
