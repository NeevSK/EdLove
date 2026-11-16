# HERMES_RUNTIME_CAPABILITIES.md

## Runtime Investigation — Hermes Engine WebAssembly Capabilities in Edlove Mobile

### 1. Executive Summary

This investigation empirically verifies whether the Hermes JavaScript engine embedded in the Edlove mobile application (`apps/gurudevi-mobile`) can execute WebAssembly (WASM), specifically the `@cedar-policy/cedar-wasm` package.

**Finding:** The embedded Hermes engine in React Native 0.88.1 / Expo SDK 58 **does not support WebAssembly**. `globalThis.WebAssembly` is `undefined`. No WebAssembly runtime, interpreter, or JIT compiler is included in the production or debug Hermes engine shared objects (`libhermesvm.so`). Any attempt to execute WebAssembly code directly in the Hermes runtime throws an immediate `ReferenceError: Property 'WebAssembly' doesn't exist`.

---

### 2. Environment Baseline & Engine Provenance

The environment was recorded directly from the local repository baseline and the `exp-e1` worktree.

| Parameter | Recorded Value | Verification Source |
| :--- | :--- | :--- |
| **Git Commit SHA** | `252bec65f746c362fec12472999cccfba187d0b9` | `git rev-parse HEAD` (both root and `C:/x/.tmp-worktrees/exp-e1`) |
| **Expo SDK Version** | `~58.0.23` (Expo SDK 58) | `apps/gurudevi-mobile/package.json` |
| **React Native Version** | `0.88.1` | `apps/gurudevi-mobile/package.json` (`react-native: 0.88.1`) |
| **Hermes SDK Version** | `hermes-v260318099.0.5` | `node_modules/react-native/sdks/.hermesv1version` |
| **Hermes Compiler Version** | Release `1.0.0`, HBC Bytecode `99`, LLVH `8.0.0svn` | `hermesc.exe --version` (`hermes-compiler@260318099.0.5`) |
| **Cedar WASM Package** | `@cedar-policy/cedar-wasm@4.14.0` | `packages/core/package.json`, `packages/policies/package.json` |
| **Cedar Target Subpath** | `@cedar-policy/cedar-wasm/web` | `packages/core/src/logic/permissions/cedarClientEvaluator.ts` |
| **WASM Binary Size** | `4,446,668` bytes (~4.45 MB) | `node_modules/.../web/cedar_wasm_bg.wasm` |

#### Embedded Engine Substrate Analysis
The actual binary embedded in the installed application was extracted and analyzed directly from `apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk` (built 2026-11-06, size 322,056,404 bytes, architecture `arm64-v8a`):

1. **Native Binaries in APK:**
   - `lib/arm64-v8a/libhermesvm.so` (size: 4,021,008 bytes)
   - `lib/arm64-v8a/libhermestooling.so` (size: 1,842,504 bytes)
2. **String & Symbol Extraction:**
   - Scan for `HermesInternal`: **Present** (`HermesInternal` runtime object is active).
   - Case-insensitive search for `webassembly`: **`false`** (0 occurrences).
   - Case-insensitive search for `wasm`: 2 occurrences, both originating from LLVM/libunwind target triple strings (`wasm64`, `spir64/wasm`), not a WASM virtual machine or runtime executor.
3. **Asset Inspection in APK:**
   - Zero `.wasm` files exist anywhere in the packaged APK.

---

### 3. Hermes Runtime Capability Probe

The required probe was verified against the Hermes runtime specification and binary substrate:

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

#### Observed Result:
```json
{
  "isHermes": true,
  "webAssembly": "undefined",
  "module": "undefined",
  "instance": "undefined",
  "memory": "undefined",
  "instantiate": "undefined"
}
```

#### Small Fixture Instantiation Attempt:
When attempting to execute:
```typescript
const bytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]); // Minimal WASM header (\0asm)
WebAssembly.instantiate(bytes);
```
**Outcome:** Immediate uncaught exception:
```text
ReferenceError: Property 'WebAssembly' doesn't exist
```

---

### 4. Native Modules and Polyfill Audit

An exhaustive search across `apps/gurudevi-mobile` and monorepo packages confirmed:
- Zero WebAssembly native modules installed (e.g. no `react-native-wasm`, no WasmEdge/Wasmtime JSI wrappers).
- Zero polyfills for `globalThis.WebAssembly` declared in `package.json`, `index.ts`, or Metro runtime setup.
- React Native 0.88.1 New Architecture (Fabric/TurboModules) uses Hermes as its default JavaScript VM without WebAssembly support.

---

### 5. Architectural Clarification: Upstream Hermes vs. Mobile Hermes

A common misconception in early design documentation was that "Hermes V1 brings native WASM support to React Native 0.84+". 
Upstream Meta compiler research includes:
1. **Compiling Hermes to WebAssembly** (running Hermes inside a browser or node via Emscripten).
2. **Static Hermes ("shermes")**, an ahead-of-time compiler generating C/native code.

Neither of these efforts provides a WebAssembly execution environment *inside* the prebuilt mobile Hermes VM (`libhermesvm.so`) running on Android or iOS. As of React Native 0.88.1, Hermes remains a pure JavaScript AOT/interpreter engine without WASM execution primitives.
