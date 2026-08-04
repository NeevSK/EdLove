---
title: "Gurudevi Feature Lifecycle Future Work"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [feature-management, growthbook, lifecycle, roadmap]
---

# Feature Lifecycle Future Work

This roadmap follows the current [Feature Lifecycle Management](feature-lifecycle-management.md)
authority. It contains work that remains after the registry, GrowthBook client
sync, lifecycle metadata, stale-flag auditing, and CI enforcement were
implemented.

## Completed foundation

- AppCatalog is the capability registry and SSOT for what exists.
- GrowthBook is the rollout authority; local snapshots are last-known-good
  continuity only.
- Cedar remains authorization authority and scoped entitlements remain
  commercial authority.
- Lifecycle metadata and analytics keys are required for catalog entries.
- Temporary flags have review/removal metadata and retired keys cannot be
  recycled.
- Strict repository lifecycle auditing passes with zero orphan, missing,
  overdue, or stale temporary flags.
- The client and Sanctuary API use the same lifecycle boundary.

## Remaining work

### P0 — Production control-plane readiness

1. Configure a protected GrowthBook management key and complete scoped feature
   inventory access in CI/operator environments.
   **Partially complete (2026-08-04):** the management key is configured in
   `~/.config/growthbook/.env` for operator use. CI secret wiring is still
   outstanding. **Security action:** rotate the admin secret exposed in a session
   transcript and prefer a scoped PAT (see the [rollout record](./2026-08-04-growthbook-cloud-rollout.md)).
2. Run the read-only control-plane inventory audit against the production
   GrowthBook project and resolve any remote/local drift.
   **Complete (2026-08-04):** `audit-growthbook-features.mjs --strict` reports
   zero drift — 12/12 manifest keys match the 12 created flags
   (project `prj_2CcG1JXUJwNGKwwGJEb8s8`). Note: the v1 features endpoint
   paginates at 10, so the audit endpoint must include `?limit=100`.
3. Verify the archive endpoint against the actual GrowthBook deployment and
   perform one approved dry run, followed by one controlled archival operation.
   **Open:** no archive dry run against the real deployment yet.
4. Record operator identity, reason, timestamp, affected key, and result in the
   lifecycle history.

Acceptance evidence: CI can inventory the remote feature set, a retired key is
archived idempotently, and the mobile client cannot access management
credentials.

### P0 — Legacy schema retirement decision

1. Use `FEATURE_LIFECYCLE_DB_URL` only in protected CI to inspect the legacy
   `FeatureFlag` table.
2. Confirm last-write time, row count, production owners, retention needs, and
   backup evidence.
3. If unused, approve the deprecation migration through the schema retirement
   runbook; if still used, document the remaining caller and migration owner.

Acceptance evidence: a signed/recorded production decision exists before any
legacy table or policy is removed.

### P1 — Lifecycle operations

- Add an operator view for review date, removal target, owner, rollout state,
  snapshot freshness, and remote archive state.
- Add an explicit experiment decision record: ship winner, ship loser, or
  retain with a new review date.
- Add a scheduled report for flags approaching review or removal dates.
- Add a migration helper that verifies zero source and catalog references
  before retiring a capability implementation.

### P2 — Product maturity

- Add change history for lifecycle metadata and catalog ownership changes.
- Add release evidence linking app versions to rollout and retirement events.
- Add an automated check that temporary flags have a corresponding product
  decision or experiment record.
- Evaluate whether a separate control-plane audit store is needed; do not add
  one until the current append-only history and GrowthBook audit are proven
  insufficient.

### P1 — Reusable capability-level catalog

The current `AppCatalog` is the correct SSOT for domains and surfaces, but it
is not yet a reusable catalog of every capability/action. The next design slice
should add a capability catalog without turning the registry into a role and
subscription combination matrix.

```text
DomainEntry / AppCatalog
  -> what surface or domain exists

CapabilityCatalog
  -> what reusable capability exists and its declarative requirements

Cedar
  -> whether this active capacity may perform the action

Entitlement policy
  -> whether the required commercial scope/tier/modules are available

GrowthBook
  -> whether this capability is currently rolled out
```

The capability record should contain a stable capability ID, owning package,
parent domain, Cedar action/subject, lifecycle metadata, analytics key, and an
entitlement requirement. It must not contain a list such as `teacher + PRO +
mobile + FIRST_CLASS`.

The entitlement requirement should support:

- `tierAtLeast`;
- `modulesAllOf`;
- `modulesAnyOf`;
- an explicit scope (`individual`, `active_bond`, `active_entity`, or
  `add_on`).

Before implementation, define the Boolean composition contract. For example,
“personal PRO **or** institution grant” requires an expression such as:

```ts
{
  anyOf: [
    { scope: 'individual', tierAtLeast: 'PRO' },
    { scope: 'active_bond', modulesAllOf: ['school_workspace'] },
  ],
}
```

`modulesAnyOf` alone is not enough to express alternatives across entitlement
scopes. This decision must be made before moving existing feature entries or
the evaluator will reproduce the same ambiguity in a new shape.

Acceptance evidence: one reusable capability is declared once, consumed by
multiple surfaces, evaluated through the same Cedar/entitlement/rollout
composition, and covered by a test proving that no role/tier/platform cross
product matrix is required.

## Negative boundaries

This roadmap does not:

- add Supabase as a second rollout evaluator;
- put feature rollout decisions in Cedar or entitlement code;
- archive flags automatically from a mobile client;
- recycle retired flag keys;
- delete historical lifecycle documents;
- make a feature flag a substitute for the capability registry;
- require PostHog for rollout correctness.

## Execution order

```text
production ownership/evidence
  -> control-plane inventory audit
  -> archive dry run
  -> approved archive operation
  -> legacy schema decision
  -> operator UX and scheduled governance
```
