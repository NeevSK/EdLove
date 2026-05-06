export const column = {
  text: '' as string,
  integer: 0 as number,
};

export class Table<TDefinition extends Record<string, unknown> = Record<string, unknown>> {
  constructor(_definition: TDefinition) {}
}

export class Schema<TTables extends Record<string, Table> = Record<string, Table>> {
  readonly types: {
    [K in keyof TTables]: TTables[K] extends Table<infer TDefinition> ? TDefinition : never;
  } = {} as any;

  constructor(_tables: TTables) {}
}

export class PowerSyncDatabase {
  constructor(_options: {
    schema: Schema<Record<string, Table>>;
    database: {
      dbFilename: string;
    };
  }) {}

  connect(_connector: unknown): Promise<void> {
    return Promise.resolve();
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
