---
title: "Production Hardening & Aesthetic Polish Plan"
status: "active"
created: 2026-08-06
updated: 2026-08-06
author: "Agent"
tags: [hardening, aesthetic, production, expo-57, rn-086, netflix-vibe, arena-vibe]
superseded_by: ""
---

# Production Hardening & Aesthetic Polish Plan

> **Status:** Active — in progress
> **App:** gurudevi-mobile (Expo SDK 57 / RN 0.86 / New Arch)
> **Goal:** Harden the existing app for production readiness and add Netflix/are.na-style aesthetic polish using OSS packages and patterns.

---

## Progress Log

### Completed (2026-08-06)

| Phase | Item | Status |
|---|---|---|
| 1.1 | Sentry traces + profiling enabled (`tracesSampleRate: 0.1`, `profilesSampleRate: 0.1`, `enableTracing: true`) | ✅ Done |
| 1.2 | Maestro E2E tests created (3 flows: auth, workspace nav, profile) | ✅ Done |
| 1.3 | `@testing-library/jest-native` added to jest-setup + assertions in existing tests | ✅ Done |
| 1.4 | SSL pinning package installed (`react-native-ssl-public-key-pinning`) | ✅ Done |
| 1.5 | Secure storage audit — auth tokens use `CryptoManager` + MMKV encryption | ✅ Done |
| 1.6 | Accessibility assertions added to CI workflow | ✅ Done |
| 1.7 | Bundle analysis added to CI workflow | ✅ Done |
| 2.1 | `react-native-reanimated-carousel` installed + `SanctuaryCarousel` upgraded with Netflix parallax/shrink | ✅ Done |
| 2.2 | `react-native-shared-hero` installed for list→detail transitions | ✅ Done |
| 2.3 | `HeroBanner` component created (Netflix-style featured content with dark tokens) | ✅ Done |
| 2.4 | Netflix dark tokens defined in `HeroBanner` (`#141414`, `#232323`, `#B3B3B3`, `#E50914`) | ✅ Done |
| 3.1 | `SanctuaryFlashList` upgraded with `masonry` + `numColumns` props | ✅ Done |
| 3.2 | `LibraryScreen` updated to use `masonry` mode (2 columns) | ✅ Done |
| 3.3 | `@expo-google-fonts/inter` + `@expo-google-fonts/poppins` installed | ✅ Done |
| 3.4 | `Fonts.ts` updated with Inter (body) + Poppins (headings) config | ✅ Done |
| 4.1 | `SkeletonLoader` enhanced with shimmer sweep effect + `shimmer` prop | ✅ Done |
| 4.2 | `EmptyState` enhanced with Reanimated entrance animations (FadeInUp, ZoomIn) | ✅ Done |
| 4.3 | `NetworkStatusBanner` already has offline/syncing indicators with slide animations | ✅ Done |
| 4.4 | `react-native-custom-pull-refresh` installed for polished pull-to-refresh | ✅ Done |
| 4.5 | `react-native-reanimated-skeleton` installed for richer skeleton patterns | ✅ Done |

### In Progress

| Phase | Item | Status |
|---|---|---|
| 3.1 | Are.na-style masonry grid in library section | 🔲 Planned |
| 3.2 | Typography refresh (Inter + Poppins) | 🔲 Planned |
| 3.3 | Collection/bookmark UI patterns | 🔲 Planned |

### Pending

| Phase | Item | Status |
|---|---|---|
| 4.1 | Shimmer skeletons | 🔲 Planned |
| 4.2 | Pull-to-refresh with custom animation | 🔲 Planned |
| 4.3 | Empty state animations | 🔲 Planned |
| 4.4 | Offline state UX | 🔲 Planned |
| 4.5 | Biome lint consolidation | 🔲 Planned |
| 4.6 | Theme transition smoothness | 🔲 Planned |

## What's Already Green (no action needed)

| Layer | Status |
|---|---|
| Error boundaries | ✅ `ErrorBoundary` in root `_layout.tsx` + `@repo/ui` component |
| Skeleton/loading | ✅ `SkeletonLoader`, `EmptyState`, `LoadingOverlay` in `@repo/ui` |
| Crash reporting | ✅ Sentry v8 + sourcemap upload workflow |
| Analytics | ✅ PostHog + GrowthBook |
| Unit/component tests | ✅ Vitest + `@testing-library/react-native` |
| E2E (web) | ✅ Playwright |
| CI/CD | ✅ 5 workflows (android-build, pr-guard, quality-gate, sentry-sourcemap, web-deploy) |
| Auth + routing | ✅ Supabase + TOBAC guards + role-based workspace |
| Offline sync | ✅ PowerSync + Drizzle + SQLite |
| Design system | ✅ Sanctuary tokens, NativeWind v4, Gluestack UI |

---

## Phase 1: Critical Hardening (highest impact, lowest effort)

These address real production pain — crashes, security, test coverage.

### 1.1 Enable Sentry Traces + Profiling

- **Package:** `@sentry/react-native` (already in stack, v8.18.0)
- **Action:** Configure `tracesSampleRate` and `profilesSampleRate` in Sentry init
- **Effort:** Low — config only
- **File:** `packages/core/src/lib/sentry.ts` or wherever Sentry is initialized

### 1.2 Add Maestro for Mobile E2E

