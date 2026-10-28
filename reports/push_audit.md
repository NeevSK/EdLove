# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 10/28/2026, 9:33:58 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD && pnpm run lint && pnpm run audit:react-doctor && node scripts/surgical-push-check.mjs
> **Duration:** 42.0s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 38 |
| apps/gurudevi-web | 3 |

## Detailed Findings

### Category: General
- apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/profile:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\hooks\useRewardedAdHub.test.ts" "src\hooks\useRewardedAdHub.ts" "src\screens\ProfileScreen.tsx"
- @repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\api\__tests__\highways.test.ts" "src\api\highways.ts" "src\flows\index.ts" "src\hooks\useEntitlementQuery.ts" "src\lib\monitoring\__tests__\posthog.test.ts" "src\lib\monitoring\__tests__\safeData.test.ts" "src\logic\permissions\hooks\usePermissions.ts" "src\monitoring\posthog.ts" "src\monitoring\safeData.ts" "src\native\index.ts" "src\scene\resolveScene.ts" "src\scene\sky.ts" "src\store\__tests__\useCedarDecisionStore.test.ts" "src\store\useCedarDecisionStore.ts" "src\types\Workspace.ts" "src\types\index.ts"
- @repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:lint:biome: >>> Executing scoped Biome check (chunk 1/2): pnpm exec biome check --no-errors-on-unmatched "app.json" "app\(tabs)\_layout.tsx" "app\(tabs)\self\index.tsx" "app\(tabs)\workspace\index.tsx" "app\+native-intent.tsx" "app\auth.tsx" "app\onboarding.tsx" "app\welcome.tsx" "index.ts" "metro.config.js" "src\__tests__\architecture\entry-shell-service-recovery.test.ts" "src\__tests__\architecture\startup-coordinator.test.ts" "src\__tests__\architecture\startupTelemetry.test.ts" "src\__tests__\architecture\workspace-route-resolution.test.ts" "src\__tests__\entry\GuestLeaseBoundary.test.tsx" "src\__tests__\entry\GuestPersistenceNotice.test.tsx" "src\__tests__\entry\SessionRouteGate.test.tsx" "src\__tests__\entry\entryRouteMatrix.test.ts" "src\__tests__\providers\selfCanvasPins.test.tsx" "src\__tests__\runtime\VergerLabScreen.test.tsx" "src\boot\startupCoordinator.ts" "src\boot\startupTelemetry.ts" "src\entry\EntryShell.tsx" "src\entry\EntryStartupBoundary.tsx" "src\entry\GuestLeaseBoundary.tsx" "src\entry\GuestPersistenceNotice.tsx" "src\entry\SessionRouteGate.tsx" "src\entry\bootstrapRouteState.ts" "src\hooks\useSelfCanvas.ts" "src\lib\workspace\routeResolution.ts"
- gurudevi-mobile:lint:biome: >>> Executing scoped Biome check (chunk 2/2): pnpm exec biome check --no-errors-on-unmatched "src\runtime\GurudeviVerger.tsx" "src\runtime\lab\VergerLabScreen.tsx" "src\shims\early-bootstrap.js" "src\telemetry\devTelemetryCatcher.ts"
- @repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-web:lint:biome: >>> Executing scoped Biome check (chunk 1/2): pnpm exec biome check --no-errors-on-unmatched "app\(sanctuary)\auth\AuthFrame.tsx" "app\(sanctuary)\auth\PasswordlessEntry.test.tsx" "app\(sanctuary)\auth\PasswordlessEntry.tsx" "app\(sanctuary)\auth\SignInFlow.tsx" "app\(sanctuary)\community\CommunityFeedFloor.tsx" "app\(sanctuary)\community\page.tsx" "app\(sanctuary)\components\DiurnalThemeToggle.tsx" "app\(sanctuary)\components\FloorStudioDrawer.tsx" "app\(sanctuary)\components\SanctuaryFloorCanvas.tsx" "app\(sanctuary)\components\SanctuaryShell.tsx" "app\(sanctuary)\components\WorkspaceWallpaperLayer.tsx" "app\(sanctuary)\error.tsx" "app\(sanctuary)\layout.tsx" "app\(sanctuary)\library\LibraryFloor.tsx" "app\(sanctuary)\library\page.tsx" "app\(sanctuary)\notifications\page.tsx" "app\(sanctuary)\onboarding\OnboardingForm.tsx" "app\(sanctuary)\onboarding\page.tsx" "app\(sanctuary)\profile\ProfileFloor.tsx" "app\(sanctuary)\profile\page.tsx" "app\(sanctuary)\self\SelfFloor.tsx" "app\(sanctuary)\self\attendance\StudentAttendanceFloor.tsx" "app\(sanctuary)\self\page.tsx" "app\(sanctuary)\settings\page.tsx" "app\(sanctuary)\sign-up\page.tsx" "app\(sanctuary)\welcome\WelcomeStage.tsx" "app\(sanctuary)\welcome\page.tsx" "app\(sanctuary)\workspace\page.tsx" "app\error.tsx" "app\not-found.tsx"
- gurudevi-web:lint:biome: >>> Executing scoped Biome check (chunk 2/2): pnpm exec biome check --no-errors-on-unmatched "lib\canvas\useBrowserWorkspaceAppearance.ts" "lib\host-routing.test.ts" "lib\host-routing.ts" "lib\workbench\quickAccessPreferences.ts" "lib\workbench\useDomainWorkbench.ts" "next-env.d.ts" "tests\integration\selfFloor.component.test.tsx" "tests\unit\canvas\workspaceAppearanceStorage.test.ts" "tests\unit\workspaceFeatureRegistry.test.ts"
- @repo/classroom:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\components\ClassroomList.tsx" "src\components\index.ts" "src\components\teacher\index.ts" "src\screens\StudentProfileScreen.tsx" "src\screens\TeacherClassroomDashboard.tsx" "src\workspace\useClassroomWorkspaceSurfaces.tsx"
- @repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ui:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "package.json" "src\components\ActiveSubTabStrip.tsx" "src\components\CelebrationOverlay.tsx" "src\components\LotusPetalFAB.tsx" "src\components\Success.tsx" "src\components\TemporalScrubber.tsx" "src\components\ui\actionsheet\index.tsx" "src\components\visualization\AstroView.tsx" "src\components\workspace\DraggableCanvasSurface.tsx" "src\context\CircadianProvider.tsx" "src\index.ts" "src\index.web.ts" "src\screens\AuthScreen.tsx" "src\screens\OnboardingScreen.tsx" "src\screens\OnboardingWrapper.test.tsx" "src\screens\OnboardingWrapper.tsx" "src\screens\__tests__\onboardingJourney.test.ts" "src\screens\onboardingFlow.ts" "src\utils\navigation.ts"
- @repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/admin:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\hooks\useAdminWorkspaceSurfaces.tsx"
- @repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/editorial:lint:eslint: TypeError: Cannot read properties of undefined (reading 'Void')
- @repo/platform-mcp:lint:eslint: TypeError: Cannot read properties of undefined (reading 'Void')
- @repo/platform-mcp:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)
- @repo/editorial#lint:eslint:  ERROR  command (C:\x\packages\editorial) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.15.0\pnpm.exe run lint:eslint exited (2)
- ERROR  run failed: command  exited (2)
- Findings: 1 (Errors: 1, Warnings: 0)

