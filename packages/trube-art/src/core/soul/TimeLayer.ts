import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { driverManager } from '../../native/DriverManager';

/**
 * Surface-aware refresh rates (Plan constraint)
 * Not every surface needs 60FPS.
 */
export const SURFACE_REFRESH_RATES = {
  aurora: 5, // Every 5f
  mist: 4, // Every 4f
  'evening-sky': 7, // Every 7f
  'young-leaf': 3, // Every 3f
  silk: 2, // Every 2f
  'water-surface': 1, // Every frame
  waterfall: 1, // Every frame
  skymorphic: 6, // Every 6f
} as const;

export type SurfaceType = keyof typeof SURFACE_REFRESH_RATES;

/**
 * useTrubeTime  The core hook for the Time Layer.
 * Synchronizes with the C++ Entropy Clock (Single Source of Truth).
 */
export function useTrubeTime(surfaceType: SurfaceType, enabled: boolean = true) {
  const time = useSharedValue(0);
  const entropy = useSharedValue(Math.random());
  const frameCount = useSharedValue(0);
  const skipRate = SURFACE_REFRESH_RATES[surfaceType] || 1;

  useFrameCallback(() => {
    'worklet';
    if (!enabled) return;

    frameCount.value += 1;

    if (frameCount.value % skipRate === 0) {
      const driver = driverManager.getNativeDriver();

      if (driver && driver.isEngineReady()) {
        // TIER 1: Use the C++ Entropy Clock (Master Sync)
        time.value = driver.entropyTime;
        // In Tier 1, entropy is baked into the time signal or managed natively.
        // We set a nominal value or sync if native exposes it.
        entropy.value = 1.0;
      } else {
        // TIER 2/3 FALLBACK: Manual drift-prone calculation (legacy)
        // Note: This is only for non-Mandate compliant devices.
        const now = Date.now() / 1000;
        if (time.value === 0) time.value = now;
        time.value += 0.0166;
      }
    }
  });

  return { time, entropy };
}
