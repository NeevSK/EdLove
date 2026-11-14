---
title: "Client State Phase 2: Scope-Session Migration"
status: "accepted"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
scribe: "Codex"
tags: [architecture, phase-2, client-state, scope-session, identity, offline]
---

# Client State Phase 2: Scope-Session Migration

> **Canonical integration:** The enduring ownership rule is in the
> [client-state and web offline capability canon](client-state-and-web-offline-capability-canon.md).
> This record scopes, plans, and tracks the Phase 2 implementation; it does
> not supersede account-transition, command-outbox, or browser-offline SOPs.

## Decision and bounded outcome

The active client scope is one non-persistent `ScopeSessionSnapshot`:

```text
principal + active perspective + available perspectives + available bonds
  → derived active bond + tenant identifier
```

`AuthSlice`, `TenantSlice`, and `usePerspectiveStore` remain readable
compatibility mirrors during migration. They are not removed, renamed, or
allowed to become a new durable authority. The supported perspective-switch,
availability-replacement, and account-reset paths commit or reset those mirrors
through the scope-session boundary.

Phase 2 does **not** introduce XState. The transition is currently one bounded
in-memory operation with validation, rollback, and named side effects. An actor
requires explicit timeout/cancellation/retry evidence beyond this slice.

## Source-grounded risk inventory

The pre-change implementation had three independently mutable active-scope
pointers:

| Holder | Previously independent behavior | Phase 2 disposition |
| --- | --- | --- |
| `usePerspectiveStore` | Persisted active/available perspectives; switched pointer and Cedar decisions. | Compatibility mirror; coordinator owns supported transition writes. |
| `TenantSlice` | Persisted its own active/available perspective and `setSchool` could create an institutional pointer. | Compatibility mirror; reset now clears its availability too. |
| `AuthSlice` | Held in-memory active/available bonds. | Compatibility mirror; coordinator derives and writes the matching active bond. |

The most acute safety defect was reset: `resetToPersonalPerspective()` changed
only the active perspective, allowing the persisted available-perspectives list
to survive an account-scoped reset. `resetScopedStores()` now clears the
scope-session and restores **both** compatibility perspective lists to Personal
Sanctuary.

The Phase 2 audit also found and repaired an identity-bootstrap type drift:
the server contract supplies full bond facts, while the client had narrowed
them to `{ id, capacity }` and then cast them back to `Bond`. The client now
parses and normalizes the server bootstrap at the API boundary, including its
capacity dialect and active-bond membership. Authentication hydration commits the
scope-session before it marks the profile active. The explicitly selected
`SCHOOL` bond becomes the active institutional Sanctuary perspective; every
server-authorized `SCHOOL` bond remains available for an explicit switch.
Other bond entity types remain Personal until their UI semantics are explicitly
modeled. No array-order or string-parsing inference is allowed.

## Transition contract

1. Validate the requested perspective before a visible mutation: it must be in
   the supplied availability list; a non-personal perspective requires an
   authenticated principal and a matching bond. Every supplied bond must be
   owned by that same principal; anonymous snapshots cannot carry bonds.
2. Mark the short in-memory transition, clear local Cedar decisions, and emit
   the established transition-start signal.
3. Update the Perspective, Tenant, and Auth compatibility mirrors together,
   then commit the non-persistent snapshot.
4. Load scoped Cedar decisions and emit the existing completion signal.
5. If an unexpected failure occurs after the write begins, restore all three
   mirrors and the prior snapshot, then keep Cedar empty (temporary denial is
   safer than a grant from the old scope).

No list-order fallback is permitted. On availability replacement the active
perspective is retained when present; otherwise Personal Sanctuary must be
explicitly present. This rejects ambiguous scope changes instead of selecting
the first array item.

On an auth subject change, lifecycle clears only the prior derived scope before
the next identity request begins. It does not clear device preferences or the
durable command/outbox owners. That prevents Account B from rendering Account
A's scope while B's identity response is in flight.

The initial-session path applies the same boundary using the canonical snapshot
principal, with the persisted Auth user only as a migration fallback while a
snapshot has not yet been hydrated. A matching offline principal is preserved;
a different authenticated principal or signed-out session clears derived scope
before any identity request. This closes the cold-start variant of the same
Account A → Account B leak.

## Query, offline, and web boundary

The web and mobile account Query boundaries now call
`disposeAccountBoundaryQueries()`, not `queryClient.clear()`. The boundary
removes scoped queries for the outgoing principal and retains the necessary
**broad unscoped-Query fallback** for legacy resource families. It never clears
the MutationCache; durable-command ownership stays with account transition and
the outbox. This is not yet fully scope-aware disposal: Phase 3 must migrate a
characterized resource family to the Phase 1 scoped Query key utility before
the broad legacy-query fallback can shrink.

