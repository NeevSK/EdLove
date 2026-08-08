---
title: "Production Hardening — Trivial Gaps Audit"
status: "active"
created: 2026-08-06
updated: 2026-08-06
author: "Agent"
tags: [audit, accessibility, hardening, trivial-gaps, production-readiness]
superseded_by: ""
---

# Production Hardening — Trivial Gaps Audit

> **Status:** Active — in progress
> **App:** gurudevi-mobile (Expo SDK 57 / RN 0.86 / New Arch)
> **Goal:** Document and fix the small, easily-missed production gaps that separate a working app from a truly polished one.

---

## Audit Summary (2026-08-06)

Comprehensive audit of 20 common production gaps found **15 missing**, **2 partial**, **3 complete**.

| # | Item | Status | Priority |
|---|------|--------|----------|
| 1 | AppState listener | ❌ Missing | High |
| 2 | InteractionManager | ❌ Missing | High |
| 3 | useReducedMotion | ❌ Missing | High (a11y) |
| 4 | PixelRatio | ❌ Missing | Medium |
| 5 | I18nManager RTL | ❌ Missing | Medium (i18n) |
| 6 | Screen reader detection | ❌ Missing | High (a11y) |
| 7 | announceForAccessibility | ❌ Missing | High (a11y) |
| 8 | importantForAccessibility | ❌ Missing | High (a11y) |
| 9 | accessibilityElementsHidden | ❌ Missing | High (a11y) |
| 10 | accessibilityViewIsModal | ⚠️ Web only | High (a11y) |
| 11 | Touch targets 44×44 | ❌ Missing | High (a11y) |
| 12 | Color contrast | ❌ Missing | High (a11y) |
| 13 | Font scaling | ❌ Missing | High (a11y) |
| 14 | Keyboard avoidance | ❌ Missing | High |
| 15 | Unhandled rejection handler | ❌ Missing | High |
| 16 | Memory leak prevention | ❌ Missing | High |
| 17 | ErrorBoundary per screen | ✅ Complete | — |
| 18 | Loading states per route | ✅ Good | — |
| 19 | Deep link handling | ⚠️ Partial | Medium |
| 20 | Offline queue retry | ✅ Good | — |

---

## Progress Log

### Completed (2026-08-06)

| Phase | Item | Status |
|---|---|---|
| Infra | `useAppLifecycle.ts` — AppState, InteractionManager, memory leak guards | ✅ Done |
| Infra | `SanctuaryProvider` — Unhandled rejection handler + AppState listener | ✅ Done |
| Infra | `useKeyboard.ts` — KeyboardAvoidingView, KeyboardAwareScrollView wrappers | ✅ Done |
| Infra | `useAccessibility.ts` — Reduced motion, screen reader, high contrast, font scale, WCAG contrast, announceForAccessibility | ✅ Done |

### In Progress

| Phase | Item | Status |
|---|---|---|
| Components | `AccessibleTouchable` — 44×44 touch targets, proper a11y props | ✅ Done |
| Components | Modal accessibility (`accessibilityViewIsModal`, `accessibilityElementsHidden`) | ✅ Done |
| Components | `KeyboardAwareForm` integration into existing forms | 🔲 Planned |
| Deep Links | Universal links config, deferred deep links, analytics | 🔲 Planned |
| Offline | Sync status indicator, dead letter queue, exponential backoff | 🔲 Planned |
| CI | Contrast validation, font scaling test | 🔲 Planned |

---

## Implementation Details

### 1. App Lifecycle (`packages/core/src/hooks/useAppLifecycle.ts`)

**Added:**
- `AppLifecycle` singleton with `AppState` listener management
- `runAfterInteractions` / `deferAfterInteractions` for heavy work scheduling
- Memory leak prevention: `useAbortController`, `useMountedRef`, `useSafeState`, `useSubscription`, `useUnmount`, `useMount`
- `useAppLifecycle` hook for component-level lifecycle awareness

### 2. SanctuaryProvider Updates (`apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx`)

**Added:**
- Unhandled promise rejection handler (logs to console + Sentry)
- AppState listener that triggers foreground sync on activate, persists state on background

### 3. Keyboard Handling (`packages/core/src/hooks/useKeyboard.ts`)

**Added:**
- `KeyboardAwareForm` — cross-platform wrapper (KeyboardAvoidingView iOS, KeyboardAwareScrollView Android)
- `KeyboardDismissibleView` — dismisses keyboard on tap outside inputs
- `useKeyboardVisibility` — tracks keyboard show/hide with height
- `KeyboardDismissibleScreen` — full-screen wrapper with safe area + keyboard dismissal

### 4. Accessibility Suite (`packages/core/src/hooks/useAccessibility.ts`)

**Added:**
- `useReducedMotion` — respects system "reduce motion" setting
- `useScreenReader` — detects VoiceOver/TalkBack active
- `useHighContrast` — detects iOS bold text / Android high contrast
- `useFontScale` / `useClampedFontScale` — system font size multiplier
- `useAccessibleColorScheme` — high-contrast color adjustments
- `announceForAccessibility` / `useAnnounce` — screen reader announcements with deduplication
- `useAccessibility` — combined hook with computed flags
- `getContrastRatio` / `meetsWCAG` — WCAG AA/AAA contrast validation utilities

### 5. Accessible Components (`packages/ui/src/components/AccessibleTouchable.tsx`)

**Added:**
- `AccessibleTouchable` — 44×44 min touch target, proper `accessibilityRole`, `accessibilityState`, `importantForAccessibility`, `hitSlop`, `accessibilityActions`
- `AccessibleIconButton` — icon button with required `accessibilityLabel`
- `AccessibleTextLink` — text link with proper `accessibilityRole="link"`

### 6. Modal Accessibility (`packages/ui/src/components/SanctuaryModal.tsx`, `UniversalModal.tsx`)

**Added:**
- `accessibilityViewIsModal={true}` — traps accessibility focus within modal
- `accessibilityElementsHidden={!isOpen}` — hides background content from screen readers when modal is open
- `accessibilityRole="dialog"` and `accessibilityLabel={title}` on modal content
- `supportedOrientations` and `presentationStyle` for proper modal presentation
- Close button with `hitSlop` for easier tapping

---

## Next Steps (Priority Order)

1. **AccessibleTouchable** — 44×44 min touch target, proper `accessibilityRole`, `importantForAccessibility`, `hitSlop`
2. **Modal accessibility** — Add `accessibilityViewIsModal` + `accessibilityElementsHidden` to all native modals
3. **Form integration** — Wrap existing forms (`StepDemographics`, `StepHierarchy`, `SchoolCreationScreen`) with `KeyboardAwareForm`
4. **Deep link completeness** — Universal links config, Branch.io integration, link analytics
5. **Offline queue UI** — `SyncStatusIndicator`, dead letter queue, exponential backoff config
6. **CI validation** — Add contrast check, font scaling test to quality-gate workflow