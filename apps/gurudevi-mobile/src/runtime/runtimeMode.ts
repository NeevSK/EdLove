import {
  type LeverSpec,
  resolveVergerLaunch,
  type RuntimeMode,
  type VergerLaunch,
} from '@repo/core/verger';

export type { RuntimeMode } from '@repo/core/verger';

declare global {
  // Remote config or the diagnostics screen may set this; `off` is the kill switch.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
  // Remote config may set an activation patch (untrusted JSON); malformed, it is ignored whole.
  var __GURUDEVI_VERGER_ACTIVATION__: unknown;
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