Durable mutation/outbox records are deliberately untouched: their principal,
receipt, quarantine, and replay rules remain owned by account transition.
Changing scope never silently discards commands. Web remains at its separately
proved offline capability level; this in-memory transition does not claim W2+
browser restart or durable-write capability.

## Explicitly deferred writers

`addPerspective`, `removePerspective`, and `updatePerspective` remain legacy
metadata-maintenance inputs while their server catalogues migrate. Phase 2
does not mistake every workspace lens for authorization: an institutional
perspective requires a validated `Bond`, while commercial and guardian lenses
may be committed with `authorityKind: 'workspace'`, `activeBond: null`, and no
derived permission grant. The compatibility catalogue is merged into a
transition and re-committed atomically, rather than silently treated as an
identity bootstrap.

School invite redemption now uses the existing server-side `claim_invite_code`
transaction, then asks the established identity adapter to select the returned
bond and refreshes the identity snapshot. A failed selection leaves the current
scope unchanged; the claimed bond remains server-side for a safe retry. The
client never creates a synthetic `Bond` merely to satisfy the School-bond
transition rule.

| Existing mobile flow | Current authoritative result | Phase 2 rule |
| --- | --- | --- |
| School invite redemption | Server transaction claims an active `SCHOOL` bond, then identity selection validates and persists it. | No local scope change until claim, selection, and identity refresh all succeed. |
| Commercial batch creation | Returns a commercial workspace record; no core bond is created. | It may enter `authorityKind: 'workspace'` after persistence, but never supplies an active authorization bond. |
| Guardian link | Creates or requests a relationship, which may be pending; no core bond is created. | It may be represented as a workspace lens with no identity authority; capability grants still require independent server verification. |

### Provisional offline workspace protocol

Commercial-batch creation and guardian-link requests can be retained while the
mobile client is offline. They are account-bound, persisted
`ProvisionalWorkspaceCommand` records with a
`queued → dispatching → reconciled` lifecycle and a recovery-only
`receipt_check` state. Each command carries a client-generated UUID
`idempotencyKey`; on restart, an interrupted dispatch becomes `receipt_check`
and is sent again only with that identical key. A command from Account A is
never considered for Account B.

The provisional queue is intentionally **not** an outbox authorization grant:
it never enters `ScopeSessionSnapshot`, creates a `Bond`, derives a tenant,
activates a workspace, or grants a capability. Offline creation therefore
means “durably saved request, then server-confirmed workspace,” not “pretend
the workspace already exists.” School invites remain online-only because their
claim creates an authorization bond. The web W2–W4 ladder remains a separate
vertical-slice commitment; this mobile seam is not evidence of browser offline
launch or browser durable writes.

The client key is **not** the idempotency authority. Sanctuary records the
authoritative receipt under `(account_id, capability, idempotency_key)` with a
canonical payload hash. A same-key/different-payload attempt is rejected; an
identical retry returns the committed result; the receipt update and domain
write share one database transaction. This protects against duplicate taps,
automatic transport retry, process death after sending, and a lost response.
Client state provides durability, account ownership, and UX; the server decides
whether an effect happened.

Commercial-batch and guardian-link commands now route through
`workspaceProvisioning`, rather than direct browser/mobile Supabase writes.
The service derives the actor from authentication and never accepts a client
owner field. It is bootstrap-safe (no active Bond is required), but it creates
no Bond. An optional tuition-institute attachment is accepted only when the
server finds that institute with `created_by` equal to the authenticated actor;
otherwise the client must create an independent batch. A guardian relationship remains pending; its lens is never selected as
an active authorization scope. A commercial lens is added only after the
receipt and subsequent read both succeed. Account mismatch after an await
stops client catalogue mutation.

Auth lifecycle hydration still owns identity acquisition. It must adopt the
scope-session snapshot only after the identity/bond response and perspective
catalogue are defined as one atomic server contract; Phase 2 does not invent
that contract client-side.

## Hostile-review closure plan (Phase 2.1)

The Phase 2 transition implementation is substantially present; it is **not
accepted as complete**. The following closure work is part of Phase 2, not
Phase 3:

1. **Invite authority reconciliation — decision recorded.**
   `public.invite_codes` is the canonical school-invite authority: the
   baseline schema, authoritative issuer RPC, `claim_invite_code` lock/claim
   transaction, current repositories, and mobile redemption path all use it.
   `public.school_invite_codes` is an additive, incompatible parallel table
   created by the multi-perspective migration; no copy, rename, backfill,
   compatibility view, issuer, or redeemer connects it to the canonical
   contract. It is retained untouched under the Deletion Veto. It must not be
   wired into issuance or redemption without a separately approved migration,
   backfill, and compatibility design. The legacy direct invite helper remains
   a future protocol-hardening target; it is not evidence that the parallel
   table is authoritative.
2. **Direct-writer containment — implemented for active scope.** Audit every writer to the active perspective,
   school projection, active bond, and availability lists in `AuthSlice`,
   `TenantSlice`, and `usePerspectiveStore`. A writer is acceptable only if it
   is the coordinator, a reset boundary, or a documented metadata input that
   re-enters the coordinator atomically. A direct active-scope writer is a
   Phase 2 failure, even if its field name matches. Once a canonical snapshot
   exists, legacy active-scope actions now reject rather than silently
   diverging. The switcher routes supported add/remove/update/hydration paths
   through the coordinator. Pre-snapshot legacy behavior remains available for
   compatibility until explicit removal approval. The final source scan found
   no production calls to the legacy active-scope actions and no production
   low-level `setState` writer outside the coordinator or the account-reset
   boundary; test harnesses remain intentionally direct.
3. **G2 lifecycle proof.** Characterize signed-out → signed-in, Account A →
   Account B, personal ↔ institutional, failed transition rollback, offline
   behavior, and claim → select → refresh. Assertions must cover the canonical
   snapshot, all mirrors, Cedar's safe-denial state, Query disposal, and the
   durable-command non-disposal rule where relevant.
4. **Evidence reconciliation.** This record cannot claim G5 or deployed
   backend proof without a physical authenticated run. Its frontmatter and
   exit status must be updated only after the raw diff and required gates are
   inspected.

## Evidence and remaining gates

Implemented G1 characterization covers:

- valid snapshot derivation and rejection of unknown, unauthenticated, and
  bondless non-personal scopes;
- personal-scope coordination across all three legacy mirrors;
- rollback of all three mirrors when capability refresh rejects after an
  institutional scope write;
- account-scoped reset clearing the persisted availability lists.
- web and mobile account Query boundaries remove outgoing/legacy QueryCache
  entries without clearing MutationCache commands.
- identity hydration projects a selected SCHOOL bond atomically, and retains an
  unsupported selected bond as Personal rather than guessing a perspective.
- legacy Auth, Tenant, and persisted-Perspective active-scope actions reject
  after snapshot hydration, preserving the canonical snapshot rather than
  allowing a second mutable pointer.
- commercial-batch and guardian-link UI handlers persist their relationship
  before adding or activating a workspace lens; a failed persistence operation
  leaves the current scope unchanged.
- a provisional commercial-batch or guardian-link request is durable and
  account-bound while offline, retries only for its original principal, and
  enters the perspective catalogue only after its repository returns a
  persisted server record.

Phase 2 is accepted with the evidence below. The current rollback proof is a
G1 store boundary, not a replacement for a lifecycle scenario. No direct
writer, persistence key, compatibility
selector, route, fallback, or test may be deleted without explicit human
approval.

The claim/select/refresh operation has G2 boundary coverage for success,
selection failure, and retry. Before release, device evidence still needs to
exercise the mobile shell against a real authenticated backend. Until then this
is verified scenario behavior, not G5 proof of a deployed backend.

The current G2 suite combines the scope-session lifecycle scenario (Account A
→ Account B cache/snapshot hand-off, Personal ↔ institutional transition, and
capability-refresh rollback), the mobile and web account Query-boundary
scenarios, the auth-bootstrap matching-subject offline fallback, and the
claim/select/refresh boundary scenario. It proves the named contracts under
mocked storage, identity, and backend substitutions. It does not prove device
network behavior, a deployed database migration chain, or physical offline
recovery.

## Hostile review verdict

**Accepted after Phase 2.1 closure.** The prior rejection correctly identified
that the provisional provisioning queue lacked crash recovery and a
server-backed idempotency receipt. That condition is no longer current: the
commercial-batch and guardian-link commands now use authenticated,
account/capability/key-scoped receipts, reject changed-payload key reuse, and
commit the domain result and receipt in one transaction. Interrupted dispatch
recovers with its original key; a stale account response cannot modify the
current catalogue. The hostile reviewer found no P0/P1 blocker after reviewing
the resulting authorization, replay, and pending-guardian boundaries.

This acceptance is G1/G2 boundary evidence, not G5 device or deployed-backend
proof. The web offline vertical slice and unrelated attendance-v1 command
remain distinct work and are not claimed as Phase 2 evidence.
