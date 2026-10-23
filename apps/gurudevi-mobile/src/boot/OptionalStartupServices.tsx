import {
  reclaimHermesMemory,
  reduceWorkAdmission,
  resolveWorkAdmission,
  type WorkAdmissionPhase,
  type WorkAdmissionState,
} from '@repo/core/efficiency';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { useReality } from '@repo/ui/context/RealityProvider';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  type OptionalStartupProgress,
  type OptionalStartupTask,
  scheduleOptionalStartupWork,
} from '@/boot/optionalStartupWork';
import {
  recordOptionalWorkFinished,
  recordRuntimeAdmission,
  recordRuntimeConditionsChanged,
} from '@/boot/runtimeGovernorTelemetry';
import { createRuntimePressureRecovery } from '@/boot/runtimePressureRecovery';
import { recordDevelopmentTrace } from '@/boot/startupTelemetry';
import { type NativePressure, runtimePressure } from '../../modules/runtime-pressure';

const WARMUPS = [
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
] as const satisfies readonly OptionalStartupTask[];

// Provisional recovery window; no escalation beyond one optional task is enabled.
const WARMUP_POLICY = { recoveryWindowMs: 30_000 };

export function OptionalStartupServices({ phase }: { phase: Exclude<WorkAdmissionPhase, 'boot'> }) {
  const { reality } = useReality();
  const [appState, setAppState] = useState(AppState.currentState);
  const [pressureSignals, setPressureSignals] = useState<{
    memory: NativePressure;
    thermal: NativePressure;
  }>({ memory: 'unknown', thermal: 'unknown' });
  const progress = useRef<OptionalStartupProgress>({ started: new Set(), inFlight: null });
  const admission = useRef<WorkAdmissionState | null>(null);

  useEffect(() => {
    const listener = AppState.addEventListener('change', setAppState);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    recordRuntimeConditionsChanged({
      appState: appState === 'active' ? 'active' : 'background',
      batterySaver: reality.isBatterySaverMode,
      memoryPressure: pressureSignals.memory,
      thermalPressure: pressureSignals.thermal,
      pressure: combinePressure(pressureSignals.memory, pressureSignals.thermal),
    });
  }, [appState, pressureSignals, reality.isBatterySaverMode]);

  useEffect(() => {
    if (!runtimePressure) return;
    const recovery = createRuntimePressureRecovery(
      setPressureSignals,
      WARMUP_POLICY.recoveryWindowMs,
    );
    const updatePressure =
      (source: 'native-event' | 'native-snapshot') =>
      (snapshot: { memory: NativePressure; thermal: NativePressure }) => {
        const startedAt = __DEV__ ? performance.now() : null;
        recovery.update(snapshot);
        if (snapshot.memory === 'constrained' || snapshot.memory === 'severe') {
          reclaimHermesMemory({
            severity: snapshot.memory,
            reason: `native-pressure-${source}`,
            forceGC: true,
          });
        }
        if (startedAt !== null) {
          recordDevelopmentTrace({
            category: 'runtime-pressure',
            source,
            memory: snapshot.memory,
            thermal: snapshot.thermal,
            processing_duration_ms: Math.max(0, performance.now() - startedAt),
          });
        }
      };
    const subscription = runtimePressure.addListener(updatePressure('native-event'));
    const snapshotStartedAt = __DEV__ ? performance.now() : null;
    void runtimePressure
      .getSnapshotAsync()
      .then((snapshot) => {
        if (snapshotStartedAt !== null) {
          recordDevelopmentTrace({
            category: 'runtime-pressure',
            source: 'native-snapshot',
            state: 'completed',
            duration_ms: Math.max(0, performance.now() - snapshotStartedAt),
          });
        }
        updatePressure('native-snapshot')(snapshot);
      })
      .catch((error: unknown) => {
        if (snapshotStartedAt !== null) {
          recordDevelopmentTrace({
            category: 'runtime-pressure',
            source: 'native-snapshot',
            state: 'failed',
            duration_ms: Math.max(0, performance.now() - snapshotStartedAt),
          });
        }
        console.warn('[runtime-governor] Native pressure snapshot unavailable:', error);
      });
    return () => {
      subscription.remove();
      recovery.dispose();
    };
  }, []);

  useEffect(() => {
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
    const observeAdmission = () => {
      const decisionStartedAt = __DEV__ ? performance.now() : null;
      admission.current = reduceWorkAdmission(
        admission.current,
        {
          capacityKnown,
          phase,
          appState: appState === 'active' ? 'active' : 'background',
          pressure: combinePressure(pressureSignals.memory, pressureSignals.thermal),
          observedAt: performance.now(),
        },
        WARMUP_POLICY,
      );
      const decision = resolveWorkAdmission(admission.current);
      const allowed = !reality.isBatterySaverMode && decision.optionalWorkAllowed;
      if (decisionStartedAt !== null) {
        recordDevelopmentTrace({
          category: 'governor-overhead',
          operation: 'admission-evaluation',
          duration_ms: Math.max(0, performance.now() - decisionStartedAt),
        });
      }
      recordRuntimeAdmission({
        phase: admission.current.phase,
        capacityKnown: admission.current.capacityKnown,
        appState: admission.current.appState,
        pressure: admission.current.pressure,
        batterySaver: reality.isBatterySaverMode,
        optionalCap: allowed ? decision.maxOptionalConcurrency : 0,
        allowed,
        reason: reality.isBatterySaverMode ? 'battery-saver' : decision.reason,
      });
      if (__DEV__) {
        recordDevelopmentTrace({
          category: 'admission',
          phase: admission.current.phase,
          app_state: admission.current.appState,
          pressure_bucket: admission.current.pressure,
          capacity_known: admission.current.capacityKnown,
          battery_saver: reality.isBatterySaverMode,
          optional_cap: allowed ? decision.maxOptionalConcurrency : 0,
          allowed,
          reason: reality.isBatterySaverMode ? 'battery-saver' : decision.reason,
          queue_depth: WARMUPS.filter((task) => !progress.current.started.has(task.id)).length,
        });
      }
      return allowed;
    };
    if (!observeAdmission()) return;

    const measuredWarmups = WARMUPS.map((task) => ({
      ...task,
      run: async () => {
        const startedAt = performance.now();
        try {
          await task.run();
          recordOptionalWorkFinished({
            task: task.id,
            outcome: 'complete',
            durationMs: performance.now() - startedAt,
          });
        } catch (error) {
          recordOptionalWorkFinished({
            task: task.id,
            outcome: 'failed',
            durationMs: performance.now() - startedAt,
          });
          throw error;
        }
      },
    }));
    return scheduleOptionalStartupWork(measuredWarmups, progress.current, {
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: cancelAnimationFrame,
      requestIdle: (callback) => requestIdleCallback(callback),
      cancelIdle: cancelIdleCallback,
      canRun: observeAdmission,
      now: () => performance.now(),
      onTrace: __DEV__
        ? (event) => recordDevelopmentTrace({ category: 'optional-queue', ...event })
        : undefined,
      onError: (id, error) => console.warn(`[startup] Optional ${id} unavailable:`, error),
    });
  }, [appState, phase, pressureSignals, reality.isBatterySaverMode]);

  return null;
}

function combinePressure(memory: NativePressure, thermal: NativePressure): NativePressure {
  if (memory === 'severe' || thermal === 'severe') return 'severe';
  if (memory === 'constrained' || thermal === 'constrained') return 'constrained';
  if (memory === 'normal' && thermal === 'normal') return 'normal';
  return 'unknown';
}
