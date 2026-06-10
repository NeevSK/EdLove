---
title: "Gurudevi Pre-Migration Operationalization Plan"
status: "active"
created: 2026-05-27
updated: 2026-05-27
author: "Naween"
tags: [reorganized]
---

# Gurudevi Pre-Migration Operationalization Plan

This plan is for the next session only. It assumes the sealed auth/capacity/perspective system stays untouched.

## Execution order
1. Cut over to Expo Router for real and remove the React Navigation bridge.
2. Fix `SelfScreen` layer stacking second.
3. Clean up canvas naming last, after the routing shell is stable.

The order is chosen to keep the app buildable at each step and to avoid renaming while route boundaries are still moving.

## Validation policy

Use the tools together, not in isolation:
- `tsc --noEmit` is the primary semantic gate for migration slices.
- `eslint` is the primary project-rule gate for React Native / Expo-specific correctness.
- `biome` is useful for formatting and shallow hygiene, but it should not be treated as the only quality signal.

For this migration, a change is considered ready only after the relevant `tsc` and `eslint` checks pass for the touched package, with Biome used as the fast formatting pass.

Preferred reusable gate:
- `check:code` runs the full app-quality gate and writes a markdown report under `reports/` so the result is reusable after the migration is done.
- Use `check:code` when you want one durable command instead of remembering several separate checks.
- `check:code --paths "app/_layout.tsx,app/(tabs)/_layout.web.tsx"` can scope ESLint and Biome to specific files or folders while still keeping TypeScript as the package-level semantic gate.
- Recommended usage:
  - whole app: `pnpm --dir apps/gurudevi-mobile run check:code`
  - scoped slice: `pnpm --dir apps/gurudevi-mobile run check:code -- --paths "app/_layout.tsx,app/(tabs)/_layout.web.tsx" --report reports/check-code-web-shell.md --scope web-shell-slice`
  - the report is always written to the `reports/` folder you choose, and it should be treated as the shareable output of the check
- The app tsconfig now includes `app/**/*`, `__mocks__/**/*`, and local declaration/source files needed by the live Expo Router app so ESLint's type-aware parser can validate route files cleanly; archived history and build config JS files stay out of the active TypeScript project.
- If a route file depends on a package CSS import or other side-effect module, add a local `declare module ...` shim under `apps/gurudevi-mobile/src/types/` instead of widening the TypeScript project to all config files.

---

## Thing 1: Expo Router Shell Migration

### Step 1. Establish the route shell and root providers
- **Files touched:** `app/_layout.tsx`, `app/index.tsx`
- **What changes:** Create the root Expo Router entry, wire the top-level providers, bootstrap session state, and add cold-start intent handling. `app/index.tsx` should become the root redirect/landing shim. Remove the legacy React Navigation bridge rather than keeping it behind the router.
- **Verify before starting:** Current app bootstrap path and provider order are known; no hidden dependency assumes `NavigationContainer`.
- **Must not be touched:** `packages/core/src/store/slices/auth.slice.ts`, `packages/core/src/logic/permissions/hooks/usePermissions.ts`, any permission/bond/perspective store internals.
- **Risk:** High
- **Dependencies:** None

### Step 2. Build the auth group
- **Files touched:** `app/(auth)/_layout.tsx`, `app/(auth)/welcome.tsx`, `app/(auth)/login.tsx`, `app/(auth)/onboarding.tsx`, `app/(auth)/invitation-welcome.tsx`, `app/(auth)/qr.tsx`, `app/(auth)/public-form/[slug].tsx`, `app/(auth)/thuthimal-claim.tsx`
- **What changes:** Convert auth/onboarding/public entry routes into Expo Router pages and move the unauthenticated guard into the auth layout.
- **Verify before starting:** The current unauthenticated landing flows and deep-link entry points are mapped.
- **Must not be touched:** Sealed auth/capacity logic internals; screen implementations in packages stay unchanged.
- **Risk:** Medium
- **Dependencies:** Step 1

### Step 3. Build the authenticated app shell
- **Files touched:** `app/(app)/_layout.tsx`
- **What changes:** Add the authenticated guard only, and establish the app-level boundary that will host tabs, modals, and layout-level redirects. This boundary should fail loudly if a route has not yet been migrated.
- **Verify before starting:** Auth bootstrap and auth-gate behavior from Step 1 and Step 2 are working.
- **Must not be touched:** Capacity switching internals or any workspace-store logic.
- **Risk:** High
- **Dependencies:** Step 1, Step 2

