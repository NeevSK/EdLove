---
title: "API v0-to-v1 Gate C — Atomic Adapter and Canonical Admission Plan"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [api, architecture, gate-c, v1, orpc, attendance, idempotency, compatibility]
---

# API v0-to-v1 Gate C — Atomic Adapter and Canonical Admission Plan

## Decision

Gate C admits exactly one canonical v1 capability: `classroom.attendance.batch-record`.
It will have one explicit HTTP entry under `/api/v1`, use the typed Gate B command, and settle its operation receipt plus attendance writes in one database transaction. `/api/*` v0 remains unchanged, mounted, and independently callable.

This gate does **not** migrate callers, retire v0, create a general BFF, add product-activity emission, or create a broad event framework. It is the smallest production-shaped proof that the target architecture can carry a real scoped mutation.

## Starting evidence and hostile finding

Gate B deliberately left its application command unmounted. It demonstrates validation, authority, idempotency replay, payload conflict, dependency failure, and lost-response recovery with fakes.

The hostile review found an admission blocker in its present port shape: `claim()`, `recordBatch()`, and `complete()` are individually awaited. A real adapter cannot claim atomicity merely because each operation is correct alone. A process crash, database rollback, or timeout can otherwise leave an attendance write and receipt in incompatible states.

Gate C therefore introduces an explicit transaction boundary around those existing ports. It is an additive refinement of the unmounted Gate B seam, not a v0 behavior replacement.

## Capability and route

| Item | Gate C decision |
| --- | --- |
| Capability | `classroom.attendance.batch-record` |
| Canonical HTTP path | `POST /api/v1/classroom/attendance/batch-record` |
| Command body | Gate B's strict command body; actor, school, role, and scope stay server-derived. |
| Idempotency | Required UUID `idempotencyKey` in the body, scoped by actor + capability; payload hash mismatch is a conflict. The UUID constraint matches the existing durable receipt column. |
| Success response | Typed outcome: operation ID, `committed` or `replayed`, and only the records needed by the caller. |
| Errors | Validation, authorization, scope mismatch, idempotency conflict, operation-in-progress, and service failure map to stable transport responses. |
| v0 | Existing `/api/attendance/*`, native oRPC paths, contracts, handlers, clients, aliases, and tests stay as-is. |

The explicit mount must be registered before `registerNativeORPCRoutes()` because that function owns a broad `/api/*` fallback. A new literal v1 endpoint may not be added merely to `nativeORPCPaths`: its RPC handler routes by the existing router namespace, so a literal v1 canonical path needs its own declared adapter.

## Architecture

```text
POST /api/v1/classroom/attendance/batch-record
          |
          v
Hono + oRPC v2 transport adapter
  - build existing request context
  - derive principal / active scope / capability
  - map only declared errors
          |
          v
@repo/core attendance command
  - validate body
  - reject absent capability or out-of-scope class
  - hash canonical payload
          |
          v
transaction boundary
  claim/read receipt -> write attendance -> audit decision -> complete receipt
          |                         one database transaction
          v
existing operation_receipts + attendance persistence
```

The adapter may reuse the proven `operation_receipts` SQL and transaction discipline in `apps/sanctuary-api/src/core/assignmentSettlement.ts`. It must not reuse or silently alter the v0 attendance route's response shape.

## Work sequence

### C1 — make atomicity expressible in the command seam

Add a transaction port that supplies transaction-scoped receipt and attendance ports to the existing command. Keep the command transport-free. The database adapter must run the callback inside one transaction; the fake used by G1/G2 executes the same callback against deterministic in-memory ports.

**Admission rule:** an adapter that cannot provide transaction-scoped receipt and attendance ports is rejected. Do not simulate atomicity with a process lock, best-effort compensation, or an in-memory idempotency map.

### C2 — implement the Sanctuary persistence adapter

Create an app-owned adapter which:

1. derives authority from the existing authenticated active-scope context;
2. rechecks the persisted school/class relationship inside the transaction before write;
3. claims or locks the receipt using the existing unique receipt identity;
4. writes the attendance batch and its minimal audit decision with the same transaction client;
5. marks the receipt completed with a safe replay result; and
6. rolls back all writes if the command cannot settle.

Concurrent same-key submissions must result in one committed attendance mutation and one replay (or a bounded in-progress response while settlement is genuinely unresolved). A changed-payload reuse must never write.

An operational write failure rolls back the pending receipt with the attendance/audit work. Gate C therefore does not persist a misleading `failed` receipt from inside the same transaction; the caller safely retries with the same key. A completed receipt remains the only durable replay claim.

### C3 — declare and mount the single v1 oRPC/Hono adapter

