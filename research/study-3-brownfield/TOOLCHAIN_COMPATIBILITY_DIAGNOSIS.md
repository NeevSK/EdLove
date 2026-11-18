# Toolchain Compatibility Diagnosis: ESLint, SonarJS, and TypeScript 7

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** Pre-commit Linter Toolchain & Quality Gate Sentinel  
**Target:** E1 Promotion Blocker (`TypeError: Cannot read properties of undefined (reading 'Void')`)  
**Status:** DIAGNOSIS COMPLETE — AWAITING HUMAN REVIEW  
**Date:** 2026-11-16  

---

## 1. Executive Summary

During pre-commit execution for E1 promotion, the repository sentinel (`.husky/pre-commit` -> `lint-staged` -> `eslint --fix`) was blocked by the following fatal runtime exception:

```
TypeError: Cannot read properties of undefined (reading 'Void')
    at Object.<anonymous> (C:\x\node_modules\.pnpm\eslint-plugin-sonarjs@4.2.2_e203efacb932a488f7dc215c5405d7fa\node_modules\eslint-plugin-sonarjs\cjs\helpers\type.js:202:59)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.require (node:internal/modules/cjs/loader:1674:12)
    at require (node:internal/modules/helpers:157:16)
    at Object.<anonymous> (C:\x\node_modules\.pnpm\eslint-plugin-sonarjs@4.2.2_e203efacb932a488f7dc215c5405d7fa\node_modules\eslint-plugin-sonarjs\cjs\S1154\rule.js:59:19)
```

This investigation established the precise root cause, the exact execution path, and the reason why this failure manifested during E1 promotion.

### Key Conclusions

1. **Root Cause**: `eslint-plugin-sonarjs@4.2.2`'s `cjs/helpers/type.js:202` executes `typescript_1.default.TypeFlags.Void` at module evaluation time. Under `typescript@7.1.0-beta`, TypeScript has removed its monolithic CJS compiler namespace from the root export `"."`. The root export `"."` only exposes `./lib/version.cjs` (`{ version: '7.1.0-beta', versionMajorMinor: '7.1' }`). Consequently, `typescript_1.default.TypeFlags` is `undefined`, triggering the fatal `TypeError`.
2. **Eager Registration Trap**: `eslint-plugin-sonarjs` constructs its `exports.rules` dictionary as an eager object literal in `cjs/plugin-rules.js`. Line 62 of `plugin-rules.js` maps `'useless-string-operation': index_js_26.rule`. Accessing `index_js_26.rule` triggers `cjs/S1154/index.js`, which requires `cjs/S1154/rule.js`, which requires `cjs/helpers/type.js`. Because this occurs at **plugin module evaluation time**, disabling rule S1154 in ESLint configuration **cannot** prevent the crash.
3. **Environmental Divergence**: The isolated experimental worktree (`.tmp-worktrees/exp-e1`) was branched from baseline commit `252bec65f746c362fec12472999cccfba187d0b9`. That commit lacked the workspace override for SonarJS. Later on Nov 11, commit `f387e054d2d1a3156516eef61b99614caaaf0590` on `integrate/worlds-and-upstream` resolved this exact issue across the monorepo by adding `"eslint-plugin-sonarjs>typescript": "npm:@typescript/typescript6@^6.0.2"` to `pnpm-workspace.yaml`. In checkouts with this override, SonarJS links to `@typescript/typescript6@6.0.2` (TypeScript 6.0.3) and passes.
4. **TypeScript Verification Reassessment**: Direct execution of `tsc --project packages/core/tsconfig.json --noEmit` exits with **code 2** (98 pre-existing errors in `packages/core/src/api/*` present at baseline `252bec65f`). The earlier report of "code 0" was an artifact of shell pipeline output redirection (`2>&1 | Out-File`). Crucially, the permissions subsystem itself (`packages/core/src/logic/permissions/*`) has **0 errors** under TypeScript both before and after E1.

---

## 2. Dependency Resolution Analysis

