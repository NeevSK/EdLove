---
title: "Polymath Platform: Multi-Tenant & Institutional Account Architecture Handoff & Prompt Blueprint"
status: "active"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Antigravity"
tags: [handoff, prompt-blueprint, multi-tenant, institutional-accounts, sso, rebac, offline-sync]
---

# Multi-Tenant & Institutional Architecture Handoff & Master Prompt

## 1. Executive Summary & Context

In the previous engineering sprint, the core offline resilience engine in `@repo/core` and `gurudevi-mobile` was hardened with kernel-grade invariants:
- **Synthetic 503 Fast-Fail & Retry Short-Circuiting**: Bypasses 7s UI freezes during network drops.
- **Monotonic Sequence Tracking & Logical Clocks**: Inverted latency immunity & client clock skew protection.
- **`AUTH_EXPIRED` Outbox Pause Engine**: Prevents 401s from falsely purging queued mutations into the Dead Letter Queue (DLQ).
- **SWR Cache Poisoning Defense**: Preserves valid stale cache on 500/503 errors without data loss.
- **Outbox Schema Migration & In-Flight Lease Recovery**: Seamless offline schema evolution (`v1` ➔ `v2`) and self-healing for aborted background tasks.
- **Tenant-Partitioned Storage Adapter**: `TenantPartitionedStorageAdapter` (`tenant:<orgId>:<userId>:<key>`) establishing the initial storage isolation primitive.

All 17 test suites (40 tests) and strict TypeScript typechecks are passing at `0 errors`.

---

## 2. Authentic Sanctuary & Perspective Architecture Blueprint

```mermaid
flowchart TD
    subgraph Human Citizen Identity Layer
        UserSession[Active Citizen Session] --> PerspectiveRouter{Active Perspective Switcher}
        PerspectiveRouter -->|Personal Sanctuary| PersonalScope[Personal Sanctuary: Individual User]
        PerspectiveRouter -->|Institutional Bond A| OrgScopeA[School Bond A: e.g. Royal College (Teacher)]
        PerspectiveRouter -->|Institutional Bond B| OrgScopeB[School Bond B: e.g. Central Academy (Principal)]
        PerspectiveRouter -->|Guardian Bond| GuardianScope[Guardian Link: Ward Profile]
    end

    subgraph State & Storage Partitioning
        PersonalScope --> MMKV_Personal[(MMKV: sanctuary:user_123:perspective:personal)]
        OrgScopeA --> MMKV_OrgA[(MMKV: sanctuary:user_123:perspective:bond_royal_teacher)]
        OrgScopeB --> MMKV_OrgB[(MMKV: sanctuary:user_123:perspective:bond_central_principal)]
        
        PersonalScope --> Outbox_Personal[Outbox Queue: Personal]
        OrgScopeA --> Outbox_OrgA[Outbox Queue: Tagged Royal College]
        OrgScopeB --> Outbox_OrgB[Outbox Queue: Tagged Central Academy]
    end

    subgraph Security & Cedar ReBAC Access Control
        PersonalScope --> Cedar_Personal[Cedar Policy: Personal Sanctuary Grants]
        OrgScopeA --> Cedar_A[Cedar ReBAC: School Relation Tuples & Capacities]
        OrgScopeB --> Cedar_B[Cedar ReBAC: Principal Structural Permissions]
        GuardianScope --> Cedar_Guardian[Cedar ReBAC: Guardian Relationship Boundary]
    end
```

### The 5 Architectural Invariants for Sanctuary Tenancy:

1. **Storage Partition Sandboxing**:
   - Zero state bleed between personal sanctuary and institutional / guardian bonds on the same device.
   - Storage keys scoped cleanly: `sanctuary:<userId>:perspective:<perspectiveId>:<key>`.
2. **Atomic Perspective Switching (0ms UI Freeze)**:
   - When the citizen switches between Personal Sanctuary and School Bonds (or between different schools) via `usePerspectiveSwitch`:
     - Maintain in-flight outbox replay with immutable `perspectiveId` & `tenantId` binding.
     - Atomically swap perspective pointers and hydration stores.
