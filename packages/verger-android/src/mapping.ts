import type {
  CapacityFacts,
  FrameStages,
  FrameState,
  GovernorConfig,
  GovernorEvent,
  ThermalStatus,
  ThreadRoleName,
  TrimSeverity,
} from '@repo/verger-core';

/** Payloads exactly as `VergerSense.kt` emits them. */
export interface NativeFrameWindow {
  readonly startMs: number;
  readonly endMs: number;
  readonly frames: number;
  readonly averageMs: number;
  readonly targetMs: number;
  readonly worstMs: number;
  readonly droppedRatio: number;
  readonly state: FrameState;
  /** `gpuMs` is null before Android 12, where GPU time is not reported. */
  readonly stages?: (Omit<FrameStages, 'gpuMs'> & { readonly gpuMs: number | null }) | null;
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
export interface NativeThreadLoad {
  readonly intervalMs: number;
  readonly processCores: number;
  readonly cores: Readonly<Partial<Record<ThreadRoleName, number>>>;
  readonly topOtherName: string;
  readonly topOtherCores: number;
  readonly rssMb: number | null;
}
export interface NativeMemory {
  readonly availableMb: number;
  readonly thresholdMb: number;
  readonly lowMemory: boolean;
  readonly rssMb: number | null;
}
/** What a hardware lever actually did; for diagnostics and telemetry, not for decisions. */
export interface NativeLever {
  readonly lever: 'refresh-cap' | 'cpu-boost';
  readonly requested: number | boolean | null;
  readonly applied: boolean;
  readonly modeId?: number;
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
  readonly supportsGpuDuration?: boolean;
  readonly supportsCpuHints?: boolean;
  readonly refreshRatesHz?: readonly number[];
  readonly largeMemoryClassMb?: number;
}

export type VergerAndroidEvents = {
  onFrameWindow: (event: NativeFrameWindow) => void;
  onThermal: (event: NativeThermal) => void;
  onMemoryTrim: (event: NativeMemoryTrim) => void;
  onPowerSaver: (event: NativePowerSaver) => void;
  onThreadLoad: (event: NativeThreadLoad) => void;
  onMemory: (event: NativeMemory) => void;
  onLever: (event: NativeLever) => void;
};

/** What `start` accepts; every threshold is taken from the governor's own config. */
export interface NativeSenseConfig {
  readonly windowMs: number;
  readonly minSamples: number;
  readonly stressRatio: number;
  readonly stressDroppedRatio: number;
  readonly comfortRatio: number;
  readonly comfortDroppedRatio: number;
  readonly jankFrameFactor: number;
  readonly headroomWarm: number;
  readonly saturationCores: number;
}

/** The frame window the golden vectors were generated with. */
export const FRAME_WINDOW_MS = 500;

export function senseConfigFrom(
  config: GovernorConfig,
  windowMs = FRAME_WINDOW_MS,
): NativeSenseConfig {
  return {
    windowMs,
    minSamples: config.minSamples,
    stressRatio: config.stressRatio,
    stressDroppedRatio: config.stressDroppedRatio,
    comfortRatio: config.comfortRatio,
    comfortDroppedRatio: config.comfortDroppedRatio,
    jankFrameFactor: config.jankFrameFactor,
    headroomWarm: config.headroomWarm,
    saturationCores: config.saturationCores,
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
    refreshRatesHz: Array.isArray(native?.refreshRatesHz)
      ? native.refreshRatesHz.filter(
          (hz) => typeof hz === 'number' && Number.isFinite(hz) && hz > 0,
        )
      : [],
    supportsCpuHints: native?.supportsCpuHints === true,
  };
}

type NativeEvent =
  | { readonly name: 'onFrameWindow'; readonly payload: NativeFrameWindow }
  | { readonly name: 'onThermal'; readonly payload: NativeThermal }
  | { readonly name: 'onMemoryTrim'; readonly payload: NativeMemoryTrim }
  | { readonly name: 'onPowerSaver'; readonly payload: NativePowerSaver }
  | { readonly name: 'onThreadLoad'; readonly payload: NativeThreadLoad }
  | { readonly name: 'onMemory'; readonly payload: NativeMemory };

/**
 * Native payload to governor event. `at` is the JavaScript clock at receipt: the governor's
 * timing runs on one clock, and the window's own start and end stay on the sensor's timeline.
 */
export function toGovernorEvent(event: NativeEvent, at: number): GovernorEvent {
  switch (event.name) {
    case 'onFrameWindow': {
      const { state: _state, stages, ...window } = event.payload;
      if (!stages) return { type: 'frame-window', at, window };
      const gpuMs = stages.gpuMs ?? Number.NaN;
      return { type: 'frame-window', at, window: { ...window, stages: { ...stages, gpuMs } } };
    }
    case 'onThermal':
      return {
        type: 'thermal',
        at,
        status: event.payload.status,
        headroom: finite(event.payload.headroom),
      };
    case 'onMemoryTrim':
      return { type: 'memory-trim', at, severity: event.payload.severity };
    case 'onPowerSaver':
      return { type: 'power', at, saver: event.payload.saver };
    case 'onThreadLoad':
      return {
        type: 'thread-load',
        at,
        cores: event.payload.cores,
        processCores: event.payload.processCores,
      };
    case 'onMemory':
      return {
        type: 'memory-state',
        at,
        availableMb: event.payload.availableMb,
        thresholdMb: event.payload.thresholdMb,
        lowMemory: event.payload.lowMemory,
      };
  }
}
