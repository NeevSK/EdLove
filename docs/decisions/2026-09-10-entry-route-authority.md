---
title: "Entry Route Authority and Public Step-Zero Contract"
status: "accepted"
created: 2026-09-10
updated: 2026-10-04
decision_owner: "Gurudevi mobile architecture"
tags: [adr, routing, authentication, onboarding, guest, local-first]
---

# Entry Route Authority and Public Step-Zero Contract

## Decision

`/welcome` is the deliberate public step zero. It remains visible until the
person chooses a welcome action or follows one of its links. Background session
restoration, capability hydration, or profile refresh must not move it to an
app route.

`/` is the only automatic entry resolver. It may enter `/self` only after all
of these facts are true for the same subject: a real authenticated account, a
non-expired access token, a resolved active profile, completed onboarding, and
active capacity. Otherwise it resolves to `/welcome`. A persisted profile or
capability snapshot can never compensate for a missing or expired token.

Anonymous guest entry is a separate, explicitly local-first path. A Supabase
anonymous session identifies and preserves one guest journey; it is not an
account and it never grants cloud-write authority. An anonymous session without
a completed local guest record and active local bond remains public. Selecting
Continue as Guest from welcome reuses that anonymous subject and resumes its
onboarding draft. Only after the local guest record records completed onboarding, an active
bond, and a valid fifteen-day lease may the current guest journey enter the app
shell. That shell admits local reads, writes, and deletion only.

## Route ownership

| Trigger or state | Destination | Authority |
| --- | --- | --- |
| Root launch with a verified returning account | `/self` | root resolver |
| Root launch with no session, expired JWT, failed refresh, stale local state, or unresolved identity | `/welcome` | root resolver |
| Welcome: Continue as Guest | `/onboarding` | welcome action |
| Welcome: Resume completed Guest session | `/self` | route gate |
| Welcome: I have an account | `/auth` | welcome action |
| Successful account authentication with incomplete onboarding | `/onboarding` | auth completion |
| Successful account authentication with complete onboarding | `/self` | auth completion |
| Guest onboarding completion | its explicit local-first app destination | onboarding completion |
| Later root launch with an anonymous guest session | `/welcome` | root resolver |
| Direct protected deep link without verified access | `/welcome` | route gate |
| Inactive or removed account | `/account-recovery` | route gate |

## Consequences

- Public screens never mount capability hydration, feature synchronization, or
  authenticated foreground services.
- A URL change never leaves the previous route rendered underneath it; the gate
  renders a neutral transition until the destination commits.
- A completed guest flow does not turn an anonymous session into a returning
  account. Only a real authenticated account can receive automatic root entry.
- Guest entry requires all of: the same anonymous auth subject, completed local
  onboarding, an active local bond, and an unexpired local lease. An anonymous
  subject by itself is not app admission.
- Guest feature access and guest cloud-write authority are separate. Guests may
  use local data only after admission; PowerSync, foreground mutation draining,
  cloud feature hydration, and server-backed foreground services require a real
  authenticated account.
- Guest lease expiry clears the guest record and opted-in local data, signs out
  the anonymous session, and lets the route gate resolve the resulting public
  state. The lease boundary never redirects independently.
- Guest entry carries an explicit onboarding handoff while the auth observer
  restores the anonymous subject; it is not a timer or a bypass of the route
  gate. A direct guest-onboarding URL with no anonymous session returns to
  welcome. A completed anonymous guest who explicitly resumes Guest access
  at `/self` rather than repeating onboarding.
- The route gate is the single enforcement point. Welcome, auth, and onboarding
  only emit their owned user actions and completion events.
- Tests cover route identity, not merely final navigation: the address bar,
  rendered route family, and admitted services must agree at every transition.

## Failure posture

The model is fallibilist: failure to establish every required app-entry fact is
not evidence that access is safe. It returns the person to the relevant public
or recovery surface with visible retry guidance, while preserving no prior
account's protected UI or authority.

## Account authentication and guest claim seam

### Feature spec: authenticated-entry consolidation

