---
title: "Compact, Tablet, and Canvas Responsive UI Audit"
status: "draft"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
tags: [gurudevi, mobile, responsive, workspace, canvas, ui-audit]
---

# Compact, Tablet, and Canvas Responsive UI Audit

## Audit boundary and confidence

This is an independent source audit of the Workspace canvas, responsive shell, tab/navigation variants, and workspace route payloads. Evidence was taken from `docs/files/specialized/21-workspace-tab-ui-operationalization.md`, `docs/files/specialized/22-workspace-canvas-redesign.md`, `apps/gurudevi-mobile/docs/architecture/gurudevi-responsive-shell-layout-spec.md`, and the live repository code.

No runtime screenshots, device recordings, browser resize session, keyboard test, pointer test, or assistive-technology session was available. Spatial conclusions below are therefore reconstructed from layout code and should be revalidated visually at minimum on a narrow web viewport, native phone, native tablet portrait/landscape, and desktop web. Imported audit/design documents are treated as hypotheses; claims explicitly marked **verified** were checked against the current render/import chain.

## Canonicality trace

The live Workspace entry is `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx`. It resolves capacity and redirects to role routes. The teacher/default path reaches `apps/gurudevi-mobile/app/(tabs)/workspace/classroom/index.tsx`, which renders `ClassroomScreen` from `@repo/classroom/overview`. The teacher dashboard surface system is assembled by `packages/classroom/src/workspace/useTeacherDashboardSurfaces.tsx`; its canvas wrapper is `packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx`.

`ClassroomWorkspaceCanvas` exports through `packages/ui/src/components/workspace/WorkspaceCanvas.tsx` to `ResponsiveWorkspaceCanvas`, which selects `MobileWorkspaceCanvas`, `TabletWorkspaceCanvas`, or `WebWorkspaceCanvas`. The selection uses `packages/core/src/logic/workspace/renderer.ts`; the native width is first normalized by `packages/ui/src/components/layout.ts`.

This confirms the canvas is a live shared path, not merely the demo in `packages/ui/src/screens/WorkspaceCanvasDemo.tsx`. Similar-looking legacy/archive files were not used as the canonical evidence path.

## Spatial map: what each variant actually composes

### Phone / compact mobile

The native tab shell supplies a `GlobalHeader` and Expo Router tab bar from `apps/gurudevi-mobile/app/(tabs)/_layout.tsx`. The mobile canvas is a full-width vertical stack: hero, then one zone after another, then cards within each zone. The hero places title/subtitle on the left and three metric pills on the right in a single row, although no source-level wrap/collapse rule is present in `packages/ui/src/components/workspace/shared.tsx`. On a narrow phone this is a high-risk composition: the “surfaces”, “pinned · max 4”, and renderer-status pills are diagnostic metadata competing with the actual work entry point.

The compact web shell is a separate topbar layout below 920px in `apps/gurudevi-mobile/src/lib/responsiveShell.ts`. It uses horizontal scrolling navigation, no labels in the navigation item component, no content surface padding/radius, and a compact title size. That is a reasonable shell response to limited width, but it is not the same thing as the native phone layout: the compact-web canvas still resolves through the width-based workspace renderer and can become a mobile stack while the surrounding navigation remains a horizontally scrolling web topbar.

### Native tablet

Native tablet classification is based on named viewport rules in `packages/ui/src/components/layout.ts` (`768px` portrait width, or a landscape short edge of `600px`), while the workspace renderer resolves any normalized width above `767px` to the tablet renderer. The tablet canvas is a two-column flex-wrap grid with a `320px` minimum column width in `packages/ui/src/components/workspace/renderers/TabletWorkspaceCanvas.tsx` and `packages/ui/src/components/workspace/CanvasZoneColumn.tsx`.

This is materially different from phone and is directionally correct, but the current grid is “zones as columns,” not an operational workbench. Five possible zones can produce three rows of unequal column heights; there is no source evidence of a deliberate main-lane/side-rail priority, sticky working lane, or tablet-specific surface ordering. The canvas hero remains the same dense hero as mobile, only with more available width.

