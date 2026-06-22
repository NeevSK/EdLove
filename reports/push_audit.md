# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 6/22/2026, 8:11:33 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check
> **Duration:** 121.7s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 36 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 99 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 6 |
| packages/analytics | 21 |
| packages/core | 27 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 3 |
| packages/scanner-kit | 3 |
| packages/self | 3 |
| packages/trube-art | 3 |
| packages/ui | 36 |

## Detailed Findings

### Category: General
- @rn-terrain/core:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- apps-edlove-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- apps-neevsk-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/platform-mcp:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @intuitui-labs/form-builder-engine:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/types-shim:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/schema:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- apps-intuitui-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @rn-terrain/cli:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @rn-terrain/mcp:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/database:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/core:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ui:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/accounting:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @intuitui-labs/lk-edu-geo:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/scanner-kit:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/people:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/form-builder:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/ai:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/workforce:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/payments:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/graphics:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/profile:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/library:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/analytics:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/self:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- apps-gurudevi-marketing-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/community:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/admin:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- @repo/classroom:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- gurudevi-mobile:check-types: Findings: 0 (Errors: 0, Warnings: 0)
- x 86 dependency violations (0 errors, 86 warnings). 2214 modules, 6670 dependencies cruised.
- x 86 dependency violations (0 errors, 86 warnings). 2214 modules, 6670 dependencies cruised.
- x 86 dependency violations (0 errors, 86 warnings). 2214 modules, 6670 dependencies cruised.
- [ERR_PNPM_NO_SCRIPT] Missing script: check:schema-drift
- Findings: 1 (Errors: 1, Warnings: 0)

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
- warn no-orphans: apps/gurudevi-mobile/src/utils/useWebPageTitle.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/performance/AppPerformance.test.tsx
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/CommandPalette.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/WASQLiteDB.umd.js
- warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/SharedSyncImplementation.umd.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx → packages/core/src/index.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/useWebPageTitle.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/performance/AppPerformance.test.tsx
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/CommandPalette.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/WASQLiteDB.umd.js
- warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/SharedSyncImplementation.umd.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx → packages/core/src/index.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-sqlite-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-react-native-mock.ts
- warn no-orphans: apps/gurudevi-mobile/vitest-expo-modules-core-mock.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/useWebPageTitle.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/performance/AppPerformance.test.tsx
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/CommandPalette.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/WASQLiteDB.umd.js
- warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/SharedSyncImplementation.umd.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/app/(modal)/_layout.tsx
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx → packages/core/src/index.ts

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
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.native.ts → packages/core/src/index.ts
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.native.ts → packages/core/src/index.ts
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.native.ts → packages/core/src/index.ts

### Category: packages/core
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/store/usePermissionStore.web.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/adapters/powersync/wasqlite.shim.ts
- warn no-orphans: packages/core/src/adapters/powersync/opsqlite.shim.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/store/usePermissionStore.web.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/adapters/powersync/wasqlite.shim.ts
- warn no-orphans: packages/core/src/adapters/powersync/opsqlite.shim.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/store/usePermissionStore.web.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/adapters/powersync/wasqlite.shim.ts
- warn no-orphans: packages/core/src/adapters/powersync/opsqlite.shim.ts

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
- warn no-orphans: packages/ui/src/components/SanctuaryVirtualTable.web.tsx
- warn no-orphans: packages/ui/src/components/SanctuaryT
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/jest-setup.ts
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components/SanctuaryVirtualTable.web.tsx
- warn no-orphans: packages/ui/src/components/SanctuaryT
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/jest-setup.ts
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components/SanctuaryVirtualTable.web.tsx
- warn no-orphans: packages/ui/src/components/SanctuaryT
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/jest-setup.ts

## Raw Output

