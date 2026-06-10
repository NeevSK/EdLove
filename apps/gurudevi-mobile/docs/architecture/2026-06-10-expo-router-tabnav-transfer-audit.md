---
title: "Expo Router Tab Navigation Transfer Audit"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [expo-router, navigation, migration, audit]
---

# Expo Router Tab Navigation Transfer Audit

This document compares the archived React Navigation tab shells with the current Expo Router shell in `apps/gurudevi-mobile/app/`. It records what has transferred, what is still missing, and what cannot map 1:1 because Expo Router in SDK 56 uses a different routing paradigm.

## Scope

Compared sources:

- `apps/gurudevi-mobile/archives/navigation/TabNavigator.tsx`
- `apps/gurudevi-mobile/archives/navigation/TabNavigator.web.tsx`
- `apps/gurudevi-mobile/packages` screens and shared UI components
- `apps/gurudevi-mobile/app/(tabs)/_layout.tsx`
- `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx`
- `apps/gurudevi-mobile/app/(tabs)/*`
- `apps/gurudevi-mobile/app/(modal)/*`

Relevant Expo Router references used for this audit:

- Expo Router migration from React Navigation, SDK 56 and later
- JavaScript tabs / custom tabs / nesting navigators
- Modals, protected routes, and shared routes

## Executive Summary

The migration is partially complete.

Rough completion estimate: about 70% to 75% of the tab-navigation transfer is done. Most of the core route graph and shell chrome are in place; the remaining work is concentrated in legacy helper cleanup, parity checks, and redesigns that Expo Router cannot copy 1:1.

What is already transferred:

- the route graph is now file-based under `app/`
- the mobile shell uses a bottom tab layout in Expo Router
- the web shell uses a custom sidebar layout in Expo Router
- notifications and settings are now available as route destinations
- the mobile shell uses `GlobalHeader` styling again
- the root app now boots through `expo-router/entry`
- the shell-owned reward celebration overlay now lives in Expo Router tab layouts
- the shell-owned breathing reset modal now lives in Expo Router tab layouts
- the web shell now syncs the browser title from the active pathname

What is not fully transferred yet:

- the old tab shell's reward-celebration overlay is not owned by the router layout
- the old breathing-reset modal is not owned by the router layout
- the old mobile/web focus-trap / overlay sidebar behavior is not fully reproduced in Expo Router
- the old `onTabChange` callback and tab state bookkeeping are gone
- the old web preload / staged lazy-loading behavior is not reproduced

What cannot be copied 1:1:

- `NavigationContainer`-level behaviors such as focus-trapped sidebar overlays, custom state listeners, and custom document-title management are now handled by route/layout composition rather than a single navigator component
- some React Navigation APIs no longer fit the Expo Router model cleanly in SDK 56, where app code should import from `expo-router/*` entry points instead of `@react-navigation/*`

## Archived React Navigation Behavior

### `TabNavigator.tsx` archive

This file defined the native bottom tab shell.

Key behavior:

- five primary tabs: Profile, Classroom, Self, Community, Library
- optional Workforce tab behind feature flags
- tab bar styling with safe-area-aware padding
- tab change callback via `onTabChange`
- current tab state tracking
- reward celebration overlay via `AchievementUnlockOverlay`
- breathing reset modal via `BreathGuide`
- `classroomLabel` changes based on capacity
- tab shell background rendered once by `SanctuaryBackground`

### `TabNavigator.web.tsx` archive

This file defined the web shell.

Key behavior:

- left sidebar instead of bottom tabs
- collapsible rail
- mobile/compact mode and desktop mode differences
- keyboard focus trap when the mobile sidebar overlay is open
- staged lazy preloading using `requestIdleCallback`
- route title updates from active tab state
- notifications panel as a shell-level destination
- settings panel as a shell-level destination
- profile settings surfaced separately from the profile stack
- document title updates for shell panel routes
- mobile nav fallback for compact widths
- in-shell modal behavior for breathing reset
- in-shell overlay behavior for celebration

## Current Expo Router Implementation

### Already transferred

- `app/_layout.tsx` is now the root Expo Router shell
- `app/index.tsx` handles the landing redirect flow
- `app/(tabs)/_layout.tsx` renders the mobile header using `GlobalHeader`
- `app/(tabs)/_layout.web.tsx` renders the web sidebar shell
- `app/(modal)/_layout.tsx` hosts modal routes
- `app/(tabs)/profile.tsx` renders `@repo/profile/ProfileScreen`
- `app/(tabs)/settings.tsx` renders `@repo/ui/screens/AppSettingsScreen`
- `app/(tabs)/notifications.tsx` renders `@repo/ui/screens/NotificationsScreen`
- `app/(tabs)/community.tsx`, `workspace.tsx`, `library.tsx`, `self.tsx` map to the main sections
- `app/(tabs)/profile/settings.tsx` still exposes profile-local settings entry
- `app/(tabs)/profile/full/[id].tsx` and `app/(tabs)/profile/public/[id].tsx` preserve profile routes
- shell-level reward overlays and breathing reset overlays now live in the Expo Router tab layouts
- the web browser title now follows the active route

### Currently implemented shell behavior

