# Gurudevi — Architecture Decision Record & Solution Spec
> Draft 1 — June 2026 — first iteration, expect revision

---

## Part 1 — Architecture Decision Records

Each ADR captures one settled decision: the context, what was decided, what alternatives were considered, and what consequences follow. These are the stable anchors. The spec in Part 2 references them rather than re-arguing them.

---

### ADR-001 — One SQLite file per account, three zones by sync semantics

**Context**

The system must support multiple accounts on a single device. Each account may be a different user entirely (two teachers sharing a phone) or the same user in a different role. Data must not bleed across account boundaries. The device runs on ~2GB RAM with unreliable network.

**Decision**

Each account gets its own SQLite file, named `gurudevi-powersync-{accountId}.db`, encrypted with a per-account SQLCipher key stored in Expo SecureStore. Within each file, all data is organised into three zones by sync semantics — not by file, not by table prefix.

- **Zone A** — sovereign core. PowerSync-replicated tables. Attendance, students, classrooms, bonds, grades, permission snapshots, policy version.
- **Zone B** — social. Local-only tables, direct API sync. Posts, comments, reactions, votes, circles, announcements.
- **Zone C** — messaging. Local-only tables, WebSocket + REST sync. DMs, group messages, channels, message status.

All three zones are declared in one `AppSchema`. `useLiveQuery` works uniformly across all zones.

**Alternatives considered**

- Single file with `accountId` column prefix on all tables — simpler, but shares one SQLCipher key across accounts. Unacceptable for isolation.
- Separate files per zone — unnecessary complexity, breaks cross-zone joins (e.g. a message referencing a student bond), and fragments the reactivity model.

**Consequences**

- Account swap requires drain → disconnect → key swap → reboot of PowerSync instance.
- N accounts on one device means N SQLite files. Storage pressure is real on low-end devices; cache eviction (ADR-011) must account for total device storage across all account files.
- Cross-zone SQLite joins work locally because all zones share one file per account.

---

### ADR-002 — Zone B and Zone C as local_only in AppSchema, direct API for network sync

**Context**

The original draft architecture proposed Zone B/C go through PowerSync replication. The concern was PowerSync tier limits. Investigation revealed PowerSync bills on GB synced and data hosted — not row count. However, a high-volume social feed (posts, comments, reactions, DMs) at scale would generate significant GB synced costs through PowerSync replication, and the architectural benefit does not justify that cost.

**Decision**

Zone B and Zone C tables are declared in `AppSchema` with `local_only: true`. PowerSync manages the SQLite runtime and fires change notifications for these tables, giving `useLiveQuery` reactivity without any replication. Network sync for Zone B/C is handled directly — Zone B via REST API, Zone C via WebSocket + REST. PowerSync replication is strictly Zone A.

**Alternatives considered**

- Full PowerSync replication for all zones — one sync model, but GB cost risk at scale and architectural coupling of social/messaging lifecycle to PowerSync connector.
- Separate SQLite file for Zone B/C with a different ORM — two reactivity models, two mental models, cross-zone join broken. Rejected.
- MMKV JSON cache for Zone B/C — flat JSON blobs for relational data. Rejected as incoherent.

**Consequences**

- Zone B/C network sync must be implemented separately from PowerSync. This means a Zone B REST sync layer and a Zone C WebSocket manager.
- Offline write contract for Zone B/C: writes are queued locally with `status: queued`, not silently dropped. User is prompted to review queued items on reconnect (see ADR-008).
- PowerSync free tier / self-hosted instance covers Zone A comfortably at early Gurudevi scale.

---

### ADR-003 — Cross-tenant circles via explicit scope field, tenant boundary permeable at Zone B only

**Context**

Gurudevi is multi-tenant — each school is a tenant. Supabase RLS enforces tenant boundaries at the database layer. However, the product requires cross-school social circles — a "Mathematics Teachers Sri Lanka" circle whose members span multiple tenants.

