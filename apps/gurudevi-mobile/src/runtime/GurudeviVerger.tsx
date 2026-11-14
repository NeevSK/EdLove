import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  activationAtLevel,
  activationForMode,
  decisionCounters,
  type CapacityFacts,
  type ExperimentAssignment,
  type FidelityPreference,
  GURUDEVI_MOBILE_HOST,
  hostWith,
  labConfigure,
  labTune,
  screenNameOf,
  UNKNOWN_CAPACITY,
  VERGER_EXHAUSTIVE_STORE_PREFIX,
  VERGER_LAB_CONFIG_KEY,
  VERGER_LAB_PATCH_KEY,
  VERGER_LAB_RECORD_EVENTS,
  type VergerActivation,
  type VergerHost,
  type VergerStore,
  type VergerTelemetrySink,
} from '@repo/core/verger';
import { useFidelityOptional } from '@repo/ui/context';
import {
  createVergerAndroidPlatform,
  probeVergerClocks,
  traceVergerCounters,
} from '@repo/verger-android';
import { useScreenAnnouncement, useVerger, useVergerSnapshot } from '@repo/verger-react';
import { VergerRoot } from '@repo/verger-react-native';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import { totalMemory } from 'expo-device';
import { usePathname } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import {
  enableExhaustiveCapture,
  isExhaustiveCapture,
  recordDevelopmentVergerEvent,
  recordDevelopmentVergerLaunch,
  recordDevelopmentVergerTransition,
  saveDevelopmentTelemetry,
  setDevelopmentTelemetrySource,
} from '@/telemetry/localDevelopmentTelemetry';
import { deviceSignals } from './deviceSignals';
import {
  type RuntimeMode,
  readVergerConfig,
  readVergerLaunch,
  readVergerLevel,
  readVergerPolicy,
} from './runtimeMode';
import { vergerTelemetrySink } from './telemetrySink';

interface GurudeviVergerProps {
  readonly children: ReactNode;
  /** Overrides the resolved mode (tests, diagnostics). */
  readonly mode?: RuntimeMode;
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: VergerTelemetrySink;
  /** The user's fidelity setting; defaults to the app's fidelity setting. */
  readonly fidelity?: FidelityPreference;
  /** Suppresses active JS samplers during benchmarking and automated device profiling. */
  readonly suppressAutoCapture?: boolean;
}

/**
 * Verger's memory across launches. AsyncStorage, not MMKV: the app keeps MMKV off the startup
 * path (it stalled the first render on device), and verger's launch waits for its reads
 * anyway. Each write is one small JSON value.
 */
const VERGER_STORE: VergerStore = {
  get: (key) => AsyncStorage.getItem(key),
  set: (key, value) => AsyncStorage.setItem(key, value),
  remove: (key) => AsyncStorage.removeItem(key),
};

/**
 * An exhaustive development run's own ladder: the same store under its own keys, so experiments
 * keep their recovery history and causes and never move the normal ladder.
 */
const EXHAUSTIVE_DEV_STORE: VergerStore = {
  get: (key) => AsyncStorage.getItem(VERGER_EXHAUSTIVE_STORE_PREFIX + key),
  set: (key, value) => AsyncStorage.setItem(VERGER_EXHAUSTIVE_STORE_PREFIX + key, value),
  remove: (key) => AsyncStorage.removeItem(VERGER_EXHAUSTIVE_STORE_PREFIX + key),
};

const platform = () => createVergerAndroidPlatform();

/** Remote config's kill switch, read live: set after launch, verger stops on the next foreground. */
const killSwitchOn = () => globalThis.__GURUDEVI_RUNTIME_MODE__ === 'off';

/**
 * What the floors know of the phone while verger is off: its memory, from expo-device (which
 * the app loads anyway), never from verger's module. The rest stays unknown, so no capability
 * floor applies: unknown graphics support is not proof of its absence.
 */
const facts = (): CapacityFacts => ({ ...UNKNOWN_CAPACITY, totalMemoryBytes: totalMemory });

