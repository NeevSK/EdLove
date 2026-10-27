---
title: "Monorepo State & Architecture Separation Guidance: React Context vs. Zustand Store vs. Singleton Service"
status: "active"
created: 2026-10-24
updated: 2026-10-24
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, state-management, zustand, react-context, singleton, decision-guide, canon]
---

# Monorepo State & Architecture Separation Guidance

> **"Reasoning is the weapon, reality is the ammunition."**  
> Software performance decays when concerns are conflated. When global data is forced into React component trees, re-renders explode; when hardware actions are trapped in hooks, background threads fail. This document defines the definitive decision matrix for the Polymath / Gurudevi platform.

---

## 1. The Definitive Decision Tree: Where Does a Feature Belong?

When authoring a new feature, domain, or tool in the monorepo, walk through this exact 3-step triage:

```
                                [ NEW CAPABILITY ]
                                        │
           Does it directly mount visual DOM/Native nodes into the UI tree?
           (e.g., Modals, Dropdowns, Screen Insets, Layout Roots, Nav Stacks)
                                        │
                       ┌────────────────┴────────────────┐
                      YES                               NO
                       │                                 │
            [ 1. REACT PROVIDER ]             Does it hold reactive state
             - PortalProvider                 that components read/write?
             - SafeAreaProvider                          │
             - GestureHandlerRootView          ┌─────────┴─────────┐
             - ErrorBoundary                  YES                  NO
                                               │                    │
                                     [ 2. ZUSTAND STORE ]   [ 3. SINGLETON SERVICE ]
                                      - User settings        - Haptic JSI triggers
                                      - Active perspective   - Audio players / SFX
                                      - UI theme/sidebar     - Hardware sensors
                                      - Forms & drafts       - StorageManager
                                      - Server cache         - Offline sync worker
                                        (React Query)        - Logger / Telemetry
```

---

## 2. In-Depth Comparative Matrix

| Characteristic | 1. React Context Provider | 2. Zustand Store (External State) | 3. Singleton Service (Vanilla TS) |
| :--- | :--- | :--- | :--- |
| **Location** | Inside the React VDOM tree | Memory heap (outside React), bound via `useSyncExternalStore` | Memory heap (completely isolated from React) |
| **Re-render Scope** | **Cascading**: All consumers re-render unless memoized at every node | **Selective**: Only components whose selector (`state => state.foo`) changed re-render | **Zero**: Never causes a React re-render |
| **Reachability** | **Limited**: Only available to child components wrapped below it in the JSX tree | **Universal**: Callable in React (`useStore`) AND outside React (`store.getState()`) | **Universal**: Callable anywhere (worklets, background workers, event listeners) |
| **Mount Cost** | High: Adds depth and reconciliation nodes to the React VDOM | Zero: Plain JavaScript closure instantiated once at boot | Zero: Plain class/object instantiated once at boot |
| **Persistence** | Lost on unmount unless explicitly wired to local storage | Native: 1-line `persist` middleware with MMKV (`SafeZustandStorage`) | Native: Explicit read/write via `storage` |
| **Monorepo Canon** | Keep strictly for **Tree Structure & Host Boundaries** | Use for **All Cross-Screen Client UI State & User Preferences** | Use for **Hardware JSI, Sound, Haptics, and Background Tasks** |

---

## 3. What Else Exists in the Monorepo (Explored vs. Unexplored)

Our empirical audit of `@repo/core`, `@repo/ui`, `apps/gurudevi-mobile`, and `apps/gurudevi-web` reveals **3 distinct architectures running in parallel**:

### A. The Mature Zustand Core in `@repo/core/src/store/` (Already High Quality!)
The platform already possesses a sophisticated, battle-tested Zustand infrastructure that many UI engineers forgot existed:
- `usePerspectiveStore.ts`: Multi-tenant perspective switching (Personal vs. School vs. Guardian) with MMKV persistence.
- `useTemporalStore.ts`: Time-traveling spotlight state (`past`, `present`, `future`) with date indexing.
- `useCedarDecisionStore.ts`: Fine-grained permission decision caching.
- `useDraftsStore.ts`: Offline form draft persistence.
- `useUIStore.ts` & `ui.slice.ts`: Persistent theme, desk items, sidebar collapse.
- `useEntitlementStore.ts`: Role-based feature entitlements.
- `useNotificationStore.ts`: User notifications and badge counts.

### B. The Fragmented UI Provider Swarm in `@repo/ui/src/context/` (The Technical Debt)
While `@repo/core` was built cleanly with Zustand, `@repo/ui` was built with **12 separate, redundant React Context Providers**:
- `SensoryProvider.tsx` $\leftrightarrow$ `experiencePolicy.ts`: Toggles for sound and haptics (Pure state, should be Zustand).
- `FeedbackProvider.tsx`: Hardware sound/vibration dispatcher (Pure imperative side-effect, should be Singleton).
- `CircadianProvider.tsx` $\leftrightarrow$ `TemporalProvider.tsx`: Astronomical sun/moon phase (Redundant duplicates!).
- `RealityProvider.tsx` $\leftrightarrow$ `FidelityProvider.tsx` $\leftrightarrow$ `VisualCapabilities.ts`: Three separate files all measuring GPU speed and battery saver!
- `FABContext.tsx`: Coordinates $(x, y)$ of the Lotus button (Pure client state, should be Zustand).
- `MascotProvider.tsx`: Configuration for firefly mascot (Static object, should be a TS constant).

### C. The Web vs. Mobile Disconnect
- **Mobile (`apps/gurudevi-mobile`)**: Mounted 14 providers in `EntryShell.tsx`, but forgot `SensoryProvider` and `SoundFeedbackProvider`.
- **Web (`apps/gurudevi-web`)**: Very flat and disciplined (`AuthProvider` + `QueryProvider`), but completely lacks audio and haptic feedback wiring because it doesn't consume the sensory layer.