**Decision**

Zone B tables carry an explicit `scope` field with two values: `tenant` (school-scoped, default) or `global` (cross-tenant). Cedar policies and RLS rules handle both cases explicitly. Zone A and Zone C remain strictly tenant-scoped. The tenant boundary is permeable only at Zone B, only for `scope: global` resources, and only for read and participation — a teacher in School A cannot administer a circle owned by School B.

**Alternatives considered**

- Hard tenant boundary everywhere — simpler, but blocks a real product requirement.
- Soft boundary via application-layer filtering only — no RLS enforcement. Rejected as a security risk.

**Consequences**

- Zone B schema must include `scope` and `tenantId` (nullable for global) from day one. Retrofitting this is painful.
- Cedar policies need two rule paths per Zone B action — one for tenant-scoped resources, one for global.
- PowerSync sync rules for Zone A must not leak global circle membership into tenant-scoped replication.

---

### ADR-004 — Capability token per operation context, not per write

**Context**

The original Cedar integration evaluated permissions on every individual write. For bulk operations — marking attendance for 30 students — this means 30 Cedar evaluations at ~5ms each, adding ~150ms of policy evaluation to one UI action. Unacceptable on low-end devices.

**Decision**

Cedar evaluates once per *operation context*, not per write. An operation context is a semantically coherent user intent — "mark attendance for this classroom session", "post to this circle", "send a message in this channel". The evaluation returns a scoped capability token: `{ accountId, tenantId, bondCapacity, operationContext, deviceId, issuedAt, expiresAt }`. All writes within that context use the token without re-evaluation. The token expires on navigation away, explicit invalidation, or TTL.

**Alternatives considered**

- Per-write evaluation — correct but ~150ms for bulk operations. Rejected on performance grounds.
- No local Cedar evaluation, server-only — breaks offline-first. Rejected.
- Cache Cedar result by resource ID — more complex cache invalidation, same token concept with worse ergonomics. Rejected.

**Consequences**

- The SecureDrizzleProxy must accept and validate a capability token, not invoke Cedar itself.
- Token issuance happens at the hook level when an operation context is entered (e.g. opening an attendance screen).
- Token must be invalidated on account swap, logout, and policy version change.

---

### ADR-005 — Cedar WASM loaded once at module scope, server-signed snapshots

**Context**

Current implementation dynamically imports `@cedar-policy/cedar-wasm/web` inside `checkLocalPermission` on every call. JS engines cache module resolution but this is not guaranteed across all Hermes versions. Repeated dynamic import resolution adds latency on every permission check.

**Decision**

The Cedar `evaluate` function is imported once at module scope and stored as a module-level singleton. Policy snapshots are server-generated, HMAC-signed, and stored in the existing `permission_snapshots` table in Zone A. The client trusts the HMAC signature, not the content independently. On first load and after invalidation, the client fetches a fresh snapshot from the server. Between fetches, it evaluates against the cached snapshot.

**Alternatives considered**

- Per-call dynamic import — current state. Works but non-deterministic latency. Rejected.
- Server-only Cedar evaluation — correct but breaks offline permission enforcement. Rejected.
- CASL as local evaluation fallback — introduces a second policy language. Rejected.

**Consequences**

- WASM module must be warmed eagerly at app boot, not lazily on first permission check.
- Snapshot fetch must happen before any Cedar evaluation can run. App must handle the "snapshot not yet loaded" state gracefully — queue writes, do not silently permit or deny.
- The `.cedarschema` bundled in the mobile client must stay in sync with the server schema. Divergence causes silent offline/online evaluation differences.

---

### ADR-006 — Policy version invalidation via Zone A PowerSync sync

**Context**

The `permission_snapshots` table has `expiresAt` but no push invalidation mechanism. Polling `expiresAt` means a policy change takes up to the TTL duration to propagate to clients. For security-sensitive policy changes — revoking a teacher's bond — that lag is unacceptable.

