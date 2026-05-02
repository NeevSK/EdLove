# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/1/2026, 6:45:45 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm dlx gitleaks detect --source . --verbose
> **Duration:** 143.3s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 14 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 60 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 6 |
| packages/analytics | 21 |
| packages/core | 15 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/scanner-kit | 3 |
| packages/trube-art | 3 |
| packages/ui | 24 |

## Detailed Findings

### Category: General
- apps-intuitui-web:check-types: - 0 errors
- apps-intuitui-web:check-types: - 0 warnings
- apps-edlove-web:check-types: - 0 errors
- apps-edlove-web:check-types: - 0 warnings
- apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m47[0m:[93m20[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
- apps-neevsk-web:check-types: - 0 errors
- apps-neevsk-web:check-types: - 0 warnings
- @repo/ai:check-types: src/hooks/useAIAgent.ts(214,35): error TS2551: Property 'getSession' does not exist on type '{ getAuthSession(): Promise<Session | null>; getAuthUser(): Promise<User>; signIn(email: string, password: string): Promise<{ user: User; session: Session; weakPassword?: WeakPassword | undefined; }>; ... 8 more ...; deleteAccount(): Promise<...>; }'. Did you mean 'setSession'?
- ERROR
- ERROR  run failed: command  exited (2)
- x 63 dependency violations (0 errors, 63 warnings). 1858 modules, 6079 dependencies cruised.
- x 63 dependency violations (0 errors, 63 warnings). 1858 modules, 6079 dependencies cruised.
- x 63 dependency violations (0 errors, 63 warnings). 1858 modules, 6079 dependencies cruised.
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
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
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

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLib
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLib
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLib

### Category: packages/ui
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/card.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/card.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/card.tsx
- warn no-orphans: packages/ui/src/button.tsx

## Raw Output

```text

> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-01T13:13:24.829Z

>>> Command: pnpm turbo run check-types
--------------------------------------------------------------------------------

• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile

   • Running check-types in 28 packages
   • Remote caching disabled


apps-intuitui-web:check-types: cache hit, replaying logs 7cc5f4f844af38fb

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec astro check
apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: [2m16:02:33[22m [34m[types][39m Generated [2m137ms[22m

apps-intuitui-web:check-types: [2m16:02:33[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\intuitui-web...
apps-intuitui-web:check-types: Result (14 files): 
apps-intuitui-web:check-types: - 0 errors
apps-intuitui-web:check-types: - 0 warnings
apps-intuitui-web:check-types: - 0 hints
apps-intuitui-web:check-types: 

apps-edlove-web:check-types: cache hit, replaying logs 8b919e856a5242ab

apps-edlove-web:check-types: 

apps-edlove-web:check-types: > apps-edlove-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec astro check
apps-edlove-web:check-types: 
apps-edlove-web:check-types: [2m16:02:34[22m [34m[content][39m Syncing content
apps-edlove-web:check-types: [2m16:02:34[22m [34m[content][39m Synced content
apps-edlove-web:check-types: [2m16:02:34[22m [34m[types][39m Generated [2m1.83s[22m
apps-edlove-web:check-types: [2m16:02:34[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\edlove-web...
apps-edlove-web:check-types: Result (41 files): 
apps-edlove-web:check-types: - 0 errors
apps-edlove-web:check-types: - 0 warnings
apps-edlove-web:check-types: - 0 hints
apps-edlove-web:check-types: 

apps-neevsk-web:check-types: cache hit, replaying logs 47371f3ce5f6d09d

@repo/core:check-types: cache miss, executing 7008188a0820a558

apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec astro check
apps-neevsk-web:check-types: 

apps-neevsk-web:check-types: [2m18:38:30[22m [34m[content][39m Syncing content
apps-neevsk-web:check-types: [2m18:38:30[22m [34m[content][39m Synced content
apps-neevsk-web:check-types: [2m18:38:30[22m [34m[types][39m Generated [2m1.17s[22m
apps-neevsk-web:check-types: [2m18:38:30[22m [34m[check][39m Getting diagnostics for Astro files in C:\Users\Naween\projects\polymath-platform\apps\neevsk-web...
apps-neevsk-web:check-types: [96msrc/content.config.ts[0m:[93m47[0m:[93m20[0m - [93mwarning[0m[90m ts(6385): [0m'(params?: string | { abort?: boolean | undefined; pattern?: RegExp | undefined; hostname?: RegExp | undefined; protocol?: RegExp | undefined; normalize?: boolean | undefined; error?: string | ... 1 more ... | undefined; message?: string | undefined; } | undefined): ZodString' is deprecated.
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: [7m47[0m   link: z.string().url().optional(),
apps-neevsk-web:check-types: [7m  [0m [93m                   ~~~[0m
apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: Result (44 files): 
apps-neevsk-web:check-types: - 0 errors
apps-neevsk-web:check-types: - 0 warnings
apps-neevsk-web:check-types: - 1 hint
apps-neevsk-web:check-types: 

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 

@repo/ui:check-types: cache miss, executing ab983dcde9e95000

@repo/accounting:check-types: cache miss, executing 65026fa68b3b8a01

@repo/database:check-types: cache miss, executing 4d6a10fe78f83873

@intuitui-labs/lk-edu-geo:check-types: cache miss, executing e5603c1ab0030643

@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > pnpm exec tsc --noEmit
@repo/database:check-types: 

@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: 

@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm run typecheck
@repo/ui:check-types: 

@repo/accounting:check-types: 

@repo/accounting:check-types: > @repo/accounting@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting

@repo/accounting:check-types: > pnpm exec tsc --noEmit
@repo/accounting:check-types: 

@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.0.0 typecheck C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm exec tsc --noEmit
@repo/ui:check-types: 

@repo/payments:check-types: cache miss, executing 4f5ee8f067dd72a6

@repo/payments:check-types: 
@repo/payments:check-types: > @repo/payments@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:check-types: > pnpm exec tsc --noEmit
@repo/payments:check-types: 

@repo/people:check-types: cache miss, executing 6a77e81f18bb8283

@repo/graphics:check-types: cache miss, executing 33a73882437c318a

@repo/ai:check-types: cache miss, executing 19cd84779d768405

@repo/scanner-kit:check-types: cache miss, executing acabfe938a97ff87

@repo/workforce:check-types: cache miss, executing 2a84e613f8c1e7e4

@repo/people:check-types: 
@repo/people:check-types: > @repo/people@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: > pnpm exec tsc --noEmit
@repo/people:check-types: 

@repo/graphics:check-types: 
@repo/graphics:check-types: > @repo/graphics@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:check-types: > pnpm exec tsc --noEmit
@repo/graphics:check-types: 

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
@repo/ai:check-types: > pnpm run typecheck
@repo/ai:check-types: 

@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@0.0.1 typecheck C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > pnpm exec tsc --noEmit
@repo/ai:check-types: 

@repo/ai:check-types: src/hooks/useAIAgent.ts(214,35): error TS2551: Property 'getSession' does not exist on type '{ getAuthSession(): Promise<Session | null>; getAuthUser(): Promise<User>; signIn(email: string, password: string): Promise<{ user: User; session: Session; weakPassword?: WeakPassword | undefined; }>; ... 8 more ...; deleteAccount(): Promise<...>; }'. Did you mean 'setSession'?

@repo/ai:check-types:  ELIFECYCLE  Command failed with exit code 2.

@repo/ai:check-types:  ELIFECYCLE  Command failed with exit code 2.

@repo/library:check-types: cache miss, executing 2ef387abdefa7640
@repo/analytics:check-types: cache miss, executing 32c9967b813a11d7

 ERROR 
 @repo/ai#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\ai) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)


 Tasks:    12 successful, 16 total
Cached:    3 cached, 16 total
  Time:    1m36.577s 

Failed:    @repo/ai#check-types



 ERROR  run failed: command  exited (2)


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 97.9s
Findings: 10
Log File: reports/check-types.txt
--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-01T13:15:04.827Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-circular
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLib
rary.ts
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

x 63 dependency violations (0 errors, 63 warnings). 1858 modules, 6079 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY

Duration: 13.6s

Findings: 0

Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-01T13:15:19.127Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-orphans

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLib
rary.ts
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

x 63 dependency violations (0 errors, 63 warnings). 1858 modules, 6079 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 9.6s
Findings: 63

Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-01T13:15:29.338Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLib
rary.ts
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

x 63 dependency violations (0 errors, 63 warnings). 1858 modules, 6079 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 10.0s

Findings: 64

Log File: reports/architecture.txt

--------------------------------------------------------------------------------


✅ All hygiene checks passed!


> polymath-platform@1.0.0 identity:check C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"


>>> Starting Sovereign Audit: 2026-05-01T13:15:40.022Z

>>> Command: node scripts/check-identity-alignment.mjs

--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 1.92s. Found 0 potential alignment issues.



[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 3.4s

Findings: 0

Log File: reports/identity_check.txt

--------------------------------------------------------------------------------

 ERR_PNPM_DLX_NO_BIN  No binaries found in gitleaks

```
