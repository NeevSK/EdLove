---
title: "Sanctuary Spatial Canvas & Furniture Framework Architecture"
status: "active"
created: 2026-10-18
updated: 2026-10-18
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, spatial-canvas, furniture, wallpaper, slideshow, gurudevi-web, indexeddb]
---

# Sanctuary Spatial Canvas & Furniture Framework Architecture

> **PRIME DIRECTIVE: CONVIVIAL SPATIAL CALIBRATION WITHOUT COGNITIVE OR HARDWARE BLOAT**  
> Software exists to lift administrative drudgery and provide contemplative, grounded space. In Gurudevi Sanctuary, digital rooms ("floors") must feel anchored, peaceful, and tactile. Wallpapers must never distort into enormous, pixelated vertical banners, nor should visual customizations compromise WCAG contrast, exhaust client-side storage quotas, or drain device batteries.

---

## 1. Architectural Motivation & Landscape

### The Fragmentation Problem
As multiple domain floors (`Self`, `Library`, `Workspace`, `Community`, `Settings`) evolved across Gurudevi Web:
1. Visual atmosphere and wallpaper integration became scattered across inconsistent components (`FloorAtmospherePicker`, `WorkspaceAppearancePicker`, ad-hoc toolbars).
2. Because `<WorkspaceWallpaperLayer>` was originally mounted with `position: absolute; inset: 0` inside 2,000–3,000px floor containers, wallpapers were zoomed in ~3× by `background-size: cover`, causing severe visual distortion and jarring vertical movement on scroll.
3. Floor furniture (toolbars, fire journal, arrival cards, catalogs, attendance rosters) was rendered with rigid, hardcoded layouts without a unified spatial staging mechanism.

### The Spatial Framework Solution
The **Sanctuary Spatial Framework** introduces a unified, modular layout standard anchored around `<SanctuaryFloorCanvas>`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Sanctuary Navigation Header                     │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ <SanctuaryFloorCanvas> (Fixed 100vw × 100vh Background)                │
│                                                                        │
│  [ Layer 0: Fixed Viewport Wallpaper (Cross-Fading Surfaces) ]         │
│  [ Layer 1: Atmospheric Shader (Washi Grain / Aurora / Embers) ]       │
│  [ Layer 2: Color Wash (Sandstone / Dawn / Garden / Night / Off / Hex) ]│
│                                                                        │
│  ┌──────────────────────────────────────────────────┐  ┌────────────┐  │
│  │ Flowing Content Stage (Scrollable z-index: 10)   │  │ [⚙ Studio] │  │
│  │                                                  │  │ (Top-Right)│  │
│  │  ┌────────────────────────────────────────────┐  │  └────────────┘  │
│  │  │ Pinned Furniture Modules (at room top)    │  │        │         │
│  │  └────────────────────────────────────────────┘  │        ▼         │
│  │  ┌────────────────────────────────────────────┐  │  ┌────────────┐  │
│  │  │ Ordered Floor Furniture (LivingCards, etc) │  │  │<FloorStudio│  │
│  │  └────────────────────────────────────────────┘  │  │  Drawer>   │  │
│  └──────────────────────────────────────────────────┘  │(Slide-Over)│  │
│                                                        └────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

* **Layer 0 (Static Parallax Viewport)**: Wallpapers are anchored to the browser viewport window (`100vw × 100vh`). Content glides across the tranquil background with natural depth.
* **Layer 1 (Atmospheric Shaders)**: Tactile washi grain, aurora breathing meshes, and celestial embers provide subtle somatic texture without CPU/GPU overload.
* **Layer 2 (Diurnal / Custom Color Wash)**: Contemplative color tints (`Sandstone`, `Dawn`, `Garden`, `Night`), custom color hexes with opacity control, or pure transparent (`Off`) modes.
* **Layer 3 (Spatial Furniture Stage)**: Floor modules dynamically rendered and arranged according to user spatial preferences (`groupOrder`, `pinnedIds`, `hiddenIds`).
* **Layer 4 (Floor Studio Trigger & Drawer)**: A top-right button (`⚙ Floor Studio`) that slides out a glassmorphic drawer for atmosphere and furniture controls.

