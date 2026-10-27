import type { VergerEvent, RunMode, LeverSpec } from './types';

/**
 * What verger is allowed to do, layer by layer. Activation is data: a build ships a preset,
 * a developer or remote config patches it, and the recovery ladder caps it. It travels to the
 * reducer as an event, so a session whose activation changed mid-way replays exactly.
 */

/** Sensors a platform may run. Each costs wakeups, so each can be switched off on its own. */
export type SensorId =
  | 'frames'
  | 'threads'
  | 'memory'
  | 'thermal'
  | 'power'
  | 'network'
  | 'longTasks'
  | 'storage';

export const SENSORS: readonly SensorId[] = [
  'frames',
  'threads',
  'memory',
  'thermal',
  'power',
  'network',
  'longTasks',
  'storage',
];

/**
 * `apply`: the decision reaches consumers. `shadow`: consumers get the static baseline and the
 * decision is only recorded (`proposedLevels`). `off`: verger leaves it alone (full quality,
 * no floors) and the closed loop never picks it.
 */
export type LeverActivation = 'apply' | 'shadow' | 'off';

/** How much verger reports about itself: `exhaustive` is the development lab. */
export type ObserveLevel = 'off' | 'summary' | 'exhaustive';

export interface VergerActivation {
  readonly sense: Readonly<Record<SensorId, boolean>>;
  /** `static`: floors only (capacity, settings, power, visibility). `closed-loop`: plus measured pressure. */
  readonly decide: 'static' | 'closed-loop';
  /** The closed loop may lower quality. */
  readonly reduce: boolean;
  /** The closed loop may raise quality back, and a launch may grant learned growth. */
  readonly grow: boolean;
  /** App-wide hardware levers: refresh cap, CPU hints, forced reduced motion. */
  readonly hardware: boolean;
  /** Per-lever activation; levers not listed take `defaultLever`. */
  readonly levers: Readonly<Record<string, LeverActivation>>;
  readonly defaultLever: LeverActivation;
  /** Deferrable work admission: `apply` uses measured pressure, `shadow` static rules only, `off` admits all. */
  readonly admission: LeverActivation;
  readonly observe: ObserveLevel;
}

/** A partial activation, as a build, a developer or remote config states it. */
export interface ActivationPatch {
  readonly sense?: Partial<Readonly<Record<SensorId, boolean>>>;
  readonly decide?: VergerActivation['decide'];
  readonly reduce?: boolean;
  readonly grow?: boolean;
  readonly hardware?: boolean;
  readonly levers?: Readonly<Record<string, LeverActivation>>;
  readonly defaultLever?: LeverActivation;
  readonly admission?: LeverActivation;
  readonly observe?: ObserveLevel;
}

const allSensors = (on: boolean): Record<SensorId, boolean> =>
  Object.fromEntries(SENSORS.map((id) => [id, on])) as Record<SensorId, boolean>;

/**
 * Named starting points. `active` and `shadow` are exactly the two modes verger had before
 * activation existed; `static` is today's open-loop behaviour on no sensor but power; `lab` is
 * everything on and reported, for development builds. A host may define its own.
 */
export const ACTIVATION_PRESETS = {
  active: {
    sense: allSensors(true),
    decide: 'closed-loop',
    reduce: true,
    grow: true,
    hardware: true,
    levers: {},
    defaultLever: 'apply',
    admission: 'apply',
    observe: 'summary',
  },
  shadow: {
    sense: allSensors(true),
    decide: 'closed-loop',
    reduce: true,
    grow: true,
    hardware: false,
    levers: {},
    defaultLever: 'shadow',
    admission: 'shadow',
    observe: 'summary',
  },
  static: {
    sense: { ...allSensors(false), power: true },
    decide: 'static',
    reduce: false,
    grow: false,
    hardware: false,
    levers: {},
    defaultLever: 'apply',
    admission: 'shadow',
    observe: 'summary',
  },
  lab: {
    sense: allSensors(true),
    decide: 'closed-loop',
    reduce: true,
    grow: true,
    hardware: true,
    levers: {},
    defaultLever: 'apply',
    admission: 'apply',
    observe: 'exhaustive',
  },
} as const satisfies Record<string, VergerActivation>;

export type ActivationPresetName = keyof typeof ACTIVATION_PRESETS;

/** The preset that reproduces a pre-activation mode. */
export const activationForMode = (mode: RunMode): VergerActivation => ACTIVATION_PRESETS[mode];

/**
 * The launch mode an activation asks the ladder for: `active` when anything would reach the
 * app or the hardware, else `shadow`. The ladder may still lower it.
 */
export function modeForActivation(activation: VergerActivation): RunMode {
  const applies =
    activation.hardware ||
    activation.defaultLever === 'apply' ||
    activation.admission === 'apply' ||
    Object.values(activation.levers).includes('apply');
  return applies ? 'active' : 'shadow';
}

