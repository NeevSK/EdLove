---
title: "Gurudevi Registry Implementation and Reachability Audit"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, audit, registry, capabilities, routing, implementation]
---

# Gurudevi Registry Implementation and Reachability Audit

## Scope and evidence

This is a source-level audit of every registry assembled by
`apps/gurudevi-mobile/src/boot/registerAppCatalog.ts`, plus the Self leaf
feature catalog. It distinguishes registration from implementation and route
reachability. It does not claim device/runtime success without a test or
manual verification record.

Primary evidence:

- `packages/core/src/logic/registry/domainEntry.ts`
- `packages/core/src/logic/registry/appCatalog.ts`
- `apps/gurudevi-mobile/src/boot/registerAppCatalog.ts`
- Each package's `src/constants/*Registry.ts`
- `packages/self/src/features/featureCatalog.ts`
- `apps/gurudevi-mobile/docs/2026-08-27-self-feature-system-audit-and-plan.md`

The repeatable read-only scan is `pnpm audit:registry-coverage`. Its current
machine-readable output is [registry-coverage-audit.json](../../reports/registry-coverage-audit.json).
The scanner uses static source matches as evidence leads; it does not claim
that a matching filename or token proves end-to-end behavior. Runtime, web,
and physical-device checks remain separate verification work.

## Executive findings

- The runtime assembles **eight** package registries, not the five described
  in the older registry architecture document: Self, Classroom, Community,
  Library, Admin, AI, Form Builder, and Workforce.
- The assembled catalog currently contains **27 domain entries**.
- Self also has a separate leaf `FEATURE_CATALOG` with a test asserting **21
  feature definitions**. This is a second registry layer, not a replacement
  for `SELF_REGISTRY`.
- `DomainEntrySchema` is the runtime validation boundary. Several package
  registries still use `DomainFeature extends DomainEntry` and add legacy
  `defaultZone`, so the intended contract and actual package types are not
  fully converged.
- The existing Self audit already records blocker-level evidence that the web
  Self composition, canvas renderer binding, and route convergence are not
  complete. Those entries remain `partial` or `unverified` below.
- The current generated scan reports 27 entries: 18 with source/route
  evidence, 4 Self entries requiring explicit registry-to-renderer
  verification, and 5 intentionally marked `development-by-contract`.
- The scanner now recognizes both direct `useDomainFeature` consumers and
  composed workspace surfaces. This closes false-positive “unverified” rows
  for AI Assistant, Guardian Workspace, and Community Circles without
  pretending that static evidence proves runtime behavior.

### Current machine-audit result

| Verdict | Count | Meaning |
|---|---:|---|
| `evidence` | 18 | Source, consumer, and route evidence was found statically |
| `unverified` | 4 | Self domain implementation exists, but registry-to-renderer/route binding is not proven |
| `development-by-contract` | 5 | Development entries are intentionally not release-ready |

The four remaining `unverified` entries are `journey`, `growth`, `working`,
and `leadership` in `SELF_REGISTRY`. They are not treated as missing source
implementations; they are the documented Self composition gap and require a
renderer/route join test before being promoted to implemented.

## Test-suite adversarial review

The passing tests are not equivalent to end-to-end proof. Their current
confidence boundary is:

| Area | What the tests prove | What they do not prove |
|---|---|---|
| `sanctuaryFeature.test.ts` | Pure gate ordering for representative allow/deny cases | That `useDomainFeature` reads the real catalog and passes the correct store, bond, Cedar, entitlement, platform, and GrowthBook values |
| `appCatalog.test.ts` | Synthetic entries are rejected or accepted by catalog invariants | That the real eight registries assemble successfully, contain 27 expected entries, and expose the intended IDs |
| `featureLifecyclePolicy.test.ts` | Selected fallback, metadata, and cleanup rules | That every registry flag is mapped to the correct manifest class and rollout key at runtime |
| Self `featureCatalog.test.ts` | There are 20 definitions and the top-level catalog is frozen | That every `componentId` resolves, every domain `featureIds` join exists, or every platform renderer can mount |
| Self `accessPolicy.test.ts` | Two positive/negative examples and one multi-role affinity calculation | Exhaustive capability denial, citizenship boundaries for every feature, active-bond effects, renderer selection, or route reachability |
| Registry coverage scanner | Static source evidence and structural metadata | Runtime navigation, actual rendering, provider boot order, or behavior under real identity/policy state |

### Findings from the critique