### Web / desktop

The web shell has three width bands in `apps/gurudevi-mobile/src/lib/responsiveShell.ts`: topbar below `920px`, collapsed icon rail from `920px` to `1279px`, and expandable labeled rail at `1280px` and above. The shell correctly treats web compact, tablet-like web, and desktop web as distinct composition modes rather than stretching the native tab bar.

The web canvas itself, however, renders zone columns inside a horizontal `ScrollView` in `packages/ui/src/components/workspace/renderers/WebWorkspaceCanvas.tsx`. This is a horizontally scrollable strip of zone columns, not a composed desktop workspace with a clear primary working lane and secondary rail. The surrounding web shell reserves up to `1280px` of content width, but the canvas does not use that space to establish a stable reading/working hierarchy; it delegates navigation between zones to horizontal scrolling.

## Findings

### P0 — Classroom selection payload is discarded on the teacher workspace path

**Evidence.** `packages/classroom/src/screens/ClassroomScreen.tsx`, `packages/classroom/src/screens/TeacherDashboard.tsx`, and `packages/classroom/src/screens/TeacherDashboard.web.tsx` push `/workspace` with `classroomId` and `classroomName`. `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx` reads those params, but for teacher/default capacity it redirects to `/workspace/classroom` and does not forward them. `apps/gurudevi-mobile/app/(tabs)/workspace/classroom/index.tsx` renders the list screen again. The dedicated student path does forward and consume `classroomId` through `apps/gurudevi-mobile/app/(tabs)/workspace/classroom/student/[classroomId].tsx`.

**Inference.** A teacher with multiple classrooms can tap a specific classroom and return to an unscoped classroom list rather than enter that classroom. The UI presents a specific selection, but the route contract does not preserve the selection. This is a navigation payload failure, not merely a visual issue.

**Severity.** P0 for the teacher’s primary Workspace job; it can make the central “Your classrooms” surface feel nonfunctional.

**Redesign-level recommendation.** Make the canonical teacher destination explicit: either route directly to `/workspace/classroom/[classroomId]` from the list, or make `/workspace` forward the selected ID to the canonical classroom dashboard. Then align native/web route behavior and add a route test that asserts the selected classroom is rendered, not only that a redirect occurs. Do not solve this with a visual “selected” state that still leaves the route unscoped.

### P1 — Tablet exposes a 2D drag affordance without a connected reorder operation

**Evidence.** `packages/ui/src/components/workspace/renderers/TabletWorkspaceCanvas.tsx` passes no `onReorder` prop to `CanvasZoneColumn`. `CanvasZoneColumn` still wraps every card in `DraggableCanvasSurface`; its drag-end callback computes a new index from `translation.y` but only calls `onReorder` when the callback exists. `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx` installs a long-press plus pan gesture and reports both X and Y translation, but no target-zone resolution exists there. Mobile and web pass `onReorder`; tablet does not.

**Inference.** On tablet, a person can receive pickup/movement feedback but the drop cannot persist a reorder through the canvas callback. The interaction reads as draggable while behaving as non-operative, which is especially damaging on a spatial canvas where the drag is the main configuration affordance.

**Severity.** P1: broken primary interaction on one target class; potentially P0 if tablet is a supported teacher device.

**Redesign-level recommendation.** Choose and implement a tablet-specific interaction contract before polishing visuals: side-by-side zones may support cross-column drag with live target highlighting, while intra-zone order uses measured card positions; non-drag users need explicit move controls. If tablet is intentionally non-reorderable, remove the drag wrapper in that renderer and expose a clear menu/action model instead. Do not leave a gesture that appears to work but has no state transition.

### P1 — Web “canvas” is a horizontal zone carousel, not a desktop information architecture

