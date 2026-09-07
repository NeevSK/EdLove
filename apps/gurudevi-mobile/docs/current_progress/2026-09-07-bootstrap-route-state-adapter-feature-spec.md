---
title: "Feature Spec — Bootstrap Route-State Adapter"
status: "approved-for-implementation"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, routing, auth, lifecycle, amber-zone]
---

# Feature Spec — Bootstrap Route-State Adapter

## Blast zone

AMBER — mobile entry routing adapter. Core route policy and root layout remain
unchanged.

## Target files

- `apps/gurudevi-mobile/src/entry/bootstrapRouteState.ts`
- `apps/gurudevi-mobile/src/entry/SessionRouteGate.tsx`

## Reuses

- `getAuthRouteTarget` and `getSessionIdentityMode` from `@repo/core/logic`
- `getSessionRouteReadiness` from the existing mobile bootstrap helper
- `useAuth`, `useStore`, and persisted `useEntitlementStore`

## Does not

- Does not change core route-policy decisions or `app/_layout.tsx`.
- Does not inspect raw session metadata for authorization.
- Does not add redirects inside route screens.
- Does not alter deep-link parsing, tab layout, PowerSync, or account cleanup.

## Complexity budget

One pure mapper, one hook adapter, and contract tests. No function exceeds
cognitive complexity 15.

## Behavior contract

The gate receives one resolved route target from a typed snapshot. A fresh
entitlement snapshot belonging to the restored session may permit an offline
return while profile hydration continues. A snapshot belonging to another user,
or stale/unavailable entitlement state, cannot grant app routing.

The `/self` app entry additionally requires an active profile that belongs to
the restored session, a meaningful display name, and a live active bond/capacity.
Entitlement cache state never substitutes for those identity facts; incomplete
identity is held during resolution or sent to onboarding.

When the loaded profile explicitly belongs to a different account than the
active session, protected shell content is withheld until a matching profile is
resolved. Public callback/auth routes remain renderable during that bootstrap.
