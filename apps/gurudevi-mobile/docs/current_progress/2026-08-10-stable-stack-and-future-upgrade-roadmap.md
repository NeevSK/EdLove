---
title: "Gurudevi Stable Stack and Future Upgrade Roadmap"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, dependencies, drizzle, effect, powersync, zenstack, expo, launch]
---

# Gurudevi Stable Stack and Future Upgrade Roadmap

## Purpose

This is the dependency and data-platform roadmap for the October 6, 2026 Gurudevi
launch. It separates stable upgrades that are appropriate for the launch train from
future major-version work that should be prepared now but adopted only after its
upstream ecosystem is ready.

The governing rule is:

> Be current on stable releases; be prepared for major releases; do not make a launch
> depend on a beta or release candidate.

## Verified baseline — August 10, 2026

| Area | Repository baseline | Upstream status | Decision |
| --- | --- | --- | --- |
| ZenStack | 3.8.x requested; lockfile pins 3.8.0 | 3.8.3 stable; 3.9.0-beta.1 canary | Align all ZenStack packages to 3.8.3; do not adopt 3.9 beta for launch |
| ZenStack Zod | `@zenstackhq/zod` 3.8.x; Zod 4.3.6 | Zod 4.4.3 latest | Upgrade only as one tested ZenStack/Zod unit |
| Drizzle ORM | 0.45.2 | 0.45.2 latest stable; 1.0 release candidates available | Keep 0.45.2 for the launch baseline; run a Drizzle 1 spike separately |
| Effect | 3.22.0 | 3.22.0 stable; Effect 4 beta | Keep Effect 3.22.0; prepare an Effect 4 migration branch, not production adoption |
| PowerSync Drizzle driver | 0.7.3 | 0.8.0 available; integration remains beta | Test the 0.8 line with the exact Expo/RN/Drizzle matrix before adopting |
| PowerSync native/local packages | Several 1.x/0.x packages | Multiple current major lines exist | Upgrade as a synchronized PowerSync release train, never package-by-package |
| Expo | SDK 57 / Expo ~57.0.9 | SDK 57 remains stable; Expo 57.0.11 is available | Take only a patch update after native build verification |
| Sacred native pins | RNGH 3, Reanimated 4, MMKV 4, Skia, TypeScript 7 | Project-specific compatibility contract | Do not change without explicit approval and physical-device testing |