### Category: apps/gurudevi-web
- apps-edlove-web:lint:biome: warning: in the working copy of 'apps/gurudevi-web/app/(sanctuary)/components/SanctuaryShell.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/ai:lint:biome: warning: in the working copy of 'apps/gurudevi-web/app/(sanctuary)/components/SanctuaryShell.tsx', CRLF will be replaced by LF the next time Git touches it
- @repo/community:lint:biome: warning: in the working copy of 'apps/gurudevi-web/app/(sanctuary)/components/SanctuaryShell.tsx', CRLF will be replaced by LF the next time Git touches it

## Raw Output

```text
$ node ./scripts/run-and-report.mjs --cmd "pnpm turbo run lint --concurrency=2" --name "package_json-lint"

>>> Starting Process: 10/28/2026, 9:33:22 AM (IST)

>>> Command: pnpm turbo run lint --concurrency=2

>>> Working Dir: C:\x
>>> Log output: C:\x\reports\run-package_json-lint.log
--------------------------------------------------------------------------------


   • turbo 2.11.10

   • Packages in scope: @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/editorial, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/verger-android, @repo/verger-core, @repo/verger-react, @repo/verger-react-native, @repo/verger-web, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, gurudevi-mobile, gurudevi-web, oxlint-plugin-edlove
   • Running lint in 36 packages
   • Remote caching disabled


@repo/payments:lint:biome: cache miss, executing 6ade38852d0feccb

apps-edlove-web:lint:biome: cache hit, replaying logs 0fe177b87df2bf24

apps-edlove-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_edlove-web-lint_biome"
apps-edlove-web:lint:biome: >>> Starting Process: 10/28/2026, 9:32:18 AM (IST)
apps-edlove-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
apps-edlove-web:lint:biome: >>> Working Dir: C:\x\apps\edlove-web
apps-edlove-web:lint:biome: >>> Log output: C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
apps-edlove-web:lint:biome: warning: in the working copy of 'apps/gurudevi-web/app/(sanctuary)/components/SanctuaryShell.tsx', CRLF will be replaced by LF the next time Git touches it
apps-edlove-web:lint:biome: >>> No modified files found to format.
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------
apps-edlove-web:lint:biome: REPORT SUMMARY
apps-edlove-web:lint:biome: Duration: 1.1 seconds
apps-edlove-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:lint:biome: Raw Log:  C:\x\reports\run-apps_edlove-web-lint_biome.log
apps-edlove-web:lint:biome: Report:   C:\x\reports\run-apps_edlove-web-lint_biome-report.txt
apps-edlove-web:lint:biome: --------------------------------------------------------------------------------

@repo/editorial:lint:biome: cache miss, executing f34b8bb07bf96c2d

@repo/payments:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_payments-lint_biome"

@repo/editorial:lint:biome: $ biome check src

@repo/payments:lint:biome: >>> Starting Process: 10/28/2026, 9:33:24 AM (IST)

@repo/payments:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/payments:lint:biome: >>> Working Dir: C:\x\packages\payments
@repo/payments:lint:biome: >>> Log output: C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/editorial:lint:biome: Checked 6 files in 20ms. No fixes applied.

@repo/profile:lint:biome: cache miss, executing c04b53a2b00c6f65

@repo/profile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_profile-lint_biome"

@repo/profile:lint:biome: >>> Starting Process: 10/28/2026, 9:33:25 AM (IST)

@repo/profile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/profile:lint:biome: >>> Working Dir: C:\x\packages\profile
@repo/profile:lint:biome: >>> Log output: C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: >>> No modified files found to format.

@repo/payments:lint:biome: 
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/payments:lint:biome: REPORT SUMMARY
@repo/payments:lint:biome: Duration: 1.1 seconds
@repo/payments:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/payments:lint:biome: Raw Log:  C:\x\reports\run-packages_payments-lint_biome.log
@repo/payments:lint:biome: Report:   C:\x\reports\run-packages_payments-lint_biome-report.txt
@repo/payments:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: cache miss, executing 9b21b1cba5d9f13e

@repo/workforce:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_workforce-lint_biome"

@repo/workforce:lint:biome: >>> Starting Process: 10/28/2026, 9:33:26 AM (IST)

@repo/workforce:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/workforce:lint:biome: >>> Working Dir: C:\x\packages\workforce

@repo/workforce:lint:biome: >>> Log output: C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: --------------------------------------------------------------------------------

@repo/profile:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\hooks\useRewardedAdHub.test.ts" "src\hooks\useRewardedAdHub.ts" "src\screens\ProfileScreen.tsx"

@repo/profile:lint:biome: Checked 3 files in 38ms. No fixes applied.

@repo/profile:lint:biome: 
@repo/profile:lint:biome: --------------------------------------------------------------------------------

@repo/profile:lint:biome: REPORT SUMMARY
@repo/profile:lint:biome: Duration: 2.5 seconds
@repo/profile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/profile:lint:biome: Raw Log:  C:\x\reports\run-packages_profile-lint_biome.log
@repo/profile:lint:biome: Report:   C:\x\reports\run-packages_profile-lint_biome-report.txt
@repo/profile:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:biome: cache miss, executing ef9058ce3536770c

@repo/database:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_database-lint_biome"

@repo/workforce:lint:biome: >>> No modified files found to format.

@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: --------------------------------------------------------------------------------

@repo/workforce:lint:biome: REPORT SUMMARY

@repo/workforce:lint:biome: Duration: 1.8 seconds
@repo/workforce:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/workforce:lint:biome: Raw Log:  C:\x\reports\run-packages_workforce-lint_biome.log
@repo/workforce:lint:biome: Report:   C:\x\reports\run-packages_workforce-lint_biome-report.txt
@repo/workforce:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:biome: >>> Starting Process: 10/28/2026, 9:33:28 AM (IST)

@repo/database:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/database:lint:biome: >>> Working Dir: C:\x\packages\database
@repo/database:lint:biome: >>> Log output: C:\x\reports\run-packages_database-lint_biome.log

@repo/database:lint:biome: --------------------------------------------------------------------------------

@repo/self:lint:biome: cache miss, executing d0c28647a53fa95e

@repo/self:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_self-lint_biome"

@repo/self:lint:biome: >>> Starting Process: 10/28/2026, 9:33:28 AM (IST)

@repo/self:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/self:lint:biome: >>> Working Dir: C:\x\packages\self
@repo/self:lint:biome: >>> Log output: C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:biome: >>> No modified files found to format.

@repo/database:lint:biome: 
@repo/database:lint:biome: --------------------------------------------------------------------------------

@repo/database:lint:biome: REPORT SUMMARY

@repo/database:lint:biome: Duration: 1.3 seconds
@repo/database:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/database:lint:biome: Raw Log:  C:\x\reports\run-packages_database-lint_biome.log
@repo/database:lint:biome: Report:   C:\x\reports\run-packages_database-lint_biome-report.txt
@repo/database:lint:biome: --------------------------------------------------------------------------------

@repo/library:lint:biome: cache miss, executing baf50cec4ea68293

@repo/library:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_library-lint_biome"

@repo/self:lint:biome: >>> No modified files found to format.

@repo/self:lint:biome: 
@repo/self:lint:biome: --------------------------------------------------------------------------------

@repo/self:lint:biome: REPORT SUMMARY
@repo/self:lint:biome: Duration: 1.1 seconds
@repo/self:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/self:lint:biome: Raw Log:  C:\x\reports\run-packages_self-lint_biome.log
@repo/self:lint:biome: Report:   C:\x\reports\run-packages_self-lint_biome-report.txt
@repo/self:lint:biome: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:biome: cache miss, executing 689560637c61cb86

@repo/library:lint:biome: >>> Starting Process: 10/28/2026, 9:33:29 AM (IST)

@repo/library:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/library:lint:biome: >>> Working Dir: C:\x\packages\library
@repo/library:lint:biome: >>> Log output: C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-marketingWeb-lint_biome"

apps-gurudevi-marketing-web:lint:biome: >>> Starting Process: 10/28/2026, 9:33:30 AM (IST)

apps-gurudevi-marketing-web:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

apps-gurudevi-marketing-web:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

@repo/library:lint:biome: >>> No modified files found to format.

@repo/library:lint:biome: 
@repo/library:lint:biome: --------------------------------------------------------------------------------

@repo/library:lint:biome: REPORT SUMMARY
@repo/library:lint:biome: Duration: 1.1 seconds
@repo/library:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/library:lint:biome: Raw Log:  C:\x\reports\run-packages_library-lint_biome.log
@repo/library:lint:biome: Report:   C:\x\reports\run-packages_library-lint_biome-report.txt

@repo/library:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: cache miss, executing 67478eace3af4333

apps-gurudevi-marketing-web:lint:biome: >>> No modified files found to format.

apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:lint:biome: REPORT SUMMARY

apps-gurudevi-marketing-web:lint:biome: Duration: 0.9 seconds
apps-gurudevi-marketing-web:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome.log
apps-gurudevi-marketing-web:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-marketingWeb-lint_biome-report.txt
apps-gurudevi-marketing-web:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_graphics-lint_biome"

@repo/types-shim:lint:biome: cache miss, executing fd411c76c19920f7

@repo/graphics:lint:biome: >>> Starting Process: 10/28/2026, 9:33:31 AM (IST)

@repo/graphics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/graphics:lint:biome: >>> Working Dir: C:\x\packages\graphics

@repo/graphics:lint:biome: >>> Log output: C:\x\reports\run-packages_graphics-lint_biome.log

@repo/graphics:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_types-shim-lint_biome"

@repo/types-shim:lint:biome: >>> Starting Process: 10/28/2026, 9:33:31 AM (IST)

@repo/types-shim:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/types-shim:lint:biome: >>> Working Dir: C:\x\packages\types-shim
@repo/types-shim:lint:biome: >>> Log output: C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: >>> No modified files found to format.

@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: --------------------------------------------------------------------------------

@repo/graphics:lint:biome: REPORT SUMMARY
@repo/graphics:lint:biome: Duration: 0.8 seconds

@repo/graphics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/graphics:lint:biome: Raw Log:  C:\x\reports\run-packages_graphics-lint_biome.log
@repo/graphics:lint:biome: Report:   C:\x\reports\run-packages_graphics-lint_biome-report.txt
@repo/graphics:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: cache miss, executing 5263ee4ad75d4323

@repo/people:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_people-lint_biome"

@repo/types-shim:lint:biome: >>> No modified files found to format.

@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/types-shim:lint:biome: REPORT SUMMARY
@repo/types-shim:lint:biome: Duration: 0.9 seconds
@repo/types-shim:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/types-shim:lint:biome: Raw Log:  C:\x\reports\run-packages_types-shim-lint_biome.log
@repo/types-shim:lint:biome: Report:   C:\x\reports\run-packages_types-shim-lint_biome-report.txt
@repo/types-shim:lint:biome: --------------------------------------------------------------------------------

@repo/ai:lint:biome: cache hit, replaying logs af61f8bb0a32bb6f

@repo/ai:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ai-lint_biome"
@repo/ai:lint:biome: >>> Starting Process: 10/28/2026, 9:32:18 AM (IST)
@repo/ai:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/ai:lint:biome: >>> Working Dir: C:\x\packages\ai
@repo/ai:lint:biome: >>> Log output: C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: --------------------------------------------------------------------------------
@repo/ai:lint:biome: warning: in the working copy of 'apps/gurudevi-web/app/(sanctuary)/components/SanctuaryShell.tsx', CRLF will be replaced by LF the next time Git touches it
@repo/ai:lint:biome: >>> No modified files found to format.
@repo/ai:lint:biome: 
@repo/ai:lint:biome: --------------------------------------------------------------------------------
@repo/ai:lint:biome: REPORT SUMMARY
@repo/ai:lint:biome: Duration: 1.1 seconds
@repo/ai:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/ai:lint:biome: Raw Log:  C:\x\reports\run-packages_ai-lint_biome.log
@repo/ai:lint:biome: Report:   C:\x\reports\run-packages_ai-lint_biome-report.txt
@repo/ai:lint:biome: --------------------------------------------------------------------------------

@repo/analytics:lint:biome: cache miss, executing 4264dc3c34e779a7

@repo/people:lint:biome: >>> Starting Process: 10/28/2026, 9:33:32 AM (IST)

@repo/people:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/people:lint:biome: >>> Working Dir: C:\x\packages\people
@repo/people:lint:biome: >>> Log output: C:\x\reports\run-packages_people-lint_biome.log
@repo/people:lint:biome: --------------------------------------------------------------------------------

@repo/analytics:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_analytics-lint_biome"

@repo/analytics:lint:biome: >>> Starting Process: 10/28/2026, 9:33:32 AM (IST)

@repo/analytics:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/analytics:lint:biome: >>> Working Dir: C:\x\packages\analytics
@repo/analytics:lint:biome: >>> Log output: C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: >>> No modified files found to format.

@repo/people:lint:biome: 
@repo/people:lint:biome: --------------------------------------------------------------------------------

@repo/people:lint:biome: REPORT SUMMARY
@repo/people:lint:biome: Duration: 1.1 seconds
@repo/people:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/people:lint:biome: Raw Log:  C:\x\reports\run-packages_people-lint_biome.log
@repo/people:lint:biome: Report:   C:\x\reports\run-packages_people-lint_biome-report.txt
@repo/people:lint:biome: --------------------------------------------------------------------------------

@repo/accounting:lint:biome: cache miss, executing b643f699f7a4ed1f

@repo/accounting:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_accounting-lint_biome"

@repo/analytics:lint:biome: >>> No modified files found to format.

@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: --------------------------------------------------------------------------------

@repo/analytics:lint:biome: REPORT SUMMARY
@repo/analytics:lint:biome: Duration: 1.1 seconds
@repo/analytics:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/analytics:lint:biome: Raw Log:  C:\x\reports\run-packages_analytics-lint_biome.log
@repo/analytics:lint:biome: Report:   C:\x\reports\run-packages_analytics-lint_biome-report.txt
@repo/analytics:lint:biome: --------------------------------------------------------------------------------

@repo/accounting:lint:biome: >>> Starting Process: 10/28/2026, 9:33:33 AM (IST)

@repo/accounting:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/accounting:lint:biome: >>> Working Dir: C:\x\packages\accounting
@repo/accounting:lint:biome: >>> Log output: C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: cache miss, executing a085b86c87580ad9

@repo/core:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_core-lint_biome"

@repo/core:lint:biome: >>> Starting Process: 10/28/2026, 9:33:34 AM (IST)

@repo/core:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/core:lint:biome: >>> Working Dir: C:\x\packages\core

@repo/core:lint:biome: >>> Log output: C:\x\reports\run-packages_core-lint_biome.log

@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/accounting:lint:biome: >>> No modified files found to format.

@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: --------------------------------------------------------------------------------

@repo/accounting:lint:biome: REPORT SUMMARY
@repo/accounting:lint:biome: Duration: 1.0 seconds
@repo/accounting:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/accounting:lint:biome: Raw Log:  C:\x\reports\run-packages_accounting-lint_biome.log
@repo/accounting:lint:biome: Report:   C:\x\reports\run-packages_accounting-lint_biome-report.txt
@repo/accounting:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: cache miss, executing 0573f86be0fb785e

gurudevi-mobile:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "apps_gurudevi-mobile-lint_biome"

@repo/core:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\api\__tests__\highways.test.ts" "src\api\highways.ts" "src\flows\index.ts" "src\hooks\useEntitlementQuery.ts" "src\lib\monitoring\__tests__\posthog.test.ts" "src\lib\monitoring\__tests__\safeData.test.ts" "src\logic\permissions\hooks\usePermissions.ts" "src\monitoring\posthog.ts" "src\monitoring\safeData.ts" "src\native\index.ts" "src\scene\resolveScene.ts" "src\scene\sky.ts" "src\store\__tests__\useCedarDecisionStore.test.ts" "src\store\useCedarDecisionStore.ts" "src\types\Workspace.ts" "src\types\index.ts"

gurudevi-mobile:lint:biome: >>> Starting Process: 10/28/2026, 9:33:35 AM (IST)

gurudevi-mobile:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

gurudevi-mobile:lint:biome: >>> Working Dir: C:\x\apps\gurudevi-mobile
gurudevi-mobile:lint:biome: >>> Log output: C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: Checked 16 files in 38ms. No fixes applied.

@repo/core:lint:biome: 
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/core:lint:biome: REPORT SUMMARY

@repo/core:lint:biome: Duration: 1.6 seconds
@repo/core:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/core:lint:biome: Raw Log:  C:\x\reports\run-packages_core-lint_biome.log
@repo/core:lint:biome: Report:   C:\x\reports\run-packages_core-lint_biome-report.txt
@repo/core:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: cache miss, executing 3e87ac571097bc16

@repo/form-builder:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_form-builder-lint_biome"

@repo/form-builder:lint:biome: >>> Starting Process: 10/28/2026, 9:33:36 AM (IST)

@repo/form-builder:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/form-builder:lint:biome: >>> Working Dir: C:\x\packages\form-builder
@repo/form-builder:lint:biome: >>> Log output: C:\x\reports\run-packages_form-builder-lint_biome.log
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: >>> Executing scoped Biome check (chunk 1/2): pnpm exec biome check --no-errors-on-unmatched "app.json" "app\(tabs)\_layout.tsx" "app\(tabs)\self\index.tsx" "app\(tabs)\workspace\index.tsx" "app\+native-intent.tsx" "app\auth.tsx" "app\onboarding.tsx" "app\welcome.tsx" "index.ts" "metro.config.js" "src\__tests__\architecture\entry-shell-service-recovery.test.ts" "src\__tests__\architecture\startup-coordinator.test.ts" "src\__tests__\architecture\startupTelemetry.test.ts" "src\__tests__\architecture\workspace-route-resolution.test.ts" "src\__tests__\entry\GuestLeaseBoundary.test.tsx" "src\__tests__\entry\GuestPersistenceNotice.test.tsx" "src\__tests__\entry\SessionRouteGate.test.tsx" "src\__tests__\entry\entryRouteMatrix.test.ts" "src\__tests__\providers\selfCanvasPins.test.tsx" "src\__tests__\runtime\VergerLabScreen.test.tsx" "src\boot\startupCoordinator.ts" "src\boot\startupTelemetry.ts" "src\entry\EntryShell.tsx" "src\entry\EntryStartupBoundary.tsx" "src\entry\GuestLeaseBoundary.tsx" "src\entry\GuestPersistenceNotice.tsx" "src\entry\SessionRouteGate.tsx" "src\entry\bootstrapRouteState.ts" "src\hooks\useSelfCanvas.ts" "src\lib\workspace\routeResolution.ts"

gurudevi-mobile:lint:biome: Checked 29 files in 43ms. No fixes applied.

gurudevi-mobile:lint:biome: >>> Executing scoped Biome check (chunk 2/2): pnpm exec biome check --no-errors-on-unmatched "src\runtime\GurudeviVerger.tsx" "src\runtime\lab\VergerLabScreen.tsx" "src\shims\early-bootstrap.js" "src\telemetry\devTelemetryCatcher.ts"

gurudevi-mobile:lint:biome: Checked 3 files in 14ms. No fixes applied.

@repo/form-builder:lint:biome: >>> No modified files found to format.

@repo/form-builder:lint:biome: 
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

@repo/form-builder:lint:biome: REPORT SUMMARY
@repo/form-builder:lint:biome: Duration: 0.8 seconds
@repo/form-builder:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/form-builder:lint:biome: Raw Log:  C:\x\reports\run-packages_form-builder-lint_biome.log
@repo/form-builder:lint:biome: Report:   C:\x\reports\run-packages_form-builder-lint_biome-report.txt
@repo/form-builder:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------

gurudevi-mobile:lint:biome: REPORT SUMMARY
gurudevi-mobile:lint:biome: Duration: 1.7 seconds
gurudevi-mobile:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
gurudevi-mobile:lint:biome: Raw Log:  C:\x\reports\run-apps_gurudevi-mobile-lint_biome.log
gurudevi-mobile:lint:biome: Report:   C:\x\reports\run-apps_gurudevi-mobile-lint_biome-report.txt

gurudevi-mobile:lint:biome: --------------------------------------------------------------------------------

gurudevi-web:lint:biome: cache miss, executing e98543f6f89808d4

@repo/classroom:lint:biome: cache miss, executing 8e3c731e4db574d8

gurudevi-web:lint:biome: $ node ../../scripts/scoped-biome.mjs

@repo/classroom:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_classroom-lint_biome"

@repo/classroom:lint:biome: >>> Starting Process: 10/28/2026, 9:33:37 AM (IST)

@repo/classroom:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/classroom:lint:biome: >>> Working Dir: C:\x\packages\classroom
@repo/classroom:lint:biome: >>> Log output: C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: --------------------------------------------------------------------------------

gurudevi-web:lint:biome: >>> Executing scoped Biome check (chunk 1/2): pnpm exec biome check --no-errors-on-unmatched "app\(sanctuary)\auth\AuthFrame.tsx" "app\(sanctuary)\auth\PasswordlessEntry.test.tsx" "app\(sanctuary)\auth\PasswordlessEntry.tsx" "app\(sanctuary)\auth\SignInFlow.tsx" "app\(sanctuary)\community\CommunityFeedFloor.tsx" "app\(sanctuary)\community\page.tsx" "app\(sanctuary)\components\DiurnalThemeToggle.tsx" "app\(sanctuary)\components\FloorStudioDrawer.tsx" "app\(sanctuary)\components\SanctuaryFloorCanvas.tsx" "app\(sanctuary)\components\SanctuaryShell.tsx" "app\(sanctuary)\components\WorkspaceWallpaperLayer.tsx" "app\(sanctuary)\error.tsx" "app\(sanctuary)\layout.tsx" "app\(sanctuary)\library\LibraryFloor.tsx" "app\(sanctuary)\library\page.tsx" "app\(sanctuary)\notifications\page.tsx" "app\(sanctuary)\onboarding\OnboardingForm.tsx" "app\(sanctuary)\onboarding\page.tsx" "app\(sanctuary)\profile\ProfileFloor.tsx" "app\(sanctuary)\profile\page.tsx" "app\(sanctuary)\self\SelfFloor.tsx" "app\(sanctuary)\self\attendance\StudentAttendanceFloor.tsx" "app\(sanctuary)\self\page.tsx" "app\(sanctuary)\settings\page.tsx" "app\(sanctuary)\sign-up\page.tsx" "app\(sanctuary)\welcome\WelcomeStage.tsx" "app\(sanctuary)\welcome\page.tsx" "app\(sanctuary)\workspace\page.tsx" "app\error.tsx" "app\not-found.tsx"

gurudevi-web:lint:biome: Checked 30 files in 99ms. No fixes applied.

gurudevi-web:lint:biome: >>> Executing scoped Biome check (chunk 2/2): pnpm exec biome check --no-errors-on-unmatched "lib\canvas\useBrowserWorkspaceAppearance.ts" "lib\host-routing.test.ts" "lib\host-routing.ts" "lib\workbench\quickAccessPreferences.ts" "lib\workbench\useDomainWorkbench.ts" "next-env.d.ts" "tests\integration\selfFloor.component.test.tsx" "tests\unit\canvas\workspaceAppearanceStorage.test.ts" "tests\unit\workspaceFeatureRegistry.test.ts"

@repo/classroom:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\components\ClassroomList.tsx" "src\components\index.ts" "src\components\teacher\index.ts" "src\screens\StudentProfileScreen.tsx" "src\screens\TeacherClassroomDashboard.tsx" "src\workspace\useClassroomWorkspaceSurfaces.tsx"

gurudevi-web:lint:biome: Checked 9 files in 56ms. No fixes applied.

@repo/scanner-kit:lint:biome: cache miss, executing b7aa16f0da7d1f9a

@repo/classroom:lint:biome: Checked 6 files in 20ms. No fixes applied.

@repo/classroom:lint:biome: 
@repo/classroom:lint:biome: --------------------------------------------------------------------------------

@repo/classroom:lint:biome: REPORT SUMMARY
@repo/classroom:lint:biome: Duration: 1.4 seconds
@repo/classroom:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/classroom:lint:biome: Raw Log:  C:\x\reports\run-packages_classroom-lint_biome.log
@repo/classroom:lint:biome: Report:   C:\x\reports\run-packages_classroom-lint_biome-report.txt
@repo/classroom:lint:biome: --------------------------------------------------------------------------------

@repo/scanner-kit:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_scanner-kit-lint_biome"

@repo/ui:lint:biome: cache miss, executing 24ecdb87d2471e65

@repo/scanner-kit:lint:biome: >>> Starting Process: 10/28/2026, 9:33:39 AM (IST)

@repo/scanner-kit:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/scanner-kit:lint:biome: >>> Working Dir: C:\x\packages\scanner-kit
@repo/scanner-kit:lint:biome: >>> Log output: C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------

@repo/ui:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_ui-lint_biome"

@repo/ui:lint:biome: >>> Starting Process: 10/28/2026, 9:33:39 AM (IST)

@repo/ui:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/ui:lint:biome: >>> Working Dir: C:\x\packages\ui
@repo/ui:lint:biome: >>> Log output: C:\x\reports\run-packages_ui-lint_biome.log

@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/scanner-kit:lint:biome: >>> No modified files found to format.

@repo/scanner-kit:lint:biome: 
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------

@repo/scanner-kit:lint:biome: REPORT SUMMARY
@repo/scanner-kit:lint:biome: Duration: 0.9 seconds

@repo/scanner-kit:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)

@repo/scanner-kit:lint:biome: Raw Log:  C:\x\reports\run-packages_scanner-kit-lint_biome.log
@repo/scanner-kit:lint:biome: Report:   C:\x\reports\run-packages_scanner-kit-lint_biome-report.txt
@repo/scanner-kit:lint:biome: --------------------------------------------------------------------------------

@repo/community:lint:biome: cache hit, replaying logs bef49fa0c5b050cb

@repo/community:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_community-lint_biome"
@repo/community:lint:biome: >>> Starting Process: 10/28/2026, 9:32:19 AM (IST)
@repo/community:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs
@repo/community:lint:biome: >>> Working Dir: C:\x\packages\community
@repo/community:lint:biome: >>> Log output: C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: warning: in the working copy of 'apps/gurudevi-web/app/(sanctuary)/components/SanctuaryShell.tsx', CRLF will be replaced by LF the next time Git touches it
@repo/community:lint:biome: >>> No modified files found to format.
@repo/community:lint:biome: 
@repo/community:lint:biome: --------------------------------------------------------------------------------
@repo/community:lint:biome: REPORT SUMMARY
@repo/community:lint:biome: Duration: 0.9 seconds
@repo/community:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/community:lint:biome: Raw Log:  C:\x\reports\run-packages_community-lint_biome.log
@repo/community:lint:biome: Report:   C:\x\reports\run-packages_community-lint_biome-report.txt
@repo/community:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: cache miss, executing a464608985339d3d

@repo/ui:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "package.json" "src\components\ActiveSubTabStrip.tsx" "src\components\CelebrationOverlay.tsx" "src\components\LotusPetalFAB.tsx" "src\components\Success.tsx" "src\components\TemporalScrubber.tsx" "src\components\ui\actionsheet\index.tsx" "src\components\visualization\AstroView.tsx" "src\components\workspace\DraggableCanvasSurface.tsx" "src\context\CircadianProvider.tsx" "src\index.ts" "src\index.web.ts" "src\screens\AuthScreen.tsx" "src\screens\OnboardingScreen.tsx" "src\screens\OnboardingWrapper.test.tsx" "src\screens\OnboardingWrapper.tsx" "src\screens\__tests__\onboardingJourney.test.ts" "src\screens\onboardingFlow.ts" "src\utils\navigation.ts"

@repo/platform-mcp:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_platform-mcp-lint_biome"

@repo/platform-mcp:lint:biome: >>> Starting Process: 10/28/2026, 9:33:40 AM (IST)

@repo/platform-mcp:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/platform-mcp:lint:biome: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:biome: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/ui:lint:biome: Checked 19 files in 55ms. No fixes applied.

@repo/ui:lint:biome: 
@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/ui:lint:biome: REPORT SUMMARY
@repo/ui:lint:biome: Duration: 1.4 seconds
@repo/ui:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/ui:lint:biome: Raw Log:  C:\x\reports\run-packages_ui-lint_biome.log
@repo/ui:lint:biome: Report:   C:\x\reports\run-packages_ui-lint_biome-report.txt
@repo/ui:lint:biome: --------------------------------------------------------------------------------

@repo/admin:lint:biome: cache miss, executing 7e1eea716b01065c

@repo/admin:lint:biome: $ node ../../scripts/run-and-report.mjs --cmd "node ../../scripts/scoped-biome.mjs" --name "packages_admin-lint_biome"

@repo/admin:lint:biome: >>> Starting Process: 10/28/2026, 9:33:41 AM (IST)

@repo/admin:lint:biome: >>> Command: node ../../scripts/scoped-biome.mjs

@repo/admin:lint:biome: >>> Working Dir: C:\x\packages\admin
@repo/admin:lint:biome: >>> Log output: C:\x\reports\run-packages_admin-lint_biome.log
@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: >>> No modified files found to format.

@repo/platform-mcp:lint:biome: 
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:biome: REPORT SUMMARY
@repo/platform-mcp:lint:biome: Duration: 0.8 seconds
@repo/platform-mcp:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/platform-mcp:lint:biome: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_biome.log
@repo/platform-mcp:lint:biome: Report:   C:\x\reports\run-packages_platform-mcp-lint_biome-report.txt
@repo/platform-mcp:lint:biome: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: cache miss, executing 2d07028d1c44728a

@repo/platform-mcp:lint:eslint: $ node ../../scripts/run-and-report.mjs --cmd "eslint ." --name "packages_platform-mcp-lint_eslint"

@repo/platform-mcp:lint:eslint: >>> Starting Process: 10/28/2026, 9:33:41 AM (IST)

@repo/platform-mcp:lint:eslint: >>> Command: eslint .
@repo/platform-mcp:lint:eslint: >>> Working Dir: C:\x\packages\platform-mcp
@repo/platform-mcp:lint:eslint: >>> Log output: C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/admin:lint:biome: >>> Executing scoped Biome check (chunk 1/1): pnpm exec biome check --no-errors-on-unmatched "src\hooks\useAdminWorkspaceSurfaces.tsx"

@repo/admin:lint:biome: Checked 1 file in 9ms. No fixes applied.

@repo/admin:lint:biome: 
@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/admin:lint:biome: REPORT SUMMARY
@repo/admin:lint:biome: Duration: 1.1 seconds
@repo/admin:lint:biome: Findings: 0 (Errors: 0, Warnings: 0)
@repo/admin:lint:biome: Raw Log:  C:\x\reports\run-packages_admin-lint_biome.log
@repo/admin:lint:biome: Report:   C:\x\reports\run-packages_admin-lint_biome-report.txt
@repo/admin:lint:biome: --------------------------------------------------------------------------------

@repo/editorial:lint:eslint: cache miss, executing dab161f7df1babd4

@repo/editorial:lint:eslint: $ eslint src

@repo/editorial:lint:eslint: 
@repo/editorial:lint:eslint: Oops! Something went wrong! :(
@repo/editorial:lint:eslint: 
@repo/editorial:lint:eslint: ESLint: 10.13.0
@repo/editorial:lint:eslint: 
@repo/editorial:lint:eslint: TypeError: Cannot read properties of undefined (reading 'Void')
@repo/editorial:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\eslint-plugin-sonarjs@4.2.2_7b06b4f56a7d27efc1c667fe9a5e4f23\node_modules\eslint-plugin-sonarjs\cjs\helpers\type.js:202:59)
@repo/editorial:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1929:14)
@repo/editorial:lint:eslint:     at Object..js (node:internal/modules/cjs/loader:2060:10)
@repo/editorial:lint:eslint:     at Module.load (node:internal/modules/cjs/loader:1651:32)
@repo/editorial:lint:eslint:     at Module._load (node:internal/modules/cjs/loader:1443:12)
@repo/editorial:lint:eslint:     at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
@repo/editorial:lint:eslint:     at Module.require (node:internal/modules/cjs/loader:1674:12)
@repo/editorial:lint:eslint:     at require (node:internal/modules/helpers:157:16)
@repo/editorial:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\eslint-plugin-sonarjs@4.2.2_7b06b4f56a7d27efc1c667fe9a5e4f23\node_modules\eslint-plugin-sonarjs\cjs\S1154\rule.js:59:19)
@repo/editorial:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1929:14)

@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: Oops! Something went wrong! :(
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: ESLint: 10.13.0
@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: TypeError: Cannot read properties of undefined (reading 'Void')
@repo/platform-mcp:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\eslint-plugin-sonarjs@4.2.2_7b06b4f56a7d27efc1c667fe9a5e4f23\node_modules\eslint-plugin-sonarjs\cjs\helpers\type.js:202:59)
@repo/platform-mcp:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1929:14)
@repo/platform-mcp:lint:eslint:     at Object..js (node:internal/modules/cjs/loader:2060:10)
@repo/platform-mcp:lint:eslint:     at Module.load (node:internal/modules/cjs/loader:1651:32)
@repo/platform-mcp:lint:eslint:     at Module._load (node:internal/modules/cjs/loader:1443:12)
@repo/platform-mcp:lint:eslint:     at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
@repo/platform-mcp:lint:eslint:     at Module.require (node:internal/modules/cjs/loader:1674:12)
@repo/platform-mcp:lint:eslint:     at require (node:internal/modules/helpers:157:16)
@repo/platform-mcp:lint:eslint:     at Object.<anonymous> (C:\x\node_modules\.pnpm\eslint-plugin-sonarjs@4.2.2_7b06b4f56a7d27efc1c667fe9a5e4f23\node_modules\eslint-plugin-sonarjs\cjs\S1154\rule.js:59:19)
@repo/platform-mcp:lint:eslint:     at Module._compile (node:internal/modules/cjs/loader:1929:14)

@repo/editorial:lint:eslint: [ELIFECYCLE] Command failed with exit code 2.

@repo/types-shim:lint:eslint: cache miss, executing ffc191a839240d47

@repo/database:lint:eslint: cache miss, executing d9eb993e8ef41f34

@repo/platform-mcp:lint:eslint: 
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: REPORT SUMMARY
@repo/platform-mcp:lint:eslint: Duration: 16.4 seconds

@repo/platform-mcp:lint:eslint: Findings: 1 (Errors: 1, Warnings: 0)

@repo/platform-mcp:lint:eslint: Raw Log:  C:\x\reports\run-packages_platform-mcp-lint_eslint.log
@repo/platform-mcp:lint:eslint: Report:   C:\x\reports\run-packages_platform-mcp-lint_eslint-report.txt
@repo/platform-mcp:lint:eslint: --------------------------------------------------------------------------------

@repo/platform-mcp:lint:eslint: [ELIFECYCLE] Command failed with exit code 1.

@repo/editorial#lint:eslint:  ERROR  command (C:\x\packages\editorial) C:\Users\Naween\AppData\Local\mise\installs\pnpm\12.15.0\pnpm.exe run lint:eslint exited (2)


 Tasks:    25 successful, 29 total
Cached:    3 cached, 29 total
  Time:    34.569s 
Failed:    @repo/editorial#lint:eslint


 ERROR  run failed: command  exited (2)


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 35.7 seconds
Findings: 1 (Errors: 1, Warnings: 0)
Raw Log:  C:\x\reports\run-package_json-lint.log
Report:   C:\x\reports\run-package_json-lint-report.txt
--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
