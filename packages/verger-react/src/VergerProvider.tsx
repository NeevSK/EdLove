import {
  createGovernorTelemetry,
  createRuntimeController,
  type ExperimentAssignment,
  type GovernorMode,
  type GovernorSnapshot,
  type GovernorTelemetrySink,
  type RuntimeController,
  type RuntimePort,
  type VergerHost,
} from '@repo/verger-core';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { AccessibilityInfo, AppState, type AppStateStatus, View } from 'react-native';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { observeLongTasks } from './longTasks';

/** `off` runs nothing; `shadow` senses and decides but applies nothing new; `active` applies. */
export type VergerMode = 'off' | GovernorMode;

const VergerContext = createContext<RuntimeController | null>(null);

/** Touches closer together than this are one interaction; verger needs presence, not taps. */
const INTERACTION_THROTTLE_MS = 250;

// Unknown or null at launch is treated as active: the app is starting in front of the user,
// and treating it as hidden would force reduced motion until the first change event.
const visibilityOf = (status: AppStateStatus | string | null | undefined) =>
  status === 'background' ? 'background' : status === 'inactive' ? 'inactive' : 'active';

const sessionId = () =>
  Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');

const memoryBucket = (bytes: number | null) =>
  bytes === null
    ? 'unknown'
    : bytes < 3 * 1024 ** 3
      ? '<3GB'
      : bytes < 5 * 1024 ** 3
        ? '3-5GB'
        : bytes < 7 * 1024 ** 3
          ? '5-7GB'
          : '>=7GB';

const now = () => performance.now();

const scheduler = {
  setTimeout: (callback: () => void, delayMs: number) => setTimeout(callback, delayMs),
  clearTimeout: (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export interface VergerProviderProps {
  readonly children: ReactNode;
  /** The host's definition (`defineHost`): its levers, rules and thresholds. */
  readonly host: VergerHost;
  /** Created lazily, once, only when the mode is not off (so `off` never touches native code). */
  readonly createPort: (now: () => number) => RuntimePort;
  readonly mode: VergerMode;
  /** The experiment assignment, if any; its arm and key label telemetry. */
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
  /** Native cumulative frame totals, for unbiased telemetry summaries. */
  readonly readTotals?: () => {
    readonly frames: number;
    readonly missedVsyncs: number;
    readonly costMs: number;
  };
  /** Whether the port senses memory (absence of trims then means normal). */
  readonly memorySensing?: boolean;
}

/**
 * Mounts verger around an app. In `off` mode it renders its children and does nothing else.
 * Otherwise it starts the runtime loop, feeds it app state, presence, motion preference and JS
 * long tasks, and applies the app-wide lever that lives in JavaScript: forced reduced motion
 * for every Reanimated animation that starts while it is set.
 */
export function VergerProvider({
  children,
  host,
  createPort,
  mode,
  assignment,
  telemetrySink,
  readTotals,
  memorySensing = false,
}: VergerProviderProps) {
  const [controller] = useState<RuntimeController | null>(() => {
    if (mode === 'off') return null;
    const port = createPort(now);
    return createRuntimeController({
      port,
      levers: host.levers,
      mode,
      config: host.config,
      now,
      scheduler,
      memorySensing,
      telemetry: telemetrySink
        ? createGovernorTelemetry({
            sink: telemetrySink,
            arm: assignment?.arm ?? (mode === 'active' ? 'treatment' : 'control'),
            experimentKey: assignment?.key ?? host.experimentKey,
            sessionId: sessionId(),
            configHash: host.configHash,
            config: host.config,
            readTotals,
            device: {
              ram: memoryBucket(port.capacity.totalMemoryBytes),
              sdk: port.capacity.sdkInt ?? 0,
              max_hz: Math.round(Math.max(0, ...port.capacity.refreshRatesHz)),
              hints: port.capacity.supportsCpuHints,
              sensing: memorySensing,
            },
          })
        : undefined,
    });
  });

  useEffect(() => {
    if (!controller) return;
    controller.start();
    controller.dispatch({
      type: 'app-state',
      at: now(),
      state: visibilityOf(AppState.currentState),
    });
    const appState = AppState.addEventListener('change', (status) =>
      controller.dispatch({ type: 'app-state', at: now(), state: visibilityOf(status) }),
    );
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduceMotion) =>
      controller.dispatch({ type: 'preferences', at: now(), reduceMotion, fidelity: 'auto' }),
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) =>
        controller.dispatch({ type: 'preferences', at: now(), reduceMotion, fidelity: 'auto' }),
      )
      .catch((error: unknown) => console.error('[verger] reduce-motion query failed', error));
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
    <VergerContext.Provider value={controller}>
      <PresenceBoundary controller={controller}>{children}</PresenceBoundary>
      <GlobalMotion controller={controller} />
    </VergerContext.Provider>
  );
}

/** Records that someone touched the screen without taking part in the responder system. */
function PresenceBoundary({
  controller,
  children,
}: {
  controller: RuntimeController;
  children: ReactNode;
}) {
  const last = useRef(Number.NEGATIVE_INFINITY);
  // Touch start and every move (throttled): a long scroll keeps the gesture alive, so the
  // gesture freeze holds for its whole length. Momentum after the finger lifts is not seen.
  const present = () => {
    const at = now();
    if (at - last.current >= INTERACTION_THROTTLE_MS) {
      last.current = at;
      controller.dispatch({ type: 'interaction', at });
    }
    return false;
  };
  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={present}
      onMoveShouldSetResponderCapture={present}
    >
      {children}
    </View>
  );
}

function GlobalMotion({ controller }: { controller: RuntimeController }) {
  const forced = useSyncExternalStore(
    controller.subscribe,
    () => controller.getSnapshot().globalReducedMotion,
  );
  // Mounting the config forces reduced motion; unmounting restores what was there before.
  return forced ? <ReducedMotionConfig mode={ReduceMotion.Always} /> : null;
}

/** The current snapshot, or null when verger is off. Re-renders on change only. */
export function useVergerSnapshot(): GovernorSnapshot | null {
  const controller = useContext(VergerContext);
  return useSyncExternalStore(
    controller?.subscribe ?? noSubscription,
    () => controller?.getSnapshot() ?? null,
  );
}

/** One lever's applied level (0 = full quality), or 0 when verger is off. */
export function useLeverLevel(id: string): number {
  const controller = useContext(VergerContext);
  return useSyncExternalStore(
    controller?.subscribe ?? noSubscription,
    () => controller?.getSnapshot().levels[id] ?? 0,
  );
}

const noSubscription = () => () => {};
