---
title: "Entry Route Authority and Public Step-Zero Contract"
status: "accepted"
created: 2026-09-10
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

## Route ownership

| Trigger or state | Destination | Authority |
| --- | --- | --- |
| Root launch with a verified returning account | `/self` | root resolver |
| Root launch with no session, expired JWT, failed refresh, stale local state, or unresolved identity | `/welcome` | root resolver |
| Welcome: Explore as Guest | `/onboarding` | welcome action |
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
- Guest feature access and guest cloud-write authority are separate. The
  fourteen-day local-first lease is specified in the Guest Local-First Lease
  and Cloud-Save Boundary ADR.
- Guest entry carries an explicit onboarding handoff while the auth observer
  replaces any previous session snapshot; it is not a timer or a bypass of the
  route gate.
- The route gate is the single enforcement point. Welcome, auth, and onboarding
  only emit their owned user actions and completion events.
- Tests cover route identity, not merely final navigation: the address bar,
  rendered route family, and admitted services must agree at every transition.

## Failure posture

The model is fallibilist: failure to establish every required app-entry fact is
not evidence that access is safe. It returns the person to the relevant public
or recovery surface with visible retry guidance, while preserving no prior
account's protected UI or authority.
