---
title: "Workspace Drag-and-Drop Customizable Canvas — Implementation Plan"
status: "draft"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
tags: [workspace, canvas, drag-and-drop, customization, cross-platform, architecture]
---

# Workspace Drag-and-Drop Customizable Canvas — Implementation Plan

## Executive Summary

This document captures the complete analysis of the existing workspace canvas system across all 6 roles (Teacher, Student, Principal, Founder, Guardian, Admin) and defines a phased implementation plan to achieve **full cross-zone drag-and-drop on mobile/tablet + web drag parity + workspace settings surface** — delivering a production-grade, user-customizable dashboard that works uniformly across all platforms.

---

## Current State Analysis

### What Exists (Production-Grade Foundation)

| Layer | Implementation | Files |
|-------|----------------|-------|
| **Data Model** | Zones (`today/work/institution/outlook/private`), `order[]`, `hidden[]`, `pinned[]`, `zone_by_surface`, `layout_target` (shared/web/mobile), versioning | `packages/core/src/logic/schemas/workspace-layout.schema.ts` |
| **Persistence (DB)** | Supabase `user_workspace_layouts` with RLS, unique key `(user_id, workspace_id, layout_target)`, triggers | `apps/gurudevi-mobile/supabase/migrations/20260328113000_user_workspace_layouts.sql`, `20260328114500_workspace_layout_targets.sql` |
| **API/Contract** | SovereignContract GET/PUT/DELETE with policies | `packages/core/src/api/workspaceLayout.ts`, `workspaceLayout.contract.ts` |
| **Repository** | Supabase adapter with upsert on conflict | `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts` |
| **State Management** | `useWorkspaceLayoutSync` — local-first (MMKV/AsyncStorage), optimistic updates, remote sync with LWW conflict resolution, `layout_target` resolution per platform/screen class | `packages/core/src/native/useWorkspaceLayoutSync.ts` |
| **Surface Registry** | Capability-gated surfaces per role with `defaultZone`, `defaultOrder`, `mobileSupport`, `webSupport`, `content` | `packages/classroom/src/workspace/useTeacherDashboardSurfaces.tsx`, `useStudentDashboardSurfaces.tsx`, `packages/admin/src/*/use*WorkspaceCanvas.tsx` |
| **Drag (Mobile/Tablet)** | Reanimated 4 + RNGH v3 `Gesture.Pan`, long-press pickup, full `{x,y}` translation | `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx` |
| **Renderers** | `ResponsiveWorkspaceCanvas` → Mobile (vertical stack), Tablet (flex-wrap grid), Web (horizontal scroll) | `packages/ui/src/components/workspace/ResponsiveWorkspaceCanvas.tsx`, `renderers/*.tsx` |
| **Zone Columns** | `CanvasZoneColumn` with within-zone reorder, tap-cycle zone move, pin/hide controls | `packages/ui/src/components/workspace/CanvasZoneColumn.tsx` |
| **Card Component** | `CanvasSurfaceCard` with reorder affordance, keyboard controls, pin/hide/info actions | `packages/ui/src/components/workspace/CanvasSurfaceCard.tsx` |

### All 6 Role Workspaces (Unified Infrastructure)

| Role | Workspace ID | Surface Count | Canvas Type | Key Divergence |
|------|--------------|---------------|-------------|----------------|
| **Teacher** | `teacher-dashboard` / `classroom` | 5 | Canvas + **TeacherWorkspaceShell** (web) | Web uses fixed 2-col shell, NOT canvas |
| **Student** | `student-dashboard` | 6 | Canvas (both) | `enableRemoteSync: false` on web |
| **Principal** | `principal-workspace` | 16 | Canvas (both) | Richest surface set; setup runways hidden |
| **Founder** | `founder-workspace` | 10-12 | Canvas (both) | Feature-gated surfaces (inventory, library) |
| **Guardian** | `guardian-workspace` | 9 | Canvas (both) | Family-centric; private visibility boundaries |
| **Admin** | `admin-workspace` | 11 | Canvas (both) | Operator-focused; private audit_trail |

**All share:** `useWorkspaceLayoutSync`, `ResponsiveWorkspaceCanvas`, zone system, pin/hide/zone-move controls, Supabase persistence with `layout_target`.

