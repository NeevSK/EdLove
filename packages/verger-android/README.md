# @repo/verger-android

Verger's Android half: sensing and the app-wide hardware levers, as an Expo module. It measures
and actuates; every decision is made by `@repo/verger-core` in JavaScript. It knows no host app.

| Layer | File | Role |
| --- | --- | --- |
| Estimator | `FrameWindowEstimator.kt` | Allocation-free windowing and classification of frames, held to the golden vectors of `packages/verger-core/src/frames.ts`. |
| CPU attribution | `ThreadCpuSampler.kt` | Per-thread CPU from procfs: main, JS, native modules, render, GC, image. |
| Display | `DisplayModes.kt` | Chooses the display mode for a refresh cap without changing resolution. |
| Mappings | `Signals.kt` | Trim levels, thermal status, headroom validity and poll pacing. |
| Levers | `HardwareLevers.kt` | Refresh cap (preferred display mode) and the ADPF hint session; released on stop, destroy and reload. |
| Sensors | `VergerSense.kt` | FrameMetrics stages, thermal, memory, battery saver, thread load; one thread; only changes cross. |
| Binding | `VergerModule.kt` | Expo Modules API: `readCapacity`, `start`, `stop`, `setRefreshCap`, `setCpuBoost`, `readTotals`, seven events. |
| JS | `index.ts`, `src/mapping.ts` | `createVergerAndroidPort()`: a `RuntimePort` for verger-core. |

A host app adds this package as a dependency; Expo autolinking finds `expo-module.config.json`.

## Parity

The Kotlin estimator is tested against the golden vectors the TypeScript reference produces
(`packages/verger-core/src/__fixtures__`). Regenerate them with `pnpm --filter @repo/verger-core golden`,
then run both suites. In a prebuilt Android project: `./gradlew :repo_verger-android:testDebugUnitTest`
(the Gradle project name follows the autolinked package name; confirm it in `settings.gradle`).

## Evidence (2026-10-21)

- Estimator, procfs sampler, display choice: 18 JUnit tests on the JVM, including real procfs attribution (G2).
- Sensors and levers: compiled against `android.jar` (platform 35); binding against an expo-modules-core 58.0.21 signature stub (G1).
- Not yet built through Gradle or run on a device.
