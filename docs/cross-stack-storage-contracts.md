# Cross-Stack Storage Contracts
**Purpose:** Enforce single SSOT (ZenStack `.zmodel`) → Postgres ↔ Drizzle `AppSchema` ↔ PowerSync publication alignment. Prevents silent drift that causes CRUD-queue bloat, replication failures, and storage waste.
**Status:** Active — implements the "Single SSOT Reconciliation Rule" from `storage-efficiency` skill

---

## 1. The Contract

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CROSS-STACK STORAGE CONTRACT                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Postgres (Supabase)                    Drizzle Local (Mobile)            │
│   ─────────────────────                   ─────────────────────             │
│   SSOT: apps/gurudevi-mobile/              SSOT: packages/core/            │
│        supabase/migrations/                     adapters/powersync/         │
│        *.sql (110+ files)                         schema.ts                │
│                                                                             │
│   ZenStack Domain (.zmodel)                                                     │
│   ────────────────────────                                                      │
│   packages/schema/schema.zmodel                                                    │
│   → generates Prisma + Zod + ORM metadata                                           │
│   → single domain authority for types, relations, policies                          │
│                                                                             │
│   PowerSync Publication                                                   │
│   ──────────────────────                                                   │
│   apps/gurudevi-mobile/supabase/                                            │
│   migrations/20260812000000_powersync_publication.sql                       │
│   4 tables: bonds, school_memberships, classrooms, classroom_students      │
│                                                                             │
│   powersync/sync-config.yaml                                                │
│   2 streams: identity + classroom_roster                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Alignment Rules

| Rule | Enforcement |
|------|-------------|
| **R1:** ZenStack `.zmodel` is the domain SSOT for all structural types, relations, enums, policies | `pnpm --filter @repo/schema generate` runs `zenstack generate` |
| **R2:** Postgres migrations are the physical SSOT for cloud schema | 110+ numbered SQL migrations in `supabase/migrations/` |
| **R3:** Drizzle `AppSchema` columns for **published tables** must match Postgres exactly | Drift-check test (CI gate) |
| **R4:** Drizzle `AppSchema` for **non-published tables** are local-only caches | `LOCAL_ONLY_TABLES` set + `isLocalOnlyTable()` guard |
| **R5:** PowerSync publication lists exactly 4 tables; no others | Publication migration + sync-config.yaml |
| **R6:** Server upload handler (`sync.ts`) only maps the 4 published tables | `tableToModelMap` trimmed to 4 entries |

---

## 2. Drift-Check Test (CI Gate)

### 2.1 Implementation
```typescript
// packages/core/src/adapters/powersync/drift-check.test.ts
import { describe, it, expect } from 'vitest';
import { AppSchema, LOCAL_ONLY_TABLES, isLocalOnlyTable } from '@repo/core/adapters/powersync';

describe('Storage Contract: AppSchema ↔ Postgres Alignment', () => {
  const SYNCED_TABLES = ['bonds', 'school_memberships', 'classrooms', 'classroom_students'] as const;
  const LOCAL_ONLY_TABLES_LIST = [
    'pricingManifest', 'userEntitlementGrants', 'userPreferences',
    'attendance', 'students', 'moodLogs', 'schools',
    'cedarPolicies', 'permissionSnapshots', 'policyVersion',
    'formTemplates', 'formResponses'
  ] as const;

  it('LOCAL_ONLY_TABLES matches expected 12 tables', () => {
    expect(LOCAL_ONLY_TABLES.size).toBe(LOCAL_ONLY_TABLES_LIST.length);
    for (const t of LOCAL_ONLY_TABLES_LIST) {
      expect(isLocalOnlyTable(t)).toBe(true);
    }
    for (const t of SYNCED_TABLES) {
      expect(isLocalOnlyTable(t)).toBe(false);
    }
  });

  it('tableToModelMap contains exactly the 4 synced tables', async () => {
    // Dynamic import to test the actual runtime map
    const { tableToModelMap } = await import('@repo/core/api/handlers/sync');
    const keys = Object.keys(tableToModelMap);
    expect(keys.sort()).toEqual([
      'bonds',
      'classroom',
      'classroom_student',
      'classroom_students',
    ].sort());
  });

  it('AppSchema exports exactly 16 tables (4 synced + 12 local)', () => {
    const schemaKeys = Object.keys(AppSchema);
    expect(schemaKeys).toHaveLength(16);
    for (const t of SYNCED_TABLES) {
      expect(schemaKeys).toContain(camelCase(t));
    }
    for (const t of LOCAL_ONLY_TABLES_LIST) {
      expect(schemaKeys).toContain(t);
    }
  });
});

function camelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
```