- **Blast zone:** RED (`packages/core/src/logic/auth`) and AMBER (mobile auth
  lifecycle and shared auth screen).
- **Reuses:** `getSessionIdentityMode`, `getAuthRouteTarget`, the existing
  `AuthManager`, and the existing local guest identity/lease records.
- **Does not:** create a second navigator, make a guest cloud-sync client, or
  alter server-side PowerSync configuration.
- **Complexity budget:** each route/profile predicate remains under the
  repository cognitive-complexity limit; screen code only presents form state
  and invokes existing auth operations.

Password sign-up is immediate-session sign-up. Email confirmation is disabled
for the current product phase, so a successful sign-up must yield a Supabase
session and the UI must not ask the person to check email or wait for a callback.
The hosted Supabase configuration must match the checked-in local configuration
(`auth.email.enable_confirmations = false`). A returned user with no session is
an explicit configuration failure, not a successful sign-up.

Password sign-in, password sign-up, and Google sign-in may establish or upgrade
an account, but they never select a post-auth route. The auth observer updates
the session; the route gate then chooses `/onboarding` or `/self` from resolved
account facts. Magic-link and passkey entry remain outside this first
consolidation slice because each adds callback/pending states that do not help
the immediate email-and-Google path.

An anonymous session is allowed to become an authenticated account only through
an explicit claim action. The claim preserves the local guest subject, local
bond/capacity, and local data scope until an explicit migration policy is
selected. The legacy direct guest-data upload path is not the default claim
mechanism and remains compatibility code pending dedicated migration tests.

### Feature spec: guest account claim

- **Blast zone:** RED (`packages/core/src/logic/managers/AuthManager.ts`) and
  AMBER (`packages/ui/src/screens/AuthScreen.tsx`).
- **Target:** native password claim reads its display name and capacity from the
  local guest identity's active bond; it never selects a replacement capacity.
- **Reuses:** `getLocalGuestIdentity`, the existing `linkAnonymousToEmail`
  operation, and the current local guest scope keyed by the Supabase subject.
- **Does not:** upload guest data, create a cloud PowerSync client, create a
  server-side bond, or delete the legacy migration compatibility path.
- **Complexity budget:** one validated local-identity resolver and a linear
  claim handoff; no route behavior changes.

### Feature spec: native welcome doorway reliability

- **Blast zone:** AMBER (`packages/ui/src/components/SanctuaryDoorwayActions.tsx`).
- **Target:** the shared animated press host uses Gesture Handler's native
  pressable implementation so Reanimated transforms retain Android/Fabric touch
  delivery; the doorway remains an animated native control.
- **Reuses:** the existing guest/sign-in callbacks, loading state, labels, and
  shared `PressableScale` feedback primitive.
- **Does not:** change guest admission, add inline routing, suppress errors, or
  alter animation behavior outside the shared press host.
- **Complexity budget:** one host substitution; no new branching.

### Cloud-service boundary

For an anonymous session, the application must not call remote identity/profile
resolution, lifecycle-status RPCs, school lookup, realtime profile
subscriptions, entitlement hydration, PowerSync connection, or foreground
mutation draining. Those are account services: they consume network/radio work
and derive cloud authority from a session that only identifies a local guest.
The anonymous auth subject remains available solely for local guest storage,
lease validation, onboarding, and later account claim. When the session becomes
authenticated, normal account lifecycle resolution begins and the route gate
re-evaluates once; it is not polled while the user is a guest.

## Startup visual contract

The visual sequence is `native splash → mounted JavaScript startup surface →
route decision → destination`. The JavaScript startup surface owns retryable
essential-runtime failure and gives session/bootstrap work time to resolve, but
does not navigate. Native splash is hidden only after that JavaScript surface
has committed a frame. Route policy remains the only automatic navigator.


## Platform-label clarification (2026-10-04)

On mobile, the visitor option is **Continue as Guest**. “Explore” is reserved
for the public web route at `sanctuary.gurudevi.app/explore/*`; mobile does not
provide an Explore session. The mobile Guest identity, lease, and local-only
feature boundary in this ADR remain unchanged.
