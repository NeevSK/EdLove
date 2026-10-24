import {
  ACTIVATION_PRESETS,
  type ActivationPresetName,
  type GovernorMode,
  type LeverSpec,
  modeForActivation,
  parseActivationPatch,
  resolveActivation,
  type VergerActivation,
} from '@repo/core/governor';

/** `off` runs nothing; `shadow` senses and decides but applies nothing new; `active` applies. */
export type RuntimeMode = 'off' | GovernorMode;

declare global {
  // Remote config or the diagnostics screen may set this; it overrides the build default.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
}

const MODES: readonly RuntimeMode[] = ['off', 'shadow', 'active'];

const isMode = (value: unknown): value is RuntimeMode =>
  typeof value === 'string' && (MODES as readonly string[]).includes(value);

/**
 * The mode for this launch. Off unless something turns it on: the runtime is new native
 * behaviour, so the default keeps the app exactly as it ran before. The global override wins
 * so a remote kill switch can force `off` without a release.
 */
export function resolveRuntimeMode(): RuntimeMode {
  const override = globalThis.__GURUDEVI_RUNTIME_MODE__;
  if (isMode(override)) return override;
  const fromBuild = process.env.EXPO_PUBLIC_GURUDEVI_RUNTIME;
  return isMode(fromBuild) ? fromBuild : 'off';
}

declare global {
  // Remote config may set an activation patch (untrusted JSON); malformed, it is ignored whole.
  var __GURUDEVI_VERGER_ACTIVATION__: unknown;
}

const PRESETS = Object.keys(ACTIVATION_PRESETS) as ActivationPresetName[];

const isPreset = (value: unknown): value is ActivationPresetName =>
  typeof value === 'string' && (PRESETS as readonly string[]).includes(value);

export interface VergerLaunchInputs {
  /** Remote or diagnostics mode override (`__GURUDEVI_RUNTIME_MODE__`). */
  readonly override: unknown;
  /** The build's mode (`EXPO_PUBLIC_GURUDEVI_RUNTIME`). */
  readonly buildMode: unknown;
  /** The build's activation preset (`EXPO_PUBLIC_GURUDEVI_VERGER_PRESET`). */
  readonly buildPreset: unknown;
  /** Remote activation patch (`__GURUDEVI_VERGER_ACTIVATION__`), untrusted. */
  readonly remotePatch: unknown;
  /** A development build. */
  readonly dev: boolean;
  readonly levers: readonly LeverSpec[];
}

export interface VergerLaunch {
  /** `off` runs only the floors: no native module, no store, no sensing. */
  readonly mode: RuntimeMode;
  readonly activation: VergerActivation | null;
  /** Where the decision came from, for diagnostics. */
  readonly source: string;
  /** A remote patch that was rejected, and why. */
  readonly rejected: string | null;
}

/**
 * What verger may do this launch, from the build and remote config (the ladder caps it later;
 * a kill switch beats everything). Order, weakest first: the build's preset (a development
 * build defaults to `lab`: every layer on and reported), a mode override, then the remote patch.
 * A release build with nothing set stays off: its preset is a choice not yet made, and is made
 * in configuration, not here.
 */
export function resolveVergerLaunch(inputs: VergerLaunchInputs): VergerLaunch {
  const parsed =
    inputs.remotePatch === undefined || inputs.remotePatch === null
      ? null
      : parseActivationPatch(inputs.remotePatch, inputs.levers);
  const rejected = parsed !== null && 'error' in parsed ? parsed.error : null;
  const patch = parsed !== null && 'patch' in parsed ? parsed.patch : null;

  if (inputs.override === 'off') return { mode: 'off', activation: null, source: 'override off', rejected };
  const preset: ActivationPresetName | null =
    inputs.override === 'active' || inputs.override === 'shadow'
      ? inputs.override
      : isPreset(inputs.buildPreset)
        ? inputs.buildPreset
        : inputs.buildMode === 'active' || inputs.buildMode === 'shadow'
          ? inputs.buildMode
          : inputs.buildMode === 'off'
            ? null
            : inputs.dev
              ? 'lab'
              : null;
  if (preset === null)
    return { mode: 'off', activation: null, source: inputs.dev ? 'build off' : 'release default', rejected };
  const activation = resolveActivation(ACTIVATION_PRESETS[preset], patch);
  return {
    mode: modeForActivation(activation),
    activation,
    source: patch ? `${preset} + remote patch` : preset,
    rejected,
  };
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
