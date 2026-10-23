---
title: "Client State Phase 0: Hostile Architectural and Engineering Review"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, phase-0, review, state-management, offline-first, risk]
---

# Client State Phase 0: Hostile Architectural and Engineering Review

> **Review target:** the Phase 0 inventory, charter, canonical policy, and
> documentation integrations—not a proposed source migration. Read alongside
> the [mechanical baseline](2026-10-23-client-state-phase-0-baseline.md) and
> the [canonical state/offline policy](client-state-and-web-offline-capability-canon.md).

## Verdict

**Do not begin broad store migration or introduce XState yet.** Phase 0 has
established a reproducible topology and corrected offline overclaims, but it is
not a substitute for per-record semantic ownership decisions. No runtime flow
was changed, so no product regression was introduced by this phase.

## Findings

| Severity | Finding | Evidence | Required control |
| --- | --- | --- | --- |
| P1 | The inventory is lexical evidence, not a semantic owner proof. | The scanner records 18 stores, 43 contexts, and 53 reducers, but only the known Zustand stores receive provisional categories. | Before a migration slice, create a reviewed record for its holder(s): authority, scope, readers/writers, sensitivity, failure path, reset, and tests. Do not use an inventory count as approval. |
| P1 | Browser-local persistence is fragmented and currently under-governed. | 114 browser-storage accesses were found; 103 directly use `localStorage`. | Classify keys field-by-field; add scoped/versioned envelopes only where persistence is necessary. Treat `clear()` and key changes as deletion-veto events. |
| P1 | W2/W3/W4 web capability is not established. | The sole `serviceWorker.register` is `packages/core/src/native/webPush.web.ts`, and no Query persistence integration was found. | Select one journey, prove app-shell reload offline before claiming W2, then prove account-isolated restart reads (W3) and durable commands (W4). |
| P1 | Scope-session migration has a high confidentiality blast radius. | Auth, tenant, and perspective remain provisional duplicate authorities; raw store access has 46 call sites. | Compute per-symbol callers and characterize account/perspective switch behavior before changing a writer or persistence key. Maintain adapters until every caller is moved. |
| P1 | The durable-command estate must not be “modernized” as UI state. | Persisted mutation audit, mutation queue, conflict reconciliation, and version gating lack the same semantics as ordinary preferences. | Keep them under domain/outbox ownership; prove idempotency, scope binding, restart recovery, rejection, and quarantine before any storage change. |
| P2 | XState is installed but has no live source import. | Inventory and lexical source search both return zero XState imports. | Do not add XState for architectural aesthetics. Admit one protocol only after its transition table and failure/recovery evidence pass the stated admission test. |
| P2 | The scanner is deliberately lightweight and can have false positives or negatives. | It is a transparent TypeScript text scan, not an AST/data-flow analysis. | Use CodeGraph/importer evidence and direct source review for every migration PR; promote the scanner to an AST rule only if recurring exceptions justify the maintenance cost. |

## Rejected shortcuts

- “Replace all Zustand with XState.” This hides state ownership failures behind a heavier API and provides no offline or authorization guarantee.
- “Persist the Query cache globally.” This risks stale private data and is not a durable command protocol.
- “Add a PWA plugin, then call the web offline-first.” A manifest or push-worker registration does not prove offline shell launch, account isolation, or write recovery.
- “Call `localStorage.clear()` on transition.” This is an uncontrolled destructive operation across unrelated keys and violates the deletion-veto posture.
- “Delete `useStore` now.” Its importers and compatibility behavior must be explicitly characterized and migrated first.

## Conditions for Phase 1 admission

1. Choose one bounded state family rather than a global refactor.
2. Attach its importer/blast-radius evidence, persisted-key map, and G1/G2
   characterization tests.
3. State the scope-session and Query-cache disposal behavior under account and
   perspective transition.
4. If browser persistence is involved, name its W-level and prove the matching
   browser scenario.
5. Obtain explicit human approval before deleting a facade, state holder,
   persisted key, fallback, or test.
