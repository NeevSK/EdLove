---
title: "Effect-TS Architecture & Standard Guide"
status: "active"
created: 2026-09-03
updated: 2026-10-08
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, effect-ts, resilience, v4, production-standard]
---

# Effect-TS Architecture & Standard Guide

> **Scope**: `packages/core` — Effect v4.0.2 production standard, canonical patterns, and boundary architecture.
>
> This document is the single source of truth for Effect-TS architectural decisions.
> Agents modifying Effect-adjacent code should read this first.

---

## 1. Why We Use Effect — and Where We Don't

Effect is used **narrowly**: for resilience, retries, and background queueing. It is **not** a general programming model for this codebase.

**Rule of thumb**: If the code needs retry, timeout, structured cancellation, or typed error channels, use Effect. If it just fetches data, use `async/await` and TanStack Query.

### The boundary

```
React / TanStack Query
        │ pure Promise / APIError
        ▼
packages/core/src/utils/effect.ts   ← THE WALL
        │ tryPromise(), runEffect(), fireAndForgetEffect()
        ▼
Effect internals (retry, Schedule, Queue, Fiber)
```

Outside of `packages/core`, **there is no Effect**. This boundary is intentional and must be maintained.

---

## 2. Current File Map (as of 2026-09-03)

All Effect imports live in exactly **13 files** inside `packages/core/src`:

| File | Role | Effect modules |
|---|---|---|
| `effect/index.ts` | **Canonical package facade** | Unified exports: schedules, errors, runtime, layers |
| `effect/Schedules.ts` | **Canonical retry policies** | `Schedule`, `Duration` |
| `effect/Errors.ts` | **Tagged domain errors** | `Data.TaggedError` classes |
| `effect/Runtime.ts` | **Runtime & boundary helpers** | `Effect`, `Fiber`, `Layer`, safe runners |
| `effect/Layers.ts` | **DI layer registry** | `Layer`, `Context` |
| `utils/effect.ts` | **Backward-compatibility facade** | Re-exports from `effect/index.ts` |
| `utils/mutation.ts` | Offline mutation queue | `Data`, `Duration`, `Effect`, `Schedule` |
| `api/attendance.ts` | Attendance API with retry | `Data`, `Duration`, `Effect` |
| `adapters/supabaseIdentity.adapter.ts` | Supabase auth queries with retry | `Data`, `Duration`, `Effect` |
| `adapters/powersync/SupabasePowerSyncConnector.ts` | PowerSync upload with `strictRetryPolicy` | `Effect` |
| `api/handlers/sync.ts` | PowerSync transactional sync | `Data` (via `Errors.ts`) |
| `accounts/deviceAccounts.ts` | Audit queue (lazy singleton) | `Effect`, `Queue` |
| `native/guestDataManager.ts` | MMKV typed storage ops | `Data`, `Effect` |
| `native/useAuthLifecycle.ts` | Auth state machine | `Effect` |
| `logic/ports/growth.tags.ts` | DI service definition | `Context`, `Effect`, `Layer` |
| `logic/managers/GrowthManager.ts` | Growth signal orchestration | `Effect` |
| `hooks/useSovereignEffect.ts` | React hook for Effect fibers | `Effect`, `Fiber` |
| `hooks/useSafeMutation.ts` | Mutation hook with error handling | `Effect` |

### Import pattern

All files use **sub-path imports** (v3 style):
```ts
import * as Effect from 'effect/Effect';
import * as Schedule from 'effect/Schedule';
```
This is intentional — it is compatible with both v3 and v4.

---

## 3. The Retry Policy System

**Canonical location**: [`packages/core/src/effect/Schedules.ts`](../../packages/core/src/effect/Schedules.ts)

All retry policies flow from three named exports. **Never re-declare a retry policy locally.**

