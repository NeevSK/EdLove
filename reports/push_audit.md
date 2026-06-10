# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 6/9/2026, 11:54:04 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && node scripts/surgical-push-check.mjs
> **Duration:** 4.3s
> **Status:** ✅ Passed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| All Categories | 0 Findings |

## Detailed Findings

No high-priority findings identified.

## Raw Output

```text
>>> 🛡️  Surgical Push Sentinel: Auditing affected packages: packages/admin, packages/core, packages/lk-edu-geo, packages/ui

>>> Executing: pnpm exec turbo run check-types --filter=./packages/admin --filter=./packages/core --filter=./packages/lk-edu-geo --filter=./packages/ui --continue --concurrency=1 --only

• turbo 2.9.14


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/admin, @repo/core, @repo/ui
   • Running check-types in 4 packages
   • Remote caching disabled


@repo/core:check-types: cache hit, replaying logs a94f7518543cb08b

@repo/core:check-types: $ pnpm exec tsc --noEmit

@repo/ui:check-types: cache hit, replaying logs 56e5f87d0f596cc9

@repo/ui:check-types: $ node --max-old-space-size=4096 ../../node_modules/typescript/bin/tsc --noEmit

@intuitui-labs/lk-edu-geo:check-types: cache hit, replaying logs 0db52aae4eaf55f5

@intuitui-labs/lk-edu-geo:check-types: $ node --max-old-space-size=4096 ../../node_modules/typescript/bin/tsc --noEmit

@repo/admin:check-types: cache hit, replaying logs 8bd70bf65c4989b5

@repo/admin:check-types: $ pnpm exec tsc --noEmit


 Tasks:    4 successful, 4 total

Cached:    4 cached, 4 total
  Time:    290ms >>> FULL TURBO



✅ Surgical Push Sentinel: Affected packages integrity verified.

```
