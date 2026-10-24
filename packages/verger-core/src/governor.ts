import {
  activationForMode,
  leverActivation,
  SENSORS,
  sensorOf,
  type SensorId,
  type VergerActivation,
} from './activation';
import { DEFAULT_GOVERNOR_CONFIG } from './config';
import { bottleneckTargets, classifyFrameWindow, frameBottleneck, gpuMeasured } from './frames';
import { chooseLeverToLower, validateLevers } from './levers';
import {
  latchMemory,
  type MemoryLatch,
  memoryLevelOf,
  NO_MEMORY_LATCH,
  thermalLevelOf,
} from './signals';
import type {
  Actuator,
  AppVisibility,
  Capability,
  CapacityFacts,
  Contention,
  FidelityPreference,
  FrameState,
  GovernorConfig,
  GovernorEvent,
  GovernorMode,
  GovernorSnapshot,
  IndexerAction,
  LeverSpec,
  LeverTarget,
  ThermalLevel,
  ThermalStatus,
  TrimSeverity,
} from './types';

export const UNKNOWN_CAPACITY: CapacityFacts = {
  totalMemoryBytes: null,
  isLowRamDevice: null,
  memoryClassMb: null,
  sdkInt: null,
  cpuCores: null,
  refreshRateHz: null,
  supportsRenderEffect: false,
  supportsRuntimeShader: false,
  refreshRatesHz: [],
  supportsCpuHints: false,
  buildFingerprint: null,
};

const LOW_MEMORY_DEVICE_BYTES = 3 * 1024 * 1024 * 1024;

export interface GovernorState {
  readonly config: GovernorConfig;
  readonly levers: readonly LeverSpec[];
  readonly capacity: CapacityFacts;
  readonly mode: GovernorMode;
  readonly version: number;
  readonly at: number;

  /** Levels the closed loop has lowered levers to, before floors. */
  readonly pressure: Readonly<Record<string, number>>;
  /** Lowered lever ids in order, restored last-in first-out. */
  readonly stack: readonly string[];
  /**
   * How many entries at the bottom of the stack are still the learned starting point. The
   * loop gives back its own decreases first; this shrinks as it reaches the starting point.
   */
  readonly priorDepth: number;

  readonly frameState: FrameState;
  readonly stressMs: number;
  /** Last time anything argued against raising quality (stress, near-budget frames, heat, trims). */
  readonly lastPressureAt: number;
  readonly lastDecreaseAt: number;
  readonly lastIncreaseAt: number;
  readonly upgradeAfterMs: number;

  readonly thermalStatus: ThermalStatus | null;
  readonly headroom: number | null;
  readonly lastThermalActionAt: number;
  readonly memoryLatch: MemoryLatch;
  readonly memorySensing: boolean;

  readonly powerSaver: boolean;
  readonly visibility: AppVisibility;
  readonly lastInteractionAt: number;
  readonly reduceMotion: boolean;
  readonly fidelity: FidelityPreference;

  /** When each role first crossed the saturation line, or null while below it. */
  readonly jsSaturatedSince: number | null;
  readonly mainSaturatedSince: number | null;
  readonly jsCores: number;
  readonly mainCores: number;
  /** Recent long-task end times, newest last, pruned to the long-task window. */
  readonly longTasks: readonly number[];
  readonly lastContentionActionAt: number;
  /** Load when the last contention step was taken, to judge whether the step relieved it. */
  readonly contentionBaseline: {
    readonly js: number;
    readonly main: number;
    readonly longTasks: number;
  } | null;
  readonly contentionUnrelieved: number;
  /** Levers cannot relieve the current contention: the cause is code, not quality settings. */
  readonly contentionExhausted: boolean;

  /** Last polled memory reading as a trim severity; holds until the next poll. */
  readonly polledMemory: TrimSeverity | null;
  /** End of the last stressed window on the sensor timeline, to require contiguous stress. */
  readonly stressEndMs: number | null;
  /**
   * A calm window (frames drawn within budget) has been seen since the last decrease and no
   * neutral or stressed window since. It is a flag, not a count, because the sensor forwards
   * calm windows only when the state changes: a run of calm windows arrives as one.
   */
  readonly comfortSeen: boolean;
  /** Hardware outputs as last published, held while a finger is on the screen. */
  readonly heldRefreshCapHz: number | null;
  readonly heldGlobalMotion: boolean;
  /** Whether verger may drive hardware at all (the recovery ladder turns this off). */
  readonly hardware: boolean;
  /** Steps of capacity floor this device has earned back (0 = none, 2 = all). */
  readonly capacityGrant: number;
  /** What verger may do; changed only by an `activation` event, so replay reproduces it. */
  readonly activation: VergerActivation;

  readonly lastAction: IndexerAction;
  readonly lastReason: string;
}