/**
 * Each route the user opens, announced to verger as a screen (R3): a new regime for its frames
 * loop, and in verger-p5 the levels it settled on there last time (R4). Record ids fold into one
 * screen (`screenNameOf`).
 */
function ScreenAnnouncer() {
  const screen = screenNameOf(usePathname());
  useScreenAnnouncement(screen);
  useEffect(() => {
    if (!isExhaustiveCapture()) return;
    saveDevelopmentTelemetry({
      source: 'performance',
      name: 'screen-transition',
      attributes: { screen },
    });
  }, [screen]);
  return null;
}

/**
 * Each published decision on the two timelines engineers read, at the exhaustive level: a user
 * timing mark in the React Native DevTools Performance panel, and counter tracks in a Perfetto
 * system trace (written by the native module only while one records). Renders nothing.
 */
function DecisionTrace() {
  const snapshot = useVergerSnapshot();
  useEffect(() => {
    if (!snapshot) return;
    performance.mark(`verger:${snapshot.lastAction}`, {
      detail: { version: snapshot.version, reason: snapshot.lastReason },
    });
    traceVergerCounters(decisionCounters(snapshot));
  }, [snapshot]);
  return null;
}

/**
 * The dev lab's saved activation patch and thresholds, in a development build: AsyncStorage
 * cannot be read before the launch is decided, so both are applied live, once, as soon as verger
 * runs. Malformed, each is refused whole and the reason logged.
 */
function SavedLab({ host }: { readonly host: VergerHost }) {
  const verger = useVerger();
  useEffect(() => {
    if (!__DEV__ || !verger) return;
    let done = false;
    let saved: readonly [string | null, string | null] | null = null;
    const apply = () => {
      if (done || saved === null || verger.activation === null) return;
      done = true;
      const [patch, config] = saved;
      if (patch !== null) {
        const result = labConfigure(verger, host.levers, patch);
        if (!result.ok) console.warn('[verger] lab patch ignored:', result.error);
      }
      if (config !== null) {
        const result = labTune(verger, host.config, config);
        if (!result.ok) console.warn('[verger] lab thresholds ignored:', result.error);
      }
    };
    const unsubscribe = verger.subscribe(apply);
    Promise.all([
      AsyncStorage.getItem(VERGER_LAB_PATCH_KEY),
      AsyncStorage.getItem(VERGER_LAB_CONFIG_KEY),
    ])
      .then(([patch, config]) => {
        saved = [patch, config];
        apply();
      })
      .catch((error: unknown) => console.warn('[verger] lab settings unreadable', error));
    return () => {
      done = true;
      unsubscribe();
    };
  }, [verger, host]);
  return null;
}

/**
 * Gurudevi's mounting of verger: its mobile host, the Android platform, AsyncStorage for the
 * recovery record, and the mode Gurudevi resolves from its own build and remote settings. Off
 * unless something turns it on. A new app build restarts the recovery ladder.
 */
