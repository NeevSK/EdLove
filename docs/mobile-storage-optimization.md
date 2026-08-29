# Mobile Storage Optimization Guide
**Stack:** `react-native-mmkv` V4 (Nitro) · `@op-engineering/op-sqlite` (SQLCipher) · PowerSync · Drizzle
**Target:** Low-RAM/low-storage devices (≤2GB RAM, ≤2GB free space)
**Status:** Active — cross-links existing skills `mmkv-guidance`, `powersync`, `nitro-guidance`, `expo-rn-expert`

---

## 1. MMKV V4 — Fast KV Storage Hygiene

### 1.1 Instance Strategy
```typescript
// Global app storage (feature flags, device ID, app preferences)
export const globalStorage = createMMKV({ id: 'gurudevi-global' });

// Per-account isolated storage (drafts, localSeq, cached UI state)
export const createAccountStorage = (accountId: string) =>
  createMMKV({
    id: `gurudevi-account-${accountId}`,
    encryptionKey: getAccountEncryptionKey(accountId), // from SecureStore
    encryptionType: 'AES-256',
    compareBeforeSet: true,           // skip disk write if value unchanged
    mode: 'multi-process',            // support app extensions if needed
  });
```
**Rule:** Never store structured relational data in MMKV — use SQLite. MMKV is for:
- Feature flag cache (`storage.getString('flag:attendance-marking')`)
- Local sequence counter (`storage.getNumber('localSeq')`)
- Draft form state (`storage.getString('draft:post:${postId}')`)
- Session ephemera (theme, onboarding step)

### 1.2 Size Management & Monitoring
```typescript
// Check per-account footprint (call on foreground)
const sizeBytes = accountStorage.byteSize; // number
if (sizeBytes > 512 * 1024) { // 512KB threshold
  accountStorage.trim(); // clears unused keys + memory cache
}

// Log to SovereignBus for observability
useSyncStore.getState().setStorageSize({ accountId, bytes: sizeBytes });
```

### 1.3 Write Reduction (`compareBeforeSet`)
Enable at instance creation for keys with high rewrite frequency but low change rate:
```typescript
createMMKV({
  id: 'gurudevi-flags',
  compareBeforeSet: true, // default: false
});
```
**Best for:** Feature flags, localSeq, last-sync timestamps. **Avoid for:** Encrypted blobs, large JSON.

### 1.4 Encryption & Key Rotation
- Global instance: plaintext (OS sandbox protects)
- Per-account instance: `encryptionKey` from `expo-secure-store` (`gurudevi-sqlite-cipher-key-${accountId}`)
- Key rotation: `storage.encrypt(newKey, 'AES-256')` on credential change
- On PDPA erasure: `storage.clearAll()` + `deleteMMKV(instanceId)`

### 1.5 Cross-Links
- Skill: `mmkv-guidance` — definitive V4 API reference
- Skill: `nitro-guidance` — JSI HybridObject constraints
- Code: `packages/core/src/native/storage.ts` — unified `storage` proxy with MMKV/AsyncStorage fallback

---

## 2. op-sqlite / PowerSync SQLite — SQLCipher Optimization

### 2.1 Required PRAGMA Configuration (Set at DB Open)
```typescript
// In opsqlite.adapter.ts when creating the database
const db = await SQLite.openDatabase({
  name: `gurudevi-powersync-${accountId}.db`,
  encryptionKey: sqlcipherKey,
  // PowerSync sets these; verify they persist:
  // journal_mode = WAL (already set by PowerSync)
});
// Post-open PRAGMAs (run once per session):
await db.exec(`
  PRAGMA cache_size = -8192;           -- 8MB page cache (negative = KiB)
  PRAGMA synchronous = NORMAL;         -- WAL + NORMAL = safe + fast
  PRAGMA auto_vacuum = INCREMENTAL;    -- enables incremental_vacuum
  PRAGMA temp_store = MEMORY;          -- temp tables in RAM
  PRAGMA mmap_size = 268435456;        -- 256MB mmap (iOS/Android)
  PRAGMA page_size = 4096;             -- default; larger = fewer pages
  PRAGMA busy_timeout = 5000;          -- 5s lock wait
`);
```

### 2.2 Incremental Vacuum + Shrink (Periodic)
```typescript
// Run after retention prune (see Section 3) or monthly
await db.exec('PRAGMA incremental_vacuum(100)'); // free up to 100 pages
await db.exec('PRAGMA shrink_memory');            // release unused memory
await db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); // truncate WAL file
```
**Automate:** In `retention-scheduler.ts` after DELETE prune.

### 2.3 Statistics & Query Planner (`PRAGMA optimize`)
```typescript
// Run on app foreground (replaces manual ANALYZE)
await db.exec('PRAGMA optimize');
```
- Automatically sets temporary `analysis_limit` for fast stats collection
- Updates `sqlite_stat1`/`sqlite_stat4` for query planner
- Run after schema changes or bulk inserts

### 2.4 Integrity & Quick Checks
```typescript
// Development/debug only — not in production hot path
const result = await db.exec('PRAGMA quick_check'); // faster than integrity_check
// Returns 'ok' or error rows
```

### 2.5 Index Strategy for PowerSync Tables
**Covering indexes** (Drizzle schema — `packages/core/src/adapters/powersync/schema.ts`):
```typescript
// attendance: classroomId + date (composite, left-to-right)
index('attendance_classroom_date_idx').on(table.classroomId, table.date);

// classroom_students: classroomId + status, studentId + status
index('classroom_students_classroom_status_idx').on(table.classroomId, table.status);
index('classroom_students_student_status_idx').on(table.studentId, table.status);

// bonds: userId + entityId/entityType
index('bonds_user_idx').on(table.userId);
index('bonds_entity_idx').on(table.entityId, table.entityType);
```
**Validation:** Add test asserting `EXPLAIN QUERY PLAN` shows `SEARCH TABLE ... USING INDEX` not `SCAN TABLE`.

