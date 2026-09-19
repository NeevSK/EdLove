---
title: "Gurudevi Cross-Domain Platform Readiness Authority"
status: active
created: 2026-09-15
updated: 2026-09-17
owners: [Naveen, Gurudevi platform]
tags: [gurudevi, architecture, migration, platform, readiness, self, workspace, community, library]
supersedes: "2026-09-14-gurudevi-sanctuary-web-implementation-plan.md platform-readiness sections"
---

# Gurudevi Cross-Domain Platform Readiness Authority

## Decision

Gurudevi feature migration is governed by a shared platform spine. The spine
is established once in `@repo/core` / `@repo/ui`, then consumed by native,
Next.js, authenticated, guest, sandbox, and Explore adapters. A feature may
not create a private substitute for these concerns.

Migration means preserving the capability while rebuilding its platform
adapter correctly. Platform incompatibility is work to solve, never a reason
to complain, defer the capability, or silently narrow the product.

All four domain Overviews may be scaffolded with truthful catalog entries
before full feature delivery. A placeholder is only a capability record with
an explicit state (`available`, `locked`, `coming_soon`, `unsupported`, or
`demo_only`); it is not a fake working screen.

## Mandatory shared contracts

These contracts are required before claiming broad domain readiness:

| Contract | Canonical evidence/owner | Required invariant |
| --- | --- | --- |
| Identity/session | `packages/core/src/logic/auth/*`, web `authorizedEntry.ts` | Identity mode, auth subject, active bond/tenant, and lifecycle are explicit. |
| Authorization | `packages/core/src/logic/permissions/accessContext.ts`, policies, RLS | Catalog metadata never grants access; UI and mutations use authoritative context. |
| Feature decision | versioned static declaration + selected-scope runtime facts + only declared authz/entitlement/flag dependencies + mode | One result explains whether and why that feature is available; a missing dependency never blocks unrelated features or the whole app. |
| Error boundary | `packages/core/src/logic/utils/errorNormalizer.ts`, `lib/errors.ts` | Raw network, validation, auth, RLS, and unavailable errors become safe typed states. |
| State/persistence | core storage ports, domain stores, workbench store | Keys are isolated by identity mode, subject, bond/tenant, domain, and task/resource. |
| Offline/sync | `packages/core/src/lib/sync/*`, PowerSync adapters | Pending writes survive offline/auth expiry; permanent failures do not block the queue. |
| Privacy | privacy API/ledger and feature declaration | Sensitive features declare consent, retention, local cache, export, and deletion behavior. |
| UI states | `@repo/ui` branded loading/error/empty primitives | Every feature has loading, empty, error, retry, offline, and permission states. |
| Accessibility | `@intuitui-labs/a11y-gate` via `packages/ui` | Keyboard/screen-reader semantics, focus, reduced motion, contrast, and target sizes are tested. |
| Observability | `packages/analytics`, core observability contract | Events are named, failure-safe, and privacy-scoped for account and Explore modes. |
| Explore/demo boundary | `packages/core/src/api/demo*`, local adapters | Same feature UI/commands; isolated local writes; no accidental production mutation; clear mode. |
| Responsive shell | mobile `responsiveShell.ts`, web `SanctuaryShell` | Shell owns structure/chrome/bounds; each domain owns its floor and responsive furniture. |

## Managed deployment now; portable deployment later

**Current deployment decision:** Gurudevi uses one shared managed Supabase
PostgreSQL database for its currently configured environments, alongside
PowerSync Cloud. Every migration against that linked database is therefore a
production-equivalent change; it must never be described as a disposable
Development-only migration lane. `powersync/cli.yaml` and
`powersync/service.yaml` point at the presently configured Cloud service. The
tracked PowerSync streams presently cover only
identity and classroom-roster replication. That boundary is deliberate: a
domain is not made offline-capable merely by adding it to a client provider.

**Portability invariant:** no domain, canvas, feature registry, or capability
resolver may import a PowerSync Cloud SDK, Cloud URL, Supabase secret shape, or
Drizzle driver detail. They depend on core ports for local query, mutation,
outbox status, identity/capability bootstrap, and sync health. Platform
connectors implement those ports for managed Cloud today and a future
self-hosted PowerSync deployment tomorrow.

**Current-state correction:** the former
`packages/core/src/logic/ports/database.port.ts` exposed a
`PowerSyncDatabaseFactory` with untyped `schema`, `database`, and `sync` values;
its only implementations were the PowerSync OP-SQLite and WASQLite adapters.
That was an adapter construction seam, not a domain port. It has now been
replaced by typed query, mutation-intent, outbox-health, and sync-health
contracts, while provider factories remain implementation details of their
PowerSync adapters. The new port is available for injection but has no domain
consumers yet; do not claim the domain boundary is migrated or add a competing
port beside it.

There are concrete current leaks to retire incrementally: `packages/classroom/src/screens/AttendanceScreen.tsx`
queries through the Drizzle database accessor; `packages/classroom/src/api/learningReflectionRepository.ts`,
`packages/self/src/api/wellbeingRepository.ts`, and
`packages/self/src/api/thoughtRecordRepository.ts` import PowerSync schema
tables directly. These are feature consumers coupled to local persistence
representation. Keep them listed as existing exceptions until an explicit
domain migration replaces them with a neutral repository/query and mutation
contract; do not expand the allowlist. The current adapter's hooks and Drizzle
tables are a bridge for those migrations, not an architectural precedent.

### Feature spec — neutral sync/query/outbox seam

- **Intent:** replace the existing PowerSync-shaped `IDatabasePort` with one
  neutral query, mutation, pending-outbox, and sync-health contract; adapters
  choose Cloud or a future self-hosted service and platform-local database
  implementation.
- **Source evidence / exact current scope:**
  `packages/core/src/logic/ports/database.port.ts` (the existing interface to
  replace, not supplement),
  `packages/core/src/adapters/powersync/{hooks.ts,database.ts,opsqlite.adapter.ts,wasqlite.adapter.ts,SupabasePowerSyncConnector.ts,connectionLifecycle.ts}`,
  `packages/classroom/src/screens/AttendanceScreen.tsx`,
  `packages/classroom/src/api/learningReflectionRepository.ts`,
  `packages/self/src/api/wellbeingRepository.ts`,
  `packages/self/src/api/thoughtRecordRepository.ts`, and
  `packages/core/src/lib/sync/{types.ts,useMutationQueue.ts}`.
- **Exact implementation scope:** modify existing
  `packages/core/src/logic/ports/database.port.ts` and make it the owner of the
  provider-neutral mutation kind reused by `packages/core/src/lib/sync/types.ts`;
  bind queue de-duplication to the existing optional user salt in
  `packages/core/src/lib/sync/useMutationQueue.ts`;
  change the two current
  adapter implementations at `packages/core/src/adapters/powersync/opsqlite.adapter.ts`
  and `wasqlite.adapter.ts` so they no longer claim the domain port; add one
  `packages/core/src/adapters/powersync/syncData.adapter.ts` that implements
  it by reusing the initialized local query executor, `useMutationQueue`, and
  `sovereignBus`. Add G0 tests beside that adapter. Do not migrate domain
  consumers in this seam; cover account-bound deduplication and preserve
  behavior for legacy unscoped queue entries.
- **Reuse:** `useMutationQueue`, `packages/core/src/lib/sync/types.ts`, and
  existing typed sync events are the outbox/health sources; local DB access
  remains behind current PowerSync adapters. `database.port.ts` is replaced,
  not duplicated. Keep PowerSync database construction and SDK lifecycle in
  `packages/core/src/adapters/powersync/*`; keep credential/API transport in
  the existing connector.
- **Prohibitions:** no `PowerSyncDatabaseFactory`, `any`-shaped driver factory,
  Drizzle table/query type, Supabase URL/secret, Cloud endpoint, or vendor CRUD
  batch in domain contracts. Do not wrap a single implementation in a
  pass-through interface; do not replace the PowerSync-specific provider
  factory with a misleadingly generic factory. Preserve API authority for
  online-first commands and server-side reauthorization; local queueing is not
  permission. The port uses strict serializable query/command inputs and
  neutral snapshots; never expose provider DB instances, driver factories,
  React hooks, storage engines, transport credentials, or raw provider status.
- **Complexity / gate:** bounded core-only bridge, no app/provider wiring or
  domain migrations. G0 proves mapping of query, queue intent, outbox snapshot,
  and safe sync-health projection. A later domain slice must consume this seam
  and provide native + browser evidence before claiming portability. No
  dependency change, activation, or cloud deployment is included.

**Connector review:** `SupabasePowerSyncConnector.ts` uses PowerSync's declared
`@powersync/common` connector types, `getCrudBatch`/`batch.complete()`, and the
existing Sanctuary API client; it does not import Drizzle or Supabase-private
database internals. OP-SQLite/WASQLite adapters and `database.ts` use the
published `@powersync/drizzle-driver` entry points (`DrizzleAppSchema`,
`wrapPowerSyncWithDrizzle`, `toCompilableQuery`), not deep/private Drizzle
module paths. This read found no proven Drizzle-private API use requiring a
source correction. It does not prove upstream stability, cross-provider
conformance, or self-hosted compatibility; verify those in the later adapter
conformance gate.

**Implementation evidence — 2026-09-15 neutral database port:** the former
factory-only `IDatabasePort` has been replaced by strict query, serializable
mutation-intent, outbox-health, and sync-health operations. Native/web
PowerSync database factories no longer claim that domain port; one
`PowerSyncDataAdapter` projects the current read executor, existing mutation
queue, and account-filtered status events into it. No feature/domain consumer
has been migrated yet, so this establishes a boundary contract, not domain
portability or a self-hosted implementation.

G0 evidence: `node scripts/run-and-report.mjs --cmd "pnpm exec vitest run
--config vitest.config.ts src/adapters/powersync/__tests__/syncData.adapter.test.ts"
--cwd packages/core --name core-neutral-sync-port-g0 --evidence-level G0` —
Vitest 5.0.0 / Node v22.23.2, one test file: 4/4 passed, 0 failed. It proves
parameterized read delegation, mutation-intent mapping into the current queue,
outbox count/subscription projection, account binding and mismatch rejection,
same-intent de-duplication within an account but separation across accounts,
account filtering of sync events, and listener cleanup. Queue de-duplication
continues to use the prior key for unscoped legacy intents; when an older key
is found on an intent already tagged with the same account it is still treated
as a duplicate. Untagged persisted queue records are intentionally not
attributed to a new account by this adapter.
Compatibility G0: `node scripts/run-and-report.mjs --cmd "pnpm exec vitest run
--config vitest.config.ts src/__tests__/scenarios/mutation-outbox-replay.test.ts
src/__tests__/scenarios/concurrent-outbox-stress.test.ts
src/__tests__/scenarios/idempotency-deep-collision.test.ts" --cwd packages/core
--name core-outbox-compat-g0 --evidence-level G0` — Vitest 5.0.0 / Node
v22.23.2, 3 files: 8/8 passed, 0 failed. Assertions cover unchanged
unscoped-intent duplicate detection, queue/DLQ behavior, concurrent distinct
intents and FIFO ordering, and stable hashing for reordered nested payloads.
These are in-memory Node contracts, not persisted migration, upload, server,
or provider evidence.
Vitest uses the Node environment: no DOM/CSS/portal or native runtime. The
query executor is a test double; the event bus and mutation queue are
in-process, and persisted-store migration is not exercised. It does not prove
SQLite/OPFS/OP-SQLite behavior, live PowerSync, network/auth/upload, permission
checks, browser rendering, domain migration, provider conformance, or
self-hosted compatibility. `pnpm --filter @repo/core
check-types` also completed with exit code 0; it is a type-check, not an
evidence-level test.

