import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type CapacityFacts,
  type ExperimentAssignment,
  type FidelityPreference,
  type VergerTelemetrySink,
  GURUDEVI_MOBILE_HOST,
  labConfigure,
  type VergerActivation,
  UNKNOWN_CAPACITY,
  VERGER_LAB_PATCH_KEY,
  VERGER_LAB_RECORD_EVENTS,
  type VergerStore,
} from '@repo/core/verger';
import { createVergerAndroidPlatform } from '@repo/verger-android';
import { VergerRoot } from '@repo/verger-react-native';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import { totalMemory } from 'expo-device';
import { useStore } from '@repo/core/store/useStore';
import { useFidelityOptional } from '@repo/ui/context';
import { useVerger, useVergerSnapshot } from '@repo/verger-react';
import { type ReactNode, useEffect, useState } from 'react';
import { deviceSignals } from './deviceSignals';
import { readVergerLaunch, type RuntimeMode } from './runtimeMode';

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
 * The dev lab's saved patch, in a development build: AsyncStorage cannot be read before the
 * launch is decided, so the patch is applied live, once, as soon as verger runs. Malformed, it
 * is refused whole and the reason logged.
 */
function SavedLabPatch() {
  const verger = useVerger();
  useEffect(() => {
    if (!__DEV__ || !verger) return;
    let done = false;
    let text: string | null = null;
    const apply = () => {
      if (done || text === null || verger.activation === null) return;
      done = true;
      const result = labConfigure(verger, GURUDEVI_MOBILE_HOST.levers, text);
      if (!result.ok) console.warn('[verger] lab patch ignored:', result.error);
    };
    const unsubscribe = verger.subscribe(apply);
    AsyncStorage.getItem(VERGER_LAB_PATCH_KEY)
      .then((saved) => {
        text = saved;
        apply();
      })
      .catch((error: unknown) => console.warn('[verger] lab patch unreadable', error));
    return () => {
      done = true;
      unsubscribe();
    };
  }, [verger]);
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
      host={GURUDEVI_MOBILE_HOST}
      platform={platform}
      store={VERGER_STORE}
      facts={facts}
      signals={deviceSignals}
      fidelity={fidelity ?? setting}
      mode={launch.mode}
      activation={launch.activation}
      assignment={assignment}
      telemetrySink={telemetrySink}
      release={`${nativeApplicationVersion ?? '0'}+${nativeBuildVersion ?? '0'}`}
      recordEvents={__DEV__ ? VERGER_LAB_RECORD_EVENTS : undefined}
    >
      <OnlineStatus />
      <SavedLabPatch />
      {children}
    </VergerRoot>
  );
}
