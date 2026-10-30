---
title: "Verger Android module"
status: active
created: 2026-10-21
updated: 2026-10-29
author: Naveen
scribe: Codex
tags: [verger, android, expo-modules-v2]
---

# @repo/verger-android

Verger's Android half: sensing and the app-wide hardware levers, as an Expo module. It measures
and actuates; every decision is made by `@repo/verger-core` in JavaScript. It knows no host app.

| Layer | File | Role |
| --- | --- | --- |
| Estimator | `FrameWindowEstimator.kt` | Allocation-free windowing and classification of frames, held to the golden vectors of `packages/verger-core/src/frames.ts`. |
| CPU attribution | `ThreadCpuSampler.kt` | Per-thread CPU from procfs: main, JS, native modules, render, GC, image. |
| Display | `DisplayModes.kt` | Chooses the display mode for a refresh cap without changing resolution. |
| Mappings | `Signals.kt` | Trim levels, thermal status, headroom validity and poll pacing. |
| Sensor set | `Sensors.kt` | Which sensors run, from verger's activation; parsed on the calling thread. |
| Network | `NetworkSignals.kt` | Transport, validation, metering, bucketed bandwidth and Data Saver to payloads; held to `contract/native-events.json`. |
| Levers | `HardwareLevers.kt` | Refresh cap (preferred display mode) and the ADPF hint session; released on stop, destroy and reload. |
| Sensors | `VergerSense.kt` | FrameMetrics stages, thermal, memory, battery saver, thread load; one thread; only changes cross; a sensor switched off registers nothing. |
| Binding | `VergerModule.kt` | Expo Modules 2.0 Android: nine synchronous methods and eleven explicitly named events, preserving the existing JS API. |
| JS | `index.ts`, `src/mapping.ts` | `createVergerAndroidPort()`: a `RuntimePort` for verger-core. |

A host app adds this package as a dependency; Expo autolinking finds `expo-module.config.json`.
The module declares `ACCESS_NETWORK_STATE` (install-time, no prompt) for network sensing.

## The native event contract

`contract/native-events.json` holds what crosses to JavaScript. Kotlin (`NetworkContractTest.kt`,
system property `verger.contract`) builds each payload from its inputs; TypeScript
(`mapping.test.ts`) maps each payload to its event. A change on one side that the other does not
share fails one of them.

## Parity

The Kotlin estimator is tested against the golden vectors the TypeScript reference produces
(`packages/verger-core/src/__fixtures__`). Regenerate them with `pnpm --filter @repo/verger-core golden`,
then run both suites. In a prebuilt Android project: `./gradlew :repo_verger-android:testDebugUnitTest`
(the Gradle project name follows the autolinked package name; confirm it in `settings.gradle`).

Without an Android project or SDK: `pnpm verger:android-jvm` compiles every file but the Expo
binding against the real `android.jar` (API 35) and runs the JUnit suite on the desktop JVM.

## Binding on Expo Modules API 2.0 (2026-10-27, merged 2026-10-29)

**Naming.** Verger has no "v2". Only this package's Expo binding was rewritten, against Expo's
Modules API 2.0 (annotations and the v2 compiler) instead of the DSL. Verger's behaviour, its
JS API and its decisions are unchanged by the rewrite; Verger's own generations are its policies
(`verger-p4`, `verger-p5`). Names such as `verger-android-v2` or `verger-v2-*` on branches,
backup refs and logs refer to this binding rewrite only.

The rewrite is the binding in this checkout since 2026-10-29. The DSL binding it replaced is
preserved at `refs/codex-backups/verger-v2-before-20261027`; the two are never registered
together. Release use still waits on a rebuilt client and device acceptance in this checkout.

The binding opts into the SDK's v2 Gradle plugin. Annotation/compiler discovery replaces the legacy `android.modules` entry. All eleven event names are explicit because v2 otherwise strips the `on` prefix. Nine methods keep their synchronous signatures, including nullable refresh-cap release. Map payloads and the shared JSON contract remain unchanged. Invalid start configuration is rejected before sensor creation.

The sensor's queued teardown uses a live activity accessor from the captured React application context, so ExpoContext closure does not disable activity lookup while cleanup is queued. No Activity is held long-term. Sampling, native signal collectors, policy, thresholds, native precedence and JS fallbacks are unchanged.

G0/native compilation: both the DSL baseline and v2 candidate compile against real expo-modules-core 58.0.24, Android compileSdk 37/minSdk 28 and Kotlin 2.2.10. The candidate packages as an Android AAR. G1/G2 JVM: baseline 42/42 and candidate 48/48 cases, including generated exports, method arity/synchronous behavior, exact event names, compiler discovery, map conversion and lazy/unused teardown. These tests do not execute the live Android/JS sensor path or establish reload safety on a device.

See [the migration evidence and acceptance record](../../docs/engineering/runtime-performance/verger/2026-10-27-android-modules-v2-implementation.md) for reproducible verification, source identity, limitations and remaining gates. Historical evidence below is retained as history.

## Evidence (2026-10-25)

- Every Kotlin file but `VergerModule.kt` compiles against `android.jar` 35 with Kotlin 2.1.20,
  including `VergerSense.kt` with the switchable sensors, network, battery and the lifecycle adapter (G0).
- 34 JUnit tests on the desktop JVM, among them `PresenceTest` (G2).
- Foreground and background now come from `Application.ActivityLifecycleCallbacks` inside
  `VergerSense` (`Presence.kt`), not Expo's `OnActivityEnters*` hooks: the binding uses nothing
  Expo Modules 2.0 is not known to offer.
- `VergerModule.kt` is still uncompiled (it needs expo-modules-core). The first Gradle build must
  compile it; nothing here has run on a device.

## Evidence (2026-10-24)

- Android-free Kotlin (estimator, sampler, exits, display modes, sensor set): 25 JUnit tests on the desktop JVM with Kotlin 2.1.20 (G2).
- `VergerSense.kt` and `VergerModule.kt` changed for switchable sensors and are **not compiled** since: `android.jar` was unreachable from the cloud session. The first Gradle build must compile them.
- The signals still missing for a full sensing layer: `docs/engineering/runtime-performance/verger/sensing.md`.

## Evidence (2026-10-21)

- Estimator, procfs sampler, display choice: 18 JUnit tests on the JVM, including real procfs attribution (G2).
- Sensors and levers: compiled against `android.jar` (platform 35); binding against an expo-modules-core 58.0.21 signature stub (G1).
- Not yet built through Gradle or run on a device.
