/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PowerSync Database Instance — May 2026
 *
 * Singleton PowerSyncDatabase with the AppSchema.
 * Exported as a lazy singleton — only initialised when first accessed.
 *
 * This uses a Dependency Injection pattern to support running in both Hono
 * server-side Node.js environment (which loads a mock database) and the native
 * Expo React Native environment (which injects the real hardware-accelerated JSI C++ instance).
 *
 * Import pattern:
 *   import { getPowerSyncDB, getDrizzleDB } from '@repo/core/powersync';
 *   const db = getDrizzleDB();
 *   const rows = await db.select().from(students);
 */

import type { CommonPowerSyncDatabase } from '@powersync/common';
import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncDatabaseRegistry } from '@repo/core/adapters/powersync/databaseRegistry';
import { PowerSyncDatabase as MockPowerSyncDatabase } from '@repo/core/adapters/powersync/powersync-shim';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { createSecureDrizzleProxy } from '@repo/core/adapters/powersync/secureDrizzleProxy';
import type { PowerSyncRuntimeOwnership } from '@repo/core/adapters/powersync/singleActivePowerSyncRuntime';
import { assertPowerSyncBootstrapReady } from '@repo/core/api/highways';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';

export {
  registerOperationContext,
  registerPermissionValidator,
  registerPolicyVersionHash,
  resetSecureDrizzleState,
  setActiveCapabilityToken,
} from '@repo/core/adapters/powersync/secureDrizzleProxy';

const registry = new PowerSyncDatabaseRegistry<
  ReturnType<typeof wrapPowerSyncWithDrizzle<typeof AppSchema>>
>(createSecureDrizzleProxy);

function assertBrowserPowerSyncReady() {
  assertPowerSyncBootstrapReady();

  if (!coreRuntime.isRegistered()) {
    throw new Error(
      'PowerSync bootstrap guard: browser code touched PowerSync before runtime registration. Initialize the runtime before accessing PowerSync.',
    );
  }
}

/**
 * Returns the active PowerSync database instance.
 * Automatically initializes the mock database under server-side Node.js or test environments
 * unless a native JSI instance has been injected via injectNativePowerSyncDB().
 */
export function getPowerSyncDB(): CommonPowerSyncDatabase {
  assertBrowserPowerSyncReady();
  let database = registry.database;
  if (!database) {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      database = new MockPowerSyncDatabase({
        schema: AppSchema as any,
        database: {
          dbFilename: 'gurudevi-powersync.db',
        },
      }) as unknown as CommonPowerSyncDatabase;
      registry.inject(database, null);
    } else {
      throw new Error(
        'PowerSync runtime is not initialized. Inject the native or web database instance via injectNativePowerSyncDB() before calling getPowerSyncDB().',
      );
    }
  }
  return database;
}

/**
 * Returns the active Drizzle ORM client wrapper instance.
 * Automatically wraps the active PowerSync database instance.
 */
export function getDrizzleDB(): ReturnType<typeof wrapPowerSyncWithDrizzle<typeof AppSchema>> {
  assertBrowserPowerSyncReady();
  return registry.getDrizzle(() =>
    wrapPowerSyncWithDrizzle(getPowerSyncDB(), { schema: AppSchema }),
  );
}

/**
 * Injects the real native React Native JSI C++ database and Drizzle instances
 * at runtime when booting the mobile client.
 */
export function injectNativePowerSyncDB(
  nativeDb: any,
  nativeDrizzleDb: any,
  ownership?: PowerSyncRuntimeOwnership,
): void {
  registry.inject(nativeDb, nativeDrizzleDb, ownership);
}

/** Returns the injected active runtime without creating a fallback database. */
export function getActivePowerSyncDB(): CommonPowerSyncDatabase | null {
  return registry.activeDatabase;
}

/** Close the active runtime; clear is reserved for explicit account removal. */
export function disconnectPowerSync(options?: { clear?: boolean }): Promise<void> {
  return registry.disconnect(options);
}

/** Explicit destructive cleanup for account removal or sign-out-all. */
export async function clearPowerSyncAccount(): Promise<void> {
  await disconnectPowerSync({ clear: true });
}
