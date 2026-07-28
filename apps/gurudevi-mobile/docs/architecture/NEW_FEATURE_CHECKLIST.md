---
title: "New Capability and Feature Flag Checklist"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [feature-lifecycle, onboarding, app-catalog, growthbook]
---

# New Capability and Feature Flag Checklist

Use this checklist for every new user-facing capability. A feature flag is a rollout control, not the capability inventory, authorization system, or billing system.

## 1. Define ownership before coding

- [ ] Identify the owning domain and package registry.
- [ ] Add a stable catalog identity and human-readable purpose.
- [ ] Set lifecycle state, owner, creation date, review date, intended audience, safe default, and cleanup note.
- [ ] Declare mobile/web support and authorization requirements.
- [ ] Declare commercial entitlement requirements, if any.

Use `entitlementTier` for subscription-level access and `entitlementModule` for an independent add-on. When both are present, the subscription tier and the add-on must both be active.

- [ ] Declare entitlement scope explicitly when access comes from a verified
  school/entity (`active_bond`, `active_entity`, or `add_on`). Leave scope
  unset for the individual FREE/PRO plan. Never use `FIRST_CLASS` as a proxy
  for institutional entitlement.

The `AppCatalog` answers what exists. It must not contain user-specific rollout decisions.

## 2. Decide whether a flag is necessary

- [ ] No flag for a stable, fully launched capability.
- [ ] Use a release, beta, or experiment flag only for temporary rollout control.
- [ ] Use an operational flag only for a genuine reliability, safety, or emergency kill switch.
- [ ] Give every temporary flag a removal target and cleanup plan.
- [ ] Never recycle a retired key.

If a GrowthBook key is required, add it to the lifecycle manifest and map it to exactly one catalog owner.

## 3. Implement the access decision

Use the standard protected-operation sequence:

`initialization → authentication → Cedar authorization → entitlement → lifecycle/rollout → operation`

- [ ] Cedar remains authoritative for authorization.
- [ ] Treat `THIRD_CLASS` as the broadest citizenship requirement; it still does not bypass Cedar or commercial access.
- [ ] Entitlements remain authoritative for commercial access.
- [ ] GrowthBook only controls rollout or experimentation.
- [ ] Do not use pricing tier, entitlement, or rollout as a substitute for Cedar.
- [ ] Enforce the same critical feature boundary on the server.
- [ ] Return a generic unavailable result where a detailed denial reason could leak sensitive policy or billing information.

## 4. Implement offline behavior

- [ ] Define the safe default while no snapshot exists.
- [ ] Define behavior for a fresh cached snapshot.
- [ ] Define behavior after the seven-day snapshot freshness window.
- [ ] Keep GrowthBook independent from PowerSync bootstrap.
- [ ] Confirm whether operational controls may continue after prolonged offline use.

## 5. Verify and ship

- [ ] Add catalog and lifecycle-schema tests.
- [ ] Add permitted, unauthorized, unentitled, disabled, stale, and not-initialized tests.
- [ ] Add a test proving Cedar denial takes precedence over entitlement failure.
- [ ] Run `pnpm test:feature-lifecycle`.
- [ ] Run `node scripts/audit-feature-flags.mjs --strict`.
- [ ] Run the GrowthBook control-plane audit when protected credentials are configured.

## 6. Retire deliberately

`freeze callers → decide outcome → remove code branch → verify zero references → archive GrowthBook key → retain history`

Archival is an operator action. Local code removal and remote GrowthBook archival are separate steps.
