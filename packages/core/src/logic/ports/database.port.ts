export type PowerSyncDatabaseFactory = {
  schema: any;
  database: any;
  /** The v2 constructor key used for the database source. */
  sourceType: 'database' | 'factory';
  sync?: any;
};

export interface IDatabasePort {
  createDatabaseFactory(accountId: string): Promise<PowerSyncDatabaseFactory>;
}
