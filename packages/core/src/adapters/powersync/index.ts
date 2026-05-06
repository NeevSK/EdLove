/**
 * PowerSync Adapter — Public Barrel
 *
 * Import from here, not from individual files.
 * Tree-shaking will eliminate unused exports.
 */
export { AppSchema } from './schema';
export type { Database } from './schema';
export { getPowerSyncDB, disconnectPowerSync } from './database';
export { SupabasePowerSyncConnector } from './SupabasePowerSyncConnector';
export { PowerSyncGate } from './PowerSyncGate';
export {
  usePowerSyncQuery,
  usePowerSyncStatus,
  useAttendanceForClassroom,
  useStudentsInClassroom,
  useMoodLogsForStudent,
} from './hooks';
export type {
  AttendanceRow,
  StudentRow,
  ClassroomRow,
  MoodLogRow,
  SchoolRow,
} from './hooks';