### 2.2 Column-Level Drift Check (Postgres Introspection)
```typescript
// packages/core/src/adapters/powersync/column-drift-check.test.ts
import { describe, it, expect } from 'vitest';
import { supabaseAdmin } from './supabase-admin'; // service role client
import { AppSchema } from '@repo/core/adapters/powersync';

const SYNCED_TABLES = ['bonds', 'school_memberships', 'classrooms', 'classroom_students'];

describe('Column-Level Drift Check (requires Supabase connection)', () => {
  for (const table of SYNCED_TABLES) {
    it(`${table}: Drizzle columns match Postgres`, async () => {
      // Query Postgres information_schema
      const { data: pgCols } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table)
        .order('ordinal_position');

      const drizzleTable = AppSchema[camelCase(table)];
      const drizzleCols = Object.entries(drizzleTable.columns).map(([name, col]) => ({
        name,
        type: col.getTypeName(),
        notNull: col.isNotNull(),
        default: col.getDefault(),
      }));

      // Compare (simplified — expand for full type mapping)
      for (const pg of pgCols) {
        const d = drizzleCols.find(c => c.name === pg.column_name);
        expect(d).toBeDefined();
        // Add type equivalence checks: UUID ↔ text, TIMESTAMPTZ ↔ text, BOOLEAN ↔ integer(mode:'boolean')
      }
    });
  }
});
```

---

## 3. Migration Workflow (Adding/Changing Synced Tables)

### 3.1 Adding a New Table to PowerSync Publication

**Step 1: ZenStack Domain** (`packages/schema/schema.zmodel`)
```zmodel
model NewTable {
  id String @id @default(uuid())
  userId String
  data Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("new_table")
}
```

**Step 2: Generate & Migrate**
```bash
# 1. Generate Prisma schema from .zmodel
pnpm --filter @repo/schema generate

# 2. Create Postgres migration (supabase CLI or manual SQL)
# File: apps/gurudevi-mobile/supabase/migrations/YYYYMMDDHHMMSS_new_table.sql
CREATE TABLE public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX new_table_user_id_idx ON public.new_table (user_id);
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;
-- RLS policies...

# 3. Add to PowerSync publication
# File: apps/gurudevi-mobile/supabase/migrations/YYYYMMDDHHMMSS_powersync_publication_update.sql
ALTER PUBLICATION powersync ADD TABLE public.new_table;
ALTER TABLE public.new_table REPLICA IDENTITY FULL;

# 4. Add sync stream
# File: powersync/sync-config.yaml
streams:
  identity:
    queries:
      # ... existing
      - SELECT * FROM new_table WHERE user_id = auth.user_id()

# 5. Add to Drizzle AppSchema (packages/core/src/adapters/powersync/schema.ts)
export const newTable = sqliteTable('new_table', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  data: text('data').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (t) => [index('new_table_user_idx').on(t.userId)]);

export const AppSchema = {
  // ... existing
  newTable,
};

# 6. Update LOCAL_ONLY_TABLES if NOT synced (remove from list)
# 7. Update sync.ts tableToModelMap if synced
#    tableToModelMap['new_table'] = 'newTable';

# 8. Run drift-check test
pnpm test drift-check
```

### 3.2 Changing a Column on a Synced Table
**Forbidden without migration:** Column type/name changes on the 4 published tables break replication.

**Correct process:**
1. Create Postgres migration with `ALTER TABLE ... ALTER COLUMN ... TYPE ... USING ...`
2. Create corresponding Drizzle schema change (matching type exactly)
3. Update drift-check test expectations
4. Deploy migration → verify replication → deploy app

---

## 4. Local-Only Tables Contract

### 4.1 Current Local-Only Tables (12)
| Drizzle Key | Table Name | Purpose | Sync Source |
|-------------|------------|---------|-------------|
| `pricingManifest` | `pricing_manifest` | Pricing tier features | REST hydration |
| `userEntitlementGrants` | `user_entitlement_grants` | User entitlements | REST hydration |
| `userPreferences` | `user_preferences` | UI prefs, draft state | Local writes only |
| `attendance` | `attendance` | Attendance records (local-first) | Local writes → REST sync (Zone B) |
| `students` | `students` | Student roster cache | REST hydration |
| `moodLogs` | `mood_logs` | Wellbeing logs | Local writes → REST sync |
| `schools` | `schools` | School metadata cache | REST hydration |
| `cedarPolicies` | `cedar_policies` | Policy DSL cache | Background fetch |
| `permissionSnapshots` | `permission_snapshots` | AuthZ snapshots | Background fetch |
| `policyVersion` | `policy_version` | Policy version tracker | Background fetch |
| `formTemplates` | `form_templates` | Form builder templates | REST hydration |
| `formResponses` | `form_responses` | Form submissions | Local writes → REST sync |

### 4.2 Enforcement Rules
| Rule | Implementation |
|------|----------------|
| Never appear in `sync-config.yaml` streams | Manual review + CI check |
| Never in `tableToModelMap` (sync.ts) | Trimmed to 4 entries |
| Marked in `LOCAL_ONLY_TABLES` set | `isLocalOnlyTable('attendance') === true` |
| CRUD via `SecureDrizzleProxy` → direct REST | Not via PowerSync queue |

---

## 5. PowerSync Upload Handler Contract

### 5.1 Current `tableToModelMap` (4 Entries Only)
```typescript
// packages/core/src/api/handlers/sync.ts
const tableToModelMap: Record<string, string> = {
  bonds: 'bond',
  classroom: 'classroom',
  classroom_student: 'classroomStudent',
  classroom_students: 'classroomStudent',
};
```

