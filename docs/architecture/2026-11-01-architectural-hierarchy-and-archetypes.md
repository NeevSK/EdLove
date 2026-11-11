---
title: "Canonical 7-Tier Architectural Hierarchy & Archetype Invariants"
status: "active"
date: "2026-11-01"
updated: "2026-11-11"
author: "Antigravity Pair Programming"
tags: [architecture, clean-architecture, hexagonal, archetypes, tiers, boundaries]
---

# Canonical 7-Tier Architectural Hierarchy & Archetype Invariants

## 1. Executive Purpose: Graph Topological Depth vs. Architectural Tiers

A fundamental architectural flaw in naive dependency graph analysis is equating **Graph Topological Depth** with an **Architectural Tier**:

- **Topological Depth ($depth = 1 + \max(depth_{child})$)**:
  Measures purely the longest unweighted import path from leaf nodes.
  - If `user.schema.ts` imports `identity.schema.ts` which imports `capacity.schema.ts`, the schemas get smeared across **Layer 0, Layer 1, and Layer 2**.
  - A UI `<Spinner />` has zero internal imports and gets assigned to **Layer 0 (Bedrock)**.
  - A concrete database adapter (`supabaseEntitlement.adapter.ts`) imports a Drizzle database proxy that imports slices and stores, pushing the adapter to **Layer 10**!
- **Architectural Tier (Hexagonal / Clean Architecture)**:
  Measures the **semantic role, stability, and invariant authority** of a file.
  - All schemas are **Tier 0 Contracts**, regardless of whether one schema extends another.
  - All ports are **Tier 1 Boundary Interfaces**, regardless of whether they import a schema.
  - All adapters are **Tier 3 Infrastructure Implementations**, and MUST NEVER be directly imported by application stores or UI hooks.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CANONICAL 7-TIER ARCHITECTURAL HIERARCHY                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [Tier 6: Presentation UI]          (13 files)  Components, Prompts, Guards, Buttons   │
│         │                                                                              │
│         ▼                                                                              │
│  [Tier 5: Application Facades]      (1 file)    useSanctuaryFeature (Client Hooks)     │
│         │                                                                              │
│         ▼                                                                              │
│  [Tier 4: State Stores]             (7 files)   useFeatureStore, useEntitlementStore.. │
│         │                                                                              │
│         ├──────────────────────────────┐                                               │
│         ▼                              ▼                                               │
│  [Tier 2: Pure Domain Logic]   [Tier 1: Ports]  sanctuaryFeature.ts, entitlement.port  │
│         │                              ▲                                               │
│         │        implements            │                                               │
│         └─────────────── [Tier 3: Adapters]     database.ts, supabaseEntitlement       │
│                                        │                                               │
│                                        ▼                                               │
│  [Tier 0: Contracts & Schemas]      (16 files)  capacity.schema.ts, Identity.ts        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The tiers and what each may import (enforced)

The rules below are data in `tooling/architecture-tiers.mjs`, checked by
`node scripts/audit-archetype-violations.mjs` (one feature tree, or `--scope packages/core/src`), and
ratcheted in `tooling/ratchet.json` (`tierImportViolations`, `unplacedFiles`, `passThroughFiles`), so
the counts can only go down. The /architecture views draw these tiers, not import depth: depth
only measures the longest chain and says nothing about what a file is allowed to be.

