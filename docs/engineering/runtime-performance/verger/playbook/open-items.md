---
title: "Verger playbook: open items and known hazards"
status: active
created: 2026-10-24
owners: [Naveen]
tags: [verger, playbook, risks]
---

# Open items and known hazards

Read before any phase. Mark an item resolved with its commit and evidence; never delete it.

## Unverified on a device (phase F resolves)

- `VergerSense.kt`, `VergerModule.kt` never compiled (no Android SDK in the cloud session).
- Battery temperature assumed in tenths of a degree (`BatterySignals.temperatureC`).
- Reported total memory per phone size: only the A52's (7.3 GiB, 8 GB phone) is measured; the
  4, 6 and 12 GB figures in tests are typical values.
- Every threshold in `DEFAULT_VERGER_CONFIG` is provisional.

## The control layer (model evidence only, G2)

- The simulator's phones are guesses within the range phones show (thermal τ, rise per load,
  throttling onset, status bands, lever effects). Phase F fits them (F6) and reruns the suite.
- **Resolved 2026-10-25 (R7):** `P7_PENDING` removed; the stability suite has no exemptions. Was:
  the low phone's burst gave up too much quality while janking (its remaining levers were the
  costliest). The relief check now judges mid-screen episodes by quality spent, and the simulator
  runs loop 2.
- Mid phone heat chatter of 0.15 per minute at a status boundary: the model's OS status has no
  hysteresis (real HALs do). Measure the real status bands on a phone before acting on it.
- P5's constants are assumptions: `thermalTimeConstantMs` (120 s), `thermalStepMs` (60 s),
  `thermalRecoverMs` (60 s), `thermalPaceMs` (10 min). Phase F measures each phone's time
  constant and how fast its heat readings respond; until then recovery after heat is slow by
  design (7 to 9 minutes in the model).
- **Resolved 2026-10-25 (R6):** gains are kept across launches in the device's profile and fade
  when not measured again. Was: gains learned per session only. Whether real gains are stable
  across sessions is still for phase F to show.
- In touched use most steps publish batched by the gesture hold and are not measured; whether
  real sessions give enough samples for P7 is unknown until phase F.

## Unexplained

- **Resolved 2026-10-25:** the ladder's mutation checks relied on random search to find the broken ladders and occasionally missed; each now pins the sequence that exposes it (commit 2802d75). Was: **one failed run of `packages/core/src/verger` on 2026-10-24** (1 failed of 96), not kept. Every
  run since passed, including 3000 cases per property. If it recurs: keep the full output (the
  fast-check seed and counterexample), pin it, fix it. Never re-run until green.

- **Resolved 2026-10-25:** the ladder model test's coverage check ("every rung was reached")
  failed once because random search never reached rung 2 (output kept in the session's
  scratchpad: `gate-ladder-fail.log`). The invariants held; only coverage missed. A pinned
  example now climbs through rungs 1, 2 and 3 (verified alone with `numRuns: 2`). Rung 0, 4,
  recovery and the fault kinds are reached by every run so far; pin them too if one ever misses.

## Known gaps, by design or deferred

- **Resolved 2026-10-25 (R8):** the recovery ladder review items. Relapses now decay
  (`relapseDecayClean`, 20 clean sessions at rung 0 forgive one); the native module is looked up
  on first use, never at import (a kill-switched launch touches no native code); the kill switch is
  read live (`killed` on `VergerRoot` and `VergerBrowser`, checked on each return to the
  foreground). A `stopped` marker skipping the exit check is kept, by design: `stopped` means verger
  shut its native side down cleanly, so a later crash is code verger no longer runs, and charging it
  to verger would step healthy devices down the ladder.
- The ADPF CPU boost gets no frame reports when the frames sensor is off.
- Web: no battery saver and no metered flag exist in browsers; Battery Status and Network
  Information are Chromium-only; device class is `unknown` where memory is hidden.
- Web has no fidelity setting yet (verger reads `auto`).
- Captive portals now read as offline on mobile (NetInfo `isInternetReachable` false), where the
  old status read only `isConnected`. Intended; watch for complaints.
- Retention scheduler metrics (`collectDeviceContextForMetrics`) still read expo-network's
  metered flag: metrics only, no decision.

## Pre-existing, not verger's (do not fix inside a verger phase)

- `packages/core` forms adapters: 20 type errors (a separate task card exists).
- ui suite: 1 failing test in 2 files; mobile: 20 in 8 files (for example an `expo-image` module
  that does not resolve in the test environment); web: about 30; type errors ui 88, mobile 38,
  web 1. Compare against a stashed baseline before claiming a regression.
- oxlint errors in `useFloorSlideshow.ts`, `ExternalLinkContext.tsx`, `retention-scheduler.ts`
  predate verger's changes.
