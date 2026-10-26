import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type CapacityFacts,
  type ExperimentAssignment,
  type FidelityPreference,
  type VergerTelemetrySink,
  GURUDEVI_MOBILE_HOST,
  hostWith,
  labConfigure,
  labTune,
  type VergerActivation,
  UNKNOWN_CAPACITY,
  VERGER_LAB_CONFIG_KEY,
  VERGER_LAB_PATCH_KEY,
  type VergerHost,
  VERGER_LAB_RECORD_EVENTS,
  type VergerStore,
  screenNameOf,
} from '@repo/core/verger';
import { createVergerAndroidPlatform } from '@repo/verger-android';
import { VergerRoot } from '@repo/verger-react-native';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import { totalMemory } from 'expo-device';
import { useStore } from '@repo/core/store/useStore';
import { useFidelityOptional } from '@repo/ui/context';
import { useScreenAnnouncement, useVerger, useVergerSnapshot } from '@repo/verger-react';
import { usePathname } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { deviceSignals } from './deviceSignals';
import { readVergerConfig, readVergerLaunch, readVergerPolicy, type RuntimeMode } from './runtimeMode';
import { vergerTelemetrySink } from './telemetrySink';

interface GurudeviVergerProps {
  readonly children: ReactNode;
  /** Overrides the resolved mode (tests, diagnostics). */
  readonly mode?: RuntimeMode;
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: VergerTelemetrySink;
  /** The user's fidelity setting; defaults to the app's fidelity setting. */
  readonly fidelity?: FidelityPreference;
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
 * Whether the app is online, for the screens that show it (the network banner, notifications,
 * link handling): downstream of verger's network reading, never a second source. Unknown reads
 * as online, as it always has.
 */
function OnlineStatus() {
  const networkLimit = useVergerSnapshot()?.networkLimit;
  useEffect(() => {
    if (networkLimit !== undefined) useStore.getState().setIsOnline(networkLimit !== 'offline');
  }, [networkLimit]);
  return null;
}

/**
 * Each route the user opens, announced to verger as a screen (R3): a new regime for its frames
 * loop, and in verger-p5 the levels it settled on there last time (R4). Record ids fold into one
 * screen (`screenNameOf`).
 */
function ScreenAnnouncer() {
  useScreenAnnouncement(screenNameOf(usePathname()));
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
}: GurudeviVergerProps) {
  const setting = useFidelityOptional().fidelityLevel;
  // Thresholds and policy hold whether verger runs or not (the floors run the policy too).
  const [host] = useState<VergerHost>(() => {
    const read = readVergerConfig(GURUDEVI_MOBILE_HOST.config);
    if (read.rejectedConfig) console.warn('[verger] remote thresholds ignored:', read.rejectedConfig);
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
    if (read.mode === 'off' || assignment?.runtime === 'off') return { mode: 'off' };
    const explicit = mode ?? assignment?.runtime;
    // An explicit mode keeps its own preset; the resolved activation belongs to the resolved mode.
    return explicit
      ? { mode: explicit }
      : { mode: read.mode, activation: read.activation ?? undefined };
  });
  return (
    <VergerRoot
      host={host}
      platform={platform}
      store={VERGER_STORE}
      facts={facts}
      signals={deviceSignals}
      fidelity={fidelity ?? setting}
      mode={launch.mode}
      activation={launch.activation}
      assignment={assignment}
      telemetrySink={telemetrySink ?? vergerTelemetrySink}
      release={`${nativeApplicationVersion ?? '0'}+${nativeBuildVersion ?? '0'}`}
      recordEvents={__DEV__ ? VERGER_LAB_RECORD_EVENTS : undefined}
      killed={killSwitchOn}
    >
      <OnlineStatus />
      <ScreenAnnouncer />
      <SavedLab host={host} />
      {children}
    </VergerRoot>
  );
}
