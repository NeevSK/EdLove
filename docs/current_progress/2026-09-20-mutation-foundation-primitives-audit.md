---
title: "Mutation Foundation Primitives — Production Hardening Audit"
status: "in progress"
created: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [mutations, idempotency, offline, reconciliation, outbox, sync, foundations]
---

# Mutation Foundation Primitives — Production Hardening Audit

## Scope and correction

The earlier attendance-first proposal is superseded. A domain mutation cannot
be hardened safely while the cross-client substrate has competing definitions
of command identity, persistence, dispatch, retry, failure, and settlement.

This audit covers the shared mutation/outbox primitives and every currently
located direct consumer in `packages/`, `gurudevi-mobile`, `gurudevi-web`, and
the Sanctuary API. It is an inventory and critique, not production evidence.

The implementation sequence is maintained in the companion
[Cross-Platform Local-First Foundation Plan](2026-09-20-cross-platform-local-first-implementation-plan.md).

## Known architecture map

```text
Producers ──┬─ useSafeMutation ────────────────┐
            ├─ direct useMutationQueue writers ├─ persisted Zustand queue
            ├─ PowerSyncDataAdapter ───────────┘           │
            └─ PowerSync SQLite CRUD batch ────────────────┤
                                                            ├─ SyncManager (foreground)
                                                            ├─ backgroundSync (mobile)
                                                            └─ PowerSync connector
                                                                  │
                                               registry / Inngest dispatch / oRPC / Hono
                                                                  │
                                                        distinct server handlers
```

There is no single command envelope or authoritative state machine across
these paths. A queue entry is only partly typed, and dispatchers receive or
preserve different subsets of its fields.

## Located foundation owners

| Responsibility | Current owner(s) | Assessment |
| --- | --- | --- |
| Queue persistence and local duplicate filtering | `packages/core/src/lib/sync/useMutationQueue.ts`, `types.ts` | One persisted store exists, but it is not a command ledger and silently evicts active work at capacity. |
| Foreground drain | `packages/core/src/lib/sync/sync/SyncManager.tsx` | Has useful lease, backoff, conflict, auth-pause, and schema-migration concepts, but bypasses its own settlement guarantees through an event dispatch hook. |
| Background drains | `apps/gurudevi-mobile/src/lib/backgroundSync.ts`, `backgroundSyncTask.ts` | A second and incompatible queue processor/DLQ/retry policy operates on the same store without the foreground safeguards. |
| Mutation execution registry | `packages/core/src/lib/sync/registry.ts` | Untyped global string-to-`any` bridge; commands receive variables only, losing command identity and authorization scope. |
| Command creation convenience | `packages/core/src/hooks/useSafeMutation.ts` | Handles in-flight tap suppression and offline fallback, but is not the sole producer and creates a different audit/queue identity. |
| PowerSync local-first bridge | `packages/core/src/adapters/powersync/syncData.adapter.ts`, `SupabasePowerSyncConnector.ts` | A distinct CRUD-batch protocol with deterministic batch hashes and a server transaction; it is not integrated with the generic queue lifecycle. |
| Server idempotency | `packages/core/src/api/handlers/sync.ts`, `apps/sanctuary-api/src/core/handlers/sync.ts` | PowerSync has a transactional-ledger attempt; generic oRPC middleware is process-local and optional. They are different authorities. |
| Mobile foreground host | `apps/gurudevi-mobile/src/entry/AuthenticatedSyncService.tsx`, `lib/inngestEvents.ts` | Mounts only after active identity, but event acceptance removes selected commands before server execution/reconciliation. |
| Web pending state | `apps/gurudevi-web/lib/workspace/attendance.ts` | Account-scoped attendance drafts exist, but web has no mounted shared queue drainer or generic command/reconciliation lifecycle. |
| User state display | `packages/ui/src/components/NetworkStatusBanner.tsx`, `SyncStatusIndicator.tsx` | Shows aggregate counts only; it cannot describe command ownership, queued/retrying/auth-paused/conflict/reconciled states, or a safe recovery action. |

