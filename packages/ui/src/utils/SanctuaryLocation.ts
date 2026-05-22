import { coreRuntime } from '@repo/core/logic';

export type LocationPermissionResponse = {
  status: 'granted' | 'denied';
};

export type LocationWatchOptions = {
  accuracy?: number;
  timeInterval?: number;
};

/**
 * SanctuaryLocation (Native)
 * Wraps coreRuntime.location for cross-platform safety.
 */
export const SanctuaryLocation = {
  requestPermissionsAsync: async (): Promise<LocationPermissionResponse> => {
    try {
      const result = await coreRuntime.location.requestPermissionsAsync();
      return {
        status: result.status === 'granted' ? 'granted' : 'denied',
      };
    } catch {
      return { status: 'denied' } as LocationPermissionResponse;
    }
  },
  watchPositionAsync: async (
    options: LocationWatchOptions,
    callback: (location: LocationObject) => void,
  ) => {
    try {
      return await coreRuntime.location.watchPositionAsync(options, callback);
    } catch {
      return { remove: () => {} };
    }
  },
  get Accuracy() {
    try {
      return coreRuntime.location.Accuracy;
    } catch {
      return {
        Lowest: 1,
        Low: 2,
        Balanced: 3,
        High: 4,
        Highest: 5,
        BestForNavigation: 6,
      };
    }
  },
};

export type LocationSubscription = { remove: () => void };
export type LocationObject = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};
