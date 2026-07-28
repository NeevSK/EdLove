---
title: "Entity Bond and Policy Parity Foundation"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [authorization, bonds, cedar, zenstack, powersync, entitlements, architecture]
---

# FEATURE SPEC: Entity-Bond Authorization and Policy Parity

## Blast Zone: RED

## Target Files

- `packages/schema/schema.zmodel`
- `packages/policies/src/**`
- `packages/core/src/logic/permissions/**`
- `apps/sanctuary-api/src/**`
- `apps/gurudevi-mobile/supabase/migrations/**`

## Reuses

- Existing `Bond` relationship model and active-bond perspective state.
- Existing ZenStack schema and generated ORM artifacts.
- Existing Cedar evaluator, signed local snapshots, and PowerSync delivery.
- Existing `FeatureAccessContext` and route POA metadata.
- Existing individual pricing manifest and entitlement port, extended with
  explicit scope rather than replacing the legacy pricing projection in one
  migration.

## Does Not

- Treat `school_id` as the user’s identity or universal authorization scope.
- Trust client-supplied capacity, entity, pricing, or policy-version values.
- Make local Cedar authoritative for server-owned data.
- Invent a separate guest/anonymous Cedar policy namespace.
- Deploy or mutate a PowerSync instance without an explicitly authorized target.

## Contract

1. A person may have no session, an anonymous Supabase session, or a verified Supabase account. These are session/identity states, not Cedar policy namespaces.
2. Anonymous Supabase users may complete onboarding and enter the app with the same Cedar schema and policy vocabulary as verified users. They use `THIRD_CLASS` citizenship until verification changes their profile state.
3. Onboarding is complete only when the user has explicitly selected a primary capacity and the server has persisted the corresponding initial personal-sanctuary bond.
4. A user has a personal sanctuary entity and may hold bonds to many entities.
5. A bond is the active authorization perspective: user, entity, capacity, and relationship metadata.
3. School context is optional and is derived only for school-scoped entities/resources.
4. ZenStack remains the data/query policy authority; Cedar remains the action/resource policy authority.
5. A shared authorization registry and parity tests prevent the two policy systems from silently diverging.
7. The server reauthorizes every server-backed operation. Local Cedar evaluates only verified, scoped, expiring offline state.
8. `FREE` and `PRO` are individual-plan grants. Institutional access is a
   separate grant scoped to a verified bond/entity; it must not be inferred
   from `FIRST_CLASS` or from the legacy `users.pricing_tier` projection.
9. A feature requirement declares whether its entitlement is evaluated in the
   individual scope or the active bond/entity scope. An institutional grant
   therefore cannot accidentally unlock an unrelated personal feature.

## Identity terms

- `unauthenticated`: no Supabase session; public routes only.
- `anonymous`: a valid Supabase anonymous session; eligible for onboarding and the normal policy surface, but not email/provider verified.
- `authenticated`: a valid non-anonymous Supabase session; verification is a profile/citizenship fact, not a synonym for token validity.
- `onboarded`: an explicit profile state requiring a selected primary capacity and persisted initial personal bond. It can apply to either anonymous or authenticated users.
- `citizenship`: registration/verification level. It is not capacity, entitlement, school membership, or a guest-policy switch. `WANDERER` is legacy storage only and normalizes to `THIRD_CLASS`.

There are no guest-specific Cedar policies. Cedar receives the same principal/action/resource model; citizenship and bond attributes determine the applicable decision.

## Active-bond selection

The server must never choose an active bond by row order, creation time, or a hidden fallback. The initial personal-sanctuary bond is selected as part of onboarding and persisted as the user's active perspective. Later switching is an explicit user action that persists the selected bond ID. Every request carries that selected ID, and the server verifies ownership and entity scope before deriving Cedar context. Missing, stale, or ambiguous selection is a state error that routes to perspective selection; it is never resolved arbitrarily.

## Complexity Budget

No function over 15 cognitive complexity; new policy helpers must be pure or dependency-injected.
