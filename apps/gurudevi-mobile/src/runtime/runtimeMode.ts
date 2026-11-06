import {
  type LeverSpec,
  type RuntimeMode,
  resolveVergerConfig,
  resolveVergerLaunch,
  resolveVergerLevel,
  resolveVergerPolicy,
  type VergerConfig,
  type VergerConfigLaunch,
  type VergerLaunch,
  type VergerLevel,
  type VergerLevelLaunch,
  type VergerPolicyLaunch,
} from '@repo/core/verger';
import { getAndroidId } from 'expo-application';
import { File, Paths } from 'expo-file-system';

export type { RuntimeMode } from '@repo/core/verger';

/**
 * The phone's own level switch: one word in a small file, read synchronously, so the level is
 * known before verger launches (AsyncStorage could only be read after). Unreadable is no switch.
 */
const LEVEL_FILE = 'verger-level.txt';

export function readDeviceLevelSwitch(): string | undefined {
  try {
    const file = new File(Paths.document, LEVEL_FILE);
    return file.exists ? file.textSync().trim() : undefined;
  } catch (error) {
    console.warn('[verger] level switch unreadable; using the build level', error);
    return undefined;
  }
}

/** Sets the phone's level for the next launch; null removes the switch (the build decides). */
export function writeDeviceLevelSwitch(level: VergerLevel | null): void {
  const file = new File(Paths.document, LEVEL_FILE);
  if (level === null) {
    if (file.exists) file.delete();
    return;
  }
  if (!file.exists) file.create();
  file.writeSync(level);
}

/**
 * This launch's level: exhaustive in a development build, normal in a release, then the phone's
 * own switch, then remote config (`__GURUDEVI_VERGER_LEVEL__`).
 */
export function readVergerLevel(): VergerLevelLaunch {
  return resolveVergerLevel({
    dev: __DEV__,
    device: readDeviceLevelSwitch(),
    remote: globalThis.__GURUDEVI_VERGER_LEVEL__,
  });
}

declare global {
  // Remote config may set the level ('normal' or 'exhaustive') for chosen phones.
  var __GURUDEVI_VERGER_LEVEL__: unknown;
  // Remote config or the diagnostics screen may set this; `off` is the kill switch.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
  // Remote config may set an activation patch (untrusted JSON); malformed, it is ignored whole.
  var __GURUDEVI_VERGER_ACTIVATION__: unknown;
  // Remote config may set a threshold patch (untrusted JSON); malformed, it is ignored whole.
  var __GURUDEVI_VERGER_CONFIG__: unknown;
  // Remote config may choose the policy ('p4' or 'p5'); unknown names are refused.
  var __GURUDEVI_VERGER_POLICY__: unknown;
}

/** This launch's inputs, read from the build and the globals remote config sets. */
export function readVergerLaunch(levers: readonly LeverSpec[]): VergerLaunch {
  return resolveVergerLaunch({
    override: globalThis.__GURUDEVI_RUNTIME_MODE__,
    buildMode: process.env.EXPO_PUBLIC_GURUDEVI_RUNTIME,
    buildPreset: process.env.EXPO_PUBLIC_GURUDEVI_VERGER_PRESET,
    remotePatch: globalThis.__GURUDEVI_VERGER_ACTIVATION__,
    dev: __DEV__,
    levers,
  });
}

/**
 * This launch's thresholds: the host's, then the remote patch. The lab's saved thresholds live in
 * AsyncStorage, which cannot be read before mount, so they are applied live once verger runs.
 */
export function readVergerConfig(base: VergerConfig): VergerConfigLaunch {
  return resolveVergerConfig({
    base,
    remoteConfig: globalThis.__GURUDEVI_VERGER_CONFIG__,
    dev: __DEV__,
  });
}

/** The install's Android ID, read on the device only to hash a split bucket; never sent. */
function installId(): string | null {
  try {
    return getAndroidId();
  } catch (error) {
    console.warn('[verger] install id unavailable; no policy split', error);
    return null;
  }
}

/**
 * Which policy decides this launch: the build's (`EXPO_PUBLIC_GURUDEVI_VERGER_POLICY`), a split
 * of installs to p5 (`EXPO_PUBLIC_GURUDEVI_VERGER_P5_PERCENT`), then remote config.
 */
export function readVergerPolicy(): VergerPolicyLaunch {
  const percent = Number(process.env.EXPO_PUBLIC_GURUDEVI_VERGER_P5_PERCENT ?? '0');
  const id = percent > 0 ? installId() : null;
  return resolveVergerPolicy({
    build: process.env.EXPO_PUBLIC_GURUDEVI_VERGER_POLICY,
    remote: globalThis.__GURUDEVI_VERGER_POLICY__,
    split: id
      ? { installId: id, key: 'gurudevi-verger-policy', treatmentPercent: percent }
      : undefined,
    dev: __DEV__,
  });
}
