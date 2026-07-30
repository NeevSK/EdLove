import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import { WASQLiteOpenFactory, WASQLiteVFS } from '@powersync/web';
import type { IDatabasePort } from '@repo/core/logic/ports/database.port';
import { SupabasePowerSyncConnector } from '@repo/core/adapters/powersync/SupabasePowerSyncConnector';
import { AppSchema } from '@repo/core/adapters/powersync/schema';

export class WASQLiteAdapter implements IDatabasePort {
  constructor(private readonly accountId: string) {}

  async createDatabaseFactory(accountId: string = this.accountId) {
    const factory = new WASQLiteOpenFactory({
      dbFilename: `gurudevi-${accountId}.db`,
      vfs: WASQLiteVFS.OPFSCoopSyncVFS,
      flags: {
        enableMultiTabs: typeof SharedWorker !== 'undefined',
        useWebWorker: true,
        broadcastLogs: true,
        disableSSRWarning: true,
      },
    });

    return {
      schema: new DrizzleAppSchema(AppSchema),
      database: factory,
      sync: new SupabasePowerSyncConnector(),
    };
  }
}
