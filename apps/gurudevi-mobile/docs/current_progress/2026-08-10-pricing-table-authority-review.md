---
title: "Pricing Table Authority Review"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, pricing, entitlements, database, zenstack, parity]
---

# Pricing Table Authority Review

## Decision

Do not add `tiers`, `tier_features`, or `pricing_subscriptions` to the
ZenStack domain yet. They are present in the live database, but current code
does not use them as an authorization or billing source. Modeling them now
would make an obsolete design look authoritative and would create a second
pricing path beside the current entitlement architecture.

## Current authority

| Concern | Current authority | Notes |
| --- | --- | --- |
| Individual plan projection | `users.pricing_tier` | `FREE`, `PRO`, `INSTITUTIONAL`; compatibility projection for the user plan |
| Tier feature catalog | `pricing_manifest` | Read-only catalog; seeded and synced to local PowerSync/Drizzle |
| Scoped institutional/add-on access | `user_entitlement_grants` | Bond/entity/add-on grants; server-owned writes |
| Rollout | GrowthBook | Separate from pricing and authorization |
| Action/data authorization | Bonds + Cedar/ZenStack policies | Separate from commercial access |

The authoritative founder-bond mutation is the Supabase `SECURITY DEFINER`
RPC pair `create_school_founder_bond` / `revoke_school_bond`. Those functions
perform the bond, citizenship, compatibility projection, and entitlement
changes as one database transaction. The duplicate Sanctuary API ORM handlers
have been removed; clients use the canonical RPC path.

## Legacy objects found

### `tiers`

The table is referenced by older identity-decoupling migrations and views, but
there are no current TypeScript runtime reads or writes. It should remain an
unmodeled compatibility table until production evidence proves it is unused and
can be retired safely.

### `tier_features`

The old enterprise database guide still presents this table as the feature
matrix authority. That guidance is stale. The runtime uses `pricing_manifest`
for the public tier-to-module catalog and scoped grants for actual eligibility.
The old guide must not be used to design new code.

### `pricing_subscriptions`

The table exists from baseline/archive migrations with incompatible historical
shapes (`plan_name` in one baseline and `tier/status/valid_until` in another).
No current runtime consumer was found. It is not safe to model or write against
it until billing ownership, payment-provider reconciliation, lifecycle status,
and migration history are established.

## Required follow-up

1. Capture live row counts and recent-write evidence for the three legacy tables.
2. Confirm PayHere/webhook writes target `users.pricing_tier` or a different
   billing ledger before changing anything.
3. Add a deprecation/retirement migration only after production evidence and a
   rollback plan.
4. Keep `pricing_manifest` read-only to clients; keep grant mutation on an
   explicit server-owned path.
5. Keep the Sanctuary API contract free of duplicate founder-bond mutations.
   Any future server endpoint must be a thin, tested proxy to the canonical RPC.

## Do not do

- Do not join `users` to `tiers` for new authorization logic.
- Do not reintroduce `tier_features` checks into mobile feature gates.
- Do not treat `pricing_subscriptions` as proof of current entitlement.
- Do not remove the legacy tables in this batch; the database still contains
  compatibility views/migrations that may depend on them.
