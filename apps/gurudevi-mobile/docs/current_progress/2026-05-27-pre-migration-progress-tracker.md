---
title: "Gurudevi Pre-Migration Progress Tracker"
status: "active"
created: 2026-05-27
updated: 2026-05-27
author: "Naween"
tags: [reorganized]
---

# Gurudevi Pre-Migration Progress Tracker

## Thing 1: Expo Router Shell

- [x] Create root Expo Router shell
  - file(s): `app/_layout.tsx`, `app/index.tsx`
  - status: done
  - notes: top-level providers, session bootstrap, and cold-start intent; the legacy bridge has been removed

- [ ] Create auth route group
  - file(s): `app/(auth)/_layout.tsx`, `app/(auth)/welcome.tsx`, `app/(auth)/login.tsx`, `app/(auth)/onboarding.tsx`, `app/(auth)/invitation-welcome.tsx`, `app/(auth)/qr.tsx`, `app/(auth)/public-form/[slug].tsx`, `app/(auth)/thuthimal-claim.tsx`
  - status: in progress
  - notes: this is moving to real route groups now; the flat bridge routes are temporary and should disappear as each route is migrated

- [ ] Create authenticated app shell
  - file(s): `app/(app)/_layout.tsx`
  - status: in progress
  - notes: the router is now authoritative and should fail loudly when a route has not been moved yet

- [ ] Create tab shell layouts
  - file(s): `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/self/_layout.tsx`, `app/(app)/(tabs)/workspace/_layout.tsx`, `app/(app)/(tabs)/community/_layout.tsx`, `app/(app)/(tabs)/library/_layout.tsx`, `app/(app)/(tabs)/profile/_layout.tsx`
  - status: in progress
  - notes: the new Expo Router tab shell is now the target; legacy tabs should be retired instead of wrapped

- [x] Start web-specific shell split
  - file(s): `app/(app)/(tabs)/_layout.web.tsx`, `app/(app)/(tabs)/notifications.tsx`, `app/(app)/(tabs)/settings.tsx`
  - status: in progress
  - notes: web destinations are now separate from the mobile tab set; responsive behavior should be handled inside the web shell rather than by shrinking the mobile layout

- [ ] Create route files for tab content
  - file(s): `app/(app)/(tabs)/self/index.tsx`, `app/(app)/(tabs)/self/ai-assistant.tsx`, `app/(app)/(tabs)/workspace/index.tsx`, `app/(app)/(tabs)/community/index.tsx`, `app/(app)/(tabs)/community/groups/[groupId].tsx`, `app/(app)/(tabs)/community/chat/[conversationId].tsx`, `app/(app)/(tabs)/community/direct-messages.tsx`, `app/(app)/(tabs)/community/profile/[id].tsx`, `app/(app)/(tabs)/library/index.tsx`, `app/(app)/(tabs)/library/map.tsx`, `app/(app)/(tabs)/library/collections/[id].tsx`, `app/(app)/(tabs)/library/document/[resourceId].tsx`, `app/(app)/(tabs)/library/video/[resourceId].tsx`, `app/(app)/(tabs)/library/review.tsx`, `app/(app)/(tabs)/profile/index.tsx`, `app/(app)/(tabs)/profile/full/[id].tsx`, `app/(app)/(tabs)/profile/settings.tsx`, `app/(app)/(tabs)/profile/privacy-ledger.tsx`, `app/(app)/(tabs)/profile/mute-hub.tsx`, `app/(app)/(tabs)/profile/public/[id].tsx`
  - status: in progress
  - notes: the first real tab routes now exist for self, community, workspace, library, and profile; the child-route wrappers for self, workspace, community, library, and profile are now in place, including the nested community and library routes for the current slice

- [ ] Convert modal flows to route groups
  - file(s): `app/(modal)/_layout.tsx`, `app/(modal)/create-group.tsx`, `app/(modal)/create-post.tsx`, `app/(modal)/app-settings.tsx`, `app/(modal)/notifications.tsx`
  - status: in progress
  - notes: the modal group now exists and the first modal routes are wired to Expo Router; the old web command palette was reduced to a temporary stub so the router shell can stay clean while the remaining navigation surfaces are retired

- [ ] Replace navigation ref usage at shell boundaries
  - file(s): `apps/gurudevi-mobile/src/navigation/navigationRef.ts`, `apps/gurudevi-mobile/App.tsx`, `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`, `apps/gurudevi-mobile/src/navigation/CommandPalette.web.tsx`
  - status: in progress
  - notes: the active router-facing deep-link and command-palette paths now use Expo Router; the old root-shell navigation ref remains only in the legacy `App.tsx` shell and can be retired in the next cleanup slice

