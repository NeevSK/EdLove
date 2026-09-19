---
title: "Supabase shared-database governance handoff"
status: "active"
created: 2026-09-17
owners: [Gurudevi platform]
scope: "Database governance only; excludes web feature migration"
---

# Supabase shared-database governance handoff

## Purpose

This is the standalone workstream for Supabase governance. It is intentionally
separate from the web/shared-plumbing migration so database safety work cannot
be diluted into UI or feature delivery claims.

## Current fact pattern

- Gurudevi currently has one linked managed Supabase database shared by its
  configured environments. Every write to it is production-equivalent.
- The additive active-scope migration
  `apps/gurudevi-mobile/supabase/migrations/20260915090000_persist_active_bond_scope.sql`
  is applied. It was preceded by migration-list and dry-run checks. A
  rollback-only PostgreSQL probe verified foreign selected-scope rejection and
  expiry clearing, leaving no test rows.
- This is database-constraint evidence only. It does not prove the Sanctuary
  API, Next application, Cedar/ZenStack authorization, browser behavior, or
  production rollout safety.
- `guard_user_preferences_active_bond` and
  `clear_invalid_selected_bond` are `SECURITY DEFINER` trigger functions. Their
  direct `PUBLIC` and `authenticated` execute grants remain broader than their
  trigger-only purpose. Direct invocation requires trigger context, so this is
  not a confirmed application bypass; it remains unnecessary privileged
  exposure.
- Existing `handle_new_user_preferences` has a similar historical grant shape.
  Do not modify it incidentally while repairing active scope.
- The default function-privilege posture in `public` grants
  `authenticated` execution and PostgreSQL's `PUBLIC` default also applies.
  This requires a complete compatibility audit before changing defaults.

## Required work, in order

1. Read-only inventory: enumerate exposed schemas, functions, signatures,
   owners, definer/invoker status, `search_path`, grants, RLS policies, and
   Data API exposure.
2. Classify every function as client RPC, internal trigger/hook, or server-only
   maintenance; identify its intended caller and authorization boundary.
3. Produce a narrow, reversible repair proposal for the two active-scope
   trigger functions. It must prove trigger behavior survives removal of direct
   client execution.
4. Propose an isolated staging project or Supabase branch plus CI migration
   promotion. Do not infer that a shared target is development.
5. Only after review and explicit user approval, create and apply migrations.

## Non-negotiable controls

- No Dashboard SQL/Table Editor schema edits outside tracked migrations.
- State the exact linked project and whether it is isolated before every write.
- Use Supabase CLI migration creation, migration history inspection, dry run,
  targeted pre/post ACL inspection, and a local/isolated test before shared
  deployment.
- A `SECURITY DEFINER` function needs a fixed safe search path and least
  privilege; a trigger function is not a client RPC.
- Never perform broad default-privilege revocations until the inventory and
  compatibility plan are reviewed.

## Completion evidence

The workstream is complete only when it has an inventory with classifications,
a reviewed staged remediation plan, explicit isolation/promotion decision, and
the evidence matrix for any approved migration. It must not claim web feature
or authorization delivery.

## Related authority

The shared platform dependency order remains canonical in
`docs/decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md`.
