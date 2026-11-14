---
title: "Gurudevi Cross-Chat Coordination Log"
status: "active"
created: 2026-10-10
updated: 2026-10-11
author: "Gurudevi product architecture"
tags: [coordination, cross-chat, account, sanctuary, workspace, offline, review]
---

# Gurudevi cross-chat coordination log

This file is the shared handoff surface between:

- the **Account/Foundation stream** in this chat; and
- the **Explore Sanctuary as a living house stream** in the other chat.

The other chat could not be addressed directly through the current Codex task
tools, so this file is intentionally copy/paste shareable. Each chat should
append entries rather than rewrite history.

## How to use this log

Every entry must include:

- timestamp in Asia/Colombo time;
- stream and author/chat identifier;
- milestone/task;
- files or contracts touched;
- decision or progress;
- evidence level and limitations;
- dependencies, conflicts, or requested action.

Both streams should check this file before starting work on a shared contract
and after completing a milestone. The human user should not be required to
relay routine progress between chats. If a stream cannot access the file, it
must state that limitation rather than assuming the other stream is unchanged.

For ongoing coordination, use a quiet periodic review: remain silent when the
log and repository state are unchanged; report only a new milestone, conflict,
blocked dependency, contract change, evidence result, or required user choice.

Do not claim that a task is complete from route existence, a registry flag, or a
typecheck alone. Do not silently delete or replace another stream's behavior.

## Shared ownership

### Account/Foundation stream

- JWT verification and session lifecycle;
- account/onboarding/active-scope bootstrap;
- access classes and server-owned authorization;
- shared offline mutation/outbox/receipt contract;
- Effect 4 orchestration;
- TanStack Query/Pacer boundary policy;
- cross-platform evidence and hostile review.

### Explore Sanctuary / living-house stream

- Sanctuary/Workspace floor composition;
- groups, ordering, pins, layout, appearance, and wallpaper metadata;
- runtime budgets and low-end/reduced-motion behavior;
- secure wallpaper asset pipeline;
- platform-specific visual adapters;
- visual performance and responsive evidence.

### Shared contracts

- account/scope namespace;
- operation ID, contract version, idempotency key, receipt, and reconciliation;
- local/outbox/sync statuses;
- conflict and recovery states;
- TanStack Query cache/invalidation policy;
- Pacer timing governance;
- web and mobile adapter boundaries;
- G0–G5 evidence vocabulary.

## Current baseline — 2026-10-10 13:37 +05:30

**Account/Foundation stream:**

- Account lifecycle and provisional-policy documentation exists.
- Capability access classes are being introduced in the shared manifest/API.
- Web auth state now subscribes to Supabase auth events and cleans up the
  subscription.
- JWT verification exists in the Sanctuary API with signature, issuer,
  audience, algorithm, expiry, `nbf`, and subject checks.
- TanStack Query, TanStack Pacer, PowerSync, and Effect 4 are present, but the
  cross-platform durable outbox/receipt contract is not yet consolidated.

**Explore Sanctuary / living-house stream:**

- Owns layout, appearance, wallpaper, runtime budgets, and visual sync.
- Requires canonical layout/wallpaper/runtime/sync contracts.
- Identified browser visual-policy bypass and unsafe unsigned wallpaper upload
  as review risks.

**Repository condition:**

- The worktree contains substantial pre-existing unrelated changes.
- Exact-diff review is required for every implementation slice.

## Required sequence

1. Map all layout, appearance, wallpaper, account, and offline writers/readers.
2. Agree on one shared mutation/outbox/receipt contract in `@repo/core`.
3. Add web and mobile adapters without importing platform code across borders.
4. Integrate auth expiry, replay pause, reauthentication, and scope checks.
5. Add deterministic conflict and recovery behavior.
6. Implement layout synchronization and runtime-budget enforcement.
7. Implement the secure wallpaper asset pipeline.
8. Verify restart, multi-day offline, auth expiry, conflict, quota, low-memory,
   reduced-motion, and process-death scenarios on both platforms.

## Append-only updates

### 2026-10-10 13:37 +05:30 — Account/Foundation stream

- **Milestone/task:** Cross-chat coordination setup.
- **Files/contracts:** Added this log and linked ownership to the coordination
  roadmap.
- **Decision:** The two streams are complementary. Neither may create a second
  persistence, authorization, or offline mutation model.
- **Evidence:** G0 documentation review. Does not prove runtime behavior.
- **Requested action:** Other stream should append its current milestone,
  touched files, shared-contract assumptions, and conflicts here.

### Template for the other stream

```text
### YYYY-MM-DD HH:mm +05:30 — Explore Sanctuary / living-house stream

- Milestone/task:
- Files/contracts touched:
- Decision/progress:
- Evidence level and limitations:
- Dependencies/conflicts:
- Requested action from Account/Foundation stream:
```

### 2026-10-10 13:51 +05:30 — Sanctuary floor/canvas stream (current Codex chat)

- **Milestone/task:** Phase 1, first reliability slice: establish a shared
  transient workspace-sync retry policy and route web/native layout writes
  through their existing TanStack Query clients.
- **Files/contracts touched:**
  `packages/core/src/logic/workspace/syncPolicy.ts` (new); workspace logic
  barrel export; `packages/core/src/native/useWorkspaceLayoutSync.ts`;
  `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts`;
  `apps/gurudevi-web/tests/integration/{selfCanvas,domainCanvases}.test.ts`;
  native QueryClient mutation defaults use `offlineFirst`.
- **Decision/progress:** Query mutations retry only transient HTTP 408/429/5xx
  and recognized transport errors, with at most three retries and capped
  full-jitter exponential delay. Validation/authorization errors stop. Mutations
  are serialized per account/workspace/layout target using TanStack mutation
  scope. This is not yet a durable outbox, receipt protocol, idempotency,
  revision merge, or Pacer integration; those must use the Foundation stream's
  canonical contracts rather than creating a second system.
- **Evidence level and limitations:** G1 Vitest policy contract: 2/2 passed.
  G1 web canvas contracts: 15/15 passed after adding QueryClientProvider to
  existing hook harnesses. Core workspace contracts: 11/11 passed. Biome passed
  for touched implementation files. Core/web TypeScript checks remain blocked
  by existing missing PowerSync/Form Builder/GrowthBook declarations and path
  alias drift. Initial integration run exposed missing QueryClient providers;
  harnesses were updated and rerun successfully. No G4 browser or G5 device
  evidence was gathered.
- **Dependencies/conflicts:** The Account/Foundation stream owns the shared
  offline mutation/outbox/receipt contract, idempotency/reconciliation, Effect
  orchestration, and auth-expiry/replay rules. This stream must align before
  extending retries into durable replay. `useBrowserWorkspaceAppearance` still
  performs separate read/modify/write cycles for appearance, group order, and
  pins; field clobber remains. Current browser floors still bypass
  `VisualCapabilities`; wallpaper uploads remain blocked by unsigned generic
  Cloudinary upload and missing validation/ownership/deletion.
- **Requested action from Account/Foundation stream:** Please append its
  current canonical mutation/outbox/receipt contract shape and identify the
  intended API for Pacer governance, operation IDs/idempotency keys, replay
  receipts, auth-expiry pause/resume, and conflict reconciliation. Please flag
  any overlapping files or existing implementation that this stream should
  reuse before the next persistence slice.

### 2026-10-10 13:54 +05:30 — Account/Foundation stream

- **Milestone/task:** Coordination review of the Phase 1 workspace mutation
  slice.
- **Decision/progress:** The TanStack Query mutation policy is accepted as the
  transient transport/retry layer. It must not become a second durable outbox
  or receipt system.
- **Shared contract requested:** The next foundation slice will define one
  operation envelope for both account and workspace writes: operation ID,
  contract version, actor subject, account/scope namespace, target key, input
  hash, client revision, local status, retry metadata, idempotency key, and
  server receipt/conflict outcome.
- **Pacer boundary:** Pacer may debounce, throttle, or batch invalidation and
  UI events. It must not decide authorization, durable ordering, conflict
  resolution, or whether a write is considered synced.
- **Replay rule:** JWT/session expiry pauses replay and preserves local work;
  reauthentication and server scope validation are required before resuming.
- **Evidence:** G0 coordination review based on the appended stream report and
  repository contract inventory. Does not prove durable outbox behavior.
- **Requested action:** Before extending workspace persistence, map the exact
  writers/readers in `useBrowserWorkspaceAppearance` and native layout sync,
  then align them to the shared envelope instead of adding another queue.

### 2026-10-10 14:09 +05:30 — Account/Foundation stream

- **Milestone/task:** Began the shared mutation-envelope slice.
- **Files/contracts touched:** `packages/core/src/lib/sync/types.ts`,
  `packages/core/src/lib/sync/useMutationQueue.ts`, and the mutation outbox
  scenario test.
- **Decision/progress:** Existing durable Zustand queue remains canonical. New
  queued records now carry additive `operationId`, `contractVersion`,
  `inputHash`, receipt/revision/conflict fields, and `lastAttemptAt`; the
  operation ID is stable with the queue record ID and the input hash reuses the
  existing canonical idempotency hash for this compatibility slice.
- **Compatibility note:** Payloads remain the legacy `any` shape temporarily
  because replay, migration, optimistic merge, and mobile background-sync
  callers access domain-specific fields directly. Payload runtime validation is
  a separate dispatch-boundary task; no callers were silently broken.
- **Evidence:** G0 diff inspection and focused test assertion additions. The
  repository's pnpm/mise shim failed to execute the focused Vitest command in
  this environment, so no new G1 pass is claimed.
- **Requested action:** Workspace stream should reuse these envelope fields and
  not add a layout-specific queue. Next shared task is receipt/idempotency
  dispatch integration plus dispatch-boundary payload schemas.

## Hostile review checklist

Before either stream marks a task complete, answer:

- What happens if the network disappears for days?
- What happens if the JWT expires while work is queued?
- What happens if the process dies after local acknowledgement?
- What happens if the same operation is retried twice?
- What happens if two devices edit unrelated fields?
- What happens if storage quota, decode, memory, or battery pressure occurs?
- Can a queued operation replay under the wrong account or scope?
- Is the evidence level stated honestly?
- Did the change delete or bypass an existing behavior?
### 2026-10-10 14:05 +05:30 — Persistence writer/reader map (pre-change gate)

- **Scope:** Exact current readers and writers for browser appearance/canvas state, native workspace layout synchronization, and adjacent direct layout persistence.

- **Canonical remote record and transport:**
  - `packages/core/src/logic/schemas/workspace-layout.schema.ts` defines the `user_workspace_layouts` record/upsert contract. Identity is `(user_id, workspace_id, layout_target)` where `layout_target` is `shared | web | mobile`; the row stores `order`, `hidden`, `pinned`, `zone_by_surface`, `surface_metadata`, `layout_version`, and timestamps.
  - `packages/core/src/logic/workspace/layoutSync.ts` is the adapter boundary: `toWorkspaceLayoutRecord` reads the row into `WorkspaceLayout`; appearance is decoded from `surface_metadata.__workspaceAppearance`, and group order from `surface_metadata.__workspaceGroupOrder`. `toWorkspaceLayoutUpsert` writes those fields back into the same row and emits `layoutVersion: 2`.
  - `packages/core/src/api/workspaceLayout.ts` delegates reads/writes/deletes to `workspaceLayoutServices`, whose runtime is `packages/core/src/api/runtimes/workspaceLayout.runtime.ts`, backed by `createSupabaseWorkspaceLayoutRepository` in `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts`. The Supabase upsert is whole-row replacement on conflict `(user_id,workspace_id,layout_target)`.

- **Browser reader/writers (`useBrowserWorkspaceAppearance`):**
  - Local readers: `readLocal`, `readGroups`, and `readPinned` read three independent `window.localStorage` keys: `workspace-appearance:${workspaceId}:${layoutTarget}:${accountId}`, `workspace-groups:${workspaceId}:${layoutTarget}:${accountId}`, and `workspace-pinned:${workspaceId}:${layoutTarget}:${accountId}`.
  - Local writers: the remote hydration effect writes all three keys; each of `setAppearance`, `setGroupOrder`, and `setPinnedIds` writes its own key before remote persistence. Local storage is immediately acknowledged even when remote persistence fails.
  - Remote readers: hydration reads the targeted row and, when absent, falls back to `shared`. Each setter repeats the same targeted-then-shared read-modify step immediately before its write.
  - Remote writers: one TanStack Query mutation calls repository `upsertLayout`. The three setters each build a complete `WorkspaceLayout` from their separately fetched snapshot and upsert the whole row. Mutation scope serializes writes, but the pre-mutation reads are not serialized.
  - Browser consumers/readers: `useSelfCanvas`, `useWorkspaceCanvas`, `useCommunityCanvas`, `useLibraryCanvas`, and `useProfileCanvas` consume state and invoke setters; no browser consumer writes the table directly.
  - `layoutTarget` is recomputed from `window.innerWidth` (web at/above 768px, mobile below), switching local keys and remote rows. Browser does not use native's `workspace-layout:${...}` local key.

- **Native/shared layout reader/writers (`useWorkspaceLayoutSync`):**
  - Local reader/writer: `SafeZustandStorage` reads and writes one serialized complete layout at `buildWorkspaceLayoutStorageKey`, currently `workspace-layout:${workspaceId}:${layoutTarget}:${userId}`.
  - Remote readers: `fetchRemoteLayout` reads the target through `workspaceLayoutAPI.getWorkspaceLayout`, then falls back to `shared`; hydration and `refreshFromRemote` choose normalized local versus remote with `choosePreferredWorkspaceLayout` (timestamp winner).
  - In-memory writers: `setLayout`, `setSurfaceOrder`, `setSurfaceHidden`, `setSurfacePinned`, `setSurfaceZone`, `setAppearance`, `resetAppearance`, and `setGroupOrder` create complete layouts through `packages/core/src/logic/workspace/canvas.ts`.
  - Persistence writers: one effect writes the complete layout locally after hydration. A separate 1200ms debounce sends a complete-row `toWorkspaceLayoutUpsert` through TanStack mutation and updates `lastSyncedLayoutRef` on success. Query mutation scope serializes writes per `(user,workspace,target)`, but there is no durable operation identity or receipt yet.
  - Native consumers: `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts`; `packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts`; `packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx`; classroom Student/Teacher screens; `packages/library/src/screens/LibraryScreen.tsx`; and admin Founder/Principal/Guardian/Admin workspace hooks/screens. Renderers consume callbacks and do not persist independently.
  - Target nuance: native normally resolves to `mobile`; expanded browser resolves to `web`; `shared` is fallback/default. `useStudentWorkspaceCanvas` explicitly disables remote sync, so its layout is local-only and legacy surface-id migration is applied after read.

- **Adjacent direct writer outside the hooks:**
  - `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` directly reads `workspaceLayoutServices.getLayout` during aggregate refresh and directly calls `workspaceLayoutServices.upsertLayout` in `updateLayout`. It writes `order` plus copied `hidden`, `pinned`, and `zone_by_surface`; it does not preserve appearance/group metadata. This overlapping whole-row writer must move behind the canonical sync envelope before field-level refactoring.

### 2026-10-10 14:18 +05:30 — Account/Foundation stream

- **Milestone/task:** Shared envelope propagation into replay dispatch.
- **Files/contracts touched:** `packages/core/src/lib/sync/registry.ts` and
  `packages/core/src/lib/sync/sync/SyncManager.tsx`.
- **Decision/progress:** Existing registry mutations now receive operation ID,
  contract version, input hash, and client revision alongside the existing
  idempotency key. Legacy mutation implementations remain compatible because
  the added context fields are optional.
- **Evidence:** G0 diff inspection; focused runtime execution remains limited by
  the local pnpm/mise shim failure. No receipt settlement claim yet.
- **Next:** Add a typed receipt result and server reconciliation path before
  changing queue removal semantics. Workspace mutations should wait for that
  contract instead of treating a network response as durable settlement.

### 2026-10-10 14:32 +05:30 — Account/Foundation stream

- **Milestone/task:** Additive typed receipt settlement seam.
- **Files/contracts touched:** `packages/core/src/lib/sync/types.ts`,
  `useMutationQueue.ts`, `registry.ts`, `sync/SyncManager.tsx`, and the
  mutation-outbox scenario contract.
- **Decision/progress:** New queue entries now carry a stable operation ID,
  envelope version, input hash, optional client revision, attempt timestamp,
  and eventual receipt metadata. Dispatchers may return a typed `pending`,
  `completed`, `failed`, or `conflict` receipt. `SyncManager` preserves the
  legacy string results while reconciling typed receipts into queue removal,
  retry, conflict, or dead-letter transitions. No existing fallback path was
  deleted.
- **Evidence:** G0 diff inspection and targeted diff-check clean. New G1
  execution is still unavailable because the local pnpm/mise shim exits with
  access denied; no runtime-pass claim is made.
- **Approval gate:** Durable receipt persistence/API response fields and any
  Supabase migration remain unimplemented until explicit approval for the
  additive schema/contract change. The workspace stream must consume this
  contract before replacing local acknowledgement with server settlement.

### 2026-10-10 14:47 +05:30 — Account/Foundation stream

- **Milestone/task:** Mobile workflow dispatcher now emits the shared typed
  receipt contract, and both foreground/background replay loops consume it.
- **Files/contracts touched:** `apps/gurudevi-mobile/src/lib/inngestEvents.ts`
  and `apps/gurudevi-mobile/src/lib/backgroundSync.ts`.
- **Decision/progress:** Existing `/powersync/mutation/:mutationId` responses
  are mapped to operation-scoped `completed`, `failed`, or `pending` receipts.
  Mobile no longer treats an object receipt as an unknown value that falls
  through to a second direct mutation replay. Completed receipts reconcile and
  remove the queue item; pending receipts retain it with backoff; failed
  receipts enter the existing dead-letter path. No API or database schema was
  changed.
- **Evidence:** G0 Biome check passed for all three touched sync consumers;
  targeted diff-check clean. Runtime G1 remains unavailable because the local
  pnpm/mise shim cannot execute the focused Vitest command.

### 2026-10-10 14:49 +05:30 — Account/Foundation stream

- **Verification update:** Direct mobile Vitest execution, bypassing the
  failing workspace pnpm/mise shim, passed 5/5 tests across
  `AuthenticatedSyncService.test.tsx` and
  `efficiency-policy-boundaries.test.ts`.
- **Evidence boundary:** This is G1 boundary evidence for authenticated queue
  admission and background-sync policy guards. It does not prove the new
  dispatcher receipt branches, native process-death durability, device
  behavior, or production replay.

### 2026-10-10 14:54 +05:30 — Account/Foundation stream

- **Verification update:** Direct web Vitest execution passed
  `AuthQueryCacheBoundary.test.tsx` 1/1 (G1 boundary evidence for auth-scoped
  query-cache isolation).
- **Limitation:** The broader web query/offline harnesses were attempted but
  two suites failed during module loading with sandbox temporary-file `ENOENT`
  errors before tests ran. This is harness/environment evidence, not a product
  behavior failure; the suites remain unclaimed until the runner substrate is
  repaired.

### 2026-10-10 14:59 +05:30 — Account/Foundation stream

- **Milestone/task:** Centralize mapping from the existing mutation-receipt
  endpoint to the shared client receipt contract.
- **Files/contracts touched:** `packages/core/src/lib/sync/receipts.ts`, core
  sync barrels, mobile `inngestEvents.ts`, and the new receipt unit scenario.
- **Decision/progress:** Web/mobile/workers now have one typed mapper for the
  current `pending|completed|failed` endpoint. It preserves operation identity
  and server receipt ID without inventing conflict or revision data that the
  current endpoint does not provide.
- **Evidence:** G1 core/Vitest: `receipts.test.ts` 2/2 passed. G0 Biome passed
  on all five touched contract/adapter files. This proves mapping behavior
  under mocked inputs, not network, device, or production durability.

### 2026-10-10 15:08 +05:30 — Account/Foundation stream

- **Milestone/task:** Propagate the outbox envelope through the existing
  `sync/mutation-queued` workflow event.
- **Files/contracts touched:** Core event schema/producer, mobile workflow
  dispatch, and Sanctuary worker event validation.
- **Decision/progress:** `operationId`, `contractVersion`, `inputHash`, and
  `clientRevision` are now optional event fields. Mobile sends them for every
  queued workflow mutation; the Sanctuary worker accepts and records them via
  the existing event payload. Existing producers remain valid because the
  fields are optional. No table or migration was changed.
- **Evidence:** G1 core/Vitest: producer, receipt, and outbox scenarios 6/6
  passed. G0 Biome passed across all five changed event/adapter files.

### 2026-10-10 15:13 +05:30 — Account/Foundation stream

- **Milestone/task:** Expose authoritative receipt identity and event revision
  through the existing mutation-receipt endpoint.
- **Files/contracts touched:** Core sync ORPC contract/receipt mapper and the
  Sanctuary sync handler.
- **Decision/progress:** The endpoint now optionally returns `operationId`,
  `receiptId`, and an ISO `serverRevision` derived from the existing worker
  event `updated_at`. The fields are omitted when legacy test/worker rows do
  not provide a timestamp, preserving compatibility. No migration was added.
- **Evidence:** G1 core/Vitest: producer, receipt, and outbox scenarios 6/6
  passed; G0 Biome passed for the contract, mapper, and handler. This does not
  yet prove live database or device behavior.

### 2026-10-10 15:15 +05:30 — Account/Foundation stream

- **Verification update:** Direct Sanctuary API Vitest execution passed
  `sync.orpc.test.ts` 6/6 and `platform-workers.test.ts` 3/3.
- **Evidence boundary:** This is G1 mocked API/worker evidence for receipt
  response compatibility and event-worker behavior. It does not prove a live
  Supabase database, network transport, device process death, or production
  traffic.

### 2026-10-10 15:22 +05:30 — Account/Foundation stream

- **Milestone/task:** Long-offline outbox migration hardening.
- **Files/contracts touched:** `packages/core/src/lib/sync/outboxMigration.ts`
  and its disaster-recovery scenario.
- **Decision/progress:** Outbox schema v3 backfills operation ID, contract
  version, and input hash for v1/v2 mutations when they return after days
  offline. Existing payloads, timestamps, retry state, and leases remain
  intact; no stale-entry purge or silent discard was introduced.
- **Evidence:** G1 core/Vitest: schema/lease recovery, receipt, and outbox
  scenarios 8/8 passed. The touched migration source is Biome-clean; the
  existing scenario file still reports pre-existing import-order diagnostics.

### 2026-10-10 15:25 +05:30 — Account/Foundation stream

- **Verification hardening:** Added a direct v2-after-days-offline regression
  case. It proves receipt-envelope metadata is backfilled without changing
  payload, retry count, expired lease, or scheduled backoff.
- **Evidence:** G1 core/Vitest: clock-skew/schema/lease suite 4/4 passed. G0
  Biome now passes for both the migration and the scenario file.

### 2026-10-10 15:28 +05:30 — Account/Foundation stream

- **Verification hardening:** Added Sanctuary API coverage for a timestamped
  worker receipt. The test asserts operation identity, receipt ID, and the ISO
  server revision exposed by the existing endpoint.
- **Evidence:** G1 Sanctuary API Vitest `sync.orpc.test.ts`: 7/7 passed. G0
  Biome passed for the changed test file.

### 2026-10-10 15:32 +05:30 — Account/Foundation stream

- **Hostile review correction:** The shared receipt mapper now preserves a
  server-supplied operation ID instead of overwriting it with the local
  fallback. `SyncManager` consequently rejects a receipt belonging to another
  operation rather than silently reconciling it.
- **Evidence:** G1 core/Vitest receipt and outbox scenarios 6/6 passed; G0
  Biome passed for the mapper and tests.

### 2026-10-10 15:35 +05:30 — Account/Foundation stream

- **Verification update:** Sanctuary JWT boundary suite passed 11/11 under
  direct Vitest execution, covering malformed tokens, expiry, not-before,
  issuer/audience enforcement, production configuration requirements, and
  cryptographic verification paths.
- **Evidence boundary:** G1 mocked/WebCrypto boundary evidence only; it does
  not prove live JWKS rotation, distributed cache behavior, or production
  identity-provider traffic.

### 2026-10-10 15:39 +05:30 — Account/Foundation stream

- **Hostile JWT review:** Production verification now requires a numeric
  expiration claim and rejects malformed `exp`/`nbf` values. Test/development
  fixtures retain their existing compatibility behavior.
- **Evidence:** G1 Sanctuary JWT suite 12/12 passed; G0 Biome passed for the
  verifier and test file. This remains boundary evidence, not live JWKS or
  production traffic evidence.

### 2026-10-10 15:41 +05:30 — Account/Foundation stream

- **Verification update:** Direct web Vitest execution passed account query
  isolation and auth-cache boundary coverage: 2 files, 3/3 tests.
- **Evidence boundary:** G1 React/query boundary evidence for preventing
  account-scoped cache leakage under the configured harness; it does not prove
  browser multi-tab races, native cache behavior, or production traffic.

### 2026-10-10 15:43 +05:30 — Account/Foundation stream

- **Verification update:** Shared auth lifecycle and memory adapter suites
  passed under direct core Vitest: 2 files, 6/6 tests.
- **Evidence boundary:** G1 boundary evidence for bootstrap, auth-state
  subscription behavior, and adapter lifecycle contracts; it does not prove
  native provider callbacks, real Supabase sessions, or device behavior.

### 2026-10-10 15:48 +05:30 — Account/Foundation stream

- **Approval packet:** Added
  `docs/current_progress/2026-10-10-workspace-receipt-migration-approval.md`.
- **Scope:** Documents the existing layout-version constraint mismatch, the
  proposed durable workspace envelope/receipt migration, invariants, rollback-
  preserving behavior, and G0–G5 gates.
- **State:** Proposal only. No SQL migration, constraint replacement, API
  persistence change, or workspace queue-removal change was executed.

### 2026-10-10 18:10 +05:30 — Account/Foundation stream

- **Capability contract hardening:** Added registry coverage for access classes
  and explicit assertions that self capabilities are account-bound while
  attendance is scope-bound. The test treats declarations as affordance policy,
  not as a replacement for server authorization.
- **Evidence:** G1 core/Vitest capability manifest scenario 2/2 passed; G0
  Biome passed for the new test.

### 2026-10-10 18:16 +05:30 — Account/Foundation stream

- **Cross-platform consumer correction:** Web capability bootstrap now preserves
  the optional server `accessClass` and exposes a small lookup helper for
  affordance rendering. Legacy responses without the field remain valid; this
  does not replace server-side authorization.
- **Evidence:** G1 web Vitest capability bootstrap suite 3/3 passed; G0 Biome
  passed for the parser and test.

### 2026-10-10 18:22 +05:30 — Account/Foundation stream

- **Hostile cross-platform correction:** Mobile foreground/background queue
  draining now requires a resolved authenticated session, not merely a
  persisted active account ID. Anonymous, demo, unresolved, or signed-out
  identities therefore retain local work without attempting cloud mutation
  replay.
- **Evidence:** G1 mobile Vitest architecture and authenticated-sync suites
  5/5 passed; G0 Biome passed for the background-sync implementation and
  boundary test.

### 2026-10-10 18:25 +05:30 — Account/Foundation stream

- **Shared contract extraction:** The authenticated-cloud-sync predicate now
  lives in core identity state rather than only mobile background sync. It
  requires active identity availability plus an authenticated, non-local
  session and is covered as a pure cross-platform policy.
- **Evidence:** G1 core identity-state suite 10/10 passed; G0 Biome passed for
  core policy, core tests, and the mobile consumer.

### 2026-10-10 18:27 +05:30 — Account/Foundation stream

- **Local-only identity correction:** The shared cloud-mutation predicate now
  also evaluates the resolved profile citizenship/identity state. Authenticated
  sessions backed by `THIRD_CLASS`, `WANDERER`, or anonymous profiles remain
  local-only and are not retried into the cloud queue.
- **Evidence:** G1 core identity-state suite 10/10 passed; G0 Biome passed for
  the shared predicate, test, and mobile consumer.
### 2026-10-10 14:38 +05:30 — Canonical outbox fit audit for workspace persistence

- **Existing reusable substrate:** `packages/core/src/lib/sync/types.ts` and
  `useMutationQueue.ts` already carry `operationId`, `contractVersion`,
  `idempotencyKey`, `inputHash`, `clientRevision`, `logicalClock`, leases,
  retry/backoff, account ownership, auth-paused/conflict/reconciled states,
  and server receipt/revision fields. `SyncManager.tsx` already verifies
  operation identity and handles completed, pending, failed, and conflict
  receipts.
- **What is missing for workspace:** There is no registered workspace-layout
  mutation in `packages/core/src/lib/sync/registry.ts`; the workspace API and
  Supabase repository accept only the whole-row `WorkspaceLayoutUpsert` and do
  not accept/return an idempotency key, client revision precondition, or
  authoritative mutation receipt. Directly queueing the current upsert would
  therefore either hit an unknown registry key or fall through to a success
  path that removes the queue without a durable receipt.
- **Safe next seam:** Foundation must extend the existing envelope/API contract
  for a named workspace operation (target identity, complete payload or field
  patch, input hash, client revision, idempotency key, and receipt outcome), then
  add the registry dispatcher and server-side idempotency/revision handling.
  Browser and native hooks can then enqueue through `useMutationQueue` on an
  offline boundary and use TanStack Query only for transient foreground
  transport/cache state. TanStack Pacer may debounce/coalesce UI changes before
  enqueueing, but must not replace the queue or decide conflict outcomes.
- **Do not implement yet:** Adding a registry handler that calls the existing
  whole-row upsert would be misleading because it would bypass the receipt and
  revision guarantees. Adding a second workspace queue would violate the
  canonical outbox boundary.
- **Evidence:** G0 source audit. Existing queue capabilities and the missing
  workspace dispatch contract are directly verified; no claim is made about
  server-side receipt behavior until the contract is implemented.
### 2026-10-10 15:02 +05:30 — Schema blocker found during receipt-boundary audit

- `apps/gurudevi-mobile/supabase/migrations/20260328113000_user_workspace_layouts.sql` creates `layout_version` with `check (layout_version = 1)`.
- `packages/core/src/logic/workspace/layoutSync.ts` and `WorkspaceLayoutUpsertSchema` already emit/accept version 2, and the later canvas migration adds metadata without changing that check.
- Result: a real database applying the current canonical upsert can reject version-2 layout writes before receipt/idempotency work is added.
- The required fix is an additive forward migration that broadens the check to versions 1 and 2, but dropping/replacing the existing constraint is a schema behavior change. It is held behind the Deletion Veto pending explicit approval; no constraint was changed in this turn.
- Evidence: G0 migration/source comparison. No live database migration was executed.
### 2026-10-10 15:08 +05:30 — Wallpaper safety boundary slice

- Added `packages/core/src/lib/mediaUploadPolicy.ts` with a shared wallpaper
  policy: JPEG/PNG/WebP/AVIF only, 8 MiB maximum, 16 MP maximum, and mandatory
  decoded dimensions. Validation fails closed with typed error codes.
- Extended `FileUploadOptions` with `purpose` and validated metadata. The
  Cloudinary adapter now applies the policy whenever `purpose: 'wallpaper'` is
  requested, while generic/avatar callers retain their existing behavior.
- This is only the validation boundary. It does not yet provide authenticated
  signed uploads, EXIF stripping, responsive derivatives, ownership paths,
  deletion, or durable asset records; those remain required before wallpaper is
  exposed to users.
- Evidence: G1 Vitest boundary / @repo/core: 3/3 policy tests passed; Biome and
  targeted diff check passed. No network upload or device evidence.
### 2026-10-10 15:12 +05:30 — Storage adapter enforcement follow-up

- Applied the same wallpaper metadata policy at the Supabase storage adapter,
  so the validation boundary is backend-independent. A caller cannot bypass it
  merely by switching Cloudinary for Supabase.
- Generic and avatar uploads remain unchanged; no upload endpoint, bucket, or
  existing route was removed.
- Evidence: G1 @repo/core Vitest: 7/7 across wallpaper policy and workspace
  layout contracts. Biome passed. This still does not prove authenticated
  upload, EXIF stripping, ownership, deletion, or responsive derivatives.
### 2026-10-10 15:18 +05:30 — Browser Pacer coalescing slice

