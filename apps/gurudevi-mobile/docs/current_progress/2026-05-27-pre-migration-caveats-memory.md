---
title: "Gurudevi Pre-Migration Caveats and Memory"
status: "active"
created: 2026-05-27
updated: 2026-05-27
author: "Naween"
tags: [reorganized]
---

# Gurudevi Pre-Migration Caveats and Memory

This is a persistent memory document for future sessions. It records confirmed decisions, sealed boundaries, known risks, and places where the current code diverges from the intended design.

## Confirmed design decisions
- Capacity is a lens, not a location.
- Capacity switching happens only in Workspace.
- Capacity must never be reflected in the URL.
- `/workspace` always stays `/workspace`.
- Active capacity lives in store/context only.
- On app open, active capacity always defaults to the user’s primary capacity, not the last known capacity.
- CASL recomputes when active capacity changes in store.
- Other tabs never read from the Workspace capacity store.
- Self has two layers:
  - Base layer: `journey`, `pulse`, `care`, `reflection`
  - Role layer: `growth`, `working`, `leadership`
- Self resolution comes from identity context and all bonds/roles the user holds.
- SelfScreen must stack all applicable layers instead of picking one role view.
- The self registry already has the correct shape for layered Self.
- `WorkspaceCanvas` already exists in `packages/ui` as a shared component.
- `WorkspaceLayout`, `WorkspaceSurface`, and `WorkspaceSurfaceDefinition` already exist in `packages/core` as shared types.
- `ClassroomWorkspaceCanvas` is legacy naming around a shared workspace canvas wrapper.
- `useTeacherWorkspaceShell` is teacher-specific in name but mostly general in logic.
- React Navigation imports are at the boundary and should not be deep in business logic.
- `navigation.reset()` exists in the shell and auth-guard flows and is part of the current shell behavior.
- `NavigationContainerRef` is used in the app shell and external entry points.

## Known risks
- `SelfScreen` currently renders only one role view and uses a first-match-wins cascade.
- `SelfScreen` currently reads `context.capacity`, so the current implementation is not layered yet.
- Capacity is still entangled with auth/bond/perspective in the sealed system.
- Web navigation is currently a custom shell rather than a route layout.
- The classroom prefix on canvas and workspace symbols is legacy naming.
- Some workspace concepts are shared across classroom, admin, and UI, so renaming can create import collisions.
- The canvas/layout system is already broad and reused across domains, which makes naming cleanup easy to get wrong.
- Expo Router migration has started as a bridge shell, but the tab content still delegates to the legacy navigator for now.

## Sealed systems
- `packages/core/src/store/slices/auth.slice.ts`
- `packages/core/src/logic/permissions/hooks/usePermissions.ts`
- `activeBond`
- `activePerspective`
- `availableBonds`
- `context.capacity`
- Any CASL ability recomputation logic
- Any store slice for permissions, bonds, or perspectives
- Workspace capacity switching internals

### Why they are sealed
These pieces are intentionally treated as stable ground truth for the migration boundary. The next session should move the routing shell and screen boundaries around them without changing how they compute or store state.

## Naming decisions
- Tabs are:
  - Self
  - Workspace
  - Community
  - Library
  - Profile
- Self is identity-resolved and layered.
- Workspace is the only capacity-switchable tab.
- Community is undivided.
- Library is undivided.
- Profile is identity-resolved.
- `WorkspaceCanvas` is the shared canonical canvas name.
- `WorkspaceLayout` is the shared canonical layout name.
- `WorkspaceSurface` is the shared canonical surface name.
- `ClassroomWorkspaceCanvas` is legacy and should be treated as a wrapper name, not the canonical concept.
- `ClassroomWorkspaceSurface` is legacy naming around a shared workspace surface model.
- `useTeacherWorkspaceShell` is legacy in name and should be treated as a shell hook with broader logic than the name suggests.

## Where code and design intent diverge
- `SelfScreen` picks one role view instead of stacking all applicable layers.
- `SelfScreen` currently uses `context.capacity` as part of role selection.
- Canvas naming still says classroom in places where the concept is workspace-general.
- Web navigation still behaves like a custom shell instead of a file-based route layout.
- The current navigation stack still uses imperative navigation refs in a few outside-the-tree entry points.

## Things that look like improvements but must not be touched yet
- Refactoring `auth.slice.ts`.
- Reworking `usePermissions()`.
- Rebuilding the sealed capacity/bond/perspective model.
- Changing how CASL recomputation works.
- Reflecting capacity in the URL.
- Trying to “simplify” workspace capacity by making it part of route state.
- Replacing Gluestack v3.
- Replacing the shared workspace canvas system outright.

## Things that are cleaner than they look
- `selfRegistry.ts` already separates base domains from role domains with requirements.
- `CommunityScreen` keeps mode logic in a reducer.
- `useClassroomWorkspaceSurfaces` centralizes surface assembly.
- `GlobalHeader` is prop-driven and already accepts navigation callbacks instead of owning routing.
- `WorkspaceCanvas` is already shared in `packages/ui`.
- `WorkspaceLayout` and `WorkspaceSurface` already exist in `packages/core`.

## Things that are messier than they look
- The capacity/bond/perspective model is intentionally sealed, but the callsites are spread across shell, tabs, and workspace code.
- The current shell uses both navigation refs and React Navigation actions in several places.
- The workspace canvas system is shared, but some wrappers still use legacy domain naming.
- The web shell is not just a style difference; it is a different navigation composition.
- The initial Expo Router cutover intentionally uses flat bridge routes first, so the file-based tab groups are not yet the source of truth.
