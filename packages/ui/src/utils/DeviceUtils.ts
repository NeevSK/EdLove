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
let _deviceTierCached: PerformanceTier | null = null;

function getDeviceMetadata() {
  try {
    return coreRuntime.device.getMetadata();
  } catch {
    return null;
  }
}

/**
 * Heuristic to determine device performance tier.
 * Caches the result after the first successful lookup.
 */
export const getDeviceTier = (): PerformanceTier => {
  if (_deviceTierCached) return _deviceTierCached;

  try {
    const metadata = getDeviceMetadata();
    if (!metadata) {
      return PerformanceTier.MID;
    }

    const { platform, modelName } = metadata;

    let tier = PerformanceTier.MID;

    // 1. Web is generally treated as HIGH or MID depending on modern browser features
    if (platform === 'web') {
      tier = PerformanceTier.HIGH;
    }
    // 2. iOS Devices
    else if (platform === 'ios') {
      if (modelName?.startsWith('iPhone')) {
        const versionMatch = modelName.match(/iPhone(\d+)/);
        if (versionMatch?.[1]) {
          const version = parseInt(versionMatch[1], 10);
          if (version >= 12)
            tier = PerformanceTier.HIGH; // iPhone 11+
          else if (version >= 10)
            tier = PerformanceTier.MID; // iPhone 8/X/XS
          else tier = PerformanceTier.LOW;
        }
      } else {
        tier = PerformanceTier.HIGH; // Default for newer iPads/unknown
      }
    }
    // 3. Android Devices
    else if (platform === 'android') {
      tier = PerformanceTier.MID;
    }

    _deviceTierCached = tier;
    return tier;
  } catch {
    // Fail safe — do not cache so we can retry once registered
    return PerformanceTier.MID;
  }
};

export const DeviceUtils = {
  get tier(): PerformanceTier {
    return getDeviceTier();
  },
  get isLowPowerMode(): boolean {
    return getDeviceTier() === PerformanceTier.LOW;
  },
};
