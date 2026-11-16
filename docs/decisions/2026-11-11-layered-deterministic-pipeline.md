---
title: "A layered, deterministic pipeline: canonical sources, gates and tools"
status: "draft"
created: 2026-11-11
updated: 2026-11-11
author: "Naveen"
scribe: "Claude"
tags: [decision, pipeline, layers, cross-cutting, schema, zenstack, tools, agents]
---

# A layered, deterministic pipeline

A decision brief. It proposes; the owner decides. The aim: every agent session runs the same
steps, in the same order, and a step either passes on evidence or fails loudly, so work stops
being verbal and reinvented each time.

## Words

| Word | Meaning | Here |
| --- | --- | --- |
| **Layer** (tier) | A horizontal level every request passes through | Database, data access, API, sync, client logic, client storage, screen |
| **Vertical slice** | One feature cut through all layers | Arrive (sign in → first bond → snapshot → tabs) |
| **Cross-cutting concern** (quality attribute) | Something every layer must handle, inside itself | Schema, validation, authorization, idempotency, errors, state, caching, retries and timeouts, concurrency, observability, versioning |
| **Canonical source** | The one place a fact is declared | Today: unclear for most cells |
| **Derived artifact** | Generated from the canonical source, never edited by hand | Types, Zod, model, OpenAPI |
| **Gate** | A check that fails when a derived artifact or the code drifts from the source | Ratchets, `audit:conformance`, `likec4 validate` |
| **Golden path** | The ordered steps an agent follows for a kind of change | Proposed below |

## The data layer: granular judgement, not a binary choice

`scripts/schema-ledger.mjs` classifies every table using ZenStack's own introspection
(`zen db pull` into a temp file; `schema.zmodel` is never written) plus who uses each one.
First run, 2026-11-11:

| State | Tables | Judgement each item needs |
| --- | --- | --- |
| Both, columns match | 90 | None |
| Both, columns differ | 10 | Per column: model behind (e.g. `bonds.citizenship`, added 2026-11-06), or database leftover |
| Database only | 379 | Per table: describe in the model (something will use it), mark internal (audit, system, PowerSync), or candidate for removal (Deletion Veto) |
| Model only, no table | 15 | Per table: write the migration (intended) or take it out of the model |
| Used, exists nowhere | 8 | Per caller: fix the caller or create the table |
| Device local-only | 3 | None (deliberately never replicated) |

**Proposal:** record each judgement as data, not prose: a decisions file keyed by table and
column (`decision`, `reason`, `date`, `by`). The ledger reads it and reports items with no
decision; the count of undecided items is a ratchet that may only fall. Each item is judged on its
own evidence, and nothing is forced into one global rule.

**Direction of truth** (proposed, per kind of fact, not one answer for everything):