The current stable version decisions are based on the official package registries and
vendor documentation listed in [Sources](#sources). Release status must be rechecked
before each upgrade window because the ecosystem is moving quickly.

## Architecture stance

These technologies have complementary jobs:

- ZenStack/ZModel is the server/domain model and authorization contract.
- ZenStack Zod is the generated validation boundary derived from that contract.
- Drizzle is the typed local SQLite query compiler used with PowerSync.
- PowerSync is the replication and reactive local-data engine.
- Effect is the service/runtime/effect boundary for reliable asynchronous workflows,
  retries, cancellation, and typed failures.
- Supabase/Postgres remains the cloud persistence and migration target.

Do not make ZenStack and Drizzle co-own the same schema. The parity system should
compare the server model, remote Postgres metadata, and local PowerSync/Drizzle
schema, while each layer keeps one clear authority.

## Stage 0 — Freeze the launch contract

**Window: August 10–16, 2026**

- Record the exact package graph and lockfile hash.
- Align ZenStack CLI, ORM, schema, policy, SDK, and Zod plugin packages to one
  stable version.
- Keep Drizzle at 0.45.2 and Effect at 3.22.0.
- Define the launch-critical flows: authentication, onboarding, classroom creation,
  attendance, assignment/grading, community messaging, Self logging, offline sync,
  and migration/rollback.
- Make the database parity command a required pre-release check.
- Generate and review the database object inventory; every unmodeled object must
  have an owner and reason before it can be accepted or ignored.

**Exit gate:** clean install, generated schema committed, ZenStack validation passes,
parity report is reproducible, and every launch-critical flow has an owner.

## Stage 1 — Stable alignment and parity

**Window: August 17–30, 2026**

- Update ZenStack packages to the latest stable 3.8 line.
- Evaluate Zod 4.4.3 with the generated ZenStack Zod factory.
- Evaluate PowerSync's current stable package set as a synchronized matrix:
  `@powersync/drizzle-driver`, `@powersync/op-sqlite`, `@powersync/react`,
  `@powersync/react-native`, and `@powersync/web`.
- Keep the current Drizzle API during this stage; do not mix the Drizzle 1 API into
  launch code.
- Validate local schema indexes, generated SQL, sync rules, outbox writes, watch
  queries, secure storage, and native development builds.
- Build an RPC/offline capability matrix: classify each RPC as read-only,
  online-only command, retryable command, or locally queueable mutation. Do not
  implement invite claiming separately from this matrix; use it as the first
  representative command while the broader audit is completed.
- Apply and verify the database parity/index/RLS migrations in a staging Supabase
  project before production.

**Exit gate:** stable dependency set builds on Android and iOS, offline writes
reconcile, PowerSync watches remain correct, and database parity has no unowned
critical drift.

## Stage 2 — Drizzle 1 readiness spike

**Window: August 24–September 6, 2026; isolated branch**

Drizzle 1 is valuable, but it is a migration project, not a version bump. The spike
must cover:

- Drizzle relational-query v1 usage versus the v2 `defineRelations` API.
- Casing configuration changes.
- PowerSync's Drizzle driver and `DrizzleAppSchema` conversion.
- `toCompilableQuery` output for every important local query.
- SQLite indexes, booleans, dates, arrays/JSON representations, and pagination.
- Existing tests, web builds, Android/iOS development builds, and sync behavior.
- Migration metadata changes and whether Supabase migrations remain exclusively
  Supabase-owned.

**Decision gate on September 7:** adopt Drizzle 1 only if the stable release exists
and PowerSync explicitly supports it, or the full release-candidate matrix passes with
an approved rollback. Otherwise pin 0.45.2 through launch and keep the spike as a
post-launch migration asset.

## Stage 3 — Effect 4 readiness spike

**Window: September 1–13, 2026; isolated branch**

Effect 4 is currently beta. The spike should focus on a narrow vertical slice rather
than converting the repository wholesale:

- one API service boundary;
- one PowerSync sync/reconciliation workflow;
- one database migration/parity command;
- one retry/cancellation path;
- one test suite using the intended runtime layers.

Measure bundle size, React Native/Hermes compatibility, TypeScript 7 behavior,
debuggability, error reporting, and interoperability with existing Effect 3 code.

**Decision gate on September 14:** Effect 4 enters production only after a stable
release and a green mobile/backend matrix. Otherwise launch on Effect 3.22.0 and keep
the adapter boundaries ready for a post-launch conversion.

## Stage 4 — Launch hardening and freeze

**Window: September 15–October 6, 2026**

- Freeze major/minor dependency changes.
- Allow only security patches, Expo patch updates, and proven build fixes.
- Run physical-device tests on supported Android and iOS targets.
- Run offline/online conflict tests, interrupted sync tests, auth expiry tests, and
  migration rollback rehearsals.
- Verify Supabase migrations in staging and production-like data volumes.
- Produce a release candidate and repeat parity, type-check, lint, test, and build
  checks from a clean checkout.
- Do not introduce Drizzle 1 or Effect 4 during this stage unless the decision gates
  were already passed and the change has a release-candidate soak period.

## Post-launch stages

### Stage 5 — Observability and measured optimization

**October 7–31, 2026**

- Capture real query shapes, sync latency, local query timings, error rates, and
  conflict/retry counts.
- Use `EXPLAIN (ANALYZE, BUFFERS)` for the highest-volume Postgres queries.
- Remove unused indexes and add only indexes justified by measured query plans.
- Add cursor pagination to growing feeds and histories.
- Revisit BRIN/partitioning only when measured table size and maintenance cost justify
  it; do not partition preemptively.

### Stage 6 — Adopt the next stable generation

**November 2026 onward**

- Adopt Drizzle 1 if it is stable and PowerSync-compatible.
- Adopt Effect 4 if it is stable, supported on the mobile/backend toolchain, and the
  vertical spike has demonstrated a safe migration path.
- Upgrade PowerSync as a coordinated release train.
- Migrate one bounded domain at a time, beginning with a low-risk read-heavy local
  surface before attendance, grading, or outbox-critical writes.
- Maintain rollback branches and keep the pre-upgrade release available until real
  devices and production telemetry are clean.

## Required upgrade artifacts

Every dependency stage must produce:

1. a version matrix with direct and peer dependencies;
2. a changelog/breaking-change review;
3. a clean-install result;
4. generated-schema and migration diffs;
5. Android, iOS, web, and backend validation results;
6. performance and bundle-size comparison;
7. rollback instructions;
8. an explicit adopt/hold decision.

## Sources

- [Drizzle package versions](https://www.npmjs.com/package/drizzle-orm?activeTab=versions)
- [Drizzle v0 to v1 changes](https://orm.drizzle.team/docs/v0-v1-changes)
- [Drizzle relational-query migration](https://orm.drizzle.team/docs/relations-v1-v2)
- [Effect package versions](https://www.npmjs.com/package/effect?activeTab=versions)
- [Effect release history](https://github.com/Effect-TS/effect/releases)
- [ZenStack ORM package versions](https://www.npmjs.com/package/%40zenstackhq/orm?activeTab=versions)
- [Zod package versions](https://www.npmjs.com/package/zod?activeTab=versions)
- [PowerSync Drizzle driver](https://www.npmjs.com/package/%40powersync/drizzle-driver)
- [PowerSync JavaScript ORM overview](https://docs.powersync.com/client-sdks/orms/js/overview)
- [Expo SDK reference](https://docs.expo.dev/versions/latest/)

## Validation note

The Expo 57.0.11 patch is locked, but `expo config --json --full` currently stops
while loading `lottie-react-native` as a config plugin (`Unexpected token 'typeof'`).
This is a separate app/plugin compatibility issue to resolve before native build
verification; it is not a reason to move to an Expo major or to run an automatic
dependency fixer.
