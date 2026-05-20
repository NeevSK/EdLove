# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/20/2026, 11:21:45 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run lint; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm run i18n:check
> **Duration:** 301.0s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 88 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 58 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| apps/sanctuary-api | 3 |
| packages/admin | 18 |
| packages/analytics | 21 |
| packages/community | 3 |
| packages/core | 16 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 9 |
| packages/scanner-kit | 3 |
| packages/self | 4 |
| packages/trube-art | 3 |
| packages/ui | 26 |

## Detailed Findings

### Category: General
- M scripts/refactor/analyze-errors.mjs
- M scratch/test_audit_error.mjs
- [1m[31m✖[39m   found 1 problems, 0 warnings[22m
- @repo/analytics:lint:biome: Found 4 errors.
- @repo/analytics:lint:biome: Found 84 warnings.
- @repo/analytics:lint:biome:   × Some errors were emitted while running checks.
- @repo/workforce:lint:biome: Found 1 error.
- @repo/workforce:lint:biome:   × Some errors were emitted while running checks.
- @repo/profile:lint:biome:     77 │       setError(err?.message || 'Failed to save');
- apps-intuitui-web:lint:biome: Found 14 errors.
- apps-intuitui-web:lint:biome: Found 18 warnings.
- @repo/profile:lint:biome:     18    │ - ··const·{·instance,·isLoading,·error·}·=·useEntity(type·as·EntityType,·id);␍
- @repo/profile:lint:biome:     32    │ - ··········Profile·Not·Found·or·Error·Loading␍
- @repo/profile:lint:biome:     52    │ - ··if·(error·||·!instance)·{␍
- @repo/profile:lint:biome:     54    │ - ······<Box·className="p-10·text-center·text-text-tertiary">Profile·Not·Found·or·Error·Loading</Box>␍
- @repo/profile:lint:biome:        18 │ + ··const·{·instance,·isLoading,·error·}·=·useEntity(type·as·EntityType,·id);
- @repo/profile:lint:biome:        32 │ + ··········Profile·Not·Found·or·Error·Loading
- apps-intuitui-web:lint:biome:      52     │ - → → import('astro').LiveDataCollectionResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>
- apps-intuitui-web:lint:biome:          52 │ + ····import('astro').LiveDataCollectionResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>
- apps-intuitui-web:lint:biome:      77     │ - → ):·Promise<import('astro').LiveDataEntryResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>>;
- @repo/profile:lint:biome:        52 │ + ··if·(error·||·!instance)·{
- @repo/profile:lint:biome: Found 18 errors.
- @repo/profile:lint:biome: Found 45 warnings.
- @repo/profile:lint:biome:        54 │ + ······<Box·className="p-10·text-center·text-text-tertiary">Profile·Not·Found·or·Error·Loading</Box>
- apps-intuitui-web:lint:biome:          77 │ + ··):·Promise<import('astro').LiveDataEntryResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>>;
- @repo/profile:lint:biome:      23     │ - import·{·hapticError,·hapticSuccess·}·from·'@repo/ui/utils/haptics';␍
- @repo/profile:lint:biome:      44     │ - type·ClaimState·=·'loading'·|·'success'·|·'already_claimed'·|·'error';␍
- @repo/profile:lint:biome:      90     │ - ········}·else·if·(result.error·===·'already_claimed_or_invalid')·{␍
- @repo/profile:lint:biome:      92     │ - ··········hapticError();␍
- @repo/profile:lint:biome:      94     │ - ··········setClaimState('error');␍
- @repo/profile:lint:biome:      95     │ - ··········hapticError();␍
- @repo/profile:lint:biome:      98     │ - ········console.error('ThuthimalClaimScreen·error:',·err);␍
- @repo/profile:lint:biome:      99     │ - ········setClaimState('error');␍
- @repo/profile:lint:biome:     100     │ - ········hapticError();␍
- apps-intuitui-web:lint:biome:   × Some errors were emitted while running checks.
- @repo/profile:lint:biome:   × Some errors were emitted while running checks.
- @repo/community:lint:biome:     35 │     if (error) throw error;
- @repo/payments:lint:biome: Found 1 error.
- @repo/payments:lint:biome: Found 5 warnings.
- @repo/payments:lint:biome:   × Some errors were emitted while running checks.
- @intuitui-labs/lk-edu-geo:lint:biome: Found 5 errors.
- @repo/community:lint:biome:     86 │     if (error) throw error;
- @repo/community:lint:biome:     124 │     const { data, error } = await supabase
- @repo/community:lint:biome:     142 │     const { data, error } = await supabase
- @repo/community:lint:biome:     157 │     const { data: created, error: groupErr } = await supabase
- @repo/community:lint:biome: Found 19 errors.
- @repo/community:lint:biome: Found 65 warnings.
- @repo/community:lint:biome:     215 │     if (error) throw error;
- @intuitui-labs/lk-edu-geo:lint:biome: Found 15 warnings.
- @repo/types-shim:lint:biome: Found 1 error.
- @repo/types-shim:lint:biome: Found 1 warning.
- @repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
- @repo/community:lint:biome:     309 │     if (error) throw error;
- @repo/community:lint:biome:     379 │     if (fetchErr) throw new Error(fetchErr.message);
- @repo/community:lint:biome:     449 │     if (error) throw error;
- @repo/community:lint:biome:     540 │     const { data, error } = await supabase
- @intuitui-labs/lk-edu-geo:lint:biome:   × Some errors were emitted while running checks.
- @repo/community:lint:biome:   × Some errors were emitted while running checks.
- gurudevi-mobile:lint:biome:     74 │         setError(e?.message || 'Failed to load students');
- gurudevi-mobile:lint:biome:     118 │       setError(e?.message || 'Failed to save attendance');
- gurudevi-mobile:lint:biome: Found 716 errors.
- gurudevi-mobile:lint:biome: Found 472 warnings.
- gurudevi-mobile:lint:biome:   × Some errors were emitted while running checks.
- apps-edlove-web:lint:biome: Found 23 errors.
- apps-edlove-web:lint:biome: Found 94 warnings.
- apps-edlove-web:lint:biome:   × Some errors were emitted while running checks.
- ERROR
- ERROR  run failed: command  exited (1)
- x 71 dependency violations (0 errors, 71 warnings). 2063 modules, 6511 dependencies cruised.
- x 71 dependency violations (0 errors, 71 warnings). 2063 modules, 6511 dependencies cruised.
- x 71 dependency violations (0 errors, 71 warnings). 2063 modules, 6511 dependencies cruised.
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - scanner.errors.customBuild
- - scanner.errors.noQrFound
- - scanner.errors.scanFailed
- - scanner.web.emptyError
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - scanner.errors.customBuild
- - scanner.errors.noQrFound
- - scanner.errors.scanFailed
- - scanner.web.emptyError

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
- M apps/gurudevi-mobile/src/screens/ErrorMessageDemo.tsx
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
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

### Category: apps/sanctuary-api
- warn L0-L1-subpath-only: apps/sanctuary-api/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/sanctuary-api/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/sanctuary-api/src/index.ts → packages/core/src/index.ts

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
- M packages/core/scratch/extract_errors.cjs
- M packages/core/src/lib/errors.ts
- M packages/core/src/logic/utils/errorNormalizer.ts
- M packages/core/src/types/Errors.ts
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
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx

### Category: packages/self
- M packages/self/src/components/FeatureErrorBoundary.tsx
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src
- warn no-orphans: packages/trube-art/src
- warn no-orphans: packages/trube-art/src

### Category: packages/ui
- M packages/ui/src/components/ErrorBoundary.tsx
- M packages/ui/src/providers/ErrorResolutionProvider.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx

## Raw Output

```text
[90m⧗[39m   input: [1mfeat(powersync): secure offline-first local database proxy & decouple circular permission evaluator

[STAGED CHANGES SUMMARY]
[APP] edlove-web
  M apps/edlove-web/astro.config.mjs
  M apps/edlove-web/src/components/CinematicBackground.astro
  M apps/edlove-web/src/components/ExpandableContent.astro
  M apps/edlove-web/src/components/Navigation.astro
  M apps/edlove-web/src/components/StructuredData.astro
  M apps/edlove-web/src/components/Welcome.astro
  M apps/edlove-web/src/constants/Theme.ts
  M apps/edlove-web/src/content.config.ts
  M apps/edlove-web/src/env.d.ts
  M apps/edlove-web/src/layouts/Layout.astro
  M apps/edlove-web/src/lib/api.ts
  M apps/edlove-web/src/lib/site.ts
  M apps/edlove-web/src/pages/community/index.astro
  M apps/edlove-web/src/pages/cosmos/[slug].astro
  M apps/edlove-web/src/pages/cosmos/index.astro
  M apps/edlove-web/src/pages/gurudevi/index.astro
  M apps/edlove-web/src/pages/index.astro
  M apps/edlove-web/src/pages/knowledge.json.ts
  M apps/edlove-web/src/pages/library/index.astro
  M apps/edlove-web/src/pages/llms.txt.ts
  M apps/edlove-web/src/pages/privacy.astro
  M apps/edlove-web/src/pages/resources/gallery.astro
  M apps/edlove-web/src/pages/resources/index.astro
  M apps/edlove-web/src/pages/robots.txt.ts
  M apps/edlove-web/src/pages/si/index.astro
  M apps/edlove-web/src/pages/sri-lanka/index.astro
  M apps/edlove-web/src/pages/ta/index.astro
  M apps/edlove-web/src/pages/terms.astro
  M apps/edlove-web/src/pages/vision.astro
  M apps/edlove-web/src/styles/global.css
  M apps/edlove-web/src/types/index.ts
  M apps/edlove-web/src/utils/helpers.ts
  M apps/edlove-web/svelte.config.js
  M apps/edlove-web/tsconfig.json
  M apps/edlove-web/vercel.json

[APP] gurudevi-marketingWeb
  M apps/gurudevi-marketingWeb/.astro/data-store.json
  M apps/gurudevi-marketingWeb/.astro/settings.json
  M apps/gurudevi-marketingWeb/astro.config.mjs
  M apps/gurudevi-marketingWeb/public/manifest.json
  M apps/gurudevi-marketingWeb/public/sw.js
  M apps/gurudevi-marketingWeb/src/components/Header.astro
  M apps/gurudevi-marketingWeb/src/components/SEO.astro
  M apps/gurudevi-marketingWeb/src/components/StatItem.astro
  M apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  M apps/gurudevi-marketingWeb/src/components/StoryCard.astro
  M apps/gurudevi-marketingWeb/src/components/StructuredData.astro
  M apps/gurudevi-marketingWeb/src/components/SupportForm.svelte
  M apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/lib/workerObservability.ts
  M apps/gurudevi-marketingWeb/src/layouts/Layout.astro
  M apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts
  M apps/gurudevi-marketingWeb/src/lib/durableAgents/llmProvider.ts
  M apps/gurudevi-marketingWeb/src/lib/durableAgents/studentSupportAgent.ts
  M apps/gurudevi-marketingWeb/src/lib/durableAgents/teacherSummaryAgent.ts
  M apps/gurudevi-marketingWeb/src/lib/inngest.ts
  M apps/gurudevi-marketingWeb/src/lib/inngestEvents.ts
  M apps/gurudevi-marketingWeb/src/lib/site.ts
  M apps/gurudevi-marketingWeb/src/lib/supabase.ts
  M apps/gurudevi-marketingWeb/src/middleware.ts
  M apps/gurudevi-marketingWeb/src/pages/about.astro
  M apps/gurudevi-marketingWeb/src/pages/api/durable-agents/runs.ts
  M apps/gurudevi-marketingWeb/src/pages/api/durable-agents/runs/[runId].ts
  M apps/gurudevi-marketingWeb/src/pages/api/durable-agents/runs/[runId]/promote.ts
  M apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts
  M apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts
  M apps/gurudevi-marketingWeb/src/pages/api/inngest.ts
  M apps/gurudevi-marketingWeb/src/pages/api/inngest/trace.ts
  M apps/gurudevi-marketingWeb/src/pages/delete-account.astro
  M apps/gurudevi-marketingWeb/src/pages/durable-agents.astro
  M apps/gurudevi-marketingWeb/src/pages/faq.astro
  M apps/gurudevi-marketingWeb/src/pages/index.astro
  M apps/gurudevi-marketingWeb/src/pages/knowledge.json.ts
  M apps/gurudevi-marketingWeb/src/pages/llms.txt.ts
  M apps/gurudevi-marketingWeb/src/pages/privacy.astro
  M apps/gurudevi-marketingWeb/src/pages/robots.txt.ts
  M apps/gurudevi-marketingWeb/src/pages/sensing/[schoolId].astro
  M apps/gurudevi-marketingWeb/src/pages/sensing/index.astro
  M apps/gurudevi-marketingWeb/src/pages/support.astro
  M apps/gurudevi-marketingWeb/src/pages/thuthimal.astro
  M apps/gurudevi-marketingWeb/src/shims/expo-linear-gradient.tsx
  M apps/gurudevi-marketingWeb/src/styles/global.css
  M apps/gurudevi-marketingWeb/tsconfig.json

[APP] gurudevi-mobile
  M apps/gurudevi-mobile/App.tsx
  M apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  M apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  M apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  M apps/gurudevi-mobile/__mocks__/expo-camera.js
  M apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  M apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  M apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  M apps/gurudevi-mobile/app.json
  M apps/gurudevi-mobile/archives/ai/AIAssistantScreen.tsx
  M apps/gurudevi-mobile/archives/ai/AIAssistantScreen.web.tsx
  M apps/gurudevi-mobile/archives/auth/AuthScreen.tsx
  M apps/gurudevi-mobile/archives/auth/AuthScreen.web.tsx
  M apps/gurudevi-mobile/archives/classroom/AttendanceScreen.web.tsx
  M apps/gurudevi-mobile/archives/classroom/ClassroomDetailScreen.web.tsx
  M apps/gurudevi-mobile/archives/classroom/DemoPlaygroundPanel.web.tsx
  M apps/gurudevi-mobile/archives/classroom/GradebookScreen.web.tsx
  M apps/gurudevi-mobile/archives/classroom/NoSchoolView.web.tsx
  M apps/gurudevi-mobile/archives/classroom/SchoolCreationScreen.tsx
  M apps/gurudevi-mobile/archives/classroom/SchoolForestScreen.web.tsx
  M apps/gurudevi-mobile/archives/classroom/TimetableScreen.web.tsx
  M apps/gurudevi-mobile/archives/classroom/screens/AcademicCycleManager.tsx
  M apps/gurudevi-mobile/archives/classroom/screens/FounderDashboard.web.tsx
  M apps/gurudevi-mobile/archives/classroom/screens/GradeHeadDashboard.tsx
  M apps/gurudevi-mobile/archives/classroom/screens/SectionHeadDashboard.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/GlobalCreateModal.web.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/CurriculumPulse.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/DashboardEcho.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/HierarchyBuilder.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/InstitutionalCalendarSection.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/InviteManager.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/LeaveApprovalSection.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/ManagementStation.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/MorningSituationalBrief.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/PrincipalNotes.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/PrincipalObservationsSection.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/PulseDashboard.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/ResourceNeedsDashboard.tsx
  M apps/gurudevi-mobile/archives/classroom/src/components/principal/TeacherCarousel.tsx
  M apps/gurudevi-mobile/archives/classroom/src/screens/FounderDashboard.tsx
  M apps/gurudevi-mobile/archives/classroom/src/screens/PrincipalDashboard.web.tsx
  M apps/gurudevi-mobile/archives/classroom/src/screens/principal/DashboardContent.tsx
  M apps/gurudevi-mobile/archives/classroom/src/screens/principal/StudentPulse.tsx
  M apps/gurudevi-mobile/archives/classroom/src/screens/principal/index.ts
  M apps/gurudevi-mobile/archives/classroom/src/screens/principal/types.ts
  M apps/gurudevi-mobile/archives/classroom/src/workspace/usePrincipalWorkspaceSurfaces.tsx
  M apps/gurudevi-mobile/archives/community/AnnouncementsScreen.tsx
  M apps/gurudevi-mobile/archives/community/CommunityScreen.tsx
  M apps/gurudevi-mobile/archives/community/CommunityScreen.web.tsx
  M apps/gurudevi-mobile/archives/components/trube/TrubeBackdrop.archive.tsx
  M apps/gurudevi-mobile/archives/library/LibraryScreen.tsx
  M apps/gurudevi-mobile/archives/library/LibraryScreen.web.tsx
  M apps/gurudevi-mobile/archives/metro.config.backup.js
  M apps/gurudevi-mobile/archives/misc/NotificationsScreen.web.tsx
  M apps/gurudevi-mobile/archives/misc/QRHandlerScreen.tsx
  M apps/gurudevi-mobile/archives/misc/SelfScreen.tsx
  M apps/gurudevi-mobile/archives/misc/SelfScreen.web.tsx
  M apps/gurudevi-mobile/archives/multiAccountDraft.archive.ts
  M apps/gurudevi-mobile/archives/onboarding/InvitationWelcomeScreen.tsx
  M apps/gurudevi-mobile/archives/onboarding/InviteCodeEntry.tsx
  M apps/gurudevi-mobile/archives/onboarding/OnboardingScreen.tsx
  M apps/gurudevi-mobile/archives/onboarding/OnboardingScreen.web.tsx
  M apps/gurudevi-mobile/archives/onboarding/WelcomeScreen.tsx
  M apps/gurudevi-mobile/archives/onboarding/WelcomeScreen.web.tsx
  M apps/gurudevi-mobile/archives/packages/scanner-kit/src/qr/QRBuilder.ts
  M apps/gurudevi-mobile/archives/packages/scanner-kit/src/qr/QRPayload.ts
  M apps/gurudevi-mobile/archives/packages/scanner-kit/src/qr/QRResolver.ts
  M apps/gurudevi-mobile/archives/packages/ui/src/qr/QRBuilder.ts
  M apps/gurudevi-mobile/archives/packages/ui/src/qr/QRResolver.ts
  M apps/gurudevi-mobile/archives/people/src/api/staff.ts
  M apps/gurudevi-mobile/archives/people/src/components/PrincipalAdminWidget.tsx
  M apps/gurudevi-mobile/archives/people/src/components/StaffPresencePulse.tsx
  M apps/gurudevi-mobile/archives/people/src/components/StudentPulseSection.tsx
  M apps/gurudevi-mobile/archives/people/src/hooks/useStaffPresence.ts
  M apps/gurudevi-mobile/archives/people/src/staff.ts
  M apps/gurudevi-mobile/archives/profile/FullProfileScreen.tsx
  M apps/gurudevi-mobile/archives/profile/ProfileScreen.tsx
  M apps/gurudevi-mobile/archives/profile/ProfileScreen.web.tsx
  M apps/gurudevi-mobile/archives/profile/ThuthimalClaimScreen.tsx
  M apps/gurudevi-mobile/archives/screens/ClassroomScreen.tsx
  M apps/gurudevi-mobile/archives/screens/CommunityScreen.tsx
  M apps/gurudevi-mobile/archives/screens/LibraryScreen.tsx
  M apps/gurudevi-mobile/archives/screens/NotificationsScreen.tsx
  M apps/gurudevi-mobile/archives/screens/OnboardingScreen.tsx
  M apps/gurudevi-mobile/archives/screens/ProfileScreen.tsx
  M apps/gurudevi-mobile/archives/screens/QRHandlerScreen.tsx
  M apps/gurudevi-mobile/archives/screens/SchoolCreationScreen.tsx
  M apps/gurudevi-mobile/archives/screens/SelfScreen.tsx
  M apps/gurudevi-mobile/archives/screens/TrubeLabScreen.archive.tsx
  M apps/gurudevi-mobile/archives/screens/WelcomeScreen.tsx
  M apps/gurudevi-mobile/archives/settings/AppSettingsScreen.tsx
  M apps/gurudevi-mobile/archives/settings/AppSettingsScreen.web.tsx
  M apps/gurudevi-mobile/babel.config.js
  M apps/gurudevi-mobile/check_schools.js
  M apps/gurudevi-mobile/docs/architecture/Sovereign_Resilience_Architecture_2026.md
  A apps/gurudevi-mobile/docs/architecture/future-patterns-and-standards.md
  A apps/gurudevi-mobile/docs/architecture/local-first-transition-spec.md
  M apps/gurudevi-mobile/docs/school_erp/web-mobile-package-migration.manifest.json
  M apps/gurudevi-mobile/eas.json
  M apps/gurudevi-mobile/eslint.config.mjs
  M apps/gurudevi-mobile/gluestack-ui.config.ts
  M apps/gurudevi-mobile/index.ts
  M apps/gurudevi-mobile/jest-native-setup.js
  M apps/gurudevi-mobile/jest-setup.ts
  M apps/gurudevi-mobile/jest.config.js
  M apps/gurudevi-mobile/metro.config.js
  M apps/gurudevi-mobile/package.json
  M apps/gurudevi-mobile/playwright.config.ts
  M apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  M apps/gurudevi-mobile/plugins/withGradleProperties.js
  M apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  M apps/gurudevi-mobile/plugins/withSentryProperties.js
  M apps/gurudevi-mobile/public/manifest.json
  M apps/gurudevi-mobile/public/sw.js
  M apps/gurudevi-mobile/scripts/add-web-shim.mjs
  M apps/gurudevi-mobile/scripts/audit-web-deps.mjs
  M apps/gurudevi-mobile/scripts/check-native-leaks.mjs
  M apps/gurudevi-mobile/scripts/etl/discovery/index.ts
  M apps/gurudevi-mobile/scripts/etl/discovery/sources/ai-search.ts
  M apps/gurudevi-mobile/scripts/etl/discovery/sources/youtube.ts
  M apps/gurudevi-mobile/scripts/etl/utils/supabase.ts
  M apps/gurudevi-mobile/scripts/extract-module.mjs
  M apps/gurudevi-mobile/scripts/increment-version.js
  M apps/gurudevi-mobile/src/__tests__/architecture/classroom-surface-entrypoints.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/educational-contract-coverage.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/founder-stack-boundaries.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/inventory-resource-split-guardrails.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/lazy-package-boundaries.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/package-boundaries.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/principal-boundaries.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/principal-governance-guardrails.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/principal-ia-coherence.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/profile-contract-coverage.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/profile-poa-enforcement.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/profile-route-capabilities.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/social-knowledge-contract-coverage.test.ts
  M apps/gurudevi-mobile/src/__tests__/architecture/web-route-adapters.test.ts
  M apps/gurudevi-mobile/src/__tests__/components/OnboardingScreen.test.tsx
  M apps/gurudevi-mobile/src/__tests__/components/ProgressIndicator.test.tsx
  M apps/gurudevi-mobile/src/__tests__/components/WelcomeScreen.test.tsx
  M apps/gurudevi-mobile/src/__tests__/mocks/supabase.ts
  M apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  M apps/gurudevi-mobile/src/components/RedirectToApp.web.tsx
  M apps/gurudevi-mobile/src/components/school/StepBasicInfo.tsx
  M apps/gurudevi-mobile/src/components/school/StepDemographics.tsx
  M apps/gurudevi-mobile/src/components/school/StepHierarchy.tsx
  M apps/gurudevi-mobile/src/components/school/StepLocation.tsx
  M apps/gurudevi-mobile/src/components/web/CommandPalette.tsx
  M apps/gurudevi-mobile/src/components/web/CommandPalette.web.tsx
  M apps/gurudevi-mobile/src/components/web/PWAInstallBanner.tsx
  M apps/gurudevi-mobile/src/components/web/PWAInstallBanner.web.tsx
  M apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  M apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  M apps/gurudevi-mobile/src/components/web/WebScreenShimmer.tsx
  M apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  M apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  M apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  M apps/gurudevi-mobile/src/constants/Fonts.ts
  M apps/gurudevi-mobile/src/i18n/config.ts
  M apps/gurudevi-mobile/src/i18n/locales/en.json
  M apps/gurudevi-mobile/src/i18n/locales/si.json
  M apps/gurudevi-mobile/src/i18n/locales/ta.json
  M apps/gurudevi-mobile/src/lib/backgroundSync.ts
  M apps/gurudevi-mobile/src/lib/inngest.ts
  M apps/gurudevi-mobile/src/lib/inngestEvents.ts
  M apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/FounderStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/FounderStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/SelfStackNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/SelfStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/TabNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/TabNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/navigationRef.ts
  M apps/gurudevi-mobile/src/navigation/useAppEntryGate.ts
  M apps/gurudevi-mobile/src/providers/AssetProvider.tsx
  M apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx
  A apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx
  M apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx
  M apps/gurudevi-mobile/src/screens/AttendanceScreen.web.tsx
  M apps/gurudevi-mobile/src/screens/AuthScreen.tsx
  M apps/gurudevi-mobile/src/screens/ClassroomDetailScreen.web.tsx
  M apps/gurudevi-mobile/src/screens/ErrorMessageDemo.tsx
  M apps/gurudevi-mobile/src/screens/GradebookScreen.web.tsx
  M apps/gurudevi-mobile/src/screens/InvitationWelcomeScreen.tsx
  M apps/gurudevi-mobile/src/screens/InviteCodeEntry.tsx
  M apps/gurudevi-mobile/src/screens/QRHandlerScreen.tsx
  M apps/gurudevi-mobile/src/screens/SchoolCreationScreen.tsx
  M apps/gurudevi-mobile/src/screens/SchoolForestScreen.web.tsx
  M apps/gurudevi-mobile/src/screens/ThuthimalClaimScreen.tsx
  M apps/gurudevi-mobile/src/screens/TimetableScreen.web.tsx
  M apps/gurudevi-mobile/src/screens/classroom/DemoPlaygroundPanel.web.tsx
  M apps/gurudevi-mobile/src/screens/classroom/NoSchoolView.web.tsx
  M apps/gurudevi-mobile/src/screens/community/AnnouncementsScreen.tsx
  M apps/gurudevi-mobile/src/screens/index.ts
  M apps/gurudevi-mobile/src/screens/profile/FullProfileScreen.tsx
  M apps/gurudevi-mobile/src/services/FeatureSyncManager.tsx
  M apps/gurudevi-mobile/src/shims/codegen-web.js
  M apps/gurudevi-mobile/src/shims/crypto-web.js
  M apps/gurudevi-mobile/src/shims/database-shim.js
  M apps/gurudevi-mobile/src/shims/events-web.js
  M apps/gurudevi-mobile/src/shims/expo-application-web.js
  M apps/gurudevi-mobile/src/shims/expo-audio-web.js
  M apps/gurudevi-mobile/src/shims/expo-av-web.js
  M apps/gurudevi-mobile/src/shims/expo-camera-web.js
  M apps/gurudevi-mobile/src/shims/expo-device-web.js
  M apps/gurudevi-mobile/src/shims/expo-file-system-web.js
  M apps/gurudevi-mobile/src/shims/expo-haptics-web.js
  M apps/gurudevi-mobile/src/shims/expo-image-manipulator-web.js
  M apps/gurudevi-mobile/src/shims/expo-image-picker-web.js
  M apps/gurudevi-mobile/src/shims/expo-location-web.js
  M apps/gurudevi-mobile/src/shims/expo-secure-store-web.js
  M apps/gurudevi-mobile/src/shims/expo-sharing-web.js
  M apps/gurudevi-mobile/src/shims/expo-sqlite-web.js
  M apps/gurudevi-mobile/src/shims/expo-updates-web.js
  M apps/gurudevi-mobile/src/shims/expo-video-web.js
  M apps/gurudevi-mobile/src/shims/fs-web.js
  M apps/gurudevi-mobile/src/shims/gesture-handler-web.js
  M apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js
  M apps/gurudevi-mobile/src/shims/lucide-react-native-web.js
  M apps/gurudevi-mobile/src/shims/maplibre-web.js
  M apps/gurudevi-mobile/src/shims/maps-web.js
  M apps/gurudevi-mobile/src/shims/ml-kit-barcode-scanning-web.js
  M apps/gurudevi-mobile/src/shims/ml-kit-text-recognition-web.js
  M apps/gurudevi-mobile/src/shims/mmkv-web.js
  M apps/gurudevi-mobile/src/shims/netinfo-web.js
  M apps/gurudevi-mobile/src/shims/nitro-modules-web.js
  M apps/gurudevi-mobile/src/shims/node-globals-shim.js
  M apps/gurudevi-mobile/src/shims/node-net-shim.js
  M apps/gurudevi-mobile/src/shims/node-shims-bundle.js
  M apps/gurudevi-mobile/src/shims/os-web.js
  M apps/gurudevi-mobile/src/shims/path-web.js
  M apps/gurudevi-mobile/src/shims/postalcode-backend-web.js
  M apps/gurudevi-mobile/src/shims/posthog-web.js
  M apps/gurudevi-mobile/src/shims/react-native-web-augmented.js
  M apps/gurudevi-mobile/src/shims/reanimated-web.js
  M apps/gurudevi-mobile/src/shims/screens-web.js
  M apps/gurudevi-mobile/src/shims/sentry-web.js
  M apps/gurudevi-mobile/src/shims/skia-web.js
  M apps/gurudevi-mobile/src/shims/srilanka-geographics-web.js
  M apps/gurudevi-mobile/src/shims/stream-web.js
  M apps/gurudevi-mobile/src/shims/svg-web.js
  M apps/gurudevi-mobile/src/shims/universal-bridge.js
  M apps/gurudevi-mobile/src/shims/util-web.js
  M apps/gurudevi-mobile/src/shims/wgpu-web.js
  M apps/gurudevi-mobile/src/shims/worklets-web.js
  M apps/gurudevi-mobile/src/types/expo-background-task.d.ts
  M apps/gurudevi-mobile/src/types/gluestack-ui.d.ts
  M apps/gurudevi-mobile/src/types/navigation.ts
  M apps/gurudevi-mobile/src/types/react-native-gifted-charts.d.ts
  M apps/gurudevi-mobile/src/utils/LanguageUtils.ts
  M apps/gurudevi-mobile/src/utils/device.ts
  M apps/gurudevi-mobile/src/utils/time.ts
  M apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  M apps/gurudevi-mobile/src/utils/useWebPageTitle.ts
  M apps/gurudevi-mobile/src/utils/validators.ts
  M apps/gurudevi-mobile/supabase/functions/ai-assistant/index.ts
  M apps/gurudevi-mobile/supabase/functions/deno.json
  M apps/gurudevi-mobile/supabase/functions/enrich-staging/index.ts
  M apps/gurudevi-mobile/supabase/functions/import_map.json
  M apps/gurudevi-mobile/supabase/functions/library-etl/index.ts
  M apps/gurudevi-mobile/supabase/functions/ocr-proxy/index.ts
  M apps/gurudevi-mobile/supabase/functions/publish-resource/index.ts
  M apps/gurudevi-mobile/tailwind.config.js
  M apps/gurudevi-mobile/test-resolution.js
  M apps/gurudevi-mobile/tests/e2e/navigation.spec.ts
  M apps/gurudevi-mobile/tsconfig.json
  M apps/gurudevi-mobile/verify-metro.js

[APP] intuitui-web
  M apps/intuitui-web/.astro/settings.json
  M apps/intuitui-web/astro.config.mjs
  M apps/intuitui-web/src/components/StructuredData.astro
  M apps/intuitui-web/src/components/SystemsGrid.astro
  M apps/intuitui-web/src/layouts/MainLayout.astro
  M apps/intuitui-web/src/lib/site.ts
  M apps/intuitui-web/src/pages/about.astro
  M apps/intuitui-web/src/pages/index.astro
  M apps/intuitui-web/src/pages/knowledge.json.ts
  M apps/intuitui-web/src/pages/llms.txt.ts
  M apps/intuitui-web/src/pages/projects.astro
  M apps/intuitui-web/src/pages/robots.txt.ts
  M apps/intuitui-web/src/pages/studio.astro
  M apps/intuitui-web/src/styles/global.css
  M apps/intuitui-web/tsconfig.json

[APP] neevsk-web
  M apps/neevsk-web/.astro/content-assets.mjs
  M apps/neevsk-web/.astro/data-store.json
  M apps/neevsk-web/.astro/settings.json
  M apps/neevsk-web/astro.config.mjs
  M apps/neevsk-web/src/components/FlameCard.astro
  M apps/neevsk-web/src/components/Navigation.astro
  M apps/neevsk-web/src/components/StructuredData.astro
  M apps/neevsk-web/src/components/common/Button.astro
  M apps/neevsk-web/src/components/common/Card.astro
  M apps/neevsk-web/src/components/common/Navigation.astro
  M apps/neevsk-web/src/components/sections/CurrentFocus.astro
  M apps/neevsk-web/src/components/sections/FiveDoors.astro
  M apps/neevsk-web/src/components/sections/HeroHome.astro
  M apps/neevsk-web/src/content.config.ts
  M apps/neevsk-web/src/layouts/BaseLayout.astro
  M apps/neevsk-web/src/layouts/DigitalNeonLayout.astro
  M apps/neevsk-web/src/layouts/LightTechLayout.astro
  M apps/neevsk-web/src/layouts/NatureLayout.astro
  M apps/neevsk-web/src/layouts/TwilightLayout.astro
  M apps/neevsk-web/src/layouts/WarmArchiveLayout.astro
  M apps/neevsk-web/src/lib/site.ts
  M apps/neevsk-web/src/pages/archive.astro
  M apps/neevsk-web/src/pages/archive/[slug].astro
  M apps/neevsk-web/src/pages/connect/index.astro
  M apps/neevsk-web/src/pages/contact.astro
  M apps/neevsk-web/src/pages/cv.astro
  M apps/neevsk-web/src/pages/hall-of-flame.astro
  M apps/neevsk-web/src/pages/index.astro
  M apps/neevsk-web/src/pages/intellectual/index.astro
  M apps/neevsk-web/src/pages/journey.astro
  M apps/neevsk-web/src/pages/knowledge.json.ts
  M apps/neevsk-web/src/pages/library/index.astro
  M apps/neevsk-web/src/pages/llms.txt.ts
  M apps/neevsk-web/src/pages/personal/hall-of-flame.astro
  M apps/neevsk-web/src/pages/personal/index.astro
  M apps/neevsk-web/src/pages/professional/index.astro
  M apps/neevsk-web/src/pages/projects.astro
  M apps/neevsk-web/src/pages/robots.txt.ts
  M apps/neevsk-web/src/scripts/animations.ts
  M apps/neevsk-web/src/scripts/creative-signatures.ts
  M apps/neevsk-web/src/scripts/scroll-to-top.ts
  M apps/neevsk-web/src/scripts/theme-switcher.ts
  M apps/neevsk-web/src/styles/global.css
  M apps/neevsk-web/tests/e2e/home.spec.ts
  M apps/neevsk-web/tsconfig.json

[APP] sanctuary-api
  M apps/sanctuary-api/package.json
  A apps/sanctuary-api/src/__tests__/dummyShim.ts
  A apps/sanctuary-api/src/__tests__/jwt.test.ts
  A apps/sanctuary-api/src/__tests__/setup.ts
  M apps/sanctuary-api/src/index.ts
  A apps/sanctuary-api/src/jwt.ts
  M apps/sanctuary-api/tsconfig.json
  A apps/sanctuary-api/vitest.config.ts

[PKG] accounting
  M packages/accounting/eslint.config.mjs
  M packages/accounting/src/budgeting.ts
  M packages/accounting/src/cheques.ts
  M packages/accounting/src/index.ts
  M packages/accounting/src/ledger.ts
  M packages/accounting/src/types.ts
  M packages/accounting/tsconfig.json

[PKG] admin
  M packages/admin/eslint.config.mjs
  M packages/admin/src/__tests__/analytics/engine.test.ts
  M packages/admin/src/__tests__/screens/DocumentListScreen.test.tsx
  M packages/admin/src/__tests__/screens/GuardianDashboardScreen.test.tsx
  M packages/admin/src/admin/adminControl.ts
  M packages/admin/src/admin/adminRepository.ts
  M packages/admin/src/admin/useAdminWorkspaceCanvas.tsx
  M packages/admin/src/admin/useAdminWorkspaceData.ts
  M packages/admin/src/admin/workspace.ts
  M packages/admin/src/analytics/api.ts
  M packages/admin/src/analytics/engine.ts
  M packages/admin/src/analytics/types.ts
  M packages/admin/src/api/index.ts
  M packages/admin/src/api/staff.ts
  M packages/admin/src/approvals.ts
  M packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx
  M packages/admin/src/bridge/founderWorkspace.ts
  M packages/admin/src/bridge/principalWorkspaceShell.tsx
  M packages/admin/src/calendar.ts
  M packages/admin/src/components/founder/GlobalCreateModal.tsx
  M packages/admin/src/components/founder/GlobalCreateModal.web.tsx
  M packages/admin/src/components/guardian/GuardianEvents.tsx
  M packages/admin/src/components/guardian/GuardianNotifications.tsx
  M packages/admin/src/components/guardian/GuardianStudentsGrid.tsx
  M packages/admin/src/components/guardian/index.ts
  M packages/admin/src/components/index.ts
  M packages/admin/src/components/onboarding/PrincipalOnboardingView.tsx
  M packages/admin/src/components/poa/GuardianChildrenList.tsx
  M packages/admin/src/components/poa/GuardianHeader.tsx
  M packages/admin/src/components/poa/index.ts
  M packages/admin/src/components/principal/CurriculumPulse.tsx
  M packages/admin/src/components/principal/DashboardEcho.tsx
  M packages/admin/src/components/principal/HierarchyBuilder.tsx
  M packages/admin/src/components/principal/InstitutionalCalendarSection.tsx
  M packages/admin/src/components/principal/InviteManager.tsx
  M packages/admin/src/components/principal/LeaveApprovalSection.tsx
  M packages/admin/src/components/principal/ManagementStation.tsx
  M packages/admin/src/components/principal/MorningSituationalBrief.tsx
  M packages/admin/src/components/principal/PrincipalActions.tsx
  M packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx
  M packages/admin/src/components/principal/PrincipalModuleAtlas.tsx
  M packages/admin/src/components/principal/PrincipalNotes.tsx
  M packages/admin/src/components/principal/PrincipalObservationsSection.tsx
  M packages/admin/src/components/principal/PrincipalOnboardingView.tsx
  M packages/admin/src/components/principal/PulseDashboard.tsx
  M packages/admin/src/components/principal/ResourceNeedsDashboard.tsx
  M packages/admin/src/components/principal/SchoolOverview.tsx
  M packages/admin/src/components/principal/SchoolStats.tsx
  M packages/admin/src/components/principal/StaffDirectory.tsx
  M packages/admin/src/components/principal/StaffPulse.tsx
  M packages/admin/src/components/principal/StudentEnrollmentPulse.tsx
  M packages/admin/src/components/principal/TeacherCarousel.tsx
  M packages/admin/src/components/school/CreateSchoolModal.tsx
  M packages/admin/src/components/school/StepBasicInfo.tsx
  M packages/admin/src/components/school/StepDemographics.tsx
  M packages/admin/src/components/school/StepHierarchy.tsx
  M packages/admin/src/components/school/StepLocation.tsx
  M packages/admin/src/constants/adminRegistry.ts
  M packages/admin/src/document-workflow/api.ts
  M packages/admin/src/document-workflow/engine.ts
  M packages/admin/src/document-workflow/types.ts
  M packages/admin/src/entrypoints/founder.ts
  M packages/admin/src/founder/useFounderWorkspaceCanvas.tsx
  M packages/admin/src/founder/workspace.ts
  M packages/admin/src/governance.ts
  M packages/admin/src/guardian/api.ts
  M packages/admin/src/guardian/dashboardProjection.ts
  M packages/admin/src/guardian/index.ts
  M packages/admin/src/guardian/repository.ts
  M packages/admin/src/guardian/types.ts
  M packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx
  M packages/admin/src/guardian/useGuardianWorkspaceData.ts
  M packages/admin/src/guardian/workspace.ts
  M packages/admin/src/hooks/index.ts
  M packages/admin/src/hooks/useAdminWorkspaceSurfaces.tsx
  M packages/admin/src/hooks/useDashboardHooks.ts
  M packages/admin/src/hooks/useSchoolStats.ts
  M packages/admin/src/hooks/useStaffPresence.ts
  M packages/admin/src/index.ts
  M packages/admin/src/insights.ts
  M packages/admin/src/inventory.ts
  M packages/admin/src/invites.ts
  M packages/admin/src/notes.ts
  M packages/admin/src/observations.ts
  M packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx
  M packages/admin/src/principal/usePrincipalWorkspaceSurfaces.tsx
  M packages/admin/src/principal/workspace.ts
  M packages/admin/src/principal/workspacePreview.ts
  M packages/admin/src/reporting.ts
  M packages/admin/src/screens/AcademicCycleManager.tsx
  M packages/admin/src/screens/AdminAuditLog.tsx
  M packages/admin/src/screens/AdminAuthorityRepair.tsx
  M packages/admin/src/screens/AdminDashboard.tsx
  M packages/admin/src/screens/AdminFeatureRegistry.tsx
  M packages/admin/src/screens/AdminIncidentQueue.tsx
  M packages/admin/src/screens/AdminJobControl.tsx
  M packages/admin/src/screens/AdminReleaseControl.tsx
  M packages/admin/src/screens/AdminRoomShell.tsx
  M packages/admin/src/screens/AdminTenantDetail.tsx
  M packages/admin/src/screens/AnalyticsDashboardScreen.tsx
  M packages/admin/src/screens/DocumentListScreen.tsx
  M packages/admin/src/screens/DocumentListScreen.web.tsx
  M packages/admin/src/screens/EnhancedAnalyticsDashboard.web.tsx
  M packages/admin/src/screens/FounderDashboard.tsx
  M packages/admin/src/screens/FounderDashboard.web.tsx
  M packages/admin/src/screens/FounderSchoolDashboard.tsx
  M packages/admin/src/screens/FounderVisionScreen.tsx
  M packages/admin/src/screens/GradeHeadDashboard.tsx
  M packages/admin/src/screens/GuardianDashboard.tsx
  M packages/admin/src/screens/GuardianDashboardScreen.tsx
  M packages/admin/src/screens/PrincipalDashboard.tsx
  M packages/admin/src/screens/PrincipalDashboard.web.tsx
  M packages/admin/src/screens/PrincipalNativeWorkspace.tsx
  M packages/admin/src/screens/PrincipalWorkspaceContainer.tsx
  M packages/admin/src/screens/SchoolCreationScreen.tsx
  M packages/admin/src/screens/SchoolForestScreen.web.tsx
  M packages/admin/src/screens/SchoolProfileScreen.web.tsx
  M packages/admin/src/screens/SectionHeadDashboard.tsx
  M packages/admin/src/screens/guardian/GuardianCommunicationBridgeScreen.tsx
  M packages/admin/src/screens/guardian/GuardianEventsScreen.tsx
  M packages/admin/src/screens/guardian/GuardianNotificationsScreen.tsx
  M packages/admin/src/screens/guardian/GuardianRoomShell.tsx
  M packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx
  M packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx
  M packages/admin/src/screens/principal/CommandCenter.tsx
  M packages/admin/src/screens/principal/CyclesDashboard.tsx
  M packages/admin/src/screens/principal/DashboardContent.tsx
  M packages/admin/src/screens/principal/HierarchyDashboard.tsx
  M packages/admin/src/screens/principal/InstitutionalArcCard.tsx
  M packages/admin/src/screens/principal/InvitesDashboard.tsx
  M packages/admin/src/screens/principal/LegacyDashboard.tsx
  M packages/admin/src/screens/principal/LogbookDashboard.tsx
  M packages/admin/src/screens/principal/PendingApprovals.tsx
  M packages/admin/src/screens/principal/PrincipalFeatureRegistry.ts
  M packages/admin/src/screens/principal/PrincipalIAScope.ts
  M packages/admin/src/screens/principal/PrincipalRoomShell.tsx
  M packages/admin/src/screens/principal/StudentPulse.tsx
  M packages/admin/src/sections.ts
  M packages/admin/src/staff.ts
  M packages/admin/src/structure.ts
  M packages/admin/tsconfig.json

[PKG] ai
  M packages/ai/src/api/agents.ts
  M packages/ai/src/api/index.ts
  M packages/ai/src/hooks/index.ts
  M packages/ai/src/hooks/useAIAgent.ts
  M packages/ai/src/index.ts
  M packages/ai/src/screens/AIAssistantScreen.tsx
  M packages/ai/src/screens/AIAssistantScreen.web.tsx
  M packages/ai/src/screens/index.ts
  M packages/ai/tsconfig.json

[PKG] analytics
  M packages/analytics/index.d.ts
  M packages/analytics/src/components/AnalyticsChart.d.ts
  M packages/analytics/src/components/AnalyticsChart.js
  M packages/analytics/src/components/AnalyticsChart.tsx
  M packages/analytics/src/components/AnalyticsProvider.d.ts
  M packages/analytics/src/components/AnalyticsProvider.js
  M packages/analytics/src/components/AnalyticsProvider.tsx
  M packages/analytics/src/components/AnalyticsProvider.web.d.ts
  M packages/analytics/src/components/AnalyticsProvider.web.js
  M packages/analytics/src/components/AnalyticsProvider.web.tsx
  M packages/analytics/src/components/GPAInsights.d.ts
  M packages/analytics/src/components/GPAInsights.js
  M packages/analytics/src/components/GPAInsights.tsx
  M packages/analytics/src/components/PerformanceDashboard.d.ts
  M packages/analytics/src/components/PerformanceDashboard.js
  M packages/analytics/src/components/PerformanceDashboard.tsx
  M packages/analytics/src/components/index.d.ts
  M packages/analytics/src/components/index.js
  M packages/analytics/src/components/index.ts
  M packages/analytics/src/context/ActivityPulseContext.d.ts
  M packages/analytics/src/context/ActivityPulseContext.js
  M packages/analytics/src/context/ActivityPulseContext.tsx
  M packages/analytics/src/engine/GPACalculator.d.ts
  M packages/analytics/src/engine/GPACalculator.js
  M packages/analytics/src/engine/GPACalculator.ts
  M packages/analytics/src/engine/PerformanceAnalyzer.d.ts
  M packages/analytics/src/engine/PerformanceAnalyzer.js
  M packages/analytics/src/engine/PerformanceAnalyzer.ts
  M packages/analytics/src/engine/PostHogAnalytics.d.ts
  M packages/analytics/src/engine/PostHogAnalytics.js
  M packages/analytics/src/engine/PostHogAnalytics.native.d.ts
  M packages/analytics/src/engine/PostHogAnalytics.native.js
  M packages/analytics/src/engine/PostHogAnalytics.native.ts
  M packages/analytics/src/engine/PostHogAnalytics.ts
  M packages/analytics/src/engine/PostHogAnalytics.web.d.ts
  M packages/analytics/src/engine/PostHogAnalytics.web.js
  M packages/analytics/src/engine/PostHogAnalytics.web.ts
  M packages/analytics/src/engine/index.ts
  M packages/analytics/src/hooks/index.d.ts
  M packages/analytics/src/hooks/index.js
  M packages/analytics/src/hooks/index.ts
  M packages/analytics/src/hooks/queries.d.ts
  M packages/analytics/src/hooks/queries.js
  M packages/analytics/src/hooks/queries.ts
  M packages/analytics/src/hooks/useAnalytics.d.ts
  M packages/analytics/src/hooks/useAnalytics.js
  M packages/analytics/src/hooks/useAnalytics.ts
  M packages/analytics/src/hooks/usePerformanceData.d.ts
  M packages/analytics/src/hooks/usePerformanceData.js
  M packages/analytics/src/hooks/usePerformanceData.ts
  M packages/analytics/src/hooks/usePredictions.d.ts
  M packages/analytics/src/hooks/usePredictions.js
  M packages/analytics/src/hooks/usePredictions.ts
  M packages/analytics/src/index.d.ts
  M packages/analytics/src/index.js
  M packages/analytics/src/index.native.d.ts
  M packages/analytics/src/index.native.js
  M packages/analytics/src/index.native.ts
  M packages/analytics/src/index.ts
  M packages/analytics/src/ml/InsightGenerator.d.ts
  M packages/analytics/src/ml/InsightGenerator.js
  M packages/analytics/src/ml/InsightGenerator.ts
  M packages/analytics/src/ml/Predictor.d.ts
  M packages/analytics/src/ml/Predictor.js
  M packages/analytics/src/ml/Predictor.ts
  M packages/analytics/src/ml/index.ts
  M packages/analytics/src/types/AnalyticsTypes.d.ts
  M packages/analytics/src/types/AnalyticsTypes.ts
  M packages/analytics/src/types/GradingTypes.d.ts
  M packages/analytics/src/types/GradingTypes.js
  M packages/analytics/src/types/GradingTypes.ts
  M packages/analytics/src/types/index.ts
  M packages/analytics/src/ui.d.ts
  M packages/analytics/src/ui.js
  M packages/analytics/src/ui.ts
  M packages/analytics/src/utils/analyticsHelpers.d.ts
  M packages/analytics/src/utils/analyticsHelpers.js
  M packages/analytics/src/utils/analyticsHelpers.ts
  M packages/analytics/src/utils/benchmarking.d.ts
  M packages/analytics/src/utils/benchmarking.js
  M packages/analytics/src/utils/benchmarking.ts
  M packages/analytics/tsconfig.json

[PKG] classroom
  M packages/classroom/eslint.config.mjs
  M packages/classroom/src/analytics.ts
  M packages/classroom/src/components/AddStudentModal.tsx
  M packages/classroom/src/components/AttendanceSheet.tsx
  M packages/classroom/src/components/AttendanceView.tsx
  M packages/classroom/src/components/BulkStudentCreation.tsx
  M packages/classroom/src/components/ClaimInviteModal.tsx
  M packages/classroom/src/components/ClassroomEchoSection.tsx
  M packages/classroom/src/components/ClassroomHolisticInsights.tsx
  M packages/classroom/src/components/ClassroomList.tsx
  M packages/classroom/src/components/ClassroomNotes.tsx
  M packages/classroom/src/components/CreateClassroomModal.tsx
  M packages/classroom/src/components/CreateSchoolModal.tsx
  M packages/classroom/src/components/GlobalCreateModal.tsx
  M packages/classroom/src/components/GradebookView.tsx
  M packages/classroom/src/components/GroupManager.tsx
  M packages/classroom/src/components/IdentityInitialState.tsx
  M packages/classroom/src/components/InventoryView.tsx
  M packages/classroom/src/components/OCRScanner.tsx
  M packages/classroom/src/components/OCRStudentImport.tsx
  M packages/classroom/src/components/QuickAnalytics.tsx
  M packages/classroom/src/components/ResourcesView.tsx
  M packages/classroom/src/components/StudentList.tsx
  M packages/classroom/src/components/SubmissionModal.tsx
  M packages/classroom/src/components/SubmissionModal.web.tsx
  M packages/classroom/src/components/grading/GradeEntryForm.tsx
  M packages/classroom/src/components/grading/GradebookTable.tsx
  M packages/classroom/src/components/grading/GradingSettings.tsx
  M packages/classroom/src/components/grading/ReportCard.tsx
  M packages/classroom/src/components/index.ts
  M packages/classroom/src/components/onboarding/PrincipalOnboardingView.web.tsx
  M packages/classroom/src/components/onboarding/StudentOnboardingView.tsx
  M packages/classroom/src/components/onboarding/StudentOnboardingView.web.tsx
  M packages/classroom/src/components/onboarding/TeacherOnboardingView.tsx
  M packages/classroom/src/components/onboarding/TeacherOnboardingView.web.tsx
  M packages/classroom/src/components/onboarding/index.ts
  M packages/classroom/src/components/poa/CreateClassroomAction.tsx
  M packages/classroom/src/components/poa/MyEchoesAction.tsx
  M packages/classroom/src/components/poa/PrincipalEchoAction.tsx
  M packages/classroom/src/components/poa/ScanQRAction.tsx
  M packages/classroom/src/components/poa/TeacherActions.tsx
  M packages/classroom/src/components/poa/TeacherEchoActions.tsx
  M packages/classroom/src/components/poa/TeacherPrimaryActions.tsx
  M packages/classroom/src/components/poa/index.ts
  M packages/classroom/src/components/student/StudentClassroomList.tsx
  M packages/classroom/src/components/student/StudentGoals.tsx
  M packages/classroom/src/components/student/StudentGradesOverview.tsx
  M packages/classroom/src/components/student/StudentGrowthPoints.tsx
  M packages/classroom/src/components/student/StudentHeader.tsx
  M packages/classroom/src/components/student/StudentProgressOverview.tsx
  M packages/classroom/src/components/student/StudentStats.tsx
  M packages/classroom/src/components/student/StudentStudySuite.tsx
  M packages/classroom/src/components/student/StudentUpcomingAssignments.tsx
  M packages/classroom/src/components/student/index.ts
  M packages/classroom/src/components/teacher/TeacherAdminActions.tsx
  M packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx
  M packages/classroom/src/components/teacher/TeacherAssignmentsSidebar.tsx
  M packages/classroom/src/components/teacher/TeacherAssignmentsWorkspace.tsx
  M packages/classroom/src/components/teacher/TeacherClassroomList.tsx
  M packages/classroom/src/components/teacher/TeacherGroupsModal.tsx
  M packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx
  M packages/classroom/src/components/teacher/TeacherSnapshot.tsx
  M packages/classroom/src/components/teacher/TeacherStats.tsx
  M packages/classroom/src/components/teacher/TeacherWorkspaceShell.tsx
  M packages/classroom/src/components/teacher/index.ts
  M packages/classroom/src/constants/classroomRegistry.ts
  M packages/classroom/src/entrypoints/core.ts
  M packages/classroom/src/entrypoints/student.ts
  M packages/classroom/src/entrypoints/teacher.ts
  M packages/classroom/src/hooks/index.ts
  M packages/classroom/src/hooks/useAttendance.ts
  M packages/classroom/src/hooks/useClassroomProfile.ts
  M packages/classroom/src/hooks/useClassroomRoleData.ts
  M packages/classroom/src/hooks/useEcosystemStats.ts
  M packages/classroom/src/hooks/useGradebook.ts
  M packages/classroom/src/hooks/useInventory.ts
  M packages/classroom/src/hooks/usePrincipalObservations.ts
  M packages/classroom/src/hooks/useResources.ts
  M packages/classroom/src/hooks/useSchoolInvites.ts
  M packages/classroom/src/hooks/useSchoolStats.ts
  M packages/classroom/src/hooks/useStudentDashboardHooks.ts
  M packages/classroom/src/hooks/useTeacherDashboardHooks.ts
  M packages/classroom/src/index.ts
  M packages/classroom/src/logic/reportGenerator.ts
  M packages/classroom/src/screens/AttendanceReportScreen.tsx
  M packages/classroom/src/screens/AttendanceScreen.tsx
  M packages/classroom/src/screens/AttendanceScreen.web.tsx
  M packages/classroom/src/screens/ClassroomDetailScreen.web.tsx
  M packages/classroom/src/screens/ClassroomProfileScreen.web.tsx
  M packages/classroom/src/screens/ClassroomScreen.tsx
  M packages/classroom/src/screens/ClassroomScreen.web.tsx
  M packages/classroom/src/screens/ContentLibrary.tsx
  M packages/classroom/src/screens/DemoPlaygroundPanel.web.tsx
  M packages/classroom/src/screens/GradebookScreen.tsx
  M packages/classroom/src/screens/GradebookScreen.web.tsx
  M packages/classroom/src/screens/LessonFeed.tsx
  M packages/classroom/src/screens/NoSchoolView.web.tsx
  M packages/classroom/src/screens/PrincipalDashboard.web.tsx
  M packages/classroom/src/screens/StudentClassroomDashboard.tsx
  M packages/classroom/src/screens/StudentDashboard.tsx
  M packages/classroom/src/screens/StudentDashboard.web.tsx
  M packages/classroom/src/screens/StudentProfileScreen.tsx
  M packages/classroom/src/screens/TeacherClassroomDashboard.tsx
  M packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx
  M packages/classroom/src/screens/TeacherDashboard.tsx
  M packages/classroom/src/screens/TeacherDashboard.web.tsx
  M packages/classroom/src/screens/TimetableScreen.web.tsx
  M packages/classroom/src/screens/index.ts
  M packages/classroom/src/shared/GuestConversionPrompt.tsx
  M packages/classroom/src/student/workspace.ts
  M packages/classroom/src/student/workspacePreview.ts
  M packages/classroom/src/teacher/workspacePreview.ts
  M packages/classroom/src/types/global.d.ts
  M packages/classroom/src/types/index.ts
  M packages/classroom/src/types/workspace.ts
  M packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx
  M packages/classroom/src/workspace/useClassroomWorkspaceInsights.ts
  M packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts
  M packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx
  M packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts
  M packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx
  M packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx
  M packages/classroom/src/workspace/useStudentWorkspaceData.ts
  M packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts
  M packages/classroom/src/workspace/useTeacherDashboardSurfaces.tsx
  M packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx
  M packages/classroom/tsconfig.json

[PKG] community
  M packages/community/eslint.config.mjs
  M packages/community/src/api/community.ts
  M packages/community/src/api/index.ts
  M packages/community/src/api/presence.ts
  M packages/community/src/api/sacredMissions.ts
  M packages/community/src/components/CommentSheet.tsx
  M packages/community/src/components/CommunityHearth.tsx
  M packages/community/src/components/CommunityPresence.tsx
  M packages/community/src/components/CommunityPresence.web.tsx
  M packages/community/src/components/CreateGroupModal.tsx
  M packages/community/src/components/CreatePostModal.tsx
  M packages/community/src/components/GroupCard.tsx
  M packages/community/src/components/GroupMemberManagement.tsx
  M packages/community/src/components/HeaderMoreMenu.tsx
  M packages/community/src/components/ManifestoCard.tsx
  M packages/community/src/components/PinnedResourcesShelf.tsx
  M packages/community/src/components/PostCard.tsx
  M packages/community/src/components/SocialShieldModal.tsx
  M packages/community/src/components/index.ts
  M packages/community/src/constants/communityRegistry.ts
  M packages/community/src/hooks/index.ts
  M packages/community/src/hooks/useCommunity.ts
  M packages/community/src/hooks/useCommunityGroups.ts
  M packages/community/src/hooks/useCommunityPresence.ts
  M packages/community/src/hooks/useComposerLogic.ts
  M packages/community/src/hooks/useSocialShield.ts
  M packages/community/src/index.ts
  M packages/community/src/nativewind-env.d.ts
  M packages/community/src/screens/AnnouncementsScreen.tsx
  M packages/community/src/screens/BaseChatScreen.tsx
  M packages/community/src/screens/CommunityScreen.tsx
  M packages/community/src/screens/CommunityScreen.web.tsx
  M packages/community/src/screens/DirectMessageScreen.tsx
  M packages/community/src/screens/DirectMessageScreen.web.tsx
  M packages/community/src/screens/DirectMessagesListScreen.tsx
  M packages/community/src/screens/GroupChatScreen.tsx
  M packages/community/src/screens/GroupChatScreen.web.tsx
  M packages/community/src/screens/GroupDetailsScreen.tsx
  M packages/community/src/screens/GroupDetailsScreen.web.tsx
  M packages/community/src/screens/GroupsScreen.tsx
  M packages/community/src/screens/InvitationWelcomeScreen.tsx
  M packages/community/src/screens/InviteCodeEntry.tsx
  M packages/community/src/screens/UserPublicProfileScreen.tsx
  M packages/community/src/screens/UserPublicProfileScreen.web.tsx
  M packages/community/src/screens/communityWorkspace.shared.ts
  M packages/community/src/screens/index.ts
  M packages/community/src/types/Community.ts
  M packages/community/src/types/global.d.ts
  M packages/community/src/types/index.ts
  M packages/community/tsconfig.json

[PKG] core
  M packages/core/package.json
  M packages/core/scratch/analyze_lint.js
  M packages/core/scratch/extract_errors.cjs
  M packages/core/scratch/summarize_eslint.cjs
  M packages/core/src/__tests__/sanity.test.ts
  M packages/core/src/__tests__/workspace/canvas.test.ts
  M packages/core/src/adapters/events/inngest.adapter.ts
  M packages/core/src/adapters/native/FallbackMMKVStorageAdapter.ts
  M packages/core/src/adapters/native/NativeDeviceIdentityAdapter.ts
  M packages/core/src/adapters/native/SentryTelemetryAdapter.ts
  M packages/core/src/adapters/native/SimulatorDeviceIdentityAdapter.ts
  M packages/core/src/adapters/powersync/PowerSyncGate.tsx
  M packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts
  M packages/core/src/adapters/powersync/database.ts
  A packages/core/src/adapters/powersync/forms.adapter.ts
  M packages/core/src/adapters/powersync/hooks.ts
  M packages/core/src/adapters/powersync/index.ts
  M packages/core/src/adapters/powersync/schema.ts
  M packages/core/src/adapters/realtime/supabase.adapter.ts
  M packages/core/src/adapters/storage/cloudinary.adapter.ts
  M packages/core/src/adapters/storage/supabase.adapter.ts
  M packages/core/src/adapters/supabase/auditRepository.ts
  M packages/core/src/adapters/supabase/auth.adapter.ts
  M packages/core/src/adapters/supabase/communityRepository.ts
  M packages/core/src/adapters/supabase/educational/assignmentRepository.ts
  M packages/core/src/adapters/supabase/educational/attendanceRepository.ts
  M packages/core/src/adapters/supabase/educational/classroomRepository.ts
  M packages/core/src/adapters/supabase/educational/enrollmentRepository.ts
  M packages/core/src/adapters/supabase/educational/gradingRepository.ts
  M packages/core/src/adapters/supabase/educational/index.ts
  M packages/core/src/adapters/supabase/educational/lessonRepository.ts
  M packages/core/src/adapters/supabase/educational/materialRepository.ts
  M packages/core/src/adapters/supabase/educational/schoolRepository.ts
  A packages/core/src/adapters/supabase/forms.adapter.ts
  M packages/core/src/adapters/supabase/globalConfig.adapter.ts
  M packages/core/src/adapters/supabase/growth.adapter.ts
  M packages/core/src/adapters/supabase/principalWorkspaceRepository.ts
  M packages/core/src/adapters/supabase/profileRepository.ts
  M packages/core/src/adapters/supabase/schoolRepository.ts
  M packages/core/src/adapters/supabase/teacherRepository.ts
  M packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  M packages/core/src/adapters/supabaseIdentity.adapter.ts
  M packages/core/src/adapters/supabaseNotification.adapter.ts
  M packages/core/src/adapters/supabasePushNotification.adapter.ts
  M packages/core/src/adapters/zenstack/profileRepository.ts
  M packages/core/src/api/__tests__/attendance-poa.test.ts
  M packages/core/src/api/__tests__/founder-guardian-poa.test.ts
  M packages/core/src/api/__tests__/grading-poa.test.ts
  M packages/core/src/api/__tests__/longitudinal-poa.test.ts
  M packages/core/src/api/__tests__/principal-workspace-poa.test.ts
  M packages/core/src/api/__tests__/schemas.test.ts
  M packages/core/src/api/__tests__/simple.test.ts
  M packages/core/src/api/__tests__/teacher-insights-poa.test.ts
  M packages/core/src/api/__tests__/workspace-layout-poa.test.ts
  M packages/core/src/api/academicCycles.ts
  M packages/core/src/api/admin.contract.ts
  M packages/core/src/api/announcements.ts
  M packages/core/src/api/assignments.ts
  M packages/core/src/api/attendance.effect.ts
  M packages/core/src/api/attendance.ts
  M packages/core/src/api/base.ts
  M packages/core/src/api/classroom.ts
  M packages/core/src/api/classroomGroups.ts
  M packages/core/src/api/classroomNotes.contract.ts
  M packages/core/src/api/classroomNotes.ts
  M packages/core/src/api/classroomStudents.ts
  M packages/core/src/api/classrooms.ts
  M packages/core/src/api/community.contract.ts
  M packages/core/src/api/community.ts
  M packages/core/src/api/contextualChallenges.ts
  M packages/core/src/api/contract.ts
  M packages/core/src/api/dailyContent.ts
  M packages/core/src/api/deviceTrust.ts
  M packages/core/src/api/educational.contract.ts
  M packages/core/src/api/erp.contract.ts
  M packages/core/src/api/erp.ts
  M packages/core/src/api/formTemplates.ts
  M packages/core/src/api/founder.contract.ts
  M packages/core/src/api/founder.ts
  M packages/core/src/api/grading.contract.ts
  M packages/core/src/api/grading.ts
  M packages/core/src/api/groups.ts
  M packages/core/src/api/growth.contract.ts
  M packages/core/src/api/growthSignals.generated.ts
  M packages/core/src/api/growthSignals.ts
  M packages/core/src/api/guardian.contract.ts
  M packages/core/src/api/guardian.ts
  M packages/core/src/api/handlers/admin.ts
  M packages/core/src/api/handlers/community.ts
  M packages/core/src/api/handlers/educational.ts
  M packages/core/src/api/handlers/grading.ts
  M packages/core/src/api/handlers/identity.ts
  M packages/core/src/api/handlers/library.ts
  M packages/core/src/api/handlers/operations.ts
  M packages/core/src/api/handlers/profile.ts
  M packages/core/src/api/handlers/self.ts
  A packages/core/src/api/handlers/sync.ts
  M packages/core/src/api/history.ts
  M packages/core/src/api/hooks/comment.hooks.ts
  M packages/core/src/api/hooks/community.hooks.ts
  M packages/core/src/api/hooks/notification.hooks.ts
  M packages/core/src/api/hooks/poll.hooks.ts
  M packages/core/src/api/hooks/presence.hooks.ts
  M packages/core/src/api/identity.contract.ts
  M packages/core/src/api/identity.generated.ts
  M packages/core/src/api/identity.ts
  M packages/core/src/api/impactRipples.ts
  M packages/core/src/api/index.ts
  M packages/core/src/api/inventory.ts
  M packages/core/src/api/lessonMaterials.ts
  M packages/core/src/api/library.contract.ts
  M packages/core/src/api/library.ts
  M packages/core/src/api/longitudinal.contract.ts
  M packages/core/src/api/longitudinal.ts
  M packages/core/src/api/mapping.ts
  M packages/core/src/api/media.ts
  M packages/core/src/api/messaging.ts
  M packages/core/src/api/mockData.ts
  M packages/core/src/api/naturePaths.ts
  M packages/core/src/api/onboarding.ts
  M packages/core/src/api/operations.contract.ts
  M packages/core/src/api/orchestration/community.ts
  M packages/core/src/api/orchestration/educational.ts
  M packages/core/src/api/orchestration/growth.ts
  M packages/core/src/api/orchestration/identity.ts
  M packages/core/src/api/orchestration/operations.ts
  M packages/core/src/api/orchestration/specialized.ts
  M packages/core/src/api/poaProxy.ts
  M packages/core/src/api/presence.ts
  M packages/core/src/api/principalNotes.ts
  M packages/core/src/api/principalWorkspace.contract.ts
  M packages/core/src/api/principalWorkspace.ts
  M packages/core/src/api/pro.contract.ts
  M packages/core/src/api/profile.contract.ts
  M packages/core/src/api/profile.ts
  M packages/core/src/api/resources.ts
  M packages/core/src/api/runtimes/attendanceProjection.runtime.ts
  M packages/core/src/api/runtimes/classroomNotes.runtime.ts
  M packages/core/src/api/runtimes/educational.runtime.ts
  M packages/core/src/api/runtimes/founder.runtime.ts
  M packages/core/src/api/runtimes/gradingProjection.runtime.ts
  M packages/core/src/api/runtimes/guardian.runtime.ts
  M packages/core/src/api/runtimes/principalWorkspace.runtime.ts
  M packages/core/src/api/runtimes/teacherInsights.runtime.ts
  M packages/core/src/api/runtimes/workspaceLayout.runtime.ts
  M packages/core/src/api/sacredMissions.ts
  M packages/core/src/api/school.ts
  M packages/core/src/api/schoolForest.ts
  M packages/core/src/api/self.contract.ts
  M packages/core/src/api/social.ts
  M packages/core/src/api/staffManagement.ts
  M packages/core/src/api/studentObservations.ts
  M packages/core/src/api/studentPotential.ts
  M packages/core/src/api/supabase.ts
  A packages/core/src/api/sync.contract.ts
  M packages/core/src/api/teacher.ts
  M packages/core/src/api/teacherInsights.contract.ts
  M packages/core/src/api/teacherInsights.ts
  M packages/core/src/api/thuthimal.ts
  M packages/core/src/api/userGrowthState.ts
  M packages/core/src/api/warmMirror.ts
  M packages/core/src/api/workspaceLayout.contract.ts
  M packages/core/src/api/workspaceLayout.ts
  M packages/core/src/hooks/index.ts
  M packages/core/src/hooks/useAuthorityFeatures.ts
  M packages/core/src/hooks/useAuthorityLifecycle.ts
  M packages/core/src/hooks/useBanyanGrowth.ts
  M packages/core/src/hooks/useDeviceAccounts.ts
  M packages/core/src/hooks/useDeviceSecurity.ts
  M packages/core/src/hooks/useFeatureAccess.ts
  M packages/core/src/hooks/useFeatureRegistry.ts
  M packages/core/src/hooks/useForm.ts
  M packages/core/src/hooks/useJourneyHistory.ts
  A packages/core/src/hooks/useLocalPermission.ts
  M packages/core/src/hooks/useManualSnapshot.ts
  M packages/core/src/hooks/useNaturePaths.ts
  M packages/core/src/hooks/useNotifications.ts
  M packages/core/src/hooks/useSafeMutation.ts
  M packages/core/src/hooks/useTemporalHeatmap.ts
  M packages/core/src/hooks/useTenantContext.ts
  M packages/core/src/index.ts
  M packages/core/src/lib/authorization.ts
  M packages/core/src/lib/errors.ts
  M packages/core/src/lib/gradePublication.ts
  M packages/core/src/lib/index.ts
  M packages/core/src/lib/permissions.ts
  M packages/core/src/lib/sync/delta.ts
  M packages/core/src/lib/sync/hooks/useSyncStatus.ts
  M packages/core/src/lib/sync/registry.ts
  M packages/core/src/lib/sync/sync/SyncManager.tsx
  M packages/core/src/lib/sync/useMutationQueue.ts
  M packages/core/src/logic/domains/community/ports.ts
  M packages/core/src/logic/domains/educational/ports.ts
  M packages/core/src/logic/domains/educational/services.ts
  M packages/core/src/logic/domains/factory.ts
  M packages/core/src/logic/domains/profile/index.ts
  M packages/core/src/logic/domains/profile/onboarding.ts
  M packages/core/src/logic/domains/profile/ports.ts
  M packages/core/src/logic/domains/teacher/ports.ts
  M packages/core/src/logic/events/producers.ts
  M packages/core/src/logic/experience/ActivityPulseContext.tsx
  M packages/core/src/logic/forms/analytics.ts
  M packages/core/src/logic/forms/dynamic-loader.ts
  M packages/core/src/logic/forms/form-manager.ts
  M packages/core/src/logic/forms/index.ts
  M packages/core/src/logic/i18n/config.ts
  M packages/core/src/logic/index.ts
  M packages/core/src/logic/interfaces/deviceIdentity.port.ts
  M packages/core/src/logic/managers/AuditManager.ts
  M packages/core/src/logic/managers/AuthManager.ts
  M packages/core/src/logic/managers/CommunityManager.ts
  M packages/core/src/logic/managers/DeepLinkManager.ts
  M packages/core/src/logic/managers/DeviceIdentityManager.ts
  M packages/core/src/logic/managers/DeviceSecurityManager.ts
  M packages/core/src/logic/managers/EducationalManager.ts
  M packages/core/src/logic/managers/GlobalConfigManager.ts
  M packages/core/src/logic/managers/GrowthManager.ts
  M packages/core/src/logic/managers/IdentityManager.ts
  M packages/core/src/logic/managers/MediaManager.ts
  M packages/core/src/logic/managers/NotificationManager.ts
  M packages/core/src/logic/managers/ProfileManager.ts
  M packages/core/src/logic/managers/PushNotificationManager.ts
  M packages/core/src/logic/managers/RealtimeManager.ts
  M packages/core/src/logic/managers/StorageManager.ts
  M packages/core/src/logic/managers/TeacherInsightsManager.ts
  M packages/core/src/logic/managers/TeacherManager.ts
  M packages/core/src/logic/managers/auth.factory.ts
  M packages/core/src/logic/managers/community.factory.ts
  M packages/core/src/logic/managers/educational.factory.ts
  M packages/core/src/logic/managers/factory.ts
  M packages/core/src/logic/managers/growth.factory.ts
  M packages/core/src/logic/managers/identity.factory.ts
  M packages/core/src/logic/managers/media.factory.ts
  M packages/core/src/logic/managers/misc.factory.ts
  M packages/core/src/logic/managers/notification.factory.ts
  M packages/core/src/logic/managers/profile.factory.ts
  M packages/core/src/logic/permissions/AuthorityInterceptor.ts
  M packages/core/src/logic/permissions/abilities/admin.ts
  M packages/core/src/logic/permissions/abilities/gradeHead.ts
  M packages/core/src/logic/permissions/abilities/parent.ts
  M packages/core/src/logic/permissions/abilities/principal.ts
  M packages/core/src/logic/permissions/abilities/sectionHead.ts
  M packages/core/src/logic/permissions/abilities/student.ts
  M packages/core/src/logic/permissions/abilities/teacher.ts
  D packages/core/src/logic/permissions/composer.test.ts
  D packages/core/src/logic/permissions/composer.ts
  M packages/core/src/logic/permissions/feature-engine.ts
  M packages/core/src/logic/permissions/hooks/usePermissions.ts
  M packages/core/src/logic/permissions/index.ts
  M packages/core/src/logic/permissions/localEvaluator.native.ts
  A packages/core/src/logic/permissions/localEvaluator.ts
  A packages/core/src/logic/permissions/signature.ts
  M packages/core/src/logic/ports/auth.port.ts
  M packages/core/src/logic/ports/deviceSecurity.port.ts
  M packages/core/src/logic/ports/eventBus.port.ts
  M packages/core/src/logic/ports/growth.port.ts
  M packages/core/src/logic/ports/identity.port.ts
  M packages/core/src/logic/ports/notification.port.ts
  M packages/core/src/logic/ports/pushNotification.port.ts
  M packages/core/src/logic/ports/realtime.port.ts
  M packages/core/src/logic/ports/storage.port.ts
  M packages/core/src/logic/runtimeRegistry.ts
  M packages/core/src/logic/schemas/accounting.schema.ts
  M packages/core/src/logic/schemas/attendance.schema.ts
  M packages/core/src/logic/schemas/classroom-note.schema.ts
  M packages/core/src/logic/schemas/classroom.schema.ts
  M packages/core/src/logic/schemas/community.schema.ts
  M packages/core/src/logic/schemas/founder.schema.ts
  M packages/core/src/logic/schemas/grading.schema.ts
  M packages/core/src/logic/schemas/growth.schema.ts
  M packages/core/src/logic/schemas/guardian.schema.ts
  M packages/core/src/logic/schemas/identity.schema.ts
  M packages/core/src/logic/schemas/index.ts
  M packages/core/src/logic/schemas/inventory_item.schema.ts
  M packages/core/src/logic/schemas/lesson.schema.ts
  M packages/core/src/logic/schemas/library.schema.ts
  M packages/core/src/logic/schemas/material.schema.ts
  M packages/core/src/logic/schemas/payments.schema.ts
  M packages/core/src/logic/schemas/pro.schema.ts
  M packages/core/src/logic/schemas/school.schema.ts
  M packages/core/src/logic/schemas/self.schema.ts
  M packages/core/src/logic/schemas/staff.schema.ts
  M packages/core/src/logic/schemas/student.schema.ts
  M packages/core/src/logic/schemas/temporal.schema.ts
  M packages/core/src/logic/schemas/user.schema.ts
  M packages/core/src/logic/store-slices/auth.slice.ts
  M packages/core/src/logic/utils/QRResolver.ts
  M packages/core/src/logic/utils/errorNormalizer.ts
  M packages/core/src/logic/utils/idempotency.ts
  M packages/core/src/logic/utils/temporalUtils.ts
  M packages/core/src/logic/workspace/canvas.ts
  M packages/core/src/logic/workspace/index.ts
  M packages/core/src/native/bootstrap.ts
  M packages/core/src/native/deviceTrust.ts
  M packages/core/src/native/flows/FlowResolver.ts
  M packages/core/src/native/guestDataSync.ts
  M packages/core/src/native/index.ts
  M packages/core/src/native/runtimeAdapter.ts
  M packages/core/src/native/sentry.ts
  M packages/core/src/native/useAuthorityLifecycle.ts
  M packages/core/src/native/useWorkspaceLayoutSync.ts
  M packages/core/src/providers/AuthProvider.tsx
  M packages/core/src/store/index.ts
  M packages/core/src/store/resetScopedStores.ts
  M packages/core/src/store/slices/auth.slice.ts
  M packages/core/src/store/slices/feature.slice.ts
  M packages/core/src/store/useAuthStore.ts
  M packages/core/src/store/useConflictStore.ts
  M packages/core/src/store/useDeviceSecurityStore.ts
  M packages/core/src/store/useNotificationStore.ts
  A packages/core/src/store/usePermissionStore.ts
  M packages/core/src/store/useStore.ts
  M packages/core/src/types/API.ts
  M packages/core/src/types/Authority.ts
  M packages/core/src/types/Errors.ts
  M packages/core/src/types/Growth.ts
  M packages/core/src/types/Identity.ts
  M packages/core/src/types/School.ts
  M packages/core/src/types/User.ts
  M packages/core/src/types/external-modules.d.ts
  M packages/core/src/types/index.ts
  M packages/core/src/types/runtime.ts
  M packages/core/src/utils/random.ts
  M packages/core/s
rc/utils/temporal.ts
  M packages/core/tsconfig.json
  M packages/core/vitest.config.ts

[PKG] eslint-config
  M packages/eslint-config/base.js
  M packages/eslint-config/next.js
  M packages/eslint-config/react-internal.js
  M packages/eslint-config/rules/max-use-state.js

[PKG] form-builder
  A packages/form-builder-engine/package.json
  A packages/form-builder-engine/src/adapters/interfaces.ts
  A packages/form-builder-engine/src/analytics/AnalyticsEngine.ts
  A packages/form-builder-engine/src/hydrator/FormHydrator.ts
  A packages/form-builder-engine/src/index.ts
  A packages/form-builder-engine/src/manager/FormManager.ts
  A packages/form-builder-engine/src/schema/FormSchema.ts
  A packages/form-builder-engine/src/validation/ValidationEngine.ts
  A packages/form-builder-engine/tsconfig.json
  M packages/form-builder/docs/form-builder-operationalization.md
  M packages/form-builder/eslint.config.mjs
  M packages/form-builder/package.json
  M packages/form-builder/src/DynamicFormDemo.tsx
  M packages/form-builder/src/FormBuilder.tsx
  M packages/form-builder/src/NativeForm.tsx
  M packages/form-builder/src/apps/index.ts
  M packages/form-builder/src/apps/resilience-sensing-schema.ts
  M packages/form-builder/src/components/FormLikert.tsx
  M packages/form-builder/src/components/FormSelect.tsx
  M packages/form-builder/src/components/FormSlider.tsx
  M packages/form-builder/src/components/index.ts
  M packages/form-builder/src/engine/index.ts
  M packages/form-builder/src/index.ts
  M packages/form-builder/src/screens/ClimateSensingScreen.tsx
  M packages/form-builder/src/screens/ClimateSensingScreen.web.tsx
  M packages/form-builder/src/screens/FormBuilderScreen.web.tsx
  M packages/form-builder/src/screens/PublicFormScreen.web.tsx
  M packages/form-builder/src/screens/index.ts
  M packages/form-builder/tsconfig.json

[PKG] graphics
  M packages/graphics/eslint.config.mjs
  M packages/graphics/src/algorithms/CaptureEngine.ts
  M packages/graphics/src/algorithms/CatchmentAnalysis.ts
  M packages/graphics/src/algorithms/GeoThematicEngine.ts
  M packages/graphics/src/algorithms/KnowledgeParser.ts
  M packages/graphics/src/algorithms/index.ts
  M packages/graphics/src/algorithms/perspective.ts
  M packages/graphics/src/charts/AnalyticsCharts.tsx
  M packages/graphics/src/charts/AnalyticsEngine.tsx
  M packages/graphics/src/charts/GiftedCharts.tsx
  M packages/graphics/src/charts/HeatmapChart.tsx
  M packages/graphics/src/charts/InteractiveChat.tsx
  M packages/graphics/src/charts/RadarSpiderChart.tsx
  M packages/graphics/src/charts/SankeyDiagram.tsx
  M packages/graphics/src/charts/TimelineChart.tsx
  M packages/graphics/src/charts/index.ts
  M packages/graphics/src/components/CollaborativeGrove.tsx
  M packages/graphics/src/components/ResonanceVisualizer.tsx
  M packages/graphics/src/components/SanctuaryCanvas.tsx
  M packages/graphics/src/components/index.ts
  M packages/graphics/src/components/maps/CatchmentOverlay.tsx
  M packages/graphics/src/components/maps/GeographicPerspective.tsx
  M packages/graphics/src/components/maps/GeospatialStudio.tsx
  M packages/graphics/src/components/maps/SriLankaMap.tsx
  M packages/graphics/src/data/AdministrativeHierarchy.ts
  M packages/graphics/src/data/PostalCodes.ts
  M packages/graphics/src/data/index.ts
  M packages/graphics/src/hooks/index.ts
  M packages/graphics/src/hooks/useGeoData.ts
  M packages/graphics/src/hooks/useSriLankaLocation.ts
  M packages/graphics/src/index.ts
  M packages/graphics/src/layouts/forceLayout.ts
  M packages/graphics/src/layouts/geoLayout.ts
  M packages/graphics/src/layouts/index.ts
  M packages/graphics/src/layouts/pathLayout.ts
  M packages/graphics/src/layouts/radarLayout.ts
  M packages/graphics/src/layouts/treeLayout.ts
  M packages/graphics/src/srilankan-postalcode-backend.d.ts
  M packages/graphics/src/types-shim.d.ts
  M packages/graphics/src/types/PerspectiveRenderer.ts
  M packages/graphics/src/types/index.ts
  M packages/graphics/src/types/modules.d.ts
  M packages/graphics/src/types/vendor.d.ts
  M packages/graphics/tsconfig.json

[PKG] library
  M packages/library/eslint.config.mjs
  M packages/library/src/api/database.ts
  M packages/library/src/api/database.web.ts
  M packages/library/src/api/index.ts
  M packages/library/src/api/library.ts
  M packages/library/src/api/sync.ts
  M packages/library/src/components/CollectionPickerModal.tsx
  M packages/library/src/components/LibraryResourceCard.tsx
  M packages/library/src/components/LibraryThumbnailCard.tsx
  M packages/library/src/components/LibraryThumbnailCard.web.tsx
  M packages/library/src/components/ResourceList.tsx
  M packages/library/src/components/ResourceRow.tsx
  M packages/library/src/components/ResourceShareQRModal.tsx
  M packages/library/src/components/index.ts
  M packages/library/src/components/modals/StudentAnalysisModal.tsx
  M packages/library/src/components/modals/index.ts
  M packages/library/src/constants/categories.ts
  M packages/library/src/constants/libraryRegistry.ts
  M packages/library/src/constants/shelf.ts
  M packages/library/src/gesture-handler.d.ts
  M packages/library/src/hooks/index.ts
  M packages/library/src/hooks/useLibrary.ts
  M packages/library/src/hooks/useMapPresence.ts
  M packages/library/src/hooks/useMappingSync.ts
  M packages/library/src/hooks/usePerspectiveLayout.ts
  M packages/library/src/hooks/useTopologyPulse.ts
  M packages/library/src/index.ts
  M packages/library/src/screens/CollectionDetailScreen.tsx
  M packages/library/src/screens/CollectionDetailScreen.web.tsx
  M packages/library/src/screens/CuratorReviewScreen.tsx
  M packages/library/src/screens/DocumentViewerScreen.tsx
  M packages/library/src/screens/LibraryScreen.tsx
  M packages/library/src/screens/LibraryScreen.web.tsx
  M packages/library/src/screens/MapScreen.tsx
  M packages/library/src/screens/MapScreen.web.tsx
  M packages/library/src/screens/PDFViewerScreen.tsx
  M packages/library/src/screens/PDFViewerScreen.web.tsx
  M packages/library/src/screens/ResourceHubScreen.tsx
  M packages/library/src/screens/VideoPlayerScreen.tsx
  M packages/library/src/screens/VideoPlayerScreen.web.tsx
  M packages/library/src/screens/index.ts
  M packages/library/src/shims/native-shim.web.ts
  M packages/library/src/types/Library.ts
  M packages/library/src/types/global.d.ts
  M packages/library/src/types/index.ts
  M packages/library/src/utils/externalLinks.ts
  M packages/library/src/utils/index.ts
  M packages/library/src/utils/resourceLinks.ts
  M packages/library/tsconfig.json

[PKG] lk-edu-geo
  M packages/lk-edu-geo/scripts/admin-hierarchy.json
  M packages/lk-edu-geo/scripts/extract-geo.ts
  M packages/lk-edu-geo/scripts/extract-gn.ts
  M packages/lk-edu-geo/scripts/generate-sql-seeds.ts
  M packages/lk-edu-geo/scripts/import-xlsx.ts
  M packages/lk-edu-geo/scripts/inspect-xlsx.ts
  M packages/lk-edu-geo/scripts/verify-final.ts
  M packages/lk-edu-geo/scripts/verify-phase4.ts
  M packages/lk-edu-geo/scripts/verify-phase5.ts
  M packages/lk-edu-geo/scripts/verify-phase8.ts
  M packages/lk-edu-geo/scripts/verify.ts
  M packages/lk-edu-geo/src/constants.ts
  M packages/lk-edu-geo/src/index.ts
  M packages/lk-edu-geo/src/types.ts
  M packages/lk-edu-geo/src/types/modules.d.ts
  M packages/lk-edu-geo/tsconfig.json

[PKG] payments
  M packages/payments/eslint.config.mjs
  M packages/payments/src/index.ts
  M packages/payments/src/plugins/payhere.ts
  M packages/payments/src/plugins/stripe.ts
  M packages/payments/src/registry.ts
  M packages/payments/src/service.ts
  M packages/payments/src/types.ts
  M packages/payments/tsconfig.json

[PKG] people
  M packages/people/eslint.config.mjs
  M packages/people/src/components/StaffPresencePulse.tsx
  M packages/people/src/components/TeacherAdminPortalModal.tsx
  M packages/people/src/components/TeacherAdminWidget.tsx
  M packages/people/src/components/TeacherEchoHistoryModal.tsx
  M packages/people/src/components/TeacherFeedbackModal.tsx
  M packages/people/src/components/index.ts
  M packages/people/src/directory.ts
  M packages/people/src/feedback.ts
  M packages/people/src/hooks/index.ts
  M packages/people/src/hooks/useStaffPresence.ts
  M packages/people/src/index.ts
  M packages/people/src/memberships.ts
  M packages/people/src/staff.ts
  M packages/people/tsconfig.json

[PKG] platform-mcp
  M packages/platform-mcp/src/index.ts
  M packages/platform-mcp/src/services/AuditService.ts
  M packages/platform-mcp/src/services/DiscoveryService.ts
  M packages/platform-mcp/src/services/DocumentService.ts
  M packages/platform-mcp/src/services/HelpService.ts
  M packages/platform-mcp/src/services/JinaService.ts
  M packages/platform-mcp/src/services/MaintenanceService.ts
  M packages/platform-mcp/src/services/ScoutService.ts
  M packages/platform-mcp/src/utils/constants.ts
  M packages/platform-mcp/src/utils/execution.ts
  M packages/platform-mcp/src/utils/pathUtils.ts
  M packages/platform-mcp/tsconfig.json

[PKG] policies
  A packages/policies/package.json
  A packages/policies/src/__tests__/evaluator.test.ts
  A packages/policies/src/engine/evaluator.ts
  A packages/policies/src/engine/types.ts
  A packages/policies/src/index.ts
  A packages/policies/src/policies/guest/wanderer.cedar
  A packages/policies/src/policies/platform/admin.cedar
  A packages/policies/src/policies/school/assistantPrincipal.cedar
  A packages/policies/src/policies/school/gradeHead.cedar
  A packages/policies/src/policies/school/parent.cedar
  A packages/policies/src/policies/school/principal.cedar
  A packages/policies/src/policies/school/sectionHead.cedar
  A packages/policies/src/policies/school/staff.cedar
  A packages/policies/src/policies/school/student.cedar
  M packages/policies/src/policies/school/teacher.cedar
  A packages/policies/src/snapshot/generator.ts
  A packages/policies/src/snapshot/types.ts
  A packages/policies/tsconfig.json

[PKG] profile
  M packages/profile/eslint.config.mjs
  M packages/profile/src/components/AchievementGallery.tsx
  M packages/profile/src/components/AddSocialLinkModal.tsx
  M packages/profile/src/components/AvatarDisplay.tsx
  M packages/profile/src/components/ContactLinktree.tsx
  M packages/profile/src/components/ControlScroll.tsx
  M packages/profile/src/components/EditProfileModal.tsx
  M packages/profile/src/components/EditableItem.tsx
  M packages/profile/src/components/GiveThuthimalModal.tsx
  M packages/profile/src/components/InlineSocialLinkEditor.tsx
  M packages/profile/src/components/LivingJourneyPanel.tsx
  M packages/profile/src/components/ProfileListItem.tsx
  M packages/profile/src/components/ProfileSkeleton.tsx
  M packages/profile/src/components/SocialSanctuary.tsx
  M packages/profile/src/components/SupportSection.tsx
  M packages/profile/src/components/ThuthimalBadge.tsx
  M packages/profile/src/components/UserStatsCard.tsx
  M packages/profile/src/components/index.ts
  M packages/profile/src/config/profileSections.ts
  M packages/profile/src/hooks/index.ts
  M packages/profile/src/hooks/useCommunityProfile.ts
  M packages/profile/src/hooks/useInstitutionalHistory.ts
  M packages/profile/src/hooks/usePrincipalGovernanceHistory.ts
  M packages/profile/src/hooks/useSchoolProfile.ts
  M packages/profile/src/hooks/useStudentAcademicHistory.ts
  M packages/profile/src/hooks/useTeacherProfessionalHistory.ts
  M packages/profile/src/index.ts
  M packages/profile/src/lib/isFieldFilled.ts
  M packages/profile/src/lib/validator.ts
  M packages/profile/src/navigation/ProfileNavigationContext.tsx
  M packages/profile/src/navigation/fullProfileParams.ts
  M packages/profile/src/navigation/index.ts
  M packages/profile/src/screens/FullProfileScreen.tsx
  M packages/profile/src/screens/FullProfileScreen.web.tsx
  M packages/profile/src/screens/MuteHubScreen.tsx
  M packages/profile/src/screens/ProfileScreen.tsx
  M packages/profile/src/screens/ProfileScreen.web.tsx
  M packages/profile/tsconfig.json

[PKG] scanner-kit
  M packages/scanner-kit/eslint.config.mjs
  M packages/scanner-kit/src/OCRScanner.tsx
  M packages/scanner-kit/src/QRCodeGenerator.tsx
  M packages/scanner-kit/src/ScannerModal.tsx
  M packages/scanner-kit/src/ScannerModal.web.tsx
  M packages/scanner-kit/src/hooks/useQRDeepLink.ts
  M packages/scanner-kit/src/index.ts
  M packages/scanner-kit/src/ocr/OCRPipeline.ts
  M packages/scanner-kit/src/ocr/index.ts
  M packages/scanner-kit/src/ocr/parsers/StudentParser.ts
  M packages/scanner-kit/src/ocr/parsers/TableParser.ts
  M packages/scanner-kit/src/ocr/providers/GoogleVisionProvider.ts
  M packages/scanner-kit/src/ocr/providers/MLKitProvider.ts
  M packages/scanner-kit/src/ocr/providers/OpenAIVisionProvider.ts
  M packages/scanner-kit/src/ocr/types.ts
  M packages/scanner-kit/src/qr/QRShareButton.tsx
  M packages/scanner-kit/src/qr/index.ts
  M packages/scanner-kit/src/screens/QRHandlerScreen.tsx
  M packages/scanner-kit/src/types.ts
  M packages/scanner-kit/src/types/optional-native-modules.d.ts
  M packages/scanner-kit/tsconfig.json

[PKG] schema
  M packages/schema/input.ts
  M packages/schema/models.ts
  M packages/schema/schema.ts
  M packages/schema/src/generated/orm/schema.ts
  M packages/schema/src/index.ts

[PKG] scripts
  M packages/scripts/audit-package-architecture.mjs
  M packages/scripts/check-classroom-boundaries.mjs

[PKG] self
  M packages/self/eslint.config.mjs
  M packages/self/package.json
  M packages/self/scripts/toast-heal.js
  M packages/self/scripts/v3-heal-v2.js
  M packages/self/scripts/v3-heal.js
  M packages/self/src/api/dailyContent.ts
  M packages/self/src/api/index.ts
  M packages/self/src/api/self.ts
  M packages/self/src/api/selfFeatureRepository.ts
  M packages/self/src/api/selfInsightsRepository.ts
  M packages/self/src/api/wellbeingRepository.ts
  M packages/self/src/components/AcademicHistoryTimeline.tsx
  M packages/self/src/components/BaseSelfView.tsx
  M packages/self/src/components/BaseSelfView.types.ts
  M packages/self/src/components/BaseSelfView.web.tsx
  M packages/self/src/components/BreathGuide.tsx
  M packages/self/src/components/BreathGuide.web.tsx
  M packages/self/src/components/ClassroomLegacyTimeline.tsx
  M packages/self/src/components/CommunityPresence.tsx
  M packages/self/src/components/CommunityPresence.web.tsx
  M packages/self/src/components/DailyContentCard.tsx
  M packages/self/src/components/DailyContentCard.web.tsx
  M packages/self/src/components/DailyRhythm.tsx
  M packages/self/src/components/DailyRhythm.web.tsx
  M packages/self/src/components/DecisionJournalSection.tsx
  M packages/self/src/components/EnergyBarChart.tsx
  M packages/self/src/components/EnergyBarChart.web.tsx
  M packages/self/src/components/EnergyForecast.tsx
  M packages/self/src/components/EnergyForecast.web.tsx
  M packages/self/src/components/FeatureErrorBoundary.tsx
  M packages/self/src/components/FeatureRegistry.tsx
  M packages/self/src/components/FireJournal.tsx
  M packages/self/src/components/FireJournal.web.tsx
  M packages/self/src/components/GenesisNode.tsx
  M packages/self/src/components/GovernanceHistoryTimeline.tsx
  M packages/self/src/components/GratitudeGlimmers.tsx
  M packages/self/src/components/GratitudeGlimmers.web.tsx
  M packages/self/src/components/ImpactRipplesCard.tsx
  M packages/self/src/components/ImpactRipplesCard.web.tsx
  M packages/self/src/components/JoyJar.tsx
  M packages/self/src/components/JoyJar.web.tsx
  M packages/self/src/components/MoodLotus.tsx
  M packages/self/src/components/MoodLotus.web.tsx
  M packages/self/src/components/MoodPickerCard.tsx
  M packages/self/src/components/MyGradesView.tsx
  M packages/self/src/components/MyGradesView.web.tsx
  M packages/self/src/components/OrientationCaptureStep.tsx
  M packages/self/src/components/ProgressTree.tsx
  M packages/self/src/components/ProgressTree.web.tsx
  M packages/self/src/components/PulseDashboard.tsx
  M packages/self/src/components/RemindersManager.tsx
  M packages/self/src/components/RemindersManager.web.tsx
  M packages/self/src/components/ResonancePatternCard.tsx
  M packages/self/src/components/ResonancePatternCard.web.tsx
  M packages/self/src/components/ResonanceTimeline.tsx
  M packages/self/src/components/SchoolLegacyTimeline.tsx
  M packages/self/src/components/SleepTracker.tsx
  M packages/self/src/components/SleepTracker.web.tsx
  M packages/self/src/components/SpotlightEmpty.tsx
  M packages/self/src/components/StudentGoals.tsx
  M packages/self/src/components/StudentGoals.web.tsx
  M packages/self/src/components/TeachingHistoryTimeline.tsx
  M packages/self/src/components/TimelineEvent.tsx
  M packages/self/src/components/TomorrowPrep.tsx
  M packages/self/src/components/TomorrowPrep.web.tsx
  M packages/self/src/components/VoiceJournaling.tsx
  M packages/self/src/components/VoiceJournaling.web.tsx
  M packages/self/src/components/WarmMirrorCard.tsx
  M packages/self/src/components/WarmMirrorCard.web.tsx
  M packages/self/src/components/WelcomeModal.tsx
  M packages/self/src/components/WelcomeModal.web.tsx
  M packages/self/src/components/WindDownRitual.tsx
  M packages/self/src/components/WindDownRitual.web.tsx
  M packages/self/src/components/WisdomSeeds.tsx
  M packages/self/src/components/WisdomSeeds.web.tsx
  M packages/self/src/components/archive/ShadowAgentDrawer.tsx
  M packages/self/src/components/archive/ShadowAgentDrawer.web.tsx
  M packages/self/src/components/index.ts
  M packages/self/src/constants/selfRegistry.ts
  M packages/self/src/constants/wellbeing.ts
  M packages/self/src/hooks/index.ts
  M packages/self/src/hooks/useCommunityPresence.ts
  M packages/self/src/hooks/useDecisionJournal.ts
  M packages/self/src/hooks/useDynamicSelfFeatures.ts
  M packages/self/src/hooks/useEnergyForecast.ts
  M packages/self/src/hooks/useFeatureActivity.ts
  M packages/self/src/hooks/useFireJournal.ts
  M packages/self/src/hooks/useGratitude.ts
  M packages/self/src/hooks/useJournalEntries.ts
  M packages/self/src/hooks/useJourneyData.ts
  M packages/self/src/hooks/useJoyJar.ts
  M packages/self/src/hooks/useMoodLogs.ts
  M packages/self/src/hooks/useOrientationInference.ts
  A packages/self/src/hooks/useProgressTree.ts
  M packages/self/src/hooks/useSanctuaryRegistry.ts
  M packages/self/src/hooks/useSleepTracker.ts
  M packages/self/src/hooks/useStudentGoals.ts
  A packages/self/src/hooks/useStudentGrades.ts
  M packages/self/src/hooks/useTimetable.ts
  M packages/self/src/hooks/useTomorrowPrep.ts
  M packages/self/src/hooks/useWellbeingEnrichment.ts
  M packages/self/src/hooks/useWisdom.ts
  M packages/self/src/index.ts
  M packages/self/src/screens/PrivacyLedgerScreen.tsx
  M packages/self/src/screens/SelfScreen.tsx
  M packages/self/src/screens/SelfScreen.web.tsx
  M packages/self/src/screens/index.ts
  M packages/self/src/screens/self/AdminSelfView.tsx
  M packages/self/src/screens/self/FounderSelfView.tsx
  M packages/self/src/screens/self/FounderSelfView.web.tsx
  M packages/self/src/screens/self/GuardianSelfView.tsx
  M packages/self/src/screens/self/GuardianSelfView.web.tsx
  M packages/self/src/screens/self/PrincipalSelfView.tsx
  M packages/self/src/screens/self/PrincipalSelfView.web.tsx
  M packages/self/src/screens/self/StudentSelfView.tsx
  M packages/self/src/screens/self/StudentSelfView.web.tsx
  M packages/self/src/screens/self/TeacherSelfView.tsx
  M packages/self/src/screens/self/TeacherSelfView.web.tsx
  M packages/self/src/screens/self/index.ts
  M packages/self/src/screens/self/index.web.ts
  M packages/self/src/types/Wellbeing.ts
  M packages/self/src/types/index.ts
  M packages/self/src/views/index.ts
  M packages/self/src/views/sections.tsx
  M packages/self/tsconfig.json

[PKG] trube-art
  M packages/trube-art/artifacts/approval-manifest.json
  M packages/trube-art/eslint.config.mjs
  M packages/trube-art/nitro.json
  M packages/trube-art/scripts/generate-approval-artifacts.mjs
  M packages/trube-art/src/core/color.ts
  M packages/trube-art/src/core/motif.ts
  M packages/trube-art/src/core/ornament.ts
  M packages/trube-art/src/core/presets.ts
  M packages/trube-art/src/core/render-plan.ts
  M packages/trube-art/src/core/scores.ts
  M packages/trube-art/src/core/soul/AuroraSoul.ts
  M packages/trube-art/src/core/soul/EveningSkySoul.ts
  M packages/trube-art/src/core/soul/MistSoul.ts
  M packages/trube-art/src/core/soul/MotifLibrary.ts
  M packages/trube-art/src/core/soul/OrnamentLibrary.ts
  M packages/trube-art/src/core/soul/ScoreComposer.ts
  M packages/trube-art/src/core/soul/SilkSoul.ts
  M packages/trube-art/src/core/soul/SkymorphicSoul.ts
  M packages/trube-art/src/core/soul/SoulLibrary.ts
  M packages/trube-art/src/core/soul/TimeLayer.ts
  M packages/trube-art/src/core/soul/WaterSurfaceSoul.ts
  M packages/trube-art/src/core/soul/WaterfallSoul.ts
  M packages/trube-art/src/core/soul/YoungLeafSoul.ts
  M packages/trube-art/src/core/soul/compiler.ts
  M packages/trube-art/src/core/soul/sksl-shaders.ts
  M packages/trube-art/src/core/soul/tsl.ts
  M packages/trube-art/src/core/stage.ts
  M packages/trube-art/src/core/surface.ts
  M packages/trube-art/src/core/types.ts
  M packages/trube-art/src/core/useGPUPrewarm.ts
  M packages/trube-art/src/core/useTrubeFrameLoop.ts
  M packages/trube-art/src/index.ts
  M packages/trube-art/src/native/DriverManager.ts
  M packages/trube-art/src/native/SkiaDriver.ts
  M packages/trube-art/src/native/TrubeCanvas.tsx
  M packages/trube-art/src/native/TrubeDriver.nitro.ts
  M packages/trube-art/src/native/TrubeMotif.tsx
  M packages/trube-art/src/native/TrubeOrnament.tsx
  M packages/trube-art/src/native/TrubeProvider.tsx
  M packages/trube-art/src/native/TrubeStage.tsx
  M packages/trube-art/src/native/TrubeView.tsx
  M packages/trube-art/src/native/WebGPUDriver.ts
  M packages/trube-art/src/native/index.ts
  M packages/trube-art/src/native/plugin/types.d.ts
  M packages/trube-art/src/native/plugin/withTrubeArt.ts
  M packages/trube-art/src/native/renderers/AuroraRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/AuroraRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/CompatibilityRenderer.tsx
  M packages/trube-art/src/native/renderers/EveningSkyRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/EveningSkyRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/MistRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/MistRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/NativeSubstrateRenderer.tsx
  M packages/trube-art/src/native/renderers/PerformanceOverlay.tsx
  M packages/trube-art/src/native/renderers/SilkRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/SilkRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/SkymorphicRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/SkymorphicRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/SoulLibrary.ts
  M packages/trube-art/src/native/renderers/UnifiedRenderer.tsx
  M packages/trube-art/src/native/renderers/WaterSurfaceRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/WaterSurfaceRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/WaterfallRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/WaterfallRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/YoungLeafRenderer.skia.tsx
  M packages/trube-art/src/native/renderers/YoungLeafRenderer.vulkan.tsx
  M packages/trube-art/src/native/renderers/types.ts
  M packages/trube-art/src/screens/TrubeLabScreen.tsx
  M packages/trube-art/tsconfig.json

[PKG] typescript-config
  M packages/typescript-config/base.json
  M packages/typescript-config/nextjs.json
  M packages/typescript-config/react-library.json

[PKG] types-shim
  M packages/types-shim/index.d.ts
  M packages/types-shim/tsconfig.json

[PKG] ui
  M packages/ui/src/archive/LotusPetalFAB.complex.tsx
  M packages/ui/src/components-legacy/box/index.tsx
  M packages/ui/src/components-legacy/center/index.tsx
  M packages/ui/src/components-legacy/divider/index.tsx
  M packages/ui/src/components-legacy/hstack/index.tsx
  M packages/ui/src/components-legacy/input/index.tsx
  M packages/ui/src/components-legacy/modal/index.tsx
  M packages/ui/src/components-legacy/vstack/index.tsx
  M packages/ui/src/components-native/LivingCard.tsx
  M packages/ui/src/components/AccountPinModal.tsx
  M packages/ui/src/components/AdaptiveLayout.tsx
  M packages/ui/src/components/BreathAnimation.tsx
  M packages/ui/src/components/BreathingLoader.tsx
  M packages/ui/src/components/CollectionCard.tsx
  M packages/ui/src/components/ConflictResolver.tsx
  M packages/ui/src/components/DeviceAccountManager.tsx
  M packages/ui/src/components/DeviceSecurityCenter.tsx
  M packages/ui/src/components/ErrorBoundary.tsx
  M packages/ui/src/components/FounderGlow.tsx
  M packages/ui/src/components/GlobalHeader.tsx
  M packages/ui/src/components/IdentityCard.tsx
  M packages/ui/src/components/InteractiveRadarChart.tsx
  M packages/ui/src/components/InternalBrowser.tsx
  M packages/ui/src/components/InternalBrowser.web.tsx
  M packages/ui/src/components/JourneyHistoryCard.tsx
  M packages/ui/src/components/LifecycleMonitor.tsx
  M packages/ui/src/components/LotusDropdown.tsx
  M packages/ui/src/components/LotusLoader.tsx
  M packages/ui/src/components/LotusPetalFAB.tsx
  M packages/ui/src/components/NotificationDrawer.tsx
  M packages/ui/src/components/NotificationSettingsPanel.tsx
  M packages/ui/src/components/PollWidget.tsx
  M packages/ui/src/components/PredictiveButton.tsx
  M packages/ui/src/components/QRCodeGenerator.tsx
  M packages/ui/src/components/ResonantHeatmap.tsx
  M packages/ui/src/components/SafeButton.tsx
  M packages/ui/src/components/SanctuaryBackground.tsx
  M packages/ui/src/components/SanctuaryChip.tsx
  M packages/ui/src/components/SanctuaryFlashList.tsx
  M packages/ui/src/components/SanctuaryFlashList.web.tsx
  M packages/ui/src/components/SanctuaryInput.tsx
  M packages/ui/src/components/SanctuaryModal.tsx
  M packages/ui/src/components/SanctuaryModal.web.tsx
  M packages/ui/src/components/SanctuaryNudge.tsx
  M packages/ui/src/components/SanctuaryProgressBar.tsx
  M packages/ui/src/components/SanctuarySignal.tsx
  M packages/ui/src/components/SanctuaryToast.tsx
  M packages/ui/src/components/ScreenWrapper.web.tsx
  M packages/ui/src/components/SkeletonLoader.tsx
  M packages/ui/src/components/SkeletonLoader.web.tsx
  M packages/ui/src/components/SmartShelf.tsx
  M packages/ui/src/components/TemporalNavigator.tsx
  M packages/ui/src/components/TemporalPilot.tsx
  M packages/ui/src/components/TemporalProvider.tsx
  M packages/ui/src/components/WebScreenHeader.web.tsx
  M packages/ui/src/components/index.ts
  M packages/ui/src/components/media/AssetCreationPortal.tsx
  M packages/ui/src/components/media/VideoPlayer.tsx
  M packages/ui/src/components/media/VideoPlayer.web.tsx
  M packages/ui/src/components/ui/portal/index.tsx
  M packages/ui/src/components/ui/toast/index.tsx
  M packages/ui/src/components/workspace/CanvasSurfaceCard.tsx
  M packages/ui/src/components/workspace/CanvasZoneColumn.tsx
  M packages/ui/src/components/workspace/DraggableCanvasSurface.tsx
  M packages/ui/src/components/workspace/shared.tsx
  M packages/ui/src/context/EnvironmentContext.tsx
  M packages/ui/src/context/ExternalLinkContext.tsx
  M packages/ui/src/hooks/index.ts
  M packages/ui/src/hooks/useAccessibility.ts
  M packages/ui/src/hooks/useNotificationPreferences.ts
  M packages/ui/src/hooks/useSafeAction.ts
  M packages/ui/src/hooks/useTheme.ts
  M packages/ui/src/index.ts
  M packages/ui/src/primitives.ts
  M packages/ui/src/providers/ErrorResolutionProvider.tsx
  M packages/ui/src/providers/ToastProvider.tsx
  M packages/ui/src/qr/QRShareButton.tsx
  M packages/ui/src/screens/AppSettingsScreen.tsx
  M packages/ui/src/screens/AppSettingsScreen.web.tsx
  M packages/ui/src/screens/AuthScreen.tsx
  M packages/ui/src/screens/AuthScreen.web.tsx
  M packages/ui/src/screens/NotificationsScreen.web.tsx
  M packages/ui/src/screens/OnboardingScreen.tsx
  M packages/ui/src/screens/OnboardingScreen.web.tsx
  M packages/ui/src/screens/OnboardingWrapper.tsx
  M packages/ui/src/screens/WelcomeScreen.tsx
  M packages/ui/src/screens/WelcomeScreen.web.tsx

[PKG] workforce
  M packages/workforce/eslint.config.mjs
  M packages/workforce/src/WorkforceShell.tsx
  M packages/workforce/src/index.ts
  M packages/workforce/tsconfig.json

[TOOL] Engineering & Tooling
  M .size-limit.json
  M package.json
  M pnpm-lock.yaml
  M scripts/analyze-contrast.mjs
  M scripts/architect-mapper.mjs
  M scripts/audit-bundle-leak.mjs
  M scripts/audit-colors.js
  M scripts/audit-deps.js
  M scripts/audit-export-integrity.mjs
  M scripts/audit-feature-fidelity.mjs
  M scripts/audit-feature-flags.mjs
  M scripts/audit-imports.mjs
  M scripts/audit-package-architecture.mjs
  M scripts/audit-ui-api.mjs
  M scripts/bridge-schema-zod.mjs
  M scripts/check-classroom-boundaries.mjs
  M scripts/check-hygiene.mjs
  M scripts/check-identity-alignment.mjs
  A scripts/check-monorepo-boundaries.mjs
  M scripts/check-schema-drift.mjs
  M scripts/check-self-boundaries.mjs
  M scripts/check-shiny-tools.mjs
  M scripts/debug-metro-id.mjs
  M scripts/find-native-leaks.mjs
  M scripts/fix-package-scripts.mjs
  M scripts/fix-syntax.js
  M scripts/generate-debt-lens.mjs
  M scripts/generate-growth-signals.mjs
  M scripts/generate-inventory.mjs
  M scripts/generate-luminosity-lens.mjs
  M scripts/generate-readme-usage.mjs
  M scripts/generate-skeleton-lens.mjs
  M scripts/harden-monorepo.mjs
  M scripts/heal-admin-icons.mjs
  M scripts/heal-admin-subscriptions.mjs
  M scripts/heal-architecture.mjs
  M scripts/heal-icons.mjs
  M scripts/i18n-fallback-policy-check.mjs
  M scripts/i18n-key-coverage-check.mjs
  M scripts/i18n/audit-i18n.js
  M scripts/i18n/audit-keys.mjs
  M scripts/i18n/check-inline-fallbacks.js
  M scripts/mcp-call.mjs
  M scripts/mcp-proxy.mjs
  M scripts/normalize-imports.mjs
  M scripts/purge-stale-artifacts.mjs
  M scripts/recovery/fix-gurudevi-mobile-parse.mjs
  M scripts/refactor/analyze-errors.mjs
  M scripts/refactor/apply-web-migration-codemod.mjs
  M scripts/refactor/check-barrel-imports.mjs
  M scripts/refactor/check-web-boundaries.mjs
  M scripts/refactor/debug-parse.mjs
  M scripts/refactor/find-app-domain-imports.mjs
  M scripts/refactor/fix-userid-typos.mjs
  M scripts/refactor/generate-barrels.mjs
  M scripts/refactor/generate-web-migration-manifest.mjs
  M scripts/refactor/gluestack-v3-migrator.mjs
  M scripts/refactor/identity-migration.mjs
  M scripts/refactor/mapping-sweep.mjs
  M scripts/refactor/relocate-imports.mjs
  M scripts/refactor/repair-core-subpath-imports.mjs
  M scripts/refactor/repair-ui-subpath-imports.mjs
  M scripts/refactor/rewrite-ui-root-imports.mjs
  M scripts/refactor/sovereign-cycle-checker.mjs
  M scripts/refactor/sovereign-healer.mjs
  M scripts/refactor/sovereign-repair-engine.mjs
  M scripts/refactor/sovereign-sentinel-v2.mjs
  M scripts/refactor/sweep-sx.mjs
  M scripts/refactor/sweep-typography.mjs
  M scripts/refactor/universal-sweep.mjs
  M scripts/report-cognitive-load.mjs
  M scripts/reports/purge_stale_artifacts_2026-04-24T16-02-32-634Z.json
  M scripts/scaffold-feature-context.mjs
  M scripts/scaffold-mocks.mjs
  M scripts/setup-mcp.ts
  M scripts/shiny-sink-audit.mjs
  M scripts/simulate-impact.mjs
  M scripts/smart-changeset.mjs
  M scripts/sovereign-audit.mjs
  M scripts/sovereign-ui-healer.mjs
  M scripts/surgical-check.mjs
  M scripts/surgical-repair-v2.js
  M scripts/surgical-repair.js
  M scripts/test-sleekness.ts
  M scripts/trace-deletion-impact.mjs
  M scripts/ts-fix.mjs
  M scripts/unicode-shield.mjs
  M scripts/utils/execution.mjs
  M tsconfig.json

[MISC] Miscellaneous Files
  M .changeset/config.json
  M .dependency-cruiser.cjs
  M .github/maintainer/config.json
  M .github/maintainer/index/graph.json
  M .github/maintainer/index/items.json
  M .github/maintainer/semantics.generated.json
  M .github/maintainer/state.json
  M .lintstagedrc.cjs
  M .pnpmfile.cjs
  M app.json
  M commitlint.config.cjs
  M dagger.ts
  M docs/.obsidian/core-plugins.json
  M docs/.obsidian/workspace.json
  A docs/GURUDEVI_ACTOR_RESOURCE_MATRIX_AUDIT_2026-05-16.md
  A docs/GURUDEVI_ARCHITECTURE_AUDIT_2026-05-16.md
  A docs/GURUDEVI_AUTHORIZATION_ARCHITECTURE_AUDIT_2026-05-16.md
  A docs/GURUDEVI_OFFLINE_IAM_AND_WRITE_SAFETY_AUDIT_2026-05-20.md
  M docs/SOVEREIGN_IDENTITY_FABRIC_2026.md
  M docs_general/.obsidian/core-plugins.json
  M docs_general/.obsidian/graph.json
  M docs_general/.obsidian/workspace.json
  M eslint.config.js
  M knip.json
  M renovate.json
  M reports/audit_feature_fidelity_2026-05-08T18-54-57-919Z.json
  M reports/audit_feature_fidelity_2026-05-08T18-54-58-307Z.json
  M reports/push_audit.md
  M runbyte.json
  M scratch/check-all-cycles-deep.mjs
  M scratch/check-global-cycles.mjs
  M scratch/check_balance.js
  M scratch/convert-aliases.mjs
  M scratch/debug_regex.js
  M scratch/debug_schema.ts
  M scratch/fix-rel-imports-v3.mjs
  M scratch/fix-rel-imports.mjs
  M scratch/full_deps.json
  M scratch/migrate-ui-imports.mjs
  M scratch/test-proxy-env.mjs
  M scratch/test-scout.mjs
  M scratch/test-spaces.mjs
  M scratch/test-spawn.mjs
  M scratch/test-zod.ts
  M scratch/test_audit_error.mjs
  M scratch/verify_fix.ts[22m
[31m✖[39m   body's lines must not be longer than 100 characters [90m[body-max-line-length][39m

[1m[31m✖[39m   found 1 problems, 0 warnings[22m
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint



> polymath-platform@1.0.0 lint C:\Users\Naween\projects\polymath-platform
> pnpm turbo run lint


• turbo 2.9.4



   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running lint in 32 packages
   • Remote caching disabled


@repo/analytics:lint:biome: cache miss, executing e65f8985faf273f0

gurudevi-mobile:lint:biome: cache miss, executing 221198a5a71b1d0e

apps-edlove-web:lint:biome: cache miss, executing ab56ba433eea2b7e

@repo/payments:lint:biome: cache miss, executing c1044823121b291d

@repo/community:lint:biome: cache miss, executing 42bf34c1fdf1e64e

@repo/types-shim:lint:biome: cache miss, executing 868c3aae2607a4aa

@intuitui-labs/lk-edu-geo:lint:biome: cache miss, executing 0e99c8b98b056510

@repo/workforce:lint:biome: cache miss, executing f6d74426fede0f2e
apps-intuitui-web:lint:biome: cache miss, executing 6624bdda6f03c817

@repo/profile:lint:biome: cache miss, executing d7c8fc653714c334

apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: > apps-intuitui-web@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:lint:biome: > biome check .
apps-intuitui-web:lint:biome: 

@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: > @repo/workforce@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:lint:biome: > biome check .
@repo/workforce:lint:biome: 

@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome: > @repo/types-shim@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\types-shim

@repo/types-shim:lint:biome: > biome check .
@repo/types-shim:lint:biome: 
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: > @repo/analytics@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\analytics
@repo/analytics:lint:biome: > biome check .
@repo/analytics:lint:biome: 

@repo/profile:lint:biome: 
@repo/profile:lint:biome: > @repo/profile@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:lint:biome: > biome check .
@repo/profile:lint:biome: 

@repo/payments:lint:biome: 
@repo/payments:lint:biome: > @repo/payments@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:lint:biome: > biome check .
@repo/payments:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: > @intuitui-labs/lk-edu-geo@1.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:lint:biome: > biome check .
@intuitui-labs/lk-edu-geo:lint:biome: 

gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome: > gurudevi-mobile@1.1.0 lint:biome C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile

gurudevi-mobile:lint:biome: > biome check .

gurudevi-mobile:lint:biome: 

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: > apps-edlove-web@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:lint:biome: > biome check .
apps-edlove-web:lint:biome: 

@repo/community:lint:biome: 
@repo/community:lint:biome: > @repo/community@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\community
@repo/community:lint:biome: > biome check .
@repo/community:lint:biome: 

@repo/analytics:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.

@repo/analytics:lint:biome: Diagnostics not shown: 71.

@repo/analytics:lint:biome: Checked 86 files in 438ms. No fixes applied.

@repo/analytics:lint:biome: Found 4 errors.

@repo/analytics:lint:biome: Found 84 warnings.

@repo/analytics:lint:biome: Found 3 infos.

@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts:3:39 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     1 │ import { type ReactNode } from 'react';
@repo/analytics:lint:biome:     2 │ interface AnalyticsContextProps {

@repo/analytics:lint:biome:   > 3 │   track: (event: string, properties?: any) => void;
@repo/analytics:lint:biome:       │                                       ^^^
@repo/analytics:lint:biome:     4 │   identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:     5 │   screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts:4:43 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     2 │ interface AnalyticsContextProps {
@repo/analytics:lint:biome:     3 │   track: (event: string, properties?: any) => void;
@repo/analytics:lint:biome:   > 4 │   identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:       │                                           ^^^
@repo/analytics:lint:biome:     5 │   screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:     6 │   reset: () => void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts:5:39 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     3 │   track: (event: string, properties?: any) => void;
@repo/analytics:lint:biome:     4 │   identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:   > 5 │   screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:       │                                       ^^^
@repo/analytics:lint:biome:     6 │   reset: () => void;
@repo/analytics:lint:biome:     7 │ }
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx:5:39 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     4 │ interface AnalyticsContextProps {

@repo/analytics:lint:biome:   > 5 │   track: (event: string, properties?: any) => void;
@repo/analytics:lint:biome:       │                                       ^^^
@repo/analytics:lint:biome:     6 │   identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:     7 │   screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx:6:43 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     4 │ interface AnalyticsContextProps {
@repo/analytics:lint:biome:     5 │   track: (event: string, properties?: any) => void;
@repo/analytics:lint:biome:   > 6 │   identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:       │                                           ^^^
@repo/analytics:lint:biome:     7 │   screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:     8 │   reset: () => void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx:7:39 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     5 │   track: (event: string, properties?: any) => void;
@repo/analytics:lint:biome:     6 │   identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:   > 7 │   screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:       │                                       ^^^
@repo/analytics:lint:biome:     8 │   reset: () => void;
@repo/analytics:lint:biome:     9 │ }
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\GPACalculator.d.ts:78:22 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     76 │       id: string;
@repo/analytics:lint:biome:     77 │       marks: number;
@repo/analytics:lint:biome:   > 78 │       [key: string]: any;
@repo/analytics:lint:biome:        │                      ^^^
@repo/analytics:lint:biome:     79 │     }[],
@repo/analytics:lint:biome:     80 │   ): {
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\GPACalculator.d.ts:84:20 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     82 │     marks: number;
@repo/analytics:lint:biome:     83 │     rank: number;
@repo/analytics:lint:biome:   > 84 │     [key: string]: any;
@repo/analytics:lint:biome:        │                    ^^^
@repo/analytics:lint:biome:     85 │   }[];
@repo/analytics:lint:biome:     86 │ }
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\GPACalculator.ts:226:57 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     224 │    */
@repo/analytics:lint:biome:     225 │   public calculateRanks(
@repo/analytics:lint:biome:   > 226 │     grades: { id: string; marks: number; [key: string]: any }[],
@repo/analytics:lint:biome:         │                                                         ^^^
@repo/analytics:lint:biome:     227 │   ): { id: string; marks: number; rank: number; [key: string]: any }[] {
@repo/analytics:lint:biome:     228 │     const sorted = [...grades].sort((a, b) => b.marks - a.marks);
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\GPACalculator.ts:227:64 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     225 │   public calculateRanks(
@repo/analytics:lint:biome:     226 │     grades: { id: string; marks: number; [key: string]: any }[],
@repo/analytics:lint:biome:   > 227 │   ): { id: string; marks: number; rank: number; [key: string]: any }[] {
@repo/analytics:lint:biome:         │                                                                ^^^
@repo/analytics:lint:biome:     228 │     const sorted = [...grades].sort((a, b) => b.marks - a.marks);
@repo/analytics:lint:biome:     229 │     return grades.map((grade) => {
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\PerformanceAnalyzer.d.ts:3:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     1 │ import { type ClassAnalytics, type StudentPerformanceMetrics } from '../types/AnalyticsTypes';
@repo/analytics:lint:biome:     2 │ export interface DatabaseClient {
@repo/analytics:lint:biome:   > 3 │   from: (table: string) => any;
@repo/analytics:lint:biome:       │                            ^^^
@repo/analytics:lint:biome:     4 │ }
@repo/analytics:lint:biome:     5 │ export declare class PerformanceAnalyzer {
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\PostHogAnalytics.d.ts:16:52 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     14 │     },
@repo/analytics:lint:biome:     15 │   ): Promise<void>;
@repo/analytics:lint:biome:   > 16 │   track(event: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:        │                                                    ^^^
@repo/analytics:lint:biome:     17 │   identify(userId: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:     18 │   screen(name: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\PostHogAnalytics.d.ts:17:56 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     15 │   ): Promise<void>;
@repo/analytics:lint:biome:     16 │   track(event: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:   > 17 │   identify(userId: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:        │                                                        ^^^
@repo/analytics:lint:biome:     18 │   screen(name: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:     19 │   reset(): void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\PostHogAnalytics.d.ts:18:52 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     16 │   track(event: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:     17 │   identify(userId: string, properties?: Record<string, any>): void;

@repo/analytics:lint:biome:   > 18 │   screen(name: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:        │                                                    ^^^
@repo/analytics:lint:biome:     19 │   reset(): void;
@repo/analytics:lint:biome:     20 │   capture(event: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\PostHogAnalytics.d.ts:20:54 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     18 │   screen(name: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:     19 │   reset(): void;
@repo/analytics:lint:biome:   > 20 │   capture(event: string, properties?: Record<string, any>): void;
@repo/analytics:lint:biome:        │                                                      ^^^
@repo/analytics:lint:biome:     21 │   flush(): Promise<void>;
@repo/analytics:lint:biome:     22 │ }
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\engine\PostHogAnalytics.native.ts:5:31 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     3 │ interface AnalyticsEvent {
@repo/analytics:lint:biome:     4 │   event: string;
@repo/analytics:lint:biome:   > 5 │   properties?: Record<string, any>;
@repo/analytics:lint:biome:       │                               ^^^
@repo/analytics:lint:biome:     6 │ }
@repo/analytics:lint:biome:     7 │ 
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsChart.tsx:102:21 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     100 │       <HStack className="justify-around gap-3">

@repo/analytics:lint:biome:     101 │         {series.map((entry, index) => (
@repo/analytics:lint:biome:   > 102 │           <Box key={index} className="flex-1 items-center">
@repo/analytics:lint:biome:         │                     ^^^^^
@repo/analytics:lint:biome:     103 │             <Text
@repo/analytics:lint:biome:     104 │               className="mb-2 text-center text-xs font-semibold"
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:   i This is the source of the key value.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:      99 │       ) : null}

@repo/analytics:lint:biome:     100 │       <HStack className="justify-around gap-3">
@repo/analytics:lint:biome:   > 101 │         {series.map((entry, index) => (
@repo/analytics:lint:biome:         │                             ^^^^^
@repo/analytics:lint:biome:     102 │           <Box key={index} className="flex-1 items-center">
@repo/analytics:lint:biome:     103 │             <Text
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i Check the React documentation. 
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\GPAInsights.tsx:108:28 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     106 │             {generateRecommendations(currentGPA, trendDirection, gapToTarget).map(
@repo/analytics:lint:biome:     107 │               (recommendation, index) => (
@repo/analytics:lint:biome:   > 108 │                 <Text key={index} className="text-sm leading-5" style={{ color: colors.text }}>
@repo/analytics:lint:biome:         │                            ^^^^^
@repo/analytics:lint:biome:     109 │                   • {recommendation}
@repo/analytics:lint:biome:     110 │                 </Text>
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i This is the source of the key value.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     105 │           <VStack className="gap-2">
@repo/analytics:lint:biome:     106 │             {generateRecommendations(currentGPA, trendDirection, gapToTarget).map(
@repo/analytics:lint:biome:   > 107 │               (recommendation, index) => (

@repo/analytics:lint:biome:         │                                ^^^^^

@repo/analytics:lint:biome:     108 │                 <Text key={index} className="text-sm leading-5" style={{ color: colors.text }}>
@repo/analytics:lint:biome:     109 │                   • {recommendation}
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i Check the React documentation. 
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\PerformanceDashboard.tsx:125:28 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Avoid using the index of an array as key property in an element.

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     123 │             <VStack className="gap-2">
@repo/analytics:lint:biome:     124 │               {insights.map((insight, index) => (
@repo/analytics:lint:biome:   > 125 │                 <Text key={index} className="text-sm leading-5" style={{ color: themeColors.text }}>
@repo/analytics:lint:biome:         │                            ^^^^^
@repo/analytics:lint:biome:     126 │                   • {insight}
@repo/analytics:lint:biome:     127 │                 </Text>
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i This is the source of the key value.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     122 │             </Text>
@repo/analytics:lint:biome:     123 │             <VStack className="gap-2">

@repo/analytics:lint:biome:   > 124 │               {insights.map((insight, index) => (
@repo/analytics:lint:biome:         │                                       ^^^^^
@repo/analytics:lint:biome:     125 │                 <Text key={index} className="text-sm leading-5" style={{ color: themeColors.text }}>
@repo/analytics:lint:biome:     126 │                   • {insight}
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i Check the React documentation. 
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\PerformanceDashboard.tsx:140:28 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     138 │             <VStack className="gap-2">
@repo/analytics:lint:biome:     139 │               {recommendations.map((recommendation, index) => (
@repo/analytics:lint:biome:   > 140 │                 <Text key={index} className="text-sm leading-5" style={{ color: themeColors.text }}>
@repo/analytics:lint:biome:         │                            ^^^^^
@repo/analytics:lint:biome:     141 │                   {index + 1}. {recommendation}
@repo/analytics:lint:biome:     142 │                 </Text>
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i This is the source of the key value.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     137 │             </Text>
@repo/analytics:lint:biome:     138 │             <VStack className="gap-2">
@repo/analytics:lint:biome:   > 139 │               {recommendations.map((recommendation, index) => (
@repo/analytics:lint:biome:         │                                                     ^^^^^
@repo/analytics:lint:biome:     140 │                 <Text key={index} className="text-sm leading-5" style={{ color: themeColors.text }}>
@repo/analytics:lint:biome:     141 │                   {index + 1}. {recommendation}
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i Check the React documentation. 
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Some errors were emitted while running checks.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/workforce:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/workforce:lint:biome: 

@repo/workforce:lint:biome: Checked 6 files in 148ms. No fixes applied.
@repo/workforce:lint:biome: Found 1 error.

@repo/workforce:lint:biome:   × Formatter would have printed the following content:
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome:     1   │ - import·{·config·}·from·'@repo/eslint-config/base';␍

@repo/workforce:lint:biome:     2   │ - ␍
@repo/workforce:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/workforce:lint:biome:     4   │ - export·default·[...config];␍
@repo/workforce:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/base';
@repo/workforce:lint:biome:       2 │ + 
@repo/workforce:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/workforce:lint:biome:       4 │ + export·default·[...config];
@repo/workforce:lint:biome:     5 5 │   
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome:   × Some errors were emitted while running checks.
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome: 

apps-intuitui-web:lint:biome: .astro\content.d.ts:5:43 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-intuitui-web:lint:biome: 

apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.

apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     3 │ 		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
apps-intuitui-web:lint:biome:     4 │ 		headings: import('astro').MarkdownHeading[];
apps-intuitui-web:lint:biome:   > 5 │ 		remarkPluginFrontmatter: Record<string, any>;
apps-intuitui-web:lint:biome:       │ 		                                        ^^^
apps-intuitui-web:lint:biome:     6 │ 	}
apps-intuitui-web:lint:biome:     7 │ 	interface Render {
apps-intuitui-web:lint:biome:   

apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: .astro\content.d.ts:24:34 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     22 │ 	export type CollectionEntry<C extends CollectionKey> = Flatten<DataEntryMap[C]>;
apps-intuitui-web:lint:biome:     23 │ 
apps-intuitui-web:lint:biome:   > 24 │ 	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
apps-intuitui-web:lint:biome:        │ 	                                ^^^
apps-intuitui-web:lint:biome:     25 │ 

apps-intuitui-web:lint:biome:     26 │ 	export type ReferenceDataEntry<

@repo/profile:lint:biome: src\components\AchievementGallery.tsx:9:9 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.

@repo/profile:lint:biome:   
@repo/profile:lint:biome:      7 │   title: string;
@repo/profile:lint:biome:      8 │   description: string;
@repo/profile:lint:biome:    > 9 │   icon: any;
@repo/profile:lint:biome:        │         ^^^
@repo/profile:lint:biome:     10 │   unlocked: boolean;
@repo/profile:lint:biome:     11 │ }
@repo/profile:lint:biome:   

apps-intuitui-web:lint:biome:   

apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: .astro\content.d.ts:110:53 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     108 │ 	>;
apps-intuitui-web:lint:biome:     109 │ 
apps-intuitui-web:lint:biome:   > 110 │ 	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
apps-intuitui-web:lint:biome:         │ 	                                                   ^^^
apps-intuitui-web:lint:biome:     111 │ 	type InferEntrySchema<C extends keyof DataEntryMap> = import('astro/zod').infer<
apps-intuitui-web:lint:biome:     112 │ 		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: .astro\content.d.ts:120:5 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     118 │ 	> = L extends { schema: import('astro/zod').ZodSchema }
apps-intuitui-web:lint:biome:     119 │ 		? import('astro/zod').infer<L['schema']>
apps-intuitui-web:lint:biome:   > 120 │ 		: any;
apps-intuitui-web:lint:biome:         │ 		  ^^^
apps-intuitui-web:lint:biome:     121 │ 
apps-intuitui-web:lint:biome:     122 │ 	type DataEntryMap = {
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: .astro\content.d.ts:122:22 lint/complexity/noBannedTypes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Don't use '{}' as a type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     120 │ 		: any;
apps-intuitui-web:lint:biome:     121 │ 
apps-intuitui-web:lint:biome:   > 122 │ 	type DataEntryMap = {
apps-intuitui-web:lint:biome:         │ 	                    ^
apps-intuitui-web:lint:biome:   > 123 │ 		
apps-intuitui-web:lint:biome:   > 124 │ 	};
apps-intuitui-web:lint:biome:         │ 	^

apps-intuitui-web:lint:biome:     125 │ 
apps-intuitui-web:lint:biome:     126 │ 	type ExtractLoaderTypes<T> = T extends import('astro/loaders').LiveLoader<
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
apps-intuitui-web:lint:biome: src\components\StructuredData.astro:3:24 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     1 │ ---
apps-intuitui-web:lint:biome:     2 │ interface Props {
apps-intuitui-web:lint:biome:   > 3 │   data: Record<string, any> | Array<Record<string, any>>;
apps-intuitui-web:lint:biome:       │                        ^^^
apps-intuitui-web:lint:biome:     4 │ }
apps-intuitui-web:lint:biome:     5 │ 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 

apps-intuitui-web:lint:biome: src\components\StructuredData.astro:3:52 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\AddSocialLinkModal.tsx:44:9 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     42 │   labelKey: string;
@repo/profile:lint:biome:     43 │   value: SocialPlatform;
@repo/profile:lint:biome:   > 44 │   icon: any;
@repo/profile:lint:biome:        │         ^^^
@repo/profile:lint:biome:     45 │   color: string;
@repo/profile:lint:biome:     46 │ }[] = [
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\AddSocialLinkModal.tsx:81:9 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 

@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     79 │ const PRIVACY_LEVELS: {
@repo/profile:lint:biome:     80 │   value: PrivacyLevel;
@repo/profile:lint:biome:   > 81 │   icon: any;
@repo/profile:lint:biome:        │         ^^^
@repo/profile:lint:biome:     82 │   labelKey: string;
@repo/profile:lint:biome:     83 │   descKey: string;
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\AvatarDisplay.tsx:23:11 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   

@repo/profile:lint:biome:     21 │   editable?: boolean;
@repo/profile:lint:biome:     22 │   onAvatarSelected?: (localUri: string) => Promise<void>;
@repo/profile:lint:biome:   > 23 │   style?: any;
@repo/profile:lint:biome:        │           ^^^
@repo/profile:lint:biome:     24 │   peekable?: boolean;
@repo/profile:lint:biome:     25 │   peekType?: 'user' | 'school' | 'classroom' | 'community';
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\ContactLinktree.tsx:54:31 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     52 │   string,
@repo/profile:lint:biome:     53 │   {
@repo/profile:lint:biome:   > 54 │     icon: React.ComponentType<any>;
@repo/profile:lint:biome:        │                               ^^^
@repo/profile:lint:biome:     55 │     color: string;
@repo/profile:lint:biome:     56 │     label: string;
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\ContactLinktree.tsx:371:24 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     369 │                     user_id: userId!,
@repo/profile:lint:biome:     370 │                     order_index: links.length,
@repo/profile:lint:biome:   > 371 │                   } as any);
@repo/profile:lint:biome:         │                        ^^^
@repo/profile:lint:biome:     372 │                   setInlineAdding(false);
@repo/profile:lint:biome:     373 │                 }}
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\ControlScroll.tsx:59:53 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 

@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     57 │   };
@repo/profile:lint:biome:     58 │ 
@repo/profile:lint:biome:   > 59 │   const renderThemeOption = (mode: ThemeMode, Icon: any, label: string, description: string) => {
@repo/profile:lint:biome:        │                                                     ^^^
@repo/profile:lint:biome:     60 │     const isActive = themeMode === mode;
@repo/profile:lint:biome:     61 │ 
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:9:9 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:      8 │ interface EditableItemProps {
@repo/profile:lint:biome:    > 9 │   icon: any;
@repo/profile:lint:biome:        │         ^^^
@repo/profile:lint:biome:     10 │   label: string;
@repo/profile:lint:biome:     11 │   value?: string;
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:14:34 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     12 │   field: string;
@repo/profile:lint:biome:     13 │   placeholder?: string;
@repo/profile:lint:biome:   > 14 │   onSave: (field: string, value: any) => Promise<any>;
@repo/profile:lint:biome:        │                                  ^^^
@repo/profile:lint:biome:     15 │   multiline?: boolean;
@repo/profile:lint:biome:     16 │   disabled?: boolean;
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:14:50 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     12 │   field: string;
@repo/profile:lint:biome:     13 │   placeholder?: string;
@repo/profile:lint:biome:   > 14 │   onSave: (field: string, value: any) => Promise<any>;
@repo/profile:lint:biome:        │                                                  ^^^
@repo/profile:lint:biome:     15 │   multiline?: boolean;
@repo/profile:lint:biome:     16 │   disabled?: boolean;
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:76:19 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     74 │       await onSave(field, editValue);
@repo/profile:lint:biome:     75 │       setIsEditing(false);
@repo/profile:lint:biome:   > 76 │     } catch (err: any) {
@repo/profile:lint:biome:        │                   ^^^
@repo/profile:lint:biome:     77 │       setError(err?.message || 'Failed to save');
@repo/profile:lint:biome:     78 │     } finally {
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\screens\ThuthimalClaimScreen.tsx:47:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     46 │ export default function ThuthimalClaimScreen() {
@repo/profile:lint:biome:   > 47 │   const navigation = useNavigation<any>();
@repo/profile:lint:biome:        │                                    ^^^
@repo/profile:lint:biome:     48 │   const route = useRoute<RouteProp<ClaimRouteParams, 'ThuthimalClaim'>>();
@repo/profile:lint:biome:     49 │   const { t } = useTranslation();
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     1   │ - import·{·config·}·from·'@repo/eslint-config/react-internal';␍
@repo/profile:lint:biome:     2   │ - ␍
@repo/profile:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/profile:lint:biome:     4   │ - export·default·[...config];␍
@repo/profile:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/react-internal';
@repo/profile:lint:biome:       2 │ + 
@repo/profile:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/profile:lint:biome:       4 │ + export·default·[...config];
@repo/profile:lint:biome:     5 5 │   
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\api\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     1   │ - export·{·profileAPI,·socialAPI·}·from·'@repo/core/api';␍
@repo/profile:lint:biome:       1 │ + export·{·profileAPI,·socialAPI·}·from·'@repo/core/api';
@repo/profile:lint:biome:     2 2 │   
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\AddSocialLinkModal.tsx:135:9 lint/suspicious/noImplicitAnyLet ━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × This variable implicitly has the any type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     133 │     setLoading(true);
@repo/profile:lint:biome:     134 │ 
@repo/profile:lint:biome:   > 135 │     let result;
@repo/profile:lint:biome:         │         ^^^^^^
@repo/profile:lint:biome:     136 │     if (initialLink) {
@repo/profile:lint:biome:     137 │       result = await updateLink(initialLink.id, {
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i Variable declarations without type annotation and initialization implicitly have the any type. Declare a type or initialize the variable with some value.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\ContactLinktree.tsx:307:40 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     305 │           return (
@repo/profile:lint:biome:     306 │             <Animated.View
@repo/profile:lint:biome:   > 307 │               key={`${link.platform}-${index}`}
@repo/profile:lint:biome:         │                                        ^^^^^
@repo/profile:lint:biome:     308 │               entering={FadeInDown.delay(index * 100).springify()}
@repo/profile:lint:biome:     309 │             >
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i This is the source of the key value.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     279 │       {/* Link List */}
apps-intuitui-web:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
apps-intuitui-web:lint:biome: Diagnostics not shown: 12.
apps-intuitui-web:lint:biome: Checked 24 files in 270ms. No fixes applied.
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: Found 14 errors.
apps-intuitui-web:lint:biome: Found 18 warnings.
apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     1 │ ---
apps-intuitui-web:lint:biome:     2 │ interface Props {
apps-intuitui-web:lint:biome:   > 3 │   data: Record<string, any> | Array<Record<string, any>>;
apps-intuitui-web:lint:biome:       │                                                    ^^^
apps-intuitui-web:lint:biome:     4 │ }
apps-intuitui-web:lint:biome:     5 │ 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
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
apps-intuitui-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\layouts\MainLayout.astro:20:35 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     18 │   image?: string;
apps-intuitui-web:lint:biome:     19 │   noindex?: boolean;
apps-intuitui-web:lint:biome:   > 20 │   structuredData?: Record<string, any> | Array<Record<string, any>>;
apps-intuitui-web:lint:biome:        │                                   ^^^
apps-intuitui-web:lint:biome:     21 │ }
apps-intuitui-web:lint:biome:     22 │ 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\layouts\MainLayout.astro:20:63 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     18 │   image?: string;
apps-intuitui-web:lint:biome:     19 │   noindex?: boolean;
apps-intuitui-web:lint:biome:   > 20 │   structuredData?: Record<string, any> | Array<Record<string, any>>;
apps-intuitui-web:lint:biome:        │                                                               ^^^
apps-intuitui-web:lint:biome:     21 │ }
apps-intuitui-web:lint:biome:     22 │ 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\layouts\MainLayout.astro:3:8 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! This import is unused.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     1 │ ---
apps-intuitui-web:lint:biome:     2 │ import '../styles/global.css';
apps-intuitui-web:lint:biome:   > 3 │ import StructuredData from '../components/StructuredData.astro';
apps-intuitui-web:lint:biome:       │        ^^^^^^^^^^^^^^
apps-intuitui-web:lint:biome:     4 │ import {
apps-intuitui-web:lint:biome:     5 │   defaultOgImage,
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i Unsafe fix: Remove the unused imports.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:       1   1 │   
apps-intuitui-web:lint:biome:       2     │ - import·'../styles/global.css';␍
apps-intuitui-web:lint:biome:       3     │ - import·StructuredData·from·'../components/StructuredData.astro';␍
apps-intuitui-web:lint:biome:           2 │ + import·'../styles/global.css';␍
apps-intuitui-web:lint:biome:       4   3 │   import {␍
apps-intuitui-web:lint:biome:       5   4 │     defaultOgImage,␍
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\layouts\MainLayout.astro:8:3 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! Several of these imports are unused.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:      6 │   ORGANIZATION,
apps-intuitui-web:lint:biome:      7 │   SITE_DESCRIPTION,
apps-intuitui-web:lint:biome:    > 8 │   SITE_KEYWORDS,
apps-intuitui-web:lint:biome:        │   ^^^^^^^^^^^^^
apps-intuitui-web:lint:biome:      9 │   SITE_NAME,
apps-intuitui-web:lint:biome:     10 │   SITE_TITLE,
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i Unsafe fix: Remove the unused imports.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:       5   5 │     defaultOgImage,␍
apps-intuitui-web:lint:biome:       6   6 │     ORGANIZATION,␍
apps-intuitui-web:lint:biome:       7     │ - ··SITE_DESCRIPTION,␍
apps-intuitui-web:lint:biome:       8     │ - ··SITE_KEYWORDS,␍
apps-intuitui-web:lint:biome:           7 │ + ··SITE_DESCRIPTION,␍
apps-intuitui-web:lint:biome:       9   8 │     SITE_NAME,␍
apps-intuitui-web:lint:biome:      10   9 │     SITE_TITLE,␍
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\pages\about.astro:2:8 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   ! This import is unused.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     1 │ ---
@repo/profile:lint:biome:     280 │       <VStack space="md">
@repo/profile:lint:biome:   > 281 │         {displayLinks.map((link, index) => {
@repo/profile:lint:biome:         │                                  ^^^^^
@repo/profile:lint:biome:     282 │           if (inline && inlineEditingId === link.id) {
@repo/profile:lint:biome:     283 │             return (
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i Check the React documentation. 
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\screens\PublicProfileScreen.web.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:   
@repo/profile:lint:biome:      1    │ - �import·{·type·RouteProp,·useRoute·}·from·'@react-navigation/native';␍
@repo/profile:lint:biome:      2    │ - import·{·useEntity·}·from·'@repo/core/hooks';␍
@repo/profile:lint:biome:      3    │ - import·type·{·EntityType·}·from·'@repo/core/logic';␍
@repo/profile:lint:biome:      4    │ - import·IdentityCard,·{·type·IdentityData·}·from·'@repo/ui/components/IdentityCard';␍
@repo/profile:lint:biome:      5    │ - import·{·Box,·Center,·Spinner·}·from·'@repo/ui/primitives';␍
@repo/profile:lint:biome:      6    │ - import·{·useProfile·}·from·'../hooks/useProfile';␍
@repo/profile:lint:biome:      7    │ - ␍
@repo/profile:lint:biome:      8    │ - type·PublicProfileRouteProp·=·RouteProp<␍
@repo/profile:lint:biome:      9    │ - ··{·PublicProfile:·{·id:·string;·type:·EntityType·}·},␍
@repo/profile:lint:biome:     10    │ - ··'PublicProfile'␍
@repo/profile:lint:biome:     11    │ - >;␍
@repo/profile:lint:biome:     12    │ - ␍
@repo/profile:lint:biome:     13    │ - export·default·function·PublicProfileScreenWeb()·{␍
@repo/profile:lint:biome:     14    │ - ··const·route·=·useRoute<PublicProfileRouteProp>();␍
@repo/profile:lint:biome:     15    │ - ··const·{·id,·type·}·=·route.params·||·{};␍
@repo/profile:lint:biome:     16    │ - ␍
@repo/profile:lint:biome:     17    │ - ··const·{·profile,·loading:·isProfileLoading·}·=·useProfile(type·===·'user'·?·id·:·undefined);␍
@repo/profile:lint:biome:     18    │ - ··const·{·instance,·isLoading,·error·}·=·useEntity(type·as·EntityType,·id);␍
@repo/profile:lint:biome:     19    │ - ␍
@repo/profile:lint:biome:     20    │ - ··if·(type·===·'user')·{␍
@repo/profile:lint:biome:     21    │ - ····if·(isProfileLoading)·{␍
@repo/profile:lint:biome:     22    │ - ······return·(␍
@repo/profile:lint:biome:     23    │ - ········<Center·className="h-screen">␍
@repo/profile:lint:biome:     24    │ - ··········<Spinner·size="large"·/>␍
@repo/profile:lint:biome:     25    │ - ········</Center>␍
@repo/profile:lint:biome:     26    │ - ······);␍
@repo/profile:lint:biome:     27    │ - ····}␍
@repo/profile:lint:biome:     28    │ - ␍
@repo/profile:lint:biome:     29    │ - ····if·(!profile)·{␍
@repo/profile:lint:biome:     30    │ - ······return·(␍
@repo/profile:lint:biome:     31    │ - ········<Box·className="p-10·text-center·text-text-tertiary">␍
@repo/profile:lint:biome:     32    │ - ··········Profile·Not·Found·or·Error·Loading␍
@repo/profile:lint:biome:     33    │ - ········</Box>␍
@repo/profile:lint:biome:     34    │ - ······);␍
@repo/profile:lint:biome:     35    │ - ····}␍
@repo/profile:lint:biome:     36    │ - ␍
@repo/profile:lint:biome:     37    │ - ····return·(␍
@repo/profile:lint:biome:     38    │ - ······<Box·className="max-w-[1200px]·mx-auto·p-6">␍
@repo/profile:lint:biome:     39    │ - ········<IdentityCard·data={profile·as·unknown·as·IdentityData}·/>␍
@repo/profile:lint:biome:     40    │ - ······</Box>␍
@repo/profile:lint:biome:     41    │ - ····);␍
@repo/profile:lint:biome:     42    │ - ··}␍
@repo/profile:lint:biome:     43    │ - ␍
@repo/profile:lint:biome:     44    │ - ··if·(isLoading)·{␍
@repo/profile:lint:biome:     45    │ - ····return·(␍
@repo/profile:lint:biome:     46    │ - ······<Center·className="h-screen">␍
@repo/profile:lint:biome:     47    │ - ········<Spinner·size="large"·/>␍
@repo/profile:lint:biome:     48    │ - ······</Center>␍
@repo/profile:lint:biome:     49    │ - ····);␍
@repo/profile:lint:biome:     50    │ - ··}␍
@repo/profile:lint:biome:     51    │ - ␍
@repo/profile:lint:biome:     52    │ - ··if·(error·||·!instance)·{␍
@repo/profile:lint:biome:     53    │ - ····return·(␍
@repo/profile:lint:biome:     54    │ - ······<Box·className="p-10·text-center·text-text-tertiary">Profile·Not·Found·or·Error·Loading</Box>␍
@repo/profile:lint:biome:     55    │ - ····);␍
@repo/profile:lint:biome:     56    │ - ··}␍
@repo/profile:lint:biome:     57    │ - ␍
@repo/profile:lint:biome:     58    │ - ··//·Fallback·for·other·entity·types·if·needed,·or·structured·entity·view␍
@repo/profile:lint:biome:     59    │ - ··return·(␍
@repo/profile:lint:biome:     60    │ - ····<Box·className="max-w-[1200px]·mx-auto·p-6">␍
@repo/profile:lint:biome:     61    │ - ······<IdentityCard·data={instance·as·unknown·as·IdentityData}·/>␍
@repo/profile:lint:biome:     62    │ - ····</Box>␍
@repo/profile:lint:biome:     63    │ - ··);␍
@repo/profile:lint:biome:     64    │ - }␍
@repo/profile:lint:biome:         1 │ + �import·{·type·RouteProp,·useRoute·}·from·'@react-navigation/native';
@repo/profile:lint:biome:         2 │ + import·{·useEntity·}·from·'@repo/core/hooks';
@repo/profile:lint:biome:         3 │ + import·type·{·EntityType·}·from·'@repo/core/logic';
@repo/profile:lint:biome:         4 │ + import·IdentityCard,·{·type·IdentityData·}·from·'@repo/ui/components/IdentityCard';
@repo/profile:lint:biome:         5 │ + import·{·Box,·Center,·Spinner·}·from·'@repo/ui/primitives';
@repo/profile:lint:biome:         6 │ + import·{·useProfile·}·from·'../hooks/useProfile';
@repo/profile:lint:biome:         7 │ + 
@repo/profile:lint:biome:         8 │ + type·PublicProfileRouteProp·=·RouteProp<
@repo/profile:lint:biome:         9 │ + ··{·PublicProfile:·{·id:·string;·type:·EntityType·}·},
@repo/profile:lint:biome:        10 │ + ··'PublicProfile'
@repo/profile:lint:biome:        11 │ + >;
@repo/profile:lint:biome:        12 │ + 
@repo/profile:lint:biome:        13 │ + export·default·function·PublicProfileScreenWeb()·{
@repo/profile:lint:biome:        14 │ + ··const·route·=·useRoute<PublicProfileRouteProp>();
@repo/profile:lint:biome:        15 │ + ··const·{·id,·type·}·=·route.params·||·{};
@repo/profile:lint:biome:        16 │ + 
@repo/profile:lint:biome:        17 │ + ··const·{·profile,·loading:·isProfileLoading·}·=·useProfile(type·===·'user'·?·id·:·undefined);
@repo/profile:lint:biome:        18 │ + ··const·{·instance,·isLoading,·error·}·=·useEntity(type·as·EntityType,·id);
@repo/profile:lint:biome:        19 │ + 
@repo/profile:lint:biome:        20 │ + ··if·(type·===·'user')·{
@repo/profile:lint:biome:        21 │ + ····if·(isProfileLoading)·{
@repo/profile:lint:biome:        22 │ + ······return·(
@repo/profile:lint:biome:        23 │ + ········<Center·className="h-screen">
@repo/profile:lint:biome:        24 │ + ··········<Spinner·size="large"·/>
@repo/profile:lint:biome:        25 │ + ········</Center>
@repo/profile:lint:biome:        26 │ + ······);
@repo/profile:lint:biome:        27 │ + ····}
@repo/profile:lint:biome:        28 │ + 
@repo/profile:lint:biome:        29 │ + ····if·(!profile)·{
@repo/profile:lint:biome:        30 │ + ······return·(
@repo/profile:lint:biome:        31 │ + ········<Box·className="p-10·text-center·text-text-tertiary">
@repo/profile:lint:biome:        32 │ + ··········Profile·Not·Found·or·Error·Loading
@repo/profile:lint:biome:        33 │ + ········</Box>
@repo/profile:lint:biome:        34 │ + ······);
@repo/profile:lint:biome:        35 │ + ····}
@repo/profile:lint:biome:        36 │ + 
@repo/profile:lint:biome:        37 │ + ····return·(
@repo/profile:lint:biome:        38 │ + ······<Box·className="max-w-[1200px]·mx-auto·p-6">
@repo/profile:lint:biome:        39 │ + ········<IdentityCard·data={profile·as·unknown·as·IdentityData}·/>
@repo/profile:lint:biome:        40 │ + ······</Box>
@repo/profile:lint:biome:        41 │ + ····);
@repo/profile:lint:biome:        42 │ + ··}
@repo/profile:lint:biome:        43 │ + 
@repo/profile:lint:biome:        44 │ + ··if·(isLoading)·{
@repo/profile:lint:biome:        45 │ + ····return·(
@repo/profile:lint:biome:        46 │ + ······<Center·className="h-screen">
@repo/profile:lint:biome:        47 │ + ········<Spinner·size="large"·/>
@repo/profile:lint:biome:        48 │ + ······</Center>
@repo/profile:lint:biome:        49 │ + ····);
@repo/profile:lint:biome:        50 │ + ··}

apps-intuitui-web:lint:biome:   > 2 │ import MainLayout from '../layouts/MainLayout.astro';
apps-intuitui-web:lint:biome:       │        ^^^^^^^^^^
apps-intuitui-web:lint:biome:     3 │ ---
apps-intuitui-web:lint:biome:     4 │ 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i Unused imports might be the result of an incomplete refactoring.

apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:   i Unsafe fix: Remove the unused imports.
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     1   │ - 
apps-intuitui-web:lint:biome:     2   │ - import·MainLayout·from·'../layouts/MainLayout.astro';␍
apps-intuitui-web:lint:biome:       1 │ + ␍
apps-intuitui-web:lint:biome:     3 2 │   
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: .astro\content.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   × Formatter would have printed the following content:
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:       1   1 │   declare module 'astro:content' {
apps-intuitui-web:lint:biome:       2     │ - → export·interface·RenderResult·{
apps-intuitui-web:lint:biome:       3     │ - → → Content:·import('astro/runtime/server/index.js').AstroComponentFactory;
apps-intuitui-web:lint:biome:       4     │ - → → headings:·import('astro').MarkdownHeading[];
apps-intuitui-web:lint:biome:       5     │ - → → remarkPluginFrontmatter:·Record<string,·any>;
apps-intuitui-web:lint:biome:       6     │ - → }
apps-intuitui-web:lint:biome:       7     │ - → interface·Render·{
apps-intuitui-web:lint:biome:       8     │ - → → '.md':·Promise<RenderResult>;
apps-intuitui-web:lint:biome:       9     │ - → }
apps-intuitui-web:lint:biome:           2 │ + ··export·interface·RenderResult·{
apps-intuitui-web:lint:biome:           3 │ + ····Content:·import('astro/runtime/server/index.js').AstroComponentFactory;
apps-intuitui-web:lint:biome:           4 │ + ····headings:·import('astro').MarkdownHeading[];
apps-intuitui-web:lint:biome:           5 │ + ····remarkPluginFrontmatter:·Record<string,·any>;
apps-intuitui-web:lint:biome:           6 │ + ··}
apps-intuitui-web:lint:biome:           7 │ + ··interface·Render·{
apps-intuitui-web:lint:biome:           8 │ + ····'.md':·Promise<RenderResult>;
apps-intuitui-web:lint:biome:           9 │ + ··}
apps-intuitui-web:lint:biome:      10  10 │   
apps-intuitui-web:lint:biome:      11     │ - → export·interface·RenderedContent·{
apps-intuitui-web:lint:biome:      12     │ - → → html:·string;
apps-intuitui-web:lint:biome:      13     │ - → → metadata?:·{
apps-intuitui-web:lint:biome:      14     │ - → → → imagePaths:·Array<string>;
apps-intuitui-web:lint:biome:      15     │ - → → → [key:·string]:·unknown;
apps-intuitui-web:lint:biome:      16     │ - → → };
apps-intuitui-web:lint:biome:      17     │ - → }
apps-intuitui-web:lint:biome:          11 │ + ··export·interface·RenderedContent·{
apps-intuitui-web:lint:biome:          12 │ + ····html:·string;
apps-intuitui-web:lint:biome:          13 │ + ····metadata?:·{
apps-intuitui-web:lint:biome:          14 │ + ······imagePaths:·Array<string>;
apps-intuitui-web:lint:biome:          15 │ + ······[key:·string]:·unknown;
apps-intuitui-web:lint:biome:          16 │ + ····};
apps-intuitui-web:lint:biome:          17 │ + ··}
apps-intuitui-web:lint:biome:      18  18 │   
apps-intuitui-web:lint:biome:      19     │ - → type·Flatten<T>·=·T·extends·{·[K:·string]:·infer·U·}·?·U·:·never;
apps-intuitui-web:lint:biome:          19 │ + ··type·Flatten<T>·=·T·extends·{·[K:·string]:·infer·U·}·?·U·:·never;
apps-intuitui-web:lint:biome:      20  20 │   
apps-intuitui-web:lint:biome:      21     │ - → export·type·CollectionKey·=·keyof·DataEntryMap;
apps-intuitui-web:lint:biome:      22     │ - → export·type·CollectionEntry<C·extends·CollectionKey>·=·Flatten<DataEntryMap[C]>;

apps-intuitui-web:lint:biome:          21 │ + ··export·type·CollectionKey·=·keyof·DataEntryMap;
apps-intuitui-web:lint:biome:          22 │ + ··export·type·CollectionEntry<C·extends·CollectionKey>·=·Flatten<DataEntryMap[C]>;
apps-intuitui-web:lint:biome:      23  23 │   
apps-intuitui-web:lint:biome:      24     │ - → type·AllValuesOf<T>·=·T·extends·any·?·T[keyof·T]·:·never;
apps-intuitui-web:lint:biome:          24 │ + ··type·AllValuesOf<T>·=·T·extends·any·?·T[keyof·T]·:·never;
apps-intuitui-web:lint:biome:      25  25 │   
apps-intuitui-web:lint:biome:      26     │ - → export·type·ReferenceDataEntry<
apps-intuitui-web:lint:biome:      27     │ - → → C·extends·CollectionKey,
apps-intuitui-web:lint:biome:      28     │ - → → E·extends·keyof·DataEntryMap[C]·=·string,
apps-intuitui-web:lint:biome:      29     │ - → >·=·{
apps-intuitui-web:lint:biome:      30     │ - → → collection:·C;
apps-intuitui-web:lint:biome:      31     │ - → → id:·E;
apps-intuitui-web:lint:biome:      32     │ - → };
apps-intuitui-web:lint:biome:          26 │ + ··export·type·ReferenceDataEntry<
apps-intuitui-web:lint:biome:          27 │ + ····C·extends·CollectionKey,
apps-intuitui-web:lint:biome:          28 │ + ····E·extends·keyof·DataEntryMap[C]·=·string,
apps-intuitui-web:lint:biome:          29 │ + ··>·=·{
apps-intuitui-web:lint:biome:          30 │ + ····collection:·C;
apps-intuitui-web:lint:biome:          31 │ + ····id:·E;
apps-intuitui-web:lint:biome:          32 │ + ··};
apps-intuitui-web:lint:biome:      33  33 │   
apps-intuitui-web:lint:biome:      34     │ - → export·type·ReferenceLiveEntry<C·extends·keyof·LiveContentConfig['collections']>·=·{
apps-intuitui-web:lint:biome:      35     │ - → → collection:·C;
apps-intuitui-web:lint:biome:      36     │ - → → id:·string;
apps-intuitui-web:lint:biome:      37     │ - → };
apps-intuitui-web:lint:biome:          34 │ + ··export·type·ReferenceLiveEntry<C·extends·keyof·LiveContentConfig['collections']>·=·{
apps-intuitui-web:lint:biome:          35 │ + ····collection:·C;
apps-intuitui-web:lint:biome:          36 │ + ····id:·string;
apps-intuitui-web:lint:biome:          37 │ + ··};
apps-intuitui-web:lint:biome:      38  38 │   
apps-intuitui-web:lint:biome:      39     │ - → export·function·getCollection<C·extends·keyof·DataEntryMap,·E·extends·CollectionEntry<C>>(
apps-intuitui-web:lint:biome:      40     │ - → → collection:·C,
apps-intuitui-web:lint:biome:      41     │ - → → filter?:·(entry:·CollectionEntry<C>)·=>·entry·is·E,
apps-intuitui-web:lint:biome:      42     │ - → ):·Promise<E[]>;
apps-intuitui-web:lint:biome:      43     │ - → export·function·getCollection<C·extends·keyof·DataEntryMap>(
apps-intuitui-web:lint:biome:      44     │ - → → collection:·C,
apps-intuitui-web:lint:biome:      45     │ - → → filter?:·(entry:·CollectionEntry<C>)·=>·unknown,
apps-intuitui-web:lint:biome:      46     │ - → ):·Promise<CollectionEntry<C>[]>;
apps-intuitui-web:lint:biome:          39 │ + ··export·function·getCollection<C·extends·keyof·DataEntryMap,·E·extends·CollectionEntry<C>>(
apps-intuitui-web:lint:biome:          40 │ + ····collection:·C,
apps-intuitui-web:lint:biome:          41 │ + ····filter?:·(entry:·CollectionEntry<C>)·=>·entry·is·E,
apps-intuitui-web:lint:biome:          42 │ + ··):·Promise<E[]>;
apps-intuitui-web:lint:biome:          43 │ + ··export·function·getCollection<C·extends·keyof·DataEntryMap>(
apps-intuitui-web:lint:biome:          44 │ + ····collection:·C,
apps-intuitui-web:lint:biome:          45 │ + ····filter?:·(entry:·CollectionEntry<C>)·=>·unknown,
apps-intuitui-web:lint:biome:          46 │ + ··):·Promise<CollectionEntry<C>[]>;
apps-intuitui-web:lint:biome:      47  47 │   
apps-intuitui-web:lint:biome:      48     │ - → export·function·getLiveCollection<C·extends·keyof·LiveContentConfig['collections']>(
apps-intuitui-web:lint:biome:      49     │ - → → collection:·C,
apps-intuitui-web:lint:biome:      50     │ - → → filter?:·LiveLoaderCollectionFilterType<C>,
apps-intuitui-web:lint:biome:      51     │ - → ):·Promise<
apps-intuitui-web:lint:biome:      52     │ - → → import('astro').LiveDataCollectionResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>
apps-intuitui-web:lint:biome:      53     │ - → >;
apps-intuitui-web:lint:biome:          48 │ + ··export·function·getLiveCollection<C·extends·keyof·LiveContentConfig['collections']>(
apps-intuitui-web:lint:biome:          49 │ + ····collection:·C,
apps-intuitui-web:lint:biome:          50 │ + ····filter?:·LiveLoaderCollectionFilterType<C>,
apps-intuitui-web:lint:biome:          51 │ + ··):·Promise<
apps-intuitui-web:lint:biome:          52 │ + ····import('astro').LiveDataCollectionResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>
apps-intuitui-web:lint:biome:          53 │ + ··>;
apps-intuitui-web:lint:biome:      54  54 │   
apps-intuitui-web:lint:biome:      55     │ - → export·function·getEntry<
apps-intuitui-web:lint:biome:      56     │ - → → C·extends·keyof·DataEntryMap,
apps-intuitui-web:lint:biome:      57     │ - → → E·extends·keyof·DataEntryMap[C]·|·(string·&·{}),
apps-intuitui-web:lint:biome:      58     │ - → >(
apps-intuitui-web:lint:biome:      59     │ - → → entry:·ReferenceDataEntry<C,·E>,
apps-intuitui-web:lint:biome:      60     │ - → ):·E·extends·keyof·DataEntryMap[C]
apps-intuitui-web:lint:biome:      61     │ - → → ?·Promise<DataEntryMap[C][E]>

apps-intuitui-web:lint:biome:      62     │ - → → :·Promise<CollectionEntry<C>·|·undefined>;
apps-intuitui-web:lint:biome:      63     │ - → export·function·getEntry<
apps-intuitui-web:lint:biome:      64     │ - → → C·extends·keyof·DataEntryMap,
apps-intuitui-web:lint:biome:      65     │ - → → E·extends·keyof·DataEntryMap[C]·|·(string·&·{}),
apps-intuitui-web:lint:biome:      66     │ - → >(
apps-intuitui-web:lint:biome:      67     │ - → → collection:·C,
apps-intuitui-web:lint:biome:      68     │ - → → id:·E,
apps-intuitui-web:lint:biome:      69     │ - → ):·E·extends·keyof·DataEntryMap[C]
apps-intuitui-web:lint:biome:      70     │ - → → ?·string·extends·keyof·DataEntryMap[C]
apps-intuitui-web:lint:biome:      71     │ - → → → ?·Promise<DataEntryMap[C][E]>·|·undefined
apps-intuitui-web:lint:biome:      72     │ - → → → :·Promise<DataEntryMap[C][E]>
apps-intuitui-web:lint:biome:      73     │ - → → :·Promise<CollectionEntry<C>·|·undefined>;
apps-intuitui-web:lint:biome:      74     │ - → export·function·getLiveEntry<C·extends·keyof·LiveContentConfig['collections']>(
apps-intuitui-web:lint:biome:      75     │ - → → collection:·C,
apps-intuitui-web:lint:biome:      76     │ - → → filter:·string·|·LiveLoaderEntryFilterType<C>,
apps-intuitui-web:lint:biome:      77     │ - → ):·Promise<import('astro').LiveDataEntryResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>>;
apps-intuitui-web:lint:biome:          55 │ + ··export·function·getEntry<
apps-intuitui-web:lint:biome:          56 │ + ····C·extends·keyof·DataEntryMap,
apps-intuitui-web:lint:biome:          57 │ + ····E·extends·keyof·DataEntryMap[C]·|·(string·&·{}),
apps-intuitui-web:lint:biome:          58 │ + ··>(
apps-intuitui-web:lint:biome:          59 │ + ····entry:·ReferenceDataEntry<C,·E>,
apps-intuitui-web:lint:biome:          60 │ + ··):·E·extends·keyof·DataEntryMap[C]
apps-intuitui-web:lint:biome:          61 │ + ····?·Promise<DataEntryMap[C][E]>
apps-intuitui-web:lint:biome:          62 │ + ····:·Promise<CollectionEntry<C>·|·undefined>;
apps-intuitui-web:lint:biome:          63 │ + ··export·function·getEntry<
apps-intuitui-web:lint:biome:          64 │ + ····C·extends·keyof·DataEntryMap,
@repo/profile:lint:biome:        51 │ + 
@repo/profile:lint:biome:        52 │ + ··if·(error·||·!instance)·{
@repo/profile:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/profile:lint:biome: Diagnostics not shown: 67.
@repo/profile:lint:biome: Checked 53 files in 412ms. No fixes applied.
@repo/profile:lint:biome: Found 18 errors.
@repo/profile:lint:biome: Found 45 warnings.
@repo/profile:lint:biome: Found 24 infos.
@repo/profile:lint:biome:        53 │ + ····return·(
@repo/profile:lint:biome:        54 │ + ······<Box·className="p-10·text-center·text-text-tertiary">Profile·Not·Found·or·Error·Loading</Box>
@repo/profile:lint:biome:        55 │ + ····);
@repo/profile:lint:biome:        56 │ + ··}
@repo/profile:lint:biome:        57 │ + 
@repo/profile:lint:biome:        58 │ + ··//·Fallback·for·other·entity·types·if·needed,·or·structured·entity·view
@repo/profile:lint:biome:        59 │ + ··return·(
@repo/profile:lint:biome:        60 │ + ····<Box·className="max-w-[1200px]·mx-auto·p-6">
@repo/profile:lint:biome:        61 │ + ······<IdentityCard·data={instance·as·unknown·as·IdentityData}·/>
@repo/profile:lint:biome:        62 │ + ····</Box>
@repo/profile:lint:biome:        63 │ + ··);
@repo/profile:lint:biome:        64 │ + }
@repo/profile:lint:biome:     65 65 │   
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\screens\ThuthimalClaimScreen.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:   
@repo/profile:lint:biome:       1     │ - /**␍
@repo/profile:lint:biome:       2     │ - ·*·ThuthimalClaimScreen·—·Flower·of·Gratitude·gift·claim·experience␍
@repo/profile:lint:biome:       3     │ - ·*␍
@repo/profile:lint:biome:       4     │ - ·*·Navigated·to·from·QRHandlerScreen·when·a·thuthimal_gift·QR·is·scanned.␍
@repo/profile:lint:biome:       5     │ - ·*·Philosophy:·Non-transactional,·dignified,·honors·teaching·as·sacred·work.␍
@repo/profile:lint:biome:       6     │ - ·*/␍
@repo/profile:lint:biome:       7     │ - ␍
@repo/profile:lint:biome:       8     │ - import·{·type·RouteProp,·useNavigation,·useRoute·}·from·'@react-navigation/native';␍
@repo/profile:lint:biome:       9     │ - import·{·identityAPI,·thuthimalAPI·}·from·'@repo/core/api';␍
@repo/profile:lint:biome:      10     │ - ␍
apps-intuitui-web:lint:biome:          65 │ + ····E·extends·keyof·DataEntryMap[C]·|·(string·&·{}),
apps-intuitui-web:lint:biome:          66 │ + ··>(
apps-intuitui-web:lint:biome:          67 │ + ····collection:·C,
apps-intuitui-web:lint:biome:          68 │ + ····id:·E,
apps-intuitui-web:lint:biome:          69 │ + ··):·E·extends·keyof·DataEntryMap[C]
apps-intuitui-web:lint:biome:          70 │ + ····?·string·extends·keyof·DataEntryMap[C]
apps-intuitui-web:lint:biome:          71 │ + ······?·Promise<DataEntryMap[C][E]>·|·undefined
apps-intuitui-web:lint:biome:          72 │ + ······:·Promise<DataEntryMap[C][E]>
apps-intuitui-web:lint:biome:          73 │ + ····:·Promise<CollectionEntry<C>·|·undefined>;
apps-intuitui-web:lint:biome:          74 │ + ··export·function·getLiveEntry<C·extends·keyof·LiveContentConfig['collections']>(
apps-intuitui-web:lint:biome:          75 │ + ····collection:·C,
apps-intuitui-web:lint:biome:          76 │ + ····filter:·string·|·LiveLoaderEntryFilterType<C>,
apps-intuitui-web:lint:biome:          77 │ + ··):·Promise<import('astro').LiveDataEntryResult<LiveLoaderDataType<C>,·LiveLoaderErrorType<C>>>;
apps-intuitui-web:lint:biome:      78  78 │   
apps-intuitui-web:lint:biome:      79     │ - → /**·Resolve·an·array·of·entry·references·from·the·same·collection·*/
apps-intuitui-web:lint:biome:      80     │ - → export·function·getEntries<C·extends·keyof·DataEntryMap>(
apps-intuitui-web:lint:biome:      81     │ - → → entries:·ReferenceDataEntry<C,·keyof·DataEntryMap[C]>[],
apps-intuitui-web:lint:biome:      82     │ - → ):·Promise<CollectionEntry<C>[]>;
apps-intuitui-web:lint:biome:          79 │ + ··/**·Resolve·an·array·of·entry·references·from·the·same·collection·*/
apps-intuitui-web:lint:biome:   138 more lines truncated
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: .astro\types.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   × Formatter would have printed the following content:
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:     1 1 │   /// <reference types="astro/client" />
apps-intuitui-web:lint:biome:     2   │ - ///·<reference·path="content.d.ts"·/>
apps-intuitui-web:lint:biome:       2 │ + ///·<reference·path="content.d.ts"·/>
apps-intuitui-web:lint:biome:       3 │ + 
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: astro.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   × Formatter would have printed the following content:
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:      1    │ - //·@ts-check␍
apps-intuitui-web:lint:biome:      2    │ - ␍
apps-intuitui-web:lint:biome:      3    │ - import·sitemap·from·'@astrojs/sitemap';␍
apps-intuitui-web:lint:biome:      4    │ - import·svelte·from·'@astrojs/svelte';␍
apps-intuitui-web:lint:biome:      5    │ - import·tailwindcss·from·'@tailwindcss/vite';␍
apps-intuitui-web:lint:biome:      6    │ - import·{·defineConfig·}·from·'astro/config';␍
apps-intuitui-web:lint:biome:      7    │ - ␍
apps-intuitui-web:lint:biome:      8    │ - //·https://astro.build/config␍
apps-intuitui-web:lint:biome:      9    │ - export·default·defineConfig({␍
apps-intuitui-web:lint:biome:     10    │ - ··site:·'https://intuituilabs.edlove.org',␍
apps-intuitui-web:lint:biome:     11    │ - ··vite:·{␍
apps-intuitui-web:lint:biome:     12    │ - ····plugins:·[tailwindcss()],␍
apps-intuitui-web:lint:biome:     13    │ - ··},␍
apps-intuitui-web:lint:biome:     14    │ - ··integrations:·[svelte(),·sitemap()],␍
apps-intuitui-web:lint:biome:     15    │ - });␍
apps-intuitui-web:lint:biome:         1 │ + //·@ts-check
apps-intuitui-web:lint:biome:         2 │ + 
apps-intuitui-web:lint:biome:         3 │ + import·sitemap·from·'@astrojs/sitemap';
apps-intuitui-web:lint:biome:         4 │ + import·svelte·from·'@astrojs/svelte';
apps-intuitui-web:lint:biome:         5 │ + import·tailwindcss·from·'@tailwindcss/vite';
apps-intuitui-web:lint:biome:         6 │ + import·{·defineConfig·}·from·'astro/config';
apps-intuitui-web:lint:biome:         7 │ + 
apps-intuitui-web:lint:biome:         8 │ + //·https://astro.build/config
apps-intuitui-web:lint:biome:         9 │ + export·default·defineConfig({
apps-intuitui-web:lint:biome:        10 │ + ··site:·'https://intuituilabs.edlove.org',
apps-intuitui-web:lint:biome:        11 │ + ··vite:·{
apps-intuitui-web:lint:biome:        12 │ + ····plugins:·[tailwindcss()],
apps-intuitui-web:lint:biome:        13 │ + ··},
apps-intuitui-web:lint:biome:        14 │ + ··integrations:·[svelte(),·sitemap()],
apps-intuitui-web:lint:biome:        15 │ + });
apps-intuitui-web:lint:biome:     16 16 │   
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\components\StructuredData.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   × Formatter would have printed the following content:
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:      1  1 │   ---␍
apps-intuitui-web:lint:biome:      2    │ - interface·Props·{␍
apps-intuitui-web:lint:biome:      3    │ - ··data:·Record<string,·any>·|·Array<Record<string,·any>>;␍
apps-intuitui-web:lint:biome:      4    │ - }␍
apps-intuitui-web:lint:biome:      5    │ - ␍
apps-intuitui-web:lint:biome:      6    │ - const·{·data·}·=·Astro.props;␍
apps-intuitui-web:lint:biome:      7    │ - const·_normalized·=·Array.isArray(data)·?·data·:·[data];␍
apps-intuitui-web:lint:biome:         2 │ + interface·Props·{
apps-intuitui-web:lint:biome:         3 │ + ··data:·Record<string,·any>·|·Array<Record<string,·any>>;
apps-intuitui-web:lint:biome:         4 │ + }
apps-intuitui-web:lint:biome:         5 │ + 
apps-intuitui-web:lint:biome:         6 │ + const·{·data·}·=·Astro.props;
apps-intuitui-web:lint:biome:         7 │ + const·_normalized·=·Array.isArray(data)·?·data·:·[data];
apps-intuitui-web:lint:biome:      8  8 │   ---␍
apps-intuitui-web:lint:biome:      9  9 │   ␍
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\components\SystemsGrid.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   × Formatter would have printed the following content:
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:      1  1 │   ---␍
apps-intuitui-web:lint:biome:      2    │ - interface·Props·{␍
apps-intuitui-web:lint:biome:      3    │ - ··columns?:·number;␍
apps-intuitui-web:lint:biome:      4    │ - ··className?:·string;␍
apps-intuitui-web:lint:biome:      5    │ - }␍
apps-intuitui-web:lint:biome:      6    │ - ␍
apps-intuitui-web:lint:biome:      7    │ - const·{·columns·=·3,·className·=·''·}·=·Astro.props;␍
apps-intuitui-web:lint:biome:         2 │ + interface·Props·{
apps-intuitui-web:lint:biome:         3 │ + ··columns?:·number;
apps-intuitui-web:lint:biome:         4 │ + ··className?:·string;
apps-intuitui-web:lint:biome:         5 │ + }
apps-intuitui-web:lint:biome:         6 │ + 
apps-intuitui-web:lint:biome:         7 │ + const·{·columns·=·3,·className·=·''·}·=·Astro.props;
apps-intuitui-web:lint:biome:      8  8 │   ---␍
apps-intuitui-web:lint:biome:      9  9 │   ␍
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome: src\layouts\MainLayout.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-intuitui-web:lint:biome: 
apps-intuitui-web:lint:biome:   × Formatter would have printed the following content:
apps-intuitui-web:lint:biome:   
apps-intuitui-web:lint:biome:       1   1 │   ---␍
apps-intuitui-web:lint:biome:       2     │ - import·'../styles/global.css';␍
apps-intuitui-web:lint:biome:       3     │ - import·StructuredData·from·'../components/StructuredData.astro';␍
apps-intuitui-web:lint:biome:       4     │ - import·{␍
apps-intuitui-web:lint:biome:       5     │ - ··defaultOgImage,␍
apps-intuitui-web:lint:biome:       6     │ - ··ORGANIZATION,␍
apps-intuitui-web:lint:biome:       7     │ - ··SITE_DESCRIPTION,␍
apps-intuitui-web:lint:biome:       8     │ - ··SITE_KEYWORDS,␍
apps-intuitui-web:lint:biome:       9     │ - ··SITE_NAME,␍
apps-intuitui-web:lint:biome:      10     │ - ··SITE_TITLE,␍
apps-intuitui-web:lint:biome:      11     │ - ··SITE_URL,␍
apps-intuitui-web:lint:biome:      12     │ - }·from·'../lib/site';␍
apps-intuitui-web:lint:biome:      13     │ - ␍
apps-intuitui-web:lint:biome:      14     │ - interface·Props·{␍
apps-intuitui-web:lint:biome:      15     │ - ··title?:·string;␍
apps-intuitui-web:lint:biome:      16     │ - ··description?:·string;␍
apps-intuitui-web:lint:biome:      17     │ - ··theme?:·'home'·|·'about'·|·'projects'·|·'studio'·|·'default';␍
apps-intuitui-web:lint:biome:      18     │ - ··image?:·string;␍
apps-intuitui-web:lint:biome:      19     │ - ··noindex?:·boolean;␍
apps-intuitui-web:lint:biome:      20     │ - ··structuredData?:·Record<string,·any>·|·Array<Record<string,·any>>;␍
apps-intuitui-web:lint:biome:      21     │ - }␍
apps-intuitui-web:lint:biome:      22     │ - ␍
apps-intuitui-web:lint:biome:      23     │ - const·{␍
apps-intuitui-web:lint:biome:      24     │ - ··title·=·SITE_TITLE,␍
apps-intuitui-web:lint:biome:      25     │ - ··description·=·SITE_DESCRIPTION,␍
apps-intuitui-web:lint:biome:      26     │ - ··theme·=·'default',␍
apps-intuitui-web:lint:biome:      27     │ - ··image,␍
apps-intuitui-web:lint:biome:      28     │ - ··noindex·=·false,␍
apps-intuitui-web:lint:biome:      29     │ - ··structuredData·=·[],␍
apps-intuitui-web:lint:biome:      30     │ - }·=·Astro.props;␍
apps-intuitui-web:lint:biome:      31     │ - ␍
apps-intuitui-web:lint:biome:      32     │ - const·canonical·=·Astro.url.href;␍
apps-intuitui-web:lint:biome:      33     │ - const·_ogImage·=·image·??·defaultOgImage(Astro.url.pathname);␍
apps-intuitui-web:lint:biome:      34     │ - const·_robotsContent·=·noindex·?·'noindex,·nofollow'·:·'index,·follow';␍
apps-intuitui-web:lint:biome:      35     │ - const·_baseStructuredData·=·[␍
apps-intuitui-web:lint:biome:      36     │ - ··{␍
apps-intuitui-web:lint:biome:      37     │ - ····'@context':·'https://schema.org',␍
apps-intuitui-web:lint:biome:      38     │ - ····'@type':·'Organization',␍
apps-intuitui-web:lint:biome:      39     │ - ····...ORGANIZATION,␍
apps-intuitui-web:lint:biome:      40     │ - ··},␍
apps-intuitui-web:lint:biome:      41     │ - ··{␍
apps-intuitui-web:lint:biome:      42     │ - ····'@context':·'https://schema.org',␍
apps-intuitui-web:lint:biome:      43     │ - ····'@type':·'WebSite',␍
apps-intuitui-web:lint:biome:      44     │ - ····name:·SITE_NAME,␍
apps-intuitui-web:lint:biome:      45     │ - ····url:·SITE_URL,␍
apps-intuitui-web:lint:biome:      46     │ - ····description:·SITE_DESCRIPTION,␍
apps-intuitui-web:lint:biome:      47     │ - ··},␍
apps-intuitui-web:lint:biome:      48     │ - ··{␍
apps-intuitui-web:lint:biome:      49     │ - ····'@context':·'https://schema.org',␍
apps-intuitui-web:lint:biome:      50     │ - ····'@type':·'WebPage',␍
apps-intuitui-web:lint:biome:      51     │ - ····name:·title,␍
apps-intuitui-web:lint:biome:      52     │ - ····description,␍
apps-intuitui-web:lint:biome:      53     │ - ····url:·canonical,␍
apps-intuitui-web:lint:biome:      54     │ - ····isPartOf:·{␍
apps-intuitui-web:lint:biome:      55     │ - ······'@type':·'WebSite',␍
apps-intuitui-web:lint:biome:      56     │ - ······name:·SITE_NAME,␍
apps-intuitui-web:lint:biome:      57     │ - ······url:·SITE_URL,␍
apps-intuitui-web:lint:biome:      58     │ - ····},␍
apps-intuitui-web:lint:biome:      59     │ - ··},␍
apps-intuitui-web:lint:biome:      60     │ - ]␍
apps-intuitui-web:lint:biome:      61     │ - ··.concat(Array.isArray(structuredData)·?·structuredData·:·[structuredData])␍
apps-intuitui-web:lint:biome:      62     │ - ··.filter(Boolean);␍
apps-intuitui-web:lint:biome:      63     │ - ␍
apps-intuitui-web:lint:biome:      64     │ - //·Theme-specific·background·configurations·with·parallax·weights␍
apps-intuitui-web:lint:biome:      65     │ - const·themes·=·{␍
apps-intuitui-web:lint:biome:      66     │ - ··home:·[␍
apps-intuitui-web:lint:biome:      67     │ - ····{␍
apps-intuitui-web:lint:biome:      68     │ - ······color:·'bg-brand-sky/5',␍
apps-intuitui-web:lint:biome:      69     │ - ······shape:·'w-[70%]·h-[80%]·-top-[20%]·-left-[10%]·-rotate-12',␍
apps-intuitui-web:lint:biome:      70     │ - ······parallax:·0.1,␍
apps-intuitui-web:lint:biome:      71     │ - ····},␍
apps-intuitui-web:lint:biome:      72     │ - ····{␍
apps-intuitui-web:lint:biome:      73     │ - ······color:·'bg-brand-leaf/5',␍
apps-intuitui-web:lint:biome:      74     │ - ······shape:·'w-[60%]·h-[70%]·-bottom-[20%]·-right-[10%]·rotate-6',␍
apps-intuitui-web:lint:biome:      75     │ - ······parallax:·-0.15,␍
apps-intuitui-web:lint:biome:      76     │ - ····},␍
apps-intuitui-web:lint:biome:      77     │ - ····{␍
apps-intuitui-web:lint:biome:      78     │ - ······color:·'bg-brand-sky/3',␍
apps-intuitui-web:lint:biome:      79     │ - ······shape:·'w-[40%]·h-[50%]·top-1/4·left-1/2·-rotate-45',␍
apps-intuitui-web:lint:biome:      80     │ - ······parallax:·0.05,␍
apps-intuitui-web:lint:biome:      81     │ - ····},␍
apps-intuitui-web:lint:biome:      82     │ - ··],␍
apps-intuitui-web:lint:biome:      83     │ - ··about:·[␍
apps-intuitui-web:lint:biome:      84     │ - ····{␍
apps-intuitui-web:lint:biome:      85     │ - ······color:·'bg-brand-leaf/3',␍
apps-intuitui-web:lint:biome:      86     │ - ······shape:·'w-[100%]·h-[40%]·-top-[10%]·left-0·rotate-2',␍
apps-intuitui-web:lint:biome:      87     │ - ······parallax:·0.2,␍
apps-intuitui-web:lint:biome:      88     │ - ····},␍
apps-intuitui-web:lint:biome:      89     │ - ····{␍
apps-intuitui-web:lint:biome:      90     │ - ······color:·'bg-brand-primary/2',␍
apps-intuitui-web:lint:biome:      91     │ - ······shape:·'w-[50%]·h-[100%]·top-0·-left-[10%]·-rotate-6',␍
apps-intuitui-web:lint:biome:      92     │ - ······parallax:·-0.1,␍
apps-intuitui-web:lint:biome:      93     │ - ····},␍
apps-intuitui-web:lint:biome:      94     │ - ····{␍
apps-intuitui-web:lint:biome:      95     │ - ······color:·'bg-brand-leaf/5',␍
apps-intuitui-web:lint:biome:      96     │ - ······shape:·'w-[30%]·h-[30%]·bottom-20·right-20·rotate-45',␍
apps-intuitui-web:lint:biome:      97     │ - ······parallax:·0.3,␍
apps-intuitui-web:lint:biome:      98     │ - ····},␍
apps-intuitui-web:lint:biome:      99     │ - ··],␍
apps-intuitui-web:lint:biome:     100     │ - ··projects:·[␍
apps-intuitui-web:lint:biome:     101     │ - ····{␍
apps-intuitui-web:lint:biome:     102     │ - ······color:·'bg-brand-sky/10',␍
apps-intuitui-web:lint:biome:     103     │ - ······shape:·'w-[120%]·h-[30%]·top-[40%]·-left-[10%]·rotate-12',␍
apps-intuitui-web:lint:biome:     104     │ - ······parallax:·0.15,␍
apps-intuitui-web:lint:biome:     105     │ - ····},␍
apps-intuitui-web:lint:biome:     106     │ - ····{␍
apps-intuitui-web:lint:biome:     107     │ - ······color:·'bg-brand-primary/5',␍
apps-intuitui-web:lint:biome:     108     │ - ······shape:·'w-[40%]·h-[80%]·-top-[10%]·right-[10%]·-rotate-12',␍
apps-intuitui-web:lint:biome:     109     │ - ······parallax:·-0.05,␍
apps-intuitui-web:lint:biome:     110     │ - ····},␍
apps-intuitui-web:lint:biome:     111     │ - ··],␍
apps-intuitui-web:lint:biome:     112     │ - ··studio:·[␍
apps-intuitui-web:lint:biome:     113     │ - ····{␍
apps-intuitui-web:lint:biome:     114     │ - ······color:·'bg-brand-primary/5',␍
apps-intuitui-web:lint:biome:     115     │ - ······shape:·'w-[100%]·h-[1px]·top-1/4·left-0·rotate-1',␍
apps-intuitui-web:lint:biome:     116     │ - ······parallax:·0.4,␍
apps-intuitui-web:lint:biome:     117     │ - ····},␍
apps-intuitui-web:lint:biome:     118     │ - ····{␍
apps-intuitui-web:lint:biome:     119     │ - ······color:·'bg-brand-primary/5',␍
apps-intuitui-web:lint:biome:     120     │ - ······shape:·'w-[100%]·h-[1px]·top-2/3·left-0·-rotate-1',␍
apps-intuitui-web:lint:biome:     121     │ - ······parallax:·0.6,␍
apps-intuitui-web:lint:biome:     122     │ - ····},␍
apps-intuitui-web:lint:biome:     123     │ - ····{␍
apps-intuitui-web:lint:biome:     124     │ - ······color:·'bg-brand-sky/5',␍
apps-intuitui-web:lint:biome:     125     │ - ······shape:·'w-[30%]·h-[60%]·top-0·right-0·-rotate-12',␍
apps-intuitui-web:lint:biome:     126     │ - ······parallax:·0.2,␍
apps-intuitui-web:lint:biome:     127     │ - ····},␍
apps-intuitui-web:lint:biome:     128     │ - ··],␍
apps-intuitui-web:lint:biome:     129     │ - ··default:·[],␍
apps-intuitui-web:lint:biome:     130     │ - };␍
apps-intuitui-web:lint:biome:     131     │ - ␍
apps-intuitui-web:lint:biome:     132     │ - const·_currentBackground·=·themes[theme]·||·themes.default;␍
apps-intuitui-web:lint:biome:           2 │ + import·'../styles/global.css';
apps-intuitui-web:lint:biome:           3 │ + import·StructuredData·from·'../components/StructuredData.astro';
apps-intuitui-web:lint:biome:           4 │ + import·{
apps-intuitui-web:lint:biome:           5 │ + ··defaultOgImage,
apps-intuitui-web:lint:biome:           6 │ + ··ORGANIZATION,
apps-intuitui-web:lint:biome:           7 │ + ··SITE_DESCRIPTION,
apps-intuitui-web:lint:biome:           8 │ + ··SITE_KEYWORDS,
apps-intuitui-web:lint:biome:           9 │ + ··SITE_NAME,
apps-intuitui-web:lint:biome:          10 │ + ··SITE_TITLE,
apps-intuitui-web:lint:biome:          11 │ + ··SITE_URL,
apps-intuitui-web:lint:biome:          12 │ + }·from·'../lib/site';

@repo/profile:lint:biome:      11     │ - import·ScreenWrapper·from·'@repo/ui/components/ScreenWrapper';␍

@repo/profile:lint:biome:      12     │ - import·{␍
@repo/profile:lint:biome:      13     │ - ··AnimatedView,␍
@repo/profile:lint:biome:      14     │ - ··Box,␍
@repo/profile:lint:biome:      15     │ - ··Button,␍
@repo/profile:lint:biome:      16     │ - ··ButtonText,␍
@repo/profile:lint:biome:      17     │ - ··Heading,␍

@repo/profile:lint:biome:      18     │ - ··HStack,␍
@repo/profile:lint:biome:      19     │ - ··Spinner,␍
@repo/profile:lint:biome:      20     │ - ··Text,␍
@repo/profile:lint:biome:      21     │ - ··VStack,␍
@repo/profile:lint:biome:      22     │ - }·from·'@repo/ui/primitives';␍
@repo/profile:lint:biome:      23     │ - import·{·hapticError,·hapticSuccess·}·from·'@repo/ui/utils/haptics';␍
@repo/profile:lint:biome:      24     │ - ␍
@repo/profile:lint:biome:      25     │ - import·{·useEffect,·useState·}·from·'react';␍
@repo/profile:lint:biome:      26     │ - import·{·useTranslation·}·from·'react-i18next';␍
@repo/profile:lint:biome:      27     │ - import·{␍
@repo/profile:lint:biome:      28     │ - ··FadeInDown,␍
@repo/profile:lint:biome:      29     │ - ··useAnimatedStyle,␍
@repo/profile:lint:biome:      30     │ - ··useSharedValue,␍
@repo/profile:lint:biome:      31     │ - ··withDelay,␍
@repo/profile:lint:biome:      32     │ - ··withSequence,␍
@repo/profile:lint:biome:      33     │ - ··withSpring,␍
@repo/profile:lint:biome:      34     │ - ··withTiming,␍
@repo/profile:lint:biome:      35     │ - }·from·'react-native-reanimated';␍
@repo/profile:lint:biome:      36     │ - ␍
@repo/profile:lint:biome:      37     │ - type·ClaimRouteParams·=·{␍
@repo/profile:lint:biome:      38     │ - ··ThuthimalClaim:·{␍
@repo/profile:lint:biome:      39     │ - ····gift_token:·string;␍
@repo/profile:lint:biome:      40     │ - ····gifter_name:·string;␍
@repo/profile:lint:biome:      41     │ - ··};␍
@repo/profile:lint:biome:      42     │ - };␍
@repo/profile:lint:biome:      43     │ - ␍
@repo/profile:lint:biome:      44     │ - type·ClaimState·=·'loading'·|·'success'·|·'already_claimed'·|·'error';␍
@repo/profile:lint:biome:      45     │ - ␍
@repo/profile:lint:biome:      46     │ - export·default·function·ThuthimalClaimScreen()·{␍
@repo/profile:lint:biome:      47     │ - ··const·navigation·=·useNavigation<any>();␍
@repo/profile:lint:biome:      48     │ - ··const·route·=·useRoute<RouteProp<ClaimRouteParams,·'ThuthimalClaim'>>();␍
@repo/profile:lint:biome:      49     │ - ··const·{·t·}·=·useTranslation();␍
@repo/profile:lint:biome:      50     │ - ··const·[claimState,·setClaimState]·=·useState<ClaimState>('loading');␍
@repo/profile:lint:biome:      51     │ - ··const·[gifterName,·setGifterName]·=·useState(route.params?.gifter_name·??·'Someone·special');␍
@repo/profile:lint:biome:      52     │ - ␍
@repo/profile:lint:biome:      53     │ - ··//·Flower·bloom·animation␍
@repo/profile:lint:biome:      54     │ - ··const·flowerScale·=·useSharedValue(0);␍
@repo/profile:lint:biome:      55     │ - ··const·flowerOpacity·=·useSharedValue(0);␍
@repo/profile:lint:biome:      56     │ - ␍
@repo/profile:lint:biome:      57     │ - ··const·flowerStyle·=·useAnimatedStyle(()·=>·({␍
@repo/profile:lint:biome:      58     │ - ····transform:·[{·scale:·flowerScale.value·}],␍
@repo/profile:lint:biome:      59     │ - ····opacity:·flowerOpacity.value,␍
@repo/profile:lint:biome:      60     │ - ··}));␍
@repo/profile:lint:biome:      61     │ - ␍
@repo/profile:lint:biome:      62     │ - ··useEffect(()·=>·{␍
@repo/profile:lint:biome:      63     │ - ····const·claimGift·=·async·()·=>·{␍

@repo/profile:lint:biome:      64     │ - ······const·{·gift_token·}·=·route.params;␍
@repo/profile:lint:biome:      65     │ - ······try·{␍
@repo/profile:lint:biome:      66     │ - ········const·myId·=·await·identityAPI.getMyInternalId();␍
@repo/profile:lint:biome:      67     │ - ········if·(!myId)·{␍
@repo/profile:lint:biome:      68     │ - ··········navigation.navigate('Auth');␍
@repo/profile:lint:biome:      69     │ - ··········return;␍
@repo/profile:lint:biome:      70     │ - ········}␍
@repo/profile:lint:biome:      71     │ - ␍
@repo/profile:lint:biome:      72     │ - ········const·result·=·await·thuthimalAPI.claimGift({␍
@repo/profile:lint:biome:      73     │ - ··········gift_token,␍
@repo/profile:lint:biome:      74     │ - ··········recipient_id:·myId,␍
@repo/profile:lint:biome:      75     │ - ········});␍
@repo/profile:lint:biome:      76     │ - ␍
@repo/profile:lint:biome:      77     │ - ········if·(result.success)·{␍
@repo/profile:lint:biome:      78     │ - ··········setGifterName(result.gifter_name·??·gifterName);␍
@repo/profile:lint:biome:      79     │ - ··········setClaimState('success');␍
@repo/profile:lint:biome:      80     │ - ··········hapticSuccess();␍
@repo/profile:lint:biome:      81     │ - ··········//·Bloom·animation␍
@repo/profile:lint:biome:      82     │ - ··········flowerScale.value·=·withDelay(␍
@repo/profile:lint:biome:      83     │ - ············200,␍
@repo/profile:lint:biome:      84     │ - ············withSequence(␍
@repo/profile:lint:biome:      85     │ - ··············withSpring(1.3,·{·damping:·8,·stiffness:·100·}),␍
@repo/profile:lint:biome:      86     │ - ··············withSpring(1.0,·{·damping:·12,·stiffness:·120·}),␍
@repo/profile:lint:biome:      87     │ - ············),␍
@repo/profile:lint:biome:      88     │ - ··········);␍

@repo/profile:lint:biome:      89     │ - ··········flowerOpacity.value·=·withTiming(1,·{·duration:·400·});␍
@repo/profile:lint:biome:      90     │ - ········}·else·if·(result.error·===·'already_claimed_or_invalid')·{␍
@repo/profile:lint:biome:      91     │ - ··········setClaimState('already_claimed');␍
@repo/profile:lint:biome:      92     │ - ··········hapticError();␍
@repo/profile:lint:biome:      93     │ - ········}·else·{␍
@repo/profile:lint:biome:      94     │ - ··········setClaimState('error');␍
@repo/profile:lint:biome:      95     │ - ··········hapticError();␍
@repo/profile:lint:biome:      96     │ - ········}␍
@repo/profile:lint:biome:      97     │ - ······}·catch·(err)·{␍
@repo/profile:lint:biome:      98     │ - ········console.error('ThuthimalClaimScreen·error:',·err);␍
@repo/profile:lint:biome:      99     │ - ········setClaimState('error');␍
@repo/profile:lint:biome:     100     │ - ········hapticError();␍
apps-intuitui-web:lint:biome:          13 │ + 
@repo/profile:lint:biome:     101     │ - ······}␍
apps-intuitui-web:lint:biome:          14 │ + interface·Props·{
@repo/profile:lint:biome:     102     │ - ····};␍
apps-intuitui-web:lint:biome:          15 │ + ··title?:·string;
@repo/profile:lint:biome:     103     │ - ␍
apps-intuitui-web:lint:biome:          16 │ + ··description?:·string;
@repo/profile:lint:biome:     104     │ - ····void·claimGift();␍
apps-intuitui-web:lint:biome:          17 │ + ··theme?:·'home'·|·'about'·|·'projects'·|·'studio'·|·'default';
@repo/profile:lint:biome:     105     │ - ··},·[route.params,·navigation,·gifterName,·flowerScale,·flowerOpacity]);␍
apps-intuitui-web:lint:biome:          18 │ + ··image?:·string;
@repo/profile:lint:biome:     106     │ - ␍
apps-intuitui-web:lint:biome:          19 │ + ··noindex?:·boolean;
@repo/profile:lint:biome:     107     │ - ··const·handleContinue·=·()·=>·{␍
apps-intuitui-web:lint:biome:   115 more lines truncated
@repo/profile:lint:biome:     108     │ - ····navigation.navigate('Main',·{·screen:·'Profile'·});␍
apps-intuitui-web:lint:biome:   
@repo/profile:lint:biome:     109     │ - ··};␍
apps-intuitui-web:lint:biome: 
@repo/profile:lint:biome:     110     │ - ␍
apps-intuitui-web:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:     111     │ - ··if·(claimState·===·'loading')·{␍
apps-intuitui-web:lint:biome: 
@repo/profile:lint:biome:     112     │ - ····return·(␍
apps-intuitui-web:lint:biome:   × Some errors were emitted while running checks.
@repo/profile:lint:biome:     113     │ - ······<ScreenWrapper>␍
apps-intuitui-web:lint:biome:   
@repo/profile:lint:biome:     114     │ - ········<Box·className="flex-1·items-center·justify-center">␍
apps-intuitui-web:lint:biome: 
@repo/profile:lint:biome:     115     │ - ··········<VStack·className="items-center"·space="lg">␍
@repo/profile:lint:biome:     116     │ - ············<Spinner·size="large"·color="#E67E22"·/>␍
@repo/profile:lint:biome:     117     │ - ············<Text·className="text-phase-text-secondary·text-center">␍
@repo/profile:lint:biome:     118     │ - ··············{t('thuthimalClaim.loading')}␍
@repo/profile:lint:biome:     119     │ - ············</Text>␍
@repo/profile:lint:biome:     120     │ - ··········</VStack>␍
@repo/profile:lint:biome:     121     │ - ········</Box>␍
@repo/profile:lint:biome:     122     │ - ······</ScreenWrapper>␍
@repo/profile:lint:biome:     123     │ - ····);␍
@repo/profile:lint:biome:     124     │ - ··}␍
@repo/profile:lint:biome:     125     │ - ␍
@repo/profile:lint:biome:     126     │ - ··if·(claimState·===·'already_claimed')·{␍
@repo/profile:lint:biome:     127     │ - ····return·(␍
@repo/profile:lint:biome:     128     │ - ······<ScreenWrapper>␍
@repo/profile:lint:biome:     129     │ - ········<Box·className="flex-1·items-center·justify-center·p-8">␍
@repo/profile:lint:biome:     130     │ - ··········<AnimatedView·entering={FadeInDown.duration(500)}>␍
@repo/profile:lint:biome:     131     │ - ············<VStack·className="items-center"·space="lg">␍
@repo/profile:lint:biome:     132     │ - ··············<Text·className="text-[56px]·text-center">🌸</Text>␍
@repo/profile:lint:biome:     133     │ - ··············<Heading·className="text-center·text-2xl·text-phase-text-primary">␍
@repo/profile:lint:biome:     134     │ - ················{t('thuthimalClaim.alreadyBloomedTitle')}␍
@repo/profile:lint:biome:     135     │ - ··············</Heading>␍
@repo/profile:lint:biome:     136     │ - ··············<Text·className="text-phase-text-secondary·text-center·leading-6">␍
@repo/profile:lint:biome:     137     │ - ················{t('thuthimalClaim.alreadyBloomedDesc')}␍
@repo/profile:lint:biome:     138     │ - ··············</Text>␍
@repo/profile:lint:biome:     139     │ - ··············<Button␍
@repo/profile:lint:biome:     140     │ - ················size="sm"␍
@repo/profile:lint:biome:     141     │ - ················variant="outline"␍
@repo/profile:lint:biome:     142     │ - ················onPress={()·=>·navigation.goBack()}␍
@repo/profile:lint:biome:     143     │ - ················className="mt-4·border-phase-surface·rounded-2xl"␍
@repo/profile:lint:biome:     144     │ - ··············>␍
@repo/profile:lint:biome:     145     │ - ················<ButtonText·className="text-phase-text-primary">␍
@repo/profile:lint:biome:     146     │ - ··················{t('thuthimalClaim.goBack')}␍
@repo/profile:lint:biome:     147     │ - ················</ButtonText>␍
@repo/profile:lint:biome:     148     │ - ··············</Button>␍
@repo/profile:lint:biome:     149     │ - ············</VStack>␍
@repo/profile:lint:biome:     150     │ - ··········</AnimatedView>␍
@repo/profile:lint:biome:   331 more lines truncated
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\screens\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     1   │ - import·MuteHubScreen·from·'./MuteHubScreen';␍
@repo/profile:lint:biome:     2   │ - import·PublicProfileScreenWeb·from·'./PublicProfileScreen.web';␍
@repo/profile:lint:biome:     3   │ - import·ThuthimalClaimScreen·from·'./ThuthimalClaimScreen';␍
@repo/profile:lint:biome:     4   │ - ␍
@repo/profile:lint:biome:     5   │ - export·{·MuteHubScreen,·PublicProfileScreenWeb,·ThuthimalClaimScreen·};␍
@repo/profile:lint:biome:       1 │ + import·MuteHubScreen·from·'./MuteHubScreen';
@repo/profile:lint:biome:       2 │ + import·PublicProfileScreenWeb·from·'./PublicProfileScreen.web';
@repo/profile:lint:biome:       3 │ + import·ThuthimalClaimScreen·from·'./ThuthimalClaimScreen';
@repo/profile:lint:biome:       4 │ + 
@repo/profile:lint:biome:       5 │ + export·{·MuteHubScreen,·PublicProfileScreenWeb,·ThuthimalClaimScreen·};
@repo/profile:lint:biome:     6 6 │   
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\types\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:   
@repo/profile:lint:biome:      1    │ - import·type·{·ProfileStats,·User·}·from·'@repo/core/types';␍
@repo/profile:lint:biome:      2    │ - ␍
@repo/profile:lint:biome:      3    │ - export·type·{·ProfileStats·};␍
@repo/profile:lint:biome:      4    │ - export·type·UserProfile·=·User;␍
@repo/profile:lint:biome:      5    │ - ␍
@repo/profile:lint:biome:      6    │ - /**␍
@repo/profile:lint:biome:      7    │ - ·*·OrientationSeeds·is·now·part·of·the·core·User·type.␍
@repo/profile:lint:biome:      8    │ - ·*·We·re-export·it·here·for·compatibility·during·migration.␍
@repo/profile:lint:biome:      9    │ - ·*/␍
@repo/profile:lint:biome:     10    │ - export·type·OrientationSeeds·=·Required<User>['orientation_seeds'];␍
@repo/profile:lint:biome:         1 │ + import·type·{·ProfileStats,·User·}·from·'@repo/core/types';
@repo/profile:lint:biome:         2 │ + 
@repo/profile:lint:biome:         3 │ + export·type·{·ProfileStats·};
@repo/profile:lint:biome:         4 │ + export·type·UserProfile·=·User;
@repo/profile:lint:biome:         5 │ + 
@repo/profile:lint:biome:         6 │ + /**
@repo/profile:lint:biome:         7 │ + ·*·OrientationSeeds·is·now·part·of·the·core·User·type.
@repo/profile:lint:biome:         8 │ + ·*·We·re-export·it·here·for·compatibility·during·migration.
@repo/profile:lint:biome:         9 │ + ·*/
@repo/profile:lint:biome:        10 │ + export·type·OrientationSeeds·=·Required<User>['orientation_seeds'];
@repo/profile:lint:biome:     11 11 │   
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Some errors were emitted while running checks.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 

@repo/analytics:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/payments:lint:biome: src\plugins\payhere.ts:10:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/community:lint:biome: src\api\community.ts:36:44 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/community:lint:biome: 

@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   

@repo/community:lint:biome:     34 │       .order('created_at', { ascending: false });

@repo/community:lint:biome:     35 │     if (error) throw error;

@repo/community:lint:biome:   > 36 │     return (data || []).map((announcement: any) => ({

@repo/community:lint:biome:        │                                            ^^^

@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   

@repo/payments:lint:biome:      8 │     amount: number,

@repo/payments:lint:biome:      9 │     currency: string,

@repo/payments:lint:biome:   > 10 │     metadata?: any,

@repo/payments:lint:biome:        │                ^^^

@repo/payments:lint:biome:     11 │   ): Promise<PaymentIntent> {

@repo/payments:lint:biome:     12 │     // In a real implementation, this would call PayHere API to get a checkout URL or token.
@repo/payments:lint:biome:   

@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/payments:lint:biome:   
@repo/payments:lint:biome: 

@repo/payments:lint:biome: src\plugins\stripe.ts:10:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/workforce:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.

@repo/payments:lint:biome:   

@repo/payments:lint:biome:      8 │     amount: number,

@repo/payments:lint:biome:      9 │     currency: string,

@repo/payments:lint:biome:   > 10 │     metadata?: any,

@repo/payments:lint:biome:        │                ^^^

@repo/payments:lint:biome:     11 │   ): Promise<PaymentIntent> {

@repo/community:lint:biome:     37 │       ...announcement,

@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:20:49 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:     19 │     // Enriched Hierarchy

@intuitui-labs/lk-edu-geo:lint:biome:   > 20 │     const enrichedDistricts = districts.map((d: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                                                 ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     21 │       // Get cities by district from postal backend
@intuitui-labs/lk-edu-geo:lint:biome:     22 │       const postalCities = SLPostal.citiesByDistrict(d.name_en) || [];
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:26:21 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     24 │       // Match cities from SLGeo with PostalCodes
@intuitui-labs/lk-edu-geo:lint:biome:     25 │       const matchedCities = cities
@intuitui-labs/lk-edu-geo:lint:biome:   > 26 │         .filter((c: any) => c.district_id === d.id)
@intuitui-labs/lk-edu-geo:lint:biome:        │                     ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     27 │         .map((c: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:     28 │           const postalMatch = postalCities.find(
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 

apps-intuitui-web:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/payments:lint:biome: Checked 10 files in 226ms. No fixes applied.
@repo/payments:lint:biome: Found 1 error.
@repo/payments:lint:biome: Found 5 warnings.

@repo/payments:lint:biome:     12 │     // In a real implementation, this would call Stripe API (via Edge Function)
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   

@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts:10:29 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      8 │   provider: string;
@repo/payments:lint:biome:      9 │   clientSecret?: string;
@repo/payments:lint:biome:   > 10 │   metadata?: Record<string, any>;
@repo/payments:lint:biome:        │                             ^^^
@repo/payments:lint:biome:     11 │ }
@repo/payments:lint:biome:     12 │ 
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts:20:29 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     18 │   expiry?: string;
@repo/payments:lint:biome:     19 │   isDefault: boolean;
@repo/payments:lint:biome:   > 20 │   metadata?: Record<string, any>;
@repo/payments:lint:biome:        │                             ^^^
@repo/payments:lint:biome:     21 │ }
@repo/payments:lint:biome:     22 │ 
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts:26:66 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     24 │   id: string;
@repo/payments:lint:biome:     25 │   name: string;
@repo/payments:lint:biome:   > 26 │   initializePayment(amount: number, currency: string, metadata?: any): Promise<PaymentIntent>;
@repo/payments:lint:biome:        │                                                                  ^^^
@repo/payments:lint:biome:     27 │   verifyPayment(paymentIntentId: string): Promise<PaymentStatus>;
@repo/payments:lint:biome:     28 │   getFeeEstimate(amount: number): number;
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
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
@repo/payments:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Some errors were emitted while running checks.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@intuitui-labs/lk-edu-geo:lint:biome: Diagnostics not shown: 2.
@intuitui-labs/lk-edu-geo:lint:biome: Checked 19 files in 1265ms. No fixes applied.
@intuitui-labs/lk-edu-geo:lint:biome: Found 5 errors.
@repo/community:lint:biome:     38 │       author_name: announcement.author?.full_name,
@repo/community:lint:biome:   

@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:87:37 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     85 │       .order('created_at', { ascending: false });
@repo/community:lint:biome:     86 │     if (error) throw error;
@repo/community:lint:biome:   > 87 │     return (data || []).map((group: any) => ({
@repo/community:lint:biome:        │                                     ^^^
@repo/community:lint:biome:     88 │       ...group,
@repo/community:lint:biome:     89 │       type: group.group_type || group.type || 'general',
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:123:26 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     121 │     return data as Post[];
@repo/community:lint:biome:     122 │   },
@repo/community:lint:biome:   > 123 │   async createPost(post: any, userId: string, userCapacity: string, schoolId: string) {
@repo/community:lint:biome:         │                          ^^^
@repo/community:lint:biome:     124 │     const { data, error } = await supabase
@repo/community:lint:biome:     125 │       .from('community_posts')
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:141:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     139 │     return data as Post;
@repo/community:lint:biome:     140 │   },
@repo/community:lint:biome:   > 141 │   async createGroup(group: any, userId: string, _userCapacity: string) {
@repo/community:lint:biome:         │                            ^^^
@repo/community:lint:biome:     142 │     const { data, error } = await supabase
@repo/community:lint:biome:     143 │       .from('community_groups')
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:156:37 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     154 │     return data as CommunityGroup;
@repo/community:lint:biome:     155 │   },
@repo/community:lint:biome:   > 156 │   async createGroupWithOwner(group: any, userId: string): Promise<CommunityGroup> {
@repo/community:lint:biome:         │                                     ^^^
@repo/community:lint:biome:     157 │     const { data: created, error: groupErr } = await supabase
@repo/community:lint:biome:     158 │       .from('community_groups')
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:217:19 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/community:lint:biome: 
@repo/community:lint:biome: Diagnostics not shown: 70.

@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome: Checked 52 files in 754ms. No fixes applied.
@repo/community:lint:biome:   
@repo/community:lint:biome: Found 19 errors.
@repo/community:lint:biome: Found 65 warnings.
@repo/community:lint:biome: Found 6 infos.
@repo/community:lint:biome:     215 │     if (error) throw error;
@repo/community:lint:biome:     216 │     return {
@repo/community:lint:biome:   > 217 │       ...(data as any),
@repo/community:lint:biome:         │                   ^^^
@repo/community:lint:biome:     218 │       type: (data as any).group_type || (data as any).type || 'general',
@repo/community:lint:biome:     219 │     } as CommunityGroup;
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:218:22 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     216 │     return {
@repo/community:lint:biome:     217 │       ...(data as any),
@repo/community:lint:biome:   > 218 │       type: (data as any).group_type || (data as any).type || 'general',
@repo/community:lint:biome:         │                      ^^^

@repo/community:lint:biome:     219 │     } as CommunityGroup;

@intuitui-labs/lk-edu-geo:lint:biome: Found 15 warnings.

@intuitui-labs/lk-edu-geo:lint:biome: Found 2 infos.
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:27:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     25 │       const matchedCities = cities
@intuitui-labs/lk-edu-geo:lint:biome:     26 │         .filter((c: any) => c.district_id === d.id)
@intuitui-labs/lk-edu-geo:lint:biome:   > 27 │         .map((c: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                  ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     28 │           const postalMatch = postalCities.find(
@intuitui-labs/lk-edu-geo:lint:biome:     29 │             (pc: any) => pc.city.toLowerCase() === c.name_en.toLowerCase(),
@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:29:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:     27 │         .map((c: any) => {

@intuitui-labs/lk-edu-geo:lint:biome:     28 │           const postalMatch = postalCities.find(

@intuitui-labs/lk-edu-geo:lint:biome:   > 29 │             (pc: any) => pc.city.toLowerCase() === c.name_en.toLowerCase(),

@intuitui-labs/lk-edu-geo:lint:biome:        │                  ^^^

@intuitui-labs/lk-edu-geo:lint:biome:     30 │           );

@intuitui-labs/lk-edu-geo:lint:biome:     31 │           return {

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-gn.ts:25:15 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:     23 │   const workbook = XLSX.readFile(FILE_PATH);

@intuitui-labs/lk-edu-geo:lint:biome:     24 │   const sheet = workbook.Sheets.lka_admin4;

@intuitui-labs/lk-edu-geo:lint:biome:   > 25 │   const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

@intuitui-labs/lk-edu-geo:lint:biome:        │               ^^^

@intuitui-labs/lk-edu-geo:lint:biome:     26 │ 

@intuitui-labs/lk-edu-geo:lint:biome:     27 │   const headers = data[0];

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:23:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:     21 │   geoSql += `-- Provinces\nINSERT INTO geo_provinces (id, name, name_si, name_ta) VALUES\n`;

@intuitui-labs/lk-edu-geo:lint:biome:     22 │   geoSql += `${provinces

@intuitui-labs/lk-edu-geo:lint:biome:   > 23 │     .map((p: any) => `('${p.id}', '${escape(p.name)}', '${p.name_si || ''}', '${p.name_ta || ''}')`)

@intuitui-labs/lk-edu-geo:lint:biome:        │              ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     24 │     .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     25 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:30:11 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     28 │   geoSql += `${districts
@intuitui-labs/lk-edu-geo:lint:biome:     29 │     .map(
@intuitui-labs/lk-edu-geo:lint:biome:   > 30 │       (d: any) =>
@intuitui-labs/lk-edu-geo:lint:biome:        │           ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     31 │         `('${d.id}', '${d.province_id}', '${escape(d.name)}', '${d.name_si || ''}', '${d.name_ta || ''}')`,
@intuitui-labs/lk-edu-geo:lint:biome:     32 │     )
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:39:12 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     37 │   geoSql += `${dsDivisions
@intuitui-labs/lk-edu-geo:lint:biome:     38 │     .map(
@intuitui-labs/lk-edu-geo:lint:biome:   > 39 │       (ds: any) =>
@intuitui-labs/lk-edu-geo:lint:biome:        │            ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     40 │         `('${ds.id}', '${ds.district_id}', '${escape(ds.name)}', '${ds.name_si || ''}', '${ds.name_ta || ''}')`,
@intuitui-labs/lk-edu-geo:lint:biome:     41 │     )
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:54:17 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     52 │     gnSql += `INSERT INTO geo_gn_divisions (id, ds_division_id, district_id, name, name_si, name_ta, gn_code, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     53 │     gnSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:   > 54 │       .map((gn: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                 ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     55 │         const lat = gn.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     56 │         const lng = gn.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:73:15 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     71 │   let postalSql = `-- Postal Towns\nINSERT INTO geo_postal_towns (id, district_id, city, postal_code, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     72 │   postalSql += `${postalUnits
@intuitui-labs/lk-edu-geo:lint:biome:   > 73 │     .map((pt: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │               ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     74 │       const lat = pt.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     75 │       const lng = pt.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:89:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     87 │     schSql += `INSERT INTO edu_schools (id, census_no, name, gender, category, type_code, status, religion, website, socio_economic_tier, province_id, district_id, gn_division_id, zone_id, division_id, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     88 │     schSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:   > 89 │       .map((s: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     90 │         const lat = s.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     91 │         const lng = s.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:112:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     110 │     statsSql += `INSERT INTO edu_school_registry_stats (school_id, academic_year, total_students, students_boys, students_girls, total_teachers, medium, grade_span, difficulty_level) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     111 │     statsSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:   > 112 │       .map((s: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:         │                ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     113 │         return `('${s.id}', 2024, ${s.total_students || 0}, ${s.students_boys || 0}, ${s.students_girls || 0}, ${s.total_teachers || 0}, '${escape(s.medium || '')}', '${escape(s.grade_span || '')}', '${escape(s.difficulty_level || '')}')`;
@intuitui-labs/lk-edu-geo:lint:biome:     114 │       })
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:125:46 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     124 │     // 6. CONTACTS
@intuitui-labs/lk-edu-geo:lint:biome:   > 125 │     const contactsBatches = batch.filter((s: any) => s.contact?.tel || s.contact?.email);
@intuitui-labs/lk-edu-geo:lint:biome:         │                                              ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     126 │     if (contactsBatches.length > 0) {
@intuitui-labs/lk-edu-geo:lint:biome:     127 │       let conSql = `-- Schools Contacts Batch ${Math.floor(i / SCH_BATCH_SIZE) + 1}\n`;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:130:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     128 │       conSql += `INSERT INTO edu_school_contacts (school_id, contact_type, phone, email, is_primary) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     129 │       conSql += `${contactsBatches
@intuitui-labs/lk-edu-geo:lint:biome:   > 130 │         .map((s: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:         │                  ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     131 │           return `('${s.id}', 'OFFICIAL', ${s.contact.tel ? `'${s.contact.tel}'` : 'NULL'}, ${s.contact.email ? `'${s.contact.email}'` : 'NULL'}, true)`;
@intuitui-labs/lk-edu-geo:lint:biome:     132 │         })
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: src\types.ts:141:31 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     139 │   total_teachers?: number;
@intuitui-labs/lk-edu-geo:lint:biome:     140 │   difficulty_level?: string;
@intuitui-labs/lk-edu-geo:lint:biome:   > 141 │   properties?: Record<string, any>;
@intuitui-labs/lk-edu-geo:lint:biome:         │                               ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     142 │ }

@intuitui-labs/lk-edu-geo:lint:biome:     143 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Formatter would have printed the following content:
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:      1    │ - {␍
@intuitui-labs/lk-edu-geo:lint:biome:      2    │ - ··"name":·"@intuitui-labs/lk-edu-geo",␍
@intuitui-labs/lk-edu-geo:lint:biome:      3    │ - ··"version":·"1.0.1",␍
@intuitui-labs/lk-edu-geo:lint:biome:      4    │ - ··"description":·"Sri·Lanka·educational·and·administrative·geo·data",␍
@intuitui-labs/lk-edu-geo:lint:biome:      5    │ - ··"type":·"module",␍
@intuitui-labs/lk-edu-geo:lint:biome:      6    │ - ··"exports":·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      7    │ - ····".":·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      8    │ - ······"types":·"./dist/index.d.ts",␍
@intuitui-labs/lk-edu-geo:lint:biome:      9    │ - ······"import":·"./dist/index.js",␍
@intuitui-labs/lk-edu-geo:lint:biome:     10    │ - ······"require":·"./dist/index.cjs"␍
@intuitui-labs/lk-edu-geo:lint:biome:     11    │ - ····},␍
@intuitui-labs/lk-edu-geo:lint:biome:     12    │ - ····"./package.json":·"./package.json"␍

@intuitui-labs/lk-edu-geo:lint:biome:     13    │ - ··},␍
@intuitui-labs/lk-edu-geo:lint:biome:     14    │ - ··"main":·"./dist/index.cjs",␍
@intuitui-labs/lk-edu-geo:lint:biome:     15    │ - ··"module":·"./dist/index.js",␍
@intuitui-labs/lk-edu-geo:lint:biome:     16    │ - ··"types":·"./dist/index.d.ts",␍
@intuitui-labs/lk-edu-geo:lint:biome:     17    │ - ··"files":·[␍
@intuitui-labs/lk-edu-geo:lint:biome:     18    │ - ····"dist",␍
@intuitui-labs/lk-edu-geo:lint:biome:     19    │ - ····"data"␍
@intuitui-labs/lk-edu-geo:lint:biome:     20    │ - ··],␍
@intuitui-labs/lk-edu-geo:lint:biome:     21    │ - ··"keywords":·[␍
@intuitui-labs/lk-edu-geo:lint:biome:     22    │ - ····"sri-lanka",␍
@intuitui-labs/lk-edu-geo:lint:biome:     23    │ - ····"lk",␍
@intuitui-labs/lk-edu-geo:lint:biome:     24    │ - ····"education",␍
@intuitui-labs/lk-edu-geo:lint:biome:     25    │ - ····"geo",␍
@intuitui-labs/lk-edu-geo:lint:biome:     26    │ - ····"schools",␍

@intuitui-labs/lk-edu-geo:lint:biome:     27    │ - ····"districts",␍
@intuitui-labs/lk-edu-geo:lint:biome:     28    │ - ····"provinces",␍
@intuitui-labs/lk-edu-geo:lint:biome:     29    │ - ····"gn-divisions",␍
@intuitui-labs/lk-edu-geo:lint:biome:     30    │ - ····"educational-zones"␍
@intuitui-labs/lk-edu-geo:lint:biome:     31    │ - ··],␍
@intuitui-labs/lk-edu-geo:lint:biome:     32    │ - ··"packageManager":·"pnpm@10.33.0",␍
@intuitui-labs/lk-edu-geo:lint:biome:     33    │ - ··"scripts":·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     34    │ - ····"build":·"pnpm·exec·tsup·src/index.ts·--format·esm,cjs·--dts·--clean",␍
@intuitui-labs/lk-edu-geo:lint:biome:     35    │ - ····"test":·"vitest·run",␍
@intuitui-labs/lk-edu-geo:lint:biome:     36    │ - ····"validate":·"pnpm·exec·tsx·scripts/validate.ts",␍
@intuitui-labs/lk-edu-geo:lint:biome:     37    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@intuitui-labs/lk-edu-geo:lint:biome:     38    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@intuitui-labs/lk-edu-geo:lint:biome:     39    │ - ····"import:xlsx":·"pnpm·exec·tsx·scripts/import-xlsx.ts",␍

@intuitui-labs/lk-edu-geo:lint:biome:     40    │ - ····"import:pdf":·"pnpm·exec·tsx·scripts/import-pdf.ts",␍
@intuitui-labs/lk-edu-geo:lint:biome:     41    │ - ····"lint:biome":·"biome·check·.",␍
@intuitui-labs/lk-edu-geo:lint:biome:     42    │ - ····"lint:eslint":·"eslint·.",␍
@intuitui-labs/lk-edu-geo:lint:biome:     43    │ - ····"format":·"biome·format·--write·.",␍
@intuitui-labs/lk-edu-geo:lint:biome:     44    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@intuitui-labs/lk-edu-geo:lint:biome:     45    │ - ····"test:watch":·"vitest",␍
@intuitui-labs/lk-edu-geo:lint:biome:     46    │ - ····"test:ui":·"vitest·--ui",␍
@intuitui-labs/lk-edu-geo:lint:biome:     47    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍

@intuitui-labs/lk-edu-geo:lint:biome:     48    │ - ··},␍
@intuitui-labs/lk-edu-geo:lint:biome:     49    │ - ··"devDependencies":·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     50    │ - ····"@nishansanjuka/srilanka_geographics":·"^0.0.1",␍
@intuitui-labs/lk-edu-geo:lint:biome:     51    │ - ····"@repo/core":·"workspace:*",␍
@intuitui-labs/lk-edu-geo:lint:biome:     52    │ - ····"@types/node":·"^25.5.0",␍
@intuitui-labs/lk-edu-geo:lint:biome:     53    │ - ····"@types/glob":·"^9.0.0",␍
@intuitui-labs/lk-edu-geo:lint:biome:     54    │ - ····"glob":·"^11.0.1",␍
@intuitui-labs/lk-edu-geo:lint:biome:     55    │ - ····"tsup":·"^8.3.5",␍
@intuitui-labs/lk-edu-geo:lint:biome:     56    │ - ····"tsx":·"^4.19.2",␍
@intuitui-labs/lk-edu-geo:lint:biome:     57    │ - ····"typescript":·"^5.9.3",␍
@intuitui-labs/lk-edu-geo:lint:biome:     58    │ - ····"vitest":·"^2.1.9",␍
@intuitui-labs/lk-edu-geo:lint:biome:     59    │ - ····"xlsx":·"^0.18.5",␍
@intuitui-labs/lk-edu-geo:lint:biome:     60    │ - ····"@repo/eslint-config":·"workspace:^",␍
@intuitui-labs/lk-edu-geo:lint:biome:     61    │ - ····"@repo/typescript-config":·"workspace:*",␍
@intuitui-labs/lk-edu-geo:lint:biome:     62    │ - ····"vite-tsconfig-paths":·"^6.1.1",␍
@intuitui-labs/lk-edu-geo:lint:biome:     63    │ - ····"eslint":·"^9.38.0"␍
@intuitui-labs/lk-edu-geo:lint:biome:     64    │ - ··}␍
@intuitui-labs/lk-edu-geo:lint:biome:     65    │ - }␍
gurudevi-mobile:lint:biome: App.tsx:198:41 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome:         1 │ + {
@repo/types-shim:lint:biome: index.d.ts:1:1 suppressions/incorrect ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Range suppressions must have a matching biome-ignore-end
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   > 1 │ // biome-ignore-start lint/suspicious/noExplicitAny: shims intentionally use explicit any
@repo/types-shim:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/types-shim:lint:biome:     2 │ // This is an empty type definition file to satisfy legacy peer dependencies.
@repo/types-shim:lint:biome:     3 │ // React Native 0.83+ provides its own types.
@repo/types-shim:lint:biome: Checked 5 files in 716ms. No fixes applied.
@repo/types-shim:lint:biome: Found 1 error.
@repo/types-shim:lint:biome: Found 1 warning.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: index.d.ts:96:21 suppressions/parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   × Unexpected token, expected one of ':', '(' or whitespace
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     94 │ export {};
@repo/types-shim:lint:biome:     95 │ 
@repo/types-shim:lint:biome:   > 96 │ // biome-ignore-end lint/suspicious/noExplicitAny
@repo/types-shim:lint:biome:        │                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/types-shim:lint:biome:     97 │ 
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i A colon is required after the category.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i Example of suppression: // biome-ignore lint: reason
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/community:lint:biome:     220 │   },
gurudevi-mobile:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:         2 │ + ··"name":·"@intuitui-labs/lk-edu-geo",
@intuitui-labs/lk-edu-geo:lint:biome:         3 │ + ··"version":·"1.0.1",
@intuitui-labs/lk-edu-geo:lint:biome:         4 │ + ··"description":·"Sri·Lanka·educational·and·administrative·geo·data",
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:         5 │ + ··"type":·"module",
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:         6 │ + ··"exports":·{
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:         7 │ + ····".":·{
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:         8 │ + ······"types":·"./dist/index.d.ts",
@repo/community:lint:biome: src\api\community.ts:218:50 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome:         9 │ + ······"import":·"./dist/index.js",
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        10 │ + ······"require":·"./dist/index.cjs"
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:        11 │ + ····},
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        12 │ + ····"./package.json":·"./package.json"
@repo/community:lint:biome:     216 │     return {
@intuitui-labs/lk-edu-geo:lint:biome:        13 │ + ··},
@repo/community:lint:biome:     217 │       ...(data as any),
@intuitui-labs/lk-edu-geo:lint:biome:        14 │ + ··"main":·"./dist/index.cjs",
@repo/community:lint:biome:   > 218 │       type: (data as any).group_type || (data as any).type || 'general',
@intuitui-labs/lk-edu-geo:lint:biome:        15 │ + ··"module":·"./dist/index.js",
@repo/community:lint:biome:         │                                                  ^^^
@intuitui-labs/lk-edu-geo:lint:biome:        16 │ + ··"types":·"./dist/index.d.ts",
@repo/community:lint:biome:     219 │     } as CommunityGroup;
@intuitui-labs/lk-edu-geo:lint:biome:        17 │ + ··"files":·[
@repo/community:lint:biome:     220 │   },
@intuitui-labs/lk-edu-geo:lint:biome:        18 │ + ····"dist",
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        19 │ + ····"data"
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:        20 │ + ··],
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        21 │ + ··"keywords":·[
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        22 │ + ····"sri-lanka",
@repo/community:lint:biome: src\api\community.ts:310:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome:        23 │ + ····"lk",
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        24 │ + ····"education",
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:        25 │ + ····"geo",
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        26 │ + ····"schools",
@repo/community:lint:biome:     308 │       .order('updated_at', { ascending: false });
@intuitui-labs/lk-edu-geo:lint:biome:        27 │ + ····"districts",
@intuitui-labs/lk-edu-geo:lint:biome:        28 │ + ····"provinces",
@repo/community:lint:biome:     309 │     if (error) throw error;
@intuitui-labs/lk-edu-geo:lint:biome:        29 │ + ····"gn-divisions",
@repo/community:lint:biome:   > 310 │     return (data || []).map((conv: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        30 │ + ····"educational-zones"
@repo/community:lint:biome:         │                                    ^^^
@intuitui-labs/lk-edu-geo:lint:biome:        31 │ + ··],
@repo/community:lint:biome:     311 │       const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
@intuitui-labs/lk-edu-geo:lint:biome:        32 │ + ··"packageManager":·"pnpm@10.33.0",
@repo/community:lint:biome:     312 │       return {
@intuitui-labs/lk-edu-geo:lint:biome:        33 │ + ··"scripts":·{
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        34 │ + ····"build":·"pnpm·exec·tsup·src/index.ts·--format·esm,cjs·--dts·--clean",
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:        35 │ + ····"test":·"vitest·run",
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        36 │ + ····"validate":·"pnpm·exec·tsx·scripts/validate.ts",
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        37 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/community:lint:biome: src\api\community.ts:380:62 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome:        38 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        39 │ + ····"import:xlsx":·"pnpm·exec·tsx·scripts/import-xlsx.ts",
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:        40 │ + ····"import:pdf":·"pnpm·exec·tsx·scripts/import-pdf.ts",
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        41 │ + ····"lint:biome":·"biome·check·.",
@repo/community:lint:biome:     378 │       .eq('user_id', myId);
@intuitui-labs/lk-edu-geo:lint:biome:        42 │ + ····"lint:eslint":·"eslint·.",
@repo/community:lint:biome:     379 │     if (fetchErr) throw new Error(fetchErr.message);
@intuitui-labs/lk-edu-geo:lint:biome:        43 │ + ····"format":·"biome·format·--write·.",
@repo/community:lint:biome:   > 380 │     const existingIds: string[] = (existing ?? []).map((row: any) => row.option_id);
@intuitui-labs/lk-edu-geo:lint:biome:        44 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/community:lint:biome:         │                                                              ^^^
@intuitui-labs/lk-edu-geo:lint:biome:        45 │ + ····"test:watch":·"vitest",
@repo/community:lint:biome:     381 │     const alreadyVotedThis = existingIds.includes(optionId);
@intuitui-labs/lk-edu-geo:lint:biome:        46 │ + ····"test:ui":·"vitest·--ui",
@repo/community:lint:biome:     382 │     if (allowMultiple) {
@intuitui-labs/lk-edu-geo:lint:biome:        47 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        48 │ + ··},
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:        49 │ + ··"devDependencies":·{
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        50 │ + ····"@nishansanjuka/srilanka_geographics":·"^0.0.1",
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        51 │ + ····"@repo/core":·"workspace:*",
@repo/community:lint:biome: src\api\community.ts:450:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome:        52 │ + ····"@types/node":·"^25.5.0",
@repo/community:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        53 │ + ····"@types/glob":·"^9.0.0",
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:        54 │ + ····"glob":·"^11.0.1",
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        55 │ + ····"tsup":·"^8.3.5",
@repo/community:lint:biome:     448 │       .order('capacity', { ascending: true });
@intuitui-labs/lk-edu-geo:lint:biome:        56 │ + ····"tsx":·"^4.19.2",
@repo/community:lint:biome:     449 │     if (error) throw error;
@intuitui-labs/lk-edu-geo:lint:biome:        57 │ + ····"typescript":·"^5.9.3",
@repo/community:lint:biome:   > 450 │     return (data || []).map((member: any) => ({
@repo/community:lint:biome:         │                                      ^^^
@repo/community:lint:biome:     451 │       ...member,
@repo/community:lint:biome:     452 │       capacity: member.capacity || 'member',
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:539:37 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     537 │     return data;
@repo/community:lint:biome:     538 │   },
@repo/community:lint:biome:   > 539 │   async createSanctuaryGroup(input: any) {
@repo/community:lint:biome:         │                                     ^^^
@repo/community:lint:biome:     540 │     const { data, error } = await supabase
@repo/community:lint:biome:     541 │       .from('community_groups')
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:615:24 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     613 │         .in(
@intuitui-labs/lk-edu-geo:lint:biome:        58 │ + ····"vitest":·"^2.1.9",
@repo/community:lint:biome:     614 │           'comment_id',
@intuitui-labs/lk-edu-geo:lint:biome:        59 │ + ····"xlsx":·"^0.18.5",
@repo/community:lint:biome:   > 615 │           data.map((c: any) => c.id),
@intuitui-labs/lk-edu-geo:lint:biome:        60 │ + ····"@repo/eslint-config":·"workspace:^",
@repo/community:lint:biome:         │                        ^^^
@intuitui-labs/lk-edu-geo:lint:biome:        61 │ + ····"@repo/typescript-config":·"workspace:*",
@repo/community:lint:biome:     616 │         );
@intuitui-labs/lk-edu-geo:lint:biome:        62 │ + ····"vite-tsconfig-paths":·"^6.1.1",
@intuitui-labs/lk-edu-geo:lint:biome:        63 │ + ····"eslint":·"^9.38.0"
@repo/community:lint:biome:     617 │       (uv ?? []).forEach((row: any) => upvotedIds.add(row.comment_id));
@intuitui-labs/lk-edu-geo:lint:biome:        64 │ + ··}
@repo/community:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:        65 │ + }
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:     66 66 │   
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:147:10 lint/suspicious/noShadowRestrictedNames ━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Do not shadow the global "escape" property.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     145 │ }
@intuitui-labs/lk-edu-geo:lint:biome:     146 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   > 147 │ function escape(str: string): string {
@intuitui-labs/lk-edu-geo:lint:biome:         │          ^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     148 │   if (!str) return '';
@intuitui-labs/lk-edu-geo:lint:biome:     149 │   return str.replace(/'/g, "''");
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i Consider renaming this variable. It's easy to confuse the origin of variables when they're named after a known global.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\import-xlsx.ts:84:9 lint/suspicious/noImplicitAnyLet ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × This variable implicitly has the any type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     82 │     const regex =
@intuitui-labs/lk-edu-geo:lint:biome:     83 │       /\('(\d+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+|\w+)\)/g;
@intuitui-labs/lk-edu-geo:lint:biome:   > 84 │     let match;
@intuitui-labs/lk-edu-geo:lint:biome:        │         ^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     85 │ 
@intuitui-labs/lk-edu-geo:lint:biome:     86 │     while ((match = regex.exec(content)) !== null) {
@intuitui-labs/lk-edu-geo:lint:biome:   
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:617:32 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     615 │           data.map((c: any) => c.id),
@repo/community:lint:biome:     616 │         );
@repo/community:lint:biome:   > 617 │       (uv ?? []).forEach((row: any) => upvotedIds.add(row.comment_id));
@repo/community:lint:biome:         │                                ^^^
@repo/community:lint:biome:     618 │     }
@repo/community:lint:biome:     619 │     return (data ?? []).map(
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:620:11 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     618 │     }
@intuitui-labs/lk-edu-geo:lint:biome:   i Variable declarations without type annotation and initialization implicitly have the any type. Declare a type or initialize the variable with some value.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\import-xlsx.ts:86:13 lint/suspicious/noAssignInExpressions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × The assignment should not be in an expression.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     84 │     let match;
@intuitui-labs/lk-edu-geo:lint:biome:     85 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   > 86 │     while ((match = regex.exec(content)) !== null) {
@intuitui-labs/lk-edu-geo:lint:biome:        │             ^^^^^^^^^^^^^^^^^^^^^^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     87 │       const [
@intuitui-labs/lk-edu-geo:lint:biome:     88 │         _full,
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i The use of assignments in expressions is confusing.
@intuitui-labs/lk-edu-geo:lint:biome:     Expressions are often considered as side-effect free.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\verify-phase8.ts:49:9 lint/suspicious/useIterableCallbackReturn ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × This callback passed to forEach() iterable method should not return a value.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     47 │   `   searchSchools('Hindu', { districtId: 'Colombo' }): Found ${results.length} results.`,
@intuitui-labs/lk-edu-geo:lint:biome:     48 │ );
@intuitui-labs/lk-edu-geo:lint:biome:   > 49 │ results.forEach((r) => console.log(`   - ${r.name} (Census: ${r.census_no})`));
@intuitui-labs/lk-edu-geo:lint:biome:        │         ^^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     50 │ 
@intuitui-labs/lk-edu-geo:lint:biome:     51 │ // 3. Breadcrumbs / Context
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i Either remove this return or remove the returned value.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     47 │   `   searchSchools('Hindu', { districtId: 'Colombo' }): Found ${results.length} results.`,
@intuitui-labs/lk-edu-geo:lint:biome:     48 │ );
@intuitui-labs/lk-edu-geo:lint:biome:   > 49 │ results.forEach((r) => console.log(`   - ${r.name} (Census: ${r.census_no})`));
@intuitui-labs/lk-edu-geo:lint:biome:        │                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     50 │ 
@intuitui-labs/lk-edu-geo:lint:biome:     51 │ // 3. Breadcrumbs / Context
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Some errors were emitted while running checks.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 

@repo/community:lint:biome:     619 │     return (data ?? []).map(
@repo/community:lint:biome:   > 620 │       (c: any) =>
@repo/community:lint:biome:         │           ^^^
@repo/community:lint:biome:     621 │         ({
@repo/community:lint:biome:     622 │           id: c.id,
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\types\Community.ts:29:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.

@repo/community:lint:biome:   
@repo/community:lint:biome:     27 │   status: ManifestoStatus;
@repo/community:lint:biome:     28 │   target_date?: Date;
@repo/community:lint:biome:   > 29 │   metadata: Record<string, any>;
@repo/community:lint:biome:        │                            ^^^
@repo/community:lint:biome:     30 │   created_at: Date;
@repo/community:lint:biome:     31 │   updated_at: Date;
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\types\global.d.ts:11:20 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:      9 │   export interface Color {
@repo/community:lint:biome:     10 │     mode: string;
@repo/community:lint:biome:   > 11 │     [key: string]: any;
@repo/community:lint:biome:        │                    ^^^
@repo/community:lint:biome:     12 │   }
@repo/community:lint:biome:     13 │ 
@repo/community:lint:biome:   

@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   

@repo/community:lint:biome: 
@repo/community:lint:biome: src\types\global.d.ts:17:62 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   ! Unexpected any. Specify a different type.
@repo/community:lint:biome:   
@repo/community:lint:biome:     15 │   export function formatHex(color: Color): string;
@repo/community:lint:biome:     16 │   export function formatRgb(color: Color): string;
@repo/community:lint:biome:   > 17 │   export function converter(mode: string): (color: Color) => any;
@repo/community:lint:biome:        │                                                              ^^^
@repo/community:lint:biome:     18 │ }
@repo/community:lint:biome:     19 │ 
@repo/community:lint:biome:   
@repo/community:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   × Formatter would have printed the following content:
@repo/community:lint:biome:   
@repo/community:lint:biome:     1   │ - import·{·config·}·from·'@repo/eslint-config/react-internal';␍
@repo/community:lint:biome:     2   │ - ␍
@repo/community:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/community:lint:biome:     4   │ - export·default·[...config];␍
@repo/community:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/react-internal';
@repo/community:lint:biome:       2 │ + 
@repo/community:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/community:lint:biome:       4 │ + export·default·[...config];
@repo/community:lint:biome:     5 5 │   
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: src\api\community.ts:617:18 lint/suspicious/useIterableCallbackReturn ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   × This callback passed to forEach() iterable method should not return a value.
@repo/community:lint:biome:   
@repo/community:lint:biome:     615 │           data.map((c: any) => c.id),
@repo/community:lint:biome:     616 │         );
@repo/community:lint:biome:   > 617 │       (uv ?? []).forEach((row: any) => upvotedIds.add(row.comment_id));
@repo/community:lint:biome:         │                  ^^^^^^^
@repo/community:lint:biome:     618 │     }
@repo/community:lint:biome:     619 │     return (data ?? []).map(
@repo/community:lint:biome:   
@repo/community:lint:biome:   i Either remove this return or remove the returned value.
@repo/community:lint:biome:   
@repo/community:lint:biome:     615 │           data.map((c: any) => c.id),
@repo/community:lint:biome:     616 │         );
@repo/community:lint:biome:   > 617 │       (uv ?? []).forEach((row: any) => upvotedIds.add(row.comment_id));
@repo/community:lint:biome:         │                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/community:lint:biome:     618 │     }
@repo/community:lint:biome:     619 │     return (data ?? []).map(
@repo/community:lint:biome:   
@repo/community:lint:biome: 
@repo/community:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/community:lint:biome: 
@repo/community:lint:biome:   × Some errors were emitted while running checks.
@repo/community:lint:biome:   
@repo/community:lint:biome: 

@repo/profile:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

gurudevi-mobile:lint:biome:   i The computed expression can be simplified without the use of a string literal.

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:     196 │       initSentry();
gurudevi-mobile:lint:biome:     197 │ 

gurudevi-mobile:lint:biome:   > 198 │       const posthogApiKey = process.env['EXPO_PUBLIC_POSTHOG_API_KEY'];
gurudevi-mobile:lint:biome:         │                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
gurudevi-mobile:lint:biome:     199 │       if (posthogApiKey) {
gurudevi-mobile:lint:biome:     200 │         const posthogHost = process.env['EXPO_PUBLIC_POSTHOG_HOST'] || 'https://eu.i.posthog.com';
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Unsafe fix: Use a literal key instead.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     196 196 │         initSentry();
gurudevi-mobile:lint:biome:     197 197 │   

gurudevi-mobile:lint:biome:     198     │ - ······const·posthogApiKey·=·process.env['EXPO_PUBLIC_POSTHOG_API_KEY'];
gurudevi-mobile:lint:biome:         198 │ + ······const·posthogApiKey·=·process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
gurudevi-mobile:lint:biome:     199 199 │         if (posthogApiKey) {
gurudevi-mobile:lint:biome:     200 200 │           const posthogHost = process.env['EXPO_PUBLIC_POSTHOG_HOST'] || 'https://eu.i.posthog.com';
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: App.tsx:200:41 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   i The computed expression can be simplified without the use of a string literal.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     198 │       const posthogApiKey = process.env['EXPO_PUBLIC_POSTHOG_API_KEY'];
gurudevi-mobile:lint:biome:     199 │       if (posthogApiKey) {

gurudevi-mobile:lint:biome:   > 200 │         const posthogHost = process.env['EXPO_PUBLIC_POSTHOG_HOST'] || 'https://eu.i.posthog.com';
gurudevi-mobile:lint:biome:         │                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^
gurudevi-mobile:lint:biome:     201 │         void initPostHog(posthogApiKey, { host: posthogHost }).then(() => {
gurudevi-mobile:lint:biome:     202 │           trackEvent('app_initialized', { platform: coreRuntime.device.getMetadata().platform });
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Unsafe fix: Use a literal key instead.
gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:     198 198 │         const posthogApiKey = process.env['EXPO_PUBLIC_POSTHOG_API_KEY'];
gurudevi-mobile:lint:biome:     199 199 │         if (posthogApiKey) {
gurudevi-mobile:lint:biome:     200     │ - ········const·posthogHost·=·process.env['EXPO_PUBLIC_POSTHOG_HOST']·||·'https://eu.i.posthog.com';
gurudevi-mobile:lint:biome:         200 │ + ········const·posthogHost·=·process.env.EXPO_PUBLIC_POSTHOG_HOST·||·'https://eu.i.posthog.com';
gurudevi-mobile:lint:biome:     201 201 │           void initPostHog(posthogApiKey, { host: posthogHost }).then(() => {
gurudevi-mobile:lint:biome:     202 202 │             trackEvent('app_initialized', { platform: coreRuntime.device.getMetadata().platform });
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome: App.tsx:45:13 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! This import is unused.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     43 │ import { sanctuarySaffron } from '@repo/ui/theme';
gurudevi-mobile:lint:biome:     44 │ import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
gurudevi-mobile:lint:biome:   > 45 │ import * as Linking from 'expo-linking';
gurudevi-mobile:lint:biome:        │             ^^^^^^^

gurudevi-mobile:lint:biome:     46 │ import React, { lazy, Suspense, useEffect, useState } from 'react';
gurudevi-mobile:lint:biome:     47 │ import { Platform } from 'react-native';
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Unsafe fix: Remove the unused imports.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:      43  43 │   import { sanctuarySaffron } from '@repo/ui/theme';
gurudevi-mobile:lint:biome:      44  44 │   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

gurudevi-mobile:lint:biome:      45     │ - import·*·as·Linking·from·'expo-linking';
gurudevi-mobile:lint:biome:      46  45 │   import React, { lazy, Suspense, useEffect, useState } from 'react';
gurudevi-mobile:lint:biome:      47  46 │   import { Platform } from 'react-native';
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: App.tsx:46:8 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! These imports are unused.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     44 │ import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
gurudevi-mobile:lint:biome:     45 │ import * as Linking from 'expo-linking';
gurudevi-mobile:lint:biome:   > 46 │ import React, { lazy, Suspense, useEffect, useState } from 'react';
gurudevi-mobile:lint:biome:        │        ^^^^^
gurudevi-mobile:lint:biome:     47 │ import { Platform } from 'react-native';
gurudevi-mobile:lint:biome:     48 │ import { SafeAreaProvider } from 'react-native-safe-area-context';
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Unsafe fix: Remove the unused imports.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     46 │ import·React,·{·lazy,·Suspense,·useEffect,·useState·}·from·'react';
gurudevi-mobile:lint:biome:        │        -------                                                     
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.tsx:59:89 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     57 │         ]}
gurudevi-mobile:lint:biome:     58 │       >
gurudevi-mobile:lint:biome:   > 59 │         <Text color={isUser ? gradientNodes[0] : text.primary} sx={{ fontSize: '$md' as any }}>
gurudevi-mobile:lint:biome:        │                                                                                         ^^^
gurudevi-mobile:lint:biome:     60 │           {item.content}
gurudevi-mobile:lint:biome:     61 │         </Text>
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.tsx:86:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     84 │                 sx={{
gurudevi-mobile:lint:biome:     85 │                   fontWeight: '700',
gurudevi-mobile:lint:biome:   > 86 │                   fontSize: '$lg' as any,
gurudevi-mobile:lint:biome:        │                                      ^^^
gurudevi-mobile:lint:biome:     87 │                   color: text.primary,
gurudevi-mobile:lint:biome:     88 │                 }}
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.tsx:108:44 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     106 │           ListFooterComponent={
gurudevi-mobile:lint:biome:     107 │             isThinking ? (
gurudevi-mobile:lint:biome:   > 108 │               <Box sx={{ padding: '$md' as any, opacity: 0.6 }}>
gurudevi-mobile:lint:biome:         │                                            ^^^
gurudevi-mobile:lint:biome:     109 │                 <Text color={text.secondary} italic size="sm">
gurudevi-mobile:lint:biome:     110 │                   {t('aiAssistant.thinking')}
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.tsx:126:47 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     124 │               <TouchableOpacity
gurudevi-mobile:lint:biome:     125 │                 accessibilityRole="button"
gurudevi-mobile:lint:biome:   > 126 │                 onPress={() => (navigation as any).navigate('Welcome')}
gurudevi-mobile:lint:biome:         │                                               ^^^
gurudevi-mobile:lint:biome:     127 │               >
gurudevi-mobile:lint:biome:     128 │                 <Text color={accent.action} bold size="sm">
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.web.tsx:27:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     26 │ export default function AIAssistantScreen() {
gurudevi-mobile:lint:biome:   > 27 │   const navigation = useNavigation<any>();
gurudevi-mobile:lint:biome:        │                                    ^^^
gurudevi-mobile:lint:biome:     28 │   const { t } = useTranslation();
gurudevi-mobile:lint:biome:     29 │   const user = useStore((state) => state.user);
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.web.tsx:65:33 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     63 │   };
gurudevi-mobile:lint:biome:     64 │ 
gurudevi-mobile:lint:biome:   > 65 │   const handleGapPrompt = (gap: any) => {
gurudevi-mobile:lint:biome:        │                                 ^^^
gurudevi-mobile:lint:biome:     66 │     const prompt = `Help me with: ${gap.title}. Suggested action: ${gap.suggestedAction}.`;
gurudevi-mobile:lint:biome:     67 │     setDraft(prompt);
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\classroom\AttendanceScreen.web.tsx:47:26 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     46 │ export default function AttendanceScreenWeb() {
gurudevi-mobile:lint:biome:   > 47 │   const route = useRoute<any>();
gurudevi-mobile:lint:biome:        │                          ^^^
gurudevi-mobile:lint:biome:     48 │   const navigation = useNavigation<any>();
gurudevi-mobile:lint:biome:     49 │   const { classroomId, classroomName } = route.params ?? {};
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\classroom\AttendanceScreen.web.tsx:48:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     46 │ export default function AttendanceScreenWeb() {
gurudevi-mobile:lint:biome:     47 │   const route = useRoute<any>();
gurudevi-mobile:lint:biome:   > 48 │   const navigation = useNavigation<any>();
gurudevi-mobile:lint:biome:        │                                    ^^^
gurudevi-mobile:lint:biome:     49 │   const { classroomId, classroomName } = route.params ?? {};
gurudevi-mobile:lint:biome:     50 │   const { user } = useStore();
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\classroom\AttendanceScreen.web.tsx:73:19 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     71 │           })),
gurudevi-mobile:lint:biome:     72 │         );
gurudevi-mobile:lint:biome:   > 73 │       } catch (e: any) {
gurudevi-mobile:lint:biome:        │                   ^^^
gurudevi-mobile:lint:biome:     74 │         setError(e?.message || 'Failed to load students');
gurudevi-mobile:lint:biome:     75 │       } finally {
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\classroom\AttendanceScreen.web.tsx:117:17 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     115 │       }
gurudevi-mobile:lint:biome:     116 │       setSaved(true);
gurudevi-mobile:lint:biome:   > 117 │     } catch (e: any) {
gurudevi-mobile:lint:biome:         │                 ^^^
gurudevi-mobile:lint:biome:     118 │       setError(e?.message || 'Failed to save attendance');
gurudevi-mobile:lint:biome:     119 │     } finally {
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.web.tsx:101:9 lint/a11y/useButtonType ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Provide an explicit type prop for the button element.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:      99 │           to begin.
gurudevi-mobile:lint:biome:     100 │         </p>
gurudevi-mobile:lint:biome:   > 101 │         <button className="premium-button" onClick={() => navigation.navigate('Auth')}>
gurudevi-mobile:lint:biome:         │         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
gurudevi-mobile:lint:biome:     102 │           Sign In
gurudevi-mobile:lint:biome:     103 │         </button>
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Allowed button types are: submit, button or reset
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.web.tsx:155:17 lint/a11y/useButtonType ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Provide an explicit type prop for the button element.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     153 │             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
gurudevi-mobile:lint:biome:     154 │               {activeGaps.map((gap) => (
gurudevi-mobile:lint:biome:   > 155 │                 <button
gurudevi-mobile:lint:biome:         │                 ^^^^^^^
gurudevi-mobile:lint:biome:   > 156 │                   key={gap.id}
gurudevi-mobile:lint:biome:          ...
gurudevi-mobile:lint:biome:   > 167 │                   }}
gurudevi-mobile:lint:biome:   > 168 │                 >
gurudevi-mobile:lint:biome:         │                 ^
gurudevi-mobile:lint:biome:     169 │                   <div
gurudevi-mobile:lint:biome:     170 │                     style={{
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Allowed button types are: submit, button or reset
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.web.tsx:196:11 lint/a11y/useButtonType ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Provide an explicit type prop for the button element.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     194 │           }}
gurudevi-mobile:lint:biome:     195 │         >
gurudevi-mobile:lint:biome:   > 196 │           <button
gurudevi-mobile:lint:biome:         │           ^^^^^^^
gurudevi-mobile:lint:biome:   > 197 │             onClick={clearHistory}
gurudevi-mobile:lint:biome:          ...
gurudevi-mobile:lint:biome:   > 208 │             }}
gurudevi-mobile:lint:biome:   > 209 │           >
gurudevi-mobile:lint:biome:         │           ^
gurudevi-mobile:lint:biome:     210 │             🗑 Clear conversation
gurudevi-mobile:lint:biome:     211 │           </button>
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i Allowed button types are: submit, button or reset
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.web.tsx:235:11 lint/a11y/useButtonType ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Provide an explicit type prop for the button element.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     233 │           }}
gurudevi-mobile:lint:biome:     234 │         >
gurudevi-mobile:lint:biome:   > 235 │           <button
gurudevi-mobile:lint:biome:         │           ^^^^^^^
gurudevi-mobile:lint:biome:   > 236 │             onClick={() => navigation.goBack()}
gurudevi-mobile:lint:biome:          ...
gurudevi-mobile:lint:biome:   > 247 │             }}

gurudevi-mobile:lint:biome:   > 248 │           >

gurudevi-mobile:lint:biome:         │           ^

gurudevi-mobile:lint:biome:     249 │             ← Back

gurudevi-mobile:lint:biome:     250 │           </button>

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:   i The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.
gurudevi-mobile:lint:biome:   

apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable title is unused.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      7 │ }

apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = 'panel' } = Astro.props;

apps-edlove-web:lint:biome:        │         ^^^^^
apps-edlove-web:lint:biome:     10 │ ---
apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable subtitle is unused.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      7 │ }

apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = 'panel' } = Astro.props;

apps-edlove-web:lint:biome:        │                ^^^^^^^^

apps-edlove-web:lint:biome:     10 │ ---
apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   

gurudevi-mobile:lint:biome:   i Allowed button types are: submit, button or reset
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: archives\ai\AIAssistantScreen.web.tsx:447:11 lint/a11y/useButtonType ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome:   × Provide an explicit type prop for the button element.
gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:     445 │             }}
gurudevi-mobile:lint:biome:     446 │           />
gurudevi-mobile:lint:biome:   > 447 │           <button
gurudevi-mobile:lint:biome:         │           ^^^^^^^

gurudevi-mobile:lint:biome:   > 448 │             onClick={handleSend}

gurudevi-mobile:lint:biome:          ...

gurudevi-mobile:lint:biome:   > 465 │             }}

gurudevi-mobile:lint:biome:   > 466 │           >

gurudevi-mobile:lint:biome:         │           ^

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:26 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable icon is unused.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      7 │ }

gurudevi-mobile:lint:biome:     467 │             {isThinking ? '…' : '➤'}

gurudevi-mobile:lint:biome:     468 │           </button>

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:   i The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:   i Allowed button types are: submit, button or reset

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome: 

apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = 'panel' } = Astro.props;

gurudevi-mobile:lint:biome: package.json:100:5 lint/suspicious/noDuplicateObjectKeys ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × The key expo-device was already declared.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:      98 │     "expo-crypto": "~55.0.14",

@repo/payments:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

apps-edlove-web:lint:biome:        │                          ^^^^

@intuitui-labs/lk-edu-geo:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

apps-edlove-web:lint:biome:     10 │ ---

apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   

gurudevi-mobile:lint:biome:      99 │     "expo-dev-client": "~55.0.28",

gurudevi-mobile:lint:biome:   > 100 │     "expo-device": "*",

gurudevi-mobile:lint:biome:         │     ^^^^^^^^^^^^^

gurudevi-mobile:lint:biome:     101 │     "expo-document-picker": "~55.0.13",

gurudevi-mobile:lint:biome:     102 │     "expo-file-system": "~55.0.17",

gurudevi-mobile:lint:biome:   

@repo/community:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

gurudevi-mobile:lint:biome:   i This is where a duplicated key was declared again.

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:     118 │     "expo-video": "~55.0.15",
gurudevi-mobile:lint:biome:     119 │     "expo-notifications": "~55.0.17",
gurudevi-mobile:lint:biome:   > 120 │     "expo-device": "~55.0.14",
gurudevi-mobile:lint:biome:         │     ^^^^^^^^^^^^^

gurudevi-mobile:lint:biome:     121 │     "expo-web-browser": "~55.0.14",

gurudevi-mobile:lint:biome:     122 │     "fast-deep-equal": "^3.1.3",
gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:   i If a key is defined multiple times, only the last definition takes effect. Previous definitions are ignored.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
gurudevi-mobile:lint:biome: Diagnostics not shown: 1226.

gurudevi-mobile:lint:biome: Checked 284 files in 1687ms. No fixes applied.
gurudevi-mobile:lint:biome: Found 716 errors.
gurudevi-mobile:lint:biome: Found 472 warnings.
gurudevi-mobile:lint:biome: Found 58 infos.

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:32 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable mode is unused.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      7 │ }

apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = 'panel' } = Astro.props;

apps-edlove-web:lint:biome:        │                                ^^^^

apps-edlove-web:lint:biome:     10 │ ---

apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\Footer.astro:2:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

@repo/types-shim:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

apps-edlove-web:lint:biome:   ! This variable currentYear is unused.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     1 │ ---

gurudevi-mobile:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome:   × Some errors were emitted while running checks.

gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 

apps-edlove-web:lint:biome:   > 2 │ const currentYear = new Date().getFullYear();

apps-edlove-web:lint:biome:       │       ^^^^^^^^^^^

apps-edlove-web:lint:biome:     3 │ ---
apps-edlove-web:lint:biome:     4 │ 
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend currentYear with an underscore.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     1 1 │   

apps-edlove-web:lint:biome:     2   │ - const·currentYear·=·new·Date().getFullYear();

apps-edlove-web:lint:biome:       2 │ + const·_currentYear·=·new·Date().getFullYear();
apps-edlove-web:lint:biome:     3 3 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Navigation.astro:13:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable links is unused.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     11 │ }
apps-edlove-web:lint:biome:     12 │ 
apps-edlove-web:lint:biome:   > 13 │ const links: NavLink[] = [
apps-edlove-web:lint:biome:        │       ^^^^^
apps-edlove-web:lint:biome:     14 │   { name: 'Cosmos', href: '/cosmos' },
apps-edlove-web:lint:biome:     15 │   { name: 'Sri Lanka', href: '/sri-lanka' },
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend links with an underscore.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     11 11 │   }␍
apps-edlove-web:lint:biome:     12 12 │   ␍
apps-edlove-web:lint:biome:     13    │ - const·links:·NavLink[]·=·[␍
apps-edlove-web:lint:biome:        13 │ + const·_links:·NavLink[]·=·[␍
apps-edlove-web:lint:biome:     14 14 │     { name: 'Cosmos', href: '/cosmos' },␍
apps-edlove-web:lint:biome:     15 15 │     { name: 'Sri Lanka', href: '/sri-lanka' },␍
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Navigation.astro:22:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable languages is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     20 │ ];
apps-edlove-web:lint:biome:     21 │ 
apps-edlove-web:lint:biome:   > 22 │ const languages: Language[] = [
apps-edlove-web:lint:biome:        │       ^^^^^^^^^
apps-edlove-web:lint:biome:     23 │   { code: 'EN', label: 'English', href: '/' },
apps-edlove-web:lint:biome:     24 │   { code: 'SI', label: 'Sinhala', href: '/si' },
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend languages with an underscore.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     20 20 │   ];␍
apps-edlove-web:lint:biome:     21 21 │   ␍
apps-edlove-web:lint:biome:     22    │ - const·languages:·Language[]·=·[␍
apps-edlove-web:lint:biome:        22 │ + const·_languages:·Language[]·=·[␍
apps-edlove-web:lint:biome:     23 23 │     { code: 'EN', label: 'English', href: '/' },␍

apps-edlove-web:lint:biome:     24 24 │     { code: 'SI', label: 'Sinhala', href: '/si' },␍

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\StructuredData.astro:3:24 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     1 │ ---

apps-edlove-web:lint:biome:     2 │ interface Props {

apps-edlove-web:lint:biome:   > 3 │   data: Record<string, any> | Array<Record<string, any>>;

apps-edlove-web:lint:biome:       │                        ^^^

apps-edlove-web:lint:biome:     4 │ }

apps-edlove-web:lint:biome:     5 │ 

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\StructuredData.astro:3:52 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     1 │ ---

apps-edlove-web:lint:biome:     2 │ interface Props {

apps-edlove-web:lint:biome:   > 3 │   data: Record<string, any> | Array<Record<string, any>>;

apps-edlove-web:lint:biome:       │                                                    ^^^

apps-edlove-web:lint:biome:     4 │ }

apps-edlove-web:lint:biome:     5 │ 

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\StructuredData.astro:7:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable normalized is unused.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     6 │ const { data } = Astro.props;

apps-edlove-web:lint:biome:   > 7 │ const normalized = Array.isArray(data) ? data : [data];

apps-edlove-web:lint:biome:       │       ^^^^^^^^^^
apps-edlove-web:lint:biome:     8 │ ---
apps-edlove-web:lint:biome:     9 │ 
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend normalized with an underscore.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     5 5 │   ␍
apps-edlove-web:lint:biome:     6 6 │   const { data } = Astro.props;␍
apps-edlove-web:lint:biome:     7   │ - const·normalized·=·Array.isArray(data)·?·data·:·[data];␍
apps-edlove-web:lint:biome:       7 │ + const·_normalized·=·Array.isArray(data)·?·data·:·[data];␍
apps-edlove-web:lint:biome:     8 8 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Welcome.astro:2:8 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This import is unused.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:   > 2 │ import astroLogo from '../assets/astro.svg';
apps-edlove-web:lint:biome:       │        ^^^^^^^^^
apps-edlove-web:lint:biome:     3 │ import background from '../assets/background.svg';
apps-edlove-web:lint:biome:     4 │ ---
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unsafe fix: Remove the unused imports.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1   │ - 
apps-edlove-web:lint:biome:     2   │ - import·astroLogo·from·'../assets/astro.svg';␍
apps-edlove-web:lint:biome:       1 │ + ␍
apps-edlove-web:lint:biome:     3 2 │   import background from '../assets/background.svg';␍
apps-edlove-web:lint:biome:     4 3 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Welcome.astro:3:8 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This import is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:     2 │ import astroLogo from '../assets/astro.svg';
apps-edlove-web:lint:biome:   > 3 │ import background from '../assets/background.svg';
apps-edlove-web:lint:biome:       │        ^^^^^^^^^^
apps-edlove-web:lint:biome:     4 │ ---
apps-edlove-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unsafe fix: Remove the unused imports.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1 1 │   
apps-edlove-web:lint:biome:     2   │ - import·astroLogo·from·'../assets/astro.svg';␍
apps-edlove-web:lint:biome:     3   │ - import·background·from·'../assets/background.svg';␍
apps-edlove-web:lint:biome:       2 │ + import·astroLogo·from·'../assets/astro.svg';␍
apps-edlove-web:lint:biome:     4 3 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\utils\helpers.ts:326:46 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     324 │  * Debounce function (wait for pause in calls)
apps-edlove-web:lint:biome:     325 │  */
apps-edlove-web:lint:biome:   > 326 │ export function debounce<T extends (...args: any[]) => any>(
apps-edlove-web:lint:biome:         │                                              ^^^
apps-edlove-web:lint:biome:     327 │   func: T,
apps-edlove-web:lint:biome:     328 │   delay: number,
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\utils\helpers.ts:326:56 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     324 │  * Debounce function (wait for pause in calls)

apps-edlove-web:lint:biome:     325 │  */
apps-edlove-web:lint:biome:   > 326 │ export function debounce<T extends (...args: any[]) => any>(
apps-edlove-web:lint:biome:         │                                                        ^^^
apps-edlove-web:lint:biome:     327 │   func: T,
apps-edlove-web:lint:biome:     328 │   delay: number,
apps-edlove-web:lint:biome:   
gurudevi-mobile:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\utils\helpers.ts:341:46 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     339 │  * Throttle function (limit calls per time period)
apps-edlove-web:lint:biome:     340 │  */

apps-edlove-web:lint:biome:   > 341 │ export function throttle<T extends (...args: any[]) => any>(

apps-edlove-web:lint:biome:         │                                              ^^^
apps-edlove-web:lint:biome:     342 │   func: T,
apps-edlove-web:lint:biome:     343 │   limit: number,

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\utils\helpers.ts:341:56 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     339 │  * Throttle function (limit calls per time period)

apps-edlove-web:lint:biome:     340 │  */

apps-edlove-web:lint:biome:   > 341 │ export function throttle<T extends (...args: any[]) => any>(

apps-edlove-web:lint:biome:         │                                                        ^^^

apps-edlove-web:lint:biome:     342 │   func: T,

apps-edlove-web:lint:biome:     343 │   limit: number,

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: astro.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      1    │ - //·@ts-check␍

apps-edlove-web:lint:biome:      2    │ - ␍

apps-edlove-web:lint:biome:      3    │ - import·sitemap·from·'@astrojs/sitemap';␍
apps-edlove-web:lint:biome:      4    │ - import·svelte·from·'@astrojs/svelte';␍
apps-edlove-web:lint:biome:      5    │ - ␍
apps-edlove-web:lint:biome:      6    │ - import·tailwindcss·from·'@tailwindcss/vite';␍
apps-edlove-web:lint:biome:      7    │ - import·{·defineConfig·}·from·'astro/config';␍
apps-edlove-web:lint:biome:      8    │ - ␍
apps-edlove-web:lint:biome:      9    │ - //·https://astro.build/config␍
apps-edlove-web:lint:biome:     10    │ - export·default·defineConfig({␍

apps-edlove-web:lint:biome:     11    │ - ··site:·'https://edlove.org',␍
apps-edlove-web:lint:biome:     12    │ - ␍
apps-edlove-web:lint:biome:     13    │ - ··vite:·{␍
apps-edlove-web:lint:biome:     14    │ - ····plugins:·[/**·@type·{any}·*/·(tailwindcss())],␍
apps-edlove-web:lint:biome:     15    │ - ··},␍
apps-edlove-web:lint:biome:     16    │ - ␍
apps-edlove-web:lint:biome:     17    │ - ··integrations:·[svelte(),·sitemap()],␍
apps-edlove-web:lint:biome:     18    │ - ␍
apps-edlove-web:lint:biome:     19    │ - ··i18n:·{␍
apps-edlove-web:lint:biome:     20    │ - ····defaultLocale:·'en',␍
apps-edlove-web:lint:biome:     21    │ - ····locales:·['en',·'si',·'ta'],␍
apps-edlove-web:lint:biome:     22    │ - ····routing:·{␍
apps-edlove-web:lint:biome:     23    │ - ······prefixDefaultLocale:·false,␍
apps-edlove-web:lint:biome:     24    │ - ····},␍
apps-edlove-web:lint:biome:     25    │ - ··},␍
apps-edlove-web:lint:biome:     26    │ - });␍
apps-edlove-web:lint:biome:         1 │ + //·@ts-check
apps-edlove-web:lint:biome:         2 │ + 
apps-edlove-web:lint:biome:         3 │ + import·sitemap·from·'@astrojs/sitemap';
apps-edlove-web:lint:biome:         4 │ + import·svelte·from·'@astrojs/svelte';
apps-edlove-web:lint:biome:         5 │ + 
apps-edlove-web:lint:biome:         6 │ + import·tailwindcss·from·'@tailwindcss/vite';
apps-edlove-web:lint:biome:         7 │ + import·{·defineConfig·}·from·'astro/config';
apps-edlove-web:lint:biome:         8 │ + 
apps-edlove-web:lint:biome:         9 │ + //·https://astro.build/config
apps-edlove-web:lint:biome:        10 │ + export·default·defineConfig({
apps-edlove-web:lint:biome:        11 │ + ··site:·'https://edlove.org',
apps-edlove-web:lint:biome:        12 │ + 
apps-edlove-web:lint:biome:        13 │ + ··vite:·{
apps-edlove-web:lint:biome:        14 │ + ····plugins:·[/**·@type·{any}·*/·(tailwindcss())],
apps-edlove-web:lint:biome:        15 │ + ··},
apps-edlove-web:lint:biome:        16 │ + 
apps-edlove-web:lint:biome:        17 │ + ··integrations:·[svelte(),·sitemap()],
apps-edlove-web:lint:biome:        18 │ + 
apps-edlove-web:lint:biome:        19 │ + ··i18n:·{
apps-edlove-web:lint:biome:        20 │ + ····defaultLocale:·'en',
apps-edlove-web:lint:biome:        21 │ + ····locales:·['en',·'si',·'ta'],
apps-edlove-web:lint:biome:        22 │ + ····routing:·{
apps-edlove-web:lint:biome:        23 │ + ······prefixDefaultLocale:·false,
apps-edlove-web:lint:biome:        24 │ + ····},
apps-edlove-web:lint:biome:        25 │ + ··},
apps-edlove-web:lint:biome:        26 │ + });
apps-edlove-web:lint:biome:     27 27 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      1  1 │   ---␍
apps-edlove-web:lint:biome:      2    │ - interface·Props·{␍
apps-edlove-web:lint:biome:      3    │ - ··title:·string;␍
apps-edlove-web:lint:biome:      4    │ - ··subtitle?:·string;␍
apps-edlove-web:lint:biome:      5    │ - ··icon?:·string;␍
apps-edlove-web:lint:biome:      6    │ - ··mode?:·'panel'·|·'modal';␍
apps-edlove-web:lint:biome:      7    │ - }␍
apps-edlove-web:lint:biome:      8    │ - ␍
apps-edlove-web:lint:biome:      9    │ - const·{·title,·subtitle,·icon,·mode·=·'panel'·}·=·Astro.props;␍
apps-edlove-web:lint:biome:         2 │ + interface·Props·{
apps-edlove-web:lint:biome:         3 │ + ··title:·string;
apps-edlove-web:lint:biome:         4 │ + ··subtitle?:·string;
apps-edlove-web:lint:biome:         5 │ + ··icon?:·string;
apps-edlove-web:lint:biome:         6 │ + ··mode?:·'panel'·|·'modal';
apps-edlove-web:lint:biome:         7 │ + }
apps-edlove-web:lint:biome:         8 │ + 
apps-edlove-web:lint:biome:         9 │ + const·{·title,·subtitle,·icon,·mode·=·'panel'·}·=·Astro.props;
apps-edlove-web:lint:biome:     10 10 │   ---␍
apps-edlove-web:lint:biome:     11 11 │   ␍
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Navigation.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:       1   1 │   ---␍
apps-edlove-web:lint:biome:       2     │ - interface·NavLink·{␍
apps-edlove-web:lint:biome:       3     │ - ··name:·string;␍
apps-edlove-web:lint:biome:       4     │ - ··href:·string;␍
apps-edlove-web:lint:biome:       5     │ - }␍
apps-edlove-web:lint:biome:       6     │ - ␍
apps-edlove-web:lint:biome:       7     │ - interface·Language·{␍

apps-edlove-web:lint:biome:       8     │ - ··code:·string;␍

apps-edlove-web:lint:biome:       9     │ - ··label:·string;␍

apps-edlove-web:lint:biome:      10     │ - ··href:·string;␍

apps-edlove-web:lint:biome:      11     │ - }␍

apps-edlove-web:lint:biome:      12     │ - ␍

apps-edlove-web:lint:biome:      13     │ - const·links:·NavLink[]·=·[␍

apps-edlove-web:lint:biome:      14     │ - ··{·name:·'Cosmos',·href:·'/cosmos'·},␍

apps-edlove-web:lint:biome:      15     │ - ··{·name:·'Sri·Lanka',·href:·'/sri-lanka'·},␍

apps-edlove-web:lint:biome:      16     │ - ··{·name:·'Gurudevi',·href:·'/gurudevi'·},␍

apps-edlove-web:lint:biome:      17     │ - ··{·name:·'Resources',·href:·'/resources'·},␍

apps-edlove-web:lint:biome:      18     │ - ··{·name:·'The·Sangha',·href:·'/community'·},␍

apps-edlove-web:lint:biome:      19     │ - ··{·name:·'Library',·href:·'/library'·},␍

apps-edlove-web:lint:biome:      20     │ - ];␍

apps-edlove-web:lint:biome:      21     │ - ␍

apps-edlove-web:lint:biome:      22     │ - const·languages:·Language[]·=·[␍

apps-edlove-web:lint:biome:      23     │ - ··{·code:·'EN',·label:·'English',·href:·'/'·},␍

apps-edlove-web:lint:biome:      24     │ - ··{·code:·'SI',·label:·'Sinhala',·href:·'/si'·},␍

apps-edlove-web:lint:biome:      25     │ - ··{·code:·'TA',·label:·'Tamil',·href:·'/ta'·},␍

apps-edlove-web:lint:biome:      26     │ - ];␍

apps-edlove-web:lint:biome:           2 │ + interface·NavLink·{

apps-edlove-web:lint:biome:           3 │ + ··name:·string;

apps-edlove-web:lint:biome:           4 │ + ··href:·string;

apps-edlove-web:lint:biome:           5 │ + }

apps-edlove-web:lint:biome:           6 │ + 

apps-edlove-web:lint:biome:           7 │ + interface·Language·{

apps-edlove-web:lint:biome:           8 │ + ··code:·string;

apps-edlove-web:lint:biome:           9 │ + ··label:·string;

apps-edlove-web:lint:biome:          10 │ + ··href:·string;

apps-edlove-web:lint:biome:          11 │ + }

apps-edlove-web:lint:biome:          12 │ + 

apps-edlove-web:lint:biome:          13 │ + const·links:·NavLink[]·=·[

apps-edlove-web:lint:biome:          14 │ + ··{·name:·'Cosmos',·href:·'/cosmos'·},

apps-edlove-web:lint:biome:          15 │ + ··{·name:·'Sri·Lanka',·href:·'/sri-lanka'·},

apps-edlove-web:lint:biome:          16 │ + ··{·name:·'Gurudevi',·href:·'/gurudevi'·},

apps-edlove-web:lint:biome:          17 │ + ··{·name:·'Resources',·href:·'/resources'·},

apps-edlove-web:lint:biome:          18 │ + ··{·name:·'The·Sangha',·href:·'/community'·},

apps-edlove-web:lint:biome:          19 │ + ··{·name:·'Library',·href:·'/library'·},
apps-edlove-web:lint:biome:          20 │ + ];

apps-edlove-web:lint:biome:          21 │ + 

apps-edlove-web:lint:biome:          22 │ + const·languages:·Language[]·=·[

apps-edlove-web:lint:biome:          23 │ + ··{·code:·'EN',·label:·'English',·href:·'/'·},

apps-edlove-web:lint:biome:          24 │ + ··{·code:·'SI',·label:·'Sinhala',·href:·'/si'·},

apps-edlove-web:lint:biome:          25 │ + ··{·code:·'TA',·label:·'Tamil',·href:·'/ta'·},

apps-edlove-web:lint:biome:          26 │ + ];

apps-edlove-web:lint:biome:      27  27 │   ---␍

apps-edlove-web:lint:biome:      28  28 │   ␍

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\Welcome.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:       1   1 │   ---␍

apps-edlove-web:lint:biome:       2     │ - import·astroLogo·from·'../assets/astro.svg';␍

apps-edlove-web:lint:biome:       3     │ - import·background·from·'../assets/background.svg';␍

apps-edlove-web:lint:biome:           2 │ + import·astroLogo·from·'../assets/astro.svg';

apps-edlove-web:lint:biome:           3 │ + import·background·from·'../assets/background.svg';

apps-edlove-web:lint:biome:       4   4 │   ---␍

apps-edlove-web:lint:biome:       5   5 │   ␍
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.

apps-edlove-web:lint:biome: Diagnostics not shown: 98.

apps-edlove-web:lint:biome: Checked 47 files in 666ms. No fixes applied.

apps-edlove-web:lint:biome: Found 23 errors.
apps-edlove-web:lint:biome: Found 94 warnings.

apps-edlove-web:lint:biome: Found 1 info.

apps-edlove-web:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Some errors were emitted while running checks.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/database:lint:biome: cache miss, executing d5bb0df42380b5a4

@repo/form-builder:lint:biome: cache miss, executing 357982994208143c

@repo/library:lint:biome: cache miss, executing ffad0be412db9712

@repo/classroom:lint:biome: cache miss, executing 6925e0dc922cef87

@repo/platform-mcp:lint:biome: cache miss, executing ac4b1ee61e66c847

apps-gurudevi-marketing-web:lint:biome: cache miss, executing 4d7339fbce9a40a6

@repo/graphics:lint:biome: cache miss, executing ffd3d4432548e4cb

@repo/core:lint:biome: cache miss, executing b2bcc7a597f96e40

@repo/admin:lint:biome: cache miss, executing e826720417e15bf2

@repo/ui:lint:biome: cache miss, executing 6fc92d2395235024

@repo/scanner-kit:lint:biome: cache miss, executing f0c3b318ffbc5c2f

@repo/self:lint:biome: cache miss, executing 3f031849c8325faf

@repo/ai:lint:biome: cache miss, executing 288f433016b6ef8a

@repo/accounting:lint:biome: cache miss, executing f1b7cb7fc06201b0

@repo/people:lint:biome: cache miss, executing b3ea1c818b145cc8

apps-neevsk-web:lint:biome: cache miss, executing c7e937ca144303b0

 ERROR 
 
@repo/analytics#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\analytics) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run lint:biome exited (1)



 Tasks:    0 successful, 26 total
Cached:    0 cached, 26 total
  Time:    9.982s 

Failed:    @repo/analytics#lint:biome


 ERROR  run failed: command  exited (1)

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-20T05:47:00.642Z

>>> Command: pnpm turbo run check-types

--------------------------------------------------------------------------------

• turbo 2.9.4


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 32 packages
   • Remote caching disabled


@repo/schema:check-types: cache miss, executing d264ec8587b4f7bd

@repo/types-shim:check-types: cache miss, executing 46a32e5f58d49077

@intuitui-labs/form-builder-engine:check-types: cache miss, executing 380ff6c5693a7c80

@repo/platform-mcp:check-types: cache miss, executing cc0514fa306a53ee

apps-neevsk-web:check-types: cache miss, executing be465c528f91863b

apps-edlove-web:check-types: cache miss, executing 9df2621a9b51b1fb

apps-intuitui-web:check-types: cache miss, executing 2efc28a9ef759517

apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec tsc --noEmit
apps-neevsk-web:check-types: 

apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec tsc --noEmit
apps-edlove-web:check-types: 

@repo/schema:check-types: 
@repo/schema:check-types: > @repo/schema@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\schema
@repo/schema:check-types: > pnpm exec tsc --noEmit
@repo/schema:check-types: 

@repo/platform-mcp:check-types: 
@repo/platform-mcp:check-types: > @repo/platform-mcp@0.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\platform-mcp
@repo/platform-mcp:check-types: > pnpm exec tsc --noEmit
@repo/platform-mcp:check-types: 

@intuitui-labs/form-builder-engine:check-types: 
@intuitui-labs/form-builder-engine:check-types: > @intuitui-labs/form-builder-engine@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder-engine
@intuitui-labs/form-builder-engine:check-types: > tsc --noEmit
@intuitui-labs/form-builder-engine:check-types: 

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec tsc --noEmit
apps-intuitui-web:check-types: 

@repo/types-shim:check-types: 
@repo/types-shim:check-types: > @repo/types-shim@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:check-types: > pnpm exec tsc --noEmit
@repo/types-shim:check-types: 

@repo/database:check-types: cache miss, executing e3d6330374cce0d8

@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > pnpm exec tsc --noEmit
@repo/database:check-types: 

@repo/core:check-types: cache miss, executing 88a44d3497a15048

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 

@repo/ui:check-types: cache miss, executing 4e7c0c5e671d99d6

@repo/accounting:check-types: cache miss, executing c33c80f5f7a16d9f

@intuitui-labs/lk-edu-geo:check-types: cache miss, executing fa76ea034b1c0a11

@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm exec tsc --noEmit
@repo/ui:check-types: 

@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: 

@repo/accounting:check-types: 
@repo/accounting:check-types: > @repo/accounting@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:check-types: > pnpm exec tsc --noEmit
@repo/accounting:check-types: 

@repo/payments:check-types: cache miss, executing f622c7eec6eb12fb

@repo/payments:check-types: 
@repo/payments:check-types: > @repo/payments@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:check-types: > pnpm exec tsc --noEmit
@repo/payments:check-types: 

@repo/workforce:check-types: cache miss, executing 95fb02be7c23af0f

@repo/graphics:check-types: cache miss, executing 9c6b6d2c8c606701
@repo/scanner-kit:check-types: cache miss, executing e6270c74f345b6a7

@repo/people:check-types: cache miss, executing 2064bd42a4424e3a

@repo/ai:check-types: cache miss, executing 703116887aa50c76

@repo/graphics:check-types: 
@repo/graphics:check-types: > @repo/graphics@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:check-types: > pnpm exec tsc --noEmit
@repo/graphics:check-types: 

@repo/workforce:check-types: 
@repo/workforce:check-types: > @repo/workforce@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:check-types: > pnpm exec tsc --noEmit
@repo/workforce:check-types: 

@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > pnpm exec tsc --noEmit
@repo/ai:check-types: 

@repo/people:check-types: 
@repo/people:check-types: > @repo/people@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: > pnpm exec tsc --noEmit
@repo/people:check-types: 

@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: > @repo/scanner-kit@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\scanner-kit
@repo/scanner-kit:check-types: > pnpm exec tsc --noEmit
@repo/scanner-kit:check-types: 

@repo/profile:check-types: cache miss, executing 9117106fd926ad05
@repo/form-builder:check-types: cache miss, executing 456feed1a1866fca

@repo/profile:check-types: 
@repo/profile:check-types: > @repo/profile@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:check-types: > pnpm exec tsc --noEmit
@repo/profile:check-types: 

@repo/form-builder:check-types: 
@repo/form-builder:check-types: > @repo/form-builder@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:check-types: > pnpm exec tsc --noEmit
@repo/form-builder:check-types: 

@repo/library:check-types: cache miss, executing 7041baf18d2a115e

@repo/analytics:check-types: cache miss, executing 87430c875f243cef

@repo/analytics:check-types: 
@repo/analytics:check-types: > @repo/analytics@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\analytics
@repo/analytics:check-types: > pnpm exec tsc --noEmit
@repo/analytics:check-types: 

@repo/library:check-types: 
@repo/library:check-types: > @repo/library@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:check-types: > pnpm exec tsc --noEmit
@repo/library:check-types: 

@repo/self:check-types: cache miss, executing 06f23b0739b23f67

@repo/self:check-types: 
@repo/self:check-types: > @repo/self@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: > pnpm exec tsc --noEmit
@repo/self:check-types: 

apps-gurudevi-marketing-web:check-types: cache miss, executing 0974d638cd673cbc

apps-gurudevi-marketing-web:check-types: 
apps-gurudevi-marketing-web:check-types: > apps-gurudevi-marketing-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:check-types: > pnpm exec tsc --noEmit
apps-gurudevi-marketing-web:check-types: 

@repo/community:check-types: cache miss, executing 46bc471ac1ad3eeb

@repo/community:check-types: 
@repo/community:check-types: > @repo/community@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\community
@repo/community:check-types: > pnpm exec tsc --noEmit
@repo/community:check-types: 

@repo/admin:check-types: cache miss, executing 04e774e09e3e1291

@repo/admin:check-types: 
@repo/admin:check-types: > @repo/admin@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\admin
@repo/admin:check-types: > pnpm exec tsc --noEmit
@repo/admin:check-types: 

@repo/classroom:check-types: cache miss, executing d8fd627dda5841a0

@repo/classroom:check-types: 
@repo/classroom:check-types: > @repo/classroom@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\classroom
@repo/classroom:check-types: > pnpm exec tsc --noEmit
@repo/classroom:check-types: 

gurudevi-mobile:check-types: cache miss, executing ebed806a8f5b933a

gurudevi-mobile:check-types: 
gurudevi-mobile:check-types: > gurudevi-mobile@1.1.0 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile
gurudevi-mobile:check-types: > pnpm exec tsc --noEmit
gurudevi-mobile:check-types: 


 Tasks:    28 successful, 28 total
Cached:    0 cached, 28 total
  Time:    4m1.406s 



--------------------------------------------------------------------------------
AUDIT SUMMARY
Duration: 243.7s

Findings: 0
Log File: reports/check-types.txt
--------------------------------------------------------------------------------


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-20T05:51:05.915Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-circular

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src
/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
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
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/sanctuary-api/src/index.ts → packages/core/src/index.ts

x 71 dependency violations (0 errors, 71 warnings). 2063 modules, 6511 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.8s
Findings: 0
Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-20T05:51:19.508Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-orphans
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src
/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
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
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/sanctuary-api/src/index.ts → packages/core/src/index.ts

x 71 dependency violations (0 errors, 71 warnings). 2063 modules, 6511 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 10.1s
Findings: 61

Log File: reports/unused_code.txt
--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-20T05:51:30.420Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src
/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
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
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/sanctuary-api/src/index.ts → packages/core/src/index.ts

x 71 dependency violations (0 errors, 71 warnings). 2063 modules, 6511 dependencies cruised.



--------------------------------------------------------------------------------
AUDIT SUMMARY

Duration: 10.2s
Findings: 72
Log File: reports/architecture.txt

--------------------------------------------------------------------------------


✅ All hygiene checks passed!


> polymath-platform@1.0.0 identity:check C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"


>>> Starting Sovereign Audit: 2026-05-20T05:51:41.212Z

>>> Command: node scripts/check-identity-alignment.mjs

--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 1.81s. Found 0 potential alignment issues.



[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------
AUDIT SUMMARY

Duration: 2.3s
Findings: 0
Log File: reports/identity_check.txt

--------------------------------------------------------------------------------


> polymath-platform@1.0.0 i18n:check C:\Users\Naween\projects\polymath-platform
> pnpm run i18n:audit && pnpm run i18n:no-inline-fallbacks



> polymath-platform@1.0.0 i18n:audit C:\Users\Naween\projects\polymath-platform
> node scripts/i18n/audit-keys.mjs



[en] Missing 69 translation key(s):

  - chat.empty
  - chat.historicalView

  - chat.noConversationsDesc
  - chat.noConversationsTitle

  - chat.placeholder
  - chat.tapToContinue

  - common.plant

  - community.endorse

  - community.endorsers

  - community.groups.joinAuthRequired

  - community.groups.joinedSuccess
  - community.groups.member

  - community.groups.qrHint

  - community.groups.qrTitle
  - community.hearthSubtitle

  - community.hearthTitle

  - community.manifestoCarousel
  - community.manifestoTopic

  - community.profile.defaultBio

  - community.profile.explorer
  - community.profile.memberOfGurudevi

  - community.profile.privacyProtected

  - community.profile.privateNote
  - community.profile.privateSanctuary

  - community.profile.publicPresenceOf

  - community.profile.publicResonance
  - community.profile.pulseActive

  - community.profile.recent
  - community.profile.reflection

  - community.profile.resonanceSphere
  - community.profile.verified
  - community.spotlight

  - community.viewSpotlight
  - fireJournal.errorSaving

  - grades.empty

  - invitationWelcome.desc
  - invite.error.invalid

  - invite.error.noCode
  - invite.success.joining

  - key

  - progressTree.interactionsLabel
  - progressTree.philosophy

  - self.adminDescription

  - self.founderDesc
  - self.founderDescription
  - self.gratitudePlaceholder

  - self.guardianDescription
  - self.moodHowAreYou

  - self.moodNeutral

  - self.moodPositive
  - self.moodRadiant
  - self.noWisdomYet

  - self.plantSeed
  - self.principalDesc
  - self.principalDescription

  - self.recording
  - self.recordingHint

  - self.studentDesc
  - self.studentDescription
  - self.tapToStart

  - self.teacherDesc
  - self.teacherDescription

  - self.voiceJournal
  - self.voiceJournalSubtitle

  - self.wisdomPlaceholder
  - self.wisdomSeeds

  - sleepTracker.notTime
  - sleepTracker.philosophy

  - sleepTracker.tomorrowHint


[si] Missing 116 translation key(s):
  - chat.empty

  - chat.historicalView
  - chat.noConversationsDesc

  - chat.noConversationsTitle
  - chat.placeholder

  - chat.tapToContinue

  - common.plant
  - community.endorse

  - community.endorsers
  - community.groups.joinAuthRequired

  - community.groups.joinedSuccess
  - community.groups.member

  - community.groups.qrHint

  - community.groups.qrTitle
  - community.hearthSubtitle

  - community.hearthTitle
  - community.manifestoCarousel

  - community.manifestoTopic
  - community.profile.aspiration

  - community.profile.contributions

  - community.profile.defaultBio

  - community.profile.endorsements
  - community.profile.explorer

  - community.profile.memberOfGurudevi
  - community.profile.posts

  - community.profile.privacyNote
  - community.profile.privacyProtected
  - community.profile.privateNote

  - community.profile.privateSanctuary
  - community.profile.publicPresenceOf
  - community.profile.publicResonance

  - community.profile.pulse
  - community.profile.pulseActive
  - community.profile.recent

  - community.profile.reflection
  - community.profile.reportAccount
  - community.profile.resonanceSphere

  - community.profile.resonanceStats
  - community.profile.sanctuaryHonors

  - community.profile.sendMessage
  - community.profile.verified
  - community.spotlight

  - community.viewSpotlight

  - fireJournal.errorSaving

  - grades.empty
  - invitationWelcome.desc

  - invite.error.invalid

  - invite.error.noCode

  - invite.success.joining

  - key
  - ocr.captureDescription

  - ocr.chooseFromGallery
  - ocr.permission.description

  - ocr.permission.title
  - ocr.scanning

  - ocr.takePhoto
  - ocr.tipsTitle

  - ocr.title
  - ocr.tryAgain

  - progressTree.interactionsLabel
  - progressTree.philosophy

  - scanner.controls.flip
  - scanner.controls.gallery

  - scanner.dismiss
  - scanner.errors.customBuild

  - scanner.errors.noQrFound
  - scanner.errors.scanFailed

  - scanner.instructions
  - scanner.permission.grant
  - scanner.permission.message
  - scanner.status.mlKit
  - scanner.title

  - scanner.web.cameraMessage
  - scanner.web.closeScanner
  - scanner.web.desktopHint
  - scanner.web.emptyError

  - scanner.web.pasteCode

  - scanner.web.submitCode
  - scanner.web.title

  - self.adminDescription
  - self.breathingReset

  - self.founderDesc
  - self.founderDescription
  - self.gratitudePlaceholder

  - self.guardianDescription

  - self.moodHowAreYou

  - self.moodNeutral

  - self.moodPositive
  - self.moodRadiant
  - self.noWisdomYet

  - self.plantSeed
  - self.principalDesc
  - self.principalDescription

  - self.recording
  - self.recordingHint

  - self.studentDesc
  - self.studentDescription

  - self.tapToStart
  - self.teacherDesc

  - self.teacherDescription
  - self.voiceJournal

  - self.voiceJournalSubtitle
  - self.wisdomPlaceholder

  - self.wisdomSeeds
  - sleepTracker.notTime

  - sleepTracker.philosophy
  - sleepTracker.tomorrowHint

  - tabs.class

  - tabs.platform

  - webNav.alerts
  - webNav.brandName

  - webNav.menu
  - webNav.notifications

  - webNav.settings
  - webNav.tabNavigation

  - webNav.toggleNavigation

[ta] Missing 108 translation key(s):

  - chat.empty
  - chat.historicalView

  - chat.noConversationsDesc
  - chat.noConversationsTitle

  - chat.placeholder
  - chat.tapToContinue

  - common.plant
  - community.endorse

  - community.endorsers
  - community.groups.joinAuthRequired

  - community.groups.joinedSuccess
  - community.groups.member

  - community.groups.qrHint

  - community.groups.qrTitle
  - community.hearthSubtitle

  - community.hearthTitle

  - community.manifestoCarousel

  - community.manifestoTopic
  - community.profile.aspiration

  - community.profile.contributions
  - community.profile.defaultBio
  - community.profile.endorsements
  - community.profile.explorer
  - community.profile.memberOfGurudevi

  - community.profile.posts
  - community.profile.privacyNote
  - community.profile.privacyProtected
  - community.profile.privateNote
  - community.profile.privateSanctuary
  - community.profile.publicPresenceOf

  - community.profile.publicResonance
  - community.profile.pulse
  - community.profile.pulseActive

  - community.profile.recent
  - community.profile.reflection
  - community.profile.reportAccount

  - community.profile.resonanceSphere
  - community.profile.resonanceStats
  - community.profile.sanctuaryHonors

  - community.profile.sendMessage
  - community.profile.verified
  - community.spotlight
  - community.viewSpotlight
  - fireJournal.errorSaving
  - grades.empty

  - invitationWelcome.desc
  - invite.error.invalid
  - invite.error.noCode
  - invite.success.joining

  - key
  - ocr.captureDescription
  - ocr.chooseFromGallery

  - ocr.permission.description
  - ocr.permission.title
  - ocr.scanning

  - ocr.takePhoto
  - ocr.tipsTitle
  - ocr.title

  - ocr.tryAgain
  - progressTree.interactionsLabel

  - progressTree.philosophy
  - scanner.controls.flip

  - scanner.controls.gallery
  - scanner.dismiss

  - scanner.errors.customBuild
  - scanner.errors.noQrFound

  - scanner.errors.scanFailed
  - scanner.instructions

  - scanner.permission.grant

  - scanner.permission.message
  - scanner.status.mlKit
  - scanner.title

  - scanner.web.cameraMessage
  - scanner.web.closeScanner

  - scanner.web.desktopHint
  - scanner.web.emptyError
  - scanner.web.pasteCode

  - scanner.web.submitCode
  - scanner.web.title
  - self.adminDescription

  - self.founderDesc
  - self.founderDescription

  - self.gratitudePlaceholder
  - self.guardianDescription
  - self.moodHowAreYou

  - self.moodNeutral
  - self.moodPositive

  - self.moodRadiant
  - self.noWisdomYet

  - self.plantSeed
  - self.principalDesc

  - self.principalDescription

  - self.recording
  - self.recordingHint
  - self.studentDesc
  - self.studentDescription

  - self.tapToStart
  - self.teacherDesc

  - self.teacherDescription
  - self.voiceJournal

  - self.voiceJournalSubtitle

  - self.wisdomPlaceholder
  - self.wisdomSeeds
  - sleepTracker.notTime
  - sleepTracker.philosophy
  - sleepTracker.tomorrowHint

  - tabs.class
  - tabs.platform

 ELIFECYCLE  Command failed with exit code 1.

 ELIFECYCLE  Command failed with exit code 1.

```
