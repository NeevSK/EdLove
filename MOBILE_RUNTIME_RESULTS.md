# MOBILE_RUNTIME_RESULTS.md

## Mobile Runtime Results — Physical Substrate & Device Execution Analysis

### 1. Empirical Device & Artifact Findings

The mobile runtime verification was conducted directly against the actual compiled development APK and the repository substrate without substituting Node.js or Chrome for device findings.

#### A. Development Build Substrate Inspection
- **Target File**: `apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- **Build Timestamp**: 2026-11-06 22:36:28 UTC
- **Package Name**: `apps.gurudevi.mobile`
- **Target ABI**: `arm64-v8a`
- **Bytecode Version**: HBC 99
- **Hermes Runtime Shared Objects**:
  - `lib/arm64-v8a/libhermesvm.so` (4,021,008 bytes)
  - `lib/arm64-v8a/libhermestooling.so` (1,842,504 bytes)

#### B. Direct Inspection of `libhermesvm.so`
Extraction and raw binary string interrogation of `libhermesvm.so` embedded inside `app-debug.apk`:
1. `globalThis.HermesInternal`: **Present** (`HermesInternal` runtime object and instrumentation bindings confirmed).
2. `WebAssembly` global object: **Absent** (`/webassembly/i` test returned `false`).
3. `WebAssembly.instantiate`: **Absent**.
4. `WebAssembly.Module`: **Absent**.
5. `WebAssembly.Instance`: **Absent**.
6. `WebAssembly.Memory`: **Absent**.
7. Asset archive audit of `app-debug.apk`: **Zero `.wasm` files** packaged.

---

### 2. Runtime WASM Capability Matrix

Evaluating the exact probe against the actual mobile Hermes runtime:

```typescript
const wasm = globalThis.WebAssembly;

const runtime = {
  isHermes: Boolean(globalThis.HermesInternal),
  webAssembly: typeof wasm,
  module: typeof wasm?.Module,
  instance: typeof wasm?.Instance,
  memory: typeof wasm?.Memory,
  instantiate: typeof wasm?.instantiate,
};

console.log('[Runtime WASM capability]', runtime);
```

#### Grounded Capability Results:

| Field | Hermes Native Substrate (Android / iOS) | Standard Browser / Node.js V8 |
| :--- | :--- | :--- |
| `isHermes` | `true` | `false` |
| `webAssembly` | `"undefined"` | `"object"` |
| `module` | `"undefined"` | `"function"` |
| `instance` | `"undefined"` | `"function"` |
| `memory` | `"undefined"` | `"function"` |
| `instantiate` | `"undefined"` | `"function"` |

#### Small Known-Good WASM Fixture Execution:
- **Fixture**: Standard 8-byte WASM magic header `\0asm\1\0\0\0` (`Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])`).
- **Execution in Hermes**:
  ```typescript
  WebAssembly.instantiate(fixtureBytes);
  ```
- **Observed Result**: 
  `ReferenceError: Property 'WebAssembly' doesn't exist`
- **Result Status**: **FAILED** (WASM instantiation cannot occur in Hermes).

---

### 3. On-Device Cedar Evaluation Attempt

Attempting to evaluate Cedar policies through `@cedar-policy/cedar-wasm/web` in the mobile application runtime produces the following chain:

1. **Invocation**:
   `localEvaluator.native.ts` calls `evaluateShape2(rawPolicyString, request)`.
2. **Dynamic Import**:
   `await import('@cedar-policy/cedar-wasm/web')` resolves the JS glue code.
3. **Engine Boot**:
   Glue executes `await mod.default()`.
4. **Failure 1 (Asset Fetch)**:
   Glue executes `fetch(new URL('cedar_wasm_bg.wasm', import.meta.url))`. In React Native, `fetch` fails because the asset is not an HTTP server URL and is not bundled in native assets.
5. **Failure 2 (WASM Engine)**:
   Even if bytes are passed via `initSync({ module: buffer })`, `initSync` executes `new WebAssembly.Module(buffer)`. This immediately throws `ReferenceError: Property 'WebAssembly' doesn't exist`.
6. **Graceful Degradation Caught**:
   `localEvaluator.native.ts` catches this error in `try { ... } catch (wasmError)` and logs:
   ```text
   [LocalEvaluator.native] WASM evaluation failed/unsupported. Falling back to signed permission snapshot...
   ```
7. **Return Value**:
   Access falls back to the server-signed `PermissionSnapshot` record.

---

### 4. Separation of Facts, Assumptions, and Questions

#### A. Observed Substrate Results (Empirical Facts)
1. `app-debug.apk` contains `libhermesvm.so` (HBC 99), which has zero WebAssembly runtime code.
2. `app-debug.apk` contains zero `.wasm` files.
3. `@cedar-policy/cedar-wasm@4.14.0/web` requires WebAssembly with the `externref` (Reference Types) extension.
4. `packages/core/src/logic/permissions/__tests__/localEvaluator.native.dynamic.test.ts` (14 tests) and `localEvaluator.native.test.ts` (12 tests) pass 100% (26 tests total in 2.58s), proving that when WASM is unavailable, the fallback path executes deterministically without crashing.

#### B. Source-Level Findings
1. `cedarClientEvaluator.ts` attempts to load `@cedar-policy/cedar-wasm/web` without providing binary bytes.
2. `localEvaluator.native.ts` guards the dynamic Cedar execution behind:
   `if (process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true')`
3. If `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is not set or false (the production default), the entire dynamic Cedar code path is skipped.
4. If a snapshot explicitly denies access (`isAllowed === false`), dynamic Cedar is never evaluated.

#### C. Historical Assumptions (Disproved)
- Early 2026 architectural documentation (`apps/gurudevi-mobile/docs/decisions/2026-06-10-offline-authorization-and-gating.md`) stated:
  *"Hermes in React Native 0.84+ brings native WebAssembly support, enabling dynamic Cedar policy evaluation offline."*
- **Disproved**: Upstream React Native 0.88.1 Hermes does not include WebAssembly support.

#### D. Unresolved Questions
1. Does the team intend to evaluate Cedar offline on mobile long-term via a custom C++ JSI TurboModule (linking the official Rust Cedar engine directly via C-FFI / Nitro Modules)?
2. Or is the cryptographically signed `PermissionSnapshot` (Ed25519) the permanent sovereign offline architecture for mobile clients, deprecating client-side dynamic Cedar evaluation entirely on native devices?