**Decision**

A `policy_version` record is added to Zone A as a PowerSync-synced table. When server-side Cedar policies change, the server increments `policy_version.hash`. PowerSync propagates this change to all connected clients in real time. The client detects the version change via `useLiveQuery` on `policy_version`, invalidates the local snapshot, and fetches a fresh one. The current capability token (ADR-004) is also invalidated immediately.

**Alternatives considered**

- Polling `expiresAt` only — simple but slow propagation. Rejected for security-sensitive changes.
- Push notification via separate WebSocket — another connection to manage. Rejected when PowerSync already carries the channel.
- Short TTL (e.g. 60 seconds) on all snapshots — acceptable latency but hammers the snapshot endpoint. Rejected.

**Consequences**

- `policy_version` table must be in Zone A schema from day one.
- Client must handle the invalidation → fetch → resume window gracefully. Writes during this window queue rather than evaluate against a stale snapshot.
- Server must increment `policy_version` atomically with any policy change.

---

### ADR-007 — One PowerSync instance per account, drain-before-swap protocol

**Context**

Current implementation has a singleton leak: `PowerSyncProvider.tsx` and `database.ts` hold separate references to the PowerSync instance. `disconnectPowerSync()` clears `database.ts`'s reference but not the provider's. Multi-account support requires safe instance swap.

**Decision**

`database.ts` is the single source of truth for the PowerSync instance. `PowerSyncProvider.tsx` reads from `database.ts`, holds no independent reference. Account swap follows a strict protocol:

1. Await `ps_crud` count = 0 AND `currentStatus.uploading = false` (with timeout).
2. On timeout, surface a user-visible "syncing, please wait" indicator — do not force-disconnect with pending mutations.
3. Disconnect PowerSync, clear `database.ts` reference.
4. Load new account's SQLCipher key from SecureStore.
5. Boot new PowerSync instance against new account's SQLite file.
6. Invalidate all capability tokens and Cedar snapshots for previous account.

**Alternatives considered**

- Force disconnect without drain — risks silent data loss. Rejected.
- Hot-swap without disconnect — two PowerSync instances running simultaneously on a 2GB RAM device. Rejected.

**Consequences**

- Account swap is not instant. UX must communicate this honestly.
- `awaitSyncDrain(timeoutMs)` utility must be implemented and tested.
- `disconnectPowerSync()` must notify the provider. Shared module reference or event.

---

### ADR-008 — Outbox identity: accountId + deviceId + localSeq

**Context**

Multi-device support (same account, multiple devices) means the same queued post or message could be sent from two devices when both come online. Simple UUIDs generated on-device are not sufficient for cross-device deduplication.

**Decision**

Every queued Zone B/C write gets an idempotency key composed of `accountId + deviceId + localSeq`. The server deduplicates on `accountId + localSeq` — if Device A sends `user123:deviceA:42` and Device B sends the same logical item as `user123:deviceB:42`, the server accepts whichever arrives first and rejects the second with a 409 that the client handles gracefully (marks local item as `synced`, no error shown to user).

The offline write flow: write attempt → offline detected → insert to local Zone B/C table with `status: queued` and idempotency key → on reconnect, surface queued items as a review prompt (resend / edit / discard) before auto-sending.

**Alternatives considered**

- Auto-send all queued items on reconnect without prompt — risks sending a stale message written hours ago that the user no longer intends. Rejected given the product's social context.
- UUID only — no cross-device deduplication guarantee. Rejected.

**Consequences**

- `deviceId` must be generated at first install and persisted in SecureStore, independent of account.
- `localSeq` is a per-account, per-device monotonic counter stored locally.
- The review prompt UI is a product requirement, not just a nice-to-have.

---

### ADR-009 — Three hexagonal ports, short-circuit order: entitlement → Cedar → feature flag

