# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 9/4/2026, 8:11:15 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 84.2s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 1008 |
| packages/editorial | 69 |

## Detailed Findings

### Category: General
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ui:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/classroom:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/library:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/self:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/form-builder:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ai:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/graphics:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/profile:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/analytics:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint:eslint:      1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
- @repo/platform-mcp:lint:eslint:      4:41  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:      4:57  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:      4:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:      6:6   warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    290:15  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    329:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    343:42  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    409:17  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    463:21  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    472:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    480:20  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    491:25  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    501:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    505:44  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    507:21  warning  MCP_MODE is not listed as a dependency in turbo.json                                       turbo/no-undeclared-env-vars
- @repo/platform-mcp:lint:eslint:    551:22  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    554:27  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    639:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    641:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    642:79  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    643:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    645:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    647:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    649:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    653:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    655:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    656:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    657:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    659:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    660:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    661:72  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    663:76  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    706:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    708:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    710:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    712:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    714:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    716:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    718:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    720:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    722:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    724:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    726:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    736:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    738:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    740:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    742:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    744:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    781:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    785:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    787:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    789:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    791:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    793:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    795:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    797:74  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    799:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    803:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    805:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    807:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    813:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    815:75  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    897:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    917:52  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    948:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    960:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    975:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    987:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    998:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1009:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1029:51  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1041:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1052:53  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1063:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1074:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1085:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1099:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1111:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1123:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1136:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1175:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1213:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1233:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1244:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1282:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1311:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1331:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1360:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1372:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1383:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1394:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1406:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1419:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1433:14  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1452:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   1474:46  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   169:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   181:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   290:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    11:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   153:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   350:17  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    50:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   160:70  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   51:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:    13:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   104:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   114:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint:   168:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:eslint: ✖ 110 problems (0 errors, 110 warnings)
- @repo/platform-mcp:lint:eslint:   0 errors and 1 warning potentially fixable with the `--fix` option.
- @repo/platform-mcp:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint:eslint:    44:22  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   135:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   146:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   157:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   178:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   427:67  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:    1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
- apps-edlove-web:lint:eslint:   47:34  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   283:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   290:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   307:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   316:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   290:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   290:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   305:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint:   305:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:eslint: ✖ 16 problems (0 errors, 16 warnings)
- apps-edlove-web:lint:eslint:   0 errors and 1 warning potentially fixable with the `--fix` option.
- apps-edlove-web:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint:      1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
- @repo/platform-mcp:lint:      4:41  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:      4:57  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:      4:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:      6:6   warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    290:15  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    329:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    343:42  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    409:17  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    463:21  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    472:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    480:20  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    491:25  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    501:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    505:44  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    507:21  warning  MCP_MODE is not listed as a dependency in turbo.json                                       turbo/no-undeclared-env-vars
- @repo/platform-mcp:lint:    551:22  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    554:27  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    639:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    641:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    642:79  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    643:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    645:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    647:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    649:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    653:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    655:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    656:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    657:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    659:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    660:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    661:72  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    663:76  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    706:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    708:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    710:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    712:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    714:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    716:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    718:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    720:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    722:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    724:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    726:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    736:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    738:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    740:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    742:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    744:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    781:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    785:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    787:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    789:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    791:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    793:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    795:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    797:74  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    799:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    803:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    805:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    807:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    813:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    815:75  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    897:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    917:52  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    948:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    960:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    975:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    987:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    998:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1009:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1029:51  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1041:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1052:53  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1063:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1074:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1085:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1099:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1111:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1123:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1136:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1175:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1213:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1233:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1244:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1282:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1311:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1331:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1360:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1372:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1383:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1394:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1406:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1419:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1433:14  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1452:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   1474:46  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   169:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   181:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   290:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    11:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   153:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   350:17  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    50:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   160:70  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   51:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:    13:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   104:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   114:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint:   168:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/platform-mcp:lint: ✖ 110 problems (0 errors, 110 warnings)
- @repo/platform-mcp:lint:   0 errors and 1 warning potentially fixable with the `--fix` option.
- @repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint:    44:22  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   135:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   146:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   157:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   178:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   427:67  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:    1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
- apps-edlove-web:lint:   47:34  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   283:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   290:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   307:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   316:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   290:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   290:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   305:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint:   305:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- apps-edlove-web:lint: ✖ 16 problems (0 errors, 16 warnings)
- apps-edlove-web:lint:   0 errors and 1 warning potentially fixable with the `--fix` option.
- apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core:lint:eslint:   13:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead                                                                                  polymath/ban-use-store
- @repo/core:lint:eslint:   20:18  warning  Caution: `NetInfo` also has a named export `addEventListener`. Check if you meant to write `import {addEventListener} from '@react-native-community/netinfo'` instead  import-x/no-named-as-default-member
- @repo/core:lint:eslint:    9:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   12:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   29:9  warning  EXPO_PUBLIC_GROWTHBOOK_API_HOST is not listed as a dependency in turbo.json    turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   30:9  warning  NEXT_PUBLIC_GROWTHBOOK_API_HOST is not listed as a dependency in turbo.json    turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   34:9  warning  EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   35:9  warning  NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   8:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   26:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   7:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   18:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   10:25  warning  Caution: `NetInfo` also has a named export `fetch`. Check if you meant to write `import {fetch} from '@react-native-community/netinfo'` instead  import-x/no-named-as-default-member
- @repo/core:lint:eslint:   19:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   40:50  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    16:23  warning  EXPO_PUBLIC_POWERSYNC_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    66:9   error    'startTime' is never reassigned. Use 'const' instead                   prefer-const
- @repo/core:lint:eslint:    94:26  warning  Unexpected any. Specify a different type                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   104:32  warning  Unexpected any. Specify a different type                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   107:44  warning  Unexpected any. Specify a different type                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   34:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   166:86  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    68:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   112:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   25:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   25:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:     1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:     5:37  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    10:66  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    46:37  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    76:46  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    76:52  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    88:27  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    98:34  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   129:53  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   140:39  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   141:51  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   171:27  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   171:40  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   172:45  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   20:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   16:89  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   12:38  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:19  warning  EXPO_PUBLIC_SUPABASE_URL is not listed as a dependency in turbo.json              turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   23:3   warning  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   23:55  warning  SUPABASE_ANON_KEY is not listed as a dependency in turbo.json                     turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   39:61  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   62:24  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:     5:35  warning  'C:\x\packages\core\src\utils\effect.ts' imported multiple times                     import-x/no-duplicates
- @repo/core:lint:eslint:    14:28  warning  'C:\x\packages\core\src\utils\effect.ts' imported multiple times                     import-x/no-duplicates
- @repo/core:lint:eslint:    48:43  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   160:51  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   217:23  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   217:38  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   301:9   warning  Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   301:74  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   315:29  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   394:49  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   492:47  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   532:42  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   538:40  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   559:39  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   26:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   17:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    18:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    24:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    30:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    64:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    74:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    74:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    84:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    84:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    94:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    94:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   108:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   108:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   112:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   131:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   150:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   168:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   191:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   205:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   219:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   223:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   236:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   242:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   248:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   252:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   255:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   260:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   263:87  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   266:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   274:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    90:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   179:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   194:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   218:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   285:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   197:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    6:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    7:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   38:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   40:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   104:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   220:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   236:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   252:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    66:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   200:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   216:65  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    74:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   123:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   131:71  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   380:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   456:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   460:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   467:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    55:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    75:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    94:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   292:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   292:85  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   319:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   320:69  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   327:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   310:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   311:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   312:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   313:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   58:10  warning  Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   40:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    43:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   105:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   126:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   374:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   381:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   9:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   60:57  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   67:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    21:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    22:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    54:88  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   107:86  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    48:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    49:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    50:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   280:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   83:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   14:7   warning  EXPO_PUBLIC_API_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   14:42  warning  NEXT_PUBLIC_API_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   36:67  warning  Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   37:43  warning  Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   52:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:     3:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:    16:24  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    22:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    38:46  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    39:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    43:42  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    50:65  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    51:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    73:15  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    74:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    91:88  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    92:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   105:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   112:59  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   123:65  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   131:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   137:70  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   145:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   151:66  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   162:70  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   170:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   17:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   18:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   26:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   27:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   33:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   37:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   53:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   65:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   77:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   47:69  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   47:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   47:79  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    17:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    34:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    43:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    52:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    61:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    70:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    79:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    88:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    97:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   116:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   135:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   150:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   167:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   186:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   206:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   222:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   238:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   254:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   269:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   282:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   291:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   14:77  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:     1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:     9:48  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    44:89  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    96:17  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed    sonarjs/cognitive-complexity
- @repo/core:lint:eslint:    96:84  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   116:21  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   117:18  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   148:35  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   39:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   47:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   51:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   63:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   78:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   90:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   45:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    31:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    51:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    62:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    72:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    85:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   105:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   114:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   126:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   13:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   39:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   55:94  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   62:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   69:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   77:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   84:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    76:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    83:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   103:51  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   20:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   42:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   65:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   80:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   22:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   23:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   24:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   64:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    3:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   16:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   38:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   39:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    4:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    6:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   19:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:41  warning  Refactor this function to reduce its Cognitive Complexity from 30 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:    68:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   116:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   117:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   118:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    51:19  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    64:59  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    65:18  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    67:18  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    74:25  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    77:7   warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    78:9   warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    93:38  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    93:43  warning  Refactor this function to reduce its Cognitive Complexity from 27 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   231:19  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    24:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    25:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    81:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    95:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   111:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   126:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   143:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    20:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    22:52  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    57:88  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    87:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    89:80  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    90:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   141:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   4:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   89:85  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   199:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   28:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   36:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   52:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   53:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   60:93  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   61:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   68:54  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   69:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   141:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   27:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   43:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   13:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   19:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   29:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   46:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   12:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    55:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    69:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   185:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   219:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   230:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   299:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   357:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    28:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    50:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    74:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    86:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   100:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   180:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   45:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   78:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   11:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   23:59  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   29:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   46:20  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   49:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   69:20  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   72:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   13:51  warning  PUSH_DISPATCH_SECRET is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   14:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   17:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   20:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   3:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   8:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   110:51   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   133:117  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   35:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   51:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   64:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   73:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   84:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   13:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   14:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   15:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   40:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   40:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   27:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   62:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   89:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   15:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   34:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   49:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   13:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   11:43  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   19:3   warning  Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   2:38  warning  EXPO_PUBLIC_GURUDEVI_APP_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   861:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   53:17  warning  Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   110:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   110:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   155:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   155:70  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   86:88  warning  Refactor this function to reduce its Cognitive Complexity from 30 to the 15 allowed    sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   4:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:    9:17  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   12:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   30:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   34:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   54:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   71:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   95:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   14:50  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   12:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   33:67  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    79:58  warning  Refactor this function to reduce its Cognitive Complexity from 23 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:    99:15  error    Empty block statement                                                                no-empty
- @repo/core:lint:eslint:   116:21  error    Empty block statement                                                                no-empty
- @repo/core:lint:eslint:   119:15  error    Empty block statement                                                                no-empty
- @repo/core:lint:eslint:   74:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    6:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   42:35  warning  Refactor this function to reduce its Cognitive Complexity from 31 to the 15 allowed    sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   94:43  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   36:5  warning  Unused eslint-disable directive (no problems were reported)
- @repo/core:lint:eslint:   2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   20:45  warning  EXPO_PUBLIC_PLATFORM is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   21:14  warning  EXPO_PUBLIC_PLATFORM is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    22:8    warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    48:34   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    74:14   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    75:39   warning  POSTHOG_API_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    75:70   warning  POSTHOG_HOST is not listed as a dependency in turbo.json     turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    77:25   error    A `require()` style import is forbidden                      @typescript-eslint/no-require-imports
- @repo/core:lint:eslint:    78:27   warning  POSTHOG_API_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    79:13   warning  POSTHOG_HOST is not listed as a dependency in turbo.json     turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    88:32   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   134:61   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   134:73   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   134:100  warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   136:41   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   137:34   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   148:17   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   149:9    error    'statusCode' is never reassigned. Use 'const' instead        prefer-const
- @repo/core:lint:eslint:   157:31   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   159:32   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   176:21   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   180:31   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   192:36   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   196:61   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   25:21  warning  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is not listed as a dependency in turbo.json     turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   26:24  warning  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   47:10  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint: C:\x\packages\core\src\lib\errors.ts
- @repo/core:lint:eslint:   27:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   39:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   49:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   68:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   18:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   36:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   71:75  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   91:72  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   23:18  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    21:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   119:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   119:88  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   121:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   122:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   178:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   198:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   198:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   267:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   85:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   86:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   87:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   12:15  warning  EXPO_PUBLIC_SENTRY_DSN is not listed as a dependency in turbo.json          turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   17:18  warning  EXPO_PUBLIC_SENTRY_ENVIRONMENT is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   18:14  warning  EXPO_PUBLIC_SENTRY_RELEASE is not listed as a dependency in turbo.json      turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   84:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   89:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   97:49  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   4:22  warning  EXPO_PUBLIC_SUPABASE_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   14:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   14:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\errorClassifier.ts
- @repo/core:lint:eslint:   9:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   73:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   90:57  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   94:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   44:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   53:11  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:    14:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    14:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    22:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    44:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    57:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    64:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    77:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    84:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    93:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    99:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   103:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   109:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   125:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   131:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   139:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    3:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   38:45  warning  Refactor this function to reduce its Cognitive Complexity from 34 to the 15 allowed    sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   94:23  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   13:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   19:35  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   59:39  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   28:17  warning  Refactor this function to reduce its Cognitive Complexity from 31 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   17:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   85:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   91:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   94:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    69:81   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   124:47   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   189:15   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   190:34   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   191:37   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   191:51   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   192:41   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   193:66   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   194:42   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   195:41   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   196:58   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   197:59   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   198:45   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   199:111  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   202:48   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   203:54   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   204:29   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   204:43   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   205:59   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   205:73   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   209:50   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   210:72   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   211:38   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   211:52   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   212:35   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   212:49   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   214:40   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   217:82   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   218:71   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   219:76   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   225:14   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   226:74   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   227:55   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   225:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   328:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   330:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   361:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:    8:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   20:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   28:51  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   28:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   13:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   16:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   31:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   9:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   38:7  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   46:5  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   228:57  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   229:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    6:8  warning  Using exported name 'i18n' as identifier for default export                                                       import-x/no-named-as-default
- @repo/core:lint:eslint:   11:8  warning  Caution: `i18n` also has a named export `use`. Check if you meant to write `import {use} from 'i18next'` instead  import-x/no-named-as-default-member
- @repo/core:lint:eslint:   12:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   26:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    49:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    88:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    97:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   101:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   29:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   135:42  warning  EXPO_PUBLIC_LOCAL_WEB_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   240:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   255:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   256:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   287:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   288:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   375:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    28:68  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   248:47  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   280:17  warning  Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   283:30  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   455:30  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   505:30  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   537:33  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   541:52  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   660:11  warning  Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   58:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   62:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   71:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   17:18  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   11:7  warning  EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   12:7  warning  NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    26:23  warning  Refactor this function to reduce its Cognitive Complexity from 27 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:    34:7   warning  EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR is not listed as a dependency in turbo.json          turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   106:41  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   110:53  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   112:51  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   69:17  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   41:7  warning  EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   42:7  warning  NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:     4:9   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    10:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   135:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   139:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   145:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   150:50  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   150:65  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   6:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   2:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   3:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   6:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   16:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    20:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    48:85  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   105:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   56:68  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   76:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   21:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   14:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   122:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   123:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   32:17  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint: C:\x\packages\core\src\logic\utils\errorNormalizer.ts
- @repo/core:lint:eslint:   10:85  warning  Refactor this function to reduce its Cognitive Complexity from 53 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   1:8  warning  Using exported name 'pino' as identifier for default export  import-x/no-named-as-default
- @repo/core:lint:eslint:   73:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   73:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   73:76  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   74:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   74:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   74:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   74:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   74:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   183:55  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   185:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   3:17  warning  Refactor this function to reduce its Cognitive Complexity from 25 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   12:15  warning  EXPO_PUBLIC_SENTRY_DSN is not listed as a dependency in turbo.json          turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   17:18  warning  EXPO_PUBLIC_SENTRY_ENVIRONMENT is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   18:14  warning  EXPO_PUBLIC_SENTRY_RELEASE is not listed as a dependency in turbo.json      turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   38:19  warning  EXPO_PUBLIC_USE_MMKV is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:    17:12  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    18:11  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    80:21  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   122:24  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   253:21  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    84:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   183:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   197:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   222:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   111:33  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   111:59  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   117:16  warning  Caution: `NetInfo` also has a named export `fetch`. Check if you meant to write `import {fetch} from '@react-native-community/netinfo'` instead  import-x/no-named-as-default-member
- @repo/core:lint:eslint:   186:27  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   191:42  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   199:32  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   203:32  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   210:69  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   214:62  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   218:66  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   225:37  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   246:37  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    23:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   253:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   6:21  warning  EXPO_PUBLIC_SUPABASE_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
- @repo/core:lint:eslint:   23:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
- @repo/core:lint:eslint:   52:88  warning  Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed    sonarjs/cognitive-complexity
- @repo/core:lint:eslint:   35:7   warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   53:13  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   6:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   6:49  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   47:66  warning  Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed  sonarjs/cognitive-complexity
- @repo/core:lint:eslint:    54:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    75:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    95:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   111:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   127:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   63:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   79:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   95:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    22:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   279:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint: C:\x\packages\core\src\types\Errors.ts
- @repo/core:lint:eslint:   41:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   45:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   79:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   15:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   25:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   33:54  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   33:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   68:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   34:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    40:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    41:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    43:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:    50:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   111:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   111:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   145:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   146:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- @repo/core:lint:eslint:   25:5  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-non-null-assertion')
- @repo/core:lint:eslint:   29:3  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint:   36:3  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
- @repo/core:lint:eslint: ✖ 671 problems (6 errors, 665 warnings)
- @repo/core:lint:eslint:   2 errors and 14 warnings potentially fixable with the `--fix` option.
- @repo/core:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core#lint:eslint:  ERROR  command (C:\x\packages\core) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.1.0\pnpm.exe run lint:eslint exited (1)
- ERROR  run failed: command  exited (1)
- Findings: 1 (Errors: 1, Warnings: 0)

