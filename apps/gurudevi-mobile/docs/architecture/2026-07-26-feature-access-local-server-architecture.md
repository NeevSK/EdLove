---
title: "Feature Access Architecture: Local and Server Enforcement"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [feature-lifecycle, authorization, cedar, entitlements, offline, architecture]
---

# Feature Access Architecture: Local and Server Enforcement

This document defines how Gurudevi determines whether a capability may be rendered or executed. It complements the [feature lifecycle guide](./feature-lifecycle-management.md) and [gate-order ADR](../decisions/005-feature-gate-order-and-context-ownership.md).

## Product identity invariant

Gurudevi has three relevant runtime states: no Supabase session, a valid
Supabase anonymous session, and a valid non-anonymous session. Anonymous
sessions are real onboarding identities, not a separate Cedar policy class.
Both anonymous and verified users must select a primary capacity and persist an
initial personal-sanctuary bond before entering the main application. If that
onboarding contract is incomplete, bootstrap routes to onboarding.

Session validity, provider/email verification, onboarding completion,
citizenship, and active capacity are separate facts. A valid authenticated
session is not automatically a verified user, and an onboarded anonymous user
does not receive a guest-specific Cedar policy.

## Entity and bond model

The user's personal sanctuary is the root product concept, not a school. The
existing `PERSONAL_CLASSROOM` bond is retained as a compatibility value for
persisted onboarding data, but it represents the user's personal sanctuary
perspective. Schools, classrooms, communities, groups, and future workspaces
are additional bonded entities.

```text
User ──[bond: capacity + relationship]──> Entity
  └── personal sanctuary bond
        ├── personal workspace/classroom
        ├── school bonds
        ├── community/group bonds
        └── other relationships
```

`activeBondId` is the authorization scope key. `school_id` is optional derived
resource context and is populated only for a school bond or school-owned
resource. It must never be used as the user's identity scope.

## Decision dimensions

The final capability decision is the intersection of independent dimensions:

`platform ∧ citizenship ∧ entitlement ∧ Cedar authorization ∧ lifecycle/rollout`

These dimensions are loaded in parallel where possible; they do not form a serial network dependency.

| Dimension | Authority | Local use | Server use |
| --- | --- | --- | --- |
| Capability identity | AppCatalog | filter what is declared | route/handler contract |
| Platform | runtime platform | immediate filter | route deployment contract |
| Citizenship | identity/profile | early UI filter | trusted identity input |
| Active capacity | active bond | Cedar context selector | derive from verified bond; never trust a role header |
| Subscription/add-ons | Entitlement port | cached UI prefilter | authoritative commercial check |
| Authorization | Cedar | verified local snapshot | authoritative request decision |
| Rollout | GrowthBook | local evaluation/cache | server route control where required |

## Bootstrap sequence

```text
static catalog/platform
  → valid Supabase session (anonymous or non-anonymous)
  → onboarding state and persisted active personal bond
      → missing active bond: capacity onboarding, no app entry
  → Cedar snapshot + entitlement snapshot in parallel
  → GrowthBook evaluation
  → capability decision
  → UI presentation or operation
```

The client may use cheap local dimensions to filter UI before a Cedar lookup. This is an optimization, not an authorization grant. The server repeats the authoritative checks for every protected operation. An absent or ambiguous active-bond selection is not resolved by ordering; the client must select/persist a perspective and the server must verify it.

## Context sent to Cedar

Cedar receives only authorization-relevant context:

- valid Supabase principal ID (anonymous or non-anonymous);
- verified active bond/capacity;
- relevant tenant, school, classroom, and relationship attributes;
- requested action and subject/resource.

Platform support, GrowthBook rollout, and UI lifecycle presentation remain outside Cedar. Entitlement may be combined with the final access predicate or supplied as a trusted commercial claim, but billing remains owned by the entitlement authority.

## Policy source-of-truth boundary

`packages/schema/schema.zmodel` is the ZenStack source of truth for database
models and row/query predicates. Cedar schemas and policies are the source of
truth for action/resource decisions. They intentionally have different jobs,
but their nouns and verbs are governed by the shared authorization registry in
`packages/policies/src/authorizationRegistry.ts`. The authorization parity
audit fails when Cedar, ZenStack, the snapshot generator, or the bond contract
drifts from that vocabulary. Generated ORM files and SQL migrations are
derivatives, not alternate policy sources.

The local decision snapshot is scoped to `userId + activeBondId + activeEntityId + activeEntityType + policyVersion`; the entity fields are signed as part of the snapshot payload. Switching capacity or perspective invalidates the old local decision context and requires a new snapshot or local policy evaluation.

## Entitlement semantics

- `pricingTier` is the individual-plan projection and is hierarchical: `FREE < PRO < INSTITUTIONAL`.
- `activeEntitlements` is the individual plan's set of independent add-ons/capability modules.
- `user_entitlement_grants` carries additional `active_bond`, `active_entity`,
  and `add_on` grants. A requirement must explicitly declare its scope before
  those grants can satisfy it.
- `FREE` and an empty add-on set are valid defaults only for an explicitly resolved durable account state. Anonymous users have no effective pricing plan.
- A First Class user may retain individual FREE/PRO while receiving an institution-scoped grant; citizenship and pricing are never substituted for one another.
- An authenticated account whose entitlement state has never been verified is `unknown`, not verified free.
- Cached entitlement snapshots require freshness/expiry metadata and may be used offline according to policy.

## Local versus server

Local evaluation provides responsive rendering and offline continuity. The
default local path verifies the scoped signed snapshot first. Dynamic local
Cedar evaluation is an explicit opt-in controlled mode, not an implicit grant.
It may return `loading`, `stale`, or `unavailable` presentation states and must
fail closed for protected writes when its authorization snapshot is missing or
expired.

Server evaluation is authoritative for data access, mutations, sync, and paid operations. Client-supplied capacity headers are never authoritative. Missing verified active capacity is rejected rather than replaced with a default role. Generic school discovery cannot promote citizenship; only the official invite-claim transaction creates the school bond and First Class promotion.

The API applies the same rollout gate to contract-registered routes and the separately mounted AI router. AI is also represented as the Cedar `AIAssistant/use_ai` operation and passes through POA, active-capacity, and GrowthBook gates. Route metadata can declare a tier, add-on, and entitlement scope; individual checks use the legacy individual-plan projection while active-bond/entity checks use verified scoped grants, failing closed when the required source is unavailable.

## Remaining infrastructure prerequisite

The local `permission_snapshots` contract is now bound to `userId + activeBondId + activeEntityId + activeEntityType + policyVersion` and the signature covers those fields. The Sanctuary API now exposes an authenticated refresh operation that derives the verified user and active bond, reads the authoritative policy hash, generates a 24-hour Ed25519-signed snapshot, and upserts the server-owned row. Mobile calls it best-effort during authenticated bootstrap; PowerSync remains the delivery path into the local database, and the local evaluator remains the final verifier. Deployment still requires applying the migrations, configuring `SNAPSHOT_SIGNING_PRIVATE_KEY` on the server and the matching public key as `EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY`, seeding/updating `policy_version`, and adding the authenticated PowerSync rule for the user's own active-bond rows. The mobile client must never write these tables. The client also sends the selected active bond through a resolver-backed `X-Active-Bond-Id` header, while the server verifies ownership before deriving Cedar context. If multiple bonds exist, omitting the active-bond header is rejected rather than resolved by arbitrary first-row order.
