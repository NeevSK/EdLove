# Storage Efficiency & Data-Schema Optimization Plan
**Date:** 2026-08-25  
**Author:** Naveen (opencode)  
**Status:** Draft 1 — linked to Gurudevi data-state-lifecycle, local-first principles, sqlite-drizzle-powersync mechanics guide  
**Drivers:** Low-storage/low-RAM device constraint; schema drift between AppSchema + Postgres publication; zero runtime retention/compaction; MMKV hygiene untouched

---

## 0. Evidence — What the Research Showed

| Area | Finding | File:Line |
|---|---|---|
| **Schema drift** | 16-table `AppSchema` (`packages/core/src/adapters/powersync/schema.ts`) vs 4-table Postgres `powersync` publication (`apps/gurudevi-mobile/supabase/migrations/20260812000000_powersync_publication.sql`). Column mismatches: `classrooms.is_active` vs Postgres `is_archived`; `classroom_students.roll_number` int vs string; `attendance` shape differs (local has `academic_cycle_id`, `occurred_at`). | schema.ts:73-198; publication.sql:9-21 |
| **Unannotated local-only** | 12 of 16 `AppSchema` tables have no `local_only` annotation. PowerSync treats them as sync candidates → CRUD-queue bloat + unnecessary sync traffic. The upload handler `tableToModelMap` in `sync.ts` references tables outside the 4-table scope. | schema.ts:292-309; sync.ts:28-78 |
| **Zero retention/compaction** | No `VACUUM`, no TTL pruning, no MMKV `trim`/`byteSize` usage in runtime. Only consent-revocation PDPA wipes exist (`_layout.tsx:157`). | data-state-lifecycle.md:569 (cache eviction job listed but never implemented) |
| **Heavy columns** | `nodes.embedding` (vector), `search_vector` (tsvector), 3× localized arrays (`title_si/ta/en`, `description_si/ta/en`) on server-only tables; unbounded append-only audit/event tables (`sentinel_audit_logs`, `security_audit_logs`, `growth_events`). | schema.zmodel:1005-1065; migrations/*.sql |
| **MMKV knobs unused** | `byteSize()`, `trim()`, `compareBeforeSet`, `recoveryStrategy` (4.3.2+) not called anywhere in the codebase. | mmkv-guidance: size/retention section |

---

## 1. Decisions

| Decision | Rationale |
|---|---|
| **Single SSOT for replicated tables** | Postgres → ZenStack .zmodel → Drizzle AppSchema columns must align exactly for the 4 synced tables. Drift = silent data loss / bloated CRUD queue. |
| **Explicit `local_only` annotation** | The 12 non-synced tables must be annotated `local_only: true` in the PowerSync schema so the SDK never queues them for replication. |
| **Retention TTL-driven pruning** | Define TTL per table; run on app foreground via `expo-background-task` + `VACUUM`. This is the single highest-impact change for low-storage devices. |
| **Schema drift test as CI gate** | A small script that compares Drizzle `AppSchema` column types against the Postgres migration for the 4 tables; fail the build on mismatch. Prevents regression. |
| **MMKV hygiene as opt-in first** | Add `byteSize` tracking + `trim()` grace-period; do not force `compareBeforeSet` on all keys immediately — risk of silent data loss. Start with feature-flag cache and localSeq. |

---

## 2. Phased Implementation (Mobile-Native First)

### Phase 0 — Groundwork (already done)
- Consolidated skill `.agents/skills/storage-efficiency/SKILL.md`
- Plan doc `docs/architecture/2026-08-25-storage-efficiency-plan.md`

### Phase 1 — Reconcile `AppSchema` to a single SSOT (P0)

**Files to modify:**

1. **`packages/core/src/adapters/powersync/schema.ts`**
   - For the **4 replicated tables** (`bonds`, `school_memberships`, `classrooms`, `classroom_students`): verify every Drizzle column type matches the Postgres migration exactly. Fix mismatches:
     - `classrooms.is_active` (integer boolean) vs Postgres `is_archived` → rename to `is_archived` or add mapping comment.
     - `classroom_students.roll_number` (integer) vs Postgres `roll_number` (text or int) → harmonize.
     - `school_memberships` columns (`start_date`, `end_date`, `joined_at`, `left_at`) — ensure ZenStack .zmodel → Drizzle alignment.
   - For the **12 non-synced tables**: add `local_only: true` PowerSync table option if the SDK supports it (check `PowerSyncDatabase` constructor). If not annotatable, add a comment `// local-only: not replicated — PowerSync CRUD queue excluded` and trim `sync.ts` `tableToModelMap`.
   - Export a new constant `LOCAL_ONLY_TABLES` listing the 12 tables, used by the provider to configure.

2. **`packages/core/src/api/handlers/sync.ts`**
   - Trim `tableToModelMap` to only the 4 published tables. Remove any entries for `attendance`, `students`, `mood_logs`, `schools`, `cedar_policies`, `permission_snapshots`, `policy_version`, `form_templates`, `form_responses`, `pricing_manifest`, `user_entitlement_grants`, `user_preferences`.

3. **New file: `packages/core/src/adapters/powersync/local-only-ts.ts`** (or similar)
   - Export `LOCAL_ONLY_TABLES` union type and a helper `isLocalOnly(tableName: string) => boolean`.

**Acceptance criteria for P0:**
- Drift-check script passes (compares Drizzle columns vs Postgres for the 4 tables).
- `sync.ts` `tableToModelMap` contains exactly the 4 synced tables.
- `LOCAL_ONLY_TABLES` lists the 12 non-synced tables; PowerSync never queues CRUD for them (verified via `ps_crud` count after a write of a local-only table).
- Types compile: `pnpm run typecheck` across `core`, `schema`, `database`, `gurudevi-mobile`.

### Phase 2 — Local SQLite retention + compaction (P1)

**Files to modify/add:**

1. **New file: `apps/gurudevi-mobile/src/storage/retention-scheduler.ts`**
   - Define TTL config:
     ```typescript
     const RETENTION_TTL = {
       ai_messages: 90 * 24 * 60 * 60 * 1000,       // 90 days (matches existing column)
       mood_logs: 90 * 24 * 60 * 60 * 1000,
       group_messages: 60 * 24 * 60 * 60 * 1000,
       community_posts: 180 * 24 * 60 * 60 * 1000,
       attendance: 365 * 24 * 60 * 60 * 1000,       // 1 year (but VACUUM after prune)
     };
     ```
   - On app foreground (trigger from `_layout.tsx` foreground lifecycle, or via `expo-background-task`):
     - `db.exec('DELETE FROM ai_messages WHERE createdAt < $now - 90d')`
     - Same for each table per TTL.
     - `db.exec('VACUUM')` — reclaims SQLCipher file size. In production with SQLCipher, use `PRAGMA wal_checkpoint(TRUNCATE)` then `VACUUM`.
   - Add `storage.byteSize()` calls to report per-account MMKV size; log to console or SovereignBus.

2. **Modify `apps/gurudevi-mobile/app/_layout.tsx`**
   - Hook the retention scheduler into the existing "app foregrounded" invariant (Section 9 of data-state-lifecycle.md already lists "cache eviction job runs" — implement it here).
   - Add a one-time "run retention now" debug action in the dev menu (optional).

**Acceptance criteria for P1:**
- After 2 weeks of regular use, per-account SQLite file size does not grow unboundedly (measured on a low-storage device emulator or physical device with ~200MB free).
- `VACUUM` reduces the SQLCipher `.db` file size by at least 20% after a prune cycle.
- No UI flicker or ANR from the foreground scheduler (runs < 200ms, background via `expo-background-task`).
- `storage.byteSize()` reports reasonable values (comparable to prior MMKV size, now with tracking).

### Phase 3 — Postgres server-side efficiency (Phase 3)

**Files to modify/add (infrastructure / supabase migrations):**

1. **Archive/partition unbounded append-only tables** in Supabase:
   - `sentinel_audit_logs`, `security_audit_logs`, `growth_events` — define age-based partition (e.g. every 90 days) so they don't grow forever and clobber Postgres memory/IO.
   - Keep triggers that forward-new-rows to the current partition; old partitions read-only.

2. **Denormalized counter hygiene**:
   - Verify `member_count` on `community_groups`, `endorsement_count` on `SanctuaryManifesto`, `nodes` counters (`view_count`, `endorsement_count`, `bookmark_count`), `collections.resource_ids` / `sequence_order` stay trigger-consistent.
   - If drift found, add a nightly recompute job (cron on the Supabase project or a Cloudflare Worker) that recomputes from the source-of-truth tables (`collection_nodes`, `group_members`, `community_reactions`).

3. **Heavy column review**:
   - `nodes.embedding` (vector) + `search_vector` (tsvector) + localized arrays — confirm these are server-only; they must not be part of the PowerSync publication (they aren't, but double-check no accidental `SELECT *` in any stream).
   - If device ever needed them, consider compression (PGroaring for vectors, toast for large text).

**Acceptance criteria for Phase 3:**
- Postgres `pg_partitions` shows partitions for the 3 audit/event tables, each < 5M rows.
- `pg_stats` shows no table exceeding the high-water bloat mark (> 30% dead tuples) without `autovacuum` having run.
- Denormalized counters match source-of-truth within ±1 (within transaction tolerance).
- No `nodes` columns sync down to mobile (confirmed via PowerSync stream diff).

### Phase 4 — MMKV hygiene hooks (Phase 5 from earlier)

**Files to modify:**

1. **`packages/core/src/native/storage.ts`** + **`MMKVStorageAdapter.ts`**
   - Add `byteSize()` tracking on `getStoredValue` / `setStoredValue` — expose via `storage.byteSize()` returning `{ [key: string]: number }` approximate bytes.
   - Add a periodic `trim()` call (e.g. every 24h via `expo-background-task` or on account swap) that calls `storage.trim()` to clear unused keys + memory cache.
   - Add `compareBeforeSet` guard for hot keys: before `storage.set('key', val)`, check `storage.get('key') === val`; if same, skip the write.
   - On account removal / consent revocation, keep the existing `storage.clearAll()` path (already used for PDPA).

2. **Modify `apps/gurudevi-mobile/app/_layout.tsx`**
   - On app foreground, after retention prune, call `storage.trim()` to evict stale MMKV keys.

**Acceptance criteria for Phase 4:**
- `storage.byteSize()` returns non-zero values for all accounts (proof of concept, not production-size accuracy yet).
- After `trim()`, per-account MMKV directory size shrinks (measured via `PlatformConstants` or `fs` on bare React Native).
- `compareBeforeSet` reduces MMKV disk writes for the feature-flag cache and localSeq counter by at least 30% in simulation.

---

## 3. Verification & Gates

| Gate | Command | Pass condition |
|---|---|---|
| **Typecheck** | `pnpm run typecheck` (or `turbo typecheck --filter=*`) | No new `any` / `unknown` leaks; all touched packages (`core`, `schema`, `database`, `gurudevi-mobile`) compile. |
| **Lint** | `pnpm run lint` | Zero new violations; no `// biome-ignore` suppressions added for the changes. |
| **Test** | `pnpm run test` (or project-specific `vitest`/`jest`) | Existing tests pass; new drift-check test passes (P0); retention scheduler test runs without crash (P1). |
| **Anti-slop** | `pnpm run check:anti-slop` | `aislop` + `fallow` exit 0. No restating comments; no dead abstractions; no duplicate utilities; no defensive noise; no weakened tests; no quality-gate suppression. |
| **Stack-map** | `pnpm run stack-map:bootstrap` then `pnpm run stack-map` | After any workspace-package or dependency change, the stack-map annotations YAML is updated and the generated docs are fresh. |
| **Quality gate (gurudevi-quality-gate)** | Activates when editing files in `apps/gurudevi-mobile`, `src/hooks`, `src/lib`, `app/_layout`, `src/providers`, `packages/core` | Blast-radius classification, DRY discipline, feature-spec contracts all honored. |

---

## 4. Rollout Checklist

- [ ] Create `.agents/skills/storage-efficiency/SKILL.md` (done)
- [ ] Create `docs/architecture/2026-08-25-storage-efficiency-plan.md` (done)
- [ ] P0: reconcile `AppSchema` → single SSOT (drift fix + `local_only` annotation + `sync.ts` trim)
- [ ] P1: implement retention + `VACUUM` scheduler (TTL config + foreground job + `expo-background-task`)
- [ ] P3: Postgres archive/partition + denormalized-counter verification
- [ ] P4/MMKV: `byteSize` + `trim` + `compareBeforeSet` hooks
- [ ] Run `pnpm run check:anti-slop` on feature branch; fix any findings
- [ ] Run `pnpm run stack-map:bootstrap` + `pnpm run stack-map`; review annotations
- [ ] Merge to `main-dev` only after all gates exit 0

--- 

*Next: start with P0 — the drift reconciliation. This is the highest-risk fix (correctness + storage) and has the most immediate impact on the low-device constraint case.*