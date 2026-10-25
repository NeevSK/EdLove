import {
  activationForMode,
  leverActivation,
  SENSORS,
  sensorOf,
  type SensorId,
  type VergerActivation,
} from './activation';
import type { DataBudgetState } from './dataBudget';
import { DEFAULT_VERGER_CONFIG } from './config';
import { bottleneckTargets, classifyFrameWindow, frameBottleneck, gpuMeasured } from './frames';
import {
  accountsRelievedBy,
  estimateAccounts,
  RESOURCE_ACCOUNTS,
  type ResourceAccount,
} from './demand';
import { chooseLeverToLower, relieves, validateLevers } from './levers';
import { stepQualityCost } from './quality';
import {
  isBatteryLow,
  latchMemory,
  type MemoryLatch,
  memoryLevelOf,
  NO_MEMORY_LATCH,
  THERMAL_RANK,
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
  FrameWindow,
  LeverGain,
  VergerConfig,
  VergerEvent,
  RunMode,
  VergerSnapshot,
  IndexerAction,
  LeverSpec,
  LeverEnvelope,
  LeverTarget,
  BatteryState,
  CapacityClass,
  NetworkLimit,
  NetworkState,
  ThermalLevel,
  ThermalSource,
  ThermalStatus,
  TrimSeverity,
  StorageLevel,
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

export const UNKNOWN_NETWORK: NetworkState = {
  transport: null,
  validated: null,
  metered: null,
  downKbps: null,
  dataSaver: null,
};

export const UNKNOWN_BATTERY: BatteryState = {
  levelPercent: null,
  pluggedIn: null,
  temperatureC: null,
};


const batteryLow = (state: VergerState) =>
  isBatteryLow(state.battery, state.config.batteryLowPercent) || energyShort(state);

/**
 * Hours of battery left at the drain measured while unplugged (R5): the level over the least-
 * squares drain of `levelTrace`. Null without a third of the window of readings, a drop of
 * `energyDrainMinDropPercent`, or a drain at all.
 */
function batteryHoursLeft(state: VergerState): number | null {
  const level = state.battery.levelPercent;
  const trace = state.levelTrace;
  const first = trace[0];
  const last = trace[trace.length - 1];
  if (level === null || state.battery.pluggedIn !== false || !first || !last) return null;
  const c = state.config;
  if (last[0] - first[0] < c.energyDrainWindowMs / 3 || first[1] - last[1] < c.energyDrainMinDropPercent)
    return null;
  const slope = slopeOf(trace, 2);
  if (slope === null || slope >= 0) return null;
  return level / (-slope * 3600);
}

/** The energy setpoint (R5): fewer hours left than `energyReserveHours`. */
function energyShort(state: VergerState): boolean {
  const hours = batteryHoursLeft(state);
  return hours !== null && hours < state.config.energyReserveHours;
}

/** No usable network: none at all, or one the platform could not validate. Unknown is not offline. */
const offline = (n: NetworkState) => n.transport === 'none' || n.validated === false;
/** Data Saver restricts this app; allowlisted means the user exempted it. */
const savingData = (n: NetworkState) => n.dataSaver === 'enabled';

/** The phone's class from its memory; the OS's own low-RAM flag always means low. */
export function capacityClassOf(
  capacity: CapacityFacts,
  config: Pick<VergerConfig, 'lowCapacityBelowBytes' | 'midCapacityBelowBytes'>,
): CapacityClass {
  if (capacity.isLowRamDevice === true) return 'low';
  const bytes = capacity.totalMemoryBytes;
  if (bytes === null) return 'unknown';
  if (bytes < config.lowCapacityBelowBytes) return 'low';
  return bytes < config.midCapacityBelowBytes ? 'mid' : 'high';
}

/**
 * The network's limit on optional data, strongest first. Unstable: back from offline less than
 * `networkSettleMs` ago, since a link that just dropped often drops again. Unknown limits nothing.
 */
export function networkLimitOf(state: VergerState, at: number = state.at): NetworkLimit {
  const n = state.network;
  if (offline(n)) return 'offline';
  if (savingData(n)) return 'data-saver';
  if (state.lastOfflineAt !== null && at - state.lastOfflineAt < state.config.networkSettleMs)
    return 'unstable';
  if (n.downKbps !== null && n.downKbps < state.config.slowNetworkKbps) return 'slow';
  return 'none';
}

export interface VergerState {
  readonly config: VergerConfig;
  readonly levers: readonly LeverSpec[];
  readonly capacity: CapacityFacts;
  readonly mode: RunMode;
  readonly version: number;
  readonly at: number;

  /** Levels the closed loop has lowered levers to, before floors. */
  readonly pressure: Readonly<Record<string, number>>;
  /** Lowered lever ids in order, restored last-in first-out. */
  readonly stack: readonly string[];
  /**
   * The sensor whose readings last lowered each lever. A sensor switched off takes its lowering
   * with it (the deaf-sensor rule; found by the ADR D5.2 property at 3000 runs).
   */
  readonly pressureCause: Readonly<Record<string, SensorId>>;
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
  /** Heat as published, with hysteresis (P4): rises at once, steps down after a band and a dwell. */
  readonly thermalHeld: ThermalLevel;
  /** Since when the exit-band reading has been below `thermalHeld`; null while it is not. */
  readonly thermalCoolerSince: number | null;
  /** Recent headroom and battery temperature readings `[at, value]`, for the heat trend (R1). */
  readonly headroomTrace: readonly (readonly [number, number])[];
  readonly batteryTrace: readonly (readonly [number, number])[];
  /** Battery level readings `[at, percent]` while unplugged, for the drain (R5). */
  readonly levelTrace: readonly (readonly [number, number])[];
  /** The last time heat, as verger acts on it, was warm or worse (P5); null if never. */
  readonly heatTouchedAt: number | null;
  /** When the last paced raise was published (P5). */
  readonly heatStepAt: number;
  readonly memoryLatch: MemoryLatch;
  readonly memorySensing: boolean;

  readonly powerSaver: boolean;
  readonly battery: BatteryState;
  readonly network: NetworkState;
  /** When the network was last seen offline; null if never (or the network sensor is off). */
  readonly lastOfflineAt: number | null;
  readonly dataBudget: DataBudgetState;
  /** Free storage as last reported; null until then, or while the storage sensor is deaf. */
  readonly storageFreeBytes: number | null;
  /** Storage was low and has not yet risen past the exit band (P4). */
  readonly storageLowHeld: boolean;
  readonly visibility: AppVisibility;
  readonly lastInteractionAt: number;
  readonly reduceMotion: boolean;
  readonly fidelity: FidelityPreference;

  /** When each role first crossed the saturation line, or null while below it. */
  readonly jsSaturatedSince: number | null;
  readonly mainSaturatedSince: number | null;
  readonly jsCores: number;
  readonly mainCores: number;
  /** The browser's CPU pressure (R10); null until reported or while the threads sensor is deaf. */
  readonly computePressure: 'nominal' | 'fair' | 'serious' | 'critical' | null;
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
  /**
   * The frames loop's stress episode (P8): smoothed frame cost when it first lowered, the budget,
   * and how many steps it has taken since. Null outside an episode.
   */
  readonly frameEpisode: {
    readonly startCostMs: number;
    readonly targetMs: number;
    readonly steps: number;
    /** Quality given up by the episode's steps, as `stepQualityCost` (R7). */
    readonly spent: number;
    /** It began more than `frameArrivalMs` after an announced screen: work on a screen shown. */
    readonly midScreen: boolean;
  } | null;
  /** Frame cost over stressed windows, smoothed (an EWMA of 0.5), to judge relief through noise. */
  readonly frameCostMs: number | null;
  /** A frame report has arrived since frames were last heard from (R9: the boost acts on them). */
  readonly framesHeard: boolean;
  /** The episode's lowerings did not relieve the frames: no more until the stress ends. */
  readonly framesExhausted: boolean;
  /** Frame load (average cost over budget), smoothed (an EWMA of 0.5) within one frame state. */
  readonly frameLoad: number | null;
  /** A single-step lowering published at `at`, waiting for a frame window after it (P6). */
  readonly gainProbe: {
    readonly lever: string;
    readonly beforeLoad: number;
    readonly at: number;
    /** A step down (lowered) or a step given back (raised). */
    readonly direction: 'lowered' | 'raised';
  } | null;
  /** Each lever's measured gain (P6), learned this session. */
  readonly leverGains: Readonly<Record<string, LeverGain>>;
  /** The screen the app last announced (R3); null until one is. */
  readonly screen: string | null;
  /** When it was announced; null until one is. */
  readonly screenAt: number | null;
  /** Frames before this time are the announced transition's, not evidence (R3). */
  readonly transitionUntil: number;
  /** p5: the frames-caused pressure verger settled on per screen, applied on return (R4). */
  readonly screenMemory: Readonly<Record<string, Readonly<Record<string, number>>>>;

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
  /** The decisions last published, so a lowering can wait out a gesture (invariant 7). */
  readonly heldDecided: Readonly<Record<string, number>> | null;
  /** Since when a lowering has been waiting for a gesture to end; null when none waits. */
  readonly freezeSince: number | null;
  /** A scroll counts as under way until this time (its end, or `scrollQuietMs` after it was seen). */
  readonly scrollingUntil: number;
  /** Whether verger may drive hardware at all (the recovery ladder turns this off). */
  readonly hardware: boolean;
  /** Steps of capacity floor this device has earned back (0 = none, 2 = all). */
  readonly capacityGrant: number;
  /** What verger may do; changed only by an `activation` event, so replay reproduces it. */
  readonly activation: VergerActivation;

  /**
   * verger-p5: expand each lever on its own evidence (the accounts it relieves), instead of
   * giving back the last decrease whenever frames are calm (verger-p4).
   */
  readonly expansion: boolean;
  /** The learned starting point as levels: the home above the ceiling, fixed for the session. */
  readonly home: Readonly<Record<string, number>>;
  /** p5: since when each account has read ample, with enough confidence, without a break. */
  readonly ampleSince: Readonly<Partial<Record<ResourceAccount, number>>>;
  /** p5: each lever's own wait before it expands, doubled when an expansion is pushed back. */
  readonly leverWait: Readonly<Record<string, number>>;
  /** p5: when each lever last expanded, to tell an expansion that failed. */
  readonly expandedAt: Readonly<Record<string, number>>;
  /** p5: when each lever's expansion last failed, so its wait can decay. */
  readonly leverFailedAt: Readonly<Record<string, number>>;
  /** p5: when each lever was lowered again after its own expansion, within `flapWindowMs`. */
  readonly leverFlaps: Readonly<Record<string, readonly number[]>>;
  /** p5: the targets each lever proved not to relieve this session (loop 2, D4). */
  readonly ineffective: Readonly<Record<string, readonly LeverTarget[]>>;

  readonly lastAction: IndexerAction;
  readonly lastReason: string;
}

export interface CreateVergerStateOptions {
  readonly at: number;
  readonly capacity?: CapacityFacts;
  readonly levers: readonly LeverSpec[];
  readonly mode?: RunMode;
  readonly config?: Partial<VergerConfig>;
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
  /**
   * Lever gains measured on this device in earlier sessions (R6). Each starts at most
   * `gainMinSamples` strong, so one session's fresh samples outweigh an old estimate quickly.
   */
  readonly initialGains?: Readonly<Record<string, LeverGain>>;
  /** Defaults to the preset that reproduces `mode`. */
  readonly activation?: VergerActivation;
  /** verger-p5's per-lever, evidence-weighted expansion. Default false (verger-p4). */
  readonly expansion?: boolean;
}

export function createVergerState(options: CreateVergerStateOptions): VergerState {
  validateLevers(options.levers);
  const config = { ...DEFAULT_VERGER_CONFIG, ...options.config };
  const start = startingPressure(options.levers, options.initialPressure);
  const created: VergerState = {
    config,
    levers: options.levers,
    capacity: options.capacity ?? UNKNOWN_CAPACITY,
    mode: options.mode ?? 'active',
    version: 0,
    at: options.at,
    pressure: start.pressure,
    stack: start.stack,
    pressureCause: {},
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
    thermalHeld: 'unknown',
    thermalCoolerSince: null,
    headroomTrace: [],
    batteryTrace: [],
    heatTouchedAt: null,
    levelTrace: [],
    heatStepAt: Number.NEGATIVE_INFINITY,
    memoryLatch: NO_MEMORY_LATCH,
    memorySensing: options.memorySensing ?? false,
    powerSaver: false,
    battery: UNKNOWN_BATTERY,
    network: UNKNOWN_NETWORK,
    lastOfflineAt: null,
    dataBudget: 'unknown',
    storageFreeBytes: null,
    storageLowHeld: false,
    visibility: 'active',
    lastInteractionAt: options.at,
    reduceMotion: false,
    fidelity: 'auto',
    jsSaturatedSince: null,
    mainSaturatedSince: null,
    jsCores: 0,
    mainCores: 0,
    computePressure: null,
    longTasks: [],
    lastContentionActionAt: Number.NEGATIVE_INFINITY,
    contentionBaseline: null,
    contentionUnrelieved: 0,
    contentionExhausted: false,
    frameEpisode: null,
    frameCostMs: null,
    framesHeard: false,
    framesExhausted: false,
    frameLoad: null,
    gainProbe: null,
    leverGains: seededGains(options.initialGains, options.levers, config.gainMinSamples),
    screen: null,
    screenAt: null,
    transitionUntil: Number.NEGATIVE_INFINITY,
    screenMemory: {},
    polledMemory: null,
    stressEndMs: null,
    comfortSeen: false,
    heldRefreshCapHz: null,
    heldGlobalMotion: false,
    heldDecided: null,
    freezeSince: null,
    scrollingUntil: Number.NEGATIVE_INFINITY,
    hardware: options.hardware ?? true,
    capacityGrant: Math.max(0, Math.floor(options.capacityGrant ?? 0)),
    activation: options.activation ?? activationForMode(options.mode ?? 'active'),
    expansion: options.expansion ?? false,
    home: start.pressure,
    ampleSince: {},
    leverWait: {},
    expandedAt: {},
    leverFailedAt: {},
    leverFlaps: {},
    ineffective: {},
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
/** Earlier sessions' gains for the host's levers, each at most `cap` samples strong (R6). */
function seededGains(
  gains: Readonly<Record<string, LeverGain>> | undefined,
  levers: readonly LeverSpec[],
  cap: number,
): Record<string, LeverGain> {
  const seeded: Record<string, LeverGain> = {};
  if (!gains) return seeded;
  for (const lever of levers) {
    const known = gains[lever.id];
    if (known && known.samples > 0) seeded[lever.id] = { gain: known.gain, samples: Math.min(known.samples, cap) };
  }
  return seeded;
}

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

/**
 * The envelope's limit, as level floors: what the user, accessibility, the OS, the network,
 * the battery and the device's capabilities allow, whatever the load. Never crossed.
 */
export function limitFloors(state: VergerState, at: number = state.at): Record<string, number> {
  const floors: Record<string, number> = {};
  const raise = (id: string, level: number) => {
    floors[id] = Math.max(floors[id] ?? 0, level);
  };
  const hidden = state.visibility !== 'active';
  const capacityReported = state.capacity.sdkInt !== null;

  for (const lever of state.levers) {
    const max = lever.maxLevel;
    if (lever.motion && state.reduceMotion) raise(lever.id, max);
    if (hidden && (lever.ambient || lever.motion)) raise(lever.id, max);
    if (lever.closedLoopOnly) continue;
    if (state.fidelity === 'low') raise(lever.id, lever.ambient ? max : Math.min(1, max));
    if (state.powerSaver && (lever.ambient || lever.target === 'energy')) raise(lever.id, max);
    if (state.powerSaver && lever.target === 'gpu') raise(lever.id, Math.min(1, max));
  }
  // Rules each lever declares for itself; the reducer names no lever.
  const network = state.network;
  const limit = networkLimitOf(state, at);
  const weakLink = limit === 'slow' || limit === 'unstable';
  for (const lever of state.levers) {
    if (hidden && lever.whenHidden !== undefined) raise(lever.id, lever.whenHidden);
    if (weakLink && lever.whenSlowNetwork !== undefined) raise(lever.id, lever.whenSlowNetwork);
    if (network.metered === true && lever.whenMetered !== undefined)
      raise(lever.id, lever.whenMetered);
    if (savingData(network) && lever.whenDataSaver !== undefined)
      raise(lever.id, lever.whenDataSaver);
    if (offline(network) && lever.whenOffline !== undefined) raise(lever.id, lever.whenOffline);
    if (state.dataBudget === 'spent' && lever.whenDataBudgetSpent !== undefined)
      raise(lever.id, lever.whenDataBudgetSpent);
    if (storageOf(state) === 'low' && lever.whenStorageLow !== undefined)
      raise(lever.id, lever.whenStorageLow);
    if (batteryLow(state) && lever.whenBatteryLow !== undefined)
      raise(lever.id, lever.whenBatteryLow);
    for (const need of lever.requires ?? []) {
      if (lacks(state, need.capability, capacityReported)) raise(lever.id, need.otherwiseLevel);
    }
  }
  return clampToLevers(state.levers, floors);
}

/**
 * The device class's floors: the hardware's ceiling on quality, until the phone earns more by
 * measurement across sessions (`capacityGrant`) or the user asks for high fidelity.
 */
export function classFloors(state: VergerState): Record<string, number> {
  const floors: Record<string, number> = {};
  const raise = (id: string, level: number) => {
    floors[id] = Math.max(floors[id] ?? 0, level);
  };
  const capacityClass = capacityClassOf(state.capacity, state.config);
  const lowCapacity = capacityClass === 'low' && state.fidelity !== 'high';
  const midCapacity =
    capacityClass === 'mid' && state.fidelity !== 'high' && state.capacityGrant < 1;
  for (const lever of state.levers) {
    if (lever.closedLoopOnly) continue;
    const max = lever.maxLevel;
    // A device that proved it can carry more earns these floors back, one step at a time.
    if (lowCapacity && lever.ambient && state.capacityGrant < 2) raise(lever.id, max);
    if (lowCapacity && !lever.ambient && lever.target !== 'energy' && state.capacityGrant < 1)
      raise(lever.id, Math.min(1, max));
    if (midCapacity && lever.whenMidCapacity !== undefined) raise(lever.id, lever.whenMidCapacity);
  }
  return clampToLevers(state.levers, floors);
}

/**
 * Static floors: the open-loop behaviour, the envelope's ceiling as levels (the limit and the
 * device class together). Every policy publishes at least these.
 */
export function staticFloors(state: VergerState, at: number = state.at): Record<string, number> {
  return combine(state.levers, limitFloors(state, at), classFloors(state));
}

/**
 * Whether the device lacks a capability. Graphics capabilities count as missing only once
 * capacity has been reported (unknown is not proof of absence). A refresh cap the display
 * cannot honour saves nothing, so an unknown display counts as unable to cap.
 */
function lacks(state: VergerState, capability: Capability, capacityReported: boolean): boolean {
  switch (capability) {
    case 'renderEffect':
      return capacityReported && !state.capacity.supportsRenderEffect;
    case 'runtimeShader':
      return capacityReported && !state.capacity.supportsRuntimeShader;
    case 'refreshCap':
      return !canCapRefresh(state);
  }
}

function leverWith(state: VergerState, actuator: Actuator): LeverSpec | undefined {
  return state.levers.find((lever) => lever.actuator === actuator);
}

function canCapRefresh(state: VergerState): boolean {
  const rates = state.capacity.refreshRatesHz;
  const cap = state.config.refreshCapHz;
  return rates.some((hz) => hz > cap + 1) && rates.some((hz) => hz <= cap + 1);
}

/** A finger on the screen within `gestureQuietMs`, or a scroll under way. */
function gestureActive(state: VergerState, at: number): boolean {
  return at - state.lastInteractionAt < state.config.gestureQuietMs || at < state.scrollingUntil;
}

/** Strain that may not wait for a gesture: heat at hot or worse, or low memory. */
function strainOverrides(state: VergerState, at: number): boolean {
  const thermal = thermalActing(state);
  return thermal === 'hot' || thermal === 'critical' || memoryOf(state, at) === 'low';
}

/** Whether a gesture holds lowerings now: active, not overridden, and not past its longest wait. */
function freezeHolds(state: VergerState, at: number): boolean {
  return (
    state.freezeSince !== null &&
    at - state.freezeSince < state.config.gestureFreezeMaxMs &&
    gestureActive(state, at) &&
    !strainOverrides(state, at)
  );
}

/** Whether the unfrozen decision lowers any lever below what was last published. */
function loweringPending(state: VergerState, at: number): boolean {
  const held = state.heldDecided;
  if (held === null) return false;
  const unfrozen = snapshotOf({ ...state, freezeSince: null }, at).proposedLevels;
  return state.levers.some((lever) => (unfrozen[lever.id] ?? 0) > (held[lever.id] ?? 0));
}

function interactionIdle(state: VergerState, at: number): boolean {
  return at - state.lastInteractionAt >= state.config.ambientSleepAfterMs;
}

/** Closed-loop floors: ambient sleep when nobody is touching the screen. */
function dynamicFloors(state: VergerState, at: number): Record<string, number> {
  const floors: Record<string, number> = {};
  const idle = interactionIdle(state, at);
  const thermal = thermalActing(state);
  // Warm floors outlast the heat by `thermalRecoverMs` (P5): heat moves in minutes.
  const warm =
    thermal === 'warm' || thermal === 'hot' || thermal === 'critical' || heatRecovering(state, at);
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

const closedLoop = (state: VergerState) => state.activation.decide === 'closed-loop';
const mayReduce = (state: VergerState) => closedLoop(state) && state.activation.reduce;
const mayGrow = (state: VergerState) => closedLoop(state) && state.activation.grow;

/** Levers verger governs at all; an `off` lever is left at full quality and never picked. */
const governed = (state: VergerState) =>
  state.levers.filter((lever) => leverActivation(state.activation, lever.id) !== 'off');

/**
 * Gives back every step a sensor's readings lowered: its levers' own stack entries go, and their
 * pressure falls back to what the learned starting point holds (or none).
 */
function releaseCause(state: VergerState, sensor: SensorId): VergerState {
  const ids = Object.keys(state.pressureCause).filter((id) => state.pressureCause[id] === sensor);
  if (ids.length === 0) return state;
  const prior = state.stack.slice(0, state.priorDepth);
  const own = state.stack.slice(state.priorDepth).filter((id) => !ids.includes(id));
  const pressure = { ...state.pressure };
  const pressureCause = { ...state.pressureCause };
  for (const id of ids) {
    const held = prior.filter((entry) => entry === id).length;
    if (held === 0) delete pressure[id];
    else pressure[id] = held;
    delete pressureCause[id];
  }
  return { ...state, pressure, pressureCause, stack: [...prior, ...own] };
}

/** What a sensor's readings left in the state, forgotten when the sensor is switched off. */
function forgetSensor(state: VergerState, sensor: SensorId): VergerState {
  return forgetReadings(releaseCause(state, sensor), sensor);
}

function forgetReadings(state: VergerState, sensor: SensorId): VergerState {
  switch (sensor) {
    case 'frames':
      return {
        ...state,
        frameState: 'quiet',
        stressMs: 0,
        stressEndMs: null,
        comfortSeen: false,
        frameEpisode: null,
        frameCostMs: null,
        framesHeard: false,
        framesExhausted: false,
        frameLoad: null,
        gainProbe: null,
      };
    case 'threads':
      return {
        ...state,
        jsSaturatedSince: null,
        mainSaturatedSince: null,
        jsCores: 0,
        mainCores: 0,
        computePressure: null,
      };
    case 'memory':
      return { ...state, memoryLatch: NO_MEMORY_LATCH, polledMemory: null, memorySensing: false };
    case 'thermal':
      return {
        ...state,
        thermalStatus: null,
        headroom: null,
        thermalHeld: 'unknown',
        thermalCoolerSince: null,
        headroomTrace: [],
        heatTouchedAt: null,
      };
    case 'power':
      return { ...state, powerSaver: false, battery: UNKNOWN_BATTERY, batteryTrace: [], levelTrace: [] };
    case 'longTasks':
      return { ...state, longTasks: [] };
    case 'storage':
      return { ...state, storageFreeBytes: null, storageLowHeld: false };
    case 'network':
      return { ...state, network: UNKNOWN_NETWORK, lastOfflineAt: null, dataBudget: 'unknown' };
  }
}

function applyActivation(state: VergerState, activation: VergerActivation): VergerState {
  let next: VergerState = { ...state, activation };
  for (const sensor of SENSORS) {
    if (!activation.sense[sensor] && state.activation.sense[sensor])
      next = forgetSensor(next, sensor);
  }
  return next;
}

// ---------------------------------------------------------------------------------------------
// Indexer: Unity's StateAction, with asymmetric hysteresis and upgrade back-off.
// ---------------------------------------------------------------------------------------------

function lower(
  state: VergerState,
  steps: number,
  bottleneck: readonly LeverTarget[],
  at: number,
  action: IndexerAction,
  reason: string,
  cause: SensorId,
  match: true | 'primary' = true,
): VergerState {
  if (!mayReduce(state)) {
    return { ...state, lastAction: 'stale', lastReason: `${reason}: reducing is switched off` };
  }
  const candidates = governed(state).filter((lever) =>
    stillRelieves(lever, bottleneck, state.ineffective[lever.id], match),
  );
  let pressure = { ...state.pressure };
  let stack = [...state.stack];
  const lowered: string[] = [];
  // Choose from what is published: a lever already held at its cheapest by a dynamic floor (ambient
  // sleep, a warm floor) has nothing left to give, and lowering it would spend a step on nothing.
  const dynamic = closedLoop(state) ? dynamicFloors(state, at) : {};
  for (let step = 0; step < steps; step += 1) {
    const effective = combine(state.levers, staticFloors(state), dynamic, pressure);
    const declared = chooseLeverToLower(candidates, effective, bottleneck, match);
    const lever = state.expansion ? byMeasuredGain(state, declared, candidates, effective, bottleneck, match) : declared;
    if (!lever) break;
    pressure = { ...pressure, [lever.id]: (effective[lever.id] ?? 0) + 1 };
    stack = [...stack, lever.id];
    lowered.push(lever.id);
  }
  if (lowered.length === 0)
    return { ...state, lastAction: 'stale', lastReason: `${reason}: nothing left to lower` };
  const failedUpgrade = at - state.lastIncreaseAt < state.config.failedUpgradeWindowMs;
  const pressureCause = { ...state.pressureCause };
  for (const id of lowered) pressureCause[id] = cause;
  const next: VergerState = {
    ...state,
    pressure,
    stack,
    pressureCause,
    lastDecreaseAt: at,
    lastPressureAt: at,
    comfortSeen: false,
    // p4 backs off every raise after a failed one; p5 backs off only the lever that failed.
    upgradeAfterMs:
      failedUpgrade && !state.expansion
        ? Math.min(state.upgradeAfterMs * 2, state.config.maxUpgradeAfterMs)
        : state.upgradeAfterMs,
    lastAction: action,
    lastReason: reason,
  };
  return state.expansion ? recordFailedExpansions(next, lowered, at) : next;
}

/**
 * p5 (D4): records that a lever did not relieve a target. A lever the host does not govern, a
 * target it does not claim to relieve, or one already recorded changes nothing; p4 ignores it.
 */
/**
 * p5 (P7): a lever measured with confidence to do almost nothing (`gainUselessBelow`) is passed
 * over, so the ladder reaches the levers that help before the relief check (P8) gives up. Then the
 * declared choice stands unless it is confidently measured and another eligible lever, also
 * confidently measured, buys more frame relief per unit of quality. An unmeasured declared choice
 * is taken as it is, so every lever keeps being measured. If every lever is useless, the declared
 * choice stands and the relief check decides.
 */
function byMeasuredGain(
  state: VergerState,
  declared: LeverSpec | null,
  candidates: readonly LeverSpec[],
  levels: Readonly<Record<string, number>>,
  bottleneck: readonly LeverTarget[],
  match: true | 'primary',
): LeverSpec | null {
  if (declared === null) return null;
  const confident = (lever: LeverSpec) => {
    const known = state.leverGains[lever.id];
    return known !== undefined && known.samples >= state.config.gainMinSamples ? known.gain : null;
  };
  const value = (lever: LeverSpec): number | null => {
    const gain = confident(lever);
    const cost = stepQualityCost(lever);
    return gain === null || cost <= 0 ? null : gain / cost;
  };
  const useful = candidates.filter((lever) => {
    const gain = confident(lever);
    return gain === null || gain >= state.config.gainUselessBelow;
  });
  const first = chooseLeverToLower(useful, levels, bottleneck, match) ?? declared;
  const declaredValue = value(first);
  if (declaredValue === null) return first;
  let best = first;
  let bestValue = declaredValue;
  for (const lever of useful) {
    // Eligible exactly as the declared order would judge it, one lever at a time.
    if (chooseLeverToLower([lever], levels, bottleneck, match) === null) continue;
    const v = value(lever);
    if (v !== null && v > bestValue) {
      best = lever;
      bestValue = v;
    }
  }
  return best;
}

/** A JS stall at `at`, kept for `longTaskWindowMs` as contention evidence. */
function noteStall(state: VergerState, at: number): VergerState {
  const window = state.config.longTaskWindowMs;
  return { ...state, longTasks: [...state.longTasks.filter((t) => at - t <= window), at] };
}

function storageOf(state: VergerState): StorageLevel {
  const free = state.storageFreeBytes;
  if (free === null) return 'unknown';
  const { storageLowBytes, storageExitBandBytes } = state.config;
  // A phone hovering at the threshold must not chatter: low ends only past the exit band (P4).
  const line = state.storageLowHeld ? storageLowBytes + storageExitBandBytes : storageLowBytes;
  return free < line ? 'low' : 'ample';
}

function markIneffective(state: VergerState, id: string, target: LeverTarget): VergerState {
  if (!state.expansion) return state;
  const lever = state.levers.find((l) => l.id === id);
  if (!lever || !relieves(lever, [target])) return state;
  const known = state.ineffective[id] ?? [];
  if (known.includes(target)) return state;
  return { ...state, ineffective: { ...state.ineffective, [id]: [...known, target].sort() } };
}

/**
 * Whether pressure on `bottleneck` may still lower this lever: it must relieve some bottleneck
 * target it has not proved useless for. Only narrows the choice; limits and floors are applied
 * apart, so this rule can never lift one.
 */
function stillRelieves(
  lever: LeverSpec,
  bottleneck: readonly LeverTarget[],
  ineffective: readonly LeverTarget[] | undefined,
  match: true | 'primary',
): boolean {
  if (!ineffective || ineffective.length === 0) return true;
  return bottleneck.some(
    (target) =>
      !ineffective.includes(target) &&
      (match === 'primary' ? lever.target === target : relieves(lever, [target])),
  );
}

/**
 * p5: a lever lowered again within `failedUpgradeWindowMs` of its own expansion failed to hold
 * it: its wait doubles (up to `maxUpgradeAfterMs`), and only its own.
 */
function recordFailedExpansions(
  state: VergerState,
  lowered: readonly string[],
  at: number,
): VergerState {
  let leverWait = state.leverWait;
  let leverFailedAt = state.leverFailedAt;
  let leverFlaps = state.leverFlaps;
  let expandedAt = state.expandedAt;
  const { failedUpgradeWindowMs, flapWindowMs, upgradeAfterMs, maxUpgradeAfterMs } = state.config;
  for (const id of new Set(lowered)) {
    const expanded = expandedAt[id];
    if (expanded === undefined) continue;
    // Each expansion is answered once: by this lowering, whenever it comes.
    const { [id]: _, ...rest } = expandedAt;
    expandedAt = rest;
    const since = at - expanded;
    if (since < flapWindowMs) {
      const recent = (leverFlaps[id] ?? []).filter((t) => at - t < flapWindowMs);
      leverFlaps = { ...leverFlaps, [id]: [...recent, at] };
    }
    if (since >= failedUpgradeWindowMs) continue;
    const wait = leverWait[id] ?? upgradeAfterMs;
    leverWait = { ...leverWait, [id]: Math.min(wait * 2, maxUpgradeAfterMs) };
    leverFailedAt = { ...leverFailedAt, [id]: at };
  }
  return { ...state, leverWait, leverFailedAt, leverFlaps, expandedAt };
}

/**
 * p5: whether a lever is flapping: as of its last lowering it had been lowered after its own
 * expansion `flapCycles` times within `flapWindowMs`, and it has not gone a whole window since
 * without being lowered again. Judged at the last flap, so the rule holds through the calm that
 * follows instead of lifting as the oldest flap slides out.
 */
function flapping(state: VergerState, id: string, at: number): boolean {
  const flaps = state.leverFlaps[id];
  const last = flaps?.[flaps.length - 1];
  if (!flaps || last === undefined || at - last >= state.config.flapWindowMs) return false;
  let recent = 0;
  for (const t of flaps) if (last - t < state.config.flapWindowMs) recent += 1;
  return recent >= state.config.flapCycles;
}

function raiseOne(state: VergerState, at: number, reason: string): VergerState {
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

function memoryOf(state: VergerState, at: number) {
  return memoryLevelOf(state.memoryLatch, at, state.memorySensing, state.polledMemory);
}

/** Heat as verger acts on it: the held level, with hysteresis (P4). */
function thermalOf(state: VergerState): ThermalLevel {
  return state.thermalHeld;
}

/**
 * Heat, and where it came from, on the entry thresholds. The platform's status and headroom win;
 * only where it gives neither (Android 9) and the thermal sensor is on, battery temperature
 * stands in. `band` lowers every threshold by the exit band, for judging a step down.
 */
function thermalReading(
  state: VergerState,
  band = false,
): { level: ThermalLevel; source: ThermalSource } {
  const c = state.config;
  const h = band ? c.thermalExitBandHeadroom : 0;
  if (state.thermalStatus !== null || state.headroom !== null)
    return {
      level: thermalLevelOf(state.thermalStatus, state.headroom, {
        ...c,
        headroomWarm: c.headroomWarm - h,
        headroomHot: c.headroomHot - h,
        headroomCritical: c.headroomCritical - h,
      }),
      source: 'platform',
    };
  const t = state.battery.temperatureC;
  if (!state.activation.sense.thermal || t === null) return { level: 'unknown', source: 'none' };
  const d = band ? c.thermalExitBandC : 0;
  const level: ThermalLevel =
    t >= c.batteryCriticalC - d
      ? 'critical'
      : t >= c.batteryHotC - d
        ? 'hot'
        : t >= c.batteryWarmC - d
          ? 'warm'
          : 'nominal';
  return { level, source: 'battery' };
}

/** A least-squares slope of `[at, value]` readings, per second; null below the minimum count. */
function slopeOf(trace: readonly (readonly [number, number])[], minSamples: number): number | null {
  if (trace.length < minSamples) return null;
  const n = trace.length;
  const meanT = trace.reduce((sum, [t]) => sum + t, 0) / n;
  const meanV = trace.reduce((sum, [, v]) => sum + v, 0) / n;
  let num = 0;
  let den = 0;
  for (const [t, v] of trace) {
    num += (t - meanT) * (v - meanV);
    den += (t - meanT) ** 2;
  }
  return den === 0 ? null : (num / den) * 1000;
}

/**
 * Heat projected `thermalTrendHorizonMs` ahead on the rising slope of its own source (R1). Only a
 * rise is projected: a falling trend relaxes nothing, the held level (P4) decides that.
 */
function thermalProjected(state: VergerState): ThermalLevel {
  const reading = thermalReading(state);
  if (reading.level === 'unknown') return 'unknown';
  const c = state.config;
  const ahead = c.thermalTrendHorizonMs / 1000;
  let projected: ThermalLevel = reading.level;
  if (reading.source === 'platform' && state.headroom !== null) {
    const slope = slopeOf(state.headroomTrace, c.thermalTrendMinSamples);
    if (slope !== null && slope > 0)
      projected = thermalLevelOf(state.thermalStatus, state.headroom + slope * ahead, c);
  } else if (reading.source === 'battery' && state.battery.temperatureC !== null) {
    const slope = slopeOf(state.batteryTrace, c.thermalTrendMinSamples);
    if (slope !== null && slope > 0) {
      const t = state.battery.temperatureC + slope * ahead;
      projected =
        t >= c.batteryCriticalC ? 'critical' : t >= c.batteryHotC ? 'hot' : t >= c.batteryWarmC ? 'warm' : 'nominal';
    }
  }
  return THERMAL_RANK[projected] > THERMAL_RANK[reading.level] ? projected : reading.level;
}

/** The heat verger acts on: the held level, or the projected one when the trend says worse. */
function thermalActing(state: VergerState): ThermalLevel {
  const held = thermalOf(state);
  const projected = thermalProjected(state);
  return THERMAL_RANK[projected] > THERMAL_RANK[held] ? projected : held;
}

/** Within `thermalRecoverMs` of the last heat (P5). */
function heatRecovering(state: VergerState, at: number): boolean {
  return state.heatTouchedAt !== null && at - state.heatTouchedAt < state.config.thermalRecoverMs;
}

/**
 * Within `thermalPaceMs` of the last heat, with published decisions to pace from, while the
 * closed loop decides (P5): a static or off decision publishes its baseline at once.
 */
function heatPacing(state: VergerState, at: number): boolean {
  return (
    closedLoop(state) &&
    state.heatTouchedAt !== null &&
    state.heldDecided !== null &&
    at - state.heatTouchedAt < state.config.thermalPaceMs
  );
}

/**
 * Whether a paced one-step raise may be published now (P5): past the recovery latch, a step's
 * interval after the last, and the heat readings since then (headroom where the platform gives
 * it, battery temperature otherwise) either too few to judge, not rising, or rising toward a
 * steady state (`thermalTimeConstantMs` ahead) that stays an exit band clear of warm. A step that tips the phone
 * toward heat stops the next; the climb resumes when the phone is steady, cooling, or clearly
 * safe. Derivative feedback on the plant's slowest state.
 */
function heatStepReady(state: VergerState, at: number): boolean {
  const touched = state.heatTouchedAt;
  if (touched === null) return true;
  const c = state.config;
  if (at - touched < c.thermalRecoverMs || at - state.heatStepAt < c.thermalStepMs) return false;
  const since = Math.max(touched, state.heatStepAt);
  const tau = c.thermalTimeConstantMs / 1000;
  const platform = state.headroomTrace.length >= c.thermalTrendMinSamples;
  const trace = (platform ? state.headroomTrace : state.batteryTrace).filter(([t]) => t > since);
  const slope = slopeOf(trace, c.thermalTrendMinSamples);
  const latest = trace[trace.length - 1]?.[1];
  // No readings since (status by listener only, or a quiet sensor): no evidence of warming, so the
  // step comes at the paced rate alone.
  if (slope === null || latest === undefined) return true;
  if (slope <= 0) return true;
  // Rising, but toward a steady state (first order: value + slope × τ) well clear of heat.
  const projected = latest + slope * tau;
  return platform
    ? projected < c.headroomWarm - c.thermalExitBandHeadroom
    : projected < c.batteryWarmC - c.thermalExitBandC;
}

/** Keeps `[at, value]` readings within the trend window. */
function traced(
  trace: readonly (readonly [number, number])[],
  at: number,
  value: number | null,
  windowMs: number,
): readonly (readonly [number, number])[] {
  const kept = trace.filter(([t]) => at - t <= windowMs);
  return value === null || !Number.isFinite(value) ? kept : [...kept, [at, value] as const];
}

/**
 * Thermal hysteresis (P4, control review finding 2). Rising heat, and losing the reading, apply
 * at once: safety first, and unknown is never proof of cool. Stepping down needs the reading
 * below the held level even with every threshold lowered by its exit band, continuously for
 * `thermalDwellMs`; then heat drops to what that banded reading says, and the next step down
 * waits a dwell of its own.
 */
function holdThermal(state: VergerState, at: number): VergerState {
  const raw = thermalReading(state).level;
  const held = state.thermalHeld;
  if (raw === 'unknown' || held === 'unknown' || THERMAL_RANK[raw] >= THERMAL_RANK[held]) {
    if (raw === held && state.thermalCoolerSince === null) return state;
    return { ...state, thermalHeld: raw, thermalCoolerSince: null };
  }
  const banded = thermalReading(state, true).level;
  if (THERMAL_RANK[banded] >= THERMAL_RANK[held])
    return state.thermalCoolerSince === null ? state : { ...state, thermalCoolerSince: null };
  const since = state.thermalCoolerSince ?? at;
  if (at - since < state.config.thermalDwellMs)
    return since === state.thermalCoolerSince ? state : { ...state, thermalCoolerSince: since };
  return { ...state, thermalHeld: banded, thermalCoolerSince: null };
}

function holdStorage(state: VergerState): VergerState {
  const low = storageOf(state) === 'low';
  return low === state.storageLowHeld ? state : { ...state, storageLowHeld: low };
}

/** Thermal and memory rules that apply on every event, so heat is acted on even without frames. */
function applyStandingPressure(state: VergerState, at: number): VergerState {
  // Lowering acts on the reading itself: it starts at once and stops at once when heat eases.
  // Only relaxing (raises, warm floors, admission) waits out the held level's dwell (P4); acting
  // on the held level would keep lowering for a dwell after the phone cooled, an overshoot. A
  // rising trend lowers early (R1): the projection is never below the reading.
  const thermal = thermalProjected(state);
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
      'thermal',
    );
    next = { ...next, lastThermalActionAt: at };
  } else if (thermal === 'hot' && sinceThermal >= state.config.thermalActionDelayMs) {
    next = lower(next, 1, ['energy', 'gpu', 'cpu'], at, 'decrease', 'thermal hot', 'thermal');
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

function maybeIncrease(state: VergerState, at: number): VergerState {
  if (state.stack.length === 0 || !mayGrow(state)) return state;
  // No raise while heat is recovering (P5); pacing after it is in the snapshot.
  if (heatRecovering(state, at)) return state;
  const thermal = thermalActing(state);
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

function resetBackoff(state: VergerState, at: number): VergerState {
  if (state.upgradeAfterMs <= state.config.upgradeAfterMs) return state;
  const quietFor = at - Math.max(state.lastDecreaseAt, state.lastIncreaseAt);
  if (quietFor <= state.config.resetBackoffAfterMs) return state;
  return { ...state, upgradeAfterMs: state.config.upgradeAfterMs };
}

/** Free memory against the system's low-memory threshold, as a trim severity (or none). */
function polledSeverity(
  state: VergerState,
  event: Extract<VergerEvent, { type: 'memory-state' }>,
): TrimSeverity | null {
  if (event.lowMemory) return 'critical';
  if (!(event.thresholdMb > 0)) return null;
  if (event.availableMb < event.thresholdMb * state.config.memoryLowFactor) return 'low';
  if (event.availableMb < event.thresholdMb * state.config.memoryModerateFactor) return 'moderate';
  return null;
}

function relieveMemory(
  before: VergerState,
  after: VergerState,
  at: number,
  why: string,
): VergerState {
  const was = memoryOf(before, at);
  const now = memoryOf(after, at);
  if (now === 'low' && was !== 'low') {
    return lower(after, after.config.fastDecreaseSteps, ['memory'], at, 'fast-decrease', why, 'memory');
  }
  if (now === 'trimmed' && was !== 'trimmed' && was !== 'low') {
    return lower(after, 1, ['memory'], at, 'decrease', why, 'memory');
  }
  return after;
}

function onMemoryPressure(
  state: VergerState,
  severity: TrimSeverity,
  at: number,
  source: string,
): VergerState {
  const memoryLatch = latchMemory(state.memoryLatch, severity, at, state.config);
  const next: VergerState = { ...state, memoryLatch, memorySensing: true, lastPressureAt: at };
  return relieveMemory(state, next, at, `${source} (${severity})`);
}

function recentLongTasks(state: VergerState, at: number): number {
  let count = 0;
  for (const t of state.longTasks) if (at - t <= state.config.longTaskWindowMs) count += 1;
  return count;
}

/** Which thread is saturated long enough to count, judged at `at`. */
function contentionOf(state: VergerState, at: number): Contention {
  const after = state.config.saturationAfterMs;
  if (state.jsSaturatedSince !== null && at - state.jsSaturatedSince >= after) return 'js';
  const longTasks = recentLongTasks(state, at);
  if (longTasks >= state.config.longTasksForContention) return 'js';
  // The system's CPU pressure (R10) is a cause, not a symptom, and the browser reports only its
  // changes: a held `critical` with no later record would hold the levers forever. So it only
  // lowers the bar for the page's own stall evidence to one long task, which ages out.
  if ((state.computePressure === 'serious' || state.computePressure === 'critical') && longTasks >= 1) return 'js';
  if (state.mainSaturatedSince !== null && at - state.mainSaturatedSince >= after) return 'main';
  return 'none';
}

/**
 * Contention is the runtime's answer to work it does not control: a component, library or
 * loop that keeps a thread busy. Whatever the cause, verger sheds CPU-side quality one
 * step at a time, no faster than once per saturation period, and pauses deferrable work.
 */
function applyContention(state: VergerState, at: number): VergerState {
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
      ? lower(state, 1, ['cpu'], at, 'decrease', detail, 'threads', 'primary')
      : // The main thread is CPU: only levers that relieve it count. A GPU-only lever (blur)
        // lowered here would shed quality without relieving the thread (ADR D5.2; found by the
        // no-blind-lowering property). Animation levers declare that they relieve CPU.
        lower(state, 1, ['cpu'], at, 'decrease', detail, 'threads');
  return {
    ...next,
    lastContentionActionAt: at,
    lastPressureAt: at,
    contentionUnrelieved: unrelieved,
    contentionExhausted: next.lastAction === 'stale',
    contentionBaseline: { js: state.jsCores, main: state.mainCores, longTasks },
  };
}

/**
 * System identification (P6): the first frame window wholly after a single-step lowering was
 * published is one sample of that lever's gain, against the smoothed load before it.
 */
function measureGain(state: VergerState, window: FrameWindow, load: number): VergerState {
  const probe = state.gainProbe;
  if (probe === null || window.startMs < probe.at) return state;
  // Lowered: load after = load before × (1 − gain). Raised: load before = load after × (1 − gain).
  const ratio = probe.direction === 'lowered' ? load / probe.beforeLoad : probe.beforeLoad / load;
  const sample = Math.max(-1, Math.min(1, 1 - ratio));
  const known = state.leverGains[probe.lever];
  const alpha = state.config.gainAlpha;
  const gain: LeverGain =
    known === undefined
      ? { gain: sample, samples: 1 }
      : { gain: known.gain + alpha * (sample - known.gain), samples: known.samples + 1 };
  return { ...state, gainProbe: null, leverGains: { ...state.leverGains, [probe.lever]: gain } };
}

/**
 * A published change that moved exactly one lever by one step starts a probe; any other ends it.
 * A step given back is the cleaner evidence: it comes after seconds of comfort, so its baseline is
 * ordinary windows, while a step down comes right after the windows that were high enough to
 * trigger it.
 */
function probeOf(state: VergerState, before: VergerSnapshot, after: VergerSnapshot): VergerState['gainProbe'] {
  const changed = state.levers.filter((l) => (before.levels[l.id] ?? 0) !== (after.levels[l.id] ?? 0));
  if (changed.length === 0) return state.gainProbe;
  const [only] = changed;
  if (changed.length > 1 || only === undefined || state.frameLoad === null || state.visibility !== 'active')
    return null;
  const from = before.levels[only.id] ?? 0;
  const to = after.levels[only.id] ?? 0;
  if (to === from - 1) return { lever: only.id, beforeLoad: state.frameLoad, at: after.at, direction: 'raised' };
  if (to !== from + 1) return null;
  // A step down taken on a load not over the stress line on average was triggered by windows that
  // noise pushed high; against them, regression to the mean reads as the lever's gain. Such a step
  // is no evidence (found with a lever of true gain 0.01 measured at 0.06).
  if (state.frameLoad < state.config.stressRatio) return null;
  return { lever: only.id, beforeLoad: state.frameLoad, at: after.at, direction: 'lowered' };
}

/** A lever's measured gain once confident and useful (P6, P7); null otherwise. */
function confidentGain(state: VergerState, id: string | undefined): number | null {
  const known = id === undefined ? undefined : state.leverGains[id];
  if (known === undefined || known.samples < state.config.gainMinSamples) return null;
  return known.gain >= state.config.gainUselessBelow ? known.gain : null;
}

/**
 * The frames loop's action (R2). One step, as the ladder always took; in p5, more steps while the
 * measured gains of the levers taken say frames would still be over budget (load above 1), up to
 * `maxStepsPerAction`. A step onto a lever without a confident gain is not taken: proportional
 * action is earned by measurement, never assumed.
 */
function lowerProportionally(
  state: VergerState,
  targets: readonly LeverTarget[],
  at: number,
  detail: string,
  load: number,
): { readonly state: VergerState; readonly steps: number } {
  const first = lower(state, 1, targets, at, 'decrease', detail, 'frames');
  if (first.lastAction === 'stale') return { state: first, steps: 0 };
  if (!state.expansion) return { state: first, steps: 1 };
  let current = first;
  let steps = 1;
  let projected = load;
  const firstGain = confidentGain(state, first.stack[first.stack.length - 1]);
  if (firstGain === null) return { state: first, steps };
  projected *= 1 - firstGain;
  while (steps < state.config.maxStepsPerAction && projected > 1) {
    const candidate = lower(current, 1, targets, at, 'decrease', detail, 'frames');
    if (candidate.lastAction === 'stale') break;
    const gain = confidentGain(state, candidate.stack[candidate.stack.length - 1]);
    if (gain === null) break;
    current = candidate;
    steps += 1;
    projected *= 1 - gain;
  }
  if (steps === 1) return { state: first, steps };
  return { state: { ...current, lastReason: `${detail}: ${steps} steps, sized by measured gains` }, steps };
}

/**
 * A new screen (R3): a new regime for the frames loop. In p5, the pressure the frames loop holds
 * is remembered for the screen left, and the memory of the screen entered is applied (R4): levers
 * lowered on the last visit, and measured to help, are lowered on arrival, before its first frames,
 * and given back by the usual evidence if this visit is lighter.
 */
function onScreen(state: VergerState, event: Extract<VergerEvent, { type: 'screen' }>, at: number): VergerState {
  let next: VergerState = {
    ...state,
    screen: event.name,
    screenAt: at,
    transitionUntil: at + (event.transitionMs ?? 0),
    gainProbe: null,
    frameLoad: null,
    frameCostMs: null,
    frameEpisode: null,
    framesExhausted: false,
    stressMs: 0,
    stressEndMs: null,
  };
  if (!state.expansion || event.name === state.screen) return next;
  if (state.screen !== null) {
    const held: Record<string, number> = {};
    for (const [id, cause] of Object.entries(state.pressureCause))
      if (cause === 'frames' && (state.pressure[id] ?? 0) > 0) held[id] = state.pressure[id] ?? 0;
    next = { ...next, screenMemory: { ...state.screenMemory, [state.screen]: held } };
  }
  const remembered = next.screenMemory[event.name];
  if (!remembered || !mayReduce(next)) return next;
  const pressure = { ...next.pressure };
  const stack = [...next.stack];
  const pressureCause = { ...next.pressureCause };
  let applied = 0;
  for (const lever of governed(next)) {
    // Only what is known to work is replayed: an unmeasured or useless lever is left to the loop,
    // which measures it a step at a time (memory must not freeze a first visit's guesses).
    if (confidentGain(next, lever.id) === null) continue;
    const want = Math.min(lever.maxLevel, remembered[lever.id] ?? 0);
    const have = pressure[lever.id] ?? 0;
    if (want <= have) continue;
    pressure[lever.id] = want;
    for (let i = have; i < want; i += 1) stack.push(lever.id);
    pressureCause[lever.id] = 'frames';
    applied += want - have;
  }
  if (applied === 0) return next;
  return {
    ...next,
    pressure,
    stack,
    pressureCause,
    lastDecreaseAt: at,
    lastPressureAt: at,
    lastAction: 'decrease',
    lastReason: `${event.name}: ${applied} steps remembered from the last visit`,
  };
}

function onFrameWindow(previous: VergerState, event: Extract<VergerEvent, { type: 'frame-window' }>) {
  const state = previous.framesHeard ? previous : { ...previous, framesHeard: true };
  // Frames within an announced transition are the app's expected work: neither stress nor comfort.
  if (event.at < state.transitionUntil) return state;
  const frameState = classifyFrameWindow(event.window, state.config);
  const span = Math.max(0, event.window.endMs - event.window.startMs);
  const load = event.window.targetMs > 0 ? event.window.averageMs / event.window.targetMs : null;
  const measured = load === null ? state : measureGain(state, event.window, load);
  // Smoothed within one frame state only: a calm screen turning rich is a new regime, and blending
  // across it would read the demand's jump as the lever's (negative) gain.
  const frameLoad =
    load === null
      ? state.frameLoad
      : state.frameLoad === null || frameState !== state.frameState
        ? load
        : (state.frameLoad + load) / 2;
  let next: VergerState = { ...measured, frameState, frameLoad };
  if (frameState === 'stressed') {
    // Stress must be continuous: two hitches a minute apart are not 1 s of stress.
    // A window's stress reaches as far as its worst frame: a 1 s freeze leaves the next 500 ms
    // slot empty, and that gap is the same freeze, not recovery.
    const w = event.window;
    const contiguous = state.stressEndMs !== null && w.startMs <= state.stressEndMs;
    const stressMs = (contiguous ? state.stressMs : 0) + Math.max(span, w.worstMs);
    const reach = Math.max(w.endMs, w.startMs + w.worstMs);
    const costMs = state.frameCostMs === null ? w.averageMs : (state.frameCostMs + w.averageMs) / 2;
    next = { ...next, stressMs, stressEndMs: reach, lastPressureAt: event.at, comfortSeen: false, frameCostMs: costMs };
    if (stressMs >= state.config.downgradeAfterMs) {
      const stage = frameBottleneck(event.window);
      const where = stage === null ? '' : `, ${stage}-bound`;
      const detail = `frames over budget for ${Math.round(stressMs)} ms${where}`;
      const episode = state.frameEpisode;
      const c = state.config;
      // Relief check (P8): lowering that has not closed a fair share of the gap to the budget is
      // giving up quality to work no lever reaches. Stop, and say so, until the stress ends.
      const unrelieved =
        episode !== null &&
        (episode.steps >= c.frameReliefSteps || (episode.midScreen && episode.spent >= c.frameReliefQuality)) &&
        episode.startCostMs - costMs < c.frameReliefGapShare * (episode.startCostMs - episode.targetMs);
      if (state.framesExhausted || unrelieved) {
        next = {
          ...next,
          framesExhausted: true,
          lastReason: state.framesExhausted ? state.lastReason : `${detail}: not relieved by levers`,
        };
      } else {
        const targets = bottleneckTargets(stage, gpuMeasured(event.window));
        const lowered = lowerProportionally(next, targets, event.at, detail, costMs / w.targetMs);
        const taken = lowered.state.stack.slice(next.stack.length);
        const spent = taken.reduce((sum, id) => {
          const lever = next.levers.find((l) => l.id === id);
          return sum + (lever ? stepQualityCost(lever) : 0);
        }, 0);
        // R7, looking ahead: after a step that did not help, a step that would take the episode
        // past its quality budget is not taken. The first step always is: there is no evidence yet.
        const unhelped =
          episode !== null &&
          episode.startCostMs - costMs < c.frameReliefGapShare * (episode.startCostMs - episode.targetMs);
        if (unhelped && episode.midScreen && episode.spent + spent > c.frameReliefQuality) {
          next = { ...next, framesExhausted: true, lastReason: `${detail}: not relieved by levers` };
        } else {
        next = lowered.state;
        if (lowered.steps > 0)
          next = {
            ...next,
            frameEpisode: {
              startCostMs: episode?.startCostMs ?? costMs,
              targetMs: episode?.targetMs ?? w.targetMs,
              steps: (episode?.steps ?? 0) + lowered.steps,
              spent: (episode?.spent ?? 0) + spent,
              midScreen:
                episode?.midScreen ??
                (state.screenAt !== null && event.at - state.screenAt > c.frameArrivalMs),
            },
          };
        }
      }
      next = { ...next, stressMs: 0, stressEndMs: null };
    }
  } else {
    // Frames back near or within budget end the episode, whatever its verdict.
    next = { ...next, stressMs: 0, stressEndMs: null, frameEpisode: null, frameCostMs: null, framesExhausted: false };
    if (frameState === 'neutral') next = { ...next, lastPressureAt: event.at, comfortSeen: false };
    if (frameState === 'calm') next = { ...next, comfortSeen: true };
  }
  return next;
}

function step(state: VergerState, event: VergerEvent): VergerState {
  const at = Math.max(state.at, event.at);
  let next: VergerState = { ...state, at, lastAction: 'stale', lastReason: state.lastReason };
  // A reading from a switched-off sensor is dropped here, not at the port, so replaying a raw
  // recording under a different activation gives the same result as running it live.
  const sensor = sensorOf(event);
  const input: VergerEvent =
    sensor === null || state.activation.sense[sensor] ? event : { type: 'tick', at: event.at };
  switch (input.type) {
    case 'frame-window':
      next = onFrameWindow(next, input);
      break;
    case 'thermal':
      next = {
        ...next,
        thermalStatus: input.status,
        headroom: input.headroom,
        headroomTrace: traced(
          next.headroomTrace,
          at,
          input.headroom !== null && input.headroom > 0 ? input.headroom : null,
          next.config.thermalTrendWindowMs,
        ),
      };
      break;
    case 'memory-trim':
      next = onMemoryPressure(next, input.severity, at, 'memory trim');
      break;
    case 'memory-state': {
      const severity = polledSeverity(next, input);
      const polled: VergerState = { ...next, polledMemory: severity, memorySensing: true };
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
    case 'long-task':
      next = noteStall(next, at);
      break;
    case 'compute-pressure':
      next = { ...next, computePressure: input.state };
      break;
    case 'power':
      next = { ...next, powerSaver: input.saver };
      break;
    case 'battery':
      next = {
        ...next,
        battery: {
          levelPercent: input.levelPercent,
          pluggedIn: input.pluggedIn,
          temperatureC: input.temperatureC,
        },
        batteryTrace: traced(next.batteryTrace, at, input.temperatureC, next.config.thermalTrendWindowMs),
        // A drain is measured only while unplugged; plugging in starts it over.
        levelTrace:
          input.pluggedIn === false && input.levelPercent !== null
            ? traced(next.levelTrace, at, input.levelPercent, next.config.energyDrainWindowMs)
            : [],
      };
      break;
    case 'interaction':
      next = { ...next, lastInteractionAt: at };
      break;
    case 'scroll':
      next = {
        ...next,
        lastInteractionAt: at,
        scrollingUntil: input.active ? at + next.config.scrollQuietMs : at,
      };
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
    case 'network': {
      const network: NetworkState = {
        transport: input.transport,
        validated: input.validated,
        metered: input.metered,
        downKbps: input.downKbps,
        dataSaver: input.dataSaver,
      };
      next = { ...next, network, lastOfflineAt: offline(network) ? at : next.lastOfflineAt };
      break;
    }
    case 'data-budget':
      next = { ...next, dataBudget: input.state };
      break;
    case 'storage':
      next = { ...next, storageFreeBytes: input.freeBytes === null ? null : Math.max(0, input.freeBytes) };
      break;
    // A long-delayed input, a late timer and a heavy GC pause are the same evidence as a long
    // task: the JS thread could not yield. One stall may be seen by two of them; counting it twice
    // reaches contention sooner, the cautious side.
    case 'input-delay':
      if (input.durationMs >= next.config.inputDelayLongMs) next = noteStall(next, at);
      break;
    case 'event-loop-lag':
      if (input.lagMs >= next.config.eventLoopLagLongMs) next = noteStall(next, at);
      break;
    case 'js-heap':
      if (input.gcPauseShare >= next.config.gcPauseShareStall) next = noteStall(next, at);
      break;
    case 'lever-ineffective':
      next = markIneffective(next, input.lever, input.target);
      break;
    case 'screen':
      next = onScreen(next, input, at);
      break;
    case 'tick':
      break;
  }
  next = holdStorage(holdThermal(next, at));
  const heat = thermalActing(next);
  if (heat === 'warm' || heat === 'hot' || heat === 'critical') next = { ...next, heatTouchedAt: at };
  next = applyStandingPressure(next, at);
  next = applyContention(next, at);
  if (next.expansion) {
    next = trackEvidence(next, at);
    if (next.lastAction === 'stale') next = maybeExpand(next, at);
  } else if (next.lastAction === 'stale') next = maybeIncrease(next, at);
  next = resetBackoff(next, at);
  return next;
}

// ---------------------------------------------------------------------------------------------
// verger-p5: expansion on evidence, lever by lever.
// ---------------------------------------------------------------------------------------------

/** The account readings the policy acts on: the published snapshot's, as the ledger sees them. */
function readingsOf(state: VergerState, at: number) {
  return estimateAccounts(snapshotOf(state, at), state.capacity, state.config);
}

/**
 * Keeps, for each account, since when it has read ample with at least `expandMinConfidence`
 * without a break. Unknown, weakly witnessed, tight or overdrawn ends the run.
 */
function trackEvidence(state: VergerState, at: number): VergerState {
  const readings = readingsOf(state, at);
  const ampleSince: Partial<Record<ResourceAccount, number>> = {};
  for (const account of RESOURCE_ACCOUNTS) {
    const reading = readings[account];
    if (reading.state === 'ample' && reading.confidence >= state.config.expandMinConfidence)
      ampleSince[account] = state.ampleSince[account] ?? at;
  }
  return { ...state, ampleSince };
}

interface ExpansionCandidate {
  readonly id: string;
  /** When its evidence is enough; it may expand at or after this time. */
  readonly readyAt: number;
  /** The wait it was judged against, and whether that wait has decayed back to the base. */
  readonly decayed: boolean;
  readonly reason: string;
}

/**
 * The levers p5 could expand, each with the time its evidence suffices. A lever qualifies when
 * no account it relieves is strained and at least one is known ample with enough confidence;
 * unknown accounts neither help nor block. Its evidence must last its own wait divided by the
 * weakest confidence among its ample accounts, and expansions are paced one wait apart.
 */
function expansionCandidates(state: VergerState, at: number): ExpansionCandidate[] {
  if (state.stack.length === 0 || !mayGrow(state) || heatRecovering(state, at)) return [];
  if (state.contentionExhausted || contentionOf(state, at) !== 'none') return [];
  const readings = readingsOf(state, at);
  const out: ExpansionCandidate[] = [];
  const seen = new Set<string>();
  for (let i = state.stack.length - 1; i >= 0; i -= 1) {
    const id = state.stack[i];
    if (id === undefined || seen.has(id)) continue;
    seen.add(id);
    const lever = state.levers.find((candidate) => candidate.id === id);
    if (!lever) continue;
    const accounts = accountsRelievedBy(lever);
    if (accounts.some((a) => readings[a].state === 'tight' || readings[a].state === 'overdrawn'))
      continue;
    const evidence = accounts.filter((a) => state.ampleSince[a] !== undefined);
    if (evidence.length === 0) continue;
    const confidence = Math.min(...evidence.map((a) => readings[a].confidence));
    const failedAt = state.leverFailedAt[id];
    // A flapping lever waits the longest, and its back-off does not decay while it flaps.
    const flaps = flapping(state, id, at);
    const decayed =
      !flaps && failedAt !== undefined && at - failedAt >= state.config.resetBackoffAfterMs;
    const wait = flaps
      ? state.config.maxUpgradeAfterMs
      : decayed
        ? state.upgradeAfterMs
        : (state.leverWait[id] ?? state.upgradeAfterMs);
    const since = Math.max(...evidence.map((a) => state.ampleSince[a] ?? at));
    const readyAt = Math.max(since, state.lastIncreaseAt, state.lastDecreaseAt) + wait / confidence;
    out.push({
      id,
      readyAt,
      decayed,
      reason: `${evidence.join(' and ')} ample for ${Math.round(wait / confidence)} ms${flaps ? ' (flapping: longest wait)' : ''}`,
    });
  }
  return out;
}

/** p5: gives one step back to the most recently lowered lever whose evidence is enough. */
function maybeExpand(state: VergerState, at: number): VergerState {
  const ready = expansionCandidates(state, at).find((candidate) => candidate.readyAt <= at);
  if (!ready) return state;
  const index = state.stack.lastIndexOf(ready.id);
  const stack = [...state.stack.slice(0, index), ...state.stack.slice(index + 1)];
  const pressure = { ...state.pressure };
  const current = pressure[ready.id] ?? 0;
  // As in raiseOne: a lever off the stack owns no pressure.
  if (current <= 1 || !stack.includes(ready.id)) delete pressure[ready.id];
  else pressure[ready.id] = current - 1;
  let leverWait = state.leverWait;
  let leverFailedAt = state.leverFailedAt;
  if (ready.decayed) {
    const { [ready.id]: _wait, ...waits } = leverWait;
    const { [ready.id]: _failed, ...failures } = leverFailedAt;
    leverWait = waits;
    leverFailedAt = failures;
  }
  return {
    ...state,
    pressure,
    stack,
    priorDepth: index < state.priorDepth ? state.priorDepth - 1 : state.priorDepth,
    expandedAt: { ...state.expandedAt, [ready.id]: at },
    leverWait,
    leverFailedAt,
    lastIncreaseAt: at,
    lastAction: 'increase',
    lastReason: `${ready.id}: ${ready.reason}`,
  };
}

/** Folds one event into verger's state. Pure: same state and event, same result. */
export function reduceVerger(state: VergerState, event: VergerEvent): VergerState {
  const moved = step(state, event);
  // A lowering that a gesture holds back is pending from the first event that wanted it.
  const pending = gestureActive(moved, moved.at) && !strainOverrides(moved, moved.at) && loweringPending(moved, moved.at);
  const stepped: VergerState = { ...moved, freezeSince: pending ? (state.freezeSince ?? moved.at) : null };
  const published = snapshotOf(stepped, stepped.at);
  const prior = stepped.heldDecided;
  const pacedStep =
    prior !== null &&
    heatPacing(stepped, stepped.at) &&
    stepped.levers.some((l) => (published.proposedLevels[l.id] ?? 0) < (prior[l.id] ?? 0));
  const next: VergerState = {
    ...stepped,
    heldRefreshCapHz: published.refreshCapHz,
    heldGlobalMotion: published.globalReducedMotion,
    heldDecided: published.proposedLevels,
    heatStepAt: pacedStep ? stepped.at : stepped.heatStepAt,
  };
  const before = snapshotOf(state, state.at);
  const after = snapshotOf(next, next.at);
  const probed: VergerState = { ...next, gainProbe: probeOf(next, before, after) };
  return outputsEqual(before, after)
    ? { ...probed, version: state.version }
    : { ...probed, version: state.version + 1 };
}

// ---------------------------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------------------------

function optionalConcurrency(state: VergerState, at: number): number {
  const admission = state.activation.admission;
  if (admission === 'off') return state.config.maxOptionalConcurrency;
  // Measured pressure counts only when admission is applied and the loop is deciding.
  const closedLoop = admission === 'apply' && state.activation.decide === 'closed-loop';
  if (state.visibility !== 'active' || state.powerSaver) return 0;
  // The user's Data Saver and a missing network are limits: no optional data work at all.
  const limit = networkLimitOf(state, at);
  if (limit === 'data-saver' || limit === 'offline') return 0;
  if (closedLoop && contentionOf(state, at) !== 'none') return 0;
  const thermal = thermalActing(state);
  const memory = memoryOf(state, at);
  if (closedLoop && (thermal === 'critical' || memory === 'low')) return 0;
  const allowed =
    state.network.metered === true
      ? Math.min(state.config.maxOptionalConcurrency, state.config.meteredOptionalConcurrency)
      : state.config.maxOptionalConcurrency;
  const constrained =
    // A weak link carries one optional task at a time.
    limit === 'slow' ||
    limit === 'unstable' ||
    capacityClassOf(state.capacity, state.config) === 'low' ||
    state.capacity.totalMemoryBytes === null ||
    (closedLoop &&
      (thermal === 'hot' || thermal === 'warm' || memory === 'trimmed' || state.stack.length > 0));
  return constrained ? Math.min(1, allowed) : allowed;
}

/** Verger's published output at time `at` (ambient sleep depends on elapsed time). */
export function snapshotOf(state: VergerState, at: number = state.at): VergerSnapshot {
  const limit = limitFloors(state, at);
  const base = combine(state.levers, limit, classFloors(state));
  const envelope: Record<string, LeverEnvelope> = {};
  for (const lever of state.levers) {
    const ceiling = base[lever.id] ?? 0;
    envelope[lever.id] = {
      limit: limit[lever.id] ?? 0,
      ceiling,
      home: Math.min(lever.maxLevel, Math.max(ceiling, state.home[lever.id] ?? 0)),
      floor: lever.maxLevel,
    };
  }
  const baseline = combine(state.levers, base);
  const raw = closedLoop(state)
    ? combine(state.levers, base, state.pressure, dynamicFloors(state, at))
    : baseline;
  // Invariant 7: while a gesture or scroll is under way, a lowering waits (at most
  // `gestureFreezeMaxMs`); limits and the class (the baseline) and every raise apply at once.
  const held = state.heldDecided;
  const holding = held !== null && freezeHolds(state, at);
  const loop: Record<string, number> = {};
  for (const lever of state.levers) {
    const decided = raw[lever.id] ?? 0;
    const was = held?.[lever.id];
    loop[lever.id] =
      holding && was !== undefined
        ? Math.max(Math.min(decided, was), baseline[lever.id] ?? 0)
        : decided;
  }
  // P5: after heat, published quality climbs one lever step at a time, on evidence. Lowering and
  // the baseline apply at once; the step goes to the lever lowered last (the stack's top).
  if (held !== null && heatPacing(state, at)) {
    const ready = heatStepReady(state, at);
    const order = [...state.stack].reverse();
    for (const lever of state.levers) if (!order.includes(lever.id)) order.push(lever.id);
    let released = false;
    for (const id of order) {
      const decided = loop[id] ?? 0;
      const was = held[id];
      if (was === undefined || decided >= was) continue;
      const floor = baseline[id] ?? 0;
      if (ready && !released) {
        loop[id] = Math.max(was - 1, decided, floor);
        released = true;
      } else loop[id] = Math.max(was, floor);
    }
  }
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
  const thermal = thermalActing(state);
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
    battery: state.battery,
    thermalSource: thermalReading(state).source,
    thermalProjected: thermalProjected(state),
    batteryHoursLeft: batteryHoursLeft(state),
    energyShort: energyShort(state),
    network: state.network,
    networkLimit: networkLimitOf(state, at),
    dataBudget: state.dataBudget,
    storage: storageOf(state),
    capacityClass: capacityClassOf(state.capacity, state.config),
    envelope,
    ineffective: state.ineffective,
    gains: state.leverGains,
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
      // The hint session acts on reported frame work; deaf, or before the first report, it would
      // boost blind (R9). Reports, not the switch: a deaf sensor must act like a silent one.
      state.framesHeard &&
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
  state: VergerState,
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
  const thermal = thermalActing(state);
  const touching = gestureActive(state, at);
  const forced = thermal === 'hot' || thermal === 'critical';
  if (!touching || forced) return { refreshCapHz: wantCap, globalReducedMotion: wantMotion };
  return {
    refreshCapHz: wantCap === null ? null : state.heldRefreshCapHz,
    globalReducedMotion: wantMotion ? state.heldGlobalMotion : false,
  };
}

/** The loop's own pressure, apart from what remains of the learned starting point. */
function splitPressure(state: VergerState): {
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

function outputsEqual(a: VergerSnapshot, b: VergerSnapshot): boolean {
  if (
    a.frameState !== b.frameState ||
    a.thermal !== b.thermal ||
    a.memory !== b.memory ||
    a.powerSaver !== b.powerSaver ||
    a.network !== b.network ||
    a.networkLimit !== b.networkLimit ||
    a.dataBudget !== b.dataBudget ||
    a.storage !== b.storage ||
    a.capacityClass !== b.capacityClass ||
    a.battery !== b.battery ||
    a.thermalSource !== b.thermalSource ||
    a.thermalProjected !== b.thermalProjected ||
    a.energyShort !== b.energyShort ||
    a.visibility !== b.visibility ||
    a.interactionIdle !== b.interactionIdle ||
    a.optionalConcurrency !== b.optionalConcurrency ||
    a.contention !== b.contention ||
    a.contentionExhausted !== b.contentionExhausted ||
    a.refreshCapHz !== b.refreshCapHz ||
    a.cpuBoost !== b.cpuBoost ||
    a.globalReducedMotion !== b.globalReducedMotion ||
    a.activation !== b.activation ||
    a.ineffective !== b.ineffective
  ) {
    return false;
  }
  for (const key of Object.keys(b.proposedLevels)) {
    const x = a.envelope[key];
    const y = b.envelope[key];
    if (
      x?.limit !== y?.limit ||
      x?.ceiling !== y?.ceiling ||
      x?.home !== y?.home ||
      x?.floor !== y?.floor
    )
      return false;
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
 * tick instead of polling: ambient sleep, a network settling, contention starting after a sustained saturation,
 * the next contention step while it lasts, long tasks ageing out, and an upgrade becoming due.
 * Native sensors report only changes, so without this a steady saturated thread would never
 * be acted on.
 */
export function nextTimedChangeAt(state: VergerState): number | null {
  const now = state.at;
  const { saturationAfterMs, longTaskWindowMs, ambientSleepAfterMs } = state.config;
  const candidates: number[] = [];
  if (!interactionIdle(state, now)) candidates.push(state.lastInteractionAt + ambientSleepAfterMs);
  candidates.push(state.lastInteractionAt + state.config.gestureQuietMs);
  if (Number.isFinite(state.scrollingUntil)) candidates.push(state.scrollingUntil);
  if (state.freezeSince !== null) candidates.push(state.freezeSince + state.config.gestureFreezeMaxMs);
  if (state.thermalCoolerSince !== null)
    candidates.push(state.thermalCoolerSince + state.config.thermalDwellMs);
  // Heat's recovery and pacing end by time alone (P5).
  if (state.heatTouchedAt !== null) {
    candidates.push(state.heatTouchedAt + state.config.thermalRecoverMs);
    candidates.push(state.heatTouchedAt + state.config.thermalPaceMs);
    if (heatPacing(state, now))
      candidates.push(state.heatStepAt + state.config.thermalStepMs);
  }
  // A drain estimate changes as its oldest reading leaves the window.
  const oldestLevel = state.levelTrace[0];
  if (oldestLevel !== undefined) candidates.push(oldestLevel[0] + state.config.energyDrainWindowMs + 1);
  // A trend fades as its oldest reading leaves the window.
  for (const trace of [state.headroomTrace, state.batteryTrace]) {
    const oldest = trace[0];
    if (oldest !== undefined) candidates.push(oldest[0] + state.config.thermalTrendWindowMs + 1);
  }
  for (const since of [state.jsSaturatedSince, state.mainSaturatedSince]) {
    if (since === null) continue;
    candidates.push(since + saturationAfterMs, state.lastContentionActionAt + saturationAfterMs);
  }
  for (const t of state.longTasks) candidates.push(t + longTaskWindowMs + 1);
  if (state.contentionExhausted)
    candidates.push(state.lastContentionActionAt + 5 * saturationAfterMs + 1);
  // An unstable network settles by time alone.
  if (state.lastOfflineAt !== null && !offline(state.network))
    candidates.push(state.lastOfflineAt + state.config.networkSettleMs);
  // p5: each lever's evidence completes at its own time.
  if (state.expansion) {
    for (const candidate of expansionCandidates(state, now)) candidates.push(candidate.readyAt);
    // A flapping lever's longest wait ends a whole window after its last flap.
    for (const [id, flaps] of Object.entries(state.leverFlaps)) {
      const last = flaps[flaps.length - 1];
      if (last !== undefined && flapping(state, id, now))
        candidates.push(last + state.config.flapWindowMs);
    }
  }
  if (state.stack.length > 0) {
    const lastChange = Math.max(state.lastPressureAt, state.lastDecreaseAt, state.lastIncreaseAt);
    candidates.push(lastChange + state.upgradeAfterMs);
  }
  let next: number | null = null;
  for (const t of candidates) if (t > now && (next === null || t < next)) next = t;
  return next;
}
