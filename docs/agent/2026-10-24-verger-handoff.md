# Verger handoff (2026-10-24)

> **Superseded as the entry point (2026-10-24, end of session):** start with
> `docs/engineering/runtime-performance/verger/playbook/README.md` and the `verger` skill
> (`.agents/skills/verger/SKILL.md`). Gate: `pnpm verger:check`. The notes below are history.

Read this first in any new session working on verger, the adaptive runtime. It carries what
the chat that built it knew. The doctrine, design and ADR hold the reasoning; this file holds
the state, the open items and the next step.

## Read first

0. `docs/engineering/runtime-performance/verger/pipeline.md`: the whole of verger on one page, needed
   against built, requisite variety and affordance. Then `sensing.md` (the starting point) and
   `verification.md` (how evidence is produced), beside it.
1. `docs/engineering/runtime-performance/verger/stage-and-chairs.md`: the build doctrine (a full,
   modular foundation; specific choices are data placed later) and **the purpose: adapt both
   ways inside the envelope**.
2. `docs/engineering/runtime-performance/verger/vision-feasibility-and-plan.md` and
   `lineage-and-recovery.md`: the vision, atoms, plan and prior art (exported from the Claude Doc).
3. `docs/decisions/2026-10-21-adaptive-runtime-resource-economy.md`: decisions D1 to D13.

## Where things are

| What | Where |
| --- | --- |
| Branch | `feat/adaptive-runtime` |
| Pure core | `packages/verger-core`: reducer (`reducer.ts`), activation, policy contract, demand and accounts, controller, recovery ladder, telemetry, `createVerger` |
| Android | `packages/verger-android` (Kotlin Expo module `Verger`; `createVergerAndroidPlatform`) |
| React shell | `packages/verger-react` (`VergerProvider`, hooks) |
| Gurudevi as host | `packages/core/src/verger` (levers, workloads, `GURUDEVI_HOST`, `GURUDEVI_MOBILE_HOST`) and `apps/gurudevi-mobile/src/runtime/GurudeviVerger.tsx` (not mounted) |

## Decisions taken with Neev on 2026-10-24

- Verger is the future; the old governor (`packages/ui/src/context`: Reality, Fidelity,
  visualPolicy, VisualCapabilities, experiencePolicy, visualSafety, realitySignals; and
  `packages/core/src/efficiency` visualBudget, runtimeConditions, workAdmission) is **cut off**,
  signed off under the Deletion Veto, gated by a drift test that proves verger reproduces its
  decisions wherever no live signal exists. SensoryProvider stays (user preferences are inputs).
- Network is sensed natively in verger-android (Data Saver and bandwidth), not via NetInfo.
- Web is a separate `verger-web` platform for Next.js later (not an Expo web module); desktop
  someday. Same core, same port.
- Development builds are a full lab (every layer visible and tunable live, recorded, replayable,
  policies compared); the release preset is an open choice, coarse and configurable later.
- Bidirectional adaptation within the envelope is the purpose; sensing serves it.

## Constraints that still hold

- Pilot on Monday 2026-10-26 runs under a native-code freeze: nothing from this branch merges
  before it, `GurudeviVerger` stays unmounted in the pilot build.
- Commits and pushes on this branch use `--no-verify`, as Neev authorised. The pre-push hook
  fails on an eslint config missing outside his machine; the prepare-commit-msg hook needs
  PowerShell, so on Linux commit with `HUSKY=0` after checking commitlint by hand.
- Report evidence by level (G0 to G5, R1; AGENTS.md section 6). Nothing has run on a phone.
- Working style: atoms before narrative; integrate rather than re-narrate; intended-vs-done
  checklist; independent hostile review before calling mission-critical work done.

## Evidence (2026-10-24)

- verger-core 95/95, Gurudevi host 66/66 (including the property suite and its mutation check),
  verger-android mapping 10/10 (Vitest, G1/G2). See `verification.md` for what each proves.
- The property suite found and fixed two defects in verger-p4 (fail to pass shown).
- Kotlin: 25 JUnit tests on the desktop JVM (Kotlin 2.1.20) over the Android-free sources (G2).
  `VergerSense.kt`, `VergerModule.kt`, `HardwareLevers.kt`, `DeviceFacts.kt` are **not compiled
  since the sensor change**: this cloud environment's network policy denies `dl.google.com`, so
  no `android.jar`. The first Gradle build on the laptop must compile them.

## Built on 2026-10-24 (stage layers)

| Layer | State |
| --- | --- |
| Activate | done: presets (active, shadow, static, lab), precedence, ladder caps, live `configure`, sensors honoured natively |
| Decide | done: `VergerPolicy` contract, `VERGER_POLICY` (verger-p4) unchanged; live `tune`; replay takes any policy |
| Demand and estimate | done as read models: workloads by class, seven accounts with confidence |
| Ladder key | owned by `ladderKey`; unnamed legacy keys migrate on read |
| Judge (loop 2) | outcome ledger: every move judged, `Verger.outcomes()` |
| Verify | `invariants.ts` and the property suite with mutation adequacy |

## Next steps, in order

1. The full sensing layer, in the order in `sensing.md`: network and Data Saver first.
2. Controller and recovery under generated streams (`verification.md`, next).
3. Envelope policy verger-p5 (home, ceiling, floor; compress and expand), beside p4.
4. Self-cost meter and loop 2's rules; session recording and telemetry; the dev lab.
5. Static floors without native code, the drift test, then the cut-off.
6. On the laptop with the phones: first Gradle build, dev client on the A52 and A24.

## Open items

- **Forms adapters drifted from their engine contracts** (outside verger): `packages/core`
  `tsc --noEmit` reports 20 errors in `src/adapters/powersync/forms.adapter.ts` (14),
  `src/adapters/supabase/forms.adapter.ts` (5) and `src/adapters/powersync/__tests__/forms.adapter.test.ts`
  (1): `ExtendedFormField` no longer extends `FormField`, `settings` is now optional, `load` and
  `list` no longer match `FormStorage`. The contracts come from the installed
  `@intuitui-labs/form-builder-engine` (`/ports`, `/schema`). Fix additively against its `.d.ts`,
  as its own change.
- Kotlin sources that import Android are uncompiled since the sensor change (see Evidence).
- From the last review: a `stopped` marker skips the exit check, so a crash during native stop
  is missed; relapses never decay within a ladder key; `@repo/verger-android` looks up the native
  module at import time whatever the kill switch; kill-switch changes after mount wait for the
  next launch.
- Not built: agility metric, battery-temperature and frame-drift heat fallback, baseline
  profiles, user switch for adaptation.
- The ADPF CPU-boost session gets no frame-work reports while the frames sensor is off.

## Found on 2026-10-24, still true

Checked against release notes (not memory):
- RN 0.86: `PerformanceObserver` `event` entries now default to `durationThreshold` 104 ms.
- RN 0.88: no new performance API; the JS scheduler clears pending work when a task throws;
  web-style event dispatching is the default (check `PresenceBoundary` against it).
- Expo Observe (`expo-observe`): field startup, per-route TTI and frozen or slow frames, with
  thermal state and low-power mode; dev and production builds; needs EAS and a new binary.
- The device audit's frozen A52 (1.53 GB PSS, JS thread 86.6%) was a dev build with a route-gate
  render loop: intrinsic waste, not resource scarcity. No release build has been measured yet.
