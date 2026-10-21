import {
  configHash,
  createGovernorTelemetry,
  createRuntimeController,
  DEFAULT_GOVERNOR_CONFIG,
  type ExperimentAssignment,
  GOVERNOR_POLICY_VERSION,
  type GovernorSnapshot,
  type GovernorTelemetrySink,
  GURUDEVI_LEVERS,
  type RuntimeController,
} from '@repo/core/governor';
import { createContext, type ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { AccessibilityInfo, AppState, type AppStateStatus, View } from 'react-native';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { createRuntimeSensePort, isRuntimeSenseAvailable, readFrameTotals } from '../../modules/runtime-sense';
import { observeLongTasks } from './longTasks';
import { type RuntimeMode, resolveRuntimeMode } from './runtimeMode';

const RuntimeContext = createContext<RuntimeController | null>(null);

/** Touches closer together than this are one interaction; the governor needs presence, not taps. */
const INTERACTION_THROTTLE_MS = 250;

// Unknown or null at launch is treated as active: the app is starting in front of the user,
// and treating it as hidden would force reduced motion until the first change event.
const visibilityOf = (status: AppStateStatus | string | null | undefined) =>
  status === 'background' ? 'background' : status === 'inactive' ? 'inactive' : 'active';

/**
 * Levers that act today, whatever the app's components do. A software lever joins this list
 * only when a consumer applies it; lowering a lever nobody reads costs a stress period and a
 * stack slot and changes nothing, which would push the loop onto the levers that do act.
 */
export const APPLIED_LEVERS: readonly string[] = ['refresh-rate', 'global-motion'];

const sessionId = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');

const memoryBucket = (bytes: number | null) =>
  bytes === null ? 'unknown' : bytes < 3 * 1024 ** 3 ? '<3GB' : bytes < 5 * 1024 ** 3 ? '3-5GB' : bytes < 7 * 1024 ** 3 ? '5-7GB' : '>=7GB';

const now = () => performance.now();

const scheduler = {
  setTimeout: (callback: () => void, delayMs: number) => setTimeout(callback, delayMs),
  clearTimeout: (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

interface RuntimeExecutiveProps {
  readonly children: ReactNode;
  /** Overrides the resolved mode (tests, diagnostics). */
  readonly mode?: RuntimeMode;
  /** The experiment assignment (from `assignExperiment`); its kill switch turns the runtime off. */
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
  /** Levers with a consumer in this build; defaults to the app-wide hardware levers. */
  readonly appliedLevers?: readonly string[];
}

/**
 * Mounts the adaptive runtime around the app. In `off` mode it renders its children and does
 * nothing else. Otherwise it starts the controller, feeds it app state, presence, motion
 * preference and JS long tasks, and applies the one app-wide lever that lives in JS: forced
 * reduced motion for every Reanimated animation that starts while it is set.
 */
export function RuntimeExecutive({ children, mode, assignment, telemetrySink, appliedLevers }: RuntimeExecutiveProps) {
  const [resolved] = useState<RuntimeMode>(() => mode ?? assignment?.runtime ?? resolveRuntimeMode());
  const [controller] = useState<RuntimeController | null>(() => {
    if (resolved === 'off') return null;
    const port = createRuntimeSensePort(now);
    const applied = new Set(appliedLevers ?? APPLIED_LEVERS);
    const config = DEFAULT_GOVERNOR_CONFIG;
    return createRuntimeController({
      port,
      levers: GURUDEVI_LEVERS.filter((lever) => applied.has(lever.id)),
      mode: resolved,
      config,
      now,
      scheduler,
      memorySensing: isRuntimeSenseAvailable,
      telemetry: telemetrySink
        ? createGovernorTelemetry({
            sink: telemetrySink,
            arm: assignment?.arm ?? (resolved === 'active' ? 'treatment' : 'control'),
            experimentKey: assignment?.key ?? `adaptive-runtime-p${GOVERNOR_POLICY_VERSION}`,
            sessionId: sessionId(),
            configHash: configHash(config),
            config,
            readTotals: isRuntimeSenseAvailable ? readFrameTotals : undefined,
            device: {
              ram: memoryBucket(port.capacity.totalMemoryBytes),
              sdk: port.capacity.sdkInt ?? 0,
              max_hz: Math.round(Math.max(0, ...port.capacity.refreshRatesHz)),
              hints: port.capacity.supportsCpuHints,
              sensing: isRuntimeSenseAvailable,
            },
          })
        : undefined,
    });
  });

  useEffect(() => {
    if (!controller) return;
    controller.start();
    controller.dispatch({ type: 'app-state', at: now(), state: visibilityOf(AppState.currentState) });
    const appState = AppState.addEventListener('change', (status) =>
      controller.dispatch({ type: 'app-state', at: now(), state: visibilityOf(status) }),
    );
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduceMotion) =>
      controller.dispatch({ type: 'preferences', at: now(), reduceMotion, fidelity: 'auto' }),
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => controller.dispatch({ type: 'preferences', at: now(), reduceMotion, fidelity: 'auto' }))
      .catch((error: unknown) => console.error('[runtime] reduce-motion query failed', error));
    const stopLongTasks = observeLongTasks((durationMs) =>
      controller.dispatch({ type: 'long-task', at: now(), durationMs }),
    );
    return () => {
      stopLongTasks();
      motion.remove();
      appState.remove();
      controller.stop();
    };
  }, [controller]);

  if (!controller) return <>{children}</>;
  return (
    <RuntimeContext.Provider value={controller}>
      <PresenceBoundary controller={controller}>{children}</PresenceBoundary>
      <GlobalMotion controller={controller} />
    </RuntimeContext.Provider>
  );
}

/** Records that someone touched the screen without taking part in the responder system. */
function PresenceBoundary({ controller, children }: { controller: RuntimeController; children: ReactNode }) {
  const [last] = useState(() => ({ at: Number.NEGATIVE_INFINITY }));
  // Touch start and every move (throttled): a long scroll keeps the gesture alive, so the
  // gesture freeze holds for its whole length. Momentum after the finger lifts is not seen.
  const present = () => {
    const at = now();
    if (at - last.at >= INTERACTION_THROTTLE_MS) {
      last.at = at;
      controller.dispatch({ type: 'interaction', at });
    }
    return false;
  };
  return (
    <View style={{ flex: 1 }} onStartShouldSetResponderCapture={present} onMoveShouldSetResponderCapture={present}>
      {children}
    </View>
  );
}

function GlobalMotion({ controller }: { controller: RuntimeController }) {
  const forced = useSyncExternalStore(controller.subscribe, () => controller.getSnapshot().globalReducedMotion);
  // Mounting the config forces reduced motion; unmounting restores what was there before.
  return forced ? <ReducedMotionConfig mode={ReduceMotion.Always} /> : null;
}

/** The current governor snapshot, or null when the runtime is off. Re-renders on change only. */
export function useGovernorSnapshot(): GovernorSnapshot | null {
  const controller = useContext(RuntimeContext);
  return useSyncExternalStore(
    controller?.subscribe ?? noSubscription,
    () => controller?.getSnapshot() ?? null,
  );
}

/** One lever's applied level (0 = full quality), or 0 when the runtime is off. */
export function useLeverLevel(id: string): number {
  const controller = useContext(RuntimeContext);
  return useSyncExternalStore(
    controller?.subscribe ?? noSubscription,
    () => controller?.getSnapshot().levels[id] ?? 0,
  );
}

const noSubscription = () => () => {};
