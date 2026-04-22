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
