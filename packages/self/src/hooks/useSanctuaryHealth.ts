import { inMemoryHealthAdapter } from '@repo/self/lib/health/InMemoryHealthAdapter';
import type { RecoverySignal, SovereignHealthPort } from '@repo/self/types/healthPort';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSanctuaryHealthReturn {
  mindfulMinutesToday: number;
  recoverySignal: RecoverySignal | null;
  isLoading: boolean;
  recordSession: (durationSeconds: number) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * useSanctuaryHealth
 *
 * Sovereign domain hook connecting the Self floor to physical wellbeing metrics.
 * Uses SovereignHealthPort (Hexagonal Architecture) with zero native dependencies.
 * Ref-stabilized to avoid unstable function pointer re-render cascades.
 */
export function useSanctuaryHealth(
  port: SovereignHealthPort = inMemoryHealthAdapter,
): UseSanctuaryHealthReturn {
  const [mindfulMinutesToday, setMindfulMinutesToday] = useState<number>(0);
  const [recoverySignal, setRecoverySignal] = useState<RecoverySignal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const portRef = useRef(port);
  portRef.current = port;

  const refresh = useCallback(async () => {
    try {
      const activePort = portRef.current;
      const [minutes, signal] = await Promise.all([
        activePort.getMindfulMinutesToday(),
        activePort.getRecoverySignal(),
      ]);
      setMindfulMinutesToday(minutes);
      setRecoverySignal(signal);
    } catch (error) {
      console.warn('[useSanctuaryHealth] Failed to sync health metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordSession = useCallback(
    async (durationSeconds: number) => {
      try {
        await portRef.current.recordMindfulSession(durationSeconds);
        await refresh();
      } catch (error) {
        console.warn('[useSanctuaryHealth] Failed to record mindful session:', error);
      }
    },
    [refresh],
  );

  return {
    mindfulMinutesToday,
    recoverySignal,
    isLoading,
    recordSession,
    refresh,
  };
}
