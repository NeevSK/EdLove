---
title: "Gurudevi real-device runtime validation log"
status: "active"
created: 2026-08-14
updated: 2026-08-14
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Gurudevi real-device runtime validation log

Date: 2026-08-14 (Asia/Colombo)

This is an operational record for future agents validating the UI redesign on a physical Android device. It deliberately records environment failures and timing rather than treating a timeout as a code failure.

## Required environment

- Workspace: `C:\Users\Naween\projects\polymath-platform`
- Supported Node: `22.23.2` at `C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2`
- Android JDK: Android Studio bundled JBR at `C:\Program Files\Android\Android Studio\jbr`
- ADB: `C:\Users\Naween\AppData\Local\Android\Sdk\platform-tools\adb.exe`
- Doppler project/config: `gurudevi-mobile` / `dev`
- Android application ID from `app.json`: `org.edlove.gurudevi`

Use the repository's supported runtime and real environment:

```powershell
$env:Path = 'C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2;' + $env:Path
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
doppler run --project gurudevi-mobile --config dev -- pnpm --filter gurudevi-mobile exec expo run:android
```

Do not use `expo install --fix`, `expo prebuild --clean`, or direct edits to `android/` and `ios/`.

## Observed sequence and timing

1. Initial device doctor: about 6 seconds. One Android device was available and booted. The default shell reported Node `24.11.0`, which is outside the workspace engine range.
2. Initial snapshot: about 7 seconds. Android's expanded notification/quick-settings shade covered the app. A coordinate tap dismissed it; a back action without a target was rejected by the device tool.
3. USB settings surfaced after dismissal. The accessibility snapshot exposed `@e18` (`Navigate up`); pressing that reference returned to the launcher. The device tool requires an `@ref`, selector, or coordinate—not an unqualified visible label.
4. `com.gurudevi` was not installed. The actual package ID is `org.edlove.gurudevi`, so `open_app` must use that ID after installation.
5. First Android run without `JAVA_HOME`: failed in about 8 seconds with `JAVA_HOME is not set`.
6. Android Studio JBR was found and selected. The first JBR build ran for more than 2 minutes without an APK; a second Doppler-backed run was allowed to run for 10 minutes. It reached Kotlin/Android compilation and emitted deprecation/codegen warnings, but no compile error and no APK before the command window expired. Java/Gradle workers remained active after the shell timeout, so inspect processes before starting another build.
7. Build warnings observed: deprecated React Native Screens and Stripe APIs, missing `sentry.options.json`, and repeated “No modules to process in combine-js-to-schema-cli.” None was reported as a build failure in the observed log tail.

## Web validation note

The web bootstrap issue was investigated further. The supported Node runtime plus Doppler now produces a complete static export, and the generated bundle contains the public runtime values (verified by host/key presence and length only; secret values were not printed). The fix is implemented in `babel.config.js` and `metro.config.js`; it uses a temporary ignored handoff for Metro workers and does not weaken the Supabase credential guard.

The browser matrix was then exercised at phone portrait, mobile landscape, compact tablet, and desktop sizes. After adding the missing community contract entries, there were no page errors, but the static page remained visually empty/black: only the skip link and decorative shell markup were present, with an empty React Native Web root. This is not visual validation. Future agents should investigate the web route/bootstrap render pipeline before claiming screenshots or interaction coverage.

Do not remove the credential guard or commit generated public runtime values. Native config and Doppler remain the source of truth.

## Native build blocker — exact result

After the device was connected and the Android Studio JBR was selected, a Doppler-backed native build was allowed to run for multiple bounded windows. A direct Gradle attempt ran for approximately 9 minutes 40 seconds and reached native compilation, then failed in `react-native-nitro-modules:buildCMakeDebug[arm64-v8a]`:

- CMake reported an object-directory path of approximately 231 characters against a 250-character limit.
- Ninja repeatedly reported that `build.ninja` remained dirty after 100 attempts.
- Mapping the workspace to a short drive letter did not fix it because pnpm's dependency path still resolved through the physical `C:\Users\Naween\...node_modules\.pnpm` store path.
- Several attempts to inject `CMAKE_OBJECT_PATH_MAX` through a config plugin/Gradle lifecycle hook were ineffective or caused Gradle lifecycle errors. The workaround was removed; the source plugin is clean and a non-clean prebuild regenerated Android successfully.

The durable next options are shortening the physical repository/dependency-store path or changing the pnpm dependency layout, followed by a fresh native build. Do not hand-edit generated `android/` files or reintroduce the ineffective plugin workaround.

