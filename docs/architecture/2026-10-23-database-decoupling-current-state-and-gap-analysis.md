---
title: "Database Decoupling — Current State and Gap Analysis"
status: "superseded"
created: 2026-10-23
updated: 2026-10-25
superseded_by: "../current_progress/2026-10-25-identity-auth-and-decoupling-plan-reconciliation.md"
author: "Naveen"
scribe: "Antigravity"
tags: [database, architecture, supabase, zenstack, powersync, decoupling]
---

# Database Decoupling — Current State & Gap Analysis

> Historical October 23 assessment. Its portability percentages and
> zero-code-switch claims are not verified completion evidence. The
> [October 25 source reconciliation](../current_progress/2026-10-25-identity-auth-and-decoupling-plan-reconciliation.md)
> distinguishes SQL transport, Supabase-dependent schema/auth, client writes
> and actual provider migration requirements.

## Executive Summary

The Polymath Platform incorporates three distinct data access tiers across its monorepo. While the architectural documentation states a strict Hexagonal / Ports-and-Adapters boundary separating the platform from vendor lock-in, an empirical source audit demonstrates that the three layers exhibit drastically different degrees of decoupling from Supabase.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Layer 1: @repo/database (ZenStack + Kysely + pg)                       │
│ Status: FULLY DECOUPLED (100%) — Pure Postgres Wire Protocol           │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 2: @repo/core/adapters/supabase* (Supabase JS SDK & Repos)       │
│ Status: PARTIALLY DECOUPLED (~50%) — Architectural Leaks in Factory    │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 3: @repo/core/adapters/powersync* (PowerSync SQLite Engine)      │
│ Status: CLEANLY ISOLATED (90%) — Contained behind IDatabasePort        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Layer-by-Layer Architectural Audit

### 1.1 Layer 1: `@repo/database` (Canonical Server-Side Store)

