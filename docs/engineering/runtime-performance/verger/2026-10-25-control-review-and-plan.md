---
title: "Verger as a control system: what is missing, what is sound, what we build now"
status: active
created: 2026-10-25
owners: [Naveen]
tags: [verger, control, cybernetics, review, plan]
---

# Verger as a control system

Read as a runtime architect and a control engineer, at commit `be7c9a5`, against
[the vision](vision-feasibility-and-plan.md), [lineage and recovery](lineage-and-recovery.md) and
[the hostile review](2026-10-25-hostile-review.md). Three layers: what is missing (base), what is
sound (soft), what we build now (plan). Every claim names its evidence in the code.

## The loop, named

| Control term | In verger |
|---|---|
| Plant | the phone running Gurudevi: frame cost, heat, memory, energy, network |
| Sensors | frame windows (500 ms), thermal status and headroom, battery temperature, trims and polled memory, thread load, long tasks, input delay, event-loop lag, GC share, network, storage |
| Estimator | `estimateAccounts`: seven accounts, each a state and a confidence |
| Controller | the reducer: an indexer ladder (Unity-style), one step down per 750 ms of stress (`downgradeAfterMs`), one step up per 4 s of comfort (`upgradeAfterMs`), doubling back-off to 60 s |
| Actuators | lever levels read by components, the refresh cap, CPU hints, forced reduced motion, work admission |
| Disturbances | screen changes, sync bursts, heat soak, other apps, OS updates |
| Supervisor | the recovery ladder (rungs 0 to 4), kill switch, floors |
| Second-order loop | outcome ledger, unhelpful-lever and flapping rules, self-cost and self-budget |

## 1. Base layer: what is missing (hostile)

1. **No plant model, so no closed-loop evidence.** Every test feeds the controller a fixed event
   stream: replay, the property suite and `comparePolicies` are all **open loop**
   (`compare.ts` says so). Nothing models the phone answering a lowered lever with cheaper frames,
   or heat rising under load and falling with a time constant. Stability, limit cycles,
   overshoot and settling time, the first questions in control engineering, have never been
   measured. p4 against p5 cannot be judged on effects, only on decisions.
2. **Heat is classified without hysteresis.** `thermalLevelOf` (`signals.ts:29`) maps headroom
   to a level by single thresholds (0.85, 0.95, 1.0) and battery temperature likewise (40, 45 °C).
   A reading that hovers at a threshold flips warm and nominal on every sample. Frames have proper
   bands (`stressRatio` 1.25, `comfortRatio` 0.8); heat does not.
3. **No time-scale separation for heat.** Heat moves in minutes; verger raises quality 4 s after
   comfort, and the warm floors (`whenWarm`, `dynamicFloors`) lift **the instant** heat reads
   nominal, bypassing the raise wait entirely. Lower under heat, cool a little, lift everything,
   heat again: a limit cycle whose period is the phone's thermal time constant. The vision's
   "raising is slower than lowering" holds for frames, not for heat.
4. **Control effort is chosen by belief, not by measured gain.** The vision's allocator lowers
   "by greatest saving on the overdrawn account per unit of visual loss". The ladder orders levers
   by declared target and visual impact (`chooseLeverToLower`, `levers.ts:10`); the outcome
   ledger records only a binary verdict (relieved or not) and agility. No lever's actual effect
   (how much cheaper frames got per step) is estimated, so the controller cannot prefer the lever
   that works.
5. **No feedforward.** Known disturbances arrive unannounced: navigation to a heavy screen, a sync
   starting, an image burst. The controller only reacts after a 750 ms stressed window. The
   vision's coupling rules (heat predicts CPU throttling) are absent.
6. **No setpoints beyond frames.** Frames have a target (the frame budget). Heat, energy and
   memory have alarms, not goals: no "finish the school day on one charge", no target temperature
   band. The controller regulates to "not alarmed", which is a bang-bang regime at the alarm edge.
7. **Storage and the data budget have single thresholds too** (`storageLowBytes`), a smaller copy
   of finding 2: a phone hovering at 512 MiB free chatters.

## 2. Soft layer: what is sound

- **Determinism and replay.** A pure reducer; any session replays exactly (`replayRecording`,
  property-tested). Controllers that cannot be replayed cannot be debugged; this one can.
- **Asymmetric, rate-limited action on frames.** Down in 750 ms, up in 4 s, doubling back-off on a
  failed raise, decay after 30 s, a per-lever flapping rule (p5). This is the AIMD shape the
  lineage asks for, with anti-windup by construction (levels are bounded ladders).
- **Hysteresis where it was designed in:** frame bands, the 30 s memory latch, the 60 s network
  settle, the gesture freeze with a bound.
