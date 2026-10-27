---
title: "Gurudevi Identity, App, Device, and Account Lifecycle"
status: "active"
created: 2026-07-26
updated: 2026-10-23
author: "Naveen"
tags: [architecture, identity, app, device, onboarding, citizenship, entitlement, offline-first]
---

# Gurudevi Identity, App, Device, and Account Lifecycle

This is the authoritative product and architecture contract for the
relationship between the Gurudevi app, users, devices, sessions, onboarding,
citizenship, bonds, and entitlements.

It supersedes the earlier draft permission model that treated `WANDERER` as a
separate permission class. `WANDERER` is now a legacy storage alias only.

## 1. The three real-world objects

```text
Gurudevi App / Sanctuary
  └── User(s)
        └── Device installation(s)
```

The rules are:

- The Gurudevi app is the sanctuary/product boundary.
- Many users can belong to and use the same app.
- A user belongs to this Gurudevi app, not to a school by default.
- A user may use the app on multiple devices.
- One device installation may host multiple Gurudevi accounts; account
  switching is therefore a first-class operation.
- A device is not an authorization tenant. It is an execution and local-data
  boundary.
- Web and mobile are two app platforms/runtime surfaces of the same sanctuary.

Every local record and cache must be scoped so that one account cannot read
another account's local data:

```text
app_id + device_installation_id + user_id + local_account_id
```

An anonymous local account has a local account ID even before it has a durable
verified user account. Converting it to a durable account must explicitly
migrate or reconcile its eligible local data; it must never accidentally merge
with another account on the same device.

## 2. Session, verification, onboarding, and citizenship are different facts

| Fact | Question answered | Runtime/persistence meaning |
| --- | --- | --- |
| Session | Is there a currently usable auth session/token? | Instantaneous and can expire or fail refresh. |
| Verification/account conversion | Has the person signed up or completed the required email/provider verification? | Durable account fact used to move from Third Class to Second Class. |
| Onboarding | Has the person selected the required name and primary capacity/role? | Persisted product readiness gate. |
| Citizenship | What registration/institutional level does the account have? | Access dimension, not role and not pricing. |
| Bond/perspective | Which entity and capacity is the user acting through? | Authorization scope; users may have many. |
| Entitlement | What commercial or institutional access has been granted, and in which scope? | Scoped grant for an individual account, school, institution, capability, or add-on. |

### Authenticated is instantaneous

Yes: `authenticated` means that the current session is valid now. It is a
runtime condition, not proof that the person is verified, onboarded, or
authorized for a particular operation.

The minimum state vocabulary is:

- `unauthenticated`: no usable Supabase session; public entry only.
- `anonymous`: a usable Supabase anonymous session; local guest journey.
- `authenticated`: a usable non-anonymous session; verification is still a
  separate fact.
- `onboarding_required`: a session exists, but mandatory onboarding is not
  complete.
- `ready`: session exists, onboarding is complete, and the active personal
  perspective is available.

Session expiry or refresh failure can move a previously authenticated account
back to `unauthenticated` without changing its stored citizenship or
onboarding history.

## 3. The two entry roads

### Road A: Guest exploration

The user first attempts Supabase anonymous auth when connectivity is available.
When the request cannot be made or fails, the app creates a versioned,
device-local `local-<uuid-v4>` principal instead. Both are deliberate product
paths, not fake unauthenticated screens. The device-local principal is not an
Auth session, database subject, capability grant, membership, or EdLove ID.

Guest rules:

- An anonymous Auth session or a device-local principal is a valid local
  onboarding identity.
- The user must still complete onboarding before entering the app.
- The user selects the name the app should use and a primary capacity/role.
- The user is `THIRD_CLASS` during this local exploration period.
- Domain data remains local-only while the account is anonymous or
  device-local. Neither may enter ordinary cloud synchronization or server
  domain persistence.
- Anonymous users have no individual pricing plan yet; `FREE` is the default
  individual plan only after a durable account exists. This avoids treating a
  guest as a billable or institutionally entitled subject.
- There is no guest-specific Cedar policy. If local authorization is needed,
  it uses the normal policy vocabulary with the anonymous user's context.
- The guest account has the centrally governed fifteen-day conversion lease
  accepted in the platform [Guest Local-First Lease ADR](../../../../docs/decisions/2026-09-10-guest-local-first-lease.md).
  Code must not independently choose another duration.
- Before the deadline, the app must clearly offer signup or verification and
  explain what happens to local data.
- At expiry, the product must use an explicit policy: restrict new use while
  preserving/exporting eligible local data, or require conversion before
  continuing. Silent deletion is not allowed.

### Road B: Direct account

The user signs up or verifies through email or an approved provider. This is a
non-anonymous account path and establishes `SECOND_CLASS` citizenship. Email
confirmation policy may still restrict which operations are available, but it
must not be confused with whether a durable account exists.

The user still must complete onboarding. Signup or verification alone must not
set `onboarding_completed = true` and must not bypass capacity selection.