---

## Critical Gaps (The "Why" of This Plan)

| Gap | Location | Impact |
|-----|----------|--------|
| **Web drag disabled** | `WebWorkspaceCanvas.tsx:62` — `dragEnabled={false}` | No drag reorder on web at all |
| **Web remote sync disabled** | `TeacherDashboardWeb.tsx:116`, `StudentDashboardWeb.tsx:79` | Web layouts don't persist to server |
| **Cross-zone drag not implemented** | `CanvasZoneColumn.tsx:127-136` — only reorders within current zone | Mobile: can't drag card from "work" to "today" zone |
| **No settings/management UI** | Only in-canvas customization exists | No bulk surface management, reset, or preferences |
| **Layout version = 1 only** | Schema has `layout_version` but no migration logic | Schema changes = breaking for existing users |
| **Card height hardcoded** | `CanvasZoneColumn.tsx:130` — `const cardHeight = 180` | Inaccurate reorder on variable-height cards |
| **No workspace-level feature flags** | Only surface-level capability gating | Can't gradually roll out or kill-switch |
| **Teacher Web diverges** | Uses `TeacherWorkspaceShell` (fixed layout) instead of canvas | Inconsistent UX, no customization on web |

---

## Modern Platform Patterns (Reference)

| Platform | Pattern | Key Libraries |
|----------|---------|---------------|
| Linear | Fixed sidebar + customizable main area; drag-reorder within columns | Custom (React + CSS Grid) |
| Jira/GitHub Projects | Board columns (kanban); drag between columns; column config | `dnd-kit` |
| Vercel Dashboard | Card grid; pinned cards top; drag reorder | `dnd-kit` |
| Supabase Dashboard | Fixed nav + customizable widget grid | `react-grid-layout` |

**Our Advantages:** Reanimated 4 + RNGH v3 for 60fps native drag (superior to web-only), zone-based mental model (matches Jira/GitHub), local-first + server sync, per-platform layout targets, capability-gated surfaces.

---

## Implementation Plan (6 Phases)

### Phase 1: Foundation Fixes (1-2 days)

**Goal:** Enable web persistence, fix layout versioning, make pinned cap configurable.

**Files to Modify:**
- `packages/core/src/native/bootstrap.ts` — Register `LocalStorageAdapter` for web (line 62-63)
- `packages/classroom/src/screens/TeacherDashboardWeb.tsx:116` — `enableRemoteSync: true`
- `packages/classroom/src/screens/StudentDashboardWeb.tsx:79` — `enableRemoteSync: true`
- `packages/core/src/logic/workspace/canvas.ts:17` — Move `MAX_PINNED_WORKSPACE_SURFACES` to per-workspace constant map
- `packages/core/src/logic/workspace/canvas.ts:normalizeWorkspaceLayout` — Add layout version migration logic

**Acceptance Criteria:**
- Web dashboards persist layout to localStorage and Supabase
- Layout version migrations work (add v2 test case)
- Pinned cap configurable per workspace (default 4)

---

### Phase 2: Cross-Zone Drag (Mobile/Tablet) (2-3 days)

**Goal:** Enable dragging a surface from one zone to another on mobile/tablet.

**Design Reference:** `docs/files/specialized/22-workspace-canvas-redesign.md` — "mobile: one continuous vertical drag, not two mechanisms"

**Files to Modify:**
- `packages/ui/src/components/workspace/ResponsiveWorkspaceCanvas.tsx` — Measure zone rects via `onLayout` on parent, pass to `CanvasZoneColumn`
- `packages/ui/src/components/workspace/CanvasZoneColumn.tsx` — Accept `zoneRects` prop; on `onDragEnd`, compute target zone from `translationY` against measured Y-ranges
- `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx` — Add `onDragMove` callback for live zone preview
- `packages/ui/src/components/workspace/renderers/MobileWorkspaceCanvas.tsx` — Enable `dragAxis="both"` (currently vertical only for cross-zone)
- `packages/ui/src/components/workspace/renderers/TabletWorkspaceCanvas.tsx` — Same boundary-lift pattern

