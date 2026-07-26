import { useCallback, useEffect, useMemo, useOptimistic, useTransition } from 'react';
import { isQueuedDeviceSecurityMutation } from '@/lib/sync/deviceSecurityIntents';
import { useMutationQueue } from '@/lib/sync/useMutationQueue';
import { useDeviceSecurityStore } from '@/store/useDeviceSecurityStore';

/**
 * useDeviceSecurity
 *
 * The Sovereign Connector for Device Trust.
 * Now acts as a lightweight interface to the global DeviceSecurityStore.
 */
export function useDeviceSecurity() {
  const {
    devices,
    events,
    authEvents,
    sessions,
    currentDevice,
    loading,
    error,
    fetchSecuritySummary,
    revokeSession,
    unlinkDevice,
    revokeAllSessions,
    trustDevice,
  } = useDeviceSecurityStore();

  const [isPending, startTransition] = useTransition();

  // Optimistic tracking for local feedback
  const [optimisticDevices, addOptimisticDevice] = useOptimistic(
    devices,
    (state, action: { type: 'unlink'; deviceId: string }) => {
      if (action.type === 'unlink') {
        return state.filter((d) => d.deviceId !== action.deviceId);
      }
      return state;
    },
  );

  const [optimisticSessions, addOptimisticSession] = useOptimistic(
    sessions,
    (state, action: { type: 'revoke'; sessionId: string }) => {
      if (action.type === 'revoke') {
        return state.map((s) =>
          s.sessionId === action.sessionId ? { ...s, status: 'revoked' as const } : s,
        );
      }
      return state;
    },
  );

  // Sync with mutation queue for offline-resilience awareness
  const queueLength = useMutationQueue(
    (s) => s.queue.filter(isQueuedDeviceSecurityMutation).length,
  );

  useEffect(() => {
    void fetchSecuritySummary();
  }, [fetchSecuritySummary]);

  // Actions wrapped in transitions and optimistic updates
  const handleRevokeSession = useCallback(
    async (sessionId: string) => {
      startTransition(() => {
        addOptimisticSession({ type: 'revoke', sessionId });
        void revokeSession(sessionId);
      });
    },
    [revokeSession, addOptimisticSession],
  );

  const handleUnlinkDevice = useCallback(
    async (deviceId: string) => {
      startTransition(() => {
        addOptimisticDevice({ type: 'unlink', deviceId });
        void unlinkDevice(deviceId);
      });
    },
    [unlinkDevice, addOptimisticDevice],
  );

  // Health Score (Derived Intelligence)
  const healthScore = useMemo(() => {
    if (loading && devices.length === 0) return null;
    let score = 100;

    // Deduct for untrusted active devices
    const untrustedCount = devices.filter((d) => !d.isTrusted).length;
    score -= untrustedCount * 15;

    // Deduct for multiple active sessions on different platforms
    const activeSessions = sessions.filter((s) => s.status === 'active');
    const platforms = new Set(activeSessions.map((s) => s.platform));
    if (platforms.size > 2) score -= 10;

    // Deduct for stale devices
    const staleCount = devices.filter((d) => d.trustStatus === 'stale').length;
    score -= staleCount * 5;

    return Math.max(0, score);
  }, [devices, sessions, loading]);

  return {
    devices: optimisticDevices,
    events,
    sessions: optimisticSessions,
    authEvents,
    currentDevice,
    loading: loading || isPending,
    error,
    refresh: fetchSecuritySummary,
    revokeSession: handleRevokeSession,
    unlinkDevice: handleUnlinkDevice,
    revokeAllSessions,
    trustDevice,
    syncPending: queueLength > 0,
    healthScore,
  };
}