---

## 2. Multi-Wallpaper Slideshow & Battery-Safe Lifecycle

For contemplative presence, floors support cycling through sets of curated or user-uploaded wallpapers:

```
[ Active Wallpaper A (Opacity: 1) ]  ─────── (Cross-fade 1.2s) ───────> [ Incoming Wallpaper B (Opacity: 0 -> 1) ]
                  ▲                                                                 │
                  └────────────── (Cadence: 3m / 5m / 15m / On Arrival) ────────────┘
```

### Lifecycle Invariants
1. **Background Tab Suspension**: When `document.visibilityState === 'hidden'`, the slideshow timer is immediately suspended. No background transitions or decoded bitmap thrashing occur while the user is away.
2. **Dual-Layer Surface Cross-Fade**: Two discrete `div` elements interpolate opacity via CSS transitions (`opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1)`) to prevent momentary blank flashes or layout reflows during image swaps.
3. **Low-Power Mode Compliance**: When `useBrowserVisualBudget().quality === 'essential'`, slideshow animations are disabled, displaying a single static background.

---

## 3. Custom Image Ingestion & Storage Topology

```
[ User Image Drop / Select ]
           │
           ▼
[ Offscreen HTMLCanvas Resizer ] ──> Max 1920x1080 | WebP format | Quality 0.82 (< 350KB)
           │
           ▼
[ IndexedDB Repository ] ──────────> "SanctuaryWallpaperDB" (Zero localStorage quota risk)
           │
           ▼ (If Authenticated)
[ Supabase Storage ] ──────────────> Bucket: "user-wallpapers" (Async background sync)
```

### The Storage Sentinel Law
* **Rule**: Raw Base64 images must **NEVER** be stored in `window.localStorage`.
* `localStorage` is restricted to metadata tokens (`id`, `preset`, `motion`, `slideshowIntervalSeconds`, `washColor`). The binary payloads reside safely in client-side `IndexedDB`.
* The offscreen canvas downsampler scales any source image to a maximum dimension of `1920×1080` and encodes it as WebP at quality `0.82`. This guarantees the image payload never exceeds 350KB, protecting GPU texture memory.

---

## 4. Floor-Wise Spatial Furniture Registry

Each floor defines a declarative set of furniture modules:

### A. Self Floor (`/self`)
* `arrival`: Contemplative welcome & diurnal posture
* `taskstrip`: Active workbench task tabs
* `temporal-horizon`: Date & civil timeline navigator
* `overview`: Practice tools & quick access grid
* `fire-journal`: Burning Journal & emotional release chamber

### B. Library Floor (`/library`)
* `arrival`: Library collection welcome
* `taskstrip`: Reading tasks strip
* `catalog`: Resource Catalog Shelf & subject filters
* `invitations`: Curated study dialogues & invitations

### C. Workspace Floor (`/workspace`)
* `role-lens`: Perspective switcher (Teacher / Student / Guardian / Principal)
* `workspace-nav`: Domain tool navigation bar
* `taskstrip`: School operations tasks strip
* `temporal-horizon`: Classroom attendance date horizon
* `attendance`: Daily attendance grid & drift insights

### D. Community Floor (`/community`)
* `arrival`: Community Circle greeting & sample notice
* `search`: Circle search input and directory status
* `circles`: Community circles list, cards, and active circle view

### E. Notifications Floor (`/notifications`)
* `notif-header`: Announcements Overview & unread count badge
* `notif-filters`: Category filter tabs (`All`, `Classrooms`, `Mentors`, `Achievements`, `System`)
* `notif-feed`: Live interactive notification cards & dismiss actions

### F. Profile Floor (`/profile`)
* `profile-intro`: Persona & Role Header (`displayName`, verified roles)
* `profile-stage`: Master-detail stage (`Identity`, `Atmosphere & Motion`, `Security & Data / PDPA Purge`)