1. **P0 — No real boot-contract test.** There is no test that invokes
   `registerAppCatalog()` and asserts all package registries validate and are
   present. A registry can be valid in isolation yet omitted from boot.
2. **P0 — No route/render contract test.** The current tests do not navigate to
   a claimed route or mount its renderer. This is why Self entries can have
   source files and still remain `unverified`.
3. **P1 — Policy integration is mostly mocked by construction.** The pure
   evaluator receives a hand-built context. No test proves that active bond,
   capacity, Cedar decision, entitlement scope, and flag snapshot are projected
   into that context correctly by the hooks.
4. **P1 — Coverage is representative, not exhaustive.** The tests do not
   table-drive every live/beta registry entry through its declared gates, and
   they do not verify that a denied capability is absent from discovery UI.
5. **P1 — The scanner is an evidence lead, not a verifier.** Filename and token
   matches can over-report implementation or route evidence. Its strict mode
   currently protects structural validity only; it must not be used as a
   release-readiness gate by itself.

### Defect fixed by adversarial testing

The new Self registry-to-renderer contract test initially failed because the
`reflection` domain declared `reframe`, while `FEATURE_CATALOG` had no
`reframe` definition and `SelfFeatureRenderer` had no corresponding lazy
mapping. The catalog entry and renderer mapping are now present, and the focused Self
suite passes **22 tests** including exhaustive catalog capability/citizenship
checks.

The targeted AppCatalog boot contract also passes **2 tests** and the core
Sanctuary suite passes **40 tests**. Full type validation is not currently a
clean gate: `@repo/self` reports 117 repository-wide errors, including missing
core exports/modules and existing API typing failures. ESLint is likewise
blocked before linting by the missing
`packages/eslint-config/rules/ban-use-store.js` module. These baseline failures
must be repaired separately; they are not silently counted as evidence for
this registry work.

### Required test hardening before calling a live feature complete

- Completed: a real AppCatalog boot test now registers the production catalog
  and asserts the expected registry/domain inventory.
- Completed for static contracts: registry coverage checks renderer/source,
  route, consumer, flag, and analytics evidence; runtime rendering remains
  separate.
- Completed for catalog/source joins: Self tests now cover
  `SELF_REGISTRY.presentation.featureIds` → `FEATURE_CATALOG` and catalog
  component IDs → lazy renderer declarations. Actual mobile/web mounting still
  needs a UI test environment.
- Add table-driven policy tests for every live/beta entry covering allow,
  missing Cedar decision, denied capability, missing entitlement, inactive
  flag, unsupported platform, and development/deprecated state.
- Add at least one route-level test per tab/domain that proves the entry can be
  reached and renders its locked, loading, error, and success states.
- Keep the static scanner as a review aid; do not promote its `evidence`
  verdict to `implemented` without runtime or integration evidence.

## Domain registry audit

### Self — `packages/self/src/constants/selfRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `journey` | live | partial; domain metadata exists and leaf `journey_timeline` is cataloged | Self tab exists; entry-specific renderer/route is not proven | partial |
| `pulse` | live | partial; `daily_pulse`, `mood_lotus`, and `wisdom_seeds` are cataloged | Self canvas integration is explicitly reported disconnected | partial |
| `growth` | live | partial; study/goals/grades leaf definitions exist | Self web/mobile convergence is not proven | partial |
| `care` | live | partial; care leaf definitions exist | Self canvas binding is not proven | partial |
| `reflection` | live | partial; journal/preparation leaf definitions exist | Self web/mobile convergence is not proven | partial |
| `working` | live | partial; professional leaf definitions exist | Role view bypass/canvas divergence is documented | partial |
| `leadership` | live | partial; leadership leaf definitions exist | Role composition and combined-role behavior remain incomplete | partial |

Additional Self findings:

- `SELF_REGISTRY` contains domain-level `presentation.featureIds`, while
  `FEATURE_CATALOG` contains leaf-level renderer metadata. This relationship
  needs a validation test, not convention alone.
- The Self audit reports a web blocker, placeholder canvas content, conflicting
  ordering systems, and pin-only customization. These are implementation and
  composition gaps, not registry gaps.
- `mood_checkin` and `reframe` appear in Self ID/discovery metadata, so they
  require explicit reconciliation with the leaf catalog and domain lists.

### Classroom — `packages/classroom/src/constants/classroomRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `teacher` | live | implemented surfaces and teacher screens exist | `/workspace` and classroom routes exist; canvas and role-screen parity need runtime verification | implemented, unverified |
| `student` | live | implemented student dashboard/components exist | `/workspace` and student classroom routes exist; parity needs runtime verification | implemented, unverified |