> **SUPERSEDED (2026-07-26).** The evaluation order in this ADR (entitlement → Cedar → feature flag) was superseded by [Gurudevi Mobile ADR-005 — Feature Gate Order and Context Ownership](../../apps/gurudevi-mobile/docs/decisions/005-feature-gate-order-and-context-ownership.md). Cedar is now evaluated *before* entitlement: Cedar is the authoritative security boundary, entitlement never grants authorization, and the client must not surface commercial denial information ahead of authorization. The three-port separation, the server-sourced pricing-manifest rule, and the offline-behaviour consequences in this ADR remain valid.

**Context**

Three orthogonal control planes answer different questions about whether an action is permitted: entitlement (has the tenant paid?), Cedar authZ (does this principal have structural permission?), feature flags (is this code path active for this cohort?). Without explicit coordination these checks scatter through the codebase, creating split-brain authorization bugs.

**Decision**

Three clean port interfaces in `packages/core/src/logic/ports/`:

- `IEntitlementPort` — tenant-level capability check. Reads from local cache of server-sourced pricing manifest. Synchronous after initial load.
- `IAuthzPort` — Cedar structural permission check. Uses capability token (ADR-004) or issues one. Async, WASM-backed.
- `IFeatureRolloutPort` — feature flag check. GrowthBook or equivalent. Synchronous against local flag cache. Offline default: fail open (feature active) unless flag is explicitly a kill-switch, in which case fail closed.

Evaluation order is strict and short-circuits: entitlement first (cheapest, no WASM, no network), Cedar second, feature flag third. A false at any stage stops evaluation immediately.

The pricing manifest is server-sourced and locally cached — not a compile-time TypeScript constant. It is treated like a Cedar snapshot: server-signed, stored locally, invalidated via version field in Zone A.

**Alternatives considered**

- Single unified permission check combining all three — hides the domain separation, makes testing harder. Rejected.
- Feature flags checked before Cedar — feature flags are operational concerns, not security concerns. Entitlement and Cedar are structural. Order matters. Rejected.
- Compile-time pricing manifest — drift vector between server and client on pricing changes. Rejected.

**Consequences**

- All three ports must have defined offline behaviour from day one.
- `active_capabilities` in Cedar principal context must not carry pricing tier derivatives — Cedar sees structural attributes only. Pricing translation happens inside `IEntitlementPort`, not inside Cedar policies.
- Ghost flag bug is a real risk: if a feature flag remains after a capability is migrated to Cedar, it will block execution. Removal checklist needed when graduating flags to Cedar rules.

---

### ADR-010 — SovereignBus as Zustand sync slice

**Context**

PowerSync fires sync events (`syncing`, `sync_complete`, `upload_error`) that need to gate React Query invalidations. Without coordination, React Query fires concurrent REST fetches during heavy PowerSync sync phases, causing thread congestion and network competition on patchy connections. "SovereignBus" was named in prior documents as the solution but left undefined.

**Decision**

SovereignBus is a Zustand slice — not a separate event emitter library, not a pub/sub system. The slice holds: `{ isSyncing: boolean, uploadQueueDepth: number, lastSyncComplete: Date | null, syncError: string | null }`. A PowerSync `registerListener` call in `database.ts` updates this slice on every status change. React Query hooks read from this slice via `useStore` to gate background refetches — no refetch while `isSyncing: true`, trigger invalidation on `lastSyncComplete` change via `useThrottledInvalidate` from TanStack Pacer.

**Alternatives considered**

- Separate event emitter (mitt, EventEmitter3) — another dependency, another mental model. Zustand is already in the stack. Rejected.
- React Query's own `NetworkMode` — controls online/offline behaviour but not PowerSync sync phase awareness. Not sufficient alone.

**Consequences**

- `uploadQueueDepth` is derived from `SELECT count(*) FROM ps_crud` and polled on a short interval or updated via listener — needs benchmarking to avoid polling overhead.
- All React Query hooks that read Zone A data must check `isSyncing` before triggering background refetches.

