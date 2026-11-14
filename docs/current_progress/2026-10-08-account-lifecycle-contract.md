---
title: "Gurudevi Account Lifecycle Contract"
status: "proposed — acceptance checkpoint"
created: 2026-10-08
owners: [product, identity, web, mobile, api, quality]
tags: [account-lifecycle, identity, onboarding, authorization, deletion]
---

# Gurudevi Account Lifecycle Contract

> **Canonical authority (2026-10-23):** This document defines the lifecycle
> detail. Cross-platform credential, provider-linking, AI/channel, and UUID
> policy is governed by
> [`authentication-and-sovereign-identity.md`](../architecture/authentication-and-sovereign-identity.md).

This document is the product-level contract for a trustworthy Gurudevi account.
It is intentionally platform-neutral. Mobile and web may differ in Explore and
guest behavior, but they must not disagree about the durable account state.

This contract is a versioned implementation target, not a claim that all future
product policy is permanent. Later policy changes must update the contract,
characterize affected callers, and preserve a compatibility or migration path.

## 1. Core invariant

One person has one durable Gurudevi account identity, initially independent of
any school. A provider subject, internal account, profile, role/capacity, and
school/class relationships are separate concepts. A client-selected role,
school ID, class ID, or scope never grants authority by itself.

Sanctuary is the whole authenticated Gurudevi app. After onboarding, the user
enters Sanctuary and Self is the primary home tab inside it. Workspace,
Library, and Community are additional domains. Institutional relationships are
later participation contexts; they are not prerequisites for Sanctuary or
Self, and open/public Library and Community experiences must not be
institution-gated.

## 2. Canonical states

| State | Meaning | Can enter main product? | Durable domain writes? |
|---|---|---:|---:|
| `visitor` | No account identity; may inspect public marketing and Explore surfaces. | No | No |
| `guest` | Temporary mobile-local identity that may accumulate eligible personal work. | Limited to guest-capable mobile surfaces | Local only |
| `identity_created` | Provider identity and internal account exist, but required profile/capacity onboarding is incomplete. | No, except onboarding/recovery | Only lifecycle-safe setup writes |
| `onboarding` | Account is actively completing required name and primary role/capacity details. | No, except onboarding | Profile/onboarding writes only |
| `active_personal` | Required onboarding is complete; the user enters Sanctuary and can use Self, Workspace, open Community, and public Library according to capacity and capability. No institution is required. | Yes | Personal/open writes and role-appropriate setup actions allowed by capability |
| `active_scoped` | Active account also has a server-verified school/class/community relationship and selected participation scope. | Yes, with additional scoped capabilities | Entity-scoped reads/writes allowed by authorization |
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
onboarding ──name + primary capacity accepted──> active_personal (Sanctuary)
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
5. The user enters Sanctuary, the whole authenticated app, with Self as the
   primary home tab.
6. Self, Workspace, open Community, and public Library actions are available
   according to capacity and capability without a school or class relationship.
7. Role-specific setup actions are offered from personal entry: a principal
   can create a school, and a teacher can create or join a class.
8. Operations against an existing organization or class require the matching
   server-verified relationship; relationship absence does not block Workspace
   entry.

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

### 4.3 Open Sanctuary domains

An onboarded user can enter Self and Workspace and access the open/public
portions of Community and Library without first creating or joining an
institution. Capacity controls available actions; institutional membership is
required only for operations against an existing scoped entity.
Those domains still enforce their own visibility, safety, contribution, and
moderation rules. “Open” does not mean unauthenticated or unrestricted.

For implementation, “open” means eligible authenticated users may use the
capability without an institutional relationship. “Public” means an anonymous
visitor may read or open the specifically approved resource. “Account-required”
means sign-in is required even when no school or class is required. “Scoped”
means an accepted server-verified relationship is required. Each Library and
Community capability must declare one of these access classes rather than using
one global gate.

### 4.4 Principal school creation

1. An `active_personal` principal chooses to create a school platform.
2. The server creates the school entity and an owner relationship atomically.
3. The resulting scope is server-derived and becomes `active_scoped` only after
   the relationship is confirmed.
4. Failure leaves either no school or a recoverable, idempotently retryable
   creation request; it must not create an ownerless partial school.

### 4.5 Teacher class creation or joining

1. An onboarded teacher enters Workspace and chooses create-class or join-class.
2. Create-class creates the class plus teacher relationship together; creating
   a new class does not require prior membership in an existing class.
3. Join-class requires an invitation or official join workflow; submitted IDs
   are lookup inputs, not authority.
4. The relationship is visible with a truthful pending/accepted/denied state.
5. Classroom tasks become available only after accepted membership is returned
   by the server.

### 4.6 Session lifecycle

- Initial load resolves the current session and account state.
- Auth state changes, refresh, expiry, sign-out, and cross-tab changes are
  observed and reduce to the same state machine.
- A stale session may read neither protected data nor mutate it.
- Retry after reauthentication returns the user to the intended safe point when
  possible, without replaying a non-idempotent mutation blindly.

### 4.7 Deletion request

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