**Database bridge invariant:** Drizzle is an infrastructure bridge, not a
domain contract. The current `@powersync/drizzle-driver` integration must use
only documented public adapter/SQL interfaces and remain behind the connector
boundary. Drizzle v1 is not to be adopted by implication or compatibility
guesswork: the current PowerSync Drizzle driver is documented upstream as beta,
so Drizzle v1 becomes eligible only after upstream explicitly documents
compatibility and a staged audit verifies the exact lock-resolved versions.
Until then, retain the supported Drizzle baseline and keep schema,
migrations, and domain ports free of Drizzle-private APIs.

**Self-hosting exit criteria:** a move off managed services must be achievable
by supplying a new connector/configuration deployment, data/identity migration
runbook, and contract-level conformance tests. It must not require changing
feature behavior, authorization policy, persisted domain data, or UI code.
Cloud service/sync configuration is operated through the PowerSync CLI, never
hand-edited as an application substitute. Read-only validation is required
before activation; any deployment or interaction with a shared target requires
explicit target-specific authorization.

## Shared Supabase database governance

### Current topology and non-negotiable operating rule

There is one linked managed Supabase database today. It is a shared,
production-equivalent system of record, not a development sandbox. A clean CLI
exit, a rollback-only SQL probe, or G0/G1 API evidence never changes that
classification. The active-scope migration
`20260915090000_persist_active_bond_scope.sql` was applied to this database
after a migration-list check and dry run; its database probe left no test rows.
That is useful evidence of the additive constraint behavior, but it is not a
substitute for isolated staging, API authorization scenarios, or browser
evidence.

The previous wording that called this target “Development” was wrong and is
superseded by this section. No future report may use environment labels inferred
from a filename, Cloud service label, or historical note: it must state the
linked project/target and whether it is isolated before any write.

### Database-function exposure policy

Every PostgreSQL function is classified in its migration before deployment:

| Class | Intended caller | Required treatment |
| --- | --- | --- |
| Client RPC | An explicitly authorized client role through the Data API/RPC | Prefer `SECURITY INVOKER`. If `SECURITY DEFINER` is necessary, use a fixed safe search path (prefer `search_path = ''` with fully qualified relations), explicit caller/authorization checks, revoke `PUBLIC` and unintended roles, and grant only the intended role. |
| Internal trigger / hook | PostgreSQL trigger machinery or a named internal service | It is not a client API. Revoke direct execution from `PUBLIC`, `anon`, and `authenticated`; retain only the minimum execution path required by the database integration. Review whether an internal, non-exposed schema is appropriate before introducing a new class of privileged routine. |
| Server-only maintenance | Controlled server or operator workflow | Keep it out of client reach, use least privilege, and document the caller and rollback/repair path. |

