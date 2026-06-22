---
title: "PowerSync Web / Native Boot Boundary"
status: "active"
created: 2026-06-14
updated: 2026-06-14
author: "Naween"
scribe: "Antigravity"
tags: [architecture, powersync, web, native, expo-router, bootstrap]
---

# PowerSync Web / Native Boot Boundary

This note records the platform split for Gurudevi Mobile after the web build started failing on native PowerSync bootstrap.

## 1. Why This Exists

PowerSync on native mobile depends on SQLite, SQLCipher, and JSI-backed runtime primitives.
The browser build must not import or initialize those native layers.

The fix is not to force one shared runtime path.
The fix is to split the platform boundary cleanly:

- native keeps the real PowerSync provider and local-first sync stack
- web uses a no-op provider shell and browser-safe shared adapters

## 2. What Changed

### Native

- `apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx` remains the native bootstrap path
- it owns SQLCipher key creation, PowerSync database construction, and native Drizzle injection
- it should only be used by native runtimes

### Web

- `apps/gurudevi-mobile/src/providers/PowerSyncProvider.web.tsx` now replaces the native provider on web
- the web provider renders children directly and does not touch SQLite, JSI, or SecureStore
- shared core imports resolve to web-safe platform files instead of the native PowerSync database

### Shared core shims

- `packages/core/src/adapters/powersync/database.web.ts` provides a browser-safe in-memory placeholder
- `packages/core/src/store/usePermissionStore.web.ts` disables permission bootstrap on web
- `packages/core/src/logic/permissions/localEvaluator.web.ts` fails closed on the browser and avoids native policy evaluation

## 3. Expo Router Boot Sequence

The current startup order is:

1. `index.ts` loads polyfills and Expo Router entry wiring
2. `app/_layout.tsx` renders the root shell and registers app-level providers
3. `bootstrapPlatform()` runs inside `RootShell`
4. `coreRuntime.register(...)` happens before app logic needs shared services
5. `AppContent()` mounts navigation, guards, and feature providers

That means the router owns screen composition, while the app root owns bootstrap orchestration.

## 4. Platform Contract

### Native mobile

- use real PowerSync, SQLite, and local permission evaluation
- allow background sync, device trust, and offline mutation flows
- keep the native provider and native permission evaluator active

### Web

- do not import native SQLite/JSI bootstrap at all
- do not call `assertPowerSyncBootstrapReady()` from browser startup paths
- treat sync-backed state as unavailable unless a browser-safe adapter is explicitly added
- keep route booting deterministic and direct-API-first

## 5. Implementation Rule

If a module needs real PowerSync, it must be platform-scoped.

If a module must be import-safe on both web and native, it needs a browser-safe fallback or a platform file.

## 6. Decision Table

| Question | Web choice | Native choice | Why |
|---|---|---|---|
| How do we boot the runtime? | Browser-safe runtime environment | Native runtime environment | Keep platform startup deterministic |
| How do we store local structured data? | `@powersync/web` + OPFS + WA-SQLite | `@powersync/react-native` + op-sqlite | Use the best local SQL engine per platform |
| How do we resolve identity? | RPC-first, browser-safe session state | RPC-first, device-aware identity | Identity stays authoritative |
| How do we model device trust? | Origin-bound trust state | Device-bound trust state | Browser lacks native attestation |
| How do we handle permissions? | Shared Cedar/ReBAC contract with browser-safe evaluation path | Shared Cedar/ReBAC contract with local policy evaluation | Same contract, different runtime primitive |
| How do we protect account isolation? | Scope storage by account + origin | Scope storage by device + account | Avoid data leakage between principals |

## 7. Boot Order

1. Platform bootstrap registers browser or native runtime services.
2. Root shell waits for bootstrap completion.
3. PowerSync provider mounts after the runtime is ready.
4. Identity bootstrap resolves the active principal.
5. Device-trust/session state is refreshed.
6. Permission and feature stores hydrate.
7. Navigation and app content render.

## 6. Verification Notes

After this split, web should boot without:

- `expo-secure-store` native bootstrap crashes
- `@powersync/react-native` import failures
- browser-side SQLite initialization attempts

The remaining work is to keep web features on direct API or browser-safe adapters until a true browser PowerSync strategy is defined.
