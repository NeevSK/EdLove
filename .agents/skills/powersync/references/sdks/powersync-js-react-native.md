---
name: powersync-js-react-native
description: PowerSync React Native, Expo, and Expo Go integration — native SQLite adapters, managed workflow setup, and Expo Go sql-js fallback
metadata:
  tags: react-native, expo, expo-go, mobile, op-sqlite, javascript, typescript, offline-first
---

# PowerSync React Native, Expo & Expo Go

> **Load this when** building a React Native app, Expo app (managed or bare), or Expo Go sandbox. Always load `powersync-js.md` first.

React Native-specific integration for the PowerSync JavaScript SDK. Use this reference alongside `references/sdks/powersync-js.md` when building React Native apps, Expo apps (managed or bare workflow), or Expo Go sandboxes.

The React hooks API (`useQuery`, `useStatus`, `usePowerSync`, `useSuspenseQuery`) from `@powersync/react-native` is identical to `@powersync/react` — see `references/sdks/powersync-js.md` for full hook patterns and `references/sdks/powersync-js-react.md` for `useSuspenseQuery` and sync stream hooks.

| Resource | Description |
|----------|-------------|
| [React Native & Expo SDK](https://docs.powersync.com/client-sdks/reference/react-native-and-expo.md) | Full SDK documentation for React Native, consult for details beyond the inline examples. |
| [React Native SDK API Reference](https://powersync-ja.github.io/powersync-js/react-native-sdk) | Full API reference for `@powersync/react-native`, consult only when the inline examples don't cover your case. |
| [Expo Go Support](https://docs.powersync.com/client-sdks/frameworks/expo-go-support.md) | Expo Go adapter guide, consult for details beyond the inline examples. |

## 1. Install

### Standard React Native (Recommended)

```bash
npm install @powersync/react-native@latest
```

The React Native SDK v2 has the OP-SQLite adapter built in. Install OP-SQLite itself as a direct dependency: React Native autolinking only discovers direct dependencies.

```bash
npm install @op-engineering/op-sqlite@latest
```

Do not install `@powersync/op-sqlite` or `@journeyapps/react-native-quick-sqlite` for the v2 React Native SDK. OP-SQLite is the sole native implementation in v2; the old separate PowerSync adapter arrangement is obsolete. The SDK declares `@op-engineering/op-sqlite` as a peer dependency.

After installing native dependencies, rebuild your native app:

```bash
npx expo prebuild   # Expo managed/bare
# or
npx react-native run-ios / run-android
```

## 2. Provider Setup

The provider pattern is identical to React web. Import from `@powersync/react-native`:

```tsx
import { PowerSyncContext } from '@powersync/react';

export function App() {
  return (
    <PowerSyncContext.Provider value={db}>
      <YourApp />
    </PowerSyncContext.Provider>
  );
}
```

## 3. Database Initialization

```ts
import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './AppSchema';

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'app.db'
  }
});
```

In v2, `@powersync/react-native` uses its built-in OP-SQLite adapter. Pass the database filename and SQLite options through the public `database` option; no `OPSqliteOpenFactory` import or separate `@powersync/op-sqlite` package is needed. Keep `@op-engineering/op-sqlite` installed directly for autolinking.

## Expo

### Managed Workflow

PowerSync works with Expo managed workflow. Native adapters (recommended) require a development build because they use native modules. If you need to run in Expo Go, use the JavaScript-only adapter instead. See the Expo Go section below.

```bash
npx expo install @powersync/react-native @op-engineering/op-sqlite
npx expo prebuild
npx expo run:ios   # or run:android
```

Use [EAS Build](https://docs.expo.dev/build/introduction/) for CI/CD builds.

### Bare Workflow

Same as standard React Native above. Run `npx react-native run-ios` / `run-android` after installing native dependencies.

## Expo Go

Expo Go is a sandbox that does not support native modules. To run PowerSync in Expo Go, use the JavaScript-only adapter `@powersync/adapter-sql-js`.

> Alpha: `@powersync/adapter-sql-js` is in alpha. Do not use in production.

### Limitations

- No SQLite consistency guarantees — every write triggers a full rewrite of the entire database file; the app may end up with missing data or a corrupted file if killed mid-write
- Significantly slower than native adapters
- Default mode is in-memory; persistence requires a custom `persister` option

### Install

```bash
npm install @powersync/react-native@latest @powersync/adapter-sql-js@latest
```

### Usage

```tsx
import { SQLJSOpenFactory } from '@powersync/adapter-sql-js';
import { PowerSyncDatabase, Schema } from '@powersync/react-native';

export const powerSync = new PowerSyncDatabase({
  schema: new Schema({}), // define your schema here
  database: new SQLJSOpenFactory({
    dbFilename: 'app.db',
  }),
});
```

### Switching Between Expo Go and Native Adapters

Use `Constants.executionEnvironment` to select the adapter at runtime, allowing the same codebase to run in both Expo Go and development/production builds:

```tsx
import { SQLJSOpenFactory } from '@powersync/adapter-sql-js';
import { PowerSyncDatabase } from '@powersync/react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: isExpoGo
    ? new SQLJSOpenFactory({ dbFilename: 'app.db' })
    : { dbFilename: 'sqlite.db' }, // uses native adapter
});
```

### Moving Beyond Expo Go

When moving to development builds or production, use the built-in v2 OP-SQLite adapter with the direct `@op-engineering/op-sqlite` peer dependency.

These require native compilation and cannot run inside Expo Go's prebuilt container.

## Common Pitfalls

### Forgetting to rebuild after installing native deps

Any change to native dependencies requires a new development or production build. Running `npx expo start` without rebuilding uses the old native bundle and the new package won't be linked. Follow the app's CNG and native-build workflow; do not edit generated `android/` or `ios/` files directly.

### Using Expo Go without the sql-js adapter

Expo Go does not include OP-SQLite's native module. Use `@powersync/adapter-sql-js` only for an Expo Go sandbox; use the built-in OP-SQLite adapter in a development build or production app.

## SDK v2.4.0 notes

- `connect()` can take an `Authenticator` and `MutationUploader` separately, including download-only and upload-only forms. Existing `PowerSyncBackendConnector` implementations remain supported.
- `connectTimeoutMs` defaults to 30 seconds, so a service that never responds no longer leaves connection, checkpoint, upload, download, or later disconnect work hanging indefinitely.
- Initialization failures can be followed by disconnect/reconnect, and failed commits now surface their error and roll back correctly.
- `usePowerSyncOrNull()` and `useStatusOrNull()` support places where a database may be absent, such as SSR. Managed tables are still alpha; do not adopt them as a routine migration.

See the dated [v2.4.0 release notes](https://releases.powersync.com/announcements/react-native-client-sdk) before changing connection, retry, or transaction behavior.
