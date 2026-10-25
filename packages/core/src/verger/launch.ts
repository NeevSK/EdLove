import {
  ACTIVATION_PRESETS,
  type ActivationPatch,
  type ActivationPresetName,
  type LeverSpec,
  modeForActivation,
  parseActivationPatch,
  parseConfigPatch,
  type RunMode,
  resolveActivation,
  type VergerActivation,
  type VergerConfig,
  type VergerHost,
  defineHost,
} from '@repo/verger-core';

/** Where the dev lab keeps its saved activation patch (`localPatch`), in each app's own store. */
export const VERGER_LAB_PATCH_KEY = 'gurudevi:verger:lab-patch';

/** Where the dev lab keeps its saved threshold patch (`localConfig`). */
export const VERGER_LAB_CONFIG_KEY = 'gurudevi:verger:lab-config';

/** Events a development build records per session for the lab's export (D1). */
export const VERGER_LAB_RECORD_EVENTS = 4000;

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

export interface VergerConfigInputs {
  /** The host's own config: the layer every patch applies over. */
  readonly base: VergerConfig;
  /** Remote threshold patch (`__GURUDEVI_VERGER_CONFIG__`), untrusted. */
  readonly remoteConfig: unknown;
  /** The dev lab's saved thresholds, untrusted; honoured only in a development build. */
  readonly localConfig?: unknown;
  readonly dev: boolean;
}

export interface VergerConfigLaunch {
  /** The config in force: the host's, then the lab's, then remote, each validated whole. */
  readonly config: VergerConfig;
  /** Whether any patch applied (a changed config gets its own hash in telemetry). */
  readonly patched: boolean;
  readonly rejectedConfig: string | null;
  readonly rejectedLocalConfig: string | null;
}

/**
 * The thresholds this launch runs on. Separate from the mode: the floors read thresholds too,
 * so they hold whether verger runs or not. Same layering as activation (build, lab, remote: remote
 * overrules the lab), and each patch is refused whole if it names an unknown threshold or leaves
 * an invalid config.
 */
export function resolveVergerConfig(inputs: VergerConfigInputs): VergerConfigLaunch {
  const layer = (input: unknown, base: VergerConfig) => {
    if (input === undefined || input === null) return { config: base, applied: false, rejected: null };
    const parsed = parseConfigPatch(input, base);
    return 'patch' in parsed
      ? { config: { ...base, ...parsed.patch }, applied: true, rejected: null }
      : { config: base, applied: false, rejected: parsed.error };
  };
  const local = inputs.dev
    ? layer(inputs.localConfig, inputs.base)
    : { config: inputs.base, applied: false, rejected: null };
  const remote = layer(inputs.remoteConfig, local.config);
  return {
    config: remote.config,
    patched: local.applied || remote.applied,
    rejectedConfig: remote.rejected,
    rejectedLocalConfig: local.rejected,
  };
}

/** The host on another config (its own hash, so telemetry splits by the thresholds that ran). */
export function hostWithConfig(host: VergerHost, config: VergerConfig): VergerHost {
  return defineHost({
    name: host.name,
    levers: host.levers,
    workloads: host.workloads,
    config,
    recovery: host.recovery,
    policy: host.policy,
  });
}

/** GrowthBook keys for verger's remote inputs (ADR-012 naming: `gurudevi.<domain>.<feature>`). */
export const VERGER_REMOTE_FLAG_KEYS = {
  mode: 'gurudevi.verger.runtime-mode',
  activation: 'gurudevi.verger.activation',
  config: 'gurudevi.verger.config',
} as const;

export interface VergerRemoteInputs {
  readonly override: unknown;
  readonly remotePatch: unknown;
  readonly remoteConfig: unknown;
}

/**
 * The app's feature-flag snapshot (`FeatureRolloutSnapshot.flags`: booleans and strings) as
 * verger's remote inputs. Patches travel as JSON strings; one that does not parse is passed on as
 * a value the strict parsers refuse, so the reason reaches the logs instead of vanishing. A flag
 * that is absent is no input. Not bound in the app yet: activating GrowthBook (client key, flag
 * registration under the manifest) is a separate decision.
 */
export function vergerRemoteFromFlags(
  flags: Readonly<Record<string, boolean | string>>,
): VergerRemoteInputs {
  const json = (key: string): unknown => {
    const value = flags[key];
    if (typeof value !== 'string' || value.trim() === '') return undefined;
    try {
      return JSON.parse(value);
    } catch (error) {
      return `unparseable ${key}: ${error instanceof Error ? error.message : String(error)}`;
    }
  };
  const mode = flags[VERGER_REMOTE_FLAG_KEYS.mode];
  return {
    override: typeof mode === 'string' && mode !== '' ? mode : undefined,
    remotePatch: json(VERGER_REMOTE_FLAG_KEYS.activation),
    remoteConfig: json(VERGER_REMOTE_FLAG_KEYS.config),
  };
}
