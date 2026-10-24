import type {
  VergerConfig,
  VergerEvent,
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
  toVergerEvent,
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

/** What the module senses itself; long tasks come from React Native, in JavaScript. */
const NATIVE_SENSORS: readonly SensorId[] = ['frames', 'threads', 'memory', 'thermal', 'power', 'network'];

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
    // Without the module nothing is sensed natively, so the host's JS readings stand in.
    senses: native ? NATIVE_SENSORS : [],
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
      config: VergerConfig,
      onEvent: (event: VergerEvent) => void,
      sensors?: Readonly<Record<SensorId, boolean>>,
    ) {
      if (!native) return () => {};
      const subscriptions = [
        native.addListener('onFrameWindow', (payload) =>
          onEvent(toVergerEvent({ name: 'onFrameWindow', payload }, now())),
        ),
        native.addListener('onThermal', (payload) =>
          onEvent(toVergerEvent({ name: 'onThermal', payload }, now())),
        ),
        native.addListener('onMemoryTrim', (payload) =>
          onEvent(toVergerEvent({ name: 'onMemoryTrim', payload }, now())),
        ),
        native.addListener('onPowerSaver', (payload) =>
          onEvent(toVergerEvent({ name: 'onPowerSaver', payload }, now())),
        ),
        native.addListener('onThreadLoad', (payload) =>
          onEvent(toVergerEvent({ name: 'onThreadLoad', payload }, now())),
        ),
        native.addListener('onMemory', (payload) =>
          onEvent(toVergerEvent({ name: 'onMemory', payload }, now())),
        ),
        native.addListener('onNetwork', (payload) =>
          onEvent(toVergerEvent({ name: 'onNetwork', payload }, now())),
        ),
        native.addListener('onBattery', (payload) =>
          onEvent(toVergerEvent({ name: 'onBattery', payload }, now())),
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
