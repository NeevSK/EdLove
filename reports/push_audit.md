# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 9/4/2026, 8:16:33 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 79.6s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 369 |
| apps/gurudevi-mobile                     | [WARN] deprecated @testing-library | 2 |
| packages/editorial | 66 |
| packages/lk-edu-geo                      | [WARN] deprecated @types | 2 |

## Detailed Findings

### Category: General
- [WARN] 20 deprecated subdependencies found: @babel/plugin-proposal-private-methods@7.18.6, @unimodules/core@7.1.2, @unimodules/react-native-adapter@6.3.9, @xmldom/xmldom@0.8.12, @xmldom/xmldom@0.9.10, abab@2.0.6, babel-plugin-react-compiler@19.1.0-rc.1-rc-af1b7da-20250421, boolean@3.2.0, cuid@3.0.0, domexception@4.0.0, expo-random@14.0.1, node-domexception@1.0.0, prebuild-install@7.1.3, reflect-metadata@0.2.1, tsconfck@3.1.6, uuid@10.0.0, uuid@7.0.3, uuid@8.3.2, uuid@9.0.1, whatwg-encoding@3.1.1
- . preinstall$ node -e "if(process.env.npm_config_user_agent && !/pnpm/.test(process.env.npm_config_user_agent)) { console.error('\u001b[31mFATAL: This project requires pnpm. Use \'pnpm install\' to continue.\u001b[0m'); process.exit(1); }"
- [WARN] Issues with peer dependencies found. Run "pnpm peers check" to list them.
- [WARN] 20 deprecated subdependencies found: @babel/plugin-proposal-private-methods@7.18.6, @unimodules/core@7.1.2, @unimodules/react-native-adapter@6.3.9, @xmldom/xmldom@0.8.12, @xmldom/xmldom@0.9.10, abab@2.0.6, babel-plugin-react-compiler@19.1.0-rc.1-rc-af1b7da-20250421, boolean@3.2.0, cuid@3.0.0, domexception@4.0.0, expo-random@14.0.1, node-domexception@1.0.0, prebuild-install@7.1.3, reflect-metadata@0.2.1, tsconfck@3.1.6, uuid@10.0.0, uuid@7.0.3, uuid@8.3.2, uuid@9.0.1, whatwg-encoding@3.1.1
- . preinstall$ node -e "if(process.env.npm_config_user_agent && !/pnpm/.test(process.env.npm_config_user_agent)) { console.error('\u001b[31mFATAL: This project requires pnpm. Use \'pnpm install\' to continue.\u001b[0m'); process.exit(1); }"
- [WARN] Issues with peer dependencies found. Run "pnpm peers check" to list them.
- @repo/types-shim:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/profile:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/admin:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/payments:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/accounting:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/library:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/community:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/workforce:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/classroom:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ui:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/graphics:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/analytics:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ai:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
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
- @repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
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
- apps-gurudevi-marketing-web:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
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
- @repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
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
- @repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
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
- @repo/core:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
- @repo/core:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\adapters\powersync\SupabasePowerSyncConnector.ts" "src\api\handlers\sync.ts"
- @repo/core:lint:biome:      16     │ - class·PowerSyncUploadError·{␍
- @repo/core:lint:biome:      17     │ - ··readonly·_tag·=·'PowerSyncUploadError';␍
- @repo/core:lint:biome:      24     │ - class·PowerSyncAccountChangedError·extends·PowerSyncUploadError·{␍
- @repo/core:lint:biome:      29     │ - ):·Effect.Effect<{·access_token:·string;·user_id:·string;·expires_at?:·number·},·PowerSyncUploadError>·{␍
- @repo/core:lint:biome:      31     │ - ····Effect.mapError((error)·=>·new·PowerSyncUploadError(0,·error.message)),␍
- @repo/core:lint:biome:      32     │ - ····Effect.flatMap(({·data:·{·session·},·error·})·=>·{␍
- @repo/core:lint:biome:      34     │ - ········return·Effect.fail(new·PowerSyncAccountChangedError(0,·'account_changed'));␍
- @repo/core:lint:biome:      36     │ - ······return·error·||·!session·||·!session.user·||·session.user.is_anonymous␍
- @repo/core:lint:biome:      37     │ - ········?·Effect.fail(new·PowerSyncUploadError(0,·'no_session'))␍
- @repo/core:lint:biome:     105     │ - ················Effect.flatMap((errorData:·any)·=>␍
- @repo/core:lint:biome:     107     │ - ····················new·PowerSyncUploadError(␍
- @repo/core:lint:biome:     109     │ - ······················errorData?.message·||·`Sanctuary·API·sync·failed·with·status·${res.status}`,␍
- @repo/core:lint:biome:     119     │ - ············if·(e·instanceof·PowerSyncUploadError)·return·Effect.fail(e);␍
- @repo/core:lint:biome:     120     │ - ············return·Effect.fail(new·PowerSyncUploadError(0,·String(e)));␍
- @repo/core:lint:biome:     131     │ - ········Effect.catchAll((error)·=>␍
- @repo/core:lint:biome:     133     │ - ············const·isAccountChanged·=·error·instanceof·PowerSyncAccountChangedError;␍
- @repo/core:lint:biome:     135     │ - ··············reason:·error·instanceof·PowerSyncAccountChangedError·?·'account_switched'·:·'service_down',␍
- @repo/core:lint:biome:     137     │ - ··········}).pipe(Effect.zipRight(Effect.fail(error))),␍
- @repo/core:lint:biome:   > 4 │ import { SyncDelegateError, SyncOperationError, SyncTableError } from '@repo/core/effect/Errors';
- @repo/core:lint:biome:       4     │ - import·{·SyncDelegateError,·SyncOperationError,·SyncTableError·}·from·'@repo/core/effect/Errors';␍
- @repo/core:lint:biome:           2 │ + import·{·SyncDelegateError,·SyncOperationError,·SyncTableError·}·from·'@repo/core/effect/Errors';␍
- @repo/core:lint:biome:       4     │ - import·{·SyncDelegateError,·SyncOperationError,·SyncTableError·}·from·'@repo/core/effect/Errors';␍
- @repo/core:lint:biome:      49     │ - class·IdempotencyConflictError·extends·Error·{␍
- @repo/core:lint:biome:      62     │ - ····throw·new·Error('Invalid·payload:·crud·must·be·an·array');␍
- @repo/core:lint:biome:      90     │ - ············throw·new·IdempotencyConflictError(␍
- @repo/core:lint:biome:     101     │ - ··············throw·new·IdempotencyConflictError(␍
- @repo/core:lint:biome:     115     │ - ··········console.warn(`[Sync]·No·active·Prisma·model·mapping·for·table:·"${table}"`);␍
- @repo/core:lint:biome:     116     │ - ··········throw·new·SyncTableError({·table·});␍
- @repo/core:lint:biome:     121     │ - ··········throw·new·SyncDelegateError({·modelKey·});␍
- @repo/core:lint:biome:     142     │ - ············throw·new·SyncOperationError({·op·});␍
- @repo/core:lint:biome: Found 4 errors.
- @repo/core:lint:biome:   × Some errors were emitted while running checks.
- @repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core#lint:biome:  ERROR  command (C:\x\packages\core) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.1.0\pnpm.exe run lint:biome exited (1)
- ERROR  run failed: command  exited (1)
- Findings: 1 (Errors: 1, Warnings: 0)

### Category: apps/gurudevi-mobile                     | [WARN] deprecated @testing-library
- apps/gurudevi-mobile                     | [WARN] deprecated @testing-library/jest-native@5.4.3
- apps/gurudevi-mobile                     | [WARN] deprecated @testing-library/jest-native@5.4.3

### Category: packages/editorial
- @repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/accounting:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @intuitui-labs/lk-edu-geo:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/library:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- gurudevi-mobile:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- apps-edlove-web:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/graphics:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/form-builder:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/scanner-kit:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
- @repo/ai:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it

### Category: packages/lk-edu-geo                      | [WARN] deprecated @types
- packages/lk-edu-geo                      | [WARN] deprecated @types/glob@9.0.0
- packages/lk-edu-geo                      | [WARN] deprecated @types/glob@9.0.0

## Raw Output

```text
Scope: all 32 workspace projects

✓ Lockfile passes supply-chain policies (verified 18m ago)

Progress: resolved 0, reused 11, downloaded 0, added 0

apps/gurudevi-mobile                     | [WARN] deprecated @testing-library/jest-native@5.4.3

Progress: resolved 0, reused 182, downloaded 0, added 0

Progress: resolved 0, reused 335, downloaded 0, added 0

packages/lk-edu-geo                      | [WARN] deprecated @types/glob@9.0.0

Progress: resolved 0, reused 405, downloaded 0, added 0

Progress: resolved 0, reused 456, downloaded 0, added 0

Progress: resolved 0, reused 469, downloaded 0, added 0

Progress: resolved 0, reused 602, downloaded 0, added 0

Progress: resolved 0, reused 691, downloaded 0, added 0

[WARN] 20 deprecated subdependencies found: @babel/plugin-proposal-private-methods@7.18.6, @unimodules/core@7.1.2, @unimodules/react-native-adapter@6.3.9, @xmldom/xmldom@0.8.12, @xmldom/xmldom@0.9.10, abab@2.0.6, babel-plugin-react-compiler@19.1.0-rc.1-rc-af1b7da-20250421, boolean@3.2.0, cuid@3.0.0, domexception@4.0.0, expo-random@14.0.1, node-domexception@1.0.0, prebuild-install@7.1.3, reflect-metadata@0.2.1, tsconfck@3.1.6, uuid@10.0.0, uuid@7.0.3, uuid@8.3.2, uuid@9.0.1, whatwg-encoding@3.1.1

Progress: resolved 1, reused 704, downloaded 0, added 0

Packages: +17
+++++++++++++++++

Progress: resolved 17, reused 711, downloaded 0, added 17, done

apps/gurudevi-mobile postinstall$ node scripts/copy-powersync-assets.mjs

apps/gurudevi-mobile postinstall: Done

. preinstall$ node -e "if(process.env.npm_config_user_agent && !/pnpm/.test(process.env.npm_config_user_agent)) { console.error('\u001b[31mFATAL: This project requires pnpm. Use \'pnpm install\' to continue.\u001b[0m'); process.exit(1); }"

. preinstall: Done
. prepare$ pnpm exec husky


. prepare: Done

[WARN] Issues with peer dependencies found. Run "pnpm peers check" to list them.

Done in 36.5s using pnpm v12.1.0

Scope: all 32 workspace projects

✓ Lockfile passes supply-chain policies (verified 13s ago)

Progress: resolved 0, reused 1, downloaded 0, added 0

apps/gurudevi-mobile                     | [WARN] deprecated @testing-library/jest-native@5.4.3

packages/lk-edu-geo                      | [WARN] deprecated @types/glob@9.0.0

Progress: resolved 0, reused 379, downloaded 0, added 0

Progress: resolved 0, reused 469, downloaded 0, added 0

[WARN] 20 deprecated subdependencies found: @babel/plugin-proposal-private-methods@7.18.6, @unimodules/core@7.1.2, @unimodules/react-native-adapter@6.3.9, @xmldom/xmldom@0.8.12, @xmldom/xmldom@0.9.10, abab@2.0.6, babel-plugin-react-compiler@19.1.0-rc.1-rc-af1b7da-20250421, boolean@3.2.0, cuid@3.0.0, domexception@4.0.0, expo-random@14.0.1, node-domexception@1.0.0, prebuild-install@7.1.3, reflect-metadata@0.2.1, tsconfck@3.1.6, uuid@10.0.0, uuid@7.0.3, uuid@8.3.2, uuid@9.0.1, whatwg-encoding@3.1.1

Progress: resolved 1, reused 704, downloaded 0, added 0

Packages: +17
+++++++++++++++++

Progress: resolved 17, reused 711, downloaded 0, added 17, done

apps/gurudevi-mobile postinstall$ node scripts/copy-powersync-assets.mjs

. preinstall$ node -e "if(process.env.npm_config_user_agent && !/pnpm/.test(process.env.npm_config_user_agent)) { console.error('\u001b[31mFATAL: This project requires pnpm. Use \'pnpm install\' to continue.\u001b[0m'); process.exit(1); }"

. preinstall: Done

. prepare$ pnpm exec husky

apps/gurudevi-mobile postinstall: Done

. prepare: Done

[WARN] Issues with peer dependencies found. Run "pnpm peers check" to list them.

Done in 25.7s using pnpm v12.1.0

$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint" --name "package_json-lint"

>>> Starting Process: 9/4/2026, 8:16:28 AM (IST)

>>> Command: pnpm turbo run lint
>>> Working Dir: C:\x
>>> Log output: C:\x\reports\run-package_json-lint.log
--------------------------------------------------------------------------------

• turbo 2.10.12


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/editorial, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile

   • Running lint in 31 packages
   • Remote caching disabled


@repo/types-shim:lint:biome: cache hit, replaying logs e1d7d053888c96d9

@repo/database:lint:biome: cache hit, replaying logs 69d1cd606512cb55
@repo/profile:lint:biome: cache hit, replaying logs 51466e549aabe7a0
@repo/admin:lint:biome: cache hit, replaying logs 5a8bbaa45b7e3ba3
@repo/payments:lint:biome: cache hit, replaying logs 217418db7905ae0e

@repo/accounting:lint:biome: cache hit, replaying logs 3bb58ef0a7ae721d
@repo/profile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_profile-lint_biome"
@repo/profile:lint:biome: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
@repo/profile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/profile:lint:biome: >>> Working Dir: C:\x\packages\profile
@repo/profile:lint:biome: >>> Log output: C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/admin:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_admin-lint_biome"
@repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: cache hit, replaying logs b0ac8a01181df10e
@repo/admin:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/types-shim:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"
@repo/admin:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/types-shim:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/admin:lint:biome: >>> Working Dir: C:\x\packages\admin
@repo/types-shim:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/admin:lint:biome: >>> Log output: C:\x\reports\run-packages_admin-lint_biome.log
@repo/types-shim:lint:biome: >>> Working Dir: C:\x\packages\types-shim
@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:biome: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/types-shim:lint:biome: >>> No modified files found to format.
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@repo/types-shim:lint:biome: REPORT SUMMARY
@repo/types-shim:lint:biome: Duration: 3.0 seconds
@repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint:biome: Raw Log:  C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: Report:   C:\x\reports\run-packages_types-shim-lint_biome-report.txt
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------
@repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/payments:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_payments-lint_biome"
@repo/profile:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/profile:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/profile:lint:biome: >>> No modified files found to format.
@repo/profile:lint:biome: 
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/profile:lint:biome: REPORT SUMMARY
@repo/profile:lint:biome: Duration: 3.2 seconds
@repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_database-lint_biome"
@repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/admin:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/accounting:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_accounting-lint_biome"
@repo/accounting:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
@repo/payments:lint:biome: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
@repo/payments:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/payments:lint:biome: >>> Working Dir: C:\x\packages\payments
@repo/profile:lint:biome: Raw Log:  C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: Report:   C:\x\reports\run-packages_profile-lint_biome-report.txt
@repo/profile:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_self-lint_biome"
@repo/self:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/database:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
@repo/database:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
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
@repo/accounting:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/accounting:lint:biome: >>> Working Dir: C:\x\packages\accounting
@repo/payments:lint:biome: >>> Log output: C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: --------------------------------------------------------------------------------
@repo/payments:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
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

@repo/self:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/self:lint:biome: >>> Working Dir: C:\x\packages\self
@repo/self:lint:biome: >>> Log output: C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:biome: >>> Working Dir: C:\x\packages\database
@repo/database:lint:biome: >>> Log output: C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/database:lint:biome: >>> No modified files found to format.
@repo/database:lint:biome: 
@repo/database:lint:biome: --------------------------------------------------------------------------------
@repo/database:lint:biome: REPORT SUMMARY
@repo/database:lint:biome: Duration: 2.7 seconds
@repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint:biome: Raw Log:  C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint:biome: Report:   C:\x\reports\run-packages_database-lint_biome-report.txt
@repo/database:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
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
@repo/self:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/self:lint:biome: >>> No modified files found to format.
@repo/self:lint:biome: 
@repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/accounting:lint:biome: Raw Log:  C:\x\reports\run-packages_accounting-lint_biome.log
@repo/self:lint:biome: --------------------------------------------------------------------------------
@repo/accounting:lint:biome: Report:   C:\x\reports\run-packages_accounting-lint_biome-report.txt
@repo/self:lint:biome: REPORT SUMMARY
@repo/accounting:lint:biome: --------------------------------------------------------------------------------
@repo/self:lint:biome: Duration: 2.6 seconds
@repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/self:lint:biome: Raw Log:  C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: Report:   C:\x\reports\run-packages_self-lint_biome-report.txt
@repo/self:lint:biome: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:lint:biome: cache hit, replaying logs 85bb9cc9ea790221
@repo/core:lint:biome: cache miss, executing e0a4cac6a4b78190
@repo/library:lint:biome: cache hit, replaying logs 3fbb3a5ea03a0b24
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
@repo/editorial:lint:biome: cache hit, replaying logs 018cc4bb29a89b5e
gurudevi-mobile:lint:biome: cache hit, replaying logs 1eaca876bd990cd0
@repo/library:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_library-lint_biome"
@repo/library:lint:biome: >>> Starting Process: 9/4/2026, 8:06:21 AM (IST)
@repo/library:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/library:lint:biome: >>> Working Dir: C:\x\packages\library
@repo/library:lint:biome: >>> Log output: C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: --------------------------------------------------------------------------------
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
@repo/community:lint:biome: cache hit, replaying logs 2895f09c006be77e
@repo/editorial:lint:biome: $ biome check src
@repo/editorial:lint:biome: Checked 5 files in 29ms. No fixes applied.
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
gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
gurudevi-mobile:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-mobile-lint_biome-report.txt
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_community-lint_biome"
@repo/community:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
@repo/community:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/community:lint:biome: >>> Working Dir: C:\x\packages\community
@repo/community:lint:biome: >>> Log output: C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/community:lint:biome: >>> No modified files found to format.
@repo/community:lint:biome: 
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: REPORT SUMMARY
@repo/community:lint:biome: Duration: 2.7 seconds
@repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/community:lint:biome: Raw Log:  C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: Report:   C:\x\reports\run-packages_community-lint_biome-report.txt
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/workforce:lint:biome: cache hit, replaying logs d385bc1ef7cff66d
@repo/workforce:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_workforce-lint_biome"
@repo/workforce:lint:biome: >>> Starting Process: 9/4/2026, 8:06:14 AM (IST)
@repo/workforce:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/workforce:lint:biome: >>> Working Dir: C:\x\packages\workforce
@repo/workforce:lint:biome: >>> Log output: C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: --------------------------------------------------------------------------------
@repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/workforce:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
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
apps-edlove-web:lint:biome: cache hit, replaying logs f8521e78004a1331
@repo/classroom:lint:biome: cache hit, replaying logs 977a9f28ce247199
@repo/ui:lint:biome: cache hit, replaying logs ff123148d8012085
@repo/graphics:lint:biome: cache hit, replaying logs 766b9dd130a998e3
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
apps-edlove-web:lint:biome: Duration: 3.3 seconds
apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint:biome: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: Report:   C:\x\reports\run-apps_edlove-web-lint_biome-report.txt
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_classroom-lint_biome"
@repo/classroom:lint:biome: >>> Starting Process: 9/4/2026, 8:06:18 AM (IST)
@repo/classroom:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/classroom:lint:biome: >>> Working Dir: C:\x\packages\classroom
@repo/classroom:lint:biome: >>> Log output: C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/classroom:lint:biome: >>> No modified files found to format.
@repo/classroom:lint:biome: 
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/classroom:lint:biome: REPORT SUMMARY
@repo/classroom:lint:biome: Duration: 2.7 seconds
@repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/classroom:lint:biome: Raw Log:  C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: Report:   C:\x\reports\run-packages_classroom-lint_biome-report.txt
@repo/classroom:lint:biome: --------------------------------------------------------------------------------
@repo/ui:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ui-lint_biome"
@repo/ui:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/ui:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/ui:lint:biome: >>> Working Dir: C:\x\packages\ui
@repo/ui:lint:biome: >>> Log output: C:\x\reports\run-packages_ui-lint_biome.log
@repo/ui:lint:biome: --------------------------------------------------------------------------------
@repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/ui:lint:biome: >>> No modified files found to format.
@repo/ui:lint:biome: 
@repo/ui:lint:biome: --------------------------------------------------------------------------------
@repo/ui:lint:biome: REPORT SUMMARY
@repo/ui:lint:biome: Duration: 2.8 seconds
@repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/ui:lint:biome: Raw Log:  C:\x\reports\run-packages_ui-lint_biome.log
@repo/ui:lint:biome: Report:   C:\x\reports\run-packages_ui-lint_biome-report.txt
@repo/ui:lint:biome: --------------------------------------------------------------------------------
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
@repo/people:lint:biome: cache hit, replaying logs a49c9c710c4072a7
@repo/analytics:lint:biome: cache hit, replaying logs e36e50043f389f5c
@repo/form-builder:lint:biome: cache hit, replaying logs f6d5feddfd830221
@repo/people:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_people-lint_biome"
@repo/people:lint:biome: >>> Starting Process: 9/4/2026, 8:06:17 AM (IST)
@repo/people:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/people:lint:biome: >>> Working Dir: C:\x\packages\people
@repo/people:lint:biome: >>> Log output: C:\x\reports\run-packages_people-lint_biome.log
@repo/analytics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_analytics-lint_biome"
@repo/people:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: cache hit, replaying logs 02b03c147478984a
@repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/analytics:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
@repo/analytics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/analytics:lint:biome: >>> Working Dir: C:\x\packages\analytics
@repo/analytics:lint:biome: >>> Log output: C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
@repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
@repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/analytics:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/analytics:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
@repo/analytics:lint:biome: >>> No modified files found to format.
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
@repo/analytics:lint:biome: REPORT SUMMARY
@repo/analytics:lint:biome: Duration: 2.8 seconds
@repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/analytics:lint:biome: Raw Log:  C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: Report:   C:\x\reports\run-packages_analytics-lint_biome-report.txt
@repo/analytics:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
@repo/people:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
@repo/people:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
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
@repo/people:lint:biome: >>> No modified files found to format.
@repo/people:lint:biome: 
@repo/people:lint:biome: --------------------------------------------------------------------------------
@repo/people:lint:biome: REPORT SUMMARY
@repo/people:lint:biome: Duration: 2.7 seconds
@repo/scanner-kit:lint:biome: cache hit, replaying logs b54b2f7dd776260d
@repo/types-shim:lint:eslint: cache hit, replaying logs 51d65ed622f0443a
@repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/people:lint:biome: Raw Log:  C:\x\reports\run-packages_people-lint_biome.log
@repo/people:lint:biome: Report:   C:\x\reports\run-packages_people-lint_biome-report.txt
@repo/people:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"
apps-gurudevi-marketing-web:lint:biome: >>> Starting Process: 9/4/2026, 8:06:13 AM (IST)
apps-gurudevi-marketing-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
apps-gurudevi-marketing-web:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/domain.test.ts', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/index.ts', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'packages/editorial/src/syndication.ts', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it
apps-gurudevi-marketing-web:lint:biome: >>> No modified files found to format.
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:biome: REPORT SUMMARY
apps-gurudevi-marketing-web:lint:biome: Duration: 2.9 seconds
apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome-report.txt
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------
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
@repo/types-shim:lint:eslint: Report:   C:\x\reports\run-packages_types-shim-lint_eslint-report.txt
@repo/types-shim:lint:eslint: --------------------------------------------------------------------------------
@repo/platform-mcp:lint:biome: cache hit, replaying logs 5bb65a37fbae49e6
@repo/ai:lint:biome: cache hit, replaying logs e31b80b028a46955
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
@repo/platform-mcp:lint:eslint: cache hit, replaying logs b271686d4d8b29fe
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
@repo/platform-mcp:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"
@repo/platform-mcp:lint:biome: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)
@repo/editorial:lint:eslint: cache hit, replaying logs 721bc057d22a36de
@repo/platform-mcp:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_platform-mcp-lint_eslint"
@repo/platform-mcp:lint:eslint: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)
@repo/platform-mcp:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/platform-mcp:lint:eslint: >>> Command: eslint .
@repo/platform-mcp:lint:biome: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:eslint: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:biome: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:eslint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------
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
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------
@repo/platform-mcp:lint:biome: >>> No modified files found to format.
@repo/platform-mcp:lint:eslint:    463:21  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:biome: 
@repo/platform-mcp:lint:eslint:    472:60  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------
@repo/platform-mcp:lint:eslint:    480:20  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:biome: REPORT SUMMARY
@repo/platform-mcp:lint:eslint:    491:25  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:biome: Duration: 1.4 seconds
@repo/platform-mcp:lint:eslint:    501:54  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/platform-mcp:lint:biome: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:eslint:    505:44  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    507:21  warning  MCP_MODE is not listed as a dependency in turbo.json                                       turbo/no-undeclared-env-vars
@repo/platform-mcp:lint:biome: Report:   C:\x\reports\run-packages_platform-mcp-lint_biome-report.txt
@repo/platform-mcp:lint:eslint:    551:22  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------
@repo/platform-mcp:lint:eslint:    554:27  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    639:64  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/platform-mcp:lint:eslint:    641:65  warning  Unexpected any. Specify a different type                                                   @typescript-eslint/no-explicit-any
@repo/editorial:lint:eslint: $ eslint src
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

@repo/database:lint:eslint: cache hit, replaying logs f93b80399e9f03a9
@repo/types-shim:lint: cache hit, replaying logs ba64c1c2b3070d1d
apps-gurudevi-marketing-web:lint:eslint: cache hit, replaying logs a96cb20d38d18e49
@repo/database:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_database-lint_eslint"
@repo/database:lint:eslint: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)
@repo/database:lint:eslint: >>> Command: eslint .
@repo/database:lint:eslint: >>> Working Dir: C:\x\packages\database
@repo/database:lint:eslint: >>> Log output: C:\x\reports\run-packages_database-lint_eslint.log
@repo/database:lint:eslint: --------------------------------------------------------------------------------
@repo/database:lint:eslint: 
@repo/database:lint:eslint: --------------------------------------------------------------------------------
@repo/database:lint:eslint: REPORT SUMMARY
@repo/database:lint:eslint: Duration: 16.5 seconds
@repo/database:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint:eslint: Raw Log:  C:\x\reports\run-packages_database-lint_eslint.log
@repo/database:lint:eslint: Report:   C:\x\reports\run-packages_database-lint_eslint-report.txt
@repo/database:lint:eslint: --------------------------------------------------------------------------------
apps-edlove-web:lint:eslint: cache hit, replaying logs 8e957530ad2947e1
@repo/types-shim:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "packages_types-shim-lint"
apps-gurudevi-marketing-web:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_gurudevi-marketingWeb-lint_eslint"
@repo/types-shim:lint: >>> Starting Process: 9/4/2026, 8:09:56 AM (IST)
apps-gurudevi-marketing-web:lint:eslint: >>> Starting Process: 9/4/2026, 8:10:04 AM (IST)
@repo/types-shim:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint
apps-gurudevi-marketing-web:lint:eslint: >>> Command: eslint .
@repo/types-shim:lint: >>> Working Dir: C:\x\packages\types-shim
apps-gurudevi-marketing-web:lint:eslint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
@repo/types-shim:lint: >>> Log output: C:\x\reports\run-packages_types-shim-lint.log
apps-gurudevi-marketing-web:lint:eslint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint.log
@repo/types-shim:lint: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:eslint: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:eslint: 
@repo/types-shim:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"
apps-gurudevi-marketing-web:lint:eslint: --------------------------------------------------------------------------------
@repo/types-shim:lint: >>> Starting Process: 9/4/2026, 8:09:57 AM (IST)
apps-gurudevi-marketing-web:lint:eslint: REPORT SUMMARY
@repo/types-shim:lint: >>> Command: node ../../scripts/scoped-biome.mjs
apps-gurudevi-marketing-web:lint:eslint: Duration: 23.6 seconds
@repo/types-shim:lint: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
apps-gurudevi-marketing-web:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:lint:eslint: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint.log
@repo/types-shim:lint: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint:eslint: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint-report.txt
@repo/types-shim:lint: >>> No modified files found to format.
apps-gurudevi-marketing-web:lint:eslint: --------------------------------------------------------------------------------
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
@repo/platform-mcp:lint: cache hit, replaying logs 8aafb85c0ae49d79
@repo/types-shim:lint: Duration: 10.3 seconds
@repo/types-shim:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint: Raw Log:  C:\x\reports\run-packages_types-shim-lint.log
@repo/types-shim:lint: Report:   C:\x\reports\run-packages_types-shim-lint-report.txt
@repo/types-shim:lint: --------------------------------------------------------------------------------
apps-edlove-web:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_edlove-web-lint_eslint"
apps-edlove-web:lint:eslint: >>> Starting Process: 9/4/2026, 8:10:04 AM (IST)
apps-edlove-web:lint:eslint: >>> Command: eslint .
apps-edlove-web:lint:eslint: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint:eslint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_eslint.log
apps-edlove-web:lint:eslint: --------------------------------------------------------------------------------
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
@repo/core:lint:eslint: cache miss, executing 5727ffd4b7d43b65
apps-edlove-web:lint:eslint:   0 errors and 1 warning potentially fixable with the `--fix` option.
apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: 
apps-edlove-web:lint:eslint: --------------------------------------------------------------------------------
apps-edlove-web:lint:eslint: REPORT SUMMARY
apps-edlove-web:lint:eslint: Duration: 23.9 seconds
apps-edlove-web:lint:eslint: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint:eslint: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_eslint.log
apps-edlove-web:lint:eslint: Report:   C:\x\reports\run-apps_edlove-web-lint_eslint-report.txt
apps-edlove-web:lint:eslint: --------------------------------------------------------------------------------
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
@repo/database:lint: cache hit, replaying logs f8e35adcccfbbcde
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
apps-gurudevi-marketing-web:lint: cache hit, replaying logs 039e757fe1402b43
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
@repo/platform-mcp:lint: 
@repo/platform-mcp:lint: --------------------------------------------------------------------------------
@repo/database:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "packages_database-lint"
@repo/platform-mcp:lint: REPORT SUMMARY
@repo/database:lint: >>> Starting Process: 9/4/2026, 8:10:13 AM (IST)
@repo/database:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint
@repo/database:lint: >>> Working Dir: C:\x\packages\database
@repo/platform-mcp:lint: Duration: 16.0 seconds
@repo/database:lint: >>> Log output: C:\x\reports\run-packages_database-lint.log
@repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint: --------------------------------------------------------------------------------
@repo/platform-mcp:lint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/database:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_database-lint_biome"
@repo/platform-mcp:lint: Report:   C:\x\reports\run-packages_platform-mcp-lint_eslint-report.txt
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
@repo/platform-mcp:lint: --------------------------------------------------------------------------------
@repo/database:lint: Raw Log:  C:\x\reports\run-packages_database-lint_biome.log
@repo/platform-mcp:lint: 
@repo/database:lint: Report:   C:\x\reports\run-packages_database-lint_biome-report.txt
@repo/platform-mcp:lint: --------------------------------------------------------------------------------
@repo/database:lint: --------------------------------------------------------------------------------
@repo/platform-mcp:lint: REPORT SUMMARY
@repo/database:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_database-lint_eslint"
@repo/platform-mcp:lint: Duration: 18.4 seconds
@repo/database:lint: >>> Starting Process: 9/4/2026, 8:10:15 AM (IST)
@repo/platform-mcp:lint: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:lint: >>> Command: eslint .
@repo/platform-mcp:lint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint.log
@repo/database:lint: >>> Working Dir: C:\x\packages\database
@repo/platform-mcp:lint: Report:   C:\x\reports\run-packages_platform-mcp-lint-report.txt
@repo/database:lint: >>> Log output: C:\x\reports\run-packages_database-lint_eslint.log
@repo/platform-mcp:lint: --------------------------------------------------------------------------------
@repo/database:lint: --------------------------------------------------------------------------------
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
apps-gurudevi-marketing-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "apps_gurudevi-marketingWeb-lint"
apps-gurudevi-marketing-web:lint: >>> Starting Process: 9/4/2026, 8:10:28 AM (IST)
apps-gurudevi-marketing-web:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint
apps-gurudevi-marketing-web:lint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint.log
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"
apps-gurudevi-marketing-web:lint: >>> Starting Process: 9/4/2026, 8:10:30 AM (IST)
apps-gurudevi-marketing-web:lint: >>> Command: node ../../scripts/scoped-biome.mjs
apps-gurudevi-marketing-web:lint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint: >>> No modified files found to format.
apps-gurudevi-marketing-web:lint: 
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint: REPORT SUMMARY
apps-gurudevi-marketing-web:lint: Duration: 1.1 seconds
apps-gurudevi-marketing-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:lint: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome-report.txt
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_gurudevi-marketingWeb-lint_eslint"
apps-gurudevi-marketing-web:lint: >>> Starting Process: 9/4/2026, 8:10:31 AM (IST)
apps-gurudevi-marketing-web:lint: >>> Command: eslint .
apps-gurudevi-marketing-web:lint: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_eslint.log
apps-gurudevi-marketing-web:lint: --------------------------------------------------------------------------------
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
apps-edlove-web:lint: cache hit, replaying logs 3331a4e0d19b329e
apps-edlove-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "pnpm run lint:biome && pnpm run lint:eslint" --name "apps_edlove-web-lint"
apps-edlove-web:lint: >>> Starting Process: 9/4/2026, 8:10:28 AM (IST)
apps-edlove-web:lint: >>> Command: pnpm run lint:biome && pnpm run lint:eslint
apps-edlove-web:lint: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint.log
apps-edlove-web:lint: --------------------------------------------------------------------------------
apps-edlove-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_edlove-web-lint_biome"
apps-edlove-web:lint: >>> Starting Process: 9/4/2026, 8:10:30 AM (IST)
apps-edlove-web:lint: >>> Command: node ../../scripts/scoped-biome.mjs
apps-edlove-web:lint: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint: --------------------------------------------------------------------------------
apps-edlove-web:lint: >>> No modified files found to format.
apps-edlove-web:lint: 
apps-edlove-web:lint: --------------------------------------------------------------------------------
apps-edlove-web:lint: REPORT SUMMARY
apps-edlove-web:lint: Duration: 1.1 seconds
apps-edlove-web:lint: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint: Report:   C:\x\reports\run-apps_edlove-web-lint_biome-report.txt
apps-edlove-web:lint: --------------------------------------------------------------------------------
apps-edlove-web:lint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "apps_edlove-web-lint_eslint"
apps-edlove-web:lint: >>> Starting Process: 9/4/2026, 8:10:31 AM (IST)
apps-edlove-web:lint: >>> Command: eslint .
apps-edlove-web:lint: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_eslint.log
apps-edlove-web:lint: --------------------------------------------------------------------------------
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

@repo/core:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_core-lint_biome"

@repo/core:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "node --max-old-space-size=4096 node_modules/eslint/bin/eslint.js ." --name "packages_core-lint_eslint"

@repo/core:lint:biome: >>> Starting Process: 9/4/2026, 8:16:30 AM (IST)

@repo/core:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/core:lint:biome: >>> Working Dir: C:\x\packages\core
@repo/core:lint:biome: >>> Log output: C:\x\reports\run-packages_core-lint_biome.log
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:eslint: >>> Starting Process: 9/4/2026, 8:16:30 AM (IST)

@repo/core:lint:eslint: >>> Command: node --max-old-space-size=4096 node_modules/eslint/bin/eslint.js .

@repo/core:lint:eslint: >>> Working Dir: C:\x\packages\core

@repo/core:lint:eslint: >>> Log output: C:\x\reports\run-packages_core-lint_eslint.log

@repo/core:lint:eslint: --------------------------------------------------------------------------------

@repo/core:lint:biome: warning: in the working copy of 'reports/push_audit.md', LF will be replaced by CRLF the next time Git touches it

@repo/core:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\adapters\powersync\SupabasePowerSyncConnector.ts" "src\api\handlers\sync.ts"

@repo/core:lint:biome: src\adapters\powersync\SupabasePowerSyncConnector.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   
@repo/core:lint:biome:    > 1 │ import type {

@repo/core:lint:biome:        │ ^^^^^^^^^^^^^
@repo/core:lint:biome:    > 2 │   CommonPowerSyncDatabase,
@repo/core:lint:biome:    > 3 │   PowerSyncBackendConnector,

@repo/core:lint:biome:    > 4 │   PowerSyncCredentials,
@repo/core:lint:biome:         ...

@repo/core:lint:biome:   > 10 │ import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';

@repo/core:lint:biome:   > 11 │ import { getActiveAccountId } from '@repo/core/lib/accountScope';

@repo/core:lint:biome:        │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:     12 │ import * as Effect from 'effect/Effect';
@repo/core:lint:biome:     13 │ 

@repo/core:lint:biome:   
@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)
@repo/core:lint:biome:   

@repo/core:lint:biome:       4   4 │     PowerSyncCredentials,␍

@repo/core:lint:biome:       5   5 │   } from '@powersync/common';␍

@repo/core:lint:biome:       6     │ - import·{·createSovereignClient,·SOVEREIGN_API_URL·}·from·'@repo/core/api/base';␍

@repo/core:lint:biome:       7     │ - import·{·supabaseClient·}·from·'@repo/core/adapters/supabaseClient';␍

@repo/core:lint:biome:       8     │ - import·{·sovereignBus·}·from·'@repo/core/lib/sync/eventBus';␍

@repo/core:lint:biome:       9     │ - import·{·runEffect,·tryPromise,·strictRetryPolicy·}·from·'@repo/core/effect';␍
@repo/core:lint:biome:      10     │ - import·{·getConsistentIdempotencyKey·}·from·'@repo/core/lib/sync/idempotency';␍
@repo/core:lint:biome:      11     │ - import·{·getActiveAccountId·}·from·'@repo/core/lib/accountScope';␍

@repo/core:lint:biome:           6 │ + import·{·supabaseClient·}·from·'@repo/core/adapters/supabaseClient';␍

@repo/core:lint:biome:           7 │ + import·{·createSovereignClient,·SOVEREIGN_API_URL·}·from·'@repo/core/api/base';␍
@repo/core:lint:biome:           8 │ + import·{·runEffect,·strictRetryPolicy,·tryPromise·}·from·'@repo/core/effect';␍

@repo/core:lint:biome:           9 │ + import·{·getActiveAccountId·}·from·'@repo/core/lib/accountScope';␍

@repo/core:lint:biome:          10 │ + import·{·sovereignBus·}·from·'@repo/core/lib/sync/eventBus';␍

@repo/core:lint:biome:          11 │ + import·{·getConsistentIdempotencyKey·}·from·'@repo/core/lib/sync/idempotency';␍

@repo/core:lint:biome:      12  12 │   import * as Effect from 'effect/Effect';␍
@repo/core:lint:biome:      13  13 │   ␍
@repo/core:lint:biome:   

@repo/core:lint:biome: 

@repo/core:lint:biome: src\adapters\powersync\SupabasePowerSyncConnector.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:       1     │ - import·type·{␍

@repo/core:lint:biome:       2     │ - ··CommonPowerSyncDatabase,␍

@repo/core:lint:biome:       3     │ - ··PowerSyncBackendConnector,␍

@repo/core:lint:biome:       4     │ - ··PowerSyncCredentials,␍

@repo/core:lint:biome:       5     │ - }·from·'@powersync/common';␍

@repo/core:lint:biome:       6     │ - import·{·createSovereignClient,·SOVEREIGN_API_URL·}·from·'@repo/core/api/base';␍

@repo/core:lint:biome:       7     │ - import·{·supabaseClient·}·from·'@repo/core/adapters/supabaseClient';␍

@repo/core:lint:biome:       8     │ - import·{·sovereignBus·}·from·'@repo/core/lib/sync/eventBus';␍

@repo/core:lint:biome:       9     │ - import·{·runEffect,·tryPromise,·strictRetryPolicy·}·from·'@repo/core/effect';␍

@repo/core:lint:biome:      10     │ - import·{·getConsistentIdempotencyKey·}·from·'@repo/core/lib/sync/idempotency';␍

@repo/core:lint:biome:      11     │ - import·{·getActiveAccountId·}·from·'@repo/core/lib/accountScope';␍

@repo/core:lint:biome:      12     │ - import·*·as·Effect·from·'effect/Effect';␍

@repo/core:lint:biome:      13     │ - ␍

@repo/core:lint:biome:      14     │ - const·POWERSYNC_URL·=·process.env.EXPO_PUBLIC_POWERSYNC_URL·??·'';␍

@repo/core:lint:biome:      15     │ - ␍

@repo/core:lint:biome:      16     │ - class·PowerSyncUploadError·{␍

@repo/core:lint:biome:      17     │ - ··readonly·_tag·=·'PowerSyncUploadError';␍

@repo/core:lint:biome:      18     │ - ··constructor(␍

@repo/core:lint:biome:      19     │ - ····readonly·status:·number,␍

@repo/core:lint:biome:      20     │ - ····readonly·message:·string,␍

@repo/core:lint:biome:      21     │ - ··)·{}␍

@repo/core:lint:biome:      22     │ - }␍

@repo/core:lint:biome:      23     │ - ␍

@repo/core:lint:biome:      24     │ - class·PowerSyncAccountChangedError·extends·PowerSyncUploadError·{␍

@repo/core:lint:biome:      25     │ - }␍

@repo/core:lint:biome:      26     │ - ␍

@repo/core:lint:biome:      27     │ - function·fetchSession$(␍

@repo/core:lint:biome:      28     │ - ··expectedAccountId:·string,␍

@repo/core:lint:biome:      29     │ - ):·Effect.Effect<{·access_token:·string;·user_id:·string;·expires_at?:·number·},·PowerSyncUploadError>·{␍

@repo/core:lint:biome:      30     │ - ··return·tryPromise(()·=>·supabaseClient.auth.getSession()).pipe(␍

@repo/core:lint:biome:      31     │ - ····Effect.mapError((error)·=>·new·PowerSyncUploadError(0,·error.message)),␍

@repo/core:lint:biome:      32     │ - ····Effect.flatMap(({·data:·{·session·},·error·})·=>·{␍

@repo/core:lint:biome:      33     │ - ······if·(getActiveAccountId()·!==·expectedAccountId)·{␍

@repo/core:lint:biome:      34     │ - ········return·Effect.fail(new·PowerSyncAccountChangedError(0,·'account_changed'));␍

@repo/core:lint:biome:      35     │ - ······}␍

@repo/core:lint:biome:      36     │ - ······return·error·||·!session·||·!session.user·||·session.user.is_anonymous␍

@repo/core:lint:biome:      37     │ - ········?·Effect.fail(new·PowerSyncUploadError(0,·'no_session'))␍
@repo/core:lint:biome:      38     │ - ········:·Effect.succeed({␍

@repo/core:lint:biome:      39     │ - ············access_token:·session.access_token,␍

@repo/core:lint:biome:      40     │ - ············user_id:·session.user.id,␍

@repo/core:lint:biome:      41     │ - ············expires_at:·session.expires_at,␍

@repo/core:lint:biome:      42     │ - ··········});␍
@repo/core:lint:biome:      43     │ - ····}),␍

@repo/core:lint:biome:      44     │ - ··);␍

@repo/core:lint:biome:      45     │ - }␍

@repo/core:lint:biome:      46     │ - ␍

@repo/core:lint:biome:      47     │ - export·class·SupabasePowerSyncConnector·implements·PowerSyncBackendConnector·{␍

@repo/core:lint:biome:      48     │ - ··constructor(private·readonly·accountId:·string)·{}␍

@repo/core:lint:biome:      49     │ - ␍

@repo/core:lint:biome:      50     │ - ··async·fetchCredentials():·Promise<PowerSyncCredentials>·{␍

@repo/core:lint:biome:      51     │ - ····const·session·=·await·runEffect(␍

@repo/core:lint:biome:      52     │ - ······fetchSession$(this.accountId),␍

@repo/core:lint:biome:      53     │ - ······'POWERSYNC_CREDENTIALS_FAILED',␍

@repo/core:lint:biome:      54     │ - ····);␍

@repo/core:lint:biome:      55     │ - ····return·{␍

@repo/core:lint:biome:      56     │ - ······endpoint:·POWERSYNC_URL,␍

@repo/core:lint:biome:      57     │ - ······token:·session.access_token,␍

@repo/core:lint:biome:      58     │ - ······expiresAt:·session.expires_at·?·new·Date(session.expires_at·*·1000)·:·undefined,␍

@repo/core:lint:biome:      59     │ - ····};␍

@repo/core:lint:biome:      60     │ - ··}␍

@repo/core:lint:biome:      61     │ - ␍

@repo/core:lint:biome:      62     │ - ··async·uploadData(database:·CommonPowerSyncDatabase):·Promise<void>·{␍

@repo/core:lint:biome:      63     │ - ····const·accountId·=·this.accountId;␍

@repo/core:lint:biome:      64     │ - ····const·startTime·=·0;␍

@repo/core:lint:biome:      65     │ - ····␍

@repo/core:lint:biome:      66     │ - ····return·runEffect(␍

@repo/core:lint:biome:      67     │ - ······Effect.gen(function*·()·{␍

@repo/core:lint:biome:      68     │ - ········const·batch·=·yield*·tryPromise(()·=>·database.getCrudBatch(200));␍

@repo/core:lint:biome:      69     │ - ········if·(!batch·||·batch.crud.length·===·0)·return;␍

@repo/core:lint:biome:      70     │ - ␍

@repo/core:lint:biome:      71     │ - ········const·session·=·yield*·fetchSession$(accountId);␍

@repo/core:lint:biome:      72     │ - ␍

@repo/core:lint:biome:      73     │ - ········const·client·=·createSovereignClient(SOVEREIGN_API_URL);␍

@repo/core:lint:biome:      74     │ - ········const·idempotencyKey·=·yield*·tryPromise(()·=>␍

@repo/core:lint:biome:      75     │ - ··········getConsistentIdempotencyKey(batch.crud,·`powersync:${session.user_id}`),␍

@repo/core:lint:biome:      76     │ - ········);␍

@repo/core:lint:biome:      77     │ - ␍

@repo/core:lint:biome:      78     │ - ········const·body·=·{␍

@repo/core:lint:biome:      79     │ - ··········crud:·batch.crud.map((c)·=>·({␍

@repo/core:lint:biome:      80     │ - ············id:·c.id,␍

@repo/core:lint:biome:      81     │ - ············op:·c.op,␍

@repo/core:lint:biome:      82     │ - ············table:·c.table,␍
@repo/core:lint:biome:      83     │ - ············opData:·c.opData,␍

@repo/core:lint:biome:      84     │ - ··········})),␍
@repo/core:lint:biome:      85     │ - ··········idempotencyKey,␍
@repo/core:lint:biome:      86     │ - ········};␍

@repo/core:lint:biome:      87     │ - ␍

@repo/core:lint:biome:      88     │ - ········const·startTime·=·Date.now();␍

@repo/core:lint:biome:      89     │ - ········const·uploadCount·=·batch.crud.length;␍

@repo/core:lint:biome:      90     │ - ········␍

@repo/core:lint:biome:      91     │ - ········yield*·tryPromise(()·=>␍

@repo/core:lint:biome:      92     │ - ··········(client.api·as·any).powersync.upload.$post(␍

@repo/core:lint:biome:      93     │ - ············{·json:·body·},␍

@repo/core:lint:biome:      94     │ - ············{␍

@repo/core:lint:biome:      95     │ - ··············headers:·{␍

@repo/core:lint:biome:      96     │ - ················Authorization:·`Bearer·${session.access_token}`,␍

@repo/core:lint:biome:      97     │ - ················'X-Idempotency-Key':·idempotencyKey,␍
@repo/core:lint:biome:      98     │ - ··············},␍

@repo/core:lint:biome:      99     │ - ············},␍

@repo/core:lint:biome:     100     │ - ··········),␍

@repo/core:lint:biome:     101     │ - ········).pipe(␍

@repo/core:lint:biome:     102     │ - ··········Effect.flatMap((res:·any)·=>·{␍

@repo/core:lint:biome:     103     │ - ············if·(!res.ok)·{␍

@repo/core:lint:biome:     104     │ - ··············return·tryPromise(()·=>·res.json()).pipe(␍

@repo/core:lint:biome:     105     │ - ················Effect.flatMap((errorData:·any)·=>␍

@repo/core:lint:biome:     106     │ - ··················Effect.fail(␍

@repo/core:lint:biome:     107     │ - ····················new·PowerSyncUploadError(␍

@repo/core:lint:biome:     108     │ - ······················res.status,␍

@repo/core:lint:biome:     109     │ - ······················errorData?.message·||·`Sanctuary·API·sync·failed·with·status·${res.status}`,␍

@repo/core:lint:biome:     110     │ - ····················),␍

@repo/core:lint:biome:     111     │ - ··················),␍

@repo/core:lint:biome:     112     │ - ················),␍
@repo/core:lint:biome:     113     │ - ··············);␍

@repo/core:lint:biome:     114     │ - ············}␍

@repo/core:lint:biome:     115     │ - ············return·Effect.void;␍

@repo/core:lint:biome:     116     │ - ··········}),␍

@repo/core:lint:biome:     117     │ - ··········Effect.retry(strictRetryPolicy),␍

@repo/core:lint:biome:     118     │ - ··········Effect.catchAll((e)·=>·{␍

@repo/core:lint:biome:     119     │ - ············if·(e·instanceof·PowerSyncUploadError)·return·Effect.fail(e);␍

@repo/core:lint:biome:     120     │ - ············return·Effect.fail(new·PowerSyncUploadError(0,·String(e)));␍

@repo/core:lint:biome:     121     │ - ··········}),␍

@repo/core:lint:biome:     122     │ - ········);␍
@repo/core:lint:biome:     123     │ - ␍

@repo/core:lint:biome:     124     │ - ········const·latencyMs·=·Date.now()·-·startTime;␍

@repo/core:lint:biome:     125     │ - ········const·tablesAffected·=·Array.from(new·Set(batch.crud.map((c)·=>·c.table)));␍

@repo/core:lint:biome:     126     │ - ········␍

@repo/core:lint:biome:     127     │ - ········yield*·tryPromise(()·=>·batch.complete());␍

@repo/core:lint:biome:     128     │ - ␍

@repo/core:lint:biome:     129     │ - ········sovereignBus.emit('powersync:sync_complete',·{·tablesAffected·});␍

@repo/core:lint:biome:     130     │ - ······}).pipe(␍

@repo/core:lint:biome:     131     │ - ········Effect.catchAll((error)·=>␍

@repo/core:lint:biome:     132     │ - ··········Effect.sync(()·=>·{␍

@repo/core:lint:biome:     133     │ - ············const·isAccountChanged·=·error·instanceof·PowerSyncAccountChangedError;␍

@repo/core:lint:biome:     134     │ - ············sovereignBus.emit('powersync:unavailable',·{␍

@repo/core:lint:biome:     135     │ - ··············reason:·error·instanceof·PowerSyncAccountChangedError·?·'account_switched'·:·'service_down',␍

@repo/core:lint:biome:     136     │ - ············});␍

@repo/core:lint:biome:     137     │ - ··········}).pipe(Effect.zipRight(Effect.fail(error))),␍

@repo/core:lint:biome:     138     │ - ········),␍

@repo/core:lint:biome:     139     │ - ······),␍

@repo/core:lint:biome:     140     │ - ······'POWERSYNC_UPLOAD_FAILED',␍

@repo/core:lint:biome:     141     │ - ····);␍

@repo/core:lint:biome:     142     │ - ··}␍

@repo/core:lint:biome:     143     │ - }␍

@repo/core:lint:biome:           1 │ + import·type·{

@repo/core:lint:biome:           2 │ + ··CommonPowerSyncDatabase,

@repo/core:lint:biome:           3 │ + ··PowerSyncBackendConnector,

@repo/core:lint:biome:           4 │ + ··PowerSyncCredentials,

@repo/core:lint:biome:           5 │ + }·from·'@powersync/common';

@repo/core:lint:biome:           6 │ + import·{·createSovereignClient,·SOVEREIGN_API_URL·}·from·'@repo/core/api/base';

@repo/core:lint:biome:           7 │ + import·{·supabaseClient·}·from·'@repo/core/adapters/supabaseClient';

@repo/core:lint:biome:   137 more lines truncated

@repo/core:lint:biome:   

@repo/core:lint:biome: 

@repo/core:lint:biome: src\api\handlers\sync.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   

@repo/core:lint:biome:   > 1 │ import { createHash } from 'node:crypto';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:   > 2 │ import type { Context } from 'hono';
@repo/core:lint:biome:   > 3 │ 

@repo/core:lint:biome:   > 4 │ import { SyncDelegateError, SyncOperationError, SyncTableError } from '@repo/core/effect/Errors';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/core:lint:biome:     5 │ 
@repo/core:lint:biome:   

@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)
@repo/core:lint:biome:   

@repo/core:lint:biome:       1   1 │   import { createHash } from 'node:crypto';␍

@repo/core:lint:biome:       2     │ - import·type·{·Context·}·from·'hono';␍

@repo/core:lint:biome:       3     │ - ␍

@repo/core:lint:biome:       4     │ - import·{·SyncDelegateError,·SyncOperationError,·SyncTableError·}·from·'@repo/core/effect/Errors';␍

@repo/core:lint:biome:           2 │ + import·{·SyncDelegateError,·SyncOperationError,·SyncTableError·}·from·'@repo/core/effect/Errors';␍

@repo/core:lint:biome:           3 │ + import·type·{·Context·}·from·'hono';␍

@repo/core:lint:biome:       5   4 │   ␍
@repo/core:lint:biome:       6   5 │   ␍
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\api\handlers\sync.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:       1     │ - import·{·createHash·}·from·'node:crypto';␍

@repo/core:lint:biome:       2     │ - import·type·{·Context·}·from·'hono';␍

@repo/core:lint:biome:       3     │ - ␍

@repo/core:lint:biome:       4     │ - import·{·SyncDelegateError,·SyncOperationError,·SyncTableError·}·from·'@repo/core/effect/Errors';␍

@repo/core:lint:biome:       5     │ - ␍

@repo/core:lint:biome:       6     │ - ␍

@repo/core:lint:biome:       7     │ - const·tableToModelMap:·Record<string,·string>·=·{␍

@repo/core:lint:biome:       8     │ - ··bonds:·'bond',␍

@repo/core:lint:biome:       9     │ - ··classroom:·'classroom',␍

@repo/core:lint:biome:      10     │ - ··classroom_student:·'classroomStudent',␍

@repo/core:lint:biome:      11     │ - ··classroom_students:·'classroomStudent',␍

@repo/core:lint:biome:      12     │ - };␍

@repo/core:lint:biome:      13     │ - ␍

@repo/core:lint:biome:      14     │ - type·IdempotencyOutcome·=·{␍

@repo/core:lint:biome:      15     │ - ··success:·true;␍
@repo/core:lint:biome:      16     │ - ··processedCount:·number;␍
@repo/core:lint:biome:      17     │ - ··idempotent?:·boolean;␍
@repo/core:lint:biome:      18     │ - };␍
@repo/core:lint:biome:      19     │ - ␍

@repo/core:lint:biome:      20     │ - type·LocalIdempotencyRecord·=·IdempotencyOutcome·&·{␍

@repo/core:lint:biome:      21     │ - ··payloadHash:·string;␍

@repo/core:lint:biome:      22     │ - ··timestamp:·number;␍
@repo/core:lint:biome:      23     │ - };␍
@repo/core:lint:biome:      24     │ - ␍

@repo/core:lint:biome:      25     │ - const·localIdempotencyCache·=·new·Map<string,·LocalIdempotencyRecord>();␍

@repo/core:lint:biome:      26     │ - ␍

@repo/core:lint:biome:      27     │ - //·Clean·up·cache·periodically·(e.g.·keys·older·than·10·minutes)␍

@repo/core:lint:biome:      28     │ - if·(␍

@repo/core:lint:biome:      29     │ - ··typeof·globalThis·!==·'undefined'·&&␍

@repo/core:lint:biome:      30     │ - ··!(globalThis·as·any).__powerSyncIdempotencyCleanupInterval␍

@repo/core:lint:biome:      31     │ - )·{␍

@repo/core:lint:biome:      32     │ - ··const·interval·=·setInterval(␍

@repo/core:lint:biome:      33     │ - ····()·=>·{␍
@repo/core:lint:biome:      34     │ - ······const·now·=·Date.now();␍

@repo/core:lint:biome:      35     │ - ······for·(const·[key,·val]·of·localIdempotencyCache.entries())·{␍

@repo/core:lint:biome:      36     │ - ········if·(now·-·val.timestamp·>·10·*·60·*·1000)·{␍

@repo/core:lint:biome:      37     │ - ··········localIdempotencyCache.delete(key);␍

@repo/core:lint:biome:      38     │ - ········}␍

@repo/core:lint:biome:      39     │ - ······}␍

@repo/core:lint:biome:      40     │ - ····},␍

@repo/core:lint:biome:      41     │ - ····5·*·60·*·1000,␍

@repo/core:lint:biome:      42     │ - ··);␍

@repo/core:lint:biome:      43     │ - ··if·(typeof·interval·===·'object'·&&·typeof·(interval·as·any).unref·===·'function')·{␍

@repo/core:lint:biome:      44     │ - ····(interval·as·any).unref();␍

@repo/core:lint:biome:      45     │ - ··}␍

@repo/core:lint:biome:      46     │ - ··(globalThis·as·any).__powerSyncIdempotencyCleanupInterval·=·interval;␍

@repo/core:lint:biome:      47     │ - }␍
@repo/core:lint:biome:      48     │ - ␍

@repo/core:lint:biome:      49     │ - class·IdempotencyConflictError·extends·Error·{␍

@repo/core:lint:biome:      50     │ - ··readonly·code·=·'IDEMPOTENCY_CONFLICT';␍

@repo/core:lint:biome:      51     │ - }␍

@repo/core:lint:biome:      52     │ - ␍

@repo/core:lint:biome:      53     │ - const·hashCrud·=·(crud:·any[])·=>·createHash('sha256').update(JSON.stringify(crud)).digest('hex');␍

@repo/core:lint:biome:      54     │ - ␍

@repo/core:lint:biome:      55     │ - export·async·function·applyPowerSyncBatch(␍

@repo/core:lint:biome:      56     │ - ··db:·any,␍

@repo/core:lint:biome:      57     │ - ··crud:·any[],␍

@repo/core:lint:biome:      58     │ - ··idempotencyKey?:·string·|·null,␍

@repo/core:lint:biome:      59     │ - ··principalId·=·'anonymous',␍

@repo/core:lint:biome:      60     │ - ):·Promise<IdempotencyOutcome>·{␍

@repo/core:lint:biome:      61     │ - ··if·(!Array.isArray(crud))·{␍

@repo/core:lint:biome:      62     │ - ····throw·new·Error('Invalid·payload:·crud·must·be·an·array');␍

@repo/core:lint:biome:      63     │ - ··}␍
@repo/core:lint:biome:      64     │ - ␍

@repo/core:lint:biome:      65     │ - ··const·payloadHash·=·hashCrud(crud);␍

@repo/core:lint:biome:      66     │ - ··const·scopedKey·=·`${principalId}:${idempotencyKey·??·''}`;␍

@repo/core:lint:biome:      67     │ - ··let·usedDurableLedger·=·false;␍

@repo/core:lint:biome:      68     │ - ␍

@repo/core:lint:biome:      69     │ - ··console.log(`[Sync]·Processing·transactional·upload·batch·of·${crud.length}·mutations.`);␍

@repo/core:lint:biome:      70     │ - ␍

@repo/core:lint:biome:      71     │ - ··try·{␍

@repo/core:lint:biome:      72     │ - ····await·db.$transaction(async·(tx:·any)·=>·{␍

@repo/core:lint:biome:      73     │ - ······if·(idempotencyKey)·{␍

@repo/core:lint:biome:      74     │ - ········if·(typeof·tx.$executeRaw·===·'function'·&&·typeof·tx.$queryRaw·===·'function')·{␍

@repo/core:lint:biome:      75     │ - ··········usedDurableLedger·=·true;␍

@repo/core:lint:biome:      76     │ - ··········await·tx.$executeRaw`␍

@repo/core:lint:biome:      77     │ - ············INSERT·INTO·powersync_idempotency_keys·(principal_id,·idempotency_key,·payload_hash,·status,·processed_count)␍

@repo/core:lint:biome:      78     │ - ············VALUES·(${principalId},·${idempotencyKey},·${payloadHash},·'processing',·0)␍

@repo/core:lint:biome:      79     │ - ············ON·CONFLICT·(principal_id,·idempotency_key)·DO·NOTHING␍

@repo/core:lint:biome:      80     │ - ··········`;␍
@repo/core:lint:biome:      81     │ - ␍

@repo/core:lint:biome:      82     │ - ··········const·rows·=·await·tx.$queryRaw`␍

@repo/core:lint:biome:      83     │ - ············SELECT·payload_hash,·status,·processed_count␍

@repo/core:lint:biome:      84     │ - ············FROM·powersync_idempotency_keys␍

@repo/core:lint:biome:      85     │ - ············WHERE·principal_id·=·${principalId}·AND·idempotency_key·=·${idempotencyKey}␍

@repo/core:lint:biome:      86     │ - ············FOR·UPDATE␍

@repo/core:lint:biome:      87     │ - ··········`;␍

@repo/core:lint:biome:      88     │ - ··········const·record·=·rows?.[0];␍

@repo/core:lint:biome:      89     │ - ··········if·(record?.payload_hash·!==·payloadHash)·{␍

@repo/core:lint:biome:      90     │ - ············throw·new·IdempotencyConflictError(␍

@repo/core:lint:biome:      91     │ - ··············'Idempotency·key·was·reused·with·a·different·batch·payload',␍

@repo/core:lint:biome:      92     │ - ············);␍

@repo/core:lint:biome:      93     │ - ··········}␍

@repo/core:lint:biome:      94     │ - ··········if·(record?.status·===·'completed')·{␍

@repo/core:lint:biome:      95     │ - ············throw·new·IdempotencyReplay(Number(record.processed_count·??·0));␍

@repo/core:lint:biome:      96     │ - ··········}␍

@repo/core:lint:biome:      97     │ - ········}·else·{␍

@repo/core:lint:biome:      98     │ - ··········const·cached·=·localIdempotencyCache.get(scopedKey);␍

@repo/core:lint:biome:      99     │ - ··········if·(cached)·{␍

@repo/core:lint:biome:     100     │ - ············if·(cached.payloadHash·!==·payloadHash)·{␍

@repo/core:lint:biome:     101     │ - ··············throw·new·IdempotencyConflictError(␍

@repo/core:lint:biome:     102     │ - ················'Idempotency·key·was·reused·with·a·different·batch·payload',␍
@repo/core:lint:biome:     103     │ - ··············);␍

@repo/core:lint:biome:     104     │ - ············}␍

@repo/core:lint:biome:     105     │ - ············throw·new·IdempotencyReplay(cached.processedCount);␍

@repo/core:lint:biome:     106     │ - ··········}␍

@repo/core:lint:biome:     107     │ - ········}␍

@repo/core:lint:biome:     108     │ - ······}␍

@repo/core:lint:biome:     109     │ - ␍

@repo/core:lint:biome:     110     │ - ······for·(const·item·of·crud)·{␍

@repo/core:lint:biome:     111     │ - ········const·{·id,·op,·table,·opData·}·=·item;␍

@repo/core:lint:biome:     112     │ - ········const·modelKey·=·tableToModelMap[table]·||·tableToModelMap[table.toLowerCase()];␍
@repo/core:lint:biome:     113     │ - ␍

@repo/core:lint:biome:     114     │ - ········if·(!modelKey)·{␍

@repo/core:lint:biome:     115     │ - ··········console.warn(`[Sync]·No·active·Prisma·model·mapping·for·table:·"${table}"`);␍

@repo/core:lint:biome:     116     │ - ··········throw·new·SyncTableError({·table·});␍
@repo/core:lint:biome:     117     │ - ········}␍

@repo/core:lint:biome:     118     │ - ␍

@repo/core:lint:biome:     119     │ - ········const·delegate·=·tx[modelKey];␍

@repo/core:lint:biome:     120     │ - ········if·(!delegate)·{␍

@repo/core:lint:biome:     121     │ - ··········throw·new·SyncDelegateError({·modelKey·});␍

@repo/core:lint:biome:     122     │ - ········}␍
@repo/core:lint:biome:     123     │ - ␍

@repo/core:lint:biome:     124     │ - ········switch·(op)·{␍

@repo/core:lint:biome:     125     │ - ··········case·'PUT':␍
@repo/core:lint:biome:     126     │ - ············await·delegate.upsert({␍

@repo/core:lint:biome:     127     │ - ··············where:·{·id·},␍

@repo/core:lint:biome:     128     │ - ··············create:·{·...opData,·id·},␍

@repo/core:lint:biome:     129     │ - ··············update:·opData·??·{},␍

@repo/core:lint:biome:     130     │ - ············});␍

@repo/core:lint:biome:     131     │ - ············break;␍

@repo/core:lint:biome:     132     │ - ␍

@repo/core:lint:biome:     133     │ - ··········case·'PATCH':␍

@repo/core:lint:biome:     134     │ - ············await·delegate.update({·where:·{·id·},·data:·opData·??·{}·});␍

@repo/core:lint:biome:     135     │ - ············break;␍

@repo/core:lint:biome:     136     │ - ␍

@repo/core:lint:biome:     137     │ - ··········case·'DELETE':␍

@repo/core:lint:biome:     138     │ - ············await·delegate.delete({·where:·{·id·}·});␍

@repo/core:lint:biome:     139     │ - ············break;␍
@repo/core:lint:biome:     140     │ - ␍

@repo/core:lint:biome:     141     │ - ··········default:␍

@repo/core:lint:biome:     142     │ - ············throw·new·SyncOperationError({·op·});␍

@repo/core:lint:biome:     143     │ - ········}␍

@repo/core:lint:biome:     144     │ - ······}␍

@repo/core:lint:biome:     145     │ - ␍

@repo/core:lint:biome:     146     │ - ······if·(idempotencyKey·&&·usedDurableLedger)·{␍

@repo/core:lint:biome:     147     │ - ········await·tx.$executeRaw`␍

@repo/core:lint:biome:     148     │ - ··········UPDATE·powersync_idempotency_keys␍

@repo/core:lint:biome:     149     │ - ··········SET·status·=·'completed',·processed_count·=·${crud.length},·completed_at·=·NOW()␍

@repo/core:lint:biome:     150     │ - ··········WHERE·principal_id·=·${principalId}·AND·idempotency_key·=·${idempotencyKey}␍

@repo/core:lint:biome:   278 more lines truncated

@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: Checked 2 files in 33ms. No fixes applied.

@repo/core:lint:biome: Found 4 errors.

@repo/core:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Some errors were emitted while running checks.
@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: 
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: REPORT SUMMARY
@repo/core:lint:biome: Duration: 2.1 seconds

@repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/core:lint:biome: Raw Log:  C:\x\reports\run-packages_core-lint_biome.log
@repo/core:lint:biome: Report:   C:\x\reports\run-packages_core-lint_biome-report.txt
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: [ELIFECYCLE] Command failed with exit code 1.

@repo/core#lint:biome:  ERROR  command (C:\x\packages\core) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.1.0\pnpm.exe run lint:biome exited (1)


 Tasks:    35 successful, 37 total
Cached:    35 cached, 37 total

  Time:    3.731s 
Failed:    @repo/core#lint:biome


 ERROR  run failed: command  exited (1)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 4.9 seconds
Findings: 1 (Errors: 1, Warnings: 0)

Raw Log:  C:\x\reports\run-package_json-lint.log

Report:   C:\x\reports\run-package_json-lint-report.txt
--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 
1.

```
