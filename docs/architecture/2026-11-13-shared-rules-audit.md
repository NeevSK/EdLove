---
title: "Shared rules audit: global vs room vs page"
status: "active"
created: 2026-11-13
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [shared-rules, worlds, verger, css, audit]
source: "https://claude.ai/artifact/WHUGeegKrrC3nwdYnu3p5q"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/WHUGeegKrrC3nwdYnu3p5q so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. Built in draft PR #155 (merged into the #151 branch). The counter script is `scripts/shared-rules/audit.py` (on the #151 branch); the screenshots and `shots.js` are in `docs/Core/design/screens/shared-rules/`.

# Shared rules audit: global vs room vs page

Nov 13, 2026 · @Neev

**In short:** the idea is sound, and the numbers back it. Pages and rooms make 16 kinds of decision themselves that a shared layer already owns, and placement runs through 7 separate systems. The visible results: in a night world Profile's card stays cream and the name disappears; Library tools paints a black page in every world; tab rows run off the screen. The fix is one owner per decision (platform, world, verger, person's settings, room, page), moved one recurrence per PR, ending with a lint guard so pages cannot drift back. Six items are Must; the first PR is a one-day fix that brings 480 uses of undefined colour names back into the world.

## Words and layers

Every visual or behaviour decision should have exactly one owner, and a page should own only its kind and its content. These are the words used below, in Neev's terms.

| Word | Means | Example |
| --- | --- | --- |
| Room | A full main tab | Self, Work, Community, Library, Profile |
| Page | One single screen, inside a room or on its own | Group chat, Settings, Reader |
| Floor | How a room places its pieces | Self floor, Work floor |

The owner layers, from widest to narrowest. A lower layer may only narrow what a higher one allows, never widen it.

| Layer | Owns | May not |
| --- | --- | --- |
| Platform | Phone vs desktop behaviour: scroll bars, touch size, safe areas, breakpoints, keyboard, tab bar position | Change with the world |
| World | Colours, ground, type, corners, shadows, motion character, sounds | Break readability limits |
| Verger | How much the device can afford: detail, effects, frame budget | Make things louder, only calmer |
| Person's settings | Comfort: reduced motion, text size, World Behind Screens, language | Be overridden by any room or page |
| Room | Its own look within world limits, its floor arrangement | Pick colours, breakpoints or motion itself |
| Page | Its kind (front, inner, form, reading) and its content | Paint its own ground, scroll bars, breakpoints, states |

## How it was measured

A script counted every place a page decides something for itself, on the newest web branch with the phone rooms work merged in (13 Nov). It skips tests, labs, archives and generated files.

- **Web pages:** 109 CSS files and 282 TSX files under the web app's app and lib folders.
- **Phone pages:** 111 TSX files under the phone app's app, src and features folders.
- **Shared room packages:** self, community, library, profile, classroom and others, 241 TSX files, used by both.
- **Kit:** packages/ui, the shared place, counted only for reference.
- **Screens:** the web app ran in explore mode, 9 rooms and pages at phone (390 px) and desktop (1440 px) width, in a light world and in Wewa at night. The phone app was not run; its numbers come from code only.

## Controls inventory

Sixteen kinds of decision are made page by page today, and for most of them a shared home already exists that pages ignore. The web is the worse offender; the phone rooms are newer and mostly go through RoomPage, but the shared room packages carry the old habits.