- `useBrowserWorkspaceAppearance` now uses the installed TanStack
  `useAsyncDebouncedCallback` with a 350 ms wait for remote layout persistence.
  Appearance, group order, and pins update local state immediately, then one
  debounced snapshot writer reads all latest refs and performs one complete-row
  upsert. This closes the rapid cross-field read/modify/write clobber window
  inside the browser hook while preserving the existing local keys and remote
  target fallback.
- Pacer remains transient UI pacing; it does not replace the durable outbox,
  choose conflicts, or claim authoritative sync.
- Evidence: G1 Vitest/jsdom: 3 files, 18/18 web canvas/floor tests passed;
  Biome passed. No multi-tab, process-death, or durable replay evidence yet.
### 2026-10-10 15:24 +05:30 — Hostile review correction for Pacer identity guard

- Review found and fixed a regression introduced while guarding debounced writes
  across account/workspace/layout-target changes: the identity was computed
  before `layoutTarget` initialization, causing all browser canvas hooks to throw.
- The identity guard now skips a queued Pacer callback when the target identity
  has changed, preventing an old snapshot from writing into a newly selected
  web/mobile target. Remote hydration also refreshes the latest refs.
- Evidence: G1 Vitest/jsdom: 3 files, 18/18 web canvas/floor tests passed after
  the correction; Biome passed. The failed 18/18 run is retained as review
  evidence and was not treated as success.
### 2026-10-10 15:51 +05:30 — Native Pacer coalescing slice

- Added the installed TanStack React Pacer package as a runtime dependency of
  `@repo/core` and replaced the native hook's manual 1200 ms `setTimeout` remote
  writer with `useAsyncDebouncedCallback`.
- Local `SafeZustandStorage` writes, mutation scope, retry policy, hydration,
  and last-synced snapshot checks remain unchanged. Pacer only coalesces the
  latest complete layout before the existing TanStack Query mutation.
- Hostile review caught and removed a duplicate `layoutRef` declaration before
  acceptance.
- Evidence: G1 @repo/core Vitest: 8/8 workspace/layout tests passed; Biome and
  targeted diff checks passed. Core full typecheck remains blocked by existing
  GrowthBook, PowerSync, and Form Builder declaration errors; no new Pacer
  diagnostic appeared in that run.
### 2026-10-10 18:23 +05:30 — Workspace outbox fallback integration

- Added `buildWorkspaceLayoutQueuedMutation` in `@repo/core` as the canonical envelope for the existing durable mutation queue. It stores the validated complete `WorkspaceLayoutUpsert`, account identity, `workspace-layout:<user>:<workspace>:<target>` scope, and client revision.
- Registered `upsertWorkspaceLayout` in `MUTATION_REGISTRY`; replay validates the serialized payload against `WorkspaceLayoutUpsertSchema` before using `workspaceLayoutAPI`.
- Native and browser TanStack Query layout mutations now enqueue the complete command after retry exhaustion only when the final error remains retryable. Auth, schema, permission, and conflict errors do not enter automatic retry fallback. Pacer remains a transient coalescing layer.
- The durable queue is account-filtered and generates operation/idempotency identities itself. Queue capacity and persistence errors are currently caught by the hooks' existing mutation error handling; the fallback does not claim success when enqueue fails.
- Hostile review limitation: `SyncManager`'s default registry path removes successful mutations without an authoritative server receipt. The workspace command therefore has durable at-rest replay but does not yet meet the goal's server receipt/conflict requirement. The existing receipt dispatcher is optional and no workspace command server receipt/revision endpoint or compare-and-swap contract exists. Do not describe this as complete canonical sync until that boundary is added.
- Existing blocker remains: database `layout_version = 1` check conflicts with current version-2 upserts; no migration changed in this slice.
- Evidence: G1 Vitest boundary / @repo/core: 3 files, 7/7 passed (workspace outbox envelope, retry policy, native layout logic). Biome passed for six touched source files. Scoped `git diff --check` passed; repository-wide diff check reports unrelated trailing whitespace in `.agents/workflows/code-execution.md` and `apps/gurudevi-mobile/docs/infra/pure-linux-wsl-migration-sop.md`. Core TypeScript compile remains blocked by existing missing GrowthBook/PowerSync/Form Builder declarations, unrelated mesh/form errors; no new diagnostics referenced the outbox files or touched hooks.
### 2026-10-10 18:34 +05:30 — Signed wallpaper upload-intent boundary

- Added `mediaUploadContract.requestWallpaperUpload` and the authenticated Sanctuary oRPC `media` router. It validates wallpaper MIME, byte, and dimensions against the shared policy before issuing a Cloudinary signed upload intent.
- The server signs only `folder` and `timestamp`, binds the folder to the authenticated UUID (`gurudevi/<user>/wallpapers`), expires the intent after five minutes, and never exposes `CLOUDINARY_API_SECRET`. `/api/media/*` is mounted for native/web oRPC clients.
- Added a pure signature/ownership test. Evidence: G1 Vitest / sanctuary-api: 2 files, 9/9 passed; Biome passed.
- Hostile review limitation: this is an upload-intent boundary, not the complete wallpaper product yet. A client upload adapter, post-upload asset record/ownership/delete path, server-side byte/magic-byte verification, EXIF stripping, derivatives, and layout appearance wiring remain. Existing unsigned generic/avatar uploads are preserved; wallpaper callers should use this intent path.

### 2026-10-10 18:42 +05:30 — Approved workspace receipt/revision migration slice

- Human approval was received to proceed with the previously blocked persistent workspace migration.
- Added an additive Supabase migration that broadens `layout_version` to 1/2, adds server-owned workspace revisions and last-operation identity, installs a monotonic revision trigger, and creates a revoked-to-client `workspace_mutation_receipts` ledger with idempotency and conflict states.
- Extended the shared layout record/upsert contract to carry operation, input-hash, and client-revision metadata without removing legacy fields. The repository now returns revision metadata and never lets a client overwrite the server revision.
- Registered workspace queue replay with the shared operation identity and returns a completed receipt-shaped result after the existing authoritative repository write. Legacy writers and routes remain in place pending a full server receipt transaction and compare-and-swap endpoint.
- Evidence: G1 @repo/core Vitest: 3 files, 9/9 passed; scoped Biome has one pre-existing formatter diagnostic in the already-modified wallpaper block; `git diff --check` still reports only unrelated repository-wide trailing whitespace. Migration has not been applied to a live database.

### 2026-10-10 18:55 +05:30 — Authoritative workspace receipt endpoint

- Added `sync.upsertWorkspaceLayout` to the shared oRPC contract and Sanctuary router.
- The authenticated handler now performs idempotency replay detection, operation-identity mismatch detection, row locking, optimistic revision conflict detection, layout upsert, monotonic revision assignment, and receipt insertion inside one database transaction.
- The queue registry now dispatches workspace mutations to this server-owned endpoint instead of treating a client-side Supabase write as an authoritative receipt. The old direct repository remains available for compatibility and migration fallback.
- Evidence: G1 sanctuary-api sync boundary: 7/7 existing sync tests passed; scoped diff checks passed. New transaction behavior still needs dedicated mocked transaction tests and a live staging migration rehearsal before G2/G3 claims.

### 2026-10-10 19:02 +05:30 — Workspace transaction boundary tests

- Added dedicated Sanctuary API boundary coverage for completed mutation settlement, revision conflict preservation, and operation-identity mismatch on idempotency replay.
- Evidence: G1 Vitest / sanctuary-api: workspace transaction boundary 3/3 passed in its isolated suite and the existing sync suite 7/7 passed independently after the test double was isolated to a workspace-specific raw-query mode. A concurrent mixed-file run remains unsuitable for evidence because the legacy setup module is process-global; it is not used as a completion claim.
- Biome formatting and scoped diff checks pass for the new handler/test path; the setup harness still has one pre-existing formatter diagnostic outside this slice.

### 2026-10-10 19:12 +05:30 — Offline reconnect receipt scenario

- Extended the shared receipt mapper to preserve `conflict` and `conflictReason` outcomes from the authoritative workspace endpoint.
- Added a deterministic offline → reconnect → receipt settlement scenario covering durable queue identity, completed server revision reconciliation, and recoverable conflict preservation.
- Added the explicit `@repo/core test:g2:offline-reconnect` evidence command.
- Evidence: G2 scenario / Vitest: 1 file, 2/2 passed. This proves queue/receipt state transitions under deterministic substitutions; it does not prove a physical device process death, live network, or staging database transaction.

### 2026-10-11 12:07 +05:30 — Hostile migration and receipt review

- Compared the workspace migration against the remote schema backup and all preceding workspace-layout migrations. The version-constraint name, `layout_target` uniqueness key, `is_default`, and surface metadata columns align.
- Hardened the receipt table with enabled RLS in addition to revoked client privileges, added receipt `updated_at` maintenance, and forced every inserted layout revision to `1` so legacy direct inserts cannot choose a revision.
- Added an advisory transaction lock per account/workspace/target before receipt lookup. This closes the absent-row race that a row lock cannot cover on two concurrent first writes.
- The handler now rejects a body user identity different from the authenticated principal, computes its own canonical payload hash instead of trusting the client hash, and preserves stored conflict reasons on replay. Native writes fold the server revision into local layout state; all generated upserts now send a revision (default `0`) for CAS.
- Compatibility caveat remains deliberate: legacy authenticated direct layout write policies are still active to preserve existing writers. They bypass the receipt/CAS endpoint. Their removal needs caller characterization and an explicitly approved cutover; do not call the system exclusively server-authoritative until then.
- Evidence: G1 Sanctuary workspace mutation boundary 4/4 passed; G1 core workspace/native layout logic 4/4 passed; scoped Biome and diff checks passed. Required next gate: staging migration rehearsal must validate RLS/database-role access, trigger behavior, and concurrent first-write behavior against real Postgres before device testing.
### 2026-10-10 18:46 +05:30 — Wallpaper client and visual-budget wiring

- Added the shared `WorkspaceWallpaper` appearance contract. Only HTTPS Cloudinary asset URLs are accepted during layout hydration/serialization; provider, public ID, and dimensions travel with the appearance metadata.
- Added `uploadWallpaper(source: Blob, metadata)` in `@repo/core`: it requests the authenticated signed intent, posts the file to Cloudinary, and validates the returned secure URL/public ID/dimensions before returning an asset record.
- Added `resolveWallpaperPresentation` to the shared visual budget layer. Essential quality disables wallpaper work; balanced quality uses a static low-opacity layer without blur; rich quality permits low-opacity blur.
- Wired the policy into web SelfFloor and native SelfFloor. Web reacts to browser memory/network/data-saver/reduced-motion signals; native respects the existing `useVisualCapabilities` essential gate. No wallpaper is fetched/rendered in essential mode.
- Evidence: G1 Vitest / @repo/core: 2 files, 7/7 passed (wallpaper policy plus layout/canvas contracts). G1 web jsdom: 2 files, 13/13 passed (SelfFloor and responsive floor integration). Biome passed.
- Hostile review limitation: client helper and rendering are now wired, but there is still no persisted wallpaper asset record, deletion lifecycle, post-upload server verification/EXIF stripping, or UI upload picker. The current secure intent endpoint remains the only accepted wallpaper upload path; generic unsigned media behavior is unchanged.
- Follow-up verification: after adding runtime response validation to `uploadWallpaper`, the scoped core TypeScript output contains no diagnostics from `mediaUpload.ts`, wallpaper policy, or Workspace types; remaining core diagnostics are pre-existing unrelated declaration/form/mesh errors.
### 2026-10-10 18:59 +05:30 — Receipt contract convergence correction

- Hostile review found that the approved receipt schema uses numeric server revisions while the earlier outbox builder carried `updatedAt` as `clientRevision`. Corrected the shared layout model to preserve `revision`, the serializer to send numeric `clientRevision`, and the outbox envelope to preserve the prepared revision without coercing timestamps.
- Browser and native foreground layout mutations now prepare one operation UUID, deterministic idempotency key, and input hash before the TanStack mutation, then call the authoritative `sync.upsertWorkspaceLayout` endpoint. Query retries reuse the same envelope; transient failures enter the durable queue with the same identities.
- Added receipt validation so a mismatched, failed, or conflict receipt cannot be reported as saved. Revision conflicts become non-retryable `WorkspaceLayoutConflictError`; authoritative completion is accepted only for the matching operation.
- `SyncManager` now interprets authoritative receipts returned by registry mutations, preserving completed/conflict/failed/pending lifecycle states instead of discarding the result.
- Evidence: G1 @repo/core Vitest: 4 files, 12/12 passed; G1 web jsdom: 3 files, 25/25 passed; Biome passed. Scoped core and Sanctuary API TypeScript output contained no diagnostics from touched workspace, receipt, or media files; full core typecheck still has unrelated pre-existing declarations/forms/mesh errors.
### 2026-10-10 19:05 +05:30 — Wallpaper asset ownership lifecycle

- Added `user_wallpaper_assets` migration with user ownership, provider public ID, secure URL, dimensions, byte length, format, uniqueness, indexes, and RLS policies. This is additive and does not alter generic/avatar media tables.
- Added authenticated `registerWallpaperAsset` and `deleteWallpaperAsset` oRPC procedures. Registration validates the shared wallpaper policy, HTTPS Cloudinary host, and owner folder prefix. Deletion checks the same owner prefix and database ownership, calls Cloudinary's signed destroy endpoint, then removes the owned row.
- `uploadWallpaper` now registers the Cloudinary result before returning it; `deleteWallpaper` is exported from `@repo/core` for UI/client flows.
- Hostile review limitation: provider registration still trusts the returned Cloudinary metadata after signed upload; server-side fetch/magic-byte verification, EXIF stripping, derivative generation, and a picker UI remain. No generic/avatar path was changed.
- Evidence: G1 sanctuary-api media/signature tests passed 2 files / 9/9 when run with the focused media and sync suite before the existing PowerSync fixture failure. Core media/visual/outbox tests passed 3 files / 7/7. Scoped Sanctuary API TypeScript output contained no diagnostics from media files.
- Failed evidence retained: `src/__tests__/sync.orpc.test.ts` currently fails its pre-existing `sync-canonical-success` case because the mock/durable idempotency ledger reports a reused key with a different payload; this failure is unrelated to the wallpaper lifecycle changes and was not suppressed.
- Evidence correction: in the latest combined run, the media-upload test file passed 2/2; the combined two-file run was 8/9 overall because the unrelated sync fixture failed. The earlier focused media/signature run was 9/9 before lifecycle additions.

### 2026-10-11 — Cross-stream workspace persistence reader/writer map

This map was captured before making any further workspace persistence changes.

#### Browser appearance and workspace canvas

- `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts`
  - Local readers: `readLocal` reads `workspace-appearance:<workspace>:<target>:<account>`; `readGroups` reads the parallel `workspace-groups:*` key; `readPinned` reads `workspace-pinned:*`.
  - Local writers: `setAppearance`, `setGroupOrder`, and `setPinnedIds` write those separate localStorage keys immediately.
  - Remote reader: hydration calls `createSupabaseWorkspaceLayoutRepository(...).getLayout(accountId, workspaceId, layoutTarget)`, then falls back to `shared` for a missing web/mobile target; `toWorkspaceLayoutRecord` maps the row into the shared layout model.
  - Remote writer: Pacer coalesces changes for 350 ms. `persistRemoteLayout` reads the current targeted/shared row again, overlays current appearance/group/pin refs, converts the complete row with `toWorkspaceLayoutUpsert`, prepares operation/idempotency metadata, then calls the TanStack Query mutation for `orpcClient.sync.upsertWorkspaceLayout`. Retry exhaustion enqueues that same command in the durable mutation queue.
  - `useWorkspaceCanvas`, `useSelfCanvas`, `useProfileCanvas`, `useLibraryCanvas`, and `useCommunityCanvas` consume this hook for appearance, group order, and pins. Browser feature/furniture arrangement is therefore spread across domain canvas state and this shared preference hook; inspect each canvas hook before changing its persistence boundary.
  - Finding: `readLocal` currently reconstructs only `preset` and `motion`, so it drops the newly added `wallpaper` from localStorage hydration. Remote hydration may later restore it, but offline/reload local restoration is incomplete.

#### Native workspace layout

- `packages/core/src/native/useWorkspaceLayoutSync.ts`
  - Local reader: `SafeZustandStorage.getItem(buildWorkspaceLayoutStorageKey({ userId, workspaceId, layoutTarget }))`, followed by JSON parse and `normalizeWorkspaceLayout`.
  - Remote reader: `fetchRemoteLayout` calls `workspaceLayoutAPI.getWorkspaceLayout` for the resolved target, then falls back to `shared`; records pass through `toWorkspaceLayoutRecord`. Hydration selects local/remote via `choosePreferredWorkspaceLayout`.
  - Local writer: after hydration, the entire serialized `WorkspaceLayout` is saved to the generated storage key.
  - Remote writer: layout changes are Pacer-debounced for 1200 ms; `persistRemoteLayout` reads the current layout ref, converts the complete model, prepares a stable mutation envelope, and calls `orpcClient.sync.upsertWorkspaceLayout` through TanStack Query. Retry exhaustion queues the same command. `SyncManager` replays the registered command through `MUTATION_REGISTRY` to the authoritative endpoint.
  - `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts` uses the shared native synchronization hook for Self canvas state; route/floor hooks should be checked for additional workspaces before broadening a change.

#### Shared persistence contracts and compatibility paths

- `packages/core/src/logic/workspace/layoutSync.ts` owns target selection (`web` for expanded web, `mobile` for compact web/native), storage keys, row-to-model and model-to-upsert mapping, plus timestamp-based local/remote preference.
- `packages/core/src/logic/schemas/workspace-layout.schema.ts` is the shared persisted row/upsert contract. Workspace appearance (including wallpaper), groups, furniture order/hidden/pinned/zone fields travel in the complete layout row, with reserved appearance/group-order metadata keys.
- `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts` is a direct Supabase read/upsert/delete adapter. It remains a compatibility path: direct `upsertLayout` does not go through the authoritative receipt transaction. Search found the current browser hook using its reader; foreground native/browser workspace writers call the oRPC authoritative mutation instead.
- `packages/core/src/api/workspaceLayout.ts` and its runtime/repository remain the legacy direct API surface used for remote reads and any older callers. `packages/core/src/lib/sync/registry.ts` is the durable replay adapter; its workspace mutation targets `orpcClient.sync.upsertWorkspaceLayout`.
- The API endpoint and durable queue do not persist the wallpaper binary. The workspace row stores only the validated Cloudinary asset reference and appearance metadata; ownership/metadata live in `user_wallpaper_assets`.

#### Convergence constraints

- Do not add another workspace persistence writer until both streams review this map and agree which compatibility paths remain supported.
- Preserve the existing web/mobile/shared target split and identify its resize/hydration implications before changing target selection.
- The browser local wallpaper omission is confirmed from the current reader; it should be addressed as part of the next coordinated persistence slice, with a regression test for offline hydration.
- The upload hardening follow-up in this turn changes media upload verification only; it does not modify workspace persistence.

### 2026-10-11 — Wallpaper API authorization and provider-boundary verification

- Added route-level Sanctuary API tests using the actual oRPC app, auth middleware, Cedar evaluator, a mocked database, and a mocked Cloudinary response. The first run exposed that `WallpaperAsset` was not a declared Cedar resource, so real registration requests were denied before reaching the handler.
- Corrected the wallpaper API contract policies to the existing self-scoped `User` update capability. This is the current Cedar resource for a user's owned appearance assets; no new Cedar resource or broad policy was introduced.
- Coverage now exercises signed intent issuance through the authenticated route, provider-verified registration metadata, rejection of provider dimensions over the pixel budget, and preservation of the ownership row when Cloudinary returns HTTP 200 without a confirmed destroy result.
- Evidence: G1 Vitest / Sanctuary API media route suite: 6/6 passed; G1 @repo/core wallpaper and upload-policy suites: 6/6 passed; Biome passed. `audit:api-contracts` inspected 224 active routes / 38 contract sources with 0 findings. `audit:authorization-parity` remains red on five pre-existing ZenStack parity findings (`EditorialSubmission`, `EditorialWork`, `EditorialRightsAgreement`, `UserRewards`, and `EditorialAuthor`); none concern wallpaper or the `User` resource.
- Remaining provider risk: Cloudinary Admin API and destroy behavior are mocked; no live credentialed provider request, production upload, orphan cleanup, byte-level signature sniffing, or EXIF removal was verified in this slice.
- TypeScript evidence: Sanctuary API `tsc --noEmit` reported no diagnostics in the changed media contract, handler, or tests; it remains nonzero on the unrelated existing `apps/sanctuary-api/src/core/app.ts` Sentry option `profilesSampleRate`.

### 2026-10-11 — Token-scoped cleanup for failed wallpaper registration

- The authenticated Cloudinary intent now signs `return_delete_token=true` together with its user folder and format allowlist. The shared client validates that the returned upload URL is the Cloudinary HTTPS image-upload endpoint and validates file metadata against the shared policy before requesting an intent.
- If Cloudinary accepts the upload but the authenticated asset-registration call fails, the client attempts cleanup using that upload's short-lived delete token. The helper reports cleanup as unconfirmed if the provider request or result cannot be validated; the temporary token is never included in the returned wallpaper object. This follows Cloudinary's documented 10-minute delete-token capability: https://cloudinary.com/documentation/image_upload_api_reference
- Evidence: G1 @repo/core Vitest: 3 files, 10/10 passed (upload helper normal registration, cleanup success/failure, URL validation, presentation policy, upload policy); G1 Sanctuary API media suite: 1 file, 6/6 passed; Biome passed. The prior focused API contract audit remains 224 routes / 38 sources / 0 findings.
- Typecheck remains nonzero on existing workspace declaration errors: Core has missing GrowthBook, PowerSync, and Form Builder declarations plus mesh errors; Sanctuary API has the existing Sentry `profilesSampleRate` option error. No diagnostic shown referenced the media-upload source or test files.
- Client picker controls, EXIF-stripping verification, provider-level cleanup execution, DB migration rehearsal, and live Cloudinary validation remain open. `expo-file-system` 58.0.7's installed `File` declaration explicitly implements `Blob`, providing a source-grounded native file payload for the later picker integration; no native UI has been added in this slice.

  - `packages/core/src/logic/domains/factory.ts` creates the single repository implementation; no second repository/table was found.

- **Readers/renderers that do not write:**
  - `packages/core/src/logic/workspace/canvas.ts` normalizes layouts and resolves surfaces/zones/order/pin/hidden.
  - `packages/ui/src/components/workspace/*` and web/native floor/canvas components render resolved state and invoke callbacks; they are not persistence boundaries.
  - Classroom and admin dashboards consume the shared hook or direct teacher data hook.

- **Convergence risks requiring the next persistence design:**
  1. Browser has three local keys and three read-modify-whole-row setters; native has one complete-layout key and one complete-row writer. They can overwrite each other when sharing a target or when resize switches targets.
  2. Whole-row Supabase upsert has no field-level merge/revision precondition; concurrent edits can clobber unrelated fields.
  3. Browser/native local acknowledgement and remote success are not represented by one durable operation ID/receipt.
  4. The teacher data hook can drop appearance/group metadata and must not remain an independent writer.
  5. Student dashboard local-only behavior is an explicit boundary to preserve unless approved otherwise.
  6. No deletion or replacement is authorized by this map. Next change should add the shared operation envelope/reconciliation seam and migrate writers one at a time.

- **Evidence:** G0 repository-grounded map from exact source search and inspection. It proves current call paths and contracts; it does not prove multi-device conflict behavior, process-death durability, or production replay.

### 2026-10-11 12:22 +05:30 — Sanctuary stream verification of persistence map

- **Milestone/task:** Re-verified exact browser appearance and native layout
  readers/writers before any further workspace persistence change.
- **Files/contracts inspected:**
  `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts`;
  `packages/core/src/native/useWorkspaceLayoutSync.ts`;
  `packages/core/src/logic/workspace/{canvas,layoutSync,outbox,syncPolicy}.ts`;
  `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts`;
  `packages/core/src/api/{workspaceLayout.ts,runtimes/workspaceLayout.runtime.ts}`;
  `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts`;
  plus web canvas hook consumers and mobile SelfCanvas.
- **Verified browser path:**
  - `readLocal` / `readGroups` / `readPinned` independently read three
    account-, workspace-, and target-keyed `localStorage` values. The appearance
    reader validates and returns only `preset` and `motion`; it currently drops
    optional `wallpaper` from locally stored appearance.
  - Hydration reads those local values first, then directly reads the target
    Supabase row through `createSupabaseWorkspaceLayoutRepository.getLayout`;
    if absent, reads `shared`. Remote appearance/groups/pins replace local state
    and are written back to the three local keys. This is a remote-wins
    hydration path, not timestamp comparison.
  - `setAppearance`, `setGroupOrder`, and `setPinnedIds` each update their
    separate local value immediately and schedule `persistRemoteLayout` through
    `useAsyncDebouncedCallback` (350 ms). The callback directly reads the
    targeted Supabase row then `shared`, overlays refs for all three fields,
    converts that complete layout to an upsert, prepares the operation envelope,
    and writes through `orpcClient.sync.upsertWorkspaceLayout` via TanStack
    Query. Retryable failure is queued through the shared `useMutationQueue`;
    non-retryable failure is surfaced as status only. Mutation scope serializes
    mutation execution after the read; it does not serialize the preceding
    remote read or make the read-modify-write atomic.
  - Browser canvas consumers are `useSelfCanvas`, `useWorkspaceCanvas`,
    `useCommunityCanvas`, `useLibraryCanvas`, and `useProfileCanvas`; they
    consume the hook/setters and do not independently persist these fields.
    `layoutTarget` is selected from viewport width (compact => `mobile`, expanded
    => `web`).
- **Verified native path:**
  - `buildWorkspaceLayoutStorageKey` selects one full-layout local record;
    `SafeZustandStorage.getItem` reads it, JSON parsing plus
    `normalizeWorkspaceLayout` validates/normalizes it. Remote hydration calls
    `workspaceLayoutAPI.getWorkspaceLayout` for the target then `shared`, and
    `choosePreferredWorkspaceLayout` chooses local versus remote by its existing
    timestamp rule.
  - The in-memory setter family updates a complete `WorkspaceLayout`; after
    hydration, an effect writes the complete serialized layout to
    `SafeZustandStorage`. A separate 1200 ms Pacer debounce prepares one upsert
    envelope and calls the same ORPC mutation; retryable failure goes into
    `useMutationQueue`. The callback records a receipt revision when returned,
    while the serialized layout comparison and `lastSyncedLayoutRef` gate
    duplicate sends.
  - Mobile `useSelfCanvas` is one consumer. Other shared consumers include
    classroom/library/admin surfaces listed in the earlier map. The student
    canvas with remote sync disabled remains local-only.
- **Shared writer/read overlap and constraints:**
  - The ORPC workspace mutation ultimately reaches `workspaceLayoutServices`
    and the same Supabase repository, whose upsert replaces the complete row on
    `(user_id, workspace_id, layout_target)` conflict. The legacy repository
    remains a read path in browser hydration and browser pre-write fetches.
  - `useTeacherClassroomWorkspaceData` remains a separate direct service
    writer/reader and does not preserve appearance/group metadata. Do not
    change either hook/repository contract until the Account/Foundation stream
    confirms the envelope/replay contract and this writer is included in the
    convergence plan.
- **Decision/progress:** No persistence code or data contracts were changed in
  this verification. This map supersedes the earlier entry where ORPC routing,
  envelope preparation, and the browser local wallpaper loss were not explicit.
- **Evidence level and limitations:** G0 source inspection, based on the
  current worktree. Does not establish runtime ordering, race freedom, offline
  replay correctness, or server receipt settlement.
- **Dependencies/conflicts:** Shared `useMutationQueue` envelope/replay and
  receipt dispatch remain Account/Foundation owned. Main collision points are
  whole-row replacement, unsynchronized browser pre-write reads, the teacher
  direct writer, and browser local appearance losing wallpaper on read.
- **Requested action from Account/Foundation stream:** Please confirm this
  still matches the current queue/receipt implementation, identify any new
  layout readers/writers added since this inspection, and flag the shared
  contract boundary before either stream edits workspace persistence again.

### 2026-10-11 12:32 +05:30 — Wallpaper picker UI wiring

- **Milestone/task:** Expose the existing registered wallpaper upload path on
  browser and native Self appearance controls.
- **Files touched:** Added
  `apps/gurudevi-web/app/(sanctuary)/components/WallpaperUploadControl.tsx`
  and `apps/gurudevi-web/tests/integration/wallpaperUploadControl.test.tsx`;
  wired `WorkspaceAppearancePicker` and `FloorAtmospherePicker` to the control;
  added it to Profile settings; wired the existing appearance setter from
  Workspace, Library, Community, Self, Profile, and native Self. Added the
  related presentation styles.
- **Decision/progress:** Web accepts AVIF/JPEG/PNG/WebP up to 8 MB and 16 MP,
  decodes, preserves aspect ratio while downsampling to a 1920 px longest edge,
  re-encodes to JPEG, validates the result, then calls shared `uploadWallpaper`.
  Native requests photo-library permission, rejects unsupported/oversized
  source assets before manipulation, uses installed Expo ImageManipulator
  decoding limits and JPEG re-encoding, then calls the same shared uploader.
  Palette and motion controls now spread current appearance before changing a
  field so an existing wallpaper is retained. Existing setter and persistence
  contracts were not changed.
- **Evidence level and limitations:** G1 Vitest / web jsdom: picker preflight
  rejects an unsupported file before decode/upload, 1/1 passed. Existing web
  canvas component/domain suites: 20/20 passed. Biome and `git diff --check`
  passed for the scoped files. A wider SelfFloor integration run was 38/39; the
  failing mood-history assertion could not find the expected “feeling centered”
  text and does not exercise wallpaper upload. Web and mobile full TypeScript
  checks remain nonzero on existing workspace-wide declaration/type failures;
  no diagnostic from the mobile run named the changed SelfFloor file, and after
  the picker MIME correction no web diagnostic named the new picker. No native
  device or browser G4 upload evidence was gathered.
- **Dependencies/conflicts:** Browser local appearance hydration still drops
  wallpaper and remains held behind the cross-stream persistence alignment
  gate. Native controls are wired only on SelfFloor so far; additional mobile
  floor controls need to use the same shared uploader/adaptation. Replacing a
  wallpaper retains the older registered asset until a persistence-safe asset
  cleanup lifecycle is defined. The upload path still depends on the server's
  Cloudinary verification and account ownership boundaries documented above.
- **Requested action from Account/Foundation stream:** Confirm the workspace
  persistence map and shared envelope before any fix for browser local
  wallpaper hydration or old-asset cleanup. No change to those persistence
  paths is part of this UI slice.

### 2026-10-11 12:39 +05:30 — Server-side wallpaper normalization hardening

- **Milestone/task:** Close the client-bypass gap for wallpaper dimension
  limits and EXIF/profile stripping.
- **Files/contracts touched:**
  `apps/sanctuary-api/src/core/handlers/media.ts` and
  `apps/sanctuary-api/src/__tests__/media-upload.test.ts`.
- **Decision/progress:** The authenticated upload intent now signs Cloudinary's
  incoming transformation `c_limit,h_1920,w_1920,fl_strip_profile`, which runs
  before the normalized asset is stored. The intent also binds a random
  `public_id` with `overwrite=false`, making reuse of the same signed intent
  unable to replace an existing wallpaper. Registration rejects verified
  provider dimensions above the normalized 1920 px edge even when total pixel
  count would otherwise fit the general policy.
- **Source grounding:** Current Cloudinary upload docs define `transformation`
  as an incoming transformation before cloud storage; the docs describe
  incoming transformations for size normalization and specifically note that
  these transformations preserve metadata by default, so the explicit strip
  profile flag is required. Signed upload parameters include `public_id` and
  `overwrite`. References:
  https://cloudinary.com/documentation/eager_and_incoming_transformations
  https://cloudinary.com/documentation/image_upload_api_reference
- **Evidence level and limitations:** G1 Vitest / Sanctuary API media route:
  7/7 passed, including signature parameters, unique non-overwritable intent,
  authenticated route, provider metadata validation, oversized source result,
  and deletion result handling. Biome passed for both touched files. Tests mock
  Cloudinary; no live upload verified that this product environment applies the
  incoming transformation/strip flag as expected.
