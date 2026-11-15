---
title: "Layout history: day one to one system"
status: "active"
created: 2026-11-13
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [layout, floor, history, rooms]
source: "https://claude.ai/artifact/MiDUdq3GZopYLS9Dv3zwF9"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/MiDUdq3GZopYLS9Dv3zwF9 so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. The furniture lists it proposes reviving became the AppCatalog entries on 14 Nov.

# Layout history: day one to one system

Nov 13, 2026 · @Neev

## In short

Yes, the idea has been the same since March: **one reusable layout system that every room uses**. It was written down on 30 March 2026 as "canvas owns arrangement and visibility, packages own the features". The history below (traced from all 1,779 commits and the 20 layout docs) shows the idea never changed. What kept changing was the **drawing code**. Eight times a new way of drawing a room was built beside the old one, instead of finishing the old one.

Three things caused this:

1. **The drawing code was tied to one room's look.** The March canvas drew Workspace (zone columns, metrics, dotted ground), so Self, Library, Community and Profile never really fitted it. Each got its own screen.
2. **Web and phone split in September.** The September ADR banned web from importing the phone canvas, so web rebuilt its rooms from scratch. Since then the two have shared only the saved data model, not the drawing.
3. **The 6 November API move deleted the main users.** Every classroom and admin dashboard that used the canvas was removed, and phone Community, Library and Profile became placeholders. What survived is the model, five unused furniture lists, and the web room frame.

**What survives today and is worth keeping:** the saved model (`canvas.ts`, from March), the five furniture lists (from August), the web room frame and Floor Studio (from October), the save-and-sync outbox (from October), and the placement engine and world ground (from this week).

**The one system** (section 5) puts these in a single line: the **world** sets the defaults for every room. A person can change **every room** at once, or one **room** within the world's limits. A **page** only says what kind it is. One engine places the furniture, and one room frame per platform draws it. This is the same chain as the ground rule you set on 12 November, applied to layout.

## Timeline, era by era

Each row is one layout piece: when it arrived, what it could do, why it was made (with the doc that says so), and what became of it. **Live** means the file still exists and something uses it. **Unused** means it exists but nothing uses it. **Gone** means it was deleted.

### Era 0, Feb to mid-Mar 2026: one hand-made dashboard per role

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 4 Feb | Phone `TabNavigator` (React Navigation) | The five tabs | First app shell | Gone 13 Jun (Expo Router) |
| 5 Feb to 4 Mar | `TeacherDashboard`, `StudentDashboard`, `ClassroomDashboard`, principal `ResourceNeedsDashboard`, `PulseDashboard`, `FounderDashboard`, plus `.web.tsx` copies | Fixed screens, one per role | Features first, layout per screen | Gone 6 Nov (API move) |
| 20 Feb | Library `SmartShelf`, "Netflix layout"; Community `PinnedResourcesShelf` | Shelves of rows | Browse rooms | Library screen gone 6 Nov |
| 24 Feb | `SanctuaryBackground` | Phase-crossfading backdrop behind tabs | The living-ground idea, first version | Unused by tabs since Jun; only the auth screen uses it |
| 9 to 14 Mar | Self `BaseSelfView` + `useDynamicSelfFeatures` | Feature carousel, auto-sorted by use, long-press pins | Self as a feature hub | Live in packages/self, but the phone app no longer mounts it |

**Why it ended:** every new role needed a new screen. `ROLE_WORKSPACE_STRATEGY.md` (30 Mar) says: "every new role gets a new ad hoc architecture" must stop.

### Era 1, 30 Mar to May: the capability canvas (the first global system)

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 30 Mar | core `canvas.ts` (the model) | Surface list, 5 zones (today, work, institution, outlook, private), order, hide, pin, zone move, normalise when features change | `CAPABILITY_CANVAS_STRATEGY.md`: "canvas owns arrangement and visibility, not a domain owner"; "not: drag and drop becomes the architecture" | **Live**, still the one saved model |
| 30 Mar | Supabase `user_workspace_layouts` with targets (shared, web, mobile), `layoutSync` | Saves each person's layout per device kind | `CANVAS_SHARED_SURFACE_MODEL.md`: local-first, sync across devices | **Live** (table and repo) |
| 30 Mar | `renderer.ts` + `ResponsiveWorkspaceCanvas` (phone stack, tablet grid, web kanban), `CanvasZoneColumn`, `CanvasSurfaceCard` | Draws any surface list in zones | Same docs | Unused (tests only) |
| 30 Mar to 18 Apr | Per-role canvases: classroom, student, principal, founder, guardian, admin | Each role's surfaces on the canvas | Role strategy | Gone 6 Nov, except guardian and founder, which are broken |
| 2 May | `DraggableCanvasSurface` | Free 2D drag of cards | "Fluid rearrangement" | Used only by the form builder |

