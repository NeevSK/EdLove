---
title: "react-native-ease Migration — Adaptor Pattern Results"
status: "active"
created: "2026-08-25"
updated: "2026-08-25"
author: "Naveen"
scribe: "opencode"
tags: [ease, migration, adaptor, reanimated]
---

# react-native-ease Migration — Adaptor Pattern Results

> **Point-in-time implementation log.** Adaptor pattern approach (like
> nativewind's ssInterop deprecation).

## What Changed

### Adaptor component

**File:** `packages/ui/src/components/EaseView.tsx`

Drop-in replacement for `react-native-ease`'s `EaseView`. Uses Reanimated
under the hood (`useSharedValue` + `withTiming`/`withRepeat`/`withSpring`).

Supports:
- `initialAnimate` / `animate` — declarative target values
- `transition` — timing (with `loop: 'repeat' | 'reverse'`), spring, none
- `transformOrigin` — passed through as prop

### Files migrated (8)

| File | Import changed |
|------|----------------|
| `BreathingLoader.tsx` | `react-native-ease` → `@repo/ui/components/EaseView` |
| `BreathAnimation.tsx` | same |
| `LivingGlow.tsx` | same |
| `LotusLoader.tsx` | same |
| `PollWidget.tsx` | same |
| `SanctuaryCard.tsx` | same |
| `SanctuaryProgressBar.tsx` | same |
| `social/CommunityPresence.tsx` | same |

### Dependency removed

- `react-native-ease` removed from `packages/ui/package.json`
- `react-native-ease` removed from `apps/gurudevi-mobile/package.json`

## Verification

- `npx tsc --noEmit` in `packages/ui` — 0 errors
- 13/13 WS D tests pass
- No remaining imports of `react-native-ease` in the codebase
