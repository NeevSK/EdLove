# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 11/14/2026, 2:47:07 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 2.4s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 4 |

## Detailed Findings

### Category: General
- @repo/platform-mcp#lint:biome:  ERROR  command finished with error: Exec format error (os error 8)
- @repo/platform-mcp#lint:biome:  ERROR  unable to spawn child process: Exec format error (os error 8)
- ERROR  run failed: command  exited (1)
- Findings: 1 (Errors: 1, Warnings: 0)

## Raw Output

```text
$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint --concurrency=2" --name "package_json-lint"

>>> Starting Process: 11/14/2026, 8:17:05 AM (IST)

>>> Command: pnpm turbo run lint --concurrency=2
>>> Working Dir: /home/user/EdLove
>>> Log output: /home/user/EdLove/reports/run-package_json-lint.log
--------------------------------------------------------------------------------


Attention:
Turborepo now collects completely anonymous telemetry regarding usage.
This information is used to shape the Turborepo roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://turborepo.dev/docs/telemetry




   • turbo 2.11.10
   • Packages in scope: @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/editorial, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/verger-android, @repo/verger-core, @repo/verger-react, @repo/verger-react-native, @repo/verger-web, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile, gurudevi-web, oxlint-plugin-edlove
   • Running lint in 36 packages
   • Remote caching disabled


@repo/platform-mcp:lint:biome: cache miss, executing fa57d35270aa3f0e
@repo/ai:lint:biome: cache miss, executing 48568548ed818d7f

@repo/platform-mcp#lint:biome:  ERROR  command finished with error: Exec format error (os error 8)

apps-edlove-web:lint:biome: cache miss, executing 0629b2f39384c3fd
@repo/types-shim:lint:biome: cache miss, executing ff5a8d7e2f1b9a08

@repo/workforce:lint:biome: cache miss, executing 914f42d074e6a34c
@repo/library:lint:biome: cache miss, executing f5a8109c5bf60cfa

@repo/classroom:lint:biome: cache miss, executing 0e13c0c0f2afab5c
@repo/ui:lint:biome: cache miss, executing 83f044d0a338dcca

gurudevi-mobile:lint:biome: cache miss, executing 886f9ce3605f776a
@repo/payments:lint:biome: cache miss, executing 3fdded7593364cde

@repo/graphics:lint:biome: cache miss, executing 29eeba3e4e54146b

@repo/people:lint:biome: cache miss, executing b1f286ec15473b1f
@repo/form-builder:lint:biome: cache miss, executing 41c6e811f71cbf9b

@repo/admin:lint:biome: cache miss, executing 60c4d15c02db3d21

@repo/editorial:lint:biome: cache miss, executing 51aaca15af3dabc9
apps-gurudevi-marketing-web:lint:biome: cache miss, executing f9a275e0f6fe0f53

@repo/database:lint:biome: cache miss, executing f74dbf2a77f25575
@repo/scanner-kit:lint:biome: cache miss, executing 71c8986b53296ae7

gurudevi-web:lint:biome: cache miss, executing 03e9625b78eb3462
@repo/profile:lint:biome: cache miss, executing 521568687c75c9ec
@repo/community:lint:biome: cache miss, executing 18bc7f98f52c06a7

@repo/self:lint:biome: cache miss, executing a56e330e51e87355
@repo/core:lint:biome: cache miss, executing bc95d8fbaae349e5

@repo/analytics:lint:biome: cache miss, executing d7e6b29157d5881f
@repo/accounting:lint:biome: cache miss, executing 8449ad9b3d1d5021

@repo/platform-mcp#lint:biome:  ERROR  unable to spawn child process: Exec format error (os error 8)



 Tasks:    0 successful, 25 total
Cached:    0 cached, 25 total
  Time:    102ms 
Failed:    @repo/platform-mcp#lint:biome


 ERROR  run failed: command  exited (1)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 1.3 seconds
Findings: 1 (Errors: 1, Warnings: 0)
Raw Log:  /home/user/EdLove/reports/run-package_json-lint.log

Report:   /home/user/EdLove/reports/run-package_json-lint-report.txt
--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
