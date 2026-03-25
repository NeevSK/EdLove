/**
 * Gurudevi Service Worker
 *
 * Strategy:
 *  - App shell (HTML/JS/CSS): Cache-first with network revalidation
 *  - API calls (Supabase): Network-first, fall back to cache
 *  - Fonts: Cache-first (long TTL)
 *  - Images: Cache-first
 *
 * This file is intentionally minimal — Expo handles the heavy lifting.
 */

const CACHE_VERSION = 'gurudevi-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_ASSETS))
  );
  // Activate immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('gurudevi-') && k !== SHELL_CACHE && k !== FONT_CACHE && k !== IMAGE_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept Supabase API or non-GET requests
  if (request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('supabase.io')) return;

  // Fonts: cache-first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(FONT_CACHE, request));
    return;
  }

  // Images: cache-first
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(IMAGE_CACHE, request));
    return;
  }

  // Navigation (HTML pages): network-first, fall back to shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // JS/CSS bundles: cache-first with background revalidation (stale-while-revalidate)
  if (url.pathname.startsWith('/_expo/') || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(SHELL_CACHE, request));
    return;
  }
});

// ── STRATEGIES ────────────────────────────────────────────────────────────────

async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);

  // Only cache successful http/https requests
  const url = new URL(request.url);
  if (response.ok && (url.protocol === 'http:' || url.protocol === 'https:')) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then(response => {
      const url = new URL(request.url);
      if (response.ok && (url.protocol === 'http:' || url.protocol === 'https:')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      // Silently handle network errors during development/initial load
      console.warn('[SW] Network fetch failed, using cache:', request.url, error);
      return null;
    });
  return cached || networkFetch;
}
