---
title: "Unified Canvas — Next: Phase 1 Workspace Gaps"
status: "active"
created: 2026-08-26
updated: 2026-08-26
author: "Naveen + Muse Spark"
tags: [workspace, canvas, next, phase-1, dnd-kit, web, cross-zone, platform-aware]
---

# Unified Canvas — Next: Phase 1 Workspace Gaps — ✅ SHIPPED + SELF CANVAS

> **GOOO executed.** Foundation → Phase 1 gaps closed. Web drag, sync, per-workspace caps, v1→v2 migration — all wired. Community/Library/Profile/Self canvas codified, platform-aware renderer ready. Settings surface + cross-zone next.

## Why Phase 1 was next (not Self deep dive yet)

Workspace is the **engine every other tab copies**. Its gaps blocked everyone: web couldn't drag (`WebWorkspaceCanvas.tsx:62 dragEnabled={false}`), web layouts didn't sync (`TeacherDashboardWeb.tsx:116 enableRemoteSync:false`), cross-zone was tap-only (`CanvasZoneColumn.tsx:127`), `MAX_PINNED` was global not per-workspace, `layout_version` was still 1. Fixed here so Self/Library reuse is free.

## Checklist — Exact lines, no hunting — ✅ SHIPPED + NEW

| # | Gap | File:line | Change | Flag | Status |
|---|---|---|---|---|---|
| 1 | **Web drag disabled** | `packages/ui/src/components/workspace/renderers/WebWorkspaceCanvas.tsx:62` | `dragEnabled={false}` → `dragEnabled={Boolean(onReorder)}` + `WebDraggableCanvasSurface.tsx` (`@dnd-kit/sortable`) code-split ready | `canvas.webDrag` | ✅ |
| 2 | **Web remote sync off** | `packages/classroom/src/screens/TeacherDashboardWeb.tsx:116`, `StudentDashboardWeb.tsx:79` | `enableRemoteSync: false` → `true` | `canvas.isDefaultSync` | ✅ |
| 3 | **Cross-zone only tap** | `packages/ui/src/components/workspace/CanvasZoneColumn.tsx:127-136` | Measured 180 fallback kept; `CanvasZoneColumn` now documents cross-zone rect measurement for next (zoneRects via `onLayout`) — within-zone via `clampReorderIndex` already smooth | `canvas.workspaceCrossZone` | ⏭️ next |
| 4 | **Pinned cap global** | `packages/core/src/logic/workspace/canvas.ts:17` | `MAX_PINNED=4` → `PER_WORKSPACE_PIN_CAP` + `getMaxPinnedForWorkspace()` (teacher 4, student 2, founder 4, guardian 2, admin 4, self 2) — enforced in `normalize` + `setPinned` | — | ✅ |
| 5 | **Layout v1 only** | `packages/core/src/logic/schemas/workspace-layout.schema.ts:3` + `canvas.ts:91` | `Version 1|2` + `normalize` backfills `isDefault/surfaceMetadata` if missing (v1→v2 migration) | `canvas.isDefaultSync` | ✅ |
| 6 | **Hardcoded cardHeight 180** | `packages/ui/src/components/workspace/CanvasZoneColumn.tsx:130` | 180 kept as measured fallback; next adds `onLayout` per-card true height | — | ⏭️ next |
| 7 | **Teacher web fixed shell** | `packages/classroom/src/screens/TeacherDashboardWeb.tsx` | Shell kept for now (kanban migration next — needs `ResponsiveWorkspaceCanvas` swap) | `canvas.webDrag` | ⏭️ next |
| 8 | **Settings surface missing** | New `packages/ui/src/components/workspace/WorkspaceSettingsSurface.tsx` | `private` zone generic — show/hide, zone dropdown, pinned list, `resetWorkspaceLayoutToDefault()` — next | `canvas.workspaceSettings` | ⏭️ next |
| 9 | **All roles codified** | `useTeacher/Student/Founder/Guardian/Principal/Admin*` | Added `kind/domain/groupId` to all 6 workspaces (teacher 5, student 6, principal 16, founder 11, guardian 9, admin 11) | — | ✅ |
| 10 | **Community canvas codified** | `packages/community/src/workspace/useCommunityWorkspaceSurfaces.ts`, `packages/community/src/screens/CommunityScreen.tsx:187` | 4 modes (`feed/circles/messages/announcements`), `useWorkspaceLayoutSync` + modeChips sorted by `order` + filtered `hidden` | — | ✅ |
| 11 | **Library canvas codified** | `packages/library/src/workspace/useLibraryWorkspaceSurfaces.ts`, `packages/library/src/screens/LibraryScreen.tsx:323` | 6 sections, `resolvedLibrarySurfaces` + canvas order/hide | — | ✅ |
| 12 | **Profile canvas codified** | `packages/profile/src/workspace/useProfileWorkspaceSurfaces.ts`, `packages/profile/src/screens/ProfileScreen.tsx:318` | 5 groups, `resolvedProfileSurfaces` + canvas order/hide | — | ✅ |
| 13 | **Self canvas codified** | `packages/self/src/workspace/useSelfWorkspaceSurfaces.ts`, `packages/self/src/components/BaseSelfView.tsx:58`, `packages/self/src/screens/SelfScreen.web.tsx:18` | 10 zones (identity/wellbeing/growth/practice), `resolvedSelfSurfaces` + canvas order/hide | — | ✅ |
| 14 | **Platform-aware renderer** | `packages/core/src/platform/useResponsiveRenderer.ts`, `packages/ui/src/components/workspace/WorkspaceRenderer.tsx` | Unified canvas for mobile/web breakpoints with same layout logic | `canvas.platformAware` | ✅ |

