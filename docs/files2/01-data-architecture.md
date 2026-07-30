# Temporal Data Architecture — Postgres / Supabase / SQLite / PowerSync

Implements the principles in `00-biomimicry-principles.md` in an actual stack. Context: multi-domain (wellbeing, notes, admin) app where any old day should be fully accessible, with weekly/monthly summaries layered on top, offline-first via PowerSync.

## Ownership Model — Owner-First, Not Tenant-First

**Correction from earlier in this doc's history:** `tenant_id` was initially treated as a primary, near-mandatory column, inherited from Gurudevi's "multi-tenant school ERP" description without questioning whether every row actually has a tenant. It doesn't. The correct primitive is **ownership**, of which institutional (school) scope is one kind, not the default kind.

**Grounded in the product's own citizenship model** (three tiers, not a database abstraction):
- **Guest (third-class)** — anonymous session, no signup, local-only storage, never synced to cloud. 14-day local retention with a scheduled notification before expiry (fires even if the app isn't open — needs the device's real notification system, not a reactive on-launch check). Silent loss avoided; storage cost is the guest's device, not Gurudevi's infrastructure — cost only occurs at the sync boundary, which guests never reach.
- **Second-class** — signed up (email or other), permanent account, full app capability for life, **no institutional context required, ever.** Signup is a *migration* trigger: local guest data gets claimed and pushed to the cloud, not recreated.
- **First-class** — second-class capability **plus** one or more institutional (school) affiliations layered on top. A user can hold multiple school affiliations simultaneously (e.g. a teacher at two schools) — each is an independent, additive context, not a replacement of personal capability.

**The direction only ever goes one way: institutional context is additive on top of a complete, standalone person — never a precondition for existing in the system.** This is why `tenant_id` as a mandatory column was wrong: most rows (personal wellbeing, personal workspace, community/group activity) have no institution at all, by design, not as an edge case.

**Owner-context replaces tenant_id as the schema primitive:**
```sql
events (
  ...
  owner_type   text,   -- 'user' | 'personal_workspace' | 'school_workspace' | 'group'
  owner_id     uuid,   -- points to user_id, workspace_id, school_id, or group_id accordingly
  ...
)
```
- **`owner_type: 'user'`** — Self/wellbeing events. Citizenship-independent: true for guest, second-class, and first-class alike. Never touched by school affiliation. Matches the existing Self-tab architecture (`/areas/gurudevi.md`) — wellbeing sits outside the workspace system entirely because it's the one thing true of a person regardless of citizenship class.
- **`owner_type: 'personal_workspace'`** — the second-class capability: personal class organizing, personal notes/admin, present for life, independent of any school.
- **`owner_type: 'school_workspace'`, `owner_id: <workspace_id>`** — first-class capability. One row of context per school affiliation — a teacher at two schools has two independent school-scoped workspace contexts, never merged.
- **`owner_type: 'group'`** — community feed/DMs/group chats. Citizenship-independent like Self — a group can be school-scoped or classroom-scoped (a fact stored on the *group*, e.g. `groups.school_id`, nullable) but is not limited to school affiliation; membership (ReBAC relationship, resolved via Cedar) determines reach, not tenant.

**Access/reach is a separate concern from ownership, resolved by Cedar ReBAC — not by this schema.** Ownership answers "whose data is this"; ReBAC answers "can this user reach it" (via group membership, school affiliation, or direct ownership). Conflating the two was the original mistake — don't reintroduce it by trying to encode reach-relationships into `owner_type`/`owner_id` later.

**Partitioning implication (see storage/indexing doc for full depth):** range+list partitioning by `owner_type` is the right shape, not by "tenant." `user`/`personal_workspace`/`group` rows are inherently institution-independent and can share a partition family; `school_workspace` rows are the only slice where "which institution" is a meaningful, load-bearing partition/isolation question.

## Core Schema Shape

**Event log as base truth (Patterns 1, 6, 9)**
Single append-only `events` table — not per-domain tables:
```
events(id, owner_type, owner_id, type, payload jsonb, occurred_at, decay_class)
```
`type` discriminates domain (wellbeing/notes/admin), independent of `owner_type` (who it belongs to). This is "one substrate, many channels" — sparse coding, not dense-scan-everything or isolated-per-day-blobs.

**Rollups are derived, never canonical (Patterns 1, 6, 8)**
Daily/weekly/monthly rollups live in separate small tables, refreshed via `pg_cron` or Supabase Edge Functions. Never one dense `daily_summary` row that claims to "be" the day — rollups are one *reading* of the raw events, and you're allowed multiple readings. If a rollup computation changes, regenerate it; the events table is unaffected.