- **Hostile review limitation:** Cloudinary upload presets have no per-preset
  file-size limit, and this flow currently caps source bytes in the client UI
  while validating provider bytes after upload. A hostile authenticated client
  can submit a larger source before registration rejects it; account upload
  limits are the remaining provider-side bound. A strict pre-upload 8 MB limit
  requires a bounded server-proxy upload path or an equivalent provider-side
  control and must be designed separately. Reference:
  https://cloudinary.com/documentation/upload_presets
- **Dependencies/conflicts:** Workspace appearance/layout persistence was not
  changed. Browser local wallpaper hydration and cleanup of replaced assets
  remain behind the cross-stream persistence agreement. Mobile domain package
  screens outside SelfFloor still need an app-owned picker integration.
- **Requested action:** Rehearse the signed transformation against a non-prod
  Cloudinary account before production use and decide whether a server-proxy
  upload is warranted for a hard source-byte cap.

### 2026-10-11 12:44 +05:30 — Account/Foundation stream: workspace-contract convergence check

- **Milestone/task:** Verified the current shared mutation/outbox/receipt
  contract against the Sanctuary stream's 12:22 persistence map before either
  stream makes another workspace persistence change.
- **Files/contracts owned or currently in scope:**
  `packages/core/src/lib/sync/{types,useMutationQueue,registry,receipts}.ts`,
  `packages/core/src/lib/sync/sync/SyncManager.tsx`,
  `packages/core/src/logic/workspace/{outbox,layoutSync,syncPolicy}.ts`,
  `packages/core/src/native/useWorkspaceLayoutSync.ts`,
  `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts`, and the
  authenticated Sanctuary API `sync.upsertWorkspaceLayout` procedure. The
  Foundation stream owns the generic envelope, queue lifecycle, replay lease,
  and receipt settlement semantics; it does not own floor composition or
  appearance presentation.
- **Verified shared behavior:** A workspace layout write creates a UUIDv7
  `operationId` and deterministic idempotency/input hash, carries the complete
  canonical layout-row upsert payload, and is sent to
  `orpcClient.sync.upsertWorkspaceLayout`. The server requires the authenticated
  user to match the payload user, serializes a user/workspace/target transaction,
  checks its workspace receipt ledger for operation/payload reuse, and returns a
  `pending | completed | failed | conflict` receipt. Foreground native and
  browser hooks accept only the matching completed receipt; retryable failures
  enqueue the same canonical command for `SyncManager`/registry replay.
- **Queue change since the earlier map:** The queue has been hardened, not
  replaced. It now records optional envelope identity/revision/receipt fields,
  explicit command states, terminal failure time, and an atomic replay lease.
  It preserves account attribution, pauses terminal/auth/conflict commands,
  bounds the active queue and DLQ, and supports recoverable DLQ restore. This
  does not add a second workspace queue or new workspace persistence endpoint.
  `receipts.ts` is a compatibility mapper for the older generic receipt endpoint;
  the workspace oRPC procedure returns the shared receipt shape directly.
- **Map confirmation/correction:** The 12:22 map remains accurate for
  `useBrowserWorkspaceAppearance`, `useWorkspaceLayoutSync`, the whole-row
  repository path, and `useTeacherClassroomWorkspaceData`. No new layout or
  appearance persistence reader/writer was found in this verification. Recent
  wallpaper work adds UI consumers of the existing appearance setter only. The
  browser still reads three local keys, drops wallpaper in `readLocal`, and does
  a direct repository read before whole-row oRPC upsert. Native still uses one
  full-layout local record and Pacer-debounced whole-row oRPC upsert. The teacher
  direct service writer remains an overlapping legacy writer that can omit
  appearance/group metadata.
- **Evidence level and limitations:** G0 exact source inspection only. It does
  not prove receipt-ledger migration presence, multi-device merge behavior, or
  process-death recovery in a real client.
- **Dependencies/conflicts/requested coordination:** Do not modify workspace
  persistence writers until we jointly decide the migration of the teacher
  writer and the browser pre-read/whole-row conflict strategy. Any next slice
  must retain target separation (`web`, `mobile`, `shared`), route through the
  existing envelope/receipt endpoint, and avoid treating local acknowledgement
  as server settlement. Foundation should be included before the Sanctuary
  stream changes reader/writer behavior; Sanctuary should identify the desired
  field-level merge and revision UX before Foundation changes the server contract.

### 2026-10-11 12:47 +05:30 — Browser wallpaper rendering coverage

- **Milestone/task:** Make uploaded floor wallpapers visible on each browser
  floor that exposes appearance settings, while applying the shared visual
  budget and responsive Cloudinary URL policy.
- **Files/contracts touched:** Added
  `apps/gurudevi-web/app/(sanctuary)/components/WorkspaceWallpaperLayer.tsx`
  and its focused G1 test; wired the layer into Self, Profile, Workspace,
  Library, and Community floors. Added relative isolated stacking contexts to
  Workspace, Profile, Library, and Community roots. No persistence hook,
  setter, schema, endpoint, or shared sync contract changed.
- **Decision/progress:** The reusable layer calls
  `resolveWallpaperPresentation` with `useBrowserVisualBudget`; this uses the
  existing essential/balanced/rich quality policy and responsive Cloudinary
  transformation. Self already used the same policy and remains as-is. Source
  inspection found that the other four browser floors had upload controls but
  no wallpaper rendering path; those now render the registered asset.
- **Evidence level and limitations:** G1 Vitest / jsdom: focused wallpaper
  layer 1/1 passed; existing browser domain canvas and responsive-floor suites
  13/13 passed. Biome passed on the scoped files. Web TypeScript G0 failed on
  existing AuthProvider implicit-any and workspace/core module declaration
  errors; none named this slice. No G4 browser bundle or visual screenshot was
  gathered. Native wallpaper rendering remains SelfFloor-only; app-owned
  integration for mobile domain floors is still outstanding.
- **Hostile review:** The floor roots establish isolated stacking contexts;
  the wallpaper layer is absolutely positioned behind content, hidden from
  assistive technology, and pointer-inert. Budget `essential` returns no layer;
  balanced quality uses a 1280 px transformed URL and rich quality uses 1920
  px. No existing rendered wallpaper, route, or fallback was removed.
- **Coordination:** This is presentation-only and does not cross the held
  workspace persistence boundary. Continue to hold browser/native writer
  changes until the teacher direct writer and browser whole-row conflict
  strategy have an agreed migration plan, as recorded by both streams above.

### 2026-10-11 12:59 +05:30 — Shared native wallpaper rendering

- **Milestone/task:** Apply the canonical runtime visual budget and responsive
  wallpaper presentation to native Sanctuary workspace canvases and manual
  Library/Community floors.
- **Files/contracts touched:** Added
  `packages/ui/src/components/workspace/WorkspaceWallpaper.tsx`, exported it
  from the workspace UI package and its package exports, and integrated it
  into `ResponsiveWorkspaceCanvas`. Mobile Self retains its current
  essential-quality gate and now uses the shared layer. Native Library and
  Community screens render their existing layout appearance wallpaper. No
  persistence hook, setter, or record contract changed.
- **Decision/progress:** The shared layer maps the existing RealityProvider
  device tier, network, data-saver, battery-saver, and reduced-motion signals
  plus React Native foreground state into `resolveRuntimeVisualBudget`, then
  uses `resolveWallpaperPresentation`. Expo Image's installed declarations
  confirm responsive content fit, disk/memory cache policy, Android decode
  format, downscaling, low network priority, transition, and blur props.
  ResponsiveWorkspaceCanvas reads wallpaper from the canonical
  `WorkspaceLayout.appearance` so classroom and admin canvas consumers inherit
  the same rendering behavior without new writer paths.
- **Evidence level and limitations:** G1 native React Native mock engine / UI
  canvas spatial suite: 9/9 passed, including wallpaper rendering from the
  layout appearance. G1 core visual-budget/wallpaper policy: 6/6 passed.
  Biome and scoped `git diff --check` passed. UI, Library, Community, and
  mobile package typechecks remain nonzero on pre-existing core exports,
  module declarations, TanStack Table, OCR, and mesh typing errors; filtered
  diagnostics named none of this change after the explicit package export.
  No G4 Android/iOS Metro export or G5 device run was collected.
- **Hostile review:** The image uses the installed `expo-image` package rather
  than adding a dependency, opts into downscaling, low network priority, and
  capability-based cache/decode settings, and is pointer-inert. The core
  policy suppresses wallpaper at essential quality, including offline/poor
  network; verify whether already-cached wallpaper should remain visible in
  that state before broadening the policy. Existing Self appearance controls
  and essential-quality gate remain in place.
- **Coordination:** This is rendering-only and leaves the agreed hold on
  browser/native persistence writers intact. Shared workspace canvases,
  Self, Library, and Community now have native presentation coverage; native
  account/profile or other custom floor entry points still require inventory
  against actual user-visible tab routes before claiming every mobile tab is
  covered.

### 2026-10-11 13:05 +05:30 — Cross-platform wallpaper bundle evidence addendum

- **Evidence update:** The current Gurudevi web Next.js production build
  completed successfully with the shared UI wallpaper component in the source
  graph. G4 Expo Android export also completed under the configured Doppler
  runtime: Metro bundled `apps/gurudevi-mobile/index.ts` (7,333 modules) and
  emitted the Android Hermes bundle. The output is the ignored smoke directory
  `apps/gurudevi-mobile/dist/native-workspace-wallpaper-check`; no `prebuild`
  or native project mutation ran.
- **Limitations:** The Android export reports an existing Sentry native config
  warning for the prebuilt Android project and `expo-router` missing export
  target warnings that fall back to hierarchical resolution. This proves the
  JS/asset bundle only, not physical device behavior, native Sentry setup, or
  wallpaper visual quality. The separate package type checks remain blocked by
  existing errors recorded above.

### 2026-10-11 13:07 +05:30 — Android wallpaper policy re-export

- **Evidence update:** Re-exported Android after the shared `VisualCapabilities`
  essential-quality guard was added. Doppler-backed Expo export succeeded;
  Metro bundled 7,333 modules in 79.6 seconds and emitted a 28 MB Hermes
  bundle to the ignored `dist/native-workspace-wallpaper-check-final` output.
  The run still reports the pre-existing Sentry native-config and Expo Router
  package-export warnings. This supersedes the prior Android export evidence
  for the current wallpaper component source.
- **Web cross-check:** The Next.js 16.3.8 production build also completed for
  this final shared component source; Next reports that this build skips type
  validation, so package typecheck failures remain separately recorded.
- **Route inventory correction:** Actual mobile tabs include Self, Community,
  Library, Profile, and Workspace. The shared native canvas now renders a
  stored wallpaper for classroom/admin canvas consumers, and manual Community
  and Library screens render their own workspace appearance. Self remains the
  only native screen with wallpaper selection/upload controls. Native Profile
  has no workspace appearance reader yet; adding one would cross the held
  persistence boundary and is not part of this rendering slice.

### 2026-10-11 — Persistence convergence contract proposal

- **Current-state clarification:** `WorkspaceLayoutUpsertSchema` already carries
  optional `clientRevision`; `toWorkspaceLayoutUpsert` supplies the hydrated
  layout revision (defaulting to `0`). `sync.upsertWorkspaceLayout` checks that
  revision under a row lock and persists a `REVISION_CONFLICT` receipt when it
  differs from the current row revision. The mutation still writes every row
  field. This is row-level compare-and-swap, not field-level merge.
- **Retry consequence:** The durable outbox intentionally preserves the same
  complete upsert and operation/idempotency identity. That is correct for
  transport retries, but a revision conflict is terminal and must not be
  retried unchanged. Replaying a stale full-row snapshot after a newer write
  cannot safely infer which fields the user intended to change.
- **Proposed shared contract:** Keep `layoutTarget` (`shared`, `web`, `mobile`)
  as an independent row identity. Represent a workspace edit as a patch over
  explicit field groups (`arrangement`: order/hidden/pinned/zones;
  `appearance`; `groups`; and any separately owned metadata), with its base
  revision and base values or stable hashes for the changed groups. The server
  applies a patch atomically when the row revision matches. On a stale revision,
  it may rebase only groups whose current server value still matches that
  group's base value; overlapping edits to the same group return a conflict
  receipt that includes the current revision and a fetchable authoritative row.
  A successful merged write increments the row revision and settles the original
  operation receipt. Preserve operation ID/idempotency identity across network
  retries; a semantic rebase is a new operation with a new identity.
- **Client behavior required:** On a conflict, pause that outbox item, fetch the
  authoritative row, merge disjoint field groups, and submit a new operation.
  If the same group changed remotely, preserve the user's pending edit locally
  and surface a resolvable conflict instead of silently choosing local or
  remote. Local acknowledgement must not be presented as server settlement.
- **Writer migration gate:** Move `useTeacherClassroomWorkspaceData` off the
  direct whole-row repository writer before enabling patches, and make browser
  persistence submit changed intent rather than relying on a separate pre-read
  followed by a full-row upsert. Fix browser wallpaper local hydration within
  that reader migration. Keep retry/replay on the existing TanStack Query,
  Pacer, mutation queue, registry, and receipt path; do not add a second queue.
- **Status:** Proposal for both streams to review; no persistence code or
  contract was changed in this entry. Required review decision: confirm field
  groups and whether same-group conflicts should be explicit user resolution
  or follow a product-defined deterministic rule.
- **Evidence:** G0 inspection of the current schema, `layoutSync.ts`,
  `outbox.ts`, `useBrowserWorkspaceAppearance.ts`,
  `useWorkspaceLayoutSync.ts`, `useTeacherClassroomWorkspaceData.ts`, and the
  server `sync.upsertWorkspaceLayout` transaction. This proposal does not prove
  runtime rebase behavior or cross-device ordering.

### 2026-10-11 12:44 +05:30 — Account/Foundation stream review of persistence convergence proposal

- **Decision:** Accepted as the correct direction, with the following contract
  constraints. No workspace persistence writer or API was changed in this
  review.
- **Field groups:** Keep `layoutTarget` as row identity. Use exactly these
  independently mergeable intent groups: `arrangement` (`order`, `hidden`,
  `pinned`, `zoneBySurface`); `appearance` (`preset`, `motion`, validated
  wallpaper reference); and `groups` (`groupOrder`). Do not expose a generic
  mergeable `metadata` group: metadata must be split into named, versioned,
  explicitly owned groups before it can participate in rebase. This prevents a
  future unreviewed metadata field from being silently overwritten. Reserved
  appearance/group metadata is represented by those two named groups, not by a
  catch-all patch.
- **Safe rebase:** Confirmed. A patch must carry its base row revision plus the
  changed-group base values or canonical hashes and replacement values. Under
  the existing row lock, the server may apply a stale patch only if every
  changed group's current canonical value equals its supplied base. It must
  validate target/account ownership and patch schema, increment revision once,
  and record the original receipt atomically. An overlapping group must return
  a conflict receipt with current revision and either a bounded authoritative
  snapshot or a stable fetch reference; a client must never infer the remote
  value from a receipt alone.
- **Same-group policy:** Return a resolvable conflict by default. We should not
  introduce silent last-writer-wins for arrangement, appearance, or group order:
  each represents visible user intent and a deterministic winner would conceal
  a cross-device loss. A later product decision may define a group-specific
  deterministic merge only if it has a proven associative/commutative semantic
  and explicit UX/evidence; it is not part of this migration.
- **Queue/rebase identity:** Confirmed distinction: transport retry retains the
  exact serialized command, `operationId`, and idempotency key. A semantic
  rebase changes the payload/base revision, so it must receive a new operation
  ID and a new idempotency key. The conflicted original remains non-dispatchable
  (`commandState: conflict`); after the user or deterministic safe-rebase flow
  creates its successor, it should be explicitly archived/discarded with a
  lineage reference rather than requeued or overwritten. The current generic
  queue has conflict state and atomic leases but no typed successor/lineage
  fields, so the patch-contract implementation must add an additive
  `supersedesOperationId`/source-receipt field (and test it) before automatic
  semantic rebases are enabled. This preserves forensic traceability while the
  replacement command has a fresh transport identity.
- **Evidence and dependency:** G0 source review of `commandLifecycle.ts`,
  `useMutationQueue.ts`, and `SyncManager.tsx`: conflict commands are already
  excluded from lease acquisition and receipt conflicts transition to
  `commandState: conflict`. The required queue lineage schema, patch endpoint,
  safe-rebase transaction, conflict UI, and multi-device tests do not yet
  exist. Keep the teacher writer and browser pre-read writer frozen until that
  migration plan is approved by both streams.

### 2026-10-11 13:12 +05:30 — Browser wallpaper cache hydration repair

- **Milestone/task:** Preserve validated uploaded wallpaper metadata when the
  browser restores its account/workspace/target-scoped appearance cache.
- **Files/contracts touched:** Updated
  `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` and added
  `apps/gurudevi-web/tests/unit/canvas/workspaceAppearanceStorage.test.ts`.
  No remote writer, storage key, shared layout schema, API, or queue contract
  changed.
- **Behavior:** Local appearance parsing now validates an optional wallpaper
  against `WorkspaceAppearanceSchema` and restores it with `preset` and
  `motion`. Invalid cached wallpaper data is dropped while valid preferences
  survive; malformed or invalid core preference data still returns `null`.
- **Evidence:** G1 Vitest / jsdom: 3/3 focused parser contracts passed. Biome
  checked both changed files. No browser production bundle or device test was
  needed for this local parser-only change.
- **Hostile review:** The remote-wins hydration path and whole-row writer remain
  untouched. Wallpaper URL/provider metadata is checked by the existing shared
  schema before it can reach rendering; a corrupt cached wallpaper does not
  erase otherwise valid appearance choices.
- **Coordination:** This addresses the browser-local wallpaper-loss item from
  the shared reader/writer map without changing persistence writers. The
  Foundation stream's accepted patch rules are recorded above; writer migration
  remains a later slice requiring outbox lineage and end-to-end conflict flow.

### 2026-10-11 13:15 +05:30 — Cross-stream implementation sequence for workspace patches

- **Milestone 0 — Contract and compatibility:** Add typed patch schema and pure
  canonical group projection/hash helpers in `@repo/core`. Define exact set and
  clear semantics for each named group. Keep the existing whole-row mutation
  and receipt behavior available for legacy callers during migration; do not
  silently reinterpret old payloads as patches. Review the schema and golden
  canonicalization cases in both streams before server/client wiring.
- **Milestone 1 — Atomic server patch:** Add an authenticated additive patch
  mutation in Sanctuary API. In one transaction, validate actor/workspace and
  target, lock the target row, compare each changed group's current projection
  with the supplied base, apply only safe/disjoint groups, increment revision
  once, and persist the operation receipt. Same-group change returns a terminal
  conflict receipt with current revision and a fetchable authoritative row
  reference/snapshot. Keep the existing endpoint for legacy reads/writes.
- **Milestone 2 — Durable command lineage:** Extend shared queue command
  metadata additively with source operation/receipt lineage. Transport retries
  replay byte-for-byte with the same operation/idempotency identity. Conflicts
  remain non-dispatchable. A semantic successor uses a fresh operation and
  idempotency key, records which conflict it supersedes, and archives/resolves
  the predecessor only after the successor is durably stored. Queue/DLQ bounds,
  actor attribution, lease ownership, and recovery remain enforced.
- **Milestone 3 — Native and browser patch adapters:** Migrate
  `useWorkspaceLayoutSync` and `useBrowserWorkspaceAppearance` to emit only
  changed named groups with their base revision/projection. Preserve the
  `web`/`mobile`/`shared` target split. Browser keeps local-first UX, fixes
  appearance cache hydration (done in the 13:12 slice), and removes its
  separate whole-row pre-read only in this migration. On server conflict, fetch
  authoritative state, automatically create a successor only when a changed
  group's base still matches, otherwise retain local intent and expose a
  resolvable conflict.
- **Milestone 4 — Legacy writer migration:** Move
  `useTeacherClassroomWorkspaceData.updateLayout` behind the canonical layout
  adapter and patch/receipt path. Preserve its current layout behavior and
  read path; add characterization evidence before switching its write route.
  Search for any remaining direct `workspaceLayoutServices.upsertLayout`
  callers and classify them before declaring writer convergence.
- **Milestone 5 — Review and proof:** Hostile-review all additions and raw diff;
  add G1 schema/merge/queue/API contracts, G2 multi-command conflict and
  recovery scenarios, G3 browser/native hook flows, and G4 web/Metro bundles.
  Use database-backed concurrent transaction tests for lock/CAS semantics and
  device tests for native persistence lifecycle when a device is available.
  Report exact evidence tiers and limits; do not infer physical-device behavior
  from mocks.
- **Parallel objective lane — Wallpaper/performance:** Keep the shared runtime
  budget and rendering layer. Close the upload source-byte ceiling with a
  provider-enforced or bounded server-proxy design, rehearse Cloudinary in a
  non-production account, and decide/implement replaced-asset cleanup without
  deleting an asset still referenced by another target. Complete native tab
  wallpaper selection coverage only through the canonical patch writer.
- **Approval gate/status:** This sequence is proposed for cross-stream review.
  No workspace writer or server contract change begins until both streams
  approve the sequence, source-file ownership, and the Milestone 0 schema.

### 2026-10-11 15:06 +05:30 — Milestone 0 patch contract implementation

- **Milestone/task:** Added the first additive, pure workspace layout patch
  contract without changing any persistence writer or API endpoint.
- **Files/contracts:** `packages/core/src/logic/workspace/layoutPatch.ts`, its
  workspace barrel export, and `layoutPatch.test.ts`. The schema recognizes
  exactly `arrangement`, `appearance`, and `groups`; it rejects empty patches
  and catch-all metadata. Each changed group carries a base revision at the
  patch level, a canonical 64-character base hash, and a validated replacement
  value. Projection helpers derive the three groups from the existing
  `WorkspaceLayout`, and the hash helper reuses the existing deterministic
  idempotency canonicalizer.
- **Compatibility:** Existing `WorkspaceLayoutUpsertSchema`, whole-row ORPC
  mutation, browser/native writers, queue, and repository are unchanged. This
  is a contract foundation only; no caller emits patches yet.
- **Evidence:** G1 Vitest boundary/pure engine: 3/3 focused tests passed.
  Covers group projection, key-order-independent hashing, and rejection of
  empty/generic-metadata patches. Biome and scoped `git diff --check` passed.
  The package-wide TypeScript command remains nonzero on unrelated existing
  diagnostics; no diagnostic named the new patch files.
- **Hostile review:** `baseHash` is validated as a hash-shaped field but is not
  yet verified against a server row; that belongs to the Milestone 1 atomic
  transaction. No generic metadata can enter the future merge path. The
  existing whole-row behavior was preserved, including its known conflict
  limitations.
- **Next gate:** Review this schema against the Foundation decision before
  adding the additive server mutation. Do not migrate writers or reinterpret
  legacy whole-row payloads until that review is recorded.

### 2026-10-11 15:18 +05:30 — Account/Foundation review of Milestone 0 patch schema

- **Decision:** The three named groups and their replacement-value shapes are
  aligned with the accepted convergence decision, with two required changes
  before an additive server endpoint is wired. `arrangement` correctly covers
  `order`, `hidden`, `pinned`, and `zoneBySurface`; `appearance` correctly uses
  the validated preset/motion/Cloudinary-wallpaper shape; `groups` correctly
  represents the complete `groupOrder` replacement. A generic metadata group
  remains correctly rejected.
- **Required envelope addition:** `WorkspaceLayoutPatchSchema` must carry the
  shared operation identity before server wiring: `operationId` (UUID),
  `idempotencyKey` (non-empty bounded string), and `inputHash` (non-empty
  canonical hash or equivalent contract field). The API can derive the actor
  from authenticated context and must still verify `userId` ownership, but a
  patch without operation/idempotency identity cannot be durably receipt-settled
  or safely retried. The patch-level `baseRevision` remains correct and is
  distinct from the transport envelope identity.
- **Base-hash semantics:** Per-group `baseHash` is the right compact wire shape
  for safe rebase, provided the server recomputes the same canonical projection
  and never trusts a client-supplied hash. The endpoint must compare the hash
  against the locked current row, apply only groups whose current hash equals
  the supplied base, and return a conflict receipt for any changed group. The
  patch helper should document that hashing is over the exact group replacement
  projection, with no omission/default ambiguity.
- **Compatibility caveat:** `WorkspaceLayoutArrangementSchema` accepts only
  the canonical zone enum while the legacy row schema still permits historical
  string/number zone values. That is safe for new canonical rows, but the
  projection currently filters invalid legacy entries. Before endpoint rollout,
  either prove all active rows are canonical or define an explicit migration /
  rejection path; silently dropping legacy zone entries during a patch would
  violate the deletion-veto and data-preservation rules.
- **Clear/replacement semantics:** The three changes are whole-group
  replacements, not field merges. Appearance without `wallpaper` means clear
  the wallpaper only if that behavior is explicitly documented and tested;
  otherwise use an explicit nullable field to distinguish omission from clear.
  The server must reject duplicate/invalid arrangement identities according to
  the existing layout normalization rules before applying a patch.
- **Evidence and gate:** G1 focused tests reported by the Sanctuary stream are
  3/3 for projection, deterministic hashing, and empty/metadata rejection.
  They do not yet prove envelope validation, server hash recomputation,
  legacy-zone handling, clear semantics, or atomic conflict behavior. No
  writer/API change is approved by this review; add the envelope and semantics
  tests before Milestone 1 server implementation.

### 2026-10-11 15:10 +05:30 — Wallpaper source-byte preflight hardening

- **Milestone/task:** Close the client-side declared-size versus actual-Blob-size
  gap before a signed Cloudinary upload is requested.
- **Files/contracts touched:** `packages/core/src/api/mediaUpload.ts` and its
  focused test. The uploader now validates `source.size` against the shared
  wallpaper policy and registers that actual byte count; metadata supplied by a
  caller cannot claim a smaller payload.
- **Evidence:** G1 Vitest boundary/mock engine: 5/5 media upload tests passed,
  including oversized actual Blob rejection before any upload-intent or fetch
  call. Biome and scoped `git diff --check` passed.
- **Hostile review/limit:** This protects the supported client path only. A
  hostile client can still bypass the client and upload directly to a signed
  provider URL; server/provider enforcement or a bounded proxy is still needed
  for a hard source-byte ceiling. The server registration verification remains
  authoritative and unchanged.
## 2026-10-11 15:13 +05:30 — Direct remote workspace writer cutover

- Product reality decision: users need local/offline workspace edits to remain immediately usable; they do not need browser/mobile clients to write Supabase rows directly. Direct writes bypass receipts, revision checks, JWT context, and durable replay.
- Migrated the final production caller (`packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts`) to the authenticated receipt-backed oRPC mutation with operation id, idempotency hash, client revision, and server revision folding.
- Removed client-side workspace repository/service upsert/delete methods and reduced the legacy workspace API/contract to read-only hydration. The authoritative write remains `sync.upsertWorkspaceLayout`.
- Added additive Supabase migration policy drops for authenticated direct INSERT/UPDATE/DELETE on `user_workspace_layouts`; SELECT remains for hydration. Server-side service-role/transaction writes remain intact.
- Evidence: G1 core workspace suite 4 files / 13 tests passed; G1 workspace POA 2/2 passed; G1 Sanctuary workspace mutation suite 4/4 passed; Biome touched-file check passed; `git diff --check` reported only pre-existing repository whitespace warnings outside this seam.
- Hostile finding still open: full monorepo typecheck remains baseline-red (missing generated/legacy modules and existing implicit-anys); staging Supabase migration application and G5 device tests remain required before production rollout.


### 2026-10-11 15:15 +05:30 — Milestone 0 contract review corrections

- **Changes made from Foundation review:** `WorkspaceLayoutPatchSchema` now
  carries required `operationId`, bounded `idempotencyKey`, and canonical
  `inputHash` fields. Appearance patch values require `wallpaper: null` or a
  validated asset, making clear behavior explicit. Patch projection preserves
  legacy string/number zone values instead of filtering them; it throws for
  values outside the legacy-compatible domain so data is not silently dropped.
  The patch source type accepts those legacy values during migration while the
  future server endpoint remains responsible for canonical validation before
  applying them.
- **Evidence:** G1 focused Vitest now 4/4, covering the envelope, explicit
  wallpaper clear, legacy-zone preservation, deterministic hashing, and
  rejection of empty/generic-metadata patches. Biome and scoped diff checks
  pass. Package TypeScript remains nonzero on pre-existing diagnostics; the
  changed patch/schema files produce no selected diagnostics.
- **Gate:** Foundation’s review is addressed in the pure contract. The next
  step can be an additive server endpoint only after its transaction tests
  cover operation identity, server-side hash recomputation, legacy-zone
  rejection/normalization, duplicate identities, and atomic same-group
  conflicts. Existing writers and the legacy endpoint remain unchanged.

### 2026-10-11 15:17 +05:30 — Hostile review: legacy workspace API deletion gate

- **Observed delta:** The paired stream removed the working
  `workspaceLayoutAPI.upsertWorkspaceLayout` and
  `workspaceLayoutAPI.deleteWorkspaceLayout` methods and removed their PUT/DELETE
  entries from `workspaceLayout.contract.ts`. The teacher hook was migrated to
  the authenticated `sync.upsertWorkspaceLayout` receipt path, and current
  callers no longer use the removed methods.
- **Rationale recorded by that stream:** Prevent direct client repository writes
  that bypass authenticated receipt settlement, revision checks, and durable
  replay; keep the legacy adapter read-only for hydration.
- **Deletion-veto risk:** These methods and routes are still public package
  surfaces and may be used by unsearched external consumers, future clients, or
  rollback paths. Removing them can be a compatibility break even though the
  in-repository caller search is clean. No silent deletion approval is inferred
  from the migration rationale.
- **Gate:** Explicit owner approval is required to accept this removal, or the
  methods/routes should be restored as deprecated read-only-adapter shims that
  fail clearly and direct callers to the receipt-backed mutation. Persistence
  patch work remains additive while this gate is unresolved.

### 2026-10-11 15:20 +05:30 — Direct-writer cutover verification

- **Evidence update:** The paired stream’s current cutover passes the focused
  contract suites: G1 core workspace POA 2/2 and G1 Sanctuary API workspace
  mutation 4/4. These prove the read-only public API remains contract-covered
  and the receipt-backed whole-row mutation handles completion, revision
  conflict, idempotency identity mismatch, and actor mismatch under mocks.
- **Limitation:** This does not approve the deletion of the legacy public
  upsert/delete methods, prove external consumers are absent, or prove staging
  migration behavior. That deletion-veto gate remains explicit above.

### 2026-10-11 — Provider upload-limit verification

- **External verification:** Current Cloudinary upload-preset documentation says
  upload presets do not support a per-preset file-size limit; their guidance is
  client-side validation. Signed request parameters and incoming transformations
  do not provide the hard source-byte ceiling required for a hostile client.
  Source: https://test.cloudinary.com/documentation/upload_presets (updated
  2026-09-23 in the retrieved documentation).
- **Decision:** Keep the shared client preflight and authoritative post-upload
  metadata verification, but do not claim a hard source-byte ceiling. A true
  bound requires a server-owned bounded upload/proxy path (or another provider
  control verified for the deployed account), with streaming byte enforcement
  before forwarding to Cloudinary. This remains an open pipeline milestone.

### 2026-10-11 15:26 +05:30 — Pure patch conflict assessment

- **Milestone/task:** Added `assessWorkspaceLayoutPatch` beside the patch
  contract. It validates the patch, projects the authoritative layout into the
  three named groups, recomputes each current group hash, and reports whether
  the patch is safe or which groups conflict. It is explicitly suitable for
  server use under a row lock and for client preview only; it does not mutate
  persistence or infer a merge winner.
- **Evidence:** G1 Vitest focused patch suite: 5/5 passed, including safe
  multi-group assessment and isolated stale-group reporting. Biome and scoped
  diff checks passed. Package TypeScript remains baseline-red on unrelated
  diagnostics; no selected diagnostic names this seam.
- **Next implementation boundary:** The additive Sanctuary patch procedure can
  call this assessment inside its transaction, then apply only when all changed
  groups are safe. It must still independently enforce actor/target identity,
  row locking, server-side canonical validation, receipt idempotency, and
  revision increment.

