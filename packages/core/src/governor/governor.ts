import { DEFAULT_GOVERNOR_CONFIG } from './config';
import { classifyFrameWindow } from './frames';
import { chooseLeverToLower, validateLevers } from './levers';
import {
  latchMemory,
  type MemoryLatch,
  memoryLevelOf,
  NO_MEMORY_LATCH,
  thermalLevelOf,
} from './signals';
import type {
  AppVisibility,
  CapacityFacts,
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
}

export function createGovernor(options: CreateGovernorOptions): GovernorState {
  validateLevers(options.levers);
  const config = { ...DEFAULT_GOVERNOR_CONFIG, ...options.config };
  return {
    config,
    levers: options.levers,
    capacity: options.capacity ?? UNKNOWN_CAPACITY,
    mode: options.mode ?? 'active',
    version: 0,
    at: options.at,
    pressure: {},
    stack: [],
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
    lastAction: 'stale',
    lastReason: 'start',
  };
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
    if (state.fidelity === 'low') raise(lever.id, lever.ambient ? max : Math.min(1, max));
    if (state.powerSaver && (lever.ambient || lever.target === 'energy')) raise(lever.id, max);
    if (state.powerSaver && lever.target === 'gpu') raise(lever.id, Math.min(1, max));
    if (lowCapacity && lever.ambient) raise(lever.id, max);
    if (lowCapacity && !lever.ambient && lever.target !== 'energy') raise(lever.id, Math.min(1, max));
  }
  if (hidden) raise('prefetch', 2);
  if (capacityReported && !state.capacity.supportsRenderEffect) {
    raise('blur', 2);
    raise('glass-material', 2);
  } else if (capacityReported && !state.capacity.supportsRuntimeShader) {
    raise('glass-material', 1);
  }
  return clampToLevers(state.levers, floors);
}

function interactionIdle(state: GovernorState, at: number): boolean {
  return at - state.lastInteractionAt >= state.config.ambientSleepAfterMs;
}

