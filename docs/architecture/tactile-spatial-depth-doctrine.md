---
title: "Organic Spatial Depth & Polymorphic Workspace Layout Doctrine"
status: "active"
created: 2026-09-08
updated: 2026-09-08
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, ui, design-system, tactile-elevation, canvas, zero-shadow, spatial-arrangements, consolidation]
---

# Organic Spatial Depth & Polymorphic Workspace Layout Doctrine

> **Core Thesis**: Authentic digital depth does not come from blurry Gaussian drop shadows or decorative glassmorphism. It is generated through **spatial datums, planar contrast, tactile inking, typographic mass, physical occlusion**, and **pluggable polymorphic spatial arrangements** (`catalog-grid`, `carousel`, `stream`).

---

## 1. The Anti-Pattern: Why "Soft UI" & Bespoke Fragmented Screens Fail

In modern UI development, generic AI-assisted styling and un-governed screen implementations default to two major failure modes:

1. **Visual Fog (Gaussian Shadows & Blurs)**:
   - Blurry Gaussian shadows (`box-shadow: 0 10px 30px rgba(0,0,0,0.08)`).
   - Frosted glass backdrops (`backdrop-filter: blur(16px)`) with low-contrast borders.
   - Nested Russian-doll containers with no clear functional purpose.
   - *Impact*: Destroys contrast ratios, creates sluggish GPU frame drops, and lacks brand identity.

2. **Bespoke Screen Duplication (Shallow Implementations)**:
   - Creating ad-hoc carousels or hardcoded tile grids directly inside individual domain screens (`SelfScreen`, `ClassroomScreen`, etc.).
   - Duplicating card wrapping, pin toggling, hide toggling, and reordering logic across every feature surface.
   - Inability to A/B test or switch arrangements dynamically without rewriting screens.

---

## 2. The 6 Pillars of Organic Tactile Depth

```
+-------------------------------------------------------------------------+
|  [01] GROUND DATUM       : Dotted Matrix Floor (radial-gradient / tile)  |
|  [02] PHYSICAL OCCLUSION : Solid Opaque Card Masking the Ground Grid    |
|  [03] TACTILE INKING     : 1.25px - 1.5px Dark Architectural Borders     |
|  [04] HARD 3D BEVEL      : 0px-Blur Offset Elevation (box-shadow / rim) |
|  [05] PLANAR UNDERLAYS   : Saturated/Muted Geometric Color Slabs         |
|  [06] TYPOGRAPHIC MASS   : Heavy Display Type + Anchor Highlight Lines  |
+-------------------------------------------------------------------------+
```

### Pillar 1: The Spatial Ground Matrix (Datum 0)
- **Mechanics**: Canvas viewport renders a subtle dotted vellum datum floor. Solid cards with 100% opaque fills occlude the dots, establishing natural depth.
- **Web**: `radial-gradient(#2A2318 0.75px, transparent 0.75px)` with `16px 16px` spacing.
- **Native**: Lightweight SVG pattern / themed ground surface.

### Pillar 2: Tactile Inking (Hard Boundary Silhouette)
- **Mechanics**: Solid `1.25px` or `1.5px` architectural perimeter (`Theme.colors.border` / `#1E1B18` light, `#3E3830` dark).

### Pillar 3: Hard-Offset Zero-Blur 3D Bevels
- **Mechanics**:
  - Regular State: `boxShadow: '0px 1.5px 0px rgba(107, 100, 128, 0.16)'` (web) or `borderBottomWidth: 2` (native).
  - Hover / Lifted: `transform: translate(-1px, -1px); boxShadow: '0px 2.5px 0px rgba(107, 100, 128, 0.24)'`.
  - Pressed / Active: `transform: translate(1px, 1px); boxShadow: '0px 0px 0px transparent'`.

### Pillar 4: Planar Color Slabs & Energy Vibes
- **Mechanics**: Subtle geometric color accents (e.g. `[#E8E3D5, #8C7B65]`) denoting the energy and frequency of each workspace capability.

### Pillar 5: Typographic Mass & Structural Kickers
- **Mechanics**: Monospace category tags (`[ WELLBEING // ACTIVE ]`), bold display headers, and clean metadata chips.

### Pillar 6: Directional Glyphs & Mechanical Controls
- **Mechanics**: Reorder steppers (`▲` `▼`), pin toggles (`📌`), and tactile quick-action triggers.

---

## 3. Polymorphic Spatial Arrangements

All workspace domains (`self`, `classroom`, `library`, `community`, `admin`) share a single, unified engine via `@repo/ui/components/workspace`. The layout is controlled dynamically by the `spatialArrangement` prop:

