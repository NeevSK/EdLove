import type { NetworkQuality, RealityState } from './types';

export interface RealitySignalReaders {
  readDevice: () => Promise<{ tier: RealityState['deviceTier']; memoryGB: number }>;
  readNetwork: () => Promise<NetworkQuality>;
  readPower?: () => Promise<{ lowPowerMode: boolean } | null>;
}

export interface RealitySignalResult {
  reality: RealityState;
  failureCount: number;
}

export async function collectRealitySignals(
  previous: RealityState,
  isReducedMotionEnabled: boolean,
  readers: RealitySignalReaders,
): Promise<RealitySignalResult> {
  const results = await Promise.allSettled([
    Promise.resolve().then(readers.readDevice),
    Promise.resolve().then(readers.readNetwork),
    Promise.resolve().then(() => readers.readPower?.() ?? { lowPowerMode: false }),
  ]);

  const device = results[0];
  const network = results[1];
  const power = results[2];
  const reality: RealityState = {
    ...previous,
    ...(device.status === 'fulfilled'
      ? { deviceTier: device.value.tier, totalMemoryGB: device.value.memoryGB }
      : {}),
    ...(network.status === 'fulfilled'
      ? {
          networkQuality: network.value,
          isDataSaverMode: network.value === 'poor' || network.value === 'offline',
        }
      : {}),
    ...(power.status === 'fulfilled' && power.value !== null
      ? { isBatterySaverMode: power.value.lowPowerMode }
      : {}),
    isReducedMotionEnabled,
  };

  return {
    reality,
    failureCount: results.filter((result) => result.status === 'rejected').length,
  };
}