### Step 4. Create the tab shell
- **Files touched:** `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/self/_layout.tsx`, `app/(app)/(tabs)/workspace/_layout.tsx`, `app/(app)/(tabs)/community/_layout.tsx`, `app/(app)/(tabs)/library/_layout.tsx`, `app/(app)/(tabs)/profile/_layout.tsx`
- **What changes:** Replace React Navigation tab shell behavior with Expo Router tab layouts, badges, and chrome. Keep the workspace capacity boundary in the workspace layout only. Make self/community/library/profile route shells explicit. If a route has not been moved yet, let the failure surface instead of masking it behind the old tab navigator.
- **Verify before starting:** Tabs currently resolve from the expected shell order and the platform split is understood.
- **Must not be touched:** Any tab logic that depends on sealed auth/capacity internals beyond reading the same current context values.
- **Risk:** High
- **Dependencies:** Step 3

### Step 4b. Split the web shell before going granular
- **Files touched:** `app/(app)/(tabs)/_layout.web.tsx`, `app/(app)/(tabs)/notifications.tsx`, `app/(app)/(tabs)/settings.tsx`
- **What changes:** Make web topology intentionally different from mobile. Notifications and settings become explicit web destinations, and the shell should handle compact web vs desktop web behavior with layout policy rather than by shrinking the mobile tab set.
- **Verify before starting:** The mobile shell works and the route names for the primary app areas are stable.
- **Must not be touched:** Sealed auth/capacity logic, shared package screen implementations, or the mobile tab shell semantics.
- **Risk:** High
- **Dependencies:** Step 4

### Step 5. Add route files for the tab content
- **Files touched:** `app/(app)/(tabs)/self/index.tsx`, `app/(app)/(tabs)/self/ai-assistant.tsx`, `app/(app)/(tabs)/workspace/index.tsx`, `app/(app)/(tabs)/community/index.tsx`, `app/(app)/(tabs)/community/groups/[groupId].tsx`, `app/(app)/(tabs)/community/chat/[conversationId].tsx`, `app/(app)/(tabs)/community/direct-messages.tsx`, `app/(app)/(tabs)/community/profile/[id].tsx`, `app/(app)/(tabs)/library/index.tsx`, `app/(app)/(tabs)/library/map.tsx`, `app/(app)/(tabs)/library/collections/[id].tsx`, `app/(app)/(tabs)/library/document/[resourceId].tsx`, `app/(app)/(tabs)/library/video/[resourceId].tsx`, `app/(app)/(tabs)/library/review.tsx`, `app/(app)/(tabs)/profile/index.tsx`, `app/(app)/(tabs)/profile/full/[id].tsx`, `app/(app)/(tabs)/profile/settings.tsx`, `app/(app)/(tabs)/profile/privacy-ledger.tsx`, `app/(app)/(tabs)/profile/mute-hub.tsx`, `app/(app)/(tabs)/profile/public/[id].tsx`
- **What changes:** Make route files thin wrappers that parse params with `useLocalSearchParams()`, pass plain typed props into package screens, and own navigation callbacks through `router`.
- **Verify before starting:** Package screens are still unchanged and can be rendered via wrappers.
- **Must not be touched:** Package implementations, sealed store internals, or any capacity URL behavior.
- **Risk:** Medium
- **Dependencies:** Step 4

### Step 6. Convert modal flows to route groups
- **Files touched:** `app/(modal)/_layout.tsx`, `app/(modal)/create-group.tsx`, `app/(modal)/create-post.tsx`, `app/(modal)/app-settings.tsx`, `app/(modal)/notifications.tsx`
- **What changes:** Move modal presentation into Expo Router modal routes and replace navigation-driven modal opens with route-based presentation.
- **Verify before starting:** Existing modal entry points and expected presentation style are known.
- **Must not be touched:** The modal content components themselves unless a route wrapper is needed.
- **Risk:** Medium
- **Dependencies:** Step 3, Step 4

### Step 7. Replace external navigation ref usage
- **Files touched:** `apps/gurudevi-mobile/src/navigation/navigationRef.ts`, `apps/gurudevi-mobile/App.tsx`, `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`, `apps/gurudevi-mobile/src/navigation/CommandPalette.web.tsx`
- **What changes:** Remove reliance on `NavigationContainerRef` as the route mechanism and route external events into Expo Router at the shell boundary.
- **Verify before starting:** The current external callers are fully enumerated and route-safe entry points exist.
- **Must not be touched:** Any deep business logic behind the event sources.
- **Risk:** High
- **Dependencies:** Step 1 through Step 6

