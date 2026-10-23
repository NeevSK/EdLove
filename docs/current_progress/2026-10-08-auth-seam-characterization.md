---
title: "Auth and Onboarding Seam Characterization"
status: "active — Phase A1 characterization"
created: 2026-10-08
owners: [identity, web, mobile, api, quality]
tags: [CHAR, auth, onboarding, session, compatibility]
---

# Auth and Onboarding Seam Characterization

> **Canonical authority (2026-10-23):** This remains a characterization record.
> Decisions and new implementation work must follow
> [`authentication-and-sovereign-identity.md`](../architecture/authentication-and-sovereign-identity.md).

## Scope

This is a characterization record, not a replacement design and not permission
to delete legacy paths. It covers identity mapping, signup/callback, session
observation, onboarding, and the first account transition.

## Current authorities found

| Concern | Current path | Observed intent | Characterization verdict |
|---|---|---|---|
| Mobile session lifecycle | `packages/core/src/hooks/useAuthLifecycle.ts` → `AuthProvider` | Subscribes to auth state, resolves profile, handles app wake/reconciliation, and guards stale generations. | Strongest existing lifecycle authority; runtime proof still required. Preserve and expose its semantics rather than create another mobile lifecycle. |
| Shared auth abstraction | `packages/core/src/logic/ports/auth.port.ts`, `AuthManager`, Supabase auth adapter | Provider-independent auth/session operations including callback exchange and state changes. | Correct integration boundary, but callers still bypass it in web and some adapters. |
| Legacy/shared onboarding client | `packages/core/src/api/onboarding.ts`, `IdentityManager`, `SupabaseIdentityAdapter` | Creates initial bond, handles guest scope, completes onboarding, and creates default personal structures. | Compatibility surface with direct session access, caller-supplied IDs, and duplicate behavior. Do not remove yet. |
| Legacy Hono-style server contract | `packages/core/src/api/handlers/onboarding.ts` and route tests | `/identity/initial-bond` and `/identity/complete-onboarding`. | Existing contract and tests prove historical behavior; candidate compatibility adapter. |
| Canonical server onboarding contract | `apps/sanctuary-api/src/core/handlers/onboarding.ts`, `onboardingBootstrap.ts` | oRPC `createInitialBond` and `completeOnboarding`, deriving actor from request context. | Strongest server authority for new integration; has dedicated API tests. |
| Web signup | `apps/gurudevi-web/app/(sanctuary)/sign-up/SignUpForm.tsx` | Direct browser Supabase signup; redirects to callback/confirmation. | Functional entry point, but not yet unified with shared account-state resolution. |
| Web callback | `apps/gurudevi-web/app/auth/complete/route.ts` | Exchanges one-time code for session. | Narrow route has boundary tests; downstream lifecycle handoff needs characterization. |
| Web onboarding | `apps/gurudevi-web/app/(sanctuary)/onboarding/OnboardingForm.tsx` | Direct API fetch for initial bond then completion, sending display name and orientation. | Functional but bypasses shared client seam; migration target, not deletion target. |
| Web auth provider | `apps/gurudevi-web/app/(sanctuary)/auth/AuthProvider.tsx` | Browser session bootstrap and context for sanctuary pages. | Must be compared with provider state-change behavior before claiming cross-tab/expiry robustness. |

## Canonical integration recommendation

Use the `sanctuary-api` oRPC onboarding contract as the new server authority,
and use the shared core auth/session abstractions as the client boundary. Keep
the existing Hono-style routes and identity adapter behind compatibility
wrappers until all callers are migrated and their behavior is characterized.

This recommendation is based on actor derivation: the canonical oRPC handler
derives the actor from authenticated request context, while legacy methods
accept or inspect user IDs in their public boundary. The recommendation does
not authorize changing behavior in this step.

## Integration shape

```text
web/mobile auth provider
        ↓
shared auth/session boundary
        ↓
canonical onboarding client command
        ↓
sanctuary-api oRPC onboarding handler
        ↓
server-derived account + relationship state
```

Compatibility paths remain available beside the new boundary during migration:

```text
legacy caller → compatibility adapter → canonical command
```

The adapter must preserve legacy response/error shapes where callers depend on
them, while preventing caller-supplied identity from becoming server authority.

## Required characterization cases

- signup with confirmation required;
- callback success, expired code, repeated code, and malformed code;
- no session, anonymous session, verified session, and expired session;
- onboarding with valid name/capacity;
- duplicate onboarding submission;
- onboarding interruption and retry;
- legacy caller passing a mismatched user ID;
- guest conversion with eligible personal records;
- guest conversion retry after partial transport failure;
- auth event arriving during initial session lookup;
- sign-out/refresh while a protected read or mutation is in flight;
- cross-tab/session change on web;
- server denial and stale scope after onboarding.

## Safe next implementation slice

The first code slice should be an additive typed compatibility client that calls
the canonical oRPC onboarding commands, plus characterization tests around the
existing legacy methods. It must not edit `_layout.tsx`, delete legacy routes,
alter migrations, or change account-state semantics without a separate RED-zone
proposal and evidence.

## Evidence status

- G0/G1 contract and boundary evidence exists for several auth, callback, and
  onboarding paths; see the account foundation evidence ledger.
- G2/G3/G4/G5 evidence for the complete signup → onboarding → personal-entry
  journey is not established.
- `identity:check` still reports findings, including source-level direct auth
  access and generated-artifact noise; cleanup is a later, bounded task.