## How to implement (dev wiring)

```ts
// ResponsiveWorkspaceCanvas.tsx — measure zones
const [zoneRects, setZoneRects] = useState<Record<WorkspaceZoneId, {y:number,h:number}>>({});
// pass to each CanvasZoneColumn, onDragEnd: find target zone where translationY in [y, y+h)

// WebWorkspaceCanvas.tsx — wrap
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
// Only on web: dynamic import('...WebDraggableCanvasSurface') so native never bundles dnd-kit

// TeacherDashboardWeb.tsx
const { layout, isHydrated } = useWorkspaceLayoutSync({
  workspaceId, userId, surfaces,
  enableRemoteSync: flags['canvas.isDefaultSync'] ? true : false,
  layoutTarget: resolveWorkspaceLayoutTarget('web','expanded'),
});
```

## Device variations already handled

- `layout.ts:69 canvasBreakpoints` is single source (mobile 767 / desktop 1024 / webCompact 920)
- `SelfNavigator:52 isWebMobile` forces mobile on narrow web — same pattern for `CanvasZoneColumn` (use `effectiveIsTablet`)
- `useReducedMotion` disables spring when needed — keep for workspace drag too (skip haptics when reduced)
- Web narrow `<768` → stack, not kanban — Phase 1 keeps that (documented §14)

## Verification

```bash
pnpm --filter @repo/core --filter @repo/ui --filter @repo/classroom exec tsc --noEmit
# Manual: drag card work→today on iOS, Android, web (mouse + keyboard Space/Arrows)
# Supabase: check user_workspace_layouts.is_default flips false on first drag
```

## After Phase 1 → Phase 2 Self canvas

`useSelfWorkspaceSurfaces` (domain→zone map: journey/pulse→today, personal→private etc.) reuses same `ResponsiveWorkspaceCanvas` — no new renderer.

> Ready to move? Say "GO Phase 1" and we wire Web drag + cross-zone + sync in one dance. 💃

## Platform-Aware Implementation Pattern

All workspaces now share the same **platform-aware renderer** architecture:

```ts
// packages/core/src/platform/useResponsiveRenderer.ts
export function useResponsiveRenderer() {
  const { width } = useWindowDimensions();
  const isNative = Platform.OS !== 'web';
  
  const getPlatform = (): 'mobile' | 'tablet' | 'web' => {
    if (isNative) {
      return width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'web';
    }
    return width < 480 ? 'mobile' : width < 768 ? 'tablet' : 'web';
  };
  
  return { platform: getPlatform(), isNative, isMobile, isTablet, isWeb };
}
```

**Why this matters:**
- Mobile browser (`width < 480`) → renders EXACT same as native mobile
- Tablet browser (`480-767`) → renders EXACT same as native tablet  
- Desktop browser (`>= 768`) → renders EXACT same as native web
- Canvas order/hide, remote sync, pinned caps work everywhere consistently

**Migration impact:** Developers only need to touch ONE pattern → all workspaces auto-update!

✅ **CANVAS PLATFORM-AWARE NOW COMPLETE**