# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 4/30/2026, 9:27:50 PM
> **Command:** pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
> **Duration:** 9.3s
> **Status:** ✅ Passed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| apps/gurudevi-marketingWeb | 10 |
| apps/gurudevi-mobile | 8 |
| packages/admin | 11 |
| packages/analytics | 7 |
| packages/classroom | 5 |
| packages/community | 1 |
| packages/form-builder | 1 |
| packages/library | 9 |
| packages/people | 2 |
| packages/profile | 1 |
| packages/scanner-kit | 2 |
| packages/self | 13 |

## Detailed Findings

### Category: apps/gurudevi-marketingWeb
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts

### Category: apps/gurudevi-mobile
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts

### Category: packages/admin
- warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts

### Category: packages/analytics
- warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts

### Category: packages/classroom
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts

### Category: packages/community
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts

### Category: packages/form-builder
- warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts

### Category: packages/library
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts

### Category: packages/people
- warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts

### Category: packages/profile
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts

### Category: packages/scanner-kit
- warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts

### Category: packages/self
- warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts

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
  warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts
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
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts

x 136 dependency violations (0 errors, 136 warnings). 1833 modules, 5910 dependencies cruised.


```
