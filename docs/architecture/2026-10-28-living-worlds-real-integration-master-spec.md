---
title: "The Living Worlds Real Integration Master Specification"
status: "active"
created: 2026-10-28
updated: 2026-10-28
author: "Naveen"
scribe: "Antigravity"
tags: [worlds, scene, architecture, integration, living-world, cross-platform, atlas, flow-dag]
---

# The Living Worlds Real Integration Master Specification

> **Cardinal Principle: Real Substrates Over Abstract Toys**  
> Living Worlds is not a museum demo or a marketing sidecar. It is the real sensory, visual, and spatial operating engine of the Gurudevi & EdLove platform across all live user journeys (Self, Classroom, Community, Library, Profile, Settings) on both **Next.js 16 Web** and **Expo 58 React Native**.
>
> This document is the permanent, authoritative architectural master specification and verification blueprint. It details every substrate, every file seam, the 6 core dimensions, the 5 integration gaps, the Feature & Capability Atlas integration, the Hostile Critic defenses, and the step-by-step implementation order.

---

## 1. The Unified Mental Model (6 Dimensions of Every View)

As codified in `docs/Core/design/2026-10-26-world-model.md`, every screen view resolves from the pure domain function:

$$\text{Scene} = \text{resolveScene}(\text{World}, \text{Time}, \text{Space}, \text{Ground}, \text{Budget}, \text{Expression})$$

```
                            ┌──────────────────────────────────────────────┐
                            │            1. WORLD (Cultural Identity)      │
                            │  11 Worlds: sanctuary, wewa, kele, ratna... │
                            └──────────────────────┬───────────────────────┘
                                                   │
                            ┌──────────────────────▼───────────────────────┐
                            │            2. TIME (Light & Arc)             │
                            │  6 Phases: predawn, dawn, morning, afternoon │
                            │            dusk, night (Sun/Moon position)   │
                            └──────────────────────┬───────────────────────┘
                                                   │
                            ┌──────────────────────▼───────────────────────┐
                            │            3. SPACE (The Room)               │
                            │  self, classroom, community, library, profile│
                            └──────────────────────┬───────────────────────┘
                                                   │
                            ┌──────────────────────▼───────────────────────┐
                            │            4. GROUND (The Backdrop)          │
                            │  'image' | 'live' | 'still' | 'quiet' | ... │
                            └──────────────────────┬───────────────────────┘
                                                   │
                            ┌──────────────────────▼───────────────────────┐
                            │            5. BUDGET (Verger Quality)        │
                            │  rich (30fps), balanced (15fps), essential(0)│
                            └──────────────────────┬───────────────────────┘
                                                   │
                                                   ▼
                                       ┌───────────────────────┐
                                       │   RESOLVED SCENE      │
                                       │   Tokens + Backdrops  │
                                       └───────────────────────┘
```

### The 6 Backdrop Grounds & Cross-Platform Painting Matrix

