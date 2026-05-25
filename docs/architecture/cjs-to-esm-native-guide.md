# Sovereign Architecture Guidelines: Native ESM Transition & Hygiene

This document establishes the official repository standards and design patterns for complete transition from legacy **CommonJS (CJS)** to **Native ES Modules (ESM)**. 

All packages and apps in this monorepo must adhere to these conventions to guarantee high-performance builds, efficient tree-shaking, and seamless compatibility with **TypeScript 6.0.3+** and **Expo SDK 56+**.

---

## 🏛️ Why Native ESM?

CommonJS (`require`/`module.exports`) is static, synchronous, and introduces runtime overhead through interop polyfills. Native ESM (`import`/`export`) allows:
1. **Static Analysis**: The engine resolves module graphs at compile time rather than run time, leading to faster startup.
2. **Aggressive Tree Shaking**: Dead-code elimination works natively, minimizing production bundles.
3. **Ecosystem Alignment**: Modern libraries (like Reanimated v4, TanStack Query, and Vite plugins) are strictly ESM-first.

---

## 🚫 Deprecated CJS Patterns vs. ✨ Modern ESM Solutions

### 1. Module Loading

*   **Deprecated (CommonJS)**:
    ```javascript
    // ❌ Synchronous, opaque, bypasses ESM compiler tree-shaking
    const path = require('node:path');
    const { profileAPI } = require('@repo/profile/api/profile');
    ```
*   **Modern (Native ESM)**:
    ```typescript
    // ✨ Static, statically analyzable, enables seamless resolution
    import path from 'node:path';
    import { profileAPI } from '@repo/profile/api';
    ```

---

### 2. Export Definitions

*   **Deprecated (CommonJS)**:
    ```javascript
    // ❌ Runtime mutations, complex interop wrappers
    module.exports = {
      myFeature,
    };
    ```
*   **Modern (Native ESM)**:
    ```typescript
    // ✨ Native engine optimization, compile-time validation
    export const myFeature = () => { ... };
    export default myFeature;
    ```

---

### 3. Dynamic Imports

*   **Deprecated (CommonJS)**:
    ```javascript
    // ❌ Synchronous conditional loading blocks the thread
    let myModule;
    if (condition) {
      myModule = require('my-heavy-library');
    }
    ```
*   **Modern (Native ESM)**:
    ```typescript
    // ✨ Asynchronous, code-split chunk generation
    let myModule;
    if (condition) {
      myModule = await import('my-heavy-library');
    }
    ```

---

## 🧪 Testing Practices under Vitest ESM

When writing or updating test suites in Vitest:

1.  **Use ES Imports**: Never use `require()` inside `__tests__/` files. Vitest runs in ESM; using `require()` forces Node to fall back to the legacy CommonJS resolver, which cannot resolve extensionless `.ts` imports inside package barrels.
2.  **Rely on Package Barrels**: Standardize on importing from the package root or designated subpath barrels (e.g., `@repo/core/api`) instead of deep nested file structures (e.g., `@repo/core/src/api/subfolder/file.ts`).
3.  **Use `.mts` Extensions for Tool Configurations**: For tools loaded directly by Node that utilize ESM-only plugins (like `vite-tsconfig-paths` in Vitest), use the `.mts` file extension to enforce native ES module loading without relying on interop libraries.

---

## 🛡️ Registry-Based Design & Inversion of Control (IoC)

To prevent circular dependencies during the ESM transition:
* **Feature Isolation**: Domain packages (like `@repo/classroom` or `@repo/admin`) must never import directly from other feature packages.
* **Orchestration Layer**: Feature packages register their capabilities and APIs with the central `@repo/core` registry/orchestrator at initialization time.
* **Runtime Resolution**: If a screen in `@repo/classroom` needs an admin-owned feature, it must query the central `@repo/core/api` interface rather than importing from `@repo/admin` directly.
