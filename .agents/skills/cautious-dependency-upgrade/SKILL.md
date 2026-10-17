---
name: cautious-dependency-upgrade
description: |
  Master engineering playbook for cautious, zero-regression package upgrades across the polymath monorepo.
  Enforces the 4 Dependency Tiers, the Granular-First Temporal Search Ladder, interlocked seam validation,
  and the Deletion Veto. Activate when upgrading packages, auditing dependency drift, resolving package conflicts,
  or diagnosing breaking API changes.
---

# Cautious Dependency Upgrade Skill

> **"Reasoning is the weapon, reality is the ammunition."**  
> In a multi-package monorepo spanning native C++ JSI runtimes, offline-first sync engines, and modern React 19 / Next.js 16 frameworks, package updates are high-risk architectural events. Blind version bumping (`npm update`, `npx expo install --fix`, or automated bot PRs) leads directly to native crashes (`SIGABRT`), Hermes GC memory deadlocks, and silent data loss.

---

## 1. The 4 Architectural Weight Tiers

Every package in the monorepo belongs to an explicit architectural tier with a distinct blast radius:

| Tier | Classification | Core Packages | Blast Radius & Risk | Upgrade Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Critical Native Architecture** (Sacred Native Pins) | `react-native-reanimated@4.7.1`, `react-native-gesture-handler@3.3.0`, `react-native-worklets@0.13.0`, `react-native-mmkv@4.3.2`, `react-native-nitro-modules@0.37.1`, `react-native-skia@^3.3.0`, `typescript@7.0.2` | **CRITICAL (Native C++/JSI)**: Fatal `SIGABRT`, JSI memory corruption, Hermes GC pause loops, thread deadlocks. | **Cautious Upgrade Protocol**: Upstream changelog audit $\rightarrow$ peer matrix check $\rightarrow$ `audit-seams.mjs` $\rightarrow$ RFC sign-off $\rightarrow$ Harmonizer. |
| **Tier 2** | **Framework Runtime Matrix** | `expo@~58.0.12`, `react-native@0.88.0`, `react@19.3.0`, `expo-router@~58.0.22`, +40 Expo SDK modules | **HIGH (Platform Engine)**: Monorepo-wide framework baseline. | Gated on Expo SDK release lifecycle and `pnpm --filter gurudevi-mobile exec expo-doctor`. |
| **Tier 3** | **Database & Contract Schemas** (The Data Spine) | `@zenstackhq/*@3.9.7`, `zod@4.6.5`, `kysely@0.28.16`, `drizzle-orm`, `@powersync/*`, `@orpc/*` | **MODERATE (Domain/Schema)**: ZModel AST, generated ORM contracts, SQL query semantics, sync batch idempotency. | Harmonize cohort $\rightarrow$ `zenstack generate` $\rightarrow$ `tsc --build --noEmit` contract check. |
| **Tier 4** | **Standalone Utilities & Dev Tools** | `lucide-react`, `oxlint`, `vitest`, `date-fns`, `rimraf` | **LOW (Isolated)**: Scoped to toolchain or UI leaf nodes. | Upgraded via `pnpm run deps:upgrade` (preserves Tiers 1–3). |

---

## 2. The Granular-First Temporal Search Ladder

When researching an upgrade, evaluating a breaking change, or diagnosing an unfamiliar compiler/runtime error, NEVER guess from internal LLM training memory. Follow the 3-step ladder:

```
+--------------------------------------------------------------------------------+
| STEP 1: PHYSICAL SUBSTRATE & VELOCITY SURFACES (Day 0 - Ground Truth)          |
| 1. Local disk declaration: node_modules/<pkg>/.../*.d.ts                       |
| 2. Local manifest: node_modules/<pkg>/package.json (peerDependencies, engines)  |
| 3. Upstream Velocity: GitHub Releases tags, commit diffs, npm packument        |
|    - site:github.com/<owner>/<repo>/releases                                   |
|    - site:npmjs.com/package/<package-name>                                     |
+---------------------------------------+----------------------------------------+
                                        | (If migration rationale/RFC needed)
                                        v
+--------------------------------------------------------------------------------+
| STEP 2: DIRECT MONTH + YEAR TEMPORAL ANCHORS (Current Ecosystem Window)        |
| Eliminate stale early drafts and hallucinated legacy tutorials:                |
| - "<package>" ("October 2026" OR "Oct 2026" OR "September 2026") "breaking"   |
| - "<protocol>" ("architecture" OR "spec" OR "RFC") ("Oct 2026" OR "2026-10")   |
+---------------------------------------+----------------------------------------+
                                        | (If unindexed or edge-case)
                                        v
+--------------------------------------------------------------------------------+
| STEP 3: RELAXED TEMPORAL EXPANSION & SENTINEL VERIFICATION                     |
| Widen search scope and verify through monorepo deterministic sentinels:        |
| - node scripts/check-native-slop.mjs                                          |
| - node scripts/audit-version-drift.mjs --fail-on-unannotated                   |
| - node scripts/audit-seams.mjs                                                 |
+--------------------------------------------------------------------------------+
```

---

## 3. The 3 Interlocked System Seams

Dependencies never exist in isolation. Every upgrade must be verified across its corresponding system seam:

