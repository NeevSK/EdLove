---
title: "FEATURE SPEC: Canonical Onboarding Compatibility Client"
status: "proposed — additive integration"
created: 2026-10-08
owners: [identity, web, mobile, api, quality]
tags: [IMPL, auth, onboarding, compatibility]
---

# FEATURE SPEC: Canonical Onboarding Compatibility Client

## Blast Zone

AMBER — `packages/core/src/api/` and web onboarding caller integration.

## Target files

- New: `packages/core/src/api/onboardingClient.ts`
- `packages/core/src/api/index.ts` export surface
- Tests adjacent to the new client
- Later caller migration: `apps/gurudevi-web/app/(sanctuary)/onboarding/OnboardingForm.tsx`
- Mobile caller integration: `packages/ui/src/screens/OnboardingScreen.tsx`

## Reuses

- `@repo/core/api/orpcClient`
- `@repo/core/api/onboarding.orpc.contract`
- Existing `onboardingAPI` as compatibility behavior reference
- Existing guest identity storage and local guest scope behavior
- Existing server `onboarding.createInitialBond` and
  `onboarding.completeOnboarding` routes

## Does NOT

- delete or rename legacy onboarding routes;
- edit Supabase migrations;
- edit mobile root navigation or `_layout.tsx`;
- trust a caller-supplied user ID;
- change account-state semantics in this slice;
- route anonymous guest onboarding through the authenticated server command;
- create a second session/auth provider;
- introduce a new retry policy separate from the existing oRPC client.

## Contract

Expose typed commands that accept orientation, context, and capacity-confirmation
for initial bond creation, and no user ID for onboarding completion. Preserve
the canonical server response and surface errors without swallowing them.

## Complexity budget

Keep the adapter below 80 lines and cognitive complexity below 15. Tests must
cover request shape, omission of user ID, response pass-through, and error
propagation.