- **Components**: [`client.ts`](file:///c:/x/packages/database/src/client.ts), `PostgresDialect` (Kysely), `pg.Pool`, `ZenStackClient`.
- **Schema Source**: [`packages/schema/schema.zmodel`](file:///c:/x/packages/schema/schema.zmodel).
- **The Stated Architecture**: Neutral, relational client governed by ZenStack policies and parameterized query ports.
- **The Code Reality**:
  ```ts
  // packages/database/src/client.ts
  import { schema } from '@repo/schema';
  import { ZenStackClient } from '@zenstackhq/orm';
  import { PostgresDialect } from 'kysely';
  import { Pool } from 'pg';

  export const createZenStackDb = (user: AuthUser, databaseUrl?: string) => {
    const dialect = new PostgresDialect({
      pool: getPool(databaseUrl),
    });
    return new ZenStackClient(schema, {
      dialect,
      user: { id: user.id },
    });
  };
  ```
- **Audit Findings**:
  - Zero Supabase dependencies or imports in `@repo/database` or `@repo/schema`.
  - The sole binding is the `DATABASE_URL` connection string.
  - Changing the physical backing store (e.g., to Neon, CockroachDB, or self-hosted Postgres) requires zero code modification in this package.

---

### 1.2 Layer 2: `@repo/core/adapters/supabase*` (Application & Identity Layer)

- **Components**: [`supabaseClient.ts`](file:///c:/x/packages/core/src/adapters/supabaseClient.ts), [`supabaseIdentity.adapter.ts`](file:///c:/x/packages/core/src/adapters/supabaseIdentity.adapter.ts), [`auth.adapter.ts`](file:///c:/x/packages/core/src/adapters/supabase/auth.adapter.ts), and 25+ domain repositories under `adapters/supabase/`.
- **The Stated Architecture**: Pure Hexagonal Architecture. Business logic communicates strictly through ports:
  - [`IAuthPort`](file:///c:/x/packages/core/src/logic/ports/auth.port.ts)
  - [`IIdentityPort`](file:///c:/x/packages/core/src/logic/ports/identity.port.ts)
  - [`IDatabasePort`](file:///c:/x/packages/core/src/logic/ports/database.port.ts)
- **The Code Reality (The Gaps & Leaks)**:

#### Gap 1: Concrete Type Leaking in the Domain Service Factory
In [`packages/core/src/logic/domains/factory.ts`](file:///c:/x/packages/core/src/logic/domains/factory.ts):
```ts
import type { SupabaseClient } from '@supabase/supabase-js';

export const createDomainServices = (
  supabase: SupabaseClient, // <--- Vendor type leak
  overrides?: { educationalSideEffects?: EducationalSideEffects },
) => { ... }
```
Even though repositories are housed under `adapters/supabase/`, the top-level domain factory explicitly demands an instance of `SupabaseClient`. Any consumer wanting to instantiate domain services must provide a Supabase SDK object, preventing clean inversion of control.

#### Gap 2: Dual Identity & PostgREST Mutation in `SupabaseIdentityAdapter`
In [`packages/core/src/adapters/supabaseIdentity.adapter.ts`](file:///c:/x/packages/core/src/adapters/supabaseIdentity.adapter.ts):
The adapter implements `IIdentityPort` (designed for authentication & bond lookup), but directly executes raw PostgREST mutations against tables that are already modeled in ZenStack:
```ts
supabaseCall(() => supabaseClient.from('users').update(normalizedUpdates).eq('id', userId));
supabaseCall(() => supabaseClient.from('personal_classrooms').insert({ ... }));
supabaseCall(() => supabaseClient.from('bonds').upsert({ ... }));
```
This bypasses Layer 1 (`@repo/database` / ZenStack), bypassing data validation, row-level policy generation, and transactional boundaries.

#### Gap 3: Direct Repository Invocations across 25+ Files
Over 25 repository files in `packages/core/src/adapters/supabase/` depend directly on `supabase.from('table_name')`. While placing them in `adapters/` respects directory structure, there are no parallel Kysely/SQL implementations, locking all web and mobile application logic to Supabase PostgREST endpoints.

---

### 1.3 Layer 3: `@repo/core/adapters/powersync*` (Offline SQLite Sync Engine)

- **Components**: [`database.ts`](file:///c:/x/packages/core/src/adapters/powersync/database.ts), [`SupabasePowerSyncConnector.ts`](file:///c:/x/packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts).
- **The Stated Architecture**: Offline-first client engine implementing [`IDatabasePort`](file:///c:/x/packages/core/src/logic/ports/database.port.ts).
- **The Code Reality**:
  - `IDatabasePort` is fully provider-neutral (exposing `query<T>`, `enqueueMutation`, `getSyncHealth`).
  - PowerSync utilizes Supabase exclusively inside `SupabasePowerSyncConnector` to fetch sync tokens (`client.auth.getSession()`).
  - Local client operations and UI live queries interact with SQLite via PowerSync, never seeing Supabase.

---

## 2. Decoupling Scorecard

| Architectural Seam | Promise | Empirical Reality | Vendor Coupling Risk |
| :--- | :--- | :--- | :--- |
| **`@repo/database` (Server Postgres)** | Generic SQL | Kysely + ZenStack + pg | **Zero (Wire Protocol)** |
| **`@repo/schema` (ZModel definitions)** | Provider-neutral | Pure AST & DDL generator | **Zero** |
| **`IAuthPort` Contract** | Provider-agnostic | Clean interface, zero SDK types | **Zero** |
| **`SupabaseAuthAdapter` Implementation** | Encapsulated | ~320 LOC of Supabase Auth calls | **Low (Scoped to single adapter)** |
| **`IIdentityPort` Contract** | Provider-agnostic | Clean interface | **Zero** |
| **`SupabaseIdentityAdapter` Impl** | Encapsulated | Raw `.from()` PostgREST writes | **High (Bypasses Layer 1 ORM)** |
| **Domain Factory (`factory.ts`)** | Hexagonal DI | Takes `SupabaseClient` concrete type | **High (Type-level coupling)** |
| **Domain Repositories (25+ repos)** | Decoupled | Hardcoded PostgREST REST calls | **High (Requires re-implementation)** |
| **`IDatabasePort` (PowerSync)** | Sync engine agnostic | PowerSync encapsulated behind port | **Low** |

---

## 3. Root Cause Analysis

1. **The PostgREST Trap**: Because Supabase generates instant HTTP CRUD APIs from Postgres tables, early client features directly queried `supabase.from(...)` to ship quickly, rather than establishing standard RPC/ORPC or ORM data-access services.
2. **Conflation of Auth and Data**: The `supabase-js` SDK unifies authentication, authorization, storage, and database into a single object. Injecting `supabase` into `createDomainServices` seemed convenient, but it dragged the client database SDK into domain wiring.
3. **Dual Data Paths**: The server routes through `@repo/database` (ZenStack + pg), while client adapters route through Supabase PostgREST (`.from()`). This creates an architectural split where the exact same table is managed through two completely different dialling mechanisms.