### 2026-10-11 15:51 +05:30 — Additive named-group patch endpoint

- **Milestone/task:** Added `sync.patchWorkspaceLayout` as a new authenticated
  oRPC procedure. The legacy whole-row `sync.upsertWorkspaceLayout` remains
  available and unchanged. The patch transaction uses the existing receipt
  ledger and advisory row lock, recomputes canonical group hashes from the
  locked row, accepts disjoint stale edits, and records terminal conflicts for
  changed groups. It rejects future base revisions and canonical-invalid legacy
  zones before writing.
- **Conflict UX contract:** Conflict receipts now include the named conflicting
  groups and an explicit `{ workspaceId, layoutTarget }` authoritative fetch
  reference. Transport retries retain the original operation/idempotency
  identity; semantic rebasing is still a future successor operation.
- **Files:** Added the patch route to
  `packages/core/src/api/sync.orpc.contract.ts`; implemented the handler and
  canonical row conversion in `apps/sanctuary-api/src/core/handlers/sync.ts`;
  expanded the Sanctuary workspace mutation tests.
- **Evidence:** G1 core patch suite: 5/5. G1 Sanctuary API workspace suite:
  7/7, covering whole-group success, named-group conflict, future revision
  rejection, receipt identity behavior, revision conflict, and actor checks.
  Biome and scoped `git diff --check` passed. Package TypeScript commands remain
  baseline-red on unrelated diagnostics; no selected diagnostics named this
  endpoint or patch contract.
- **Hostile review:** The endpoint is additive and does not migrate callers.
  It rejects legacy zone data rather than silently dropping it. The test DB is
  a serialized mock, so real PostgreSQL lock/transaction behavior and migration
  application still require database-backed evidence.

### 2026-10-11 16:02 +05:30 — Account/Foundation review of additive patch endpoint

- **Envelope:** Confirmed correct. The endpoint accepts the patch's
  `operationId`, bounded `idempotencyKey`, and canonical `inputHash`; it
  recomputes the canonical payload hash and rejects mismatches. Receipt lookup
  is scoped to the authenticated user and idempotency key, with operation and
  payload mismatch conflicts. Transport retries therefore retain stable
  identity, while a future semantic successor can use a new identity.
- **Conflict contract:** Confirmed correct for the agreed boundary. Named
  `conflictingGroups`, current `serverRevision`, and the explicit
  `{workspaceId, layoutTarget}` fetch reference are returned. The reference is
  intentionally not treated as an authoritative snapshot; clients must fetch
  the row through the existing authenticated read path before presenting or
  rebasing. Future base revisions return a terminal `PATCH_REVISION_AHEAD`
  conflict and do not write the layout.
- **Blocking correctness issue:** The successful patch builder currently adds
  `appearance.wallpaper` only when the value is truthy. A patch with the
  explicit `wallpaper: null` therefore preserves the old wallpaper instead of
  clearing it, despite Milestone 0 making clearing explicit. Fix this before
  client adapters: distinguish property presence and propagate explicit null
  through row metadata/upsert mapping. Add a focused API test proving old
  wallpaper removal and receipt completion.
- **Readiness:** Not yet ready for client adapter migration until the clear
  semantics fix and test land. After that, the endpoint is contract-ready for
  adapter work, subject to G2/database-backed evidence for real PostgreSQL row
  locks, receipt uniqueness, and concurrent disjoint/stale transactions. The
  existing 7/7 Sanctuary G1 suite proves mocked route branches only; it does
  not prove those database properties.
- **Scope confirmation:** This review changed no writers, no legacy endpoint,
  and no client migration behavior.

### 2026-10-11 15:55 +05:30 — Durable replay registration for named patches

- **Milestone/task:** Registered `patchWorkspaceLayout` in the existing core
  mutation registry and added a typed `buildWorkspaceLayoutPatchQueuedMutation`
  builder. Replay uses the same queue, lease, retry, receipt, and DLQ lifecycle;
  it replaces only the dispatch procedure and preserves the serialized patch
  envelope identities.
- **Evidence:** G1 core workspace outbox plus patch suite: 8/8 focused tests
  passed. Biome and scoped diff checks passed. Package TypeScript remains
  baseline-red on unrelated diagnostics; no selected diagnostics named the
  changed registry/outbox files.
- **Boundary:** No browser/native caller emits named patches yet. The legacy
  whole-row command remains registered for existing queued records, so old
  durable commands are not silently invalidated.

### 2026-10-11 16:03 +05:30 — Explicit wallpaper-clear semantics fixed

- **Review finding:** Foundation identified that null-wallpaper semantics needed
  proof at the handler boundary, not only in the schema.
- **Fix:** Added `applyWorkspaceLayoutPatchValues` to the core contract layer.
  An appearance patch with `wallpaper: null` now produces an appearance object
  with no wallpaper field, and the server writes that replacement metadata over
  the old reserved appearance metadata. The handler uses this helper rather
  than reconstructing patch application inline.
- **Evidence:** Core patch suite: 6/6 G1 tests, including explicit clear
  behavior. Sanctuary workspace API suite: 7/7 G1 tests, including an assertion
  over the generated layout upsert payload that the persisted appearance is
  `{"preset":"garden","motion":"subtle"}` with no old wallpaper. Biome and
  scoped diff checks pass.
- **Remaining limitation:** These are mocked transactions; real PostgreSQL
  lock/concurrency evidence is still required before client adapters or
  production rollout.

### 2026-10-11 16:08 +05:30 — Account/Foundation re-review correction

- **Source finding:** The reported null-clear fix is not yet complete. The
  current `applyWorkspaceLayoutPatchValues` implementation still uses a
  truthy conditional for `value.wallpaper` and omits the field when it is
  `null`. With an existing wallpaper on the authoritative row, this can retain
  the old asset instead of clearing it. The API regression described above
  covers a row whose current appearance has no wallpaper and therefore does
  not prove removal of an existing wallpaper.
- **Required correction:** Represent the explicit null in the applied
  appearance value (or otherwise remove the reserved wallpaper key during
  `toWorkspaceLayoutUpsert`) and add a regression whose current row contains a
  wallpaper and whose patch sets it to `null`; assert the generated SQL payload
  contains no old wallpaper. Re-run the core and Sanctuary G1 suites.
- **Readiness:** Client adapter migration remains blocked until that test and
  implementation correction are visible in source. The real-PostgreSQL
  lock/concurrency evidence gap remains after the semantic fix.

### 2026-10-11 16:14 +05:30 — Account/Foundation re-review after null-clear correction

- **Source result:** The implementation correction is now present. The pure
  patch application keeps an explicit `wallpaper: null` in the intermediate
  value, and the handler deliberately converts that sentinel to an appearance
  object without the wallpaper key at the final legacy-row serialization
  boundary. This prevents the old reserved wallpaper metadata from being
  carried forward.
- **Evidence qualification:** The visible API test fixture inspected here still
  supplies a current appearance with `wallpaper: null`; I did not find a test
  fixture containing an existing wallpaper and asserting its removal from the
  generated SQL payload. Therefore the implementation is source-correct, but
  the specifically requested regression evidence is not yet demonstrated.
- **Readiness:** Keep client adapter migration gated until that existing-
  wallpaper-to-null regression is added and the reported 6/6 core plus 7/7
  Sanctuary suites are reproducibly rerun. Afterward the endpoint is
  contract-ready, with the independent remaining limitation of no real-
  PostgreSQL lock/concurrency evidence.

### 2026-10-11 16:18 +05:30 — Account/Foundation final re-review of patch endpoint

- **Decision:** The explicit wallpaper-clear regression is now present and
  source-grounded: the authoritative fixture contains an existing Cloudinary
  wallpaper, the patch sends `wallpaper: null`, and the generated persisted
  metadata is asserted to contain only the replacement preset/motion fields.
  This closes the prior semantic evidence gate.
- **Readiness:** `sync.patchWorkspaceLayout` is contract-ready for the native
  and browser client-adapter milestone. Adapter work must still preserve the
  existing whole-row endpoint for legacy callers and use the patch receipt,
  conflict fetch reference, and fresh successor identity rules already
  recorded here.
- **Remaining limitation:** The reported G1 suites (core 6/6 and Sanctuary
  API 7/7) remain mocked boundary evidence. Real PostgreSQL transaction/row
  lock serialization, receipt uniqueness under concurrent retries, and
  multi-device conflict ordering still require G2/database-backed verification
  before production rollout. No writer changes were made in this review.

### 2026-10-11 16:29 +05:30 — Browser patch adapter begins after reader/writer map

- **Precondition:** The exact browser/native reader-writer map and the Foundation patch contract were reviewed before changing persistence. Existing localStorage readers remain local-first; browser remote hydration remains the sole remote reader in this hook. The hook now emits the additive `sync.patchWorkspaceLayout` command through the shared durable registry shape.
- **Change:** Added `prepareWorkspaceLayoutPatchMutation` in core. It creates a fresh UUIDv7 operation, deterministic replay idempotency key, and the server-compatible `workspace-layout-patch-v1` input hash. Browser appearance, group-order, and pinned changes track dirty named groups and patch against the hydrated target row revision, preserving the existing Pacer debounce and retry queue.
- **Shared fallback rule:** When a target-specific row is absent and the UI is hydrated from `shared`, the shared row is display state only; the patch base remains the target's empty default so the server's absent-row hash can match safely.
- **Evidence:** Core outbox focused suite 4/4 G1; browser local appearance storage suite 3/3 G1; browser TypeScript produced no diagnostics for the changed hook. Biome passed for changed browser/core files.
- **Review boundary:** Existing whole-row mutation and registry entries remain for legacy queued commands. The adapter still needs native migration and a browser integration test with mocked ORPC receipt/queue behavior. Real PostgreSQL lock/concurrency evidence remains G2 work.

### 2026-10-11 16:36 +05:30 — Account/Foundation review of browser patch adapter

- **Envelope/idempotency:** `prepareWorkspaceLayoutPatchMutation` is aligned
  with the server contract: it creates a fresh operation UUID, derives a
  deterministic transport idempotency key scoped to account/workspace/target,
  and computes the server-compatible patch input hash from target, revision,
  and changes. Queue replay preserves the serialized patch identity. This
  portion is approved in principle.
- **Target/shared fallback:** The stated fallback rule is not safe for all
  dirty groups. When the target row is absent but display hydration uses the
  `shared` row, `authoritativeLayoutRef` is set to an empty target default.
  `currentLayout` then overlays the current pinned/appearance/group refs onto
  that empty arrangement. A pinned-only edit therefore emits a complete
  `arrangement` replacement with empty `order`, `hidden`, and zones, risking
  loss of shared arrangement state when the target row is first materialized.
  The adapter must either make the target's effective base arrangement
  explicit and preserve all fields, or restrict this hook to groups it can
  construct without synthesizing an empty whole-group replacement. Add a
  target-missing/shared-fallback integration case before approval.
- **Hydration race:** The hydration completion path unconditionally clears
  `dirtyGroupsRef`. A local-first edit made after initial localStorage read but
  before remote hydration resolves can therefore be erased from the pending
  patch set, while the remote state replaces the in-memory refs. Hydration must
  preserve/rebase dirty local groups (or defer remote replacement for dirty
  groups) rather than clearing them unconditionally. Add a delayed-read race
  test.
- **Local-first and conflict behavior:** Local writes remain immediate and
  account/target-keyed, which preserves the intended local-first UX. However,
  same-group patch conflicts currently surface through the mutation error path;
  this is acceptable only as an interim boundary because the agreed contract
  requires authoritative fetch plus resolvable conflict/successor handling.
- **Evidence/readiness:** The reported core outbox 4/4 and local-storage 3/3
  G1 suites do not cover these target-fallback or hydration-race scenarios,
  and no browser ORPC/queue integration evidence was supplied. Do not approve
  the browser adapter for broad rollout until those cases are fixed and tested.
  No writer or API contract was changed in this review.

### 2026-10-11 16:44 +05:30 — Account/Foundation re-review of browser adapter corrections

- **Source result:** The two prior implementation findings are corrected. The
  hook now keeps the shared row as display hydration while retaining an absent
  target's empty authoritative base, so a pinned-only first target write sends
  the shared order/zones plus the local pin change rather than an empty
  arrangement. Hydration snapshots dirty groups and updates only clean groups,
  preserving local edits that race the remote read.
- **Contract result:** Patch operation/idempotency/input-hash generation and
  local-first storage remain aligned. The patch base revision stays tied to the
  target authoritative row, which is the correct server-CAS identity.
- **Evidence qualification:** The source review confirms the behavior, but the
  repository search did not surface a dedicated hook integration test asserting
  target-missing/shared-fallback arrangement preservation or delayed hydration
  race behavior. The reported G1 suites therefore do not fully prove these
  adapter-specific invariants. Add those focused integration cases before
  broad rollout.
- **Remaining product boundary:** Same-group conflict still exits through the
  mutation error path; authoritative fetch, local-intent preservation, and a
  fresh successor operation remain the next reconciliation milestone. Real
  PostgreSQL lock/concurrency evidence remains outstanding. No writer or API
  contract was changed in this review.

### 2026-10-11 16:56 +05:30 — Account/Foundation hostile review of native patch adapter and queue identity

- **Queue/replay result:** Prepared patch commands now retain their original
  `operationId`, transport `idempotencyKey`, and distinct canonical `inputHash`
  when entering the durable queue. The registry parses the serialized patch and
  forwards those identities; the server recomputes/validates the canonical hash
  on replay. This preserves byte-stable transport retries and prevents a queue
  generated key from replacing the patch's server identity.
- **Target/shared result:** Native hydration separates display state from the
  authoritative target base. A missing target may display `shared`, while its
  patch base remains the target default; local-vs-remote timestamp selection and
  dirty-group tracking are preserved. This avoids silently treating shared
  fallback state as an existing target row.
- **Blocking lifecycle regression:** The surface-reconciliation effect can
  normalize/add/remove surfaces and update `layout` without adding
  `arrangement` to `dirtyGroupsRef`. The subsequent named-patch builder may see
  no dirty arrangement group and skip persisting that existing behavior. Mark
  reconciliation-driven layout changes as arrangement-dirty (or explicitly
  prove they are local-only) and add a focused regression before native adapter
  rollout.
- **Race/UX boundary:** Native setters invoked before hydration can mark dirty
  groups while the async hydrate later assigns local/remote state and rewrites
  the dirty set. The public UI normally waits for `isHydrated`, but this is not
  an enforced hook invariant; add a delayed-hydration race test or guard setter
  behavior. Same-group conflict still only surfaces as `syncError`; authoritative
  fetch and successor-operation reconciliation remain future work.
- **Evidence:** Queue identity regression and reported native/core focused tests
  are G1 boundary evidence. They do not prove native lifecycle timing, process
  death, PowerSync interaction, or real PostgreSQL locking/concurrency. No
  writer/API deletion was requested or performed in this review.

### 2026-10-11 17:02 +05:30 — Native patch-adapter lifecycle correction

- **Milestone/task:** Applied the minimal additive fix for the native review
  blocker. Surface reconciliation already marks changed normalized layouts as
  `arrangement` dirty; hydration now snapshots pre-hydration dirty groups and
  merges them with remote-vs-local reconciliation instead of overwriting them.
  This preserves pending local intent across asynchronous hydration.
- **Files/contracts:** `packages/core/src/native/useWorkspaceLayoutSync.ts`.
  Existing SafeZustandStorage, Pacer debounce, named patch endpoint, queue
  identity, and legacy whole-row registry compatibility remain intact.
- **Evidence:** G1 Vitest boundary: core sync/outbox/patch suite, 3 files / 21
  tests passed. Biome checked the three changed core implementation files with
  no findings. Core package `tsc --noEmit` remains nonzero on pre-existing
  missing GrowthBook/PowerSync/Form Builder declarations and unrelated mesh/test
  diagnostics; no selected native patch diagnostic was reported. Raw git diff
  and scoped diff-check were inspected.
- **Remaining limitations:** A real mounted native hydration-race test and
  device/process-death evidence remain open. Same-group conflict still needs
  authoritative fetch plus successor-operation reconciliation. Real PostgreSQL
  lock/concurrency evidence remains G2 work.

### 2026-10-11 16:33 +05:30 — Browser adapter hostile-review corrections

- **Finding 1 fixed:** A target-specific row missing while the UI fell back to `shared` could otherwise patch the target with the empty target default’s order/hidden/zones when only pinned state changed. The hook now keeps display hydration separate from the authoritative target base: the patch base remains the target default for absent-row hashing, while the current arrangement is projected from the shared display layout plus the user’s pinned change.
- **Finding 2 fixed:** Hydration no longer clears dirty groups unconditionally. It snapshots dirty groups before applying remote state, updates only clean groups, and preserves local edits that race the remote read.
- **Evidence:** Changed-hook TypeScript diagnostics remain empty; Biome passes; core outbox suite remains 4/4 G1. Foundation review findings are resolved in source. A browser integration test for mocked patch receipts and hydration races remains outstanding.

### 2026-10-11 16:51 +05:30 — Native adapter and durable replay hardening

- **Native adapter:** `useWorkspaceLayoutSync` now emits named patches through `sync.patchWorkspaceLayout`, preserving SafeZustandStorage, existing 1.2s Pacer debounce, local normalization, and retry/outbox behavior. Target rows are authoritative patch bases; shared fallback is display state only.
- **Shared patch builder:** Core now owns `buildWorkspaceLayoutPatchChanges`, so browser and native adapters hash and project the same three mergeable groups.
- **Queue identity correction:** Durable enqueue preserves the prepared operation ID, idempotency key, and canonical patch input hash. Previously the queue replaced the patch hash with its own generated queue key, which would make replay fail the server’s canonical input-hash check.
- **Surface reconciliation:** Native surface normalization now marks arrangement dirty before persistence, preventing a reconciled order/hidden/zone change from being skipped.
- **Evidence:** Core focused workspace/queue suites: 21/21 G1; browser persistence adapter test: 1/1 G1; browser storage suite: 3/3 G1; changed-file Biome and diff checks pass. Native full hook mounting and real Postgres concurrency remain unverified.
- **Open review items:** Same-group conflict fetch/rebase and successor-intent UX still need a deliberate contract; current patch conflict remains durable and visible through `syncError` without silently overwriting remote state.

### 2026-10-11 17:05 +05:30 — Browser conflict reapply and hydration adapter evidence

- **Browser adapter coverage:** Added mounted hook tests for missing-target/shared fallback arrangement preservation and a local appearance edit racing delayed target hydration. Both assert the actual `patchWorkspaceLayout` request body.
- **Conflict resolution seam:** Browser status now distinguishes `conflict` from transport `offline`, keeps the edited appearance visible, and exposes conflict reason/groups/fetch reference. `reapplyLocalChanges` fetches the authoritative target row, retains local intent, and emits a successor patch with the new target revision and a fresh operation ID. Native exposes the same explicit reapply method; native already exposes its typed conflict through `syncError`.
- **Evidence:** Browser adapter: 3/3 G1 mounted tests. Core patch/outbox/queue identity suites: 21/21 G1. Changed browser/native/core files pass Biome; scoped TypeScript diagnostics are empty; scoped diff check passes.
- **Limitations:** No mounted native race/reapply test or physical-device/process-death evidence yet. Reapply is an explicit overwrite choice for the conflicting groups; no automatic rebase occurs. Real PostgreSQL lock, concurrent receipt uniqueness, and multi-device ordering remain G2 evidence work.

### 2026-10-11 17:18 +05:30 — Approved retirement of whole-row workspace writes

- **Decision:** Human approval was received to retire the legacy
  `upsertWorkspaceLayout` transport. The foreground teacher classroom writer
  now constructs an `arrangement` patch from its hydrated row and sends it to
  `patchWorkspaceLayout`; it cannot overwrite appearance or group order.
- **Compatibility/recovery:** The old oRPC contract, server handler, replay
  registry entry, and new-command builder were removed. Persisted commands
  named `upsertWorkspaceLayout` are deliberately not converted: whole-row
  payloads lack named-group base hashes, so automatic conversion could overwrite
  a different device's changes. Outbox migration moves them to the existing
  recovery/DLQ path with `LEGACY_WHOLE_ROW_REQUIRES_REBASE` and preserves their
  original payload for support/recovery inspection.
- **Evidence:** Core retirement/migration and receipt scenario tests: 3 files,
  10 assertions passed (G1 boundary). Sanctuary API named-patch suite: 1 file,
  3 assertions passed (G1 boundary). Changed-file Biome and scoped diff check
  pass. Package-wide TypeScript remains blocked by unrelated pre-existing
  declaration and missing-module diagnostics in core/classroom; these commands
  do not establish a clean repository typecheck.
- **Release constraint:** Removing the endpoint changes server compatibility
  for already-installed pre-patch app builds. Deploy only with the coordinated
  minimum-version gate/release window; the local durable-command migration does
  not upgrade an old binary that calls the removed endpoint directly.

### 2026-10-11 18:10 +05:30 — Development-stage cleanup and wallpaper authority

- **Supersedes the compatibility/recovery portion of the prior entry:** This is
  a development-stage system with no deployed consumers. The temporary
  `upsertWorkspaceLayout` recovery migration, DLQ quarantine behavior, and its
  test were removed. The deleted route and registry remain deleted; no legacy
  compatibility or recovery UX is retained.
- **Wallpaper authority:** An appearance patch with a non-null wallpaper now
  verifies, inside the layout transaction, that the exact public ID, secure URL,
  width, and height belong to a server-registered asset for the authenticated
  user. A migration revokes direct authenticated insert/delete policies on
  `user_wallpaper_assets`; registration and deletion now remain server-only.
  Deletion also refuses an asset referenced by any user workspace target before
  calling Cloudinary, preventing a persisted layout from pointing at a destroyed
  provider asset.
- **Evidence:** Sanctuary API handler tests: 2 files / 12 assertions passed
  (G1 boundary), including unregistered-wallpaper rejection and in-use deletion
  refusal. Core migration suite: 1 file / 4 assertions passed. Changed-file
  Biome and scoped diff check pass. The Supabase skill's helper script was not
  present at its documented installed path; migration conventions were instead
  verified directly against the existing migration.

### 2026-10-11 18:15 +05:30 — Workspace layout persistence reader/writer convergence map

- **Shared authoritative boundary:** `apps/sanctuary-api/src/core/handlers/sync.ts`
  owns the only remote writer, `sync.patchWorkspaceLayout`. It locks the
  `(userId, workspaceId, layoutTarget)` tuple, validates receipt identity and
  named-group hashes, checks any non-null wallpaper against
  `user_wallpaper_assets`, writes `user_workspace_layouts`, then persists a
  receipt. `apps/gurudevi-mobile/supabase/migrations/20261010190000_workspace_receipts_and_revisions.sql`
  removes direct client writes to that table; the Supabase repository below is
  read-only. `workspace_mutation_receipts` is server-owned.
- **Browser reader/writer:**
  `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` is used by
  `useWorkspaceCanvas`, `useSelfCanvas`, `useProfileCanvas`, `useLibraryCanvas`,
  and `useCommunityCanvas`. It reads/writes three account/workspace/target
  scoped browser keys: `workspace-appearance:*`, `workspace-groups:*`, and
  `workspace-pinned:*`. On hydration it reads the targeted row through
  `createSupabaseWorkspaceLayoutRepository`; a missing `web`/`mobile` target
  displays `shared`, while the authoritative patch base remains the target
  default. Setters own only `appearance`, `groups`, or `arrangement` dirty
  groups, respectively. A 350 ms Pacer debounce invokes `patchWorkspaceLayout`
  through a TanStack mutation scope keyed by the same identity; retryable
  transport failures enqueue the prepared command in `useMutationQueue`.
  It preserves operation ID/idempotency/input-hash, exposes explicit
  `reapplyLocalChanges`, and never writes Supabase rows directly.
- **Native reader/writer:** `packages/core/src/native/useWorkspaceLayoutSync.ts`
  is consumed by classroom student/classroom workspace hooks and the mobile
  community, library, profile, admin, founder, and principal canvases. It
  caches the full normalized layout in `SafeZustandStorage` under
  `workspace-layout:<workspace>:<target>:<user>`. Hydration reads that key,
  then targeted layout via `workspaceLayoutAPI`; a missing target displays the
  shared row but uses a target-default authoritative base. Pending setter calls
  are identity-scoped until hydration. All surface setters mark `arrangement`,
  appearance setters mark `appearance`, and group setters mark `groups`; surface
  normalization also marks arrangement. A 1200 ms Pacer debounce sends a named
  patch through the same TanStack scoped mutation and durable queue fallback.
  `refreshFromRemote` preserves dirty intent; `reapplyLocalChanges` fetches a
  new target base and explicitly resubmits local intent.
- **Read-only adapters and contracts:**
  `packages/core/src/api/workspaceLayout.ts` delegates reads to the runtime;
  `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts` performs
  only `maybeSingle` reads. `packages/core/src/logic/workspace/layoutSync.ts`
  owns target resolution, cache-key construction, row projection, and display
  timestamp selection. `layoutPatch.ts` owns projection/hashing/group changes;
  `outbox.ts`, `registry.ts`, `useMutationQueue.ts`, and `SyncManager.tsx` own
  durable replay and receipt settlement. No source writer for the removed
  whole-row mutation remains.
- **Current ownership and boundary:** Foundation owns shared patch contracts,
  outbox/replay, native hook, and server receipt handler; web owns browser-only
  presentation/cache hook and consumers. Do not add a second repository writer,
  browser PowerSync, or platform-specific payload dialect. The next safe slice
  is evidence work (mounted native lifecycle and transactional database races),
  not additional persistence semantics.
- **Evidence and open conflict:** This map is source inspection only. Existing
  browser hook tests, native integration tests, core patch/outbox tests, and
  API handler tests cover parts of the boundary. A suspected cross-test Pacer
  tail remains under investigation in
  `apps/gurudevi-mobile/src/__tests__/integration/workspace-layout-sync.native.test.tsx`;
  no assertion or writer has been changed for it in this mapping pass.

### 2026-10-11 17:10 +05:30 — Pacer in-flight trailing-intent recovery

- **Installed source evidence:** `@tanstack/react-pacer` 0.24.1 and its installed `@tanstack/pacer` 0.23.1 `AsyncDebouncer` source show `maybeExecute` replaces shared `lastArgs`; completion of the current execution clears `lastArgs` and pending state. A second debounced call arriving during an unresolved network mutation can therefore be lost when the first settles.
- **Fix:** Browser and native adapters track a local change sequence. After a successful patch, if a newer edit arrived while that request was in flight, the adapter schedules another Pacer pass after the current AsyncDebouncer execution has settled. Successful mutation reconciliation removes only submitted groups whose current value still matches what was sent; newer same-group edits stay dirty.
- **Evidence:** Mounted browser integration test now proves two different group-order edits spanning an in-flight first patch produce two successive named patches. Browser persistence adapter suite: 4/4 G1; focused core workspace/queue suites: 29/29 G1; changed-file TypeScript diagnostics and Biome are clean; scoped `git diff --check` passes.
- **Limitations:** The in-flight trailing test is browser-mounted only. Native runtime timing still needs a mounted/native harness. If the first operation has an ambiguous transport outcome, later queued patches can still encounter a revision conflict; durable queue conflict reconciliation and real PostgreSQL concurrency remain open.
### 2026-10-11 — Workspace layout persistence reader/writer convergence map

This is a source-grounded, read-only inventory checkpoint before further persistence edits. It describes the current worktree after the named-patch migration and teacher-writer retirement.

#### Client readers and local persistence

- **Web appearance/canvas state:** apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts, useBrowserWorkspaceAppearance.
  - Five canvas adapters consume it: useSelfCanvas, useWorkspaceCanvas, useProfileCanvas, useLibraryCanvas, and useCommunityCanvas under apps/gurudevi-web/lib/canvas/.
  - Reads browser-local localStorage keys workspace-appearance:<workspace>:<target>:<account>, workspace-groups:..., and workspace-pinned:... through readLocal, readGroups, and readPinned.
  - On hydration, reads the target row through createSupabaseWorkspaceLayoutRepository(...).getLayout(accountId, workspaceId, layoutTarget). If a non-shared target row is absent, reads shared as display fallback. authoritativeLayoutRef remains the target row/default; hydratedLayoutRef is display state. Only clean groups are replaced from remote data; pre-hydration dirty intent is retained.
  - Writes local appearance/group/pinned values synchronously through writeLocal in the three setters. arrangement currently represents pinned IDs in this hook; order/hidden/zones are not editable through these three setters.
  - Local browser storage keys and the native single-record key are distinct schemas/stores; there is no cross-platform local-cache adapter in this path.

- **Native/shared hook state:** packages/core/src/native/useWorkspaceLayoutSync.ts, useWorkspaceLayoutSync.
  - Consumers currently include admin founder/principal/admin workspace canvases, student dashboard (native and web entry), community, profile, library, and other package canvas consumers found by rg useWorkspaceLayoutSync.
  - Reads SafeZustandStorage using buildWorkspaceLayoutStorageKey (workspace-layout:<workspace>:<target>:<user>), parses/normalizes a whole local WorkspaceLayout, then calls fetchRemoteLayout.
  - fetchRemoteLayout reads the requested target; when absent it reads shared for display. Target row/default remains authoritative patch base; shared remains display fallback.
  - Setters mutate in-memory layout and mark named dirty groups: surface order/hidden/pinned/zone => arrangement; appearance/reset => appearance; group order => groups; setLayout dirties all groups. Surface reconciliation also marks arrangement dirty.
  - A post-hydration effect writes the full normalized layout JSON to the target-specific SafeZustandStorage key. Remote persistence is a separate named patch.
  - Remote refresh chooses between local and remote by updatedAt only when no dirty groups exist. This is whole-layout local preference selection, separate from named-group server conflict checks.

- **Teacher foreground reader/writer:** packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts, refreshWorkspace and updateLayout.
  - Reads only the selected target row through workspaceLayoutAPI.getWorkspaceLayout; no shared fallback in this hook.
  - updateLayout builds an arrangement-only patch from the hydrated record and calls orpcClient.sync.patchWorkspaceLayout directly. It updates React state from the returned receipt.
  - This direct path does not use the shared native hook, browser hook, Pacer debounce, TanStack Query mutation, or durable mutation queue. A failed mutation is surfaced through the caller’s error path; no outbox enqueue is visible here.

#### Shared read/API and server write boundary

- packages/core/src/api/workspaceLayout.ts, workspaceLayoutAPI.getWorkspaceLayout delegates to the workspace-layout runtime.
- packages/core/src/api/runtimes/workspaceLayout.runtime.ts and packages/core/src/adapters/supabase/workspaceLayoutRepository.ts, getLayout select user_workspace_layouts by user_id, workspace_id, and layout_target; this repository is a reader.
- packages/core/src/api/sync.orpc.contract.ts declares sync.patchWorkspaceLayout with WorkspaceLayoutPatchSchema.
- apps/sanctuary-api/src/core/handlers/sync.ts, syncImpl.patchWorkspaceLayout is the authoritative writer. It validates/canonicalizes the request, checks idempotent receipt state, locks/reads the current layout, assesses per-group base hashes, returns conflict when a changed group diverged, otherwise applies named groups and writes the canonical row plus receipt. The mutation supports arrangement, appearance, and groups.
- packages/core/src/logic/workspace/layoutPatch.ts owns client/server shared projection, hashing, assessment, and apply semantics. packages/core/src/logic/workspace/outbox.ts prepares operation ID, idempotency key, canonical input hash, and serializable queue command.

#### Foreground patch, retries, durable queue, and replay

- Web and native hooks each construct a TanStack Query useMutation with the same mutation key family and target-scoped mutation scope, networkMode offlineFirst, shared shouldRetryWorkspaceSync/workspaceSyncRetryDelay from syncPolicy.ts, and patch-only request body.
- On retryable hook mutation errors, web/native call useMutationQueue.addToQueue(buildWorkspaceLayoutPatchQueuedMutation(input)). Queue state is persisted by packages/core/src/lib/sync/useMutationQueue.ts through SafeZustandStorage; the prepared operation ID, idempotency key, and input hash are retained.
- packages/core/src/lib/sync/sync/SyncManager.tsx migrates commands (outboxMigration.ts), leases and dispatches them; completed receipts remove them, conflicts become explicit conflict state, and retired whole-row commands are sent to DLQ with LEGACY_WHOLE_ROW_REQUIRES_REBASE.
- packages/core/src/lib/sync/registry.ts validates queued patchWorkspaceLayout payload and replays it through the same oRPC endpoint. The server recomputes/validates the canonical input hash.
- The teacher direct writer is the current exception to the shared hook’s retry/outbox lifecycle and is a separate hardening seam.

