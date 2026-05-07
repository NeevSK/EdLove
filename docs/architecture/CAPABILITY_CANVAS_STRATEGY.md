# Capability Canvas Strategy

Status: active architecture guide

This document defines how workspace UI should evolve into a capability-driven canvas across web and mobile.

It exists to answer one question:

How do we let users organize their workspace without coupling UI layout to package ownership, role names, or ad hoc screens?

This should be read with:

- [ROLE_WORKSPACE_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/ROLE_WORKSPACE_STRATEGY.md)
- [CROSS_HOLON_CONTRACT_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CROSS_HOLON_CONTRACT_MAP.md)
- [DOMAIN_OWNERSHIP_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/DOMAIN_OWNERSHIP_MAP.md)
- [PARALLEL_WORK_GUIDE.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/PARALLEL_WORK_GUIDE.md)

## 1. Core rule

Canvas is a presentation and preference system.

It is not a domain owner.

So the shape should be:

- package owns workflow
- POA owns capability
- workspace registry owns surface composition
- canvas owns arrangement and visibility

Not:

- drag and drop becomes the architecture

## 2. What already exists

The repo already has a useful first seam:

- `packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts`

That means layout persistence already exists in a small local form.

We should now generalize that pattern instead of creating new one-off layout systems per role.

## 3. Shared canvas model

Every workspace surface should be described by shared metadata.

Minimum shape:

- `surfaceId`
- `workspaceId`
- `capabilityKey`
- `ownerPackage`
- `defaultZone`
- `defaultOrder`
- `hiddenByDefault`
- `mobileSupport`
- `webSupport`

Every user layout should store:

- `workspaceId`
- `userId`
- `order`
- `hidden`
- `pinned`
- `zoneBySurface`
- `updatedAt`

This lets us support:

- reorder
- hide
- pin
- zone changes
- role or capability defaults
- device-specific canvas rendering now, with deeper per-platform tuning later

Recommended renderer config shape:

- `runtimePlatform`
- `platform`
- `mode`
- `maxColumns`

Important distinction:

- `runtimePlatform` is the real host environment: `android`, `ios`, or `web`
- `platform` is the visual renderer choice: `mobile`, `tablet`, or `web`

That means a browser window can legitimately use the tablet renderer when width is reduced.

Example defaults:

- mobile: `stack` or `rail`
- tablet: `grid`
- web: `kanban` or `grid`

Recommended responsive doctrine:

- one responsive entry point decides the renderer from runtime plus width
- separate renderer implementations stay lean underneath that entry point
- avoid one giant universal renderer component trying to encode every layout branch inline

## 4. Separation of concerns

### 4.1 Surface registry

Each workspace should produce a registry of available surfaces.

Examples:

- classroom workspace
- principal workspace
- founder workspace
- guardian workspace

The registry answers:

- what can this user see
- which package owns each surface
- what zone should it default into

### 4.2 Layout engine

The layout engine answers:

- in what order should surfaces appear
- which are hidden
- which are pinned
- what user preferences override the defaults

### 4.3 Renderer

The renderer answers:

- how surfaces appear on web
- how surfaces appear on mobile
- whether a zone is stacked, tabbed, or grid-based

This means web and mobile can have different layout behavior while sharing the same surface registry and layout state.

### 4.4 Platform dialects

The canvas should share one capability and layout model, but not one identical visual design.

That means:

- mobile can prefer stacked or rail-first zones
- tablet can prefer denser split layouts
- web can prefer wider kanban or grid columns

So the architecture rule is:

- one shared surface registry
- one shared layout state shape
- one responsive renderer resolver
- different renderer dialects per platform

This avoids false consistency while preserving architectural consistency.

## 5. Zone model

For now, standardize on zones rather than full freeform coordinates.

Recommended zones:

- `today`
- `work`
- `institution`
- `outlook`
- `private`

Why:

- easier to support on mobile
- easier to persist safely
- easier to align with capabilities
- keeps us from overbuilding a desktop-only drag surface too early

Full freeform canvas can come later after zone layout is stable.

## 6. Role and capability relationship

The canvas should not be role-keyed first.

It should be capability-keyed first.

Examples:

- a principal plus teacher may see both institutional and classroom surfaces
- a section head may see teacher surfaces plus limited institutional overlays
- a founder may see ecosystem surfaces and institution surfaces

So:

- capability determines surface eligibility
- layout determines arrangement
- role labels are just one input into capability composition

## 7. End-to-end completion plan

This is the execution order to complete the larger architecture without trying to do everything at once.

### Phase A

Workspace and boundary stabilization

Done or underway:

- principal shell moved into admin
- founder and guardian POA seams started
- teacher insight anti-surveillance seam started

### Phase B

Capability canvas foundation

Do next:

1. create shared workspace types
2. generalize workspace layout model beyond classroom-only
3. map principal and classroom shells onto the shared model
4. keep UI simple: reorder, hide, pin

### Phase C

Cross-holon hardening

1. principal observations and invites
2. teacher insights share or promote
3. attendance
4. grading

For each lane:

- write owner
- projection consumer
- temporal model
- POA metadata
- audit

### Phase D

Canvas-backed role workspaces

1. principal workspace
2. teacher workspace
3. student workspace
4. founder workspace
5. guardian workspace

Each one should consume:

- shared surface registry model
- shared layout state
- package-owned surfaces

### Phase E

Advanced canvas

Only after zones and layout are stable:

- drag and drop
- resize
- per-device preferences
- saved presets

## 8. What to do in separate chats safely

To avoid conflicts, parallel work should use disjoint write scopes.

Safe separate-chat tasks:

1. Attendance contract and temporal map
Write scope:
- docs only, or `packages/core/src/api/attendance*` plus related schemas

2. Grading contract and temporal map
Write scope:
- docs only, or `packages/core/src/api/grading*` plus related schemas

3. Workspace canvas type migration plan
Write scope:
- docs only, or new shared workspace type files without editing active screens

4. Guardian summary temporal policy
Write scope:
- docs only, or guardian contract docs and tests

Avoid parallel overlap on:

- `packages/core/src/api/index.ts`
- the same screen files
- the same bridge files
- the same workspace hook files

## 9. Immediate next move

The next best implementation move is:

1. add shared workspace surface and layout types
2. migrate the current classroom layout seam to those types
3. then start attendance as the next temporal and cross-holon hardening lane
