import { coreRuntime } from '@repo/core/logic';

export enum PerformanceTier {
  HIGH = 'HIGH',
  MID = 'MID',
  LOW = 'LOW',
}

/**
 * Heuristic to determine device performance tier
 * This can be refined with specific device model checks
 */
export const getDeviceTier = (): PerformanceTier => {
  try {
    const metadata = coreRuntime.device.getMetadata();
    const { platform, osVersion, modelName } = metadata;

    // 1. Web is generally treated as HIGH or MID depending on modern browser features
    // but for simplicity in this isomorphic layer, we default to MID or HIGH.
    if (platform === 'web') return PerformanceTier.HIGH;

    // 2. iOS Devices
    if (platform === 'ios') {
      // iPhone 11 (iPhone12,1) or newer is High
      if (modelName && modelName.startsWith('iPhone')) {
        const versionMatch = modelName.match(/iPhone(\d+)/);
        if (versionMatch) {
          const version = parseInt(versionMatch[1], 10);
          if (version >= 12) return PerformanceTier.HIGH; // iPhone 11+
          if (version >= 10) return PerformanceTier.MID; // iPhone 8/X/XS
          return PerformanceTier.LOW;
        }
      }
      return PerformanceTier.HIGH; // Default for newer iPads/unknown
    }

    // 3. Android Devices
    if (platform === 'android') {
      // On Android, we'd ideally check RAM, but since we've abstracted to Metadata,
      // we'll use a conservative MID fallback or deeper model check if needed.
      return PerformanceTier.MID;
    }
  } catch {
    // Fail safe
  }

  return PerformanceTier.MID;
};

export const DEVICE_TIER = getDeviceTier();
export const IS_LOW_POWER_MODE = DEVICE_TIER === PerformanceTier.LOW;
