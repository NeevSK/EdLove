---
title: "Client State Phase 0: Mechanical Baseline"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, phase-0, client-state, inventory, evidence]
---

# Client State Phase 0: Mechanical Baseline

> **Canonical integration:** Interpret this dated snapshot through the living
> [client-state and web offline capability canon](client-state-and-web-offline-capability-canon.md)
> and the [Phase 0 inventory charter](2026-10-23-client-state-phase-0-inventory-charter.md).

## Reproducible evidence

Run `pnpm run audit:state-architecture`. The read-only source scan writes
[`reports/state-architecture/inventory.json`](../../reports/state-architecture/inventory.json).
It covers TypeScript source beneath `apps/` and `packages/`, excluding generated
output, documentation, dependencies, and conventional `*.test.*` / `*.spec.*`
files. It is an architectural inventory, not a semantic proof of a store's
runtime behavior.

The first baseline scanned 2,806 source files and found:

| Signal | Count | Interpretation |
| --- | ---: | --- |
| Zustand store declarations | 18 | The bounded-client-state estate to classify before migration. |
| Persisted state holders | 15 | Each needs purpose, scope, retention, migration, and reset review. |
| QueryClient declarations | 2 | Web and mobile already have explicit server-cache foundations. |
| XState imports | 0 | XState is installed but not yet part of the live state topology. |
| React contexts / reducers | 43 / 53 | These require triage only where they overlap global or durable state. |
| Full Zustand subscriptions | 52 | Candidate render/performance and coupling review list. |
| Raw `getState` / `setState` access | 46 | Candidate cross-store writer and lifecycle-boundary review list. |
| Browser storage accesses | 114 | 103 are direct `localStorage` calls; each needs scope and sensitivity review. |
| Query operations / persistence integration | 138 / 0 | Remote hooks are widespread; no persisted Query integration was found. |
| Service-worker registrations | 1 | The only registration is web-push oriented, not evidence of an app shell. |

Counts include source test-support modules that are not conventionally named as
test/spec files. The report records paths and lines so review can separate runtime
callers from harness support before assigning migration work.

The storage scan found two direct IndexedDB opens and no recognized OPFS or
Query-persistence integration. It does not classify a call as safe simply
because it is in a browser adapter: 103 direct `localStorage` calls need
field-level scope and sensitivity review before web W3/W4 work.

## Initial ownership register

The scanner assigns a provisional owner category. It does **not** authorize a
behavior migration.

| Holder | Provisional category | Phase 0 judgment |
| --- | --- | --- |
| `useAuthStore`, `useTenantStore`, `usePerspectiveStore` | Scope-session candidate | Three mutable sources describe active perspective. Consolidate authority in a later, explicitly approved scope-session slice. |
| `useFeatureStore`, `useEntitlementStore`, `useCedarDecisionStore`, `useNotificationStore`, `useDeviceSecurityStore` | Server-state candidate | Verify whether each is a client projection/cache. Move remote-resource ownership to Query only when cache keys, invalidation, realtime, and authorization disposal are proven. |
| `useConflictStore` | Durable-command reconciliation | Keep under outbox/domain review; it is not a cosmetic preference. |
| `useVersionGatingStore` | Protocol candidate | Assess state graph, restart semantics, and error states against the XState admission test. |
| `usePendingIntentStore` | Navigation handoff | Document route/session clearing and sensitivity before changing storage. |
| `useActiveSubTabsStore`, `useDraftsStore`, `useGrowthStore`, `useSelfCanvasStore` | Scoped preference / domain-projection review | Classify field-by-field; `selfCanvasStore` is especially mixed and must be split only with a bounded follow-up design. |
| `useConsentStore`, `useUIStore` | Device preference | Verify retention, policy sensitivity, and account-switch disposition. |
| `useTemporalStore` | Shared client state | Audit the 52 whole-store subscriptions before changing its shape. |

## Persistence finding

Of 15 persisted holders, only `useActiveSubTabsStore` currently declares both a
store version and migration. The remaining 14 are a risk register, not a mandate
to retrofit a generic persistence wrapper. Each must be reviewed for whether it
should persist at all, then receive a scoped key, minimal `partialize` policy,
corruption handling, reset rule, and migration evidence where it remains durable.

The persisted `MutationAuditLog`, mutation queue, conflict reconciliation, and
version-gating records require domain/outbox treatment. They must not be swept up
in a preference-store migration or cleared as part of ordinary UI reset.

## Phase 0 decisions made

1. The platform stays hybrid: Query for remote state, bounded Zustand for shared
   client/preferences, and XState only after the admission test. See the
   [dated architecture decision](2026-10-23-client-state-architecture-decision.md).
2. Web offline claims are constrained by W0–W4 capability evidence. Current web
   behavior demonstrates cached reads in an open tab (W1); restart-safe shell,
   replica, and durable-write claims remain unproven.
3. No source store, persisted key, compatibility facade, or user flow was
   removed or replaced in Phase 0.

## Phase 0 exit status

The mechanical inventory and initial ownership charter are now implemented.
Before a migration phase starts, a designated architecture owner must accept the
per-holder record fields in the charter, prioritize one bounded slice, and approve
any deletion or compatibility retirement under the deletion veto.

The corresponding adversarial assessment is recorded in the
[Phase 0 hostile architectural and engineering review](2026-10-23-client-state-phase-0-hostile-review.md).
