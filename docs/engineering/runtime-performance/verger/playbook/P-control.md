---
title: "Verger playbook: the control layer and the closed-loop simulator"
status: active
created: 2026-10-25
owners: [Naveen]
tags: [verger, playbook, control, simulation]
---

# The control layer (P1 to P8)

Read this before changing **how verger decides**: thresholds, waits, the ladder, heat, the frames
loop, lever choice, the outcome ledger. The why is in
[the control review and plan](../2026-10-25-control-review-and-plan.md); the numbers are in
[the simulator baseline](../sim/2026-10-25-baseline.md).

## What exists

| Piece | Where | What it does |
|---|---|---|
| Plant model | `packages/verger-core/src/sim/plant.ts` | Three phones (low, mid, high): frame cost, lever effects, first-order heat with throttling, OS status and headroom, battery temperature, sensor noise. Every parameter is named for phase F to replace. |
| Closed loop | `sim/closedLoop.ts` | `runClosedLoop`: the policy's published levels drive the plant; the plant's readings are the policy's events. Sessions: classroom, heatSoak, boundary, burst, identify. Seeded and deterministic. |
| Control metrics | `sim/metrics.ts` | jank, quality given up (and while janking), flaps (30 s), slow reversals (5 min), heat changes and chatter, peak heat, time hot, settling. `compareClosedLoop` runs arms side by side. |
| Stability suite | `sim/stability.test.ts` (in the gate) | Every phone, session and an edge session per phone (seeds 1 to 3), p4 and p5 against verger off. |
| Matrix | `pnpm --filter @repo/verger-core simulate` | The table in the baseline doc. |
| Thermal hysteresis (P4) | `reducer.ts` `holdThermal` | Heat rises at once; steps down past an exit band held for `thermalDwellMs`. Lowering acts on the raw reading; relaxing waits on the held one. |
| Relief check (P8) | `reducer.ts` `onFrameWindow` | After `frameReliefSteps` lowerings that closed less than `frameReliefGapShare` of the gap to the budget, the frames loop stops until frames are back near budget. |
| Gain estimation (P6) | `reducer.ts` `probeOf`, `measureGain` | One sample per single-step published lowering; `snapshot.gains`; shown in both labs. |
| Gain-guided choice (P7) | `reducer.ts` `byMeasuredGain` | p5 only: skips confidently useless levers, prefers relief per unit of quality. |
| Heat trend (R1) | `reducer.ts` `thermalProjected`, `thermalActing` | Slope over the trend window projects heat ahead; tightening only; `snapshot.thermalProjected`. |
| Heat time-scale separation (P5) | `reducer.ts` `heatRecovering`, `heatPacing`, `heatStepReady`, the pacing block in `snapshotOf` | Latch after heat, then a rate-limited climb gated on the heat slope's projected steady state. |
| Proportional lowering (R2) | `reducer.ts` `lowerProportionally`, `confidentGain` | p5: up to `maxStepsPerAction` steps when measured gains say one is not enough. |
| Screen annotations (R3) | `screen` event; `reducer.ts` `onScreen`; `useScreenAnnouncement` (verger-react); `screenNameOf` (core/verger) | A new regime per screen; transitions are not stress. |
| Screen memory (R4) | `reducer.ts` `onScreen`, `screenMemory` | p5: measured, useful pressure replayed on return. |
| Pressure causes | `reducer.ts` `pressureCause`, `releaseCause` | Each lowering remembers the sensor that caused it; a deafened sensor takes its lowering with it. |

## Rules for this layer

1. **Any change to a decision rule is shown in the closed loop before it is committed.** Run
   `pnpm --filter @repo/verger-core simulate` before and after (stash to get "before") and put
   both in the commit message or the baseline doc.
2. **The stability bounds are never loosened to pass.** A failure is a fix, or a measurement
   that was wrong (then say so and show the old form still passes everything it covered).
   Exemptions are named sets with the plan item that removes them (`P7_PENDING`).
