---
title: "Android Device Profiling Source Register"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [android, profiling, performance, expo-58, react-native-0.88, research]
---

# Android Device Profiling Source Register

## Purpose and local version anchor

This register grounds the proposed low-end startup profiling path in current
platform documentation. It supplements the [startup architecture audit](../architecture/2026-10-19-low-end-startup-architecture-audit.md)
and the [physical startup findings](../architecture/2026-10-17-physical-startup-performance-findings.md).
It proposes measurement practice; it does not certify a device tier or set app
budgets.

The mobile manifest currently declares `expo: ~58.0.13`, `react-native: 0.88.0`,
and `react: 19.3.0`. Expo's SDK 58 reference maps SDK 58 to RN 0.88 and React
19.3.0, and lists Android 7+ support. The RN 0.88 release post is dated
2026-10-19. These anchors matter because profiler support and runtime behavior
must be checked against the app's actual built artifact; SDK documentation is
not evidence that an EAS build has a particular manifest or instrumentation.

## Broad architecture round

Use a layered measurement model rather than one synthetic “device score”:

1. **Stable device descriptors:** model/build fingerprint, Android API, ABI,
   RAM class/low-RAM flag, CPU topology, storage type where discoverable,
   display refresh rate, and app artifact/version. These describe the test
   hardware; they do not predict its observed performance by themselves.
2. **Run conditions:** battery/charging state, thermal state, brightness,
   foreground/background competitors, network condition, storage/cache state,
   and process compilation state. Record these with every run. A fast CPU may
   be thermally throttled; RAM size does not encode CPU speed, storage latency,
   or current pressure.
3. **Journey and runtime evidence:** cold/warm/hot launch, TTID, app-signalled
   TTFD/useful-screen readiness, user input response, JS/UI/render thread
   activity, scheduler wait/run time, and sampled process/system memory. Report
   each journey separately; a native Activity first draw is not proof that the
   JavaScript route is ready or interactive.

Prefer repeated physical-device runs with a release-like, non-debuggable
artifact. Preserve both raw run-level observations and summary statistics
(including sample count and spread). Keep first-install/profile state separate
from warmed/JIT state. Capture traces on representative runs to explain
outliers; profiling instrumentation itself and polling have overhead.

## Dated precision round (official primary sources checked 2026-10-19)

