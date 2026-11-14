---
title: "EdLove Identity Foundation: Reconciled Status and Phase 2 Plan"
status: "superseded"
created: 2026-10-24
updated: 2026-10-25
superseded_by: "2026-10-25-canonical-uuidv8-account-cutover.md"
author: "Naveen"
scribe: "Codex"
tags: [current-progress, edlove, identity, uuidv8, authentication, migration]
---

# EdLove Identity Foundation: Reconciled Status and Phase 2 Plan

> Historical ledger, superseded by the [canonical UUIDv8 cutover](2026-10-25-canonical-uuidv8-account-cutover.md).
> The nullable `edlove_id` and queued assignment sequence below no longer governs
> account creation. UUIDv8 now belongs in `public.users.id`; credential subjects
> remain provider-owned. Unfinished stewardship and operational evidence gates
> carry forward into the cutover ledger.

## Purpose

This is the current implementation ledger for the full EdLove identity
foundation. It reconciles the broad convergence programme with the narrow
UUIDv8 account-persistence work completed on 2026-10-23. It replaces no
architecture authority: the programme and the sovereign-identity authority
remain normative. Its job is to prevent the completed dark-schema slice from
being mistaken for completed account identity convergence.

## Authority and invariant set

- [EdLove Identity Convergence Program](../architecture/edlove-identity-convergence-program.md)
  defines programme order and phase gates.
- [Authentication and Sovereign Identity Authority](../architecture/authentication-and-sovereign-identity.md)
  defines account, credential, session, lifecycle, scope, and actor boundaries.
- [EdLove UUIDv8 Specification](../architecture/edlove-sovereign-uuidv8-specification.md)
  defines the wire format and registry.
- [Account UUIDv8 Authority Completion Record](2026-10-23-edlove-account-id-authority-completion.md)
  records only the private write-authority/dark-schema slice.
- [Cross-Channel Identity and Guest Conversion Contract](../architecture/2026-10-23-cross-channel-identity-and-guest-conversion-contract.md)
  defines device guests, channel identities, and non-human actors.

The non-negotiable model is:

```text
verified credential subject
        -> server-owned provider binding
        -> canonical public.users.id
        -> lifecycle and scoped authorization
        -> additive EdLove UUIDv8 account handle
```

`public.users.id` remains the canonical relational account key. A provider
subject is a credential vector, not an account key. `edlove_id` is an additive
durable handle, not a session, authorization, tenancy, or public bearer value.

## Reconciled programme status

| Programme phase | Actual status | Evidence already present | Work still required before exit |
|---|---|---|---|
| 0. Governance and inventory | Partial | Canonical authority, UUIDv8 specification, convergence programme, and historical documents identify the model and boundaries. | Reconcile remaining dated progress records as historical/superseded where they conflict; publish a current issuer/environment and migration-operating ledger. |
| 1A. UUIDv8 profile and dark schema | Complete as a bounded subphase | Profile-v1 vectors, server issuer, validator, nullable unique `users.edlove_id`, private writer, focused assignment/backfill tests, and zero assigned accounts. | None for the dark-schema boundary itself; do not call this full Phase 1 completion. |
| 1B. Controlled assignment and backfill | Not started operationally | Assignment service and route-unattached bounded backfill helper exist. No user IDs, provider bindings, or 281 existing account values were changed. | Keep historical accounts out of the new-account handoff; dry-run/classify eligible accounts; define operator authorization, checkpoint/audit persistence, metrics, kill switch, staged backfill, and R1 evidence. |
| 2. Identity Authority | Locally verified; hosted rollout pending | The private handoff queues only newly durable accounts; its leased worker uses the private writer. Fresh local replay, 47 pgTAP role/queue/trigger assertions, and Sanctuary resolver/assignment/worker tests are green. Existing provider bindings and account resolution remain intact. | Create a hosted forward reconciliation from the actual migration ledger, verify the deployed worker database role, then collect environment operational evidence. Do not queue or assign any existing account without Phase 1B authorization. |
| 3. Credential/account stewardship | Partial | Provider-neutral intent and explicit-link requirements are documented; channel server linking exists separately. | Human credential link/unlink, recovery, device/session management, recent-auth/MFA policy, receipts, and negative takeover tests. |
| 4. Web/mobile convergence | Partial | Shared route/lifecycle foundations and local-guest work exist. | Shared server authority consumption across browser/native, callback/wake/account-switch proof, and no fallback retirement without characterization/approval. |
| 5. Delegated/external principals | Partial | Verified WhatsApp/Telegram ingress, explicit server channel-link API, and durable-agent server boundaries exist. | User-facing channel stewardship, support recovery, provider operations, dedicated device/workload credential lifecycle, and end-to-end authorization evidence. |
| 6. Production hardening/retirement | Not started | Rollback principles are documented. | G0--G5/R1 evidence, monitoring, abuse/key-rotation/outage drills, rollout controls, and explicit approval before retiring compatibility paths. |

