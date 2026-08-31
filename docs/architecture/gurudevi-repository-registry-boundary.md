---
title: "Gurudevi Repository and Registry Boundary"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, architecture, registry, repository, capabilities]
---

# Gurudevi Repository and Registry Boundary

## Purpose

This document defines the distinction between implementation repositories and
capability registries. It is the canonical explanation to use when auditing
whether a capability is merely declared, actually implemented, or reachable.

## The distinction

An implementation repository is where behavior lives. In this monorepo that
normally means a package such as `packages/self`, `packages/classroom`, or an
application such as `apps/gurudevi-mobile`. A repository owns source code,
tests, API contracts, screens, components, and data access.

A registry is a typed inventory of capabilities. It describes what the app
knows about a capability: identity, owner, lifecycle, access requirements,
platform support, presentation surface, ordering, and analytics identity. A
registry does not implement the capability.

```text
implementation repository
  └─ source, tests, screens, APIs, data behavior
       └─ declared by
capability registry
  └─ identity, owner, state, gates, platform, surface, analytics
       └─ evaluated by
access, rollout, routing, and personalization systems
```

## Registry layers

Gurudevi has several valid registries, but each has a different responsibility:

| Layer | Current source | Owns | Does not own |
|---|---|---|---|
| Domain registry | `packages/*/src/constants/*Registry.ts` | App domains/tabs/surfaces and their requirements | Feature implementation or gate evaluation |
| Assembled catalog | `packages/core/src/logic/registry/appCatalog.ts`, assembled in `apps/gurudevi-mobile/src/boot/registerAppCatalog.ts` | One validated runtime inventory | Rendering or route ownership |
| Leaf feature catalog | `packages/self/src/features/featureCatalog.ts` | Self widgets/features, component IDs, zones, role affinity, personalization metadata | Whether a component truly works end-to-end |
| Policy registry | `packages/policies/src/authorizationRegistry.ts` | Authorization vocabulary and policy mapping | UI visibility or route existence |
| Rollout manifest | `packages/core/src/logic/registry/featureLifecycleManifest.ts` | Flag lifecycle and flag-class metadata | Feature code or entitlement pricing |
| Workspace surface registry | Package-specific workspace files such as `packages/classroom/src/workspace/surfaceRegistry.tsx` | Canvas surface composition and render behavior | Global capability identity |

## Required capability states

Every audit must report these separately:

1. **Implemented** — real source behavior exists in the owning repository.
2. **Registered** — an entry exists in a domain or feature registry.
3. **Rendered** — the intended screen/canvas actually binds the implementation.
4. **Routed** — a user can reach it through an application route or explicit entrypoint.
5. **Gated** — access and rollout checks are connected to the registered requirements.
6. **Tested** — automated or manual evidence verifies the above behavior.

The statuses are not interchangeable. A registered development entry is
expected to be unimplemented. A live entry that is registered but not routed
is a defect. A routed screen with no registry entry is a shadow capability.

## Ownership rule

The owning package repository defines the behavior. Its registry declares the
capability. `@repo/core` validates and assembles the catalog. The mobile app
bootstraps the catalog. Screens should use `useDomainFeature` for domain-level
access instead of duplicating registry requirements inline.

## Capacity, role, bond, and user context

One registry may contain capabilities used by many capacities or roles. The
registry should declare the capability once; it must not become a giant matrix
of `role × bond × plan × platform` combinations.

| Concern | Meaning | Authoritative evaluator | Registry representation |
|---|---|---|---|
| Capability | What operation exists | Catalog + application contract | Stable ID, action, subject, owner |
| Capacity/role | What kind of relationship the user has | Cedar/policy engine | Action/subject reference; optional UI affinity only |
| Bond | Which school, classroom, group, or entity is active | Cedar + active identity context | `entitlementScope: active_bond` when commercial access is bond-scoped |
| Citizenship | How far the account has registered | Citizenship gate | `citizenshipRequired` |
| Plan/module | What was purchased or granted | Entitlement policy | `entitlementModule`, `entitlementTier`, scope |
| Rollout | Whether this cohort receives the release | GrowthBook | `state`, `flagKey`, lifecycle metadata |
| Presentation | Ordering, emphasis, copy, or role affinity | UI resolver | Leaf-catalog metadata such as role weights |

Example: `grades.publish` can be one registered capability. Cedar may allow a
principal or authorized teacher to publish grades for the active school bond.
The registry does not need separate capabilities for `principal.publish` and
`teacher.publish` unless the operations are genuinely different. The UI may
show different affordances, but UI emphasis is not authorization.

The runtime flow is:

```text
registry entry
  → platform + lifecycle + citizenship checks
  → active user/bond/perspective context
  → Cedar evaluates capacity, role, entity, and action
  → entitlement evaluates plan/module/scope
  → rollout evaluates cohort/flag
  → UI receives structured available/locked reason
```

For Self, `roleWeights` are presentation preferences, not permission grants.
The existing `packages/self/src/features/accessPolicy.ts` may use roles to
rank discoverable features, while protected access still comes from the
capability and citizenship checks. For workspace actions, the active bond and
capacity must remain available to Cedar; switching perspective must change the
evaluated context, not mutate the registry.

Do not encode this in a registry entry:

```text
teacher + principal + PRO + FIRST_CLASS + school A + beta
```

Encode the stable declaration instead:

```text
capability: grades.publish
action: publish
subject: GradeRecord
entitlementScope: active_bond
```

Then let the policy and entitlement systems evaluate the current user and bond.

For Self, the domain registry and leaf feature catalog are intentionally
separate:

```text
SELF_REGISTRY
  → Self domains/surfaces: journey, pulse, growth, care, reflection, working, leadership

FEATURE_CATALOG
  → leaf features/widgets: daily_pulse, mood_lotus, study_rhythm, journals, etc.
```

They must be joined by an explicit, validated relationship. A feature ID in a
domain's `presentation.featureIds` must exist in `FEATURE_CATALOG`, have a
renderer binding, and have a reachable composition path on every platform the
domain claims to support.

## Audit vocabulary

Use these labels in status documents:

| Label | Meaning |
|---|---|
| `implemented` | Source behavior and owning tests/evidence exist |
| `registered-only` | Registry entry exists, but implementation evidence is absent |
| `partial` | Some behavior exists, but the promised capability is incomplete |
| `unrendered` | Implementation exists but the intended surface does not bind it |
| `unrouted` | Implementation/surface exists but no user-reachable route/entrypoint is proven |
| `unverified` | Static evidence is insufficient; runtime or device verification is required |
| `development-by-contract` | Intentionally not shipped because registry state is `development` |
| `deprecated` | Intentionally being removed; must not be treated as active |

The audit must include evidence paths and line numbers where practical. Never
upgrade `unverified` to `implemented` merely because a similarly named file
exists.

## Change protocol

When adding a capability:

1. Implement it in the owning repository/package.
2. Add or update its registry entry.
3. Bind its renderer/surface.
4. Add its route or explicit entrypoint.
5. Connect access, rollout, and analytics using the registry identity.
6. Add tests for registry validity, rendering, routing, and the relevant gate.
7. Update the current audit document under `docs/current_progress/`.

This follows the repository documentation SOP: static architecture belongs in
`docs/architecture/`, point-in-time audits belong in dated
`docs/current_progress/` documents, and `docs/INDEX.md` must link the active
documents.