**Acceptance Criteria:**
- Drag a card from "work" zone → "today" zone on mobile (single continuous vertical drag)
- Live visual feedback: target zone highlights during drag
- Tablet grid: drag crosses column X-boundaries + vertical within column
- No regression on within-zone reorder

---

### Phase 3: Web Drag Implementation (2-3 days)

**Goal:** Full drag-and-drop parity on web using `dnd-kit`.

**Files to Modify:**
- `package.json` — Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `packages/ui/src/components/workspace/WebDraggableCanvasSurface.tsx` — New wrapper using `dnd-kit` `useDraggable`/`useDroppable`
- `packages/ui/src/components/workspace/renderers/WebWorkspaceCanvas.tsx` — Use `dnd-kit` for horizontal column reorder + vertical within column; `dragEnabled={true}`
- `packages/classroom/src/screens/TeacherDashboardWeb.tsx` — Migrate from `TeacherWorkspaceShell` to `ResponsiveWorkspaceCanvas` (remove fixed 2-col shell)
- `packages/ui/src/components/workspace/CanvasZoneColumn.tsx` — Web path uses `WebDraggableCanvasSurface`

**Acceptance Criteria:**
- Web: drag reorder within zone (vertical)
- Web: drag card from "work" column → "today" column (horizontal)
- Keyboard accessible (Tab to card, Space to pickup, arrows to move, Enter to drop)
- Screen reader announcements for drag state
- Teacher web workspace now customizable like mobile

---

### Phase 4: Workspace Settings Surface (1-2 days)

**Goal:** In-canvas settings surface for bulk surface management (no separate settings screen).

**Design:** A generic `WorkspaceSettingsSurface` component added to each role's surface list with `defaultZone: 'private'`, `hiddenByDefault: true`.

**Files to Create:**
- `packages/ui/src/components/workspace/WorkspaceSettingsSurface.tsx` — Generic component taking `surfaces`, `layout`, `onChange` callbacks

