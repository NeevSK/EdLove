import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import { WASQLiteOpenFactory, WASQLiteVFS } from '@powersync/web';
import type { IDatabasePort } from '../../logic/ports/database.port';
import { SupabasePowerSyncConnector } from './SupabasePowerSyncConnector';
import { AppSchema } from './schema';

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
