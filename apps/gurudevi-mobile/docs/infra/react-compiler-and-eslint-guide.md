---
title: "React Compiler and ESLint Guidance"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [eslint, react-compiler, react-19, react-native-0.85, mobile, web, infra]
---

# React Compiler and ESLint Guidance (June 2026 Tech Stack)

This document establishes the developer guidelines for managing **ESLint** and the **React Compiler** under the Polymath Platform's modern tech stack (React 19.2.x, React Native 0.85.x, TypeScript 6.x).

---

## 1. Stack Status Overview (June 2026)

Our platform leverages the following primary configuration standards:
* **React**: `19.2.3` (see [root package.json](file:///c:/Users/Naween/projects/polymath-platform/package.json#L112))
* **React Native**: `~0.85.3` (see [root package.json](file:///c:/Users/Naween/projects/polymath-platform/package.json#L113))
* **ESLint**: `^9.39.4` (utilizing ESLint Flat Configs)
* **TypeScript**: `^6.0.3`

---

## 2. ESLint Configuration

The linting architecture is unified across the workspace via:
* **Root Flat Config**: [eslint.config.js](file:///c:/Users/Naween/projects/polymath-platform/eslint.config.js)
* **Shared Config Package**: [@repo/eslint-config](file:///c:/Users/Naween/projects/polymath-platform/packages/eslint-config/)

### Modern Alignment (No Split Plugins)
During early testing phases, React Compiler diagnostics were provided by a standalone `eslint-plugin-react-compiler` package.
In our June 2026 tech stack, this is **no longer required**:
1. **Absorption**: All compilation diagnostic rules (including checking rules of React, mutations, etc.) have been merged directly into **`eslint-plugin-react-hooks`** (version `^7.1.1` in our [@repo/eslint-config/package.json](file:///c:/Users/Naween/projects/polymath-platform/packages/eslint-config/package.json#L22)).
2. **Setup Simplification**: We avoid maintaining a separate `eslint-plugin-react-compiler` dependency. Our active eslint-plugin configuration handles the necessary diagnostic warnings/errors under the hood.

---

## 3. The React Compiler

The React Compiler is a build-time tool that automatically optimizes components and hooks without requiring manual `useMemo` or `useCallback` invocations.

### How to Run Diagnostics
To test and analyze if local files/components are compatible with compile-time memoization, run:
```bash
npx react-compiler-healthcheck@latest
```

This health check prints a detailed audit of compatibility, flagging:
* Violations of the Rules of React (e.g., mutating props directly).
* Use of unsupported syntax that prevents compiler optimizations.

### Key Developer Guardrails
To ensure the compiler can optimize your React/React Native components successfully:
1. **Strict Immutability**: Never mutate props, state values, or hook return values. Treat them as read-only.
2. **Pure Render Functions**: Avoid side effects inside component rendering cycles. Side effects must reside inside event handlers or `useEffect` blocks.
3. **No Inline Math.random() / Date.now()**: Using these during component renders breaks hydration checks and compiler stability. Our base ESLint rules explicitly prevent this (see [base.js](file:///c:/Users/Naween/projects/polymath-platform/packages/eslint-config/base.js#L38-L50)).
