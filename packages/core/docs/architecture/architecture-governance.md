---
title: "Architecture Governance: @repo/core"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core]
---

# Architecture Governance: @repo/core

This document defines the architectural principles and boundary rules for the `@repo/core` package to ensure platform-agnosticism and modern ESM compatibility.

## Principles

### 1. ESM Purity
The `@repo/core` package is an **ESM-First** library. 
- All files must be compatible with Node.js `"type": "module"`.
- No CJS globals (`require`, `module.exports`, `__dirname`) should be used in source files.
- Extensions in imports must be explicit if required by the runtime (though `moduleResolution: bundler` often relaxes this for dev).

### 2. Native Isolation (The "logic/native" Split)
The package is divided into two strict layers:
- **`src/logic/`**: Pure TypeScript logic. **ZERO** imports from `react-native`, `expo`, or any native-specific libraries. Logic must communicate with the world via "Ports" (Interfaces).
- **`src/native/`**: Platform-specific implementations. This is the only place where `react-native` or `expo-` imports are permitted.

### 3. Lazy Native Loading
To prevent "Import Crashes" on Web/Astro environments:
- Native dependencies must be loaded **lazily** using dynamic `import()`.
- Top-level imports of native-only libraries are strictly forbidden in shared code paths.
- Failsafes and fallbacks must be provided for environments where native modules are unavailable (e.g., SSR or standard browsers).

### 4. Composition Root Isolation
- The "Wiring" layer (runtimes that instantiate repositories and services) must live in **`src/native/runtimes/`**.
- Logic domain `index.ts` files must never export a `runtime.ts` or any file that triggers native side-effects.
- Dependency Injection must be used to provide adapters to the logic layer at runtime.

## Boundary Rules

- **Logic -> Native**: ⛔ STICKLY FORBIDDEN. Use Dependency Injection or Port-Adapter pattern.
- **Native -> Logic**: ✅ PERMITTED. Native adapters implement logic ports.
- **Logic -> Shared Libs**: ✅ PERMITTED (e.g., Zod, i18next).
- **Logic -> UI**: ⛔ STICKLY FORBIDDEN. Core logic must not depend on UI frameworks.
- **Logic -> Hybrid Hooks**: ⛔ STICKLY FORBIDDEN. Hooks that consume the global `api` (e.g., `useEntity.ts`) must live in `src/hooks/` and are considered "Impure" relative to core logic.

## Enforcement
- **Linting**: Biome/ESLint rules should track illegal imports.
- **Testing**: `pnpm run test:logic` must always pass in a pure Node environment without native polyfills.
