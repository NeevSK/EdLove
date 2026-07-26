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
import { assertPowerSyncBootstrapReady } from '@/api/highways';
import { coreRuntime } from '@/logic/runtimeRegistry';
import { PowerSyncDatabase } from '@/adapters/powersync/powersync-shim';
import { AppSchema } from '@/adapters/powersync/schema';
import { createSecureDrizzleProxy } from '@/adapters/powersync/secureDrizzleProxy';
export {
  registerPermissionValidator,
  setActiveCapabilityToken,
  registerPolicyVersionHash,
  registerOperationContext,
  resetSecureDrizzleState,
} from '@/adapters/powersync/secureDrizzleProxy';

let _instance: PowerSyncDatabase | null = null;
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
 * Automatically initializes the mock database under server-side Node.js
 * unless a native JSI instance has been injected via setPowerSyncDB().
 */
export function getPowerSyncDB(): PowerSyncDatabase {
  assertBrowserPowerSyncReady();
  if (!_instance) {
    _instance = new PowerSyncDatabase({
      schema: AppSchema as any,
      database: {
        // The SQLite file — separate from expo-sqlite to avoid conflicts
        dbFilename: 'gurudevi-powersync.db',
      },
    });
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
 * at runtime when booting the mobile client. This bypasses the mock server shims.
 */
export function injectNativePowerSyncDB(nativeDb: any, nativeDrizzleDb: any): void {
  _instance = nativeDb;
  _drizzleInstance = createSecureDrizzleProxy(nativeDrizzleDb) as any;
}

/** Call this on logout to clear the local SQLite state. */
export async function disconnectPowerSync(): Promise<void> {
  if (_instance) {
    await _instance.disconnect();
    _instance = null;
    _drizzleInstance = null;
  }
}
