---
title: "Cross-Platform Local-First Foundation — Implementation Plan"
status: "in_progress"
created: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [foundations, local-first, offline, powersync, nextjs, expo, idempotency]
---

# Cross-Platform Local-First Foundation — Implementation Plan

## Goal

Build one trustworthy mutation and reconciliation substrate that downstream
features inherit. It must work across Expo mobile, Next.js web, multiple
devices, and a remembered-account mobile install without making PowerSync,
browser storage, or an AI-generated workflow the authority for user data.

**Release decision (2026-09-21):** `gurudevi-web` is online-only. This plan
builds no browser command persistence, OPFS/PowerSync-web integration, or
browser background replay in the current release. The shared contracts must
remain platform-neutral so those capabilities can be added later without
rewriting feature callers.

The server remains the authority for identity, tenant scope, authorization,
conflict disposition, and command settlement. PowerSync distributes authorized
canonical data and buffers eligible local writes; it does not make a local
write final.

## Architecture decision

```text
               shared, platform-neutral contracts in @repo/core
 command creator → principal-bound command store → coordinator → transport → durable server receipt
                         │                         │                 │              │
                     UI state                 retry/lease         adapter       canonical projection
                         │                         │                 │              │
 Expo adapter: SecureStore / native SQLite / PowerSync ────────────┘              │
 Next adapter: cookies / capability-checked browser store / optional PowerSync ──┘
```

The generic command store owns user-visible intent and settlement. PowerSync's
own CRUD upload queue remains an adapter-owned replication mechanism. Do not
mirror the same business mutation into both systems unless a deliberately
designed bridge proves one receipt settles both; otherwise dual paths duplicate
writes and recovery states.

## Existing leverage and deliberate non-additions

| Reuse | Role in this implementation |
| --- | --- |
| Effect (`effect`) | Typed transport/error boundary and bounded retry schedules. Do not add another retry library. |
| Zod (`zod`) | Validate command and receipt envelopes at network boundaries; domain payload schemas stay owned by their domains. |
| Zustand + `SafeZustandStorage` | Persistence adapter for the command-store state only; it is not an authorization/session store. |
| `accountScope`, `deviceAccounts`, and existing scoped storage | Bind a command to its original principal and coordinate a transition without cross-account replay. |
| `SingleActivePowerSyncRuntime` and `SupabasePowerSyncConnector` | Optional replication adapter lifecycle only. They do not settle generic business commands. |
| `classifyError`, conflict store, audit log, event bus | Consolidate into the new typed lifecycle rather than creating parallel UI state. |
| Inngest | Downstream asynchronous workflow after a durable command receipt, never evidence that a user mutation has settled. |

No new state-management, retry, offline, event-bus, or AI-agent framework is
needed. Adding one would repeat the fragmentation this plan removes.

## 2026-09-21 implementation record — foundation safety slice

Implemented before any downstream migration:

1. `useMutationQueue` binds omitted `userId` to the active account, fails
   closed for replay of legacy unbound work, refuses capacity overflow without
   evicting accepted commands, and keeps logical-clock allocation atomic with
   the insertion.
2. The queue records explicit lifecycle states. Auth-paused work only resumes
   through a principal-scoped recovery call; a UI/account reset preserves the
   original principal's pending work.
3. Inngest event acceptance is now an explicit pending state. The mobile
   bridge forwards the mutation ID as transport identity and polls the typed
   oRPC receipt route backed by the worker ledger; the handler scopes lookup to
   the requesting actor and
   settles only after completion; timeout remains retryable and never falls
   through to a second direct dispatch.
4. The Expo headless/background drainer retains its efficiency policy and
   recovery behavior, but now filters by active principal, acquires leases,
   records lifecycle state, and preserves account metadata during DLQ retry.
   Its legacy persisted DLQ is imported into the core recovery store before use,
   so it is a migration source rather than a second long-term authority.
5. `AccountTransitionPort` resolves the outgoing principal before remembered
   account switch, removal, or sign-out: preserve quarantines owned commands;
   explicit discard removes only owned commands; replicated PowerSync data is
   then cleared for the old identity.

This is deliberately not a claim that every legacy registry mutation has a
durable server idempotency receipt, that the queue is fully discriminated and
typed, that browser command persistence exists, or that PowerSync settles a
business command. Those remain the next RED work because no local client can
manufacture a server receipt.

## Platform boundaries

