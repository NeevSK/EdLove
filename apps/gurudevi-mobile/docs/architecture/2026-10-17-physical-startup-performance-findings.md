---
title: "Physical Startup Performance Findings and Profiling Path"
status: "active"
created: 2026-10-17
updated: 2026-10-17
author: "Codex"
tags: [mobile, expo-58, react-native-0.88, startup, performance, device-evidence]
---

# Physical Startup Performance Findings and Profiling Path

## Scope

This record covers the Android path from process launch through Welcome, guest onboarding abandonment, and the sign-in surface. It separates physical device facts from development-client tooling behaviour and from unverified release assumptions.

## Verified findings

### G5 physical device evidence — Samsung SM-A525F

- The development-client package `app.gurudevi.sanctuary.dev` reached the actual Welcome surface. Accessibility inspection found `Welcome to Gurudevi`, `Explore as Guest`, and `I have an account. Log In`.
- Android reported one cold native Activity start at `3.64 s`. This is **not** time-to-Welcome: the JavaScript bundle and route bootstrap continued after Android reported the Activity started.
- The tested abandonment flow succeeded: Welcome → `Explore as Guest` → initial onboarding name step → `Back to Welcome` returned to Welcome. This proves the visible route outcome only; it does not prove remote anonymous-session revocation because the backend was not independently inspected.
- The sign-in surface rendered email/password fields. It exposed a real copy/localisation defect: its submit button displayed `auth.signIn`, a missing translation key.
- The observed debug-client footprint was about `1.52 GB PSS`, including about `1.11 GB` native heap. This is a physical device reading, but it is **not a production-memory baseline**. The app was running in an Expo development client with developer tooling and a Metro bundle.
- `dumpsys gfxinfo` on that same debug session reported roughly `24 ms` median and `27 ms` 90th-percentile frame time. It is an accumulated development-session metric, not a controlled release-flow benchmark.

### Development tooling findings

- The clean development bundle endpoint returned approximately `49 MB` of Hermes bytecode. Cache-cleared development compilation is slow and must not be confused with on-device runtime startup.
- A stale `--no-dev --minify` Metro process occupied about `704 MB` host working set; a stale primary Metro process had reached about `1.27 GB`. These are host build-tool processes, not application PSS. After replacing the stale server, the fresh Metro process initially used about `225 MB` host working set.
- During the overloaded development session, deferred background-sync import failed with Metro `EMFILE: too many open files`. The foreground route still reached Welcome. This is a Windows/Metro file-handle failure in the development loop; it must not be reported as an Android production memory leak.
- The Samsung device blocks the automated profiling adapter because `adb shell pm list packages` attempts access to Android user `150`, which shell is not permitted to inspect. Direct ADB measurements remain available.

## Changes made in this pass

- Disabled verbose i18next resource-catalogue logging. In debug mode it serialised the full locale catalogue to Logcat during bootstrap without user value.
- Corrected the native AuthScreen submit copy to use existing `auth.login` and `auth.signup` locale keys, instead of missing `auth.signIn` / `auth.signUp` keys.
- Added `withProfileableBuild`, an opt-in Expo config plugin. When `GURUDEVI_PROFILEABLE_BUILD=true`, it adds Android `<profileable android:enabled="true" android:shell="true"/>`. This is only used by the new internal `performance` EAS profile; preview and production profiles remain unchanged.

## Release-like profiling status

The correct next artifact is the `performance` internal APK, not the development client. Android documents that native CPU, heap, and Perfetto profiling need a debuggable or shell-profileable build. Expo documents that performance testing must disable development mode.

The first plain EAS attempt failed before queueing because required public Supabase build values were absent from the EAS preview environment. The repository’s documented build path is `doppler run ... eas build`; the Doppler-wrapped retry then spent several minutes packaging the unusually large dirty workspace and still had not queued a remote build. That local upload was stopped deliberately rather than allowing duplicate or unbounded work.

No release-like PSS, CPU, frame, or authenticated-home timing claim exists yet.

## Next bounded sequence

1. Establish a reproducible EAS artifact boundary that includes required workspace packages but excludes non-runtime working-tree material; do not use broad ignore rules without verifying shared-package inclusion.
2. Run the existing Doppler-wrapped `performance` EAS profile and install its internal APK on the Samsung device.
3. Confirm the generated manifest contains the profileable element, then capture a controlled cold launch, Welcome, guest-abandonment, sign-in, and an authorized-home run with `dumpsys meminfo`, `gfxinfo`, and Perfetto/heapprofd.
4. Obtain or create an explicitly authorized non-anonymous test account before asserting the authenticated-home path.
5. Compare the release-like measurements before changing eager imports, navigation, or native dependencies. Expo Router SDK 58 native production async routes are still experimental/development-only, so they are not a safe production startup optimisation path.

## Sources consulted

- [Expo development and production modes](https://docs.expo.dev/workflow/development-mode/)
- [Expo SDK 58 Router reference](https://docs.expo.dev/versions/v58.0.0/sdk/router/)
- [Expo async routes caveats](https://docs.expo.dev/router/web/async-routes/)
- [Expo bundle analysis](https://docs.expo.dev/guides/analyzing-bundles/)
- [Android profileable manifest element](https://developer.android.com/guide/topics/manifest/profileable-element)
- [Android native-memory analysis](https://developer.android.com/topic/performance/memory/guide/native-memory)
