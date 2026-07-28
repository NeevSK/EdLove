---
title: "2026 Advanced Tools & Patterns: Adoption Matrix"
status: "active"
created: 2026-06-25
updated: 2026-07-26
author: "Naveen"
scribe: "Antigravity"
tags: [api, architecture, strategy, local-first, ai, crdt, orama, onnx, effect]
---

# 2026 Advanced Tools & Patterns: Adoption Matrix

A precision audit of each tool and pattern from the advanced 2026 reference list, cross-verified against the actual workspace codebase. Includes original additions beyond what the reference list covers.

---

## 1. What Is Already Implemented (Stronger Than the List Assumes)

This platform is architecturally ahead of the reference list in several critical areas. The following capabilities exist and are production-ready in the workspace:

### PowerSync: ✅ Fully Implemented
- Bidirectional sync via `SupabasePowerSyncConnector` in [`packages/core/src/adapters/powersync/`](file:///c:/Users/Naween/projects/polymath-platform/packages/core/src/adapters/powersync/)
- **OP-SQLite driver** (`@powersync/op-sqlite`) is already the active native engine in [`opsqlite.adapter.ts`](file:///c:/Users/Naween/projects/polymath-platform/packages/core/src/adapters/powersync/opsqlite.adapter.ts)
- **SQLCipher AES-256 encryption** per-user with `expo-secure-store` key management — keys are device-scoped and never leave the secure enclave
- **Drizzle ORM** (`drizzle-orm/sqlite-core`) is the local schema layer, typed via `$inferSelect`/`$inferInsert` in [`schema.ts`](file:///c:/Users/Naween/projects/polymath-platform/packages/core/src/adapters/powersync/schema.ts)
- **Bulk upload strategy** in `uploadData()` — 200 CRUD ops batched into a single gateway call instead of N individual HTTP requests

### Cedar WASM — Offline-First Local PDP: ✅ Implemented (Unique)
This is not in the reference list and is architecturally rare. [`localEvaluator.ts`](file:///c:/Users/Naween/projects/polymath-platform/packages/core/src/logic/permissions/localEvaluator.ts) runs **Cedar WASM policies directly on-device** against a locally cached `cedar_policies` table (synced via PowerSync). The implementation includes:
- Singleton compilation cache with size-bounded safety (`MAX_LOCAL_POLICY_SIZE_BYTES = 100KB`) to protect lower-end Android from WASM OOM crashes
- **Cryptographic tamper detection**: policy signature verification before evaluation — if a rooted device injects policies, Cedar will evaluate against invalid data and fail-secure
- Dynamic resource attribute resolution from local Drizzle SQLite (works for offline-created entities)
- `DeviceTrustEngine` integration: `trust_status` is passed as Cedar context variable

### GrowthBook Feature Flags: ✅ Implemented (single rollout authority)
- [`featureFlag.factory.ts`](file:///c:/Users/Naween/projects/polymath-platform/packages/core/src/logic/managers/featureFlag.factory.ts) wires the GrowthBook rollout adapter; Supabase is not a feature-rollout fallback.
- The mobile client applies GrowthBook snapshots locally, while the Sanctuary API applies route-level GrowthBook gates before handlers.
- Lifecycle ownership, AppCatalog mapping, stale-flag auditing, and server/CI archival are documented in [Feature Lifecycle Management](../../../../apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md).

---

## 2. Adoption Decision Matrix: The Reference List

### 2.1 Local-First Data & Sync Engines

| Tool | Status | Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **PowerSync** | ✅ Fully active | Keep & complete | Live. Native OP-SQLite driver, encrypted, Drizzle typed. Feature-flagged activation. |
| **Zero (Rocicorp)** | ❌ Not present | **Skip for now** | Sync-by-query is elegant but solves partial-table replication. PowerSync + sync-rules achieves the same result with less infra overhead. Revisit if school-level data bucketing becomes insufficient. |
| **PGlite (WASM Postgres)** | ❌ Not present | **Future — AI Layer** | Compelling for `pgvector` AI embedding search on-device. Direct path to offline semantic search (e.g., "find students with similar learning patterns"). Add when on-device AI inference is prioritized. |
| **CRDTs (Automerge / Loro)** | ❌ Not present | **Targeted adoption** | Needed for shared, real-time collaborative documents (e.g., teacher-edited lesson plans, shared form responses). **Not needed for attendance, grades, or profiles** — those are single-writer-with-conflict-resolution patterns. Adopt Loro (Rust WASM, faster) for the specific lesson editing surface only. |

### 2.2 API, Transport & Edge Layer

| Tool | Status | Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **Hono MCP** | 📋 Documented, not mounted | **Implement (P1)** | Already prescribed in `HONO_PATTERNS.md`. Mount `hono/mcp` at `/mcp`. Immediate win for agentic API introspection. |
| **Hono SSE** | ❌ Not present | **Implement for AI** | `streamSSE` is the correct WinterCG-aligned streaming primitive for AI token delivery. Adopt when AI chat endpoints go live. |
| **Effect-TS** | ❌ Not present | **Do not adopt now** | Effect-TS provides compile-time error channel tracking. Extremely powerful but architecturally invasive — every handler, adapter, and port must be Effect-typed. **The codebase already has `SovereignError` + `normalizeError` which solves 80% of the same problem**. Revisit as a greenfield decision if a new service is built from scratch. |

### 2.3 Database Modeling & Local Drivers

| Tool | Status | Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **ZenStack v3** | ✅ Active on server | Keep | Already the authoritative server-side access control and query layer. |
| **Kysely** | ✅ Active via ZenStack v3 | Keep | ZenStack v3 generates Kysely query builders internally. No direct action needed. |
| **OP-SQLite** | ✅ Active (`@powersync/op-sqlite`) | Keep | Already the native C++ SQLite driver in `opsqlite.adapter.ts`. SQLCipher enabled. |
| **LibSQL** | ❌ Not present | **Skip** | LibSQL (Turso) is an alternative to OP-SQLite for React Native. Since OP-SQLite is already embedded and working with SQLCipher encryption, switching is high-effort for no net gain. |

### 2.4 On-Device Intelligence & Indexing

| Tool | Status | Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **Orama** | ❌ Not present | **Adopt (High Value)** | Orama is a zero-dependency TypeScript full-text + vector search engine. It runs entirely in-memory, meaning it can index your local Drizzle attendance, student, and lesson data and serve instant offline search results with no network round-trip. Critical for search-heavy teacher workflows. |
| **ONNX Runtime** | ❌ Not present | **Future adoption** | Enables quantized AI models (embeddings, intent classifiers) to run natively via Hermes WASM. Required if on-device privacy-native AI becomes a product priority (e.g., local mood pattern detection without cloud calls). Adopt after PGlite is evaluated. |

### 2.5 Architectural Execution Patterns

| Pattern | Status | Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **React 19 `use()` Suspense** | ❌ Not verified in app | **Adopt** | Using `use(promisedValue)` in Suspense boundaries is the correct pattern for initializing Cedar WASM, SQLite engines, and the PowerSync database at app startup. Prevents layout thrashing on cold start. |
| **`InferResponseType<typeof route>`** | ❌ Not used | **Adopt immediately** | Hono exports `InferResponseType` and `InferRequestType`. These allow TanStack Query hooks in the Expo app to be strictly typed against server response shapes **without duplicating Zod schemas**. One-line addition per hook. |
| **Data Shape Projections** | ⚠️ Partial | **Expand** | Your gateway returns domain objects. For PowerSync sync-optimized endpoints, consider dedicated "projection" routes that return the exact nested shape the local Drizzle schema expects. This eliminates client-side transformation and makes `batch.complete()` safer. |

---

## 3. Original Additions (Beyond the Reference List)

The following recommendations are not in the provided list but are directly derived from the codebase topology:

### 3.1 Hono `InferResponseType` → TanStack Query Bridge
A mechanical pattern that connects the server contract directly to the client hook type:
```typescript
// apps/gurudevi-mobile/src/hooks/useGrades.ts
import type { InferResponseType } from 'hono/client';
import { client } from '../lib/api';

// Server response type inferred at compile time — no manual typing
type GradesResponse = InferResponseType<typeof client.api.grades.$get>;

export function useGrades() {
  return useQuery<GradesResponse>({
    queryKey: ['grades'],
    queryFn: async () => (await client.api.grades.$get()).json(),
  });
}
```
This costs **zero new dependencies** and eliminates an entire class of client/server type drift bugs.

### 3.2 Orama Offline Search Index
Orama should be layered on top of your existing PowerSync Drizzle tables:
```typescript
// packages/core/src/adapters/search/sovereignSearch.ts
import { create, insert, search } from '@orama/orama';

export async function buildStudentIndex(students: Student[]) {
  const db = await create({
    schema: { id: 'string', fullName: 'string', admissionNumber: 'string' },
  });
  await insert(db, students);
  return db;
}
```
Index is rebuilt lazily after PowerSync sync events via `sovereignBus.on('powersync:sync_complete', ...)`.

### 3.3 Signed Permission Snapshot Verification (Full Loop)
The `permissionSnapshots` table uses an Ed25519 `signature` column. The Sanctuary API signs `(userId + activeBondId + schoolId + policyVersion + permissions + expiresAt)` with a private key stored only in the gateway environment.
- **Server**: When a permission snapshot is written, sign the complete scoped payload with `SNAPSHOT_SIGNING_PRIVATE_KEY`.
- **Client**: On local snapshot load, verify the signature with `EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY`. Reject any snapshot that fails.
- **Expiry enforcement**: Reject snapshots where `expiresAt < now()`. Force a network round-trip before Cedar evaluation resumes.

### 3.4 Request Idempotency Keys for Offline Write Safety
The `uploadData()` in `SupabasePowerSyncConnector` sends batches to `/api/powersync/upload`. If the network drops between `batch.complete()` and the server ack, the batch is re-sent. Without server-side idempotency, the gateway will apply the same CRUD operation twice.
- **Pattern**: Attach a `X-Idempotency-Key` header (SHA-256 of `batchId + crud.length + timestamp`) on each upload call.
- **Gateway**: The Hono sync handler stores processed idempotency keys in a short-TTL Supabase cache. Duplicate requests return `200 OK` with the cached response.

### 3.5 Policy Distribution Canary via PowerSync
Since Cedar policies are synced to devices via the `cedar_policies` table, a malformed policy push would silently break permissions for all offline users. Add a **canary validation step** to the server-side policy write path:
- Before writing a new policy to `cedar_policies`, the Sanctuary API evaluates it against a known test corpus of 5-10 canonical `allow/deny` scenarios using the Cedar WASM engine.
- If any canonical test yields an unexpected result, the write is rejected with `409 Conflict` and an audit log entry is emitted.

---

## 4. Revised Priority Matrix (Complete)

| Priority | Item | Source | Effort |
| :--- | :--- | :--- | :--- |
| **P0** | `normalizeError` in `app.onError` | Gap audit | 30 min |
| **P0** | Export `AppType` from entrypoints | Gap audit | 5 min |
| **P0** | Close `permissionSnapshot` signature verification loop | Original | 1 day |
| **P1** | Mount Hono MCP bridge (`/mcp`) | Reference list + HONO_PATTERNS | 2 hrs |
| **P1** | Feature flag middleware in API pipeline | Gap audit | 1 day |
| **P1** | `InferResponseType` on TanStack Query hooks | Reference list | 1 hr |
| **P1** | Idempotency key for PowerSync upload endpoint | Original | 4 hrs |
| **P2** | Orama offline search index (students, lessons) | Reference list | 1-2 days |
| **P2** | SSE streaming for AI inference endpoints | Reference list | 1 day |
| **P2** | OpenTelemetry structured tracing | Architecture direction | 1 day |
| **P2** | Loro CRDTs for lesson plan collaborative editing | Reference list (targeted) | 1-2 weeks |
| **P2** | Policy distribution canary validation | Original | 1 day |
| **P3** | PGlite + pgvector for on-device AI embedding search | Reference list | 2-3 weeks |
| **P3** | ONNX Runtime for on-device AI inference | Reference list | 3-4 weeks |
| **P3** | ZKP selective disclosure for sensitive routes | Architecture direction | 1-2 weeks |
| **⛔ Skip** | Zero (Rocicorp) | Reference list | Covered by PowerSync sync-rules |
| **⛔ Skip** | LibSQL | Reference list | OP-SQLite already active |
| **⛔ Skip** | Effect-TS (full adoption) | Reference list | `SovereignError` covers 80% of the benefit |
