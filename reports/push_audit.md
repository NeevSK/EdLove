---
title: "Sovereign Monorepo Hygiene Audit Report"
status: "active"
created: 2026-05-01
updated: 2026-08-14
author: "Naveen"
scribe: "opencode"
tags: [reports, push_audit.md]
---

# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 8/24/2026, 6:28:18 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 21.7s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 75 |

## Detailed Findings

### Category: General
- mise ERROR error parsing config file: C:\x\mise.toml
- mise ERROR Config files in C:\x\mise.toml are not trusted.
- mise ERROR Run with --verbose or MISE_VERBOSE=1 for more information
- mise ERROR error parsing config file: C:\x\mise.toml
- mise ERROR Config files in C:\x\mise.toml are not trusted.
- mise ERROR Run with --verbose or MISE_VERBOSE=1 for more information
- [WARN] Unsupported engine: wanted: {"node":">=22.23.0 <23"} (current: {"node":"v24.11.0","pnpm":"11.21.0"})
- [WARN] Unsupported engine: wanted: {"node":">=22.23.0 <23"} (current: {"node":"v24.11.0","pnpm":"11.21.0"})
- @repo/community:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/analytics:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/graphics:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/profile:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/library:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ai:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/accounting:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/form-builder:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ui:lint:biome: [WARN] Unsupported engine: wanted: {"node":">=22.23.0 <23"} (current: {"node":"v24.11.0","pnpm":"11.21.0"})
- @repo/ui:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/self:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/workforce:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/classroom:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/admin:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/payments:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
- @repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:eslint:   49:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   50:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   54:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   55:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   56:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   57:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   58:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   59:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   63:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint:   63:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/types-shim:lint:eslint: ✖ 10 problems (0 errors, 10 warnings)
- @repo/types-shim:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:     + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
- @repo/types-shim:lint:     + FullyQualifiedErrorId : InvalidEndOfLine
- @repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim#lint:  ERROR  command (C:\x\packages\types-shim) C:\Users\Naween\AppData\Local\pnpm\store\v11\links\@pnpm\exe\11.21.0\dcd072db88e14f72468d3f8dd15307bb909a66d80cf3479a9fcbe866632bbfc3\bin\pnpm.CMD run lint exited (1)
- ERROR  run failed: command  exited (1)
- Findings: 1 (Errors: 1, Warnings: 0)

## Raw Output

