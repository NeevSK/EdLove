import {
  type CapacityFacts,
  createVerger,
  type ExperimentAssignment,
  type FidelityPreference,
  type GovernorMode,
  type GovernorSnapshot,
  type GovernorTelemetrySink,
  type Verger,
  type VergerHost,
  type VergerPlatform,
  type VergerActivation,
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
  /** What verger may do (a preset with patches); the ladder caps it. Defaults to `mode`'s preset. */
  readonly activation?: VergerActivation;
  /**
   * Device facts read in JavaScript alone (for example `expo-device`), for the floors that hold
   * while verger is off. Never verger's native module.
   */
  readonly facts?: () => CapacityFacts;
  /** The user's fidelity choice; `auto` lets the phone's class and verger decide. */
  readonly fidelity?: FidelityPreference;
  /** The experiment assignment, if any: its kill switch wins, its arm labels telemetry. */
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
  /** The app version and build. A new release starts the recovery ladder over (and is the way off rung 4). */
  readonly release: string;
}

/**
 * Mounts verger around an app. In `off` mode, or under the kill switch, it never starts verger:
 * no store, no native module, no sensing; only the floors run, in JavaScript, fed app state and
 * the motion preference, so settings still reach every lever. Otherwise it runs verger's
 * launch (which may still decide to stay off, and then also leaves the floors), feeds it app
 * state, presence, motion preference and JS long tasks, and applies the app-wide lever that
 * lives in JavaScript: forced reduced motion for every Reanimated animation that starts while
 * it is set.
 */
export function VergerProvider({
  children,
  host,
  platform,
  store,
  mode,
  activation,
  facts,
  fidelity = 'auto',
  assignment,
  telemetrySink,
  release,
}: VergerProviderProps) {
  const [runs] = useState(() => mode !== 'off' && assignment?.runtime !== 'off');
  const [verger] = useState<Verger>(() =>
    createVerger({
      host,
      platform,
      store,
      // Never started when `runs` is false; the floors need no mode.
      requested: mode === 'off' ? 'shadow' : mode,
      activation,
      facts,
      assignment,
      telemetrySink,
      release,
      now,
    }),
  );

  // One preferences event carries both settings, so each change re-sends the other's last value.
  const preferences = useRef({ reduceMotion: false, fidelity });
  const sendPreferences = () =>
    verger.dispatch({ type: 'preferences', at: now(), ...preferences.current });

  useEffect(() => {
    if (preferences.current.fidelity === fidelity) return;
    preferences.current = { ...preferences.current, fidelity };
    sendPreferences();
  });

  useEffect(() => {
    let live = true;
    const reduceMotion = (value: boolean) => {
      preferences.current = { ...preferences.current, reduceMotion: value };
      sendPreferences();
    };
    const settings = () => {
      verger.dispatch({ type: 'app-state', at: now(), state: visibilityOf(AppState.currentState) });
      sendPreferences();
      AccessibilityInfo.isReduceMotionEnabled()
        .then((value) => live && reduceMotion(value))
        .catch((error: unknown) => console.error('[verger] reduce-motion query failed', error));
    };
    // Floors first, so settings hold from the first frame; a running launch is told again,
    // since its policy starts from its own state.
    settings();
    if (runs)
      void verger.start().then((plan) => {
        if (live && plan.runtime !== 'off') settings();
      });
    const appState = AppState.addEventListener('change', (status) =>
      verger.dispatch({ type: 'app-state', at: now(), state: visibilityOf(status) }),
    );
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', reduceMotion);
    // Long tasks matter only to a running closed loop; off, nothing is observed.
    const stopLongTasks = runs
      ? observeLongTasks((durationMs) =>
          verger.dispatch({ type: 'long-task', at: now(), durationMs }),
        )
      : () => {};
    return () => {
      live = false;
      stopLongTasks();
      motion.remove();
      appState.remove();
      if (runs) void verger.stop();
    };
  }, [verger, runs]);

  return (
    <VergerContext.Provider value={verger}>
      {runs ? <PresenceBoundary verger={verger}>{children}</PresenceBoundary> : children}
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

/**
 * Verger itself, for the lab and diagnostics: `configure` and `tune` change what it may do and
 * its thresholds live; `outcomes` shows how its moves turned out. Null outside a provider.
 */
export function useVerger(): Verger | null {
  return useContext(VergerContext);
}

/** The snapshot in force (verger's, or its floors while off); null outside a provider. */
export function useVergerSnapshot(): GovernorSnapshot | null {
  const verger = useContext(VergerContext);
  return useSyncExternalStore(
    verger?.subscribe ?? noSubscription,
    () => verger?.getSnapshot() ?? null,
  );
}

/** One lever's applied level (0 = full quality); its floor while verger is off; 0 outside a provider. */
export function useLeverLevel(id: string): number {
  const verger = useContext(VergerContext);
  return useSyncExternalStore(
    verger?.subscribe ?? noSubscription,
    () => verger?.getSnapshot()?.levels[id] ?? 0,
  );
}

const noSubscription = () => () => {};
