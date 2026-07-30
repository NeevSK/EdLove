/**
 * PowerSync Adapter — Public Barrel
 *
 * Import from here, not from individual files.
 * Tree-shaking will eliminate unused exports.
 */

export {
  disconnectPowerSync,
  getDrizzleDB,
  getPowerSyncDB,
  injectNativePowerSyncDB,
} from '@repo/core/adapters/powersync/database';
export {
  useAttendanceForClassroom,
  useDrizzleQuery,
  useMoodLogsForUser,
  usePolicyVersionInvalidation,
  usePowerSyncQuery,
  usePowerSyncStatus,
  useStudentsInClassroom,
} from '@repo/core/adapters/powersync/hooks';
export { PowerSyncGate } from '@repo/core/adapters/powersync/PowerSyncGate';
export { SupabasePowerSyncConnector } from '@repo/core/adapters/powersync/SupabasePowerSyncConnector';
export type {
  Attendance,
  Classroom,
  MoodLog,
  School,
  Student,
} from '@repo/core/adapters/powersync/schema';
export { AppSchema } from '@repo/core/adapters/powersync/schema';
