/**
 * SanctuaryLocation (Web)
 * 
 * High-fidelity web-native implementation for location services.
 * Uses the native Permissions API and Geolocation API.
 * Avoids importing expo-location to prevent packaging errors.
 */

export const SanctuaryLocation = {
    requestPermissionsAsync: async () => {
        if (!navigator.permissions) {
            return { status: 'granted' as const }; // Fallback for older browsers
        }

        try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            return { status: (status.state === 'granted' ? 'granted' : 'denied') as 'granted' | 'denied' };
        } catch (e) {
            return { status: 'denied' as const };
        }
    },
    watchPositionAsync: async (options: any, callback: any) => {
        if (!navigator.geolocation) return { remove: () => { } };

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                callback({
                    coords: {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        altitude: pos.coords.altitude,
                        accuracy: pos.coords.accuracy,
                        altitudeAccuracy: null,
                        heading: pos.coords.heading,
                        speed: pos.coords.speed,
                    },
                    timestamp: pos.timestamp,
                });
            },
            (err) => console.warn('Geolocation error:', err),
            {
                enableHighAccuracy: options.accuracy >= 3,
                timeout: options.timeInterval || 5000,
                maximumAge: 0
            }
        );

        return {
            remove: () => navigator.geolocation.clearWatch(watchId)
        };
    },
    Accuracy: {
        Lowest: 1,
        Low: 2,
        Balanced: 3,
        High: 4,
        Highest: 5,
        BestForNavigation: 6,
    },
};

export type LocationSubscription = {
    remove: () => void;
};

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
