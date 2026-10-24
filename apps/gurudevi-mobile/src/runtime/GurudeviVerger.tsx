import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type CapacityFacts,
  type ExperimentAssignment,
  type FidelityPreference,
  type GovernorTelemetrySink,
  GURUDEVI_MOBILE_HOST,
  UNKNOWN_CAPACITY,
  type VergerStore,
} from '@repo/core/governor';
import { createVergerAndroidPlatform } from '@repo/verger-android';
import { VergerProvider } from '@repo/verger-react';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import { totalMemory } from 'expo-device';
import { type ReactNode, useState } from 'react';
import { type RuntimeMode, resolveRuntimeMode } from './runtimeMode';

interface GurudeviVergerProps {
  readonly children: ReactNode;
  /** Overrides the resolved mode (tests, diagnostics). */
  readonly mode?: RuntimeMode;
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
  /** The user's fidelity setting. */
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
  // A kill switch wins over everything, whichever carries it (remote override or experiment).
  // Otherwise an explicit mode, then the assignment, then the build default (off).
  const [resolved] = useState<RuntimeMode>(() => {
    if (globalThis.__GURUDEVI_RUNTIME_MODE__ === 'off' || assignment?.runtime === 'off')
      return 'off';
    return mode ?? assignment?.runtime ?? resolveRuntimeMode();
  });
  return (
    <VergerProvider
      host={GURUDEVI_MOBILE_HOST}
      platform={platform}
      store={VERGER_STORE}
      facts={facts}
      fidelity={fidelity}
      mode={resolved}
      assignment={assignment}
      telemetrySink={telemetrySink}
      release={`${nativeApplicationVersion ?? '0'}+${nativeBuildVersion ?? '0'}`}
    >
      {children}
    </VergerProvider>
  );
}