| Export | Behavior | Use for |
|---|---|---|
| `defaultRetryPolicy` | Exponential backoff 200ms, max 3 retries | Supabase reads, oRPC network calls, attendance API |
| `strictRetryPolicy` | Exponential backoff 200ms, max 2 retries | Non-critical queries, identity lookups |
| `retryPolicy(n)` | Exponential backoff 200ms, caller-specified count | One-off custom scenarios |

**Special case** — `mutation.ts` uses a **1-second base** (intentional, not a bug):
```ts
// utils/mutation.ts — heavier write operations warrant slower retry
{ schedule: Schedule.exponential(Duration.seconds(1)), times: 3 }
```
This is NOT a duplicate of `defaultRetryPolicy`. Leave it.

### How to consume
```ts
import { defaultRetryPolicy, strictRetryPolicy } from '@repo/core/utils/effect';
// or directly:
import { defaultRetryPolicy } from '@repo/core/effect/schedules';
```

---

## 4. The Boundary Facade (`utils/effect.ts`)

The primary boundary between Effect internals and the rest of the codebase.

### Public API surface

```ts
// Convert a Promise to an Effect
tryPromise(fn: () => Promise<T>): Effect.Effect<T, Error>

// Run an Effect, returning a Promise; errors become APIError
runEffect(effect, label): Promise<T>

// Run an Effect in a forked fiber; errors are logged, never thrown
fireAndForgetEffect(effect, label): void
fireAndForget(fn: () => Promise<T>, label): void

// Re-exported from effect/Schedules.ts
defaultRetryPolicy, strictRetryPolicy, retryPolicy
```

### Rule: The facade is the exit

Any Effect that needs to cross to a React hook, Zustand store, or TanStack Query must exit through one of these three functions. **Never call `Effect.runPromise` directly in a hook or store.**

---

## 5. Tagged Errors

Typed errors via `Data.TaggedError` provide structured, searchable failure domains.

### Public errors (cross module boundaries)

| Error | Exported from | Used by |
|---|---|---|
| `OfflineMutationError` | `utils/mutation.ts` | `hooks/useSafeMutation.ts` |

### Private errors (internal to their module)

| Error | Module | Why private |
|---|---|---|
| `SupabaseQueryError` | `supabaseIdentity.adapter.ts` | Converted to `APIError` at the adapter boundary |
| `AttendanceHttpError` | `api/attendance.ts` | Converted to `APIError` at `toPromise()` |
| `GuestStorageError` | `native/guestDataManager.ts` | All callers receive `Promise<T>` |

**Rule**: If an error does not cross a module boundary, keep it private (`class Err extends Data.TaggedError...` without `export`).

**v4 note**: `Data.TaggedError` is soft-deprecated for errors that cross serialization boundaries (RPC, server actions). For local, non-serialized errors (all current usage), it remains fine. If you add RPC or server actions, switch those error types to `Schema.TaggedErrorClass`.

---

## 6. The Audit Queue (`accounts/deviceAccounts.ts`)

A serial queue for fire-and-forget security audit operations.

### Current implementation (lazy singleton)

```ts
let _auditQueue: Queue.Queue<() => Promise<unknown>> | null = null;

function getAuditQueue(): Queue.Queue<() => Promise<unknown>> {
  if (!_auditQueue) {
    _auditQueue = Effect.runSync(Queue.unbounded<() => Promise<unknown>>());
    Effect.runFork(Queue.take(_auditQueue).pipe(..., Effect.forever));
  }
  return _auditQueue;
}
```

**Why lazy?**: In Effect v4's owned-runtime model, `Effect.runSync` at module evaluation time is explicitly warned against. The lazy initializer defers execution until `deviceAccounts.initialize()` is called by the app shell — safe in both v3 and v4.

**Do not** convert this back to a top-level `const auditQueue = Effect.runSync(...)`.

---

## 7. The DI Layer (`logic/ports/growth.tags.ts`)

The primary location using `Context`, `Layer`, and `Context.Service` for full Effect dependency injection.