- mobile header shows a notification action with unread badge
- mobile header shows a settings action
- mobile header uses `GlobalHeader` styling rather than a bespoke header
- web shell has a collapsible sidebar
- web shell exposes notifications and settings as utility destinations
- current web shell still uses a custom `Slot`-based layout, not the old navigator component

## Transfer Matrix

### Fully transferred

| Archived behavior | Current Expo Router state | Notes |
|---|---|---|
| Bottom-tab primary sections | Yes | Main sections are represented as tab routes in `app/(tabs)` |
| Web sidebar shell | Yes | `app/(tabs)/_layout.web.tsx` provides the sidebar |
| Notifications route | Yes | `app/(tabs)/notifications.tsx` and modal route exist |
| Settings route | Yes | `app/(tabs)/settings.tsx` and modal route exist |
| Profile route | Yes | `app/(tabs)/profile.tsx` maps to `@repo/profile` |
| Global header look | Mostly | Mobile uses `GlobalHeader` as the header shell reference |
| Web utility destinations | Mostly | Notifications/settings are present as route targets |
| Reward celebration overlay | Yes | Shell-owned overlay now lives in Expo Router layouts |
| Breathing reset overlay | Yes | Shell-owned modal now lives in Expo Router layouts |
| Browser title sync | Yes | Web layout now updates `document.title` from the pathname |

### Partially transferred

| Archived behavior | Current Expo Router state | Missing piece |
|---|---|---|
| Reward celebration overlay | Implemented | Validate with real reward events to confirm timing and dismissal behavior |
| Breathing modal | Implemented | Validate with real breathing-open state to confirm parity |
| Dynamic tab labels | Partial | Capacity-aware tab labeling is not centralized in the router shell |
| Document title updates | Implemented on web | Native parity can be reviewed separately if title behavior changes |
| Profile vs settings split | Partial | The shell and profile stack both expose settings surfaces |
| Web compact vs desktop branch | Partial | The current web shell has compact/desktop branching, but not all old route behaviors |

### Not yet transferred

| Archived behavior | Current Expo Router state | Reason |
|---|---|---|
| `onTabChange` callback | Not present | Expo Router routes do not use the same parent tab callback pattern |
| Sidebar focus trap | Not present | Current custom sidebar is simpler and does not trap focus like the archive |
| Staged web preload | Not present | No route-level `requestIdleCallback` preloader has been ported |
| Active tab state local to shell | Not present | Expo Router derives the active route from URL/path instead of explicit tab state |
| Tab navigator overlay state | Not present | Router layouts separate concerns across files instead of one tab component |

## What Cannot Be Ported 1:1

These are architectural differences, not missing work:

1. React Navigation `NavigationContainer` state listeners do not map directly to Expo Router layout files.
2. A single tab navigator component that owns both tabs and shell overlays is replaced by route groups and nested layouts.
3. Expo Router in SDK 56 prefers `expo-router/*` entry points in app code rather than importing `@react-navigation/*` directly.
4. URL-first navigation means route state is derived from the file tree and pathname rather than navigator-local state.
5. Some shell concerns, like `document.title`, authentication redirection, and protected routes, should now live in layout boundaries or route guards.

## Important Gaps To Carry Forward

These are the items that still matter for parity and should be handled explicitly if we want a full transfer:

- preserve the old `GlobalHeader` visual rhythm and icon/action placement
- keep notifications and settings as first-class utility actions on web
- keep profile/settings separation clear between mobile and web
- preserve capacity-aware wording for classroom/workspace labels if the app still uses those role labels in the shell
- decide where reward celebration belongs now that it is no longer owned by a navigator component
- decide where breathing reset belongs now that it is no longer owned by a navigator component
- decide whether the web sidebar should still trap focus when expanded on compact widths
- decide whether web utility routes should remain visible in the sidebar or move into a top-right header cluster

## Expo Router Guidance Applied

Expo Router docs now support the following patterns that matter for this migration:

- JavaScript tabs for React Navigation-like bottom tabs
- custom tabs for fully custom shell layouts
- nesting stacks inside tabs
- modal routes as first-class file routes
- shared routes for reuse across layouts
- protected routes for auth-based redirection
- SDK 56 import migration away from app-code `@react-navigation/*`

This means the current migration should favor:

- file-based route groups for shared sections
- layout files for shell chrome
- route-specific headers instead of a single global navigator owner
- `router.push` / `router.replace` instead of navigator-local imperative state where practical

## Recommended Follow-Up Work

1. Port reward celebration and breathing reset into a deliberate layout owner, likely `app/(tabs)/_layout.tsx` or a shared app shell component.
2. Decide whether the web sidebar should keep the current compact/desktop split or recover the archived focus-trap behavior for mobile-width web.
3. Remove or quarantine the stale `src/navigation/TabNavigator.tsx` and `TabNavigator.web.tsx` placeholders once all references are gone.
4. Sweep remaining `@react-navigation/*` imports in application code and repoint them to Expo Router entry points if any remain.
5. Revisit route-title handling so the web shell and native shell stay consistent with the file-based route graph.

## Notes

The archive files are still valuable as design references, but they should no longer be treated as live architecture. The Expo Router shell is now the source of truth for runtime navigation, and the old navigator files should be used only as migration references until the final cleanup pass is complete.