export interface CreateGovernorOptions {
  readonly at: number;
  readonly capacity?: CapacityFacts;
  readonly levers: readonly LeverSpec[];
  readonly mode?: GovernorMode;
  readonly config?: Partial<GovernorConfig>;
  /** Set when a native memory sensor is attached, so absence of trims means "normal". */
  readonly memorySensing?: boolean;
  /** Whether verger may drive hardware levers and CPU hints. Default true. */
  readonly hardware?: boolean;
  /**
   * Steps of the low-capacity floor relaxed because this device proved it can carry more:
   * 1 lifts the floor on non-ambient levers, 2 lifts the ambient floor as well.
   */
  readonly capacityGrant?: number;
  /**
   * Pressure to start from (a learned starting point). It enters the closed loop's stack, so
   * the loop raises it back exactly as it would its own decreases once frames are comfortable.
   */
  readonly initialPressure?: Readonly<Record<string, number>>;
  /** Defaults to the preset that reproduces `mode`. */
  readonly activation?: VergerActivation;
}

export function createGovernor(options: CreateGovernorOptions): GovernorState {
  validateLevers(options.levers);
  const config = { ...DEFAULT_GOVERNOR_CONFIG, ...options.config };
  const start = startingPressure(options.levers, options.initialPressure);
  const created: GovernorState = {
    config,
    levers: options.levers,
    capacity: options.capacity ?? UNKNOWN_CAPACITY,
    mode: options.mode ?? 'active',
    version: 0,
    at: options.at,
    pressure: start.pressure,
    stack: start.stack,
    priorDepth: start.stack.length,
    frameState: 'quiet',
    stressMs: 0,
    lastPressureAt: options.at,
    lastDecreaseAt: Number.NEGATIVE_INFINITY,
    lastIncreaseAt: Number.NEGATIVE_INFINITY,
    upgradeAfterMs: config.upgradeAfterMs,
    thermalStatus: null,
    headroom: null,
    lastThermalActionAt: Number.NEGATIVE_INFINITY,
    memoryLatch: NO_MEMORY_LATCH,
    memorySensing: options.memorySensing ?? false,
    powerSaver: false,
    visibility: 'active',
    lastInteractionAt: options.at,
    reduceMotion: false,
    fidelity: 'auto',
    jsSaturatedSince: null,
    mainSaturatedSince: null,
    jsCores: 0,
    mainCores: 0,
    longTasks: [],
    lastContentionActionAt: Number.NEGATIVE_INFINITY,
    contentionBaseline: null,
    contentionUnrelieved: 0,
    contentionExhausted: false,
    polledMemory: null,
    stressEndMs: null,
    comfortSeen: false,
    heldRefreshCapHz: null,
    heldGlobalMotion: false,
    hardware: options.hardware ?? true,
    capacityGrant: Math.max(0, Math.floor(options.capacityGrant ?? 0)),
    activation: options.activation ?? activationForMode(options.mode ?? 'active'),
    lastAction: 'stale',
    lastReason: start.stack.length > 0 ? 'start from learned profile' : 'start',
  };
  // A sensor off from the start must say nothing, as one switched off later does: the platform
  // may sense memory, but a deaf memory sensor must not report it as normal.
  let state = created;
  for (const sensor of SENSORS) {
    if (!created.activation.sense[sensor]) state = forgetSensor(state, sensor);
  }
  return state;
}

const IMPACT_ORDER = { low: 0, medium: 1, high: 2 } as const;

/**
 * Turns a learned starting point into pressure and a stack. Containment levers are excluded
 * (they act only on measured contention). The most visible levers go on top of the stack, so
 * they are the first given back.
 */
function startingPressure(
  levers: readonly LeverSpec[],
  initial: Readonly<Record<string, number>> | undefined,
): { pressure: Record<string, number>; stack: string[] } {
  const pressure: Record<string, number> = {};
  const stack: string[] = [];
  if (!initial) return { pressure, stack };
  const ordered = [...levers].sort(
    (a, b) => IMPACT_ORDER[a.visualImpact] - IMPACT_ORDER[b.visualImpact],
  );
  for (const lever of ordered) {
    if (lever.closedLoopOnly) continue;
    const value = initial[lever.id];
    if (value === undefined || !Number.isFinite(value)) continue;
    const level = Math.min(lever.maxLevel, Math.max(0, Math.floor(value)));
    if (level === 0) continue;
    pressure[lever.id] = level;
    for (let i = 0; i < level; i += 1) stack.push(lever.id);
  }
  return { pressure, stack };
}

// ---------------------------------------------------------------------------------------------
// Floors: what users, the system and the hardware require regardless of measured load.
// ---------------------------------------------------------------------------------------------

function isLowCapacity(capacity: CapacityFacts): boolean {
  if (capacity.isLowRamDevice === true) return true;
  return capacity.totalMemoryBytes !== null && capacity.totalMemoryBytes < LOW_MEMORY_DEVICE_BYTES;
}