| Tier | What it is | May import | Why |
| --- | --- | --- | --- |
| **0 Contracts (bedrock)** | Schemas, types, constants, error classes, format checks they are built on | Tier 0, and pure libraries (zod, `effect` Schema) | Everything else depends on it, so it depends on nothing that changes for other reasons. No I/O, React or platform |
| **1 Ports** | Interfaces and Effect service tags: what the outside world must provide | Tier 0 | A port states a need. It holds no logic, or callers end up importing a port to reach a function |
| **2 Domain** | Pure decisions and calculations | Tiers 0 and 2 | Pure code takes data, not services. A domain file importing a port is either orchestrating I/O (so it isn't domain) or reaching for logic that sits in the wrong file |
| **3 Adapters** | Real I/O implementing ports (Supabase, PowerSync, storage, drivers, crypto) | Tiers 0–3 | The only place untrusted data is decoded. Never reads application state; anything it needs from the session is passed in or comes through a port |
| **C Composition root** | Where adapters are bound to ports: `effect/Layers.ts` (async Effect ports, adapters loaded on first use), `effect/AppRuntime.ts` (the runtime and `callPort`), `effect/bindings.ts` (what state needs synchronously: persist storage, subscriptions, session scope, event bus, breadcrumbs) | Tiers 0–3 and C | The single place that knows which adapter backs which port, so nothing else has to |
| **4 State** | Zustand stores and their slices, state machines | Tiers 0, 1, 2 and the runtime | Holds already-validated snapshots. Reaches I/O only through ports run on the runtime. A store imports its own slices, never another store |
| **5 Application hooks** | What screens call; composes state and domain | Tier 0 types, Tiers 2, 4 and 5 | Hooks compose hooks. No ports, adapters or schema parsing on render |
| **6 Presentation** | Components | Tier 0 types, Tiers 5 and 6 | Screens ask hooks; they never read stores or domain files directly |

Also enforced:

- **`import type` downward is always allowed.** Types are erased at runtime, so they create no coupling at run time; an upward type import is still a violation.
- **Schema parsing happens only in Tiers 0, 3 and C.** `JSON.parse` doesn't count; it deserialises, it doesn't validate.
- **No pass-through files.** A file that only re-exports or renames is a false chain. The exception is an entry point a package declares in `package.json` `exports`.
- **Outside packages per tier.** For example, Tiers 0–2 may not use React, Zustand, XState, Supabase, PowerSync, MMKV or Drizzle.
- **A file's folder states its tier.** A file whose folder doesn't is either `UNPLACED` (a finding) or has an entry in `PLACEMENTS` with its proper home, which is a move still to make.

### How state reaches the outside world

1. **Asynchronous work goes through a port.** The port is an Effect service tag in Tier 1, for example `EntitlementPort` or `PermissionSnapshotPort`. `effect/Layers.ts` binds it to its adapter with a dynamic `import()`, so the adapter's database and session chain doesn't load with every module that imports the runtime. State calls it with `callPort(Port, (port) => port.method(...))` from `effect/AppRuntime.ts`, and a rejection keeps the adapter's own error.
2. **Synchronous needs come from `effect/bindings.ts`.** Zustand persist storage, a subscription that returns its unsubscribe, the current session scope: state needs these synchronously, and Effect may not run at import time, so they are plain values bound once to their adapters.
3. **Checking happens in the adapter.** Anything read back from storage or the network is untrusted. The adapter decodes it, and state gets typed data or a verdict (for example `missing`, `rejected` with a reason, or `valid`).

Done this way: the entitlement store and query, the feature-flag store, the permission-decision store, and the perspective and auth stores' storage, event bus and breadcrumbs.

## 3. The three violations found on 2026-11-01

Kept for history. Status on 2026-11-11: violation 3 is fixed (the hook no longer reaches into the port; the pure entitlement functions moved to `logic/permissions/entitlement.ts`). Violations 1 and 2 remain and are counted by the audit.

Our audit revealed three distinct categories of architectural drift:

### Violation 1: Adapter Direct Coupling (Dependency Inversion Violation)
- **Rule**: High-level modules and State Stores MUST depend on **Ports (Tier 1)**, never directly on **Concrete Adapters (Tier 3)**.
- **Codebase Reality**: Found **11 direct couplings** where Stores directly import concrete adapters:
  1. `useEntitlementStore.ts` $\rightarrow$ imports `SupabaseEntitlementAdapter` directly from `packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts`.
  2. `useCedarDecisionStore.ts` $\rightarrow$ imports `getDrizzleDB` directly from `packages/core/src/adapters/powersync/database.ts`.
  3. `useAuthStore.ts` $\rightarrow$ imports `authProfileStorage` directly from `packages/core/src/lib/authProfileStorage.ts`.
  4. `featureFlag.factory.ts` $\rightarrow$ imports `GrowthBookFeatureRolloutAdapter` directly from `packages/core/src/adapters/feature-rollout/`.
- **Architectural Consequence**: Swapping or mocking an adapter requires rewriting stores. Tests cannot run without the concrete adapter present.

### Violation 2: Runtime Schema Parsing in Application Hooks
- **Rule**: Application Hooks (Tier 5) are React rendering lifecycle consumers. They should consume pre-resolved, typed snapshots from State Stores (Tier 4). They MUST NOT parse Zod schemas on every render.
- **Codebase Reality**:
  - In `useSanctuaryFeature.ts` (lines 104 and 165):
    - `CapacitySchema.safeParse(user?.capacity)`
    - `UserContextSchema.safeParse(rawContext)`
- **Architectural Consequence**: CPU waste, unnecessary import of large Zod schema validators into client UI bundle, and failure of the Store to provide a canonical validated state snapshot.

### Violation 3: Chain Leapfrogging (Hook $\rightarrow$ Port Bypass)
- **Rule**: If a State Store exists for a domain seam (e.g. Entitlements), client UI hooks must query the Store. The Store orchestrates the Port.
- **Codebase Reality**:
  - `useSanctuaryFeature.ts` imports `useEntitlementStore` to read raw entitlements, but then reaches around the store to import `resolveScopedEntitlement` from `entitlement.port.ts` directly!
- **Architectural Consequence**: Duplicated resolution logic across multiple consumers, bypassing store caching.

---

## 4. Remediation Standard: The Pristine Architectural Seam

For every feature domain (e.g. Entitlements, Feature Flags, Perspective, Auth), the call chain MUST flow strictly as follows:

```
[Presentation UI]
       │
       ▼ (calls)
[Hook: useSanctuaryFeature]
       │
       ▼ (reads selector: s.hasAccess(subject, action))
[Store: useEntitlementStore]
       │
       ▼ (calls port method: port.resolve())
[Port: IEntitlementPort]
       ▲
       │ (implements)
[Adapter: SupabaseEntitlementAdapter]
       │
       ▼ (persists/queries)
[Storage: SQLite / PowerSync / Remote DB]
```

At no point does the Hook talk to the Adapter, Port, or Schema validator directly.