| Source | Grounded use | Caveat for this app |
| --- | --- | --- |
| [Android startup timing and launch states](https://developer.android.com/topic/performance/issues/launch-time) | Android distinguishes cold, warm, and hot starts. TTID is first frame; TTFD requires the app to signal when its content is usable, commonly with `reportFullyDrawn`. TTID and TTFD answer different questions. | Native Activity/AndroidTTID can precede JS bundle/route readiness. Define Gurudevi's useful Welcome/admitted-screen endpoint explicitly; do not label a splash or placeholder as completed interaction. |
| [Android startup analysis and optimization](https://developer.android.com/topic/performance/appstartup/analysis-optimization) | Recommends Macrobenchmark and system traces; noncritical work can be delayed, but background work still competes for CPU during startup. | A trace explains contention, but does not alone prove which JS module or user-visible journey is responsible. Add app stage markers and correlate with JS/UI evidence. |
| [Macrobenchmark overview](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview) and [startup metric guidance](https://developer.android.com/topic/performance/baselineprofiles/measure-baselineprofile) | Macrobenchmark can repeat launch journeys, collect traces, vary compilation mode, and measure TTID/TTFD and frames. Benchmarks should run on physical hardware; emulator figures share host resources and are not representative. | Treat benchmark harness as a possible future artifact, not a current project capability. Report install/profile/compilation mode; cold launch kills process, not necessarily every disk/cache condition. |
| [Android profileable manifest element](https://developer.android.com/guide/topics/manifest/profileable-element) | `<profileable android:shell="true"/>` permits selected shell profilers on a non-debuggable release-like app. Android warns debuggable apps have significant and variable timing degradation. | Profileable has limited data exposure (stack traces; no arbitrary memory reading by host tools according to the doc) and is not identical to `debuggable`. Confirm the built APK/AAB manifest and exact profiler access before measurement. |
| [Perfetto Android trace analysis cookbook](https://perfetto.dev/docs/getting-started/android-trace-analysis) and [memory counters](https://perfetto.dev/docs/data-sources/memory-counters) | Perfetto can correlate scheduler events, CPU frequency/idle events where supported, and process RSS/swap samples. Its Android memory SQL module recommends peak anonymous RSS + swap as a pressure-oriented view, with file RSS and swap reported alongside. | Sampled counters can miss short peaks. RSS includes shared pages; PSS apportions shared pages; swap and anonymous memory answer different questions. Preserve metric names/units and collection method; do not call one value “total app memory.” |
| [Perfetto CPU scheduling](https://perfetto.dev/docs/data-sources/cpu-scheduling) and [CPU frequency/idle](https://perfetto.dev/docs/data-sources/cpu-freq) | Scheduling traces show when threads run, on which core, and why they are descheduled. Frequency events show policy changes when kernel support emits them. | Frequency is not CPU capacity or throughput: it varies by cluster, thermal/power state and workload, can be unsupported, and may be absent at trace start. Report observed frequency alongside scheduling and task duration, never as a standalone ranking. |
| [Android benchmarking consistency](https://developer.android.com/topic/performance/benchmarking/microbenchmark-overview) and [Macrobenchmark metric collection](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics) | Mobile clocks vary with power and heat. Android's benchmark guidance notes thermal detection/clock control behavior; macrobenchmark guidance recommends fixed brightness, stable temperature, and closing competing work for comparable runs. | Reproducibility requires logging run conditions and using repeated trials. Do not artificially lock clocks or thermally stabilize away real-user behavior for the product acceptance run; controlled and natural-condition runs serve different purposes. |
| [Android low-RAM practices](https://developer.android.com/guide/topics/androidgo/best-practices) | Android exposes low-RAM device handling and app memory-class context; these can be recorded as platform signals. | `isLowRamDevice` and memory class are OS classification/context, not a promise of currently available memory or app-safe RAM. Pair them with observed pressure; do not turn them into an invented CPU capacity or hard memory budget. |
| [React Native performance overview](https://reactnative.dev/docs/performance) | RN documents separate JS-thread and UI-thread frame work, the nominal 16.67 ms frame interval at 60 Hz, and warns that dev mode substantially hurts JS performance. It explicitly says to measure release builds. | The 16.67 ms interval is a frame cadence reference, not a universal app task budget; high-refresh displays have shorter intervals. Dev monitor metrics are diagnostic, not release certification. |
| [React Native 0.88 release, 2026-10-19](https://reactnative.dev/blog/2026/10/19/react-native-0.88) and [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/) | These are the exact upstream version anchors for this repository's declared RN/React/Expo cohort. RN 0.88 release notes identify its runtime changes and Hermes version; Expo's SDK table maps SDK 58 to RN 0.88/React 19.3.0. | Neither is a profiler recipe. For API signatures or availability, inspect the installed project/runtime and the generated native artifact rather than infer from a blog post. |
| [Android Baseline Profiles overview](https://developer.android.com/topic/performance/baselineprofiles/overview) and [measurement guidance](https://developer.android.com/topic/performance/baselineprofiles/measure-baselineprofile) | Baseline Profiles encode DEX/ART code paths; ART can AOT-compile included Java/Kotlin bytecode methods on installation. Compare profile-enabled and disabled builds under controlled compilation state. | This optimizes ART-managed native/DEX paths. It does **not** automatically precompile Hermes JavaScript or replace Hermes bytecode/module loading analysis. Measure native profile effects separately from JS bundle startup. |

## Measurement interpretation rules

- **Hardware vs conditions:** freeze device identity for comparisons and record
  condition changes rather than folding them into a device “capacity” label.
  Capacity can describe a cohort; thermal, battery, pressure, and network are
  live conditions.
- **Memory:** report time-series/peak PSS when available, RSS, anonymous and
  file-backed RSS, swap, and Java/native/graphics breakdown where the selected
  tool supports it. State sampling interval and whether values are process,
  app, or system-wide. Do not equate virtual address size, SQLite cache limits,
  or allocated heap with resident physical memory.
- **CPU:** pair work duration with scheduler run/wait evidence and core/frequency
  context. Clock rate alone is not a CPU-capacity score; a low observed rate can
  mean idle, power policy, thermal throttling, or unsupported reporting.
- **Startup:** retain OS TTID, app-declared TTFD, first React content, and the
  product-defined usable-screen/input-ready event as distinct timestamps.
  Document how Android fully-drawn signaling maps to this app before using it
  for comparisons.
- **Release fidelity:** do not use Metro/debug-client timing as the production
  baseline. Use the same non-debuggable release-like artifact/configuration,
  including minification and profile state, across comparisons. A profileable
  artifact improves profiler access without making it a debug build.
- **Statistics:** use repeated runs and report median plus tail percentiles,
  sample count, and spread. Separate controlled-condition reproducibility runs
  from runs representing realistic thermal/background variability. Set numeric
  acceptance budgets only after the primary low-end release baseline exists.

No numeric RAM ceiling, “CPU capacity score,” or supported-device promise is
derived by this source register. Those require measured Gurudevi journeys on
the actual supported device cohort.

## Current project evidence note (2026-10-19)

The current G5 A52 artifacts are development captures, not a release baseline:
`reports/mobile-performance/2026-10-19T08-30-57-639Z-0c8da8bb` records PSS
1,587,235 KiB and
`reports/mobile-performance/2026-10-19T08-35-28-711Z-7b0bfdc5` records PSS
1,573,926 KiB. The latter includes an 8,301,702-byte `native.pftrace` under an
8 MB cap with a requested 10 s capture; do not infer observed duration from
file size. Consult each capture's manifest for conditions and collection
method before comparison. These values do not prove a leak, pressure trend, or
optimization.

Essential startup now emits bounded Observe `startup_stage` events for five
coordinator stages. Duration is omitted when the monotonic clock is invalid;
event attributes contain only fixed stage/outcome and measured duration. This
is an app-stage supplement, not TTID/TTFD or interaction readiness. See the
[execution plan](../current_progress/2026-10-19-performance-engineering-execution-plan.md)
for build, test, crash and benchmark validation status.
