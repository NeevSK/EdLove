import {
  ACTIVATION_PRESETS,
  type ActivationPatch,
  type ActivationPresetName,
  type LeverSpec,
  modeForActivation,
  parseActivationPatch,
  type RunMode,
  resolveActivation,
  type VergerActivation,
} from '@repo/verger-core';

/** `off` runs only the floors; `shadow` senses and decides but applies nothing new; `active` applies. */
export type RuntimeMode = 'off' | RunMode;

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
  /**
   * The dev lab's saved patch (D2), untrusted (it comes back from storage). Honoured only in a
   * development build: a release never runs what a lab left behind.
   */
  readonly localPatch?: unknown;
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
  /** A lab patch that was rejected, and why (the lab shows it, never swallows it). */
  readonly rejectedLocal: string | null;
}

function parsePatch(
  input: unknown,
  levers: readonly LeverSpec[],
): { readonly patch: ActivationPatch | null; readonly rejected: string | null } {
  if (input === undefined || input === null) return { patch: null, rejected: null };
  const parsed = parseActivationPatch(input, levers);
  return 'patch' in parsed
    ? { patch: parsed.patch, rejected: null }
    : { patch: null, rejected: parsed.error };
}

/**
 * What verger may do this launch, on any of Gurudevi's platforms, from the build and remote
 * config (the ladder caps it later; a kill switch beats everything). Order, weakest first: the build's preset (a development
 * build defaults to `lab`: every layer on and reported), a mode override, then the remote patch.
 * A release build with nothing set stays off: its preset is a choice not yet made, and is made
 * in configuration, not here.
 */
export function resolveVergerLaunch(inputs: VergerLaunchInputs): VergerLaunch {
  const remote = parsePatch(inputs.remotePatch, inputs.levers);
  const local = inputs.dev ? parsePatch(inputs.localPatch, inputs.levers) : { patch: null, rejected: null };
  const rejected = remote.rejected;
  const rejectedLocal = local.rejected;

  if (inputs.override === 'off')
    return { mode: 'off', activation: null, source: 'override off', rejected, rejectedLocal };
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
    return {
      mode: 'off',
      activation: null,
      source: inputs.dev ? 'build off' : 'release default',
      rejected,
      rejectedLocal,
    };
  // The lab's patch sits under the remote one: remote config can still overrule a lab setting.
  const activation = resolveActivation(ACTIVATION_PRESETS[preset], local.patch, remote.patch);
  return {
    mode: modeForActivation(activation),
    activation,
    source: [preset, local.patch && 'lab patch', remote.patch && 'remote patch']
      .filter(Boolean)
      .join(' + '),
    rejected,
    rejectedLocal,
  };
}
