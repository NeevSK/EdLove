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
  assignExperiment,
  VERGER_POLICY,
  VERGER_POLICY_P5,
  type VergerPolicy,
} from '@repo/verger-core';
import {
  activationPatchForScenario,
  type GurudeviScenario,
  isGurudeviScenario,
} from './gurudeviScenarios';

/** Where the dev lab keeps its saved activation patch (`localPatch`), in each app's own store. */
export const VERGER_LAB_PATCH_KEY = 'gurudevi:verger:lab-patch';

/** Where the dev lab keeps its chosen policy (`localPolicy`). */
export const VERGER_LAB_POLICY_KEY = 'gurudevi:verger:lab-policy';

/** Where the dev lab keeps its saved threshold patch (`localConfig`). */
export const VERGER_LAB_CONFIG_KEY = 'gurudevi:verger:lab-config';

/** Events a development build records per session for the lab's export (D1). */
export const VERGER_LAB_RECORD_EVENTS = 4000;

/**
 * How much verger senses and keeps (Naveen, 2026-10-29). One verger at two levels:
 *
 * - `exhaustive`: every sensor on, every decision observed (`observe: 'exhaustive'`), each
 *   session recorded, and the phone's local capture on (journeys, traces, DevTools data). It
 *   replaces the development "isolated shadow" lab: on a development build its recovery ladder is
 *   kept apart (`VERGER_EXHAUSTIVE_STORE_PREFIX`), so experiments never move the normal ladder.
 * - `normal`: what release phones run: the host's sensors, summary observation, bounded field
 *   telemetry, no local capture.
 *
 * Neither level changes what verger may do: the mode, the recovery ladder and the kill switch
 * decide that, at both levels.
 */
export type VergerLevel = 'normal' | 'exhaustive';

/** Where a phone keeps its own level switch (the lab, or diagnosis of one phone in the field). */
export const VERGER_LEVEL_KEY = 'gurudevi:verger:level';

/** The store prefix of an exhaustive development run's own recovery ladder. */
export const VERGER_EXHAUSTIVE_STORE_PREFIX = 'gurudevi:verger:exhaustive:';

export interface VergerLevelInputs {
  /** A development build: exhaustive unless switched down. */
  readonly dev: boolean;
  /** The phone's own switch (`VERGER_LEVEL_KEY`), untrusted. */
  readonly device: unknown;
  /** Remote config (`__GURUDEVI_VERGER_LEVEL__`), untrusted; wins over the phone's switch. */
  readonly remote: unknown;
}

export interface VergerLevelLaunch {
  readonly level: VergerLevel;
  readonly source: 'build' | 'device' | 'remote';
  /** A value that is not a level, refused (the layer below decides). */
  readonly rejected: string | null;
}

const isVergerLevel = (value: unknown): value is VergerLevel =>
  value === 'normal' || value === 'exhaustive';

/** The level of this launch: the build's, then the phone's switch, then remote config. */
export function resolveVergerLevel(inputs: VergerLevelInputs): VergerLevelLaunch {
  let level: VergerLevel = inputs.dev ? 'exhaustive' : 'normal';
  let source: VergerLevelLaunch['source'] = 'build';
  const rejections: string[] = [];
  const consider = (value: unknown, from: 'device' | 'remote') => {
    if (value === undefined || value === null || value === '') return;
    if (isVergerLevel(value)) {
      level = value;
      source = from;
    } else rejections.push(`${from}: unknown level ${JSON.stringify(value)}`);
  };
  consider(inputs.device, 'device');
  consider(inputs.remote, 'remote');
  return { level, source, rejected: rejections.length > 0 ? rejections.join('; ') : null };
}

/**
 * An activation at a level. Exhaustive senses with every sensor and observes in full; normal is
 * the activation as given. What verger may apply (decide, reduce, grow, hardware, levers,
 * admission) is never changed by the level.
 */
export function activationAtLevel(
  activation: VergerActivation,
  level: VergerLevel,
): VergerActivation {
  return level === 'exhaustive'
    ? { ...activation, sense: ACTIVATION_PRESETS.lab.sense, observe: 'exhaustive' }
    : activation;
}

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
  /** High-level operational scenario (e.g. 'exam', 'power-cut', 'low-data', 'auto'). */
  readonly scenario?: unknown;
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
  /** The operational scenario resolved for this launch. */
  readonly scenario: GurudeviScenario;
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
  const scenario: GurudeviScenario = isGurudeviScenario(inputs.scenario) ? inputs.scenario : 'auto';
  const scenarioPatch = activationPatchForScenario(scenario);

  if (inputs.override === 'off')
    return {
      mode: 'off',
      activation: null,
      source: 'override off',
      rejected,
      rejectedLocal,
      scenario,
    };
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
      scenario,
    };
  // The scenario and lab patch sit under the remote one: remote config can still overrule them.
  const activation = resolveActivation(
    ACTIVATION_PRESETS[preset],
    scenarioPatch,
    local.patch,
    remote.patch,
  );
  return {
    mode: modeForActivation(activation),
    activation,
    source: [
      preset,
      scenario !== 'auto' && `scenario:${scenario}`,
      local.patch && 'lab patch',
      remote.patch && 'remote patch',
    ]
      .filter(Boolean)
      .join(' + '),
    rejected,
    rejectedLocal,
    scenario,
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
  return hostWith(host, { config });
}

