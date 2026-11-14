---
title: "Client State and Web Offline Capability Canon"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, canonical, client-state, offline-first, web, mobile, zustand, xstate, tanstack-query]
---

# Client State and Web Offline Capability Canon

> This is the platform reference for client-state ownership and web/mobile offline capability. It complements, and does not replace, the offline resilience SOP, identity decisions, local-first contracts, and per-domain PowerSync plans.

## Related operational records

- [`2026-10-23-client-state-architecture-decision.md`](2026-10-23-client-state-architecture-decision.md) records the decision rationale.
- [`2026-10-23-client-state-migration-plan.md`](2026-10-23-client-state-migration-plan.md) is the staged execution plan.
- [`2026-10-23-client-state-phase-0-inventory-charter.md`](2026-10-23-client-state-phase-0-inventory-charter.md) defines the non-destructive evidence baseline.
- [`2026-10-23-client-state-phase-0-baseline.md`](2026-10-23-client-state-phase-0-baseline.md) records the first reproducible scan and ownership hypotheses.
- [`2026-10-23-client-state-phase-0-hostile-review.md`](2026-10-23-client-state-phase-0-hostile-review.md) records the adversarial release gates.
- [`2026-10-23-client-state-phase-1-foundation.md`](2026-10-23-client-state-phase-1-foundation.md) records the non-destructive foundation delivery.
- [`2026-10-23-client-state-phase-2-scope-session.md`](2026-10-23-client-state-phase-2-scope-session.md) scopes the active compatibility-mirror migration and its remaining gates.
- [`2026-10-23-client-state-and-web-offline-conflict-audit.md`](2026-10-23-client-state-and-web-offline-conflict-audit.md) records active-document alignment and open gaps.
- [`offline-state-resilience-sop.md`](offline-state-resilience-sop.md) remains authoritative for resilience, outbox, replay, and failure behavior.

## 1. The canonical ownership model

Every datum has exactly one authoritative owner. A cache, projection, or persisted copy must name its authority, scope, freshness rule, and invalidation/disposition path.

| Concern | Canonical owner | Not an owner |
| --- | --- | --- |
| Remote reads and server-resource lifecycle | TanStack Query and a typed data port | Zustand, service-worker cache, component state |
| Durable offline commands | Account-scoped command outbox plus server receipt/idempotency contract | TanStack mutation queue alone, generic Zustand persistence |
| Shared bounded client preferences | Zustand or a narrow browser/native storage adapter | Query cache |
| Local one-surface interaction | React local state, reducer, or context | global Zustand by convenience |
| Explicit recoverable protocol | XState only after the protocol admission test passes | a default global store |
| Authorization | Server; locally, only a verified scoped and expiring decision snapshot | query key, cached grant, or UI visibility |

`networkMode: 'offlineFirst'` is useful scheduling behavior, not durable-write proof. A query cache is not an offline command journal. A local permission decision is never server authorization.

## 2. Zustand and XState scopes

### Zustand is the default for bounded shared client state

Use Zustand when the state is a small, directly mutable value model with simple commands and independently subscribed fields: temporal navigation, active workbench tabs, theme/appearance, scoped drafts, consent choice, or local canvas preferences.

Each persisted Zustand record must declare:

1. schema version and deterministic migration;
2. scope (`device`, `explore`, `principal`, `active-bond`, `route`, or `component`);
3. allowed serialized fields and sensitivity class;
4. hydration and corrupt-record outcome;
5. sign-out, account-switch, perspective-switch, reset, and quota disposition;
6. atomic selector API and tests.

Zustand must not become an API client, an unbounded entity cache, an authorization authority, or a protocol coordinator with hidden side effects.

### XState is opt-in for protocol state

Adopt XState only when a workflow has guarded legal transitions, cancellation, retry/recovery, named terminal states, or cross-boundary coordination that a reducer would obscure. Likely candidates are account transition and active-perspective transition. The existing outbox state machine remains valid without an XState rewrite unless an actor model proves a concrete safety gain.

