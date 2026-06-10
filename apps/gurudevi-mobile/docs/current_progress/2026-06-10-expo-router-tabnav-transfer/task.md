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

Estimated completion: roughly 70% to 75% of the tab-shell transfer is now done, with the remaining work concentrated in legacy support helpers, parity validation, and intentional redesigns that do not map 1:1.

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

## What Cannot Transfer 1:1

- [ ] `NavigationContainer` state listeners with the old tab callback shape
- [ ] Navigator-owned tab state bookkeeping as a single mutable object
- [ ] Archived web `requestIdleCallback` preloading behavior as-is
- [ ] Archived sidebar focus trap behavior as-is without re-implementing it intentionally
- [ ] A single React Navigation component that owns both tabs and overlay modals
- [ ] Direct app-code imports from `@react-navigation/*` in SDK 56+ shell code
- [ ] Legacy route names or params that no longer match the Expo Router file tree

## Working Rule

Only move items from the first section into implementation work when the Expo Router route tree can support them cleanly. Items in the second section should be redesigned, not force-copied.
