---
title: "Gurudevi Authorization, Citizenship, Feature, and Pricing Parity Audit"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, parity, authorization, citizenship, capacity, feature-flags, entitlements, pricing]
---

# Authorization, Citizenship, Feature, and Pricing Parity Audit

## Purpose

This is a cross-cutting parity review. These concepts cannot be validated by
checking one table at a time because they combine identity, relationship scope,
commercial access, rollout, and server authorization.

## Authority map

| Concept | Current intended authority | Database representation | Runtime representation | Decision |
| --- | --- | --- | --- | --- |
| Person identity | `users` + auth mapping | `users`, `auth_identities` | internal user ID | Keep separate from device and membership |
| Citizenship | verified identity state | `users.citizenship` | `FIRST_CLASS`, `SECOND_CLASS`, `THIRD_CLASS` | `WANDERER` is legacy input only; normalize it |
| Capacity/role | active relationship | `bonds.capacity` | active bond capacity | Treat `users.capacity` as compatibility projection only |
| Feature existence | AppCatalog/package registries | none required | static manifest | Not a database concern |
| Feature rollout | GrowthBook | external control plane | lifecycle/GrowthBook adapter | Do not use `feature_flags` as a second authority |
| Individual pricing | user plan projection | `users.pricing_tier` | `FREE`, `PRO`, `INSTITUTIONAL` | Individual scope only |
| Scoped entitlement | server grant authority | `user_entitlement_grants` | bond/entity/add-on grants | Authority for institution-scoped access |
| Pricing feature catalog | tier → modules | `pricing_manifest` | local PowerSync/Drizzle cache + server reads | Add a read-only ZenStack model |
| Action authorization | Cedar/server policy | policy snapshots and bonds | Cedar + server reauthorization | Independent from rollout and pricing |

## Findings

### 1. Citizenship is conceptually clear but has legacy residue

The runtime and recent migrations define:

- anonymous authenticated onboarding → `THIRD_CLASS`;
- verified personal onboarding → `SECOND_CLASS`;
- official school bond claim/founder flow → `FIRST_CLASS`;
- persisted `WANDERER` → legacy alias normalized to `THIRD_CLASS`.

The ZModel field remains a free-form `String`, so database checks do not prevent
future invalid values. We should add a constraint only after confirming all live
rows and migration history; do not introduce an enum migration during this batch.

### 2. Capacity has an authority leak

The architecture documents correctly say that `bonds.capacity` and the selected
active bond are authoritative. However, `FlowResolver` still reads
`users.capacity` to route a QR flow. That can be wrong for a multi-bond user whose
active perspective is different from the compatibility projection. This is a
follow-up code correction: resolve capacity from the verified active bond.

### 3. Feature flags have a deliberate legacy table

`FeatureFlag` and `feature_flags` still exist in ZModel and the database, but the
current runtime uses AppCatalog for capability identity and GrowthBook for
rollout. The repository already has a retirement runbook requiring production
row/write evidence before removal. Keep the model for now as a documented legacy
object; do not populate it or make it a second rollout authority.

### 4. Entitlements are split correctly, but the split must stay explicit

`users.pricing_tier` is the individual plan projection. Institutional access is
created through `user_entitlement_grants` during official school creation or invite
claim. The server resolves scoped grants separately from the individual tier.

The live migrations already provide the correct explicit mutation authority:
`create_school_founder_bond` and `revoke_school_bond` are `SECURITY DEFINER`
RPCs that atomically update the bond, citizenship projection, and entitlement.
The Sanctuary API also contains duplicate ORM handlers that write these objects
independently. They are not currently proven to satisfy the same policy and
transaction contract. The next implementation step is to remove that split by
making the handlers thin RPC proxies or retiring them. The mobile client must
not write grants directly.

### 5. `pricing_manifest` is active and now modeled in ZenStack

The table is created by a live migration, seeded with the three pricing tiers, read
by the server, and synchronized into the local PowerSync/Drizzle schema. It is now
modeled as a read-only ZenStack contract. Its `features` JSONB should remain a
typed/validated module list at the application boundary until the database column
is migrated to a normalized relation.

### 6. Legacy pricing tables are not current authorities

The live database still contains `tiers`, `tier_features`, and
`pricing_subscriptions`, but current runtime search found no active reads or
writes for them. Their historical schemas also conflict with one another. They
remain compatibility objects until live row/write evidence supports retirement;
they should not be added to ZenStack merely because they exist in the database.

See [Pricing Table Authority Review](2026-08-10-pricing-table-authority-review.md).

### 7. Analytics bug corrected

GrowthBook exposure metadata previously emitted `INSTITUTIONAL` personal pricing
as `FREE`. The adapter now preserves `PRO` and `INSTITUTIONAL` and defaults only
unknown values to `FREE`.

## Clarifications to preserve

1. Citizenship answers “how deeply registered/verified is this person?”
2. Capacity answers “what role does this person hold in the selected entity?”
3. Pricing answers “what individual commercial plan applies?”
4. Entitlement answers “what scoped commercial grant applies?”
5. GrowthBook answers “is this capability rolled out to this audience now?”
6. Cedar/ZenStack answers “is this action/data access authorized?”

None of these fields should be used as a substitute for another dimension.

## Next batch

1. Review the QR/flow capacity correction with route tests; it now uses the
   identity highway's active bond instead of `users.capacity`.
2. Remove the duplicate founder entitlement mutation path; keep the database RPC
   as the sole atomic authority and add an integration test around it.
3. Capture live row counts and recent-write evidence for the legacy pricing
   tables before planning retirement.
4. Add database checks for citizenship/tier values only after live-row evidence.
