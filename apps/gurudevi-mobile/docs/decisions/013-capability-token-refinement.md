# ADR-013 — Capability Token Refinement: Q1/Q3/Q6 Resolution

**Status:** Accepted
**Date:** 2026-07-23
**Extends:** ADR-004 (Capability token per operation context, `docs/gurudevi-architecture-draft-1.md:88`)
**Depends on:** ADR-005 (WASM singleton), ADR-006 (policy_version table)
**Source analysis:** `docs/2026-07-23-docs-grounded-architecture-analysis.md`

---

## Context

ADR-004 defined capability tokens conceptually but left three open questions that were surfaced during the docs-grounded architecture analysis:

- **Q1**: Is a feature flag a "gate" that invalidates a token?
- **Q3**: Should `IAuthorizationPort` use capability tokens (ADR-004), per-call `isAuthorized()`, or both?
- **Q6**: Does the `policy_version` table exist, and how does it connect to token lifecycle?

These questions block implementation. ADR-004 said "token must be invalidated on account swap, logout, and policy version change" but did not say whether feature flag flips also invalidate. ADR-006 defined `policy_version` but the table was never created. The code uses per-call evaluation everywhere — no token issuance exists.

This document resolves all three as one coherent decision.

---

## Decision

### Q1 Resolved: Feature flags do NOT invalidate capability tokens

Per D1 (`gurudevi-sanctuary-permission-architecture.md`), feature flags are a **deployment state descriptor**, not an authorization gate. They control whether a code path is operationally active — a rollout concern, not a permission concern.

A token answers: *"Was this principal authorized for this action on this resource at time of issuance?"* A feature flag answers: *"Is this feature rolled out to this user's cohort?"* These are orthogonal.

- Feature flag flips do NOT invalidate issued tokens.
- `sanctuaryFeature()` checks flags as a cross-cut *after* authorization, per D1's model.
- The sole invalidation triggers are: **policy version change**, **account swap**, **logout**, **TTL expiry**.

### Q3 Resolved: Both — `isAuthorized()` for UI, `issueCapabilityToken()` for writes

The port interface supports two operations with different performance characteristics:

```
interface IAuthorizationPort {
  // Lightweight — evaluates Cedar for a single check.
  // Used by UI hooks (useSanctuaryFeature) for "show/hide button" decisions.
  // Call pattern: infrequent, one-off.
  isAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision>

  // Issues a scoped capability token for a batch of writes.
  // Used by SecureDrizzleProxy at the start of an operation context.
  // All writes in that context validate the token, not re-evaluate Cedar.
  // Call pattern: once per operation context (e.g. "mark attendance for this class").
  issueCapabilityToken(context: TokenContext): Promise<CapabilityToken>
}
```

**Why both:**

| Concern | `isAuthorized()` | `issueCapabilityToken()` |
|---------|-----------------|--------------------------|
| Performance | Single eval — fine for UI checks | One eval for N writes — batch amortization |
| Code path | `useSanctuaryFeature` → UI gating | `secureDrizzleProxy` → write validation |
| Frequency | Every render/button check | Once per user action |
| Hermes/WASM cost | Acceptable — UI checks are rare | Critical — bulk operations hit 5-30 writes |
| Offline | N/A — UI waits for decision | Token issued at context start, used offline |

**The token sits on top of the WASM singleton (ADR-005), not as a replacement.**

- ADR-005 solves: WASM 2MB load once, policy parsing once.
- ADR-004/012 solves: per-write `evaluate()` call (policy re-parse per evaluation in Cedar WASM FFI).

Both are needed. The singleton makes WASM available. The token avoids paying the per-call FFI cost for each write.

### Q6 Resolved: `policy_version` table is the invalidation key

ADR-006's `policy_version` table is implemented as specified. It is the invalidation trigger:

- Zone A PowerSync-synced table: `policy_version { id, hash, updatedAt }`
- Server increments `hash` atomically with any Cedar policy change
- Client detects change via `useLiveQuery` on `policy_version`
- Change triggers:
  1. Invalidate all in-memory capability tokens
  2. Fetch fresh `permission_snapshot` from server
  3. Queue writes during the fetch window (do not silently permit/deny)

**Token invalidation matrix:**

| Event | Invalidates tokens? | Mechanism |
|-------|-------------------|-----------|
| `policy_version.hash` changes | Yes | `useLiveQuery` → clear token cache |
| Account swap | Yes | Boot flow: clear all state |
| Logout | Yes | Boot flow: clear all state |
| TTL expiry | Yes | Token `expiresAt` check on `secureDrizzleProxy` |
| Feature flag flip | No | Orthogonal concern |
| Navigation away | No | Token scope is operation context, not screen |

---

## Token Structure

```
CapabilityToken {
  tokenId: string           // UUID v4
  principalId: string       // User::"uuid"
  tenantId: string          // Tenant scope
  operationContext: string  // e.g. "attendance_session:classroom_abc"
  deviceId: string
  issuedAt: number          // Unix ms
  expiresAt: number         // issuedAt + TTL (default 60s, configurable)
  policyVersionHash: string // Snapshot of policy_version.hash at issuance
}
```

---

## Consequences

1. **`IAuthorizationPort` gains `issueCapabilityToken()`** — the existing `isAuthorized()` stays for UI checks. Both share the same WASM singleton.

2. **`secureDrizzleProxy` no longer evaluates per write** — it validates the token. Token validation is: check `expiresAt`, check `operationContext` matches write target, check `policyVersionHash` matches current `policy_version`. No WASM call.

3. **Operation context must be defined** — each bulk-write call site must declare its operation context string. This is a developer contract, not enforced by the type system.

4. **`policy_version` Zone A table must be created** — ADR-006 was never implemented. This is now a prerequisite for token support.

5. **Feature flags remain a cross-cut** — they are checked in `sanctuaryFeature()` but MUST NOT be checked in `secureDrizzleProxy`. The proxy validates authorization only.

6. **Existing ADRs are not superseded** — ADR-004, ADR-005, ADR-006 are all affirmed. This document refines the boundary between them and resolves ambiguity.

---

## Implementation Order

1. Create `policy_version` Zone A table (ADR-006, prerequisite)
2. Add `issueCapabilityToken()` to `CedarAuthorizationAdapter`
3. Add token validation to `secureDrizzleProxy` (replace per-write `_permissionValidator`)
4. Wire token invalidation from `policy_version` `useLiveQuery`
5. Add token invalidation to account swap and logout flows
6. Characterization tests on `secureDrizzleProxy` current per-write behavior BEFORE step 3