**Relative baselines (Pattern 2)**
Postgres window functions give rolling personal baselines natively:
```sql
AVG(value) OVER (PARTITION BY owner_id ORDER BY occurred_at 
  ROWS BETWEEN 27 PRECEDING AND CURRENT ROW)
```
Deviation-from-self, not deviation-from-global-constant.

**Decay as a real number, not a TTL (Pattern 3)**
```sql
weight = exp(-lambda * extract(epoch from (now() - occurred_at)))
```
Computed at query time or periodically materialized. Store `lambda` per event `type` in a config table — exploration-type events decay fast, meaningful-completion events decay slow.

**Reinforcement-within-window (Pattern 5)**
A lightweight `pending_signals` table: first occurrence inserts a row with an expiry; second occurrence within the window promotes it to a real flag; if the window closes unreinforced, a cron job deletes the row. The Venus flytrap, in SQL.

**Local containment (Pattern 7)**
No triggers that cascade across domains. A wellbeing insert should only touch wellbeing rollups. Cross-domain correlation ("notes up, wellbeing down") should be a deliberate, separately-computed query — never an automatic side effect of an unrelated write. Trigger sprawl is where a lot of apps quietly slow down.

## PowerSync / SQLite Sync Strategy — the coral-band pattern, literally

The offline constraint makes the coral-banding principle load-bearing, not poetic:

- **Full-resolution `events`** synced to SQLite for a trailing window (last 30–90 days)
- **`rollups_*`** synced for everything (they're small)
- **Older raw `events`** fetched on-demand directly from Supabase when the user drills into a specific old day — not pre-synced

Recent = full detail locally. Distant = compressed texture locally, detail fetched live on demand. Sync rules by bucket: recency + type.

## Caution from the Coral Round

Don't hardcode "week" and "month" as the only lenses. Real coral species don't reliably deposit one clean band per year (sedimentation/light irregularities produce false readings) — the equivalent risk here is assuming calendar weeks match a person's actual rhythm (exam-block-driven vs. Monday–Sunday). Build in the possibility that the meaningful period doesn't match the calendar.

## The Material Layer — Bytes, Not Shape

Everything above is about *shape* (schema, decay, rollups). This section is the layer underneath: what each field actually costs at rest, in transit, and under query load as rows multiply. One piece of data passes through five environments on every write/read: **type/definition → at rest (disk) → indexed → in transit (network) → in query (compute)**. Type decisions are cheap to change at 100 rows and brutal at 10 million; index decisions are nearly free to change at any scale. Get type right early — it's the layer everything else inherits from.

### Column ordering ("Column Tetris")

Postgres pads columns to their type's alignment boundary (an 8-byte timestamp wants to start at an address divisible by 8; a 4-byte int at one divisible by 4). A `boolean` (1 byte) sitting next to an `integer` (4 bytes) can silently cost 3 bytes of padding — 300% overhead on that one column, purely from declaration order. Measured real-world effect: reordering columns took a 1M-row table from its original size down ~30% with zero change to the data stored; a (boolean, bigint) column pair uses 21% more space than the same data as (bigint, boolean).

**Rule:** order columns largest-fixed-size-first (timestamptz/bigint → int → smallint → boolean), variable-length (text, jsonb) last regardless of "size." Apply this at table creation — retrofitting means a full table rewrite. Caveat: don't sort *purely* by size — frequently-read columns (`occurred_at`) should stay early too, since accessing a late column means Postgres skips over every earlier one first ("tuple deforming"). Apply to `events` now, before real data volume makes reordering expensive:
```sql
CREATE TABLE events (
  id uuid,
  owner_id uuid,
  occurred_at timestamptz,
  decay_class smallint,   -- enum in practice, see below
  is_synced boolean,
  owner_type text,         -- 'user' | 'personal_workspace' | 'school_workspace' | 'group'
  type text,               -- FK to a lookup table, see below
  payload jsonb            -- variable-length, always last
);
```

### jsonb vs. typed columns — the real cost of `payload`

Values over ~2KB get TOASTed (moved to a separate table with a pointer left behind) — flexible, but genuinely slower to retrieve than an in-row value. The sharper cost is on write: **Postgres cannot do a partial jsonb update at the storage level** — even changing one boolean inside a large document forces a full read-modify-write-new-copy of the entire document (MVCC), which means high WAL generation and table bloat if any single event's payload is both large and frequently touched in place. This is mostly moot for your append-only design (events aren't supposed to mutate after write) — the real relevance is narrower: **whichever fields inside `payload` your rollup queries filter on most often are candidates to pull out**.

