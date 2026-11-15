---
title: "Layout systems: what exists, mobile and web"
status: "active"
created: 2026-11-13
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [layout, floor, rooms, audit]
source: "https://claude.ai/artifact/Kx7w7KfwomZYYttW3pArgR"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/Kx7w7KfwomZYYttW3pArgR so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. Point-in-time audit of 13 Nov 2026. `ROOM_PLANS`, `WorkFloor` and the work pieces it names were removed on 14 Nov (AppCatalog decision).

# Layout systems: what exists, mobile and web

Nov 13, 2026 · @Neev

## Short answer

The kit (buttons, cards, rows, menus, the new five) is fine and shared by web and phone through one theme. The problem sits one level up: the code has at least **five different ways of laying out a room**, built at different times, and no room uses the same one on both web and phone.

- **Web** has one real system that every room uses: a shared room frame (`SanctuaryFloorCanvas`) plus a per-room hook that saves order, pins and look per account. Each room still hand-places its own content in CSS.
- **Phone** has no single system. Self has its own catalogue screen, Work had nothing (I added an engine-drawn floor behind a flag), Community, Library and Profile are placeholders here and engine-drawn on the mobile rooms branch.
- Three older layout systems are **orphaned**: written, tested, used by no screen.

Checked on branch `claude/project-thread-g4vy3a` on 13 Nov 2026, plus the mobile rooms branch (PR #153). The ground branch (PR #154) changes the look layer, not placement, and is noted where it matters.

## Every layout system in the code

Seven placement systems exist. Two are alive on web, two on phone, three are used by no screen.

| System | Where it lives | What it does | Used by | State |
| --- | --- | --- | --- | --- |
| Layout model (areas, groups, pieces, order, hidden, pinned, look) | `core/logic/workspace/canvas.ts`, `layoutSession`, Supabase layout repo | Holds what a person arranged, per account, room and screen kind (web, phone, shared) | Web (all rooms, through `useBrowserWorkspaceAppearance`), my phone sync | Alive, the shared base |
| Web room frame | web `SanctuaryFloorCanvas` + `FloorStudioDrawer` + `lib/canvas/use*Canvas` | Ground, look picker, furniture drawer (reorder, pin, hide sections), arrange mode, task strip | Web Self, Work, Community, Library, Profile | Alive |
| Old renderer (stack, grid, columns by device) | `core/logic/workspace/renderer.ts` + `ui/components/workspace/ResponsiveWorkspaceCanvas` and its 3 renderers | Lays areas as a phone stack, tablet grid or web columns | No screen. Tests only | Orphan |
| Web domain grouping | web `lib/canvas/domainCanvas.ts` | Groups pieces by a room's own groups | No screen | Orphan |
| Shared Self canvas | `packages/self` `SelfScreen.unified`, `SelfCanvas`, `selfCanvasStore` | Older shared Self screen with its own saved layout | No screen | Orphan |
| Phone Self catalogue | mobile `SelfFloor` + `useSelfCanvas` | Greeting, pinned practices, category chips, card grid. Pins kept on the phone only | Phone Self | Alive |
| New floor engine (mine) | `core/logic/floor` + kit `FloorView` + `ROOM_PLANS` | Sizes, first-screen fit, "See all" folding, 16 arrangements | Phone Work (behind a flag), floor lab, phone Library, Community, Profile on PR #153 | New, partly used |

Also orphaned: the phone's `WorkspaceHome` (a calm Work front screen with cards to Programs, Welfare, Materials, Nearby, Atlas, Roles, Fees; built, never mounted) and the admin guardian and founder canvases.

## Phone: Self vs Work vs the other rooms

Each phone room answers the same questions differently. Self and Work share no code for placing things, and Work is either empty or on the new engine.

| Question | Self | Work | Community, Library, Profile |
| --- | --- | --- | --- |
| What the front screen draws | Own catalogue: greeting card, pinned practices as pebbles, category chips, practice cards in a grid | Default: "capability unavailable" for most roles; commercial opens its own page. With the flag on: my engine-drawn floor | This branch: "not built yet" placeholders. PR #153: engine-drawn floor (`RoomFloor`, a near copy of my Work floor) |
| What a piece is | One practice from the Self manifest (`selfRegistry`) | A place in my `ROOM_PLANS` (attendance, marking...) | A place in `ROOM_PLANS` written by the mobile rooms thread |
| Groups on the screen | Two fixed sections: Pinned, All practices (filtered by category chip) | Areas and groups from the plan (Today, Work, School, Ahead) | Areas and groups from the plan |
| How it decides size and columns | Its own maths: cards at least 160 wide, as many columns as fit | The engine: first-screen budget, folding, 16 arrangements | The engine |
| Landscape and side rail | Yes: greeting and pins side by side, gutters from the shell | My Work floor: no (ignores the shell's rail and gutters) | Yes on PR #153 (uses the shell's layout and scroll) |
| Person can reorder | No | Up/down buttons exist in the kit, not wired on the screen | Same as Work |
| Person can pin | Yes, kept on this phone only (`useActiveSubTabsStore`) | No | No |
| Where the arrangement is saved | Phone only, not synced | Phone first, keyed per room and bond (`useFloorLayout`), server sync pluggable but not connected | Same as Work |
| Opening a feature | Same screen with `?feature=`, then the task strip under the header | Separate routes; only Programs (events) exists | Own inner pages on PR #153 |
| Where its data comes from | Self feature modules (some files missing from git) | My `deskPort` reading sample constants directly | PR #153 ports reading sample constants directly |
| Ground and world | World stage behind, full presence | World stage behind | World stage behind; PR #153 adds per-room look |

Two more findings:

- An earlier session built **`WorkspaceHome`**, a calm Work front screen linking to the Work pages that exist (Programs, Welfare, Materials, Nearby, Atlas, Roles, Fees). It was never mounted. I did not know of it and built a different Work floor instead.
- Mobile **retired its classroom screens on purpose** (a test forbids classroom routes in the Work registry). My Work pieces brought classroom data back onto the Work floor, which cuts across that decision.

## Web vs phone, room by room

Web treats every room the same way at the frame level; the phone treats every room differently. Inside the frame, web rooms place coarse sections ("furniture") by hand, while the phone engine places fine pieces automatically.

| Room | Web front screen | Web furniture the person can reorder, pin, hide | Phone front screen (this branch / PR #153) |
| --- | --- | --- | --- |
| Self | Room frame + practices grouped by category, sorted by role and time of day; task strip | Hero practice, Somatic and breathing, Circadian rhythm, Personal shelf, Full catalogue (pin cap 2) | Own catalogue (greeting, pinned pebbles, chips, card grid); task strip |
| Work | Room frame + role lens, daily operations timeline, posture header, attendance roster, presence insights, feature catalogue of cards, date picker | Role lens, Workbench, Header, Attendance, Insights (pin caps 2 to 4 by role) | "Capability unavailable" by default; my engine floor behind a flag; unmounted `WorkspaceHome` |
| Community | Room frame + search, circles feed, tabs for circles, announcements, forest; direct messages | Search, Circles (pin cap 0) | Placeholder / engine floor with feed, chats, groups, notices |
| Library | Room frame + reading task strip, shelf with search and filters (lessons, lectures, documents, worksheets, saved), curated invitations | Task strip, Shelf, Invitations (pin cap 2) | Placeholder / engine floor with shelf and item pages |
| Profile | Room frame + identity, look and motion, security sections | Profile stage only (pin cap 3) | Placeholder / engine floor |

Shared vs not shared:

| Layer | Web | Phone | Same code? |
| --- | --- | --- | --- |
| Theme, tokens, worlds | `@repo/ui/theme` | `@repo/ui/theme` | Yes |
| Kit components | `components/web` | `components/native` | Same contracts, two builds |
| Saved arrangement (model) | Supabase layout repo + local copy, target `web` or `shared` | Phone copy only (`useFloorLayout`), target `mobile` | Same model, phone not synced |
| Room frame (ground, look picker, furniture drawer, arrange mode) | `SanctuaryFloorCanvas` | None as one piece; world stage + shell hooks; PR #154/#153 add a ground sheet | No |
| Placement inside a room | Hand-written per room in CSS modules | Self: own maths; others: the engine | No |
| Open-work strip | `TaskStrip` + workbench | `ActiveSubTabStrip` | No |
| Sample data | Sandbox registry (`getSandboxSamples`) plus the old API client | Direct sample constants (`deskPort`, PR #153 ports) | No |

The furniture lists also differ in kind: web furniture is a whole page section ("Attendance roster"), my phone pieces are single features ("Attendance", "Marking"). The two are not yet the same idea of a piece.

## Orphans and duplicates

Nothing below is deleted. These are the candidates, each needing your yes before removal.

| What | Kind | Why it matters |
| --- | --- | --- |
| `renderer.ts` + `ResponsiveWorkspaceCanvas` (+ mobile, tablet, web renderers) | Orphan | A third layout idea nobody draws with |
| web `domainCanvas.ts` | Orphan | Web grouping helper never called |
| `packages/self` unified Self screen and canvas store | Orphan | Old shared Self layout with its own saving |
| admin guardian and founder canvases | Orphan, broken | Import the sync hook that was deleted on 6 Nov |
| phone `WorkspaceHome` | Orphan | A ready Work front screen that matches existing Work pages |
| My `WorkFloor` vs PR #153 `RoomFloor` | Duplicate | Same component written twice |
| `deskPort` vs PR #153 ports vs web sandbox registry | Duplicate | Three sample-data paths |
| Phone `TaskStrip` (`ActiveSubTabStrip`) vs web `TaskStrip` | Parallel | Same idea, two builds; fine if they share one model |
| Self pins (phone store) vs layout model pins | Duplicate | Self pins never reach the account or web |

## Recommendation: one system in three layers

Keep what both platforms already agree on, and make the rest one thing used by every room on both.

1. **One saved model (keep as is).** `core/logic/workspace/canvas.ts` and the layout session already hold order, hidden, pinned and look per account, room and screen kind. Phone starts syncing to it, and Self pins move into it.
2. **One list of pieces per room.** Each room declares its pieces once (from its features), used by web and phone alike. Web's sections and the phone's pieces become the same list, so "Attendance" means the same thing everywhere.
3. **One placement engine.** `core/logic/floor` decides what goes where for any room at any size. It is pure logic, so web can use it too. The old renderer is retired in its favour.
4. **One room frame per platform.** Web keeps `SanctuaryFloorCanvas`. The phone gets one `RoomFrame` with the same jobs (ground, look sheet, furniture sheet, arrange mode), replacing my `WorkFloor`, PR #153's `RoomFloor` and Self's own screen.
5. **One sample-data path.** Rooms ask the existing sandbox layer for samples. `deskPort` and the per-room sample ports go through it.

Order of work, each step reversible and shown before any deletion:

1. Agree the per-room piece lists with you (Self, Work by role, Community, Library, Profile).
2. Build the phone `RoomFrame` and move Self onto it with the same look it has now.
3. Move Work (starting from `WorkspaceHome`, not my pieces), Community, Library and Profile onto it.
4. Connect phone saving to the shared model.
5. Let web rooms take placement from the engine, room by room, behind a switch.
6. Show you the orphan list, then remove what you approve.

## Decisions for you

- [ ] Is a piece a whole section (web today: "Attendance roster") or a single feature (phone today: "Attendance", "Marking")? My suggestion: a single feature, with sections as groups.
- [ ] Should web also take placement from the engine, or keep hand-placed rooms and only share the saved model?
- [ ] Work on the phone: start from the unmounted `WorkspaceHome`, and keep classroom screens retired?
- [ ] Self on the phone: keep its current look (greeting, pebbles, chips, grid) as Self's arrangement on the shared engine?
- [ ] Approve removing the orphans in the table above, one by one, once the new path works.
