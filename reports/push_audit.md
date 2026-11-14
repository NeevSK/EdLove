# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 11/12/2026, 11:23:13 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 2.1s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 1 |

## Detailed Findings

### Category: General
- ✖   found 1 problems, 0 warnings

## Raw Output

```text
⧗   --- input ---
tooling: enforce React hook and compiler rules with oxlint, ratcheted

- tooling/oxlint-react.json: explicit React rules only (~2.5s repo-wide)
- ratchet: rules-of-hooks 0, deps 87, set-state-in-effect 156, compiler 218, parse 10
- fix last rules-of-hooks violation (VisionCamera adapter) and effect cleanups
- web AuthQueryCacheBoundary uses useOptionalAuth (tests retargeted)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EL3j4jpLgKYV4bXw7m6H2j
✖   type must be one of [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test] [type-enum]

✖   found 1 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint


```