---

### ADR-011 — Cache eviction: configurable TTL within storage-aware ceiling

**Context**

Zone B/C data accumulates locally indefinitely without eviction. On 2GB RAM devices with multiple accounts, this causes storage pressure. The product requires teachers to read historical content offline (full history for messaging, full feed history), but this must be bounded by device reality.

**Decision**

Cache eviction runs per account SQLite file on a background schedule. TTL is configurable per zone within bounds defined by the platform:

- Zone B (social feed): default 30 days, user-configurable 7–90 days.
- Zone C (messaging): default 60 days, user-configurable 14–180 days.

A hard ceiling overrides user preference: if available device storage falls below a threshold (TBD, suggested 500MB free), eviction runs immediately at minimum TTL regardless of user setting. Eviction is per-account — multiple accounts on one device compete for storage and the ceiling applies to total device storage, not per-account.

**Alternatives considered**

- Full history, no eviction — untenable on 2GB RAM devices at scale. Rejected.
- Fixed TTL, not configurable — simpler but ignores the real diversity of teacher use patterns. Rejected.
- Per-account storage quota — cleaner isolation but harder to implement against device-level storage APIs. Deferred to v2.

**Consequences**

- Eviction job must be storage-aware, not just time-aware.
- User-facing setting: one control per zone maximum. No more complexity than that.
- Eviction must not delete queued (unsent) items regardless of TTL.

---

### ADR-012 — AI streaming: test native Hermes ReadableStream before adding polyfill

**Context**

`@tanstack/ai-react`'s `useChat` requires `Response.body` to be a compliant `ReadableStream`. React Native's global `fetch` has historically not supported this. No fetch polyfill is currently in the codebase. Expo 56 / RN 0.85 / Hermes v1 may have partial or full native support.

**Decision**

Before adding any dependency, verify native `Response.body.getReader()` works in the current Hermes version with a minimal test. If it works: no polyfill needed, proceed. If it does not: add `react-native-fetch-api` as the minimal polyfill, applied at app entry point to replace the global `fetch`. Do not build a custom transport adapter unless neither path works.

**Alternatives considered**

- Add `react-native-fetch-api` immediately — adds a dependency we may not need. Rejected until tested.
- Custom transport adapter — more control but significant work for no gain if the polyfill suffices. Deferred.
- `expo-background-task` — wrong tool, handles background execution scheduling not streaming transport. Rejected.

**Consequences**

- This is the only ADR with an open implementation question. It must be resolved before any AI streaming feature is built.
- The streaming architecture (buffer tokens in volatile state, flush to SQLite only on stream completion) is settled regardless of transport mechanism.

---

## Part 2 — Solution Spec

> This spec references ADR entries rather than re-arguing decisions. Read Part 1 first.

---

### 2.1 Data topology

Three zones, one SQLite file per account. See ADR-001, ADR-002, ADR-003.

**Zone A — sovereign core (PowerSync replicated)**

```
students          — tenant-scoped
classrooms        — tenant-scoped
attendance        — tenant-scoped
bonds             — tenant-scoped, perspective roles
grades            — tenant-scoped
permission_snapshots — per account, HMAC-signed Cedar policies
policy_version    — per tenant, triggers snapshot invalidation
pricing_manifest  — per tenant, server-sourced entitlement data
```

**Zone B — social (local_only, direct REST sync)**

```
circles           — scope: tenant | global
posts             — circleId, authorId, tenantId, scope
comments          — postId, authorId
reactions         — postId | commentId, type
votes             — postId, direction
announcements     — tenantId
outbox_social     — queued Zone B writes, idempotency key
```

**Zone C — messaging (local_only, WebSocket + REST sync)**

