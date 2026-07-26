---
title: "Feature Flag Lifecycle Audit and Consolidated Plan"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [feature-flags, growthbook, lifecycle, audit, stale-flags, gurudevi-mobile]
---

# Feature Lifecycle Management Audit and Consolidated Plan

## Implementation status

The foundation and catalog migration are implemented. Typed lifecycle contracts, lifecycle metadata on all 27 AppCatalog entries, GrowthBook-only mobile synchronization, local snapshot metadata, the lifecycle manifest, stale-flag auditing, CI enforcement, removal of the duplicate self availability registry, AppCatalog-derived rollout consumers, and release-flag retirement checks are complete. The current manifest contains seven controlled development/beta flags and five justified operational controls; remaining work is limited to authenticated GrowthBook control-plane archival when future temporary flags exist and final production verification of the legacy schema boundary.

## Purpose

Consolidate the Gurudevi Mobile feature and feature-flag history, identify the current architectural authority, compare it with the implementation, and define one enforceable lifecycle for creating, releasing, operating, retiring, and removing capabilities and flags.

This is the implementation proposal required before changing RED/AMBER core and mobile orchestration code.

## Reading order and authority

The relevant material, ordered from newest decision context to oldest historical context, is:

1. `apps/gurudevi-mobile/docs/decisions/004-feature-lifecycle-management.md` — current accepted decision; supersedes ADR-003 and defines catalog, GrowthBook, authorization, entitlement, and retirement boundaries.
2. `apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md` — active operating guide and source-of-truth reference.
3. `apps/gurudevi-mobile/docs/decisions/003-feature-flag-architecture.md` — historical ADR whose text still describes the superseded Supabase/RPC model; retain only as historical evidence.
4. `apps/gurudevi-mobile/docs/infra/FEATURE_FLAG_ROLLOUT.md` — explicitly marked superseded by GrowthBook; retain as history only.
5. `docs/decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md` — earlier boundary decision: GrowthBook is primary, local cache is required, Supabase is not the offline store, and rollout is separate from authorization.
6. `docs/current_progress/2026-06-20-feature-rollout-implementation-plan.md` — earlier implementation intent: GrowthBook adapter, durable local cache, runtime store, and sanctuary composition.
7. `packages/core/docs/architecture/2026-06-12-hexagonal-ports-adapters-rollout.md` — retained as a superseded historical record; its concrete adapter list is explicitly marked stale.
8. `apps/gurudevi-mobile/docs/Core/FEATURE_ENGINE_ARCHITECTURE.md` — older static-engine/lifecycle concept; useful for lifecycle vocabulary, not for current file paths or resolution code.
9. `apps/gurudevi-mobile/docs/current_progress/mobile_feature_strategy.md`, `mobile_feature_audit.md`, and `docs/old_docs/feature_definitions.md` — historical product inventories and earlier implementation thinking; they are not rollout authority.

## Settled architecture

- GrowthBook is the only rollout evaluator.
- GrowthBook is accessed through `IFeatureRolloutPort` and `GrowthBookFeatureRolloutAdapter`.
- Resolved flags may be persisted locally for startup/offline continuity.
- Zustand is reactive runtime state, not the authoritative rollout store.
- Feature rollout, entitlements, and Cedar authorization remain separate gates.
- UI gating should converge on `useSanctuaryFeature`/registry composition.
- Supabase may remain relevant for unrelated configuration or data synchronization, but `global_configs` must not be a second feature-rollout authority.
- A flag is not removable merely because it defaults to `true`; removal requires evidence that the guarded behavior is permanent and the flag has no remaining operational purpose.

## Larger system: feature lifecycle management

Feature-flag management is a subsystem of feature lifecycle management. The lifecycle starts before a flag exists and ends after the capability and its operational metadata have been cleaned up.

### Capability lifecycle

