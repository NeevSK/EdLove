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
import { useStore } from '../../store/useStore';
import { ErrorCategory, SovereignError } from '../../types/Errors';
import { PowerSyncDatabase } from './powersync-shim';
import { AppSchema } from './schema';

let _instance: PowerSyncDatabase | null = null;
let _drizzleInstance: ReturnType<typeof wrapPowerSyncWithDrizzle<typeof AppSchema>> | null = null;

let _permissionValidator: ((params: any) => Promise<boolean>) | null = null;

export function registerPermissionValidator(validator: (params: any) => Promise<boolean>): void {
  _permissionValidator = validator;
}

/**
 * Creates an isomorphic Proxy over the Drizzle database instance to intercept
 * all asynchronous mutations, verifying them against offline Cedar snapshots before execution.
 */
function createSecureDrizzleProxy(db: any): any {
  if (!db) return db;
  return new Proxy(db, {
    get(target, prop, receiver) {
      const originalValue = Reflect.get(target, prop, receiver);

      if (prop === 'insert' || prop === 'update' || prop === 'delete') {
        return (tableObj: any) => {
          const tableName = tableObj?._?.name || tableObj?.name || 'unknown_table';
          const action = prop === 'insert' ? 'create' : prop === 'update' ? 'update' : 'delete';
          const builder = originalValue.apply(target, [tableObj]);

          return new Proxy(builder, {
            get(builderTarget, builderProp, builderReceiver) {
              const originalBuilderValue = Reflect.get(builderTarget, builderProp, builderReceiver);

              if (builderProp === 'execute' || builderProp === 'then') {
                return (...args: any[]) => {
                  if (!_permissionValidator) {
                    // Fallback to bypass for non-mobile environments (e.g. Hono server shims, test runners)
                    if (builderProp === 'then') {
                      const promise = originalBuilderValue.apply(builderTarget, []);
                      return promise.then(...args);
                    }
                    return originalBuilderValue.apply(builderTarget, args);
                  }

                  const state = useStore.getState();
                  const userContext = {
                    userId: state.user?.id || null,
                    email: state.user?.email || null,
                    schoolId: state.user?.school_id || null,
                    activeBond: state.activeBond as any,
                    isAnonymous: !state.user || !!state.user?.is_anonymous,
                  };

                  const resourceType =
                    tableName.charAt(0).toUpperCase() +
                    tableName
                      .slice(1)
                      .replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());

                  return _permissionValidator({
                    action: action as any,
                    resourceType: resourceType as any,
                    resourceId: 'local-drizzle-write-interceptor',
                    userContext,
                  }).then((isAllowed) => {
                    if (!isAllowed) {
                      throw new SovereignError({
                        title: 'Unauthorized Local Mutation',
                        detail: `Access denied. Direct local database write to table "${tableName}" is blocked for action "${action}".`,
                        status: 403,
                        category: ErrorCategory.AUTHORIZATION,
                        code: 'LOCAL_WRITE_VIOLATION',
                      });
                    }
                    if (builderProp === 'then') {
                      const promise = originalBuilderValue.apply(builderTarget, []);
                      return promise.then(...args);
                    }
                    return originalBuilderValue.apply(builderTarget, args);
                  });
                };
              }
              return typeof originalBuilderValue === 'function'
                ? originalBuilderValue.bind(builderTarget)
                : originalBuilderValue;
            },
          });
        };
      }

      if (prop === 'transaction') {
        return (callback: any, config: any) => {
          const secureCallback = async (tx: any) => {
            const secureTx = createSecureDrizzleProxy(tx);
            return callback(secureTx);
          };
          return originalValue.apply(target, [secureCallback, config]);
        };
      }

      return typeof originalValue === 'function' ? originalValue.bind(target) : originalValue;
    },
  });
}

/**
 * Returns the active PowerSync database instance.
 * Automatically initializes the mock database under server-side Node.js
 * unless a native JSI instance has been injected via setPowerSyncDB().
 */
export function getPowerSyncDB(): PowerSyncDatabase {
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
