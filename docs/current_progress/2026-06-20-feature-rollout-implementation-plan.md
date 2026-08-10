---
title: "Feature Rollout Implementation Plan"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Antigravity"
tags: [current-progress, implementation, feature-flags, growthbook, sqlite, sanctuary]
---

# Feature Rollout Implementation Plan

## Goal

Implement a clean feature-rollout system that aligns with the sanctuary architecture, uses GrowthBook as the primary evaluator, and supports offline-first behavior through a durable local cache.

This plan is grounded in:

- [decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md](../decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md)
- [architecture/2026-06-19-sanctuary-authorization-final-architecture.md](../architecture/2026-06-19-sanctuary-authorization-final-architecture.md)
- [architecture/2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md](../architecture/2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md)
- [architecture/gurudevi-sanctuary-permission-architecture.md](../architecture/gurudevi-sanctuary-permission-architecture.md) (superseded)
- [architecture/gurudevi-data-state-lifecycle.md](../architecture/gurudevi-data-state-lifecycle.md)
- [old_docs/gurudevi-sanctuary-agent-execution-guide.md](old_docs/gurudevi-sanctuary-agent-execution-guide.md) (archived)

---

## 1. What We Are Building

We are building a rollout pipeline with these parts:

- a feature-rollout interface in core
- a GrowthBook adapter as the primary evaluator
- a local cached fallback for offline and startup
- a runtime store layer for fast UI reads
- an optional Supabase-backed sync/admin path where needed

The system should not reuse `permissionsMap` for feature rollout.

---

## 2. Existing Pieces We Should Reuse

The repo already has several related building blocks:

- `packages/core/src/logic/ports/featureFlag.port.ts`
- `packages/core/src/logic/ports/storage.port.ts`
- `packages/core/src/logic/ports/globalConfig.port.ts`
- `packages/core/src/store/useFeatureStore.ts`
- `packages/core/src/native/storage.ts`

These are useful because they already establish the separation between:

- runtime state
- persisted KV storage
- rollout concerns
- other config concerns

The implementation should evolve these pieces instead of introducing duplicate abstractions unless there is a clear boundary reason to do so.

---

## 3. What Needs To Change

### A. Feature rollout contract

The current feature-flag port is too small for the target rollout model.
It needs to express:

- resolution
- refresh
- subscription
- exposure tracking
- offline fallback behavior

If the current port can be extended cleanly, do that.
If not, create a new rollout-specific abstraction and keep the existing one as an adapter layer.

### B. Local cache contract

We need a durable local cache for rollout state.

Recommended split:

- `storage` for small bootstrap values and quick persisted KV
- SQLite only if the cached rollout model grows into something structured or versioned enough to justify it

This decision should be based on what the rollout data actually needs, not on preference for one persistence layer in the abstract.

### C. UI composition

UI code should move toward `useSanctuaryFeature` rather than calling lower-level rollout or authz stores directly.

That keeps the decision path centralized and avoids scattered product logic.

---

## 4. Implementation Order

### Phase 1: Confirm the boundary

- Decide whether the existing feature-flag port will be expanded or replaced with a rollout-specific port.
- Decide the offline cache shape.
- Keep `permissionsMap` separate from rollout logic.

### Phase 2: Add the primary evaluator

- Wire a GrowthBook adapter.
- Make it the primary source for feature rollout decisions.
- Preserve a local fallback path for offline and cold start.

### Phase 3: Add persistence

- Store the resolved rollout cache locally.
- Hydrate runtime state from the cache on boot.
- Refresh the cache when the network is available.

### Phase 4: Integrate with sanctuary composition

- Move UI checks to `useSanctuaryFeature`.
- Keep authorization and rollout concerns separate in the composition layer.
- Preserve Shape 1 authz only where it is still needed.

### Phase 5: Verify against docs and code

- Compare the implementation back to the June 19/20 docs.
- Treat the code as stale where it reflects older mental models.
- Confirm there are no new rollout/authz conflations.

---

## 5. Decisions We Are Not Making Yet

These are still open unless a later doc or implementation test settles them:

- whether rollout cache must live in SQLite from day one
- whether Supabase is only a sync/admin source or also a remote fallback source
- whether the existing feature-flag port should be renamed
- whether `permissionsMap` will eventually be retired entirely or only narrowed

For now, the implementation should stay flexible enough to support either cache path without committing the codebase to an unnecessary structure.

---

## 6. Success Criteria

We are done when:

- GrowthBook is the primary rollout evaluator
- offline startup works from a local cache
- Supabase is not being mistaken for offline storage
- rollout state is not mixed into `permissionsMap`
- UI reads go through the sanctuary composition layer
- the implementation matches the June 19/20 docs rather than older code assumptions

---

## 7. Next Step

Before writing code, resolve the boundary questions in Section 5 and confirm whether the rollout cache needs SQLite on day one or can start as a smaller KV-backed cache with a future migration path.