1. **Proposed** — product intent, user value, owner, domain, and success criteria are recorded.
2. **Cataloged** — the capability is added to the owning package registry/AppCatalog with requirements and platform support.
3. **Building** — code may exist behind a development boundary; it is not presented as available.
4. **Validated** — internal testing confirms the capability, authorization, entitlement behavior, telemetry, offline behavior, and rollback path.
5. **Beta** — GrowthBook controls a named cohort or percentage rollout; an explicit review date and exit criterion are required.
6. **Live** — the capability is generally available. A GrowthBook key remains only if it is still an experiment or a justified operational kill switch.
7. **Deprecated** — no new callers are allowed; migration/replacement and removal date are recorded.
8. **Retired** — the capability is removed from the catalog, routes, UI, tests, analytics, and package exports. Historical documentation remains as superseded history.

### Flag lifecycle

Flags have different classes and should not all be treated alike:

| Flag class | Intended lifetime | End-of-life action |
|---|---|---|
| Release flag | Temporary; from code merge to verified general availability | Remove flag checks and archive the flag. |
| Experiment flag | Temporary; until the experiment decision is made | Keep the winning implementation, remove experiment branching, archive the flag and experiment record. |
| Beta/cohort flag | Temporary; until cohort exit criteria are met | Roll out or roll back, then remove the temporary gate. |
| Operational kill switch | Permanent only when disabling a live capability is a real safety/reliability requirement | Keep it, mark it permanent, document owner and emergency semantics. |
| Configuration value | Not a feature flag | Use configuration management unless an emergency shutoff is genuinely required. |
| Authorization/entitlement rule | Not a feature flag | Keep in Cedar or entitlement systems; never recycle a flag to represent access policy. |

### Temporary flags: removal, not recycling

Do not recycle a retired flag key for a different capability. A key identifies historical meaning, targeting, analytics, and rollout decisions; reusing it makes old dashboards, cached values, incident records, and audits ambiguous.

The safe sequence is:

`freeze new callers → roll out or decide outcome → remove code branch → verify zero references → archive GrowthBook flag → retain history`

