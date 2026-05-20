# Local-First Transition Specification: Drizzle ORM & op-sqlite

This document defines the formal engineering specification for transitioning the Gurudevi mobile client (`gurudevi-mobile`) to a high-performance, type-safe local-first architecture using **Drizzle ORM** and **op-sqlite** as a modern JSI replacement for the deprecated `react-native-quick-sqlite` library.

---

## 1. Executive Summary & Architectural Shift

The 2026 local-first engineering landscape dictates a transition from **legacy synchronous SQLite bridge execution** to **modern zero-overhead direct native memory access (JSI)**.

```
                  [React Native JS Thread]
                              │
                              │ (Direct C++ Memory Pointer via JSI)
                              ▼
┌───────────────────────── op-sqlite ─────────────────────────┐
│                                                             │
│   [SQLCipher AES-256] ──► [SQLite Core (Direct Access)]     │
│            ▲                                                │
│            │ (Adapter logic)                                │
│   [@powersync/op-sqlite] ◄──► [PowerSync Sync Stream]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Historically, the Gurudevi client was bound to `@journeyapps/react-native-quick-sqlite` due to early PowerSync peer dependencies. However, in 2026:
1. **Quick-SQLite is officially deprecated**. Its creator (`ospfranco`) has shifted support entirely to `op-sqlite`.
2. **PowerSync officially recommends `op-sqlite`** via the `@powersync/op-sqlite` driver adapter.
3. **Security Compliance**: `op-sqlite` compiles directly with **SQLCipher**, enabling secure AES-256 file encryption of student academic and well-being logs on device.

We are replacing `quick-sqlite` with `op-sqlite` under the hood, and wrapping our local query layer in **Drizzle ORM** for 100% type safety.

---

## 2. The Dual-Database Boundary (Replication vs. Local-Only)

To prevent replication anomalies, triggers, and virtual table corruption, **high-dimensional vector tables and heavy local-only drafts must be completely isolated from PowerSync's sync loop.**

We enforce a **Strict Dual-File Database Architecture**:

### A. Replicated Database: `gurudevi-powersync.db`
*   **Driver**: `@powersync/op-sqlite` + SQLCipher.
*   **Role**: Mirrors cloud-synced tables (`students`, `classrooms`, `attendance`, `mood_logs`, `schools`).
*   **Synchronization**: Automatically managed via PowerSync's background replication protocol (Path 1).
*   **Encryption**: SQLCipher enabled with device-generated keys stored in SecureStore.

### B. Local-Only Database: `gurudevi-local.db`
*   **Driver**: Pure `@op-engineering/op-sqlite` (standalone) + Drizzle SQLite Core.
*   **Role**: Manages non-replicated assets, heavy draft queues, FTS5 full-text caches, and on-device ONNX mood vector embeddings (`sqlite-vec`).
*   **Synchronization**: **None**. It is purely offline, zero-network, local native memory.

---

## 3. Drizzle + PowerSync AST Query Compilation

To achieve real-time reactive UI rendering, **we cannot bypass PowerSync's logical replication engine by executing raw, direct writes or standard Drizzle live queries** on the replicated database.

Instead, we use Drizzle ORM strictly as a **Type-Safe AST (Abstract Syntax Tree) Query Compiler**. 

### The Reactive Query Flow
1. Drizzle compiles the relational JavaScript query builder expression into an optimized SQL string and an array of bind parameters.
2. The compiled query is passed to PowerSync’s native **`useLiveQuery`** hook.
3. PowerSync watches the local SQLite transaction logs and automatically triggers a UI re-render when the logical sync stream inserts or modifies rows matching the query.

```
[Drizzle Query Builder] ──► [AST Compiler (prepare)] ──► [SQL String & Bind Params]
                                                                  │
                                                                  ▼
