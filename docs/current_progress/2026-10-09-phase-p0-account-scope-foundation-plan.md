---
title: "Phase P0 Account and Scope Foundation Implementation Plan"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Codex"
tags: [implementation-plan, account, session, scope, identity, sanctuary, self]
---

# Objective

Make the authenticated account and active-scope facts consistent across
Sanctuary, Self, Workspace, Library, and Community before adding broader
feature behavior.

The decisions in this plan are provisional product policy. The implementation
must still choose one current typed contract per seam so web, mobile, and API
callers do not diverge. A later policy change is handled as a versioned
migration with characterization evidence; it is not a reason to leave the
current seam ambiguous.

The product ordering is:

```text
user account → Sanctuary app → Self home tab
                              ├─ open/public Library
                              ├─ open Community
                              └─ later institutional Workspace relationships
```

This phase does not build new institutional features. It makes the existing
entry and identity foundation truthful enough for those features to follow.

# Why this is next

Every primary web tab currently re-derives account and scope facts. Some paths
use `resolveAuthorizedEntry`, some query Supabase directly, some use raw fetch,
and some use oRPC. Until these facts converge, a feature can make a correct
decision against stale or different identity state.

# Invariants

1. One provider subject resolves to one internal account.
2. Session validity, account lifecycle, onboarding completion, authorization,
   and active scope are separate facts.
3. Sanctuary access and Self home do not require an institution.
4. Open/public Library and Community experiences do not require an institution.
5. Workspace actions are capacity-gated, not institution-gated. Creating a new
   school or class is available to the appropriate capacity; operations against
   an existing entity require a server-verified relationship.
6. Client-submitted user, school, class, or scope IDs are selectors, never
   authority.
7. A stale, expired, or mismatched session cannot read protected data or issue
   a durable mutation.
8. Guest/local data is never silently presented as durable account data.

# Current seams to characterize first

| Seam | Current location | Characterization question |
|---|---|---|
| Browser authorized entry | `apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts` | What exact session, identity, onboarding, and scope facts are read, and how do expiry/denial states map? |
| Browser auth provider | `apps/gurudevi-web/app/(sanctuary)/auth/AuthProvider.tsx` | Are refresh, sign-out, cross-tab changes, and expiry observed or only initial bootstrap handled? |
| Identity API | `packages/core/src/api/identity*`, Sanctuary identity handlers | Which server response is authoritative for account state and active scope? |
| oRPC transport | `packages/core/src/api/orpcClient.ts`, `clientRuntime.ts` | Which headers, retries, errors, and contract types are guaranteed? |
| Onboarding | `packages/core/src/api/onboardingClient.ts`, legacy `onboarding.ts`, web/mobile callers | What happens after create succeeds but completion fails or is retried? |
| Self entry | Self page and `selfApiClient.ts` | Does Self use the same account/scope facts as Sanctuary entry? |
| Workspace entry | Workspace page and `workspace/attendance.ts` | Does an absent institutional relationship correctly leave the user in Self/open domains rather than a dead end? |
| Library/Community entry | their page loaders and browser adapters | Are open/public paths available without school membership and are denial states truthful? |

# Implementation sequence

## P0.1 — Freeze the contract

- Accept the lifecycle wording distinguishing Sanctuary from Self.
- Define the account/scope read model fields and discriminated failure states.
- Define which fields are authoritative server facts versus UI hints.
- Record the open/public versus institution-scoped capability matrix.

Exit: contract document and G0 state/transition tests exist.

## P0.2 — Establish one read-model seam

- Add or adapt one shared account/scope reader over the canonical API.
- Keep Supabase responsible for session/authentication, not domain state.
- Validate the response at the external boundary.
- Preserve existing adapters until callers are characterized and migrated.

Exit: web and mobile can consume the same semantic account/scope result, even
if their session providers remain platform-specific.

## P0.3 — Integrate domain entry

- Sanctuary shell resolves the shared account state once.
- Self consumes personal readiness from that state.
- Library and Community consume open/public capability facts without requiring
  school membership.
- Workspace renders capacity-appropriate setup actions when no institutional
  scope exists and relationship-required states only for existing scoped
  entities. It never blocks the rest of Sanctuary.

Exit: every primary tab has one documented entry decision and no duplicate
identity interpretation in the screen.

## P0.4 — Prove session transitions

Characterize and then test:

- initial authenticated load;
- refresh with unchanged session;
- token expiry during a read;
- token expiry during a mutation;
- sign-out in the same tab;
- cross-tab sign-out or account change;
- active-scope change;
- malformed identity/scope response;
- API unavailable/offline state.

Exit: G0/G1 evidence exists, followed by browser evidence for the web path and
mobile runtime evidence where the platform differs.

## P0.5 — Define mutation handoff before durable expansion

- Define request identity/idempotency requirements.
- Define mutation receipt and timeout-after-commit reconciliation.
- Define how onboarding and attendance recover after session expiry.
- Do not make generic retry automatically replay non-idempotent writes.

Exit: onboarding and attendance have explicit mutation envelopes or an
accepted documented reason why a particular command is naturally idempotent.

# Non-goals

- No new school/class/invitation product flow in this phase.
- No deletion implementation in this phase.
- No wholesale migration of every legacy API.
- No client file for every domain.
- No removal of guest/local adapters.
- No claim that Effect v4 migration is complete across the repository.

# Evidence gates

| Gate | Required proof |
|---|---|
| G0 | Lifecycle/read-model schemas and transition tests |
| G1 | Boundary tests for auth, malformed response, denial, expiry, and transport failure |
| G2 | Scenario tests for onboarding interruption, scope absence, and recovery |
| G4 | Real browser entry across sign-in, Self, open Library, open Community, and Workspace-without-relationship |
| G5 | Mobile entry/session evidence where native lifecycle differs |

No mocked result may be reported as browser, device, or production assurance.

# Definition of done

- One semantic account/scope result is used by the primary Sanctuary domains.
- Self is the default post-onboarding home inside Sanctuary.
- Open/public Library and Community do not depend on institutional scope.
- Workspace is enterable without an institutional relationship, exposes
  capacity-appropriate setup, and correctly requests relationship state only
  for existing scoped entities.
- Session expiry and active-scope changes have truthful recovery behavior.
- Onboarding and attendance mutation recovery rules are explicit.
- Legacy paths remain until characterization and migration evidence justify a
  compatibility decision.

# Progress

- **P0.1 started:** the shared route-safe authorized-entry result now treats a
  completed account with valid capacity but no institutional scope as ready.
- **Workspace entry corrected:** web Workspace no longer classifies missing
  scope as onboarding failure; it renders a capacity-appropriate setup state.
- **Evidence:** `webAuthorizedEntry.test.ts` — G1 boundary, Vitest 5.0.3,
  1 file, 6/6 tests completed.
- **Still open:** shared session/read-model transport, real role-specific
  school/class setup actions, and browser/mobile runtime evidence.
