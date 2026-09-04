---
title: "Effect-TS Architecture & Migration Guide"
status: "active"
created: 2026-09-03
updated: 2026-09-03
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, effect-ts, resilience, migration, v3, v4]
---

# Effect-TS Architecture & Migration Guide

> **Scope**: `packages/core` — Effect v3 usage, current design, v4 migration readiness.
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
| `effect/Schedules.ts` | **Canonical retry policies** | `Schedule`, `Duration` |
| `utils/effect.ts` | **Primary boundary facade** | `Effect`, `Schedule` (re-exported from Schedules.ts) |
| `utils/mutation.ts` | Offline mutation queue | `Data`, `Duration`, `Effect`, `Schedule` |
| `api/attendance.ts` | Attendance API with retry | `Data`, `Duration`, `Effect` |
| `adapters/supabaseIdentity.adapter.ts` | Supabase auth queries with retry | `Data`, `Duration`, `Effect` |
| `adapters/powersync/SupabasePowerSyncConnector.ts` | PowerSync upload with retry | `Duration`, `Effect`, `Schedule` |
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

The only file using `Context`, `Layer`, and `Context.Tag` for full Effect dependency injection.

```ts
// v3 pattern (current)
class GrowthPort extends Context.Tag('@core/GrowthPort')<GrowthPort, IGrowthPort>() {}
```

**v4 migration change** (not yet — see §8):
```ts
// v4 pattern (future)
class GrowthPort extends Context.Service<GrowthPort, IGrowthPort>()('@core/GrowthPort') {}
```

The argument order flips. The concept is identical.

---

## 8. Effect v4 Migration Readiness

**Current status**: v3.22.x, no v4 migration yet. Plan is to migrate when v4 stabilizes in production use.

### Migration risk by area

| Area | Risk | Current state | v4 change |
|---|---|---|---|
| `Schedule` API | **LOW** | `Schedule.exponential`, `Schedule.intersect`, `Schedule.recurs` | Stable; no change |
| `Data.TaggedError` | **LOW** | All local errors | Fine for non-RPC errors; prefer `Schema.TaggedErrorClass` for serialization boundaries |
| `Context.Tag` | **MEDIUM** | Only in `growth.tags.ts` (1 file) | Rename to `Context.Service`; argument order flips |
| `Effect.runSync` | **LOW** (now fixed) | Lazy init via `getAuditQueue()` | Safe in v4 owned-runtime model |
| `Effect.runFork` | **LOW** | Used in hooks, lifecycle | No change expected |
| `Queue.unbounded` | **LOW** | 1 usage, now lazy | Stable API; owned-runtime pattern now satisfied |
| `@effect/schema` | **N/A** | Not used | Skip migration concern |
| `@effect/platform` | **N/A** | Not used | Skip migration concern |
| `@effect/rpc` | **N/A** | Not used | Skip migration concern |
| `import * as X from 'effect/X'` | **LOW** | All files | Sub-paths work in v4; migration guide recommends root imports, codemods handle this |

### Estimated migration effort

1. **Automated** (codemod): All import paths, `Effect.Service` → `Context.Service` → handled by official `effect-v3-to-v4` codemod
2. **Manual** (1 file, 1 change): `growth.tags.ts` — `Context.Tag` → `Context.Service` argument order
3. **Manual** (if RPC added): Replace `Data.TaggedError` with `Schema.TaggedErrorClass` for cross-boundary errors

**Total**: ~1–2 hours once codemods are available.

### What to do before migrating

1. Read the official `MIGRATION.md` in `effect-ts/effect` repository (v4 branch)
2. Run `pnpm exec effect-v3-to-v4` in `packages/core`
3. Manually fix `growth.tags.ts` (Context.Tag → Context.Service)
4. Run `pnpm --filter @repo/core exec tsc --noEmit`
5. Run the test suite: `pnpm --filter @repo/core test`

---

## 9. AI Agent Rules for this Codebase

If you are an AI agent making changes in or near Effect-adjacent code, follow these rules:

1. **Never add a new `Schedule.exponential(...)` block.** Import `defaultRetryPolicy`, `strictRetryPolicy`, or `retryPolicy(n)` from `@repo/core/utils/effect` instead.
2. **Never use `Effect.runSync(...)` at module top level.** Use the lazy singleton pattern in `deviceAccounts.ts` as the reference.
3. **Never call `Effect.runPromise` in a React hook or Zustand store.** Use `runEffect(...)` or `fireAndForget(...)` from `utils/effect.ts`.
4. **Never export a `TaggedError` class from its module unless another module actually imports it.** Check cross-module usage before adding `export`.
5. **The `effect/Schedules.ts` file is the authoritative list of retry policies.** If a policy doesn't exist there, add it there — do not add it inline at the call site.
6. **Do not install new `@effect/*` packages** without explicit human approval. Current stance is minimal Effect surface; new packages expand migration complexity.

---

## 10. Future Considerations

### When to expand Effect usage (safe)

- Adding a new API adapter with retry + timeout: follow the `supabaseIdentity.adapter.ts` pattern
- Adding a new background queue: follow the `deviceAccounts.ts` lazy singleton pattern
- Adding typed error channels to an existing service: add a `TaggedError` class private to that module

### When NOT to expand Effect usage

- TanStack Query handles retry for you → don't add Effect retry on top of it
- A single async call with no retry need → plain `async/await`
- State management → Zustand, not Effect

### v4 adoption signal

We will begin the v4 migration when:
- Effect v4.x has a stable release with final migration tooling
- The team has reviewed the `MIGRATION.md` and confirmed no unexpected breaking changes
- A dedicated migration branch is allocated (do not migrate as a side effect of feature work)