/** Applies patches in order; a later patch wins field by field, and per sensor and lever. */
export function resolveActivation(
  base: VergerActivation,
  ...patches: readonly (ActivationPatch | null | undefined)[]
): VergerActivation {
  let out = base;
  for (const patch of patches) {
    if (!patch) continue;
    out = {
      sense: { ...out.sense, ...patch.sense },
      decide: patch.decide ?? out.decide,
      reduce: patch.reduce ?? out.reduce,
      grow: patch.grow ?? out.grow,
      hardware: patch.hardware ?? out.hardware,
      levers: { ...out.levers, ...patch.levers },
      defaultLever: patch.defaultLever ?? out.defaultLever,
      admission: patch.admission ?? out.admission,
      observe: patch.observe ?? out.observe,
    };
  }
  return out;
}

/** What the recovery ladder allows this launch. */
export interface ActivationCap {
  /** `shadow`: nothing new reaches consumers (rung 3). */
  readonly runtime: RunMode;
  /** False on rung 2 and above, and in exercise sessions. */
  readonly hardware: boolean;
  /** False when the launch must not grow (rung 1 and above resets the profile). */
  readonly grow?: boolean;
}

/** Lowers an activation to what the ladder allows; never raises anything. */
export function capActivation(activation: VergerActivation, cap: ActivationCap): VergerActivation {
  const demote = (value: LeverActivation): LeverActivation =>
    cap.runtime === 'shadow' && value === 'apply' ? 'shadow' : value;
  return {
    ...activation,
    hardware: activation.hardware && cap.hardware && cap.runtime === 'active',
    grow: activation.grow && cap.grow !== false,
    levers: Object.fromEntries(
      Object.entries(activation.levers).map(([id, value]) => [id, demote(value)]),
    ),
    defaultLever: demote(activation.defaultLever),
    admission: demote(activation.admission),
  };
}

export const leverActivation = (activation: VergerActivation, id: string): LeverActivation =>
  activation.levers[id] ?? activation.defaultLever;

/** The sensor an event comes from, or null for events that are not sensor readings. */
export function sensorOf(event: VergerEvent): SensorId | null {
  switch (event.type) {
    case 'frame-window':
      return 'frames';
    case 'thread-load':
    case 'compute-pressure':
    case 'cpu-headroom':
      return 'threads';
    case 'memory-trim':
    case 'memory-state':
      return 'memory';
    case 'thermal':
      return 'thermal';
    case 'power':
    case 'battery':
      return 'power';
    case 'network':
    case 'data-budget':
      return 'network';
    case 'long-task':
    case 'input-delay':
    case 'event-loop-lag':
    case 'js-heap':
      return 'longTasks';
    case 'storage':
      return 'storage';
    default:
      return null;
  }
}

const LEVER_VALUES: readonly LeverActivation[] = ['apply', 'shadow', 'off'];
const OBSERVE_VALUES: readonly ObserveLevel[] = ['off', 'summary', 'exhaustive'];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const oneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (values as readonly string[]).includes(value);

/**
 * Reads a patch from untrusted JSON (remote config, a pasted diagnostics override). Anything
 * malformed is a reason to ignore the whole patch: a half-applied override is worse than none.
 * Lever ids must belong to the host.
 */
export function parseActivationPatch(
  input: unknown,
  levers: readonly LeverSpec[],
): { patch: ActivationPatch } | { error: string } {
  if (!isRecord(input)) return { error: 'not an object' };
  const known = new Set(levers.map((lever) => lever.id));
  const out: {
    -readonly [K in keyof ActivationPatch]: ActivationPatch[K];
  } = {};
  for (const [key, value] of Object.entries(input)) {
    switch (key) {
      case 'sense': {
        if (!isRecord(value)) return { error: 'sense must be an object' };
        const sense: Partial<Record<SensorId, boolean>> = {};
        for (const [id, on] of Object.entries(value)) {
          if (!oneOf(SENSORS, id)) return { error: `unknown sensor "${id}"` };
          if (typeof on !== 'boolean') return { error: `sense.${id} must be a boolean` };
          sense[id] = on;
        }
        out.sense = sense;
        break;
      }
      case 'decide':
        if (value !== 'static' && value !== 'closed-loop')
          return { error: 'decide must be "static" or "closed-loop"' };
        out.decide = value;
        break;
      case 'reduce':
      case 'grow':
      case 'hardware':
        if (typeof value !== 'boolean') return { error: `${key} must be a boolean` };
        out[key] = value;
        break;
      case 'levers': {
        if (!isRecord(value)) return { error: 'levers must be an object' };
        const map: Record<string, LeverActivation> = {};
        for (const [id, mode] of Object.entries(value)) {
          if (!known.has(id)) return { error: `unknown lever "${id}"` };
          if (!oneOf(LEVER_VALUES, mode))
            return { error: `levers.${id} must be apply, shadow or off` };
          map[id] = mode;
        }
        out.levers = map;
        break;
      }
      case 'defaultLever':
      case 'admission':
        if (!oneOf(LEVER_VALUES, value)) return { error: `${key} must be apply, shadow or off` };
        out[key] = value;
        break;
      case 'observe':
        if (!oneOf(OBSERVE_VALUES, value))
          return { error: 'observe must be off, summary or exhaustive' };
        out.observe = value;
        break;
      default:
        return { error: `unknown field "${key}"` };
    }
  }
  return { patch: out };
}
