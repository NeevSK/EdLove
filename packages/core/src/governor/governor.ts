import { DEFAULT_GOVERNOR_CONFIG } from './config';
import { bottleneckTargets, classifyFrameWindow, frameBottleneck } from './frames';
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

  /** When each role first crossed the saturation line, or null while below it. */
  readonly jsSaturatedSince: number | null;
  readonly mainSaturatedSince: number | null;
  readonly jsCores: number;
  readonly mainCores: number;
  /** Recent long-task end times, newest last, pruned to the long-task window. */
  readonly longTasks: readonly number[];
  readonly lastContentionActionAt: number;

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
    jsSaturatedSince: null,
    mainSaturatedSince: null,
    jsCores: 0,
    mainCores: 0,
    longTasks: [],
    lastContentionActionAt: Number.NEGATIVE_INFINITY,
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
    if (lever.closedLoopOnly) continue;
    if (state.fidelity === 'low') raise(lever.id, lever.ambient ? max : Math.min(1, max));
    if (state.powerSaver && (lever.ambient || lever.target === 'energy')) raise(lever.id, max);
    if (state.powerSaver && lever.target === 'gpu') raise(lever.id, Math.min(1, max));
    if (lowCapacity && lever.ambient) raise(lever.id, max);
    if (lowCapacity && !lever.ambient && lever.target !== 'energy') raise(lever.id, Math.min(1, max));
  }
  if (hidden) raise('prefetch', 2);
  // A cap the display cannot honour saves nothing, so the lever counts as spent.
  if (!canCapRefresh(state)) raise('refresh-rate', 1);
  if (capacityReported && !state.capacity.supportsRenderEffect) {
    raise('blur', 2);
    raise('glass-material', 2);
  } else if (capacityReported && !state.capacity.supportsRuntimeShader) {
    raise('glass-material', 1);
  }
  return clampToLevers(state.levers, floors);
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
  if (interactionIdle(state, at)) {
    for (const lever of state.levers) if (lever.ambient) floors[lever.id] = lever.maxLevel;
    // Nobody is touching the screen: a high refresh rate draws nothing anyone needs.
    floors['refresh-rate'] = 1;
  }
  const thermal = thermalOf(state);
  if (thermal === 'warm' || thermal === 'hot' || thermal === 'critical') floors['refresh-rate'] = 1;
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

function onMemoryPressure(state: GovernorState, severity: TrimSeverity, at: number, source: string): GovernorState {
  const before = memoryLevelOf(state.memoryLatch, at, state.memorySensing);
  const memoryLatch = latchMemory(state.memoryLatch, severity, at, state.config);
  let next: GovernorState = { ...state, memoryLatch, memorySensing: true, lastPressureAt: at };
  const after = memoryLevelOf(memoryLatch, at, true);
  if (after === 'low' && before !== 'low') {
    next = lower(next, next.config.fastDecreaseSteps, ['memory'], at, 'fast-decrease', `${source} (${severity})`);
  } else if (after === 'trimmed' && before !== 'trimmed' && before !== 'low') {
    next = lower(next, 1, ['memory'], at, 'decrease', `${source} (${severity})`);
  }
  return next;
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
  if (contention === 'none') return state;
  if (at - state.lastContentionActionAt < state.config.saturationAfterMs) return { ...state, lastPressureAt: at };
  const detail =
    contention === 'js'
      ? `JS thread saturated (${state.jsCores.toFixed(2)} cores, ${recentLongTasks(state, at)} long tasks)`
      : `main thread saturated (${state.mainCores.toFixed(2)} cores)`;
  const targets: readonly LeverTarget[] = contention === 'js' ? ['cpu'] : ['cpu', 'gpu'];
  const next = lower(state, 1, targets, at, 'decrease', detail);
  return { ...next, lastContentionActionAt: at, lastPressureAt: at };
}

function onFrameWindow(state: GovernorState, event: Extract<GovernorEvent, { type: 'frame-window' }>) {
  const frameState = classifyFrameWindow(event.window, state.config);
  const span = Math.max(0, event.window.endMs - event.window.startMs);
  let next: GovernorState = { ...state, frameState };
  if (frameState === 'stressed') {
    const stressMs = state.stressMs + span;
    next = { ...next, stressMs, lastPressureAt: event.at };
    if (stressMs >= state.config.downgradeAfterMs) {
      const stage = frameBottleneck(event.window);
      const where = stage === null ? '' : `, ${stage}-bound`;
      next = lower(next, 1, bottleneckTargets(stage), event.at, 'decrease', `frames over budget for ${Math.round(stressMs)} ms${where}`);
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
    case 'memory-trim':
      next = onMemoryPressure(next, event.severity, at, 'memory trim');
      break;
    case 'memory-state': {
      const severity = polledSeverity(next, event);
      next = severity === null ? { ...next, memorySensing: true } : onMemoryPressure(next, severity, at, 'free memory low');
      break;
    }
    case 'thread-load': {
      const js = event.cores.js ?? 0;
      const main = event.cores.main ?? 0;
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
  next = applyContention(next, at);
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
  if (closedLoop && contentionOf(state, at) !== 'none') return 0;
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
  const levels = active ? proposed : baseline;
  const thermal = thermalOf(state);
  const idle = interactionIdle(state, at);
  const cool = thermal === 'unknown' || thermal === 'nominal';
  return {
    version: state.version,
    at,
    mode: state.mode,
    levels,
    proposedLevels: proposed,
    frameState: state.frameState,
    thermal: thermalOf(state),
    memory: memoryLevelOf(state.memoryLatch, at, state.memorySensing),
    powerSaver: state.powerSaver,
    visibility: state.visibility,
    interactionIdle: interactionIdle(state, at),
    optionalConcurrency: optionalConcurrency(state, at, active),
    contention: contentionOf(state, at),
    // Hardware levers are new behaviour, so only active mode applies them; shadow mode keeps
    // the app exactly as it runs today and records the proposal in `proposedLevels`.
    refreshCapHz:
      active && (levels['refresh-rate'] ?? 0) >= 1 && canCapRefresh(state) ? state.config.refreshCapHz : null,
    cpuBoost:
      active &&
      state.capacity.supportsCpuHints &&
      state.visibility === 'active' &&
      !state.powerSaver &&
      !idle &&
      cool,
    globalReducedMotion: active && (levels['global-motion'] ?? 0) >= 1,
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
    a.optionalConcurrency !== b.optionalConcurrency ||
    a.contention !== b.contention ||
    a.refreshCapHz !== b.refreshCapHz ||
    a.cpuBoost !== b.cpuBoost ||
    a.globalReducedMotion !== b.globalReducedMotion
  ) {
    return false;
  }
  for (const key of Object.keys(b.proposedLevels)) {
    if (a.proposedLevels[key] !== b.proposedLevels[key] || a.levels[key] !== b.levels[key]) return false;
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
  for (const since of [state.jsSaturatedSince, state.mainSaturatedSince]) {
    if (since === null) continue;
    candidates.push(since + saturationAfterMs, state.lastContentionActionAt + saturationAfterMs);
  }
  for (const t of state.longTasks) candidates.push(t + longTaskWindowMs + 1);
  if (state.stack.length > 0) {
    const lastChange = Math.max(state.lastPressureAt, state.lastDecreaseAt, state.lastIncreaseAt);
    candidates.push(lastChange + state.upgradeAfterMs);
  }
  let next: number | null = null;
  for (const t of candidates) if (t > now && (next === null || t < next)) next = t;
  return next;
}
