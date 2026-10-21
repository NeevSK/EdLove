# runtime-sense

The sensing half of the adaptive runtime (Android). It measures and reports; the decisions are
made by the governor in `@repo/core/governor`.

| Layer | File | Role |
| --- | --- | --- |
| Estimator | `FrameWindowEstimator.kt` | Allocation-free online windowing and classification of frames. Specified by `packages/core/src/governor/frames.ts`. |
| Mappings | `Signals.kt` | Trim levels, thermal status, headroom validity and poll pacing. Pure Kotlin. |
| Sensors | `RuntimeSense.kt` | FrameMetrics, thermal listener and ADPF headroom, `onTrimMemory`, battery saver, capacity facts. One background thread. No Expo dependency. |
| Binding | `RuntimeSenseModule.kt` | Expo Modules API: `capacity` constant, `start` / `stop` / `readTotals`, four events, foreground and background hooks. |
| JS | `index.ts`, `src/mapping.ts` | Optional native module handle and the mapping to `GovernorEvent`. |

Only changes cross the bridge: stressed and near-budget windows always, calm and quiet windows
only when the state changes, thermal on a status change or a headroom move of at least 0.02.
An idle screen sends nothing.

## Parity

The Kotlin estimator is tested against the golden vectors the TypeScript reference produces
(`packages/core/src/governor/__fixtures__/a52-self-idle.expected.json`). Regenerate them with
`UPDATE_GOLDEN=1` in `packages/core`, then run both suites.

```
# in a prebuilt Android project
./gradlew :runtime-sense:testDebugUnitTest
```

## Evidence (2026-10-21)

- Estimator and mappings: compiled with kotlinc 2.1.20 and run on the JVM, 6 of 6 JUnit tests
  pass, including the golden vectors and timer-flush equivalence. (G2)
- Sensors: compiled against `android.jar` (platform 35). Not yet run on a device. (G1)
- Binding: compiled against a signature stub copied from `expo-modules-core` 58.0.21, not
  against the real library. (G1)
- Not yet built through Gradle or autolinked in a prebuild.
