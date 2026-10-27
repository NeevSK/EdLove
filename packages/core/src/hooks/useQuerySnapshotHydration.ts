import { storage } from '@repo/core/lib/storage';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/** Hydrates an existing Query owner without replacing a newer remote result. */
export function useQuerySnapshotHydration<T>(
  queryKey: QueryKey,
  storageKey: string,
  decode: (raw: string) => { data: T; savedAt: number },
  enabled = true,
): boolean {
  const client = useQueryClient();
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void storage
      .getStringAsync(storageKey)
      .then((raw) => {
        if (!active || !raw) return;
        const saved = decode(raw);
        if (client.getQueryData(queryKey) === undefined)
          client.setQueryData(queryKey, saved.data, { updatedAt: saved.savedAt });
      })
      .catch((error: unknown) =>
        console.warn('[Query] Saved snapshot could not be read; original record retained.', error),
      )
      .finally(() => {
        if (active) setHydratedKey(storageKey);
      });
    return () => {
      active = false;
    };
  }, [client, queryKey, storageKey, decode, enabled]);
  return !enabled || hydratedKey === storageKey;
}
