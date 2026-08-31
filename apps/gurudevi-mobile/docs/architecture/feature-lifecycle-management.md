---
title: "Gurudevi Feature Lifecycle Management"
status: "active"
created: 2026-07-26
updated: 2026-08-31
author: "Codex"
tags: [feature-management, app-catalog, growthbook, lifecycle, governance]
---

# Gurudevi Feature Lifecycle Management

This is the source-of-truth guide for managing product capabilities and their rollout controls. The dated audit and implementation proposal contains the evidence and migration details: [2026-07-26 feature lifecycle audit and plan](./2026-07-26-feature-flag-lifecycle-audit-and-plan.md). The live GrowthBook control-plane state (flags, environments, SDK wiring, client key) is recorded in the [2026-08-04 cloud rollout record](./2026-08-04-growthbook-cloud-rollout.md).

For day-to-day implementation, use the [new capability and feature flag checklist](./NEW_FEATURE_CHECKLIST.md). Gate precedence and entitlement context ownership are defined in [ADR-005](../decisions/005-feature-gate-order-and-context-ownership.md).

> **Related root docs:** the human-oriented mental model lives in [Gurudevi — Your Guide](../../../../docs/Core/gurudevi-sanctuary-your-guide.md), and the local-first data/event-sourcing principles in [Local-First Architecture Principles](../../../../docs/Core/local-first-architecture-principles.md).

## Core rule

The AppCatalog answers **what exists**. GrowthBook answers **who receives it now**. Cedar answers **who is authorized**. Entitlements answer **who has commercial access**.

No one system should own all four questions.

## Capability record

Every user-facing domain or meaningful capability is owned by a package registry and assembled into `AppCatalog`. A record declares:

- stable capability identity and owner;
- product lifecycle state;
- lifecycle owner, creation date, review date, purpose, intended audience, safe default, cleanup note, and removal/permanent rationale;
- mobile/web support;
- UI surface and ordering;
- authorization and entitlement requirements;
- optional GrowthBook rollout key;
- analytics identity;
- review and removal metadata.

The catalog contains declarations, not live user-specific evaluations or GrowthBook targeting rules.

Registry access requirements are declarative: `citizenshipRequired` controls registration level, `mobileSupport`/`webSupport` controls platform availability, `capabilityRequirement` identifies the Cedar action/subject, and entitlement fields describe commercial access. `entitlementTier` is the hierarchical subscription requirement (`FREE < PRO < INSTITUTIONAL`); `entitlementModule` is an independent add-on or capability entitlement. If both are present, both must pass. `entitlementScope` defaults to the individual plan; institution-backed capabilities must opt into `active_bond` or `active_entity` so a school grant cannot unlock unrelated personal features.

`THIRD_CLASS` is the least restrictive citizenship requirement. Because citizenship levels are ordered (`FIRST_CLASS = 1`, `SECOND_CLASS = 2`, `THIRD_CLASS = 3`) and access uses `current <= required`, a `THIRD_CLASS` requirement is available to every citizenship level. It does not bypass Cedar, entitlements, platform support, or rollout.

AppCatalog boot validates every manifest record with the lifecycle schema before domain registration completes; malformed lifecycle metadata therefore cannot enter a running client silently.

Rollout snapshot fallback is lifecycle-aware: launched release and operational controls retain their safe default when a remote key is absent, while beta and experiment flags fail closed until GrowthBook returns an explicit value.

Persisted snapshots are a last-known-good continuity mechanism, not an indefinite authority. They have a seven-day freshness window. After that window, stale beta and experiment values are discarded and resolve to their safe disabled default; stale operational values remain available as emergency controls until a fresh GrowthBook evaluation arrives. Snapshot source and stale status are retained for diagnostics.

GrowthBook exposure callbacks emit the privacy-minimal typed `feature_exposed`
product event containing only the feature key and evaluated value plus the
approved event-time context snapshot; rollout code must not add identity,
authorization, entitlement, or domain identifiers to that event.

The same lifecycle resolver is used at the Sanctuary API route boundary, so missing beta or experiment values fail closed consistently on mobile and server.

Protected operations follow `initialization → authentication → Cedar authorization → entitlement → lifecycle/rollout → operation`. Cedar is authoritative; entitlement is commercial access; GrowthBook is rollout only. The client permission evaluator gives Cedar denial precedence over entitlement failure to avoid revealing commercial status before authorization.

The eight package registries currently assemble 27 catalog entries into AppCatalog. Self-domain presentation metadata is stored in the canonical self registry; the former `SANCTUARY_DOMAINS` availability registry is no longer consumed. Live catalog entries no longer carry temporary release flags; controlled development and beta capabilities remain explicitly mapped to GrowthBook keys, while only justified operational controls remain outside the catalog rollout lifecycle. The mounted mobile `FeatureProvider` is the single runtime synchronization boundary: it resolves the current context, subscribes to GrowthBook updates, and writes only resolved snapshots into the local store.

