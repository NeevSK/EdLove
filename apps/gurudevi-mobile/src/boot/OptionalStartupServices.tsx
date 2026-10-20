import {
  reduceWorkAdmission,
  resolveWorkAdmission,
  type WorkAdmissionState,
} from '@repo/core/efficiency';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { useReality } from '@repo/ui/context/RealityProvider';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  scheduleOptionalStartupWork,
  type OptionalStartupProgress,
  type OptionalStartupTask,
} from '@/boot/optionalStartupWork';

const WARMUPS: readonly OptionalStartupTask[] = [
  {
    id: 'background-sync-registration',
    run: () =>
      import('@/lib/backgroundSync').then(({ registerBackgroundSync }) => registerBackgroundSync()),
  },
  {
    id: 'google-sign-in-configuration',
    run: async () => {
      if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) return;
      const { configureGoogleOneTap } = await import('@/lib/googleSignIn');
      configureGoogleOneTap();
    },
  },
];

// Provisional recovery window; no escalation beyond one optional task is enabled.
const WARMUP_POLICY = { recoveryWindowMs: 30_000 };

export function OptionalStartupServices() {
  const { reality } = useReality();
  const [appState, setAppState] = useState(AppState.currentState);
  const progress = useRef<OptionalStartupProgress>({ started: new Set(), inFlight: null });
  const admission = useRef<WorkAdmissionState | null>(null);

  useEffect(() => {
    const listener = AppState.addEventListener('change', setAppState);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (appState !== 'active' || reality.isBatterySaverMode) return;
    let totalMemory: number | null | undefined;
    try {
      totalMemory = coreRuntime.device.getTotalMemory?.();
    } catch (error) {
      console.warn(
        '[startup] Capacity signal unavailable; retaining conservative warmup budget:',
        error,
      );
    }
    const capacityKnown =
      totalMemory !== null &&
      totalMemory !== undefined &&
      Number.isFinite(totalMemory) &&
      totalMemory > 0;
    return scheduleOptionalStartupWork(WARMUPS, progress.current, {
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: cancelAnimationFrame,
      requestIdle: (callback) => requestIdleCallback(callback),
      cancelIdle: cancelIdleCallback,
      canRun: () => {
        // This phase means the optional warmup lane reached a frame + JS idle
        // boundary; it is not the screen's Observe interactive/TTFD signal.
        admission.current = reduceWorkAdmission(
          admission.current,
          {
            capacityKnown,
            phase: 'settled',
            appState: AppState.currentState === 'active' ? 'active' : 'background',
            pressure: 'unknown',
            observedAt: performance.now(),
          },
          WARMUP_POLICY,
        );
        return (
          !reality.isBatterySaverMode && resolveWorkAdmission(admission.current).optionalWorkAllowed
        );
      },
      onError: (id, error) => console.warn(`[startup] Optional ${id} unavailable:`, error),
    });
  }, [appState, reality.isBatterySaverMode]);

  return null;
}
