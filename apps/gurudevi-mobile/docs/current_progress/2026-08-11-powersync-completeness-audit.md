---
title: "PowerSync Completeness Audit"
status: "partial-foundation"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, powersync, offline-first, drizzle, supabase, audit]
---

# PowerSync Completeness Audit

## Executive result

PowerSync is a substantial foundation, not a production-complete offline
system. The current implementation is suitable for continued staged work, but
the application must not claim that all supported screens are offline-first.

## Capability matrix

| Area | Status | Evidence / blocker |
|---|---|---|
| Native SQLite adapter | Foundation present | `OPSqliteOpenFactory`, account-scoped database name, SecureStore key path |
| Native Drizzle bridge | Present | `wrapPowerSyncWithDrizzle` and `AppSchema` |
| Web SQLite adapter | Foundation present | `WASQLiteOpenFactory` + OPFS adapter exists |
| Shared core web DB | Incomplete | `database.web.ts` is still a no-op shim for core consumers |
| Upload connector | Present but needs staging test | Uses authenticated session, batch completion, retry, idempotency |
| Server upload endpoint | Present | Hono/ORPC route delegates to `applyPowerSyncBatch` |
| Durable idempotency | Incomplete | Current server cache is process-local and not multi-instance durable |
| Sync configuration | Incomplete | Only identity and classroom-roster streams are defined |
| PowerSync Cloud service | Not verified | `service.yaml` has replication/client-auth sections commented out |
| App activation | Disabled | `isPowerSyncEnabled` defaults to false and root layout does not mount the provider |
| Offline UI migration | Minimal | Only a small set of hooks/adapters use local Drizzle reads |
| Offline mutation coverage | Partial | Schema has a limited table set; most domain repositories remain Supabase/REST |
| Logout/account isolation | Partial | Native database names are scoped; lifecycle drain and user-switch tests remain |

## Current scope

The local schema currently covers bonds, memberships, classroom students,
attendance, students, classrooms, mood logs, schools, policy snapshots,
entitlements, preferences, and form data. The main application schema contains
many more domains; those are not automatically offline merely because they
exist in ZenStack or Postgres.

## Required completion stages

1. Verify the authorized PowerSync environment and configure replication plus
   Supabase JWT/client authentication. Do not deploy until the target instance
   is explicitly confirmed.
2. Mount one canonical provider path in the app root and remove/retire the
   duplicate shim path. Keep the feature flag off until the first-sync and
   upload tests pass.
3. Replace the core web no-op database fallback with the real web database
   instance or ensure all web consumers use the real provider context.
4. Expand sync streams only for explicitly selected offline domains. Each
   stream needs row-scope proof, local schema coverage, read hooks, write
   routing, and conflict/idempotency tests.
5. Replace process-local upload idempotency with a durable database ledger
   before multi-instance production deployment.
6. Test account switching, logout clearing, airplane-mode edits, reconnect,
   server rejection, retry, duplicate delivery, and PowerSync queue drain on a
   physical device and supported browser.

## Architectural boundary

PowerSync should handle genuinely offline-capable Zone A data. Notifications,
invite codes, registry claims, entitlements, and other authority/RPC workflows
remain online-first unless they receive a separately designed offline command
and reconciliation contract.

