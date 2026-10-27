# Strategic Architectural Master Plan: Holistic Sensory, State & Provider Convergence

> **Role**: Solution Architect & Senior Systems Engineer  
> **Status**: Ready for Execution  
> **Target Ecosystem**: `apps/gurudevi-mobile`, `@repo/ui`, `@repo/core`, `apps/gurudevi-web`  
> **Dialect & Framework Targets**: Expo SDK 58, React Native 0.88 (New Architecture / Fabric / JSI), React 19.3, Zustand 5, XState 5, Web Audio API

---

## 1. Executive Summary & The Hostile Critic's Reality Check

### The Hostile Critic's Audit: What is ACTUALLY Broken?
Before proposing features or abstractions, a ruthless systems architect audits reality:
1. **The Mobile Feedback Illusion**: `apps/gurudevi-mobile` has screens claiming "sensory delight", but neither `SensoryProvider` nor `SoundFeedbackProvider` was ever mounted in [`EntryShell.tsx`](file:///c:/x/apps/gurudevi-mobile/src/entry/EntryShell.tsx). Haptic feedback works only via direct raw imports; acoustic sound is completely dead.
2. **The Provider Soup Performance Tax**: `EntryShell.tsx` nests 14 providers. High-frequency changes trigger virtual DOM reconciliation cascades across 40+ screens.
3. **The Worklet / Native Gesture Wall**: Gestures (`Gesture.Pan()`, `Gesture.Tap()`) run on a dedicated UI worklet thread. Any feedback or state locked inside React Context is unreachable from gestures without severe performance degradation (`runOnJS`).
4. **Duplicated Diurnal Math**: Four separate modules (`CircadianProvider`, `TemporalProvider`, `FidelityProvider`, `RealityProvider`) run redundant timers computing the exact same astronomical phase and battery tier.
5. **The Deletion Danger**: Refactoring must not break existing callers (`useFeedback()`, `useFAB()`, `useCircadian()`, `useSensoryPreferencesOptional()`).

---

## 2. The Solution Architecture: The 3 Sovereign Tiers

Instead of ad-hoc fixes, the platform is partitioned into 3 decoupled, scaling-constrained tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 1: THE SENSORY SINGLETON ENGINE                 │
│                 (Hardware JSI Execution - ZERO Providers)              │
│                                                                        │
│  - SensoryFeedbackService (Direct JSI: expo-haptics & expo-audio)      │
│  - WebVisuoAcousticSynthesizer (Web Audio API 0KB procedurals on web)  │
│  - Synchronous worklet / gesture / background-sync safe                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ reads preferences directly
┌───────────────────────────────────▼────────────────────────────────────┐
│                    TIER 2: THE SOVEREIGN ZUSTAND STORES                │
│             (Cross-Screen Reactive State - MMKV Persisted)             │
│                                                                        │
│  - useSensoryStore: { hapticsEnabled, soundEnabled, quietMode }        │
│  - useSanctuaryRealityStore: { phase, hour, fidelity, batterySaver }   │
│  - useFABStore: { positionX, positionY, currentTab, isBreathing }      │
│  - useToastStore: { activeToasts, queue, enqueue, dismiss }            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ mounts visual overlays
┌───────────────────────────────────▼────────────────────────────────────┐
│                   TIER 3: MINIMAL STRUCTURAL PROVIDERS                 │
│             (Strictly Visual Tree Insets & Portals - 3 Max)            │
│                                                                        │
│  - GestureHandlerRootView (Native touch responder)                     │
│  - SafeAreaProvider (Physical window notches / insets)                 │
│  - QueryClientProvider (Server data cache)                             │
│  - PortalProvider (Modal & Toast floating surface host)                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Work Breakdown & Phased Execution

### Phase 1: Sovereign Sensory Feedback Singleton (Zero-Provider Hardware Engine)
* **Goal**: Enable instantaneous, zero-latency haptics and procedural audio across mobile and web without touching the Provider tree.
* **Files to create/modify**:
  1. `packages/ui/src/sensory/SensoryFeedbackService.ts`:
     - Imperative singleton: `sensoryFeedback.emit(event, options)`.
     - Direct JSI bridge to `expo-haptics` (`selectionAsync`, `impactAsync`, `notificationAsync`).
     - Persistent audio player pool via `expo-audio` (`createAudioPlayer`).
     - Reads user preferences synchronously from storage (`SafeZustandStorage` / MMKV).
  2. `packages/ui/src/sensory/webSynthesizer.ts`:
     - Web Audio API procedural synthesis for web fallback (0 KB assets: soft wood click, singing bowl harmonic, breath resonance).
  3. `packages/ui/src/context/FeedbackProvider.tsx`:
     - Update `useFeedback()` to forward calls to `SensoryFeedbackService`.
     - Zero breaking changes for existing components.

### Phase 2: Convert Pseudo-Providers to Persistent Zustand Stores
* **Goal**: Decouple client UI state and user preferences from the React VDOM tree.
* **Files to create/modify**:
  1. `packages/core/src/store/useSensoryStore.ts`:
     - Zustand store with MMKV persistence for `hapticsEnabled`, `soundEnabled`, `quietMode`.
  2. `packages/core/src/store/useSanctuaryRealityStore.ts`:
     - Unified store combining diurnal astronomical hour (24h transit), 5 sacred phases (*Brahma Muhurta*, *Udaya*, *Madhyahna*, *Sandhya*, *Ratri*), and GPU fidelity tier.
     - Single interval timer (ticks once every 60s or on app resume).
  3. `packages/ui/src/context/SensoryProvider.tsx` & `CircadianProvider.tsx`:
     - Refactor into transparent pass-throughs wrapping children, retaining backwards-compatible hooks (`useSensoryPreferencesOptional()`, `useCircadian()`).

### Phase 3: Mobile `EntryShell.tsx` Structural Flattening
* **Goal**: Tidy `apps/gurudevi-mobile/src/entry/EntryShell.tsx` from 14 nested levels down to 3 clean structural host tiers.
* **Execution**:
  - Remove empty/redundant wrappers (`CircadianProvider`, `EnvironmentProvider`, `SensoryProvider`, `MascotProvider`, `FABProvider`).
  - Keep essential structural roots: `<GestureHandlerRootView>`, `<ErrorBoundary>`, `<SafeAreaProvider>`, `<QueryClientProvider>`, and `<PortalProvider>`.
  - Validate first paint performance and eliminate redundant render cascades.

### Phase 4: Full Multi-Sensory Wiring into Core Workspaces & Actions
* **Goal**: Wire tactile and acoustic resonance into actual user actions:
  1. **Attendance Submission**: Sacred affirmation haptic + acoustic chime.
  2. **Reflection & Journaling**: Contemplative breath pacing.
  3. **Lotus Petal FAB**: Gesture spring snap + micro-selection tick.
  4. **Offline Sync Restored**: Seamless confirmation pulse.

---

## 4. Scaling Constraints & Risk Mitigation Matrix

| Constraint / Risk | Threat Level | Hostile Critic Mitigation Strategy |
| :--- | :--- | :--- |
| **Deletion Veto & API Breakage** | HIGH | **Zero Breaking Changes**: Existing hooks (`useFeedback`, `useSensoryPreferencesOptional`, `useCircadian`) are preserved as thin adapter shims over the new Zustand stores and singleton. |
| **Hermes / iOS Memory Leaks** | HIGH | Audio players in `expo-audio` must be pooled and capped (`maxConcurrentSounds: 2`). Never instantiate players inside React render functions. |
| **Worklet Thread Starvation** | CRITICAL | `SensoryFeedbackService` must not block the UI thread. Haptics fire via direct JSI; audio playback requests are dispatched cleanly without synchronous locks. |
| **Audio Autoplay & Muted Policies** | MEDIUM | On web, `AudioContext` initializes suspended and resumes on first physical user interaction. On mobile, `expo-audio` respects system silent switch / `quietMode`. |

---

## 5. Verification & Test Gate (Anti-Slop Protocol)

Before any phase is marked complete, the following gates must be verified:
1. **G0 Static Typecheck**: `pnpm --filter @repo/ui run check-types` & `pnpm --filter gurudevi-mobile run check-types` must exit 0.
2. **G1 Unit & Boundary Tests**:
   - `vitest run packages/ui/src/sensory/__tests__/SensoryFeedbackService.test.ts`
   - `vitest run apps/gurudevi-mobile/src/__tests__/entry/SessionRouteGate.test.tsx`
3. **Dialect Sentinel**: `pnpm run check:anti-slop` must confirm zero deprecated React 19 / RN 0.88 dialect regressions.
