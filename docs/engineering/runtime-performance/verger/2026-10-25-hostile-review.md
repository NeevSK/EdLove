---
title: "Verger: hostile review against the vision, the lineage and Expo Modules 2.0"
status: active
created: 2026-10-25
owners: [Naveen]
tags: [verger, review, configuration, expo-modules]
---

# Hostile review, 2026-10-25

Read against [the vision](vision-feasibility-and-plan.md), [lineage and recovery](lineage-and-recovery.md),
the [pipeline](pipeline.md) and the installed SDK 58 sources, at commit `63dafb6`. Every finding names
its evidence. Nothing here has run on a phone: every claim below is G0 to G4 at most.

## 1. What is configurable, and what is not

"Configurable" has four doors: the host's config (code), `tune` (live, typed), the lab (development),
and remote config (field, no release). The vision's Pathfinder lesson asks for the last: "every lever
remotely configurable".

| Choice | Today | Door missing |
|---|---|---|
| Every threshold in `DEFAULT_VERGER_CONFIG` (frames, heat, memory, storage 512 MiB, input delay 100 ms, judge windows, flapping) | host config, `tune`, lab | **remote**: only an activation patch can come from remote config, not thresholds; a lab `tune` is not saved for the next launch |
| Unhelpful-lever rule (`INEFFECTIVE_AFTER_MOVES` = 3) | a constant | config, remote |
| Self-budget (`selfBudget`) | a `createVerger` option; Gurudevi passes none | host, remote, lab |
| Default policy (p4 or p5) | `host.policy`, fixed at build | remote, lab (an experiment arm is the right door: `assignExperiment` exists and is not called) |
| Data allowances, night window | none: nothing produces the `data-budget` event | everything (B3.1 and its config) |
| Which work waits on low storage | no rule | a decision, then config |
| Recovery ladder (N, K, window) | host `recovery` config | remote |
| Gurudevi's lever rules (`whenStorageLow`, `whenDataBudgetSpent`, ...) | code, by design (a lever rule is a host fact) | none needed; the per-lever activation patch can switch any lever off remotely |

**Verdict:** yes, they need it. The seam is one: a remote **config patch** beside the remote activation
patch, parsed strictly like it (`parseConfigPatch`, refused whole), layered build < lab < remote, with
the ladder and the kill switch still above it; plus `selfBudget`, `ineffectiveAfterMoves` and the
storage rule moved into `VergerConfig`, and the default policy chosen by experiment arm.

## 2. Findings, most severe first

1. **Telemetry goes nowhere.** `EntryShell` mounts `GurudeviVerger` without `telemetrySink`
   (`apps/gurudevi-mobile/src/entry/EntryShell.tsx:74`). `verger_outcomes`, `verger_flight`,
   `verger_self_budget` and the summaries are built and dropped. Loop 3 has no field data, and the
   vision's "report back" and success criterion 4 cannot be met. A sink is your call (no new SaaS):
   Expo Observe or the owned OTLP collector named in the tooling matrix.