`SECURITY DEFINER` is never a shorthand for authorization. It raises the
importance of explicit privilege, safe name resolution, and a documented caller
boundary. Supabase documents that functions are executable by default unless
privileges are revoked, and that a definer function must set its search path;
its recommended restrictive baseline removes default function execution and
re-grants only intentional entry points. [Supabase database functions](https://supabase.com/docs/guides/database/functions)

### Current exception register

The active-scope migration introduced two `SECURITY DEFINER` trigger functions:
`guard_user_preferences_active_bond` and
`clear_invalid_selected_bond`. They use a fixed `public` search path and their
direct `PUBLIC`/`authenticated` execution privileges remain broader than their
trigger-only purpose. Ordinary direct calls require trigger context, so this is
not evidence of an established application bypass; it is nevertheless an
unnecessary privileged exposure. A reviewed follow-up migration must first
prove its target functions/signatures, revoke direct execution from `PUBLIC`,
`anon`, and `authenticated`, then verify the attached triggers still enforce
the invariant. The existing `handle_new_user_preferences` trigger has a
similar historical grant pattern and is recorded for audit; it is not silently
changed as part of this active-scope repair.

The linked database's default privileges currently grant `authenticated`
function execution in `public`, while PostgreSQL's `PUBLIC` default also
applies. This is a systemic policy decision, not a reason to alter all existing
functions blindly. Before changing default privileges, audit every public
function into the three classes above, state the compatibility impact, and
provide a reversible migration plan. Supabase's guidance makes the same
distinction between revoking existing/default access and explicitly granting
individual intended functions. [Supabase API security guidance](https://supabase.com/docs/guides/api/securing-your-api)

### Mandatory migration discipline for this database

1. State the exact linked project/target and confirm whether it is isolated.
   If it is this shared database, require explicit user approval for the
   production-equivalent write.
2. Read migration history and inspect the exact schema/function/RLS surface
   affected. Create a migration through the Supabase CLI; never use Dashboard
   edits as an untracked substitute.
3. Run `supabase migration list --linked`, a dry run, and focused security
   review before applying. For functions, record signature, owner,
   `SECURITY DEFINER`/invoker, search path, and ACL before and after.
4. Test in a local database or isolated Supabase branch/project first. A
   rollback-only transaction probe may supplement this, but cannot replace it.
5. Apply through one coordinated migration deployer, then verify migration
   history, schema/RLS/ACL state, and the real affected constraint/route.
   Follow with the declared G2 API and G3/G4 web evidence in order.

Supabase's migration guidance likewise says migrations, not remote Dashboard
edits, must be the source of truth and recommends coordinated deployment rather
than concurrent remote pushes. [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations)

### Environment gap and decision needed

The current one-database topology has no isolation boundary for schema or
authorization changes. Before higher-risk policy, RLS, destructive, or broad
permission changes, establish either an isolated staging Supabase project or a
persistent/preview Supabase branch, plus a CI promotion route. Branches are
separate environments with distinct API credentials and are specifically meant
to test migrations without changing the production instance. [Supabase Branching](https://supabase.com/docs/guides/deployment/branching)
Until that exists, limit shared-database writes to explicitly approved,
additive, reversible changes with a documented probe and rollback strategy.

## Readiness classification

### Must exist before broad feature migration

- Authoritative identity/access context and account/tenant namespacing.
- A single composed feature decision and lifecycle/delivery declaration.
- Safe demo/sandbox adapter boundaries; no global mock interception that can
  silently return successful writes.
- Typed error, loading, empty, retry, offline, and authorization states.
- Persistence and sync invariants that prevent data loss or cross-identity
  leakage.
- Privacy declaration for every sensitive feature before it is exposed.
- Accessible shared shell and interaction primitives.
- A domain migration matrix and Overview catalog for Self, Workspace,
  Community, and Library.

### Integrate for every feature

Each feature row and implementation must state:

- use case/API and authoritative access requirements;
- native and browser delivery status;
- lifecycle (`floor_furniture`, `modal`, `transient`, `single_task`,
  `per_resource_task`, or `date_scoped_task`);
- resource and temporal identity;
- persistence, offline, conflict, and retry behavior;
- privacy/retention/consent behavior;
- Explore/demo behavior;
- accessibility and responsive behavior;
- evidence level and known gaps.

### Later hardening

- Rich conflict-resolution UX and advanced sync reconciliation.
- Storage-quota optimization beyond safe degradation.
- Full analytics dashboards and performance tuning.
- Bundle splitting, animation/lighting polish, and advanced demo fixtures.
- Production-scale load, chaos, and device/browser matrix assurance.

## Domain documentation gate

Before a domain or feature is called migrated, its canonical document must
contain a complete inventory matrix. The matrix must be based on the existing
mobile implementation, every relevant `*.tsx` / `*.web.tsx`, domain package,
server contract, tests, and historical decisions. Similar filenames are not
authority; each file is classified as canonical policy, platform adapter,
floor composition, compatibility layer, or obsolete evidence.

Required domain authorities:

- Self: `docs/current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md`
- Workspace: create/update a dedicated workspace migration control matrix.
- Community: create/update a dedicated community migration control matrix.
- Library: create/update a dedicated library migration control matrix.

The existing implementation plan remains the delivery sequence; this document
is the readiness gate. No feature batch may skip the matrix by calling a
catalog card, lazy import, placeholder, or passing unit test “implemented.”

## Required delivery sequence

1. Establish and verify the shared contracts above.
2. Produce the four domain inventories and history/authority maps.
3. Build truthful Overview floors for all four domains.
4. Use vertical feature slices to prove the contracts, starting with the
   highest-value features in each domain.
5. Attach account, guest, sandbox, and Explore adapters to the same floors and
   feature commands.
6. Apply visual sanctuary composition and production hardening after behavior
   and state boundaries are proven.

This is deliberately both architecture-first and feature-delivery-oriented:
shared safety contracts are built once, while each feature still must complete
its own end-to-end adapter and evidence row.

## Enforceable execution rules

1. **Inventory before implementation.** Before editing a domain or shared
   contract, the agent records the relevant catalog/registry files, native and
   browser variants, domain package, API handlers/contracts, tests, and
   historical decisions. `rg --files` discovery alone is not understanding;
   each source is marked `read`, `understood`, `integrated`, or `gap`.
2. **One authority per concern.** An agent must update an existing canonical
   authority or explicitly supersede it. Creating a similarly named plan,
   registry, canvas, feature catalog, or adapter without recording why the
   existing owner cannot serve the concern is prohibited.
3. **No unsupported delivery claim.** A catalog entry, lazy import, route,
   placeholder, mock response, or unit test does not prove feature delivery.
   A delivery claim requires the feature matrix row, the relevant runtime
   adapter, and evidence at the stated level. Unsupported states must remain
   `coming_soon`, `unsupported`, `locked`, or `demo_only`.
4. **Coverage reporting is mandatory.** Every material migration report lists
   discovery coverage, reading/understanding coverage, integration coverage,
   and unexamined sources. “All features” is not an acceptable scope label
   without those counts and exact lists.
5. **Evidence/decision gate.** Before merging or handing off a chunk, the
   agent reports the exact commands, evidence level, runtime substitutions,
   files/scenarios, passed/failed counts, and limitations. Architectural
   decisions that change ownership, persistence, authorization, privacy, or
   Explore behavior require a documented user decision/approval.
6. **Delegation boundary.** An agent may be delegated only a bounded lane
   with named files, an explicit read/write scope, its required evidence, and
   a no-duplicate-owner rule. Documentation/audit lanes remain read-only;
   implementation lanes may edit only their assigned ownership boundary.
   Agents may not delegate further or alter shared authority without approval.
7. **Deviation logging.** Any material deviation from the requested plan,
   canonical authority, or existing behavior is logged before handoff using
   the template below. Silent scope reduction is not allowed.

## Material deviation log template

Copy this block into the relevant progress report for every material deviation:

```markdown
### Deviation: <short name>

- Requested plan: <what the user/current authority required>
- Proposed change: <what was changed or intentionally not changed>
- Evidence: <exact files, history, tests, commands, and evidence level>
- Impact: <behavior, platforms, privacy, access, data, delivery, and schedule>
- User decision/approval: <approved by whom/when, or `pending`; do not proceed
  with irreversible or materially divergent work while pending>
```

## Coverage report — 2026-09-15 platform-spine audit

This report is the baseline for the next domain-inventory lane. It is not a
claim that every discovered source has been understood or integrated.

### Discovered and read/understood

**Shared/core sources read and understood:**

- `packages/core/src/logic/auth/identityState.ts`
- `packages/core/src/logic/auth/bootstrapRoutes.ts`
- `packages/core/src/logic/auth/profileResolution.ts`
- `packages/core/src/logic/permissions/accessContext.ts`
- `packages/core/src/logic/permissions/featurePresentation.ts`
- `packages/core/src/logic/utils/errorNormalizer.ts`
- `packages/core/src/logic/registry/featureLifecyclePolicy.ts`
- `packages/core/src/logic/managers/featureFlag.factory.ts`
- `packages/core/src/offline/resilience.ts`
- `packages/core/src/lib/sync/errorClassifier.ts`
- `packages/core/src/lib/sync/hooks/useSyncStatus.ts`
- `packages/core/src/api/demo.ts`
- `packages/core/src/api/demoProvider.ts`
- `packages/ui/src/utils/a11yUtils.ts`
- `apps/gurudevi-mobile/src/lib/responsiveShell.ts`

**Domain/web sources read and understood:**

- `packages/self/src/features/featureCatalog.ts`
- `packages/self/src/privacy.ts`
- `apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts`
- `apps/gurudevi-web/lib/workbench/storage.ts`
- `docs/architecture/offline-state-resilience-sop.md`
- `docs/architecture/2026-09-05-a11y-gate-canonical-consolidation.md`
- `docs/current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md`

**Relevant authority documents read:**

- `docs/current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md`
- `docs/current_progress/2026-09-12-gurudevi-web-migration-plan.md`
- `docs/decisions/2026-09-14-sanctuary-explore-access-and-persistence.md`
- `docs/decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md`
- `docs/decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md`

### Discovered but not yet read/understood

The initial search also found these high-value source families that require
domain-specific audit before implementation claims:

- all `packages/self/src/features/*` files beyond `featureCatalog.ts`,
  especially `featureResolver.ts`, `featureManifest.ts`, access-policy tests,
  canvas store/persistence, and renderer/registry tests;
- all Self native screens and `*.web.tsx` variants under
  `packages/self/src` and `apps/gurudevi-mobile/src`, including their API and
  temporal dependencies;
- Workspace sources and operational documents, including
  `docs/files/specialized/21-workspace-tab-ui-operationalization.md`,
  perspective logic, classroom routes, and workspace canvas components;
- Community sources and `docs/files/specialized/11-community-domain-audit.md`;
- Library sources, `packages/library/src/api/sync.ts`, readers, shelves, and
  `docs/files/specialized` library material;
- the complete API contract/handler matrix for every catalog feature;
- the complete test and device/browser evidence for PowerSync, privacy,
  accessibility, and guest-to-authenticated migration.

### Discovered vs integrated evidence sources

**Integrated into the platform authority:** identity modes, access-context
readiness, feature-presentation states, lifecycle policy, normalized errors,
offline/sync invariants, demo boundary risks, a11y gate ownership, responsive
shell ownership, and the requirement for domain matrices.

**Not yet integrated into runtime delivery:** a single composed feature-decision
adapter; namespaced cross-platform persistence; feature-level privacy metadata;
browser-safe offline/sync adapter; universal loading/empty/error/retry UI
contract; complete Explore local-write boundary; and complete platform delivery
evidence for Self, Workspace, Community, and Library.

**Known gaps that remain explicit:**

- Self has a control matrix, but the other three domain matrices do not yet
  exist as canonical documents.
- Existing demo interception contains unsafe `any` and simulated successful
  writes and must not be treated as the final Explore architecture.
- The offline SOP documents more scenarios than have been verified in this
  audit; scenario names are leads, not evidence.
- `packages/self/src/privacy.ts` is a screen re-export, not feature-level
  retention/consent policy.
- The shell contracts exist in separate native/web adapters and still need a
  shared behavior matrix; domain floors remain domain-owned.

Until these gaps are assigned and evidenced, the platform may show truthful
catalog placeholders and domain Overviews, but may not claim broad feature
migration or production readiness.

## Independent architecture review: gate versus implementation

The gate is directionally correct but currently stronger than the runtime
implementation. `resolveCapabilityDecision` is specified here, but no single
runtime function with that exact input/output contract is yet wired across
web and mobile. Existing `featurePresentation.ts` maps an already-produced
decision, while `accessContext.ts` defines inputs; neither composes delivery,
mode, privacy, lifecycle, and task policy. This is the first invalid-readiness
claim to correct.

Other gaps found in the actual files:

- Web has `apps/gurudevi-web/lib/workbench/store.test.ts` using Node's built-in
  test runner, but `apps/gurudevi-web/package.json` has no test script,
  Vitest config, Playwright config, or browser evidence runner.
- Mobile Playwright specs exist under `apps/gurudevi-mobile/tests/e2e`, but
  they prove the mobile-hosted web surface, not the Next.js application.
- `packages/core/src/api/demoProvider.ts` and `demo.ts` still use `any` and
  can return simulated successful writes. They are not an acceptable
  production Explore adapter.
- `packages/core/src/offline/resilience.ts` imports the shared storage layer
  without a demonstrated browser storage contract; browser SWR/offline
  claims remain unverified.
- `packages/self/src/privacy.ts` exports a screen and does not provide the
  feature-level privacy metadata required by this gate.
- Native and web shell contracts exist separately. Their behavior is not yet
  proven equivalent across the matrix of portrait, landscape, compact, tablet,
  keyboard, focus, and reduced-motion cases.

Therefore the platform status is `contract specified / runtime integration
partial`, not production-ready.

## Next.js web evidence matrix

This is the minimum exhaustive evidence plan for the browser application. The
counts are required scenarios, not claims that they currently pass. A runner
must be invoked through `scripts/run-and-report.mjs` with the stated
`--evidence-level`; direct ad-hoc commands may help development but cannot be
reported as gate evidence.

| Level | Runner and scope | Required scenarios | Current status |
| --- | --- | ---: | --- |
| G0 contract/unit | Node `node:test` or Vitest through the shared reporter; pure `@repo/core` and web workbench policy | 24: capability decisions 8; namespace 4; task/workbench 6; feature lifecycle 3; error mapping 3 | 2 web workbench scenarios exist; remaining 22 absent from the web lane. |
| G1 boundary/mock | Vitest with mocked Supabase, fetch, storage, flags, clock, and browser APIs | 24: auth/session 4; authz/feature decision 4; API/error 4; persistence 4; Explore/demo 4; UI-state adapter 4 | No web Vitest configuration or web G1 suite exists. |
| G2 scenario contract | Vitest/integration harness using in-memory adapters and real route/action contracts | 20: signed-out entry 2; authenticated entry 2; anonymous/Explore 3; guest conversion 2; Self Overview/task 4; domain switching 3; offline/retry 2; privacy 2 | No web G2 suite exists. |
| G3 real component/runtime | Next.js test harness with rendered React components, real CSS/module loading, portals, keyboard/focus, and browser storage; no network substitution except explicit test server | 16: shell/navigation 4; Overview floors 4; workbench open/focus/close/restore 4; loading/empty/error/offline 4 | No configured web component/runtime runner exists. |
| G4 browser/Next runtime | Playwright against a built or controlled Next dev server; real browser APIs and route transitions | 24: landing/entry 3; auth callback/recovery 3; shell/nav 4; each domain Overview 4; Self task lifecycle 3; Explore boundary 3; responsive portrait/landscape/keyboard 4 | Existing Playwright coverage belongs to mobile; no Next.js Playwright config or suite exists. |

G4 scenarios must run at minimum in Chromium and cover  narrow phone,
landscape-short, tablet, and desktop widths. A passing G0/G1 result cannot be
promoted to G2/G3/G4. G3 does not prove Next routing or browser behavior; G4
does not prove device-native behavior.

The web lane must add its own config and scripts before reporting these levels;
it must not reuse the mobile Expo/Metro config by implication. Until then,
web claims are limited to static type/lint checks and the two existing G0
workbench policy tests.

## Executable shared-plumbing gate

Every domain and feature delivery must pass this gate. The domain may render a
catalog/Overview before passing, but its status is `scaffolded`, never `Live`.

### Authoritative capability decision

`resolveCapabilityDecision(input)` is the only owner of the composed product
decision. It is pure and receives facts from platform adapters; it does not
read stores, call the network, or infer authorization from UI metadata.

Required input:

```text
versioned feature declaration:
  id, default availability, lifecycle, platform delivery, task/resource policy,
  privacy/retention declaration, required scope, declared dependency keys
verified subject + identity mode + domain mode
validated selected bond/tenant/entity scope (or explicit no-scope)
runtime authorization only for the declared presentation requirement
entitlement only when the declaration requires an entitlement
flag result only when the declaration requires a rollout/emergency flag
runtime consent/readiness only when the static privacy declaration requires it
```

Static declaration facts (lifecycle, default availability, delivery, privacy,
and task policy) are versioned metadata, not live authorization. Dynamic
dependencies are feature-scoped: missing or unavailable data marks only that
feature `unavailable`/`loading`; features without that dependency continue to
resolve from their declaration and scope. Every operation still performs its
own current server authorization regardless of the presentation decision.

Required output:

```text
status: available | loading | locked | upgrade_required | coming_soon |
        unsupported | disabled | demo_only
reason: stable machine-readable reason
allowedOperations: read | create | update | delete | export | none
taskPolicy: floor | modal | transient | single | per-resource | date-scoped
storagePolicy: cloud | local-only | hybrid | none
evidenceRef + authorityRef
```

Owner: `@repo/core` policy/decision layer. Native and Next.js code may adapt
the result to controls, routes, and copy but may not re-evaluate it.

### Persistence and Explore boundary

Every local key and outbox item must be namespaced as:

```text
experienceMode / authSubject / tenant-or-bond / domain / feature / resource
```

Explore, sandbox, and demo use a local-only adapter and an explicit mode
indicator. They use the same domain floor, feature renderer, commands, and
state contract as account mode. They may hydrate baseline fixtures, but writes
must remain local and must never be simulated as successful production writes.
Guest-to-account conversion is an explicit migration operation with a user
visible decision; it is not an implicit account creation or silent merge.

### Shared UI state contract

Every feature surface exposes the same state vocabulary:

```text
initializing | loading | ready | empty | offline_stale | saving |
saved | retryable_error | permission_denied | unsupported | disposed
```

The state includes `lastKnownGoodAt`, `pendingMutationCount`, `canRetry`,
`canEdit`, `isSensitive`, and a safe user message. Shared UI primitives own
loading, error, empty, retry, offline, focus, reduced-motion, and announcement
behavior. A feature owns only its domain copy and recovery action.

## Ordered implementation work packages

| Order | Work package | Depends on | Acceptance gate |
| ---: | --- | --- | --- |
| 0 | Source archaeology and four domain matrices | Existing authorities | Every catalog entry has source, history, use case, and gap row. |
| 1 | Capability decision contract | 0 | Pure contract tests cover access, flag, platform, mode, privacy, and unsupported combinations. |
| 2 | Identity/access and persistence namespace | 1 | Account, tenant, anonymous, sandbox, and demo keys cannot cross-read or cross-write. |
| 3 | Shared UI state/error/offline contract | 1–2 | One reference feature proves loading, empty, retry, stale, auth expiry, and mutation failure. |
| 4 | Shared shell and domain Overview floors | 1–3 | Self/Workspace/Community/Library Overviews render truthful catalog states on native and web. |
| 5 | Feature adapters and vertical slices | 4 | Each feature row has native/browser evidence and all required lifecycle/privacy states. |
| 6 | Explore/account adapters | 2–5 | Same commands and floor; storage and write boundaries are proven. |
| 7 | Hardening and production assurance | 0–6 | Device/browser, accessibility, chaos, privacy, performance, and observability evidence. |

Dependency rule: no package may jump from Work Package 0 to feature-specific
UI while bypassing Work Packages 1–3. A feature may be used as a reference
implementation, but it does not define a private alternative to the shared
contracts.

### Implementation evidence — 2026-09-15

The gate is now represented in code, but it is not yet a broad-domain readiness
claim:

| Work package | Implemented evidence | Remaining acceptance work |
| --- | --- | --- |
| 1 — capability decision | `packages/core/src/logic/capabilityDecision.ts` composes platform, lifecycle, flags, identity/mode, authorization, citizenship, entitlement, privacy, operation, task, and storage facts. | Adapters must supply authoritative server-side authorization/entitlement facts for every domain; no UI may manufacture them. |
| 2 — persistence and Explore boundary | `packages/core/src/lib/persistenceBoundary.ts` namespaces standard/guest/Explore/sandbox/demo state and rejects production writes outside a standard account. Browser Self account requests pass this guard. | Build local Explore/sandbox adapters and prove actual storage/outbox isolation on browser and native. |
| 3 — shared UI state | `packages/ui/src/components/FeatureStateBoundary.tsx` renders the shared state vocabulary; Fire Journal history is the reference consumer. | Apply it to every delivered feature and perform browser/device accessibility and failure-path evidence. |

Focused contract and runtime evidence is recorded with the implementation
handoff. This table must be updated, rather than inferred from a catalog card,
when any adapter begins consuming the gate.

### Execution checkpoint — 2026-09-17

The ordered work packages remain the dependency authority above. This checkpoint
records actual delivery state; it does not promote lower-level evidence into web
or production readiness.

| Work package / seam | Current evidence | Still required before it is complete |
| --- | --- | --- |
| Selected scope and bond lifecycle | `20260915090000_persist_active_bond_scope.sql` is applied to the linked managed Supabase database, which is shared across the user's current app environments. It adds lifecycle/validity columns, selected-scope FK, same-owner/current-validity guard, and invalidation clearing. A rollback-only PostgreSQL probe proved foreign-pointer rejection and clearing an expired selected pointer; it left no rows. API G0/G1 cover pure contract and mocked handler/context behavior. The Next authorized-entry adapter now consumes only server-issued `scopeBootstrap` (selected scope, roles, and primary selected role); it rejects a legacy `activeBond`/profile-capacity shape. | Complete the separate Supabase governance repair before any further shared-database write. Then run real API G2 scenarios for onboarding, deliberate capacity change, stale/revoked scope, cross-device selection, and route reauthorization. The web adapter has G1 mocked-boundary evidence only; no G2/G3/G4 browser claim yet. |
| Capability bootstrap | The canonical split is frozen: static versioned declarations own lifecycle, privacy, delivery, and default availability; server runtime owns selected scope plus declared authz/entitlement/flag facts; operations reauthorize. | Implement the declaration source and the server-owned fact composition. Current Cedar, entitlement, and flag sources are individually real but not a complete feature bootstrap. No composer, web transport, or feature-level G0 exists yet. |
| Neutral local-data / sync port | A typed core query/mutation-intent/outbox/sync-health port and PowerSync adapter exist. G0 proves account-bound queue mapping and exposed a fixed cross-account idempotency collision; compatibility G0 preserves unscoped legacy behavior. | Migrate or explicitly retain the four direct domain consumers; wire native and browser providers; test persisted legacy queue treatment, SQLite/OPFS/OP-SQLite, reconnect, upload, and server reauthorization. Self-host portability is architectural only, not proven. |
| Shared UI state | Shared state vocabulary and a reference consumer exist. | Bind it to the scope/capability bootstrap and use it in each delivered web floor for loading, empty, offline, retry, denied, and unavailable states. |
| Shell, workbench, and domain floors | Domain inventories and workbench/shell decisions exist; current web and mobile implementations remain separate/partial. | Implement one responsive web shell with visible active scope, account destinations, domain Overview/Catalog floors, and domain-owned workbench furniture. Prove portrait, landscape, tablet, desktop, keyboard, focus, and reduced-motion behavior. |
| Explore and account adapters | Product boundary is specified. | Build local persona/fixture/write adapters on the same commands and floors; prove no cloud/private read or write leaks and an explicit guest-to-account transition. |
| Web evidence | No complete web capability suite exists. | Add and pass the declared web G0, G1, G2, G3, then G4 matrix in order. Native runners never substitute for these claims. |

**Security repair pending:** the migration's trigger functions use a
safe fixed `search_path`, but their direct `PUBLIC` and `authenticated` execute
grants should be revoked in a reviewed follow-up migration. This is
least-privilege hardening: the functions are trigger-returning routines, not
an established direct application bypass, but their direct invocation is
unnecessary and should not remain exposed.

## Plumbing denominator metrics

Progress reports must use these denominators rather than vague “mostly done”
language:

| Metric | Denominator | Complete when |
| --- | ---: | --- |
| Capability decision coverage | 1 contract × 4 domains × 2 platforms × 4 modes | Each combination has a tested result or an explicit unsupported decision. |
| Identity/persistence isolation | 5 identity modes × 4 domains × 2 platforms | Namespace and transition tests exist for every supported combination. |
| Neutral local-data port adoption | 4 discovered domain consumers × reviewed highway decision | Each direct Drizzle/PowerSync consumer uses the neutral port or has a documented direct-API exception; current completion is 0/4. |
| UI state coverage | 12 states × feature count × platforms | Each delivered feature maps every applicable state to shared primitives. |
| Error/recovery coverage | error classes × delivered features × platforms | Auth, permission, validation, network, offline, conflict, and retry paths are evidenced. |
| Accessibility coverage | delivered screens × platforms | Focus, keyboard/screen reader, target size, contrast, reduced motion, and dynamic type are checked. |
| Domain inventory coverage | 4 domains × catalog entries | Every entry is discovered, read/understood, classified, and assigned a delivery state. |

Reports must show `complete / denominator`, list exclusions, and link evidence.
Unknown is not counted as complete. A domain is `Live` only when its matrix,
capability decision integration, persistence boundary, shared UI states, and
required evidence all pass; otherwise its status remains `scaffolded`,
`partial`, or `blocked`.

## Versioned server-computed capability bootstrap (Next.js)

### Architecture review and actual boundary

`/identity/resolveIdentity` is an identity/profile compatibility endpoint, not
an authorization capability endpoint. The Next adapter verifies Supabase
claims with `getClaims()`, then retrieves the session token only to forward it
to Sanctuary. Sanctuary verifies the bearer token and uses the verified
subject to create a ZenStack-scoped DB client. This is the correct trust
direction: cookies/token authenticate the subject; client role/scope headers
must not authorize the subject.

There is a pre-onboarding contradiction in the current route path. Hono's POA
middleware explicitly bypasses `/identity/resolveIdentity`, but
`buildORPCContextFromHono` independently queries for a bond and returns
FORBIDDEN when none exists; only the two onboarding procedures are exempted by
`isOnboardingBootstrapProcedure`. Thus the identity handler's no-bond fallback
does not establish that a newly authenticated, not-yet-onboarded subject can
reach it. This requires an authenticated identity-only bootstrap context,
not a general bypass of scope authorization.

The existing identity handler also returns `availableBonds` and picks
`activeBond` by matching the profile's `capacity`, then falls back to the
first bond. That may be a useful compatibility/profile summary, but it is not
proof that this bond is the user's selected active perspective or that every
operation in its scope is authorized. No new capability response may inherit
that fallback. The Hono app path and oRPC handler are both present; migration
must establish which route implementation serves production and keep their
contracts consistent.

### Two-stage trust model: bootstrap identity, then authorized scope

**Stage A — identity and first-Sanctuary onboarding, safe before institutional
scope selection.** A versioned response may contain only facts necessary to
render the correct entry journey:

- server-verified auth subject ID, bound to the presented bearer token;
- identity mode derived from trusted server/account state (not an arbitrary
  request parameter or mutable client profile field);
- account/profile lifecycle state and onboarding step/completion;
- minimal display identity, including the server-resolved display name, needed
  by the entry UI;
- schema/version and freshness metadata.

It must not return an institutional authorization scope, grants, Cedar
permissions, school/classroom/student IDs, entitlement, or enabled feature
decisions before they exist. On completion of name and initial role/capacity
selection, the server creates the account's first active **Personal Sanctuary
Bond**: the person's relationship to Gurudevi itself, scoped to their own
Sanctuary and carrying that selected capacity as its primary/default role.
That explicit initial bond—not a `User.capacity`, client default, or first
database row—is the remembered initial active scope. A new account therefore
does not enter the application without a scope or pretend to already hold an
institutional Workspace bond. An anonymous Supabase identity is still a
server-authenticated subject for its isolated local/guest policy; a visitor
with no Supabase session is not an API identity.

**Stage B — remembered active-scope capability bootstrap.** For an onboarded
account, the server loads that account's persisted last-selected scope; this
preference is shared across devices. The browser may submit a scope ID only
as a deliberate switch request, never as authority. For either the remembered
or newly requested scope, the server must constrain lookup by verified
subject, validate current membership/ownership and status, derive
entity/tenant/capacity from trusted rows and relationship facts, and refuse
mismatches. Active scope and capacity/role are emitted only after validation.
The client never supplies authoritative name, capacity, role, or scope. The
server computes presentation capabilities from that validated scope and
current policy/lifecycle/rollout versions, entitlements, privacy, and
registered platform delivery. The snapshot is an expiring UI hint; every
read/write API still reruns authoritative Cedar + ZenStack/RLS checks.

If there is no valid remembered scope, return `needs_selection`; do not choose
the first available bond or silently substitute a Personal, institutional, or
other scope. Show the scope picker for a missing/invalid remembered selection
or when the person explicitly switches. A revoked, archived, expired,
inaccessible, or otherwise invalid remembered scope is invalidated and never
replaced by the first available bond. Persist a deliberate switch only after
successful server validation. Concurrent valid switches use
last-successful-explicit-selection semantics; stale browser state cannot
restore a previous scope without revalidation.

**Migration behavior (authoritative):** the additive migration
`apps/gurudevi-mobile/supabase/migrations/20260915090000_persist_active_bond_scope.sql`
adds `Bond.status` (`active | archived | revoked`), `valid_from`,
`valid_until`, and `UserPreferences.active_bond_id`. The pointer has an FK;
database triggers enforce same-user ownership and current validity when a
pointer is written, and clear it when a selected bond is changed to an invalid
lifecycle/validity state (or its owner changes); the resolver also clears a
pointer found expired at read time. Existing accounts receive no
guessed pointer or backfill: they must deliberately select a valid scope and
remain `needs_selection` until then. Future accounts get the user-chosen
ordinary capacity on their self-owned Personal Sanctuary bond and that bond is
selected atomically with onboarding; no first-bond fallback exists. Valid
roles combine only across bonds in the selected entity/type perspective.
Initial capacity persists. A later different ordinary capacity is a proposal;
the typed API defaults `confirmCapacityChange` to false, and only explicit
confirmation updates the personal bond plus the presentation projection in
the onboarding transaction. It cannot change institutional, Community, or
platform bonds. Founder/developer platform bonds are provisioned only by
server-side subject allowlists, never by client-selected capacity. This is
the migration contract, not proof that the database triggers or deployment
have been exercised.

No client header, browser state, catalog entry, or cached snapshot grants a
server operation. Missing DB, Cedar, scope, entitlement, or required policy
version is `unavailable`/`loading` and fails closed for protected operations;
it is never converted to a default role or the first available bond.

### Offline-first authority, without client fallback

Offline-first changes where verified facts are read, not who owns them. While
online, the server issues a subject-, scope-, role-set-, policy-, entitlement-,
flag-, and expiry-bound capability lease/snapshot. Native and browser local
stores may verify and use that lease to render the selected perspective, read
already-authorized local data, make local-only Personal Sanctuary changes, and
queue allowed cloud mutations. A queued mutation retains the subject, selected
scope, capability/version reference, and idempotency key; the server reruns
authorization when it is replayed.

On an offline launch, the app restores the last signature-verified
server-issued scope lease and its locally persisted data. Lease expiry is a
**revalidation state, not a data-loss or blanket-functionality block**: keep
the person in their known perspective, show freshness/reconciliation state,
and continue durable local work, drafts, and queued supported mutations. The
queue records the scope/version/idempotency context and the server validates it
when reachable. If a replay is denied because the relationship or policy
changed, retain the local record and present a recoverable resolution state;
never silently delete a day of work.

The app never derives new or expanded authority from `User.capacity`, the
first bond, a catalog card, or persisted role labels. Operations whose only
safe effect is an immediate irreversible external/cloud action enter a local
pending/needs-review state until revalidation rather than pretending success.
An offline deliberate switch is allowed only to another already-cached,
signature-verified scope lease; the preference update is queued and the server
validates it when reachable. A first-ever onboarding flow may create a clearly
local provisional Personal Sanctuary identity/bond, but it is local-only until
server reconciliation; it cannot claim institutional data or cloud
permissions.

### Cross-domain role projection

A perspective is not a Workspace-only filter. The server projects the valid
role set for the selected Personal Sanctuary, institutional, commercial, or
guardian perspective once; every domain consumes the same typed projection.
The primary capacity is a presentation/default-entry hint. The complete role
set determines which relevant furniture is shown, ordered, or labelled, while
per-feature and per-record authorization remains server-enforced.

**Self** is intentionally whole-person: it may group general reflection,
personal care, learner, educator, leadership, guardian, and creator furniture
in one floor. Existing Self catalog/access code already supports multiple
roles and role affinity; this must receive server-issued roles rather than
inventing a fallback student role. Grouping and relevance never grant access.

### Self data rule — private by default

Every Self feature and its records are private to the account by default. No
Self record is shown to Workspace, Community, Library, another role, another
bond, or another person unless a future feature implements an explicit,
user-initiated sharing action and its own record-level authorization contract.
Privacy is consequently an isolation and enforcement property for the current
Self capability bootstrap, not a per-feature consent gate or repeated modal.

Self records are retained by default. A feature may depart from that rule only
when its own product design explicitly declares non-retention or transformation
(for example, a deliberate burn/redaction behavior); that exception must be
described in the feature declaration and enforced by its server operation.
Fire Journal's current short-preview-after-burn behavior is such a feature
specific design, not a platform-wide retention default. Account-level deletion,
export, and statutory retention work remain platform lifecycle work and must
not be invented as per-feature consent prompts.

**Community** may present one combined feed and conversation ground. Every
post, group, comment, reaction, and direct-message thread carries its own
audience/scope/visibility policy. Role or perspective tags may explain why an
item is relevant and support filters such as Personal, School, or Community;
they cannot leak an item, copy it between role feeds, or authorize a reaction
or comment. A reply/reaction remains attached to the original item's policy
scope and is reauthorized on replay.

**Library** stays resource-rights first: roles may influence recommendations,
shelves, contribution, and curator visibility, but do not replace a resource's
read/license/owner policy. Personal reading progress remains private even when
the resource was discovered through an institutional role.

### Proposed versioned response shape

Keep `/identity/resolveIdentity` compatible during migration. Add an explicit
versioned server contract (for example `/identity/bootstrap/v1` and
`/capabilities/bootstrap/v1`) rather than silently changing its generated
`IdentitySchema` contract. Names are proposed; implementation must first
confirm route conventions and OpenAPI generation.

The capability response is bound to one verified subject. When an authorized
scope exists it contains the validated server-authoritative active scope;
otherwise it contains an explicit no-scope state and no scope capabilities:

```text
schemaVersion
subjectId
identityMode
identity: { displayName, lifecycle, onboarding }
activeScope: { bondId, entityId, entityType, capacity } | null
scopeSelection: { status: remembered | picker-required | no-valid-scope }
generatedAt / expiresAt
policyVersion / entitlementVersion / lifecycleVersion
platform / domainMode
features: [{ id, status, reason, allowedOperations, taskPolicy,
             storagePolicy, authorityRef, evidenceRef }]
```

The server response must be `private, no-store` for Next's server-side
fetch/cache boundary unless a later reviewed cache contract binds subject,
scope, versions, and expiry. Do not serialize bearer tokens, raw profile/DB
records, Cedar internals, secret policy data, or unrelated bond metadata into
the browser HTML/RSC payload. Error bodies are normalized and contain a
correlation/request ID, not database or policy implementation details.

`allowedOperations` controls UI affordances only. `export` must not be emitted
as authorized until the server policy vocabulary/handler contract explicitly
defines and verifies that operation; the existing shared Cedar registry
currently enumerates `read/create/update/delete/use_ai`, not `export`.

### Existing snapshot limitations

The signed `PermissionSnapshot` is useful native/offline authorization input,
but is not itself the proposed web feature bootstrap:

- it is generated for one user/bond/entity and signs policy version and expiry;
- it expires after 24 hours and the client verifies signature, subject/scope,
  policy-version match, and expiry;
- its generator evaluates resource/action combinations using synthesized
  dummy resource IDs and a limited set of relationship attributes. It must
  not be represented as per-resource authorization for classroom/student/task
  IDs or as proof of feature delivery;
- its action vocabulary omits `export`;
- current hydration stores are native-oriented PowerSync/Drizzle consumers.

The web bootstrap may reuse the server authorization facts and decision
functions, but must define its own safe transport/presentation projection and
must not load native storage modules into Next.

### Capability decision input ownership

`resolveCapabilityDecision` in `packages/core/src/logic/capabilityDecision.ts`
is a pure composition function, not a fact authority. `CapabilityFeatureDefinition`
is catalog/policy metadata; the web client cannot authoritatively fill
`authorization.decision`, citizenship, scope, entitlement, privacy readiness,
or lifecycle/flag state from local stores and then call that “server-computed.”
The server adapter must provide verified facts, and the browser adapter may
only map the versioned response to UI.

One additional policy gap must be resolved before Explore delivery: the pure
decision currently requires `authorization.decision.permitted === true` even
for local-only Explore features. That means an unauthenticated Explorer needs
an explicit local-exploration authorization rule (which must never grant
cloud/private records) rather than a fabricated Cedar allow. Add tests for
both safe local read/write and denial of production/private operations.

### Grounded feature spec — composing a versioned server capability response

#### Critique before source audit

The earlier response sketch was too confident in one important way: it listed
scope, Cedar, ZenStack, entitlement, flags, lifecycle, privacy, and platform
delivery together as if they were already a server-owned fact bundle. They are
not. Static declaration facts (privacy, lifecycle, platform delivery, default
availability) belong in a versioned feature manifest; runtime facts (selected
scope, applicable authz, and only declared entitlement/flag dependencies) come
from server authorities. Today, those sources are fragmented and no complete
feature manifest joins them. A pure function accepting caller-assembled values
would make the response look authoritative without making its facts
authoritative. Therefore no serializer or “server capability composer” should
be implemented until the minimum fact source set below exists.

#### Source audit: authoritative fact versus missing fact

| Response input | Existing source and what it proves | What it does not prove / missing source | Bootstrap consequence |
|---|---|---|---|
| Selected active scope | `apps/sanctuary-api/src/core/activeScope.ts` reads `userPreferences.active_bond_id`, then validates bond ownership, status, and validity window. `identityORPCContract.selectActiveScope` accepts a bond ID as a selection request; its handler validates ownership/status/time inside a transaction before persisting. `ScopeBootstrapSchema` v1 returns selected bond/entity/type/roles. | Identity bootstrap also returns `primaryCapacity` from `User.capacity` and `availableBonds`; neither is authorization. No formal scope lease/version is bound to an expiry. | Real and composable as a minimal scope fact after the selection handler succeeds; preserve the existing v0 identity contract. Never select the first bond or trust submitted IDs as authority. |
| Cedar action decision | `doubleGateMiddleware` evaluates Cedar for each protected oRPC procedure using that procedure's declared action/resource plus derived context facts. Hono POA also gates registered SovereignRoutes. | No current API maps each feature declaration to a safe presentation-level Cedar check. Operation-specific decisions are not interchangeable with a feature card decision; synthetic/dummy resources cannot establish record authorization. `export` is absent from `AUTHORIZATION_ACTIONS`. | Runtime authz is evaluated only for features whose declaration requires it and at a scope/resource granularity the policy supports. Bootstrap remains presentation-only; each actual operation reauthorizes. Missing required authz facts make only that feature unavailable. |
| ZenStack/data scope | `buildORPCContextFromHono` builds a request DB from verified user and resolves a valid persisted bond; `packages/schema/schema.zmodel` has model-specific `@@allow` predicates. | ZenStack model predicates are not a general feature manifest, and many predicates test all `auth().bonds`, not solely the currently selected bond. This can differ from a product-level active-perspective projection. | Treat ZenStack as row/data enforcement at actual query/mutation. Do not claim it provides a complete active-scope capability projection. Audit selected-scope semantics before relying on it for menu visibility. |
| Entitlement | `apps/sanctuary-api/src/core/app.ts::resolveServerEntitlement` reads `users.pricing_tier`, active grant rows, and `pricing_manifest`; it is invoked for SovereignRoutes that declare `metadata.entitlement`. `@repo/core` supplies pure tier/module comparators. | No common versioned entitlement snapshot is attached to identity scope bootstrap. ORPC procedures do not currently expose one general entitlement projection; API helper is private to route middleware. | Real for declared route checks, not a general feature-list fact. Only a feature declaring an entitlement dependency needs this runtime result; if absent/unavailable, that feature is unavailable, not the app. Expose through an owned server service before composition. |
| Feature flags/rollout | `FEATURE_FLAG_MANIFEST` declares flag metadata/safe defaults. Sanctuary `routeFeatureFlagMap` currently maps only `/powersync` and `/ai`; GrowthBook is optionally loaded server-side. | No server projection of per-user/per-feature flag values for the four domain catalogs, nor a rollout version/freshness contract. Client `FeatureFlagStore` is not server authority. | Flags are runtime facts only for features that declare a flag dependency. Missing flag data makes only that dependent feature unavailable/unknown; features with no declared gate use their declaration's default availability. |
| Feature lifecycle | `DomainEntrySchema` carries static `state` (`development`, `beta`, `live`, `deprecated`), lifecycle metadata, and coarse domain-level `mobileSupport`/`webSupport`; `FEATURE_FLAG_MANIFEST` provides flag lifecycle records. `resolveCapabilityDecision` can consume a static feature state. | Static declarations are not currently assembled into one complete, versioned server-consumable per-feature manifest. | Lifecycle belongs in a versioned static feature declaration, not a per-request authorization service. Current gap is declaration coverage/versioning, not a missing dynamic lifecycle lookup. |
| Account/bond lifecycle | Bond validity is checked in `activeScope.ts`. Account state has a status RPC/migration and core auth resolution. | Account lifecycle and feature lifecycle are distinct. No unified server read service composes both into a scope capability snapshot. | Active scope validity is usable; user lifecycle needs an explicit identity-bootstrap dependency if it gates entry. Do not infer it from feature `state`. |
| Privacy declaration | `privacyContract` and `privacy.orpc.contract` provide a privacy ledger API; `useConsentStore` records analytics consent. `resolveCapabilityDecision` accepts a privacy-readiness input. | The ledger is not feature consent; analytics consent is not consent for wellbeing/community/media data. No complete static per-feature privacy/retention declaration has been found. | Privacy classification, consent requirement, retention, local-cache, export, and deletion policy are static/versioned declaration fields. A runtime consent state is queried only for features whose declaration requires it; absence must block that feature alone, not the whole app. |
| Platform delivery | `DomainEntrySchema` declares coarse `mobileSupport`/`webSupport`; Self's capability function accepts native/browser. Platform files/registries are delivery evidence. | No complete per-feature platform declaration/version/evidence registry exists. File existence alone is not runtime proof. | Platform support is a static/versioned delivery declaration. Missing delivery declaration marks only that feature undeclared/unavailable; it does not block unrelated domains or features. |
| Identity/mode | JWT verification sets server `user.id`; no-token requests are anonymous; identity contract has `ScopeBootstrapSchema`; Explore/sandbox modes exist in product and persistence code. | Current `identityState` is a client/core classification. Server capability endpoint has no authenticated, versioned identity-mode projection with anonymous-vs-no-session semantics. | Subject can be verified; mode projection needs a trusted server rule. No browser local state may invent an authenticated or authorized identity. |
| Policy/entitlement/lifecycle versions | Snapshot service queries current `policy_version` hash and signs scope-bound `PermissionSnapshot`. | No combined version set for Cedar, ZenStack policy, entitlement, feature flags, lifecycle, privacy, delivery; permission snapshot is not the feature response. | Only the Cedar snapshot policy hash is currently real. Do not fabricate aggregate versions or freshness. |

#### Minimum response contract once the feature declaration is complete

The v1 capability projection must remain separate from
`/identity/resolveIdentity` and its existing `IdentityBootstrapSchema`. It
should contain only:

```text
schemaVersion
subjectId
identityMode (only when server-derived)
selectedScope { bondId, entityId, entityType, roles } | explicit no-scope state
generatedAt / expiresAt for the runtime portion only, under a defined freshness policy
runtime policy/evaluator version references actually loaded
declarationVersion
per-feature presentation: featureId, static lifecycle/default/delivery/privacy,
  plus runtime scope/authz and only declared entitlement/flag results;
  feature-local unavailable/undeclared reason; safe authority/evidence refs
```

The response is a short-lived presentation projection, never a bearer grant.
Do not include raw Cedar internals, broad entitlements, private profile fields,
all bonds, local flags, sensitive privacy metadata, or per-record grants.
Operation APIs continue running Cedar plus ZenStack and any applicable
entitlement checks. Do not include `allowedOperations` until each operation's
authority can be computed per feature without confusing it with per-resource
authorization.

#### Implementation blocker and decision

The source audit still does **not** support implementing the final server
composer now, but the reason is narrower than the first critique suggested.
Privacy, lifecycle, platform delivery, and default availability are static,
versioned feature-declaration facts; they are not dynamic authorization facts
and do not require per-request server services. The actual blocker is that no
complete canonical per-feature declaration/version exists, while current
runtime sources expose selected scope, operation-level Cedar/ZenStack checks,
route-specific entitlement, and a small route-specific flag map—not one
feature-level input bundle with explicit per-feature dependencies.

`resolveCapabilityDecision` is pure, but its caller can currently fabricate
missing feature definitions or pass arbitrary dynamic readiness booleans. A G0
test around those arbitrary values would not establish that the server
composes authoritative inputs. The next bounded step is to freeze a static
declaration schema/version that identifies each feature's default availability,
privacy contract, lifecycle, platform delivery, task/resource policy, and
whether it depends on authz, entitlement, or a flag. Then expose only those
declared runtime checks as server-owned inputs. An undeclared or unavailable
dependency blocks that one feature; it never converts into a global app gate.
After that declaration/fact boundary is accepted, implement and test the pure
composer. No G0 tests are added in this task, and no UI, identity schema,
onboarding, or PowerSync port is changed.

#### Critique after source audit

The safe parts of the prior architecture remain: selected scope must be
server-validated; operation APIs reauthorize; browser cache must be private
and no-store; identity compatibility contracts remain untouched; and Explore
must be local-only. Correction: privacy and platform delivery belong in
versioned declarations, not dynamic authz checks. A missing declared/runtime
dependency makes only that feature unavailable, never the whole app. The
unsupported part remains claiming that a complete feature capability snapshot
is implementation-ready today. The current system has strong separate
enforcement mechanisms but no complete declaration plus runtime composition
boundary. The order is declaration contract, narrowly scoped runtime facts,
pure composition/G0, transport, then Next presentation. No UI or local browser
authority is introduced here.

#### Exact source paths reviewed for this feature spec

- Scope selection: `apps/sanctuary-api/src/core/activeScope.ts`,
  `apps/sanctuary-api/src/core/handlers/identity.ts`,
  `apps/sanctuary-api/src/core/handlers/onboarding.ts`,
  `apps/sanctuary-api/src/core/router.ts`,
  `apps/sanctuary-api/src/core/onboardingBootstrap.ts`,
  `packages/core/src/api/identity.orpc.contract.ts`.
- Cedar/ZenStack: `apps/sanctuary-api/src/core/orpcMiddleware.ts`,
  `apps/sanctuary-api/src/core/app.ts`,
  `packages/policies/src/authorizationRegistry.ts`,
  `packages/policies/src/engine/evaluator.ts`,
  `packages/schema/schema.zmodel`,
  `packages/database/src/client.ts`.
- Entitlement/flags/lifecycle: `apps/sanctuary-api/src/core/app.ts`,
  `apps/sanctuary-api/src/core/orpc.ts`,
  `apps/sanctuary-api/src/core/routes/payhereWebhook.ts`,
  `packages/core/src/logic/ports/entitlement.port.ts`,
  `packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts`,
  `packages/core/src/logic/registry/featureLifecycleManifest.ts`,
  `packages/core/src/logic/registry/domainEntry.ts`,
  `packages/core/src/logic/accountLifecycle.ts`.
- Privacy/platform/capability: `packages/core/src/api/privacy.contract.ts`,
  `packages/core/src/api/privacy.orpc.contract.ts`,
  `packages/core/src/api/privacy.ts`,
  `packages/core/src/store/useConsentStore.ts`,
  `packages/core/src/logic/capabilityDecision.ts`,
  `packages/core/src/logic/__tests__/capabilityDecision.test.ts`,
  `packages/self/src/features/featureManifest.ts`,
  `packages/self/src/features/featureCatalog.ts`,
  `apps/gurudevi-web/app/(sanctuary)/self/browserFeatureRegistry.ts`.
- Snapshot comparator: `apps/sanctuary-api/src/authorization/permissionSnapshot.service.ts`,
  `apps/sanctuary-api/src/core/handlers/permissionSnapshot.ts`,
  `packages/core/src/api/permissionSnapshot.contract.ts`,
  `packages/policies/src/snapshot/generator.ts`,
  `packages/policies/src/snapshot/types.ts`.

These paths were materially inspected for this section. The policy corpus and
ZenStack schema were searched for relevant authorization rules, not
exhaustively proven equivalent across all model/action pairs; production
deployment state was not queried. Those remain explicit evidence gaps.

### Required implementation files and ownership lanes

The following are proposed boundaries; first inspect existing route/API
generation and update an existing owner where possible. Do not create a second
feature registry or duplicate authz implementation.

| Lane | Files to inspect/update | Responsibility |
| --- | --- | --- |
| Contract/schema | `packages/core/src/api/identity.orpc.contract.ts`, `identity.generated.ts` source schema/generator, `packages/core/src/api/server.ts` | Add additive versioned bootstrap contracts and strict response schemas; preserve v0 identity clients. |
| Auth context | `apps/sanctuary-api/src/core/router.ts`, `app.ts`, `onboardingBootstrap.ts`, request context tests | Permit authenticated identity-only bootstrap without active bond; do not relax unrelated protected routes. Require a subject and available server DB. |
| Identity service | `apps/sanctuary-api/src/core/handlers/identity.ts` or dedicated bootstrap service/router | Project only safe identity/onboarding facts. Derive anonymous/account state server-side; return typed missing/inactive/unavailable outcomes. |
| Scope/capability service | `apps/sanctuary-api/src/authorization/*`, existing Cedar evaluator and entitlement adapter | Validate selected bond ownership/status; compute minimal per-feature presentation facts bound to subject/scope/version. |
| Policy/action vocabulary | `packages/policies/src/authorizationRegistry.ts`, Cedar policies, `packages/schema/schema.zmodel`, policy parity tests | Resolve `export` and local Explore semantics explicitly; retain Cedar + ZenStack as operation authority. |
| Web adapter | `apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts`, a dedicated server-only bootstrap adapter, `lib/supabase/server.ts` | Verify claims, forward access token server-to-server, validate schema/version/subject, use no-store and safe errors. |
| Web route composition | `apps/gurudevi-web/app/(sanctuary)/self/page.tsx`, future Workspace/Community/Library layouts | Keep server bootstrap facts server-side; pass only minimal typed projection to client component. |
| Tests/evidence | API identity/bootstrap tests, core pure tests, `apps/gurudevi-web` test configs/routes | Prove each level below; no mobile Expo runner may substitute for Next evidence. |

### Ordered implementation and dependency gate

1. **Contract freeze:** decide response versions, identity modes, missing/inactive
   behavior, and active-scope selection; write strict schemas and backward
   compatibility tests.
2. **Identity bootstrap:** make the authenticated no-bond path work without
   granting scope; verify only the subject's lifecycle facts are returned.
3. **Scope selection:** validate client-selected bond against verified subject,
   membership/status, and relationship source. Do not fall back to first bond.
4. **Server capability projection:** join the static declaration version with
   validated scope and only the runtime authz/entitlement/flag checks declared
   by that feature. Bind runtime facts to their real versions/freshness. Missing
   data marks that feature unavailable; it does not deny the application or
   unrelated features. Keep per-operation reauthorization unchanged.
5. **Next adapter:** call versioned server endpoint after `getClaims`, verify
   returned subject and schema, avoid server-component caching, and expose only
   minimal UI projection.
6. **UI composition:** render bootstrap/loading/onboarding/scope-picker/ready/
   unavailable states; user must explicitly select scope where required.
7. **Explore mode:** separately prove local-only capability without a fake
   server Cedar grant and block every production read/write route.
8. **Deprecation:** only after app inventory and migration evidence, remove
   reliance on v0 `activeBond`/`availableBonds`; retain API compatibility until
   all known mobile/web callers are migrated.

No domain can claim `Live` until Stage A and Stage B are integrated, version
and expiry are checked, operation APIs reauthorize, and the required web
evidence levels pass.

### Next.js WEB-ONLY evidence sequence

`apps/gurudevi-web` now declares Vitest and Playwright dependencies, but its
package scripts still expose only dev/build/start/lint/typecheck. It has one
Node `node:test` workbench test file (`lib/workbench/store.test.ts`), not a
Vitest or Playwright config. Mobile's Playwright configuration targets Expo
ports 8081/4173 and is not Next evidence. Add the web test config/scripts in
the assigned web lane; do not reuse the mobile config. All test commands below
must flow through `scripts/run-and-report.mjs` with an explicit evidence
level.

| Order/level | Web-only required cases | Scenario count | Runner/command after adding named config |
| --- | --- | ---: | --- |
| 1 / G0 | Pure v1 schema/version validation (4); resolver order/deny default (6); identity-vs-scope separation (4); scope binding/expiry/version mismatch (5); local Explore policy (4); persistence namespace/no cloud-write (4); error projection sanitization (3) | 30 | `node scripts/run-and-report.mjs --cmd "pnpm exec vitest run --config vitest.config.ts tests/g0/**/*.test.ts" --cwd apps/gurudevi-web --name web-capability-g0 --evidence-level G0` |
| 2 / G1 | Claims error/signed-out/subject mismatch (4); token retrieval/refresh/fetch timeout/status/schema mismatch (6); selected bond missing/foreign/archived (3); Cedar/entitlement/lifecycle/flag/privacy unavailable or deny (5); no-store/cache boundary and error sanitization (3); Explore cloud-call/write rejection (4) | 25 | `node scripts/run-and-report.mjs --cmd "pnpm exec vitest run --config vitest.config.ts tests/g1/**/*.test.ts" --cwd apps/gurudevi-web --name web-capability-g1 --evidence-level G1` |
| 3 / G2 | Real versioned API route/service with deterministic DB/Cedar/entitlement adapters: new user/no scope (3); remembered scope valid across sessions/devices (3); deliberate multi-scope switch/persist (3); cross-user/invalid/revoked scope (4); concurrent switch/stale preference invalidation (2); policy/entitlement stale then refresh (2); anonymous and Explore isolation (3); endpoint reauthorization after stale UI allow (2); outage/fail-closed (2) | 24 | `node scripts/run-and-report.mjs --cmd "pnpm exec vitest run --config vitest.integration.config.ts tests/g2/capability-bootstrap.scenario.test.ts" --cwd apps/gurudevi-web --name web-capability-g2 --evidence-level G2` |
| 4 / G3 | Real React DOM/client components and server-to-client projections: onboarding before bond (2); scope picker (3); ready/locked/coming-soon/unavailable (4); loading/retry/offline (3); keyboard/focus/announcements/reduced-motion (4); no private/token serialization (2) | 18 | `node scripts/run-and-report.mjs --cmd "pnpm exec vitest run --config vitest.config.ts tests/g3/**/*.test.tsx" --cwd apps/gurudevi-web --name web-capability-g3 --evidence-level G3` |
| 5 / G4 | Built Next app in real Chromium: signed out entry (2); auth callback/session (3); no-bond onboarding (3); scope selection and switching (4); capability version expiry/refresh (3); each domain Overview truthful states (4); Explore writes stay local (3); route reauth/failure (3); keyboard/mobile portrait/mobile landscape/tablet/desktop (5) | 30 | `node scripts/run-and-report.mjs --cmd "pnpm exec playwright test --config playwright.config.ts" --cwd apps/gurudevi-web --name web-capability-g4 --evidence-level G4` |

**Required test files/configs not present at audit time:**
`apps/gurudevi-web/vitest.config.ts`, `vitest.integration.config.ts`,
`playwright.config.ts`, plus the scenario directories named above. Those are
work-package deliverables, not existing evidence. This matrix is future
required work: **0 of 5 levels implemented and 0 of 5 passing** for this
capability-bootstrap scope; all 127 named scenarios are pending (G0 30, G1 25,
G2 24, G3 18, G4 30). No generic capability or workbench test counts toward
these cases. Commands are exact after configs/files and package scripts exist;
running them before then is an expected setup failure, not a passing/blocked
product test. Evidence completion does not imply implementation completeness;
implementation coverage is tracked separately.

G3 also requires a real web DOM/component runtime. The repository has a
Vitest-native runtime for `@repo/ui` and a mobile `@testing-library/react`
dependency, but `gurudevi-web` does not declare a web React DOM testing library
or DOM environment. The G3 lane must use an existing workspace-owned real web
component runtime if one is available after dependency audit; otherwise add
the smallest intentional web test dependency/config as a separate approved
package change. Do not label jsdom mocks or the mobile native engine G3 web
evidence.

G0–G3 use Vitest but with progressively fewer substitutions; G4 executes the
Next app in a real browser and must cover minimum 360px narrow portrait,
short landscape, tablet, and desktop. G4 still does not prove a production
Supabase/Sanctuary deployment; that requires separate R1 rollout/telemetry/
rollback/soak evidence. Native G5 is outside this web-only matrix.

### Coverage accounting for this audit

Counts apply to the scoped identity/capability-bootstrap investigation, not
the entire repository. Discovery used filename/content search for resolve
identity, access context, Cedar, ZenStack, entitlement, and web authorization.

**Discovered and fully read/understood (41 file paths, scoped relevant sections):**

- `apps/gurudevi-web/package.json`
- `apps/gurudevi-web/tsconfig.json`
- `apps/gurudevi-web/lib/supabase/server.ts`
- `apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts`
- `apps/gurudevi-web/app/(sanctuary)/self/page.tsx`
- `apps/gurudevi-web/app/(sanctuary)/self/browserFeatureRegistry.ts`
- `apps/sanctuary-api/src/core/handlers/identity.ts`
- `apps/sanctuary-api/src/core/handlers/onboarding.ts` (identity/bond flow)
- `apps/sanctuary-api/src/core/handlers/permissionSnapshot.ts`
- `apps/sanctuary-api/src/authorization/permissionSnapshot.service.ts`
- `apps/sanctuary-api/src/core/onboardingBootstrap.ts`
- `apps/sanctuary-api/src/core/orpcMiddleware.ts` (bootstrap and double-gate sections)
- `apps/sanctuary-api/src/core/router.ts` (context builder)
- `apps/sanctuary-api/src/core/app.ts` (JWT, DB, POA bypass sections)
- `packages/core/src/api/identity.orpc.contract.ts`
- `packages/core/src/api/identity.generated.ts`
- `packages/core/src/api/permissionSnapshot.contract.ts`
- `packages/core/src/logic/auth/identityState.ts`
- `packages/core/src/logic/auth/bootstrapRoutes.ts`
- `packages/core/src/webAuthorizedEntry.ts`
- `packages/core/src/logic/permissions/accessContext.ts`
- `packages/core/src/logic/permissions/sanctuaryFeature.ts`
- `packages/core/src/logic/permissions/featurePresentation.ts`
- `packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts`
- `packages/core/src/adapters/cedar/cedarAuthorization.adapter.ts`
- `packages/core/src/store/useCedarDecisionStore.ts`
- `packages/core/src/logic/permissions/localEvaluator.native.ts`
- `packages/core/src/store/useEntitlementStore.ts`
- `packages/core/src/store/useFeatureStore.ts`
- `packages/core/src/lib/persistenceBoundary.ts`
- `packages/core/src/logic/capabilityDecision.ts`
- `packages/policies/src/authorizationRegistry.ts`
- `packages/policies/src/snapshot/generator.ts` and `snapshot/types.ts`
- `packages/database/src/client.ts`
- `packages/schema/schema.zmodel` (User/Bond policy clauses)
- `packages/core/src/logic/__tests__/capabilityDecision.test.ts`
- `apps/gurudevi-web/lib/workbench/store.test.ts`
- `scripts/run-and-report.mjs`
- `apps/sanctuary-api/vitest.config.ts`
- `apps/gurudevi-mobile/playwright.config.ts` (read to establish it is Expo-only)
- `apps/gurudevi-mobile/package.json` (test-level naming)

Some files are understood only for the named relevant section, not every
unrelated handler/test in that file. Three additional implementation sources
were discovered but not fully read, giving a scoped discovery denominator of
44: **41/44 fully read/understood; 3/44 discovered but not fully read**.

**Discovered but not fully read/understood (3 primary implementation gaps):**

- `packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts` and
  server entitlement resolution implementation;
- the full `apps/sanctuary-api/src/jwt.ts` verification claim contract;
- generator source for `packages/core/src/api/identity.generated.ts` and
  OpenAPI contract generation/compatibility pipeline.

These are required before implementation; direct consumer-generated schema
editing is prohibited.

**Materially integrated by this documentation update:** 0 runtime files. The
readiness authority now records 41 inspected source paths, a two-stage
identity/scope model, endpoint/context contradiction, versioned contract,
implementation ownership, WEB-only G0–G4 sequence, and the decided
cross-device scope preference. Earlier runtime gate files already present in the worktree include
`capabilityDecision.ts`, `persistenceBoundary.ts`, and
`FeatureStateBoundary.tsx`; their existence does not integrate a server
bootstrap or browser adapter. The readiness document materially incorporates
the findings from 41/44 discovered sources; the three unread sources remain
an explicit pre-implementation gap.

**Implementation file material integration coverage:** 0 of the proposed 9
lanes above. Do not mark this proposal as delivered until each lane reports
its exact file list and evidence. The audit itself changed only this authority.

### Issue register

# FEATURE SPEC — authoritative account scope bootstrap

**Status:** approved for implementation; this spec is not delivery evidence.

**Blast Zone:** identity bootstrap, initial Personal Sanctuary Bond creation,
durable active-scope selection, and same-perspective role projection only.

**Target File:** `packages/schema/schema.zmodel`; one additive migration under
`apps/gurudevi-mobile/supabase/migrations/`; shared contracts
`packages/core/src/api/identity.orpc.contract.ts` and
`packages/core/src/api/onboarding.orpc.contract.ts`; authoritative handlers
`apps/sanctuary-api/src/core/handlers/identity.ts` and
`apps/sanctuary-api/src/core/handlers/onboarding.ts`; request authorization
context in `apps/sanctuary-api/src/core/router.ts` and
`apps/sanctuary-api/src/core/app.ts`; narrow helpers at
`apps/sanctuary-api/src/core/activeScope.ts` and
`apps/sanctuary-api/src/core/platformBondProvision.ts`; focused tests in
`apps/sanctuary-api/src/__tests__/identity-scope-bootstrap.test.ts` and
`apps/sanctuary-api/src/__tests__/identity-scope-context.test.ts`. Keep logic local to this seam unless an existing typed
helper is found and reused. Do not edit generated identity artifacts directly.

**Contract:** identity bootstrap is versioned and server-derived. It returns
the authenticated identity display name, legacy primary capacity as a
presentation/default-entry hint only, and either (a) the remembered valid
active bond plus all valid capacity roles attached to that same entity
perspective, or (b) an explicit `needs_selection` state. The first
Personal-Classroom compatibility bond is selected atomically during initial
onboarding. Later selection changes are explicit validated operations; this
slice must not infer selection from `User.capacity`, a request header, or the
first database row. Client input may supply onboarding profile/orientation
facts only; it cannot nominate another user's bond, choose an arbitrary
active scope, or mint authority. The personal bond carries the user's chosen
ordinary capacity, but that relationship is explicitly scoped to the user's
Personal Sanctuary; `Bond.user_id` plus the owned `PersonalClassroom.user_id`
records self-ownership. It grants no Workspace, Community, or Library
authority. Privileged primary capacities (`admin`, `founder`, `developer`)
cannot be client-selected during onboarding; server subject configuration
provisions platform roles separately. Workspace access requires validated institutional/classroom bonds;
Community access requires membership plus record visibility; Library access
requires resource rights/entitlement. Founder authority is provisioned only
for configured server-side subject IDs. Developer authority may be provisioned
to configured production dogfood subjects as a narrowly scoped internal
capability, and to configured subjects in Development; it is never a global
authorization bypass or cross-tenant data grant.

**Persistence:** persist `UserPreferences.active_bond_id` with an FK to Bond
and database-enforced same-user ownership (including writes outside the API).
Persist Bond lifecycle `active | archived | revoked`, `valid_from`, and
`valid_until`; only currently valid active rows contribute roles. Preserve
the existing role-per-bond source of truth; do not introduce a second
`roles[]` database field. Onboarding must be idempotent and transactionally
create/reuse the personal compatibility entity and bond, persist the selected
bond, and update onboarding/profile fields; return the typed bootstrap.
Missing/invalid remembered scope produces `needs_selection`; never substitute
another bond.

The initial chosen ordinary capacity is persisted. A later different ordinary
capacity is only a proposal: the typed API input has an explicit
`confirmCapacityChange` boolean defaulting to `false`. False or omitted keeps
the prior Personal Sanctuary bond capacity and `User.capacity` projection;
only explicit `true` updates those two values together in the onboarding
transaction. The web adapter must ask in a confirmation modal whose default is
No before sending true. This operation must not mutate institutional,
Community, or platform bonds; privileged capacities remain server-provisioned.
The focused boundary test must prove first-choice persistence, change proposal
with omitted/default-No confirmation retaining the stored value, confirmed
change updating only the owned personal bond, and rejection of non-personal
targets. The browser confirmation modal is a later web adapter obligation;
the server contract remains the authority.

**Migration validation plan (not yet evidence):** in a local real Postgres / Supabase
database, apply the named additive migration and verify: same-owner active
selection succeeds; cross-owner selection fails; archived/revoked/future/expired
bonds cannot be selected; changing a selected bond's owner or lifecycle clears
the remembered pointer; deleting the selected bond sets the pointer to null.
The G0/G1 API tests do not prove any of these trigger/FK behaviors.

**Reuses:** retain `User.capacity` as the existing compatibility projection,
`Bond.capacity` as the relationship role, `PersonalClassroom` with
`entity_type=PERSONAL_CLASSROOM` as the current self-owned Personal Sanctuary
representation, and the user's primary capacity only as its scoped
presentation/relevance role,
the existing `onboardingContract`/`identityORPCContract` and oRPC handler
patterns, `SovereignError`, `context.db.$transaction`, and
`@repo/core/logic/permissions/bondScope` where its validated projection fits.
Keep the existing identity endpoint as the bootstrap entry point rather than
growing a parallel identity service.

**Does NOT:** no browser/mobile adapter or PowerSync edits in this slice;
no generated schema edits; no unrelated API context/JWT/entitlement redesign;
no authorization based on primary capacity; no first-bond or hidden fallback;
no duplicate role authority; no migration backfill that guesses a user's
selection from capacity/order; no claim that G0/G1 proves cross-device,
database-trigger, browser, or production behavior. Context changes must keep
authenticated identity/bootstrap callable without a selected scope; ordinary
scope-bound procedures must receive only the validated persisted selection
(or a separately explicit and ownership-validated scope, never an arbitrary
header as authority).
**Initial Personal Sanctuary invariant:** onboarding requires a mandatory,
user-chosen ordinary capacity and places that capacity on the self-owned
Personal Sanctuary bond. There is no generic onboarding/default/fallback
capacity. `member` is reserved for concrete domain membership relationships.

**Complexity Budget:** one additive migration; one exported versioned response
schema; changes confined to the listed contracts, two handlers, and request
context paths; focused G0 contract/pure projection/config cases and G1 mocked
handler/context boundary cases. The only new configuration keys are
`SANCTUARY_PLATFORM_FOUNDER_SUBJECTS` and
`SANCTUARY_PLATFORM_DEVELOPER_SUBJECTS` (comma-separated authenticated subject
IDs; never expose their values client-side). Developer provisioning in
Development additionally requires `NODE_ENV=development`; production dogfood
provisioning uses the same explicit subject allowlist, but must remain bounded
to policy-defined internal/testing/flag capabilities. Do not add a generic identity
framework, a second endpoint family, or broad refactors.

Proof status is static source inspection, not a test result. Runtime behavior
remains unproven until its named evidence gate passes.

| ID | Issue / evidence | Owner | Severity | Proof status | Remediation gate | User decision |
|---|---|---|---|---|---|---|
| I-01 | POA middleware exempts identity resolution, but API context separately rejects authenticated no-bond users except onboarding procedures. | Sanctuary API | P1 | Code-inspected; scenario not run | G1/G2 no-bond identity path | None |
| I-02 | Identity handler selects profile-capacity match then first bond; API context also falls back to first bond. | Sanctuary API | P1 | Code-inspected; behavior not exercised | G0/G2 no-fallback and remembered-scope cases | Resolved: server remembers last explicit valid scope across devices |
| I-03 | Identity compatibility response includes available bonds/scope metadata; minimum disclosure boundary is not established. | Sanctuary API + Web | P1 | Code-inspected; browser payload not tested | G1/G3 privacy and serialization checks | None |
| I-04 | Hono app and oRPC identity paths coexist; production route ownership and contract parity are unknown. | Sanctuary API | P1 | Both paths discovered; deployment unverified | G2 route/service integration | None |
| I-05 | No-bond/anonymous fallback may diverge from generated identity schema, including sentinel identity values. | Core API + Sanctuary API | P1 | Schema/handler inspected; compatibility not tested | G0 strict schema and G2 endpoint response | None |
| I-06 | Next authorized-entry adapter has no versioned capability-bootstrap contract/response validation. | Web + Core API | P1 | Code-inspected; proposed bootstrap absent | G0/G1 adapter; G2 integration | None |
| I-07 | Scope/capacity currently comes from client header/profile matching or first-record fallback, not persisted active scope. | Sanctuary API | P1 | Code-inspected; persistence path not exercised | G0/G2 active-scope selection and revocation | Resolved: cross-device server preference |
| I-08 | Scope header is untrusted; durable preference, revocation, and switch invalidation contract are absent. | Sanctuary API + Authorization | P1 | Partial checks inspected; lifecycle unverified | G1/G2 foreign, revoked, stale, switch, concurrency cases | None |
| I-09 | Permission snapshot uses synthesized resource IDs/limited relationships; it cannot prove per-resource access. | Authorization + Policies | P1 | Generator inspected; scenarios not run | Contract freeze + G0/G2 claim-boundary cases | None |
| I-10 | Shared operation registry omits `export` while feature/presentation surfaces may mention it. | Policies + API handlers | P1 | Registry inspected; full parity unverified | G0 vocabulary/parity gate before exposing export | None |
| I-11 | Pure capability decision requires Cedar permit for local Explore; explicit local-only authorization rule is absent. | Core + Explore/Web | P1 | Resolver inspected; browser scenario not run | G0/G1/G2 local allow and cloud/private deny | None |
| I-12 | Capability decision composes facts but no versioned server authority supplies them yet. | Sanctuary API + Web | P1 | Code-inspected; bootstrap absent | All implementation lanes; no Live claim before gates | None |
| I-13 | Cedar decision store/hydration is native-oriented and cannot be assumed safe/loadable in Next. | Core + Web | P1 | Imports/stores inspected; Next bundling untested | Web adapter architecture and G3/G4 | None |
| I-14 | Client entitlement/feature stores are persisted state, not authority; web subject/scope invalidation is unproven. | Core + Web | P1 | Store code inspected; browser lifecycle untested | G1/G2 stale subject/scope/version cases | None |
| I-15 | Persistence namespace implementation does not itself encode all required scope/domain/resource dimensions; enforcement depends on adapter integration. | Core + Web + Mobile | P1 | Boundary inspected; adapters not exhaustively traced | G0 namespace matrix and per-adapter G1/G2 | None |
| I-16 | Explore local-write isolation and production API denial lack end-to-end proof. | Explore + Web + API | P1 | Partial code inspected; scenarios not run | G0/G1/G2 isolation matrix | None |
| I-17 | Next has no own Vitest/Playwright configs/scripts or real DOM component runtime; mobile browser config targets Expo. | Web | P1 | Manifests/config inspected | Test-infrastructure work package before matrix execution | None |
| I-18 | Entitlement adapter/server resolution, full JWT claim contract, and identity schema generator pipeline were discovered but not fully read. | Core + Sanctuary API | P1 | 3 source areas explicitly unread | Close coverage gap before contract freeze | None |
| I-19 | G0–G4 matrix is future work, not implemented/passing; tests cannot establish lane integration or implementation completeness. | Web + QA/Platform | P1 | Config absence inspected; matrix commands not run | Execute exact scenario denominators; track implementation coverage separately | None |
| I-20 | G4 cannot establish production Supabase/Sanctuary correctness, rollback, telemetry, or soak behavior. | Platform/SRE + Product | P2 | Not executed; outside browser matrix | Separate R1 production evidence | None |
| I-21 | `Bond` has one scalar `capacity`, but no status field or declared uniqueness/precedence constraint; ZenStack policies inspect the whole `auth().bonds` collection while mobile also falls back to legacy `User.capacity`/first available bond. The mobile institutional perspective already models `roles[]` plus primary `capacity`, but server persistence/effective-role projection does not. | Schema + Authorization + Mobile + Web | P1 | Schema, policy expressions, mobile perspective types/switcher, and permission hook inspected; production data shape unverified | Contract freeze: derive one scoped `roles[]` set from valid role bonds, retain an explicit primary capacity for presentation/default entry, and remove first-record/legacy fallback from authority | Resolved: valid roles in one selected perspective combine; primary capacity is presentation/default entry only |
| I-22 | Explore requires a visible local persona/capability switcher so visitors can inspect roles and entitlements, but must never turn that selection into cloud identity, Cedar authority, or private data access. | Explore + Web + Core | P1 | Product decision recorded; adapter absent | G0–G4 local persona matrix and cloud-denial cases | Resolved: permit local persona/entitlement exploration only |
| I-23 | “Capacity” has overloaded meanings. Static audit found 17 direct `User`/profile-capacity references in 11 files, 3 first-bond selections, and 38 active-bond-capacity references in 31 files. `User.capacity` entered the schema in May and first-bond behavior predates the current migration; neither history nor a symbol match proves each consumer is removable. `Bond.capacity` remains the real relationship-role field. | Core + Schema + API + Mobile + Web | P1 | Static usage and Git-history audit only; runtime/data migration impact unverified | Classify every direct user/profile-capacity consumer as presentation compatibility, onboarding input, or authorization fallback; migrate only the latter to server-issued active scope/roles, then remove schema compatibility after data migration and evidence | Resolved: do not purge relationship capacity; retire legacy profile/first-record authority only after audit |
| I-24 | Mobile exposes the perspective switcher in Workspace chrome, but `usePermissions` derives access for all domains from the same active perspective. Self, Community, and Library can therefore change capability behavior without equally visible scope/role context. | Shell + Mobile + Web | P1 | Mobile layout, switcher, and permission hook inspected; user study/runtime behavior unverified | Shared shell must show current active scope/role wherever it changes domain affordances, and make deliberate switching reachable without making every tab a Workspace screen | Resolved: perspective is cross-domain plumbing, not Workspace-only state |
| I-25 | Existing mutation outbox de-duplicated identical commands across accounts because the deterministic key omitted user identity. New port writes are account-bound; queue de-dup now includes user salt and recognizes legacy keys when an existing record carries the same account. Legacy persisted records without `userId` remain unassigned by the port. | Core outbox | P1 | G0 regression reproduced red, then fixed; final neutral-port G0 passed | Account-bound queue migration/replay cases and account-switch tests before broader outbox adoption; never infer owner for an untagged legacy record | None |

### Questions that actually require user input

The user decided that the server remembers the last explicitly selected valid
active scope across devices, and that Explore may switch local demo personas,
roles, and entitlements while remaining unable to reach cloud/private data.

The user also decided that valid roles in the same selected perspective combine
for the server-computed capability set. The initial selected capacity is the
primary/default role used for entry and presentation; it is never an arbitrary
or client-derived authorization fallback. The implementation must derive this
from valid server relationships and preserve it across offline hydration
without granting cloud operations from a stale local cache.
# Web account-entry implementation sequence — 2026-09-18

The browser has two deliberately separate entry families:

| Family | Canonical routes | Persistence and authority |
| --- | --- | --- |
| Explore | `/explore/<domain>` | Local browser fixtures only. No Supabase account is required and no cloud write may occur. |
| Account Sanctuary | `/<domain>` (`/self`, `/workspace`, `/community`, `/library`) | Supabase session is transport only; the Sanctuary API resolves the remembered selected scope and authorizes every operation. |

The direct account entry is `/self`; `/sanctuary` is a compatibility entry state, not the account application's canonical home. The marketing root may invite a visitor to Explore or sign in, but it must not be mistaken for the authenticated application.

Implementation order for the account-entry seam:

1. Refresh Supabase cookies for every real account route, not an unused `/sanctuary/*` matcher.
2. On a signed-out direct account request, render a safe sign-in route with a validated local return path.
3. After sign-in or confirmation, route only to that validated real account destination. The server-resolved entry decides whether onboarding/scope selection is required; the browser does not infer a role.
4. Offer sign-out only in the real account shell. Explore never reads, creates, or clears an account session.
5. Verify signed-out entry and Explore separation in a real browser. Verify a configured Supabase sign-in/sign-up/sign-out cycle separately; no test account or credentials are fabricated.
