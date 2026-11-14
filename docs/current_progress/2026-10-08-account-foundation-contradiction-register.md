---
title: "Account Foundation Contradiction Register"
status: "active"
created: 2026-10-08
owners: [product, identity, web, mobile, api, quality]
tags: [audit, contradictions, account-lifecycle]
---

# Account Foundation Contradiction Register

> **Canonical authority (2026-10-23):** Resolve these conflicts according to
> [`authentication-and-sovereign-identity.md`](../architecture/authentication-and-sovereign-identity.md).

This register records conflicts found during the repository-grounded audit.
Nothing here is silently “fixed” by choosing the newest-looking code.

| ID | Conflict | Evidence | Risk | Required resolution |
|---|---|---|---|---|
| C-001 | Legacy Hono-style onboarding handlers and canonical oRPC onboarding handlers both exist. | `packages/core/src/api/onboarding.ts`; `apps/sanctuary-api/src/core/handlers/onboarding.ts` | New accounts can be created through different contracts with different lifecycle semantics. | Name one canonical contract and define compatibility/migration before removing or redirecting the other. |
| C-002 | Web onboarding calls the API directly while other identity paths use shared wrappers/adapters. | `apps/gurudevi-web/app/(sanctuary)/onboarding/OnboardingForm.tsx` | Auth, errors, retries, and telemetry can diverge by entry point. | Decide the single web onboarding seam and characterize all callers. |
| C-003 | Web `AuthProvider` bootstraps with `getSession` but does not visibly subscribe to auth state changes. | `apps/gurudevi-web/app/(sanctuary)/auth/AuthProvider.tsx` | Refresh, sign-out, cross-tab, and expiry transitions are not established. | Define session lifecycle contract and prove browser transitions. |
| C-004 | A mobile database trigger marks non-anonymous identity as onboarded before the onboarding flow completes. | `apps/gurudevi-mobile/supabase/migrations/20260511000000_split_display_name_profile_identity.sql` | Users can bypass the intended onboarding state machine at the persistence layer. | Reconcile trigger semantics with the canonical lifecycle decision. |
| C-005 | Workspace code exposes fictional/student Safe Try and old package screens expose demo/student paths while the product decision defers student flows. | `WorkspaceFloor.tsx`; `packages/classroom/src/screens/ClassroomScreen.web.tsx` | Demo behavior can be mistaken for first-release product behavior. | Label as deferred/demo in the release matrix; do not delete until compatibility is decided. |
| C-006 | Community focused-circle content is a feed mock even though the domain authority describes participation, safety, and moderation capabilities. | `CommunityFeedFloor.tsx`; community authority decision | Discovery can be mistaken for participation and safety coverage. | Separate discovery release slice from real participation slice. |
| C-007 | Explore modes intentionally use local/sample data while authenticated floors use remote data. | Self, Workspace, Community Explore copy and floor implementations | “Works in Explore” is not account or server evidence. | Keep Explore explicitly non-durable and report it separately from authenticated capability. |