## Located producers and their hazards

| Producer | Current path | Critique |
| --- | --- | --- |
| `useSafeMutation` | Queue only after classified offline failure. | Queue entry gets a derived deterministic hash, but `MutationAuditLog` records a separate UUID from `useMutationQueue`. It has no receipt or transport envelope. |
| Classroom/profile/school hooks | Enqueue first, then issue the online API call. | An online success leaves a queued command behind for later replay. Some names (`updateClassroomField`, `updateProfileField`, `updateSchoolField`) are absent from `MUTATION_REGISTRY`, so they later enter DLQ. This is both duplicate-write and false-success risk. |
| Self wellbeing and reflection | Local SQLite write then direct queue writer. | The intent often omits `userId`, `tenantId`, and `perspectiveId`; active-user filtering treats unassigned legacy work as eligible. Local-write authorization and rollback/receipt policy are not uniformly enforced. |
| Device security intents | Generates and embeds an idempotency key in variables. | Queue regenerates a different queue key from those variables; no invariant establishes which key the server must honor. |
| PowerSync connector | Uses a deterministic key derived from whole CRUD batch. | Correctly sends body and header on its own protocol, but a changed grouping/reordering creates a new batch identity. It cannot settle generic queue items. |
| Web Workspace attendance | Stores local browser drafts and calls oRPC directly. | Drafts are account-scoped, but no command identity, offline retry, restart replay, receipt, or conflict model exists. |

## Critical findings

### P0 — a dispatch acknowledgement is incorrectly treated as mutation success

`dispatchQueuedMutationToSovereignBus` emits an Inngest event and returns
`'dispatched'`. `SyncManager` then removes the queued item immediately. It has
no durable server receipt and does not wait for the downstream mutation to run.
An event accepted for delivery can fail later, leaving the user with neither a
pending command nor a recovery path. The bridge also sets `tenantId` to
`undefined`, discarding queued tenant scope.

### P0 — two concurrent drainers apply different safety rules to the same queue

`SyncManager` uses user filtering, lease recovery, migration, conflict locks,
auth pause, five retries, audit updates, and queue DLQ. `backgroundSync` and
`triggerForegroundSync` execute registry functions directly with a separate
three-retry policy and separate storage-key DLQ. They do not apply account
filtering, tenant/perspective checks, leases, migrations, conflict handling, or
the shared audit log. Both can run against the same item.

### P0 — online mutations can be queued and executed twice

Classroom, profile, and school update hooks enqueue before their direct remote
call. Their queue names are not registered in the replay registry. This gives
neither exactly-once behavior nor dependable offline recovery: online success
can later become a dead letter, while a future registry addition could replay a
successful command.

### P0 — account isolation is fail-open for unscoped entries and reset destroys work

The foreground eligibility check permits an item without `userId` for whichever
user is active. Multiple real producers omit `userId`. `resetScopedStores`
unconditionally clears queue and DLQ, so sign-out/account-switch behavior can
destroy unsynced work rather than quarantine it by principal.

### P1 — idempotency is four incompatible mechanisms

1. `lib/sync/idempotency.ts` creates SHA-256 deterministic fingerprints.
2. `lib/idempotency.ts` creates UUID-like action keys and includes an in-memory
   optional oRPC middleware.
3. Device-security variables carry a generated key separate from queue state.
4. PowerSync hashes the current CRUD batch and has a transactional key ledger
   when the runtime exposes raw SQL.

The generic `MUTATION_REGISTRY` never receives the queue key, so it cannot
preserve a key over transport retries. The optional in-memory middleware is not
safe across process restart or scaling and validates a UUID format incompatible
with the SHA-256 queue key.

### P1 — queue capacity and DLQ retention silently discard user work

The queue truncates oldest entries above 500; the queue DLQ truncates above
100; the background DLQ separately truncates above 100. None records an
explicit overflow outcome or gives the user a preservation/export/recovery
choice. A production outbox may bound storage, but it must fail safely before
accepting a command rather than evicting accepted work.

