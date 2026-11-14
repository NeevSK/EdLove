---
title: "Client State Phase 3.4: Authorization-Snapshot Admission Plan"
status: "draft"
created: 2026-10-25
updated: 2026-10-25
author: "Codex"
tags: [architecture, phase-3, entitlements, cedar, authorization, tanstack-query]
---

# Client State Phase 3.4: Authorization-Snapshot Admission Plan

> **Do not implement from this document without the admission checks below.**
> This plan is intentionally stricter than the notification or device-security
> migrations because stale authorization information can cause harm.

## Current substrate

- `useEntitlementStore` owns a persisted, principal/bond-scoped commercial
  snapshot with a 24-hour freshness limit. `CapabilityHydrationProvider`
  loads it when authenticated identity and active perspective are ready.
- `useCedarDecisionStore` owns a local PowerSync/Drizzle read of a signed,
  expiring, policy-versioned permission snapshot. Scope transitions clear it
  and load the next scope through `ScopeSessionCoordinator`.
- `usePermissions` and `useSanctuaryFeature` synchronously consume both
  stores. Their evaluator blocks privileged capability when authorization or
  entitlement readiness is not valid.

These are related but not interchangeable. An entitlement describes
commercial access. A Cedar decision is an authorization projection whose
signature, policy version, expiry, and scope must all be verified.

## Decision boundaries

| Candidate | Can Query own remote-read lifecycle? | Must remain outside generic Query persistence? | Why |
| --- | --- | --- | --- |
| Fresh entitlement snapshot | Yes, after key and stale/offline contract are proven | Yes | The current one-day snapshot is a scoped mobile continuity policy, not general cached server data. |
| Cedar decision snapshot | Only after signed local-read contract is extracted | Yes | Its cryptographic signature, expiry, policy-version match, and fail-closed behavior are authorization controls. |
| Trust/purchase/revoke writes | No | Yes | These remain server commands with receipt/idempotency and server authorization. |

## 3.4a — entitlement read lifecycle

### Required key and admission facts

The key must include `principalId`, `activeBondId`, `activeEntityId`, and
`activeEntityType` where the server adapter filters grants on those facts. It
must not fabricate an absent entity or merge snapshots across perspectives.
The hook admits only a committed matching scope-session and authenticated
identity.

### Required design before code

1. Extract the adapter read behind an abort-aware port; prove cancellation
   cannot write a late Account A/bond A snapshot into Account B/bond B.
2. Specify whether the existing persisted entitlement envelope becomes a
   read-only, versioned offline seed or is retained as a separate bounded
   continuity boundary. Do not let Query and Zustand independently mutate it.
3. Preserve the 24-hour expiry rule and prove expired/corrupt/mismatched data
   becomes `stale`/`error`, never `verified` or a grant.
4. Replace `CapabilityHydrationProvider` only after every synchronous
   permission consumer can receive the same readiness semantics.
5. Keep server command and receipt paths untouched.

### Exit gate

Account/bond/entity/perspective changes cannot reuse an old commercial
snapshot; a failed or expired snapshot fails closed; the selected offline
continuity strategy has one writer; and all capability consumers retain their
current safe-denial behavior.

## 3.4b — Cedar decision snapshot lifecycle

### Required key and admission facts

The decision key must bind `principalId`, authorization scope/bond, active
perspective where applicable, policy version/hash, snapshot expiry, and the
verified signature outcome. A cache key alone is never evidence of authority.

### Required design before code

1. Extract a pure verified-snapshot read port from `useCedarDecisionStore`;
   the port must return an explicit verification result rather than a raw
   decision map.
2. Preserve signature verification, policy-version comparison, expiry checks,
   and scope matching before any Query value is exposed.
3. Model tampering, no snapshot, stale policy, expired snapshot, and storage
   failure as safe denial/loading—not an empty successful capability set.
4. Prove scope transition clears/cancels the old decision projection before
   the next one is admitted.
5. Do not move server-side Cedar evaluation or treat a client decision as
   final authorization for a command.

### Exit gate

A snapshot can affect UI affordance only after all verification checks pass;
missing or invalid data fails closed; policy changes invalidate affected
snapshots; and no client cache grants a server-side operation.

## Evidence plan

| Tier | Required proof |
| --- | --- |
| G0 | Typed scope/key contracts, source import audit, deletion-first diff review. |
| G1 | Key isolation; expiry/signature/policy/scope failures; exact invalidation; MutationCache/outbox preservation. |
| G2 | Account A→B, personal↔institutional, stale-to-refresh, offline return, subscription/poll reconnect, delayed response, and server denial. |
| G3/G4 | Mounted capability consumers and mobile/web bundles after their real consumer boundaries change. |
| G5 | Authenticated device and browser scenarios only when those surfaces ship. |

## Non-goals

This increment does not add browser entitlement persistence, expose remote
device security in web, persist a generic private Query cache, replace server
authorization, or delete the current stores before their consumer and offline
continuity contracts are proven.
