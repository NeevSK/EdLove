import type { VergerActivation } from './activation';

/**
 * Verger: shared types.
 *
 * Verger's policy is a pure, deterministic reducer. Native sensing (the
 * `@repo/verger-android` Expo module) and web sensing feed it events; consumers read
 * lever levels and work budgets from its snapshot. Time is always injected
 * (`at`, in milliseconds on a monotonic clock) so the same event stream always
 * produces the same decisions, on device and in replay tests.
 */

/** What the device is, read once. `null` means the platform did not say. */
export interface CapacityFacts {
  readonly totalMemoryBytes: number | null;
  readonly isLowRamDevice: boolean | null;
  /** Per-app heap budget the OS advertises (Android `getMemoryClass`). */
  readonly memoryClassMb: number | null;
  readonly sdkInt: number | null;
  readonly cpuCores: number | null;
  readonly refreshRateHz: number | null;
  /** Android 12+ `RenderEffect` (blur). */
  readonly supportsRenderEffect: boolean;
  /** Android 13+ `RuntimeShader` (AGSL refraction). */
  readonly supportsRuntimeShader: boolean;
  /** Refresh rates the display offers at its current resolution, ascending; empty if unknown. */
  readonly refreshRatesHz: readonly number[];
  /** Android 12+ ADPF performance hint sessions are available. */
  readonly supportsCpuHints: boolean;
  /**
   * Identifies the OS build (Android `Build.FINGERPRINT`). Kept on the device only, hashed, to
   * relearn the profile after a system update. Absent when the platform does not say.
   */
  readonly buildFingerprint?: string | null;
}

/** Threads the native sampler attributes CPU time to (see `ThreadRole` in verger-android). */
export type ThreadRoleName = 'main' | 'js' | 'nativeModules' | 'render' | 'gc' | 'image' | 'other';

/** What is saturating the CPU, if anything: the JS thread, the main thread, or neither. */
export type Contention = 'none' | 'js' | 'main';

/** One aggregation window of rendered frames. Windows are only produced when frames arrive. */
export interface FrameWindow {
  readonly startMs: number;
  readonly endMs: number;
  readonly frames: number;
  /** Mean frame cost in this window. */
  readonly averageMs: number;
  /** The frame deadline (refresh interval) the frames were measured against. */
  readonly targetMs: number;
  readonly worstMs: number;
  /** Missed vsyncs divided by (frames + missed vsyncs). */
  readonly droppedRatio: number;
  /** Mean cost per pipeline stage, when the platform reports stages (Android FrameMetrics). */
  readonly stages?: FrameStages;
}

/**
 * Where a frame's time went. `ui`: input, animation, layout and draw on the main thread.
 * `render`: sync, command issue and buffer swap on the render thread. `gpu`: GPU work
 * (Android 12+; 0 when unknown). `delay`: time before the frame could start, because the main
 * thread was busy with other work.
 */
export type FrameStage = 'ui' | 'render' | 'gpu' | 'delay';

export interface FrameStages {
  readonly uiMs: number;
  readonly renderMs: number;
  readonly gpuMs: number;
  readonly delayMs: number;
}

export type FrameState = 'quiet' | 'calm' | 'neutral' | 'stressed';
export type ThermalLevel = 'unknown' | 'nominal' | 'warm' | 'hot' | 'critical';
export type MemoryLevel = 'unknown' | 'normal' | 'trimmed' | 'low';
export type AppVisibility = 'active' | 'inactive' | 'background';

/** Android `PowerManager.THERMAL_STATUS_*`, by name. */
export type ThermalStatus =
  | 'none'
  | 'light'
  | 'moderate'
  | 'severe'
  | 'critical'
  | 'emergency'
  | 'shutdown';

/** Android `ComponentCallbacks2` trim levels verger distinguishes. */
export type TrimSeverity = 'moderate' | 'low' | 'critical';

export type FidelityPreference = 'auto' | 'low' | 'high';

/** How the device reaches the network. */
export type NetworkTransport = 'wifi' | 'cellular' | 'ethernet' | 'other' | 'none';

/**
 * Android Data Saver as it applies to this app (`ConnectivityManager.getRestrictBackgroundStatus`):
 * `enabled` restricts background data, `allowlisted` means the user exempted this app.
 */
export type DataSaver = 'disabled' | 'allowlisted' | 'enabled';

/**
 * One lever's envelope, as levels (0 is full quality, `maxLevel` the cheapest). In quality
 * terms: `limit` is the best quality allowed (never crossed), `ceiling` the best this device
 * has earned (the class), `home` where the lever starts and settles (the ceiling or the learned
 * starting point), `floor` the worst quality allowed. As levels: limit <= ceiling <= home <= floor.
 */
export interface LeverEnvelope {
  readonly limit: number;
  readonly ceiling: number;
  readonly home: number;
  readonly floor: number;
}

