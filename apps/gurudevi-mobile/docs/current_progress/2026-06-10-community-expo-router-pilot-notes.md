---
title: "Community Expo Router Pilot Notes"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [expo-router, migration, pilot, community, navigation]
---

# Community Expo Router Pilot Notes

This note captures what we learned while converting `packages/community` into the first fully Expo Router-aligned tab-owned package.

## What The Pilot Proved

- Expo Router can replace the package-local React Navigation route flow without losing the community feature set.
- Route-owned web and native screens can stay split by platform while still sharing the same route vocabulary.
- The live app crash came from route-tree imports, not from the tab shell itself.
- One package can still poison the Expo Router guard if it re-exports screens that import `@react-navigation/native`.

## What We Changed

- Replaced `useNavigation()` / `useRoute()` with `router` and `useLocalSearchParams()` in the live community route tree.
- Moved direct navigation calls to file-based route paths like `/community/groups/[groupId]` and `/community/profile/[id]`.
- Kept the web route replacements explicit for the chat and profile surfaces.
- Preserved the shell-level tab and layout behavior in `apps/gurudevi-mobile/app`.

## What We Learned

- The biggest migration risk is not the visible screen file, but the package index or route-adjacent screen that still re-exports a React Navigation dependency.
- Expo Router route resolution is sensitive to duplicate route patterns and to route files that depend on legacy navigator context.
- Web-specific replacements should be handled as route-owned implementations, not as navigator children.
- Once a package is clean, it becomes the template for the next package family.

## Remaining Migration Pattern

- Audit each tab-owned package one by one.
- Remove React Navigation hooks from route-owned screens first.
- Replace imperative screen-name navigation with Expo Router path navigation.
- Keep web-specific route replacements in dedicated `.web.tsx` files where the UX truly differs.
- Re-run the live scan after each package to ensure the package no longer imports legacy navigation hooks in its route tree.

## Next Targets

- `packages/profile`
- `packages/library`
- `packages/self`
- `packages/classroom`
- `packages/admin`
- `packages/ai`
- `packages/scanner-kit`
- `packages/form-builder`

