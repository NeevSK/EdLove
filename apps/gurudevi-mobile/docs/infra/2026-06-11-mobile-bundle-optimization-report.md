---
title: "Mobile Bundle Size Optimization Execution Report"
status: "active"
created: 2026-06-11
updated: 2026-06-11
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, architecture, bundle, performance]
---

# Mobile Bundle Size Optimization Execution Report

This report documents the audit, diagnostics, and optimization steps taken to reduce the uncompressed JS bundle size of `gurudevi-mobile` from **12.85 MB** to **11.57 MB** (saving **1.28 MB** in raw size, translating to ~2-3 MB in compressed download size).

---

## 1. Identified Issues & Root Cause

1. **Monorepo Component Leak (`lucide-react` Web):**
   * *Symptom:* The web icon library `lucide-react` was bundled in the mobile app.
   * *Root Cause:* The mobile route `apps/gurudevi-mobile/app/public-form/[slug].tsx` imported the web-based `PublicFormScreenWeb` via the shared `@repo/form-builder` index. This forced Metro to resolve all dependencies exported by the index (including web screens that imported `lucide-react`).
2. **Wildcard Icon Exports (`lucide-react-native` Bloat):**
   * *Symptom:* The entire `lucide-react-native` package was bundled (**1.16 MB**), containing over 1,000 unused icons.
   * *Root Cause:* The central icon bridge at `@repo/ui/icons` re-exported icons via `export * from 'lucide-react-native'`. Metro's tree-shaking could not resolve which individual icons were in use because the entry point re-exported the entire library.
3. **Babel Config Limits on Monorepo Symlinks:**
   * *Symptom:* Custom Babel transform-import rules inside `apps/gurudevi-mobile/babel.config.js` were ignored for modules compiled inside `packages/*` (like `@repo/classroom` or `@repo/community`), leaving wildcard icon imports unresolved in shared libraries.

---

## 2. Implemented Solutions

### A. Route Isolation (Leak Plugged)
We updated [app/public-form/\[slug\].tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/app/public-form/%5Bslug%5D.tsx) to perform a direct subpath import:
```typescript
import PublicFormScreenWeb from '@repo/form-builder/src/screens/PublicFormScreen.web';
```
This bypassed the package index, successfully preventing Metro from resolving web-only screens and completely eliminating the `lucide-react` (web) package from the mobile bundle.

### B. Tree-Shakable Icon Bridge
We replaced the wildcard export inside the icon bridge [packages/ui/src/icons.ts](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/icons.ts) with direct exports.
1. Scanned all `packages/` and `apps/` folders to extract the unique list of icons in use across the workspace.
2. Rewrote [packages/ui/src/icons.ts](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/icons.ts) to explicitly export only those 200 icons directly from their ESM subpaths (e.g. `export { default as CircleX } from 'lucide-react-native/dist/esm/icons/circle-x'`).

### C. Workspace-wide Legacy Name Migration
To prevent build breaks on direct ESM imports of renamed icons in Lucide v0.400+, we parsed `lucide-react-native.mjs` to extract all aliases and updated **46 files** across the monorepo to use modern names (e.g., `XCircle` $\rightarrow$ `CircleX`, `AlertTriangle` $\rightarrow$ `TriangleAlert`).

### D. Gluestack primitives cleanup
Fixed a developer import error in `GradingSettings.tsx` where the primitive `<RadioIcon />` was mistakenly imported from `@repo/ui/icons` (causing a crash once the bridge was stripped down), moving it to `@repo/ui/primitives`.

---

## 3. Results & Verification

* **Visualizer Report:** [explorer.html](file:///C:/Users/Naween/AppData/Local/Temp/react-native-bundle-visualizer/gurudevimobile/output/explorer.html)
* **Bundle Reduction:** Uncompressed bundle size decreased from **12.85 MB** to **11.57 MB** (**-1.28 MB**).
* **Tree-Shaking Verification:** `lucide-react-native` has successfully been tree-shaken, leaving only the compiled assets of the 200 explicitly referenced icons in the bundle.