Declare a dedicated, typed v1 transport contract and implementation rather than attaching v1 semantics to the v0 compatibility contract. Use installed `@orpc/*` beta.44 declarations and current repository router patterns as the source of truth. Register only the literal canonical route before the native `/api/*` catchall. Its adapter builds the normal request context and invokes the command; it does not duplicate validation, authorization, idempotency, or persistence policy.

The transport layer must make the required idempotency key visible to the caller and map the command's declared failures without leaking database errors or receipt payloads.

### C4 — add a narrow v1 client entry only after route proof

Expose one explicit client function for this command, separate from `@repo/core/api/attendance.ts` and its v0 namespace. No existing web/mobile caller moves in Gate C. The entry should make replay/operation-in-progress an intentional caller-visible state rather than hiding retry behavior.

### C5 — characterize and verify the compatibility boundary

Add focused route-level tests for: explicit v1 mount matching before the catchall; first commit; same-payload replay; changed-payload conflict; denied/stale scope; transaction failure rollback; and v0 attendance's current batch endpoint remaining independently callable. Use the existing native route diagnostics test style to verify mount order rather than inferring it from source order.

## Deliberately deferred

- v0 caller migration, deprecation, removal, redirects, or alias removal;
- a generic `/web-bff/*` layer;
- corrections/amendments, until a durable operation-link model is designed;
- product activity emission for student attendance; the Gate B default remains no user-visible activity event;
- broad telemetry/event-stream work, offline queueing, and OpenAPI-wide normalization;
- all other domain capabilities.

## Hostile architectural review ledger

| Checkpoint | Rejection condition |
| --- | --- |
| Atomicity | Receipt and attendance use separate database transactions, a process-memory lock, or unverified compensation. |
| Authority | Client body supplies actor/school/scope, or a stale preflight scope is trusted without transactional recheck. |
| Compatibility | Any v0 route, handler, fallback exception, contract, client, alias, or test is removed or behaviorally replaced. |
| Routing | v1 is swallowed by the native `/api/*` catchall, or a wildcard v1 namespace is introduced without an explicit contract. |
| Privacy | Attendance status/student detail leaks to product activity, generic telemetry, or receipt replay beyond the caller's need. |
| Abstraction | A general event bus, repository layer, BFF, or "v2 framework" appears for this one capability. |
| Evidence | Unit tests alone are used to claim database, routing, or v0 compatibility proof. |

## Evidence matrix

| Level | Required evidence | Bound of claim |
| --- | --- | --- |
| G0 | Core and API typechecks; installed oRPC declaration inspection | Types and current API surface, not runtime. |
| G1 | Transaction-port unit tests, including commit/replay/conflict/rollback mapping | Fake storage, not SQL behavior. |
| G2 | Stateful same-key concurrency and lost-response recovery through an adapter harness | Controlled database/test harness, not production traffic. |
| G3/G4 | Hono/oRPC route mount tests plus v0-v1 coexistence characterization | Mounted app behavior, not physical production traffic. |
| Delta gate | Raw unified diff reviewed deletions first; zero unapproved v0 removal | Scope and intent, not deployment safety. |

## Exit criteria

Gate C is complete only if a single literal v1 endpoint executes the command through a transactionally coherent receipt/attendance adapter, reports deterministic replay/conflict states, and has route-level coexistence evidence for v0. It is not complete because a `/api/v1` folder, route prefix, or client wrapper exists.

Any inability to make the existing attendance persistence use the same transaction client is a stop condition for implementation—not permission to weaken atomicity or change v0 behavior.

## Implementation checkpoint — 2026-10-23

Implemented the Gate C vertical slice, without moving any v0 client or route:

- `AttendanceBatchTransactionPort` now provides transaction-scoped receipt and attendance ports to the Gate B command. Its idempotency key is a UUID because `operation_receipts.idempotency_key` is UUID-backed.
- `attendance-v1.orpc.contract.ts` declares the sole canonical procedure, and `attendanceV1.ts` implements it through oRPC v2's contract/procedure layer.
- The Sanctuary adapter reuses the existing `operation_receipts` transaction pattern, persists the existing attendance primitive with the same transaction client, rechecks the active persisted scope, writes minimal audit evidence, and only then commits the receipt.
- `canonicalV1.ts` mounts the literal `/api/v1/*` surface before the legacy native `/api/*` catchall. The actual route is `POST /api/v1/classroom/attendance/batch-record`.

Evidence so far is substituted-database G1 plus route-registration composition, not a deployed database or production-client claim. The first external caller migration, offline behavior, concurrency against a real Postgres instance, and v0 retirement remain deferred.

The v1 adapter evidence covers first commit, replay, changed-payload conflict, stale active scope, synthetic audit failure rollback, and an actual Hono-to-OpenAPI/oRPC v2 request using the literal canonical path. The transaction test double rolls back its fixture state; it proves the adapter's transaction boundary contract, not Postgres isolation or crash recovery.
