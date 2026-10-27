import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import { WASQLiteVFS } from '@powersync/web';
import { AppSchema } from '@repo/core/adapters/powersync/schema';

export class WASQLiteAdapter {
  constructor(private readonly accountId: string) {}

  async createDatabaseFactory(accountId: string = this.accountId) {
    const database = {
      dbFilename: `gurudevi-${accountId}.db`,
      vfs: WASQLiteVFS.OPFSCoopSyncVFS,
      enableMultiTabs: typeof SharedWorker !== 'undefined',
      useWebWorker: true,
      disableSSRWarning: true,
    };

    return {
      schema: new DrizzleAppSchema(AppSchema),
      sourceType: 'database' as const,
      database,
    };
  }
}
