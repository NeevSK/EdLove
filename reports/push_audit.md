# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/6/2026, 9:44:25 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm dlx gitleaks detect --source . --verbose
> **Duration:** 381.9s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 5 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 60 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 18 |
| packages/analytics | 21 |
| packages/community | 3 |
| packages/core | 90 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 6 |
| packages/scanner- | 3 |
| packages/trube-art | 3 |
| packages/ui | 21 |

## Detailed Findings

### Category: General
- ReferenceError: module is not defined in ES module scope
- x 94 dependency violations (26 errors, 68 warnings). 1936 modules, 6278 dependencies cruised.
- x 94 dependency violations (26 errors, 68 warnings). 1936 modules, 6278 dependencies cruised.
- x 94 dependency violations (26 errors, 68 warnings). 1936 modules, 6278 dependencies cruised.
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
- error no-circular: packages/core/src/types/Identity.ts →
- error L0-no-upward: packages/core/src/logic/schemas/user.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/temporal.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/student.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/staff.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/self.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/school.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/pro.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/payments.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/material.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/library.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/lesson.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/inventory_item.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/guardian.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/growth.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/grading.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/founder.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/community.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/classroom.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/classroom-note.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/attendance.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/accounting.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/index.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/domains/profile/ports.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/adapters/zenstack/profileRepository.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/adapters/supabase/profileRepository.ts → packages/schema/src/index.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- error no-circular: packages/core/src/types/Identity.ts →
- error L0-no-upward: packages/core/src/logic/schemas/user.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/temporal.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/student.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/staff.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/self.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/school.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/pro.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/payments.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/material.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/library.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/lesson.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/inventory_item.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/guardian.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/growth.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/grading.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/founder.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/community.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/classroom.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/classroom-note.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/attendance.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/accounting.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/index.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/domains/profile/ports.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/adapters/zenstack/profileRepository.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/adapters/supabase/profileRepository.ts → packages/schema/src/index.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- error no-circular: packages/core/src/types/Identity.ts →
- error L0-no-upward: packages/core/src/logic/schemas/user.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/temporal.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/student.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/staff.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/self.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/school.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/pro.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/payments.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/material.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/library.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/lesson.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/inventory_item.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/guardian.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/growth.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/grading.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/founder.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/community.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/classroom.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/classroom-note.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/attendance.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/schemas/accounting.schema.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/index.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/logic/domains/profile/ports.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/adapters/zenstack/profileRepository.ts → packages/schema/src/index.ts
- error L0-no-upward: packages/core/src/adapters/supabase/profileRepository.ts → packages/schema/src/index.ts

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
file:///C:/Users/Naween/projects/polymath-platform/node_modules/.pnpm/@commitlint+cli@20.5.0_@typ_ef5c59fca67249fcd992ce26d57dc4e1/node_modules/@commitlint/cli/lib/cli.js:133
        throw err;
        ^

ReferenceError: module is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and 'C:\Users\Naween\projects\polymath-platform\package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
    at file:///C:/Users/Naween/projects/polymath-platform/commitlint.config.js:1:1
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:691:26)
    at async loadJs (C:\Users\Naween\projects\polymath-platform\node_modules\.pnpm\cosmiconfig@9.0.1_typescript@5.9.3\node_modules\cosmiconfig\dist\loaders.js:24:17)
    at async #loadConfiguration (C:\Users\Naween\projects\polymath-platform\node_modules\.pnpm\cosmiconfig@9.0.1_typescript@5.9.3\node_modules\cosmiconfig\dist\Explorer.js:116:36)
    at async #loadConfigFileWithImports (C:\Users\Naween\projects\polymath-platform\node_modules\.pnpm\cosmiconfig@9.0.1_typescript@5.9.3\node_modules\cosmiconfig\dist\Explorer.js:87:31)
    at async #readConfiguration (C:\Users\Naween\projects\polymath-platform\node_modules\.pnpm\cosmiconfig@9.0.1_typescript@5.9.3\node_modules\cosmiconfig\dist\Explorer.js:84:51)
    at async search (C:\Users\Naween\projects\polymath-platform\node_modules\.pnpm\cosmiconfig@9.0.1_typescript@5.9.3\node_modules\cosmiconfig\dist\Explorer.js:50:40)
    at async Explorer.search (C:\Users\Naween\projects\polymath-platform\node_modules\.pnpm\cosmiconfig@9.0.1_typescript@5.9.3\node_modules\cosmiconfig\dist\Explorer.js:78:20)
    at async loadConfig (file:///C:/Users/Naween/projects/polymath-platform/node_modules/.pnpm/@commitlint+load@20.5.0_@types+node@25.5.2_typescript@5.9.3/node_modules/@commitlint/load/lib/utils/load-config.js:56:19) {
  filepath: 'C:\\Users\\Naween\\projects\\polymath-platform\\commitlint.config.js'
}

