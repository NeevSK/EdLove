import type { CapacityFacts, GovernorConfig, GovernorEvent } from '@repo/core/governor';
import { NativeModule, requireOptionalNativeModule } from 'expo';
import {
  type NativeCapacity,
  type NativeSenseConfig,
  type RuntimeSenseEvents,
  senseConfigFrom,
  toCapacityFacts,
  toGovernorEvent,
} from './src/mapping';

export * from './src/mapping';

declare class RuntimeSenseNativeModule extends NativeModule<RuntimeSenseEvents> {
  readonly capacity: NativeCapacity;
  start(config: NativeSenseConfig): void;
  stop(): void;
  readTotals(): { frames?: number; missedVsyncs?: number; costMs?: number };
}

/** Null on iOS, on web, and in any build that predates the module. */
const native = requireOptionalNativeModule<RuntimeSenseNativeModule>('RuntimeSense');

export const isRuntimeSenseAvailable = native !== null;

/** Device facts, read once. Unknown everywhere the module is absent. */
export function readCapacity(): CapacityFacts {
  return toCapacityFacts(native?.capacity);
}

export function readFrameTotals(): { frames: number; missedVsyncs: number; costMs: number } {
  const totals = native?.readTotals() ?? {};
  return { frames: totals.frames ?? 0, missedVsyncs: totals.missedVsyncs ?? 0, costMs: totals.costMs ?? 0 };
}

/**
 * Starts the sensor and forwards each change as a governor event. Returns a stop function.
 * Without the native module this is a no-op, and the governor runs on static facts alone.
 */
export function startRuntimeSense(
  config: GovernorConfig,
  onEvent: (event: GovernorEvent) => void,
  now: () => number = () => performance.now(),
): () => void {
  if (!native) return () => {};
  const subscriptions = [
    native.addListener('onFrameWindow', (payload) => onEvent(toGovernorEvent({ name: 'onFrameWindow', payload }, now()))),
    native.addListener('onThermal', (payload) => onEvent(toGovernorEvent({ name: 'onThermal', payload }, now()))),
    native.addListener('onMemoryTrim', (payload) => onEvent(toGovernorEvent({ name: 'onMemoryTrim', payload }, now()))),
    native.addListener('onPowerSaver', (payload) => onEvent(toGovernorEvent({ name: 'onPowerSaver', payload }, now()))),
  ];
  native.start(senseConfigFrom(config));
  return () => {
    native.stop();
    for (const subscription of subscriptions) subscription.remove();
  };
}
