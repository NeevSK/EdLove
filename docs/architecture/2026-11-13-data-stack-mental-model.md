# The data stack: one mental model

Status: consolidation, 2026-11-13. Read before wiring anything that stores, syncs or fetches
data. Evidence is from the code as it stands; open decisions are Neev's and listed in section 7.
Related: [client runtime plan](2026-11-12-client-runtime-foundation-plan.md) (L0 to L5).

## 1. The picture

```
 SERVER                                                              DEVICE
 ┌──────────────────────── Supabase ────────────────────────┐
 │  Postgres (the source of truth)   Auth (sign-in, JWT)     │
 │  Storage (files)                                          │
 └──────▲───────────────────────────┬────────────────────────┘
        │ pg (raw SQL)              │ logical replication
 ┌──────┴─────────────┐   ┌─────────▼──────────┐   sync streams    ┌───────────────────────┐
 │ sanctuary-api      │   │ PowerSync Service  │ ────────────────► │ SQLite (PowerSync SDK) │
 │ Hono + oRPC v1     │   │ sync-config.yaml   │                   │  read with Drizzle or  │
 │ commands, queries  │   └────────────────────┘ ◄──── upload ──── │  watched queries       │
 └──────▲─────────────┘                          (connector → v1)  └───────────────────────┘
        │ oRPC over HTTPS                                           ┌───────────────────────┐
        └────────────────────────────────────────────────────────── │ TanStack Query (cache) │
                                                                    │ Zustand + MMKV (KV)    │
 SCHEMA (build time)                                                │ outbox (commands)      │
 schema.zmodel → ZenStack → TS types + Zod → contracts, validation  └───────────────────────┘
```

Two ways data reaches the device, and they are not interchangeable:

- **Synced:** Postgres → PowerSync Service → the device's SQLite. Works fully offline, and every
  screen reading it updates live.
- **Fetched:** device → oRPC v1 → API → Postgres, cached in TanStack Query. Needs the network;
  the cache lives in memory.

## 2. Each piece: what it is, what it owns, what it is not

| Piece | What it is | Owns | Is not | Used today |
| --- | --- | --- | --- | --- |
| **Supabase** | Hosted Postgres, Auth and Storage | The database of record; sign-in and the JWT; files | Not the API: clients should reach data through v1 or PowerSync | supabase-js in 17 core files and 7 mobile files. Most calls are auth (`getSession`, `getClaims`), but `supabase.from` (15), `rpc` (8) and `storage` (4) still read and write directly |
| **sanctuary-api** | Hono + oRPC v1 | Every command and server query; authority, idempotency, audit | Not a sync engine | Talks to Postgres with raw `pg` (`platform.ts`); no ORM at runtime |
| **ZenStack** | Schema language and code generation (ZModel) | The single source of data shapes: generated types, Zod schemas, access policies | Not used at runtime by the API today, so its policies are not enforced there | `packages/schema`, `packages/database` (generation, sandbox) |
| **Zod** | Runtime validation | Parsing untrusted input; the v1 contract | Not storage | 133 core files |
| **PowerSync Service** | Replicates Postgres to devices | Which rows go to which device (`powersync/sync-config.yaml`) | Not a writer: uploads go through the API | 3 streams (`identity`, `classroom_roster`, `user_todos`) covering 6 tables |
| **PowerSync SDK + SQLite** | The database on the device | Synced records, the upload queue, local-only tables | Not a cache: it's durable | Mobile opens it per account; never `connect()`ed; web has none |
| **Drizzle** | Typed query builder over PowerSync's SQLite | Typed reads and writes on the device | Not the server ORM | 10 core files |
| **TanStack Query** | An in-memory cache of server answers | Fetched data, request state, retries, failure feedback | Not a database; not persisted | 44 files |
| **Zustand + MMKV** | Small key-value state on the device | Preferences, session scope, drafts, selections | Not for records | 21 persisted stores |
| **Outbox** (`mutationQueue`) | Durable queue of commands | Commands that are not row writes | Not for row writes once PowerSync syncs | 14 writers; drain dormant |

## 3. What goes to PowerSync, and what doesn't

Neev's first instinct, that not everything goes to PowerSync, is right. Sync a table when **all**
of these hold:

1. It is needed **offline** on the device (a teacher marking attendance in a classroom with no signal).
2. It is **scoped** to the person or their school (a sync stream can express "these rows belong to
   this account").
3. Its size per device is **bounded** (a class roster, not the whole country).

| Data | Where |
| --- | --- |
| Rosters, attendance, timetable, the person's own journals and reflections, bonds and memberships | **PowerSync** (synced tables) |
| Guest data before sign-in | **PowerSync local-only tables**, copied to synced tables at sign-in |
| Device-only fields on a synced record (pinned, a local note) | **PowerSync raw table** with local-only columns |
| Session, entry, permission snapshot, search, reports, aggregates, AI, anything cross-school | **TanStack** over oRPC v1 |
| Files and media | **Supabase Storage**, through upload commands; the outbox for retries |
| Preferences, theme, selected account, drafts | **Zustand + MMKV** |
| Secrets and tokens | **Secure storage** (the device-security binding), never SQLite |

## 4. Reads and writes, end to end

**Synced record (attendance):**
1. The screen reads with a watched query (or Drizzle), so it re-renders when rows change.
2. Marking attendance writes to SQLite at once and works offline. PowerSync records it in its
   upload queue.
3. When online, the connector's `uploadData` turns queued rows into **v1 commands**. The API
   validates, authorises, applies idempotency and writes Postgres.
4. Postgres replicates through PowerSync back to every device that has the stream, including this
   one, which confirms the write.

**Fetched answer (a report):** `useQuery(v1.reports.x.queryOptions())`. The QueryClient policy
handles retry and feedback; nothing is stored on the device.

**A command that isn't a row (issue a receipt):** `useMutation` when online; the outbox when it
must survive being offline.

**The connector is the seam:** PowerSync's upload queue and the v1 command boundary meet in
`uploadData`. That is where idempotency keys, the replay decision (`replayDecision.ts`) and conflict
handling belong for synced tables.

## 5. PowerSync today: what changed upstream

- **Sync Streams.** These are the successor to Sync Rules; they landed in beta in March 2026 and
  are intended as a long-term complete replacement. Our `sync-config.yaml` already uses streams
  (edition 3).
- **Local-only tables.** Writes to these are not put in the upload queue: keep guest data there
  until sign-in, then copy it into the synced tables in one transaction. Changing a table from
  local-only to synced (or renaming one) deletes its data when the new schema is applied, so the
  names are a commitment.
- **Raw tables.** These are native SQLite tables, with foreign keys and cascades, instead of
  JSON-backed views. Since May 2026, put and delete statements are inferred, and local-only columns
  work on them. They need the Rust-based sync client.
- **Local-only use without `connect()`.** This is supported: a PowerSync database can serve as a
  local SQLite store with no sync.
- **Versions.** We run `@powersync/web` 2.6.0 (2.7.0 is out), `react-native` 2.4.0 (2.4.1 out),
  `react` 2.2.0 (2.2.1 out), and `common` 2.5.0 and `drizzle-driver` 0.8.0 (both current).
  `@powersync/tanstack-react-query` 0.3.8 exists (TanStack queries over SQLite), still pre-1.0.
  Upgrades go through the cautious-upgrade protocol.

## 6. Where reality differs from the model (2026-11-13)

1. **Nothing syncs.** Mobile opens SQLite per account but `connectPowerSyncRuntime` is never
   called, and there is no `uploadData` implementation in the apps.
2. **The schemas disagree.** The client schema (`adapters/powersync/schema.ts`) declares about 30
   tables; the streams sync 6.
3. **Web has no device database.** PowerSync web is a dependency, but web uses a mock under tests
   and SSR and throws otherwise. Web is fetch-only today.
4. **There are two roads to Postgres.** Besides v1, core still calls `supabase.from` and `rpc`
   directly (23 calls), which bypasses the API's authority and idempotency.
5. **There's a hand-built mini-database.** Two key-value layers (`storage.adapter`, 59 files;
   `SafeZustandStorage`, 38) and 50 raw `localStorage` calls hold domain lists as JSON (chat,
   climate, tuition, submissions). These are records, and per section 3 they belong in PowerSync.
6. **ZenStack policies aren't enforced at runtime.** The API uses `pg` directly, so authority lives
   in the API's own code, not the ZModel policies.

## 7. Decisions (Neev's)

| # | Decision | Why it matters |
| --- | --- | --- |
| 1 | Which tables sync (the streams), using section 3 | Decides what works offline |
| 2 | Is web local-first (PowerSync web, OPFS/IndexedDB) or fetch-only? | Web has no device database today |
| 3 | Guest data in PowerSync local-only tables? | Replaces hand-built guest storage; the sign-in copy is one transaction |
| 4 | Retire direct `supabase.from` and `rpc` from clients (auth stays) | One road to Postgres |
| 5 | API runtime: raw `pg`, or ZenStack's client with policies | Whether ZModel policies are enforced |
| 6 | Is the PowerSync service live for v1, and the upload endpoint designed? | Gates any real sync spike |

## 8. Order

1. **Agree this model** (this doc). The older docs listed below predate Sync Streams, local-only
   tables and v1. They stay as history until each is reconciled with this one.
2. **Decide** section 7.
3. **Spike on mobile:** `connect()` in dev against the streams; one table end to end (write
   offline, upload through a v1 command, replicate back); try `@powersync/tanstack-react-query` on
   it.
4. **Then wire:** move records out of the key-value layers into PowerSync tables, and keep TanStack
   for fetched answers. Effect conversions follow this map, so nothing is converted twice.

Older documents to reconcile: `2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md`,
`client-state-and-web-offline-capability-canon.md`, `offline-state-resilience-sop.md`,
`2026-10-23-client-state-and-web-offline-conflict-audit.md`.

Sources: PowerSync docs on [Sync Streams](https://docs.powersync.com/sync/streams/overview),
[local-only usage](https://docs.powersync.com/client-sdks/advanced/local-only-usage),
[raw tables](https://docs.powersync.com/client-sdks/advanced/raw-tables); PowerSync blog,
[2025 roadmap update](https://www.powersync.com/blog/2025-powersync-roadmap-update) and
[May 2026 changelog](https://powersync.com/blog/powersync-changelog-may-2026).