Node.js v24.11.0


> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:08:06.789Z

>>> Command: pnpm turbo run check-types
--------------------------------------------------------------------------------

• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 29 packages
   • Remote caching disabled


@repo/types-shim:check-types: cache hit, replaying logs 1211b7d4bd055451

@repo/platform-mcp:check-types: cache miss, executing 3cdf4a40b18d4935
@repo/types-shim:check-types: 
@repo/types-shim:check-types: > @repo/types-shim@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:check-types: > pnpm exec tsc --noEmit
@repo/types-shim:check-types: 

apps-intuitui-web:check-types: cache miss, executing cf8e84cbc1fd1755

apps-edlove-web:check-types: cache miss, executing 7464d5878eaaa5c5

apps-neevsk-web:check-types: cache miss, executing ef3987ce8a008824

@repo/schema:check-types: cache hit, replaying logs 5142c8d6ed5c4236

@repo/schema:check-types: 
@repo/schema:check-types: > @repo/schema@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\schema
@repo/schema:check-types: > pnpm exec tsc --noEmit
@repo/schema:check-types: 

@repo/database:check-types: cache hit, replaying logs e9ededdc7ebc654e
@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > pnpm exec tsc --noEmit
@repo/database:check-types: 

@repo/core:check-types: cache miss, executing f5ac1f8afec29b01

@repo/platform-mcp:check-types: 
@repo/platform-mcp:check-types: > @repo/platform-mcp@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\platform-mcp
@repo/platform-mcp:check-types: > pnpm exec tsc --noEmit
@repo/platform-mcp:check-types: 

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec tsc --noEmit
apps-intuitui-web:check-types: 

apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec tsc --noEmit
apps-edlove-web:check-types: 

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 

apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec tsc --noEmit
apps-neevsk-web:check-types: 

@repo/ui:check-types: cache miss, executing 07ada7e89cf7b90b

@intuitui-labs/lk-edu-geo:check-types: cache hit, replaying logs 45cce60aaef1e916

@repo/accounting:check-types: cache miss, executing 74ad86f196f64fcb
@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: 

@repo/accounting:check-types: 
@repo/accounting:check-types: > @repo/accounting@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:check-types: > pnpm exec tsc --noEmit
@repo/accounting:check-types: 

@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm exec tsc --noEmit
@repo/ui:check-types: 

@repo/payments:check-types: cache miss, executing 2688e1bafdaeed46

@repo/payments:check-types: 
@repo/payments:check-types: > @repo/payments@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:check-types: > pnpm exec tsc --noEmit
@repo/payments:check-types: 

@repo/ai:check-types: cache miss, executing ca0c4615ea91fd1b
@repo/scanner-kit:check-types: cache miss, executing a98c554bc984875c
@repo/graphics:check-types: cache miss, executing cc1a8b759d51cd8e

@repo/people:check-types: cache miss, executing 244fa1cb83c9512a

@repo/workforce:check-types: cache hit, replaying logs 8bcd1a2f54d63a0e

@repo/workforce:check-types: 

