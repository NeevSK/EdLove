---
title: "API v0-to-v1 Gate B — Kernel and Proving Capability Plan"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [api, architecture, gate-b, v1, orpc, attendance, idempotency]
---

# API v0-to-v1 Gate B — Kernel and Proving Capability Plan

## Decision

Gate B will prove the v1 capability model with one **unmounted** Classroom Learning command: `classroom.attendance.batch-record`. It will reuse no v0 route as a v1 alias, change no `/api/*` behavior, and create no BFF.

The capability will be mounted only in Gate C after its authority, idempotency, receipt, audit/activity decision, and failure behavior are proved. This follows the governing [v0/v1 canonicalization plan](./2026-10-23-api-v0-v1-canonicalization-plan.md) and is bounded by the [Gate A baseline](./2026-10-23-api-v0-v1-gate-a-baseline.md).

## Why this proving capability

The existing v0 attendance batch route is a genuine durable, scoped mutation: it writes a batch in a transaction and already maps failure to a conflict response. It is therefore meaningful enough to prove duplicate submission, lost response, scope change, authorization denial, and correction semantics.

It is not selected because it is easy. Current source leaves the v1-required idempotency key, durable operation receipt, explicit active-scope authority check, event decision, and correction vocabulary incomplete. Those gaps are precisely what Gate B must expose.

## Scope

### Included

1. A typed v1 capability contract and capability identifier, isolated from the compatibility barrel.
2. A typed server-derived authority input boundary: principal, active scope, school/classroom facts, correlation, and request idempotency key.
3. An application-service seam for attendance batch recording that has no Hono/oRPC dependency.
4. Explicit command lifecycle outcomes: accepted/completed replay, idempotency-key/payload conflict, authorization denial, scope mismatch, validation failure, and unexpected dependency failure.
5. An operation-receipt port and in-memory test double; no schema migration unless existing storage cannot represent the required invariant.
6. A decision record for audit, product activity, telemetry, and privacy. It must state which emissions are intentionally deferred.
7. G0/G1/G2 evidence, a hostile review log, and a compatibility statement proving v0 is untouched.

### Excluded

- Mounting `/api/v1/*` or changing Hono registration order (Gate C).
- Migrating web/mobile callers or adding a BFF.
- Deleting aliases, legacy contracts, compatibility clients, or direct-access paths.
- Broad event-stream work, telemetry capture, persistence schema redesign, or a general event framework.
- Treating the existing `/api/events/stream` route as the activity solution.

## Architecture boundary

```text
v1 contract (shared, typed)
        ↓
v1 application command (no HTTP dependency)
        ↓
authority + receipt + attendance repository ports
        ↓
existing persistence adapters / explicit future adapter

Hono/oRPC v1 route and first client: Gate C only
v0 native oRPC routes: unchanged
```

The v1 contract may carry metadata and declared errors, which oRPC supports as contract-first concerns; it must not contain business logic. The application command owns lifecycle rules. The route adapter added in Gate C will translate transport inputs to the command and map declared failures; it must not recreate authority or mutation rules.

## Non-negotiable capability contract

| Concern | Gate B rule |
| --- | --- |
| Capability ID | `classroom.attendance.batch-record` is stable and appears in receipt/audit metadata. |
| Actor and scope | Server-derived only. Body fields cannot nominate actor, school, or active scope. |
| Target | Every item must resolve to the active scope's school and requested grade class. |
| Idempotency | Caller supplies one opaque key. Same actor + capability + key + equivalent payload replays the stored outcome; a different payload conflicts. |
| Receipt | A durable receipt records pending/completed/failed state and safe recovery reference. |
| Correction | Explicitly deferred. The first command cannot claim correction semantics until the persistence model can safely link a new operation to an earlier receipt. |
| Audit | Mutation emits a minimal actor/capability/target/outcome audit decision. Content and student-sensitive details are minimized. |
| Product activity | Default is **no user-visible activity event** until a product audience, consent/visibility, and retention decision exists. |
| Telemetry | Record technical success/failure and latency without attendance payload contents. |
| Offline | No transport promise in Gate B. Gate C client work must define queue/replay behavior. |