### P1 — error taxonomy loses actionable semantics

`classifyError` relies mainly on message fragments. It maps 403/role revocation
to permanent failure rather than an authorization/recovery state, does not
model validation, idempotency mismatch, rate-limit retry-after, or stale
session/account change distinctly, and catches `any`. Client transports often
replace their original status/error body with generic messages before this
classifier sees them.

### P1 — client UI cannot truthfully report lifecycle state

The aggregate indicator polls or listens to only two background events. It does
not subscribe to the queue itself, misses foreground processor events, and has
no per-command receipt/conflict/auth/overflow representation. The network
banner's pending count is not principal-scoped.

### P2 — contracts and handler behavior drift

The PowerSync oRPC contract requires `idempotencyKey` in the body. The legacy
Hono handler reads only `X-Idempotency-Key`, ignoring the supplied body field.
The PowerSync connector sends both; other consumers can therefore observe
different behavior. Generic command routes have optional or absent key fields
and no common receipt schema.

## Foundation contract to implement before any adopter migration

This is RED work. It requires explicit approval before implementation.

1. **One immutable command envelope.** Create `commandId`, `idempotencyKey`,
   canonical payload digest, command name/version, principal/tenant/perspective
   binding, creation time, and target metadata exactly once. Persist it before
   optimistic local state is made visible. All retries retain it byte-for-byte.
2. **One authoritative persisted state machine.** Replace aggregate booleans
   with typed states: `queued`, `dispatching`, `retry_scheduled`,
   `auth_paused`, `conflict`, `rejected`, `reconciled`, `cancelled`. Define
   permitted transitions and durable error codes/next actions.
3. **One coordinator and one DLQ.** Foreground, background, and PowerSync must
   acquire the same lease and use the same classifier, retry policy, identity
   check, migration, audit record, and settlement transition. A platform
   scheduler may wake the coordinator; it may not become a second processor.
4. **One transport/receipt protocol.** Every retryable command sends the
   immutable envelope. The server atomically writes its result receipt with
   payload digest and returns `applied` or `already_applied`. Event enqueue is
   never settlement.
5. **Fail-closed scope behavior.** Commands lacking a principal must be
   quarantined/migrated, never replayed for any active account. Sign-out and
   account switch retain only original-principal data according to an explicit
   policy; they must not clear all work.
6. **One explicit overflow and reconciliation policy.** Refuse new commands
   before eviction, preserve recoverable details, and reconcile canonical
   server state/receipt into the local projection before marking success.

## Cross-device, multi-account, and browser extension

### Known runtime split

| Surface | Local data/runtime actually wired | Consequence |
| --- | --- | --- |
| Gurudevi mobile (Android/iOS) | `@powersync/react-native` 2.2.1, account-named SQLCipher database, `SupabasePowerSyncConnector`. | It has a real local replication path, subject to the primitive failures above. |
| Expo web build of `gurudevi-mobile` | `@powersync/web` 2.3.1, WASQLite OPFS database named per account, `PowerSyncProvider.web.tsx`. | It is a separate browser-local PowerSync runtime, not merely a mock. It has different storage, worker, quota, and browser-support failure modes. |
| Next.js `gurudevi-web` | No direct PowerSync dependency/provider located. Workspace attendance uses account-scoped `localStorage` drafts and direct oRPC. | It has no PowerSync offline command queue, local replicated projection, or automatic replay today. |

The repository must choose whether the Next.js application joins the common
PowerSync substrate or uses a deliberately equivalent browser command store.
It must not rely on `localStorage` drafts as if they were durable, concurrent,
transactional synchronization.

### Multi-device reconciliation rule

Every installation and browser profile may create commands independently. The
server, not a device clock or a local queue, is the authority that decides
whether a command is newly applied, already applied, rejected, or conflicts.
The durable receipt must bind:

