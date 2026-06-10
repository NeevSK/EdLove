---
title: "Dependency Alignment and Upgrade Testing Playbook"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [dependencies, upgrades, infra, testing, playbook]
---

# Dependency Alignment & Upgrade Testing Playbook

This document describes the automated tools and manual practices used to manage, align, and test dependency updates (both minor/patch and major) within the Polymath Platform monorepo.

---

## 1. Automated Compatibility Tooling

We use several automated tools to verify that our dependencies are aligned with our runtime environments (Node, React, React Native, and Expo SDK).

### A. Expo Doctor (`expo-doctor`)
The authoritative tool for React Native and Expo version parity.
* **Command**:
  ```bash
  pnpm --filter gurudevi-mobile exec expo-doctor
  ```
* **Purpose**: Compares installed native modules against the official Expo SDK compatibility matrix for the active SDK version. It flags incompatible packages (e.g., mismatching React or Reanimated versions) that would cause compiler or runtime crashes on iOS/Android.

### B. Peer Dependency Auditing (`pnpm peers check`)
* **Command**:
  ```bash
  pnpm peers check
  ```
* **Purpose**: Performs a static analysis of the package graph to identify mismatched peer dependencies (e.g., if a third-party registry library expects React 18 but the monorepo is on React 19).

### C. Syncpack Version Consistency
* **Command**:
  ```bash
  pnpm exec syncpack list-mismatches
  ```
* **Purpose**: Identifies version mismatches of the same dependency across different package.json files in the monorepo, preventing multiple versions of the same library from being bundled.

### D. Taze Node Engine Compatibility
* **Command**:
  ```bash
  pnpm exec taze --nodecompat
  ```
* **Purpose**: Checks whether packages are compatible with the Node.js version declared in your engines configuration.

---

## 2. Testing Upgrades (Manual & Diagnostic Workflow)

When upgrading major dependencies (e.g., Sentry v8, CASL v7, Zod v4), we employ a staged diagnostic process to verify stability before commit:

### Step 1: Execute Upgrades
Write the upgrades to `package.json` and attempt installation:
```bash
# Write major updates to package.json files recursively
pnpm exec taze major -r -w

# Install and resolve dependency graph
pnpm install
```

### Step 2: Compile & Typecheck
TypeScript acts as the first line of defense against breaking API changes:
```bash
pnpm run check-types
```
* **Diagnostic**: Investigate type errors to identify APIs that were removed or changed between major versions.

### Step 3: Run Diagnostics
Run automated tooling checks to flag integration issues:
```bash
pnpm --filter gurudevi-mobile exec expo-doctor
pnpm peers check
```

### Step 4: Run Test Suites
Validate that runtime behaviors are intact:
```bash
pnpm test
pnpm run lint
```

---

## 3. Rollback & Spike Strategies

If the diagnostic gates in Section 2 report critical failures or compiler errors that cannot be easily fixed, we roll back:

### The "Dependency Spike" Workflow
1. **Branch Out**: Always run major upgrades in a separate branch (e.g., `spike/dependency-upgrades`).
2. **Determine Viability**: If the typecheck or test errors are too numerous or require rewrite of core modules, discard the changes.
3. **Revert Changes**:
   ```bash
   # Discard modifications to package.json and pnpm-lock.yaml
   git checkout -- **/package.json pnpm-lock.yaml
   pnpm install
   ```
