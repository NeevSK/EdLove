---
name: verger
description: "Use before any work on verger, the adaptive runtime (packages/verger-*, packages/core/src/verger, GurudeviVerger, GurudeviWebVerger, visual capabilities, wallpaper, online status, background sync admission, the control layer and its closed-loop simulator). Loads the rules, the one-command gate and the phase guides."
---

# Verger: rules for agents

Verger is the one regulator for Gurudevi on every platform: it senses the device, decides what
each part of the app may spend, and publishes a snapshot that everything else reads (visuals,
wallpaper, online status, background work). The old governor is retired; never reintroduce it.

## Before you change anything

1. Read `docs/engineering/runtime-performance/verger/playbook/README.md` fully (rules, workflow,
   the nuances that trip agents), then the guide for your phase in the same folder, then
   `playbook/open-items.md`.
2. Run `pnpm verger:check`. It must print `ALL_PASS=1` before you start and before every commit.

## The rules in one breath

- Commit only on `ALL_PASS=1`; never weaken, skip or delete a test; never delete working code
  without Naveen's sign-off.
- No `any`, no `as unknown as`; one source per threshold (`DEFAULT_VERGER_CONFIG`); verger-core
  stays pure (no React, React Native, Expo, browser or Node APIs; time is injected).
- The reducer names no lever; rules live on lever and workload declarations.
- Unknown is never a limit. Metered is home. Weak links wait for optional data only. Critical
  work (attendance) is never gated.
- App events go through `Verger.dispatch`; device readings taken in JavaScript go through
  `Verger.signal` (native readings win while verger runs).
- No providers: hooks read the bound verger; shells (`VergerRoot`, `VergerBrowser`) bind it.
- In code a higher lever **level** is **less** quality; "floor" in code is a quality ceiling.
- Do not decide open chairs (release preset, calibrated thresholds, budgets); make them config.
- No paid services (Maestro CLI and Stryker locally only).
- Report evidence as level (G0 to G5), suite, count, and what it does not prove.
- A change to how verger decides (heat, waits, the ladder, lever choice, the ledger) is shown in
  the closed-loop simulator before and after (`pnpm --filter @repo/verger-core simulate`); the
  stability suite's bounds are never loosened. Read `playbook/P-control.md` first.

## Where things are

- Tracker: `docs/engineering/runtime-performance/verger/pipeline.md`
- Packages and data flow: `docs/engineering/runtime-performance/verger/everywhere.md`
- Doctrine: `stage-and-chairs.md`, `second-order-loop.md`, `verification.md` in the same folder.
- Control layer: `2026-10-25-control-review-and-plan.md` (missing, sound, P1 to P8),
  `sim/2026-10-25-baseline.md` (the matrix before and after), `playbook/P-control.md`;
  code in `packages/verger-core/src/sim/`.