### Category: packages/editorial
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it

## Raw Output

```text
$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint" --name "package_json-lint"

>>> Starting Process: 9/4/2026, 8:09:55 AM (IST)

>>> Command: pnpm turbo run lint
>>> Working Dir: C:\x
>>> Log output: C:\x\reports\run-package_json-lint.log
--------------------------------------------------------------------------------

• turbo 2.10.12


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/editorial, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile
   • Running lint in 31 packages

   • Remote caching disabled


@repo/scanner-kit:lint:biome: cache hit, replaying logs b54b2f7dd776260d

@repo/scanner-kit:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_scanner-kit-lint_biome"
@repo/scanner-kit:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/scanner-kit:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/scanner-kit:lint:biome: >>> Working Dir: C:\x\packages\scanner-kit
@repo/scanner-kit:lint:biome: >>> Log output: C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------
@repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/scanner-kit:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/scanner-kit:lint:biome: >>> No modified files found to format.
@repo/scanner-kit:lint:biome: 
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------
@repo/scanner-kit:lint:biome: REPORT SUMMARY
@repo/scanner-kit:lint:biome: Duration: 2.8 seconds
@repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/scanner-kit:lint:biome: Raw Log:  C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: Report:   C:\x\reports\run-packages_scanner-kit-lint_biome-report.txt
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------
@repo/payments:lint:biome: cache hit, replaying logs 217418db7905ae0e
@repo/payments:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_payments-lint_biome"
@repo/payments:lint:biome: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
@repo/payments:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/payments:lint:biome: >>> Working Dir: C:\x\packages\payments
@repo/payments:lint:biome: >>> Log output: C:\x\reports\run-packages_payments-lint_biome.log
apps-edlove-web:lint:biome: cache hit, replaying logs f8521e78004a1331
@repo/classroom:lint:biome: cache hit, replaying logs 977a9f28ce247199
@repo/ui:lint:biome: cache hit, replaying logs ff123148d8012085
apps-edlove-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_edlove-web-lint_biome"
apps-edlove-web:lint:biome: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
apps-edlove-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
apps-edlove-web:lint:biome: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint:biome: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
apps-edlove-web:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
apps-edlove-web:lint:biome: >>> No modified files found to format.
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
apps-edlove-web:lint:biome: REPORT SUMMARY
@repo/classroom:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_classroom-lint_biome"
apps-edlove-web:lint:biome: Duration: 3.3 seconds
@repo/classroom:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/classroom:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/core:lint:biome: cache hit, replaying logs 1d22d00a1ba1f682
@repo/ui:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ui-lint_biome"
@repo/ui:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/ui:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/ui:lint:biome: >>> Working Dir: C:\x\packages\ui
@repo/ui:lint:biome: >>> Log output: C:\x\reports\run-packages_ui-lint_biome.log
@repo/ui:lint:biome: --------------------------------------------------------------------------------
@repo/core:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_core-lint_biome"
@repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/core:lint:biome: >>> Starting Process: 9/4/2026, 8:06:14 AM (IST)
@repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/core:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/core:lint:biome: >>> Working Dir: C:\x\packages\core
@repo/ui:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/core:lint:biome: >>> Log output: C:\x\reports\run-packages_core-lint_biome.log
@repo/ui:lint:biome: >>> No modified files found to format.
@repo/core:lint:biome: --------------------------------------------------------------------------------
@repo/ui:lint:biome: 
@repo/core:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: --------------------------------------------------------------------------------
@repo/core:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: REPORT SUMMARY
@repo/core:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: Duration: 2.8 seconds
@repo/core:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/core:lint:biome: >>> No modified files found to format.
@repo/ui:lint:biome: Raw Log:  C:\x\reports\run-packages_ui-lint_biome.log
@repo/core:lint:biome: 
@repo/ui:lint:biome: Report:   C:\x\reports\run-packages_ui-lint_biome-report.txt
@repo/core:lint:biome: --------------------------------------------------------------------------------
@repo/ui:lint:biome: --------------------------------------------------------------------------------
@repo/core:lint:biome: REPORT SUMMARY
@repo/core:lint:biome: Duration: 2.7 seconds
@repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/core:lint:biome: Raw Log:  C:\x\reports\run-packages_core-lint_biome.log
@repo/core:lint:biome: Report:   C:\x\reports\run-packages_core-lint_biome-report.txt
@repo/core:lint:biome: --------------------------------------------------------------------------------
@repo/accounting:lint:biome: cache hit, replaying logs 3bb58ef0a7ae721d
@repo/editorial:lint:biome: cache miss, executing 018cc4bb29a89b5e
@repo/payments:lint:biome: --------------------------------------------------------------------------------
@repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
apps-edlove-web:lint:biome: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: Report:   C:\x\reports\run-apps_edlove-web-lint_biome-report.txt
@repo/classroom:lint:biome: >>> Working Dir: C:\x\packages\classroom
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: >>> Log output: C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: >>> No modified files found to format.
@repo/classroom:lint:biome: 
@repo/library:lint:biome: cache hit, replaying logs 3fbb3a5ea03a0b24
@repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/payments:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/payments:lint:biome: >>> No modified files found to format.
@repo/payments:lint:biome: 
@repo/payments:lint:biome: --------------------------------------------------------------------------------
@repo/payments:lint:biome: REPORT SUMMARY
@repo/payments:lint:biome: Duration: 3.7 seconds
@repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/payments:lint:biome: Raw Log:  C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: Report:   C:\x\reports\run-packages_payments-lint_biome-report.txt
@repo/payments:lint:biome: --------------------------------------------------------------------------------
@repo/accounting:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_accounting-lint_biome"
@repo/accounting:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
@repo/accounting:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/accounting:lint:biome: >>> Working Dir: C:\x\packages\accounting
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: REPORT SUMMARY
@repo/classroom:lint:biome: Duration: 2.7 seconds
@repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/classroom:lint:biome: Raw Log:  C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: Report:   C:\x\reports\run-packages_classroom-lint_biome-report.txt
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/library:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_library-lint_biome"
@repo/library:lint:biome: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
@repo/library:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/library:lint:biome: >>> Working Dir: C:\x\packages\library
@repo/library:lint:biome: >>> Log output: C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: cache hit, replaying logs a49c9c710c4072a7
@repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/library:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/library:lint:biome: >>> No modified files found to format.
@repo/library:lint:biome: 
@repo/library:lint:biome: --------------------------------------------------------------------------------
@repo/library:lint:biome: REPORT SUMMARY
@repo/library:lint:biome: Duration: 3.7 seconds
@repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/library:lint:biome: Raw Log:  C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: Report:   C:\x\reports\run-packages_library-lint_biome-report.txt
@repo/library:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_people-lint_biome"
@repo/people:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/people:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/people:lint:biome: >>> Working Dir: C:\x\packages\people
@repo/people:lint:biome: >>> Log output: C:\x\reports\run-packages_people-lint_biome.log
@repo/people:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/people:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/accounting:lint:biome: >>> Log output: C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: --------------------------------------------------------------------------------
@repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/accounting:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/accounting:lint:biome: >>> No modified files found to format.
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: --------------------------------------------------------------------------------
@repo/accounting:lint:biome: REPORT SUMMARY
@repo/accounting:lint:biome: Duration: 2.4 seconds
@repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/accounting:lint:biome: Raw Log:  C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: Report:   C:\x\reports\run-packages_accounting-lint_biome-report.txt
@repo/accounting:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: cache hit, replaying logs b0ac8a01181df10e
@repo/self:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_self-lint_biome"
@repo/self:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/self:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/self:lint:biome: >>> Working Dir: C:\x\packages\self
@repo/self:lint:biome: >>> Log output: C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: >>> No modified files found to format.
@repo/self:lint:biome: 
@repo/self:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: REPORT SUMMARY
@repo/self:lint:biome: Duration: 2.6 seconds
@repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/self:lint:biome: Raw Log:  C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: Report:   C:\x\reports\run-packages_self-lint_biome-report.txt
@repo/self:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: >>> No modified files found to format.
@repo/people:lint:biome: 
@repo/people:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: REPORT SUMMARY
@repo/people:lint:biome: Duration: 2.7 seconds
@repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/people:lint:biome: Raw Log:  C:\x\reports\run-packages_people-lint_biome.log
@repo/people:lint:biome: Report:   C:\x\reports\run-packages_people-lint_biome-report.txt
@repo/people:lint:biome: --------------------------------------------------------------------------------
@repo/form-builder:lint:biome: cache hit, replaying logs f6d5feddfd830221

@repo/form-builder:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_form-builder-lint_biome"
@repo/form-builder:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/form-builder:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/form-builder:lint:biome: >>> Working Dir: C:\x\packages\form-builder
@repo/form-builder:lint:biome: >>> Log output: C:\x\reports\run-packages_form-builder-lint_biome.log
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/form-builder:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/form-builder:lint:biome: >>> No modified files found to format.
@repo/form-builder:lint:biome: 
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------
@repo/form-builder:lint:biome: REPORT SUMMARY
@repo/form-builder:lint:biome: Duration: 2.9 seconds
@repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/form-builder:lint:biome: Raw Log:  C:\x\reports\run-packages_form-builder-lint_biome.log
@repo/form-builder:lint:biome: Report:   C:\x\reports\run-packages_form-builder-lint_biome-report.txt
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: cache hit, replaying logs e31b80b028a46955

@repo/platform-mcp:lint:biome: cache miss, executing 5bb65a37fbae49e6
@repo/ai:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ai-lint_biome"
@repo/ai:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/ai:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/ai:lint:biome: >>> Working Dir: C:\x\packages\ai
@repo/ai:lint:biome: >>> Log output: C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: --------------------------------------------------------------------------------
@repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ai:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/ai:lint:biome: >>> No modified files found to format.
@repo/ai:lint:biome: 
@repo/ai:lint:biome: --------------------------------------------------------------------------------
@repo/ai:lint:biome: REPORT SUMMARY
@repo/ai:lint:biome: Duration: 2.7 seconds
@repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/ai:lint:biome: Raw Log:  C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: Report:   C:\x\reports\run-packages_ai-lint_biome-report.txt
@repo/ai:lint:biome: --------------------------------------------------------------------------------
@repo/graphics:lint:biome: cache hit, replaying logs 766b9dd130a998e3

@repo/graphics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_graphics-lint_biome"
@repo/graphics:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/graphics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/graphics:lint:biome: >>> Working Dir: C:\x\packages\graphics
@repo/graphics:lint:biome: >>> Log output: C:\x\reports\run-packages_graphics-lint_biome.log
@repo/graphics:lint:biome: --------------------------------------------------------------------------------
@repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/graphics:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/graphics:lint:biome: >>> No modified files found to format.
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: --------------------------------------------------------------------------------
@repo/graphics:lint:biome: REPORT SUMMARY
@repo/graphics:lint:biome: Duration: 2.8 seconds
@repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/graphics:lint:biome: Raw Log:  C:\x\reports\run-packages_graphics-lint_biome.log
@repo/graphics:lint:biome: Report:   C:\x\reports\run-packages_graphics-lint_biome-report.txt
@repo/graphics:lint:biome: --------------------------------------------------------------------------------
@repo/profile:lint:biome: cache hit, replaying logs 51466e549aabe7a0
@repo/admin:lint:biome: cache hit, replaying logs 5a8bbaa45b7e3ba3
@repo/community:lint:biome: cache hit, replaying logs 2895f09c006be77e

@repo/profile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_profile-lint_biome"
@repo/profile:lint:biome: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
@repo/profile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/profile:lint:biome: >>> Working Dir: C:\x\packages\profile
@repo/profile:lint:biome: >>> Log output: C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/profile:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/profile:lint:biome: >>> No modified files found to format.
@repo/profile:lint:biome: 
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/profile:lint:biome: REPORT SUMMARY
@repo/profile:lint:biome: Duration: 3.2 seconds
@repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/profile:lint:biome: Raw Log:  C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: Report:   C:\x\reports\run-packages_profile-lint_biome-report.txt
@repo/admin:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_admin-lint_biome"
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/admin:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/admin:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/admin:lint:biome: >>> Working Dir: C:\x\packages\admin
@repo/analytics:lint:biome: cache hit, replaying logs e36e50043f389f5c
@repo/community:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_community-lint_biome"
@repo/types-shim:lint:biome: cache hit, replaying logs e1d7d053888c96d9
apps-gurudevi-marketing-web:lint:biome: cache hit, replaying logs 02b03c147478984a
@repo/analytics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_analytics-lint_biome"
@repo/analytics:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/analytics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/analytics:lint:biome: >>> Working Dir: C:\x\packages\analytics
@repo/analytics:lint:biome: >>> Log output: C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
@repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"
@repo/types-shim:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"
@repo/community:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
apps-gurudevi-marketing-web:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/analytics:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
apps-gurudevi-marketing-web:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
@repo/community:lint:biome: >>> Working Dir: C:\x\packages\community
@repo/database:lint:biome: cache hit, replaying logs 69d1cd606512cb55
@repo/analytics:lint:biome: >>> No modified files found to format.
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
@repo/analytics:lint:biome: REPORT SUMMARY
@repo/analytics:lint:biome: Duration: 2.8 seconds
@repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/analytics:lint:biome: Raw Log:  C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: Report:   C:\x\reports\run-packages_analytics-lint_biome-report.txt
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: >>> Log output: C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/types-shim:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/types-shim:lint:biome: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint:biome: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/admin:lint:biome: >>> Log output: C:\x\reports\run-packages_admin-lint_biome.log
@repo/admin:lint:biome: --------------------------------------------------------------------------------
@repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_database-lint_biome"
@repo/database:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
@repo/database:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/database:lint:biome: >>> Working Dir: C:\x\packages\database
@repo/database:lint:biome: >>> Log output: C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: >>> No modified files found to format.
@repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/admin:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/admin:lint:biome: >>> No modified files found to format.
@repo/admin:lint:biome: 
@repo/admin:lint:biome: --------------------------------------------------------------------------------
@repo/admin:lint:biome: REPORT SUMMARY
@repo/admin:lint:biome: Duration: 2.8 seconds
@repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/admin:lint:biome: Raw Log:  C:\x\reports\run-packages_admin-lint_biome.log
@repo/admin:lint:biome: Report:   C:\x\reports\run-packages_admin-lint_biome-report.txt
@repo/admin:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@intuitui-labs/lk-edu-geo:lint:biome: cache hit, replaying logs 85bb9cc9ea790221
@repo/community:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: >>> No modified files found to format.
@repo/community:lint:biome: 
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: REPORT SUMMARY
@repo/community:lint:biome: Duration: 2.7 seconds
@repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/community:lint:biome: Raw Log:  C:\x\reports\run-packages_community-lint_biome.log
@repo/types-shim:lint:biome: >>> No modified files found to format.
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:biome: REPORT SUMMARY
@repo/types-shim:lint:biome: Duration: 3.0 seconds
@repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint:biome: Raw Log:  C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: Report:   C:\x\reports\run-packages_types-shim-lint_biome-report.txt
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_lk-edu-geo-lint_biome"
@intuitui-labs/lk-edu-geo:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
@intuitui-labs/lk-edu-geo:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@intuitui-labs/lk-edu-geo:lint:biome: >>> Working Dir: C:\x\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:lint:biome: >>> Log output: C:\x\reports\run-packages_lk-edu-geo-lint_biome.log
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@intuitui-labs/lk-edu-geo:lint:biome: >>> No modified files found to format.
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:lint:biome: REPORT SUMMARY
@intuitui-labs/lk-edu-geo:lint:biome: Duration: 2.6 seconds
@intuitui-labs/lk-edu-geo:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@intuitui-labs/lk-edu-geo:lint:biome: Raw Log:  C:\x\reports\run-packages_lk-edu-geo-lint_biome.log
@intuitui-labs/lk-edu-geo:lint:biome: Report:   C:\x\reports\run-packages_lk-edu-geo-lint_biome-report.txt
@intuitui-labs/lk-edu-geo:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: >>> No modified files found to format.
apps-gurudevi-marketing-web:lint:biome: 
@repo/community:lint:biome: Report:   C:\x\reports\run-packages_community-lint_biome-report.txt
@repo/database:lint:biome: 
@repo/database:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:biome: REPORT SUMMARY
@repo/database:lint:biome: Duration: 2.7 seconds
@repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint:biome: Raw Log:  C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint:biome: Report:   C:\x\reports\run-packages_database-lint_biome-report.txt
@repo/database:lint:biome: --------------------------------------------------------------------------------
gurudevi-mobile:lint:biome: cache hit, replaying logs 1eaca876bd990cd0
@repo/workforce:lint:biome: cache hit, replaying logs d385bc1ef7cff66d
gurudevi-mobile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-mobile-lint_biome"
gurudevi-mobile:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
gurudevi-mobile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
gurudevi-mobile:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-mobile
gurudevi-mobile:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------
gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
gurudevi-mobile:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
gurudevi-mobile:lint:biome: >>> No modified files found to format.
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------
gurudevi-mobile:lint:biome: REPORT SUMMARY
gurudevi-mobile:lint:biome: Duration: 2.9 seconds
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: REPORT SUMMARY
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/workforce:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_workforce-lint_biome"
@repo/workforce:lint:biome: >>> Starting Process: 9/4/2026, 8:06:14 AM (IST)
@repo/workforce:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/workforce:lint:biome: >>> Working Dir: C:\x\packages\workforce
@repo/workforce:lint:biome: >>> Log output: C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: --------------------------------------------------------------------------------
@repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:eslint: cache hit, replaying logs 51d65ed622f0443a
@repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/workforce:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/workforce:lint:biome: >>> No modified files found to format.
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: --------------------------------------------------------------------------------
@repo/workforce:lint:biome: REPORT SUMMARY
@repo/workforce:lint:biome: Duration: 2.9 seconds
@repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/workforce:lint:biome: Raw Log:  C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: Report:   C:\x\reports\run-packages_workforce-lint_biome-report.txt
@repo/workforce:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_types-shim-lint_eslint"
@repo/types-shim:lint:eslint: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
@repo/types-shim:lint:eslint: >>> Command: eslint .
@repo/types-shim:lint:eslint: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint:eslint: >>> Log output: C:\x\reports\run-packages_types-shim-lint_eslint.log
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------
@repo/types-shim:lint:eslint: 
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------
@repo/types-shim:lint:eslint: REPORT SUMMARY
@repo/types-shim:lint:eslint: Duration: 80.1 seconds
@repo/types-shim:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint:eslint: Raw Log:  C:\x\reports\run-packages_types-shim-lint_eslint.log
apps-gurudevi-marketing-web:lint:biome: Duration: 2.9 seconds
apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
gurudevi-mobile:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-mobile-lint_biome-report.txt
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:eslint: cache miss, executing f93b80399e9f03a9
@repo/types-shim:lint:eslint: Report:   C:\x\reports\run-packages_types-shim-lint_eslint-report.txt
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------
@repo/editorial:lint:eslint: cache miss, executing 721bc057d22a36de
@repo/platform-mcp:lint:eslint: cache miss, executing b271686d4d8b29fe
apps-gurudevi-marketing-web:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome-report.txt
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint: cache miss, executing ba64c1c2b3070d1d

@repo/editorial:lint:biome: $ biome check src

@repo/platform-mcp:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"

@repo/database:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_database-lint_eslint"

@repo/editorial:lint:eslint: $ eslint src

@repo/platform-mcp:lint:biome: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)

@repo/editorial:lint:biome: Checked 5 files in 29ms. No fixes applied.

@repo/platform-mcp:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/platform-mcp:lint:biome: >>> Working Dir: C:\x\packages\platform-mcp

@repo/platform-mcp:lint:biome: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_platform-mcp-lint_eslint"

@repo/types-shim:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "packages_types-shim-lint"

@repo/database:lint:eslint: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)

@repo/database:lint:eslint: >>> Command: eslint .

@repo/database:lint:eslint: >>> Working Dir: C:\x\packages\database
@repo/database:lint:eslint: >>> Log output: C:\x\reports\run-packages_database-lint_eslint.log
@repo/database:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)

@repo/platform-mcp:lint:eslint: >>> Command: eslint .

@repo/platform-mcp:lint:eslint: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:eslint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/types-shim:lint: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)

@repo/types-shim:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint
@repo/types-shim:lint: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint: >>> Log output: C:\x\reports\run-packages_types-shim-lint.log
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"

@repo/platform-mcp:lint:biome: >>> No modified files found to format.

@repo/platform-mcp:lint:biome: 
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: REPORT SUMMARY

@repo/platform-mcp:lint:biome: Duration: 1.4 seconds

@repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/platform-mcp:lint:biome: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_biome.log

@repo/platform-mcp:lint:biome: Report:   C:\x\reports\run-packages_platform-mcp-lint_biome-report.txt

@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint: >>> Starting Process: 9/4/2026, 8:09:57 AM (IST)

@repo/types-shim:lint: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/types-shim:lint: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: >>> No modified files found to format.

@repo/types-shim:lint: 
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: REPORT SUMMARY
@repo/types-shim:lint: Duration: 1.1 seconds
@repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint: Raw Log:  C:\x\reports\run-packages_types-shim-lint_biome.log

@repo/types-shim:lint: Report:   C:\x\reports\run-packages_types-shim-lint_biome-report.txt
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_types-shim-lint_eslint"

@repo/types-shim:lint: >>> Starting Process: 9/4/2026, 8:09:59 AM (IST)

@repo/types-shim:lint: >>> Command: eslint .

@repo/types-shim:lint: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint: >>> Log output: C:\x\reports\run-packages_types-shim-lint_eslint.log

@repo/types-shim:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint:eslint: cache miss, executing 8e957530ad2947e1

apps-gurudevi-marketing-web:lint:eslint: cache miss, executing a96cb20d38d18e49

apps-edlove-web:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_edlove-web-lint_eslint"

apps-gurudevi-marketing-web:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_gurudevi-marketingWeb-lint_eslint"

apps-edlove-web:lint:eslint: >>> Starting Process: 9/4/2026, 8:10:04 AM (IST)

apps-edlove-web:lint:eslint: >>> Command: eslint .

apps-edlove-web:lint:eslint: >>> Working Dir: C:\x\apps\edlove-web

apps-edlove-web:lint:eslint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_eslint.log

apps-edlove-web:lint:eslint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:eslint: >>> Starting Process: 9/4/2026, 8:10:04 AM (IST)

apps-gurudevi-marketing-web:lint:eslint: >>> Command: eslint .

apps-gurudevi-marketing-web:lint:eslint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint:eslint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint.log

apps-gurudevi-marketing-web:lint:eslint: --------------------------------------------------------------------------------

@repo/types-shim:lint: 
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: REPORT SUMMARY

@repo/types-shim:lint: Duration: 7.8 seconds

@repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint: Raw Log:  C:\x\reports\run-packages_types-shim-lint_eslint.log

@repo/types-shim:lint: Report:   C:\x\reports\run-packages_types-shim-lint_eslint-report.txt
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: 
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/types-shim:lint: REPORT SUMMARY
@repo/types-shim:lint: Duration: 10.3 seconds
@repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)

@repo/types-shim:lint: Raw Log:  C:\x\reports\run-packages_types-shim-lint.log
@repo/types-shim:lint: Report:   C:\x\reports\run-packages_types-shim-lint-report.txt
@repo/types-shim:lint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: C:\x\packages\platform-mcp\src\index.ts
@repo/platform-mcp:lint:eslint:      1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
@repo/platform-mcp:lint:eslint:      4:41  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:      4:57  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:eslint:      4:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:      6:6   warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    290:15  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    329:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    343:42  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    409:17  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    463:21  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    472:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    480:20  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    491:25  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    501:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    505:44  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    507:21  warning  MCP_MODE is not listed as a dependency in turbo.json                                       turbo/no-undeclared-env-vars
@repo/platform-mcp:lint:eslint:    551:22  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    554:27  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    639:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    641:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    642:79  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    643:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    645:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    647:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    649:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    653:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    655:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    656:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:eslint:    657:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    659:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    660:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    661:72  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    663:76  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    706:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    708:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    710:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    712:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    714:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    716:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    718:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    720:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    722:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    724:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    726:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    736:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    738:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    740:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    742:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    744:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    781:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    785:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    787:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    789:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    791:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    793:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    795:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    797:74  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    799:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    803:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    805:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    807:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    813:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    815:75  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    897:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    917:52  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    948:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    960:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    975:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    987:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    998:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1009:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1029:51  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1041:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1052:53  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1063:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1074:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1085:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1099:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1111:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1123:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1136:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1175:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1213:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1233:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1244:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1282:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1311:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1331:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1360:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1372:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1383:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1394:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1406:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1419:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1433:14  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1452:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   1474:46  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: C:\x\packages\platform-mcp\src\services\AuditService.ts
@repo/platform-mcp:lint:eslint:   169:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   181:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   290:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: C:\x\packages\platform-mcp\src\services\DeviceService.ts
@repo/platform-mcp:lint:eslint:    11:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   153:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: C:\x\packages\platform-mcp\src\services\DiscoveryService.ts
@repo/platform-mcp:lint:eslint:   350:17  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: C:\x\packages\platform-mcp\src\services\DocumentService.ts
@repo/platform-mcp:lint:eslint:    50:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   160:70  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: C:\x\packages\platform-mcp\src\services\MaintenanceService.ts
@repo/platform-mcp:lint:eslint:   51:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: C:\x\packages\platform-mcp\src\utils\execution.ts
@repo/platform-mcp:lint:eslint:    13:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   104:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   114:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:   168:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: ✖ 110 problems (0 errors, 110 warnings)
@repo/platform-mcp:lint:eslint:   0 errors and 1 warning potentially fixable with the `--fix` option.
@repo/platform-mcp:lint:eslint: 

@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: REPORT SUMMARY

@repo/platform-mcp:lint:eslint: Duration: 14.4 seconds

@repo/platform-mcp:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/platform-mcp:lint:eslint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_eslint.log

@repo/platform-mcp:lint:eslint: Report:   C:\x\reports\run-packages_platform-mcp-lint_eslint-report.txt
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: cache miss, executing 8aafb85c0ae49d79

@repo/platform-mcp:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "packages_platform-mcp-lint"

@repo/platform-mcp:lint: >>> Starting Process: 9/4/2026, 8:10:11 AM (IST)

@repo/platform-mcp:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint

@repo/platform-mcp:lint: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint.log
@repo/platform-mcp:lint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"

@repo/platform-mcp:lint: >>> Starting Process: 9/4/2026, 8:10:12 AM (IST)

@repo/platform-mcp:lint: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/platform-mcp:lint: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint: --------------------------------------------------------------------------------

@repo/database:lint:eslint: 
@repo/database:lint:eslint: --------------------------------------------------------------------------------

@repo/database:lint:eslint: REPORT SUMMARY
@repo/database:lint:eslint: Duration: 16.5 seconds
@repo/database:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)

@repo/database:lint:eslint: Raw Log:  C:\x\reports\run-packages_database-lint_eslint.log
@repo/database:lint:eslint: Report:   C:\x\reports\run-packages_database-lint_eslint-report.txt
@repo/database:lint:eslint: --------------------------------------------------------------------------------

@repo/database:lint: cache miss, executing f8e35adcccfbbcde

@repo/core:lint:eslint: cache miss, executing 756851d94248b6eb

@repo/database:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "packages_database-lint"

@repo/core:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "node --max-old-space-size=4096 node_modules/eslint/bin/eslint.js ." --name "packages_core-lint_eslint"

@repo/database:lint: >>> Starting Process: 9/4/2026, 8:10:13 AM (IST)

@repo/database:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint

@repo/database:lint: >>> Working Dir: C:\x\packages\database
@repo/database:lint: >>> Log output: C:\x\reports\run-packages_database-lint.log
@repo/database:lint: --------------------------------------------------------------------------------

@repo/core:lint:eslint: >>> Starting Process: 9/4/2026, 8:10:13 AM (IST)

@repo/core:lint:eslint: >>> Command: node --max-old-space-size=4096 node_modules/eslint/bin/eslint.js .

@repo/core:lint:eslint: >>> Working Dir: C:\x\packages\core

@repo/core:lint:eslint: >>> Log output: C:\x\reports\run-packages_core-lint_eslint.log

@repo/core:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: >>> No modified files found to format.

@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: REPORT SUMMARY
@repo/platform-mcp:lint: Duration: 1.0 seconds

@repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/platform-mcp:lint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint: Report:   C:\x\reports\run-packages_platform-mcp-lint_biome-report.txt
@repo/platform-mcp:lint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_platform-mcp-lint_eslint"

@repo/platform-mcp:lint: >>> Starting Process: 9/4/2026, 8:10:13 AM (IST)

@repo/platform-mcp:lint: >>> Command: eslint .

@repo/platform-mcp:lint: >>> Working Dir: C:\x\packages\platform-mcp

@repo/platform-mcp:lint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_eslint.log

@repo/platform-mcp:lint: --------------------------------------------------------------------------------

@repo/database:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_database-lint_biome"

@repo/database:lint: >>> Starting Process: 9/4/2026, 8:10:14 AM (IST)

@repo/database:lint: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/database:lint: >>> Working Dir: C:\x\packages\database
@repo/database:lint: >>> Log output: C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint: --------------------------------------------------------------------------------

@repo/database:lint: >>> No modified files found to format.

@repo/database:lint: 
@repo/database:lint: --------------------------------------------------------------------------------

@repo/database:lint: REPORT SUMMARY
@repo/database:lint: Duration: 1.0 seconds

@repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint: Raw Log:  C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint: Report:   C:\x\reports\run-packages_database-lint_biome-report.txt
@repo/database:lint: --------------------------------------------------------------------------------

@repo/database:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_database-lint_eslint"

@repo/database:lint: >>> Starting Process: 9/4/2026, 8:10:15 AM (IST)

@repo/database:lint: >>> Command: eslint .

@repo/database:lint: >>> Working Dir: C:\x\packages\database
@repo/database:lint: >>> Log output: C:\x\reports\run-packages_database-lint_eslint.log

@repo/database:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:eslint: 
apps-gurudevi-marketing-web:lint:eslint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:eslint: REPORT SUMMARY
apps-gurudevi-marketing-web:lint:eslint: Duration: 23.6 seconds
apps-gurudevi-marketing-web:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)

apps-gurudevi-marketing-web:lint:eslint: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint.log

apps-gurudevi-marketing-web:lint:eslint: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint-report.txt
apps-gurudevi-marketing-web:lint:eslint: --------------------------------------------------------------------------------

apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: C:\x\apps\edlove-web\src\lib\api.ts
apps-edlove-web:lint:eslint:    44:22  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   135:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   146:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   157:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   178:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

apps-edlove-web:lint:eslint:   427:67  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: C:\x\apps\edlove-web\src\pages\knowledge.json.ts
apps-edlove-web:lint:eslint:    1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
apps-edlove-web:lint:eslint:   47:34  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: C:\x\apps\edlove-web\src\types\index.ts
apps-edlove-web:lint:eslint:   283:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   290:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   307:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   316:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: C:\x\apps\edlove-web\src\utils\helpers.ts
apps-edlove-web:lint:eslint:   290:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   290:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   305:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint:   305:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: ✖ 16 problems (0 errors, 16 warnings)
apps-edlove-web:lint:eslint:   0 errors and 1 warning potentially fixable with the `--fix` option.
apps-edlove-web:lint:eslint: 

apps-gurudevi-marketing-web:lint: cache miss, executing 039e757fe1402b43

apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: --------------------------------------------------------------------------------

apps-edlove-web:lint:eslint: REPORT SUMMARY
apps-edlove-web:lint:eslint: Duration: 23.9 seconds

apps-edlove-web:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint:eslint: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_eslint.log

apps-edlove-web:lint:eslint: Report:   C:\x\reports\run-apps_edlove-web-lint_eslint-report.txt
apps-edlove-web:lint:eslint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "apps_gurudevi-marketingWeb-lint"

apps-edlove-web:lint: cache miss, executing 3331a4e0d19b329e

apps-edlove-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "apps_edlove-web-lint"

apps-gurudevi-marketing-web:lint: >>> Starting Process: 9/4/2026, 8:10:28 AM (IST)

apps-gurudevi-marketing-web:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint

apps-gurudevi-marketing-web:lint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint.log
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: >>> Starting Process: 9/4/2026, 8:10:28 AM (IST)

apps-edlove-web:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint

apps-edlove-web:lint: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint.log
apps-edlove-web:lint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: C:\x\packages\platform-mcp\src\index.ts
@repo/platform-mcp:lint:      1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
@repo/platform-mcp:lint:      4:41  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:      4:57  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:      4:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:      6:6   warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    290:15  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    329:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    343:42  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    409:17  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    463:21  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    472:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    480:20  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    491:25  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    501:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    505:44  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    507:21  warning  MCP_MODE is not listed as a dependency in turbo.json                                       turbo/no-undeclared-env-vars
@repo/platform-mcp:lint:    551:22  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    554:27  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    639:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    641:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    642:79  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    643:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    645:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    647:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    649:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    653:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    655:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    656:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    657:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    659:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    660:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    661:72  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    663:76  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    706:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    708:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    710:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    712:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    714:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    716:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    718:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    720:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    722:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    724:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    726:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    736:71  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    738:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    740:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    742:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    744:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    781:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    785:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    787:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    789:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    791:70  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    793:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    795:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    797:74  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    799:69  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    803:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    805:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    807:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:    813:73  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    815:75  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    897:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    917:52  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    948:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    960:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    975:56  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    987:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:    998:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1009:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1029:51  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1041:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1052:53  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1063:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:   1074:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1085:66  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1099:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1111:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1123:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1136:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1175:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1213:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1233:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1244:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1282:61  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1311:68  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1331:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1360:62  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1372:67  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1383:58  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any

@repo/platform-mcp:lint:   1394:59  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1406:55  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1419:63  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1433:14  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1452:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   1474:46  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: C:\x\packages\platform-mcp\src\services\AuditService.ts
@repo/platform-mcp:lint:   169:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   181:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   290:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: C:\x\packages\platform-mcp\src\services\DeviceService.ts
@repo/platform-mcp:lint:    11:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   153:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: C:\x\packages\platform-mcp\src\services\DiscoveryService.ts
@repo/platform-mcp:lint:   350:17  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: C:\x\packages\platform-mcp\src\services\DocumentService.ts
@repo/platform-mcp:lint:    50:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   160:70  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: C:\x\packages\platform-mcp\src\services\MaintenanceService.ts
@repo/platform-mcp:lint:   51:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: C:\x\packages\platform-mcp\src\utils\execution.ts
@repo/platform-mcp:lint:    13:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   104:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   114:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:   168:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: ✖ 110 problems (0 errors, 110 warnings)
@repo/platform-mcp:lint:   0 errors and 1 warning potentially fixable with the `--fix` option.
@repo/platform-mcp:lint: 

apps-gurudevi-marketing-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"

@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: REPORT SUMMARY
@repo/platform-mcp:lint: Duration: 16.0 seconds
@repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/platform-mcp:lint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint: Report:   C:\x\reports\run-packages_platform-mcp-lint_eslint-report.txt
@repo/platform-mcp:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_edlove-web-lint_biome"

@repo/platform-mcp:lint: 

@repo/platform-mcp:lint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint: REPORT SUMMARY
@repo/platform-mcp:lint: Duration: 18.4 seconds
@repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)

@repo/platform-mcp:lint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint.log
@repo/platform-mcp:lint: Report:   C:\x\reports\run-packages_platform-mcp-lint-report.txt
@repo/platform-mcp:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: >>> Starting Process: 9/4/2026, 8:10:30 AM (IST)

apps-gurudevi-marketing-web:lint: >>> Command: node ../../scripts/scoped-biome.mjs
apps-gurudevi-marketing-web:lint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: >>> Starting Process: 9/4/2026, 8:10:30 AM (IST)

apps-edlove-web:lint: >>> Command: node ../../scripts/scoped-biome.mjs

apps-edlove-web:lint: >>> Working Dir: C:\x\apps\edlove-web

apps-edlove-web:lint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_biome.log

apps-edlove-web:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: >>> No modified files found to format.

apps-gurudevi-marketing-web:lint: 
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: REPORT SUMMARY
apps-gurudevi-marketing-web:lint: Duration: 1.1 seconds
apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)

apps-gurudevi-marketing-web:lint: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome-report.txt

apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: >>> No modified files found to format.

apps-gurudevi-marketing-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_gurudevi-marketingWeb-lint_eslint"

apps-edlove-web:lint: 

apps-edlove-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: REPORT SUMMARY
apps-edlove-web:lint: Duration: 1.1 seconds
apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_biome.log

apps-edlove-web:lint: Report:   C:\x\reports\run-apps_edlove-web-lint_biome-report.txt
apps-edlove-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_edlove-web-lint_eslint"

apps-gurudevi-marketing-web:lint: >>> Starting Process: 9/4/2026, 8:10:31 AM (IST)

apps-gurudevi-marketing-web:lint: >>> Command: eslint .

apps-gurudevi-marketing-web:lint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint.log
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: >>> Starting Process: 9/4/2026, 8:10:31 AM (IST)

apps-edlove-web:lint: >>> Command: eslint .

apps-edlove-web:lint: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_eslint.log

apps-edlove-web:lint: --------------------------------------------------------------------------------

@repo/database:lint: 
@repo/database:lint: --------------------------------------------------------------------------------
@repo/database:lint: REPORT SUMMARY

@repo/database:lint: Duration: 18.1 seconds
@repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)

@repo/database:lint: Raw Log:  C:\x\reports\run-packages_database-lint_eslint.log
@repo/database:lint: Report:   C:\x\reports\run-packages_database-lint_eslint-report.txt
@repo/database:lint: --------------------------------------------------------------------------------

@repo/database:lint: 
@repo/database:lint: --------------------------------------------------------------------------------

@repo/database:lint: REPORT SUMMARY
@repo/database:lint: Duration: 20.6 seconds
@repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint: Raw Log:  C:\x\reports\run-packages_database-lint.log

@repo/database:lint: Report:   C:\x\reports\run-packages_database-lint-report.txt
@repo/database:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: 
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: REPORT SUMMARY

apps-gurudevi-marketing-web:lint: Duration: 9.7 seconds
apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)

apps-gurudevi-marketing-web:lint: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint.log
apps-gurudevi-marketing-web:lint: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint-report.txt
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: 
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint: REPORT SUMMARY
apps-gurudevi-marketing-web:lint: Duration: 12.7 seconds

apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:lint: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint.log
apps-gurudevi-marketing-web:lint: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint-report.txt

apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: 
apps-edlove-web:lint: C:\x\apps\edlove-web\src\lib\api.ts
apps-edlove-web:lint:    44:22  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   135:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   146:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   157:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

apps-edlove-web:lint:   178:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   427:67  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint: 
apps-edlove-web:lint: C:\x\apps\edlove-web\src\pages\knowledge.json.ts
apps-edlove-web:lint:    1:1   warning  Unused eslint-disable directive (no problems were reported from 'import-x/no-unresolved')
apps-edlove-web:lint:   47:34  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
apps-edlove-web:lint: 
apps-edlove-web:lint: C:\x\apps\edlove-web\src\types\index.ts
apps-edlove-web:lint:   283:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   290:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   307:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   316:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint: 
apps-edlove-web:lint: C:\x\apps\edlove-web\src\utils\helpers.ts
apps-edlove-web:lint:   290:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   290:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   305:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint:   305:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
apps-edlove-web:lint: 
apps-edlove-web:lint: ✖ 16 problems (0 errors, 16 warnings)
apps-edlove-web:lint:   0 errors and 1 warning potentially fixable with the `--fix` option.
apps-edlove-web:lint: 

apps-edlove-web:lint: 
apps-edlove-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: REPORT SUMMARY
apps-edlove-web:lint: Duration: 10.0 seconds

apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_eslint.log

apps-edlove-web:lint: Report:   C:\x\reports\run-apps_edlove-web-lint_eslint-report.txt
apps-edlove-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: 
apps-edlove-web:lint: --------------------------------------------------------------------------------

apps-edlove-web:lint: REPORT SUMMARY
apps-edlove-web:lint: Duration: 12.9 seconds
apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint: Raw Log:  C:\x\reports\run-apps_edlove-web-lint.log
apps-edlove-web:lint: Report:   C:\x\reports\run-apps_edlove-web-lint-report.txt

apps-edlove-web:lint: --------------------------------------------------------------------------------

@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\NetworkBusAdapter.ts
@repo/core:lint:eslint:   13:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead                                                                                  polymath/ban-use-store
@repo/core:lint:eslint:   20:18  warning  Caution: `NetInfo` also has a named export `addEventListener`. Check if you meant to write `import {addEventListener} from '@react-native-community/netinfo'` instead  import-x/no-named-as-default-member
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\events\inngest.adapter.ts
@repo/core:lint:eslint:    9:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   12:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\feature-rollout\growthBookFeatureRollout.adapter.ts
@repo/core:lint:eslint:   29:9  warning  EXPO_PUBLIC_GROWTHBOOK_API_HOST is not listed as a dependency in turbo.json    turbo/no-undeclared-env-vars

@repo/core:lint:eslint:   30:9  warning  NEXT_PUBLIC_GROWTHBOOK_API_HOST is not listed as a dependency in turbo.json    turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   34:9  warning  EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   35:9  warning  NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\native\AsyncStorageAdapter.ts
@repo/core:lint:eslint:   8:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\native\FallbackMMKVStorageAdapter.ts
@repo/core:lint:eslint:   26:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\native\MMKVStorageAdapter.ts
@repo/core:lint:eslint:   7:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\native\NativeCryptoAdapter.ts
@repo/core:lint:eslint:   18:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\native\NativeNetworkAdapter.ts
@repo/core:lint:eslint:   10:25  warning  Caution: `NetInfo` also has a named export `fetch`. Check if you meant to write `import {fetch} from '@react-native-community/netinfo'` instead  import-x/no-named-as-default-member
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\powersync\PowerSyncGate.tsx
@repo/core:lint:eslint:   19:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:   40:50  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\powersync\SupabasePowerSyncConnector.ts
@repo/core:lint:eslint:    16:23  warning  EXPO_PUBLIC_POWERSYNC_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:    66:9   error    'startTime' is never reassigned. Use 'const' instead                   prefer-const
@repo/core:lint:eslint:    94:26  warning  Unexpected any. Specify a different type                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   104:32  warning  Unexpected any. Specify a different type                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   107:44  warning  Unexpected any. Specify a different type                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\powersync\connectionLifecycle.ts
@repo/core:lint:eslint:   34:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\powersync\hooks.ts
@repo/core:lint:eslint:   166:86  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\powersync\opsqlite.adapter.ts
@repo/core:lint:eslint:    68:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   112:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\powersync\powersync-shim.ts
@repo/core:lint:eslint:   25:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   25:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\powersync\secureDrizzleProxy.ts
@repo/core:lint:eslint:     1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:     5:37  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    10:66  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    46:37  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    76:46  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    76:52  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    88:27  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    98:34  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   129:53  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   140:39  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   141:51  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   171:27  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   171:40  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   172:45  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\realtime\supabase.adapter.ts
@repo/core:lint:eslint:   20:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   21:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\storage\supabase.adapter.ts
@repo/core:lint:eslint:   16:89  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabaseClient.ts
@repo/core:lint:eslint:   12:38  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   21:19  warning  EXPO_PUBLIC_SUPABASE_URL is not listed as a dependency in turbo.json              turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   23:3   warning  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   23:55  warning  SUPABASE_ANON_KEY is not listed as a dependency in turbo.json                     turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   39:61  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   62:24  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabaseIdentity.adapter.ts
@repo/core:lint:eslint:     5:35  warning  'C:\x\packages\core\src\utils\effect.ts' imported multiple times                     import-x/no-duplicates
@repo/core:lint:eslint:    14:28  warning  'C:\x\packages\core\src\utils\effect.ts' imported multiple times                     import-x/no-duplicates
@repo/core:lint:eslint:    48:43  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any

@repo/core:lint:eslint:   160:51  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   217:23  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   217:38  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   301:9   warning  Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint:   301:74  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   315:29  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   394:49  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   492:47  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   532:42  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   538:40  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   559:39  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabaseNotification.adapter.ts
@repo/core:lint:eslint:   26:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\auditRepository.ts
@repo/core:lint:eslint:   17:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\auth.adapter.ts
@repo/core:lint:eslint:    18:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    24:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    30:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    64:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    74:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    74:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    84:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    84:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    94:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    94:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   108:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   108:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   112:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   131:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   150:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   168:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   191:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   205:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   219:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   223:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   236:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   242:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   248:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   252:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   255:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   260:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   263:87  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   266:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   274:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\communityRepository.ts
@repo/core:lint:eslint:    90:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   179:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   194:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   218:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   285:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\educational\assignmentRepository.ts
@repo/core:lint:eslint:   197:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\educational\classroomRepository.ts
@repo/core:lint:eslint:    6:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    7:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   38:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   40:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\educational\enrollmentRepository.ts
@repo/core:lint:eslint:   104:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   220:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   236:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   252:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\educational\schoolRepository.ts
@repo/core:lint:eslint:    66:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   200:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   216:65  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\growth.adapter.ts
@repo/core:lint:eslint:    74:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   123:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   131:71  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   380:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   456:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   460:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   467:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\guardianRepository.ts
@repo/core:lint:eslint:    55:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    75:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    94:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   292:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   292:85  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   319:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   320:69  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   327:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\profileRepository.ts
@repo/core:lint:eslint:   310:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   311:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   312:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   313:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\supabaseEntitlement.adapter.ts
@repo/core:lint:eslint:   58:10  warning  Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\supabase\teacherRepository.ts
@repo/core:lint:eslint:   40:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\adapters\zenstack\profileRepository.ts
@repo/core:lint:eslint:    43:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   105:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   126:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   374:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   381:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\agent.ts
@repo/core:lint:eslint:   9:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\assignments.ts
@repo/core:lint:eslint:   60:57  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   67:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\attendance.ts
@repo/core:lint:eslint:    21:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    22:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    54:88  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   107:86  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\audit-poa-runtime.ts
@repo/core:lint:eslint:    48:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    49:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    50:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   280:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\auth.ts
@repo/core:lint:eslint:   83:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\base.ts
@repo/core:lint:eslint:   14:7   warning  EXPO_PUBLIC_API_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   14:42  warning  NEXT_PUBLIC_API_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   36:67  warning  Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   37:43  warning  Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\circles.ts
@repo/core:lint:eslint:   52:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\classroom.ts
@repo/core:lint:eslint:     3:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:    16:24  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    22:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    38:46  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    39:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    43:42  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    50:65  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    51:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    73:15  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    74:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    91:88  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    92:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   105:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   112:59  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   123:65  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   131:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   137:70  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   145:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   151:66  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   162:70  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   170:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\classrooms.ts
@repo/core:lint:eslint:   17:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   18:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   26:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   27:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   33:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   37:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   53:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   65:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   77:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\clientRuntime.ts
@repo/core:lint:eslint:   47:69  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   47:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   47:79  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\community.ts
@repo/core:lint:eslint:    17:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    34:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    43:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    52:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    61:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    70:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    79:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    88:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    97:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   116:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   135:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   150:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   167:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   186:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   206:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   222:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   238:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   254:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   269:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   282:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   291:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\contractCoverage.ts
@repo/core:lint:eslint:   14:77  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   21:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\demo.ts
@repo/core:lint:eslint:   1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\demoProvider.ts
@repo/core:lint:eslint:     1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:     9:48  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    44:89  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    96:17  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed    sonarjs/cognitive-complexity
@repo/core:lint:eslint:    96:84  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   116:21  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   117:18  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   148:35  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\echo.ts
@repo/core:lint:eslint:   21:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   39:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   47:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   51:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   63:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   78:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   90:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\erp.ts
@repo/core:lint:eslint:   45:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\formTemplates.ts
@repo/core:lint:eslint:    31:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    51:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    62:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    72:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    85:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   105:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   114:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   126:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\founder.ts
@repo/core:lint:eslint:   13:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   39:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   55:94  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   62:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   69:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   77:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   84:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\grading.ts
@repo/core:lint:eslint:    76:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    83:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   103:51  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\groups.ts
@repo/core:lint:eslint:   20:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   42:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   65:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   80:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\handlers\admin.ts
@repo/core:lint:eslint:   22:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   23:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   24:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   64:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\handlers\dailyContent.ts
@repo/core:lint:eslint:    3:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   16:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   38:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   39:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\handlers\identity.ts
@repo/core:lint:eslint:    4:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    6:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   19:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\handlers\onboarding.ts
@repo/core:lint:eslint:   21:41  warning  Refactor this function to reduce its Cognitive Complexity from 30 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\handlers\operations.ts
@repo/core:lint:eslint:    68:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   116:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   117:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   118:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\handlers\sync.ts
@repo/core:lint:eslint:    51:19  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    64:59  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    65:18  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    67:18  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    74:25  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    77:7   warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    78:9   warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    93:38  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    93:43  warning  Refactor this function to reduce its Cognitive Complexity from 27 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint:   231:19  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\history.ts
@repo/core:lint:eslint:    24:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    25:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    81:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    95:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   111:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   126:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   143:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\hooks\community.hooks.ts
@repo/core:lint:eslint:    20:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    22:52  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    57:88  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    87:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    89:80  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    90:91  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   141:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\hooks\notification.hooks.ts
@repo/core:lint:eslint:   4:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\hooks\social.hooks.ts
@repo/core:lint:eslint:   2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\identity.ts
@repo/core:lint:eslint:   89:85  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\index.ts
@repo/core:lint:eslint:   199:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\inventory.ts
@repo/core:lint:eslint:   28:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   36:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   52:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   53:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   60:93  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   61:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   68:54  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   69:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\library.ts
@repo/core:lint:eslint:   141:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\longitudinal.ts
@repo/core:lint:eslint:   27:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   43:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\mapping.ts
@repo/core:lint:eslint:   13:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   19:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   29:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   46:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\messaging.ts
@repo/core:lint:eslint:   12:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\mockData.ts
@repo/core:lint:eslint:    55:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    69:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   185:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   219:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   230:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   299:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   357:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\onboarding.ts
@repo/core:lint:eslint:    28:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    50:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    74:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    86:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   100:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   180:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\orpcClient.ts
@repo/core:lint:eslint:   45:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   78:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\profile.ts
@repo/core:lint:eslint:    2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:   11:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   23:59  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   29:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   46:20  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   49:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   69:20  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   72:38  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\pushDispatcher.ts
@repo/core:lint:eslint:   13:51  warning  PUSH_DISPATCH_SECRET is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\resonantProxy.ts
@repo/core:lint:eslint:   14:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   17:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\resources.ts
@repo/core:lint:eslint:   20:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\runtimes\educational.runtime.ts
@repo/core:lint:eslint:   3:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\runtimes\profile.runtime.ts
@repo/core:lint:eslint:   8:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\school.ts
@repo/core:lint:eslint:   110:51   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   133:117  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\schoolForest.ts
@repo/core:lint:eslint:   35:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   51:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   64:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   73:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   84:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\serverAdapter.ts
@repo/core:lint:eslint:   13:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   14:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   15:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\social.ts
@repo/core:lint:eslint:   40:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   40:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\studentPotential.ts
@repo/core:lint:eslint:   27:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   62:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   89:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\temporalProxy.ts
@repo/core:lint:eslint:   15:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   34:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   49:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\tracking.ts
@repo/core:lint:eslint:   13:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   21:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\api\warmMirror.ts
@repo/core:lint:eslint:   11:43  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   19:3   warning  Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\config\publicUrls.ts
@repo/core:lint:eslint:   2:38  warning  EXPO_PUBLIC_GURUDEVI_APP_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\constants\SriLankanSchools.ts
@repo/core:lint:eslint:   861:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\efficiency\policy.ts
@repo/core:lint:eslint:   53:17  warning  Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useAppLifecycle.ts
@repo/core:lint:eslint:   110:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   110:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   155:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   155:70  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useAuthLifecycle.ts
@repo/core:lint:eslint:   21:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:   86:88  warning  Refactor this function to reduce its Cognitive Complexity from 30 to the 15 allowed    sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useDomainServices.ts
@repo/core:lint:eslint:   4:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useEntity.ts
@repo/core:lint:eslint:    9:17  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   12:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   30:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   34:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   54:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   71:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useFeatureRegistry.ts
@repo/core:lint:eslint:   95:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useForm.ts
@repo/core:lint:eslint:   14:50  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useManualSnapshot.ts
@repo/core:lint:eslint:   12:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   33:67  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useMediaDownloader.ts
@repo/core:lint:eslint:    79:58  warning  Refactor this function to reduce its Cognitive Complexity from 23 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint:    99:15  error    Empty block statement                                                                no-empty
@repo/core:lint:eslint:   116:21  error    Empty block statement                                                                no-empty
@repo/core:lint:eslint:   119:15  error    Empty block statement                                                                no-empty
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\usePendingActions.ts
@repo/core:lint:eslint:   74:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useSafeMutation.ts
@repo/core:lint:eslint:    6:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:   42:35  warning  Refactor this function to reduce its Cognitive Complexity from 31 to the 15 allowed    sonarjs/cognitive-complexity
@repo/core:lint:eslint:   94:43  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useSovereignEffect.ts
@repo/core:lint:eslint:   36:5  warning  Unused eslint-disable directive (no problems were reported)
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useTenantContext.ts
@repo/core:lint:eslint:   2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\hooks\useTracking.ts
@repo/core:lint:eslint:   20:45  warning  EXPO_PUBLIC_PLATFORM is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   21:14  warning  EXPO_PUBLIC_PLATFORM is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\audit-log.ts
@repo/core:lint:eslint:    22:8    warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    48:34   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    74:14   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    75:39   warning  POSTHOG_API_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:    75:70   warning  POSTHOG_HOST is not listed as a dependency in turbo.json     turbo/no-undeclared-env-vars
@repo/core:lint:eslint:    77:25   error    A `require()` style import is forbidden                      @typescript-eslint/no-require-imports
@repo/core:lint:eslint:    78:27   warning  POSTHOG_API_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:    79:13   warning  POSTHOG_HOST is not listed as a dependency in turbo.json     turbo/no-undeclared-env-vars
@repo/core:lint:eslint:    88:32   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   134:61   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   134:73   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   134:100  warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   136:41   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   137:34   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   148:17   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   149:9    error    'statusCode' is never reassigned. Use 'const' instead        prefer-const
@repo/core:lint:eslint:   157:31   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   159:32   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   176:21   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   180:31   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   192:36   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   196:61   warning  Unexpected any. Specify a different type                     @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\cloudinary.ts
@repo/core:lint:eslint:   25:21  warning  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is not listed as a dependency in turbo.json     turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   26:24  warning  EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   47:10  warning  Unexpected any. Specify a different type                                          @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\errors.ts
@repo/core:lint:eslint:   27:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   39:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   49:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   68:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\gradePublication.ts
@repo/core:lint:eslint:   18:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   36:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   71:75  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   91:72  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\grading.ts
@repo/core:lint:eslint:   23:18  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\idempotency.ts
@repo/core:lint:eslint:    21:8   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   119:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   119:88  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   121:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   122:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   178:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   198:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   198:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   267:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\inviteCodes.ts
@repo/core:lint:eslint:   85:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   86:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   87:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\monitoring\sentry.ts
@repo/core:lint:eslint:   12:15  warning  EXPO_PUBLIC_SENTRY_DSN is not listed as a dependency in turbo.json          turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   17:18  warning  EXPO_PUBLIC_SENTRY_ENVIRONMENT is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   18:14  warning  EXPO_PUBLIC_SENTRY_RELEASE is not listed as a dependency in turbo.json      turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\permissions.ts
@repo/core:lint:eslint:   84:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   89:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   97:49  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\supabaseAuthStorage.ts
@repo/core:lint:eslint:   4:22  warning  EXPO_PUBLIC_SUPABASE_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\delta.ts
@repo/core:lint:eslint:   14:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   14:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   21:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\deviceSecurityIntents.ts
@repo/core:lint:eslint:   2:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\errorClassifier.ts
@repo/core:lint:eslint:   9:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\eventBus.ts
@repo/core:lint:eslint:   73:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   90:57  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   94:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\hooks\useOptimisticMerge.ts
@repo/core:lint:eslint:   44:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\hooks\useSyncStatus.ts
@repo/core:lint:eslint:   53:11  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\registry.ts
@repo/core:lint:eslint:    14:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    14:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    22:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    44:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    57:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    64:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    77:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    84:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    93:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    99:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   103:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   109:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   125:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   131:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   139:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\sync\SyncManager.tsx
@repo/core:lint:eslint:    3:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:   38:45  warning  Refactor this function to reduce its Cognitive Complexity from 34 to the 15 allowed    sonarjs/cognitive-complexity
@repo/core:lint:eslint:   94:23  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\lib\sync\types.ts
@repo/core:lint:eslint:   13:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\apiInterceptor.ts
@repo/core:lint:eslint:    1:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:   19:35  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   59:39  warning  Unexpected any. Specify a different type                                               @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\auth\bootstrapRoutes.ts
@repo/core:lint:eslint:   28:17  warning  Refactor this function to reduce its Cognitive Complexity from 31 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\domains\audit\ports.ts
@repo/core:lint:eslint:   17:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/c
ore:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\domains\community\ports.ts
@repo/core:lint:eslint:   85:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   91:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   94:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\domains\educational\ports.ts
@repo/core:lint:eslint:    69:81   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   124:47   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   189:15   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   190:34   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   191:37   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   191:51   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   192:41   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   193:66   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   194:42   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   195:41   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   196:58   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   197:59   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   198:45   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   199:111  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   202:48   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   203:54   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   204:29   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   204:43   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   205:59   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   205:73   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   209:50   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   210:72   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   211:38   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   211:52   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   212:35   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   212:49   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   214:40   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   217:82   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   218:71   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   219:76   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   225:14   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   226:74   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   227:55   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\domains\educational\services.ts
@repo/core:lint:eslint:   225:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint:   328:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint:   330:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint:   361:9  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\domains\guardian\gradeVisibility.ts
@repo/core:lint:eslint:    8:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   20:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   28:51  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   28:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\entities\entity-protocol.ts
@repo/core:lint:eslint:   13:40  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   16:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   31:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\events\schemas.ts
@repo/core:lint:eslint:   9:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\experience\ActivityPulseContext.tsx
@repo/core:lint:eslint:   38:7  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint:   46:5  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\grading\GPACalculator.ts
@repo/core:lint:eslint:   228:57  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   229:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\i18n\config.ts
@repo/core:lint:eslint:    6:8  warning  Using exported name 'i18n' as identifier for default export                                                       import-x/no-named-as-default
@repo/core:lint:eslint:   11:8  warning  Caution: `i18n` also has a named export `use`. Check if you meant to write `import {use} from 'i18next'` instead  import-x/no-named-as-default-member
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\interfaces\crypto.port.ts
@repo/core:lint:eslint:   12:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\AuditManager.ts
@repo/core:lint:eslint:   26:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\CommunityManager.ts
@repo/core:lint:eslint:    49:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    88:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    97:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   101:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\CryptoManager.ts
@repo/core:lint:eslint:   29:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\DeepLinkManager.ts
@repo/core:lint:eslint:   135:42  warning  EXPO_PUBLIC_LOCAL_WEB_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\EducationalManager.ts
@repo/core:lint:eslint:   240:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   255:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   256:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   287:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   288:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   375:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\GrowthManager.ts
@repo/core:lint:eslint:    28:68  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   248:47  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   280:17  warning  Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint:   283:30  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   455:30  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   505:30  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   537:33  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   541:52  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   660:11  warning  Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\IdentityManager.ts
@repo/core:lint:eslint:   58:74  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   62:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\NotificationManager.ts
@repo/core:lint:eslint:   21:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\ProfileManager.ts
@repo/core:lint:eslint:   71:56  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\managers\notification.factory.ts
@repo/core:lint:eslint:   17:18  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\permissions\crypto.ts
@repo/core:lint:eslint:   11:7  warning  EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   12:7  warning  NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\permissions\localEvaluator.native.ts
@repo/core:lint:eslint:    26:23  warning  Refactor this function to reduce its Cognitive Complexity from 27 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint:    34:7   warning  EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR is not listed as a dependency in turbo.json          turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   106:41  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   110:53  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   112:51  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\permissions\sanctuaryFeature.ts
@repo/core:lint:eslint:   69:17  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\permissions\signature.ts
@repo/core:lint:eslint:   41:7  warning  EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   42:7  warning  NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\auth.port.ts
@repo/core:lint:eslint:     4:9   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    10:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   135:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   139:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   145:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   150:50  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   150:65  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\authz.port.ts
@repo/core:lint:eslint:   6:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\database.port.ts
@repo/core:lint:eslint:   2:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   3:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   6:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\eventBus.port.ts
@repo/core:lint:eslint:   16:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\growth.port.ts
@repo/core:lint:eslint:    20:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    48:85  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   105:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\identity.port.ts
@repo/core:lint:eslint:   56:68  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   76:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\notification.port.ts
@repo/core:lint:eslint:   21:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\ports\realtime.port.ts
@repo/core:lint:eslint:   14:34  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\schemas\user.schema.ts
@repo/core:lint:eslint:   122:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   123:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\utils\QRResolver.ts
@repo/core:lint:eslint:   32:17  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\utils\errorNormalizer.ts
@repo/core:lint:eslint:   10:85  warning  Refactor this function to reduce its Cognitive Complexity from 53 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\utils\logger.ts
@repo/core:lint:eslint:   1:8  warning  Using exported name 'pino' as identifier for default export  import-x/no-named-as-default
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\utils\temporalUtils.ts
@repo/core:lint:eslint:   73:47  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   73:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   73:76  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   74:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   74:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   74:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   74:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   74:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\utils\validators.ts
@repo/core:lint:eslint:   183:55  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   185:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\logic\workspace\workspaceSwitcher.ts
@repo/core:lint:eslint:   3:17  warning  Refactor this function to reduce its Cognitive Complexity from 25 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\monitoring\sentry.ts
@repo/core:lint:eslint:   12:15  warning  EXPO_PUBLIC_SENTRY_DSN is not listed as a dependency in turbo.json          turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   17:18  warning  EXPO_PUBLIC_SENTRY_ENVIRONMENT is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint:   18:14  warning  EXPO_PUBLIC_SENTRY_RELEASE is not listed as a dependency in turbo.json      turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\native\bootstrap.ts
@repo/core:lint:eslint:   38:19  warning  EXPO_PUBLIC_USE_MMKV is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\native\flows\FlowResolver.ts
@repo/core:lint:eslint:    17:12  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    18:11  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    80:21  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   122:24  warning  Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint:   253:21  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\native\guestDataSync.ts
@repo/core:lint:eslint:    84:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   183:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   197:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   222:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\native\runtimeAdapter.ts
@repo/core:lint:eslint:   111:33  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   111:59  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   117:16  warning  Caution: `NetInfo` also has a named export `fetch`. Check if you meant to write `import {fetch} from '@react-native-community/netinfo'` instead  import-x/no-named-as-default-member
@repo/core:lint:eslint:   186:27  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   191:42  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   199:32  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   203:32  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   210:69  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   214:62  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   218:66  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   225:37  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   246:37  warning  Unexpected any. Specify a different type                                                                                                         @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\native\storage.ts
@repo/core:lint:eslint:    23:35  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   253:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\native\supabaseAuthStorage.ts
@repo/core:lint:eslint:   6:21  warning  EXPO_PUBLIC_SUPABASE_URL is not listed as a dependency in turbo.json  turbo/no-undeclared-env-vars
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\native\useAuthLifecycle.ts
@repo/core:lint:eslint:   23:10  warning  Avoid the legacy useStore facade; use a focused store selector or domain hook instead  polymath/ban-use-store
@repo/core:lint:eslint:   52:88  warning  Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed    sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\offline\resilience.ts
@repo/core:lint:eslint:   35:7   warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint:   53:13  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\platform\useResponsiveRenderer.ts
@repo/core:lint:eslint:   6:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   6:49  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\store\useCedarDecisionStore.ts
@repo/core:lint:eslint:   47:66  warning  Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed  sonarjs/cognitive-complexity
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\store\useDeviceSecurityStore.ts
@repo/core:lint:eslint:    54:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    75:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    95:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   111:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   127:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\store\useNotificationStore.ts
@repo/core:lint:eslint:   63:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   79:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   95:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\types\Community.ts
@repo/core:lint:eslint:    22:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   279:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\types\Errors.ts
@repo/core:lint:eslint:   41:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   45:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   79:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\types\Form.ts
@repo/core:lint:eslint:   15:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   25:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   33:54  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   33:61  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   68:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\types\Resource.ts
@repo/core:lint:eslint:   34:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\types\runtime.ts
@repo/core:lint:eslint:    40:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    41:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    43:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:    50:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   111:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   111:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   145:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint:   146:64  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\utils\random.ts
@repo/core:lint:eslint:   25:5  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-non-null-assertion')
@repo/core:lint:eslint:   29:3  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint: 
@repo/core:lint:eslint: C:\x\packages\core\src\utils\temporal.ts
@repo/core:lint:eslint:   36:3  warning  Unused eslint-disable directive (no problems were reported from 'no-restricted-syntax')
@repo/core:lint:eslint: 
@repo/core:lint:eslint: ✖ 671 problems (6 errors, 665 warnings)
@repo/core:lint:eslint:   2 errors and 14 warnings potentially fixable with the `--fix` option.
@repo/core:lint:eslint: 

@repo/core:lint:eslint: 
@repo/core:lint:eslint: --------------------------------------------------------------------------------

@repo/core:lint:eslint: REPORT SUMMARY

@repo/core:lint:eslint: Duration: 62.3 seconds

@repo/core:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)

@repo/core:lint:eslint: Raw Log:  C:\x\reports\run-packages_core-lint_eslint.log
@repo/core:lint:eslint: Report:   C:\x\reports\run-packages_core-lint_eslint-report.txt
@repo/core:lint:eslint: --------------------------------------------------------------------------------

@repo/core:lint:eslint: [ELIFECYCLE] Command failed with exit code 1.

@repo/core#lint:eslint:  ERROR  command (C:\x\packages\core) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.1.0\pnpm.exe run lint:eslint exited (1)



 Tasks:    36 successful, 37 total
Cached:    24 cached, 37 total
  Time:    1m19.82s 
Failed:    @repo/core#lint:eslint


 ERROR  run failed: command  exited (1)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 80.4 seconds
Findings: 1 (Errors: 1, Warnings: 0)

Raw Log:  C:\x\reports\run-package_json-lint.log

Report:   C:\x\reports\run-package_json-lint-report.txt
--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