## What was completed, precisely

The completed 2026-10-23 work is a safety foundation, not account migration:

- The database accepts only the registered account UUIDv8 profile in the new
  nullable column and preserves the existing canonical account ID.
- Only the private, server-used assignment function may write a non-null
  `edlove_id`; ordinary `postgres`, `anon`, `authenticated`, and `service_role`
  paths are not assignment authorities.
- The assignment primitive is idempotent, bounded on collision, and rejects
  malformed, missing, or deleted canonical accounts.
- The bounded backfill helper has no route, scheduler, or automatic caller.
- The observed starting state is 281 existing accounts with zero `edlove_id`
  values. No backfill has run.

This does **not** prove that every durable account is assigned, that an account
can be resolved by EdLove ID, that a client may receive that ID, or that
Supabase/provider/linking behaviour has changed.

## Immediate implementation phase: Phase 2, Identity Authority

### Outcome

Create one server-owned account-resolution seam for verified human issuer
subjects. The seam returns a safe canonical account/lifecycle projection. A
separate server worker may idempotently ensure an additive EdLove UUIDv8 handle
**only for a newly created durable account**, after a transactional handoff
request has committed. It must preserve
all current Supabase bindings, `public.users.id`, RLS, and client compatibility
paths.

### Scope

1. Characterize the actual Sanctuary account-creation and provider-subject
   resolution paths, including their callers and failure states.
2. Define a narrow server-only identity-authority contract: verified issuer
   subject in; canonical account/lifecycle projection or typed denial out.
3. Define and prove a server-only transactional handoff request from canonical
durable account creation to `assignEdloveAccountId`. Its worker may run only
after the creation transaction has committed and only when it carries an explicit
   newly-created durable-account signal; ordinary account resolution/sign-in
   must not invoke it. Never assign from a raw client account ID, email, phone
   number, guest ID, or channel contact.
4. Keep `edlove_id` internal to the authority response unless a separate
   server consumer has a documented need. Do not add a browser/mobile lookup
   endpoint in this phase.
5. Add G1/G2 tests for resolution, missing binding/account, deleted account,
   provider mismatch, repeat resolution, assignment failure, and assignment
   idempotency. Fail closed: an assignment failure must not fabricate an ID or
   silently rebind a credential.
6. Add structured, privacy-safe audit/operational events for authority result
   and assignment outcome. Do not log raw provider subjects, tokens, emails,
   phones, or UUID-derived authorization data.

### Confirmed substrate and required handoff

`public.sync_canonical_auth_account()` is the committed database transaction
that creates the canonical account and the `supabase` provider binding from an
`auth.users` insert or update. It also observes an anonymous-to-durable
transition through `auth.users.is_anonymous`. Sanctuary's
`resolveAuthenticatedAccount()` runs only on a later authenticated request;
therefore it must not infer newness from an ordinary lookup or assign during
every sign-in.

The staged implementation adds a server-readable, non-client-writable
transactional handoff signal set only when that trigger either creates a
non-anonymous `public.users` row or transitions an anonymous account to
durable. A missing historical binding during an update is not sufficient. The
signal must remain absent for all pre-existing accounts and for later updates
to an already durable account. A Sanctuary worker may consume that signal,
call the existing private writer idempotently, and record/clear the signal only
after a confirmed result. A Sanctuary cron worker retries the private ledger
every five minutes. If the worker or assignment fails, the signal remains for
safe retry; no account, provider binding, or identifier is rolled back or
rewritten.

The enqueue itself is intentionally fail-closed: it is part of the canonical
auth trigger transaction, so an unavailable private ledger aborts durable
account creation or conversion rather than silently creating an untracked
eligible account. Deployment must verify that the trigger owner can insert into
the private table and that Sanctuary's protected `DATABASE_URL` is the
direct-database role permitted to execute the private assignment function and
read the ledger. This is a deploy-time prerequisite, not a reason to grant
`service_role` or a client role access.

### 2026-10-24 implementation checkpoint

The staged migration now makes the handoff ledger an exclusive, recoverable
server work queue. `private.claim_edlove_account_assignment_requests(integer)`
uses `FOR UPDATE SKIP LOCKED`, returns an opaque claim token, and gives the
worker a five-minute lease. Completion and failure writes require that token;
an expired lease is reclaimable. The function is private and executable only
by the direct Sanctuary database role. This avoids concurrent cron workers
claiming the same live request while preserving idempotent assignment after a
worker crash.

The registered Inngest cron worker has concurrency one, defaults off unless
`EDLOVE_ACCOUNT_ID_ASSIGNMENT_WORKER_ENABLED` is exactly `true`, records only
sanitized failure codes in the private ledger, and emits count-only operational
logs. It never logs account IDs, provider subjects, credentials, or candidate
UUIDs. Enabling it in any environment remains an explicit deployment action.

