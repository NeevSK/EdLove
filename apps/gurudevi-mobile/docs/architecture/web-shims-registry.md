---
title: "Web Shims Registry"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Web Shims Registry

This registry tracks the native-only modules that are shimmed for the web build of the Gurudevi Mobile app. Shimming happens in `metro.config.js` via the `resolveRequest` hook.

## Why Shim?
- **Avoid Build Errors**: Some packages use native APIs or JSI modules that crash the Metro web bundler.
- **Maintain Common Logic**: Allows us to use shared packages (e.g., `@repo/core`, `@repo/ai`) without having to wrap every native import in a platform check.
- **Controlled Degradation**: Provides a safe "no-op" or "web-native" implementation for features that aren't critical for the web experience or should be implemented differently.

## Registry

| Native Module | Shim Path | Purpose / Implementation |
| :--- | :--- | :--- |
| `@sentry/react-native` | `src/shims/sentry-web.js` | No-ops for initialisation and error capture. |
| `posthog-react-native` | `src/shims/posthog-web.js` | No-ops for analytics tracking. |
| `expo-sqlite` | `src/shims/expo-sqlite-web.js` | Basic SQLite shim (WASM fallback should be preferred for high-fidelity). |
| `expo-file-system` | `src/shims/expo-file-system-web.js` | Redirects to standard `fetch` or `localStorage` logic where applicable. |
| `expo-secure-store` | `src/shims/expo-secure-store-web.js` | Fallback to `localStorage` (Warning: Not secure on web). |
| `react-native-mmkv` | `src/shims/mmkv-web.js` | High-performance storage shim using `localStorage`. |
| `@shopify/react-native-skia` | `src/shims/skia-web.js` | No-op or alternative SVG-based rendering where simple. |
| `expo-av` / `expo-video` | `src/shims/expo-*-web.js` | Fallback to standard `<video>` and `<audio>` tags. |

## Adding a New Shim
1. Create the shim file in `src/shims/[package-name]-web.js`.
2. Implement the minimal subset of the API used by the app.
3. Add the mapping to `WEB_SHIMS` in `apps/gurudevi-mobile/metro.config.js`.
4. Add the module to this registry.
5. Run `node scripts/check-native-leaks.mjs` to ensure total purity.
