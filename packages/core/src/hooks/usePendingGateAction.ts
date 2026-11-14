import { pendingGate } from '@repo/core/effect/bindings/deviceRecords';
import type { PendingGateAction } from '@repo/core/lib/pendingGateAction.adapter';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UsePendingGateActionResult {
  action: PendingGateAction | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  set: (action: PendingGateAction) => Promise<void>;
  clear: () => Promise<void>;
}

export function usePendingGateAction(): UsePendingGateActionResult {
  const [action, setActionState] = useState<PendingGateAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const next = await pendingGate.get();
    setActionState(next);
    setIsLoading(false);
  }, []);

  const set = useCallback(async (next: PendingGateAction) => {
    await pendingGate.set(next);
    setActionState(next);
  }, []);

  const clear = useCallback(async () => {
    await pendingGate.clear();
    setActionState(null);
  }, []);

  useEffect(() => {
    refresh().catch((e) => {
      console.error('PendingGateAction: Failed to load on mount', e);
    });
  }, [refresh]);

  return useMemo(
    () => ({ action, isLoading, refresh, set, clear }),
    [action, isLoading, refresh, set, clear],
  );
}
