# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 2026-04-29 09:40:52
> **Command:** pnpm turbo run check-types

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 10 |

## Detailed Findings

### Category: General
- apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
- apps-neevsk-web:check-types: - 0 errors
- apps-neevsk-web:check-types: - 0 warnings
- apps-edlove-web:check-types: - 0 errors
- apps-edlove-web:check-types: - 0 warnings
- apps-intuitui-web:check-types: - 0 errors
- apps-intuitui-web:check-types: - 0 warnings
- @repo/analytics:check-types: ../graphics/src/data/PostalCodes.ts(2,27): error TS7016: Could not find a declaration file for module 'srilankan-postalcode-backend'. 'C:/Users/Naween/projects/polymath-platform/node_modules/.pnpm/srilankan-postalcode-backend@1.0.0/node_modules/srilankan-postalcode-backend/index.js' implicitly has an 'any' type.
-  ERROR  @repo/analytics#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\analytics) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)
-  ERROR  run failed: command  exited (2)


## Raw Output
```text
• turbo 2.9.4

   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 28 packages
   • Remote caching disabled

apps-neevsk-web:check-types: cache hit, replaying logs 32ae9dd3327b5948
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: >>> Starting Audit: 04/29/2026 09:05:04
apps-neevsk-web:check-types: >>> Command: pnpm exec astro check
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: [2m09:05:21[22m [34m[content][39m Syncing content
apps-neevsk-web:check-types: [2m09:05:21[22m [34m[content][39m Content config changed
apps-neevsk-web:check-types: [2m09:05:21[22m [34m[content][39m Clearing content store
apps-neevsk-web:check-types: [2m09:05:21[22m [34m[content][39m Synced content
apps-neevsk-web:check-types: [2m09:05:21[22m [34m[types][39m Generated [2m3.65s[22m
apps-neevsk-web:check-types: [2m09:05:21[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\neevsk-web...
apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m41[0m     link: z.string().url().optional(),
apps-neevsk-web:check-types: [7m  [0m [93m                     ~~~[0m
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: Result (44 files): 
apps-neevsk-web:check-types: - 0 errors
apps-neevsk-web:check-types: - 0 warnings
apps-neevsk-web:check-types: - 1 hint
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: AUDIT SUMMARY
apps-neevsk-web:check-types: Duration: 0m 40s
apps-neevsk-web:check-types: Findings: 3
apps-neevsk-web:check-types: Log File: reports/check-types.txt
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: cache hit, replaying logs c93e84a2fecd605c
apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-edlove-web:check-types: 
apps-edlove-web:check-types: >>> Starting Audit: 04/29/2026 09:00:39
apps-edlove-web:check-types: >>> Command: pnpm exec astro check
apps-edlove-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: [2m09:00:50[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-edlove-web:check-types: [2m09:00:56[22m [34m[content][39m Syncing content
apps-edlove-web:check-types: [2m09:00:56[22m [34m[content][39m Synced content
apps-edlove-web:check-types: [2m09:00:56[22m [34m[types][39m Generated [2m5.48s[22m
apps-edlove-web:check-types: [2m09:00:56[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\edlove-web...
apps-edlove-web:check-types: Result (41 files): 
apps-edlove-web:check-types: - 0 errors
apps-edlove-web:check-types: - 0 warnings
apps-edlove-web:check-types: - 0 hints
apps-edlove-web:check-types: 
apps-edlove-web:check-types: 
apps-edlove-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: AUDIT SUMMARY
apps-edlove-web:check-types: Duration: 0m 35s
apps-edlove-web:check-types: Findings: 2
apps-edlove-web:check-types: Log File: reports/check-types.txt
apps-edlove-web:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: cache hit, replaying logs a7e1ea1b28a45c4f
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: >>> Starting Audit: 04/28/2026 13:13:32
apps-intuitui-web:check-types: >>> Command: pnpm exec astro check
apps-intuitui-web:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: [2m13:13:41[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-intuitui-web:check-types: [2m13:13:44[22m [34m[types][39m Generated [2m3.44s[22m
apps-intuitui-web:check-types: [2m13:13:44[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\intuitui-web...
apps-intuitui-web:check-types: Result (14 files): 
apps-intuitui-web:check-types: - 0 errors
apps-intuitui-web:check-types: - 0 warnings
apps-intuitui-web:check-types: - 0 hints
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: AUDIT SUMMARY
apps-intuitui-web:check-types: Duration: 0m 24s
apps-intuitui-web:check-types: Findings: 2
apps-intuitui-web:check-types: Log File: reports/check-types.txt
apps-intuitui-web:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: cache hit, replaying logs 6fbab4aa06d5e667
@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/core:check-types: 
@repo/core:check-types: >>> Starting Audit: 04/29/2026 09:00:39
@repo/core:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: 
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: AUDIT SUMMARY
@repo/core:check-types: Duration: 0m 30s
@repo/core:check-types: Findings: 0
@repo/core:check-types: Log File: reports/check-types.txt
@repo/core:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types: cache hit, replaying logs a0d7fd1774d5c37f
@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: >>> Starting Audit: 04/29/2026 09:01:11
@intuitui-labs/lk-edu-geo:check-types: >>> Command: pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types: AUDIT SUMMARY
@intuitui-labs/lk-edu-geo:check-types: Duration: 0m 14s
@intuitui-labs/lk-edu-geo:check-types: Findings: 0
@intuitui-labs/lk-edu-geo:check-types: Log File: reports/check-types.txt
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: cache hit, replaying logs f6509d837fb7a139
@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/database:check-types: 
@repo/database:check-types: >>> Starting Audit: 04/29/2026 09:01:11
@repo/database:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/database:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: 
@repo/database:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: AUDIT SUMMARY
@repo/database:check-types: Duration: 0m 7s
@repo/database:check-types: Findings: 0
@repo/database:check-types: Log File: reports/check-types.txt
@repo/database:check-types: --------------------------------------------------------------------------------
@repo/ui:check-types: cache hit, replaying logs 84038d729dc391b3
@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm run typecheck
@repo/ui:check-types: 
@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 typecheck C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/ui:check-types: 
@repo/ui:check-types: >>> Starting Audit: 04/29/2026 09:01:12
@repo/ui:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/ui:check-types: --------------------------------------------------------------------------------
@repo/ui:check-types: 
@repo/ui:check-types: --------------------------------------------------------------------------------
@repo/ui:check-types: AUDIT SUMMARY
@repo/ui:check-types: Duration: 0m 39s
@repo/ui:check-types: Findings: 0
@repo/ui:check-types: Log File: reports/check-types.txt
@repo/ui:check-types: --------------------------------------------------------------------------------
@repo/accounting:check-types: cache hit, replaying logs ae9d26cd3d956ecd
@repo/accounting:check-types: 
@repo/accounting:check-types: > @repo/accounting@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/accounting:check-types: 
@repo/accounting:check-types: >>> Starting Audit: 04/29/2026 09:01:11
@repo/accounting:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/accounting:check-types: --------------------------------------------------------------------------------
@repo/accounting:check-types: 
@repo/accounting:check-types: --------------------------------------------------------------------------------
@repo/accounting:check-types: AUDIT SUMMARY
@repo/accounting:check-types: Duration: 0m 25s
@repo/accounting:check-types: Findings: 0
@repo/accounting:check-types: Log File: reports/check-types.txt
@repo/accounting:check-types: --------------------------------------------------------------------------------
@repo/ai:check-types: cache hit, replaying logs f4f291b0d34ba2ee
@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > pnpm run typecheck
@repo/ai:check-types: 
@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@0.0.1 typecheck C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/ai:check-types: 
@repo/ai:check-types: >>> Starting Audit: 04/29/2026 09:05:05
@repo/ai:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/ai:check-types: --------------------------------------------------------------------------------
@repo/ai:check-types: 
@repo/ai:check-types: --------------------------------------------------------------------------------
@repo/ai:check-types: AUDIT SUMMARY
@repo/ai:check-types: Duration: 0m 41s
@repo/ai:check-types: Findings: 0
@repo/ai:check-types: Log File: reports/check-types.txt
@repo/ai:check-types: --------------------------------------------------------------------------------
@repo/scanner-kit:check-types: cache hit, replaying logs 7932157766a40376
@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: > @repo/scanner-kit@0.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\scanner-kit
@repo/scanner-kit:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: >>> Starting Audit: 04/29/2026 09:05:04
@repo/scanner-kit:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/scanner-kit:check-types: --------------------------------------------------------------------------------
@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: --------------------------------------------------------------------------------
@repo/scanner-kit:check-types: AUDIT SUMMARY
@repo/scanner-kit:check-types: Duration: 0m 43s
@repo/scanner-kit:check-types: Findings: 0
@repo/scanner-kit:check-types: Log File: reports/check-types.txt
@repo/scanner-kit:check-types: --------------------------------------------------------------------------------
@repo/people:check-types: cache hit, replaying logs 6813339313154b44
@repo/people:check-types: 
@repo/people:check-types: > @repo/people@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/workforce:check-types: cache hit, replaying logs 3e5878b6c15716b9
@repo/people:check-types: 
@repo/people:check-types: >>> Starting Audit: 04/29/2026 09:01:55
@repo/people:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/people:check-types: --------------------------------------------------------------------------------
@repo/people:check-types: 
@repo/people:check-types: --------------------------------------------------------------------------------
@repo/people:check-types: AUDIT SUMMARY
@repo/people:check-types: Duration: 0m 55s
@repo/people:check-types: Findings: 0
@repo/people:check-types: Log File: reports/check-types.txt
@repo/people:check-types: --------------------------------------------------------------------------------
@repo/workforce:check-types: 
@repo/workforce:check-types: > @repo/workforce@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/workforce:check-types: 
@repo/workforce:check-types: >>> Starting Audit: 04/29/2026 09:01:55
@repo/workforce:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/workforce:check-types: --------------------------------------------------------------------------------
@repo/workforce:check-types: 
@repo/graphics:check-types: cache miss, executing 3f89783c81c0bd0d
@repo/workforce:check-types: --------------------------------------------------------------------------------
@repo/workforce:check-types: AUDIT SUMMARY
@repo/workforce:check-types: Duration: 0m 42s
@repo/workforce:check-types: Findings: 0
@repo/workforce:check-types: Log File: reports/check-types.txt
@repo/workforce:check-types: --------------------------------------------------------------------------------
@repo/payments:check-types: cache hit, replaying logs ebec55b9d75b7771
@repo/payments:check-types: 
@repo/payments:check-types: > @repo/payments@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/payments:check-types: 
@repo/payments:check-types: >>> Starting Audit: 04/29/2026 09:01:38
@repo/payments:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/payments:check-types: --------------------------------------------------------------------------------
@repo/payments:check-types: 
@repo/payments:check-types: --------------------------------------------------------------------------------
@repo/payments:check-types: AUDIT SUMMARY
@repo/payments:check-types: Duration: 0m 28s
@repo/payments:check-types: Findings: 0
@repo/payments:check-types: Log File: reports/check-types.txt
@repo/payments:check-types: --------------------------------------------------------------------------------
@repo/form-builder:check-types: cache hit, replaying logs 5cae97e0e686fc7e
@repo/form-builder:check-types: 
@repo/form-builder:check-types: > @repo/form-builder@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/form-builder:check-types: 
@repo/form-builder:check-types: >>> Starting Audit: 04/29/2026 09:05:50
@repo/form-builder:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/form-builder:check-types: --------------------------------------------------------------------------------
@repo/form-builder:check-types: 
@repo/form-builder:check-types: --------------------------------------------------------------------------------
@repo/form-builder:check-types: AUDIT SUMMARY
@repo/form-builder:check-types: Duration: 0m 46s
@repo/profile:check-types: cache hit, replaying logs 5368a0aa8459af82
@repo/form-builder:check-types: Findings: 0
@repo/form-builder:check-types: Log File: reports/check-types.txt
@repo/form-builder:check-types: --------------------------------------------------------------------------------
@repo/profile:check-types: 
@repo/profile:check-types: > @repo/profile@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/profile:check-types: 
@repo/profile:check-types: >>> Starting Audit: 04/29/2026 09:07:25
@repo/profile:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/profile:check-types: --------------------------------------------------------------------------------
@repo/profile:check-types: 
@repo/profile:check-types: --------------------------------------------------------------------------------
@repo/profile:check-types: AUDIT SUMMARY
@repo/profile:check-types: Duration: 0m 36s
@repo/profile:check-types: Findings: 0
@repo/profile:check-types: Log File: reports/check-types.txt
@repo/profile:check-types: --------------------------------------------------------------------------------
@repo/self:check-types: cache hit, replaying logs 96cc1d74507497be
@repo/self:check-types: 
@repo/self:check-types: > @repo/self@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: > pnpm run typecheck
@repo/self:check-types: 
@repo/self:check-types: 
@repo/self:check-types: > @repo/self@0.0.1 typecheck C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/self:check-types: 
@repo/self:check-types: >>> Starting Audit: 04/29/2026 09:09:00
@repo/self:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/self:check-types: --------------------------------------------------------------------------------
@repo/self:check-types: 
@repo/self:check-types: --------------------------------------------------------------------------------
@repo/self:check-types: AUDIT SUMMARY
@repo/self:check-types: Duration: 0m 37s
@repo/self:check-types: Findings: 0
@repo/self:check-types: Log File: reports/check-types.txt
@repo/self:check-types: --------------------------------------------------------------------------------
@repo/graphics:check-types: 
@repo/graphics:check-types: > @repo/graphics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/graphics:check-types: 
@repo/graphics:check-types: >>> Starting Audit: 04/29/2026 09:40:05
@repo/graphics:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/graphics:check-types: --------------------------------------------------------------------------------
@repo/graphics:check-types: 
@repo/graphics:check-types: --------------------------------------------------------------------------------
@repo/graphics:check-types: AUDIT SUMMARY
@repo/graphics:check-types: Duration: 0m 17s
@repo/graphics:check-types: Findings: 0
@repo/graphics:check-types: Log File: reports/check-types.txt
@repo/graphics:check-types: --------------------------------------------------------------------------------
@repo/library:check-types: cache miss, executing f2420325513abb6e
@repo/analytics:check-types: cache miss, executing 4991f4eda3dfce67
@repo/library:check-types: 
@repo/library:check-types: > @repo/library@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/library:check-types: 
@repo/analytics:check-types: 
@repo/analytics:check-types: > @repo/analytics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\analytics
@repo/analytics:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/analytics:check-types: 
@repo/analytics:check-types: >>> Starting Audit: 04/29/2026 09:40:24
@repo/library:check-types: >>> Starting Audit: 04/29/2026 09:40:24
@repo/library:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/analytics:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/library:check-types: --------------------------------------------------------------------------------
@repo/analytics:check-types: --------------------------------------------------------------------------------
@repo/analytics:check-types: ../graphics/src/data/PostalCodes.ts(2,27): error TS7016: Could not find a declaration file for module 'srilankan-postalcode-backend'. 'C:/Users/Naween/projects/polymath-platform/node_modules/.pnpm/srilankan-postalcode-backend@1.0.0/node_modules/srilankan-postalcode-backend/index.js' implicitly has an 'any' type.
@repo/analytics:check-types:   Try `npm i --save-dev @types/srilankan-postalcode-backend` if it exists or add a new declaration (.d.ts) file containing `declare module 'srilankan-postalcode-backend';`
@repo/analytics:check-types: 
@repo/analytics:check-types: --------------------------------------------------------------------------------
@repo/analytics:check-types: AUDIT SUMMARY
@repo/analytics:check-types: Duration: 0m 27s
@repo/analytics:check-types: Findings: 1
@repo/analytics:check-types: Log File: reports/check-types.txt
@repo/analytics:check-types: --------------------------------------------------------------------------------
@repo/analytics:check-types:  ELIFECYCLE  Command failed with exit code 2.
 ERROR  @repo/analytics#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\analytics) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)

 Tasks:    17 successful, 19 total
Cached:    16 cached, 19 total
  Time:    47.916s 
Failed:    @repo/analytics#check-types

 ERROR  run failed: command  exited (2)
```
