# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 11/12/2026, 6:13:21 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 2.2s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 1 |

## Detailed Findings

### Category: General
- ✖   found 2 problems, 0 warnings

## Raw Output

```text
⧗   --- input ---
tooling(tiers): place every core file by name, mark the pre-v1 client retired, re-baseline the ratchet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EL3j4jpLgKYV4bXw7m6H2j
✖   header must not be longer than 100 characters, current length is 102 [header-max-length]
✖   type must be one of [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test] [type-enum]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint


```
