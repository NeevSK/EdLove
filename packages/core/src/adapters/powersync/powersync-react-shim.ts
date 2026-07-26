import * as React from 'react';
import type { PowerSyncDatabase } from '@/adapters/powersync/powersync-shim';

export const PowerSyncContext = React.createContext<PowerSyncDatabase | null>(null);

export function useQuery<T = Record<string, unknown>>(
  _sql: string,
  _parameters?: unknown[],
): { data: T[] } {
  return { data: [] };
}

export function useStatus(): {
  connected: boolean;
  connecting: boolean;
  hasSynced: boolean;
} {
  return { connected: false, connecting: false, hasSynced: false };
}