**Evidence.** `WebWorkspaceCanvas` places all `CanvasZoneColumn` instances in a horizontal `ScrollView`. Each column has a `320px` minimum width. The web shell in `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx` can supply a labeled rail and up to `1280px` content width, but the canvas does not establish a main lane, secondary rail, or persistent cross-zone overview.

**Inference.** Desktop users with pointer and large-screen affordance are asked to discover work by horizontal scrolling a list of columns. This makes the canvas behave like a widened phone sequence rather than a desktop operational surface. It also increases the chance that the “Your classrooms” working surface is visually displaced by low-frequency zones.

**Severity.** P1 for web/tablet-like web; P2 for narrow web where horizontal compression is expected.

**Redesign-level recommendation.** Redesign web as a stable two-part composition: a primary working lane for classroom registry/actions and a narrower contextual rail for temporal/pulse/support content. Preserve the user-configurable canvas concept, but give zones explicit desktop roles and a visible overview. Use horizontal scrolling only inside a deliberately bounded secondary region, not as the top-level discovery mechanism. Validate the split against real classroom counts and task frequency before hard-coding the final zone assignment.

### P1 — The shared canvas card has too many simultaneous jobs and repeated hierarchy

**Evidence.** `packages/ui/src/components/workspace/CanvasSurfaceCard.tsx` can render zone/owner kicker, title, subtitle, temporal badge, pinned badge, summary, snapshot panel, metadata pills, content shell, actions, info, and hide controls. The teacher surface definitions add substantial summaries and metadata in `packages/classroom/src/workspace/useTeacherDashboardSurfaces.tsx`. The hero separately reports surface count, pinned count, and renderer/mode. The teacher support surface renders five quick actions, including Admin, Library, Principal Echo, My Echoes, and Breathing.

**Inference.** The card is simultaneously a container, status panel, explanatory preview, configuration panel, and action launcher. On phone, this produces vertical density and repeated labels; on tablet/web, it produces large islands that compete with the actual classroom list. The source uses 10px action labels in `useTeacherDashboardSurfaces.tsx`, which is below the shared 14px body scale and should be treated as a compression signal, not a neutral style choice.

**Severity.** P1 for the default teacher canvas; P2 for locked/rare surfaces.

**Redesign-level recommendation.** Give each surface one primary job. Keep title plus one concise status line in the card header; move configuration to a clearly separate overflow/menu affordance; remove renderer/debug-like metadata from the default reading path; and collapse support-tools into fewer, task-oriented destinations. Keep the actual classroom registry content prominent and let the canvas explain arrangement only when the person enters an explicit arrange mode.

### P1 — Pin and zone movement are visually equivalent but behaviorally different

**Evidence.** `packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx` renders “Pin/Unpin” and “Move to {nextZone}” as identical rounded pills with the same surface/border treatment. Zone movement is a repeated tap cycle through `WORKSPACE_CANVAS_ZONES`; the next destination is not previewed beyond the changing label.

**Inference.** A binary preference and a multi-step spatial relocation read as equivalent controls. Repeated taps scale poorly as zones grow, and a person has no direct destination chooser or spatial preview.

**Severity.** P1 for anyone configuring the canvas; P2 if drag is reliable and the buttons are only fallback controls.

**Redesign-level recommendation.** Separate configuration controls from everyday surface actions. Use an explicit “Arrange” mode with zone drop targets or a destination menu, and reserve “Pin” for prominence. Keep a non-drag move-up/move-down or move-to-zone action for accessibility and keyboard/switch input, but label it as configuration rather than as a peer to content actions.

### P2 — Responsive token discipline is split across incompatible breakpoint systems

**Evidence.** The shared UI token system defines phone/tablet/desktop at `0/600/1024` with grid `1/2/3` in `packages/ui/src/tokens.ts`. `packages/ui/src/components/layout.ts` defines native tablet at `768`, desktop at `1024`, and a 320px minimum column. The web shell independently defines `920` and `1280` in `apps/gurudevi-mobile/src/lib/responsiveShell.ts`; the core workspace renderer uses `767` and `1279` in `packages/core/src/logic/workspace/renderer.ts`. The canvas also contains direct values such as `cardHeight = 180` in `CanvasZoneColumn.tsx` and literal RGBA colors in `CanvasSurfaceCard.tsx`.

