# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 9/8/2026, 9:00:12 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 38.3s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 34 |

## Detailed Findings

### Category: General
- @repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @intuitui-labs/lk-edu-geo:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/editorial:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
- @repo/types-shim:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
- @repo/database:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
- @repo/platform-mcp:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
- @repo/database:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)
- @repo/types-shim:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)
- @repo/platform-mcp:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)
- @repo/editorial#lint:eslint:  ERROR  command (C:\x\packages\editorial) C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2\pnpm.cmd run lint:eslint exited (2)
- ERROR  run failed: command  exited (2)
- Findings: 1 (Errors: 1, Warnings: 0)

## Raw Output

```text
$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint" --name "package_json-lint"

>>> Starting Process: 9/8/2026, 8:59:40 PM (IST)

>>> Command: pnpm turbo run lint
>>> Working Dir: C:\x
>>> Log output: C:\x\reports\run-package_json-lint.log
--------------------------------------------------------------------------------

• turbo 2.10.12


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/editorial, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile, oxlint-plugin-polymath

   • Running lint in 32 packages
   • Remote caching disabled


@repo/community:lint:biome: cache miss, executing eec7537f8c3b3ef2

@repo/types-shim:lint:biome: cache miss, executing 13636f71f08db68a
@repo/editorial:lint:biome: cache miss, executing ea043e3f849e3f3b
@repo/library:lint:biome: cache miss, executing f3e02ebe13d84a03
@repo/workforce:lint:biome: cache miss, executing a587d1ae57bfde9d

apps-gurudevi-marketing-web:lint:biome: cache miss, executing 95daac13ba876e90
@repo/analytics:lint:biome: cache miss, executing 17ffb0a5222a3ed0

@repo/people:lint:biome: cache miss, executing f987eec454fd2ed1

@repo/database:lint:biome: cache miss, executing 72a6bfa173685a7a

@repo/ui:lint:biome: cache miss, executing 585e24547ceb44b1

@repo/community:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_community-lint_biome"

@repo/types-shim:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"

@repo/editorial:lint:biome: $ biome check src

@repo/community:lint:biome: >>> Starting Process: 9/8/2026, 8:59:44 PM (IST)

@repo/community:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/community:lint:biome: >>> Working Dir: C:\x\packages\community
@repo/community:lint:biome: >>> Log output: C:\x\reports\run-packages_community-lint_biome.log

@repo/community:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_workforce-lint_biome"

@repo/library:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_library-lint_biome"

apps-gurudevi-marketing-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"

@repo/types-shim:lint:biome: >>> Starting Process: 9/8/2026, 8:59:44 PM (IST)

@repo/types-shim:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/types-shim:lint:biome: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint:biome: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: >>> Starting Process: 9/8/2026, 8:59:44 PM (IST)

@repo/workforce:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/workforce:lint:biome: >>> Working Dir: C:\x\packages\workforce
@repo/workforce:lint:biome: >>> Log output: C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: --------------------------------------------------------------------------------

@repo/analytics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_analytics-lint_biome"

@repo/library:lint:biome: >>> Starting Process: 9/8/2026, 8:59:44 PM (IST)

@repo/library:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/library:lint:biome: >>> Working Dir: C:\x\packages\library

@repo/library:lint:biome: >>> Log output: C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: --------------------------------------------------------------------------------

@repo/editorial:lint:biome: Checked 5 files in 155ms. No fixes applied.

@repo/ui:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ui-lint_biome"

@repo/database:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_database-lint_biome"

@repo/people:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_people-lint_biome"

apps-gurudevi-marketing-web:lint:biome: >>> Starting Process: 9/8/2026, 8:59:45 PM (IST)

apps-gurudevi-marketing-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

apps-gurudevi-marketing-web:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: cache miss, executing 552b6683a52aae61

@repo/analytics:lint:biome: >>> Starting Process: 9/8/2026, 8:59:45 PM (IST)

@repo/analytics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/analytics:lint:biome: >>> Working Dir: C:\x\packages\analytics
@repo/analytics:lint:biome: >>> Log output: C:\x\reports\run-packages_analytics-lint_biome.log

@repo/analytics:lint:biome: --------------------------------------------------------------------------------

@repo/ui:lint:biome: >>> Starting Process: 9/8/2026, 8:59:45 PM (IST)

@repo/ui:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/ui:lint:biome: >>> Working Dir: C:\x\packages\ui

@repo/ui:lint:biome: >>> Log output: C:\x\reports\run-packages_ui-lint_biome.log

@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:biome: >>> Starting Process: 9/8/2026, 8:59:45 PM (IST)

@repo/database:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/database:lint:biome: >>> Working Dir: C:\x\packages\database
@repo/database:lint:biome: >>> Log output: C:\x\reports\run-packages_database-lint_biome.log

@repo/database:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: >>> Starting Process: 9/8/2026, 8:59:45 PM (IST)

@repo/people:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/people:lint:biome: >>> Working Dir: C:\x\packages\people

@repo/people:lint:biome: >>> Log output: C:\x\reports\run-packages_people-lint_biome.log

@repo/people:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_form-builder-lint_biome"

@repo/form-builder:lint:biome: >>> Starting Process: 9/8/2026, 8:59:46 PM (IST)

@repo/form-builder:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/form-builder:lint:biome: >>> Working Dir: C:\x\packages\form-builder

@repo/form-builder:lint:biome: >>> Log output: C:\x\reports\run-packages_form-builder-lint_biome.log

@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:biome: >>> No modified files found to format.

@repo/community:lint:biome: >>> No modified files found to format.

@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:biome: REPORT SUMMARY

@repo/types-shim:lint:biome: Duration: 2.7 seconds
@repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/types-shim:lint:biome: Raw Log:  C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: Report:   C:\x\reports\run-packages_types-shim-lint_biome-report.txt
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/community:lint:biome: 
@repo/community:lint:biome: --------------------------------------------------------------------------------

@repo/community:lint:biome: REPORT SUMMARY
@repo/community:lint:biome: Duration: 3.0 seconds

@repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/community:lint:biome: Raw Log:  C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: Report:   C:\x\reports\run-packages_community-lint_biome-report.txt
@repo/community:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: >>> No modified files found to format.

@repo/library:lint:biome: >>> No modified files found to format.

@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: REPORT SUMMARY
@repo/workforce:lint:biome: Duration: 2.9 seconds

@repo/library:lint:biome: 
@repo/library:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/library:lint:biome: REPORT SUMMARY

@repo/library:lint:biome: Duration: 2.8 seconds

@repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/library:lint:biome: Raw Log:  C:\x\reports\run-packages_library-lint_biome.log

@repo/workforce:lint:biome: Raw Log:  C:\x\reports\run-packages_workforce-lint_biome.log
@repo/library:lint:biome: Report:   C:\x\reports\run-packages_library-lint_biome-report.txt
@repo/library:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: Report:   C:\x\reports\run-packages_workforce-lint_biome-report.txt

@repo/workforce:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: cache miss, executing 1ecc50d55a770e21

@repo/accounting:lint:biome: cache miss, executing 391f6fad428de83c

apps-gurudevi-marketing-web:lint:biome: >>> No modified files found to format.

@repo/self:lint:biome: cache miss, executing 144cd3661ef393d5

@repo/admin:lint:biome: cache miss, executing ef314c488185d04e

@repo/database:lint:biome: >>> No modified files found to format.

@repo/ui:lint:biome: >>> No modified files found to format.

@repo/analytics:lint:biome: >>> No modified files found to format.

apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:biome: REPORT SUMMARY

apps-gurudevi-marketing-web:lint:biome: Duration: 3.1 seconds

apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log

apps-gurudevi-marketing-web:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome-report.txt
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: >>> No modified files found to format.

@repo/database:lint:biome: 

@repo/database:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:biome: REPORT SUMMARY
@repo/database:lint:biome: Duration: 3.0 seconds
@repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/database:lint:biome: Raw Log:  C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint:biome: Report:   C:\x\reports\run-packages_database-lint_biome-report.txt
@repo/database:lint:biome: --------------------------------------------------------------------------------

@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: --------------------------------------------------------------------------------

@repo/analytics:lint:biome: REPORT SUMMARY

@repo/analytics:lint:biome: Duration: 3.1 seconds

@repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/analytics:lint:biome: Raw Log:  C:\x\reports\run-packages_analytics-lint_biome.log

@repo/analytics:lint:biome: Report:   C:\x\reports\run-packages_analytics-lint_biome-report.txt

@repo/analytics:lint:biome: --------------------------------------------------------------------------------

@repo/ui:lint:biome: 
@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/ui:lint:biome: REPORT SUMMARY

@repo/ui:lint:biome: Duration: 3.1 seconds

@repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/ui:lint:biome: Raw Log:  C:\x\reports\run-packages_ui-lint_biome.log

@repo/ui:lint:biome: Report:   C:\x\reports\run-packages_ui-lint_biome-report.txt
@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: 
@repo/people:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: REPORT SUMMARY
@repo/people:lint:biome: Duration: 3.2 seconds

@repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/people:lint:biome: Raw Log:  C:\x\reports\run-packages_people-lint_biome.log

@repo/people:lint:biome: Report:   C:\x\reports\run-packages_people-lint_biome-report.txt
@repo/people:lint:biome: --------------------------------------------------------------------------------

@repo/accounting:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_accounting-lint_biome"

@repo/platform-mcp:lint:biome: cache miss, executing 3712d808736261a0

@repo/ai:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ai-lint_biome"

@repo/profile:lint:biome: cache miss, executing 476d791de30c7f7a

@repo/graphics:lint:biome: cache miss, executing 19562ad5c69fe4d4

gurudevi-mobile:lint:biome: cache miss, executing 2a0a09d214ffe8f3

@repo/self:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_self-lint_biome"

@repo/payments:lint:biome: cache miss, executing 2d00a5620c4d39a4

@repo/accounting:lint:biome: >>> Starting Process: 9/8/2026, 8:59:49 PM (IST)

@repo/accounting:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/accounting:lint:biome: >>> Working Dir: C:\x\packages\accounting
@repo/accounting:lint:biome: >>> Log output: C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: --------------------------------------------------------------------------------

@repo/admin:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_admin-lint_biome"

@repo/ai:lint:biome: >>> Starting Process: 9/8/2026, 8:59:49 PM (IST)

@repo/ai:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/ai:lint:biome: >>> Working Dir: C:\x\packages\ai

@repo/ai:lint:biome: >>> Log output: C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: --------------------------------------------------------------------------------

@repo/self:lint:biome: >>> Starting Process: 9/8/2026, 8:59:49 PM (IST)

@repo/self:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/self:lint:biome: >>> Working Dir: C:\x\packages\self
@repo/self:lint:biome: >>> Log output: C:\x\reports\run-packages_self-lint_biome.log

@repo/self:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: >>> No modified files found to format.

@repo/platform-mcp:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"

@repo/profile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_profile-lint_biome"

@repo/admin:lint:biome: >>> Starting Process: 9/8/2026, 8:59:49 PM (IST)

@repo/admin:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/admin:lint:biome: >>> Working Dir: C:\x\packages\admin
@repo/admin:lint:biome: >>> Log output: C:\x\reports\run-packages_admin-lint_biome.log

@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: 
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: REPORT SUMMARY

@repo/form-builder:lint:biome: Duration: 3.0 seconds

@repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/form-builder:lint:biome: Raw Log:  C:\x\reports\run-packages_form-builder-lint_biome.log

@repo/form-builder:lint:biome: Report:   C:\x\reports\run-packages_form-builder-lint_biome-report.txt
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_graphics-lint_biome"

gurudevi-mobile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-mobile-lint_biome"

@repo/platform-mcp:lint:biome: >>> Starting Process: 9/8/2026, 8:59:49 PM (IST)

@repo/platform-mcp:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/platform-mcp:lint:biome: >>> Working Dir: C:\x\packages\platform-mcp

@repo/platform-mcp:lint:biome: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log

@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_payments-lint_biome"

@repo/scanner-kit:lint:biome: cache miss, executing 8956820d4434a1cb

@repo/profile:lint:biome: >>> Starting Process: 9/8/2026, 8:59:50 PM (IST)

@repo/profile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/profile:lint:biome: >>> Working Dir: C:\x\packages\profile

@repo/profile:lint:biome: >>> Log output: C:\x\reports\run-packages_profile-lint_biome.log

@repo/profile:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: >>> Starting Process: 9/8/2026, 8:59:50 PM (IST)

@repo/graphics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/graphics:lint:biome: >>> Working Dir: C:\x\packages\graphics
@repo/graphics:lint:biome: >>> Log output: C:\x\reports\run-packages_graphics-lint_biome.log
@repo/graphics:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: >>> Starting Process: 9/8/2026, 8:59:50 PM (IST)

gurudevi-mobile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

gurudevi-mobile:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-mobile
gurudevi-mobile:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: >>> Starting Process: 9/8/2026, 8:59:50 PM (IST)

@repo/payments:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/payments:lint:biome: >>> Working Dir: C:\x\packages\payments
@repo/payments:lint:biome: >>> Log output: C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/scanner-kit:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_scanner-kit-lint_biome"

@repo/accounting:lint:biome: >>> No modified files found to format.

@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: --------------------------------------------------------------------------------

@repo/accounting:lint:biome: REPORT SUMMARY
@repo/accounting:lint:biome: Duration: 2.7 seconds
@repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/accounting:lint:biome: Raw Log:  C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: Report:   C:\x\reports\run-packages_accounting-lint_biome-report.txt
@repo/accounting:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: >>> No modified files found to format.

@repo/scanner-kit:lint:biome: >>> Starting Process: 9/8/2026, 8:59:51 PM (IST)

@repo/scanner-kit:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/scanner-kit:lint:biome: >>> Working Dir: C:\x\packages\scanner-kit
@repo/scanner-kit:lint:biome: >>> Log output: C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: 
@repo/ai:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: REPORT SUMMARY
@repo/ai:lint:biome: Duration: 2.7 seconds
@repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/ai:lint:biome: Raw Log:  C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: Report:   C:\x\reports\run-packages_ai-lint_biome-report.txt
@repo/ai:lint:biome: --------------------------------------------------------------------------------

@repo/self:lint:biome: >>> No modified files found to format.

@intuitui-labs/lk-edu-geo:lint:biome: cache miss, executing 3beeb6c03ec6f403

@repo/platform-mcp:lint:biome: >>> No modified files found to format.

@repo/admin:lint:biome: >>> No modified files found to format.

apps-edlove-web:lint:biome: cache miss, executing 33a7ab0bc0758148

@repo/self:lint:biome: 
@repo/self:lint:biome: --------------------------------------------------------------------------------

@repo/self:lint:biome: REPORT SUMMARY
@repo/self:lint:biome: Duration: 3.1 seconds

@repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/self:lint:biome: Raw Log:  C:\x\reports\run-packages_self-lint_biome.log

@repo/self:lint:biome: Report:   C:\x\reports\run-packages_self-lint_biome-report.txt
@repo/self:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: 
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: REPORT SUMMARY

@repo/platform-mcp:lint:biome: Duration: 2.7 seconds
@repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/platform-mcp:lint:biome: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:biome: Report:   C:\x\reports\run-packages_platform-mcp-lint_biome-report.txt
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/admin:lint:biome: 

@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/admin:lint:biome: REPORT SUMMARY
@repo/admin:lint:biome: Duration: 3.0 seconds
@repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/admin:lint:biome: Raw Log:  C:\x\reports\run-packages_admin-lint_biome.log
@repo/admin:lint:biome: Report:   C:\x\reports\run-packages_admin-lint_biome-report.txt

@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: cache miss, executing bda2c427b80ae736

@repo/graphics:lint:biome: >>> No modified files found to format.

@repo/classroom:lint:biome: cache miss, executing 314c699c9999b2a0

@repo/editorial:lint:eslint: cache miss, executing 58866ab3286c7ae9

@intuitui-labs/lk-edu-geo:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_lk-edu-geo-lint_biome"

@repo/profile:lint:biome: >>> No modified files found to format.

@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: REPORT SUMMARY
@repo/graphics:lint:biome: Duration: 3.3 seconds
@repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/graphics:lint:biome: Raw Log:  C:\x\reports\run-packages_graphics-lint_biome.log
@repo/graphics:lint:biome: Report:   C:\x\reports\run-packages_graphics-lint_biome-report.txt

@repo/graphics:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: >>> No modified files found to format.

@repo/profile:lint:biome: 
@repo/profile:lint:biome: --------------------------------------------------------------------------------

@repo/profile:lint:biome: REPORT SUMMARY

@repo/profile:lint:biome: Duration: 3.6 seconds

@repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/profile:lint:biome: Raw Log:  C:\x\reports\run-packages_profile-lint_biome.log

@repo/profile:lint:biome: Report:   C:\x\reports\run-packages_profile-lint_biome-report.txt
@repo/profile:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: >>> No modified files found to format.

@intuitui-labs/lk-edu-geo:lint:biome: >>> Starting Process: 9/8/2026, 8:59:53 PM (IST)

@intuitui-labs/lk-edu-geo:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@intuitui-labs/lk-edu-geo:lint:biome: >>> Working Dir: C:\x\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:lint:biome: >>> Log output: C:\x\reports\run-packages_lk-edu-geo-lint_biome.log
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: REPORT SUMMARY

gurudevi-mobile:lint:biome: Duration: 3.5 seconds

gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
gurudevi-mobile:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log

gurudevi-mobile:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-mobile-lint_biome-report.txt
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------

apps-edlove-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_edlove-web-lint_biome"

@repo/payments:lint:biome: 

@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: REPORT SUMMARY
@repo/payments:lint:biome: Duration: 3.4 seconds
@repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/payments:lint:biome: Raw Log:  C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: Report:   C:\x\reports\run-packages_payments-lint_biome-report.txt
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:eslint: cache miss, executing 666c89716e769357

@repo/platform-mcp:lint:eslint: cache miss, executing 023b68d1faffc9dd

@repo/core:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_core-lint_biome"

@repo/database:lint:eslint: cache miss, executing eeaa572ab76b9c01

@repo/editorial:lint:eslint: $ eslint src

apps-edlove-web:lint:biome: >>> Starting Process: 9/8/2026, 8:59:54 PM (IST)

apps-edlove-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

apps-edlove-web:lint:biome: >>> Working Dir: C:\x\apps\edlove-web

apps-edlove-web:lint:biome: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------

@repo/classroom:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_classroom-lint_biome"

@repo/core:lint:biome: >>> Starting Process: 9/8/2026, 8:59:54 PM (IST)

@repo/core:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/core:lint:biome: >>> Working Dir: C:\x\packages\core

@repo/core:lint:biome: >>> Log output: C:\x\reports\run-packages_core-lint_biome.log

@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_types-shim-lint_eslint"

@repo/scanner-kit:lint:biome: >>> No modified files found to format.

@repo/classroom:lint:biome: >>> Starting Process: 9/8/2026, 8:59:54 PM (IST)

@repo/classroom:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/classroom:lint:biome: >>> Working Dir: C:\x\packages\classroom

@repo/classroom:lint:biome: >>> Log output: C:\x\reports\run-packages_classroom-lint_biome.log

@repo/classroom:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_database-lint_eslint"

@repo/types-shim:lint:eslint: >>> Starting Process: 9/8/2026, 8:59:55 PM (IST)

@repo/types-shim:lint:eslint: >>> Command: eslint .

@repo/types-shim:lint:eslint: >>> Working Dir: C:\x\packages\types-shim

@repo/types-shim:lint:eslint: >>> Log output: C:\x\reports\run-packages_types-shim-lint_eslint.log
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------

@repo/scanner-kit:lint:biome: 
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------

@repo/scanner-kit:lint:biome: REPORT SUMMARY

@repo/scanner-kit:lint:biome: Duration: 3.4 seconds
@repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/scanner-kit:lint:biome: Raw Log:  C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: Report:   C:\x\reports\run-packages_scanner-kit-lint_biome-report.txt
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_platform-mcp-lint_eslint"

@repo/database:lint:eslint: >>> Starting Process: 9/8/2026, 8:59:55 PM (IST)

@repo/database:lint:eslint: >>> Command: eslint .
@repo/database:lint:eslint: >>> Working Dir: C:\x\packages\database
@repo/database:lint:eslint: >>> Log output: C:\x\reports\run-packages_database-lint_eslint.log
@repo/database:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: >>> Starting Process: 9/8/2026, 8:59:55 PM (IST)

@repo/platform-mcp:lint:eslint: >>> Command: eslint .

@repo/platform-mcp:lint:eslint: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:eslint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@intuitui-labs/lk-edu-geo:lint:biome: >>> No modified files found to format.

@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------

@intuitui-labs/lk-edu-geo:lint:biome: REPORT SUMMARY
@intuitui-labs/lk-edu-geo:lint:biome: Duration: 2.8 seconds

@intuitui-labs/lk-edu-geo:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@intuitui-labs/lk-edu-geo:lint:biome: Raw Log:  C:\x\reports\run-packages_lk-edu-geo-lint_biome.log
@intuitui-labs/lk-edu-geo:lint:biome: Report:   C:\x\reports\run-packages_lk-edu-geo-lint_biome-report.txt
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------

apps-edlove-web:lint:biome: >>> No modified files found to format.

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------

apps-edlove-web:lint:biome: REPORT SUMMARY

apps-edlove-web:lint:biome: Duration: 2.7 seconds

apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

apps-edlove-web:lint:biome: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_biome.log

apps-edlove-web:lint:biome: Report:   C:\x\reports\run-apps_edlove-web-lint_biome-report.txt
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: >>> No modified files found to format.

@repo/classroom:lint:biome: >>> No modified files found to format.

@repo/core:lint:biome: 
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: REPORT SUMMARY

@repo/core:lint:biome: Duration: 2.8 seconds
@repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/core:lint:biome: Raw Log:  C:\x\reports\run-packages_core-lint_biome.log

@repo/core:lint:biome: Report:   C:\x\reports\run-packages_core-lint_biome-report.txt
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/classroom:lint:biome: 
@repo/classroom:lint:biome: --------------------------------------------------------------------------------

@repo/classroom:lint:biome: REPORT SUMMARY
@repo/classroom:lint:biome: Duration: 2.5 seconds
@repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/classroom:lint:biome: Raw Log:  C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: Report:   C:\x\reports\run-packages_classroom-lint_biome-report.txt
@repo/classroom:lint:biome: --------------------------------------------------------------------------------

@repo/editorial:lint:eslint: 

@repo/editorial:lint:eslint: Oops! Something went wrong! :(
@repo/editorial:lint:eslint: 
@repo/editorial:lint:eslint: ESLint: 10.10.0
@repo/editorial:lint:eslint: 
@repo/editorial:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
@repo/editorial:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\unrs-resolver@1.11.1\node_modules\unrs-resolver\index.js:376:11)
@repo/editorial:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1781:14)
@repo/editorial:lint:eslint:     at Object..js (node:internal/modules/cjs/loader:1913:10)
@repo/editorial:lint:eslint:     at Module.load (node:internal/modules/cjs/loader:1505:32)
@repo/editorial:lint:eslint:     at Function._load (node:internal/modules/cjs/loader:1309:12)
@repo/editorial:lint:eslint:     at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
@repo/editorial:lint:eslint:     at loadCJSModuleWithModuleLoad (node:internal/modules/esm/translators:335:3)
@repo/editorial:lint:eslint:     at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:235:7)
@repo/editorial:lint:eslint:     at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
@repo/editorial:lint:eslint:     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: Oops! Something went wrong! :(
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: ESLint: 10.10.0
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
@repo/types-shim:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\unrs-resolver@1.11.1\node_modules\unrs-resolver\index.js:376:11)
@repo/types-shim:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1781:14)
@repo/types-shim:lint:eslint:     at Object..js (node:internal/modules/cjs/loader:1913:10)
@repo/types-shim:lint:eslint:     at Module.load (node:internal/modules/cjs/loader:1505:32)
@repo/types-shim:lint:eslint:     at Function._load (node:internal/modules/cjs/loader:1309:12)
@repo/types-shim:lint:eslint:     at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
@repo/types-shim:lint:eslint:     at loadCJSModuleWithModuleLoad (node:internal/modules/esm/translators:335:3)
@repo/types-shim:lint:eslint:     at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:235:7)
@repo/types-shim:lint:eslint:     at ModuleJob.run (node:internal/modules/esm/module_job:343:25)

@repo/types-shim:lint:eslint:     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
@repo/database:lint:eslint: 

@repo/database:lint:eslint: Oops! Something went wrong! :(
@repo/database:lint:eslint: 
@repo/database:lint:eslint: ESLint: 10.10.0
@repo/database:lint:eslint: 
@repo/database:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
@repo/database:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\unrs-resolver@1.11.1\node_modules\unrs-resolver\index.js:376:11)
@repo/database:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1781:14)
@repo/database:lint:eslint:     at Object..js (node:internal/modules/cjs/loader:1913:10)
@repo/database:lint:eslint:     at Module.load (node:internal/modules/cjs/loader:1505:32)
@repo/database:lint:eslint:     at Function._load (node:internal/modules/cjs/loader:1309:12)
@repo/database:lint:eslint:     at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
@repo/database:lint:eslint:     at loadCJSModuleWithModuleLoad (node:internal/modules/esm/translators:335:3)
@repo/database:lint:eslint:     at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:235:7)
@repo/database:lint:eslint:     at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
@repo/database:lint:eslint:     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)

@repo/platform-mcp:lint:eslint: 

@repo/platform-mcp:lint:eslint: Oops! Something went wrong! :(
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: ESLint: 10.10.0
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
@repo/platform-mcp:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\unrs-resolver@1.11.1\node_modules\unrs-resolver\index.js:376:11)
@repo/platform-mcp:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1781:14)
@repo/platform-mcp:lint:eslint:     at Object..js (node:internal/modules/cjs/loader:1913:10)
@repo/platform-mcp:lint:eslint:     at Module.load (node:internal/modules/cjs/loader:1505:32)
@repo/platform-mcp:lint:eslint:     at Function._load (node:internal/modules/cjs/loader:1309:12)
@repo/platform-mcp:lint:eslint:     at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
@repo/platform-mcp:lint:eslint:     at loadCJSModuleWithModuleLoad (node:internal/modules/esm/translators:335:3)
@repo/platform-mcp:lint:eslint:     at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:235:7)
@repo/platform-mcp:lint:eslint:     at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
@repo/platform-mcp:lint:eslint:     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)

@repo/editorial:lint:eslint: [ELIFECYCLE] Command failed with exit code 2.

@repo/database:lint:eslint: 
@repo/database:lint:eslint: --------------------------------------------------------------------------------

@repo/database:lint:eslint: REPORT SUMMARY

@repo/database:lint:eslint: Duration: 16.5 seconds
@repo/database:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)

@repo/database:lint:eslint: Raw Log:  C:\x\reports\run-packages_database-lint_eslint.log

@repo/database:lint:eslint: Report:   C:\x\reports\run-packages_database-lint_eslint-report.txt

@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------

@repo/database:lint:eslint: --------------------------------------------------------------------------------

@repo/types-shim:lint:eslint: REPORT SUMMARY

@repo/types-shim:lint:eslint: Duration: 16.9 seconds
@repo/types-shim:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)
@repo/types-shim:lint:eslint: Raw Log:  C:\x\reports\run-packages_types-shim-lint_eslint.log
@repo/types-shim:lint:eslint: Report:   C:\x\reports\run-packages_types-shim-lint_eslint-report.txt
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: REPORT SUMMARY
@repo/platform-mcp:lint:eslint: Duration: 16.0 seconds
@repo/platform-mcp:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)
@repo/platform-mcp:lint:eslint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint:eslint: Report:   C:\x\reports\run-packages_platform-mcp-lint_eslint-report.txt

@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/types-shim:lint:eslint: [ELIFECYCLE] Command failed with exit code 1.

@repo/database:lint:eslint: [ELIFECYCLE] Command failed with exit code 1.

@repo/platform-mcp:lint:eslint: [ELIFECYCLE] Command failed with exit code 1.

@repo/editorial#lint:eslint:  ERROR  command (C:\x\packages\editorial) C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2\pnpm.cmd run lint:eslint exited (2)


 Tasks:    25 successful, 29 total
Cached:    0 cached, 29 total
  Time:    28.74s 

Failed:    @repo/editorial#lint:eslint


 ERROR  run failed: command  exited (2)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 31.3 seconds
Findings: 1 (Errors: 1, Warnings: 0)

Raw Log:  C:\x\reports\run-package_json-lint.log

Report:   C:\x\reports\run-package_json-lint-report.txt
--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
