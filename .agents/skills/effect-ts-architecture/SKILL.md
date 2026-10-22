---
name: effect-ts-architecture
description: Authoritative guide and architectural reference for using Effect-TS (v3/v4) within the Polymath Platform. Derived directly from upstream Effect MIGRATION.md and official specifications. Covers Yieldable traits, Context.Service patterns, typed domain errors, canonical retry schedules, fiber concurrency, fallback caching, and hexagonal ports & adapters.
version: 1.1.0
---

# Effect-TS Architecture & Hexagonal Resilience

This skill is the authoritative source for Effect-TS engineering in the Polymath Platform, grounded in upstream `Effect-TS/effect` specs (`MIGRATION.md`).

## 1. Grounded Upstream Invariants (Effect v3 ➔ v4 Evolution)

1. **Services (`Context.Tag` ➔ `Context.Service`)**:
   - In v3: Services were declared with `Context.Tag<Id, Type>()` or `Effect.Service`.
   - In v4: Services are defined with `Context.Service<Id, Type>()` with an optional `make` constructor. Dependencies must be wired explicitly via `Layer.provide` (the inline `dependencies` array is removed).
2. **Subtyping & The `Yieldable` Trait**:
   - In v3: Types like `Ref`, `Deferred`, `Fiber`, `Option` were structural subtypes of `Effect`.
   - In v4: Types implement the explicit `Yieldable` trait. `Ref`, `Deferred`, and `Fiber` are no longer automatic effect subtypes—they require explicit helper calls (`Ref.get(ref)`, `Deferred.await(deferred)`).
3. **Fiber-Local State (`FiberRef` ➔ `Context.Reference`)**:
   - `FiberRef` and patching types have been replaced by native `Context.Reference`.
4. **Package Consolidation**:
   - In v4, functionality from `@effect/platform`, `@effect/rpc`, and `@effect/cluster` is consolidated into core `effect`. Dedicated packages exist only for drivers/adapters (`@effect/sql-*`, `@effect/opentelemetry`, `@effect/vitest`).

---

## 2. Hexagonal Architecture in Polymath Platform

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DOMAIN INTERFACE (PORT)                         │
│                    (e.g., IAttendanceRegisterPort)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ implemented by
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EFFECT ADAPTER LAYER                            │
│                 Context.Service<AttendanceRepository>()                │
├────────────────────────────────────────────────────────────────────────┤
│ • tryPromise(fetcher) for fallible I/O into typed error channel       │
│ • Canonical retry schedules from @repo/core/effect/schedules           │
│ • Graceful fallback to StorageManager (MMKV) read cache               │
│ • Automatic enqueue to SyncManager mutation outbox on network failure  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Canonical Patterns in `@repo/core/effect`

### A. Fallible Network-to-Cache Fallback (SWR Pipeline)

```typescript
import { Effect, pipe } from 'effect';
import { defaultRetryPolicy, tryPromise } from '@repo/core/effect';

export const withOfflineFallback = <T, E extends Error>(
  fetchNetwork: () => Promise<T>,
  readCache: () => T | null,
  writeCache: (data: T) => void,
  timeoutMs = 3000,
): Effect.Effect<T, E, never> => {
  const networkEffect = pipe(
    tryPromise(fetchNetwork),
    Effect.timeout(`${timeoutMs} millis`),
    Effect.retry(defaultRetryPolicy),
    Effect.tap((data) => Effect.sync(() => writeCache(data))),
  );

  return pipe(
    networkEffect,
    Effect.catchAll((err) => {
      const cached = readCache();
      if (cached !== null) {
        return Effect.succeed(cached);
      }
      return Effect.fail(err as E);
    }),
  );
};
```

### B. Fire-and-Forget Fibers for Non-Blocking Outbox & Telemetry

```typescript
import { fireAndForgetEffect } from '@repo/core/effect';

// Detached background execution with unhandled defect trapping
fireAndForgetEffect(telemetryFlushEffect, 'FlushLocalObserveBatch');
```
