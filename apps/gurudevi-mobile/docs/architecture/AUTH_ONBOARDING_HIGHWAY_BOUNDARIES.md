---
title: "Auth and Onboarding Highway Boundaries"
status: "active"
created: 2026-05-22
updated: 2026-06-26
author: "Naween"
tags: [reorganized]
---

# Auth and Onboarding Highway Boundaries

This document describes the import boundaries used by the auth and onboarding screens so web stays direct-API-first and mobile can keep local-first behavior where it is actually needed.

## Goals

- Keep web auth/onboarding free of PowerSync bootstrap side effects.
- Keep mobile auth/onboarding compatible with local-first and sync-oriented behavior.
- Make screen imports communicate intent instead of relying on broad barrels.
- Preserve a secure, explicit boundary between session/bootstrap work and sync/runtime work.

## Public Boundaries

- `@repo/core/api`
  - Direct API and orchestration entrypoints.
  - Use for session checks, identity/profile reads, and onboarding transition calls.
- `@repo/core/storage`
  - Persistent key-value storage.
  - Use for local flags and pending invite state instead of `coreRuntime.storage`.
- `@repo/core/providers`
  - React context and auth hooks.
  - Use for `useAuth` and provider wiring.
- `@repo/core/store`
  - Zustand store access.
  - Use for UI/session state selectors.
- `@repo/core/types`
  - Shared contracts and domain types.
- `@repo/core/utils`
  - Pure validation and utility helpers.

## Why `onboardingAPI` Owns the Onboarding Identity Flow

The onboarding screens need three identity lifecycle actions:

- read the active perspective
- create the initial bond
- mark onboarding complete

Those actions are now exposed through `@repo/core/api` as `onboardingAPI` so the screen can depend on a narrow, explicit orchestration surface instead of importing the full identity manager barrel.

## What Changed

- Auth screens now read and clear pending invite state through `@repo/core/storage`.
- Auth screens now import validation and error helpers from explicit subpaths.
- The onboarding wrapper now imports `useAuth` from `@repo/core/providers`.
- Onboarding screens now call `onboardingAPI` for onboarding-specific identity work.

## Rules Of Thumb

- If a screen needs a network-backed operation, use `@repo/core/api`.
- If a screen needs persistence, use `@repo/core/storage`.
- If a screen needs auth context, use `@repo/core/providers`.
- If a screen needs app state, use `@repo/core/store`.
- Avoid importing `@repo/core/logic` from auth/onboarding screens unless no narrower public boundary exists yet.

## Security And Robustness Notes

- Web auth should never require PowerSync to initialize before login or onboarding can proceed.
- Mobile may still use sync/runtime plumbing internally, but auth bootstrap should remain direct-API-first.
- Narrow imports reduce accidental side effects, circular dependencies, and startup order bugs.

## Canonical Identity Rules

- Detect anonymous guests from the Supabase `is_anonymous` claim or explicit app metadata, not from a missing email address.
- Treat `email` as optional for guest sessions and `null` in the canonical payload when it is absent.
- Use `identity_state` as the onboarding contract:
  - `ARRIVAL` for brand-new or anonymous entry points
  - `IDENTITY_SELECTION` when the user must choose display name and capacity
  - `SANCTUARY_INIT` while the sanctuary is being created
  - `COMPLETED` once onboarding is finished
- Capacity and profile completion must be collected through the onboarding API path; no dev or sandbox login path may bypass required name/capacity selection.
- Client code should call `@repo/core/api` wrappers for auth/onboarding work and should not write identity rows directly.

## Canonical Implementation Notes

- Use `@repo/core/logic` as the public import surface for shared identity and route helpers.
- Do not import `@repo/core/logic/auth/*` directly from UI screens unless you are extending the helper module itself.
- Keep the bootstrap decision path in sync across the Expo Router root, auth screens, and onboarding screens by reading the same shared helpers.
- Preserve the separate storage boundary:
  - Supabase auth session storage uses secure storage on native and browser storage on web.
  - App UI/session state can continue using the existing general-purpose storage layer.
- Treat the onboarding state machine as domain truth, not a UI heuristic.

## Client POA Rule

- The client-side POA proxy is allowed to enforce policy for most screens and modules.
- For browser bootstrap modules that must stay direct-API-first (`identity`, `profile`, `auth`, `onboarding`), the proxy should not route through the local PowerSync-backed evaluator during initial auth/onboarding resolution.
- This keeps web onboarding step 1 from tripping the PowerSync runtime guard while preserving server-side authorization as the authoritative check.
