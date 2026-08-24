---
title: "Production Delight System — Audit vs. Blueprint"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [ui, motion, delight, audit, @repo/ui]
---

# Production Delight System — Audit vs. Blueprint

> **Point-in-time audit** (2026-08-24). Maps the "Production Delight Blueprint"
> (tokens → primitives → patterns → feedback → resilience → quality) against
> what actually exists in `@repo/ui`. Companion SOP:
> [`delight-system-sop.md`](./delight-system-sop.md).

## 1. Verdict up front

The blueprint's **foundation is already built and in production usage**: a
motion-token system (`components/motion.ts`), reduced-motion awareness, a Toast
system with queueing + accessibility, branded empty/error/success/loading
states, skeletons, haptics as a platform utility, and several press/state
patterns. **Rebuilding these would violate AGENTS.md rule #3 (no duplicate
utilities).** The genuine gaps are a small set of *primitives* and *test
contracts*.

## 2. Layer-by-layer vs. `@repo/ui`

### 2.1 Tokens — ✅ Built

| Blueprint token | Repo source |
| --- | --- |
| `duration` | `packages/ui/src/components/motion.ts` (`micro/transition/shared/meaningful/breathe`) |
| `easing` | same (`decelerate/accelerate/standard`, bezier + CSS + native + worklet forms) |
| `scale` | same (`enter/rest/breatheMin/breatheMax`) |
| `color` | same (`brand`/`neutral`/`state`) |
| spacing/radius/elevation | NativeWind + gluestack tokens + theme in `packages/ui/src/theme/Theme.ts` |

### 2.2 Primitives — ⚠️ Partial

| Blueprint primitive | Status | Evidence |
| --- | --- | --- |
| Pressable scale feedback | ⚠️ Recurring, not a primitive | `SanctuaryCard` (LIFT_SCALE 1.0→1.02), `AccessibleTouchable` opacity press, ad-hoc `active:scale-*` classes | **Gap: `PressableScale`** |
| `FadeIn`/`FadeOut` | ✅ | Reanimated `FadeIn*/FadeOut` re-exported via `index.ts` |
| `Skeleton` | ✅ | `Skeleton.tsx`/`SkeletonLoader` + `BrandedSkeleton*` |
| `ProgressIndicator` | ✅ | `ProgressIndicator.tsx`, `SanctuaryProgressBar` |
| `FocusRing` (web focus contract) | ⚠️ Partial | Web focus styles in `SanctuaryGlobalStyles` + `focus:ring` classes in a few components; no exported primitive |
| `Shake` (validation failure) | ⚠️ One-off | `OnboardingScreen.web.tsx` has `@keyframes obShake`; not token-driven, not cross-platform | Gap: `Shake` |
| `Collapse`/expand | ❌ | No accordion/collapse primitive | Gap: `Collapse` |
| `Toast` | ✅ | `ToastProvider` (`useToast`/`useSanctuaryToast`): queue, duration, dismiss, reduced-motion, a11y; `SanctuaryToast` web variant |
| `HapticFeedback` | ✅ | `packages/ui/src/utils/haptics.ts` + `.web.ts` (`hapticLight/Success/Error/…`); used across components |

### 2.3 Pattern layer

- ✅ `EmptyState`/`BrandedEmptyState`, `ErrorState`/`ErrorMessage`/`ErrorBoundary`, `Success`/`SuccessCheck`/`SuccessGlow`, `NetworkStatusBanner`, `SyncStatus*`, `LoadingOverlay`, `ConflictResolver`, `SafeButton` (async+retry), `useSafeAction` (pending + toast + failure), `PredictiveButton`.
- ❌ **`OptimisticRow`/inline optimistic-undo pattern** — per-screen optimistic logic exists but no shared pattern. Gap (bounded).

### 2.4 Resilience

- ✅ Offline-first via PowerSync + local store; `SyncStatus*`, offline queue, drafts lightly.
- ⚠️ Request cancellation/timeouts/dedupe centralization — partially in the data layer; weakest links are tracked in the journey matrix (SOP).

### 2.5 Quality / QA contract

- ⚠️ No motion test contract (mount/update/interrupt/unmount/reduced-motion). **Gap: test contract** in SOP.

## 3. True gaps → this pass

| # | Gap | Deliverable |
| --- | --- | --- |
| D1 | No shared press-feedback primitive | `PressableScale` (own `activeScale`, `reducedMotion`, hit-slop, a11y; build on `AccessibleTouchable`) |
| D2 | No exported focus contract | `FocusRing` (web focus + mobile invisible focus; compose existing ring styles) |
| D3 | No cross-platform validation `Shake` | `Shake` (token-driven, reduced-motion no-op) |
| D4 | No `Collapse`/expand primitive | `Collapse` (token-driven; reduced-motion no-op) |
| D5 | No shared optimistic/undo | `OptimisticRow` (pattern, only where not already covered) |

Considered but rejected in this pass: adding a second animation engine
(Moti / React Native Ease) — explicitly rejected by the blueprint and
AGENTS.md rule #3; Reanimated remains the single motion engine.

## 4. Boundary / non-goals

- No second animation engine (Moti/Ease) — Reanimated is the single motion
  engine (`delight-system-sop.md` §stack discipline).
- No telemetry rewrite — instrumentation hooks align with observability section,
  but track existing Sentry/PostHog + audit events; no new analytics pipeline.
- Scope is `@repo/ui` primitives + tests; screens adopt them opportunistically
  (GREEN zone), not a wholesale refactor in this pass.

## 5. Acceptance

- `PressableScale`, `FocusRing`, `Shake`, `Collapse` exported from `@repo/ui`.
- All four honor reduced-motion (opacity/color/no-op) and pass a mount/update/interrupt/unmount test.
- `OptimisticRow` added where a flow lacks an undo/retry path (not every screen).
- `pnpm check-types`, `pnpm test` for `@repo/ui` green.