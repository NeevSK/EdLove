---
title: "Verger: intent, current evidence, and refinement roadmap"
status: active
created: 2026-10-28
updated: 2026-10-28
author: "Codex"
tags: [verger, observability, performance, control, roadmap]
---

# Intent and outcome

Verger is the app's resource supervisor and development laboratory. It should explain what a
person experienced, what work and device conditions coincided with it, what it decided and
why, whether the action helped, and what it cost. It should protect critical work while
adapting optional work and visual quality to the device. The P0 remains a working launch,
correct route, usable screen, completed interaction and actionable recovery when startup fails.

The requested microscope captures the finest supported source data in development, keeps
original timestamps and artifacts, exposes sampling and loss, and joins only clocks whose
relationship has been verified. Nanosecond timestamp units are not proof of nanosecond accuracy
or continuous sampling. A regulator uses the right cadence for each physical process: detailed
frames and interaction events, windows for noisy contention, and slower thermal, battery and
storage changes. Finer observation does not require faster control or more quality steps.

## Intent against current substrate

| Intent | Built or observed | Gap and evidence limit |
| --- | --- | --- |
| Start and route reliably | Essential startup and route/readiness events; a returning local guest reached Self and changed a filter on the A52. | Cold, public, authenticated and recovery journeys still need current-device proof. Screen visibility, route admission and completed action are separate evidence. |
| Observe the whole device | Native Android implementation exists for frame windows, thread load, memory, thermal, power and network; JS long tasks, lag, heap and input timing have adapters. | The A52 isolated shadow session recorded JS-side long tasks, lag, heap, battery and power; native frame/CPU availability and touch completeness were not established for that session. Silent is not proof of unsupported. |
| Understand every decision | Lab shows launch plan, account states and confidence, last action/reason, lever levels, outcomes and reducer self-cost. Launch-plan telemetry now includes actual runtime, rung and reason. | A complete ordered decision history with input values, source freshness/confidence, candidate actions, constraints, outcome and correlation is not established; previous four rung-4 relapses have no retained individual causes. |
| Test and tune | Dev lab can apply validated activation/threshold patches and export a bounded replay recording; opt-in isolated shadow run uses no persistent recovery store. | Shadow cannot prove the effects of applied actions. Isolated shadow cannot prove normal recovery behavior. Controls, restarts, capture integrity and a complete phone recording need end-to-end verification. |
| Compare outcomes | Seeded simulator covers three modeled phones, six scenarios and off/p4/p5; replay and compare operate on recorded inputs. | The plant's parameters are provisional. Replay compares decisions under the same input stream, not physical consequences. Device off/shadow/active experiments and overhead measurements remain open. |
| Join profiler evidence | Local SQLite/JSONL sessions, source status, startup marks and bounded JSON trace imports exist. | Imported traces use separate clocks; original Perfetto/DevTools artifacts are not yet automatically joined to app sessions. A source marked recording is not evidence that every event was received. |
| Keep the observer affordable | Reducer duration, wakeups, events and bounded field telemetry are present. | Native sampler CPU, bridge traffic, storage growth, capture loss and on/off overhead need device measurement; local SQLite has no automatic global quota. |

The detailed mobile source inventory remains in [coverage and limits](../../../../apps/gurudevi-mobile/docs/architecture/2026-10-27-verger-expo-devtools-coverage.md). The [pipeline](pipeline.md) retains historical entries; this roadmap takes precedence for current status where an older table says a subsequently built capability is absent.

## Priorities and acceptance

1. **P0 — real journeys and measurement integrity.** Verify cold/returning, public/guest,
   authenticated and recovery routes as applicable; record bootstrap, route decision, content
   readiness and a completed interaction. Make capture failures non-blocking. Attribute the
   measured Router-to-first-effect gap and repeated shell initialization with a JS profile and
   native trace before changing startup work. Compare a development run and a release-like run
   on the same device; retain exact build, instrumentation and journey details.
2. **P1 — trustworthy sources and clocks.** Report the *resolved* launch, recovery reason,
   platform/module availability, individual enabled sources and actual event counts. Distinguish
   disabled, unavailable, pending, silent, filtered, capped, dropped and failed. Prove touch
   capture with known taps and cancellations; preserve event order, source clock, precision,
   correlation anchors, drift/uncertainty and original artifacts. Align clocks only after a
   measured mapping; surface an unaligned source instead of inventing one.
