---
title: "ADR: Adoption of XState v6 Alpha and @xstate/effect with Effect v4 Runtime"
status: "accepted"
created: 2026-10-26
updated: 2026-10-26
author: "Naveen"
scribe: "Antigravity"
tags: [adr, xstate-v6, effect-v4, statecharts, architecture, actors]
---

# ADR: Adoption of XState v6 Alpha and @xstate/effect with Effect v4 Runtime

## 1. Context & Problem Statement

The Polymath monorepo requires deterministic state orchestration across its role-based domain experiences:
1. **Multi-Step Onboarding Journeys**: Institutional setup (Principal), student invitation claims, and role transitions (Day 0 $\rightarrow$ Day 1 $\rightarrow$ Day N).
2. **Somatic Rhythmic Cycles**: 4-phase box breathing (Sanctuary Pulse) with coordinated haptics, audio, and interruption handling.
3. **Offline Outbox & Conflict Resolution**: Staging attendance, batch cryptographic signing, and retry queuing.

Previously, `xstate@5.33.3` was declared in `apps/gurudevi-mobile` and `packages/ui` but had **zero production imports** across the codebase. A mobile state architecture audit had warned against "blanket actor rollouts" to prevent wholesale replacement of PowerSync (replicated database) or TanStack Query (server cache), which led to artificial paralysis where even textbook statechart flows were modeled as brittle boolean flags and `useState` sprawl.

Meanwhile, upstream Stately AI released **`xstate@6.0.0-alpha.70`** and **`@xstate/effect@1.0.0-alpha.9`**, which fundamentally modernize statechart authoring:
- Native schema-first architecture supporting **Zod v4** via Standard Schema.
- Plain JavaScript transition functions returning context patches (`({ context, event }) => ({ target: 'ready', context: { ... } })`), eliminating legacy DSL wrappers (`assign()`, `cond`, `and()`, `or()`, string targets).
- Direct peer dependency on **`effect: ^4.0.0`**, matching our monorepo's active **`effect: ^4.0.5`** pin.
- Zero runtime dependencies, zero native C++/JSI/TurboModule footprint, and native React 19 concurrent safety via `useSyncExternalStore`.

---

## 2. Decision

We **purge XState v5 legacy conventions** and adopt **`xstate@6.0.0-alpha.70`** and **`@xstate/effect@1.0.0-alpha.9`** across the platform spine (`@repo/core`), mobile (`apps/gurudevi-mobile`), and UI primitives (`packages/ui`).

### 2.1 Package Alignments

| Package | Previous Version | New Active Version | Purpose |
| :--- | :--- | :--- | :--- |
| `@repo/core` | *(none)* | `xstate@6.0.0-alpha.70`<br>`@xstate/effect@1.0.0-alpha.9` | Platform spine: Role-Journey statecharts, Effect-TS actor services, snapshot persistence |
| `apps/gurudevi-mobile` | `xstate@^5.33.3` | `xstate@6.0.0-alpha.70` | Mobile entry shell, native journey execution, somatic rhythm overlay |
| `packages/ui` | `xstate@^5.33.3` | `xstate@6.0.0-alpha.70` | UI tokenized state machines |

---

## 3. Rationale & Empirical Findings

### 3.1 Grounded Substrate Verification
We verified `xstate@6.0.0-alpha.70` and `@xstate/effect@1.0.0-alpha.9` against the monorepo's active toolchain:
- **TypeScript 7.1.0-beta (`tsgo`)**: Compiled with **Exit: 0** and zero type errors.
- **Node.js v24.22.1**: Executed transition functions, context updates, and snapshot restores with 100% fidelity.
- **Zod v4.6.7**: Integrated seamlessly into `setup({ schemas: { context, events } })` via Standard Schema.
- **Zero Native Risk**: Pure JS/TS implementation with no native C++ headers or JSI bindings, eliminating `SIGABRT` crashes or Fabric layout stalls.

### 3.2 Elimination of Legacy v5 DSL Slop
XState v6 enforces cleaner, idiomatic JavaScript:

```typescript
// ❌ PURGED (v5 legacy DSL wrappers)
on: {
  SET_NAME: {
    target: 'domain_claim',
    actions: assign({ schoolName: (_, e) => e.name }),
    guard: and(['isValidName', not('isReserved')])
  }
}

// ✅ ADOPTED (v6 plain transition function + Zod schemas)
on: {
  SET_NAME: ({ context, event }) => {
    if (!isValidName(event.name) || isReserved(event.name)) return undefined; // Clean guard rejection
    return {
      target: 'domain_claim',
      context: { schoolName: event.name }
    };
  }
}
```

### 3.3 Direct Effect v4 Synergy
`@xstate/effect` connects Effect v4 fibers and typed domain errors directly to XState actors via `createEffectLogic` and `setupEffect`. An actor can invoke an Effect workflow without clunky promise wrapping:

```typescript
import { createActor, setup } from 'xstate';
import { createEffectLogic } from '@xstate/effect';
import { Effect } from 'effect';

const schoolProvisionWorkflow = createEffectLogic((event: { schoolName: string }) =>
  Effect.gen(function* () {
    const client = yield* SanctuaryApiClient;
    return yield* client.provisionSchool(event.schoolName);
  })
);
```

---

## 4. Architectural Boundaries & Guardrails

To prevent "state machine bloat" and maintain our Anti-Slop standard:

1. **Statechart vs. KV State**:
   - Simple scalar booleans or counters remain backed by `StorageManager` / `useScaffoldDismissal`.
   - XState is reserved for workflows with: (a) $\ge 2$ ordered states, (b) asynchronous error/cancellation branches, or (c) multimodal timer synchronization.
2. **React 19 Concurrent Integration**:
   - Zero installation of `@xstate/react`. React 19 binds to actor snapshots via standard `useSyncExternalStore`.
3. **Snapshot Envelope Invariant**:
   - All snapshots written to `StorageManager` must carry a versioned envelope `{ version: 1, snapshot }`. On schema mismatch, the storage manager safely resets to the initial state without crashing.

---

## 5. Consequences & Next Steps

- **Positive**: Complete type safety with Zod, native Effect v4 integration, crash-proof pause & resume, and elimination of legacy v4/v5 DSL wrappers.
- **Negative / Risks**: Pre-release alpha status (`6.0.0-alpha.70`). Guarded by pinning exact versions (no `^` floating ranges) and comprehensive boundary unit tests.
