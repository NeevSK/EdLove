---
title: "Profile Route Ownership Map"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Profile Route Ownership Map

Date: 2026-03-27
Workspace: `C:\Users\Naween\projects\polymath-platform`
Scope: `apps/gurudevi-mobile` profile navigation plus profile-owned UI actions across `@repo/profile`, `@repo/ui`, `@repo/self`, and `@repo/community`

## Purpose

This document is the phase-1 source of truth for profile routing and action ownership before architectural fixes.

It answers:

- which routes exist on native and web
- which package owns each screen
- which UI elements trigger them
- whether platform differences appear intentional or accidental
- where profile code is depending on routes that it does not own

## Route Matrix

| Route | Native | Web | Screen owner | Registered from | Triggered by | Assessment |
| --- | --- | --- | --- | --- | --- | --- |
| `ProfileMain` | Yes | Yes | `@repo/profile` | [ProfileStackNavigator.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.tsx), [ProfileStackNavigator.web.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx) | profile tab shell | Shared entry point, healthy |
| `FullProfile` | Yes | Yes | `@repo/profile` | [ProfileStackNavigator.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.tsx), [ProfileStackNavigator.web.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx) | `ProfileScreen`, `ProfileScreenWeb` | Shared capability, healthy |
| `PrivacyLedger` | Yes | Yes | `@repo/self` | [ProfileStackNavigator.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.tsx), [ProfileStackNavigator.web.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx) | `ProfileScreenWeb` only today | Shared route exists, but UI trigger parity is missing |
| `AppSettings` | No | Yes | `@repo/ui` | [ProfileStackNavigator.web.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx) | `ProfileScreen`, `ProfileScreenWeb` | Accidental mismatch: native UI calls missing route |
| `MuteHub` | Yes | No | `@repo/ui` | [ProfileStackNavigator.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.tsx) | no in-stack trigger found in current profile screen | Probably intentional platform gap, but currently undocumented |
| `TrubeLab` | Yes | No | `@repo/ui` | [ProfileStackNavigator.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.tsx) | `AppSettingsScreen` | Capability exists natively; web exposes settings separately |
| `PublicProfile` | No | No | `@repo/community` screen implementation | not in profile stack | `AvatarDisplay` in `@repo/profile` attempts to navigate there | Cross-stack dependency leak |
| `UserProfile` | No | No | `@repo/community` screen implementation | community stack only | `AppSettingsScreen` preview action | Cross-stack dependency from settings |
| `SettingsPanel` | No | Web shell only | `@repo/ui` | [TabNavigator.web.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/TabNavigator.web.tsx) | shell sidebar/mobile settings entry | Web-only shell route, separate from profile stack |

## Stack Ownership

### Native profile stack

Source: [ProfileStackNavigator.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.tsx)

Registered routes:

- `ProfileMain` -> `@repo/profile/ProfileScreen`
- `FullProfile` -> `@repo/profile/FullProfileScreen`
- `PrivacyLedger` -> `@repo/self/PrivacyLedgerScreen`
- `MuteHub` -> `@repo/ui/MuteHubScreen`
- `TrubeLab` -> `@repo/ui/TrubeLabScreen`

Not registered:

- `AppSettings`
- `PublicProfile`
- `UserProfile`

### Web profile stack

Source: [ProfileStackNavigator.web.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx)

Registered routes:

- `ProfileMain` -> `@repo/profile/ProfileScreenWeb`
- `FullProfile` -> `@repo/profile/FullProfileScreenWeb`
- `AppSettings` -> `@repo/ui/AppSettingsScreenWeb`
- `PrivacyLedger` -> `@repo/self/PrivacyLedgerScreen`

Not registered:

- `MuteHub`
- `TrubeLab`
- `PublicProfile`
- `UserProfile`

### Community stack ownership of public profile views

Sources:

- [CommunityStackNavigator.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx)
- [CommunityStackNavigator.web.tsx](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx)

Registered there instead:

- `UserProfile`
- `PublicProfile`

This means profile-package components currently depend on a route that exists only when rendered under the community stack or a parent navigator that bubbles the action there.

## Action Ownership Matrix

### `ProfileScreen` native

Source: [ProfileScreen.tsx](C:/Users/Naween/projects/polymath-platform/packages/profile/src/screens/ProfileScreen.tsx)

Actions emitted by the screen:

- `FullProfile`
  - owner: `@repo/profile`
  - source lines: identity card and CTA
  - status: registered on native and web
- `Auth`
  - owner: app/root auth flow, not profile stack
  - source lines: guest CTA and account switch
  - status: cross-stack assumption
- `AppSettings`
  - owner: `@repo/ui`
  - source lines: header action and settings list item
  - status: broken on native because route is not in native profile stack

Not emitted today:

- `PrivacyLedger`
- `MuteHub`
- `TrubeLab`

### `ProfileScreenWeb`