| # | Decision | Web pages | Phone pages + shared packages | Shared home today | Seen on screen |
| --- | --- | --- | --- | --- | --- |
| R1 | Colours | 1,963 hard-coded colours; 90 of 118 CSS files use no world colour at all; 21 colour names used \~480 times are defined nowhere, so they fall back to fixed white or cream | 75 in pages, 345 in packages | World tokens (--w-\*), theme/css.ts bridge | Wewa night: Profile card stays cream and the name turns invisible |
| R2 | Page and panel background | 39 files paint their own panel; 16 Self and Work panels fall back to #ffffff | Mostly through RoomPage (19 screens) | World ground, ground policy | Library tools paints a black page in every world |
| R3 | Scroll bars | Three layers fight: a global rule in styles.css, the kit ScrollArea rule, and 6 page files; 15 pages scroll themselves | 8 page files + 36 package files set scroll indicators | Kit ScrollArea (fixed 13 Nov) | Fixed for ScrollArea on 13 Nov; three other rules still fight on desktop |
| R4 | Breakpoints | 27 different widths in 31 files (640, 767, 768, 860, 900, 48rem, 34rem…); 25 files use Tailwind sm/md; 8 read the window in code | 10 different width numbers in 9 files | tokens.layout.breakpoints: 768, 1024, 1280 | Tabs and buttons run off the right edge on phone |
| R5 | Page width | 40 different max widths in 74 files | n/a | tokens.layout.containers (6 widths) | Rooms line up at different widths |
| R6 | Motion and reduced motion | 40 different durations (0.15s used 305 times), 40 files with own keyframes, 14 files handle reduced motion themselves | 26 different durations; reduced motion only in kit (good) | tokens/motion, world tempo, verger | Not checked live |
| R7 | Stacking (z-index) | 29 values from -1 to 10001 in 37 files | 7 files | None | Not checked live |
| R8 | Touch size | 24 files set their own 36–48 px; at phone width 11–26 controls per page are under 44 px (Profile: 26 of 60) | 2 files | Kit TOUCH\_MIN (48 Android, 44 iOS) | Profile, Community chips |
| R9 | Room sub-tabs | 11 pages build their own tab row; none use kit Tabs or Segmented | Room tabs in RoomPage | Kit Tabs, Segmented | Profile and Library tools tabs cut off with no hint |
| R10 | Headers and room label | 3 header kinds in pages; the kit holds 11 header components; each room draws its own label chip and settings button | RoomPage + 32 Stack.Screen settings | None agreed | Label and buttons differ per room |
| R11 | Empty, loading, error states | Pages import none of the kit states | Phone uses EmptyState, WaitingSign, ErrorState; packages add 5 of their own | Kit has about 20 overlapping ones | Not checked live |
| R12 | Safe areas | 4 files | 11 page + 22 package files | RoomPage, kit Shell | n/a on web |
| R13 | Text sizes | 1,297 fixed sizes in 103 files | 19 different sizes (9–36) | World text roles (--w-text-\*) | Text size setting cannot reach these |
| R14 | Spacing, corners, shadows | 2,697 spacing, 808 corner, 311 shadow values | 353 spacing, 52 corner values | tokens/space, world radius and shadow | Rooms feel unrelated |
| R15 | Blur effects | 83 uses in 32 files | few | Verger should gate them | Costly on 2 GB phones |
| R16 | Readability over the scene | Pages pick their own veil or none | Ground policy in use | groundPolicyOf, veil limits | Desktop Library list text sits straight on the scene |

Screens from this run, in shared-rules: phone\_community.png, phone\_library\_tools.png, dark\_profile.png, desktop\_library.png.

## Placement systems

