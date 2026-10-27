---
title: "EdLove Phase 1B: Controlled Assignment Operations Plan"
status: "superseded"
created: 2026-10-24
updated: 2026-10-25
superseded_by: "2026-10-25-canonical-uuidv8-account-cutover.md"
author: "Naveen"
scribe: "Codex"
tags: [current-progress, edlove, uuidv8, backfill, operations, identity]
---

# EdLove Phase 1B: Controlled Assignment Operations Plan

> Historical side-ID assignment plan. The [canonical cutover](2026-10-25-canonical-uuidv8-account-cutover.md)
> replaces its queue/backfill sequence with a transactional account-key migration.
> The old assignment worker is not registered; its retained modules are not a
> supported post-cutover execution path.

## Position in the larger programme

Phase 1B follows the locally verified new-durable-account handoff in
[Phase 2 Identity Authority](2026-10-24-edlove-identity-foundation-phase-2-plan.md).
It addresses only **existing** canonical accounts that predate that handoff.
It is an operations phase, not a client feature, provider migration, or
identity-key replacement.

The authoritative ordering is:

```text
0 governance/inventory
  -> 1A UUIDv8 dark schema                 [complete]
  -> 2 new durable-account authority       [locally verified]
  -> 1B controlled existing-account work   [this plan]
  -> 2 internal read introduction
  -> 3 credential/session/device stewardship
  -> 4 browser/native convergence
  -> 5 channel and workload principals
  -> 6 production hardening and retirement
```

## Outcome

Give an authorized operator a dry-run first, then a bounded, observable,
restart-safe way to assign the additive `users.edlove_id` UUIDv8 handle to
eligible historical accounts. The operation must never rewrite
`public.users.id`, provider bindings, credentials, sessions, memberships,
authorization, or client-visible identity.

The currently observed inventory is 281 existing accounts with no assigned
EdLove ID. That count is an observation, not permission to run a backfill.

## Non-goals

- No hosted migration or assignment run without an explicit human approval.
- No automatic execution at sign-in, app launch, cron startup, or deployment.
- No client, `anon`, `authenticated`, or `service_role` assignment authority.
- No public EdLove lookup, JWT claim, API response exposure, or provider change.
- No guest-data transfer, channel linking, passkey rollout, or credential merge.

## Entry gates

All gates must pass before any hosted dry run:

1. Reconcile the hosted schema against its actual migration ledger with a new
   forward migration; historical migration edits are not a deployment plan.
2. Verify Sanctuary's protected direct-database connection uses the permitted
   worker role. Do not broaden SQL grants to solve configuration drift.
3. Approve an operator identity, an environment, a maximum batch size, an
   abort threshold, and a maintenance/observation window.
4. Capture a signed pre-run snapshot: canonical-account count, assigned count,
   unassigned count, nullability/uniqueness checks, and provider-binding count.
5. Record rollback semantics: the operation pauses and preserves completed
   additive values; it never deletes or regenerates an assigned ID as a
   rollback shortcut.

## Implemented local control plane

The local migration rehearsal and focused server contracts now provide the
private operation ledger, default-off execution switch, approved-operation
gate, leased batches, checkpointing, failure threshold pause, and a
server-only worker. A checkpoint is accepted only after the existing private
UUIDv8 writer has populated `users.edlove_id`; the ledger cannot manufacture
an apparently completed assignment. This is implementation readiness, not a
hosted dry run or a permission to run one.

Guest transfer configuration is also now record-kind scoped and fail-closed.
No configuration can enable the legacy client batch uploader without a future
Sanctuary authorization-and-receipt contract.

## Workstreams

### 1. Inventory and classification

Build a server-only dry-run command that returns aggregate classifications:

| Class | Required action |
|---|---|
| Eligible | Canonical account is active, has no `edlove_id`, and meets the fixed writer preconditions. |
| Already assigned | Leave untouched; surface only aggregate/count and an operator-safe record. |
| Ineligible | Exclude with a stable reason code; do not repair the account in this phase. |
| Ambiguous/integrity anomaly | Stop the affected shard and require investigation; never guess a provider or target. |

The dry run must be deterministic from a snapshot boundary and must not mint,
reserve, or write an ID.

### 2. Server-only operation ledger

Introduce a private operation/checkpoint model, owned by the server role:

- operation ID, requested environment, policy/version, bounded selection
  cursor, maximum batch, state (`planned`, `dry_run`, `approved`, `running`,
  `paused`, `completed`, `failed`), and aggregate counters;
- immutable per-attempt result with opaque canonical account reference or
  protected internal key, outcome/reason code, writer result, and timestamp;
- idempotency key per operation/account so retries reuse the existing writer
  result rather than minting a second value;
- no raw provider subject, email, phone, token, or full UUID in application
  logs or public telemetry.

### 3. Controlled execution

The worker claims a small leased batch from the private operation ledger,
calls only `assignEdloveAccountId`, records a completion receipt, and releases
the lease. It must stop immediately on the configured error threshold.

Concurrency is one until a separate load, collision, and operational review
approves otherwise. A crash, timeout, unique collision, or database failure
must make the item retryable without changing any pre-existing account field.

### 4. Observability and operator controls

Provide count-only metrics and protected operator views for:

- eligible / skipped / assigned / already-assigned / failed / retried;
- queue depth, lease expiry/reclaim, collision retries, and failure reason
  categories;
- explicit pause, resume, and kill-switch actions, all receipt-backed.

The operator cannot supply an arbitrary account ID to the assignment writer;
selection always comes from the approved private operation ledger.

### 5. Verification and rollout

1. **G0:** SQL grants, raw-diff review, static contracts, and no public RPC.
2. **G1:** unit/boundary tests for classification, checkpoint transitions,
   idempotency, pause/kill switch, and error threshold.
3. **G2:** local Supabase scenario with mixed eligible/already-assigned/
   ineligible accounts, crash/reclaim, retry, and count reconciliation.
4. **R1:** a human-approved hosted dry run only; compare the signed snapshot
   with the operation ledger and show zero mutations.
5. **R1 execution:** a separately approved canary batch, reconciliation,
   observation window, then incremental batches. Each stage needs a go/no-go
   decision; no automated escalation.

## Exit criteria

Phase 1B is complete only when a dry run and an approved, bounded operational
run each reconcile exactly; every historical account is either assigned once
or has a durable, reviewed exclusion reason; all provider bindings and
canonical `public.users.id` values are unchanged; and the operation can pause
and resume without duplicate assignment. Completion does not authorize client
read exposure or removal of compatibility paths.

## Detailed next phases after Phase 1B

1. **Internal read introduction:** expose EdLove ID only to documented
   server-internal consumers while all authorization remains keyed by
   `public.users.id`.
2. **Credential/account stewardship:** human credential add/remove/recovery,
   device/session management, recent-auth and MFA policy, takeover tests, and
   receipts.
3. **Browser/native convergence:** consume one server authority from both
   clients; prove callback, account-switch, offline wake, and fallback
   behavior before retiring any route.
4. **External principals:** connect the existing WhatsApp/Telegram server
   ceremony to user-facing status/revoke/recovery; keep agents delegated
   capabilities rather than human identities.
5. **Production hardening:** monitoring, key rotation, outage/abuse drills,
   rollout controls, device evidence, and explicit approval before retirement.