/** The network's limit on optional data, strongest first. */
export type NetworkLimit = 'offline' | 'data-saver' | 'unstable' | 'slow' | 'none';

/** A phone's capacity class, from its memory. */
export type CapacityClass = 'low' | 'mid' | 'high' | 'unknown';

export type VergerEvent =
  | { readonly type: 'frame-window'; readonly at: number; readonly window: FrameWindow }
  | {
      readonly type: 'thermal';
      readonly at: number;
      readonly status: ThermalStatus | null;
      /** ADPF thermal headroom: 0 = no throttling, 1 = severe throttling. `null` when unsupported. */
      readonly headroom: number | null;
    }
  | { readonly type: 'memory-trim'; readonly at: number; readonly severity: TrimSeverity }
  | { readonly type: 'power'; readonly at: number; readonly saver: boolean }
  | {
      /** Battery state; heard through the power sensor. `null` fields are unknown. */
      readonly type: 'battery';
      readonly at: number;
      readonly levelPercent: number | null;
      readonly pluggedIn: boolean | null;
      readonly temperatureC: number | null;
    }
  | { readonly type: 'interaction'; readonly at: number }
  | { readonly type: 'app-state'; readonly at: number; readonly state: AppVisibility }
  | {
      readonly type: 'preferences';
      readonly at: number;
      readonly reduceMotion: boolean;
      readonly fidelity: FidelityPreference;
    }
  | {
      readonly type: 'thread-load';
      readonly at: number;
      /** Cores in use per role over the last interval: 1.0 is one core fully busy. */
      readonly cores: Readonly<Partial<Record<ThreadRoleName, number>>>;
      readonly processCores: number;
    }
  | {
      /** Polled system memory; covers API 34+, where foreground apps receive no trims. */
      readonly type: 'memory-state';
      readonly at: number;
      readonly availableMb: number;
      readonly thresholdMb: number;
      readonly lowMemory: boolean;
    }
  | {
      /** The network as the platform reports it; `null` fields are unknown, not false. */
      readonly type: 'network';
      readonly at: number;
      readonly transport: NetworkTransport | null;
      /** The platform has validated that the network reaches the internet. */
      readonly validated: boolean | null;
      readonly metered: boolean | null;
      /** The platform's downstream bandwidth estimate. */
      readonly downKbps: number | null;
      readonly dataSaver: DataSaver | null;
    }
  /** Thresholds from now on (a validated, complete config): live tuning in the lab. */
  | { readonly type: 'config'; readonly at: number; readonly config: VergerConfig }
  /** What verger may do from now on; already resolved and capped by the launch. */
  | { readonly type: 'activation'; readonly at: number; readonly activation: VergerActivation }
  /** A JS task that ran without yielding for 50 ms or more (RN PerformanceObserver `longtask`). */
  | { readonly type: 'long-task'; readonly at: number; readonly durationMs: number }
  | { readonly type: 'tick'; readonly at: number };

/** Unity-style indexer action, extended with verger's reasons. */
export type IndexerAction = 'fast-decrease' | 'decrease' | 'stale' | 'increase';

/** Device capabilities a lever may require. `refreshCap`: the display offers a rate at or below the cap and one above it. */
export type Capability = 'renderEffect' | 'runtimeShader' | 'refreshCap';

/** App-wide effects verger applies itself. */
export type Actuator = 'refresh-cap' | 'global-reduced-motion';

/** What a lever primarily relieves. Used to match levers to the current bottleneck. */
export type LeverTarget = 'gpu' | 'cpu' | 'memory' | 'energy' | 'network';

/** The battery as verger last heard it; every field null until the power sensor reports. */
export interface BatteryState {
  readonly levelPercent: number | null;
  /** On external power (plugged in), whether or not it is charging: a full phone on its charger counts. */
  readonly pluggedIn: boolean | null;
  readonly temperatureC: number | null;
}

/** Where the heat reading came from: the platform's thermal service, or the battery as a fallback. */
export type ThermalSource = 'platform' | 'battery' | 'none';

/** The network as verger last heard it; every field null until the network sensor reports. */
export interface NetworkState {
  readonly transport: NetworkTransport | null;
  readonly validated: boolean | null;
  readonly metered: boolean | null;
  readonly downKbps: number | null;
  readonly dataSaver: DataSaver | null;
}
export type VisualImpact = 'low' | 'medium' | 'high';

/**
 * A quality lever owned by a consumer. Level 0 is full quality; `maxLevel` is the
 * cheapest setting. Consumers interpret levels; verger only orders them.
 */
