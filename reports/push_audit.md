# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/6/2026, 10:05:14 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm dlx gitleaks detect --source . --verbose
> **Duration:** 265.7s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 4 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 60 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 18 |
| packages/analytics | 21 |
| packages/community | 3 |
| packages/core | 12 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 6 |
| packages/scanner- | 3 |
| packages/trube-art | 3 |
| packages/ui | 21 |

## Detailed Findings

### Category: General
- x 68 dependency violations (0 errors, 68 warnings). 1936 modules, 6277 dependencies cruised.
- x 68 dependency violations (0 errors, 68 warnings). 1936 modules, 6277 dependencies cruised.
- x 68 dependency violations (0 errors, 68 warnings). 1936 modules, 6277 dependencies cruised.
- ERR_PNPM_DLX_NO_BIN  No binaries found in gitleaks

### Category: apps/edlove-web
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs

### Category: apps/gurudevi-marketingWeb
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs

### Category: apps/gurudevi-mobile
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js

### Category: apps/intuitui-web
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs

### Category: apps/neevsk-web
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs

### Category: packages/admin
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts

### Category: packages/analytics
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx

### Category: packages/community
- warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts

### Category: packages/core
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts

### Category: packages/library
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts

### Category: packages/lk-edu-geo
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts

### Category: packages/profile
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts

### Category: packages/scanner-
- warn no-orphans: packages/scanner-
- warn no-orphans: packages/scanner-
- warn no-orphans: packages/scanner-

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts

### Category: packages/ui
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx

## Raw Output

