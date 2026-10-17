# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 10/15/2026, 3:44:35 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 11.1s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 13 |
| apps/gurudevi-mobile | 6 |
| packages/form-builder | 8 |

## Detailed Findings

### Category: General
- @repo/core:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\adapters\powersync\forms.adapter.ts" "src\api\clientRuntime.ts" "src\api\educational.contract.ts" "src\api\orpcClient.ts" "src\api\self.contract.ts" "src\lib\practiceBoundary.test.ts" "src\lib\practiceBoundary.ts" "src\lib\practiceContract.ts" "src\lib\sync\__tests__\useMutationQueue.test.ts" "src\lib\sync\errorClassifier.ts" "src\lib\sync\registry.ts" "src\lib\sync\sync\SyncManager.tsx" "src\lib\sync\types.ts" "src\lib\sync\useMutationQueue.ts" "src\logic\ports\storage.ts" "src\logic\registry\capabilityManifest.ts" "src\types\API.ts"
- @repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core:lint:biome:     17    │ - ····throw·Object.assign(new·Error('The·owning·account·must·remain·active·for·this·request.'),·{·status:·401·});
- @repo/core:lint:biome:        17 │ + ····throw·Object.assign(new·Error('The·owning·account·must·remain·active·for·this·request.'),·{
- @repo/core:lint:biome:    > 5 │   MutationQueueCapacityError,
- @repo/core:lint:biome:      8    │ - ··constructor(message:·string,·code·=·'API_ERROR',·details?:·unknown,·reportedToTelemetry·=·false,·cause?:·unknown)·{
- @repo/core:lint:biome:        10 │ + ····code·=·'API_ERROR',
- @repo/core:lint:biome: Found 19 errors.
- @repo/core:lint:biome:   × Some errors were emitted while running checks.
- @repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core#lint:biome:  ERROR  command (C:\x\packages\core) C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2\pnpm.cmd run lint:biome exited (1)
- ERROR  run failed: command  exited (1)
- Findings: 1 (Errors: 1, Warnings: 0)

### Category: apps/gurudevi-mobile
- @repo/core:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(modal)/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/docs/INDEX.md', CRLF will be replaced by LF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(modal)/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/docs/INDEX.md', CRLF will be replaced by LF the next time Git touches it

### Category: packages/form-builder
- @repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/src/index.ts', CRLF will be replaced by LF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/ClimateSensingScreen.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/index.ts', CRLF will be replaced by LF the next time Git touches it
- @repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/vitest.config.ts', CRLF will be replaced by LF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/src/index.ts', CRLF will be replaced by LF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/ClimateSensingScreen.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/index.ts', CRLF will be replaced by LF the next time Git touches it
- @repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/vitest.config.ts', CRLF will be replaced by LF the next time Git touches it

## Raw Output

```text
$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint --concurrency=2" --name "package_json-lint"

>>> Starting Process: 10/15/2026, 3:44:28 PM (IST)

>>> Command: pnpm turbo run lint --concurrency=2
>>> Working Dir: C:\x
>>> Log output: C:\x\reports\run-package_json-lint.log
--------------------------------------------------------------------------------

• turbo 2.10.12


   • Packages in scope: @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/editorial, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile, gurudevi-web, oxlint-plugin-polymath

   • Running lint in 31 packages
   • Remote caching disabled


@repo/core:lint:biome: cache miss, executing 46a093db90f4b56f

@repo/payments:lint:biome: cache miss, executing 4cc5eabd38738283

@repo/core:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_core-lint_biome"

@repo/payments:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_payments-lint_biome"

@repo/core:lint:biome: >>> Starting Process: 10/15/2026, 3:44:33 PM (IST)

@repo/core:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/core:lint:biome: >>> Working Dir: C:\x\packages\core

@repo/core:lint:biome: >>> Log output: C:\x\reports\run-packages_core-lint_biome.log
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: >>> Starting Process: 10/15/2026, 3:44:33 PM (IST)

@repo/payments:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/payments:lint:biome: >>> Working Dir: C:\x\packages\payments

@repo/payments:lint:biome: >>> Log output: C:\x\reports\run-packages_payments-lint_biome.log

@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(modal)/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
@repo/core:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
@repo/core:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/docs/INDEX.md', CRLF will be replaced by LF the next time Git touches it
@repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/src/index.ts', CRLF will be replaced by LF the next time Git touches it
@repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/ClimateSensingScreen.tsx', CRLF will be replaced by LF the next time Git touches it

@repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/index.ts', CRLF will be replaced by LF the next time Git touches it
@repo/core:lint:biome: warning: in the working copy of 'packages/form-builder/vitest.config.ts', CRLF will be replaced by LF the next time Git touches it

@repo/payments:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(modal)/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
@repo/payments:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx', CRLF will be replaced by LF the next time Git touches it
@repo/payments:lint:biome: warning: in the working copy of 'apps/gurudevi-mobile/docs/INDEX.md', CRLF will be replaced by LF the next time Git touches it
@repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/src/index.ts', CRLF will be replaced by LF the next time Git touches it

@repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/ClimateSensingScreen.tsx', CRLF will be replaced by LF the next time Git touches it
@repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/src/screens/index.ts', CRLF will be replaced by LF the next time Git touches it
@repo/payments:lint:biome: warning: in the working copy of 'packages/form-builder/vitest.config.ts', CRLF will be replaced by LF the next time Git touches it

@repo/core:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\adapters\powersync\forms.adapter.ts" "src\api\clientRuntime.ts" "src\api\educational.contract.ts" "src\api\orpcClient.ts" "src\api\self.contract.ts" "src\lib\practiceBoundary.test.ts" "src\lib\practiceBoundary.ts" "src\lib\practiceContract.ts" "src\lib\sync\__tests__\useMutationQueue.test.ts" "src\lib\sync\errorClassifier.ts" "src\lib\sync\registry.ts" "src\lib\sync\sync\SyncManager.tsx" "src\lib\sync\types.ts" "src\lib\sync\useMutationQueue.ts" "src\logic\ports\storage.ts" "src\logic\registry\capabilityManifest.ts" "src\types\API.ts"

@repo/payments:lint:biome: >>> No modified files found to format.

@repo/payments:lint:biome: 
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: REPORT SUMMARY

@repo/payments:lint:biome: Duration: 1.0 seconds
@repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/payments:lint:biome: Raw Log:  C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: Report:   C:\x\reports\run-packages_payments-lint_biome-report.txt
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: cache miss, executing 39d8daa09135e8b5

@repo/core:lint:biome: src\adapters\powersync\forms.adapter.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:      18  18 │   function parseFormConfig(
@repo/core:lint:biome:      19  19 │     rawConfig: string,

@repo/core:lint:biome:      20     │ - ··baseTemplate:·{·isPublished:·boolean;·slug?:·string·|·null;·category?:·string·|·null·}

@repo/core:lint:biome:          20 │ + ··baseTemplate:·{·isPublished:·boolean;·slug?:·string·|·null;·category?:·string·|·null·},

@repo/core:lint:biome:      21  21 │   ): {

@repo/core:lint:biome:      22  22 │     pages: FormSchema['pages'];

@repo/core:lint:biome:     ······· │ 

@repo/core:lint:biome:     271 271 │       return localTime >= remoteTime ? local : remote;

@repo/core:lint:biome:     272 272 │     }
@repo/core:lint:biome:     273     │ - }

@repo/core:lint:biome:         273 │ + }

@repo/core:lint:biome:         274 │ + 
@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: src\api\clientRuntime.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   

@repo/core:lint:biome:   > 1 │ import { hc } from 'hono/client';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:   > 2 │ import { getActiveAccountId } from '@repo/core/lib/accountScope';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:     3 │ 

@repo/core:lint:biome:     4 │ let tokenResolver: (() => Promise<string | null>) | null = null;
@repo/core:lint:biome:   
@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)

@repo/core:lint:biome:   
@repo/core:lint:biome:      1    │ - import·{·hc·}·from·'hono/client';
@repo/core:lint:biome:      2    │ - import·{·getActiveAccountId·}·from·'@repo/core/lib/accountScope';

@repo/core:lint:biome:         1 │ + import·{·getActiveAccountId·}·from·'@repo/core/lib/accountScope';

@repo/core:lint:biome:         2 │ + import·{·hc·}·from·'hono/client';

@repo/core:lint:biome:      3  3 │   

@repo/core:lint:biome:      4  4 │   let tokenResolver: (() => Promise<string | null>) | null = null;

@repo/core:lint:biome:   

@repo/core:lint:biome: 
@repo/core:lint:biome: src\api\clientRuntime.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:     15 15 │   export function assertActiveRequestAccount(expectedAccountId?: string) {

@repo/core:lint:biome:     16 16 │     if (expectedAccountId && getActiveAccountId() !== expectedAccountId) {

@repo/core:lint:biome:     17    │ - ····throw·Object.assign(new·Error('The·owning·account·must·remain·active·for·this·request.'),·{·status:·401·});

@repo/core:lint:biome:        17 │ + ····throw·Object.assign(new·Error('The·owning·account·must·remain·active·for·this·request.'),·{

@repo/core:lint:biome:        18 │ + ······status:·401,

@repo/core:lint:biome:        19 │ + ····});
@repo/core:lint:biome:     18 20 │     }

@repo/core:lint:biome:     19 21 │   }

@repo/core:lint:biome:     ····· │ 
@repo/core:lint:biome:     81 83 │     }

@repo/core:lint:biome:     82 84 │   }
@repo/core:lint:biome:     83    │ - 
@repo/core:lint:biome:     84 85 │   

@repo/core:lint:biome:     85 86 │   export function createSovereignClient<T extends import('hono').Hono<any, any, any>>(

@repo/core:lint:biome:   

@repo/core:lint:biome: 

@repo/core:lint:biome: src\api\orpcClient.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:

@repo/core:lint:biome:   

@repo/core:lint:biome:     28  28 │   }
@repo/core:lint:biome:     29  29 │   

@repo/core:lint:biome:     30     │ - const·runtimeDevelopmentFlag·=·(globalThis·as·typeof·globalThis·&·{

@repo/core:lint:biome:     31     │ - ··readonly·__DEV__?:·boolean;

@repo/core:lint:biome:     32     │ - }).__DEV__;

@repo/core:lint:biome:     33     │ - const·isDevelopmentRuntime·=·runtimeDevelopmentFlag·===·true·||·process.env.NODE_ENV·===·'development';

@repo/core:lint:biome:         30 │ + const·runtimeDevelopmentFlag·=·(

@repo/core:lint:biome:         31 │ + ··globalThis·as·typeof·globalThis·&·{

@repo/core:lint:biome:         32 │ + ····readonly·__DEV__?:·boolean;

@repo/core:lint:biome:         33 │ + ··}

@repo/core:lint:biome:         34 │ + ).__DEV__;

@repo/core:lint:biome:         35 │ + const·isDevelopmentRuntime·=

@repo/core:lint:biome:         36 │ + ··runtimeDevelopmentFlag·===·true·||·process.env.NODE_ENV·===·'development';
@repo/core:lint:biome:     34  37 │   

@repo/core:lint:biome:     35  38 │   const link = new RPCLink<ClientContext>({

@repo/core:lint:biome:     ······ │ 
@repo/core:lint:biome:     78  81 │     ],

@repo/core:lint:biome:     79  82 │     fetch: async (url, init, { context }) => {

@repo/core:lint:biome:     80     │ - ····return·authenticatedSovereignFetch(url,·{

@repo/core:lint:biome:     81     │ - ······...init,

@repo/core:lint:biome:     82     │ - ······cache:·context?.cache,

@repo/core:lint:biome:     83     │ - ····},·context?.expectedAccountId);

@repo/core:lint:biome:         83 │ + ····return·authenticatedSovereignFetch(

@repo/core:lint:biome:         84 │ + ······url,

@repo/core:lint:biome:         85 │ + ······{

@repo/core:lint:biome:         86 │ + ········...init,

@repo/core:lint:biome:         87 │ + ········cache:·context?.cache,

@repo/core:lint:biome:         88 │ + ······},

@repo/core:lint:biome:         89 │ + ······context?.expectedAccountId,

@repo/core:lint:biome:         90 │ + ····);
@repo/core:lint:biome:     84  91 │     },

@repo/core:lint:biome:     85  92 │   });
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\lib\practiceBoundary.test.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   

@repo/core:lint:biome:    > 1 │ import { describe, expect, it } from 'vitest';

@repo/core:lint:biome:        │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:    > 2 │ import {

@repo/core:lint:biome:    > 3 │   createAccountPracticeScope,

@repo/core:lint:biome:    > 4 │   deriveAccountPracticeKey,
@repo/core:lint:biome:         ...

@repo/core:lint:biome:   > 10 │   resolvePracticeAvailability,

@repo/core:lint:biome:   > 11 │ } from '../logic/registry/capabilityManifest';

@repo/core:lint:biome:        │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:     12 │ 

@repo/core:lint:biome:     13 │ describe('account practice boundary contracts (G0)', () => {
@repo/core:lint:biome:   

@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)
@repo/core:lint:biome:   

@repo/core:lint:biome:       1   1 │   import { describe, expect, it } from 'vitest';

@repo/core:lint:biome:       2   2 │   import {

@repo/core:lint:biome:       3     │ - ··createAccountPracticeScope,

@repo/core:lint:biome:       4     │ - ··deriveAccountPracticeKey,

@repo/core:lint:biome:       5     │ - ··resolveAccountPracticeWriteDecision,

@repo/core:lint:biome:       6     │ - }·from·'./practiceBoundary';

@repo/core:lint:biome:       7     │ - import·{·createPracticeController·}·from·'./practiceContract';

@repo/core:lint:biome:       8     │ - import·{

@repo/core:lint:biome:       9     │ - ··declaredPracticeCapability,

@repo/core:lint:biome:      10     │ - ··resolvePracticeAvailability,

@repo/core:lint:biome:      11     │ - }·from·'../logic/registry/capabilityManifest';

@repo/core:lint:biome:           3 │ + ··declaredPracticeCapability,

@repo/core:lint:biome:           4 │ + ··resolvePracticeAvailability,

@repo/core:lint:biome:           5 │ + }·from·'../logic/registry/capabilityManifest';

@repo/core:lint:biome:           6 │ + import·{

@repo/core:lint:biome:           7 │ + ··createAccountPracticeScope,

@repo/core:lint:biome:           8 │ + ··deriveAccountPracticeKey,

@repo/core:lint:biome:           9 │ + ··resolveAccountPracticeWriteDecision,

@repo/core:lint:biome:          10 │ + }·from·'./practiceBoundary';
@repo/core:lint:biome:          11 │ + import·{·createPracticeController·}·from·'./practiceContract';

@repo/core:lint:biome:      12  12 │   
@repo/core:lint:biome:      13  13 │   describe('account practice boundary contracts (G0)', () => {
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\lib\practiceBoundary.test.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:

@repo/core:lint:biome:   

@repo/core:lint:biome:      58  58 │       expect(key).toContain('sandbox');

@repo/core:lint:biome:      59  59 │       expect(key).not.toContain('daily roll call');

@repo/core:lint:biome:      60     │ - ····expect(()·=>·createAccountPracticeScope({·accountId:·'a',·featureId:·'·',·workspaceId:·'w'·})).toThrow(

@repo/core:lint:biome:      61     │ - ······'Practice·feature·id·must·not·be·empty.',

@repo/core:lint:biome:      62     │ - ····);

@repo/core:lint:biome:      63     │ - ····expect(()·=>·createAccountPracticeScope({·accountId:·'a',·featureId:·'f',·workspaceId:·'·'·})).toThrow(

@repo/core:lint:biome:      64     │ - ······'Practice·workspace·id·must·not·be·empty.',

@repo/core:lint:biome:      65     │ - ····);

@repo/core:lint:biome:          60 │ + ····expect(()·=>

@repo/core:lint:biome:          61 │ + ······createAccountPracticeScope({·accountId:·'a',·featureId:·'·',·workspaceId:·'w'·}),

@repo/core:lint:biome:          62 │ + ····).toThrow('Practice·feature·id·must·not·be·empty.');

@repo/core:lint:biome:          63 │ + ····expect(()·=>

@repo/core:lint:biome:          64 │ + ······createAccountPracticeScope({·accountId:·'a',·featureId:·'f',·workspaceId:·'·'·}),

@repo/core:lint:biome:          65 │ + ····).toThrow('Practice·workspace·id·must·not·be·empty.');

@repo/core:lint:biome:      66  66 │       expect(() => deriveAccountPracticeKey(scope, ' ')).toThrow('Practice key must not be empty.');

@repo/core:lint:biome:      67  67 │     });
@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\practiceBoundary.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Sort the imported names.
@repo/core:lint:biome:   

@repo/core:lint:biome:   > 1 │ import {
@repo/core:lint:biome:       │ ^^^^^^^^

@repo/core:lint:biome:   > 2 │   createPersistenceIdentity,

@repo/core:lint:biome:   > 3 │   derivePersistenceKey,

@repo/core:lint:biome:   > 4 │   resolvePersistenceWriteDecision,

@repo/core:lint:biome:   > 5 │   type PersistenceIdentity,

@repo/core:lint:biome:   > 6 │   type PersistenceWriteDecision,

@repo/core:lint:biome:   > 7 │ } from './persistenceBoundary';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/core:lint:biome:     8 │ 

@repo/core:lint:biome:     9 │ export type AccountPracticeScope = Readonly<{
@repo/core:lint:biome:   
@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)

@repo/core:lint:biome:   

@repo/core:lint:biome:      2  2 │     createPersistenceIdentity,
@repo/core:lint:biome:      3  3 │     derivePersistenceKey,
@repo/core:lint:biome:      4    │ - ··resolvePersistenceWriteDecision,

@repo/core:lint:biome:      5    │ - ··type·PersistenceIdentity,

@repo/core:lint:biome:         4 │ + ··type·PersistenceIdentity,

@repo/core:lint:biome:      6  5 │     type PersistenceWriteDecision,

@repo/core:lint:biome:         6 │ + ··resolvePersistenceWriteDecision,

@repo/core:lint:biome:      7  7 │   } from './persistenceBoundary';
@repo/core:lint:biome:      8  8 │   

@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\practiceBoundary.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:

@repo/core:lint:biome:   

@repo/core:lint:biome:     57 57 │   export function deriveAccountPracticeIndexKey(accountId: string): string {

@repo/core:lint:biome:     58 58 │     const identity = createPersistenceIdentity({

@repo/core:lint:biome:     59    │ - ····experience:·'sandbox',·principal:·{·kind:·'account',·id:·accountId·},

@repo/core:lint:biome:        59 │ + ····experience:·'sandbox',

@repo/core:lint:biome:        60 │ + ····principal:·{·kind:·'account',·id:·accountId·},

@repo/core:lint:biome:     60 61 │     });

@repo/core:lint:biome:     61 62 │     return derivePersistenceKey(identity, 'practice:index');
@repo/core:lint:biome:   

@repo/core:lint:biome: 
@repo/core:lint:biome: src\lib\practiceContract.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort the imported names.
@repo/core:lint:biome:   

@repo/core:lint:biome:   > 1 │ import {

@repo/core:lint:biome:       │ ^^^^^^^^

@repo/core:lint:biome:   > 2 │   resolveAccountPracticeWriteDecision,

@repo/core:lint:biome:   > 3 │   type AccountPracticeScope,

@repo/core:lint:biome:   > 4 │ } from './practiceBoundary';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/core:lint:biome:     5 │ 

@repo/core:lint:biome:     6 │ export type PracticeValue = object;
@repo/core:lint:biome:   

@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)
@repo/core:lint:biome:   

@repo/core:lint:biome:      1  1 │   import {

@repo/core:lint:biome:      2    │ - ··resolveAccountPracticeWriteDecision,

@repo/core:lint:biome:      3    │ - ··type·AccountPracticeScope,

@repo/core:lint:biome:         2 │ + ··type·AccountPracticeScope,

@repo/core:lint:biome:         3 │ + ··resolveAccountPracticeWriteDecision,

@repo/core:lint:biome:      4  4 │   } from './practiceBoundary';

@repo/core:lint:biome:      5  5 │   
@repo/core:lint:biome:   

@repo/core:lint:biome: 
@repo/core:lint:biome: src\lib\practiceContract.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:      1    │ - import·{

@repo/core:lint:biome:      2    │ - ··resolveAccountPracticeWriteDecision,

@repo/core:lint:biome:      3    │ - ··type·AccountPracticeScope,

@repo/core:lint:biome:      4    │ - }·from·'./practiceBoundary';

@repo/core:lint:biome:         1 │ + import·{·resolveAccountPracticeWriteDecision,·type·AccountPracticeScope·}·from·'./practiceBoundary';
@repo/core:lint:biome:      5  2 │   

@repo/core:lint:biome:      6  3 │   export type PracticeValue = object;

@repo/core:lint:biome:   

@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\sync\__tests__\useMutationQueue.test.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   

@repo/core:lint:biome:    > 1 │ import { beforeEach, describe, expect, it } from 'vitest';

@repo/core:lint:biome:        │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/core:lint:biome:    > 2 │ import {

@repo/core:lint:biome:    > 3 │   MAX_DEAD_LETTER_QUEUE_SIZE,

@repo/core:lint:biome:    > 4 │   MAX_MUTATION_QUEUE_SIZE,

@repo/core:lint:biome:    > 5 │   MutationQueueCapacityError,

@repo/core:lint:biome:    > 6 │ } from '@repo/core/lib/sync/types';

@repo/core:lint:biome:    > 7 │ import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';

@repo/core:lint:biome:    > 8 │ import { setActiveAccountId } from '@repo/core/lib/accountScope';

@repo/core:lint:biome:        │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:      9 │ 

@repo/core:lint:biome:     10 │ describe('useMutationQueue (G0 Unit / G1 State)', () => {
@repo/core:lint:biome:   
@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)

@repo/core:lint:biome:   

@repo/core:lint:biome:       1     │ - import·{·beforeEach,·describe,·expect,·it·}·from·'vitest';

@repo/core:lint:biome:           1 │ + import·{·setActiveAccountId·}·from·'@repo/core/lib/accountScope';

@repo/core:lint:biome:       2   2 │   import {

@repo/core:lint:biome:       3   3 │     MAX_DEAD_LETTER_QUEUE_SIZE,

@repo/core:lint:biome:     ······· │ 

@repo/core:lint:biome:       6   6 │   } from '@repo/core/lib/sync/types';

@repo/core:lint:biome:       7   7 │   import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';

@repo/core:lint:biome:       8     │ - import·{·setActiveAccountId·}·from·'@repo/core/lib/accountScope';

@repo/core:lint:biome:           8 │ + import·{·beforeEach,·describe,·expect,·it·}·from·'vitest';

@repo/core:lint:biome:       9   9 │   

@repo/core:lint:biome:      10  10 │   describe('useMutationQueue (G0 Unit / G1 State)', () => {
@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\sync\__tests__\useMutationQueue.test.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/platform-mcp:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"

@repo/core:lint:biome:   × Formatter would have printed the following content:

@repo/core:lint:biome:   

@repo/core:lint:biome:      18  18 │       const operationId = '123e4567-e89b-12d3-a456-426614174001';

@repo/core:lint:biome:      19  19 │       await useMutationQueue.getState().addToQueue({

@repo/core:lint:biome:      20     │ - ······name:·'prepared-command',·scope:·'workspace',·type:·'UPDATE',·variables:·{·value:·'draft'·},

@repo/core:lint:biome:      21     │ - ······operationId,·inputHash:·'a'.repeat(64),·clientRevision:·4,

@repo/core:lint:biome:          20 │ + ······name:·'prepared-command',

@repo/core:lint:biome:          21 │ + ······scope:·'workspace',

@repo/core:lint:biome:          22 │ + ······type:·'UPDATE',

@repo/core:lint:biome:          23 │ + ······variables:·{·value:·'draft'·},

@repo/core:lint:biome:          24 │ + ······operationId,

@repo/core:lint:biome:          25 │ + ······inputHash:·'a'.repeat(64),

@repo/core:lint:biome:          26 │ + ······clientRevision:·4,

@repo/core:lint:biome:      22  27 │       });

@repo/core:lint:biome:      23  28 │       const pending = useMutationQueue.getState().queue[0];
@repo/core:lint:biome:   

@repo/core:lint:biome: 
@repo/core:lint:biome: src\lib\sync\registry.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   

@repo/core:lint:biome:   > 1 │ import { createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:   > 2 │ import { api } from '@repo/core/api/client';

@repo/core:lint:biome:   > 3 │ import { deviceTrustAPI } from '@repo/core/api/deviceTrust';

@repo/core:lint:biome:   > 4 │ import { orpcClient } from '@repo/core/api/orpcClient';

@repo/core:lint:biome:   > 5 │ import { replayAssignmentSubmission } from '@repo/core/api/assignmentCommands';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/core:lint:biome:     6 │ 

@repo/core:lint:biome:     7 │ const client = createSovereignClient(SOVEREIGN_API_URL);

@repo/core:lint:biome:   

@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)

@repo/core:lint:biome:   

@repo/core:lint:biome:       1     │ - import·{·createSovereignClient,·SOVEREIGN_API_URL·}·from·'@repo/core/api/base';

@repo/core:lint:biome:       2     │ - import·{·api·}·from·'@repo/core/api/client';

@repo/core:lint:biome:       3     │ - import·{·deviceTrustAPI·}·from·'@repo/core/api/deviceTrust';

@repo/core:lint:biome:       4     │ - import·{·orpcClient·}·from·'@repo/core/api/orpcClient';

@repo/core:lint:biome:       5     │ - import·{·replayAssignmentSubmission·}·from·'@repo/core/api/assignmentCommands';

@repo/core:lint:biome:           1 │ + import·{·replayAssignmentSubmission·}·from·'@repo/core/api/assignmentCommands';

@repo/core:lint:biome:           2 │ + import·{·createSovereignClient,·SOVEREIGN_API_URL·}·from·'@repo/core/api/base';

@repo/core:lint:biome:           3 │ + import·{·api·}·from·'@repo/core/api/client';

@repo/core:lint:biome:           4 │ + import·{·deviceTrustAPI·}·from·'@repo/core/api/deviceTrust';

@repo/core:lint:biome:           5 │ + import·{·orpcClient·}·from·'@repo/core/api/orpcClient';
@repo/core:lint:biome:       6   6 │   

@repo/core:lint:biome:       7   7 │   const client = createSovereignClient(SOVEREIGN_API_URL);
@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\sync\registry.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:

@repo/core:lint:biome:   

@repo/core:lint:biome:      14  14 │    */
@repo/core:lint:biome:      15  15 │   

@repo/core:lint:biome:      16     │ - type·MutationExecutionContext·=·Readonly<{·idempotencyKey:·string;·commandId?:·string;·userId?:·string·}>;

@repo/core:lint:biome:          16 │ + type·MutationExecutionContext·=·Readonly<{

@repo/core:lint:biome:          17 │ + ··idempotencyKey:·string;

@repo/core:lint:biome:          18 │ + ··commandId?:·string;

@repo/core:lint:biome:          19 │ + ··userId?:·string;

@repo/core:lint:biome:          20 │ + }>;

@repo/core:lint:biome:      17  21 │   type MutationFunction = (variables: any, context?: MutationExecutionContext) => Promise<any>;

@repo/core:lint:biome:      18  22 │   
@repo/core:lint:biome:     ······· │ 

@repo/core:lint:biome:      57  61 │           body: {

@repo/core:lint:biome:      58  62 │             idempotencyKey: requireIdempotencyKey(context),

@repo/core:lint:biome:      59     │ - ········crud:·[

@repo/core:lint:biome:      60     │ - ··········{

@repo/core:lint:biome:      61     │ - ············id:·vars.id·||·(typeof·crypto·!==·'undefined'·?·crypto.randomUUID()·:·'temp-id'),

@repo/core:lint:biome:      62     │ - ············op:·'PUT',

@repo/core:lint:biome:      63     │ - ············table:·'fire_journal',

@repo/core:lint:biome:      64     │ - ············opData:·vars,

@repo/core:lint:biome:      65     │ - ··········},

@repo/core:lint:biome:      66     │ - ········],

@repo/core:lint:biome:          63 │ + ··········crud:·[

@repo/core:lint:biome:          64 │ + ············{

@repo/core:lint:biome:          65 │ + ··············id:·vars.id·||·(typeof·crypto·!==·'undefined'·?·crypto.randomUUID()·:·'temp-id'),

@repo/core:lint:biome:          66 │ + ··············op:·'PUT',

@repo/core:lint:biome:          67 │ + ··············table:·'fire_journal',

@repo/core:lint:biome:          68 │ + ··············opData:·vars,

@repo/core:lint:biome:          69 │ + ············},

@repo/core:lint:biome:          70 │ + ··········],

@repo/core:lint:biome:      67  71 │           },

@repo/core:lint:biome:      68  72 │         });
@repo/core:lint:biome:     ······· │ 

@repo/core:lint:biome:      77  81 │         await orpcClient.sync.uploadBatch({

@repo/core:lint:biome:      78  82 │           body: {

@repo/core:lint:biome:      79     │ - ········idempotencyKey:·requireIdempotencyKey(context),

@repo/core:lint:biome:      80     │ - ········crud:·[

@repo/core:lint:biome:      81     │ - ··········{

@repo/core:lint:biome:      82     │ - ············id:·vars.id·||·(typeof·crypto·!==·'undefined'·?·crypto.randomUUID()·:·'temp-id'),

@repo/core:lint:biome:      83     │ - ············op:·'PUT',

@repo/core:lint:biome:      84     │ - ············table:·'mood_logs',

@repo/core:lint:biome:      85     │ - ············opData:·vars,

@repo/core:lint:biome:      86     │ - ··········},

@repo/core:lint:biome:      87     │ - ········],

@repo/core:lint:biome:          83 │ + ··········idempotencyKey:·requireIdempotencyKey(context),

@repo/core:lint:biome:          84 │ + ··········crud:·[

@repo/core:lint:biome:          85 │ + ············{

@repo/core:lint:biome:          86 │ + ··············id:·vars.id·||·(typeof·crypto·!==·'undefined'·?·crypto.randomUUID()·:·'temp-id'),

@repo/core:lint:biome:          87 │ + ··············op:·'PUT',

@repo/core:lint:biome:          88 │ + ··············table:·'mood_logs',

@repo/core:lint:biome:          89 │ + ··············opData:·vars,

@repo/core:lint:biome:          90 │ + ············},

@repo/core:lint:biome:          91 │ + ··········],

@repo/core:lint:biome:      88  92 │           },

@repo/core:lint:biome:      89  93 │         });
@repo/core:lint:biome:   

@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\sync\sync\SyncManager.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:     154 154 │             updateEntry(item.id, 'syncing');

@repo/core:lint:biome:     155 155 │             await mutationFn(item.variables, {

@repo/core:lint:biome:     156     │ - ············idempotencyKey:·item.idempotencyKey,·commandId:·item.id,·userId:·item.userId,

@repo/core:lint:biome:         156 │ + ············idempotencyKey:·item.idempotencyKey,

@repo/core:lint:biome:         157 │ + ············commandId:·item.id,

@repo/core:lint:biome:         158 │ + ············userId:·item.userId,

@repo/core:lint:biome:     157 159 │             });

@repo/core:lint:biome:     158 160 │   
@repo/core:lint:biome:   

@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\sync\types.ts:5:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   
@repo/core:lint:biome:     3 │  */
@repo/core:lint:biome:     4 │ 

@repo/core:lint:biome:   > 5 │ import type { MutationType } from '@repo/core/logic/ports/database.port';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:   > 6 │ import type { MutationCommandState } from '@repo/core/lib/sync/commandLifecycle';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:     7 │ 
@repo/core:lint:biome:     8 │ export type { MutationType };
@repo/core:lint:biome:   
@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)
@repo/core:lint:biome:   

@repo/core:lint:biome:       3   3 │    */
@repo/core:lint:biome:       4   4 │   

@repo/core:lint:biome:       5     │ - import·type·{·MutationType·}·from·'@repo/core/logic/ports/database.port';

@repo/core:lint:biome:       6     │ - import·type·{·MutationCommandState·}·from·'@repo/core/lib/sync/commandLifecycle';

@repo/core:lint:biome:           5 │ + import·type·{·MutationCommandState·}·from·'@repo/core/lib/sync/commandLifecycle';

@repo/core:lint:biome:           6 │ + import·type·{·MutationType·}·from·'@repo/core/logic/ports/database.port';

@repo/core:lint:biome:       7   7 │   

@repo/core:lint:biome:       8   8 │   export type { MutationType };
@repo/core:lint:biome:   

@repo/core:lint:biome: 

@repo/core:lint:biome: src\lib\sync\useMutationQueue.ts:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Sort these imports.
@repo/core:lint:biome:   

@repo/core:lint:biome:   > 1 │ import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:   > 2 │ import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';

@repo/core:lint:biome:   > 3 │ import { getActiveAccountId } from '@repo/core/lib/accountScope';

@repo/core:lint:biome:   > 4 │ import { CURRENT_OUTBOX_SCHEMA_VERSION } from '@repo/core/lib/sync/outboxMigration';

@repo/core:lint:biome:   > 5 │ import { assertMutationCommandTransition } from '@repo/core/lib/sync/commandLifecycle';

@repo/core:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/core:lint:biome:     6 │ import {

@repo/core:lint:biome:     7 │   MAX_DEAD_LETTER_QUEUE_SIZE,
@repo/core:lint:biome:   

@repo/core:lint:biome:   i Safe fix: Organize imports and exports (Biome)
@repo/core:lint:biome:   

@repo/core:lint:biome:       1     │ - import·{·SafeZustandStorage·}·from·'@repo/core/lib/storageWrapper';

@repo/core:lint:biome:       2     │ - import·{·generateIdempotencyKey·}·from·'@repo/core/lib/sync/idempotency';

@repo/core:lint:biome:       3     │ - import·{·getActiveAccountId·}·from·'@repo/core/lib/accountScope';

@repo/core:lint:biome:       4     │ - import·{·CURRENT_OUTBOX_SCHEMA_VERSION·}·from·'@repo/core/lib/sync/outboxMigration';

@repo/core:lint:biome:       5     │ - import·{·assertMutationCommandTransition·}·from·'@repo/core/lib/sync/commandLifecycle';

@repo/core:lint:biome:           1 │ + import·{·getActiveAccountId·}·from·'@repo/core/lib/accountScope';

@repo/core:lint:biome:           2 │ + import·{·SafeZustandStorage·}·from·'@repo/core/lib/storageWrapper';

@repo/core:lint:biome:           3 │ + import·{·assertMutationCommandTransition·}·from·'@repo/core/lib/sync/commandLifecycle';

@repo/core:lint:biome:           4 │ + import·{·generateIdempotencyKey·}·from·'@repo/core/lib/sync/idempotency';

@repo/core:lint:biome:           5 │ + import·{·CURRENT_OUTBOX_SCHEMA_VERSION·}·from·'@repo/core/lib/sync/outboxMigration';

@repo/core:lint:biome:       6   6 │   import {

@repo/core:lint:biome:       7   7 │     MAX_DEAD_LETTER_QUEUE_SIZE,
@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: src\logic\registry\capabilityManifest.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:

@repo/core:lint:biome:   

@repo/core:lint:biome:     149 149 │     if (

@repo/core:lint:biome:     150 150 │       practice.capacities &&

@repo/core:lint:biome:     151     │ - ····(!input.capacity·||·!practice.capacities.some((value)·=>·value.toLowerCase()·===·input.capacity?.toLowerCase()))

@repo/core:lint:biome:         151 │ + ····(!input.capacity·||

@repo/core:lint:biome:         152 │ + ······!practice.capacities.some((value)·=>·value.toLowerCase()·===·input.capacity?.toLowerCase()))

@repo/core:lint:biome:     152 153 │     )

@repo/core:lint:biome:     153 154 │       return { available: false, reason: 'capacity-unsupported' };
@repo/core:lint:biome:   

@repo/core:lint:biome: 
@repo/core:lint:biome: src\types\API.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:      6  6 │     public override readonly cause: unknown = undefined;

@repo/core:lint:biome:      7  7 │   

@repo/core:lint:biome:      8    │ - ··constructor(message:·string,·code·=·'API_ERROR',·details?:·unknown,·reportedToTelemetry·=·false,·cause?:·unknown)·{

@repo/core:lint:biome:         8 │ + ··constructor(

@repo/core:lint:biome:         9 │ + ····message:·string,

@repo/core:lint:biome:        10 │ + ····code·=·'API_ERROR',

@repo/core:lint:biome:        11 │ + ····details?:·unknown,

@repo/core:lint:biome:        12 │ + ····reportedToTelemetry·=·false,

@repo/core:lint:biome:        13 │ + ····cause?:·unknown,

@repo/core:lint:biome:        14 │ + ··)·{

@repo/core:lint:biome:      9 15 │       const normalizedCode = code;

@repo/core:lint:biome:     10 16 │       super({
@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: Checked 17 files in 52ms. No fixes applied.
@repo/core:lint:biome: Found 19 errors.

@repo/core:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Some errors were emitted while running checks.

@repo/core:lint:biome:   
@repo/core:lint:biome: 

@repo/core:lint:biome: 
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: REPORT SUMMARY
@repo/core:lint:biome: Duration: 1.6 seconds
@repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/core:lint:biome: Raw Log:  C:\x\reports\run-packages_core-lint_biome.log

@repo/core:lint:biome: Report:   C:\x\reports\run-packages_core-lint_biome-report.txt
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: >>> Starting Process: 10/15/2026, 3:44:34 PM (IST)

@repo/platform-mcp:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/platform-mcp:lint:biome: >>> Working Dir: C:\x\packages\platform-mcp

@repo/platform-mcp:lint:biome: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log

@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: [ELIFECYCLE] Command failed with exit code 1.

gurudevi-mobile:lint:biome: cache miss, executing d88a7871be614f82

@repo/community:lint:biome: cache miss, executing 1c6ac25970cc0396

@repo/self:lint:biome: cache miss, executing 66dcbb75c4973ba7

gurudevi-web:lint:biome: cache miss, executing 12c764ebd1423dcd

@repo/ui:lint:biome: cache miss, executing 871e6b9c7eb3cfe3

@repo/scanner-kit:lint:biome: cache miss, executing 6809064752edde22

@repo/accounting:lint:biome: cache miss, executing 3d86a1f3eb3ae91e

@repo/ai:lint:biome: cache miss, executing b343cb608f81764e

@repo/classroom:lint:biome: cache miss, executing 1a9f847dc63a956c

@repo/form-builder:lint:biome: cache miss, executing 6d35062b8dfb1947

@repo/library:lint:biome: cache miss, executing cc72ec94adf07e29

@repo/workforce:lint:biome: cache miss, executing dc46464fbd86411b

@repo/analytics:lint:biome: cache miss, executing 301c0e8aec5b8e73

apps-edlove-web:lint:biome: cache miss, executing cf2ee7b40eeeab77

@repo/people:lint:biome: cache miss, executing 49d085bb5ee46e7b

@repo/profile:lint:biome: cache miss, executing b4f5a6d8c581ba14

@repo/types-shim:lint:biome: cache miss, executing 8d8a0442354af5c4

@repo/admin:lint:biome: cache miss, executing bd70cea185af16df

@repo/editorial:lint:biome: cache miss, executing 5d5f624ccf1f48f9

@repo/database:lint:biome: cache miss, executing dbfc141d6ed11952

apps-gurudevi-marketing-web:lint:biome: cache miss, executing fc80b7be5889026c

@repo/graphics:lint:biome: cache miss, executing 3a526a2d4e771263

@repo/core#lint:biome:  ERROR  command (C:\x\packages\core) C:\Users\Naween\AppData\Local\mise\installs\node\22.23.2\pnpm.cmd run lint:biome exited (1)


 Tasks:    1 successful, 25 total
Cached:    0 cached, 25 total
  Time:    3.367s 
Failed:    @repo/core#lint:biome


 ERROR  run failed: command  exited (1)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 6.9 seconds
Findings: 1 (Errors: 1, Warnings: 0)

Raw Log:  C:\x\reports\run-package_json-lint.log

Report:   C:\x\reports\run-package_json-lint-report.txt
--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