GIN indexes on jsonb are real and powerful but operator-specific — a GIN index only accelerates `@>`, `?`, `?|`, `?&`; something as ordinary as `->>'key'` extraction can silently bypass it and fall back to a full scan if the index type doesn't match the query shape. **Fix: use generated columns** (Postgres 12+) to extract hot fields from `payload` into real, B-tree-indexable typed columns at write time — benchmarked as comparable to GIN for straightforward equality/range lookups, simpler to reason about, cheaper to maintain. Decision rule for any field inside `payload`: is it filtered/joined often? Does it need constraints? → pull it into a generated column. Is it genuinely variable, rarely queried? → leave it in jsonb.

### SQLite's type system is not a smaller Postgres

Postgres enforces type *at the column*. SQLite enforces type *at the value* ("manifest typing") — a column declared `INTEGER` will still store whatever storage class the inserted value carries. There are exactly five storage classes: NULL, INTEGER, REAL, TEXT, BLOB. A column's declared type only sets its **affinity** — a conversion *recommendation*, not enforcement. Two concrete, non-obvious consequences:
- **No boolean storage class exists.** Every boolean becomes `INTEGER 0`/`1` on the SQLite side — not a design choice, a hard fact.
- **No datetime storage class exists.** `occurred_at timestamptz` has no direct equivalent — it becomes TEXT (ISO-8601), REAL (Julian day), or INTEGER (Unix timestamp) depending on the sync layer's mapping choice (see PowerSync section below).

Real failure mode: comparisons/sorts treat storage classes differently — true integers sort numerically first, then any stray text values that snuck into the same column sort alphabetically *after* all the numbers. A stray string in a numeric column doesn't error, it just silently produces wrong sort order, discovered much later. **Mitigation: SQLite 3.37+ `STRICT` tables** turn affinity-coercion off and reject mismatched values outright — check whether PowerSync's local SQLite layer supports declaring synced tables `STRICT`.

### PowerSync-specific constraints (verified against current docs, July 2026)

**SDK stability:** `@powersync/web` and the React Native SDK are both current and stable — the historical "beta" concern (old `@journeyapps/powersync-sdk-web` package) is superseded. Both SDKs now default to the Rust-based sync client (the older JS client is being phased out, not the other way around). Genuine remaining alpha/beta zones: Tauri SDK (alpha), standalone Rust crate (pre-alpha, no stability guarantees), Node.js SDK (beta) — none of these are in your actual RN + web client path.

**Client-side schema type ceiling — this is the one that bites:** the JS/web SDK's client-side schema supports only three types: `text`, `integer`, `real`. No native boolean, no jsonb-equivalent. `payload jsonb` becomes a `text` column holding a JSON string on the client — `JSON.parse`/`JSON.stringify` in app code, not queryable-as-structure the way Postgres jsonb is. Design queries assuming this asymmetry, not symmetric jsonb behavior on both ends.

**Web VFS (storage backend) is a real, consequential choice, not a default to accept blindly.** Five options exist (IDBBatchAtomicVFS default, OPFSCoopSyncVFS, AccessHandlePoolVFS, OPFSWriteAheadVFS, InMemoryVFS) with different multi-tab and Safari/iOS support. Given Gurudevi's likely multi-tab usage and a device mix that includes iOS/Safari, **`OPFSCoopSyncVFS` is the probable right choice** — it's the only option offering both multi-tab support *and* reliable Safari/iOS behavior together; the default (`IDBBatchAtomicVFS`) doesn't support Safari/iOS multi-tab at all.

### Timestamp precision — where to actually resolve `occurred_at`

Postgres `timestamptz` is genuinely microsecond-precise internally (8-byte integer, not a float) — but `EXTRACT(EPOCH FROM ...)`, exactly what the decay formula uses, casts through `double precision`, which silently truncates the last microsecond digit at realistic timestamp magnitudes (confirmed by Postgres core dev on the mailing list; accepted permanent behavior, not a bug to be fixed). Irrelevant for decay math (operates at hours/days scale), but worth knowing before anyone uses epoch extraction for fine-grained event ordering.

