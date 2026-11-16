# CEDAR_WASM_INITIALIZATION.md

## Cedar WASM Integration & Initialization Analysis in React Native

### 1. Package Identity & Export Topology

- **Package**: `@cedar-policy/cedar-wasm@4.14.0`
- **Installed Location**: `node_modules/.pnpm/@cedar-policy+cedar-wasm@4.14.0/node_modules/@cedar-policy/cedar-wasm`
- **Target Export Subpath**: `@cedar-policy/cedar-wasm/web`
- **Artifacts in `/web`**:
  - `cedar_wasm.js` (21,762 bytes): wasm-bindgen generated JavaScript glue code.
  - `cedar_wasm.d.ts` (40,837 bytes): TypeScript declarations.
  - `cedar_wasm_bg.wasm` (4,446,668 bytes = 4.45 MB): Compiled Cedar WebAssembly core.
  - `cedar_wasm_bg.wasm.d.ts` (2,434 bytes): Direct wasm module exports declaration.
  - `package.json` (460 bytes): Declares `"type": "module"`, `"main": "cedar_wasm.js"`.

---

### 2. Generated Initialization API

The web target (`@cedar-policy/cedar-wasm/web`) exposes two initialization mechanisms in `cedar_wasm.js`:

```javascript
export { initSync, __wbg_init as default };
```

#### A. Asynchronous Default Initializer: `default(module_or_path)`
- Signature: `async function __wbg_init(module_or_path?: { module_or_path?: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>`
- If called without arguments:
  ```javascript
  if (module_or_path === undefined) {
      module_or_path = new URL('cedar_wasm_bg.wasm', import.meta.url);
  }
  ```
- If `module_or_path` is a string or URL, it executes browser `fetch`:
  ```javascript
  if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
      module_or_path = fetch(module_or_path);
  }
  ```
- It loads bytes using `Response.arrayBuffer()` and invokes `WebAssembly.instantiateStreaming` (if available) or `WebAssembly.instantiate`.

#### B. Synchronous Initializer: `initSync(module)`
- Signature: `function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput`
- Accepts an already-compiled `WebAssembly.Module` or raw buffer bytes (`BufferSource | WebAssembly.Module`).
- Directly executes:
  ```javascript
  if (!(module instanceof WebAssembly.Module)) {
      module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
  ```

---

### 3. Application Integration Pattern

In `packages/core/src/logic/permissions/cedarClientEvaluator.ts`, the application calls the asynchronous default initializer:

```typescript
function getWasmEvaluator(): Promise<EvaluateFn> {
  if (_wasmPromise) return _wasmPromise;
  _wasmPromise = (async () => {
    try {
      const mod = await import('@cedar-policy/cedar-wasm/web');
      await mod.default(); // <--- Called with undefined arguments
      _wasmLoaded = true;
      return mod.isAuthorized;
    } catch (error) {
      _wasmLoaded = false;
      _wasmPromise = null;
      throw new Error('CedarClientEvaluator: failed to load @cedar-policy/cedar-wasm/web', {
        cause: error,
      });
    }
  })();
  return _wasmPromise;
}
```

---

### 4. Failure Points in React Native / Metro

When `await mod.default()` executes in the React Native mobile environment, it encounters four compounding structural failures:

#### Failure 1: URL Resolution & `import.meta.url`
- React Native Hermes does not implement standard ES module URL resolution (`import.meta.url`).
- In `apps/gurudevi-mobile/babel.config.js`, Babel is configured with:
  ```javascript
  unstable_transformImportMeta: true
  ```
  This rewrites `import.meta` into `globalThis.__ExpoImportMetaRegistry`. 
- When `new URL('cedar_wasm_bg.wasm', import.meta.url)` executes, it generates an invalid or unresolvable URL scheme.

#### Failure 2: Network `fetch()` for Local Files
- In React Native, `fetch()` is backed by native HTTP clients (OkHttp on Android, NSURLSession on iOS).
- Native networking stacks cannot fetch local filesystem assets or bundle resources via relative or pseudo-file URLs (`cedar_wasm_bg.wasm`).

#### Failure 3: Missing Asset Bundling in Metro
- In `apps/gurudevi-mobile/metro.config.js`:
  - `config.resolver.assetExts.push('wasm')` is configured.
  - Line 356 bypasses Metro's internal resolver for `.wasm` files.
- **However**, Metro bundles assets strictly via static dependency analysis (e.g. `require('./file.wasm')` or static `import`).
- `@cedar-policy/cedar-wasm/web/cedar_wasm.js` uses dynamic string concatenation: `new URL('cedar_wasm_bg.wasm', ...)`. Metro's AST scanner cannot trace this URL.
- Consequently, Metro **never bundles `cedar_wasm_bg.wasm` into the native asset table or APK**.
- Inspection of `app-debug.apk` confirmed 0 `.wasm` files present.

#### Failure 4: Missing Runtime WebAssembly Primitives
- Even if the 4.45 MB binary were bundled and read into memory, `initSync` and `default` invoke:
  - `new WebAssembly.Module(bytes)`
  - `new WebAssembly.Instance(module, imports)`
- Because `globalThis.WebAssembly` is `undefined` in Hermes, this throws:
  ```text
  ReferenceError: Property 'WebAssembly' doesn't exist
  ```

#### Failure 5: Missing Wasm Reference Types (`externref`)
- In `cedar_wasm.js`, the wasm imports require:
  ```javascript
  __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, undefined);
  ```
- `@cedar-policy/cedar-wasm` is compiled targeting the WebAssembly Reference Types proposal (`externref`). Any lightweight or polyfilled interpreter that does not fully implement the modern Reference Types extension fails during table initialization.

---

### 5. Known-Good Cedar Evaluation Fixtures (Node.js Baseline)

To establish the functional baseline of `@cedar-policy/cedar-wasm@4.14.0/web` when WebAssembly is present, the test suite `cedarClientEvaluator.web-engine.test.ts` was executed under V8/Node.js using synchronous buffer injection (`initSync`):

```typescript
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { initSync } from '@cedar-policy/cedar-wasm/web';
import { evaluateShape2 } from '../cedarClientEvaluator';

const require = createRequire(import.meta.url);
const nodeEntry = require.resolve('@cedar-policy/cedar-wasm/nodejs');
initSync({ module: readFileSync(join(dirname(nodeEntry), '..', 'web', 'cedar_wasm_bg.wasm')) });
```

#### Test Fixtures Evaluated:

1. **Permit Case (Universal Allow):**
   - Policy: `permit(principal, action, resource);`
   - Request: Principal `alice`, Action `read`, Resource `Classroom:c1`
   - Result: `true` (Allowed)

2. **Conditional Permit Case (Action Match):**
   - Policy: `permit(principal, action == Action::"grade", resource);`
   - Request: Principal `alice`, Action `grade`, Resource `GradeMark:g1`
   - Result: `true` (Allowed)

3. **Forbid / Deny Case (Resource Type Mismatch):**
   - Policy: `permit(principal, action == Action::"grade", resource);`
   - Request: Principal `alice`, Action `grade`, Resource `Assignment:a1`
   - Result: `false` (Denied by default Cedar forbid)

When provided with a compliant V8/WebAssembly engine and binary bytes, the Cedar WASM package evaluates policies correctly. On mobile Hermes, however, the prerequisite WebAssembly engine does not exist.
