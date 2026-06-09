# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 6/9/2026, 8:26:57 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && node scripts/surgical-push-check.mjs
> **Duration:** 4.9s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| All Categories | 0 Findings |

## Detailed Findings

No high-priority findings identified.

## Raw Output

```text
>>> 🛡️  Surgical Push Sentinel: Auditing affected packages: apps/gurudevi-mobile, packages/community, packages/core, packages/eslint-config, packages/platform-mcp, packages/rn-terrain-cli, packages/rn-terrain-core, packages/rn-terrain-mcp, packages/rn-terrain-vscode

>>> Executing: pnpm exec turbo run lint check-types --filter=apps/gurudevi-mobile --filter=packages/community --filter=packages/core --filter=packages/eslint-config --filter=packages/platform-mcp --filter=packages/rn-terrain-cli --filter=packages/rn-terrain-core --filter=packages/rn-terrain-mcp --filter=packages/rn-terrain-vscode --continue

• turbo 2.9.14

  x No package found with name 'apps/gurudevi-mobile' in workspace



❌ Surgical Push Sentinel: Impurities detected in affected packages.

```
