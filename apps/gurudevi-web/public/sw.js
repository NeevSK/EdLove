// Standard Workbox Service Worker via CDN importScripts
// Using importScripts is required for service workers — bare ESM imports are not supported in SW context

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { skipWaiting, clientsClaim } = workbox.core;
const { precacheAndRoute } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

// Standard Workbox Service Worker
// Uses CDN fallback if not bundled

skipWaiting();
clientsClaim();

// Cache Google Fonts
registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts',
  })
);

// Cache Images
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// API caching (Supabase/Internal) — StaleWhileRevalidate for fast feedback
registerRoute(
  ({url}) => url.pathname.startsWith('/api/v1'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Default behavior for SPA/Astro navigation
registerRoute(
  ({request}) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'pages',
  })
);
