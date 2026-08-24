---
title: "Effect-TS Layer DI + Tradeoffs Decision"
status: "active"
created: 2026-07-22
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Effect-TS Layer DI + Tradeoffs Decision

**Date:** 2026-07-22
**Status:** Active
**Scope:** `packages/core` — GrowthManager DI strategy, queue persistence, pattern guidelines

## Context

After adopting Effect-TS across 10 files (attendance, deviceAccounts,
useSafeMutation, etc.), we needed a consistent strategy for:

1. Wiring Effect's DI (`Context.Tag` + `Layer`) into the existing
   hexagonal architecture (ports + adapters + managers)
2. Deciding which queues need persistence (MMKV) vs in-memory
3. Choosing among constructor injection, singleton factories, and
   Effect layers for new and existing code

## Decision 1: Tag the Port, Not the Manager

**Verdict:** `Context.Tag` wraps the *infrastructure port* (`IGrowthPort`),
not the domain manager (`GrowthManager`). A thin `Layer.effect` creates the
manager from the tagged port.

### Why

- `GrowthManager` is 698 lines / 30+ methods. Making it a Tag would
  require wrapping every method signature or rewriting the class — no
  benefit proportional to cost.
- The *port* varies per environment (Supabase vs test double). The
  *manager* is a pure domain class that just needs the right port.
- Test layers swap the port, and the manager automatically uses the
  stubbed version:

  ```typescript
  const testLayer = Layer.merge(
    Layer.succeed(GrowthPort, fakePort),
    GrowthManagerLive,
  );
  ```

### When to NOT use Context.Tag

- Singleton factory already works (React components + TanStack Query):
  no need to switch.
- Caller already constructs the manager manually (EducationalManager,
  CommunityManager): keep constructor injection.
- One-off Effect in a handler: use `Effect.runPromise` directly, skip
  the Layer setup.

**Tradeoff:** Adds ~30 lines of boilerplate (Tag + Layer + export) for
each port. Only do this for ports that need testing or have multiple
implementations.

## Decision 2: Queue Persistence Scope

| Queue | Storage | Rationale |
|---|---|---|
| **Audit logs** (deviceAccounts) | In-memory (`Queue` + fiber) | Best-effort by design. Losing entries was existing `console.warn` behavior. Persist only if device trust escalates to hard-blocking. |
| **Mutations** (useSafeMutation) | Zustand persist / MMKV | Critical for offline-first — must survive app restart. Unchanged from pre-Effect implementation. |

**Decision function:** Persist queues that, when dropped, cause
incorrect application behavior. Don't persist best-effort side-effects.

## Decision 3: When Each DI Pattern

```
Question → Decision
─────────────────────────────────────────────────────
Is caller already in Effect context?       → yield* Tag
Is caller a React component?               → existing singleton factory
Need to swap deps per test?                → Tag + Layer
Writing new domain service with 1-2 ports?  → Start with Tag + Layer
One-off Effect in event handler?           → Effect.runPromise inline
```

## Files Created / Modified

- `packages/core/src/logic/ports/growth.tags.ts` — GrowthPort Tag,
  GrowthManagerTag Tag, GrowthPortLive, GrowthManagerLive, GrowthLayer
- `apps/gurudevi-mobile/docs/Core/effect-ts-coding-guide.md` — added
  sections 8.8 (Context.Tag + Layer DI), 8.9 (Decision Tradeoffs)
