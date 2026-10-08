---
title: "Gurudevi Account Lifecycle Contract"
status: "proposed — acceptance checkpoint"
created: 2026-10-08
owners: [product, identity, web, mobile, api, quality]
tags: [account-lifecycle, identity, onboarding, authorization, deletion]
---

# Gurudevi Account Lifecycle Contract

This document is the product-level contract for a trustworthy Gurudevi account.
It is intentionally platform-neutral. Mobile and web may differ in Explore and
guest behavior, but they must not disagree about the durable account state.

## 1. Core invariant

One person has one durable Gurudevi account identity, initially independent of
any school. A provider subject, internal account, profile, role/capacity, and
school/class relationships are separate concepts. A client-selected role,
school ID, class ID, or scope never grants authority by itself.

## 2. Canonical states

| State | Meaning | Can enter main product? | Durable domain writes? |
|---|---|---:|---:|
| `visitor` | No account identity; may inspect public marketing and Explore surfaces. | No | No |
| `guest` | Temporary mobile-local identity that may accumulate eligible personal work. | Limited to guest-capable mobile surfaces | Local only |
| `identity_created` | Provider identity and internal account exist, but required profile/capacity onboarding is incomplete. | No, except onboarding/recovery | Only lifecycle-safe setup writes |
| `onboarding` | Account is actively completing required name and primary role/capacity details. | No, except onboarding | Profile/onboarding writes only |
| `active_personal` | Required onboarding is complete; user can use independent personal domains. | Yes | User-owned writes allowed by capability |
| `active_scoped` | Active account also has a server-verified school/class/community relationship and selected scope. | Yes, for the verified scope | Entity-scoped writes allowed by authorization |
| `deletion_requested` | A deletion request exists; final deletion has not occurred. | Policy-controlled, with truthful restrictions | No new writes where policy forbids; status/support writes remain |
| `deactivated` | Access is intentionally disabled without representing final erasure. | No | No ordinary domain writes |
| `deleted` | Terminal account state after the approved deletion process. | No | No account-authenticated writes |

`session_valid` is not a lifecycle state. It is a separate condition that may
be true or false for any non-terminal account state. Verification, onboarding,
authorization, entitlement, and session validity must remain separate checks.

## 3. Allowed transitions

```text
visitor ──mobile guest──> guest
visitor ──signup/callback──> identity_created
guest ──account conversion──> identity_created
identity_created ──begin onboarding──> onboarding
onboarding ──name + primary capacity accepted──> active_personal
active_personal ──verified school/class/community relationship──> active_scoped
active_scoped ──relationship ends──> active_personal
active_personal/active_scoped ──deletion request──> deletion_requested
deletion_requested ──cancel/withdraw if policy permits──> prior active state
deletion_requested ──approved completion──> deleted
any non-terminal active state ──administrative disable──> deactivated
deactivated ──approved reactivation──> prior eligible state
```

Forbidden implicit transitions:

- provider signup must not imply onboarding completion;
- a profile trigger must not mark a user onboarded merely because a name exists;
- selecting a school/class ID must not create membership;
- local guest cleanup must not imply server account deletion;
- a valid session must not imply authorization for a scope;
- a deletion request must not be presented as final deletion.

## 4. Required journeys

### 4.1 Signup and onboarding

1. User signs up or returns from a provider callback.
2. The system resolves exactly one internal account for the provider subject.
3. The user is sent to onboarding until name and primary capacity are valid.
4. The server records onboarding completion atomically with the required
   profile facts.
5. The user enters the personal product surface.
6. Role-specific relationship actions are offered only after personal entry.

Failure behavior: expired callback, duplicate submission, unavailable API,
invalid role, and interrupted onboarding each return a recoverable state. None
may strand the user in a false `active` state.

### 4.2 Mobile guest conversion

1. Guest work is tagged with a guest lease/ownership boundary.
2. Signup creates or resolves the durable account.
3. Eligible user-owned guest records are transferred or reconciled
   idempotently.
4. Ineligible, entity-owned, or ambiguous records remain local and are clearly
   reported to the user.
5. A retry cannot duplicate the transfer.

### 4.3 Principal school creation

1. An `active_personal` user chooses to create a school platform.
2. The server creates the school entity and an owner relationship atomically.
3. The resulting scope is server-derived and becomes `active_scoped` only after
   the relationship is confirmed.
4. Failure leaves either no school or a recoverable, idempotently retryable
   creation request; it must not create an ownerless partial school.

### 4.4 Teacher class creation or joining

1. An onboarded teacher chooses create-class or join-class.
2. Create-class requires an authorized school scope and creates the class plus
   teacher relationship together.
3. Join-class requires an invitation or official join workflow; submitted IDs
   are lookup inputs, not authority.
4. The relationship is visible with a truthful pending/accepted/denied state.
5. Classroom tasks become available only after accepted membership is returned
   by the server.

### 4.5 Session lifecycle

- Initial load resolves the current session and account state.
- Auth state changes, refresh, expiry, sign-out, and cross-tab changes are
  observed and reduce to the same state machine.
- A stale session may read neither protected data nor mutate it.
- Retry after reauthentication returns the user to the intended safe point when
  possible, without replaying a non-idempotent mutation blindly.

### 4.6 Deletion request

1. User submits a deletion request.
2. Server returns a request receipt and current status.
3. The account shows status, required next step, failure/retry state, and
   cancellation where policy permits.
4. Personal records, school-owned records, classroom records, safeguarding
   records, and derived analytics follow their domain policy.
5. Only approved server completion enters `deleted`.

## 5. Data custody contract

Every durable record must be classified before implementation:

| Class | Examples | Default deletion behavior |
|---|---|---|
| User-owned personal | profile preferences, personal reflection, wellbeing entries | Remove or anonymize with the account, subject to policy and export needs |
| Relationship-owned | school membership, class membership, circle membership | Remove membership; preserve entity and other members’ records |
| Entity-owned | school, class, attendance, institutional resources | Preserve, transfer, or anonymize according to entity policy |
| Shared/community | posts, comments, moderation events, circle records | Preserve safety/audit obligations; anonymize author where required |
| Derived/analytics | counters, recommendations, aggregates | Recompute, anonymize, or retain only under documented policy |
| Local/temporary | mobile guest cache, Explore data, drafts | Clear according to lease/device policy; never imply server deletion |

The classification must include source of truth, dependent actors, retention,
export, deletion/anonymization, synchronization, retry, and audit behavior.

## 6. Authorization rule

The server derives authorization from the authenticated subject, internal
account, accepted relationships, selected scope, capability policy, and
entitlement. The client may request a scope or entity, but it cannot assert
membership or capacity. Every protected mutation must be idempotent or carry a
request key sufficient to prevent duplicate durable effects.

## 7. Acceptance gate before implementation

This contract is ready for implementation only when the following are recorded:

- one canonical identity/onboarding API seam;
- one account-state representation shared by web and mobile;
- one relationship model for school/class membership;
- one custody matrix for the first Self, Workspace, Library, and Community
  slices;
- characterization coverage for existing behavior before compatibility
  changes;
- G0/G1 contract evidence, followed by applicable browser/device evidence;
- explicit migration decisions for legacy onboarding and duplicate adapters.

Until then, existing code remains compatibility surface, not permission to
delete or silently replace behavior.