### Era 2, Jun: the move to Expo Router

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 8 Jun | `gurudevi-responsive-shell-layout-spec.md` | Phone, tablet and web shell rules | One responsive shell | Doc only |
| 9 Jun | `workspace-navigation-philosophy.md` | Five "ecological circles"; Workspace is the hub; tab label follows the role | Expo Router move | Still the idea behind the rooms |

**Loss:** when `TabNavigator` was archived, the phone lost its living backdrop behind the tabs. It came back only on 10 Nov.

### Era 3, 8 to 29 Aug: "one engine, five dialects"

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 8 to 13 Aug | Docs 21 and 22, Workspace canvas redesign | **Three zones:** fixed, person-arranged (never auto-moved), smart "Today" (re-sorts only on app open). One-axis reorder; a move button kept for screen readers; phone as a vertical stack, web as columns | Hick's law; trust ("what I arrange stays") | Ideas only; never built |
| 24 Aug | Tab analysis | Self: yes. Library: hybrid. Community: no | Should every tab be a canvas? | Doc |
| 25 to 29 Aug | Unified Canvas System doc + code | `isDefault` (default users read one flag, no JSON, no network), self-describing surface metadata in Supabase, per-room pin caps, `tabOrder`, `SettingsGroup`, web drag (dnd-kit), furniture lists for **all five rooms** (`use{Self,Library,Community,Profile}WorkspaceSurfaces`), `SelfCanvas` + store, `SelfScreen.unified`, `WorkspaceRenderer` | Neev: Community should "dance lightly"; Library and Profile hybrid; tab order should be changeable | Doc marked superseded. Model parts live; the five furniture lists are unused; `SelfCanvas` is unused |

### Era 4, 14 Sep to 6 Oct: web rebuilt in Next, phone Self rebuilt

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 14 Sep | ADR "Browser unified CanvasFrame" | One generic web frame | Web needed rooms | Superseded the same day |
| 14 Sep | **ADR "Canvas model and domain-floor authority"** (accepted) | One model; **each room owns its own floor and drawing**; features are furniture; Explore and guest only swap data adapters | Rejects "one visual canvas for all" and treating the Workspace canvas as neutral | **Still the accepted rule.** It is why rooms look different, and also why they drifted |
| 15 Sep | web `domainCanvas.ts` | Port map of rooms | First web step | Unused |
| 20 Sep to 6 Oct | web `WorkspaceFloor`, `LibraryFloor`, `CommunityFeedFloor`, `ProfileFloor`, `SelfFloor`; `use*Canvas` hooks; `useBrowserWorkspaceAppearance` | Each room's furniture, order, hide and pin, saved per room through the shared model | ADR: each room owns its floor | **Live** on web |
| 12 Sep to 6 Oct | phone `SanctuaryOverviewHub`, then `SelfFloor` + `useSelfCanvas` | Self catalogue by category; pins kept on the phone only | Phone Self refresh | **Live**, not on the shared model |

### Era 5, 14 to 27 Oct: the Floor Studio and offline saving (web)

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 14 Oct | Device layout targets spec | Phone, tablet and desktop keep separate layouts | One layout did not suit all sizes | Partly built |
| 17 to 27 Oct | `layoutIntent`, `layoutPatch`, `layoutSession`, outbox | Small edits saved offline and synced later | Offline-first | **Live** in core |
| 17 to 27 Oct | About 30 web pages named `*Floor` | Every inner page | Pages ported | **Live** |
| 18 to 20 Oct | **`SanctuaryFloorCanvas` + `FloorStudioDrawer`** (furniture framework doc) | Layers: fixed wallpaper, texture, colour wash, furniture stage, Studio drawer. Furniture list per room; order, pin, hide; battery-safe slideshow | Wallpapers were stretched 3×, and each floor had its own picker | **Live**, the web room frame |
| 23 Oct | Living canvas docs (4) | Generative ground art and its limits on low-end phones | The living world | Fed into worlds |

### Era 6, 22 Oct to 6 Nov: worlds, the new kit, and the API move

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 22 to 30 Oct | Worlds foundation; kit `Stack`, `Inline`, `Grid`, `Rail`, `Card` | World-dressed parts for both platforms | The world dresses everything | **Live** |
| 6 Nov | **API move** (`308aa4f35`) | Deleted all classroom and admin dashboards and canvases, the layout sync hook, and phone Community, Library and Profile screens | They called retired API code | Left the model with almost no users on the phone |
| 6 Nov | web `floor-redesign` lab: `useSpatialFootprint` (size gears G0 to G3), `useLongPressDnd` (keyboard too) | A room's pieces measure their space and shrink or grow | Early form of fit-to-space | Unused |