| Fact | Canonical | Derived |
| --- | --- | --- |
| Tables, columns, constraints | SQL migrations (222 today) | `schema.zmodel` via `zen db pull`, then types and Zod via `zen generate` |
| Row-level security, functions, triggers, grants, `pg_cron` | SQL migrations | Nothing (they don't fit a model); tested with pgTAP |
| API capabilities | The catalog (`catalog.ts`) | Contract checks, OpenAPI |
| Device tables | Derived from the model plus the sync streams | `AppSchema` (today hand-written, drifted) |
| Sync scope | `powersync/sync-config.yaml` | Checked against the model |

Open: ZenStack's place at runtime. It can be the API's data access (typed queries with access
policies, on Kysely), which removes raw SQL strings, but adds a third authorization layer beside
Postgres row-level security and Cedar. Each layer then needs one stated job.

## Layer × concern matrix

What exists (seen in code this week) and what would make each cell deterministic. "Gate" names
the check; tools marked ✓ were verified on their registry on 2026-11-11.

| Layer | Concerns already handled | Missing gate | Tool |
| --- | --- | --- | --- |
| Database | Migrations, row-level security, statement and lock timeouts, `pg_cron` retention | Migration safety on new files; RLS tests; schema drift | Squawk 2.72.0 ✓ (installed); pgTAP via `supabase test db`; the schema ledger |
| Data access | Raw SQL through `pg`, re-checked identity per transaction | SQL checked against the real schema | ZenStack 3.10.1 (installed, unwired) or Kysely with generated types |
| API | Contract (Zod), errors (error map), idempotency (operations store), budgets, audit, timeouts | Breaking-change check; live fuzzing; one enforcement point (Gate 2) | `@orpc/openapi` (cohort) → Spectral 6.17.1 ✓ + oasdiff + Schemathesis |
| Authorization | Cedar 4.14.0, signed snapshots, bonds under lock | Policy validation in CI | Cedar CLI `validate` |
| Sync | Streams, owned grants (live-proven) | Streams checked against the model | PowerSync CLI 0.10.3 `validate` |
| Client logic | Feature gate, stores, snapshot refresh, offline queue | Device schema derived, not hand-written | Generated from the model |
| Client storage | op-sqlite + SQLCipher, SecureStore, MMKV | Column drift check that reads the real database | The ledger's device column |
| Architecture | C4 model, LikeC4 MCP | Model kept current | `likec4 validate` ✓ (installed) |
| Supply chain | Cohorts, release-age guard | Vulnerabilities, secrets | Syft 1.55.0 ✓ (installed), osv-scanner, gitleaks |
| Runtime truth | Live hop probe | Real-traffic traces; load | OpenTelemetry; k6 2.3.0 (needs admin install) |

## The pipeline

Built on what the repo already runs: Turborepo 2.11.10 (affected-only tasks, cache) and mise
(tool pins). One entry per stage, so an agent never chooses what to run.

| Stage | What runs | Fails when |
| --- | --- | --- |
| 0. Ground | Versions newest in channel; `likec4 validate`; schema ledger | A tool is stale, the model is invalid, undecided items rose |
| 1. Declare | Catalog entry, card, schema decision for every touched table | A capability, card or table has no declaration |
| 2. Generate | `zen db pull` → `zen generate`; OpenAPI from the contract; device schema | Generated files differ from what is committed |
| 3. Static gates | Types; lint; Squawk on changed migrations; Spectral; oasdiff against `main-dev`; Cedar validate; ratchets | Any gate fails; a ratchet rises |
| 4. Live gates | pgTAP and the G2 suite on a disposable database; Schemathesis against staging; hop probe | Behaviour or latency differs from the declared contract |
| 5. Conform | `audit:conformance` across layers, not only capabilities | A gap count rises |
| 6. Record | Model, docs, follow-ups | The model or the ledger is older than the code |

Each gate's own recall is measured before it is trusted (the rule from the conformance plan),
and history is frozen as a baseline so a new rule can gate new work without staying red forever.

## Measured costs of the region layout

From Colombo, 2026-11-11: Postgres (Mumbai) query 154–234 ms, new connection ~1 s; Render API
(Singapore) 133–144 ms warm; PowerSync (Tokyo) 197–275 ms. The API pays Singapore → Mumbai once
per SQL statement. Free-tier option: a Supabase project in Singapore (`ap-southeast-1`) next to
Render Singapore; Supabase can't move a project, so it means a new project and a data migration.
PowerSync offers US, EU, JP, AU, BR; Tokyo stays.

## Decisions for the owner

1. Direction of truth per kind of fact (table above).
2. ZenStack at runtime in the API, or as the generator only.
3. One job each for row-level security, ZenStack policies and Cedar.
4. Move the database to Singapore, and when.
5. Which stages are required before a commit, and which in CI.

## Sources

- [Bytebase: Postgres schema compare tools, 2026](https://www.bytebase.com/blog/top-postgres-schema-compare-tools/)
- [Encore: database migration tools (Nov 2026)](https://encore.dev/articles/database-migration-tools)
- [pgfence: comparison with Squawk](https://pgfence.pages.dev/compare/squawk)
- [oasdiff](https://github.com/TuFin/oasdiff)
- [OpenAPI 3.1 contract testing guide 2026](https://qaskills.sh/blog/openapi-3-1-contract-testing-guide-2026)
- [Supabase: testing RLS with pgTAP](https://supabase.com/docs/guides/database/postgres/testing-row-level-security)
- [Supabase: testing overview](https://supabase.com/docs/guides/local-development/testing/overview)
- [monorepo.tools: AI and monorepos](https://monorepo.tools/ai)
- [Turborepo agent-aware builds](https://codex.danielvaughan.com/2026/04/12/codex-cli-turborepo-agent-aware-builds/)
- [Supabase regions](https://supabase.com/docs/guides/platform/regions)
