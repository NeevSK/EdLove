import type { PendingGateAction } from '@repo/core/lib/pendingGateAction';
import {
  clearPendingGateAction,
  getPendingGateAction,
  setPendingGateAction,
} from '@repo/core/lib/pendingGateAction';
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
    const next = await getPendingGateAction();
    setActionState(next);
    setIsLoading(false);
  }, []);

  const set = useCallback(async (next: PendingGateAction) => {
    await setPendingGateAction(next);
    setActionState(next);
  }, []);

  const clear = useCallback(async () => {
    await clearPendingGateAction();
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