The monorepo dependency hierarchy and resolution were inspected across `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and physical `node_modules` symlinks.

### 2.1 Package Manifest Declarations

- **`eslint-plugin-sonarjs@4.2.2/package.json`**:
  ```json
  "peerDependencies": {
    "eslint": "^8.0.0 || ^9.0.0 || ^10.0.0"
  },
  "dependencies": {
    "typescript": ">=5 <6.1.0",
    "ts-api-utils": "^2.5.0",
    ...
  }
  ```
  `eslint-plugin-sonarjs` explicitly bounds its supported TypeScript dependency to `<6.1.0`.

- **Root `pnpm-workspace.yaml` (Current `integrate/worlds-and-upstream`)**:
  ```yaml
  overrides:
    "@typescript-eslint/typescript-estree>typescript": "npm:@typescript/typescript6@^6.0.2"
    "@typescript-eslint/parser>typescript": "npm:@typescript/typescript6@^6.0.2"
    "@typescript-eslint/eslint-plugin>typescript": "npm:@typescript/typescript6@^6.0.2"
    "@typescript-eslint/type-utils>typescript": "npm:@typescript/typescript6@^6.0.2"
    "@typescript-eslint/utils>typescript": "npm:@typescript/typescript6@^6.0.2"
    "eslint-plugin-sonarjs>typescript": "npm:@typescript/typescript6@^6.0.2"
    "typescript-eslint>typescript": "npm:@typescript/typescript6@^6.0.2"
    ...
    typescript: '7.1.0-beta'
  ```

### 2.2 Physical `node_modules` Layout Comparison

| Location | `eslint-plugin-sonarjs` Symlink Target for `typescript` | Resolved TS Version | `TypeFlags` Present? | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Checkout (`C:\x`)** | `..\..\@typescript+typescript6@6.0.2\node_modules\@typescript\typescript6` | 6.0.3 | **Yes** (`TypeFlags.Void = 16384`) | **Passes** |
| **E1 Worktree (`.tmp-worktrees/exp-e1`)** | `..\..\typescript@7.1.0-beta\node_modules\typescript` | 7.1.0-beta | **No** (`undefined`) | **CRASHES** |

---

## 3. Detailed Failure Mechanism

### 3.1 Source of the Crash

In `node_modules/eslint-plugin-sonarjs/cjs/helpers/type.js`:
```javascript
// Line 44:
const typescript_1 = __importDefault(require("typescript"));

// Line 202:
const NOTHING_TYPE_FLAGS = typescript_1.default.TypeFlags.Void | typescript_1.default.TypeFlags.Undefined | typescript_1.default.TypeFlags.Null;
```

In `typescript@7.1.0-beta/package.json`:
```json
"exports": {
    "./package.json": "./package.json",
    ".": "./lib/version.cjs",
    "./vscode": "./dist/vscode/extensionApi.js",
    "./sync": "./dist/api/sync/api.js",
    "./async": "./dist/api/async/api.js",
    "./fs": "./dist/api/fs.js",
    "./path": "./dist/api/typedPaths.js",
    "./proto": "./dist/api/proto.js",
    "./ast": "./dist/ast/index.js",
    "./ast/is": "./dist/ast/is.js",
    "./ast/factory": "./dist/ast/factory.generated.js",
    "./ast/utils": "./dist/ast/utils.js",
    "./ast/scanner": "./dist/ast/scanner.js",
    "./ast/visitor": "./dist/ast/visitor.js",
    "./ast/clone": "./dist/ast/clone.js"
}
```

In `typescript@7.1.0-beta/lib/version.cjs`:
```javascript
const { version } = require("../package.json");
exports.version = version;
exports.versionMajorMinor = "7.1";
```

Because TypeScript 7 modularized its internal compiler architecture, `require("typescript")` returns only `{ version: '7.1.0-beta', versionMajorMinor: '7.1' }`. The classic compiler namespace (`TypeFlags`, `SyntaxKind`, `createProgram`) is not exported on root. Thus `typescript_1.default.TypeFlags` evaluates to `undefined`.

### 3.2 Execution Trace

```
1. ESLint initialises with configuration (@repo/eslint-config/base)
2. base.js imports 'eslint-plugin-sonarjs'
3. plugin.js requires './plugin-rules.js'
4. plugin-rules.js evaluates:
   exports.rules = {
     'useless-string-operation': index_js_26.rule,  <-- Eager property evaluation
     ...
   };
5. index_js_26 (./S1154/index.js) getter fires:
   Object.defineProperty(exports, "rule", { get: () => rule_js_1.rule });