This section covers how rooms place their pieces. The long reference, with every file named, is [Layout systems: what exists, mobile and web](https://claude.ai/artifact/Kx7w7KfwomZYYttW3pArgR).

**In short:** the kit (buttons, cards, sheets) is shared and fine. Placement is not. Seven separate systems decide where pieces go, three of them are orphans that nothing mounts, and sample data reaches screens by three different paths. The target is one saved model, one placement engine and one room frame per platform.

### The seven placement systems

| # | System | Where | Used by | State |
| --- | --- | --- | --- | --- |
| 1 | Saved layout model (zones, groups, order, hidden, pinned, per target) | core logic/workspace canvas.ts, layoutSession, Supabase layout repo | Web rooms | Live, the one real source of truth |
| 2 | Web room frame | web SanctuaryFloorCanvas, FloorStudioDrawer, lib/canvas/use\*Canvas | All five web rooms | Live, saves per workspace and target |
| 3 | Old renderer (stack / grid / kanban) | core renderer.ts, ui ResponsiveWorkspaceCanvas | Tests only | Orphan |
| 4 | Web domain canvas | web lib/canvas/domainCanvas.ts | Nothing | Orphan |
| 5 | Self unified screen | packages/self SelfScreen.unified, SelfCanvas, selfCanvasStore | Nothing | Orphan |
| 6 | Phone Self floor | mobile SelfFloor, useSelfCanvas | Phone Self | Live, a catalogue; pins live only on the phone, never synced |
| 7 | Floor engine (added this week) | core logic/floor, ui FloorView, ROOM\_PLANS | Phone Work behind a flag, floor lab | New, parked |

### Phone vs web, room by room

| Room | Web | Phone |
| --- | --- | --- |
| Self | System 2: hero, body, day rhythm, shelf, catalogue | System 6, its own screen |
| Work | System 2: role lens, workbench, heading, attendance, insights | Shell screen; WorkFloor (system 7) only behind a flag |
| Community | System 2: search, circles | Room page, not on any floor system |
| Library | System 2: task strip, shelf, invitations | Room page, not on any floor system |
| Profile | System 2: profile stage | Room page, not on any floor system |

### Other orphans and duplicates

- Phone WorkspaceHome: a finished Work front screen (events, welfare, inventory, peers, atlas) that was never mounted.
- Admin guardian and founder canvases import a hook that was deleted on 6 Nov, so they do not build.
- Pin caps differ per room (Self 2, Library 2, Community 0, Profile 3, teacher dashboard 4) and are set in code, not by a layer.
- Phone classroom routes were retired on purpose and a test forbids them; the new Work pieces brought classroom data back onto the floor, which conflicts with that.

### Three sample-data paths

1. The sandbox layer (useSandboxMode: live, ghost, demo, bridging; registerSandboxDomain, getSandboxSamples). Web Library and Profile use it. This is the intended one.
2. Per-domain ports with a sample adapter (definePort, library/community/profile ports, deskPort). Phone rooms use these. They bypass the sandbox layer.
3. Mock data imported directly into screens (classroom mockData and others).

Target: ports stay as the seam to the v1 API, but their sample adapter reads from the sandbox layer, so ghost and demo modes work everywhere.

### Is a piece a section or a single feature?

This is the open question that decides the floor's shape. On web, a piece is a section of a room ("workbench", "shelf"). The phone Work pieces made this week are single features ("today's classes", "fees due"). Neev's rule says layout and features are separate layers, so the default taken here is: **a piece is a section slot owned by the floor; features fill it**. Neev can change this.

### Target shape

1. One saved model (system 1), for web and phone.
2. One piece list per room, declared once and shared.
3. One placement engine (system 7), pure, used by both platforms.
4. One room frame per platform, replacing WorkFloor, the phone room pages and Self's own screen.
5. All sample data through the sandbox layer.

Order: agree the piece meaning, move web onto the engine behind its current look, move phone Self and Work, then Community, Library, Profile, then remove orphans (each removal asked first, per the Deletion Veto).

## Three eyes

Each recurrence was asked three questions: who should feel in control (product), which layer owns it (architect), and what moving it costs or breaks (engineering). Cost: S under a day, M a few days, L a week or more.

| # | Product: who is in control | Architect: owning layer | Engineering: cost and risk |
| --- | --- | --- | --- |
| R1 Colours | The world, so every room changes together | World | L. Define the 21 missing names as world aliases first (S, fixes dark worlds at once), then swap literals file by file |
| R2 Backgrounds | The world and the person's World Behind Screens choice | World + person's settings | M. Pages declare kind only; remove panel paints; check readability per world |
| R3 Scroll bars | Nobody; it is how the platform behaves | Platform | S. Remove styles.css and page rules, keep the kit rule; every scroll goes through ScrollArea |
| R4 Breakpoints | Nobody | Platform | M. Three named sizes as CSS custom media and one hook; pages may only use phone, tablet, desktop |
| R5 Page width | Room, by picking from the token widths | Platform gives choices, room picks | S–M. Mechanical swap to tokens |
| R6 Motion | World sets character; person's reduced motion and verger only calm it | World + person + verger | M. One global reduced-motion rule; durations to --w-settle and friends |
| R7 Stacking | Nobody | Platform | S. A named scale (ground, floor, raised, sticky, sheet, toast, tooltip) |
| R8 Touch size | The person's comfort (larger targets) on top of the platform minimum | Platform + person | M. Kit already has TOUCH\_MIN; pages must stop shrinking controls |
| R9 Sub-tabs | Room decides which tabs; how tabs look and scroll is shared | Kit, room supplies list | M. Replace 11 hand-made rows with kit Tabs |
| R10 Headers | Room says its name; the shell draws it | Shell (one per platform) | M. One room header with label, perspective and room settings |
| R11 States | World dresses them, verger limits motion | Kit (world-governed) | M. Pick one each of empty, waiting, error; retire the rest |
| R12 Safe areas | Nobody | Shell | S. Only RoomPage and sheets read insets |
| R13 Text sizes | The person (text size setting) inside world type roles | World + person | L. Map 1,297 sizes onto 6 to 8 roles; visible change, needs screenshots per world |
| R14 Spacing, corners, shadows | The world | World | L, mostly mechanical; do with R1 per file |
| R15 Blur | The device | Verger | S. One kit class gated by verger tier |
| R16 Readability | The person's choice, never below the readability floor | Ground policy | S. Pages declare kind; the policy picks the veil |

One pattern runs through all of it, and the layout thread's section found the same: the shared home exists, but nothing stops a page from deciding again. So the last step must be a guard, not a reminder.

## MoSCoW

Must-haves are the ones a person can see break today or that block the low-end phone target. Everything that stays with the page is listed too, so the line is explicit.

| Bucket | What becomes shared | Why this bucket |
| --- | --- | --- |
| Must | R1 colours (missing names as world aliases first), R2 backgrounds, R3 scroll bars, R4 breakpoints, R8 touch size, R16 readability | Visible breakage in at least one world or width; accessibility (WCAG 3 draft) |
| Must | One Floor for all rooms; sample data through the sandbox layer (see Placement systems) | Neev's rule from 13 Nov; three floors on phone today |
| Should | R6 motion, R9 sub-tabs, R10 room header, R11 states, R12 safe areas, R15 blur | Inconsistency and cost, not breakage |
| Could | R5 page width, R7 stacking, R13 text sizes, R14 spacing, corners, shadows | Large and mostly mechanical; R13 changes how text looks, so it needs screens per world first |
| Won't (stays with the room) | Which pieces it has, its own look within world limits, its arrangement, its tab list, its name | That is what a room is for |
| Won't (stays with the page) | Its kind (front, inner, form, reading) and its content | That is all a page should decide |

## Mapping and order

Each step is one small PR that moves one recurrence from where it lives today to its owning layer, web and phone together, with before and after screens at phone and desktop width. Nothing starts until Neev has read this doc.

| Order | Moves | From today | To | Size |
| --- | --- | --- | --- | --- |
| 1 | R1a missing colour names | 21 undefined --color-\* names in page CSS | World aliases in theme/css.ts bridge | S |
| 2 | R3 scroll bars | styles.css, 6 page modules, 44 phone/package files | Kit ScrollArea (web), one kit scroll view (phone) | S |
| 3 | R16 + R2 ground and panels | 39 panel paints, Library tools black page | Page kind + ground policy | M |
| 4 | R4 breakpoints | 27 web values, 10 phone values | Three named sizes from tokens, CSS custom media + one hook | M |
| 5 | R8 + R9 touch size and sub-tabs | 11 hand-made tab rows, 24 files shrinking controls | Kit Tabs/Segmented, TOUCH\_MIN | M |
| 6 | One Floor, sandbox data | 7 placement systems, 3 data paths | Placement systems section, target shape | L, its own series |
| 7 | R6, R10, R11, R12, R15 | Page files | World motion, one room header per platform, one set of states, shell insets, verger blur | M each |
| 8 | R5, R7, R13, R14, rest of R1 | Page files | Tokens and world roles | L, file by file |
| 9 | Guard | Nothing | Lint rules that fail a page for: a raw colour, a width media query, its own scroll bar style, a z-index number, its own reduced-motion block, a fixed font size; a counter in CI that may only go down | S, then tightened each step |

The audit script is the counter for step 9: it reruns after every PR and the numbers in the inventory must fall.

Step 6 has its own history and build order in [Layout history: day one to one system](https://claude.ai/artifact/MiDUdq3GZopYLS9Dv3zwF9), which uses the same owner layers for placement.

**Progress (13 Nov):** steps 1, 2, 3, 4, 5 (touch size), 7 (reduced motion, blur), 8 (colours) and 9 (guard) are in [PR #155](https://github.com/NeevSK/EdLove/pull/155). Raw colours in app pages are down from 3,620 to 407 and breakpoint widths from 27 to 3. Sub-tabs (R9) and the room label move with the layout thread's room frame. Still to do: kit states (R11), phone safe areas (R12), text sizes (R13), z-index (R7).

## Defaults taken

These were decided so work is not blocked; each can be changed with one word.

- Three sizes only: phone under 768 px, tablet 768 to 1023, desktop 1024 and up, from the existing tokens.
- Touch minimum 48 px on Android, 44 px on iOS and web; the person's comfort setting may raise it, never lower.
- No standing scroll bar on phones or touch screens; a thin one appears only while moving. Desktop keeps a thin world-coloured bar.
- One empty state, one waiting sign, one error state, dressed by the world. Others retire after Neev sees them side by side.
- A piece is a section slot owned by the floor; features fill it (from the layout thread).
- Text sizes (R13) wait until Neev has seen before and after screens in three worlds, because it changes how every page reads.
