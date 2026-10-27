---
title: "Client State Architecture Migration Plan"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, migration, client-state, zustand, xstate, tanstack-query]
---

# Client State Architecture Migration Plan

> **Canonical integration:** Follow the enduring ownership and web capability
> rules in
> [`client-state-and-web-offline-capability-canon.md`](client-state-and-web-offline-capability-canon.md).
> This document is the dated execution plan.

## Scope and non-goals

This plan restructures state ownership without a big-bang rewrite. It preserves live flows, routes, tests, fallbacks, and the mutation outbox. No phase authorizes deleting `useStore`, a current store, or a persistence key without a separate human-approved deletion decision.

The migration does not replace TanStack Query, Zustand, XState, storage, or the existing outbox wholesale. It establishes their boundaries and then migrates one concern at a time.

## Phase 0 — inventory and state charter

Produce the evidence pack defined in `2026-10-23-client-state-phase-0-inventory-charter.md`. No application behavior changes.

**Exit gate:** every store, persistence key, whole-store subscription, cross-store write, server-cache duplicate, and reset path is catalogued with an accountable owner.

## Phase 1 — foundation and enforcement

**Implementation record:** [`2026-10-23-client-state-phase-1-foundation.md`](2026-10-23-client-state-phase-1-foundation.md).

Create minimal shared state primitives in `@repo/core`, without migrating consumers yet:

1. A typed persisted-record envelope with schema version, scope key, migration, corruption outcome, and hydration status.
2. A selector convention and lint/AST check that rejects accidental full-store subscriptions in production paths.
3. A state registry consumed by tests/audit scripts rather than a runtime global registry.
4. A Query scope utility that creates, cancels, removes, and invalidates private query keys by principal, tenant, and perspective.
5. A protocol admission template for XState, including event vocabulary, transition table, effect ownership, cancellation, error states, and persistence decision.

**Exit gate:** foundation tests prove bad persisted data does not block startup, and a policy check catches an intentionally introduced bad subscription and unversioned persistence declaration.

## Phase 2 — scope-session single source of truth

**Implementation record:** [`2026-10-23-client-state-phase-2-scope-session.md`](2026-10-23-client-state-phase-2-scope-session.md).

**Current status: accepted.** The supported scope-session transition and the
mobile provisioning receipt seam have passed the Phase 2 hostile review.
Focused scenario evidence now covers a persisted command interrupted during
dispatch, same-key reconnect recovery, and account change while a response is
in flight; pending workspace records never grant an active scope. Phase 3 may
begin one remote-state family at a time, retaining all Phase 2 compatibility
mirrors until each later exit gate is met.

Replace the three active-perspective authorities with one scope-session authority. Keep compatibility selectors during migration.

Transition order:

1. Reject an invalid target scope before any visible mutation.
2. Pause/cancel old scope work and remove private query cache entries.
3. Clear permission decisions tied to the old scope.
4. Commit the new scope once.
5. Rehydrate allowed preferences, reload capabilities and entitlements, and refetch new scoped queries.
6. Resume, quarantine, or retain offline commands according to their recorded principal and command policy.

### Phase 2.1 — hostile-review closure

1. Resolve the school-invite authority contract without deleting either live
   table or flow: trace issuance, claim, and selection against the actual
   production migration chain; select one canonical contract; add an explicit
   compatibility bridge or a human-approved retirement plan for the other.
2. Perform a direct-writer audit of `AuthSlice`, `TenantSlice`, and
   `usePerspectiveStore`. Every active-scope write must either route through
   `ScopeSessionCoordinator` or be documented as a bounded migration input
   whose result is atomically re-committed by that coordinator.
3. Add G2 scenario contracts for signed-out → signed-in, Account A → Account
   B, personal ↔ institutional, failed transition rollback, offline behavior,
   and invite claim → selection → refresh. A scenario must assert the
   canonical snapshot, all compatibility mirrors, Cedar denial/reload, Query
   boundary behavior, and durable-command non-disposal as applicable.
4. Reconcile the Phase 2 record's status and evidence with the executed
   tests. Explicitly distinguish G1/G2 boundary evidence from unperformed
   mobile device or deployed-backend evidence.
