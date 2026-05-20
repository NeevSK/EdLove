/**
 * PowerSync Adapter — Public Barrel
 *
 * Import from here, not from individual files.
 * Tree-shaking will eliminate unused exports.
 */

export { disconnectPowerSync, getPowerSyncDB, getDrizzleDB, injectNativePowerSyncDB } from './database';
export type {
  Attendance,
  Classroom,
  MoodLog,
  School,
  Student,
} from './schema';
export {
  useAttendanceForClassroom,
  useMoodLogsForUser,
  usePowerSyncQuery,
  useDrizzleQuery,
  usePowerSyncStatus,
  useStudentsInClassroom,
} from './hooks';
export { PowerSyncGate } from './PowerSyncGate';
export { SupabasePowerSyncConnector } from './SupabasePowerSyncConnector';
export { AppSchema } from './schema';
