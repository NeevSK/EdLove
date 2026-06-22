export const WASQLiteVFS = {
  OPFSCoopSyncVFS: 'OPFSCoopSyncVFS',
} as const;

export class WASQLiteOpenFactory {
  constructor(_options: unknown) {}
}

export class PowerSyncDatabase {
  constructor(_options: unknown) {}
  connect(_connector: unknown): Promise<void> {
    return Promise.resolve();
  }
  disconnect(): Promise<void> {
    return Promise.resolve();
  }
  async writeLock<T>(callback: () => T | Promise<T>): Promise<T> {
    return await callback();
  }
  async readLock<T>(callback: () => T | Promise<T>): Promise<T> {
    return await callback();
  }
}
