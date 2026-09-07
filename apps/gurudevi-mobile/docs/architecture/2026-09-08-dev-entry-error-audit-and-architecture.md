---
title: "Dev Entry, Runtime Error & Crash Audit, and Systemic Architecture Remediation"
status: "active"
created: 2026-09-08
updated: 2026-09-08
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, stability, react-native, expo, dev-entry, auditing]
---

# Dev Entry, Runtime Error & Crash Audit, and Systemic Architecture Remediation

## 1. How Dev Login & Fast-Track Entry Works

### A. The Two Entry Paths
1. **Anonymous / Guest Fast-Track (`authAPI.signInAnonymously`)**:
   - On the Welcome Screen (`apps/gurudevi-mobile/app/index.tsx`), tapping **"Explore as Guest"** invokes Supabase anonymous authentication.
   - It issues an internal session token with a transient citizen ID (e.g. `00130b03-97f6-4f41-bac6-fc88793c57e9`).
   - The root routing gate (`apps/gurudevi-mobile/app/_layout.tsx`) evaluates `bootstrapReady` and immediately routes into the Sanctuary Self tab (`/(tabs)/self`).
   - A Sadhana profile is generated with the `STUDENT` capacity.

2. **Onboarding Developer Sandbox Fast-Track (`dev::...`)**:
   - Location: `packages/ui/src/screens/devOnboardingFastTrack.ts` & `packages/ui/src/screens/onboardingDevFlow.ts`.
   - Enabled when `__DEV__` is true or `EXPO_PUBLIC_ENABLE_DEV_SANDBOX === 'true'`.
   - On the onboarding name prompt, typing specific dev inputs triggers targeted account creation:
     - `dev::menu` or `dev::sandbox`: Displays the `DevSandboxConsole` overlay to toggle Role (`teacher`, `student`, `principal`, `admin`), pricing tier (`FREE`, `PRO`, `ENTERPRISE`), and citizenship (`WANDERER`, etc.).
     - `dev::name:...,role:...,pricing:...,citizenship:...,school:...`: Inlines configuration directly.
   - It executes `onboardingAPI.createInitialBond(...)` and `identityAPI.modifyUserProfile(...)`, satisfying all Cedar, RLS, and POA constraints without skipping the security boundary.

---

## 2. Complete List of Errors and Crashes (Extracted from Logcat & Metro)

During testing and traversal on the connected Android physical device (`Samsung Galaxy R58T33Y0E3M`), the following distinct errors and warnings were observed:

### 1. `Maximum update depth exceeded` (Fatal Redbox / Render Crash)
- **Source**: `packages/ui/src/context/FABContext.tsx` line 51 (`unregisterFAB`), invoked through `useRegisterFAB` at 10+ screen call sites (`CommunityScreen.tsx`, `LibraryScreen.tsx`, etc.).
- **Log snippet**:
  ```text
  E ReactNativeJS: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
  Source: packages/ui/src/context/FABContext.tsx:51 setState((prev) => ({ ...prev, actions: [], visible: false }))
  ```
- **Mechanism**: Every child screen passed an inline object literal into `useRegisterFAB({ tabType: 'community', ... })`. The `useEffect` had `config` in its dependency array, which triggered a state change in `FABProvider`, which passed down a newly memoized `value`, re-rendering the consumer, re-running `useEffect`, and looping indefinitely until React crashed.

### 2. Metro File Watcher & Windows Descriptor Starvation (`EMFILE`)
- **Source**: Metro Bundler running on Windows host (`@expo/cli` / `metro`).
- **Log snippet**:
  ```text
  Error: EMFILE: too many open files, open 'C:\x\node_modules\.pnpm\@expo+metro@56.0.2_supports-color@10.2.2\node_modules\@expo\metro\metro\lib\formatBundlingError.js'
  errno: -4066, code: 'EMFILE', syscall: 'open'
  ```
- **Mechanism**: Spawning multiple Metro transform workers simultaneously in Windows exceeded the OS file handle pool when scanning pnpm symlinks and cache files. Running with `--max-workers 1` resolved the file exhaustion.

