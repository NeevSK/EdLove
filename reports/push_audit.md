# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/7/2026, 11:40:21 AM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run lint; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm run i18n:check
> **Duration:** 232.8s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 105 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 60 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 18 |
| packages/analytics | 21 |
| packages/community | 3 |
| packages/core | 39 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 6 |
| packages/scanner-kit | 3 |
| packages/trube-art | 3 |
| packages/ui | 24 |

## Detailed Findings

### Category: General
- [1m[31m✖[39m   found 2 problems, 0 warnings[22m
- @repo/library:lint:biome:     185 │ 			throw new APIError("Failed to fetch resources", error.code, error);
- @repo/library:lint:biome:     201 │ 		const { data, error } = await supabase.rpc("search_map_universe", {
- @repo/library:lint:biome:     230 │ 			if (error) throw error;
- @repo/profile:lint:biome:     164 │         } catch (uploadError) {
- @repo/profile:lint:biome:     165 │           handleAPIError(uploadError);
- @repo/profile:lint:biome:     164 164 │           } catch (uploadError) {␍
- @repo/profile:lint:biome:     165 165 │             handleAPIError(uploadError);␍
- @repo/library:lint:biome:     731 │ 					const { data: membershipData, error: membershipError } =
- @repo/profile:lint:biome:     164 │         } catch (uploadError) {
- @repo/profile:lint:biome:     165 │           handleAPIError(uploadError);
- @repo/profile:lint:biome:     164 164 │           } catch (uploadError) {␍
- @repo/profile:lint:biome:     165 165 │             handleAPIError(uploadError);␍
- @repo/profile:lint:biome:   > 2 │ import { handleAPIError, type Capacity, usePermissions, useAuth } from '@repo/core/logic';
- @repo/profile:lint:biome:     2 │ import·{·handleAPIError,·type·Capacity,·usePermissions,·useAuth·}·from·'@repo/core/logic';␍
- @repo/profile:lint:biome:     85 │ 			setError(err?.message || "Failed to save");
- @repo/library:lint:biome: Found 76 errors.
- @repo/library:lint:biome: Found 124 warnings.
- apps-neevsk-web:lint:biome: Found 56 errors.
- apps-neevsk-web:lint:biome: Found 75 warnings.
- apps-gurudevi-marketing-web:lint:biome: Found 68 errors.
- apps-gurudevi-marketing-web:lint:biome: Found 63 warnings.
- @repo/library:lint:biome:   × Some errors were emitted while running checks.
- apps-neevsk-web:lint:biome:   × Some errors were emitted while running checks.
- @repo/payments:lint:biome:     18    │ - → → const·{·data:·payment,·error:·pError·}·=·await·supabase␍
- @repo/payments:lint:biome:     25    │ - → → if·(pError)·throw·pError;␍
- @repo/payments:lint:biome:     53    │ - → → const·{·error:·updateError·}·=·await·supabase␍
- @repo/payments:lint:biome:     62    │ - → → if·(updateError)·throw·updateError;␍
- @repo/payments:lint:biome:        18 │ + ····const·{·data:·payment,·error:·pError·}·=·await·supabase
- @repo/payments:lint:biome:        25 │ + ····if·(pError)·throw·pError;
- @repo/payments:lint:biome:        52 │ + ····const·{·error:·updateError·}·=·await·supabase
- @repo/payments:lint:biome:        61 │ + ····if·(updateError)·throw·updateError;
- apps-gurudevi-marketing-web:lint:biome:   × Code formatting aborted due to parsing errors. To format code with errors, enable the 'formatter.formatWithErrors' option.
- @intuitui-labs/lk-edu-geo:lint:biome:     26    │ - → }·catch·(error)·{␍
- @intuitui-labs/lk-edu-geo:lint:biome:     27    │ - → → console.error("\u274C·Error:",·error);␍
- @intuitui-labs/lk-edu-geo:lint:biome:        25 │ + ··}·catch·(error)·{
- @intuitui-labs/lk-edu-geo:lint:biome:        26 │ + ····console.error('\u274C·Error:',·error);
- gurudevi-mobile:lint:biome:   > 170 │ 	} catch (error: any) {
- apps-gurudevi-marketing-web:lint:biome:   × Some errors were emitted while running checks.
- gurudevi-mobile:lint:biome:     172 │ 			JSON.stringify({ error: error.message || "Unknown error" }),
- @repo/people:lint:biome:      50     │ - → → → console.error("Attendance·toggle·failed:",·err);␍
- @intuitui-labs/lk-edu-geo:lint:biome: Found 21 errors.
- @intuitui-labs/lk-edu-geo:lint:biome: Found 15 warnings.
- @repo/profile:lint:biome:     2 │ import { handleAPIError, type Capacity, usePermissions, useAuth } from '@repo/core/logic';
- @repo/profile:lint:biome:       2     │ - import·{·handleAPIError,·type·Capacity,·usePermissions,·useAuth·}·from·'@repo/core/logic';␍
- @repo/profile:lint:biome:           2 │ + import·{·type·Capacity,·handleAPIError,·useAuth,·usePermissions·}·from·'@repo/core/logic';␍
- gurudevi-mobile:lint:biome:     17    │ - → → error:·"#ff4444",␍
- @intuitui-labs/lk-edu-geo:lint:biome:   × Some errors were emitted while running checks.
- gurudevi-mobile:lint:biome:        17 │ + ····error:·'#ff4444',
- @repo/payments:lint:biome: Found 9 errors.
- @repo/payments:lint:biome: Found 5 warnings.
- @repo/payments:lint:biome:   × Some errors were emitted while running checks.
- gurudevi-mobile:lint:biome:      1    │ - //·Manual·mock·for·expo-camera·to·prevent·Worker·errors·in·tests␍
- apps-edlove-web:lint:biome: Found 36 errors.
- apps-edlove-web:lint:biome: Found 93 warnings.
- gurudevi-mobile:lint:biome:         1 │ + //·Manual·mock·for·expo-camera·to·prevent·Worker·errors·in·tests
- @repo/profile:lint:biome: Found 56 errors.
- @repo/profile:lint:biome: Found 46 warnings.
- apps-edlove-web:lint:biome:   × Some errors were emitted while running checks.
- @repo/profile:lint:biome:   × Some errors were emitted while running checks.
- @repo/people:lint:biome:      41     │ - → → → warning:·"text-phase-warning·bg-phase-warning/5·border-phase-warning/20",␍
- @repo/people:lint:biome:      43     │ - → → → error:·"text-phase-error·bg-phase-error/5·border-phase-error/20",␍
- @repo/admin:lint:biome:      24     │ - → → → → → → → single:·jest.fn(()·=>·Promise.resolve({·data:·{},·error:·null·})),␍
- @repo/admin:lint:biome:      29     │ - → → → order:·jest.fn(()·=>·Promise.resolve({·data:·[],·error:·null·})),␍
- @repo/admin:lint:biome:      30     │ - → → → insert:·jest.fn(()·=>·Promise.resolve({·data:·{},·error:·null·})),␍
- @repo/people:lint:biome:      75     │ - → → → variant:·"warning",␍
- @repo/people:lint:biome:      93     │ - → → → variant:·"error",␍
- @repo/people:lint:biome:     105     │ - → → → variant:·"error",␍
- @repo/admin:lint:biome:     117     │ - → → → expect(result).toHaveProperty("error_rate");␍
- @repo/admin:lint:biome:     125     │ - → → → expect(["healthy",·"warning",·"critical"]).toContain(␍
- gurudevi-mobile:lint:biome:      2    │ - //·Provides·just·enough·API·surface·for·component·tests·to·render·without·errors.␍
- @repo/admin:lint:biome:      35     │ - → lastError?:·string;␍
- @repo/admin:lint:biome:      47     │ - → lastError?:·string,␍
- @repo/admin:lint:biome:      58     │ - → → lastError,␍
- gurudevi-mobile:lint:biome:         2 │ + //·Provides·just·enough·API·surface·for·component·tests·to·render·without·errors.
- @repo/people:lint:biome:      45     │ - → → → → console.error("Failed·to·load·feedback·history:",·err);␍
- @repo/people:lint:biome:      95     │ - → → → → → → → → → → → → ?·"bg-phase-error"␍
- @repo/people:lint:biome:     111     │ - → → → → → → → → → → → → → → → ?·"bg-phase-error/10·border-phase-error/20"␍
- @repo/people:lint:biome:     118     │ - → → → → → → → → → → → → → → → → ?·"text-phase-error"␍
- @repo/people:lint:biome:     129     │ - → → → → → → → → → → → → → → → :·"bg-phase-warning/10·border-phase-warning/20"␍
- @repo/people:lint:biome:     136     │ - → → → → → → → → → → → → → → → → :·"text-phase-warning"␍
- @repo/admin:lint:biome:     123     │ - → → → "Daily·and·weekly·platform·signal:·usage,·adoption,·error·pressure,·and·operator·load.",␍
- @repo/people:lint:biome:     100     │ - → → → → → → ?·"bg-phase-error·shadow-error/20"␍
- ERROR  @repo/library#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\library) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run lint:biome exited (1)
- ERROR  run failed: command  exited (1)
- x 78 dependency violations (9 errors, 69 warnings). 1951 modules, 6308 dependencies cruised.
- x 78 dependency violations (9 errors, 69 warnings). 1951 modules, 6308 dependencies cruised.
- x 78 dependency violations (9 errors, 69 warnings). 1951 modules, 6308 dependencies cruised.
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
- error no-circular: packages/core/src/logic/managers/NotificationManager.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/hooks/useNotifications.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- error no-circular: packages/core/src/logic/managers/NotificationManager.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/hooks/useNotifications.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- error no-circular: packages/core/src/logic/managers/NotificationManager.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/hooks/useNotifications.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →

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

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src
- warn no-orphans: packages/trube-art/src
- warn no-orphans: packages/trube-art/src

### Category: packages/ui
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
[90m⧗[39m   input: [1mUpdate AppSettingsScreen and bump versions

[STAGED CHANGES SUMMARY]
[APP] gurudevi-mobile
  M apps/gurudevi-mobile/app.json

[PKG] ui
  M packages/ui/package.json
  A packages/ui/src/screens/AppSettingsScreen.web.tsx
  M packages/ui/src/screens/index.ts

[MISC] Miscellaneous Files
  A .changeset/smart-1778133868731.md[22m
[31m✖[39m   subject may not be empty [90m[subject-empty][39m
[31m✖[39m   type may not be empty [90m[type-empty][39m

[1m[31m✖[39m   found 2 problems, 0 warnings[22m
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint



> polymath-platform@1.0.0 lint C:\Users\Naween\projects\polymath-platform
> pnpm turbo run lint


• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running lint in 29 packages

   • Remote caching disabled


@repo/payments:lint:biome: cache miss, executing 195bde874e6f03c8

@repo/admin:lint:biome: cache miss, executing 0c79749be8108b23

@intuitui-labs/lk-edu-geo:lint:biome: cache miss, executing 7bc36b6d19dbfec5

gurudevi-mobile:lint:biome: cache miss, executing a41df61c95fc545c

apps-edlove-web:lint:biome: cache miss, executing 0b922f60cb3f9f9b

@repo/profile:lint:biome: cache miss, executing dd525f2aee3c2dcb

@repo/library:lint:biome: cache miss, executing 87a9befa5af0cba4

apps-neevsk-web:lint:biome: cache miss, executing 3def5e34ac2b4a6c

apps-gurudevi-marketing-web:lint:biome: cache miss, executing ea9721c3f49e39c3

@repo/people:lint:biome: cache miss, executing c6aed7a3598a512a

@repo/admin:lint:biome: 
@repo/admin:lint:biome: > @repo/admin@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\admin
@repo/admin:lint:biome: > biome check .
@repo/admin:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: > @intuitui-labs/lk-edu-geo@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:lint:biome: > biome check .
@intuitui-labs/lk-edu-geo:lint:biome: 

apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: > apps-gurudevi-marketing-web@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:lint:biome: > biome check .
apps-gurudevi-marketing-web:lint:biome: 

@repo/payments:lint:biome: 
@repo/payments:lint:biome: > @repo/payments@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:lint:biome: > biome check .
@repo/payments:lint:biome: 

apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: > apps-neevsk-web@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:lint:biome: > biome check .
apps-neevsk-web:lint:biome: 

gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: > gurudevi-mobile@1.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile
gurudevi-mobile:lint:biome: > biome check .
gurudevi-mobile:lint:biome: 

@repo/people:lint:biome: 
@repo/people:lint:biome: > @repo/people@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:lint:biome: > biome check .
@repo/people:lint:biome: 

@repo/library:lint:biome: 
@repo/library:lint:biome: > @repo/library@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:lint:biome: > biome check .
@repo/library:lint:biome: 

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: > apps-edlove-web@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:lint:biome: > biome check .
apps-edlove-web:lint:biome: 

@repo/profile:lint:biome: 
@repo/profile:lint:biome: > @repo/profile@0.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:lint:biome: > biome check .
@repo/profile:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:22:47 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.

@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:     21 │ 		// Enriched Hierarchy

apps-neevsk-web:lint:biome: .astro\content.d.ts:5:43 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 

@repo/payments:lint:biome: src\plugins\payhere.ts:10:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   

@repo/payments:lint:biome:      8 │ 		amount: number,

@repo/payments:lint:biome:      9 │ 		currency: string,

@repo/payments:lint:biome:   > 10 │ 		metadata?: any,

apps-gurudevi-marketing-web:lint:biome: .astro\content.d.ts:5:43 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\CinematicBackground.astro:6:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable showVideo is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     4 │ }
apps-edlove-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:   > 6 │ const { showVideo = false } = Astro.props;

apps-edlove-web:lint:biome:       │         ^^^^^^^^^
apps-edlove-web:lint:biome:     7 │ ---
apps-edlove-web:lint:biome:     8 │ 
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable title is unused.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      7 │ }

apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;

apps-edlove-web:lint:biome:        │         ^^^^^

apps-edlove-web:lint:biome:     10 │ ---

apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:   > 22 │ 		const enrichedDistricts = districts.map((d: any) => {

apps-neevsk-web:lint:biome:   ! Unexpected any. Specify a different type.

apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.

apps-gurudevi-marketing-web:lint:biome:   

apps-neevsk-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     3 │ 		Content: import('astro/runtime/server/index.js').AstroComponentFactory;

apps-gurudevi-marketing-web:lint:biome:     4 │ 		headings: import('astro').MarkdownHeading[];
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-neevsk-web:lint:biome:     3 │ 		Content: import('astro/runtime/server/index.js').AstroComponentFactory;

apps-gurudevi-marketing-web:lint:biome:   > 5 │ 		remarkPluginFrontmatter: Record<string, any>;

apps-gurudevi-marketing-web:lint:biome:       │ 		                                        ^^^
apps-gurudevi-marketing-web:lint:biome:     6 │ 	}
apps-gurudevi-marketing-web:lint:biome:     7 │ 	interface Render {
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 

apps-neevsk-web:lint:biome:     4 │ 		headings: import('astro').MarkdownHeading[];
@intuitui-labs/lk-edu-geo:lint:biome:        │ 		                                            ^^^

@repo/payments:lint:biome:        │ 		           ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     23 │ 			// Get cities by district from postal backend

@intuitui-labs/lk-edu-geo:lint:biome:     24 │ 			const postalCities = SLPostal.citiesByDistrict(d.name_en) || [];
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx:37:5 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/people:lint:biome: 
apps-edlove-web:lint:biome:   
@repo/payments:lint:biome:     11 │ 	): Promise<PaymentIntent> {
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:28:17 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     26 │ 			// Match cities from SLGeo with PostalCodes
@intuitui-labs/lk-edu-geo:lint:biome:     27 │ 			const matchedCities = cities
@intuitui-labs/lk-edu-geo:lint:biome:   > 28 │ 				.filter((c: any) => c.district_id === d.id)
@intuitui-labs/lk-edu-geo:lint:biome:        │ 				            ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     29 │ 				.map((c: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:     30 │ 					const postalMatch = postalCities.find(
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:29:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     27 │ 			const matchedCities = cities
@intuitui-labs/lk-edu-geo:lint:biome:     28 │ 				.filter((c: any) => c.district_id === d.id)
@intuitui-labs/lk-edu-geo:lint:biome:   > 29 │ 				.map((c: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │ 				         ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     30 │ 					const postalMatch = postalCities.find(
@intuitui-labs/lk-edu-geo:lint:biome:     31 │ 						(pc: any) => pc.city.toLowerCase() === c.name_en.toLowerCase(),
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:31:12 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     29 │ 				.map((c: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:     30 │ 					const postalMatch = postalCities.find(
@intuitui-labs/lk-edu-geo:lint:biome:   > 31 │ 						(pc: any) => pc.city.toLowerCase() === c.name_en.toLowerCase(),

apps-edlove-web:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:        │ 						     ^^^
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome:     32 │ 					);
@intuitui-labs/lk-edu-geo:lint:biome:     33 │ 					return {

apps-edlove-web:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   
apps-edlove-web:lint:biome:   ! This variable subtitle is unused.
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   
apps-edlove-web:lint:biome:      7 │ }
@intuitui-labs/lk-edu-geo:lint:biome: 
apps-edlove-web:lint:biome:      8 │ 

@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-gn.ts:35:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;

apps-edlove-web:lint:biome:        │                ^^^^^^^^
apps-edlove-web:lint:biome:     10 │ ---
apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:26 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable icon is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      7 │ }
apps-edlove-web:lint:biome:      8 │ 
apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;
apps-edlove-web:lint:biome:        │                          ^^^^
apps-edlove-web:lint:biome:     10 │ ---
apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:32 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable mode is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      7 │ }
apps-edlove-web:lint:biome:      8 │ 
apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;
apps-edlove-web:lint:biome:        │                                ^^^^
apps-edlove-web:lint:biome:     10 │ ---
apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Footer.astro:2:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable currentYear is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1 │ ---
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
apps-edlove-web:lint:biome:     14 │ 	{ name: "Cosmos", href: "/cosmos" },
apps-edlove-web:lint:biome:     15 │ 	{ name: "Sri Lanka", href: "/sri-lanka" },
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend links with an underscore.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     11 11 │   }␍

apps-edlove-web:lint:biome:     12 12 │   ␍

apps-edlove-web:lint:biome:     13    │ - const·links:·NavLink[]·=·[␍

apps-edlove-web:lint:biome:        13 │ + const·_links:·NavLink[]·=·[␍

apps-edlove-web:lint:biome:     14 14 │   	{ name: "Cosmos", href: "/cosmos" },␍

apps-edlove-web:lint:biome:     15 15 │   	{ name: "Sri Lanka", href: "/sri-lanka" },␍

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

apps-edlove-web:lint:biome:     23 │ 	{ code: "EN", label: "English", href: "/" },

apps-edlove-web:lint:biome:     24 │ 	{ code: "SI", label: "Sinhala", href: "/si" },

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend languages with an underscore.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     20 20 │   ];␍

apps-edlove-web:lint:biome:     21 21 │   ␍

apps-edlove-web:lint:biome:     22    │ - const·languages:·Language[]·=·[␍

apps-edlove-web:lint:biome:        22 │ + const·_languages:·Language[]·=·[␍

apps-edlove-web:lint:biome:     23 23 │   	{ code: "EN", label: "English", href: "/" },␍

apps-edlove-web:lint:biome:     24 24 │   	{ code: "SI", label: "Sinhala", href: "/si" },␍

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\StructuredData.astro:3:23 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:     2 │ interface Props {
apps-edlove-web:lint:biome:   > 3 │ 	data: Record<string, any> | Array<Record<string, any>>;
apps-edlove-web:lint:biome:       │ 	                     ^^^
apps-edlove-web:lint:biome:     4 │ }
apps-edlove-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\StructuredData.astro:3:51 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:     2 │ interface Props {
@intuitui-labs/lk-edu-geo:lint:biome:     33 │ 	const workbook = XLSX.readFile(FILE_PATH);
@intuitui-labs/lk-edu-geo:lint:biome:     34 │ 	const sheet = workbook.Sheets.lka_admin4;
@intuitui-labs/lk-edu-geo:lint:biome:   > 35 │ 	const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
@intuitui-labs/lk-edu-geo:lint:biome:        │ 	            ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     36 │ 

@repo/people:lint:biome:   ! Unexpected any. Specify a different type.

apps-edlove-web:lint:biome:   > 3 │ 	data: Record<string, any> | Array<Record<string, any>>;

apps-edlove-web:lint:biome:       │ 	                                                 ^^^
apps-neevsk-web:lint:biome:   > 5 │ 		remarkPluginFrontmatter: Record<string, any>;
apps-gurudevi-marketing-web:lint:biome: .astro\content.d.ts:24:34 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome:       │ 		                                        ^^^
@repo/payments:lint:biome:     12 │ 		// In a real implementation, this would call PayHere API to get a checkout URL or token.
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-neevsk-web:lint:biome:     6 │ 	}

apps-edlove-web:lint:biome:     4 │ }
@repo/payments:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     22 │ 	export type CollectionEntry<C extends CollectionKey> = Flatten<DataEntryMap[C]>;
apps-gurudevi-marketing-web:lint:biome:     23 │ 
@repo/people:lint:biome:   

apps-neevsk-web:lint:biome:     7 │ 	interface Render {
apps-edlove-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-gurudevi-marketing-web:lint:biome:   > 24 │ 	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
@repo/people:lint:biome:     35 │ 		variant = "primary",
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-neevsk-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome:        │ 	                                ^^^
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: .astro\content.d.ts:24:34 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome:     36 │ 		onPress,
apps-edlove-web:lint:biome:   

@repo/payments:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     25 │ 
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-neevsk-web:lint:biome:   

apps-neevsk-web:lint:biome:     22 │ 	export type CollectionEntry<C extends CollectionKey> = Flatten<DataEntryMap[C]>;
apps-neevsk-web:lint:biome:     23 │ 
apps-neevsk-web:lint:biome:   > 24 │ 	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
apps-neevsk-web:lint:biome:        │ 	                                ^^^
apps-neevsk-web:lint:biome:     25 │ 
apps-neevsk-web:lint:biome:     26 │ 	export type ReferenceDataEntry<
@repo/people:lint:biome:   > 37 │ 	}: any) => {

apps-edlove-web:lint:biome: 
@repo/payments:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:     26 │ 	export type ReferenceDataEntry<
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 

@repo/people:lint:biome:        │ 	   ^^^
@repo/people:lint:biome:     38 │ 		const colorClasses = {
apps-edlove-web:lint:biome: src\components\StructuredData.astro:7:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 

apps-gurudevi-marketing-web:lint:biome: .astro\content.d.ts:110:53 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     108 │ 	>;
apps-gurudevi-marketing-web:lint:biome:     109 │ 
apps-gurudevi-marketing-web:lint:biome:   > 110 │ 	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
apps-gurudevi-marketing-web:lint:biome:         │ 	                                                   ^^^

apps-neevsk-web:lint:biome: .astro\content.d.ts:110:53 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome:     39 │ 			primary:
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable normalized is unused.
apps-edlove-web:lint:biome:   
@repo/people:lint:biome:   

@repo/people:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-neevsk-web:lint:biome: 
apps-edlove-web:lint:biome:     6 │ const { data } = Astro.props;
apps-edlove-web:lint:biome:   > 7 │ const normalized = Array.isArray(data) ? data : [data];
@repo/people:lint:biome:   
@repo/people:lint:biome: 

apps-neevsk-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome:       │       ^^^^^^^^^^
apps-edlove-web:lint:biome:     8 │ ---

@repo/people:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome:     108 │ 	>;
apps-edlove-web:lint:biome:     9 │ 
@repo/people:lint:biome: 

@repo/people:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:     109 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
@repo/people:lint:biome:   

apps-neevsk-web:lint:biome:   > 110 │ 	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
apps-edlove-web:lint:biome:   
@repo/people:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/react-internal";␍
apps-neevsk-web:lint:biome:         │ 	                                                   ^^^
apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend normalized with an underscore.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     5 5 │   ␍
@repo/people:lint:biome:     2   │ - ␍
apps-neevsk-web:lint:biome:     111 │ 	type InferEntrySchema<C extends keyof DataEntryMap> = import('astro/zod').infer<

apps-edlove-web:lint:biome:     6 6 │   const { data } = Astro.props;␍
apps-edlove-web:lint:biome:     7   │ - const·normalized·=·Array.isArray(data)·?·data·:·[data];␍
@repo/people:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
apps-neevsk-web:lint:biome:     112 │ 		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>

apps-edlove-web:lint:biome:       7 │ + const·_normalized·=·Array.isArray(data)·?·data·:·[data];␍
@repo/people:lint:biome:     4   │ - export·default·[...config];␍
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:     8 8 │   

apps-edlove-web:lint:biome:   
@repo/people:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/react-internal';
apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome: 
@repo/people:lint:biome:       2 │ + 

apps-neevsk-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Welcome.astro:2:8 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/people:lint:biome:       4 │ + export·default·[...config];
apps-neevsk-web:lint:biome: .astro\content.d.ts:120:5 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This import is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:   > 2 │ import astroLogo from "../assets/astro.svg";
apps-edlove-web:lint:biome:       │        ^^^^^^^^^

apps-edlove-web:lint:biome:     3 │ import background from "../assets/background.svg";
apps-edlove-web:lint:biome:     4 │ ---
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unsafe fix: Remove the unused imports.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1   │ - 
apps-edlove-web:lint:biome:     2   │ - import·astroLogo·from·"../assets/astro.svg";␍
apps-edlove-web:lint:biome:       1 │ + ␍
apps-edlove-web:lint:biome:     3 2 │   import background from "../assets/background.svg";␍

apps-edlove-web:lint:biome:     4 3 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\Welcome.astro:3:8 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This import is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:     2 │ import astroLogo from "../assets/astro.svg";
apps-edlove-web:lint:biome:   > 3 │ import background from "../assets/background.svg";
apps-edlove-web:lint:biome:       │        ^^^^^^^^^^
apps-edlove-web:lint:biome:     4 │ ---

apps-edlove-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
apps-edlove-web:lint:biome:   
@repo/people:lint:biome:     5 5 │   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   i Unsafe fix: Remove the unused imports.
@repo/people:lint:biome:   
apps-neevsk-web:lint:biome:   

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1 1 │   
@repo/people:lint:biome: 
apps-neevsk-web:lint:biome:     118 │ 	> = L extends { schema: import('astro/zod').ZodSchema }
apps-edlove-web:lint:biome:     2   │ - import·astroLogo·from·"../assets/astro.svg";␍
@repo/people:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-neevsk-web:lint:biome:     119 │ 		? import('astro/zod').infer<L['schema']>
apps-neevsk-web:lint:biome:   > 120 │ 		: any;
apps-edlove-web:lint:biome:     3   │ - import·background·from·"../assets/background.svg";␍
apps-edlove-web:lint:biome:       2 │ + import·astroLogo·from·"../assets/astro.svg";␍
apps-edlove-web:lint:biome:     4 3 │   
@repo/people:lint:biome: 
apps-neevsk-web:lint:biome:         │ 		  ^^^

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:     121 │ 
apps-neevsk-web:lint:biome:     122 │ 	type DataEntryMap = {
apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome:   

@repo/people:lint:biome:      1    │ - {␍
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      1    │ - {␍
apps-edlove-web:lint:biome:      2    │ - ··"name":·"apps-edlove-web",␍
apps-edlove-web:lint:biome:      3    │ - ··"type":·"module",␍

apps-neevsk-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\components\FlameCard.astro:9:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/people:lint:biome:      2    │ - ··"name":·"@repo/people",␍
apps-neevsk-web:lint:biome: 
@repo/people:lint:biome:      3    │ - ··"version":·"0.0.1",␍

apps-neevsk-web:lint:biome:   ! This variable title is unused.
@repo/people:lint:biome:      4    │ - ··"main":·"src/index.ts",␍
@repo/people:lint:biome:      5    │ - ··"types":·"src/index.ts",␍
@repo/people:lint:biome:      6    │ - ··"exports":·{␍
@repo/people:lint:biome:      7    │ - ····".":·"./src/index.ts",␍

@repo/people:lint:biome:      8    │ - ····"./directory":·"./src/directory.ts",␍
@repo/people:lint:biome:      9    │ - ····"./feedback":·"./src/feedback.ts",␍
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      7 │ }
apps-neevsk-web:lint:biome:      8 │ 
apps-neevsk-web:lint:biome:    > 9 │ const { title, description, tags = [], variant = "blue" } = Astro.props;
apps-edlove-web:lint:biome:      4    │ - ··"version":·"0.0.1",␍

apps-neevsk-web:lint:biome:        │         ^^^^^
apps-edlove-web:lint:biome:      5    │ - ··"scripts":·{␍
apps-neevsk-web:lint:biome:     10 │ 
apps-edlove-web:lint:biome:      6    │ - ····"dev":·"pnpm·exec·astro·dev",␍

apps-neevsk-web:lint:biome:     11 │ const _variantClass =
apps-edlove-web:lint:biome:      7    │ - ····"build":·"pnpm·exec·astro·build",␍
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:      8    │ - ····"preview":·"pnpm·exec·astro·preview",␍

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-edlove-web:lint:biome:      9    │ - ····"astro":·"pnpm·exec·astro",␍
apps-neevsk-web:lint:biome: src\components\StructuredData.astro:3:23 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome:     10    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
apps-neevsk-web:lint:biome: 
apps-edlove-web:lint:biome:     11    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
apps-neevsk-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:     12    │ - ····"lint:biome":·"biome·check·.",␍

apps-edlove-web:lint:biome:     13    │ - ····"lint:eslint":·"eslint·.",␍
apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome:     14    │ - ····"format":·"biome·format·--write·.",␍
apps-neevsk-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:     15    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
apps-neevsk-web:lint:biome:     2 │ interface Props {
apps-edlove-web:lint:biome:     16    │ - ····"test":·"vitest·run",␍
apps-neevsk-web:lint:biome:   > 3 │ 	data: Record<string, any> | Array<Record<string, any>>;
apps-edlove-web:lint:biome:     17    │ - ····"test:watch":·"vitest",␍
apps-neevsk-web:lint:biome:       │ 	                     ^^^
apps-edlove-web:lint:biome:     18    │ - ····"test:ui":·"vitest·--ui",␍
apps-neevsk-web:lint:biome:     4 │ }

apps-edlove-web:lint:biome:     19    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
apps-neevsk-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:     20    │ - ··},␍
apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome:     21    │ - ··"dependencies":·{␍
apps-neevsk-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:     22    │ - ····"@astrojs/check":·"^0.9.8",␍
apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome:     23    │ - ····"@astrojs/sitemap":·"^3.6.0",␍
apps-neevsk-web:lint:biome: 
apps-edlove-web:lint:biome:     24    │ - ····"@astrojs/svelte":·"^8.0.5",␍
apps-neevsk-web:lint:biome: src\components\StructuredData.astro:3:51 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome:     25    │ - ····"@tailwindcss/vite":·"^4.1.18",␍
apps-neevsk-web:lint:biome: 
apps-edlove-web:lint:biome:     26    │ - ····"@types/three":·"^0.182.0",␍
apps-neevsk-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:     27    │ - ····"astro":·"^6.1.7",␍

apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome:     28    │ - ····"svelte":·"^5.55.4",␍
apps-edlove-web:lint:biome:     29    │ - ····"tailwindcss":·"^4.1.18",␍
apps-edlove-web:lint:biome:     30    │ - ····"three":·"^0.182.0",␍
apps-edlove-web:lint:biome:     31    │ - ····"typescript":·"^5.9.3"␍
apps-edlove-web:lint:biome:     32    │ - ··},␍

apps-edlove-web:lint:biome:     33    │ - ··"devDependencies":·{␍
apps-edlove-web:lint:biome:     34    │ - ····"@repo/eslint-config":·"workspace:^",␍
apps-edlove-web:lint:biome:     35    │ - ····"@repo/typescript-config":·"workspace:*",␍
apps-edlove-web:lint:biome:     36    │ - ····"vitest":·"^2.1.9",␍
apps-edlove-web:lint:biome:     37    │ - ····"vite-tsconfig-paths":·"^6.1.1",␍
apps-edlove-web:lint:biome:     38    │ - ····"eslint":·"^9.38.0"␍
apps-edlove-web:lint:biome:     39    │ - ··}␍

apps-edlove-web:lint:biome:     40    │ - }␍
apps-neevsk-web:lint:biome:     1 │ ---
apps-edlove-web:lint:biome:         1 │ + {
apps-neevsk-web:lint:biome:     2 │ interface Props {
apps-edlove-web:lint:biome:         2 │ + ··"name":·"apps-edlove-web",
apps-neevsk-web:lint:biome:   > 3 │ 	data: Record<string, any> | Array<Record<string, any>>;
apps-edlove-web:lint:biome:         3 │ + ··"type":·"module",
apps-neevsk-web:lint:biome:       │ 	                                                 ^^^
apps-edlove-web:lint:biome:         4 │ + ··"version":·"0.0.1",
apps-neevsk-web:lint:biome:     4 │ }

apps-neevsk-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:         5 │ + ··"scripts":·{
apps-neevsk-web:lint:biome:   
apps-edlove-web:lint:biome:         6 │ + ····"dev":·"pnpm·exec·astro·dev",
apps-neevsk-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: .astro\collections\archive.schema.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      1    │ - {␍
apps-neevsk-web:lint:biome:      2    │ - ··"$schema":·"https://json-schema.org/draft/2020-12/schema",␍
apps-neevsk-web:lint:biome:      3    │ - ··"type":·"object",␍
apps-neevsk-web:lint:biome:      4    │ - ··"properties":·{␍
apps-neevsk-web:lint:biome:      5    │ - ····"title":·{␍
apps-neevsk-web:lint:biome:      6    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:      7    │ - ····},␍
apps-neevsk-web:lint:biome:      8    │ - ····"subtitle":·{␍
apps-neevsk-web:lint:biome:      9    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:     10    │ - ····},␍

apps-neevsk-web:lint:biome:     11    │ - ····"publishDate":·{␍
apps-neevsk-web:lint:biome:     12    │ - ······"type":·"string",␍
apps-neevsk-web:lint:biome:     13    │ - ······"format":·"date-time"␍
apps-neevsk-web:lint:biome:     14    │ - ····},␍
apps-neevsk-web:lint:biome:     15    │ - ····"tags":·{␍
apps-neevsk-web:lint:biome:     16    │ - ······"default":·[],␍
apps-neevsk-web:lint:biome:     17    │ - ······"type":·"array",␍
apps-neevsk-web:lint:biome:     18    │ - ······"items":·{␍
apps-neevsk-web:lint:biome:     19    │ - ········"type":·"string"␍

apps-neevsk-web:lint:biome:     20    │ - ······}␍
apps-neevsk-web:lint:biome:     21    │ - ····},␍
apps-neevsk-web:lint:biome:     22    │ - ····"draft":·{␍
apps-neevsk-web:lint:biome:     23    │ - ······"default":·false,␍
apps-neevsk-web:lint:biome:     24    │ - ······"type":·"boolean"␍
apps-neevsk-web:lint:biome:     25    │ - ····},␍
apps-neevsk-web:lint:biome:     26    │ - ····"$schema":·{␍
apps-neevsk-web:lint:biome:     27    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:     28    │ - ····}␍

apps-neevsk-web:lint:biome:     29    │ - ··},␍
apps-neevsk-web:lint:biome:     30    │ - ··"required":·[␍
apps-neevsk-web:lint:biome:     31    │ - ····"title",␍
apps-neevsk-web:lint:biome:     32    │ - ····"publishDate"␍
apps-neevsk-web:lint:biome:     33    │ - ··]␍
apps-neevsk-web:lint:biome:     34    │ - }
apps-neevsk-web:lint:biome:         1 │ + {
apps-neevsk-web:lint:biome:         2 │ + ··"$schema":·"https://json-schema.org/draft/2020-12/schema",
apps-neevsk-web:lint:biome:         3 │ + ··"type":·"object",

apps-neevsk-web:lint:biome:         4 │ + ··"properties":·{
apps-neevsk-web:lint:biome:         5 │ + ····"title":·{
apps-neevsk-web:lint:biome:         6 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:         7 │ + ····},
apps-neevsk-web:lint:biome:         8 │ + ····"subtitle":·{
apps-neevsk-web:lint:biome:         9 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:        10 │ + ····},
apps-neevsk-web:lint:biome:        11 │ + ····"publishDate":·{
apps-neevsk-web:lint:biome:        12 │ + ······"type":·"string",
apps-neevsk-web:lint:biome:        13 │ + ······"format":·"date-time"

apps-neevsk-web:lint:biome:        14 │ + ····},
apps-neevsk-web:lint:biome:        15 │ + ····"tags":·{
apps-neevsk-web:lint:biome:        16 │ + ······"default":·[],
apps-neevsk-web:lint:biome:        17 │ + ······"type":·"array",
apps-neevsk-web:lint:biome:        18 │ + ······"items":·{
apps-neevsk-web:lint:biome:        19 │ + ········"type":·"string"
apps-neevsk-web:lint:biome:        20 │ + ······}
apps-neevsk-web:lint:biome:        21 │ + ····},
apps-neevsk-web:lint:biome:        22 │ + ····"draft":·{
apps-neevsk-web:lint:biome:        23 │ + ······"default":·false,
apps-neevsk-web:lint:biome:        24 │ + ······"type":·"boolean"

apps-neevsk-web:lint:biome:        25 │ + ····},
@repo/library:lint:biome: src\api\library.ts:187:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome:        26 │ + ····"$schema":·{
@repo/library:lint:biome: 
apps-neevsk-web:lint:biome:        27 │ + ······"type":·"string"
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.

@repo/library:lint:biome:   
apps-neevsk-web:lint:biome:        28 │ + ····}
apps-neevsk-web:lint:biome:        29 │ + ··},
@repo/library:lint:biome:     185 │ 			throw new APIError("Failed to fetch resources", error.code, error);
apps-neevsk-web:lint:biome:        30 │ + ··"required":·["title",·"publishDate"]

apps-neevsk-web:lint:biome:        31 │ + }
@repo/library:lint:biome:     186 │ 		}
@repo/library:lint:biome:   > 187 │ 		return (data || []).map((resource: any) => ({
apps-neevsk-web:lint:biome:        32 │ + 
@repo/library:lint:biome:         │ 		                                   ^^^
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 

@repo/library:lint:biome:     188 │ 			...resource,
@repo/library:lint:biome:     189 │ 			creator_name:
apps-neevsk-web:lint:biome: .astro\collections\hall-of-flame.schema.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome:   
apps-neevsk-web:lint:biome: 
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:

@repo/library:lint:biome:   
@repo/library:lint:biome: 
apps-neevsk-web:lint:biome:   
@repo/library:lint:biome: src\api\library.ts:200:70 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome:      1    │ - {␍
@repo/library:lint:biome: 
apps-neevsk-web:lint:biome:      2    │ - ··"$schema":·"https://json-schema.org/draft/2020-12/schema",␍

@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
apps-neevsk-web:lint:biome:      3    │ - ··"type":·"object",␍
@repo/library:lint:biome:   
@repo/library:lint:biome:     198 │ 	 * @authority read Library
apps-neevsk-web:lint:biome:      4    │ - ··"properties":·{␍
apps-neevsk-web:lint:biome:      5    │ - ····"name":·{␍
@repo/library:lint:biome:     199 │ 	 */

@repo/library:lint:biome:   > 200 │ 	async searchMapUniverse(query: string, limit: number = 10): Promise<any[]> {
apps-neevsk-web:lint:biome:      6    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:      7    │ - ····},␍
@repo/library:lint:biome:         │ 	                                                                    ^^^
@repo/library:lint:biome:     201 │ 		const { data, error } = await supabase.rpc("search_map_universe", {
apps-neevsk-web:lint:biome:      8    │ - ····"subtitle":·{␍
@repo/library:lint:biome:     202 │ 			query_text: query,

@repo/library:lint:biome:   
apps-neevsk-web:lint:biome:      9    │ - ······"type":·"string"␍
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-neevsk-web:lint:biome:     10    │ - ····},␍
@repo/library:lint:biome:   
apps-neevsk-web:lint:biome:     11    │ - ····"chamber":·{␍
apps-neevsk-web:lint:biome:     12    │ - ······"type":·"string",␍
apps-neevsk-web:lint:biome:     13    │ - ······"enum":·[␍

apps-neevsk-web:lint:biome:     14    │ - ········"The·First·Light",␍
apps-neevsk-web:lint:biome:     15    │ - ········"Chamber·of·Love",␍
apps-neevsk-web:lint:biome:     16    │ - ········"Chamber·of·Tribute",␍
apps-neevsk-web:lint:biome:     17    │ - ········"Chamber·of·Mastery",␍
apps-neevsk-web:lint:biome:     18    │ - ········"Chamber·of·Inspiration·&·Respect",␍
apps-neevsk-web:lint:biome:     19    │ - ········"Chamber·of·Support"␍
apps-neevsk-web:lint:biome:     20    │ - ······]␍
apps-neevsk-web:lint:biome:     21    │ - ····},␍
apps-neevsk-web:lint:biome:     22    │ - ····"order":·{␍
apps-neevsk-web:lint:biome:     23    │ - ······"default":·0,␍
apps-neevsk-web:lint:biome:     24    │ - ······"type":·"number"␍

@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\library.ts:232:47 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 

@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     230 │ 			if (error) throw error;
@repo/library:lint:biome:     231 │ 			// Sort results by the order returned from SQLite
@repo/library:lint:biome:   > 232 │ 			const idMap = new Map((data || []).map((r: any) => [r.id, r]));
@repo/library:lint:biome:         │ 			                                           ^^^
@repo/library:lint:biome:     233 │ 			return ids
@repo/library:lint:biome:     234 │ 				.map((id) => idMap.get(id))
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/library:lint:biome:   
@repo/library:lint:biome: 
apps-neevsk-web:lint:biome:     25    │ - ····},␍
@repo/library:lint:biome: src\api\library.ts:274:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome:     26    │ - ····"draft":·{␍
@repo/library:lint:biome: 
apps-neevsk-web:lint:biome:     27    │ - ······"default":·false,␍
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
apps-neevsk-web:lint:biome:     28    │ - ······"type":·"boolean"␍

apps-neevsk-web:lint:biome:     29    │ - ····},␍
@repo/library:lint:biome:   
@repo/library:lint:biome:     272 │ 			);
apps-neevsk-web:lint:biome:     30    │ - ····"$schema":·{␍
apps-neevsk-web:lint:biome:     31    │ - ······"type":·"string"␍
@repo/library:lint:biome:     273 │ 		}
@repo/library:lint:biome:   > 274 │ 		return (data || []).map((resource: any) => ({
@repo/library:lint:biome:         │ 		                                   ^^^

@repo/library:lint:biome:     275 │ 			...resource,
@repo/library:lint:biome:     276 │ 			creator_name: resource.creator_name || "System",
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\library.ts:310:10 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   

@repo/library:lint:biome:     308 │ 			if (engagementData) {
apps-neevsk-web:lint:biome:     32    │ - ····}␍
@repo/library:lint:biome:     309 │ 				has_endorsed = engagementData.some(
apps-neevsk-web:lint:biome:     33    │ - ··},␍
@repo/library:lint:biome:   > 310 │ 					(e: any) => e.engagement_type === "endorse",
@repo/library:lint:biome:         │ 					    ^^^
apps-neevsk-web:lint:biome:     34    │ - ··"required":·[␍

@repo/library:lint:biome:     311 │ 				);
apps-neevsk-web:lint:biome:     35    │ - ····"name",␍
@repo/library:lint:biome:     312 │ 				has_bookmarked = engagementData.some(
apps-neevsk-web:lint:biome:     36    │ - ····"subtitle",␍
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 

@repo/library:lint:biome: src\api\library.ts:313:10 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:151:10 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/profile:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   i The computed expression can be simplified to a string literal.
@repo/library:lint:biome:   
@repo/profile:lint:biome:   
@repo/library:lint:biome:     311 │ 				);
@repo/library:lint:biome:     312 │ 				has_bookmarked = engagementData.some(
@repo/library:lint:biome:   > 313 │ 					(e: any) => e.engagement_type === "bookmark",

@repo/library:lint:biome:         │ 					    ^^^
@repo/profile:lint:biome:     150 │       const updates: Record<string, unknown> = {
@repo/library:lint:biome:     314 │ 				);
@repo/profile:lint:biome:   > 151 │         ['full_name']: fullName,
@repo/library:lint:biome:     315 │ 			}
@repo/profile:lint:biome:         │          ^^^^^^^^^^^
@repo/library:lint:biome:   
@repo/profile:lint:biome:     152 │         ['phone']: phone,
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:     153 │         ['bio']: bio,
@repo/library:lint:biome:   
@repo/profile:lint:biome:   
@repo/library:lint:biome: 
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/library:lint:biome: src\api\library.ts:654:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:   
@repo/library:lint:biome: 
@repo/profile:lint:biome:     151 │ ········['full_name']:·fullName,␍
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.

@repo/profile:lint:biome:         │         -           -           
@repo/library:lint:biome:   
@repo/profile:lint:biome: 
@repo/library:lint:biome:     652 │ 		}
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:152:10 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/library:lint:biome:     653 │ 		return (data || [])
@repo/profile:lint:biome: 

@repo/library:lint:biome:   > 654 │ 			.map((item: any) => {
@repo/library:lint:biome:         │ 			            ^^^
@repo/profile:lint:biome:   i The computed expression can be simplified to a string literal.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     150 │       const updates: Record<string, unknown> = {
@repo/profile:lint:biome:     151 │         ['full_name']: fullName,
@repo/profile:lint:biome:   > 152 │         ['phone']: phone,

@repo/profile:lint:biome:         │          ^^^^^^^

@repo/profile:lint:biome:     153 │         ['bio']: bio,
@repo/profile:lint:biome:     154 │         ['nic_number']: isStaff ? nicNumber : null,
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     152 │ ········['phone']:·phone,␍
@repo/profile:lint:biome:         │         -       -        
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:153:10 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   i The computed expression can be simplified to a string literal.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     151 │         ['full_name']: fullName,

@repo/profile:lint:biome:     152 │         ['phone']: phone,
@repo/profile:lint:biome:   > 153 │         ['bio']: bio,
@repo/profile:lint:biome:         │          ^^^^^
@repo/profile:lint:biome:     154 │         ['nic_number']: isStaff ? nicNumber : null,
@repo/profile:lint:biome:     155 │         ['index_number']: isStudent ? indexNumber : null,
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     153 │ ········['bio']:·bio,␍
@repo/profile:lint:biome:         │         -     -      

@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:154:10 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   i The computed expression can be simplified to a string literal.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     152 │         ['phone']: phone,
@repo/profile:lint:biome:     153 │         ['bio']: bio,
@repo/profile:lint:biome:   > 154 │         ['nic_number']: isStaff ? nicNumber : null,
@repo/profile:lint:biome:         │          ^^^^^^^^^^^^

@repo/library:lint:biome:     655 │ 				const resource = Array.isArray(item.resource)
@repo/profile:lint:biome:     155 │         ['index_number']: isStudent ? indexNumber : null,
@repo/library:lint:biome:     656 │ 					? item.resource[0]
@repo/profile:lint:biome:     156 │       };
@repo/library:lint:biome:   
@repo/profile:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/library:lint:biome:   
@repo/profile:lint:biome:   
@repo/library:lint:biome: 
@repo/profile:lint:biome:     154 │ ········['nic_number']:·isStaff·?·nicNumber·:·null,␍

@repo/library:lint:biome: src\api\library.ts:666:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:         │         -            -                             
@repo/library:lint:biome: 
@repo/profile:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:155:10 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/library:lint:biome:   
@repo/profile:lint:biome: 
@repo/library:lint:biome:     664 │ 				} as LibraryResource;

@repo/library:lint:biome:     665 │ 			})
@repo/profile:lint:biome:   i The computed expression can be simplified to a string literal.
@repo/library:lint:biome:   > 666 │ 			.filter((r: any): r is LibraryResource => r !== null);
@repo/profile:lint:biome:   
@repo/library:lint:biome:         │ 			            ^^^
@repo/profile:lint:biome:     153 │         ['bio']: bio,
@repo/library:lint:biome:     667 │ 	},
@repo/profile:lint:biome:     154 │         ['nic_number']: isStaff ? nicNumber : null,
@repo/library:lint:biome:     668 │ 	// ========================================================================
@repo/profile:lint:biome:   > 155 │         ['index_number']: isStudent ? indexNumber : null,
@repo/library:lint:biome:   
@repo/profile:lint:biome:         │          ^^^^^^^^^^^^^^
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:     156 │       };

@repo/library:lint:biome:   
@repo/profile:lint:biome:     157 │ 
@repo/profile:lint:biome:   
@repo/library:lint:biome: 
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/library:lint:biome: src\api\library.ts:728:41 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:   
@repo/library:lint:biome: 
@repo/profile:lint:biome:     155 │ ········['index_number']:·isStudent·?·indexNumber·:·null,␍
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:         │         -              -                                 
@repo/library:lint:biome:   
@repo/profile:lint:biome: 
@repo/library:lint:biome:     726 │ 		// Map explicit collections with their resources
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:163:19 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/library:lint:biome:     727 │ 		const explicitCollections = await Promise.all(
@repo/profile:lint:biome: 
@repo/library:lint:biome:   > 728 │ 			(explicitData || []).map(async (col: any) => {
@repo/profile:lint:biome:   i The computed expression can be simplified without the use of a string literal.
@repo/library:lint:biome:         │ 			                                     ^^^
@repo/profile:lint:biome:   

@repo/library:lint:biome:     729 │ 				let nodeIds = (col.collection_nodes || []).map((cn: any) => cn.node_id);
@repo/profile:lint:biome:     161 │             local_uri: avatarUrl,
@repo/library:lint:biome:     730 │ 				if (asOf) {
@repo/profile:lint:biome:     162 │           })) as UserProfile;
@repo/library:lint:biome:   
@repo/profile:lint:biome:   > 163 │           updates['avatar_url'] = updatedProfile['avatar_url'];
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:         │                   ^^^^^^^^^^^^
@repo/library:lint:biome:   
@repo/profile:lint:biome:     164 │         } catch (uploadError) {
@repo/library:lint:biome: 
@repo/profile:lint:biome:     165 │           handleAPIError(uploadError);
@repo/library:lint:biome: src\api\library.ts:729:57 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:   

@repo/library:lint:biome: 
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/library:lint:biome:   
@repo/profile:lint:biome:     161 161 │               local_uri: avatarUrl,␍
@repo/library:lint:biome:     727 │ 		const explicitCollections = await Promise.all(
@repo/profile:lint:biome:     162 162 │             })) as UserProfile;␍
@repo/library:lint:biome:     728 │ 			(explicitData || []).map(async (col: any) => {
@repo/profile:lint:biome:     163     │ - ··········updates['avatar_url']·=·updatedProfile['avatar_url'];␍
@repo/library:lint:biome:   > 729 │ 				let nodeIds = (col.collection_nodes || []).map((cn: any) => cn.node_id);
@repo/profile:lint:biome:         163 │ + ··········updates.avatar_url·=·updatedProfile['avatar_url'];␍

@repo/library:lint:biome:         │ 				                                                    ^^^
@repo/profile:lint:biome:     164 164 │           } catch (uploadError) {␍
@repo/library:lint:biome:     730 │ 				if (asOf) {
@repo/profile:lint:biome:     165 165 │             handleAPIError(uploadError);␍
@repo/library:lint:biome:     731 │ 					const { data: membershipData, error: membershipError } =
@repo/profile:lint:biome:   
@repo/library:lint:biome:   
@repo/profile:lint:biome: 
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:163:50 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/library:lint:biome:   
@repo/profile:lint:biome: 

@repo/library:lint:biome: 
@repo/profile:lint:biome:   i The computed expression can be simplified without the use of a string literal.
@repo/library:lint:biome: src\api\library.ts:743:51 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     741 │ 						);
@repo/library:lint:biome:     742 │ 					}
@repo/library:lint:biome:   > 743 │ 					nodeIds = (membershipData || []).map((entry: any) => entry.node_id);
@repo/profile:lint:biome:   
@repo/library:lint:biome:         │ 					                                             ^^^
@repo/profile:lint:biome:     161 │             local_uri: avatarUrl,
@repo/library:lint:biome:     744 │ 				}
@repo/profile:lint:biome:     162 │           })) as UserProfile;
@repo/library:lint:biome:     745 │ 				if (nodeIds.length === 0 && col.resource_ids?.length > 0) {
@repo/profile:lint:biome:   > 163 │           updates['avatar_url'] = updatedProfile['avatar_url'];
@repo/library:lint:biome:   
@repo/profile:lint:biome:         │                                                  ^^^^^^^^^^^^
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:     164 │         } catch (uploadError) {
@repo/library:lint:biome:   
@repo/profile:lint:biome:     165 │           handleAPIError(uploadError);
@repo/library:lint:biome: 
@repo/profile:lint:biome:   
@repo/library:lint:biome: src\api\library.ts:783:52 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/library:lint:biome: 
@repo/profile:lint:biome:   
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:     161 161 │               local_uri: avatarUrl,␍
@repo/library:lint:biome:   
@repo/profile:lint:biome:     162 162 │             })) as UserProfile;␍
@repo/library:lint:biome:     781 │ 			if (filters.search) {
@repo/library:lint:biome:     782 │ 				const term = filters.search.toLowerCase();
@repo/library:lint:biome:   > 783 │ 				filteredSubjects = filteredSubjects.filter((s: any) =>
@repo/library:lint:biome:         │ 				                                               ^^^
@repo/profile:lint:biome:     163     │ - ··········updates['avatar_url']·=·updatedProfile['avatar_url'];␍
@repo/library:lint:biome:     784 │ 					s.subject.toLowerCase().includes(term),
@repo/profile:lint:biome:         163 │ + ··········updates['avatar_url']·=·updatedProfile.avatar_url;␍
@repo/library:lint:biome:     785 │ 				);
@repo/profile:lint:biome:     164 164 │           } catch (uploadError) {␍
@repo/library:lint:biome:   
@repo/profile:lint:biome:     165 165 │             handleAPIError(uploadError);␍
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/library:lint:biome:   
@repo/profile:lint:biome: 
@repo/library:lint:biome: 
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:171:17 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/library:lint:biome: src\api\library.ts:786:48 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/library:lint:biome: 
@repo/profile:lint:biome:   i The computed expression can be simplified without the use of a string literal.
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/library:lint:biome:   
@repo/profile:lint:biome:     169 │         (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))
@repo/library:lint:biome:     784 │ 					s.subject.toLowerCase().includes(term),
@repo/profile:lint:biome:     170 │       ) {
@repo/library:lint:biome:     785 │ 				);
@repo/profile:lint:biome:   > 171 │         updates['avatar_url'] = avatarUrl;
@repo/library:lint:biome:   > 786 │ 				filteredTopics = filteredTopics.filter((t: any) =>
@repo/profile:lint:biome:         │                 ^^^^^^^^^^^^
@repo/library:lint:biome:         │ 				                                           ^^^
@repo/profile:lint:biome:     172 │       }
@repo/library:lint:biome:     787 │ 					t.topic.toLowerCase().includes(term),
@repo/profile:lint:biome:     173 │ 
@repo/library:lint:biome:     788 │ 				);
@repo/profile:lint:biome:   
@repo/library:lint:biome:   
@repo/profile:lint:biome:   i Unsafe fix: Use a literal key instead.
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/library:lint:biome:   
@repo/profile:lint:biome:     169 169 │           (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))␍
@repo/library:lint:biome: 
@repo/profile:lint:biome:     170 170 │         ) {␍
@repo/library:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:     171     │ - ········updates['avatar_url']·=·avatarUrl;␍
@repo/library:lint:biome: 
@repo/profile:lint:biome:         171 │ + ········updates.avatar_url·=·avatarUrl;␍
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:     172 172 │         }␍
@repo/profile:lint:biome:     173 173 │   ␍
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:2:57 lint/correctness/noUnusedImports  FIXABLE  ━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Several of these imports are unused.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     1 │ import { profileAPI } from '@repo/core/api';
apps-edlove-web:lint:biome:         7 │ + ····"build":·"pnpm·exec·astro·build",
@repo/profile:lint:biome:   > 2 │ import { handleAPIError, type Capacity, usePermissions, useAuth } from '@repo/core/logic';
apps-edlove-web:lint:biome:         8 │ + ····"preview":·"pnpm·exec·astro·preview",
@repo/profile:lint:biome:       │                                                         ^^^^^^^
@repo/library:lint:biome:   
apps-neevsk-web:lint:biome:     37    │ - ····"chamber"␍
apps-neevsk-web:lint:biome:     38    │ - ··]␍
apps-neevsk-web:lint:biome:     39    │ - }
apps-neevsk-web:lint:biome:         1 │ + {
apps-neevsk-web:lint:biome:         2 │ + ··"$schema":·"https://json-schema.org/draft/2020-12/schema",
apps-neevsk-web:lint:biome:         3 │ + ··"type":·"object",
apps-neevsk-web:lint:biome:         4 │ + ··"properties":·{
apps-neevsk-web:lint:biome:         5 │ + ····"name":·{
apps-neevsk-web:lint:biome:         6 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:         7 │ + ····},
apps-neevsk-web:lint:biome:         8 │ + ····"subtitle":·{
apps-neevsk-web:lint:biome:         9 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:        10 │ + ····},
apps-neevsk-web:lint:biome:        11 │ + ····"chamber":·{
apps-neevsk-web:lint:biome:        12 │ + ······"type":·"string",
apps-neevsk-web:lint:biome:        13 │ + ······"enum":·[
apps-neevsk-web:lint:biome:        14 │ + ········"The·First·Light",
apps-neevsk-web:lint:biome:        15 │ + ········"Chamber·of·Love",
apps-neevsk-web:lint:biome:        16 │ + ········"Chamber·of·Tribute",
apps-neevsk-web:lint:biome:        17 │ + ········"Chamber·of·Mastery",
apps-neevsk-web:lint:biome:        18 │ + ········"Chamber·of·Inspiration·&·Respect",
apps-neevsk-web:lint:biome:        19 │ + ········"Chamber·of·Support"
apps-neevsk-web:lint:biome:        20 │ + ······]
apps-neevsk-web:lint:biome:        21 │ + ····},
apps-neevsk-web:lint:biome:        22 │ + ····"order":·{
apps-neevsk-web:lint:biome:        23 │ + ······"default":·0,
apps-neevsk-web:lint:biome:        24 │ + ······"type":·"number"
apps-neevsk-web:lint:biome:        25 │ + ····},
apps-neevsk-web:lint:biome:        26 │ + ····"draft":·{
apps-neevsk-web:lint:biome:        27 │ + ······"default":·false,
apps-neevsk-web:lint:biome:        28 │ + ······"type":·"boolean"
apps-neevsk-web:lint:biome:        29 │ + ····},
apps-neevsk-web:lint:biome:        30 │ + ····"$schema":·{
apps-neevsk-web:lint:biome:        31 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:        32 │ + ····}
apps-neevsk-web:lint:biome:        33 │ + ··},
apps-neevsk-web:lint:biome:        34 │ + ··"required":·["name",·"subtitle",·"chamber"]
apps-neevsk-web:lint:biome:        35 │ + }
apps-neevsk-web:lint:biome:        36 │ + 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: .astro\collections\projects.schema.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      1    │ - {␍
apps-neevsk-web:lint:biome:      2    │ - ··"$schema":·"https://json-schema.org/draft/2020-12/schema",␍
apps-neevsk-web:lint:biome:      3    │ - ··"type":·"object",␍
apps-neevsk-web:lint:biome:      4    │ - ··"properties":·{␍
apps-neevsk-web:lint:biome:      5    │ - ····"title":·{␍
apps-neevsk-web:lint:biome:      6    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:      7    │ - ····},␍
apps-neevsk-web:lint:biome:      8    │ - ····"description":·{␍
apps-neevsk-web:lint:biome:      9    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:     10    │ - ····},␍
apps-neevsk-web:lint:biome:     11    │ - ····"role":·{␍
apps-neevsk-web:lint:biome:     12    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:     13    │ - ····},␍
apps-neevsk-web:lint:biome:     14    │ - ····"tech":·{␍
apps-neevsk-web:lint:biome:     15    │ - ······"type":·"array",␍
apps-neevsk-web:lint:biome:     16    │ - ······"items":·{␍
apps-neevsk-web:lint:biome:     17    │ - ········"type":·"string"␍
apps-neevsk-web:lint:biome:     18    │ - ······}␍
apps-neevsk-web:lint:biome:     19    │ - ····},␍
apps-neevsk-web:lint:biome:     20    │ - ····"link":·{␍
apps-neevsk-web:lint:biome:     21    │ - ······"type":·"string",␍
apps-neevsk-web:lint:biome:     22    │ - ······"format":·"uri"␍
apps-neevsk-web:lint:biome:     23    │ - ····},␍
apps-neevsk-web:lint:biome:     24    │ - ····"order":·{␍
apps-neevsk-web:lint:biome:     25    │ - ······"default":·0,␍
apps-neevsk-web:lint:biome:     26    │ - ······"type":·"number"␍
apps-neevsk-web:lint:biome:     27    │ - ····},␍
apps-neevsk-web:lint:biome:     28    │ - ····"draft":·{␍
apps-neevsk-web:lint:biome:     29    │ - ······"default":·false,␍
apps-neevsk-web:lint:biome:     30    │ - ······"type":·"boolean"␍
apps-neevsk-web:lint:biome:     31    │ - ····},␍
apps-neevsk-web:lint:biome:     32    │ - ····"$schema":·{␍
apps-neevsk-web:lint:biome:     33    │ - ······"type":·"string"␍
apps-neevsk-web:lint:biome:     34    │ - ····}␍
apps-neevsk-web:lint:biome:     35    │ - ··},␍
apps-neevsk-web:lint:biome:     36    │ - ··"required":·[␍
apps-neevsk-web:lint:biome:     37    │ - ····"title",␍
apps-neevsk-web:lint:biome:     38    │ - ····"description",␍
apps-neevsk-web:lint:biome:     39    │ - ····"role",␍
apps-neevsk-web:lint:biome:     40    │ - ····"tech"␍
apps-neevsk-web:lint:biome:     41    │ - ··]␍
apps-neevsk-web:lint:biome:     42    │ - }
apps-neevsk-web:lint:biome:         1 │ + {
apps-neevsk-web:lint:biome:         2 │ + ··"$schema":·"https://json-schema.org/draft/2020-12/schema",
apps-neevsk-web:lint:biome:         3 │ + ··"type":·"object",
apps-neevsk-web:lint:biome:         4 │ + ··"properties":·{
apps-neevsk-web:lint:biome:         5 │ + ····"title":·{
apps-neevsk-web:lint:biome:         6 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:         7 │ + ····},
apps-neevsk-web:lint:biome:         8 │ + ····"description":·{
apps-neevsk-web:lint:biome:         9 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:        10 │ + ····},
apps-neevsk-web:lint:biome:        11 │ + ····"role":·{
apps-neevsk-web:lint:biome:        12 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:        13 │ + ····},
apps-neevsk-web:lint:biome:        14 │ + ····"tech":·{
apps-neevsk-web:lint:biome:        15 │ + ······"type":·"array",
apps-neevsk-web:lint:biome:        16 │ + ······"items":·{
apps-neevsk-web:lint:biome:        17 │ + ········"type":·"string"
apps-neevsk-web:lint:biome:        18 │ + ······}
apps-neevsk-web:lint:biome:        19 │ + ····},
apps-neevsk-web:lint:biome:        20 │ + ····"link":·{
apps-neevsk-web:lint:biome:        21 │ + ······"type":·"string",
apps-neevsk-web:lint:biome:        22 │ + ······"format":·"uri"
apps-neevsk-web:lint:biome:        23 │ + ····},
apps-neevsk-web:lint:biome:        24 │ + ····"order":·{
apps-neevsk-web:lint:biome:        25 │ + ······"default":·0,
apps-neevsk-web:lint:biome:        26 │ + ······"type":·"number"
apps-neevsk-web:lint:biome:        27 │ + ····},
apps-neevsk-web:lint:biome:        28 │ + ····"draft":·{
apps-neevsk-web:lint:biome:        29 │ + ······"default":·false,
apps-neevsk-web:lint:biome:        30 │ + ······"type":·"boolean"
apps-neevsk-web:lint:biome:        31 │ + ····},
apps-neevsk-web:lint:biome:        32 │ + ····"$schema":·{
apps-neevsk-web:lint:biome:        33 │ + ······"type":·"string"
apps-neevsk-web:lint:biome:        34 │ + ····}
apps-neevsk-web:lint:biome:        35 │ + ··},
apps-neevsk-web:lint:biome:        36 │ + ··"required":·["title",·"description",·"role",·"tech"]
apps-neevsk-web:lint:biome:        37 │ + }
apps-neevsk-web:lint:biome:        38 │ + 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: .astro\content-assets.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     1   │ - export·default·new·Map();
apps-neevsk-web:lint:biome:       1 │ + export·default·new·Map();
apps-neevsk-web:lint:biome:       2 │ + 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: .astro\content-modules.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     1   │ - export·default·new·Map();
apps-neevsk-web:lint:biome:       1 │ + export·default·new·Map();
apps-neevsk-web:lint:biome:       2 │ + 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: .astro\data-store.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-edlove-web:lint:biome:         9 │ + ····"astro":·"pnpm·exec·astro",
@repo/profile:lint:biome:     3 │ import {
@repo/profile:lint:biome:     4 │   Box,
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i Unused imports might be the result of an incomplete refactoring.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i Unsafe fix: Remove the unused imports.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     2 │ import·{·handleAPIError,·type·Capacity,·usePermissions,·useAuth·}·from·'@repo/core/logic';␍
@repo/profile:lint:biome:       │                                                         --------                          
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:17:8 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     16 │ interface EditableItemProps {
@repo/profile:lint:biome:   > 17 │ 	icon: any;
@repo/profile:lint:biome:        │ 	      ^^^
@repo/profile:lint:biome:     18 │ 	label: string;
@repo/profile:lint:biome:     19 │ 	value?: string;
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:22:33 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     20 │ 	field: string;
@repo/profile:lint:biome:     21 │ 	placeholder?: string;
apps-edlove-web:lint:biome:        10 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/profile:lint:biome:   > 22 │ 	onSave: (field: string, value: any) => Promise<any>;
apps-edlove-web:lint:biome:        11 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/profile:lint:biome:        │ 	                               ^^^
apps-edlove-web:lint:biome:        12 │ + ····"lint:biome":·"biome·check·.",
@repo/profile:lint:biome:     23 │ 	multiline?: boolean;
apps-edlove-web:lint:biome:        13 │ + ····"lint:eslint":·"eslint·.",
@repo/profile:lint:biome:     24 │ 	disabled?: boolean;
apps-edlove-web:lint:biome:        14 │ + ····"format":·"biome·format·--write·.",
@repo/profile:lint:biome:   
apps-edlove-web:lint:biome:        15 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:        16 │ + ····"test":·"vitest·run",
@repo/library:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/react-internal";␍
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:22:49 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
apps-edlove-web:lint:biome:        17 │ + ····"test:watch":·"vitest",
apps-edlove-web:lint:biome:        18 │ + ····"test:ui":·"vitest·--ui",
apps-edlove-web:lint:biome:        19 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
apps-edlove-web:lint:biome:        20 │ + ··},
@repo/library:lint:biome:     2   │ - ␍
@repo/library:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:        21 │ + ··"dependencies":·{
apps-edlove-web:lint:biome:        22 │ + ····"@astrojs/check":·"^0.9.8",
@repo/library:lint:biome:     4   │ - export·default·[...config];␍
@repo/profile:lint:biome:   
apps-edlove-web:lint:biome:        23 │ + ····"@astrojs/sitemap":·"^3.6.0",
@repo/library:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/react-internal';
@repo/profile:lint:biome:     20 │ 	field: string;
@repo/profile:lint:biome:     21 │ 	placeholder?: string;
apps-edlove-web:lint:biome:        24 │ + ····"@astrojs/svelte":·"^8.0.5",
apps-edlove-web:lint:biome:        25 │ + ····"@tailwindcss/vite":·"^4.1.18",
@repo/library:lint:biome:       2 │ + 
@repo/profile:lint:biome:   > 22 │ 	onSave: (field: string, value: any) => Promise<any>;
apps-edlove-web:lint:biome:        26 │ + ····"@types/three":·"^0.182.0",
@repo/library:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/library:lint:biome:       4 │ + export·default·[...config];
@repo/profile:lint:biome:        │ 	                                               ^^^
apps-edlove-web:lint:biome:        27 │ + ····"astro":·"^6.1.7",
apps-gurudevi-marketing-web:lint:biome:     111 │ 	type InferEntrySchema<C extends keyof DataEntryMap> = import('astro/zod').infer<
@repo/library:lint:biome:     5 5 │   
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:        28 │ + ····"svelte":·"^5.55.4",
@repo/library:lint:biome:   
apps-edlove-web:lint:biome:        29 │ + ····"tailwindcss":·"^4.1.18",
@repo/library:lint:biome:      1    │ - {␍
apps-edlove-web:lint:biome:        30 │ + ····"three":·"^0.182.0",
@repo/library:lint:biome:      2    │ - ··"name":·"@repo/library",␍
apps-edlove-web:lint:biome:        31 │ + ····"typescript":·"^5.9.3"
@repo/library:lint:biome:      3    │ - ··"version":·"0.0.1",␍
apps-edlove-web:lint:biome:        32 │ + ··},
@repo/library:lint:biome:      4    │ - ··"main":·"src/index.ts",␍
apps-edlove-web:lint:biome:        33 │ + ··"devDependencies":·{
@repo/library:lint:biome:      5    │ - ··"types":·"src/index.ts",␍
apps-edlove-web:lint:biome:        34 │ + ····"@repo/eslint-config":·"workspace:^",
@repo/library:lint:biome:      6    │ - ··"exports":·{␍
apps-edlove-web:lint:biome:        35 │ + ····"@repo/typescript-config":·"workspace:*",
@repo/library:lint:biome:      7    │ - ····".":·"./src/index.ts",␍
apps-edlove-web:lint:biome:        36 │ + ····"vitest":·"^2.1.9",
@repo/library:lint:biome:      8    │ - ····"./components":·"./src/components/index.ts",␍
apps-edlove-web:lint:biome:        37 │ + ····"vite-tsconfig-paths":·"^6.1.1",
@repo/library:lint:biome:      9    │ - ····"./hooks":·"./src/hooks/index.ts",␍
apps-edlove-web:lint:biome:        38 │ + ····"eslint":·"^9.38.0"
@repo/library:lint:biome:     10    │ - ····"./screens":·"./src/screens/index.ts",␍
apps-edlove-web:lint:biome:        39 │ + ··}
@repo/library:lint:biome:     11    │ - ····"./types":·"./src/types/index.ts",␍
apps-edlove-web:lint:biome:        40 │ + }
@repo/library:lint:biome:     12    │ - ····"./api":·"./src/api/index.ts",␍
apps-edlove-web:lint:biome:     41 41 │   
@repo/library:lint:biome:     13    │ - ····"./utils":·"./src/utils/index.ts",␍
apps-edlove-web:lint:biome:   
@repo/library:lint:biome:     14    │ - ····"./screens/LibraryScreen.web":·"./src/screens/LibraryScreen.web.tsx",␍
apps-edlove-web:lint:biome: 
@repo/library:lint:biome:     15    │ - ····"./screens/CollectionDetailScreen.web":·"./src/screens/CollectionDetailScreen.web.tsx",␍
apps-edlove-web:lint:biome: src\components\CinematicBackground.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome:     23 │ 	multiline?: boolean;
@repo/profile:lint:biome:     24 │ 	disabled?: boolean;
@repo/profile:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      1  1 │   ---␍
apps-edlove-web:lint:biome:      2    │ - interface·Props·{␍
@repo/library:lint:biome:     16    │ - ····"./screens/PDFViewerScreen.web":·"./src/screens/PDFViewerScreen.web.tsx",␍
apps-edlove-web:lint:biome:      3    │ - → showVideo?:·boolean;␍
@repo/library:lint:biome:     17    │ - ····"./screens/VideoPlayerScreen.web":·"./src/screens/VideoPlayerScreen.web.tsx",␍
apps-edlove-web:lint:biome:      4    │ - }␍
@repo/library:lint:biome:     18    │ - ····"./screens/MapScreen.web":·"./src/screens/MapScreen.web.tsx",␍
apps-edlove-web:lint:biome:      5    │ - ␍
@repo/library:lint:biome:     19    │ - ····"./screens/CuratorReviewScreen":·"./src/screens/CuratorReviewScreen.tsx",␍
apps-edlove-web:lint:biome:      6    │ - const·{·showVideo·=·false·}·=·Astro.props;␍
@repo/library:lint:biome:     20    │ - ····"./package.json":·"./package.json"␍
apps-edlove-web:lint:biome:         2 │ + interface·Props·{
@repo/library:lint:biome:     21    │ - ··},␍
apps-edlove-web:lint:biome:         3 │ + ··showVideo?:·boolean;
@repo/library:lint:biome:     22    │ - ··"scripts":·{␍
apps-edlove-web:lint:biome:         4 │ + }
@repo/library:lint:biome:     23    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
apps-edlove-web:lint:biome:         5 │ + 
@repo/library:lint:biome:     24    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
apps-edlove-web:lint:biome:         6 │ + const·{·showVideo·=·false·}·=·Astro.props;
@repo/library:lint:biome:     25    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist",␍
apps-edlove-web:lint:biome:      7  7 │   ---␍
@repo/library:lint:biome:     26    │ - ····"lint:biome":·"biome·check·.",␍
apps-edlove-web:lint:biome:      8  8 │   ␍
@repo/library:lint:biome:     27    │ - ····"lint:eslint":·"eslint·.",␍
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
@repo/library:lint:biome:     28    │ - ····"format":·"biome·format·--write·.",␍
apps-edlove-web:lint:biome: src\components\Welcome.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome:     29    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
apps-edlove-web:lint:biome: 
@repo/library:lint:biome:     30    │ - ····"test":·"vitest·run",␍
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:       1   1 │   ---␍
apps-edlove-web:lint:biome:       2     │ - import·astroLogo·from·"../assets/astro.svg";␍
apps-edlove-web:lint:biome:       3     │ - import·background·from·"../assets/background.svg";␍
apps-edlove-web:lint:biome:           2 │ + import·astroLogo·from·'../assets/astro.svg';
apps-edlove-web:lint:biome:           3 │ + import·background·from·'../assets/background.svg';
apps-edlove-web:lint:biome:       4   4 │   ---␍
apps-edlove-web:lint:biome:       5   5 │   ␍
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\content.config.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome:     112 │ 		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
apps-edlove-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      1    │ - import·{·defineCollection·}·from·"astro:content";␍
apps-edlove-web:lint:biome:      2    │ - import·{·glob·}·from·"astro/loaders";␍
apps-edlove-web:lint:biome:      3    │ - import·{·z·}·from·"astro/zod";␍
apps-edlove-web:lint:biome:      4    │ - ␍
apps-edlove-web:lint:biome:      5    │ - const·cosmos·=·defineCollection({␍
apps-edlove-web:lint:biome:      6    │ - → loader:·glob({·base:·"./src/content/cosmos",·pattern:·"**/*.{md,mdx}"·}),␍
apps-edlove-web:lint:biome:      7    │ - → schema:·z.object({␍
apps-edlove-web:lint:biome:      8    │ - → → title:·z.string(),␍
apps-edlove-web:lint:biome:      9    │ - → → subtitle:·z.string(),␍
apps-edlove-web:lint:biome:     10    │ - → → icon:·z.string(),␍
apps-edlove-web:lint:biome:     11    │ - → → order:·z.number().default(0),␍
apps-edlove-web:lint:biome:     12    │ - → → accentColor:·z.string().optional(),␍
apps-edlove-web:lint:biome:     13    │ - → → origin:·z.string().optional(),␍
apps-edlove-web:lint:biome:     14    │ - → → coreLogic:·z.string().optional(),␍
apps-edlove-web:lint:biome:     15    │ - → → draft:·z.boolean().default(false),␍
apps-edlove-web:lint:biome:     16    │ - → → publishDate:·z.date().optional(),␍
apps-edlove-web:lint:biome:     17    │ - → }),␍
apps-edlove-web:lint:biome:     18    │ - });␍
@repo/people:lint:biome:     10    │ - ····"./hooks":·"./src/hooks/index.ts",␍
@intuitui-labs/lk-edu-geo:lint:biome:     37 │ 	const headers = data[0];
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:31:8 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     29 │ 	geoSql += `${provinces
@intuitui-labs/lk-edu-geo:lint:biome:     30 │ 		.map(
@intuitui-labs/lk-edu-geo:lint:biome:   > 31 │ 			(p: any) =>
@intuitui-labs/lk-edu-geo:lint:biome:        │ 			    ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     32 │ 				`('${p.id}', '${escape(p.name)}', '${p.name_si || ""}', '${p.name_ta || ""}')`,
@intuitui-labs/lk-edu-geo:lint:biome:     33 │ 		)
@intuitui-labs/lk-edu-geo:lint:biome:   
@repo/payments:lint:biome: src\plugins\stripe.ts:10:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      8 │ 		amount: number,
@repo/payments:lint:biome:      9 │ 		currency: string,
@repo/payments:lint:biome:   > 10 │ 		metadata?: any,
@repo/payments:lint:biome:        │ 		           ^^^
@repo/payments:lint:biome:     11 │ 	): Promise<PaymentIntent> {
@repo/payments:lint:biome:     12 │ 		// In a real implementation, this would call Stripe API (via Edge Function)
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts:15:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     13 │ 	provider: string;
@repo/payments:lint:biome:     14 │ 	clientSecret?: string;
@repo/payments:lint:biome:   > 15 │ 	metadata?: Record<string, any>;
apps-edlove-web:lint:biome:     19    │ - ␍
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: src\components\EditableItem.tsx:84:17 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   ! Unexpected any. Specify a different type.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     82 │ 			await onSave(field, editValue);
@repo/profile:lint:biome:     83 │ 			setIsEditing(false);
@repo/profile:lint:biome:   > 84 │ 		} catch (err: any) {
@repo/profile:lint:biome:        │ 		              ^^^
@repo/profile:lint:biome:     85 │ 			setError(err?.message || "Failed to save");
@repo/profile:lint:biome:     86 │ 		} finally {
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/profile:lint:biome:   
@repo/profile:lint:biome: 
@repo/profile:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:   
@repo/profile:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/react-internal";␍
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
@repo/profile:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:     20    │ - const·library·=·defineCollection({␍
@repo/profile:lint:biome:   
@repo/profile:lint:biome:      1    │ - {␍
@repo/profile:lint:biome:      2    │ - ··"name":·"@repo/profile",␍
@repo/profile:lint:biome:      3    │ - ··"version":·"0.0.1",␍
@repo/profile:lint:biome:      4    │ - ··"type":·"module",␍
@repo/profile:lint:biome:      5    │ - ··"main":·"src/index.ts",␍
@repo/profile:lint:biome:      6    │ - ··"types":·"src/index.ts",␍
@repo/profile:lint:biome:      7    │ - ··"sideEffects":·false,␍
@repo/profile:lint:biome:      8    │ - ··"exports":·{␍
@repo/profile:lint:biome:      9    │ - ····".":·"./src/index.ts",␍
@repo/profile:lint:biome:     10    │ - ····"./components":·"./src/components/index.ts",␍
@repo/profile:lint:biome:     11    │ - ····"./hooks":·"./src/hooks/index.ts",␍
@repo/profile:lint:biome:     12    │ - ····"./screens":·"./src/screens/index.ts",␍
@repo/profile:lint:biome:     13    │ - ····"./types":·"./src/types/index.ts",␍
@repo/profile:lint:biome:     14    │ - ····"./api":·"./src/api/index.ts",␍
@repo/profile:lint:biome:     15    │ - ····"./navigation":·"./src/navigation/index.ts",␍
@repo/profile:lint:biome:     16    │ - ····"./screens/ProfileScreen.web":·"./src/screens/ProfileScreen.web.tsx",␍
@repo/profile:lint:biome:     17    │ - ····"./screens/FullProfileScreen.web":·"./src/screens/FullProfileScreen.web.tsx",␍
@repo/profile:lint:biome:     18    │ - ····"./screens/PublicProfileScreen.web":·"./src/screens/PublicProfileScreen.web.tsx",␍
@repo/profile:lint:biome:     19    │ - ····"./package.json":·"./package.json"␍
@repo/profile:lint:biome:     20    │ - ··},␍
@repo/profile:lint:biome:     21    │ - ··"scripts":·{␍
@repo/profile:lint:biome:     22    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@repo/profile:lint:biome:     23    │ - ····"lint:biome":·"biome·check·.",␍
@repo/profile:lint:biome:     24    │ - ····"lint:eslint":·"eslint·.",␍
@repo/profile:lint:biome:     25    │ - ····"format":·"biome·format·--write·.",␍
@repo/profile:lint:biome:     26    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@repo/profile:lint:biome:     27    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@repo/profile:lint:biome:     28    │ - ····"test":·"vitest·run",␍
@repo/profile:lint:biome:     29    │ - ····"test:watch":·"vitest",␍
@repo/profile:lint:biome:     30    │ - ····"test:ui":·"vitest·--ui",␍
@repo/profile:lint:biome:     31    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
@repo/profile:lint:biome:     32    │ - ··},␍
@repo/profile:lint:biome:         1 │ + {
@repo/profile:lint:biome:         2 │ + ··"name":·"@repo/profile",
@repo/profile:lint:biome:         3 │ + ··"version":·"0.0.1",
@repo/profile:lint:biome:         4 │ + ··"type":·"module",
@repo/profile:lint:biome:         5 │ + ··"main":·"src/index.ts",
@repo/profile:lint:biome:         6 │ + ··"types":·"src/index.ts",
@repo/profile:lint:biome:         7 │ + ··"sideEffects":·false,
@repo/profile:lint:biome:         8 │ + ··"exports":·{
@repo/profile:lint:biome:         9 │ + ····".":·"./src/index.ts",
@repo/profile:lint:biome:        10 │ + ····"./components":·"./src/components/index.ts",
@repo/profile:lint:biome:        11 │ + ····"./hooks":·"./src/hooks/index.ts",
@repo/profile:lint:biome:        12 │ + ····"./screens":·"./src/screens/index.ts",
@repo/profile:lint:biome:        13 │ + ····"./types":·"./src/types/index.ts",
@repo/profile:lint:biome:        14 │ + ····"./api":·"./src/api/index.ts",
@repo/profile:lint:biome:        15 │ + ····"./navigation":·"./src/navigation/index.ts",
@repo/profile:lint:biome:        16 │ + ····"./screens/ProfileScreen.web":·"./src/screens/ProfileScreen.web.tsx",
@repo/profile:lint:biome:        17 │ + ····"./screens/FullProfileScreen.web":·"./src/screens/FullProfileScreen.web.tsx",
@repo/profile:lint:biome:        18 │ + ····"./screens/PublicProfileScreen.web":·"./src/screens/PublicProfileScreen.web.tsx",
@repo/profile:lint:biome:        19 │ + ····"./package.json":·"./package.json"
@repo/profile:lint:biome:        20 │ + ··},
@repo/profile:lint:biome:        21 │ + ··"scripts":·{
@repo/profile:lint:biome:        22 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/profile:lint:biome:        23 │ + ····"lint:biome":·"biome·check·.",
@repo/profile:lint:biome:        24 │ + ····"lint:eslint":·"eslint·.",
@repo/profile:lint:biome:        25 │ + ····"format":·"biome·format·--write·.",
@repo/profile:lint:biome:        26 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/profile:lint:biome:        27 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/profile:lint:biome:        28 │ + ····"test":·"vitest·run",
@repo/profile:lint:biome:        29 │ + ····"test:watch":·"vitest",
@repo/profile:lint:biome:        30 │ + ····"test:ui":·"vitest·--ui",
@repo/profile:lint:biome:        31 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@repo/profile:lint:biome:        32 │ + ··},
@repo/profile:lint:biome:     33 33 │     "dependencies": {
@repo/profile:lint:biome:     34 34 │       "@repo/database": "workspace:*",
@repo/profile:lint:biome:     ····· │ 
@repo/profile:lint:biome:     36 36 │       "@eslint/eslintrc": "^3.3.5",
@repo/profile:lint:biome:     37 37 │       "@repo/core": "workspace:*",
@repo/profile:lint:biome:     38    │ - ····"@repo/ui":·"workspace:*",␍
apps-edlove-web:lint:biome:     21    │ - → loader:·glob({·base:·"./src/content/library",·pattern:·"**/*.{md,mdx}"·}),␍
apps-edlove-web:lint:biome:     22    │ - → schema:·z.object({␍
apps-edlove-web:lint:biome:     23    │ - → → title:·z.string(),␍
apps-edlove-web:lint:biome:     24    │ - → → subtitle:·z.string(),␍
apps-edlove-web:lint:biome:     25    │ - → → icon:·z.string().optional(),␍
apps-edlove-web:lint:biome:     26    │ - → → category:·z.enum(["thinker",·"framework",·"guide",·"story"]),␍
apps-edlove-web:lint:biome:     27    │ - → → tags:·z.array(z.string()).default([]),␍
apps-edlove-web:lint:biome:     28    │ - → → readingTime:·z.number().optional(),␍
apps-edlove-web:lint:biome:     29    │ - → → order:·z.number().default(0),␍
apps-edlove-web:lint:biome:     30    │ - → → draft:·z.boolean().default(false),␍
apps-edlove-web:lint:biome:     31    │ - → }),␍
apps-edlove-web:lint:biome:     32    │ - });␍
apps-edlove-web:lint:biome:     33    │ - ␍
@repo/profile:lint:biome:     39    │ - ····"@repo/people":·"workspace:*",␍
@repo/profile:lint:biome:     40    │ - ····"expo-clipboard":·"~55.0.13",␍
@repo/profile:lint:biome:     41    │ - ····"expo-file-system":·"~55.0.17",␍
@repo/profile:lint:biome:     42    │ - ····"expo-image-manipulator":·"~55.0.15",␍
@repo/profile:lint:biome:        38 │ + ····"@repo/ui":·"workspace:*",

apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   

@repo/library:lint:biome:     31    │ - ····"test:watch":·"vitest",␍

@repo/library:lint:biome:     32    │ - ····"test:ui":·"vitest·--ui"␍

@repo/library:lint:biome:     33    │ - ··},␍

apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome: 

apps-neevsk-web:lint:biome:       1     │ - [␍

apps-gurudevi-marketing-web:lint:biome: .astro\content.d.ts:120:5 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 

@repo/payments:lint:biome:        │ 	                          ^^^

apps-edlove-web:lint:biome:     34    │ - const·sriLanka·=·defineCollection({␍

apps-edlove-web:lint:biome:     35    │ - → loader:·glob({·base:·"./src/content/sri-lanka",·pattern:·"**/*.{md,mdx}"·}),␍

apps-edlove-web:lint:biome:     36    │ - → schema:·z.object({␍

apps-edlove-web:lint:biome:     37    │ - → → title:·z.string(),␍

apps-edlove-web:lint:biome:     38    │ - → → subtitle:·z.string(),␍

apps-edlove-web:lint:biome:     39    │ - → → icon:·z.string(),␍

apps-edlove-web:lint:biome:     40    │ - → → category:·z.enum(["schooling",·"tuition",·"discrepancy"]).optional(),␍

apps-edlove-web:lint:biome:     41    │ - → → order:·z.number().default(0),␍

@repo/admin:lint:biome: src\analytics\api.ts:40:13 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 

@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.

@repo/admin:lint:biome:   

@repo/admin:lint:biome:     38 │ 	scheduleReport(

@repo/admin:lint:biome:     39 │ 		reportConfig: CustomReportConfig,

@repo/admin:lint:biome:   > 40 │ 		schedule: any,

@repo/admin:lint:biome:        │ 		          ^^^

@repo/admin:lint:biome:     41 │ 	): Promise<string>;

@repo/admin:lint:biome:     42 │ 

@repo/admin:lint:biome:   

@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/admin:lint:biome:   

@repo/admin:lint:biome: 

@repo/admin:lint:biome: src\analytics\api.ts:49:34 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 
@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.
@repo/admin:lint:biome:   
@repo/admin:lint:biome:     47 │ 	): Promise<Anomaly[]>;

@repo/admin:lint:biome:     48 │ 	identifyTrends(tenantId: string, timeRange: DateRange): Promise<Trend[]>;

@repo/admin:lint:biome:   > 49 │ 	predictOutcomes(historicalData: any): Promise<Prediction[]>;

@repo/admin:lint:biome:        │ 	                                ^^^
@repo/admin:lint:biome:     50 │ 

@repo/admin:lint:biome:     51 │ 	// Recommendations
@repo/admin:lint:biome:   

@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/admin:lint:biome:   
@repo/admin:lint:biome: 

@repo/admin:lint:biome: src\analytics\api.ts:52:53 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 

@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.
@repo/admin:lint:biome:   

@repo/admin:lint:biome:     51 │ 	// Recommendations

@repo/admin:lint:biome:   > 52 │ 	generateRecommendations(tenantId: string, context: any): Promise<Insight[]>;

@repo/admin:lint:biome:        │ 	                                                   ^^^

@repo/admin:lint:biome:     53 │ 	benchmarkPerformance(

@repo/admin:lint:biome:     54 │ 		tenantId: string,

@repo/admin:lint:biome:   

@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/admin:lint:biome:   

@repo/admin:lint:biome: 

@repo/admin:lint:biome: src\analytics\api.ts:104:13 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 

@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.

@repo/admin:lint:biome:   

@repo/admin:lint:biome:     102 │ 	async scheduleReport(

@repo/admin:lint:biome:     103 │ 		reportConfig: CustomReportConfig,

@repo/admin:lint:biome:   > 104 │ 		schedule: any,

@repo/admin:lint:biome:         │ 		          ^^^

@repo/admin:lint:biome:     105 │ 	): Promise<string> {

@repo/admin:lint:biome:     106 │ 		return await multiTenantAnalyticsEngine.scheduleReport(

@repo/admin:lint:biome:   
@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/admin:lint:biome:   
@repo/admin:lint:biome: 

@repo/admin:lint:biome: src\analytics\api.ts:127:40 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 

@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.

@repo/admin:lint:biome:   

@repo/admin:lint:biome:     125 │ 	},

@repo/admin:lint:biome:     126 │ 

@repo/admin:lint:biome:   > 127 │ 	async predictOutcomes(historicalData: any): Promise<Prediction[]> {

@repo/admin:lint:biome:         │ 	                                      ^^^
@repo/admin:lint:biome:     128 │ 		return await multiTenantAnalyticsEngine.predictOutcomes(
@repo/admin:lint:biome:     129 │ 			"tenant-id",

@repo/admin:lint:biome:   
@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 
@repo/admin:lint:biome: src\analytics\api.ts:137:12 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 
@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.
@repo/admin:lint:biome:   
@repo/admin:lint:biome:     135 │ 	async generateRecommendations(
@repo/admin:lint:biome:     136 │ 		tenantId: string,
@repo/admin:lint:biome:   > 137 │ 		context: any,
@repo/admin:lint:biome:         │ 		         ^^^
@repo/admin:lint:biome:     138 │ 	): Promise<Insight[]> {
@repo/admin:lint:biome:     139 │ 		return await multiTenantAnalyticsEngine.generateRecommendations(
@repo/admin:lint:biome:   

@repo/profile:lint:biome:        39 │ + ····"@repo/people":·"workspace:*",

@repo/library:lint:biome:     34    │ - ··"dependencies":·{␍

apps-neevsk-web:lint:biome:       2     │ - → ["Map",·1,·2,·9,·10,·40,·41,·90,·91],␍

apps-neevsk-web:lint:biome:       3     │ - → "meta::meta",␍

@repo/people:lint:biome:     11    │ - ····"./memberships":·"./src/memberships.ts",␍

apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome:     118 │ 	> = L extends { schema: import('astro/zod').ZodSchema }

apps-gurudevi-marketing-web:lint:biome:     119 │ 		? import('astro/zod').infer<L['schema']>

apps-gurudevi-marketing-web:lint:biome:   > 120 │ 		: any;

apps-gurudevi-marketing-web:lint:biome:         │ 		  ^^^

apps-gurudevi-marketing-web:lint:biome:     121 │ 

apps-gurudevi-marketing-web:lint:biome:     122 │ 	type DataEntryMap = {
apps-gurudevi-marketing-web:lint:biome:   

@repo/payments:lint:biome:     16 │ }
@repo/payments:lint:biome:     17 │ 

@repo/payments:lint:biome:   

@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 

@repo/payments:lint:biome: src\types.ts:25:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 

@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.

@repo/payments:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome: 

@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/admin:lint:biome:   
@repo/admin:lint:biome: 

@repo/profile:lint:biome:        40 │ + ····"expo-clipboard":·"~55.0.13",

@repo/profile:lint:biome:        41 │ + ····"expo-file-system":·"~55.0.17",

@repo/profile:lint:biome:        42 │ + ····"expo-image-manipulator":·"~55.0.15",

@repo/library:lint:biome:     35    │ - ····"@repo/core":·"workspace:*",␍

@repo/profile:lint:biome:     43 43 │       "expo-image-picker": "~55.0.19",

@repo/people:lint:biome:     12    │ - ····"./staff":·"./src/staff.ts",␍

apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome: 

@repo/payments:lint:biome:     23 │ 	expiry?: string;

apps-edlove-web:lint:biome:     42    │ - → → draft:·z.boolean().default(false),␍

apps-edlove-web:lint:biome:     43    │ - → }),␍

apps-edlove-web:lint:biome:     44    │ - });␍

apps-edlove-web:lint:biome:     45    │ - ␍

@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:40:8 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@intuitui-labs/lk-edu-geo:lint:biome: 

@repo/admin:lint:biome: src\analytics\types.ts:96:9 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 

@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.

@repo/admin:lint:biome:   

@repo/library:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/library:lint:biome: Diagnostics not shown: 180.
@repo/library:lint:biome:     36    │ - ····"@repo/graphics":·"workspace:*",␍
@repo/library:lint:biome: Checked 50 files in 940ms. No fixes applied.

@repo/library:lint:biome: Found 76 errors.
@repo/library:lint:biome: Found 124 warnings.
@repo/people:lint:biome:     13    │ - ····"./components":·"./src/components/index.ts",␍
@repo/people:lint:biome:     14    │ - ····"./package.json":·"./package.json"␍
@repo/people:lint:biome:     15    │ - ··},␍
@repo/people:lint:biome:     16    │ - ··"scripts":·{␍
@repo/people:lint:biome:     17    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@repo/people:lint:biome:     18    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@repo/people:lint:biome:     19    │ - ····"lint:biome":·"biome·check·.",␍

@repo/people:lint:biome:     20    │ - ····"lint:eslint":·"eslint·.",␍
@repo/people:lint:biome:     21    │ - ····"format":·"biome·format·--write·.",␍
@repo/people:lint:biome:     22    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@repo/people:lint:biome:     23    │ - ····"test":·"vitest·run",␍
@repo/people:lint:biome:     24    │ - ····"test:watch":·"vitest",␍
@repo/people:lint:biome:     25    │ - ····"test:ui":·"vitest·--ui",␍
@repo/people:lint:biome:     26    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
@repo/people:lint:biome:     27    │ - ··},␍
@repo/people:lint:biome:     28    │ - ··"dependencies":·{␍
@repo/people:lint:biome:     29    │ - ····"@repo/core":·"workspace:*",␍

@repo/people:lint:biome:     30    │ - ····"@repo/ui":·"workspace:*",␍
@repo/people:lint:biome:     31    │ - ····"date-fns":·"^4.1.0",␍
@repo/people:lint:biome:     32    │ - ····"lucide-react-native":·"^0.563.0",␍
@repo/people:lint:biome:     33    │ - ····"react-i18next":·"^16.5.4"␍
@repo/people:lint:biome:     34    │ - ··},␍
@repo/people:lint:biome:     35    │ - ··"devDependencies":·{␍
@repo/people:lint:biome:     36    │ - ····"@repo/eslint-config":·"workspace:^",␍

@repo/people:lint:biome:     37    │ - ····"@repo/types-shim":·"workspace:*",␍
@repo/people:lint:biome:     38    │ - ····"@types/react":·"^19.2.14",␍
@repo/people:lint:biome:     39    │ - ····"typescript":·"^5.9.3",␍
@repo/people:lint:biome:     40    │ - ····"eslint":·"^9.38.0",␍
@repo/people:lint:biome:     41    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/people:lint:biome:     42    │ - ····"vitest":·"^2.1.9",␍
@repo/people:lint:biome:     43    │ - ····"vite-tsconfig-paths":·"^6.1.1"␍
@repo/people:lint:biome:     44    │ - ··},␍
@repo/people:lint:biome:     45    │ - ··"peerDependencies":·{␍
@repo/people:lint:biome:     46    │ - ····"react":·"*",␍
@repo/people:lint:biome:     47    │ - ····"react-native":·"*"␍

@repo/people:lint:biome:     48    │ - ··}␍
@repo/people:lint:biome:     49    │ - }␍
@repo/people:lint:biome:         1 │ + {
@repo/people:lint:biome:         2 │ + ··"name":·"@repo/people",
@repo/people:lint:biome:         3 │ + ··"version":·"0.0.1",
@repo/people:lint:biome:         4 │ + ··"main":·"src/index.ts",
@repo/people:lint:biome:         5 │ + ··"types":·"src/index.ts",

@repo/people:lint:biome:         6 │ + ··"exports":·{
@repo/people:lint:biome:         7 │ + ····".":·"./src/index.ts",
@repo/people:lint:biome:         8 │ + ····"./directory":·"./src/directory.ts",
@repo/people:lint:biome:         9 │ + ····"./feedback":·"./src/feedback.ts",
@repo/people:lint:biome:        10 │ + ····"./hooks":·"./src/hooks/index.ts",
@repo/people:lint:biome:        11 │ + ····"./memberships":·"./src/memberships.ts",
@repo/people:lint:biome:        12 │ + ····"./staff":·"./src/staff.ts",

@repo/people:lint:biome:        13 │ + ····"./components":·"./src/components/index.ts",
@repo/people:lint:biome:        14 │ + ····"./package.json":·"./package.json"
@repo/people:lint:biome:        15 │ + ··},
@repo/people:lint:biome:        16 │ + ··"scripts":·{
@repo/people:lint:biome:        17 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/people:lint:biome:        18 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/people:lint:biome:        19 │ + ····"lint:biome":·"biome·check·.",
@repo/people:lint:biome:        20 │ + ····"lint:eslint":·"eslint·.",

@repo/people:lint:biome:        21 │ + ····"format":·"biome·format·--write·.",
@repo/people:lint:biome:        22 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/people:lint:biome:        23 │ + ····"test":·"vitest·run",
@repo/people:lint:biome:        24 │ + ····"test:watch":·"vitest",
@repo/people:lint:biome:        25 │ + ····"test:ui":·"vitest·--ui",
@repo/people:lint:biome:        26 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@repo/people:lint:biome:        27 │ + ··},
@repo/people:lint:biome:        28 │ + ··"dependencies":·{

@repo/people:lint:biome:        29 │ + ····"@repo/core":·"workspace:*",
@repo/people:lint:biome:        30 │ + ····"@repo/ui":·"workspace:*",
@repo/people:lint:biome:        31 │ + ····"date-fns":·"^4.1.0",
@repo/people:lint:biome:        32 │ + ····"lucide-react-native":·"^0.563.0",
@repo/people:lint:biome:        33 │ + ····"react-i18next":·"^16.5.4"
@repo/people:lint:biome:        34 │ + ··},

@repo/people:lint:biome:        35 │ + ··"devDependencies":·{
@repo/people:lint:biome:        36 │ + ····"@repo/eslint-config":·"workspace:^",
@repo/people:lint:biome:        37 │ + ····"@repo/types-shim":·"workspace:*",
@repo/people:lint:biome:        38 │ + ····"@types/react":·"^19.2.14",
@repo/people:lint:biome:        39 │ + ····"typescript":·"^5.9.3",
@repo/people:lint:biome:        40 │ + ····"eslint":·"^9.38.0",
@repo/people:lint:biome:        41 │ + ····"@repo/typescript-config":·"workspace:*",

@repo/people:lint:biome:        42 │ + ····"vitest":·"^2.1.9",
@repo/people:lint:biome:        43 │ + ····"vite-tsconfig-paths":·"^6.1.1"
@repo/people:lint:biome:        44 │ + ··},
@repo/people:lint:biome:        45 │ + ··"peerDependencies":·{
@repo/people:lint:biome:        46 │ + ····"react":·"*",
@repo/people:lint:biome:        47 │ + ····"react-native":·"*"
@repo/people:lint:biome:        48 │ + ··}
@repo/people:lint:biome:        49 │ + }
@repo/people:lint:biome:     50 50 │   
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\StaffPresencePulse.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/payments:lint:biome:     24 │ 	isDefault: boolean;
@repo/payments:lint:biome:   > 25 │ 	metadata?: Record<string, any>;

@repo/payments:lint:biome:        │ 	                          ^^^
@repo/payments:lint:biome:     26 │ }
@repo/payments:lint:biome:     27 │ 
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 

@repo/payments:lint:biome: src\types.ts:34:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     32 │ 		amount: number,
@repo/payments:lint:biome:     33 │ 		currency: string,

@repo/payments:lint:biome:   > 34 │ 		metadata?: any,
@repo/payments:lint:biome:        │ 		           ^^^
@repo/payments:lint:biome:     35 │ 	): Promise<PaymentIntent>;
@repo/payments:lint:biome:     36 │ 	verifyPayment(paymentIntentId: string): Promise<PaymentStatus>;
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   

@repo/payments:lint:biome: 
@repo/payments:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/base";␍

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
@repo/payments:lint:biome:      3    │ - ··"version":·"0.0.1",␍
@repo/payments:lint:biome:      4    │ - ··"main":·"src/index.ts",␍
@repo/payments:lint:biome:      5    │ - ··"types":·"src/index.ts",␍
@repo/payments:lint:biome:      6    │ - ··"exports":·{␍
@repo/payments:lint:biome:      7    │ - ····".":·"./src/index.ts",␍
@repo/payments:lint:biome:      8    │ - ····"./package.json":·"./package.json"␍
@repo/payments:lint:biome:      9    │ - ··},␍
@repo/payments:lint:biome:     10    │ - ··"scripts":·{␍
@repo/payments:lint:biome:     11    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@repo/payments:lint:biome:     12    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@repo/payments:lint:biome:     13    │ - ····"lint:biome":·"biome·check·.",␍
@repo/payments:lint:biome:     14    │ - ····"lint:eslint":·"eslint·.",␍
@repo/payments:lint:biome:     15    │ - ····"format":·"biome·format·--write·.",␍
@repo/payments:lint:biome:     16    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@repo/payments:lint:biome:     17    │ - ····"test":·"vitest·run",␍
@repo/payments:lint:biome:     18    │ - ····"test:watch":·"vitest",␍
@repo/payments:lint:biome:     19    │ - ····"test:ui":·"vitest·--ui",␍
@repo/payments:lint:biome:     20    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
@repo/payments:lint:biome:     21    │ - ··},␍
@repo/payments:lint:biome:     22    │ - ··"dependencies":·{␍
@repo/payments:lint:biome:     23    │ - ····"@repo/accounting":·"workspace:*",␍
@repo/payments:lint:biome:     24    │ - ····"@repo/core":·"workspace:*",␍
@repo/payments:lint:biome:     25    │ - ····"@supabase/supabase-js":·"2.102.1"␍
@repo/payments:lint:biome:     26    │ - ··},␍
@repo/payments:lint:biome:     27    │ - ··"devDependencies":·{␍
@repo/payments:lint:biome:     28    │ - ····"typescript":·"^5.9.3",␍
@repo/payments:lint:biome:     29    │ - ····"eslint":·"^9.38.0",␍

@repo/payments:lint:biome:     30    │ - ····"@types/node":·"^25.5.0",␍

@repo/payments:lint:biome:     31    │ - ····"@repo/eslint-config":·"workspace:^",␍
@repo/payments:lint:biome:     32    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/payments:lint:biome:     33    │ - ····"vitest":·"^2.1.9",␍
@repo/payments:lint:biome:     34    │ - ····"vite-tsconfig-paths":·"^6.1.1"␍
@repo/payments:lint:biome:     35    │ - ··}␍
@repo/payments:lint:biome:     36    │ - }␍
@repo/payments:lint:biome:         1 │ + {
apps-neevsk-web:lint:biome:       4     │ - → ["Map",·3,·4,·5,·6,·7,·8],␍
apps-neevsk-web:lint:biome:       5     │ - → "astro-version",␍
apps-neevsk-web:lint:biome:       6     │ - → "5.17.3",␍
apps-neevsk-web:lint:biome:       7     │ - → "content-config-digest",␍
apps-neevsk-web:lint:biome:       8     │ - → "3fa898d52e26781e",␍
apps-neevsk-web:lint:biome:       9     │ - → "astro-config-digest",␍
apps-neevsk-web:lint:biome:      10     │ - → "{\"root\":{},\"srcDir\":{},\"publicDir\":{},\"outDir\":{},\"cacheDir\":{},\"compressHTML\":true,\"base\":\"/\",\"trailingSlash\":\"ignore\",\"output\":\"static\",\"scopedStyleStrategy\":\"attribute\",\"build\":{\"format\":\"directory\",\"client\":{},\"server\":{},\"assets\":\"_astro\",\"serverEntry\":\"entry.mjs\",\"redirects\":true,\"inlineStylesheets\":\"auto\",\"concurrency\":1},\"server\":{\"open\":false,\"host\":false,\"port\":4321,\"streaming\":true,\"allowedHosts\":[]},\"redirects\":{},\"image\":{\"endpoint\":{\"route\":\"/_image\"},\"service\":{\"entrypoint\":\"astro/assets/services/sharp\",\"config\":{}},\"domains\":[],\"remotePatterns\":[],\"responsiveStyles\":false},\"devToolbar\":{\"enabled\":true},\"markdown\":{\"syntaxHighlight\":{\"type\":\"shiki\",\"excludeLangs\":[\"math\"]},\"shikiConfig\":{\"langs\":[],\"langAlias\":{},\"theme\":\"github-dark\",\"themes\":{},\"wrap\":false,\"transformers\":[]},\"remarkPlugins\":[],\"rehypePlugins\":[],\"remarkRehype\":{},\"gfm\":true,\"smartypants\":true},\"security\":{\"checkOrigin\":true,\"allowedDomains\":[]},\"env\":{\"schema\":{},\"validateSecrets\":false},\"experimental\":{\"clientPrerender\":false,\"contentIntellisense\":false,\"headingIdCompat\":false,\"preserveScriptOrder\":false,\"liveContentCollections\":false,\"csp\":false,\"staticImportMetaEnv\":false,\"chromeDevtoolsWorkspace\":false,\"failOnPrerenderConflict\":false,\"svgo\":false},\"legacy\":{\"collections\":false}}",␍

apps-neevsk-web:lint:biome:      11     │ - → "archive",␍
apps-neevsk-web:lint:biome:      12     │ - → ["Map",·11,·12],␍
apps-neevsk-web:lint:biome:      13     │ - → "01-uncollapsed-wave",␍
apps-neevsk-web:lint:biome:      14     │ - → {␍
apps-neevsk-web:lint:biome:      15     │ - → → "id":·11,␍
apps-neevsk-web:lint:biome:      16     │ - → → "data":·13,␍
apps-neevsk-web:lint:biome:      17     │ - → → "body":·22,␍
apps-neevsk-web:lint:biome:      18     │ - → → "filePath":·23,␍
apps-neevsk-web:lint:biome:      19     │ - → → "digest":·24,␍
apps-neevsk-web:lint:biome:      20     │ - → → "rendered":·25,␍
apps-neevsk-web:lint:biome:      21     │ - → → "legacyId":·39␍
apps-neevsk-web:lint:biome:      22     │ - → },␍
apps-neevsk-web:lint:biome:      23     │ - → {·"title":·14,·"subtitle":·15,·"publishDate":·16,·"tags":·17,·"draft":·21·},␍
apps-neevsk-web:lint:biome:      24     │ - → "The·Uncollapsed·Wave·Function",␍
apps-neevsk-web:lint:biome:      25     │ - → "Existential·Cybernetics·in·a·Discrete·World",␍
apps-neevsk-web:lint:biome:      26     │ - → ["Date",·"2026-02-12T00:00:00.000Z"],␍
apps-neevsk-web:lint:biome:      27     │ - → [18,·19,·20],␍
apps-neevsk-web:lint:biome:      28     │ - → "philosophy",␍
apps-neevsk-web:lint:biome:      29     │ - → "cybernetics",␍
apps-neevsk-web:lint:biome:      30     │ - → "existence",␍
apps-neevsk-web:lint:biome:      31     │ - → false,␍

apps-neevsk-web:lint:biome:      32     │ - → "Everything·I·want·to·show·to·the·world·is·a·fracture·of·what·I·am.·This·site·is·the·uncollapsed·wave·function·of·my·existence.\r\n\r\nIn·a·world·that·demands·discrete·datacategories,·roles,·service·numbersthe·cyberneticist·recognizes·the·flow.·We·are·not·nodes;·we·are·the·edges.·We·are·the·signals·that·cross·the·void·between·souls.\r\n\r\n###·The·Observation·Problem\r\nThe·act·of·observing·this·site·collapses·the·potential.·You·see·a·CV,·a·project,·a·name.·But·beneath·the·interface·lies·the·noisethe·beautiful,·chaotic·feedback·loop·that·is·Life.",␍
apps-neevsk-web:lint:biome:      33     │ - → "src/content/archive/01-uncollapsed-wave.md",␍
apps-neevsk-web:lint:biome:      34     │ - → "ab8bc213442c1283",␍
apps-neevsk-web:lint:biome:      35     │ - → {·"html":·26,·"metadata":·27·},␍
apps-neevsk-web:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.

apps-neevsk-web:lint:biome: Diagnostics not shown: 115.
apps-neevsk-web:lint:biome: Checked 59 files in 504ms. No fixes applied.
apps-neevsk-web:lint:biome: Found 56 errors.
apps-neevsk-web:lint:biome: Found 75 warnings.
apps-neevsk-web:lint:biome:      36     │ - → "<p>Everything·I·want·to·show·to·the·world·is·a·fracture·of·what·I·am.·This·site·is·the·uncollapsed·wave·function·of·my·existence.</p>\n<p>In·a·world·that·demands·discrete·datacategories,·roles,·service·numbersthe·cyberneticist·recognizes·the·flow.·We·are·not·nodes;·we·are·the·edges.·We·are·the·signals·that·cross·the·void·between·souls.</p>\n<h3·id=\"the-observation-problem\">The·Observation·Problem</h3>\n<p>The·act·of·observing·this·site·collapses·the·potential.·You·see·a·CV,·a·project,·a·name.·But·beneath·the·interface·lies·the·noisethe·beautiful,·chaotic·feedback·loop·that·is·Life.</p>",␍
apps-neevsk-web:lint:biome:      37     │ - → {␍
apps-neevsk-web:lint:biome: Found 4 infos.
apps-neevsk-web:lint:biome:      38     │ - → → "headings":·28,␍
apps-neevsk-web:lint:biome:      39     │ - → → "localImagePaths":·33,␍
apps-neevsk-web:lint:biome:      40     │ - → → "remoteImagePaths":·34,␍

apps-neevsk-web:lint:biome:      41     │ - → → "frontmatter":·35,␍
apps-neevsk-web:lint:biome:      42     │ - → → "imagePaths":·38␍
apps-neevsk-web:lint:biome:      43     │ - → },␍
apps-neevsk-web:lint:biome:      44     │ - → [29],␍
apps-neevsk-web:lint:biome:      45     │ - → {·"depth":·30,·"slug":·31,·"text":·32·},␍
apps-neevsk-web:lint:biome:      46     │ - → 3,␍
apps-neevsk-web:lint:biome:      47     │ - → "the-observation-problem",␍
apps-neevsk-web:lint:biome:      48     │ - → "The·Observation·Problem",␍
apps-neevsk-web:lint:biome:      49     │ - → [],␍
apps-neevsk-web:lint:biome:      50     │ - → [],␍
apps-neevsk-web:lint:biome:      51     │ - → {·"title":·14,·"subtitle":·15,·"publishDate":·36,·"tags":·37·},␍
apps-neevsk-web:lint:biome:      52     │ - → ["Date",·"2026-02-12T00:00:00.000Z"],␍
apps-neevsk-web:lint:biome:      53     │ - → [18,·19,·20],␍
apps-neevsk-web:lint:biome:      54     │ - → [],␍
apps-neevsk-web:lint:biome:      55     │ - → "01-uncollapsed-wave.md",␍

apps-neevsk-web:lint:biome:      56     │ - → "projects",␍
apps-neevsk-web:lint:biome:      57     │ - → ["Map",·42,·43,·66,·67],␍
apps-neevsk-web:lint:biome:      58     │ - → "edlove-ai",␍
apps-neevsk-web:lint:biome:      59     │ - → {␍
apps-neevsk-web:lint:biome:      60     │ - → → "id":·42,␍
apps-neevsk-web:lint:biome:      61     │ - → → "data":·44,␍
apps-neevsk-web:lint:biome:      62     │ - → → "body":·53,␍
apps-neevsk-web:lint:biome:      63     │ - → → "filePath":·54,␍
apps-neevsk-web:lint:biome:      64     │ - → → "digest":·55,␍
apps-neevsk-web:lint:biome:      65     │ - → → "rendered":·56,␍
apps-neevsk-web:lint:biome:      66     │ - → → "legacyId":·65␍
apps-neevsk-web:lint:biome:      67     │ - → },␍
apps-neevsk-web:lint:biome:      68     │ - → {␍

apps-neevsk-web:lint:biome:      69     │ - → → "title":·45,␍
apps-neevsk-web:lint:biome:      70     │ - → → "description":·46,␍
apps-neevsk-web:lint:biome:      71     │ - → → "role":·47,␍
apps-neevsk-web:lint:biome:      72     │ - → → "tech":·48,␍
apps-neevsk-web:lint:biome:      73     │ - → → "order":·52,␍
apps-neevsk-web:lint:biome:      74     │ - → → "draft":·21␍
apps-neevsk-web:lint:biome:      75     │ - → },␍
apps-neevsk-web:lint:biome:      76     │ - → "EdLove·AI",␍
apps-neevsk-web:lint:biome:      77     │ - → "Human-centric·educational·agents·designed·to·nurture·the·'Soul'·of·learning.",␍
apps-neevsk-web:lint:biome:      78     │ - → "Epistemic·Architect",␍
apps-neevsk-web:lint:biome:      79     │ - → [49,·50,·51],␍
apps-neevsk-web:lint:biome:      80     │ - → "AI",␍

apps-neevsk-web:lint:biome:      81     │ - → "Svelte",␍
apps-neevsk-web:lint:biome:      82     │ - → "Ecology",␍
apps-neevsk-web:lint:biome:      83     │ - → 20,␍
apps-neevsk-web:lint:biome:      84     │ - → "EdLove·AI·is·an·experiment·in·relational·intelligence.·We·are·moving·away·from·LLMs·as·\"answer·boxes\"·and·toward·LLMs·as·\"epistemic·mirrors\"·that·help·learners·see·themselves·more·clearly.",␍
apps-neevsk-web:lint:biome:      85     │ - → "src/content/projects/edlove-ai.md",␍
apps-neevsk-web:lint:biome:      86     │ - → "cedf5fdf40d0cfd4",␍
apps-neevsk-web:lint:biome:      87     │ - → {·"html":·57,·"metadata":·58·},␍

apps-neevsk-web:lint:biome:      88     │ - → "<p>EdLove·AI·is·an·experiment·in·relational·intelligence.·We·are·moving·away·from·LLMs·as·answer·boxes·and·toward·LLMs·as·epistemic·mirrors·that·help·learners·see·themselves·more·clearly.</p>",␍
apps-neevsk-web:lint:biome:      89     │ - → {␍
apps-neevsk-web:lint:biome:      90     │ - → → "headings":·59,␍
apps-neevsk-web:lint:biome:      91     │ - → → "localImagePaths":·60,␍
apps-neevsk-web:lint:biome:      92     │ - → → "remoteImagePaths":·61,␍
apps-neevsk-web:lint:biome:      93     │ - → → "frontmatter":·62,␍
apps-neevsk-web:lint:biome:      94     │ - → → "imagePaths":·64␍
apps-neevsk-web:lint:biome:      95     │ - → },␍

apps-neevsk-web:lint:biome:      96     │ - → [],␍
apps-neevsk-web:lint:biome:      97     │ - → [],␍
apps-neevsk-web:lint:biome:      98     │ - → [],␍
apps-neevsk-web:lint:biome:      99     │ - → {·"title":·45,·"description":·46,·"role":·47,·"tech":·63,·"order":·52·},␍
apps-neevsk-web:lint:biome:     100     │ - → [49,·50,·51],␍
apps-neevsk-web:lint:biome:     101     │ - → [],␍
apps-neevsk-web:lint:biome:     102     │ - → "edlove-ai.md",␍
apps-neevsk-web:lint:biome:     103     │ - → "polymath",␍
apps-neevsk-web:lint:biome:     104     │ - → {␍
apps-neevsk-web:lint:biome:     105     │ - → → "id":·66,␍

apps-neevsk-web:lint:biome:     106     │ - → → "data":·68,␍
apps-neevsk-web:lint:biome:     107     │ - → → "body":·77,␍
apps-neevsk-web:lint:biome:     108     │ - → → "filePath":·78,␍
apps-neevsk-web:lint:biome:     109     │ - → → "digest":·79,␍
apps-neevsk-web:lint:biome:     110     │ - → → "rendered":·80,␍
apps-neevsk-web:lint:biome:     111     │ - → → "legacyId":·89␍
apps-neevsk-web:lint:biome:     112     │ - → },␍
apps-neevsk-web:lint:biome:     113     │ - → {␍
apps-neevsk-web:lint:biome:     114     │ - → → "title":·69,␍
apps-neevsk-web:lint:biome:     115     │ - → → "description":·70,␍

apps-neevsk-web:lint:biome:     116     │ - → → "role":·71,␍

@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome: src\components\Footer.astro:2:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━

@repo/library:lint:biome:     37    │ - ····"@repo/ui":·"workspace:*",␍
@repo/profile:lint:biome:     44 44 │       "@tanstack/react-query": "^5.90.20",

@repo/admin:lint:biome:     94 │ 		| "contains"
@repo/people:lint:biome:       1     │ - import·{␍
@repo/admin:lint:biome:     95 │ 		| "in";
@repo/admin:lint:biome:   > 96 │ 	value: any;
@repo/admin:lint:biome:        │ 	       ^^^

@repo/payments:lint:biome:         2 │ + ··"name":·"@repo/payments",
@repo/payments:lint:biome:         3 │ + ··"version":·"0.0.1",
@repo/payments:lint:biome:         4 │ + ··"main":·"src/index.ts",
@repo/payments:lint:biome:         5 │ + ··"types":·"src/index.ts",
@repo/payments:lint:biome:         6 │ + ··"exports":·{
@repo/payments:lint:biome:         7 │ + ····".":·"./src/index.ts",
@repo/payments:lint:biome:         8 │ + ····"./package.json":·"./package.json"

@repo/payments:lint:biome:         9 │ + ··},
@repo/payments:lint:biome:        10 │ + ··"scripts":·{
@repo/payments:lint:biome:        11 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/payments:lint:biome:        12 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/payments:lint:biome:        13 │ + ····"lint:biome":·"biome·check·.",

@repo/payments:lint:biome:        14 │ + ····"lint:eslint":·"eslint·.",
@repo/payments:lint:biome:        15 │ + ····"format":·"biome·format·--write·.",
@repo/payments:lint:biome:        16 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/payments:lint:biome:        17 │ + ····"test":·"vitest·run",
@repo/payments:lint:biome:        18 │ + ····"test:watch":·"vitest",
@repo/payments:lint:biome:        19 │ + ····"test:ui":·"vitest·--ui",
@repo/payments:lint:biome:        20 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@repo/payments:lint:biome:        21 │ + ··},
@repo/payments:lint:biome:        22 │ + ··"dependencies":·{
@repo/payments:lint:biome:        23 │ + ····"@repo/accounting":·"workspace:*",

@repo/payments:lint:biome:        24 │ + ····"@repo/core":·"workspace:*",
@repo/payments:lint:biome:        25 │ + ····"@supabase/supabase-js":·"2.102.1"
@repo/payments:lint:biome:        26 │ + ··},
@repo/payments:lint:biome:        27 │ + ··"devDependencies":·{
@repo/payments:lint:biome:        28 │ + ····"typescript":·"^5.9.3",
@repo/payments:lint:biome:        29 │ + ····"eslint":·"^9.38.0",
@repo/payments:lint:biome:        30 │ + ····"@types/node":·"^25.5.0",
@repo/payments:lint:biome:        31 │ + ····"@repo/eslint-config":·"workspace:^",
@repo/payments:lint:biome:        32 │ + ····"@repo/typescript-config":·"workspace:*",
@repo/payments:lint:biome:        33 │ + ····"vitest":·"^2.1.9",

@repo/payments:lint:biome:        34 │ + ····"vite-tsconfig-paths":·"^6.1.1"
@repo/payments:lint:biome:        35 │ + ··}
@repo/payments:lint:biome:        36 │ + }
@repo/payments:lint:biome:     37 37 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      1    │ - import·{·PayHereProvider·}·from·"./plugins/payhere";␍
@repo/payments:lint:biome:      2    │ - import·{·StripeProvider·}·from·"./plugins/stripe";␍

@repo/payments:lint:biome:      3    │ - import·{·payments·}·from·"./registry";␍
@repo/payments:lint:biome:      4    │ - ␍
apps-gurudevi-marketing-web:lint:biome: 
@repo/library:lint:biome:     38    │ - ····"nativewind":·"4.1.23",␍

@repo/profile:lint:biome:     45 45 │       "lucide-react-native": "^0.563.0",
@repo/profile:lint:biome:     46    │ - ····"react-i18next":·"^16.5.4",␍
@repo/profile:lint:biome:     47    │ - ····"react-native-reanimated":·"^4.2.1",␍
@repo/profile:lint:biome:     48    │ - ····"@react-native-async-storage/async-storage":·"2.2.0"␍
@repo/profile:lint:biome:     49    │ - ··},␍
apps-edlove-web:lint:biome:     46    │ - const·community·=·defineCollection({␍

@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     38 │ 	geoSql += `${districts
@intuitui-labs/lk-edu-geo:lint:biome:     39 │ 		.map(

@intuitui-labs/lk-edu-geo:lint:biome:   > 40 │ 			(d: any) =>
@intuitui-labs/lk-edu-geo:lint:biome:        │ 			    ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     41 │ 				`('${d.id}', '${d.province_id}', '${escape(d.name)}', '${d.name_si || ""}', '${d.name_ta || ""}')`,
@intuitui-labs/lk-edu-geo:lint:biome:     42 │ 		)
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:49:9 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     47 │ 	geoSql += `${dsDivisions

@intuitui-labs/lk-edu-geo:lint:biome:     48 │ 		.map(

apps-gurudevi-marketing-web:lint:biome:   ! This variable currentYear is unused.
@repo/library:lint:biome:     39    │ - ····"@tanstack/react-query":·"^5.90.20",␍
@repo/admin:lint:biome:     97 │ };
@repo/profile:lint:biome:     50    │ - ··"devDependencies":·{␍

apps-edlove-web:lint:biome:     47    │ - → loader:·glob({·base:·"./src/content/community",·pattern:·"**/*.{md,mdx}"·}),␍
apps-edlove-web:lint:biome:     48    │ - → schema:·z.object({␍
apps-edlove-web:lint:biome:     49    │ - → → title:·z.string(),␍
apps-edlove-web:lint:biome:     50    │ - → → subtitle:·z.string(),␍

apps-edlove-web:lint:biome:     51    │ - → → icon:·z.string(),␍
apps-edlove-web:lint:biome:     52    │ - → → order:·z.number().default(0),␍
apps-edlove-web:lint:biome:     53    │ - → → draft:·z.boolean().default(false),␍
apps-edlove-web:lint:biome:     54    │ - → }),␍
apps-edlove-web:lint:biome:     55    │ - });␍

apps-edlove-web:lint:biome:     56    │ - ␍
apps-edlove-web:lint:biome:     57    │ - const·gurudevi·=·defineCollection({␍
apps-edlove-web:lint:biome:     58    │ - → loader:·glob({·base:·"./src/content/gurudevi",·pattern:·"**/*.{md,mdx}"·}),␍
apps-edlove-web:lint:biome:     59    │ - → schema:·z.object({␍
apps-edlove-web:lint:biome:     60    │ - → → title:·z.string(),␍

apps-edlove-web:lint:biome:     61    │ - → → subtitle:·z.string(),␍
apps-edlove-web:lint:biome:     62    │ - → → icon:·z.string(),␍
apps-edlove-web:lint:biome:     63    │ - → → order:·z.number().default(0),␍
apps-edlove-web:lint:biome:     64    │ - → → draft:·z.boolean().default(false),␍
apps-edlove-web:lint:biome:     65    │ - → }),␍
apps-edlove-web:lint:biome:     66    │ - });␍
apps-edlove-web:lint:biome:     67    │ - ␍

apps-edlove-web:lint:biome:     68    │ - const·resources·=·defineCollection({␍
apps-edlove-web:lint:biome:     69    │ - → loader:·glob({·base:·"./src/content/resources",·pattern:·"**/*.{md,mdx}"·}),␍
apps-edlove-web:lint:biome:     70    │ - → schema:·z.object({␍
apps-edlove-web:lint:biome:     71    │ - → → title:·z.string(),␍
apps-edlove-web:lint:biome:     72    │ - → → subtitle:·z.string(),␍
apps-edlove-web:lint:biome:     73    │ - → → icon:·z.string(),␍
apps-edlove-web:lint:biome:     74    │ - → → order:·z.number().default(0),␍
apps-edlove-web:lint:biome:     75    │ - → → draft:·z.boolean().default(false),␍

apps-edlove-web:lint:biome:     76    │ - → }),␍
apps-edlove-web:lint:biome:     77    │ - });␍
apps-edlove-web:lint:biome:     78    │ - ␍
apps-edlove-web:lint:biome:     79    │ - export·const·collections·=·{␍

apps-edlove-web:lint:biome:     80    │ - → cosmos,␍
apps-edlove-web:lint:biome:     81    │ - → library,␍
apps-edlove-web:lint:biome:     82    │ - → "sri-lanka":·sriLanka,␍
apps-edlove-web:lint:biome:     83    │ - → community,␍
apps-edlove-web:lint:biome:     84    │ - → gurudevi,␍
apps-edlove-web:lint:biome:     85    │ - → resources,␍
apps-edlove-web:lint:biome:     86    │ - };␍
apps-edlove-web:lint:biome:         1 │ + import·{·defineCollection·}·from·'astro:content';
apps-edlove-web:lint:biome:         2 │ + import·{·glob·}·from·'astro/loaders';

apps-edlove-web:lint:biome:         3 │ + import·{·z·}·from·'astro/zod';
apps-edlove-web:lint:biome:         4 │ + 
apps-edlove-web:lint:biome:         5 │ + const·cosmos·=·defineCollection({
apps-edlove-web:lint:biome:         6 │ + ··loader:·glob({·base:·'./src/content/cosmos',·pattern:·'**/*.{md,mdx}'·}),
apps-edlove-web:lint:biome:         7 │ + ··schema:·z.object({
apps-edlove-web:lint:biome:         8 │ + ····title:·z.string(),
apps-edlove-web:lint:biome:         9 │ + ····subtitle:·z.string(),

apps-edlove-web:lint:biome:        10 │ + ····icon:·z.string(),
apps-edlove-web:lint:biome:        11 │ + ····order:·z.number().default(0),

@intuitui-labs/lk-edu-geo:lint:biome:   > 49 │ 			(ds: any) =>
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1 │ ---
@repo/profile:lint:biome:     51    │ - ····"i18next":·"^25.8.11",␍

@repo/library:lint:biome:     40    │ - ····"d3":·"^7.9.0",␍
@repo/admin:lint:biome:     98 │ 
@repo/admin:lint:biome:   
@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 

@repo/payments:lint:biome:      5    │ - export·*·from·"./registry";␍
apps-gurudevi-marketing-web:lint:biome:   > 2 │ const currentYear = new Date().getFullYear();
@intuitui-labs/lk-edu-geo:lint:biome:        │ 			     ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     50 │ 				`('${ds.id}', '${ds.district_id}', '${escape(ds.name)}', '${ds.name_si || ""}', '${ds.name_ta || ""}')`,

@repo/library:lint:biome:     41    │ - ····"lucide-react-native":·"^0.563.0",␍
@repo/library:lint:biome:     42    │ - ····"react-i18next":·"^16.5.4",␍
apps-edlove-web:lint:biome:        12 │ + ····accentColor:·z.string().optional(),
@repo/library:lint:biome:     43    │ - ····"react-native-gifted-charts":·"^1.4.76",␍
@repo/library:lint:biome:     44    │ - ····"react-native-linear-gradient":·"^2.8.3",␍
@repo/library:lint:biome:     45    │ - ····"react-native-gesture-handler":·"2.30.0",␍
@repo/library:lint:biome:     46    │ - ····"@expo/vector-icons":·"15.1.1",␍
@repo/library:lint:biome:     47    │ - ····"expo-linear-gradient":·"~55.0.13",␍
@repo/library:lint:biome:     48    │ - ····"react-native-maps":·"^1.27.2",␍

@repo/library:lint:biome:     49    │ - ····"@maplibre/maplibre-react-native":·"^10.4.2",␍
@repo/library:lint:biome:     50    │ - ····"expo-blur":·"~55.0.14",␍
@repo/library:lint:biome:     51    │ - ····"react-native-svg":·"15.15.3",␍
@repo/library:lint:biome:     52    │ - ····"@supabase/supabase-js":·"2.102.1",␍
@repo/library:lint:biome:     53    │ - ····"@supabase/postgrest-js":·"2.102.1"␍
@repo/library:lint:biome:     54    │ - ··},␍
@repo/library:lint:biome:     55    │ - ··"devDependencies":·{␍
@repo/library:lint:biome:     56    │ - ····"@repo/eslint-config":·"workspace:^",␍
@repo/library:lint:biome:     57    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/library:lint:biome:     58    │ - ····"@types/d3":·"^7.4.3",␍

@repo/library:lint:biome:     59    │ - ····"@types/react":·"^19.2.14",␍
@repo/library:lint:biome:     60    │ - ····"@types/react-native":·"0.83.2",␍
@repo/library:lint:biome:     61    │ - ····"eslint":·"^9.38.0",␍
@repo/library:lint:biome:     62    │ - ····"react-i18next":·"^16.5.4",␍
@repo/library:lint:biome:     63    │ - ····"tailwindcss":·"3.4.17",␍
@repo/library:lint:biome:     64    │ - ····"typescript":·"^5.9.3",␍
@repo/library:lint:biome:     65    │ - ····"vitest":·"^2.1.9",␍
@repo/library:lint:biome:     66    │ - ····"vite-tsconfig-paths":·"^6.1.1"␍
@repo/library:lint:biome:     67    │ - ··},␍
@repo/library:lint:biome:     68    │ - ··"peerDependencies":·{␍
@repo/library:lint:biome:     69    │ - ····"@repo/ui":·"*",␍
@repo/library:lint:biome:     70    │ - ····"expo-audio":·"*",␍
@repo/library:lint:biome:     71    │ - ····"expo-file-system":·"*",␍
@repo/library:lint:biome:     72    │ - ····"expo-linking":·"*",␍
@repo/library:lint:biome:     73    │ - ····"expo-sharing":·"*",␍
@repo/library:lint:biome:     74    │ - ····"expo-sqlite":·"*",␍
@repo/library:lint:biome:     75    │ - ····"expo-video":·"*",␍

@repo/library:lint:biome:     76    │ - ····"lucide-react-native":·"*",␍
@repo/library:lint:biome:     77    │ - ····"react":·"19.2.0",␍
@repo/library:lint:biome:     78    │ - ····"react-i18next":·"*",␍
@repo/library:lint:biome:     79    │ - ····"react-native":·"0.83.2",␍
@repo/library:lint:biome:     80    │ - ····"react-native-gesture-handler":·"2.30.0",␍
@repo/library:lint:biome:     81    │ - ····"react-native-reanimated":·"3.16.7",␍

@repo/library:lint:biome:     82    │ - ····"@supabase/supabase-js":·"2.102.1",␍
@repo/library:lint:biome:     83    │ - ····"@supabase/postgrest-js":·"2.102.1"␍
@repo/library:lint:biome:     84    │ - ··}␍
@repo/library:lint:biome:     85    │ - }␍
@repo/library:lint:biome:         1 │ + {
@repo/library:lint:biome:         2 │ + ··"name":·"@repo/library",
@repo/library:lint:biome:         3 │ + ··"version":·"0.0.1",
@repo/library:lint:biome:         4 │ + ··"main":·"src/index.ts",
@repo/library:lint:biome:         5 │ + ··"types":·"src/index.ts",
@repo/library:lint:biome:         6 │ + ··"exports":·{

@repo/library:lint:biome:         7 │ + ····".":·"./src/index.ts",
@repo/library:lint:biome:         8 │ + ····"./components":·"./src/components/index.ts",
@repo/library:lint:biome:         9 │ + ····"./hooks":·"./src/hooks/index.ts",
@repo/library:lint:biome:        10 │ + ····"./screens":·"./src/screens/index.ts",
@repo/library:lint:biome:        11 │ + ····"./types":·"./src/types/index.ts",
@repo/library:lint:biome:        12 │ + ····"./api":·"./src/api/index.ts",
@repo/library:lint:biome:        13 │ + ····"./utils":·"./src/utils/index.ts",
@repo/library:lint:biome:        14 │ + ····"./screens/LibraryScreen.web":·"./src/screens/LibraryScreen.web.tsx",
@repo/library:lint:biome:        15 │ + ····"./screens/CollectionDetailScreen.web":·"./src/screens/CollectionDetailScreen.web.tsx",
@repo/library:lint:biome:        16 │ + ····"./screens/PDFViewerScreen.web":·"./src/screens/PDFViewerScreen.web.tsx",
@repo/library:lint:biome:        17 │ + ····"./screens/VideoPlayerScreen.web":·"./src/screens/VideoPlayerScreen.web.tsx",
@repo/library:lint:biome:        18 │ + ····"./screens/MapScreen.web":·"./src/screens/MapScreen.web.tsx",
@repo/library:lint:biome:        19 │ + ····"./screens/CuratorReviewScreen":·"./src/screens/CuratorReviewScreen.tsx",
@repo/library:lint:biome:        20 │ + ····"./package.json":·"./package.json"
@repo/library:lint:biome:        21 │ + ··},
@repo/library:lint:biome:        22 │ + ··"scripts":·{
@repo/library:lint:biome:        23 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",

@repo/library:lint:biome:        24 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/library:lint:biome:        25 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist",
@repo/library:lint:biome:        26 │ + ····"lint:biome":·"biome·check·.",
@repo/library:lint:biome:        27 │ + ····"lint:eslint":·"eslint·.",
@repo/library:lint:biome:        28 │ + ····"format":·"biome·format·--write·.",
@repo/library:lint:biome:        29 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/library:lint:biome:        30 │ + ····"test":·"vitest·run",
@repo/library:lint:biome:        31 │ + ····"test:watch":·"vitest",
@repo/library:lint:biome:        32 │ + ····"test:ui":·"vitest·--ui"
@repo/library:lint:biome:        33 │ + ··},
@repo/library:lint:biome:        34 │ + ··"dependencies":·{
@repo/library:lint:biome:        35 │ + ····"@repo/core":·"workspace:*",
@repo/library:lint:biome:        36 │ + ····"@repo/graphics":·"workspace:*",
@repo/library:lint:biome:        37 │ + ····"@repo/ui":·"workspace:*",

@repo/library:lint:biome:        38 │ + ····"nativewind":·"4.1.23",
@repo/library:lint:biome:        39 │ + ····"@tanstack/react-query":·"^5.90.20",

@repo/library:lint:biome:        40 │ + ····"d3":·"^7.9.0",
@repo/library:lint:biome:        41 │ + ····"lucide-react-native":·"^0.563.0",
@repo/library:lint:biome:        42 │ + ····"react-i18next":·"^16.5.4",
@repo/library:lint:biome:        43 │ + ····"react-native-gifted-charts":·"^1.4.76",
@repo/library:lint:biome:        44 │ + ····"react-native-linear-gradient":·"^2.8.3",
@repo/library:lint:biome:        45 │ + ····"react-native-gesture-handler":·"2.30.0",
@repo/library:lint:biome:        46 │ + ····"@expo/vector-icons":·"15.1.1",
@repo/library:lint:biome:        47 │ + ····"expo-linear-gradient":·"~55.0.13",
@repo/library:lint:biome:        48 │ + ····"react-native-maps":·"^1.27.2",

@repo/library:lint:biome:        49 │ + ····"@maplibre/maplibre-react-native":·"^10.4.2",
@repo/library:lint:biome:        50 │ + ····"expo-blur":·"~55.0.14",
@repo/library:lint:biome:        51 │ + ····"react-native-svg":·"15.15.3",
@repo/library:lint:biome:        52 │ + ····"@supabase/supabase-js":·"2.102.1",
@repo/library:lint:biome:        53 │ + ····"@supabase/postgrest-js":·"2.102.1"
@repo/library:lint:biome:        54 │ + ··},
@repo/library:lint:biome:        55 │ + ··"devDependencies":·{
@repo/library:lint:biome:        56 │ + ····"@repo/eslint-config":·"workspace:^",
@repo/library:lint:biome:        57 │ + ····"@repo/typescript-config":·"workspace:*",
@repo/library:lint:biome:        58 │ + ····"@types/d3":·"^7.4.3",

@repo/library:lint:biome:        59 │ + ····"@types/react":·"^19.2.14",
@repo/library:lint:biome:        60 │ + ····"@types/react-native":·"0.83.2",
@repo/library:lint:biome:        61 │ + ····"eslint":·"^9.38.0",
@repo/library:lint:biome:        62 │ + ····"react-i18next":·"^16.5.4",
@repo/library:lint:biome:        63 │ + ····"tailwindcss":·"3.4.17",
@repo/library:lint:biome:        64 │ + ····"typescript":·"^5.9.3",
@repo/library:lint:biome:        65 │ + ····"vitest":·"^2.1.9",
@repo/library:lint:biome:   21 more lines truncated
@repo/library:lint:biome:   

@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   
@repo/library:lint:biome:     1   │ - export·*·from·"./database";␍
@repo/library:lint:biome:     2   │ - export·*·from·"./library";␍
@repo/library:lint:biome:     3   │ - export·*·from·"./sync";␍
@repo/library:lint:biome:       1 │ + export·*·from·'./database';
@repo/library:lint:biome:       2 │ + export·*·from·'./library';

@repo/library:lint:biome:       3 │ + export·*·from·'./sync';
@repo/library:lint:biome:     4 4 │   
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\utils\externalLinks.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   
@repo/library:lint:biome:      1    │ - import·type·{·ExternalLinkOpenOptions·}·from·"@repo/ui/utils";␍
@repo/library:lint:biome:      2    │ - import·type·{·LibraryResource·}·from·"../types";␍
@repo/library:lint:biome:      3    │ - ␍
@repo/library:lint:biome:      4    │ - export·function·buildLibraryExternalLinkOptions(␍
@repo/library:lint:biome:      5    │ - → resource:·LibraryResource,␍
@repo/library:lint:biome:      6    │ - → sourceLabel·=·"Library",␍
@repo/library:lint:biome:      7    │ - ):·ExternalLinkOpenOptions·{␍
@repo/library:lint:biome:      8    │ - → const·trustLevel·=␍
@repo/library:lint:biome:      9    │ - → → resource.link_status·===·"broken"␍
@repo/library:lint:biome:     10    │ - → → → ?·"broken"␍
@repo/library:lint:biome:     11    │ - → → → :·resource.verified·||·resource.link_status·===·"working"␍
@repo/library:lint:biome:     12    │ - → → → → ?·"verified"␍
@repo/library:lint:biome:     13    │ - → → → → :·"external";␍
@repo/library:lint:biome:     14    │ - ␍
@repo/library:lint:biome:     15    │ - → const·sourceBadge·=␍

@repo/payments:lint:biome:      6    │ - export·*·from·"./service";␍

apps-gurudevi-marketing-web:lint:biome:       │       ^^^^^^^^^^^

apps-gurudevi-marketing-web:lint:biome:     3 │ ---
apps-gurudevi-marketing-web:lint:biome:     4 │ 
apps-gurudevi-marketing-web:lint:biome:   
@repo/profile:lint:biome:     52    │ - ····"@repo/eslint-config":·"workspace:^",␍
@repo/profile:lint:biome:     53    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/profile:lint:biome:     54    │ - ····"@types/react":·"^19.2.14",␍
@repo/profile:lint:biome:     55    │ - ····"@types/react-native":·"workspace:*",␍
apps-neevsk-web:lint:biome:     117     │ - → → "tech":·72,␍
apps-neevsk-web:lint:biome:     118     │ - → → "order":·76,␍

apps-neevsk-web:lint:biome:     119     │ - → → "draft":·21␍
apps-neevsk-web:lint:biome:     120     │ - → },␍
apps-neevsk-web:lint:biome:     121     │ - → "Polymath·Platform",␍
apps-neevsk-web:lint:biome:     122     │ - → "A·monorepo·for·intelligent·systems·and·personal·tools.·The·parent·ecosystem·for·all·child·apps.",␍
apps-neevsk-web:lint:biome:     123     │ - → "Lead·Architect",␍
apps-neevsk-web:lint:biome:     124     │ - → [73,·74,·75],␍
apps-neevsk-web:lint:biome:     125     │ - → "Turbo",␍
apps-neevsk-web:lint:biome:     126     │ - → "Astro",␍
apps-neevsk-web:lint:biome:     127     │ - → "TypeScript",␍
apps-neevsk-web:lint:biome:     128     │ - → 10,␍

apps-neevsk-web:lint:biome:     129     │ - → "The·Polymath·Platform·is·the·foundational·infrastructure·for·everything·we·build.·It·represents·the·shift·from·isolated·applications·to·a·unified·cybernetic·ecosystem.",␍
apps-neevsk-web:lint:biome:     130     │ - → "src/content/projects/polymath.md",␍
apps-neevsk-web:lint:biome:     131     │ - → "71d8e93849011284",␍
apps-neevsk-web:lint:biome:     132     │ - → {·"html":·81,·"metadata":·82·},␍
apps-neevsk-web:lint:biome:     133     │ - → "<p>The·Polymath·Platform·is·the·foundational·infrastructure·for·everything·we·build.·It·represents·the·shift·from·isolated·applications·to·a·unified·cybernetic·ecosystem.</p>",␍

apps-neevsk-web:lint:biome:     134     │ - → {␍
apps-neevsk-web:lint:biome:     135     │ - → → "headings":·83,␍
apps-neevsk-web:lint:biome:     136     │ - → → "localImagePaths":·84,␍
apps-neevsk-web:lint:biome:     137     │ - → → "remoteImagePaths":·85,␍
apps-neevsk-web:lint:biome:     138     │ - → → "frontmatter":·86,␍
apps-neevsk-web:lint:biome:     139     │ - → → "imagePaths":·88␍
apps-neevsk-web:lint:biome:     140     │ - → },␍
apps-neevsk-web:lint:biome:     141     │ - → [],␍
apps-neevsk-web:lint:biome:     142     │ - → [],␍
apps-neevsk-web:lint:biome:     143     │ - → [],␍

apps-neevsk-web:lint:biome:     144     │ - → {·"title":·69,·"description":·70,·"role":·71,·"tech":·87,·"order":·76·},␍
apps-neevsk-web:lint:biome:     145     │ - → [73,·74,·75],␍
apps-neevsk-web:lint:biome:     146     │ - → [],␍
apps-neevsk-web:lint:biome:     147     │ - → "polymath.md",␍
apps-neevsk-web:lint:biome:     148     │ - → "hall-of-flame",␍
apps-neevsk-web:lint:biome:     149     │ - → ["Map",·92,·93],␍
apps-neevsk-web:lint:biome:     150     │ - → "first-light",␍
apps-neevsk-web:lint:biome:   215 more lines truncated
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 

apps-neevsk-web:lint:biome: .astro\settings.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     1   │ - {␍
apps-neevsk-web:lint:biome:     2   │ - → "_variables":·{␍

apps-neevsk-web:lint:biome:     3   │ - → → "lastUpdateCheck":·1774109672672␍
apps-neevsk-web:lint:biome:     4   │ - → }␍
apps-neevsk-web:lint:biome:     5   │ - }␍
apps-neevsk-web:lint:biome:       1 │ + {
apps-neevsk-web:lint:biome:       2 │ + ··"_variables":·{
apps-neevsk-web:lint:biome:       3 │ + ····"lastUpdateCheck":·1774109672672
apps-neevsk-web:lint:biome:       4 │ + ··}
apps-neevsk-web:lint:biome:       5 │ + }
apps-neevsk-web:lint:biome:     6 6 │   

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: .astro\types.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:     1   │ - ///·<reference·types="astro/client"·/>␍
apps-neevsk-web:lint:biome:     2   │ - ///·<reference·path="content.d.ts"·/>
apps-neevsk-web:lint:biome:       1 │ + ///·<reference·types="astro/client"·/>
apps-neevsk-web:lint:biome:       2 │ + ///·<reference·path="content.d.ts"·/>

apps-neevsk-web:lint:biome:       3 │ + 
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: astro.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      1    │ - //·@ts-check␍

apps-neevsk-web:lint:biome:      2    │ - ␍
apps-neevsk-web:lint:biome:      3    │ - import·react·from·"@astrojs/react";␍
apps-neevsk-web:lint:biome:      4    │ - import·sitemap·from·"@astrojs/sitemap";␍
apps-neevsk-web:lint:biome:      5    │ - import·svelte·from·"@astrojs/svelte";␍
apps-neevsk-web:lint:biome:      6    │ - import·tailwindcss·from·"@tailwindcss/vite";␍
apps-neevsk-web:lint:biome:      7    │ - import·{·defineConfig·}·from·"astro/config";␍
apps-neevsk-web:lint:biome:      8    │ - ␍
apps-neevsk-web:lint:biome:      9    │ - //·https://astro.build/config␍
apps-neevsk-web:lint:biome:     10    │ - export·default·defineConfig({␍

apps-neevsk-web:lint:biome:     11    │ - → site:·"https://neevsk.edlove.org",␍
apps-neevsk-web:lint:biome:     12    │ - → vite:·{␍
apps-neevsk-web:lint:biome:     13    │ - → → plugins:·[tailwindcss()],␍
apps-neevsk-web:lint:biome:     14    │ - → → css:·{␍
apps-neevsk-web:lint:biome:     15    │ - → → → preprocessorOptions:·{␍
apps-neevsk-web:lint:biome:     16    │ - → → → → scss:·{␍

apps-neevsk-web:lint:biome:     17    │ - → → → → → additionalData:·`@use·"variables"·as·*;·`,␍
apps-neevsk-web:lint:biome:     18    │ - → → → → → loadPaths:·["src/styles"],␍
apps-neevsk-web:lint:biome:     19    │ - → → → → },␍
apps-neevsk-web:lint:biome:     20    │ - → → → },␍
apps-neevsk-web:lint:biome:     21    │ - → → },␍
apps-neevsk-web:lint:biome:     22    │ - → },␍
apps-neevsk-web:lint:biome:     23    │ - → integrations:·[svelte(),·react(),·sitemap()],␍
apps-neevsk-web:lint:biome:     24    │ - });␍
apps-neevsk-web:lint:biome:         1 │ + //·@ts-check
apps-neevsk-web:lint:biome:         2 │ + 

apps-neevsk-web:lint:biome:         3 │ + import·react·from·'@astrojs/react';
apps-neevsk-web:lint:biome:         4 │ + import·sitemap·from·'@astrojs/sitemap';
apps-neevsk-web:lint:biome:         5 │ + import·svelte·from·'@astrojs/svelte';
apps-neevsk-web:lint:biome:         6 │ + import·tailwindcss·from·'@tailwindcss/vite';
apps-neevsk-web:lint:biome:         7 │ + import·{·defineConfig·}·from·'astro/config';
apps-neevsk-web:lint:biome:         8 │ + 
apps-neevsk-web:lint:biome:         9 │ + //·https://astro.build/config
apps-neevsk-web:lint:biome:        10 │ + export·default·defineConfig({

apps-neevsk-web:lint:biome:        11 │ + ··site:·'https://neevsk.edlove.org',
apps-neevsk-web:lint:biome:        12 │ + ··vite:·{
apps-neevsk-web:lint:biome:        13 │ + ····plugins:·[tailwindcss()],
apps-neevsk-web:lint:biome:        14 │ + ····css:·{
apps-neevsk-web:lint:biome:        15 │ + ······preprocessorOptions:·{
apps-neevsk-web:lint:biome:        16 │ + ········scss:·{
apps-neevsk-web:lint:biome:        17 │ + ··········additionalData:·`@use·"variables"·as·*;·`,
apps-neevsk-web:lint:biome:        18 │ + ··········loadPaths:·['src/styles'],
apps-neevsk-web:lint:biome:        19 │ + ········},
apps-neevsk-web:lint:biome:        20 │ + ······},

apps-neevsk-web:lint:biome:        21 │ + ····},
apps-neevsk-web:lint:biome:        22 │ + ··},
apps-neevsk-web:lint:biome:        23 │ + ··integrations:·[svelte(),·react(),·sitemap()],
apps-neevsk-web:lint:biome:        24 │ + });
apps-neevsk-web:lint:biome:     25 25 │   
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      1    │ - {␍
apps-neevsk-web:lint:biome:      2    │ - ··"name":·"apps-neevsk-web",␍
apps-neevsk-web:lint:biome:      3    │ - ··"type":·"module",␍
apps-neevsk-web:lint:biome:      4    │ - ··"version":·"0.0.1",␍
apps-neevsk-web:lint:biome:      5    │ - ··"scripts":·{␍
apps-neevsk-web:lint:biome:      6    │ - ····"dev":·"pnpm·exec·astro·dev",␍

apps-neevsk-web:lint:biome:      7    │ - ····"build":·"pnpm·exec·astro·build",␍
apps-neevsk-web:lint:biome:      8    │ - ····"preview":·"pnpm·exec·astro·preview",␍
apps-neevsk-web:lint:biome:      9    │ - ····"astro":·"pnpm·exec·astro",␍
apps-neevsk-web:lint:biome:     10    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
apps-neevsk-web:lint:biome:     11    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
apps-neevsk-web:lint:biome:     12    │ - ····"lint:biome":·"biome·check·.",␍
apps-neevsk-web:lint:biome:     13    │ - ····"lint:eslint":·"eslint·.",␍
apps-neevsk-web:lint:biome:     14    │ - ····"format":·"biome·format·--write·.",␍
apps-neevsk-web:lint:biome:     15    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
apps-neevsk-web:lint:biome:     16    │ - ····"test":·"vitest·run",␍
apps-neevsk-web:lint:biome:     17    │ - ····"test:watch":·"vitest",␍
apps-neevsk-web:lint:biome:     18    │ - ····"test:ui":·"vitest·--ui",␍
apps-neevsk-web:lint:biome:     19    │ - ····"test:e2e":·"pnpm·exec·playwright·test",␍
apps-neevsk-web:lint:biome:     20    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
apps-neevsk-web:lint:biome:     21    │ - ··},␍
apps-neevsk-web:lint:biome:     22    │ - ··"dependencies":·{␍
apps-neevsk-web:lint:biome:     23    │ - ····"@astrojs/react":·"^5.0.3",␍
apps-neevsk-web:lint:biome:     24    │ - ····"@astrojs/sitemap":·"^3.6.0",␍
apps-neevsk-web:lint:biome:     25    │ - ····"@astrojs/svelte":·"^8.0.5",␍

apps-neevsk-web:lint:biome:     26    │ - ····"@tailwindcss/vite":·"^4.1.18",␍
apps-neevsk-web:lint:biome:     27    │ - ····"astro":·"^6.1.7",␍
apps-neevsk-web:lint:biome:     28    │ - ····"gsap":·"^3.14.2",␍
apps-neevsk-web:lint:biome:     29    │ - ····"react":·"19.1.0",␍
apps-neevsk-web:lint:biome:     30    │ - ····"react-dom":·"19.1.0",␍
apps-neevsk-web:lint:biome:     31    │ - ····"svelte":·"^5.55.4",␍
apps-neevsk-web:lint:biome:     32    │ - ····"tailwindcss":·"^4.1.18",␍
apps-neevsk-web:lint:biome:     33    │ - ····"typescript":·"^5.9.3"␍
apps-neevsk-web:lint:biome:     34    │ - ··},␍
apps-neevsk-web:lint:biome:     35    │ - ··"devDependencies":·{␍
apps-neevsk-web:lint:biome:     36    │ - ····"sass":·"^1.97.3",␍
apps-neevsk-web:lint:biome:     37    │ - ····"@repo/eslint-config":·"workspace:^",␍
apps-neevsk-web:lint:biome:     38    │ - ····"@repo/typescript-config":·"workspace:*",␍
apps-neevsk-web:lint:biome:     39    │ - ····"vitest":·"^2.1.9",␍
apps-neevsk-web:lint:biome:     40    │ - ····"vite-tsconfig-paths":·"^6.1.1",␍

@intuitui-labs/lk-edu-geo:lint:biome:     51 │ 		)

@repo/admin:lint:biome: src\analytics\types.ts:110:8 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 
@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.
@repo/admin:lint:biome:   
@repo/admin:lint:biome:     108 │ 	id: string;
@repo/admin:lint:biome:     109 │ 	configId: string;
@repo/admin:lint:biome:   > 110 │ 	data: any[];
@repo/admin:lint:biome:         │ 	      ^^^
@repo/admin:lint:biome:     111 │ 	metadata: {

@repo/admin:lint:biome:     112 │ 		generatedAt: string;
@repo/admin:lint:biome:   
@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 
@repo/admin:lint:biome: src\analytics\types.ts:123:8 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 
@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.

@repo/admin:lint:biome:   
@repo/admin:lint:biome:     121 │ 	type: "line" | "bar" | "pie" | "scatter" | "heatmap";
@repo/admin:lint:biome:     122 │ 	title: string;
@repo/admin:lint:biome:   > 123 │ 	data: any[];
@repo/admin:lint:biome:         │ 	      ^^^
@repo/admin:lint:biome:     124 │ 	config: ChartConfig;
@repo/admin:lint:biome:     125 │ };
@repo/admin:lint:biome:   
@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/admin:lint:biome:   

@repo/admin:lint:biome: 
@repo/admin:lint:biome: src\analytics\types.ts:203:19 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 
@repo/admin:lint:biome:   ! Unexpected any. Specify a different type.
@repo/admin:lint:biome:   
@repo/admin:lint:biome:     201 │ 	impact: string;
@repo/admin:lint:biome:     202 │ 	recommendations: string[];
@repo/admin:lint:biome:   > 203 │ 	supporting_data: any;
@repo/admin:lint:biome:         │ 	                 ^^^
@repo/admin:lint:biome:     204 │ 	generatedAt: string;

@repo/admin:lint:biome:     205 │ 	expiresAt?: string;
@repo/admin:lint:biome:   
@repo/admin:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 
@repo/admin:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 
@repo/admin:lint:biome:   × Formatter would have printed the following content:
@repo/admin:lint:biome:   
@repo/admin:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/react-internal";␍

@repo/admin:lint:biome:     2   │ - ␍
@repo/admin:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/admin:lint:biome:     4   │ - export·default·[...config];␍
@repo/admin:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/react-internal';
@repo/admin:lint:biome:       2 │ + 
@repo/admin:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/admin:lint:biome:       4 │ + export·default·[...config];
@repo/admin:lint:biome:     5 5 │   
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 
@repo/admin:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/admin:lint:biome: 
@repo/admin:lint:biome:   × Formatter would have printed the following content:
@repo/admin:lint:biome:   
@repo/admin:lint:biome:      1    │ - {␍
@repo/admin:lint:biome:      2    │ - ··"name":·"@repo/admin",␍
@repo/admin:lint:biome:      3    │ - ··"version":·"0.0.1",␍
@repo/admin:lint:biome:      4    │ - ··"main":·"src/index.ts",␍
@repo/admin:lint:biome:      5    │ - ··"types":·"src/index.ts",␍
@repo/admin:lint:biome:      6    │ - ··"exports":·{␍
@repo/admin:lint:biome:      7    │ - ····".":·"./src/index.ts",␍
@repo/payments:lint:biome:      7    │ - export·*·from·"./types";␍

apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unsafe fix: If this is intentional, prepend currentYear with an underscore.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1 1 │   
apps-gurudevi-marketing-web:lint:biome:     2   │ - const·currentYear·=·new·Date().getFullYear();
apps-gurudevi-marketing-web:lint:biome:       2 │ + const·_currentYear·=·new·Date().getFullYear();
apps-gurudevi-marketing-web:lint:biome:     3 3 │   
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\Header.astro:2:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This variable navItems is unused.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1 │ ---

apps-gurudevi-marketing-web:lint:biome:   > 2 │ const navItems = [
apps-gurudevi-marketing-web:lint:biome:       │       ^^^^^^^^
apps-gurudevi-marketing-web:lint:biome:     3 │ 	{ name: "About", href: "/about" },
apps-gurudevi-marketing-web:lint:biome:     4 │ 	{ name: "Thuthimal", href: "/thuthimal" },
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unsafe fix: If this is intentional, prepend navItems with an underscore.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1 1 │   
apps-gurudevi-marketing-web:lint:biome:     2   │ - const·navItems·=·[␍
apps-gurudevi-marketing-web:lint:biome:       2 │ + const·_navItems·=·[␍
apps-gurudevi-marketing-web:lint:biome:     3 3 │   	{ name: "About", href: "/about" },␍
apps-gurudevi-marketing-web:lint:biome:     4 4 │   	{ name: "Thuthimal", href: "/thuthimal" },␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatsSection.svelte:2:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This variable statDefs is unused.

apps-gurudevi-marketing-web:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:64:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     62 │ 		gnSql += `INSERT INTO geo_gn_divisions (id, ds_division_id, district_id, name, name_si, name_ta, gn_code, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     63 │ 		gnSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:   > 64 │ 			.map((gn: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │ 			          ^^^

@intuitui-labs/lk-edu-geo:lint:biome:     65 │ 				const lat = gn.location?.lat || 0;

@intuitui-labs/lk-edu-geo:lint:biome:     66 │ 				const lng = gn.location?.lng || 0;
apps-gurudevi-marketing-web:lint:biome:     1 │ <script lang="ts">
@repo/admin:lint:biome:      8    │ - ····"./founder":·"./src/entrypoints/founder.ts",␍
@repo/admin:lint:biome:      9    │ - ····"./reporting":·"./src/reporting.ts",␍
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
@repo/library:lint:biome:     16    │ - → → resource.link_status·===·"broken"␍
@repo/library:lint:biome:     17    │ - → → → ?·"Broken·or·unverified·link"␍

@repo/library:lint:biome:     18    │ - → → → :·resource.verified␍
@repo/library:lint:biome:     19    │ - → → → → ?·"Verified·source"␍
@repo/library:lint:biome:     20    │ - → → → → :·"External·source";␍
@repo/library:lint:biome:     21    │ - ␍

@repo/library:lint:biome:     22    │ - → return·{␍
@repo/library:lint:biome:     23    │ - → → title:·resource.title,␍

@repo/library:lint:biome:     24    │ - → → sourceLabel,␍
@repo/library:lint:biome:     25    │ - → → sourceBadge,␍
@repo/library:lint:biome:     26    │ - → → trustLevel,␍
@repo/library:lint:biome:     27    │ - → };␍
@repo/library:lint:biome:     28    │ - }␍
@repo/library:lint:biome:         1 │ + import·type·{·ExternalLinkOpenOptions·}·from·'@repo/ui/utils';
@repo/library:lint:biome:         2 │ + import·type·{·LibraryResource·}·from·'../types';
@repo/library:lint:biome:         3 │ + 
@intuitui-labs/lk-edu-geo:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   > 2 │ const statDefs = [
@repo/admin:lint:biome:     10    │ - ····"./invites":·"./src/invites.ts",␍
@repo/admin:lint:biome:     11    │ - ····"./observations":·"./src/observations.ts",␍
@repo/admin:lint:biome:     12    │ - ····"./bridge/founderWorkspace":·"./src/bridge/founderWorkspace.ts",␍

@repo/admin:lint:biome:     13    │ - ····"./screens/index":·"./src/screens/index.ts",␍
@repo/admin:lint:biome:     14    │ - ····"./screens/FounderDashboard":·"./src/screens/FounderDashboard.tsx",␍
@repo/admin:lint:biome:     15    │ - ····"./screens/FounderDashboard.web":·"./src/screens/FounderDashboard.web.tsx",␍
@repo/admin:lint:biome:     16    │ - ····"./screens/FounderSchoolDashboard":·"./src/screens/FounderSchoolDashboard.tsx",␍
@repo/admin:lint:biome:     17    │ - ····"./screens/AdminDashboard":·"./src/screens/AdminDashboard.tsx",␍
@repo/admin:lint:biome:     18    │ - ····"./screens/AdminDashboard.web":·"./src/screens/AdminDashboard.tsx",␍
@repo/admin:lint:biome:     19    │ - ····"./screens/AdminIncidentQueue":·"./src/screens/AdminIncidentQueue.tsx",␍
@repo/admin:lint:biome:     20    │ - ····"./screens/AdminTenantDetail":·"./src/screens/AdminTenantDetail.tsx",␍
@repo/admin:lint:biome:     21    │ - ····"./screens/AdminAuthorityRepair":·"./src/screens/AdminAuthorityRepair.tsx",␍
@repo/admin:lint:biome:     22    │ - ····"./screens/AdminJobControl":·"./src/screens/AdminJobControl.tsx",␍
@repo/admin:lint:biome:     23    │ - ····"./screens/AdminAuditLog":·"./src/screens/AdminAuditLog.tsx",␍
@repo/admin:lint:biome:     24    │ - ····"./screens/AdminReleaseControl":·"./src/screens/AdminReleaseControl.tsx",␍
@repo/library:lint:biome:         4 │ + export·function·buildLibraryExternalLinkOptions(
@repo/library:lint:biome:         5 │ + ··resource:·LibraryResource,
@repo/library:lint:biome:         6 │ + ··sourceLabel·=·'Library',
@repo/library:lint:biome:         7 │ + ):·ExternalLinkOpenOptions·{
@repo/library:lint:biome:         8 │ + ··const·trustLevel·=
@repo/library:lint:biome:         9 │ + ····resource.link_status·===·'broken'
@repo/library:lint:biome:        10 │ + ······?·'broken'
@repo/library:lint:biome:        11 │ + ······:·resource.verified·||·resource.link_status·===·'working'
@repo/library:lint:biome:        12 │ + ········?·'verified'
@repo/library:lint:biome:        13 │ + ········:·'external';
@repo/library:lint:biome:        14 │ + 
@repo/library:lint:biome:        15 │ + ··const·sourceBadge·=
@repo/library:lint:biome:        16 │ + ····resource.link_status·===·'broken'
@repo/library:lint:biome:        17 │ + ······?·'Broken·or·unverified·link'
@repo/library:lint:biome:        18 │ + ······:·resource.verified
@repo/library:lint:biome:        19 │ + ········?·'Verified·source'
@repo/library:lint:biome:        20 │ + ········:·'External·source';
@repo/library:lint:biome:        21 │ + 
@repo/library:lint:biome:        22 │ + ··return·{
@repo/library:lint:biome:        23 │ + ····title:·resource.title,
@repo/library:lint:biome:        24 │ + ····sourceLabel,
@repo/library:lint:biome:        25 │ + ····sourceBadge,
@repo/library:lint:biome:        26 │ + ····trustLevel,
@repo/library:lint:biome:        27 │ + ··};
@repo/library:lint:biome:        28 │ + }
@repo/library:lint:biome:     29 29 │   
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\utils\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   
@repo/library:lint:biome:     1   │ - export·*·from·"./externalLinks";␍
@repo/library:lint:biome:     2   │ - export·*·from·"./resourceLinks";␍
@repo/library:lint:biome:       1 │ + export·*·from·'./externalLinks';
@repo/library:lint:biome:       2 │ + export·*·from·'./resourceLinks';
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:       │       ^^^^^^^^
apps-gurudevi-marketing-web:lint:biome:     3 │ 	{
apps-gurudevi-marketing-web:lint:biome:     4 │ 		key: "teachers_count" as const,
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unsafe fix: If this is intentional, prepend statDefs with an underscore.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1    │ - const·statDefs·=·[␍
apps-gurudevi-marketing-web:lint:biome:         1 │ + const·_statDefs·=·[␍
apps-gurudevi-marketing-web:lint:biome:      2  2 │   	{␍
apps-gurudevi-marketing-web:lint:biome:      3  3 │   		key: "teachers_count" as const,␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatsSection.svelte:25:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This variable stats is unused.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     23 │ ];
apps-gurudevi-marketing-web:lint:biome:     24 │ 
apps-gurudevi-marketing-web:lint:biome:   > 25 │ const stats = {
apps-gurudevi-marketing-web:lint:biome:        │       ^^^^^
apps-gurudevi-marketing-web:lint:biome:     26 │ 	teachers_count: 0,
apps-gurudevi-marketing-web:lint:biome:     27 │ 	students_count: 0,
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unsafe fix: If this is intentional, prepend stats with an underscore.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     22 22 │   ];␍
apps-gurudevi-marketing-web:lint:biome:     23 23 │   ␍
apps-gurudevi-marketing-web:lint:biome:     24    │ - const·stats·=·{␍
apps-gurudevi-marketing-web:lint:biome:        24 │ + const·_stats·=·{␍
apps-gurudevi-marketing-web:lint:biome:     25 25 │   	teachers_count: 0,␍
apps-gurudevi-marketing-web:lint:biome:     26 26 │   	students_count: 0,␍
@repo/admin:lint:biome:     25    │ - ····"./screens/SchoolCreationScreen":·"./src/screens/SchoolCreationScreen.tsx",␍
@repo/admin:lint:biome:     26    │ - ····"./screens/SchoolForestScreen.web":·"./src/screens/SchoolForestScreen.web.tsx",␍
@repo/admin:lint:biome:     27    │ - ····"./screens/PrincipalDashboard.web":·"./src/screens/PrincipalDashboard.web.tsx",␍
@repo/library:lint:biome:     3 3 │   
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\utils\resourceLinks.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   
@repo/library:lint:biome:       1     │ - import·type·{·LibraryResource·}·from·"../types";␍
@repo/library:lint:biome:       2     │ - ␍
@repo/library:lint:biome:       3     │ - const·LIBRARY_SHARE_BASE_URL·=␍
@repo/library:lint:biome:       4     │ - → "https://platform.gurudevi.edlove.org/p/library/resource";␍
@repo/library:lint:biome:       5     │ - ␍
@repo/library:lint:biome:       6     │ - export·interface·ResourceCompanionLink·{␍
@repo/people:lint:biome:       2     │ - → Box,␍
@repo/library:lint:biome:       7     │ - → id:·string;␍
@repo/library:lint:biome:       8     │ - → label:·string;␍
@repo/library:lint:biome:       9     │ - → description:·string;␍
@repo/library:lint:biome:      10     │ - → url:·string;␍
@repo/library:lint:biome:      11     │ - → kind:·"primary"·|·"wikipedia"·|·"trailer"·|·"search"·|·"official";␍
@repo/library:lint:biome:      12     │ - }␍
@repo/library:lint:biome:      13     │ - ␍
@repo/library:lint:biome:      14     │ - function·isWikipediaUrl(url?:·string):·boolean·{␍
@repo/library:lint:biome:      15     │ - → return·typeof·url·===·"string"·&&·/wikipedia\.org/i.test(url);␍
@repo/library:lint:biome:      16     │ - }␍
@repo/library:lint:biome:      17     │ - ␍
@repo/library:lint:biome:      18     │ - function·isYouTubeUrl(url?:·string):·boolean·{␍
@repo/library:lint:biome:      19     │ - → return·typeof·url·===·"string"·&&·/(youtube\.com|youtu\.be)/i.test(url);␍
@repo/library:lint:biome:      20     │ - }␍
@repo/library:lint:biome:      21     │ - ␍
@repo/library:lint:biome:      22     │ - function·sanitizeTitle(title:·string):·string·{␍
@repo/library:lint:biome:      23     │ - → return·title␍
@repo/library:lint:biome:      24     │ - → → .replace(/[-–—]\s*(official\s*)?trailer/gi,·"")␍
@repo/library:lint:biome:      25     │ - → → .replace(/\((official\s*)?trailer\)/gi,·"")␍

@repo/library:lint:biome:      26     │ - → → .replace(/\((film|movie)\)/gi,·"")␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatsSection.svelte:32:10 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This function formatCount is unused.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     30 │ };
@repo/admin:lint:biome:     28    │ - ····"./screens/PrincipalDashboard":·"./src/screens/PrincipalDashboard.tsx",␍
@repo/admin:lint:biome:     29    │ - ····"./screens/principal/DashboardContent":·"./src/screens/principal/DashboardContent.tsx",␍
@repo/admin:lint:biome:     30    │ - ····"./screens/GradeHeadDashboard":·"./src/screens/GradeHeadDashboard.tsx",␍
@repo/admin:lint:biome:     31    │ - ····"./screens/SectionHeadDashboard":·"./src/screens/SectionHeadDashboard.tsx",␍
@repo/admin:lint:biome:     32    │ - ····"./screens/GuardianDashboard":·"./src/screens/GuardianDashboard.tsx",␍
@repo/admin:lint:biome:     33    │ - ····"./screens/GuardianDashboardScreen":·"./src/screens/GuardianDashboardScreen.tsx",␍
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:83:13 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     81 │ 	let postalSql = `-- Postal Towns\nINSERT INTO geo_postal_towns (id, district_id, city, postal_code, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     82 │ 	postalSql += `${postalUnits
@intuitui-labs/lk-edu-geo:lint:biome:   > 83 │ 		.map((pt: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │ 		          ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     84 │ 			const lat = pt.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     85 │ 			const lng = pt.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     31 │ 
@repo/admin:lint:biome:     34    │ - ····"./screens/GuardianStudentsScreen":·"./src/screens/guardian/GuardianStudentsScreen.tsx",␍
@repo/admin:lint:biome:     35    │ - ····"./screens/GuardianStudentDetailScreen":·"./src/screens/guardian/GuardianStudentDetailScreen.tsx",␍
@repo/library:lint:biome:      27     │ - → → .trim();␍
@repo/library:lint:biome:      28     │ - }␍
@repo/library:lint:biome:      29     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:99:13 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome:   > 32 │ function formatCount(value: number): string {
apps-gurudevi-marketing-web:lint:biome:        │          ^^^^^^^^^^^
@repo/admin:lint:biome:     36    │ - ····"./screens/GuardianNotificationsScreen":·"./src/screens/guardian/GuardianNotificationsScreen.tsx",␍
@repo/admin:lint:biome:     37    │ - ····"./screens/GuardianEventsScreen":·"./src/screens/guardian/GuardianEventsScreen.tsx",␍

@repo/admin:lint:biome:     38    │ - ····"./screens/GuardianCommunicationBridgeScreen":·"./src/screens/guardian/GuardianCommunicationBridgeScreen.tsx",␍
@repo/library:lint:biome:      30     │ - function·dedupeLinks(links:·ResourceCompanionLink[]):·ResourceCompanionLink[]·{␍
@repo/library:lint:biome:      31     │ - → const·seen·=·new·Set<string>();␍
@repo/library:lint:biome:      32     │ - → return·links.filter((link)·=>·{␍
@repo/library:lint:biome:      33     │ - → → if·(!link.url·||·seen.has(link.url))·return·false;␍
@repo/library:lint:biome:      34     │ - → → seen.add(link.url);␍
@repo/library:lint:biome:      35     │ - → → return·true;␍
@repo/library:lint:biome:      36     │ - → });␍
@repo/library:lint:biome:      37     │ - }␍
@repo/library:lint:biome:      38     │ - ␍
@repo/library:lint:biome:      39     │ - export·function·buildLibraryResourceShareUrl(resourceId:·string):·string·{␍
@repo/library:lint:biome:      40     │ - → return·`${LIBRARY_SHARE_BASE_URL}/${encodeURIComponent(resourceId)}`;␍
@repo/library:lint:biome:      41     │ - }␍

@repo/library:lint:biome:      42     │ - ␍
@repo/library:lint:biome:      43     │ - export·function·buildResourceCompanionLinks(␍
@repo/library:lint:biome:      44     │ - → resource:·LibraryResource,␍
@repo/library:lint:biome:      45     │ - ):·ResourceCompanionLink[]·{␍

@repo/library:lint:biome:      46     │ - → const·queryBase·=·sanitizeTitle(resource.title·||·"");␍
@repo/library:lint:biome:      47     │ - → const·primaryQuery·=·[queryBase,·resource.subjects?.[0],·resource.topics?.[0]]␍
@repo/library:lint:biome:      48     │ - → → .filter(Boolean)␍
@repo/library:lint:biome:      49     │ - → → .join("·");␍
@repo/library:lint:biome:      50     │ - → const·trailerQuery·=·`${queryBase·||·resource.title}·official·trailer`;␍
@repo/library:lint:biome:      51     │ - ␍

@repo/library:lint:biome:      52     │ - → const·links:·ResourceCompanionLink[]·=·[];␍
@repo/library:lint:biome:      53     │ - ␍
@repo/library:lint:biome:      54     │ - → if·(resource.url)·{␍
@repo/library:lint:biome:      55     │ - → → links.push({␍
@repo/library:lint:biome:      56     │ - → → → id:·"primary-source",␍
@repo/library:lint:biome:      57     │ - → → → label:·isWikipediaUrl(resource.url)␍
@repo/library:lint:biome:      58     │ - → → → → ?·"Wikipedia·entry"␍

@repo/library:lint:biome:      59     │ - → → → → :·isYouTubeUrl(resource.url)␍
@repo/library:lint:biome:      60     │ - → → → → → ?·"YouTube·source"␍
@repo/library:lint:biome:      61     │ - → → → → → :·"Original·source",␍
@repo/library:lint:biome:      62     │ - → → → description:·"Open·the·main·source·linked·to·this·resource.",␍
@repo/library:lint:biome:      63     │ - → → → url:·resource.url,␍
@repo/library:lint:biome:      64     │ - → → → kind:·"primary",␍

@repo/library:lint:biome:      65     │ - → → });␍
@repo/library:lint:biome:      66     │ - → }␍
@repo/library:lint:biome:      67     │ - ␍
@repo/library:lint:biome:      68     │ - → if·(!isWikipediaUrl(resource.url)·&&·queryBase)·{␍
@repo/library:lint:biome:      69     │ - → → links.push({␍
@repo/library:lint:biome:      70     │ - → → → id:·"wikipedia",␍

apps-gurudevi-marketing-web:lint:biome:     33 │ 	return new Intl.NumberFormat("en-US").format(value);
@repo/admin:lint:biome:     39    │ - ····"./screens/*":·"./src/screens/*",␍

@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:      97 │ 		schSql += `INSERT INTO edu_schools (id, census_no, name, gender, category, type_code, status, religion, website, socio_economic_tier, province_id, district_id, gn_division_id, zone_id, division_id, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:      98 │ 		schSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:    > 99 │ 			.map((s: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:         │ 			         ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     100 │ 				const lat = s.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     101 │ 				const lng = s.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:123:13 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome:       3     │ - → Heading,␍
apps-neevsk-web:lint:biome:     41    │ - ····"eslint":·"^9.38.0",␍

gurudevi-mobile:lint:biome: supabase\functions\library-etl\index.ts:137:40 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
@repo/profile:lint:biome:     56    │ - ····"@vitest/ui":·"^4.1.5",␍
@repo/profile:lint:biome:     57    │ - ····"eslint":·"^9.38.0",␍
@repo/profile:lint:biome:     58    │ - ····"typescript":·"^5.9.3",␍
@repo/profile:lint:biome:     59    │ - ····"vite-tsconfig-paths":·"^6.1.1",␍
@repo/profile:lint:biome:     60    │ - ····"vitest":·"^2.1.9"␍
@repo/profile:lint:biome:     61    │ - ··},␍
@repo/profile:lint:biome:     62    │ - ··"peerDependencies":·{␍
@repo/profile:lint:biome:     63    │ - ····"@repo/ui":·"*",␍
@repo/profile:lint:biome:     64    │ - ····"lucide-react-native":·"*",␍
@repo/profile:lint:biome:     65    │ - ····"react":·"*",␍

@repo/profile:lint:biome:     66    │ - ····"react-i18next":·"*",␍
@repo/profile:lint:biome:     67    │ - ····"react-native":·"*",␍
@repo/profile:lint:biome:     68    │ - ····"@react-navigation/native":·"*",␍
@repo/profile:lint:biome:     69    │ - ····"@react-native-async-storage/async-storage":·"*"␍
@repo/profile:lint:biome:     70    │ - ··}␍
@repo/profile:lint:biome:     71    │ - }␍
@repo/profile:lint:biome:        46 │ + ····"react-i18next":·"^16.5.4",
@repo/profile:lint:biome:        47 │ + ····"react-native-reanimated":·"^4.2.1",
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
@repo/payments:lint:biome:      1    │ - import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·"../types";␍

apps-gurudevi-marketing-web:lint:biome:     34 │ }
@repo/library:lint:biome:      71     │ - → → → label:·"Wikipedia·context",␍
@repo/library:lint:biome:      72     │ - → → → description:·"Ground·the·topic·with·a·quick·encyclopedic·overview.",␍
@repo/library:lint:biome:      73     │ - → → → url:·`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(queryBase)}`,␍
@repo/library:lint:biome:      74     │ - → → → kind:·"wikipedia",␍

@repo/library:lint:biome:      75     │ - → → });␍
@repo/library:lint:biome:      76     │ - → }␍
@repo/library:lint:biome:      77     │ - ␍
@repo/library:lint:biome:      78     │ - → if·(␍

@repo/library:lint:biome:      79     │ - → → !isYouTubeUrl(resource.url)·&&␍
@repo/library:lint:biome:      80     │ - → → (resource.type·===·"movie_trailer"·||␍
@repo/library:lint:biome:      81     │ - → → → resource.type·===·"video"·||␍
@repo/library:lint:biome:      82     │ - → → → queryBase.length·>·0)␍
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
apps-neevsk-web:lint:biome:     42    │ - ····"@playwright/test":·"^1.55.0"␍
gurudevi-mobile:lint:biome:     136 │ 			// 4. Update resource with enriched topics + embedding

@repo/payments:lint:biome:      2    │ - ␍
@repo/payments:lint:biome:      3    │ - export·class·PayHereProvider·implements·PaymentProvider·{␍
@repo/admin:lint:biome:     40    │ - ····"./components/*":·"./src/components/*",␍
apps-gurudevi-marketing-web:lint:biome:   

apps-edlove-web:lint:biome:        13 │ + ····origin:·z.string().optional(),
@repo/library:lint:biome:      83     │ - → )·{␍
@repo/library:lint:biome:      84     │ - → → links.push({␍
@repo/library:lint:biome:      85     │ - → → → id:·"trailer-or-video",␍
@repo/library:lint:biome:      86     │ - → → → label:␍

@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     121 │ 		statsSql += `INSERT INTO edu_school_registry_stats (school_id, academic_year, total_students, students_boys, students_girls, total_teachers, medium, grade_span, difficulty_level) VALUES\n`;
apps-neevsk-web:lint:biome:     43    │ - ··}␍
gurudevi-mobile:lint:biome:   > 137 │ 			const updatePayload: Record<string, any> = {
@repo/payments:lint:biome:      4    │ - → id·=·"payhere";␍

@repo/payments:lint:biome:      5    │ - → name·=·"PayHere·(Sri·Lanka)";␍
apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:        14 │ + ····coreLogic:·z.string().optional(),
@repo/library:lint:biome:      87     │ - → → → → resource.type·===·"movie_trailer"·?·"Trailer·search"·:·"Video·search",␍

@repo/library:lint:biome:      88     │ - → → → description:␍
@repo/people:lint:biome:       4     │ - → HStack,␍
@repo/library:lint:biome:      89     │ - → → → → "Look·for·related·trailers,·lectures,·or·visual·explainers·on·YouTube.",␍
@repo/people:lint:biome:       5     │ - → Icon,␍
@repo/library:lint:biome:      90     │ - → → → url:·`https://www.youtube.com/results?search_query=${encodeURIComponent(␍
@repo/people:lint:biome:       6     │ - → Pressable,␍

apps-neevsk-web:lint:biome:     44    │ - }␍
apps-neevsk-web:lint:biome:         1 │ + {
gurudevi-mobile:lint:biome:         │ 			                                    ^^^
@repo/admin:lint:biome:     41    │ - ····"./package.json":·"./package.json"␍
@repo/admin:lint:biome:     42    │ - ··},␍

@repo/payments:lint:biome:      6    │ - ␍
apps-gurudevi-marketing-web:lint:biome:   
@repo/library:lint:biome:      91     │ - → → → → resource.type·===·"movie_trailer"␍
@repo/library:lint:biome:      92     │ - → → → → → ?·trailerQuery␍

@repo/people:lint:biome:       7     │ - → Spinner,␍
@intuitui-labs/lk-edu-geo:lint:biome:     122 │ 		statsSql += `${batch
apps-neevsk-web:lint:biome:         2 │ + ··"name":·"apps-neevsk-web",
apps-neevsk-web:lint:biome:         3 │ + ··"type":·"module",
gurudevi-mobile:lint:biome:     138 │ 				topics: [...new Set(enrichedTopics)], // dedupe

@repo/admin:lint:biome:     43    │ - ··"scripts":·{␍
@repo/admin:lint:biome:     44    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
apps-edlove-web:lint:biome:        15 │ + ····draft:·z.boolean().default(false),
@repo/admin:lint:biome:     45    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@repo/admin:lint:biome:     46    │ - ····"lint:biome":·"biome·check·.",␍
@repo/admin:lint:biome:     47    │ - ····"lint:eslint":·"eslint·.",␍

apps-gurudevi-marketing-web:lint:biome:   i Unsafe fix: If this is intentional, prepend formatCount with an underscore.
@repo/admin:lint:biome:     48    │ - ····"format":·"biome·format·--write·.",␍
@repo/library:lint:biome:      93     │ - → → → → → :·primaryQuery·||·resource.title,␍
@repo/library:lint:biome:      94     │ - → → → )}`,␍

@repo/people:lint:biome:       8     │ - → Text,␍
@intuitui-labs/lk-edu-geo:lint:biome:   > 123 │ 			.map((s: any) => {
apps-neevsk-web:lint:biome:         4 │ + ··"version":·"0.0.1",
apps-neevsk-web:lint:biome:         5 │ + ··"scripts":·{

@repo/people:lint:biome:       9     │ - → VStack,␍
apps-neevsk-web:lint:biome:         6 │ + ····"dev":·"pnpm·exec·astro·dev",
@repo/library:lint:biome:      95     │ - → → → kind:·"trailer",␍
@repo/library:lint:biome:      96     │ - → → });␍
@repo/admin:lint:biome:     49    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍

@repo/people:lint:biome:      10     │ - }·from·"@repo/ui/primitives";␍
@intuitui-labs/lk-edu-geo:lint:biome:         │ 			         ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     124 │ 				return `('${s.id}', 2024, ${s.total_students || 0}, ${s.students_boys || 0}, ${s.students_girls || 0}, ${s.total_teachers || 0}, '${escape(s.medium || "")}', '${escape(s.grade_span || "")}', '${escape(s.difficulty_level || "")}')`;
apps-neevsk-web:lint:biome:         7 │ + ····"build":·"pnpm·exec·astro·build",

@repo/payments:lint:biome:      7    │ - → async·initializePayment(␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     29 29 │   };␍
apps-gurudevi-marketing-web:lint:biome:     30 30 │   ␍
@repo/library:lint:biome:      97     │ - → }␍

@repo/library:lint:biome:      98     │ - ␍
@repo/admin:lint:biome:     50    │ - ····"test":·"vitest·run",␍
@repo/people:lint:biome:      11     │ - import·{·hapticLight·}·from·"@repo/ui/utils/haptics";␍
@repo/people:lint:biome:      12     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:     125 │ 			})

apps-neevsk-web:lint:biome:         8 │ + ····"preview":·"pnpm·exec·astro·preview",
apps-neevsk-web:lint:biome:         9 │ + ····"astro":·"pnpm·exec·astro",
@repo/payments:lint:biome:      8    │ - → → amount:·number,␍
apps-gurudevi-marketing-web:lint:biome:     31    │ - function·formatCount(value:·number):·string·{␍

apps-gurudevi-marketing-web:lint:biome:        31 │ + function·_formatCount(value:·number):·string·{␍
@repo/admin:lint:biome:     51    │ - ····"test:watch":·"vitest",␍
@repo/people:lint:biome:      13     │ - import·{·format·}·from·"date-fns";␍

@repo/people:lint:biome:      14     │ - import·{␍
@repo/people:lint:biome:      15     │ - → Calendar,␍
@repo/people:lint:biome:      16     │ - → CheckCircle2,␍
@repo/people:lint:biome:      17     │ - → Clock,␍

@repo/people:lint:biome:      18     │ - → LogIn,␍
apps-neevsk-web:lint:biome:        10 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/payments:lint:biome:      9    │ - → → currency:·string,␍
@repo/payments:lint:biome:     10    │ - → → metadata?:·any,␍

@repo/payments:lint:biome:     11    │ - → ):·Promise<PaymentIntent>·{␍
@repo/admin:lint:biome:     52    │ - ····"test:ui":·"vitest·--ui",␍
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@repo/people:lint:biome:      19     │ - → LogOut,␍
@repo/people:lint:biome:      20     │ - }·from·"lucide-react-native";␍

@repo/people:lint:biome:      21     │ - import·type·React·from·"react";␍
@repo/people:lint:biome:      22     │ - import·{·useState·}·from·"react";␍
@repo/people:lint:biome:      23     │ - import·{·useTranslation·}·from·"react-i18next";␍
@repo/payments:lint:biome:     12    │ - → → //·In·a·real·implementation,·this·would·call·PayHere·API·to·get·a·checkout·URL·or·token.␍

@repo/admin:lint:biome:     53    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
@repo/admin:lint:biome:     54    │ - ··},␍
@intuitui-labs/lk-edu-geo:lint:biome: src\types.ts:147:30 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome:        11 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@intuitui-labs/lk-edu-geo:lint:biome: 

apps-neevsk-web:lint:biome:        12 │ + ····"lint:biome":·"biome·check·.",
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
apps-neevsk-web:lint:biome:        13 │ + ····"lint:eslint":·"eslint·.",
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     145 │ 	total_teachers?: number;
@repo/admin:lint:biome:     55    │ - ··"dependencies":·{␍

@repo/admin:lint:biome:     56    │ - ····"@repo/ai":·"workspace:*",␍
@repo/admin:lint:biome:     57    │ - ····"@repo/analytics":·"workspace:*",␍
@repo/payments:lint:biome:     13    │ - → → //·For·now,·we·return·a·mock·intent.␍

@repo/payments:lint:biome:     14    │ - → → return·{␍
apps-neevsk-web:lint:biome:        14 │ + ····"format":·"biome·format·--write·.",
@intuitui-labs/lk-edu-geo:lint:biome:     146 │ 	difficulty_level?: string;

@repo/admin:lint:biome:     58    │ - ····"@repo/community":·"workspace:*",␍
@repo/payments:lint:biome:     15    │ - → → → id:·`ph_${Math.random().toString(36).substr(2,·9)}`,␍
@repo/payments:lint:biome:     16    │ - → → → amount,␍
apps-gurudevi-marketing-web:lint:biome:     32 32 │   	return new Intl.NumberFormat("en-US").format(value);␍

apps-gurudevi-marketing-web:lint:biome:     33 33 │   }␍
apps-neevsk-web:lint:biome:        15 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
apps-neevsk-web:lint:biome:        16 │ + ····"test":·"vitest·run",
apps-neevsk-web:lint:biome:        17 │ + ····"test:watch":·"vitest",
@intuitui-labs/lk-edu-geo:lint:biome:   > 147 │ 	properties?: Record<string, any>;

@intuitui-labs/lk-edu-geo:lint:biome:         │ 	                            ^^^
@repo/admin:lint:biome:     59    │ - ····"@repo/core":·"workspace:*",␍
@repo/admin:lint:biome:     60    │ - ····"@repo/graphics":·"workspace:*",␍
@repo/payments:lint:biome:     17    │ - → → → currency,␍
@repo/payments:lint:biome:     18    │ - → → → status:·"pending",␍
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome: 
apps-neevsk-web:lint:biome:        18 │ + ····"test:ui":·"vitest·--ui",
apps-neevsk-web:lint:biome:        19 │ + ····"test:e2e":·"pnpm·exec·playwright·test",
apps-neevsk-web:lint:biome:        20 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
apps-neevsk-web:lint:biome:        21 │ + ··},
@intuitui-labs/lk-edu-geo:lint:biome:     148 │ }

@repo/admin:lint:biome:     61    │ - ····"@repo/library":·"workspace:*",␍
@repo/admin:lint:biome:     62    │ - ····"@repo/people":·"workspace:*",␍
@repo/admin:lint:biome:     63    │ - ····"@repo/profile":·"workspace:*",␍
@repo/payments:lint:biome:     19    │ - → → → provider:·this.id,␍

@repo/payments:lint:biome:     20    │ - → → → metadata,␍
@repo/payments:lint:biome:     21    │ - → → };␍
apps-neevsk-web:lint:biome:        22 │ + ··"dependencies":·{
apps-neevsk-web:lint:biome:        23 │ + ····"@astrojs/react":·"^5.0.3",
@intuitui-labs/lk-edu-geo:lint:biome:     149 │ 

@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome: .astro\data-store.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome:     22    │ - → }␍
@repo/payments:lint:biome:     23    │ - ␍

apps-neevsk-web:lint:biome:        24 │ + ····"@astrojs/sitemap":·"^3.6.0",
apps-neevsk-web:lint:biome:        25 │ + ····"@astrojs/svelte":·"^8.0.5",
@repo/admin:lint:biome:         1 │ + {
@repo/admin:lint:biome:         2 │ + ··"name":·"@repo/admin",
@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1    │ - [␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - → ["Map",·1,·2],␍

apps-gurudevi-marketing-web:lint:biome:      3    │ - → "meta::meta",␍
@repo/payments:lint:biome:     24    │ - → async·verifyPayment(_paymentIntentId:·string):·Promise<PaymentStatus>·{␍
apps-neevsk-web:lint:biome:        26 │ + ····"@tailwindcss/vite":·"^4.1.18",
apps-neevsk-web:lint:biome:        27 │ + ····"astro":·"^6.1.7",
@repo/admin:lint:biome:         3 │ + ··"version":·"0.0.1",

@repo/admin:lint:biome:         4 │ + ··"main":·"src/index.ts",
@intuitui-labs/lk-edu-geo:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome:      4    │ - → ["Map",·3,·4,·5,·6],␍

apps-gurudevi-marketing-web:lint:biome:      5    │ - → "astro-version",␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - → "5.17.3",␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - → "astro-config-digest",␍
apps-gurudevi-marketing-web:lint:biome:      8    │ - → "{\"root\":{},\"srcDir\":{},\"publicDir\":{},\"outDir\":{},\"cacheDir\":{},\"compressHTML\":true,\"base\":\"/\",\"trailingSlash\":\"ignore\",\"output\":\"static\",\"scopedStyleStrategy\":\"attribute\",\"build\":{\"format\":\"directory\",\"client\":{},\"server\":{},\"assets\":\"_astro\",\"serverEntry\":\"entry.mjs\",\"redirects\":true,\"inlineStylesheets\":\"auto\",\"concurrency\":1},\"server\":{\"open\":false,\"host\":false,\"port\":4321,\"streaming\":true,\"allowedHosts\":[]},\"redirects\":{},\"image\":{\"endpoint\":{\"route\":\"/_image\"},\"service\":{\"entrypoint\":\"astro/assets/services/sharp\",\"config\":{}},\"domains\":[],\"remotePatterns\":[],\"responsiveStyles\":false},\"devToolbar\":{\"enabled\":true},\"markdown\":{\"syntaxHighlight\":{\"type\":\"shiki\",\"excludeLangs\":[\"math\"]},\"shikiConfig\":{\"langs\":[],\"langAlias\":{},\"theme\":\"github-dark\",\"themes\":{},\"wrap\":false,\"transformers\":[]},\"remarkPlugins\":[],\"rehypePlugins\":[],\"remarkRehype\":{},\"gfm\":true,\"smartypants\":true},\"security\":{\"checkOrigin\":true,\"allowedDomains\":[]},\"env\":{\"schema\":{},\"validateSecrets\":false},\"experimental\":{\"clientPrerender\":false,\"contentIntellisense\":false,\"headingIdCompat\":false,\"preserveScriptOrder\":false,\"liveContentCollections\":false,\"csp\":false,\"staticImportMetaEnv\":false,\"chromeDevtoolsWorkspace\":false,\"failOnPrerenderConflict\":false,\"svgo\":false},\"legacy\":{\"collections\":false}}"␍

@repo/payments:lint:biome:     25    │ - → → //·Real·check·against·PayHere·API·or·Webhook·status.␍

apps-neevsk-web:lint:biome:        28 │ + ····"gsap":·"^3.14.2",

apps-gurudevi-marketing-web:lint:biome:      9    │ - ]␍
@repo/admin:lint:biome:         5 │ + ··"types":·"src/index.ts",
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   × Formatter would have printed the following content:
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:      1    │ - {␍
@intuitui-labs/lk-edu-geo:lint:biome:      2    │ - ··"name":·"@intuitui-labs/lk-edu-geo",␍
@intuitui-labs/lk-edu-geo:lint:biome:      3    │ - ··"version":·"1.0.0",␍

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
@intuitui-labs/lk-edu-geo:lint:biome:     32    │ - ··"packageManager":·"pnpm@10.30.2",␍
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
@intuitui-labs/lk-edu-geo:lint:biome:         1 │ + {
@intuitui-labs/lk-edu-geo:lint:biome:         2 │ + ··"name":·"@intuitui-labs/lk-edu-geo",
@intuitui-labs/lk-edu-geo:lint:biome:         3 │ + ··"version":·"1.0.0",
@intuitui-labs/lk-edu-geo:lint:biome:         4 │ + ··"description":·"Sri·Lanka·educational·and·administrative·geo·data",
@intuitui-labs/lk-edu-geo:lint:biome:         5 │ + ··"type":·"module",
@intuitui-labs/lk-edu-geo:lint:biome:         6 │ + ··"exports":·{
@intuitui-labs/lk-edu-geo:lint:biome:         7 │ + ····".":·{
@intuitui-labs/lk-edu-geo:lint:biome:         8 │ + ······"types":·"./dist/index.d.ts",
@intuitui-labs/lk-edu-geo:lint:biome:         9 │ + ······"import":·"./dist/index.js",

@intuitui-labs/lk-edu-geo:lint:biome:        10 │ + ······"require":·"./dist/index.cjs"
@intuitui-labs/lk-edu-geo:lint:biome:        11 │ + ····},
@intuitui-labs/lk-edu-geo:lint:biome:        12 │ + ····"./package.json":·"./package.json"
@intuitui-labs/lk-edu-geo:lint:biome:        13 │ + ··},
@intuitui-labs/lk-edu-geo:lint:biome:        14 │ + ··"main":·"./dist/index.cjs",
@intuitui-labs/lk-edu-geo:lint:biome:        15 │ + ··"module":·"./dist/index.js",
@intuitui-labs/lk-edu-geo:lint:biome:        16 │ + ··"types":·"./dist/index.d.ts",
@intuitui-labs/lk-edu-geo:lint:biome:        17 │ + ··"files":·[
@intuitui-labs/lk-edu-geo:lint:biome:        18 │ + ····"dist",

@intuitui-labs/lk-edu-geo:lint:biome:        19 │ + ····"data"
@intuitui-labs/lk-edu-geo:lint:biome:        20 │ + ··],
@intuitui-labs/lk-edu-geo:lint:biome:        21 │ + ··"keywords":·[
@intuitui-labs/lk-edu-geo:lint:biome:        22 │ + ····"sri-lanka",
@intuitui-labs/lk-edu-geo:lint:biome:        23 │ + ····"lk",
@intuitui-labs/lk-edu-geo:lint:biome:        24 │ + ····"education",
@intuitui-labs/lk-edu-geo:lint:biome:        25 │ + ····"geo",
@intuitui-labs/lk-edu-geo:lint:biome:        26 │ + ····"schools",

@intuitui-labs/lk-edu-geo:lint:biome:        27 │ + ····"districts",
@repo/payments:lint:biome:     26    │ - → → return·"succeeded";␍
@repo/library:lint:biome:      99     │ - → if·(primaryQuery)·{␍
apps-neevsk-web:lint:biome:        29 │ + ····"react":·"19.1.0",
@repo/library:lint:biome:     100     │ - → → links.push({␍
apps-neevsk-web:lint:biome:        30 │ + ····"react-dom":·"19.1.0",

apps-neevsk-web:lint:biome:        31 │ + ····"svelte":·"^5.55.4",
@repo/admin:lint:biome:         6 │ + ··"exports":·{
@repo/admin:lint:biome:         7 │ + ····".":·"./src/index.ts",
@repo/admin:lint:biome:         8 │ + ····"./founder":·"./src/entrypoints/founder.ts",
@repo/admin:lint:biome:         9 │ + ····"./reporting":·"./src/reporting.ts",
@repo/admin:lint:biome:        10 │ + ····"./invites":·"./src/invites.ts",
@repo/admin:lint:biome:        11 │ + ····"./observations":·"./src/observations.ts",

@repo/payments:lint:biome:     27    │ - → }␍
apps-gurudevi-marketing-web:lint:biome:         1 │ + [
apps-gurudevi-marketing-web:lint:biome:         2 │ + ··["Map",·1,·2],
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··"meta::meta",
apps-gurudevi-marketing-web:lint:biome:         4 │ + ··["Map",·3,·4,·5,·6],
apps-gurudevi-marketing-web:lint:biome:         5 │ + ··"astro-version",

apps-gurudevi-marketing-web:lint:biome:         6 │ + ··"5.17.3",
apps-gurudevi-marketing-web:lint:biome:         7 │ + ··"astro-config-digest",
apps-gurudevi-marketing-web:lint:biome:         8 │ + ··"{\"root\":{},\"srcDir\":{},\"publicDir\":{},\"outDir\":{},\"cacheDir\":{},\"compressHTML\":true,\"base\":\"/\",\"trailingSlash\":\"ignore\",\"output\":\"static\",\"scopedStyleStrategy\":\"attribute\",\"build\":{\"format\":\"directory\",\"client\":{},\"server\":{},\"assets\":\"_astro\",\"serverEntry\":\"entry.mjs\",\"redirects\":true,\"inlineStylesheets\":\"auto\",\"concurrency\":1},\"server\":{\"open\":false,\"host\":false,\"port\":4321,\"streaming\":true,\"allowedHosts\":[]},\"redirects\":{},\"image\":{\"endpoint\":{\"route\":\"/_image\"},\"service\":{\"entrypoint\":\"astro/assets/services/sharp\",\"config\":{}},\"domains\":[],\"remotePatterns\":[],\"responsiveStyles\":false},\"devToolbar\":{\"enabled\":true},\"markdown\":{\"syntaxHighlight\":{\"type\":\"shiki\",\"excludeLangs\":[\"math\"]},\"shikiConfig\":{\"langs\":[],\"langAlias\":{},\"theme\":\"github-dark\",\"themes\":{},\"wrap\":false,\"transformers\":[]},\"remarkPlugins\":[],\"rehypePlugins\":[],\"remarkRehype\":{},\"gfm\":true,\"smartypants\":true},\"security\":{\"checkOrigin\":true,\"allowedDomains\":[]},\"env\":{\"schema\":{},\"validateSecrets\":false},\"experimental\":{\"clientPrerender\":false,\"contentIntellisense\":false,\"headingIdCompat\":false,\"preserveScriptOrder\":false,\"liveContentCollections\":false,\"csp\":false,\"staticImportMetaEnv\":false,\"chromeDevtoolsWorkspace\":false,\"failOnPrerenderConflict\":false,\"svgo\":false},\"legacy\":{\"collections\":false}}"
apps-gurudevi-marketing-web:lint:biome:         9 │ + ]

apps-gurudevi-marketing-web:lint:biome:     10 10 │   
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: .astro\settings.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1   │ - {␍

apps-gurudevi-marketing-web:lint:biome:     2   │ - → "_variables":·{␍
apps-gurudevi-marketing-web:lint:biome:     3   │ - → → "lastUpdateCheck":·1774109672565␍
apps-gurudevi-marketing-web:lint:biome:     4   │ - → }␍
apps-gurudevi-marketing-web:lint:biome:     5   │ - }␍
apps-gurudevi-marketing-web:lint:biome:       1 │ + {
apps-gurudevi-marketing-web:lint:biome:       2 │ + ··"_variables":·{
@repo/library:lint:biome:     101     │ - → → → id:·"web-search",␍

apps-neevsk-web:lint:biome:        32 │ + ····"tailwindcss":·"^4.1.18",
@repo/payments:lint:biome:     28    │ - ␍
@repo/payments:lint:biome:     29    │ - → getFeeEstimate(amount:·number):·number·{␍
apps-gurudevi-marketing-web:lint:biome:       3 │ + ····"lastUpdateCheck":·1774109672565

@repo/library:lint:biome:     102     │ - → → → label:·"Broader·web·search",␍
apps-gurudevi-marketing-web:lint:biome:       4 │ + ··}
apps-neevsk-web:lint:biome:        33 │ + ····"typescript":·"^5.9.3"
apps-neevsk-web:lint:biome:        34 │ + ··},
apps-neevsk-web:lint:biome:        35 │ + ··"devDependencies":·{
apps-neevsk-web:lint:biome:        36 │ + ····"sass":·"^1.97.3",

apps-gurudevi-marketing-web:lint:biome:       5 │ + }
apps-gurudevi-marketing-web:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/library:lint:biome:     103     │ - → → → description:␍
@repo/library:lint:biome:     104     │ - → → → → "Find·official·sites,·reviews,·or·broader·context·outside·the·app.",␍
apps-neevsk-web:lint:biome:        37 │ + ····"@repo/eslint-config":·"workspace:^",

@repo/payments:lint:biome:     30    │ - → → //·PayHere·typically·has·~2.6%·-·3.3%·+·fixed·fee·for·cards.␍
apps-neevsk-web:lint:biome:        38 │ + ····"@repo/typescript-config":·"workspace:*",
apps-gurudevi-marketing-web:lint:biome: Diagnostics not shown: 146.
apps-gurudevi-marketing-web:lint:biome:     6 6 │   
apps-gurudevi-marketing-web:lint:biome:   
@repo/library:lint:biome:     105     │ - → → → url:·`https://duckduckgo.com/?q=${encodeURIComponent(primaryQuery)}`,␍

@repo/library:lint:biome:     106     │ - → → → kind:·"search",␍
@repo/library:lint:biome:     107     │ - → → });␍
@repo/library:lint:biome:     108     │ - → }␍
@repo/library:lint:biome:     109     │ - ␍
@repo/library:lint:biome:     110     │ - → return·dedupeLinks(links);␍
@repo/library:lint:biome:     111     │ - }␍
@repo/library:lint:biome:           1 │ + import·type·{·LibraryResource·}·from·'../types';
@repo/library:lint:biome:           2 │ + 
@repo/library:lint:biome:           3 │ + const·LIBRARY_SHARE_BASE_URL·=·'https://platform.gurudevi.edlove.org/p/library/resource';

@repo/library:lint:biome:           4 │ + 
@repo/library:lint:biome:           5 │ + export·interface·ResourceCompanionLink·{
apps-neevsk-web:lint:biome:        39 │ + ····"vitest":·"^2.1.9",
apps-neevsk-web:lint:biome:        40 │ + ····"vite-tsconfig-paths":·"^6.1.1",
apps-gurudevi-marketing-web:lint:biome: 

@repo/payments:lint:biome:     31    │ - → → //·Helapay·is·usually·lower·or·fixed.␍
@repo/payments:lint:biome:     32    │ - → → return·amount·*·0.03;␍
@repo/payments:lint:biome:     33    │ - → }␍
@repo/payments:lint:biome:     34    │ - }␍
@repo/payments:lint:biome:         1 │ + import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·'../types';
@repo/payments:lint:biome:         2 │ + 
@repo/payments:lint:biome:         3 │ + export·class·PayHereProvider·implements·PaymentProvider·{
@repo/payments:lint:biome:         4 │ + ··id·=·'payhere';

@repo/payments:lint:biome:         5 │ + ··name·=·'PayHere·(Sri·Lanka)';
@repo/payments:lint:biome:         6 │ + 
@repo/payments:lint:biome:         7 │ + ··async·initializePayment(
@repo/payments:lint:biome:         8 │ + ····amount:·number,
@repo/payments:lint:biome:         9 │ + ····currency:·string,
@repo/payments:lint:biome:        10 │ + ····metadata?:·any,
@repo/payments:lint:biome:        11 │ + ··):·Promise<PaymentIntent>·{
@repo/payments:lint:biome:        12 │ + ····//·In·a·real·implementation,·this·would·call·PayHere·API·to·get·a·checkout·URL·or·token.
@repo/payments:lint:biome:        13 │ + ····//·For·now,·we·return·a·mock·intent.
@repo/payments:lint:biome:        14 │ + ····return·{
@repo/payments:lint:biome:        15 │ + ······id:·`ph_${Math.random().toString(36).substr(2,·9)}`,

@repo/payments:lint:biome:        16 │ + ······amount,
@repo/payments:lint:biome:        17 │ + ······currency,
apps-neevsk-web:lint:biome:        41 │ + ····"eslint":·"^9.38.0",
apps-neevsk-web:lint:biome:        42 │ + ····"@playwright/test":·"^1.55.0"
apps-gurudevi-marketing-web:lint:biome: Checked 63 files in 548ms. No fixes applied.

apps-gurudevi-marketing-web:lint:biome: Found 68 errors.
@repo/library:lint:biome:           6 │ + ··id:·string;
@repo/library:lint:biome:           7 │ + ··label:·string;

@repo/library:lint:biome:           8 │ + ··description:·string;
@repo/library:lint:biome:           9 │ + ··url:·string;
@repo/library:lint:biome:          10 │ + ··kind:·'primary'·|·'wikipedia'·|·'trailer'·|·'search'·|·'official';
@repo/library:lint:biome:          11 │ + }
@repo/library:lint:biome:          12 │ + 

@repo/library:lint:biome:          13 │ + function·isWikipediaUrl(url?:·string):·boolean·{
@repo/library:lint:biome:          14 │ + ··return·typeof·url·===·'string'·&&·/wikipedia\.org/i.test(url);
@repo/library:lint:biome:          15 │ + }
@repo/library:lint:biome:          16 │ + 
@repo/library:lint:biome:          17 │ + function·isYouTubeUrl(url?:·string):·boolean·{
@repo/library:lint:biome:          18 │ + ··return·typeof·url·===·'string'·&&·/(youtube\.com|youtu\.be)/i.test(url);

@repo/library:lint:biome:          19 │ + }
@repo/library:lint:biome:          20 │ + 
@repo/library:lint:biome:          21 │ + function·sanitizeTitle(title:·string):·string·{
@repo/library:lint:biome:          22 │ + ··return·title
@repo/library:lint:biome:          23 │ + ····.replace(/[-–—]\s*(official\s*)?trailer/gi,·'')
@repo/library:lint:biome:          24 │ + ····.replace(/\((official\s*)?trailer\)/gi,·'')
@repo/library:lint:biome:          25 │ + ····.replace(/\((film|movie)\)/gi,·'')
@repo/library:lint:biome:          26 │ + ····.trim();

@repo/library:lint:biome:          27 │ + }
@repo/library:lint:biome:          28 │ + 
@repo/library:lint:biome:          29 │ + function·dedupeLinks(links:·ResourceCompanionLink[]):·ResourceCompanionLink[]·{
@repo/library:lint:biome:          30 │ + ··const·seen·=·new·Set<string>();
@repo/library:lint:biome:          31 │ + ··return·links.filter((link)·=>·{
@repo/library:lint:biome:          32 │ + ····if·(!link.url·||·seen.has(link.url))·return·false;
@repo/library:lint:biome:          33 │ + ····seen.add(link.url);
@repo/library:lint:biome:          34 │ + ····return·true;
@repo/library:lint:biome:          35 │ + ··});
@repo/library:lint:biome:          36 │ + }

@repo/library:lint:biome:          37 │ + 
@repo/library:lint:biome:          38 │ + export·function·buildLibraryResourceShareUrl(resourceId:·string):·string·{
apps-neevsk-web:lint:biome:        43 │ + ··}
apps-neevsk-web:lint:biome:        44 │ + }
apps-gurudevi-marketing-web:lint:biome: Found 63 warnings.

apps-gurudevi-marketing-web:lint:biome: Found 35 infos.
@repo/library:lint:biome:          39 │ + ··return·`${LIBRARY_SHARE_BASE_URL}/${encodeURIComponent(resourceId)}`;
@repo/library:lint:biome:   63 more lines truncated
apps-neevsk-web:lint:biome:     45 45 │   

@repo/payments:lint:biome:        18 │ + ······status:·'pending',
@repo/payments:lint:biome:        19 │ + ······provider:·this.id,
@repo/payments:lint:biome:        20 │ + ······metadata,
@repo/payments:lint:biome:        21 │ + ····};

@repo/payments:lint:biome:        22 │ + ··}
@repo/payments:lint:biome:        23 │ + 
@repo/payments:lint:biome:        24 │ + ··async·verifyPayment(_paymentIntentId:·string):·Promise<PaymentStatus>·{
@repo/payments:lint:biome:        25 │ + ····//·Real·check·against·PayHere·API·or·Webhook·status.
@repo/payments:lint:biome:        26 │ + ····return·'succeeded';
@repo/payments:lint:biome:        27 │ + ··}
@repo/payments:lint:biome:        28 │ + 

@repo/payments:lint:biome:        29 │ + ··getFeeEstimate(amount:·number):·number·{
@repo/payments:lint:biome:        30 │ + ····//·PayHere·typically·has·~2.6%·-·3.3%·+·fixed·fee·for·cards.
@repo/payments:lint:biome:        31 │ + ····//·Helapay·is·usually·lower·or·fixed.
@repo/payments:lint:biome:        32 │ + ····return·amount·*·0.03;
@repo/payments:lint:biome:        33 │ + ··}
@repo/payments:lint:biome:        34 │ + }
@repo/payments:lint:biome:     35 35 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\plugins\stripe.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      1    │ - import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·"../types";␍
@repo/payments:lint:biome:      2    │ - ␍

@repo/payments:lint:biome:      3    │ - export·class·StripeProvider·implements·PaymentProvider·{␍

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: src\components\Navigation.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:

apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      1  1 │   ---␍
apps-neevsk-web:lint:biome:      2    │ - const·_links·=·[␍
apps-neevsk-web:lint:biome:      3    │ - → {·href:·"/",·label:·"Home"·},␍
apps-neevsk-web:lint:biome:      4    │ - → {·href:·"/cv",·label:·"CV"·},␍
apps-neevsk-web:lint:biome:      5    │ - → {·href:·"/journey",·label:·"Journey"·},␍
apps-neevsk-web:lint:biome:      6    │ - → {·href:·"/projects",·label:·"Projects"·},␍
apps-neevsk-web:lint:biome:      7    │ - → {·href:·"/hall-of-flame",·label:·"Hall·of·Flame"·},␍
apps-neevsk-web:lint:biome:      8    │ - → {·href:·"/archive",·label:·"Archive"·},␍
apps-neevsk-web:lint:biome:      9    │ - → {·href:·"/contact",·label:·"Contact"·},␍
apps-neevsk-web:lint:biome:     10    │ - ];␍
apps-neevsk-web:lint:biome:         2 │ + const·_links·=·[
apps-neevsk-web:lint:biome:         3 │ + ··{·href:·'/',·label:·'Home'·},

apps-neevsk-web:lint:biome:         4 │ + ··{·href:·'/cv',·label:·'CV'·},
apps-neevsk-web:lint:biome:         5 │ + ··{·href:·'/journey',·label:·'Journey'·},
apps-neevsk-web:lint:biome:         6 │ + ··{·href:·'/projects',·label:·'Projects'·},
apps-neevsk-web:lint:biome:         7 │ + ··{·href:·'/hall-of-flame',·label:·'Hall·of·Flame'·},
apps-neevsk-web:lint:biome:         8 │ + ··{·href:·'/archive',·label:·'Archive'·},
apps-neevsk-web:lint:biome:         9 │ + ··{·href:·'/contact',·label:·'Contact'·},
apps-neevsk-web:lint:biome:        10 │ + ];
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   
@repo/library:lint:biome:      1    │ - {␍
@repo/library:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
@repo/library:lint:biome:      3    │ - → "compilerOptions":·{␍
@repo/library:lint:biome:      4    │ - → → "outDir":·"./dist",␍
@repo/library:lint:biome:      5    │ - → → "rootDir":·"./src",␍
@repo/library:lint:biome:      6    │ - → → "baseUrl":·".",␍
@repo/library:lint:biome:      7    │ - → → "jsx":·"react-jsx",␍

@repo/library:lint:biome:      8    │ - → → "paths":·{␍
apps-neevsk-web:lint:biome:     11 11 │   ---␍
apps-neevsk-web:lint:biome:     12 12 │   ␍
apps-neevsk-web:lint:biome:   
@repo/payments:lint:biome:      4    │ - → id·=·"stripe";␍
@repo/payments:lint:biome:      5    │ - → name·=·"Stripe·(International)";␍
@repo/payments:lint:biome:      6    │ - ␍

@repo/payments:lint:biome:      7    │ - → async·initializePayment(␍
@repo/payments:lint:biome:      8    │ - → → amount:·number,␍
@repo/payments:lint:biome:      9    │ - → → currency:·string,␍
@repo/payments:lint:biome:     10    │ - → → metadata?:·any,␍
@repo/payments:lint:biome:     11    │ - → ):·Promise<PaymentIntent>·{␍
@repo/payments:lint:biome:     12    │ - → → //·In·a·real·implementation,·this·would·call·Stripe·API·(via·Edge·Function)␍
@repo/payments:lint:biome:     13    │ - → → //·to·create·a·PaymentIntent·and·return·the·client_secret.␍
@repo/payments:lint:biome:     14    │ - → → return·{␍
@repo/payments:lint:biome:     15    │ - → → → id:·`st_${Math.random().toString(36).substr(2,·9)}`,␍
@repo/payments:lint:biome:     16    │ - → → → amount,␍
@repo/payments:lint:biome:     17    │ - → → → currency,␍
@repo/payments:lint:biome:     18    │ - → → → status:·"pending",␍
@repo/payments:lint:biome:     19    │ - → → → provider:·this.id,␍
@repo/payments:lint:biome:     20    │ - → → → metadata,␍
@repo/payments:lint:biome:     21    │ - → → };␍
@repo/payments:lint:biome:     22    │ - → }␍
@repo/payments:lint:biome:     23    │ - ␍
@repo/payments:lint:biome:     24    │ - → async·verifyPayment(_paymentIntentId:·string):·Promise<PaymentStatus>·{␍
@repo/payments:lint:biome:     25    │ - → → //·Real·check·against·Stripe·API·or·Webhook·status.␍
@repo/payments:lint:biome:     26    │ - → → return·"succeeded";␍
@repo/payments:lint:biome:     27    │ - → }␍
@repo/payments:lint:biome:     28    │ - ␍
@repo/payments:lint:biome:     29    │ - → getFeeEstimate(amount:·number):·number·{␍
@repo/payments:lint:biome:     30    │ - → → //·Stripe·International·typically·2.9%·+·$0.30.␍
@repo/payments:lint:biome:     31    │ - → → return·amount·*·0.029·+·0.3;␍
@repo/payments:lint:biome:     32    │ - → }␍
@repo/payments:lint:biome:     33    │ - }␍
@repo/payments:lint:biome:         1 │ + import·type·{·PaymentIntent,·PaymentProvider,·PaymentStatus·}·from·'../types';
@repo/payments:lint:biome:         2 │ + 
@repo/payments:lint:biome:         3 │ + export·class·StripeProvider·implements·PaymentProvider·{
@repo/payments:lint:biome:         4 │ + ··id·=·'stripe';
@repo/payments:lint:biome:         5 │ + ··name·=·'Stripe·(International)';
@repo/payments:lint:biome:         6 │ + 
@repo/payments:lint:biome:         7 │ + ··async·initializePayment(
@repo/payments:lint:biome:         8 │ + ····amount:·number,
@repo/payments:lint:biome:         9 │ + ····currency:·string,
@repo/payments:lint:biome:        10 │ + ····metadata?:·any,
@repo/payments:lint:biome:        11 │ + ··):·Promise<PaymentIntent>·{
@repo/payments:lint:biome:        12 │ + ····//·In·a·real·implementation,·this·would·call·Stripe·API·(via·Edge·Function)
@repo/payments:lint:biome:        13 │ + ····//·to·create·a·PaymentIntent·and·return·the·client_secret.
@repo/payments:lint:biome:        14 │ + ····return·{
@repo/payments:lint:biome:        15 │ + ······id:·`st_${Math.random().toString(36).substr(2,·9)}`,
@repo/payments:lint:biome:        16 │ + ······amount,
@repo/payments:lint:biome:        17 │ + ······currency,
@repo/payments:lint:biome:        18 │ + ······status:·'pending',
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
@repo/payments:lint:biome:        30 │ + ····//·Stripe·International·typically·2.9%·+·$0.30.
@repo/payments:lint:biome:        31 │ + ····return·amount·*·0.029·+·0.3;
@repo/payments:lint:biome:        32 │ + ··}
@repo/payments:lint:biome:        33 │ + }
@repo/payments:lint:biome:     34 34 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\registry.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      1    │ - import·type·{·PaymentProvider·}·from·"./types";␍
@repo/payments:lint:biome:      2    │ - ␍
@repo/payments:lint:biome:      3    │ - export·class·PaymentRegistry·{␍
@repo/payments:lint:biome:      4    │ - → private·providers:·Map<string,·PaymentProvider>·=·new·Map();␍
@repo/payments:lint:biome:      5    │ - ␍
@repo/payments:lint:biome:      6    │ - → register(provider:·PaymentProvider)·{␍
@repo/payments:lint:biome:      7    │ - → → this.providers.set(provider.id,·provider);␍
@repo/payments:lint:biome:      8    │ - → }␍
@repo/payments:lint:biome:      9    │ - ␍
@repo/payments:lint:biome:     10    │ - → getProvider(id:·string):·PaymentProvider·|·undefined·{␍
@repo/payments:lint:biome:     11    │ - → → return·this.providers.get(id);␍
@repo/payments:lint:biome:     12    │ - → }␍
@repo/payments:lint:biome:     13    │ - ␍
@repo/library:lint:biome:      9    │ - → → → "@repo/library/*":·["./src/*"]␍

@repo/library:lint:biome:     10    │ - → → }␍
@repo/library:lint:biome:     11    │ - → },␍
@repo/library:lint:biome:     12    │ - → "include":·["src/**/*"]␍
@repo/library:lint:biome:     13    │ - }␍
@repo/library:lint:biome:         1 │ + {
@repo/library:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
@repo/library:lint:biome:         3 │ + ··"compilerOptions":·{
@repo/library:lint:biome:         4 │ + ····"outDir":·"./dist",
@repo/library:lint:biome:         5 │ + ····"rootDir":·"./src",
@repo/library:lint:biome:         6 │ + ····"baseUrl":·".",
@repo/library:lint:biome:         7 │ + ····"jsx":·"react-jsx",
@repo/library:lint:biome:         8 │ + ····"paths":·{
@repo/library:lint:biome:         9 │ + ······"@repo/library/*":·["./src/*"]
@repo/library:lint:biome:        10 │ + ····}
@repo/library:lint:biome:        11 │ + ··},
@repo/library:lint:biome:        12 │ + ··"include":·["src/**/*"]
@repo/library:lint:biome:        13 │ + }
@repo/library:lint:biome:     14 14 │   
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Some errors were emitted while running checks.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/admin:lint:biome:        12 │ + ····"./bridge/founderWorkspace":·"./src/bridge/founderWorkspace.ts",
@repo/admin:lint:biome:        13 │ + ····"./screens/index":·"./src/screens/index.ts",
@repo/admin:lint:biome:        14 │ + ····"./screens/FounderDashboard":·"./src/screens/FounderDashboard.tsx",
@repo/admin:lint:biome:        15 │ + ····"./screens/FounderDashboard.web":·"./src/screens/FounderDashboard.web.tsx",
@repo/admin:lint:biome:        16 │ + ····"./screens/FounderSchoolDashboard":·"./src/screens/FounderSchoolDashboard.tsx",
@repo/admin:lint:biome:        17 │ + ····"./screens/AdminDashboard":·"./src/screens/AdminDashboard.tsx",
@repo/admin:lint:biome:        18 │ + ····"./screens/AdminDashboard.web":·"./src/screens/AdminDashboard.tsx",
@repo/admin:lint:biome:        19 │ + ····"./screens/AdminIncidentQueue":·"./src/screens/AdminIncidentQueue.tsx",
@repo/admin:lint:biome:        20 │ + ····"./screens/AdminTenantDetail":·"./src/screens/AdminTenantDetail.tsx",
@repo/admin:lint:biome:        21 │ + ····"./screens/AdminAuthorityRepair":·"./src/screens/AdminAuthorityRepair.tsx",
@repo/admin:lint:biome:        22 │ + ····"./screens/AdminJobControl":·"./src/screens/AdminJobControl.tsx",
@repo/admin:lint:biome:        23 │ + ····"./screens/AdminAuditLog":·"./src/screens/AdminAuditLog.tsx",
@repo/admin:lint:biome:        24 │ + ····"./screens/AdminReleaseControl":·"./src/screens/AdminReleaseControl.tsx",
@repo/admin:lint:biome:        25 │ + ····"./screens/SchoolCreationScreen":·"./src/screens/SchoolCreationScreen.tsx",
@repo/admin:lint:biome:        26 │ + ····"./screens/SchoolForestScreen.web":·"./src/screens/SchoolForestScreen.web.tsx",
@repo/admin:lint:biome:        27 │ + ····"./screens/PrincipalDashboard.web":·"./src/screens/PrincipalDashboard.web.tsx",
@repo/admin:lint:biome:        28 │ + ····"./screens/PrincipalDashboard":·"./src/screens/PrincipalDashboard.tsx",
@repo/admin:lint:biome:        29 │ + ····"./screens/principal/DashboardContent":·"./src/screens/principal/DashboardContent.tsx",
@repo/admin:lint:biome:        30 │ + ····"./screens/GradeHeadDashboard":·"./src/screens/GradeHeadDashboard.tsx",
@repo/admin:lint:biome:        31 │ + ····"./screens/SectionHeadDashboard":·"./src/screens/SectionHeadDashboard.tsx",
@repo/admin:lint:biome:        32 │ + ····"./screens/GuardianDashboard":·"./src/screens/GuardianDashboard.tsx",
@repo/admin:lint:biome:        33 │ + ····"./screens/GuardianDashboardScreen":·"./src/screens/GuardianDashboardScreen.tsx",
@repo/admin:lint:biome:        34 │ + ····"./screens/GuardianStudentsScreen":·"./src/screens/guardian/GuardianStudentsScreen.tsx",
@repo/admin:lint:biome:        35 │ + ····"./screens/GuardianStudentDetailScreen":·"./src/screens/guardian/GuardianStudentDetailScreen.tsx",
@repo/admin:lint:biome:        36 │ + ····"./screens/GuardianNotificationsScreen":·"./src/screens/guardian/GuardianNotificationsScreen.tsx",
@repo/admin:lint:biome:        37 │ + ····"./screens/GuardianEventsScreen":·"./src/screens/guardian/GuardianEventsScreen.tsx",
@repo/admin:lint:biome:        38 │ + ····"./screens/GuardianCommunicationBridgeScreen":·"./src/screens/guardian/GuardianCommunicationBridgeScreen.tsx",
apps-neevsk-web:lint:biome: 
@repo/admin:lint:biome:        39 │ + ····"./screens/*":·"./src/screens/*",
apps-neevsk-web:lint:biome: src\components\StructuredData.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome:        40 │ + ····"./components/*":·"./src/components/*",
apps-neevsk-web:lint:biome: 
@repo/admin:lint:biome:        41 │ + ····"./package.json":·"./package.json"
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
@repo/admin:lint:biome:        42 │ + ··},
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      1  1 │   ---␍
@repo/admin:lint:biome:        43 │ + ··"scripts":·{
@repo/admin:lint:biome:        44 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/admin:lint:biome:        45 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/admin:lint:biome:        46 │ + ····"lint:biome":·"biome·check·.",
@repo/admin:lint:biome:        47 │ + ····"lint:eslint":·"eslint·.",
@repo/admin:lint:biome:        48 │ + ····"format":·"biome·format·--write·.",

@repo/admin:lint:biome:        49 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/admin:lint:biome:        50 │ + ····"test":·"vitest·run",
@repo/admin:lint:biome:        51 │ + ····"test:watch":·"vitest",
@repo/admin:lint:biome:        52 │ + ····"test:ui":·"vitest·--ui",
@repo/admin:lint:biome:        53 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@repo/admin:lint:biome:        54 │ + ··},
@repo/admin:lint:biome:        55 │ + ··"dependencies":·{
@repo/admin:lint:biome:        56 │ + ····"@repo/ai":·"workspace:*",
@repo/admin:lint:biome:        57 │ + ····"@repo/analytics":·"workspace:*",
@repo/admin:lint:biome:        58 │ + ····"@repo/community":·"workspace:*",
@repo/admin:lint:biome:        59 │ + ····"@repo/core":·"workspace:*",
@repo/admin:lint:biome:        60 │ + ····"@repo/graphics":·"workspace:*",
@repo/admin:lint:biome:        61 │ + ····"@repo/library":·"workspace:*",
@repo/admin:lint:biome:        62 │ + ····"@repo/people":·"workspace:*",
@repo/admin:lint:biome:        63 │ + ····"@repo/profile":·"workspace:*",
@repo/admin:lint:biome:     64 64 │       "@repo/scanner-kit": "workspace:*",
@repo/admin:lint:biome:     65 65 │       "@repo/self": "workspace:*",
@repo/admin:lint:biome:     66 66 │       "@repo/ui": "workspace:*",
@repo/admin:lint:biome:     67    │ - ····"@tanstack/react-query":·"^5.90.20",␍
@repo/admin:lint:biome:     68    │ - ····"date-fns":·"^4.1.0",␍
@repo/admin:lint:biome:     69    │ - ····"expo-clipboard":·"~55.0.13",␍
@repo/admin:lint:biome:     70    │ - ····"lucide-react-native":·"^0.563.0",␍
@repo/admin:lint:biome:     71    │ - ····"react-i18next":·"^16.5.4",␍
@repo/admin:lint:biome:     72    │ - ····"react-native-reanimated":·"^4.2.1"␍
@repo/admin:lint:biome:     73    │ - ··},␍

@repo/admin:lint:biome:     74    │ - ··"devDependencies":·{␍
@repo/admin:lint:biome:     75    │ - ····"@jest/globals":·"^30.3.0",␍
@repo/admin:lint:biome:     76    │ - ····"@repo/eslint-config":·"workspace:^",␍
@repo/admin:lint:biome:     77    │ - ····"@types/react":·"^19.2.14",␍
@repo/admin:lint:biome:     78    │ - ····"@types/react-native":·"workspace:*",␍
@repo/admin:lint:biome:     79    │ - ····"eslint":·"^9.38.0",␍
@repo/admin:lint:biome:     80    │ - ····"typescript":·"^5.9.3",␍
@repo/admin:lint:biome:     81    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/admin:lint:biome:     82    │ - ····"vitest":·"^2.1.9",␍
@repo/admin:lint:biome:     83    │ - ····"vite-tsconfig-paths":·"^6.1.1"␍
@repo/admin:lint:biome:     84    │ - ··},␍
@repo/admin:lint:biome:     85    │ - ··"peerDependencies":·{␍
@repo/admin:lint:biome:     86    │ - ····"react":·"*",␍
@repo/admin:lint:biome:     87    │ - ····"react-native":·"*"␍
@repo/admin:lint:biome:   26 more lines truncated
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 
@repo/admin:lint:biome: src\__tests__\analytics\engine.test.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 

apps-neevsk-web:lint:biome:      2    │ - interface·Props·{␍
apps-neevsk-web:lint:biome:      3    │ - → data:·Record<string,·any>·|·Array<Record<string,·any>>;␍
apps-neevsk-web:lint:biome:      4    │ - }␍
apps-neevsk-web:lint:biome:      5    │ - ␍
apps-neevsk-web:lint:biome:      6    │ - const·{·data·}·=·Astro.props;␍
apps-neevsk-web:lint:biome:      7    │ - const·_normalized·=·Array.isArray(data)·?·data·:·[data];␍
apps-neevsk-web:lint:biome:         2 │ + interface·Props·{
apps-neevsk-web:lint:biome:         3 │ + ··data:·Record<string,·any>·|·Array<Record<string,·any>>;
apps-neevsk-web:lint:biome:         4 │ + }
apps-neevsk-web:lint:biome:         5 │ + 
apps-neevsk-web:lint:biome:         6 │ + const·{·data·}·=·Astro.props;
apps-neevsk-web:lint:biome:         7 │ + const·_normalized·=·Array.isArray(data)·?·data·:·[data];
apps-neevsk-web:lint:biome:      8  8 │   ---␍
apps-neevsk-web:lint:biome:      9  9 │   ␍
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Formatter would have printed the following content:
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome:      1    │ - {␍
apps-neevsk-web:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
apps-neevsk-web:lint:biome:      3    │ - → "compilerOptions":·{␍
apps-neevsk-web:lint:biome:      4    │ - → → "baseUrl":·".",␍
apps-neevsk-web:lint:biome:      5    │ - → → "paths":·{␍
apps-neevsk-web:lint:biome:      6    │ - → → → "@/*":·["./src/*"]␍
apps-neevsk-web:lint:biome:      7    │ - → → }␍
apps-neevsk-web:lint:biome:      8    │ - → },␍
apps-neevsk-web:lint:biome:      9    │ - → "include":·[".astro/types.d.ts",·"**/*"],␍
apps-neevsk-web:lint:biome:     10    │ - → "exclude":·["dist"]␍
apps-neevsk-web:lint:biome:     11    │ - }␍
apps-neevsk-web:lint:biome:         1 │ + {
apps-neevsk-web:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
apps-neevsk-web:lint:biome:         3 │ + ··"compilerOptions":·{
apps-neevsk-web:lint:biome:         4 │ + ····"baseUrl":·".",
apps-neevsk-web:lint:biome:         5 │ + ····"paths":·{
apps-neevsk-web:lint:biome:         6 │ + ······"@/*":·["./src/*"]
apps-neevsk-web:lint:biome:         7 │ + ····}
apps-neevsk-web:lint:biome:         8 │ + ··},
apps-neevsk-web:lint:biome:         9 │ + ··"include":·[".astro/types.d.ts",·"**/*"],
apps-neevsk-web:lint:biome:        10 │ + ··"exclude":·["dist"]
apps-neevsk-web:lint:biome:        11 │ + }
apps-neevsk-web:lint:biome:     12 12 │   
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-neevsk-web:lint:biome: 
apps-neevsk-web:lint:biome:   × Some errors were emitted while running checks.
apps-neevsk-web:lint:biome:   
apps-neevsk-web:lint:biome: 

apps-gurudevi-marketing-web:lint:biome: .astro\types.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1   │ - ///·<reference·types="astro/client"·/>␍
apps-gurudevi-marketing-web:lint:biome:     2   │ - ///·<reference·path="content.d.ts"·/>
apps-gurudevi-marketing-web:lint:biome:       1 │ + ///·<reference·types="astro/client"·/>
apps-gurudevi-marketing-web:lint:biome:       2 │ + ///·<reference·path="content.d.ts"·/>
apps-gurudevi-marketing-web:lint:biome:       3 │ + 
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1    │ - {␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - ··"name":·"apps-gurudevi-marketing-web",␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - ··"type":·"module",␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - ··"version":·"0.0.1",␍
apps-gurudevi-marketing-web:lint:biome:      5    │ - ··"scripts":·{␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - ····"dev":·"pnpm·exec·astro·dev",␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - ····"build":·"pnpm·exec·astro·build",␍
apps-gurudevi-marketing-web:lint:biome:      8    │ - ····"preview":·"pnpm·exec·astro·preview",␍
apps-gurudevi-marketing-web:lint:biome:      9    │ - ····"astro":·"pnpm·exec·astro",␍
apps-gurudevi-marketing-web:lint:biome:     10    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
apps-gurudevi-marketing-web:lint:biome:     11    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
apps-gurudevi-marketing-web:lint:biome:     12    │ - ····"lint:biome":·"biome·check·.",␍
apps-gurudevi-marketing-web:lint:biome:     13    │ - ····"lint:eslint":·"eslint·.",␍
apps-gurudevi-marketing-web:lint:biome:     14    │ - ····"format":·"biome·format·--write·.",␍
apps-gurudevi-marketing-web:lint:biome:     15    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
apps-gurudevi-marketing-web:lint:biome:     16    │ - ····"test":·"vitest·run",␍
apps-gurudevi-marketing-web:lint:biome:     17    │ - ····"test:watch":·"vitest",␍
apps-gurudevi-marketing-web:lint:biome:     18    │ - ····"test:ui":·"vitest·--ui",␍
apps-gurudevi-marketing-web:lint:biome:     19    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
apps-gurudevi-marketing-web:lint:biome:     20    │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:     21    │ - ··"dependencies":·{␍
apps-gurudevi-marketing-web:lint:biome:     22    │ - ····"@astrojs/sitemap":·"^3.6.0",␍
apps-gurudevi-marketing-web:lint:biome:     23    │ - ····"@astrojs/svelte":·"^8.0.5",␍
apps-gurudevi-marketing-web:lint:biome:     24    │ - ····"@astrojs/vercel":·"^10.0.4",␍
apps-gurudevi-marketing-web:lint:biome:     25    │ - ····"@repo/analytics":·"workspace:*",␍
apps-gurudevi-marketing-web:lint:biome:     26    │ - ····"@repo/core":·"workspace:*",␍
apps-gurudevi-marketing-web:lint:biome:     27    │ - ····"@repo/form-builder":·"workspace:*",␍
apps-gurudevi-marketing-web:lint:biome:     28    │ - ····"@repo/ui":·"workspace:*",␍
apps-gurudevi-marketing-web:lint:biome:     29    │ - ····"@supabase/supabase-js":·"2.102.1",␍
apps-gurudevi-marketing-web:lint:biome:     30    │ - ····"@tailwindcss/vite":·"^4.1.18",␍
apps-gurudevi-marketing-web:lint:biome:     31    │ - ····"astro":·"^6.1.7",␍
apps-gurudevi-marketing-web:lint:biome:     32    │ - ····"inngest":·"^4.2.4",␍
apps-gurudevi-marketing-web:lint:biome:     33    │ - ····"svelte":·"^5.55.4",␍
apps-gurudevi-marketing-web:lint:biome:     34    │ - ····"tailwindcss":·"^4.1.18",␍

apps-gurudevi-marketing-web:lint:biome:     35    │ - ····"typescript":·"^5.9.3"␍
apps-gurudevi-marketing-web:lint:biome:     36    │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:     37    │ - ··"devDependencies":·{␍
apps-gurudevi-marketing-web:lint:biome:     38    │ - ····"@types/react":·"^19.2.14",␍
apps-gurudevi-marketing-web:lint:biome:     39    │ - ····"@repo/eslint-config":·"workspace:^",␍
apps-gurudevi-marketing-web:lint:biome:     40    │ - ····"@repo/typescript-config":·"workspace:*",␍
apps-gurudevi-marketing-web:lint:biome:     41    │ - ····"vitest":·"^2.1.9",␍
apps-gurudevi-marketing-web:lint:biome:     42    │ - ····"vite-tsconfig-paths":·"^6.1.1",␍
apps-gurudevi-marketing-web:lint:biome:     43    │ - ····"eslint":·"^9.38.0"␍
apps-gurudevi-marketing-web:lint:biome:     44    │ - ··}␍
apps-gurudevi-marketing-web:lint:biome:     45    │ - }␍
apps-gurudevi-marketing-web:lint:biome:         1 │ + {
apps-gurudevi-marketing-web:lint:biome:         2 │ + ··"name":·"apps-gurudevi-marketing-web",
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··"type":·"module",
apps-gurudevi-marketing-web:lint:biome:         4 │ + ··"version":·"0.0.1",
apps-gurudevi-marketing-web:lint:biome:         5 │ + ··"scripts":·{
apps-gurudevi-marketing-web:lint:biome:         6 │ + ····"dev":·"pnpm·exec·astro·dev",
apps-gurudevi-marketing-web:lint:biome:         7 │ + ····"build":·"pnpm·exec·astro·build",
apps-gurudevi-marketing-web:lint:biome:         8 │ + ····"preview":·"pnpm·exec·astro·preview",
apps-gurudevi-marketing-web:lint:biome:         9 │ + ····"astro":·"pnpm·exec·astro",

apps-gurudevi-marketing-web:lint:biome:        10 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
apps-gurudevi-marketing-web:lint:biome:        11 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
apps-gurudevi-marketing-web:lint:biome:        12 │ + ····"lint:biome":·"biome·check·.",
apps-gurudevi-marketing-web:lint:biome:        13 │ + ····"lint:eslint":·"eslint·.",
apps-gurudevi-marketing-web:lint:biome:        14 │ + ····"format":·"biome·format·--write·.",
apps-gurudevi-marketing-web:lint:biome:        15 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
apps-gurudevi-marketing-web:lint:biome:        16 │ + ····"test":·"vitest·run",
apps-gurudevi-marketing-web:lint:biome:        17 │ + ····"test:watch":·"vitest",
apps-gurudevi-marketing-web:lint:biome:        18 │ + ····"test:ui":·"vitest·--ui",

apps-gurudevi-marketing-web:lint:biome:        19 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
apps-gurudevi-marketing-web:lint:biome:        20 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        21 │ + ··"dependencies":·{
apps-gurudevi-marketing-web:lint:biome:        22 │ + ····"@astrojs/sitemap":·"^3.6.0",
apps-gurudevi-marketing-web:lint:biome:        23 │ + ····"@astrojs/svelte":·"^8.0.5",
apps-gurudevi-marketing-web:lint:biome:        24 │ + ····"@astrojs/vercel":·"^10.0.4",
apps-gurudevi-marketing-web:lint:biome:        25 │ + ····"@repo/analytics":·"workspace:*",
apps-gurudevi-marketing-web:lint:biome:        26 │ + ····"@repo/core":·"workspace:*",
apps-gurudevi-marketing-web:lint:biome:        27 │ + ····"@repo/form-builder":·"workspace:*",
apps-gurudevi-marketing-web:lint:biome:        28 │ + ····"@repo/ui":·"workspace:*",
apps-gurudevi-marketing-web:lint:biome:        29 │ + ····"@supabase/supabase-js":·"2.102.1",
apps-gurudevi-marketing-web:lint:biome:        30 │ + ····"@tailwindcss/vite":·"^4.1.18",
apps-gurudevi-marketing-web:lint:biome:        31 │ + ····"astro":·"^6.1.7",
apps-gurudevi-marketing-web:lint:biome:        32 │ + ····"inngest":·"^4.2.4",

apps-gurudevi-marketing-web:lint:biome:        33 │ + ····"svelte":·"^5.55.4",
apps-gurudevi-marketing-web:lint:biome:        34 │ + ····"tailwindcss":·"^4.1.18",
apps-gurudevi-marketing-web:lint:biome:        35 │ + ····"typescript":·"^5.9.3"
apps-gurudevi-marketing-web:lint:biome:        36 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        37 │ + ··"devDependencies":·{
apps-gurudevi-marketing-web:lint:biome:        38 │ + ····"@types/react":·"^19.2.14",
apps-gurudevi-marketing-web:lint:biome:        39 │ + ····"@repo/eslint-config":·"workspace:^",
apps-gurudevi-marketing-web:lint:biome:        40 │ + ····"@repo/typescript-config":·"workspace:*",
apps-gurudevi-marketing-web:lint:biome:        41 │ + ····"vitest":·"^2.1.9",
apps-gurudevi-marketing-web:lint:biome:        42 │ + ····"vite-tsconfig-paths":·"^6.1.1",
apps-gurudevi-marketing-web:lint:biome:        43 │ + ····"eslint":·"^9.38.0"
apps-gurudevi-marketing-web:lint:biome:        44 │ + ··}
apps-gurudevi-marketing-web:lint:biome:        45 │ + }
apps-gurudevi-marketing-web:lint:biome:     46 46 │   
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: public\manifest.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1    │ - {␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - → "name":·"Gurudevi",␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - → "short_name":·"Gurudevi",␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - → "description":·"Education·Ecology·Support·System.·A·sanctuary·for·teachers·and·learners.",␍

apps-gurudevi-marketing-web:lint:biome:      5    │ - → "start_url":·"/",␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - → "display":·"standalone",␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - → "background_color":·"#FFF8E7",␍
apps-gurudevi-marketing-web:lint:biome:      8    │ - → "theme_color":·"#E67E22",␍
apps-gurudevi-marketing-web:lint:biome:      9    │ - → "icons":·[␍
apps-gurudevi-marketing-web:lint:biome:     10    │ - → → {␍
apps-gurudevi-marketing-web:lint:biome:     11    │ - → → → "src":·"/favicon.svg",␍
apps-gurudevi-marketing-web:lint:biome:     12    │ - → → → "sizes":·"any",␍
apps-gurudevi-marketing-web:lint:biome:     13    │ - → → → "type":·"image/svg+xml",␍
apps-gurudevi-marketing-web:lint:biome:     14    │ - → → → "purpose":·"any"␍
apps-gurudevi-marketing-web:lint:biome:     15    │ - → → }␍
apps-gurudevi-marketing-web:lint:biome:     16    │ - → ]␍
apps-gurudevi-marketing-web:lint:biome:     17    │ - }␍
apps-gurudevi-marketing-web:lint:biome:         1 │ + {
apps-gurudevi-marketing-web:lint:biome:         2 │ + ··"name":·"Gurudevi",
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··"short_name":·"Gurudevi",
apps-gurudevi-marketing-web:lint:biome:         4 │ + ··"description":·"Education·Ecology·Support·System.·A·sanctuary·for·teachers·and·learners.",
apps-gurudevi-marketing-web:lint:biome:         5 │ + ··"start_url":·"/",
apps-gurudevi-marketing-web:lint:biome:         6 │ + ··"display":·"standalone",
apps-gurudevi-marketing-web:lint:biome:         7 │ + ··"background_color":·"#FFF8E7",
apps-gurudevi-marketing-web:lint:biome:         8 │ + ··"theme_color":·"#E67E22",
apps-gurudevi-marketing-web:lint:biome:         9 │ + ··"icons":·[
apps-gurudevi-marketing-web:lint:biome:        10 │ + ····{
apps-gurudevi-marketing-web:lint:biome:        11 │ + ······"src":·"/favicon.svg",
apps-gurudevi-marketing-web:lint:biome:        12 │ + ······"sizes":·"any",
apps-gurudevi-marketing-web:lint:biome:        13 │ + ······"type":·"image/svg+xml",
apps-gurudevi-marketing-web:lint:biome:        14 │ + ······"purpose":·"any"
apps-gurudevi-marketing-web:lint:biome:        15 │ + ····}

apps-gurudevi-marketing-web:lint:biome:        16 │ + ··]
apps-gurudevi-marketing-web:lint:biome:        17 │ + }
apps-gurudevi-marketing-web:lint:biome:     18 18 │   
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\Header.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1  1 │   ---␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - const·navItems·=·[␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - → {·name:·"About",·href:·"/about"·},␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - → {·name:·"Thuthimal",·href:·"/thuthimal"·},␍
apps-gurudevi-marketing-web:lint:biome:      5    │ - → {·name:·"FAQ",·href:·"/faq"·},␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - → {·name:·"Support",·href:·"/support"·},␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - ];␍
apps-gurudevi-marketing-web:lint:biome:         2 │ + const·navItems·=·[
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··{·name:·'About',·href:·'/about'·},

@repo/payments:lint:biome:     14    │ - → getAllProviders():·PaymentProvider[]·{␍
@repo/payments:lint:biome:     15    │ - → → return·Array.from(this.providers.values());␍
@repo/payments:lint:biome:     16    │ - → }␍
@repo/payments:lint:biome:     17    │ - ␍
@repo/payments:lint:biome:     18    │ - → getCheapestProvider(amount:·number):·PaymentProvider·|·undefined·{␍
@repo/payments:lint:biome:     19    │ - → → let·cheapest:·PaymentProvider·|·undefined;␍
@repo/payments:lint:biome:     20    │ - → → let·minFee·=·Infinity;␍
@repo/payments:lint:biome:     21    │ - ␍
@repo/payments:lint:biome:     22    │ - → → for·(const·provider·of·this.providers.values())·{␍

@repo/payments:lint:biome:     23    │ - → → → const·fee·=·provider.getFeeEstimate(amount);␍
@repo/payments:lint:biome:     24    │ - → → → if·(fee·<·minFee)·{␍
@repo/payments:lint:biome:     25    │ - → → → → minFee·=·fee;␍
@repo/payments:lint:biome:     26    │ - → → → → cheapest·=·provider;␍
@repo/payments:lint:biome:     27    │ - → → → }␍
@repo/payments:lint:biome:     28    │ - → → }␍
@repo/payments:lint:biome:     29    │ - ␍
@repo/payments:lint:biome:     30    │ - → → return·cheapest;␍
@repo/payments:lint:biome:     31    │ - → }␍
@repo/payments:lint:biome:     32    │ - }␍
@repo/payments:lint:biome:     33    │ - ␍
@repo/payments:lint:biome:     34    │ - export·const·payments·=·new·PaymentRegistry();␍
@repo/payments:lint:biome:         1 │ + import·type·{·PaymentProvider·}·from·'./types';
@repo/payments:lint:biome:         2 │ + 
@repo/payments:lint:biome:         3 │ + export·class·PaymentRegistry·{
@repo/payments:lint:biome:         4 │ + ··private·providers:·Map<string,·PaymentProvider>·=·new·Map();
@repo/payments:lint:biome:         5 │ + 
@repo/payments:lint:biome:         6 │ + ··register(provider:·PaymentProvider)·{
@repo/payments:lint:biome:         7 │ + ····this.providers.set(provider.id,·provider);
@repo/payments:lint:biome:         8 │ + ··}
@repo/payments:lint:biome:         9 │ + 
@repo/payments:lint:biome:        10 │ + ··getProvider(id:·string):·PaymentProvider·|·undefined·{
@repo/payments:lint:biome:        11 │ + ····return·this.providers.get(id);
@repo/payments:lint:biome:        12 │ + ··}
@repo/payments:lint:biome:        13 │ + 
@repo/payments:lint:biome:        14 │ + ··getAllProviders():·PaymentProvider[]·{
@repo/payments:lint:biome:        15 │ + ····return·Array.from(this.providers.values());
@repo/payments:lint:biome:        16 │ + ··}

@repo/payments:lint:biome:        17 │ + 
@repo/payments:lint:biome:        18 │ + ··getCheapestProvider(amount:·number):·PaymentProvider·|·undefined·{
@repo/payments:lint:biome:        19 │ + ····let·cheapest:·PaymentProvider·|·undefined;
@repo/payments:lint:biome:        20 │ + ····let·minFee·=·Infinity;
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
@repo/payments:lint:biome: src\service.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      1    │ - import·{·Ledger·}·from·"@repo/accounting";␍
@repo/payments:lint:biome:      2    │ - import·{·supabase·}·from·"@repo/core/api";␍
@repo/payments:lint:biome:      3    │ - ␍
@repo/payments:lint:biome:      4    │ - import·type·{·PaymentStatus·}·from·"./types";␍
@repo/payments:lint:biome:      5    │ - ␍
@repo/payments:lint:biome:      6    │ - export·class·PaymentService·{␍
@repo/payments:lint:biome:      7    │ - → /**␍
@repo/payments:lint:biome:      8    │ - → ·*·Finalizes·a·payment·and·records·it·in·the·accounting·ledger.␍
@repo/payments:lint:biome:      9    │ - → ·*/␍
@repo/payments:lint:biome:     10    │ - → static·async·finalizePayment(␍
@repo/payments:lint:biome:     11    │ - → → paymentIntentId:·string,␍
@repo/payments:lint:biome:     12    │ - → → status:·PaymentStatus,␍
@repo/payments:lint:biome:     13    │ - → → accounts:·{·debit_account_id:·string;·credit_account_id:·string·},␍
@repo/payments:lint:biome:     14    │ - → )·{␍
@repo/payments:lint:biome:     15    │ - → → if·(status·!==·"succeeded")·return;␍
@repo/payments:lint:biome:     16    │ - ␍
@repo/payments:lint:biome:     17    │ - → → //·1.·Get·Payment·Details␍
@repo/payments:lint:biome:     18    │ - → → const·{·data:·payment,·error:·pError·}·=·await·supabase␍
@repo/payments:lint:biome:     19    │ - → → → .schema("payments")␍
@repo/payments:lint:biome:     20    │ - → → → .from("transactions")␍
@repo/payments:lint:biome:     21    │ - → → → .select("*")␍
@repo/payments:lint:biome:     22    │ - → → → .eq("id",·paymentIntentId)␍
@repo/payments:lint:biome:     23    │ - → → → .single();␍
@repo/payments:lint:biome:     24    │ - ␍
@repo/payments:lint:biome:     25    │ - → → if·(pError)·throw·pError;␍
@repo/payments:lint:biome:     26    │ - ␍
@repo/payments:lint:biome:     27    │ - → → //·2.·Record·in·Ledger·(Double·Entry)␍
@repo/payments:lint:biome:     28    │ - → → const·tx·=·await·Ledger.recordTransaction(␍
@repo/payments:lint:biome:     29    │ - → → → {␍
@repo/payments:lint:biome:     30    │ - → → → → date:␍
@repo/payments:lint:biome:     31    │ - → → → → → new·Date().toISOString().split("T")[0]·??·new·Date().toISOString(),␍
@repo/payments:lint:biome:     32    │ - → → → → description:·`Payment·${paymentIntentId}·via·${payment.provider·||·"unknown"}`,␍
@repo/payments:lint:biome:     33    │ - → → → → referenceNo:·payment.external_id·||·undefined,␍
@repo/payments:lint:biome:     34    │ - → → → → metadata:·{·payment_id:·paymentIntentId·},␍
@repo/payments:lint:biome:     35    │ - → → → },␍
@repo/payments:lint:biome:     36    │ - → → → [␍
@repo/payments:lint:biome:     37    │ - → → → → {␍
@repo/payments:lint:biome:     38    │ - → → → → → accountId:·accounts.debit_account_id,·//·e.g.,·"Cash·at·Bank"␍
@repo/payments:lint:biome:     39    │ - → → → → → amount:·payment.amount,␍
@repo/payments:lint:biome:     40    │ - → → → → → side:·"debit",␍
@repo/payments:lint:biome:     41    │ - → → → → → description:·"Payment·collection",␍
@repo/payments:lint:biome:     42    │ - → → → → },␍
@repo/payments:lint:biome:     43    │ - → → → → {␍
@repo/payments:lint:biome:     44    │ - → → → → → accountId:·accounts.credit_account_id,·//·e.g.,·"Student·Fees·Receivable"·or·"Sales·Income"␍
@repo/payments:lint:biome:     45    │ - → → → → → amount:·payment.amount,␍
@repo/payments:lint:biome:     46    │ - → → → → → side:·"credit",␍
@repo/payments:lint:biome:     47    │ - → → → → → description:·"Fee·settlement",␍
@repo/payments:lint:biome:     48    │ - → → → → },␍
@repo/payments:lint:biome:     49    │ - → → → ],␍
@repo/payments:lint:biome:     50    │ - → → );␍

@repo/payments:lint:biome:     51    │ - ␍
@repo/payments:lint:biome:     52    │ - → → //·3.·Link·back·to·Payment·Transaction␍
@repo/payments:lint:biome:     53    │ - → → const·{·error:·updateError·}·=·await·supabase␍
@repo/payments:lint:biome:     54    │ - → → → .schema("payments")␍
@repo/payments:lint:biome:     55    │ - → → → .from("transactions")␍
@repo/payments:lint:biome:     56    │ - → → → .update({␍
@repo/payments:lint:biome:     57    │ - → → → → status:·"succeeded",␍
@repo/payments:lint:biome:     58    │ - → → → → ledger_transaction_id:·tx.id,␍
@repo/payments:lint:biome:     59    │ - → → → })␍
@repo/payments:lint:biome:     60    │ - → → → .eq("id",·paymentIntentId);␍
@repo/payments:lint:biome:     61    │ - ␍
@repo/payments:lint:biome:     62    │ - → → if·(updateError)·throw·updateError;␍
@repo/payments:lint:biome:     63    │ - → }␍
@repo/payments:lint:biome:     64    │ - }␍
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
@repo/payments:lint:biome:        12 │ + ····status:·PaymentStatus,
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
@repo/payments:lint:biome:        37 │ + ··········accountId:·accounts.debit_account_id,·//·e.g.,·"Cash·at·Bank"
@repo/payments:lint:biome:        38 │ + ··········amount:·payment.amount,
@repo/payments:lint:biome:        39 │ + ··········side:·'debit',
@repo/payments:lint:biome:        40 │ + ··········description:·'Payment·collection',
@repo/payments:lint:biome:        41 │ + ········},
@repo/payments:lint:biome:        42 │ + ········{
@repo/payments:lint:biome:        43 │ + ··········accountId:·accounts.credit_account_id,·//·e.g.,·"Student·Fees·Receivable"·or·"Sales·Income"
@repo/payments:lint:biome:        44 │ + ··········amount:·payment.amount,
@repo/payments:lint:biome:        45 │ + ··········side:·'credit',
@repo/payments:lint:biome:        46 │ + ··········description:·'Fee·settlement',
@repo/payments:lint:biome:        47 │ + ········},
@repo/payments:lint:biome:        48 │ + ······],
@repo/payments:lint:biome:        49 │ + ····);
@repo/payments:lint:biome:        50 │ + 
@repo/payments:lint:biome:        51 │ + ····//·3.·Link·back·to·Payment·Transaction
@repo/payments:lint:biome:        52 │ + ····const·{·error:·updateError·}·=·await·supabase
@repo/payments:lint:biome:        53 │ + ······.schema('payments')
@repo/payments:lint:biome:        54 │ + ······.from('transactions')
@repo/payments:lint:biome:        55 │ + ······.update({
@repo/payments:lint:biome:        56 │ + ········status:·'succeeded',
@repo/payments:lint:biome:        57 │ + ········ledger_transaction_id:·tx.id,
@repo/payments:lint:biome:        58 │ + ······})
@repo/payments:lint:biome:        59 │ + ······.eq('id',·paymentIntentId);
@repo/payments:lint:biome:        60 │ + 
@repo/payments:lint:biome:        61 │ + ····if·(updateError)·throw·updateError;
@repo/payments:lint:biome:        62 │ + ··}
@repo/payments:lint:biome:        63 │ + }
@repo/payments:lint:biome:     65 64 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:
@repo/payments:lint:biome:   

apps-gurudevi-marketing-web:lint:biome:         4 │ + ··{·name:·'Thuthimal',·href:·'/thuthimal'·},
apps-gurudevi-marketing-web:lint:biome:         5 │ + ··{·name:·'FAQ',·href:·'/faq'·},

apps-gurudevi-marketing-web:lint:biome:         6 │ + ··{·name:·'Support',·href:·'/support'·},
apps-gurudevi-marketing-web:lint:biome:         7 │ + ];

apps-gurudevi-marketing-web:lint:biome:      8  8 │   ---␍
apps-gurudevi-marketing-web:lint:biome:      9  9 │   ␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatsSection.svelte format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1  1 │   <script lang="ts">␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - const·statDefs·=·[␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - → {␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - → → key:·"teachers_count"·as·const,␍
apps-gurudevi-marketing-web:lint:biome:      5    │ - → → label:·"Teachers",␍
@repo/payments:lint:biome:      1    │ - export·type·PaymentStatus·=␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - → → icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M12·12c2.21·0·4-1.79·4-4s-1.79-4-4-4-4·1.79-4·4·1.79·4·4·4zm0·2c-2.67·0-8·1.34-8·4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - → },␍
apps-gurudevi-marketing-web:lint:biome:      8    │ - → {␍
apps-gurudevi-marketing-web:lint:biome:      9    │ - → → key:·"students_count"·as·const,␍
apps-gurudevi-marketing-web:lint:biome:     10    │ - → → label:·"Students",␍
apps-gurudevi-marketing-web:lint:biome:     11    │ - → → icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M16·11c1.66·0·2.99-1.34·2.99-3S17.66·8·16·8·13.01·9.34·13.01·11s1.33·3·2.99·3zM9·11c1.66·0·2.99-1.34·2.99-3S10.66·8·9·8·6.01·9.34·6.01·11s1.33·3·2.99·3zm7·3c-2.33·0-7·1.17-7·3.5V19h14v-1.5c0-2.33-4.67-3.5-7-3.5zm-7·0c-2.33·0-7·1.17-7·3.5V19h5v-1.5c0-1.07.36-2.02.93-2.82C9.57·14.25·9.3·14·9·14z"/></svg>`,␍
apps-gurudevi-marketing-web:lint:biome:     12    │ - → },␍
apps-gurudevi-marketing-web:lint:biome:     13    │ - → {␍
apps-gurudevi-marketing-web:lint:biome:     14    │ - → → key:·"schools_count"·as·const,␍

apps-gurudevi-marketing-web:lint:biome:     15    │ - → → label:·"Schools",␍
apps-gurudevi-marketing-web:lint:biome:     16    │ - → → icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M5·13.18v4L12·21l7-3.82v-4L12·17l-7-3.82zM12·3L1·9l11·6·9-4.91V17h2V9L12·3z"/></svg>`,␍
apps-gurudevi-marketing-web:lint:biome:     17    │ - → },␍
apps-gurudevi-marketing-web:lint:biome:     18    │ - → {␍
apps-gurudevi-marketing-web:lint:biome:     19    │ - → → key:·"lessons_shared_count"·as·const,␍
apps-gurudevi-marketing-web:lint:biome:     20    │ - → → label:·"Lessons·Shared",␍
apps-gurudevi-marketing-web:lint:biome:     21    │ - → → icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M18·2H6c-1.1·0-2·.9-2·2v16c0·1.1.9·2·2·2h12c1.1·0·2-.9·2-2V4c0-1.1-.9-2-2-2zM9·4h2v5l-1-.75L9·9V4zm9·16H6V4h1v9l3-2.25L13·13V4h5v16z"/></svg>`,␍
apps-gurudevi-marketing-web:lint:biome:     22    │ - → },␍
apps-gurudevi-marketing-web:lint:biome:     23    │ - ];␍
apps-gurudevi-marketing-web:lint:biome:     24    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     25    │ - const·stats·=·{␍
apps-gurudevi-marketing-web:lint:biome:     26    │ - → teachers_count:·0,␍

apps-gurudevi-marketing-web:lint:biome:     27    │ - → students_count:·0,␍
apps-gurudevi-marketing-web:lint:biome:     28    │ - → schools_count:·0,␍
apps-gurudevi-marketing-web:lint:biome:     29    │ - → lessons_shared_count:·0,␍
apps-gurudevi-marketing-web:lint:biome:     30    │ - };␍
apps-gurudevi-marketing-web:lint:biome:     31    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     32    │ - function·formatCount(value:·number):·string·{␍

apps-gurudevi-marketing-web:lint:biome:     33    │ - → return·new·Intl.NumberFormat("en-US").format(value);␍
apps-gurudevi-marketing-web:lint:biome:     34    │ - }␍
apps-gurudevi-marketing-web:lint:biome:         2 │ + const·statDefs·=·[
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··{
apps-gurudevi-marketing-web:lint:biome:         4 │ + ····key:·'teachers_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:         5 │ + ····label:·'Teachers',
apps-gurudevi-marketing-web:lint:biome:         6 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M12·12c2.21·0·4-1.79·4-4s-1.79-4-4-4-4·1.79-4·4·1.79·4·4·4zm0·2c-2.67·0-8·1.34-8·4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
apps-gurudevi-marketing-web:lint:biome:         7 │ + ··},

apps-gurudevi-marketing-web:lint:biome:         8 │ + ··{
apps-gurudevi-marketing-web:lint:biome:         9 │ + ····key:·'students_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:        10 │ + ····label:·'Students',
apps-gurudevi-marketing-web:lint:biome:        11 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M16·11c1.66·0·2.99-1.34·2.99-3S17.66·8·16·8·13.01·9.34·13.01·11s1.33·3·2.99·3zM9·11c1.66·0·2.99-1.34·2.99-3S10.66·8·9·8·6.01·9.34·6.01·11s1.33·3·2.99·3zm7·3c-2.33·0-7·1.17-7·3.5V19h14v-1.5c0-2.33-4.67-3.5-7-3.5zm-7·0c-2.33·0-7·1.17-7·3.5V19h5v-1.5c0-1.07.36-2.02.93-2.82C9.57·14.25·9.3·14·9·14z"/></svg>`,
apps-gurudevi-marketing-web:lint:biome:        12 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        13 │ + ··{
apps-gurudevi-marketing-web:lint:biome:        14 │ + ····key:·'schools_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:        15 │ + ····label:·'Schools',
apps-gurudevi-marketing-web:lint:biome:        16 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M5·13.18v4L12·21l7-3.82v-4L12·17l-7-3.82zM12·3L1·9l11·6·9-4.91V17h2V9L12·3z"/></svg>`,

apps-gurudevi-marketing-web:lint:biome:        17 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        18 │ + ··{
apps-gurudevi-marketing-web:lint:biome:        19 │ + ····key:·'lessons_shared_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:        20 │ + ····label:·'Lessons·Shared',
apps-gurudevi-marketing-web:lint:biome:        21 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M18·2H6c-1.1·0-2·.9-2·2v16c0·1.1.9·2·2·2h12c1.1·0·2-.9·2-2V4c0-1.1-.9-2-2-2zM9·4h2v5l-1-.75L9·9V4zm9·16H6V4h1v9l3-2.25L13·13V4h5v16z"/></svg>`,
apps-gurudevi-marketing-web:lint:biome:        22 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        23 │ + ];
apps-gurudevi-marketing-web:lint:biome:        24 │ + 
apps-gurudevi-marketing-web:lint:biome:        25 │ + const·stats·=·{

apps-gurudevi-marketing-web:lint:biome:        26 │ + ··teachers_count:·0,
apps-gurudevi-marketing-web:lint:biome:        27 │ + ··students_count:·0,
apps-gurudevi-marketing-web:lint:biome:        28 │ + ··schools_count:·0,
apps-gurudevi-marketing-web:lint:biome:        29 │ + ··lessons_shared_count:·0,
apps-gurudevi-marketing-web:lint:biome:        30 │ + };
apps-gurudevi-marketing-web:lint:biome:        31 │ + 
apps-gurudevi-marketing-web:lint:biome:        32 │ + function·formatCount(value:·number):·string·{
apps-gurudevi-marketing-web:lint:biome:        33 │ + ··return·new·Intl.NumberFormat('en-US').format(value);
apps-gurudevi-marketing-web:lint:biome:        34 │ + }
apps-gurudevi-marketing-web:lint:biome:     35 35 │   </script>␍
apps-gurudevi-marketing-web:lint:biome:     36 36 │   ␍

apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\styles\global.css:3:2 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Tailwind-specific syntax is disabled.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1 │ @import "tailwindcss";
apps-gurudevi-marketing-web:lint:biome:      2 │ 
apps-gurudevi-marketing-web:lint:biome:    > 3 │ @theme {
apps-gurudevi-marketing-web:lint:biome:        │  ^^^^^^^
apps-gurudevi-marketing-web:lint:biome:    > 4 │   /* Sanctuary Core Tokens (Web) */
apps-gurudevi-marketing-web:lint:biome:         ...
apps-gurudevi-marketing-web:lint:biome:   > 32 │   --font-display: "IM Fell English", serif;
apps-gurudevi-marketing-web:lint:biome:   > 33 │ }
apps-gurudevi-marketing-web:lint:biome:        │ ^
apps-gurudevi-marketing-web:lint:biome:     34 │ 
apps-gurudevi-marketing-web:lint:biome:     35 │ @layer base {
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Enable `tailwindDirectives` in the css parser options, or remove this if you are not using Tailwind CSS.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\styles\global.css:42:4 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Tailwind-specific syntax is disabled.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     40 │ 		color: var(--color-charcoal-truth);
apps-gurudevi-marketing-web:lint:biome:     41 │ 		font-family: var(--font-content);
apps-gurudevi-marketing-web:lint:biome:   > 42 │ 		@apply transition-colors duration-300;
apps-gurudevi-marketing-web:lint:biome:        │ 		 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
apps-gurudevi-marketing-web:lint:biome:     43 │ 	}
apps-gurudevi-marketing-web:lint:biome:     44 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Enable `tailwindDirectives` in the css parser options, or remove this if you are not using Tailwind CSS.

apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\styles\global.css format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Code formatting aborted due to parsing errors. To format code with errors, enable the 'formatter.formatWithErrors' option.
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1    │ - {␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - → "compilerOptions":·{␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - → → "baseUrl":·".",␍

apps-gurudevi-marketing-web:lint:biome:      5    │ - → → "paths":·{␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - → → → "@/*":·["./src/*"]␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - → → }␍

apps-gurudevi-marketing-web:lint:biome:      8    │ - → },␍

apps-gurudevi-marketing-web:lint:biome:      9    │ - → "include":·[".astro/types.d.ts",·"**/*"],␍

apps-gurudevi-marketing-web:lint:biome:     10    │ - → "exclude":·["dist"]␍

apps-gurudevi-marketing-web:lint:biome:     11    │ - }␍
apps-gurudevi-marketing-web:lint:biome:         1 │ + {

apps-gurudevi-marketing-web:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··"compilerOptions":·{
apps-gurudevi-marketing-web:lint:biome:         4 │ + ····"baseUrl":·".",
apps-gurudevi-marketing-web:lint:biome:         5 │ + ····"paths":·{

apps-gurudevi-marketing-web:lint:biome:         6 │ + ······"@/*":·["./src/*"]
apps-gurudevi-marketing-web:lint:biome:         7 │ + ····}
apps-gurudevi-marketing-web:lint:biome:         8 │ + ··},
apps-gurudevi-marketing-web:lint:biome:         9 │ + ··"include":·[".astro/types.d.ts",·"**/*"],
apps-gurudevi-marketing-web:lint:biome:        10 │ + ··"exclude":·["dist"]
apps-gurudevi-marketing-web:lint:biome:        11 │ + }
apps-gurudevi-marketing-web:lint:biome:     12 12 │   

apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 

@repo/people:lint:biome:      24     │ - import·{·useStaffPresence·}·from·"../hooks/useStaffPresence";␍

gurudevi-mobile:lint:biome:     139 │ 				verified: !resource.is_community, // Auto-verify core nodes, wait for review on community
gurudevi-mobile:lint:biome:   

apps-edlove-web:lint:biome:        16 │ + ····publishDate:·z.date().optional(),

gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.

gurudevi-mobile:lint:biome:   

apps-edlove-web:lint:biome:        17 │ + ··}),

gurudevi-mobile:lint:biome: 

apps-edlove-web:lint:biome:        18 │ + });

@repo/profile:lint:biome:        48 │ + ····"@react-native-async-storage/async-storage":·"2.2.0"

@repo/profile:lint:biome:        49 │ + ··},

@repo/payments:lint:biome:      2    │ - → |·"pending"␍

apps-edlove-web:lint:biome:        19 │ + 

apps-edlove-web:lint:biome:        20 │ + const·library·=·defineCollection({

@repo/profile:lint:biome:        50 │ + ··"devDependencies":·{

@repo/payments:lint:biome:      3    │ - → |·"succeeded"␍

@repo/profile:lint:biome:        51 │ + ····"i18next":·"^25.8.11",

@repo/payments:lint:biome:      4    │ - → |·"failed"␍

@repo/profile:lint:biome:        52 │ + ····"@repo/eslint-config":·"workspace:^",

@repo/payments:lint:biome:      5    │ - → |·"refunded"␍

gurudevi-mobile:lint:biome: supabase\functions\library-etl\index.ts:170:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.

gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     168 │ 			{ headers: { ...corsHeaders, "Content-Type": "application/json" } },
gurudevi-mobile:lint:biome:     169 │ 		);

@repo/payments:lint:biome:      6    │ - → |·"cancelled";␍

@repo/payments:lint:biome:      7    │ - ␍

@intuitui-labs/lk-edu-geo:lint:biome:        28 │ + ····"provinces",
@intuitui-labs/lk-edu-geo:lint:biome:        29 │ + ····"gn-divisions",

@intuitui-labs/lk-edu-geo:lint:biome:        30 │ + ····"educational-zones"
@intuitui-labs/lk-edu-geo:lint:biome:        31 │ + ··],
@intuitui-labs/lk-edu-geo:lint:biome:        32 │ + ··"packageManager":·"pnpm@10.30.2",
@intuitui-labs/lk-edu-geo:lint:biome:        33 │ + ··"scripts":·{
@intuitui-labs/lk-edu-geo:lint:biome:        34 │ + ····"build":·"pnpm·exec·tsup·src/index.ts·--format·esm,cjs·--dts·--clean",
@intuitui-labs/lk-edu-geo:lint:biome:        35 │ + ····"test":·"vitest·run",
@intuitui-labs/lk-edu-geo:lint:biome:        36 │ + ····"validate":·"pnpm·exec·tsx·scripts/validate.ts",

@intuitui-labs/lk-edu-geo:lint:biome:        37 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@intuitui-labs/lk-edu-geo:lint:biome:        38 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",

@intuitui-labs/lk-edu-geo:lint:biome:        39 │ + ····"import:xlsx":·"pnpm·exec·tsx·scripts/import-xlsx.ts",
@intuitui-labs/lk-edu-geo:lint:biome:        40 │ + ····"import:pdf":·"pnpm·exec·tsx·scripts/import-pdf.ts",
@intuitui-labs/lk-edu-geo:lint:biome:        41 │ + ····"lint:biome":·"biome·check·.",

@intuitui-labs/lk-edu-geo:lint:biome:        42 │ + ····"lint:eslint":·"eslint·.",
@intuitui-labs/lk-edu-geo:lint:biome:        43 │ + ····"format":·"biome·format·--write·.",
@intuitui-labs/lk-edu-geo:lint:biome:        44 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",

@intuitui-labs/lk-edu-geo:lint:biome:        45 │ + ····"test:watch":·"vitest",
@intuitui-labs/lk-edu-geo:lint:biome:        46 │ + ····"test:ui":·"vitest·--ui",
@intuitui-labs/lk-edu-geo:lint:biome:        47 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@intuitui-labs/lk-edu-geo:lint:biome:        48 │ + ··},
@intuitui-labs/lk-edu-geo:lint:biome:     49 49 │     "devDependencies": {

@intuitui-labs/lk-edu-geo:lint:biome:     50 50 │       "@nishansanjuka/srilanka_geographics": "^0.0.1",
@intuitui-labs/lk-edu-geo:lint:biome:     ····· │ 
@intuitui-labs/lk-edu-geo:lint:biome:     52 52 │       "@types/node": "^25.5.0",
@intuitui-labs/lk-edu-geo:lint:biome:     53 53 │       "@types/glob": "^9.0.0",
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
@intuitui-labs/lk-edu-geo:lint:biome:        54 │ + ····"glob":·"^11.0.1",
@intuitui-labs/lk-edu-geo:lint:biome:        55 │ + ····"tsup":·"^8.3.5",
@intuitui-labs/lk-edu-geo:lint:biome:        56 │ + ····"tsx":·"^4.19.2",
@intuitui-labs/lk-edu-geo:lint:biome:        57 │ + ····"typescript":·"^5.9.3",

@intuitui-labs/lk-edu-geo:lint:biome:        58 │ + ····"vitest":·"^2.1.9",
@intuitui-labs/lk-edu-geo:lint:biome:        59 │ + ····"xlsx":·"^0.18.5",
@intuitui-labs/lk-edu-geo:lint:biome:        60 │ + ····"@repo/eslint-config":·"workspace:^",
@intuitui-labs/lk-edu-geo:lint:biome:        61 │ + ····"@repo/typescript-config":·"workspace:*",
@intuitui-labs/lk-edu-geo:lint:biome:        62 │ + ····"vite-tsconfig-paths":·"^6.1.1",
@intuitui-labs/lk-edu-geo:lint:biome:        63 │ + ····"eslint":·"^9.38.0"
@intuitui-labs/lk-edu-geo:lint:biome:        64 │ + ··}
@intuitui-labs/lk-edu-geo:lint:biome:        65 │ + }

@intuitui-labs/lk-edu-geo:lint:biome:     66 66 │   
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\import-xlsx.ts:97:7 lint/suspicious/noImplicitAnyLet ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × This variable implicitly has the any type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     95 │ 		const regex =
@intuitui-labs/lk-edu-geo:lint:biome:     96 │ 			/\('(\d+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+|\w+)\)/g;

@intuitui-labs/lk-edu-geo:lint:biome:   > 97 │ 		let match;
@intuitui-labs/lk-edu-geo:lint:biome:        │ 		    ^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     98 │ 
@intuitui-labs/lk-edu-geo:lint:biome:     99 │ 		while ((match = regex.exec(content)) !== null) {
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i Variable declarations without type annotation and initialization implicitly have the any type. Declare a type or initialize the variable with some value.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\import-xlsx.ts:99:11 lint/suspicious/noAssignInExpressions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   × The assignment should not be in an expression.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:      97 │ 		let match;
@intuitui-labs/lk-edu-geo:lint:biome:      98 │ 
@intuitui-labs/lk-edu-geo:lint:biome:    > 99 │ 		while ((match = regex.exec(content)) !== null) {
@intuitui-labs/lk-edu-geo:lint:biome:         │ 		        ^^^^^^^^^^^^^^^^^^^^^^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     100 │ 			const [
@intuitui-labs/lk-edu-geo:lint:biome:     101 │ 				_full,
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i The use of assignments in expressions is confusing.

@intuitui-labs/lk-edu-geo:lint:biome:     Expressions are often considered as side-effect free.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\inspect-xlsx.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   × Formatter would have printed the following content:
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:      1    │ - import·{·createRequire·}·from·"node:module";␍

@intuitui-labs/lk-edu-geo:lint:biome:      2    │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      3    │ - const·require·=·createRequire(import.meta.url);␍
@intuitui-labs/lk-edu-geo:lint:biome:      4    │ - const·XLSX·=·require("xlsx");␍

@intuitui-labs/lk-edu-geo:lint:biome:      5    │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      6    │ - const·filePath·=␍
@intuitui-labs/lk-edu-geo:lint:biome:      7    │ - → "c:\\Users\\Naween\\projects\\polymath-platform\\lka_admin_boundaries.xlsx";␍
@intuitui-labs/lk-edu-geo:lint:biome:      8    │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      9    │ - async·function·inspect()·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     10    │ - → try·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     11    │ - → → console.log(`\uD83E\uDDD0·Detailed·Inspection:·lka_admin4`);␍
@intuitui-labs/lk-edu-geo:lint:biome:     12    │ - → → const·partialWorkbook·=·XLSX.readFile(filePath,·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     13    │ - → → → sheetRows:·5,␍
@intuitui-labs/lk-edu-geo:lint:biome:     14    │ - → → → sheets:·["lka_admin4"],␍
@intuitui-labs/lk-edu-geo:lint:biome:     15    │ - → → });␍

@intuitui-labs/lk-edu-geo:lint:biome:     16    │ - → → const·worksheet·=·partialWorkbook.Sheets.lka_admin4;␍
@intuitui-labs/lk-edu-geo:lint:biome:     17    │ - → → const·json·=·XLSX.utils.sheet_to_json(worksheet,·{·header:·1·});␍
@intuitui-labs/lk-edu-geo:lint:biome:     18    │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:     19    │ - → → if·(json.length·>·0)·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     20    │ - → → → console.log("HEADERS:",·JSON.stringify(json[0],·null,·2));␍
@intuitui-labs/lk-edu-geo:lint:biome:     21    │ - → → → console.log("ROW·1:",·JSON.stringify(json[1],·null,·2));␍
@intuitui-labs/lk-edu-geo:lint:biome:     22    │ - → → → console.log("ROW·2:",·JSON.stringify(json[2],·null,·2));␍
@intuitui-labs/lk-edu-geo:lint:biome:     23    │ - → → }·else·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     24    │ - → → → console.log("Empty·sheet·or·sheet·not·found.");␍
@intuitui-labs/lk-edu-geo:lint:biome:     25    │ - → → }␍
@intuitui-labs/lk-edu-geo:lint:biome:     26    │ - → }·catch·(error)·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     27    │ - → → console.error("\u274C·Error:",·error);␍
@intuitui-labs/lk-edu-geo:lint:biome:     28    │ - → }␍
@intuitui-labs/lk-edu-geo:lint:biome:     29    │ - }␍

@intuitui-labs/lk-edu-geo:lint:biome:     30    │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:     31    │ - inspect();␍
@intuitui-labs/lk-edu-geo:lint:biome:         1 │ + import·{·createRequire·}·from·'node:module';
@intuitui-labs/lk-edu-geo:lint:biome:         2 │ + 
@intuitui-labs/lk-edu-geo:lint:biome:         3 │ + const·require·=·createRequire(import.meta.url);
@intuitui-labs/lk-edu-geo:lint:biome:         4 │ + const·XLSX·=·require('xlsx');
@intuitui-labs/lk-edu-geo:lint:biome:         5 │ + 
@intuitui-labs/lk-edu-geo:lint:biome:         6 │ + const·filePath·=·'c:\\Users\\Naween\\projects\\polymath-platform\\lka_admin_boundaries.xlsx';
@intuitui-labs/lk-edu-geo:lint:biome:         7 │ + 
@intuitui-labs/lk-edu-geo:lint:biome:         8 │ + async·function·inspect()·{
@intuitui-labs/lk-edu-geo:lint:biome:         9 │ + ··try·{
@intuitui-labs/lk-edu-geo:lint:biome:        10 │ + ····console.log(`\uD83E\uDDD0·Detailed·Inspection:·lka_admin4`);
@intuitui-labs/lk-edu-geo:lint:biome:        11 │ + ····const·partialWorkbook·=·XLSX.readFile(filePath,·{

@intuitui-labs/lk-edu-geo:lint:biome:        12 │ + ······sheetRows:·5,
@intuitui-labs/lk-edu-geo:lint:biome:        13 │ + ······sheets:·['lka_admin4'],
@intuitui-labs/lk-edu-geo:lint:biome:        14 │ + ····});
@intuitui-labs/lk-edu-geo:lint:biome:        15 │ + ····const·worksheet·=·partialWorkbook.Sheets.lka_admin4;
@intuitui-labs/lk-edu-geo:lint:biome:        16 │ + ····const·json·=·XLSX.utils.sheet_to_json(worksheet,·{·header:·1·});
@intuitui-labs/lk-edu-geo:lint:biome:        17 │ + 
@intuitui-labs/lk-edu-geo:lint:biome:        18 │ + ····if·(json.length·>·0)·{
@intuitui-labs/lk-edu-geo:lint:biome:        19 │ + ······console.log('HEADERS:',·JSON.stringify(json[0],·null,·2));
@intuitui-labs/lk-edu-geo:lint:biome:        20 │ + ······console.log('ROW·1:',·JSON.stringify(json[1],·null,·2));
@intuitui-labs/lk-edu-geo:lint:biome:        21 │ + ······console.log('ROW·2:',·JSON.stringify(json[2],·null,·2));
@intuitui-labs/lk-edu-geo:lint:biome:        22 │ + ····}·else·{

@intuitui-labs/lk-edu-geo:lint:biome:        23 │ + ······console.log('Empty·sheet·or·sheet·not·found.');
@intuitui-labs/lk-edu-geo:lint:biome:        24 │ + ····}
@intuitui-labs/lk-edu-geo:lint:biome:        25 │ + ··}·catch·(error)·{
@intuitui-labs/lk-edu-geo:lint:biome:        26 │ + ····console.error('\u274C·Error:',·error);
@intuitui-labs/lk-edu-geo:lint:biome:        27 │ + ··}
@intuitui-labs/lk-edu-geo:lint:biome:        28 │ + }
@intuitui-labs/lk-edu-geo:lint:biome:        29 │ + 
@intuitui-labs/lk-edu-geo:lint:biome:        30 │ + inspect();
@intuitui-labs/lk-edu-geo:lint:biome:     32 31 │   
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: src\types.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Formatter would have printed the following content:
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:       1     │ - /**␍
@intuitui-labs/lk-edu-geo:lint:biome:       2     │ - ·*·ID·Formats:␍
@intuitui-labs/lk-edu-geo:lint:biome:       3     │ - ·*·Province:·P_XX·(e.g.,·P_01)␍
@intuitui-labs/lk-edu-geo:lint:biome:       4     │ - ·*·District:·D_XXXX·(e.g.,·D_0101)␍
@intuitui-labs/lk-edu-geo:lint:biome:       5     │ - ·*·Postal·Unit:·POST_XXXXX·(e.g.,·POST_00100)␍
@intuitui-labs/lk-edu-geo:lint:biome:       6     │ - ·*·Edu·Zone:·Z_XXXX·(e.g.,·Z_0101)␍

@intuitui-labs/lk-edu-geo:lint:biome:       7     │ - ·*·Edu·Division:·DIV_XXXXXX·(e.g.,·DIV_010101)␍

@intuitui-labs/lk-edu-geo:lint:biome:       8     │ - ·*·School:·SCH_XXXXXXX·(e.g.,·SCH_0000001)␍
@intuitui-labs/lk-edu-geo:lint:biome:       9     │ - ·*/␍
@intuitui-labs/lk-edu-geo:lint:biome:      10     │ - ␍

@intuitui-labs/lk-edu-geo:lint:biome:      11     │ - export·type·SchoolType·=␍
@intuitui-labs/lk-edu-geo:lint:biome:      12     │ - → |·"National"␍
@intuitui-labs/lk-edu-geo:lint:biome:      13     │ - → |·"Provincial"␍
@intuitui-labs/lk-edu-geo:lint:biome:      14     │ - → |·"Pirivena"␍
@intuitui-labs/lk-edu-geo:lint:biome:      15     │ - → |·"International"␍
@intuitui-labs/lk-edu-geo:lint:biome:      16     │ - → |·"Semi-Government";␍
@intuitui-labs/lk-edu-geo:lint:biome:      17     │ - export·type·Medium·=·"Sinhala"·|·"Tamil"·|·"English"·|·"Mixed";␍
@intuitui-labs/lk-edu-geo:lint:biome:      18     │ - export·type·Level·=·"Primary"·|·"Secondary"·|·"Mixed";␍
@intuitui-labs/lk-edu-geo:lint:biome:      19     │ - export·type·Gender·=·"Boys"·|·"Girls"·|·"Mixed";␍
@intuitui-labs/lk-edu-geo:lint:biome:      20     │ - export·type·Status·=·"Active"·|·"Closed"·|·"Merged";␍
@intuitui-labs/lk-edu-geo:lint:biome:      21     │ - export·type·Religion·=␍
@intuitui-labs/lk-edu-geo:lint:biome:      22     │ - → |·"Buddhist"␍
@intuitui-labs/lk-edu-geo:lint:biome:      23     │ - → |·"Hindu"␍
@intuitui-labs/lk-edu-geo:lint:biome:      24     │ - → |·"Catholic"␍
@intuitui-labs/lk-edu-geo:lint:biome:      25     │ - → |·"Christian"␍

@intuitui-labs/lk-edu-geo:lint:biome:      26     │ - → |·"Muslim"␍
@intuitui-labs/lk-edu-geo:lint:biome:      27     │ - → |·"Other";␍
@intuitui-labs/lk-edu-geo:lint:biome:      28     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      29     │ - export·interface·Province·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      30     │ - → id:·string;·//·P_1·(Western)␍
@intuitui-labs/lk-edu-geo:lint:biome:      31     │ - → name:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      32     │ - → name_si?:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:      33     │ - → name_ta?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      34     │ - → mnemonic?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      35     │ - }␍
@intuitui-labs/lk-edu-geo:lint:biome:      36     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      37     │ - export·interface·District·{␍

@intuitui-labs/lk-edu-geo:lint:biome:      38     │ - → id:·string;·//·D_11·(Colombo)␍
@intuitui-labs/lk-edu-geo:lint:biome:      39     │ - → province_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      40     │ - → name:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      41     │ - → name_si?:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:      42     │ - → name_ta?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      43     │ - → mnemonic?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      44     │ - }␍
@intuitui-labs/lk-edu-geo:lint:biome:      45     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      46     │ - /**␍
@intuitui-labs/lk-edu-geo:lint:biome:      47     │ - ·*·Administrative:·Divisional·Secretariat·(Phase·4)␍

@intuitui-labs/lk-edu-geo:lint:biome:      48     │ - ·*/␍
@intuitui-labs/lk-edu-geo:lint:biome:      49     │ - export·interface·DSDivision·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      50     │ - → id:·string;·//·DS_LK1103·(Colombo·DS)␍
@intuitui-labs/lk-edu-geo:lint:biome:      51     │ - → district_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      52     │ - → name:·string;␍

gurudevi-mobile:lint:biome:   > 170 │ 	} catch (error: any) {
@intuitui-labs/lk-edu-geo:lint:biome:      53     │ - → name_si?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      54     │ - → name_ta?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      55     │ - → p_code:·string;·//·Official·Survey·Dept·P-Code␍

@intuitui-labs/lk-edu-geo:lint:biome:      56     │ - }␍

@intuitui-labs/lk-edu-geo:lint:biome:      57     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      58     │ - /**␍
@intuitui-labs/lk-edu-geo:lint:biome:      59     │ - ·*·Administrative:·Grama·Niladhari·(Phase·4)␍
@intuitui-labs/lk-edu-geo:lint:biome:      60     │ - ·*/␍

@intuitui-labs/lk-edu-geo:lint:biome:      61     │ - export·interface·GNDivision·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      62     │ - → id:·string;·//·GN_LK1103005␍
@intuitui-labs/lk-edu-geo:lint:biome:      63     │ - → ds_division_id:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:      64     │ - → district_id?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      65     │ - → name:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      66     │ - → name_si?:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:      67     │ - → name_ta?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      68     │ - → p_code:·string;·//·Official·Survey·Dept·P-Code␍
@intuitui-labs/lk-edu-geo:lint:biome:      69     │ - → gn_code?:·string;·//·e.g.·"123A"·(if·available)␍
@intuitui-labs/lk-edu-geo:lint:biome:      70     │ - → location?:·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      71     │ - → → lat:·number;␍
@intuitui-labs/lk-edu-geo:lint:biome:      72     │ - → → lng:·number;␍
@intuitui-labs/lk-edu-geo:lint:biome:      73     │ - → };␍

@intuitui-labs/lk-edu-geo:lint:biome:      74     │ - }␍
@intuitui-labs/lk-edu-geo:lint:biome:      75     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:      76     │ - /**␍
@intuitui-labs/lk-edu-geo:lint:biome:      77     │ - ·*·Administrative:·Postal·Unit·(Post·Office·/·Town)␍
@intuitui-labs/lk-edu-geo:lint:biome:      78     │ - ·*/␍
@intuitui-labs/lk-edu-geo:lint:biome:      79     │ - export·interface·PostalUnit·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      80     │ - → id:·string;·//·POST_00100␍
@intuitui-labs/lk-edu-geo:lint:biome:      81     │ - → district_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      82     │ - → city:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      83     │ - → postal_code:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      84     │ - → location?:·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      85     │ - → → lat:·number;␍

@intuitui-labs/lk-edu-geo:lint:biome:      86     │ - → → lng:·number;␍
@intuitui-labs/lk-edu-geo:lint:biome:      87     │ - → };␍
@intuitui-labs/lk-edu-geo:lint:biome:      88     │ - }␍
gurudevi-mobile:lint:biome:         │ 	                ^^^
@intuitui-labs/lk-edu-geo:lint:biome:      89     │ - ␍

@intuitui-labs/lk-edu-geo:lint:biome:      90     │ - /**␍
@intuitui-labs/lk-edu-geo:lint:biome:      91     │ - ·*·Educational:·Zone·(Province·->·Zone)␍
@intuitui-labs/lk-edu-geo:lint:biome:      92     │ - ·*/␍
@intuitui-labs/lk-edu-geo:lint:biome:      93     │ - export·interface·Zone·{␍
@intuitui-labs/lk-edu-geo:lint:biome:      94     │ - → id:·string;·//·Z_101␍
@intuitui-labs/lk-edu-geo:lint:biome:      95     │ - → province_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      96     │ - → name:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:      97     │ - → name_si?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      98     │ - → name_ta?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:      99     │ - }␍
@intuitui-labs/lk-edu-geo:lint:biome:     100     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:     101     │ - /**␍
@intuitui-labs/lk-edu-geo:lint:biome:     102     │ - ·*·Educational:·Division·(Zone·->·Division)␍
@intuitui-labs/lk-edu-geo:lint:biome:     103     │ - ·*/␍

@intuitui-labs/lk-edu-geo:lint:biome:     104     │ - export·interface·Division·{␍

@intuitui-labs/lk-edu-geo:lint:biome:     105     │ - → id:·string;·//·DIV_10101␍
@intuitui-labs/lk-edu-geo:lint:biome:     106     │ - → zone_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     107     │ - → name:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:     108     │ - → name_si?:·string;␍

@repo/people:lint:biome:      25     │ - ␍

apps-gurudevi-marketing-web:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 

@repo/profile:lint:biome:        53 │ + ····"@repo/typescript-config":·"workspace:*",

@repo/people:lint:biome:      26     │ - interface·StaffPresencePulseProps·{␍

@repo/profile:lint:biome:        54 │ + ····"@types/react":·"^19.2.14",

apps-edlove-web:lint:biome:        21 │ + ··loader:·glob({·base:·'./src/content/library',·pattern:·'**/*.{md,mdx}'·}),

@repo/people:lint:biome:      27     │ - → userId:·string;␍

apps-edlove-web:lint:biome:        22 │ + ··schema:·z.object({

apps-edlove-web:lint:biome:        23 │ + ····title:·z.string(),

apps-edlove-web:lint:biome:        24 │ + ····subtitle:·z.string(),

gurudevi-mobile:lint:biome:     171 │ 		return new Response(

@repo/people:lint:biome:      28     │ - → schoolId:·string;␍

apps-edlove-web:lint:biome:        25 │ + ····icon:·z.string().optional(),

@repo/people:lint:biome:      29     │ - }␍

@repo/people:lint:biome:      30     │ - ␍

@repo/profile:lint:biome:        55 │ + ····"@types/react-native":·"workspace:*",

@repo/people:lint:biome:      31     │ - export·const·StaffPresencePulse:·React.FC<StaffPresencePulseProps>·=·({␍

@repo/people:lint:biome:      32     │ - → userId,␍

@repo/people:lint:biome:      33     │ - → schoolId,␍

@repo/people:lint:biome:      34     │ - })·=>·{␍

@repo/profile:lint:biome:        56 │ + ····"@vitest/ui":·"^4.1.5",

@intuitui-labs/lk-edu-geo:lint:biome:     109     │ - → name_ta?:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:     110     │ - }␍

@intuitui-labs/lk-edu-geo:lint:biome:     111     │ - ␍

@intuitui-labs/lk-edu-geo:lint:biome:     112     │ - export·interface·School·{␍

@intuitui-labs/lk-edu-geo:lint:biome:     113     │ - → id:·string;·//·SCH_00001␍

@repo/payments:lint:biome:      8    │ - export·interface·PaymentIntent·{␍

apps-edlove-web:lint:biome:        26 │ + ····category:·z.enum(['thinker',·'framework',·'guide',·'story']),

apps-edlove-web:lint:biome:        27 │ + ····tags:·z.array(z.string()).default([]),

@repo/people:lint:biome:      35     │ - → const·{·t,·i18n·}·=·useTranslation();␍

apps-gurudevi-marketing-web:lint:biome:   × Some errors were emitted while running checks.
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome: 

@repo/people:lint:biome:      36     │ - → const·{·attendance,·isCheckedIn,·checkIn,·checkOut,·loading·}·=␍

@repo/people:lint:biome:      37     │ - → → useStaffPresence(userId,·schoolId);␍

@repo/people:lint:biome:      38     │ - → const·[actionLoading,·setActionLoading]·=·useState(false);␍

@repo/people:lint:biome:      39     │ - ␍

@repo/people:lint:biome:      40     │ - → const·handleToggleAttendance·=·async·()·=>·{␍

@repo/people:lint:biome:      41     │ - → → hapticLight();␍

@repo/people:lint:biome:      42     │ - → → setActionLoading(true);␍

@repo/people:lint:biome:      43     │ - → → try·{␍

@repo/people:lint:biome:      44     │ - → → → if·(isCheckedIn)·{␍

@repo/people:lint:biome:      45     │ - → → → → await·checkOut();␍

@repo/profile:lint:biome:        57 │ + ····"eslint":·"^9.38.0",

@repo/profile:lint:biome:        58 │ + ····"typescript":·"^5.9.3",
@repo/profile:lint:biome:        59 │ + ····"vite-tsconfig-paths":·"^6.1.1",
@repo/profile:lint:biome:        60 │ + ····"vitest":·"^2.1.9"
@repo/profile:lint:biome:        61 │ + ··},
@repo/profile:lint:biome:        62 │ + ··"peerDependencies":·{
@repo/profile:lint:biome:        63 │ + ····"@repo/ui":·"*",
@repo/profile:lint:biome:        64 │ + ····"lucide-react-native":·"*",
@repo/profile:lint:biome:        65 │ + ····"react":·"*",
@repo/profile:lint:biome:        66 │ + ····"react-i18next":·"*",

@repo/profile:lint:biome:        67 │ + ····"react-native":·"*",
@repo/profile:lint:biome:        68 │ + ····"@react-navigation/native":·"*",
@repo/profile:lint:biome:        69 │ + ····"@react-native-async-storage/async-storage":·"*"
@repo/profile:lint:biome:        70 │ + ··}
@repo/profile:lint:biome:        71 │ + }
@repo/profile:lint:biome:     72 72 │   
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
@repo/profile:lint:biome: src\components\EditProfileModal.tsx:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 
@repo/profile:lint:biome:   × The imports and exports are not sorted.
@repo/profile:lint:biome:   
@repo/profile:lint:biome:   > 1 │ import { profileAPI } from '@repo/core/api';

@intuitui-labs/lk-edu-geo:lint:biome:     114     │ - → census_no:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:     115     │ - → name:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:     116     │ - → type:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:     117     │ - → category:·string;␍

@repo/payments:lint:biome:      9    │ - → id:·string;␍

@repo/payments:lint:biome:     10    │ - → amount:·number;␍

apps-edlove-web:lint:biome:        28 │ + ····readingTime:·z.number().optional(),

@repo/people:lint:biome:      46     │ - → → → }·else·{␍

@repo/profile:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

gurudevi-mobile:lint:biome:     172 │ 			JSON.stringify({ error: error.message || "Unknown error" }),

@repo/people:lint:biome:      47     │ - → → → → await·checkIn();␍

@repo/people:lint:biome:      48     │ - → → → }␍

apps-edlove-web:lint:biome:        29 │ + ····order:·z.number().default(0),
apps-edlove-web:lint:biome:        30 │ + ····draft:·z.boolean().default(false),
apps-edlove-web:lint:biome:        31 │ + ··}),
apps-edlove-web:lint:biome:        32 │ + });
apps-edlove-web:lint:biome:        33 │ + 

apps-edlove-web:lint:biome:        34 │ + const·sriLanka·=·defineCollection({

@repo/payments:lint:biome:     11    │ - → currency:·string;␍

@repo/payments:lint:biome:     12    │ - → status:·PaymentStatus;␍

@repo/payments:lint:biome:     13    │ - → provider:·string;␍
@repo/payments:lint:biome:     14    │ - → clientSecret?:·string;␍
@repo/payments:lint:biome:     15    │ - → metadata?:·Record<string,·any>;␍
@repo/payments:lint:biome:     16    │ - }␍

@repo/payments:lint:biome:     17    │ - ␍
@repo/payments:lint:biome:     18    │ - export·interface·PaymentMethod·{␍
@repo/payments:lint:biome:     19    │ - → id:·string;␍
@repo/payments:lint:biome:     20    │ - → type:·"card"·|·"bank_account"·|·"wallet"·|·"qr";␍
@repo/payments:lint:biome:     21    │ - → provider:·string;␍

@repo/payments:lint:biome:     22    │ - → lastFour?:·string;␍
@repo/payments:lint:biome:     23    │ - → expiry?:·string;␍
@repo/payments:lint:biome:     24    │ - → isDefault:·boolean;␍
@repo/payments:lint:biome:     25    │ - → metadata?:·Record<string,·any>;␍
@repo/payments:lint:biome:     26    │ - }␍
@repo/payments:lint:biome:     27    │ - ␍
@repo/payments:lint:biome:     28    │ - export·interface·PaymentProvider·{␍

@repo/payments:lint:biome:     29    │ - → id:·string;␍
@repo/payments:lint:biome:     30    │ - → name:·string;␍
@repo/payments:lint:biome:     31    │ - → initializePayment(␍
@repo/payments:lint:biome:     32    │ - → → amount:·number,␍
@repo/payments:lint:biome:     33    │ - → → currency:·string,␍
@repo/payments:lint:biome:     34    │ - → → metadata?:·any,␍
@repo/payments:lint:biome:     35    │ - → ):·Promise<PaymentIntent>;␍
@repo/payments:lint:biome:     36    │ - → verifyPayment(paymentIntentId:·string):·Promise<PaymentStatus>;␍

@repo/payments:lint:biome:     37    │ - → getFeeEstimate(amount:·number):·number;␍
@repo/payments:lint:biome:     38    │ - }␍
@repo/payments:lint:biome:         1 │ + export·type·PaymentStatus·=·'pending'·|·'succeeded'·|·'failed'·|·'refunded'·|·'cancelled';
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

gurudevi-mobile:lint:biome:   

@repo/people:lint:biome:      49     │ - → → }·catch·(err)·{␍

@repo/people:lint:biome:      50     │ - → → → console.error("Attendance·toggle·failed:",·err);␍
@repo/people:lint:biome:      51     │ - → → }·finally·{␍
@repo/people:lint:biome:      52     │ - → → → setActionLoading(false);␍
@repo/people:lint:biome:      53     │ - → → }␍
@repo/people:lint:biome:      54     │ - → };␍
@repo/people:lint:biome:      55     │ - ␍
@repo/people:lint:biome:      56     │ - → if·(loading)·return·null;␍
@repo/people:lint:biome:      57     │ - ␍
@repo/people:lint:biome:      58     │ - → const·todayStr·=·format(new·Date(),·"yyyy-MM-dd");␍

@repo/people:lint:biome:      59     │ - → const·todayAttendance·=·attendance.find(␍
@repo/people:lint:biome:      60     │ - → → (a)·=>·format(new·Date(a.check_in),·"yyyy-MM-dd")·===·todayStr,␍
@repo/people:lint:biome:      61     │ - → );␍
@repo/people:lint:biome:      62     │ - ␍
@repo/people:lint:biome:      63     │ - → return·(␍
@repo/people:lint:biome:      64     │ - → → <VStack·className="gap-5">␍
@repo/people:lint:biome:      65     │ - → → → <VStack·className="gap-1.5·px-1">␍
@repo/people:lint:biome:      66     │ - → → → → <Heading·className="text-[20px]·font-black·text-phaseText-primary·tracking-tight">␍
@repo/people:lint:biome:      67     │ - → → → → → {t("staffPresence.title")·||·"Presence·Pulse"}␍

@repo/people:lint:biome:      68     │ - → → → → </Heading>␍
@repo/people:lint:biome:      69     │ - → → → → <Text·className="text-[11px]·font-bold·text-phaseText-muted·uppercase·tracking-[2px]">␍
@repo/people:lint:biome:      70     │ - → → → → → Gate·Monitoring␍
@repo/people:lint:biome:      71     │ - → → → → </Text>␍

@repo/people:lint:biome:      72     │ - → → → </VStack>␍
@repo/people:lint:biome:      73     │ - ␍
@repo/people:lint:biome:      74     │ - → → → <Box·className="p-6·rounded-[32px]·bg-phase-surface·border·border-phase-border·shadow-sm">␍
@repo/people:lint:biome:      75     │ - → → → → <VStack·className="gap-6">␍
@repo/people:lint:biome:      76     │ - → → → → → <HStack·className="justify-between·items-center">␍
@repo/people:lint:biome:      77     │ - → → → → → → <VStack·className="gap-0.5">␍

@repo/people:lint:biome:      78     │ - → → → → → → → <Text·className="text-[14px]·font-black·text-phaseText-primary·tracking-tight">␍
@repo/people:lint:biome:      79     │ - → → → → → → → → {t("staffPresence.attendanceStatus")·||·"Shift·Identity"}␍
@repo/people:lint:biome:      80     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:      81     │ - → → → → → → → <Text·className="text-[11px]·font-bold·text-phaseText-muted·uppercase·tracking-wider">␍
@repo/people:lint:biome:      82     │ - → → → → → → → → {new·Intl.DateTimeFormat(i18n.language,·{␍

@repo/people:lint:biome:      83     │ - → → → → → → → → → weekday:·"long",␍
@repo/people:lint:biome:      84     │ - → → → → → → → → → day:·"numeric",␍
@repo/people:lint:biome:      85     │ - → → → → → → → → → month:·"short",␍
@repo/people:lint:biome:      86     │ - → → → → → → → → }).format(new·Date())}␍
@repo/people:lint:biome:      87     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:      88     │ - → → → → → → </VStack>␍
@repo/people:lint:biome:      89     │ - → → → → → → <Box␍

@repo/people:lint:biome:      90     │ - → → → → → → → className={`flex-row·items-center·px-4·py-1.5·rounded-full·border·${isCheckedIn·?·"bg-phase-success/10·border-phase-success/20"·:·"bg-phase-danger/10·border-phase-danger/20"}`}␍
@repo/people:lint:biome:      91     │ - → → → → → → >␍
@repo/people:lint:biome:      92     │ - → → → → → → → <Box␍
@repo/people:lint:biome:      93     │ - → → → → → → → → className={`w-1.5·h-1.5·rounded-full·mr-2·${isCheckedIn·?·"bg-phase-success"·:·"bg-phase-danger"}`}␍
@repo/people:lint:biome:      94     │ - → → → → → → → />␍
@repo/people:lint:biome:      95     │ - → → → → → → → <Text␍

@repo/people:lint:biome:      96     │ - → → → → → → → → className={`text-[10px]·font-black·uppercase·tracking-widest·${isCheckedIn·?·"text-phase-success"·:·"text-phase-danger"}`}␍
@repo/people:lint:biome:      97     │ - → → → → → → → >␍
@repo/people:lint:biome:      98     │ - → → → → → → → → {isCheckedIn␍
@repo/people:lint:biome:      99     │ - → → → → → → → → → ?·t("staffPresence.checkedIn")·||·"ACTIVE"␍
@repo/people:lint:biome:     100     │ - → → → → → → → → → :·t("staffPresence.checkedOut")·||·"STATIONED"}␍
@repo/people:lint:biome:     101     │ - → → → → → → → </Text>␍

@repo/people:lint:biome:     102     │ - → → → → → → </Box>␍
@repo/people:lint:biome:     103     │ - → → → → → </HStack>␍
@repo/people:lint:biome:     104     │ - ␍
@repo/people:lint:biome:     105     │ - → → → → → <HStack·className="gap-3">␍
@repo/people:lint:biome:     106     │ - → → → → → → <VStack·className="flex-1·bg-phase-canvas·p-4·rounded-[20px]·items-center·gap-1·border·border-phase-border/50">␍
@repo/people:lint:biome:     107     │ - → → → → → → → <Icon·as={Clock}·size="sm"·className="text-phase-interactive"·/>␍
@repo/people:lint:biome:     108     │ - → → → → → → → <Text·className="text-[9px]·text-phaseText-muted·uppercase·font-black·tracking-widest·mt-1">␍

@repo/people:lint:biome:     109     │ - → → → → → → → → {t("staffPresence.checkedInAt")·||·"CHECK-IN"}␍
@repo/people:lint:biome:     110     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     111     │ - → → → → → → → <Text·className="text-[15px]·font-black·text-phaseText-primary">␍
@repo/people:lint:biome:     112     │ - → → → → → → → → {todayAttendance␍
@repo/people:lint:biome:     113     │ - → → → → → → → → → ?·new·Intl.DateTimeFormat(i18n.language,·{␍
@repo/people:lint:biome:     114     │ - → → → → → → → → → → → hour:·"2-digit",␍
@repo/people:lint:biome:     115     │ - → → → → → → → → → → → minute:·"2-digit",␍

@repo/people:lint:biome:     116     │ - → → → → → → → → → → }).format(new·Date(todayAttendance.check_in))␍
@repo/people:lint:biome:     117     │ - → → → → → → → → → :·"--:--"}␍
@repo/people:lint:biome:     118     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     119     │ - → → → → → → </VStack>␍
@repo/people:lint:biome:     120     │ - → → → → → → <VStack·className="flex-1·bg-phase-canvas·p-4·rounded-[20px]·items-center·gap-1·border·border-phase-border/50">␍
@repo/people:lint:biome:     121     │ - → → → → → → → <Icon·as={LogOut}·size="sm"·className="text-phaseText-muted"·/>␍
@repo/people:lint:biome:     122     │ - → → → → → → → <Text·className="text-[9px]·text-phaseText-muted·uppercase·font-black·tracking-widest·mt-1">␍
@repo/people:lint:biome:     123     │ - → → → → → → → → {t("staffPresence.checkedOutAt")·||·"CHECK-OUT"}␍
@repo/people:lint:biome:     124     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     125     │ - → → → → → → → <Text·className="text-[15px]·font-black·text-phaseText-primary">␍
@repo/people:lint:biome:     126     │ - → → → → → → → → {todayAttendance?.check_out␍

@repo/people:lint:biome:     127     │ - → → → → → → → → → ?·new·Intl.DateTimeFormat(i18n.language,·{␍
@repo/people:lint:biome:     128     │ - → → → → → → → → → → → hour:·"2-digit",␍
@repo/people:lint:biome:     129     │ - → → → → → → → → → → → minute:·"2-digit",␍
@repo/people:lint:biome:     130     │ - → → → → → → → → → → }).format(new·Date(todayAttendance.check_out))␍
@repo/people:lint:biome:     131     │ - → → → → → → → → → :·"--:--"}␍
@repo/people:lint:biome:     132     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     133     │ - → → → → → → </VStack>␍
@repo/people:lint:biome:     134     │ - → → → → → </HStack>␍
@repo/people:lint:biome:     135     │ - ␍

@repo/people:lint:biome:     136     │ - → → → → → <Pressable␍
@repo/people:lint:biome:     137     │ - → → → → → → onPress={handleToggleAttendance}␍
@repo/people:lint:biome:     138     │ - → → → → → → disabled={actionLoading}␍
@repo/people:lint:biome:     139     │ - → → → → → → className={`h-14·rounded-[20px]·flex-row·items-center·justify-center·gap-3·shadow-md·active:scale-95·transition-all·${␍

@repo/people:lint:biome:     140     │ - → → → → → → → isCheckedIn·?·"bg-phase-danger"·:·"bg-phase-interactive"␍
@repo/people:lint:biome:     141     │ - → → → → → → }`}␍

@repo/people:lint:biome:     142     │ - → → → → → >␍
@repo/people:lint:biome:     143     │ - → → → → → → {actionLoading·?·(␍
@repo/people:lint:biome:     144     │ - → → → → → → → <Spinner·size="small"·color="white"·/>␍
@repo/people:lint:biome:     145     │ - → → → → → → )·:·(␍
@repo/people:lint:biome:     146     │ - → → → → → → → <>␍
@repo/people:lint:biome:     147     │ - → → → → → → → → <Icon␍
@repo/people:lint:biome:     148     │ - → → → → → → → → → as={isCheckedIn·?·LogOut·:·LogIn}␍
@repo/people:lint:biome:     149     │ - → → → → → → → → → size="sm"␍

@repo/people:lint:biome:     150     │ - → → → → → → → → → className="text-white"␍
@repo/people:lint:biome:   205 more lines truncated
@repo/people:lint:biome:   
@repo/people:lint:biome: 
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.

gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: supabase\functions\ocr-proxy\index.ts:175:17 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     173 │ 				const text =

gurudevi-mobile:lint:biome:     174 │ 					paragraph.words
gurudevi-mobile:lint:biome:   > 175 │ 						?.map((w: any) => w.symbols?.map((s: any) => s.text).join(""))
gurudevi-mobile:lint:biome:         │ 						          ^^^
gurudevi-mobile:lint:biome:     176 │ 						.join(" ") ?? "";
gurudevi-mobile:lint:biome:     177 │ 
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.

gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: supabase\functions\ocr-proxy\index.ts:175:44 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome:   ! Unexpected any. Specify a different type.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:     173 │ 				const text =
gurudevi-mobile:lint:biome:     174 │ 					paragraph.words
gurudevi-mobile:lint:biome:   > 175 │ 						?.map((w: any) => w.symbols?.map((s: any) => s.text).join(""))
gurudevi-mobile:lint:biome:         │ 						                                     ^^^

gurudevi-mobile:lint:biome:     176 │ 						.join(" ") ?? "";
gurudevi-mobile:lint:biome:     177 │ 
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:   i any disables many type checking rules. Its use should be avoided.
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome: __mocks__\@sentry\react-native.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome:      1    │ - //·Manual·mock·for·@sentry/react-native·(ESM·+·native·SDK)␍
gurudevi-mobile:lint:biome:      2    │ - module.exports·=·{␍

gurudevi-mobile:lint:biome:      3    │ - → init:·jest.fn(),␍
gurudevi-mobile:lint:biome:      4    │ - → captureException:·jest.fn(),␍
gurudevi-mobile:lint:biome:      5    │ - → captureMessage:·jest.fn(),␍
gurudevi-mobile:lint:biome:      6    │ - → addBreadcrumb:·jest.fn(),␍
gurudevi-mobile:lint:biome:      7    │ - → setUser:·jest.fn(),␍

gurudevi-mobile:lint:biome:      8    │ - → setTag:·jest.fn(),␍
gurudevi-mobile:lint:biome:      9    │ - → setContext:·jest.fn(),␍
gurudevi-mobile:lint:biome:     10    │ - → withScope:·jest.fn((fn)·=>·fn({·setTag:·jest.fn()·})),␍
gurudevi-mobile:lint:biome:     11    │ - → wrap:·jest.fn((C)·=>·C),␍
gurudevi-mobile:lint:biome:     12    │ - → ReactNativeTracing:·jest.fn(),␍
gurudevi-mobile:lint:biome:     13    │ - → ReactNavigationInstrumentation:·jest.fn(),␍
gurudevi-mobile:lint:biome:     14    │ - };␍
gurudevi-mobile:lint:biome:         1 │ + //·Manual·mock·for·@sentry/react-native·(ESM·+·native·SDK)

gurudevi-mobile:lint:biome:         2 │ + module.exports·=·{
gurudevi-mobile:lint:biome:         3 │ + ··init:·jest.fn(),
gurudevi-mobile:lint:biome:         4 │ + ··captureException:·jest.fn(),

gurudevi-mobile:lint:biome:         5 │ + ··captureMessage:·jest.fn(),
gurudevi-mobile:lint:biome:         6 │ + ··addBreadcrumb:·jest.fn(),
gurudevi-mobile:lint:biome:         7 │ + ··setUser:·jest.fn(),
gurudevi-mobile:lint:biome:         8 │ + ··setTag:·jest.fn(),
gurudevi-mobile:lint:biome:         9 │ + ··setContext:·jest.fn(),
gurudevi-mobile:lint:biome:        10 │ + ··withScope:·jest.fn((fn)·=>·fn({·setTag:·jest.fn()·})),
gurudevi-mobile:lint:biome:        11 │ + ··wrap:·jest.fn((C)·=>·C),
gurudevi-mobile:lint:biome:        12 │ + ··ReactNativeTracing:·jest.fn(),
gurudevi-mobile:lint:biome:        13 │ + ··ReactNavigationInstrumentation:·jest.fn(),
gurudevi-mobile:lint:biome:        14 │ + };
gurudevi-mobile:lint:biome:     15 15 │   
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: __mocks__\@shopify\react-native-skia.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:      1    │ - //·Manual·mock·for·@shopify/react-native-skia·(ESM·+·Skia·C++·native·build)␍
gurudevi-mobile:lint:biome:      2    │ - const·React·=·require("react");␍
gurudevi-mobile:lint:biome:      3    │ - const·ReactNative·=·require("react-native");␍
gurudevi-mobile:lint:biome:      4    │ - const·View·=·(p)·=>·React.createElement(ReactNative.View,·p);␍

gurudevi-mobile:lint:biome:      5    │ - const·noop·=·()·=>·null;␍
gurudevi-mobile:lint:biome:      6    │ - module.exports·=·{␍
gurudevi-mobile:lint:biome:      7    │ - → Canvas:·View,␍
gurudevi-mobile:lint:biome:      8    │ - → Rect:·noop,␍
gurudevi-mobile:lint:biome:      9    │ - → Circle:·noop,␍
gurudevi-mobile:lint:biome:     10    │ - → Path:·noop,␍
gurudevi-mobile:lint:biome:     11    │ - → Line:·noop,␍
gurudevi-mobile:lint:biome:     12    │ - → Fill:·noop,␍
gurudevi-mobile:lint:biome:     13    │ - → Group:·View,␍

gurudevi-mobile:lint:biome:     14    │ - → Paint:·noop,␍
gurudevi-mobile:lint:biome:     15    │ - → RadialGradient:·noop,␍
gurudevi-mobile:lint:biome:     16    │ - → LinearGradient:·noop,␍
gurudevi-mobile:lint:biome:     17    │ - → Blur:·noop,␍

gurudevi-mobile:lint:biome:     18    │ - → Shadow:·noop,␍
gurudevi-mobile:lint:biome:     19    │ - → Image:·noop,␍
gurudevi-mobile:lint:biome:     20    │ - → Text:·noop,␍
gurudevi-mobile:lint:biome:     21    │ - → useImage:·jest.fn(()·=>·null),␍

gurudevi-mobile:lint:biome:     22    │ - → useFont:·jest.fn(()·=>·null),␍
gurudevi-mobile:lint:biome:     23    │ - → useCanvasRef:·jest.fn(()·=>·({·current:·null·})),␍
gurudevi-mobile:lint:biome:     24    │ - → useTouchHandler:·jest.fn(()·=>·jest.fn()),␍
gurudevi-mobile:lint:biome:     25    │ - → Skia:·{·Paint:·jest.fn(),·Path:·jest.fn()·},␍

gurudevi-mobile:lint:biome:     26    │ - };␍
gurudevi-mobile:lint:biome:         1 │ + //·Manual·mock·for·@shopify/react-native-skia·(ESM·+·Skia·C++·native·build)
gurudevi-mobile:lint:biome:         2 │ + const·React·=·require('react');
gurudevi-mobile:lint:biome:         3 │ + const·ReactNative·=·require('react-native');
gurudevi-mobile:lint:biome:         4 │ + const·View·=·(p)·=>·React.createElement(ReactNative.View,·p);
gurudevi-mobile:lint:biome:         5 │ + const·noop·=·()·=>·null;

gurudevi-mobile:lint:biome:         6 │ + module.exports·=·{
gurudevi-mobile:lint:biome:         7 │ + ··Canvas:·View,
gurudevi-mobile:lint:biome:         8 │ + ··Rect:·noop,
gurudevi-mobile:lint:biome:         9 │ + ··Circle:·noop,
gurudevi-mobile:lint:biome:        10 │ + ··Path:·noop,

gurudevi-mobile:lint:biome:        11 │ + ··Line:·noop,
gurudevi-mobile:lint:biome:        12 │ + ··Fill:·noop,
gurudevi-mobile:lint:biome:        13 │ + ··Group:·View,
gurudevi-mobile:lint:biome:        14 │ + ··Paint:·noop,
gurudevi-mobile:lint:biome:        15 │ + ··RadialGradient:·noop,
gurudevi-mobile:lint:biome:        16 │ + ··LinearGradient:·noop,

gurudevi-mobile:lint:biome:        17 │ + ··Blur:·noop,
gurudevi-mobile:lint:biome:        18 │ + ··Shadow:·noop,
gurudevi-mobile:lint:biome:        19 │ + ··Image:·noop,
gurudevi-mobile:lint:biome:        20 │ + ··Text:·noop,
gurudevi-mobile:lint:biome:        21 │ + ··useImage:·jest.fn(()·=>·null),
gurudevi-mobile:lint:biome:        22 │ + ··useFont:·jest.fn(()·=>·null),

gurudevi-mobile:lint:biome:        23 │ + ··useCanvasRef:·jest.fn(()·=>·({·current:·null·})),
gurudevi-mobile:lint:biome:        24 │ + ··useTouchHandler:·jest.fn(()·=>·jest.fn()),
gurudevi-mobile:lint:biome:        25 │ + ··Skia:·{·Paint:·jest.fn(),·Path:·jest.fn()·},
gurudevi-mobile:lint:biome:        26 │ + };
gurudevi-mobile:lint:biome:     27 27 │   
gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: __mocks__\EnvironmentContext.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:      1    │ - //·Manual·mock·for·EnvironmentContext··provides·a·working·context·without·native·deps.␍

gurudevi-mobile:lint:biome:      2    │ - const·React·=·require("react");␍
gurudevi-mobile:lint:biome:      3    │ - ␍

@repo/people:lint:biome: src\components\TeacherAdminPortalModal.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/people:lint:biome:      1    │ - import·SanctuaryModal·from·"@repo/ui/components/SanctuaryModal";␍
@repo/people:lint:biome:      2    │ - import·{·Box,·ScrollView,·Text·}·from·"@repo/ui/primitives";␍
@repo/people:lint:biome:      3    │ - ␍
@repo/people:lint:biome:      4    │ - import·TeacherAdminWidget·from·"./TeacherAdminWidget";␍
@repo/people:lint:biome:      5    │ - ␍
@repo/people:lint:biome:      6    │ - interface·TeacherAdminPortalModalProps·{␍
@repo/people:lint:biome:      7    │ - → visible:·boolean;␍
@repo/people:lint:biome:      8    │ - → onClose:·()·=>·void;␍

@repo/people:lint:biome:      9    │ - → onAction?:·(action:·string)·=>·void;␍
@repo/people:lint:biome:     10    │ - → title?:·string;␍
@repo/people:lint:biome:     11    │ - }␍
@repo/people:lint:biome:     12    │ - ␍
@repo/people:lint:biome:     13    │ - /**␍
@repo/people:lint:biome:     14    │ - ·*·TEACHER·ADMIN·PORTAL·MODAL␍
@repo/people:lint:biome:     15    │ - ·*·Sanctuary·V3·standard·for·full-screen·administrative·access.␍
@repo/people:lint:biome:     16    │ - ·*·Features·premium·glassmorphism·and·standardized·Sanctuary·primitives.␍
@repo/people:lint:biome:     17    │ - ·*/␍

@repo/people:lint:biome:     18    │ - export·default·function·TeacherAdminPortalModal({␍
@repo/people:lint:biome:     19    │ - → visible,␍
@repo/people:lint:biome:     20    │ - → onClose,␍
@repo/people:lint:biome:     21    │ - → onAction,␍
@repo/people:lint:biome:     22    │ - → title·=·"Administrative·Portal",␍
@repo/people:lint:biome:     23    │ - }:·TeacherAdminPortalModalProps)·{␍
@repo/people:lint:biome:     24    │ - → return·(␍
@repo/people:lint:biome:     25    │ - → → <SanctuaryModal␍

@repo/people:lint:biome:     26    │ - → → → isOpen={visible}␍
@repo/people:lint:biome:     27    │ - → → → onClose={onClose}␍
@repo/people:lint:biome:     28    │ - → → → title={title}␍
@repo/people:lint:biome:     29    │ - → → → subtitle="SOVEREIGN·MANAGEMENT"␍
@repo/people:lint:biome:     30    │ - → → >␍
@repo/people:lint:biome:     31    │ - → → → <Box·className="flex-1">␍
@repo/people:lint:biome:     32    │ - → → → → <ScrollView␍
@repo/people:lint:biome:     33    │ - → → → → → showsVerticalScrollIndicator={false}␍

@repo/people:lint:biome:     34    │ - → → → → → contentContainerStyle={{·padding:·0,·paddingBottom:·60·}}␍
@repo/people:lint:biome:     35    │ - → → → → >␍
@repo/people:lint:biome:     36    │ - → → → → → <TeacherAdminWidget·onAction={onAction}·/>␍

@repo/people:lint:biome:     37    │ - ␍
@repo/people:lint:biome:     38    │ - → → → → → <Box·className="mt-12·p-6·bg-phase-surface/30·rounded-[32px]·border·border-phase-surface/50">␍
@repo/people:lint:biome:     39    │ - → → → → → → <Text·className="text-xs·text-phase-text-tertiary·leading-5·font-medium·italic·text-center">␍

@repo/people:lint:biome:     40    │ - → → → → → → → This·portal·is·secured·by·the·Gurudevi·Sanctuary·Governance␍

@repo/people:lint:biome:     41    │ - → → → → → → → protocols.·All·administrative·actions·are·logged·in·the·sovereign␍
@intuitui-labs/lk-edu-geo:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.

@repo/people:lint:biome:     42    │ - → → → → → → → record.␍
@repo/people:lint:biome:     43    │ - → → → → → → </Text>␍
@intuitui-labs/lk-edu-geo:lint:biome: Diagnostics not shown: 18.

@intuitui-labs/lk-edu-geo:lint:biome: Checked 19 files in 514ms. No fixes applied.
@repo/people:lint:biome:     44    │ - → → → → → </Box>␍

@repo/people:lint:biome:     45    │ - → → → → </ScrollView>␍
@repo/people:lint:biome:     46    │ - → → → </Box>␍
@repo/people:lint:biome:     47    │ - → → </SanctuaryModal>␍

@intuitui-labs/lk-edu-geo:lint:biome: Found 21 errors.
@intuitui-labs/lk-edu-geo:lint:biome: Found 15 warnings.
@intuitui-labs/lk-edu-geo:lint:biome: Found 2 infos.

@intuitui-labs/lk-edu-geo:lint:biome:     118     │ - → gender:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     119     │ - → postal_code:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     120     │ - → address:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     121     │ - → location:·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     122     │ - → → province_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     123     │ - → → district_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     124     │ - → → postal_unit_id?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     125     │ - → → ds_division_id?:·string;·//·Linked·by·P-Code·mapping·in·Phase·4␍
@intuitui-labs/lk-edu-geo:lint:biome:     126     │ - → → gn_division_id?:·string;·//·Linked·by·P-Code·mapping·in·Phase·4␍
@intuitui-labs/lk-edu-geo:lint:biome:     127     │ - → };␍
@intuitui-labs/lk-edu-geo:lint:biome:     128     │ - → jurisdiction:·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     129     │ - → → zone_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     130     │ - → → division_id:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     131     │ - → };␍
@intuitui-labs/lk-edu-geo:lint:biome:     132     │ - → contact?:·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     133     │ - → → tel?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     134     │ - → → email?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     135     │ - → };␍
@intuitui-labs/lk-edu-geo:lint:biome:     136     │ - → medium?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     137     │ - → grade_span?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     138     │ - → status?:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:     139     │ - → religion?:·string;␍
@repo/profile:lint:biome:     2 │ import { handleAPIError, type Capacity, usePermissions, useAuth } from '@repo/core/logic';
apps-edlove-web:lint:biome:        35 │ + ··loader:·glob({·base:·'./src/content/sri-lanka',·pattern:·'**/*.{md,mdx}'·}),
gurudevi-mobile:lint:biome:      4    │ - const·defaultEnv·=·{␍

@repo/people:lint:biome:     48    │ - → );␍

@repo/profile:lint:biome:     3 │ import {

@repo/profile:lint:biome:   
@repo/profile:lint:biome:   i Safe fix: Organize Imports (Biome)
@repo/profile:lint:biome:   
@repo/profile:lint:biome:       1   1 │   import { profileAPI } from '@repo/core/api';␍
@repo/profile:lint:biome:       2     │ - import·{·handleAPIError,·type·Capacity,·usePermissions,·useAuth·}·from·'@repo/core/logic';␍
@repo/profile:lint:biome:           2 │ + import·{·type·Capacity,·handleAPIError,·useAuth,·usePermissions·}·from·'@repo/core/logic';␍

@repo/profile:lint:biome:       3   3 │   import {␍
@repo/profile:lint:biome:       4   4 │     Box,␍
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

@intuitui-labs/lk-edu-geo:lint:biome:     140     │ - → website?:·string;␍

apps-edlove-web:lint:biome:        36 │ + ··schema:·z.object({
@intuitui-labs/lk-edu-geo:lint:biome:     141     │ - → socio_economic_tier?:·string;␍

@intuitui-labs/lk-edu-geo:lint:biome:     142     │ - → total_students?:·number;␍
@intuitui-labs/lk-edu-geo:lint:biome:     143     │ - → students_boys?:·number;␍
@intuitui-labs/lk-edu-geo:lint:biome:     144     │ - → students_girls?:·number;␍
@intuitui-labs/lk-edu-geo:lint:biome:     145     │ - → total_teachers?:·number;␍

@intuitui-labs/lk-edu-geo:lint:biome:     146     │ - → difficulty_level?:·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     147     │ - → properties?:·Record<string,·any>;␍

@intuitui-labs/lk-edu-geo:lint:biome:     148     │ - }␍
@intuitui-labs/lk-edu-geo:lint:biome:     149     │ - ␍
@intuitui-labs/lk-edu-geo:lint:biome:     150     │ - /**␍
@intuitui-labs/lk-edu-geo:lint:biome:   185 more lines truncated

@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: src\types\modules.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Formatter would have printed the following content:
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     1   │ - declare·module·"srilankan-postalcode-backend"·{␍

@intuitui-labs/lk-edu-geo:lint:biome:     2   │ - → export·function·citiesByDistrict(␍
@intuitui-labs/lk-edu-geo:lint:biome:     3   │ - → → district:·string,␍
@intuitui-labs/lk-edu-geo:lint:biome:     4   │ - → ):·{·city:·string;·code:·string·}[];␍
@intuitui-labs/lk-edu-geo:lint:biome:     5   │ - → export·function·getAllCities():·{·city:·string;·code:·string·}[];␍
@intuitui-labs/lk-edu-geo:lint:biome:     6   │ - → export·function·getCode(city:·string):·string;␍
@intuitui-labs/lk-edu-geo:lint:biome:     7   │ - }␍
@intuitui-labs/lk-edu-geo:lint:biome:       1 │ + declare·module·'srilankan-postalcode-backend'·{
@intuitui-labs/lk-edu-geo:lint:biome:       2 │ + ··export·function·citiesByDistrict(district:·string):·{·city:·string;·code:·string·}[];
@intuitui-labs/lk-edu-geo:lint:biome:       3 │ + ··export·function·getAllCities():·{·city:·string;·code:·string·}[];

@intuitui-labs/lk-edu-geo:lint:biome:       4 │ + ··export·function·getCode(city:·string):·string;
@intuitui-labs/lk-edu-geo:lint:biome:       5 │ + }
apps-edlove-web:lint:biome:        37 │ + ····title:·z.string(),
@repo/people:lint:biome:     49    │ - }␍
@repo/people:lint:biome:         1 │ + import·SanctuaryModal·from·'@repo/ui/components/SanctuaryModal';
@repo/people:lint:biome:         2 │ + import·{·Box,·ScrollView,·Text·}·from·'@repo/ui/primitives';
@repo/people:lint:biome:         3 │ + 
@repo/people:lint:biome:         4 │ + import·TeacherAdminWidget·from·'./TeacherAdminWidget';
@repo/people:lint:biome:         5 │ + 
@repo/people:lint:biome:         6 │ + interface·TeacherAdminPortalModalProps·{
@repo/people:lint:biome:         7 │ + ··visible:·boolean;
@repo/people:lint:biome:         8 │ + ··onClose:·()·=>·void;

@repo/people:lint:biome:         9 │ + ··onAction?:·(action:·string)·=>·void;
@repo/people:lint:biome:        10 │ + ··title?:·string;
apps-edlove-web:lint:biome:        38 │ + ····subtitle:·z.string(),

@intuitui-labs/lk-edu-geo:lint:biome:     8 6 │   
@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome:      5    │ - → theme:·"light",␍
gurudevi-mobile:lint:biome:      6    │ - → isDark:·false,␍
apps-edlove-web:lint:biome:        39 │ + ····icon:·z.string(),
@repo/people:lint:biome:        11 │ + }

gurudevi-mobile:lint:biome:      7    │ - → colors:·{␍
apps-edlove-web:lint:biome:        40 │ + ····category:·z.enum(['schooling',·'tuition',·'discrepancy']).optional(),

apps-edlove-web:lint:biome:        41 │ + ····order:·z.number().default(0),
apps-edlove-web:lint:biome:        42 │ + ····draft:·z.boolean().default(false),
apps-edlove-web:lint:biome:        43 │ + ··}),
apps-edlove-web:lint:biome:        44 │ + });
apps-edlove-web:lint:biome:        45 │ + 
apps-edlove-web:lint:biome:        46 │ + const·community·=·defineCollection({
apps-edlove-web:lint:biome:        47 │ + ··loader:·glob({·base:·'./src/content/community',·pattern:·'**/*.{md,mdx}'·}),
apps-edlove-web:lint:biome:        48 │ + ··schema:·z.object({
apps-edlove-web:lint:biome:        49 │ + ····title:·z.string(),
apps-edlove-web:lint:biome:        50 │ + ····subtitle:·z.string(),
apps-edlove-web:lint:biome:        51 │ + ····icon:·z.string(),
apps-edlove-web:lint:biome:        52 │ + ····order:·z.number().default(0),
apps-edlove-web:lint:biome:        53 │ + ····draft:·z.boolean().default(false),
apps-edlove-web:lint:biome:        54 │ + ··}),
apps-edlove-web:lint:biome:        55 │ + });
apps-edlove-web:lint:biome:        56 │ + 
apps-edlove-web:lint:biome:        57 │ + const·gurudevi·=·defineCollection({

@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:   × Formatter would have printed the following content:
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:      1    │ - {␍
@intuitui-labs/lk-edu-geo:lint:biome:      2    │ - ··"extends":·"../../packages/typescript-config/base.json",␍
@intuitui-labs/lk-edu-geo:lint:biome:      3    │ - → "compilerOptions":·{

@intuitui-labs/lk-edu-geo:lint:biome:      4    │ - → → "target":·"ESNext",

@intuitui-labs/lk-edu-geo:lint:biome:      5    │ - → → "module":·"ESNext",

@intuitui-labs/lk-edu-geo:lint:biome:      6    │ - → → "moduleResolution":·"node",
@intuitui-labs/lk-edu-geo:lint:biome:      7    │ - → → "types":·["node"],

@repo/people:lint:biome:        12 │ + 
gurudevi-mobile:lint:biome:      8    │ - → → background:·"#fff",␍

apps-edlove-web:lint:biome:        58 │ + ··loader:·glob({·base:·'./src/content/gurudevi',·pattern:·'**/*.{md,mdx}'·}),
@repo/payments:lint:biome:        15 │ + ··type:·'card'·|·'bank_account'·|·'wallet'·|·'qr';
@repo/profile:lint:biome:      1    │ - import·type·{·ProfileStats,·User·}·from·'@repo/core/types';␍
@repo/admin:lint:biome:   × Formatter would have printed the following content:
@repo/admin:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:      8    │ - → → "baseUrl":·".",
@intuitui-labs/lk-edu-geo:lint:biome:      9    │ - → → "paths":·{␍
@intuitui-labs/lk-edu-geo:lint:biome:     10    │ - → → → "@repo/core":·["../core/src"],␍

@intuitui-labs/lk-edu-geo:lint:biome:     11    │ - → → → "@repo/core/*":·["../core/src/*"]␍
gurudevi-mobile:lint:biome:      9    │ - → → surface:·"#f8f8f8",␍
gurudevi-mobile:lint:biome:     10    │ - → → surfaceElevated:·"#f0f0f0",␍

@intuitui-labs/lk-edu-geo:lint:biome:     12    │ - → → },␍
apps-edlove-web:lint:biome:        59 │ + ··schema:·z.object({
gurudevi-mobile:lint:biome:     11    │ - → → text:·"#1a1a1a",␍
gurudevi-mobile:lint:biome:     12    │ - → → textSecondary:·"#666",␍
gurudevi-mobile:lint:biome:     13    │ - → → textTertiary:·"#999",␍
gurudevi-mobile:lint:biome:     14    │ - → → primary:·"#D4AF37",␍

@intuitui-labs/lk-edu-geo:lint:biome:     13    │ - → → "resolveJsonModule":·true,␍
@intuitui-labs/lk-edu-geo:lint:biome:     14    │ - → → "allowImportingTsExtensions":·true,␍
@intuitui-labs/lk-edu-geo:lint:biome:     15    │ - → → "noEmit":·true,␍
@intuitui-labs/lk-edu-geo:lint:biome:     16    │ - → → "esModuleInterop":·true,␍
@intuitui-labs/lk-edu-geo:lint:biome:     17    │ - → → "forceConsistentCasingInFileNames":·true,␍

@intuitui-labs/lk-edu-geo:lint:biome:     18    │ - → → "strict":·true,␍
@intuitui-labs/lk-edu-geo:lint:biome:     19    │ - → → "skipLibCheck":·true␍
@intuitui-labs/lk-edu-geo:lint:biome:     20    │ - → },␍
@intuitui-labs/lk-edu-geo:lint:biome:     21    │ - → "include":·["src/**/*",·"scripts/**/*"]␍
@intuitui-labs/lk-edu-geo:lint:biome:     22    │ - }␍
@intuitui-labs/lk-edu-geo:lint:biome:         1 │ + {
@intuitui-labs/lk-edu-geo:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
@intuitui-labs/lk-edu-geo:lint:biome:         3 │ + ··"compilerOptions":·{

@intuitui-labs/lk-edu-geo:lint:biome:         4 │ + ····"target":·"ESNext",
@intuitui-labs/lk-edu-geo:lint:biome:         5 │ + ····"module":·"ESNext",

@intuitui-labs/lk-edu-geo:lint:biome:         6 │ + ····"moduleResolution":·"node",
@intuitui-labs/lk-edu-geo:lint:biome:         7 │ + ····"types":·["node"],
@intuitui-labs/lk-edu-geo:lint:biome:         8 │ + ····"baseUrl":·".",
@intuitui-labs/lk-edu-geo:lint:biome:         9 │ + ····"paths":·{
@intuitui-labs/lk-edu-geo:lint:biome:        10 │ + ······"@repo/core":·["../core/src"],
@intuitui-labs/lk-edu-geo:lint:biome:        11 │ + ······"@repo/core/*":·["../core/src/*"]

@repo/people:lint:biome:        13 │ + /**
apps-edlove-web:lint:biome:        60 │ + ····title:·z.string(),

gurudevi-mobile:lint:biome:     15    │ - → → action:·"#D4AF37",␍
gurudevi-mobile:lint:biome:     16    │ - → → border:·"#eee",␍

gurudevi-mobile:lint:biome:     17    │ - → → error:·"#ff4444",␍
gurudevi-mobile:lint:biome:     18    │ - → },␍
gurudevi-mobile:lint:biome:     19    │ - → temporalPhase:·"morning",␍
gurudevi-mobile:lint:biome:     20    │ - → deviceTier:·"standard",␍
gurudevi-mobile:lint:biome:     21    │ - → networkQuality:·"good",␍

gurudevi-mobile:lint:biome:     22    │ - → isOnline:·true,␍
gurudevi-mobile:lint:biome:     23    │ - → language:·"en",␍

@intuitui-labs/lk-edu-geo:lint:biome:        12 │ + ····},
@intuitui-labs/lk-edu-geo:lint:biome:        13 │ + ····"resolveJsonModule":·true,
@intuitui-labs/lk-edu-geo:lint:biome:        14 │ + ····"allowImportingTsExtensions":·true,

@intuitui-labs/lk-edu-geo:lint:biome:        15 │ + ····"noEmit":·true,
@intuitui-labs/lk-edu-geo:lint:biome:        16 │ + ····"esModuleInterop":·true,
@intuitui-labs/lk-edu-geo:lint:biome:        17 │ + ····"forceConsistentCasingInFileNames":·true,
@intuitui-labs/lk-edu-geo:lint:biome:        18 │ + ····"strict":·true,
@intuitui-labs/lk-edu-geo:lint:biome:        19 │ + ····"skipLibCheck":·true
@intuitui-labs/lk-edu-geo:lint:biome:        20 │ + ··},
@intuitui-labs/lk-edu-geo:lint:biome:        21 │ + ··"include":·["src/**/*",·"scripts/**/*"]
@intuitui-labs/lk-edu-geo:lint:biome:        22 │ + }
@intuitui-labs/lk-edu-geo:lint:biome:     23 23 │   
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 

@repo/people:lint:biome:        14 │ + ·*·TEACHER·ADMIN·PORTAL·MODAL

apps-edlove-web:lint:biome:        61 │ + ····subtitle:·z.string(),

gurudevi-mobile:lint:biome:     24    │ - };␍
gurudevi-mobile:lint:biome:     25    │ - ␍
gurudevi-mobile:lint:biome:     26    │ - const·EnvironmentContext·=·React.createContext(defaultEnv);␍
gurudevi-mobile:lint:biome:     27    │ - ␍
gurudevi-mobile:lint:biome:     28    │ - function·EnvironmentProvider({·children·})·{␍

gurudevi-mobile:lint:biome:     29    │ - → return·React.createElement(␍
gurudevi-mobile:lint:biome:     30    │ - → → EnvironmentContext.Provider,␍
gurudevi-mobile:lint:biome:     31    │ - → → {·value:·defaultEnv·},␍
gurudevi-mobile:lint:biome:     32    │ - → → children,␍
gurudevi-mobile:lint:biome:     33    │ - → );␍
gurudevi-mobile:lint:biome:     34    │ - }␍
gurudevi-mobile:lint:biome:     35    │ - ␍
gurudevi-mobile:lint:biome:     36    │ - function·useEnvironment()·{␍

gurudevi-mobile:lint:biome:     37    │ - → return·React.useContext(EnvironmentContext);␍
gurudevi-mobile:lint:biome:     38    │ - }␍
gurudevi-mobile:lint:biome:     39    │ - ␍
gurudevi-mobile:lint:biome:     40    │ - function·getTemporalPhase()·{␍
gurudevi-mobile:lint:biome:     41    │ - → return·"morning";␍
gurudevi-mobile:lint:biome:     42    │ - }␍
gurudevi-mobile:lint:biome:     43    │ - function·shouldUseDarkTheme()·{␍
gurudevi-mobile:lint:biome:     44    │ - → return·false;␍
gurudevi-mobile:lint:biome:     45    │ - }␍

gurudevi-mobile:lint:biome:     46    │ - ␍

@intuitui-labs/lk-edu-geo:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Some errors were emitted while running checks.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@repo/people:lint:biome:        15 │ + ·*·Sanctuary·V3·standard·for·full-screen·administrative·access.
apps-edlove-web:lint:biome:        62 │ + ····icon:·z.string(),

apps-edlove-web:lint:biome:        63 │ + ····order:·z.number().default(0),

@repo/people:lint:biome:        16 │ + ·*·Features·premium·glassmorphism·and·standardized·Sanctuary·primitives.

@repo/people:lint:biome:        17 │ + ·*/

gurudevi-mobile:lint:biome:     47    │ - module.exports·=·{␍

gurudevi-mobile:lint:biome:     48    │ - → EnvironmentContext,␍
gurudevi-mobile:lint:biome:     49    │ - → EnvironmentProvider,␍
gurudevi-mobile:lint:biome:     50    │ - → useEnvironment,␍
gurudevi-mobile:lint:biome:     51    │ - → getTemporalPhase,␍

gurudevi-mobile:lint:biome:     52    │ - → shouldUseDarkTheme,␍
gurudevi-mobile:lint:biome:     53    │ - };␍
gurudevi-mobile:lint:biome:         1 │ + //·Manual·mock·for·EnvironmentContext··provides·a·working·context·without·native·deps.
gurudevi-mobile:lint:biome:         2 │ + const·React·=·require('react');
gurudevi-mobile:lint:biome:         3 │ + 
gurudevi-mobile:lint:biome:         4 │ + const·defaultEnv·=·{
gurudevi-mobile:lint:biome:         5 │ + ··theme:·'light',
gurudevi-mobile:lint:biome:         6 │ + ··isDark:·false,
gurudevi-mobile:lint:biome:         7 │ + ··colors:·{
gurudevi-mobile:lint:biome:         8 │ + ····background:·'#fff',
gurudevi-mobile:lint:biome:         9 │ + ····surface:·'#f8f8f8',
gurudevi-mobile:lint:biome:        10 │ + ····surfaceElevated:·'#f0f0f0',
gurudevi-mobile:lint:biome:        11 │ + ····text:·'#1a1a1a',

gurudevi-mobile:lint:biome:        12 │ + ····textSecondary:·'#666',

gurudevi-mobile:lint:biome:        13 │ + ····textTertiary:·'#999',

gurudevi-mobile:lint:biome:        14 │ + ····primary:·'#D4AF37',

gurudevi-mobile:lint:biome:        15 │ + ····action:·'#D4AF37',

gurudevi-mobile:lint:biome:        16 │ + ····border:·'#eee',

gurudevi-mobile:lint:biome:        17 │ + ····error:·'#ff4444',

gurudevi-mobile:lint:biome:        18 │ + ··},

gurudevi-mobile:lint:biome:        19 │ + ··temporalPhase:·'morning',

gurudevi-mobile:lint:biome:        20 │ + ··deviceTier:·'standard',

gurudevi-mobile:lint:biome:        21 │ + ··networkQuality:·'good',

gurudevi-mobile:lint:biome:        22 │ + ··isOnline:·true,

gurudevi-mobile:lint:biome:        23 │ + ··language:·'en',

gurudevi-mobile:lint:biome:        24 │ + };

gurudevi-mobile:lint:biome:        25 │ + 
gurudevi-mobile:lint:biome:        26 │ + const·EnvironmentContext·=·React.createContext(defaultEnv);
gurudevi-mobile:lint:biome:        27 │ + 
gurudevi-mobile:lint:biome:        28 │ + function·EnvironmentProvider({·children·})·{
gurudevi-mobile:lint:biome:        29 │ + ··return·React.createElement(EnvironmentContext.Provider,·{·value:·defaultEnv·},·children);

gurudevi-mobile:lint:biome:        30 │ + }
gurudevi-mobile:lint:biome:        31 │ + 
gurudevi-mobile:lint:biome:        32 │ + function·useEnvironment()·{
gurudevi-mobile:lint:biome:        33 │ + ··return·React.useContext(EnvironmentContext);
gurudevi-mobile:lint:biome:        34 │ + }
gurudevi-mobile:lint:biome:        35 │ + 
gurudevi-mobile:lint:biome:        36 │ + function·getTemporalPhase()·{
gurudevi-mobile:lint:biome:        37 │ + ··return·'morning';

gurudevi-mobile:lint:biome:        38 │ + }
gurudevi-mobile:lint:biome:        39 │ + function·shouldUseDarkTheme()·{
gurudevi-mobile:lint:biome:        40 │ + ··return·false;
gurudevi-mobile:lint:biome:        41 │ + }
gurudevi-mobile:lint:biome:        42 │ + 
gurudevi-mobile:lint:biome:        43 │ + module.exports·=·{

gurudevi-mobile:lint:biome:        44 │ + ··EnvironmentContext,
gurudevi-mobile:lint:biome:        45 │ + ··EnvironmentProvider,
gurudevi-mobile:lint:biome:        46 │ + ··useEnvironment,
gurudevi-mobile:lint:biome:        47 │ + ··getTemporalPhase,
gurudevi-mobile:lint:biome:        48 │ + ··shouldUseDarkTheme,
gurudevi-mobile:lint:biome:        49 │ + };

gurudevi-mobile:lint:biome:     54 50 │   
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: __mocks__\expo-camera.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   

@repo/people:lint:biome:        18 │ + export·default·function·TeacherAdminPortalModal({
@repo/people:lint:biome:        19 │ + ··visible,
@repo/people:lint:biome:        20 │ + ··onClose,
@repo/people:lint:biome:        21 │ + ··onAction,

@repo/people:lint:biome:        22 │ + ··title·=·'Administrative·Portal',
@repo/people:lint:biome:        23 │ + }:·TeacherAdminPortalModalProps)·{
@repo/people:lint:biome:        24 │ + ··return·(
@repo/people:lint:biome:        25 │ + ····<SanctuaryModal
@repo/people:lint:biome:        26 │ + ······isOpen={visible}
@repo/people:lint:biome:        27 │ + ······onClose={onClose}
@repo/people:lint:biome:        28 │ + ······title={title}

@repo/people:lint:biome:        29 │ + ······subtitle="SOVEREIGN·MANAGEMENT"
@repo/people:lint:biome:        30 │ + ····>
@repo/people:lint:biome:        31 │ + ······<Box·className="flex-1">
@repo/people:lint:biome:        32 │ + ········<ScrollView
@repo/people:lint:biome:        33 │ + ··········showsVerticalScrollIndicator={false}

@repo/people:lint:biome:        34 │ + ··········contentContainerStyle={{·padding:·0,·paddingBottom:·60·}}
@repo/people:lint:biome:        35 │ + ········>
@repo/people:lint:biome:        36 │ + ··········<TeacherAdminWidget·onAction={onAction}·/>
@repo/people:lint:biome:        37 │ + 

@repo/people:lint:biome:        38 │ + ··········<Box·className="mt-12·p-6·bg-phase-surface/30·rounded-[32px]·border·border-phase-surface/50">
@repo/people:lint:biome:        39 │ + ············<Text·className="text-xs·text-phase-text-tertiary·leading-5·font-medium·italic·text-center">
@repo/people:lint:biome:        40 │ + ··············This·portal·is·secured·by·the·Gurudevi·Sanctuary·Governance·protocols.·All

@repo/people:lint:biome:        41 │ + ··············administrative·actions·are·logged·in·the·sovereign·record.
@repo/people:lint:biome:        42 │ + ············</Text>
@repo/people:lint:biome:        43 │ + ··········</Box>
@repo/people:lint:biome:        44 │ + ········</ScrollView>
@repo/people:lint:biome:        45 │ + ······</Box>
@repo/people:lint:biome:        46 │ + ····</SanctuaryModal>
@repo/people:lint:biome:        47 │ + ··);
@repo/people:lint:biome:        48 │ + }
@repo/people:lint:biome:     50 49 │   
@repo/people:lint:biome:   
@repo/people:lint:biome: 

@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx:127:19 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/people:lint:biome:   
@repo/people:lint:biome:     125 │ 			<VStack className="gap-2">
@repo/people:lint:biome:     126 │ 				{rows.map((row, rowIndex) => (
@repo/people:lint:biome:   > 127 │ 					<HStack key={rowIndex} className="gap-2">
@repo/people:lint:biome:         │ 					             ^^^^^^^^
@repo/people:lint:biome:     128 │ 						{row.map((action, actionIndex) => (
@repo/people:lint:biome:     129 │ 							<AdminAction
@repo/people:lint:biome:   
@repo/people:lint:biome:   i This is the source of the key value.
@repo/people:lint:biome:   
@repo/people:lint:biome:     124 │ 			</HStack>
@repo/people:lint:biome:     125 │ 			<VStack className="gap-2">
@repo/people:lint:biome:   > 126 │ 				{rows.map((row, rowIndex) => (
@repo/people:lint:biome:         │ 				                ^^^^^^^^
@repo/people:lint:biome:     127 │ 					<HStack key={rowIndex} className="gap-2">
@repo/people:lint:biome:     128 │ 						{row.map((action, actionIndex) => (
@repo/people:lint:biome:   
@repo/people:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/people:lint:biome:   
@repo/people:lint:biome:   i Check the React documentation. 
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx:130:14 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/people:lint:biome:   
@repo/people:lint:biome:     128 │ 						{row.map((action, actionIndex) => (
@repo/people:lint:biome:     129 │ 							<AdminAction
@repo/people:lint:biome:   > 130 │ 								key={actionIndex}
@repo/people:lint:biome:         │ 								     ^^^^^^^^^^^
@repo/people:lint:biome:     131 │ 								icon={action.icon}
@repo/people:lint:biome:     132 │ 								label={action.label}
@repo/people:lint:biome:   
@repo/people:lint:biome:   i This is the source of the key value.
@repo/people:lint:biome:   
@repo/people:lint:biome:     126 │ 				{rows.map((row, rowIndex) => (
@repo/people:lint:biome:     127 │ 					<HStack key={rowIndex} className="gap-2">
@repo/people:lint:biome:   > 128 │ 						{row.map((action, actionIndex) => (
@repo/people:lint:biome:         │ 						                  ^^^^^^^^^^^

@repo/people:lint:biome:     129 │ 							<AdminAction
@repo/people:lint:biome:     130 │ 								key={actionIndex}
@repo/people:lint:biome:   
@repo/people:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/people:lint:biome:   
@repo/people:lint:biome:   i Check the React documentation. 
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

apps-edlove-web:lint:biome:        64 │ + ····draft:·z.boolean().default(false),

apps-edlove-web:lint:biome:   23 more lines truncated
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

@repo/payments:lint:biome: Checked 10 files in 552ms. No fixes applied.
@repo/payments:lint:biome: Found 9 errors.
@repo/payments:lint:biome: Found 5 warnings.

@repo/payments:lint:biome:        16 │ + ··provider:·string;
@repo/payments:lint:biome:        17 │ + ··lastFour?:·string;

@repo/payments:lint:biome:        18 │ + ··expiry?:·string;
@repo/payments:lint:biome:        19 │ + ··isDefault:·boolean;
@repo/payments:lint:biome:        20 │ + ··metadata?:·Record<string,·any>;
@repo/payments:lint:biome:        21 │ + }
@repo/payments:lint:biome:        22 │ + 
@repo/payments:lint:biome:        23 │ + export·interface·PaymentProvider·{
@repo/payments:lint:biome:        24 │ + ··id:·string;
@repo/payments:lint:biome:        25 │ + ··name:·string;
@repo/payments:lint:biome:        26 │ + ··initializePayment(amount:·number,·currency:·string,·metadata?:·any):·Promise<PaymentIntent>;
@repo/payments:lint:biome:        27 │ + ··verifyPayment(paymentIntentId:·string):·Promise<PaymentStatus>;
@repo/payments:lint:biome:        28 │ + ··getFeeEstimate(amount:·number):·number;

@repo/payments:lint:biome:        29 │ + }
@repo/payments:lint:biome:     39 30 │   
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Formatter would have printed the following content:

@repo/payments:lint:biome:   
@repo/payments:lint:biome:      1    │ - {␍
@repo/payments:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
@repo/payments:lint:biome:      3    │ - → "compilerOptions":·{␍
@repo/payments:lint:biome:      4    │ - → → "outDir":·"dist",␍
@repo/payments:lint:biome:      5    │ - → → "rootDir":·"src",␍
@repo/payments:lint:biome:      6    │ - → → "baseUrl":·".",␍

@repo/payments:lint:biome:      7    │ - → → "jsx":·"react-native",␍
@repo/payments:lint:biome:      8    │ - → → "esModuleInterop":·true,␍
@repo/payments:lint:biome:      9    │ - → → "skipLibCheck":·true,␍
@repo/payments:lint:biome:     10    │ - → → "paths":·{␍
@repo/payments:lint:biome:     11    │ - → → → "@/*":·["src/*"]␍
@repo/payments:lint:biome:     12    │ - → → },␍

@repo/payments:lint:biome:     13    │ - → → "types":·["node"]␍
@repo/payments:lint:biome:     14    │ - → },␍

@repo/payments:lint:biome:     15    │ - → "include":·["src/**/*"],␍
@repo/payments:lint:biome:     16    │ - → "exclude":·["node_modules",·"dist"]␍
@repo/payments:lint:biome:     17    │ - }␍
@repo/payments:lint:biome:         1 │ + {
@repo/payments:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",

@repo/payments:lint:biome:         3 │ + ··"compilerOptions":·{
@repo/payments:lint:biome:         4 │ + ····"outDir":·"dist",
@repo/payments:lint:biome:         5 │ + ····"rootDir":·"src",
@repo/payments:lint:biome:         6 │ + ····"baseUrl":·".",
@repo/payments:lint:biome:         7 │ + ····"jsx":·"react-native",
@repo/payments:lint:biome:         8 │ + ····"esModuleInterop":·true,
@repo/payments:lint:biome:         9 │ + ····"skipLibCheck":·true,
@repo/payments:lint:biome:        10 │ + ····"paths":·{

@repo/payments:lint:biome:        11 │ + ······"@/*":·["src/*"]
@repo/payments:lint:biome:        12 │ + ····},
@repo/payments:lint:biome:        13 │ + ····"types":·["node"]
@repo/payments:lint:biome:        14 │ + ··},
@repo/payments:lint:biome:        15 │ + ··"include":·["src/**/*"],
@repo/payments:lint:biome:        16 │ + ··"exclude":·["node_modules",·"dist"]
@repo/payments:lint:biome:        17 │ + }
@repo/payments:lint:biome:     18 18 │   

@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/payments:lint:biome: 
@repo/payments:lint:biome:   × Some errors were emitted while running checks.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 

gurudevi-mobile:lint:biome:      1    │ - //·Manual·mock·for·expo-camera·to·prevent·Worker·errors·in·tests␍

apps-edlove-web:lint:biome: svelte.config.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     1   │ - import·{·vitePreprocess·}·from·"@astrojs/svelte";␍

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

gurudevi-mobile:lint:biome:      2    │ - module.exports·=·{␍

gurudevi-mobile:lint:biome:      3    │ - → CameraView:·"CameraView",␍

@repo/people:lint:biome:   × Formatter would have printed the following content:

@repo/people:lint:biome:   

gurudevi-mobile:lint:biome:      4    │ - → CameraType:·{␍

gurudevi-mobile:lint:biome:      5    │ - → → back:·"back",␍

gurudevi-mobile:lint:biome:      6    │ - → → front:·"front",␍

apps-edlove-web:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
apps-edlove-web:lint:biome: Diagnostics not shown: 110.
apps-edlove-web:lint:biome: Checked 46 files in 561ms. No fixes applied.
apps-edlove-web:lint:biome: Found 36 errors.
apps-edlove-web:lint:biome: Found 93 warnings.
apps-edlove-web:lint:biome: Found 1 info.

@repo/people:lint:biome:       1     │ - import·{·usePermissions·}·from·"@repo/core/logic";␍
@repo/people:lint:biome:       2     │ - import·{␍
@repo/people:lint:biome:       3     │ - → Box,␍
@repo/people:lint:biome:       4     │ - → HStack,␍
@repo/people:lint:biome:       5     │ - → Icon,␍
@repo/people:lint:biome:       6     │ - → Pressable,␍
@repo/people:lint:biome:       7     │ - → Text,␍
@repo/people:lint:biome:       8     │ - → VStack,␍
@repo/people:lint:biome:       9     │ - }·from·"@repo/ui/primitives";␍
@repo/people:lint:biome:      10     │ - import·{·hapticLight·}·from·"@repo/ui/utils/haptics";␍
@repo/people:lint:biome:      11     │ - ␍

@repo/people:lint:biome:      12     │ - import·{␍
@repo/people:lint:biome:      13     │ - → ArrowRightLeft,␍

apps-edlove-web:lint:biome:     2   │ - ␍
apps-edlove-web:lint:biome:     3   │ - export·default·{␍
apps-edlove-web:lint:biome:     4   │ - → preprocess:·vitePreprocess(),␍

apps-edlove-web:lint:biome:     5   │ - };␍
apps-edlove-web:lint:biome:       1 │ + import·{·vitePreprocess·}·from·'@astrojs/svelte';
apps-edlove-web:lint:biome:       2 │ + 
apps-edlove-web:lint:biome:       3 │ + export·default·{
apps-edlove-web:lint:biome:       4 │ + ··preprocess:·vitePreprocess(),
apps-edlove-web:lint:biome:       5 │ + };
apps-edlove-web:lint:biome:     6 6 │   
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
@repo/profile:lint:biome:         4 │ + export·type·UserProfile·=·User;
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
@repo/profile:lint:biome:         5 │ + 
apps-edlove-web:lint:biome:   

@repo/profile:lint:biome:         6 │ + /**
apps-edlove-web:lint:biome:      1    │ - {␍
@repo/profile:lint:biome:         7 │ + ·*·OrientationSeeds·is·now·part·of·the·core·User·type.

apps-edlove-web:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
@repo/profile:lint:biome:         8 │ + ·*·We·re-export·it·here·for·compatibility·during·migration.
apps-edlove-web:lint:biome:      3    │ - → "compilerOptions":·{␍
@repo/profile:lint:biome:         9 │ + ·*/
apps-edlove-web:lint:biome:      4    │ - → → "baseUrl":·".",␍
@repo/profile:lint:biome:        10 │ + export·type·OrientationSeeds·=·Required<User>['orientation_seeds'];

apps-edlove-web:lint:biome:      5    │ - → → "paths":·{␍
apps-edlove-web:lint:biome:      6    │ - → → → "@/*":·["./src/*"],␍
@repo/profile:lint:biome:     11 11 │   
apps-edlove-web:lint:biome:      7    │ - → → → "@/types":·["./src/types"],␍
@repo/profile:lint:biome:   
apps-edlove-web:lint:biome:      8    │ - → → → "@/constants/*":·["./src/constants/*"],␍

@repo/profile:lint:biome: 
apps-edlove-web:lint:biome:      9    │ - → → → "@/components/*":·["./src/components/*"],␍
@repo/profile:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome:     10    │ - → → → "@/lib/*":·["./src/lib/*"],␍
@repo/profile:lint:biome: 
apps-edlove-web:lint:biome:     11    │ - → → → "@/utils/*":·["./src/utils/*"]␍
apps-edlove-web:lint:biome:     12    │ - → → }␍

apps-edlove-web:lint:biome:     13    │ - → },␍
apps-edlove-web:lint:biome:     14    │ - → "include":·[".astro/types.d.ts",·"**/*"],␍
apps-edlove-web:lint:biome:     15    │ - → "exclude":·["dist"]␍
apps-edlove-web:lint:biome:     16    │ - }␍
apps-edlove-web:lint:biome:         1 │ + {
apps-edlove-web:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
apps-edlove-web:lint:biome:         3 │ + ··"compilerOptions":·{

apps-edlove-web:lint:biome:         4 │ + ····"baseUrl":·".",
apps-edlove-web:lint:biome:         5 │ + ····"paths":·{
apps-edlove-web:lint:biome:         6 │ + ······"@/*":·["./src/*"],
apps-edlove-web:lint:biome:         7 │ + ······"@/types":·["./src/types"],
apps-edlove-web:lint:biome:         8 │ + ······"@/constants/*":·["./src/constants/*"],
apps-edlove-web:lint:biome:         9 │ + ······"@/components/*":·["./src/components/*"],
apps-edlove-web:lint:biome:        10 │ + ······"@/lib/*":·["./src/lib/*"],

apps-edlove-web:lint:biome:        11 │ + ······"@/utils/*":·["./src/utils/*"]
apps-edlove-web:lint:biome:        12 │ + ····}
apps-edlove-web:lint:biome:        13 │ + ··},
apps-edlove-web:lint:biome:        14 │ + ··"include":·[".astro/types.d.ts",·"**/*"],
apps-edlove-web:lint:biome:        15 │ + ··"exclude":·["dist"]
apps-edlove-web:lint:biome:        16 │ + }
apps-edlove-web:lint:biome:     17 17 │   
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: vercel.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome:      7    │ - → },␍
gurudevi-mobile:lint:biome:      8    │ - → useCameraPermissions:·()·=>·[␍
gurudevi-mobile:lint:biome:      9    │ - → → {␍
gurudevi-mobile:lint:biome:     10    │ - → → → granted:·true,␍
apps-edlove-web:lint:biome: 
gurudevi-mobile:lint:biome:     11    │ - → → → canAskAgain:·true,␍

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:     12    │ - → → → status:·"granted",␍
apps-edlove-web:lint:biome:   
gurudevi-mobile:lint:biome:     13    │ - → → → expires:·"never",␍
apps-edlove-web:lint:biome:     1   │ - {␍
gurudevi-mobile:lint:biome:     14    │ - → → },␍
apps-edlove-web:lint:biome:     2   │ - → "framework":·null,␍

gurudevi-mobile:lint:biome:     15    │ - → → jest.fn(),·//·Request·permission·function␍
apps-edlove-web:lint:biome:     3   │ - → "outputDirectory":·"dist"␍
gurudevi-mobile:lint:biome:     16    │ - → ],␍
apps-edlove-web:lint:biome:     4   │ - }␍
gurudevi-mobile:lint:biome:     17    │ - };␍
apps-edlove-web:lint:biome:       1 │ + {
gurudevi-mobile:lint:biome:         1 │ + //·Manual·mock·for·expo-camera·to·prevent·Worker·errors·in·tests
apps-edlove-web:lint:biome:       2 │ + ··"framework":·null,

gurudevi-mobile:lint:biome:         2 │ + module.exports·=·{
apps-edlove-web:lint:biome:       3 │ + ··"outputDirectory":·"dist"
gurudevi-mobile:lint:biome:         3 │ + ··CameraView:·'CameraView',
apps-edlove-web:lint:biome:       4 │ + }
apps-edlove-web:lint:biome:     5 5 │   
gurudevi-mobile:lint:biome:         4 │ + ··CameraType:·{

gurudevi-mobile:lint:biome:         5 │ + ····back:·'back',
apps-edlove-web:lint:biome:   
gurudevi-mobile:lint:biome:         6 │ + ····front:·'front',
apps-edlove-web:lint:biome: 
gurudevi-mobile:lint:biome:         7 │ + ··},
gurudevi-mobile:lint:biome:         8 │ + ··useCameraPermissions:·()·=>·[

gurudevi-mobile:lint:biome:         9 │ + ····{
gurudevi-mobile:lint:biome:        10 │ + ······granted:·true,
gurudevi-mobile:lint:biome:        11 │ + ······canAskAgain:·true,
gurudevi-mobile:lint:biome:        12 │ + ······status:·'granted',
gurudevi-mobile:lint:biome:        13 │ + ······expires:·'never',
gurudevi-mobile:lint:biome:        14 │ + ····},

gurudevi-mobile:lint:biome:        15 │ + ····jest.fn(),·//·Request·permission·function
gurudevi-mobile:lint:biome:        16 │ + ··],
gurudevi-mobile:lint:biome:        17 │ + };
gurudevi-mobile:lint:biome:     18 18 │   
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: __mocks__\expo-image-picker.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome:      1    │ - //·Manual·mock·for·expo-image-picker␍
gurudevi-mobile:lint:biome:      2    │ - module.exports·=·{␍
gurudevi-mobile:lint:biome:      3    │ - → launchImageLibraryAsync:·jest.fn(()·=>␍
gurudevi-mobile:lint:biome:      4    │ - → → Promise.resolve({␍

gurudevi-mobile:lint:biome:      5    │ - → → → canceled:·false,␍
gurudevi-mobile:lint:biome:      6    │ - → → → assets:·[␍
gurudevi-mobile:lint:biome:      7    │ - → → → → {␍
gurudevi-mobile:lint:biome:      8    │ - → → → → → uri:·"mock-image-uri",␍
gurudevi-mobile:lint:biome:      9    │ - → → → → → width:·100,␍
gurudevi-mobile:lint:biome:     10    │ - → → → → → height:·100,␍
gurudevi-mobile:lint:biome:     11    │ - → → → → },␍
gurudevi-mobile:lint:biome:     12    │ - → → → ],␍
gurudevi-mobile:lint:biome:     13    │ - → → }),␍
gurudevi-mobile:lint:biome:     14    │ - → ),␍
gurudevi-mobile:lint:biome:     15    │ - → launchCameraAsync:·jest.fn(()·=>␍
gurudevi-mobile:lint:biome:     16    │ - → → Promise.resolve({␍
gurudevi-mobile:lint:biome:     17    │ - → → → canceled:·false,␍

gurudevi-mobile:lint:biome:     18    │ - → → → assets:·[␍
gurudevi-mobile:lint:biome:     19    │ - → → → → {␍
gurudevi-mobile:lint:biome:     20    │ - → → → → → uri:·"mock-camera-uri",␍
gurudevi-mobile:lint:biome:     21    │ - → → → → → width:·100,␍
gurudevi-mobile:lint:biome:     22    │ - → → → → → height:·100,␍
gurudevi-mobile:lint:biome:     23    │ - → → → → },␍
gurudevi-mobile:lint:biome:     24    │ - → → → ],␍
gurudevi-mobile:lint:biome:     25    │ - → → }),␍

gurudevi-mobile:lint:biome:     26    │ - → ),␍
gurudevi-mobile:lint:biome:     27    │ - → MediaTypeOptions:·{␍
gurudevi-mobile:lint:biome:     28    │ - → → All:·"All",␍
gurudevi-mobile:lint:biome:     29    │ - → → Videos:·"Videos",␍
gurudevi-mobile:lint:biome:     30    │ - → → Images:·"Images",␍
gurudevi-mobile:lint:biome:     31    │ - → },␍
gurudevi-mobile:lint:biome:     32    │ - → requestMediaLibraryPermissionsAsync:·jest.fn(()·=>␍
gurudevi-mobile:lint:biome:     33    │ - → → Promise.resolve({␍

gurudevi-mobile:lint:biome:     34    │ - → → → granted:·true,␍
gurudevi-mobile:lint:biome:     35    │ - → → → canAskAgain:·true,␍
gurudevi-mobile:lint:biome:     36    │ - → → → status:·"granted",␍
gurudevi-mobile:lint:biome:     37    │ - → → }),␍
gurudevi-mobile:lint:biome:     38    │ - → ),␍
gurudevi-mobile:lint:biome:     39    │ - → requestCameraPermissionsAsync:·jest.fn(()·=>␍
gurudevi-mobile:lint:biome:     40    │ - → → Promise.resolve({␍
gurudevi-mobile:lint:biome:     41    │ - → → → granted:·true,␍
gurudevi-mobile:lint:biome:     42    │ - → → → canAskAgain:·true,␍

gurudevi-mobile:lint:biome:     43    │ - → → → status:·"granted",␍
gurudevi-mobile:lint:biome:     44    │ - → → }),␍
gurudevi-mobile:lint:biome:     45    │ - → ),␍
gurudevi-mobile:lint:biome:     46    │ - };␍
gurudevi-mobile:lint:biome:         1 │ + //·Manual·mock·for·expo-image-picker
gurudevi-mobile:lint:biome:         2 │ + module.exports·=·{
gurudevi-mobile:lint:biome:         3 │ + ··launchImageLibraryAsync:·jest.fn(()·=>
gurudevi-mobile:lint:biome:         4 │ + ····Promise.resolve({

gurudevi-mobile:lint:biome:         5 │ + ······canceled:·false,
gurudevi-mobile:lint:biome:         6 │ + ······assets:·[
gurudevi-mobile:lint:biome:         7 │ + ········{
gurudevi-mobile:lint:biome:         8 │ + ··········uri:·'mock-image-uri',
gurudevi-mobile:lint:biome:         9 │ + ··········width:·100,
gurudevi-mobile:lint:biome:        10 │ + ··········height:·100,
gurudevi-mobile:lint:biome:        11 │ + ········},
gurudevi-mobile:lint:biome:        12 │ + ······],
gurudevi-mobile:lint:biome:        13 │ + ····}),

gurudevi-mobile:lint:biome:        14 │ + ··),

@repo/people:lint:biome:      14     │ - → Calendar,␍

@repo/people:lint:biome:      15     │ - → CheckSquare,␍

@repo/profile:lint:biome:   × Formatter would have printed the following content:

@repo/profile:lint:biome:   

@repo/profile:lint:biome:      1    │ - {␍

@repo/profile:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍

@repo/profile:lint:biome:      3    │ - → "compilerOptions":·{␍

@repo/profile:lint:biome:      4    │ - → → "outDir":·"./dist",␍

@repo/profile:lint:biome:      5    │ - → → "rootDir":·"./src",␍

gurudevi-mobile:lint:biome:        15 │ + ··launchCameraAsync:·jest.fn(()·=>

gurudevi-mobile:lint:biome:        16 │ + ····Promise.resolve({

apps-edlove-web:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

@repo/library:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/people:lint:biome:      16     │ - → ClipboardList,␍

@repo/people:lint:biome:      17     │ - → DollarSign,␍

@repo/people:lint:biome:      18     │ - → FileText,␍

@repo/people:lint:biome:      19     │ - }·from·"lucide-react-native";␍

@repo/people:lint:biome:      20     │ - import·{·useTranslation·}·from·"react-i18next";␍

gurudevi-mobile:lint:biome:        17 │ + ······canceled:·false,

@repo/profile:lint:biome:      6    │ - → → "baseUrl":·".",␍

@repo/profile:lint:biome:      7    │ - → → "paths":·{␍

@repo/profile:lint:biome:      8    │ - → → → "@repo/profile/*":·["./src/*"]␍

@repo/profile:lint:biome:      9    │ - → → }␍

@repo/profile:lint:biome:     10    │ - → },␍

@repo/profile:lint:biome:     11    │ - → "include":·["src/**/*"]␍

@repo/profile:lint:biome:     12    │ - }␍

@repo/profile:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/profile:lint:biome: Diagnostics not shown: 100.
@repo/profile:lint:biome: Checked 51 files in 908ms. No fixes applied.

@repo/profile:lint:biome: Found 56 errors.
@repo/profile:lint:biome: Found 46 warnings.

@repo/profile:lint:biome: Found 18 infos.
@repo/profile:lint:biome:         1 │ + {
@repo/profile:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
@repo/profile:lint:biome:         3 │ + ··"compilerOptions":·{

@repo/profile:lint:biome:         4 │ + ····"outDir":·"./dist",
@repo/profile:lint:biome:         5 │ + ····"rootDir":·"./src",

@repo/profile:lint:biome:         6 │ + ····"baseUrl":·".",
@repo/profile:lint:biome:         7 │ + ····"paths":·{
@repo/profile:lint:biome:         8 │ + ······"@repo/profile/*":·["./src/*"]

@repo/profile:lint:biome:         9 │ + ····}
apps-edlove-web:lint:biome:   × Some errors were emitted while running checks.

@repo/profile:lint:biome:        10 │ + ··},
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

@repo/profile:lint:biome:        11 │ + ··"include":·["src/**/*"]
@repo/profile:lint:biome:        12 │ + }
@repo/profile:lint:biome:     13 13 │   
@repo/profile:lint:biome:   

@repo/profile:lint:biome: 

@repo/people:lint:biome:      21     │ - ␍

gurudevi-mobile:lint:biome:        18 │ + ······assets:·[

gurudevi-mobile:lint:biome:        19 │ + ········{

@repo/people:lint:biome:      22     │ - interface·TeacherAdminWidgetProps·{␍

@repo/profile:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/profile:lint:biome: 

gurudevi-mobile:lint:biome:        20 │ + ··········uri:·'mock-camera-uri',

apps-neevsk-web:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

gurudevi-mobile:lint:biome:        21 │ + ··········width:·100,

@repo/people:lint:biome:      23     │ - → onAction?:·(action:·string)·=>·void;␍
@repo/profile:lint:biome:   × Some errors were emitted while running checks.

@repo/profile:lint:biome:   
@repo/profile:lint:biome: 

@repo/people:lint:biome:      24     │ - }␍

@repo/people:lint:biome:      25     │ - ␍

@repo/people:lint:biome:      26     │ - export·default·function·TeacherAdminWidget({␍

@repo/people:lint:biome:      27     │ - → onAction,␍

@repo/people:lint:biome:      28     │ - }:·TeacherAdminWidgetProps)·{␍

@repo/people:lint:biome:      29     │ - → const·{·t·}·=·useTranslation();␍

@repo/people:lint:biome:      30     │ - → const·{·flags·}·=·usePermissions();␍

gurudevi-mobile:lint:biome:        22 │ + ··········height:·100,

@repo/people:lint:biome:      31     │ - ␍

gurudevi-mobile:lint:biome:        23 │ + ········},

gurudevi-mobile:lint:biome:        24 │ + ······],

@repo/people:lint:biome:      32     │ - → const·AdminAction·=·({␍

@repo/people:lint:biome:      33     │ - → → icon:·LucideIcon,␍
@repo/people:lint:biome:      34     │ - → → label,␍

gurudevi-mobile:lint:biome:        25 │ + ····}),
gurudevi-mobile:lint:biome:        26 │ + ··),
gurudevi-mobile:lint:biome:        27 │ + ··MediaTypeOptions:·{

gurudevi-mobile:lint:biome:        28 │ + ····All:·'All',

gurudevi-mobile:lint:biome:        29 │ + ····Videos:·'Videos',

@repo/admin:lint:biome:       1     │ - import·{␍

apps-gurudevi-marketing-web:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

gurudevi-mobile:lint:biome:        30 │ + ····Images:·'Images',
gurudevi-mobile:lint:biome:        31 │ + ··},

gurudevi-mobile:lint:biome:        32 │ + ··requestMediaLibraryPermissionsAsync:·jest.fn(()·=>

gurudevi-mobile:lint:biome:        33 │ + ····Promise.resolve({

@repo/admin:lint:biome:       2     │ - → afterEach,␍

@repo/admin:lint:biome:       3     │ - → beforeEach,␍

@repo/people:lint:biome:      35     │ - → → variant·=·"primary",␍

gurudevi-mobile:lint:biome:        34 │ + ······granted:·true,

gurudevi-mobile:lint:biome:        35 │ + ······canAskAgain:·true,

gurudevi-mobile:lint:biome:        36 │ + ······status:·'granted',

gurudevi-mobile:lint:biome:        37 │ + ····}),

gurudevi-mobile:lint:biome:        38 │ + ··),

gurudevi-mobile:lint:biome:        39 │ + ··requestCameraPermissionsAsync:·jest.fn(()·=>

gurudevi-mobile:lint:biome:        40 │ + ····Promise.resolve({

@repo/admin:lint:biome:       4     │ - → describe,␍

@repo/people:lint:biome:      36     │ - → → onPress,␍

gurudevi-mobile:lint:biome:        41 │ + ······granted:·true,

gurudevi-mobile:lint:biome:        42 │ + ······canAskAgain:·true,

gurudevi-mobile:lint:biome:        43 │ + ······status:·'granted',

@intuitui-labs/lk-edu-geo:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/admin:lint:biome:       5     │ - → expect,␍

@repo/admin:lint:biome:       6     │ - → it,␍

@repo/people:lint:biome:      37     │ - → }:·any)·=>·{␍

@repo/people:lint:biome:      38     │ - → → const·colorClasses·=·{␍

gurudevi-mobile:lint:biome:        44 │ + ····}),

@repo/admin:lint:biome:       7     │ - → jest,␍

@repo/admin:lint:biome:       8     │ - }·from·"@jest/globals";␍

@repo/people:lint:biome:      39     │ - → → → primary:␍

@repo/admin:lint:biome:       9     │ - import·{·multiTenantAnalyticsEngine·}·from·"../../analytics/engine";␍

@repo/admin:lint:biome:      10     │ - import·type·{␍

@repo/admin:lint:biome:      11     │ - → CustomReportConfig,␍

@repo/admin:lint:biome:      12     │ - → EducationSector,␍

gurudevi-mobile:lint:biome:        45 │ + ··),

gurudevi-mobile:lint:biome:        46 │ + };

@repo/payments:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

gurudevi-mobile:lint:biome:     47 47 │   

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome: 

@repo/people:lint:biome:      40     │ - → → → → "text-phase-interactive·bg-phase-interactive/5·border-phase-interactive/20",␍

@repo/people:lint:biome:      41     │ - → → → warning:·"text-phase-warning·bg-phase-warning/5·border-phase-warning/20",␍

@repo/people:lint:biome:      42     │ - → → → success:·"text-phase-success·bg-phase-success/5·border-phase-success/20",␍

@repo/people:lint:biome:      43     │ - → → → error:·"text-phase-error·bg-phase-error/5·border-phase-error/20",␍

@repo/people:lint:biome:      44     │ - → → };␍

@repo/people:lint:biome:      45     │ - ␍

@repo/people:lint:biome:      46     │ - → → const·activeColor·=␍

@repo/people:lint:biome:      47     │ - → → → colorClasses[variant·as·keyof·typeof·colorClasses]·||␍

@repo/people:lint:biome:      48     │ - → → → colorClasses.primary;␍

@repo/people:lint:biome:      49     │ - → → const·[textColor,·bgColor,·borderColor]·=·activeColor.split("·");␍

@repo/people:lint:biome:      50     │ - ␍

@repo/admin:lint:biome:      13     │ - → MetricDefinition,␍

gurudevi-mobile:lint:biome: __mocks__\gluestack-themed.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 

@repo/people:lint:biome:      51     │ - → → return·(␍

gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   

@repo/admin:lint:biome:      14     │ - }·from·"../../analytics/types";␍

@repo/admin:lint:biome:      15     │ - ␍

@repo/admin:lint:biome:      16     │ - //·Mock·Supabase␍

@repo/people:lint:biome:      52     │ - → → → <Pressable␍

@repo/admin:lint:biome:      17     │ - jest.mock("@repo/core/api",·()·=>·({␍

gurudevi-mobile:lint:biome:       1     │ - //·Manual·mock·for·@gluestack-ui/themed·and·all·its·build/components/*·sub-paths.␍

gurudevi-mobile:lint:biome:       2     │ - //␍

@repo/admin:lint:biome:      18     │ - → supabase:·{␍

@repo/admin:lint:biome:      19     │ - → → from:·jest.fn(()·=>·({␍

@repo/admin:lint:biome:      20     │ - → → → select:·jest.fn(()·=>·({␍

@repo/admin:lint:biome:      21     │ - → → → → eq:·jest.fn(()·=>·({␍

@repo/admin:lint:biome:      22     │ - → → → → → gte:·jest.fn(()·=>·({␍

@repo/people:lint:biome:      53     │ - → → → → onPress={()·=>·{␍

@repo/people:lint:biome:      54     │ - → → → → → hapticLight();␍

@repo/people:lint:biome:      55     │ - → → → → → if·(onPress)·onPress();␍
@repo/people:lint:biome:      56     │ - → → → → → if·(onAction)·onAction(label);␍

@repo/people:lint:biome:      57     │ - → → → → }}␍
gurudevi-mobile:lint:biome:       3     │ - //·Use·HOST·STRING·TYPES·('View',·'Text',·etc.)·instead·of·ReactNative.*·components.␍

gurudevi-mobile:lint:biome:       4     │ - //␍

gurudevi-mobile:lint:biome:       5     │ - //·Why:·@testing-library/react-native·v14·uses·test-renderer@0.14.0,·a·custom·React␍
gurudevi-mobile:lint:biome:       6     │ - //·reconciler.·When·jest-expo/web·maps·react-native·\u2192·react-native-web,·any·call·to␍
gurudevi-mobile:lint:biome:       7     │ - //·ReactNative.View·renders·through·react-native-web's·function·chain,·eventually␍

gurudevi-mobile:lint:biome:       8     │ - //·producing·a·DOM·'div'·host·element.·The·test-renderer·then·sees·'div'·as·the·parent␍

@repo/admin:lint:biome:      23     │ - → → → → → → lt:·jest.fn(()·=>·({␍

@repo/people:lint:biome:      58     │ - → → → → className={`flex-1·bg-phase-canvas·p-4·rounded-3xl·border·${borderColor}·items-center·justify-center·gap-3·min-h-[110px]·shadow-sm`}␍
@repo/people:lint:biome:      59     │ - → → → >␍
@repo/people:lint:biome:      60     │ - → → → → <Box·className={`p-3·rounded-2xl·${bgColor}`}>␍
@repo/people:lint:biome:      61     │ - → → → → → <Icon·as={LucideIcon}·size="md"·className={textColor}·/>␍

@repo/people:lint:biome:      62     │ - → → → → </Box>␍

@repo/admin:lint:biome:      24     │ - → → → → → → → single:·jest.fn(()·=>·Promise.resolve({·data:·{},·error:·null·})),␍

@repo/people:lint:biome:      63     │ - → → → → <Text·className="text-[12px]·font-bold·text-center·text-phase-text-primary·uppercase·tracking-tight">␍

gurudevi-mobile:lint:biome:       9     │ - //·of·text·strings,·violating·its·"text·must·be·inside·a·Text·host"·invariant␍

@repo/admin:lint:biome:      25     │ - → → → → → → })),␍

@repo/admin:lint:biome:      26     │ - → → → → → })),␍

@repo/people:lint:biome:      64     │ - → → → → → {label}␍

@repo/people:lint:biome:      65     │ - → → → → </Text>␍

gurudevi-mobile:lint:biome:      10     │ - //·(textComponentTypes·=·['Text',·'RCTText']).␍

gurudevi-mobile:lint:biome:      11     │ - //␍

@repo/people:lint:biome:      66     │ - → → → </Pressable>␍

@repo/admin:lint:biome:      27     │ - → → → → })),␍

gurudevi-mobile:lint:biome:      12     │ - //·By·using·literal·strings·'View'·and·'Text',·the·test-renderer·treats·them·as·opaque␍

gurudevi-mobile:lint:biome:      13     │ - //·host·elements·it·manages·directly\u2014no·react-native-web·translation·happens.␍

@repo/people:lint:biome:      67     │ - → → );␍

apps-edlove-web:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/admin:lint:biome:      28     │ - → → → })),␍

@repo/admin:lint:biome:      29     │ - → → → order:·jest.fn(()·=>·Promise.resolve({·data:·[],·error:·null·})),␍

@repo/admin:lint:biome:      30     │ - → → → insert:·jest.fn(()·=>·Promise.resolve({·data:·{},·error:·null·})),␍

@repo/people:lint:biome:      68     │ - → };␍

@repo/people:lint:biome:      69     │ - ␍

gurudevi-mobile:lint:biome:      14     │ - const·React·=·require("react");␍

gurudevi-mobile:lint:biome:      15     │ - ␍

@repo/admin:lint:biome:      31     │ - → → })),␍

@repo/admin:lint:biome:      32     │ - → },␍

@repo/admin:lint:biome:      33     │ - }));␍

@repo/admin:lint:biome:      34     │ - describe("MultiTenantAnalyticsEngine",·()·=>·{␍

@repo/admin:lint:biome:      35     │ - → beforeEach(()·=>·{␍

@repo/admin:lint:biome:      36     │ - → → jest.clearAllMocks();␍

@repo/admin:lint:biome:      37     │ - → });␍

@repo/admin:lint:biome:      38     │ - → afterEach(()·=>·{␍

@repo/admin:lint:biome:      39     │ - → → jest.restoreAllMocks();␍

@repo/admin:lint:biome:      40     │ - → });␍

@repo/admin:lint:biome:      41     │ - → describe("Data·Aggregation",·()·=>·{␍

gurudevi-mobile:lint:biome:      16     │ - //·Host·element·helpers·\u2014·testID·flows·through·for·getAllByTestId·/·getByTestId·queries␍

@repo/people:lint:biome:      70     │ - → //·Define·actions·with·their·visibility·conditions␍

@repo/people:lint:biome:      71     │ - → const·actions·=·[␍

@repo/people:lint:biome:      72     │ - → → {␍

gurudevi-mobile:lint:biome:      17     │ - const·mkView·=␍

gurudevi-mobile:lint:biome:      18     │ - → (extraProps)·=>␍

@repo/profile:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/people:lint:biome:      73     │ - → → → icon:·Calendar,␍

@repo/people:lint:biome:      74     │ - → → → label:·t("teacher.admin.myLeaves")·||·"My·Leaves",␍

@repo/people:lint:biome:      75     │ - → → → variant:·"warning",␍

gurudevi-mobile:lint:biome:      19     │ - → ({·children,·...props·})·=>␍

@repo/people:lint:biome:      76     │ - → → → visible:·flags.isStaffManagementEnabled,␍

@repo/people:lint:biome:      77     │ - → → },␍

@repo/people:lint:biome:      78     │ - → → {␍

gurudevi-mobile:lint:biome:      20     │ - → → React.createElement("View",·{·...props,·...(extraProps·||·{})·},·children);␍

@repo/admin:lint:biome:      42     │ - → → it("should·aggregate·tenant·metrics·correctly",·async·()·=>·{␍

@repo/people:lint:biome:      79     │ - → → → icon:·ArrowRightLeft,␍

@repo/people:lint:biome:      80     │ - → → → label:·t("teacher.admin.substitutions")·||·"Substitutions",␍

gurudevi-mobile:lint:biome:      21     │ - ␍

@repo/admin:lint:biome:      43     │ - → → → const·tenantIds·=·["tenant-1",·"tenant-2"];␍

@repo/admin:lint:biome:      44     │ - → → → const·timeRange·=·{␍

@repo/admin:lint:biome:      45     │ - → → → → startDate:·"2024-01-01",␍

@repo/admin:lint:biome:      46     │ - → → → → endDate:·"2024-03-31",␍

@repo/admin:lint:biome:      47     │ - → → → };␍

@repo/people:lint:biome:      81     │ - → → → variant:·"primary",␍

@repo/admin:lint:biome:      48     │ - → → → const·result·=·await·multiTenantAnalyticsEngine.aggregateTenantMetrics(␍

@repo/admin:lint:biome:      49     │ - → → → → tenantIds,␍

@repo/admin:lint:biome:      50     │ - → → → → timeRange,␍

@repo/admin:lint:biome:      51     │ - → → → );␍

@repo/admin:lint:biome:      52     │ - → → → expect(result).toHaveLength(2);␍

gurudevi-mobile:lint:biome:      22     │ - const·mkText·=␍

gurudevi-mobile:lint:biome:      23     │ - → ()·=>␍

@repo/people:lint:biome:      82     │ - → → → visible:·flags.isStaffManagementEnabled,␍

@repo/admin:lint:biome:      53     │ - → → → expect(result[0]!).toHaveProperty("tenantId");␍

@repo/admin:lint:biome:      54     │ - → → → expect(result[0]!).toHaveProperty("metrics");␍

@repo/admin:lint:biome:      55     │ - → → → expect(result[0]!).toHaveProperty("period");␍

@repo/admin:lint:biome:      56     │ - → → });␍

@repo/people:lint:biome:      83     │ - → → },␍

@repo/people:lint:biome:      84     │ - → → {␍

@repo/people:lint:biome:      85     │ - → → → icon:·FileText,␍

@repo/admin:lint:biome:      57     │ - → → it("should·calculate·tenant·metrics·with·proper·structure",·async·()·=>·{␍

@repo/admin:lint:biome:      58     │ - → → → const·tenantIds·=·["tenant-1"];␍
@repo/admin:lint:biome:      59     │ - → → → const·timeRange·=·{␍
@repo/admin:lint:biome:      60     │ - → → → → startDate:·"2024-01-01",␍

@repo/admin:lint:biome:      61     │ - → → → → endDate:·"2024-03-31",␍
@repo/admin:lint:biome:      62     │ - → → → };␍
@repo/admin:lint:biome:      63     │ - → → → const·result·=·await·multiTenantAnalyticsEngine.aggregateTenantMetrics(␍
@repo/admin:lint:biome:      64     │ - → → → → tenantIds,␍
@repo/admin:lint:biome:      65     │ - → → → → timeRange,␍
@repo/admin:lint:biome:      66     │ - → → → );␍
@repo/admin:lint:biome:      67     │ - → → → const·metrics·=·result[0]!.metrics;␍
@repo/admin:lint:biome:      68     │ - → → → expect(metrics).toHaveProperty("attendance_rate");␍
@repo/admin:lint:biome:      69     │ - → → → expect(metrics).toHaveProperty("grade_average");␍

@repo/admin:lint:biome:      70     │ - → → → expect(metrics).toHaveProperty("enrollment_count");␍

@repo/admin:lint:biome:      71     │ - → → → expect(typeof·metrics.attendance_rate).toBe("number");␍

gurudevi-mobile:lint:biome:      24     │ - → ({·children,·...props·})·=>␍

@repo/people:lint:biome:      86     │ - → → → label:·t("teacher.admin.reportGen")·||·"Student·Reports",␍

@repo/people:lint:biome:      87     │ - → → → variant:·"success",␍

@repo/people:lint:biome:      88     │ - → → → visible:·flags.isStudentReportingEnabled,␍

@repo/people:lint:biome:      89     │ - → → },␍

@repo/people:lint:biome:      90     │ - → → {␍

@repo/people:lint:biome:      91     │ - → → → icon:·ClipboardList,␍

@repo/people:lint:biome:      92     │ - → → → label:·t("teacher.admin.templates")·||·"Letter·Templates",␍

@repo/people:lint:biome:      93     │ - → → → variant:·"error",␍

@repo/people:lint:biome:      94     │ - → → → visible:·flags.isTemplateManagementEnabled,␍

@repo/people:lint:biome:      95     │ - → → },␍

@repo/people:lint:biome:      96     │ - → → {␍

@repo/people:lint:biome:      97     │ - → → → icon:·DollarSign,␍

@repo/people:lint:biome:      98     │ - → → → label:·t("teacher.admin.financials")·||·"Financials",␍

@repo/people:lint:biome:      99     │ - → → → variant:·"success",␍

@repo/admin:lint:biome:      72     │ - → → });␍

gurudevi-mobile:lint:biome:      25     │ - → → React.createElement("Text",·props,·children);␍

gurudevi-mobile:lint:biome:      26     │ - ␍

gurudevi-mobile:lint:biome:      27     │ - const·noop·=·()·=>·null;␍

gurudevi-mobile:lint:biome:      28     │ - ␍

gurudevi-mobile:lint:biome:      29     │ - const·View·=·mkView();␍

gurudevi-mobile:lint:biome:      30     │ - const·Text·=·mkText();␍

@repo/people:lint:biome:     100     │ - → → → visible:·flags.isAccountingEnabled,␍

@repo/people:lint:biome:     101     │ - → → },␍

@repo/admin:lint:biome:      73     │ - → });␍

@repo/admin:lint:biome:      74     │ - → describe("Tenant·Comparison",·()·=>·{␍

@repo/admin:lint:biome:      75     │ - → → it("should·compare·tenant·performance·across·metrics",·async·()·=>·{␍

gurudevi-mobile:lint:biome:      31     │ - const·TextInput·=·({·testID,·...p·})·=>␍

@repo/admin:lint:biome:      76     │ - → → → const·tenantIds·=·["tenant-1",·"tenant-2",·"tenant-3"];␍

@repo/people:lint:biome:     102     │ - → → {␍

gurudevi-mobile:lint:biome:      32     │ - → React.createElement("TextInput",·{·testID,·...p·});␍

gurudevi-mobile:lint:biome:      33     │ - ␍

@repo/people:lint:biome:     103     │ - → → → icon:·CheckSquare,␍

@repo/people:lint:biome:     104     │ - → → → label:·t("teacher.admin.approvals")·||·"Approvals",␍

@repo/people:lint:biome:     105     │ - → → → variant:·"error",␍

@repo/people:lint:biome:     106     │ - → → → visible:·flags.isStaffManagementEnabled,␍

@repo/admin:lint:biome:      77     │ - → → → const·metrics·=·["attendance_rate",·"grade_average"];␍

@repo/people:lint:biome:     107     │ - → → },␍

@repo/people:lint:biome:     108     │ - → ].filter((action)·=>·action.visible);␍

gurudevi-mobile:lint:biome:      34     │ - module.exports·=·{␍

@repo/admin:lint:biome:      78     │ - → → → const·industry·=·"elementary";␍

@repo/people:lint:biome:     109     │ - ␍

@repo/people:lint:biome:     110     │ - → //·Group·actions·into·rows·of·2␍
@repo/people:lint:biome:     111     │ - → const·rows·=·[];␍
@repo/people:lint:biome:     112     │ - → for·(let·i·=·0;·i·<·actions.length;·i·+=·2)·{␍
@repo/people:lint:biome:     113     │ - → → rows.push(actions.slice(i,·i·+·2));␍
@repo/people:lint:biome:     114     │ - → }␍
@repo/people:lint:biome:     115     │ - ␍
@repo/people:lint:biome:     116     │ - → if·(actions.length·===·0)·return·null;␍
@repo/people:lint:biome:     117     │ - ␍
@repo/people:lint:biome:     118     │ - → return·(␍

@repo/people:lint:biome:     119     │ - → → <VStack·className="gap-6·mt-4·px-1">␍
@repo/people:lint:biome:     120     │ - → → → <HStack·className="justify-between·items-center">␍
@repo/people:lint:biome:     121     │ - → → → → <Text·className="text-[11px]·font-black·uppercase·tracking-[2px]·text-phase-text-tertiary">␍
gurudevi-mobile:lint:biome:      35     │ - → //·Layout␍
gurudevi-mobile:lint:biome:      36     │ - → Box:·View,␍
gurudevi-mobile:lint:biome:      37     │ - → Center:·View,␍
gurudevi-mobile:lint:biome:      38     │ - → HStack:·View,␍
gurudevi-mobile:lint:biome:      39     │ - → VStack:·View,␍
gurudevi-mobile:lint:biome:      40     │ - → View,␍
gurudevi-mobile:lint:biome:      41     │ - → Divider:·View,␍
gurudevi-mobile:lint:biome:      42     │ - → ScrollView:·View,␍
gurudevi-mobile:lint:biome:      43     │ - → FlatList:·View,␍
gurudevi-mobile:lint:biome:      44     │ - → SectionList:·View,␍
gurudevi-mobile:lint:biome:      45     │ - → //·Typography␍
gurudevi-mobile:lint:biome:      46     │ - → Text,␍

@repo/admin:lint:biome:      79     │ - → → → const·result·=·await·multiTenantAnalyticsEngine.compareTenantPerformance(␍

gurudevi-mobile:lint:biome:      47     │ - → Heading:·Text,␍

gurudevi-mobile:lint:biome:      48     │ - → Badge:·Text,␍

gurudevi-mobile:lint:biome:      49     │ - → BadgeText:·Text,␍

@repo/people:lint:biome:     122     │ - → → → → → {t("teacher.admin.title")·||·"Administrative·Portal"}␍

gurudevi-mobile:lint:biome:      50     │ - → //·Interactive␍

@repo/people:lint:biome:     123     │ - → → → → </Text>␍

@repo/people:lint:biome:     124     │ - → → → </HStack>␍

@repo/people:lint:biome:     125     │ - → → → <VStack·className="gap-2">␍

@repo/admin:lint:biome:      80     │ - → → → → tenantIds,␍

@repo/people:lint:biome:     126     │ - → → → → {rows.map((row,·rowIndex)·=>·(␍

@repo/people:lint:biome:     127     │ - → → → → → <HStack·key={rowIndex}·className="gap-2">␍

@repo/people:lint:biome:     128     │ - → → → → → → {row.map((action,·actionIndex)·=>·(␍

@repo/people:lint:biome:     129     │ - → → → → → → → <AdminAction␍

gurudevi-mobile:lint:biome:      51     │ - → Button:·View,␍

@repo/admin:lint:biome:      81     │ - → → → → metrics·as·MetricDefinition[],␍

@repo/admin:lint:biome:      82     │ - → → → → industry·as·EducationSector,␍

@repo/admin:lint:biome:      83     │ - → → → );␍

@repo/people:lint:biome:     130     │ - → → → → → → → → key={actionIndex}␍

gurudevi-mobile:lint:biome:      52     │ - → ButtonText:·Text,␍

@repo/people:lint:biome:     131     │ - → → → → → → → → icon={action.icon}␍

gurudevi-mobile:lint:biome:      53     │ - → ButtonIcon:·noop,␍

gurudevi-mobile:lint:biome:      54     │ - → Pressable:·View,␍

gurudevi-mobile:lint:biome:      55     │ - → Icon:·noop,␍

gurudevi-mobile:lint:biome:      56     │ - → //·Form␍

gurudevi-mobile:lint:biome:      57     │ - → Input:·View,␍

@repo/admin:lint:biome:      84     │ - → → → expect(result).toHaveLength(2);·//·One·comparison·per·metric␍

@repo/admin:lint:biome:      85     │ - → → → expect(result[0]!).toHaveProperty("metric");␍

@repo/people:lint:biome:     132     │ - → → → → → → → → label={action.label}␍

@repo/people:lint:biome:     133     │ - → → → → → → → → variant={action.variant}␍

gurudevi-mobile:lint:biome:      58     │ - → InputField:·TextInput,␍

@repo/people:lint:biome:     134     │ - → → → → → → → />␍

@repo/people:lint:biome:     135     │ - → → → → → → ))}␍

@repo/people:lint:biome:     136     │ - → → → → → → {/*·Fill·space·if·only·one·item·in·row·*/}␍

@repo/admin:lint:biome:      86     │ - → → → expect(result[0]!).toHaveProperty("tenants");␍

@repo/admin:lint:biome:      87     │ - → → → expect(result[0]!.tenants).toHaveLength(3);␍

@repo/admin:lint:biome:      88     │ - → → });␍

@repo/people:lint:biome:     137     │ - → → → → → → {row.length·===·1·&&·<Box·className="flex-1"·/>}␍

gurudevi-mobile:lint:biome:      59     │ - → Select:·View,␍

gurudevi-mobile:lint:biome:      60     │ - → SelectTrigger:·View,␍
gurudevi-mobile:lint:biome:      61     │ - → SelectInput:·View,␍
gurudevi-mobile:lint:biome:      62     │ - → SelectIcon:·noop,␍
gurudevi-mobile:lint:biome:      63     │ - → SelectPortal:·View,␍
gurudevi-mobile:lint:biome:      64     │ - → SelectBackdrop:·View,␍
gurudevi-mobile:lint:biome:      65     │ - → SelectContent:·View,␍
gurudevi-mobile:lint:biome:      66     │ - → SelectDragIndicatorWrapper:·View,␍
gurudevi-mobile:lint:biome:      67     │ - → SelectDragIndicator:·View,␍
gurudevi-mobile:lint:biome:      68     │ - → SelectItem:·View,␍
gurudevi-mobile:lint:biome:      69     │ - → Checkbox:·View,␍
gurudevi-mobile:lint:biome:      70     │ - → CheckboxIndicator:·View,␍

gurudevi-mobile:lint:biome:      71     │ - → CheckboxIcon:·noop,␍

gurudevi-mobile:lint:biome:      72     │ - → CheckboxLabel:·Text,␍

@repo/people:lint:biome:     138     │ - → → → → → </HStack>␍

@repo/admin:lint:biome:      89     │ - → → it("should·calculate·rankings·and·percentiles·correctly",·async·()·=>·{␍

gurudevi-mobile:lint:biome:      73     │ - → //·Feedback␍
gurudevi-mobile:lint:biome:      74     │ - → Spinner:·View,␍
gurudevi-mobile:lint:biome:      75     │ - → useToast:·()·=>·({·show:·jest.fn()·}),␍

gurudevi-mobile:lint:biome:      76     │ - → Toast:·View,␍
@repo/people:lint:biome:     139     │ - → → → → ))}␍
@repo/admin:lint:biome:      90     │ - → → → const·tenantIds·=·["tenant-1",·"tenant-2",·"tenant-3"];␍
@repo/people:lint:biome:     140     │ - → → → </VStack>␍

@repo/admin:lint:biome:      91     │ - → → → const·metrics·=·["attendance_rate"];␍
@repo/people:lint:biome:     141     │ - → → </VStack>␍
@repo/people:lint:biome:     142     │ - → );␍
@repo/people:lint:biome:     143     │ - }␍

gurudevi-mobile:lint:biome:      77     │ - → ToastTitle:·Text,␍
gurudevi-mobile:lint:biome:      78     │ - → ToastDescription:·Text,␍
gurudevi-mobile:lint:biome:      79     │ - → //·Provider␍

gurudevi-mobile:lint:biome:      80     │ - → GluestackUIProvider:·({·children·})·=>·children,␍

@repo/admin:lint:biome:      92     │ - → → → const·industry·=·"elementary";␍

@repo/admin:lint:biome:      93     │ - → → → const·result·=·await·multiTenantAnalyticsEngine.compareTenantPerformance(␍

@repo/admin:lint:biome:      94     │ - → → → → tenantIds,␍

gurudevi-mobile:lint:biome:      81     │ - → //·Icons␍

@repo/people:lint:biome:           1 │ + import·{·usePermissions·}·from·'@repo/core/logic';

@repo/admin:lint:biome:      95     │ - → → → → metrics·as·MetricDefinition[],␍

@repo/people:lint:biome:           2 │ + import·{·Box,·HStack,·Icon,·Pressable,·Text,·VStack·}·from·'@repo/ui/primitives';

@repo/admin:lint:biome:      96     │ - → → → → industry·as·EducationSector,␍

@repo/admin:lint:biome:      97     │ - → → → );␍

@repo/people:lint:biome:           3 │ + import·{·hapticLight·}·from·'@repo/ui/utils/haptics';

@repo/people:lint:biome:           4 │ + 

@repo/people:lint:biome:           5 │ + import·{

@repo/people:lint:biome:           6 │ + ··ArrowRightLeft,

@repo/people:lint:biome:           7 │ + ··Calendar,

gurudevi-mobile:lint:biome:      82     │ - → CheckIcon:·noop,␍
gurudevi-mobile:lint:biome:      83     │ - → ChevronDownIcon:·noop,␍
gurudevi-mobile:lint:biome:      84     │ - → CloseIcon:·noop,␍
gurudevi-mobile:lint:biome:      85     │ - → InfoIcon:·noop,␍
gurudevi-mobile:lint:biome:      86     │ - → //·Modal·/·Overlay␍
gurudevi-mobile:lint:biome:      87     │ - → Modal:·View,␍

@repo/people:lint:biome:   120 more lines truncated

@repo/people:lint:biome:   

@repo/people:lint:biome: 

@repo/people:lint:biome: src\components\TeacherEchoHistoryModal.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/people:lint:biome: 

@repo/admin:lint:biome:      98     │ - → → → const·comparison·=·result[0]!;␍

gurudevi-mobile:lint:biome:      88     │ - → ModalBackdrop:·View,␍
gurudevi-mobile:lint:biome:      89     │ - → ModalContent:·View,␍
gurudevi-mobile:lint:biome:      90     │ - → ModalHeader:·View,␍
gurudevi-mobile:lint:biome:      91     │ - → ModalBody:·View,␍
gurudevi-mobile:lint:biome:      92     │ - → ModalFooter:·View,␍
gurudevi-mobile:lint:biome:      93     │ - → ModalCloseButton:·View,␍
gurudevi-mobile:lint:biome:      94     │ - → //·Image␍
gurudevi-mobile:lint:biome:      95     │ - → Image:·View,␍
gurudevi-mobile:lint:biome:      96     │ - → //·Misc␍
gurudevi-mobile:lint:biome:      97     │ - → Avatar:·View,␍

gurudevi-mobile:lint:biome:      98     │ - → AvatarFallbackText:·Text,␍
gurudevi-mobile:lint:biome:      99     │ - → AvatarImage:·View,␍
gurudevi-mobile:lint:biome:     100     │ - → default:·{},␍
gurudevi-mobile:lint:biome:     101     │ - };␍
gurudevi-mobile:lint:biome:           1 │ + //·Manual·mock·for·@gluestack-ui/themed·and·all·its·build/components/*·sub-paths.
gurudevi-mobile:lint:biome:           2 │ + //
gurudevi-mobile:lint:biome:           3 │ + //·Use·HOST·STRING·TYPES·('View',·'Text',·etc.)·instead·of·ReactNative.*·components.
gurudevi-mobile:lint:biome:           4 │ + //
gurudevi-mobile:lint:biome:           5 │ + //·Why:·@testing-library/react-native·v14·uses·test-renderer@0.14.0,·a·custom·React
gurudevi-mobile:lint:biome:           6 │ + //·reconciler.·When·jest-expo/web·maps·react-native·\u2192·react-native-web,·any·call·to
gurudevi-mobile:lint:biome:           7 │ + //·ReactNative.View·renders·through·react-native-web's·function·chain,·eventually
gurudevi-mobile:lint:biome:           8 │ + //·producing·a·DOM·'div'·host·element.·The·test-renderer·then·sees·'div'·as·the·parent
gurudevi-mobile:lint:biome:           9 │ + //·of·text·strings,·violating·its·"text·must·be·inside·a·Text·host"·invariant
gurudevi-mobile:lint:biome:          10 │ + //·(textComponentTypes·=·['Text',·'RCTText']).
gurudevi-mobile:lint:biome:          11 │ + //
gurudevi-mobile:lint:biome:          12 │ + //·By·using·literal·strings·'View'·and·'Text',·the·test-renderer·treats·them·as·opaque
gurudevi-mobile:lint:biome:          13 │ + //·host·elements·it·manages·directly\u2014no·react-native-web·translation·happens.
gurudevi-mobile:lint:biome:          14 │ + const·React·=·require('react');

gurudevi-mobile:lint:biome:          15 │ + 
gurudevi-mobile:lint:biome:          16 │ + //·Host·element·helpers·\u2014·testID·flows·through·for·getAllByTestId·/·getByTestId·queries
gurudevi-mobile:lint:biome:          17 │ + const·mkView·=
gurudevi-mobile:lint:biome:          18 │ + ··(extraProps)·=>
gurudevi-mobile:lint:biome:          19 │ + ··({·children,·...props·})·=>
gurudevi-mobile:lint:biome:          20 │ + ····React.createElement('View',·{·...props,·...(extraProps·||·{})·},·children);
gurudevi-mobile:lint:biome:          21 │ + 
gurudevi-mobile:lint:biome:          22 │ + const·mkText·=
gurudevi-mobile:lint:biome:          23 │ + ··()·=>
gurudevi-mobile:lint:biome:          24 │ + ··({·children,·...props·})·=>
gurudevi-mobile:lint:biome:          25 │ + ····React.createElement('Text',·props,·children);
gurudevi-mobile:lint:biome:          26 │ + 
gurudevi-mobile:lint:biome:          27 │ + const·noop·=·()·=>·null;
gurudevi-mobile:lint:biome:          28 │ + 
gurudevi-mobile:lint:biome:          29 │ + const·View·=·mkView();
gurudevi-mobile:lint:biome:          30 │ + const·Text·=·mkText();
gurudevi-mobile:lint:biome:          31 │ + const·TextInput·=·({·testID,·...p·})·=>·React.createElement('TextInput',·{·testID,·...p·});
gurudevi-mobile:lint:biome:          32 │ + 
gurudevi-mobile:lint:biome:          33 │ + module.exports·=·{
gurudevi-mobile:lint:biome:          34 │ + ··//·Layout
gurudevi-mobile:lint:biome:          35 │ + ··Box:·View,
gurudevi-mobile:lint:biome:          36 │ + ··Center:·View,
gurudevi-mobile:lint:biome:          37 │ + ··HStack:·View,
gurudevi-mobile:lint:biome:          38 │ + ··VStack:·View,
gurudevi-mobile:lint:biome:          39 │ + ··View,
gurudevi-mobile:lint:biome:          40 │ + ··Divider:·View,
gurudevi-mobile:lint:biome:          41 │ + ··ScrollView:·View,
gurudevi-mobile:lint:biome:          42 │ + ··FlatList:·View,
gurudevi-mobile:lint:biome:          43 │ + ··SectionList:·View,
gurudevi-mobile:lint:biome:          44 │ + ··//·Typography
gurudevi-mobile:lint:biome:          45 │ + ··Text,
gurudevi-mobile:lint:biome:          46 │ + ··Heading:·Text,
gurudevi-mobile:lint:biome:          47 │ + ··Badge:·Text,
@repo/admin:lint:biome:      99     │ - → → → const·tenants·=·comparison.tenants;␍
@repo/admin:lint:biome:     100     │ - → → → //·Check·that·rankings·are·calculated␍
@repo/admin:lint:biome:     101     │ - → → → tenants.forEach((tenant,·_index)·=>·{␍
@repo/admin:lint:biome:     102     │ - → → → → expect(tenant.rank).toBeGreaterThan(0);␍
@repo/admin:lint:biome:     103     │ - → → → → expect(tenant.rank).toBeLessThanOrEqual(3);␍
@repo/admin:lint:biome:     104     │ - → → → → expect(tenant.percentile).toBeGreaterThanOrEqual(0);␍
@repo/admin:lint:biome:     105     │ - → → → → expect(tenant.percentile).toBeLessThanOrEqual(100);␍
@repo/admin:lint:biome:     106     │ - → → → });␍

@repo/admin:lint:biome:     107     │ - → → });␍
@repo/admin:lint:biome:     108     │ - → });␍
@repo/admin:lint:biome:     109     │ - → describe("Live·Metrics",·()·=>·{␍
@repo/admin:lint:biome:     110     │ - → → it("should·retrieve·live·metrics·for·a·tenant",·async·()·=>·{␍
@repo/admin:lint:biome:     111     │ - → → → const·tenantId·=·"tenant-1";␍
@repo/admin:lint:biome:     112     │ - → → → const·result·=·await·multiTenantAnalyticsEngine.getLiveMetrics(tenantId);␍
@repo/admin:lint:biome:     113     │ - → → → expect(result).toHaveProperty("timestamp");␍
@repo/admin:lint:biome:     114     │ - → → → expect(result).toHaveProperty("active_users");␍
@repo/admin:lint:biome:     115     │ - → → → expect(result).toHaveProperty("concurrent_sessions");␍
@repo/admin:lint:biome:     116     │ - → → → expect(result).toHaveProperty("api_requests_per_minute");␍
@repo/admin:lint:biome:     117     │ - → → → expect(result).toHaveProperty("error_rate");␍
@repo/admin:lint:biome:     118     │ - → → → expect(result).toHaveProperty("system_health");␍
@repo/admin:lint:biome:     119     │ - → → → expect(result).toHaveProperty("resource_usage");␍
@repo/admin:lint:biome:     120     │ - → → → expect(result!.active_users).toBeDefined();␍
@repo/admin:lint:biome:     121     │ - → → });␍
@repo/admin:lint:biome:     122     │ - → → it("should·calculate·system·health·correctly",·async·()·=>·{␍
@repo/admin:lint:biome:     123     │ - → → → const·tenantId·=·"tenant-1";␍
@repo/admin:lint:biome:     124     │ - → → → const·result·=·await·multiTenantAnalyticsEngine.getLiveMetrics(tenantId);␍
@repo/admin:lint:biome:     125     │ - → → → expect(["healthy",·"warning",·"critical"]).toContain(␍
@repo/admin:lint:biome:     126     │ - → → → → result!.system_health,␍
@repo/admin:lint:biome:     127     │ - → → → );␍
@repo/admin:lint:biome:     128     │ - → → });␍
@repo/admin:lint:biome:     129     │ - → → it("should·include·resource·usage·metrics",·async·()·=>·{␍
@repo/admin:lint:biome:     130     │ - → → → const·tenantId·=·"tenant-1";␍
@repo/admin:lint:biome:     131     │ - → → → const·result·=·await·multiTenantAnalyticsEngine.getLiveMetrics(tenantId);␍
@repo/admin:lint:biome:     132     │ - → → → expect(result!.resource_usage).toHaveProperty("cpu");␍
@repo/admin:lint:biome:     133     │ - → → → expect(result!.resource_usage).toHaveProperty("memory");␍
@repo/admin:lint:biome:     134     │ - → → → expect(result!.resource_usage).toHaveProperty("storage");␍
@repo/admin:lint:biome:     135     │ - → → → expect(typeof·result!.resource_usage.cpu).toBe("number");␍
@repo/admin:lint:biome:     136     │ - → → → expect(typeof·result!.resource_usage.memory).toBe("number");␍
@repo/admin:lint:biome:     137     │ - → → → expect(typeof·result!.resource_usage.storage).toBe("number");␍
@repo/admin:lint:biome:     138     │ - → → });␍
@repo/admin:lint:biome:     139     │ - → });␍
@repo/admin:lint:biome:     140     │ - → describe("Custom·Reports",·()·=>·{␍
@repo/admin:lint:biome:     141     │ - → → it("should·create·custom·report·with·specified·configuration",·async·()·=>·{␍
@repo/admin:lint:biome:     142     │ - → → → const·config:·CustomReportConfig·=·{␍
@repo/admin:lint:biome:     143     │ - → → → → id:·"report-1",␍
@repo/admin:lint:biome:     144     │ - → → → → name:·"Test·Report",␍
@repo/admin:lint:biome:     145     │ - → → → → description:·"Test·Description",␍
@repo/admin:lint:biome:     146     │ - → → → → metrics:·["attendance_rate",·"grade_average"],␍
@repo/admin:lint:biome:     147     │ - → → → → filters:·[],␍
@repo/admin:lint:biome:     148     │ - → → → → chartType:·"line",␍
@repo/admin:lint:biome:     149     │ - → → → };␍
@repo/admin:lint:biome:     150     │ - → → → const·result·=␍
@repo/admin:lint:biome:   566 more lines truncated
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 
@repo/admin:lint:biome: src\admin\adminControl.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 

gurudevi-mobile:lint:biome:          48 │ + ··BadgeText:·Text,

@repo/admin:lint:biome:   × Formatter would have printed the following content:

@repo/admin:lint:biome:   

gurudevi-mobile:lint:biome:          49 │ + ··//·Interactive

gurudevi-mobile:lint:biome:   52 more lines truncated
gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome: __mocks__\react-native-reanimated.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gurudevi-mobile:lint:biome: 

@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   

@repo/admin:lint:biome:       1     │ - import·{·useFeatureStore·}·from·"@repo/core/logic";␍

gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   

@repo/admin:lint:biome:       2     │ - import·{·type·MutationOutcome,·useMutationAuditLog·}·from·"@repo/core/sync";␍

gurudevi-mobile:lint:biome:      1    │ - //·Manual·mock·for·react-native-reanimated·v4·(requires·C++·JSI·+·worklets·in·native)␍

@repo/admin:lint:biome:       3     │ - ␍

@repo/admin:lint:biome:       4     │ - export·interface·AdminFeatureGateChange·{␍

gurudevi-mobile:lint:biome:      2    │ - //·Provides·just·enough·API·surface·for·component·tests·to·render·without·errors.␍

gurudevi-mobile:lint:biome:      3    │ - const·React·=·require("react");␍
gurudevi-mobile:lint:biome:      4    │ - ␍
gurudevi-mobile:lint:biome:      5    │ - const·Reanimated·=·{␍

gurudevi-mobile:lint:biome:      6    │ - → Value:·jest.fn(),␍

@repo/admin:lint:biome:       5     │ - → key:·string;␍

@repo/people:lint:biome:       1     │ - import·SanctuaryModal·from·"@repo/ui/components/SanctuaryModal";␍

@repo/admin:lint:biome:       6     │ - → value:·string·|·boolean;␍

@repo/admin:lint:biome:       7     │ - }␍

@repo/admin:lint:biome:       8     │ - ␍

gurudevi-mobile:lint:biome:      7    │ - → event:·jest.fn(),␍

gurudevi-mobile:lint:biome:      8    │ - → add:·jest.fn(),␍

gurudevi-mobile:lint:biome:      9    │ - → eq:·jest.fn(),␍

gurudevi-mobile:lint:biome:     10    │ - → set:·jest.fn(),␍

gurudevi-mobile:lint:biome:     11    │ - → cond:·jest.fn(),␍

gurudevi-mobile:lint:biome:     12    │ - → interpolate:·jest.fn(),␍

gurudevi-mobile:lint:biome:     13    │ - → View:·({·children,·...props·})·=>␍

@repo/admin:lint:biome:       9     │ - export·interface·GuardedRepairPlan·{␍

@repo/people:lint:biome:       2     │ - import·{·SkeletonCard·}·from·"@repo/ui/components/SkeletonLoader";␍

@repo/people:lint:biome:       3     │ - import·{·Box,·HStack,·ScrollView,·Text,·VStack·}·from·"@repo/ui/primitives";␍

@repo/people:lint:biome:       4     │ - ␍

@repo/admin:lint:biome:      10     │ - → kind:·"poa"·|·"capability"·|·"release"·|·"maintenance";␍

@repo/admin:lint:biome:      11     │ - → title:·string;␍

@repo/admin:lint:biome:      12     │ - → summary:·string;␍

gurudevi-mobile:lint:biome:     14    │ - → → React.createElement("View",·props,·children),␍

@repo/people:lint:biome:       5     │ - import·{·useEffect,·useState·}·from·"react";␍

@repo/admin:lint:biome:      13     │ - → scope:·string;␍

@repo/admin:lint:biome:      14     │ - → reversible:·boolean;␍

@repo/admin:lint:biome:      15     │ - }␍

@repo/admin:lint:biome:      16     │ - ␍

@repo/people:lint:biome:       6     │ - import·{·type·TeacherSentEcho,·teacherFeedbackAPI·}·from·"../feedback";␍
@repo/people:lint:biome:       7     │ - ␍
@repo/people:lint:biome:       8     │ - //·—————————————————————————————————————————————————————————————————————————————␍
@repo/people:lint:biome:       9     │ - //·TYPES␍

gurudevi-mobile:lint:biome:     15    │ - → ScrollView:·({·children,·...props·})·=>␍

@repo/people:lint:biome:      10     │ - //·—————————————————————————————————————————————————————————————————————————————␍

gurudevi-mobile:lint:biome:     16    │ - → → React.createElement("ScrollView",·props,·children),␍

@repo/people:lint:biome:      11     │ - ␍

@repo/admin:lint:biome:      17     │ - export·interface·AdminMutationPreview·{␍

@repo/admin:lint:biome:      18     │ - → id:·string;␍

@repo/admin:lint:biome:      19     │ - → title:·string;␍

@repo/people:lint:biome:      12     │ - interface·TeacherEchoHistoryModalProps·{␍

gurudevi-mobile:lint:biome:     17    │ - → FlatList:·({·children,·...props·})·=>␍

gurudevi-mobile:lint:biome:     18    │ - → → React.createElement("FlatList",·props,·children),␍

@repo/people:lint:biome:      13     │ - → visible:·boolean;␍

gurudevi-mobile:lint:biome:     19    │ - → Text:·({·children,·...props·})·=>␍

@repo/people:lint:biome:      14     │ - → teacherId:·string;␍

@repo/admin:lint:biome:      20     │ - → summary:·string;␍

@repo/people:lint:biome:      15     │ - → onClose:·()·=>·void;␍

@repo/admin:lint:biome:      21     │ - → changes:·AdminFeatureGateChange[];␍

@repo/people:lint:biome:      16     │ - }␍
gurudevi-mobile:lint:biome:     20    │ - → → React.createElement("Text",·props,·children),␍

@repo/people:lint:biome:      17     │ - ␍

@repo/admin:lint:biome:      22     │ - → affectedScope:·string;␍

gurudevi-mobile:lint:biome:     21    │ - → Image:·({·children,·...props·})·=>␍

gurudevi-mobile:lint:biome:     22    │ - → → React.createElement("Image",·props,·children),␍

@repo/people:lint:biome:      18     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/people:lint:biome:      19     │ - //·COMPONENT␍

@repo/admin:lint:biome:      23     │ - → reversible:·boolean;␍

@repo/admin:lint:biome:      24     │ - → createdAt:·string;␍

@repo/admin:lint:biome:      25     │ - }␍

gurudevi-mobile:lint:biome:     23    │ - → createAnimatedComponent:·(component)·=>·component,␍

gurudevi-mobile:lint:biome:     24    │ - → useAnimatedStyle:·jest.fn(()·=>·({})),␍

@repo/people:lint:biome:      20     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/people:lint:biome:      21     │ - ␍

@repo/admin:lint:biome:      26     │ - ␍

@repo/admin:lint:biome:      27     │ - export·interface·AdminAuditEntry·{␍
@repo/admin:lint:biome:      28     │ - → id:·string;␍
@repo/admin:lint:biome:      29     │ - → name:·string;␍
@repo/admin:lint:biome:      30     │ - → scope:·string;␍
@repo/admin:lint:biome:      31     │ - → status:·MutationOutcome;␍
@repo/admin:lint:biome:      32     │ - → summary:·string;␍
@repo/admin:lint:biome:      33     │ - → createdAt:·string;␍

@repo/admin:lint:biome:      34     │ - → updatedAt:·string;␍
@repo/admin:lint:biome:      35     │ - → lastError?:·string;␍
@repo/admin:lint:biome:      36     │ - }␍
@repo/admin:lint:biome:      37     │ - ␍

@repo/people:lint:biome:      22     │ - /**␍
@repo/admin:lint:biome:      38     │ - function·makeId(prefix:·string)·{␍
@repo/admin:lint:biome:      39     │ - → return·`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,·8)}`;␍

@repo/admin:lint:biome:      40     │ - }␍
@repo/admin:lint:biome:      41     │ - ␍
@repo/admin:lint:biome:      42     │ - function·logAdminMutation(␍
@repo/admin:lint:biome:      43     │ - → name:·string,␍
@repo/admin:lint:biome:      44     │ - → scope:·string,␍
@repo/admin:lint:biome:      45     │ - → status:·MutationOutcome,␍
@repo/admin:lint:biome:      46     │ - → _summary:·string,␍
@repo/admin:lint:biome:      47     │ - → lastError?:·string,␍

@repo/admin:lint:biome:      48     │ - )·{␍
@repo/admin:lint:biome:      49     │ - → const·id·=·makeId("admin-mutation");␍

gurudevi-mobile:lint:biome:     25    │ - → useSharedValue:·jest.fn((v)·=>·({·value:·v·})),␍

@repo/people:lint:biome:      23     │ - ·*·TEACHER·ECHO·HISTORY·MODAL␍

@repo/people:lint:biome:      24     │ - ·*·Sanctuary·V3·standard·for·reviewing·sent·feedback.␍
@repo/people:lint:biome:      25     │ - ·*·Features·hierarchical·priority·display·and·premium·styling.␍
@repo/people:lint:biome:      26     │ - ·*/␍
@repo/people:lint:biome:      27     │ - export·default·function·TeacherEchoHistoryModal({␍
@repo/people:lint:biome:      28     │ - → visible,␍

gurudevi-mobile:lint:biome:     26    │ - → useAnimatedScrollHandler:·jest.fn(()·=>·jest.fn()),␍

gurudevi-mobile:lint:biome:     27    │ - → useAnimatedRef:·jest.fn(()·=>·({·current:·null·})),␍
gurudevi-mobile:lint:biome:     28    │ - → useDerivedValue:·jest.fn((fn)·=>·({·value:·fn()·})),␍

gurudevi-mobile:lint:biome:     29    │ - → useAnimatedGestureHandler:·jest.fn(()·=>·jest.fn()),␍
gurudevi-mobile:lint:biome:     30    │ - → useAnimatedReaction:·jest.fn(),␍

gurudevi-mobile:lint:biome:     31    │ - → withTiming:·jest.fn((v)·=>·v),␍

@repo/people:lint:biome:      29     │ - → teacherId,␍

gurudevi-mobile:lint:biome:     32    │ - → withSpring:·jest.fn((v)·=>·v),␍

gurudevi-mobile:lint:biome:     33    │ - → withDelay:·jest.fn((_,·v)·=>·v),␍
gurudevi-mobile:lint:biome:     34    │ - → withSequence:·jest.fn((...args)·=>·args[0]),␍
gurudevi-mobile:lint:biome:     35    │ - → withRepeat:·jest.fn((v)·=>·v),␍

gurudevi-mobile:lint:biome:     36    │ - → interpolateColor:·jest.fn(),␍
gurudevi-mobile:lint:biome:     37    │ - → runOnJS:·jest.fn((fn)·=>·fn),␍
gurudevi-mobile:lint:biome:     38    │ - → runOnUI:·jest.fn((fn)·=>·fn),␍

gurudevi-mobile:lint:biome:     39    │ - → scrollTo:·jest.fn(),␍
gurudevi-mobile:lint:biome:     40    │ - → measure:·jest.fn(),␍

@repo/admin:lint:biome:      50     │ - → useMutationAuditLog.getState().logEntry({␍
@repo/admin:lint:biome:      51     │ - → → id,␍

@repo/people:lint:biome:      30     │ - → onClose,␍

gurudevi-mobile:lint:biome:     41    │ - → Easing:·{␍

@repo/people:lint:biome:      31     │ - }:·TeacherEchoHistoryModalProps)·{␍

gurudevi-mobile:lint:biome:     42    │ - → → linear:·jest.fn(),␍

gurudevi-mobile:lint:biome:     43    │ - → → ease:·jest.fn(),␍

@repo/people:lint:biome:      32     │ - → const·[echoes,·setEchoes]·=·useState<TeacherSentEcho[]>([]);␍

gurudevi-mobile:lint:biome:     44    │ - → → bezier:·jest.fn(),␍

@repo/admin:lint:biome:      52     │ - → → idempotencyKey:·`${scope}:${name}`,␍

@repo/admin:lint:biome:      53     │ - → → scope,␍

gurudevi-mobile:lint:biome:     45    │ - → → circle:·jest.fn(),␍

gurudevi-mobile:lint:biome:     46    │ - → },␍

@repo/people:lint:biome:      33     │ - → const·[loading,·setLoading]·=·useState(false);␍

@repo/people:lint:biome:      34     │ - ␍

@repo/people:lint:biome:      35     │ - → useEffect(()·=>·{␍

gurudevi-mobile:lint:biome:     47    │ - → FadeIn:·{·duration:·jest.fn()·},␍

gurudevi-mobile:lint:biome:     48    │ - → FadeInDown:·{·duration:·jest.fn(),·delay:·jest.fn()·},␍

gurudevi-mobile:lint:biome:     49    │ - → FadeInUp:·{·duration:·jest.fn(),·delay:·jest.fn()·},␍

@repo/people:lint:biome:      36     │ - → → if·(!visible·||·!teacherId)·return;␍

@repo/people:lint:biome:      37     │ - ␍

@repo/admin:lint:biome:      54     │ - → → name,␍

@repo/admin:lint:biome:      55     │ - → → status,␍

@repo/admin:lint:biome:      56     │ - → → attempts:·status·===·"retrying"·?·1·:·0,␍
@repo/people:lint:biome:      38     │ - → → let·mounted·=·true;␍

@repo/admin:lint:biome:      57     │ - → → queuedAt:·Date.now(),␍

gurudevi-mobile:lint:biome:     50    │ - → FadeInLeft:·{·duration:·jest.fn(),·delay:·jest.fn()·},␍

@repo/admin:lint:biome:      58     │ - → → lastError,␍
@repo/admin:lint:biome:      59     │ - → });␍
@repo/admin:lint:biome:      60     │ - ␍
@repo/admin:lint:biome:      61     │ - → return·id;␍

@repo/admin:lint:biome:      62     │ - }␍
@repo/admin:lint:biome:      63     │ - ␍
@repo/admin:lint:biome:      64     │ - export·function·getAdminFeatureSnapshot()·{␍
@repo/admin:lint:biome:      65     │ - → const·{·flags,·globalConfigs·}·=·useFeatureStore.getState();␍
@repo/admin:lint:biome:      66     │ - → return·{␍
@repo/admin:lint:biome:      67     │ - → → flags,␍
@repo/admin:lint:biome:      68     │ - → → globalConfigs,␍
@repo/admin:lint:biome:      69     │ - → → activeFlagCount:·Object.values(flags).filter(Boolean).length,␍

@repo/admin:lint:biome:      70     │ - → → maintenanceMode:·flags.isUnderMaintenance,␍

@repo/admin:lint:biome:      71     │ - → };␍

@repo/admin:lint:biome:      72     │ - }␍

@repo/admin:lint:biome:      73     │ - ␍

gurudevi-mobile:lint:biome:     51    │ - → FadeInRight:·{·duration:·jest.fn(),·delay:·jest.fn()·},␍
gurudevi-mobile:lint:biome:     52    │ - → FadeOut:·{·duration:·jest.fn()·},␍
gurudevi-mobile:lint:biome:     53    │ - → FadeOutDown:·{·duration:·jest.fn()·},␍
gurudevi-mobile:lint:biome:     54    │ - → SlideInDown:·{·duration:·jest.fn()·},␍

gurudevi-mobile:lint:biome:     55    │ - → ZoomIn:·{·duration:·jest.fn()·},␍
gurudevi-mobile:lint:biome:     56    │ - → Layout:·{·duration:·jest.fn()·},␍

gurudevi-mobile:lint:biome:     57    │ - → cancelAnimation:·jest.fn(),␍
gurudevi-mobile:lint:biome:     58    │ - → default:·{},␍
gurudevi-mobile:lint:biome:     59    │ - };␍
gurudevi-mobile:lint:biome:     60    │ - ␍
gurudevi-mobile:lint:biome:     61    │ - module.exports·=·Reanimated;␍
gurudevi-mobile:lint:biome:         1 │ + //·Manual·mock·for·react-native-reanimated·v4·(requires·C++·JSI·+·worklets·in·native)

gurudevi-mobile:lint:biome:         2 │ + //·Provides·just·enough·API·surface·for·component·tests·to·render·without·errors.
gurudevi-mobile:lint:biome:         3 │ + const·React·=·require('react');
gurudevi-mobile:lint:biome:         4 │ + 
gurudevi-mobile:lint:biome:         5 │ + const·Reanimated·=·{
gurudevi-mobile:lint:biome:         6 │ + ··Value:·jest.fn(),
gurudevi-mobile:lint:biome:         7 │ + ··event:·jest.fn(),
gurudevi-mobile:lint:biome:         8 │ + ··add:·jest.fn(),
gurudevi-mobile:lint:biome:         9 │ + ··eq:·jest.fn(),
gurudevi-mobile:lint:biome:        10 │ + ··set:·jest.fn(),
gurudevi-mobile:lint:biome:        11 │ + ··cond:·jest.fn(),
gurudevi-mobile:lint:biome:        12 │ + ··interpolate:·jest.fn(),
gurudevi-mobile:lint:biome:        13 │ + ··View:·({·children,·...props·})·=>·React.createElement('View',·props,·children),
gurudevi-mobile:lint:biome:        14 │ + ··ScrollView:·({·children,·...props·})·=>·React.createElement('ScrollView',·props,·children),
gurudevi-mobile:lint:biome:        15 │ + ··FlatList:·({·children,·...props·})·=>·React.createElement('FlatList',·props,·children),
gurudevi-mobile:lint:biome:        16 │ + ··Text:·({·children,·...props·})·=>·React.createElement('Text',·props,·children),
gurudevi-mobile:lint:biome:        17 │ + ··Image:·({·children,·...props·})·=>·React.createElement('Image',·props,·children),

@repo/admin:lint:biome:      74     │ - export·function·stageFeatureGateChanges(␍

@repo/admin:lint:biome:      75     │ - → changes:·AdminFeatureGateChange[],␍

@repo/admin:lint:biome:      76     │ - → affectedScope·=·"platform",␍

@repo/admin:lint:biome:      77     │ - ):·AdminMutationPreview·{␍

@repo/admin:lint:biome:      78     │ - → logAdminMutation(␍

@repo/admin:lint:biome:      79     │ - → → "stage-feature-gate-changes",␍

@repo/admin:lint:biome:      80     │ - → → affectedScope,␍

@repo/admin:lint:biome:      81     │ - → → "queued",␍

@repo/admin:lint:biome:      82     │ - → → "Prepared·a·feature-gate·preview·for·review.",␍

@repo/admin:lint:biome:      83     │ - → );␍
@repo/admin:lint:biome:      84     │ - → return·{␍

@repo/admin:lint:biome:      85     │ - → → id:·makeId("feature-preview"),␍
@repo/admin:lint:biome:      86     │ - → → title:·"Feature·gate·change·preview",␍
@repo/admin:lint:biome:      87     │ - → → summary:␍
@repo/admin:lint:biome:      88     │ - → → → "Stage·global·config·updates·without·mutating·live·operator·state·until·the·preview·is·approved.",␍
@repo/admin:lint:biome:      89     │ - → → changes,␍

@repo/admin:lint:biome:      90     │ - → → affectedScope,␍
@repo/admin:lint:biome:      91     │ - → → reversible:·true,␍
@repo/admin:lint:biome:      92     │ - → → createdAt:·new·Date().toISOString(),␍
@repo/admin:lint:biome:      93     │ - → };␍
@repo/admin:lint:biome:      94     │ - }␍
@repo/admin:lint:biome:      95     │ - ␍
@repo/admin:lint:biome:      96     │ - export·function·commitFeatureGateChanges(changes:·AdminFeatureGateChange[])·{␍
@repo/admin:lint:biome:      97     │ - → const·current·=·useFeatureStore.getState().globalConfigs;␍

@repo/admin:lint:biome:      98     │ - → const·next·=·changes.reduce<Record<string,·string·|·boolean>>(␍
@repo/admin:lint:biome:      99     │ - → → (acc,·change)·=>·{␍
@repo/admin:lint:biome:     100     │ - → → → acc[change.key]·=·change.value;␍
@repo/admin:lint:biome:     101     │ - → → → return·acc;␍
@repo/admin:lint:biome:     102     │ - → → },␍
@repo/admin:lint:biome:     103     │ - → → {·...current·},␍

@repo/people:lint:biome:      39     │ - → → const·load·=·async·()·=>·{␍

@repo/people:lint:biome:      40     │ - → → → setLoading(true);␍

@repo/people:lint:biome:      41     │ - → → → try·{␍
@repo/people:lint:biome:      42     │ - → → → → const·data·=·await·teacherFeedbackAPI.listSentEchoes(teacherId,·20);␍
@repo/people:lint:biome:      43     │ - → → → → if·(mounted)·setEchoes(data);␍

@repo/people:lint:biome:      44     │ - → → → }·catch·(err)·{␍
@repo/people:lint:biome:      45     │ - → → → → console.error("Failed·to·load·feedback·history:",·err);␍
@repo/people:lint:biome:      46     │ - → → → }·finally·{␍
@repo/people:lint:biome:      47     │ - → → → → if·(mounted)·setLoading(false);␍
@repo/people:lint:biome:      48     │ - → → → }␍
@repo/people:lint:biome:      49     │ - → → };␍

@repo/people:lint:biome:      50     │ - ␍
@repo/people:lint:biome:      51     │ - → → void·load();␍
@repo/people:lint:biome:      52     │ - → → return·()·=>·{␍
@repo/people:lint:biome:      53     │ - → → → mounted·=·false;␍
@repo/people:lint:biome:      54     │ - → → };␍
@repo/people:lint:biome:      55     │ - → },·[teacherId,·visible]);␍
@repo/people:lint:biome:      56     │ - ␍

@repo/people:lint:biome:      57     │ - → return·(␍
@repo/people:lint:biome:      58     │ - → → <SanctuaryModal␍
@repo/people:lint:biome:      59     │ - → → → isOpen={visible}␍
@repo/people:lint:biome:      60     │ - → → → onClose={onClose}␍
@repo/people:lint:biome:      61     │ - → → → title="Echo·History"␍
@repo/people:lint:biome:      62     │ - → → → subtitle="SOVEREIGN·FEEDBACK"␍
@repo/people:lint:biome:      63     │ - → → >␍

@repo/admin:lint:biome:     104     │ - → );␍

@repo/admin:lint:biome:     105     │ - ␍

@repo/admin:lint:biome:     106     │ - → useFeatureStore.getState().setGlobalConfigs(next);␍
@repo/admin:lint:biome:     107     │ - → logAdminMutation(␍
@repo/admin:lint:biome:     108     │ - → → "commit-feature-gate-changes",␍
@repo/admin:lint:biome:     109     │ - → → "platform",␍

@repo/admin:lint:biome:     110     │ - → → "success",␍

@repo/admin:lint:biome:     111     │ - → → `Applied·${changes.length}·feature·gate·change(s).`,␍

@repo/people:lint:biome:      64     │ - → → → <Box·className="flex-1">␍

@repo/admin:lint:biome:     112     │ - → );␍

gurudevi-mobile:lint:biome:        18 │ + ··createAnimatedComponent:·(component)·=>·component,

@repo/people:lint:biome:      65     │ - → → → → {/*·Content·*/}␍

@repo/admin:lint:biome:     113     │ - ␍

gurudevi-mobile:lint:biome:        19 │ + ··useAnimatedStyle:·jest.fn(()·=>·({})),

gurudevi-mobile:lint:biome:        20 │ + ··useSharedValue:·jest.fn((v)·=>·({·value:·v·})),

@repo/people:lint:biome:      66     │ - → → → → <ScrollView␍

gurudevi-mobile:lint:biome:        21 │ + ··useAnimatedScrollHandler:·jest.fn(()·=>·jest.fn()),

@repo/people:lint:biome:      67     │ - → → → → → className="flex-1"␍

@repo/admin:lint:biome:     114     │ - → return·{␍

@repo/admin:lint:biome:     115     │ - → → applied:·true,␍

gurudevi-mobile:lint:biome:        22 │ + ··useAnimatedRef:·jest.fn(()·=>·({·current:·null·})),

@repo/people:lint:biome:      68     │ - → → → → → contentContainerStyle={{·padding:·0,·paddingBottom:·60·}}␍

@repo/admin:lint:biome:     116     │ - → → appliedAt:·new·Date().toISOString(),␍

@repo/admin:lint:biome:     117     │ - → → changedKeys:·changes.map((change)·=>·change.key),␍

gurudevi-mobile:lint:biome:        23 │ + ··useDerivedValue:·jest.fn((fn)·=>·({·value:·fn()·})),

@repo/admin:lint:biome:     118     │ - → };␍

@repo/admin:lint:biome:     119     │ - }␍

@repo/admin:lint:biome:     120     │ - ␍

@repo/people:lint:biome:      69     │ - → → → → → showsVerticalScrollIndicator={false}␍

@repo/people:lint:biome:      70     │ - → → → → >␍

@repo/people:lint:biome:      71     │ - → → → → → {loading·?·(␍

@repo/people:lint:biome:      72     │ - → → → → → → <VStack·space="md">␍

@repo/admin:lint:biome:     121     │ - export·function·stageGuardedRepair(␍

@repo/people:lint:biome:      73     │ - → → → → → → → <SkeletonCard·/>␍

@repo/people:lint:biome:      74     │ - → → → → → → → <SkeletonCard·/>␍

@repo/people:lint:biome:      75     │ - → → → → → → → <SkeletonCard·/>␍

gurudevi-mobile:lint:biome:        24 │ + ··useAnimatedGestureHandler:·jest.fn(()·=>·jest.fn()),

@repo/people:lint:biome:      76     │ - → → → → → → </VStack>␍

@repo/people:lint:biome:      77     │ - → → → → → )·:·echoes.length·===·0·?·(␍

@repo/admin:lint:biome:     122     │ - → plan:·GuardedRepairPlan,␍

@repo/admin:lint:biome:     123     │ - ):·AdminMutationPreview·{␍

@repo/admin:lint:biome:     124     │ - → logAdminMutation(␍

@repo/admin:lint:biome:     125     │ - → → `stage-${plan.kind}-repair`,␍

@repo/admin:lint:biome:     126     │ - → → plan.scope,␍

@repo/admin:lint:biome:     127     │ - → → "queued",␍

@repo/admin:lint:biome:     128     │ - → → `Prepared·a·${plan.kind}·repair·preview·for·review.`,␍

@repo/admin:lint:biome:     129     │ - → );␍

@repo/admin:lint:biome:     130     │ - → return·{␍

@repo/admin:lint:biome:     131     │ - → → id:·makeId("repair-preview"),␍

gurudevi-mobile:lint:biome:        25 │ + ··useAnimatedReaction:·jest.fn(),

@repo/admin:lint:biome:     132     │ - → → title:·plan.title,␍

@repo/people:lint:biome:      78     │ - → → → → → → <Box·className="px-12·py-20·items-center·justify-center·mt-10">␍

@repo/admin:lint:biome:     133     │ - → → summary:·plan.summary,␍

@repo/admin:lint:biome:     134     │ - → → changes:·[␍

@repo/admin:lint:biome:     135     │ - → → → {·key:·`${plan.kind}.scope`,·value:·plan.scope·},␍

gurudevi-mobile:lint:biome:        26 │ + ··withTiming:·jest.fn((v)·=>·v),

@repo/people:lint:biome:      79     │ - → → → → → → → <Text·className="text-sm·text-phase-text-tertiary·italic·text-center·font-medium·leading-6">␍

@repo/people:lint:biome:      80     │ - → → → → → → → → No·echoes·sent·yet.·Use·the·"Principal·Echo"·action·to·share␍
@repo/people:lint:biome:      81     │ - → → → → → → → → feedback·with·the·governing·body.␍

@repo/admin:lint:biome:     136     │ - → → → {·key:·`${plan.kind}.reversible`,·value:·plan.reversible·},␍

@repo/admin:lint:biome:     137     │ - → → ],␍

gurudevi-mobile:lint:biome:        27 │ + ··withSpring:·jest.fn((v)·=>·v),

@repo/admin:lint:biome:     138     │ - → → affectedScope:·plan.scope,␍

@repo/admin:lint:biome:     139     │ - → → reversible:·plan.reversible,␍

@repo/people:lint:biome:      82     │ - → → → → → → → </Text>␍

@repo/admin:lint:biome:     140     │ - → → createdAt:·new·Date().toISOString(),␍

@repo/admin:lint:biome:     141     │ - → };␍

@repo/admin:lint:biome:     142     │ - }␍

@repo/admin:lint:biome:     143     │ - ␍

@repo/people:lint:biome:      83     │ - → → → → → → </Box>␍

gurudevi-mobile:lint:biome:        28 │ + ··withDelay:·jest.fn((_,·v)·=>·v),

gurudevi-mobile:lint:biome:        29 │ + ··withSequence:·jest.fn((...args)·=>·args[0]),

gurudevi-mobile:lint:biome:        30 │ + ··withRepeat:·jest.fn((v)·=>·v),

@repo/admin:lint:biome:     144     │ - export·function·commitGuardedRepair(plan:·GuardedRepairPlan)·{␍

@repo/people:lint:biome:      84     │ - → → → → → )·:·(␍

@repo/people:lint:biome:      85     │ - → → → → → → <VStack·space="lg">␍

@repo/people:lint:biome:      86     │ - → → → → → → → {echoes.map((echo)·=>·(␍

@repo/people:lint:biome:      87     │ - → → → → → → → → <Box␍

gurudevi-mobile:lint:biome:        31 │ + ··interpolateColor:·jest.fn(),

@repo/people:lint:biome:      88     │ - → → → → → → → → → key={echo.id}␍

@repo/admin:lint:biome:     145     │ - → logAdminMutation(␍
@repo/admin:lint:biome:     146     │ - → → `commit-${plan.kind}-repair`,␍

@repo/admin:lint:biome:     147     │ - → → plan.scope,␍

gurudevi-mobile:lint:biome:        32 │ + ··runOnJS:·jest.fn((fn)·=>·fn),

@repo/people:lint:biome:      89     │ - → → → → → → → → → className="bg-phase-surface/20·rounded-[32px]·border·border-phase-surface·shadow-sm·overflow-hidden"␍

@repo/people:lint:biome:      90     │ - → → → → → → → → >␍

@repo/admin:lint:biome:     148     │ - → → "success",␍

gurudevi-mobile:lint:biome:        33 │ + ··runOnUI:·jest.fn((fn)·=>·fn),

gurudevi-mobile:lint:biome:        34 │ + ··scrollTo:·jest.fn(),

gurudevi-mobile:lint:biome:        35 │ + ··measure:·jest.fn(),

gurudevi-mobile:lint:biome:        36 │ + ··Easing:·{
gurudevi-mobile:lint:biome:        37 │ + ····linear:·jest.fn(),

gurudevi-mobile:lint:biome:        38 │ + ····ease:·jest.fn(),

@repo/admin:lint:biome:     149     │ - → → `Committed·a·guarded·${plan.kind}·repair.`,␍

@repo/admin:lint:biome:     150     │ - → );␍

@repo/admin:lint:biome:   195 more lines truncated
@repo/admin:lint:biome:   

@repo/admin:lint:biome: 

@repo/people:lint:biome:      91     │ - → → → → → → → → → {/*·Priority·Indicator·*/}␍

@repo/people:lint:biome:      92     │ - → → → → → → → → → <Box␍

@repo/admin:lint:biome: src\admin\workspace.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 

@repo/people:lint:biome:      93     │ - → → → → → → → → → → className={`absolute·left-0·top-0·bottom-0·w-1.5·${␍
@repo/people:lint:biome:      94     │ - → → → → → → → → → → → echo.priority·===·"high"␍

@repo/people:lint:biome:      95     │ - → → → → → → → → → → → → ?·"bg-phase-error"␍
@repo/people:lint:biome:      96     │ - → → → → → → → → → → → → :·"bg-phase-interactive"␍
@repo/people:lint:biome:      97     │ - → → → → → → → → → → }`}␍
@repo/people:lint:biome:      98     │ - → → → → → → → → → />␍
@repo/people:lint:biome:      99     │ - ␍
@repo/people:lint:biome:     100     │ - → → → → → → → → → <VStack·className="p-6">␍
@repo/people:lint:biome:     101     │ - → → → → → → → → → → <HStack·className="justify-between·items-center·mb-4">␍
gurudevi-mobile:lint:biome:        39 │ + ····bezier:·jest.fn(),
gurudevi-mobile:lint:biome:        40 │ + ····circle:·jest.fn(),
gurudevi-mobile:lint:biome:        41 │ + ··},
@repo/people:lint:biome:     102     │ - → → → → → → → → → → → <HStack·space="xs"·className="items-center·flex-wrap">␍

gurudevi-mobile:lint:biome:        42 │ + ··FadeIn:·{·duration:·jest.fn()·},
gurudevi-mobile:lint:biome:        43 │ + ··FadeInDown:·{·duration:·jest.fn(),·delay:·jest.fn()·},
@repo/people:lint:biome:     103     │ - → → → → → → → → → → → → <Box·className="bg-phase-surface·px-2.5·py-1·rounded-full·border·border-phase-surface">␍
gurudevi-mobile:lint:biome:        44 │ + ··FadeInUp:·{·duration:·jest.fn(),·delay:·jest.fn()·},
gurudevi-mobile:lint:biome:        45 │ + ··FadeInLeft:·{·duration:·jest.fn(),·delay:·jest.fn()·},
gurudevi-mobile:lint:biome:        46 │ + ··FadeInRight:·{·duration:·jest.fn(),·delay:·jest.fn()·},
gurudevi-mobile:lint:biome:        47 │ + ··FadeOut:·{·duration:·jest.fn()·},
gurudevi-mobile:lint:biome:        48 │ + ··FadeOutDown:·{·duration:·jest.fn()·},
gurudevi-mobile:lint:biome:        49 │ + ··SlideInDown:·{·duration:·jest.fn()·},
gurudevi-mobile:lint:biome:        50 │ + ··ZoomIn:·{·duration:·jest.fn()·},
gurudevi-mobile:lint:biome:        51 │ + ··Layout:·{·duration:·jest.fn()·},

gurudevi-mobile:lint:biome:        52 │ + ··cancelAnimation:·jest.fn(),
gurudevi-mobile:lint:biome:        53 │ + ··default:·{},

gurudevi-mobile:lint:biome:        54 │ + };
gurudevi-mobile:lint:biome:        55 │ + 
gurudevi-mobile:lint:biome:        56 │ + module.exports·=·Reanimated;
gurudevi-mobile:lint:biome:     62 57 │   
gurudevi-mobile:lint:biome:   
gurudevi-mobile:lint:biome: 
gurudevi-mobile:lint:biome: app.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome: 

@repo/people:lint:biome:     104     │ - → → → → → → → → → → → → → <Text·className="text-[10px]·font-bold·uppercase·text-phase-text-secondary·tracking-tight">␍

@repo/people:lint:biome:     105     │ - → → → → → → → → → → → → → → {echo.category}␍

@repo/people:lint:biome:     106     │ - → → → → → → → → → → → → → </Text>␍

@repo/people:lint:biome:     107     │ - → → → → → → → → → → → → </Box>␍

@repo/people:lint:biome:     108     │ - → → → → → → → → → → → → <Box␍

@repo/people:lint:biome:     109     │ - → → → → → → → → → → → → → className={`px-2.5·py-1·rounded-full·border·${␍

@repo/people:lint:biome:     110     │ - → → → → → → → → → → → → → → echo.priority·===·"high"␍

@repo/people:lint:biome:     111     │ - → → → → → → → → → → → → → → → ?·"bg-phase-error/10·border-phase-error/20"␍

@repo/people:lint:biome:     112     │ - → → → → → → → → → → → → → → → :·"bg-phase-interactive/10·border-phase-interactive/20"␍

@repo/people:lint:biome:     113     │ - → → → → → → → → → → → → → }`}␍

@repo/people:lint:biome:     114     │ - → → → → → → → → → → → → >␍

@repo/people:lint:biome:     115     │ - → → → → → → → → → → → → → <Text␍

@repo/people:lint:biome:     116     │ - → → → → → → → → → → → → → → className={`text-[10px]·font-bold·uppercase·${␍

gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:

gurudevi-mobile:lint:biome:   

@repo/people:lint:biome:     117     │ - → → → → → → → → → → → → → → → echo.priority·===·"high"␍

@repo/people:lint:biome:     118     │ - → → → → → → → → → → → → → → → → ?·"text-phase-error"␍

@repo/people:lint:biome:     119     │ - → → → → → → → → → → → → → → → → :·"text-phase-interactive"␍

@repo/people:lint:biome:     120     │ - → → → → → → → → → → → → → → }`}␍

@repo/people:lint:biome:     121     │ - → → → → → → → → → → → → → >␍

@repo/people:lint:biome:     122     │ - → → → → → → → → → → → → → → {echo.priority}␍

@repo/people:lint:biome:     123     │ - → → → → → → → → → → → → → </Text>␍

@repo/people:lint:biome:     124     │ - → → → → → → → → → → → → </Box>␍

@repo/admin:lint:biome:   × Formatter would have printed the following content:
@repo/admin:lint:biome:   

@repo/people:lint:biome:     125     │ - → → → → → → → → → → → → <Box␍

@repo/people:lint:biome:     126     │ - → → → → → → → → → → → → → className={`px-2.5·py-1·rounded-full·border·${␍

@repo/people:lint:biome:     127     │ - → → → → → → → → → → → → → → echo.is_read␍

@repo/people:lint:biome:     128     │ - → → → → → → → → → → → → → → → ?·"bg-phase-success/10·border-phase-success/20"␍

gurudevi-mobile:lint:biome:       1     │ - {␍

gurudevi-mobile:lint:biome:       2     │ - → "expo":·{␍

gurudevi-mobile:lint:biome:       3     │ - → → "name":·"gurudevi-mobile",␍

gurudevi-mobile:lint:biome:       4     │ - → → "slug":·"gurudevi-mobile",␍

gurudevi-mobile:lint:biome:       5     │ - → → "version":·"1.0.2",␍

gurudevi-mobile:lint:biome:       6     │ - → → "orientation":·"portrait",␍

@repo/people:lint:biome:     129     │ - → → → → → → → → → → → → → → → :·"bg-phase-warning/10·border-phase-warning/20"␍

gurudevi-mobile:lint:biome:       7     │ - → → "icon":·"./assets/icon.png",␍

@repo/people:lint:biome:     130     │ - → → → → → → → → → → → → → }`}␍

gurudevi-mobile:lint:biome:       8     │ - → → "userInterfaceStyle":·"light",␍

@repo/people:lint:biome:     131     │ - → → → → → → → → → → → → >␍

@repo/people:lint:biome:     132     │ - → → → → → → → → → → → → → <Text␍

gurudevi-mobile:lint:biome:       9     │ - → → "scheme":·"gurudevi",␍

gurudevi-mobile:lint:biome:      10     │ - → → "splash":·{␍

gurudevi-mobile:lint:biome:      11     │ - → → → "image":·"./assets/splash-icon.png",␍

gurudevi-mobile:lint:biome:      12     │ - → → → "resizeMode":·"contain",␍

gurudevi-mobile:lint:biome:      13     │ - → → → "backgroundColor":·"#ffffff"␍

gurudevi-mobile:lint:biome:      14     │ - → → },␍

@repo/people:lint:biome:     133     │ - → → → → → → → → → → → → → → className={`text-[10px]·font-bold·uppercase·${␍

gurudevi-mobile:lint:biome:      15     │ - → → "ios":·{␍

@repo/people:lint:biome:     134     │ - → → → → → → → → → → → → → → → echo.is_read␍

gurudevi-mobile:lint:biome:      16     │ - → → → "supportsTablet":·true,␍

@repo/admin:lint:biome:       1     │ - export·type·AdminWorkspaceView·=␍

@repo/admin:lint:biome:       2     │ - → |·"main"␍

@repo/people:lint:biome:     135     │ - → → → → → → → → → → → → → → → → ?·"text-phase-success"␍

gurudevi-mobile:lint:biome:      17     │ - → → → "bundleIdentifier":·"org.edlove.gurudevi",␍

gurudevi-mobile:lint:biome:      18     │ - → → → "buildNumber":·"1"␍

gurudevi-mobile:lint:biome:      19     │ - → → },␍

gurudevi-mobile:lint:biome:      20     │ - → → "android":·{␍

@repo/admin:lint:biome:       3     │ - → |·"admin_registry"␍

gurudevi-mobile:lint:biome:      21     │ - → → → "package":·"org.edlove.gurudevi",␍

gurudevi-mobile:lint:biome:      22     │ - → → → "versionCode":·23,␍

gurudevi-mobile:lint:biome:      23     │ - → → → "adaptiveIcon":·{␍

gurudevi-mobile:lint:biome:      24     │ - → → → → "foregroundImage":·"./assets/adaptive-icon.png",␍

gurudevi-mobile:lint:biome:      25     │ - → → → → "backgroundColor":·"#ffffff"␍

gurudevi-mobile:lint:biome:      26     │ - → → → },␍

@repo/admin:lint:biome:       4     │ - → |·"incident_queue"␍

@repo/people:lint:biome:     136     │ - → → → → → → → → → → → → → → → → :·"text-phase-warning"␍

@repo/people:lint:biome:     137     │ - → → → → → → → → → → → → → → }`}␍

@repo/admin:lint:biome:       5     │ - → |·"tenant_detail"␍

gurudevi-mobile:lint:biome:      27     │ - → → → "predictiveBackGestureEnabled":·false,␍

@repo/admin:lint:biome:       6     │ - → |·"authority_repair"␍

@repo/admin:lint:biome:       7     │ - → |·"job_control"␍

gurudevi-mobile:lint:biome:      28     │ - → → → "intentFilters":·[␍
@repo/admin:lint:biome:       8     │ - → |·"audit_log"␍

gurudevi-mobile:lint:biome:      29     │ - → → → → {␍
@repo/admin:lint:biome:       9     │ - → |·"release_control";␍

gurudevi-mobile:lint:biome:      30     │ - → → → → → "action":·"VIEW",␍
@repo/people:lint:biome:     138     │ - → → → → → → → → → → → → → >␍
@repo/admin:lint:biome:      10     │ - ␍
gurudevi-mobile:lint:biome:      31     │ - → → → → → "autoVerify":·true,␍
@repo/people:lint:biome:     139     │ - → → → → → → → → → → → → → → {echo.is_read·?·"read"·:·"pending"}␍

@repo/admin:lint:biome:      11     │ - export·type·AdminZoneId·=␍
gurudevi-mobile:lint:biome:      32     │ - → → → → → "data":·[␍
gurudevi-mobile:lint:biome:      33     │ - → → → → → → {␍

@repo/people:lint:biome:     140     │ - → → → → → → → → → → → → → </Text>␍
@repo/people:lint:biome:     141     │ - → → → → → → → → → → → → </Box>␍
@repo/people:lint:biome:     142     │ - → → → → → → → → → → → </HStack>␍

@repo/people:lint:biome:     143     │ - → → → → → → → → → → </HStack>␍
@repo/admin:lint:biome:      12     │ - → |·"today"␍
gurudevi-mobile:lint:biome:      34     │ - → → → → → → → "scheme":·"gurudevi",␍

@repo/people:lint:biome:     144     │ - ␍
@repo/admin:lint:biome:      13     │ - → |·"work"␍

@repo/admin:lint:biome:      14     │ - → |·"institution"␍
@repo/people:lint:biome:     145     │ - → → → → → → → → → → <Text·className="text-base·text-phase-text-primary·leading-7·font-medium·mb-4">␍
gurudevi-mobile:lint:biome:      35     │ - → → → → → → → "host":·"auth",␍

@repo/people:lint:biome:     146     │ - → → → → → → → → → → → {echo.content}␍
gurudevi-mobile:lint:biome:      36     │ - → → → → → → → "pathPrefix":·"/callback"␍
@repo/admin:lint:biome:      15     │ - → |·"outlook"␍
@repo/people:lint:biome:     147     │ - → → → → → → → → → → </Text>␍
@repo/people:lint:biome:     148     │ - ␍
@repo/admin:lint:biome:      16     │ - → |·"private";␍
@repo/admin:lint:biome:      17     │ - ␍
@repo/admin:lint:biome:      18     │ - export·type·AdminCapabilityId·=␍
@repo/admin:lint:biome:      19     │ - → |·"operator_brief"␍
@repo/admin:lint:biome:      20     │ - → |·"admin_registry"␍
@repo/admin:lint:biome:      21     │ - → |·"incident_queue"␍
gurudevi-mobile:lint:biome:      37     │ - → → → → → → }␍
@repo/admin:lint:biome:      22     │ - → |·"tenant_health"␍
@repo/admin:lint:biome:      23     │ - → |·"support_triage"␍
gurudevi-mobile:lint:biome:      38     │ - → → → → → ],␍
@repo/admin:lint:biome:      24     │ - → |·"authority_integrity"␍
gurudevi-mobile:lint:biome:      39     │ - → → → → → "category":·["BROWSABLE",·"DEFAULT"]␍
@repo/admin:lint:biome:      25     │ - → |·"workspace_integrity"␍
gurudevi-mobile:lint:biome:      40     │ - → → → → },␍
@repo/admin:lint:biome:      26     │ - → |·"tenant_directory"␍
gurudevi-mobile:lint:biome:      41     │ - → → → → {␍
@repo/admin:lint:biome:      27     │ - → |·"operator_actions"␍

@repo/admin:lint:biome:      28     │ - → |·"platform_metrics"␍

@repo/admin:lint:biome:      29     │ - → |·"release_watch"␍

@repo/admin:lint:biome:      30     │ - → |·"audit_trail";␍

@repo/admin:lint:biome:      31     │ - ␍

gurudevi-mobile:lint:biome:      42     │ - → → → → → "action":·"VIEW",␍

gurudevi-mobile:lint:biome:      43     │ - → → → → → "autoVerify":·true,␍

@repo/admin:lint:biome:      32     │ - export·interface·AdminCapabilityMeta·{␍

@repo/people:lint:biome:     149     │ - → → → → → → → → → → <HStack·className="justify-between·items-center·pt-4·border-t·border-phase-surface/50">␍

@repo/admin:lint:biome:      33     │ - → id:·AdminCapabilityId;␍

gurudevi-mobile:lint:biome:      44     │ - → → → → → "data":·[␍

gurudevi-mobile:lint:biome:      45     │ - → → → → → → {␍

gurudevi-mobile:lint:biome:      46     │ - → → → → → → → "scheme":·"gurudevi",␍

@repo/admin:lint:biome:      34     │ - → title:·string;␍

@repo/admin:lint:biome:      35     │ - → description:·string;␍

@repo/people:lint:biome:     150     │ - → → → → → → → → → → → <Text·className="text-[10px]·font-bold·text-phase-text-tertiary·uppercase·tracking-widest">␍

@repo/people:lint:biome:   208 more lines truncated

@repo/people:lint:biome:   

@repo/people:lint:biome: 

@repo/admin:lint:biome:      36     │ - → zone:·AdminZoneId;␍

@repo/admin:lint:biome:      37     │ - → status:·"live"·|·"planned"·|·"hidden";␍

gurudevi-mobile:lint:biome:      47     │ - → → → → → → → "host":·"qr"␍
gurudevi-mobile:lint:biome:      48     │ - → → → → → → }␍

gurudevi-mobile:lint:biome:      49     │ - → → → → → ],␍
gurudevi-mobile:lint:biome:      50     │ - → → → → → "category":·["BROWSABLE",·"DEFAULT"]␍
gurudevi-mobile:lint:biome:      51     │ - → → → → },␍

gurudevi-mobile:lint:biome:      52     │ - → → → → {␍

@repo/admin:lint:biome:      38     │ - → workspaceView?:·AdminWorkspaceView;␍

@repo/people:lint:biome: src\components\TeacherFeedbackModal.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

gurudevi-mobile:lint:biome:      53     │ - → → → → → "action":·"VIEW",␍

gurudevi-mobile:lint:biome:      54     │ - → → → → → "autoVerify":·true,␍

@repo/admin:lint:biome:      39     │ - }␍

@repo/admin:lint:biome:      40     │ - ␍

gurudevi-mobile:lint:biome:      55     │ - → → → → → "data":·[␍

gurudevi-mobile:lint:biome:      56     │ - → → → → → → {␍

gurudevi-mobile:lint:biome:      57     │ - → → → → → → → "scheme":·"https",␍

@repo/admin:lint:biome:      41     │ - const·CAPABILITIES:·Record<AdminCapabilityId,·AdminCapabilityMeta>·=·{␍

gurudevi-mobile:lint:biome:      58     │ - → → → → → → → "host":·"platform.gurudevi.edlove.org",␍

gurudevi-mobile:lint:biome:      59     │ - → → → → → → → "pathPrefix":·"/qr"␍

gurudevi-mobile:lint:biome:      60     │ - → → → → → → },␍

gurudevi-mobile:lint:biome:      61     │ - → → → → → → {␍

gurudevi-mobile:lint:biome:      62     │ - → → → → → → → "scheme":·"https",␍

@repo/admin:lint:biome:      42     │ - → operator_brief:·{␍

@repo/admin:lint:biome:      43     │ - → → id:·"operator_brief",␍

@repo/admin:lint:biome:      44     │ - → → title:·"Operator·Brief",␍

gurudevi-mobile:lint:biome:      63     │ - → → → → → → → "host":·"platform.gurudevi.edlove.org",␍

@repo/admin:lint:biome:      45     │ - → → description:␍

gurudevi-mobile:lint:biome:      64     │ - → → → → → → → "pathPrefix":·"/p"␍

gurudevi-mobile:lint:biome:      65     │ - → → → → → → }␍

gurudevi-mobile:lint:biome:      66     │ - → → → → → ],␍

@repo/admin:lint:biome:      46     │ - → → → "A·daily·cross-tenant·read·on·incidents,·approvals,·maintenance·pressure,·and·dogfood·signals·that·need·attention·now.",␍

gurudevi-mobile:lint:biome:      67     │ - → → → → → "category":·["BROWSABLE",·"DEFAULT"]␍

gurudevi-mobile:lint:biome:      68     │ - → → → → }␍

@repo/admin:lint:biome:      47     │ - → → zone:·"today",␍
gurudevi-mobile:lint:biome:      69     │ - → → → ]␍

gurudevi-mobile:lint:biome:      70     │ - → → },␍

@repo/admin:lint:biome:      48     │ - → → status:·"live",␍

gurudevi-mobile:lint:biome:      71     │ - → → "web":·{

@repo/admin:lint:biome:      49     │ - → },␍

@repo/admin:lint:biome:      50     │ - → admin_registry:·{␍

@repo/admin:lint:biome:      51     │ - → → id:·"admin_registry",␍

@repo/admin:lint:biome:      52     │ - → → title:·"Admin·Registry",␍

@repo/admin:lint:biome:      53     │ - → → description:␍

gurudevi-mobile:lint:biome:      72     │ - → → → "favicon":·"./assets/favicon.png",

@repo/admin:lint:biome:      54     │ - → → → "A·living·registry·of·admin·capabilities,·feature·gates,·and·maintenance·posture·across·the·platform.",␍

gurudevi-mobile:lint:biome:      73     │ - → → → "bundler":·"metro",

@repo/admin:lint:biome:      55     │ - → → zone:·"work",␍

gurudevi-mobile:lint:biome:      74     │ - → → → "baseUrl":·"/",

@repo/admin:lint:biome:      56     │ - → → status:·"live",␍

gurudevi-mobile:lint:biome:      75     │ - → → → "name":·"Gurudevi",

@repo/admin:lint:biome:      57     │ - → → workspaceView:·"admin_registry",␍

@repo/admin:lint:biome:      58     │ - → },␍

@repo/admin:lint:biome:      59     │ - → incident_queue:·{␍

@repo/admin:lint:biome:      60     │ - → → id:·"incident_queue",␍

gurudevi-mobile:lint:biome:      76     │ - → → → "shortName":·"Gurudevi",
gurudevi-mobile:lint:biome:      77     │ - → → → "lang":·"en",

@repo/admin:lint:biome:      61     │ - → → title:·"Incident·Queue",␍

@repo/admin:lint:biome:      62     │ - → → description:␍

gurudevi-mobile:lint:biome:      78     │ - → → → "display":·"standalone",

@repo/admin:lint:biome:      63     │ - → → → "Open·production·incidents,·regressions,·and·support·escalations·that·need·triage·or·escalation.",␍

gurudevi-mobile:lint:biome:      79     │ - → → → "themeColor":·"#D4843A",

@repo/admin:lint:biome:      64     │ - → → zone:·"today",␍

@repo/admin:lint:biome:      65     │ - → → status:·"live",␍

@repo/admin:lint:biome:      66     │ - → → workspaceView:·"incident_queue",␍
@repo/admin:lint:biome:      67     │ - → },␍

@repo/admin:lint:biome:      68     │ - → tenant_health:·{␍

@repo/admin:lint:biome:      69     │ - → → id:·"tenant_health",␍

@repo/admin:lint:biome:      70     │ - → → title:·"Tenant·Health",␍

gurudevi-mobile:lint:biome:      80     │ - → → → "backgroundColor":·"#F5EDD6"

gurudevi-mobile:lint:biome:      81     │ - → → },

gurudevi-mobile:lint:biome:      82     │ - → → "experiments":·{

@repo/admin:lint:biome:      71     │ - → → description:␍

@repo/people:lint:biome:   × Formatter would have printed the following content:

@repo/people:lint:biome:   

@repo/admin:lint:biome:      72     │ - → → → "Cross-tenant·health·summaries·for·auth,·sync,·onboarding,·and·operational·continuity.",␍

@repo/admin:lint:biome:      73     │ - → → zone:·"today",␍

gurudevi-mobile:lint:biome:      83     │ - → → → "baseUrl":·"/"

gurudevi-mobile:lint:biome:      84     │ - → → },

gurudevi-mobile:lint:biome:      85     │ - → → "extra":·{

gurudevi-mobile:lint:biome:      86     │ - → → → "eas":·{

gurudevi-mobile:lint:biome:      87     │ - → → → → "projectId":·"1701dfb9-c59e-45c6-a391-58c061a0b8ce"

gurudevi-mobile:lint:biome:      88     │ - → → → }

gurudevi-mobile:lint:biome:      89     │ - → → },␍

gurudevi-mobile:lint:biome:      90     │ - → → "plugins":·[␍

gurudevi-mobile:lint:biome:      91     │ - → → → "expo-font",␍

gurudevi-mobile:lint:biome:      92     │ - → → → "./plugins/withAndroidCruncherDisabled",␍

@repo/admin:lint:biome:      74     │ - → → status:·"live",␍

@repo/admin:lint:biome:      75     │ - → },␍

gurudevi-mobile:lint:biome:      93     │ - → → → "./plugins/withGradleProperties",␍
@repo/admin:lint:biome:      76     │ - → support_triage:·{␍

@repo/admin:lint:biome:      77     │ - → → id:·"support_triage",␍
@repo/admin:lint:biome:      78     │ - → → title:·"Support·Triage",␍
@repo/admin:lint:biome:      79     │ - → → description:␍

gurudevi-mobile:lint:biome:      94     │ - → → → "expo-localization",␍

gurudevi-mobile:lint:biome:      95     │ - → → → "expo-asset",␍

gurudevi-mobile:lint:biome:      96     │ - → → → "expo-audio",␍

gurudevi-mobile:lint:biome:      97     │ - → → → "expo-secure-store",␍

@repo/admin:lint:biome:      80     │ - → → → "Cases·that·need·classification,·owner·assignment,·and·follow-up.",␍

gurudevi-mobile:lint:biome:      98     │ - → → → [␍

gurudevi-mobile:lint:biome:      99     │ - → → → → "@sentry/react-native/expo",␍

@repo/admin:lint:biome:      81     │ - → → zone:·"work",␍

@repo/admin:lint:biome:      82     │ - → → status:·"live",␍

@repo/admin:lint:biome:      83     │ - → },␍

@repo/admin:lint:biome:      84     │ - → authority_integrity:·{␍

@repo/admin:lint:biome:      85     │ - → → id:·"authority_integrity",␍

gurudevi-mobile:lint:biome:     100     │ - → → → → {␍

@repo/admin:lint:biome:      86     │ - → → title:·"Authority·Integrity",␍

@repo/admin:lint:biome:      87     │ - → → description:␍

@repo/admin:lint:biome:      88     │ - → → → "Role·assignment·and·POA·anomalies·that·could·expose·the·wrong·workspace·or·block·access·across·tenants.",␍

gurudevi-mobile:lint:biome:     101     │ - → → → → → "url":·"https://sentry.io/",␍

@repo/admin:lint:biome:      89     │ - → → zone:·"work",␍

@repo/admin:lint:biome:      90     │ - → → status:·"live",␍

@repo/admin:lint:biome:      91     │ - → → workspaceView:·"authority_repair",␍

@repo/admin:lint:biome:      92     │ - → },␍

gurudevi-mobile:lint:biome:     102     │ - → → → → → "project":·"gurudevi-mobile",␍

gurudevi-mobile:lint:biome:     103     │ - → → → → → "organization":·"intuitui-labs",␍

gurudevi-mobile:lint:biome:     104     │ - → → → → → "uploadNativeSymbols":·false,␍

@repo/admin:lint:biome:      93     │ - → workspace_integrity:·{␍

gurudevi-mobile:lint:biome:     105     │ - → → → → → "autoUploadNativeSymbols":·false,␍

@repo/admin:lint:biome:      94     │ - → → id:·"workspace_integrity",␍

@repo/admin:lint:biome:      95     │ - → → title:·"Workspace·Integrity",␍

@repo/admin:lint:biome:      96     │ - → → description:␍

@repo/admin:lint:biome:      97     │ - → → → "Layout-sync·and·canvas·drift·checks·for·demo,·web,·and·native·parity·across·the·platform.",␍

gurudevi-mobile:lint:biome:     106     │ - → → → → → "autoUpload":·false,␍

@repo/admin:lint:biome:      98     │ - → → zone:·"work",␍

@repo/admin:lint:biome:      99     │ - → → status:·"live",␍

gurudevi-mobile:lint:biome:     107     │ - → → → → → "uploadSourceMaps":·false␍

@repo/people:lint:biome:       1     │ - import·SanctuaryModal·from·"@repo/ui/components/SanctuaryModal";␍

@repo/people:lint:biome:       2     │ - import·{␍

@repo/people:lint:biome:       3     │ - → Box,␍

@repo/people:lint:biome:       4     │ - → Button,␍

gurudevi-mobile:lint:biome:     108     │ - → → → → }␍

@repo/admin:lint:biome:     100     │ - → },␍

@repo/admin:lint:biome:     101     │ - → tenant_directory:·{␍

@repo/admin:lint:biome:     102     │ - → → id:·"tenant_directory",␍

@repo/people:lint:biome:       5     │ - → ButtonText,␍

gurudevi-mobile:lint:biome:     109     │ - → → → ],␍

gurudevi-mobile:lint:biome:     110     │ - → → → "expo-web-browser",␍

@repo/people:lint:biome:       6     │ - → HStack,␍

@repo/people:lint:biome:       7     │ - → Icon,␍

@repo/admin:lint:biome:     103     │ - → → title:·"Tenant·Directory",␍

@repo/people:lint:biome:       8     │ - → Select,␍

gurudevi-mobile:lint:biome:     111     │ - → → → "expo-image",␍

@repo/people:lint:biome:       9     │ - → SelectBackdrop,␍

@repo/people:lint:biome:      10     │ - → SelectContent,␍

gurudevi-mobile:lint:biome:     112     │ - → → → "expo-router",␍

@repo/people:lint:biome:      11     │ - → SelectIcon,␍

@repo/admin:lint:biome:     104     │ - → → description:␍

@repo/people:lint:biome:      12     │ - → SelectInput,␍

@repo/people:lint:biome:      13     │ - → SelectItem,␍

@repo/people:lint:biome:      14     │ - → SelectPortal,␍

@repo/people:lint:biome:      15     │ - → SelectTrigger,␍
gurudevi-mobile:lint:biome:     113     │ - → → → "expo-sharing",␍

@repo/admin:lint:biome:     105     │ - → → → "Searchable·school·and·tenancy·registry·for·support,·governance,·and·lifecycle·handling.",␍

gurudevi-mobile:lint:biome:     114     │ - → → → "expo-sqlite",␍

@repo/people:lint:biome:      16     │ - → Spinner,␍

@repo/admin:lint:biome:     106     │ - → → zone:·"institution",␍

@repo/people:lint:biome:      17     │ - → Text,␍

gurudevi-mobile:lint:biome:     115     │ - → → → "expo-video"␍

@repo/people:lint:biome:      18     │ - → Textarea,␍
@repo/admin:lint:biome:     107     │ - → → status:·"live",␍

@repo/admin:lint:biome:     108     │ - → → workspaceView:·"tenant_detail",␍
@repo/people:lint:biome:      19     │ - → TextareaInput,␍

@repo/admin:lint:biome:     109     │ - → },␍

@repo/admin:lint:biome:     110     │ - → operator_actions:·{␍

@repo/people:lint:biome:      20     │ - → VStack,␍

@repo/admin:lint:biome:     111     │ - → → id:·"operator_actions",␍

gurudevi-mobile:lint:biome:     116     │ - → → ],␍

@repo/admin:lint:biome:     112     │ - → → title:·"Operator·Actions",␍

@repo/admin:lint:biome:     113     │ - → → description:␍

@repo/admin:lint:biome:     114     │ - → → → "Guarded·interventions·such·as·retries,·resyncs,·repairs,·and·other·remediation·tasks·with·explicit·accountability.",␍

@repo/people:lint:biome:      21     │ - }·from·"@repo/ui/primitives";␍

@repo/people:lint:biome:      22     │ - import·{␍

gurudevi-mobile:lint:biome:     117     │ - → → "owner":·"neevsk",␍

@repo/admin:lint:biome:     115     │ - → → zone:·"institution",␍

@repo/admin:lint:biome:     116     │ - → → status:·"live",␍

@repo/people:lint:biome:      23     │ - → AlertTriangle,␍
gurudevi-mobile:lint:biome:     118     │ - → → "runtimeVersion":·{␍

gurudevi-mobile:lint:biome:     119     │ - → → → "policy":·"appVersion"␍

@repo/people:lint:biome:      24     │ - → CheckCircle2,␍

@repo/people:lint:biome:      25     │ - → ChevronDown,␍

@repo/admin:lint:biome:     117     │ - → → workspaceView:·"job_control",␍

@repo/people:lint:biome:      26     │ - → Heart,␍

@repo/people:lint:biome:      27     │ - → MessageSquare,␍

@repo/people:lint:biome:      28     │ - }·from·"lucide-react-native";␍

@repo/admin:lint:biome:     118     │ - → },␍

@repo/people:lint:biome:      29     │ - import·{·useState·}·from·"react";␍

gurudevi-mobile:lint:biome:     120     │ - → → },␍

gurudevi-mobile:lint:biome:     121     │ - → → "updates":·{␍

@repo/admin:lint:biome:     119     │ - → platform_metrics:·{␍

@repo/people:lint:biome:      30     │ - import·{·useTranslation·}·from·"react-i18next";␍

@repo/admin:lint:biome:     120     │ - → → id:·"platform_metrics",␍

@repo/admin:lint:biome:     121     │ - → → title:·"Platform·Metrics",␍

@repo/people:lint:biome:      31     │ - import·{·teacherFeedbackAPI·}·from·"../feedback";␍

gurudevi-mobile:lint:biome:     122     │ - → → → "url":·"https://u.expo.dev/1701dfb9-c59e-45c6-a391-58c061a0b8ce"␍

@repo/people:lint:biome:      32     │ - ␍

gurudevi-mobile:lint:biome:     123     │ - → → }␍

gurudevi-mobile:lint:biome:     124     │ - → }␍

gurudevi-mobile:lint:biome:     125     │ - }␍

@repo/admin:lint:biome:     122     │ - → → description:␍

@repo/people:lint:biome:      33     │ - interface·TeacherFeedbackModalProps·{␍

@repo/admin:lint:biome:     123     │ - → → → "Daily·and·weekly·platform·signal:·usage,·adoption,·error·pressure,·and·operator·load.",␍

@repo/people:lint:biome:      34     │ - → isOpen:·boolean;␍

@repo/admin:lint:biome:     124     │ - → → zone:·"outlook",␍

gurudevi-mobile:lint:biome:           1 │ + {

@repo/admin:lint:biome:     125     │ - → → status:·"live",␍

gurudevi-mobile:lint:biome:           2 │ + ··"expo":·{

@repo/admin:lint:biome:     126     │ - → },␍

@repo/people:lint:biome:      35     │ - → onClose:·()·=>·void;␍

gurudevi-mobile:lint:biome:           3 │ + ····"name":·"gurudevi-mobile",

@repo/admin:lint:biome:     127     │ - → release_watch:·{␍

@repo/admin:lint:biome:     128     │ - → → id:·"release_watch",␍

gurudevi-mobile:lint:biome:           4 │ + ····"slug":·"gurudevi-mobile",

@repo/people:lint:biome:      36     │ - → schoolId:·string;␍

gurudevi-mobile:lint:biome:           5 │ + ····"version":·"1.0.2",

@repo/people:lint:biome:      37     │ - → teacherId:·string;␍

@repo/people:lint:biome:      38     │ - }␍

@repo/people:lint:biome:      39     │ - ␍

gurudevi-mobile:lint:biome:           6 │ + ····"orientation":·"portrait",

gurudevi-mobile:lint:biome:           7 │ + ····"icon":·"./assets/icon.png",

gurudevi-mobile:lint:biome:           8 │ + ····"userInterfaceStyle":·"light",

@repo/admin:lint:biome:     129     │ - → → title:·"Release·Watch",␍
@repo/admin:lint:biome:     130     │ - → → description:␍
@repo/admin:lint:biome:     131     │ - → → → "Deploy·posture,·migrations,·and·feature-flag·watchpoints·for·platform·changes.",␍
@repo/admin:lint:biome:     132     │ - → → zone:·"outlook",␍

@repo/admin:lint:biome:     133     │ - → → status:·"live",␍
@repo/admin:lint:biome:     134     │ - → → workspaceView:·"release_control",␍
@repo/admin:lint:biome:     135     │ - → },␍
@repo/admin:lint:biome:     136     │ - → audit_trail:·{␍
@repo/admin:lint:biome:     137     │ - → → id:·"audit_trail",␍
@repo/admin:lint:biome:     138     │ - → → title:·"Audit·Trail",␍
@repo/admin:lint:biome:     139     │ - → → description:␍
@repo/admin:lint:biome:     140     │ - → → → "A·private·log·of·interventions,·approvals,·and·operator·decisions·for·accountability·and·postmortems.",␍
@repo/admin:lint:biome:     141     │ - → → zone:·"private",␍
@repo/admin:lint:biome:     142     │ - → → status:·"live",␍

@repo/people:lint:biome:      40     │ - const·CATEGORIES·=·[␍
@repo/people:lint:biome:      41     │ - → {·label:·"Teaching·Support",·value:·"support",·icon:·MessageSquare·},␍
@repo/people:lint:biome:      42     │ - → {·label:·"Staff·Morale",·value:·"morale",·icon:·Heart·},␍
@repo/people:lint:biome:      43     │ - → {·label:·"Facility/Resource·Alert",·value:·"facility",·icon:·AlertTriangle·},␍

@repo/people:lint:biome:      44     │ - → {␍
@repo/people:lint:biome:      45     │ - → → label:·"Recognition/Positive·Note",␍
@repo/people:lint:biome:      46     │ - → → value:·"recognition",␍
@repo/people:lint:biome:      47     │ - → → icon:·CheckCircle2,␍
@repo/people:lint:biome:      48     │ - → },␍
@repo/people:lint:biome:      49     │ - ];␍
@repo/people:lint:biome:      50     │ - ␍
@repo/people:lint:biome:      51     │ - export·default·function·TeacherFeedbackModal({␍

gurudevi-mobile:lint:biome:           9 │ + ····"scheme":·"gurudevi",
gurudevi-mobile:lint:biome:          10 │ + ····"splash":·{

gurudevi-mobile:lint:biome:          11 │ + ······"image":·"./assets/splash-icon.png",
gurudevi-mobile:lint:biome:          12 │ + ······"resizeMode":·"contain",
gurudevi-mobile:lint:biome:          13 │ + ······"backgroundColor":·"#ffffff"
gurudevi-mobile:lint:biome:          14 │ + ····},

@repo/admin:lint:biome:     143     │ - → → workspaceView:·"audit_log",␍

@repo/admin:lint:biome:     144     │ - → },␍

@repo/admin:lint:biome:     145     │ - };␍

@repo/admin:lint:biome:     146     │ - ␍

@repo/admin:lint:biome:     147     │ - export·function·getAdminCapabilityMeta(␍

@repo/people:lint:biome:      52     │ - → isOpen,␍

gurudevi-mobile:lint:biome:          15 │ + ····"ios":·{

gurudevi-mobile:lint:biome:          16 │ + ······"supportsTablet":·true,

@repo/admin:lint:biome:     148     │ - → capabilityId:·string,␍

@repo/people:lint:biome:      53     │ - → onClose,␍

@repo/people:lint:biome:      54     │ - → schoolId,␍

@repo/people:lint:biome:      55     │ - → teacherId,␍

@repo/people:lint:biome:      56     │ - }:·TeacherFeedbackModalProps)·{␍

@repo/admin:lint:biome:     149     │ - ):·AdminCapabilityMeta·|·undefined·{␍
@repo/admin:lint:biome:     150     │ - → return·CAPABILITIES[capabilityId·as·AdminCapabilityId];␍

@repo/admin:lint:biome:   154 more lines truncated
@repo/admin:lint:biome:   
@repo/admin:lint:biome: 
@repo/admin:lint:biome: src\analytics\api.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/admin:lint:biome: 

@repo/people:lint:biome:      57     │ - → const·{·t·}·=·useTranslation();␍
@repo/people:lint:biome:      58     │ - → const·[category,·setCategory]·=·useState<string>("support");␍

@repo/people:lint:biome:      59     │ - → const·[content,·setContent]·=·useState("");␍
@repo/people:lint:biome:      60     │ - → const·[priority,·setPriority]·=·useState<"low"·|·"medium"·|·"high">("medium");␍
@repo/people:lint:biome:      61     │ - → const·[isSubmitting,·setIsSubmitting]·=·useState(false);␍
@repo/people:lint:biome:      62     │ - ␍
@repo/people:lint:biome:      63     │ - → const·handleSubmit·=·async·()·=>·{␍
@repo/people:lint:biome:      64     │ - → → if·(!content.trim())·return;␍
@repo/people:lint:biome:      65     │ - ␍
@repo/people:lint:biome:      66     │ - → → setIsSubmitting(true);␍
@repo/people:lint:biome:      67     │ - → → try·{␍
@repo/people:lint:biome:      68     │ - → → → const·ok·=·await·teacherFeedbackAPI.submitTeacherFeedback({␍

@repo/people:lint:biome:      69     │ - → → → → schoolId,␍
@repo/people:lint:biome:      70     │ - → → → → teacherId,␍
@repo/people:lint:biome:      71     │ - → → → → category,␍

@repo/people:lint:biome:      72     │ - → → → → content,␍

@repo/people:lint:biome:      73     │ - → → → → priority,␍

@repo/people:lint:biome:      74     │ - → → → });␍

@repo/people:lint:biome:      75     │ - → → → if·(!ok)·return;␍

@repo/people:lint:biome:      76     │ - ␍

@repo/people:lint:biome:      77     │ - → → → onClose();␍

@repo/people:lint:biome:      78     │ - → → → setContent("");␍

@repo/people:lint:biome:      79     │ - → → }·finally·{␍

@repo/people:lint:biome:      80     │ - → → → setIsSubmitting(false);␍

@repo/people:lint:biome:      81     │ - → → }␍

@repo/people:lint:biome:      82     │ - → };␍

@repo/people:lint:biome:      83     │ - ␍

@repo/people:lint:biome:      84     │ - → const·footer·=·(␍

gurudevi-mobile:lint:biome:          17 │ + ······"bundleIdentifier":·"org.edlove.gurudevi",

gurudevi-mobile:lint:biome:          18 │ + ······"buildNumber":·"1"

gurudevi-mobile:lint:biome:          19 │ + ····},

gurudevi-mobile:lint:biome:          20 │ + ····"android":·{

gurudevi-mobile:lint:biome:          21 │ + ······"package":·"org.edlove.gurudevi",

gurudevi-mobile:lint:biome:          22 │ + ······"versionCode":·23,

gurudevi-mobile:lint:biome:          23 │ + ······"adaptiveIcon":·{

gurudevi-mobile:lint:biome:          24 │ + ········"foregroundImage":·"./assets/adaptive-icon.png",

gurudevi-mobile:lint:biome:          25 │ + ········"backgroundColor":·"#ffffff"

gurudevi-mobile:lint:biome:   101 more lines truncated

gurudevi-mobile:lint:biome:   

gurudevi-mobile:lint:biome: 

gurudevi-mobile:lint:biome: supabase\functions\ocr-proxy\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gurudevi-mobile:lint:biome: 

@repo/people:lint:biome:      85     │ - → → <HStack·className="gap-4·w-full">␍

@repo/admin:lint:biome:   × Formatter would have printed the following content:

@repo/admin:lint:biome:   

@repo/people:lint:biome:      86     │ - → → → <Button␍

@repo/people:lint:biome:      87     │ - → → → → variant="outline"␍

@repo/people:lint:biome:      88     │ - → → → → onPress={onClose}␍

@repo/people:lint:biome:      89     │ - → → → → className="flex-1·border-phase-surface·rounded-2xl·h-14"␍

@repo/people:lint:biome:      90     │ - → → → >␍

@repo/people:lint:biome:      91     │ - → → → → <ButtonText·className="text-phase-text-secondary·font-bold">␍

@repo/people:lint:biome:      92     │ - → → → → → {t("common.cancel")}␍

@repo/people:lint:biome:      93     │ - → → → → </ButtonText>␍

@repo/people:lint:biome:      94     │ - → → → </Button>␍

@repo/people:lint:biome:      95     │ - → → → <Button␍

@repo/people:lint:biome:      96     │ - → → → → onPress={handleSubmit}␍

@repo/people:lint:biome:      97     │ - → → → → isDisabled={isSubmitting·||·!content.trim()}␍

@repo/people:lint:biome:      98     │ - → → → → className={`flex-[2]·rounded-2xl·h-14·shadow-lg·${␍

@repo/people:lint:biome:      99     │ - → → → → → priority·===·"high"␍

@repo/people:lint:biome:     100     │ - → → → → → → ?·"bg-phase-error·shadow-error/20"␍

@repo/people:lint:biome:     101     │ - → → → → → → :·"bg-phase-interactive·shadow-blue-500/20"␍

@repo/people:lint:biome:     102     │ - → → → → }`}␍

@repo/admin:lint:biome:       1     │ - import·{·multiTenantAnalyticsEngine·}·from·"./engine";␍

@repo/people:lint:biome:     103     │ - → → → >␍

@repo/people:lint:biome:     104     │ - → → → → {isSubmitting·?·(␍

@repo/people:lint:biome:     105     │ - → → → → → <Spinner·className="text-white"·/>␍

@repo/people:lint:biome:     106     │ - → → → → )·:·(␍

@repo/admin:lint:biome:       2     │ - import·type·{␍

@repo/admin:lint:biome:       3     │ - → Anomaly,␍

@repo/people:lint:biome:     107     │ - → → → → → <ButtonText·className="text-white·font-bold">␍

@repo/admin:lint:biome:       4     │ - → BenchmarkInsights,␍

@repo/people:lint:biome:     108     │ - → → → → → → {t("common.send")}␍

@repo/people:lint:biome:     109     │ - → → → → → </ButtonText>␍

@repo/people:lint:biome:     110     │ - → → → → )}␍

@repo/admin:lint:biome:       5     │ - → BenchmarkReport,␍

@repo/admin:lint:biome:       6     │ - → CustomReportConfig,␍

@repo/admin:lint:biome:       7     │ - → DateRange,␍

@repo/people:lint:biome:     111     │ - → → → </Button>␍

@repo/people:lint:biome:     112     │ - → → </HStack>␍

@repo/people:lint:biome:     113     │ - → );␍

@repo/people:lint:biome:     114     │ - ␍

@repo/admin:lint:biome:       8     │ - → EducationSector,␍

@repo/people:lint:biome:     115     │ - → return·(␍

@repo/people:lint:biome:     116     │ - → → <SanctuaryModal␍

@repo/admin:lint:biome:       9     │ - → Insight,␍

@repo/admin:lint:biome:      10     │ - → LiveMetrics,␍

@repo/admin:lint:biome:      11     │ - → MetricDefinition,␍

@repo/admin:lint:biome:      12     │ - → Prediction,␍

@repo/admin:lint:biome:      13     │ - → ReportResult,␍

@repo/admin:lint:biome:      14     │ - → TenantComparison,␍

@repo/people:lint:biome:     117     │ - → → → isOpen={isOpen}␍

@repo/admin:lint:biome:      15     │ - → TenantMetrics,␍

@repo/admin:lint:biome:      16     │ - → Trend,␍

@repo/admin:lint:biome:      17     │ - }·from·"./types";␍

@repo/admin:lint:biome:      18     │ - ␍

gurudevi-mobile:lint:biome:   × Formatter would have printed the following content:
gurudevi-mobile:lint:biome:   

@repo/admin:lint:biome:      19     │ - export·interface·MultiTenantAnalyticsAPI·{␍

@repo/admin:lint:biome:      20     │ - → //·Data·aggregation␍

@repo/people:lint:biome:     118     │ - → → → onClose={onClose}␍

@repo/admin:lint:biome:      21     │ - → aggregateTenantMetrics(␍

@repo/people:lint:biome:     119     │ - → → → title={t("teacher.feedback.title")}␍

@repo/admin:lint:biome:      22     │ - → → tenantIds:·string[],␍

@repo/admin:lint:biome:      23     │ - → → timeRange:·DateRange,␍

@repo/admin:lint:biome:      24     │ - → ):·Promise<TenantMetrics[]>;␍

@repo/admin:lint:biome:      25     │ - → compareTenantPerformance(␍

@repo/admin:lint:biome:      26     │ - → → tenantIds:·string[],␍

@repo/admin:lint:biome:      27     │ - → → metrics:·MetricDefinition[],␍

@repo/admin:lint:biome:      28     │ - → → industry:·EducationSector,␍

@repo/admin:lint:biome:      29     │ - → ):·Promise<TenantComparison[]>;␍

@repo/people:lint:biome:     120     │ - → → → subtitle={t("teacher.feedback.subtitle")}␍

@repo/people:lint:biome:     121     │ - → → → footer={footer}␍

@repo/people:lint:biome:     122     │ - → → >␍

@repo/people:lint:biome:     123     │ - → → → <VStack·className="gap-6·pt-4">␍

@repo/admin:lint:biome:      30     │ - → generateBenchmarkReports(␍

@repo/people:lint:biome:     124     │ - → → → → {/*·Category·selection·*/}␍

@repo/people:lint:biome:     125     │ - → → → → <VStack·className="gap-2">␍

apps-intuitui-web:lint:biome: cache miss, executing f9052981fddcec47

@repo/self:lint:biome: cache miss, executing 6cf809468fb45fee

@repo/graphics:lint:biome: cache miss, executing f36bc58120dc1eb4

@repo/community:lint:biome: cache miss, executing 287a4f22f7c3725a

@repo/analytics:lint:biome: cache miss, executing 4268c6615d808491

gurudevi-mobile:lint:biome:       1     │ - /**␍

gurudevi-mobile:lint:biome:       2     │ - ·*·ocr-proxy··Supabase·Edge·Function·(Deno)␍

gurudevi-mobile:lint:biome:       3     │ - ·*␍

@repo/core:lint:biome: cache miss, executing 44c5f882eeba499f

gurudevi-mobile:lint:biome:       4     │ - ·*·Routes·cloud·OCR·requests·to·Google·Vision·or·OpenAI·GPT-4o·Vision.␍

@repo/types-shim:lint:biome: cache miss, executing ac34e6ee91a0e6f8

@repo/classroom:lint:biome: cache miss, executing 84c04e2bcd469838

@repo/database:lint:biome: cache miss, executing d9d4d13c81bdf6ee

@repo/workforce:lint:biome: cache miss, executing dca4e46301a81100

@repo/ui:lint:biome: cache miss, executing 86db6431757c3e89

@repo/form-builder:lint:biome: cache miss, executing f7fbffc52ff82307

@repo/scanner-kit:lint:biome: cache miss, executing b8d044a7b4eee9e7

@repo/ai:lint:biome: cache miss, executing 00bce98a8cb61fd1

@repo/platform-mcp:lint:biome: cache miss, executing ebc5ea68cd34fcf4

@repo/accounting:lint:biome: cache miss, executing 995ed8692e0201ea

apps-neevsk-web:lint:eslint: cache miss, executing 757070a66fa7f0d5

apps-intuitui-web:lint:eslint: cache miss, executing d1c0bb1ae68a35fe

@repo/platform-mcp:lint:eslint: cache miss, executing a0c95ee935d3cd8a

apps-edlove-web:lint:eslint: cache miss, executing f2ba009c82f544f1

@repo/types-shim:lint:eslint: cache miss, executing 5c744b3ade703182

 ERROR  @repo/library#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\library) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run lint:biome exited (1)


 Tasks:    0 successful, 31 total
Cached:    0 cached, 31 total
  Time:    4.796s 
Failed:    @repo/library#lint:biome


 ERROR  run failed: command  exited (1)

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-07T06:06:38.320Z

>>> Command: pnpm turbo run check-types

--------------------------------------------------------------------------------

• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 29 packages
   • Remote caching disabled


apps-edlove-web:check-types: cache hit, replaying logs 44a2478e23a05b25

apps-intuitui-web:check-types: cache hit, replaying logs 91335ad6b8df1ebb

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec tsc --noEmit
apps-intuitui-web:check-types: 

@repo/schema:check-types: cache hit, replaying logs d6890f92e1f66060

apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec tsc --noEmit
apps-edlove-web:check-types: 

@repo/types-shim:check-types: cache hit, replaying logs 03796218bccd746b

@repo/schema:check-types: 
@repo/schema:check-types: > @repo/schema@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\schema
@repo/schema:check-types: > pnpm exec tsc --noEmit
@repo/schema:check-types: 

@repo/types-shim:check-types: 
@repo/types-shim:check-types: > @repo/types-shim@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\types-shim

@repo/types-shim:check-types: > pnpm exec tsc --noEmit
@repo/types-shim:check-types: 

@repo/platform-mcp:check-types: cache hit, replaying logs 9b812937a64c4ee4

apps-neevsk-web:check-types: cache hit, replaying logs 1c3136473ca7f791

@repo/platform-mcp:check-types: 
@repo/platform-mcp:check-types: > @repo/platform-mcp@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\platform-mcp
@repo/platform-mcp:check-types: > pnpm exec tsc --noEmit
@repo/platform-mcp:check-types: 

apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec tsc --noEmit

apps-neevsk-web:check-types: 

@repo/database:check-types: cache hit, replaying logs 1eea30aa4f408695

@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\database

@repo/database:check-types: > pnpm exec tsc --noEmit
@repo/database:check-types: 

@repo/core:check-types: cache hit, replaying logs 95c51f72cc6c689f

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit

@repo/core:check-types: 

@repo/ui:check-types: cache hit, replaying logs a6d6943922c50487

@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm exec tsc --noEmit
@repo/ui:check-types: 

@intuitui-labs/lk-edu-geo:check-types: cache hit, replaying logs 2cb676febc744c55

@intuitui-labs/lk-edu-geo:check-types: 
@repo/accounting:check-types: cache hit, replaying logs 7431a7c21c9ae936

@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: 
@repo/accounting:check-types: 
@repo/accounting:check-types: > @repo/accounting@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:check-types: > pnpm exec tsc --noEmit
@repo/accounting:check-types: 
@repo/scanner-kit:check-types: cache miss, executing c9890ecfa13fe5e7
@repo/people:check-types: cache miss, executing ac8835c0a6af5b03

@repo/ai:check-types: cache miss, executing 5024b90754d11a63

@repo/workforce:check-types: cache miss, executing 0560170e4d3d8cce

@repo/graphics:check-types: cache miss, executing a3698bac837c51e7

@repo/payments:check-types: cache miss, executing c505f10e20c19d0e

@repo/workforce:check-types: 
@repo/workforce:check-types: > @repo/workforce@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:check-types: > pnpm exec tsc --noEmit
@repo/workforce:check-types: 

@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > pnpm exec tsc --noEmit
@repo/ai:check-types: 

@repo/graphics:check-types: 
@repo/graphics:check-types: > @repo/graphics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:check-types: > pnpm exec tsc --noEmit
@repo/graphics:check-types: 

@repo/payments:check-types: 
@repo/payments:check-types: > @repo/payments@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:check-types: > pnpm exec tsc --noEmit
@repo/payments:check-types: 

@repo/people:check-types: 
@repo/people:check-types: > @repo/people@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: > pnpm exec tsc --noEmit
@repo/people:check-types: 

@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: > @repo/scanner-kit@0.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\scanner-kit
@repo/scanner-kit:check-types: > pnpm exec tsc --noEmit
@repo/scanner-kit:check-types: 

@repo/analytics:check-types: cache miss, executing d91aa8f1e3174213

@repo/library:check-types: cache miss, executing e202045c875fcbf1

@repo/form-builder:check-types: cache miss, executing 9bb4d5ce68d9b6bc
@repo/profile:check-types: cache miss, executing 37081cfa90351a7d

@repo/analytics:check-types: 
@repo/library:check-types: 
@repo/analytics:check-types: > @repo/analytics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\analytics
@repo/library:check-types: > @repo/library@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\library
@repo/analytics:check-types: > pnpm exec tsc --noEmit

@repo/library:check-types: > pnpm exec tsc --noEmit
@repo/analytics:check-types: 
@repo/library:check-types: 

@repo/form-builder:check-types: 
@repo/form-builder:check-types: > @repo/form-builder@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:check-types: > pnpm exec tsc --noEmit
@repo/form-builder:check-types: 

@repo/profile:check-types: 
@repo/profile:check-types: > @repo/profile@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:check-types: > pnpm exec tsc --noEmit
@repo/profile:check-types: 

apps-gurudevi-marketing-web:check-types: cache miss, executing 0a7343ebf90eb3aa

apps-gurudevi-marketing-web:check-types: 
apps-gurudevi-marketing-web:check-types: > apps-gurudevi-marketing-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:check-types: > pnpm exec tsc --noEmit
apps-gurudevi-marketing-web:check-types: 

@repo/self:check-types: cache miss, executing d70e1413f20d57d9

@repo/self:check-types: 
@repo/self:check-types: > @repo/self@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: > pnpm exec tsc --noEmit
@repo/self:check-types: 

@repo/community:check-types: cache miss, executing cff770c0be7cc5ac

@repo/community:check-types: 
@repo/community:check-types: > @repo/community@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\community
@repo/community:check-types: > pnpm exec tsc --noEmit
@repo/community:check-types: 

@repo/admin:check-types: cache miss, executing a2bda74afa23d30d

@repo/admin:check-types: 
@repo/admin:check-types: > @repo/admin@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\admin
@repo/admin:check-types: > pnpm exec tsc --noEmit
@repo/admin:check-types: 

@repo/classroom:check-types: cache miss, executing 50c1bc46651c1ef9

@repo/classroom:check-types: 
@repo/classroom:check-types: > @repo/classroom@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\classroom
@repo/classroom:check-types: > pnpm exec tsc --noEmit
@repo/classroom:check-types: 

gurudevi-mobile:check-types: cache miss, executing de291fff9f901247

gurudevi-mobile:check-types: 
gurudevi-mobile:check-types: > gurudevi-mobile@1.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile
gurudevi-mobile:check-types: > pnpm exec tsc --noEmit
gurudevi-mobile:check-types: 


 Tasks:    27 successful, 27 total
Cached:    11 cached, 27 total
  Time:    3m10.055s 



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 191.5s
Findings: 0
Log File: reports/check-types.txt
--------------------------------------------------------------------------------


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-07T06:09:50.999Z

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
  error no-circular: packages/core/src/logic/managers/NotificationManager.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/NotificationManager.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/NotificationManager.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/hooks/useNotifications.ts → 
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/hooks/useNotifications.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts

x 78 dependency violations (9 errors, 69 warnings). 1951 modules, 6308 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 8.6s

Findings: 9

Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

❌ Circular Dependencies check failed!
--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-07T06:10:00.478Z

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
  error no-circular: packages/core/src/logic/managers/NotificationManager.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/NotificationManager.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/NotificationManager.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/hooks/useNotifications.ts → 
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/hooks/useNotifications.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts

x 78 dependency violations (9 errors, 69 warnings). 1951 modules, 6308 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 8.6s
Findings: 62

Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-07T06:10:09.895Z

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
  error no-circular: packages/core/src/logic/managers/NotificationManager.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/NotificationManager.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/NotificationManager.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/hooks/useNotifications.ts → 
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/hooks/useNotifications.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts

x 78 dependency violations (9 errors, 69 warnings). 1951 modules, 6308 dependencies cruised.



--------------------------------------------------------------------------------
AUDIT SUMMARY

Duration: 8.6s
Findings: 79
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


>>> Starting Sovereign Audit: 2026-05-07T06:10:19.408Z

>>> Command: node scripts/check-identity-alignment.mjs

--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 0.41s. Found 0 potential alignment issues.



[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 0.9s

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
