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
| Binding | `VergerModule.kt` | Expo Modules API: `readCapacity`, `start`, `setSensors`, `stop`, `setRefreshCap`, `setCpuBoost`, `readTotals`, eight events. |
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

## Evidence (2026-10-24)

- Android-free Kotlin (estimator, sampler, exits, display modes, sensor set): 25 JUnit tests on the desktop JVM with Kotlin 2.1.20 (G2).
- `VergerSense.kt` and `VergerModule.kt` changed for switchable sensors and are **not compiled** since: `android.jar` was unreachable from the cloud session. The first Gradle build must compile them.
- The signals still missing for a full sensing layer: `docs/engineering/runtime-performance/verger/sensing.md`.

## Evidence (2026-10-21)

- Estimator, procfs sampler, display choice: 18 JUnit tests on the JVM, including real procfs attribution (G2).
- Sensors and levers: compiled against `android.jar` (platform 35); binding against an expo-modules-core 58.0.21 signature stub (G1).
- Not yet built through Gradle or run on a device.
