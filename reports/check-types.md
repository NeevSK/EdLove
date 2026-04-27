# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 2026-04-26 22:38:30
> **Command:** pnpm turbo run check-types

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 22 |

## Detailed Findings

### Category: General
- apps-intuitui-web:check-types: - 0 errors
- apps-intuitui-web:check-types: - 0 warnings
- apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
- apps-neevsk-web:check-types: [96msrc/components/common/Navigation.astro[0m:[93m298[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'lastScroll' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/FloatingParticles.astro[0m:[93m2[0m:[93m39[0m - [93mwarning[0m[90m ts(6133): [0m'i' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/LiquidCosmos.astro[0m:[93m15[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'startY' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/pages/personal/index.astro[0m:[93m2[0m:[93m1[0m - [93mwarning[0m[90m ts(6133): [0m'Card' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/LiquidCosmos.astro[0m:[93m14[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'startX' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m256[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/lib/api.ts[0m:[93m27[0m:[93m3[0m - [93mwarning[0m[90m ts(6196): [0m'User' is declared but never used.
- apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m248[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m69[0m:[93m11[0m - [93mwarning[0m[90m ts(6133): [0m'status' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m59[0m:[93m31[0m - [93mwarning[0m[90m ts(6133): [0m'index' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m59[0m:[93m25[0m - [93mwarning[0m[90m ts(6133): [0m'seed' is declared but its value is never read.
- apps-neevsk-web:check-types: - 0 errors
- apps-neevsk-web:check-types: - 0 warnings
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m129[0m:[93m90[0m - [93mwarning[0m[90m ts(6385): [0m'event' is deprecated.
- apps-edlove-web:check-types: - 0 errors
- apps-edlove-web:check-types: - 0 warnings
- @intuitui-labs/lk-edu-geo:check-types: src/index.ts(3,1): error TS2304: Cannot find name 'assert'.
-  ERROR  @intuitui-labs/lk-edu-geo#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)
-  ERROR  run failed: command  exited (2)


## Raw Output
```text
• turbo 2.9.4

   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 28 packages
   • Remote caching disabled

apps-edlove-web:check-types: cache miss, executing 215fdc631df7d92b
apps-intuitui-web:check-types: cache miss, executing d1bd96d688fdf3fd
apps-neevsk-web:check-types: cache miss, executing 77d354f7f4bfa004
@repo/core:check-types: cache miss, executing 37c2835ff5f31767
apps-edlove-web:check-types: 
apps-intuitui-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-edlove-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-intuitui-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-edlove-web:check-types: 
apps-intuitui-web:check-types: 
@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/core:check-types: 
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-neevsk-web:check-types: 
apps-intuitui-web:check-types: >>> Starting Audit: 04/26/2026 22:37:49
apps-intuitui-web:check-types: >>> Command: pnpm exec astro check
apps-intuitui-web:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: >>> Starting Audit: 04/26/2026 22:37:49
apps-edlove-web:check-types: >>> Starting Audit: 04/26/2026 22:37:49
apps-neevsk-web:check-types: >>> Command: pnpm exec astro check
apps-edlove-web:check-types: >>> Command: pnpm exec astro check
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: >>> Starting Audit: 04/26/2026 22:37:49
@repo/core:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/core:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: [2m22:38:00[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-intuitui-web:check-types: [2m22:38:00[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-edlove-web:check-types: [2m22:38:00[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-intuitui-web:check-types: [2m22:38:06[22m [34m[types][39m Generated [2m6.79s[22m
apps-intuitui-web:check-types: [2m22:38:06[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\intuitui-web...
apps-edlove-web:check-types: [2m22:38:08[22m [34m[content][39m Syncing content
apps-edlove-web:check-types: [2m22:38:08[22m [34m[content][39m Content config changed
apps-edlove-web:check-types: [2m22:38:08[22m [34m[content][39m Clearing content store
apps-neevsk-web:check-types: [2m22:38:08[22m [34m[content][39m Syncing content
apps-neevsk-web:check-types: [2m22:38:08[22m [34m[content][39m Content config changed
apps-neevsk-web:check-types: [2m22:38:08[22m [34m[content][39m Clearing content store
apps-edlove-web:check-types: [2m22:38:08[22m [34m[content][39m Synced content
apps-edlove-web:check-types: [2m22:38:08[22m [34m[types][39m Generated [2m8.48s[22m
apps-edlove-web:check-types: [2m22:38:08[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\edlove-web...
apps-neevsk-web:check-types: [2m22:38:08[22m [34m[content][39m Synced content
apps-neevsk-web:check-types: [2m22:38:08[22m [34m[types][39m Generated [2m8.53s[22m
apps-neevsk-web:check-types: [2m22:38:08[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\neevsk-web...
@repo/core:check-types: 
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: AUDIT SUMMARY
@repo/core:check-types: Duration: 0m 24s
@repo/core:check-types: Findings: 0
@repo/core:check-types: Log File: reports/check-types.txt
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/ui:check-types: cache miss, executing 4cf8a89040d82ec2
@intuitui-labs/lk-edu-geo:check-types: cache miss, executing 77c362984935ba97
@repo/accounting:check-types: cache miss, executing d7b83a5bc5b02c96
@repo/database:check-types: cache miss, executing 27aab133cfd73db1
@repo/accounting:check-types: 
@repo/accounting:check-types: > @repo/accounting@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/accounting:check-types: 
@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@intuitui-labs/lk-edu-geo:check-types: 
@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm run typecheck
@repo/ui:check-types: 
apps-intuitui-web:check-types: Result (14 files): 
apps-intuitui-web:check-types: - 0 errors
apps-intuitui-web:check-types: - 0 warnings
@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/database:check-types: 
apps-intuitui-web:check-types: - 0 hints
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: AUDIT SUMMARY
apps-intuitui-web:check-types: Duration: 0m 26s
apps-intuitui-web:check-types: Findings: 2
apps-intuitui-web:check-types: Log File: reports/check-types.txt
apps-intuitui-web:check-types: --------------------------------------------------------------------------------
@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 typecheck C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/ui:check-types: 
@intuitui-labs/lk-edu-geo:check-types: >>> Starting Audit: 04/26/2026 22:38:16
@intuitui-labs/lk-edu-geo:check-types: >>> Command: pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@repo/accounting:check-types: >>> Starting Audit: 04/26/2026 22:38:16
@repo/accounting:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/database:check-types: >>> Starting Audit: 04/26/2026 22:38:16
@repo/accounting:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/database:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m41[0m     link: z.string().url().optional(),
apps-neevsk-web:check-types: [7m  [0m [93m                     ~~~[0m
apps-neevsk-web:check-types: 
@repo/ui:check-types: >>> Starting Audit: 04/26/2026 22:38:17
@repo/ui:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/ui:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: [96msrc/components/common/Navigation.astro[0m:[93m298[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'lastScroll' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m298[0m   let lastScroll = 0;
apps-neevsk-web:check-types: [7m   [0m [93m      ~~~~~~~~~~[0m
apps-neevsk-web:check-types: 
apps-edlove-web:check-types: [96msrc/components/FloatingParticles.astro[0m:[93m2[0m:[93m39[0m - [93mwarning[0m[90m ts(6133): [0m'i' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m2[0m   {Array.from({ length: 30 }).map((_, i) => (
apps-edlove-web:check-types: [7m [0m [93m                                      ~[0m
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [96msrc/components/LiquidCosmos.astro[0m:[93m15[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'startY' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m15[0m   let startY = 0;
apps-neevsk-web:check-types: [96msrc/pages/personal/index.astro[0m:[93m2[0m:[93m1[0m - [93mwarning[0m[90m ts(6133): [0m'Card' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~[0m
apps-neevsk-web:check-types: [7m2[0m import Card from '../../components/common/Card.astro';
apps-edlove-web:check-types: [96msrc/components/LiquidCosmos.astro[0m:[93m14[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'startX' is declared but its value is never read.
apps-neevsk-web:check-types: [7m [0m [93m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m
apps-edlove-web:check-types: 
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m256[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
apps-edlove-web:check-types: [7m14[0m   let startX = 0;
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m256[0m       button.addEventListener('mouseleave', (e) => {
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~[0m
apps-edlove-web:check-types: 
apps-neevsk-web:check-types: [7m   [0m [93m                                             ~[0m
apps-edlove-web:check-types: [96msrc/lib/api.ts[0m:[93m27[0m:[93m3[0m - [93mwarning[0m[90m ts(6196): [0m'User' is declared but never used.
apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m248[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-neevsk-web:check-types: 
apps-edlove-web:check-types: [7m27[0m   User,
apps-neevsk-web:check-types: [7m248[0m       button.addEventListener('mouseenter', (e) => {
apps-edlove-web:check-types: [7m  [0m [93m  ~~~~[0m
apps-neevsk-web:check-types: [7m   [0m [93m                                             ~[0m
apps-edlove-web:check-types: 
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m69[0m:[93m11[0m - [93mwarning[0m[90m ts(6133): [0m'status' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m69[0m   private status: HTMLElement | null;
apps-neevsk-web:check-types: [7m  [0m [93m          ~~~~~~[0m
apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m59[0m:[93m31[0m - [93mwarning[0m[90m ts(6133): [0m'index' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m59[0m     this.seeds.forEach((seed, index) => {
apps-neevsk-web:check-types: [7m  [0m [93m                              ~~~~~[0m
apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m59[0m:[93m25[0m - [93mwarning[0m[90m ts(6133): [0m'seed' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m59[0m     this.seeds.forEach((seed, index) => {
apps-neevsk-web:check-types: [7m  [0m [93m                        ~~~~[0m
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: Result (44 files): 
apps-neevsk-web:check-types: - 0 errors
apps-neevsk-web:check-types: - 0 warnings
apps-neevsk-web:check-types: - 8 hints
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: AUDIT SUMMARY
apps-neevsk-web:check-types: Duration: 0m 32s
apps-neevsk-web:check-types: Findings: 10
apps-neevsk-web:check-types: Log File: reports/check-types.txt
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m129[0m:[93m90[0m - [93mwarning[0m[90m ts(6385): [0m'event' is deprecated.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m129[0m                 <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onsubmit="event.preventDefault();">
apps-edlove-web:check-types: [7m   [0m [93m                                                                                         ~~~~~[0m
apps-edlove-web:check-types: 
@repo/database:check-types: 
@repo/database:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: AUDIT SUMMARY
@repo/database:check-types: Duration: 0m 6s
@repo/database:check-types: Findings: 0
@repo/database:check-types: Log File: reports/check-types.txt
@repo/database:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: Result (41 files): 
apps-edlove-web:check-types: - 0 errors
apps-edlove-web:check-types: - 0 warnings
apps-edlove-web:check-types: - 5 hints
apps-edlove-web:check-types: 
apps-edlove-web:check-types: 
apps-edlove-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: AUDIT SUMMARY
apps-edlove-web:check-types: Duration: 0m 33s
apps-edlove-web:check-types: Findings: 7
apps-edlove-web:check-types: Log File: reports/check-types.txt
apps-edlove-web:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types: src/index.ts(3,1): error TS2304: Cannot find name 'assert'.
@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types: AUDIT SUMMARY
@intuitui-labs/lk-edu-geo:check-types: Duration: 0m 13s
@intuitui-labs/lk-edu-geo:check-types: Findings: 1
@intuitui-labs/lk-edu-geo:check-types: Log File: reports/check-types.txt
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types:  ELIFECYCLE  Command failed with exit code 2.
 ERROR  @intuitui-labs/lk-edu-geo#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)

 Tasks:    5 successful, 8 total
Cached:    0 cached, 8 total
  Time:    42.568s 
Failed:    @intuitui-labs/lk-edu-geo#check-types

 ERROR  run failed: command  exited (2)
```
