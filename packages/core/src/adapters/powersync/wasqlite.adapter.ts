import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import { WASQLiteVFS } from '@powersync/web';
import { SupabasePowerSyncConnector } from '@repo/core/adapters/powersync/SupabasePowerSyncConnector';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import type { IDatabasePort } from '@repo/core/logic/ports/database.port';

export class WASQLiteAdapter implements IDatabasePort {
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
      sync: new SupabasePowerSyncConnector(accountId),
    };
  }
}
