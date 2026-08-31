---
title: "Web runtime shim and watcher baseline"
status: "active"
created: 2026-09-01
---

# Web runtime shim and watcher baseline

## Decision

Expo Router + Expo Metro remains the supported web delivery path for this app. React Native Web is a compatibility layer, not a reason to accept fake feature implementations. Web behavior must be deliberate at each native boundary: use the package's real web implementation when it exists and passes the route harness; otherwise use a browser adapter or render an explicit unavailable state.

The following core libraries must resolve to their real web runtimes and are no longer Metro-shimmed:

- `react-native-gesture-handler` 3.2.1
- `react-native-reanimated` 4.6.0
- `react-native-worklets` 0.12.1
- `react-native-screens`

This matters for the welcome route: the old Gesture Handler shim rendered `GestureDetector` as children only, and the Reanimated/Worklets shims removed the actual runtime. That made pointer, gesture and motion failures look like screen-CSS bugs.

## Active shim contract

| Group | Packages | Current behavior | Required disposition |
| --- | --- | --- | --- |
| Browser-standard guards | `react-native-get-random-values`, `react-native-url-polyfill/auto` | No-op because browsers supply `crypto` and `URL`; prevents incompatible module loading. | Keep, and verify browser APIs before relying on them. |
| Telemetry/payment bridges | Sentry, PostHog, Stripe RN | Redirected to app-owned web adapters. | Keep only if the adapter uses the browser SDK/API and preserves error reporting, consent and checkout behavior. |
| Native-only recognition/graphics | ML Kit text/barcode, WGPU, native MapLibre, custom geo/postal packages | No meaningful browser implementation. | Keep a narrow adapter, but surface capability-unavailable UI; do not return fake successful results. |
| Files and local database | File System, Sharing, SQLite | File and SQLite shims currently return empty/no-op results. | Decide feature by feature: browser file APIs/download/share where appropriate; otherwise an explicit unavailable state. Do not silently pretend persistence succeeded. |
| Media/input | Camera, Image Picker, Audio, Video, Image Manipulator | Camera draws a placeholder; image picker returns cancelled; audio/video are effectively unavailable. | Replace with tested web APIs/official package web entry points, or hide the feature behind an explicit capability decision. |
| Location | Expo Location | Uses `navigator.geolocation`. | Keep as a browser adapter; test permission denied, insecure origin, timeout and unsupported-browser states. |
| Security and persistence | Secure Store, MMKV, Nitro Modules | Secure Store falls back to `localStorage`; MMKV is an in-memory map; Nitro is unavailable. | Define one web persistence/auth-storage policy. In-memory MMKV must never be treated as durable storage; localStorage must never be described as secure storage. |
| Presentation assets | SVG, Lucide RN, Skia | SVG/Lucide are redirected; Skia is a placeholder/no-op. | Trace welcome and shared primitives first. Restore real web implementations only with an import-resolution/browser harness; use web-specific component adapters where necessary. |

### Non-negotiable boundary rules

1. A shim may prevent an unsupported native module from crashing web, but it must not turn a user action into silent success, a false cancellation, or an invisible control.
2. Do not re-add no-op shims for Gesture Handler, Reanimated, Worklets or Screens. Their supported web runtimes are required for interaction parity.
3. Prefer a `*.web.tsx` adapter for a genuine platform difference over a global Metro alias. A global alias changes every dependency's behavior and is hard to reason about.
4. Remove one shim only after the welcome/browser harness proves its imports, pointer input, scrolling and error state. Do not remove the entire firewall at once.

## Version compatibility baseline

- RNGH 3.2.1 supports React Native 0.86, so no replacement is warranted.
- Reanimated 4.6.0 supports React Native 0.86 and requires Worklets 0.12.x. The workspace override is therefore pinned to 0.12.1; Worklets must not be upgraded independently.
- React Native Screens belongs in the real runtime graph. It should be verified on the focused web route instead of being globally mocked.

## Watcher baseline

Watchman is installed and watching `C:/x` with the Windows watcher. Metro has `watchman = true` and explicitly watches `packages/`, which is the required monorepo source boundary for `@repo/ui` fast refresh.

`.watchmanconfig` now ignores `.tmp` in addition to generated folders. Build/export output must be written outside the workspace or to an already-ignored output directory; output below `apps/gurudevi-mobile/.tmp` previously generated a large event stream that competes with source change events.

Known startup cost, separate from file watching: Metro dynamically scans the pnpm virtual store to construct fallback mappings. This increases server-start time; it does not prove that Watchman is failing. Do not clear caches or delete watches while a developer server is active.

## Manual web validation (owner: developer running web)

1. Start web with the normal Doppler-backed command and open `/welcome`.
2. Confirm mouse/touch click, keyboard focus/activation, wheel/trackpad scroll, resize breakpoints, and an animation/press state.
3. Change a clearly visible value in `packages/ui/src/screens/WelcomeScreen.web.tsx`. The page should fast-refresh without manually rebuilding the app.
4. If it does not, capture the Metro console and run `watchman watch-project C:\\x` plus `watchman watch-list`; do not clear watches first.
5. Report the route URL, browser, exact failed interaction, Metro output, and whether the source edit was detected. That is enough evidence to fix the next boundary without broad cache resets.

## Next implementation order

1. Use the welcome route as the browser harness and remove/fix only the shim reached by that route.
2. Establish `@repo/ui` provider-neutral primitives and keep `PortalProvider` explicit at the app root.
3. Apply the same harness to onboarding and authentication before converting feature screens.