Source: [ProfileScreen.web.tsx](C:/Users/Naween/projects/polymath-platform/packages/profile/src/screens/ProfileScreen.web.tsx)

Actions emitted by the screen:

- `FullProfile`
  - status: registered
- `AppSettings`
  - status: registered in web profile stack
- `PrivacyLedger`
  - status: registered in web profile stack
- `Auth`
  - status: cross-stack assumption via root auth flow

### `FullProfileScreen` native

Source: [FullProfileScreen.tsx](C:/Users/Naween/projects/polymath-platform/packages/profile/src/screens/FullProfileScreen.tsx)

Actions emitted by the screen:

- `goBack`
- direct avatar upload through `profileAPI`
- modal actions for social links and Thuthimal gifting

No route emissions besides `goBack`.

### `FullProfileScreenWeb`

Source: [FullProfileScreen.web.tsx](C:/Users/Naween/projects/polymath-platform/packages/profile/src/screens/FullProfileScreen.web.tsx)

Actions emitted by the screen:

- `goBack`
- direct avatar upload through `profileAPI`
- modal actions for social links and Thuthimal gifting

No route emissions besides `goBack`.

### `AvatarDisplay`

Source: [AvatarDisplay.tsx](C:/Users/Naween/projects/polymath-platform/packages/profile/src/components/AvatarDisplay.tsx)

Actions emitted by the component:

- `PublicProfile`
  - fired when `peekable` is true
  - owner of destination screen is `@repo/community`
  - route is not registered inside profile stack

Assessment:

- this is a hidden navigation dependency from a reusable component
- the profile package does not own the route it navigates to
- this should become a callback or route capability provided by the host shell

### `AppSettingsScreen`

Source: [AppSettingsScreen.tsx](C:/Users/Naween/projects/polymath-platform/packages/ui/src/screens/AppSettingsScreen.tsx)

Actions emitted by the screen:

- `Community -> UserProfile`
  - preview own public profile
  - cross-stack jump into community-owned public profile viewer
- `TrubeLab`
  - settings-owned support/tooling action

Assessment:

- settings is not a pure local screen; it orchestrates cross-domain navigation
- the screen belongs to `@repo/ui`, but its actions depend on community and profile-related route assumptions

### `PrivacyLedgerScreen`

Source: [PrivacyLedgerScreen.tsx](C:/Users/Naween/projects/polymath-platform/packages/self/src/screens/PrivacyLedgerScreen.tsx)

Actions emitted by the screen:

- back via `GlobalHeader`

Assessment:

- simple borrowed screen from `@repo/self`
- acceptable to host inside profile stack if profile owns the entry point, not the screen internals

## Typed Route Contract

Source: [navigation.ts](C:/Users/Naween/projects/polymath-platform/packages/core/src/types/navigation.ts)

Current typed `ProfileStackParamList` declares:

- `ProfileMain`
- `FullProfile`
- `AppSettings`
- `PrivacyLedger`
- `PublicProfile`

Mismatch with actual native stack:

- typed but not registered on native: `AppSettings`, `PublicProfile`

Mismatch with actual web stack:

- typed but not registered on web: `PublicProfile`
- registered on native but not represented in profile param list: `MuteHub`, `TrubeLab`

Assessment:

- the type contract is not the actual runtime contract
- this is one reason route leaks are easy to miss today

## Intentional vs Accidental Differences

### Likely intentional

- web has shell-level `SettingsPanel` outside the profile stack
- native has modal-style `MuteHub` and `TrubeLab` in the profile stack
- community owns `UserProfile` and `PublicProfile` viewer screens

### Likely accidental

- native profile UI navigates to `AppSettings` without native route registration
- `ProfileStackParamList` claims `PublicProfile` exists in profile stack even though it does not
- `AvatarDisplay` hardcodes `PublicProfile` navigation from inside the profile package
- `PrivacyLedger` is surfaced from web profile UI but not from native profile UI despite both stacks registering it

## Phase-2 Fix Direction

This document is phase 1, so no behavioral changes are proposed here yet. The most important direction for phase 2 is:

1. define a host-provided route capability contract for profile surfaces
2. stop profile components from hardcoding foreign route names
3. make runtime route registration match typed contracts exactly
4. keep intentional platform differences explicit in one matrix instead of implicit in screen code

## Proposed Route Capability Model

The host app should provide profile surfaces a capability object like:

```ts
type ProfileRouteCapabilities = {
  openFullProfile(profile: FullProfileParams): void;
  openSettings?(): void;
  openPrivacyLedger?(): void;
  openMuteHub?(): void;
  openTrubeLab?(): void;
  openPublicProfile?(target: { id: string; type: 'user' | 'school' | 'classroom' | 'community' }): void;
  openAuth?(): void;
};
```

That would let:

- native expose `openMuteHub` and `openTrubeLab`
- web expose `openSettings` either through the profile stack or `SettingsPanel`
- community or shell own `openPublicProfile`
- profile screens remain feature-owned without owning global route topology

