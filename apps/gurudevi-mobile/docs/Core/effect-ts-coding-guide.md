---
title: "Effect-TS Coding Guide"
status: "active"
created: 2026-07-21
updated: 2026-07-22 (Layer DI + tradeoffs)
author: "Naveen"
scribe: "Antigravity"
tags: [effect-ts, coding-standards, v3, v4, reference]
---

# Effect-TS Coding Guide

## 1. Table of Contents

- [1. Table of Contents](#1-table-of-contents)
- [2. Purpose & Scope](#2-purpose--scope)
- [3. Core Concepts](#3-core-concepts)
- [4. Version Decision: v3 Now, v4 Later](#4-version-decision-v3-now-v4-later)
- [5. Complementary: Effect-TS + SovereignError](#5-complementary-effect-ts--sovereignerror)
- [6. Complementary: Effect-TS + TanStack Query + TanStack Pacer](#6-complementary-effect-ts--tanstack-query--tanstack-pacer)
- [7. Package Versions & Imports](#7-package-versions--imports)
- [8. Current Patterns in this Codebase](#8-current-patterns-in-this-codebase)
- [9. v4 Migration Reference](#9-v4-migration-reference)
- [10. Approved Patterns](#10-approved-patterns)
- [11. Anti-Patterns](#11-anti-patterns)
- [12. Integration with React](#12-integration-with-react)
- [13. Testing](#13-testing)
- [14. Quick Reference Card](#14-quick-reference-card)

---

## 2. Purpose & Scope

This document is the **living reference** for Effect-TS usage across the Polymath Platform. It covers:

- Current v3 patterns used in `@repo/core`
- Version decision: v3 now, v4 when stable
- How Effect complements the existing `SovereignError` system (not replaces)
- How Effect complements TanStack Query and TanStack Pacer (different layers)
- Approved and deprecated coding patterns
- Integration with React (hooks), Zustand, and TanStack Query
- Testing strategies

> **Repo-Wide Single Source of Truth**: For authoritative architectural boundaries, the unified retry policy system, lazy runtime singleton patterns, and the comprehensive Effect v4 migration readiness matrix, see [`docs/architecture/effect-ts-architecture.md`](../../../docs/architecture/effect-ts-architecture.md).

**Not covered:** General TypeScript practices, React patterns, Zustand usage — see the respective guides.

---

## 3. Core Concepts

Effect-TS is built around the `Effect<A, E, R>` type:

| Parameter | Meaning | Example |
|---|---|---|
| `A` | Success value | `AttendanceRecord` |
| `E` | Error type (union of possible failures) | `AttendanceError \| AuditError` |
| `R` | Required dependencies (services) | `EducationalManager \| DbConnection` |

### Key Modules

| Module | Purpose | When to use |
|---|---|---|
| `Effect` | Core — async, sync, error handling, concurrency | Every Effect operation |
| `Data` | Tagged errors, data types | Define domain errors |
| `Context` | Service tags (v3: `Context.Tag`; v4: `Context.Service`) | Dependency injection |
| `Layer` | Compose and provide dependencies | Wire up DI for tests and production |
| `Schedule` | Retry/repeat policies | API calls with retry |
| `Stream` | Async, backpressured data processing | Real-time data pipelines |
| `Scope` | Resource lifecycle management | DB connections, file handles |
| `Fiber` | Concurrent execution unit | Background tasks, cancellation |
| `Schema` | Data validation (separate from Zod) | API boundary validation only |

---

## 4. Version Standard: Effect v4.0.2 Active Standard

**Standard: Effect v4.0.2 is the active monorepo standard (living in `@repo/core`).**

| Factor | Effect v4.0.2 (Active) | Notes |
|---|---|---|
| Production | ✅ Official stable release | Active in `@repo/core` |
| Monorepo Boundary | ✅ Strictly in `@repo/core` | Mobile UI never imports Effect directly |
| Metro/Hermes | ✅ Zero runtime issues | Boundary facade protects React Native shell |
| @effect/ai | ✅ Integrated in core | First-class AI model support |
| Unified Packages | ✅ Stream & Schema merged | No external `@effect/*` dependencies needed |

### Architecture Invariant

- Effect is strictly encapsulated inside `packages/core`.
- Mobile screens and components consume promises, React Query, and Zustand through the `@repo/core/utils/effect` facade.
- [scripts/check-effect-boundaries.mjs](file:///c:/x/scripts/check-effect-boundaries.mjs) enforces that no direct Effect imports exist in `apps/gurudevi-mobile`.

---

## 5. Complementary: Effect-TS + SovereignError

Effect-TS and `SovereignError` are **designed to work together**, not compete. Each handles a different layer of the error lifecycle.

```
┌─────────────────────────────────────────────────────────────┐
│              DOMAIN LAYER (Effect-TS)                         │
│                                                               │
│  Effect<A, AttendanceError | AuditError, never>               │
│                                                               │
│  • Type-safe error channels — compiler tracks every error     │
│  • Exhaustive matching — Effect.catchTag with Match.exhaustive│
│  • Fiber supervision — no silent failures                     │
│  • Composable Schedule — retry as a value                     │
│  • Layer DI — compile-time dependency checking                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Domain errors leave as tagged types
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BOUNDARY (SovereignError)                        │
│                                                               │
│  normalizeError(e) → SovereignError {                         │
│    tier: 'USER' | 'DEV' | 'AGENT' | 'SYSTEM',                │
│    userMessage: 'Something went wrong',                       │
│    code: 'ATTENDANCE_RECORD_FAILED',                          │
│    agentAction: { suggestedAction: 'RETRY_WITH_BACKOFF' },    │
│    devDetails: e,  // auto-sanitized in production            │
│  }                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │ Errors are safe, tiered envelopes
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              UI / HTTP LAYER (Existing)                       │
│                                                               │
│  • useSafeAction → toast / ErrorBoundary                     │
│  • Hono app.onError → JSON ProblemDetails response            │
│  • TanStack Query → loading/error states                     │
└─────────────────────────────────────────────────────────────┘
```

### The integration pattern

```typescript
// INSIDE DOMAIN (Effect-TS)
class AttendanceError extends Data.TaggedError('AttendanceError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

// AT THE API BOUNDARY (SovereignError)
function attendanceHandler(effect: Effect.Effect<AttendanceRecord, AttendanceError, never>) {
  return Effect.runPromise(
    effect.pipe(
      Effect.catchAll((e) =>
        Effect.fail(SovereignError.validation(e.message, e.cause))
      ),
    ),
  );
}
```

**Rule:** Effect catches errors **before** they leave the domain. SovereignError wraps them **at the boundary** for safe presentation. Both are required.

---

## 6. Complementary: Effect-TS + TanStack Query + TanStack Pacer

These three tools operate at **different layers** of the application stack. They compose cleanly — never compete.

```
React Component
  └─ useQuery / useMutation              ← TanStack Query: UI lifecycle
       │                                     "When to fetch, what to show"
       │                                     Caching, refetch, stale-while-revalidate
       │                                     isPending, isError, error UI
       │
       └─ queryFn: () => Promise<T>
            └─ Effect.runPromise(...)     ← Effect-TS: operation lifecycle
                 │                            "How to fetch, error recovery"
                 │                            Typed errors, retry, timeout, DI
                 │                            Fiber supervision, forkDaemon audit
                 │                            Invisible to UI — returns Promise
                 │
                 └─ domain logic / HTTP / database
```

| Concern | Handled by | Where |
|---|---|---|
| Caching, refetch, loading spinners | **TanStack Query** | UI layer — component code |
| Rate-limit button clicks, debounce search | **TanStack Pacer** | UI layer — event handlers |
| Typed error handling | **Effect** | Domain layer — behind queryFn |
| Retry on network failure | **Effect** | Domain layer — composable Schedule |
| Timeout cancellation | **Effect** | Domain layer — no AbortController needed |
| Fire-and-forget audit logging | **Effect** | Domain layer — forkDaemon |
| Dependency injection for tests | **Effect** | Domain layer — Layer.provide |

### Composition pattern

```typescript
// ✅ CORRECT: TanStack Query calls Effect, returns Promise to UI
function useAttendance(classroomId: string) {
  return useQuery({
    queryKey: ['attendance', classroomId],
    queryFn: () => Effect.runPromise(
      attendanceAPI$.fetchClassroomAttendance(classroomId).pipe(
        Effect.retry(Schedule.exponential(Duration.seconds(1)).pipe(
          Schedule.intersect(Schedule.recurs(3)),
        )),
        Effect.timeout(Duration.seconds(15)),
      ),
    ),
    staleTime: 30_000,
  });
  // UI gets { data, isPending, error } — no Effect imports
}
```

```typescript
// ✅ CORRECT: TanStack Pacer handles UI event frequency
const { throttle } = useThrottle();
const handleSubmit = throttle(() => mutation.mutate(formData), 1000);
```

### Rule

- **TanStack Query** controls the UI lifecycle (when to fetch, what to show while loading)
- **Effect** controls the operation lifecycle (typed errors, retry, timeout, concurrency, DI)
- **TanStack Pacer** controls UI event frequency (throttle, debounce)
- Effect stays **behind the `queryFn` boundary** — the UI layer never imports `effect`

---

## 7. Package Versions & Imports

### Current (v3.22.0)

```typescript
// Core imports
import { Data, Effect, pipe } from 'effect';

// For React hooks
import { Effect, Fiber, Runtime } from 'effect';

// Shared utilities and canonical retry schedules
import { fireAndForget, fromSupabase, runEffect, defaultRetryPolicy } from '@repo/core/utils/effect';
// Or canonical schedules directly:
import { defaultRetryPolicy, strictRetryPolicy, retryPolicy } from '@repo/core/effect/schedules';
```

### Future (v4 — when stable)

```typescript
// v4 consolidates many packages into `effect` core
import { Data, Effect, pipe } from 'effect';

// Services: Context.Tag → Context.Service
import { Context } from 'effect';

// Catch* renames
// Effect.catchAll → Effect.catch
// Effect.forkDaemon → Effect.forkDetach
```

**v4 import migration:** Use the official [v3-to-v4 import map](https://github.com/Effect-TS/effect-smol/blob/main/migration/v3-to-v4.md) for automatic migration.

---

## 8. Current Patterns in this Codebase

### 7.1 Tagged Domain Errors

```typescript
// ✅ CORRECT (v3)
export class AttendanceError extends Data.TaggedError('AttendanceError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

// v4: Data.TaggedError → Data.TaggedErrorClass (rename only)
```

**Rule:** Always define domain errors as `Data.TaggedError` classes. Use the `_tag` field for pattern matching with `Effect.catchTag`. Never `throw Error` from inside Effect code.

### 7.2 Effect.gen with tryPromise

```typescript
// ✅ CORRECT — generator-based orchestration with typed errors
Effect.gen(function* () {
  const result = yield* Effect.tryPromise({
    try: () => educational.attendance.record(classroomId, studentId, status, date),
    catch: (e) => new AttendanceError({ message: 'Failed to record', cause: e }),
  });

  yield* Effect.forkDaemon(logAttendanceAudit({ ... }));

  return result;
});
```

**Rules:**
- Use `Effect.gen` for complex orchestration (3+ steps, branching, error recovery)
- Use `Effect.tryPromise` (options-object form) — NEVER `Effect.promise(() => ...)` which loses typed errors
- Always provide a `catch` that produces a typed error

### 7.3 Fire-and-Forget Audit Logging

```typescript
// ✅ CORRECT — non-blocking audit via forked fiber
yield* Effect.forkDaemon(
  logAttendanceAudit({ action: 'attendance_recorded', entityId: result.id, ... }),
);
```

**Rules:**
- Use `Effect.forkDaemon` (v4: `Effect.forkDetach`) for fire-and-forget side effects
- The parent effect does not wait for the forked fiber
- Log failures inside the fork via `Effect.catchAll` + `Effect.logError` — never let it fail silently

### 7.4 Error Recovery with catchAll

```typescript
// ✅ CORRECT — graceful degradation with logging
pipe(
  Effect.tryPromise({
    try: () => audit.log({ ... }),
    catch: (e) => new AuditError({ cause: e }),
  }),
  Effect.catchAll((e) => Effect.logError(`Audit logging crashed: ${e}`)),
  Effect.asVoid,
);
```

### 7.5 React Hooks

```typescript
// ✅ Current scope — effects must require no environment (`R = never`).
// useSovereignEffect uses Effect.runFork and interrupts the fiber on cleanup.
export function useSovereignEffect<A, E, R>(
  effect: Effect.Effect<A, E, never>,
  deps?: React.DependencyList,
) { ... }

// FUTURE — introduce ManagedRuntime only when a hook genuinely needs `R`.
```

---

## 9. v4 Migration Reference

### 8.1 Import Changes

| v3 import | v4 import | Notes |
|---|---|---|
| `import { Data, Effect, pipe } from 'effect'` | Same | Core package unchanged |
| `import { Context } from 'effect'` | Same | But APIs changed inside |
| `import { ... } from '@effect/platform'` | `import { ... } from 'effect'` | Merged into core |
| `import { ... } from '@effect/schema'` | `import { Schema, ... } from 'effect'` | Merged into core |
| `import { ... } from '@effect/stream'` | `import { Stream, ... } from 'effect'` | Merged into core |

### 8.2 API Renames (v3 → v4)

| v3 | v4 | Auto-migratable? |
|---|---|---|
| `Effect.catchAll(handler)` | `Effect.catch(handler)` | ✅ Yes |
| `Effect.catchAllCause(handler)` | `Effect.catchCause(handler)` | ✅ Yes |
| `Effect.catchAllDefect(handler)` | `Effect.catchDefect(handler)` | ✅ Yes |
| `Effect.catchSome(handler)` | `Effect.catchFilter(handler)` | ✅ Yes |
| `Effect.fork` | `Effect.forkChild` | ✅ Yes |
| `Effect.forkDaemon` | `Effect.forkDetach` | ✅ Yes |
| `Effect.zipLeft` | `Effect.tap` | ✅ Yes |
| `Effect.zipRight` | `Effect.andThen` | ✅ Yes |
| `Context.Tag(id)<Self, Shape>()` | `Context.Service<Self, Shape>()(id)` | ⚠️ Semi-auto |
| `Context.GenericTag(id)` | `Context.Service<Self, Shape>()(id)` | ⚠️ Semi-auto |
| `Data.TaggedError(tag)` | `Data.TaggedErrorClass(tag)` | ✅ Yes |
| `Effect.reduce` | Removed — use `Effect.gen` with for loop | ❌ Manual |
| `Effect.Do` / `Effect.bind` / `Effect.let` | Removed — use `Effect.gen` only | ❌ Manual |
| `Effect.if` | Removed — use ternary + `Effect.succeed` | ❌ Manual |
| `Effect.timeoutFail(...)` | Removed — use `Effect.timeout` + `catchTag` | ❌ Manual |
| `Runtime.defaultRuntime` | Removed — use `ManagedRuntime` | ❌ Manual |
| `Effect.serviceFunctions(...)` | Removed — use `Service.use()` | ❌ Manual |
| `Schedule.intersect` | `Schedule.max([...])` | ✅ Array composition |
| `Effect.either` / `Either` | `Effect.result` / `Result` (`Success`/`Failure`) | ✅ Yes |
| `Effect.gen` `_` parameter | Removed — function takes no args | ❌ Manual |
| `Option.fromNullable` | `Option.fromNullishOr` | ✅ Yes |
| `NoSuchElementException` | `NoSuchElementError` | ✅ Yes |
| `TimeoutException` | `TimeoutError` | ✅ Yes |

### 8.3 `catchTag` — Array Syntax

```typescript
// v3 — variadic
Effect.catchTag('ErrorA', 'ErrorB', handler);

// v4 — array
Effect.catchTag(['ErrorA', 'ErrorB'], handler);
```

### 8.4 `catchTags` — Handler Must Return Effect

```typescript
// v3 — could return raw error
Effect.catchTags({
  NoSuchElementError: () => new MyError('not found'),
});

// v4 — must return Effect
Effect.catchTags({
  NoSuchElementError: () => Effect.fail(new MyError('not found')),
});
```

### 8.5 Effect Subtyping → Yieldable

In v4, types like `Option`, `Either`, `Ref`, `Deferred`, `Fiber` are no longer subtypes of `Effect`.

```typescript
// v3 — Ref could be used as Effect (implicit read)
pipe(ref, Effect.map(n => n + 1)); // implicitly reads ref

// v4 — must explicitly read
pipe(Ref.get(ref), Effect.map(n => n + 1));
```

```typescript
// v4 — yield* still works in Effect.gen
Effect.gen(function* () {
  const ref = yield* Ref.make(42);       // ✅ Yieldable
  const value = yield* ref;              // Explicit: yield* fiber.join
});
```

### 8.6 Service Changes: Context.Tag → Context.Service

```typescript
// v3
export class MyService extends Context.Tag('app/MyService')<
  MyService,
  { doWork: (x: number) => Effect.Effect<string, Error, never> }
>() {}

// v4
export class MyService extends Context.Service<
  MyService,
  { doWork: (x: number) => Effect.Effect<string, Error, never> }
>()('app/MyService') {}
```

### 8.7 Layer Changes

```typescript
// v4 — explicit layers only (dependencies option removed)
const myLayer = Layer.effect(
  MyService,
  Effect.gen(function* () {
    const dep = yield* AnotherService;
    return new MyServiceImpl(dep);
  }),
);

const program = myEffect.pipe(Layer.provide(myLayer));
```

---

## 10. Approved Patterns

### 9.1 Domain Service with DI + SovereignError Boundary

```typescript
// ====== 1. Define service tag (v3) ======
class AttendanceManager extends Context.Tag('app/AttendanceManager')<
  AttendanceManager,
  {
    record: (params: RecordParams) => Effect.Effect<AttendanceRecord, AttendanceError, never>;
    getByDate: (...args: any[]) => Effect.Effect<AttendanceRecord[], never, never>;
  }
>() {}

// ====== 2. Define domain errors ======
export class AttendanceError extends Data.TaggedError('AttendanceError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

// ====== 3. Implement service ======
export const AttendanceManagerLive = Layer.effect(
  AttendanceManager,
  Effect.gen(function* () {
    const db = yield* DbService;
    return AttendanceManager.of({
      record: (params) =>
        Effect.tryPromise({
          try: () => db.attendance.record(params),
          catch: (e) => new AttendanceError({ message: 'Failed to record', cause: e }),
        }),
      getByDate: (...args) =>
        Effect.tryPromise({
          try: () => db.attendance.getByDate(...args),
          catch: (e) => new AttendanceError({ message: 'Failed to load attendance', cause: e }),
        }),
    });
  }),
);

// ====== 4. Provide layer at composition root ======
const program = Effect.gen(function* () {
  const svc = yield* AttendanceManager;
  return yield* svc.record({ ... });
}).pipe(Effect.provide(AttendanceManagerLive));
```

### 9.2 Retry with Exponential Backoff

```typescript
const fetchWithRetry = (id: string) =>
  Effect.gen(function* () {
    const result = yield* Effect.tryPromise({
      try: () => fetch(`/api/users/${id}`),
      catch: (e) => new NetworkError({ cause: e }),
    }).pipe(
      Effect.retry(
        Schedule.exponential(Duration.seconds(1)).pipe(
          Schedule.intersect(Schedule.recurs(3)),
        ),
      ),
      Effect.timeout(Duration.seconds(10)),
    );
    return result;
  });
```

### 9.3 Parallel Fetching with Race

```typescript
const quickestResult = Effect.race(
  fetchFromPrimary(id),
  fetchFromSecondary(id),
);
```

### 9.4 Resource Management with Scope

```typescript
const withDbConnection = Effect.acquireRelease(
  Effect.tryPromise({ try: () => db.connect(), catch: (e) => new DbError({ cause: e }) }),
  (conn) => Effect.sync(() => conn.close()),
);
```

### 9.5 SovereignError Boundary at Domain Edge

```typescript
// Wrap Effect domain errors into SovereignError for external consumption
function toSovereignError<A, E extends { message: string }>(
  effect: Effect.Effect<A, E, never>,
  code: string,
): Promise<A> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catchAll((e) =>
        Effect.fail(
          new SovereignError({
            title: e.message,
            detail: e.message,
            status: 400,
            code,
            category: ErrorCategory.DOMAIN,
            agentAction: { suggestedAction: 'CHECK_INPUT_AND_RETRY' },
          }),
        ),
      ),
    ),
  );
}
```

---

## 11. Anti-Patterns

### 10.1 `Effect.Effect<A, E | unknown, never>` — Wide Error Type

```typescript
// ❌ BAD — unknown in error union defeats type safety
Effect.Effect<AttendanceRecord, AttendanceError | unknown, never>

// ✅ GOOD — narrow to known errors
Effect.Effect<AttendanceRecord, AttendanceError | AuditError, never>
```

### 10.2 `Effect.promise(fn)` without catch

```typescript
// ❌ BAD — unhandled rejection becomes a defect
Effect.promise(() => fetch(url))

// ✅ GOOD — typed error handling
Effect.tryPromise({
  try: () => fetch(url),
  catch: (e) => new NetworkError({ cause: e }),
})
```

### 10.3 Mixed Effect and throw in the same function

```typescript
// ❌ BAD — throws bypass the type system
function badFn(): Effect.Effect<User, DbError, never> {
  if (!user) throw new Error('no user');
  return Effect.succeed(user);
}

// ✅ GOOD — all errors through Effect
function goodFn(): Effect.Effect<User, DbError | NotFoundError, never> {
  return user
    ? Effect.succeed(user)
    : Effect.fail(new NotFoundError({ id }));
}
```

### 10.4 Effect in simple React components

```typescript
// ❌ BAD — Effect for single fetch in leaf component
function StudentName({ id }: { id: string }) {
  const { data } = useSovereignEffect(fetchStudent(id));
  return <Text>{data?.name}</Text>;
}

// ✅ GOOD — TanStack Query for simple fetches
function StudentName({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudent(id),
  });
  return <Text>{data?.name}</Text>;
}
```

**Rule:** TanStack Query for server-state fetching in UI. Effect for domain logic combining multiple operations, needing retry, or requiring typed errors. Boundary: TanStack Query → calls → Effect domain service.

### 10.5 Effect in public library APIs

```typescript
// ❌ BAD — viral dependency
export function queryData(): Effect.Effect<Data, Error, never> { ... }

// ✅ GOOD — expose Promise at boundary
export function queryData(): Promise<Data> {
  return Effect.runPromise(internalQuery());
}
```

### 10.6 Forgetting the SovereignError boundary

```typescript
// ❌ BAD — raw Effect error leaks past the domain boundary
async function handler(req: Request) {
  return Effect.runPromise(domainLogic(req));
  // If domainLogic fails with AttendanceError, the caller gets an untyped
  // Effect error instead of a structured SovereignError
}

// ✅ GOOD — wrap at boundary
async function handler(req: Request) {
  return Effect.runPromise(
    domainLogic(req).pipe(
      Effect.catchAll((e) =>
        Effect.fail(SovereignError.validation(e.message, e.cause))
      ),
    ),
  );
}
```

---

## 12. Integration with React

### 11.1 Architecture

```
React Component
    │
    ▼
useQuery / useMutation  (TanStack Query — loading/error states)
    │
    ▼
Domain Service          (Effect — typed errors, retry, DI)
    │
    ▼
Infrastructure          (Supabase client, HTTP, SovereignError boundary)
```

### 11.2 Current Hook Pattern

```typescript
// ✅ Current hook scope — only for effects with R = never.
// useSovereignEffect uses Effect.runFork and interrupts its fiber on cleanup.
// Do not pass environment-dependent effects until a ManagedRuntime is provided.
```

### 11.3 Target Hook Pattern

```typescript
// FUTURE — use ManagedRuntime only when the hook must provide an Effect environment.
function useSovereignEffect<A, E, R>(
  effect: Effect.Effect<A, E, R>,
  layer?: Layer.Layer<never, E, R>,
  deps?: React.DependencyList,
) {
  const rt = useMemo(
    () => layer
      ? ManagedRuntime.managedRuntime(layer)
      : ManagedRuntime.managedRuntime(Layer.succeed(Identity.Service, {})),
    [layer],
  );

  useEffect(() => {
    const fiber = rt.runFork(
      effect.pipe(
        Effect.catchAll((e) => {
          // set error state
          return Effect.void;
        }),
      ),
    );
    return () => rt.runFork(Fiber.interrupt(fiber));
  }, deps);
}
```

### 11.4 Calling Effect from Event Handlers

```typescript
// ✅ GOOD — lightweight bridge
const handleSubmit = useCallback(async () => {
  const result = await Effect.runPromise(
    attendanceAPI.record(classroomId, studentId, status, date),
  );
}, [classroomId, studentId, status, date]);
```

---

## 13. Testing

### 12.1 Testing Effect-Powered Services with Layer DI

```typescript
import { Effect, Layer } from 'effect';
import { describe, it, expect } from 'vitest';

// Create a test layer with mock implementation
const TestAttendanceLayer = Layer.succeed(
  AttendanceManager,
  AttendanceManager.of({
    record: () => Effect.succeed(mockRecord),
    getByDate: () => Effect.succeed(mockRecords),
  }),
);

// Provide the layer and run the effect
const result = await Effect.runPromise(
  myEffect.pipe(Effect.provide(TestAttendanceLayer)),
);

expect(result).toEqual(expected);
```

### 12.2 Running Effects in Tests

```typescript
// Synchronous
const result = Effect.runSync(Effect.succeed(42));

// Async
const result = await Effect.runPromise(myEffect);

// With error type inspection
const exit = Effect.runSyncExit(myEffect);
if (exit._tag === 'Success') { /* handle success */ }
```

### 8.5 Shared Utilities & Canonical Schedules (`@repo/core/utils/effect`, `@repo/core/effect/schedules`)

All Effect adoptions must import from the shared utilities and canonical schedules before writing custom helpers. **Never redeclare retry policies locally.**

```typescript
import { fireAndForget, runEffect, fromSupabase, defaultRetryPolicy, strictRetryPolicy, retryPolicy } from '@repo/core/utils/effect';
```

**`fireAndForget(fn, label)`** — run a promise in a forked fiber, errors logged not swallowed.
Replaces `void fn().catch(() => {})` and `void fn().catch(console.error)`.

```typescript
// Before
void api.sync().catch(() => {});

// After
fireAndForget(() => api.sync(), 'SyncService');
```

**`runEffect(effect, errorCode?)`** — bridge Effect to Promise, converting tagged errors to `APIError`.
Use at the edge of Effect zones (queryFn, event handlers, lifecycle hooks).

```typescript
// Before
try {
  return await someEffect();
} catch (e) {
  throw new APIError(e.message, 'MY_CODE');
}

// After
return runEffect(someEffect$(), 'MY_CODE');
```

**`fromSupabase(fn, label?)`** — wrap a Supabase `{ data, error }` query into an Effect.
Handles the data/error destructuring, null checks, and promise rejection in one step.

```typescript
const user = yield* fromSupabase(
  () => supabase.from('users').select('*').single(),
  'getUser',
);
```

**`defaultRetryPolicy`** / **`strictRetryPolicy`** / **`retryPolicy(n)`** — canonical schedules defined in `packages/core/src/effect/Schedules.ts`.

```typescript
Effect.retry(defaultRetryPolicy)   // 4 attempts (200ms exponential, recurs(3))
Effect.retry(strictRetryPolicy)    // 3 attempts (200ms exponential, recurs(2))
Effect.retry(retryPolicy(5))       // 6 attempts (200ms exponential, recurs(5))
```

### 8.6 Storage Operation Pattern (`readStorage$` / `writeStorage$`)

For local storage (MMKV/AsyncStorage), use Effect helpers to eliminate try/catch boilerplate:

```typescript
function readStorage$(key: string): Effect.Effect<string | null> {
  return Effect.tryPromise(() => storage.getItem(key) as Promise<string | null>).pipe(
    Effect.catchAll((e) =>
      Effect.sync(() => { console.error(`Failed to read ${key}:`, e); return null; }),
    ),
  );
}

function writeStorage$(key: string, data: unknown): Effect.Effect<void> {
  return Effect.tryPromise({
    try: async () => { await storage.setItem(key, JSON.stringify(data) ?? ''); },
    catch: (e) => new StorageError({ cause: e }),
  }).pipe(
    Effect.catchAll((e) =>
      Effect.sync(() => { console.error(`Failed to write ${key}:`, e); }),
    ),
  );
}
```

Pattern for getter methods (return fallback on error):
```typescript
static async getItems(): Promise<Item[]> {
  return Effect.runPromise(
    readStorage$(KEYS.ITEMS).pipe(
      Effect.map((data) => (data ? JSON.parse(data) : [])),
      Effect.catchAll(() => Effect.succeed([])),
    ),
  );
}
```

Pattern for setter methods (re-throw on error):
```typescript
static async addItem(item: Item): Promise<Item> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const data = yield* readStorage$(KEYS.ITEMS);
      const items: Item[] = data ? JSON.parse(data) : [];
      items.push(item);
      yield* writeStorage$(KEYS.ITEMS, items);
      return item;
    }).pipe(
      Effect.catchAll((e) =>
        Effect.sync(() => { throw e; }),
      ),
    ),
  );
}
```

### 8.8 Context.Tag + Layer DI for Infrastructure Ports

Layers connect Effect's DI system with your existing hexagonal ports. Define a `Context.Tag` for the port, then provide it with a `Layer`.

```typescript
// ====== logic/ports/growth.tags.ts ======
import { Context, Effect, Layer } from 'effect';
import { SupabaseGrowthAdapter } from '../../adapters/supabase/growth.adapter';
import type { IGrowthPort } from './growth.port';
import { GrowthManager } from '../managers/GrowthManager';

// Tag for the port (the dependency that varies per environment)
export class GrowthPort extends Context.Tag('app/GrowthPort')<GrowthPort, IGrowthPort>() {}

// Tag for the manager (constructed from the port at composition time)
export class GrowthManagerTag extends Context.Tag('app/GrowthManager')<GrowthManagerTag, GrowthManager>() {}

// Live implementation — one per environment (dev, prod, test)
export const GrowthPortLive: Layer.Layer<GrowthPort> = Layer.succeed(
  GrowthPort,
  new SupabaseGrowthAdapter(),
);

// Manager depends on port — resolved at Layer composition time
export const GrowthManagerLive: Layer.Layer<GrowthManagerTag, never, GrowthPort> = Layer.effect(
  GrowthManagerTag,
  Effect.map(GrowthPort, (port) => new GrowthManager(port)),
);

// Composition root — merge + satisfy all requirements
export const GrowthLayer: Layer.Layer<GrowthPort | GrowthManagerTag> = Layer.merge(
  GrowthPortLive,
  GrowthManagerLive.pipe(Layer.provide(GrowthPortLive)),
);
```

Consuming in an Effect workflow:
```typescript
Effect.gen(function* () {
  const growth = yield* GrowthManagerTag;
  yield* Effect.tryPromise({
    try: () => growth.emitSignal({ user_id, event_type, event_metadata }),
    catch: (e) => new GrowthError({ cause: e }),
  });
});
```

Testing with a fake port:
```typescript
const testLayer = Layer.merge(
  Layer.succeed(GrowthPort, fakePort),
  GrowthManagerLive, // automatically uses fakePort from context
);
```

**Rule:** Tag the **port**, not the manager, when the manager is a large stable class. The Layer that creates the manager reads the port from context — the manager class itself never imports Effect. This keeps Layer adoption incremental: the manager stays a plain class, test layers swap the port, and Effect code gets DI without a rewrite.

---

### 8.9 Decision Tradeoffs for Effect Patterns

Each Effect pattern solves a specific problem but carries costs. These tradeoffs guide when to use each.

#### 8.9.1 When to Layer-DI vs Constructor-Inject vs Singleton

| Approach | When | Why not |
|---|---|---|
| **`new Service(port)`** (constructor) | The caller already has both. Test passes mock port directly. | Caller must know how to construct everything. Viral if deep nesting. |
| **Singleton factory** (`growth.factory.ts`) | One instance per app lifecycle. Zero setup cost per call site. | Hard to swap for tests. Forces module-level mocking. |
| **`Context.Tag` + `Layer`** | Effect workflow needs the service. You need test layers. The service has 1-2 varying dependencies. | Overhead for simple cases: Tag class + Layer + provide call. Not needed when test can just `new Service(mock)`. |

**Decision tree:**
- Is the caller already in Effect context? → Use `Context.Tag` + `yield*`
- Is the caller a React component using TanStack Query? → Use singleton factory (existing pattern)
- Do you need to swap dependencies per test? → Use `Context.Tag` + test Layer
- Are you writing a new domain service with 1-2 ports? → Use `Context.Tag` from the start

#### 8.9.2 Queue Persistence: When to Persist vs In-Memory

| Queue type | Persistence | Rationale |
|---|---|---|
| **Audit logs** (`deviceAccounts.ts`) | In-memory (`Queue` + fiber, lazy `getAuditQueue()`) | Best-effort by design. Losing audit entries on crash is the existing behavior (was `console.warn`). Uses lazy initialization (`getAuditQueue()`) to avoid top-level `Effect.runSync` module parse-time execution (v4 owned-runtime ready). Persist only if audits become mandatory. |
| **Mutation queue** (`useSafeMutation`) | Zustand persist (MMKV) | **Critical for offline-first.** Mutations must survive app restart. Zustand persist is already in place — Effect adoption did not change this. |
| **Analytics / telemetry** | In-memory or MMKV | If telemetry must survive crash, persist. If best-effort, in-memory is fine and simpler. |

**Rule:** Persist queues when data loss causes incorrect behavior (e.g., a mutation that should go through silently disappears). Don't persist when the operation is advisory and failure is expected (audit, telemetry). **Never instantiate queues at module top level with `Effect.runSync`** — always use lazy initialization to remain forward-compatible with Effect v4 owned-runtime models.

#### 8.9.3 Effect.all Concurrency: When to Parallelize

| Pattern | Effect | Tradeoff |
|---|---|---|
| Sequential `yield* a; yield* b` | Simpler stack traces, deterministic ordering | Slower when calls are independent |
| `Effect.all([a, b], { concurrency: 2 })` | Faster for independent I/O | Harder to debug interleaved failures |
| `Effect.all([a, b], { concurrency: 'unbounded' })` | Fastest for fire-and-forget updates | No backpressure — use only when count is bounded (<100) |

**Rule:** Use `{ concurrency: 2 }` for fetches (2 independent DB calls). Use `{ concurrency: 'unbounded' }` only for fire-and-forget writes where we don't wait for results (e.g., expiring compasses in `GrowthManager.clearPersonalCompass`).

#### 8.9.4 fireAndForget vs try/catch + void

| | fireAndForget (Effect) | `void fn().catch(() => {})` |
|---|---|---|
| Error visibility | `Effect.logError` — structured, includes trace | `console.warn` or nothing |
| Supervision | Fiber is supervised — parent shutdown cancels it | Unmanaged — leak if never settles |
| Composability | Can chain: fork → timeout → interrupt | Not composable |
| Code length | 3 lines vs 1 line | Longer |
| **Verdict** | Use in Effect contexts. Don't refactor existing `void.catch` unless you're already touching the file. |

#### 8.9.5 Effect.retry vs Custom Retry Loops

| | Effect.retry + Schedule | `for` loop with `setTimeout` |
|---|---|---|
| Jitter | Built-in (`Schedule.exponential` with optional `Schedule.jittered`) | Manual |
| Max attempts | Composable with `Schedule.intersect(Schedule.recurs(N))` | Manual |
| Cancel on shutdown | Automatic (fiber interruption) | Manual `AbortController` |
| Testability | Can provide `Schedule.recurs(0)` to skip retries in tests | Mock setTimeout |
| **Verdict** | Use for any retry. Only write manual loops when you need control flow that Schedule can't express (e.g., conditional retry on specific HTTP status codes). |

---

### 8.10 Best-Effort Audit Pattern (trustOp$)

For non-critical side-effects (device trust, audit logs, analytics) that should never block the main flow:

```typescript
function trustOp$<T>(fn: () => Promise<T>, label: string): Effect.Effect<T | null> {
  return Effect.tryPromise(fn).pipe(
    Effect.catchAll((e) =>
      Effect.sync(() => {
        console.warn(`[${label}] failed`, e);
        return null;
      }),
    ),
  );
}

// Usage — fire-and-forget, never blocks
Effect.runFork(
  Effect.gen(function* () {
    yield* trustOp$(() => api.logAudit(...), 'logAudit');
    yield* trustOp$(() => api.upsertSession(...), 'upsertSession');
  }),
);
```

---

## 14. Quick Reference Card

### Common Operations (v3)

| Operation | Code |
|---|---|
| Succeed synchronously | `Effect.succeed(value)` |
| Succeed with void | `Effect.void` |
| Fail with typed error | `Effect.fail(new MyError({...}))` |
| Wrap throwing function | `Effect.try({ try: () => fn(), catch: (e) => new MyError({cause: e}) })` |
| Wrap promise | `Effect.tryPromise({ try: () => fetch(url), catch: (e) => new MyError({cause: e}) })` |
| Log error | `Effect.logError(message)` |
| Fork fire-and-forget | `Effect.forkDaemon(effect)` |
| Catch all errors | `Effect.catchAll(handler)` |
| Catch specific tag | `Effect.catchTag('MyError', handler)` |
| Map value | `Effect.map(value => transform)` |
| Chain | `Effect.flatMap(value => nextEffect)` |
| Parallel all | `Effect.all([e1, e2], { concurrency: 3 })` |
| Race | `Effect.race(e1, e2)` |
| Retry | `effect.pipe(Effect.retry(Schedule.exponential('1 second').pipe(Schedule.intersect(Schedule.recurs(3)))))` |
| Timeout | `effect.pipe(Effect.timeout('10 seconds'))` |
| Acquire/release | `Effect.acquireRelease(acquire, release)` |
| Run to Promise | `Effect.runPromise(effect)` |
| Run sync | `Effect.runSync(effect)` |
| SovereignError boundary | `Effect.catchAll(e => Effect.fail(SovereignError.validation(e.message, e.cause)))` |
