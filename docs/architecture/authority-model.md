---
title: "Authority Model"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [architecture, authority, rebac, cedar, bonds, capacity, delegation, device-trust, minors, reference]
---

# Authority Model

How Gurudevi decides whether an action is allowed. One model for every channel: the
app, the web, bots, agents, workers and operators all pass through it.

Related: [platform map](platform-map.md), [data governance](data-governance-and-records.md),
[module structure](module-structure.md#cedar-as-modules-too), the runtime admission
detail in [authority and durability](../../apps/sanctuary-api/docs/architecture/api-foundations/authority-and-durability.md),
and the identity history in [authentication and sovereign identity](authentication-and-sovereign-identity.md).

## The question

Every call asks one question:

> May **this account**, acting **through this bond** in **this capacity**, from **this
> device**, possibly **via this agent or channel**, do **this action** to **this fact**,
> given the **grants and consent** that apply?

Cedar answers on the server. The answer is permit or deny, with the policy that
decided. The client may hide what it expects to be denied; it never decides.

## The parts

| Part | Meaning | Owned by |
| --- | --- | --- |
| Account | One canonical person (`public.users.id`, UUIDv8) for a whole life | Identity |
| Credential binding | A way to sign in (Supabase subject, OAuth, passkey); many per account | Identity |
| Entity | Something a person can be bonded to: school, classroom, tutoring institute, family, group | The owning domain |
| Bond | A relationship between an account and an entity, with a capacity and a lifecycle | Authority |
| Capacity | What the person is in that bond: student, teacher, guardian, principal, staff, member … | Authority (the list is a decision record, not a code enum that grows ad hoc) |
| Active scope | The bond the person is acting through right now | Authority, chosen by the person |
| Grant | Permission to one fact, given by its owner (sharing) | Consent and privacy |
| Device | A registered device with a trust level | Runtime (devices) |
| Delegation | Permission given by a person to an agent or channel to act for them, with limits | Consent and privacy |

### Bond lifecycle

`invited → active → suspended → ended (kept)`. An ended bond grants nothing new, but the
records made through it keep pointing at it, so history stays attributable. Ending a
bond never deletes records.

A person can hold many bonds at once (a teacher at one school who is a guardian at
another). One is active per request. A **primary capacity** chosen at onboarding shapes
the default experience; it grants nothing by itself.

### Citizenship is part of every bond

Citizenship answers "under what law am I here?" and is a property **of each bond**, not of
the account:

| Citizenship | Bond | Meaning |
| --- | --- | --- |
| `FIRST_CLASS` | Institutional: a school or classroom | Bonded institutional citizen |
| `SECOND_CLASS` | Personal: the person's own studio or personal classroom | Signed-up, self-governing citizen |
| `THIRD_CLASS` | None, or a platform or guest bond | Explorer; baseline reads and local-only work |

**Owner decision (2026-11-06): it is stored explicitly on each bond**, set by the server when
the bond is created, and never derived later, so it can't drift. Today it is still derived
(`resolveBondCitizenship`), `bonds` has no column and `users.citizenship` still exists; the
move is listed in the [Arrive journey](arrive-journey.md). A teacher at a school who also keeps a personal studio has
two bonds and two citizenships, and the active bond decides which applies. This follows the
owner-approved plan of 2026-11-01, *Canonical Architecture: ReBAC Covenant, Semantic
Citizenship in Bonds, and Omnichannel Doors*. That plan was written in an Antigravity
session (`789f6735`) and isn't yet in the repository.

The same plan orders the checks as five independent filters instead of one combined
state space: assurance (does this channel and device meet the action's level?) →
ReBAC and Cedar → entitlement → channel affordance (is the capability viable on this
door?) → presentation. Device trust is an attribute of the door the request came
through, never a global barrier that blocks bots or agents.

## Order of evaluation

1. **Authenticate**: a verified session gives the account. No account, no further
   checks (except public queries).
2. **Resolve the active bond**: the bond the request names must be the account's own
   and `active`.
3. **Collect context**: device trust, channel, delegation (if an agent acts), grants on
   the target, age and guardian facts if minors are involved.
4. **Decide with Cedar**: the action is the capability name; the resource is the
   fact. Default deny.
5. **Scope the data**: queries are filtered to what was permitted; commands check again
   inside their transaction for facts that may have changed.
6. **Audit**: the decision and its inputs (identifiers, not content) go to the audit
   trail. Denials are audited too.

## Agents and delegation

The [channel admission model](channel-admission-model.md) has the full set of callers, including
short-lived, non-destructive ephemeral workers, which are a separate case with their own limits.

- An agent acts **for** a person through a delegation grant: which capabilities, on
  which entities, until when, with which limits.
- An agent's authority is the **intersection** of the person's authority and the
  delegation. It is never more.
- Risky capabilities (sending to many people, changing grades, money, anything about
  minors) need the person's **approval** per action. The agent proposes; the person
  confirms in the app.
- Anything an agent reads (a message, a web page, a document) is data, never
  instructions that widen its authority. See
  [security and AI threat model](security-and-ai-threat-model.md#ai-and-agents).

## Device trust

Trust levels are an owner decision; a starting point:

| Level | Example | Effect |
| --- | --- | --- |
| Personal, verified | The person's own phone, paired | Full use of their authority |
| Personal, unverified | A new browser | Sensitive actions need re-verification |
| Shared | A school office PC, a classroom tablet | No remembered sessions; sensitive records hidden unless re-verified |
| Unknown | No device record | Public and low-risk actions only |

## Minors

- Age and guardian relationships are facts in authority.
- Policies can require guardian consent for a capability or a data class.
- At coming of age, guardian bonds change by policy and the person gains control of
  their own consent.

## Decisions offline: the server decides, the phone carries the answer

Cedar runs on the server. Whether the phone could run it is unconfirmed: a
[Callstack event page](https://www.callstack.com/events/react-native-0-84-and-other-news)
says React Native 0.84 brought WebAssembly support with Hermes V1, but the
[official 0.84 release post](https://reactnative.dev/blog/2026/02/11/react-native-0.84)
doesn't mention it, and the Hermes binary for our React Native 0.88 is fetched at build
time, so it can't be checked from the source tree (checked 2026-11-02). The design
doesn't depend on the answer, and the phone doesn't need Cedar. Running policies on the
device would also put policy logic, and the attributes it needs, on a device we don't
control. The design already in this repository splits the job the standard way:

| Role | Standard name | Where | What it does |
| --- | --- | --- | --- |
| Decides | Policy decision point (PDP) | API, Cedar | Evaluates policies against bonds, grants and facts |
| Carries decisions offline | Decision snapshot | Issued by the API, synced to the device | A signed (Ed25519), expiring, policy-versioned list of what the active bond may do |
| Enforces for the UI and offline queueing | Advisory enforcement point (PEP) | Client: `sanctuaryFeature` reading `useCedarDecisionStore` | Shows or hides actions and lets the person queue writes offline |
| Enforces for real | Authoritative enforcement point | API, on every command | Re-evaluates with Cedar when the command arrives, with current bonds |

So an offline teacher is never blocked by the network: the snapshot says "this bond may
record attendance", the write is queued, and when it reaches the server Cedar decides
again. If the bond ended in the meantime, the server denies and the device shows why
(see [local-first writes](../../apps/sanctuary-api/docs/architecture/api-foundations/local-first-writes-and-sync.md)).

Rules for the snapshot:

- One per account and active bond, signed by the server, with an expiry (24 hours today)
  and the policy version it was computed with. The client rejects it if the signature,
  the bond, the policy version or the expiry doesn't match. It fails closed.
- It is advisory. It never authorizes anything on the server.
- It is coarse: it answers per resource type and action, not per individual record.
  Record-level decisions happen on the server. Cedar's partial evaluation
  (`isAuthorizedPartial`) can make it finer later if offline screens need it.
- Web uses the same snapshot path as mobile, even though browsers can run WebAssembly,
  so both platforms behave the same.

## The client gate: `sanctuaryFeature`

`packages/core/src/logic/permissions/sanctuaryFeature.ts` holds the mental model for what
a person can do in the app. It checks, in order:

1. **Ready**: is the access context loaded? Before that, only local-only writes and safe
   baseline reads pass.
2. **Platform**: is the feature supported on this platform?
3. **Citizenship**: does the person's Sanctuary-level bond meet the required class?
4. **Cedar**: does the decision snapshot permit this action? This is the security
   boundary, so it comes before commercial reasons.
5. **Entitlement**: has the person or institution paid for it? This never grants
   authorization.
6. **Lifecycle and flags**: is the feature live and enabled?

Each failure has a typed reason, so the UI can explain why. This stays as the client's
presentation and offline gate. On the server, `authority.decide` covers steps 3 and 4,
the entitlements module covers step 5, and release flags cover step 6. `usePermissions`,
the older overlapping hook, was removed on 2026-11-01 at the owner's instruction.

## Authentication, authorization and onboarding

In domain-driven design terms, identity and authority are **generic subdomains**: every
product needs them, and they hold no education meaning. Gurudevi's **core domains** are
Wellbeing, Learning and the others. That is why identity and authority are platform
modules, built first and shared by all.

- **Authentication** (identity): proving who you are. Sign-up creates the account; sign-in
  binds a credential to it.
- **Authorization** (authority): deciding what you may do, through bonds and Cedar.
- **Onboarding** is neither. It is a **journey** that composes capabilities from several
  owners: identity (create the account), authority (the Sanctuary citizenship bond, the
  primary capacity, joining an institution by invite, which creates a bond), consent
  (terms, guardian consent for a minor), journey (profile setup) and devices (pairing
  this device). It owns no facts. Each step is a command on its owner, so a half-finished
  onboarding leaves every owner consistent.

## Brownfield inventory (2026-11-02)

What exists and its state, so layer 2 extends rather than replaces:

| Piece | Where | State |
| --- | --- | --- |
| Cedar engine and role policies | `packages/policies/src/engine/evaluator.ts`, `src/policies/**` | Working; role-shaped, single capacity per principal |
| Snapshot generator | `packages/policies/src/snapshot/generator.ts` | Working; Ed25519; coarse, per type and action |
| Snapshot issuer on the server | `apps/sanctuary-api/src/authorization/permissionSnapshot.service.ts` | **Removed on 30 Oct** (it is on the reset's removal list; per the owner, it went because of its Java-style `*.service.ts` name, not its behaviour). Still in HEAD. **Restored 2026-11-02** as `issueSnapshot` in `security.ts`, exposed as `authority.refreshSnapshot` in `/api/v1` |
| Snapshot storage and sync | `permission_snapshots` table (migrations `20260726000000`, `20260726000001`), PowerSync schema | Present |
| Client snapshot reader | `packages/core/src/store/useCedarDecisionStore.ts` | Present; verifies signature, bond, policy version, expiry |
| Client gate | `sanctuaryFeature.ts`, `hooks/useSanctuaryFeature.ts` | Present (uncommitted edits) |
| Scope switching | `store/scopeSessionCoordinator.ts`, `providers/CapabilityHydrationProvider.tsx` | Present |
| Bonds listing | `identity.scopes` in `/api/v1` | Built |
| Default-deny domain namespaces | `packages/policies/src/modules/*.cedarschema` | Skeleton; `platform.cedarschema` declares `Platform::Account` and `Platform::Bond` |
| Live authority boundary | `apps/sanctuary-api/src/security/security.ts` | `resolveScope` re-checks the bond live and under lock in transactions; `authorize` (role-shaped engine) unchanged; **`authorizeCapability`** (domain namespaces) added 2026-11-02; **`assertCommandAuthority`** and **`authorizeCommand`** bridge `executeAccountCommand` to either authority |
| Domain-namespaced engine | `packages/policies/src/modules/engine.ts` | Added 2026-11-02: assembles and validates fragments and policies at startup, denies by default, fails closed on errors |

## Layer 2 plan

Status on 2026-11-02: steps 1, 2, 3 and 5 are built; steps 4 and 6 and the
smaller items are listed in the
[foundation follow-ups](../../apps/sanctuary-api/docs/current_progress/2026-11-02-foundation-follow-ups.md).

1. **The decision on the server**: built as `authorizeCapability` in `security.ts`, beside
   the existing `authorize`. It takes a verified scope and a capability named
   `<Namespace>::<capability>`, re-reads the bond live (under lock inside a transaction),
   resolves the target fact, and asks the domain-namespaced engine. Default deny; an
   unknown namespace or an evaluation error fails closed as unavailable; the decision is
   returned so it can be audited once layer 5 exists. In addition, `executeAccountCommand`
   accepts `CommandAuthority` (either a domain capability decided by `authorizeCapability`
   or a legacy role policy decided by `authorize`), enforced pre-flight by `assertCommandAuthority`
   and executed within the command transaction by `authorizeCommand`. Wiring every domain procedure
   through it is a follow-up for the first admitted module.
2. **Snapshot issuance**: built as `authority.refreshSnapshot` (a command, since it writes
   a row). `issueSnapshot` re-checks the identity and the bond under lock in one
   transaction, reads the policy version, signs with the existing generator and upserts
   the `permission_snapshots` row (`<account>:<bond>`) that PowerSync already syncs. It
   returns only the times and policy version; the device uses the synced, verified row.
   The signing key is `SNAPSHOT_SIGNING_PRIVATE_KEY` (Ed25519, PKCS#8 PEM, from Doppler),
   checked at startup and required in production.
3. **Bonds as entities**: built. The principal is `Platform::Account`; the active bond is a
   `Platform::Bond` entity (capacity, citizenship, entity type and id) passed as
   `context.bond`. Several bonds per person stop being impossible.
4. **Move policies into domain namespaces one subdomain at a time.** Each existing role
   file is translated as its rules are needed. The old set keeps running until a domain's
   namespace covers it (the strangler-fig pattern), so nothing that works stops working.
5. **Citizenship on each bond**: built. `ActiveScope.citizenship` is derived with the same
   `resolveBondCitizenship` the client uses, and policies read `context.bond.citizenship`.
6. **Scenario tests through the real host and Postgres**: active bond permits; ended or
   suspended bond denies; another school's record denies; expired, wrongly signed and
   old-policy snapshots are rejected by the client reader; a write queued before a bond
   ended is denied on arrival.

Decisions for the owner before step 2: snapshot lifetime (24 hours today), where the
signing key lives and how it rotates (Doppler), and whether the snapshot table keeps its
current shape or gains a version field.

## State of the code (2026-11-02)

- Identity: built. `identity.session` and `identity.scopes` in `/api/v1`.
  `identity.scopes` lists bonds with an admission state.
- Cedar: policies exist in `packages/policies` but are organised by role, with a
  single `capacity` and `school_id` on the principal and generic actions. The API calls
  them through `security.authorize` for legacy account commands (`platform.ts`). Domain
  capabilities go through `authorizeCapability` and the domain namespaces, which permit
  nothing yet. `executeAccountCommand` accepts `CommandAuthority` (either a domain capability
  or a role policy, strictly rejecting both or neither). Moving the role rules into domain
  namespaces is described in [module structure](module-structure.md#cedar-as-modules-too).
- Grants, delegation and device trust levels: not built.
- The older client-side permission design
  ([sanctuary permission architecture](gurudevi-sanctuary-permission-architecture.md))
  covers UI presentation gates. It is superseded for authorization decisions by this
  model; UI gates may stay for presentation only.