@repo/workforce:check-types: > @repo/workforce@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:check-types: > pnpm exec tsc --noEmit

@repo/workforce:check-types: 

@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: > @repo/scanner-kit@0.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\scanner-kit
@repo/scanner-kit:check-types: > pnpm exec tsc --noEmit
@repo/scanner-kit:check-types: 

@repo/graphics:check-types: 

@repo/graphics:check-types: > @repo/graphics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:check-types: > pnpm exec tsc --noEmit
@repo/graphics:check-types: 

@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > pnpm exec tsc --noEmit
@repo/ai:check-types: 

@repo/people:check-types: 
@repo/people:check-types: > @repo/people@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: > pnpm exec tsc --noEmit
@repo/people:check-types: 

@repo/form-builder:check-types: cache miss, executing e4065ee5931afd1c

@repo/profile:check-types: cache miss, executing 959e78f0d4be86d3

@repo/form-builder:check-types: 
@repo/form-builder:check-types: > @repo/form-builder@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:check-types: > pnpm exec tsc --noEmit
@repo/form-builder:check-types: 

@repo/library:check-types: cache miss, executing e0b81387c2743cda

@repo/analytics:check-types: cache hit, replaying logs b6c9e1f278ed1881

@repo/analytics:check-types: 
@repo/analytics:check-types: > @repo/analytics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\analytics
@repo/analytics:check-types: > pnpm exec tsc --noEmit
@repo/analytics:check-types: 

@repo/profile:check-types: 

@repo/profile:check-types: > @repo/profile@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\profile

@repo/profile:check-types: > pnpm exec tsc --noEmit
@repo/profile:check-types: 

@repo/library:check-types: 
@repo/library:check-types: > @repo/library@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:check-types: > pnpm exec tsc --noEmit
@repo/library:check-types: 

apps-gurudevi-marketing-web:check-types: cache miss, executing 85cdfd26de69cd7e

apps-gurudevi-marketing-web:check-types: 
apps-gurudevi-marketing-web:check-types: > apps-gurudevi-marketing-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:check-types: > pnpm exec tsc --noEmit
apps-gurudevi-marketing-web:check-types: 

@repo/self:check-types: cache miss, executing 37c838ea22d2aa70

@repo/self:check-types: 
@repo/self:check-types: > @repo/self@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: > pnpm exec tsc --noEmit
@repo/self:check-types: 

@repo/community:check-types: cache miss, executing a80312781271b1ca

@repo/community:check-types: 
@repo/community:check-types: > @repo/community@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\community
@repo/community:check-types: > pnpm exec tsc --noEmit
@repo/community:check-types: 

@repo/admin:check-types: cache miss, executing 34d98f2a551e31d8

@repo/admin:check-types: 
@repo/admin:check-types: > @repo/admin@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\admin
@repo/admin:check-types: > pnpm exec tsc --noEmit
@repo/admin:check-types: 

@repo/classroom:check-types: cache miss, executing 54db4ad824aa3144

@repo/classroom:check-types: 
@repo/classroom:check-types: > @repo/classroom@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\classroom
@repo/classroom:check-types: > pnpm exec tsc --noEmit

@repo/classroom:check-types: 

gurudevi-mobile:check-types: cache miss, executing 512e635ffde3a42f

gurudevi-mobile:check-types: 
gurudevi-mobile:check-types: > gurudevi-mobile@1.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile
gurudevi-mobile:check-types: > pnpm exec tsc --noEmit
gurudevi-mobile:check-types: 


 Tasks:    27 successful, 27 total
Cached:    6 cached, 27 total

  Time:    5m39.838s 



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 341.5s
Findings: 0
Log File: reports/check-types.txt

--------------------------------------------------------------------------------


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:13:49.707Z

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
  error no-circular: packages/core/src/types/Identity.ts → 
      packages/core/src/types/User.ts →
      packages/core/src/types/Identity.ts
  error L0-no-upward: packages/core/src/logic/schemas/user.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/temporal.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/student.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/staff.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/self.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/school.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/pro.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/payments.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/material.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/library.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/lesson.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/inventory_item.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/guardian.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/growth.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/grading.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/founder.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/community.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/classroom.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/classroom-note.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/attendance.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/accounting.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/index.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/domains/profile/ports.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/adapters/zenstack/profileRepository.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/adapters/supabase/profileRepository.ts → packages/schema/src/index.ts

