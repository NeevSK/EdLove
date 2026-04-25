import { coreRuntime } from '@repo/core/logic';

/**
 * SanctuaryLocation (Native)
 * Wraps coreRuntime.location for cross-platform safety.
 */
export const SanctuaryLocation = {
  requestPermissionsAsync: async () => {
    return await coreRuntime.location.requestPermissionsAsync();
  },
  watchPositionAsync: async (options: any, callback: any) => {
    return await coreRuntime.location.watchPositionAsync(options, callback);
  },
  Accuracy: coreRuntime.location.Accuracy,
};

// Types can be locally defined or shared in @repo/core/types if needed
// For now, we'll use 'any' or basic interfaces if we don't want to export them from Location.
export type LocationSubscription = { remove: () => void };
export type LocationObject = any;