```
                  ┌─────────────────────────────────┐
                  │    ResponsiveWorkspaceCanvas    │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │        CanvasZoneColumn         │
                  │  (spatialArrangement switcher)  │
                  └──────┬─────────┼─────────┬──────┘
                         │         │         │
        ┌────────────────┘         │         └────────────────┐
        ▼                          ▼                          ▼
 ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
 │ catalog-grid │          │   carousel   │          │    stream    │
 │  (2-column   │          │ (horizontal  │          │  (vertical   │
 │   tactile    │          │  snap track, │          │  workbench   │
 │   squares)   │          │  decel fast) │          │  with dnd)   │
 └──────┬───────┘          └──────┬───────┘          └──────┬───────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  ▼
                     ┌──────────────────────────┐
                     │    CanvasSurfaceCard     │
                     │  layoutMode: card|tile   │
                     └──────────────────────────┘
```

| Mode | Target User Intent | Visual Topology | Layout Card Mode |
| :--- | :--- | :--- | :--- |
| **`catalog-grid`** | Discovery, browsing, overview | 2-column square tactile cards with compact vibe badges and quick actions. | `tile` |
| **`carousel`** | Focused inspection, hero browsing | Horizontal snap track (`snapToInterval={296}`, `decelerationRate="fast"`). | `card` (fixed width 280px) |
| **`stream`** | Dense execution, daily workflow | Full vertical stack with drag-to-reorder, steppers (`▲▼`), and rich body slots. | `card` (full width) |

---

## 4. Consolidated Architecture in `@repo/ui`