| Ground Mode | Meaning / Intent | Web Painting (`gurudevi-web`) | Mobile Painting (`gurudevi-mobile`) |
| :--- | :--- | :--- | :--- |
| **`image`** | Wallpaper asset (preset artwork, custom photo, or timed slideshow). | [`SceneImageLayer`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/components/SceneImageLayer.tsx) with CSS cross-fade, opacity & blur. | Native `SceneBackdrop` (RN Image with cross-fade & opacity under wash overlay). |
| **`live`** | Dynamic living sky tracking real time of day, sun/moon arc, and weather. | CSS multi-stop daylight gradient + `<FloorAtmosphere />` (rich tier). | Skia [`SceneBackdrop`](file:///c:/x/packages/ui/src/scene/native/SceneBackdrop.tsx) with `SceneStill` + `SceneWeather`. |
| **`still`** | Static landscape snapshot under the current phase light. | CSS 2-stop phase gradient, zero motion. | Skia `SceneStill` without weather particle loop. |
| **`quiet`** | High-focus tinted reading ground for dense administrative tasks. | World ground tint with verified 4.5:1 text contrast wash. | Flat `View` with `scene.colour` wash overlay. |
| **`solid`** | Single user-selected color or neutral slate. | CSS solid background color. | Flat `View` with `backgroundColor: ground.colour`. |
| **`plain`** | Pure base world paper/cloth token. | `var(--gd-ground)` from `@repo/ui/world/dom`. | `wt.ground` from `@repo/ui/world/native`. |

---

## 2. Inventory of Current Substrates & The 5 Exact Integration Gaps

### Substrate Status (What Is Already Built & Verified)

1. **`@repo/ui/world`**:
   * Complete definitions for all 11 worlds in [`packages/ui/src/world/worlds.ts`](file:///c:/x/packages/ui/src/world/worlds.ts) (`sanctuary`, `wewa`, `ratna`, `kele`, `tea`, `kandyan`, `angampora`, `perahera`, `rosa`, `colombo`, `spark`).
   * CSS generation in [`packages/ui/src/world/css.ts`](file:///c:/x/packages/ui/src/world/css.ts) (`worldStylesheet()`, `worldCssVariables()`).
   * Native hooks and components in [`packages/ui/src/world/native/`](file:///c:/x/packages/ui/src/world/native/) (`useWorld()`, `Button`, `Section`, `Row`, `WaitingSign`, `Perch`).
   * DOM components in [`packages/ui/src/world/dom/`](file:///c:/x/packages/ui/src/world/dom/) (`WorldStyles`, `WorldScope`, `Button`, `Section`).
2. **`@repo/core/scene`**:
   * Pure resolver in [`packages/core/src/scene/resolveScene.ts`](file:///c:/x/packages/core/src/scene/resolveScene.ts).
   * Sky light, seasonal palettes, and weather models in [`packages/core/src/scene/sky.ts`](file:///c:/x/packages/core/src/scene/sky.ts).
3. **Web Sanctuary Canvas**:
   * [`SanctuaryFloorCanvas.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/components/SanctuaryFloorCanvas.tsx) mounted across all real web floors (`SelfFloor`, `CommunityFeedFloor`, `LibraryFloor`, `WorkspaceFloor`, `ProfileFloor`, `NotificationsFloor`).
   * [`SceneImageLayer.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/components/SceneImageLayer.tsx) providing hardware-accelerated image wallpaper cross-fading and verger budget gating.
   * Root layout [`apps/gurudevi-web/app/layout.tsx`](file:///c:/x/apps/gurudevi-web/app/layout.tsx#L81) injecting `<WorldStyles />` and initializing `data-world`, `data-phase`, and `data-mode`.
4. **Mobile Tabs & Headers**:
   * [`apps/gurudevi-mobile/app/(tabs)/_layout.tsx`](file:///c:/x/apps/gurudevi-mobile/app/(tabs)/_layout.tsx#L86) reading `useWorld().tokens` (`wt.ground`, `wt.sunken`, `wt.lamp`, `wt.line`).
   * [`GlobalHeader.tsx`](file:///c:/x/packages/ui/src/components/GlobalHeader.tsx) and [`TeacherClassroomDashboard.tsx`](file:///c:/x/packages/classroom/src/screens/TeacherClassroomDashboard.tsx) mounting Skia `<SceneBackdrop scene={scene} />`.
   * [`useScene`](file:///c:/x/packages/ui/src/scene/native/useScene.ts) managing the 1-minute circadian clock tick without 60fps frame loops.

---

### The 5 Concrete Gaps to Bridge

#### Gap 1: Incomplete World Backdrop Mapping in `appearanceConstants.ts`
* **Problem**: In [`apps/gurudevi-web/lib/canvas/appearanceConstants.ts`](file:///c:/x/apps/gurudevi-web/lib/canvas/appearanceConstants.ts), `WORLD_BACKDROPS` only contains entries for 4 worlds (`sanctuary`, `wewa`, `kandyan`, `kele`). The other 7 worlds (`ratna`, `tea`, `angampora`, `perahera`, `rosa`, `colombo`, `spark`) fall back to `sanctuary`.
* **Fix**: Provide canonical artwork and preset wallpaper mappings for all 11 worlds so that selecting any world in the Floor Studio immediately displays its appropriate cultural artwork and atmosphere.

#### Gap 2: Web Living Sky Gradient Missing on `groundMode="live"` & Forced Wallpaper Bug
* **Problem 1**: When a user selects `groundMode: 'live'` in `FloorStudioDrawer`, `SanctuaryFloorCanvas` sets `data-ground-mode="live"`, but there is no CSS gradient rule tied to that attribute.
* **Problem 2**: In `SanctuaryFloorCanvas.tsx` line 205:
  ```typescript
  const effectiveWallpaper = activeWallpaper ?? (dataMode === 'explore' ? ... : (getBackdropsForWorld(activeWorld)[0] ?? null));
  ```
  Even when the user selects "Live Sky" (setting `activeWallpaper` to `null`), `effectiveWallpaper` falls back to the world's default wallpaper! As a result, the wallpaper layer is always active and masks the living sky.
* **Fix**:
  1. Only compute an `effectiveWallpaper` when `groundMode === 'image'`. When `groundMode === 'live'` or `'still'`, `effectiveWallpaper` must be `null`.
  2. Inject dynamic daylight sky variables (`--gd-sky-top`, `--gd-sky-horizon`, `--gd-sky-glow`) derived from `skyPaletteAt()` into `WorldStyles`, and style `[data-ground-mode="live"]` and `[data-ground-mode="still"]` to render the dynamic daylight gradient.

#### Gap 3: Missing `ground` Property in `Scene` & Mobile Image Backdrops
* **Problem**: In [`packages/core/src/scene/resolveScene.ts`](file:///c:/x/packages/core/src/scene/resolveScene.ts), `SceneInput` accepts `ground?: SceneGround`, but the returned `Scene` object does not include `ground: SceneGround`. Consequently, [`SceneBackdrop.tsx`](file:///c:/x/packages/ui/src/scene/native/SceneBackdrop.tsx) on native mobile has no knowledge of whether the user selected an image wallpaper or a live sky. Furthermore, `SceneBackdrop.tsx` only renders Skia vector geometry, completely ignoring `{ kind: 'image' }`.
* **Fix**:
  1. Add `readonly ground: SceneGround;` to the `Scene` interface in `resolveScene.ts`.
  2. Update `SceneBackdrop.tsx` to handle `scene.ground.kind === 'image'`, rendering the image with the wash veil overlay to preserve text contrast.

#### Gap 4: Bi-Directional World & Appearance Persistence
* **Problem**: 
  * On Web: [`useWorldTheme`](file:///c:/x/apps/gurudevi-web/lib/theme/useWorldTheme.ts) reads/writes to `localStorage` (`gurudevi_world`, `gurudevi_theme`), but authenticated users' choices are only optionally pushed to cloud metadata.
  * On Mobile: `CircadianProvider` manages phase and time, but user world selections in App Settings must cleanly propagate to `WorldContext` and `useScene()`.
* **Fix**: Ensure that selecting a world in `FloorStudioDrawer` (Web) or App Settings (Mobile) immediately updates both `WorldContext` and `useScene()`, with decoupled persistence via `StorageManager`.

#### Gap 5: Live Screen Token Dressing
* **Problem**: Several existing screens (e.g. `SelfScreen.unified.tsx`, `TeacherClassroomDashboard.tsx` content cards, library lists) still use legacy hardcoded Tailwind classes (`bg-slate-900`, `text-gray-400`) instead of living world tokens (`wt.raised`, `wt.ink`, `wt.lamp`, `var(--gd-surface)`).
* **Fix**: Progressively dress existing cards, buttons, and text surfaces with `useWorld().tokens` (native) and `WorldStyles` classes/variables (web), strictly enforced by `node scripts/check-world.mjs`.

---

## 3. Connection to Feature Atlas (`docs/atlas/`) & `/user-journey-orchestration`

### How the Feature Atlas Evaluates Living Worlds
`docs/atlas/features.yaml` tracks 71 features across 6 evaluation layers:
1. **`schema`**: Database models in ZenStack ZModel (`packages/schema/schema.zmodel`).
2. **`api`**: oRPC/Hono mounted procedures (`apps/sanctuary-api`).
3. **`client`**: Typed RPC call sites (`@repo/core/api`).
4. **`screen`**: Resolved screen route files in `app/`.
5. **`nav`**: Verified inbound links or workspace role-dispatch.
6. **`real_data`**: Live database queries or PowerSync sync (no ungated mocks).

In the baseline audit, `gurudevi-web-sanctuary` was marked **`PARTIAL`** due to ungated mocks in `selfExplore.ts` and missing live sky gradient rules. By completing the real integration of Living Worlds into `SanctuaryFloorCanvas` and `TeacherClassroomDashboard`, this capability is elevated to **`LIVE`** with verified real-data pathways.

### The `/user-journey-orchestration` Invariants
1. **The Passive Router Law**: `apps/gurudevi-mobile` (Expo Router) and `apps/gurudevi-web` (App Router) are display projections only. They do not hold journey logic.
2. **Declarative Flow DAGs**: All multi-vector screen entries (cold boot, deep link, notification tap, tab click) are governed by flow state machines in `packages/core/src/flows`.
3. **FlowDAG Static Audit**: Run `node scripts/audit-flow-dag.mjs` to ensure zero broken route edges, zero dead ends, and 100% actor admission compliance across all 76 web routes and 92 mobile routes.

---

## 4. The Ruthless Pragmatic Hostile Critic Audit

Before proposing code changes, the architecture is audited against potential real-world failure modes:

| Vector | Hostile Finding | Severity | Pragmatic Defense |
| :--- | :--- | :--- | :--- |
| **Battery & Frame Rate Thrashing** | Ticking circadian clocks or weather particles causing 60fps React render loops. | **HIGH** | `useMinuteClock` ticks strictly once every 60,000ms. Weather particle animation runs inside Skia/Reanimated on the UI thread without triggering React component re-renders. |
| **WCAG Contrast Invariant** | A user selects a high-key daylight wallpaper (e.g. bright white beach) that makes text unreadable. | **HIGH** | `resolveScene` computes `wash.colour` and `wash.text` using `contrastRatio()`. The wash veil overlay is rendered directly between the image and the content, guaranteeing WCAG AA 4.5:1 text contrast. |
| **Mobile Memory Bloat (Hermes OOM)** | Native app downloading uncompressed 4K wallpapers into memory, triggering Hermes heap exhaustion. | **HIGH** | Mobile `SceneBackdrop` clamps image sizes, uses `resizeMode="cover"`, and verger checks (`budget.quality === 'essential'`) disable image backdrops on low-memory devices. |
| **Offline Cold Boot** | Device boots offline in a remote classroom; image CDN is unreachable. | **MEDIUM** | Fail-safe fallback: If wallpaper fails to load, `SceneBackdrop` gracefully falls back to the world's base ground token (`wt.ground`), ensuring zero blank/broken screens. |
| **CSS Variable Flash (Hydration Mismatch)** | Next.js server-rendered HTML flashes plain white before world styles hydrate. | **MEDIUM** | Root `app/layout.tsx` inlines `<WorldStyles />` and writes `data-world="sanctuary"` directly onto `<html>` during SSR. |

---

## 5. Detailed Step-by-Step Implementation Blueprint

### Step 1: Core Scene Resolver Ground Pass-Through
In [`packages/core/src/scene/resolveScene.ts`](file:///c:/x/packages/core/src/scene/resolveScene.ts):
1. Add `readonly ground: SceneGround;` to the `Scene` interface.
2. Pass `ground: input.ground ?? { kind: 'sky' }` in the return object of `resolveScene()`.
3. Verify unit tests in `packages/core/src/scene/resolveScene.test.ts`.

### Step 2: Complete All 11 Worlds in `appearanceConstants.ts`
In [`apps/gurudevi-web/lib/canvas/appearanceConstants.ts`](file:///c:/x/apps/gurudevi-web/lib/canvas/appearanceConstants.ts):
1. Map all 11 worlds (`sanctuary`, `wewa`, `ratna`, `kele`, `tea`, `kandyan`, `angampora`, `perahera`, `rosa`, `colombo`, `spark`) to their canonical artwork in `/artwork/` and `/wallpapers/`.
2. Ensure `getBackdropsForWorld(worldId)` never returns empty for any valid `WorldId`.

### Step 3: Web Living Sky Gradients & Wallpaper Gating
1. In [`apps/gurudevi-web/app/(sanctuary)/components/SanctuaryFloorCanvas.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/components/SanctuaryFloorCanvas.tsx):
   * Gate `effectiveWallpaper` so it is `null` when `groundMode === 'live'` or `groundMode === 'still'`.
2. In [`packages/ui/src/world/css.ts`](file:///c:/x/packages/ui/src/world/css.ts) & global web CSS:
   * Provide CSS variables `--gd-sky-top`, `--gd-sky-horizon`, `--gd-sky-glow` derived from the active phase sky palette.
   * Attach linear gradients to `[data-ground-mode="live"]` and `[data-ground-mode="still"]`.

### Step 4: Native Image Ground Rendering in `SceneBackdrop.tsx`
In [`packages/ui/src/scene/native/SceneBackdrop.tsx`](file:///c:/x/packages/ui/src/scene/native/SceneBackdrop.tsx):
* Check `if (scene.ground.kind === 'image' && scene.ground.url)`.
* Render native `<Image>` with `resizeMode="cover"` and the text contrast wash overlay.

### Step 5: Screen Integration Proof & Verification
* Verify Web: Open Floor Studio drawer on `WorkspaceFloor` and switch between all 11 worlds and ground modes (`Live Sky`, `Still Sky`, `Photo`). Verify instant theme and backdrop updates.
* Verify Mobile: Check `TeacherClassroomDashboard.tsx` and `GlobalHeader.tsx` to ensure `SceneBackdrop` renders cleanly without layout shifts.

---

## 6. Verification & Quality Gates

Every change must pass the following non-negotiable verification gates before declaring completion:

1. **Dual-Engine Typecheck**:
   ```powershell
   node scripts/typecheck-engine.mjs --fast
   ```
   *Expected*: Exit code 0 across all 37 workspaces (TSGO v7.1.0-beta).
2. **World Guardrail Audit**:
   ```powershell
   node scripts/check-world.mjs
   ```
   *Expected*: Exit code 0 (`World guardrail: dressed files clean; raw hex <= 4352`).
3. **FlowDAG Routing Audit**:
   ```powershell
   node scripts/audit-flow-dag.mjs
   ```
   *Expected*: Exit code 0 (0 route mismatches, 0 broken edges across web and mobile).
4. **Anti-Slop Sentinel**:
   ```powershell
   pnpm run check:anti-slop
   ```
   *Expected*: Exit code 0 (zero CNG violations, zero native slop).