| Concern | Shared core | Expo mobile | Next.js web |
| --- | --- | --- | --- |
| Identity binding | Typed principal/tenant/perspective fields; no platform imports. | Remembered-account authority, SecureStore sessions, native link lifecycle. | Supabase SSR cookie clients, Proxy token refresh, server-side verified entry. |
| Local command persistence | Port and schema only. | Encrypted/account-partitioned native store. | Client-only browser storage adapter after capability check; never during SSR. |
| Sync replication | Connector/receipt interfaces. | Native PowerSync/SQLCipher adapter if feature enabled. | Optional PowerSync web adapter only after worker/OPFS/storage checks; online-only fallback remains valid. |
| Cross-device conflict | Receipt and domain policy types. | Present conflict/retry resolution UI. | Same UI contract, rendered client-side; server data stays server-rendered where possible. |
| Background work | Coordinator interface and leases. | OS task wakes the same coordinator; it is not a second processor. | Foreground/resume/reconnect by default. Service-worker sync is opportunistic only. |

## Implementation sequence

### Phase 0 — verify service and product decisions

No client integration or deployment changes occur in this phase.

1. Verify the existing PowerSync topology: cloud or self-hosted, authorized
   environment/instance, actual backend/source database, deployed Sync Streams
   or legacy sync rules, JWT validation, source publication, and durable
   idempotency-receipt migration. Do not assume current code means the service
   is operational.
2. Approve account-switch custody: preserve an original principal's pending
   commands in a quarantined partition and require explicit discard after
   re-authentication (recommended), or specify a destructive policy.
3. Assign an explicit conflict policy for each command class. Start with
   server-authoritative conflict for shared edits; use commutative append only
   where the domain proves it safe.
4. Define retention/redaction for command metadata and server receipts. Raw
   sensitive payloads, bearer tokens, notes, and callback parameters do not go
   in telemetry, error messages, or general audit UI.

### Phase 1 — RED shared command contract (partially implemented)

Target: `packages/core/src/logic/` plus a small, typed persistence/transport
port. The lifecycle, capacity policy, and `AccountTransitionPort` are
implemented; the versioned envelope, typed registry, and command-store port
remain.

1. Create a versioned `MutationCommand` once at user intent: UUIDv7 command ID,
   immutable idempotency key, canonical payload digest, command type/version,
   created time, original principal, tenant, perspective, and resource target.
2. Replace `any` queue variables and string registry dispatch with discriminated
   command/receipt types. A dispatch handler receives the full command, never
   just `variables`.
3. Define durable state transitions only: `queued`, `dispatching`,
   `retry_scheduled`, `auth_paused`, `conflict`, `rejected`, `reconciled`, and
   explicitly-confirmed `discarded`.
4. Add a `CommandStore` port partitioned by original principal. Its capacity
   policy refuses a new command before it evicts existing accepted work.
5. Add an `AccountTransitionPort`: auth requests `preserve_and_quarantine` or
   explicitly confirmed `discard`; core performs it. No auth adapter clears a
   global outbox directly.

### Phase 2 — one server settlement protocol (receipt read path implemented)

1. The typed receipt read contract and actor-scoped worker-ledger lookup exist.
   Add one command envelope and atomic receipt-write contract to the Sanctuary API. The
   server validates bearer subject, tenant/perspective authority, command type,
   schema version, key/digest collision, and domain preconditions.
2. In the same database transaction as the domain write, store a durable
   receipt keyed by principal + idempotency key and payload digest. Return
   `applied`, `already_applied`, `rejected`, or `conflict`; event submission is
   not a receipt.
3. Map typed failures without message parsing: unauthenticated/session expired,
   authorization revoked, validation rejected, conflict, retry-after/rate
   limited, transient service fault, and idempotency collision.
4. Emit a privacy-safe correlation ID and metrics for accepted, replayed,
   rejected, conflict, retry, queue age, overflow, and reconciliation delay.

### Phase 3 — replace competing coordinators (mobile consolidation in progress)

1. Make `SyncManager` the initial coordinator design, but remove its
   fire-and-forget event-success branch.
2. The restored mobile `backgroundSync` now shares lifecycle, account, lease,
   and receipt semantics and imports its legacy DLQ into the core store. Finish
   extraction into a single coordinator rather than preserving duplicate
   scheduling code indefinitely.
3. PowerSync connector failures remain adapter signals. Bridge them into the
   common typed state only after a receipt-aware command design is in place.
4. Implement a single per-command UI state source; aggregate status indicators
   derive from it and are principal-scoped.

### Phase 4 — migrate low-risk adopters, then local-first domains

1. Device-security commands validate strict principal scope and receipt replay.
2. Profile/school/classroom updates remove queue-then-direct double dispatch;
   define coalescing only where semantically safe.
3. Wellbeing/reflection moves local SQLite optimistic writes through a receipt
   reconciliation policy and proves sensitive-data redaction.
4. Attendance becomes an adopter after the substrate is stable, rather than a
   parallel outbox. Its batch conflict policy is explicitly server-authoritative
   until a reviewed merge policy exists.

