# Analytics Package Inventory

This document is the source of truth for the current shape of `@repo/analytics`.
It inventories every repo-tracked file in `packages/analytics`, records the package boundary, and notes the migration action that keeps the package aligned with `apps/gurudevi-mobile/docs/Core/ui-development-guide.md`.

## Package Boundary

### Current Intent
- Root package: analytics engines, grading utilities, ML, shared types, benchmarking helpers, and app bootstrapping helpers for analytics runtime.
- Explicit UI entrypoint: `@repo/analytics/ui` for providers, analytics UI components, and the app-facing `useAnalytics` hook.
- Explicit hooks entrypoint: `@repo/analytics/hooks` for query/data hooks.

### Public API Map

#### Root before tightening
- Engines: GPA calculator, performance analyzer, PostHog native class
- ML: predictor, insight generator
- Types: analytics and grading types
- Utilities: analytics helpers, benchmarking
- UI: components and provider were re-exported from root
- Hooks: `useAnalytics`, `useStudentPerformance`, `useClassPerformance`, `usePredictions`, `usePerformanceData`
- Runtime helpers: `initPostHog`, `trackEvent`, `identifyUser`, `resetUser`
- Compatibility helpers: `marksToGPA`, `calculateRanks`, `multiTenantAnalyticsAPI`

#### Root after tightening
- Engines: GPA calculator, performance analyzer, PostHog native class
- ML: predictor, insight generator
- Types: analytics and grading types
- Utilities: analytics helpers, benchmarking
- Runtime helpers: `initPostHog`, `trackEvent`, `identifyUser`, `resetUser`
- Compatibility helpers: `marksToGPA`, `calculateRanks`, `multiTenantAnalyticsAPI`

#### Explicit subpaths after tightening
- `@repo/analytics/ui`
  - `AnalyticsProvider`
  - `useAnalyticsContext`
  - `AnalyticsChart`
  - `MultiSeriesChart`
  - `PerformanceDashboard`
  - `GPAInsights`
  - `useAnalytics`
- `@repo/analytics/hooks`
  - `useStudentPerformance`
  - `useClassPerformance`
  - `usePredictions`
  - `useStudentPerformanceData`
  - `useClassPerformanceData`
  - legacy shim: `usePerformanceData`

## Inventory