The package also has a separate workspace surface registry. It must not be
mistaken for the domain registry; it describes canvas surfaces and can contain
rendering behavior.

### Community — `packages/community/src/constants/communityRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `hearth` | live | implemented community feed/components exist | `/community` exists; runtime gate/render verification remains | implemented, unverified |
| `circles` | live | implemented group screens/components exist | `/community` and group routes exist; runtime entry visibility remains | implemented, unverified |
| `messages` | live | implemented direct/group message screens exist | direct-message and chat routes exist; runtime gate verification remains | implemented, unverified |
| `trust` | live | partial; registry declares a PRO trust network surface, but no matching canonical surface was proven in this audit | no dedicated route was proven | partial/unrouted |

### Library — `packages/library/src/constants/libraryRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `archive` | live | implemented resource/library components exist | `/library` and resource/document routes exist; runtime registry binding remains | implemented, unverified |
| `hub` | live | implemented resource hub behavior exists | `/library` is reachable; exact `hub` surface binding remains unverified | implemented, unverified |
| `curator` | live | partial; registry declares PRO web-only curator capability | library review route exists, but exact curator ownership/binding is unverified | partial/unverified |

### Admin — `packages/admin/src/constants/adminRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `principal` | live | implemented principal dashboards and workspace components exist | `/workspace/principal` exists; runtime registry binding remains | implemented, unverified |
| `section-head` | live | implemented `SectionHeadDashboard` exists | no dedicated application route was proven | implemented, unrouted |
| `grade-head` | live | implemented `GradeHeadDashboard` exists | no dedicated application route was proven | implemented, unrouted |
| `staff-management` | live | implemented staff/admin components exist | no dedicated application route was proven | partial/unrouted |
| `guardian-workspace` | beta | implemented guardian screens/components exist | `/workspace/guardian` exists; beta flag/gate runtime verification remains | implemented, unverified |
| `inventory` | development | related inventory components exist | intentionally not shipped by registry state | development-by-contract |
| `accounting` | development | no complete user-facing surface proven | intentionally not shipped by registry state | development-by-contract |
| `workspace-shell` | development | shell is explicitly under construction | intentionally not shipped by registry state | development-by-contract |

### AI — `packages/ai/src/constants/aiRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `ai-assistant` | beta | implemented AI screen/API files exist | `/a-i-assistant` exists; beta flag and capability runtime verification remains | implemented, unverified |

### Form Builder — `packages/form-builder/src/constants/formBuilderRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `form-builder` | development | partial; engine/components and web screens exist | public form routes exist, but the registered authenticated builder surface is not proven | partial, development-by-contract |

### Workforce — `packages/workforce/src/constants/workforceRegistry.ts`

| Entry | Registry state | Implementation status | Render/route status | Verdict |
|---|---|---|---|---|
| `workforce` | development | partial; workspace route and package metadata exist | `/workspace/workforce-role` exists, but state prevents normal shipping | partial, development-by-contract |

## Cross-registry defects and risks

1. **Documentation drift:** the older architecture document lists five
   registries, while boot assembles eight.
2. **Contract drift:** `DomainEntrySchema` does not define `defaultZone`, but
   `DomainFeature` and several registries still carry it as a legacy field.
3. **Status ambiguity:** a `live` registry entry does not prove that a real
   component is rendered or routed.
4. **Self duplication:** Self domain metadata, leaf feature metadata, feature
   aliases, and canvas surfaces can disagree.
5. **Missing automated joins:** there is no demonstrated invariant that every
   registered entry has a renderer, route/entrypoint, analytics event, and
   platform-specific test.

## Special handling for gaps and issues

Do not treat every gap as a reason to add more registry metadata. First classify
the gap by the layer that owns the missing behavior.

| Gap | Correct owner | Required action |
|---|---|---|
| Entry exists but no source behavior | Owning package repository | Implement the capability, or change the entry to `development`/remove it |
| Source behavior exists but no canvas/screen binding | Surface/renderer layer | Bind the real component and add a render test |
| Surface exists but cannot be reached | Application routing/entrypoint | Add an intentional route or mark the capability non-routable with an explicit parent entry |
| Role/capacity/bond access is wrong | Cedar and active identity context | Fix the policy/context projection; do not encode user-specific combinations in the registry |
| Plan/module access is wrong | Entitlement policy | Fix scope, module, expiry, or grant evaluation |
| Flag or lifecycle is wrong | GrowthBook manifest/catalog lifecycle | Fix flag class, review/removal date, or rollout mapping |
| Feature appears in one registry but not another | Registry join contract | Add a validation invariant and reconcile IDs |
| Live feature lacks tests | Owning package and app test suites | Add tests before calling it implemented |
| Development feature appears in production UI | State filtering/route guard | Ensure development and deprecated entries are hidden |

