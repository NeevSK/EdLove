import type { GovernorConfig, GovernorEvent, RuntimePort } from '@repo/core/governor';
import { NativeModule, requireOptionalNativeModule } from 'expo';
import {
  type NativeCapacity,
  type NativeLever,
  type NativeSenseConfig,
  type RuntimeSenseEvents,
  senseConfigFrom,
  toCapacityFacts,
  toGovernorEvent,
} from './src/mapping';

export * from './src/mapping';

declare class RuntimeSenseNativeModule extends NativeModule<RuntimeSenseEvents> {
  readCapacity(): NativeCapacity;
  start(config: NativeSenseConfig): void;
  stop(): void;
  setRefreshCap(hz: number | null): void;
  setCpuBoost(enabled: boolean): void;
  readTotals(): { frames?: number; missedVsyncs?: number; costMs?: number };
}

/** Null on iOS, on web, and in any build that predates the module. */
const native = requireOptionalNativeModule<RuntimeSenseNativeModule>('RuntimeSense');

export const isRuntimeSenseAvailable = native !== null;

export function readFrameTotals(): { frames: number; missedVsyncs: number; costMs: number } {
  const totals = native?.readTotals() ?? {};
  return { frames: totals.frames ?? 0, missedVsyncs: totals.missedVsyncs ?? 0, costMs: totals.costMs ?? 0 };
}

/**
 * The governor's port onto this device. Without the native module every method is inert and
 * capacity is unknown, so the governor runs on static facts and JS-side signals alone.
 */
export function createRuntimeSensePort(
  now: () => number = () => performance.now(),
  onLever?: (event: NativeLever) => void,
): RuntimePort {
  return {
    capacity: toCapacityFacts(native?.readCapacity()),
    start(config: GovernorConfig, onEvent: (event: GovernorEvent) => void) {
      if (!native) return () => {};
      const subscriptions = [
        native.addListener('onFrameWindow', (payload) => onEvent(toGovernorEvent({ name: 'onFrameWindow', payload }, now()))),
        native.addListener('onThermal', (payload) => onEvent(toGovernorEvent({ name: 'onThermal', payload }, now()))),
        native.addListener('onMemoryTrim', (payload) => onEvent(toGovernorEvent({ name: 'onMemoryTrim', payload }, now()))),
        native.addListener('onPowerSaver', (payload) => onEvent(toGovernorEvent({ name: 'onPowerSaver', payload }, now()))),
        native.addListener('onThreadLoad', (payload) => onEvent(toGovernorEvent({ name: 'onThreadLoad', payload }, now()))),
        native.addListener('onMemory', (payload) => onEvent(toGovernorEvent({ name: 'onMemory', payload }, now()))),
        native.addListener('onLever', (payload) => onLever?.(payload)),
      ];
      native.start(senseConfigFrom(config));
      return () => {
        native.stop();
        for (const subscription of subscriptions) subscription.remove();
      };
    },
    setRefreshCap(hz) {
      native?.setRefreshCap(hz);
    },
    setCpuBoost(enabled) {
      native?.setCpuBoost(enabled);
    },
  };
}
