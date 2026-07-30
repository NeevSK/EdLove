# Gurudevi — Data & State Lifecycle Dynamics
> Draft 1 — June 2026
> Companion to: gurudevi-architecture-draft-1.md (ADR + Solution Spec)
> This document covers dynamics — how data moves, what triggers what, which layer owns what, and in what direction. Read the ADR doc for the *why* behind each decision.

---

## 0. Layer Map — Who Owns What

Before any flows: a precise map of every tool in the stack, its single responsibility, and what it must never do. Agents should use this as a lookup before reaching for any storage or state primitive.

| Layer | Tool | Owns | Must Never |
|-------|------|------|------------|
| **Persistent structured data** | PowerSync + OP-SQLite + Drizzle | All Zone A/B/C tables. Single SQLite file per account. Source of truth for everything that must survive app restart. | Be queried directly by UI components. Always go through hooks. |
| **Sync replication** | PowerSync connector | Zone A bidirectional replication with Supabase via WAL. Fires change notifications for all AppSchema tables including local_only. | Touch Zone B/C network sync. That is direct API's job. |
| **Reactive SQLite reads** | `useLiveQuery` (PowerSync React) | Subscribing to SQLite table changes and re-rendering on write. Works for Zone A, B, and C because all are in AppSchema. | Be used for remote REST data. That is React Query's job. |
| **Remote data fetching** | React Query (`@tanstack/react-query`) | Fetching, caching, and invalidating data from the Hono API gateway. Zone A remote queries (dashboard aggregates, analytics). Zone B/C initial hydration from server on first install. | Read from SQLite. Never query PowerSync tables via REST — if it's in Zone A, read it from SQLite via `useLiveQuery`. |
| **Request throttling** | TanStack Pacer (`@tanstack/react-pacer`) | Throttling React Query invalidations triggered by PowerSync sync events. Preventing Metro bridge congestion during heavy sync. | Be used for UI debounce (that's `useDebouncedValue`). Pacer is for invalidation gating only. |
| **Fast KV operational state** | Unified `storage` (`@repo/core/native/storage`) | Account IDs, device ID, active perspective, feature flag hydration cache, draft form state, sync metrics, UX tracking. Backed by MMKV in production, AsyncStorage in Expo Go / web / early boot. | Store sensitive data (use SecureStore) or structured relational data (use SQLite). |
| **Sensitive credentials** | SecureStore (`expo-secure-store`) | SQLCipher keys per account, biometric tokens, auth credentials. Hardware-backed. | Be used for non-sensitive data — performance overhead is real. |
| **Global reactive UI state** | Zustand (`useStore`, `useSyncStore`) | Auth state, active bond/perspective, SovereignBus sync slice, capability token cache, network status. In-memory, rehydrated on boot from `storage`. | Become a data cache for SQLite or API data. That causes stale state bugs. |
| **Authorization** | Cedar WASM (`@cedar-policy/cedar-wasm/web`) | Structural permission evaluation. Loaded once at module scope. Evaluates against locally cached policy snapshot. | Be called per-write. Issue one capability token per operation context. |
| **Entitlement** | `IEntitlementPort` adapter | Tenant-level capability checks against locally cached pricing manifest (Zone A, `pricing_manifest` table). | Bleed pricing tier data into Cedar context. Cedar sees structural attributes only. |
| **Feature flags** | `IFeatureRolloutPort` adapter | GrowthBook (or equivalent) flag evaluation against local flag cache (stored in `storage`). | Gate security-sensitive actions — that is Cedar's job. Feature flags are operational, not structural. |
| **Zone B/C network sync** | Direct Hono API (REST + WebSocket) | Sending and receiving Zone B (social) and Zone C (messaging) data. Writing received data into local SQLite Zone B/C tables. | Go through PowerSync. Zone B/C is local_only — PS handles reactivity, not replication. |

---

## 1. App Boot Hydration Flow

What happens between app launch and the first interactive screen. Order matters — each step gates the next.

```
APP LAUNCH
│
├─ 1. storage.getString('activeAccountId')
│     → MMKV sync read (or AsyncStorage async read if pre-bridge)
│     → if null: route to login screen, stop here
│
├─ 2. SecureStore.getItemAsync('gurudevi-sqlite-cipher-key-{accountId}')
│     → async, hardware-backed
│     → if null: key lost (device wipe / reinstall) → re-auth flow
│
├─ 3. Boot PowerSync instance (database.ts)
│     → open SQLite file: gurudevi-powersync-{accountId}.db with SQLCipher key
│     → register PowerSync listener → update SovereignBus Zustand slice
│     → connect PowerSync WebSocket (Zone A replication begins in background)
│
├─ 4. Warm Cedar WASM module
│     → module-level singleton: const { evaluate } = await import('@cedar-policy/cedar-wasm/web')
│     → cached for session — never re-imported
│     → if WASM load fails: set authZ status to 'degraded', writes queue until recovered
│
├─ 5. Load Cedar policy snapshot
│     → query permission_snapshots table (Zone A, SQLite)
│     → if found and not expired and HMAC valid: use cached snapshot
│     → if missing / expired / invalid: fetch from server, store in permission_snapshots
│     → if offline and no valid snapshot: enter 'snapshot-pending' state
│         writes queue, reads permitted (read-only safe mode)
│
├─ 6. Load pricing manifest
│     → query pricing_manifest table (Zone A, SQLite)
│     → same pattern as Cedar snapshot: local cache first, server fetch if stale
│
├─ 7. Hydrate Zustand auth store
│     → read activeBond, userRole, tenantId from storage or Zone A SQLite
│     → set useStore state
│
├─ 8. Hydrate feature flag cache
│     → read from storage (MMKV) — synchronous, prevents UI flicker
│     → trigger background GrowthBook SDK refresh if online
│     → on refresh complete: update storage cache, re-evaluate flags
│
└─ 9. Route to home screen
      → PowerSync sync running in background
      → useLiveQuery hooks begin firing as Zone A data arrives
```

**Key invariant:** UI renders from local SQLite immediately. Network is never awaited before first render. PowerSync fills in data reactively after mount.

---

## 2. Zone A Read Flow — Sovereign Core Data

How a teacher sees their classroom roster, attendance history, student bonds.

```
UI Component mounts
│
├─ calls useLiveQuery(db.select().from(studentsTable).where(...))
│   → PowerSync observes SQL query, extracts table references
│   → returns current SQLite snapshot immediately (no loading state)
│   → subscribes to change notifications on studentsTable
│
├─ PowerSync sync running in background:
│   → WAL changes from Supabase arrive via WebSocket
│   → written to local SQLite
│   → PowerSync fires change notification
│   → useLiveQuery re-executes query, component re-renders
│   → SovereignBus Zustand slice updated: isSyncing, uploadQueueDepth
│
└─ if data also needed from REST (analytics, aggregates not in SQLite):
    → useQuery({ queryKey: [...], queryFn: fetchFromAPI })
    → gated: if isSyncing (from SovereignBus): skip background refetch
    → on lastSyncComplete change: useThrottledInvalidate fires
    → React Query refetches, updates its own cache
    → component reads from React Query cache (not SQLite)
    → NEVER mix: if table is in Zone A SQLite, read it from useLiveQuery, not useQuery
```

**Cedar check on read:** reads are generally not Cedar-gated at the query level. Cedar gates *writes* and sensitive *action triggers*. Read access is controlled by PowerSync sync rules (server-side, which data gets synced to which device) and RLS (Supabase, which data the connector can access).

---

## 3. Zone A Write Flow — Optimistic Local-First

How a teacher marks attendance for 30 students.

```
User triggers bulk attendance mark
│
├─ 1. Entitlement pre-flight
│     IEntitlementPort.getCapabilities(tenantId)
│     → reads from pricing_manifest Zone A table (SQLite, synchronous via Drizzle)
│     → if 'attendance' not in enabledModules: stop, show upgrade prompt
│
├─ 2. Cedar capability token issuance
│     IAuthzPort.issueCapabilityToken(principalId, { context: 'attendance_session', classroomId })
│     → Cedar WASM evaluates once against policy snapshot
│     → returns CapabilityToken { accountId, tenantId, bondCapacity, operationContext, expiresAt }
│     → token stored in Zustand (in-memory, not persisted)
│     → evaluation: ~5ms, paid once for the entire bulk operation
│
├─ 3. Feature flag check
│     IFeatureRolloutPort.isFeatureActive('attendance-marking')
│     → reads from storage (MMKV) synchronously
│     → if inactive (kill-switch): stop, show unavailable state
│
├─ 4. Bulk write via SecureDrizzleProxy
│     → proxy validates capability token (does not re-invoke Cedar)
│     → proxy checks token.operationContext matches write target
│     → if token expired or context mismatch: re-issue token (one more Cedar eval)
│     → db.insert(attendanceTable).values([30 records]) — single batch transaction
│     → writes to local SQLite immediately (optimistic render)
│     → PowerSync CRUD queue receives the batch
│
├─ 5. UI re-renders immediately
│     → useLiveQuery on attendanceTable fires from SQLite change
│     → teacher sees all 30 marks instantly, no network wait
│     → SovereignBus: uploadQueueDepth increases
│
└─ 6. PowerSync upload in background
      → SupabasePowerSyncConnector POSTs to /api/powersync/upload
      → Supabase writes to Postgres
      → RLS validates on server side (second layer, Cedar is client-side first layer)
      → on success: PowerSync clears CRUD queue entry
      → SovereignBus: uploadQueueDepth decreases
      → on failure: PowerSync retries with backoff
```

---

## 4. Zone B Write Flow — Social Feed, Online

How a teacher posts to a circle when online.

```
User writes a post and taps Send
│
├─ 1. Hexagonal check (entitlement → Cedar → feature flag) — same as Zone A
│     Cedar context includes: scope of target circle (tenant | global)
│     if global circle: Cedar policy path for cross-tenant resource
│
├─ 2. Optimistic local write
│     → db.insert(postsTable).values({ ...post, status: 'sending', idempotencyKey })
│     → idempotencyKey = accountId-deviceId-localSeq
│     → localSeq incremented in storage (MMKV, synchronous)
│     → useLiveQuery on postsTable fires → post appears in UI immediately
│
├─ 3. Direct API call
│     → POST /api/social/posts with idempotencyKey in header
│     → not through PowerSync — Zone B is local_only
│
├─ 4a. API success (2xx)
│     → db.update(postsTable).set({ status: 'synced' }).where(eq(id, post.id))
│     → useLiveQuery fires again → status indicator updates
│
└─ 4b. API failure (network error / 5xx)
      → db.update(postsTable).set({ status: 'queued' })
      → useLiveQuery fires → post shows queued indicator
      → added to outbox_social
```

---

## 5. Zone B/C Write Flow — Offline Outbox

How a teacher's queued posts and messages are handled on reconnect.

```
OFFLINE: write attempt detected
│
├─ network check: useStore(s => s.isOnline) === false
├─ Cedar still evaluates (local snapshot, WASM — offline capable)
├─ db.insert(postsTable | messagesTable).values({ status: 'queued', idempotencyKey })
├─ db.insert(outbox_social | outbox_messages).values({ ref: item.id, idempotencyKey })
└─ UI shows queued indicator — no error, no silent drop

RECONNECT: network restored
│
├─ network status listener fires → useStore sets isOnline: true
│
├─ query outbox_social and outbox_messages for status: queued
│   → if empty: nothing to do
│   → if items found: surface review prompt UI
│
├─ Review prompt — per queued item:
│   ┌─────────────────────────────────────────────┐
│   │ You have 3 unsent items from while offline  │
│   │                                             │
│   │ [Post: "Great lesson today..."] [Send][Edit][Discard] │
│   │ [Message to Group A: "Homework..."] [Send][Edit][Discard] │
│   └─────────────────────────────────────────────┘
│   → auto-send is never triggered without user action
│   → stale context warning if item is > 24h old
│
├─ On Send:
│   → POST/WS to API with idempotencyKey
│   → server 409 (duplicate — other device already sent): mark synced silently
│   → server 2xx: mark synced, remove from outbox
│   → server 4xx: mark failed, show error, allow retry
│
└─ On Discard:
    → db.delete from main table and outbox
    → removed from UI immediately
```

---

## 6. Zone C — Messaging Real-Time Flow

How messages arrive and render in real time when online.

```
Teacher opens a channel screen
│
├─ useLiveQuery(db.select().from(messagesTable).where(eq(channelId, id)).orderBy(desc(createdAt)))
│   → immediate render from local SQLite cache
│   → no loading state if messages already cached
│
├─ WebSocket connection opens (screen-scoped — closes on unmount)
│   → connects to /ws/channels/{channelId}
│   → auth: JWT from current session
│
├─ Incoming message event:
│   → db.insert(messagesTable).values(incoming)
│       using INSERT OR IGNORE on idempotencyKey (deduplication guard)
│   → useLiveQuery fires → message appears in UI
│   → no React Query involved — SQLite is the source of truth for messages
│
├─ Background REST hydration (on mount, once):
│   → fetch /api/messages/{channelId}?since={lastCachedAt}
│   → fills gap between last cached message and now
│   → each message: INSERT OR IGNORE into messagesTable
│   → useLiveQuery picks up any new rows
│
└─ Screen unmounts:
    → WebSocket closed immediately
    → no background threads left running
    → SQLite cache remains for offline reads
```

---

## 7. PowerSync Sync Cycle & SovereignBus

How sync events flow from PowerSync into the rest of the state system.

```
PowerSync WebSocket active
│
├─ Download cycle (server → client):
│   → WAL changes from Supabase arrive
│   → written to Zone A SQLite tables
│   → useLiveQuery subscriptions fire for affected tables
│   → SovereignBus: isSyncing: true, downloadProgress updates
│   → React Query background refetches PAUSED (Pacer gate)
│
├─ Upload cycle (client → server):
│   → ps_crud table has pending mutations
│   → SupabasePowerSyncConnector POSTs to /api/powersync/upload
│   → SovereignBus: uploadQueueDepth: N
│
├─ Sync complete:
│   → PowerSync fires statusChanged: { uploading: false, downloading: false }
│   → SovereignBus: isSyncing: false, lastSyncComplete: now
│   → Pacer gate opens: useThrottledInvalidate fires for affected React Query keys
│   → React Query refetches remote aggregates and analytics
│
└─ policy_version change detected (Zone A sync):
    → useLiveQuery on policy_version table fires
    → Cedar snapshot invalidated
    → current capability tokens invalidated (Zustand cleared)
    → fetch fresh snapshot from server
    → snapshot stored in permission_snapshots
    → resume any queued writes
```

**SovereignBus Zustand slice update path:**

```
database.ts (PowerSync registerListener)
  → statusChanged callback
  → useSyncStore.setState({ isSyncing, uploadQueueDepth, lastSyncComplete, syncError })
  → any component reading useSyncStore re-renders
  → React Query hooks reading isSyncing gate their refetch logic
```

---

## 8. Cedar Authorization Flow — Full Detail

How a capability token is issued and used across a batched operation.

```
Operation context entered (e.g. attendance screen mounts)
│
├─ 1. Check Zustand for existing valid token for this context
│     → if valid (not expired, context matches): skip to step 5
│     → if missing or expired: proceed to step 2
│
├─ 2. IEntitlementPort.getCapabilities(tenantId)
│     → Drizzle query: db.select().from(pricingManifestTable).where(eq(tenantId, ...))
│     → synchronous (SQLite, in-memory cache after first read)
│     → if capability absent: throw EntitlementError, stop
│
├─ 3. Cedar WASM evaluation (module singleton, loaded at boot)
│     → IAuthzPort.issueCapabilityToken(principalId, operationContext)
│     → construct evaluation payload:
│         principal: { id, capacity, tenantId, deviceTrustStatus }
│         action: derived from operationContext
│         resource: hydrated from SQLite by IAuthzPort adapter
│         context: { operationContext, tokenIssuedAt }
│     → evaluate() → decision: Allow | Deny
│     → if Deny: throw AuthzError, stop
│     → if Allow: construct CapabilityToken { ...claims, expiresAt: now + TTL }
│
├─ 4. IFeatureRolloutPort.isFeatureActive(flagKey)
│     → synchronous read from storage (MMKV feature flag cache)
│     → offline default: fail open (unless kill-switch tag present)
│     → if inactive: throw FeatureInactiveError, stop
│
├─ 5. Store token in Zustand (in-memory, not persisted)
│     → useStore.setState({ capabilityToken: token })
│
├─ 6. All writes in this operation context:
│     → SecureDrizzleProxy.insert/update/delete(token, ...)
│     → proxy checks: token.expiresAt > now
│     → proxy checks: token.operationContext matches write
│     → proxy checks: token.tenantId matches resource.tenantId
│     → if all pass: execute Drizzle query
│     → if token expired: re-issue (one Cedar eval), retry
│     → Cedar is NOT called per-write
│
└─ 7. Token lifetime events:
      → navigation away from screen: token cleared from Zustand
      → account swap: all tokens cleared
      → policy_version change: all tokens cleared immediately
      → explicit logout: all tokens cleared
```

---

## 9. AI Streaming Flow

How an AI insight request flows from trigger to SQLite persistence.

```
Teacher requests classroom insight
│
├─ useChat (TanStack AI) triggers fetch
│   → transport: global fetch with ReadableStream
│   → [if native Hermes ReadableStream works: no polyfill]
│   → [if not: react-native-fetch-api polyfills global fetch at app entry]
│
├─ Stream begins:
│   → for await (const token of response.body.getReader()):
│       setStreamedContent(prev => prev + token)  ← volatile React state only
│       NO SQLite write per token
│       NO Zustand update per token
│       UI re-renders per token via React state (60fps target)
│
├─ Stream complete:
│   → single db.insert(aiInsightsTable).values({
│       id: insightId,
│       classroomId,
│       content: fullText,
│       status: 'completed',
│       createdAt: new Date()
│     })
│   → useLiveQuery on aiInsightsTable fires if screen is subscribed
│   → useThrottledInvalidate for any React Query keys that aggregate insights
│
├─ Stream interrupted (navigation, phone call, app background):
│   → reader.cancel()
│   → db.insert(aiInsightsTable).values({ ...partial, status: 'interrupted' })
│   → UI shows "insight incomplete" indicator
│
└─ Offline:
    → fetch fails immediately
    → if local on-device model available: route to local inference
    → if not: show "insights unavailable offline" state
    → no queuing — AI insights are not outbox candidates
```

---

## 10. Account Swap Flow

Full lifecycle when a user switches between accounts on the same device.

```
User initiates account switch
│
├─ 1. Invalidate all in-flight state
│     → clear capability tokens: useStore.setState({ capabilityToken: null })
│     → clear Cedar snapshot from memory (file persists, cleared on next boot)
│     → cancel any active Zone C WebSocket connections
│     → cancel any active AI streams
│
├─ 2. Drain PowerSync upload queue
│     → awaitSyncDrain(timeoutMs: 30_000)
│         poll: SELECT count(*) FROM ps_crud AND currentStatus.uploading
│         until count === 0 AND uploading === false
│     → if timeout (30s): surface UI "finishing sync, please wait..."
│         do NOT force-disconnect with pending mutations
│         user can wait or cancel pending items manually
│
├─ 3. Disconnect PowerSync
│     → database.ts: powersyncInstance.disconnect()
│     → database.ts: _instance = null (single reference, provider reads null)
│     → SovereignBus: reset to initial state
│
├─ 4. Clear active account from storage
│     → storage.set('activeAccountId', newAccountId)
│     → storage.set('activePerspective', null)  ← reset to default for new account
│
├─ 5. Boot new account instance
│     → SecureStore.getItemAsync('gurudevi-sqlite-cipher-key-{newAccountId}')
│     → open new SQLite file
│     → register PowerSync listener
│     → connect PowerSync
│     → warm Cedar WASM (already loaded at module scope — no cost)
│     → load Cedar snapshot for new account
│     → load pricing manifest for new account
│     → hydrate Zustand auth store for new account
│
└─ 6. Route to home screen for new account
      → all useLiveQuery hooks re-execute against new SQLite file
      → React Query cache is keyed by account — stale cache from old account
        is not visible (queryKey includes accountId)
```

---

## 11. State Ownership Map — No Overlaps

A precise map of who owns what state. If you find yourself writing to the same state from two different layers, something is wrong.

```
┌─────────────────────────────────┬──────────────────────────────────────────────┐
│ State                           │ Owner                                        │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ All structured app data         │ SQLite via Drizzle (Zone A/B/C)              │
│ Reactive structured reads       │ useLiveQuery → SQLite                        │
│ Remote REST cache               │ React Query (keyed with accountId)           │
│ Invalidation timing             │ TanStack Pacer (useThrottledInvalidate)      │
│ Auth / user / bond              │ Zustand useStore (rehydrated from storage)   │
│ Sync status                     │ Zustand useSyncStore (SovereignBus)          │
│ Capability tokens               │ Zustand useStore (in-memory, never persisted)│
│ Network status                  │ Zustand useStore (from NetInfo listener)     │
│ Feature flag cache              │ storage (MMKV) → IFeatureRolloutPort         │
│ Pricing manifest cache          │ SQLite Zone A pricing_manifest table         │
│ Cedar snapshot cache            │ SQLite Zone A permission_snapshots table     │
│ Policy version                  │ SQLite Zone A policy_version table           │
│ Account IDs on device           │ storage (MMKV)                               │
│ SQLCipher keys                  │ SecureStore (hardware-backed)                │
│ Device ID                       │ storage (MMKV) — set once at install         │
│ Draft / unsaved form state      │ storage (MMKV) — volatile, evictable         │
│ Outbox queue (B/C writes)       │ SQLite Zone B/C outbox tables                │
│ AI stream buffer (in-flight)    │ React local state (useState) — never SQLite  │
│ Completed AI insights           │ SQLite Zone B aiInsightsTable                │
│ localSeq counter (idempotency)  │ storage (MMKV) — per account, per device     │
└─────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 12. Trigger & Invalidation Map

What fires what. Follow this map before adding any new trigger or subscription.

```
PowerSync WAL change arrives
  → SQLite write
  → useLiveQuery fires (for subscribed tables)
  → SovereignBus isSyncing: true
  → Pacer gate closes (no React Query refetch during sync)

PowerSync sync complete
  → SovereignBus isSyncing: false, lastSyncComplete: now
  → Pacer gate opens
  → useThrottledInvalidate fires for affected React Query keys
  → React Query fetches remote aggregates

policy_version Zone A row changes
  → useLiveQuery on policy_version fires
  → Cedar snapshot invalidated
  → Capability tokens cleared from Zustand
  → Fetch fresh snapshot from server
  → Write to permission_snapshots
  → Resume queued writes

Network status changes (online → offline)
  → useStore isOnline: false
  → Zone B/C writes route to outbox
  → Zone C WebSocket closes (or enters reconnect loop)
  → React Query: networkMode: 'offlineFirst' (reads from cache)

Network status changes (offline → online)
  → useStore isOnline: true
  → Zone C WebSocket reconnects
  → query outbox tables → surface review prompt if items found
  → PowerSync reconnects and flushes upload queue
  → React Query background refetches resume

Account swap initiated
  → capability tokens cleared
  → Cedar snapshot cleared from memory
  → Zone C WebSockets closed
  → AI streams cancelled
  → PowerSync drain → disconnect
  → Zustand reset
  → storage activeAccountId updated
  → New PowerSync instance booted

Feature flag cache updated (GrowthBook refresh)
  → storage (MMKV) updated
  → IFeatureRolloutPort returns new values on next call
  → no automatic UI re-render — next action evaluation picks up new flags
  → if kill-switch toggled: active sessions see change on next operation trigger

App foregrounded
  → check Cedar snapshot expiresAt → fetch if stale
  → check pricing_manifest version → fetch if stale
  → GrowthBook SDK background refresh triggered
  → cache eviction job runs (per account SQLite file)
  → PowerSync reconnects if disconnected
```

---

## 13. Direct API vs PowerSync — Decision Rule

A simple rule for agents when writing any data-related code:

```
Is this data in Zone A (students, classrooms, attendance, bonds, grades,
permission_snapshots, policy_version, pricing_manifest)?
  YES → Read: useLiveQuery. Write: SecureDrizzleProxy → PowerSync queue.
        Never fetch via React Query REST for these tables.

Is this data in Zone B (posts, comments, reactions, circles, announcements)?
  YES → Read: useLiveQuery (local_only table). 
        Write online: SecureDrizzleProxy → direct REST API.
        Write offline: SecureDrizzleProxy → outbox_social → review prompt on reconnect.
        Never route through PowerSync replication.

Is this data in Zone C (messages, channels, presence)?
  YES → Read: useLiveQuery (local_only table).
        Write online: SecureDrizzleProxy → WebSocket (or REST fallback).
        Write offline: SecureDrizzleProxy → outbox_messages → review prompt on reconnect.
        Never route through PowerSync replication.

Is this remote aggregate / analytics data not stored in SQLite?
  YES → React Query useQuery. Gate refetch on SovereignBus isSyncing.
        Invalidate via Pacer on lastSyncComplete change.

Is this a volatile UI state (loading, modal open, tab selection)?
  YES → React local state (useState). Never Zustand, never storage.

Is this a non-sensitive fast KV value (preferences, draft, flag cache)?
  YES → storage (unified MMKV/AsyncStorage abstraction). Never AsyncStorage directly.

Is this a sensitive credential?
  YES → SecureStore. Nothing else.
```

---

*End of Draft 1. This document is intentionally flow-oriented. When implementation surfaces edge cases not covered here, add them as new flow sections rather than modifying existing ones — the existing flows represent intentional decisions.*