2. **No remote control in practice.** Nothing sets `__GURUDEVI_RUNTIME_MODE__` or
   `__GURUDEVI_VERGER_ACTIVATION__` (no GrowthBook or remote-config binding found). The kill switch
   works only through a new build. Lineage invariant 1 ("reachable from the next launch, without a
   release") holds for the ladder, not for people.
3. **Invariant 7 is half kept.** The vision: "no quality changes while a gesture or list momentum is
   active". The reducer freezes only hardware outputs (`hardwareOf`, `reducer.ts:1316`), and only on
   touches. Lever levels (list window, image decode, blur) can change mid-scroll, and scroll momentum
   is not sensed at all. Worst case: `drawDistance` shrinks while a teacher flings a roster.
4. **The data budget is a limit with no source.** The reducer, admission and accounts handle
   `data-budget`, but no platform sends it (B3.1 TrafficStats not built). On phones it is always
   `unknown`, which is safe, and does nothing.
5. **The allocator in the vision is not what was built.** The vision's core is budgets per account
   (`Σ c(w,q,R) ≤ B(R,t)`) from measured cost vectors, and coupling rules. Verger decides by levers on
   ladders, ordered by bottleneck and visual impact; workloads carry suspected accounts, not measured
   costs; there is no budget arithmetic and no coupling rule. This is a defensible simplification
   (Unity's indexer), but the vision still claims the allocator. Record the decision, or build it after
   phones give cost vectors.
6. **Registry rule 1 is missing.** "A component that animates, decodes, fetches or schedules must
   declare its workload entry; a test fails when one does not" — no such architecture test exists.
7. **Sensing gaps from the vision's signal table.** No JS event-loop lag sampler, no Hermes heap or GC
   pauses (`HermesInternal` unread), no frame-drift heat inference for Android 9, no storage reading
   natively (JS only), no Android performance class, no first-run calibration (phase 3).
   **Update, same day:** the lag sampler and Hermes GC pressure are built (`e656b33`). Frame-drift
   heat is **decided against**: the vision proposed it for Android 9, which has no thermal status,
   before the battery-temperature fallback (B2) existed; verger's native module reads battery
   temperature from the battery broadcast on every API level it supports, so drift would be a weaker
   second witness. It is also confounded: verger has no route signal, so a heavier screen reads as
   heat, and acting on it (warm floors) changes the very workload it measures. Revisit only if phones
   show battery temperature missing or lagging badly.
8. **Input delay may be silent on phones.** React Native 0.88 ships `PerformanceEventTiming`, but the
   supported entry types come from native (`NativePerformance.getSupportedPerformanceEntryTypes`). The
   observer feature-detects, so the worst case is silence, never a crash. Unverified on a device.
9. **The p5 default and every threshold are unmeasured.** p5 beat p4 on synthetic stories only;
   `compare` has no phone recording to read yet. Provisional numbers are marked provisional; none is
   validated.
10. **Glass and short fades are declared but unused.** `glass-material` has no consumer;
    `transitions` level 1 reads like level 0. Harmless, but the ladder promises steps that do not exist.
11. **User switch for adaptation** (lineage, ADPF best practice) is not built; only fidelity exists.

## 3. Expo Modules 2.0 and verger's native module

**What SDK 58 ships (read from the installed sources, not from memory).** expo-modules-core 58.0.21
carries an Android v2 host (`expo/modules/v2/ExpoModulesV2Host.kt`) that installs annotated modules
from a generated `ExpoModulesV2ModuleList` onto `globalThis.expo.modules`, alongside the v1 registry.
A module opts in with `expoModule { v2 true }` in its `build.gradle`. Five installed packages use it
(expo-crypto, expo-haptics, expo-application, expo-sqlite and expo itself); 96 still use the v1
`ModuleDefinition` DSL. Authoring, as used by those modules:

| v1 DSL (verger today) | v2 (installed modules) |
|---|---|
| `class VergerModule : Module()` with `definition()` | `@ExpoModule("Verger") class VergerModule : Module()` |
| `Name("Verger")` | the annotation's name |
| `Function("start") { ... }` | `@JS fun start(...)` (sync), `@JS suspend fun` (async) |
| `Events(...)`, `sendEvent(name, body)` | `@Event(name = ...) private val onX = event<T>(onStartObserving, onStopObserving)`, then `onX(payload)` |
| `OnDestroy { }` | `override fun onDestroy()` |
| `appContext.reactContext`, `appContext.currentActivity` | `androidContext`, `currentActivity` (`io.github.expo.modules.v2.react`) |
| `OnActivityEntersForeground`, `OnActivityEntersBackground` | **not seen in any installed v2 module**; the v2 runtime is a Maven artifact not on disk, so absent or present cannot be confirmed here |
| JS: `requireOptionalNativeModule('Verger')` | unchanged (`requireNativeModule('ExpoCrypto')` reaches a v2 module) |

The changelog records v2 fixes as recent as 58.0.15 (R8 stripping v2 classes in release builds,
#51204), and Expo's own September 2026 post called 2.0 a beta in SDK 58.

**Verdict.** Verger stays on the v1 DSL for now. v1 is the mainstream, supported path in SDK 58; v2 on
Android is weeks into beta, its lifecycle hooks are unconfirmed, and verger's module has never been
built even once (phase F). Migrating an uncompiled module onto a beta runtime stacks two unknowns.
Verger gains little from v2's call cost: it crosses the bridge on change only (500 ms windows), which
is why the ADR chose the Expo module over Nitro in the first place.

**Update, same day:** item 1 below is done (`Presence.kt`, an `Application.ActivityLifecycleCallbacks`
adapter inside `VergerSense`), and every Kotlin file but the binding now compiles against
`android.jar` 35 for the first time (`pnpm verger:android-jvm`, 34 JUnit tests).

**What to do now, cheaply, to be v2-ready:**

1. Move the foreground and background hooks out of Expo into `VergerSense`, through
   `ProcessLifecycleOwner` or `Application.ActivityLifecycleCallbacks`. That removes the only v1
   feature v2 may lack, and decouples sensing from Expo further.
2. Keep `VergerModule.kt` a thin binding (it is), so a v2 port is a mechanical file swap: functions to
   `@JS`, events to one `event<Map<String, Any?>>` per name.
3. Plan the port after phase F, when the v1 module has run on the A52 and A24, behind its own commit
   and its own device evidence; verify the v2 lifecycle API against the Maven artifact's sources then.

## 4. Do the places verger touches cope?

| Place | State | Gap |
|---|---|---|
| Mobile mount (`EntryShell`) | mounted; floors without native code | no sink, no assignment, no remote patch source |
| Background tasks (sync, retention) | admitted through `admitBackgroundWork` with JS readings | the data budget never reaches them (no source) |
| Optional startup | `optionalConcurrency` | — |
| ui components | every governed lever has a reader (stage 4 audit) | gesture freeze does not cover levels (finding 3) |
| Web (sanctuary layout) | `VergerBrowser`; blur and app-wide motion; lab page | no sink; Firefox and Safari hide memory and battery |
| Android module | written, contract-tested on the JVM | never compiled by Gradle; v1 DSL (section 3) |
| PowerSync and sync upload | admitted as deferrable | attendance upload's class is an open question in the vision |
| Expo Observe, PostHog, Sentry | present in the app | none wired to verger |

## 5. Remaining work, in order of leverage

1. **Phase F on phones** (your laptop): first Gradle build, the A52 and A24, one 2 to 4 GB phone;
   record sessions with the lab; run `compare`. Everything provisional waits on this.
2. **Remote config and a sink** (findings 1 and 2, section 1): a remote config patch; `selfBudget`,
   the unhelpful-lever count and the storage rule into config; the default policy by experiment arm; a
   telemetry sink of your choosing.
3. **Freeze levels during gestures and momentum** (finding 3): a scroll-momentum signal from the list
   primitive, and the freeze applied to lowering lever levels, not only hardware.
4. **B3.1** the TrafficStats byte counter and allowances config.
5. **Registry architecture test** (finding 6).
6. **Sensing gaps** (finding 7), in vision order: JS lag sampler, Hermes heap, frame drift.
7. **Lifecycle out of Expo** (section 3), then the v2 port after phase F.
8. Decide finding 5: record the lever-ladder decision in the ADR, or plan the budget allocator.

Sources: installed `expo-modules-core@58.0.21` (`android/src/main/java/expo/modules/v2/`,
`CHANGELOG.md`, `expo-module-gradle-plugin`), `expo-crypto@58.0.7`, `expo-sqlite@58.0.13`,
`expo-haptics`, `expo-application` Android sources; `react-native@0.88.0`
`src/private/webapis/performance/`; [Expo blog: An early look at Expo Modules 2.0](https://expo.dev/blog/an-early-look-at-expo-modules-2-0)
(search summary only: the page could not be fetched from this environment).