- **The envelope.** Limits, class ceiling, learned home and floor are separate and ordered, checked
  on every published snapshot. Constraints are structural, not tuned.
- **Safety and supervision.** Fail-closed floors, deaf sensors read as unknown, the recovery
  ladder with bounded retries (Rescue Party and Erlang), a kill switch, the self-budget.
- **Observability.** Reasons on every decision, the flight recorder with verdicts, the outcome
  ledger, self-cost, the lab, session recordings: the controller explains itself.
- **A second-order loop that only narrows.** Learned rules remove levers or lengthen waits; none
  lifts a limit. Adaptation of the adapter is conservative by design.
- **Verification depth.** Invariants on every snapshot, generated streams, mutation checks that
  prove the tests bite, model-based tests of the ladder.

## 3. Planning layer: what we build now

All TypeScript, all testable without phones, all inside the freeze. Order is by dependency: the
simulator first, because every fix after it must be shown by it.

| # | Build | Done when |
|---|---|---|
| P1 | **Closed-loop plant simulator** (`verger-core/src/sim/`): a seeded, deterministic phone model. Frame cost from the screen's base cost times each lever's gain per level, scaled by thermal throttling; heat as a first-order system (load heats, time constant τ, ambient); headroom and status from temperature; free memory from cache levers; noise. Scripted sessions: screens, scrolls, sync bursts, idle. Phones: low (3 GB, slow), mid, high, each with a thermal τ. The runner closes the loop: the policy's published levels drive the plant; the plant's readings are the policy's events. | runs any policy on any phone and session, deterministic per seed; its own tests check the plant (cooling, throttling, lever gains) |
| P2 | **Control metrics and closed-loop compare**: time in strain, quality given up, level reversals per minute (oscillation), settling time after a disturbance, peak and time-above-warm heat. `comparePolicies` gains a closed-loop sibling. | p4 and p5 compared on effects, not decisions, across the phone and session matrix |
| P3 | **Closed-loop stability tests**: on every phone and session, bounded reversals (no limit cycle), strain bounded, quality returns after the disturbance ends, heat never left critical while verger runs. Expected to fail first on findings 2 and 3. | the suite runs in the gate; the failures it finds are fixed in P4 and P5, not loosened |
| P4 | **Thermal hysteresis**: enter and exit thresholds per level (headroom and battery temperature), and a minimum dwell before stepping down a level. Storage gets an exit band too. | P3's heat-boundary chatter is gone; unit tests on the bands |
| P5 | **Time-scale separation for heat**: a thermal latch like memory's, so warm floors and heat-relieving raises wait `thermalRecoverMs` of nominal before lifting. | P3's thermal limit cycle is gone; settling time stays within its bound |
| P6 | **Lever gain estimation** (system identification): the outcome ledger measures each compress's effect (frame cost before and after, per step), an EWMA per lever with a confidence; shown in the lab and telemetry. | gains converge to the simulator's true gains within a tolerance |
| P7 | **Gain-guided choice in p5**: among levers that may relieve the bottleneck, prefer the highest estimated gain per unit of quality given up, once confident; the declared order otherwise. | in P2, p5 gives up less quality for equal strain than before; P3 still passes |

| P8 | **Relief check in the frames loop** (found by P1): in the burst session, jank comes from work no lever reduces, yet p4 and p5 walk the whole ladder down (8 steps in 9 s: frame cost 19.6 → 17.7 ms against an 11.1 ms budget) and give up 25–28% of quality for no less jank. Once K steps have not reduced frame cost by a meaningful share within the episode, stop lowering until the stress ends, and say so (the thread-load loop already has this: `contentionExhausted`). | in P2, quality given up in the burst session falls with jank unchanged; P3 passes |

**P1 status (`sim/`):** built. Three phones (low: 3 GB, Android 9, battery temperature only; mid; high,
120 Hz), four sessions (classroom, heat soak, boundary, burst), seeded sensor noise (headroom
jitter, battery temperature in tenths with jitter). First readings: on a heat soak the closed loop
cuts jank from 60% to 0% and peak heat by 4 °C on the mid phone for 30% of quality given up; the
low phone sits at its class floors already (55% given up with verger off), so heat finds nothing
left to lower there; the burst session exposes P8.

**Not now, planned:** feedforward from workload announcements (needs the app to announce work);
setpoints for heat and energy (needs battery and heat curves from phones); coupling rules (need
measured couplings). Each needs phase F's recordings to be more than a guess.

**The honest limit.** The simulator is a model, not a phone. Its evidence is G2 (model-based closed
loop): it can show a controller unstable, and it can show a fix removes an instability the model
has; it cannot show the real phone has the same dynamics. Its parameters are therefore config,
named and sourced, and phase F replaces them with fits to recordings.