export function GurudeviVerger({
  children,
  mode,
  assignment,
  telemetrySink,
  fidelity,
  suppressAutoCapture,
}: GurudeviVergerProps) {
  const setting = useFidelityOptional().fidelityLevel;
  // One verger at two levels: exhaustive senses and keeps everything (development builds, or a
  // phone switched for diagnosis); normal is what release phones run. Known before launch.
  const [level] = useState(() => {
    const read = readVergerLevel();
    if (read.rejected) console.warn('[verger] level choice ignored:', read.rejected);
    if (read.level === 'exhaustive') enableExhaustiveCapture();
    return read;
  });
  const exhaustive = level.level === 'exhaustive';
  // Thresholds and policy hold whether verger runs or not (the floors run the policy too).
  const [host] = useState<VergerHost>(() => {
    const read = readVergerConfig(GURUDEVI_MOBILE_HOST.config);
    if (read.rejectedConfig)
      console.warn('[verger] remote thresholds ignored:', read.rejectedConfig);
    const policy = readVergerPolicy();
    if (policy.rejected) console.warn('[verger] policy choice ignored:', policy.rejected);
    return read.patched || policy.policy !== GURUDEVI_MOBILE_HOST.policy
      ? hostWith(GURUDEVI_MOBILE_HOST, { config: read.config, policy: policy.policy })
      : GURUDEVI_MOBILE_HOST;
  });
  // A kill switch wins over everything, whichever carries it (remote override or experiment).
  // Otherwise an explicit mode, then the assignment, then the build and remote activation.
  const [launch] = useState<{ mode: RuntimeMode; activation?: VergerActivation }>(() => {
    const read = readVergerLaunch(GURUDEVI_MOBILE_HOST.levers);
    if (read.rejected) console.warn('[verger] remote activation ignored:', read.rejected);
    if (read.mode === 'off' || mode === 'off' || assignment?.runtime === 'off')
      return { mode: 'off' };
    const explicit = mode ?? assignment?.runtime;
    // An explicit mode keeps its own preset; the resolved activation belongs to the resolved mode.
    const chosen: { mode: Exclude<RuntimeMode, 'off'>; activation?: VergerActivation } = explicit
      ? { mode: explicit }
      : { mode: read.mode, activation: read.activation ?? undefined };
    // The level widens what verger senses and keeps, never what it may do.
    return exhaustive
      ? {
          mode: chosen.mode,
          activation: activationAtLevel(
            chosen.activation ?? activationForMode(chosen.mode),
            'exhaustive',
          ),
        }
      : chosen;
  });
  useEffect(() => {
    if (!exhaustive) return;
    const details =
      launch.mode === 'off'
        ? 'Verger runtime mode is off; no reducer events are expected.'
        : 'Waiting for the resolved Verger launch result.';
    setDevelopmentTelemetrySource('verger-inputs', 'disabled', details);
    saveDevelopmentTelemetry({
      source: 'runtime',
      name: 'verger-level',
      attributes: {
        level: level.level,
        source: level.source,
        recovery: __DEV__ ? 'exhaustive ladder' : 'normal ladder',
      },
    });
    // Whether native and JavaScript time are one clock on this phone: joins are exact only if so.
    const clocks = probeVergerClocks();
    saveDevelopmentTelemetry({
      source: 'runtime',
      name: 'verger-clock-probe',
      attributes: clocks
        ? { js_ms: clocks.jsMs, native_ms: clocks.nativeMs, offset_ms: clocks.offsetMs }
        : { unavailable: true },
    });
    return () =>
      setDevelopmentTelemetrySource('verger-inputs', 'complete', 'Verger host unmounted.');
  }, [exhaustive, level, launch.mode]);
  return (
    <VergerRoot
      host={host}
      platform={platform}
      // A development build's exhaustive runs keep their own ladder; a field phone switched to
      // exhaustive stays on its real ladder, so recovery protects it as before.
      store={exhaustive && __DEV__ ? EXHAUSTIVE_DEV_STORE : VERGER_STORE}
      facts={facts}
      signals={deviceSignals}
      fidelity={fidelity ?? setting}
      mode={launch.mode}
      activation={launch.activation}
      assignment={assignment}
      telemetrySink={telemetrySink ?? vergerTelemetrySink}
      release={`${nativeApplicationVersion ?? '0'}+${nativeBuildVersion ?? '0'}`}
      recordEvents={exhaustive ? VERGER_LAB_RECORD_EVENTS : undefined}
      onRecordEvent={exhaustive ? recordDevelopmentVergerEvent : undefined}
      onSnapshotTransition={exhaustive ? recordDevelopmentVergerTransition : undefined}
      onLaunchPlan={exhaustive ? recordDevelopmentVergerLaunch : undefined}
      killed={killSwitchOn}
      suppressAutoCapture={suppressAutoCapture}
    >
      <ScreenAnnouncer />
      <SavedLab host={host} />
      {exhaustive ? <DecisionTrace /> : null}
      {children}
    </VergerRoot>
  );
}
