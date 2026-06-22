---
title: "Oxlint and ESLint Hybrid Integration Guide"
status: "active"
created: 2026-06-09
updated: 2026-06-20
author: "Naveen"
scribe: "Antigravity"
tags: [eslint, oxlint, react-native, expo, infra]
---

# Oxlint and ESLint Hybrid Integration Guide

This guide establishes the standard setup and maintenance workflow for our monorepo's high-performance linting and formatting pipeline using **Oxlint**, **ESLint**, and **Biome**.

---

## 1. Pipeline Architecture

To achieve sub-minute linting on 2,000+ files, we run a three-stage pipeline:

```
[ Git Commit / CLI ]
        │
        ▼
1. Oxlint (Fast Pre-pass) ──────► Checks core JS/TS/React logic in 2–5s.
        │
        ▼
2. ESLint (Deep Validation) ────► Runs framework templates (Astro/Svelte) & custom AST rules.
        │                         (Overlapping core rules disabled via eslint-plugin-oxlint)
        ▼
3. Biome (Format-Only) ─────────► Formats code and organizes imports in <1s (Linter disabled).
```

---

## 2. Package & App Configurations

### Root Baseline (`.oxlintrc.json`)
Every package inherits from the root `.oxlintrc.json` baseline, which enables standard correctness and react rules while ignoring build artifacts. **Starting with Oxlint v1.70.0 (Oxlint 1.7), we also enable high-speed native checks for React Compiler rules**:
```json
{
  "env": {
    "browser": true,
    "es2025": true,
    "node": true
  },
  "plugins": ["react", "import"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "pedantic": "off",
    "perf": "warn",
    "style": "off",
    "restriction": "warn",
    "nursery": "off"
  },
  "rules": {
    "react/react-compiler": "error"
  }
}
```

#### React Compiler Rule (`react/react-compiler`)
- **Purpose**: Checks for violations of the Rules of React (e.g., conditional hook execution, mutations in render, reading refs during render).
- **Speed**: Runs natively in Rust, executing the React Compiler's static analysis 5–6x faster than standard JS plugins.
- **Config Option**: Can optionally report bailouts where the compiler decided not to optimize a component.

### Expo App Configurations
To align with Expo's React Native configuration expectations:
1. **Modern Stack Rule Enforcement:** Because legacy configuration presets like `eslint-config-universe/native` depend on unmaintained plugins (`eslint-plugin-react` and `eslint-plugin-node` which crash under ESLint 10 due to removed `context.getFilename()` and `context.getScope()` APIs), we rely directly on modern equivalents:
   - **`@eslint-react/eslint-plugin`** for React / React Native syntax rules.
   - **`eslint-plugin-react-hooks`** for hook validation.
2. **Oxlint Globals:** Since Oxlint does not yet support resolving extends via named NPM packages in JSON configurations, we define the required React Native environment globals (like `__DEV__`, `ErrorUtils`, `alert`) manually inside the mobile app's [.oxlintrc.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/.oxlintrc.json) config:
```json
{
  "extends": ["../../.oxlintrc.json"],
  "globals": {
    "__DEV__": "readonly",
    "ErrorUtils": "readonly",
    "alert": "readonly"
  },
  "rules": {
    "no-console": "warn"
  }
}
```

---

## 3. File Selection & Exclusion

Oxlint handles selection and exclusion via a combination of configuration properties and CLI arguments:

### A. Selection (Targeting Files)
Specify folders or files directly as positional arguments:
```bash
oxlint apps/gurudevi-mobile
```

### B. Exclusion (Ignoring Files)
1. **Config Ignorance:** Add patterns to the `ignorePatterns` array in the root `.oxlintrc.json` to exclude them globally:
   ```json
   "ignorePatterns": [
     "node_modules",
     "dist",
     ".expo",
     ".turbo"
   ]
   ```
2. **CLI Exclusions:** Use the `--ignore-pattern` flag to pass globs dynamically:
   ```bash
   oxlint . --ignore-pattern "**/archives/**"
   ```

---

## 4. Git Hooks & Pre-commit Audit (Husky + lint-staged)

Our commit pipeline prioritizes Oxlint for speed and deprioritizes Biome to only run format checks.

### Pre-commit Configuration (`.lintstagedrc.cjs`)
```javascript
module.exports = {
  '*.{js,ts,tsx}': (files) => {
    const chunkStr = files.map((f) => `"${f}"`).join(' ');
    return [
      `oxlint --fix ${chunkStr}`,
      `eslint --fix ${chunkStr}`,
      `biome check --write --no-errors-on-unmatched ${chunkStr}`
    ];
  },
  '*.json': (files) => {
    const chunkStr = files.map((f) => `"${f}"`).join(' ');
    return [`biome check --write --no-errors-on-unmatched ${chunkStr}`];
  }
};
```