### Deferred expansion — Next.js browser capability adapter

This is explicitly out of the current release scope. It remains a distinct
AMBER/RED slice after the shared foundation is proven, not part of callback
auth hardening.

1. Keep authenticated route data server-rendered and server-authorized through
   Next/Supabase cookie sessions. Client components receive minimal DTOs.
2. Instantiate browser command storage only in a client component after
   capability probing. Browser storage contains only principal-scoped command
   data/drafts—never Supabase session credentials.
3. Capability tiers:
   - **Tier 0:** server-rendered, online-only. The safe universal baseline.
   - **Tier 1:** small scoped preferences/recoverable drafts, with write-error
     handling.
   - **Tier 2:** durable command store after storage quota/write checks.
   - **Tier 3:** optional PowerSync OPFS replication for supported, opted-in
     browser sessions.
4. A web PowerSync adapter is client-only, stable across React development
   remounts, uses per-principal database names, and is disconnected on account
   transition only after the command partition is handled.
   It must use the shared typed `orpcClient` contracts; Hono remains the server
   host, not a parallel browser API client.
5. Browser background sync is enhancement only. It has limited availability;
   foreground reconnect/resume must always settle queued work.

### Phase 6 — hardening, rollout, and proof

1. Feature-flag the common coordinator and migrate one command class at a time.
   There is no dual business dispatch. Rollback pauses new dispatch and keeps
   commands visible/quarantined; it never deletes them.
2. Add a reconciliation runbook: inspect command/receipt by correlation ID,
   re-drive an unchanged retryable command, resolve a conflict, quarantine after
   role revocation, and recover from browser/native storage loss.
3. Add measurable budgets: command-store size/age, retry count, storage usage,
   first-sync duration, PowerSync worker boot, mobile battery/network policy,
   and client bundle impact.

## AI-era engineering guardrails

AI can accelerate typed adapters and test matrices, but cannot infer domain
authority. Keep the system reviewable and resistant to plausible-looking
mistakes:

- One generated/AI-authored command schema must be validated at the server and
  tested against the same contract fixtures on mobile and web.
- Authorization is rechecked on every server settlement; no cached capability,
  local row, model output, or client-provided tenant field can authorize a
  mutation.
- Agent/tool actions use the same command API with actor type and correlation
  metadata, never a privileged alternate write path.
- Use contract/property tests for replay, altered payload, principal switch,
  restart, concurrent device, and duplicate transport cases. Generated tests
  must assert state/receipt invariants, not merely mocked call counts.
- Record human-approved conflict/retention decisions beside the command type.
  AI suggestions do not silently select last-write-wins or destructive cleanup.

## Browser and performance baseline

OPFS is broadly available in secure contexts, but browser storage remains
origin-scoped, quota-managed, and can be evicted; private browsing has
different retention. Probe `navigator.storage.estimate()` and handle writes
failing with `QuotaExceededError`. Do not synchronously store queue payloads in
`localStorage`; it is small, origin-wide, and blocks the main thread. Request
persistent storage only for an explicitly user-valued offline capability, and
still handle refusal.

Test real Chrome/Edge, Firefox, Safari desktop, and Safari iOS against: no
storage, private mode, quota exhaustion, one/two tabs, account switch,
offline-refresh-reconnect, suspended/closed tab, slow CPU/network, and a
mobile+browser concurrent edit. Record browser and OS versions with results.

## Evidence gates

| Gate | Minimum proof before promotion |
| --- | --- |
| G0 | Immutable envelope, legal state transitions, principal partition, conflict/key collision, lease, overflow refusal, receipt convergence. |
| G1 | Native/browser persistence and failure substitutes, transport receipt protocol, coordinator contention, authorization/session failure mapping. |
| G3 | Both clients render command state and recovery actions correctly under documented substitutions. |
| G4 | Browser capability matrix and Next SSR/client boundary. |
| G5 | Android + iOS + browser concurrent/reconnect/account-switch lifecycle. |
| Operations | Durable receipt migration verified, dashboards/alerts/runbook exercised, rollout rollback tested. |

## References informing this plan

- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
  recommends centralized authorization and server-side checks for sensitive
  operations.
- [Supabase SSR guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&package-manager=npm&queryGroups=framework&queryGroups=package-manager)
  specifies separate browser/server clients, cookie refresh through Proxy, and
  verified claims for protected data.
- [Supabase PKCE guidance](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
  documents one-time short-lived codes and the overlapping-flow verifier risk.
- [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
  and [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
  support the capability-tier and storage-failure approach.
- [MDN Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
  marks it limited-availability, so it cannot be the sole web replay design.