/** Closed-loop floors: ambient sleep when nobody is touching the screen. */
function dynamicFloors(state: GovernorState, at: number): Record<string, number> {
  const floors: Record<string, number> = {};
  if (interactionIdle(state, at)) {
    for (const lever of state.levers) if (lever.ambient) floors[lever.id] = lever.maxLevel;
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
// Indexer: Unity's StateAction, with asymmetric hysteresis and upgrade back-off.
// ---------------------------------------------------------------------------------------------

function lower(
  state: GovernorState,
  steps: number,
  bottleneck: readonly LeverTarget[],
  at: number,
  action: IndexerAction,
  reason: string,
): GovernorState {
  let pressure = { ...state.pressure };
  let stack = [...state.stack];
  let moved = 0;
  for (let step = 0; step < steps; step += 1) {
    const effective = combine(state.levers, staticFloors(state), pressure);
    const lever = chooseLeverToLower(state.levers, effective, bottleneck);
    if (!lever) break;
    pressure = { ...pressure, [lever.id]: (effective[lever.id] ?? 0) + 1 };
    stack = [...stack, lever.id];
    moved += 1;
  }
  if (moved === 0) return { ...state, lastAction: 'stale', lastReason: `${reason}: nothing left to lower` };
  const failedUpgrade = at - state.lastIncreaseAt < state.config.failedUpgradeWindowMs;
  return {
    ...state,
    pressure,
    stack,
    lastDecreaseAt: at,
    lastPressureAt: at,
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
  if (current <= 1) delete pressure[id];
  else pressure[id] = current - 1;
  return {
    ...state,
    pressure,
    stack: state.stack.slice(0, -1),
    lastIncreaseAt: at,
    lastAction: 'increase',
    lastReason: reason,
  };
}

function thermalOf(state: GovernorState): ThermalLevel {
  return thermalLevelOf(state.thermalStatus, state.headroom, state.config);
}

/** Thermal and memory rules that apply on every event, so heat is acted on even without frames. */
function applyStandingPressure(state: GovernorState, at: number): GovernorState {
  const thermal = thermalOf(state);
  const memory = memoryLevelOf(state.memoryLatch, at, state.memorySensing);
  const sinceThermal = at - state.lastThermalActionAt;
  let next = state;
  if (thermal === 'critical' && sinceThermal >= state.config.thermalActionDelayMs) {
    next = lower(next, next.config.fastDecreaseSteps, ['energy', 'gpu', 'cpu'], at, 'fast-decrease', 'thermal critical');
    next = { ...next, lastThermalActionAt: at };
  } else if (thermal === 'hot' && sinceThermal >= state.config.thermalActionDelayMs) {
    next = lower(next, 1, ['energy', 'gpu', 'cpu'], at, 'decrease', 'thermal hot');
    next = { ...next, lastThermalActionAt: at };
  }
  if (thermal === 'warm' || thermal === 'hot' || thermal === 'critical' || memory === 'trimmed' || memory === 'low') {
    next = { ...next, lastPressureAt: at };
  }
  return next;
}

function maybeIncrease(state: GovernorState, at: number): GovernorState {
  if (state.stack.length === 0) return state;
  const thermal = thermalOf(state);
  if (thermal === 'warm' || thermal === 'hot' || thermal === 'critical') return state;
  const memory = memoryLevelOf(state.memoryLatch, at, state.memorySensing);
  if (memory === 'trimmed' || memory === 'low') return state;
  const lastChange = Math.max(state.lastPressureAt, state.lastDecreaseAt, state.lastIncreaseAt);
  if (at - lastChange < state.upgradeAfterMs) return state;
  return raiseOne(state, at, `comfortable for ${Math.round(state.upgradeAfterMs)} ms`);
}

function resetBackoff(state: GovernorState, at: number): GovernorState {
  if (state.upgradeAfterMs <= state.config.upgradeAfterMs) return state;
  const quietFor = at - Math.max(state.lastDecreaseAt, state.lastIncreaseAt);
  if (quietFor <= state.config.resetBackoffAfterMs) return state;
  return { ...state, upgradeAfterMs: state.config.upgradeAfterMs };
}

function onFrameWindow(state: GovernorState, event: Extract<GovernorEvent, { type: 'frame-window' }>) {
  const frameState = classifyFrameWindow(event.window, state.config);
  const span = Math.max(0, event.window.endMs - event.window.startMs);
  let next: GovernorState = { ...state, frameState };
  if (frameState === 'stressed') {
    const stressMs = state.stressMs + span;
    next = { ...next, stressMs, lastPressureAt: event.at };
    if (stressMs >= state.config.downgradeAfterMs) {
      next = lower(next, 1, ['gpu', 'cpu'], event.at, 'decrease', `frames over budget for ${Math.round(stressMs)} ms`);
      next = { ...next, stressMs: 0 };
    }
  } else {
    next = { ...next, stressMs: 0 };
    if (frameState === 'neutral') next = { ...next, lastPressureAt: event.at };
  }
  return next;
}

function step(state: GovernorState, event: GovernorEvent): GovernorState {
  const at = Math.max(state.at, event.at);
  let next: GovernorState = { ...state, at, lastAction: 'stale', lastReason: state.lastReason };
  switch (event.type) {
    case 'frame-window':
      next = onFrameWindow(next, event);
      break;
    case 'thermal':
      next = { ...next, thermalStatus: event.status, headroom: event.headroom };
      break;
    case 'memory-trim': {
      const before = memoryLevelOf(next.memoryLatch, at, next.memorySensing);
      const memoryLatch = latchMemory(next.memoryLatch, event.severity, at, next.config);
      next = { ...next, memoryLatch, memorySensing: true, lastPressureAt: at };
      const after = memoryLevelOf(memoryLatch, at, true);
      if (after === 'low' && before !== 'low') {
        next = lower(next, next.config.fastDecreaseSteps, ['memory'], at, 'fast-decrease', `memory trim (${event.severity})`);
      } else if (after === 'trimmed' && before !== 'trimmed' && before !== 'low') {
        next = lower(next, 1, ['memory'], at, 'decrease', 'memory trim (moderate)');
      }
      break;
    }
    case 'power':
      next = { ...next, powerSaver: event.saver };
      break;
    case 'interaction':
      next = { ...next, lastInteractionAt: at };
      break;
    case 'app-state':
      next = { ...next, visibility: event.state };
      if (event.state === 'active') next = { ...next, lastInteractionAt: at };
      break;
    case 'preferences':
      next = { ...next, reduceMotion: event.reduceMotion, fidelity: event.fidelity };
      break;
    case 'tick':
      break;
  }
  next = applyStandingPressure(next, at);
  if (next.lastAction === 'stale') next = maybeIncrease(next, at);
  next = resetBackoff(next, at);
  return next;
}

/** Folds one event into the governor. Pure: same state and event, same result. */
export function reduceGovernor(state: GovernorState, event: GovernorEvent): GovernorState {
  const next = step(state, event);
  const before = snapshotOf(state, state.at);
  const after = snapshotOf(next, next.at);
  return outputsEqual(before, after) ? { ...next, version: state.version } : { ...next, version: state.version + 1 };
}

// ---------------------------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------------------------

function optionalConcurrency(state: GovernorState, at: number, closedLoop: boolean): number {
  if (state.visibility !== 'active' || state.powerSaver) return 0;
  const thermal = thermalOf(state);
  const memory = memoryLevelOf(state.memoryLatch, at, state.memorySensing);
  if (closedLoop && (thermal === 'critical' || memory === 'low')) return 0;
  const constrained =
    isLowCapacity(state.capacity) ||
    state.capacity.totalMemoryBytes === null ||
    (closedLoop && (thermal === 'hot' || thermal === 'warm' || memory === 'trimmed' || state.stack.length > 0));
  return constrained ? Math.min(1, state.config.maxOptionalConcurrency) : state.config.maxOptionalConcurrency;
}

/** The governor's published output at time `at` (ambient sleep depends on elapsed time). */
export function snapshotOf(state: GovernorState, at: number = state.at): GovernorSnapshot {
  const base = staticFloors(state);
  const proposed = combine(state.levers, base, state.pressure, dynamicFloors(state, at));
  const baseline = combine(state.levers, base);
  const active = state.mode === 'active';
  return {
    version: state.version,
    at,
    mode: state.mode,
    levels: active ? proposed : baseline,
    proposedLevels: proposed,
    frameState: state.frameState,
    thermal: thermalOf(state),
    memory: memoryLevelOf(state.memoryLatch, at, state.memorySensing),
    powerSaver: state.powerSaver,
    visibility: state.visibility,
    interactionIdle: interactionIdle(state, at),
    optionalConcurrency: optionalConcurrency(state, at, active),
    lastAction: state.lastAction,
    lastReason: state.lastReason,
  };
}

function outputsEqual(a: GovernorSnapshot, b: GovernorSnapshot): boolean {
  if (
    a.frameState !== b.frameState ||
    a.thermal !== b.thermal ||
    a.memory !== b.memory ||
    a.powerSaver !== b.powerSaver ||
    a.visibility !== b.visibility ||
    a.interactionIdle !== b.interactionIdle ||
    a.optionalConcurrency !== b.optionalConcurrency
  ) {
    return false;
  }
  for (const key of Object.keys(b.proposedLevels)) {
    if (a.proposedLevels[key] !== b.proposedLevels[key] || a.levels[key] !== b.levels[key]) return false;
  }
  return true;
}

/** When the next time-only change (ambient sleep) will happen, so callers can schedule one tick. */
export function nextTimedChangeAt(state: GovernorState): number | null {
  if (interactionIdle(state, state.at)) return null;
  if (!state.levers.some((lever) => lever.ambient)) return null;
  return state.lastInteractionAt + state.config.ambientSleepAfterMs;
}
