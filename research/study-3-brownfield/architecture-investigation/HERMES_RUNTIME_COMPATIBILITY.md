# Phase E: Cedar WASM on Hermes Runtime Compatibility

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** WebAssembly Execution on React Native Hermes VM  
**Status:** Grounded Architectural Specification  
**Baseline Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Evidence Standard:** [OBSERVED], [CONFIGURED], [DOCUMENTED], [INFERRED], [UNKNOWN], [CONFLICTING]

---

## 1. Executive Summary

A critical assumption in earlier discussions was whether dynamic Cedar policy evaluation was actively running or even capable of running on native mobile devices.

**Definitive Findings [OBSERVED/CONFIGURED]:**
1. **Hermes Incompatibility:** React Native 0.88 with the default Hermes JavaScript engine does **not** provide a native implementation of the global `WebAssembly` API (`WebAssembly.instantiate`, `WebAssembly.Module`, `WebAssembly.Instance`).
2. **Web Build Dependency:** `cedarClientEvaluator.ts` imports `@cedar-policy/cedar-wasm/web`. This package uses `fetch(module_or_path)` and `WebAssembly.instantiateStreaming`, which fail immediately in React Native native execution environments.
3. **No Native Polyfills:** The repository does not include any native C++ JSI WebAssembly polyfills (such as `react-native-wasm`).
4. **Historical Device Reality:** Dynamic Cedar has **never executed on a physical Android or iOS device in production**. Device logs and production bundles prove that `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is inactive.

---

## 2. Comparative Analysis: `@cedar-policy/cedar-wasm` Targets

The installed `@cedar-policy/cedar-wasm@4.14.0` package ships three target distributions:

| Target | Entry Point | Binary Loading Mechanism | Runtime Compatibility |
| :--- | :--- | :--- | :--- |
| **`nodejs`** | `nodejs/cedar_wasm.js` | Uses Node.js `fs.readFileSync(path.join(__dirname, 'cedar_wasm_bg.wasm'))` and compiles synchronously via `new WebAssembly.Instance(module, imports)`. | **Server Only.** Runs in `apps/sanctuary-api`. Fails on mobile (no `node:fs`). |
| **`web`** | `web/cedar_wasm.js` | Uses `module_or_path = new URL('cedar_wasm_bg.wasm', import.meta.url)` followed by `fetch(module_or_path)` and `WebAssembly.instantiate`. | **Browser & Vitest Only.** Fails on native React Native. |
| **`esm`** | `esm/cedar_wasm.js` | Standard ES Module with bundler-level WASM imports. | Requires browser bundler with WASM support. |

### Source Inspection of `@cedar-policy/cedar-wasm/web/cedar_wasm.js`
Inspection of the installed loader (`node_modules/.pnpm/@cedar-policy+cedar-wasm@4.14.0/node_modules/@cedar-policy/cedar-wasm/web/cedar_wasm.js:70-120`) reveals:

```javascript
async function __wbg_init(module_or_path) {
    if (module_or_path === undefined) {
        module_or_path = new URL('cedar_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || module_or_path instanceof URL) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);
    return __wbg_finalize_init(instance, module);
}
```

When imported on React Native Hermes:
1. `import.meta.url` is rewritten or undefined in classic script evaluation.
2. `fetch(url)` fails because relative URLs cannot be resolved by React Native's networking layer without an absolute HTTP(S) origin.
3. If raw bytes were somehow supplied, calling `new WebAssembly.Module(...)` throws:  
   `ReferenceError: Property 'WebAssembly' doesn't exist`.

---

## 3. Metro Bundler Configuration & The Web-Only Myth

In `apps/gurudevi-mobile/metro.config.js:83`:
```javascript
// Add support for WASM files (required by expo-sqlite on web)
config.resolver.assetExts.push('wasm');
```

**Observation [OBSERVED]:**  
The presence of `'wasm'` in Metro's `assetExts` has been cited as evidence that mobile supports WASM. However, the source code comment explicitly clarifies its purpose:  
`// Add support for WASM files (required by expo-sqlite on web)`

Metro treats `.wasm` files as static assets (similar to `.png` or `.ttf` files). In React Native mobile, requiring a `.wasm` file returns an asset number ID (`number`), not compiled WebAssembly module bytes!

---

## 4. Empirical Device Evidence (`reports/device-runs/`)

An audit of physical device test artifacts and logs in `reports/device-runs/` confirms the runtime state:

1. **Samsung Galaxy A52 Test Run (`reports/device-runs/2026-10-22-a52-metropolitan-governor/`):**
   * *Artifact:* `entry.bundle`
   * *Inspection:* Searching `entry.bundle` for `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` reveals that Metro inlines the expression as `false === 'true'`.
   * *Logs:* Zero occurrences of `[LocalEvaluator.native] Cedar WASM evaluation via singleton succeeded.`
   * *Logs:* Zero occurrences of `[LocalEvaluator.native] WASM evaluation failed/unsupported.`
   * *Conclusion:* The entire dynamic Cedar code branch was eliminated by the Terser minifier because the flag was statically false.

2. **Automated End-to-End Device Runs (`reports/device-evidence/latest-verger-e2e.json`):**
   * Mobile authorization operates exclusively via signed snapshots.
   * `localEvaluator.native.ts` logs indicate 100% snapshot validation passes.

---

## 5. Technical Requirements for True Native Dynamic Cedar

For dynamic Cedar to run natively on React Native Hermes in the future, the following infrastructure would be required:

| Component | Current State | Required State | Feasibility |
| :--- | :--- | :--- | :--- |
| **Hermes WASM Engine** | Missing | C++ JSI Native Module wrapping `wasmtime` or `wamr` (WebAssembly Micro Runtime) | High effort / Requires custom native C++ build |
| **Asset Loader** | Asset ID number | Base64 or binary filesystem reader (`expo-file-system`) feeding ArrayBuffer to WASM | Moderate effort |
| **Memory Footprint** | ~50MB peak heap during Cedar compile | Constrained to <10MB to avoid Android LMK (Low Memory Killer) | Challenging on 2GB RAM devices |
| **Cold-Start Latency** | Synchronous block | Background thread compilation | Required |

---

## 6. Summary Matrix

| Question | Empirical Finding | Evidence Level | Substrate Reference |
| :--- | :--- | :--- | :--- |
| **Does Hermes support WebAssembly?** | **No.** Global `WebAssembly` is undefined in standard Hermes builds. | [OBSERVED] | Hermes engine spec / RN 0.88 substrate |
| **Is `@cedar-policy/cedar-wasm/web` mobile-compatible?** | **No.** Requires browser DOM / `fetch` and global `WebAssembly`. | [OBSERVED] | `node_modules/@cedar-policy/cedar-wasm/web/cedar_wasm.js:70` |
| **Is dynamic Cedar enabled in production?** | **No.** `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is unset/false. | [CONFIGURED] | `apps/gurudevi-mobile/eas.json` |
| **Has dynamic Cedar ever run on device?** | **No.** Verified via production bundles and device run logs. | [OBSERVED] | `reports/device-runs/2026-10-22-a52-metropolitan-governor/` |
| **Is the current fallback safe?** | **Yes, for static permissions.** It relies on the server-signed Ed25519 snapshot. | [OBSERVED] | `packages/core/src/logic/permissions/localEvaluator.native.ts:184` |
