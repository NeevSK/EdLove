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
} from '@/adapters/powersync/database';
export {
  useAttendanceForClassroom,
  useDrizzleQuery,
  useMoodLogsForUser,
  usePolicyVersionInvalidation,
  usePowerSyncQuery,
  usePowerSyncStatus,
  useStudentsInClassroom,
} from '@/adapters/powersync/hooks';
export { PowerSyncGate } from '@/adapters/powersync/PowerSyncGate';
export { SupabasePowerSyncConnector } from '@/adapters/powersync/SupabasePowerSyncConnector';
export type {
  Attendance,
  Classroom,
  MoodLog,
  School,
  Student,
} from '@/adapters/powersync/schema';
export { AppSchema } from '@/adapters/powersync/schema';
