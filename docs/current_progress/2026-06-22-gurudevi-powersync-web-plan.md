# Gurudevi — PowerSync Web Integration Plan
> Draft 1 — June 2026
> Decision: Option A — one codebase, platform-detected factory
> @powersync/react-native for native, @powersync/web as browser adapter

---

## 1. Decision Summary

One app codebase. Platform detection at the database factory level. Same schema,
same AppSchema, same Zone A/B/C model, same useLiveQuery — different SQLite
engine underneath per platform.

```
Native (iOS/Android)  → @powersync/op-sqlite (native C++ SQLite)
Web (browser)         → @powersync/web + WASQLite + OPFS
```

Web support via @powersync/react-native is Beta since v1.12.1.
Your installed v1.35.3 satisfies the version requirement.
Risk accepted: test Safari and incognito modes specifically before any web launch.

---

## 2. Package Changes

Add to apps/gurudevi-mobile/package.json:

```json
{
  "@powersync/web": "^1.x"
}
```

Add to postinstall script:

```json
{
  "scripts": {
    "postinstall": "powersync-web copy-assets"
  }
}
```

This copies compiled WASM and worker files into public/@powersync/web/
so the browser worker thread can access them. Required — without this
the web build fails silently.

No other package changes. @powersync/react-native, @powersync/react,
@powersync/drizzle-driver, @powersync/op-sqlite all stay as-is.

---

## 3. Platform-Detected Database Factory

The only place native and web diverge is the database factory.
Everything else — schema, queries, hooks, sync rules — is identical.

```typescript
// packages/core/src/adapters/powersync/database.ts

import { Platform } from 'react-native'
import { AppSchema } from './schema'
import { PowerSyncDatabase } from '@powersync/react-native'

function createDatabaseFactory(accountId: string, encryptionKey: string) {
  if (Platform.OS === 'web') {
    // Web path — WASQLite + OPFS
    const { WASQLiteOpenFactory, WASQLiteVFS } = require('@powersync/web')
    return new WASQLiteOpenFactory({
      dbFilename: `gurudevi-${accountId}.db`,
      vfs: WASQLiteVFS.OPFSCoopSyncVFS,
      flags: {
        enableMultiTabs: typeof SharedWorker !== 'undefined'
      }
      // Note: verify ChaCha20 encryption key support before enabling
      // encryptionKey — do not assume parity with native SQLCipher
    })
  }

  // Native path — OP-SQLite with SQLCipher
  const { OPSqliteOpenFactory } = require('@powersync/op-sqlite')
  return new OPSqliteOpenFactory({
    dbFilename: `gurudevi-powersync-${accountId}.db`,
    sqliteOptions: { encryptionKey }
  })
}

export async function bootPowerSync(accountId: string) {
  const encryptionKey = await SecureStore.getItemAsync(
    `gurudevi-sqlite-cipher-key-${accountId}`
  )

  const factory = createDatabaseFactory(accountId, encryptionKey ?? '')

  const powersyncDb = new PowerSyncDatabase({
    schema: AppSchema,
    database: factory,
  })

  const drizzleDb = wrapPowerSyncWithDrizzle(powersyncDb, { schema: AppSchema })

  return { powersyncDb, drizzleDb }
}
```

---

## 4. VFS Strategy and Fallback Matrix

```
Browser           Primary VFS           Fallback
─────────────────────────────────────────────────────
Chrome/Firefox    OPFSCoopSyncVFS       IDBBatchAtomicVFS
Safari            OPFSCoopSyncVFS       IDBBatchAtomicVFS
Safari incognito  IDBBatchAtomicVFS     (OPFS not available)
Chrome incognito  OPFSCoopSyncVFS       100MB ceiling — warn user
Mobile browser    OPFSCoopSyncVFS       IDBBatchAtomicVFS
```

OPFSCoopSyncVFS is recommended for multi-tab and Safari/iOS stability.
IDBBatchAtomicVFS works well for small databases but degrades past 100MB.
For Gurudevi's Zone A data (students, attendance, bonds) small database
size is expected — IDBBatchAtomicVFS fallback is safe.

OPFSWriteAheadVFS: do not use yet. Chromium-only, added April 2026,
not enough production evidence. Revisit if read-heavy web analytics
become a bottleneck.