### Unified Components:
1. **[`ResponsiveWorkspaceCanvas.tsx`](file:///c:/x/packages/ui/src/components/workspace/ResponsiveWorkspaceCanvas.tsx)**:
   - Root ground datum with dotted matrix and depth presets (`sanctuary-calm`, `architectural-ink`, `flat-zen`).
   - Cross-platform responsive column layout (Mobile single column, Tablet grid, Web multi-column).
   - Universal sorting, reordering, pin/hide delegation.

2. **[`CanvasZoneColumn.tsx`](file:///c:/x/packages/ui/src/components/workspace/CanvasZoneColumn.tsx)**:
   - Renders canonical workspace zones (`today`, `work`, `institution`, `outlook`, `private`).
   - Dynamically switches rendering structure between `catalog-grid`, `carousel`, and `stream`.

3. **[`CanvasSurfaceCard.tsx`](file:///c:/x/packages/ui/src/components/workspace/CanvasSurfaceCard.tsx)**:
   - Polymorphic card renderer supporting `layoutMode: 'card' | 'tile' | 'hero'`.
   - Incorporates zero-shadow tactile depth, category kickers, energy badges, and reorder controls.

4. **[`DraggableCanvasSurface.tsx`](file:///c:/x/packages/ui/src/components/workspace/DraggableCanvasSurface.tsx)**:
   - Gesture-based tactile drag physics for mobile (`react-native-reanimated`) and `@dnd-kit` on web.

---

---

## 5. Architectural Contract: Canvas vs. Floor

As the platform matures across Web, Tablet, and Native Mobile, the spatial engine follows a strict separation of concerns between **Canvas** (spatial mathematics & headless arrangement) and **Floor** (platform-native tactile surface, ergonomics, and atmosphere):

```
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 2: Interactive Stage & Ergonomic Cards                          │
│  (Fire Journal, Practices, Rails, Accessible Text, Focus Traps)       │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 1: Tactile Floor Surface (Platform UI)                          │
│  (Next.js CSS Modules / RN Views, Vignette, Blur, Safe Areas, Margins) │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 0: Atmospheric Shading Ground (Game/Shader Engine)              │
│  (WebGPU / Skia v3 Graphite / TypeGPU / Canvas2D Particles / SVG Mesh) │
└────────────────────────────────────────────────────────────────────────┘
```

### The Roles Defined

| Concept | Layer | Responsibilities | Key Rule |
| :--- | :--- | :--- | :--- |
| **Canvas** | Headless Logic | - Item ordering, categories & grouping<br>- Pinned & hidden item state (cap of 2)<br>- Viewport breakpoint math (`mobile`, `tablet`, `desktop`)<br>- Adaptive layout mode (`overview`, `master-detail`, `stream`)<br>- Headless sync (Supabase / localStorage) | **Headless only**: 0 JSX, 0 DOM, 0 React Native views. Pure state and spatial mathematics. |
| **Floor** | UI & Atmosphere | - Physical ground under the seeker's feet<br>- Web: semantic HTML, CSS Grid, media queries, CSS Modules<br>- Mobile: React Native `ScrollView`, safe-areas, touch targets ($\ge 44\text{px}$)<br>- Tactile atmospheric backdrops (radial blooms, parchment grain, embers) | **Platform-native**: Web renders in Next.js (`apps/gurudevi-web`), Mobile renders in Expo (`apps/gurudevi-mobile`). |

### Standalone Domain Canvases (Zero Mangling)
Rather than forcing all domains into a bloated `WorkspaceCanvas` with institutional zone decks (`today`, `work`, `institution`), each of the **5 sanctuary tabs** owns a dedicated, decoupled domain canvas:
1. `SelfCanvas` (`useSelfCanvas`): Personal practices, reflection, Fire Journal, Lotus mood, streaks (pin cap 2).
2. `WorkspaceCanvas` (`useWorkspaceCanvas`): School/classroom management, attendance, gradebook, timetable (pin cap 4).
3. `CommunityCanvas` (`useCommunityCanvas`): Circles, announcements, feed, discussions (pin cap 0).
4. `LibraryCanvas` (`useLibraryCanvas`): Curricula, scrolls, books, reading history (pin cap 2).
5. `ProfileCanvas` (`useProfileCanvas`): Identity, achievements, credentials, account settings (pin cap 3).

### Cross-Device Form Factor & Ergonomics
- **Mobile Phone ($< 768\text{px}$)**: Single-column `stream` layout optimized for one-handed thumb reach with prominent `← Back to Overview` navigation.
- **Tablet ($768\text{px} - 1024\text{px}$)**: Dual-pane **`master-detail`** layout. The Practice Catalog Rail ($320\text{px}$) docks on the left, while the active reflection/ritual renders on the right stage.
- **Desktop Web ($> 1024\text{px}$)**: Panoramic bento grid overview with side-rail expansion during deep task execution.

---

## 6. Atmospheric Ground & Shading Architecture (WebGPU / Skia / TypeGPU)

The Floor provides atmospheric immersion without degrading typographic legibility or UI performance:

1. **Zero-Rerender GPU Shading**:
   - Background atmospheres (particles, embers, fluid mesh) run in Layer 0 via WebGL/WebGPU or Canvas 2D on web, and via `react-native-skia` v3 (Graphite/WebGPU fork) on native mobile.
   - Animations live strictly on the GPU thread or via CSS compositor (`transform`, `opacity`), never triggering React re-renders.
2. **WCAG Legibility Guardrail**:
   - Layer 1 applies a contrast-preserving paper tone and vignette between the shader and text, guaranteeing WCAG AA/AAA compliance across `default`, `dawn`, `garden`, and `night` presets.
3. **Future TypeGPU Portability**:
   - Shaders defined in TypeGPU cross-compile between browser WebGPU and native Skia runtime effects.

---

## 7. What Was Accomplished & What Remains

### ✅ Accomplished (Production Hardened):
- **Canvas vs. Floor Decoupling**: Defined and implemented the headless `useSelfCanvas` spatial engine in `apps/gurudevi-web/lib/canvas/useSelfCanvas.ts`.
- **Master-Detail Rail & Quick-Switch**: Upgraded `SelfFloor.tsx` to render both quick-switch Pinned practices and the complete Categorized Practice Catalog directly in the left rail, enabling fluid in-workflow practice transitions on tablets and desktop without returning to overview.
- **SSR Hydration Resilience**: Refactored responsive layout containers to rely on CSS media queries and container styling, eliminating SSR-to-client layout mismatch.
- **Palette-Adaptive Atmospheric Shading**: Shipped `FloorAtmosphere.tsx` with preset-adaptive particle shading (`night` = silver star dust, `dawn` = warm amber mist, `garden` = sage green, `default` = sacred lotus gold), RAF timestamp delta throttling ($\le 35\text{fps}$ on mobile/tablet), and automatic pausing when tabs are hidden (`document.hidden`).
- **Cross-Device Supabase Layout Synchronization**: Upgraded `useBrowserWorkspaceAppearance.ts` to manage `pinnedIds` and sync both `pinned` and `groupOrder` to Supabase `workspace_layouts`, establishing seamless cross-device parity with mobile's `@repo/core/native/useWorkspaceLayoutSync`.
- **The 5 Standalone Domain Canvases**: Built and wired standalone headless hooks across all 5 sanctuary floors:
  - `Self`: `useSelfCanvas.ts` (Practice stage + catalog rail)
  - `Community`: `useCommunityCanvas.ts` (Circles rail + Feed stream)
  - `Library`: `useLibraryCanvas.ts` (Collections shelf + Reader stage)
  - `Workspace`: `useWorkspaceCanvas.ts` (Operational zones: `today`, `work`, `institution`, `outlook`)
  - `Profile`: `useProfileCanvas.ts` (Identity & security sections)
- **Strict Verification Gate**: 44/44 tests passing across `domainCanvases.test.ts` (G1), `selfCanvas.test.ts` (G1), `selfFloor.test.tsx` (G1), and `selfFloor.component.test.tsx` (G2). Monorepo typecheck clean (0 errors).

### 🔮 Future Roadmap (Stage 2 Graphics & Mobile Evolution):
1. **TypeGPU & Skia WebGPU Shaders**: Elevate the 2D canvas particle loop to hardware compute shaders via TypeGPU / Skia WebGPU as devices support WebGPU natively.
2. **Native Mobile Alignment**: Wire mobile's `SanctuaryOverviewHub.tsx` to directly consume the unified `workspace_layouts` record emitted by the web platform.


