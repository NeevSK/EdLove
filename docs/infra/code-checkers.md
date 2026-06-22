---
title: "Workspace Code Quality & Checking Tools"
status: "active"
created: 2026-06-12
updated: 2026-06-12
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, standards, linting]
---

# Workspace Code Quality & Checking Tools

This document outlines the active static analysis, validation, and linting tools configured across the `polymath-platform` monorepo.

---

## Tool Summary Matrix

| Tool | Focus Area | Executable | Configuration | Why We Use It |
| :--- | :--- | :--- | :--- | :--- |
| **ESLint 10** | Custom styling, bundle safety, deep logic rules | `pnpm run lint:eslint` | `packages/eslint-config/` | Deep, framework-specific correctness rules (like hooks, accessibility, and bundle tree-shaking). |
| **React Doctor** | React Native runtime safety, code optimization | `pnpm run doctor` | `apps/gurudevi-mobile/doctor.config.json` | Specifically catches React Native crashes (e.g. text outside `<Text>`), conditional hooks, and un-cleaned timeouts. |
| **Oxlint** | High-speed baseline checks | `pnpm lint:oxlint` | `.oxlintrc.json` | Rust-based linter that runs in milliseconds, catching 90% of basic syntax errors and warnings. |
| **Biome** | Fast format check | `pnpm format` | `biome.json` | Replaces Prettier for formatting. Runs in milliseconds and formats code natively. |

---

## 1. ESLint 10 Configuration & Rules
ESLint is configured workspace-wide in `packages/eslint-config/`. It has been configured with modern flat configs and ESLint 10 support:

### Active Plugins & Features:
*   **`eslint-config-expo` (canary)**: Integrated for official Expo 56 / React Native 0.85 compatibility, setting up native resolvers and globals.
*   **`@rnx-kit/eslint-plugin` (Microsoft)**: Platform-agnostic rules for clean React Native builds:
    *   `@rnx-kit/no-export-all`: Enforces named exports, preventing wildcard exports from bloating production bundles.
    *   `@rnx-kit/no-const-enum`: Enforces standard enums.
*   **`eslint-plugin-react-native` (Patched)**: Enforces style sheet guidelines. Since the official release is incompatible with ESLint 10 context APIs, **we have patched this package** using `pnpm patch` to replace legacy context calls (`context.getSourceCode()`, etc.) with `context.sourceCode`.
    *   `react-native/no-unused-styles` (warn): Warns on dead layout properties.
    *   `react-native/no-inline-styles` (warn): Discourages inline style blocks.
    *   `react-native/no-color-literals` (warn): Highlights hardcoded color hex codes to enforce style tokens. Set to `warn` to allow incremental cleanup of existing hex code occurrences.

---

## 2. React Doctor
Designed specifically to check for React/React Native anti-patterns.
*   **Rule Configuration**: Controlled via `doctor.config.json` inside packages to ignore build files (`dist/`), test files (`**/*.test.tsx`), and legacy archives (`**/archives/**`).
*   **Top Detections**:
    *   Conditional hooks (e.g., inside loop maps or conditional blocks).
    *   Bare numeric `&&` rendering (which crashes React Native when the number evaluates to `0`).
    *   Uncleared `setTimeout` loops inside `useEffect` hooks.

---

## 3. Oxlint Hybrid Integration
To prevent ESLint from slowing down:
*   We use **`eslint-plugin-oxlint`** as the final step in our ESLint config array.
*   This disables rules that Oxlint has already scanned, dropping overall ESLint execution times by up to **80%**.