An offline pnpm experiment on 2026-08-14 attempted `pnpm install --offline --frozen-lockfile --virtual-store-dir C:\\gd-pnpm-vs` (including a forced refresh). pnpm reported the workspace already up to date and retained the existing `node_modules/.pnpm` links, so this command did not change the physical dependency path and is not evidence of a fix. A future agent should use a deliberately relocated checkout/store or a verified pnpm reinstall procedure before retrying Gradle.

## Web blank-root diagnosis — 2026-08-14 follow-up

The blank browser root was not caused by the visual fallback or by Expo Router itself. Fiber inspection showed the router mounted, but the app tree stopped above it because `src/providers/PowerSyncProvider.web.tsx` returned `null` until the OPFS/WASQLite database initialized. Signed-out startup has no account and therefore cannot initialize that database, so the provider accidentally made the whole web application invisible.

The provider now keeps the route tree mounted while local sync is unavailable/initializing, and it is scoped to the authenticated tab layouts rather than the root shell on both native and web. PowerSync is a capability, not a root-render prerequisite; authenticated data surfaces must own their loading/offline states. The related Metro platform detection was also hardened for Expo's `-p web` invocation form. A fresh Doppler-backed static export succeeds and the mobile typecheck passes. Browser re-verification should use a fresh server/context after the export; prior screenshots must not be treated as visual evidence.

The first landscape composition follow-up is now code-level complete: Self uses a vertical feature rail beside the active content in native landscape, and short-height landscape hides tab labels while preserving icon navigation. This is not yet physical-device visual evidence; the Android APK build remains blocked by the documented CMake/Ninja path-length failure.

## Browser inspector follow-up — 2026-08-14

The runtime inspector itself had two reproducibility hazards: package-script forwarding can add a literal `--` before the URL, and the exported OPFS/WASQLite bundle may keep Chromium workers alive after the page snapshot. `scripts/inspect-web-runtime.mjs` now extracts the first HTTP URL, blocks service workers, uses bounded navigation/screenshot waits, and bounds browser cleanup. A probe that receives a connection-refused document is invalid evidence; only a `200` response with a non-empty `#root` and recorded diagnostics should be used for UI claims.

## Fresh export and inspector attempt — 2026-08-14

After the contrast and typography changes, `pnpm --filter gurudevi-mobile build:web` completed successfully in approximately 65 seconds and exported `apps/gurudevi-mobile/dist`. The static server returned HTTP 200. The bounded Playwright inspector was then allowed to run for 120 seconds but produced no snapshot before the command timeout; this is invalid visual evidence, not a pass. Targeted headless-browser cleanup was performed afterward without touching interactive Chrome processes.

## Post-install checklist

After Gradle produces an APK:

1. Confirm `apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk` exists.
2. Launch `org.edlove.gurudevi` through device control or ADB.
3. Capture accessibility snapshot and screenshot in portrait.
4. Exercise a modal and confirm dimming plus blur/fallback behavior, focus/close semantics, and toast placement.
5. Rotate to landscape and repeat the shell, header, typography, primary-content, modal, and toast checks.
6. Capture logs for runtime exceptions and record screenshots under a non-source output directory.
7. Update the integrated redesign plan with actual device evidence and exact build duration.

## Root overlay regression and browser-safe resolution — 2026-08-14

The next successful browser run mounted the route shell but exposed React error #130 when the root overlays were restored. Isolation showed:

- `Stack` and the shell providers rendered correctly.
- `FeatureProvider` needed a browser-safe shell while native permission stores hydrate; its native subscription remains unchanged.
- The failing visible overlay was the PDPA consent modal. The `Shield` export from the shared icon barrel is not a valid browser component in this bundle, and the web modal shell also depended on the primitive barrel path.
- Replacing the web modal internals with direct semantic DOM overlay elements preserved the required blurred backdrop and close behavior. The consent dialog then rendered successfully when open.

Final browser evidence after the isolated fix: HTTP 200, non-empty root, no React errors. Remaining diagnostics are expected capability warnings for push notifications, Google One-Tap, and the Playwright-blocked service worker. The native PDPA icon remains on native, while web uses a verified inline SVG because the shared native icon barrel is not browser-safe for this export.

The subsequent screenshot review found the dialog content anchored at the upper-left despite healthy DOM diagnostics. The web modal’s inner wrapper was missing `display: flex`; adding it restored centered composition at desktop width while retaining the blurred backdrop. The latest screenshot shows the centered consent dialog and no React runtime errors.
