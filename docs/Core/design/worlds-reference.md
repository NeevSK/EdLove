---
title: "Worlds: how the Sanctuary looks, moves and stays readable"
status: "active"
created: 2026-11-15
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [worlds, scene, ground, verger, floor, rooms, fonts, motion, gurudevi-mobile, gurudevi-web]
---

# Worlds: how the Sanctuary looks, moves and stays readable

This is the current reference for the worlds system. It describes what the code does, file by file, in Neev's words: the app is the **Sanctuary**, each tab opens a **room**, rooms have **floors**, every visual follows the **world**, and **verger** decides how much of the world a device can carry.

Read this first. The older design docs explain how we got here and why; this one says what is true now. Where they disagree, this one wins, and the older doc says so at its top.

> **Where the code is.** As of 15 Nov 2026 the code described here lives on `claude/project-thread-g4vy3a` (draft PR #151 into `integrate/worlds-and-upstream`). Paths are given as they are on that branch. Some of them do not exist on `integrate/worlds-and-upstream` until #151 merges.

## The model in one picture

```
Sanctuary (the whole app)
 ├─ World ............ the mother: how everything looks and moves (colours, type, shape, motion, scene)
 ├─ Verger ........... the father: how much of that this device and person can carry right now
 ├─ Person's choices . comfort, World Behind Screens, Visual detail, every room / just this room
 └─ Rooms (one per tab: Self, Workspace, Community, Library, Profile)
     └─ Main screen (exactly one per tab) = the room's floor
         ├─ Ground ..... what the floor stands on (the world's scene, a still, a photo, paper)
         ├─ Furniture .. the room's features from its catalog, placed by the floor engine
         └─ Second-level screens (an opened item) .. same room, same ground, drawn their own way
```

Each layer may only narrow what the layer above allows. A screen never widens what the world or verger allows, and never paints its own ground.

## Words

These are the words to use in code comments, docs and messages. They come from Neev; the code already uses them.

| Word | Means | In code |
|---|---|---|
| Sanctuary | The whole app | `SanctuaryShell` (web), `EntryShell` (phone) |
| Room | What a tab opens: Self, Workspace, Community, Library, Profile | `TabDomain`, `SceneRoom` |
| Main screen | The one screen a tab opens to: Overview for Self and Workspace, the shelf for Library, Feed/Groups/Messages for Community | phone `RoomFront`, web `SanctuaryFloorCanvas` |
| Floor | What a room shows: its ground plus its furniture | `RoomFloor` (one per platform) |
| Ground | What the floor stands on | `planGround`, `GroundPlan` |
| Feature (furniture) | Something a person opens on a floor | an AppCatalog entry that has a `floor` |
| Catalog | The room's feature list, one per room, inside the AppCatalog | `constants/*Registry.ts` per package |
| SanctuaryFeature | Decides whether this person may have a feature | `useDomainFeature`, `evaluateFeatureFor` |
| Canvas layout | The arrangement of features plus the shape of each one | the saved `WorkspaceLayout` |
| World | The skin and its behaviour | `WorldDefinition`, `WORLDS` |
| Verger | The runtime that budgets quality for this device | `@repo/verger-*`, `GurudeviExperience` |
| Scene | The living sky behind a room, worked out from the hour, season, weather and moon | `resolveScene` |

Words to avoid because they were invented and then dropped: "place" (use room), "frame" or "page" for a floor, "WorkFloor", "room plan" (`ROOM_PLANS`), "piece" and "area" in messages (say feature and zone).

## 1. Worlds

**What a world is.** A `WorldDefinition` (`packages/ui/src/theme/types.ts`) holds:

- names in English, Sinhala and Tamil, a one-line description and a family;
- a light and a dark palette of `WorldTokens` (ground, raised, sunken, ink, inkSoft, inkFaint, lamp, onLamp, line and the rest);
- `style`: a dozen decisions (corners, line weight, boundaries between sections, ornament, material) from which `build.ts` makes every component recipe;
- `faces`: the typefaces it writes in, with Sinhala and Tamil faces of their own;
- `motion`: its personality (tempo, curve, travel axis, settle, stagger, press, haptic);
- `sign` (its waiting sign), `perch` (Tutii's perch on empty and error states) and `preferredMode`;
- `floor`: `scene` (the living scene under the rooms, the default) or `plain` (the world's ground tinted by the hour; Classic uses this).

Components never name a colour. They read roles (`lamp`, `ink`, `ground`), so changing the world restyles the whole app.

**The registry** is `packages/ui/src/theme/worlds/index.ts`. Adding a world is its folder plus one line there. Today there are twelve, in five families:

| Family | Worlds |
|---|---|
| Quiet | Classic (the plain, familiar one), Sanctuary, Wewa, Gems and lace (`ratna`) |
| Nature | Forest canopy (`kele`, **the default**), Tea country |
| Cultural | Temple walls (`kandyan`), Angampora, Perahera |
| Bloom | Rose and pichcha (`rosa`) |
| Modern | Colombo night, Spark |

Cultural care: worlds borrow materials, colours and patterns (lime plaster, a vine band, still water, brass), never sacred figures or scenes.

**Resolving a world.** `resolve.ts` turns a world id, the hour's phase (`predawn`, `dawn`, `morning`, `afternoon`, `dusk`, `night`), light or dark mode and the person's access needs (`WorldAccess`: more contrast, reduced transparency, comfort size, simpler look, sunlight) into a `ResolvedWorld` with tokens and recipes. Phone screens read it through `theme/native/WorldContext.tsx`; the web reads the same tokens as CSS variables (`theme/css.ts`, `theme/kitCss.ts`). `worldBridge.ts` lets older screens that still read `useTheme()` or `--phase-*` follow the world until they move to the kit.

**Readability is a rule of the world, not of a screen.** Ink 7:1 on the ground, soft ink 4.5:1 on raised, on-lamp 4.5:1, lamp 3:1. `theme/scene/__tests__/sceneContrast.test.ts` checks text over the scene for every world, hour and weather. `groundLimits.ts` works out how far a photo (at most 0.45) or a wash (at most 0.2) may show before words stop reading, assuming the worst pixel.

Accessibility standard: WCAG 3 (latest working draft) is Gurudevi's adopted standard; WCAG 2.2 criteria are used as extra concrete checks where WCAG 3 is still thin.

## 2. The scene: `resolveScene`

`packages/ui/src/theme/scene/resolveScene.ts` gives one answer to "what does the app look like right now" for every painter, on web, phone and explore. It is pure (no clock, no platform).

**In:** the time (`now`, or a pinned minute), season, weather, the world's glow, the room, whether the view follows the room, the world or stays one scene, the screen's presence, the ground, the card surface, verger's budget and whether the screen is visible.

**Out (`Scene`):** phase, light or dark, season, weather, moon phase and Poya, the view, what paints the back layer (`scene`, `colour` or `none`), the tier, the sky palette, the sun and moon, frames per second (0, 15 or 30), how often still layers repaint, particles (rain, fireflies, stars, lightning, mist), the card surface (frost or paper), `skyInk` for words written straight on the sky, and the room-change crossfade.

**Each room has its own view:** Self is the veranda, Workspace the school, Community the ambalama, Library the temple library, Profile the hilltop (`ROOM_VIEW`). The landscapes and sky are in `scene/landscape.ts` and `scene/sky.ts`; the Sri Lankan seasons, Poya and the moon are in `sky.ts`.

**Rules that keep it cheap:**

- A hidden screen never moves (`visible: false` gives 0 fps).
- Only the `rich` tier moves at all; the `band` presence halves the particles and drops fireflies.
- Stars are painted into the still layer, so they show even when nothing moves.
- Frost falls back to paper when verger's visual effects are at `essential`.
- With motion off, room changes cut instead of crossfading.

## 3. The ground every screen stands on

Every screen, not only a room's main screen, stands on the world's ground. Profile, Settings, notifications, forms and detail screens included. No screen paints an opaque background over it.

**The look a room shows** (`packages/core/src/logic/workspace/ground.ts`). One world is shared across the app and every room follows it. When a person changes the look they are asked **every room** or **just this room**. Each choice carries `changedAt`, so a later every-room change brings every room back without visiting each one. `resolveRoomGround(defaults, world, room)` returns the room's own look if it has one, otherwise the every-room look (`WORLD_GROUND_ID`), otherwise the world's defaults.

**What is drawn** (`packages/core/src/logic/workspace/groundPlan.ts`). `planGround(look, worldPhotos, allowance, …, stage, policy)` turns a saved look into a `GroundPlan` the device can draw: surface (`live`, `still`, `photo`, `paper`), photo or slideshow, tint, texture, presence and veil, plus notes that say in words why the plan differs from what was asked (`photos-paused`, `no-photo`, `texture-paused`, …). Every room on web and phone asks it once; the Floor Studio asks `groundControls` which settings to show.

**How loud the ground is on each screen.** A screen only names its kind (`GroundStage`): `room` (a room's main screen), `screen` (an inner screen), or `focus` (reading, chat, a form, a kiosk). It never picks its own visual level. One policy decides:

| World Behind Screens | room | screen | focus |
|---|---|---|---|
| Lively | full | full | full |
| **Balanced (default)** | full | full | calm |
| Calm | calm | calm | calm |

`groundPresenceOf` turns that into the scene's presence: `full` on a room's main screen, `band` (the scene behind the header, the world's paper below) on other screens, `quiet` (still, under a veil) when calm. `GROUND_PRESENCE_VEILS` is a readability floor no choice thins. `groundPolicyOf` lets verger only calm it further: a device at `essential` quality gets the calm ground on every screen but the rooms.

Where the choice is kept: on the phone in `Comfort.ground` (`packages/ui/src/context/ComfortPreferences.ts`, read by `useGroundPolicy`); on the web in browser storage (`apps/gurudevi-web/lib/runtime/webGroundLiveliness.ts`), beside Visual detail. The two are not synced across devices yet.

## 4. Verger: what the device may spend

Verger (`packages/verger-core`, `verger-react`, `verger-react-native`, `verger-android`, `verger-web`) senses the device (capacity class, memory, frames, battery, power saver, network, visibility) and sets lever levels. Gurudevi reads it as one `GurudeviExperience` (`packages/core/src/verger/experience.ts`): device tier, effective fidelity, quality (`full`, `reduced`, `essential`), what is allowed (ambient effects, blur, rich and subtle animation, shimmer, prefetch), particle and celebration caps, transition mode, and an `experience` profile with a level (`rich`, `refined`, `essential`, `off`) for motion, visual effects, haptics, sound and celebration.

The person's own choices go into verger first and come out as one budget: fidelity (Visual detail), sound, haptics, quiet mode, the OS reduce-motion setting, and operational scenarios (exam, power cut, low data). Safe mode puts everything at its cheapest. Nothing below verger decides on its own.

**One stage for the whole phone** (`packages/ui/src/theme/stage.ts`). `stageTierOf(budget)` gives one tier that the floor, the kit and the shell all read:

| Tier | When | What it allows |
|---|---|---|
| rich | full quality and rich motion | 30 fps life, shaders, every particle, the world's own transitions, full moments |
| middle | the usual case | the scene drawn once, life at 15 fps, half the particles, paused while scrolling |
| floor | essential quality or low fidelity | the scene drawn once without its finest layers (prerendered pictures), two or three soft overlays moved by native transforms, no frame loop |
| bare | motion off (reduced motion, power cut) | the world's ground tinted by the hour; nothing moves |

**Wallpapers and photos** wait whenever data, energy or attention is short (`packages/core/src/verger/wallpaper.ts`, `wallpaperAllowed`): offline, data saver, a slow link, battery saver, a hidden app. Verger also names each route as a screen (`screens.ts`) so it keeps a memory per screen.

The target phones are a 2 GB Android 9 or 10 phone, the A24, the A52 and a tablet. As of 15 Nov 2026 none of this has been measured on a real phone; the A52 numbers decide whether fonts or the rarer worlds are cut.

## 5. Type: every world's fonts

Each world writes in its own variable faces for Latin, Sinhala and Tamil (`worlds/<id>/index.ts` → `faces`; shared faces in `worlds/shared/faces.ts`; `theme/faces.ts` collects them). Some axes follow the role or the hour (`opsz`, `wdth`, `SOFT`, fractional weight); React Native 0.88 supports `fontVariationSettings` on Text and TextInput on both platforms.

The font files are built by `scripts/fonts/build-world-fonts.py` from `scripts/fonts/world-fonts.json`, pinned to a google/fonts commit and subset to Latin, Sinhala and Tamil. Every world's fonts ship in the phone app (`apps/gurudevi-mobile/src/assets/fonts/world`, 62 files, about 9.6 MB on the #151 branch), embedded by the expo-font plugin; a change needs a new dev client. The web loads only what a world needs (`fontNamesOf(world, lang)`). Lora and IBM Plex have Reserved Font Names, so they ship unmodified. The repo's `.gitignore` ignores `*.txt`, so OFL licence files need `git add -f`.

## 6. Motion

A world's `motion` is its personality: Wewa is slow and settles like water, Angampora strikes and stops, Spark snaps in sideways with a small overshoot. `theme/motion.ts` (`resolveMotion`) plays it at the level verger allows:

- `rich`: the world's full character;
- `refined`: shorter travel, no overshoot, half the stagger;
- `essential`: fades only, nothing travels or bounces;
- `off`: no animation.

Rules: durations stay within 120 to 600 ms (micro 80 to 300), only transform and opacity animate, nothing eases in, and motion never carries meaning alone. On the web the same values arrive as CSS variables (`--w-dur-micro`, `--w-dur`, `--w-dur-meaningful`, `--w-ease`). Waiting signs, perches, loading, empty, error, toasts, celebrations (`moments.ts`) and Tutii are drawn per world from the same rules. Feedback and sound follow the world through one engine (`packages/ui/src/sensory`, `theme/feedback.ts`).

## 7. Rooms, the AppCatalog and the floor

**One list per room.** The AppCatalog is the one feature list (decided by Neev on 14 Nov 2026, `docs/decisions/2026-11-14-appcatalog-is-the-one-list.md`). Each room's catalog is a registry in its package; web and phone register the same ones. An entry with a `floor` part is furniture: its group, shape (row, card, rail, list, grid), urgency (now, later, any time), attention hints and time lens (review, current, plan). SanctuaryFeature reads the same entry to decide whether this person may have it. Never add a list beside the catalog. The full reference for this part is `docs/architecture/room-catalogs.md` (on the #151 branch).

**One floor engine.** `packages/core/src/logic/floor` places furniture for any room at any size: it shares space by weight, folds the least important into "See all" when space is short, and offers 16 arrangements. `layoutRoomFloor` is the one door both platforms use. Each room's zones and groups are in `rooms.ts` (`ROOM_FLOORS`). The person's saved layout moves, hides and pins features.

**Floor settings follow the world** (`logic/floor/settings.ts`): the world gives the default character (`theme/floorBias.ts`: slow worlds start roomier, fast worlds tighter, a world with a glow may light its lit feature); the person can change every room (`WORLD_FLOOR_ID`) or just this room; a later every-room change wins over older room settings. Density is calm, standard or dense; reorder is smart areas only, everywhere, or never.

**One floor per platform.** Phone: `apps/gurudevi-mobile/src/components/floor/RoomFloor.tsx`; web: `apps/gurudevi-web/app/(sanctuary)/components/RoomFloor.tsx`. Both draw with the kit's `FloorView`.

## 8. One main screen per tab, and screens opened from it

Each tab opens exactly one main screen, and all floor and layout work drives that screen. There are never two main screens for one tab.

- **Self and Workspace:** Overview. Workspace is one Overview drawn for the role that is on (teacher, principal, guardian, …; the role switch swaps it). A role's own parts are catalog entries with that role, never a separate dashboard. The room's name follows the capacity (Classroom, School, Learning, Family, …; `logic/workspace/roomName.ts`).
- **Library:** the whole shelf.
- **Community:** Feed, Groups and Messages, with the chosen one shown (Feed first).
- **Profile:** the profile floor.

Opening an item (a notes pebble, a book, a chat, a feature with its own route) opens a **second-level screen in the same tab**, on the same room ground and scene, drawn its own way. On the web, `SanctuaryShell` draws any room screen inside the room's `SanctuaryFloorCanvas`, and the room's strip (`RoomRouteTabs`) shows Overview first, then each screen opened in the room. On the phone, the main screen is `RoomFront`, and the other screens are stack screens under the room's tab, most drawn with `RoomPage`; they set their presence through `useScreenGround(stage)`.

## 9. The phone's stage

The phone mounts one `WorldStage` at the root (`apps/gurudevi-mobile/src/entry/EntryShell.tsx`; `packages/ui/src/components/native/Stage`). Screens never mount a scene. They say how present the floor may be (`useFloorPresence` or `useScreenGround`) and report scrolling (`useStageScroll`), and the stage eases between them. `WorldFloor` draws the scene with Skia at the stage tier: `ArtLife` and `ArtStill` for the moving and still layers, `FloorOverlays` for the floor tier's soft overlays, `floorPictures.ts` for the prerendered pictures. Kit parts read `useStage()` for press scale, rich surfaces, transitions and the header band.

The room's own ground (every room or just this room) comes from `src/components/ground` (`useRoomGround`, `GroundSheet`).

## 10. Person's settings that touch the world

| Setting | Where | What it does |
|---|---|---|
| World | World picker | Picks the world for the whole app |
| Mode | light or dark, chosen with the world and the hour (`CircadianProvider`) | Picks the palette |
| World Behind Screens | Lively, Balanced (default), Calm | How loud the ground is on each kind of screen |
| Visual detail (fidelity) | Settings | Goes into verger; can only lower what the device allows |
| Comfort | size, simpler look, more contrast, hand, sunlight | Changes recipes and the floor for the person's body and conditions; sunlight forces the light palette, strongest inks and a plain floor behind words |
| Look of a room | Floor Studio (web drawer, phone sheet) | Ground, photo, slideshow, tint, texture, density, reorder; always asks every room or just this room |
| OS settings | reduce motion, reduce transparency, more contrast | Read by verger and `WorldAccess`; they only calm |

## 11. What is not done

- None of this has run on the A24 or A52 yet; the tiers are planned, not measured.
- The ground choice and floor settings are kept per device on the phone, not synced to the account.
- Web screens still carry their own "Back to …" link and, in places, their own background (see `room-catalogs.md`).
- The web has no entitlement source, so every web account counts as free.
- Worlds hand-pick 16 colours per mode; deriving most of them from a few anchors is an open idea (`2026-11-15-living-worlds-elsewhere.md`).
- Sinhala and Tamil names for rooms are placeholders until Neev gives the words.

## Where the rest is

| Doc | Kind | Status |
|---|---|---|
| `2026-10-26-living-world-vision.md` | Why: vision, mission, principles | Still the vision |
| `2026-10-26-ui-vision-timeline.md` | History up to 26 Oct | History |
| `2026-10-22-worlds-foundation.md` | First components and tokens | Superseded by this doc for current state |
| `2026-10-26-world-model.md` | The six questions and the reasoning behind `resolveScene` | Superseded by this doc for current state; keep for the reasoning |
| `2026-10-26-app-shell-tabs-header-and-fab.md` | Shell audit and A/B | Point in time |
| `../../current_progress/2026-11-10-mobile-living-worlds-plan.md` | The five-phase mobile plan (built in #151) | Point in time |
| `../../architecture/2026-11-12-floor-system.md` and its component catalogue | The floor as recursive containers, space maths, patterns, accessibility, performance | Design basis of the floor engine |
| `../../architecture/2026-11-13-layout-history-day-one-to-one-system.md` | Layout from February to November and why rebuilds broke | History |
| `../../architecture/2026-11-13-layout-systems-mobile-and-web.md` | Audit of 13 Nov | Point in time |
| `../../architecture/2026-11-13-shared-rules-audit.md` | Global vs room vs page decisions | Point in time; built in #155 |
| `../../decisions/2026-11-14-appcatalog-is-the-one-list.md` | Decision | Accepted |
| `2026-11-15-living-worlds-elsewhere.md` | What others do, and the adopt ledger | Research |
| `prototypes/` | The claude.ai prototypes as standalone HTML (Living Sky, World Atelier, world model mind map, shell designs, floor patterns, floor arranging) | Prototypes |
| `screens/` | Screenshots from the work | Evidence |
| `../../architecture/2026-10-28-living-worlds-real-integration-master-spec.md` | An earlier integration plan | Superseded by this doc for current state |
