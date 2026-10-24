import type {
  GovernorConfig,
  GovernorEvent,
  RuntimePort,
  SensorId,
  VergerPlatform,
} from '@repo/verger-core';
import { NativeModule, requireOptionalNativeModule } from 'expo';
import {
  FRAME_WINDOW_MS,
  type NativeCapacity,
  type NativeExit,
  type NativeLever,
  type NativeSenseConfig,
  senseConfigFrom,
  toCapacityFacts,
  toExitRecords,
  toGovernorEvent,
  type VergerAndroidEvents,
} from './src/mapping';

export * from './src/mapping';

declare class VergerNativeModule extends NativeModule<VergerAndroidEvents> {
  readCapacity(): NativeCapacity;
  readExits(sinceWallMs: number): NativeExit[] | null;
  readProcessId(): number;
  start(config: NativeSenseConfig): void;
  setSensors(sensors: Readonly<Record<SensorId, boolean>>): void;
  stop(): void;
  setRefreshCap(hz: number | null): void;
  setCpuBoost(enabled: boolean): void;
  readTotals(): { frames?: number; missedVsyncs?: number; costMs?: number };
}

/** Null on iOS, on web, and in any build that predates the module. */
const native = requireOptionalNativeModule<VergerNativeModule>('Verger');

export const isVergerAndroidAvailable = native !== null;

export function readFrameTotals(): { frames: number; missedVsyncs: number; costMs: number } {
  const totals = native?.readTotals() ?? {};
  return {
    frames: totals.frames ?? 0,
    missedVsyncs: totals.missedVsyncs ?? 0,
    costMs: totals.costMs ?? 0,
  };
}

/**
 * Verger's platform on Android. Facts (capacity, exit history) are read-only calls that start
 * nothing; the port brings up sensing and the hardware levers. Without the native module the
 * facts are unknown, there is no exit history, and the port is inert, so verger runs on
 * JS-side signals alone.
 */
export function createVergerAndroidPlatform(
  onLever?: (event: NativeLever) => void,
): VergerPlatform {
  return {
    readCapacity: () => toCapacityFacts(native?.readCapacity()),
    ...(native
      ? {
          readExits: (sinceWallMs: number) => toExitRecords(native.readExits(sinceWallMs)),
          readProcessId: () => native.readProcessId(),
          readTotals: readFrameTotals,
        }
      : {}),
    memorySensing: native !== null,
    createPort: (now) => createVergerAndroidPort(now, onLever),
  };
}

/** The live half: native sensors and hardware levers. */
export function createVergerAndroidPort(
  now: () => number = () => performance.now(),
  onLever?: (event: NativeLever) => void,
): RuntimePort {
  return {
    start(
      config: GovernorConfig,
      onEvent: (event: GovernorEvent) => void,
      sensors?: Readonly<Record<SensorId, boolean>>,
    ) {
      if (!native) return () => {};
      const subscriptions = [
        native.addListener('onFrameWindow', (payload) =>
          onEvent(toGovernorEvent({ name: 'onFrameWindow', payload }, now())),
        ),
        native.addListener('onThermal', (payload) =>
          onEvent(toGovernorEvent({ name: 'onThermal', payload }, now())),
        ),
        native.addListener('onMemoryTrim', (payload) =>
          onEvent(toGovernorEvent({ name: 'onMemoryTrim', payload }, now())),
        ),
        native.addListener('onPowerSaver', (payload) =>
          onEvent(toGovernorEvent({ name: 'onPowerSaver', payload }, now())),
        ),
        native.addListener('onThreadLoad', (payload) =>
          onEvent(toGovernorEvent({ name: 'onThreadLoad', payload }, now())),
        ),
        native.addListener('onMemory', (payload) =>
          onEvent(toGovernorEvent({ name: 'onMemory', payload }, now())),
        ),
        native.addListener('onNetwork', (payload) =>
          onEvent(toGovernorEvent({ name: 'onNetwork', payload }, now())),
        ),
        native.addListener('onBattery', (payload) =>
          onEvent(toGovernorEvent({ name: 'onBattery', payload }, now())),
        ),
        native.addListener('onLever', (payload) => onLever?.(payload)),
      ];
      native.start(senseConfigFrom(config, FRAME_WINDOW_MS, sensors));
      return () => {
        native.stop();
        for (const subscription of subscriptions) subscription.remove();
      };
    },
    setSensors(sensors) {
      native?.setSensors(sensors);
    },
    setRefreshCap(hz) {
      native?.setRefreshCap(hz);
    },
    setCpuBoost(enabled) {
      native?.setCpuBoost(enabled);
    },
  };
}
