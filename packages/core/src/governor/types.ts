/**
 * Adaptive runtime governor: shared types.
 *
 * The governor is a pure, deterministic reducer. Native sensing (the
 * `runtime-sense` Expo module) and web sensing feed it events; consumers read
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
}

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

/** Android `ComponentCallbacks2` trim levels the governor distinguishes. */
export type TrimSeverity = 'moderate' | 'low' | 'critical';

export type FidelityPreference = 'auto' | 'low' | 'high';

export type GovernorEvent =
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
  | { readonly type: 'interaction'; readonly at: number }
  | { readonly type: 'app-state'; readonly at: number; readonly state: AppVisibility }
  | {
      readonly type: 'preferences';
      readonly at: number;
      readonly reduceMotion: boolean;
      readonly fidelity: FidelityPreference;
    }
  | { readonly type: 'tick'; readonly at: number };

/** Unity-style indexer action, extended with the governor's reasons. */
export type IndexerAction = 'fast-decrease' | 'decrease' | 'stale' | 'increase';

/** What a lever primarily relieves. Used to match levers to the current bottleneck. */
export type LeverTarget = 'gpu' | 'cpu' | 'memory' | 'energy';
export type VisualImpact = 'low' | 'medium' | 'high';

/**
 * A quality lever owned by a consumer. Level 0 is full quality; `maxLevel` is the
 * cheapest setting. Consumers interpret levels; the governor only orders them.
 */
export interface LeverSpec {
  readonly id: string;
  readonly maxLevel: number;
  readonly visualImpact: VisualImpact;
  readonly target: LeverTarget;
  /**
   * Ambient levers decorate rather than inform. They sleep (go to `maxLevel`) when nobody
   * has touched the screen for `ambientSleepAfterMs`, independent of pressure.
   */
  readonly ambient: boolean;
  /** Levers that animate are forced to `maxLevel` when the user or system reduces motion. */
  readonly motion: boolean;
  /** One line per level, index = level. Documentation for consumers and diagnostics. */
  readonly levels: readonly string[];
}

export type GovernorMode = 'active' | 'shadow';

export interface GovernorConfig {
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
}

export interface GovernorSnapshot {
  readonly version: number;
  readonly at: number;
  readonly mode: GovernorMode;
  /** Levels consumers should apply. In shadow mode these are the baseline, not the proposal. */
  readonly levels: Readonly<Record<string, number>>;
  /** What the closed loop would apply. Equal to `levels` in active mode. */
  readonly proposedLevels: Readonly<Record<string, number>>;
  readonly frameState: FrameState;
  readonly thermal: ThermalLevel;
  readonly memory: MemoryLevel;
  readonly powerSaver: boolean;
  readonly visibility: AppVisibility;
  readonly interactionIdle: boolean;
  readonly optionalConcurrency: number;
  /** The last indexer action and why. */
  readonly lastAction: IndexerAction;
  readonly lastReason: string;
}
