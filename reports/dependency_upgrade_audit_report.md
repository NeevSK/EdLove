# Dependency Upgrade & Compatibility Audit Report

**Date:** June 10, 2026  
**Audited By:** Antigravity (AI Coding Assistant)  
**Target Workspace:** `gurudevi-mobile` (Expo SDK 56)

---

## 1. Expo Doctor & Installation Check Results

We ran `expo-doctor` and `expo install --check`. The checks flagged the following three package major version mismatches against Expo SDK 56's deterministic baseline:

| Package | Expected Version | Active/Found Version | Risk Profile / Notes |
| :--- | :--- | :--- | :--- |
| `@sentry/react-native` | `~7.11.0` | `8.13.0` | **Safe / Recommended**: Sentry v8 is required for compatibility with React 19 / React Native 0.85 rendering boundaries and the new `expo-router` architecture. |
| `react-native-get-random-values` | `~1.11.0` | `2.0.0` | **Safe**: Works seamlessly via native `expo-crypto` integration (see detailed analysis below). |
| `@types/jest` | `29.5.14` | `30.0.0` | **Low**: Used only for dev-time typing. Since the project uses Vitest as the primary test runner, this has no runtime impact. |

### Metro Configuration Warning
* **Mismatch:** `resolver.disableHierarchicalLookup` expected `false`, but found `true`.
* **Implications:** This is enabled in `metro.config.js` to ensure module resolution works correctly within the `pnpm` monorepo workspace. It should be kept as `true`.

---

## 2. Compatibility Analysis: `react-native-get-random-values` (v2 vs. v1)

We audited the source code of `react-native-get-random-values` version `2.0.0` to verify how it behaves under Expo SDK 56.

### Native Integration Verification
Inside `react-native-get-random-values/index.js` (lines 48–52):
```javascript
// Expo SDK 48+
if (global.expo?.modules?.ExpoCrypto?.getRandomValues) {
  // ExpoCrypto.getRandomValues doesn't return the array
  global.expo.modules.ExpoCrypto.getRandomValues(array)
  return array
}
```

1. **Direct Delegation:** Under Expo, `react-native-get-random-values` detects the presence of the native module `ExpoCrypto` (provided by standard `expo-crypto` which is installed) and delegates the random generation directly to it.
2. **Peer Dependency Fit:** Version 2.0.0 lists `react-native: >=0.81` as a peer dependency. Expo 56 operates on React Native `~0.85.3`, meaning version 2.0.0 is syntactically and structurally aligned with the active React Native version. Version 1.11.0 targets older React Native versions.
3. **Conclusion:** **`react-native-get-random-values` v2.0.0 is completely safe and functional.** There is no need to downgrade.

---

## 3. Vitest Test Failures Root Cause Analysis

Two tests failed during the execution of `vitest run`:
1. `throws Forbidden before lessonsAPI.create reaches Supabase without capacity`
2. `blocks profile update for guests before service execution`

### Root Cause: POA Proxy Deletion
These failures are **unrelated** to the packages upgrade.

In the commit `b0f182db` ("*refactor: upgrade gluestack to v3 and refactor offline security & proxies*"), the client-side POA proxies (`poaProxy.ts` and `temporalPOAProxy.ts`) were deleted because authorization checks were migrated to:
* Direct database policies.
* BFF (backend) API gateway middleware layers.

Because client-side calls (e.g., `lessonsAPI.create` and `profileAPI.updateProfile`) are no longer wrapped by a client-side proxy that intercepts and throws `Access Denied` locally, these methods attempt to execute a real network request using the Hono client.
In a headless unit testing context, these network calls fail with a `TypeError: fetch failed` instead of the expected `Access Denied` error.

### Recommendations for the Test Failures:
To resolve these architectural test failures, we recommend one of the following approaches:
1. **Mock the `fetch` calls to return a `403 Forbidden` response** for unauthenticated states, similar to how the authenticated tests mock `fetch`.
2. **Add client-side defense-in-depth checks** in `lessonsAPI.create` and `profileAPI.updateProfile` (using `assertAuthenticated` similar to `selfAPI`), which will throw a local error before attempting a fetch.
