# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 4/30/2026, 9:52:18 PM
> **Command:** pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
> **Duration:** 9.9s
> **Status:** ✅ Passed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 1 |
| apps/edlove-web | 5 |
| apps/gurudevi-marketingWeb | 3 |
| apps/gurudevi-mobile | 21 |
| apps/intuitui-web | 2 |
| apps/neevsk-web | 6 |
| packages/admin | 4 |
| packages/analytics | 12 |
| packages/classroom | 2 |
| packages/community | 1 |
| packages/core | 5 |
| packages/form-builder | 1 |
| packages/library | 11 |
| packages/lk-edu-geo | 1 |
| packages/people | 2 |
| packages/profile | 1 |
| packages/scanner-kit | 3 |
| packages/trube-art | 1 |
| packages/ui | 11 |

## Detailed Findings

### Category: General
- x 92 dependency violations (0 errors, 92 warnings). 1837 modules, 5910 dependencies cruised.

### Category: apps/edlove-web
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs

### Category: apps/gurudevi-marketingWeb
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
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts

### Category: apps/intuitui-web
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs

### Category: apps/neevsk-web
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs

### Category: packages/admin
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts

### Category: packages/analytics
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts

### Category: packages/classroom
- warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts

### Category: packages/community
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts

### Category: packages/core
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts

### Category: packages/form-builder
- warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts

### Category: packages/library
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts

### Category: packages/lk-edu-geo
- warn no-orphans: packages/lk-edu-geo/src/constants.ts

### Category: packages/people
- warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts

### Category: packages/profile
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts

### Category: packages/ui
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/components-native/Livin
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/card.tsx
- warn no-orphans: packages/ui/src/button.tsx

## Raw Output

```text

  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/components-native/Livin
gCard.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
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
  warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts

x 92 dependency violations (0 errors, 92 warnings). 1837 modules, 5910 dependencies cruised.


```
