---
title: "Feature Spec — Deep-Link Lifecycle Boundary"
status: "implemented-code"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, navigation, deep-links, auth, lifecycle, amber-zone]
---

# Feature Spec — Deep-Link Lifecycle Boundary

## Blast zone

AMBER — mobile deep-link provider, app-level pure policy/dispatch modules, and
the existing scanner-kit QR adapter.

## Target files

- `apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx`
- `apps/gurudevi-mobile/src/lib/deepLinks/*`
- `packages/scanner-kit/src/hooks/useQRDeepLink.ts`
- `packages/core/src/adapters/supabase/auth.adapter.ts`
- `packages/core/src/logic/auth/bootstrapRoutes.ts`
- `apps/gurudevi-mobile/app/auth/callback.web.tsx`
- focused provider, policy, and scanner-kit tests

## Reuses

- `deepLink.handleURL` and `DeepLinkType` as the core intent authority
- the existing Supabase code-exchange adapter and bootstrap route contract
- `coreRuntime.linking` and `coreRuntime.storage`
- scanner-kit QR parsing and pending-action persistence
- Expo Router only for the existing invite and QR destinations

## Does not

- Does not change `EntryShell`, core deep-link parsing, auth-session exchange,
  tabs, or screen-level route guards.
- Does not add a second global URL listener.
- Does not use raw session metadata for authorization.

## Complexity budget

The provider is subscription composition only. URL policy, dispatch, tracking,
and QR delivery each have a single focused function; no function exceeds
cognitive complexity 15.

## Behavior contract

One mounted provider owns native cold-start and foreground URL subscription.
Every accepted non-QR URL is dispatched once and tracked once. QR URLs are
handled by that same listener: authenticated users navigate to `/qr`; signed-out
users retain the payload for the existing post-auth redemption path. Deferred
links are removed from storage only after their one dispatch attempt finishes.
Web magic links return to `/auth/callback`, which delegates to the same core
deep-link manager; bootstrap routing keeps that callback reachable before a
session and hands completed authentication to the existing route gate.

## Verification

Tests cover accepted/rejected URL policy, foreground and cold-start dispatch,
one listener registration, invite navigation, and signed-out QR handoff to the
existing pending-action adapter. Scanner-kit TypeScript compilation, scoped
Biome, and duplication checks pass. Native cold-start/foreground magic-link
and QR evidence remains a device-release requirement.

Core kernel tests additionally verify the actual Supabase magic-link request
uses the web callback URL, and the shared route contract verifies the callback
is public before exchange and redirects through the existing app entry after a
successful authenticated bootstrap.
