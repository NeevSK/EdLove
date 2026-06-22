---
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

Our PowerSync setup utilizes a unified TypeScript client layer wrapping platform-native engines:
*   **Reactivity Client**: `@powersync/react-native@1.35.3` and `@powersync/react@1.10.0`
*   **Web Engine**: `@powersync/web@1.38.3` + WebAssembly (WASQLite) + OPFS (Origin Private File System)
*   **Native Engine**: `@powersync/op-sqlite@0.9.9` (compiled C++ SQLite wrapper) with SQLCipher encryption
*   **ORM**: Drizzle ORM (`@powersync/drizzle-driver@0.7.3` via `wrapPowerSyncWithDrizzle`)
*   **Boundary**: Package `@repo/core` (`packages/core/src/adapters/powersync`) exports the database singleton and bootstrap procedures.

---

## 2. Platform-Detected Database Factory

To maintain a single codebase across Native (iOS/Android) and Web (SPA/Expo Web), the database runtime is abstracted inside `packages/core/src/adapters/powersync/database.ts`:

```typescript
// 1. SSR Guard
if (typeof window === 'undefined') {
  return null; // Client-only execution
}

// 2. Factory Detection
function createDatabaseFactory(accountId: string, encryptionKey: string) {
  if (Platform.OS === 'web') {
    const { WASQLiteOpenFactory, WASQLiteVFS } = require('@powersync/web');
    return new WASQLiteOpenFactory({
      dbFilename: `gurudevi-${accountId}.db`,
      vfs: WASQLiteVFS.OPFSCoopSyncVFS, // Multi-tab stability
      flags: {
        enableMultiTabs: typeof SharedWorker !== 'undefined'
      }
    });
  }

  const { OPSqliteOpenFactory } = require('@powersync/op-sqlite');
  return new OPSqliteOpenFactory({
    dbFilename: `gurudevi-powersync-${accountId}.db`,
    sqliteOptions: { encryptionKey }
  });
}
```

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
