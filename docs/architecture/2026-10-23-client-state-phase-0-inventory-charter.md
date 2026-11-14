---
title: "Client State Phase 0: Inventory and State Charter"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, phase-0, inventory, client-state, governance]
---

# Client State Phase 0: Inventory and State Charter

> **Canonical integration:** Record each inventory result against the owner,
> scope, storage, and W0–W4 rules in
> [`client-state-and-web-offline-capability-canon.md`](client-state-and-web-offline-capability-canon.md).
> The executed first-pass evidence is recorded in the
> [Phase 0 mechanical baseline](2026-10-23-client-state-phase-0-baseline.md).

## Objective

Establish an evidence-backed state ownership baseline before modifying behavior. Phase 0 creates no runtime abstraction and migrates no state. Its only outputs are an audited inventory, a state charter, a risk-ranked backlog, and executable acceptance scenarios.

## Current evidence baseline

The first repository pass identified:

- `zustand@5.0.16` installed in `@repo/core`, `gurudevi-mobile`, and `@repo/self`.
- `xstate@5.33.3` installed in mobile and UI manifests, with no live source use found in the initial search.
- `@tanstack/react-query@5.104.5` already used throughout core, web, mobile, and feature packages.
- 15+ stores under `packages/core/src/store`, plus persisted stores in sync and deep-link code and `selfCanvasStore`.
- duplicate active-perspective state in auth, tenant, and perspective stores.
- a legacy mega-store facade in `packages/core/src/store/useStore.ts`.
- full-store temporal subscriptions across UI, classroom, community, self, and web consumers.
- 13+ persistence keys, of which active sub-tabs is the visible versioned migration exemplar.

This is an initial baseline, not a conclusion. The Phase 0 inventory must mechanically verify every count.

## Required inventory record

Create one row per state holder: Zustand store, Query cache family, React context, reducer, XState actor, persisted storage record, realtime subscription, and outbox queue.

| Field | Required answer |
| --- | --- |
| Identifier and path | Exact module and exported symbol |
| State class | Server, durable command, scope/session, preference, protocol, or local UI |
| Authority | Single writer and source of truth |
| Readers/writers | Importers, raw `getState`/`setState`, events, subscriptions |
| Scope | Device, guest, principal, tenant, bond, perspective, route, component |
| Persistence | Key, adapter, partialized fields, version, migration, TTL, corruption behavior |
| Sensitivity | Public, preference, personal, authorization, security, regulated |
| Failure model | Loading, stale, retry, timeout, offline, rollback, error UI |
| Reset/disposition | Sign-out, account switch, scope switch, uninstall, server rejection |
| Tests | Existing G-level evidence and missing cases |
| Destination | Retain, split, Query, XState, local reducer/context, or deprecate |

## Work breakdown

### 0.1 Mechanical discovery

- Run CodeGraph/import searches for each store and Query family.
- Enumerate every `persist(...)`, storage key, direct storage call, `getState`, `setState`, and external subscription.
- Locate every `QueryClient`, query key factory, cache persistence adapter, realtime updater, and auth/scope cache boundary.
- Locate existing reset and account lifecycle routines.

**Artifact:** `reports/state-architecture/inventory.json` generated from source plus a reviewed Markdown summary. The generated report is not a new runtime dependency.

### 0.2 Ownership workshop

For each record, decide its state class and one authoritative owner. Flag any value with multiple writers or two independently mutable replicas.

**Artifact:** a decision log containing keep/split/migrate/deprecate with rationale, user-visible risk, estimated blast radius, and named accountable package.

### 0.3 Persistence and privacy review

Classify every persisted field. Explicitly identify user IDs, grants, permissions, security summaries, tokens/session material, school data, and drafts. Document whether it is lawful and necessary to retain locally, when it expires, and how it is cleared.

**Artifact:** persistence register and account/scope isolation matrix.

### 0.4 Protocol candidate review

Evaluate account transition, perspective switch, offline settlement, version gating, and other candidates against the XState admission test. Do not create machines yet.

**Artifact:** protocol candidate cards: current states/events/effects, failure modes, existing tests, and a recommendation of XState versus retained imperative/domain implementation.

### 0.5 Scenario charter

Write acceptance scenarios before migration:

1. Cold boot with empty, stale, corrupt, and old-version local data.
2. Guest to authenticated account transition.
3. Account A to Account B without data or permission leakage.
4. Personal to institutional perspective transition, including failed capability load.
5. Offline command queued, resumed, rejected, and quarantined across session changes.
6. Notification and device-security failure/retry/realtime reconnect.
7. App restart while a persisted preference and a durable outbox command exist.

**Artifact:** G2 scenario test plan with owned test files and required platform evidence.

## Deliverables and acceptance criteria

Phase 0 is complete only when:

- every state holder has a record with an owner and scope;
- every persisted key has a purpose, schema version status, sensitivity, and disposition rule;
- every full-store subscription and cross-store write has a justified exception or migration destination;
- perspective duplication has a documented single-source-of-truth recommendation;
- each XState candidate has passed or failed the admission test with evidence;
- a human has approved the state charter and prioritized the first migration slice.

## Explicit non-actions

Phase 0 must not delete stores, change persisted keys, migrate server data, add XState, alter sign-out behavior, or remove compatibility facades. Those actions belong to later phases and require their own delta review and deletion approval where applicable.
