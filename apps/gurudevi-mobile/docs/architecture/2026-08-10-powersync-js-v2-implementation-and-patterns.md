---
title: "PowerSync JavaScript SDK v2 Implementation and Patterns"
status: "active"
created: 2026-08-10
updated: 2026-11-06
author: "Codex"
tags: [powersync, javascript, react-native, web, drizzle, patterns, migration]
---

# PowerSync JavaScript SDK v2 Implementation and Patterns

This guide records the current Gurudevi implementation on PowerSync JavaScript SDK v2 and prevents v1 adapter patterns from re-entering the codebase. The current SDK cohort is `@powersync/react-native@2.4.0`, `@powersync/react@2.2.0`, `@powersync/web@2.6.0`, and `@powersync/common@2.5.0`; see `scripts/lib/dependency-cohorts.mjs` for the canonical workspace matrix.

## Current implementation assessment

| Area | Current state | Required direction |
|---|---|---|
| Native database | `apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx` constructs `PowerSyncDatabase` from `@powersync/react-native` using typed options from `src/lib/powerSyncDatabase.ts`, then injects it into `@repo/core` | Keep construction and account lifecycle in the app; v2 has a built-in OP-SQLite adapter and does not use the old `@powersync/op-sqlite` package |
| Native SQLite peer | The app directly depends on `@op-engineering/op-sqlite@17.2.0` and enables SQLCipher in its package config | Keep it direct for React Native autolinking; SDK 2.4.0 accepts `>=17.1.0 <19.0.0` |
| Web database | `packages/core/src/adapters/powersync/wasqlite.adapter.ts` creates the OPFS/WASQLite options; the app injects the active platform database into the shared runtime | Preserve one injected runtime path and keep native imports out of browser bundles |
| React hooks | Project wrappers expose `usePowerSyncQuery` and `usePowerSyncStatus`; the implementation calls `useQuery` and `useStatus` internally | Migrate public call sites to v2 names and keep any compatibility wrapper temporary and explicitly marked |
| Sync configuration | Uses `streams:` with auto-subscription for identity and classroom roster | Keep Sync Streams; add rows only with proof of scope, schema, hooks, writes, and tests |
| Service | Replication and client authentication are commented out | Configure and validate the actual target instance before enabling production sync |
| Uploads | Connector batches, retries, and completes after upload | Add durable idempotency and server-side contract tests before multi-instance deployment |
| Security | `src/lib/powerSyncDatabase.ts` loads or creates an account-scoped SQLCipher key in SecureStore and fails closed if key access fails | Preserve the existing account filename/key namespace and device-only SecureStore accessibility |

## v2 rules to implement

### 1. Use the v2 public API as the boundary

The v2 release separates public interfaces from implementation details. Imports from internal packages, structural assumptions about `AbstractPowerSyncDatabase`, and compatibility shims should not become part of feature code. On native, OP-SQLite is built into `@powersync/react-native`; install `@op-engineering/op-sqlite` directly because React Native autolinking only discovers direct dependencies. Do not add or import the obsolete `@powersync/op-sqlite` package.

The app should expose a small project-owned adapter from `@repo/core/powersync` and keep PowerSync-specific types inside that boundary.

### 2. Revisit database construction, not only package versions

The v2 release changes how custom factories and already-opened databases are passed to the constructor. It no longer overloads a single `database` field for unrelated meanings. Follow the current React Native reference for the exact constructor shape and keep one instance per account-scoped SQLite file.

Use these invariants:

- exactly one PowerSync instance per active account and database file;
- no database access before runtime registration and identity resolution;
- no native PowerSync import in a browser bundle unless the platform resolver proves it is browser-safe;
- all platform-specific factory creation stays in platform adapters;
- the provider owns lifecycle and cleanup, while domain hooks only query the injected database.

### 3. Make connection behavior explicit during migration

The v2.4.0 React Native SDK adds a 30-second default `connectTimeoutMs`; a nonresponsive service now times out instead of leaving the sync connection, checkpoint, uploads, downloads, or subsequent disconnect/connect work hung. Existing `PowerSyncBackendConnector` implementations remain supported. The SDK also permits separate `Authenticator` and `MutationUploader` arguments, including download-only and upload-only overloads. Choose connection behavior deliberately and verify it on Android, iOS, and supported browsers.

The connector remains responsible for:

1. fetching the current authenticated PowerSync token;
2. uploading queued CRUD to the app backend;
3. completing the PowerSync transaction only after the backend has durably accepted the batch;
4. preserving retryable versus terminal error semantics.

### 4. Use the new logger interface

Remove `js-logger`, `createBaseLogger()`, `useDefaults()`, and `setLevel()` usage. Use `createConsoleLogger()` or a project-owned implementation of `PowerSyncLogger`, with production redaction for tokens, personally identifiable data, and SQL parameters.

### 5. Use current React hooks

