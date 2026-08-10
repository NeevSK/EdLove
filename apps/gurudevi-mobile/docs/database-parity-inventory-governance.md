---
title: "Gurudevi Database Parity and Schema Inventory Governance"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, database, parity, zenstack, schema, powersync, drizzle, governance]
---

# Gurudevi Database Parity and Schema Inventory Governance

## Purpose

This guide defines how Gurudevi decides whether a live Supabase/Postgres object
belongs in the ZenStack/ZModel contract, remains a SQL view, belongs only to the
local PowerSync/Drizzle schema, or is intentionally external/legacy.

The goal is trustworthy parity, not a perfect score achieved by deleting data,
weakening the model, or adding blind ignore rules.

## Authorities

Each layer has a defined authority:

| Layer | Authority | Owns |
| --- | --- | --- |
| Domain contract | `packages/schema/schema.zmodel` | Gurudevi entities, fields, relations, policies, validation generation |
| Cloud persistence | Supabase/Postgres migrations | Tables, columns, constraints, indexes, RLS, functions, views |
| Server access | ZenStack ORM and generated clients | Typed queries, mutations, access-control boundary |
| Local/offline data | Drizzle + PowerSync schema | Local representation, sync metadata, watches, outbox/local-only state |
| External platform | Supabase/Auth/Postgres/PostGIS | Objects not owned by Gurudevi domain code |

No two layers should silently co-own the same definition. A local Drizzle table
may mirror a server entity, but it is not proof that the server entity belongs in
ZModel; the decision comes from domain ownership and actual usage.

## Object decisions

### Domain table — model in ZenStack

Choose this when the object stores durable Gurudevi business state, is read or
written by product code, needs authorization, or participates in sync. The
ZModel model should describe the fields and relations, and the migration should
make Postgres agree with it.

### Derived view — keep as SQL, optionally expose read-only

A view is a saved query over other relations. It does not normally own independent
data and should not be treated as a writable domain entity. Keep its definition in
a SQL migration. Add a typed read-only access layer only when application code
actually uses it. Never add fake IDs, write policies, or sync rules merely to make
the view look like a table.

### Local/offline object — Drizzle/PowerSync only

Use this for local sync state, outbox records, retry metadata, local indexes, or
device-only state. If it mirrors a server table, the server table may still belong
in ZModel, while the local-only fields remain outside it.

### External/platform object — document, do not model by default

This includes Supabase-managed objects, Postgres/PostGIS system objects, auth
internals, and relations owned by another product or integration. Record the owner
and reason in the inventory. Only model an external object if application code
requires a deliberate, stable contract around it.

### Legacy/unknown object — investigate before accepting

An old table is not automatically safe to ignore. Confirm whether it contains live
rows, is referenced by application code, is referenced by views/functions, or is
still written by a job or migration. Then choose adopt, migrate, archive, or
deprecate with evidence.

## Evidence required for every object

Every inventory decision must cite:

1. live relation kind and columns from the linked database;
2. ZModel presence or intentional absence;
3. application-code references;
4. migration/function/view references;
5. RLS and policy state;
6. sync/local-schema usage, if applicable;
7. owner, reason, decision, and review date.

Text search is evidence of use, not proof of ownership. A table name appearing in a
generated file, comment, or historical migration must be labelled accordingly.

## Review workflow

1. Run the read-only parity auditor against the linked Supabase project.
2. Generate the inventory with relation kind, model status, RLS, policies, and code
   and migration usage evidence.
3. Review launch-critical domains first: identity, classrooms, students,
   attendance, assignments, grades, community, and Self.
4. For each object, record one decision: `adopt-in-zenstack`, `keep-view-sql`,
   `local-powersync-only`, `external-platform`, `legacy-migrate`, or `unknown`.
5. Only `adopt-in-zenstack` changes ZModel. Only a reviewed migration changes the
   database. Only an explicit accepted decision can reduce a parity warning.
6. Backfill data and rehearse constraints/RLS in staging before production.
7. Re-run parity and require zero unowned high/critical findings before launch.

## Nullability rule

When ZModel requires a field but Postgres allows `NULL`, do not change either side
immediately. First inspect production rows and write paths. Then either:

- backfill invalid rows and add `NOT NULL` in a migration; or
- make the ZModel field optional if `NULL` is valid domain state.

The database must not remain weaker than the domain contract by accident.

## Inventory statuses

| Status | Meaning |
| --- | --- |
| `modeled` | Described by ZModel and verified against the database |
| `needs-review` | Observed but ownership/role is not yet proven |
| `accepted-external` | Intentionally outside ZModel with owner and reason |
| `accepted-view` | Derived SQL view with owner, definition, and read-only usage documented |
| `legacy-migrate` | Still used, but scheduled for migration or retirement |
| `retired` | No live usage and removal has a reviewed migration plan |

`needs-review` is the safe default. It must never be converted to an ignore rule
just to improve the score.

## Current starting point — 2026-08-10

The latest live audit before the inventory RLS migration finds 55 modeled objects,
6 views, 1 platform-managed object, and 113 unmodeled objects still requiring
review. It also finds 67 extra columns, 104 nullability mismatches, no missing
model columns, and 1 RLS lockout on `inventory_items`. These are review queues, not
deletion instructions. The next migration aligns `inventory_items` to its live
columns and restores scoped school-bond policies; rerun the audit after applying
that migration.

The machine-readable inventory is generated at:

`apps/gurudevi-mobile/reports/db-drift/database-inventory.json`

The human review queue is generated at:

`apps/gurudevi-mobile/reports/db-drift/database-inventory.md`

## Review batch order

1. RLS lockouts and launch-critical tables.
2. Tables referenced by current Gurudevi app/server code.
3. Tables referenced by active views, functions, sync rules, or jobs.
4. Remaining content, analytics, audit, and legacy relations.
5. Unused objects, with retirement only after evidence confirms no live usage.

## Definition of done

The inventory is trustworthy when every public relation has a kind, owner,
decision, evidence links, and review date; every launch-critical table has matching
ZModel and database constraints; views are not mistaken for writable entities; and
RLS/policy findings have been explicitly resolved.

For the broader operational gate—migration rehearsal, idempotency, trust checks,
and query-plan verification—use the continuously maintained [Schema and Database
Trust and Performance Guide](./architecture/schema-db-trust-and-performance.md).
