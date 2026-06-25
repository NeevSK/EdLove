---
title: "TypeScript 7.0 RC (Project Corsa) Go-Native Migration Guide"
status: "active"
created: 2026-06-25
updated: 2026-06-25
author: "Naveen"
scribe: "Antigravity"
tags: [typescript, infrastructure, migration]
---

# TypeScript 7.0 RC (Project Corsa) Go-Native Migration Guide

This document outlines the migration parameters, execution commands, and architectural decoupling setup for our transition to **TypeScript 7.0 RC (Project Corsa)** using the Go-native multi-threaded engine.

---

## 1. Ambient Types Restoration (`types` Defaulting to `[]`)
TypeScript 7.0 strict default compiler changes enforce that if `"types"` is omitted in a project's `compilerOptions`, it defaults to an empty array `[]` rather than loading ambient global types from `node_modules/@types`. 

To prevent global environments (like Node.js utilities) from failing compilation, the following configurations explicitly declare `"types": ["node"]`:
* [/tsconfig.json (Root)](file:///c:/Users/Naween/projects/polymath-platform/tsconfig.json)
* [/packages/rn-terrain-vscode/tsconfig.json](file:///c:/Users/Naween/projects/polymath-platform/packages/rn-terrain-vscode/tsconfig.json)
* [/packages/types-shim/tsconfig.json](file:///c:/Users/Naween/projects/polymath-platform/packages/types-shim/tsconfig.json)

---

## 2. Decoupled TS v6 Refactoring Engine
TypeScript 7.0 deprecates and drops support for the legacy programmatic JavaScript compiler API. To preserve custom scripts and tools that programmatically transpile/parse AST nodes via `import ts from 'typescript'`, we decoupled them:

1. **Isolated Context:** Created a standalone manifest at [scripts/refactor/package.json](file:///c:/Users/Naween/projects/polymath-platform/scripts/refactor/package.json) pointing to `"typescript": "^6.0.3"`.
2. **Path Redirection:** Updated paths of refactoring scripts (like [packages/trube-art/scripts/generate-approval-artifacts.mjs](file:///c:/Users/Naween/projects/polymath-platform/packages/trube-art/scripts/generate-approval-artifacts.mjs)) to import the compiler explicitly:
   ```javascript
   import ts from '../../../scripts/refactor/node_modules/typescript/lib/typescript.js';
   ```
3. **Automatic Resolution:** Scripts inside `scripts/refactor/` automatically resolve to the v6 engine from the local nested `node_modules`.

---

## 3. Go-Native Multi-Threaded Compilation Acceleration
TypeScript 7.0 introduces native multi-threaded Go checker support. We configured the typecheck validation pipeline across all package package manifests to utilize these flags:

### Optimized Verification Command
```bash
tsc --build --noEmit --checkers 4 --builders 4
```

* `--checkers 4`: Spawns 4 parallel worker checker threads to evaluate package types concurrently.
* `--builders 4`: Spawns 4 worker threads for Turborepo-integrated path/file graph updates.
* `--build`: Required option to run checkers/builders parallel optimizations.

---

## 4. Verification Checklists
When creating or editing packages:
* [ ] Verify that package-level validation commands route through: `tsc --build --noEmit --checkers 4 --builders 4`.
* [ ] Do NOT import `typescript` programmatically in script files unless you use the decoupled `/scripts/refactor/` path mappings.
* [ ] Ensure all local dependency changes are synchronized via `pnpm install --ignore-scripts` to bypass locked system files.
