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

## Unexplained

- **One failed run of `packages/core/src/verger` on 2026-10-24** (1 failed of 96), not kept. Every
  run since passed, including 3000 cases per property. If it recurs: keep the full output (the
  fast-check seed and counterexample), pin it, fix it. Never re-run until green.

## Known gaps, by design or deferred

- Recovery ladder review items: a `stopped` marker skips the exit check; relapses never decay;
  the native module is looked up at import time; a kill switch set after mount is not observed
  live.
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
