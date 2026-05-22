export const column = {
  text: '' as string,
  integer: 0 as number,
};

export class Table<_TDefinition extends Record<string, unknown> = Record<string, unknown>> {}

export class Schema<TTables extends Record<string, Table> = Record<string, Table>> {
  readonly types: {
    [K in keyof TTables]: TTables[K] extends Table<infer TDefinition> ? TDefinition : never;
  } = {} as unknown as {
    [K in keyof TTables]: TTables[K] extends Table<infer TDefinition> ? TDefinition : never;
  };
}

export class PowerSyncDatabase {
  constructor(_options?: { schema: unknown; database: { dbFilename: string } }) {
    // Mock constructor - accepts options to match real PowerSyncDatabase API
  }

  connect(_connector: unknown): Promise<void> {
    return Promise.resolve();
  }

  async writeLock<T>(callback: () => T | Promise<T>): Promise<T> {
    return await callback();
  }

  async readLock<T>(callback: () => T | Promise<T>): Promise<T> {
    return await callback();
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

export type CrudEntry = {
  id: string;
  table: string;
  op: 'PUT' | 'PATCH' | 'DELETE';
  opData?: Record<string, unknown> | null;
};

export type PowerSyncCredentials = { endpoint: string; token: string };

export interface AbstractPowerSyncDatabase {
  getCrudBatch(limit: number): Promise<{
    crud: CrudEntry[];
    complete(): Promise<void>;
  }>;
}

export interface PowerSyncBackendConnector {
  fetchCredentials(): Promise<PowerSyncCredentials>;
  uploadData(database: AbstractPowerSyncDatabase): Promise<void>;
}