/** Static floors: today's open-loop behaviour (capacity, settings, power, visibility). */
export function staticFloors(state: GovernorState): Record<string, number> {
  const floors: Record<string, number> = {};
  const raise = (id: string, level: number) => {
    floors[id] = Math.max(floors[id] ?? 0, level);
  };
  const hidden = state.visibility !== 'active';
  const lowCapacity = isLowCapacity(state.capacity) && state.fidelity !== 'high';
  const capacityReported = state.capacity.sdkInt !== null;

  for (const lever of state.levers) {
    const max = lever.maxLevel;
    if (lever.motion && state.reduceMotion) raise(lever.id, max);
    if (hidden && (lever.ambient || lever.motion)) raise(lever.id, max);
    if (lever.closedLoopOnly) continue;
    if (state.fidelity === 'low') raise(lever.id, lever.ambient ? max : Math.min(1, max));
    if (state.powerSaver && (lever.ambient || lever.target === 'energy')) raise(lever.id, max);
    if (state.powerSaver && lever.target === 'gpu') raise(lever.id, Math.min(1, max));
    // A device that proved it can carry more earns these floors back, one step at a time.
    if (lowCapacity && lever.ambient && state.capacityGrant < 2) raise(lever.id, max);
    if (lowCapacity && !lever.ambient && lever.target !== 'energy' && state.capacityGrant < 1)
      raise(lever.id, Math.min(1, max));
  }
  // Rules each lever declares for itself; the reducer names no lever.
  for (const lever of state.levers) {
    if (hidden && lever.whenHidden !== undefined) raise(lever.id, lever.whenHidden);
    for (const need of lever.requires ?? []) {
      if (lacks(state, need.capability, capacityReported)) raise(lever.id, need.otherwiseLevel);
    }
  }
  return clampToLevers(state.levers, floors);
}

/**
 * Whether the device lacks a capability. Graphics capabilities count as missing only once
 * capacity has been reported (unknown is not proof of absence). A refresh cap the display
 * cannot honour saves nothing, so an unknown display counts as unable to cap.
 */
function lacks(state: GovernorState, capability: Capability, capacityReported: boolean): boolean {
  switch (capability) {
    case 'renderEffect':
      return capacityReported && !state.capacity.supportsRenderEffect;
    case 'runtimeShader':
      return capacityReported && !state.capacity.supportsRuntimeShader;
    case 'refreshCap':
      return !canCapRefresh(state);
  }
}

function leverWith(state: GovernorState, actuator: Actuator): LeverSpec | undefined {
  return state.levers.find((lever) => lever.actuator === actuator);
}

function canCapRefresh(state: GovernorState): boolean {
  const rates = state.capacity.refreshRatesHz;
  const cap = state.config.refreshCapHz;
  return rates.some((hz) => hz > cap + 1) && rates.some((hz) => hz <= cap + 1);
}

function interactionIdle(state: GovernorState, at: number): boolean {
  return at - state.lastInteractionAt >= state.config.ambientSleepAfterMs;
}

/** Closed-loop floors: ambient sleep when nobody is touching the screen. */
function dynamicFloors(state: GovernorState, at: number): Record<string, number> {
  const floors: Record<string, number> = {};
  const idle = interactionIdle(state, at);
  const thermal = thermalOf(state);
  const warm = thermal === 'warm' || thermal === 'hot' || thermal === 'critical';
  const raise = (id: string, level: number) => {
    floors[id] = Math.max(floors[id] ?? 0, level);
  };
  for (const lever of state.levers) {
    if (idle && lever.ambient) raise(lever.id, lever.maxLevel);
    if (idle && lever.whenIdle !== undefined) raise(lever.id, lever.whenIdle);
    if (warm && lever.whenWarm !== undefined) raise(lever.id, lever.whenWarm);
  }
  return floors;
}

function clampToLevers(levers: readonly LeverSpec[], levels: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const lever of levers) {
    const value = levels[lever.id];
    if (value !== undefined) out[lever.id] = Math.min(lever.maxLevel, Math.max(0, value));
  }
  return out;
}