The admin feature registry observes that same store reactively and exposes snapshot source, stale status, and refresh time to operators; it never edits local rollout state or impersonates the GrowthBook control plane.

## Integration audit status — 2026-08-31

The flag integration is structurally aligned, but the capability integration is
not yet complete across every consumer. The authoritative source-level audit is
the [2026-08-31 registry implementation audit](../../../../docs/current_progress/2026-08-31-gurudevi-registry-implementation-audit.md).

| Boundary | Current assessment | Required discipline |
|---|---|---|
| AppCatalog → GrowthBook | Aligned for entries with `flagKey`; boot validation checks manifest existence and flag class. | Every beta/development rollout key must map to exactly one catalog owner and one manifest record. |
| AppCatalog → Cedar | Aligned through `useDomainFeature` for migrated domain consumers. | Do not add role/capacity/bond combinations to flags; Cedar evaluates the active relationship and entity. |
| AppCatalog → Entitlements | Declarative fields exist and the entitlement port evaluates scope/tier/module. | Test individual versus `active_bond`/`active_entity` access independently from authorization. |
| AppCatalog → Routing/rendering | Incomplete. Some screens use `useDomainRollout`, but registry presence does not prove a renderer or reachable route. | Add renderer, route, analytics, and platform evidence to the registry audit. |
| Leaf feature catalog → Self renderer | Incomplete. Self has 20 leaf definitions and known canvas/web integration gaps. | Validate every `featureIds` join against a real renderer and platform composition. |
| Legacy `FeatureFlags` store → domain catalog | Valid as a safe runtime snapshot boundary, but it is not the product inventory. | Do not add new product capabilities only to `FeatureFlags`; use the catalog and manifest. |
| Docs → implementation | Partially aligned; older documents remain historical and the dated audit records current gaps. | Update the current audit whenever a registry, flag, route, or gate changes. |

