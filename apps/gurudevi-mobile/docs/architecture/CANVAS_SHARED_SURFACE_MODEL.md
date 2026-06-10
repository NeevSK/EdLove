---
title: "Canvas Shared Surface Model"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Canvas Shared Surface Model

Status: canvas support lane

This note turns the strategy in
[CAPABILITY_CANVAS_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CAPABILITY_CANVAS_STRATEGY.md)
into a concrete shared model that multiple workspaces can adopt later without editing the active hooks today.

It is intentionally limited to:

- docs
- brand-new shared helpers
- brand-new shared layout derivation logic

It does not require changes to:

- active workspace hooks
- active screens
- `packages/core/src/api/index.ts`

## 1. Canonical shared shape

The existing `WorkspaceSurfaceDefinition` and `WorkspaceLayout` types remain the core contract.

The new shared helper layer lives at:

- `packages/core/src/lib/workspace/canvas.ts`

It provides the canonical behavior that future workspace hooks should share:

- create a default layout from surface metadata
- normalize stored layouts when surfaces are added or removed
- preserve `hidden`, `pinned`, and `zoneBySurface`
- derive a stable ordered view model for rendering
- group resolved surfaces by zone for shared renderers
- mutate order, visibility, pin state, and zone assignment without hook-specific duplication

The persistence split should be:

- local device storage for offline-first immediate reads and writes
- remote user workspace layout records for cross-device sync
- separate remote layout targets for `web`, `mobile`, and shared fallback

Local-first matters because canvas arrangement is preference state and should remain usable with no network.

The new shared UI layer lives at:

- `packages/ui/src/components/workspace/WorkspaceCanvas.tsx`
- `packages/ui/src/components/workspace/CanvasZoneColumn.tsx`
- `packages/ui/src/components/workspace/CanvasSurfaceCard.tsx`

Those components are intentionally renderer-only. They can present a real zone-based canvas now, but they are not wired into live workspace screens in this lane.

## 2. Normalization rules

Any workspace-specific hook that stores layout should follow these rules.

### 2.1 New surfaces

When a new eligible surface appears:

- append it according to `defaultOrder`
- assign its `defaultZone`
- honor `hiddenByDefault`

### 2.2 Removed surfaces

When a surface is no longer eligible:

- remove it from `order`
- remove it from `hidden`
- remove it from `pinned`
- remove its `zoneBySurface` entry

### 2.3 Ordering

Ordering should be stable and predictable:

- explicit user `order` wins first
- `defaultOrder` fills gaps for new surfaces
- `surfaceId` breaks ties deterministically

### 2.4 Zones

Zones remain constrained to the current strategy set:

- `today`
- `work`
- `institution`
- `outlook`
- `private`

This keeps the layout model mobile-safe while still allowing later zone renderers to differ by platform.

Important:

- the stored model should map surfaces to zones, order, visibility, and pin state
- it should not store pixel coordinates for the current foundation phase
- the UI decides whether a zone is rendered as a column, stack, tabs, or another responsive form

That is how canvas position maps to UI item safely without overfitting to one screen size.

### 2.5 Pinning

Pinning is independent from visibility and ordering:

- pinning marks priority
- ordering still controls sequence
- renderers may later choose to elevate pinned surfaces visually

That separation avoids hard-coding a renderer policy into persistence.

## 3. Derived surface view model

Renderers and future workspace hooks should consume a resolved surface model rather than repeatedly re-deriving state ad hoc.

The shared resolved model includes:

- original surface metadata
- `order`
- `hidden`
- `pinned`
- `zone`

The shared grouped model includes:

- `zone`
- `surfaces[]`

This is enough for:

- simple stacked workspaces now
- zone columns later
- tabbed or mobile condensed renderers later

without changing persistence again.

## 4. Safe migration path

To avoid merge pressure with the active workspace migration, adoption should happen in this order:

1. keep current workspace hooks unchanged while the shared helper settles
2. add the remote persistence seam for user workspace layouts without wiring live hooks yet
3. migrate `useClassroomWorkspaceLayout.ts` to call the shared helper functions and local-first sync seam
4. migrate principal and other role workspaces after the classroom seam is stable
5. only then add renderer-level features such as zone sections, pin rails, or drag and drop

## 5. Persistence model

The new remote sync seam uses a dedicated user/workspace row rather than storing layout inside a role-specific table.

Recommended record shape:

- `user_id`
- `workspace_id`
- `layout_target`
- `order_json`
- `hidden_json`
- `pinned_json`
- `zone_by_surface_jsonb`
- `layout_version`
- `updated_at`

Behavior:

- load local cached layout immediately on app start
- normalize against current eligible surfaces
- choose a layout target such as `web` or `mobile` based on platform and screen class
- if online, fetch remote row and compare freshness
- if device-specific remote layout is missing, fall back to shared remote layout
- prefer the newer normalized layout
- write local immediately on any change
- upsert remote opportunistically when connectivity allows

The shared sync helper should therefore do three jobs:

- map platform plus screen class to a layout target
- keep a local cache per `workspace_id + layout_target + user_id`
- reconcile local and remote snapshots by `updated_at`

## 6. Why this is the safest canvas support change

This support-lane change improves the architecture now because it:

- removes repeated layout logic from becoming the next source of drift
- gives the main chat a ready-made pure helper seam
- keeps the strategy capability-first and zone-first
- does not create new screen coupling
- does not interfere with current package ownership or bridge work
