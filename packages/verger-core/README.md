# @repo/verger-core

Verger is an app-level resource supervisor, subordinate to the operating system: it senses
pressure, sheds work in a declared order, recovers when the pressure passes, and reports every
decision. This package is the host-neutral decision layer: a pure reducer, the runtime loop,
telemetry, replay and experiment assignment. It imports nothing and names no app.

A host describes itself with `defineHost({ name, levers, config })`. Each lever declares its
own rules (`requires`, `whenHidden`, `whenIdle`, `whenWarm`, `actuator`); the reducer applies
the rules and never refers to a lever by name. Built-in levers (`VERGER_REFRESH_CAP`,
`VERGER_GLOBAL_MOTION`) are applied by the platform packages.

- `@repo/verger-android`: sensing and hardware levers (Expo module).
- `@repo/verger-react`: provider, hooks, presence, long tasks, global reduced motion.

`src/host.test.ts` holds the boundary: no host name or host lever id may appear in the source.

## Modules

| Module | Role |
| --- | --- |
| `activation.ts` | What may run: sensors, static or closed loop, reduce and grow, hardware, per-lever apply, shadow or off; presets, precedence, ladder caps |
| `policy.ts` | The `VergerPolicy` contract; `VERGER_POLICY` (verger-p4); the ladder key format |
| `governor.ts` | verger-p4's rules: floors, the indexer, contention, outputs |
| `demand.ts` | The demand registry (workloads by class) and the seven resource accounts with confidence |
| `outcomes.ts` | The outcome ledger: every move judged (relieved, held, withdrawn, agility, quality cost) |
| `invariants.ts` | Verger's invariants as checks over snapshots, for tests, recordings and the lab |
| `controller.ts`, `verger.ts` | The runtime loop and the crash-only launch |
| `recovery.ts`, `session.ts`, `flightRecorder.ts`, `quality.ts`, `telemetry.ts` | The ladder, session reports, the recorder, quality cost, telemetry |

Design and status: `docs/engineering/runtime-performance/verger/` (start with `pipeline.md`).
Verification: `verification.md` there; the property suite runs in `packages/core/src/governor/verger.invariants.test.ts`
on a real host.
