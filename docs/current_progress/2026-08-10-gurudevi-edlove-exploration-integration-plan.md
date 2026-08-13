---
title: "Gurudevi / Edlove Exploration Integration Program"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, edlove, integration, phased-plan, architecture, parity, temporal, ui]
---

# Gurudevi / Edlove Exploration Integration Program

## Summary

The imported exploration corpus remains preserved as evidence. Gurudevi mobile is
the first implementation target; proven shared primitives will later serve the
wider Edlove family.

The first execution action is to save this plan. The companion comparison document
is `docs/architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md`.

## Execution ledger — 2026-08-10

- **Completed:** plan saved before implementation; comparison created; imported
  corpus indexed without rewriting findings; database-review batches 01–06
  linked as prior work.
- **Completed:** added strict/non-strict Supabase boundary scanning and recorded
  the allowlist in `docs/architecture/architecture-guidelines.md`.
- **Completed:** added the shared `@repo/ui` `DerivedHistoryView` contract and
  wired it behind Self Now/History for Gurudevi teacher mood history.
- **Verified:** `@repo/ui` and `@repo/self` TypeScript checks pass; linked/local
  migration history reports 151 aligned records; the fresh no-write parity
  command returned 95/100 but correctly failed because drift remains.
- **Completed:** migrated 89 current Supabase client imports behind the canonical
  adapter boundary and removed the raw API barrel alias; strict boundary check
  now passes with zero findings.
- **Still open:** live RLS/grant hardening, domain-level migration verification,
  and native offline/reconnect tests remain required. No migration is marked
  deployed by this program.

## Phase 0 — Save, index, and establish the baseline

- Preserve `docs/files` (organized into fundamental and specialized tiers) and add SOP frontmatter/index references without rewriting its findings.
- Link database-review batches 01–06 as prior work, not new tasks.
- Record the current parity baseline: local score `86/100`, 287 findings, 115 nullability mismatches, 59 extra columns, 107 extra tables, and 6 extra views.
- Keep `students` as an unresolved legacy/parallel roster decision.
- Treat Library, growth state, and feature flags as major remaining parity domains.
- Mark migrations as ready, local-complete, or deployed only after linked Supabase verification.

## Phase 1 — Continue database and schema parity safely

- Reconcile the migration tracker, including prepared migrations for grades, submissions, inventory RLS, nullability, preferences, growth state, community, education, notifications, and indexes.
- Run parity in bounded domain batches; do not attempt all remaining tables in one migration.
- Explicitly verify grade mapping to `student_grades`, active submission and notification fields/indexes, inventory policies, preference-column consumers, guardian policies, and longitudinal school/classroom scoping.
- For each remaining object choose exactly one outcome: model, tighten, rename/migrate, retain as SQL-owned infrastructure, or remove loudly.
- Run ZenStack generation/checks, TypeScript, RLS tests, and post-migration parity after each bounded batch.

## Phase 2 — Governance and transport boundaries

- Prevent new direct Supabase request paths outside approved adapters, Realtime subscriptions, and the PowerSync bridge.
- Remove the raw Supabase barrel alias and add lint/CI enforcement.
- Migrate the highest-risk hooks and core API paths to Hono contracts or explicit ports.
- Preserve legitimate RPC/database-function operations where atomicity is required, such as invite claiming.
- Document the final allowlist in canonical architecture guidance.

## Phase 3 — Shared temporal and offline foundation

- Keep domain tables as canonical sources; introduce shared temporal read models, rollups, decay/baseline calculations, and cursor-pagination contracts.
- Standardize typed hot fields, indexes, server-side aggregation, and query-plan checks.
- Complete the native Gurudevi PowerSync path first: account-scoped encrypted SQLite, Zone A sync, direct API for non-synced data, and reliable social/messaging outboxes.
- Retain the web PowerSync adapter as a later compatibility track.
- First vertical slices: Classroom attendance for offline-first data flow, then Self mood/history for temporal derivation and presentation.

## Phase 4 — Shared UI and temporal experience

- Promote accepted spacing, typography, density, color, icon, and motion rules into `@repo/ui`.
- Resolve GlobalHeader behavior: direct notification access, clear menu semantics, tokenized styling, and intentional mobile/web theming.
- Build one reusable derived-history component behind the existing Now/History controls.
- Reuse it across Self, Profile, Classroom, and governance history.
- Move Profile toward progressive disclosure, decompose Library into browse/contribute/curator flows, and evolve Workspace toward fixed, user-arranged, and smart surface zones.

## Phase 5 — Domain rollout

- **Self:** finish Tier 1/2/3 table decisions, guard absent features, add reinforcement-gated wellbeing signals, and replace flat history.
- **Classroom:** preserve the ports/adapters pattern, finish authorization fixes, improve OCR batch idempotency/reporting, and aggregate reports server-side.
- **Community:** remove duplicate request paths, replace offset pagination, formalize outboxes, and retain Realtime only for persistent subscriptions.
- **Library:** establish media/rights boundaries, cursor pagination, shared resource cards, contributor flow, and curator prioritization.
- **Profile/Workspace:** unify journey history, apply disclosure, and integrate shared temporal/layout contracts.

## Phase 6 — AI, media, and family extraction

- Refactor the LLM interface around provider-specific configuration so local inference is type-compatible but deferred.
- Defer Redis, partitioning, HTTP QUERY, local model runtime, and custom media/CDN infrastructure until measured need exists.
- Extract proven contracts into shared packages.
- Validate one shared primitive in a sibling Edlove app before broader family rollout.

## Comparison document structure

Use:

`Imported claim → source file → current code/schema/migration evidence → status → risk → remaining action → phase`

Statuses:

- Implemented
- Partially implemented
- Conflicting
- Stale/superseded
- Deferred by design
- Unverified

The comparison must separate historical audit claims from fresh current scans and
include database-review batches as completed or in-progress evidence.

## Acceptance gates

- Both documents have SOP frontmatter and are indexed.
- Existing parity work is referenced, not duplicated.
- Migration status is verified against linked Supabase.
- ZenStack, parity, RLS, TypeScript, and domain tests pass for each batch.
- Native offline/reconnect/account-switch behavior is tested.
- UI token, accessibility, temporal, responsive, and visual checks pass.
- A sibling Edlove app consumes one shared primitive successfully.

## Assumptions

- `docs/files` remains an organized evidence archive.
- Gurudevi mobile is the first rollout.
- Existing database parity work is the baseline and continues through bounded batches.
- No destructive Expo/native regeneration or sacred dependency changes are implied.
- No broad generic-events rewrite, local model runtime, Redis layer, or custom CDN is built without measured need.