3. **P1 — decision accountability.** Extend the development timeline with a bounded, replayable
   decision record: triggering event and source, measured values and age/confidence, policy and
   configuration, considered constraints, proposed and applied lever/workload action, reason,
   and outcome when measured. Explain no-action, held, unavailable and failed cases. Preserve
   existing last-reason, ledger and flight-recorder behavior; do not infer lost historical causes.
4. **P2 — graduated sensing and control.** Verify per-frame/deadline and UI/render/GPU stage
   evidence and CPU thread attribution on device; add supported JS/React, memory/GC, network,
   storage and sync spans. Keep raw diagnostic events separate from event-window summaries used
   by the reducer. Record fallback quality, freshness, source resolution and confidence. Only
   add finer control levels or workload levers after measuring that they provide a distinct,
   useful tradeoff and have a consumer; keep thresholds configurable and provisional.
5. **P2 — experiment and comparison.** (2026-10-29: the isolated shadow lab became the exhaustive
   level, `resolveVergerLevel`.) Make dev-only isolated shadow controls and the existing
   activation/tuning, replay and export discoverable with explicit mode and reset semantics.
   Record an immutable session manifest and preserve normal recovery and kill-switch behavior.
   Run identical off/shadow/active journeys on real phones; measure input, frame, CPU, memory,
   energy/thermal and data, quality given up, dropped sources and observer overhead. Shadow is a
   proposal-only control and cannot establish an applied lever's effect.
6. **P3 — validate and refine the controller.** Fit model parameters and confidence to recordings
   across low/mid/high real devices and OS versions. Add disturbances for slow I/O, sync,
   competing work, missing sensors, reloads, thermal lag and storage pressure. Compare before and
   after in the closed-loop matrix, retain stability bounds and test unknown/deaf, hysteresis,
   reversals, critical-work and gesture-hold invariants. The current burst case is a candidate:
   all three arms showed 25% modeled jank while p4/p5 spent quality; investigate unrelievable
   workload attribution before adjusting any control rule.
7. **P3 — operational limits.** Bound development storage and export retention, quantify
   observer CPU/wakeups, and surface quota, write and drop failures. Keep field capture separate,
   privacy-filtered and budgeted. Tune only from controlled evidence; release preset, data
   allowances and device thresholds remain explicit configuration choices.

## Verification contract

- G0 checks types and boundaries; G1/G2 tests source status, clocks, ordering, failure isolation,
  replay and deterministic simulated disturbances; G3 mounts the lab; G4 bundles the app.
- G5 uses an identified device and build, a repeatable journey, known interactions, full source
  manifest and on/off instrumentation comparison. Report counts, losses and what was not captured.
  A synthetic plant result or an imported trace alone is not proof of real device behavior.
- For policy changes, run the simulator before and after, the stability suite and the deep property
  gate without weakening bounds. Report jank, input latency, quality, reversals, heat, recovery and
  self-cost together. Inspect the unified diff and preserve existing recovery and fallback behavior.

## Source receipts and current evidence

- The 2026-10-28 serialized `pnpm verger:check` completed `ALL_PASS=1`; this is G0–G3 toolchain
  and mock/model evidence, not a device certification. An earlier concurrent run timed out in the
  deterministic plant test; its 5-second timeout is retained as a test-reliability concern.
- The A52 development recording showed roughly 10 seconds from Router entry evaluation to the
  first startup effect and a 20.7-second interval from an early JS marker to a Self ready marker.
  It includes development instrumentation and cannot be treated as OS cold-launch TTI.
- An isolated shadow session recorded runtime events, including long tasks and lag, but the most
  recent reported manual touches could not be confirmed in its journal. Native frame and CPU
  completeness remain unverified. The existing Perfetto file is a separate, unaligned artifact.
- [RN DevTools](https://reactnative.dev/docs/react-native-devtools) supplies JS/React/network
  tracks and user timings; [Android system tracing](https://developer.android.com/topic/performance/tracing)
  supplies system-level traces; [Expo Observe SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/observe/)
  supplies supported startup, route and custom event metrics. These complementary sources do not
  imply automatic access to every profiler panel or every request.
