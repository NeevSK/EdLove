import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type CapacityFacts,
  type ExperimentAssignment,
  type FidelityPreference,
  type GovernorEvent,
  type GovernorTelemetrySink,
  GURUDEVI_MOBILE_HOST,
  type VergerActivation,
  UNKNOWN_CAPACITY,
  type VergerStore,
} from '@repo/core/governor';
import { createVergerAndroidPlatform } from '@repo/verger-android';
import { VergerProvider } from '@repo/verger-react';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import { totalMemory } from 'expo-device';
import { type ReactNode, useState } from 'react';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { useFidelityOptional } from '@repo/ui/context';
import { readVergerLaunch, type RuntimeMode } from './runtimeMode';

interface GurudeviVergerProps {
  readonly children: ReactNode;
  /** Overrides the resolved mode (tests, diagnostics). */
  readonly mode?: RuntimeMode;
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
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
 * Battery saver from the app's device adapter (expo-battery), so the floors hear it while
 * verger is off; running, the native sensor reports the same. A failed read keeps the last
 * value, as the old governor did.
 */
function signals(dispatch: (event: GovernorEvent) => void, now: () => number): () => void {
  let live = true;
  const send = (saver: boolean) => {
    if (live) dispatch({ type: 'power', at: now(), saver });
  };
  let subscription: { remove: () => void } | undefined;
  try {
    // The device adapter throws until the runtime is registered.
    const device = coreRuntime.device;
    device
      .getPowerState?.()
      .then((state) => send(state.lowPowerMode))
      .catch((error: unknown) => console.warn('[verger] battery saver read failed', error));
    subscription = device.addPowerStateListener?.(send);
  } catch (error) {
    console.warn('[verger] battery saver unavailable', error);
  }
  return () => {
    live = false;
    subscription?.remove();
  };
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
    <VergerProvider
      host={GURUDEVI_MOBILE_HOST}
      platform={platform}
      store={VERGER_STORE}
      facts={facts}
      signals={signals}
      fidelity={fidelity ?? setting}
      mode={launch.mode}
      activation={launch.activation}
      assignment={assignment}
      telemetrySink={telemetrySink}
      release={`${nativeApplicationVersion ?? '0'}+${nativeBuildVersion ?? '0'}`}
    >
      {children}
    </VergerProvider>
  );
}
