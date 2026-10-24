---
title: "Gurudevi Adaptive Runtime: Vision, Feasibility and Plan"
status: active
created: 2026-10-21
updated: 2026-10-24
owners: [Naveen]
tags: [verger, adaptive-runtime, vision, design]
---

> **Provenance.** Exported verbatim from the Claude Doc
> [Gurudevi Adaptive Runtime: Vision, Feasibility and Plan](https://claude.ai/artifact/4yGyJ6Z6H1n4MkiVkBT6j8),
> tab "Gurudevi Adaptive Runtime: Vision, Feasibility and Plan", revision 17, on 2026-10-24, so the vision and its reasoning live in the repository
> beside the code. Diagrams are redrawn as text. The decisions are recorded in
> [the ADR](../../../decisions/2026-10-21-adaptive-runtime-resource-economy.md); where the two
> differ, the ADR and the code are later. Sibling tab: see the link in the text.

# Gurudevi Adaptive Runtime: Vision, Feasibility and Plan

2026-10-21 · Neev

## Status and scope

This document sets the target for Gurudevi's adaptive runtime: a resource economy that matches the app's demand to what the device can give in this moment, across three time layers, with every claim tested by controlled comparison. It amends `docs/engineering/runtime-performance/governor-architecture-spec.md` and does not replace it: the governor becomes the correction loop inside a wider allocator.

What exists on branch `feat/adaptive-runtime` (commits `b0e0e0b`, `6292d59`, `baf9aaf`) covers about a quarter of this design: the realtime frame layer, part of the varying layer, a step-down governor that controls visual levers only, and experiment and telemetry primitives with no sink attached.

| Part | Intended | Done | Evidence |
|---|---|---|---|
| Realtime layer: UI frames | yes | built | G2 (JVM and TS golden vectors); not on a device |
| Realtime layer: JS thread, GC, input delay | yes | not started | none |
| Varying layer | memory, thermal, energy, network, storage, contention | thermal status and headroom, trim callbacks, battery saver | G1 (compiled against android.jar 35) |
| Baseline layer | class, calibration, learned profile | one RAM flag | none |
| Fallbacks for Android 9 to 13 | full matrix | partial | G1 |
| Resource accounts and cost vectors | per workload, measured | one target per lever, guessed | none |
| Demand registry and priority classes | every screen and job | none | none |
| Allocator and shedding executive | all resources | visual step-down only | G2 (22 unit tests) |
| Interaction rules | modelled | none | none |
| Modes, kill switch | five modes | two arms | G2 |
| Telemetry sink, outcome metrics | wired | events defined only | G2 |
| Device matrix, captures | low-end first | one A52 dev-build trace | R1 (contaminated) |

### Relation to the existing records

This design builds on the records in `docs/engineering/runtime-performance/` and keeps their decisions unless it says otherwise:

- **Composition over a monolith** (ledger, 2026-10-19). The OS, Hermes, PowerSync and the query layer keep their jobs; Gurudevi writes the policy that maps signals to budgets, plus native sensing only where a signal is missing from Expo. Thermal headroom, trim callbacks and per-frame metrics are such signals.
- **Intrinsic before adaptive** (telemetry ledger, 2026-10-19). An allocator cannot repair waste. The device audit measured 1.53 GB PSS and the JS thread at 86.6% CPU from startup sync loops; that is waste to remove, not load to govern.
- **Deterministic, versioned, explainable policies.** No policy changes itself from telemetry. Each decision answers: which condition, which rule, which budget, which operation, and whether it helped.
- **Scroll freeze and priority shedding** (glass ledger, 2026-10-20). No quality change while a gesture or list momentum is active; shedding runs from the least to the most important surface.
- **Numeric targets** (RapidNative ledger, 2026-10-20): cold start under 2.0 s on mid-tier Android, input response under 100 ms, resident memory under 180 MB.
- **Amended:** the governor spec named Nitro for sensing. The Kotlin Expo module replaces it because decisions run at window granularity (500 ms), so synchronous JSI access buys nothing, and events cross only on change. The ADR records this.

**Pilot constraint.** The teacher pilot on Monday 26 October runs under a native-code freeze. Until after it, only TypeScript changes merge; `runtime-sense` stays on its branch.

Out of scope: iOS (no TestFlight budget), web, and any server-side scheduling.

Prior art, mission-critical lessons, and how the lieutenant recovers and grows back: [Lineage and recovery](lineage-and-recovery.md)

## Vision

Gurudevi should work well on the phone a rural teacher actually holds, in the state that phone is actually in, by spending the device's resources as a disciplined economy spends a scarce budget.

### The problem

- **Capacity is temporal, not a label.** A flagship that is hot, low on battery and squeezed by background apps can give less than a cheap phone running one app. A device class sets a prior; it never settles the verdict.
- **Demand is wider than graphics.** Visual libraries adapt blur and motion. Gurudevi also spends on sync, local storage, image decoding, uploads, startup work and the JavaScript thread, and each of these draws on several resources at once.
- **The resources are coupled.** Heat lowers CPU frequency, which raises frame cost. Memory pressure brings garbage collection, which brings jank. Radio use drains the battery and adds heat. Battery saver caps the CPU. A governor that treats each signal alone reacts late and in the wrong place.
- **The users sit low on the curve.** In Sri Lanka in September 2026, about 42% of Android web traffic ran on Android 13 or older and about 15% on Android 10 or older ([StatCounter](https://gs.statcounter.com/android-version-market-share/mobile-tablet/sri-lanka)). Web traffic over-represents better phones, so rural school users likely skew older still.

### The Apollo lesson

The Apollo 11 lunar module computer survived an overload during descent because its software knew which work was essential. Radar counter interrupts took about 15% of its time, jobs piled up until the Executive ran out of storage areas (alarms 1202 and 1201), and the BAILOUT restart cleared every queue and restarted only the jobs listed in its phase tables, at a logical point near where they stopped; the backlog was discarded and crew displays had to be requested again ([Cherry, MIT Instrumentation Laboratory](https://ibiblio.org/apollo/Documents/CherryApollo11Exegesis.pdf)). The lesson for Gurudevi is not small code. It is a declared list of what must survive, ordered shedding of the rest, and a restart into a known state.

### What success means

1. Critical work (the breathing timer, an attendance save, input response) meets its deadline on every supported device, in every state.
2. On a 2 to 3 GB phone on Android 10, the app stays usable through a full school day without a low-memory kill or overheating.
3. Quality rises with what is available, and falls in a declared order when it is not.
4. Every adaptive behaviour is shown, by controlled comparison against a non-adaptive control, to improve an outcome a user would notice.

### The mission: a lieutenant to the operating system

The runtime is a supervisor for this app only, subordinate to the Android kernel. The OS keeps its authority over CPU, memory and the process; the runtime never fights the scheduler or the memory killer. Within that authority it does what the OS cannot, because only the app knows which work matters:

1. **Act before the OS acts bluntly.** The OS answers scarcity with a kill, a uniform throttle or an ANR dialog. The runtime answers earlier, by shedding ornament, then deferring work, and never the critical path.
2. **Know its own troops.** Every workload has a class; critical work is protected first.
3. **Report back.** Every decision is recorded with its reason, so the next policy version and the next code fix are aimed where the evidence points.
4. **Earn its keep.** Its own cost is measured, and it ships only where it beats the plain app on outcomes users notice.

The expressive layer (the mascot, the breathing guide, glass, motion) is built on top of it and spends what the device can give at that moment.

## Atoms

The model has three generators (resource, device, time), quantities they generate on the supply and demand sides, and operators that act on those quantities. Every later section derives from these.

### Generators

| Atom | Definition | Values |
|---|---|---|
| **R** Resource account | A capacity the device holds and the app spends | cpu, gpu, memory, energy, thermal, network, storage |
| **D** Device | One physical phone with its OS version and its owner's other apps | measured, never assumed |
| **t** Time | The sensor's monotonic clock, read at three scales | realtime (ms to s), varying (min to h), baseline (months) |

### Supply: what the device gives

| Atom | Definition | Layer | Example |
|---|---|---|---|
| **E(D, R)** Endowment | The most the device can give of R when nothing else competes | baseline | 3 GB RAM, 4 big cores, 60 Hz |
| **A(D, R, t)** Availability | What it can give of R now, after heat, battery, saver and other apps | varying | 900 MB free, headroom 0.7, battery 18% |
| **L(R, t)** Load | What the app is measured to spend of R now | realtime | frame cost 22 ms against 16.7 |
| **H(R, t)** Headroom | A − L: what remains before R is exhausted | derived | negative means overdraft |

### Demand: what the app asks

| Atom | Definition |
|---|---|
| **w** Workload | A unit of work the app does: a screen's rendering, a sync, an image decode, an animation |
| **κ(w)** Priority class | critical, committed, deferrable or ornamental (defined below) |
| **q(w)** Quality ladder | The ordered levels w can run at, from full to off; critical work has no off |
| **c(w, q, R)** Cost vector | What w spends of each R at level q; measured, not guessed |
| **d(w)** Deadline | When w must finish to be useful; critical work only |

| Class | Meaning | Existing names it maps to | Gurudevi examples | May be shed |
|---|---|---|---|---|
| critical | Fails the user if late | spec `user-critical`; glass `critical` | breathing timer, attendance save, touch response | never; degrade only within its ladder |
| committed | The screen in front of the user | spec `ui-transition`; glass `high`, `normal` | lists, navigation, the visible timetable | lowered, not removed |
| deferrable | Useful later | spec `background-sync`, `media-prefetch`, `storage-cleanup`, `telemetry-flush` | sync, prefetch, image warming, telemetry flush | postponed |
| ornamental | Pleasure, not function | glass `low`, `decorative`; visual tier `rich` extras | ambient motion, glass, shimmer, particles | removed first |

### Operators

1. **Estimator** turns platform signals into A and L for each R, with a confidence for each estimate.
2. **Allocator** sets a budget per account from supply, then admits demand in class order.
3. **Correction loop** adjusts budgets from measured load; the existing governor's step-down and step-up logic is this operator.
4. **Coupling rules** move budgets of one account when another changes, before the effect appears.
5. **Executive** chooses the mode (off, static, shadow, closed loop, minimal) and owns the restart into minimal.

The allocator admits levels so that, for every account,

```latex
\sum_{w} c\big(w, q(w), R\big) \le B(R, t) = \min\big(E(D,R),\, A(D,R,t)\big) - m(R)
```

where m(R) is a safety margin. It lowers q in this order: ornamental, then deferrable, then committed, by greatest saving on the overdrawn account per unit of visual or functional loss.

### Invariants

1. Critical work is admitted first and its budget is reserved, not shared.
2. No workload is lowered for an account it does not spend.
3. Every lowering has a recorded reason: account, signal, value, rule, policy version.
4. Raising is slower than lowering, and a failed raise doubles the wait.
5. Without signals the system holds the baseline; it never guesses upward.
6. Native code measures; only JavaScript decides. All thresholds have one source.
7. No quality changes while a gesture or list momentum is active; decisions wait until it stops.
8. Policies are deterministic and versioned; telemetry informs the next version, never the running one.
9. Waste is removed before work is governed: a workload enters the allocator only after its intrinsic cost has been checked.

## Signals and fallbacks

Every account has a primary signal and a fallback that works back to Android 9, the app's minimum (minSdk 28). Older versions are not always poorer: before Android 14 the system still sends in-use memory warnings, which 14 and later withhold.

| Account | Layer | Android 14+ (API 34+) | Android 11–13 (API 30–33) | Android 10 (API 29) | Android 9 (API 28) |
|---|---|---|---|---|---|
| gpu / ui frames | realtime | FrameMetrics, per-frame deadline | FrameMetrics; deadline from 12 (API 31), else refresh interval | FrameMetrics, refresh interval | same as 10 |
| cpu / JS thread | realtime | event-loop lag sampler, JS frame callback, own CPU time | same | same | same |
| memory | realtime | Hermes heap, native heap, GC pauses | same | same | same |
| memory | varying | poll free memory and the system low-memory flag; trims only when hidden | running trim callbacks plus polling | running trims plus polling | same as 10 |
| memory | baseline | past exit reasons: how often the system killed us for memory | same (API 30+) | none: count unclean exits ourselves | same as 10 |
| thermal | varying | status listener plus ADPF headroom | status plus headroom | status only | battery temperature, frame-cost drift |
| energy | varying | battery level, charging, battery temperature, saver | same | same | same |
| network | varying | type, metered, bandwidth estimate, data saver | same | same | same |
| storage | varying | free bytes on the data partition | same | same | same |
| contention | varying | free memory trend, own CPU share against wall time | same | same | same |
| class | baseline | RAM, low-RAM flag, cores, refresh rate, performance class (API 31+), calibration | same; performance class from API 31 | no performance class | same as 10 |

Three rules govern the signals:

1. **Cheapest first.** A signal is read at the slowest rate that still catches the change: frames as they come, thermal headroom at most every 10 s (the platform throttles faster callers) and every 60 s while cool, memory and battery every 30 s in the foreground, nothing while hidden.
2. **Confidence travels with the value.** An estimate from a fallback (battery temperature for heat) carries lower confidence, and the allocator keeps a wider margin m(R) when confidence is low.
3. **Drift is a signal.** Frame cost rising over minutes at an unchanged workload means the CPU is being throttled. This lets heat be inferred on Android 9, where the OS gives no thermal status.

Items to verify against the installed sources before building: Hermes heap statistics (`HermesInternal`) in the bundled Hermes, the long-task support in React Native 0.88's performance APIs, and the exact delivery of trim levels on API 34 to 37.

## Demand registry

The registry lists every workload the app runs, its class, the accounts it spends and its quality ladder. This first pass comes from the code on `terrain/version-hops`; the accounts are suspected, and phase 2 replaces them with measured cost vectors.

| Workload | Source | Class | Accounts spent | Quality ladder (full → lowest) |
|---|---|---|---|---|
| Touch and input response | whole app | critical | cpu (JS, UI) | none: always full |
| Breathing timer and its guide | `src/somatic/` | critical | cpu, gpu | full animation → reduced motion → timer and text only |
| Attendance save | `app/attendance.tsx`, PowerSync | critical | storage, cpu | none: always full; upload may defer |
| Visible screen rendering and lists | each route | committed | cpu, gpu, memory | full list window → smaller window → simplified rows |
| Navigation transitions | expo-router | committed | gpu, cpu | full → short → none |
| Images on screen | `expo-image` | committed | memory, cpu, network | full resolution → screen-sized decode → placeholder |
| Sync upload and download | `PowerSyncProvider`, `backgroundSyncTask` | deferrable | network, energy, cpu, storage | live → batched → on charge or wifi |
| Storage eviction and retention | `storageEvictionTask`, `retention-scheduler` | deferrable | storage, cpu | scheduled → on idle → on charge |
| Optional startup services | `OptionalStartupServices` | deferrable | cpu, memory, network | at start → after first frame → on demand |
| Prefetch and image warming | various | deferrable | network, memory | on → wifi only → off |
| Telemetry flush | PostHog, Sentry, Observe | deferrable | network, energy | live → batched → on wifi |
| Sound and haptic feedback | `soundFeedback`, expo-haptics | ornamental | energy, cpu | on → haptics only → off |
| Ambient motion and glow | `SanctuaryPulseOverlay`, `SkiaGlowAura`, `WorkspaceWallpaper`, `HeroBanner` | ornamental | gpu, energy | animated → slow → static |
| Mascots | `LivingFirefly`, `FireflyMascot` | ornamental | gpu, cpu | animated → still frame → hidden |
| Loading shimmer | `SkeletonLoader` | ornamental | gpu | shimmer → static block |
| Brand and button loops | `BrandPulse`, `LotusPetalFAB` | ornamental | gpu, energy | looping → one pass → still; never while hidden |
| Splash animation | `LottieSplashScreen` | ornamental | cpu, gpu, memory | Lottie → static splash |

Two rules keep the registry honest:

1. A component that animates, decodes, fetches or schedules must declare its workload entry; a test fails when one does not (an architecture test of the existing kind under `src/__tests__/architecture/`).
2. A ladder step is valid only when it changes a measured cost. A step that saves nothing is removed.

## Architecture

Native code measures, JavaScript decides, and adapters in the app carry out the decision; the visual layer is one actuator among four.

```text
Native code measures, JavaScript decides, actuators spend

+-- Native sense: Kotlin Expo module, one background thread ------------------+
|  [Sensors]  frames, thermal, memory,       [Estimator]  windows, fallbacks,  |
|             energy, network, storage                    confidence;          |
|                                                         sends changes only   |
+----------------------------------+-------------------------------------------+
                                   | change-only events: supply A and load L
                                   v
+-- Decide: pure TypeScript (verger-core; host levers in @repo/core/governor) --+
|  [Baseline profile]  [Demand registry]  [*Allocator*]        [Correction loop]|
|   class, calibration  classes, ladders   budgets per account  the governor:   |
|   learned from exits  cost vectors       admit, shed by class step down,      |
|                                                               back off        |
|  [Executive] off, static, shadow,        [Telemetry and replay] outcomes per  |
|   closed loop, minimal; kill switch       mode; any session re-run            |
+----------------------------------+-------------------------------------------+
                                   | a quality level per workload, with its reason
                                   v
+-- Actuate: adapters in the mobile app ---------------------------------------+
|  [Visual levers]   [Work admission]   [Startup services]   [Images]          |
|   motion, glass,    sync and           deferred until       decode size,     |
|   blur              prefetch           idle                 cache            |
+-------------------------------------------------------------------------------+
```

The sensors and estimator send only changes. The allocator divides each account's budget among the registered workloads in class order. The correction loop (the governor already built) adjusts from measured load. The executive picks the mode and owns the restart into minimal. Telemetry records outcomes per mode, and replay re-runs any captured session through every mode.

What exists today: the estimator and part of the sensors (Kotlin), the correction loop, experiment assignment and telemetry events (TypeScript). The baseline profile, registry, allocator, executive modes and all four adapters are still to build.

## Runtime kernel: getting the most out of the hardware

The kernel measures where the hardware's time goes and acts on the whole app through levers no component can bypass, so it stays in control when app code is badly written. Built on `feat/adaptive-runtime` (commit `248af24`), off by default.

### What it measures

| Signal | Source | Cost | What it answers |
|---|---|---|---|
| CPU per thread role (main, JS, native modules, render, GC, image) | `/proc/self/task/*/stat`, 1 Hz while visible | one small read per thread per second | which thread is burning the CPU, whatever code runs on it |
| Frame stage costs (UI, render, GPU, main-thread delay) | FrameMetrics, every frame | no allocation per frame | whether a slow frame is CPU-bound or GPU-bound, so the right levers are shed |
| JS long tasks | React Native 0.88's scheduler, `longtask` entries | none (push) | JS stalls from any source |
| Free memory against the system threshold | `ActivityManager.MemoryInfo`, every 10 s | one binder call | memory pressure on Android 14+, where foreground trims are withheld |
| Thermal status and headroom, battery saver | existing sensors | as before | supply that changes with heat and power |

### Levers that act on the whole app

| Lever | Mechanism | Android | Used when |
|---|---|---|---|
| Refresh-rate cap | window preferred display mode, same resolution | 6+ (API 23) | idle, warm or hotter, battery saver, or as a GPU lever under stress; skipped on 60 Hz panels |
| CPU boost | ADPF performance-hint session over the UI and render threads, each frame's CPU work reported against its deadline | 12+ (API 31) | someone is interacting, the device is cool and not saving power |
| Forced reduced motion | Reanimated's global reduced-motion setting | all | last containment step under sustained CPU contention |

### Containment

A JS or main thread above 0.9 cores for 2 s, or three long tasks within 5 s, counts as contention. Deferrable work pauses at once, and CPU-side quality is shed one step per 2 s while it lasts. The controller wakes itself when a time-only change is due, because sensors report only changes and a steadily pinned thread would otherwise never be acted on.

### Known limits

- Forced reduced motion reaches animations that start after it is set. Reanimated decides reduced motion when an animation starts, so loops already running continue until their component restarts them (verified in Reanimated 4.7.1 `repeat.ts` and `utilCommon.ts`).
- RN thread names (`mqt_v_js`, `mqt_js`) are matched by prefix and must be confirmed on a device; the diagnostics report the busiest unmatched thread so a new name is found, not guessed.
- The ADPF session reports frame CPU work, not JS work; the JS thread is governed by shedding, not by boosting.
- Not yet built through Gradle or run on a device; shadow mode applies no hardware lever.

### Evidence

| Part | Level |
|---|---|
| Governor and controller, 40 tests including contention, polled memory, hardware levers, failure isolation | G2 |
| Kotlin: estimator and stage golden vectors, display-mode choice, procfs parsing and real CPU attribution on a Linux JVM, 14 tests | G2 |
| Android sources against android.jar 35; Expo binding against an expo-modules-core 58.0.21 signature stub | G1 |
| Mobile TypeScript (executive, port, long tasks) type-checked | G0 |
| Device behaviour | none yet |

## The veteran: knowing this phone as it is now

A veteran lieutenant knows the ground as it is today, not as the map drew it. A phone's specification says what it was sold as; what it can give now depends on its software, its age and its owner. The runtime therefore learns each phone's actual capacity, and relearns it when the phone changes.

### Why the specification sheet is not the phone

| Cause | Mechanism | Source |
|---|---|---|
| A system update | After an OTA, apps are compiled only with the `verify` filter at boot; profile-guided compilation waits for the background job, which runs once a day while idle and charging, and is throttled from thermal status moderate | [AOSP, ART Service configuration](https://source.android.com/docs/core/runtime/configure/art-service) |
| Vendor performance policy | In 2022 Samsung's Game Optimizing Service throttled about 10,000 apps by app identity, not by behaviour; Geekbench delisted four generations of Galaxy flagships | [XDA Developers, 4 March 2022](https://www.xda-developers.com/geekbench-samsung-benchmark-manipulation/) |
| Battery and storage ageing | an aged battery and a nearly full store change what the phone sustains | to measure on device, not assumed |
| The owner's other apps | background services compete for memory and CPU | measured as availability (varying layer) |

Neev's own observation fits this: after updates, his Galaxy A24 now runs better than his Galaxy A52, although the A52 was the stronger phone on paper.

### What the veteran remembers

A per-device profile, stored locally and keyed by the OS build fingerprint:

- frame-cost and stage distributions per screen class;
- how long the phone takes to reach each thermal level under the app's load;
- free-memory levels at which trims, kills and slowdowns occurred, and past exit reasons;
- per-thread CPU baselines (what the JS and main threads normally cost here);
- whether the app is running uncompiled or profile-compiled.

### What it does with it

1. **Relearns after change.** A new build fingerprint marks the profile stale: thresholds return to conservative defaults until enough fresh sessions accumulate.
2. **Expects the post-update slump.** Right after an update, higher CPU cost is expected and is not read as a new device class.
3. **Adjusts within bounds.** Learned values move a threshold only inside a range fixed by the policy version. The rules never change themselves; the facts about the phone do.
4. **Explains itself.** The diagnostics screen shows what the phone has learned and why each value moved.

### Field evidence

Neev's Galaxy A52 and Galaxy A24 and his friends' phones form the first device panel. Each phone runs the same scripted sessions in shadow and active mode, before and after its next system update. To verify before building: whether a Jetpack API reports the app's own compilation state, and whether shipping a baseline profile restores compiled speed after an update.

## Control testing and evaluation

No adaptive behaviour ships on argument alone: each is compared against a control that does not adapt, on the same devices and the same scripted sessions, and judged by outcomes a user would notice.

### Modes

| Mode | What runs | Purpose |
|---|---|---|
| off | nothing adapts; full quality everywhere | the control |
| static | baseline floors only (class, reduce motion, saver) | what a one-time device profile buys |
| shadow | the full allocator decides and logs, applies nothing | measures what it would have done, at no risk |
| closed loop | allocator plus correction loop applied | the treatment |
| minimal | critical and committed only, lowest ladders | the restart mode and a floor for comparison |

Assignment is a deterministic hash of the install id and experiment key (`assignExperiment`, already built). A remote kill switch sends everyone to off; a local switch in the diagnostics screen forces any mode for testing.

### Outcomes

| Outcome | Measure | Better is |
|---|---|---|
| Smoothness | share of frames over deadline; frozen frames over 700 ms | lower |
| Responsiveness | touch to next frame; JS event-loop lag p95 | lower |
| Critical deadlines | breathing timer drift; attendance save time | lower; zero misses |
| Stability | low-memory kills, crashes, ANRs per session hour | lower |
| Heat | highest thermal status reached; time above moderate | lower |
| Energy | battery percent per session hour, uncharged sessions only | lower |
| Experience cost | share of session time with any ornamental lever lowered | lower, at equal outcomes |
| Use | session length, return within 7 days | not worse |

The primary outcome for each experiment is named before it runs. The others are guardrails: a treatment that improves the primary while worsening a guardrail does not ship.

### Device matrix

| Tier | Devices | What it proves | Evidence level |
|---|---|---|---|
| Lab, constrained | Android emulator images at API 28, 29, 31, 34 with 2 GB RAM and 2 cores | the fallbacks work; repeatable comparisons of modes | G2 |
| Lab, real | Galaxy A52 (8 GB, API 34) and Galaxy A24, both Neev's | real FrameMetrics, thermal, trims; how two phones of different age and update history differ | G5 |
| Field panel | friends' phones, as many tiers and vendors as can be borrowed | the veteran profile on phones the team does not own | G5 |
| Replay | captured sessions run through every mode by `replayGovernor` | decisions differ as intended, on real signal streams | G2 |
| Field | consented telemetry from teachers' and students' own phones | outcomes on the real population | R1 |

Captures follow one procedure: release or performance build, no screen mirroring, Perfetto buffer large enough for the whole session, framestats reset before each scripted run, and the device state (battery, temperature, free memory) recorded at start and end.

## Feasibility

The design is feasible with the current stack and no new paid tools; the binding constraint is evidence on low-end devices, not engineering.

### What makes it feasible

- **Every signal in the matrix is a public, documented Android API or a JS-side measurement.** None needs root, special permissions or vendor SDKs.
- **The Expo Modules API already carries native code** through autolinking under continuous native generation, so the module follows the repo rule that native code enters only through config plugins or CNG.
- **The decision layer is pure TypeScript** with replay, so most of the logic is testable on a laptop at G2 before any device is involved.
- **The work is additive.** The existing efficiency, work-admission and visual-budget code becomes adapters, so nothing that works is deleted (the Deletion Veto holds).

### Constraints and risks

| Risk | Effect | Mitigation |
|---|---|---|
| No low-end test phones | thresholds tuned on the wrong device | constrained emulators first; borrow one 2 to 4 GB phone; field telemetry in shadow mode before closed loop |
| Emulators do not throttle or trim like phones | heat and memory paths untested | treat emulator results as G2; require one real low-end capture before closed loop ships |
| Sensing costs what it saves | an idle app wakes to measure | change-only events, slow polling while cool, nothing while hidden; the sensor's own cost is a measured outcome |
| Cost vectors are hard to isolate | the allocator lowers the wrong lever | measure one workload at a time against an otherwise static screen, in replayable scripts |
| Vendor behaviour varies (Samsung, Xiaomi, Transsion) | signals missing or late | every signal has a fallback and a confidence; missing signals hold the baseline |
| Too many quality steps | users notice flicker | slow raises, doubling back-off, at most one lowering per window per account |
| Telemetry on users' data plans | cost to poor users | batched, wifi-preferred, a few kilobytes per day, consented, and itself a deferrable workload |
| Solo maintainer | scope outruns time | phases each end in a working, shippable state |

### What cannot be done

- Control the JS thread's scheduling or Hermes' garbage collector directly. The system can only reduce the work given to them.
- Read CPU frequency or per-core load reliably without root on recent Android. Throttling is inferred from headroom and drift instead.
- Prove outcomes for iOS, which is out of scope until TestFlight is affordable.
- Guarantee results on devices never observed. Field telemetry narrows this but does not close it.

## Implementation plan

Seven phases, each ending in a state that works and can ship; nothing closes the loop on users until shadow data from real phones supports it. Dates are left to you.

Before the pilot on 26 October only the TypeScript parts of phase 1 merge, with every new behaviour behind a flag that defaults to the current behaviour. Native work resumes after the pilot.

| Phase | Deliverables | Acceptance |
|---|---|---|
| 0. Spec | this document; an ADR in `docs/decisions/` amending the governor spec (Expo module instead of Nitro, the economy model) | you sign off the atoms and the classes |
| 1. Demand registry | `workloads.ts` in `@repo/core/governor` with every entry above; an architecture test that fails on undeclared animators, decoders and schedulers; the three idle-cost gates (shimmer, hidden FAB loop, BrandPulse) driven by the existing governor | registry test passes; the idle Self screen draws no frames after 2 s on the A52 |
| 2. Sensing complete | memory, battery, network and storage polling; JS event-loop lag sampler; Hermes heap; past exit reasons; battery temperature and drift as heat fallbacks; a diagnostics screen showing every signal with its confidence | each signal seen on emulator images at API 28, 29, 31 and 34; sensor wakeups per idle minute measured and under a set ceiling |
| 3. Baseline | device class from facts plus a first-run calibration under 1 s; profile stored in MMKV and updated from exit reasons and session history | class stable across five launches; calibration cost measured |
| 4. Allocator | accounts and budgets; cost vectors measured per workload by scripted isolation runs; admission and shedding by class; coupling rules; the governor kept as the correction loop; adapters for `evaluateEfficiency`, `workAdmission`, `visualBudget` | replay suite shows ordered shedding and protected critical work on recorded and synthetic streams; no deletion of working code |
| 5. Modes and telemetry | five modes; remote kill switch in GrowthBook; local override; telemetry sink to PostHog and Observe, batched and wifi-preferred; outcome metrics computed | all five modes selectable and visible in diagnostics; telemetry under a byte budget per day |
| 6. Evidence and rollout | lab comparison of modes on emulators and the A52; one borrowed low-end phone; field rollout in shadow, then closed loop to a small arm, then wider | primary outcome improves with no guardrail worse; graduated-evidence statement in the PR |

Order matters in two places. The registry comes before the allocator, because budgets are meaningless without the demand they divide. Shadow comes before closed loop in the field, because thresholds tuned on the A52 must first be checked against the phones users hold.

### Repository layout

The runtime is named **verger** (the keeper of a sanctuary) and is decoupled from any host app:

- `packages/verger-core/`: the reducer, runtime loop, telemetry, replay, experiments, `defineHost` and the built-in levers. Imports nothing; names no app.
- `packages/verger-android/`: the Kotlin Expo module (sensing, frame estimator, CPU attribution, hardware levers) and its port.
- `packages/verger-react/`: provider, hooks, presence, long tasks, global reduced motion.
- `packages/core/src/governor/`: Gurudevi as the first host: its levers with their declared rules, `GURUDEVI_HOST` and `GURUDEVI_MOBILE_HOST`.
- `apps/gurudevi-mobile/src/runtime/`: `GurudeviVerger`, which mounts the mobile host; not yet in the app tree (pilot freeze).
- `docs/engineering/runtime-performance/`: this design, capture procedure, results per experiment.

### Standing gates for every phase

This is mission-critical software for the people who use it, so every phase passes four gates before it merges. A gate that cannot be met is written down as an open risk, never skipped silently.

| Gate | Question | Required evidence |
|---|---|---|
| Waste | Is the work this phase governs already free of avoidable cost? | the intrinsic check for each workload touched: re-renders, queries, startup work, allocations |
| Hardware | Which devices, API levels and vendor behaviours does this change touch, and what happens where a signal is missing? | the fallback path tested at API 28, 29, 31 and 34; the change's own cost (wakeups, memory, CPU) measured |
| Scaling | Does it hold at 10,000 schools and their teachers' phones: telemetry volume, server load, config fan-out, device diversity? | bytes per device per day; events per million sessions; no per-device server state unless budgeted |
| Telemetry | Can we see in the field whether it works and when it fails? | every decision carries a reason and policy version; an outcome metric named; a kill switch; privacy and data cost stated |
| Critique | Has someone who did not write it tried to break it? | an independent review against this document; findings fixed or recorded with reasons; a graduated-evidence statement (G0 to G5, R1) in the PR |

## Prior art, sources and open questions

### Prior art and what this design takes from it

| Work | Takes | Differs |
|---|---|---|
| Unity Adaptive Performance | indexer and scaler model; levers ordered by bottleneck, then visual impact | games own their render loop; Gurudevi governs non-visual work too |
| `@rbayuokt/expo-adaptive-glass` (MIT) | 500 ms FrameMetrics windows, hysteresis and back-off values | adapts glass only |
| `kagantemizkan/expo-android-glass-view` (Apache-2.0) | a visual consumer with a fallback colour; one lever | no sensing |
| Android ADPF thermal API | status listener, headroom, polling limit | used as one signal among several |
| Android Performance Class | a platform-certified class, API 31+ | absent on most low-end phones, so calibration fills the gap |
| Facebook device-year-class | classifying devices by an equivalent release year | static; this design treats class as a prior only |
| Apollo Guidance Computer executive | priority classes, shedding under overload, restart into a known state | applied to a phone's resource accounts |

### Sources

Opened this session: [StatCounter, Android version market share, Sri Lanka](https://gs.statcounter.com/android-version-market-share/mobile-tablet/sri-lanka).

Opened on 2026-10-21:

- [Android ADPF Thermal API](https://developer.android.com/games/optimize/adpf/thermal): headroom from API 30; a NaN or 0 first value means unsupported; call no more than once every 10 s and from one thread.
- [Using performance class to optimize (Android Developers Blog, 2022)](https://android-developers.googleblog.com/2022/03/using-performance-class-to-optimize.html): performance class is reported only by devices that advertise it; Media Performance Class 12 requires at least 6 GB RAM, so low-end phones report none.
- [Cherry, Apollo 11 descent exegesis (Virtual AGC)](https://ibiblio.org/apollo/Documents/CherryApollo11Exegesis.pdf): the cause and the restart behaviour quoted in the Vision.
- API levels for every signal in the fallback table were checked against `api-versions.xml` in the Android 35 SDK platform: thermal status and listener 29; headroom, exit reasons and low-memory-kill report support 30; performance class and frame deadline 31; vsync timestamp 26; background data status 24.

Repository sources: `packages/core/src/governor/`, `apps/gurudevi-mobile/modules/runtime-sense/`, `docs/engineering/runtime-performance/governor-architecture-spec.md`, and the A52 trace `reports/mobile-performance/2026-10-19T08-35-28-711Z-7b0bfdc5/native.pftrace`.

### Open questions

- Which phones can be borrowed for the low-end tier: 2 to 4 GB, Android 10 to 12?
- Is the breathing guide's animation critical, or only its timing? This sets whether its ladder can reach text only.
- Does upload of an attendance save count as critical, or only the local write?
- What daily telemetry byte budget is acceptable for users on prepaid data?
- Should users see a setting for fidelity (auto, low, high), or should it stay internal?
