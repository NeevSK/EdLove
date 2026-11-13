/**
 * PowerSync Adapter — Public Barrel
 *
 * Import from here, not from individual files.
 * Tree-shaking will eliminate unused exports.
 */

export { connectPowerSyncRuntime } from '@repo/core/adapters/powersync/connectionLifecycle';
export {
  createSyncConnection,
  type SyncConnection,
  type UploadRejection,
  type UploadRoute,
  type UploadRoutes,
} from '@repo/core/adapters/powersync/syncPipe';
export {
  clearPowerSyncAccount,
  disconnectPowerSync,
  getActivePowerSyncDB,
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
} from '@repo/core/adapters/powersync/liveQueries.react';
export { useTodos, type UseTodosReturn } from '@repo/core/adapters/powersync/todos.react';
export type {
  Attendance,
  Classroom,
  MoodLog,
  School,
  Student,
  Todo,
  TodoList,
} from '@repo/core/adapters/powersync/schema';
export {
  AppSchema,
  isLocalOnlyTable,
  LOCAL_ONLY_TABLES,
} from '@repo/core/adapters/powersync/schema';
export { SingleActivePowerSyncRuntime } from '@repo/core/adapters/powersync/singleActivePowerSyncRuntime';
export { PowerSyncDataAdapter } from '@repo/core/adapters/powersync/syncData.adapter';
export {
  PowerSyncFormsAdapter,
  type ExtendedFormField,
  type ExtendedFormPage,
  type ExtendedFormSchema,
} from '@repo/core/adapters/powersync/forms.adapter';
