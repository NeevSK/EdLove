---
title: "Canonical 7-Tier Architectural Hierarchy & Archetype Invariants"
status: "active"
date: "2026-11-01"
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

## 2. The 7 Architectural Archetypes

| Tier | Archetype Name | Semantic Definition | Monorepo Files (Subsystem) | Allowed Inward Imports | Forbidden Imports |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | **Contract / Schema / Type** | Pure data schemas (Zod), TypeScript interfaces, enums, error models, and static constants. | `capacity.schema.ts`, `identity.schema.ts`, `user.schema.ts`, `Identity.ts`, `authorization.ts`, `SriLankanSchools.ts` | External libs (`zod`), other Tier 0 schemas | Tier 1–6 (NEVER imports logic, stores, adapters, or UI) |
| **Tier 1** | **Port / Interface** | Abstract contracts defining external capabilities for Dependency Inversion. | `entitlement.port.ts`, `authz.port.ts`, `network.port.ts`, `featureRollout.port.ts` | Tier 0 (Contracts & Schemas) | Tier 2–6 (NEVER imports concrete adapters or stores) |
| **Tier 2** | **Pure Domain Logic** | Business invariant evaluators, feature calculators, policy manifests. Zero I/O, deterministic pure functions. | `sanctuaryFeature.ts`, `citizenship.ts`, `bondScope.ts`, `featureLifecycleManifest.ts` | Tier 0 (Schemas), Tier 1 (Ports) | Tier 3 (Adapters), Tier 4 (Stores), Tier 6 (UI) |
| **Tier 3** | **Adapter / Storage / Infra** | Concrete implementations of Ports interacting with external databases (PowerSync, Supabase, SQLite, MMKV, GrowthBook). | `supabaseEntitlement.adapter.ts`, `database.ts`, `storage.ts`, `growthBookFeatureRollout.adapter.ts` | Tier 1 (Ports - implements them), Tier 0 (Schemas) | Tier 5–6 (Should never know about application hooks or UI) |
| **Tier 4** | **State Store (Zustand)** | In-memory reactive state containers, selectors, and synchronizers. | `useFeatureStore.ts`, `useEntitlementStore.ts`, `useAuthStore.ts`, `usePerspectiveStore.ts` | Tier 1 (Ports), Tier 2 (Domain Logic), Tier 0 (Schemas) | **Tier 3 (Adapters)**: MUST NOT directly import concrete adapters; must use Port DI |
| **Tier 5** | **Application Facade / Hook** | High-level client hooks coordinating multiple stores for UI consumers. | `useSanctuaryFeature.ts` | Tier 4 (Stores), Tier 2 (Domain Logic), Tier 0 (Types) | Tier 3 (Adapters), Tier 1 (Ports), Tier 0 (Runtime Schemas) |
| **Tier 6** | **Presentation UI** | User-facing buttons, guards, prompts, icons, and screens. | `SanctuaryGuard.tsx`, `SanctuaryButton.tsx`, `SchoolJoinPrompt.tsx` | Tier 5 (Hooks), Tier 0 (Types & Themes) | Tier 1–4 (NEVER talks to stores, adapters, or databases directly) |

---

## 3. The Three Critical Invariant Violations Discovered

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
