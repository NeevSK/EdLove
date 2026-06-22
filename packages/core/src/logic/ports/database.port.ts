export type PowerSyncDatabaseFactory = {
  schema: any;
  database: any;
  sync?: any;
};

export interface IDatabasePort {
  createDatabaseFactory(accountId: string): Promise<PowerSyncDatabaseFactory>;
}
