# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/6/2026, 10:07:18 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; (npx gitleaks detect --source . --verbose || echo 'Gitleaks check skipped or failed')
> **Duration:** 0.6s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 2 |

## Detailed Findings

### Category: General
- + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
- + FullyQualifiedErrorId : InvalidEndOfLine

## Raw Output

```text
At line:1 char:160

+ ...  identity:check; (npx gitleaks detect --source . --verbose || echo 'G ...
+                                                                ~~
The token '||' is not a valid statement separator in this version.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : InvalidEndOfLine
 

```