### G. Settings Floor (`/settings`)
* `settings-header`: Overview & identity settings header
* `settings-spatial-studio`: Spatial Studio Live Canvas preview & custom wallpaper uploader
* `settings-diurnal-theme`: Diurnal appearance mode & personality palette
* `settings-privacy`: Privacy consent & APCA high-contrast toggles

### 4.1 Declarative Furniture Engine Specification
To avoid hardcoding layout sequences, each floor consumes a lightweight declarative layout state:

```typescript
export interface FloorFurnitureBlock {
  readonly id: string;
  readonly label: string;
  readonly defaultPinned?: boolean;
  readonly defaultHidden?: boolean;
}

export interface FloorFurnitureState {
  readonly floorId: 'self' | 'workspace' | 'library' | 'community';
  readonly blockOrder: readonly string[];
  readonly pinnedIds: readonly string[];
  readonly hiddenIds: readonly string[];
}
```

Rendering applies a strict 3-tier sort:
1. **Pinned Tier**: Rendered at the top of the floor in pinned order.
2. **Standard Tier**: Rendered sequentially according to `blockOrder`, omitting `hiddenIds` and already pinned blocks.
3. **Stowed Drawer**: Available in the Floor Studio drawer under "Hidden Furniture", allowing 1-click restoration.

---

## 5. Universal Scope vs Room-Sovereign Atmosphere

Floors support two operational modes for visual serenity:
1. **Sanctuary Universal (Default)**: Visual atmosphere (e.g. Dawn Lotus wallpaper + Washi Grain) seamlessly persists across `/self`, `/workspace`, `/library`, and `/community`. Walking through the app feels like walking through different rooms of the same contemplative temple.
2. **Room Sovereign (Override)**: Checking "Customize this room only" in the Floor Studio detaches the current floor, allowing dedicated styling (e.g., Clean Sandstone in Workspace for operational focus; Bamboo Forest in Self for mindful journaling).

### 5.1 Frosted Scrim & WCAG 2.2 AAA Contrast Invariant
Custom wallpapers introduce unpredictable background luminance. To preserve reading accessibility:
* All interactive surfaces (`LivingCard`, `TaskStrip`, catalog cards, forms) MUST use frosted glassmorphism:
  ```css
  background-color: var(--paper-frost, rgba(254, 252, 248, 0.92));
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid var(--paper-border-frost, rgba(140, 110, 70, 0.12));
  ```
* Text color maintains a calculated APCA / WCAG contrast ratio $\ge 4.5:1$ regardless of the underlying bitmap.

---

## 6. The Top-Right Floor Studio Component

Every floor provides a unified, discreet top-right trigger button:
`[ ⚙ Floor Studio ]`

Clicking opens a glassmorphic slide-over drawer with two primary tabs:
1. **Atmosphere & Wallpaper Studio**:
   - Curated Presets (`🪷 Dawn Lotus`, `🎋 Bamboo`, `🏔️ Peaks`, `🌌 Cosmos`, `⚪ Off`)
   - Custom Wallpaper Upload dropzone (Canvas downscaled to 1920x1080 WebP, stored in IndexedDB)
   - Playlist Manager & Slideshow Toggle with Cadence Selector (`3m`, `5m`, `15m`, `On Arrival`)
   - Background Color Wash Selector (`Sandstone`, `Dawn`, `Garden`, `Night`, `Off`, or Custom Color Hex)
   - Atmospheric Shader FX (`Washi Grain`, `Aurora Mesh`, `Celestial Embers`, `Plain`)
   - Sanctuary Scope Toggle ("Apply to entire Sanctuary" vs "This room only")
2. **Spatial Furniture Arrangement**:
   - Reorder furniture blocks with Move Up / Move Down buttons
   - Pin priority furniture to the top of the room
   - Hide / stow unused modules
   - "Reset to Floor Defaults" button

---

## 7. Settings Page Live Spatial Studio