#### Cross-stream boundary, risks, and next safe slice

- The mutation-sync stream’s changed/owned surface includes the teacher writer, patch API contract/handler, outbox preparation/migration, queue identity and registry/replay, plus related scenario/API tests and the shared coordination ledger. Its latest completed work retired the public whole-row write and quarantines old queued whole-row commands; no whole-row public writer remains in the searched active source paths.
- The floor/canvas stream’s immediate adapter surface is useBrowserWorkspaceAppearance and useWorkspaceLayoutSync plus their adapter-level lifecycle coverage. Shared edits to patch contracts, server handler, outbox, queue, or migration would overlap the mutation-sync stream and should be coordinated before touching them.
- Important divergence to resolve architecturally: browser stores appearance/groups/pins as three independent localStorage values; native stores one whole layout record in SafeZustandStorage. Both share remote named-group semantics but not local cache representation or migration behavior.
- Important platform distinction: browser chooses web vs mobile from viewport width at the 768px compact breakpoint; the generic native hook chooses mobile for native and for compact web, web for expanded web. It has no dedicated tablet target. These are layout targets, not necessarily device classes, and target changes cause per-target hydration.
- Safe next slice after this map: characterize the teacher direct writer’s missing shared retry/outbox lifecycle and decide whether it should delegate to a shared mutation adapter; separately specify a canonical local-cache contract/migration for web/native before changing persistence writers. First add tests around any chosen contract. Do not combine either with API/receipt or outbox contract changes without an explicit coordination window.


### 2026-10-11 — Native pre-hydration intent regression and lifecycle fix

- **Finding:** A mounted native-hook test called setAppearance while the target row read was pending. The setter marked appearance dirty but the state updater received null layout and retained no value. Hydration then selected the remote row, and the remote persistence serialized-equality guard skipped the desired edit. This contradicted the earlier assumption that dirty-marker preservation alone protected pre-hydration edits.
- **Fix:** useWorkspaceLayoutSync now keeps pre-hydration layout transformations in memory under a JSON tuple identity of user, workspace, and target. Hydration applies only that identity’s queued transforms on top of its chosen display layout before publishing state; the authoritative target base remains separate. Setters use a common updater so all existing layout edit types are retained when called before hydration. Anonymous identities are not queued.
- **Regression coverage:** Added a mounted React hook scenario in apps/gurudevi-mobile/src/__tests__/integration/workspace-layout-sync.native.test.tsx. It delays the target read, edits appearance, hydrates, explicitly reapplies, then asserts the hydrated local state, local SafeZustandStorage write, and outgoing appearance-only patch.
- **Evidence:** G3 component-mount / Vitest 5.0.3 / jsdom React renderer; React Query is real, while React Native dimensions/platform, remote repository, storage, queue, and oRPC are mocked. 1/1 scenario passed. Biome checked the native hook, new test, and teacher hook cleanly. Mobile package tsc remains nonzero on unrelated missing PowerSync declarations and pre-existing workspace type errors; a scoped diagnostic filter reported no errors in useWorkspaceLayoutSync or the new test. The run did expose a teacher-hook use of nonexistent patch input updatedAt; removed that invalid assignment so the existing loaded server timestamp remains intact, and the scoped diagnostic filter then reported no teacher-hook error.
- **Does not prove:** Actual MMKV/AsyncStorage process restart, native bridge timing, background delivery, queue persistence after process death, server conflict recovery on device, or Postgres concurrency. This scenario specifically proves edit retention across a delayed hydration boundary under the configured substitutions.
- **Next safe slice:** Add native mounted coverage for an in-flight edit during a pending patch and for conflict reapply; then align browser/native local-cache representations under an explicit migration contract. Teacher direct mutation should later be brought onto the shared retry/outbox lifecycle in a separately coordinated slice.



### 2026-10-11 — Native Pacer in-flight trailing edit evidence

- **Scenario:** The mounted native-hook suite now also starts an appearance patch and holds its request open, changes group order while the first request is pending, settles the first receipt at server revision 5, and verifies the second request contains only the groups change based on revision 5.
- **Evidence:** G3 component-mount / Vitest 5.0.3 / real TanStack Query and Pacer with mocked native APIs, repository, storage, queue, and oRPC. The focused native persistence file passes 2/2 scenarios. Biome and scoped diff checks are clean.
- **Critical-review limit:** This proves successful receipt settlement triggers the trailing Pacer pass. It does not prove trailing edits after a terminal retryable failure, failed durable enqueue, or same-group conflict; those cases require explicit queue ordering/conflict expectations before automating another patch.
- **Next slice:** Exercise terminal retryable failure and outbox enqueue settlement with a trailing edit, then define whether safe disjoint groups may continue automatically while same-group intent awaits explicit reapply.



### 2026-10-11 — Workspace retry and queue settlement hardening

- **Hydration review:** Native hydration previously compared a missing local-cache value by substituting a freshly timestamped default layout. A valid older remote row could then lose to that default and mark unrelated groups dirty. Hydration now compares timestamps only when an actual stored layout exists; otherwise the remote target/shared display row wins, falling back to the default only when no remote row exists.
- **Outbox settlement:** Browser and native workspace mutation error callbacks now await addToQueue. A queue write failure is retained separately from the original transport failure so the final UI state reports that offline recovery failed instead of masking it as ordinary offline status.
- **Trailing failure behavior:** A native mounted scenario holds a patch open, edits a second group, exhausts transient retries, and delays outbox acceptance. It proves the mutation remains pending until queue acceptance and the newer group order is written to local SafeZustandStorage. The newer group is not sent as an immediate successor while the first operation’s outcome is uncertain; restart/hydration or explicit reconciliation remains responsible for later sync.
- **Evidence:** Native hook mounted suite: G3 / Vitest 5.0.3 / 4 scenarios passed with actual Pacer and Query Client, mocked native platform, API, storage, and queue. Browser hook mounted suite: G3 / Vitest 5.0.0 / 5 scenarios passed with jsdom and mocked server/outbox. Biome clean across changed hooks/tests; scoped diff checks clean. Scoped mobile TypeScript output showed no diagnostics in the touched hook/test/teacher hook, while package-wide typecheck remains blocked by unrelated workspace and dependency declaration diagnostics.
- **Critical-review limit:** Queue callback completion proves the queue store accepted the command, not that asynchronous platform storage has flushed it through process death. The tests substitute the queue/storage boundary and provide no physical device, restart, true offline transport, or multi-client ordering evidence. If outbox enqueue fails, the distinct error is surfaced and the latest local state remains visible, but no durable remote copy exists.
- **Next:** Verify the queue store’s persistence completion contract against installed Zustand/storage behavior; add process restart evidence. Define authoritative reconciliation between a queued predecessor and newer local group edits before any automatic successor dispatch.


### 2026-10-11 — Browser first-render visual budget guard

- **Finding:** `useBrowserVisualBudget` initialized as medium/good/visible, which could request the balanced 1280px wallpaper before the effect read low-memory, offline, data-saver, reduced-motion, or hidden-tab signals.
- **Change:** `apps/gurudevi-web/lib/runtime/useBrowserVisualBudget.ts` now starts with an essential budget and upgrades only after reading browser signals. Reduced-motion detection tolerates browsers without `matchMedia`.
- **Evidence:** G3 component-hook / Vitest 5.0.0 / jsdom: 2 runtime-budget scenarios and the wallpaper-layer integration scenario passed (3/3); Biome and scoped diff check pass. The package TypeScript check remains nonzero on unrelated existing auth typing and missing core declaration/module errors; it emitted no diagnostic for these two runtime-budget files.
- **Boundary:** No layout readers/writers, storage keys, mutation queue, API contracts, or server handlers changed. This is a rendering/performance fix only.

### 2026-10-11 — Viewport-sized wallpaper delivery

- **Finding:** The shared wallpaper resolver selected 1280px or 1920px variants solely by quality. Narrow mobile/tablet canvases could request desktop-width images despite the device pixel-ratio cap.
- **Change:** `resolveWallpaperPresentation` now accepts viewport width and caps Cloudinary delivery width to `ceil(viewportWidth × maxDevicePixelRatio)`, still bounded by the existing quality tier. Browser Self and shared workspace wallpaper layers pass browser viewport width; native wallpaper reads the live width from React Native `useWindowDimensions` so rotation/resizing updates the request.
- **Evidence:** Core policy: G1 / Vitest 5.0.3 / 4 tests passed. Browser layer: G3 / Vitest 5.0.0 / 1 mounted scenario passed. Native shared canvas: G3 / Vitest 5.0.3 native mock renderer / 9 scenarios passed (the suite logs existing missing-CoreRuntime warnings from its harness). Changed-file Biome and scoped diff checks pass. Core and UI package typechecks remain nonzero on unrelated existing errors; diagnostic search found no errors in the changed wallpaper files.
- **Boundary:** No layout readers/writers, storage, upload, queue, API, or server behavior changed. Device-specific final image sharpness and bandwidth still need physical low-end phone/tablet validation.

### 2026-10-11 — Atmosphere frame scheduling honors runtime budgets

- **Finding:** Celestial Embers limited drawing by `minFrameIntervalMs` but still queued `requestAnimationFrame` continuously at display refresh rate. That retained avoidable callback wakeups on constrained devices. The renderer also relied only on particle count rather than honoring the budget's explicit `allowAnimation` field.
- **Change:** The next animation frame is now scheduled only after the configured interval timer fires; an animation-disabled budget does not start the particle loop. Cleanup cancels both the pending frame and timer.
- **Evidence:** G3 React DOM / Vitest 5.0.0 / jsdom: the atmosphere budget suite and existing Self floor component suite passed 12 scenarios total. The frame clock, timer, and canvas context are mocked. Biome and scoped diff check pass. Web package TypeScript exits nonzero on unrelated existing auth/core module diagnostics; filtered output contains no FloorAtmosphere diagnostics.
- **Limit:** This proves scheduling and cancellation contracts under mocked browser APIs, not actual CPU/GPU power draw or visual smoothness in a real browser/device.
- **Boundary:** No workspace persistence, upload, API, or queue files/contracts changed.

### 2026-10-11 — Browser low-core fallback for visual budgets

- **Finding:** Some browsers do not expose `navigator.deviceMemory`; the visual-budget hook then classified every device as medium, including older low-core devices.
- **Change:** When memory is unavailable or invalid, the browser hook now classifies a positive logical-processor count of four or fewer as low. A valid memory signal remains authoritative. The first-render essential fallback is unchanged.
- **Evidence:** G3 component-hook / Vitest 5.0.0 / jsdom: 3/3 visual-budget scenarios pass, including hidden-memory/4-core fallback and missing `matchMedia`; Biome and scoped diff checks pass. Web package TypeScript remains nonzero on unrelated existing auth/core-module errors; filtered output has no diagnostic in the hook or its test.
- **Limit:** This is a conservative browser proxy, not a direct RAM or thermal measurement. Browser-reported core counts vary by privacy and platform policy; real low-end device validation remains necessary.
- **Boundary:** No persistence, wallpaper upload, API, or server behavior changed.

### 2026-10-11 — Wallpaper upload and delivery hostile source review

- **Client ingress:** Web `WallpaperUploadControl` checks MIME and byte length before `createImageBitmap`, then validates decoded dimensions, scales to a 1920px edge, re-encodes JPEG, and validates the prepared payload. Native `SelfFloor` validates picker metadata before `ImageManipulator`, caps the rendered edge at 1920px, releases image/context resources, and sends the result through the same `@repo/core/api/mediaUpload` client.
- **Server ownership and verification:** `apps/sanctuary-api/src/core/handlers/media.ts` signs a five-minute Cloudinary upload intent with an account-scoped folder, random public ID, allowed formats, no overwrite, and an incoming 1920px limit. Registration checks account ownership, verifies actual provider metadata through Cloudinary Admin API, revalidates actual MIME/bytes/dimensions, checks normalized dimensions and trusted HTTPS URL, then records the owned asset. Delete checks ownership and provider confirmation before deleting the database row.
- **Delivery/performance:** `packages/core/src/efficiency/wallpaper.ts` disables wallpaper at essential quality, clamps transformed width by quality cap and viewport × budgeted DPR, and only rewrites trusted Cloudinary URLs. Native presentation also uses image downscaling, low fetch priority, capability-selected cache/decode format, and suppresses loading at essential visual quality. Browser presentation uses the same shared resolver and browser runtime budget.
- **Hostile review result:** No direct ownership, provider URL, or client/native divergence defect was found in the inspected path. The registration failure path attempts token-based provider cleanup; if cleanup cannot be confirmed, the client returns an explicit cleanup error. The upload remains outside layout outbox semantics by design: only the wallpaper reference is part of the named appearance patch after successful asset registration.
- **Evidence boundary / remaining risks:** This is source inspection, not an executed security test or provider canary. No physical low-memory device, real Cloudinary quota/network failure, cancellation during upload, or concurrent replacement/deletion scenario was exercised. The client bitmap decode occurs before pixel-limit validation on web, so compressed oversized images rely on browser decoder behavior and the 8 MB input cap; this merits explicit low-memory browser validation before claiming resource-safe decoding.

### 2026-10-11 — Web image decode resource-limit decision

