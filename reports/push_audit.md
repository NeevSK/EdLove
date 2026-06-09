# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 6/8/2026, 11:38:29 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run lint; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm run i18n:check
> **Duration:** 73.2s
> **Status:** ✅ Passed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 40 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 78 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 6 |
| packages/analytics | 21 |
| packages/core | 19 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 3 |
| packages/scanner-kit | 3 |
| packages/self | 3 |
| packages/trube-art | 3 |
| packages/ui | 24 |

## Detailed Findings

### Category: General
- @repo/types-shim:lint:biome: Found 3 errors.
- @repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
- @repo/payments:lint:biome:     18    │ - ····const·{·data:·payment,·error:·pError·}·=·await·supabase␍
- @repo/payments:lint:biome:     25    │ - ····if·(pError)·throw·pError;␍
- @repo/payments:lint:biome:     52    │ - ····const·{·error:·updateError·}·=·await·supabase␍
- @repo/payments:lint:biome:     61    │ - ····if·(updateError)·throw·updateError;␍
- @repo/payments:lint:biome:        18 │ + ····const·{·data:·payment,·error:·pError·}·=·await·supabase
- @repo/payments:lint:biome:        25 │ + ····if·(pError)·throw·pError;
- @repo/payments:lint:biome:        52 │ + ····const·{·error:·updateError·}·=·await·supabase
- @repo/payments:lint:biome:        61 │ + ····if·(updateError)·throw·updateError;
- @repo/analytics:lint:biome:      9    │ - ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');␍
- @repo/analytics:lint:biome:         9 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');
- @repo/payments:lint:biome: Found 9 errors.
- @repo/payments:lint:biome:   × Some errors were emitted while running checks.
- @repo/analytics:lint:biome:     16    │ - ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');␍
- @repo/analytics:lint:biome:        16 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');
- @repo/analytics:lint:biome:      20     │ - ········?·colors.error␍
- @repo/analytics:lint:biome:      21     │ - ········:·colors.warning;␍
- @repo/analytics:lint:biome:     106     │ - ····················backgroundColor:·isOnTrack·?·colors.success·:·colors.warning,␍
- @repo/analytics:lint:biome:      96     │ - ························?·themeColors.error␍
- @repo/analytics:lint:biome:      97     │ - ························:·themeColors.warning,␍
- @repo/analytics:lint:biome: Found 83 errors.
- @repo/analytics:lint:biome:   × Some errors were emitted while running checks.
- apps-neevsk-web:lint:biome: Found 19 warnings.
- apps-intuitui-web:lint:biome: Found 3 warnings.
- ERROR  @repo/types-shim#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\types-shim) C:\Users\Naween\AppData\Local\mise\installs\pnpm\11.3.0\pnpm.exe run lint:biome exited (1)
- ERROR  run failed: command  exited (1)
- ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Local\mise\installs\pnpm\11.3.0\pnpm.exe run check-types exited (2)
- ERROR  run failed: command  exited (2)
- warn no-orp
- x 73 dependency violations (0 errors, 73 warnings). 2150 modules, 6664 dependencies cruised.
- warn no-orp
- x 73 dependency violations (0 errors, 73 warnings). 2150 modules, 6664 dependencies cruised.
- warn no-orp
- x 73 dependency violations (0 errors, 73 warnings). 2150 modules, 6664 dependencies cruised.
- - Attribute Drift Errors      : 0
- - Attribute Security Warnings : 0
- [33m⚠️  WARNING: Failed to execute database parity audit due to connection or pg library error (skipped):[0m Cannot find package 'pg' imported from C:\Users\Naween\projects\polymath-platform\scripts\check-schema-drift.mjs
- - API Gateway Drift Errors     : 0
- - API Gateway Drift Warnings   : 0

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
- warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/navigation/deprecatedNavigation.ts
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
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
- warn no-orphans: apps/gurudevi-mobile/app/(tabs)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/navigation/deprecatedNavigation.ts
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
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
- warn no-orphans: apps/gurudevi-mobile/app/(tabs)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/navigation/deprecatedNavigation.ts
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
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
- warn no-orphans: apps/gurudevi-mobile/app/(tabs)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
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
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts

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

### Category: packages/core
- @repo/core:check-types: error TS6059: File 'C:/Users/Naween/projects/polymath-platform/packages/core/vitest.config.ts' is not under 'rootDir' 'C:/Users/Naween/projects/polymath-platform/packages/core/src'. 'rootDir' is expected to contain all source files.
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
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
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx

### Category: packages/self
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts

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
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx

## Raw Output

```text
$ pnpm turbo run lint --concurrency=3

• turbo 2.9.14


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile

   • Running lint in 32 packages
   • Remote caching disabled


@repo/payments:lint:biome: cache miss, executing 8b4969ed8fac426b

@repo/types-shim:lint:biome: cache miss, executing 6f6b9fa321191d6c

@repo/analytics:lint:biome: cache miss, executing ec9701c2b743cdaf

@repo/analytics:lint:biome: $ biome check .

@repo/types-shim:lint:biome: $ biome check .

@repo/payments:lint:biome: $ biome check .

@repo/types-shim:lint:biome: index.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome:   × Formatter would have printed the following content:
@repo/types-shim:lint:biome:   

@repo/payments:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     1   │ - import·{·config·}·from·'@repo/eslint-config/base';␍
@repo/payments:lint:biome:     2   │ - ␍
@repo/payments:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/payments:lint:biome:     4   │ - export·default·[...config];␍
@repo/payments:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/base';
@repo/payments:lint:biome:       2 │ + 
@repo/payments:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/payments:lint:biome:       4 │ + export·default·[...config];
@repo/payments:lint:biome:     5 5 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   

@repo/payments:lint:biome:      1    │ - {␍

@repo/payments:lint:biome:      2    │ - ··"name":·"@repo/payments",␍

@repo/types-shim:lint:biome:      1    │ - //·This·is·an·empty·type·definition·file·to·satisfy·legacy·peer·dependencies.␍

@repo/types-shim:lint:biome:      2    │ - //·React·Native·0.83+·provides·its·own·types.␍
@repo/types-shim:lint:biome:      3    │ - //␍
@repo/types-shim:lint:biome:      4    │ - //·Monorepo·convention:␍
@repo/types-shim:lint:biome:      5    │ - //·We·allow·`className`·on·core·React·Native·primitives·to·support·web·+·tailwind-style␍

@repo/types-shim:lint:biome:      6    │ - //·styling·(e.g.·via·`react-native-web`,·`react-native-css-interop`,·etc.).·The·runtime␍
@repo/types-shim:lint:biome:      7    │ - //·integration·varies·by·app,·but·the·prop·is·intentionally·tolerated·at·the·type·level.␍

@repo/types-shim:lint:biome:      8    │ - ␍
@repo/types-shim:lint:biome:      9    │ - declare·module·'react-native'·{␍
@repo/types-shim:lint:biome:     10    │ - ··interface·ViewProps·{␍
@repo/types-shim:lint:biome:     11    │ - ····className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     12    │ - ··}␍
@repo/types-shim:lint:biome:     13    │ - ␍
@repo/types-shim:lint:biome:     14    │ - ··interface·TextProps·{␍
@repo/payments:lint:biome:      3    │ - ··"version":·"0.0.2",␍
@repo/types-shim:lint:biome:     15    │ - ····className?:·string·|·undefined;␍
@repo/payments:lint:biome:      4    │ - ··"main":·"src/index.ts",␍
@repo/types-shim:lint:biome:     16    │ - ··}␍
@repo/payments:lint:biome:      5    │ - ··"types":·"src/index.ts",␍
@repo/types-shim:lint:biome:     17    │ - ␍
@repo/payments:lint:biome:      6    │ - ··"exports":·{␍
@repo/types-shim:lint:biome:     18    │ - ··interface·TextInputProps·{␍
@repo/payments:lint:biome:      7    │ - ····".":·{␍
@repo/types-shim:lint:biome:     19    │ - ····className?:·string·|·undefined;␍
@repo/payments:lint:biome:      8    │ - ······"types":·"./src/index.ts",␍
@repo/types-shim:lint:biome:     20    │ - ····accessibilityDescribedBy?:·string·|·undefined;␍
@repo/payments:lint:biome:      9    │ - ······"import":·"./src/index.ts",␍
@repo/types-shim:lint:biome:     21    │ - ··}␍
@repo/payments:lint:biome:     10    │ - ······"default":·"./src/index.ts"␍
@repo/types-shim:lint:biome:     22    │ - ␍
@repo/payments:lint:biome:     11    │ - ····},␍
@repo/types-shim:lint:biome:     23    │ - ··interface·PressableProps·{␍
@repo/payments:lint:biome:     12    │ - ····"./*":·{␍
@repo/types-shim:lint:biome:     24    │ - ····className?:·string·|·undefined;␍
@repo/payments:lint:biome:     13    │ - ······"types":·"./src/*.ts",␍
@repo/types-shim:lint:biome:     25    │ - ··}␍
@repo/payments:lint:biome:     14    │ - ······"import":·"./src/*.js",␍

@repo/types-shim:lint:biome:     26    │ - ␍
@repo/types-shim:lint:biome:     27    │ - ··interface·ImageProps·{␍
@repo/types-shim:lint:biome:     28    │ - ····className?:·string·|·undefined;␍
@repo/payments:lint:biome:     15    │ - ······"default":·"./src/*.js"␍
@repo/types-shim:lint:biome:     29    │ - ··}␍
@repo/payments:lint:biome:     16    │ - ····},␍
@repo/types-shim:lint:biome:     30    │ - ␍
@repo/payments:lint:biome:     17    │ - ····"./package.json":·"./package.json"␍
@repo/types-shim:lint:biome:     31    │ - ··interface·ImageBackgroundProps·{␍
@repo/payments:lint:biome:     18    │ - ··},␍
@repo/types-shim:lint:biome:     32    │ - ····className?:·string·|·undefined;␍
@repo/payments:lint:biome:     19    │ - ··"scripts":·{␍
@repo/types-shim:lint:biome:     33    │ - ··}␍
@repo/payments:lint:biome:     20    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@repo/types-shim:lint:biome:     34    │ - ␍
@repo/payments:lint:biome:     21    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@repo/types-shim:lint:biome:     35    │ - ··interface·ScrollViewProps·{␍
@repo/payments:lint:biome:     22    │ - ····"lint:biome":·"biome·check·.",␍
@repo/types-shim:lint:biome:     36    │ - ····className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     37    │ - ····contentContainerClassName?:·string·|·undefined;␍

@repo/types-shim:lint:biome:     38    │ - ··}␍
@repo/types-shim:lint:biome:     39    │ - ␍
@repo/types-shim:lint:biome:     40    │ - ··interface·FlatListProps<ItemT>·{␍
@repo/types-shim:lint:biome:     41    │ - ····className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     42    │ - ····contentContainerClassName?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     43    │ - ··}␍
@repo/types-shim:lint:biome:     44    │ - }␍
@repo/types-shim:lint:biome:     45    │ - ␍

@repo/types-shim:lint:biome:     46    │ - declare·module·'react-native-gifted-charts'·{␍

@repo/types-shim:lint:biome:     47    │ - ··import·*·as·React·from·'react';␍
@repo/types-shim:lint:biome:     48    │ - ␍
@repo/types-shim:lint:biome:     49    │ - ··export·const·BarChart:·React.ComponentType<any>;␍
@repo/types-shim:lint:biome:     50    │ - ··export·const·PieChart:·React.ComponentType<any>;␍

@repo/types-shim:lint:biome:     51    │ - }␍
@repo/types-shim:lint:biome:     52    │ - ␍
@repo/types-shim:lint:biome:     53    │ - declare·module·'react-native-gesture-handler'·{␍
@repo/types-shim:lint:biome:     54    │ - ··export·const·Gesture:·any;␍
@repo/types-shim:lint:biome:     55    │ - ··export·const·GestureDetector:·any;␍
@repo/types-shim:lint:biome:     56    │ - ··export·const·GestureHandlerRootView:·any;␍
@repo/types-shim:lint:biome:     57    │ - ··export·const·PanGestureHandler:·any;␍
@repo/types-shim:lint:biome:     58    │ - ··export·const·PinchGestureHandler:·any;␍
@repo/types-shim:lint:biome:     59    │ - ··export·const·State:·any;␍
@repo/types-shim:lint:biome:     60    │ - }␍
@repo/types-shim:lint:biome:     61    │ - ␍
@repo/types-shim:lint:biome:     62    │ - declare·module·'expo-task-manager'·{␍
@repo/types-shim:lint:biome:     63    │ - ··export·function·defineTask(taskName:·string,·task:·(...args:·any[])·=>·any):·void;␍
@repo/types-shim:lint:biome:     64    │ - ··export·function·isTaskRegisteredAsync(taskName:·string):·Promise<boolean>;␍
@repo/types-shim:lint:biome:     65    │ - }␍
@repo/types-shim:lint:biome:     66    │ - ␍

@repo/payments:lint:biome:     23    │ - ····"lint:eslint":·"eslint·.",␍
@repo/payments:lint:biome:     24    │ - ····"format":·"biome·format·--write·.",␍

@repo/payments:lint:biome:     25    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@repo/payments:lint:biome:     26    │ - ····"test":·"vitest·run",␍
@repo/payments:lint:biome:     27    │ - ····"test:watch":·"vitest",␍
@repo/payments:lint:biome:     28    │ - ····"test:ui":·"vitest·--ui",␍

@repo/payments:lint:biome:     29    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
@repo/payments:lint:biome:     30    │ - ··},␍
@repo/payments:lint:biome:     31    │ - ··"dependencies":·{␍
@repo/payments:lint:biome:     32    │ - ····"@repo/accounting":·"workspace:*",␍
@repo/payments:lint:biome:     33    │ - ····"@repo/core":·"workspace:*",␍
@repo/payments:lint:biome:     34    │ - ····"@supabase/supabase-js":·"2.102.1"␍
@repo/types-shim:lint:biome:     67    │ - declare·module·'expo-background-task'·{␍
@repo/types-shim:lint:biome:     68    │ - ··export·const·BackgroundTaskResult:·{␍
@repo/types-shim:lint:biome:     69    │ - ····NewData:·number;␍
@repo/types-shim:lint:biome:     70    │ - ····NoData:·number;␍
@repo/types-shim:lint:biome:     71    │ - ····Failed:·number;␍
@repo/types-shim:lint:biome:     72    │ - ··};␍
@repo/types-shim:lint:biome:     73    │ - ··export·const·BackgroundTaskStatus:·{␍
@repo/types-shim:lint:biome:     74    │ - ····Available:·number;␍
@repo/types-shim:lint:biome:     75    │ - ····Denied:·number;␍

@repo/types-shim:lint:biome:     76    │ - ····Restricted:·number;␍
@repo/types-shim:lint:biome:     77    │ - ··};␍

@repo/payments:lint:biome:     35    │ - ··},␍

@repo/types-shim:lint:biome:     78    │ - ··export·type·BackgroundTaskOptions·=·{␍

@repo/payments:lint:biome:     36    │ - ··"devDependencies":·{␍

@repo/payments:lint:biome:     37    │ - ····"typescript":·"^6.0.3",␍
@repo/types-shim:lint:biome:     79    │ - ····minimumInterval?:·number;␍

@repo/types-shim:lint:biome:     80    │ - ····stopOnTerminate?:·boolean;␍
@repo/payments:lint:biome:     38    │ - ····"eslint":·"^9.38.0",␍

@repo/payments:lint:biome:     39    │ - ····"@types/node":·"^25.5.0",␍

@repo/types-shim:lint:biome:     81    │ - ····startOnBoot?:·boolean;␍
@repo/types-shim:lint:biome:     82    │ - ··};␍
@repo/types-shim:lint:biome:     83    │ - ␍
@repo/payments:lint:biome:     40    │ - ····"@repo/eslint-config":·"workspace:^",␍
@repo/types-shim:lint:biome:     84    │ - ··export·function·getStatusAsync():·Promise<number>;␍
@repo/types-shim:lint:biome:     85    │ - ··export·function·registerTaskAsync(␍

@repo/payments:lint:biome:     41    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/types-shim:lint:biome:     86    │ - ····taskName:·string,␍
@repo/payments:lint:biome:     42    │ - ····"vitest":·"^2.1.9",␍
@repo/types-shim:lint:biome:     87    │ - ····options?:·BackgroundTaskOptions,␍
@repo/payments:lint:biome:     43    │ - ····"vite-tsconfig-paths":·"^6.1.1"␍
@repo/types-shim:lint:biome:     88    │ - ··):·Promise<void>;␍

@repo/payments:lint:biome:     44    │ - ··}␍
@repo/payments:lint:biome:     45    │ - }␍
@repo/types-shim:lint:biome:     89    │ - ··export·function·unregisterTaskAsync(taskName:·string):·Promise<void>;␍
@repo/payments:lint:biome:         1 │ + {
@repo/types-shim:lint:biome:     90    │ - ··export·function·triggerTaskWorkerForTestingAsync(taskName:·string):·Promise<void>;␍
@repo/payments:lint:biome:         2 │ + ··"name":·"@repo/payments",
@repo/types-shim:lint:biome:     91    │ - }␍
@repo/payments:lint:biome:         3 │ + ··"version":·"0.0.2",
@repo/types-shim:lint:biome:     92    │ - ␍
@repo/payments:lint:biome:         4 │ + ··"main":·"src/index.ts",
@repo/types-shim:lint:biome:     93    │ - export·{};␍
@repo/payments:lint:biome:         5 │ + ··"types":·"src/index.ts",
@repo/payments:lint:biome:         6 │ + ··"exports":·{
@repo/types-shim:lint:biome:         1 │ + //·This·is·an·empty·type·definition·file·to·satisfy·legacy·peer·dependencies.
@repo/payments:lint:biome:         7 │ + ····".":·{
@repo/types-shim:lint:biome:         2 │ + //·React·Native·0.83+·provides·its·own·types.
@repo/payments:lint:biome:         8 │ + ······"types":·"./src/index.ts",
@repo/types-shim:lint:biome:         3 │ + //
@repo/payments:lint:biome:         9 │ + ······"import":·"./src/index.ts",
@repo/types-shim:lint:biome:         4 │ + //·Monorepo·convention:
@repo/payments:lint:biome:        10 │ + ······"default":·"./src/index.ts"
@repo/types-shim:lint:biome:         5 │ + //·We·allow·`className`·on·core·React·Native·primitives·to·support·web·+·tailwind-style
@repo/payments:lint:biome:        11 │ + ····},
@repo/types-shim:lint:biome:         6 │ + //·styling·(e.g.·via·`react-native-web`,·`react-native-css-interop`,·etc.).·The·runtime
@repo/payments:lint:biome:        12 │ + ····"./*":·{
@repo/types-shim:lint:biome:         7 │ + //·integration·varies·by·app,·but·the·prop·is·intentionally·tolerated·at·the·type·level.
@repo/payments:lint:biome:        13 │ + ······"types":·"./src/*.ts",
@repo/types-shim:lint:biome:         8 │ + 
@repo/payments:lint:biome:        14 │ + ······"import":·"./src/*.js",
@repo/types-shim:lint:biome:         9 │ + declare·module·'react-native'·{
@repo/payments:lint:biome:        15 │ + ······"default":·"./src/*.js"
@repo/types-shim:lint:biome:        10 │ + ··interface·ViewProps·{
@repo/payments:lint:biome:        16 │ + ····},
@repo/types-shim:lint:biome:        11 │ + ····className?:·string·|·undefined;
@repo/payments:lint:biome:        17 │ + ····"./package.json":·"./package.json"
@repo/types-shim:lint:biome:        12 │ + ··}
@repo/payments:lint:biome:        18 │ + ··},
@repo/types-shim:lint:biome:        13 │ + 
@repo/payments:lint:biome:        19 │ + ··"scripts":·{
@repo/types-shim:lint:biome:        14 │ + ··interface·TextProps·{
@repo/payments:lint:biome:        20 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/types-shim:lint:biome:        15 │ + ····className?:·string·|·undefined;
@repo/payments:lint:biome:        21 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/types-shim:lint:biome:        16 │ + ··}
@repo/payments:lint:biome:        22 │ + ····"lint:biome":·"biome·check·.",
@repo/types-shim:lint:biome:        17 │ + 
@repo/payments:lint:biome:        23 │ + ····"lint:eslint":·"eslint·.",
@repo/types-shim:lint:biome:        18 │ + ··interface·TextInputProps·{
@repo/payments:lint:biome:        24 │ + ····"format":·"biome·format·--write·.",
@repo/types-shim:lint:biome:        19 │ + ····className?:·string·|·undefined;
@repo/payments:lint:biome:        25 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/types-shim:lint:biome:        20 │ + ····accessibilityDescribedBy?:·string·|·undefined;
@repo/payments:lint:biome:        26 │ + ····"test":·"vitest·run",
@repo/types-shim:lint:biome:        21 │ + ··}
@repo/payments:lint:biome:        27 │ + ····"test:watch":·"vitest",
@repo/types-shim:lint:biome:        22 │ + 
@repo/payments:lint:biome:        28 │ + ····"test:ui":·"vitest·--ui",
@repo/types-shim:lint:biome:        23 │ + ··interface·PressableProps·{
@repo/payments:lint:biome:        29 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@repo/types-shim:lint:biome:        24 │ + ····className?:·string·|·undefined;

@repo/payments:lint:biome:        30 │ + ··},
@repo/types-shim:lint:biome:        25 │ + ··}
@repo/payments:lint:biome:        31 │ + ··"dependencies":·{
@repo/types-shim:lint:biome:        26 │ + 
@repo/payments:lint:biome:        32 │ + ····"@repo/accounting":·"workspace:*",
@repo/types-shim:lint:biome:        27 │ + ··interface·ImageProps·{
@repo/payments:lint:biome:        33 │ + ····"@repo/core":·"workspace:*",
@repo/types-shim:lint:biome:        28 │ + ····className?:·string·|·undefined;
@repo/payments:lint:biome:        34 │ + ····"@supabase/supabase-js":·"2.102.1"
@repo/types-shim:lint:biome:        29 │ + ··}
@repo/payments:lint:biome:        35 │ + ··},
@repo/types-shim:lint:biome:        30 │ + 
@repo/payments:lint:biome:        36 │ + ··"devDependencies":·{
@repo/types-shim:lint:biome:        31 │ + ··interface·ImageBackgroundProps·{
@repo/payments:lint:biome:        37 │ + ····"typescript":·"^6.0.3",
@repo/types-shim:lint:biome:        32 │ + ····className?:·string·|·undefined;
@repo/payments:lint:biome:        38 │ + ····"eslint":·"^9.38.0",
@repo/types-shim:lint:biome:        33 │ + ··}
@repo/payments:lint:biome:        39 │ + ····"@types/node":·"^25.5.0",
@repo/types-shim:lint:biome:        34 │ + 
@repo/payments:lint:biome:        40 │ + ····"@repo/eslint-config":·"workspace:^",
@repo/types-shim:lint:biome:        35 │ + ··interface·ScrollViewProps·{
@repo/payments:lint:biome:        41 │ + ····"@repo/typescript-config":·"workspace:*",
@repo/types-shim:lint:biome:        36 │ + ····className?:·string·|·undefined;
@repo/payments:lint:biome:        42 │ + ····"vitest":·"^2.1.9",
@repo/types-shim:lint:biome:        37 │ + ····contentContainerClassName?:·string·|·undefined;
@repo/payments:lint:biome:        43 │ + ····"vite-tsconfig-paths":·"^6.1.1"
@repo/types-shim:lint:biome:        38 │ + ··}
@repo/payments:lint:biome:        44 │ + ··}
@repo/types-shim:lint:biome:        39 │ + 
@repo/payments:lint:biome:        45 │ + }
@repo/types-shim:lint:biome:        40 │ + ··interface·FlatListProps<ItemT>·{
@repo/payments:lint:biome:     46 46 │   
@repo/types-shim:lint:biome:        41 │ + ····className?:·string·|·undefined;
@repo/payments:lint:biome:   
@repo/types-shim:lint:biome:        42 │ + ····contentContainerClassName?:·string·|·undefined;
@repo/payments:lint:biome: 
@repo/types-shim:lint:biome:        43 │ + ··}
@repo/payments:lint:biome: src\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome:        44 │ + }
@repo/payments:lint:biome: 
@repo/types-shim:lint:biome:        45 │ + 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/types-shim:lint:biome:        46 │ + declare·module·'react-native-gifted-charts'·{
@repo/payments:lint:biome:   
@repo/types-shim:lint:biome:        47 │ + ··import·*·as·React·from·'react';
@repo/payments:lint:biome:      1    │ - import·{·PayHereProvider·}·from·'./plugins/payhere';␍
@repo/types-shim:lint:biome:        48 │ + 
@repo/payments:lint:biome:      2    │ - import·{·StripeProvider·}·from·'./plugins/stripe';␍
@repo/types-shim:lint:biome:        49 │ + ··export·const·BarChart:·React.ComponentType<any>;
@repo/payments:lint:biome:      3    │ - import·{·payments·}·from·'./registry';␍
@repo/types-shim:lint:biome:        50 │ + ··export·const·PieChart:·React.ComponentType<any>;
@repo/payments:lint:biome:      4    │ - ␍
@repo/types-shim:lint:biome:        51 │ + }
@repo/types-shim:lint:biome:        52 │ + 
@repo/types-shim:lint:biome:        53 │ + declare·module·'react-native-gesture-handler'·{
@repo/types-shim:lint:biome:        54 │ + ··export·const·Gesture:·any;
@repo/types-shim:lint:biome:        55 │ + ··export·const·GestureDetector:·any;
@repo/types-shim:lint:biome:        56 │ + ··export·const·GestureHandlerRootView:·any;
@repo/types-shim:lint:biome:        57 │ + ··export·const·PanGestureHandler:·any;
@repo/types-shim:lint:biome:   37 more lines truncated
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   × Formatter would have printed the following content:
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:      1    │ - {␍
@repo/types-shim:lint:biome:      2    │ - ··"name":·"@repo/types-shim",␍
@repo/payments:lint:biome:      5    │ - export·*·from·'./registry';␍
@repo/types-shim:lint:biome:      3    │ - ··"version":·"0.0.2",␍
@repo/payments:lint:biome:      6    │ - export·*·from·'./service';␍
@repo/types-shim:lint:biome:      4    │ - ··"description":·"A·dummy·shim·to·satisfy·legacy·@types/react-native·peer·dependencies",␍
@repo/types-shim:lint:biome:      5    │ - ··"private":·true,␍
@repo/types-shim:lint:biome:      6    │ - ··"types":·"index.d.ts",␍
@repo/types-shim:lint:biome:      7    │ - ··"scripts":·{␍
@repo/types-shim:lint:biome:      8    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@repo/types-shim:lint:biome:      9    │ - ····"lint:biome":·"biome·check·.",␍
@repo/types-shim:lint:biome:     10    │ - ····"lint:eslint":·"eslint·.",␍
@repo/types-shim:lint:biome:     11    │ - ····"format":·"biome·format·--write·.",␍
@repo/types-shim:lint:biome:     12    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@repo/types-shim:lint:biome:     13    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@repo/types-shim:lint:biome:     14    │ - ····"test":·"vitest·run",␍
@repo/types-shim:lint:biome:     15    │ - ····"test:watch":·"vitest",␍
@repo/types-shim:lint:biome:     16    │ - ····"test:ui":·"vitest·--ui",␍
@repo/types-shim:lint:biome:     17    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
@repo/types-shim:lint:biome:     18    │ - ··},␍
@repo/types-shim:lint:biome:     19    │ - ··"devDependencies":·{␍
@repo/types-shim:lint:biome:     20    │ - ····"@repo/eslint-config":·"workspace:^",␍
@repo/types-shim:lint:biome:     21    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/types-shim:lint:biome:     22    │ - ····"vitest":·"^2.1.9",␍
@repo/types-shim:lint:biome:     23    │ - ····"vite-tsconfig-paths":·"^6.1.1",␍
@repo/types-shim:lint:biome:     24    │ - ····"typescript":·"^6.0.3",␍
@repo/types-shim:lint:biome:     25    │ - ····"eslint":·"^9.38.0"␍
@repo/types-shim:lint:biome:     26    │ - ··}␍
@repo/types-shim:lint:biome:     27    │ - }␍
@repo/types-shim:lint:biome:         1 │ + {
@repo/types-shim:lint:biome:         2 │ + ··"name":·"@repo/types-shim",
@repo/types-shim:lint:biome:         3 │ + ··"version":·"0.0.2",
@repo/types-shim:lint:biome:         4 │ + ··"description":·"A·dummy·shim·to·satisfy·legacy·@types/react-native·peer·dependencies",
@repo/types-shim:lint:biome:         5 │ + ··"private":·true,
@repo/types-shim:lint:biome:         6 │ + ··"types":·"index.d.ts",
@repo/types-shim:lint:biome:         7 │ + ··"scripts":·{
@repo/types-shim:lint:biome:         8 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/types-shim:lint:biome:         9 │ + ····"lint:biome":·"biome·check·.",
@repo/types-shim:lint:biome:        10 │ + ····"lint:eslint":·"eslint·.",
@repo/types-shim:lint:biome:        11 │ + ····"format":·"biome·format·--write·.",
@repo/payments:lint:biome:      7    │ - export·*·from·'./types';␍
@repo/payments:lint:biome:      8    │ - ␍
@repo/payments:lint:biome:      9    │ - //·Auto-register·default·providers␍
@repo/payments:lint:biome:     10    │ - payments.register(new·PayHereProvider());␍
@repo/payments:lint:biome:     11    │ - payments.register(new·StripeProvider());␍
@repo/payments:lint:biome:         1 │ + import·{·PayHereProvider·}·from·'./plugins/payhere';
@repo/payments:lint:biome:         2 │ + import·{·StripeProvider·}·from·'./plugins/stripe';
@repo/payments:lint:biome:         3 │ + import·{·payments·}·from·'./registry';
@repo/payments:lint:biome:         4 │ + 
@repo/payments:lint:biome:         5 │ + export·*·from·'./registry';
@repo/payments:lint:biome:         6 │ + export·*·from·'./service';
@repo/payments:lint:biome:         7 │ + export·*·from·'./types';
@repo/payments:lint:biome:         8 │ + 
@repo/payments:lint:biome:         9 │ + //·Auto-register·default·providers
@repo/payments:lint:biome:        10 │ + payments.register(new·PayHereProvider());
@repo/payments:lint:biome:        11 │ + payments.register(new·StripeProvider());
@repo/payments:lint:biome:     12 12 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\plugins\payhere.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   

@repo/payments:lint:biome:      1    │ - import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·'../types';␍

@repo/payments:lint:biome:      2    │ - ␍

@repo/types-shim:lint:biome:        12 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",

@repo/types-shim:lint:biome:        13 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",

@repo/types-shim:lint:biome:        14 │ + ····"test":·"vitest·run",

@repo/types-shim:lint:biome:        15 │ + ····"test:watch":·"vitest",

@repo/types-shim:lint:biome:        16 │ + ····"test:ui":·"vitest·--ui",

@repo/types-shim:lint:biome:        17 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"

@repo/types-shim:lint:biome:        18 │ + ··},

@repo/types-shim:lint:biome:        19 │ + ··"devDependencies":·{

@repo/payments:lint:biome:      3    │ - export·class·PayHereProvider·implements·PaymentProvider·{␍

@repo/payments:lint:biome:      4    │ - ··id·=·'payhere';␍

@repo/payments:lint:biome:      5    │ - ··name·=·'PayHere·(Sri·Lanka)';␍

@repo/payments:lint:biome:      6    │ - ␍

@repo/payments:lint:biome:      7    │ - ··async·initializePayment(␍

@repo/payments:lint:biome:      8    │ - ····amount:·number,␍

@repo/types-shim:lint:biome:        20 │ + ····"@repo/eslint-config":·"workspace:^",

@repo/types-shim:lint:biome:        21 │ + ····"@repo/typescript-config":·"workspace:*",

@repo/types-shim:lint:biome:        22 │ + ····"vitest":·"^2.1.9",

@repo/payments:lint:biome:      9    │ - ····currency:·string,␍

@repo/payments:lint:biome:     10    │ - ····metadata?:·any,␍

@repo/payments:lint:biome:     11    │ - ··):·Promise<PaymentIntent>·{␍

@repo/payments:lint:biome:     12    │ - ····//·In·a·real·implementation,·this·would·call·PayHere·API·to·get·a·checkout·URL·or·token.␍

@repo/payments:lint:biome:     13    │ - ····//·For·now,·we·return·a·mock·intent.␍

@repo/payments:lint:biome:     14    │ - ····return·{␍

@repo/payments:lint:biome:     15    │ - ······id:·`ph_${Math.random().toString(36).substr(2,·9)}`,␍

@repo/payments:lint:biome:     16    │ - ······amount,␍
@repo/payments:lint:biome:     17    │ - ······currency,␍

@repo/types-shim:lint:biome:        23 │ + ····"vite-tsconfig-paths":·"^6.1.1",

@repo/types-shim:lint:biome:        24 │ + ····"typescript":·"^6.0.3",

@repo/types-shim:lint:biome:        25 │ + ····"eslint":·"^9.38.0"

@repo/types-shim:lint:biome:        26 │ + ··}

@repo/types-shim:lint:biome:        27 │ + }

@repo/types-shim:lint:biome:     28 28 │   
@repo/types-shim:lint:biome:   

@repo/types-shim:lint:biome: 

@repo/payments:lint:biome:     18    │ - ······status:·'pending',␍

@repo/payments:lint:biome:     19    │ - ······provider:·this.id,␍

@repo/types-shim:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 

@repo/payments:lint:biome:     20    │ - ······metadata,␍

@repo/payments:lint:biome:     21    │ - ····};␍

@repo/types-shim:lint:biome:   × Formatter would have printed the following content:

@repo/types-shim:lint:biome:   

@repo/payments:lint:biome:     22    │ - ··}␍

@repo/payments:lint:biome:     23    │ - ␍

@repo/types-shim:lint:biome:     1   │ - {␍

@repo/payments:lint:biome:     24    │ - ··async·verifyPayment(_paymentIntentId:·string):·Promise<PaymentStatus>·{␍

@repo/types-shim:lint:biome:     2   │ - ··"compilerOptions":·{␍

@repo/types-shim:lint:biome:     3   │ - ····"noEmit":·true,␍

@repo/payments:lint:biome:     25    │ - ····//·Real·check·against·PayHere·API·or·Webhook·status.␍

@repo/payments:lint:biome:     26    │ - ····return·'succeeded';␍

@repo/types-shim:lint:biome:     4   │ - ····"skipLibCheck":·true␍

@repo/types-shim:lint:biome:     5   │ - ··},␍

@repo/types-shim:lint:biome:     6   │ - ··"include":·["index.d.ts"]␍
@repo/types-shim:lint:biome:     7   │ - }␍
@repo/types-shim:lint:biome:       1 │ + {

@repo/types-shim:lint:biome:       2 │ + ··"compilerOptions":·{
@repo/types-shim:lint:biome:       3 │ + ····"noEmit":·true,
@repo/types-shim:lint:biome:       4 │ + ····"skipLibCheck":·true
@repo/types-shim:lint:biome:       5 │ + ··},
@repo/types-shim:lint:biome:       6 │ + ··"include":·["index.d.ts"]

@repo/analytics:lint:biome: index.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - declare·module·'@repo/analytics'·{␍
@repo/analytics:lint:biome:      2    │ - ··export·*·from·'./index';␍
@repo/analytics:lint:biome:      3    │ - }␍

@repo/analytics:lint:biome:      4    │ - ␍
@repo/analytics:lint:biome:      5    │ - declare·module·'@repo/analytics/hooks'·{␍
@repo/analytics:lint:biome:      6    │ - ··export·*·from·'./src/hooks';␍
@repo/analytics:lint:biome:      7    │ - }␍

@repo/types-shim:lint:biome:       7 │ + }

@repo/payments:lint:biome:     27    │ - ··}␍

@repo/analytics:lint:biome:      8    │ - ␍

@repo/types-shim:lint:biome:     8 8 │   

@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

@repo/analytics:lint:biome:      9    │ - declare·module·'@repo/analytics/ui'·{␍

@repo/types-shim:lint:biome: Checked 5 files in 100ms. No fixes applied.
@repo/types-shim:lint:biome: Found 3 errors.
@repo/analytics:lint:biome:     10    │ - ··export·*·from·'./src/ui';␍
@repo/analytics:lint:biome:     11    │ - }␍

@repo/analytics:lint:biome:         1 │ + declare·module·'@repo/analytics'·{

@repo/analytics:lint:biome:         2 │ + ··export·*·from·'./index';

@repo/analytics:lint:biome:         3 │ + }

@repo/analytics:lint:biome:         4 │ + 

@repo/payments:lint:biome:     28    │ - ␍

@repo/payments:lint:biome:     29    │ - ··getFeeEstimate(amount:·number):·number·{␍

@repo/payments:lint:biome:     30    │ - ····//·PayHere·typically·has·~2.6%·-·3.3%·+·fixed·fee·for·cards.␍

@repo/payments:lint:biome:     31    │ - ····//·Helapay·is·usually·lower·or·fixed.␍

@repo/analytics:lint:biome:         5 │ + declare·module·'@repo/analytics/hooks'·{

@repo/analytics:lint:biome:         6 │ + ··export·*·from·'./src/hooks';

@repo/analytics:lint:biome:         7 │ + }
@repo/payments:lint:biome:     32    │ - ····return·amount·*·0.03;␍

@repo/analytics:lint:biome:         8 │ + 

@repo/payments:lint:biome:     33    │ - ··}␍

@repo/analytics:lint:biome:         9 │ + declare·module·'@repo/analytics/ui'·{

@repo/analytics:lint:biome:        10 │ + ··export·*·from·'./src/ui';

@repo/analytics:lint:biome:        11 │ + }

@repo/analytics:lint:biome:     12 12 │   

@repo/analytics:lint:biome:   
@repo/types-shim:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 
@repo/types-shim:lint:biome: 
@repo/analytics:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
@repo/payments:lint:biome:     34    │ - }␍

@repo/payments:lint:biome:         1 │ + import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·'../types';
@repo/payments:lint:biome:         2 │ + 
@repo/payments:lint:biome:         3 │ + export·class·PayHereProvider·implements·PaymentProvider·{
@repo/payments:lint:biome:         4 │ + ··id·=·'payhere';
@repo/types-shim:lint:biome:   

@repo/types-shim:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - {␍

@repo/analytics:lint:biome:      2    │ - ··"name":·"@repo/analytics",␍

@repo/payments:lint:biome:         5 │ + ··name·=·'PayHere·(Sri·Lanka)';

@repo/payments:lint:biome:         6 │ + 

@repo/payments:lint:biome:         7 │ + ··async·initializePayment(
@repo/analytics:lint:biome:      3    │ - ··"version":·"1.0.0",␍

@repo/analytics:lint:biome:      4    │ - ··"type":·"module",␍

@repo/payments:lint:biome:         8 │ + ····amount:·number,

@repo/analytics:lint:biome:      5    │ - ··"main":·"src/index.ts",␍

@repo/analytics:lint:biome:      6    │ - ··"types":·"src/index.ts",␍

@repo/analytics:lint:biome:      7    │ - ··"exports":·{␍

@repo/analytics:lint:biome:      8    │ - ····".":·{␍

@repo/payments:lint:biome:         9 │ + ····currency:·string,

@repo/payments:lint:biome:        10 │ + ····metadata?:·any,

@repo/analytics:lint:biome:      9    │ - ······"types":·"./src/index.ts",␍

@repo/payments:lint:biome:        11 │ + ··):·Promise<PaymentIntent>·{

@repo/payments:lint:biome:        12 │ + ····//·In·a·real·implementation,·this·would·call·PayHere·API·to·get·a·checkout·URL·or·token.

@repo/analytics:lint:biome:     10    │ - ······"import":·"./src/index.ts",␍

@repo/payments:lint:biome:        13 │ + ····//·For·now,·we·return·a·mock·intent.

@repo/payments:lint:biome:        14 │ + ····return·{

@repo/analytics:lint:biome:     11    │ - ······"default":·"./src/index.ts"␍

@repo/payments:lint:biome:        15 │ + ······id:·`ph_${Math.random().toString(36).substr(2,·9)}`,

@repo/payments:lint:biome:        16 │ + ······amount,

@repo/analytics:lint:biome:     12    │ - ····},␍

@repo/payments:lint:biome:        17 │ + ······currency,

@repo/payments:lint:biome:        18 │ + ······status:·'pending',

@repo/analytics:lint:biome:     13    │ - ····"./hooks":·{␍

@repo/payments:lint:biome:        19 │ + ······provider:·this.id,

@repo/payments:lint:biome:        20 │ + ······metadata,

@repo/payments:lint:biome:        21 │ + ····};

@repo/analytics:lint:biome:     14    │ - ······"types":·"./src/hooks/index.ts",␍

@repo/payments:lint:biome:        22 │ + ··}

@repo/payments:lint:biome:        23 │ + 

@repo/analytics:lint:biome:     15    │ - ······"import":·"./src/hooks/index.ts",␍

@repo/payments:lint:biome:        24 │ + ··async·verifyPayment(_paymentIntentId:·string):·Promise<PaymentStatus>·{

@repo/analytics:lint:biome:     16    │ - ······"default":·"./src/hooks/index.ts"␍

@repo/payments:lint:biome:        25 │ + ····//·Real·check·against·PayHere·API·or·Webhook·status.

@repo/analytics:lint:biome:     17    │ - ····},␍

@repo/analytics:lint:biome:     18    │ - ····"./*":·{␍

@repo/payments:lint:biome:        26 │ + ····return·'succeeded';

@repo/payments:lint:biome:        27 │ + ··}

@repo/payments:lint:biome:        28 │ + 

@repo/payments:lint:biome:        29 │ + ··getFeeEstimate(amount:·number):·number·{

@repo/payments:lint:biome:        30 │ + ····//·PayHere·typically·has·~2.6%·-·3.3%·+·fixed·fee·for·cards.

@repo/payments:lint:biome:        31 │ + ····//·Helapay·is·usually·lower·or·fixed.

@repo/analytics:lint:biome:     19    │ - ······"types":·"./src/*.ts",␍

@repo/payments:lint:biome:        32 │ + ····return·amount·*·0.03;

@repo/payments:lint:biome:        33 │ + ··}

@repo/payments:lint:biome:        34 │ + }

@repo/payments:lint:biome:     35 35 │   

@repo/analytics:lint:biome:     20    │ - ······"import":·"./src/*.js",␍
@repo/payments:lint:biome:   

@repo/payments:lint:biome: 

@repo/analytics:lint:biome:     21    │ - ······"default":·"./src/*.js"␍

@repo/analytics:lint:biome:     22    │ - ····},␍

@repo/payments:lint:biome: src\plugins\stripe.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   

@repo/payments:lint:biome:      1    │ - import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·'../types';␍

@repo/payments:lint:biome:      2    │ - ␍

@repo/analytics:lint:biome:     23    │ - ····"./package.json":·"./package.json"␍

@repo/analytics:lint:biome:     24    │ - ··},␍
@repo/analytics:lint:biome:     25    │ - ··"scripts":·{␍
@repo/analytics:lint:biome:     26    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@repo/analytics:lint:biome:     27    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍

@repo/analytics:lint:biome:     28    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist",␍

@repo/payments:lint:biome:      3    │ - export·class·StripeProvider·implements·PaymentProvider·{␍

@repo/payments:lint:biome:      4    │ - ··id·=·'stripe';␍

@repo/payments:lint:biome:      5    │ - ··name·=·'Stripe·(International)';␍

@repo/payments:lint:biome:      6    │ - ␍

@repo/payments:lint:biome:      7    │ - ··async·initializePayment(␍

@repo/payments:lint:biome:      8    │ - ····amount:·number,␍

@repo/payments:lint:biome:      9    │ - ····currency:·string,␍

@repo/payments:lint:biome:     10    │ - ····metadata?:·any,␍

@repo/payments:lint:biome:     11    │ - ··):·Promise<PaymentIntent>·{␍

@repo/payments:lint:biome:     12    │ - ····//·In·a·real·implementation,·this·would·call·Stripe·API·(via·Edge·Function)␍

@repo/payments:lint:biome:     13    │ - ····//·to·create·a·PaymentIntent·and·return·the·client_secret.␍

@repo/payments:lint:biome:     14    │ - ····return·{␍

@repo/analytics:lint:biome:     29    │ - ····"lint:biome":·"biome·check·.",␍
@repo/analytics:lint:biome:     30    │ - ····"lint:eslint":·"eslint·.",␍
@repo/analytics:lint:biome:     31    │ - ····"format":·"biome·format·--write·.",␍

@repo/analytics:lint:biome:     32    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@repo/analytics:lint:biome:     33    │ - ····"test":·"vitest·run",␍
@repo/analytics:lint:biome:     34    │ - ····"test:watch":·"vitest",␍

@repo/payments:lint:biome:     15    │ - ······id:·`st_${Math.random().toString(36).substr(2,·9)}`,␍

@repo/payments:lint:biome:     16    │ - ······amount,␍

@repo/payments:lint:biome:     17    │ - ······currency,␍

@repo/analytics:lint:biome:     35    │ - ····"test:ui":·"vitest·--ui"␍

@repo/payments:lint:biome:     18    │ - ······status:·'pending',␍

@repo/analytics:lint:biome:     36    │ - ··},␍

@repo/analytics:lint:biome:     37    │ - ··"dependencies":·{␍

@repo/payments:lint:biome:     19    │ - ······provider:·this.id,␍

@repo/payments:lint:biome:     20    │ - ······metadata,␍

@repo/payments:lint:biome:     21    │ - ····};␍
@repo/payments:lint:biome:     22    │ - ··}␍

@repo/payments:lint:biome:     23    │ - ␍

@repo/analytics:lint:biome:     38    │ - ····"@repo/core":·"workspace:*",␍

@repo/analytics:lint:biome:     39    │ - ····"@repo/graphics":·"workspace:*",␍

@repo/payments:lint:biome:     24    │ - ··async·verifyPayment(_paymentIntentId:·string):·Promise<PaymentStatus>·{␍

@repo/payments:lint:biome:     25    │ - ····//·Real·check·against·Stripe·API·or·Webhook·status.␍

@repo/payments:lint:biome:     26    │ - ····return·'succeeded';␍
@repo/payments:lint:biome:     27    │ - ··}␍

@repo/payments:lint:biome:     28    │ - ␍

@repo/analytics:lint:biome:     40    │ - ····"@repo/ui":·"workspace:*",␍

@repo/analytics:lint:biome:     41    │ - ····"@tanstack/react-query":·"^5.90.20",␍

@repo/payments:lint:biome:     29    │ - ··getFeeEstimate(amount:·number):·number·{␍

@repo/analytics:lint:biome:     42    │ - ····"lucide-react-native":·"^0.563.0",␍

@repo/payments:lint:biome:     30    │ - ····//·Stripe·International·typically·2.9%·+·$0.30.␍

@repo/payments:lint:biome:     31    │ - ····return·amount·*·0.029·+·0.3;␍

@repo/payments:lint:biome:     32    │ - ··}␍

@repo/analytics:lint:biome:     43    │ - ····"posthog-js":·"^1.114.0",␍

@repo/payments:lint:biome:     33    │ - }␍

@repo/analytics:lint:biome:     44    │ - ····"posthog-node":·"^5.29.5",␍

@repo/analytics:lint:biome:     45    │ - ····"posthog-react-native":·"^4.35.1",␍

@repo/analytics:lint:biome:     46    │ - ····"react-i18next":·"^16.5.4"␍

@repo/analytics:lint:biome:     47    │ - ··},␍

@repo/analytics:lint:biome:     48    │ - ··"devDependencies":·{␍

@repo/payments:lint:biome:         1 │ + import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·'../types';

@repo/analytics:lint:biome:     49    │ - ····"@repo/eslint-config":·"workspace:^",␍

@repo/payments:lint:biome:         2 │ + 

@repo/payments:lint:biome:         3 │ + export·class·StripeProvider·implements·PaymentProvider·{

@repo/payments:lint:biome:         4 │ + ··id·=·'stripe';

@repo/analytics:lint:biome:     50    │ - ····"@repo/typescript-config":·"workspace:*",␍

@repo/payments:lint:biome:         5 │ + ··name·=·'Stripe·(International)';

@repo/payments:lint:biome:         6 │ + 
@repo/analytics:lint:biome:     51    │ - ····"@types/react":·"^19.2.14",␍
@repo/payments:lint:biome:         7 │ + ··async·initializePayment(
@repo/analytics:lint:biome:     52    │ - ····"eslint":·"^9.38.0",␍
@repo/payments:lint:biome:         8 │ + ····amount:·number,

@repo/payments:lint:biome:         9 │ + ····currency:·string,

@repo/analytics:lint:biome:     53    │ - ····"typescript":·"^6.0.3",␍

@repo/analytics:lint:biome:     54    │ - ····"vitest":·"^2.1.9",␍

@repo/analytics:lint:biome:     55    │ - ····"vite-tsconfig-paths":·"^6.1.1"␍

@repo/analytics:lint:biome:     56    │ - ··},␍

@repo/analytics:lint:biome:     57    │ - ··"peerDependencies":·{␍

@repo/payments:lint:biome:        10 │ + ····metadata?:·any,

@repo/payments:lint:biome:        11 │ + ··):·Promise<PaymentIntent>·{

@repo/analytics:lint:biome:     58    │ - ····"@repo/ui":·"*",␍

@repo/analytics:lint:biome:     59    │ - ····"lucide-react-native":·"*",␍

@repo/analytics:lint:biome:     60    │ - ····"react":·"*",␍

@repo/analytics:lint:biome:     61    │ - ····"react-i18next":·"*",␍

@repo/analytics:lint:biome:     62    │ - ····"react-native":·"*"␍

@repo/analytics:lint:biome:     63    │ - ··}␍

@repo/payments:lint:biome:        12 │ + ····//·In·a·real·implementation,·this·would·call·Stripe·API·(via·Edge·Function)

@repo/payments:lint:biome:        13 │ + ····//·to·create·a·PaymentIntent·and·return·the·client_secret.

@repo/payments:lint:biome:        14 │ + ····return·{

@repo/analytics:lint:biome:     64    │ - }␍

@repo/analytics:lint:biome:         1 │ + {

@repo/analytics:lint:biome:         2 │ + ··"name":·"@repo/analytics",

@repo/analytics:lint:biome:         3 │ + ··"version":·"1.0.0",

@repo/analytics:lint:biome:         4 │ + ··"type":·"module",

@repo/analytics:lint:biome:         5 │ + ··"main":·"src/index.ts",

@repo/analytics:lint:biome:         6 │ + ··"types":·"src/index.ts",
@repo/payments:lint:biome:        15 │ + ······id:·`st_${Math.random().toString(36).substr(2,·9)}`,

@repo/payments:lint:biome:        16 │ + ······amount,

@repo/analytics:lint:biome:         7 │ + ··"exports":·{
@repo/analytics:lint:biome:         8 │ + ····".":·{

@repo/analytics:lint:biome:         9 │ + ······"types":·"./src/index.ts",

@repo/payments:lint:biome:        17 │ + ······currency,

@repo/analytics:lint:biome:        10 │ + ······"import":·"./src/index.ts",

@repo/analytics:lint:biome:        11 │ + ······"default":·"./src/index.ts"

@repo/payments:lint:biome:        18 │ + ······status:·'pending',

@repo/analytics:lint:biome:        12 │ + ····},

@repo/analytics:lint:biome:        13 │ + ····"./hooks":·{

@repo/analytics:lint:biome:        14 │ + ······"types":·"./src/hooks/index.ts",

@repo/analytics:lint:biome:        15 │ + ······"import":·"./src/hooks/index.ts",

@repo/analytics:lint:biome:        16 │ + ······"default":·"./src/hooks/index.ts"

@repo/analytics:lint:biome:        17 │ + ····},

@repo/analytics:lint:biome:        18 │ + ····"./*":·{

@repo/analytics:lint:biome:        19 │ + ······"types":·"./src/*.ts",

@repo/analytics:lint:biome:        20 │ + ······"import":·"./src/*.js",

@repo/analytics:lint:biome:        21 │ + ······"default":·"./src/*.js"

@repo/payments:lint:biome:        19 │ + ······provider:·this.id,
@repo/payments:lint:biome:        20 │ + ······metadata,
@repo/payments:lint:biome:        21 │ + ····};

@repo/payments:lint:biome:        22 │ + ··}
@repo/payments:lint:biome:        23 │ + 
@repo/payments:lint:biome:        24 │ + ··async·verifyPayment(_paymentIntentId:·string):·Promise<PaymentStatus>·{
@repo/payments:lint:biome:        25 │ + ····//·Real·check·against·Stripe·API·or·Webhook·status.
@repo/payments:lint:biome:        26 │ + ····return·'succeeded';
@repo/payments:lint:biome:        27 │ + ··}
@repo/payments:lint:biome:        28 │ + 
@repo/payments:lint:biome:        29 │ + ··getFeeEstimate(amount:·number):·number·{

@repo/analytics:lint:biome:        22 │ + ····},
@repo/analytics:lint:biome:        23 │ + ····"./package.json":·"./package.json"
@repo/analytics:lint:biome:        24 │ + ··},

@repo/analytics:lint:biome:        25 │ + ··"scripts":·{
@repo/analytics:lint:biome:        26 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/analytics:lint:biome:        27 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/analytics:lint:biome:        28 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist",
@repo/analytics:lint:biome:        29 │ + ····"lint:biome":·"biome·check·.",

@repo/payments:lint:biome:        30 │ + ····//·Stripe·International·typically·2.9%·+·$0.30.

@repo/analytics:lint:biome:        30 │ + ····"lint:eslint":·"eslint·.",

@repo/payments:lint:biome:        31 │ + ····return·amount·*·0.029·+·0.3;

@repo/payments:lint:biome:        32 │ + ··}
@repo/payments:lint:biome:        33 │ + }
@repo/payments:lint:biome:     34 34 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 

@repo/analytics:lint:biome:        31 │ + ····"format":·"biome·format·--write·.",

@repo/analytics:lint:biome:        32 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",

@repo/analytics:lint:biome:        33 │ + ····"test":·"vitest·run",

@repo/payments:lint:biome: src\registry.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   

@repo/analytics:lint:biome:        34 │ + ····"test:watch":·"vitest",

@repo/payments:lint:biome:      1    │ - import·type·{·PaymentProvider·}·from·'./types';␍

@repo/payments:lint:biome:      2    │ - ␍

@repo/payments:lint:biome:      3    │ - export·class·PaymentRegistry·{␍

@repo/payments:lint:biome:      4    │ - ··private·providers:·Map<string,·PaymentProvider>·=·new·Map();␍

@repo/payments:lint:biome:      5    │ - ␍

@repo/analytics:lint:biome:        35 │ + ····"test:ui":·"vitest·--ui"

@repo/analytics:lint:biome:        36 │ + ··},

@repo/analytics:lint:biome:        37 │ + ··"dependencies":·{

@repo/analytics:lint:biome:        38 │ + ····"@repo/core":·"workspace:*",

@repo/analytics:lint:biome:        39 │ + ····"@repo/graphics":·"workspace:*",

@repo/analytics:lint:biome:        40 │ + ····"@repo/ui":·"workspace:*",

@repo/analytics:lint:biome:        41 │ + ····"@tanstack/react-query":·"^5.90.20",

@repo/payments:lint:biome:      6    │ - ··register(provider:·PaymentProvider)·{␍

@repo/analytics:lint:biome:        42 │ + ····"lucide-react-native":·"^0.563.0",
@repo/payments:lint:biome:      7    │ - ····this.providers.set(provider.id,·provider);␍

@repo/analytics:lint:biome:        43 │ + ····"posthog-js":·"^1.114.0",
@repo/payments:lint:biome:      8    │ - ··}␍
@repo/analytics:lint:biome:        44 │ + ····"posthog-node":·"^5.29.5",
@repo/payments:lint:biome:      9    │ - ␍

@repo/analytics:lint:biome:        45 │ + ····"posthog-react-native":·"^4.35.1",

@repo/analytics:lint:biome:        46 │ + ····"react-i18next":·"^16.5.4"

@repo/analytics:lint:biome:        47 │ + ··},

@repo/payments:lint:biome:     10    │ - ··getProvider(id:·string):·PaymentProvider·|·undefined·{␍

@repo/payments:lint:biome:     11    │ - ····return·this.providers.get(id);␍

@repo/payments:lint:biome:     12    │ - ··}␍

@repo/payments:lint:biome:     13    │ - ␍

@repo/analytics:lint:biome:        48 │ + ··"devDependencies":·{

@repo/analytics:lint:biome:        49 │ + ····"@repo/eslint-config":·"workspace:^",

@repo/analytics:lint:biome:        50 │ + ····"@repo/typescript-config":·"workspace:*",

@repo/analytics:lint:biome:        51 │ + ····"@types/react":·"^19.2.14",

@repo/payments:lint:biome:     14    │ - ··getAllProviders():·PaymentProvider[]·{␍

@repo/analytics:lint:biome:        52 │ + ····"eslint":·"^9.38.0",

@repo/payments:lint:biome:     15    │ - ····return·Array.from(this.providers.values());␍

@repo/payments:lint:biome:     16    │ - ··}␍

@repo/payments:lint:biome:     17    │ - ␍
@repo/analytics:lint:biome:        53 │ + ····"typescript":·"^6.0.3",

@repo/analytics:lint:biome:        54 │ + ····"vitest":·"^2.1.9",

@repo/payments:lint:biome:     18    │ - ··getCheapestProvider(amount:·number):·PaymentProvider·|·undefined·{␍

@repo/payments:lint:biome:     19    │ - ····let·cheapest:·PaymentProvider·|·undefined;␍

@repo/payments:lint:biome:     20    │ - ····let·minFee·=·Infinity;␍

@repo/payments:lint:biome:     21    │ - ␍

@repo/analytics:lint:biome:        55 │ + ····"vite-tsconfig-paths":·"^6.1.1"

@repo/analytics:lint:biome:        56 │ + ··},

@repo/analytics:lint:biome:        57 │ + ··"peerDependencies":·{

@repo/analytics:lint:biome:        58 │ + ····"@repo/ui":·"*",

@repo/payments:lint:biome:     22    │ - ····for·(const·provider·of·this.providers.values())·{␍

@repo/analytics:lint:biome:        59 │ + ····"lucide-react-native":·"*",

@repo/analytics:lint:biome:        60 │ + ····"react":·"*",

@repo/analytics:lint:biome:        61 │ + ····"react-i18next":·"*",

@repo/payments:lint:biome:     23    │ - ······const·fee·=·provider.getFeeEstimate(amount);␍

@repo/payments:lint:biome:     24    │ - ······if·(fee·<·minFee)·{␍

@repo/analytics:lint:biome:        62 │ + ····"react-native":·"*"
@repo/analytics:lint:biome:        63 │ + ··}

@repo/analytics:lint:biome:        64 │ + }

@repo/analytics:lint:biome:     65 65 │   
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 
@repo/payments:lint:biome:     25    │ - ········minFee·=·fee;␍

@repo/payments:lint:biome:     26    │ - ········cheapest·=·provider;␍

@repo/analytics:lint:biome: src\components\AnalyticsChart.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/payments:lint:biome:     27    │ - ······}␍

@repo/payments:lint:biome:     28    │ - ····}␍

@repo/payments:lint:biome:     29    │ - ␍

@repo/payments:lint:biome:     30    │ - ····return·cheapest;␍

@repo/payments:lint:biome:     31    │ - ··}␍

@repo/payments:lint:biome:     32    │ - }␍

@repo/analytics:lint:biome:      1    │ - interface·AnalyticsChartProps·{␍

@repo/payments:lint:biome:     33    │ - ␍
@repo/analytics:lint:biome:      2    │ - ··title:·string;␍

@repo/analytics:lint:biome:      3    │ - ··data:·{␍
@repo/payments:lint:biome:     34    │ - export·const·payments·=·new·PaymentRegistry();␍

@repo/payments:lint:biome:         1 │ + import·type·{·PaymentProvider·}·from·'./types';

@repo/payments:lint:biome:         2 │ + 

@repo/analytics:lint:biome:      4    │ - ····label:·string;␍

@repo/payments:lint:biome:         3 │ + export·class·PaymentRegistry·{
@repo/analytics:lint:biome:      5    │ - ····value:·number;␍

@repo/analytics:lint:biome:      6    │ - ····color?:·string;␍

@repo/analytics:lint:biome:      7    │ - ··}[];␍

@repo/analytics:lint:biome:      8    │ - ··type?:·'bar'·|·'line'·|·'pie'·|·'progress';␍

@repo/analytics:lint:biome:      9    │ - ··height?:·number;␍

@repo/payments:lint:biome:         4 │ + ··private·providers:·Map<string,·PaymentProvider>·=·new·Map();

@repo/payments:lint:biome:         5 │ + 

@repo/analytics:lint:biome:     10    │ - ··showValues?:·boolean;␍

@repo/analytics:lint:biome:     11    │ - ··maxValue?:·number;␍

@repo/analytics:lint:biome:     12    │ - }␍

@repo/payments:lint:biome:         6 │ + ··register(provider:·PaymentProvider)·{

@repo/payments:lint:biome:         7 │ + ····this.providers.set(provider.id,·provider);

@repo/payments:lint:biome:         8 │ + ··}

@repo/payments:lint:biome:         9 │ + 

@repo/analytics:lint:biome:     13    │ - export·declare·function·AnalyticsChart({␍

@repo/payments:lint:biome:        10 │ + ··getProvider(id:·string):·PaymentProvider·|·undefined·{

@repo/analytics:lint:biome:     14    │ - ··title,␍

@repo/payments:lint:biome:        11 │ + ····return·this.providers.get(id);

@repo/analytics:lint:biome:     15    │ - ··data,␍

@repo/payments:lint:biome:        12 │ + ··}

@repo/payments:lint:biome:        13 │ + 

@repo/payments:lint:biome:        14 │ + ··getAllProviders():·PaymentProvider[]·{

@repo/payments:lint:biome:        15 │ + ····return·Array.from(this.providers.values());

@repo/payments:lint:biome:        16 │ + ··}

@repo/payments:lint:biome:        17 │ + 

@repo/payments:lint:biome:        18 │ + ··getCheapestProvider(amount:·number):·PaymentProvider·|·undefined·{

@repo/payments:lint:biome:        19 │ + ····let·cheapest:·PaymentProvider·|·undefined;
@repo/payments:lint:biome:        20 │ + ····let·minFee·=·Infinity;

@repo/analytics:lint:biome:     16    │ - ··type,␍

@repo/analytics:lint:biome:     17    │ - ··height,␍
@repo/analytics:lint:biome:     18    │ - ··showValues,␍
@repo/analytics:lint:biome:     19    │ - ··maxValue,␍

@repo/analytics:lint:biome:     20    │ - }:·AnalyticsChartProps):·import('react/jsx-runtime').JSX.Element·|·null;␍

@repo/analytics:lint:biome:     21    │ - interface·MultiSeriesChartProps·{␍

@repo/types-shim:lint:biome: [ELIFECYCLE] Command failed with exit code 1.
@repo/payments:lint:biome:        21 │ + 

@repo/payments:lint:biome:        22 │ + ····for·(const·provider·of·this.providers.values())·{
@repo/payments:lint:biome:        23 │ + ······const·fee·=·provider.getFeeEstimate(amount);
@repo/payments:lint:biome:        24 │ + ······if·(fee·<·minFee)·{
@repo/payments:lint:biome:        25 │ + ········minFee·=·fee;
@repo/payments:lint:biome:        26 │ + ········cheapest·=·provider;
@repo/payments:lint:biome:        27 │ + ······}
@repo/payments:lint:biome:        28 │ + ····}
@repo/payments:lint:biome:        29 │ + 
@repo/payments:lint:biome:        30 │ + ····return·cheapest;
@repo/payments:lint:biome:        31 │ + ··}
@repo/payments:lint:biome:        32 │ + }
@repo/payments:lint:biome:        33 │ + 
@repo/payments:lint:biome:        34 │ + export·const·payments·=·new·PaymentRegistry();
@repo/payments:lint:biome:     35 35 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 

@repo/analytics:lint:biome:     22    │ - ··title:·string;␍
@repo/analytics:lint:biome:     23    │ - ··series:·{␍
@repo/analytics:lint:biome:     24    │ - ····name:·string;␍
@repo/analytics:lint:biome:     25    │ - ····data:·{␍
@repo/analytics:lint:biome:     26    │ - ······x:·string;␍
@repo/analytics:lint:biome:     27    │ - ······y:·number;␍
@repo/analytics:lint:biome:     28    │ - ····}[];␍
@repo/analytics:lint:biome:     29    │ - ····color?:·string;␍
@repo/analytics:lint:biome:     30    │ - ··}[];␍
@repo/analytics:lint:biome:     31    │ - ··type?:·'line'·|·'bar';␍

@repo/analytics:lint:biome:     32    │ - ··height?:·number;␍
@repo/analytics:lint:biome:     33    │ - }␍
@repo/analytics:lint:biome:     34    │ - export·declare·function·MultiSeriesChart({␍
@repo/analytics:lint:biome:     35    │ - ··title,␍
@repo/analytics:lint:biome:     36    │ - ··series,␍
@repo/analytics:lint:biome:     37    │ - ··type,␍
@repo/analytics:lint:biome:     38    │ - ··height,␍
@repo/analytics:lint:biome:     39    │ - }:·MultiSeriesChartProps):·import('react/jsx-runtime').JSX.Element;␍
@repo/analytics:lint:biome:     40    │ - //#·sourceMappingURL=AnalyticsChart.d.ts.map␍

@repo/analytics:lint:biome:         1 │ + interface·AnalyticsChartProps·{

@repo/analytics:lint:biome:         2 │ + ··title:·string;
@repo/analytics:lint:biome:         3 │ + ··data:·{

@repo/analytics:lint:biome:         4 │ + ····label:·string;

@repo/analytics:lint:biome:         5 │ + ····value:·number;

@repo/analytics:lint:biome:         6 │ + ····color?:·string;

@repo/analytics:lint:biome:         7 │ + ··}[];

@repo/analytics:lint:biome:         8 │ + ··type?:·'bar'·|·'line'·|·'pie'·|·'progress';

@repo/analytics:lint:biome:         9 │ + ··height?:·number;

@repo/analytics:lint:biome:        10 │ + ··showValues?:·boolean;

@repo/analytics:lint:biome:        11 │ + ··maxValue?:·number;

@repo/analytics:lint:biome:        12 │ + }

@repo/analytics:lint:biome:        13 │ + export·declare·function·AnalyticsChart({
@repo/analytics:lint:biome:        14 │ + ··title,

@repo/analytics:lint:biome:        15 │ + ··data,
@repo/analytics:lint:biome:        16 │ + ··type,
@repo/analytics:lint:biome:        17 │ + ··height,

@repo/analytics:lint:biome:        18 │ + ··showValues,
@repo/analytics:lint:biome:        19 │ + ··maxValue,

@repo/analytics:lint:biome:        20 │ + }:·AnalyticsChartProps):·import('react/jsx-runtime').JSX.Element·|·null;

@repo/payments:lint:biome: src\service.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      1    │ - import·{·Ledger·}·from·'@repo/accounting';␍
@repo/payments:lint:biome:      2    │ - import·{·supabase·}·from·'@repo/core/api';␍

@repo/payments:lint:biome:      3    │ - ␍
@repo/payments:lint:biome:      4    │ - import·type·{·PaymentStatus·}·from·'./types';␍
@repo/payments:lint:biome:      5    │ - ␍
@repo/payments:lint:biome:      6    │ - export·class·PaymentService·{␍
@repo/payments:lint:biome:      7    │ - ··/**␍
@repo/payments:lint:biome:      8    │ - ···*·Finalizes·a·payment·and·records·it·in·the·accounting·ledger.␍
@repo/payments:lint:biome:      9    │ - ···*/␍
@repo/payments:lint:biome:     10    │ - ··static·async·finalizePayment(␍
@repo/payments:lint:biome:     11    │ - ····paymentIntentId:·string,␍
@repo/payments:lint:biome:     12    │ - ····status:·PaymentStatus,␍

@repo/analytics:lint:biome:        21 │ + interface·MultiSeriesChartProps·{

@repo/payments:lint:biome:     13    │ - ····accounts:·{·debit_account_id:·string;·credit_account_id:·string·},␍
@repo/payments:lint:biome:     14    │ - ··)·{␍

@repo/payments:lint:biome:     15    │ - ····if·(status·!==·'succeeded')·return;␍
@repo/payments:lint:biome:     16    │ - ␍
@repo/payments:lint:biome:     17    │ - ····//·1.·Get·Payment·Details␍
@repo/analytics:lint:biome:        22 │ + ··title:·string;
@repo/payments:lint:biome:     18    │ - ····const·{·data:·payment,·error:·pError·}·=·await·supabase␍
@repo/analytics:lint:biome:        23 │ + ··series:·{
@repo/payments:lint:biome:     19    │ - ······.schema('payments')␍
@repo/analytics:lint:biome:        24 │ + ····name:·string;

@repo/analytics:lint:biome:        25 │ + ····data:·{
@repo/analytics:lint:biome:        26 │ + ······x:·string;
@repo/analytics:lint:biome:        27 │ + ······y:·number;
@repo/analytics:lint:biome:        28 │ + ····}[];
@repo/analytics:lint:biome:        29 │ + ····color?:·string;
@repo/analytics:lint:biome:        30 │ + ··}[];
@repo/analytics:lint:biome:        31 │ + ··type?:·'line'·|·'bar';
@repo/analytics:lint:biome:        32 │ + ··height?:·number;
@repo/analytics:lint:biome:        33 │ + }
@repo/analytics:lint:biome:        34 │ + export·declare·function·MultiSeriesChart({
@repo/analytics:lint:biome:        35 │ + ··title,
@repo/analytics:lint:biome:        36 │ + ··series,

@repo/analytics:lint:biome:        37 │ + ··type,

@repo/payments:lint:biome:     20    │ - ······.from('transactions')␍

@repo/payments:lint:biome:     21    │ - ······.select('*')␍

@repo/payments:lint:biome:     22    │ - ······.eq('id',·paymentIntentId)␍

@repo/payments:lint:biome:     23    │ - ······.single();␍

@repo/payments:lint:biome:     24    │ - ␍

@repo/payments:lint:biome:     25    │ - ····if·(pError)·throw·pError;␍

@repo/payments:lint:biome:     26    │ - ␍

@repo/analytics:lint:biome:        38 │ + ··height,

@repo/payments:lint:biome:     27    │ - ····//·2.·Record·in·Ledger·(Double·Entry)␍

@repo/payments:lint:biome:     28    │ - ····const·tx·=·await·Ledger.recordTransaction(␍

@repo/payments:lint:biome:     29    │ - ······{␍

@repo/analytics:lint:biome:        39 │ + }:·MultiSeriesChartProps):·import('react/jsx-runtime').JSX.Element;

@repo/analytics:lint:biome:        40 │ + //#·sourceMappingURL=AnalyticsChart.d.ts.map
@repo/analytics:lint:biome:     41 41 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsChart.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/payments:lint:biome:     30    │ - ········date:·new·Date().toISOString().split('T')[0]·??·new·Date().toISOString(),␍

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/payments:lint:biome:     31    │ - ········description:·`Payment·${paymentIntentId}·via·${payment.provider·||·'unknown'}`,␍

@repo/payments:lint:biome:     32    │ - ········referenceNo:·payment.external_id·||·undefined,␍

@repo/payments:lint:biome:     33    │ - ········metadata:·{·payment_id:·paymentIntentId·},␍

@repo/analytics:lint:biome:       1     │ - import·{␍

@repo/payments:lint:biome:     34    │ - ······},␍

@repo/analytics:lint:biome:       2     │ - ··ProgressRing,␍

@repo/analytics:lint:biome:       3     │ - ··SimpleBarChart,␍

@repo/payments:lint:biome:     35    │ - ······[␍

@repo/analytics:lint:biome:       4     │ - ··SimpleLineChart,␍

@repo/payments:lint:biome:     36    │ - ········{␍

@repo/analytics:lint:biome:       5     │ - ··SimplePieChart,␍

@repo/analytics:lint:biome:       6     │ - }·from·'@repo/graphics/charts';␍

@repo/payments:lint:biome:     37    │ - ··········accountId:·accounts.debit_account_id,·//·e.g.,·"Cash·at·Bank"␍

@repo/payments:lint:biome:     38    │ - ··········amount:·payment.amount,␍

@repo/analytics:lint:biome:       7     │ - import·{·Box,·HStack,·Text·}·from·'@repo/ui/primitives';␍

@repo/payments:lint:biome:     39    │ - ··········side:·'debit',␍

@repo/analytics:lint:biome:       8     │ - import·{·colors·}·from·'@repo/ui/theme';␍

@repo/payments:lint:biome:     40    │ - ··········description:·'Payment·collection',␍
@repo/payments:lint:biome:     41    │ - ········},␍

@repo/analytics:lint:biome:       9     │ - import·{·jsx·as·_jsx,·jsxs·as·_jsxs·}·from·'react/jsx-runtime';␍

@repo/analytics:lint:biome:      10     │ - export·function·AnalyticsChart({␍

@repo/analytics:lint:biome:      11     │ - ··title,␍

@repo/analytics:lint:biome:      12     │ - ··data,␍

@repo/analytics:lint:biome:      13     │ - ··type·=·'bar',␍

@repo/analytics:lint:biome:      14     │ - ··height·=·200,␍

@repo/analytics:lint:biome:      15     │ - ··showValues·=·true,␍

@repo/analytics:lint:biome:      16     │ - ··maxValue,␍

@repo/analytics:lint:biome:      17     │ - })·{␍

@repo/analytics:lint:biome:      18     │ - ··switch·(type)·{␍

@repo/analytics:lint:biome:      19     │ - ····case·'bar':␍

@repo/analytics:lint:biome:      20     │ - ······return·_jsx(SimpleBarChart,·{␍

@repo/analytics:lint:biome:      21     │ - ········title:·title,␍

@repo/analytics:lint:biome:      22     │ - ········data:·data,␍

@repo/analytics:lint:biome:      23     │ - ········height:·height,␍

@repo/payments:lint:biome:     42    │ - ········{␍

@repo/analytics:lint:biome:      24     │ - ········showValues:·showValues,␍

@repo/payments:lint:biome:     43    │ - ··········accountId:·accounts.credit_account_id,·//·e.g.,·"Student·Fees·Receivable"·or·"Sales·Income"␍

@repo/analytics:lint:biome:      25     │ - ······});␍

@repo/analytics:lint:biome:      26     │ - ····case·'line':␍

@repo/analytics:lint:biome:      27     │ - ······return·_jsx(SimpleLineChart,·{␍

@repo/analytics:lint:biome:      28     │ - ········title:·title,␍

@repo/analytics:lint:biome:      29     │ - ········data:·data.map((datum)·=>·({·x:·datum.label,·y:·datum.value·})),␍

@repo/analytics:lint:biome:      30     │ - ········height:·height,␍

@repo/analytics:lint:biome:      31     │ - ········color:·data[0]?.color,␍

@repo/analytics:lint:biome:      32     │ - ······});␍

@repo/analytics:lint:biome:      33     │ - ····case·'pie':␍

@repo/payments:lint:biome:     44    │ - ··········amount:·payment.amount,␍

@repo/payments:lint:biome:     45    │ - ··········side:·'credit',␍

@repo/payments:lint:biome:     46    │ - ··········description:·'Fee·settlement',␍

@repo/payments:lint:biome:     47    │ - ········},␍

@repo/payments:lint:biome:     48    │ - ······],␍

@repo/payments:lint:biome:     49    │ - ····);␍

@repo/payments:lint:biome:     50    │ - ␍

@repo/payments:lint:biome:     51    │ - ····//·3.·Link·back·to·Payment·Transaction␍

@repo/payments:lint:biome:     52    │ - ····const·{·error:·updateError·}·=·await·supabase␍

@repo/analytics:lint:biome:      34     │ - ······return·_jsx(SimplePieChart,·{·title:·title,·data:·data,·size:·height·});␍

@repo/analytics:lint:biome:      35     │ - ····case·'progress':·{␍

@repo/payments:lint:biome:     53    │ - ······.schema('payments')␍

@repo/analytics:lint:biome:      36     │ - ······const·progressValue·=·data[0]?.value·??·0;␍

@repo/payments:lint:biome:     54    │ - ······.from('transactions')␍

@repo/payments:lint:biome:     55    │ - ······.update({␍

@repo/analytics:lint:biome:      37     │ - ······const·progressMax·=·maxValue·??·100;␍

@repo/analytics:lint:biome:      38     │ - ······return·_jsxs(Box,·{␍

@repo/analytics:lint:biome:      39     │ - ········className:·'items-center·rounded-3xl·border·border-black/5·bg-white/70·px-4·py-4',␍

@repo/analytics:lint:biome:      40     │ - ········style:·{·height·},␍

@repo/analytics:lint:biome:      41     │ - ········children:·[␍

@repo/analytics:lint:biome:      42     │ - ··········title␍

@repo/analytics:lint:biome:      43     │ - ············?·_jsx(Text,·{␍

@repo/payments:lint:biome:     56    │ - ········status:·'succeeded',␍
@repo/payments:lint:biome:     57    │ - ········ledger_transaction_id:·tx.id,␍
@repo/payments:lint:biome:     58    │ - ······})␍

@repo/payments:lint:biome:     59    │ - ······.eq('id',·paymentIntentId);␍
@repo/payments:lint:biome:     60    │ - ␍
@repo/payments:lint:biome:     61    │ - ····if·(updateError)·throw·updateError;␍
@repo/payments:lint:biome:     62    │ - ··}␍
@repo/payments:lint:biome:     63    │ - }␍
@repo/payments:lint:biome:         1 │ + import·{·Ledger·}·from·'@repo/accounting';
@repo/payments:lint:biome:         2 │ + import·{·supabase·}·from·'@repo/core/api';
@repo/payments:lint:biome:         3 │ + 
@repo/payments:lint:biome:         4 │ + import·type·{·PaymentStatus·}·from·'./types';
@repo/payments:lint:biome:         5 │ + 
@repo/payments:lint:biome:         6 │ + export·class·PaymentService·{
@repo/payments:lint:biome:         7 │ + ··/**
@repo/payments:lint:biome:         8 │ + ···*·Finalizes·a·payment·and·records·it·in·the·accounting·ledger.
@repo/payments:lint:biome:         9 │ + ···*/
@repo/payments:lint:biome:        10 │ + ··static·async·finalizePayment(

@repo/payments:lint:biome:        11 │ + ····paymentIntentId:·string,

@repo/analytics:lint:biome:      44     │ - ················className:·'mb-4·text-center·text-base·font-bold',␍

@repo/analytics:lint:biome:      45     │ - ················style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:      46     │ - ················children:·title,␍

@repo/analytics:lint:biome:      47     │ - ··············})␍
@repo/analytics:lint:biome:      48     │ - ············:·null,␍
@repo/analytics:lint:biome:      49     │ - ··········_jsx(ProgressRing,·{␍
@repo/analytics:lint:biome:      50     │ - ············value:·progressValue,␍
@repo/analytics:lint:biome:      51     │ - ············max:·progressMax,␍
@repo/analytics:lint:biome:      52     │ - ············size:·Math.min(height,·150),␍
@repo/analytics:lint:biome:      53     │ - ············color:·data[0]?.color,␍
@repo/analytics:lint:biome:      54     │ - ············showLabel:·true,␍
@repo/analytics:lint:biome:      55     │ - ··········}),␍
@repo/analytics:lint:biome:      56     │ - ··········_jsxs(Text,·{␍

@repo/payments:lint:biome:        12 │ + ····status:·PaymentStatus,

@repo/analytics:lint:biome:      57     │ - ············className:·'mt-3·text-center·text-sm',␍

@repo/analytics:lint:biome:      58     │ - ············style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:      59     │ - ············children:·[data[0]?.label,·':·',·progressValue,·'/',·progressMax],␍

@repo/analytics:lint:biome:      60     │ - ··········}),␍

@repo/analytics:lint:biome:      61     │ - ········],␍

@repo/analytics:lint:biome:      62     │ - ······});␍

@repo/analytics:lint:biome:      63     │ - ····}␍

@repo/analytics:lint:biome:      64     │ - ····default:␍

@repo/analytics:lint:biome:      65     │ - ······return·null;␍
@repo/payments:lint:biome:        13 │ + ····accounts:·{·debit_account_id:·string;·credit_account_id:·string·},
@repo/payments:lint:biome:        14 │ + ··)·{
@repo/payments:lint:biome:        15 │ + ····if·(status·!==·'succeeded')·return;
@repo/payments:lint:biome:        16 │ + 
@repo/payments:lint:biome:        17 │ + ····//·1.·Get·Payment·Details
@repo/payments:lint:biome:        18 │ + ····const·{·data:·payment,·error:·pError·}·=·await·supabase
@repo/payments:lint:biome:        19 │ + ······.schema('payments')
@repo/payments:lint:biome:        20 │ + ······.from('transactions')
@repo/payments:lint:biome:        21 │ + ······.select('*')

@repo/payments:lint:biome:        22 │ + ······.eq('id',·paymentIntentId)
@repo/payments:lint:biome:        23 │ + ······.single();
@repo/analytics:lint:biome:      66     │ - ··}␍
@repo/payments:lint:biome:        24 │ + 
@repo/payments:lint:biome:        25 │ + ····if·(pError)·throw·pError;
@repo/payments:lint:biome:        26 │ + 
@repo/payments:lint:biome:        27 │ + ····//·2.·Record·in·Ledger·(Double·Entry)
@repo/payments:lint:biome:        28 │ + ····const·tx·=·await·Ledger.recordTransaction(
@repo/payments:lint:biome:        29 │ + ······{
@repo/payments:lint:biome:        30 │ + ········date:·new·Date().toISOString().split('T')[0]·??·new·Date().toISOString(),
@repo/payments:lint:biome:        31 │ + ········description:·`Payment·${paymentIntentId}·via·${payment.provider·||·'unknown'}`,
@repo/payments:lint:biome:        32 │ + ········referenceNo:·payment.external_id·||·undefined,
@repo/payments:lint:biome:        33 │ + ········metadata:·{·payment_id:·paymentIntentId·},
@repo/payments:lint:biome:        34 │ + ······},
@repo/payments:lint:biome:        35 │ + ······[
@repo/payments:lint:biome:        36 │ + ········{
@repo/analytics:lint:biome:      67     │ - }␍

@repo/payments:lint:biome:        37 │ + ··········accountId:·accounts.debit_account_id,·//·e.g.,·"Cash·at·Bank"

@repo/payments:lint:biome:        38 │ + ··········amount:·payment.amount,

@repo/payments:lint:biome:        39 │ + ··········side:·'debit',

@repo/analytics:lint:biome:      68     │ - export·function·MultiSeriesChart({·title,·series,·type·=·'line',·height·=·250·})·{␍

@repo/analytics:lint:biome:      69     │ - ··return·_jsxs(Box,·{␍

@repo/payments:lint:biome:        40 │ + ··········description:·'Payment·collection',

@repo/payments:lint:biome:        41 │ + ········},

@repo/payments:lint:biome:        42 │ + ········{

@repo/analytics:lint:biome:      70     │ - ····className:·'rounded-3xl·border·border-black/5·bg-white/70·px-4·py-4',␍

@repo/analytics:lint:biome:      71     │ - ····style:·{·height·},␍

@repo/analytics:lint:biome:      72     │ - ····children:·[␍

@repo/analytics:lint:biome:      73     │ - ······title␍

@repo/analytics:lint:biome:      74     │ - ········?·_jsx(Text,·{␍

@repo/payments:lint:biome:        43 │ + ··········accountId:·accounts.credit_account_id,·//·e.g.,·"Student·Fees·Receivable"·or·"Sales·Income"

@repo/analytics:lint:biome:      75     │ - ············className:·'mb-4·text-center·text-base·font-bold',␍

@repo/payments:lint:biome:        44 │ + ··········amount:·payment.amount,

@repo/payments:lint:biome:        45 │ + ··········side:·'credit',

@repo/payments:lint:biome:        46 │ + ··········description:·'Fee·settlement',

@repo/analytics:lint:biome:      76     │ - ············style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:      77     │ - ············children:·title,␍

@repo/analytics:lint:biome:      78     │ - ··········})␍

@repo/payments:lint:biome:        47 │ + ········},

@repo/payments:lint:biome:        48 │ + ······],

@repo/analytics:lint:biome:      79     │ - ········:·null,␍

@repo/payments:lint:biome:        49 │ + ····);

@repo/analytics:lint:biome:      80     │ - ······_jsx(HStack,·{␍

@repo/payments:lint:biome:        50 │ + 

@repo/payments:lint:biome:        51 │ + ····//·3.·Link·back·to·Payment·Transaction

@repo/analytics:lint:biome:      81     │ - ········className:·'justify-around·gap-3',␍

@repo/analytics:lint:biome:      82     │ - ········children:·series.map((entry,·index)·=>␍

@repo/payments:lint:biome:        52 │ + ····const·{·error:·updateError·}·=·await·supabase

@repo/payments:lint:biome:        53 │ + ······.schema('payments')

@repo/payments:lint:biome:        54 │ + ······.from('transactions')

@repo/analytics:lint:biome:      83     │ - ··········_jsxs(␍

@repo/analytics:lint:biome:      84     │ - ············Box,␍

@repo/analytics:lint:biome:      85     │ - ············{␍

@repo/analytics:lint:biome:      86     │ - ··············className:·'flex-1·items-center',␍

@repo/analytics:lint:biome:      87     │ - ··············children:·[␍

@repo/analytics:lint:biome:      88     │ - ················_jsx(Text,·{␍

@repo/payments:lint:biome:        55 │ + ······.update({

@repo/payments:lint:biome:        56 │ + ········status:·'succeeded',

@repo/payments:lint:biome:        57 │ + ········ledger_transaction_id:·tx.id,

@repo/payments:lint:biome:        58 │ + ······})

@repo/payments:lint:biome:        59 │ + ······.eq('id',·paymentIntentId);

@repo/payments:lint:biome:        60 │ + 

@repo/payments:lint:biome:        61 │ + ····if·(updateError)·throw·updateError;

@repo/payments:lint:biome:        62 │ + ··}

@repo/payments:lint:biome:        63 │ + }

@repo/payments:lint:biome:     64 64 │   
@repo/payments:lint:biome:   

@repo/payments:lint:biome: 

@repo/payments:lint:biome: src\types.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/analytics:lint:biome:      89     │ - ··················className:·'mb-2·text-center·text-xs·font-semibold',␍
@repo/analytics:lint:biome:      90     │ - ··················style:·{·color:·entry.color·||·colors.gurudeviBlue·},␍
@repo/analytics:lint:biome:      91     │ - ··················children:·entry.name,␍

@repo/analytics:lint:biome:      92     │ - ················}),␍
@repo/analytics:lint:biome:      93     │ - ················type·===·'line'␍

@repo/analytics:lint:biome:      94     │ - ··················?·_jsx(SimpleLineChart,·{␍

@repo/analytics:lint:biome:      95     │ - ······················data:·entry.data,␍

@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   

@repo/analytics:lint:biome:      96     │ - ······················height:·height·-·60,␍

@repo/analytics:lint:biome:      97     │ - ······················color:·entry.color,␍

@repo/analytics:lint:biome:      98     │ - ····················})␍

@repo/analytics:lint:biome:      99     │ - ··················:·_jsx(SimpleBarChart,·{␍

@repo/analytics:lint:biome:     100     │ - ······················data:·entry.data.map((datum)·=>·({␍

@repo/analytics:lint:biome:     101     │ - ························label:·datum.x,␍

@repo/payments:lint:biome:      1    │ - export·type·PaymentStatus·=·'pending'·|·'succeeded'·|·'failed'·|·'refunded'·|·'cancelled';␍

@repo/payments:lint:biome:      2    │ - ␍

@repo/analytics:lint:biome:     102     │ - ························value:·datum.y,␍

@repo/payments:lint:biome:      3    │ - export·interface·PaymentIntent·{␍

@repo/payments:lint:biome:      4    │ - ··id:·string;␍

@repo/analytics:lint:biome:     103     │ - ························color:·entry.color,␍

@repo/payments:lint:biome:      5    │ - ··amount:·number;␍
@repo/analytics:lint:biome:     104     │ - ······················})),␍

@repo/analytics:lint:biome:     105     │ - ······················height:·height·-·60,␍

@repo/analytics:lint:biome:     106     │ - ······················showValues:·false,␍

@repo/analytics:lint:biome:     107     │ - ····················}),␍

@repo/analytics:lint:biome:     108     │ - ··············],␍

@repo/analytics:lint:biome:     109     │ - ············},␍

@repo/analytics:lint:biome:     110     │ - ············index,␍

@repo/analytics:lint:biome:     111     │ - ··········),␍

@repo/analytics:lint:biome:     112     │ - ········),␍

@repo/analytics:lint:biome:     113     │ - ······}),␍

@repo/analytics:lint:biome:     114     │ - ····],␍

@repo/payments:lint:biome:      6    │ - ··currency:·string;␍

@repo/payments:lint:biome:      7    │ - ··status:·PaymentStatus;␍

@repo/payments:lint:biome:      8    │ - ··provider:·string;␍

@repo/payments:lint:biome:      9    │ - ··clientSecret?:·string;␍

@repo/payments:lint:biome:     10    │ - ··metadata?:·Record<string,·any>;␍

@repo/payments:lint:biome:     11    │ - }␍

@repo/payments:lint:biome:     12    │ - ␍

@repo/payments:lint:biome:     13    │ - export·interface·PaymentMethod·{␍

@repo/payments:lint:biome:     14    │ - ··id:·string;␍

@repo/analytics:lint:biome:     115     │ - ··});␍
@repo/analytics:lint:biome:     116     │ - }␍
@repo/analytics:lint:biome:           1 │ + import·{
@repo/analytics:lint:biome:           2 │ + ··ProgressRing,
@repo/analytics:lint:biome:           3 │ + ··SimpleBarChart,

@repo/analytics:lint:biome:           4 │ + ··SimpleLineChart,
@repo/analytics:lint:biome:           5 │ + ··SimplePieChart,
@repo/payments:lint:biome:     15    │ - ··type:·'card'·|·'bank_account'·|·'wallet'·|·'qr';␍
@repo/analytics:lint:biome:           6 │ + }·from·'@repo/graphics/charts';
@repo/analytics:lint:biome:           7 │ + import·{·Box,·HStack,·Text·}·from·'@repo/ui/primitives';
@repo/analytics:lint:biome:           8 │ + import·{·colors·}·from·'@repo/ui/theme';

@repo/payments:lint:biome:     16    │ - ··provider:·string;␍

@repo/payments:lint:biome:     17    │ - ··lastFour?:·string;␍

@repo/payments:lint:biome:     18    │ - ··expiry?:·string;␍

@repo/payments:lint:biome:     19    │ - ··isDefault:·boolean;␍

@repo/payments:lint:biome:     20    │ - ··metadata?:·Record<string,·any>;␍

@repo/payments:lint:biome:     21    │ - }␍

@repo/payments:lint:biome:     22    │ - ␍

@repo/payments:lint:biome:     23    │ - export·interface·PaymentProvider·{␍

@repo/payments:lint:biome:     24    │ - ··id:·string;␍

@repo/payments:lint:biome:     25    │ - ··name:·string;␍

@repo/payments:lint:biome:     26    │ - ··initializePayment(amount:·number,·currency:·string,·metadata?:·any):·Promise<PaymentIntent>;␍

@repo/payments:lint:biome:     27    │ - ··verifyPayment(paymentIntentId:·string):·Promise<PaymentStatus>;␍

@repo/payments:lint:biome:     28    │ - ··getFeeEstimate(amount:·number):·number;␍

@repo/payments:lint:biome:     29    │ - }␍

@repo/analytics:lint:biome:           9 │ + import·{·jsx·as·_jsx,·jsxs·as·_jsxs·}·from·'react/jsx-runtime';

@repo/analytics:lint:biome:          10 │ + export·function·AnalyticsChart({
@repo/analytics:lint:biome:          11 │ + ··title,

@repo/analytics:lint:biome:          12 │ + ··data,
@repo/analytics:lint:biome:          13 │ + ··type·=·'bar',
@repo/analytics:lint:biome:          14 │ + ··height·=·200,
@repo/analytics:lint:biome:          15 │ + ··showValues·=·true,
@repo/analytics:lint:biome:          16 │ + ··maxValue,
@repo/analytics:lint:biome:          17 │ + })·{
@repo/analytics:lint:biome:          18 │ + ··switch·(type)·{
@repo/analytics:lint:biome:          19 │ + ····case·'bar':

@repo/payments:lint:biome:         1 │ + export·type·PaymentStatus·=·'pending'·|·'succeeded'·|·'failed'·|·'refunded'·|·'cancelled';

@repo/analytics:lint:biome:          20 │ + ······return·_jsx(SimpleBarChart,·{

@repo/payments:lint:biome:         2 │ + 

@repo/payments:lint:biome:         3 │ + export·interface·PaymentIntent·{
@repo/payments:lint:biome:         4 │ + ··id:·string;
@repo/payments:lint:biome:         5 │ + ··amount:·number;

@repo/payments:lint:biome:         6 │ + ··currency:·string;
@repo/payments:lint:biome:         7 │ + ··status:·PaymentStatus;
@repo/payments:lint:biome:         8 │ + ··provider:·string;
@repo/payments:lint:biome:         9 │ + ··clientSecret?:·string;
@repo/payments:lint:biome:        10 │ + ··metadata?:·Record<string,·any>;
@repo/payments:lint:biome:        11 │ + }
@repo/payments:lint:biome:        12 │ + 
@repo/payments:lint:biome:        13 │ + export·interface·PaymentMethod·{
@repo/payments:lint:biome:        14 │ + ··id:·string;

@repo/analytics:lint:biome:          21 │ + ········title:·title,
@repo/analytics:lint:biome:          22 │ + ········data:·data,

@repo/analytics:lint:biome:          23 │ + ········height:·height,
@repo/analytics:lint:biome:          24 │ + ········showValues:·showValues,
@repo/analytics:lint:biome:          25 │ + ······});
@repo/analytics:lint:biome:          26 │ + ····case·'line':
@repo/analytics:lint:biome:          27 │ + ······return·_jsx(SimpleLineChart,·{
@repo/analytics:lint:biome:          28 │ + ········title:·title,
@repo/analytics:lint:biome:          29 │ + ········data:·data.map((datum)·=>·({·x:·datum.label,·y:·datum.value·})),
@repo/analytics:lint:biome:          30 │ + ········height:·height,
@repo/analytics:lint:biome:          31 │ + ········color:·data[0]?.color,

@repo/analytics:lint:biome:          32 │ + ······});
@repo/analytics:lint:biome:          33 │ + ····case·'pie':
@repo/analytics:lint:biome:          34 │ + ······return·_jsx(SimplePieChart,·{·title:·title,·data:·data,·size:·height·});
@repo/analytics:lint:biome:   83 more lines truncated
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/payments:lint:biome:        15 │ + ··type:·'card'·|·'bank_account'·|·'wallet'·|·'qr';

@repo/payments:lint:biome:        16 │ + ··provider:·string;

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/payments:lint:biome:        17 │ + ··lastFour?:·string;

@repo/analytics:lint:biome:      1    │ - import·{·type·ReactNode·}·from·'react';␍

@repo/payments:lint:biome:        18 │ + ··expiry?:·string;

@repo/payments:lint:biome:        19 │ + ··isDefault:·boolean;

@repo/payments:lint:biome:        20 │ + ··metadata?:·Record<string,·any>;

@repo/payments:lint:biome:        21 │ + }

@repo/payments:lint:biome:        22 │ + 

@repo/analytics:lint:biome:      2    │ - interface·AnalyticsContextProps·{␍

@repo/payments:lint:biome:        23 │ + export·interface·PaymentProvider·{
@repo/payments:lint:biome:        24 │ + ··id:·string;
@repo/payments:lint:biome:        25 │ + ··name:·string;
@repo/payments:lint:biome:        26 │ + ··initializePayment(amount:·number,·currency:·string,·metadata?:·any):·Promise<PaymentIntent>;

@repo/analytics:lint:biome:      3    │ - ··track:·(event:·string,·properties?:·any)·=>·void;␍

@repo/payments:lint:biome:        27 │ + ··verifyPayment(paymentIntentId:·string):·Promise<PaymentStatus>;

@repo/analytics:lint:biome:      4    │ - ··identify:·(userId:·string,·properties?:·any)·=>·void;␍

@repo/analytics:lint:biome:      5    │ - ··screen:·(name:·string,·properties?:·any)·=>·void;␍

@repo/payments:lint:biome:        28 │ + ··getFeeEstimate(amount:·number):·number;

@repo/payments:lint:biome:        29 │ + }

@repo/payments:lint:biome:     30 30 │   

@repo/payments:lint:biome:   

@repo/payments:lint:biome: 

@repo/analytics:lint:biome:      6    │ - ··reset:·()·=>·void;␍

@repo/analytics:lint:biome:      7    │ - }␍

@repo/payments:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   

@repo/payments:lint:biome:      1    │ - {␍

@repo/analytics:lint:biome:      8    │ - export·declare·function·useAnalyticsContext():·AnalyticsContextProps;␍

@repo/analytics:lint:biome:      9    │ - interface·Props·{␍

@repo/analytics:lint:biome:     10    │ - ··children:·ReactNode;␍

@repo/analytics:lint:biome:     11    │ - ··apiKey?:·string;␍

@repo/analytics:lint:biome:     12    │ - ··enabled?:·boolean;␍

@repo/analytics:lint:biome:     13    │ - ··options?:·{␍

@repo/analytics:lint:biome:     14    │ - ····host?:·string;␍

@repo/analytics:lint:biome:     15    │ - ····debug?:·boolean;␍

@repo/analytics:lint:biome:     16    │ - ··};␍

@repo/analytics:lint:biome:     17    │ - }␍

@repo/analytics:lint:biome:     18    │ - export·declare·function·AnalyticsProvider({␍

@repo/analytics:lint:biome:     19    │ - ··children,␍

@repo/analytics:lint:biome:     20    │ - ··apiKey,␍

@repo/analytics:lint:biome:     21    │ - ··enabled,␍

@repo/analytics:lint:biome:     22    │ - ··options,␍

@repo/analytics:lint:biome:     23    │ - }:·Props):·import('react/jsx-runtime').JSX.Element;␍

@repo/analytics:lint:biome:     24    │ - //#·sourceMappingURL=AnalyticsProvider.d.ts.map␍

@repo/analytics:lint:biome:         1 │ + import·{·type·ReactNode·}·from·'react';

@repo/payments:lint:biome:      2    │ - ··"extends":·"../../packages/typescript-config/base.json",␍

@repo/payments:lint:biome:      3    │ - ··"compilerOptions":·{␍

@repo/analytics:lint:biome:         2 │ + interface·AnalyticsContextProps·{

@repo/analytics:lint:biome:         3 │ + ··track:·(event:·string,·properties?:·any)·=>·void;

@repo/payments:lint:biome:      4    │ - ····"outDir":·"dist",␍

@repo/payments:lint:biome:      5    │ - ····"rootDir":·"src",␍

@repo/analytics:lint:biome:         4 │ + ··identify:·(userId:·string,·properties?:·any)·=>·void;

@repo/analytics:lint:biome:         5 │ + ··screen:·(name:·string,·properties?:·any)·=>·void;

@repo/analytics:lint:biome:         6 │ + ··reset:·()·=>·void;

@repo/analytics:lint:biome:         7 │ + }

@repo/payments:lint:biome:      6    │ - ····"jsx":·"react-native",␍

@repo/payments:lint:biome:      7    │ - ····"esModuleInterop":·true,␍

@repo/payments:lint:biome:      8    │ - ····"skipLibCheck":·true,␍

@repo/analytics:lint:biome:         8 │ + export·declare·function·useAnalyticsContext():·AnalyticsContextProps;

@repo/payments:lint:biome:      9    │ - ····"paths":·{␍

@repo/analytics:lint:biome:         9 │ + interface·Props·{

@repo/analytics:lint:biome:        10 │ + ··children:·ReactNode;

@repo/analytics:lint:biome:        11 │ + ··apiKey?:·string;

@repo/analytics:lint:biome:        12 │ + ··enabled?:·boolean;

@repo/analytics:lint:biome:        13 │ + ··options?:·{

@repo/analytics:lint:biome:        14 │ + ····host?:·string;

@repo/analytics:lint:biome:        15 │ + ····debug?:·boolean;

@repo/payments:lint:biome:     10    │ - ······"@/*":·["./src/*"]␍

@repo/analytics:lint:biome:        16 │ + ··};

@repo/analytics:lint:biome:        17 │ + }

@repo/analytics:lint:biome:        18 │ + export·declare·function·AnalyticsProvider({

@repo/analytics:lint:biome:        19 │ + ··children,

@repo/analytics:lint:biome:        20 │ + ··apiKey,

@repo/analytics:lint:biome:        21 │ + ··enabled,

@repo/analytics:lint:biome:        22 │ + ··options,

@repo/analytics:lint:biome:        23 │ + }:·Props):·import('react/jsx-runtime').JSX.Element;

@repo/analytics:lint:biome:        24 │ + //#·sourceMappingURL=AnalyticsProvider.d.ts.map

@repo/analytics:lint:biome:     25 25 │   

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·{·PostHogProvider·as·NativePostHogProvider·}·from·'posthog-react-native';␍

@repo/analytics:lint:biome:      2    │ - import·{·createContext,·useContext·}·from·'react';␍

@repo/analytics:lint:biome:      3    │ - import·{·jsx·as·_jsx·}·from·'react/jsx-runtime';␍

@repo/analytics:lint:biome:      4    │ - ␍

@repo/analytics:lint:biome:      5    │ - const·AnalyticsContext·=·createContext(undefined);␍

@repo/payments:lint:biome:     11    │ - ····},␍

@repo/analytics:lint:biome:      6    │ - export·function·useAnalyticsContext()·{␍

@repo/analytics:lint:biome:      7    │ - ··const·context·=·useContext(AnalyticsContext);␍

@repo/analytics:lint:biome:      8    │ - ··if·(!context)·{␍

@repo/payments:lint:biome:     12    │ - ····"types":·["node"]␍

@repo/payments:lint:biome:     13    │ - ··},␍

@repo/payments:lint:biome:     14    │ - ··"include":·["src/**/*"],␍

@repo/payments:lint:biome:     15    │ - ··"exclude":·["node_modules",·"dist"]␍

@repo/payments:lint:biome:     16    │ - }␍
@repo/analytics:lint:biome:      9    │ - ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');␍

@repo/analytics:lint:biome:     10    │ - ··}␍

@repo/payments:lint:biome:         1 │ + {

@repo/analytics:lint:biome:     11    │ - ··return·context;␍

@repo/payments:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",

@repo/payments:lint:biome:         3 │ + ··"compilerOptions":·{

@repo/analytics:lint:biome:     12    │ - }␍

@repo/payments:lint:biome:         4 │ + ····"outDir":·"dist",

@repo/analytics:lint:biome:     13    │ - ␍

@repo/payments:lint:biome:         5 │ + ····"rootDir":·"src",

@repo/payments:lint:biome:         6 │ + ····"jsx":·"react-native",

@repo/analytics:lint:biome:     14    │ - import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';␍

@repo/payments:lint:biome:         7 │ + ····"esModuleInterop":·true,

@repo/analytics:lint:biome:     15    │ - export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·})·{␍

@repo/analytics:lint:biome:     16    │ - ··if·(!apiKey·||·!enabled)·{␍

@repo/payments:lint:biome:         8 │ + ····"skipLibCheck":·true,

@repo/analytics:lint:biome:     17    │ - ····return·_jsx(ActivityPulseProvider,·{·children:·children·});␍

@repo/analytics:lint:biome:     18    │ - ··}␍

@repo/analytics:lint:biome:     19    │ - ··return·_jsx(NativePostHogProvider,·{␍

@repo/analytics:lint:biome:     20    │ - ····apiKey:·apiKey,␍

@repo/analytics:lint:biome:     21    │ - ····options:·{␍

@repo/analytics:lint:biome:     22    │ - ······host:·options?.host,␍

@repo/analytics:lint:biome:     23    │ - ····},␍

@repo/analytics:lint:biome:     24    │ - ····autocapture:·false,␍

@repo/analytics:lint:biome:     25    │ - ····children:·_jsx(ActivityPulseProvider,·{·children:·children·}),␍

@repo/analytics:lint:biome:     26    │ - ··});␍

@repo/analytics:lint:biome:     27    │ - }␍

@repo/analytics:lint:biome:         1 │ + import·{·PostHogProvider·as·NativePostHogProvider·}·from·'posthog-react-native';

@repo/analytics:lint:biome:         2 │ + import·{·createContext,·useContext·}·from·'react';

@repo/analytics:lint:biome:         3 │ + import·{·jsx·as·_jsx·}·from·'react/jsx-runtime';

@repo/analytics:lint:biome:         4 │ + 

@repo/analytics:lint:biome:         5 │ + const·AnalyticsContext·=·createContext(undefined);

@repo/analytics:lint:biome:         6 │ + export·function·useAnalyticsContext()·{

@repo/analytics:lint:biome:         7 │ + ··const·context·=·useContext(AnalyticsContext);

@repo/analytics:lint:biome:         8 │ + ··if·(!context)·{

@repo/analytics:lint:biome:         9 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');

@repo/analytics:lint:biome:        10 │ + ··}

@repo/analytics:lint:biome:        11 │ + ··return·context;

@repo/analytics:lint:biome:        12 │ + }

@repo/analytics:lint:biome:        13 │ + 

@repo/analytics:lint:biome:        14 │ + import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';

@repo/analytics:lint:biome:        15 │ + export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·})·{

@repo/analytics:lint:biome:        16 │ + ··if·(!apiKey·||·!enabled)·{

@repo/analytics:lint:biome:        17 │ + ····return·_jsx(ActivityPulseProvider,·{·children:·children·});

@repo/payments:lint:biome:         9 │ + ····"paths":·{

@repo/analytics:lint:biome:        18 │ + ··}

@repo/payments:lint:biome:        10 │ + ······"@/*":·["./src/*"]

@repo/payments:lint:biome:        11 │ + ····},

@repo/analytics:lint:biome:        19 │ + ··return·_jsx(NativePostHogProvider,·{

@repo/analytics:lint:biome:        20 │ + ····apiKey:·apiKey,

@repo/analytics:lint:biome:        21 │ + ····options:·{

@repo/payments:lint:biome:        12 │ + ····"types":·["node"]

@repo/analytics:lint:biome:        22 │ + ······host:·options?.host,

@repo/analytics:lint:biome:        23 │ + ····},

@repo/payments:lint:biome:        13 │ + ··},

@repo/analytics:lint:biome:        24 │ + ····autocapture:·false,

@repo/payments:lint:biome:        14 │ + ··"include":·["src/**/*"],

@repo/payments:lint:biome:        15 │ + ··"exclude":·["node_modules",·"dist"]

@repo/payments:lint:biome:        16 │ + }
@repo/payments:lint:biome:     17 17 │   

@repo/payments:lint:biome:   

@repo/analytics:lint:biome:        25 │ + ····children:·_jsx(ActivityPulseProvider,·{·children:·children·}),

@repo/analytics:lint:biome:        26 │ + ··});

@repo/analytics:lint:biome:        27 │ + }

@repo/analytics:lint:biome:     28 28 │   

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/payments:lint:biome: 

@repo/payments:lint:biome: Checked 10 files in 106ms. No fixes applied.

@repo/payments:lint:biome: Found 9 errors.

@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·{·PostHogProvider·as·NativePostHogProvider·}·from·'posthog-react-native';␍

@repo/analytics:lint:biome:      2    │ - import·{·createContext,·type·ReactNode,·useContext·}·from·'react';␍

@repo/analytics:lint:biome:      3    │ - ␍

@repo/analytics:lint:biome:      4    │ - interface·AnalyticsContextProps·{␍

@repo/analytics:lint:biome:      5    │ - ··track:·(event:·string,·properties?:·any)·=>·void;␍

@repo/analytics:lint:biome:      6    │ - ··identify:·(userId:·string,·properties?:·any)·=>·void;␍

@repo/payments:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/analytics:lint:biome:      7    │ - ··screen:·(name:·string,·properties?:·any)·=>·void;␍

@repo/analytics:lint:biome:      8    │ - ··reset:·()·=>·void;␍

@repo/analytics:lint:biome:      9    │ - }␍

@repo/payments:lint:biome:   × Some errors were emitted while running checks.
@repo/payments:lint:biome:   

@repo/payments:lint:biome: 

@repo/analytics:lint:biome:     10    │ - ␍

@repo/analytics:lint:biome:     11    │ - const·AnalyticsContext·=·createContext<AnalyticsContextProps·|·undefined>(undefined);␍

@repo/analytics:lint:biome:     12    │ - ␍

@repo/analytics:lint:biome:     13    │ - export·function·useAnalyticsContext()·{␍

@repo/analytics:lint:biome:     14    │ - ··const·context·=·useContext(AnalyticsContext);␍

@repo/analytics:lint:biome:     15    │ - ··if·(!context)·{␍

@repo/analytics:lint:biome:     16    │ - ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');␍

@repo/analytics:lint:biome:     17    │ - ··}␍

@repo/analytics:lint:biome:     18    │ - ··return·context;␍

@repo/analytics:lint:biome:     19    │ - }␍

@repo/analytics:lint:biome:     20    │ - ␍

@repo/analytics:lint:biome:     21    │ - interface·Props·{␍

@repo/analytics:lint:biome:     22    │ - ··children:·ReactNode;␍

@repo/analytics:lint:biome:     23    │ - ··apiKey?:·string;␍

@repo/analytics:lint:biome:     24    │ - ··enabled?:·boolean;␍

@repo/analytics:lint:biome:     25    │ - ··options?:·{␍

@repo/analytics:lint:biome:     26    │ - ····host?:·string;␍

@repo/analytics:lint:biome:     27    │ - ····debug?:·boolean;␍

@repo/analytics:lint:biome:     28    │ - ··};␍

@repo/analytics:lint:biome:     29    │ - }␍

@repo/analytics:lint:biome:     30    │ - ␍

@repo/analytics:lint:biome:     31    │ - import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';␍

@repo/analytics:lint:biome:     32    │ - ␍

@repo/analytics:lint:biome:     33    │ - export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·}:·Props)·{␍

@repo/analytics:lint:biome:     34    │ - ··const·isPostHogEnabled·=·enabled·&&·process.env.EXPO_PUBLIC_POSTHOG_ENABLED·!==·'false';␍

@repo/analytics:lint:biome:     35    │ - ␍

@repo/analytics:lint:biome:     36    │ - ··if·(!apiKey·||·!isPostHogEnabled)·{␍

@repo/analytics:lint:biome:     37    │ - ····return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;␍

@repo/analytics:lint:biome:     38    │ - ··}␍

@repo/analytics:lint:biome:     39    │ - ␍

@repo/analytics:lint:biome:     40    │ - ··return·(␍

@repo/analytics:lint:biome:     41    │ - ····<NativePostHogProvider␍

@repo/analytics:lint:biome:     42    │ - ······apiKey={apiKey}␍

@repo/analytics:lint:biome:     43    │ - ······options={{␍

@repo/analytics:lint:biome:     44    │ - ········host:·options?.host,␍

@repo/analytics:lint:biome:     45    │ - ······}}␍

@repo/analytics:lint:biome:     46    │ - ······autocapture={false}␍

@repo/analytics:lint:biome:     47    │ - ····>␍

@repo/analytics:lint:biome:     48    │ - ······<ActivityPulseProvider>{children}</ActivityPulseProvider>␍

@repo/analytics:lint:biome:     49    │ - ····</NativePostHogProvider>␍

@repo/analytics:lint:biome:     50    │ - ··);␍

@repo/analytics:lint:biome:     51    │ - }␍

@repo/analytics:lint:biome:         1 │ + import·{·PostHogProvider·as·NativePostHogProvider·}·from·'posthog-react-native';

@repo/analytics:lint:biome:         2 │ + import·{·createContext,·type·ReactNode,·useContext·}·from·'react';
@repo/analytics:lint:biome:         3 │ + 

@repo/analytics:lint:biome:         4 │ + interface·AnalyticsContextProps·{

@repo/analytics:lint:biome:         5 │ + ··track:·(event:·string,·properties?:·any)·=>·void;

@repo/analytics:lint:biome:         6 │ + ··identify:·(userId:·string,·properties?:·any)·=>·void;

@repo/analytics:lint:biome:         7 │ + ··screen:·(name:·string,·properties?:·any)·=>·void;

@repo/analytics:lint:biome:         8 │ + ··reset:·()·=>·void;

@repo/analytics:lint:biome:         9 │ + }

@repo/analytics:lint:biome:        10 │ + 

@repo/analytics:lint:biome:        11 │ + const·AnalyticsContext·=·createContext<AnalyticsContextProps·|·undefined>(undefined);

@repo/analytics:lint:biome:        12 │ + 

@repo/analytics:lint:biome:        13 │ + export·function·useAnalyticsContext()·{

@repo/analytics:lint:biome:        14 │ + ··const·context·=·useContext(AnalyticsContext);

@repo/analytics:lint:biome:        15 │ + ··if·(!context)·{

@repo/analytics:lint:biome:        16 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');

@repo/analytics:lint:biome:        17 │ + ··}

@repo/analytics:lint:biome:        18 │ + ··return·context;

@repo/analytics:lint:biome:        19 │ + }

@repo/analytics:lint:biome:        20 │ + 

@repo/analytics:lint:biome:        21 │ + interface·Props·{

@repo/analytics:lint:biome:        22 │ + ··children:·ReactNode;

@repo/analytics:lint:biome:        23 │ + ··apiKey?:·string;

@repo/analytics:lint:biome:        24 │ + ··enabled?:·boolean;

@repo/analytics:lint:biome:        25 │ + ··options?:·{

@repo/analytics:lint:biome:        26 │ + ····host?:·string;

@repo/analytics:lint:biome:        27 │ + ····debug?:·boolean;

@repo/analytics:lint:biome:        28 │ + ··};

@repo/analytics:lint:biome:        29 │ + }

@repo/analytics:lint:biome:        30 │ + 

@repo/analytics:lint:biome:        31 │ + import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';

@repo/analytics:lint:biome:        32 │ + 

@repo/analytics:lint:biome:        33 │ + export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·}:·Props)·{

@repo/analytics:lint:biome:        34 │ + ··const·isPostHogEnabled·=·enabled·&&·process.env.EXPO_PUBLIC_POSTHOG_ENABLED·!==·'false';

@repo/analytics:lint:biome:        35 │ + 

@repo/analytics:lint:biome:        36 │ + ··if·(!apiKey·||·!isPostHogEnabled)·{

@repo/analytics:lint:biome:        37 │ + ····return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;

@repo/analytics:lint:biome:        38 │ + ··}

@repo/analytics:lint:biome:        39 │ + 

@repo/analytics:lint:biome:        40 │ + ··return·(

@repo/analytics:lint:biome:        41 │ + ····<NativePostHogProvider

@repo/analytics:lint:biome:        42 │ + ······apiKey={apiKey}

@repo/analytics:lint:biome:        43 │ + ······options={{

@repo/analytics:lint:biome:        44 │ + ········host:·options?.host,

@repo/analytics:lint:biome:        45 │ + ······}}

@repo/analytics:lint:biome:        46 │ + ······autocapture={false}

@repo/analytics:lint:biome:        47 │ + ····>

@repo/analytics:lint:biome:        48 │ + ······<ActivityPulseProvider>{children}</ActivityPulseProvider>

@repo/analytics:lint:biome:        49 │ + ····</NativePostHogProvider>

@repo/analytics:lint:biome:        50 │ + ··);

@repo/analytics:lint:biome:        51 │ + }

@repo/analytics:lint:biome:     52 52 │   

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.web.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·{·type·ReactNode·}·from·'react';␍

@repo/analytics:lint:biome:      2    │ - interface·Props·{␍

@repo/analytics:lint:biome:      3    │ - ··children:·ReactNode;␍

@repo/analytics:lint:biome:      4    │ - ··apiKey?:·string;␍

@repo/analytics:lint:biome:      5    │ - ··options?:·{␍

@repo/analytics:lint:biome:      6    │ - ····host?:·string;␍

@repo/analytics:lint:biome:      7    │ - ····debug?:·boolean;␍

@repo/analytics:lint:biome:      8    │ - ··};␍

@repo/analytics:lint:biome:      9    │ - }␍

@repo/analytics:lint:biome:     10    │ - export·declare·function·AnalyticsProvider({␍

@repo/analytics:lint:biome:     11    │ - ··children,␍

@repo/analytics:lint:biome:     12    │ - ··apiKey,␍

@repo/analytics:lint:biome:     13    │ - ··options,␍

@repo/analytics:lint:biome:     14    │ - }:·Props):·import('react/jsx-runtime').JSX.Element;␍

@repo/analytics:lint:biome:     15    │ - //#·sourceMappingURL=AnalyticsProvider.web.d.ts.map␍
@repo/analytics:lint:biome:         1 │ + import·{·type·ReactNode·}·from·'react';
@repo/analytics:lint:biome:         2 │ + interface·Props·{
@repo/analytics:lint:biome:         3 │ + ··children:·ReactNode;
@repo/analytics:lint:biome:         4 │ + ··apiKey?:·string;
@repo/analytics:lint:biome:         5 │ + ··options?:·{
@repo/analytics:lint:biome:         6 │ + ····host?:·string;
@repo/analytics:lint:biome:         7 │ + ····debug?:·boolean;
@repo/analytics:lint:biome:         8 │ + ··};

@repo/analytics:lint:biome:         9 │ + }
@repo/analytics:lint:biome:        10 │ + export·declare·function·AnalyticsProvider({
@repo/analytics:lint:biome:        11 │ + ··children,
@repo/analytics:lint:biome:        12 │ + ··apiKey,
@repo/analytics:lint:biome:        13 │ + ··options,

@repo/analytics:lint:biome:        14 │ + }:·Props):·import('react/jsx-runtime').JSX.Element;

@repo/analytics:lint:biome:        15 │ + //#·sourceMappingURL=AnalyticsProvider.web.d.ts.map

@repo/analytics:lint:biome:     16 16 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.web.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·{·useEffect·}·from·'react';␍

@repo/analytics:lint:biome:      2    │ - import·{·jsx·as·_jsx·}·from·'react/jsx-runtime';␍

@repo/analytics:lint:biome:      3    │ - import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';␍

@repo/analytics:lint:biome:      4    │ - import·{·posthogAnalytics·}·from·'../engine/PostHogAnalytics.web';␍

@repo/analytics:lint:biome:      5    │ - export·function·AnalyticsProvider({·children,·apiKey,·options·})·{␍

@repo/analytics:lint:biome:      6    │ - ··useEffect(()·=>·{␍

@repo/analytics:lint:biome:      7    │ - ····if·(apiKey)·{␍

@repo/analytics:lint:biome:      8    │ - ······posthogAnalytics.initialize(apiKey,·options);␍

@repo/analytics:lint:biome:      9    │ - ····}␍

@repo/analytics:lint:biome:     10    │ - ··},·[apiKey,·options]);␍

@repo/analytics:lint:biome:     11    │ - ··return·_jsx(ActivityPulseProvider,·{·children:·children·});␍

@repo/analytics:lint:biome:     12    │ - }␍

@repo/analytics:lint:biome:         1 │ + import·{·useEffect·}·from·'react';

@repo/analytics:lint:biome:         2 │ + import·{·jsx·as·_jsx·}·from·'react/jsx-runtime';

@repo/analytics:lint:biome:         3 │ + import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';

@repo/analytics:lint:biome:         4 │ + import·{·posthogAnalytics·}·from·'../engine/PostHogAnalytics.web';

@repo/analytics:lint:biome:         5 │ + export·function·AnalyticsProvider({·children,·apiKey,·options·})·{

@repo/analytics:lint:biome:         6 │ + ··useEffect(()·=>·{

@repo/analytics:lint:biome:         7 │ + ····if·(apiKey)·{

@repo/analytics:lint:biome:         8 │ + ······posthogAnalytics.initialize(apiKey,·options);

@repo/analytics:lint:biome:         9 │ + ····}

@repo/analytics:lint:biome:        10 │ + ··},·[apiKey,·options]);

@repo/analytics:lint:biome:        11 │ + ··return·_jsx(ActivityPulseProvider,·{·children:·children·});

@repo/analytics:lint:biome:        12 │ + }

@repo/analytics:lint:biome:     13 13 │   

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.web.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·{·type·ReactNode,·useEffect·}·from·'react';␍

@repo/analytics:lint:biome:      2    │ - import·{·posthogAnalytics·}·from·'../engine/PostHogAnalytics.web';␍

@repo/analytics:lint:biome:      3    │ - ␍

@repo/analytics:lint:biome:      4    │ - interface·Props·{␍

@repo/analytics:lint:biome:      5    │ - ··children:·ReactNode;␍

@repo/analytics:lint:biome:      6    │ - ··apiKey?:·string;␍

@repo/analytics:lint:biome:      7    │ - ··enabled?:·boolean;␍

@repo/analytics:lint:biome:      8    │ - ··options?:·{␍

@repo/analytics:lint:biome:      9    │ - ····host?:·string;␍

@repo/analytics:lint:biome:     10    │ - ····debug?:·boolean;␍

@repo/analytics:lint:biome:     11    │ - ··};␍

@repo/analytics:lint:biome:     12    │ - }␍

@repo/analytics:lint:biome:     13    │ - ␍

@repo/analytics:lint:biome:     14    │ - import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';␍

@repo/analytics:lint:biome:     15    │ - ␍

@repo/analytics:lint:biome:     16    │ - export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·}:·Props)·{␍

@repo/analytics:lint:biome:     17    │ - ··useEffect(()·=>·{␍

@repo/analytics:lint:biome:     18    │ - ····const·isPostHogEnabled·=·enabled·&&·process.env.EXPO_PUBLIC_POSTHOG_ENABLED·!==·'false';␍

@repo/analytics:lint:biome:     19    │ - ····if·(apiKey·&&·isPostHogEnabled)·{␍

@repo/analytics:lint:biome:     20    │ - ······posthogAnalytics.initialize(apiKey,·options);␍

@repo/analytics:lint:biome:     21    │ - ····}␍

@repo/analytics:lint:biome:     22    │ - ··},·[apiKey,·enabled,·options]);␍

@repo/analytics:lint:biome:     23    │ - ␍

@repo/analytics:lint:biome:     24    │ - ··return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;␍

@repo/analytics:lint:biome:     25    │ - }␍

@repo/analytics:lint:biome:         1 │ + import·{·type·ReactNode,·useEffect·}·from·'react';

@repo/analytics:lint:biome:         2 │ + import·{·posthogAnalytics·}·from·'../engine/PostHogAnalytics.web';

@repo/analytics:lint:biome:         3 │ + 

@repo/analytics:lint:biome:         4 │ + interface·Props·{

@repo/analytics:lint:biome:         5 │ + ··children:·ReactNode;

@repo/analytics:lint:biome:         6 │ + ··apiKey?:·string;

@repo/analytics:lint:biome:         7 │ + ··enabled?:·boolean;

@repo/analytics:lint:biome:         8 │ + ··options?:·{

@repo/analytics:lint:biome:         9 │ + ····host?:·string;

@repo/analytics:lint:biome:        10 │ + ····debug?:·boolean;

@repo/analytics:lint:biome:        11 │ + ··};

@repo/analytics:lint:biome:        12 │ + }

@repo/analytics:lint:biome:        13 │ + 

@repo/analytics:lint:biome:        14 │ + import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';

@repo/analytics:lint:biome:        15 │ + 

@repo/analytics:lint:biome:        16 │ + export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·}:·Props)·{

@repo/analytics:lint:biome:        17 │ + ··useEffect(()·=>·{

@repo/analytics:lint:biome:        18 │ + ····const·isPostHogEnabled·=·enabled·&&·process.env.EXPO_PUBLIC_POSTHOG_ENABLED·!==·'false';

@repo/analytics:lint:biome:        19 │ + ····if·(apiKey·&&·isPostHogEnabled)·{

@repo/analytics:lint:biome:        20 │ + ······posthogAnalytics.initialize(apiKey,·options);

@repo/analytics:lint:biome:        21 │ + ····}

@repo/analytics:lint:biome:        22 │ + ··},·[apiKey,·enabled,·options]);

@repo/analytics:lint:biome:        23 │ + 

@repo/analytics:lint:biome:        24 │ + ··return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;

@repo/analytics:lint:biome:        25 │ + }

@repo/analytics:lint:biome:     26 26 │   

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\GPAInsights.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - interface·GPAInsightsProps·{␍

@repo/analytics:lint:biome:      2    │ - ··studentId:·string;␍

@repo/analytics:lint:biome:      3    │ - ··currentGPA:·number;␍
@repo/analytics:lint:biome:      4    │ - ··trendDirection:·'improving'·|·'declining'·|·'stable';␍

@repo/analytics:lint:biome:      5    │ - ··predictedGPA?:·number;␍
@repo/analytics:lint:biome:      6    │ - ··targetGPA?:·number;␍
@repo/analytics:lint:biome:      7    │ - }␍

@repo/analytics:lint:biome:      8    │ - export·declare·function·GPAInsights({␍

@repo/analytics:lint:biome:      9    │ - ··studentId,␍

@repo/analytics:lint:biome:     10    │ - ··currentGPA,␍

@repo/analytics:lint:biome:     11    │ - ··trendDirection,␍

@repo/analytics:lint:biome:     12    │ - ··predictedGPA,␍

@repo/analytics:lint:biome:     13    │ - ··targetGPA,␍

@repo/analytics:lint:biome:     14    │ - }:·GPAInsightsProps):·import('react/jsx-runtime').JSX.Element;␍

@repo/analytics:lint:biome:     15    │ - //#·sourceMappingURL=GPAInsights.d.ts.map␍

@repo/analytics:lint:biome:         1 │ + interface·GPAInsightsProps·{

@repo/analytics:lint:biome:         2 │ + ··studentId:·string;

@repo/analytics:lint:biome:         3 │ + ··currentGPA:·number;

@repo/payments:lint:biome: [ELIFECYCLE] Command failed with exit code 1.

@repo/analytics:lint:biome:         4 │ + ··trendDirection:·'improving'·|·'declining'·|·'stable';

@repo/analytics:lint:biome:         5 │ + ··predictedGPA?:·number;

@repo/analytics:lint:biome:         6 │ + ··targetGPA?:·number;

@repo/analytics:lint:biome:         7 │ + }

@repo/analytics:lint:biome:         8 │ + export·declare·function·GPAInsights({

@repo/analytics:lint:biome:         9 │ + ··studentId,

@repo/analytics:lint:biome:        10 │ + ··currentGPA,

@repo/analytics:lint:biome:        11 │ + ··trendDirection,

@repo/analytics:lint:biome:        12 │ + ··predictedGPA,

@repo/analytics:lint:biome:        13 │ + ··targetGPA,

@repo/analytics:lint:biome:        14 │ + }:·GPAInsightsProps):·import('react/jsx-runtime').JSX.Element;

@repo/analytics:lint:biome:        15 │ + //#·sourceMappingURL=GPAInsights.d.ts.map

@repo/analytics:lint:biome:     16 16 │   
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\GPAInsights.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:       1     │ - import·{·Card·}·from·'@repo/ui/components/SanctuaryCard';␍

@repo/analytics:lint:biome:       2     │ - import·{·Box,·HStack,·Text,·VStack·}·from·'@repo/ui/primitives';␍

@repo/analytics:lint:biome:       3     │ - import·{·colors·}·from·'@repo/ui/theme';␍

@repo/analytics:lint:biome:       4     │ - import·{·jsx·as·_jsx,·jsxs·as·_jsxs·}·from·'react/jsx-runtime';␍

@repo/analytics:lint:biome:       5     │ - import·{·formatGPA,·getGradeColor·}·from·'../utils/analyticsHelpers';␍

@repo/analytics:lint:biome:       6     │ - export·function·GPAInsights({␍

@repo/analytics:lint:biome:       7     │ - ··studentId,␍

@repo/analytics:lint:biome:       8     │ - ··currentGPA,␍

@repo/analytics:lint:biome:       9     │ - ··trendDirection,␍

@repo/analytics:lint:biome:      10     │ - ··predictedGPA,␍

@repo/analytics:lint:biome:      11     │ - ··targetGPA·=·3.0,␍

@repo/analytics:lint:biome:      12     │ - })·{␍

@repo/analytics:lint:biome:      13     │ - ··void·studentId;␍

@repo/analytics:lint:biome:      14     │ - ··const·gapToTarget·=·targetGPA·-·currentGPA;␍

@repo/analytics:lint:biome:      15     │ - ··const·isOnTrack·=·predictedGPA·?·predictedGPA·>=·targetGPA·:·currentGPA·>=·targetGPA;␍

@repo/analytics:lint:biome:      16     │ - ··const·trendColor·=␍

@repo/analytics:lint:biome:      17     │ - ····trendDirection·===·'improving'␍

@repo/analytics:lint:biome:      18     │ - ······?·colors.success␍

@repo/analytics:lint:biome:      19     │ - ······:·trendDirection·===·'declining'␍

@repo/analytics:lint:biome:      20     │ - ········?·colors.error␍

@repo/analytics:lint:biome:      21     │ - ········:·colors.warning;␍

@repo/analytics:lint:biome:      22     │ - ··return·_jsxs(Card,·{␍

@repo/analytics:lint:biome:      23     │ - ····className:·'rounded-3xl·bg-white/70·px-6·py-6',␍

@repo/analytics:lint:biome:      24     │ - ····children:·[␍

@repo/analytics:lint:biome:      25     │ - ······_jsx(Text,·{␍

@repo/analytics:lint:biome:      26     │ - ········className:·'mb-5·text-xl·font-bold',␍

@repo/analytics:lint:biome:      27     │ - ········style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:      28     │ - ········children:·'GPA·Insights',␍

@repo/analytics:lint:biome:      29     │ - ······}),␍

@repo/analytics:lint:biome:      30     │ - ······_jsxs(VStack,·{␍

@repo/analytics:lint:biome:      31     │ - ········className:·'gap-5',␍

@repo/analytics:lint:biome:      32     │ - ········children:·[␍

@repo/analytics:lint:biome:      33     │ - ··········_jsxs(HStack,·{␍

@repo/analytics:lint:biome:      34     │ - ············className:·'w-full·justify-around·gap-4',␍

@repo/analytics:lint:biome:      35     │ - ············children:·[␍

@repo/analytics:lint:biome:      36     │ - ··············_jsxs(VStack,·{␍

@repo/analytics:lint:biome:      37     │ - ················className:·'flex-1·items-center·gap-1',␍

@repo/analytics:lint:biome:      38     │ - ················children:·[␍

@repo/analytics:lint:biome:      39     │ - ··················_jsx(Text,·{␍

@repo/analytics:lint:biome:      40     │ - ····················className:·'text-center·text-xs',␍

@repo/analytics:lint:biome:      41     │ - ····················style:·{·color:·colors.textSecondary·},␍

@repo/analytics:lint:biome:      42     │ - ····················children:·'Current·GPA',␍

@repo/analytics:lint:biome:      43     │ - ··················}),␍

@repo/analytics:lint:biome:      44     │ - ··················_jsx(Text,·{␍

@repo/analytics:lint:biome:      45     │ - ····················className:·'text-center·text-[28px]·font-bold',␍

@repo/analytics:lint:biome:      46     │ - ····················style:·{␍

@repo/analytics:lint:biome:      47     │ - ······················color:·getGradeColor(currentGPA·>=·3.5·?·'A'·:·currentGPA·>=·2.5·?·'B'·:·'C'),␍

@repo/analytics:lint:biome:      48     │ - ····················},␍

@repo/analytics:lint:biome:      49     │ - ····················children:·formatGPA(currentGPA),␍

@repo/analytics:lint:biome:      50     │ - ··················}),␍

@repo/analytics:lint:biome:      51     │ - ················],␍

@repo/analytics:lint:biome:      52     │ - ··············}),␍

@repo/analytics:lint:biome:      53     │ - ··············predictedGPA·!==·undefined␍

@repo/analytics:lint:biome:      54     │ - ················?·_jsxs(VStack,·{␍

@repo/analytics:lint:biome:      55     │ - ····················className:·'flex-1·items-center·gap-1',␍

@repo/analytics:lint:biome:      56     │ - ····················children:·[␍

@repo/analytics:lint:biome:      57     │ - ······················_jsx(Text,·{␍

@repo/analytics:lint:biome:      58     │ - ························className:·'text-center·text-xs',␍

@repo/analytics:lint:biome:      59     │ - ························style:·{·color:·colors.textSecondary·},␍

@repo/analytics:lint:biome:      60     │ - ························children:·'Predicted·GPA',␍

@repo/analytics:lint:biome:      61     │ - ······················}),␍

@repo/analytics:lint:biome:      62     │ - ······················_jsx(Text,·{␍

@repo/analytics:lint:biome:      63     │ - ························className:·'text-center·text-[28px]·font-bold',␍

@repo/analytics:lint:biome:      64     │ - ························style:·{␍

@repo/analytics:lint:biome:      65     │ - ··························color:·getGradeColor(␍

@repo/analytics:lint:biome:      66     │ - ····························predictedGPA·>=·3.5·?·'A'·:·predictedGPA·>=·2.5·?·'B'·:·'C',␍

@repo/analytics:lint:biome:      67     │ - ··························),␍

@repo/analytics:lint:biome:      68     │ - ························},␍

@repo/analytics:lint:biome:      69     │ - ························children:·formatGPA(predictedGPA),␍

@repo/analytics:lint:biome:      70     │ - ······················}),␍

@repo/analytics:lint:biome:      71     │ - ····················],␍

@repo/analytics:lint:biome:      72     │ - ··················})␍

@repo/analytics:lint:biome:      73     │ - ················:·null,␍

@repo/analytics:lint:biome:      74     │ - ············],␍

@repo/analytics:lint:biome:      75     │ - ··········}),␍

@repo/analytics:lint:biome:      76     │ - ··········_jsxs(Box,·{␍

@repo/analytics:lint:biome:      77     │ - ············className:·'items-center·gap-1',␍

@repo/analytics:lint:biome:      78     │ - ············children:·[␍

@repo/analytics:lint:biome:      79     │ - ··············_jsx(Text,·{␍

@repo/analytics:lint:biome:      80     │ - ················className:·'text-sm',␍

@repo/analytics:lint:biome:      81     │ - ················style:·{·color:·colors.textSecondary·},␍

@repo/analytics:lint:biome:      82     │ - ················children:·'Performance·Trend',␍
@repo/analytics:lint:biome:      83     │ - ··············}),␍
@repo/analytics:lint:biome:      84     │ - ··············_jsx(Text,·{␍
@repo/analytics:lint:biome:      85     │ - ················className:·'text-base·font-semibold',␍
@repo/analytics:lint:biome:      86     │ - ················style:·{·color:·trendColor·},␍
@repo/analytics:lint:biome:      87     │ - ················children:·trendDirection.charAt(0).toUpperCase()·+·trendDirection.slice(1),␍

@repo/analytics:lint:biome:      88     │ - ··············}),␍
@repo/analytics:lint:biome:      89     │ - ············],␍
@repo/analytics:lint:biome:      90     │ - ··········}),␍
@repo/analytics:lint:biome:      91     │ - ··········_jsxs(VStack,·{␍
@repo/analytics:lint:biome:      92     │ - ············className:·'gap-2',␍
@repo/analytics:lint:biome:      93     │ - ············children:·[␍
@repo/analytics:lint:biome:      94     │ - ··············_jsxs(Text,·{␍
@repo/analytics:lint:biome:      95     │ - ················className:·'text-sm',␍
@repo/analytics:lint:biome:      96     │ - ················style:·{·color:·colors.text·},␍
@repo/analytics:lint:biome:      97     │ - ················children:·['Target:·',·formatGPA(targetGPA)],␍
@repo/analytics:lint:biome:      98     │ - ··············}),␍
@repo/analytics:lint:biome:      99     │ - ··············_jsx(Box,·{␍
@repo/analytics:lint:biome:     100     │ - ················className:·'h-2·w-full·overflow-hidden·rounded-full',␍
@repo/analytics:lint:biome:     101     │ - ················style:·{·backgroundColor:·colors.border·},␍
@repo/analytics:lint:biome:     102     │ - ················children:·_jsx(Box,·{␍
@repo/analytics:lint:biome:     103     │ - ··················className:·'h-full·rounded-full',␍

@repo/analytics:lint:biome:     104     │ - ··················style:·{␍

@repo/analytics:lint:biome:     105     │ - ····················width:·`${Math.min(100,·Math.max(0,·(currentGPA·/·4.0)·*·100))}%`,␍

@repo/analytics:lint:biome:     106     │ - ····················backgroundColor:·isOnTrack·?·colors.success·:·colors.warning,␍

@repo/analytics:lint:biome:     107     │ - ··················},␍

@repo/analytics:lint:biome:     108     │ - ················}),␍

@repo/analytics:lint:biome:     109     │ - ··············}),␍

@repo/analytics:lint:biome:     110     │ - ··············_jsx(Text,·{␍

@repo/analytics:lint:biome:     111     │ - ················className:·'text-xs',␍

@repo/analytics:lint:biome:     112     │ - ················style:·{·color:·colors.textSecondary·},␍

@repo/analytics:lint:biome:     113     │ - ················children:␍

@repo/analytics:lint:biome:     114     │ - ··················gapToTarget·>·0·?·`${formatGPA(gapToTarget)}·to·target`·:·'Target·achieved!',␍

@repo/analytics:lint:biome:     115     │ - ··············}),␍

@repo/analytics:lint:biome:     116     │ - ············],␍

@repo/analytics:lint:biome:     117     │ - ··········}),␍

@repo/analytics:lint:biome:     118     │ - ··········_jsxs(VStack,·{␍

@repo/analytics:lint:biome:     119     │ - ············className:·'gap-2·pt-2',␍

@repo/analytics:lint:biome:     120     │ - ············children:·[␍

@repo/analytics:lint:biome:     121     │ - ··············_jsx(Text,·{␍

@repo/analytics:lint:biome:     122     │ - ················className:·'text-base·font-semibold',␍

@repo/analytics:lint:biome:     123     │ - ················style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:     124     │ - ················children:·'Recommendations',␍

@repo/analytics:lint:biome:     125     │ - ··············}),␍

@repo/analytics:lint:biome:     126     │ - ··············_jsx(VStack,·{␍

@repo/analytics:lint:biome:     127     │ - ················className:·'gap-2',␍

@repo/analytics:lint:biome:     128     │ - ················children:·generateRecommendations(currentGPA,·trendDirection,·gapToTarget).map(␍

@repo/analytics:lint:biome:     129     │ - ··················(recommendation,·index)·=>␍

@repo/analytics:lint:biome:     130     │ - ····················_jsxs(␍

@repo/analytics:lint:biome:     131     │ - ······················Text,␍

@repo/analytics:lint:biome:     132     │ - ······················{␍

@repo/analytics:lint:biome:     133     │ - ························className:·'text-sm·leading-5',␍

@repo/analytics:lint:biome:     134     │ - ························style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:     135     │ - ························children:·['\u2022·',·recommendation],␍

@repo/analytics:lint:biome:     136     │ - ······················},␍

@repo/analytics:lint:biome:     137     │ - ······················index,␍

@repo/analytics:lint:biome:     138     │ - ····················),␍

@repo/analytics:lint:biome:     139     │ - ················),␍

@repo/analytics:lint:biome:     140     │ - ··············}),␍

@repo/analytics:lint:biome:     141     │ - ············],␍

@repo/analytics:lint:biome:     142     │ - ··········}),␍

@repo/analytics:lint:biome:     143     │ - ········],␍

@repo/analytics:lint:biome:     144     │ - ······}),␍

@repo/analytics:lint:biome:     145     │ - ····],␍

@repo/analytics:lint:biome:     146     │ - ··});␍

@repo/analytics:lint:biome:     147     │ - }␍

@repo/analytics:lint:biome:     148     │ - function·generateRecommendations(currentGPA,·trendDirection,·gapToTarget)·{␍

@repo/analytics:lint:biome:     149     │ - ··const·recommendations·=·[];␍

@repo/analytics:lint:biome:     150     │ - ··if·(trendDirection·===·'declining')·{␍

@repo/analytics:lint:biome:   183 more lines truncated

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\PerformanceDashboard.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·type·{·StudentPerformanceMetrics·}·from·'../types/AnalyticsTypes';␍

@repo/analytics:lint:biome:      2    │ - interface·PerformanceDashboardProps·{␍

@repo/analytics:lint:biome:      3    │ - ··metrics:·StudentPerformanceMetrics;␍

@repo/analytics:lint:biome:      4    │ - ··insights?:·string[];␍

@repo/analytics:lint:biome:      5    │ - ··recommendations?:·string[];␍

@repo/analytics:lint:biome:      6    │ - }␍

@repo/analytics:lint:biome:      7    │ - export·declare·function·PerformanceDashboard({␍

@repo/analytics:lint:biome:      8    │ - ··metrics,␍

@repo/analytics:lint:biome:      9    │ - ··insights,␍

@repo/analytics:lint:biome:     10    │ - ··recommendations,␍

@repo/analytics:lint:biome:     11    │ - }:·PerformanceDashboardProps):·import('react/jsx-runtime').JSX.Element;␍

@repo/analytics:lint:biome:     12    │ - //#·sourceMappingURL=PerformanceDashboard.d.ts.map␍

@repo/analytics:lint:biome:         1 │ + import·type·{·StudentPerformanceMetrics·}·from·'../types/AnalyticsTypes';

@repo/analytics:lint:biome:         2 │ + interface·PerformanceDashboardProps·{

@repo/analytics:lint:biome:         3 │ + ··metrics:·StudentPerformanceMetrics;

@repo/analytics:lint:biome:         4 │ + ··insights?:·string[];

@repo/analytics:lint:biome:         5 │ + ··recommendations?:·string[];

@repo/analytics:lint:biome:         6 │ + }

@repo/analytics:lint:biome:         7 │ + export·declare·function·PerformanceDashboard({

@repo/analytics:lint:biome:         8 │ + ··metrics,

@repo/analytics:lint:biome:         9 │ + ··insights,

@repo/analytics:lint:biome:        10 │ + ··recommendations,

@repo/analytics:lint:biome:        11 │ + }:·PerformanceDashboardProps):·import('react/jsx-runtime').JSX.Element;

@repo/analytics:lint:biome:        12 │ + //#·sourceMappingURL=PerformanceDashboard.d.ts.map

@repo/analytics:lint:biome:     13 13 │   

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\PerformanceDashboard.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:       1     │ - import·{·SimpleBarChart·}·from·'@repo/graphics/charts';␍

@repo/analytics:lint:biome:       2     │ - import·{·Card·}·from·'@repo/ui/components/SanctuaryCard';␍

@repo/analytics:lint:biome:       3     │ - import·{·useThemedColors·}·from·'@repo/ui/hooks';␍

@repo/analytics:lint:biome:       4     │ - import·{·Box,·HStack,·ScrollView,·Text,·VStack·}·from·'@repo/ui/primitives';␍
@repo/analytics:lint:biome:       5     │ - import·{·colors·}·from·'@repo/ui/theme';␍
@repo/analytics:lint:biome:       6     │ - import·{·jsx·as·_jsx,·jsxs·as·_jsxs·}·from·'react/jsx-runtime';␍
@repo/analytics:lint:biome:       7     │ - import·{·formatGPA,·getGradeColor,·getPerformanceLevel·}·from·'../utils/analyticsHelpers';␍
@repo/analytics:lint:biome:       8     │ - export·function·PerformanceDashboard({·metrics,·insights·=·[],·recommendations·=·[]·})·{␍
@repo/analytics:lint:biome:       9     │ - ··const·themeColors·=·useThemedColors();␍
@repo/analytics:lint:biome:      10     │ - ··const·performanceLevel·=·getPerformanceLevel(metrics.averageMarks);␍

@repo/analytics:lint:biome:      11     │ - ··const·subjectData·=·Object.entries(metrics.subjectPerformance).map(([subject,·score])·=>·({␍
@repo/analytics:lint:biome:      12     │ - ····label:·subject,␍
@repo/analytics:lint:biome:      13     │ - ····value:·score,␍
@repo/analytics:lint:biome:      14     │ - ····color:·getGradeColor(score·>=·80·?·'A'·:·score·>=·70·?·'B'·:·'C'),␍
@repo/analytics:lint:biome:      15     │ - ··}));␍
@repo/analytics:lint:biome:      16     │ - ··return·_jsx(ScrollView,·{␍
@repo/analytics:lint:biome:      17     │ - ····className:·'flex-1',␍
@repo/analytics:lint:biome:      18     │ - ····contentContainerStyle:·{·padding:·16·},␍
@repo/analytics:lint:biome:      19     │ - ····style:·{·backgroundColor:·colors.silk·},␍
@repo/analytics:lint:biome:      20     │ - ····children:·_jsxs(VStack,·{␍
@repo/analytics:lint:biome:      21     │ - ······className:·'gap-4',␍
@repo/analytics:lint:biome:      22     │ - ······children:·[␍
@repo/analytics:lint:biome:      23     │ - ········_jsxs(Card,·{␍
@repo/analytics:lint:biome:      24     │ - ··········className:·'rounded-3xl·bg-white/75·px-6·py-6',␍
@repo/analytics:lint:biome:      25     │ - ··········children:·[␍
@repo/analytics:lint:biome:      26     │ - ············_jsx(Text,·{␍
@repo/analytics:lint:biome:      27     │ - ··············className:·'text-xl·font-bold',␍

@repo/analytics:lint:biome:      28     │ - ··············style:·{·color:·themeColors.text·},␍

@repo/analytics:lint:biome:      29     │ - ··············children:·'Student·Performance',␍

@repo/analytics:lint:biome:      30     │ - ············}),␍

@repo/analytics:lint:biome:      31     │ - ············_jsxs(Text,·{␍

@repo/analytics:lint:biome:      32     │ - ··············className:·'mb-4·mt-1·text-sm',␍

@repo/analytics:lint:biome:      33     │ - ··············style:·{·color:·themeColors.textSecondary·},␍

@repo/analytics:lint:biome:      34     │ - ··············children:·['ID:·',·metrics.studentId],␍

@repo/analytics:lint:biome:      35     │ - ············}),␍

@repo/analytics:lint:biome:      36     │ - ············_jsxs(HStack,·{␍

@repo/analytics:lint:biome:      37     │ - ··············className:·'mb-4·w-full·justify-around·gap-3',␍

@repo/analytics:lint:biome:      38     │ - ··············children:·[␍

@repo/analytics:lint:biome:      39     │ - ················_jsxs(VStack,·{␍

@repo/analytics:lint:biome:      40     │ - ··················className:·'flex-1·items-center·gap-1',␍

@repo/analytics:lint:biome:      41     │ - ··················children:·[␍

@repo/analytics:lint:biome:      42     │ - ····················_jsx(Text,·{␍

@repo/analytics:lint:biome:      43     │ - ······················className:·'text-lg·font-bold',␍

@repo/analytics:lint:biome:      44     │ - ······················style:·{·color:·themeColors.text·},␍

@repo/analytics:lint:biome:      45     │ - ······················children:·formatGPA(metrics.currentGPA),␍

@repo/analytics:lint:biome:      46     │ - ····················}),␍

@repo/analytics:lint:biome:      47     │ - ····················_jsx(Text,·{␍

@repo/analytics:lint:biome:      48     │ - ······················className:·'text-xs',␍

@repo/analytics:lint:biome:      49     │ - ······················style:·{·color:·themeColors.textSecondary·},␍

@repo/analytics:lint:biome:      50     │ - ······················children:·'Current·GPA',␍

@repo/analytics:lint:biome:      51     │ - ····················}),␍

@repo/analytics:lint:biome:      52     │ - ··················],␍

@repo/analytics:lint:biome:      53     │ - ················}),␍

@repo/analytics:lint:biome:      54     │ - ················_jsxs(VStack,·{␍

@repo/analytics:lint:biome:      55     │ - ··················className:·'flex-1·items-center·gap-1',␍

@repo/analytics:lint:biome:      56     │ - ··················children:·[␍

@repo/analytics:lint:biome:      57     │ - ····················_jsxs(Text,·{␍

@repo/analytics:lint:biome:      58     │ - ······················className:·'text-lg·font-bold',␍

@repo/analytics:lint:biome:      59     │ - ······················style:·{·color:·themeColors.text·},␍

@repo/analytics:lint:biome:      60     │ - ······················children:·[metrics.averageMarks.toFixed(1),·'%'],␍

@repo/analytics:lint:biome:      61     │ - ····················}),␍

@repo/analytics:lint:biome:      62     │ - ····················_jsx(Text,·{␍

@repo/analytics:lint:biome:      63     │ - ······················className:·'text-xs',␍

@repo/analytics:lint:biome:      64     │ - ······················style:·{·color:·themeColors.textSecondary·},␍

@repo/analytics:lint:biome:      65     │ - ······················children:·'Average·Marks',␍

@repo/analytics:lint:biome:      66     │ - ····················}),␍

@repo/analytics:lint:biome:      67     │ - ··················],␍

@repo/analytics:lint:biome:      68     │ - ················}),␍

@repo/analytics:lint:biome:      69     │ - ················_jsxs(VStack,·{␍

@repo/analytics:lint:biome:      70     │ - ··················className:·'flex-1·items-center·gap-1',␍

@repo/analytics:lint:biome:      71     │ - ··················children:·[␍

@repo/analytics:lint:biome:      72     │ - ····················_jsxs(Text,·{␍

@repo/analytics:lint:biome:      73     │ - ······················className:·'text-lg·font-bold',␍

@repo/analytics:lint:biome:      74     │ - ······················style:·{·color:·themeColors.text·},␍

@repo/analytics:lint:biome:      75     │ - ······················children:·['#',·metrics.rankInClass],␍

@repo/analytics:lint:biome:      76     │ - ····················}),␍

@repo/analytics:lint:biome:      77     │ - ····················_jsx(Text,·{␍

@repo/analytics:lint:biome:      78     │ - ······················className:·'text-xs',␍

@repo/analytics:lint:biome:      79     │ - ······················style:·{·color:·themeColors.textSecondary·},␍

@repo/analytics:lint:biome:      80     │ - ······················children:·'Class·Rank',␍

@repo/analytics:lint:biome:      81     │ - ····················}),␍

@repo/analytics:lint:biome:      82     │ - ··················],␍

@repo/analytics:lint:biome:      83     │ - ················}),␍

@repo/analytics:lint:biome:      84     │ - ··············],␍

@repo/analytics:lint:biome:      85     │ - ············}),␍

@repo/analytics:lint:biome:      86     │ - ············_jsx(Box,·{␍

@repo/analytics:lint:biome:      87     │ - ··············className:·'items-center·border-t·pt-3',␍

@repo/analytics:lint:biome:      88     │ - ··············style:·{·borderTopColor:·'rgba(42,35,24,0.08)'·},␍

@repo/analytics:lint:biome:      89     │ - ··············children:·_jsxs(Text,·{␍

@repo/analytics:lint:biome:      90     │ - ················className:·'text-sm·font-semibold',␍

@repo/analytics:lint:biome:      91     │ - ················style:·{␍

@repo/analytics:lint:biome:      92     │ - ··················color:␍

@repo/analytics:lint:biome:      93     │ - ····················metrics.trendDirection·===·'improving'␍

@repo/analytics:lint:biome:      94     │ - ······················?·themeColors.success␍

@repo/analytics:lint:biome:      95     │ - ······················:·metrics.trendDirection·===·'declining'␍

@repo/analytics:lint:biome:      96     │ - ························?·themeColors.error␍

@repo/analytics:lint:biome:      97     │ - ························:·themeColors.warning,␍

@repo/analytics:lint:biome:      98     │ - ················},␍

@repo/analytics:lint:biome:      99     │ - ················children:·[␍

@repo/analytics:lint:biome:     100     │ - ··················'Trend:',␍

@repo/analytics:lint:biome:     101     │ - ··················'·',␍

@repo/analytics:lint:biome:     102     │ - ··················metrics.trendDirection.charAt(0).toUpperCase()·+·metrics.trendDirection.slice(1),␍

@repo/analytics:lint:biome:     103     │ - ··················'·(',␍

@repo/analytics:lint:biome:     104     │ - ··················performanceLevel,␍

@repo/analytics:lint:biome:     105     │ - ··················')',␍

@repo/analytics:lint:biome:     106     │ - ················],␍

@repo/analytics:lint:biome:     107     │ - ··············}),␍

@repo/analytics:lint:biome:     108     │ - ············}),␍

@repo/analytics:lint:biome:     109     │ - ··········],␍

@repo/analytics:lint:biome:     110     │ - ········}),␍

@repo/analytics:lint:biome:     111     │ - ········_jsx(Card,·{␍

@repo/analytics:lint:biome:     112     │ - ··········className:·'rounded-3xl·bg-white/70·px-4·py-4',␍

@repo/analytics:lint:biome:     113     │ - ··········children:·_jsx(SimpleBarChart,·{␍

@repo/analytics:lint:biome:     114     │ - ············title:·'Performance·Overview',␍

@repo/analytics:lint:biome:     115     │ - ············data:·[␍

@repo/analytics:lint:biome:     116     │ - ··············{␍

@repo/analytics:lint:biome:     117     │ - ················label:·'GPA',␍

@repo/analytics:lint:biome:     118     │ - ················value:·metrics.currentGPA,␍

@repo/analytics:lint:biome:     119     │ - ················color:·themeColors.primary,␍

@repo/analytics:lint:biome:     120     │ - ··············},␍

@repo/analytics:lint:biome:     121     │ - ··············{␍

@repo/analytics:lint:biome:     122     │ - ················label:·'Avg·Marks',␍

@repo/analytics:lint:biome:     123     │ - ················value:·metrics.averageMarks,␍

@repo/analytics:lint:biome:     124     │ - ················color:·themeColors.secondary,␍

@repo/analytics:lint:biome:     125     │ - ··············},␍

@repo/analytics:lint:biome:     126     │ - ··············{␍

@repo/analytics:lint:biome:     127     │ - ················label:·'Rank',␍

@repo/analytics:lint:biome:     128     │ - ················value:·metrics.rankInClass,␍

@repo/analytics:lint:biome:     129     │ - ················color:·themeColors.action,␍

@repo/analytics:lint:biome:     130     │ - ··············},␍

@repo/analytics:lint:biome:     131     │ - ············],␍

@repo/analytics:lint:biome:     132     │ - ············height:·180,␍
@repo/analytics:lint:biome:     133     │ - ··········}),␍

@repo/analytics:lint:biome:     134     │ - ········}),␍

@repo/analytics:lint:biome:     135     │ - ········_jsx(Card,·{␍

@repo/analytics:lint:biome:     136     │ - ··········className:·'rounded-3xl·bg-white/70·px-4·py-4',␍

@repo/analytics:lint:biome:     137     │ - ··········children:·_jsx(SimpleBarChart,·{␍

@repo/analytics:lint:biome:     138     │ - ············title:·'Subject·Performance',␍

@repo/analytics:lint:biome:     139     │ - ············data:·subjectData,␍

@repo/analytics:lint:biome:     140     │ - ············height:·150,␍

@repo/analytics:lint:biome:     141     │ - ··········}),␍

@repo/analytics:lint:biome:     142     │ - ········}),␍

@repo/analytics:lint:biome:     143     │ - ········insights.length·>·0␍

@repo/analytics:lint:biome:     144     │ - ··········?·_jsxs(Card,·{␍

@repo/analytics:lint:biome:     145     │ - ··············className:·'rounded-3xl·bg-white/70·px-4·py-4',␍

@repo/analytics:lint:biome:     146     │ - ··············children:·[␍

@repo/analytics:lint:biome:     147     │ - ················_jsx(Text,·{␍

@repo/analytics:lint:biome:     148     │ - ··················className:·'mb-2·text-base·font-semibold',␍

@repo/analytics:lint:biome:     149     │ - ··················style:·{·color:·themeColors.text·},␍

@repo/analytics:lint:biome:     150     │ - ··················children:·'Insights',␍

@repo/analytics:lint:biome:   247 more lines truncated
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\index.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     1   │ - export·*·from·'./AnalyticsChart';␍

@repo/analytics:lint:biome:     2   │ - export·*·from·'./AnalyticsProvider';␍

@repo/analytics:lint:biome:     3   │ - export·*·from·'./GPAInsights';␍

@repo/analytics:lint:biome:     4   │ - export·*·from·'./PerformanceDashboard';␍

@repo/analytics:lint:biome:     5   │ - //#·sourceMappingURL=index.d.ts.map␍

@repo/analytics:lint:biome:       1 │ + export·*·from·'./AnalyticsChart';

@repo/analytics:lint:biome:       2 │ + export·*·from·'./AnalyticsProvider';

@repo/analytics:lint:biome:       3 │ + export·*·from·'./GPAInsights';

@repo/analytics:lint:biome:       4 │ + export·*·from·'./PerformanceDashboard';

@repo/analytics:lint:biome:       5 │ + //#·sourceMappingURL=index.d.ts.map

@repo/analytics:lint:biome:     6 6 │   

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\index.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     1   │ - //·Analytics·Components·-·UI·dependent·exports␍

@repo/analytics:lint:biome:     2   │ - //·This·file·isolates·UI-dependent·components·from·the·root·analytics·entrypoint.␍

@repo/analytics:lint:biome:     3   │ - export·*·from·'./AnalyticsChart';␍

@repo/analytics:lint:biome:     4   │ - export·*·from·'./AnalyticsProvider';␍

@repo/analytics:lint:biome:     5   │ - export·*·from·'./GPAInsights';␍

@repo/analytics:lint:biome:     6   │ - export·*·from·'./PerformanceDashboard';␍

@repo/analytics:lint:biome:       1 │ + //·Analytics·Components·-·UI·dependent·exports

@repo/analytics:lint:biome:       2 │ + //·This·file·isolates·UI-dependent·components·from·the·root·analytics·entrypoint.

@repo/analytics:lint:biome:       3 │ + export·*·from·'./AnalyticsChart';

@repo/analytics:lint:biome:       4 │ + export·*·from·'./AnalyticsProvider';

@repo/analytics:lint:biome:       5 │ + export·*·from·'./GPAInsights';

@repo/analytics:lint:biome:       6 │ + export·*·from·'./PerformanceDashboard';

@repo/analytics:lint:biome:     7 7 │   
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     1   │ - //·Analytics·Components·-·UI·dependent·exports␍

@repo/analytics:lint:biome:     2   │ - //·This·file·isolates·UI-dependent·components·from·the·root·analytics·entrypoint.␍

@repo/analytics:lint:biome:     3   │ - ␍

@repo/analytics:lint:biome:     4   │ - export·*·from·'./AnalyticsChart';␍

@repo/analytics:lint:biome:     5   │ - export·*·from·'./AnalyticsProvider';␍

@repo/analytics:lint:biome:     6   │ - export·*·from·'./GPAInsights';␍

@repo/analytics:lint:biome:     7   │ - export·*·from·'./PerformanceDashboard';␍

@repo/analytics:lint:biome:       1 │ + //·Analytics·Components·-·UI·dependent·exports

@repo/analytics:lint:biome:       2 │ + //·This·file·isolates·UI-dependent·components·from·the·root·analytics·entrypoint.

@repo/analytics:lint:biome:       3 │ + 

@repo/analytics:lint:biome:       4 │ + export·*·from·'./AnalyticsChart';

@repo/analytics:lint:biome:       5 │ + export·*·from·'./AnalyticsProvider';

@repo/analytics:lint:biome:       6 │ + export·*·from·'./GPAInsights';

@repo/analytics:lint:biome:       7 │ + export·*·from·'./PerformanceDashboard';

@repo/analytics:lint:biome:     8 8 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\utils\benchmarking.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:       1     │ - export·const·EDUCATION_BENCHMARKS·=·[␍

@repo/analytics:lint:biome:       2     │ - ··{␍

@repo/analytics:lint:biome:       3     │ - ····institutionType:·'public',␍

@repo/analytics:lint:biome:       4     │ - ····size:·'small',␍

@repo/analytics:lint:biome:       5     │ - ····region:·'national',␍

@repo/analytics:lint:biome:       6     │ - ····metrics:·{␍

@repo/analytics:lint:biome:       7     │ - ······averageGPA:·3.1,␍

@repo/analytics:lint:biome:       8     │ - ······attendanceRate:·0.85,␍

@repo/analytics:lint:biome:       9     │ - ······graduationRate:·0.78,␍

@repo/analytics:lint:biome:      10     │ - ······studentSatisfaction:·0.72,␍

@repo/analytics:lint:biome:      11     │ - ····},␍

@repo/analytics:lint:biome:      12     │ - ··},␍

@repo/analytics:lint:biome:      13     │ - ··{␍

@repo/analytics:lint:biome:      14     │ - ····institutionType:·'public',␍

@repo/analytics:lint:biome:      15     │ - ····size:·'medium',␍

@repo/analytics:lint:biome:      16     │ - ····region:·'national',␍

@repo/analytics:lint:biome:      17     │ - ····metrics:·{␍

@repo/analytics:lint:biome:      18     │ - ······averageGPA:·3.0,␍

@repo/analytics:lint:biome:      19     │ - ······attendanceRate:·0.83,␍

@repo/analytics:lint:biome:      20     │ - ······graduationRate:·0.76,␍

@repo/analytics:lint:biome:      21     │ - ······studentSatisfaction:·0.7,␍
@repo/analytics:lint:biome:      22     │ - ····},␍

@repo/analytics:lint:biome:      23     │ - ··},␍

@repo/analytics:lint:biome:      24     │ - ··{␍

@repo/analytics:lint:biome:      25     │ - ····institutionType:·'public',␍

@repo/analytics:lint:biome:      26     │ - ····size:·'large',␍

@repo/analytics:lint:biome:      27     │ - ····region:·'national',␍

@repo/analytics:lint:biome:      28     │ - ····metrics:·{␍

@repo/analytics:lint:biome:      29     │ - ······averageGPA:·2.9,␍

@repo/analytics:lint:biome:      30     │ - ······attendanceRate:·0.81,␍

@repo/analytics:lint:biome:      31     │ - ······graduationRate:·0.74,␍

@repo/analytics:lint:biome:      32     │ - ······studentSatisfaction:·0.68,␍

@repo/analytics:lint:biome:      33     │ - ····},␍

@repo/analytics:lint:biome:      34     │ - ··},␍

@repo/analytics:lint:biome:      35     │ - ··{␍

@repo/analytics:lint:biome:      36     │ - ····institutionType:·'private',␍

@repo/analytics:lint:biome:      37     │ - ····size:·'small',␍

@repo/analytics:lint:biome:      38     │ - ····region:·'national',␍

@repo/analytics:lint:biome:      39     │ - ····metrics:·{␍

@repo/analytics:lint:biome:      40     │ - ······averageGPA:·3.4,␍

@repo/analytics:lint:biome:      41     │ - ······attendanceRate:·0.92,␍

@repo/analytics:lint:biome:      42     │ - ······graduationRate:·0.88,␍

@repo/analytics:lint:biome:      43     │ - ······studentSatisfaction:·0.85,␍

@repo/analytics:lint:biome:      44     │ - ····},␍

@repo/analytics:lint:biome:      45     │ - ··},␍

@repo/analytics:lint:biome:      46     │ - ··{␍

@repo/analytics:lint:biome:      47     │ - ····institutionType:·'private',␍

@repo/analytics:lint:biome:      48     │ - ····size:·'medium',␍

@repo/analytics:lint:biome:      49     │ - ····region:·'national',␍

@repo/analytics:lint:biome:      50     │ - ····metrics:·{␍

@repo/analytics:lint:biome:      51     │ - ······averageGPA:·3.3,␍

@repo/analytics:lint:biome:      52     │ - ······attendanceRate:·0.9,␍

@repo/analytics:lint:biome:      53     │ - ······graduationRate:·0.86,␍

@repo/analytics:lint:biome:      54     │ - ······studentSatisfaction:·0.83,␍

@repo/analytics:lint:biome:      55     │ - ····},␍

@repo/analytics:lint:biome:      56     │ - ··},␍

@repo/analytics:lint:biome:      57     │ - ··{␍

@repo/analytics:lint:biome:      58     │ - ····institutionType:·'private',␍

@repo/analytics:lint:biome:      59     │ - ····size:·'large',␍

@repo/analytics:lint:biome:      60     │ - ····region:·'national',␍

@repo/analytics:lint:biome:      61     │ - ····metrics:·{␍

@repo/analytics:lint:biome:      62     │ - ······averageGPA:·3.2,␍

@repo/analytics:lint:biome:      63     │ - ······attendanceRate:·0.88,␍

@repo/analytics:lint:biome:      64     │ - ······graduationRate:·0.84,␍

@repo/analytics:lint:biome:      65     │ - ······studentSatisfaction:·0.8,␍

@repo/analytics:lint:biome:      66     │ - ····},␍

@repo/analytics:lint:biome:      67     │ - ··},␍

@repo/analytics:lint:biome:      68     │ - ];␍

@repo/analytics:lint:biome:      69     │ - export·function·getBenchmarkData(institutionType,·size,·region·=·'national')·{␍

@repo/analytics:lint:biome:      70     │ - ··return·(␍

@repo/analytics:lint:biome:      71     │ - ····EDUCATION_BENCHMARKS.find(␍

@repo/analytics:lint:biome:      72     │ - ······(benchmark)·=>␍

@repo/analytics:lint:biome:      73     │ - ········benchmark.institutionType·===·institutionType·&&␍

@repo/analytics:lint:biome:      74     │ - ········benchmark.size·===·size·&&␍

@repo/analytics:lint:biome:      75     │ - ········benchmark.region·===·region,␍

@repo/analytics:lint:biome:      76     │ - ····)·||·null␍

@repo/analytics:lint:biome:      77     │ - ··);␍

@repo/analytics:lint:biome:      78     │ - }␍

@repo/analytics:lint:biome:      79     │ - export·function·compareWithBenchmark(yourMetrics,·benchmark)·{␍

@repo/analytics:lint:biome:      80     │ - ··const·metrics·=·[␍

@repo/analytics:lint:biome:      81     │ - ····{·name:·'averageGPA',·label:·'Average·GPA'·},␍

@repo/analytics:lint:biome:      82     │ - ····{·name:·'attendanceRate',·label:·'Attendance·Rate'·},␍

@repo/analytics:lint:biome:      83     │ - ····{·name:·'graduationRate',·label:·'Graduation·Rate'·},␍

@repo/analytics:lint:biome:      84     │ - ····{·name:·'studentSatisfaction',·label:·'Student·Satisfaction'·},␍

@repo/analytics:lint:biome:      85     │ - ··];␍

@repo/analytics:lint:biome:      86     │ - ··return·metrics.map(({·name,·label·})·=>·{␍

@repo/analytics:lint:biome:      87     │ - ····const·yours·=·yourMetrics[name];␍

@repo/analytics:lint:biome:      88     │ - ····const·benchmarkValue·=·benchmark.metrics[name];␍

@repo/analytics:lint:biome:      89     │ - ····const·difference·=·yours·-·benchmarkValue;␍

@repo/analytics:lint:biome:      90     │ - ····const·status·=·difference·>·0.01·?·'above'·:·difference·<·-0.01·?·'below'·:·'equal';␍

@repo/analytics:lint:biome:      91     │ - ····return·{␍

@repo/analytics:lint:biome:      92     │ - ······metric:·label,␍

@repo/analytics:lint:biome:      93     │ - ······yours,␍

@repo/analytics:lint:biome:      94     │ - ······benchmark:·benchmarkValue,␍

@repo/analytics:lint:biome:      95     │ - ······difference,␍

@repo/analytics:lint:biome:      96     │ - ······status,␍

@repo/analytics:lint:biome:      97     │ - ····};␍

@repo/analytics:lint:biome:      98     │ - ··});␍

@repo/analytics:lint:biome:      99     │ - }␍

@repo/analytics:lint:biome:     100     │ - export·function·generateBenchmarkInsights(comparison)·{␍

@repo/analytics:lint:biome:     101     │ - ··const·insights·=·[];␍

@repo/analytics:lint:biome:     102     │ - ··const·aboveMetrics·=·comparison.filter((c)·=>·c.status·===·'above');␍

@repo/analytics:lint:biome:     103     │ - ··const·belowMetrics·=·comparison.filter((c)·=>·c.status·===·'below');␍

@repo/analytics:lint:biome:     104     │ - ··if·(aboveMetrics.length·>=·3)·{␍

@repo/analytics:lint:biome:     105     │ - ····insights.push(␍

@repo/analytics:lint:biome:     106     │ - ······'Your·institution·is·performing·above·benchmark·in·most·areas.·Excellent·performance!',␍

@repo/analytics:lint:biome:     107     │ - ····);␍

@repo/analytics:lint:biome:     108     │ - ··}·else·if·(aboveMetrics.length·>=·2)·{␍

@repo/analytics:lint:biome:     109     │ - ····insights.push('Your·institution·shows·strong·performance·in·several·key·areas.');␍

@repo/analytics:lint:biome:     110     │ - ··}␍

@repo/analytics:lint:biome:     111     │ - ··if·(belowMetrics.length·>=·3)·{␍

@repo/analytics:lint:biome:     112     │ - ····insights.push(␍

@repo/analytics:lint:biome:     113     │ - ······'Multiple·areas·below·benchmark.·Comprehensive·improvement·strategy·recommended.',␍

@repo/analytics:lint:biome:     114     │ - ····);␍

@repo/analytics:lint:biome:     115     │ - ··}·else·if·(belowMetrics.length·>=·2)·{␍

@repo/analytics:lint:biome:     116     │ - ····insights.push('Some·areas·need·attention·to·reach·benchmark·standards.');␍

@repo/analytics:lint:biome:     117     │ - ··}␍

@repo/analytics:lint:biome:     118     │ - ··belowMetrics.forEach((metric)·=>·{␍

@repo/analytics:lint:biome:     119     │ - ····insights.push(`Focus·on·improving·${metric.metric}·to·reach·benchmark·levels.`);␍

@repo/analytics:lint:biome:     120     │ - ··});␍
@repo/analytics:lint:biome:     121     │ - ··return·insights;␍
@repo/analytics:lint:biome:     122     │ - }␍
@repo/analytics:lint:biome:           1 │ + export·const·EDUCATION_BENCHMARKS·=·[
@repo/analytics:lint:biome:           2 │ + ··{
@repo/analytics:lint:biome:           3 │ + ····institutionType:·'public',
@repo/analytics:lint:biome:           4 │ + ····size:·'small',
@repo/analytics:lint:biome:           5 │ + ····region:·'national',
@repo/analytics:lint:biome:           6 │ + ····metrics:·{
@repo/analytics:lint:biome:           7 │ + ······averageGPA:·3.1,
@repo/analytics:lint:biome:           8 │ + ······attendanceRate:·0.85,
@repo/analytics:lint:biome:           9 │ + ······graduationRate:·0.78,
@repo/analytics:lint:biome:          10 │ + ······studentSatisfaction:·0.72,
@repo/analytics:lint:biome:          11 │ + ····},
@repo/analytics:lint:biome:          12 │ + ··},
@repo/analytics:lint:biome:          13 │ + ··{
@repo/analytics:lint:biome:          14 │ + ····institutionType:·'public',
@repo/analytics:lint:biome:          15 │ + ····size:·'medium',
@repo/analytics:lint:biome:          16 │ + ····region:·'national',
@repo/analytics:lint:biome:          17 │ + ····metrics:·{
@repo/analytics:lint:biome:          18 │ + ······averageGPA:·3.0,
@repo/analytics:lint:biome:          19 │ + ······attendanceRate:·0.83,
@repo/analytics:lint:biome:          20 │ + ······graduationRate:·0.76,
@repo/analytics:lint:biome:          21 │ + ······studentSatisfaction:·0.7,
@repo/analytics:lint:biome:          22 │ + ····},
@repo/analytics:lint:biome:          23 │ + ··},
@repo/analytics:lint:biome:          24 │ + ··{
@repo/analytics:lint:biome:          25 │ + ····institutionType:·'public',
@repo/analytics:lint:biome:          26 │ + ····size:·'large',
@repo/analytics:lint:biome:          27 │ + ····region:·'national',
@repo/analytics:lint:biome:          28 │ + ····metrics:·{
@repo/analytics:lint:biome:   95 more lines truncated
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\utils\benchmarking.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:       1     │ - import·type·{·BenchmarkData·}·from·'../types/AnalyticsTypes';␍
@repo/analytics:lint:biome:       2     │ - ␍
@repo/analytics:lint:biome:       3     │ - export·const·EDUCATION_BENCHMARKS:·BenchmarkData[]·=·[␍
@repo/analytics:lint:biome:       4     │ - ··{␍
@repo/analytics:lint:biome:       5     │ - ····institutionType:·'public',␍
@repo/analytics:lint:biome:       6     │ - ····size:·'small',␍
@repo/analytics:lint:biome:       7     │ - ····region:·'national',␍
@repo/analytics:lint:biome:       8     │ - ····metrics:·{␍
@repo/analytics:lint:biome:       9     │ - ······averageGPA:·3.1,␍
@repo/analytics:lint:biome:      10     │ - ······attendanceRate:·0.85,␍
@repo/analytics:lint:biome:      11     │ - ······graduationRate:·0.78,␍
@repo/analytics:lint:biome:      12     │ - ······studentSatisfaction:·0.72,␍
@repo/analytics:lint:biome:      13     │ - ····},␍
@repo/analytics:lint:biome:      14     │ - ··},␍
@repo/analytics:lint:biome:      15     │ - ··{␍
@repo/analytics:lint:biome:      16     │ - ····institutionType:·'public',␍
@repo/analytics:lint:biome:      17     │ - ····size:·'medium',␍
@repo/analytics:lint:biome:      18     │ - ····region:·'national',␍
@repo/analytics:lint:biome:      19     │ - ····metrics:·{␍
@repo/analytics:lint:biome:      20     │ - ······averageGPA:·3.0,␍
@repo/analytics:lint:biome:      21     │ - ······attendanceRate:·0.83,␍
@repo/analytics:lint:biome:      22     │ - ······graduationRate:·0.76,␍
@repo/analytics:lint:biome:      23     │ - ······studentSatisfaction:·0.7,␍
@repo/analytics:lint:biome:      24     │ - ····},␍
@repo/analytics:lint:biome:      25     │ - ··},␍
@repo/analytics:lint:biome:      26     │ - ··{␍
@repo/analytics:lint:biome:      27     │ - ····institutionType:·'public',␍
@repo/analytics:lint:biome:      28     │ - ····size:·'large',␍
@repo/analytics:lint:biome:      29     │ - ····region:·'national',␍
@repo/analytics:lint:biome:      30     │ - ····metrics:·{␍
@repo/analytics:lint:biome:      31     │ - ······averageGPA:·2.9,␍
@repo/analytics:lint:biome:      32     │ - ······attendanceRate:·0.81,␍
@repo/analytics:lint:biome:      33     │ - ······graduationRate:·0.74,␍
@repo/analytics:lint:biome:      34     │ - ······studentSatisfaction:·0.68,␍
@repo/analytics:lint:biome:      35     │ - ····},␍
@repo/analytics:lint:biome:      36     │ - ··},␍
@repo/analytics:lint:biome:      37     │ - ··{␍
@repo/analytics:lint:biome:      38     │ - ····institutionType:·'private',␍
@repo/analytics:lint:biome:      39     │ - ····size:·'small',␍
@repo/analytics:lint:biome:      40     │ - ····region:·'national',␍
@repo/analytics:lint:biome:      41     │ - ····metrics:·{␍
@repo/analytics:lint:biome:      42     │ - ······averageGPA:·3.4,␍
@repo/analytics:lint:biome:      43     │ - ······attendanceRate:·0.92,␍
@repo/analytics:lint:biome:      44     │ - ······graduationRate:·0.88,␍
@repo/analytics:lint:biome:      45     │ - ······studentSatisfaction:·0.85,␍
@repo/analytics:lint:biome:      46     │ - ····},␍
@repo/analytics:lint:biome:      47     │ - ··},␍
@repo/analytics:lint:biome:      48     │ - ··{␍
@repo/analytics:lint:biome:      49     │ - ····institutionType:·'private',␍
@repo/analytics:lint:biome:      50     │ - ····size:·'medium',␍
@repo/analytics:lint:biome:      51     │ - ····region:·'national',␍
@repo/analytics:lint:biome:      52     │ - ····metrics:·{␍
@repo/analytics:lint:biome:      53     │ - ······averageGPA:·3.3,␍
@repo/analytics:lint:biome:      54     │ - ······attendanceRate:·0.9,␍
@repo/analytics:lint:biome:      55     │ - ······graduationRate:·0.86,␍
@repo/analytics:lint:biome:      56     │ - ······studentSatisfaction:·0.83,␍
@repo/analytics:lint:biome:      57     │ - ····},␍
@repo/analytics:lint:biome:      58     │ - ··},␍
@repo/analytics:lint:biome:      59     │ - ··{␍
@repo/analytics:lint:biome:      60     │ - ····institutionType:·'private',␍
@repo/analytics:lint:biome:      61     │ - ····size:·'large',␍
@repo/analytics:lint:biome:      62     │ - ····region:·'national',␍
@repo/analytics:lint:biome:      63     │ - ····metrics:·{␍
@repo/analytics:lint:biome:      64     │ - ······averageGPA:·3.2,␍
@repo/analytics:lint:biome:      65     │ - ······attendanceRate:·0.88,␍
@repo/analytics:lint:biome:      66     │ - ······graduationRate:·0.84,␍
@repo/analytics:lint:biome:      67     │ - ······studentSatisfaction:·0.8,␍
@repo/analytics:lint:biome:      68     │ - ····},␍
@repo/analytics:lint:biome:      69     │ - ··},␍
@repo/analytics:lint:biome:      70     │ - ];␍
@repo/analytics:lint:biome:      71     │ - ␍
@repo/analytics:lint:biome:      72     │ - export·function·getBenchmarkData(␍
@repo/analytics:lint:biome:      73     │ - ··institutionType:·'public'·|·'private'·|·'charter',␍
@repo/analytics:lint:biome:      74     │ - ··size:·'small'·|·'medium'·|·'large',␍
@repo/analytics:lint:biome:      75     │ - ··region:·string·=·'national',␍
@repo/analytics:lint:biome:      76     │ - ):·BenchmarkData·|·null·{␍
@repo/analytics:lint:biome:      77     │ - ··return·(␍
@repo/analytics:lint:biome:      78     │ - ····EDUCATION_BENCHMARKS.find(␍
@repo/analytics:lint:biome:      79     │ - ······(benchmark)·=>␍
@repo/analytics:lint:biome:      80     │ - ········benchmark.institutionType·===·institutionType·&&␍
@repo/analytics:lint:biome:      81     │ - ········benchmark.size·===·size·&&␍
@repo/analytics:lint:biome:      82     │ - ········benchmark.region·===·region,␍
@repo/analytics:lint:biome:      83     │ - ····)·||·null␍
@repo/analytics:lint:biome:      84     │ - ··);␍
@repo/analytics:lint:biome:      85     │ - }␍
@repo/analytics:lint:biome:      86     │ - ␍
@repo/analytics:lint:biome:      87     │ - export·function·compareWithBenchmark(␍
@repo/analytics:lint:biome:      88     │ - ··yourMetrics:·{␍
@repo/analytics:lint:biome:      89     │ - ····averageGPA:·number;␍
@repo/analytics:lint:biome:      90     │ - ····attendanceRate:·number;␍
@repo/analytics:lint:biome:      91     │ - ····graduationRate:·number;␍
@repo/analytics:lint:biome:      92     │ - ····studentSatisfaction:·number;␍
@repo/analytics:lint:biome:      93     │ - ··},␍
@repo/analytics:lint:biome:      94     │ - ··benchmark:·BenchmarkData,␍
@repo/analytics:lint:biome:      95     │ - ):·{␍
@repo/analytics:lint:biome:      96     │ - ··metric:·string;␍
@repo/analytics:lint:biome:      97     │ - ··yours:·number;␍
@repo/analytics:lint:biome:      98     │ - ··benchmark:·number;␍
@repo/analytics:lint:biome:      99     │ - ··difference:·number;␍
@repo/analytics:lint:biome:     100     │ - ··status:·'above'·|·'below'·|·'equal';␍
@repo/analytics:lint:biome:     101     │ - }[]·{␍
@repo/analytics:lint:biome:     102     │ - ··const·metrics·=·[␍
@repo/analytics:lint:biome:     103     │ - ····{·name:·'averageGPA',·label:·'Average·GPA'·},␍
@repo/analytics:lint:biome:     104     │ - ····{·name:·'attendanceRate',·label:·'Attendance·Rate'·},␍
@repo/analytics:lint:biome:     105     │ - ····{·name:·'graduationRate',·label:·'Graduation·Rate'·},␍
@repo/analytics:lint:biome:     106     │ - ····{·name:·'studentSatisfaction',·label:·'Student·Satisfaction'·},␍
@repo/analytics:lint:biome:     107     │ - ··];␍
@repo/analytics:lint:biome:     108     │ - ␍
@repo/analytics:lint:biome:     109     │ - ··return·metrics.map(({·name,·label·})·=>·{␍

@repo/analytics:lint:biome:     110     │ - ····const·yours·=·yourMetrics[name·as·keyof·typeof·yourMetrics];␍
@repo/analytics:lint:biome:     111     │ - ····const·benchmarkValue·=·benchmark.metrics[name·as·keyof·typeof·benchmark.metrics];␍
@repo/analytics:lint:biome:     112     │ - ····const·difference·=·yours·-·benchmarkValue;␍
@repo/analytics:lint:biome:     113     │ - ····const·status·=·difference·>·0.01·?·'above'·:·difference·<·-0.01·?·'below'·:·'equal';␍
@repo/analytics:lint:biome:     114     │ - ␍
@repo/analytics:lint:biome:     115     │ - ····return·{␍
@repo/analytics:lint:biome:     116     │ - ······metric:·label,␍
@repo/analytics:lint:biome:     117     │ - ······yours,␍
@repo/analytics:lint:biome:     118     │ - ······benchmark:·benchmarkValue,␍
@repo/analytics:lint:biome:     119     │ - ······difference,␍
@repo/analytics:lint:biome:     120     │ - ······status,␍
@repo/analytics:lint:biome:     121     │ - ····};␍
@repo/analytics:lint:biome:     122     │ - ··});␍
@repo/analytics:lint:biome:     123     │ - }␍
@repo/analytics:lint:biome:     124     │ - ␍
@repo/analytics:lint:biome:     125     │ - export·function·generateBenchmarkInsights(␍
@repo/analytics:lint:biome:     126     │ - ··comparison:·{·metric:·string;·status:·'above'·|·'below'·|·'equal'·}[],␍
@repo/analytics:lint:biome:     127     │ - ):·string[]·{␍
@repo/analytics:lint:biome:     128     │ - ··const·insights:·string[]·=·[];␍
@repo/analytics:lint:biome:     129     │ - ␍
@repo/analytics:lint:biome:     130     │ - ··const·aboveMetrics·=·comparison.filter((c)·=>·c.status·===·'above');␍
@repo/analytics:lint:biome:     131     │ - ··const·belowMetrics·=·comparison.filter((c)·=>·c.status·===·'below');␍
@repo/analytics:lint:biome:     132     │ - ␍
@repo/analytics:lint:biome:     133     │ - ··if·(aboveMetrics.length·>=·3)·{␍
@repo/analytics:lint:biome:     134     │ - ····insights.push(␍

@repo/analytics:lint:biome:     135     │ - ······'Your·institution·is·performing·above·benchmark·in·most·areas.·Excellent·performance!',␍

@repo/analytics:lint:biome:     136     │ - ····);␍

@repo/analytics:lint:biome:     137     │ - ··}·else·if·(aboveMetrics.length·>=·2)·{␍

@repo/analytics:lint:biome:     138     │ - ····insights.push('Your·institution·shows·strong·performance·in·several·key·areas.');␍

@repo/analytics:lint:biome:     139     │ - ··}␍

@repo/analytics:lint:biome:     140     │ - ␍

@repo/analytics:lint:biome:     141     │ - ··if·(belowMetrics.length·>=·3)·{␍

@repo/analytics:lint:biome:     142     │ - ····insights.push(␍

@repo/analytics:lint:biome:     143     │ - ······'Multiple·areas·below·benchmark.·Comprehensive·improvement·strategy·recommended.',␍

@repo/analytics:lint:biome:     144     │ - ····);␍

@repo/analytics:lint:biome:     145     │ - ··}·else·if·(belowMetrics.length·>=·2)·{␍

@repo/analytics:lint:biome:     146     │ - ····insights.push('Some·areas·need·attention·to·reach·benchmark·standards.');␍

@repo/analytics:lint:biome:     147     │ - ··}␍

@repo/analytics:lint:biome:     148     │ - ␍

@repo/analytics:lint:biome:     149     │ - ··belowMetrics.forEach((metric)·=>·{␍

@repo/analytics:lint:biome:     150     │ - ····insights.push(`Focus·on·improving·${metric.metric}·to·reach·benchmark·levels.`);␍

@repo/analytics:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/analytics:lint:biome:   159 more lines truncated
@repo/analytics:lint:biome: Diagnostics not shown: 63.
@repo/analytics:lint:biome: Checked 86 files in 222ms. No fixes applied.

@repo/analytics:lint:biome: Found 83 errors.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     1   │ - {␍
@repo/analytics:lint:biome:     2   │ - ··"extends":·"@repo/typescript-config/base.json",␍
@repo/analytics:lint:biome:     3   │ - ··"include":·["src/**/*"],␍
@repo/analytics:lint:biome:     4   │ - ··"exclude":·["node_modules",·"dist",·".turbo"],␍
@repo/analytics:lint:biome:     5   │ - ··"compilerOptions":·{␍
@repo/analytics:lint:biome:     6   │ - ····"jsx":·"react-jsx"␍
@repo/analytics:lint:biome:     7   │ - ··}␍
@repo/analytics:lint:biome:     8   │ - }␍
@repo/analytics:lint:biome:       1 │ + {
@repo/analytics:lint:biome:       2 │ + ··"extends":·"@repo/typescript-config/base.json",
@repo/analytics:lint:biome:       3 │ + ··"include":·["src/**/*"],
@repo/analytics:lint:biome:       4 │ + ··"exclude":·["node_modules",·"dist",·".turbo"],
@repo/analytics:lint:biome:       5 │ + ··"compilerOptions":·{
@repo/analytics:lint:biome:       6 │ + ····"jsx":·"react-jsx"
@repo/analytics:lint:biome:       7 │ + ··}
@repo/analytics:lint:biome:       8 │ + }
@repo/analytics:lint:biome:     9 9 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Some errors were emitted while running checks.

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: [ELIFECYCLE] Command failed with exit code 1.

@repo/core:lint:biome: cache miss, executing 14436d0253e0a52e

@repo/form-builder:lint:biome: cache miss, executing 793f253f0d8d2f3c

@repo/profile:lint:biome: cache miss, executing 511483a57f79f43f

@repo/library:lint:biome: cache miss, executing 9851264e30399cfd

apps-neevsk-web:lint:biome: cache hit, replaying logs 7ffe0ed08df92587

apps-neevsk-web:lint:biome: $ biome check .

apps-neevsk-web:lint:biome: src\components\FlameCard.astro:9:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable title is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      7 │ }
apps-neevsk-web:lint:biome:      8 │ 
apps-neevsk-web:lint:biome:    > 9 │ const { title, description, tags = [], variant = 'blue' } = Astro.props;
apps-neevsk-web:lint:biome:        │         ^^^^^
apps-neevsk-web:lint:biome:     10 │ 
apps-neevsk-web:lint:biome:     11 │ const _variantClass =
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   

apps-neevsk-web:lint:biome: 

apps-neevsk-web:lint:biome: src\components\FlameCard.astro:9:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-neevsk-web:lint:biome: 

apps-neevsk-web:lint:biome:   ! This variable description is unused.

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      7 │ }
apps-neevsk-web:lint:biome:      8 │ 

apps-neevsk-web:lint:biome:    > 9 │ const { title, description, tags = [], variant = 'blue' } = Astro.props;
apps-neevsk-web:lint:biome:        │                ^^^^^^^^^^^
apps-neevsk-web:lint:biome:     10 │ 
apps-neevsk-web:lint:biome:     11 │ const _variantClass =
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\components\FlameCard.astro:9:29 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable tags is unused.
apps-neevsk-web:lint:biome:   

apps-neevsk-web:lint:biome:      7 │ }
apps-neevsk-web:lint:biome:      8 │ 
apps-neevsk-web:lint:biome:    > 9 │ const { title, description, tags = [], variant = 'blue' } = Astro.props;
apps-neevsk-web:lint:biome:        │                             ^^^^
apps-neevsk-web:lint:biome:     10 │ 
apps-neevsk-web:lint:biome:     11 │ const _variantClass =
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\components\common\Button.astro:9:57 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable rest is unused.
apps-neevsk-web:lint:biome:   

apps-neevsk-web:lint:biome:      7 │ }
apps-neevsk-web:lint:biome:      8 │ 
apps-neevsk-web:lint:biome:    > 9 │ const { variant = 'primary', href, class: className, ...rest } = Astro.props;
apps-neevsk-web:lint:biome:        │                                                         ^^^^

apps-neevsk-web:lint:biome:     10 │ const _Tag = href ? 'a' : 'button';
apps-neevsk-web:lint:biome:     11 │ ---
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\components\common\Card.astro:7:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable variant is unused.
apps-neevsk-web:lint:biome:   

apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { variant = 'default', class: className } = Astro.props;
apps-neevsk-web:lint:biome:       │         ^^^^^^^
apps-neevsk-web:lint:biome:     8 │ ---

apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 

apps-neevsk-web:lint:biome: src\components\common\Card.astro:7:37 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable className is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 

apps-neevsk-web:lint:biome:   > 7 │ const { variant = 'default', class: className } = Astro.props;
apps-neevsk-web:lint:biome:       │                                     ^^^^^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   

apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\components\common\Navigation.astro:11:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━

apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable pathname is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      9 │ ];
apps-neevsk-web:lint:biome:     10 │ 
apps-neevsk-web:lint:biome:   > 11 │ const { pathname } = Astro.url;
apps-neevsk-web:lint:biome:        │         ^^^^^^^^
apps-neevsk-web:lint:biome:     12 │ ---
apps-neevsk-web:lint:biome:     13 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\BaseLayout.astro:14:3 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable theme is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     12 │   title = SITE_TITLE,
apps-neevsk-web:lint:biome:     13 │   description = SITE_DESCRIPTION,
apps-neevsk-web:lint:biome:   > 14 │   theme = 'home',
apps-neevsk-web:lint:biome:        │   ^^^^^
apps-neevsk-web:lint:biome:     15 │   image,
apps-neevsk-web:lint:biome:     16 │   noindex = false,
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\DigitalNeonLayout.astro:7:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable title is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │         ^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\DigitalNeonLayout.astro:7:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable description is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │                ^^^^^^^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\LightTechLayout.astro:7:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable title is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │         ^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\LightTechLayout.astro:7:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable description is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │                ^^^^^^^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\NatureLayout.astro:7:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable title is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │         ^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\NatureLayout.astro:7:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable description is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │                ^^^^^^^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\TwilightLayout.astro:7:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable title is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │         ^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\TwilightLayout.astro:7:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable description is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │                ^^^^^^^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\WarmArchiveLayout.astro:7:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable title is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │         ^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\layouts\WarmArchiveLayout.astro:7:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable description is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     5 │ }
apps-neevsk-web:lint:biome:     6 │ 
apps-neevsk-web:lint:biome:   > 7 │ const { title, description } = Astro.props;
apps-neevsk-web:lint:biome:       │                ^^^^^^^^^^^
apps-neevsk-web:lint:biome:     8 │ ---
apps-neevsk-web:lint:biome:     9 │ 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 

apps-neevsk-web:lint:biome: src\pages\archive\[slug].astro:14:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! This variable Content is unused.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     13 │ const { entry } = Astro.props;
apps-neevsk-web:lint:biome:   > 14 │ const { Content } = await render(entry);
apps-neevsk-web:lint:biome:        │         ^^^^^^^
apps-neevsk-web:lint:biome:     15 │ 
apps-neevsk-web:lint:biome:     16 │ const _formatDate = (date: Date) => {
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: Checked 59 files in 94ms. No fixes applied.
apps-neevsk-web:lint:biome: Found 19 warnings.

gurudevi-mobile:lint:biome: cache miss, executing 307bb3dfeb37e8cc

@repo/community:lint:biome: cache miss, executing 69406fb4226ff8fb

@intuitui-labs/lk-edu-geo:lint:biome: cache miss, executing 01851f0fd934641f

@repo/scanner-kit:lint:biome: cache miss, executing bf12168e18b588ed

apps-gurudevi-marketing-web:lint:biome: cache miss, executing b478e4c6a1dd6784

@repo/self:lint:biome: cache miss, executing 5ccec6e541c3ca43

@repo/database:lint:biome: cache miss, executing 16ccf36b1f166fb1

@repo/ui:lint:biome: cache miss, executing c150c10a81922046

@repo/accounting:lint:biome: cache hit, replaying logs b62cfbf257b26a71

@repo/accounting:lint:biome: $ biome check .
@repo/accounting:lint:biome: Checked 9 files in 24ms. No fixes applied.

@repo/graphics:lint:biome: cache miss, executing 449220bc800df20b

@repo/classroom:lint:biome: cache miss, executing 94347ce52dbfc280

@repo/ai:lint:biome: cache miss, executing 8d525f72f4cd2e80

apps-intuitui-web:lint:biome: cache hit, replaying logs e6d04e232eea203a

apps-intuitui-web:lint:biome: $ biome check .
apps-intuitui-web:lint:biome: .astro\content.d.ts:122:23 lint/complexity/noBannedTypes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Don't use '{}' as a type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     120 │     : any;

apps-intuitui-web:lint:biome:     121 │ 
apps-intuitui-web:lint:biome:   > 122 │   type DataEntryMap = {};
apps-intuitui-web:lint:biome:         │                       ^^
apps-intuitui-web:lint:biome:     123 │ 
apps-intuitui-web:lint:biome:     124 │   type ExtractLoaderTypes<T> = T extends import('astro/loaders').LiveLoader<
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i '{}' accepts any non-nullish value, including non-object primitives like '123' and 'true'.
apps-intuitui-web:lint:biome:     - If you want a type meaning "any arbitrary object", use 'object' instead.
apps-intuitui-web:lint:biome:     - If you want a type meaning "any value", use 'unknown' instead.
apps-intuitui-web:lint:biome:     - If you want a type meaning "an object whose properties cannot be used", use '{ [k: keyof any]: never }' or 'Record<keyof any, never>' instead.
apps-intuitui-web:lint:biome:     - If you want a type meaning "an object that cannot contain any properties whatsoever", use '{ [uniqueSymbol]?: never }' with an unexported unique symbol in the same file.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i If that's really what you want, use an inline disable comment.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\components\SystemsGrid.astro:7:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! This variable columns is unused.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     5 │ }
apps-intuitui-web:lint:biome:     6 │ 
apps-intuitui-web:lint:biome:   > 7 │ const { columns = 3, className = '' } = Astro.props;
apps-intuitui-web:lint:biome:       │         ^^^^^^^
apps-intuitui-web:lint:biome:     8 │ ---
apps-intuitui-web:lint:biome:     9 │ 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\components\SystemsGrid.astro:7:22 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! This variable className is unused.

apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     5 │ }
apps-intuitui-web:lint:biome:     6 │ 
apps-intuitui-web:lint:biome:   > 7 │ const { columns = 3, className = '' } = Astro.props;
apps-intuitui-web:lint:biome:       │                      ^^^^^^^^^
apps-intuitui-web:lint:biome:     8 │ ---
apps-intuitui-web:lint:biome:     9 │ 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: Checked 24 files in 49ms. No fixes applied.
apps-intuitui-web:lint:biome: Found 3 warnings.
apps-intuitui-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 

apps-edlove-web:lint:biome: cache miss, executing f8492259da161527

@repo/platform-mcp:lint:biome: cache miss, executing c337010f523a1d2c

@repo/workforce:lint:biome: cache miss, executing 746400ece455bbb1

@repo/people:lint:biome: cache miss, executing 5e49f33ecd239858

@repo/admin:lint:biome: cache miss, executing 6c0a58cabcd112eb

 ERROR  @repo/types-shim#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\types-shim) C:\Users\Naween\AppData\Local\mise\installs\pnpm\11.3.0\pnpm.exe run lint:biome exited (1)


 Tasks:    3 successful, 26 total
Cached:    3 cached, 26 total
  Time:    2.837s 

Failed:    @repo/types-shim#lint:biome


 ERROR  run failed: command  exited (1)

[ELIFECYCLE] Command failed with exit code 1.

$ node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types --concurrency=3" --log "reports/check-types.txt"

>>> Starting Sovereign Audit: 2026-06-08T18:07:25.579Z

>>> Command: pnpm turbo run check-types --concurrency=3

--------------------------------------------------------------------------------

• turbo 2.9.14


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile

   • Running check-types in 32 packages
   • Remote caching disabled


@repo/schema:check-types: cache hit, replaying logs c96e16020a51c9f3
@intuitui-labs/form-builder-engine:check-types: cache hit, replaying logs 14b7043483f27423

apps-neevsk-web:check-types: cache hit, replaying logs 758654305c6835f5

@intuitui-labs/form-builder-engine:check-types: $ tsc --noEmit

apps-neevsk-web:check-types: $ pnpm exec tsc --noEmit

@repo/schema:check-types: $ pnpm exec tsc --noEmit

apps-edlove-web:check-types: cache hit, replaying logs 96769ad77cbd44dc

apps-intuitui-web:check-types: cache hit, replaying logs eb2b43f15836ea55

apps-edlove-web:check-types: $ pnpm exec tsc --noEmit

@repo/types-shim:check-types: cache hit, replaying logs 1f3ea715a6cd5353

apps-intuitui-web:check-types: $ pnpm exec tsc --noEmit

@repo/types-shim:check-types: $ pnpm exec tsc --noEmit

@repo/platform-mcp:check-types: cache hit, replaying logs 5f8e3a1f583b90c9

@repo/platform-mcp:check-types: $ pnpm exec tsc --noEmit

@repo/database:check-types: cache hit, replaying logs 2e0a8d4881e78dd3

@repo/database:check-types: $ pnpm exec tsc --noEmit

@repo/core:check-types: cache miss, executing 81e02eabd40f668c

@repo/core:check-types: $ pnpm exec tsc --noEmit

@repo/core:check-types: error TS6059: File 'C:/Users/Naween/projects/polymath-platform/packages/core/vitest.config.ts' is not under 'rootDir' 'C:/Users/Naween/projects/polymath-platform/packages/core/src'. 'rootDir' is expected to contain all source files.
@repo/core:check-types:   The file is in the program because:
@repo/core:check-types:     Matched by include pattern 'vitest.config.ts' in 'C:/Users/Naween/projects/polymath-platform/packages/core/tsconfig.json'

@repo/core:check-types: [ELIFECYCLE] Command failed with exit code 2.

 ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Local\mise\installs\pnpm\11.3.0\pnpm.exe run check-types exited (2)


 Tasks:    8 successful, 9 total
Cached:    8 cached, 9 total
  Time:    11.731s 
Failed:    @repo/core#check-types


 ERROR  run failed: command  exited (2)


--------------------------------------------------------------------------------
AUDIT SUMMARY
Duration: 13.6s
Findings: 3

Log File: reports/check-types.txt
--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

$ node ./scripts/check-hygiene.mjs


>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---

$ node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"

>>> Starting Sovereign Audit: 2026-06-08T18:07:41.432Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-circular
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orp
hans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
  warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
  warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/navigation/deprecatedNavigation.ts
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/app/(tabs)/_layout.tsx
  warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
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
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

x 73 dependency violations (0 errors, 73 warnings). 2150 modules, 6664 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 15.5s

Findings: 0

Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

--- Checking Unused Code ---

$ node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"

>>> Starting Sovereign Audit: 2026-06-08T18:07:57.892Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-orphans

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orp
hans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
  warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
  warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/navigation/deprecatedNavigation.ts
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/app/(tabs)/_layout.tsx
  warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
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
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

x 73 dependency violations (0 errors, 73 warnings). 2150 modules, 6664 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 11.1s
Findings: 70

Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---

$ node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"

>>> Starting Sovereign Audit: 2026-06-08T18:08:10.022Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orp
hans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
  warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
  warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/navigation/deprecatedNavigation.ts
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/app/(tabs)/_layout.tsx
  warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
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
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

x 73 dependency violations (0 errors, 73 warnings). 2150 modules, 6664 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 11.6s
Findings: 74

Log File: reports/architecture.txt

--------------------------------------------------------------------------------

--- Checking Schema Drift Alignment ---

$ node scripts/check-schema-drift.mjs

[35m======================================================================[0m

[35m⚖️  Sovereign Deep Schema Alignment & Symmetric Auditor[0m

[35m======================================================================[0m

[36m
1. Type Sync (ZenStack .zmodel ──> Generated TypeScript Types):[0m

   - schema.zmodel   : 2026-06-08T12:28:39.384Z [schema.zmodel]

   - generated types : 2026-06-08T12:28:39.384Z [models.ts]

   [32m✅ PERFECT SYNC: Generated types match schema.zmodel perfectly.[0m

[36m
2. Symmetric Entity Coverage (ZenStack Models <──> Cedar Policy Entities):[0m

   - Aligned / Documented Entities  : 21

   - Cedar Mismatches (Anomalies)   : 0

   - Unprotected Database Models    : 14

   [33m⚠️  DEVELOPER ADVISORY: Models defined in Database but not guarded by Cedar:[0m

     - [33mUserPreferences[0m (Make sure access is handled transitively under parent structures, or add to Cedar)
     - [33mLibraryResource[0m (Make sure access is handled transitively under parent structures, or add to Cedar)

     - [33mLibraryCollection[0m (Make sure access is handled transitively under parent structures, or add to Cedar)
     - [33mResourceEngagement[0m (Make sure access is handled transitively under parent structures, or add to Cedar)

     - [33mThuthimalGift[0m (Make sure access is handled transitively under parent structures, or add to Cedar)
     - [33mImpactRipple[0m (Make sure access is handled transitively under parent structures, or add to Cedar)

     - [33mWhisperedMoment[0m (Make sure access is handled transitively under parent structures, or add to Cedar)

     - [33mGrowthEvent[0m (Make sure access is handled transitively under parent structures, or add to Cedar)

     - [33mUserGrowthState[0m (Make sure access is handled transitively under parent structures, or add to Cedar)

     - [33mSanctuaryManifesto[0m (Make sure access is handled transitively under parent structures, or add to Cedar)
     - [33mFinancialTransaction[0m (Make sure access is handled transitively under parent structures, or add to Cedar)

     - [33mClassroomNote[0m (Make sure access is handled transitively under parent structures, or add to Cedar)
     - [33mStudentLongitudinalEvent[0m (Make sure access is handled transitively under parent structures, or add to Cedar)
     - [33mFeatureFlag[0m (Make sure access is handled transitively under parent structures, or add to Cedar)
[36m
3. Granular Attribute-Level Type & Requirement Verification:[0m

     [33m💡 UNMAPPED COLUMNS:[0m Database model "User" has fields not declared in Cedar: [display_name, first_name, last_name, identity_state, index_number, nic_number, public_profile, profile_completed, is_anonymous, citizenship, pricing_tier, experience_years, subjects_taught, qualifications, tenant_kind, onboarding_completed, onboarding_completed_at]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "School" has fields not declared in Cedar: [name, handle, status, type, tenant_kind, official_type, province_id, district_id, city, address, student_type, religious_affiliation, student_count]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Classroom" has fields not declared in Cedar: [name, handle, subject, description, color_theme, syllabus_version, is_archived, academic_year]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "AttendanceRecord" has fields not declared in Cedar: [status, date, occurred_at, academic_cycle_id]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Grade" has fields not declared in Cedar: [assignment_id, marks, grade, gpa, feedback, publication_state, published_at, published_by, publication_action]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Assignment" has fields not declared in Cedar: [title, description, lesson_id, due_date, max_points]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Lesson" has fields not declared in Cedar: [title, content, order_index, published_at]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Material" has fields not declared in Cedar: [lesson_id, title, type, url, content, is_pinned]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "StaffLeave" has fields not declared in Cedar: [leave_type, start_date, end_date, reason, status, reviewed_by, reviewed_at]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "MoodLog" has fields not declared in Cedar: [mood_score, mood, note]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "FireJournalEntry" has fields not declared in Cedar: [content_preview, is_burned]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "InventoryItem" has fields not declared in Cedar: [name, category, quantity, condition]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Group" has fields not declared in Cedar: [name, description, type, visibility, join_policy, is_public]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Post" has fields not declared in Cedar: [group_id, content, post_type, visibility, author_tier, media_url, media_type]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "LedgerEntry" has fields not declared in Cedar: [transaction_id, account_id, amount, side, description]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "Guardian" has fields not declared in Cedar: [relationship_type, contact_info, verification_status, custody_info, emergency_contact]

     [33m💡 UNMAPPED COLUMNS:[0m Database model "SentinelAuditLog" has fields not declared in Cedar: [action, resource_type, resource_id, details]

   - Attribute Drift Errors      : 0
   - Attribute Security Warnings : 0
[36m
4. Live Database Schema Parity Audit (schema.zmodel <──> PostgreSQL DB):[0m

   [33m⚠️  WARNING: Failed to execute database parity audit due to connection or pg library error (skipped):[0m Cannot find package 'pg' imported from C:\Users\Naween\projects\polymath-platform\scripts\check-schema-drift.mjs
[36m
5. API Gateway Schema Parity Audit (ZModel <──> identity.schema.json):[0m

   - API Gateway Drift Errors     : 0
   - API Gateway Drift Warnings   : 0
[36m
6. Large-Scale Domain Divergence Hotspots Leaderboard:[0m

   [32m✅ PERFECT PARITY: All domains are fully synchronized with 0 divergence weight.[0m
[36m
7. High-Insight Logical Statistics Dashboard:[0m

   ┌──────────────────────────────────────────┬────────────────────┐
   │ Metric Dimension                         │ Value / Count      │
   ├──────────────────────────────────────────┼────────────────────┤

   │ Database Models (schema.zmodel)          │ 51                 │
   │ Logical Core Entities (Excluding Relational)│ 32                 │
   │ Cedar Policy Entities                    │ 21                 │
   │ Model Security Coverage Ratio            │ 66%                │
   ├──────────────────────────────────────────┼────────────────────┤
   │ Total Database Variables / Columns       │ 502                │
   │ Total Cedar Guarded Attributes           │ 76                 │
   │ Dynamic Virtual/Derived Context Variables│ 20                 │

   │ Granular Attribute Alignment Ratio       │ 88%                │
   └──────────────────────────────────────────┴────────────────────┘

   [36mRequirement & Optionality Distribution:[0m

   - Postgres DB Schema: [██████████████████░░░░░░░] 71% Required / 29% Nullable
   - Cedar Auth Schema : [███████░░░░░░░░░░░░░░░░░░] 28% Required / 72% Optional

[35m======================================================================[0m
[35m⚖️  Audit Complete[0m
[35m======================================================================[0m

[32m✅ Audit Passed. All layers are in complete, secure structural alignment![0m



✅ All hygiene checks passed!

$ node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"

>>> Starting Sovereign Audit: 2026-06-08T18:08:23.720Z

>>> Command: node scripts/check-identity-alignment.mjs

--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 1.85s. Found 0 potential alignment issues.


[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 2.6s
Findings: 0
Log File: reports/identity_check.txt

--------------------------------------------------------------------------------

$ pnpm run i18n:audit && pnpm run i18n:no-inline-fallbacks

$ node scripts/i18n/audit-keys.mjs

✅ i18n audit passed: all used t(...) keys exist in en/si/ta locales.

$ node scripts/i18n/check-inline-fallbacks.js

No inline i18n fallback defaults found.

```
