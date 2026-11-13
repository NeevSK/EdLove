# The data stack: one mental model

Status: consolidation, 2026-11-13. Read before wiring anything that stores, syncs or fetches
data. Evidence is from the code as it stands; open decisions are Neev's and listed in section 11.
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

## 5. One database, not two

**Postgres (in Supabase) is the only database of record.** Everything else is a copy:

- The **PowerSync Service** is a replication pipe. It reads Postgres's change log and keeps its
  own derived storage of which rows each device needs. If it is lost, it is rebuilt from Postgres.
- The **device's SQLite** is a partial copy: the rows this person may see, plus their writes that
  the server hasn't confirmed yet.
- **TanStack Query** is a short-lived copy in memory.

Data only ever moves one way into Postgres: **device → upload queue → v1 API → Postgres**. PowerSync
never writes to Postgres itself. The API decides, then the new server row flows back down to every
device, including the one that wrote it, and replaces the local version.

This is a distributed system, as is every app that works offline. The problems are real but
known, and each one has an owner:

| Problem | Example | Who handles it |
| --- | --- | --- |
| Duplicates | A retried upload marks the same student twice | Idempotency key on the command (attendance already has `idempotency_key`) |
| Conflicts | Two teachers mark the same student on the same day | The API, by a written rule per table (the conflict policy) |
| Rejected writes | A teacher who lost access marks attendance offline | The API refuses; the device's row is replaced by the server's copy, and the person is told |
| Ordering | Edit, then delete, while offline | PowerSync's upload queue is ordered per device |
| Stale reads | A device offline for a week | It shows the last sync time; the server's checkpoint gives a consistent snapshot when it reconnects |

The rule: **the device may go first, but the server has the last word.**

## 6. First synced table: attendance (decided 2026-11-13)

Neev chose attendance as the first synced table; others come later. What has to line up:

| Piece | State |
| --- | --- |
| Postgres `attendance` (`AttendanceRecord`) | Key `(classroom_id, student_id, date)`; columns `status`, `date`, `idempotency_key`; **no `id`** |
| Device `attendance` (`schema.ts`) | Has `id`, `marked_by`, `note`, `created_at`, `updated_at`, `occurred_at`, `academic_cycle_id` |
| Sync stream | None yet |
| Upload | None yet (no `uploadData`, no v1 attendance command) |

The two shapes disagree, and PowerSync needs an `id` column on every synced row. The server shape
is L0 (Neev's): either add an `id` to `attendance`, or have the stream select a derived `id`.
Then a stream (teacher's classrooms, and the student's own rows) and a v1 command
(`classroom.attendance.mark`) complete the loop.

## 7. Web: offline-capable, not local-first

- **Local-first:** the device copy is primary. Every read and write goes to the local database,
  and the network catches up in the background. That is mobile's model.
- **Offline-capable:** the network is primary, and the app degrades gracefully when it drops.
  `client-state-and-web-offline-capability-canon.md` defines the levels:

| Level | Promise |
| --- | --- |
| W0 | Preferences survive reload |
| W1 | What you have seen stays visible during an outage |
| W2 | The app opens with no network |
| W3 | Chosen records survive a restart offline |
| W4 | Chosen writes survive a restart and are sent later |

Why web isn't local-first by default:

- Browsers can evict storage.
- School labs and shared computers would leave private records on a machine that isn't the person's.
- Several tabs share one database.
- Most web use is online.

Web climbs the ladder one feature at a time instead. PowerSync web 2.7.0 (an OPFS file system
picked automatically) makes W3 and W4 practical for a chosen feature, attendance included, when
that is wanted.

## 8. Sign-in and the sync token

There are two different jobs:

1. **Checking credentials** (phone OTP, Google, password). **Supabase Auth** does this: it sends
   the codes and applies the rate limits. Passing passwords through our API adds a hop and a risk
   with no gain.
2. **Everything after:** who you are in Gurudevi, your bonds and permissions, and what you may
   sync. **The API** owns all of this. It turns the Supabase session into the canonical account.

PowerSync needs a token saying who the device is (`canonical_account_id`). `powersync/service.yaml`
already trusts our own ES256 key (`gurudevi-sync-dev-…`), not Supabase's, so the intended design
is that **the API issues the sync token**. No API endpoint signs one yet. The alternative,
PowerSync trusting Supabase's JWT directly, is simpler, but it puts authority in a token we don't
issue.

A later web option is an API-backed session in an httpOnly cookie, so the browser never holds the
token.

## 9. PowerSync as of November 2026

- **Managed tables (alpha, 2026-11-03).** `new Table(..., { direct: true })` stores plain SQLite
  rows instead of PowerSync's JSON views. It is faster for long lists and aggregates (an
  attendance sheet), with no migrations to write. It is alpha, so try it in the spike, not production.
- **`connect()` takes an `Authenticator` and a `MutationUploader` separately** (web 2.6.0), with
  download-only and upload-only forms. This maps cleanly onto ours: the API issues the token,
  and the v1 commands do the uploads. The old single connector still works.
- **The hang fix (web 2.6.0).** A sync connection or checkpoint could hang forever if the service
  didn't answer, blocking uploads.
- **OPFS for web (2.7.0, 2026-11-09).** `WASQLiteVFS.SimpleOpfsVFS` and `vfs: 'auto'`.
- **DevTools (2026-11-09).** These show a running app's live database, with MCP tools for agents.
  React Native support arrived in 2.4.1 (a Rozenite plugin).