```text
valid non-anonymous session
  → SECOND_CLASS account state
  → mandatory onboarding
  → persisted personal bond + primary capacity
  → onboarding_completed = true
  → app entry
```

## 4. Onboarding contract

Onboarding is complete only when all mandatory requirements are true:

1. The user has selected the name the app should use.
2. The user has selected an explicit primary capacity/role.
3. The identity layer has persisted that primary capacity.
4. The initial personal-sanctuary bond exists.
5. `onboarding_completed` is set to `true` only after those facts succeed.

Onboarding does not decide school membership, pricing, or institutional status.
Those are later flows.

The initial active perspective is the personal sanctuary. Later parent,
teacher, student, administrator, or other capacities are additional
bonds/perspectives activated explicitly when needed.

## 5. Citizenship levels

Citizenship is registration depth and institutional standing. It is not a
capacity, role, bond type, entitlement, or feature flag.

| Citizenship | Meaning | Typical persistence |
| --- | --- | --- |
| `THIRD_CLASS` | Anonymous local exploration, or the lowest authenticated registration state. | Local-only for anonymous users. |
| `SECOND_CLASS` | Signed-up or email/provider-verified individual account. | Cloud account and personal data; subject to individual entitlements. |
| `FIRST_CLASS` | Officially and validly joined through an institutional/school pathway. | Institution-owned context; not assumed to be an individual paid subscription. |

`FIRST_CLASS` must be granted by a valid institutional relationship, invitation,
or official school-join workflow. A submitted `schoolId`, a selected capacity,
or a client header is not sufficient.

## 6. School and institutional pathway

The personal sanctuary exists before institutional membership.

```text
personal sanctuary bond
  ├── optional school bond after official joining
  ├── optional classroom bond
  ├── optional community/group bonds
  └── additional capacity perspectives
```

Joining a real school is a relationship transition, not a replacement of the
user's personal sanctuary. The school workflow verifies the official
relationship and creates the appropriate bond. Only that verified transition
can promote the account to `FIRST_CLASS`.

## 7. Entitlement and pricing boundary

Entitlement is commercial access, separate from citizenship and Cedar.

`FREE` is a valid individual default. `PRO` is currently the individual paid
tier. Neither determines citizenship or school membership.

Institutional access is a separate grant, not a replacement for the user's
individual plan. A First Class user may have a Free personal plan and still
receive school capabilities:

```text
individual plan: FREE
school grant:    teacher dashboard and attendance
add-on:          optional personal capability
```

Another First Class user may have `PRO` personally and a different school grant.
The effective entitlement is resolved by scope:

- individual grants apply to personal capabilities;
- school/institution grants apply only inside the corresponding verified bond
  and institutional resource scope;
- add-ons apply only to the account or scope that owns them;
- Cedar still decides whether the active capacity may perform the operation;
- GrowthBook still decides whether the code path is rolled out.

The system must not infer institutional access from `pricing_tier`, and must
not infer `PRO` from `FIRST_CLASS`. A global `users.pricing_tier` field may
remain as a legacy individual-plan projection, but the entitlement authority
must become scoped grants. `INSTITUTIONAL` describes an institutional contract,
not citizenship.

## 8. Device and offline behavior

### Anonymous local account

```text
device installation
  → Supabase anonymous identity + local account
  → local SQLite/PowerSync-compatible local storage
  → no ordinary cloud domain sync
  → conversion deadline
```

The guest road creates a Supabase anonymous identity first. This gives the
system a stable, measurable identity for guest counts, abuse controls, and
conversion without making the guest's domain data cloud-persistent. The
anonymous identity is the auth/measurement link; the local account is the
domain-data boundary.

If Supabase anonymous identity creation is unavailable, the app remains on
public entry and offers retry or direct signup. It must not silently create a
second, untracked identity model and still claim the user is on the guest road.

The anonymous account is device-local for domain data. A second device does
not automatically see it because there is no durable verified account to
synchronize against.

### Second/First Class account

```text
verified user account
  → device-scoped local database
  → server-authoritative identity, entitlement, and authorization
  → PowerSync/local snapshots for offline continuity
```

Multiple devices can use the same durable account. Each device keeps its own
local database and receives only data authorized for that user and active
perspective.

Local Cedar/snapshots improve responsiveness and offline continuity. They do
not make a stale local snapshot authoritative for server-backed operations.

## 9. Authorization and feature-management consequence

The complete capability decision intersects independent dimensions:

```text
platform
  ∧ citizenship
  ∧ onboarding readiness
  ∧ active bond / Cedar authorization
  ∧ applicable entitlement
  ∧ GrowthBook rollout
```

- AppCatalog says what capability exists.
- Onboarding says whether the user may enter the app.
- Citizenship says registration/institutional level.
- Bonds and Cedar say what the user may do in the active entity context.
- Entitlement says what the account or active institution has commercially or
  contractually granted in the relevant scope.
- GrowthBook says whether code is operationally rolled out.

Feature flags must never encode guest status, verification, capacity, school
membership, or pricing.

