# AMB04_REVISED_ASSESSMENT.md

## AMB-04: Revised Architectural & Security Risk Assessment

### 1. Item Identifier & Context

- **Identifier**: `AMB-04` (Mobile Dynamic Authorization & WASM Execution Risk)
- **Subject**: Feasibility and security implications of on-device Cedar WASM evaluation within the React Native Hermes runtime.
- **Previous Framing / Original Concern**:
  - Does evaluating dynamic Cedar policies via WebAssembly on React Native Hermes cause native engine crashes, memory exhaustion on low-tier mobile devices, or authorization bypass if WASM compilation fails?
  - Does dynamic policy evaluation in offline mode allow an attacker to bypass server-assigned roles by injecting arbitrary local Cedar rules into client-side SQLite?

---

### 2. Revised Risk Level: LOW / NEGLIGIBLE IN PRODUCTION

Based on empirical inspection of the actual embedded engine and application source code, the operational risk of AMB-04 in deployed environments is **LOW / NEGLIGIBLE**, and no privilege escalation is possible.

#### Key Findings Summary:
1. **Engine Incompatibility**: The mobile Hermes runtime (`libhermesvm.so` in React Native 0.88.1 / Expo SDK 58) does not support WebAssembly (`globalThis.WebAssembly` is `undefined`).
2. **Feature-Flag Inactivity**: `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is inactive (`false` / unset) across all build profiles (development, preview, production). The dynamic WASM path is 100% dormant in deployed builds.
3. **Fail-Safe Fallback**: If the flag is forced to `'true'` in a test harness, the `try / catch (wasmError)` boundary catches the missing WebAssembly runtime without crashing the application process and safely reverts to the signed snapshot.
4. **Strict Authorization Upper-Bound**: The dynamic Cedar evaluation is strictly scoped inside `if (!isAllowed) return false;`. It can only restrict an existing server-signed grant; it can **never** elevate privileges beyond the signed snapshot.

---

### 3. Categorized Evidence & Findings

#### A. Observed Device & Substrate Results (Empirical Facts)
1. **Target Artifact**: Direct inspection of `apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk` (built 2026-11-06).
2. **Hermes VM Binary**: `lib/arm64-v8a/libhermesvm.so` (4,021,008 bytes) was extracted and searched:
   - `HermesInternal`: Present.
   - `WebAssembly`: Zero matches (`/webassembly/i` returned `false`).
3. **Asset Table**: Zero `.wasm` files exist in the packaged APK.
4. **WASM Execution Attempt**: Attempting to execute `WebAssembly.instantiate()` in Hermes produces:
   `ReferenceError: Property 'WebAssembly' doesn't exist`.
5. **WASM Package Requirements**: `@cedar-policy/cedar-wasm@4.14.0/web` requires WebAssembly with modern Reference Types (`externref`).

#### B. Source-Level Code Findings
1. **Double-Gate Authorization Architecture** (`packages/core/src/logic/permissions/localEvaluator.native.ts`):
   - **Gate 1**: Validates the cryptographic Ed25519 signature of the `PermissionSnapshot` synced via PowerSync. If the snapshot is missing, expired, tampered with, or explicitly denies the requested action, `localEvaluator.native.ts` immediately returns `false`.
   - **Gate 2**: Dynamic Cedar WASM is only attempted if `isAllowed === true` from Gate 1 AND `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true'`.
2. **Error Containment**:
   - The dynamic evaluation call `evaluateShape2()` is wrapped in a dedicated `try / catch (wasmError)` block.
   - A failure to resolve `@cedar-policy/cedar-wasm/web` or an uncaught engine error logs a diagnostic warning and safely returns the verified Gate 1 snapshot result (`return isAllowed`).
3. **Memory Safeguards**:
   - `localEvaluator.native.ts` enforces `MAX_LOCAL_POLICY_SIZE_BYTES = 100 * 1024` (100 KB). If local policy text exceeds 100 KB, WASM evaluation is skipped to prevent Hermes heap starvation.
4. **Unit Test Verification**:
   - 26 tests in `localEvaluator.native.dynamic.test.ts` and `localEvaluator.native.test.ts` pass cleanly, verifying tamper detection, multi-account isolation, and fail-safe fallback when WASM throws.

#### C. Documented Architectural Assumptions (Historical vs. Reality)
- **Historical Assumption (June 2026)**:
  Documentation in `apps/gurudevi-mobile/docs/decisions/2026-06-10-offline-authorization-and-gating.md` assumed:
  *"Hermes in React Native 0.84+ brings native WebAssembly support, enabling dynamic Cedar policy evaluation offline."*
- **Empirical Reality (November 2026)**:
  React Native 0.88.1 prebuilt Hermes binaries do not ship with WebAssembly support. WebAssembly remains an experimental research branch ("Static Hermes") not included in standard Expo/RN distributions.

#### D. Unresolved Questions & Strategic Trade-offs
1. **Pure Snapshot vs. Native Rust JSI**:
   - The server-signed Ed25519 `PermissionSnapshot` evaluates in $O(1)$ time (< 1ms) with zero WebAssembly overhead, zero JIT compilation, and zero memory spikes on low-end hardware.
   - Does mobile truly require dynamic Shape 2 Cedar evaluation on-device? If complex record-level ReBAC write policies ever become mandatory on mobile without network connectivity, the sanctioned path is a native C++ JSI / Nitro Module binding the official Rust `cedar-policy` crate, not WASM.
2. **Deprecation of `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR`**:
   - Given that the WASM dependency cannot execute on Hermes and `EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR` is inactive across all profiles, should the dynamic WASM code in `localEvaluator.native.ts` and `cedarClientEvaluator.ts` be deprecated in favor of a clean, single-path signed snapshot architecture?

---

### 4. Conclusion & Invariant Status

- **Systemic Invariant Ledger**: Enforced.
- **Production Impact**: None. Deployed application profiles bypass the dormant WASM path and evaluate signed snapshots deterministically.
- **Security Posture**: Uncompromised. Local tampering with SQLite policies cannot grant access beyond server-signed snapshots.
