# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 2026-04-28 13:14:03
> **Command:** pnpm turbo run check-types

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 20 |

## Detailed Findings

### Category: General
- apps-intuitui-web:check-types: - 0 errors
- apps-intuitui-web:check-types: - 0 warnings
- apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
- apps-neevsk-web:check-types: [96msrc/components/common/Navigation.astro[0m:[93m298[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'lastScroll' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/FloatingParticles.astro[0m:[93m2[0m:[93m39[0m - [93mwarning[0m[90m ts(6133): [0m'i' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/LiquidCosmos.astro[0m:[93m15[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'startY' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/components/LiquidCosmos.astro[0m:[93m14[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'startX' is declared but its value is never read.
- apps-edlove-web:check-types: [96msrc/lib/api.ts[0m:[93m27[0m:[93m3[0m - [93mwarning[0m[90m ts(6196): [0m'User' is declared but never used.
- apps-neevsk-web:check-types: [96msrc/pages/personal/index.astro[0m:[93m2[0m:[93m1[0m - [93mwarning[0m[90m ts(6133): [0m'Card' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m256[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m248[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
- @repo/core:check-types: src/logic/events/schemas.ts(107,5): error TS2322: Type 'ZodObject<{ runId: ZodString; mode: ZodDefault<ZodEnum<{ demo: "demo"; live: "live"; }>>; demoScenario: ZodOptional<ZodEnum<{ "attendance-dip": "attendance-dip"; "steady-growth": "steady-growth"; "wellbeing-watch": "wellbeing-watch"; }>>; ... 10 more ...; tenantId: ZodOptional<...>; }, $strip>' is not assignable to type '"Transforms not supported: schema input/output types must match"'.
- apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m69[0m:[93m11[0m - [93mwarning[0m[90m ts(6133): [0m'status' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m59[0m:[93m31[0m - [93mwarning[0m[90m ts(6133): [0m'index' is declared but its value is never read.
- apps-neevsk-web:check-types: [96msrc/scripts/creative-signatures.ts[0m:[93m59[0m:[93m25[0m - [93mwarning[0m[90m ts(6133): [0m'seed' is declared but its value is never read.
- apps-neevsk-web:check-types: - 0 errors
- apps-neevsk-web:check-types: - 0 warnings
- apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m129[0m:[93m90[0m - [93mwarning[0m[90m ts(6385): [0m'event' is deprecated.
-  ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)
-  ERROR  run failed: command  exited (2)


## Raw Output
```text
• turbo 2.9.4

   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 28 packages
   • Remote caching disabled

apps-intuitui-web:check-types: cache miss, executing a7e1ea1b28a45c4f
apps-edlove-web:check-types: cache miss, executing 94b0633902a91efd
apps-neevsk-web:check-types: cache miss, executing de6ec8ea97f58801
@repo/core:check-types: cache miss, executing 2108a9ed203a55d6
apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-edlove-web:check-types: 
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-intuitui-web:check-types: 
@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec tsc --noEmit" -Log "reports/check-types.txt"
@repo/core:check-types: 
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > powershell -File ../../scripts/audit-wrapper.ps1 -Cmd "pnpm exec astro check" -Log "reports/check-types.txt"
apps-neevsk-web:check-types: 
apps-intuitui-web:check-types: >>> Starting Audit: 04/28/2026 13:13:32
apps-intuitui-web:check-types: >>> Command: pnpm exec astro check
apps-intuitui-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: >>> Starting Audit: 04/28/2026 13:13:32
apps-edlove-web:check-types: >>> Command: pnpm exec astro check
apps-edlove-web:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: >>> Starting Audit: 04/28/2026 13:13:32
@repo/core:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/core:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: >>> Starting Audit: 04/28/2026 13:13:32
apps-neevsk-web:check-types: >>> Command: pnpm exec astro check
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: [2m13:13:41[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-neevsk-web:check-types: [2m13:13:41[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-edlove-web:check-types: [2m13:13:41[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
apps-intuitui-web:check-types: [2m13:13:44[22m [34m[types][39m Generated [2m3.44s[22m
apps-intuitui-web:check-types: [2m13:13:44[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\intuitui-web...
apps-edlove-web:check-types: [2m13:13:48[22m [34m[content][39m Syncing content
apps-edlove-web:check-types: [2m13:13:48[22m [34m[content][39m Synced content
apps-edlove-web:check-types: [2m13:13:48[22m [34m[types][39m Generated [2m7.09s[22m
apps-edlove-web:check-types: [2m13:13:48[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\edlove-web...
apps-neevsk-web:check-types: [2m13:13:49[22m [34m[content][39m Syncing content
apps-neevsk-web:check-types: [2m13:13:49[22m [34m[content][39m Synced content
apps-neevsk-web:check-types: [2m13:13:49[22m [34m[types][39m Generated [2m7.99s[22m
apps-neevsk-web:check-types: [2m13:13:49[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\neevsk-web...
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
apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m41[0m:[93m22[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m41[0m     link: z.string().url().optional(),
apps-neevsk-web:check-types: [7m  [0m [93m                     ~~~[0m
apps-neevsk-web:check-types: 
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
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~[0m
apps-edlove-web:check-types: [96msrc/components/LiquidCosmos.astro[0m:[93m14[0m:[93m7[0m - [93mwarning[0m[90m ts(6133): [0m'startX' is declared but its value is never read.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m14[0m   let startX = 0;
apps-edlove-web:check-types: [7m  [0m [93m      ~~~~~~[0m
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [96msrc/lib/api.ts[0m:[93m27[0m:[93m3[0m - [93mwarning[0m[90m ts(6196): [0m'User' is declared but never used.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m27[0m   User,
apps-edlove-web:check-types: [7m  [0m [93m  ~~~~[0m
apps-edlove-web:check-types: 
apps-neevsk-web:check-types: [96msrc/pages/personal/index.astro[0m:[93m2[0m:[93m1[0m - [93mwarning[0m[90m ts(6133): [0m'Card' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m2[0m import Card from '../../components/common/Card.astro';
apps-neevsk-web:check-types: [7m [0m [93m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m256[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m256[0m       button.addEventListener('mouseleave', (e) => {
apps-neevsk-web:check-types: [7m   [0m [93m                                             ~[0m
apps-neevsk-web:check-types: [96msrc/scripts/animations.ts[0m:[93m248[0m:[93m46[0m - [93mwarning[0m[90m ts(6133): [0m'e' is declared but its value is never read.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m248[0m       button.addEventListener('mouseenter', (e) => {
apps-neevsk-web:check-types: [7m   [0m [93m                                             ~[0m
apps-neevsk-web:check-types: 
@repo/core:check-types: src/logic/events/schemas.ts(107,5): error TS2322: Type 'ZodObject<{ runId: ZodString; mode: ZodDefault<ZodEnum<{ demo: "demo"; live: "live"; }>>; demoScenario: ZodOptional<ZodEnum<{ "attendance-dip": "attendance-dip"; "steady-growth": "steady-growth"; "wellbeing-watch": "wellbeing-watch"; }>>; ... 10 more ...; tenantId: ZodOptional<...>; }, $strip>' is not assignable to type '"Transforms not supported: schema input/output types must match"'.
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
apps-edlove-web:check-types: [96msrc/pages/gurudevi/index.astro[0m:[93m129[0m:[93m90[0m - [93mwarning[0m[90m ts(6385): [0m'event' is deprecated.
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [7m129[0m                 <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onsubmit="event.preventDefault();">
apps-edlove-web:check-types: [7m   [0m [93m                                                                                         ~~~~~[0m
apps-edlove-web:check-types: 
@repo/core:check-types: 
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: AUDIT SUMMARY
@repo/core:check-types: Duration: 0m 30s
@repo/core:check-types: Findings: 1
@repo/core:check-types: Log File: reports/check-types.txt
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/core:check-types:  ELIFECYCLE  Command failed with exit code 2.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: AUDIT SUMMARY
apps-neevsk-web:check-types: Duration: 0m 30s
apps-neevsk-web:check-types: Findings: 10
apps-neevsk-web:check-types: Log File: reports/check-types.txt
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
 ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)

 Tasks:    2 successful, 4 total
Cached:    0 cached, 4 total
  Time:    32.379s 
Failed:    @repo/core#check-types

 ERROR  run failed: command  exited (2)
```