### 3. Missing Schema Table (`PGRST205`) in Commercial Batches
- **Source**: `apps/gurudevi-mobile/app/(tabs)/_layout.tsx` -> `getCommercialBatches`.
- **Log snippet**:
  ```text
  W ReactNativeJS: '[TabsLayout] getCommercialBatches error:', {
    code: 'PGRST205',
    message: 'Could not find the table \'public.tuition_batches\' in the schema cache',
    hint: 'Perhaps you meant the table \'public.wisdom_notes\''
  }
  ```
- **Impact**: Tab layout fails to query tuition batches for monetization/tier ribbons on launch. Handled by fallback, but produces network error noise.

### 4. Premature PowerSync Access Guard Trigger
- **Source**: `packages/core` Wellbeing repository local mood log.
- **Log snippet**:
  ```text
  W ReactNativeJS: '[WellbeingRepository] Local Drizzle mood log fetch failed. Falling back to RPC API.',
  [Error: PowerSync bootstrap guard: browser code touched PowerSync before the app was ready. Use the direct API highway for bootstrap and identity, and only enter PowerSync after the runtime is intentionally registered.]
  ```
- **Impact**: Components mount and trigger local offline database queries before the PowerSync runtime registration lifecycle finishes. Triggers an RPC API fallback.

### 5. Local Sovereign Daemon Offline (`503 Service Unavailable`)
- **Source**: Feature tracking (`/api/tracking/features`), community posts/groups, and journal entries.
- **Log snippet**:
  ```text
  W ReactNativeJS: [Sovereign Client] Network offline or endpoint unreachable: http://localhost:3000/api/tracking/features
  W ReactNativeJS: '[useJournalEntries] Failed to refresh entries from server:', [Error: Service Unavailable]
  ```
- **Mechanism**: The mobile client has default endpoints pointing to local development services on `localhost:3000`. On a physical device, `localhost` points to the Android device itself unless reversed via adb or rewritten to the workstation LAN IP.

### 6. React Native Fabric SoftException on Focus
- **Source**: `ReactHostImpl.kt:919` (New Architecture Bridgeless).
- **Log snippet**:
  ```text
  W unknown:BridgelessReact: ReactHost{0}.raiseSoftException(onWindowFocusChange(hasFocus = "true")): Tried to access onWindowFocusChange while context is not ready
  ```
- **Mechanism**: Android window focus events are delivered before the React context initializes Bridgeless runtime bindings. Non-fatal soft exception.

### 7. Reanimated Surface Tag Mount Timing
- **Source**: `Reanimated` + `SurfaceMountingManager`.
- **Log snippet**:
  ```text
  W Reanimated: Caused by: com.facebook.react.bridge.RetryableMountingLayerException: Unable to find SurfaceMountingManager for tag: [64]
  ```
- **Mechanism**: Reanimated worklet animations executing on the native side before Fabric layout commit finishes.

---

## 3. Potential Architectural Issues & Systemic Dissolutions

Rather than applying ad-hoc patches, the codebase requires four architectural shifts:

### A. Eliminate Re-render Cascade Risk in Context Bus Systems
- **The Issue**: Context providers (like `FABContext`, `ToastContext`, `ThemeContext`) that accept registration calls from screens frequently suffer from circular dependencies: Screen renders -> registers config -> Context state updates -> Context value reference changes -> Screen re-renders -> registers again.
- **Systemic Dissolution**:
  1. **Split State from Actions**: Separate `FABStateContext` from `FABDispatchContext`. Dispatch functions remain completely immutable refs and never trigger consumer re-renders.
  2. **Ref-Buffered Registrations**: Replace raw useEffect identity arrays with ref-buffered registrations or a centralized pub/sub store (Zustand/NanoStores/Valtio) where screens publish actions into a store rather than triggering top-level React context updates.

### B. Two-Phase Startup Lifecycle (Boot Barrier)
- **The Issue**: Components in tabs mount eagerly and hit PowerSync, Drizzle, and Inngest before the bootstrap coordinator marks the runtime ready.
- **Systemic Dissolution**:
  - Implement a strict React Suspense boundary or `BootstrapBarrier` enclosing `(tabs)`. Tabs should not render until `isRuntimeRegistered() === true` and `deviceAccountScope` is resolved. No component can query offline sync until the barrier lifts.

