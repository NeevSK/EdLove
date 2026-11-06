---
name: powersync-expert
title: PowerSync Sync and Offline Data Expert
description: Directives and best practices for offline-first architecture, platform-detected database factories, useLiveQuery reactivity, multi-account swaps, and Drizzle query compilation in the Polymath Platform.
triggers:
  - "powersync"
  - "useLiveQuery"
  - "offline-first"
  - "database factory"
  - "Zone A sync"
  - "SovereignBus"
  - "database.ts"
  - "WASQLiteOpenFactory"
  - "OPSqliteOpenFactory"
---

# PowerSync Sync & Offline Data Skill Playbook

Use this skill when modifying offline data storage, schema definitions, sync rules, database connectors, or lifecycle hooks within the Polymath Platform monorepo.

---

## 1. Monorepo Stack Specifications

The current PowerSync JavaScript v2 cohort is pinned together in `scripts/lib/dependency-cohorts.mjs`:
*   **React Native SDK**: `@powersync/react-native@2.4.0`; its OP-SQLite adapter is built into the SDK.
*   **React hooks**: `@powersync/react@2.2.0` (the context and hooks package).
*   **Web SDK**: `@powersync/web@2.6.0` with WASQLite and OPFS.
*   **Native SQLite peer**: direct `@op-engineering/op-sqlite@17.2.0` dependency for React Native autolinking; SDK peer range is `>=17.1.0 <19.0.0`.
*   **Shared core**: `@powersync/common@2.5.0`; keep React Native, Web, React, and Common on their compatible v2 cohort.
*   **ORM**: `@powersync/drizzle-driver@0.8.0` via `wrapPowerSyncWithDrizzle`.
*   **Boundary**: `@repo/core` owns the schema, shared runtime registry, and secure Drizzle boundary. The native app provider constructs the native database and injects it into that boundary.

Do not use the removed `@powersync/op-sqlite` adapter package for SDK v2. The separately installed package is `@op-engineering/op-sqlite`, required as a direct dependency for native autolinking; it is not a PowerSync database factory package.

---

## 2. Platform-Detected Database Factory

To maintain a single codebase across Native (iOS/Android) and Web (SPA/Expo Web), the database runtime is abstracted inside `packages/core/src/adapters/powersync/database.ts`:

```typescript
// Native app: the SDK selects its built-in OP-SQLite adapter from the
// ReactNativeDatabaseOptions shape. Keep account-scoped file/key policy in the app.
import { PowerSyncDatabase } from '@powersync/react-native';
import { PowerSyncContext } from '@powersync/react';

const database = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: `gurudevi-powersync-${accountId}.db`,
    sqliteOptions: { encryptionKey },
  },
});

// Native and web databases are injected into the @repo/core runtime boundary;
// the app provider owns construction and account lifecycle.
return <PowerSyncContext.Provider value={database}>{children}</PowerSyncContext.Provider>;
```

Keep the Expo app's direct `@op-engineering/op-sqlite` dependency and `op-sqlite.sqlcipher` config. SQLCipher is enabled in the native build, while the encryption key is supplied per account in `sqliteOptions`.

PowerSync React Native SDK 2.4.0 adds a default 30-second `connectTimeoutMs` so an unavailable service cannot leave connect, checkpoint, upload/download, or subsequent disconnect work waiting forever. It also allows `connect(authenticator, mutationUploader)` when upload and download responsibilities are separated; existing `PowerSyncBackendConnector` implementations remain compatible. The new `usePowerSyncOrNull()` and `useStatusOrNull()` hooks are for intentionally optional context, such as SSR. Managed tables are alpha and are not the default table path.