**Inference.** Different subsystems can select different semantic bands for the same viewport. A web width can be “tablet” to the shell but “web” or “tablet” to another component, while canvas card geometry is estimated rather than measured. This undermines the stated responsive-token discipline and makes breakpoint QA expensive.

**Severity.** P2, with P1 escalation when a breakpoint disagreement changes navigation or interaction mode.

**Redesign-level recommendation.** Establish one named responsive contract for shell, workspace renderer, grid, and content surfaces, with explicit platform overrides only where the interaction model truly differs. Replace the approximate fixed card height with measured layout geometry for reorder calculations. Route color/spacing/radius through semantic tokens; audit raw values as drift candidates rather than allowing local exceptions to accumulate.

### P2 — Keyboard and pointer affordances are not specified for web configuration

**Evidence.** Web navigation uses `Pressable` and has accessibility labels/hints in `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx`. The canvas drag path uses long-press/pan gestures in `DraggableCanvasSurface.tsx`; the move-zone fallback is a pressable in `ClassroomWorkspaceCanvas.tsx`. No source evidence in the audited path defines keyboard reorder commands, focus-visible styling for canvas cards, pointer hover/drag states, or an explicit arrange-mode entry point.

**Inference.** Web has a pointer-capable surface but primarily receives a touch-derived interaction model. Keyboard users and people who cannot long-press may lack an equivalent way to reorder or move a surface. Accessibility labels on navigation do not close this canvas-specific interaction gap.

**Severity.** P2, potentially P1 for an institutional/workspace product where desktop keyboard use is expected.

**Redesign-level recommendation.** Specify an interaction parity matrix per variant: touch drag, pointer drag, keyboard move, screen-reader action, and switch-control action. Add visible focus treatment and direct move commands before adding more canvas freedom. Test with the web rail collapsed and expanded because the available label context changes.

## Variant decision matrix

| Variant | Keep | Redesign | Do not assume |
|---|---|---|---|
| Native phone | One-column flow; large touch targets; clear classroom entry | Hero metrics, card job count, arrange-mode affordance | That phone should expose the same zone controls as web |
| Native tablet | Two-column opportunity; separate working and contextual lanes | Zone columns, reorder contract, live drop feedback | That a two-column flex wrap is a finished tablet IA |
| Compact web | Horizontal shell navigation when width is constrained | Canvas overview and label visibility for keyboard/pointer use | That compact web is simply native phone in a browser |
| Desktop web | Labeled rail, wide content, pointer affordance | Horizontal zone strip into stable workbench/main-lane + rail | That more width means more simultaneous cards |

## Recommended implementation order

1. Repair teacher classroom route payload tracing and add a regression test for selected classroom identity.
2. Define the responsive workspace contract and interaction parity matrix before changing card styling.
3. Split the canvas information architecture by variant: vertical flow for phone, measured two-lane tablet, stable main lane plus contextual rail for web.
4. Introduce an explicit arrange mode with measured geometry, live target feedback, and non-drag alternatives.
5. Reduce the shared card to one job and move configuration/status detail out of the default reading path.
6. Revalidate at representative widths with runtime screenshots and keyboard/pointer/assistive-technology checks.

## Final assessment

The underlying direction is worth preserving: Workspace is a configurable canvas rather than a fixed dashboard, and the code already has real platform-specific renderers. The current experience is not ready to treat those renderers as complete responsive information architecture. The largest redesign need is not “make the cards prettier”; it is to establish canonical classroom navigation, make the canvas interaction truthful on every variant, and give tablet/web a spatial composition that reflects their available geometry instead of only adding columns or horizontal scroll.
