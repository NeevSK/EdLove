// Standard Workbox Service Worker via CDN importScripts
// Using importScripts is required for service workers  bare ESM imports are not supported in SW context

try {
	importScripts(
		"https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js",
	);
} catch (e) {
	// If the CDN request fails (offline/CSP/CDN outage), Workbox will not be available.
	// The service worker should still install; we'll guard all Workbox usage below.
	// eslint-disable-next-line no-console
	console.warn("Workbox CDN import failed in service worker:", e);
}

if (typeof workbox !== "undefined" && workbox && workbox.core) {
	const { skipWaiting, clientsClaim } = workbox.core;
	const { registerRoute } = workbox.routing;
	const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
	const { ExpirationPlugin } = workbox.expiration;

	// Standard Workbox Service Worker
	// Uses CDN fallback if not bundled

	skipWaiting();
	clientsClaim();

	// Cache Google Fonts
	registerRoute(
		({ url }) =>
			url.origin === "https://fonts.googleapis.com" ||
			url.origin === "https://fonts.gstatic.com",
		new StaleWhileRevalidate({
			cacheName: "google-fonts",
		}),
	);

	// Cache Images
	registerRoute(
		({ request }) => request.destination === "image",
		new CacheFirst({
			cacheName: "images",
			plugins: [
				new ExpirationPlugin({
					maxEntries: 60,
					maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
				}),
			],
		}),
	);

	// API caching (Supabase/Internal)  StaleWhileRevalidate for fast feedback
	registerRoute(
		({ url }) => url.pathname.startsWith("/api/v1"),
		new StaleWhileRevalidate({
			cacheName: "api-cache",
		}),
	);

	// Default behavior for SPA/Astro navigation
	registerRoute(
		({ request }) => request.mode === "navigate",
		new StaleWhileRevalidate({
			cacheName: "pages",
		}),
	);
} else {
	// Workbox failed to load; service worker will install without Workbox-powered caching.
	// eslint-disable-next-line no-console
	console.warn(
		"Workbox is not available in the service worker; skipping Workbox routing configuration.",
	);
}
