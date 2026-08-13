---
title: "PowerSync Completeness Audit"
status: "partial-foundation"
created: 2026-08-10
updated: 2026-08-12
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
| Native SQLite adapter | v2 foundation present | `@powersync/react-native` v2 database options, account-scoped database name, SecureStore key path |
| Native Drizzle bridge | Present | `wrapPowerSyncWithDrizzle` and `AppSchema` |
| Web SQLite adapter | v2 foundation present | `@powersync/web` v2 database options with OPFS VFS |
| Shared core web DB | Hardened | `database.web.ts` now requires the real provider-injected OPFS runtime |
| Upload connector | Present but needs staging test | Uses authenticated session, batch completion, retry, idempotency |
| Server upload endpoint | Present | Hono/ORPC route delegates to `applyPowerSyncBatch` |
| Durable idempotency | Implemented pending migration apply | Account-scoped Postgres ledger is inserted/completed in the CRUD transaction |
| Sync configuration | Incomplete | Only identity and classroom-roster streams are defined |
| PowerSync Cloud service | Not verified | `service.yaml` has replication/client-auth sections commented out |
| App activation | Disabled | `isPowerSyncEnabled` defaults to false and root layout does not mount the provider |
| Offline UI migration | Minimal | Only a small set of hooks/adapters use local Drizzle reads |
| Offline mutation coverage | Partial | Schema has a limited table set; most domain repositories remain Supabase/REST |
| Logout/account isolation | Hardened | Scoped files, serialized single-active runtime, account-bound connector, and browser tab broadcast are implemented |

## 2026-08-12 service checkpoint

The PowerSync CLI is installed at workspace version `0.10.0` and is executed
through Doppler. The linked Development Cloud instance is provisioned and
healthy. Its direct Supabase Postgres connection is connected, initial
replication is complete, and replication lag is zero. The explicit Supabase
`powersync` publication covers `bonds`, `school_memberships`, `classrooms`,
and `classroom_students`, all with full replica identity.

The Development sync configuration validates and deploys successfully. The
first streams intentionally cover only account-owned identity rows and the
teacher/student classroom roster path. Production is not linked or modified.
The remaining service gate is authenticated client verification plus
cross-account isolation testing; role-expanded streams must wait for a
separate compiler and authorization proof.

The client-side first-sync gate is now implemented: both platform providers
use a bounded official `waitForFirstSync()` lifecycle, publish typed status
events, and retain local operation when the network connection fails. Browser
tab coordination and first-sync lifecycle have regression coverage. This is
implementation readiness, not a replacement for physical-device, browser
matrix, or real-user authorization evidence.

## 2026-08-11 implementation update

The first migration stage is complete: the workspace now resolves the
PowerSync JS v2 package line (`react-native` 2.0.2, `react` 2.0.0, `web` 2.1.1,
`drizzle-driver` 0.8.0, and `op-sqlite` 17.1.5), removes the deprecated
`@powersync/op-sqlite` dependency and TypeScript aliases, uses the v2
`database` constructor source on native and web, and routes Drizzle reactive
queries through `toCompilableQuery`. Drizzle remains on `0.45.2` because the
current PowerSync driver peer range is still `<1.0.0`.

The feature flag remains disabled intentionally. Provider mounting, service
configuration, migration application, stream expansion, and physical-device/
browser lifecycle tests remain activation gates.

Account switching now follows the intended retention model: each account keeps
its own encrypted, account-scoped local file; switching closes the previous
runtime without clearing that file, and local database initialization is not
blocked by a temporary sync connection failure. Explicit account removal is
the destructive clear path. If a cached authentication session cannot be
restored, the account switch rolls back instead of exposing the wrong local
database as active.

The connector is also account-bound: an upload begun by account A cannot fetch
account B's session after a switch. Upload batches are now protected by an
account-scoped durable ledger with payload-hash checking; the migration must be
applied before enabling multi-instance production traffic. Browser tabs also
broadcast account changes and stop stale runtimes.

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
3. Verify that all web consumers are mounted under the real OPFS provider; an
   uninitialized web PowerSync accessor now fails visibly instead of returning
   an empty mock.
4. Expand sync streams only for explicitly selected offline domains. Each
   stream needs row-scope proof, local schema coverage, read hooks, write
   routing, and conflict/idempotency tests.
5. Apply the durable upload-idempotency migration before multi-instance
   production deployment.
6. Test account switching, logout clearing, airplane-mode edits, reconnect,
   server rejection, retry, duplicate delivery, and PowerSync queue drain on a
   physical device and supported browser.

## Architectural boundary

PowerSync should handle genuinely offline-capable Zone A data. Notifications,
invite codes, registry claims, entitlements, and other authority/RPC workflows
remain online-first unless they receive a separately designed offline command
and reconciliation contract.