```text

> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:30:50.793Z

>>> Command: pnpm turbo run check-types
--------------------------------------------------------------------------------

• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile

   • Running check-types in 29 packages
   • Remote caching disabled


@repo/schema:check-types: cache hit, replaying logs 5142c8d6ed5c4236

@repo/schema:check-types: 
@repo/schema:check-types: > @repo/schema@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\schema
@repo/schema:check-types: > pnpm exec tsc --noEmit
@repo/schema:check-types: 
@repo/platform-mcp:check-types: cache hit, replaying logs 31a6d36994cd036d
@repo/platform-mcp:check-types: 
@repo/platform-mcp:check-types: > @repo/platform-mcp@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\platform-mcp
@repo/platform-mcp:check-types: > pnpm exec tsc --noEmit

@repo/platform-mcp:check-types: 

@repo/types-shim:check-types: cache hit, replaying logs 1211b7d4bd055451

@repo/types-shim:check-types: 
@repo/types-shim:check-types: > @repo/types-shim@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:check-types: > pnpm exec tsc --noEmit
@repo/types-shim:check-types: 

apps-intuitui-web:check-types: cache hit, replaying logs cf8e84cbc1fd1755

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec tsc --noEmit
apps-intuitui-web:check-types: 

apps-neevsk-web:check-types: cache hit, replaying logs ef3987ce8a008824

apps-neevsk-web:check-types: 

apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec tsc --noEmit
apps-neevsk-web:check-types: 

@repo/database:check-types: cache hit, replaying logs e9ededdc7ebc654e

@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > pnpm exec tsc --noEmit
@repo/database:check-types: 
apps-edlove-web:check-types: cache hit, replaying logs 7464d5878eaaa5c5

apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec tsc --noEmit
apps-edlove-web:check-types: 

@repo/core:check-types: cache miss, executing bb72db1f3b82d9cd

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 

@repo/ui:check-types: cache miss, executing f3c760cf274ac3c0

@repo/accounting:check-types: cache miss, executing 90756bf6e8a35e42
@intuitui-labs/lk-edu-geo:check-types: cache miss, executing 6652f35d828eff26

@repo/accounting:check-types: 
@repo/accounting:check-types: > @repo/accounting@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:check-types: > pnpm exec tsc --noEmit
@repo/accounting:check-types: 

@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: 

@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm exec tsc --noEmit
@repo/ui:check-types: 

@repo/payments:check-types: cache miss, executing e3d35d276a9ebd6a

@repo/payments:check-types: 
@repo/payments:check-types: > @repo/payments@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:check-types: > pnpm exec tsc --noEmit
@repo/payments:check-types: 

@repo/graphics:check-types: cache miss, executing 91e009bb9893dd8c

@repo/scanner-kit:check-types: cache miss, executing 4e9051604bb28f1a

@repo/ai:check-types: cache miss, executing b13b0ad88ec4ec90

@repo/workforce:check-types: cache miss, executing d390f0d7933b8bb8
@repo/people:check-types: cache miss, executing f5ac07f4a62eb630

@repo/people:check-types: 
@repo/people:check-types: > @repo/people@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: > pnpm exec tsc --noEmit
@repo/people:check-types: 

@repo/workforce:check-types: 
@repo/workforce:check-types: > @repo/workforce@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:check-types: > pnpm exec tsc --noEmit
@repo/workforce:check-types: 

@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: > @repo/scanner-kit@0.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\scanner-kit
@repo/scanner-kit:check-types: > pnpm exec tsc --noEmit
@repo/scanner-kit:check-types: 

@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > pnpm exec tsc --noEmit
@repo/ai:check-types: 

@repo/graphics:check-types: 
@repo/graphics:check-types: > @repo/graphics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:check-types: > pnpm exec tsc --noEmit
@repo/graphics:check-types: 

@repo/profile:check-types: cache miss, executing 4fb58bd43f1bded7

@repo/form-builder:check-types: cache miss, executing 2300b299c5d4045b

@repo/library:check-types: cache miss, executing 35eb52ba9b924d31

@repo/analytics:check-types: cache miss, executing 0aef85b12f3e139c

@repo/profile:check-types: 
@repo/profile:check-types: > @repo/profile@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:check-types: > pnpm exec tsc --noEmit
@repo/profile:check-types: 

@repo/form-builder:check-types: 
@repo/form-builder:check-types: > @repo/form-builder@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:check-types: > pnpm exec tsc --noEmit
@repo/form-builder:check-types: 

@repo/library:check-types: 
@repo/library:check-types: > @repo/library@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:check-types: > pnpm exec tsc --noEmit
@repo/library:check-types: 

@repo/analytics:check-types: 
@repo/analytics:check-types: > @repo/analytics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\analytics
@repo/analytics:check-types: > pnpm exec tsc --noEmit
@repo/analytics:check-types: 

apps-gurudevi-marketing-web:check-types: cache miss, executing 378effb373bb3944

apps-gurudevi-marketing-web:check-types: 
apps-gurudevi-marketing-web:check-types: > apps-gurudevi-marketing-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:check-types: > pnpm exec tsc --noEmit
apps-gurudevi-marketing-web:check-types: 

@repo/self:check-types: cache miss, executing 01db2fe02cf8962c

@repo/self:check-types: 
@repo/self:check-types: > @repo/self@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: > pnpm exec tsc --noEmit
@repo/self:check-types: 

@repo/community:check-types: cache miss, executing f2951b643988255b

@repo/community:check-types: 
@repo/community:check-types: > @repo/community@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\community
@repo/community:check-types: > pnpm exec tsc --noEmit
@repo/community:check-types: 

@repo/admin:check-types: cache miss, executing 5a97fd63c8d5a859

@repo/admin:check-types: 
@repo/admin:check-types: > @repo/admin@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\admin
@repo/admin:check-types: > pnpm exec tsc --noEmit
@repo/admin:check-types: 

@repo/classroom:check-types: cache miss, executing 3ee9ff75b3d94540

@repo/classroom:check-types: 
@repo/classroom:check-types: > @repo/classroom@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\classroom
@repo/classroom:check-types: > pnpm exec tsc --noEmit
@repo/classroom:check-types: 

gurudevi-mobile:check-types: cache miss, executing 0b71855a40de6c2f

gurudevi-mobile:check-types: 
gurudevi-mobile:check-types: > gurudevi-mobile@1.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile
gurudevi-mobile:check-types: > pnpm exec tsc --noEmit
gurudevi-mobile:check-types: 


 Tasks:    27 successful, 27 total
Cached:    7 cached, 27 total
  Time:    3m50.471s 



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 231.8s
Findings: 0
Log File: reports/check-types.txt
--------------------------------------------------------------------------------


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:34:43.738Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-circular

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-
kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts

x 68 dependency violations (0 errors, 68 warnings). 1936 modules, 6277 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 8.5s
Findings: 0

Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:34:52.957Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-orphans
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-
kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts

x 68 dependency violations (0 errors, 68 warnings). 1936 modules, 6277 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 8.4s
Findings: 61

Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:35:02.043Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-
kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts

x 68 dependency violations (0 errors, 68 warnings). 1936 modules, 6277 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 8.4s

Findings: 69

Log File: reports/architecture.txt

--------------------------------------------------------------------------------


✅ All hygiene checks passed!


> polymath-platform@1.0.0 identity:check C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:35:10.954Z

>>> Command: node scripts/check-identity-alignment.mjs
--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 0.53s. Found 0 potential alignment issues.


[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------
AUDIT SUMMARY

Duration: 1.0s
Findings: 0
Log File: reports/identity_check.txt

--------------------------------------------------------------------------------

 ERR_PNPM_DLX_NO_BIN  No binaries found in gitleaks

```