6. rule_js_1 (./S1154/rule.js) is required
7. rule.js line 59 requires '../helpers/type.js'
8. type.js line 202 evaluates NOTHING_TYPE_FLAGS
9. TypeError thrown: Cannot read properties of undefined (reading 'Void')
```

---

## 4. Empirical Evaluation of Hypotheses

### Hypothesis 1: Rule S1154 is the only rule accessing this undefined property
- **Finding**: **False**.
- **Evidence**: Static AST scanning revealed **48 rules** in `eslint-plugin-sonarjs` that directly import `helpers/type.js` (including `S1301`, `S1488`, `S1529`, `S1848`, `S2201`, `S2234`, `S2259`, `S2301`, `S2692`, etc.).

### Hypothesis 2: Disabling S1154 in ESLint configuration avoids the crash
- **Finding**: **False**.
- **Evidence**: Tested empirically via `node -e "const p = '.../exp-e1/node_modules/eslint-plugin-sonarjs'; require(p);"`.
- The crash occurs on `require(p)` before ESLint ever checks rule configuration. Eager initialization in `plugin-rules.js` unconditionally triggers rule evaluation.

---

## 5. TypeScript Verification Reassessment

The promotion review noted:
> "Build exited with code 0 (all errors in packages/core/src/api/*, zero in permissions subsystem)"

We reassessed this directly against the physical toolchain:

1. **Direct Compilation Exit Code**:
   Running `pnpm exec tsc --project packages/core/tsconfig.json --noEmit` directly yields:
   - **True Exit Code**: **`2`**
   - **Error Count**: 98 errors at baseline `252bec65f`, 100 errors on current integration branch.
2. **Location of Errors**:
   - `packages/core/src/api/*`: 98 errors (retired pre-v1 API handlers being phased out per `docs/architecture/road-to-v1.md`).
   - `packages/core/src/adapters/powersync/v1Connector.adapter.ts`: 2 errors (unrelated WIP on integration branch).
   - `packages/core/src/logic/permissions/*`: **0 errors**.
3. **Impact of E1**:
   - `signature.ts` compiles with **0 errors**.
   - E1 introduces zero new type errors and modifies zero contracts.
   - The reported exit code 0 was caused by shell pipeline masking (`cmd 2>&1 | Out-File`), where PowerShell captures the exit status of `Out-File` (0) rather than the preceding command in the pipe.

---

## 6. Candidate Corrections & Trade-off Evaluation

| Candidate | Description | Feasibility | Scope | Sustainability | Guardrail Compliance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A: Pnpm Override (TypeScript 6 Alias)** | Add `"eslint-plugin-sonarjs>typescript": "npm:@typescript/typescript6@^6.0.2"` | **100%** | Single line in `pnpm-workspace.yaml` | High (already in lockfile) | **Full** (Standard monorepo pattern) |
| **B: Upgrade SonarJS** | Upgrade to a TS 7-compatible SonarJS version | **0%** | N/A | None (no such release exists) | Non-compliant (arbitrary upgrade) |
| **C: Disable S1154** | Disable `'sonarjs/useless-string-operation'` in `eslint.config.js` | **0%** | Config | Ineffective (crashes at module load) | Ineffective |
| **D: Patch SonarJS** | Patch `helpers/type.js` via `pnpm patch` | 40% | `patches/` | Fragile (TS 7 has no typechecker API) | High maintenance burden |
| **E: `--no-verify` Bypass** | Bypass pre-commit hook during commit | 100% | Single commit | Zero (leaves hook broken for future commits) | Violates verification gate without sign-off |

---

## 7. Recommendation

### Primary Recommendation: Apply Upstream Tooling Override (Candidate A)

Commit `f387e054d2d1a3156516eef61b99614caaaf0590` on `integrate/worlds-and-upstream` already authored the canonical fix:
```yaml
overrides:
  "eslint-plugin-sonarjs>typescript": "npm:@typescript/typescript6@^6.0.2"
```

In the primary checkout `C:\x`, this override is already present in `pnpm-workspace.yaml`. The pre-commit hook failure was encountered because the test/commit was attempted in `.tmp-worktrees/exp-e1`, which lacked this commit.

Once `signature.ts` is committed in `C:\x` where `eslint-plugin-sonarjs` resolves to `@typescript/typescript6@6.0.2`, the ESLint pre-commit check passes cleanly.
