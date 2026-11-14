import { requireOptionalNativeModule } from 'expo-modules-core';
import type { EventSubscription } from 'expo-modules-core';

export type NativePressure = 'unknown' | 'normal' | 'constrained' | 'severe';

export interface RuntimePressureSnapshot {
  memory: NativePressure;
  thermal: NativePressure;
}

interface RuntimePressureNativeModule {
  getSnapshotAsync: () => Promise<RuntimePressureSnapshot>;
  addListener: (
    eventName: 'pressureChanged',
    listener: (snapshot: RuntimePressureSnapshot) => void,
  ) => EventSubscription;
}

const nativeModule = requireOptionalNativeModule<RuntimePressureNativeModule>('GurudeviRuntimePressure');

export const runtimePressure = nativeModule
  ? {
      getSnapshotAsync: () => nativeModule.getSnapshotAsync(),
      addListener: (listener: (snapshot: RuntimePressureSnapshot) => void) =>
        nativeModule.addListener('pressureChanged', listener),
    }
  : null;
