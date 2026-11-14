---
title: "Monorepo Provider Consolidation and Technical Debt Remediation Plan"
status: "active"
created: 2026-10-24
updated: 2026-10-24
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, refactoring, remediation, providers, zustand, sensory, monorepo, plan]
---

# Monorepo Provider Consolidation & Technical Debt Remediation Plan

> **"Never silently delete working code. Preserve working functionality through additive adaptation."**  
> This document details the complete remediation program for resolving the fragmented provider technical debt across `@repo/ui`, `@repo/core`, and `apps/gurudevi-mobile`.

---

## 1. Rationale: Why Remediate Now?

1. **Eliminate Accidental Re-renders**: Wrapping screens inside 14 cascading React Contexts causes whole-tree re-rendering on high-frequency changes, degrading native 120 FPS animations.
2. **End "Provider Amnesia"**: Because `@repo/ui` has 12 separate providers, screens and entry shells frequently omit essential ones (e.g., `SensoryProvider` and `SoundFeedbackProvider` were omitted in mobile `EntryShell.tsx`).
3. **Bridge Worklet & Gesture Execution**: Gestures (`react-native-gesture-handler`) and animations (`react-native-reanimated`) run on dedicated native UI threads where React Context **does not exist**. Moving hardware triggers to Singleton services allows gestures to trigger tactile feedback directly without dropping frames.
4. **Kill Duplication**: Four separate files (`CircadianProvider`, `TemporalProvider`, `FidelityProvider`, `RealityProvider`) currently compute the exact same device clock and battery metrics independently.

---

## 2. The 4-Phase Remediation Roadmap

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 1: SENSORY SINGLETON ENGINE (IMMEDIATE WIN)                      │
  │ Convert FeedbackProvider & SoundFeedback into a zero-provider          │
  │ SensoryFeedbackService singleton. Works in Gestures, Worklets, and UI. │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │ PHASE 2: CONVERT PSEUDO-PROVIDERS TO ZUSTAND STORES                    │
  │ Migrate SensoryPreferences (sound/haptics booleans) and FABContext     │
  │ to persistent Zustand stores using SafeZustandStorage (MMKV).          │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │ PHASE 3: UNIFY DUPLICATE HARDWARE CONTEXTS                             │
  │ Consolidate CircadianProvider + TemporalProvider + FidelityProvider    │
  │ into a single, cohesive SanctuaryRealityStore.                         │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │ PHASE 4: ENTRY SHELL FLATTENING                                        │
  │ Tidy EntryShell.tsx down to the 4 structural providers                 │
  │ (GestureHandler, SafeArea, QueryClient, Portal). Retain compatibility. │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Step-by-Step Remediation Specifications

### Phase 1: The Unified `SensoryFeedbackService` Singleton
- **Problem**: `FeedbackProvider.tsx` forces components to be children of a context just to trigger sound/haptics, and `SoundFeedbackProvider` was never mounted in mobile.
- **Remediation**:
  - Create `packages/ui/src/sensory/SensoryFeedbackService.ts`.
  - Directly binds `expo-haptics` and `expo-audio` on mobile, and Visuo-Acoustic Web Audio on web.
  - Reads persistent user preferences directly from storage without needing React context.
  - Keep a backwards-compatible `useFeedback()` shim that forwards calls to the singleton so **zero existing screens break**.

### Phase 2: Convert Preferences & FAB to Zustand Stores
- **Problem**: `SensoryProvider.tsx` and `FABContext.tsx` wrap entire component trees just to store 3 boolean toggles and a button $(x, y)$ coordinate.
- **Remediation**:
  - Create `useSensoryStore` in `@repo/core/src/store/useSensoryStore.ts` using `SafeZustandStorage` (MMKV).
  - Create `useFABStore` in `@repo/ui/src/store/useFABStore.ts`.
  - Update `SensoryProvider` and `FABProvider` to act as transparent compatibility pass-throughs:
    ```tsx
    // Zero-overhead compatibility shim
    export function SensoryProvider({ children }: { children: ReactNode }) {
      return <>{children}</>;
    }
    ```
  - Downstream callers of `useSensoryPreferencesOptional()` or `useFAB()` continue to function seamlessly.

### Phase 3: Consolidate Reality, Circadian & Fidelity
- **Problem**:
  - `CircadianProvider.tsx` computes astronomical hours and phases (`predawn`, `dawn`, `morning`, etc.).
  - `TemporalProvider.tsx` in `@repo/ui/components` duplicates the diurnal calculations.
  - `RealityProvider.tsx` and `FidelityProvider.tsx` duplicate battery and performance tiers.
- **Remediation**:
  - Consolidate into `SanctuaryRealityStore` in `@repo/core/src/store/useRealityStore.ts`.
  - Ticks once every 60 seconds (or on system resume) via a background interval.
  - Provide unified hook: `useSanctuaryReality()`.
  - Deprecate the standalone `TemporalProvider` and `FidelityProvider` with clear `@deprecated` migration aliases.

### Phase 4: Mobile `EntryShell.tsx` Structural Simplification
- **Problem**: 14 nested tags inside `apps/gurudevi-mobile/src/entry/EntryShell.tsx`.
- **Remediation**:
  - Extract the true structural roots into clean, named boundaries:
    1. **Native Shell**: `<GestureHandlerRootView>` + `<ErrorBoundary>` + `<SafeAreaProvider>`
    2. **Data & Routing**: `<QueryClientProvider>` + `<GlobalProvider>` + `<SessionRouteGate>`
    3. **Overlay Host**: `<PortalProvider>` + `<ToastProvider>`
  - Drop the empty pseudo-providers (`SensoryProvider`, `MascotProvider`, `FABProvider`, `CircadianProvider`) from the JSX pyramid now that their capabilities live safely in Zustand stores and singletons.

---

## 4. Verification & Non-Regression Standard

Every phase must pass our platform verification gates before proceeding:
1. **G0 Static Gate**: `pnpm run check-types` across monorepo must exit 0.
2. **G1 Boundary Mock Gate**: Unit and integration test suites:
   - `pnpm --filter gurudevi-mobile test`
   - `pnpm --filter @repo/ui test`
   - `pnpm --filter @repo/core test`
3. **Anti-Slop Sentinel Gate**: `pnpm run check:anti-slop` must verify zero version drift or banned dialect emissions.
4. **The Deletion Veto**: No working hook (`useFeedback`, `useCircadian`, `useFAB`) or screen behavior may be deleted; all public APIs are preserved via additive Zustand bindings.