```
channels          — tenantId, type: dm | group
messages          — channelId, senderId, status: queued | sending | sent | synced
channel_members   — channelId, userId
outbox_messages   — queued Zone C writes, idempotency key
```

All tables registered in one `AppSchema`. `local_only: true` on Zone B and Zone C tables.

---

### 2.2 PowerSync instance lifecycle

See ADR-007.

`database.ts` owns the singleton. `PowerSyncProvider.tsx` holds no independent reference — it calls `database.ts` exports only.

```
boot sequence:
  1. load accountId from auth store
  2. load SQLCipher key from SecureStore(gurudevi-sqlite-cipher-key-{accountId})
  3. open SQLite file: gurudevi-powersync-{accountId}.db
  4. register PowerSync listener → update SovereignBus Zustand slice
  5. connect PowerSync

account swap sequence:
  1. call awaitSyncDrain(30_000) — poll ps_crud count + uploading status
  2. if timeout: surface UI indicator, do not force-disconnect
  3. disconnect PowerSync
  4. clear database.ts singleton reference
  5. invalidate all capability tokens and Cedar snapshots
  6. run boot sequence for new accountId
```

---

### 2.3 Hexagonal authorization layer

See ADR-009, ADR-004, ADR-005, ADR-006.

**Port interfaces** in `packages/core/src/logic/ports/`:

```typescript
// IEntitlementPort — has tenant paid for this capability?
interface IEntitlementPort {
  getCapabilities(tenantId: string): Promise<TenantCapabilities>
  // local cache backed by pricing_manifest Zone A table
  // server-signed, version-invalidated same as Cedar snapshot
}

// IAuthzPort — does this principal have structural permission?
interface IAuthzPort {
  issueCapabilityToken(
    principalId: string,
    operationContext: OperationContext
  ): Promise<CapabilityToken>
  isPermitted(token: CapabilityToken, action: string, resourceId: string): boolean
}

// IFeatureRolloutPort — is this code path active for this cohort?
interface IFeatureRolloutPort {
  isFeatureActive(flagKey: string, attributes?: Record<string, unknown>): boolean
  // offline default: fail open unless flag tagged kill-switch
}
```

**Short-circuit evaluation order:**

```
1. IEntitlementPort.getCapabilities → if capability absent: stop, show upgrade prompt
2. IAuthzPort.issueCapabilityToken or validate existing token → if denied: stop, show permission error
3. IFeatureRolloutPort.isFeatureActive → if inactive: stop, show unavailable state
4. proceed with operation, use capability token for all writes in context
```

**Cedar context decoration — what the WASM evaluator receives:**

```json
{
  "principal": {
    "id": "User::\"accountId\"",
    "attributes": {
      "capacity": "teacher",
      "tenantId": "School::\"school_id\"",
      "deviceTrustStatus": "trusted"
    }
  },
  "action": "Action::\"MarkAttendance\"",
  "resource": {
    "id": "Classroom::\"classroom_id\"",
    "attributes": {
      "tenantId": "School::\"school_id\""
    }
  },
  "context": {
    "operationContext": "attendance_session",
    "tokenIssuedAt": 1234567890,
    "tokenExpiresAt": 1234568490
  }
}
```

Note: no pricing tier attributes in Cedar context. Entitlement is resolved before Cedar is invoked.

**Snapshot invalidation flow:**

```
PowerSync syncs policy_version change to Zone A
  → useLiveQuery on policy_version fires
  → invalidate current Cedar snapshot
  → invalidate current capability tokens
  → fetch fresh snapshot from server
  → server returns HMAC-signed snapshot
  → store in permission_snapshots table
  → resume queued writes
```

---

### 2.4 Offline write contract — Zone B and Zone C

See ADR-008, ADR-002.

**Write attempt flow:**