The old `usePowerSyncQuery`, `usePowerSyncWatchedQuery`, and `usePowerSyncStatus` hooks were removed from `@powersync/react` in v2. New feature code should use `useQuery`, `useStatus`, and `useSyncStream`/`useSyncStreams` where appropriate. A project wrapper is acceptable for product naming, but it must delegate to the v2 API and must not recreate the removed implementation. SDK 2.4.0 adds `usePowerSyncOrNull()` and `useStatusOrNull()` for optional database context (for example SSR); use these only where a database genuinely may be absent.

### 6. Keep Drizzle on its public surface and below v1 for now

`@powersync/drizzle-driver` is a bridge, not a replacement for the PowerSync runtime. The current `@powersync/drizzle-driver@0.8.0` release aligns with `@powersync/common@^2.0.0` but declares `drizzle-orm: <1.0.0`. Keep this repository on stable Drizzle 0.x for the PowerSync v2 migration. Do not use the Drizzle v1 RC or v1 stable line until the PowerSync driver publishes an explicit compatible peer range and the bridge has been tested.

Compile Drizzle queries through `.toSQL()` or the supported driver integration. Do not inspect private Drizzle AST fields, PowerSync internals, or SQLite view implementation details.

For every reactive query:

1. build the query from the shared schema;
2. compile it through the supported driver path;
3. subscribe through the current PowerSync React hook;
4. verify that the query references only tables present in the client schema and selected by a stream.

### 7. Keep the web path real or explicitly online-only

`database.web.ts` currently returns a no-op proxy. That is safe only as a temporary import-compatibility shim. It must never silently make an offline screen look healthy while returning empty data.

Choose one of two explicit states per web feature:

- real WASQLite + OPFS/IndexedDB-backed PowerSync with verified assets and account isolation; or
- direct API/online-only behavior with an intentional unavailable/offline state.

The app-level web provider and the core-level database resolver must not represent different database instances.

## Patterns to avoid

| Pattern | Why it is unsafe or stale | Replacement |
|---|---|---|
| Bumping v1 packages independently | v2 changes several APIs together | Migrate the SDK family as one tested unit |
| Installing or importing `@powersync/op-sqlite` for RN v2 | The v2 React Native SDK has a built-in OP-SQLite adapter; the separate old adapter path is obsolete | Install `@op-engineering/op-sqlite` directly for autolinking and use the SDK's public `database` options |
| Passing a custom factory through an overloaded `database` option | Ambiguous and breaking under v2 | Use the v2 constructor key/API for a factory or opened database |
| Using removed PowerSync React hooks directly | Build failure after v2 | Use `useQuery`, `useStatus`, and current stream hooks |
| Importing CommonJS PowerSync builds | v2 packages are ESM-only | Keep Metro, Node, and web tooling ESM-compatible |
| Treating HTTP streaming as universally interchangeable with WebSockets | Platform support differs, especially in Expo and plain RN | Make the connection method explicit in test fixtures and diagnostics |
| Keeping `@powersync/attachments` | The standalone JS attachment package is deprecated | Use built-in platform SDK attachment utilities and the RN storage adapter when ready |
| Calling REST for a table already owned by PowerSync | Creates stale dual truth and UI flashes | Read synced tables from local reactive SQLite |
| Sending an offline mutation for an authoritative workflow | Some actions must be accepted or rejected immediately | Keep identity, invite, entitlement, and authority/RPC workflows direct API unless a command contract exists |
| Using a process-local idempotency cache | Retries can land on another server instance | Use a durable database ledger keyed by account, batch identity, and operation IDs |
| Falling back to a deterministic encryption key | Storage failure becomes predictable data protection failure | Fail closed, surface a recoverable error, and require secure key storage |
| Editing `android/` or `ios/` directly | Prebuild can erase the change | Use `app.json` or a config plugin |
| Running `expo install --fix` or `expo install --check` | Repository guardrails say these can downgrade intentional pins | Use the repository’s diagnostic commands only |

## Recommended domain pattern

For each offline-capable domain, require one vertical slice containing:

1. source table and row-scope rule;
2. client `AppSchema` entry;
3. stream selection or auto-subscription decision;
4. reactive read hook;
5. local write path through the secure Drizzle boundary;
6. upload endpoint and durable idempotency;
7. conflict and rejection behavior;
8. account-switch and offline/reconnect tests;
9. UI states for pending, synced, rejected, and unavailable.

This prevents a table from being called “offline-first” merely because it appears in SQLite.

## References

- [PowerSync React Native v2 release notes](https://releases.powersync.com/announcements/react-native-client-sdk)
- [React Native and Expo SDK reference](https://docs.powersync.com/client-sdks/reference/react-native-and-expo)
- [React Native Client SDK v2.4.0 release notes (2026-11-02)](https://releases.powersync.com/announcements/react-native-client-sdk)
- [JavaScript ORM support](https://docs.powersync.com/client-sdks/orms/js/overview)
- [Sync Streams and legacy Sync Rules](https://docs.powersync.com/sync/overview)
- [Improved JavaScript attachment utilities](https://releases.powersync.com/announcements/improved-attachment-utilities-in-the-javascript-sdks)
- Existing project boundary: [`DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md`](DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md)
