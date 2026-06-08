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
} from './database';
export {
  useAttendanceForClassroom,
  useDrizzleQuery,
  useMoodLogsForUser,
  usePowerSyncQuery,
  usePowerSyncStatus,
  useStudentsInClassroom,
} from './hooks';
export { PowerSyncGate } from './PowerSyncGate';
export { SupabasePowerSyncConnector } from './SupabasePowerSyncConnector';
export type {
  Attendance,
  Classroom,
  MoodLog,
  School,
  Student,
} from './schema';
export { AppSchema } from './schema';
