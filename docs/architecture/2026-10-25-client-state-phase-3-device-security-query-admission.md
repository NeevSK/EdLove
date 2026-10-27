---
title: "Client State Phase 3.3: Device-Security Query Admission"
status: "accepted"
created: 2026-10-25
updated: 2026-10-25
author: "Codex"
tags: [architecture, phase-3, device-security, tanstack-query, security]
---

# Client State Phase 3.3: Device-Security Query Admission

> **Canonical integration:** This is the executable admission record for the
> device-security family in the [Phase 3 scoped remote-state plan](2026-10-24-client-state-phase-3-query-migration-plan.md).
> It inherits the ownership, authorization, and browser-offline constraints in
> the [client-state and web offline capability canon](client-state-and-web-offline-capability-canon.md).

## Decision

Move only the authenticated **device-security summary read** from
`useDeviceSecurityStore` to a principal-scoped TanStack Query hook. The
summary contains devices, sessions, audit events, authentication events, and
the current-device trust projection. It is informational UI data, never an
authorization decision.

`trustDevice`, `unlinkDevice`, `revokeSession`, and `revokeAllSessions` remain
server commands through `DeviceSecurityManager`, the existing offline intent
queue, and the server-side receipt/idempotency contract. A queued action is
shown as pending; it is never represented as a completed security change.

## Bounded seam

| Concern | Owner after Phase 3.3 | Deliberate non-action |
| --- | --- | --- |
| Device/security summary read | `useScopedDeviceSecurity` Query cache | No Zustand mirror or persisted Query snapshot. |
| Trust, unlink, revoke commands | Existing manager/API/outbox path | No optimistic grant/revocation in the Query cache. |
| Queue status | Existing mutation queue | It remains a durable-command projection, not Query state. |
| Authorization | Server and verified capability flow | Cached `isTrusted`/`trustStatus` never grants a capability. |
| Browser controls | Existing browser-safe `DeviceSecurityCenter.web` | No remote device/session control is introduced in the browser. |

## Scope and cache contract

Device security belongs to the authenticated principal rather than the active
school, bond, tenant, or perspective. Its key is therefore:

```text
['scope', principalId, null, null, null, 'device-security', 'summary']
```

Admission requires a committed, non-transitioning `ScopeSessionSnapshot` whose
principal equals the requested authenticated principal. Missing, mismatched, or
transitioning scope disables the request and produces an unavailable state; it
does not produce an empty security center. Account-bound Query disposal removes
only the outgoing principal's key and never clears the `MutationCache` or
durable outbox.

The Query function races the existing non-abortable transport against TanStack
Query's abort signal. That prevents a late response from repopulating the
replaced scope even while the legacy transport itself finishes in the
background.

## Failure and command semantics

- Summary reads retry retryable transport failures at most twice. Authorization
  denial and scope errors do not retry and remain visible.
- A failed read does not silently render an empty device list or a healthy
  trust score.
- Commands retain their current server outcome. On a confirmed success the
  exact active summary key is invalidated and refetched. On a queued outcome
  no completed state is written to Query; queue status remains visible until
  reconciliation.
- A command failure leaves the last confirmed summary intact and exposes the
  error. It does not mutate a trust flag locally to make the UI look resolved.

## Execution plan

1. Add principal-only device-security key and scope-admission helpers beside
   the existing scoped notification convention.
2. Promote the existing abort race into `clientStateFoundation` so the native
   attendance and device-security Query hooks share one tested primitive.
3. Implement `useScopedDeviceSecurity` with explicit unavailable/error/loading
   states and no persisted cache.
4. Remove `useDeviceSecurityStore` after every consumer is moved; no command
   status store replaces its remote summary cache.
5. Rewire `useDeviceSecurity` to Query reads plus existing command functions;
   invalidate only the exact active summary following confirmed mutation.
6. Add G1 cache-isolation, admission, cancellation, queued-command, and
   confirmed-invalidation evidence. Run the affected mobile and core checks,
   then conduct a deletion-first diff review.

## Exit gate

Phase 3.3 is complete only when no device-security summary is independently
mutable in Zustand; principal A can never read principal B's summary; missing
scope is explicit; cancellation prevents late scope writes; confirmed command
results refresh the exact key; queued commands remain visibly unconfirmed; and
cached security state is not used to authorize any action.

## Implementation and evidence (2026-10-25)

The summary now has one owner: `useScopedDeviceSecurity`. The former
`useDeviceSecurityStore` and its independently mutable remote-read state were
removed after confirming that its sole production consumer was
`useDeviceSecurity`. That compatibility removal was explicitly authorized for
this migration; command transport, queue behavior, and the browser-specific
security component were retained.

`useDeviceSecurity` now composes the scoped summary read with the unchanged
`DeviceSecurityManager` command path. Confirmed commands invalidate the exact
principal key. Queued commands leave the last confirmed summary untouched and
are represented only through the existing durable queue signal. The native
security center no longer optimistically hides a device or marks a session
revoked before confirmation.

```text
G0 static / TypeScript - @repo/core and @repo/ui check-types: passed.
Proves: the scoped hook, removed store imports, port contract, and native UI
consumer typecheck under the workspace compiler.
Does not prove: a live server, device transport, or a physical device journey.

G1 boundary / Vitest - core scoped security, foundation, and notification suites: 21/21 passed.
Proves: scope admission, principal-only key shape, exact invalidation,
outgoing-account cache disposal while preserving MutationCache, cancellation,
queued-command non-refresh, confirmed refresh, and rejected-command propagation.
Does not prove: deployed RPC behavior, queue replay, or real device UI.

G1 boundary / Vitest - @repo/classroom scoped attendance suite: 3/3 passed.
Proves: the shared Query abort primitive preserves the existing attendance
scope/cancellation contract.
Does not prove: physical mobile runtime behavior.

G4 platform bundle / Next.js - `pnpm --filter gurudevi-web build`: passed.
Proves: the web production graph remains buildable after the shared core
exports changed.
Does not prove: the native security center on a physical device or a live
security backend journey.
```

The full mobile typecheck remains blocked by 21 unrelated pre-existing errors
in editorial FlashList props, workspace-layout test contracts, EntryShell,
Lottie props, and community DTO types. The Phase 3.3 source itself typechecks
through `@repo/core` and its native UI consumer through `@repo/ui`.

## Non-goals and release evidence

This does not make the browser device-security center remotely capable, enable
offline trust/revocation, persist security snapshots, or prove a physical
device/deployed-backend journey. Those require separate authorization and
browser/device evidence. The existing web component truthfully directs remote
security controls to mobile and remains unchanged.
