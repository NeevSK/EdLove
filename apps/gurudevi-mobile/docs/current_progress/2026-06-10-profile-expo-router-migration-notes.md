---
title: "Profile Expo Router Migration Notes"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [expo-router, migration, profile, navigation, routing, self-next]
---

# Profile Expo Router Migration Notes

This note captures what we learned while converting the `profile` package and its app route wrappers to Expo Router-first behavior.

## What The Migration Proved

- Expo Router should be the default route system, not a fallback path.
- The package can own its route behavior directly through Expo Router path navigation and `useLocalSearchParams()`.
- The app shell route wrappers should be thin, direct exports that point at package-owned route components.
- Circular barrel exports in `app/(tabs)` can create noisy typecheck failures even when the package code itself is correct.
- Shared contract code can surface unrelated type-level friction during package checks, so profile-specific validation should be separated from broader workspace noise.

## What We Changed

- Replaced the profile package's legacy React Navigation route assumptions with Expo Router-backed navigation paths.
- Updated the profile detail screens to read their own route params through Expo Router.
- Removed the self-referential `app/(tabs)/profile/index.tsx` barrel pattern and exported the package screen directly.
- Replaced unsupported lucide brand icons with supported generic link icons so the package matches the actual dependency surface.
- Added `expo-router` to the profile package dependency set so the package resolves its own routing imports cleanly.

## What We Learned

- The biggest risk is not the screen itself, but a route-adjacent barrel or wrapper that reintroduces legacy assumptions.
- When a package is route-owned, the package should be able to navigate itself without relying on app-level navigator context.
- Package-level validation should ignore archived code paths so legacy history does not hide the state of the live route tree.
- Typecheck failures in shared core code can obscure the health of the package being migrated, so it helps to separate package-level and workspace-level signals.

## Profile Package Result

- `packages/profile/src` is now free of direct `@react-navigation/native` usage in the live package tree.
- The Expo Router route surfaces are in place for the profile flow.
- The app route wrappers for `community`, `library`, `self`, and `workspace` now export directly from their packages instead of self-importing.

## Remaining Workspace Noise

- `packages/core/src/api/contract.ts` still needs a broader shared-type cleanup if we want the whole workspace typecheck to go green.
- The repo still has unrelated `oxlint` and `eslint` issues outside the profile migration.
- Archived files still contain many legacy patterns, but they should be excluded from live migration checks.

## Next Target: `self`

- Audit `packages/self` and `apps/gurudevi-mobile/app/(tabs)/self` as a route-owned package boundary.
- Replace any remaining legacy navigation surfaces with Expo Router path navigation.
- Keep the route wrapper thin and direct.
- Exclude archived code from the verification pass so the live tree is the only signal.
- Reuse the profile pattern: route-owned params, direct exports, and no circular barrels.

