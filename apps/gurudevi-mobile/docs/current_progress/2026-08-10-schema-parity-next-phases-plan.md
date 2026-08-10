---
title: "Schema and Database Parity - Next Phases Plan"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, parity, zenstack, zod, drizzle, powersync, database]
---

# Schema and Database Parity — Next Phases Plan

## North-star rule

Every active domain gets one authoritative Postgres shape, one ZenStack model,
one Zod boundary, and one local PowerSync/Drizzle representation where offline
reads are required. Legacy database objects are either removed loudly or
explicitly classified as external/upstream; they are never silently treated as
fallback authorities.

## Phase 1 — Core contract hardening

Status: in progress.

- Remove obsolete pricing tables and `users.tier_id` — completed.
- Harden active core nullability — migrations prepared.
- Align education repository table names and grade metadata — completed.
- Finish preferences and growth-state migrations — prepared.

Exit: live parity contains no active-core nullability surprises and RLS lockouts
remain zero.

## Phase 2 — Identity, membership, and offline projection

Status: in progress.

- Finish `users`, bonds, classroom membership, claims, and join-request review.
- Ensure PowerSync includes the canonical offline read models.
- Keep invite claiming and other security-sensitive commands online-authoritative
  with durable pending intent on the device.

Exit: one identity/membership authority and documented offline behavior per
command.

## Phase 3 — Education domain

Status: partially complete.

- Complete assignments, submissions, grades, attendance, and classroom settings.
- Add idempotency and soft-delete semantics only where runtime code uses them.
- Verify indexes against real query shapes before adding more indexes.

Exit: no repository queries point at nonexistent or legacy table names.

## Phase 4 — Preferences, growth, and social

Status: preferences in progress.

- Remove stale preference columns and add the local PowerSync projection.
- Harden growth-state constraints.
- Review community/social tables for active versus archival columns.

Exit: user-facing profile settings and growth state have matching Postgres,
ZenStack, Zod, and local contracts.

## Phase 5 — Library and media

Status: bounded batch completed; final index verification remains.

- Treat `nodes` and `collections` as one bounded domain.
- Separate active metadata from historical/search/geospatial columns.
- Decide which read-heavy views remain outside ZenStack.
- Add indexes only from measured query paths.

Exit: library schema is intentionally modeled or explicitly external, with no
accidental partial model.

## Phase 6 — Final inventory and optimization

Status: later.

- Classify remaining extra tables into active, external, archival, view, or
  removable.
- Update the drift auditor with structured classifications instead of broad
  ignores.
- Apply index/constraint optimizations after query-shape evidence.
- Run final parity and release-readiness checks.

## Efficient operating loop

For each domain, do one evidence pass, one contract decision, one migration
batch, and one verification pass. Do not run live parity after every edit. Keep
the required artifacts together: source migration, ZModel/Zod changes, local
Drizzle/PowerSync changes, evidence query, and a dated review note.

## Current estimate

After the pricing cleanup, the auditor reports 287 raw findings. That is not 287
independent tasks: the largest clusters are Library (`nodes`/`collections`),
growth state, preferences, and unmodeled external tables. Approximately 4–6
domain batches remain before final classification; the count will fall as
legacy tables and columns are removed rather than modeled.