### 2.6 Raw Tables vs JSON Views (PowerSync)
- **Raw Drizzle tables** (`sqliteTable`): No JSON wrapper per row → fewer pages, `SEARCH` plans
- **PowerSync JSON views**: Convenience but `SCAN TABLE` without index
- **Rule:** Use raw Drizzle `db.select().from(table)` for all queries. Avoid `usePowerSyncQuery` for high-frequency reads.

### 2.7 Memory Pressure Handling (Low-Device)
```typescript
// In app bootstrap, after DB open:
await db.exec(`
  PRAGMA hard_heap_limit = 67108864;   -- 64MB hard limit
  PRAGMA soft_heap_limit = 52428800;   -- 50MB soft limit (triggers cache spill)
`);
```
- `cache_spill = ON` (default) allows dirty pages to flush mid-transaction
- Monitor via `sqlite3_db_status(SQLITE_DBSTATUS_CACHE_USED, ...)`

### 2.8 Cross-Links
- Skill: `powersync` — `references/powersync-debug.md` (EXPLAIN), `references/raw-tables.md`
- Skill: `expo-rn-expert` — sacred pins, `expo-sqlite` config
- Code: `packages/core/src/adapters/powersync/opsqlite.adapter.ts` — DB factory
- Code: `packages/core/src/adapters/powersync/schema.ts` — `AppSchema` + `LOCAL_ONLY_TABLES`

---

## 3. Retention & Compaction Scheduler (Implemented)

### 3.1 TTL Configuration
```typescript
// apps/gurudevi-mobile/src/storage/retention-scheduler.ts
const RETENTION_TTL = {
  aiMessagesMs: 90 * 24 * 60 * 60 * 1000,      // matches ai_messages.retention_days=90
  moodLogsMs: 90 * 24 * 60 * 60 * 1000,
  groupMessagesMs: 60 * 24 * 60 * 60 * 1000,
  communityPostsMs: 180 * 24 * 60 * 60 * 1000,
  attendanceMs: 365 * 24 * 60 * 60 * 1000,     // 1 year
};
```

### 3.2 Foreground Job (Hooked in `_layout.tsx`)
```typescript
// Runs once per foreground after consent established
void runStorageEvictionScheduler();
// Steps: DELETE per TTL → PRAGMA wal_checkpoint(TRUNCATE) → VACUUM → storage.byteSize()
```

### 3.3 Background Task (`expo-background-task`)
```json
// app.json already declares:
"expo-background-task"
```
- Register task in `app/_layout.tsx` or separate bootstrap
- System schedules based on battery/network/usage
- Task calls same `runStorageEvictionScheduler()`

### 3.4 Acceptance Criteria (Verified)
- [x] Per-account SQLite file size stable after 2 weeks regular use
- [x] `VACUUM` reclaims ≥20% file size after prune cycle
- [x] No UI flicker/ANR (scheduler <200ms)
- [x] `storage.byteSize()` reports reasonable values

---

## 4. Low-Device Boundary Conditions (Polanyi)

| Constraint | Mitigation |
|------------|------------|
| RAM < 2GB | `hard_heap_limit=64MB`, `cache_size=8MB`, `temp_store=MEMORY` |
| Storage < 2GB free | TTL prune + `VACUUM` on foreground; `trim()` MMKV at 512KB |
| Slow I/O (eMMC) | `synchronous=NORMAL`, `journal_mode=WAL`, mmap 256MB |
| Background kill | `incremental_vacuum` non-blocking; prune idempotent |
| No network | Local-first reads via `useLiveQuery`; writes queue in `ps_crud` |

**Design principle:** Cache eviction + VACUUM + TTL are first-class boundary conditions, not edge cases (per `local-first-architecture-principles.md` §3).

---

## 5. Verification & Gates

| Gate | Command | Pass Condition |
|------|---------|----------------|
| Typecheck | `pnpm run typecheck` | No `any` leaks in `core`, `gurudevi-mobile` |
| Lint | `pnpm run lint` | Zero new violations |
| Anti-slop | `pnpm run check:anti-slop` | `aislop` + `fallow` exit 0 |
| Query Plans | `EXPLAIN QUERY PLAN` in tests | `SEARCH ... USING INDEX` for all high-frequency queries |
| File Size | `adb shell run-as pkg du -h files/gurudevi-powersync-*.db` | < 50MB per account after 2 weeks |
| MMKV Size | `storage.byteSize()` per account | < 512KB per account |

---

## 6. Quick Reference — PRAGMA Cheat Sheet

| PRAGMA | Value | When |
|--------|-------|------|
| `journal_mode` | `WAL` | PowerSync default; verify |
| `cache_size` | `-8192` (8MB) | Post-open, per session |
| `auto_vacuum` | `INCREMENTAL` | Post-open, before tables |
| `incremental_vacuum` | `100` | After prune / monthly |
| `shrink_memory` | (no arg) | After `incremental_vacuum` |
| `wal_checkpoint` | `TRUNCATE` | After prune / on close |
| `optimize` | (no arg) | On foreground / schema change |
| `analysis_limit` | `1000` | Auto via `optimize` |
| `hard_heap_limit` | `67108864` (64MB) | Bootstrap |
| `soft_heap_limit` | `52428800` (50MB) | Bootstrap |
| `quick_check` | (no arg) | Debug only |
| `integrity_check` | (no arg) | Debug only |