```
user triggers write (post, comment, message)
  → check network status
  → if online:
      validate capability token
      write to local SQLite (optimistic, status: sending)
      POST/WS to API
      on success: update status to synced
      on failure: update status to queued, surface error
  → if offline:
      validate capability token (local snapshot)
      write to local SQLite (status: queued)
      write idempotency key: accountId-deviceId-localSeq
      no error shown — queued indicator shown instead
```

**Reconnect flow:**

```
network restored
  → query outbox_social and outbox_messages for status: queued
  → if any found: surface review prompt
      show each queued item with: send / edit / discard options
      do not auto-send without user confirmation
  → on send: POST to API with idempotency key
      server 409 (duplicate): mark local as synced silently
      server 2xx: mark local as synced
      server 4xx/5xx: mark as failed, allow retry
```

---

### 2.5 SovereignBus — Zustand sync slice

See ADR-010.

```typescript
// slice shape
interface SyncSlice {
  isSyncing: boolean
  uploadQueueDepth: number
  lastSyncComplete: Date | null
  syncError: string | null
}

// wired in database.ts on PowerSync boot
powersyncInstance.registerListener({
  statusChanged: (status) => {
    useSyncStore.setState({
      isSyncing: status.uploading || status.downloading,
      uploadQueueDepth: status.uploadQueueDepth ?? 0,
      lastSyncComplete: status.lastSyncedAt ?? null,
      syncError: status.uploadError ?? null,
    })
  }
})
```

React Query hooks gate background refetches:

```typescript
// inside any Zone A React Query hook
const isSyncing = useSyncStore(s => s.isSyncing)
const lastSyncComplete = useSyncStore(s => s.lastSyncComplete)

useEffect(() => {
  if (!isSyncing && lastSyncComplete) {
    throttledInvalidate(['zone-a-query-key'])
  }
}, [isSyncing, lastSyncComplete])
```

---

### 2.6 Cache eviction

See ADR-011.

Eviction runs as a background job on app foreground. Per account SQLite file. Does not evict `status: queued` items regardless of TTL.

```
Zone B default TTL: 30 days (user range: 7–90)
Zone C default TTL: 60 days (user range: 14–180)
storage ceiling: if device free storage < 500MB, run at minimum TTL
```

User setting: one control per zone in settings screen. Represented as a slider or segmented control — not a text input.

---

### 2.7 AI streaming

See ADR-012.

Architecture is settled regardless of transport:

```
user triggers AI request
  → useChat from @tanstack/ai-react fires
  → tokens arrive via ReadableStream
  → each token: append to volatile React state (setStreamedContent)
  → do NOT write to SQLite per token
  → on stream complete: single db.insert() to aiInsightsTable
  → invalidate relevant React Query keys
  → on stream interrupted (navigation, call): cancel reader, 
     write partial content with status: interrupted
```

Transport resolution (must be tested before implementation):

```
test: Response.body.getReader() in current Hermes version
  → works natively: no polyfill needed
  → fails: add react-native-fetch-api, polyfill global fetch at app entry
```

---

### 2.8 Open questions — requires resolution before implementation

These are not architectural decisions yet. They need a product answer or a technical test.

| # | Question | Blocks |
|---|----------|--------|
| Q1 | Does `Response.body.getReader()` work in current Hermes? | ADR-012, all AI features |
| Q2 | What is the storage ceiling threshold for forced eviction? | ADR-011 |
| Q3 | Is the reconnect review prompt per-item or consolidated (one review surface for all queued items)? | ADR-008, outbox UX |
| Q4 | What is the `policy_version` increment mechanism on the server — manual deploy step or automatic on policy file change? | ADR-006 |
| Q5 | GrowthBook or alternative for feature flags — confirmed tooling? | ADR-009, IFeatureRolloutPort adapter |
| Q6 | Self-hosted PowerSync — is this the intended deployment path from launch, or cloud first with self-host as a later option? | Infrastructure planning |

---

*End of Draft 1. Expect iteration. The ADRs are more stable than the spec. Revise spec sections independently as implementation surfaces new constraints.*