For connection or transaction changes, read the dated [SDK 2.4.0 release notes](https://releases.powersync.com/announcements/react-native-client-sdk) and verify the app's retry, upload completion, and account-switch behavior against its existing tests and lifecycle contracts.

### Key Constraints:
*   **VFS Fallbacks**: On Web, `OPFSCoopSyncVFS` fallback to `IDBBatchAtomicVFS` is handled automatically. Never use `OPFSWriteAheadVFS` (insufficient testing evidence).
*   **Web Assets**: The postinstall script runs `powersync-web copy-assets` to dump WASM and workers into `public/@powersync/web/`. Browser loads fail silently if these are missing.
*   **Web Encryption**: Web sandboxing (OPFS) is origin-isolated. Do not activate web database encryption until Safari + ChaCha20 stability is fully verified.

---

## 3. Data Highways: Zone A, B, and C

All data is structured in local SQLite but synchronized differently depending on high-volume traffic and hosting cost thresholds:

| Zone | Sync Semantics | SQLite Property | Network Path |
| :--- | :--- | :--- | :--- |
| **Zone A** (Sovereign Core) | Bidirectional Sync | `local_only: false` | PowerSync Connector WAL stream |
| **Zone B** (Social Feed) | Local Reactivity | `local_only: true` | REST API (Hono) |
| **Zone C** (Messaging) | Local Reactivity | `local_only: true` | WebSocket + REST API |

### Query and Write Patterns:
*   **Reads**: Always subscribe via `useLiveQuery` on the SQLite tables (applies to all zones).
*   **Writes**:
    *   **Zone A**: Route through `SecureDrizzleProxy` to queue changes in PowerSync's local CRUD queue.
    *   **Zone B/C**: Write locally via Drizzle and execute network sync separately. Never route Zone B/C through PowerSync replication.

---

## 4. Multi-Account Swap Protocol (Drain-Before-Swap)

To prevent memory leaks and database file corruption during account switching:
1.  **Drain**: Check `uploadQueueDepth` and ensure local changes are flushed.
2.  **Disconnect**: Call `powersyncInstance.disconnect()`.
3.  **Clear**: Clear singleton reference inside `database.ts`.
4.  **Key Swap**: Fetch the new account's encryption key from Expo SecureStore.
5.  **Reboot**: Initialize and connect the new PowerSync instance.

---

## 5. State & Request Coordination (SovereignBus)

Heavy background sync activity can compete with the Metro bridge. We coordinate network requests using the `SovereignBus` Zustand slice:
*   **State fields**: `isSyncing: boolean`, `uploadQueueDepth: number`, `lastSyncComplete: Date`.
*   **Throttling**: React Query reads `isSyncing` and blocks REST refetches during active PowerSync sync phases (using TanStack Pacer).

---

## 6. Authorization & Policy Invalidation

*   **Cedar Double-Gate**: All local writes are evaluated via Cedar WASM policy engines before executing.
*   **Sync Rules**: Replicated records are filtered on the backend using Supabase RLS and PowerSync sync rules.
*   **Policy Invalidation**: A `policy_version` table is synced in Zone A. If policies change, the server increments the hash, `useLiveQuery` detects the update, invalidates capability tokens, and triggers a fresh snapshot fetch.

---

## 7. Legacy Patterns vs. New Capabilities

*   **DEPRECATED**: Legacy Sync Rules (static config).
*   **RECOMMENDED**: Sync Streams (dynamic filters based on parameters/tokens).
*   **DEPRECATED**: Direct REST API polling for Zone A data.
*   **RECOMMENDED**: Reactive subscription via `useLiveQuery`.

---

## 8. Real-time Documentation & Research Guidance

When needing to look up the latest PowerSync API features, SDK changes, or troubleshooting rules, use the following methods:

### Direct Markdown Fetch
Append `.md` to any PowerSync doc URL to retrieve the raw markdown content.
For example: `https://docs.powersync.com/usage/react-native.md`

### Jina AI Reader Ingestion
Leverage the workspace MCP Gateway tool `sovereign_discovery` with action `jina` to fetch and ingest documentation directly:
```json
{
  "action": "jina",
  "params": {
    "url": "https://docs.powersync.com/usage/sync-rules.md"
  }
}
```
*Always verify syntax and query patterns against the current codebase before applying changes.*
