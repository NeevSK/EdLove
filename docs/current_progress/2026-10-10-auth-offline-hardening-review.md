---
title: "JWT, Offline Resilience, Query and Transport Hardening Review"
status: "active"
created: 2026-10-10
updated: 2026-10-10
author: "Gurudevi product architecture"
tags: [security, jwt, offline-first, tanstack-query, pacer, effect, hardening]
---

# Hardening review

This is a hostile review of the current web/API account foundation. It records
what is implemented, what is only partially covered, and the production work
still required. A local cache surviving for days is not equivalent to a
durable write being synchronized for days.

## JWT and session findings

Implemented:

- Sanctuary API verifies Supabase JWT signatures with Web Crypto and checks
  issuer, audience, algorithm, expiry, not-before, and subject claims.
- JWKS refreshes are coalesced and verification results are bounded/cached.
- Web middleware uses `getClaims` for request authentication rather than
  treating `getSession` as cryptographic authorization.
- Browser calls compare the session user ID with the verified subject before
  forwarding the bearer token.

Fixed in this review:

- The web `AuthProvider` now subscribes to Supabase auth-state events and
  cleans up the subscription. Refresh, expiry, sign-out, and cross-tab session
  changes update the React auth state instead of waiting for a manual refresh.

Remaining JWT/session risks:

- The API verifier still has legacy `any` boundaries around decoded JWT/JWK
  values; these should become validated runtime schemas.
- JWKS cache invalidation and key rotation need an explicit stale-key recovery
  test and metric.
- Browser auth events need a mounted component test covering refresh,
  sign-out, and unsubscribe behavior.
- A valid JWT does not imply a valid account, onboarding state, or relationship;
  every durable handler must still resolve the server account and scope.
- Access and refresh tokens must never be placed in query strings, persisted in
  domain caches, or logged by transport/telemetry layers.

## Offline and multi-day resilience

Current support:

- TanStack Query uses `offlineFirst`, stale data, garbage-collection, and
  bounded retries.
- Shared resilience helpers provide stale-while-revalidate cache fallback.
- Native classroom paths already use PowerSync/local queues for selected writes.
- Effect 4.0.2 exists in `@repo/core` and already provides typed retry/error
  workflows.
- Pacer throttles invalidation, debounces input, and batches rapid actions.

Required production contract:

1. Cached reads need schema version, account/scope namespace, created-at,
   last-validated-at, and a maximum stale horizon. “Available offline” must be
   shown as stale when beyond the freshness target.
2. Durable writes need an outbox record with operation ID, contract version,
   actor subject, target scope, input hash, local status, retry count, and last
   error. They must remain pending across browser restarts and device sleep.
3. Replay must be idempotent and server-reconciled. A timeout after commit must
   query the receipt before retrying the command.
4. Expired authentication pauses replay. The queue must not replay a write under
   a different account or stale relationship.
5. Conflict policy must be explicit per capability: last-write-wins is not
   acceptable for attendance, grades, membership, deletion, or moderation.
6. After prolonged offline time, the UI must distinguish local-only work,
   pending sync, rejected sync, and successfully synchronized work.

## TanStack Query and Pacer boundary

TanStack Query owns server-state caching, invalidation, and observer lifecycle.
Pacer owns timing governance for high-frequency UI/sync events. Neither should
become the durable mutation queue. PowerSync/Drizzle or a browser-safe outbox
owns durable offline records; Effect orchestrates the workflow and typed
failure/retry decisions.

Recommended flow:

```text
UI command
  → validate contract
  → create operation receipt/outbox row
  → Effect workflow
  → authenticated transport
  → server idempotency/receipt
  → invalidate or update TanStack Query cache
  → Pacer-coalesced refresh/invalidation
```

Do not use `networkMode: 'offlineFirst'` as proof that mutations are durable.
It controls query/mutation scheduling; it does not supply domain-specific
idempotency, conflict resolution, or multi-day persistence by itself.

## Effect 4 adoption rule

Use Effect 4 for new cross-boundary workflows where typed failure channels,
timeouts, retries, cancellation, or reconciliation materially reduce risk.
Keep existing stable Promise/oRPC handlers until an adapter and characterization
tests exist. Do not mix Effect 3 and Effect 4 in a new workflow; the repository
currently contains both versions transitively because Prisma tooling brings in
Effect 3 while core/mobile use Effect 4.

## Next hardening gates

- G1: JWT/JWKS rotation, auth-event, and cache-namespace tests.
- G2: multi-day offline read/write/replay/re-auth scenarios.
- G2: duplicate mutation and timeout-after-commit reconciliation.
- G3/G4: browser restart, tab change, visibility change, and offline UI flows.
- R1: telemetry for auth failures, stale cache age, queue age, replay outcome,
  and receipt reconciliation without sensitive payloads.

Until these gates exist, the system is “offline-capable” for selected paths,
not universally safe for arbitrary multi-day offline work.
