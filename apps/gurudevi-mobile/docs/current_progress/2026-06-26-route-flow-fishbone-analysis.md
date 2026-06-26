---
title: "Route Flow Fishbone Analysis"
status: "draft"
created: 2026-06-26
updated: 2026-06-26
author: "Naween"
scribe: "Antigravity"
tags: [analysis, routing, auth, onboarding, identity, cedar, poa, rls]
---

# Route Flow Fishbone Analysis

This document is the durable analysis record for the current `gurudevi-mobile` entry flow.

It intentionally separates:

- confirmed code behavior
- confirmed documentation behavior
- inferred failure modes

If this file conflicts with newer canonical docs, the newer canonical docs win.

## Scope

Analyzed layers:

- Expo Router shell and route files
- auth bootstrap and session hydration
- welcome / auth / onboarding user flow
- onboarding API and handlers
- identity resolution
- permission helpers
- POA / Cedar / RLS boundary chain
- legacy archive influence
- mobile/web parity concerns

## What Is Confirmed

As of 2026-06-26, the code shows:

- `app/_layout.tsx` performs global boot and route gating
- `app/index.tsx` also performs route gating
- `welcome`, `auth`, and `onboarding` are separate route entry points
- guest sign-in uses Supabase anonymous auth
- onboarding owns name and capacity/role selection
- onboarding completion is driven by API calls and store refresh
- permission checks are layered through POA / Cedar-style logic and local evaluators
- server-side handlers still enforce final truth for identity and onboarding writes

## Fishbone

### 1. Routes / Navigation

Cause:

- multiple files decide the same routing outcome

Effect:

- one screen can redirect to another before the previous state is stable
- a user can see different behavior on web and mobile even when the intent is the same

Evidence:

- `app/_layout.tsx`
- `app/index.tsx`
- `app/welcome.tsx`
- `app/auth.tsx`
- `app/onboarding.tsx`

### 2. Session Hydration

Cause:

- session, profile, and store hydration are resolved asynchronously and independently

Effect:

- redirect decisions can run before the identity state is trustworthy
- the UI can briefly believe the user is guest, authenticated, or onboarded at the wrong time

Evidence:

- `packages/core/src/hooks/useAuthLifecycle.ts`
- `packages/core/src/native/useAuthLifecycle.ts`
- `packages/core/src/logic/auth/bootstrapRoutes.ts`

### 3. Identity Semantics

Cause:

- citizenship, guest state, onboarding state, and capacity are all separate concepts, but some code still treats them as loosely interchangeable

Effect:

- onboarding and auth can disagree about whether the user is “done”
- guest can be inferred in more than one way

Evidence:

- `packages/core/src/logic/auth/identityState.ts`
- `apps/gurudevi-mobile/docs/Core/CITIZENSHIP_ARCHITECTURE.md`
- `packages/core/src/api/handlers/identity.ts`

### 4. Onboarding State Machine

Cause:

- onboarding owns both UI progression and server persistence
- the dev/sandbox fast-path is embedded inside the same screen

Effect:

- the onboarding journey can behave like a flow, a form, and a provisioning pipeline at the same time
- completion can be force-reconciled by a wrapper instead of truly owned by the screen

Evidence:

- `packages/ui/src/screens/OnboardingScreen.tsx`
- `packages/ui/src/screens/OnboardingWrapper.tsx`
- `packages/core/src/api/handlers/onboarding.ts`

### 5. Guest Entry Idempotency

Cause:

- welcome entry can be retried by the user on a slow network

Effect:

- multiple anonymous sessions or duplicate side effects can be created if the action is not guarded

Evidence:

- `packages/ui/src/screens/WelcomeScreen.tsx`
- `packages/core/src/api/auth.ts`
- `packages/core/src/utils/idempotency.ts`

### 6. POA / Cedar / RLS Stack

Cause:

- application route gating, UI permissions, Cedar-like checks, and database RLS are all valid but separate enforcement layers

Effect:

- a failure can appear as a route problem, a permissions problem, or a database policy problem depending on where it surfaced first

Evidence:

- `packages/core/src/logic/permissions/hooks/usePermissions.ts`
- `packages/core/src/logic/permissions/localEvaluator.ts`
- `packages/core/src/logic/permissions/guards/RouteGuard.tsx`
- `packages/core/src/api/handlers/onboarding.ts`
- `packages/core/src/api/handlers/identity.ts`
- `packages/core/docs/DATA_ODYSSEY.md`
- `packages/core/docs/SOVEREIGN_API_STRATEGY.md`

### 7. Legacy Gravity

Cause:

- archive docs and older route assumptions still exist in the repo

Effect:

- future readers can accidentally inherit an outdated mental model

Evidence:

- `apps/gurudevi-mobile/archives/`
- `apps/gurudevi-mobile/docs/navigation-architecture.md`

### 8. Mobile / Web Parity

Cause:

- the same journey exists on both platforms, but the implementation surfaces are split

Effect:

- the business rule may be correct while the visual experience diverges

Evidence:

- `packages/ui/src/screens/WelcomeScreen.tsx`
- `packages/ui/src/screens/WelcomeScreen.web.tsx`
- `packages/ui/src/screens/OnboardingScreen.tsx`
- `packages/ui/src/screens/OnboardingScreen.web.tsx`

## Likely Root Causes

1. No single route-family authority.
2. Identity semantics are distributed across app, API, and docs.
3. Onboarding is doing too much at once.
4. Guest entry is not clearly idempotent at the user-action boundary.
5. Permission boundaries are technically sound but conceptually too spread out for easy reasoning.

## Confidence Notes

High confidence:

- duplicate route decision surfaces exist
- onboarding and auth are interleaved across multiple layers
- guest/auth/onboarding semantics are not communicated as one stable contract everywhere

Medium confidence:

- current user-visible failures are primarily caused by route timing and identity-state drift

Lower confidence:

- exact failure mode on every platform without live reproduction

## Validation Date

This analysis was last validated against the codebase on 2026-06-26.

