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

## The purpose: adapt both ways, inside the envelope

Sensing is not the point; it is how verger knows when to move. The point is that each part of
the app spends what this phone can give **now**: it **compresses** under pressure and
**expands** when resources allow, in both directions, within limits it never crosses. Every
layer below exists to serve this.

For each lever, on this phone, at this moment, verger keeps an **envelope**:

| Atom | Meaning | Set by | Moves |
|---|---|---|---|
| **Limit** | the best quality allowed: never exceeded | the user (fidelity, quiet mode), accessibility (reduce motion), the OS (battery saver, Data Saver), the device's capabilities, the activation preset | when any of those change |
| **Ceiling** | the best quality this phone has earned: expansion stops here | the policy's bound for the device class, raised by growth across sessions | up slowly with proving sessions; down at once on strain |
| **Home** | where the lever starts and settles on this phone | the device class and the baseline profile (what this phone, on this build, sustained before) | learned across sessions; relearned after a system update |
| **Floor** | the worst quality allowed | the work's class: critical work never below its essential level, committed work never removed | fixed by the registry |

Within a session, **compress** moves from home toward the floor, in class order (ornamental,
then deferrable, then committed) and only for the resource under strain. **Expand** moves from
home toward the ceiling, one step at a time, only while the relevant accounts are ample with
enough confidence, and is withdrawn at the first strain. Cut fast, return slow, probe gently
(the shape of TCP congestion control). Across sessions, the home and ceiling learn the phone; an
OS update makes them stale.

Rules of the envelope:
1. The limit is never crossed, in either direction, by any policy or learning.
2. Expansion needs evidence (ample accounts with confidence); missing signals mean holding, never
   guessing upward.
3. Every move, in either direction, records its account, signal, rule and policy version.
4. Quality given up and quality gained are both reported beside the performance they bought.

The envelope is the first loop. Verger also watches its own adapting (what it costs, whether
each move worked, what it gave up) and changes itself, down to switching itself off where it
does not pay: the second loop, in [second-order-loop.md](second-order-loop.md). Telemetry is
how it sees.

Where the code stands (2026-10-24): policy verger-p4 compresses and returns only to where the
phone started; growth relaxes only the low-memory floor across sessions. Home, ceiling and
in-session expansion are the next policy (verger-p5), built beside p4 and compared on the same
recordings before it becomes the default.

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
- What a metered network should mean for Gurudevi, where most teachers are always metered (today:
  nothing by default), the daily data budget, and whether large optional downloads wait for Wi-Fi
  or a cheap night window.
- Whether the breathing guide's animation, or only its timing, is critical; whether uploading an
  attendance save, or only the local write, is critical.

Placed (2026-10-24, from the drift test): **the hardware is the ceiling.** Phones are classed by
reported memory, low below `lowCapacityBelowBytes` (5 GiB: 4 GB phones and below), mid below
`midCapacityBelowBytes` (9 GiB: 6 and 8 GB), high above; each lever declares what it gives up on
a mid phone (`whenMidCapacity`), and a phone earns quality back by measurement. **Weak links
wait:** optional data stops on a slow link (`slowNetworkKbps`) and for `networkSettleMs` after the
network returns (`whenSlowNetwork`). The values are chairs, provisional until phones are measured.
