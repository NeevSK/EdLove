# Monorepo Native ESM & Headless Mocking Architecture Guide

This guide establishes the sustainable, Native ESM-first architectural patterns for the **Gurudevi Monorepo** (Expo SDK 56+, TypeScript 6+, Vitest 2+). It codifies the lessons learned from migrating our API surfaces and architecture tests from legacy CommonJS (CJS) structures to highly optimized Native ESM.

---

## 1. The ESM-First Monorepo Philosophy

Under **Expo SDK 56** and **React Native 0.85**, the React Native ecosystem has fully embraced Native ESM. Moving away from CommonJS shims guarantees:
- **Instant Local Compilation**: Shorter Metro and Vite bundle cycles.
- **Tree-Shaking Efficiency**: Unused modules are dead-code-eliminated at the compiler boundary.
- **Unified Portability**: The same domain packages can run natively in the mobile client, headless Node.js testing environments, and high-performance serverless environments (Railway/Sanctuary API).

> [!IMPORTANT]
> To maintain the integrity of our offline-first architecture, all new domain APIs and service decorators **must** target Native ESM as the default. Avoid publishing or consuming internal packages in raw CommonJS.

---

## 2. The Danger of Barrel Imports & Subpath Safety

A classic architectural trap in modern ESM bundlers is the **barrel import crash** (caused by `index.ts` files that export everything under a package). 

### The Problem
When an architecture test imports a lightweight utility or API client from a barrel package (e.g. `import { selfAPI } from '@repo/self'`), the Node compiler is forced to parse **every single file** re-exported by that barrel, including heavy React Native UI views, animations (Reanimated), and assets.
If the test runs in a headless Node environment:
1. React Native's Flow-typed syntax or complex modules (like `typeof` statements or animations) crash the standard JavaScript parser.
2. The environment fails with: `SyntaxError: Unexpected token 'typeof'` or type-stripping errors.

### The Solution: Granular Subpath Exports
We decouple the **logical API layer** from the **presentation UI layer** by using granular exports in the package's `package.json` file.

```json
{
  "name": "@repo/self",
  "exports": {
    ".": "./src/index.ts",
    "./api": "./src/api/index.ts",
    "./components": "./src/components/index.ts",
    "./screens": "./src/screens/index.ts"
  }
}
```

```mermaid
graph TD
    subgraph Test Suite (Headless Node)
        A[poa_enforcement.test.ts]
    end

    subgraph Barrel Imports (Anti-Pattern)
        A -.->|import from @repo/self| B[self/index.ts]
        B --> C[self/api]
        B --> D[self/components]
        B --> E[self/screens]
        D -->|Crashes parser!| F[Flow Types/typeof]
    end

    subgraph Subpath Exports (Production Pattern)
        A ===>|import from @repo/self/api| G[self/api/index.ts]
        G --> H[self/api/self.ts]
        class H fill:#1b5e20,stroke:#388e3c,stroke-width:2px;
    end
```

> [!TIP]
> **Always import logical services or API interfaces via their dedicated subpaths** (e.g. `@repo/self/api`) within headless Vitest files to prevent importing unrelated visual layers.

---

## 3. Headless Vitest Mocking & Isolation

Architecture tests verify routing logic, metadata adherence, and ReBAC (Relationship-Based Access Control) compliance *without* spinning up SQLite databases, local servers, or native secure stores.

### Rule 1: Bypass Native Platform Adapters
Do not import native runtime bundles (like `@repo/core/native`) directly inside tests. They load hardware-bound services (`expo-secure-store`, `DeviceTrustEngine`) that require full client bootstrapping. Instead, import low-level singletons directly from their source files:

```diff
-import { supabase } from '@repo/core/native';
+import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as supabase } from '@repo/core/api/supabase';
```

### Rule 2: Lightweight Third-Party Shims
When standard native modules are transitively loaded, intercept them using lightweight Vite aliases in `vitest.config.mts`:

```typescript
// vitest.config.mts
resolve: {
  alias: {
    'react-native': resolve(__dirname, './vitest-react-native-mock.ts'),
    'expo-sqlite': resolve(__dirname, './vitest-sqlite-mock.ts'),
    'expo-modules-core': resolve(__dirname, './vitest-expo-modules-core-mock.ts'),
  }
}
```

### Rule 3: Mock the Offline Permission Evaluator
To prevent headless runs from failing with `Storage provider not registered` during ReBAC checks, mock the `checkLocalPermission` evaluator to mirror the logical context under test synchronously:

```typescript
vi.mock('@repo/core/logic/permissions/localEvaluator', () => ({
  checkLocalPermission: vi.fn(async (params) => {
    // Mimic the policy rules without checking the WASM engine or SQLite storage
    const isAnonymous = !params.userContext || params.userContext.isAnonymous;
    return !isAnonymous; // Authenticated users pass, anonymous guests fail
  }),
}));
```

### Rule 4: Explicit ESM Imports for Test Helpers (No Globals)

In CommonJS-era testing frameworks (like classic Jest), test runners injected helper functions like `describe`, `it`, `expect`, and `vi` directly into the global namespace. 

This legacy pattern is an anti-pattern in Native ESM systems because:
1. **Namespace Pollution**: It injects implicit runtime constructs that are invisible to pure JS analyzers.
2. **IDE & Compilation Failures**: It triggers TypeScript and ESLint compilation errors (e.g. `Cannot find name 'expect'`) when test suites are evaluated in isolating compilers or lint passes that don't load the runner's custom environment globally.
3. **Weak Contract Explicitness**: Files do not explicitly declare their imports, violating standard Native ESM modular design.

We strictly enforce **explicit imports** from `'vitest'` for all assertion, suite, and mocking utilities.

#### Old Pattern (CommonJS/Jest-compatibility Globals)
```typescript
// No imports declared for test helpers
describe('example suite', () => {
  it('performs assertion', () => {
    expect(myVar).toBeDefined();
  });
});
```

#### New Pattern (Native ESM Explicit Imports)
```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('example suite', () => {
  it('performs assertion', () => {
    expect(myVar).toBeDefined();
  });
});
```

---


## 4. Double-Gate Client-Side API Security

We utilize **Double-Gate Authorization** for maximum local resilience:
1. **Client-Side Gate Guard (Fast-Fail)**: Block unauthenticated users/guests at the local API boundary before sending any RPC requests over the wire.
2. **Server-Side Gate Guard (Enforcer)**: Decouple server ReBAC rules to ensure write-safety at the database edge.

### Implementation Pattern in API Gateways

Always protect local write operations and user queries with active authentication checks inside the local API client definition:

```typescript
import { useStore } from '@repo/core/logic';
import { APIError } from '@repo/core/types';

function assertAuthenticated() {
  const state = useStore.getState();
  if (!state.user || state.user.is_anonymous) {
    throw new APIError('Forbidden', '403');
  }
}

export const domainAPI = {
  async writeAction(payload: any) {
    // 1st Gate: Local client-side guest check
    assertAuthenticated();
    
    // 2nd Gate: Server-side POA Proxy check (via Hono client)
    return await client.api.domain.$post({ json: payload });
  }
};
```

---

## 5. Summary Checklist for New Domain Integrations

- [ ] **Granular Subpaths**: Register `exports` paths in the domain's `package.json` for `./api`, `./hooks`, and `./components`.
- [ ] **Mock Verification**: Add a test in `apps/gurudevi-mobile/src/__tests__/architecture/` verifying ReBAC proxy blocks for anonymous guests and allows authenticated users.
- [ ] **Pure Logical Imports**: Import only API abstractions and bypass raw `@repo/core/native` bundles in headless files.
- [ ] **Fast Fail**: Add `assertAuthenticated()` or equivalent checks inside user-facing mutation boundaries to avoid redundant network noise.
