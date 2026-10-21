import {
  createVerger,
  type ExperimentAssignment,
  type GovernorMode,
  type GovernorSnapshot,
  type GovernorTelemetrySink,
  type Verger,
  type VergerHost,
  type VergerPlatform,
  type VergerStore,
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

const VergerContext = createContext<Verger | null>(null);

/** Touches closer together than this are one interaction; verger needs presence, not taps. */
const INTERACTION_THROTTLE_MS = 250;

// Unknown or null at launch is treated as active: the app is starting in front of the user,
// and treating it as hidden would force reduced motion until the first change event.
const visibilityOf = (status: AppStateStatus | string | null | undefined) =>
  status === 'background' ? 'background' : status === 'inactive' ? 'inactive' : 'active';

const now = () => performance.now();

export interface VergerProviderProps {
  readonly children: ReactNode;
  /** The host's definition (`defineHost`): its levers, rules, thresholds and recovery. */
  readonly host: VergerHost;
  /** The platform (`createVergerAndroidPlatform`). Called only if the launch lets verger run. */
  readonly platform: () => VergerPlatform;
  /** Durable storage for the recovery ladder, trust and the learned profile. */
  readonly store?: VergerStore;
  readonly mode: VergerMode;
  /** The experiment assignment, if any: its kill switch wins, its arm labels telemetry. */
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
  /** The app version. A new release starts the recovery ladder over. */
  readonly release?: string;
}

/**
 * Mounts verger around an app. In `off` mode, or under the kill switch, it renders its
 * children and creates nothing. Otherwise it runs verger's launch (which may still decide to
 * stay off), feeds it app state, presence, motion preference and JS long tasks, and applies
 * the app-wide lever that lives in JavaScript: forced reduced motion for every Reanimated
 * animation that starts while it is set.
 */
export function VergerProvider({
  children,
  host,
  platform,
  store,
  mode,
  assignment,
  telemetrySink,
  release,
}: VergerProviderProps) {
  const [verger] = useState<Verger | null>(() =>
    mode === 'off' || assignment?.runtime === 'off'
      ? null
      : createVerger({
          host,
          platform,
          store,
          requested: mode,
          assignment,
          telemetrySink,
          release,
          now,
        }),
  );

  useEffect(() => {
    if (!verger) return;
    let live = true;
    const reduceMotion = (value: boolean) =>
      verger.dispatch({ type: 'preferences', at: now(), reduceMotion: value, fidelity: 'auto' });
    void verger.start().then((plan) => {
      if (!live || plan.runtime === 'off') return;
      verger.dispatch({ type: 'app-state', at: now(), state: visibilityOf(AppState.currentState) });
      AccessibilityInfo.isReduceMotionEnabled()
        .then((value) => live && reduceMotion(value))
        .catch((error: unknown) => console.error('[verger] reduce-motion query failed', error));
    });
    const appState = AppState.addEventListener('change', (status) =>
      verger.dispatch({ type: 'app-state', at: now(), state: visibilityOf(status) }),
    );
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', reduceMotion);
    const stopLongTasks = observeLongTasks((durationMs) =>
      verger.dispatch({ type: 'long-task', at: now(), durationMs }),
    );
    return () => {
      live = false;
      stopLongTasks();
      motion.remove();
      appState.remove();
      void verger.stop();
    };
  }, [verger]);

  if (!verger) return <>{children}</>;
  return (
    <VergerContext.Provider value={verger}>
      <PresenceBoundary verger={verger}>{children}</PresenceBoundary>
      <GlobalMotion verger={verger} />
    </VergerContext.Provider>
  );
}

/** Records that someone touched the screen without taking part in the responder system. */
function PresenceBoundary({ verger, children }: { verger: Verger; children: ReactNode }) {
  const last = useRef(Number.NEGATIVE_INFINITY);
  // Touch start and every move (throttled): a long scroll keeps the gesture alive, so the
  // gesture freeze holds for its whole length. Momentum after the finger lifts is not seen.
  const present = () => {
    const at = now();
    if (at - last.current >= INTERACTION_THROTTLE_MS) {
      last.current = at;
      verger.dispatch({ type: 'interaction', at });
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

function GlobalMotion({ verger }: { verger: Verger }) {
  const forced = useSyncExternalStore(
    verger.subscribe,
    () => verger.getSnapshot()?.globalReducedMotion ?? false,
  );
  // Mounting the config forces reduced motion; unmounting restores what was there before.
  return forced ? <ReducedMotionConfig mode={ReduceMotion.Always} /> : null;
}

/** The current snapshot, or null when verger is off. Re-renders on change only. */
export function useVergerSnapshot(): GovernorSnapshot | null {
  const verger = useContext(VergerContext);
  return useSyncExternalStore(
    verger?.subscribe ?? noSubscription,
    () => verger?.getSnapshot() ?? null,
  );
}

/** One lever's applied level (0 = full quality), or 0 when verger is off. */
export function useLeverLevel(id: string): number {
  const verger = useContext(VergerContext);
  return useSyncExternalStore(
    verger?.subscribe ?? noSubscription,
    () => verger?.getSnapshot()?.levels[id] ?? 0,
  );
}

const noSubscription = () => () => {};
