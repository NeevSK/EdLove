import { isQueuedDeviceSecurityMutation } from '@repo/core/lib/sync/deviceSecurityIntents';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { deviceSecurity } from '@repo/core/logic/managers/factory';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCallback, useMemo, useState } from 'react';
import { useScopedDeviceSecurity } from '@repo/core/hooks/useScopedDeviceSecurity';

export async function completeDeviceSecurityCommand<T>(
  operation: () => Promise<{ queued: boolean; data: T }>,
  refresh: () => Promise<void>,
): Promise<{ queued: boolean; data: T }> {
  const result = await operation();
  if (!result.queued) await refresh();
  return result;
}

/**
 * useDeviceSecurity
 *
 * The device-security summary is Query-owned. Mutations remain on the
 * manager/outbox path so a cache never becomes a security authority.
 */
export function useDeviceSecurity() {
  const requestedPrincipalId = useAuthStore((state) => state.user?.id ?? null);
  const { scope, summary, isLoading, error: readError, refresh } = useScopedDeviceSecurity(
    requestedPrincipalId,
  );
  const [commandError, setCommandError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const devices = summary?.devices ?? [];
  const events = summary?.events ?? [];
  const authEvents = summary?.authEvents ?? [];
  const sessions = summary?.sessions ?? [];
  const currentDevice = summary?.currentDevice ?? null;

  // Sync with mutation queue for offline-resilience awareness
  const queueLength = useMutationQueue(
    (s) => s.queue.filter(isQueuedDeviceSecurityMutation).length,
  );

  const runCommand = useCallback(
    async <T,>(operation: () => Promise<{ queued: boolean; data: T }>) => {
      if (!scope) throw new Error('An authenticated device-security scope is required.');
      setCommandError(null);
      setIsMutating(true);
      try {
        return await completeDeviceSecurityCommand(operation, refresh);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Device-security action failed.';
        setCommandError(message);
        throw error;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, scope],
  );

  const revokeSession = useCallback(
    (sessionId: string) => runCommand(() => deviceSecurity.revokeSession(sessionId)),
    [runCommand],
  );
  const unlinkDevice = useCallback(
    (deviceId: string) => runCommand(() => deviceSecurity.unlinkDevice(deviceId)),
    [runCommand],
  );
  const revokeAllSessions = useCallback(
    () => runCommand(() => deviceSecurity.revokeAllSessions()),
    [runCommand],
  );
  const trustDevice = useCallback(
    (deviceId: string) => runCommand(() => deviceSecurity.trustDevice(deviceId)),
    [runCommand],
  );

  // Health Score (Derived Intelligence)
  const healthScore = useMemo(() => {
    if (!summary) return null;
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
  }, [devices, sessions, summary]);

  return {
    devices,
    events,
    sessions,
    authEvents,
    currentDevice,
    loading: isLoading || isMutating,
    error: readError ?? commandError,
    refresh,
    revokeSession,
    unlinkDevice,
    revokeAllSessions,
    trustDevice,
    syncPending: queueLength > 0,
    healthScore,
  };
}