### Priority order

#### P0 — release integrity

1. Fix or formally gate the Self web/canvas blockers documented in
   `apps/gurudevi-mobile/docs/2026-08-27-self-feature-system-audit-and-plan.md`.
2. Prove that every `live` or `beta` entry has a real renderer and reachable
   entrypoint on every claimed platform.
3. Resolve `trust`, `section-head`, `grade-head`, and `staff-management` as
   either routed capabilities or intentionally non-routable child surfaces.
4. Add an invariant preventing a live entry from being shipped as metadata-only.

#### P1 — source-of-truth integrity

1. Reconcile the older five-registry architecture documentation with the eight
   registries assembled at boot.
2. Remove or formally migrate the legacy `DomainFeature.defaultZone` extension;
   choose whether zone belongs to domain surfaces or leaf features.
3. Add a Self join test covering domain `featureIds` → `FEATURE_CATALOG` →
   renderer export → platform composition.
4. Add route and analytics identity checks to the generated audit report.

#### P2 — maintainability and product flexibility

1. Add structured preference migration for renamed/aliased Self feature IDs.
2. Add multi-role and active-bond test fixtures instead of multiplying registry
   entries for each role combination.
3. Add a registry-driven discovery/admin view that displays the same evidence
   fields as this audit.
4. Add manual device/web verification records for high-value live capabilities.

### Acceptance criteria for closing a gap

A capability may be marked `implemented` only when all applicable checks pass:

```text
[ ] registry entry is valid and owned
[ ] source implementation exists
[ ] renderer/surface binds the implementation
[ ] mobile route/entrypoint verified, if mobileSupport = true
[ ] web route/entrypoint verified, if webSupport = true
[ ] capability, citizenship, entitlement, bond, and rollout behavior tested
[ ] analytics identity is emitted from the registry identity
[ ] failure/offline/locked states are handled
[ ] package tests and relevant app tests pass
[ ] audit evidence path and verification date recorded
```

For an intentional `development` entry, the acceptance criteria are different:
it must be hidden from normal users, have a named owner, have a review/removal
date, and not be counted as an implementation failure.

### Recommended execution order

1. Freeze new live registry entries until the audit command exists.
2. Build the read-only audit command and make its output a review artifact.
3. Run package-specific agents against Self, Classroom, Community, Library,
   Admin, and platform registries using the same evidence template.
4. Fix P0 routing/rendering/security gaps in separate small changes.
5. Re-run the audit, then address P1 contract drift and P2 flexibility work.

## Required next audit automation

Add a read-only registry audit command that emits one row per entry with:

```text
registry key
entry id
owner package
state
implementation evidence
renderer/surface evidence
mobile route evidence
web route evidence
gate evidence
analytics evidence
test evidence
verdict
```

The command should fail only on invariant violations, not on intentional
`development` entries. It should flag:

- live/beta entries without implementation evidence;
- live/beta entries without a renderer or route;
- domain feature IDs missing from the Self leaf catalog;
- leaf catalog component IDs with no exported implementation;
- claimed platform support with no platform-specific route/render evidence;
- registry IDs absent from analytics or audit instrumentation.

## Agent workflow

Use one audit agent per owning registry/package, plus one integrator:

| Agent | Scope | Deliverable |
|---|---|---|
| Self agent | Self domains, leaf catalog, canvas, role composition | Self matrix and join defects |
| Classroom agent | Classroom domains and workspace surfaces | Teacher/student matrix |
| Community agent | Community domains, screens, navigation | Community matrix |
| Library agent | Library domains, tools, routes | Library matrix |
| Admin agent | Admin/principal/guardian/workforce-adjacent surfaces | Admin matrix |
| Platform agent | AI, Form Builder, Workforce, app boot, flags | Platform registry matrix |
| Integrator | Cross-registry invariants and docs | Canonical aggregate report |

Each agent must report evidence paths, must not change implementation during
the first audit pass, and must use the same verdict vocabulary. Fixes should be
separate tasks so the audit remains independent of the code generator.
