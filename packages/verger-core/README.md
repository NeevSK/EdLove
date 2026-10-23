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