```ts
// v4 standard (active)
export class GrowthPort extends Context.Service<GrowthPort, IGrowthPort>()('app/GrowthPort') {}
export class GrowthManagerTag extends Context.Service<GrowthManagerTag, GrowthManager>()('app/GrowthManager') {}
```

The curried constructor pattern binds identity and shape cleanly in v4.

---

## 8. Effect v4 Active Architecture Standard

**Current status**: **Effect v4.0.2 Active Standard** in `@repo/core`.

### Monorepo Invariant Map (v4)

| Area | v4 Active Pattern | Notes |
|---|---|---|
| **Schedules** | `Schedule.max([Schedule.exponential("200 millis"), Schedule.recurs(n)])` | Replaces v3 `Schedule.intersect`. |
| **Error Handling** | `Effect.catch(handler)` and `Effect.catchDefect(handler)` | Replaces v3 `Effect.catchAll` / `Effect.catchAllDefect`. |
| **Chaining** | `Effect.andThen(nextEffect)` | Replaces v3 `Effect.zipRight`. |
| **Services** | `Context.Service<Self, Shape>()("id")` | Replaces v3 `Context.Tag`. |
| **Failure Channels** | `Result<A, E>` (`Success` / `Failure`) via `Effect.result` | Replaces v3 `Either` (`Left` / `Right`) and `Effect.either`. |
| **Tagged Errors** | `Data.TaggedError` (local) & `Schema.TaggedError` (RPC/API) | `Data.TaggedError` retained for internal domain errors. |
| **Runtime Model** | Lazy singleton initializers (`getAuditQueue()`) | Safe under v4 owned-runtime model. |
| **Generators** | `Effect.gen(function* () { ... })` & `Effect.fn("name")` | Generators yield directly; automatic tracing with `Effect.fn`. |
| **Merged Modules** | Root `'effect'` export | `@effect/schema`, `@effect/platform`, `@effect/stream` merged into core. |

---

## 9. AI Agent Rules for this Codebase (v4 Standard)

If you are an AI agent making changes in or near Effect-adjacent code, follow these rules:

1. **Never add a new `Schedule.exponential(...)` block.** Import `defaultRetryPolicy`, `strictRetryPolicy`, or `retryPolicy(n)` from `@repo/core/utils/effect` or `@repo/core/effect/schedules` instead.
2. **Never use `Schedule.intersect`.** Use `Schedule.max([...])` for retry policy composition.
3. **Never use `Effect.catchAll` or `Effect.zipRight`.** Use `Effect.catch` and `Effect.andThen`.
4. **Never use `Effect.either` or `Either.Left`/`Right`.** Use `Effect.result` and `Result.Failure`/`Success`.
5. **Never use `Effect.runSync(...)` at module top level.** Use the lazy singleton pattern in `deviceAccounts.ts` as the reference.
6. **Never call `Effect.runPromise` in a React hook or Zustand store.** Use `runEffect(...)` or `fireAndForget(...)` from `utils/effect.ts`.
7. **Never export a `TaggedError` class from its module unless another module actually imports it.** Check cross-module usage before adding `export`.
8. **The `effect/Schedules.ts` file is the authoritative list of retry policies.** If a policy doesn't exist there, add it there — do not add it inline at the call site.
9. **Keep Effect strictly inside `packages/core`.** Outside of `packages/core`, no imports from `'effect'` are permitted.

---

## 10. Future Horizons (Effect v4 Capabilities)

### Safe Expansion Paths:
- **`ManagedRuntime`**: Consolidate boundary execution in API handlers (`apps/sanctuary-api` Hono routes).
- **`Schema.TaggedError`**: Use for schemas and errors crossing network boundaries or RPC endpoints.
- **`DateTime` algebra**: Utilize Effect's `DateTime` module for timezone-safe calendar and scheduling logic.
- **`effect/ai`**: Provider-agnostic LLM orchestration within `@repo/core/ai` tools.
