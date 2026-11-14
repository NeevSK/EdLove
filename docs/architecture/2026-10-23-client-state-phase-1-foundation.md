---
title: "Client State Phase 1: Foundation Implementation Record"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, phase-1, client-state, persistence, query, policy]
---

# Client State Phase 1: Foundation Implementation Record

> **Canonical integration:** This is the dated delivery record for Phase 1 of
> the [client-state migration plan](2026-10-23-client-state-migration-plan.md).
> Enduring ownership and offline rules remain in the
> [client-state and web offline capability canon](client-state-and-web-offline-capability-canon.md).

## Delivered foundations

`@repo/core/lib/clientStateFoundation` adds platform-neutral, opt-in contracts:

| Foundation | Purpose | Deliberate non-action |
| --- | --- | --- |
| Persisted-record envelope | Requires schema version, scope, sensitivity, validator, optional migration, and explicit corruption/expiry result. | No existing persisted key, storage adapter, or store was migrated. |
| Scoped Query lifecycle | Provides a canonical private Query-key prefix and invalidates, cancels, or removes only matching scoped queries. | It does not call `QueryClient.clear()`, touch mutations, or change current account boundaries. |
| Audit registry | Lists the reviewed client-state holders with provisional owner, scope, and destination. | It does not import a store or become runtime state. |
| XState admission assessment | Encodes the five protocol-admission questions as a pure assessment. | It does not install, create, or route through an XState actor. |
| Changed-source policy check | Rejects newly introduced bare `useXStore()` subscriptions and incomplete new `persist(...)` declarations. | It does not retroactively fail or mechanically rewrite legacy stores. |

## Reviewer constraints retained

1. The persistence envelope is an adapter contract, not permission to persist
   more data. Every future adoption must retain scope, sensitivity, disposal,
   corruption, and retention evidence.
2. Scoped Query disposal protects namespaced resource families only. Existing
   unscoped Query keys continue to need explicit characterization in Phase 2;
   no current broad cache-clear behavior was silently replaced.
3. Mutation/outbox data remains outside Query disposal. It is governed by its
   account-transition and command-lifecycle contracts.
4. The registry is intentionally static and audit-only to avoid creating a
   fourth scope authority or global runtime dependency.
5. A passing XState admission assessment is necessary but not sufficient for a
   machine: the candidate still needs a transition table, named effects,
   cancellation/timeout semantics, and scenario evidence.

## Verification evidence

```text
G1 boundary / Vitest – clientStateFoundation.test.ts: 5/5 passed.
Proves: explicit corrupted/expired/migration outcomes; scoped Query disposal
preserves other scopes and public data; registry uniqueness; XState admission
rejects ceremony-only use.
Does not prove: app account switching, browser storage behavior, native storage,
or production cache/outbox reconciliation.

G0 static / Node policy fixtures and changed-source scan: passed.
Proves: the guard catches a deliberately bad bare subscription and a deliberately
incomplete persist declaration, while accepting the valid fixture and current
changed source lines.
Does not prove: AST/data-flow completeness or semantic correctness of legacy code.

G0 static / state inventory registry coverage: passed.
Proves: all 18 discovered Zustand-store paths are represented by 20 audited
registry entries, including related command/protocol holders.
Does not prove: that a provisional category is semantically correct; each
migration slice still requires direct source and caller review.
```

## Admission for Phase 2

Phase 2 may consume these utilities only for one characterized scope-session
slice. It must retain compatibility selectors and prove signed-out → signed-in,
Account A → Account B, perspective transition, failed transition, and offline
transition behavior before removing any old writer or persistence key.

## Final hostile review outcome

**Accepted as a foundation; rejected as a migration authorization.** The review
found and corrected two enforcement gaps during implementation: the changed-source
policy initially missed untracked files, and the Query utility initially lacked
scoped invalidation. The final implementation covers both.

No Phase 1 change deletes a store, persisted key, compatibility facade, route,
test, fallback, or command. No existing cache boundary was rewired, no XState
actor was introduced, and no browser offline level was upgraded. The remaining
high-risk work—duplicate scope writers, legacy persistence migration, broad cache
clears, and `useStore` retirement—remains deliberately deferred to characterized
Phase 2+ slices.

The repository-wide anti-slop chain reached CNG, native-slop, and hollow-stub
checks successfully, with six pre-existing UI review warnings, then exceeded the
available execution window at `aislop ci --changes`. Focused Phase 1 checks are
the completion evidence; the incomplete broad chain is not represented as a pass.
