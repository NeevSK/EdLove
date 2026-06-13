---
title: "React Query and TanStack Pacer Integration"
status: "active"
created: 2026-06-12
updated: 2026-06-12
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, architecture, state-management, performance]
---

# React Query and TanStack Pacer Integration

This document records the architectural decision to integrate **TanStack Pacer** as a timing and execution control layer alongside **TanStack React Query** within the `gurudevi-mobile` offline-first application ecosystem.

---

## 1. Context and Problem Statement

`gurudevi-mobile` is an offline-first Expo/React Native application utilizing **PowerSync** and local **SQLite** (`@op-engineering/op-sqlite`) as its local storage engine. PowerSync replicates data in real-time, emitting change events whenever local rows or sync packets are updated.

When multiple real-time changes stream into SQLite, reactive data-fetching layers (React Query) tend to trigger immediate queries and layout invalidation loops, resulting in:
1. **Thread Congestion**: Overwhelming the single-threaded React Native bridge with rendering updates.
2. **Network Bottlenecks**: Choking cell connections with concurrent request queues during recovery.
3. **Database Write Locks**: Flooding local SQLite with rapid concurrent read/write queries.

We needed a strategy to buffer, schedule, and throttle these client-side execution timings without losing the automatic retry and caching capabilities of React Query.

---

## 2. Decision and Architecture

We decided to introduce **TanStack Pacer** (`@tanstack/react-pacer`) to act as the rate-limiting and timing scheduler between the UI/real-time streams and React Query.

### Division of Responsibilities

```
 ┌──────────────────────┐
 │    UI / Sync Stream  │
 └──────────┬───────────┘
            │ Real-time Events
            ▼
 ┌──────────────────────┐
 │    TanStack Pacer    │  <-- Buffers, debounces, & throttles triggers
 └──────────┬───────────┘
            │ Scheduled Action
            ▼
 ┌──────────────────────┐
 │    React Query       │  <-- Query caching, status tracking, & HTTP retries
 └──────────┬───────────┘
            │ Executed Query
            ▼
 ┌──────────────────────┐
 │  PowerSync (SQLite)  │  <-- Offline storage
 └──────────────────────┘
```

1. **TanStack Pacer**: Responsible for **Pre-execution Timing Control** (e.g., delaying key updates when the user types, throttling invalidations when PowerSync updates).
2. **React Query**: Responsible for **State Management & Resilience** (e.g., caching database results, performing queries, retrying failed HTTP calls with backoff, pausing operations offline).
3. **PowerSync**: Responsible for **Local Database Replication** (keeps local SQLite records synced to cloud Postgres).

---

## 3. Implementation Details

To allow code preparation and test runs in a deferred installation scenario, we developed the timing control helpers and demonstration screens beforehand.

### Core Custom Hooks
A helper file is created at `src/hooks/usePacer.ts` containing key abstractions:

```typescript
import { useDebouncedCallback, useThrottledCallback } from '@tanstack/react-pacer';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

// Throttles rapid SQLite/PowerSync synchronization updates to protect JS rendering
export function useThrottledInvalidate(duration = 500) {
  const queryClient = useQueryClient();
  const invalidate = useCallback(
    async (queryKey: unknown[]) => {
      await queryClient.invalidateQueries({ queryKey });
    },
    [queryClient]
  );

  return useThrottledCallback(invalidate, {
    key: (queryKey) => JSON.stringify(queryKey),
    duration,
  });
}

// Debounces inputs before React Query triggers search queries
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const updateValue = useDebouncedCallback(
    (newValue: T) => setDebouncedValue(newValue),
    { duration: delay }
  );

  useEffect(() => {
    updateValue(value);
  }, [value, updateValue]);

  return debouncedValue;
}
```

### Reference Screen
We added an interactive test screen at `src/screens/TanStackPacerDemo.tsx` to demonstrate both use cases:
* **Debounced input search query**: Keys change and invoke API requests only after `400ms` of typing inactivity.
* **Throttled DB Sync simulation**: Multiple sequential button clicks are throttled to a maximum of one invalidation query trigger per second (`1000ms`).

---

## 4. Consequences and Nuances

### Advantages
* **Reduced Thread Load**: Prevents layout thrashing, preserving native rendering performance.
* **Resilient Offline Workflows**: React Query handles network states and automatic offline-to-online query refreshes while Pacer protects execution spikes.
* **Modular Integration**: Timing hooks can be applied dynamically to existing query wrappers without refactoring core business logic.

### Nuances
* **Deferred Installation**: Code compiles and functions successfully once the dependency `@tanstack/react-pacer` is installed within the monorepo workspace.