If a new capability needs a flag, create a new key. The old key may be archived or deleted only after its history is no longer needed; archival is preferred because it preserves context. GrowthBook documents archiving unused features, and mature feature-management guidance likewise distinguishes code removal from flag archival. [GrowthBook documentation](https://docs.growthbook.io/), [LaunchDarkly lifecycle guidance](https://launchdarkly.com/docs/guides/flags/technical-debt)

### Stale and end-of-life states

“Stale” must mean more than “default is true.” A flag is a cleanup candidate when one or more of these are true:

- no code references remain;
- the capability is permanently on for all relevant environments/cohorts;
- the capability is permanently off and the code path is no longer intended;
- the experiment or beta decision is complete;
- the catalog entry is deprecated or retired;
- the owner/review date is missing or overdue;
- the GrowthBook definition exists without a catalog/code owner, or the catalog points to a nonexistent GrowthBook key.

The audit should report these conditions separately. It must not automatically delete flags based on static defaults alone.

## Capability catalog versus feature flags

The feature registry idea is correct and is not a reinvention of feature flags. It is a separate catalog layer:

| Question | System of record |
|---|---|
| What product surfaces/capabilities exist? | AppCatalog / domain registries |
| Who owns the capability and where does it run? | DomainEntry metadata |
| What authorization is required? | Cedar capability requirement |
| What commercial entitlement is required? | Entitlement metadata and evaluator |
| Is the capability currently released to this cohort? | GrowthBook rollout flag |
| Is the capability permanently shipped or being removed? | Registry lifecycle state and code ownership workflow |

This gives the correct dependency direction:

`domain capability catalog → requirements → rollout decision → authorization/entitlement composition → rendered surface`

The catalog must not become a second evaluator. It declares what exists and what it requires; GrowthBook decides rollout for the cohort; Cedar decides authorization; entitlements decide commercial access.

The repository now has this design in `DomainEntry`, the per-package registries, `AppCatalog`, `registerAppCatalog`, `useDomainFeature`, and `useDomainRollout`. AppCatalog is the canonical product-capability inventory; the former self availability registry has been removed from runtime consumption rather than replaced with another parallel registry. `useDomainRollout` lets screens resolve a domain's GrowthBook key through the catalog instead of embedding flag names.

The catalog should be extended only with lifecycle metadata that belongs to product ownership, such as `owner`, `introducedAt`, `reviewAt`, `removalTarget`, and an optional `rolloutKey`. It should not copy GrowthBook targeting rules or store live user-specific flag values.

## Current implementation comparison

| Area | Current state | Assessment |
|---|---|---|
| Evaluator | `GrowthBookFeatureRolloutAdapter` is wired by `featureFlag.factory.ts`. | Aligned. |
| Port | `IFeatureRolloutPort` supports resolve, subscription, exposure tracking, source provenance, and stale status. | Aligned; the adapter reports cache/network/computed provenance and the store enforces the seven-day stale policy. |
| Runtime store | `useFeatureStore` persists GrowthBook snapshots and lifecycle-aware safe defaults. | Aligned; no Supabase rollout override remains. |
| Mobile sync | `FeatureProvider` resolves/subscribes through GrowthBook and applies local snapshots. | Aligned; Supabase `global_configs` is no longer rollout authority. |
| UI composition | `useSanctuaryFeature` and `useDomainRollout` compose catalog requirements with resolved rollout values. | Aligned for migrated domain consumers; infrastructure/root controls remain explicit exceptions. |
| Static registry | `FeatureFlags` is a large boolean interface with defaults. | Useful safe fallback, but not a lifecycle registry or ownership manifest. |
| Stale audit | `scripts/audit-feature-flags.mjs` reads the lifecycle manifest, catalog, and source references. | Enforced in strict CI mode; current audit reports zero unused keys and zero violations. |
| Database schema | `FeatureFlag` remains in `packages/schema/schema.zmodel` and generated ORM output; the lifecycle audit currently finds zero non-schema runtime references. | Treat as a legacy deployed table; do not delete until production migration ownership and data retention are explicitly verified. |
| Documentation | Historical docs describe incompatible authorities. | Aligned; the lifecycle guide and ADR are current, while older rollout documents are explicitly superseded and indexed as history. |
| Lifecycle governance | Registry entries now require owner, creation date, review date, and removal/permanent rationale. | Enforced for all 27 catalog entries. |
| Recycling policy | The manifest contains an append-only retired-key history with retirement date/reason, and CI checks active-key reuse. | Enforced; 14 unreferenced legacy keys are retired with historical context. |
| End-of-life workflow | Strict audit and dry-run archival command block unsafe archival and preserve retired-key history. | Code cleanup is enforced; authenticated GrowthBook archival remains an explicit operator action. |

## Target lifecycle

Every flag must have an owner, purpose, type, default, rollout source, intended audience, created date, review date, and removal condition.

1. **Propose** — register the flag in the typed manifest and document the guarded capability.
2. **Develop** — default off; developer-only exposure is allowed through GrowthBook targeting, never through scattered role checks in UI code.
3. **Alpha** — limited internal cohort with explicit owner and expiry/review date.
4. **Beta** — controlled cohort or percentage rollout, with exposure tracking and rollback behavior.
5. **Stable** — behavior is generally on; keep a flag only when it remains a meaningful kill switch or operational control.
6. **Retire** — stop adding new dependencies; confirm code references, GrowthBook definitions, tests, analytics, and docs.
7. **Remove** — delete the code branch, manifest entry, GrowthBook flag, tests, and obsolete documentation together. Preserve the audit record as superseded history.

## Enforcement plan

### Phase 1 — Make the contract authoritative — complete

- Create a typed flag manifest/metadata contract in core without reintroducing Supabase evaluation. **Complete.**
- Define supported flag value types and structured resolved entries consistently across adapter, store, and hooks.
- Keep safe defaults for cold start, but record snapshot source and refresh time.
- Make `AppCatalog` the SSOT for shipped/known domain surfaces and validate that every entry has a unique id, owner, surface, capability requirement, lifecycle state, and optional rollout key. **Complete for eight registered packages and 27 entries.**
- Treat `state: 'development' | 'beta' | 'live' | 'deprecated'` as catalog/product lifecycle metadata, not as a replacement for a cohort-specific GrowthBook evaluation.
- Add an audit that compares catalog rollout keys to code references and GrowthBook definitions.
- Add lifecycle metadata for ownership and review/removal dates; do not add targeting rules or user-specific values to the catalog. **Complete.**
- Classify each existing flag as release, experiment, beta/cohort, operational kill switch, configuration, or authorization/entitlement misuse.

### Phase 2 — Remove the competing rollout path — complete

- Remove `globalConfigs` from feature resolution and the mobile `FeatureProvider` rollout flow. **Complete.**
- Keep `GlobalConfig` only if a non-rollout consumer proves it needs it; otherwise archive its feature-specific path.
- Preserve local persistence as the GrowthBook cache/runtime bootstrap path.

### Phase 3 — Repair stale-flag enforcement — complete

- Rewrite `scripts/audit-feature-flags.mjs` to read the current manifest and scan actual code references. **Complete.**
- Report flags that are unused, permanently enabled, missing metadata, past review date, or absent from the GrowthBook contract; strict mode fails on those actionable findings.
- Make the audit runnable in CI and expose it through the existing platform MCP audit command.
- Default the tool to report-only; deletion requires an explicit lifecycle decision and a separate cleanup change.
- Emit distinct findings for `unused`, `fully-launched`, `fully-disabled`, `orphaned`, `overdue`, `missing-owner`, and `key-mismatch` rather than one generic stale list.
- Add a no-reuse check backed by an append-only retired-key history. **Complete; 14 unreferenced legacy keys are recorded with retirement context and active-key reuse is rejected.**

### Phase 4 — Reconcile schema and docs

- Verify whether the `FeatureFlag` schema model has live consumers or deployed data.
- If unused, deprecate it through the normal schema migration process rather than deleting generated artifacts directly.
- Update ADR-003 and the hexagonal adapter doc to describe GrowthBook and local caching.
- Mark the old Supabase rollout guides and static-engine docs as superseded, linking here.
- Promote this document from feature-flag plan to the feature lifecycle-management reference once the decisions are accepted.

### Phase 5 — Verify

- Run core tests for adapter/store/hooks.
- Run type checking and linting for changed packages.
- Run the stale-flag audit and confirm it exits successfully.
- Run dependency and boundary checks relevant to the changed files.

## Feature spec for implementation

### Blast Zone: RED / AMBER

### Target files

- `packages/core/src/logic/ports/featureRollout.port.ts`
- `packages/core/src/adapters/feature-rollout/growthBookFeatureRollout.adapter.ts`
- `packages/core/src/store/slices/feature.slice.ts`
- `packages/core/src/store/useFeatureStore.ts`
- `packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts`
- `packages/ui/src/providers/FeatureProvider.tsx`, mounted by `apps/gurudevi-mobile/app/_layout.tsx`
- `scripts/audit-feature-flags.mjs`

### Reuses

- Existing `IFeatureRolloutPort`.
- Existing GrowthBook adapter.
- Existing `storage`/`SafeZustandStorage` persistence path.
- Existing `useSanctuaryFeature` composition boundary.
- Existing adapter/store tests and platform MCP audit entry point.

### Does not

- Add a new Supabase feature-flag evaluator.
- Put rollout decisions into Cedar authorization or entitlements.
- Add feature logic to the root router shell.
- Delete the `FeatureFlag` schema model before checking live usage and migration state.
- Delete historical documents; supersede and archive them with links.

### Current next slice

1. Verify production ownership/data retention for the legacy `FeatureFlag` schema model before creating a deprecation migration.
2. Add explicit GrowthBook archive/history operations to the admin lifecycle workflow.
3. The former fully-launched release flags have been migrated to live catalog capabilities and removed from the active manifest after zero-reference verification; the append-only retired-key history preserves their retirement dates and reasons, while five operational controls are retained by policy.
4. Run the full repository verification suite and separate unrelated baseline failures from lifecycle changes.

The local policy boundary for step 2 is now implemented in `featureLifecyclePolicy.ts` and `queueFeatureLifecycleAction`; the remaining integration is the authenticated GrowthBook control-plane adapter and its deployment environment, which must not be embedded in the mobile client.