Every machine requires a typed event vocabulary, transition table, side-effect owner, timeout/cancellation rule, error states, observability, and a persistence decision. Persisted actor snapshots must be versioned and JSON-safe; restoration does not replay past actions. See [XState persistence](https://stately.ai/docs/persistence).

## 3. Scope-session rule

There is one active scope-session authority for principal, active bond, tenant-derived context, and perspective. `AuthSlice`, `TenantSlice`, and `usePerspectiveStore` must not remain independent authorities.

The scope transition is ordered:

```text
validate target
  → pause/cancel old scoped work
  → remove old private query cache and invalidate local decisions
  → commit one new scope
  → restore allowed scoped preferences
  → fetch verified capabilities and resources
  → resume/quarantine durable commands by their original principal and scope
```

Missing, stale, or ambiguous active-bond selection is a state error; it is never resolved by list order or hidden fallback. Server authorization re-checks every durable operation.

## 4. Web offline capability ladder

The web must be offline capable, but capability is delivered per vertical slice and must be named precisely.

| Level | User-visible promise | Required affordances | Present evidence | Release condition |
| --- | --- | --- | --- | --- |
| W0 | Preferences survive reload | guarded browser storage, scoped/versioned keys, corruption handling | localStorage and IndexedDB helpers exist | no personal/sensitive data in unscoped keys |
| W1 | Previously read content remains visible during an outage in an open tab | Query stale-data policy, offline indicator, retry/reconnect UI | Query defaults and G2 query offline scenario exist | feature renders stale age and failure state |
| W2 | The app opens when disconnected | web manifest, registered service worker, app-shell precache, offline fallback route, browser evidence | manifest exists; app-shell service-worker evidence is not yet established | install/reload offline browser test passes |
| W3 | Selected feature reads survive restart offline | account-scoped IndexedDB/OPFS replica, schema/version, quota/eviction, capability UI | browser persistence primitives and OPFS adapter exist; feature wiring must be proven | browser restart and account-isolation scenario passes |
| W4 | Selected writes survive restart and reconnect | durable account-scoped outbox, idempotency/receipt, conflict/rejection UI, foreground replay; background sync only as progressive enhancement | no platform-wide browser outbox proof | offline-write/restart/reconnect/account-switch scenario passes |

No screen may claim a higher level than it has proved. W1 is not W2; caching data in memory does not make an application launch offline. W4 does not rely on Background Sync because browsers may delay, deny, or terminate it.

## 5. Web storage and caching policy

| Browser facility | Permitted use | Forbidden use |
| --- | --- | --- |
| `localStorage` | tiny non-sensitive device preferences and explicit Explore state | tokens, grants, security data, durable commands, unbounded records |
| IndexedDB | account-scoped drafts, selected offline records/outbox, media metadata, persisted cache where policy permits | cross-account namespace, unencrypted sensitive data without approval, silent fallback to another account |
| OPFS/WASM SQLite | selective large local replicas with an account-scoped filename and lifecycle owner | app-wide default cache without a domain contract |
| Service-worker Cache Storage | immutable app assets, public static data, explicit offline fallback | authenticated API responses, personalized HTML, bearer tokens |
| TanStack Query persistence | allow-listed, expiry-bounded serializable query data | a generic persisted private cache or a command journal |

All authenticated browser data is keyed by principal and, where applicable, active bond/tenant/entity scope. Sign-out removes current private browser state according to its data classification; switching accounts closes or detaches the old runtime before opening the new scope. Normal switching must not silently delete the old account's durable locally stored work.

## 6. Platform responsibilities

### `@repo/core`

Own platform-neutral contracts: query-key/scope vocabulary, storage ports, persistence envelope contracts, command lifecycle, state classification, and scenario fixtures. It must not import browser UI, React Native UI, or platform-specific storage implementation.

### `apps/gurudevi-web`

Own Next.js request isolation, browser storage adapters, service-worker/app-shell behavior, browser offline UI, cross-tab coordination, and browser evidence. A server request receives a fresh QueryClient; a browser session may retain one client only while account-bound caches are cleared on scope transition. Web-only persistence must not import Expo/MMKV/native guest machinery.

### `apps/gurudevi-mobile`

Own native secure/local storage adapters, device lifecycle, PowerSync/mobile replica integration, and device evidence. Its offline contract remains stronger for supported vertical slices, but uses the same account/scope, command, authorization, and server-reconciliation invariants.

### `packages/*` feature domains and `@repo/ui`

Own domain hooks and rendering only. Feature UI requests data through the declared port/query hook and receives commands through typed boundaries. It does not invent a second cache, direct storage schema, or platform-specific state path.

## 7. Delivery rule

The first implementation work is the state inventory and scope-session characterization suite. The first web-offline implementation slice is a single protected or Explore workflow that proves W2 through W4 as applicable; it must include app-shell behavior, scoped local data, durable-write policy, reconnect behavior, and browser evidence. Do not announce the whole web as offline-first before those vertical slices pass.