[UI Renders Instantly] ◄── [PowerSync useLiveQuery] ◄── [PowerSync watch()]
```

---

## 4. Implementation Blueprint & Code Patterns

### Step 1: Drizzle Relational Schema Definition
Instead of raw strings, define the unified local-first schemas in `packages/core/src/adapters/powersync/schema.ts` using Drizzle:

```typescript
// packages/core/src/adapters/powersync/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  classroomId: text('classroom_id').notNull(),
  schoolId: text('school_id').notNull(),
  gradeId: text('grade_id'),
  sectionId: text('section_id'),
  admissionNumber: text('admission_number'),
  // mode: 'boolean' automatically handles 0/1 integer casting at database level
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const classrooms = sqliteTable('classrooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  schoolId: text('school_id').notNull(),
  academicYear: text('academic_year').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;
```

### Step 2: Lazy DB Wrapping & Initialization
We initialize PowerSync using the `@powersync/op-sqlite` adapter, and then construct the Drizzle wrapper:

```typescript
// packages/core/src/adapters/powersync/database.ts
import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { PowerSyncDatabase } from '@powersync/react-native';
import { OPConnection } from '@powersync/op-sqlite';
import * as schema from './schema';

let _powerSyncInstance: PowerSyncDatabase | null = null;
let _drizzleInstance: ReturnType<typeof wrapPowerSyncWithDrizzle<typeof schema>> | null = null;

export function getPowerSyncDB() {
  if (!_powerSyncInstance) {
    // 1. Initialize OP-SQLite connection with SQLCipher encryption key
    const opConnection = new OPConnection({
      dbName: 'gurudevi-powersync.db',
      encryptionKey: 'device-secure-store-key' // Loaded securely
    });

    // 2. Instantiate PowerSync database using the JSI adapter
    _powerSyncInstance = new PowerSyncDatabase({
      database: opConnection,
      schema: new DrizzleAppSchema(schema)
    });
  }
  return _powerSyncInstance;
}

export function getDrizzleDB() {
  if (!_drizzleInstance) {
    const psDb = getPowerSyncDB();
    // 3. Wrap PowerSync database in Drizzle core
    _drizzleInstance = wrapPowerSyncWithDrizzle(psDb, { schema });
  }
  return _drizzleInstance;
}
```

### Step 3: Type-Safe Reactive Query Hook
Replace untyped SQL strings inside `hooks.ts` with AST-compiled reactive queries:

```typescript
// packages/core/src/adapters/powersync/hooks.ts
import { eq, and } from 'drizzle-orm';
import { useLiveQuery } from '@powersync/react-native';
import { getDrizzleDB } from './database';
import { students } from './schema';

export function useStudentsInClassroom(classroomId: string) {
  const db = getDrizzleDB();

  // 1. Drizzle compiles the AST (Zero native DB execution overhead here)
  const query = db
    .select()
    .from(students)
    .where(
      and(
        eq(students.classroomId, classroomId),
        eq(students.isActive, true)
      )
    )
    .orderBy(students.fullName)
    .prepare(); // AST Compiler

  // 2. PowerSync watches the transaction log for these criteria
  const { data } = useLiveQuery<Student>(query.sql, query.params);
  
  // 3. Data returns fully typed with automatic boolean mapping completed!
  return data || [];
}
```

---

## 5. Security & Fallback Mechanics: "Pressure Theory"

The local JSI memory functions as a **Safe Harbor**, instantly absorbing user mutations and reducing network anxiety. When the network is available, the hand-off occurs:

```
[User Action] ──► [Instant local C++ JSI Write (op-sqlite)] ──► [Fast UI response (2ms)]
                                                                         │
                                                                  (Outbox drains)
                                                                         ▼
                                                     [ZenStack ReBAC Policy validation]
                                                                         │
                                                                   (Unauthorized?)
                                                                         ▼
                                                       [Secure rollback at PG Gateway]
```

### A. SQLCipher Performance Safeguards
Page-level AES-256 encryption introduces small write-path overhead. To preserve our `<2ms` UI update targets:
*   **Indices**: Every Drizzle table definition must declare explicit indexes on primary search dimensions:
    ```typescript
    index('classroom_idx').on(students.classroomId)
    ```
*   **Background Writes**: Writes must be batched asynchronously outside the main React UI thread where animations live.

### B. Gateway Containment (ZenStack Rules)
When `SyncManager` drains the outbox queue to the Hono backend (`sanctuary-api`), the server re-validates the transaction against the central access matrix:
```typescript
// packages/schema/schema.zmodel
// Strict ReBAC validation on write attempts
@@allow('update', auth().bonds?[capacity == 'teacher' && entity_id == classroom.school_id])
```
If the client's local-first offline state drifted or attempted an unauthorized mutation, it is blocked safely at the gateway, preventing data corruption.

---

## 6. Common Pitfalls to Avoid

1. **The Dual SQLite Engine Collision**: Never import standard `@expo/sqlite` alongside `op-sqlite`. Ensure the bundler targets only a single native C++ engine to keep native sizes minimal.
2. **Schema Drift**: PowerSync's cloud-sync configurations and local Drizzle schemas must remain perfectly synchronized. A schema mismatch will cause PowerSync to fail write replication or throw silent transaction errors.
3. **AST Extraction for Live Queries**: Never attempt `.select().live()` with Drizzle on the PowerSync driver—it will not trigger on replication updates. Always compile Drizzle AST queries and pass them to PowerSync's reactive watchers.