**The real decision is at the PowerSync boundary**, given the 3-type ceiling above: `occurred_at` must become `text`, `integer`, or `real` on the client. Recommended: **keep `timestamptz` on Postgres** (native interval/timezone arithmetic, clean rollup queries) but **map it to milliseconds-since-epoch as `integer` in the Sync Streams/Rules config** — not `text` (slower comparison, needs parsing before decay math) and not `real` (reintroduces float-truncation risk, and raw microseconds can exceed JS's safe integer range). Milliseconds-as-integer gives real sub-second ordering, fits safely in JS's number range for centuries, and needs no parse step before arithmetic. Make this an explicit sync-config decision, not PowerSync's automatic-cast default.

### Enum vs. text vs. lookup table

Benchmarked: enum vs. text has no meaningful *speed* difference — the real enum win is storage size, and only for longer string values (near-identical size for short strings; enum stayed flat while text ballooned as label length grew). **The real decision axis is change cost, not performance:**
- **Enum** — cheap to *add* values (`ALTER TYPE ... ADD VALUE`, fast, transactional since PG10), expensive to *remove* (`DROP VALUE` doesn't exist — retiring a value means rebuilding the type and every column using it, a heavy migration on a large table). Right for genuinely closed, engineering-owned vocabularies.
- **Lookup table** — cheap to add/remove/enrich with metadata, but a bare surrogate-key FK can measurably degrade the query planner's row-count estimates (the planner can't see which real-world value an opaque id maps to). Use a **text key**, not a surrogate integer, to avoid this — the planner can then see the actual value again.

**Applied to Gurudevi:** `decay_class` is genuinely closed and engineering-defined → straightforward enum. `type` is product vocabulary, likely to grow, and already wants per-value metadata (the `lambda` decay-rate config table already planned above) → this **is** the enum-inside-lookup-table pattern, just not yet named as such. Make `events.type` a real foreign key into that config table (text key) rather than a bare unenforced `text` column — gets referential integrity for free (no event can reference a type without decay config) and sidesteps the planner-blindness problem.

### Server-side caching (Redis) — the API/DB-side counterpart to client-side Axis 4

Same category of question as React Query on the client (`04-network-transport.md`): not a transport, a lifecycle/freshness-management layer sitting on top of data some other mechanism already fetched. Same discernment rule applies — **add only when a measured constraint asks for it, not by default.**

**The honest default answer for Gurudevi right now: no, not yet.** A well-tuned Postgres (PgBouncer connection pooling, proper indexing — BRIN and partial indexes for the recency-bucketed access pattern this app already has) can handle read latencies under 5ms — often making a cache layer unnecessary outright. Real cost/benefit data: Postgres-only wins on total cost of ownership for most mid-market SaaS; a Postgres+Redis hybrid only pays for itself once cache hit rates are *consistently* above 90% and the team already has cache-invalidation experience. Below that bar, Redis is net cost, not net speed.

**The real risk isn't infrastructure, it's correctness — a cache is a second source of truth that can silently disagree with the first.** The standard failure mode: a user sees stale or, worse, someone else's cached data because an invalidation path was missed. This is the same shape of risk PowerSync's bucket-checksum protocol was built to formally solve (`04-network-transport.md`) — except a naive Redis layer doesn't get that rigor unless someone deliberately builds it.

**Where Redis genuinely earns its place, if a measured constraint later justifies it:** the cache-aside pattern (check cache first, populate on miss, TTL-expire) is the standard, simplest approach. Best-fit data: read-heavy and rarely-changing, expensive-to-compute (joins/aggregations), reference/lookup data — which describes the `type` lookup-table config from above almost exactly — or precomputed results. Explicitly poor fit: highly volatile, rapidly-changing data, which just thrashes the cache. Invalidation strategy is the actual hard part and scales in complexity: TTL (simplest, tolerates staleness for its duration) → explicit deletion-on-write (more correct, every write path must remember to invalidate) → pub/sub invalidation (most correct, but broadcasts to every client regardless of whether they hold the stale data, and costs real CPU on every write).

**Applied to Gurudevi's actual current shape:** the `rollups_*` tables already planned above are doing a version of this *inside* Postgres — precomputed, periodically refreshed, avoiding recomputation on every read. Redis would only become relevant for a *specific* rollup or lookup query that, once measured under real load, is still too slow after proper indexing and is read far more often than it changes. Not a default to design in now.

## Open Questions / Not Yet Resolved

- Exact `lambda` decay values per event type — needs real usage data, not guessed constants
- Whether `pending_signals` window durations should be user-configurable or domain-fixed
- How much raw-event detail (vs. rollup-only) to keep in the "recent window" sync bucket as data volume grows
- Storage/indexing-at-scale layer (partitioning, partial indexes, hot/cold tiering) — mapped but not yet gone deep
- Network/transit layer specifics (PowerSync delta-sync behavior, payload batching) — mapped but not yet gone deep
- Query-pattern layer (access pattern shapes, N+1 risks in RN screens) — mapped but not yet gone deep