The SQL fixture specifies the trigger transitions and lease semantics. On
2026-10-24 it executed against a fresh, local Supabase replay through
`20261024010000_edlove_durable_account_assignment_handoff`: all 47 pgTAP
assertions passed. The fixture uses a local-only `auth.users.is_anonymous`
compatibility column because the pinned local Auth image does not expose that
production Auth field. This is G2 database evidence for the transaction,
permissions, queue, and lease contracts—not hosted Supabase, production
credentials, device clients, or production rollout evidence.

### Release boundary: replay is not deployment

Several historical migrations were repaired so a new local database can replay
the active ledger. Those edited, already-numbered migrations must **not** be
treated as a deployed-database release mechanism: a database which has already
recorded those versions will not rerun them. Before any hosted deployment,
create and review a new forward reconciliation migration from the hosted
`supabase_migrations.schema_migrations` ledger and actual schema
introspection. No hosted migration, backfill, or configuration change was
performed in this phase.

The private SQL grants intentionally allow only `postgres` to claim the queue
and execute the assignment writer. Before enabling the worker in an
environment, verify the configured Sanctuary direct `DATABASE_URL` establishes
that role (or separately approve a new forward migration for a dedicated
non-login worker role). Never solve this by granting `anon`, `authenticated`,
or `service_role` access.

### Explicit non-goals

- No rewrite of `public.users.id`, `auth.users`, `auth_identities`, foreign
  keys, RLS, provider configuration, or existing Supabase authentication flow.
- No automatic linking/merging by matching email, phone, device, social
  profile, WhatsApp/Telegram contact, or AI-agent metadata.
- No live backfill, public EdLove-ID lookup, EdLove ID in JWTs, client-side
  issuance, passkey launch, or guest-data transfer enablement.
- No deletion or replacement of legacy auth/session routes.

### Design decisions to hold

| Decision | Phase 2 rule |
|---|---|
| New durable account | Assignment happens only from the server worker consuming the committed creation handoff after canonical persistence succeeds. If assignment fails, retain the durable account and binding, return a typed recoverable server outcome, and retry through a controlled server job; never roll back or rewrite the canonical account. |
| Existing account | Assignment remains absent until a separately authorized, bounded operator backfill; ordinary sign-in must not become an unobserved bulk migration. |
| Anonymous/local device guest | No EdLove account UUIDv8 assignment. A device-local UUIDv4 is provisional storage namespace only. |
| External channel first contact | Persist only verified channel ingress identity. It acquires an account handle only through explicit authenticated link to a durable account. |
| AI/workload principal | Separate durable principal registration and delegated capability; never a human session or provider-subject alias. |
| Assignment failure | Return a typed server failure and preserve binding/account. Never mint a fallback ID or alter provider mapping. |

### Exit gate and ordered next phases

Phase 2 exits only when a verified, already-bound human subject resolves to the
same canonical account/lifecycle projection on repeat, a committed creation
handoff makes idempotent assignment through the private writer for a new
durable account, and every negative path above has focused evidence. Existing
accounts remain untouched. It does not authorize live backfill.

Then proceed in this order:

1. **Phase 1B operations:** dry-run and classify the 281 accounts; add
   server-controlled operator invocation, checkpoint/audit store, metrics and
   kill switch; perform no live batch without explicit operator authorization.
2. **Phase 2 read introduction:** after assignment coverage and privacy review,
   introduce server-internal EdLove-ID resolution while authorization remains
   keyed to `public.users.id`.
3. **Phase 3:** credential/session/device stewardship and recovery.
4. **Phases 4--5:** client convergence, explicit channel/device/agent linking.
5. **Phase 6:** production rollout and only then approved retirement.

## Evidence plan

| Level | Required evidence | Does not prove |
|---|---|---|
| G0 | Contract/type and raw-diff review; no direct client write or public lookup surface. | Database role behaviour or runtime account flow. |
| G1 | Resolver/assignment boundary tests, including typed negative outcomes and one-write idempotency. | Real Supabase/session callback or contention. |
| G2 | Stateful durable-account creation/resolution and retry scenario with a substituted provider/database. | Browser/native UI, physical devices, or production rollout. |
| G3/G4 | Mounted API/client contract only when a bounded consumer is added. | Device deep links, secure storage, or production controls. |
| G5/R1 | Deferred to client and operations phases. | Not a Phase 2 completion claim. |

## Hostile review checklist

- Does the authority accept only a server-verified issuer subject, rather than
  caller-supplied account or credential identifiers?
- Is the assignment call downstream of canonical account durability and
  upstream of no authorization decision?
- Does every failure preserve the existing binding and canonical ID?
- Is the diff contained to the resolver/authority seam and its focused tests?
- Is the existing backfill helper still route-unattached and disabled?
- Are writes proven through the private function rather than a role check,
  client setting, or public RPC?
- Is every claimed test evidence level and limitation recorded?