export interface LeverSpec {
  readonly id: string;
  readonly maxLevel: number;
  readonly visualImpact: VisualImpact;
  readonly target: LeverTarget;
  /** Other resources this lever also relieves (a refresh cap gives CPU and GPU more time). */
  readonly alsoRelieves?: readonly LeverTarget[];
  /**
   * Device capabilities the lever's full quality needs. When one is missing (and capacity has
   * been reported), the lever is floored at `otherwiseLevel`.
   */
  readonly requires?: readonly {
    readonly capability: Capability;
    readonly otherwiseLevel: number;
  }[];
  /** Floor while the app is hidden, for levers that are neither ambient nor motion. */
  readonly whenHidden?: number;
  /** Floor while nobody has touched the screen for `ambientSleepAfterMs` (closed loop). */
  readonly whenIdle?: number;
  /** Floor while the device is warm or hotter (closed loop). */
  readonly whenWarm?: number;
  /** Floor on a metered network. A limit: it applies in static mode too. */
  readonly whenMetered?: number;
  /** Floor while Android Data Saver restricts this app (the user's choice). A limit. */
  readonly whenDataSaver?: number;
  /** Floor while there is no validated network. A limit. */
  readonly whenOffline?: number;
  /** Floor while the battery is low and the phone is not plugged in (config `batteryLowPercent`). */
  readonly whenBatteryLow?: number;
  /**
   * Floor while the network is slow (below config `slowNetworkKbps`) or unstable (back from
   * offline less than config `networkSettleMs` ago). A limit for optional data: intermittent
   * links are normal, so work that can wait does not spend a weak one.
   */
  readonly whenSlowNetwork?: number;
  /**
   * Floor on a mid-capacity phone (config `lowCapacityBelowBytes` to `midCapacityBelowBytes`):
   * what this lever gives up by default on hardware that cannot carry everything at once. Lifted
   * when the user asks for high fidelity, or once the phone has earned it back by measurement.
   */
  readonly whenMidCapacity?: number;
  /**
   * The app-wide effect verger itself applies for this lever, if any. A host lever without an
   * actuator is applied by the host's own consumers reading its level.
   */
  readonly actuator?: Actuator;
  /**
   * Ambient levers decorate rather than inform. They sleep (go to `maxLevel`) when nobody
   * has touched the screen for `ambientSleepAfterMs`, independent of pressure.
   */
  readonly ambient: boolean;
  /** Levers that animate are forced to `maxLevel` when the user or system reduces motion. */
  readonly motion: boolean;
  /** One line per level, index = level. Documentation for consumers and diagnostics. */
  readonly levels: readonly string[];
  /**
   * Moved only by measured pressure, never by static floors (capacity, fidelity, power saver).
   * For containment levers whose lowest level is drastic.
   */
  readonly closedLoopOnly?: boolean;
}

export type RunMode = 'active' | 'shadow';

