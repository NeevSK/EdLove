import { storage } from '@repo/core/lib/storage';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

/** Observes one key on the selected backend without mirroring it into a store. */
export function useStorageString(key: string): string | undefined {
  const subscribe = useCallback((listener: () => void) => storage.subscribe(key, listener), [key]);
  const snapshot = useCallback(() => {
    const value = storage.getString(key) ?? storage.getBoolean(key) ?? storage.getNumber(key);
    return value === undefined ? undefined : String(value);
  }, [key]);
  const value = useSyncExternalStore(subscribe, snapshot, () => undefined);

  useEffect(() => {
    void storage.getStringAsync(key).catch((error: unknown) => {
      console.error('Storage: preference hydration failed', error);
    });
  }, [key]);

  return value;
}