### Step 8. Retire React Navigation shell wiring
- **Files touched:** `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx`, `apps/gurudevi-mobile/src/navigation/TabNavigator.web.tsx`, `apps/gurudevi-mobile/src/navigation/useAppEntryGate.ts`, `packages/core/src/logic/permissions/hooks/useNavigationAuthGuard.ts`
- **What changes:** Stop using React Navigation for shell composition once Expo Router takes over. The old shell should not remain as a hidden compatibility layer.
- **Verify before starting:** Expo Router shell is functioning in both native and web paths.
- **Must not be touched:** Sealed auth/capacity/bond/perspective logic and the values it returns.
- **Risk:** High
- **Dependencies:** Step 1 through Step 7

---

## Thing 2: Self Layer Stacking

### Step 1. Update `SelfScreen` to stack layers
- **Files touched:** `packages/self/src/screens/SelfScreen.tsx`
- **What changes:** Render base domains always, then stack all applicable role domains below them instead of returning a single role view.
- **Verify before starting:** The registry shape in `selfRegistry.ts` already expresses base vs role domains.
- **Must not be touched:** `packages/self/src/constants/selfRegistry.ts`, sealed auth/capacity system, `usePermissions()`.
- **Risk:** Medium
- **Dependencies:** None

### Step 2. Add a registry-driven layer resolver in the self screen boundary
- **Files touched:** `packages/self/src/screens/SelfScreen.tsx` and, if needed, a local helper nearby in the self package
- **What changes:** Read identity context and all user-held roles/bonds to determine which role domains qualify, while keeping the registry itself unchanged.
- **Verify before starting:** `selfRegistry.ts` already separates domains with and without requirements.
- **Must not be touched:** Workspace active capacity reads or the permissions store internals.
- **Risk:** Medium
- **Dependencies:** Step 1

### Step 3. Keep registry untouched
- **Files touched:** None
- **What changes:** No shape changes to `selfRegistry.ts`; the file remains the source of truth for domain requirements.
- **Verify before starting:** The registry already has the needed base/role split.
- **Must not be touched:** Any registry rewrite.
- **Risk:** Low
- **Dependencies:** None

---

## Thing 3: Canvas Naming Cleanup

### Step 1. Confirm current shared canvas and layout symbols
- **Files touched:** No code changes
- **What changes:** Verify actual usages of `WorkspaceCanvas`, `WorkspaceLayout`, `WorkspaceSurface`, and `useWorkspaceLayout` before renaming anything.
- **Verify before starting:** Existing shared symbols already exist in `packages/ui` and `packages/core`.
- **Must not be touched:** Any live code paths yet.
- **Risk:** Low
- **Dependencies:** None

### Step 2. Migrate callsites to the shared canvas first
- **Files touched:** Workspace canvas callsites in `packages/classroom`, `packages/admin`, and any remaining legacy wrappers
- **What changes:** Prefer `WorkspaceCanvas` from `packages/ui` at callsites while leaving legacy wrappers in place until they can be retired safely.
- **Verify before starting:** `ClassroomWorkspaceCanvas` is a wrapper, not the core implementation.
- **Must not be touched:** Shared types or the workspace layout sync contract.
- **Risk:** Medium
- **Dependencies:** Step 1

### Step 3. Rename only if there is no import conflict
- **Files touched:** Only files whose imports are confirmed safe to change
- **What changes:** Retire classroom-prefixed canvas names gradually, one callsite at a time, only when the shared symbol already exists and there is no conflict.
- **Verify before starting:** Actual symbol conflicts are known from the naming sweep.
- **Must not be touched:** Direct find-replace across the repo.
- **Risk:** Medium
- **Dependencies:** Step 2

### Step 4. Keep teacher workspace shell name legacy until the boundary is stable
- **Files touched:** `packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx` only if a safe rename is later confirmed
- **What changes:** Keep the current hook name until the workspace shell boundary is settled.
- **Verify before starting:** The hook logic is general enough, but the rename needs conflict checks.
- **Must not be touched:** The shell logic itself.
- **Risk:** Low
- **Dependencies:** Step 1

---

## Steps that must remain sealed
- `packages/core/src/store/slices/auth.slice.ts`
- `packages/core/src/logic/permissions/hooks/usePermissions.ts`
- Any permissions/bonds/perspectives store internals
- Any CASL ability recomputation logic
- Workspace capacity switching internals

These files and internals are referenced only as existing boundaries. They should not be refactored in this session.