### Era 7, 10 to 12 Nov: this project

| When | Piece | Could do | Why | Now |
| --- | --- | --- | --- | --- |
| 10 Nov | `WorldStage` / `WorldFloor`, mounted once | One living ground for all phone screens, with tiers from verger | World first | **Live** |
| 11 Nov | phone `WorkspaceHome` | Calm Work front screen | Workspace hub | Unused |
| 12 Nov | Floor System doc; core `logic/floor` engine; `FloorView`; `ROOM_PLANS`; 16 patterns; fit sizes; lint and snapshots | Pure placement: space shared by weight, pieces fold when space is short, readable on small phones | One placement brain for every room | **Live**, but only Work (behind a flag) and the lab use it |
| 12 Nov | Ground cascade (`groundPlan`, `ground.ts`) | World, then every room, then this room, then page kind | Your ground rule | **Live** |
| 12 Nov | phone `RoomFloor` (mobile rooms PR #153), Work pieces | Library, Community and Profile room pages; Work feature pieces | Parity with web | Draft or parked |

## What kept coming back, and why each rebuild broke

**Ideas that every era repeated (keep these, they are yours):**

- Each room has a list of furniture, and features are the furniture. This came in March, was named "furniture" in September, and the floor engine uses it in November.
- Furniture sits in groups or zones, and the person can order, hide and pin it. This has been the same since March.
- What a person arranges stays where they put it. Only a clearly labelled "Today" part may move by itself, and only when the app opens (docs 21 and 22, August).
- A layout is saved per person and per device kind, works offline, and syncs later. This came in March, with the outbox added in October.
- Rooms differ in kind: Work is a desk, Self is a sanctuary, Library is shelves, Community is a mode hub, and Profile is settings groups. This was named in August and made law on 14 September.
- The ground is alive and shared. It started in February, was lost in June, came back on web in October, and on phone on 10 November.

**Why each rebuild broke:**

| Cause | Where it shows |
| --- | --- |
| The drawing was tied to Workspace's look, so other rooms could not use it | The March canvas. The 14 Sep ADR says so itself |
| The rule "each room owns its floor" was read as "each room writes its own drawing code" | Five web room floors and the phone `SelfFloor`, each drawn differently |
| Web was not allowed to import the phone canvas (correct, since web has no React Native), but nothing shared took its place except the model | Web and phone drifted from September on |
| A new thing was started instead of finishing the last | `SelfCanvas` (Aug) beside `BaseSelfView` (Mar); `domainCanvas` (Sep) beside `use*Canvas` (Oct); `floor-redesign` (Nov) beside `SanctuaryFloorCanvas` (Oct); my engine (Nov) beside all of them |
| Features and layout lived in the same files | When the API moved, deleting the features deleted the layout users too (6 Nov) |
| Docs marked "shipped" before the room really used it | The August "Next" doc ticks Library, Community and Profile canvases, but their lists were never drawn |

## Unique abilities worth keeping

Each older piece has something the others lack. The one system should take these in, not lose them.

| Ability | From | Goes into |
| --- | --- | --- |
| Normalise a saved layout when features are added or removed; pin caps per room | core `canvas.ts` (Mar) | Saved model (kept as is) |
| `isDefault`: a person who never changed anything costs one flag read and no network | Unified canvas (Aug) | Saved model |
| Saved rows describe themselves (kind, room, group, platforms), so they survive renames | Unified canvas (Aug) | Saved model |
| Separate layouts for phone, tablet and desktop, with a shared fallback | Layout targets (Mar, Oct) | Saved model |
| Offline edits as small patches, synced later | `layoutPatch` / `layoutSession` / outbox (Oct) | Saved model |
| Furniture lists for all five rooms | `use*WorkspaceSurfaces` (Aug) | Furniture lists (revived, not rewritten) |
| Three parts: fixed, yours (never auto-moved), Today (moves only on app open) | Docs 21 and 22 (Aug) | Engine rule; it matches the "smart-areas" default already in the engine |
| A move button as the non-drag way, for screen readers and switch users | Doc 22 (Aug); kit `MoveControl` (Nov) | Kit |
| Room look as layers: wallpaper, texture, wash, furniture stage, Studio drawer; slideshow paused when hidden or on low power | `SanctuaryFloorCanvas` (Oct) | Room frame (web keeps it; phone gets the same layers through `WorldStage`) |
| One Studio place to change the look and the furniture | `FloorStudioDrawer` (Oct) | Floor Studio, both platforms, asking "every room or just this room?" |
| Pieces measure their space and choose a size | `useSpatialFootprint` (Nov lab), floor fit (Nov) | Engine (fit sizes already cover it) |
| Long-press drag with keyboard support on web | `useLongPressDnd` (Nov) | Later drag pass |
| Self by category (identity, wellbeing, growth, practice) | phone `SelfFloor` (Oct) | Self furniture groups |
| Share space by weight; fold the least important first; 16 patterns; lint and snapshots | Floor engine (Nov) | Engine |
| World, then every room, then this room, then page kind; comfort and verger only calm | Ground cascade (Nov) | The rule for layout too (section 5) |
| Room name follows the role (Classroom, School, Family…) | Navigation doc (Jun), `workspaceRoomNameOf` (Nov) | Room frame header |

## One global system

### The chain: who decides what

The same chain as the ground rule, now for layout and components too. Each step can only narrow what the step above allows.

| Step | Decides | Example | Cannot |
| --- | --- | --- | --- |
| Platform | Touch size, safe areas, tab bar place, size classes, keyboard | Phone tabs at the bottom; 48 dp touch on Android | Change with the world |
| **World** | Ground, colours, type, corners, depth, motion character, **default density and default pattern character** (calm worlds spread out, lively worlds pack tighter) | Kele: soft forest ground, rounded, roomy | Break readability limits |
| Verger and comfort | How much the device and the person can take | Low-end phone: still picture, fewer moving parts; large text: pieces fold earlier | Make anything louder |
| **Every room** (person's choice) | One change applied to all rooms | "Show fewer pieces everywhere", "photo ground everywhere" | Leave the world |
| **This room** (person's choice) | Override for one room, inside the world | Library: shelves pattern; Work: hide insights; own wallpaper | Pick its own colours, breakpoints or motion |
| Room kind (built in) | Which patterns fit and which furniture exists | Community = mode hub; Library = shelves; Work = desk | Write its own drawing code |
| Page | Only its kind (front, inner, form, reading) and its content | Settings is a calm form page | Paint its own ground, scroll bars or states |

A room **follows the world** until someone changes "just this room". Then it keeps its own setting, still inside the world's limits. A later "every room" change asks whether to override rooms that have their own. This is how the ground already works since 12 November.

### The five parts

1. **One saved model**: core `canvas.ts` with the targets, `isDefault`, patches and outbox, plus the new floor settings (pattern, density, follow-world flag). Web and phone both use it.
2. **One furniture list per room**: the August lists revived, so each room's furniture is declared once for both platforms. Features fill the slots; the list does not own features.
3. **One placement engine**: core `logic/floor`. Pure code, so web and phone both run it. Room kind picks which patterns are allowed; the person or world picks among them.
4. **One room frame per platform**: web keeps `SanctuaryFloorCanvas` and moves it onto the engine. The phone gets one `RoomFrame` that replaces `SelfFloor`, the Work floor and `RoomFloor`. Both draw with the same kit.
5. **One Floor Studio**: the web drawer and a phone sheet, with the same choices, always asking "every room or just this room?".

Sample data reaches every room through the existing sandbox layer (live, ghost, demo), never through direct imports.

### How this keeps the 14 September rule

The September ADR said each room owns its floor, and it was right that rooms are different kinds. The change is in *how* they differ: by **settings and patterns in one engine**, not by separate drawing code. Community stays a mode hub and Library stays shelves, but both are drawn by the same frame.

## Defaults taken, and the order to build

These are defaults so work can go on. Each one can be changed later.

- A room follows the world until the person picks "just this room".
- A furniture slot is a section of a room (like web's "workbench" or "shelf"). Features fill slots.
- What a person arranges never moves by itself. Only the labelled Today part re-sorts, and only on app open.
- Room kinds stay as they are: Work is a desk, Self a sanctuary, Library shelves, Community a mode hub, Profile settings groups.
- Nothing old is deleted until you say yes to each item (Deletion Veto).

**Order** (this matches step 6 of the [shared rules audit](https://claude.ai/artifact/WHUGeegKrrC3nwdYnu3p5q)):

1. Add floor settings and "follow world" to the saved model.
2. Revive the five furniture lists as the one place each room's furniture is declared.
3. Put the web room frame on the engine, keeping today's look.
4. Build the phone room frame. Move Self first, then Work (starting from `WorkspaceHome`), then Community, Library and Profile.
5. Add one Floor Studio on both platforms with "every room or just this room".
6. Route all sample data through the sandbox layer.
7. List the unused pieces for your yes or no.

The file-by-file reference for today's state is [Layout systems: what exists, mobile and web](https://claude.ai/artifact/Kx7w7KfwomZYYttW3pArgR).