```text
$ node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"

>>> Starting Sovereign Audit: 2026-06-22T14:39:43.580Z

>>> Command: pnpm turbo run check-types

--------------------------------------------------------------------------------

>>> Executing sub-command: pnpm turbo run check-types

• turbo 2.9.17



   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, @rn-terrain/cli, @rn-terrain/core, @rn-terrain/mcp, @rn-terrain/vscode, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 36 packages
   • Remote caching disabled


apps-neevsk-web:check-types: cache hit, replaying logs 87ddd6bd5620d9ba
apps-edlove-web:check-types: cache hit, replaying logs 67df6efc67d77f27

@rn-terrain/core:check-types: cache hit, replaying logs 6ac69c0b3148bf8a
@intuitui-labs/form-builder-engine:check-types: cache hit, replaying logs 1b50248abb85d6ad
@repo/schema:check-types: cache hit, replaying logs 5693b17fb7b3dc7f
@repo/platform-mcp:check-types: cache hit, replaying logs 6e8ac3c0240dc245

@repo/types-shim:check-types: cache hit, replaying logs 6d550781c1632f31

apps-intuitui-web:check-types: cache hit, replaying logs a110311ed98a21bf

@rn-terrain/core:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_rn-terrain-core-check-types"
@rn-terrain/core:check-types: >>> Starting Process: 6/22/2026, 7:27:45 PM (IST)
@rn-terrain/core:check-types: >>> Command: pnpm exec tsc --noEmit
@rn-terrain/core:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\rn-terrain-core
@rn-terrain/core:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-core-check-types.log
@rn-terrain/core:check-types: --------------------------------------------------------------------------------
@rn-terrain/core:check-types: 
@rn-terrain/core:check-types: --------------------------------------------------------------------------------
@rn-terrain/core:check-types: REPORT SUMMARY
apps-edlove-web:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "apps_edlove-web-check-types"
@rn-terrain/core:check-types: Duration: 8.5 seconds
apps-edlove-web:check-types: >>> Starting Process: 6/22/2026, 7:27:45 PM (IST)
@rn-terrain/core:check-types: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:check-types: >>> Command: pnpm exec tsc --noEmit
@rn-terrain/core:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-core-check-types.log

apps-edlove-web:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-apps_edlove-web-check-types.log
apps-edlove-web:check-types: --------------------------------------------------------------------------------
@rn-terrain/core:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-core-check-types-report.txt
@rn-terrain/core:check-types: --------------------------------------------------------------------------------
@repo/platform-mcp:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_platform-mcp-check-types"
@repo/platform-mcp:check-types: >>> Starting Process: 6/22/2026, 7:27:45 PM (IST)
apps-neevsk-web:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "apps_neevsk-web-check-types"
@repo/platform-mcp:check-types: >>> Command: pnpm exec tsc --noEmit
apps-neevsk-web:check-types: >>> Starting Process: 6/22/2026, 7:27:45 PM (IST)
apps-edlove-web:check-types: 
apps-edlove-web:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: REPORT SUMMARY
@repo/platform-mcp:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\platform-mcp
@repo/platform-mcp:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_platform-mcp-check-types.log
apps-neevsk-web:check-types: >>> Command: pnpm exec tsc --noEmit

apps-neevsk-web:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-apps_neevsk-web-check-types.log
@intuitui-labs/form-builder-engine:check-types: $ node ../../scripts/run-and-report.mjs --cmd "tsc --noEmit" --name "packages_form-builder-engine-check-types"
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
@intuitui-labs/form-builder-engine:check-types: >>> Starting Process: 6/22/2026, 7:29:11 PM (IST)
apps-neevsk-web:check-types: 
@intuitui-labs/form-builder-engine:check-types: >>> Command: tsc --noEmit
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
@intuitui-labs/form-builder-engine:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\form-builder-engine
@intuitui-labs/form-builder-engine:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_form-builder-engine-check-types.log
apps-edlove-web:check-types: Duration: 12.1 seconds
apps-edlove-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
apps-edlove-web:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-apps_edlove-web-check-types.log
@repo/types-shim:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_types-shim-check-types"
@repo/types-shim:check-types: >>> Starting Process: 6/22/2026, 7:27:45 PM (IST)
@repo/types-shim:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/types-shim:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_types-shim-check-types.log
apps-neevsk-web:check-types: REPORT SUMMARY
@repo/schema:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_schema-check-types"
@repo/platform-mcp:check-types: --------------------------------------------------------------------------------
apps-neevsk-web:check-types: Duration: 13.6 seconds

@intuitui-labs/form-builder-engine:check-types: --------------------------------------------------------------------------------
@repo/schema:check-types: >>> Starting Process: 6/22/2026, 7:29:11 PM (IST)
@intuitui-labs/form-builder-engine:check-types: 
@repo/schema:check-types: >>> Command: pnpm exec tsc --noEmit
@intuitui-labs/form-builder-engine:check-types: --------------------------------------------------------------------------------
apps-edlove-web:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-apps_edlove-web-check-types-report.txt
apps-neevsk-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@intuitui-labs/form-builder-engine:check-types: REPORT SUMMARY
@repo/types-shim:check-types: --------------------------------------------------------------------------------
@repo/schema:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\schema
@repo/platform-mcp:check-types: 
@repo/schema:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_schema-check-types.log
@repo/platform-mcp:check-types: --------------------------------------------------------------------------------
@repo/schema:check-types: --------------------------------------------------------------------------------
@repo/platform-mcp:check-types: REPORT SUMMARY
@repo/schema:check-types: 
@repo/platform-mcp:check-types: Duration: 10.6 seconds
@repo/platform-mcp:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/platform-mcp:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_platform-mcp-check-types.log
apps-neevsk-web:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-apps_neevsk-web-check-types.log
apps-neevsk-web:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-apps_neevsk-web-check-types-report.txt
apps-neevsk-web:check-types: --------------------------------------------------------------------------------
@repo/types-shim:check-types: 
@repo/types-shim:check-types: --------------------------------------------------------------------------------
@repo/types-shim:check-types: REPORT SUMMARY
@intuitui-labs/form-builder-engine:check-types: Duration: 1.4 seconds

@intuitui-labs/form-builder-engine:check-types: Findings: 0 (Errors: 0, Warnings: 0)
apps-intuitui-web:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "apps_intuitui-web-check-types"
@intuitui-labs/form-builder-engine:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_form-builder-engine-check-types.log
apps-intuitui-web:check-types: >>> Starting Process: 6/22/2026, 7:27:45 PM (IST)
apps-intuitui-web:check-types: >>> Command: pnpm exec tsc --noEmit
apps-intuitui-web:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
@repo/platform-mcp:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_platform-mcp-check-types-report.txt
@repo/platform-mcp:check-types: --------------------------------------------------------------------------------
@repo/types-shim:check-types: Duration: 4.8 seconds
@repo/types-shim:check-types: Findings: 0 (Errors: 0, Warnings: 0)

@repo/types-shim:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_types-shim-check-types.log
@repo/types-shim:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_types-shim-check-types-report.txt
@repo/schema:check-types: --------------------------------------------------------------------------------
@repo/schema:check-types: REPORT SUMMARY
@repo/schema:check-types: Duration: 2.5 seconds
@intuitui-labs/form-builder-engine:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_form-builder-engine-check-types-report.txt
@intuitui-labs/form-builder-engine:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-apps_intuitui-web-check-types.log

apps-intuitui-web:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: 
apps-edlove-web:check-types: --------------------------------------------------------------------------------
@repo/types-shim:check-types: --------------------------------------------------------------------------------
@repo/schema:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/schema:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_schema-check-types.log
@repo/schema:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_schema-check-types-report.txt

apps-intuitui-web:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: REPORT SUMMARY
@repo/schema:check-types: --------------------------------------------------------------------------------
apps-intuitui-web:check-types: Duration: 11.7 seconds
apps-intuitui-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
apps-intuitui-web:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-apps_intuitui-web-check-types.log
apps-intuitui-web:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-apps_intuitui-web-check-types-report.txt
apps-intuitui-web:check-types: --------------------------------------------------------------------------------

@rn-terrain/cli:check-types: cache hit, replaying logs e19b6159561f3d8f

@rn-terrain/mcp:check-types: cache hit, replaying logs f591ac6e162c846a

@repo/database:check-types: cache hit, replaying logs 024e8f540a763ba3

@rn-terrain/cli:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_rn-terrain-cli-check-types"
@rn-terrain/cli:check-types: >>> Starting Process: 6/22/2026, 7:27:56 PM (IST)
@rn-terrain/cli:check-types: >>> Command: pnpm exec tsc --noEmit

@rn-terrain/mcp:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_rn-terrain-mcp-check-types"
@rn-terrain/cli:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\rn-terrain-cli
@rn-terrain/mcp:check-types: >>> Starting Process: 6/22/2026, 7:27:56 PM (IST)
@rn-terrain/cli:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-cli-check-types.log
@rn-terrain/mcp:check-types: >>> Command: pnpm exec tsc --noEmit
@rn-terrain/cli:check-types: --------------------------------------------------------------------------------
@rn-terrain/cli:check-types: 
@rn-terrain/cli:check-types: --------------------------------------------------------------------------------
@rn-terrain/mcp:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\rn-terrain-mcp
@rn-terrain/cli:check-types: REPORT SUMMARY
@rn-terrain/mcp:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-mcp-check-types.log
@rn-terrain/cli:check-types: Duration: 5.7 seconds
@rn-terrain/mcp:check-types: --------------------------------------------------------------------------------
@rn-terrain/cli:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@rn-terrain/mcp:check-types: 
@rn-terrain/cli:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-cli-check-types.log
@rn-terrain/mcp:check-types: --------------------------------------------------------------------------------
@rn-terrain/cli:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-cli-check-types-report.txt
@rn-terrain/cli:check-types: --------------------------------------------------------------------------------
@rn-terrain/mcp:check-types: REPORT SUMMARY
@rn-terrain/mcp:check-types: Duration: 6.5 seconds
@rn-terrain/mcp:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@rn-terrain/mcp:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-mcp-check-types.log
@rn-terrain/mcp:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_rn-terrain-mcp-check-types-report.txt
@rn-terrain/mcp:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_database-check-types"
@repo/database:check-types: >>> Starting Process: 6/22/2026, 7:29:14 PM (IST)
@repo/database:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/database:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_database-check-types.log
@repo/database:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: 
@repo/database:check-types: --------------------------------------------------------------------------------
@repo/database:check-types: REPORT SUMMARY
@repo/database:check-types: Duration: 2.3 seconds
@repo/database:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/database:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_database-check-types.log
@repo/database:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_database-check-types-report.txt
@repo/database:check-types: --------------------------------------------------------------------------------

@repo/core:check-types: cache hit, replaying logs 7c966a167463ff05

@repo/core:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_core-check-types"
@repo/core:check-types: >>> Starting Process: 6/22/2026, 7:43:25 PM (IST)
@repo/core:check-types: >>> Command: pnpm exec tsc --noEmit

@repo/core:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_core-check-types.log
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: 
@repo/core:check-types: --------------------------------------------------------------------------------
@repo/core:check-types: REPORT SUMMARY
@repo/core:check-types: Duration: 6.0 seconds
@repo/core:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/core:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_core-check-types.log
@repo/core:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_core-check-types-report.txt
@repo/core:check-types: --------------------------------------------------------------------------------

@repo/ui:check-types: cache hit, replaying logs 90c3beed58b97454

@repo/ui:check-types: $ node ../../scripts/run-and-report.mjs --cmd "node --max-old-space-size=4096 ../../node_modules/typescript/bin/tsc --noEmit" --name "packages_ui-check-types"
@repo/ui:check-types: >>> Starting Process: 6/22/2026, 7:43:33 PM (IST)
@repo/ui:check-types: >>> Command: node --max-old-space-size=4096 ../../node_modules/typescript/bin/tsc --noEmit

@repo/ui:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_ui-check-types.log
@repo/ui:check-types: --------------------------------------------------------------------------------
@repo/ui:check-types: 
@repo/ui:check-types: --------------------------------------------------------------------------------
@repo/ui:check-types: REPORT SUMMARY
@repo/ui:check-types: Duration: 8.5 seconds
@repo/ui:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/ui:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_ui-check-types.log
@repo/ui:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_ui-check-types-report.txt
@repo/ui:check-types: --------------------------------------------------------------------------------

@repo/accounting:check-types: cache hit, replaying logs 29b284b5ea2a069c

@intuitui-labs/lk-edu-geo:check-types: cache hit, replaying logs 995933a13c0bb73b

@repo/accounting:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_accounting-check-types"
@repo/accounting:check-types: >>> Starting Process: 6/22/2026, 7:43:33 PM (IST)
@repo/accounting:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/accounting:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\accounting

@repo/accounting:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_accounting-check-types.log
@repo/accounting:check-types: --------------------------------------------------------------------------------
@repo/accounting:check-types: 
@repo/accounting:check-types: --------------------------------------------------------------------------------
@repo/accounting:check-types: REPORT SUMMARY
@repo/accounting:check-types: Duration: 18.6 seconds
@repo/accounting:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/accounting:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_accounting-check-types.log
@repo/accounting:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_accounting-check-types-report.txt
@repo/accounting:check-types: --------------------------------------------------------------------------------

@intuitui-labs/lk-edu-geo:check-types: $ node ../../scripts/run-and-report.mjs --cmd "node --max-old-space-size=4096 ../../node_modules/typescript/bin/tsc --noEmit" --name "packages_lk-edu-geo-check-types"
@intuitui-labs/lk-edu-geo:check-types: >>> Starting Process: 6/22/2026, 7:43:33 PM (IST)
@intuitui-labs/lk-edu-geo:check-types: >>> Command: node --max-old-space-size=4096 ../../node_modules/typescript/bin/tsc --noEmit

@intuitui-labs/lk-edu-geo:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_lk-edu-geo-check-types.log
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------
@intuitui-labs/lk-edu-geo:check-types: REPORT SUMMARY
@intuitui-labs/lk-edu-geo:check-types: Duration: 8.0 seconds
@intuitui-labs/lk-edu-geo:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@intuitui-labs/lk-edu-geo:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_lk-edu-geo-check-types.log
@intuitui-labs/lk-edu-geo:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_lk-edu-geo-check-types-report.txt
@intuitui-labs/lk-edu-geo:check-types: --------------------------------------------------------------------------------

@repo/scanner-kit:check-types: cache hit, replaying logs 14e4b184ef0ef459

@repo/people:check-types: cache hit, replaying logs 80fcabf595d82fb2

@repo/scanner-kit:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_scanner-kit-check-types"
@repo/scanner-kit:check-types: >>> Starting Process: 6/22/2026, 7:43:44 PM (IST)
@repo/scanner-kit:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/scanner-kit:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\scanner-kit
@repo/scanner-kit:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_scanner-kit-check-types.log
@repo/scanner-kit:check-types: --------------------------------------------------------------------------------
@repo/scanner-kit:check-types: 

@repo/scanner-kit:check-types: --------------------------------------------------------------------------------
@repo/scanner-kit:check-types: REPORT SUMMARY
@repo/scanner-kit:check-types: Duration: 31.9 seconds
@repo/scanner-kit:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/scanner-kit:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_scanner-kit-check-types.log
@repo/scanner-kit:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_scanner-kit-check-types-report.txt
@repo/scanner-kit:check-types: --------------------------------------------------------------------------------

@repo/form-builder:check-types: cache hit, replaying logs bae8f106261f6264

@repo/ai:check-types: cache hit, replaying logs eba3dfe0df03a355

@repo/people:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_people-check-types"
@repo/people:check-types: >>> Starting Process: 6/22/2026, 7:43:43 PM (IST)
@repo/people:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/people:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_people-check-types.log

@repo/people:check-types: --------------------------------------------------------------------------------
@repo/people:check-types: 
@repo/people:check-types: --------------------------------------------------------------------------------
@repo/people:check-types: REPORT SUMMARY
@repo/people:check-types: Duration: 30.9 seconds
@repo/people:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/people:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_people-check-types.log
@repo/people:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_people-check-types-report.txt
@repo/people:check-types: --------------------------------------------------------------------------------

@repo/form-builder:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_form-builder-check-types"
@repo/form-builder:check-types: >>> Starting Process: 6/22/2026, 7:43:43 PM (IST)
@repo/form-builder:check-types: >>> Command: pnpm exec tsc --noEmit

@repo/form-builder:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_form-builder-check-types.log
@repo/form-builder:check-types: --------------------------------------------------------------------------------
@repo/form-builder:check-types: 
@repo/form-builder:check-types: --------------------------------------------------------------------------------
@repo/form-builder:check-types: REPORT SUMMARY
@repo/form-builder:check-types: Duration: 13.9 seconds
@repo/form-builder:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/form-builder:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_form-builder-check-types.log
@repo/form-builder:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_form-builder-check-types-report.txt
@repo/form-builder:check-types: --------------------------------------------------------------------------------

@repo/workforce:check-types: cache hit, replaying logs 50cae976511a8382

@repo/ai:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_ai-check-types"
@repo/payments:check-types: cache hit, replaying logs 94b2c1d53bd8f48a
@repo/ai:check-types: >>> Starting Process: 6/22/2026, 7:43:43 PM (IST)

@repo/ai:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/ai:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_ai-check-types.log
@repo/ai:check-types: --------------------------------------------------------------------------------
@repo/ai:check-types: 
@repo/ai:check-types: --------------------------------------------------------------------------------
@repo/ai:check-types: REPORT SUMMARY
@repo/ai:check-types: Duration: 31.5 seconds
@repo/ai:check-types: Findings: 0 (Errors: 0, Warnings: 0)

@repo/ai:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_ai-check-types.log
@repo/ai:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_ai-check-types-report.txt
@repo/ai:check-types: --------------------------------------------------------------------------------

@repo/payments:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_payments-check-types"
@repo/workforce:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_workforce-check-types"
@repo/payments:check-types: >>> Starting Process: 6/22/2026, 7:43:54 PM (IST)

@repo/workforce:check-types: >>> Starting Process: 6/22/2026, 7:43:43 PM (IST)
@repo/payments:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/workforce:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/payments:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/workforce:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/payments:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_payments-check-types.log
@repo/workforce:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_workforce-check-types.log
@repo/payments:check-types: --------------------------------------------------------------------------------
@repo/workforce:check-types: --------------------------------------------------------------------------------
@repo/payments:check-types: 
@repo/workforce:check-types: 
@repo/payments:check-types: --------------------------------------------------------------------------------
@repo/workforce:check-types: --------------------------------------------------------------------------------
@repo/payments:check-types: REPORT SUMMARY
@repo/payments:check-types: Duration: 23.6 seconds
@repo/workforce:check-types: REPORT SUMMARY
@repo/workforce:check-types: Duration: 24.9 seconds
@repo/workforce:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/workforce:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_workforce-check-types.log
@repo/workforce:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_workforce-check-types-report.txt

@repo/workforce:check-types: --------------------------------------------------------------------------------
@repo/payments:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/payments:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_payments-check-types.log
@repo/payments:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_payments-check-types-report.txt
@repo/payments:check-types: --------------------------------------------------------------------------------

@repo/graphics:check-types: cache hit, replaying logs e0f8019e7cdc9eca

@repo/profile:check-types: cache hit, replaying logs 8f9b42869b1b5ff4

@repo/graphics:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_graphics-check-types"
@repo/graphics:check-types: >>> Starting Process: 6/22/2026, 7:45:55 PM (IST)
@repo/graphics:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/graphics:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\graphics

@repo/graphics:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_graphics-check-types.log
@repo/graphics:check-types: --------------------------------------------------------------------------------
@repo/graphics:check-types: 
@repo/graphics:check-types: --------------------------------------------------------------------------------
@repo/graphics:check-types: REPORT SUMMARY
@repo/graphics:check-types: Duration: 8.7 seconds
@repo/graphics:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/graphics:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_graphics-check-types.log
@repo/graphics:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_graphics-check-types-report.txt
@repo/graphics:check-types: --------------------------------------------------------------------------------
@repo/profile:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_profile-check-types"
@repo/profile:check-types: >>> Starting Process: 6/22/2026, 7:44:17 PM (IST)
@repo/profile:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/profile:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_profile-check-types.log
@repo/profile:check-types: --------------------------------------------------------------------------------
@repo/profile:check-types: 
@repo/profile:check-types: --------------------------------------------------------------------------------
@repo/profile:check-types: REPORT SUMMARY
@repo/profile:check-types: Duration: 20.1 seconds
@repo/profile:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/profile:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_profile-check-types.log
@repo/profile:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_profile-check-types-report.txt
@repo/profile:check-types: --------------------------------------------------------------------------------

@repo/library:check-types: cache hit, replaying logs 0cdf5f33a04fbdad

@repo/analytics:check-types: cache hit, replaying logs 155f4782f596f9d3

@repo/library:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_library-check-types"
@repo/library:check-types: >>> Starting Process: 6/22/2026, 7:46:04 PM (IST)
@repo/library:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/library:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\library

@repo/library:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_library-check-types.log
@repo/library:check-types: --------------------------------------------------------------------------------
@repo/library:check-types: 
@repo/library:check-types: --------------------------------------------------------------------------------
@repo/library:check-types: REPORT SUMMARY
@repo/library:check-types: Duration: 18.9 seconds
@repo/library:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/library:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_library-check-types.log
@repo/library:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_library-check-types-report.txt
@repo/library:check-types: --------------------------------------------------------------------------------
@repo/self:check-types: cache hit, replaying logs 958269e0e7952dec

@repo/analytics:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_analytics-check-types"
@repo/analytics:check-types: >>> Starting Process: 6/22/2026, 7:46:04 PM (IST)
@repo/analytics:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/analytics:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\analytics

@repo/analytics:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_analytics-check-types.log
@repo/analytics:check-types: --------------------------------------------------------------------------------
@repo/analytics:check-types: 
@repo/analytics:check-types: --------------------------------------------------------------------------------
@repo/analytics:check-types: REPORT SUMMARY
@repo/analytics:check-types: Duration: 6.2 seconds
@repo/analytics:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/analytics:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_analytics-check-types.log
@repo/analytics:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_analytics-check-types-report.txt

@repo/analytics:check-types: --------------------------------------------------------------------------------

@repo/self:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_self-check-types"
@repo/self:check-types: >>> Starting Process: 6/22/2026, 7:45:55 PM (IST)
@repo/self:check-types: >>> Command: pnpm exec tsc --noEmit

@repo/self:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_self-check-types.log
@repo/self:check-types: --------------------------------------------------------------------------------
@repo/self:check-types: 
@repo/self:check-types: --------------------------------------------------------------------------------
@repo/self:check-types: REPORT SUMMARY
@repo/self:check-types: Duration: 8.6 seconds
@repo/self:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/self:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_self-check-types.log
@repo/self:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_self-check-types-report.txt
@repo/self:check-types: --------------------------------------------------------------------------------

apps-gurudevi-marketing-web:check-types: cache hit, replaying logs dd66853db622019c

apps-gurudevi-marketing-web:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "apps_gurudevi-marketingWeb-check-types"
apps-gurudevi-marketing-web:check-types: >>> Starting Process: 6/22/2026, 7:46:12 PM (IST)
apps-gurudevi-marketing-web:check-types: >>> Command: pnpm exec tsc --noEmit

@repo/community:check-types: cache hit, replaying logs 6a9817ca9fdfda09
apps-gurudevi-marketing-web:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-apps_gurudevi-marketingWeb-check-types.log
apps-gurudevi-marketing-web:check-types: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:check-types: 
apps-gurudevi-marketing-web:check-types: --------------------------------------------------------------------------------
apps-gurudevi-marketing-web:check-types: REPORT SUMMARY
apps-gurudevi-marketing-web:check-types: Duration: 15.3 seconds
apps-gurudevi-marketing-web:check-types: Findings: 0 (Errors: 0, Warnings: 0)
apps-gurudevi-marketing-web:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-apps_gurudevi-marketingWeb-check-types.log
apps-gurudevi-marketing-web:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-apps_gurudevi-marketingWeb-check-types-report.txt
apps-gurudevi-marketing-web:check-types: --------------------------------------------------------------------------------

@repo/community:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_community-check-types"
@repo/community:check-types: >>> Starting Process: 6/22/2026, 7:46:24 PM (IST)
@repo/community:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/community:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\community
@repo/community:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_community-check-types.log

@repo/community:check-types: --------------------------------------------------------------------------------
@repo/community:check-types: 
@repo/community:check-types: --------------------------------------------------------------------------------
@repo/community:check-types: REPORT SUMMARY
@repo/community:check-types: Duration: 18.4 seconds
@repo/community:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/community:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_community-check-types.log
@repo/community:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_community-check-types-report.txt
@repo/community:check-types: --------------------------------------------------------------------------------

@repo/admin:check-types: cache miss, executing fe6b1b6c8af36aa9

@repo/admin:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_admin-check-types"

@repo/admin:check-types: >>> Starting Process: 6/22/2026, 8:09:48 PM (IST)

@repo/admin:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/admin:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\admin
@repo/admin:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_admin-check-types.log
@repo/admin:check-types: --------------------------------------------------------------------------------

@repo/admin:check-types: 
@repo/admin:check-types: --------------------------------------------------------------------------------

@repo/admin:check-types: REPORT SUMMARY
@repo/admin:check-types: Duration: 10.4 seconds
@repo/admin:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/admin:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_admin-check-types.log
@repo/admin:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_admin-check-types-report.txt

@repo/admin:check-types: --------------------------------------------------------------------------------

@repo/classroom:check-types: cache miss, executing 5ed2048fadda4eef

@repo/classroom:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "packages_classroom-check-types"

@repo/classroom:check-types: >>> Starting Process: 6/22/2026, 8:09:59 PM (IST)

@repo/classroom:check-types: >>> Command: pnpm exec tsc --noEmit
@repo/classroom:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\packages\classroom
@repo/classroom:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-packages_classroom-check-types.log
@repo/classroom:check-types: --------------------------------------------------------------------------------

@repo/classroom:check-types: 
@repo/classroom:check-types: --------------------------------------------------------------------------------

@repo/classroom:check-types: REPORT SUMMARY
@repo/classroom:check-types: Duration: 8.3 seconds
@repo/classroom:check-types: Findings: 0 (Errors: 0, Warnings: 0)
@repo/classroom:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-packages_classroom-check-types.log
@repo/classroom:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-packages_classroom-check-types-report.txt
@repo/classroom:check-types: --------------------------------------------------------------------------------

gurudevi-mobile:check-types: cache miss, executing 19f8a69d6f20e594

gurudevi-mobile:check-types: $ node ../../scripts/run-and-report.mjs --cmd "pnpm exec tsc --noEmit" --name "apps_gurudevi-mobile-check-types"

gurudevi-mobile:check-types: >>> Starting Process: 6/22/2026, 8:10:08 PM (IST)

gurudevi-mobile:check-types: >>> Command: pnpm exec tsc --noEmit
gurudevi-mobile:check-types: >>> Working Dir: C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile
gurudevi-mobile:check-types: >>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-apps_gurudevi-mobile-check-types.log
gurudevi-mobile:check-types: --------------------------------------------------------------------------------

gurudevi-mobile:check-types: 
gurudevi-mobile:check-types: --------------------------------------------------------------------------------
gurudevi-mobile:check-types: REPORT SUMMARY

gurudevi-mobile:check-types: Duration: 31.2 seconds
gurudevi-mobile:check-types: Findings: 0 (Errors: 0, Warnings: 0)
gurudevi-mobile:check-types: Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-apps_gurudevi-mobile-check-types.log
gurudevi-mobile:check-types: Report:   C:\Users\Naween\projects\polymath-platform\reports\run-apps_gurudevi-mobile-check-types-report.txt
gurudevi-mobile:check-types: --------------------------------------------------------------------------------


 Tasks:    31 successful, 31 total
Cached:    28 cached, 31 total
  Time:    53.236s 



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 56.6s
Findings: 31
Log File: reports/check-types.txt
--------------------------------------------------------------------------------

$ node ./scripts/run-and-report.mjs --cmd "node ./scripts/check-hygiene.mjs" --name "package_json-check_hygiene"

>>> Starting Process: 6/22/2026, 8:10:45 PM (IST)

>>> Command: node ./scripts/check-hygiene.mjs
>>> Working Dir: C:\Users\Naween\projects\polymath-platform
>>> Log output: C:\Users\Naween\projects\polymath-platform\reports\run-package_json-check_hygiene.log
--------------------------------------------------------------------------------


>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---

$ node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"

>>> Starting Sovereign Audit: 2026-06-22T14:40:46.732Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-circular
--------------------------------------------------------------------------------

>>> Executing sub-command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components/SanctuaryVirtualTable.web.tsx
  warn no-orphans: packages/ui/src/components/SanctuaryT
able.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/ui/jest-setup.ts
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/store/usePermissionStore.web.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/core/src/adapters/powersync/wasqlite.shim.ts
  warn no-orphans: packages/core/src/adapters/powersync/opsqlite.shim.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/src/utils/useWebPageTitle.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/performance/AppPerformance.test.tsx
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/CommandPalette.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/WASQLiteDB.umd.js
  warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/SharedSyncImplementation.umd.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx
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
  warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.native.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx → packages/core/src/index.ts

x 86 dependency violations (0 errors, 86 warnings). 2214 modules, 6670 dependencies cruised.



--------------------------------------------------------------------------------
AUDIT SUMMARY

Duration: 17.9s
Findings: 0
Log File: reports/circular_deps.txt
--------------------------------------------------------------------------------

--- Checking Unused Code ---

$ node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"

>>> Starting Sovereign Audit: 2026-06-22T14:41:05.733Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-orphans
--------------------------------------------------------------------------------

>>> Executing sub-command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components/SanctuaryVirtualTable.web.tsx
  warn no-orphans: packages/ui/src/components/SanctuaryT
able.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/ui/jest-setup.ts
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/store/usePermissionStore.web.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/core/src/adapters/powersync/wasqlite.shim.ts
  warn no-orphans: packages/core/src/adapters/powersync/opsqlite.shim.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/src/utils/useWebPageTitle.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/performance/AppPerformance.test.tsx
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/CommandPalette.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/WASQLiteDB.umd.js
  warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/SharedSyncImplementation.umd.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx
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
  warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.native.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx → packages/core/src/index.ts

x 86 dependency violations (0 errors, 86 warnings). 2214 modules, 6670 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.9s
Findings: 80
Log File: reports/unused_code.txt
--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---

$ node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"

>>> Starting Sovereign Audit: 2026-06-22T14:41:19.532Z
>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
--------------------------------------------------------------------------------

>>> Executing sub-command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components/SanctuaryVirtualTable.web.tsx
  warn no-orphans: packages/ui/src/components/SanctuaryT
able.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/ui/jest-setup.ts
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/store/usePermissionStore.web.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/core/src/adapters/powersync/wasqlite.shim.ts
  warn no-orphans: packages/core/src/adapters/powersync/opsqlite.shim.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
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
  warn no-orphans: apps/gurudevi-mobile/src/utils/useWebPageTitle.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/performance/AppPerformance.test.tsx
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/CommandPalette.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/WASQLiteDB.umd.js
  warn no-orphans: apps/gurudevi-mobile/public/@powersync/worker/SharedSyncImplementation.umd.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/app/(tabs)/workspace/_layout.tsx
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
  warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/PostHogAnalytics.native.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx → packages/core/src/index.ts

x 86 dependency violations (0 errors, 86 warnings). 2214 modules, 6670 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 11.7s
Findings: 87
Log File: reports/architecture.txt
--------------------------------------------------------------------------------

--- Checking Schema Drift Alignment ---

[ERR_PNPM_NO_SCRIPT] Missing script: check:schema-drift

Command "check:schema-drift" not found. Did you mean "pnpm run check:self-boundaries"?

❌ Schema Drift Alignment check failed!

⚠️  Hygiene checks failed. Please review the reports in the 'reports/' directory.


>>> FACILITATION & HEALING SUGGESTIONS <<<
💡 Circular Dependencies: Run 'node scripts/refactor/sovereign-cycle-checker.mjs' or 'pnpm run ai:fix'
💡 Architectural Boundaries: Run 'pnpm run check:architecture' for details


--------------------------------------------------------------------------------

REPORT SUMMARY
Duration: 47.7 seconds
Findings: 1 (Errors: 1, Warnings: 0)
Raw Log:  C:\Users\Naween\projects\polymath-platform\reports\run-package_json-check_hygiene.log
Report:   C:\Users\Naween\projects\polymath-platform\reports\run-package_json-check_hygiene-report.txt

--------------------------------------------------------------------------------

[ELIFECYCLE] Command failed with exit code 1.

```