5. For mobile commercial/guardian provisioning, retain offline requests as
   account-scoped provisional commands only. Reconcile them through the
   existing server repositories on reconnect and add a perspective only from
   the returned record. A provisional request must never become a Bond,
   active scope, tenant, or local permission grant. School-invite claims stay
   online-authoritative. Browser offline work remains governed by the W2–W4
   vertical-slice ladder, not by this mobile implementation.

**Exit gate:** all direct writers are contained, the invite contract is
unambiguous and characterized, and G2 scenarios cover signed-out → signed-in,
Account A → Account B, personal → institutional, institutional → personal,
failed transition rollback, offline transition, and the invite path. The raw
delta must pass the deletion veto before Phase 3 begins.

## Phase 3 — migrate remote state to Query

**Execution record:** [`2026-10-24-client-state-phase-3-query-migration-plan.md`](2026-10-24-client-state-phase-3-query-migration-plan.md).

Phase 3 starts with a scoped-query readiness increment. It does not authorize a
bulk store migration or shrinking the legacy account-boundary fallback before a
real family proves canonical scope, disposal, and compatibility behavior.

Migrate one resource family per pull request:

1. Notifications: query data and unread count, mutation-backed mark-read operations, realtime updates into scoped cache.
2. Device security: query-backed summaries and mutation-backed revoke/trust operations.
3. Entitlements and Cedar decisions: scoped query snapshots with freshness and safe denial/error behavior.
4. Any remaining API entity collection held in Zustand.

For each family, retain a compatibility hook until all consumers move. Use confirmed invalidation or rigorously tested optimistic rollback; do not make a client cache authoritative over the service.

**Exit gate:** no migrated resource is held in both Query and Zustand as independently mutable truth; account switch removes private cache entries.

## Phase 4 — persistence modernization

Migrate persisted preference stores using `useActiveSubTabsStore` as the local precedent:

1. Assign an owner, sensitivity classification, scope, TTL, schema version, partialized payload, migration, and reset policy.
2. Change keys only through a versioned read-old/write-new migration window.
3. Test corrupted payload, missing payload, old schema, migration failure, sign-out, different account, and storage failure.
4. Separate `selfCanvasStore` preference reducer from its storage/network persistence coordinator.

Persisted Query data is opt-in and expiry-bounded. TanStack Query's persistence API supports restore expiry and a `buster`; it must never persist a generic private cache by default. See [persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient).

**Exit gate:** every retained persisted record can identify its schema and scope, and none leaks from Account A to Account B.

## Phase 5 — subscription and facade migration

1. Replace whole-store temporal, conflict, notification, and entitlement reads with atomic selectors.
2. Introduce narrowly named selector hooks where repetition demonstrates a stable domain concept.
3. Deprecate `useStore` in documentation and static checks; migrate importers incrementally.
4. Request explicit approval before deleting the facade or old compatibility paths.

**Exit gate:** zero production whole-store subscriptions for high-churn stores; no `unknown` facade type escape; measured render work does not regress.

## Phase 6 — protocol extraction where earned

Convert only qualifying workflows to XState. Initial candidates require Phase 0 evidence and should be considered, not assumed:

- account lifecycle and guest-to-authenticated handoff;
- perspective transition and capability hydration;
- offline mutation settlement/reconciliation;
- version-gate admission/recovery.

Each machine must model failure, cancellation, timeout, retry, and terminal states. Persist only serializable, versioned snapshots or a durable event log. XState's own persistence documentation warns that restored actions are not replayed and incompatible snapshots require a migration strategy. [Stately persistence](https://stately.ai/docs/persistence)

**Exit gate:** the protocol's explicit transition tests prove more than the prior imperative tests; otherwise revert the machine proposal and retain the simpler implementation.

## Quality gates for every phase

- G0: package-scoped typecheck and static policy checks.
- G1: store/query/migration contract tests.
- G2: scenario contracts for failure, offline, account, and perspective transitions.
- G3: mounted component behavior.
- G4: mobile and web bundle evidence for changed journeys.
- G5: physical device evidence for startup, sign-out, scope switch, offline recovery, and resumed commands where mobile behavior changes.
- Required repository gates: relevant tests first, then `pnpm run check-types`, `pnpm run check:anti-slop`, and a raw `git diff` deletion-first review.

## Hostile review vetoes

Reject a change if it silently deletes a fallback or test, introduces a second mutable source of truth, persists sensitive/scope-bound data without a policy, masks network failure as success, widens a component subscription, or uses XState where a reducer is enough.
