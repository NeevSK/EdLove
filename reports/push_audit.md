# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 11/16/2026, 11:06:51 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 13.6s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 1 |

## Detailed Findings

### Category: General
- [1m[31m✖[39m   found 1 problems, 0 warnings[22m

## Raw Output

```text
[90m⧗[39m   --- input ---
[1mfix(tests, governance): repair invalid-signature test causal sensitivity and resolve auth parity checker drift

[STAGED CHANGES SUMMARY]
[PKG] core
  M packages/core/src/logic/permissions/__tests__/localEvaluator.native.test.ts

[TOOL] Engineering & Tooling
  M scripts/check-authorization-parity.mjs[22m
[31m✖[39m   header must not be longer than 100 characters, current length is 110 [90m[header-max-length][39m

[1m[31m✖[39m   found 1 problems, 0 warnings[22m
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint


```
