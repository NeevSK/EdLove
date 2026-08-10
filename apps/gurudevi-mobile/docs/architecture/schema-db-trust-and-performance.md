---
title: "Schema and Database Trust and Performance Guide"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Codex"
tags: [gurudevi, schema, database, rls, idempotency, migrations, indexes, performance]
---

# Schema and Database Trust and Performance Guide

This is the reusable operating reference for changes involving ZModel,
Zod, PostgreSQL, RLS, RPCs, migrations, Drizzle, and PowerSync boundaries.

## Authority model

| Concern | Authority | Rule |
| --- | --- | --- |
| Domain model and policy intent | ZenStack `schema.zmodel` | Model durable entities, relations, and policy intent here. |
| API input/output | Zod contracts | Parse at the boundary; never trust client-shaped objects. |
| Invariants and concurrency | PostgreSQL | Enforce `NOT NULL`, `UNIQUE`, FK, `CHECK`, RLS, and transactional RPCs in the database. |
| Server query implementation | Drizzle/Supabase adapter | Keep queries typed, bounded, and observable; do not duplicate authority rules in clients. |
| Offline representation | Drizzle + PowerSync | Local schema is a projection and may contain sync/outbox fields not present in ZModel. |
| Verification | Parity and trust auditors | Structural parity must be zero-drift; behavior requires tests. |

## Definition of done for a schema change

1. Identify whether the object is a table, view, external relation, or local-only
   projection.
2. Inspect live columns, constraints, indexes, RLS, functions, row counts, and
   active code usage.
3. Update ZModel and Zod only when the object is a product-owned contract.
4. Use a reviewed, forward-only migration for database changes. Do not use
   `db push` against shared or production databases.
5. Put security-sensitive multi-write behavior in one transaction/RPC.
6. Add retry semantics with a stable idempotency key where the operation may be
   retried, queued, or invoked from offline-capable UI.
7. Verify generated artifacts, type-checks, parity, RLS behavior, and query plans.

## Small things that commonly escape review

- A unique constraint that allows multiple `NULL` values when that is not intended.
- A foreign key with the wrong delete action.
- Case differences between application capacities and database capacities.
- An RLS `USING` rule that permits reads but a missing `WITH CHECK` rule that
  blocks or over-permits writes.
- A client-generated credential or random code that is not retry-safe.
- A view treated as a writable table or a canonical registry treated as a tenant.
- An index that exists but does not match the actual predicate/order of a query.
- An optional field in ZModel mapped to a live `NOT NULL` column, or the reverse.

## Migration rehearsal

- Apply migrations to a disposable/staging database.
- Check migration status and inspect generated SQL before application.
- Run constraint/RLS/RPC tests against that database.
- Run the parity auditor and the trust auditor.
- Capture rollback or forward-fix instructions; production rollback must not
  assume destructive reversal is safe.

## Query and index discipline

- Index foreign keys and the leading predicates of real queries.
- Use partial indexes only when the predicate is stable and matches the query.
- Use covering indexes only after measuring the workload.
- Use BRIN or partitioning only after row volume and maintenance measurements
  justify them.
- Verify important paths with `EXPLAIN (ANALYZE, BUFFERS)` and retain the plan
  with the query shape and data volume.
- Bound every discovery/list API and prefer cursor pagination for growing data.

## Current verification commands

```powershell
pnpm --filter @repo/schema exec zenstack generate --schema schema.zmodel -o src/generated/orm
pnpm --filter @repo/core check-types
node scripts/check-schema-drift.mjs
node scripts/check-db-trust.mjs
node scripts/check-query-plans.mjs
node scripts/check-db-behavior.mjs
node scripts/test-db-behavior-fixtures.mjs
node scripts/check-migration-state.mjs
```

## Authoritative references

- [Database parity and schema inventory governance](../database-parity-inventory-governance.md)
- [Storage and indexing notes](../../../../docs/files%20new/05-storage-indexing.md) — learning material; actual query plans win.
- [PostgreSQL `EXPLAIN`](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL row-security policy catalog](https://www.postgresql.org/docs/current/catalog-pg-policy.html)
- [Drizzle indexes and constraints](https://orm.drizzle.team/docs/indexes-constraints)
- [ZenStack access control](https://zenstack.dev/docs/the-complete-guide/part1/access-policy)
- [ZenStack migrations](https://zenstack.dev/docs/the-complete-guide/part1/migration)
