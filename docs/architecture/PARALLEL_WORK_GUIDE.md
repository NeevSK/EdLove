# Parallel Work Guide

Status: active coordination guide

This document exists to let multiple chats move the architecture forward without stepping on each other.

Use it with:

- [CAPABILITY_CANVAS_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CAPABILITY_CANVAS_STRATEGY.md)
- [CROSS_HOLON_CONTRACT_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CROSS_HOLON_CONTRACT_MAP.md)
- [PRE_POA_STABILIZATION_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/PRE_POA_STABILIZATION_MAP.md)

## 1. Core rule

Parallel work should split by lane and by write scope.

Good parallelism:

- one chat works on attendance
- one chat works on grading
- one chat works on docs only

Bad parallelism:

- two chats edit `packages/core/src/api/index.ts`
- two chats edit the same workspace shell
- two chats move the same bridge files

## 2. Safe parallel tasks

These are the safest current tasks for a fresh low-context chat.

### Task A

Attendance temporal and POA map

Recommended write scope:

- `docs/architecture/*attendance*`
- `packages/core/src/api/attendance*`
- attendance schemas
- attendance-focused tests

Goal:

- define attendance write owner
- define admin oversight projections
- define temporal fields
- define POA subject and action mapping

### Task B

Grading temporal and POA map

Recommended write scope:

- `docs/architecture/*grading*`
- `packages/core/src/api/grading*`
- grading schemas
- grading-focused tests

Goal:

- define grading draft or publish lifecycle
- define teacher authoring versus principal oversight
- define temporal and audit rules

### Task C

Guardian temporal summary policy

Recommended write scope:

- guardian docs
- guardian tests
- guardian schemas only if isolated

Goal:

- define what guardian sees as timeline, summary, or official record
- keep admin as workspace, not hidden persistence owner

### Task D

Capability canvas migration support

Recommended write scope:

- docs only
- brand-new shared helper or type files

Goal:

- define reusable surface metadata
- define layout persistence rules
- avoid editing active screen files unless the main chat asks for it

## 3. Do not overlap

Avoid parallel edits on these files unless one chat clearly owns them:

- `packages/core/src/api/index.ts`
- `packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx`
- `packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts`
- `packages/classroom/src/workspace/usePrincipalWorkspaceSurfaces.tsx`
- `packages/admin/src/bridge/principalWorkspaceShell.tsx`
- `packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx`
- active principal screen files
- active bridge files

## 4. Prompt template for a new chat

Use a prompt like this when starting from low context:

> Read these first:
> `docs/architecture/CROSS_HOLON_CONTRACT_MAP.md`
> `docs/architecture/CAPABILITY_CANVAS_STRATEGY.md`
> `docs/architecture/PRE_POA_STABILIZATION_MAP.md`
> `docs/architecture/PARALLEL_WORK_GUIDE.md`
>
> Work only on the `[attendance|grading|guardian|canvas]` lane.
> Do not edit `packages/core/src/api/index.ts`, workspace shell files, or principal bridge files.
> Goal: produce a contract-backed, temporal, POA-aware result for this lane without touching unrelated screens.
> If implementation is safe within this scope, do it. Otherwise leave a precise migration doc and focused tests.

## 5. Ready-to-paste prompts

### Attendance chat

> Read `docs/architecture/CROSS_HOLON_CONTRACT_MAP.md`, `docs/architecture/CAPABILITY_CANVAS_STRATEGY.md`, `docs/architecture/PRE_POA_STABILIZATION_MAP.md`, and `docs/architecture/PARALLEL_WORK_GUIDE.md`.
> Work only in the attendance lane.
> You may edit attendance docs, attendance contracts, attendance schemas, and attendance-focused tests.
> Do not edit `packages/core/src/api/index.ts`, workspace hooks, principal bridge files, or active screen files.
> Goal: define and, if safe, implement the attendance temporal and POA hardening seam with clear write-owner and oversight projection boundaries.

### Grading chat

> Read `docs/architecture/CROSS_HOLON_CONTRACT_MAP.md`, `docs/architecture/CAPABILITY_CANVAS_STRATEGY.md`, `docs/architecture/PRE_POA_STABILIZATION_MAP.md`, and `docs/architecture/PARALLEL_WORK_GUIDE.md`.
> Work only in the grading lane.
> You may edit grading docs, grading contracts, grading schemas, and grading-focused tests.
> Do not edit `packages/core/src/api/index.ts`, workspace hooks, principal bridge files, or active screen files.
> Goal: define and, if safe, implement the grading temporal and POA hardening seam, especially draft, publish, oversight, and audit boundaries.

### Guardian policy chat

> Read `docs/architecture/CROSS_HOLON_CONTRACT_MAP.md`, `docs/architecture/PRE_POA_STABILIZATION_MAP.md`, and `docs/architecture/PARALLEL_WORK_GUIDE.md`.
> Work only on guardian temporal policy and guardian-focused tests.
> Do not edit `packages/core/src/api/index.ts`, workspace hooks, or principal bridge files.
> Goal: clarify the guardian timeline, summary, and official-record visibility model without expanding admin-local persistence ownership.

### Canvas support chat

> Read `docs/architecture/CAPABILITY_CANVAS_STRATEGY.md` and `docs/architecture/PARALLEL_WORK_GUIDE.md`.
> Work only on docs or brand-new shared canvas helpers and types.
> Do not edit active workspace hooks, active screens, or `packages/core/src/api/index.ts`.
> Goal: improve the shared surface and layout model without colliding with the main architecture migration.

## 6. End-to-end completion view

The repo should complete in three coordinated tracks.

### Main track

Cross-holon hardening

Order:

1. principal observations and invites
2. teacher insight governance
3. attendance
4. grading

### Support track

POA hardening per lane

For every stabilized lane:

- contract coverage
- policy metadata
- focused tests
- audit rules

### UX track

Capability canvas foundation first, advanced canvas later

Order:

1. shared workspace surface model
2. shared layout persistence model
3. role workspace adoption
4. only later drag and drop or resize

## 7. Immediate next move

The next strongest main-chat move after this guide is:

1. continue attendance as the next temporal cross-holon lane
2. keep grading available as the safest parallel chat
3. keep canvas work limited to shared types and layout, not freeform UI invention
