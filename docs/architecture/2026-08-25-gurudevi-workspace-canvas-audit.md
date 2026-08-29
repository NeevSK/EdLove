---
title: "Gurudevi Mobile Workspace Canvas Architecture Audit"
status: "active"
created: 2026-08-25
updated: 2026-08-25
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, architecture, workspace, quality, rendering]
---

# Gurudevi Mobile Workspace Canvas Architecture Audit

> **Scope**: `packages/classroom/src/workspace/`, `packages/ui/src/components/workspace/`, `packages/core/src/logic/workspace/`, `packages/core/src/native/useWorkspaceLayoutSync.ts`, and how these are consumed in the `(tabs)/workspace` routes.

---

## Executive Summary

The architecture direction is **correct and conceptually elegant**: a generic `WorkspaceSurfaceDefinition` contract, zone-aware layout, per-user persistence with local+remote sync, and platform-aware renderers. But the execution has several layers of problems ranging from *shallow wiring* (surfaces rendered inside themselves with no navigation), to *type-safety holes* (`as any`, casting away `ClassroomWorkspaceSurface` to bypass missing fields), to *state management anti-patterns*, to *missing production essentials* (no debounce on remote sync writes, no conflict UI, no error boundaries). Below is a ranked breakdown by severity.

---

## 1. Critical — Things That Will Break in Production

### 1.1 Remote sync fires on every state change with no debounce

