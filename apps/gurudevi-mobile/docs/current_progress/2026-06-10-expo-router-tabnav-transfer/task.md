---
title: "Expo Router Tab Navigation Transfer Task"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [expo-router, navigation, migration, checklist]
---

# Expo Router Tab Navigation Transfer Task

This checklist tracks the React Navigation to Expo Router tab-shell migration for `apps/gurudevi-mobile`.

Estimated completion: roughly 70% to 75% of the tab-shell transfer is now done, with the remaining work concentrated in route-level Expo Router parity, shared-package router cleanup, and intentional redesigns that do not map 1:1.

Current log blockers from `real_bundler_log.txt`:

- Expo Router route collision: `app/(tabs)/community` resolving to both `community/index` and a sibling route path
- SDK 56 router compatibility guard: a package import still brings `@react-navigation/native` into an Expo Router route tree
- Route export hygiene: at least one nested route warning has appeared for `app/(tabs)/profile/full/[id].tsx`

Reference audit:

- [Expo Router tab navigation transfer audit](../../architecture/2026-06-10-expo-router-tabnav-transfer-audit.md)

## What Can Transfer

- [x] Convert the root app entry to `expo-router/entry`
- [x] Move the primary shell into `app/_layout.tsx`
- [x] Model the main sections as file-based Expo Router tabs
- [x] Keep notifications as a first-class route destination
- [x] Keep settings as a first-class route destination
- [x] Preserve the `GlobalHeader` visual language on mobile
- [x] Preserve the web sidebar shell pattern in `app/(tabs)/_layout.web.tsx`
- [x] Keep the web browser title synchronized with the active route
- [x] Reintroduce shell-owned reward celebration overlays in Expo Router
- [x] Reintroduce shell-owned breathing reset overlays in Expo Router
- [ ] Carry forward the old capacity-aware tab label logic where it still matters
- [ ] Decide whether web utility actions should stay in the sidebar or move into a header cluster
- [ ] Decide whether compact web should keep the archived sidebar focus behavior
- [ ] Confirm that every archived tab route has a live Expo Router equivalent
- [ ] Remove or quarantine stale React Navigation tab shell placeholders after parity is complete
- [ ] Align nested route names so Expo Router sees exactly one screen per pattern
- [ ] Verify every nested route file exports a default React component
- [ ] Confirm the `profile/full/[id]` route and similar deep routes are still reachable on web and native
- [x] Community package pilot migration: remove React Navigation hooks from the live `packages/community/src` route tree
- [ ] Repeat the same Expo Router migration pattern across the other tab-owned packages (`profile`, `library`, `self`, `classroom`, `admin`, `ai`, `scanner-kit`, `form-builder`)

## What Cannot Transfer 1:1

- [ ] `NavigationContainer` state listeners with the old tab callback shape
- [ ] Navigator-owned tab state bookkeeping as a single mutable object
- [ ] Archived web `requestIdleCallback` preloading behavior as-is
- [ ] Archived sidebar focus trap behavior as-is without re-implementing it intentionally
- [ ] A single React Navigation component that owns both tabs and overlay modals
- [ ] Direct app-code imports from `@react-navigation/*` in SDK 56+ shell code
- [ ] Direct shared-package imports from `@react-navigation/*` inside any Expo Router route dependency tree
- [ ] Legacy route names or params that no longer match the Expo Router file tree

## Working Rule

Only move items from the first section into implementation work when the Expo Router route tree can support them cleanly. Items in the second section should be redesigned, not force-copied.

## Practical Migration Buckets

- Route tree cleanup: remove duplicate patterns, confirm every file exports a default component, and keep one canonical route per URL shape
- Shared package cleanup: replace `useNavigation` / `useRoute` in route-owned packages with Expo Router friendly inputs or local adapters
- Shell parity: keep mobile tab shell and web shell different by design, but make them route against the same live tree
- Legacy quarantine: keep archived React Navigation-era docs and code as historical references until the route parity is stable