## Work sequence

### B1 — carve the types and ports

Create a dedicated v1 module with capability ID, input/output schemas, failure vocabulary, authority context type, receipt port, attendance port, and event-decision types. Do not export it through `@repo/core/api/index.ts`.

**Acceptance:** compile-time types demonstrate that transport data cannot become authority data and every result has a receipt reference.

### B2 — implement the application command

Implement the command against ports. It must first establish authority, acquire/read the receipt using a payload hash, apply the batch once, complete/fail the receipt, and return a typed outcome. It must never call Hono, oRPC, or browser APIs.

**Acceptance:** boundary tests cover first success, same-payload replay, changed-payload conflict, missing authority, scope mismatch, repository failure, and receipt recovery.

### B3 — define emission and correction policy

Write the audited minimal event decision alongside the command. Correction is explicitly blocked in this gate because the existing data model has not yet been proved to represent correction linkage safely.

**Acceptance:** no code emits a product event by default; audit/telemetry decisions are inspectable and payload-minimized.

### B4 — admission review

Review callers, planned route shape, OpenAPI status, client package entry point, monitoring, and a v0 characterization test. Only then create the Gate C mount proposal.

**Acceptance:** Gate C receives a named route adapter, named client surface, and a compatibility matrix—not a wildcard registration.

## Hostile review checkpoints

At each checkpoint, reject the work if any of these becomes true:

1. A v1 type is re-exported through the v0 compatibility barrel.
2. Input body claims actor, school, role, or active scope.
3. Idempotency lives only in process memory or retries a changed payload.
4. A product activity event records attendance details without purpose, audience, retention, and visibility policy.
5. A v0 route, fallback exception, handler behavior, test, or alias changes without explicit deletion/replacement approval.
6. A generic “event bus,” BFF, or repository wrapper is introduced without a stable domain rule.
7. The evidence only proves unit behavior while claiming route/client/production safety.

## Evidence gates

| Gate | Required evidence | What it does not prove |
| --- | --- | --- |
| G0 | Typecheck and contract/port shape checks | Database transaction, HTTP wiring, or live policy. |
| G1 | Unit/boundary tests with fake receipt, authority, and repository ports | Real persistence and route behavior. |
| G2 | Stateful replay/recovery scenario using deterministic fakes | Hono/oRPC mounting, real database constraints, production traffic. |
| Gate C prerequisite | v0 characterization plus explicit adapter/client plan | Permission to remove v0. |

## Exit criteria

Gate B completes only when the v1 command is unmounted, independently testable, and demonstrates the selected lifecycle cases without changing v0. It does not complete merely because a new folder, type, or route prefix exists.

## First implementation boundary

The first implementation is B1: a small `@repo/core` v1 capability module and its tests. The application command follows only after the installed contract declarations and existing core domain ports have been inspected. This order prevents a second, parallel attendance implementation from appearing accidentally.

## Implementation checkpoint — 2026-10-23

Implemented, unmounted foundation:

- `packages/core/src/logic/domains/attendanceCommand/contract.ts`: capability ID, strict input boundary, and minimal audit/product-activity/telemetry decision;
- `ports.ts`: authority, receipt, and attendance repository ports;
- `service.ts`: validation, scope/capability checks, idempotency replay/conflict handling, failure handling, and receipt-recovery behavior; and
- `service.test.ts`: G1 boundary cases plus a stateful G2 lost-response replay scenario.

Not implemented by design: a persistence adapter, a `/api/v1` route, OpenAPI projection, client entry point, BFF, migration, or any v0 replacement. Receipt claim/mutation/completion atomicity remains a mandatory Gate C adapter admission requirement, not a property inferred from the in-memory tests.