## 10. Required implementation invariants

- Never use `authenticated` as shorthand for verified, onboarded, or permitted.
- Never use `guest` as a role, capacity, citizenship, or Cedar policy class.
- Never use `WANDERER` for new writes; normalize it to `THIRD_CLASS`.
- Never infer First Class from `schoolId`, `capacity`, or client input.
- Never select an active bond by row order or hidden fallback.
- Never sync anonymous domain data as if it belonged to a durable account.
- Never mark onboarding complete before primary capacity and personal bond
  persistence succeeds.
- Never place pricing tier or entitlement semantics inside Cedar policy
  attributes.
- Always scope local storage by app, device installation, and user/local
  account.

## 11. Closure plan

The model is not fully implemented until these seams are closed:

| Priority | Closure | Required outcome |
| --- | --- | --- |
| P0 | Offline guest entry | A guest journey attempts Supabase anonymous auth when online, but a failed or unavailable request creates one persisted device-local principal and continues through local onboarding without fabricating an Auth session. |
| P0 | Guest local boundary | Anonymous and device-local onboarding use scoped local domain-account storage only; neither identity may create ordinary cloud domain rows or enter normal PowerSync sync. |
| P0 | Conversion transaction | New credentials retain the anonymous subject through provider linking. Existing-account sign-in creates a durable, explicit transfer/discard decision. Remote migration remains disabled until Sanctuary owns eligible-data policy, target authorization, conflict resolution, and receipt semantics. |
| P0 | Entry state machine | Anonymous and durable sessions both route through onboarding; app entry requires persisted primary capacity, personal bond, and `onboarding_completed = true`. |
| P0 | Active perspective | The initial personal bond is selected explicitly; later bond switching is persisted and every server request verifies the selected bond. |
| P1 | School projection cleanup | Keep `users.school_id` only as a nullable compatibility/resource projection while bonds become the authority; remove it from identity and authorization predicates incrementally. |
| P1 | Institutional promotion | Only the verified school/institution join workflow can create the institutional bond and promote citizenship to `FIRST_CLASS`. |
| P1 | Entitlement applicability | `FREE`/`PRO` remain valid individual plans; school/institution grants are separate scoped entitlements and may apply to a First Class user with either plan. |
| P1 | Official invite claim | Generic school discovery never mutates identity; the authenticated invite-claim transaction validates the code, creates the school bond, promotes citizenship, and grants only school-scoped access. |
| P1 | Default normalization | New records default to `THIRD_CLASS`, `is_anonymous = false` for durable users, `onboarding_completed = false`, null primary capacity, and null school projection until a valid relationship exists. |
| P1 | Guest expiry | Enforce the centrally governed fifteen-day lease, its expiry handling, local-data preservation, and tests. Do not choose the duration in scattered code. |
| P2 | Terminology migration | Replace active `WANDERER`, `guest capacity`, `guest bond`, `school_id as identity`, and `institutional pricing as citizenship` references; preserve only explicit legacy adapters/migrations. |
| P2 | Multi-account isolation | Verify local storage, session registry, PowerSync database, authorization snapshot, and active perspective are all scoped by app/device/account. |
| P2 | Quality gate | Add parity checks and tests for both entry roads, conversion, expiry, school promotion, entitlement applicability, account switching, and offline isolation. |

### Current implementation disposition

- Supabase anonymous sign-in is enabled in the local project configuration.
  The Welcome route attempts it when online and falls back to one persisted
  device-local principal when offline or unavailable.
- The AuthManager reuses an anonymous session and does not create a guest Cedar
  policy. A device-local guest does not invoke AuthManager at all.
- Anonymous and device-local onboarding use a local identity/bond record and
  do not call the durable onboarding API. The local route gate admits a
  completed device-local guest without mounting cloud sync or capability
  services.
- A credential link preserves its anonymous subject. Existing-account sign-in
  records an explicit source/target conversion ledger; its UI offers keep-local
  or confirmed discard. Remote migration fails closed until an authorized,
  record-level Sanctuary contract exists.
- Anonymous and device-local guests are deliberately excluded from Cedar
  snapshot loading, entitlement loading, ordinary PowerSync replication, and
  EdLove assignment. The Supabase anonymous identity remains the conversion,
  abuse-control, and measurement link; it is not a durable domain account.
- Scoped entitlement authority is now represented by
  `user_entitlement_grants`. The legacy `users.pricing_tier` value remains the
  individual-plan compatibility projection; active bond/entity features must
  declare `active_bond` or `active_entity` entitlement scope.
- Existing `school_id` columns and old RLS policies cannot be deleted in one
  pass because many domain tables still reference them. They require a staged
  bond-authority migration.

## 12. Guest lease authority

The accepted [Guest Local-First Lease ADR](../../../../docs/decisions/2026-09-10-guest-local-first-lease.md)
sets the centrally governed guest conversion window to fifteen days. Future
changes require a new approved decision; implementation must not silently
choose a different duration.