| File | Role | Public Exposure | Platform | Current Issues | Target Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `README.md` | package overview | package docs | shared | still describes UI components as if root-owned | heal docs to reflect explicit `ui` and `hooks` entrypoints in a later doc pass |
| `index.d.ts` | TS declaration bridge | package root and subpath typing | shared | only declared root module | heal to include `@repo/analytics/ui` and `@repo/analytics/hooks` |
| `package.json` | package manifest | package loader boundary | shared | exports only root path | heal with explicit `./ui` and `./hooks` exports |
| `tsconfig.json` | package TS config | internal | shared | no issue found | keep |
| `tsconfig.tsbuildinfo` | generated TS artifact | none | shared | generated file tracked in git; not source of behavior | keep tracked for now, exclude from migration logic |
| `src/index.ts` | root entrypoint | public root API | shared plus RN runtime helper logic | mixed root exported UI and hooks despite comment claiming no UI dependencies; imported `Platform` from `react-native` | heal boundary, keep root logic-only plus runtime helpers |
| `src/ui.ts` | explicit UI entrypoint | public subpath | shared | did not exist | add |
| `src/components/index.ts` | UI barrel | public through `ui` entrypoint | shared | previously only reachable through root barrel | keep as UI-only barrel |
| `src/components/AnalyticsChart.tsx` | reusable analytics visualization wrapper | public through `ui` entrypoint | shared UI | direct `react-native` layout imports, `StyleSheet`, `Theme` styling | heal to `@repo/ui` primitives and className-first composition |
| `src/components/AnalyticsProvider.tsx` | native analytics provider | public through `ui` entrypoint | native | infrastructural provider is correct, but its ownership must be explicit and not root-exported | keep and expose only via `ui` |
| `src/components/AnalyticsProvider.web.tsx` | web analytics provider | public through `ui` entrypoint | web | same as native provider; platform file is valid | keep and expose only via `ui` |
| `src/components/GPAInsights.tsx` | student analytics insight card | public through `ui` entrypoint | shared UI | direct `react-native` layout imports, `StyleSheet`, `Theme`, `sx`, unused GPA calculator, broken bullet encoding | heal to `@repo/ui` primitives and sanctuary-styled composition |
| `src/components/PerformanceDashboard.tsx` | analytics dashboard summary | public through `ui` entrypoint | shared UI | direct `react-native` layout imports, `StyleSheet`, `Theme`, `sx`, generic dashboard styling | heal to `@repo/ui` primitives and calmer Gurudevi dialect |
| `src/context/ActivityPulseContext.tsx` | activity pulse state | internal context | shared | requestAnimationFrame context intentionally infrastructural; not part of public package contract | keep internal |
| `src/engine/GPACalculator.ts` | GPA and ranking engine | public root API | shared | no UI issues found | keep |
| `src/engine/PerformanceAnalyzer.ts` | analytics query engine | public root API | shared | no UI issues found | keep |
| `src/engine/PostHogAnalytics.ts` | native PostHog runtime | public root API and runtime helpers | native | platform-specific but appropriately infrastructural | keep |
| `src/engine/PostHogAnalytics.web.ts` | web PostHog runtime | internal to runtime helpers and UI hook | web | platform-specific but appropriately infrastructural | keep |
| `src/hooks/index.ts` | data hooks barrel | public hooks subpath | shared | did not exist | add |
| `src/hooks/queries.ts` | canonical analytics data hooks | public through hooks subpath | shared | did not exist; hook ownership was fragmented | add as canonical home |
| `src/hooks/useAnalytics.ts` | app-facing analytics tracking hook | public through `ui` entrypoint | shared plus platform logic | mixed tracking hook with all query hooks in one file | heal to tracking-only hook |
| `src/hooks/usePerformanceData.ts` | legacy data hook shim | public through hooks subpath | shared | duplicated semantics with other hook file and overloaded name | heal into thin compatibility shim to canonical hook |
| `src/hooks/usePredictions.ts` | legacy prediction hook shim | public through hooks subpath | shared | duplicated implementation via `useAnalytics.ts` | heal into thin compatibility shim |
| `src/ml/InsightGenerator.ts` | recommendation and insight engine | public root API | shared | no UI issues found | keep |
| `src/ml/Predictor.ts` | prediction engine | public root API | shared | no UI issues found | keep |
| `src/types/AnalyticsTypes.ts` | analytics domain types | public root API and hooks API | shared | imports `supabase` but does not use it | heal unused import |
| `src/types/GradingTypes.ts` | grading domain types | public root API | shared | no issue found from migration audit | keep |
| `src/utils/analyticsHelpers.ts` | analytics formatting and scoring helpers | public root API | shared | no UI issue found | keep |
| `src/utils/benchmarking.ts` | analytics benchmarking helper | public root API | shared | no UI issue found | keep |

## Direct Consumers Updated In This Pass
- `apps/gurudevi-mobile/app/_layout.tsx`
  - owns the single injected PostHog adapter and emits typed product events
- `apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx`
  - no longer initializes a second PostHog provider
- `packages/admin/src/screens/EnhancedAnalyticsDashboard.web.tsx`
  - UI components now come from `@repo/analytics/ui`
  - query hooks now come from `@repo/analytics/hooks`

## Notes
- The mobile shell uses `initPostHog` only for adapter initialization and uses
  the typed core product-event boundary for product events. The legacy
  arbitrary `trackEvent` helper remains only as a compatibility shim.
- `multiTenantAnalyticsAPI` remains on the root package as a compatibility helper for admin until a fuller admin analytics boundary is designed.
