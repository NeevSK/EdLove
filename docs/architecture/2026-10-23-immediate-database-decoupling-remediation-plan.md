---
title: "Immediate Database Decoupling Remediation Plan"
status: "active"
created: 2026-10-23
author: "Naveen"
scribe: "Antigravity"
tags: [database, refactoring, decoupling, remediation, zenstack, supabase]
---

# Immediate Database Decoupling Remediation Plan

## Objective

Remediate the concrete coupling points identified in the gap analysis without introducing breaking changes to running applications. This restores true Hexagonal Architecture and ensures the platform can switch between Supabase, Neon, CockroachDB, or self-hosted Postgres seamlessly.

---

## Remediation Roadmap (Phase 0 – Phase 2)

```
[Phase 0: Type Inversion] ➔ [Phase 1: Route Identity to ZenStack] ➔ [Phase 2: Boundary Sentinels]
   - Decouple factory.ts      - Move .from() writes to ORM       - Enforce lint/import rules
   - Structural IDataClient   - Unify schema validation          - Validate Neon connection
```

---

## 1. Phase 0: Invert the Domain Factory Signature (Effort: ~30 mins)

### 1.1 The Issue
[`packages/core/src/logic/domains/factory.ts`](file:///c:/x/packages/core/src/logic/domains/factory.ts) directly imports and requires `SupabaseClient`:
```ts
// packages/core/src/logic/domains/factory.ts
import type { SupabaseClient } from '@supabase/supabase-js';

export const createDomainServices = (
  supabase: SupabaseClient,
  overrides?: { educationalSideEffects?: EducationalSideEffects },
) => { ... }
```

### 1.2 The Remediation
Define a structural interface or inject pre-instantiated repository ports:

#### Option A: Structural Query Interface (Minimal Diff)
```ts
// Define neutral contract
export interface IDataQueryClient {
  from: (table: string) => any;
  rpc?: (fn: string, params?: Record<string, any>) => any;
}

export const createDomainServices = (
  client: IDataQueryClient,
  overrides?: { educationalSideEffects?: EducationalSideEffects },
) => {
  const repo = {
    attendance: createSupabaseAttendanceProjectionRepository(client),
    classroomNotes: createSupabaseClassroomNotesRepository(client),
    // ...
  };
  // ...
};
```

#### Option B: Inverted Repository Factory (Recommended Hexagonal Pattern)
Allow passing an existing repository map or falling back to a default resolver, completely removing database clients from domain service instantiation.

---

## 2. Phase 1: Route Identity Mutations to `@repo/database` (Effort: ~2–4 hours)

### 2.1 The Issue
In [`packages/core/src/adapters/supabaseIdentity.adapter.ts`](file:///c:/x/packages/core/src/adapters/supabaseIdentity.adapter.ts), user profile updates, bond upserts, and personal classroom initializations are dispatched via raw PostgREST:
```ts
// Problematic PostgREST calls
supabaseClient.from('users').update(normalizedUpdates).eq('id', userId);
supabaseClient.from('personal_classrooms').insert({ ... });
supabaseClient.from('bonds').upsert({ ... });
```
This causes:
- Bypass of ZenStack validation attributes (`@email`, `@length`).
- Bypassed access control rules (`@@allow`, `@@deny`).
- Dependency on Supabase HTTP API availability even when connected directly to a Postgres pool.

### 2.2 The Remediation
Refactor `SupabaseIdentityAdapter` to separate **Authentication Provider Actions** from **Data Persistence Actions**:
1. Keep `supabaseClient.auth.getUser()` and session methods for token verification.
2. Delegate data mutations to [`createZenStackDb`](file:///c:/x/packages/database/src/client.ts):
```ts
import { createZenStackDb } from '@repo/database';

// In updateProfile:
const db = createZenStackDb({ id: userId });
await db.user.update({
  where: { id: userId },
  data: normalizedUpdates,
});

// In createInitialBond:
await db.bond.upsert({
  where: {
    userId_entityId_capacity: {
      userId,
      entityId,
      capacity: orientation,
    },
  },
  create: { ... },
  update: { ... },
});
```

---

## 3. Phase 2: Boundary Sentinel & Import Firewall (Effort: ~1 hour)

### 3.1 The Issue
Developers can accidentally import `@supabase/supabase-js` into core domain logic, screens, or components without triggering a lint veto.

### 3.2 The Remediation
Add a strict Biome / ESLint boundary rule in `.dependency-cruiser.cjs` or root ESLint:
- **Rule**: `@supabase/supabase-js` may ONLY be imported by:
  - `packages/core/src/adapters/supabase/**`
  - `packages/core/src/adapters/supabaseClient.ts`
  - `packages/core/src/adapters/realtime/**`
  - `packages/core/src/adapters/storage/**`
- **Veto**: Any import of `@supabase/supabase-js` in `src/logic/`, `apps/gurudevi-web/`, `apps/gurudevi-mobile/`, or `@repo/database` triggers an immediate build failure.

---

## 4. Phase 3: Neon Connection Validation Spike (Effort: ~1 hour)

### 4.1 Verification Checklist
1. Provision a test Neon branch.
2. Export `DATABASE_URL=postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`.
3. Run monorepo typecheck and contract tests:
   ```bash
   pnpm --filter @repo/database test
   pnpm --filter @repo/schema generate
   ```
4. Verify that `@repo/database` connects, runs migrations, and queries rows without any Supabase infrastructure active.

---

## Success Criteria & Definition of Done

- [ ] Zero imports of `@supabase/supabase-js` in `packages/core/src/logic/domains/factory.ts`.
- [ ] User, Bond, and Classroom mutations in `supabaseIdentity.adapter.ts` routed through ZenStack ORM.
- [ ] Dependency firewall actively prevents new direct Supabase SDK imports in domain packages.
- [ ] Swapping `DATABASE_URL` to an external Postgres instance (Neon) executes database tests with 0 failures.