### 5.2 Contract Test
```typescript
// packages/core/src/api/handlers/sync.test.ts
import { describe, it, expect } from 'vitest';
import { applyPowerSyncBatch } from './sync';

describe('Sync Handler Contract', () => {
  it('rejects CRUD for non-published tables', async () => {
    const mockDb = createMockPrismaClient();
    const crud = [{ id: '1', op: 'PUT', table: 'attendance', opData: {} }];
    
    await expect(applyPowerSyncBatch(mockDb, crud))
      .rejects.toThrow('Unsupported sync table: attendance');
  });

  it('accepts CRUD for published tables', async () => {
    const mockDb = createMockPrismaClient({
      bond: { upsert: vi.fn().mockResolvedValue({}) },
      classroom: { upsert: vi.fn().mockResolvedValue({}) },
      classroomStudent: { upsert: vi.fn().mockResolvedValue({}) },
    });
    const crud = [
      { id: '1', op: 'PUT', table: 'bonds', opData: { userId: 'u1', entityId: 'e1' } },
      { id: '2', op: 'PUT', table: 'classroom', opData: { name: 'Class A' } },
    ];
    
    const result = await applyPowerSyncBatch(mockDb, crud);
    expect(result.success).toBe(true);
  });
});
```

---

## 6. Verification Checklist (Per Change)

| Check | Command / Test | Required For |
|-------|----------------|--------------|
| ZenStack generates cleanly | `pnpm --filter @repo/schema generate` | Any `.zmodel` change |
| Postgres migration applies | `supabase db push` (local) | New migration |
| Drift-check passes | `pnpm test drift-check` | Any schema change |
| Column-level drift passes | `pnpm test column-drift-check` (needs DB) | Synced table change |
| Sync handler test passes | `pnpm test sync-handler` | `tableToModelMap` change |
| Typecheck clean | `pnpm run typecheck` | Any TS change |
| Lint clean | `pnpm run lint` | Any TS change |
| Anti-slop clean | `pnpm run check:anti-slop` | Any code change |

---

## 7. Troubleshooting Drift

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `ps_crud` queue grows unbounded | Local-only table in `tableToModelMap` | Trim map; add to `LOCAL_ONLY_TABLES` |
| PowerSync replication fails | Column type mismatch (e.g., `is_active` vs `is_archived`) | Align Drizzle to Postgres; run drift-check |
| `classroom_students` duplicate key | `REPLICA IDENTITY FULL` + missing PK in Drizzle | Ensure Drizzle PK matches Postgres PK |
| Feature flag not updating | MMKV `compareBeforeSet` + stale cache | `storage.clearAll()` or bump key version |
| SQLite file grows unbounded | No retention prune + no `VACUUM` | Run retention scheduler; verify `VACUUM` |

---

## 8. Related Skills & Docs

| Skill | Purpose |
|-------|---------|
| `storage-efficiency` | Cross-stack doctrine (this doc implements §1) |
| `zenstack-schema-modeling` | `.zmodel` syntax, `@@index`, `@@map` |
| `zenstack-db-migration` | `zen migrate` workflow |
| `powersync` | Sync mechanics, `compact`, EXPLAIN |
| `mmkv-guidance` | KV hygiene, `byteSize`, `trim` |
| `supabase` | Migration workflow, RLS |
| `drizzle` | `sqliteTable`, compound indexes |

| Doc | Purpose |
|-----|---------|
| `docs/mobile-storage-optimization.md` | MMKV, op-sqlite, SQLite PRAGMA |
| `docs/postgres-storage-optimization.md` | Partitioning, archival, autovacuum |
| `docs/architecture/2026-08-25-storage-efficiency-plan.md` | Phase plan + acceptance criteria |
| `docs/architecture/sqlite-drizzle-powersync-mechanics-guide.md` | Data flow mechanics |
| `docs/Core/local-first-architecture-principles.md` | Boundary conditions (Polanyi) |

---

## 9. Quick Reference — File Map

```
packages/
├── schema/
│   └── schema.zmodel              ← DOMAIN SSOT
│   └── src/generated/orm/         ← Generated (DO NOT EDIT)
├── core/
│   ├── src/adapters/powersync/
│   │   ├── schema.ts              ← AppSchema (16 tables)
│   │   ├── schema.ts:315          ← LOCAL_ONLY_TABLES + isLocalOnlyTable()
│   │   ├── hooks.ts:126           ← isArchived (fixed)
│   │   ├── drift-check.test.ts    ← Contract test
│   │   └── column-drift-check.test.ts ← Column-level test
│   └── src/api/handlers/
│       └── sync.ts:28             ← tableToModelMap (4 entries)
apps/gurudevi-mobile/
├── supabase/
│   └── migrations/
│       ├── 20260812000000_powersync_publication.sql
│       └── *.sql                  ← 110+ migrations
├── powersync/
│   └── sync-config.yaml           ← 2 streams
└── src/storage/
    └── retention-scheduler.ts     ← TTL + VACUUM
```

---

**This contract is enforced by:** CI gates (drift-check), code structure (LOCAL_ONLY_TABLES), and the single-SSOT principle. Any violation = build failure.