x 94 dependency violations (26 errors, 68 warnings). 1936 modules, 6278 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 11.5s
Findings: 1

Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

❌ Circular Dependencies check failed!

--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:14:02.237Z

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
  error no-circular: packages/core/src/types/Identity.ts → 
      packages/core/src/types/User.ts →
      packages/core/src/types/Identity.ts
  error L0-no-upward: packages/core/src/logic/schemas/user.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/temporal.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/student.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/staff.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/self.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/school.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/pro.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/payments.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/material.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/library.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/lesson.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/inventory_item.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/guardian.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/growth.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/grading.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/founder.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/community.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/classroom.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/classroom-note.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/attendance.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/accounting.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/index.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/domains/profile/ports.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/adapters/zenstack/profileRepository.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/adapters/supabase/profileRepository.ts → packages/schema/src/index.ts

x 94 dependency violations (26 errors, 68 warnings). 1936 modules, 6278 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 9.3s
Findings: 61
Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

❌ Unused Code check failed!

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:14:12.395Z

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
  error no-circular: packages/core/src/types/Identity.ts → 
      packages/core/src/types/User.ts →
      packages/core/src/types/Identity.ts
  error L0-no-upward: packages/core/src/logic/schemas/user.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/temporal.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/student.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/staff.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/self.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/school.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/pro.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/payments.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/material.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/library.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/lesson.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/inventory_item.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/guardian.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/growth.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/grading.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/founder.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/community.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/classroom.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/classroom-note.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/attendance.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/schemas/accounting.schema.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/index.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/logic/domains/profile/ports.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/adapters/zenstack/profileRepository.ts → packages/schema/src/index.ts
  error L0-no-upward: packages/core/src/adapters/supabase/profileRepository.ts → packages/schema/src/index.ts

x 94 dependency violations (26 errors, 68 warnings). 1936 modules, 6278 dependencies cruised.



--------------------------------------------------------------------------------
AUDIT SUMMARY
Duration: 9.3s

Findings: 95
Log File: reports/architecture.txt
--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

❌ Architecture Boundaries check failed!


⚠️  Hygiene checks failed. Please review the reports in the 'reports/' directory.

>>> FACILITATION & HEALING SUGGESTIONS <<<
💡 Circular Dependencies: Run 'node scripts/refactor/sovereign-cycle-checker.mjs' or 'pnpm run ai:fix'
💡 Architectural Boundaries: Run 'pnpm run check:architecture' for details

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 identity:check C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"


>>> Starting Sovereign Audit: 2026-05-06T04:14:22.816Z

>>> Command: node scripts/check-identity-alignment.mjs

--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 0.67s. Found 2 potential alignment issues.



File: packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts

  [[33mMEDIUM[0m] Line 73: Direct usage of supabase.auth.getSession() found. Ensure you are not using auth.uid from the session for domain logic.
    [90m> } = await supabase.auth.getSession();[0m

File: packages/core/src/adapters/supabaseIdentity.adapter.ts

  [[31mHIGH[0m] Line 65: Direct usage of supabase.auth.getUser() found. Use identityAPI.getMyInternalId() if you need the application user ID.
    [90m> const { data } = await supabase.auth.getUser();[0m


[31m⚠️  HIGH priority identity anomalies detected. Please review the findings above and migrate to identityAPI.[0m


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 1.2s
Findings: 0
Log File: reports/identity_check.txt
--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

Progress: resolved 1, reused 0, downloaded 0, added 0

Packages: +1
+

Progress: resolved 1, reused 1, downloaded 0, added 1, done

 ERR_PNPM_DLX_NO_BIN  No binaries found in gitleaks

```
