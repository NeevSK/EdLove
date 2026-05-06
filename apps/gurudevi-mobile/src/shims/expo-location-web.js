/**
 * Web shim for expo-location
 */
export const Accuracy = {
	Lowest: 1,
	Low: 2,
	Balanced: 3,
	High: 4,
	Highest: 5,
	BestForNavigation: 6,
};

export async function requestForegroundPermissionsAsync() {
	if (typeof navigator !== "undefined" && navigator.permissions) {
		try {
			const status = await navigator.permissions.query({ name: "geolocation" });
			return {
				status: status.state === "granted" ? "granted" : "undetermined",
			};
		} catch (_e) {
			return { status: "denied" };
		}
	}
	return { status: "granted" };
}

export async function watchPositionAsync(options, callback) {
	if (typeof navigator !== "undefined" && navigator.geolocation) {
		const id = navigator.geolocation.watchPosition(
			(pos) =>
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
				}),
			(err) => console.warn("Geolocation error:", err),
			{ enableHighAccuracy: options.accuracy >= 3 },
		);
		return { remove: () => navigator.geolocation.clearWatch(id) };
	}
	return { remove: () => {} };
}

export default {
	Accuracy,
	requestForegroundPermissionsAsync,
	watchPositionAsync,
};
