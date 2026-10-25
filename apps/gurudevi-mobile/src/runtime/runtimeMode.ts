import {
  type LeverSpec,
  resolveVergerConfig,
  resolveVergerLaunch,
  type RuntimeMode,
  type VergerConfig,
  type VergerConfigLaunch,
  type VergerLaunch,
} from '@repo/core/verger';

export type { RuntimeMode } from '@repo/core/verger';

declare global {
  // Remote config or the diagnostics screen may set this; `off` is the kill switch.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
  // Remote config may set an activation patch (untrusted JSON); malformed, it is ignored whole.
  var __GURUDEVI_VERGER_ACTIVATION__: unknown;
  // Remote config may set a threshold patch (untrusted JSON); malformed, it is ignored whole.
  var __GURUDEVI_VERGER_CONFIG__: unknown;
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
