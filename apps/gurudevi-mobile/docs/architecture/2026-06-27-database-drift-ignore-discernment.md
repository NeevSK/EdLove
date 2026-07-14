---
title: "Database Drift Ignore Discernment"
status: "active"
created: 2026-06-27
updated: 2026-06-27
author: "Naween"
scribe: "Antigravity"
tags: [database, architecture, drift, governance]
---

# Database Drift Ignore Discernment

This document defines when a table may be ignored by the drift auditor.

## Rule

Ignore entries are allowed only when the table is intentionally outside the Gurudevi mobile app's
semantic ownership or when it is a system or trigger-owned artifact.

## Acceptable reasons

- Supabase / Postgres system table
- Other app or package owns the table
- Trigger-owned audit or snapshot table
- Read-only external reference dataset
- Temporary staging table with explicit owner

## Required metadata for ignore decisions

Every ignored table should have:

- the table name
- the reason for ignoring it
- the owning system or package
- the date it was reviewed
- the reviewer or agent

These fields are strictly validated at runtime by the AST-based auditor. Missing metadata fields or overly broad globs will generate warnings during execution.

## Do not ignore just because it is noisy

If a table is used by the app, it should be modeled or intentionally documented as out of scope.

## Related artifacts

- [`scripts/check-database-drift.mjs`](/C:/Users/Naween/projects/polymath-platform/scripts/check-database-drift.mjs)
- [`.driftignore.ast.json`](/C:/Users/Naween/projects/polymath-platform/.driftignore.ast.json)
- [`apps/gurudevi-mobile/reports/db-drift/`](/C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/reports/db-drift/)