export interface VergerConfig {
  /** Frames counted in a window before it is judged. Fewer means the window says nothing. */
  readonly minSamples: number;
  /** average / target above this is stress. */
  readonly stressRatio: number;
  readonly stressDroppedRatio: number;
  /** average / target below this (with few drops) is comfort. */
  readonly comfortRatio: number;
  readonly comfortDroppedRatio: number;
  /** Continuous stress needed before a decrease. */
  readonly downgradeAfterMs: number;
  /** Continuous comfort needed before an increase (doubles after a failed upgrade). */
  readonly upgradeAfterMs: number;
  readonly maxUpgradeAfterMs: number;
  /** A downgrade within this long after an upgrade marks the upgrade as failed. */
  readonly failedUpgradeWindowMs: number;
  /** Back-off resets after this long without any level change. */
  readonly resetBackoffAfterMs: number;
  /** Minimum spacing between thermal-driven decreases. */
  readonly thermalActionDelayMs: number;
  /** ADPF guide thresholds for headroom: watch, reduce, critical. */
  readonly headroomWarm: number;
  readonly headroomHot: number;
  readonly headroomCritical: number;
  /** How long a memory trim keeps pressure latched. */
  readonly memoryLatchMs: number;
  readonly ambientSleepAfterMs: number;
  /** Levers moved by one fast-decrease. */
  readonly fastDecreaseSteps: number;
  /** Optional background work allowed when nothing constrains it. */
  readonly maxOptionalConcurrency: number;
  /**
   * Optional work allowed on a metered network. Where most users are always metered (Sri Lanka's
   * teachers, on prepaid mobile data), metered is the normal state, not strain: the default is no
   * reduction, and Data Saver and a data budget protect the user instead. A host's choice.
   */
  readonly meteredOptionalConcurrency: number;
  /** At or below this level, and not plugged in, the battery is low (the original runtime spec's 20%). */
  readonly batteryLowPercent: number;
  /**
   * Total memory, as the OS reports it, below which a phone is low capacity. The OS reports less
   * than the marketed size (it keeps some for itself), so the default (5 GiB) puts 4 GB phones
   * here. Provisional until phones confirm what they report.
   */
  readonly lowCapacityBelowBytes: number;
  /** Below this, a phone is mid capacity (default 9 GiB: 6 and 8 GB phones); at or above, high. */
  readonly midCapacityBelowBytes: number;
  /** A downstream estimate below this is a slow network (kbps). */
  readonly slowNetworkKbps: number;
  /** A network back from offline counts as unstable for this long. */
  readonly networkSettleMs: number;
  /**
   * Least confidence an account reading must carry to count as evidence for expansion (0 to 1).
   * Below it the reading is ignored, as unknown is. Evidence must last `upgradeAfterMs` divided
   * by the confidence: a weak witness has to stay calm longer.
   */
  readonly expandMinConfidence: number;
  /**
   * Heat from battery temperature, used only where the platform gives no thermal status or
   * headroom (Android 9). Provisional until device captures calibrate them.
   */
  readonly batteryWarmC: number;
  readonly batteryHotC: number;
  readonly batteryCriticalC: number;
  /** A thread role using at least this many cores is saturated. */
  readonly saturationCores: number;
  /** Saturation must last this long before it counts as contention. */
  readonly saturationAfterMs: number;
  /** Long tasks within this window that also count as JS contention. */
  readonly longTaskWindowMs: number;
  readonly longTasksForContention: number;
  /** Free memory below threshold × factor is treated as a trim of that severity. */
  readonly memoryLowFactor: number;
  readonly memoryModerateFactor: number;
  /** The refresh cap applied under heat, power saving, pressure or idleness. */
  readonly refreshCapHz: number;
  /** A window with fewer frames is still stressed if one frame took this many frame budgets. */
  readonly jankFrameFactor: number;
  /** Contention steps that may fail to relieve the saturated thread before the runtime stops. */
  readonly maxUnrelievedContentionSteps: number;
  /** Drops in cores, or in long tasks, that count as relief after a contention step. */
  readonly contentionReliefCores: number;
  /** Quality-lowering hardware changes wait this long after the last touch (gesture freeze). */
  readonly gestureQuietMs: number;
}

export interface VergerSnapshot {
  readonly version: number;
  readonly at: number;
  readonly mode: RunMode;
  /** Levels consumers should apply. In shadow mode these are the baseline, not the proposal. */
  readonly levels: Readonly<Record<string, number>>;
  /** What the closed loop would apply. Equal to `levels` in active mode. */
  readonly proposedLevels: Readonly<Record<string, number>>;
  /**
   * The static baseline (floors from capacity, settings, power, visibility) before any measured
   * pressure: what a shadow lever publishes, and what every decision starts from.
   */
  readonly baselineLevels: Readonly<Record<string, number>>;
  readonly frameState: FrameState;
  readonly thermal: ThermalLevel;
  readonly memory: MemoryLevel;
  readonly powerSaver: boolean;
  readonly battery: BatteryState;
  readonly thermalSource: ThermalSource;
  readonly network: NetworkState;
  /** What the network limits now, strongest first; `none` when unknown or fine. */
  readonly networkLimit: NetworkLimit;
  /** The phone's class from its memory (config thresholds); `unknown` when memory is unknown. */
  readonly capacityClass: CapacityClass;
  /**
   * Each governed lever's envelope, as levels (a higher level is less quality): see
   * `LeverEnvelope`. Published by every policy; only an expanding policy (verger-p5) moves a
   * lever between its home and its ceiling on evidence.
   */
  readonly envelope: Readonly<Record<string, LeverEnvelope>>;
  readonly visibility: AppVisibility;
  readonly interactionIdle: boolean;
  readonly optionalConcurrency: number;
  /** Which thread, if any, is saturated; deferrable work pauses while it is. */
  readonly contention: Contention;
  /** Contention that shedding did not relieve: the cause is code to fix, not quality to lower. */
  readonly contentionExhausted: boolean;
  /** Display refresh cap to apply, or null to let the system choose. */
  readonly refreshCapHz: number | null;
  /** Whether to hold an ADPF hint session for the UI and render threads. */
  readonly cpuBoost: boolean;
  /** Force reduced motion for every Reanimated animation, including unregistered ones. */
  readonly globalReducedMotion: boolean;
  /**
   * Steps the closed loop itself has lowered each lever by this session, before any floor and
   * apart from the learned starting point. What the profile learns from.
   */
  readonly pressure: Readonly<Record<string, number>>;
  /** What remains of the learned starting point, per lever; the loop gives it back last. */
  readonly priorHeld: Readonly<Record<string, number>>;
  /** The last indexer action and why. */
  readonly lastAction: IndexerAction;
  readonly lastReason: string;
  /** What verger was allowed to do when this snapshot was taken. */
  readonly activation: VergerActivation;
}