---

## 5. SSR Guard

If web build ever runs in a Next.js or SSR context, PowerSync
must not initialize on the server. Guard the factory:

```typescript
// At the top of bootPowerSync:
if (typeof window === 'undefined') {
  // SSR context — return no-op or null
  // PowerSync is client-only
  return null
}
```

For pure Expo web SPA builds this is less critical but add it anyway
as defensive practice before any framework migration.

---

## 6. Worker Assets — Build Configuration

The powersync-web copy-assets postinstall step copies worker files.
Verify these land in the correct public directory for your Expo web build.

For Expo web, the public directory is typically /public or /web.
Check that @powersync/web worker files are accessible at:
  public/@powersync/web/

If assets are not found at runtime the browser worker will fail
with a fetch error. This is one of the most common web setup failures.

---

## 7. Encryption on Web — Verify Before Implementing

Native uses SQLCipher (via op-sqlite) for per-account database encryption.
Web uses ChaCha20 cipher when an encryption key is provided to WASQLiteOpenFactory.
These are different cipher implementations — not a concern for data compatibility
since each account's database is local to its platform, but worth knowing.

Before enabling encryption on web:
- Verify WASQLiteOpenFactory accepts encryptionKey in your @powersync/web version
- Test that encrypted databases persist correctly across page reloads on OPFS
- Test Safari specifically — encryption + OPFS had edge cases in earlier versions

Until verified: web databases run without encryption. OPFS is origin-sandboxed
(only your app can access its files) so this is acceptable during development.
Per-account filename isolation still applies.

---

## 8. Multi-Account on Web

Same model as native — one OPFS file per account:

```
gurudevi-{accountId}.db    ← in OPFS, origin-sandboxed
```

Account swap protocol on web is identical to native (ADR-007):
  await ps_crud drain → disconnect → clear singleton → boot new instance

OPFS does not require explicit cleanup on logout beyond disconnecting
PowerSync — the file persists until explicitly deleted or the browser
storage is cleared. This is acceptable: the file is encrypted (once
encryption is verified) and origin-sandboxed.

---

## 9. Known Beta Risks — Watch These

These are the specific areas where React Native Web + PowerSync
Beta support is most likely to surface edge cases:

```
1. useLiveQuery reactivity on web
   Test: write a record, confirm UI re-renders without page reload
   Risk: change notification mechanism differs on web worker

2. Cross-tab sync
   Test: open two browser tabs, write in one, confirm other updates
   Risk: OPFSCoopSyncVFS cross-tab messaging may have edge cases

3. Safari + OPFS
   Test: full Zone A sync cycle on Safari
   Risk: historically the most fragile combination

4. App background / tab hidden
   Test: tab in background, network activity, return to tab
   Risk: web worker may be throttled by browser

5. Drizzle driver on web
   @powersync/drizzle-driver is Beta
   Test: all query patterns used in Zone A hooks
   Risk: type inference or query compilation edge cases
```

For each risk: test early, log issues to PowerSync GitHub, do not
wait until web launch to discover them.

---

## 10. Node SDK — Not Now

The PowerSync Node SDK (Beta) is not relevant for Gurudevi's
Hono API gateway. The API talks to Supabase directly.

Revisit if: server-side AI context hydration or report generation
creates Supabase query latency problems at scale.
Not before.

---

## 11. What Stays the Same

Everything in gurudevi-architecture-draft-1.md and
gurudevi-data-state-lifecycle.md is unchanged.
The web integration is purely additive at the factory layer.

```
AppSchema           — identical, no web-specific tables
Zone A/B/C model    — identical
useLiveQuery        — identical call sites
SovereignBus        — identical Zustand slice
SecureDrizzleProxy  — identical (web uses same Drizzle driver)
Cedar evaluation    — identical (WASM runs in browser too)
Account swap        — identical protocol
Cache eviction      — identical TTL rules
```

The platform boundary is: createDatabaseFactory(). That is the only
line in the codebase that knows whether it is running on native or web.

---

*Implementation: when ready, give agent this doc + gurudevi-data-state-lifecycle.md
Section 1 (boot hydration flow) since that is where the factory is called.*
