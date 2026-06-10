---
title: "Biome Developer Guide"
status: "active"
created: 2026-04-22
updated: 2026-05-22
author: "Naween"
tags: [reorganized]
---

# Biome Developer Guide

We are transitioning the entire monorepo from ESLint and Prettier to [Biome](https://biomejs.dev/). Biome provides a single tool for linting, formatting, and import organization that is up to 100x faster than traditional tools.

## Getting Started

### VS Code Extension
Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for the best experience.

### Formatting on Save
Update your `.vscode/settings.json` (or user settings) to use Biome as the default formatter:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  }
}
```

## CLI Commands

Commands are available via `pnpm` from the root:

- **Check everything**: `pnpm biome:check` (Lints, formats, and organizes imports)
- **Fix everything**: `pnpm biome:check --write`
- **Only Lint**: `pnpm biome:lint`
- **Only Format**: `pnpm biome:format`

## Configuration

All configuration is managed in the root `biome.json`. We use a single configuration for the entire monorepo to ensure consistency across all packages and apps.

## Key Differences from ESLint

1.  **Speed**: Biome is written in Rust and is significantly faster.
2.  **No Plug-ins**: Biome has built-in support for TypeScript, React, and more. We no longer need separate `@typescript-eslint/eslint-plugin` or `eslint-plugin-react` packages.
3.  **Unified Command**: `biome check` replaces both `eslint` and `prettier`.

## Troubleshooting

If you encounter an issue where Biome isn't picking up a file, ensure it's not excluded in the `vcs.useIgnoreFile` (it respects `.gitignore`) or the `files.ignore` section of `biome.json`.

## Recommended 2026 Enforcement

These are the rules we should continue treating as hard enforcement because they catch real defects or architectural drift:

- `react-hooks/rules-of-hooks`
- `react-hooks/exhaustive-deps`
- `@typescript-eslint/no-floating-promises`
- `import-x/no-cycle`
- `no-restricted-syntax` checks for `Math.random()` and `Date.now()` in render paths
- `no-restricted-syntax` checks for async `Button` handlers
- `local/max-use-state`

These are currently softened or intentionally relaxed for DX, but could be re-tightened if the codebase starts drifting:

- `@typescript-eslint/no-explicit-any`
- `noPropertyAccessFromIndexSignature`

The general rule is simple: if a lint failure prevents a bug or a real production regression, keep it hard. If it mostly forces ceremony or bracket noise without strong safety payoff, keep it soft.
