# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 10/24/2026, 8:21:32 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 2.2s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 2 |

## Detailed Findings

### Category: General
- + FullyQualifiedErrorId : CommandNotFoundException
- + FullyQualifiedErrorId : CommandNotFoundException

## Raw Output

```text
mise : The term 'mise' is not recognized as the name of a cmdlet, function, script file, or operable program. Check 
the spelling of the name, or if a path was included, verify that the path is correct and try again.

At C:\Users\Naween\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1:2 char:20
+ Invoke-Expression (mise activate pwsh | Out-String)
+                    ~~~~
    + CategoryInfo          : ObjectNotFound: (mise:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
 

pnpm : The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check 
the spelling of the name, or if a path was included, verify that the path is correct and try again.

At line:1 char:1
+ pnpm exec commitlint --from=HEAD~1 --to=HEAD
+ ~~~~
    + CategoryInfo          : ObjectNotFound: (pnpm:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
 

```
