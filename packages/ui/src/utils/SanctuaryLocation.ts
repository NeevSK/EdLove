import * as Location from 'expo-location';

/**
 * SanctuaryLocation (Native)
 * Wraps expo-location for cross-platform safety.
 */
export const SanctuaryLocation = {
    requestPermissionsAsync: async () => {
        return await Location.requestForegroundPermissionsAsync();
    },
    watchPositionAsync: async (options: any, callback: any) => {
        return await Location.watchPositionAsync(options, callback);
    },
    Accuracy: Location.Accuracy,
};

export type LocationSubscription = Location.LocationSubscription;
export type LocationObject = Location.LocationObject;
