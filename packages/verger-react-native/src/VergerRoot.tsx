import {
  type CapacityFacts,
  createVerger,
  type ExperimentAssignment,
  type FidelityPreference,
  type VergerEvent,
  type RunMode,
  type VergerSnapshot,
  type VergerTelemetrySink,
  type Verger,
  type VergerHost,
  type VergerPlatform,
  type VergerActivation,
  type SelfBudget,
  type VergerStore,
} from '@repo/verger-core';
import {
  bindVerger,
  bindVergerEarly,
  observeInputDelay,
  observeLongTasks,
} from '@repo/verger-react';
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AccessibilityInfo, AppState, type AppStateStatus, View } from 'react-native';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';

/** `off` runs nothing; `shadow` senses and decides but applies nothing new; `active` applies. */
export type VergerMode = 'off' | RunMode;

/** Touches closer together than this are one interaction; verger needs presence, not taps. */
const INTERACTION_THROTTLE_MS = 250;

// Unknown or null at launch is treated as active: the app is starting in front of the user,
// and treating it as hidden would force reduced motion until the first change event.
const visibilityOf = (status: AppStateStatus | string | null | undefined) =>
  status === 'background' ? 'background' : status === 'inactive' ? 'inactive' : 'active';

const now = () => performance.now();

/** One preferences event carries both settings, so a change to one re-sends the other. */
function sendPreferences(
  verger: Verger,
  current: { readonly reduceMotion: boolean; readonly fidelity: FidelityPreference },
): void {
  verger.dispatch({ type: 'preferences', at: now(), ...current });
}

export interface VergerRootProps {
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
  /**
   * Signals the host reads in JavaScript (for example battery saver from expo-battery), fed to
   * the floors and to a running verger alike: while verger is off they are all it hears. Returns
   * a function that stops them. Events a sensor switched off would carry are ignored by verger.
   */
  readonly signals?: (dispatch: (event: VergerEvent) => void, now: () => number) => () => void;
  /** The user's fidelity choice; `auto` lets the phone's class and verger decide. */
  readonly fidelity?: FidelityPreference;
  /** The experiment assignment, if any: its kill switch wins, its arm labels telemetry. */
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: VergerTelemetrySink;
  /** The app version and build. A new release starts the recovery ladder over (and is the way off rung 4). */
  readonly release: string;
  /** Records each session for the dev lab's export (D1); development builds only. */
  readonly recordEvents?: number;
  /** Verger's budget for itself (D4); unset, it never reduces itself for cost. */
  readonly selfBudget?: SelfBudget;
}

/**
 * Runs verger for a React Native app and binds it, so `useVergerSnapshot` and friends read it
 * anywhere without a provider. It renders only what must sit in the tree: the touch-presence
 * boundary and the app-wide reduced-motion config.
 *
 * Mounts verger around an app. In `off` mode, or under the kill switch, it never starts verger:
 * no store, no native module, no sensing; only the floors run, in JavaScript, fed app state and
 * the motion preference, so settings still reach every lever. Otherwise it runs verger's
 * launch (which may still decide to stay off, and then also leaves the floors), feeds it app
 * state, presence, motion preference and JS long tasks, and applies the app-wide lever that
 * lives in JavaScript: forced reduced motion for every Reanimated animation that starts while
 * it is set.
 */
export function VergerRoot({
  children,
  host,
  platform,
  store,
  mode,
  activation,
  facts,
  signals,
  fidelity = 'auto',
  assignment,
  telemetrySink,
  release,
  recordEvents,
  selfBudget,
}: VergerRootProps) {
  const [runs] = useState(() => mode !== 'off' && assignment?.runtime !== 'off');
  // Read once, like the rest of the launch: a new function must not restart verger.
  const [startSignals] = useState(() => signals);
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
      recordEvents,
      selfBudget,
      now,
    }),
  );

  const preferences = useRef({ reduceMotion: false, fidelity });

  useEffect(() => {
    if (preferences.current.fidelity === fidelity) return;
    preferences.current = { ...preferences.current, fidelity };
    sendPreferences(verger, preferences.current);
  }, [verger, fidelity]);

  bindVergerEarly(verger);
  useEffect(() => bindVerger(verger), [verger]);

  useEffect(() => {
    let live = true;
    const reduceMotion = (value: boolean) => {
      preferences.current = { ...preferences.current, reduceMotion: value };
      sendPreferences(verger, preferences.current);
    };
    const settings = () => {
      verger.dispatch({ type: 'app-state', at: now(), state: visibilityOf(AppState.currentState) });
      sendPreferences(verger, preferences.current);
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
    const stopSignals = startSignals?.((event) => verger.signal(event), now) ?? (() => {});
    // Long tasks and input delay matter only to a running closed loop; off, nothing is observed.
    const stopLongTasks = runs
      ? observeLongTasks((durationMs) =>
          verger.dispatch({ type: 'long-task', at: now(), durationMs }),
        )
      : () => {};
    const stopInputDelay = runs
      ? observeInputDelay((durationMs) =>
          verger.dispatch({ type: 'input-delay', at: now(), durationMs }),
        )
      : () => {};
    return () => {
      live = false;
      stopInputDelay();
      stopLongTasks();
      stopSignals();
      motion.remove();
      appState.remove();
      if (runs) void verger.stop();
    };
  }, [verger, runs, startSignals]);

  return (
    <>
      {runs ? <PresenceBoundary verger={verger}>{children}</PresenceBoundary> : children}
      <GlobalMotion verger={verger} />
    </>
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
