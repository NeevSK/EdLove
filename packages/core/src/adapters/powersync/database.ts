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
import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import type { CommonPowerSyncDatabase } from '@powersync/common';
import { PowerSyncDatabase as MockPowerSyncDatabase } from '@repo/core/adapters/powersync/powersync-shim';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { createSecureDrizzleProxy } from '@repo/core/adapters/powersync/secureDrizzleProxy';
import { assertPowerSyncBootstrapReady } from '@repo/core/api/highways';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';

export {
  registerOperationContext,
  registerPermissionValidator,
  registerPolicyVersionHash,
  resetSecureDrizzleState,
  setActiveCapabilityToken,
} from '@repo/core/adapters/powersync/secureDrizzleProxy';

let _instance: CommonPowerSyncDatabase | null = null;
let _drizzleInstance: ReturnType<typeof wrapPowerSyncWithDrizzle<typeof AppSchema>> | null = null;

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
  if (!_instance) {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      _instance = new MockPowerSyncDatabase({
        schema: AppSchema as any,
        database: {
          dbFilename: 'gurudevi-powersync.db',
        },
      }) as unknown as CommonPowerSyncDatabase;
    } else {
      throw new Error(
        'PowerSync runtime is not initialized. Inject the native or web database instance via injectNativePowerSyncDB() before calling getPowerSyncDB().',
      );
    }
  }
  return _instance;
}

/**
 * Returns the active Drizzle ORM client wrapper instance.
 * Automatically wraps the active PowerSync database instance.
 */
export function getDrizzleDB(): ReturnType<typeof wrapPowerSyncWithDrizzle<typeof AppSchema>> {
  assertBrowserPowerSyncReady();
  if (!_drizzleInstance) {
    const powerSyncDb = getPowerSyncDB();
    const rawDrizzle = wrapPowerSyncWithDrizzle(powerSyncDb as any, { schema: AppSchema });
    _drizzleInstance = createSecureDrizzleProxy(rawDrizzle) as any;
  }
  return _drizzleInstance as any;
}

/**
 * Injects the real native React Native JSI C++ database and Drizzle instances
 * at runtime when booting the mobile client.
 */
export function injectNativePowerSyncDB(nativeDb: any, nativeDrizzleDb: any): void {
  _instance = nativeDb;
  _drizzleInstance = createSecureDrizzleProxy(nativeDrizzleDb) as any;
}

/** Returns the injected active runtime without creating a fallback database. */
export function getActivePowerSyncDB(): CommonPowerSyncDatabase | null {
  return _instance;
}

/** Close the active runtime; clear is reserved for explicit account removal. */
export async function disconnectPowerSync(options?: { clear?: boolean }): Promise<void> {
  if (_instance) {
    if (options?.clear && 'disconnectAndClear' in _instance) {
      await (_instance as any).disconnectAndClear();
    } else if ('close' in _instance) {
      await (_instance as any).close({ disconnect: true });
    } else {
      await (_instance as any).disconnect();
    }
    _instance = null;
    _drizzleInstance = null;
  }
}

/** Explicit destructive cleanup for account removal or sign-out-all. */
export async function clearPowerSyncAccount(): Promise<void> {
  await disconnectPowerSync({ clear: true });
}