function combine(levers: readonly LeverSpec[], ...sources: Record<string, number>[]) {
  const out: Record<string, number> = {};
  for (const lever of levers) {
    let level = 0;
    for (const source of sources) level = Math.max(level, source[lever.id] ?? 0);
    out[lever.id] = Math.min(lever.maxLevel, level);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Activation: what the closed loop may do, and which levers it may touch.
// ---------------------------------------------------------------------------------------------

const closedLoop = (state: GovernorState) => state.activation.decide === 'closed-loop';
const mayReduce = (state: GovernorState) => closedLoop(state) && state.activation.reduce;
const mayGrow = (state: GovernorState) => closedLoop(state) && state.activation.grow;

/** Levers verger governs at all; an `off` lever is left at full quality and never picked. */
const governed = (state: GovernorState) =>
  state.levers.filter((lever) => leverActivation(state.activation, lever.id) !== 'off');

/** What a sensor's readings left in the state, forgotten when the sensor is switched off. */
function forgetSensor(state: GovernorState, sensor: SensorId): GovernorState {
  switch (sensor) {
    case 'frames':
      return { ...state, frameState: 'quiet', stressMs: 0, stressEndMs: null, comfortSeen: false };
    case 'threads':
      return { ...state, jsSaturatedSince: null, mainSaturatedSince: null, jsCores: 0, mainCores: 0 };
    case 'memory':
      return { ...state, memoryLatch: NO_MEMORY_LATCH, polledMemory: null, memorySensing: false };
    case 'thermal':
      return { ...state, thermalStatus: null, headroom: null };
    case 'power':
      return { ...state, powerSaver: false };
    case 'longTasks':
      return { ...state, longTasks: [] };
    case 'network':
      return state;
  }
}

function applyActivation(state: GovernorState, activation: VergerActivation): GovernorState {
  let next: GovernorState = { ...state, activation };
  for (const sensor of SENSORS) {
    if (!activation.sense[sensor] && state.activation.sense[sensor]) next = forgetSensor(next, sensor);
  }
  return next;
}

// ---------------------------------------------------------------------------------------------
// Indexer: Unity's StateAction, with asymmetric hysteresis and upgrade back-off.
// ---------------------------------------------------------------------------------------------

function lower(
  state: GovernorState,
  steps: number,
  bottleneck: readonly LeverTarget[],
  at: number,
  action: IndexerAction,
  reason: string,
  match: true | 'primary' = true,
): GovernorState {
  if (!mayReduce(state)) {
    return { ...state, lastAction: 'stale', lastReason: `${reason}: reducing is switched off` };
  }
  const candidates = governed(state);
  let pressure = { ...state.pressure };
  let stack = [...state.stack];
  let moved = 0;
  for (let step = 0; step < steps; step += 1) {
    const effective = combine(state.levers, staticFloors(state), pressure);
    const lever = chooseLeverToLower(candidates, effective, bottleneck, match);
    if (!lever) break;
    pressure = { ...pressure, [lever.id]: (effective[lever.id] ?? 0) + 1 };
    stack = [...stack, lever.id];
    moved += 1;
  }
  if (moved === 0)
    return { ...state, lastAction: 'stale', lastReason: `${reason}: nothing left to lower` };
  const failedUpgrade = at - state.lastIncreaseAt < state.config.failedUpgradeWindowMs;
  return {
    ...state,
    pressure,
    stack,
    lastDecreaseAt: at,
    lastPressureAt: at,
    comfortSeen: false,
    upgradeAfterMs: failedUpgrade
      ? Math.min(state.upgradeAfterMs * 2, state.config.maxUpgradeAfterMs)
      : state.upgradeAfterMs,
    lastAction: action,
    lastReason: reason,
  };
}

function raiseOne(state: GovernorState, at: number, reason: string): GovernorState {
  const id = state.stack[state.stack.length - 1];
  if (id === undefined) return state;
  const current = state.pressure[id] ?? 0;
  const pressure = { ...state.pressure };
  const stack = state.stack.slice(0, -1);
  // Pressure is a level that includes the floor it was lowered from, so giving back the last
  // step leaves that floor's value behind. A lever off the stack owns no pressure: without this
  // the remainder outlives the floor and the lever never returns (found by the calm-convergence
  // property).
  if (current <= 1 || !stack.includes(id)) delete pressure[id];
  else pressure[id] = current - 1;
  return {
    ...state,
    pressure,
    stack,
    priorDepth: Math.min(state.priorDepth, state.stack.length - 1),
    lastIncreaseAt: at,
    lastAction: 'increase',
    lastReason: reason,
  };
}

function memoryOf(state: GovernorState, at: number) {
  return memoryLevelOf(state.memoryLatch, at, state.memorySensing, state.polledMemory);
}

function thermalOf(state: GovernorState): ThermalLevel {
  return thermalLevelOf(state.thermalStatus, state.headroom, state.config);
}

/** Thermal and memory rules that apply on every event, so heat is acted on even without frames. */
function applyStandingPressure(state: GovernorState, at: number): GovernorState {
  const thermal = thermalOf(state);
  const memory = memoryOf(state, at);
  const sinceThermal = at - state.lastThermalActionAt;
  let next = state;
  if (thermal === 'critical' && sinceThermal >= state.config.thermalActionDelayMs) {
    next = lower(
      next,
      next.config.fastDecreaseSteps,
      ['energy', 'gpu', 'cpu'],
      at,
      'fast-decrease',
      'thermal critical',
    );
    next = { ...next, lastThermalActionAt: at };
  } else if (thermal === 'hot' && sinceThermal >= state.config.thermalActionDelayMs) {
    next = lower(next, 1, ['energy', 'gpu', 'cpu'], at, 'decrease', 'thermal hot');
    next = { ...next, lastThermalActionAt: at };
  }
  if (
    thermal === 'warm' ||
    thermal === 'hot' ||
    thermal === 'critical' ||
    memory === 'trimmed' ||
    memory === 'low'
  ) {
    next = { ...next, lastPressureAt: at };
  }
  return next;
}

function maybeIncrease(state: GovernorState, at: number): GovernorState {
  if (state.stack.length === 0 || !mayGrow(state)) return state;
  const thermal = thermalOf(state);
  if (thermal === 'warm' || thermal === 'hot' || thermal === 'critical') return state;
  const memory = memoryOf(state, at);
  if (memory === 'trimmed' || memory === 'low') return state;
  if (state.contentionExhausted || contentionOf(state, at) !== 'none') return state;
  const lastChange = Math.max(state.lastPressureAt, state.lastDecreaseAt, state.lastIncreaseAt);
  if (at - lastChange < state.upgradeAfterMs) return state;
  // Only frames drawn within budget at the lowered levels are evidence of comfort; a screen
  // that went straight from stress to silence proves nothing, and raising on it makes every
  // new touch start at full cost and shed again. Once comfort is seen, raises continue one at
  // a time until a neutral or stressed window, or a decrease, withdraws it.
  if (!state.comfortSeen) return state;
  return raiseOne(state, at, `comfortable for ${Math.round(state.upgradeAfterMs)} ms`);
}

function resetBackoff(state: GovernorState, at: number): GovernorState {
  if (state.upgradeAfterMs <= state.config.upgradeAfterMs) return state;
  const quietFor = at - Math.max(state.lastDecreaseAt, state.lastIncreaseAt);
  if (quietFor <= state.config.resetBackoffAfterMs) return state;
  return { ...state, upgradeAfterMs: state.config.upgradeAfterMs };
}

/** Free memory against the system's low-memory threshold, as a trim severity (or none). */
function polledSeverity(
  state: GovernorState,
  event: Extract<GovernorEvent, { type: 'memory-state' }>,
): TrimSeverity | null {
  if (event.lowMemory) return 'critical';
  if (!(event.thresholdMb > 0)) return null;
  if (event.availableMb < event.thresholdMb * state.config.memoryLowFactor) return 'low';
  if (event.availableMb < event.thresholdMb * state.config.memoryModerateFactor) return 'moderate';
  return null;
}

function relieveMemory(
  before: GovernorState,
  after: GovernorState,
  at: number,
  why: string,
): GovernorState {
  const was = memoryOf(before, at);
  const now = memoryOf(after, at);
  if (now === 'low' && was !== 'low') {
    return lower(after, after.config.fastDecreaseSteps, ['memory'], at, 'fast-decrease', why);
  }
  if (now === 'trimmed' && was !== 'trimmed' && was !== 'low') {
    return lower(after, 1, ['memory'], at, 'decrease', why);
  }
  return after;
}

function onMemoryPressure(
  state: GovernorState,
  severity: TrimSeverity,
  at: number,
  source: string,
): GovernorState {
  const memoryLatch = latchMemory(state.memoryLatch, severity, at, state.config);
  const next: GovernorState = { ...state, memoryLatch, memorySensing: true, lastPressureAt: at };
  return relieveMemory(state, next, at, `${source} (${severity})`);
}

function recentLongTasks(state: GovernorState, at: number): number {
  let count = 0;
  for (const t of state.longTasks) if (at - t <= state.config.longTaskWindowMs) count += 1;
  return count;
}

/** Which thread is saturated long enough to count, judged at `at`. */
function contentionOf(state: GovernorState, at: number): Contention {
  const after = state.config.saturationAfterMs;
  if (state.jsSaturatedSince !== null && at - state.jsSaturatedSince >= after) return 'js';
  if (recentLongTasks(state, at) >= state.config.longTasksForContention) return 'js';
  if (state.mainSaturatedSince !== null && at - state.mainSaturatedSince >= after) return 'main';
  return 'none';
}

/**
 * Contention is the runtime's answer to work it does not control: a component, library or
 * loop that keeps a thread busy. Whatever the cause, the governor sheds CPU-side quality one
 * step at a time, no faster than once per saturation period, and pauses deferrable work.
 */
function applyContention(state: GovernorState, at: number): GovernorState {
  const contention = contentionOf(state, at);
  if (contention === 'none') {
    if (
      state.contentionBaseline === null &&
      !state.contentionExhausted &&
      state.contentionUnrelieved === 0
    )
      return state;
    // A load flickering across the line must not re-arm shedding each time it dips: the
    // verdict "not relievable" holds until contention has been absent for a while.
    const coolDown = 5 * state.config.saturationAfterMs;
    if (state.contentionExhausted && at - state.lastContentionActionAt < coolDown) return state;
    return {
      ...state,
      contentionBaseline: null,
      contentionUnrelieved: 0,
      contentionExhausted: false,
    };
  }
  if (state.contentionExhausted || !mayReduce(state)) return { ...state, lastPressureAt: at };
  if (at - state.lastContentionActionAt < state.config.saturationAfterMs)
    return { ...state, lastPressureAt: at };
  const longTasks = recentLongTasks(state, at);
  const detail =
    contention === 'js'
      ? `JS thread saturated (${state.jsCores.toFixed(2)} cores, ${longTasks} long tasks)`
      : `main thread saturated (${state.mainCores.toFixed(2)} cores)`;
  // A step that did not lower the saturated thread's load (or its long tasks) failed. After a
  // few failures the runtime stops shedding: the cause is code no lever reaches, and saying so
  // is more useful than stripping the app bare.
  let unrelieved = state.contentionUnrelieved;
  const base = state.contentionBaseline;
  if (base !== null) {
    const relief = state.config.contentionReliefCores;
    const relieved =
      contention === 'js'
        ? state.jsCores <= base.js - relief || longTasks < base.longTasks
        : state.mainCores <= base.main - relief;
    unrelieved = relieved ? 0 : unrelieved + 1;
  }
  if (unrelieved >= state.config.maxUnrelievedContentionSteps) {
    return {
      ...state,
      contentionUnrelieved: unrelieved,
      contentionExhausted: true,
      lastPressureAt: at,
      lastAction: 'stale',
      lastReason: `${detail}: not relieved by levers, needs a code fix`,
    };
  }
  // The JS thread is not paced by the display, so for JS contention only levers whose primary
  // resource is CPU work count; a refresh cap relieves the UI and render threads, not JS.
  const next =
    contention === 'js'
      ? lower(state, 1, ['cpu'], at, 'decrease', detail, 'primary')
      : lower(state, 1, ['cpu', 'gpu'], at, 'decrease', detail);
  return {
    ...next,
    lastContentionActionAt: at,
    lastPressureAt: at,
    contentionUnrelieved: unrelieved,
    contentionExhausted: next.lastAction === 'stale',
    contentionBaseline: { js: state.jsCores, main: state.mainCores, longTasks },
  };
}

function onFrameWindow(
  state: GovernorState,
  event: Extract<GovernorEvent, { type: 'frame-window' }>,
) {
  const frameState = classifyFrameWindow(event.window, state.config);
  const span = Math.max(0, event.window.endMs - event.window.startMs);
  let next: GovernorState = { ...state, frameState };
  if (frameState === 'stressed') {
    // Stress must be continuous: two hitches a minute apart are not 1 s of stress.
    // A window's stress reaches as far as its worst frame: a 1 s freeze leaves the next 500 ms
    // slot empty, and that gap is the same freeze, not recovery.
    const w = event.window;
    const contiguous = state.stressEndMs !== null && w.startMs <= state.stressEndMs;
    const stressMs = (contiguous ? state.stressMs : 0) + Math.max(span, w.worstMs);
    const reach = Math.max(w.endMs, w.startMs + w.worstMs);
    next = { ...next, stressMs, stressEndMs: reach, lastPressureAt: event.at, comfortSeen: false };
    if (stressMs >= state.config.downgradeAfterMs) {
      const stage = frameBottleneck(event.window);
      const where = stage === null ? '' : `, ${stage}-bound`;
      const targets = bottleneckTargets(stage, gpuMeasured(event.window));
      next = lower(
        next,
        1,
        targets,
        event.at,
        'decrease',
        `frames over budget for ${Math.round(stressMs)} ms${where}`,
      );
      next = { ...next, stressMs: 0, stressEndMs: null };
    }
  } else {
    next = { ...next, stressMs: 0, stressEndMs: null };
    if (frameState === 'neutral') next = { ...next, lastPressureAt: event.at, comfortSeen: false };
    if (frameState === 'calm') next = { ...next, comfortSeen: true };
  }
  return next;
}

function step(state: GovernorState, event: GovernorEvent): GovernorState {
  const at = Math.max(state.at, event.at);
  let next: GovernorState = { ...state, at, lastAction: 'stale', lastReason: state.lastReason };
  // A reading from a switched-off sensor is dropped here, not at the port, so replaying a raw
  // recording under a different activation gives the same result as running it live.
  const sensor = sensorOf(event);
  const input: GovernorEvent =
    sensor === null || state.activation.sense[sensor] ? event : { type: 'tick', at: event.at };
  switch (input.type) {
    case 'frame-window':
      next = onFrameWindow(next, input);
      break;
    case 'thermal':
      next = { ...next, thermalStatus: input.status, headroom: input.headroom };
      break;
    case 'memory-trim':
      next = onMemoryPressure(next, input.severity, at, 'memory trim');
      break;
    case 'memory-state': {
      const severity = polledSeverity(next, input);
      const polled: GovernorState = { ...next, polledMemory: severity, memorySensing: true };
      next = relieveMemory(
        next,
        severity === null ? polled : { ...polled, lastPressureAt: at },
        at,
        `free memory low (${severity})`,
      );
      break;
    }
    case 'thread-load': {
      const js = input.cores.js ?? 0;
      const main = input.cores.main ?? 0;
      const line = next.config.saturationCores;
      next = {
        ...next,
        jsCores: js,
        mainCores: main,
        jsSaturatedSince: js >= line ? (next.jsSaturatedSince ?? at) : null,
        mainSaturatedSince: main >= line ? (next.mainSaturatedSince ?? at) : null,
      };
      break;
    }
    case 'long-task': {
      const window = next.config.longTaskWindowMs;
      next = { ...next, longTasks: [...next.longTasks.filter((t) => at - t <= window), at] };
      break;
    }
    case 'power':
      next = { ...next, powerSaver: input.saver };
      break;
    case 'interaction':
      next = { ...next, lastInteractionAt: at };
      break;
    case 'app-state':
      next = { ...next, visibility: input.state };
      if (input.state === 'active') next = { ...next, lastInteractionAt: at };
      break;
    case 'preferences':
      next = { ...next, reduceMotion: input.reduceMotion, fidelity: input.fidelity };
      break;
    case 'activation':
      next = applyActivation(next, input.activation);
      break;
    case 'config':
      next = { ...next, config: input.config, upgradeAfterMs: input.config.upgradeAfterMs };
      break;
    case 'network':
    case 'tick':
      break;
  }
  next = applyStandingPressure(next, at);
  next = applyContention(next, at);
  if (next.lastAction === 'stale') next = maybeIncrease(next, at);
  next = resetBackoff(next, at);
  return next;
}

/** Folds one event into the governor. Pure: same state and event, same result. */
export function reduceGovernor(state: GovernorState, event: GovernorEvent): GovernorState {
  const stepped = step(state, event);
  const published = snapshotOf(stepped, stepped.at);
  const next: GovernorState = {
    ...stepped,
    heldRefreshCapHz: published.refreshCapHz,
    heldGlobalMotion: published.globalReducedMotion,
  };
  const before = snapshotOf(state, state.at);
  const after = snapshotOf(next, next.at);
  return outputsEqual(before, after)
    ? { ...next, version: state.version }
    : { ...next, version: state.version + 1 };
}

// ---------------------------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------------------------

function optionalConcurrency(state: GovernorState, at: number): number {
  const admission = state.activation.admission;
  if (admission === 'off') return state.config.maxOptionalConcurrency;
  // Measured pressure counts only when admission is applied and the loop is deciding.
  const closedLoop = admission === 'apply' && state.activation.decide === 'closed-loop';
  if (state.visibility !== 'active' || state.powerSaver) return 0;
  if (closedLoop && contentionOf(state, at) !== 'none') return 0;
  const thermal = thermalOf(state);
  const memory = memoryOf(state, at);
  if (closedLoop && (thermal === 'critical' || memory === 'low')) return 0;
  const constrained =
    isLowCapacity(state.capacity) ||
    state.capacity.totalMemoryBytes === null ||
    (closedLoop &&
      (thermal === 'hot' || thermal === 'warm' || memory === 'trimmed' || state.stack.length > 0));
  return constrained
    ? Math.min(1, state.config.maxOptionalConcurrency)
    : state.config.maxOptionalConcurrency;
}

/** The governor's published output at time `at` (ambient sleep depends on elapsed time). */
export function snapshotOf(state: GovernorState, at: number = state.at): GovernorSnapshot {
  const base = staticFloors(state);
  const baseline = combine(state.levers, base);
  const loop = closedLoop(state)
    ? combine(state.levers, base, state.pressure, dynamicFloors(state, at))
    : baseline;
  // Per lever: `apply` publishes the decision, `shadow` the baseline (the decision is only
  // proposed), `off` full quality, ungoverned.
  const levels: Record<string, number> = {};
  const proposed: Record<string, number> = {};
  const baselineLevels: Record<string, number> = {};
  for (const lever of state.levers) {
    const activation = leverActivation(state.activation, lever.id);
    const decided = loop[lever.id] ?? 0;
    proposed[lever.id] = activation === 'off' ? 0 : decided;
    baselineLevels[lever.id] = activation === 'off' ? 0 : (baseline[lever.id] ?? 0);
    levels[lever.id] =
      activation === 'apply' ? decided : activation === 'shadow' ? (baseline[lever.id] ?? 0) : 0;
  }
  const hardwareAllowed = state.activation.hardware && state.hardware;
  const thermal = thermalOf(state);
  const idle = interactionIdle(state, at);
  const cool = thermal === 'unknown' || thermal === 'nominal';
  const hardware = hardwareOf(state, at, levels);
  return {
    version: state.version,
    at,
    mode: state.mode,
    levels,
    proposedLevels: proposed,
    baselineLevels,
    frameState: state.frameState,
    thermal: thermalOf(state),
    memory: memoryOf(state, at),
    powerSaver: state.powerSaver,
    visibility: state.visibility,
    interactionIdle: interactionIdle(state, at),
    optionalConcurrency: optionalConcurrency(state, at),
    contention: contentionOf(state, at),
    contentionExhausted: state.contentionExhausted,
    // Hardware levers are new behaviour, so they act only where activation allows them; the
    // shadow preset keeps the app exactly as it runs today and records the proposal instead.
    refreshCapHz: hardware.refreshCapHz,
    cpuBoost:
      hardwareAllowed &&
      state.capacity.supportsCpuHints &&
      state.visibility === 'active' &&
      !state.powerSaver &&
      !idle &&
      cool,
    globalReducedMotion: hardware.globalReducedMotion,
    ...splitPressure(state),
    lastAction: state.lastAction,
    lastReason: state.lastReason,
    activation: state.activation,
  };
}

/**
 * App-wide hardware outputs. Gesture freeze: while a finger has been on the screen within
 * `gestureQuietMs`, a change that lowers quality (a new cap, forcing reduced motion) waits,
 * and the last published values hold, so a tap never switches the display mode twice. A
 * change that raises quality applies at once, and heat (hot or worse) overrides the freeze.
 */
function hardwareOf(
  state: GovernorState,
  at: number,
  levels: Readonly<Record<string, number>>,
): { refreshCapHz: number | null; globalReducedMotion: boolean } {
  const allowed = state.activation.hardware && state.hardware;
  const capLever = leverWith(state, 'refresh-cap');
  const motionLever = leverWith(state, 'global-reduced-motion');
  const applied = (lever: LeverSpec | undefined): lever is LeverSpec =>
    allowed && lever !== undefined && leverActivation(state.activation, lever.id) === 'apply';
  const wantCap =
    applied(capLever) && (levels[capLever.id] ?? 0) >= 1 && canCapRefresh(state)
      ? state.config.refreshCapHz
      : null;
  const wantMotion = applied(motionLever) && (levels[motionLever.id] ?? 0) >= 1;
  const thermal = thermalOf(state);
  const touching = at - state.lastInteractionAt < state.config.gestureQuietMs;
  const forced = thermal === 'hot' || thermal === 'critical';
  if (!touching || forced) return { refreshCapHz: wantCap, globalReducedMotion: wantMotion };
  return {
    refreshCapHz: wantCap === null ? null : state.heldRefreshCapHz,
    globalReducedMotion: wantMotion ? state.heldGlobalMotion : false,
  };
}

/** The loop's own pressure, apart from what remains of the learned starting point. */
function splitPressure(state: GovernorState): {
  pressure: Record<string, number>;
  priorHeld: Record<string, number>;
} {
  const priorHeld: Record<string, number> = {};
  for (const id of state.stack.slice(0, state.priorDepth)) priorHeld[id] = (priorHeld[id] ?? 0) + 1;
  const pressure: Record<string, number> = {};
  for (const [id, level] of Object.entries(clampToLevers(state.levers, { ...state.pressure }))) {
    const own = level - (priorHeld[id] ?? 0);
    if (own > 0) pressure[id] = own;
  }
  return { pressure, priorHeld };
}

function outputsEqual(a: GovernorSnapshot, b: GovernorSnapshot): boolean {
  if (
    a.frameState !== b.frameState ||
    a.thermal !== b.thermal ||
    a.memory !== b.memory ||
    a.powerSaver !== b.powerSaver ||
    a.visibility !== b.visibility ||
    a.interactionIdle !== b.interactionIdle ||
    a.optionalConcurrency !== b.optionalConcurrency ||
    a.contention !== b.contention ||
    a.contentionExhausted !== b.contentionExhausted ||
    a.refreshCapHz !== b.refreshCapHz ||
    a.cpuBoost !== b.cpuBoost ||
    a.globalReducedMotion !== b.globalReducedMotion ||
    a.activation !== b.activation
  ) {
    return false;
  }
  for (const key of Object.keys(b.proposedLevels)) {
    if (
      a.proposedLevels[key] !== b.proposedLevels[key] ||
      a.levels[key] !== b.levels[key] ||
      a.baselineLevels[key] !== b.baselineLevels[key] ||
      a.pressure[key] !== b.pressure[key] ||
      a.priorHeld[key] !== b.priorHeld[key]
    )
      return false;
  }
  return true;
}

/**
 * When the next change that depends only on elapsed time is due, so the caller schedules one
 * tick instead of polling: ambient sleep, contention starting after a sustained saturation,
 * the next contention step while it lasts, long tasks ageing out, and an upgrade becoming due.
 * Native sensors report only changes, so without this a steady saturated thread would never
 * be acted on.
 */
export function nextTimedChangeAt(state: GovernorState): number | null {
  const now = state.at;
  const { saturationAfterMs, longTaskWindowMs, ambientSleepAfterMs } = state.config;
  const candidates: number[] = [];
  if (!interactionIdle(state, now)) candidates.push(state.lastInteractionAt + ambientSleepAfterMs);
  candidates.push(state.lastInteractionAt + state.config.gestureQuietMs);
  for (const since of [state.jsSaturatedSince, state.mainSaturatedSince]) {
    if (since === null) continue;
    candidates.push(since + saturationAfterMs, state.lastContentionActionAt + saturationAfterMs);
  }
  for (const t of state.longTasks) candidates.push(t + longTaskWindowMs + 1);
  if (state.contentionExhausted)
    candidates.push(state.lastContentionActionAt + 5 * saturationAfterMs + 1);
  if (state.stack.length > 0) {
    const lastChange = Math.max(state.lastPressureAt, state.lastDecreaseAt, state.lastIncreaseAt);
    candidates.push(lastChange + state.upgradeAfterMs);
  }
  let next: number | null = null;
  for (const t of candidates) if (t > now && (next === null || t < next)) next = t;
  return next;
}