- **Sync Streams** are what our `sync-config.yaml` already uses (edition 3). Service is at 1.28.x.
- **Our versions:** web 2.6.0 (2.7.0 out), react-native 2.4.0 (2.4.1), react 2.2.0 (2.2.1);
  common 2.5.0 and drizzle-driver 0.8.0 are current. `@powersync/tanstack-react-query` 0.3.8 is
  pre-1.0. Upgrades go through the cautious-upgrade protocol.

## 10. Where reality differs from the model (2026-11-13)

1. **Nothing syncs.** Mobile opens SQLite per account but never connects.
2. **No sync token issuer.** The service trusts our dev key, but nothing signs with it.
3. **Attendance shapes disagree** (section 6), and the device schema declares about 30 tables
   while the streams cover 6.
4. **Two roads to Postgres.** Core still calls `supabase.from` and `rpc` directly (23 calls),
   bypassing the API.
5. **A hand-built mini-database.** Key-value layers hold records as JSON (chat, climate, tuition,
   submissions). These are records, which belong in PowerSync.
6. **ZenStack policies aren't enforced at runtime.** The API uses `pg` directly.

## 11. Decisions

| # | Decision | State |
| --- | --- | --- |
| 1 | First synced table | **Attendance** (Neev, 2026-11-13); more later |
| 2 | Web | Offline-capable by ladder, not local-first (the canon) |
| 3 | Sign-in | Supabase Auth checks credentials; the API owns the account and issues the sync token (proposed) |
| 4 | Retire direct `supabase.from` and `rpc` from clients | Proposed (auth calls stay) |
| 5 | Attendance `id` (L0) | Neev |
| 6 | PowerSync live for v1 | Intended. A Cloud instance "Development" (region jp) exists and its URL is in Doppler; whether it is running and replicating is to be confirmed |
| 7 | Guest data in local-only tables | Open |
| 8 | API runtime: `pg`, or ZenStack's client with policies | Open |

## 12. The sync pipe (built 2026-11-13)

The pipe carries any table; it knows nothing about attendance or any other product data. What
flows through it is configured at its two ends: sync streams on the way down, upload routes on the
way up. It is proved with a synthetic table (`pipe_probe`), as the foundation rule asks.

| Stage | Where | State |
| --- | --- | --- |
| Admission (signed in, not a guest, this account active) | `PowerSyncProvider`, `SingleActivePowerSyncRuntime` | Built |
| Account-scoped database, one active at a time | `powerSyncDatabase.ts`, `singleActivePowerSyncRuntime.ts` | Built |
| **Authenticator**: grant from the API, parsed and checked (account, expiry window, service origin, admission before and after) | `syncPipe.ts` `createSyncAuthenticator` | Built, G1 |
| **Uploader**: oldest transaction first, one route per table, idempotency key `powersync:<installation>:<clientId>`, complete only when every change is settled | `syncPipe.ts` `createMutationUploader` | Built, G1 |
| **Failure decision**: retry, wait for sign-in, reject (server wins) or stop, as a policy (`UPLOAD_POLICY`: conflict `serverWins` or `hold`, `maxDefectAttempts`) | `logic/sync/uploadDecision.ts` | Built, G1 |
| Connection lifecycle: connect, status to the bus, first-sync timeout | `connectionLifecycle.ts` (now takes the SDK's `Authenticator` + `MutationUploader` form) | Built, G1 |
| Rejections to the person | `onRejected` → `presentFailure` (`apps/gurudevi-mobile/src/lib/syncConnection.ts`) | Built |
| **Sync grant** procedure `identity.syncGrant` (v1) | `apps/sanctuary-api/src/security/syncGrant.ts`; contract `SyncGrant` | Built, G1 (real ES256 signing, verified with jose). Admitted in the composition audit. Lifetime: min(session, 5 min) |
| **Upload commands** (v1, one per routed table) | API | Owed per table, when a table is admitted |
| Connect call in the mobile provider | `PowerSyncProvider` via `runIfActive` | Built, G3. Connects only when rollout (`isPowerSyncEnabled`, off by default), network (online) and read policy (`live`) all admit it, and the build has an instance; otherwise local data stays and nothing connects |

Guarantees the tests hold:

- A change is never lost while offline.
- A retry resends the same key.
- An expired session waits.
- A refused change leaves the queue, is reported, and the rest carry on.
- A repeating bug can't block the queue.
- A table with no route holds the queue rather than dropping it.
- Nothing is sent after admission closes or the SDK aborts.

To turn it on (configuration, all in Doppler):

| Where | Setting |
| --- | --- |
| API | `POWERSYNC_URL` (the instance URL), `POWERSYNC_SIGNING_JWK` (the private ES256 JWK whose public half is in `powersync/service.yaml`, `kid` `gurudevi-sync-dev-…`). Without both, `identity.syncGrant` answers `SERVICE_UNAVAILABLE` |
| Mobile | `EXPO_PUBLIC_POWERSYNC_URL` (the same instance) |
| Rollout | `isPowerSyncEnabled` for the accounts trying it |

## 13. Order

1. Pipe: built end to end in code (section 12). Not yet proved against a live instance.
2. Confirm the PowerSync instance is live; connect in the mobile provider; DevTools on a device.
3. The first passenger (attendance, section 6) is product work and comes after the pipe is proved
   on a device.

Older documents to reconcile: `2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md`,
`offline-state-resilience-sop.md`, `2026-10-23-client-state-and-web-offline-conflict-audit.md`.
`client-state-and-web-offline-capability-canon.md` still holds and is the source for section 7.

Sources: [PowerSync product updates](https://releases.powersync.com/),
[JS web SDK changelog](https://releases.powersync.com/announcements/powersync-js-web-client-sdk),
[Sync Streams](https://docs.powersync.com/sync/streams/overview).