3. **Session vs. Bond vs. Citizenship Independence**:
   - Session = instantaneous auth state.
   - Citizenship = registration depth (`THIRD_CLASS`, `SECOND_CLASS`, `FIRST_CLASS`).
   - Bonds = dynamic relational capabilities (Teacher, Student, Parent, Principal).
   - Entitlement = commercial/institutional capability grant.
4. **Relational ReBAC (Relationship-Based Access Control)**:
   - Institutional permissions (Teacher, Principal, Student, Founder) are strictly bounded to the active bond relation tuple graph in Cedar.
5. **Perspective-Bound Outbox Routing & Dispatch**:
   - Mutations queued under School A are permanently tagged with `perspectiveId: 'bond:school_A:teacher'` and `tenantId: 'school_A'`, replaying safely regardless of what perspective the user is currently viewing.


---

## 3. The Master Kick-Off Prompt for the New Session

Copy and paste the prompt below directly into the new conversation to immediately bootstrap the multi-tenant implementation:

```markdown
We are building the complete Multi-Tenant & Institutional Account Engine for the Polymath Platform (@repo/core and gurudevi-mobile), continuing from our kernel-grade offline resilience foundation.

Context & Current Baseline:
- The offline sync and storage core (@repo/core/src/lib/sync) is hardened with monotonic logical clocks, SWR poisoning defense, AUTH_EXPIRED outbox pause mechanisms, schema auto-migration, in-flight lease self-healing, app version gating / force-update freezing, and tenant storage adapters (c:/x/packages/core/src/lib/tenantStorage.ts).
- All 18 scenario suites (44 tests) pass with 0 TypeScript errors.

Target Deliverables for this Session:
1. Multi-Tenant State & Context Switcher:
   - Implement an atomic account switcher (Personal vs Institutional Org A vs Org B) with instant 0ms context swap.
   - Partition Zustand/MMKV persistence and ensure memory caches flush and re-hydrate from the target tenant partition.
2. Multi-Tenant Outbox Segregation & Dispatch:
   - Support tenant-tagged mutations (tenantId, orgAuthToken, custom headers like X-Tenant-ID).
   - Ensure outbox replay drains the active tenant's queue without cross-tenant pollution.
3. Enterprise SSO / IdP Lifecycle Integration:
   - Wire OIDC/SAML token expiration with sovereignBus ('sync:auth_required') to silently refresh org tokens without DLQ dumping.
4. Tenant ReBAC Authorization & Role Guards:
   - Implement tenant-scoped role & clearance checks (e.g., student vs instructor vs admin) across mobile navigation and UI components.
5. Vitest Scenario & Mobile Integration Suites:
   - Write comprehensive chaos test suites covering multi-tenant switching during active sync, cross-tenant outbox isolation, and enterprise token expiration.
   - Ensure pnpm --filter @repo/core check-types and pnpm --filter gurudevi-mobile check-types pass cleanly with 0 errors.

Please review docs/architecture/multi-tenant-institutional-handoff.md and begin execution with a clean architectural plan.
```

---

## 4. Key File & Reference Map

| Component / Subsystem | Location |
| :--- | :--- |
| **Tripartite Perspectives Architecture** | [tripartite-multi-perspective-architecture.md](file:///c:/x/docs/architecture/tripartite-multi-perspective-architecture.md) |
| **Resilience & Offline SOP** | [offline-state-resilience-sop.md](file:///c:/x/docs/architecture/offline-state-resilience-sop.md) |
| **Tenant Storage Adapter** | [tenantStorage.ts](file:///c:/x/packages/core/src/lib/tenantStorage.ts) |
| **Outbox & Sync Manager** | [SyncManager.tsx](file:///c:/x/packages/core/src/lib/sync/sync/SyncManager.tsx) & [useMutationQueue.ts](file:///c:/x/packages/core/src/lib/sync/useMutationQueue.ts) |
| **Version Gating Engine** | [versionGating.ts](file:///c:/x/packages/core/src/lib/sync/versionGating.ts) |
| **Schema Migration Engine** | [outboxMigration.ts](file:///c:/x/packages/core/src/lib/sync/outboxMigration.ts) |
| **Sovereign Event Bus** | [eventBus.ts](file:///c:/x/packages/core/src/lib/sync/eventBus.ts) |
| **Disaster Scenario Suites** | `packages/core/src/__tests__/scenarios/` |