- [ ] Retire React Navigation shell composition
  - file(s): `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx`, `apps/gurudevi-mobile/src/navigation/TabNavigator.web.tsx`, `apps/gurudevi-mobile/src/navigation/useAppEntryGate.ts`, `packages/core/src/logic/permissions/hooks/useNavigationAuthGuard.ts`
  - status: not started
  - notes: keep sealed reads unchanged

- [ ] Make web compact and web desktop modes explicit in the shell
  - file(s): `app/(app)/(tabs)/_layout.web.tsx`
  - status: in progress
  - notes: desktop, compact web, tablet-like web width, and native tablet should not collapse into one stretched presentation

## Thing 2: Self Layer Stacking

- [ ] Change `SelfScreen` to stack base + role layers
  - file(s): `packages/self/src/screens/SelfScreen.tsx`
  - status: not started
  - notes: render base domains always, then all qualified role domains

- [ ] Add/adjust local role-layer resolution inside `SelfScreen`
  - file(s): `packages/self/src/screens/SelfScreen.tsx`
  - status: not started
  - notes: read identity context and all user-held roles/bonds, not workspace active capacity

- [ ] Keep `selfRegistry.ts` unchanged
  - file(s): `packages/self/src/constants/selfRegistry.ts`
  - status: done
  - notes: registry already has the needed shape

## Thing 3: Canvas Naming Cleanup

- [ ] Confirm shared canonical canvas/layout/surface symbols
  - file(s): `packages/ui/src/components/workspace/WorkspaceCanvas.tsx`, `packages/core/src/types/*`, `packages/core/src/logic/schemas/workspace-layout.schema.ts`
  - status: done
  - notes: names already exist in shared packages

- [ ] Migrate workspace canvas callsites to shared canvas where safe
  - file(s): `packages/classroom/src/screens/ClassroomScreen.tsx`, `packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx`, `packages/admin/src/screens/*.tsx`, `packages/admin/src/*/use*WorkspaceCanvas.tsx`
  - status: not started
  - notes: migrate callsites before retiring wrappers

- [ ] Evaluate `useClassroomWorkspaceLayout` rename conflict
  - file(s): `packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts`
  - status: not started
  - notes: check for actual import conflicts before renaming

- [ ] Evaluate `useTeacherWorkspaceShell` rename conflict
  - file(s): `packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx`
  - status: not started
  - notes: logic is broader than the name

- [ ] Evaluate `ClassroomWorkspaceSurface` rename conflict
  - file(s): `packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx`, related workspace type files
  - status: not started
  - notes: shared workspace surface naming already exists

## Sealed

- [ ] Keep auth/capacity/perspective system untouched
  - file(s): `packages/core/src/store/slices/auth.slice.ts`, `packages/core/src/logic/permissions/hooks/usePermissions.ts`
  - status: done
  - notes: must remain exactly as-is for the next session

- [ ] Keep capacity URL-free and store-only
  - file(s): sealed by design
  - status: done
  - notes: workspace lens state only, no routing reflection

- [ ] Keep CASL recomputation logic unchanged
  - file(s): sealed by design
  - status: done
  - notes: boundary only, no refactor

- [ ] Keep Workspace capacity switching internals untouched
  - file(s): sealed by design
  - status: done
  - notes: next session should move boundaries around it, not rewrite it

- [ ] Keep app-quality checks aligned with live source only
  - file(s): `apps/gurudevi-mobile/tsconfig.json`, `apps/gurudevi-mobile/src/types/global-css.d.ts`, `scripts/check-code.mjs`
  - status: done
  - notes: `check:code` is the durable gate; `tsc` stays on live app/source boundaries, and package config JS stays out of the semantic project unless there is a strong reason to pull it in

## Blockers
- The sealed auth/capacity/perspective system must remain stable before any route wrapper is allowed to assume a different source of truth.
- Canvas naming cleanup depends on actual symbol conflict checks before any rename.
- The Expo Router shell migration depends on the route boundary being established before external navigation ref removal can be completed safely.
- Validation should use `tsc` + `eslint` as the real gates, with Biome kept as a formatting / shallow hygiene pass rather than the sole verifier.
- The reusable app-quality command should be `check:code`, and it should emit a markdown report in `reports/` rather than only streaming a terminal summary.
- The recommended usage is `pnpm --dir apps/gurudevi-mobile run check:code` for the whole package, or the same command with `-- --paths "..." --report ... --scope ...` for a specific slice.
- The app tsconfig should include the active Expo Router routes and local mocks/config files, but should not absorb archived history into the live lint/type boundary.