```text
mise ERROR error parsing config file: C:\x\mise.toml
mise ERROR Config files in C:\x\mise.toml are not trusted.
Trust them with `mise trust`. See https://mise.en.dev/cli/trust.html for more information.
mise ERROR Run with --verbose or MISE_VERBOSE=1 for more information

mise ERROR error parsing config file: C:\x\mise.toml
mise ERROR Config files in C:\x\mise.toml are not trusted.
Trust them with `mise trust`. See https://mise.en.dev/cli/trust.html for more information.
mise ERROR Run with --verbose or MISE_VERBOSE=1 for more information

[WARN] Unsupported engine: wanted: {"node":">=22.23.0 <23"} (current: {"node":"v24.11.0","pnpm":"11.21.0"})

$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint" --name "package_json-lint"

>>> Starting Process: 8/24/2026, 6:28:10 PM (IST)

>>> Command: pnpm turbo run lint

>>> Working Dir: C:\x
>>> Log output: C:\x\reports\run-package_json-lint.log
--------------------------------------------------------------------------------

[WARN] Unsupported engine: wanted: {"node":">=22.23.0 <23"} (current: {"node":"v24.11.0","pnpm":"11.21.0"})

• turbo 2.10.5


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile
   • Running lint in 30 packages

   • Remote caching disabled


@repo/community:lint:biome: cache hit, replaying logs 8ec0c315257363f7

@repo/analytics:lint:biome: cache hit, replaying logs aadbf6056b5283c6

@repo/community:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_community-lint_biome"
@repo/community:lint:biome: >>> Starting Process: 8/24/2026, 6:25:45 PM (IST)
@repo/community:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/community:lint:biome: >>> Working Dir: C:\x\packages\community
@repo/community:lint:biome: >>> Log output: C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: >>> No modified files found to format.
@repo/community:lint:biome: 
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: REPORT SUMMARY
@repo/community:lint:biome: Duration: 3.5 seconds
@repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/community:lint:biome: Raw Log:  C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: Report:   C:\x\reports\run-packages_community-lint_biome-report.txt
@repo/community:lint:biome: --------------------------------------------------------------------------------

@repo/analytics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_analytics-lint_biome"
@repo/analytics:lint:biome: >>> Starting Process: 8/24/2026, 6:25:44 PM (IST)
@repo/analytics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/analytics:lint:biome: >>> Working Dir: C:\x\packages\analytics
@repo/analytics:lint:biome: >>> Log output: C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
@repo/analytics:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/analytics:lint:biome: >>> No modified files found to format.
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
@repo/analytics:lint:biome: REPORT SUMMARY
@repo/analytics:lint:biome: Duration: 3.6 seconds
@repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/analytics:lint:biome: Raw Log:  C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: Report:   C:\x\reports\run-packages_analytics-lint_biome-report.txt

@repo/analytics:lint:biome: --------------------------------------------------------------------------------
apps-edlove-web:lint:biome: cache hit, replaying logs 445a9ba449a5d05d

apps-edlove-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_edlove-web-lint_biome"
apps-edlove-web:lint:biome: >>> Starting Process: 8/24/2026, 6:25:45 PM (IST)
apps-edlove-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
apps-edlove-web:lint:biome: >>> Working Dir: C:\x\apps\edlove-web

apps-edlove-web:lint:biome: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
apps-edlove-web:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
apps-edlove-web:lint:biome: >>> No modified files found to format.
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
apps-edlove-web:lint:biome: REPORT SUMMARY
apps-edlove-web:lint:biome: Duration: 3.7 seconds
apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint:biome: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: Report:   C:\x\reports\run-apps_edlove-web-lint_biome-report.txt
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: cache hit, replaying logs 510e66958ceecf65

@repo/graphics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_graphics-lint_biome"
@repo/graphics:lint:biome: >>> Starting Process: 8/24/2026, 6:25:53 PM (IST)
@repo/graphics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/graphics:lint:biome: >>> Working Dir: C:\x\packages\graphics
@repo/graphics:lint:biome: >>> Log output: C:\x\reports\run-packages_graphics-lint_biome.log

@repo/graphics:lint:biome: --------------------------------------------------------------------------------
@repo/graphics:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/graphics:lint:biome: >>> No modified files found to format.
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: --------------------------------------------------------------------------------
@repo/graphics:lint:biome: REPORT SUMMARY
@repo/graphics:lint:biome: Duration: 3.6 seconds
@repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/graphics:lint:biome: Raw Log:  C:\x\reports\run-packages_graphics-lint_biome.log
@repo/graphics:lint:biome: Report:   C:\x\reports\run-packages_graphics-lint_biome-report.txt
@repo/graphics:lint:biome: --------------------------------------------------------------------------------

@repo/profile:lint:biome: cache hit, replaying logs 53aea167450f728f

@repo/profile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_profile-lint_biome"
@repo/profile:lint:biome: >>> Starting Process: 8/24/2026, 6:25:59 PM (IST)
@repo/profile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/profile:lint:biome: >>> Working Dir: C:\x\packages\profile

@repo/profile:lint:biome: >>> Log output: C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/profile:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/profile:lint:biome: >>> No modified files found to format.
@repo/profile:lint:biome: 
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/profile:lint:biome: REPORT SUMMARY
@repo/profile:lint:biome: Duration: 2.9 seconds
@repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/profile:lint:biome: Raw Log:  C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: Report:   C:\x\reports\run-packages_profile-lint_biome-report.txt
@repo/profile:lint:biome: --------------------------------------------------------------------------------

@repo/scanner-kit:lint:biome: cache hit, replaying logs 9233031093294a32

@repo/scanner-kit:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_scanner-kit-lint_biome"
@repo/scanner-kit:lint:biome: >>> Starting Process: 8/24/2026, 6:25:53 PM (IST)
@repo/scanner-kit:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/scanner-kit:lint:biome: >>> Working Dir: C:\x\packages\scanner-kit

@repo/scanner-kit:lint:biome: >>> Log output: C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------
@repo/scanner-kit:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/scanner-kit:lint:biome: >>> No modified files found to format.
@repo/scanner-kit:lint:biome: 
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------
@repo/scanner-kit:lint:biome: REPORT SUMMARY
@repo/scanner-kit:lint:biome: Duration: 3.3 seconds
@repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/scanner-kit:lint:biome: Raw Log:  C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: Report:   C:\x\reports\run-packages_scanner-kit-lint_biome-report.txt
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------

@repo/library:lint:biome: cache hit, replaying logs c76e52822da8206c

@repo/library:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_library-lint_biome"
@repo/library:lint:biome: >>> Starting Process: 8/24/2026, 6:25:54 PM (IST)
@repo/library:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/library:lint:biome: >>> Working Dir: C:\x\packages\library

@repo/library:lint:biome: >>> Log output: C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: --------------------------------------------------------------------------------
@repo/library:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/library:lint:biome: >>> No modified files found to format.
@repo/library:lint:biome: 
@repo/library:lint:biome: --------------------------------------------------------------------------------
@repo/library:lint:biome: REPORT SUMMARY
@repo/library:lint:biome: Duration: 4.2 seconds
@repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/library:lint:biome: Raw Log:  C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: Report:   C:\x\reports\run-packages_library-lint_biome-report.txt
@repo/library:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: cache hit, replaying logs a59c6f87733b36d6

@repo/ai:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ai-lint_biome"
@repo/ai:lint:biome: >>> Starting Process: 8/24/2026, 6:25:53 PM (IST)
@repo/ai:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/ai:lint:biome: >>> Working Dir: C:\x\packages\ai
@repo/ai:lint:biome: >>> Log output: C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: --------------------------------------------------------------------------------
@repo/ai:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/ai:lint:biome: >>> No modified files found to format.
@repo/ai:lint:biome: 
@repo/ai:lint:biome: --------------------------------------------------------------------------------
@repo/ai:lint:biome: REPORT SUMMARY
@repo/ai:lint:biome: Duration: 3.4 seconds
@repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/ai:lint:biome: Raw Log:  C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: Report:   C:\x\reports\run-packages_ai-lint_biome-report.txt
@repo/ai:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:biome: cache hit, replaying logs 217fb7e19c36c9fb

@repo/database:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_database-lint_biome"
@repo/database:lint:biome: >>> Starting Process: 8/24/2026, 6:25:52 PM (IST)
@repo/database:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/database:lint:biome: >>> Working Dir: C:\x\packages\database
@repo/database:lint:biome: >>> Log output: C:\x\reports\run-packages_database-lint_biome.log

@repo/database:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: >>> No modified files found to format.
@repo/database:lint:biome: 
@repo/database:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:biome: REPORT SUMMARY
@repo/database:lint:biome: Duration: 3.4 seconds
@repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint:biome: Raw Log:  C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint:biome: Report:   C:\x\reports\run-packages_database-lint_biome-report.txt
@repo/database:lint:biome: --------------------------------------------------------------------------------

@repo/accounting:lint:biome: cache hit, replaying logs f141e9deef8ed8b8

@repo/accounting:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_accounting-lint_biome"
@repo/accounting:lint:biome: >>> Starting Process: 8/24/2026, 6:25:45 PM (IST)
@repo/accounting:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/accounting:lint:biome: >>> Working Dir: C:\x\packages\accounting
@repo/accounting:lint:biome: >>> Log output: C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: --------------------------------------------------------------------------------
@repo/accounting:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/accounting:lint:biome: >>> No modified files found to format.
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: --------------------------------------------------------------------------------
@repo/accounting:lint:biome: REPORT SUMMARY
@repo/accounting:lint:biome: Duration: 3.1 seconds
@repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/accounting:lint:biome: Raw Log:  C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: Report:   C:\x\reports\run-packages_accounting-lint_biome-report.txt
@repo/accounting:lint:biome: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:biome: cache hit, replaying logs 6e868199c24478a8

apps-gurudevi-marketing-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"
apps-gurudevi-marketing-web:lint:biome: >>> Starting Process: 8/24/2026, 6:25:52 PM (IST)
apps-gurudevi-marketing-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

apps-gurudevi-marketing-web:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: >>> No modified files found to format.
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: REPORT SUMMARY
apps-gurudevi-marketing-web:lint:biome: Duration: 3.5 seconds
apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome-report.txt
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: cache hit, replaying logs e00cdda32508fed9

@repo/form-builder:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_form-builder-lint_biome"
@repo/form-builder:lint:biome: >>> Starting Process: 8/24/2026, 6:25:44 PM (IST)
@repo/form-builder:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/form-builder:lint:biome: >>> Working Dir: C:\x\packages\form-builder
@repo/form-builder:lint:biome: >>> Log output: C:\x\reports\run-packages_form-builder-lint_biome.log
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------
@repo/form-builder:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/form-builder:lint:biome: >>> No modified files found to format.
@repo/form-builder:lint:biome: 
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------
@repo/form-builder:lint:biome: REPORT SUMMARY
@repo/form-builder:lint:biome: Duration: 3.5 seconds
@repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/form-builder:lint:biome: Raw Log:  C:\x\reports\run-packages_form-builder-lint_biome.log
@repo/form-builder:lint:biome: Report:   C:\x\reports\run-packages_form-builder-lint_biome-report.txt
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

@repo/ui:lint:biome: cache hit, replaying logs 6fd8233c61b699a0

@repo/ui:lint:biome: [WARN] Unsupported engine: wanted: {"node":">=22.23.0 <23"} (current: {"node":"v24.11.0","pnpm":"11.21.0"})
@repo/ui:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ui-lint_biome"
@repo/ui:lint:biome: >>> Starting Process: 8/24/2026, 6:25:46 PM (IST)

@repo/ui:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/ui:lint:biome: >>> Working Dir: C:\x\packages\ui
@repo/ui:lint:biome: >>> Log output: C:\x\reports\run-packages_ui-lint_biome.log
@repo/ui:lint:biome: --------------------------------------------------------------------------------
@repo/ui:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: >>> No modified files found to format.
@repo/ui:lint:biome: 
@repo/ui:lint:biome: --------------------------------------------------------------------------------
@repo/ui:lint:biome: REPORT SUMMARY
@repo/ui:lint:biome: Duration: 3.9 seconds
@repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/ui:lint:biome: Raw Log:  C:\x\reports\run-packages_ui-lint_biome.log
@repo/ui:lint:biome: Report:   C:\x\reports\run-packages_ui-lint_biome-report.txt
@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: cache hit, replaying logs 3c9d7f4fc51e43c9

@repo/core:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_core-lint_biome"
@repo/core:lint:biome: >>> Starting Process: 8/24/2026, 6:26:00 PM (IST)
@repo/core:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/core:lint:biome: >>> Working Dir: C:\x\packages\core
@repo/core:lint:biome: >>> Log output: C:\x\reports\run-packages_core-lint_biome.log

@repo/core:lint:biome: --------------------------------------------------------------------------------
@repo/core:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/core:lint:biome: >>> No modified files found to format.
@repo/core:lint:biome: 
@repo/core:lint:biome: --------------------------------------------------------------------------------
@repo/core:lint:biome: REPORT SUMMARY
@repo/core:lint:biome: Duration: 2.6 seconds
@repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/core:lint:biome: Raw Log:  C:\x\reports\run-packages_core-lint_biome.log
@repo/core:lint:biome: Report:   C:\x\reports\run-packages_core-lint_biome-report.txt
@repo/core:lint:biome: --------------------------------------------------------------------------------

@intuitui-labs/lk-edu-geo:lint:biome: cache hit, replaying logs 4976b44f35d429d6

@intuitui-labs/lk-edu-geo:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_lk-edu-geo-lint_biome"
@intuitui-labs/lk-edu-geo:lint:biome: >>> Starting Process: 8/24/2026, 6:25:44 PM (IST)
@intuitui-labs/lk-edu-geo:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@intuitui-labs/lk-edu-geo:lint:biome: >>> Working Dir: C:\x\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:lint:biome: >>> Log output: C:\x\reports\run-packages_lk-edu-geo-lint_biome.log
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@intuitui-labs/lk-edu-geo:lint:biome: >>> No modified files found to format.
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:lint:biome: REPORT SUMMARY
@intuitui-labs/lk-edu-geo:lint:biome: Duration: 4.0 seconds
@intuitui-labs/lk-edu-geo:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@intuitui-labs/lk-edu-geo:lint:biome: Raw Log:  C:\x\reports\run-packages_lk-edu-geo-lint_biome.log
@intuitui-labs/lk-edu-geo:lint:biome: Report:   C:\x\reports\run-packages_lk-edu-geo-lint_biome-report.txt
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------

@repo/self:lint:biome: cache hit, replaying logs 037c5805041a0664

@repo/self:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_self-lint_biome"
@repo/self:lint:biome: >>> Starting Process: 8/24/2026, 6:25:52 PM (IST)
@repo/self:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/self:lint:biome: >>> Working Dir: C:\x\packages\self

@repo/self:lint:biome: >>> Log output: C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: >>> No modified files found to format.
@repo/self:lint:biome: 
@repo/self:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: REPORT SUMMARY
@repo/self:lint:biome: Duration: 3.5 seconds
@repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/self:lint:biome: Raw Log:  C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: Report:   C:\x\reports\run-packages_self-lint_biome-report.txt
@repo/self:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: cache hit, replaying logs 2cbab486c6233e32

@repo/workforce:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_workforce-lint_biome"
@repo/workforce:lint:biome: >>> Starting Process: 8/24/2026, 6:25:52 PM (IST)
@repo/workforce:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/workforce:lint:biome: >>> Working Dir: C:\x\packages\workforce
@repo/workforce:lint:biome: >>> Log output: C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/workforce:lint:biome: >>> No modified files found to format.
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: --------------------------------------------------------------------------------
@repo/workforce:lint:biome: REPORT SUMMARY
@repo/workforce:lint:biome: Duration: 3.6 seconds
@repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/workforce:lint:biome: Raw Log:  C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: Report:   C:\x\reports\run-packages_workforce-lint_biome-report.txt
@repo/workforce:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: cache hit, replaying logs 3b3a503de8ea0e76

gurudevi-mobile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-mobile-lint_biome"
gurudevi-mobile:lint:biome: >>> Starting Process: 8/24/2026, 6:26:00 PM (IST)
gurudevi-mobile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
gurudevi-mobile:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-mobile

gurudevi-mobile:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------
gurudevi-mobile:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
gurudevi-mobile:lint:biome: >>> No modified files found to format.
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------
gurudevi-mobile:lint:biome: REPORT SUMMARY
gurudevi-mobile:lint:biome: Duration: 2.6 seconds
gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
gurudevi-mobile:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-mobile-lint_biome-report.txt
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------

@repo/classroom:lint:biome: cache hit, replaying logs 2b304cdb5544052e

@repo/types-shim:lint:biome: cache hit, replaying logs 7ab07878c48cdbe0

@repo/classroom:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_classroom-lint_biome"
@repo/classroom:lint:biome: >>> Starting Process: 8/24/2026, 6:25:44 PM (IST)
@repo/classroom:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/classroom:lint:biome: >>> Working Dir: C:\x\packages\classroom
@repo/classroom:lint:biome: >>> Log output: C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: >>> No modified files found to format.
@repo/classroom:lint:biome: 
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: REPORT SUMMARY
@repo/classroom:lint:biome: Duration: 3.8 seconds
@repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/classroom:lint:biome: Raw Log:  C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: Report:   C:\x\reports\run-packages_classroom-lint_biome-report.txt
@repo/classroom:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"
@repo/types-shim:lint:biome: >>> Starting Process: 8/24/2026, 6:25:52 PM (IST)
@repo/types-shim:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/types-shim:lint:biome: >>> Working Dir: C:\x\packages\types-shim

@repo/types-shim:lint:biome: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: >>> No modified files found to format.
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:biome: REPORT SUMMARY
@repo/types-shim:lint:biome: Duration: 3.9 seconds
@repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint:biome: Raw Log:  C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: Report:   C:\x\reports\run-packages_types-shim-lint_biome-report.txt
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: cache hit, replaying logs 1b9a7845b96d1491

@repo/people:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_people-lint_biome"
@repo/people:lint:biome: >>> Starting Process: 8/24/2026, 6:25:54 PM (IST)
@repo/people:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/people:lint:biome: >>> Working Dir: C:\x\packages\people

@repo/people:lint:biome: >>> Log output: C:\x\reports\run-packages_people-lint_biome.log
@repo/people:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/people:lint:biome: >>> No modified files found to format.
@repo/people:lint:biome: 
@repo/people:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: REPORT SUMMARY
@repo/people:lint:biome: Duration: 3.4 seconds
@repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/people:lint:biome: Raw Log:  C:\x\reports\run-packages_people-lint_biome.log
@repo/people:lint:biome: Report:   C:\x\reports\run-packages_people-lint_biome-report.txt
@repo/people:lint:biome: --------------------------------------------------------------------------------

@repo/admin:lint:biome: cache hit, replaying logs 7912f0146707b5b1

@repo/admin:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_admin-lint_biome"
@repo/admin:lint:biome: >>> Starting Process: 8/24/2026, 6:25:44 PM (IST)
@repo/admin:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/admin:lint:biome: >>> Working Dir: C:\x\packages\admin
@repo/admin:lint:biome: >>> Log output: C:\x\reports\run-packages_admin-lint_biome.log
@repo/admin:lint:biome: --------------------------------------------------------------------------------
@repo/admin:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/admin:lint:biome: >>> No modified files found to format.
@repo/admin:lint:biome: 
@repo/admin:lint:biome: --------------------------------------------------------------------------------
@repo/admin:lint:biome: REPORT SUMMARY
@repo/admin:lint:biome: Duration: 4.0 seconds
@repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/admin:lint:biome: Raw Log:  C:\x\reports\run-packages_admin-lint_biome.log
@repo/admin:lint:biome: Report:   C:\x\reports\run-packages_admin-lint_biome-report.txt
@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: cache hit, replaying logs b271cf51cb488209

@repo/payments:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_payments-lint_biome"
@repo/payments:lint:biome: >>> Starting Process: 8/24/2026, 6:25:59 PM (IST)
@repo/payments:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/payments:lint:biome: >>> Working Dir: C:\x\packages\payments

@repo/payments:lint:biome: >>> Log output: C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: --------------------------------------------------------------------------------
@repo/payments:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/payments:lint:biome: >>> No modified files found to format.
@repo/payments:lint:biome: 
@repo/payments:lint:biome: --------------------------------------------------------------------------------
@repo/payments:lint:biome: REPORT SUMMARY
@repo/payments:lint:biome: Duration: 2.7 seconds
@repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/payments:lint:biome: Raw Log:  C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: Report:   C:\x\reports\run-packages_payments-lint_biome-report.txt
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: cache hit, replaying logs 94feb2247fba8cc6

@repo/platform-mcp:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"
@repo/platform-mcp:lint:biome: >>> Starting Process: 8/24/2026, 6:25:45 PM (IST)
@repo/platform-mcp:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/platform-mcp:lint:biome: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:biome: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------
@repo/platform-mcp:lint:biome: warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
@repo/platform-mcp:lint:biome: >>> No modified files found to format.
@repo/platform-mcp:lint:biome: 
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------
@repo/platform-mcp:lint:biome: REPORT SUMMARY
@repo/platform-mcp:lint:biome: Duration: 3.6 seconds
@repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/platform-mcp:lint:biome: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:biome: Report:   C:\x\reports\run-packages_platform-mcp-lint_biome-report.txt
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: cache miss, executing fc64d4ac7f326973

apps-edlove-web:lint:eslint: cache miss, executing c5888b534547ecaf

@repo/types-shim:lint:eslint: cache hit, replaying logs c087f4220392a467

@repo/types-shim:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_types-shim-lint_eslint"
@repo/types-shim:lint:eslint: >>> Starting Process: 8/24/2026, 6:26:00 PM (IST)
@repo/types-shim:lint:eslint: >>> Command: eslint .
@repo/types-shim:lint:eslint: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint:eslint: >>> Log output: C:\x\reports\run-packages_types-shim-lint_eslint.log
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: C:\x\packages\types-shim\index.d.ts
@repo/types-shim:lint:eslint:   49:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   50:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   54:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

@repo/types-shim:lint:eslint:   55:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   56:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   57:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   58:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   59:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   63:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint:   63:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: ✖ 10 problems (0 errors, 10 warnings)
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------
@repo/types-shim:lint:eslint: REPORT SUMMARY
@repo/types-shim:lint:eslint: Duration: 76.0 seconds
@repo/types-shim:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint:eslint: Raw Log:  C:\x\reports\run-packages_types-shim-lint_eslint.log
@repo/types-shim:lint:eslint: Report:   C:\x\reports\run-packages_types-shim-lint_eslint-report.txt
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------

@repo/database:lint:eslint: cache miss, executing 379a0eb667141010

@repo/types-shim:lint: cache miss, executing 37a07c143aa104b7

@repo/platform-mcp:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_platform-mcp-lint_eslint"

apps-edlove-web:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_edlove-web-lint_eslint"

@repo/database:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_database-lint_eslint"

@repo/types-shim:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "packages_types-shim-lint"

@repo/platform-mcp:lint:eslint: >>> Starting Process: 8/24/2026, 6:28:15 PM (IST)

@repo/platform-mcp:lint:eslint: >>> Command: eslint .

@repo/platform-mcp:lint:eslint: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:eslint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

apps-edlove-web:lint:eslint: >>> Starting Process: 8/24/2026, 6:28:15 PM (IST)
@repo/database:lint:eslint: >>> Starting Process: 8/24/2026, 6:28:15 PM (IST)

apps-edlove-web:lint:eslint: >>> Command: eslint .
apps-edlove-web:lint:eslint: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint:eslint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_eslint.log

apps-edlove-web:lint:eslint: --------------------------------------------------------------------------------

@repo/database:lint:eslint: >>> Command: eslint .
@repo/database:lint:eslint: >>> Working Dir: C:\x\packages\database
@repo/database:lint:eslint: >>> Log output: C:\x\reports\run-packages_database-lint_eslint.log

@repo/database:lint:eslint: --------------------------------------------------------------------------------

@repo/types-shim:lint: >>> Starting Process: 8/24/2026, 6:28:15 PM (IST)

@repo/types-shim:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint

@repo/types-shim:lint: >>> Working Dir: C:\x\packages\types-shim

@repo/types-shim:lint: >>> Log output: C:\x\reports\run-packages_types-shim-lint.log
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: At line:1 char:79

@repo/types-shim:lint: + ... coding = [System.Text.Encoding]::UTF8; pnpm run lint:biome && pnpm ru ...

@repo/types-shim:lint: +                                                                ~~

@repo/types-shim:lint: The token '&&' is not a valid statement separator in this version.

@repo/types-shim:lint:     + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException

@repo/types-shim:lint:     + FullyQualifiedErrorId : InvalidEndOfLine

@repo/types-shim:lint:  

@repo/types-shim:lint: 

@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: REPORT SUMMARY

@repo/types-shim:lint: Duration: 1.1 seconds

@repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint: Raw Log:  C:\x\reports\run-packages_types-shim-lint.log
@repo/types-shim:lint: Report:   C:\x\reports\run-packages_types-shim-lint-report.txt
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: [ELIFECYCLE] Command failed with exit code 1.

@repo/types-shim#lint:  ERROR  command (C:\x\packages\types-shim) C:\Users\Naween\AppData\Local\pnpm\store\v11\links\@pnpm\exe\11.21.0\dcd072db88e14f72468d3f8dd15307bb909a66d80cf3479a9fcbe866632bbfc3\bin\pnpm.CMD run lint exited (1)


 Tasks:    25 successful, 29 total
Cached:    25 cached, 29 total

  Time:    4.256s 

Failed:    @repo/types-shim#lint



 ERROR  run failed: command  exited (1)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 6.6 seconds
Findings: 1 (Errors: 1, Warnings: 0)

Raw Log:  C:\x\reports\run-package_json-lint.log

Report:   C:\x\reports\run-package_json-lint-report.txt

--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