In `/settings`, users are provided a sandbox **Live Sanctuary Studio Preview**:
* **16:9 Mini Viewport**: Real-time rendering of wallpaper, shaders, and wash color with simulated card elements to test readability.
* **Custom Wallpaper Ingestion & Management**: Upload images, view active playlist thumbnails, and delete items from IndexedDB.
* **Slideshow Testing**: Toggle slideshow on/off, change cadence, and click "Cycle Next" to test the 1.2s cross-fade transition directly.
* **Custom Color Wash Tuner**: Native color input with hex readout and opacity slider.

---

## 8. Verification & Quality Gates

* **Zero Regressions**: Existing integration tests (`selfFloor.test.tsx`, `workspaceWallpaperLayer.test.tsx`, `workspaceCapacity.test.tsx`, `notificationsFloor.test.tsx`, `settingsFloor.test.tsx`, `responsiveFloors.test.tsx`) must exit 0.
* **Type Integrity**: Monorepo TypeScript check (`pnpm --filter gurudevi-web check-types`) must exit with 0 errors.
* **APCA / WCAG Contrast Invariant**: Content cards always maintain an opaque or frosted background scrim (`--paper` / `--paper-light`) with blur, guaranteeing text legibility over any custom wallpaper.

---

## 9. Layout Synchronization & Holistic Shell Connectivity

The Sanctuary experience is integrated through four converging layers of layout synchronization:

### 9.1 Multi-Tier Appearance & Atmosphere Synchronization
Atmosphere and appearance settings synchronize gracefully between local-first storage and remote database records:
1. **Per-Room vs Universal Atmosphere**:
   - `sanctuary-atmosphere:${domain}`: Tracks local atmosphere overrides when room-sovereignty is chosen.
   - `sanctuary-atmosphere:universal`: Propagates wallpaper, tactile shaders, and wash color universally across all floors (`/self`, `/library`, `/workspace`, `/community`, `/notifications`, `/profile`, `/settings`).
2. **Two-Tier Diurnal Palette**:
   - `gurudevi_theme`: Personality palette (`sanctuary`, `lotus`, `youth`, `garden`).
   - `gurudevi_mode`: Luminance schedule (`light`, `dark`, `system`).
   - `apca-high-contrast`: High-contrast boost for bright outdoor sunlight or low-vision readability.

### 9.2 Spatial Furniture Persistence & Staging
Every floor uses `sanctuary-furniture:${domain}` to persist the user's customized block ordering, pinned modules, and hidden drawers. When the user navigates between floors, each floor dynamically renders its modules according to the active group order.

### 9.3 Cloud & Local Layout Repository
For authenticated accounts, `useBrowserWorkspaceAppearance` hooks directly into `createSupabaseWorkspaceLayoutRepository`, synchronizing appearance configs, pinned preferences, and group orders to the remote database while seamlessly falling back to `localStorage` offline.

### 9.4 Holistic Sanctuary Shell (`SanctuaryShell`)
`SanctuaryShell` acts as the unifying physical frame across the entire web application:
* **Navigation Architecture**:
  - Collapsible persistent sidebar with state preserved in `localStorage` (`gurudevi_sidebar_collapsed`).
  - Primary navigation: Self (`/self`), Library (`/library`), Workspace (`/workspace`), Community (`/community`).
  - Account navigation: Notifications (`/notifications` with real-time unread badge), Profile (`/profile` with avatar button), Settings (`/settings`).
* **Multi-Domain Context Aware (Explore vs Sanctuary)**:
  - `explore.gurudevi.app`: Sets `isExploreMode=true`, mounting Guest House badges, local PDPA privacy notices, and guest exploration notifications.
  - `sanctuary.gurudevi.app`: Binds live Supabase sessions, role perspective switching (`CapacityPerspectiveSwitcher`), real-time offline sync indicator (`SyncStatusPill`), and security inactivity sentinels (`useInactivitySentinel`).
* **Command Palette & Keyboard Accessibility**:
  - Global `⌘K` command palette allowing instant navigation across all floors and actions with full keyboard focus traversal.

