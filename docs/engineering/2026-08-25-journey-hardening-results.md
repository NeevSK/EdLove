---
title: "Journey Hardening — Implementation Results (WS C)"
status: "active"
created: 2026-08-25
updated: "2026-08-25"
author: "Naveen"
scribe: "opencode"
tags: [journey, hardening, celebration, error-boundary, analytics]
---

# Journey Hardening — Implementation Results (WS C)

> **Point-in-time implementation log.** Design spec:
> [`release-journey-hardening.md`](./release-journey-hardening.md).

## Items Built

### 1. CelebrationOverlay integration (C5)

**File:** `packages/ui/src/screens/OnboardingWrapper.tsx`

Onboarding completion fires a 150-count confetti burst after profile sync
succeeds. The overlay auto-resets when the animation ends (no ghost confetti).

```tsx
<CelebrationOverlay
  trigger={celebrate}
  count={150}
  onAnimationEnd={() => setCelebrate(false)}
/>
```

### 2. JourneyErrorBoundary (C2)

**File:** `packages/ui/src/components/JourneyErrorBoundary.tsx`

Journey-specific error boundary with 5 fallback UIs:

| Journey | Title | Action |
|---------|-------|--------|
| auth | Session expired | Log in |
| onboarding | Something went wrong | Try again |
| create | Save failed | Retry |
| sync | Sync issue | Retry sync |
| general | Something went wrong | Try again |

All fallbacks fire `hapticError()` on mount. Exported from `@repo/ui`.

### 3. useJourneyContext (C1)

**File:** `apps/gurudevi-mobile/src/hooks/useJourneyContext.ts`

Reads the bootstrap contract (`getBootstrapSessionState`) and returns:

- `bootstrapState` — raw session state
- `journey` — derived journey type
- `isJourneyCritical` — `true` for auth/onboarding
- `canSafelyExit` — `true` when journey is complete

### 4. Journey analytics (C7)

**File:** `apps/gurudevi-mobile/src/lib/journeyAnalytics.ts`

5 event types: `journey_started`, `journey_step_completed`, `journey_completed`,
`journey_failed`, `journey_abandoned`. Pub/sub pattern — no analytics SDK
dependency.

## Items Deferred

| Item | Reason |
|------|--------|
| Draft persistence (C3) | MMKV-backed save needs deeper investigation of existing create-post flow |
| Sync status UI (C4) | Existing `SyncStatusFull` already has state machine; enhancement is polish |

## Verification

- `npx tsc --noEmit` in `packages/ui` — 0 errors
- `CelebrationOverlay` lifecycle managed (reset on unmount)
- `useShake` and all WS D primitives still passing (13/13 tests)