### C. Physical Device Network Bridge Architecture
- **The Issue**: Hardcoded or environment-derived `localhost:3000` URLs fail on physical devices over USB/Wi-Fi.
- **Systemic Dissolution**:
  - Introduce an Android network resolution layer in `packages/core/src/api/client.ts`. If running on a physical Android device in `__DEV__`, route local daemon requests to the Metro host IP (`Constants.expoConfig.hostUri.split(':')[0]`) or register an automatic `adb reverse tcp:3000 tcp:3000` helper in dev tooling.

### D. Missing Schema Sync & Contract Validation
- **The Issue**: `public.tuition_batches` is missing from the database or schema cache, causing unhandled 400s.
- **Systemic Dissolution**:
  - Wire Supabase schema generation and Zod schema contracts into the CI quality gate so discrepancies between the client queries and the database schema are caught at build time rather than runtime.

---

## 4. Backlog: Tasks & Enhancements

### 🎯 Mobile Mascot
- [ ] Connect mascot animated states to user wellbeing actions (e.g. lotus/firefly mascot breathing during meditation, sadhana streaks, quiet mode).
- [ ] Implement responsive mascot positioning across different screen aspect ratios without blocking core interactive controls.
- [ ] Ensure brand tokens (`@repo/ui/src/tokens/motion.ts`) govern mascot physics and particle effects.

### 🏛️ Global Header
- [ ] Consolidate realm switchers (`ANANDA`, `SADHANA`), notifications, and settings into a standardized `SanctuaryHeader` component across all tabs.
- [ ] Unify offline/sync status indicators into the global header rather than fragmented banners across individual tabs.
- [ ] Fix overlapping header elements with Android status bar / cutout safe areas.

### 📱 All Screens Polish & Parity
- [ ] **Library Tab**: Handle offline collections gracefully and replace the raw "Failed to load sanctuary wisdom" box with `BrandedEmptyState`.
- [ ] **Workspace Tab**: Resolve blank state when switching tabs; render student study tools and assignment dashboards.
- [ ] **Community Tab**: Provide offline preview feed for unauthenticated or guest users with informative CTA to upgrade to full citizenship.
- [ ] **Profile Tab**: Populate complete Sadhana stats, attendance streaks, and dev role-switching console shortcut.

### 🗃️ App Catalog, Feature Flags & Feature Registry
- [ ] **Unified Catalog & Flag Engine**: Converge `registerAppCatalog`, GrowthBook remote flags, and the local feature discovery registry into a single source of truth.
- [ ] **Dynamic Feature Entitlements**: Tie feature visibility directly to user role/capacity (`student`, `teacher`, `principal`, `admin`) and pricing tier with declarative gating.
- [ ] **Deterministic Offline Fallbacks**: Ensure every feature flag and catalog entry has guaranteed offline defaults so app features never fail or hang when network is down.
- [ ] **Feature Discovery & Telemetry**: Standardize `discoverFeature()` calls across screens with automatic usage tracking and onboarding milestone triggers.

### 🎨 Canvas & App Flexibility
- [ ] **Infinite/Flexible Canvas System**: Support multi-modal canvas interactions (whiteboard, mind-mapping, freehand drawing, study workspaces) across mobile and tablet viewports.
- [ ] **Modular Widget Grid**: Introduce draggable and customizable dashboard tiles for Sadhana metrics, quick actions, and recent wisdom notes.
- [ ] **Adaptive Form Factor Support**: Enhance layout elasticity for foldables, tablets, and split-screen modes using breakpoint utilities (`useBreakpoint`, `useResponsiveGrid`).
- [ ] **Gesture & Zoom Architecture**: Integrate smooth high-performance Skia/Reanimated zoom and pan gestures with 60/120fps hardware acceleration.

### ✨ Modernization, Theming, UI & i18n
- [ ] **Comprehensive Theming Engine**: Support dynamic Sanctuary themes (Dawn, Day, Dusk, Midnight) with full HSL semantic token consistency across all shared components.
- [ ] **Modern Typography & Spacing Hierarchy**: Elevate visual craft using Google Fonts (Outfit, Inter), refined glassmorphism, and branded motion curves (`softCrossfadeScale`, `BrandPulse`).
- [ ] **Complete i18n Localization**: Ensure complete string coverage for English (`EN`), Sinhala (`SI`), and Tamil (`TA`) across all tabs, dialogs, and toast notifications.
- [ ] **RTL & Font Scalability**: Test and enforce dynamic font scaling (accessibility text sizes) without clipping and provide layout mirroring for RTL languages where applicable.

