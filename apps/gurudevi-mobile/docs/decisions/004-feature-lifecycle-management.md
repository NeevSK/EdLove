---
title: "Feature Lifecycle Management and Rollout Boundaries"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
supersedes: "003-feature-flag-architecture.md"
tags: [feature-lifecycle, app-catalog, growthbook, authorization, entitlements]
---

# Feature Lifecycle Management and Rollout Boundaries

## Decision

Gurudevi manages product capabilities through a lifecycle, not through an unowned collection of boolean flags.

- The owning package registry and assembled `AppCatalog` are the source of truth for what capabilities exist.
- GrowthBook is the only rollout evaluator for cohort, beta, experiment, and temporary release decisions.
- Cedar remains the source of truth for authorization.
- Entitlements remain the source of truth for commercial access.
- Local mobile state stores GrowthBook snapshots for startup and offline continuity; it is not a second control plane.

Persisted rollout snapshots have a seven-day freshness window. Stale beta and experiment values fail closed; stale operational controls retain their last-known value for incident safety and are replaced when GrowthBook refreshes.

## Lifecycle rules

Every catalog entry has an owner, creation date, review date, lifecycle state, support surface, capability requirement, and removal or permanent-control rationale.

Temporary flags are removed after their release, experiment, or beta decision. Retired keys are never recycled. Operational controls may remain only when they represent a real emergency or reliability action and have a documented owner and permanent justification.

The enforced retirement sequence is:

`freeze callers → decide outcome → remove code branch → verify zero references → archive GrowthBook key → retain history`

## Enforcement

`pnpm audit:feature-lifecycle` validates the manifest, registries, lifecycle metadata, append-only retired-key history, and legacy schema boundary. CI runs it in strict mode. `pnpm feature-lifecycle:archive` is a dry run by default and requires an authenticated server-side GrowthBook endpoint for any archival mutation.

The older `003-feature-flag-architecture.md` remains preserved as historical context. Its Supabase/RPC rollout authority is superseded by this decision and the [feature lifecycle management guide](../architecture/feature-lifecycle-management.md).
