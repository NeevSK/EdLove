// Headless SQLite mock for Vitest architecture tests
export const openDatabaseSync = () => ({
  execAsync: async () => [],
  runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
  getFirstAsync: async () => null,
  getAllAsync: async () => [],
});

export const SQLiteProvider = () => null;

export default {
  openDatabaseSync,
  SQLiteProvider,
};
