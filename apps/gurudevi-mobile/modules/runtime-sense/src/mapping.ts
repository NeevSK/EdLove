import type {
  CapacityFacts,
  FrameState,
  GovernorConfig,
  GovernorEvent,
  ThermalStatus,
  TrimSeverity,
} from '@repo/core/governor';

/** Payloads exactly as `RuntimeSense.kt` emits them. */
export interface NativeFrameWindow {
  readonly startMs: number;
  readonly endMs: number;
  readonly frames: number;
  readonly averageMs: number;
  readonly targetMs: number;
  readonly worstMs: number;
  readonly droppedRatio: number;
  readonly state: FrameState;
}
export interface NativeThermal {
  readonly status: ThermalStatus | null;
  readonly headroom: number | null;
}
export interface NativeMemoryTrim {
  readonly severity: TrimSeverity;
  readonly level: number;
}
export interface NativePowerSaver {
  readonly saver: boolean;
}

export interface NativeCapacity {
  readonly totalMemoryBytes?: number | null;
  readonly isLowRamDevice?: boolean | null;
  readonly memoryClassMb?: number | null;
  readonly sdkInt?: number | null;
  readonly cpuCores?: number | null;
  readonly refreshRateHz?: number | null;
  readonly supportsRenderEffect?: boolean;
  readonly supportsRuntimeShader?: boolean;
  readonly supportsThermalHeadroom?: boolean;
  readonly supportsFrameDeadline?: boolean;
}

export type RuntimeSenseEvents = {
  onFrameWindow: (event: NativeFrameWindow) => void;
  onThermal: (event: NativeThermal) => void;
  onMemoryTrim: (event: NativeMemoryTrim) => void;
  onPowerSaver: (event: NativePowerSaver) => void;
};

/** What `start` accepts; every threshold is taken from the governor's own config. */
export interface NativeSenseConfig {
  readonly windowMs: number;
  readonly minSamples: number;
  readonly stressRatio: number;
  readonly stressDroppedRatio: number;
  readonly comfortRatio: number;
  readonly comfortDroppedRatio: number;
  readonly headroomWarm: number;
}

/** The frame window the golden vectors were generated with. */
export const FRAME_WINDOW_MS = 500;

export function senseConfigFrom(config: GovernorConfig, windowMs = FRAME_WINDOW_MS): NativeSenseConfig {
  return {
    windowMs,
    minSamples: config.minSamples,
    stressRatio: config.stressRatio,
    stressDroppedRatio: config.stressDroppedRatio,
    comfortRatio: config.comfortRatio,
    comfortDroppedRatio: config.comfortDroppedRatio,
    headroomWarm: config.headroomWarm,
  };
}

const finite = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function toCapacityFacts(native: NativeCapacity | null | undefined): CapacityFacts {
  return {
    totalMemoryBytes: finite(native?.totalMemoryBytes),
    isLowRamDevice: typeof native?.isLowRamDevice === 'boolean' ? native.isLowRamDevice : null,
    memoryClassMb: finite(native?.memoryClassMb),
    sdkInt: finite(native?.sdkInt),
    cpuCores: finite(native?.cpuCores),
    refreshRateHz: finite(native?.refreshRateHz),
    supportsRenderEffect: native?.supportsRenderEffect === true,
    supportsRuntimeShader: native?.supportsRuntimeShader === true,
  };
}

type NativeEvent =
  | { readonly name: 'onFrameWindow'; readonly payload: NativeFrameWindow }
  | { readonly name: 'onThermal'; readonly payload: NativeThermal }
  | { readonly name: 'onMemoryTrim'; readonly payload: NativeMemoryTrim }
  | { readonly name: 'onPowerSaver'; readonly payload: NativePowerSaver };

/**
 * Native payload to governor event. `at` is the JavaScript clock at receipt: the governor's
 * timing runs on one clock, and the window's own start and end stay on the sensor's timeline.
 */
export function toGovernorEvent(event: NativeEvent, at: number): GovernorEvent {
  switch (event.name) {
    case 'onFrameWindow': {
      const { state: _state, ...window } = event.payload;
      return { type: 'frame-window', at, window };
    }
    case 'onThermal':
      return { type: 'thermal', at, status: event.payload.status, headroom: finite(event.payload.headroom) };
    case 'onMemoryTrim':
      return { type: 'memory-trim', at, severity: event.payload.severity };
    case 'onPowerSaver':
      return { type: 'power', at, saver: event.payload.saver };
  }
}