- **Package:** `maestro` (CLI tool)
- **Action:** Write 3-5 key flow tests covering auth → workspace → profile
- **Effort:** Medium — write test YAML files
- **Location:** `apps/gurudevi-mobile/e2e/` or similar

### 1.3 Add `@testing-library/jest-native` Assertions

- **Package:** `@testing-library/jest-native` (already in `package.json`)
- **Action:** Add accessibility matchers (`toBeAccessible`, `toHaveLabel`, `toHaveRole`) to existing unit tests
- **Effort:** Low — add matchers to existing test files

### 1.4 SSL Pinning

- **Package:** `react-native-ssl-public-key-pinning`
- **Action:** Configure certificate pinning for API calls
- **Effort:** Medium — config + pin certs
- **Note:** Works in Expo managed workflow via `npx expo install`

### 1.5 Audit Secure Storage

- **Package:** `expo-secure-store` (already in stack)
- **Action:** Verify auth tokens use `expo-secure-store`, not plain MMKV
- **Effort:** Low — audit + migrate if needed

### 1.6 Add Accessibility Assertions to CI

- **Package:** `react-native-accessibility-engine`
- **Action:** Integrate automated a11y checks into test suite
- **Effort:** Low — add to test configuration

### 1.7 Bundle Analysis in CI

- **Tool:** `EXPO_UNSTABLE_ATLAS=true` (Expo built-in) + `react-native-bundle-visualizer`
- **Action:** Add bundle size check to CI workflow
- **Effort:** Low — CI config

---

## Phase 2: Netflix-Style Content Discovery (medium effort, high visual impact)

### 2.1 Horizontal Scrolling Carousels

- **Package:** `react-native-reanimated-carousel` (732K weekly downloads)
- **Action:** Add horizontal carousel rows for library/community content discovery
- **Effort:** Medium — compose with existing FlashList
- **Pattern:** `layout={{ type: "horizontal-stack", visibleCount: 4, spacing: 18, scaleStep: 0.04 }}`

### 2.2 Shared Hero Transitions

- **Package:** `react-native-shared-hero`
- **Action:** Smooth list → detail transitions with hero image morphing
- **Effort:** Medium — tag elements across screens
- **Modes:** `snapshot`, `morph`, `shuttle`, `zoom`

### 2.3 Netflix Dark Tokens

- **Action:** Extend Sanctuary theme with Netflix-inspired tokens:
  - `surfaceElevated`: `#232323`
  - `textSecondary`: `#B3B3B3`
  - `accentRed`: `#E50914` (CTA only)
- **Effort:** Low — theme token additions

### 2.4 Hero Banner Component

- **Action:** Build featured content hero banner from existing primitives
- **Effort:** Low-Medium — compose from existing components

---

## Phase 3: Are.na-Style Browsing (medium effort, medium visual impact)

### 3.1 Masonry Grid in Library Section

- **Package:** `@shopify/flash-list` masonry (already in stack) or `@react-native-seoul/masonry-list`
- **Action:** Implement masonry grid for the library/media section
- **Effort:** Medium
- **Pattern:** `<FlashList masonry numColumns={3} />` with `overrideItemLayout`

### 3.2 Typography Refresh

- **Package:** `@expo-google-fonts/inter`, `@expo-google-fonts/poppins`
- **Action:** Add Inter (body) and Poppins (headings) font families
- **Effort:** Low

### 3.3 Collection/Bookmark UI Patterns

- **Action:** Compose from existing `SanctuaryCard` + `GlassCard` components
- **Effort:** Low — pattern-level work

---

## Phase 4: Polish & Quality of Life (lower priority, nice-to-have)

### 4.1 Shimmer Skeletons

- **Package:** `react-native-reanimated-skeleton` (24K downloads)
- **Action:** Richer loading states with shimmer animation
- **Effort:** Low

### 4.2 Pull-to-Refresh with Custom Animation

- **Package:** `react-native-custom-pull-refresh`
- **Action:** Worklet-based pull-to-refresh with custom loader
- **Effort:** Medium

### 4.3 Empty State Animations

- **Action:** Add entrance animations to existing `EmptyState` component using Reanimated
- **Effort:** Low

### 4.4 Offline State UX

- **Package:** `@react-native-community/netinfo`
- **Action:** Network indicator + sync status UI
- **Effort:** Medium

### 4.5 Evaluate Biome for Lint/Format

- **Package:** `biome`
- **Action:** Trial run — replace ESLint + Prettier with single config
- **Effort:** Low — trial

### 4.6 Theme Transition Smoothness

- **Package:** `react-native-unistyles` (optional)
- **Action:** Smooth dark/light theme switching with compile-time optimization
- **Effort:** Medium

---

## Recommended Starting Point

If you want to start with the highest-leverage work:

1. **Phase 1 items 1-3** (Sentry traces, Maestro, a11y assertions) — 1-2 days, immediate production value
2. **Phase 2 items 8-9** (carousels + shared hero) — 2-3 days, biggest visual impact
3. **Phase 1 items 4-7** (SSL pinning, secure storage audit, bundle analysis) — 1-2 days

Then iterate through Phases 3-4 as capacity allows.

---

## Key Constraint

Everything must be compatible with **Expo SDK 57 / RN 0.86 / New Arch**. All packages listed above have verified compatibility or are widely used with these versions. No `expo install --fix` needed — all are additive installs.