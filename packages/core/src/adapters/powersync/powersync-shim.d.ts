// Type-only shim to allow `tsc --noEmit` in environments where the optional
// PowerSync runtime dependency isn't installed.
//
// Runtime usage is still feature-flagged; production builds should include the
// real `@powersync/react-native` package.
declare module '@powersync/react-native' {
  export const column: {
    text: any;
    integer: any;
  };

  export class Table {
    constructor(definition: Record<string, any>);
  }

  export class Schema {
    constructor(tables: Record<string, any>);
    types: any;
  }

  export class PowerSyncDatabase {
    constructor(options: any);
    connect(connector: any): Promise<void>;
    disconnect(): Promise<void>;
  }

  export type CrudEntry = {
    id: string;
    table: string;
    op: 'PUT' | 'PATCH' | 'DELETE';
    opData?: Record<string, any> | null;
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
}