/**
 * The host with another config or policy. Another policy keys its own recovery ladder and its own
 * experiment key: p5's failures never count against p4's record, nor the other way round.
 */
export function hostWith(
  host: VergerHost,
  change: { readonly config?: VergerConfig; readonly policy?: VergerPolicy },
): VergerHost {
  return defineHost({
    name: host.name,
    levers: host.levers,
    workloads: host.workloads,
    config: change.config ?? host.config,
    recovery: host.recovery,
    policy: change.policy ?? host.policy,
  });
}

/** The policies a launch may choose by name. */
export const VERGER_POLICIES = { p4: VERGER_POLICY, p5: VERGER_POLICY_P5 } as const;
export type VergerPolicyName = keyof typeof VERGER_POLICIES;

const isPolicyName = (value: unknown): value is VergerPolicyName =>
  typeof value === 'string' && Object.hasOwn(VERGER_POLICIES, value);

export interface VergerPolicyInputs {
  /** The build's policy (`EXPO_PUBLIC_GURUDEVI_VERGER_POLICY`). */
  readonly build: unknown;
  /** The dev lab's choice; honoured only in a development build. */
  readonly local?: unknown;
  /** Remote config's choice (`__GURUDEVI_VERGER_POLICY__`), untrusted. */
  readonly remote: unknown;
  /**
   * A deterministic split for a controlled comparison: `treatmentPercent` of installs, by a hash
   * of `installId` and `key`, run p5; the rest p4. The id never leaves the device. A forced
   * choice (remote, lab) overrules the split.
   */
  readonly split?: {
    readonly installId: string;
    readonly key: string;
    readonly treatmentPercent: unknown;
  };
  readonly dev: boolean;
}

export interface VergerPolicyLaunch {
  readonly name: VergerPolicyName;
  readonly policy: VergerPolicy;
  readonly source: 'default' | 'build' | 'split' | 'lab' | 'remote';
  /** A named policy no one knows, refused (the next layer down decides). */
  readonly rejected: string | null;
}

/**
 * Which policy decides this launch. Weakest first: p5 by default (Naveen, 2026-10-29), the
 * build, the split, the lab (development only), then remote config. An unknown name is refused
 * and reported; the layer below it decides. The split still names both arms (p5 against p4), so
 * a controlled comparison stays possible.
 */
export function resolveVergerPolicy(inputs: VergerPolicyInputs): VergerPolicyLaunch {
  let name: VergerPolicyName = 'p5';
  let source: VergerPolicyLaunch['source'] = 'default';
  const rejections: string[] = [];
  const consider = (value: unknown, from: VergerPolicyLaunch['source']) => {
    if (value === undefined || value === null || value === '') return;
    if (isPolicyName(value)) {
      name = value;
      source = from;
    } else rejections.push(`${from}: unknown policy ${JSON.stringify(value)}`);
  };
  consider(inputs.build, 'build');
  const split = inputs.split;
  if (split && typeof split.treatmentPercent === 'number' && split.treatmentPercent > 0) {
    const arm = assignExperiment({
      installId: split.installId,
      key: split.key,
      treatmentPercent: split.treatmentPercent,
      killSwitch: false,
    }).arm;
    name = arm === 'treatment' ? 'p5' : 'p4';
    source = 'split';
  }
  if (inputs.dev) consider(inputs.local, 'lab');
  consider(inputs.remote, 'remote');
  return {
    name,
    policy: VERGER_POLICIES[name],
    source,
    rejected: rejections.length > 0 ? rejections.join('; ') : null,
  };
}

/** GrowthBook keys for verger's remote inputs (ADR-012 naming: `gurudevi.<domain>.<feature>`). */
export const VERGER_REMOTE_FLAG_KEYS = {
  mode: 'gurudevi.verger.runtime-mode',
  activation: 'gurudevi.verger.activation',
  config: 'gurudevi.verger.config',
  policy: 'gurudevi.verger.policy',
  level: 'gurudevi.verger.level',
} as const;

export interface VergerRemoteInputs {
  readonly override: unknown;
  readonly remotePatch: unknown;
  readonly remoteConfig: unknown;
  readonly remotePolicy: unknown;
  readonly remoteLevel: unknown;
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
  const policy = flags[VERGER_REMOTE_FLAG_KEYS.policy];
  const level = flags[VERGER_REMOTE_FLAG_KEYS.level];
  return {
    override: typeof mode === 'string' && mode !== '' ? mode : undefined,
    remotePolicy: typeof policy === 'string' && policy !== '' ? policy : undefined,
    remoteLevel: typeof level === 'string' && level !== '' ? level : undefined,
    remotePatch: json(VERGER_REMOTE_FLAG_KEYS.activation),
    remoteConfig: json(VERGER_REMOTE_FLAG_KEYS.config),
  };
}