- principal, tenant, perspective, command ID, idempotency key, and payload
  digest;
- server transaction/revision information sufficient for another device to
  replace optimistic state with canonical state;
- a conflict token/reason and safe next action where concurrent commands cannot
  commute.

Real-time sync distributes canonical state; it does not establish command
ordering or exactly-once semantics. Concurrent mobile and web changes require
a per-command domain policy: commutative append, server-authoritative
conflict, explicit merge, or server-revision last-write-wins. Local wall-clock
timestamps are not an authority for a cross-device overwrite.

### Multi-account device/browser custody

`deviceAccounts` remembers multiple mobile sessions and PowerSync databases
are named by account. `SingleActivePowerSyncRuntime` allows only one connected
database in a JavaScript runtime, which is the right shape. However,
`switchTo()` invokes `resetScopedStores()`, which clears the global mutation
queue and DLQ. Existing queued work is therefore not account-partitioned in
storage despite per-account database names.

For the foundation contract:

1. The command store must be partitioned by principal before it is persisted,
   not merely filtered after rehydration.
2. Switching account disconnects the previous active replication runtime but
   preserves its sealed command partition. It may only resume after the same
   principal is authenticated and the tenant/perspective binding still holds.
3. Sign-out must choose explicit custody: retain encrypted/quarantined work for
   a remembered account, or erase it after a confirmed destructive action. It
   must never clear another account's partition as a side effect.
4. A browser profile has the same requirement. Browser `localStorage`, OPFS,
   IndexedDB, and cache storage are profile-local, not a shared identity store.

### Browser tabs and compatibility

The Expo-web provider creates one `BrowserPowerSyncAccountCoordinator` using
`BroadcastChannel` with a `localStorage` event fallback. A different-account
signal deactivates the receiving tab's PowerSync runtime. It does not settle or
quarantine that tab's pending generic queue commands, validate signal ordering,
or expose the displaced state to the user. This prevents two account databases
from remaining active in cooperating tabs, but it is not a command ownership
protocol.

`WASQLiteAdapter` uses `WASQLiteVFS.OPFSCoopSyncVFS`, enables multi-tabs only
when `SharedWorker` exists, and always uses a web worker. Therefore a browser
compatibility contract must be explicit instead of assuming `navigator.onLine`
or `BroadcastChannel` means offline storage is available:

| Capability | Required behavior when unavailable/denied |
| --- | --- |
| OPFS / WASM / worker initialization | Do not claim offline persistence; offer online-only mode or a non-destructive local-draft mode clearly labelled as such. |
| SharedWorker or cross-tab coordination | Use a safe single-tab lease; do not let tabs concurrently dispatch the same command partition. |
| BroadcastChannel / writable localStorage | Fall back safely without cross-tab account claims; warn that another tab may require reload before changing account. |
| Storage quota, private browsing, eviction | Refuse an offline command before optimistic success if its durable write cannot be confirmed; retain editable UI state and explain recovery. |
| `navigator.onLine` | Treat only as a hint. Dispatch/receipt outcome, not the browser flag, determines online success. |
| Background tab/service-worker lifecycle | Do not promise replay while closed/suspended until a tested browser-background contract exists. Resume/reconnect foreground replay is the safe baseline. |

The PowerSync browser path must receive real-browser coverage on the supported
browser matrix before it becomes the common web substrate. The Next.js web
path additionally needs its own SSR/hydration boundary: no browser storage or
PowerSync initialization during server render, no sensitive queue payload in
HTML, and a delayed client capability check.

### Added evidence matrix

| Level | Required cross-device/browser evidence |
| --- | --- |
| G0 | Command/receipt convergence for duplicate and conflicting commands from two device identities; account partition and tab-lease transition rules. |
| G1 | OPFS unavailable, quota/write failure, private-storage rejection, stale BroadcastChannel signal, account switch during dispatch, and server receipt replay under explicit browser/PowerSync substitutes. |
| G4 | Supported Chrome/Edge/Firefox/Safari matrix for initialization, offline write, refresh, two tabs, account switch, reconnect, and accessible recovery. Record exact browser/version and capabilities. |
| G5 | One Android and one iOS device concurrently with a browser, including offline divergence, reconnect, server rejection, and canonical convergence. |