3. **Tightening acts on the reading, relaxing waits.** Rising heat, stress and pressure apply at
   once; lowering stops the moment the cause eases; raises, floors and admission wait out the
   dwell. A rule that keeps lowering through a dwell is overshoot.
4. **Every new wait is a timed change.** Add its end to `nextTimedChangeAt`, or a quiet phone
   never wakes to apply it.
5. **The ledger judges what the user felt.** If a rule delays a visible effect (a dwell, a
   gesture hold), the outcome ledger's windows and attribution must account for it.
6. **Model evidence is G2.** It shows a controller unstable on the model, or a fix removing a
   model instability. It never shows a real phone behaves so.

## Nuances that tripped the work (read all)

- **The gesture hold batches steps.** In touched sessions (`touching: true` taps every second)
  lowerings wait up to `gestureFreezeMaxMs` and publish together. Gain probes rightly drop such
  batches, so gains are learned mostly in untouched use (the `identify` session).
- **`snapshot.pressure` is raw, `levels` are held.** During a gesture hold the loop's pressure is
  already up while the level is not. Compare levels for what the user saw (the ledger bug fixed in
  `eb7fc8b` came from comparing pressure).
- **The first reading is not a change.** Metrics skip transitions out of `unknown`.
- **A demand jump is not a lever's effect.** Frame load is smoothed only within one frame state.
- **Heat following load is not chatter.** `thermalChatterPerMinute` counts only changes the true
  temperature does not explain (moved under 0.5 °C).
- **Ambient sleep is the baseline when nobody touches.** A session that opens with a disturbance
  measures settling against a state before idle; open with a calm stretch.
- **One noisy step is not evidence.** `frameReliefSteps` 1 was tried: heat-soak jank on the high
  phone went from 0 to 55%.
- **Load-driven sessions never show heat leading.** Heat from outside the app (the sun session,
  `ambientC` on a segment) is the disturbance that does; add such a disturbance before judging a
  heat rule.
- **The model's status must agree with its headroom.** It once reported LIGHT at headroom 0.65,
  which made every headroom-based rule disagree with the status-based level.
- **A three-point slope is noise.** Projected over a time constant it decides at random; give a
  gate a minute of readings.
- **One lowering given back is not a cycle.** Slow reversals count a reversal of a reversal.
- **Choose from what is published.** A lever held at its cheapest by a dynamic floor (ambient
  sleep, warm floors) has nothing to give; choosing it spends a step on nothing.
- **Steps down are selected by noise.** Measure gains on steps given back too; never trust a gain
  measured only on the windows that triggered the step.
- **A controller cannot tell its own effect from a change of screen unless told.** Announce
  screens (R3); in the simulator, name segments' screens.
- **Memory must not freeze guesses.** Replay only what was measured to help.
- **Evaluate the whole system.** The simulator runs loop 2 (the outcome ledger and its findings)
  as the launcher does; a policy judged without its own second loop is judged wrongly.
- **Stress on arriving and stress mid-screen are different disturbances.** The first is the
  screen's weight (levers help); the second is work the app does (they rarely do). The relief
  check spends quality only on the second's budget.
- **Deep runs find what 300 cases do not.** Three pre-existing bugs (shadowed decisions published
  through a sensor switch-off or a decide switch) surfaced only at `VERGER_RUNS=3000`: run it for
  every policy change, and pin what it finds.
- **The model's OS status has no hysteresis of its own.** Real thermal HALs do; the mid phone's
  residual chatter (0.15 per minute) is that pessimism.

## Adding a session or a phone

Add it to `SIM_SESSIONS` or `SIM_PHONES` with a comment saying what it represents and where its
numbers come from. It joins the stability suite automatically; if a bound fails, that is a
finding: trace it (`runClosedLoop` ticks, levels per change) before deciding it is the model's.

## What is next here

Phase F: fit `SIM_PHONES` to recordings (thermal τ, rise per load, throttling onset, status bands
and their hysteresis, lever effects from `snapshot.gains` on real use), then rerun the suite. See
[F-phones.md](F-phones.md), F6.
