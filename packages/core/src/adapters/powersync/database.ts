/**
 * PowerSync Database Instance — May 2026
 *
 * Singleton PowerSyncDatabase with the AppSchema.
 * Exported as a lazy singleton — only initialised when first accessed.
 *
 * Import pattern:
 *   import { getPowerSyncDB } from '@repo/core/sync';
 *   const db = getPowerSyncDB();
 *   const rows = await db.getAll('SELECT * FROM attendance WHERE classroom_id = ?', [classroomId]);
 */
import { PowerSyncDatabase } from './powersync-shim';
import { AppSchema } from './schema';

let _instance: PowerSyncDatabase | null = null;

export function getPowerSyncDB(): PowerSyncDatabase {
  if (!_instance) {
    _instance = new PowerSyncDatabase({
      schema: AppSchema,
      database: {
        // The SQLite file — separate from expo-sqlite to avoid conflicts
        dbFilename: 'gurudevi-powersync.db',
      },
    });
  }
  return _instance;
}

/** Call this on logout to clear the local SQLite state. */
export async function disconnectPowerSync(): Promise<void> {
  if (_instance) {
    await _instance.disconnect();
    _instance = null;
  }
}