No browser capability or PowerSync service behavior is asserted as verified
until this runtime evidence exists.

## Downstream adopter order after the primitive contract

1. Device-security commands — small, high-consequence, already carrying a
   key; validates strict scope and receipt behavior.
2. Profile/school/classroom updates — removes queue-then-direct double paths
   and tests coalescing semantics deliberately.
3. Wellbeing/reflection local-first paths — validates optimistic SQLite,
   PowerSync coordination, rollback/reconciliation, and sensitive-data
   redaction.
4. Web Workspace attendance and mobile attendance — inherit the command
   envelope, full offline lifecycle, and server receipt rather than creating
   attendance-specific infrastructure.
5. Payments, entitlements, webhooks, grades, and invitations — each needs a
   separate domain policy but uses the same substrate.

## Agreed boundary with authentication and account lifecycle hardening

The [Authentication and Session Lifecycle Hardening](2026-09-20-auth-session-lifecycle-hardening-feature-spec.md)
workstream and this workstream agree on this division:

| Authentication/account lifecycle owns | Mutation foundation owns |
| --- | --- |
| Callback-attempt binding, Next cookie/session authority, explicit account-switch UX, and platform lifecycle policy. | Principal-bound command envelope, persisted queue/DLQ state machine, idempotency and receipt protocol, reconciliation, and cross-device command semantics. |
| One active authenticated account per browser profile; a late callback is discarded rather than replacing it; concurrent different-account web sessions use separate browser profiles. | A lifecycle port that can preserve/quarantine the original principal's partition or perform an explicitly confirmed destructive discard before runtime disconnect. |

Auth/session code must request this lifecycle transition; it must not directly
clear global mutation data. This workstream will publish the lifecycle-port
shape before auth account-switch implementation depends on it. Neither
workstream adds a Next.js PowerSync provider or second browser queue in its
current slice.

## Evidence required

| Level | Foundation proof |
| --- | --- |
| G0 | Envelope immutability, payload collision, state-transition legality, lease contention/expiry, principal quarantine, overflow refusal, and receipt settlement. |
| G1 | Queue storage/restart, web storage failure, native storage failure, foreground/background coordinator contention, exact HTTP envelope/header/body, server applied/replay/conflict/auth/validation/rate-limit responses. State substitutions are explicit. |
| G3 | Mobile and web surfaces show every recoverable command state and do not call a failed/dispatched event success. |
| G4 | Browser offline/reconnect/refresh/account-change/retry-after-timeout with accessible recovery. |
| G5 | Android and iOS offline, terminate/resume, reconnect, account switch, and one real PowerSync synchronization journey. |
| Operations | Durable receipt retention, privacy-safe command/receipt correlation, DLQ/overflow alerting, reconciliation runbook, and exercised rollback. |

## Known, inferred, unproven

**Known:** the paths and behaviors above were inspected in the named source
files. Existing tests mainly cover isolated queue, hash, and mock replay
behavior; they do not establish the cross-path guarantees listed here.

**Inferred:** the shared `powersync_idempotency_keys` table is intended as the
durable receipt authority. This audit found the raw SQL use but has not proved
its migration, deployed existence, retention, or multi-instance behavior.

**Unproven:** real browser/web queue persistence, real PowerSync execution,
Android/iOS background scheduling, server transaction/migration availability,
role-revocation timing, account-switch data custody, observability/redaction,
and all deployed recovery behavior.

## Next smallest implementation decision

Approve the RED foundation contract and choose the data-custody policy for
commands on logout/account switch: **quarantine per original principal and
require explicit discard after re-authentication** is recommended. Only then
implement the shared envelope/state machine/coordinator before changing any
domain consumer.