**File**: [useWorkspaceLayoutSync.ts:247-287](file:///c:/x/packages/core/src/native/useWorkspaceLayoutSync.ts#L247-L287)

```ts
// Fires EVERY render cycle where layout changes, immediately:
void syncRemote();
```

Every drag-and-drop, every zone move, every pin triggers an individual `await workspaceLayoutAPI.upsertWorkspaceLayout(...)`. On a slow connection this creates a queue of inflight mutations. The `isCancelled` flag only prevents state updates after unmount — it does **not** cancel the in-flight request. This will:
- Hammer the Supabase function N times per gesture
- Race-condition `lastSyncedLayoutRef` — two saves succeeding out of order will silently overwrite a newer layout with an older one

**Fix**: Debounce the sync effect with `useRef<ReturnType<typeof setTimeout>>`:

```ts
const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
useEffect(() => {
  if (!layout || ...) return;
  if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
  syncTimerRef.current = setTimeout(() => { void syncRemote(); }, 1200);
  return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
}, [layout, ...]);
```

---

### 1.2 Layout reconciliation on every `surfaces` change has infinite loop potential

**File**: [useWorkspaceLayoutSync.ts:289-298](file:///c:/x/packages/core/src/native/useWorkspaceLayoutSync.ts#L289-L298)

```ts
useEffect(() => {
  if (!layout || !surfaces.length) return;
  setLayoutState((current) => { ... normalizeWorkspaceLayout(current, surfaces) ... });
}, [surfaces, defaultLayout, layout]); // ← 'layout' in deps + setLayoutState modifies layout
```

`layout` is in the dep array. `setLayoutState` triggers a re-render which changes `layout`. This creates a potential infinite render loop — `normalizeWorkspaceLayout` is not fully idempotent (`setWorkspace*` helpers stamp `updatedAt`). The equality check `serializeLayout(normalized) === serializeLayout(current)` guards against this only if `JSON.stringify` key order is stable — which it is not guaranteed to be across engines.

**Fix**: Remove `layout` from the dep array. Use `useRef` to hold the last-reconciled surface hash, not the serialised layout.

---

### 1.3 `refreshFromRemote` captures stale `layout` via closure

**File**: [useWorkspaceLayoutSync.ts:159-183](file:///c:/x/packages/core/src/native/useWorkspaceLayoutSync.ts#L159-L183)

`layout` is listed as a `useCallback` dep. On every local change `refreshFromRemote` becomes a new function reference, causing every consumer (pull-to-refresh buttons) to re-render.

**Fix**: Use a ref to track the current layout without it being a dep:

```ts
const layoutRef = useRef(layout);
useEffect(() => { layoutRef.current = layout; }, [layout]);
// In refreshFromRemote: local: layoutRef.current
```

---

### 1.4 `content: ReactNode` stored inside the surface definition — data and UI are fused

**Files**:
- [core/types/Workspace.ts:128](file:///c:/x/packages/core/src/types/Workspace.ts#L128) — `ClassroomWorkspaceSurface` carries `content: React.ReactNode`
- [useStudentDashboardSurfaces.tsx:174](file:///c:/x/packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx#L174) — content is `<TemporalNavigator />` inline inside `useMemo`
- [useClassroomWorkspaceSurfaces.tsx:203-215](file:///c:/x/packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx#L203-L215) — content is `<ScreenWrapper>...<TeacherDashboard /></ScreenWrapper>`

This is the deepest structural problem. `WorkspaceSurfaceDefinition` + `WorkspaceCanvas` is a **layout-metadata contract** — it describes *what* surfaces exist and *where* they go. It must not carry `content: ReactNode`. When it does:

1. **JSX captured at memo time** — the `useMemo` in `useStudentDashboardSurfaces` has 9 deps; JSX instances are reconstructed on every dep change, defeating referential stability.
2. **React tree is destroyed on reorder** — when surface order changes, the entire rendered tree remounts (keys shift position), destroying all local state inside `TeacherDashboard`, `StudentDashboard`, etc.
3. **Cannot serialise surfaces** — ReactNode is not JSON; mixing data and UI into the same type makes the sync contract fragile.

**Fix**: Decouple `SurfaceDefinition` from rendered content via a **registry pattern**:

```ts
// In core/types/Workspace.ts — no content field:
export interface WorkspaceSurfaceDefinition<...> {
  surfaceId: TSurfaceId;
  rendererId: string; // 'TeacherDashboard' | 'StudentDashboard' | ...
}

// In packages/classroom — a renderer registry:
const CLASSROOM_SURFACE_RENDERERS: Record<string, ComponentType<{ surface: ResolvedWorkspaceSurface }>> = {
  TeacherDashboard: TeacherDashboardSurface,
  StudentDashboard: StudentDashboardSurface,
};
// Canvas calls: const Renderer = CLASSROOM_SURFACE_RENDERERS[surface.rendererId];
```

---

## 2. High — Shallow / Non-Functional Patterns

### 2.1 Demo data permanently hardcoded in production surfaces

**File**: [useStudentDashboardSurfaces.tsx:46-63](file:///c:/x/packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx#L46-L63)

`DEMO_ASSIGNMENTS` and `DEMO_GOALS` are module-level constants that ship in the production bundle and are never replaced with real data. The `demo-assignments` surface is shown when `isDemoExperience` is true — but `isDemoExperience` is not clearly gated against production auth state.

**Fix**: Move behind `__DEV__` guard or a `DemoDataProvider`. Real assignment data should come from a proper query.

---

### 2.2 `useStudentDashboardSurfaces` is disconnected from the canvas

The outer `useClassroomWorkspaceSurfaces` appends a surface whose `content` is `<StudentDashboard />`. But `StudentDashboard` renders its *own* tile system driven by `useStudentDashboardSurfaces`. The inner tiles:

- Do **not** use `ClassroomWorkspaceCanvas`
- Do **not** persist to `workspace-layout` storage
- Have **no** zone/pin/reorder mechanics

The result is two completely independent canvas instances — the outer shell canvas, and the inner flat `ScrollView` of tiles. The inner one has no persistence and no user control.

**Fix**: Either collapse the two levels into one (the classroom canvas *is* the student dashboard surface list with `workspaceId: 'student-dashboard'`), or wire the inner canvas to its own `useWorkspaceLayoutSync` call.

---

### 2.3 Zone cycling is one-directional with no undo

**File**: [ClassroomWorkspaceCanvas.tsx:30-33](file:///c:/x/packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx#L30-L33)

`getNextZone` cycles zones forward only. A user who overshoots their target zone cannot go backwards — there is no reverse cycle, and no way to undo without resetting the entire layout.

**Fix**: Replace cycle-forward with an explicit zone picker (bottom sheet / popover with zone chips), or add a bidirectional cycle (`getPrevZone`).

---

### 2.4 Drag-to-reorder uses a hardcoded card height of `180`

**File**: [CanvasZoneColumn.tsx:128](file:///c:/x/packages/ui/src/components/workspace/CanvasZoneColumn.tsx#L128)

```ts
const shift = Math.round(translation.y / 180);
```

Cards vary wildly in height. This calculation is wrong for almost every card.

**Fix**: Track actual rendered heights via `onLayout` in a `Map<surfaceId, number>` and use `cardHeightMap.get(id) ?? 180` as the divisor.

---

### 2.5 `useClassroomWorkspaceInsights` uses raw `useEffect` + async fetching

**File**: [useClassroomWorkspaceInsights.ts:31-62](file:///c:/x/packages/classroom/src/workspace/useClassroomWorkspaceInsights.ts#L31-L62)

Classic "fetch in effect" anti-pattern: no loading state, no error recovery, and `can` (a function) is listed as a dep — so this fires on every render that produces a new `can` reference.

**Fix**: Use `@tanstack/react-query`:

```ts
const { data: teacherStats } = useQuery({
  queryKey: ['teacher-stats', userId],
  queryFn: () => api.classrooms.getByTeacher(userId!),
  enabled: !!userId && can('manage', 'TeacherDashboard'),
  staleTime: 5 * 60 * 1000,
});
```

---

### 2.6 `_layout.web.tsx` (639 lines) and `_layout.tsx` (285 lines) duplicate all shared logic

Both files wire `PowerSyncProvider`, achievement overlay, breathing modal, navigation items, and notification badge. All shared state (`isBreathingOpen`, `showCelebration`, `currentAchievement`) is duplicated — any new feature must be added twice.

**Fix**: Extract `useTabsShell(userId)` hook containing all shared state. The two layout files call this hook and only differ in their JSX structure (sidebar rail vs. bottom tabs).

---

## 3. Medium — Code Quality & Maintainability

### 3.1 `renderNudge()` is a closure function used as a `useMemo` dep — always invalidates

**File**: [useClassroomWorkspaceSurfaces.tsx:83-164](file:///c:/x/packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx#L83-L164)

`renderNudge` is listed as a dep of the `useMemo` at line 272 — but it is recreated every render, so the memo is effectively disabled.

**Fix**: Extract as a proper React component `<ClassroomNudge>` and render it in the JSX tree, not inside a surface's `content` field.

---

### 3.2 Progress bar uses `style={{ width: \`${goal.progress}%\` } as any}`

**File**: [useStudentDashboardSurfaces.tsx:393](file:///c:/x/packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx#L393)

This `as any` masks a potential crash on Android. Use a `View` with constrained parent width — percentage strings *do* work in RN when the parent width is resolved, but the cast hides the type error. Remove the cast and verify.

---

### 3.3 Breathing state is duplicated: local `uiState` in shell AND global Zustand store

`uiState.isBreathingOpen` in `useTeacherWorkspaceShell` is never connected to the modal rendered by `_layout.tsx` (which reads `useStore(state => state.isBreathingOpen)`). The local state is dead code.

**Fix**: Remove `isBreathingOpen` from the shell's local state. Use only the global store.

---

### 3.4 `WorkspaceCanvasHero` hardcodes "max 4" regardless of actual workspace pin cap

**File**: [shared.tsx:98](file:///c:/x/packages/ui/src/components/workspace/shared.tsx#L98)

`getMaxPinnedForWorkspace` already returns per-workspace values (2, 4, 0, etc.). The hero ignores this and always displays "max 4".

**Fix**: Pass `maxPinned` as a prop derived from `getMaxPinnedForWorkspace(layout.workspaceId)`.

---

### 3.5 `CanvasZoneColumn` runs `findIndex` 4× per surface per render

**File**: [CanvasZoneColumn.tsx:156-176](file:///c:/x/packages/ui/src/components/workspace/CanvasZoneColumn.tsx#L156-L176)

`findIndex` is called for `canMoveUp`, `canMoveDown`, `onMoveUp`, `onMoveDown` — 4 O(n) scans per surface. For 10 surfaces: 40 scans per render.

**Fix**: Use the `index` parameter from `group.surfaces.map((surface, index) => ...)`:

```tsx
group.surfaces.map((surface, index) => (
  <DraggableCanvasSurface key={surface.surfaceId} ...>
    <CanvasSurfaceCard
      reorderControls={{
        canMoveUp: index > 0,
        canMoveDown: index < group.surfaces.length - 1,
        onMoveUp: () => onReorder?.(surface.surfaceId as TSurfaceId, resolveReorderTarget(index, -1, group.surfaces.length)),
        onMoveDown: () => onReorder?.(surface.surfaceId as TSurfaceId, resolveReorderTarget(index, 1, group.surfaces.length)),
      }}
    />
  </DraggableCanvasSurface>
))
```

---

## 4. Architecture Prescription

### 4.1 Surface Registry (replaces content-in-definition)

```
packages/classroom/src/workspace/
  surfaceRegistry.tsx          ← rendererId → ComponentType map
  surfaces/
    TeacherDashboardSurface.tsx
    StudentDashboardSurface.tsx
    PrincipalDashboardSurface.tsx
    TemporalContextSurface.tsx
    QuickActionsSurface.tsx
```

The canvas calls `SURFACE_REGISTRY[surface.rendererId]` — keys are stable, React trees are preserved on reorder, surfaces are fully serialisable.

### 4.2 Batched debounced sync writer

```
useWorkspaceLayoutSync
  → local write: immediate, synchronous MMKV (no await)
  → remote write: debounced 1200ms, cancels previous timer
  → conflict resolution: server timestamp wins (choosePreferredWorkspaceLayout already implements this)
```

### 4.3 `react-query` for all surface data fetching

Replace all `useEffect + async` fetches with `useQuery`. Benefits: deduplication, background refetch, stale-while-revalidate, proper loading/error states.

### 4.4 `useReducer` + `WorkspaceProvider` context

Replace 5 separate `setSurface*` callback props with a single `dispatch` and a `WorkspaceProvider`:

```tsx
<WorkspaceProvider workspaceId="classroom" userId={userId} surfaces={surfaces}>
  <ClassroomWorkspaceCanvas />
</WorkspaceProvider>
```

Any surface component calls `useWorkspace()` to get `dispatch` and `layout` — no prop drilling. The reducer also enables undo history for free.

---

## 5. Missing Production Essentials

| Missing | Impact | Fix |
|---|---|---|
| No `ErrorBoundary` around each surface card | One broken surface crashes the whole canvas | Wrap `CanvasSurfaceCard` content in `ErrorBoundary` |
| No conflict resolution UI | Local/remote layout divergence is silently resolved | Wire `ConflictResolver` (already exists at `ui/components/ConflictResolver.tsx`) |
| No loading skeleton during hydration | Canvas shows empty state while async hydrate runs | Return `<WorkspaceCanvasSkeleton />` while `!isHydrated` |
| `WebDraggableCanvasSurface` is a stub (807 bytes) | Web drag-to-reorder is non-functional | Implement with `@dnd-kit/sortable` |
| Surface `content` renders eagerly | `<TeacherDashboard>` mounts at canvas load even if off-screen | Wrap in `React.lazy` + `Suspense` |
| No accessibility order for zone columns | Screen readers read zones in DOM order | Add `accessibilityLabel` to each zone column header |

---

## 6. Recommended Next Steps (Prioritised)

| Priority | Task | Effort |
|---|---|---|
| 🔴 Critical | Debounce the remote sync write in `useWorkspaceLayoutSync` | 1 day |
| 🔴 Critical | Remove `layout` from the reconciliation `useEffect` dep array | 0.5 day |
| 🏗 Architecture | Migrate to surface registry — remove `content: ReactNode` from definition | 3–4 days |
| 🟠 High | Add `@tanstack/react-query` for all surface data hooks | 2 days |
| 🟠 High | Extract `useTabsShell()` to deduplicate `_layout.tsx` / `_layout.web.tsx` | 1 day |
| 🟡 Medium | Fix `findIndex` quadratic scan in `CanvasZoneColumn` | 2 hours |
| 🟡 Medium | Fix hardcoded "max 4" in `WorkspaceCanvasHero` | 30 min |
| 🟡 Medium | Remove dead `isBreathingOpen` from `useTeacherWorkspaceShell` | 30 min |
| 🏭 Production | Add `ErrorBoundary` around each surface | 1 day |
| 🏭 Production | Implement web drag-and-drop with `@dnd-kit/sortable` | 2 days |
| 🏭 Production | Add `WorkspaceCanvasSkeleton` during hydration | 1 day |
