// Type-only shim for environments where `@powersync/react` isn't installed.
// Runtime usage is feature-flagged behind `ENABLE_POWERSYNC`.
declare module '@powersync/react' {
  import * as React from 'react';
  import type { PowerSyncDatabase } from '@powersync/react-native';

  export const PowerSyncContext: React.Context<PowerSyncDatabase>;

  export function useQuery<T = Record<string, unknown>>(
    sql: string,
    parameters?: unknown[],
  ): { data: T[] };

  export function useStatus(): any;
}