### Seam A: The Native C++ / Hermes / Fabric Seam
* **Packages**: `react-native-worklets` $\leftrightarrow$ `react-native-reanimated` $\leftrightarrow$ `react-native-gesture-handler` $\leftrightarrow$ `react-native-nitro-modules` $\leftrightarrow$ `react-native-mmkv`
* **Invariants**:
  - Worklet primitives (`scheduleOnRN`, `runOnUI`, `createWorkletRuntime`) must be imported from `react-native-worklets`, NEVER from `react-native-reanimated`.
  - Gesture recognizers must use `Gesture.Pan()` with `<GestureDetector>`, NEVER legacy `<PanGestureHandler>`.
  - All native layout roots must be protected by `<LayoutLoopSentinel>` to catch micro-layout thrashing loops.
* **Verification**: `node scripts/audit-seams.mjs` + `node scripts/check-native-slop.mjs`.

### Seam B: The Offline Data & Schema Seam
* **Packages**: `PostgreSQL` $\leftrightarrow$ `ZenStack` $\leftrightarrow$ `Kysely` $\leftrightarrow$ `Drizzle ORM` $\leftrightarrow$ `PowerSync` $\leftrightarrow$ `oRPC`
* **Invariants**:
  - Upload batches must use consistent idempotency keys (`powersync:${session.user_id}`).
  - Sync connector uploads must target typed RPC endpoints (`orpcClient.sync.uploadBatch`), never raw `$post` strings.
  - Schema changes must regenerate ORM clients (`zenstack generate`) and preserve strict tenant isolation (`where: { tenantId }`).
* **Verification**: `pnpm --filter @repo/core test SupabasePowerSyncConnector.test.ts` + `pnpm --filter @repo/core exec tsc --build`.

### Seam C: The Framework Runtime Matrix
* **Packages**: `expo` $\leftrightarrow$ `expo-router` $\leftrightarrow$ `react` $\leftrightarrow$ `react-native` $\leftrightarrow$ `next`
* **Invariants**:
  - React 19: `ref` is a standard component prop; `React.forwardRef` is forbidden. Use `useActionState` instead of `useFormState`.
  - React Native 0.88: `findNodeHandle`, `useNativeDriver: false`, and `InteractionManager` are forbidden.
* **Verification**: `pnpm --filter gurudevi-mobile exec expo-doctor` + `node scripts/audit-version-drift.mjs`.

---

## 4. The Deletion Veto in Package Upgrades

When upgrading a package breaks TypeScript compilation or tests, agents and developers are frequently tempted to take shortcuts:
- Deleting "redundant" error handlers or retry policies.
- Dropping offline fallback queues.
- Removing type shims or edge-case handling.

> **THE DELETION VETO**:  
> Working behavior, offline resilience, tests, fallbacks, or routes must **NEVER be silently deleted** during an upgrade. If a breaking API change requires altering runtime behavior, you **MUST halt and request explicit user approval**, presenting:
> 1. Exactly what code/behavior is being changed.
> 2. The technical rationale and upstream changelog proof.
> 3. The potential risks and compatibility trade-offs.

---

## 5. Daily Upgrade Command Center

```bash
# 1. Inspect Outdated Packages & Drift (Preserves Sacred Pins)
pnpm run deps:check

# 2. Upgrade Safe Standalone Minor/Patch Packages (Tier 4)
pnpm run deps:upgrade

# 3. Propagate Canonical Ecosystem Cohort Pins Across All 32 Manifests
node scripts/harmonize-dependencies.mjs --write
pnpm install --lockfile-only

# 4. Verify Monorepo Anti-Slop & New Arch Dialect Gates
node scripts/check-native-slop.mjs
node scripts/audit-version-drift.mjs --fail-on-unannotated --n-major=2

# 5. Audit Cross-Thread Seams & Gesture Recognizers
node scripts/audit-seams.mjs

# 6. Verify Native Mobile Matrix Integrity
pnpm --filter gurudevi-mobile exec expo-doctor

# 7. Monorepo Strict TypeScript Build
pnpm --filter @repo/ui exec tsc --build --noEmit
pnpm --filter @repo/core exec tsc --build
```

---

## 6. Emergency Triage Guide for Upgrade Regressions

| Symptom | Probable Cause | Triage & Fix Step |
| :--- | :--- | :--- |
| Native app crashes on boot (`SIGABRT` / `SIGSEGV`) | Mismatched native C++ ABI between `worklets`, `reanimated`, and `nitro`. | Inspect versions via `pnpm why react-native-worklets`. Ensure exact lock to Tier 1 Sacred Pins. Run `pnpm run deps:harmonize`. |
| `TS2339: Property 'getByTestID' does not exist` | Testing Library RN v14 method casing update. | Change `getByTestID` $\rightarrow$ `getByTestId` (lowercase `d`). |
| `TS2339: Property '...' does not exist on type 'Promise<RenderResult>'` | Vitest React Native `render` signature is now async. | Add `await render(...)` in test. |
| PowerSync upload batch fails or drops changes | Broken idempotency key or unhandled 503 retry. | Check `SupabasePowerSyncConnector.ts`. Ensure `orpcClient.sync.uploadBatch` receives `expectedAccountId` and `idempotencyKey`. |
| Hermes frame drops or UI thread pauses | Inline style recreation in render loop or unvirtualized `.map()`. | Wrap lists in `SovereignVirtualList` / `SanctuaryLegendList` and hoist styles to `StyleSheet.create`. |
