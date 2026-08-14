---
title: "Expo Web Doppler Runtime Troubleshooting"
status: "active"
created: 2026-08-14
updated: 2026-08-14
author: "Codex"
tags: [expo, web, doppler, metro, runtime, troubleshooting]
---

# Expo Web Doppler Runtime Troubleshooting

## Symptom

`doppler run --no-fallback -- pnpm exec expo config --json` resolved both public
Supabase values. The exported web bundle nevertheless embedded
`extra.publicRuntime` as `{}`, so `packages/core/src/adapters/supabaseClient.ts`
correctly stopped at its missing-credentials guard.

## Diagnosis

The failure was at the Expo Web transform boundary, not in Doppler or the
Supabase adapter:

1. The dynamic app config returned both values. A names-and-lengths check showed
   both keys present without printing their contents.
2. A static export reproduced the issue. The generated `APP_MANIFEST` string had
   `publicRuntime:{}` and the bundle contained the missing-credentials throw.
3. Expo SDK 57's `babel-preset-expo` uses `expo-inline-manifest-plugin` and
   `inline-env-vars` inside Metro transform workers. On this Windows + pnpm
   setup, those workers did not inherit the Doppler-injected public variables,
   even though the parent Expo config process had them.
4. Setting `APP_MANIFEST` or restoring the variables only in `metro.config.js`
   was insufficient because the worker boundary still lost them.

## Fix

`apps/gurudevi-mobile/metro.config.js` now resolves the public Expo config,
fails immediately if either public value is missing, and writes a short-lived
`.expo/gurudevi-public-runtime.json` handoff file. The file is ignored by the
repository, is removed before a new Metro setup, and is removed on process
exit.

`apps/gurudevi-mobile/babel.config.js` reads that handoff only when the normal
environment variables are absent. This allows Expo's own Babel plugins to
inline the public manifest and direct `EXPO_PUBLIC_*` references. No private
service credential is read or committed, and the Supabase runtime guard was not
weakened.

## Reproduction and validation

Use the supported Node 22 runtime; the workspace currently requires Node
`>=22.23.0 <23`.

```powershell
$env:Path = 'C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2;' + $env:Path

# Config contract: inspect only presence/lengths; never print values.
doppler run --no-fallback -- pnpm exec expo config --json

# Web export; allow the first run to warm Metro caches.
doppler run --no-fallback -- pnpm exec expo export -p web `
  --output-dir 'C:/absolute/path/to/output/gurudevi-web' --no-minify
```

Observed timings on 2026-08-14 (Windows, this workspace):

| Action | Result | Observed time |
| --- | --- | ---: |
| `expo config --json` through Doppler | public keys present | ~8.5 s |
| failing static export reproduction | exit 0, manifest empty | ~80 s |
| fixed export after Metro/Babel handoff | exit 0, manifest and inlined values present | ~89 s |

The final bundle check must report presence and lengths only. It must not print
the URL or publishable key. Confirm `.expo/gurudevi-public-runtime.json` is
absent after the export process exits.

## Android device runbook

For a connected Android device, first verify the device and then run the
development build through Doppler:

```powershell
adb devices
$env:Path = 'C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2;' + $env:Path
doppler run --no-fallback -- pnpm --filter gurudevi-mobile exec expo run:android
```

This may take 20–30 minutes on a cold Gradle cache. Record separately:

- Node version and Doppler project/config used (names only).
- Device model, Android version, and `adb devices` state.
- Build start/end time and whether Gradle was cold or warm.
- Metro URL/connection mode and the first runtime screen observed.
- Any native build or runtime error, without copying credentials or tokens.

Observed device attempts on 2026-08-14:

| Attempt | Result | Duration |
| --- | --- | ---: |
| `expo run:android` with Node 22 but no `JAVA_HOME` | Failed before Gradle; Java was not found | ~7 s |
| `expo run:android` with `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr` | Device stayed online; native compilation reached `:app:dexBuilderDebug`, but the host runner terminated with exit `4294967295` and no APK was produced | ~9m21s |
| Direct cached Gradle retry with plain output | Exited `-1` after ~13 s; daemon log did not contain a build failure, while prior daemon logs identify `react-native-nitro-modules` Ninja/CMake `build.ninja` dirty/process-management failures | ~13 s |

The Android build therefore remains an environment/native-tooling gate rather
than a verified device runtime result. The device used was Samsung SM-A525F
(serial `R58T33Y0E3M`), and it remained `device` in `adb devices -l` after both
attempts. No APK was installed or launched. The useful diagnostic is in the
Gradle daemon log under `%USERPROFILE%\.gradle\daemon\9.3.1`; do not delete native
build state or run a clean prebuild without explicit approval.

Do not run `expo prebuild --clean`, edit `android/` or `ios/` directly, or
commit generated native directories. Native configuration belongs in
`app.json` or config plugins.

## Remaining environment-dependent checks

The static export proves the build-time handoff. A physical Android runtime
smoke test remains blocked until the Ninja/CMake native build completes and
produces an APK; the device connection itself is healthy.