**Files to Modify (each role's surface hook):**
- `packages/classroom/src/workspace/useTeacherDashboardSurfaces.tsx` — Add settings surface
- `packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx` — Add settings surface
- `packages/admin/src/founder/useFounderWorkspaceCanvas.tsx` — Add settings surface
- `packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx` — Add settings surface
- `packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx` — Add settings surface
- `packages/admin/src/admin/useAdminWorkspaceCanvas.tsx` — Add settings surface

**Settings Surface Features:**
- Surface visibility toggles (list all surfaces with hide/show)
- Zone assignment dropdown per surface
- Pinned surfaces list with drag-reorder + cap enforcement
- "Reset to defaults" button (calls `createDefaultWorkspaceLayout`)
- Layout version display + "Force sync from server" button

---

### Phase 5: Conflict Resolution & Polish (1-2 days)

**Goal:** Production hardening.

**Files to Modify:**
- `packages/core/src/logic/workspace/layoutSync.ts:choosePreferredWorkspaceLayout` — Replace LWW with intelligent merge:
  - `order`: Preserve relative order of common surfaces; append new surfaces at default positions
  - `hidden`: Union (hidden on any device = hidden everywhere)
  - `pinned`: Union (pinned on any device = pinned everywhere) with cap enforcement
  - `zoneBySurface`: Last-write-wins per surface (most recent `updatedAt` wins)
- `packages/ui/src/components/workspace/CanvasSurfaceCard.tsx` — Add focus-visible styles, ARIA live region for drag announcements
- `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx` — Add haptic feedback on drag start/end/zone-cross (use `nativeHapticsProvider`)
- GrowthBook flags: `workspace-cross-zone-drag`, `workspace-web-drag`, `workspace-settings-surface`

---

### Phase 6: Multi-Device/Account Hardening (1 day)

**Goal:** Robust multi-device, multi-user support.

**Files to Modify:**
- `packages/core/src/native/bootstrap.ts` — Per-user MMKV isolation: include `userId` in MMKV instance ID or separate namespaces
- `packages/core/src/native/useAuthLifecycle.ts` — Call `storage.clearAll()` on logout
- `packages/core/src/logic/schemas/workspace-layout.schema.ts` — Add `lastSyncedVersion` field for conflict detection

---

## File Touch Map (Summary)

| Phase | Primary Files |
|-------|---------------|
| 1 | `bootstrap.ts`, `TeacherDashboardWeb.tsx`, `StudentDashboardWeb.tsx`, `canvas.ts` |
| 2 | `ResponsiveWorkspaceCanvas.tsx`, `CanvasZoneColumn.tsx`, `DraggableCanvasSurface.tsx`, `renderers/MobileWorkspaceCanvas.tsx`, `renderers/TabletWorkspaceCanvas.tsx` |
| 3 | `WebWorkspaceCanvas.tsx`, new `WebDraggableCanvasSurface.tsx`, `TeacherDashboardWeb.tsx`, `package.json` |
| 4 | New `WorkspaceSettingsSurface.tsx`, 6 surface hook files |
| 5 | `layoutSync.ts`, `CanvasSurfaceCard.tsx`, `DraggableCanvasSurface.tsx` |
| 6 | `bootstrap.ts`, `useAuthLifecycle.ts`, `workspace-layout.schema.ts` |

---

## Open Questions (Need Decisions)

1. **Teacher Web Migration Priority**: Migrate `TeacherDashboardWeb` to canvas in Phase 3, or keep fixed shell and only add drag to canvas-based workspaces?
   - *Recommendation*: Migrate — consistent UX, single code path, eliminates `TeacherWorkspaceShell` tech debt.

2. **Settings Surface vs Separate Screen**: Settings-as-surface (in `private` zone, hidden by default) vs separate route?
   - *Recommendation*: Settings-as-surface — consistent with canvas paradigm, no new navigation.

3. **Conflict Resolution Depth**: Simple array merge (preserve relative order) vs full CRDT?
   - *Recommendation*: Array merge — layout is small JSON; CRDT overkill.

4. **GrowthBook Rollout**: Per-phase flags (`workspace-cross-zone-drag`, `workspace-web-drag`, `workspace-settings-surface`) or one `workspace-v2` flag?
   - *Recommendation*: Per-phase — finer control, safer rollout.

5. **PowerSync for Layout**: Add `user_workspace_layouts` to PowerSync schema for true offline-first sync?
   - *Recommendation*: Skip for now — Supabase + local cache works; PowerSync better for high-volume data.

6. **Analytics/Telemetry**: Track drag events (reorder, zone-move, pin, hide) for future smart-zone algorithms?
   - *Recommendation*: Yes — add telemetry events in `DraggableCanvasSurface` and `CanvasZoneColumn` callbacks.

---

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| `dnd-kit` adds bundle size (~15KB gzipped) | Code-split web drag bundle; only load on web |
| Cross-zone drag collision detection complexity | Start with boundary-lift pattern (measure rects on layout); iterate on edge cases |
| Teacher Web migration breaks existing UX | Feature flag gate; A/B test with GrowthBook |
| Layout migration breaks existing users | Versioned migration in `normalizeWorkspaceLayout`; test with v1→v2 fixture |
| Multi-user MMKV isolation | Use separate MMKV instances per user ID; clear on auth change |

---

## Success Metrics

- ✅ Drag reorder works on all 3 platforms (mobile, tablet, web)
- ✅ Cross-zone drag works on mobile/tablet/web
- ✅ Layout persists across devices (web + native) with conflict resolution
- ✅ Each role has workspace settings surface accessible in-canvas
- ✅ Feature flags control rollout per capability
- ✅ Zero regression on existing pin/hide/zone-move (tap-cycle)
- ✅ Keyboard + screen reader accessible on web
- ✅ Haptic feedback on native drag interactions

---

## Related Documents

- `docs/files/specialized/22-workspace-canvas-redesign.md` — Interaction design spec (cross-zone drag, live preview)
- `docs/files/specialized/21-workspace-tab-ui-operationalization.md` — Canvas architecture audit
- `apps/gurudevi-mobile/docs/Core/workspace-navigation-philosophy.md` — Design philosophy
- `packages/core/src/logic/workspace/canvas.ts` — Core layout logic
- `packages/core/src/native/useWorkspaceLayoutSync.ts` — State management hook