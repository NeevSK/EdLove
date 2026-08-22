# Gurudevi splash animation contract

This directory is the design source for the Gurudevi startup animation. It is
not automatically consumed by Expo or React Native. A concept becomes part of
the mobile app only after its JSON is deliberately copied into the mobile
assets and the route/native handoff is verified on a device.

## What exists

| Concept | Source | Duration | Current mobile status |
|---|---|---:|---|
| Sunrise | `01_sunrise.json` | 5.17 s | Not wired |
| Two Paths Crossing | `02_crossing_paths.json` | 10.73 s | Not wired |
| Ink Bloom | `03_ink_bloom.json` | 4.67 s | Not wired |
| Line Draw | `04_line_draw.json` | 7.33 s | **Officially selected**; copied to `apps/gurudevi-mobile/assets/splash-animation.json` |
| Breath | `05_breath.json` | 4.65 s | Not wired |
| Splash Bloom | `gurudevi-splash.json` | 5.17 s | Not wired |

The HTML previews are design review tools, not runtime entry points. The
current mobile JSON is byte-for-byte identical to `04_line_draw.json`. Line
Draw is now the official Gurudevi mobile splash selection.

## Startup layers

Mobile startup has three separate visual layers:

1. Android's native splash, configured by the `expo-splash-screen` plugin in
   `apps/gurudevi-mobile/app.json`. It can show a static image only. It now
   uses `splash-poster-line-draw-transparent.png`, a static poster derived from
   the selected Line Draw artwork, on the matching dark-brown opening
   background.
2. The JavaScript splash route, `apps/gurudevi-mobile/app/index.tsx`, which
   renders `splash-animation.json` with `LottieSplashScreen`.
3. The actual welcome route, `apps/gurudevi-mobile/app/welcome.tsx`.

The native splash cannot be made to show one of these Lottie animations by
changing `index.tsx`. The approved native poster/static artwork and the
approved Lottie concept must be selected explicitly and kept visually
consistent.

## Acceptance contract

A release APK passes startup only when a cold launch shows:

`approved native splash` → `approved finite animation` → `/welcome`

The app must not remain on `/`, an infinite Lottie loop, `BrandPulse`, or the
native splash surface after the animation duration plus a small handoff margin.
Tests must record the installed APK version, focused Android window, route
state, screenshot, and fatal logcat output.

## Current issue

The target/grid placeholder is no longer used by the native mobile splash.
Future splash changes must update the selected JSON, its static native poster,
the app route timing, and the release-device acceptance record together.
