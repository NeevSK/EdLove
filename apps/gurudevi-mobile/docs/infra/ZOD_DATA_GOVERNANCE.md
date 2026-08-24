---
title: "Guidance: Zod Data Governance (SSOT)"
status: "active"
created: 2026-04-23
updated: 2026-04-23
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Guidance: Zod Data Governance (SSOT)

This document establishes the **Single Source of Truth (SSOT)** pattern for all domain entities in the Gurudevi Sanctuary.

## 1. The Principle: "Define Once, Guard Everywhere"

To avoid the current duplication between `api/schemas`, `logic/schemas`, and `types/*.ts`, we follow the **Zod-backed SSOT** pattern.

*   **Logic Layer as the Source**: All domain definitions MUST reside in `packages/core/src/logic/schemas`.
*   **API Layer as the Consumer**: API modules in `packages/core/src/api` directly import schemas from `logic/schemas` to enforce contracts. The redundant `api/schemas` directory has been removed to avoid "thin re-exports".
*   **Rationale for Logic vs API**:
    *   **DDD Consistency**: Schemas define domain models (Logic), not just API inputs/outputs.
    *   **Boundary Safety**: Logic-layer utilities shouldn't depend on the API layer. Centering schemas in Logic allows them to be shared across Logic, Native, and API layers without circular dependencies.
    *   **Lean API**: The API layer focuses on orchestration and temporal auditing, utilizing schemas defined in the core logic.
*   **Runtime over Static**: TypeScript interfaces tell us what we *think* the data looks like. Zod tells us what the data *actually* is at runtime.

## 2. Implementation Pattern

### Step A: Define the Schema (Logic Layer)
```typescript
// packages/core/src/logic/schemas/student.schema.ts
import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  // ... rest of fields
  occurred_at: z.string().datetime(), // Mandatory event time
  created_at: z.string().datetime(),  // Mandatory upload time
});

export type Student = z.infer<typeof StudentSchema>;
```

### Step B: Re-export the Type (Types Layer)
```typescript
// packages/core/src/types/Student.ts
import { Student as StudentInferred } from '../logic/schemas/student.schema';
export type Student = StudentInferred;
```

## 3. Mandatory Fields (The Foundation Map)

Every domain object that flows through the system must include the following temporal and relational metadata:

| Field | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key |
| `occurred_at` | `ISO8601` | When the event actually happened (e.g. attendance taken). |
| `created_at` | `ISO8601` | When the record was synced to the cloud. |
| `academic_cycle_id`| `UUID` | Linking to the current school year/term. |

## 4. Iterative Healing Plan

3.  **Wipe**: Deleted the `src/api/schemas` directory. API modules now import directly from `logic/schemas`.
4.  **Derive**: Update `src/types/*.ts` to use `z.infer`.

---
*Reference: gurudevi_master_implementation_v2.md (Section 2.10)*