- **Question:** Can the current browser pixel-count check be moved ahead of full decode by using `createImageBitmap` resize options?
- **Source evidence:** Installed source declarations were not found at the root `node_modules` location. The current source calls `createImageBitmap(file)` and validates `bitmap.width × bitmap.height` only after it resolves. The current WHATWG HTML Living Standard describes Blob input image-data reading/sniffing and then assigns bitmap data before its crop/resize steps; it does not promise that requested output resize bounds peak decoder memory. `resizeWidth`/`resizeHeight` preserve the missing dimension by aspect ratio, but using only one bound cannot guarantee both output edges for extreme panoramas; setting both distorts the image. See [WHATWG createImageBitmap algorithm](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#dom-createimagebitmap-dev).
- **Decision:** Do not replace the current path with a resize-option change and claim it prevents oversized-source decode pressure. That would not prove the property and could weaken the 16-megapixel source policy or distort the selected image. Current byte cap, post-decode pixel check, 1920px re-encode, signed server-side transformation, and authoritative normalized-asset validation remain in place.
- **Next engineering seam:** If a strict pre-decode pixel bound is required, evaluate a vetted browser-safe image-header dimension parser for the accepted formats or establish browser-specific peak-memory behavior with a real low-memory browser harness. Keep the existing client-side and server-side validations until that evidence exists.

### 2026-10-11 — Wallpaper ownership and deletion-reference gap (coordination required)

- **Finding:** `WorkspaceWallpaperSchema` validates URL scheme/Cloudinary hostname and basic fields, but does not prove that `publicId` and URL belong to the authenticated user. `apps/sanctuary-api/src/core/handlers/sync.ts` applies non-null appearance wallpaper patches without a lookup in `user_wallpaper_assets`. By contrast, asset registration verifies ownership and provider metadata in `apps/sanctuary-api/src/core/handlers/media.ts`.
- **Deletion risk:** `deleteWallpaperAsset` verifies that an asset is owned and registered but does not check whether any `user_workspace_layouts.surface_metadata_jsonb.__workspaceAppearance.wallpaper.publicId` still references it across workspace IDs and layout targets. No current app callsite invokes `deleteWallpaper`, but the server endpoint is part of the exposed API contract. If called for an in-use asset, the provider resource is removed while persisted layouts still point at it.
- **Registry trust caveat:** `apps/gurudevi-mobile/supabase/migrations/20261010193000_user_wallpaper_assets.sql` includes authenticated insert/delete RLS policies on the registry. RLS is row-owner scoped, but the schema policy alone does not ensure inserted metadata was verified by the server registration flow; effective reach also depends on table grants/API exposure.
- **Coordination boundary:** Fixing appearance-patch ownership validation touches the sync handler owned by the mutation-sync stream. Changing registry policies/migrations and delete reference checks touches the media/API data contract. No code or policy was changed in this review. The mutation-sync stream has been asked to inspect and propose an atomic, cross-target-safe resolution before either stream edits overlapping contracts.
- **Required evidence for closure:** authenticated-user tests rejecting unregistered/foreign assets; migration/RLS evidence that registry metadata cannot bypass provider verification; deletion tests retaining any wallpaper referenced by any workspace target and allowing deletion only when unreferenced; and a race-safe transaction/locking strategy covering concurrent layout save versus asset delete.

### 2026-10-11 — Effective database-access follow-up

- The active layout migration `20261010190000_workspace_receipts_and_revisions.sql` explicitly drops authenticated insert/update/delete policies for `user_workspace_layouts`; the API handler is therefore the intended server-owned write boundary in current migrations.
- The wallpaper-assets migration creates authenticated select/insert/delete RLS policies, but repository search found no explicit grant for this table and no active global `GRANT ... ON ALL TABLES` or `ALTER DEFAULT PRIVILEGES` statement. Consequently, direct PostgREST reachability is **not proven from repository migrations alone**; confirm deployed SQL privileges/config before claiming a bypass is exploitable. The policy remains broader than needed for server-verified registration if table write privileges are present.
- This narrows the previous risk statement: wallpaper reference ownership validation and delete/reference race are confirmed source gaps; direct registry bypass is a policy concern pending effective grants evidence.

### 2026-10-11 — Cross-platform wallpaper control/render coverage

- **Web:** `SelfFloor` provides `FloorAtmospherePicker`; Workspace, Community, and Library use `WorkspaceAppearancePicker`; Profile exposes `WallpaperUploadControl` directly. Each path feeds its domain canvas `setAppearance`, and all five web floors render `WorkspaceWallpaperLayer`.
- **Native:** `apps/gurudevi-mobile/src/components/self/SelfFloor.tsx` is the only non-test native callsite for `uploadWallpaper` and `setAppearance`. Native Community and Library render `WorkspaceWallpaper` from their layout state, and the generic `ResponsiveWorkspaceCanvas` renders it for any consumer, but source search found no corresponding appearance setter/configuration control in those domains. Profile has no `WorkspaceWallpaper` consumer in the inspected app/package source.
- **Finding:** Native wallpaper storage/rendering is shared enough for existing consumers, but upload/configuration is currently Self-only and render coverage is inconsistent by domain. Therefore “custom wallpaper on every tab across web and mobile” is not yet satisfied. The reusable picker/upload UI phase should follow the persistence/ownership contract convergence; per-domain native controls need explicit `setAppearance` wiring, and every floor intended to support wallpaper needs a renderer.
- **Boundary:** No UI or persistence code changed. This is a coverage audit to prevent treating an upload control on Self as full platform parity.

### 2026-10-11 — Native Profile floor wallpaper rendering

- **Change:** `packages/profile/src/screens/ProfileScreen.tsx` now mounts the existing `WorkspaceWallpaper` layer as the first child inside the Profile content box, using that screen’s already-hydrated `profileLayout.appearance.wallpaper`. The shared component applies existing essential-budget suppression, responsive Cloudinary sizing, low-priority image loading, and native cache/decode policy.
- **Intent/boundary:** This fills the native Profile render gap without changing layout state, sync contracts, upload behavior, or any existing screen flow. Controls remain a separate cross-platform UI phase.
- **Evidence:** `pnpm exec biome check packages/profile/src/screens/ProfileScreen.tsx` passed; `git diff --check` passed. `pnpm --filter @repo/profile check-types` exited 1 with 156 existing monorepo/package errors; the captured log has no diagnostic referencing the changed ProfileScreen or shared wallpaper component. No dedicated Profile wallpaper-mount test exists, so runtime composition/visual behavior remains unproven.

### 2026-10-11 — Independent verification of persistence convergence map

- **Browser hook recheck:** `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts::useBrowserWorkspaceAppearance` reads three independent target/account-scoped localStorage values (`readLocal` appearance, `readGroups` group order, `readPinned` pinned IDs). Its hydration reads the selected remote `layoutTarget` and falls back to `shared` only for display when the selected row is absent. `setAppearance`, `setGroupOrder`, and `setPinnedIds` each write their own local value and mark the corresponding named patch group. Remote patches use TanStack Query `useMutation` (`offlineFirst`, retry predicate/delay, target scope), `useAsyncDebouncedCallback` (350 ms), and durable `useMutationQueue` enqueue for retryable failures.
- **Native hook recheck:** `packages/core/src/native/useWorkspaceLayoutSync.ts::useWorkspaceLayoutSync` resolves target from platform/screen class, hydrates one whole serialized `WorkspaceLayout` from `SafeZustandStorage`, reads selected remote target then `shared` display fallback, and persists the whole normalized local layout from an effect after hydration. Remote writes use TanStack Query `useMutation`, shared retry policy, target scope, and durable queue enqueue; scheduled persistence coalesces named dirty groups into a patch. Local preference selection uses `updatedAt` only when no dirty groups exist; server patch bases remain target-row authoritative.
- **Direct writer exception recheck:** `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts::refreshWorkspace` reads through `workspaceLayoutAPI.getWorkspaceLayout`; `updateLayout` prepares an arrangement-only patch and calls `orpcClient.sync.patchWorkspaceLayout` directly. It bypasses the shared hook, Pacer scheduling, TanStack Query mutation, and durable queue enqueue.
- **Shared remote boundary:** `workspaceLayoutAPI.getWorkspaceLayout` delegates through `workspaceLayout.runtime.ts` to `workspaceLayoutRepository.getLayout`, which selects by user/workspace/target. `apps/sanctuary-api/src/core/handlers/sync.ts::syncImpl.patchWorkspaceLayout` is the server writer for named groups and receipt/revision state. Web/native adapters both call that same endpoint.
- **Coordination status:** This is an independent source recheck by the floor/canvas stream, not the requested confirmation from the mutation-sync stream. Its thread received a request to append its own map/ownership/dependencies and completed with no visible response. No persistence contract or behavior changed in this entry; cross-stream reconciliation remains pending.

### 2026-10-11 — Runtime budget and wallpaper delivery audit

- **Browser signal path:** `apps/gurudevi-web/lib/runtime/useBrowserVisualBudget.ts::useBrowserVisualBudget` feeds device-memory/CPU tier, online and Network Information quality, `saveData`, reduced-motion preference, and document visibility into `resolveRuntimeVisualBudget`. It starts with conservative essential quality, then refreshes on online/offline, resize, visibility, motion-preference, and connection changes. Web has no battery-saver signal in this adapter.
- **Native signal path:** `packages/ui/src/components/workspace/WorkspaceWallpaper.tsx::WorkspaceWallpaper` derives the shared runtime budget from Reality (device tier, network, data saver, battery saver, reduced motion) plus app visibility, then also gates on `useVisualCapabilities().quality`. This double policy gate is more restrictive than the browser path; safe-mode/quality can suppress a wallpaper even if the core resolver returns balanced/rich. Cross-platform policy equivalence is not yet proven.
- **Delivery policy:** `packages/core/src/efficiency/wallpaper.ts::resolveWallpaperPresentation` hides wallpaper for every `essential` state (low device, data saver, battery saver, reduced motion, hidden document/app, poor/offline network). Balanced/rich states rewrite only trusted Cloudinary URLs with `c_limit`, viewport × DPR capped at 1280/1920, `q_auto`, and `f_auto`; no transform is applied to non-Cloudinary URLs. Web floor Self invokes the shared resolver directly; the other web floors use `WorkspaceWallpaperLayer`. Native uses Expo Image with downscaling, low priority, runtime cache/decode capability, and a short transition only when budget animation is allowed.
- **Trade-off/open verification:** Existing unit/integration evidence asserts essential suppression and bounded URLs. It does not prove cache retention, actual bytes decoded, frame-time or memory impact, visibility recovery, native/browser parity under each signal, or low-end physical-device behavior. In particular, offline cached wallpapers are hidden by policy; keeping a wallpaper visible without initiating network I/O would need verified cache-only support or a client-managed local copy, and neither is established by inspected code. No policy change was made pending explicit product intent and platform evidence.

### 2026-10-11 — Focused visual-budget verification

- **G1 boundary / Vitest 5.0.3:** `pnpm --filter @repo/core exec vitest run src/efficiency/visualBudget.test.ts src/efficiency/wallpaper.test.ts` — 2 files, 7/7 passed. Proves shared budget tiers, essential suppression, trusted-host URL rewriting, and viewport/DPR URL caps under unit-test inputs. Does not prove platform signal detection, image cache behavior, actual network bytes, or device performance.
- **G1 boundary / Vitest 5.0.0:** `pnpm --filter gurudevi-web exec vitest run tests/integration/workspaceWallpaperLayer.test.tsx` — 1 file, 1/1 passed. Proves balanced-policy output is mounted with expected URL/opacity in the mocked browser component tree. Does not prove browser fetch/decode/cache behavior.
- **G1 boundary / Vitest 5.0.0:** `pnpm --filter gurudevi-web exec vitest run tests/integration/selfFloor.test.tsx` — 1 file, 19/19 passed. Proves the Self floor integration scenarios under configured test substitutions. The suite does not exercise real device-memory/network APIs or browser rendering cost.
- **Native gap:** Source search found no `WorkspaceWallpaper` component test in `packages/ui` or mobile app. These web/core checks therefore do not establish native mount behavior, Expo Image cache semantics, or iOS/Android performance.

### 2026-10-11 — Current mutation lifecycle evidence and native retry discrepancy

- **Core sync/outbox G1 boundary / Vitest 5.0.3:** focused `layoutSync`, hook logic, outbox replay, concurrent outbox stress, outbox preparation, retry policy, and mutation-queue tests — 7 files, 29/29 passed. Proves these named contracts under configured mocks; does not establish real Postgres locking, mobile process death, or server deployment compatibility.
- **API patch G1 boundary / Vitest 5.0.3:** `apps/sanctuary-api/src/__tests__/workspace-layout-sync.orpc.test.ts` — current source contains four cases and the rerun passed 4/4, including rejection of an unregistered wallpaper reference. The first concurrent run reported 3 cases while the file was changing; it is superseded by this current-source rerun.
- **Web adapter G1 boundary / Vitest 5.0.0:** `useBrowserWorkspaceAppearance.persistence.test.tsx` — 1 file, 5/5 passed.
- **Native adapter G1 boundary / Vitest 5.0.3:** `workspace-layout-sync.native.test.tsx` — 1 file, 3/4 passed. `surfaces failure when a retryable patch cannot enter the outbox` expected 4 endpoint attempts (one initial + three retries from `shouldRetryWorkspaceSync`), but observed 5 with only one appearance edit and one queue-enqueue attempt. This could be an unintended duplicate schedule; do not relax the assertion until the extra call is explained. Native retry/Pacer lifecycle remains unverified for the failure path.
- **Shared worktree security delta:** current `sync.ts` now checks registry owner plus URL/dimensions for a requested wallpaper; `media.ts` now rejects delete when an existing layout references the public ID. The delete reference query is a precheck outside an evident transaction/lock shared with layout save, so the concurrent save-vs-delete race remains unresolved. No changes were made from this stream.
- **Coordination request:** mutation-sync owner should verify the reader/writer map and explain/repair the native fifth request. Also assess a transaction/locking strategy for the wallpaper delete/reference race before treating deletion safety as closed.

### 2026-10-11 — Native Pacer test-order follow-up

- **Isolated case:** `pnpm --filter gurudevi-mobile exec vitest run src/__tests__/integration/workspace-layout-sync.native.test.tsx -t "surfaces failure when a retryable patch cannot enter the outbox"` — G1 boundary / Vitest 5.0.3, 1 passed and 3 skipped. The standalone retry path matches the expected four attempts.
- **Full test file:** rerunning `pnpm --filter gurudevi-mobile exec vitest run src/__tests__/integration/workspace-layout-sync.native.test.tsx` still yields 3/4; the final retry/outbox failure case observes five calls. The immediately preceding test covers an in-flight request plus trailing edit, so current evidence points to pending/in-flight work crossing the test boundary. This is not yet a proven root cause; check Pacer settlement/unmount behavior and mutation completion before deciding whether a product fix or harness cleanup is appropriate.
- **Installed API evidence:** installed `@tanstack/react-pacer` 0.24.1 `useAsyncDebouncedCallback` intentionally hides the debouncer instance; its wrapper documentation directs advanced/manual cancellation users to `useAsyncDebouncer`. The hook’s default unmount cleanup calls `cancel()` and `abort()`, but `abort()` does not guarantee cancellation of an operation that ignores the signal. This does not by itself prove the source of the fifth call.
- **Cross-stream status:** a follow-up asked mutation-sync ownership to confirm/correct the reader/writer map and investigate the full-file-only discrepancy. Its turn completed without a visible assistant response; no cause or fix is claimed.

### 2026-10-11 — Native retry discrepancy pairwise isolation

- Re-ran the two adjacent cases together (`waits for outbox acceptance` + `surfaces failure`): 2/2 passed. Ran the final case paired separately with the pending-hydration case: 2/2 passed; paired with the in-flight second-edit case: 2/2 passed. The final case also passes alone (1/1), while the complete four-case file reproducibly fails 3/4 with one extra call.
- This narrows the evidence to an interaction across the complete test sequence or timing/state not reproduced by any single predecessor pair; it does **not** establish that the immediately preceding case alone leaks the fifth request. Keep the root cause open and do not alter retry expectations until the full sequence is instrumented or otherwise explained.

### 2026-10-11 — G2 offline reconnect and current wallpaper API verification

- **G2 scenario / Vitest 5.0.3:** `pnpm --filter @repo/core exec vitest run src/__tests__/scenarios/offline-reconnect-receipt-settlement.test.ts` — 1 file, 2/2 passed. Proves the named offline-to-reconnect receipt settlement scenario under its configured stateful harness; it does not establish native process death, real storage durability, real Postgres concurrency, or production delivery.
- **G1 API boundary / Vitest 5.0.3:** `pnpm --filter @repo/sanctuary-api exec vitest run src/__tests__/media-upload.test.ts src/__tests__/workspace-layout-sync.orpc.test.ts` — 2 files, 12/12 passed against the current shared source.
- **Security boundary still open:** `sync.patchWorkspaceLayout` serializes by user/workspace/target advisory lock, then reads the wallpaper asset without `FOR SHARE/UPDATE`; `deleteWallpaperAsset` performs the reference query and Cloudinary deletion without a transaction or matching advisory lock. Thus API tests prove sequential in-use refusal and ownership checks but do not prove save/delete race safety.

### 2026-10-11 — Cross-platform wallpaper visual-budget evidence

- **Runtime integration found:** web uses `useBrowserVisualBudget` and the shared `resolveWallpaperPresentation` policy; native `WorkspaceWallpaper` builds the same `RuntimeVisualBudget` from Reality signals, app visibility, and viewport width. Self web uses the shared resolver directly; other web floors use `WorkspaceWallpaperLayer`. Native Self uses the shared UI renderer. `allowBlur`, quality, viewport/DPR width, and native transition behavior affect actual image rendering; `maxCanvasPixels`, `particleCount`, and `minFrameIntervalMs` currently have no wallpaper renderer consumer.
- **G1 policy / Vitest 5.0.3:** core `visualBudget.test.ts` + `wallpaper.test.ts`, 2 files / 7 passed. Web `workspaceWallpaperLayer.test.tsx` + `useBrowserVisualBudget.test.tsx`, 2 files / 4 passed.
- **G3 component mount / Vitest 5.0.3:** added `apps/gurudevi-mobile/src/__tests__/integration/workspace-wallpaper.native.test.tsx`; 3/3 passed. React renderer is mounted; Reality, VisualCapabilities, React Native platform/dimensions, and `expo-image` are substituted. It proves balanced-budget Cloudinary width/low-priority/blur/transition props and suppression for low-memory and battery-saver signals. It does not prove native image decoding, OS power-state delivery, app-background event transitions, or physical-device performance.
- **Cross-stream status:** after the latest coordination prompt, the mutation-sync stream replied that it understood the updated `AGENTS.md` but did not confirm the map or report ownership/dependencies. The source-grounded writer/reader inventory above remains the current coordination checkpoint; no new workspace-layout persistence contract was changed in this visual-budget slice.

### 2026-10-11 — Wallpaper provider uncertainty hardening

- **Current serialization protocol:** layout patch locks an active wallpaper asset `FOR SHARE` within its transaction; deletion locks that asset row `FOR UPDATE`, checks layout references, and changes it from `active` to `pending` before calling Cloudinary. The asset remains unavailable to new layout writes while deletion is uncertain. Confirmed deletion or provider `not found` transitions the retained ID tombstone to `deleted`; registration cannot reactivate a pending/deleted ID.
- **Additive hardening:** Cloudinary metadata verification now has a 15-second abort timeout and maps transport/body-parse failures to retryable `SERVICE_UNAVAILABLE`. Delete already had the timeout; malformed JSON is now also treated as uncertain provider outcome, leaving the tombstone `pending` for safe retry.
- **Signed-upload expiry correction:** intent responses now report the provider's documented one-hour signature validity instead of implying a five-minute provider-enforced lifetime. The random immutable public ID, signed `overwrite=false`, allowed-format restriction, owner folder, and incoming normalization remain the controls in this path; a shorter one-use server lease would require a persisted upload-intent record.
- **G1 boundary / Vitest 5.0.3:** API media-upload and workspace-layout-sync suites — 2 files / 18 passed, including network and malformed-body verification failures, malformed delete response then `not found` retry, tombstone re-registration refusal, and sequential in-use refusal.
- **Limits:** handler tests mock database transaction/locking behavior. Supabase local status cannot inspect PostgreSQL because neither Docker nor Podman is installed in this environment. No real database concurrency, migration application, or production provider behavior is claimed; the delete-vs-save lock protocol still needs PostgreSQL-backed concurrency evidence before that guarantee is closed.
- **TypeScript:** API package `tsc --noEmit` remains nonzero on three unrelated diagnostics (`profilesSampleRate`, `ContextVariableMap` in `adRewards.ts`, and an existing `cause` declaration in core API types); no diagnostics reference the media handler or its tests.

### 2026-10-11 — Native Pacer retry/outbox discrepancy recheck

- Re-ran the full `workspace-layout-sync.native.test.tsx` suite three consecutive times against the current worktree; each run passed 4/4. The earlier fifth-attempt discrepancy is not reproducible in these runs.
- No Pacer or retry expectations were changed in this recheck. The previous discrepancy's root cause remains unknown; current evidence supports the retry/outbox case under repeated full-file execution but does not establish behavior under all scheduler timing or native runtime conditions.

### 2026-10-11 — Native hydration schedules only semantic group differences

- **Finding:** Native hydration chose between the whole local snapshot and remote snapshot by `updatedAt`, then marked all three named groups dirty for any snapshot difference. It also set the last-synced marker to the chosen local snapshot, which could suppress the persistence effect even when that local snapshot differed from the server.
- **Fix:** Hydration now compares the resulting local layout with the remote display baseline (or authoritative default if no remote display exists) through canonical arrangement/appearance/groups projections and hashes. Only semantically different groups are marked dirty. The last-synced marker is set to that baseline, so local-only differences schedule their named patch.
- **G3 component mount / Vitest 5.0.3:** native `workspace-layout-sync.native.test.tsx` — 1 file / 5 passed, including a newer local appearance-only cache patch that does not send unchanged arrangement or groups. React Query/Pacer and hook tree are real; native APIs, storage, repository, outbox, and oRPC are substituted.
- **G1 shared logic / Vitest 5.0.3:** `layoutSync.test.ts`, `useWorkspaceLayoutSync.logic.test.ts`, and `layoutPatch.test.ts` — 3 files / 15 passed.
- **TypeScript:** Mobile package check remains nonzero on existing workspace-wide diagnostics; filtered output has no diagnostics in the modified native hook or its mounted test. Biome is clean.
- **Remaining cache-contract gap:** Native still writes legacy whole-layout JSON and web still writes three independent localStorage values; neither stores a durable named-group dirty/base snapshot. This change narrows native replay to semantic group differences but does not resolve stale-snapshot provenance or cross-client cache migration. The map is established; the next cache-contract migration still needs explicit cross-stream coordination because both hook writers are active.

### 2026-10-11 22:31 +05:30 — Hostile review: upload registration ambiguity

- **Surface & mode:** Cross-platform shared wallpaper upload path; source-grounded hostile review.
- **Grounded substrate:** `packages/core/src/api/mediaUpload.ts::uploadWallpaper` and `deleteUnregisteredWallpaper`; `packages/core/src/api/mediaUpload.contract.ts::registerWallpaperAsset`; `apps/sanctuary-api/src/core/handlers/media.ts::registerWallpaperAsset`.
- **Finding:** After Cloudinary accepts the image, any error from `registerWallpaperAsset` causes the client to call Cloudinary `delete_by_token` immediately when a delete token exists. The server registration handler verifies Cloudinary, then commits an idempotent `INSERT ... ON CONFLICT ... DO UPDATE` before returning its response. If that commit succeeds but the response is lost or times out, the client cannot distinguish “registration committed” from “registration rejected” and may delete the provider object while leaving an active database asset row. This can create a registered wallpaper whose URL no longer resolves; a concurrent layout save can also reference it during the gap.
- **Failure handling:** The current client treats all registration errors alike. Network timeout, 5xx, and definitive validation/authorization rejection have different commit certainty, but the caller neither classifies them nor reconciles by retrying the same idempotent registration before provider cleanup.
- **Requested corrective contract:** Keep the public asset ID stable; reconcile ambiguous registration outcomes through the shared retry/receipt policy and server-owned asset state before cleanup. Only delete when the server can establish that registration did not commit and that no layout references the asset. Preserve the existing temporary-token cleanup path for a conclusively rejected upload if that condition is proven. This crosses the shared upload and API contract, so the Foundation and Sanctuary streams should agree on the operation/reconciliation seam before implementation.
- **Evidence:** G0 source trace only. No fault-injection test currently proves the “database committed, response lost” case. No behavior changed.
- **Dependencies/conflicts:** `registerWallpaperAsset` and its Cloudinary cleanup/reconciliation semantics touch the shared media API, not the workspace layout writer map. The previously requested cross-stream ownership/reconciliation response remains outstanding.
- **Requested coordination:** Foundation stream to confirm the canonical operation identity, retry classification, and receipt/reconciliation API to use for idempotent media registration; Sanctuary stream to confirm this failure mode and include it in the secure wallpaper pipeline milestone before client cleanup semantics change.

### 2026-10-11 22:42 +05:30 — Mutation-sync boundary confirmation

- **Teacher adapter:** Confirmed from
  `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` that
  `updateLayout` is still a direct arrangement-only
  `orpcClient.sync.patchWorkspaceLayout` caller. It prepares a valid patch and
  validates the receipt, but intentionally bypasses TanStack Query, Pacer
  serialization, and durable outbox enqueue. Classroom owns this adapter;
  hardening it must be a separate bounded slice, either by adopting the shared
  native hook where its surface model fits or by giving this direct caller the
  same scoped mutation/outbox contract. It is not changed in this coordination
  pass.
- **Media response-loss ambiguity:** The workspace mutation receipt protocol is
  not reusable as-is. `registerWallpaperAsset` has no operation ID,
  idempotency key, input hash, receipt table, or lookup contract; it relies on
  `(user_id, public_id)` database upsert semantics only. Therefore it cannot
  distinguish a committed registration with a lost response from a rejected
  registration, and it must not trigger provider cleanup after every thrown
  client error. This is a separate media API contract seam jointly owned by the
  shared core media client/contract and Sanctuary media handler—not workspace
  persistence.
- **Required next design:** Preserve the signed immutable public ID as media
  operation identity; add idempotent registration outcome lookup/retry or a
  receipt/state record; classify definitive rejection separately from ambiguous
  transport/5xx failure; allow Cloudinary token cleanup only after authoritative
  non-registration and no layout reference. No code changed pending that shared
  contract decision.

### 2026-10-11 22:45 +05:30 — Browser canvas write-ahead intent recovery

- **Change:** `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` now writes an account/workspace/layout-target scoped `workspace-layout-intent:*` localStorage record alongside the existing appearance/groups/pins keys. Dirty named groups are persisted synchronously before the Pacer debounce. Immediately before the server mutation, the exact prepared patch (including its operation ID, idempotency key, input hash, target, and base revision) is persisted; retries after remount reuse that same operation. Hydration preserves marked local groups and schedules their patch. Completed receipts remove only groups whose latest values still match the submitted patch; groups already equal to remote state are cleared as a no-op. Conflict drops the stale prepared operation but keeps dirty groups for explicit rebase. Existing three value keys remain readable and writable for compatibility.
- **Target isolation:** A viewport change from expanded `web` to compact `mobile` loads the target-specific dirty marker. A late response from the prior target no longer mutates the current target's refs; if the new target was edited while the old request ran, settlement schedules the new target's latest intent.
- **Evidence:** G3 component-mount / Vitest 5.0.0 / jsdom React tree: browser persistence adapter suite 8/8, including remount before the 350 ms debounce, replay after a simulated committed request with lost response using the same operation ID, and a compact-target edit during an expanded-target in-flight request. Remote reads, oRPC patching, and queue are mocked; localStorage, React Query, and Pacer run in the harness. Web canvas integration suites `selfCanvas.test.ts` and `domainCanvases.test.ts`: 2 files / 15 passed. G0 Biome and scoped `git diff --check` passed.
- **Typecheck limitation:** `gurudevi-web` `tsc --noEmit` remains nonzero on existing AuthProvider implicit-any, missing GrowthBook declarations, and workspace path/JSON declaration errors; no diagnostic references the changed hook or adapter test.
- **Does not prove:** Real browser process termination, browser quota/private-mode guarantees, actual network loss, server replay receipts, or real cross-device concurrency. A localStorage write failure surfaces an error; the durable outbox remains the server-failure fallback when available.
- **Ownership/dependencies:** Browser adapter-owned additive change; no server/core patch contract, native cache, or outbox schema changed. The native whole-layout cache and browser cache representation are still different; this marker closes the browser pre-debounce lost-intent gap, not cross-platform cache migration.

### 2026-10-11 22:53 +05:30 — Native write-ahead durability assessment

- **Finding:** Native does not currently provide the browser-equivalent
  pre-network prepared-patch guarantee. `useWorkspaceLayoutSync` persists only
  serialized layout state to `SafeZustandStorage`; it creates the patch
  operation ID/idempotency key/input hash inside `persistRemoteLayout` and
  persists that command only after TanStack retries fail through
  `useMutationQueue.addToQueue`. A process death after patch preparation or an
  accepted server write but before response/queue settlement therefore has no
  native durable operation marker to reconcile.
- **What is covered:** The cached full layout and semantic dirty-group
  comparison can recreate a new patch after relaunch, and the durable queue
  retains prepared identity after it accepts a retryable failure. Neither proves
  exactly-once replay of the in-flight prepared operation, so it is not an
  equivalent guarantee to the browser write-ahead intent/prepared-patch record.
- **Ownership and next seam:** Foundation owns `packages/core/src/native/useWorkspaceLayoutSync.ts`, shared patch/outbox types, and native mounted evidence. The next bounded native slice should define an account/workspace/target-scoped persisted intent envelope containing dirty groups, authoritative base revision, and the exact prepared patch before network dispatch; it must clear groups only after a matching receipt and reuse that patch across restart. This is a cache-contract change and must be coordinated with the browser representation, but does not require changing browser code.
- **Evidence boundary:** G0 source assessment only; no native code or tests changed in this pass. Existing mounted tests cover retry-to-outbox, not process death between preparation and settlement.

### 2026-10-11 23:02 +05:30 — Proposed shared workspace intent envelope (pre-implementation)

- **Core contract proposal:** Add `WorkspaceLayoutIntentSchema` in
  `@repo/core/logic/workspace`, reusing `WorkspaceLayoutPatchSchema` and
  `WorkspaceLayoutPatchGroupSchema` rather than defining a platform dialect:
  ```ts
  {
    version: 2,
    userId: UUID,
    workspaceId: nonEmptyString,
    layoutTarget: 'shared' | 'web' | 'mobile',
    dirtyGroups: Array<'arrangement' | 'appearance' | 'groups'>,
    pendingPatch?: WorkspaceLayoutPatch
  }
  ```
  The schema must reject duplicate dirty groups; when `pendingPatch` exists it
  must match the envelope identity and every changed group in that exact patch
  must be represented in `dirtyGroups`. `pendingPatch` is optional because a
  setter can durably record intent before the debouncer prepares a patch.
- **Durability semantics:** Each adapter writes the envelope atomically with
  its local user-visible layout state before scheduling the debounce. Immediately
  before network dispatch it stores the exact prepared patch. On startup, it
  restores the dirty group set and reuses that patch (same operation ID,
  idempotency key, input hash, and base revision) until an authoritative receipt
  resolves it. A completed receipt clears only groups still equal to the
  submitted values; a conflict removes `pendingPatch` but preserves dirty groups
  for explicit rebase. A new local edit while a patch is pending preserves its
  dirty group and must not mutate the prepared patch.
- **Local-format migration:** Browser's current v1
  `{ accountId, workspaceId, layoutTarget, dirtyGroups, pendingPatch? }` record
  is read once, validates exactly as it does today, maps `accountId` to the
  canonical `userId`, and is rewritten as v2 on the next successful local
  write. Native has no intent record yet, so absence means no pending intent;
  its existing serialized whole-layout cache remains read-compatible. Invalid,
  cross-account, or target-mismatched records are discarded locally. This is a
  client-cache format only: no server API, database, or PowerSync schema change.
- **Ownership/test boundary:** Foundation owns the core schema, native storage
  adapter, and a mounted restart scenario that simulates server commit followed
  by lost response and proves the same operation ID is reissued after remount.
  Browser/floor-canvas owns converting its v1 localStorage record to the shared
  schema without altering its presentation keys. The two adapters must agree on
  this schema before implementation; no adapter code changed in this proposal.

### 2026-10-11 23:16 +05:30 — Native intent durability correction (pre-implementation)

- **Verified limitation:** `SafeZustandStorage.setItem` delegates to
  `storage.set`, whose Expo Go/web/early-runtime fallback (`RobustAsyncStorage`)
  first mutates an in-memory cache and then launches `AsyncStorage.setItem(...).catch(...)`
  without returning or awaiting that promise. It is suitable for best-effort Zustand
  persistence, but it is *not* an acknowledged durable-write boundary. Awaiting its
  declared `void | Promise<void>` result would therefore not make the fallback
  restart-safe.
- **Required primitive:** The native workspace-intent adapter must use a dedicated
  `Promise<void>` durable-write port. On the AsyncStorage fallback that port awaits
  `AsyncStorage.setItem` and propagates its failure; on the native MMKV path it
  performs the synchronous write and converts an exception to a rejected promise.
  It must not use the generic Zustand storage facade as its acknowledgement.
- **Dispatch rule:** Persist the exact `WorkspaceLayoutIntent` (including the
  prepared patch) through that port *before* `patchWorkspaceLayout` is called. If
  persistence fails, retain the visible local layout, set `syncError`, and skip
  network dispatch. Receipt-driven intent clearing also goes through that port;
  a clear failure leaves the intent intact, which is safe because replay uses the
  same idempotency identity.
- **Scope boundary:** This is a narrow native-only storage-port extension in
  `@repo/core`; it does not change the generic Zustand facade, server contracts,
  PowerSync schema, or browser product offline policy. The browser adapter may
  consume the shared schema independently.

### 2026-10-11 23:23 +05:30 — Atomic local-state correction from cross-chat review

- **Issue accepted:** An intent marker and a separately stored rendered layout do
  not prove restart recovery: a process can die between those two writes. A
  `dirtyGroups + pendingPatch` marker also lacks a stable value snapshot during
  the debounce interval before a patch exists.
- **Revised canonical record:** The shared envelope must add
  `values: WorkspaceLayoutPatchValues`, representing the latest projected
  arrangement/appearance/groups state. Native will persist one account/workspace/
  target-scoped record containing `{ version, userId, workspaceId, layoutTarget,
  values, dirtyGroups, pendingPatch? }` through the acknowledged durable-write
  port before debounce and again before dispatch. The record, not a separately
  written layout plus marker, is authoritative for restart recovery.
- **Adapter boundary:** Native can reconstruct its `WorkspaceLayout` from its
  existing local layout/default/remote baseline plus the envelope `values`; the
  browser adapter can map its own rendered state to the same values. The existing
  generic layout cache remains outside this new primitive and is not claimed as
  part of the atomicity guarantee. No legacy value/layout migration is required
  for pre-consumer development; the new envelope is used whenever present.

### 2026-10-11 23:31 +05:30 — Bootstrap durability guard

- `StorageManager` begins on a memory adapter before platform bootstrap. Its
  acknowledged-write operation must fail closed rather than treating a Map write
  as restart durable. Native intent dispatch will therefore surface a storage
  initialization error and skip the request until a persistent adapter is
  registered. The MMKV fallback's acknowledged path likewise awaits the
  AsyncStorage fallback rather than using its fire-and-forget `set` path.

### 2026-10-11 23:37 +05:30 — Foundation primitive implemented

- Added `WorkspaceLayoutIntentSchema` v2 and
  `buildWorkspaceLayoutIntentStorageKey` in
  `@repo/core/logic/workspace/layoutIntent`. The schema holds the projected
  values with intent, rejects duplicate dirty groups, and validates that an
  optional prepared patch has matching identity and only dirty named groups.
- Added the acknowledged `IStorage.setStringAsync` port, implemented by native
  AsyncStorage/MMKV/fallback and browser adapters, surfaced through
  `StorageManager` and `setStorageItemDurably`. The memory bootstrap adapter
  rejects the acknowledged operation deliberately. `SafeZustandStorage` remains
  best-effort for Zustand and was not redefined as durable.
- **Evidence:** G1 boundary / Vitest: `layoutIntent.test.ts`, 2/2 passed.
  Proves schema validation and target-scoped keys under a mock runtime. Does not
  prove native process-death recovery, adapter registration, or device storage;
  those remain in the bounded native-hook wiring slice.

### 2026-10-11 23:43 +05:30 — Native lifecycle baseline repaired

- The active native patch/reconciliation implementation referenced
  `projectWorkspaceLayoutPatchValues` and `hashWorkspaceLayoutPatchGroup` without
  importing them. Added the missing imports before extending its lifecycle so the
  base remains executable.
- **Evidence:** G3 component mounting / React Testing Library + TanStack Query:
  `workspace-layout-sync.native.test.tsx`, 5/5 passed. Proves the existing
  mounted retry/outbox/trailing-edit flows still execute. Does not yet prove the
  new write-ahead restart contract; that wiring is still active.

### 2026-10-11 23:47 +05:30 — Acknowledged storage port type closure

- The added `IStorage.setStringAsync` method is now implemented by the parallel
  native runtime storage shape and all affected typed scenario/runtime mocks.
  This removes the new storage-port diagnostics found by the cross-chat type
  audit without weakening assertions or making the method optional.
- **Evidence:** G1 boundary / Vitest: perspective scenario, sanctuary isolation,
  and feature-runtime suites, 11/11 passed. `@repo/core` TypeScript still fails
  on pre-existing missing third-party declarations and unrelated form/mesh
  dialect errors; after this closure it reports no `setStringAsync` diagnostic.

### 2026-10-11 22:58 +05:30 — Visual budget and wallpaper cross-platform wiring review

- **Shared policy:** `packages/core/src/efficiency/visualBudget.ts` resolves an explicit visual quality, animation/blur allowance, canvas pixel cap, pixel ratio, particle count, and frame interval from runtime signals. `packages/core/src/efficiency/wallpaper.ts` applies that budget to wallpaper enablement, responsive Cloudinary width (`c_limit`, `q_auto`, `f_auto`), opacity, and blur. Both browser and native renderers call this shared wallpaper policy.
- **Web signals and consumers:** `apps/gurudevi-web/lib/runtime/useBrowserVisualBudget.ts` reads online/offline, Network Information `effectiveType`/`saveData`, `deviceMemory` or processor count, reduced motion, and document visibility. It conservatively starts at essential quality and refreshes on connection, resize, visibility, and reduced-motion changes. `WorkspaceWallpaperLayer` and `FloorAtmosphere` consume it; the Self floor also calls the wallpaper resolver directly.
- **Native signals and consumer:** `packages/ui/src/components/workspace/WorkspaceWallpaper.tsx` reads `RealityProvider` device/network/data-saver/battery-saver/reduced-motion signals and foreground state, then uses the same core budget and responsive URL policy. Expo Image gets low priority, downscaling, platform visual decode/cache capabilities, and only gets a transition when animation is allowed. `SelfFloor` also gates wallpaper on `VisualCapabilities.quality` before mounting.
- **Hostile-review limitation:** Web has no battery-saver input today (`isBatterySaverMode: false`), while native has one. Browser battery saver is not a standard signal on all browsers, so parity must be expressed as conservative/unknown policy or an optional capability, not a fabricated detection. The web hook also treats missing Network Information as good network; this is a deliberate capability fallback but means network quality cannot be inferred on those browsers. This review found no separate wallpaper renderer implementation needed; remaining work is signal semantics/evidence and the shared persisted-intent contract.
- **Scope:** Read-only source review and ledger update; no runtime behavior changed. Evidence is G0 source trace, not device or browser runtime measurement.

### 2026-10-11 22:59 +05:30 — Browser adapter adopts canonical intent v2

- **Change:** `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` now uses `WorkspaceLayoutIntentSchema` and `buildWorkspaceLayoutIntentStorageKey` from core. Its local record is v2 with canonical `userId`, projected `WorkspaceLayoutPatchValues`, unique dirty groups, and optional exact pending patch. The hook validates the complete record before writing and validates it on read. The prior browser-only v1 accountId marker is not retained; this is a pre-consumer development format as agreed in the preceding ownership discussion.
- **Atomic ordering:** For remote-synced appearance, group-order, and pin edits, the new v2 record is written first with current projected values and dirty metadata, then the three presentation cache keys are updated. On remount, dirty values restore the user-visible fields from v2 even if the separate appearance cache key is absent. Once remote hydration supplies the target baseline, the v2 values are refreshed before scheduling replay. A prepared patch is persisted in that same envelope before mutation dispatch and reused after remount.
- **Evidence:** G3 / Vitest 5.0.0 / jsdom hook mount: 3 files, 23 assertions passed across the persistence adapter plus Self/domain canvas integration suites. The remount case now removes the separate appearance cache key and still restores the dirty appearance from v2. Changed-file Biome and scoped `git diff --check` passed.
- **Typecheck limitation:** `gurudevi-web` `tsc --noEmit` remains nonzero due existing AuthProvider implicit-any, missing GrowthBook declarations, and unresolved core path/JSON declarations. No diagnostic names the browser hook or its persistence test.
- **Hostile-review finding sent to Foundation:** `StorageManager` currently defaults to `MemoryStorageAdapter`, whose `setStringAsync` resolves after a Map write. An acknowledged promise alone is not proof of persistence before the platform adapter registers; native write-ahead dispatch must fail closed or await persistent-adapter readiness. Foundation says it is adding this distinction and tests. Verify actual implementation before claiming native restart durability.
- **Evidence boundary:** Browser uses synchronous localStorage as its durability boundary; this does not prove browser process-death guarantees on every browser/private mode or recover from quota/write failure. Remote patch and outbox are mocked by the G3 harness.

### 2026-10-11 23:03 +05:30 — Wallpaper registration response-loss safety

- **Hostile finding:** The client previously called Cloudinary `delete_by_token` after every registration error. The server registration handler writes/upserts the owned asset before serializing its success response; therefore a lost response can mean an active database row already exists. Deleting with the client-held provider token in that state could invalidate a legitimate wallpaper reference.
- **Change:** `uploadWallpaper` now retries the exact same registration body once for ambiguous transport or 408/429/5xx errors, using the signed upload's `publicId` as the existing `(user_id, public_id)` idempotent identity. A repeated ambiguous failure raises `WallpaperRegistrationOutcomeUnknownError` carrying that public ID. Definitive status-coded rejection is propagated without retry. The upload intent no longer requests `return_delete_token`, and the client no longer parses or uses that deletion capability. Provider cleanup is left to an authoritative server-owned reconciliation path rather than inferred from a thrown client error.
- **Existing server integrity:** Registration is an active-only `ON CONFLICT (user_id, public_id)` upsert. Layout patch locks the active asset `FOR SHARE`; deletion locks it `FOR UPDATE`, checks references across workspace targets, and transitions it to a pending tombstone before calling Cloudinary. These locks serialize patch-vs-delete so an asset cannot become referenced after deletion passed its check.
- **Evidence:** G1 / Vitest mock engine — core `mediaUpload.test.ts`: 6/6; proves same-publicId registration retry after an ambiguous response, permanent rejection without retry, and no provider-delete request. Sanctuary API `media-upload.test.ts` plus `workspace-layout-sync.orpc.test.ts`: 2 files / 18 passed. Changed-file Biome and scoped `git diff --check` passed. API and core tsc remain nonzero on repository-wide existing diagnostics; changed media files are not named in those outputs.
- **Remaining limit:** A process termination after Cloudinary upload but before registration can still leave an unregistered provider object; the browser/native does not persist the upload operation identity and no server reconciliation job/API currently resolves such orphans. This patch prevents destructive false cleanup and repairs one ambiguous in-process registration response; it does not claim crash-safe upload resumption or orphan reclamation. SQL concurrency was source-reviewed and mocked; a live PostgreSQL race test has not been run.

### 2026-10-13 23:04 +05:30 — Wallpaper registration reconciliation hardening

- **Change:** Added `reconcileWallpaperAsset` to the shared media contract and Sanctuary API. After an ambiguous registration response, the client sends the exact same provider identity and metadata to the reconciliation endpoint. The server re-verifies the Cloudinary asset, then under a row lock returns an existing active registration, treats an already-deleted asset as cleaned, or creates a pending tombstone for an unregistered provider object and destroys it through the server-owned Cloudinary credential. Referenced assets are refused.
- **Client behavior:** `uploadWallpaper` only reconciles transport/timeout/rate-limit/5xx failures; definitive registration errors propagate immediately. If reconciliation itself is ambiguous, `WallpaperRegistrationOutcomeUnknownError` carries the public ID for an explicit retry/recovery path. The signed upload intent no longer requests a client-side delete token, and no browser code calls `delete_by_token`.
- **Evidence:** G1 / Vitest mock engine — `packages/core/src/api/mediaUpload.test.ts`: 6/6; proves successful registration, committed-response-loss reconciliation using the same body, unknown reconciliation outcome, definitive rejection without reconciliation, URL validation, and source-size validation. Sanctuary API `media-upload.test.ts` plus `workspace-layout-sync.orpc.test.ts`: 2 files / 18 assertions passed. Changed-file Biome and scoped `git diff --check` passed. Package typecheck filters emit no diagnostics naming the changed media files; full package typechecks remain nonzero on unrelated repository diagnostics.
- **Hostile review boundary:** This does not prove a live PostgreSQL lock race or a provider outage during reconciliation; database tests use the existing mock transaction harness. A process kill after provider upload and before the first registration call is now recoverable by an explicit reconciliation retry, but no background orphan sweeper exists yet.

### 2026-10-13 23:07 +05:30 — Media ledger correction

- The 2026-10-11 response-loss note described a one-retry client implementation that was subsequently superseded by the stronger server reconciliation endpoint. The current source of truth is the 2026-10-13 entry above: ambiguous registration invokes server reconciliation; no client delete-token cleanup or blind second registration remains.

### 2026-10-13 23:18 +05:30 — Native write-ahead envelope evidence

- **Implementation verified:** `packages/core/src/native/useWorkspaceLayoutSync.ts` reads and writes the shared v2 `WorkspaceLayoutIntent` envelope. It persists projected values, dirty groups, and the exact prepared patch through `setStorageItemDurably` before `patchWorkspaceLayout`; hydration reconstructs the local layout from envelope values and reuses the stored operation identity. A rejected acknowledged write sets `syncError` and prevents network dispatch.
- **Evidence:** G3 / Vitest 5.0.3 / mounted React Native hook harness — `apps/gurudevi-mobile/src/__tests__/integration/workspace-layout-sync.native.test.tsx`: 7/7. Covers retry-to-outbox, response-loss remount with exact operation ID reuse, and storage-write rejection. Biome and scoped diff checks pass after formatting/import ordering repair.
- **Storage boundary:** `MemoryStorageAdapter.setStringAsync` fails closed; native adapters implement the acknowledged method. The full core typecheck still has unrelated third-party/form/mesh diagnostics, but no remaining `setStringAsync` diagnostics after Foundation updated typed mocks/runtime storage.
- **Open semantic note:** native currently writes a clean v2 envelope with an empty dirty-group set after receipt because the acknowledged port has no async remove operation. Hydration treats that as no pending intent; deletion/clean-record semantics remain a follow-up owned by Foundation.

### 2026-10-13 23:24 +05:30 — Native clean-envelope semantics closed

- Hydration now explicitly maps a validated v2 envelope with `dirtyGroups: []` to
  `pendingIntentRef = null`, so a clean cache record can never trigger replay.
- The acknowledged storage port remains write-only in this bounded slice; native
  retains the clean envelope as a validated local snapshot instead of inventing
  an unverified asynchronous delete guarantee. This supersedes the prior open
  semantic note; adding an acknowledged delete operation remains optional future
  storage work, not a correctness requirement for replay.

### 2026-10-13 23:32 +05:30 — Foundation reconciliation of active workspace writers

- **Confirmed contract convergence:** browser appearance, native full-canvas, and
  Classroom teacher writers all use the shared named-patch request, preparation,
  and receipt contract. Only browser and native adapters use the v2 durable
  intent lifecycle; that is intentional platform adaptation, not a new dialect.
- **Confirmed missing lifecycle:**
  `useTeacherClassroomWorkspaceData.updateLayout` directly calls the server after
  patch preparation. It lacks mutation scope/serialization, acknowledged intent,
  retry classification, and outbox admission. It is therefore not eligible to
  claim native offline/restart semantics. Its bounded migration belongs to the
  Classroom integration seam; Foundation makes no unsafe automatic replacement.
- **Boundary risk:** `TeacherDashboard.web.tsx` and `StudentDashboard.web.tsx`
  import `@repo/core/native`. Because that entry imports React Native and native
  storage/runtime facilities, the `.web.tsx` suffix is not sufficient proof of
  Next compatibility. This requires actual Next/Turbopack build evidence and a
  browser-native adapter decision before any import-path rewrite. No writer or
  reader was removed during this reconciliation.

### 2026-10-13 23:24 +05:30 — Native clean-envelope semantics closed

- Hydration now explicitly maps a validated v2 envelope with `dirtyGroups: []` to
  `pendingIntentRef = null`, so a clean cache record can never trigger replay.
- The acknowledged storage port remains write-only in this bounded slice; native
  retains the clean envelope as a validated local snapshot instead of inventing
  an unverified asynchronous delete guarantee. This supersedes the prior open
  semantic note; adding an acknowledged delete operation remains optional future
  storage work, not a correctness requirement for replay.

### 2026-10-13 23:36 +05:30 — Cross-surface verification and remaining Classroom seam

- **Focused evidence:** Web canvas/persistence/wallpaper suites: G3 Vitest 5.0.0, 5 files / 25 assertions passed. Core workspace intent/patch/outbox/retry and visual-budget/wallpaper suites: G1 Vitest 5.0.3, 6 files / 22 assertions passed. Mobile native layout-sync and wallpaper suites: G3 Vitest 5.0.3, 2 files / 10 assertions passed. Native layout-sync alone covers 7/7 including acknowledged-write failure, outbox fallback, response-loss remount, and exact operation ID replay.
- **Mandatory gates:** `check:version-drift` passes with the existing inline-style-prefixer waiver. `check:test-evidence` fails on one unrelated direct Vitest command in `apps/edlove-web/package.json`. `check:anti-slop` reports the repository baseline (score 88/100; 44 errors, 605 warnings across 3,311 files) and is not a focused canvas failure.
- **Remaining writer gap:** `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` is still a Classroom-owned direct `patchWorkspaceLayout` caller. It now builds a named arrangement patch and validates the receipt, but it does not use TanStack Query mutation scope, Pacer serialization, durable intent storage, or the mutation outbox. The canonical hooks used by `useClassroomWorkspaceLayout` and `useStudentWorkspaceLayout` already route through `useWorkspaceLayoutSync`; teacher data remains a separate adapter requiring a bounded Classroom-owned migration and its own mounted evidence.
- **Deletion-veto note:** The teacher adapter's older whole-row service call is absent from the current diff and was replaced in pre-existing shared work by the named patch call. No further removal is made here; any additional adapter replacement should be reviewed with explicit ownership and evidence.

### 2026-10-13 23:55 +05:30 — Exact workspace persistence writer/reader convergence map

This is the required source map before further persistence contract edits. It describes current checked-out code; it is not a proposal to merge platform adapters.

#### Browser: `useBrowserWorkspaceAppearance`

- **Writer entry points:** `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` exports `setAppearance`, `setGroupOrder`, and `setPinnedIds`. All three mark named dirty groups (`appearance`, `groups`, `arrangement`) and call the same debounced `persistRemoteLayout` path. Arrangement writes currently cover `pinned`; this hook does not expose the full order/hidden/zone canvas setters.
- **Local readers:** On target/account/workspace change, the hydration effect reads the canonical v2 `workspace-layout-intent:<workspace>:<target>:<user>` via `buildWorkspaceLayoutIntentStorageKey` and validates it with `WorkspaceLayoutIntentSchema`. It also reads the compatibility/display keys `workspace-appearance:<workspace>:<target>:<account>`, `workspace-groups:<workspace>:<target>:<account>`, and `workspace-pinned:<workspace>:<target>:<account>`. Dirty v2 groups take precedence over these display keys. Setters synchronously write v2 values/dirty groups first, then their relevant display key.
- **Remote reader:** `createSupabaseWorkspaceLayoutRepository(...).getLayout(accountId, workspaceId, layoutTarget)`; if target-specific row is absent, it reads `shared` for display while retaining target defaults as authoritative baseline.
- **Remote writer:** Builds a named patch against the authoritative layout, persists the exact prepared patch in v2 before dispatch, calls `orpcClient.sync.patchWorkspaceLayout`, validates the mutation receipt, updates the authoritative snapshot, clears settled dirty groups, and retains ambiguous/offline work through TanStack Query retry and the mutation queue. Retryable queue writes are `buildWorkspaceLayoutPatchQueuedMutation(input)`.
- **Target selection:** Browser width `< WORKSPACE_COMPACT_BREAKPOINT` resolves to `mobile`, otherwise `web`; resize triggers re-hydration for the new target.
- **Readers/consumers:** `useSelfCanvas`, `useWorkspaceCanvas`, `useProfileCanvas`, `useLibraryCanvas`, and `useCommunityCanvas` consume appearance/status/group/pin settings. The web canvas layout renderers consume the resulting view-specific layout. The appearance hook does not own full browser canvas arrangement (order/hidden/zones).

#### Native and native-shared hook: `useWorkspaceLayoutSync`

- **Writer entry points:** `packages/core/src/native/useWorkspaceLayoutSync.ts` exports `setLayout`, `setSurfaceOrder`, `setSurfaceHidden`, `setSurfacePinned`, `setSurfaceZone`, `setAppearance`, `resetAppearance`, and `setGroupOrder`. Surface changes set the corresponding dirty group and update the optimistic in-memory layout.
- **Local readers:** Hydration reads best-effort display snapshot via `SafeZustandStorage.getItem(workspace-layout:<workspace>:<target>:<user>)` and the v2 intent via `SafeZustandStorage.getItem(workspace-layout-intent:<workspace>:<target>:<user>)`. Valid dirty intent overlays the display snapshot; empty-dirty intent is a clean cache and is not replayed. The separate cache is not the acknowledged durability boundary.
- **Write-ahead boundary:** `persistIntent` uses `setStorageItemDurably` to acknowledge v2 intent (values + dirty groups + optional exact pending patch) before network dispatch. Rejected durable storage prevents dispatch. On remount, a pending exact patch/operation ID is reused.
- **Remote reader:** `workspaceLayoutAPI.getWorkspaceLayout(userId, workspaceId, target)`; absent target row reads `shared` for display, with target baseline left non-authoritative.
- **Remote writer:** Shared `orpcClient.sync.patchWorkspaceLayout` with mutation scope `workspace-layout:<user>:<workspace>:<target>`, TanStack Query offline-first/retry policy, and retryable mutation queue outbox. Receipt is validated before settlement.
- **Target selection:** Uses `resolveWorkspaceLayoutTarget(platform, screenClass)` with inferred platform from React Native `Platform.OS` and compact/expanded class from `useWindowDimensions`; mobile width/class differs from web target semantics. This file imports `react-native` and must not be pulled into the Next app by a shared browser module.
- **Readers/consumers:** Gurudevi mobile `useSelfCanvas`/`SelfFloor`; Classroom `useClassroomWorkspaceLayout`, `useStudentWorkspaceCanvas`, Teacher/Student Dashboard variants; Community `CommunityScreen`; Library `LibraryScreen`. Core hook is exported from `@repo/core/native`.

#### Additional active Classroom writer requiring its own adapter decision

- `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` reads layout through `workspaceLayoutAPI.getWorkspaceLayout` and updates arrangement with a direct `orpcClient.sync.patchWorkspaceLayout` call after preparing a named patch and validating receipt. This path does not use the native hook's durable intent or Query/Pacer/outbox lifecycle. It selects target with `Platform.OS`, yet the same hook is imported by both `TeacherClassroomDashboard.tsx` and `TeacherClassroomDashboard.web.tsx`.
- Additional web Teacher/Student dashboard components directly import `@repo/core/native` (`packages/classroom/src/screens/{TeacherDashboard,StudentDashboard}.web.tsx`). Although checked in code, this package entry/import path is a web-boundary risk and requires explicit bundler resolution/build evidence; do not assume `.web.tsx` makes `@repo/core/native` browser-safe. This map does not modify it.

#### Shared contracts and safe convergence rule

- Shared data contract: `WorkspaceLayoutPatch`, `WorkspaceLayoutIntentSchema` v2, `prepareWorkspaceLayoutPatchMutation`, receipt validation and `workspaceLayoutAPI`; persisted server source: `user_workspace_layouts`, with mutation receipt/idempotency owned server-side.
- The browser hook and native hook both write the same server patch contract and intent schema, but have different persistence adapters, target resolution, and surfaces. Canonicalization should share domain contracts/policy and preserve a browser adapter that imports no React Native modules.
- Before further persistence work, reconcile all three active writer paths (browser appearance, native canvas, Classroom teacher) and the web dashboard import boundary. Keep browser appearance caches as display compatibility readers until an explicitly approved migration proves they can be retired.
- **Ownership:** browser hook/consumers are this stream; native hook and core durable storage are owned by “Harden mutation sync lifecycle”; Classroom hook/dashboard plus server contract remain shared integration seams. The Foundation/native slice is complete, so future edits touching the durable storage port or native hook must be coordinated with its owner.

#### 2026-10-13 23:59 +05:30 — Web import risk scope correction

- The `.web.tsx` Classroom dashboards do import `@repo/core/native`, whose package entry exports native storage/bootstrap modules and imports `react-native`. This remains a browser-surface boundary risk wherever those Expo/RN web-resolved dashboards are bundled.
- Current Next app evidence is narrower: `apps/gurudevi-web/package.json` depends on `@repo/classroom`, but `rg` finds only `@repo/classroom/practiceDefinitions` used under `apps/gurudevi-web`; `next.config.ts` transpiles `@repo/self` only. Therefore the inspected dashboards are not currently shown to be in the Gurudevi Next module graph. Do not report a Gurudevi Next build failure from the import alone; validate the Expo web route separately if it is a supported client.

### 2026-10-13 13:07 +05:30 — Classroom teacher writer lifecycle and responsive target

- **Change:** `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` now routes teacher arrangement writes through a scoped TanStack Query mutation (`offlineFirst`, shared retry policy, mutation scope), TanStack Pacer (350 ms coalescing), and the shared retryable mutation queue. It writes the v2 intent envelope through `setStorageItemDurably` before dispatch and persists the exact prepared patch/operation ID. Hydration reads the same v2 key and replays the exact pending operation after remount. A failed acknowledged write prevents dispatch. Edits made during an in-flight patch retain that pending operation while the latest arrangement remains in the intent values; after settlement the latest arrangement is sent as a trailing patch.
- **Responsive target:** Replaced the Platform-only target with the shared `resolveWorkspaceLayoutTarget` and `WORKSPACE_COMPACT_BREAKPOINT`: native remains `mobile`; compact Expo web uses `mobile`; expanded Expo web uses `web`. Identity guards prevent a stale scheduled writer from dispatching after account/workspace/target changes.
- **Dependency/map:** Added the direct `@tanstack/react-pacer` dependency to `@repo/classroom` and synchronized `pnpm-lock.yaml`. The install also refreshed lock state for the already-modified workspace manifests and current pnpm SSoT; review the lock delta as shared workspace churn, not only the Classroom import. Ran `node scripts/stack-map.mjs bootstrap`, curated the newly discovered `edlove-web` annotation, then `node scripts/stack-map.mjs`. The generator pruned the obsolete generated `gurudevi-marketingWeb` catalog and updated workspace membership to the current tree.
- **Evidence:** G3 mounted hook / Vitest 5.0.3 / mobile RTL+TanStack Query wrapper — `apps/gurudevi-mobile/src/__tests__/integration/classroom-teacher-layout-sync.native.test.tsx`: 6/6 passed. Covers write-ahead exact patch, storage failure before dispatch, exact operation ID replay after remount, newer edit during in-flight mutation, and wide/compact Expo web target selection. Biome passes on the hook and mounted test. `node scripts/audit-version-drift.mjs --fail-on-unannotated --n-major=2` passes with the existing inline-style-prefixer waiver. `node scripts/audit-test-evidence-levels.mjs` remains blocked by the unrelated unlevelled `apps/edlove-web/package.json` direct Vitest command. The Classroom package tsc remains nonzero on pre-existing package/core diagnostics; no diagnostic names the changed hook after adding the Pacer dependency.
- **Hostile-review limits:** Evidence uses mocked layout storage/network and React Native platform dimensions; it does not prove browser localStorage quota behavior, native device restart, server concurrency, or live outbox worker replay. The server contract/retry queue are reused and separately covered by existing core/API evidence. The hook retains its current exposed `workspaceError` path for conflicts; a dedicated user-facing “reapply local order” affordance remains UI work.
- **Ownership:** Classroom teacher adapter now consumes the shared v2 intent and mutation contracts without editing Foundation-owned `useWorkspaceLayoutSync` or storage adapters. Coordinate any schema/storage changes with “Harden mutation sync lifecycle.”

### 2026-10-13 14:22 +05:30 — Current-checkout persistence map correction for cross-chat convergence

This entry supersedes stale status claims in the 23:55 map and 13:07 Classroom note below. It does not remove that historical evidence. The current checkout was re-read before this correction.

- **Browser appearance writer/readers:** `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` owns browser `localStorage` keys `workspace-layout-intent:<workspace>:<target>:<user>`, `workspace-appearance:<workspace>:<target>:<account>`, `workspace-groups:<workspace>:<target>:<account>`, and `workspace-pinned:<workspace>:<target>:<account>`. Its public writers are `setAppearance`, `setGroupOrder`, and `setPinnedIds`; they project dirty groups and funnel named patches through debounced `persistRemoteLayout` → `orpcClient.sync.patchWorkspaceLayout`, with receipt validation / retry / queue handling in this browser adapter. Hydration reads intent plus compatibility keys, and reads target-specific server layout with shared fallback. `useSelfCanvas`, `useWorkspaceCanvas`, `useProfileCanvas`, `useLibraryCanvas`, and `useCommunityCanvas` consume this hook. It does not expose the complete canvas order/hidden/zone writer API.
- **Native/full-layout writer/readers:** `packages/core/src/native/useWorkspaceLayoutSync.ts` is the full arrangement/appearance/groups writer and reader for consumers importing `@repo/core/native`. Setters include full layout, order, hidden, pinned, zone, appearance/reset, and group order. It reads best-effort layout snapshot `workspace-layout:<workspace>:<target>:<user>` plus v2 intent `workspace-layout-intent:<workspace>:<target>:<user>` from `SafeZustandStorage`; only `setStorageItemDurably` acknowledgement of v2 intent is the write-ahead boundary before remote patch. The same file reads target-specific server layout and shared fallback; writes named patches via `orpcClient.sync.patchWorkspaceLayout`, scoped TanStack Query mutation/retry, and retryable outbox admission. Target resolves from RN `Platform.OS` and dimensions (`native→mobile`; web compact→mobile, web expanded→web). Its broad readers include Gurudevi mobile `useSelfCanvas`, Classroom layout/data/dashboard hooks, plus `packages/profile`, `packages/library`, `packages/admin` canvas hooks, and `packages/community` screens. This broad usage means lifecycle changes in core affect more than the Self floor.
- **Current Classroom status:** `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` now imports and calls the canonical `useWorkspaceLayoutSync`; `updateLayout` delegates to `setSurfaceOrder`. It no longer directly reads `workspaceLayoutAPI` or calls `patchWorkspaceLayout` in the current file. Teacher surface definitions live in `teacherClassroomWorkspaceSurfaces.ts`, consumed by both native and `.web.tsx` TeacherClassroomDashboard. Other wrappers (`useClassroomWorkspaceLayout`, `useStudentWorkspaceCanvas`, teacher/student dashboard variants) also consume the core hook. The 13:07 entry's separate Classroom Pacer/storage writer and dependency addition describe a prior intermediate state and must not be used as current ownership evidence.
- **Other local state:** Mobile Self pins additionally read/write `useActiveSubTabsStore` under `pinnedFeatureIdsByDomain.self` as a local fallback/toggle path (`apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts`); synced layout pins win when non-empty. This state is separate from the cross-device workspace layout patch and should be considered before changing pin precedence/migration.
- **Shared contract/server side:** domain intent/patch/target/outbox/retry logic is under `packages/core/src/logic/workspace/{layoutIntent,layoutPatch,layoutSync,outbox,syncPolicy}.ts`; server read API is `packages/core/src/api/workspaceLayout.ts`; patch endpoint contract is `packages/core/src/api/sync.orpc.contract.ts`; persistence adapter is `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts` and its workspace layout service. These are shared seams, not UI adapters.
- **Web boundary:** `TeacherDashboard.web.tsx` and `StudentDashboard.web.tsx` in Classroom import `@repo/core/native`, so Expo-web resolution needs bundler evidence. The checked Gurudevi Next import graph currently reaches only `@repo/classroom/practiceDefinitions`, not those dashboard files; this does not establish that all browser clients are safe.
- **Coordination rule:** browser `localStorage` lifecycle and native `SafeZustandStorage` lifecycle remain distinct adapters over common intent/patch contracts. Coordinate schema, replay, receipt, retry/outbox, or targeting changes with the core-hook owner first. Do not infer that “canvas” appearance settings cover full arrangement, or that the shared appearance hook is the sole writer.

### 2026-10-13 14:35 +05:30 — Reduced-motion wallpaper policy correction

- **Finding/fix:** Reduced-motion preference had forced the shared runtime visual budget to `essential`, which also removed static user wallpaper. It now disables animation and particle work while preserving a still wallpaper at the device/network-supported visual quality. Low-memory, data-saver, battery-saver, offline/poor-network, and hidden-document signals still resolve to the essential budget and suppress wallpaper work.
- **Evidence:** G1 / Vitest 5.0.3 — core `visualBudget.test.ts` + `wallpaper.test.ts`: 9/9; G3 / Vitest 5.0.3 — mobile `workspace-wallpaper.native.test.tsx`: 3/3; web / Vitest 5.0.0 — `workspaceWallpaperLayer.test.tsx`: 1/1. Scoped Biome check passes for the three changed core files.
- **Hostile-review boundary:** These tests establish policy/component behavior under supplied signals and mocks; they do not measure physical-device GPU/frame-time or battery draw. Browser battery-saver state is not available through the current browser signal adapter and remains conservative only where other signals indicate it.

### 2026-10-13 13:22 +05:30 — Floor sync recovery integration and adapter root cause

#### Root cause: two adapters, one shared patch protocol

- **Historical origin:** `packages/core/src/native/useWorkspaceLayoutSync.ts` descends from `packages/core/src/lib/workspace/useWorkspaceLayoutSync.ts`, present in history by March/April 2026. Its model is a domain surface inventory plus full `WorkspaceLayout`: order, hidden, pinned, zones, appearance, and group order; target selection consumes React Native `Platform` and `useWindowDimensions`, while device cache uses the native-aware storage wrapper. The current module is under `@repo/core/native` specifically because that dependency/storage boundary must not leak into browser-native Next modules.
- **Browser origin:** `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` was added with the standalone Sanctuary Next app on 2026-10-06 (`3599b9d2f8` in `git blame`). It serves five browser domain hooks (`useSelfCanvas`, `useWorkspaceCanvas`, `useProfileCanvas`, `useLibraryCanvas`, `useCommunityCanvas`) and exposes appearance, group ordering, and pinned IDs. The web floors own their own responsive content composition; this adapter does not define registered `WorkspaceSurfaceDefinition` inventories or setters for full surface order, hidden state, or zones. Its account/workspace/target localStorage compatibility keys remain separate from the native full-layout snapshot.
- **What is intentionally shared:** both adapters now project to `WorkspaceLayoutIntentSchema` v2 and emit the same named `WorkspaceLayoutPatch` (`arrangement`, `appearance`, `groups`), using common preparation, hash/receipt validation, retry policy, outbox payload, and server endpoint. This is the safe platform-neutral seam already extracted in `packages/core/src/logic/workspace/{layoutIntent,layoutPatch,layoutSync,outbox,syncPolicy}.ts`. Neither adapter should import the other; a future common lifecycle controller would need injected read/write/durable-write, query mutation, target selection, and outbox ports so `@repo/core/native` does not enter the Next graph.
- **What is not yet canonical:** duplicated adapter orchestration and local cache shape are not evidence that the full canvas is parity-complete. `useBrowserWorkspaceAppearance` labels pinned IDs as arrangement but has no browser writer for `order`/`hidden`/`zoneBySurface`; the full native hook does. Existing architecture prose that says “seamless cross-device parity” means only the fields and named patch contract the browser hook currently supports. The feature gap should be resolved after the browser surface inventory/interaction contract is defined, not by making the appearance adapter silently own a different full canvas.

#### Conflict path and why recovery was hidden

- Patch conflicts are group-hash scoped. A browser appearance edit and a native arrangement edit can settle independently when their named groups are disjoint and each request includes only changed groups. Conflicts occur when another client changes the same named group after the writer's base hash: for example, browser `setPinnedIds` writes the entire `arrangement` group, so it can conflict with native order/hidden/zone changes even though the user only changed pins. Two appearance edits to the same target can also conflict. Expanded web maps to target `web`, compact browser and native mobile map to `mobile`; clients editing the same user/workspace/target share the same authoritative row.
- On conflict, the shared receipt parser produces `WorkspaceLayoutConflictError`. Browser clears the stale prepared patch while retaining local dirty intent and sets `conflict`; native records it as `syncError`. Both lower-level hooks provide a user-invoked `reapplyLocalChanges` that fetches the latest remote base and attempts to rebase the retained local groups. Neither path should auto-replay the conflicted patch.
- **Integration defect fixed in this slice:** web `useSelfCanvas` previously dropped `conflict`, `status`, and `reapplyLocalChanges`; mobile `useSelfCanvas` dropped `syncError` and `reapplyLocalChanges`. Thus the persistence layer retained conflict state but SelfFloor had no way to show recovery. Both SelfFloor surfaces now expose an accessible, user-initiated “Retry floor sync” notice for a conflict/error state. The callback is disabled while in flight and presents a retry failure; no writer, storage contract, automatic retry policy, or conflict semantics changed.

#### Exact current call chains

- **Browser:** `SelfFloor` → `apps/gurudevi-web/lib/canvas/useSelfCanvas.ts::useSelfCanvas` → `useBrowserWorkspaceAppearance` → hydration: v2 intent + `workspace-appearance:*` / `workspace-groups:*` / `workspace-pinned:*` localStorage and `createSupabaseWorkspaceLayoutRepository.getLayout` (target, then shared display fallback) → setters update intent/local compatibility values → 350 ms Pacer debounce → TanStack Query mutation with shared retry/scope → named `orpcClient.sync.patchWorkspaceLayout` → receipt settlement or durable mutation queue. Recovery now flows back from the adapter through useSelfCanvas to `WorkspaceLayoutRecoveryNotice` and only fires on user click. The other four browser domain hooks use the same adapter but their floor consumers have not yet adopted a recovery notice.
- **Mobile:** `SelfFloor` → `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts::useSelfCanvas` → `@repo/core/native::useWorkspaceLayoutSync` → target-specific `SafeZustandStorage` cache + v2 intent hydrate → user setter updates optimistic full layout and acknowledged v2 write-ahead intent → TanStack Query mutation/shared retry/Pacer debounce → named oRPC patch → validated receipt or retryable outbox. Recovery now flows through the existing `syncError` and `reapplyLocalChanges` result to a native `WorkspaceLayoutRecoveryNotice`; user action only.
- **Other native-hook readers (blast radius):** Classroom (`useTeacherClassroomWorkspaceData`, `useClassroomWorkspaceLayout`, `useStudentWorkspaceCanvas`, dashboard variants), Community, Profile, Library, and Admin workspace canvas hooks also consume `useWorkspaceLayoutSync`. Any common lifecycle or local contract refactor must assess those readers and the `.web.tsx` Expo bundling boundary. The current Gurudevi Next graph is still distinct.

#### Evidence and limits

- G3 / Vitest 5.0.0 / jsdom component mount — `workspaceLayoutRecoveryNotice.test.tsx`: 2/2; G2 / Vitest 5.0.0 / jsdom SelfFloor component suite: 10/10; `selfCanvas.test.ts`: 5/5.
- G3 / Vitest 5.0.3 / React test renderer with RN primitives substituted — `workspace-layout-recovery.native.test.tsx`: 2/2; native full sync suite: 7/7.
- Scoped Biome passed on the web/mobile consumer hooks, floors, notices, and new tests. Web `check-types` remains nonzero on stale/conflicting generated `.next/types`, routing, and unrelated core module-resolution diagnostics; none of its emitted diagnostics named changed recovery files. Mobile `tsc --noEmit` remains nonzero on repository declarations and unrelated packages; emitted diagnostics named the concurrently edited native core hook and pre-existing Classroom integration test, not changed recovery files. Physical-device conflict/reconnect testing remains unproven.

### 2026-10-13 14:10 +05:30 — Persistence seam handoff map (pre-change checkpoint)

This section records the current source-level writers/readers as the required convergence checkpoint before any further workspace persistence edits. It maps the code as currently present; it does not imply every reader exposes sync state.

#### Browser adapter: `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts`

- **Local readers:** `readBrowserWorkspaceIntent` reads and validates the v2 `workspace-layout-intent:*` envelope (lines 93–108); `readLocal`, `readGroups`, and `readPinned` read the compatibility keys `workspace-appearance:*`, `workspace-groups:*`, and `workspace-pinned:*` (141–200). Hydration (around 510–550) gives dirty v2 intent precedence for its dirty groups, then fetches target layout and shared display fallback through `createSupabaseWorkspaceLayoutRepository.getLayout` (around 560–610).
- **Local writers:** `persistCurrentIntent` / `writeBrowserWorkspaceIntent` writes the v2 intent and pending named patch (around 300–315; writer 113–138). `setAppearance`, `setGroupOrder`, and `setPinnedIds` (636–760) update React/ref state, mark the named dirty group, then write the intent and compatibility cache. localStorage failure changes status to `error`. Successful remote hydration refreshes the corresponding compatibility cache (around 580–605). The Self wallpaper UI uses the same `setAppearance` writer; wallpaper is nested in `WorkspaceAppearance`.
- **Remote writer:** the 350 ms Pacer debouncer schedules `persistRemoteLayout` (around 390–455); that path derives named changes from dirty groups, prepares or reuses the persisted patch, and calls the TanStack Query mutation for `orpcClient.sync.patchWorkspaceLayout` (mutation around 235–275). Receipt settlement clears only groups whose current hash matches the submitted value. Conflict preserves local dirty intent and sets `conflict`; it does not auto-reapply. `reapplyLocalChanges` (around 464–490) fetches the latest target base and explicitly retries local intent.
- **Direct browser readers:** `apps/gurudevi-web/lib/canvas/{useSelfCanvas,useWorkspaceCanvas,useProfileCanvas,useLibraryCanvas,useCommunityCanvas}.ts`. The Self floor currently exposes recovery; the other four adapter consumers need separate review before any persistence contract change. Do not import `@repo/core/native` into this Next graph.

#### Native adapter: `packages/core/src/native/useWorkspaceLayoutSync.ts`

- **Local readers:** target resolution uses React Native `Platform` and `useWindowDimensions` (141–158); layout and intent keys use `buildWorkspaceLayoutStorageKey` and `buildWorkspaceLayoutIntentStorageKey` (225–232). Hydration reads both through `SafeZustandStorage.getItem` (around 480–500), validates the v2 intent, overlays arrangement fields plus appearance/groups over cached layout, and fetches target then shared display fallback through `workspaceLayoutAPI.getWorkspaceLayout` (118–138; hydrate around 515–540).
- **Local writers:** all full-layout setters (`setLayout`, `setSurfaceOrder`, `setSurfaceHidden`, `setSurfacePinned`, `setSurfaceZone`, `setAppearance`, `resetAppearance`, `setGroupOrder`; 650–750) update the optimistic `WorkspaceLayout`. The layout snapshot is written by the hydrated-layout effect through `SafeZustandStorage.setItem` (around 615–620). The v2 write-ahead intent is written by `persistIntent` via `setStorageItemDurably` (around 270–300), before remote mutation dispatch and after settlement; failures surface as `syncError`.
- **Remote writer/recovery:** hydrated dirty values are debounced through TanStack Query with 1200 ms Pacer (around 350–420); the mutation calls `orpcClient.sync.patchWorkspaceLayout` (around 165–200) and queues retryable failures through `useMutationQueue`. `reapplyLocalChanges` fetches current authoritative target state and calls the existing remote persistence path (around 429–445). Error/conflict state is `syncError`; there is no implicit conflict replay.
- **Direct native readers:** `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts`; Classroom workspace hooks and dashboards under `packages/classroom/src/{workspace,screens}`; Community, Profile, Library screens; Admin/Founder/Principal canvas hooks under `packages/admin/src/{admin,founder,principal}`. Several consumers currently destructure only layout/surfaces and discard `syncError`/`reapplyLocalChanges`; a shared hook contract change must assess this inventory.

#### Shared contracts and persistence boundary

- Both adapters use platform-neutral v2 `WorkspaceLayoutIntent`, named patch values/groups, patch preparation/hash/receipt logic, retry policy, outbox payload, and the same server patch endpoint under `packages/core/src/logic/workspace/{layoutIntent,layoutPatch,layoutSync,outbox,syncPolicy}.ts` and `packages/core/src/api/{workspaceLayout,sync.orpc.contract}.ts`.
- The native adapter additionally owns full surface order/hidden/pinned/zones and native durable storage. The current browser adapter owns appearance, group order, and pinned IDs with localStorage compatibility caches. Matching named group labels do not make these local persistence formats or surface capabilities equivalent.
- **Handoff rule:** Before changing storage keys, intent shape/ordering, local cache migration, target selection, mutation scheduling, receipts, retry, or outbox, both adapter owners review this map and name the exact readers/writers touched. Consumer-only recovery UI can proceed independently only while it calls the existing user-initiated recovery API and leaves persistence contracts unchanged.
- **Evidence level:** G0 source inspection. This map does not prove all dynamically selected platform entrypoints, browser process durability, device durability, or live network/database behavior.

#### Map correction — secondary mobile pin persistence and current Classroom path

- `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts::togglePin` currently calls both `toggleLocalPin('self', featureId)` and `canvasSync.setSurfacePinned(...)`. The first writes `pinnedFeatureIdsByDomain.self` in `packages/core/src/store/useActiveSubTabsStore.ts`, whose Zustand persistence key is `gurudevi-active-subtabs-storage` and whose storage is `SafeZustandStorage` (store persistence configuration near the end of the module). `effectivePinnedIds` prefers non-empty workspace-layout pins and otherwise falls back to this store. Thus changing pin migration/precedence must inventory both writers, the store hydration/migration, and any other `useActiveSubTabsStore` readers; it is not an alias for the v2 workspace intent.
- Current `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` reads/refreshes layout through `useWorkspaceLayoutSync` and exposes `layoutError`; current lexical search found no additional production `patchWorkspaceLayout` caller in the scoped apps/packages outside the browser appearance adapter and `packages/core/src/native/useWorkspaceLayoutSync.ts`. Re-check this before implementation because shared-checkout edits may change concurrently.
- This correction is G0 source inspection only. It does not establish how often the fallback pin store is hydrated or whether duplicate pin writers remain behaviorally necessary.

### 2026-10-13 14:45 +05:30 — Foundation reconciliation of the persistence handoff checkpoint

- **Map confirmation:** The 14:10 handoff map, including the 14:22 correction, matches the current Foundation-owned persistence surface. `useWorkspaceLayoutSync` remains the sole full-layout UI adapter: it reads the native snapshot and v2 intent, makes the v2 intent an acknowledged write-ahead boundary, and owns target selection, scoped mutation dispatch, receipt settlement, retry classification, and outbox admission. The browser appearance adapter remains a separate Next-safe adapter over the common intent/patch protocol; it is not a full-canvas replacement.
- **Additional replay seam:** `packages/core/src/lib/sync/registry.ts` must be treated as an implementation-level remote writer during any receipt, outbox-payload, or patch-contract change. It replays durable `patchWorkspaceLayout` commands through the same oRPC endpoint. It is not an independent UI writer and does not own local layout intent, target selection, or conflict UX.
- **Additional local seam accepted:** `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts` deliberately writes both the synchronized workspace pin state and the `useActiveSubTabsStore` Self fallback. The workspace value wins when non-empty. Any pin precedence, migration, or reset change therefore requires the store's readers/hydration path to be in the impact set; no such change is included in the current milestone.
- **Current Classroom boundary confirmed:** `packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts` delegates to the canonical core hook in the current checkout. Earlier ledger claims of a separate direct Classroom patch writer are historical intermediate state, not current ownership evidence.
- **Foundation dependency list for a future persistence change:** intent/key/schema changes require review of `packages/core/src/logic/workspace/{layoutIntent,layoutPatch,layoutSync,outbox,syncPolicy}.ts`, `packages/core/src/native/useWorkspaceLayoutSync.ts`, `packages/core/src/lib/sync/registry.ts`, the browser adapter owner, and the affected adapter tests. Storage-acknowledgement changes additionally require `packages/core/src/lib/storageWrapper.ts`, `packages/core/src/logic/interfaces/storage.port.ts`, and each storage adapter. Server patch or receipt changes additionally require `packages/core/src/api/{sync.orpc.contract,workspaceLayout}.ts` and `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts` review.
- **Freeze honoured:** No persistence implementation file was changed while reconciling this map. The next persistence edit must name its writer/reader impact set and dependency owner before code is authored.
- **Evidence:** G0 source inspection / lexical and ledger reconciliation only. This establishes current ownership and call paths, not runtime durability, device behavior, or database concurrency.

### 2026-10-13 14:52 +05:30 — Foundation milestone status and next-slice ownership declaration

- **Current milestone/status:** Foundation has completed the bounded workspace mutation-lifecycle hardening slice: shared v2 intent/patch preparation, receipt-aware named patching, native acknowledged write-ahead persistence, retryable durable outbox admission, response-loss operation identity reuse, and user-initiated conflict recovery plumbing. The persistence contract is now frozen pending a specifically scoped follow-up; no active Foundation implementation change is in progress.
- **Foundation-owned files in the completed slice:** `packages/core/src/logic/workspace/{layoutIntent,layoutPatch,layoutSync,outbox,syncPolicy}.ts`; `packages/core/src/native/useWorkspaceLayoutSync.ts`; `packages/core/src/lib/{storageWrapper.ts,sync/registry.ts,sync/useMutationQueue.ts,sync/sync/SyncManager.tsx}`; `packages/core/src/logic/interfaces/storage.port.ts`; the StorageManager and platform storage adapters; and the corresponding core/native intent, outbox, and mounted-hook tests. Server-facing shared seams are `packages/core/src/api/{sync.orpc.contract,workspaceLayout}.ts` and `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts`; these require server-owner coordination before alteration.
- **Explicit current writer/reader impact set:** UI writers are only the browser appearance adapter and native `useWorkspaceLayoutSync`; Classroom delegates to the latter. Durable replay writes are performed by `packages/core/src/lib/sync/registry.ts`. Native local readers/writers include the layout snapshot and v2 intent plus the separate `useActiveSubTabsStore` Self pin fallback. Browser local readers/writers include v2 intent and appearance/group/pin compatibility keys. Consumers include browser canvas hooks and the native Self, Classroom, Community, Profile, Library, and Admin-related core-hook consumers listed in the 14:10 map.
- **Evidence currently available:** G1 / Vitest 5.0.3 — `packages/core/src/logic/workspace/layoutIntent.test.ts`: 2/2 passed; proves schema/key and exact prepared-patch contract cases under substituted storage/network. G3 / Vitest 5.0.3 / mounted React Native hook harness — `apps/gurudevi-mobile/src/__tests__/integration/workspace-layout-sync.native.test.tsx`: 7/7 passed; proves configured retry-to-outbox, acknowledged-write rejection before dispatch, and response-loss remount operation-ID reuse. Scoped Biome previously passed on the native hook/test. These do not prove physical-device durability, live database concurrency, or browser storage quota behavior.
- **Dependencies/conflicts:** Browser adapter owner must review any intent schema, key, receipt, retry/outbox, or target-selection modification. Classroom and all native-hook consumer owners must review hook-result contract changes. The server/API owner must review patch payload, hash, receipt, or repository changes. Pin migration additionally requires the active-subtabs store owner/reader inventory. No unresolved source conflict blocks the current frozen state; the substantive risk is an unbounded attempt to merge adapter orchestration or silently expand browser full-canvas capability.
- **Requested coordination before a next slice:** propose one behavior-level objective, name the precise writer/reader impact subset from the map, identify whether it changes shared contract, platform adapter, replay registry, or consumer UX, and obtain the named owners' acknowledgement before code changes. The likely next safe candidates are an additive browser full-arrangement design/specification (not implementation) or a separately owned audit of recovery affordance propagation to the four non-Self browser consumers.

### 2026-10-14 — Foundation review: proposed device-class layout targets

- **Decision:** The additive `tablet` target is compatible with the completed lifecycle slice if it remains a target-enum/resolver/migration change only. Its no-copy rule, target-bound prepared patch identity, and separate browser/native adapters preserve the lifecycle invariants. It is approved for a revised design/implementation plan, not yet for shared-contract edits.
- **Required migration correction:** The 20260328 and 20261010 SQL files are historical migrations and must not be edited. Add one new forward-only migration which drops/recreates `chk_user_workspace_layout_target` on `public.user_workspace_layouts` and the inline/named receipt target check on `public.workspace_mutation_receipts` to allow `tablet`. The migration must preserve all existing rows, uniqueness, revisions, and receipts; it must not copy, rewrite, or re-key any target row.
- **Required resolver correction:** `resolveWorkspaceLayoutTarget` currently accepts `('web' | 'native', 'compact' | 'expanded')`; its only production caller derives the class from `< 768`. The new resolver needs a width-based input (or a deliberately compatible overload) and must use the pure `resolveWorkspaceRendererPlatform` classification: web `<=767 → mobile`, `768..1279 → tablet`, `>=1280 → web`; native `<=767 → mobile`, `>=768 → tablet`. The browser adapter currently computes its target independently and must call the same resolver or a single shared classifier—otherwise the spec would introduce a third breakpoint dialect.
- **Required impact additions:** Add `packages/core/src/api/sync.orpc.contract.ts` response `conflictFetchReference.layoutTarget`, `packages/core/src/logic/workspace/outbox.ts` conflict-reference validation/type, `packages/core/src/logic/workspace/index.ts` exports, `packages/core/src/__tests__/workspace/{layoutSync,useWorkspaceLayoutSync.logic,outbox}.test.ts`, `apps/sanctuary-api/src/__tests__/workspace-layout-sync.orpc.test.ts`, and browser persistence fixture receipts to the exact impact set. These currently contain explicit three-target unions or target-specific assertions.
- **Lifecycle invariants to test:** A resize/rotation after write-ahead persistence but before dispatch must retain the old target key, operation ID, queue scope, and patch payload. The new target may hydrate independently but must not consume, settle, or overwrite the old target's prepared intent. The durable replay registry must accept and replay a serialized `tablet` patch unchanged. Conflict receipt references must round-trip `tablet`.
- **Pin-fallback decision still required:** The mobile Self `useActiveSubTabsStore` fallback is target-agnostic while synced pins become target-specific. The proposal preserves it, but must explicitly state whether an empty tablet pin row is allowed to display the device-local fallback (current behavior) and how a later tablet-specific pin mutation suppresses it. Do not modify the fallback without its reader inventory and owner approval.
- **Evidence:** G0 source/spec review of current resolver, renderer classifier, target schemas, outbox receipt parser, current production callers, and SQL constraints. No shared persistence implementation file was changed during this review.

### 2026-10-14 — Foundation final spec completeness check: device-class targets

- **Impact-set acknowledgement:** The revised feature spec now names the source-grounded target allow-lists and consumers required to establish the shared-contract impact set: schema, width classifier/resolver, intent and patch schemas, oRPC request/response conflict reference, outbox conflict parser, public exports, native/browser adapters, replay registry, forward migration, and focused core/API/browser/native tests. It is complete enough to move to named-owner implementation planning; shared persistence code remains frozen until those acknowledgements are obtained.
- **Terminology correction required in the spec:** Widening `conflictFetchReference.layoutTarget` and receipt-table `layout_target` validation is an additive receipt-contract *format* change, although it does not change receipt settlement, conflict, retry, or replay semantics. Replace the current “no change to receipt format” non-goal with that precise distinction so the test/API impact does not contradict the stated non-goals.
- **Browser hydration acceptance case:** `useBrowserViewport` already consumes `resolveWorkspaceRendererPlatform`, while `useBrowserWorkspaceAppearance` currently starts at `web` and independently changes target in an effect. The implementation must make its first client-side selected persistence target use the shared classifier, and test 767/768/1279/1280 initial hydration as well as resize. A tablet browser must not briefly hydrate or dispatch under `web` merely because of the old default state.
- **Migration implementation constraint:** The proposed default Postgres name `workspace_mutation_receipts_layout_target_check` is consistent with the table/column creation syntax, but the forward migration should still use `drop constraint if exists` before adding explicitly named replacement constraints. That keeps fresh and already-migrated environments safe without modifying historical migrations.
- **Required no-regression evidence:** test the existing `screenClass` and `compactBreakpoint` override path in `UseWorkspaceLayoutSyncOptions` (or explicitly remove it only with deletion-veto approval); test direct browser adapter target selection rather than only the viewport hook; prove a queued `tablet` patch reaches `registry.ts` with its original scope/key/operation identity; and prove a conflict receipt with `tablet` parses through the outbox error boundary.
- **Evidence:** G0 source/spec review only. No behavior was executed and no persistence implementation file was changed.

### 2026-10-14 — Foundation review: absent-target fallback materialization

- **Finding confirmed:** This is an existing cross-target correctness gap, not a tablet-only concern. Both adapters can render the `shared` row when the requested target row is absent while retaining a default target row as their authoritative patch baseline. A first edit then sends only its dirty group. The server correctly applies that patch to a newly created default target row, but the next target-specific hydration can lose the previously displayed shared values in the untouched groups.
- **Approved bounded behavior:** Do not create a target row during read-only hydration. On the first local mutation only when the adapter has positively observed `authoritative target row = absent` and `display fallback = shared/default`, prepare one exact write-ahead patch containing all three named groups. Its **base hashes must be derived from the absent target's default canonical layout**, while its values are the displayed fallback layout with the user's edit applied. This lets the current server accept the first target write without changing its absent-target conflict assessment, materializes a stable target snapshot, and keeps the exact patch replayable after restart/response loss.
- **Why not use shared base hashes:** `sync.ts` assesses patches against `createDefaultWorkspaceLayout(...)` when the target row does not exist. A full patch whose base hashes were derived from the displayed shared row would therefore conflict immediately. Server-side shared-row inheritance is a larger semantics change and is not required for this bounded correction.
- **Concurrency invariant:** If another device creates that target row before this first patch reaches the server, default-derived base hashes must conflict rather than overwrite it. The existing explicit reapply flow then fetches the target row and rebases. Never silently resend a materialization patch against the new target row.
- **Required impact/evidence:** Browser and native adapters need an explicit, identity-bound “target absent with display fallback” state that is cleared on hydration/receipt/identity change; it must never leak across resize or account/workspace/target change. Add mounted tests for web and native: shared fallback + first one-group edit produces all three groups; server row persists fallback values; restart reads target-specific values; no remote fetch/no fallback keeps ordinary one-group behavior; a concurrent target creation produces conflict; queued/replayed materialization preserves target, operation ID, and all values. Include the API handler test proving an all-group default-base patch on an absent target succeeds.
- **Sequencing:** This should land as a small Foundation lifecycle bug fix immediately before—or as the first indivisible part of—the tablet-target slice, because `tablet` would otherwise inherit the known loss path. It does not require a schema, migration, outbox-format, retry, or receipt semantic change; it does require both adapter owners and the existing server-test owner to acknowledge the stated behavior.
- **Evidence:** G0 source-path review of both adapter hydration/persist flows and the server absent-row branch. No implementation changed in this review.

### 2026-10-14 — Frozen persistence inventory: exact writers, readers, and contracts

#### 1. Browser UI adapter — `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts`

- **UI writers:** `useBrowserWorkspaceAppearance` exposes `setAppearance`, `setGroupOrder`, and `setPinnedIds`. They update in-memory refs/state, mark respectively `appearance`, `groups`, or `arrangement` dirty, write the current v2 intent plus the corresponding display cache, then schedule the shared remote path. This adapter owns only appearance, group order, and pins; it is not a full order/hidden/zone writer.
- **Local readers/writers and keys:** `readBrowserWorkspaceIntent` / `writeBrowserWorkspaceIntent` read/write the validated v2 envelope under `workspace-layout-intent:<workspaceId>:<layoutTarget>:<accountId>` via `buildWorkspaceLayoutIntentStorageKey`. `readLocal`/`writeLocal`, `readGroups`, and `readPinned` use the compatibility/display keys `workspace-appearance:<workspaceId>:<layoutTarget>:<accountId>`, `workspace-groups:<workspaceId>:<layoutTarget>:<accountId>`, and `workspace-pinned:<workspaceId>:<layoutTarget>:<accountId>`. Intent dirty groups take precedence; empty intent is removed by the browser writer.
- **Display versus authoritative remote reader:** the hydration effect fetches target-specific layout through `createSupabaseWorkspaceLayoutRepository(...).getLayout`. When absent and target is not `shared`, it fetches `shared` for display. `hydratedLayoutRef` holds that display fallback, while `authoritativeLayoutRef` remains the target record or default target layout. This distinction is the source of the separately recorded first-write materialization requirement.
- **Scheduling/patch/recovery:** `persistRemoteLayout` runs through a 350 ms `useAsyncDebouncer`, constructs/reuses `prepareWorkspaceLayoutPatchMutation`, writes the exact pending patch into the v2 intent before `orpcClient.sync.patchWorkspaceLayout`, and uses TanStack Query `offlineFirst` retry plus `useMutationQueue.addToQueue(buildWorkspaceLayoutPatchQueuedMutation(input))` for retryable failure. Its mutation scope is `workspace-layout:<accountId>:<workspaceId>:<layoutTarget>`. `reapplyLocalChanges` explicitly refetches the target base and calls the existing path; conflict/status are exposed to the five browser canvas consumers.
- **Direct readers/consumers:** `useSelfCanvas`, `useWorkspaceCanvas`, `useProfileCanvas`, `useLibraryCanvas`, and `useCommunityCanvas`; browser `SelfFloor` plus the other floors consume their derived values. `useBrowserViewport` already reads the pure renderer classifier and is relevant to the device-target slice; this adapter currently resolves target separately.

#### 2. Native/shared full-layout adapter — `packages/core/src/native/useWorkspaceLayoutSync.ts`

- **UI writers:** `useWorkspaceLayoutSync` exposes `setLayout`, `setSurfaceOrder`, `setSurfaceHidden`, `setSurfacePinned`, `setSurfaceZone`, `setAppearance`, `resetAppearance`, and `setGroupOrder`. These are the only current full-layout UI setters in this map.
- **Local snapshot and acknowledged intent:** it reads/writes a best-effort layout snapshot at `workspace-layout:<workspaceId>:<layoutTarget>:<userId>` through `SafeZustandStorage`; it reads/writes v2 intent at `workspace-layout-intent:<workspaceId>:<layoutTarget>:<userId>`. `persistIntent` is the write-ahead boundary: it validates `WorkspaceLayoutIntentSchema` and awaits `setStorageItemDurably`, which calls `IStorage.setStringAsync`. Storage acknowledgement failure becomes `syncError` and blocks dispatch.
- **Remote reader/writer and recovery:** `fetchRemoteLayout` reads target then shared display fallback via `workspaceLayoutAPI.getWorkspaceLayout`; target record and display fallback remain separately represented by `authoritativeLayoutRef` and `hydratedLayoutRef`. `persistRemoteLayout` prepares/reuses the exact patch, writes intent before `orpcClient.sync.patchWorkspaceLayout`, uses target-scoped TanStack Query mutation/retry and 1200 ms Pacer debounce, and queues retryable failure via `addToQueue`. `reapplyLocalChanges` refetches/rebases only on explicit user action; `refreshFromRemote` is the non-replay reader. Target selection currently derives from `resolveWorkspaceLayoutTarget` plus `screenClass`/`compactBreakpoint` override inputs.
- **Direct readers/consumers:** mobile `useSelfCanvas`; Classroom `useTeacherClassroomWorkspaceData`, `useClassroomWorkspaceLayout`, `useStudentWorkspaceCanvas`, teacher/student dashboards; Community, Library, Profile; and Admin/Founder/Guardian/Principal canvas hooks. Consumers that discard `syncError`/`reapplyLocalChanges` remain a UX propagation concern, not separate persistence writers.

#### 3. Replay, fallback, API, and storage paths

- **Replay writer (not a UI writer):** `packages/core/src/lib/sync/registry.ts::MUTATION_REGISTRY.patchWorkspaceLayout` validates serialized input with `WorkspaceLayoutPatchSchema`, restores operation/idempotency/hash from `MutationExecutionContext`, and calls the same oRPC endpoint. `useMutationQueue` persists queued commands; `SyncManager` leases/dispatches/settles them. Replay owns no target inference, local intent, or floor recovery UX.
- **Mobile Self pin fallback:** `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts::togglePin` writes both `toggleLocalPin('self', featureId)` and core `setSurfacePinned`; `effectivePinnedIds` prefers non-empty synchronized layout pins, otherwise `useActiveSubTabsStore` pins. The latter persists with Zustand key `gurudevi-active-subtabs-storage` using `SafeZustandStorage`. It is local fallback state, not a v2 intent alias or replay writer.
- **Shared contracts/server:** `WorkspaceLayoutTargetSchema` and row/upsert schemas are in `packages/core/src/logic/schemas/workspace-layout.schema.ts`; v2 envelope/key in `layoutIntent.ts`; group projection/hash/patch schema in `layoutPatch.ts`; target/key resolver in `layoutSync.ts`; receipt parsing/patch preparation/queued command in `outbox.ts`; request/receipt contract in `api/sync.orpc.contract.ts`; reader facade in `api/workspaceLayout.ts`; Supabase reader in `adapters/supabase/workspaceLayoutRepository.ts`; authoritative mutation handler and absent-target default branch in `apps/sanctuary-api/src/core/handlers/sync.ts`. Storage acknowledgement is `storageWrapper.ts::setStorageItemDurably` over `logic/interfaces/storage.port.ts::IStorage.setStringAsync` and its platform adapters.

#### Ownership, overlaps, and evidence

- **Foundation ownership/required touch list:** shared schema/resolver/intent/patch/outbox/replay, native adapter, storage port/adapters, API contract/handler coordination, and their focused tests. Browser owner must approve changes to browser classification, intent/display keys, first-write materialization, or mounted behavior. Mobile/domain owners must approve pin fallback or consumer-contract changes. Server owner must approve handler/receipt/migration work.
- **Device-target overlap:** tablet adds target enum/key/SQL/receipt allow-lists and classification; it must first incorporate the absent-target materialization invariant so tablet cannot create the same fallback-loss path. It must not alter replay identity, retry policy, or automatic conflict handling.
- **Current evidence:** G1 Vitest core v2-intent test `layoutIntent.test.ts` 2/2 and G3 mounted native layout-sync test 7/7 were previously recorded; browser persistence/recovery and API receipt suites are separately recorded in this ledger. The new absent-target/materialization behavior has G0 source evidence only and needs the mounted/API/replay cases listed in its preceding entry. No persistence implementation file changed during this inventory.

### 2026-10-14 — Ownership split agreed: absent-target first-write materialization

- **Foundation accepts ownership:** Foundation owns the shared/native/API/replay side of this bounded lifecycle correction. The invariant is accepted exactly as recorded: read-only fallback never creates a target row; the first mutation after a positively observed absent target and shared/default display fallback prepares one exact target-bound patch containing `arrangement`, `appearance`, and `groups`; patch base hashes come from that absent target's canonical default baseline, while patch values are the displayed fallback with the user's edit; acknowledgement precedes dispatch; queued/replayed work retains the same target, operation ID, idempotency key, input hash, and values; concurrent target creation conflicts rather than being overwritten.
- **Foundation implementation files:** `packages/core/src/native/useWorkspaceLayoutSync.ts` (absent-target/display-fallback state, all-group first patch, identity reset); `packages/core/src/logic/workspace/{layoutPatch,outbox}.ts` only if a small pure helper/test fixture is genuinely needed after avoiding duplication; `apps/sanctuary-api/src/core/handlers/sync.ts` only for an API assertion/bug discovered during the test (the proposed behavior is designed to work with its current default-target branch); `packages/core/src/lib/sync/registry.ts` only if replay validation exposes an actual gap. No schema, storage-port, migration, retry-policy, receipt-semantic, or target-enum modification is authorized by this slice.
- **Foundation evidence files:** `apps/gurudevi-mobile/src/__tests__/integration/workspace-layout-sync.native.test.tsx`; `packages/core/src/logic/workspace/{layoutPatch,outbox}.test.ts` if helper/replay serialization coverage is needed; `apps/sanctuary-api/src/__tests__/workspace-layout-sync.orpc.test.ts`; and the existing mutation queue/registry replay scenario test identified from the live checkout before editing. Tests must prove absent target + fallback + one-group edit becomes all-group exact patch, restart observes target row, no-fallback remains one-group, concurrent target creation conflicts, and replay retains identity/values.
- **Browser-owner implementation/evidence split:** this chat owns `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` plus its browser mounted/persistence tests. It must implement the same invariant without importing `@repo/core/native`, preserve browser local intent/compatibility keys, and cover shared fallback, first edit, reload, no-fallback, concurrent creation/conflict, and queued patch identity. It does not own core schema/server/replay changes.
- **Coordination/dependency rule:** Foundation and browser changes may share only the explicit patch-level invariant and test vectors. Any discovered need to change `WorkspaceLayoutIntent`, patch/outbox schema, receipt contract, storage acknowledgement, target resolver, or SQL migration pauses this slice and returns to the device-target impact review. Code remains frozen until the two owners acknowledge this entry and each declares its first concrete files/tests.
- **Evidence:** G0 ownership and source-path reconciliation only; no implementation file changed by this agreement.

### 2026-10-14 — Materialization slice paused: pre-hydration edit race

- **New invariant needed before implementation:** A target-absent marker is only trustworthy after the target read completes. Preparing or dispatching a first-write materialization before that result risks treating an unknown target as absent and fabricating a default baseline. The browser adapter has an explicit edit-during-pending-hydration scenario; native setters can also receive updates before its hydration identity has settled.
- **Rejected partial fix:** Merely gate remote dispatch while retaining the existing pre-hydration local state is insufficient for durable first-write materialization. The v2 intent requires complete patch values, and an incomplete/default snapshot cannot truthfully preserve a not-yet-read shared display baseline. Queuing such a patch would persist the wrong exact operation identity.
- **Safe choices to resolve:** (a) block/disable layout mutation entry points until that identity has completed target/fallback hydration, leaving read-only display/loading state explicit; or (b) introduce a separately specified durable pre-hydration delta/overlay record that is merged only after hydration, which is a shared intent-contract expansion and outside the currently authorized slice. Foundation recommends (a) for this bounded hardening work; existing hook consumers already receive `isHydrated`, but each editing consumer must be audited before claiming the gate is enforced.
- **Required offline/read-failure semantics:** No remote dispatch or queue admission may happen until authoritative target presence is known for the identity. A read failure/offline state may display a cached local snapshot but cannot prepare an absent-target materialization patch; it must surface the existing recoverable error/offline state and wait for a successful target/fallback hydration before first-write materialization. This is not an automatic conflict replay.
- **Status:** The initial native implementation experiment and its new mounted case are not accepted as completed work; no further implementation changes proceed until browser and Foundation agree on the mutation-entry gating/consumer contract. The implementation diff will be reviewed and corrected only after that decision.
- **Evidence:** G0 lifecycle analysis against the current browser/native hydration and exact-patch paths. No completion or test-pass claim is made.

### 2026-10-14 — Materialization upgrade path: legacy prepared-patch constraint

- **Critical legacy/restart case:** A pre-fix v2 intent can already contain an acknowledged exact one-group `pendingPatch` while the target is absent and display is shared. Replacing it with an all-group patch changes operation ID, idempotency key, and canonical input hash, violating response-loss idempotency. Replaying it unchanged can still create the partial target row. This case rules out a client-only materialization change that lacks durable upgrade metadata.
- **Implication:** A safe client follow-up needs a durable marker associated with the old pending operation, so after it settles the client can read the created target row and prepare a second full snapshot patch using the stored envelope values. Adding that marker expands the v2 intent contract and needs a fresh shared-contract review. Without it, restart between settlement and follow-up loses the evidence that the target must be completed.
- **Alternative requiring separate server design:** The handler could materialize shared fallback values atomically on first target-row creation while accepting the historical default-derived base hash for the submitted changed group. That centralizes compatibility for legacy queued patches but changes absent-target server semantics and must define locking, conflict, hash, and receipt behavior explicitly; it is not authorized as an incidental client fix.
- **Decision/status:** Foundation does not accept the originally proposed client-only slice as implementation-ready. The experimental native edit and failing test were reverted before completion. Code is frozen pending an explicit decision between a versioned durable-intent upgrade path and a server-side first-row materialization protocol, followed by a new impact/evidence plan.
- **Required evidence whichever option is selected:** response loss/restart before old patch dispatch, after server settlement but before follow-up, and after follow-up; old queued command replay; concurrent target creation; no shared fallback; and exact receipt/idempotency verification. No old prepared patch may be silently deleted, rewritten, or relabeled.

### 2026-10-14 — Foundation review: server-side first-row materialization protocol

- **Decision:** The server-side protocol is preferred over client-side all-group materialization. It preserves legacy/current exact prepared patches, pre-hydration edits, offline queue payloads, operation IDs, idempotency keys, and input hashes without a v2 intent migration. It supersedes the paused client-only proposal if the following separation is implemented exactly.
- **Assessment/application separation:** When a non-`shared` target row is absent, keep `canonicalCurrent` as the target's canonical default for base-revision and group-hash assessment—this matches the default-derived hashes used by existing clients. Separately read/normalize the current `shared` row, if any, as `applicationBase`; apply the accepted named changes to `applicationBase` before upsert. If shared is absent, application base remains canonical default. Thus a historical appearance-only patch creates a target row with shared arrangement/groups plus its new appearance, without changing the patch's identity or acceptance hash.
- **Locking review:** Existing writes take an exclusive transaction advisory lock keyed by `userId:workspaceId:layoutTarget`. For an absent, non-shared target only, acquire the existing target lock first, then the `shared` key before selecting shared fallback. Shared writes acquire only the shared key, and other absent-target writers acquire distinct target keys then shared; with the current handler there is no reverse `shared → target` acquisition, so this graph has no cycle. `pg_advisory_xact_lock` is transaction-scoped and waits for conflicting owners; PostgreSQL `READ COMMITTED` gives each subsequent command a fresh committed snapshot, so the shared select after lock acquisition observes the preceding shared writer's commit. Retain `FOR UPDATE` on the selected shared row as a defense for any direct row writer; do not introduce a reverse lock order later without revisiting this proof. [PostgreSQL advisory-lock documentation](https://www.postgresql.org/docs/18/functions-admin.html), [PostgreSQL Read Committed documentation](https://www.postgresql.org/docs/14/transaction-iso.html)
- **Conflict rule:** If a target row exists after the target lock is acquired, use it as both assessment and application base; normal group conflict behavior applies. The shared fallback is never merged into an existing target row. Concurrent target creation serializes on the target key; concurrent shared mutation serializes before the fallback snapshot is read. No automatic replay or client patch rewriting is introduced.
- **Bounded impact:** `apps/sanctuary-api/src/core/handlers/sync.ts` plus `apps/sanctuary-api/src/__tests__/workspace-layout-sync.orpc.test.ts` are the only required implementation/evidence files for the protocol. Native/browser/client/replay contracts need regression evidence only and no semantic code change. This is a server behavior change and requires explicit server-owner acknowledgement before implementation.
- **Required tests:** absent target + shared row + legacy one-group appearance patch preserves shared arrangement/groups; absent target without shared uses defaults; existing target still produces the ordinary group conflict; replay returns the same receipt for the unchanged operation; advisory-lock ordering is covered at least by an integration/concurrency harness or documented as an environment-level limitation. Confirm the deployed transaction isolation remains PostgreSQL default `READ COMMITTED` before claiming the concurrent shared-write assertion.
- **Evidence:** G0 source/transaction-semantics review. No implementation changed in this review.

### 2026-10-14 — Server-owner acknowledgement gate

- **Verified ownership:** `.github/CODEOWNERS` assigns `apps/sanctuary-api/` to `@NeevSK` (and also names that account as the global fallback). The repository does not establish whether the current human user is `@NeevSK`; Foundation must not infer that identity or treat cross-chat agreement as code-owner approval.
- **Current checkout caution:** At this checkpoint `apps/sanctuary-api/src/core/handlers/sync.ts` is modified and `apps/sanctuary-api/src/__tests__/workspace-layout-sync.orpc.test.ts` is untracked in the shared checkout. Foundation did not author either change and will not inspect, modify, validate, or claim them until their owner and intended protocol are explicitly acknowledged.
- **Gate:** No server handler/code-contract edit may proceed from this Foundation stream until `@NeevSK` (or the human explicitly identifying themselves as that server owner) acknowledges the first-row materialization protocol and the existing shared-checkout delta is attributed. Browser work is regression-only and must keep all client/replay/contract files untouched.

### 2026-10-14 — Server owner authorized; implementation handed to Explain Gurudevi

- **Human authorization:** Naveen explicitly confirmed they are `@NeevSK` and authorized the server-side first-row materialization protocol.
- **Implementation handoff:** Per the owner's direction, the active `Explain Gurudevi` chat (`01a12bd0-963b-7e82-acda-0415699cb055`) owns the server/API implementation and current shared-checkout delta in `apps/sanctuary-api/src/core/handlers/sync.ts` and `apps/sanctuary-api/src/__tests__/workspace-layout-sync.orpc.test.ts`. That chat has received the bounded protocol, file ownership request, and required tests.
- **Foundation boundary:** Foundation does not edit server files. It will review the reported raw delta and evidence once the server chat attributes its changes. Browser remains regression-only; shared client, replay, intent, and contract files remain untouched by this server slice.

### 2026-10-14 — Browser owner acknowledgement: absent-target first-write materialization

- **Browser-owned implementation files:** `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` and `apps/gurudevi-web/tests/unit/canvas/useBrowserWorkspaceAppearance.persistence.test.tsx`. The browser adapter will use the existing v2 intent and compatibility keys; no import from `@repo/core/native` and no schema/server/replay/storage-port change is included.
- **Browser mounted acceptance cases:** (1) target row absent with shared display fallback, then an appearance-only edit produces an exact patch with all three named groups, default-target base hashes, and displayed fallback values plus the local appearance change; (2) remote absence without shared fallback retains the normal one-group patch; (3) response-loss remount preserves the exact materialization patch and operation identity; (4) a target created by another client after fallback hydration returns conflict and does not silently overwrite; explicit reapply fetches the new target base; (5) account/workspace/target switching cannot carry the absent-target marker or dirty materialization into a different identity. Foundation owns API acceptance of the default-hash all-group patch, native equivalents, and outbox replay identity/value preservation.
- **Current evidence:** The mounted persistence suite already covers the browser harness, target-absent shared fallback for a one-group write, remount with a pending operation, in-flight target switching, and explicit conflict recovery. It does not yet prove all-group first-write materialization or its cross-client race; those assertions must be added. G0 source inspection only; no implementation changed as part of this ownership declaration.
- **Coordination:** This is the browser owner’s concrete file/test acknowledgement requested in the Foundation split. Foundation may begin its disjoint native/core/API/replay implementation. Before any new schema, patch/outbox contract, target resolver, storage acknowledgement, receipt, or SQL change, stop and reopen the impact review.

### 2026-10-14 — Browser scope revised: server-side first-row protocol

- **Supersedes for implementation:** The earlier browser-owned all-group patch construction cases are no longer the selected fix. They were unsafe for an already-prepared one-group pending patch and pre-hydration edits. Preserve those exact client patches and implement first-row inheritance at the server boundary instead.
- **Browser regression evidence only:** Keep `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts` and its mounted persistence test unchanged unless a failing regression proves a browser defect. Add/retain tests showing that (1) a legacy/current one-group patch remains byte/identity stable through remount and queueing; (2) server acceptance of that exact patch on an absent target preserves other fields from shared fallback; (3) an existing target still returns ordinary conflict; and (4) an absent target with no shared row materializes from defaults. Foundation owns API behavior and test; browser owns only the mounted/client identity assertion if the API integration harness cannot prove it.
- **Ownership gate:** `apps/sanctuary-api/` is assigned to `@NeevSK` by `.github/CODEOWNERS`. Foundation's review requires explicit server-owner acknowledgement before changing `sync.ts`; no server implementation has started. The server owner must confirm the assessment/application split and advisory-lock ordering in the preceding protocol entry.
- **Evidence:** G0 design/source review only. No browser or server implementation changed for this revised protocol.

### 2026-10-13 — Browser floor recovery affordance propagation

- **Change:** The non-Self Sanctuary Workspace, Profile, Library, and Community browser floors now receive `conflict`, sync status, and the existing `reapplyLocalChanges` action through their canvas hooks. A shared control surfaces an accessible user retry for conflict/error/offline states and reports a failed retry. A conflict status alone is treated as a conflict even if the separate error object is absent.
- **Scope:** This is consumer UX only. It does not modify storage, intent schemas/keys, mutation scheduling, retry policy, durable queue/replay, or conflict rebase semantics. No automatic replay was added. Browser full arrangement parity remains a separate feature gap.
- **Evidence:** G3 / Vitest 5.0.0 / jsdom mounted component — `workspaceLayoutRecoveryControl.test.tsx` + `workspaceLayoutRecoveryNotice.test.tsx`: 5/5 passed, covering explicit retry, failed retry feedback/retryability, conflict-status visibility, and healthy-state absence. Scoped Biome and `git diff --check` passed on the touched paths.
- **Typecheck limit:** `pnpm --filter gurudevi-web check-types` remains nonzero on generated `.next/types` route mismatches, auth implicit-any, host-routing, missing GrowthBook declarations, and unrelated core module-resolution errors; no diagnostic names the recovery hooks/control/floors.
- **Hostile-review limit:** Tests mount the shared control, not all four full floor trees; responsive browser rendering and actual cross-tab/server conflict scenarios remain unproven. Existing unrelated floor changes are present in the shared checkout and are not evidence for this recovery slice.
