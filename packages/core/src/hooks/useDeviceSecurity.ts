import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutationQueue } from '../lib/sync/useMutationQueue';
import {
  type DeviceSecurityEvent,
  type DeviceSecuritySession,
  type DeviceTrustSummary,
  deviceTrustAPI,
} from '../api/deviceTrust';
import { isQueuedDeviceSecurityMutation } from '../lib/sync/deviceSecurityIntents';

export function useDeviceSecurity(limit = 50) {
  const pendingSecurityMutations = useMutationQueue((state) =>
    state.queue.filter(isQueuedDeviceSecurityMutation),
  );
  const [devices, setDevices] = useState<DeviceTrustSummary[]>([]);
  const [events, setEvents] = useState<DeviceSecurityEvent[]>([]);
  const [sessions, setSessions] = useState<DeviceSecuritySession[]>([]);
  const [currentDevice, setCurrentDevice] = useState<DeviceTrustSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const [nextDevices, nextEvents, nextSessions, nextCurrentDevice] = await Promise.all([
      deviceTrustAPI.listMyDevices(),
      deviceTrustAPI.listMySecurityAuditEvents(limit),
      deviceTrustAPI.listMySecuritySessions(limit),
      deviceTrustAPI.getCurrentDeviceTrust(),
    ]);

    setDevices(nextDevices);
    setEvents(nextEvents);
    setSessions(nextSessions);
    setCurrentDevice(nextCurrentDevice);
  }, [limit]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await refresh();
      } catch (nextError) {
        if (!cancelled) {
          const message =
            nextError instanceof Error ? nextError.message : 'Failed to load device security data.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })().catch((e) => {
      console.error('DeviceSecurity: Failed to load security state', e);
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return useMemo(
    () => ({
      devices,
      events,
      sessions,
      currentDevice,
      loading,
      error,
      refresh,
      pendingSecuritySyncCount: pendingSecurityMutations.length,
      unlinkDevice: deviceTrustAPI.unlinkMyDevice,
      revokeSession: deviceTrustAPI.revokeMySecuritySession,
      revokeOtherSessions: deviceTrustAPI.revokeMyOtherSecuritySessions,
    }),
    [
      devices,
      events,
      sessions,
      currentDevice,
      loading,
      error,
      refresh,
      pendingSecurityMutations.length,
    ],
  );
}
