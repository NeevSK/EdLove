---
title: "Verger: the stage and the chairs"
status: active
created: 2026-10-24
updated: 2026-10-24
owners: [Naveen]
tags: [verger, adaptive-runtime, architecture, doctrine]
---

# Verger: the stage and the chairs

Verger is built as a **stage**: a full horizontal foundation, every layer present, each behind a
contract and each replaceable. The specific choices made on it are **chairs**: which preset a
release ships, which thresholds, which levers, which telemetry vendor, which budget. Chairs are
placed, moved and swapped later, as data or plug-ins, without rebuilding the stage. The vision the
stage serves is in [vision-feasibility-and-plan.md](vision-feasibility-and-plan.md); its lineage
in [lineage-and-recovery.md](lineage-and-recovery.md).

## Rules

1. **No chair is welded to the stage.** Every decision has a default that can be replaced (data,
   or a plug-in behind a contract). A constant buried in logic is a defect.
2. **Every layer is a port.** Platforms (Android now; web for Next.js and desktop later) plug in
   below; hosts (Gurudevi first) plug in above. `verger-core` names no platform and no host.
3. **The stage must carry any dance.** In development builds every layer is visible and can be
   changed while the app runs; every change is an event, so a recorded session replays exactly,
   and two policies can be compared on the same real session.
4. **Chairs are decided by evidence, later.** Building the stage never waits on a chair, and
   choosing a chair never requires changing the stage. Open chairs are listed below, not guessed.

## The stage

| # | Layer | Contract | Swappable unit |
|---|---|---|---|
| 1 | Sense | `VergerPlatform` / `RuntimePort`; each sensor switchable | a platform package |
| 2 | Estimate | signals to resource accounts (cpu, gpu, memory, energy, thermal, network, storage), each with a confidence | estimator per signal |
| 3 | Demand | registry of workloads: class, quality ladder, cost | host manifest |
| 4 | Decide | a versioned policy: rules plus thresholds, from accounts to levels | a policy |
| 5 | Act | actuator adapters: lever consumers, hardware levers, work admission | an adapter |
| 6 | Activate | what runs, precedence, ladder caps, live changes | an activation patch |
| 7 | Observe | telemetry sink, flight recorder, session recording and export | a sink |
| 8 | Learn | experiments, policy versions, replay comparison, the per-phone profile | an experiment |
| 9 | Recover | the recovery ladder | recovery config |
| 10 | Lab | development surface to see and tune every layer | a view |

Activation precedence: build preset, then local override, then remote config; the recovery rung
caps the result; the kill switch is above everything.

## Open chairs (not decided; do not decide them in code)

- The release activation preset.
- Calibrated thresholds (provisional until 2 to 4 GB release-build captures).
- Which levers ship governed in a release.
- Telemetry destinations and the daily byte budget on prepaid data.
- Whether users see a fidelity setting.
- Whether the breathing guide's animation, or only its timing, is critical; whether uploading an
  attendance save, or only the local write, is critical.
