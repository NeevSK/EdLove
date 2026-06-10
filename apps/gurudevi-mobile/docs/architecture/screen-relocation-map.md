---
title: "Gurudevi Screen Relocation Map"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Gurudevi Screen Relocation Map

## Current App-Level Screen Inventory

Only these files now remain under `apps/gurudevi-mobile/src/screens`:

- `apps/gurudevi-mobile/src/screens/index.ts`

App-only composition now lives here:

- `apps/gurudevi-mobile/src/composition/AuthScreen.tsx`

## Why These Stay

- `src/composition/AuthScreen.tsx`
  Keeps app-level dependency injection for `ScannerModal` from `@repo/scanner-kit`.
  This is composition glue, not shared domain UI.

- `index.ts`
  Acts as a compatibility barrel for any app imports that still reference `../screens`.
  The barrel now re-exports package-owned screens instead of local adapter files.

## Package Ownership Map

- `@repo/ui`
  App shell and generic UX screens.
  Owns `AppSettings`, `Welcome`, `Onboarding`, `Notifications`, `InvitationWelcome`, `InviteCodeEntry`, `FounderVision`, `TrubeLab`, `ThuthimalClaim`, `ErrorMessageDemo`, `MuteHub`.

- `@repo/ai`
  Owns `AIAssistantScreen` and `AIAssistantScreenWeb`.

- `@repo/classroom`
  Owns classroom, attendance, gradebook, timetable, profile, and dashboard screens.
  Also exports web-specific classroom screen variants used by navigation.

- `@repo/form-builder`
  Owns `FormBuilderScreenWeb` and `PublicFormScreenWeb`.

- `@repo/community`
  Owns `CommunityScreen`, `AnnouncementsScreen`, chat, groups, and public-profile community flows.

- `@repo/library`
  Owns `LibraryScreen`, `LibraryScreenWeb`, and `CollectionDetailScreenWeb`.

- `@repo/profile`
  Owns `ProfileScreen`, `ProfileScreenWeb`, `FullProfileScreen`, `FullProfileScreenWeb`, and `PublicProfileScreenWeb`.

- `@repo/admin`
  Owns `SchoolCreationScreen`, `SchoolForestScreen`, and `SchoolProfileScreen`.

- `@repo/self`
  Owns `SelfScreen`, `SelfScreenWeb`, and `PrivacyLedgerScreen`.

## Rule Going Forward

- Keep a screen in `apps/gurudevi-mobile` only if it injects app-only dependencies or composes app shell behavior.
- Move shared feature screens into the package that owns the domain.
- Prefer navigators importing from package exports, not relative app screen paths.