This distinction is deliberate: mature feature-management systems treat flags as
temporary or operational rollout controls, not as the entire product catalog.
LaunchDarkly recommends code-reference checks, temporary/permanent classification,
regular reviews, and removal/archival when a rollout is complete
([flag lifecycle and technical debt guidance](https://launchdarkly.com/docs/guides/flags/technical-debt)).
GrowthBook remains the rollout implementation for Gurudevi; this is a governance
comparison, not a recommendation to introduce another flag provider.

Authorization should remain relationship-aware. OpenFGA describes roles as
relationships that can be assigned more than once and supports contextual and
parent-child authorization models ([roles and permissions](https://openfga.dev/docs/modeling/roles-and-permissions),
[authorization concepts](https://openfga.dev/docs/authorization-concepts)). Cedar likewise
evaluates a request using policies plus entities and context
([Cedar entities and context](https://docs.cedarpolicy.com/auth/entities-syntax.html)).
That supports Gurudevi's active-bond model: the registry declares the operation,
while the active capacity/bond context determines whether the operation is
authorized.

## Recommended target pattern

Use a small control-plane record per capability, with references rather than
embedded policy:

```text
CapabilityCatalogEntry
  id, owner, domain, lifecycle, platformSupport
  action + subject
  entitlement reference
  optional rollout reference
  renderer/route references
  analytics identity
```

Keep these evaluators separate:

```text
catalog      → what exists
router       → where it can be reached
renderer     → how it appears
Cedar        → whether this active relationship may act
entitlement  → whether commercial access exists
GrowthBook   → whether this cohort receives it now
analytics    → what happened, never whether it is allowed
```

The most valuable next improvement is therefore not more flags. It is a
read-only contract checker that joins these references and reports missing
implementation, renderer, route, gate, analytics, and test evidence. It should
fail CI for unsafe live/beta drift, while allowing intentionally hidden
`development` entries.

## Capability lifecycle

`proposed → cataloged → building → validated → beta → live → deprecated → retired`

`development`, `beta`, `live`, and `deprecated` are catalog states. `retired` means the entry and its implementation have been removed while historical records remain available.

## Flag classes

- **Release flag:** temporary gate while a capability is being released.
- **Experiment flag:** temporary branch used to compare variants.
- **Beta/cohort flag:** temporary controlled-access gate.
- **Operational kill switch:** permanent only when disabling a live capability is a legitimate safety or reliability action.

Configuration, authorization, and entitlement data are not feature flags.

## GrowthBook key naming

The manifest (`FEATURE_FLAG_MANIFEST`) is the single source of truth that maps
each app flag key to its canonical GrowthBook key (ADR-012). GrowthBook keys
follow the convention `gurudevi.<domain>.<feature>` — lowercase, dot-separated,
kebab-case — where `<domain>` matches the owning package registry (`admin`,
`ai`, `workforce`, `form-builder`, `core`) and lifecycle state stays in the
manifest, not in the key.

The rollout adapter evaluates by `growthbookKey` but emits snapshots keyed by
app flag keys, so slices, registries, and permission gates never see the remote
naming scheme. Boot-time manifest validation enforces the key format and
uniqueness. Control-plane scripts (`audit-growthbook-features.mjs`,
`archive-growthbook-flags.mjs`) compare remote feature keys against the
manifest's `growthbookKey` values, never a hard-coded list.

## End-of-life policy

Temporary flags are removed after their rollout or experiment decision:

`freeze callers → decide outcome → remove code branch → verify zero references → archive GrowthBook key → retain history`

Retired keys are never recycled. New capabilities receive new keys. The repository keeps an append-only retirement history containing the key, retirement date, and reason; this preserves audit meaning without keeping the old flag executable.

## Required governance metadata

Each capability/flag must have an owner, purpose, class, created date, review date, removal target or permanent justification, and a rollback/cleanup note.

## Enforcement

The repository must continuously check:

- catalog entries have valid lifecycle metadata;
- rollout keys map to catalog entries and code consumers;
- code consumers map to known rollout keys or explicitly declared permanent controls;
- temporary flags have review/removal dates;
- retired keys are never reused;
- deprecated capabilities have no new callers;
- every package registry entry has lifecycle metadata;
- every non-operational rollout flag has an AppCatalog owner;
- stale, orphaned, fully launched, fully disabled, and overdue items are reported separately;
- strict mode fails CI for actionable stale findings, while the default audit remains report-only.

The quality workflow runs the strict audit on pull requests and on a weekly schedule, so overdue review dates are detected even when no code change is being proposed.

The focused local verification command is `pnpm test:feature-lifecycle`; it covers the GrowthBook adapter, lifecycle policy and control-plane contract, Sanctuary composition, and stale snapshot behavior. These are unit/contract tests, not proof of route reachability or production registry wiring; the adversarial test review and required integration evidence are tracked in the [registry implementation audit](../../../../docs/current_progress/2026-08-31-gurudevi-registry-implementation-audit.md).

The audit is report-only by default. Deletion and archival are deliberate migration actions, not automatic cleanup.

The current audit disposition is explicit: zero temporary release flags remain active, and five permanent operational controls are retained with documented emergency justifications.

Archival is now a validated control-plane action, not a local store mutation. The policy rejects archival while either code or catalog references remain, rejects release flags without a retirement disposition, and requires an exact manifest justification for retained operational controls. The admin control boundary can queue the validated action for GrowthBook; it does not impersonate GrowthBook or mutate rollout state locally.

The operator command `pnpm feature-lifecycle:archive` performs a dry run by default. It reads the strict lifecycle audit, refuses keys with remaining callers or catalog references, refuses manifest dispositions other than `retire-after-migration`, protects permanent operational controls unless the operator explicitly supplies `--allow-operational`, and requires explicit `--apply --reason="..."`, `GROWTHBOOK_API_KEY`, a deployment-provided `GROWTHBOOK_ARCHIVE_ENDPOINT_TEMPLATE`, and a fresh strict control-plane inventory check before making an idempotent server-side archive request. GrowthBook’s current v2 management shape is a `POST` to `/api/v2/features/{featureId}` with `{ archived: true }`; the template remains configurable because Cloud and self-hosted deployments may expose different origins and feature identifiers.

When management credentials are available, `pnpm audit:feature-lifecycle:control-plane` performs a read-only comparison between the scoped GrowthBook feature inventory and the local manifest. It reports active remote orphans and local keys missing from the control plane; CI runs it when the corresponding secrets are configured.

The configured inventory endpoint must return the complete scoped feature inventory in one JSON response, either as an array or as `{ "features": [...] }` / `{ "features": { "key": {...} } }`. Duplicate keys, malformed responses, non-HTTPS endpoints outside localhost, and requests exceeding `GROWTHBOOK_API_TIMEOUT_MS` (10 seconds by default) fail the audit. CI treats a partially configured endpoint/key pair as an error rather than silently skipping the check.

The legacy database model is not deleted automatically. Follow the [schema retirement runbook](./2026-07-26-feature-flag-schema-retirement-runbook.md) after production ownership, retention, and backup evidence are approved.

When `FEATURE_LIFECYCLE_DB_URL` is configured as a protected CI secret, the quality workflow runs the schema evidence command in read-only mode. It reports table presence, row count, and last legacy write; it never applies a migration.

Client configuration uses `EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY` and the public GrowthBook API host only. Rollout targeting receives canonical pricing context from the entitlement store; pricing is never treated as a feature-access authority. `GROWTHBOOK_API_KEY`, archival endpoint configuration, and database connection strings are server/CI secrets and must never be placed in an Expo environment.
