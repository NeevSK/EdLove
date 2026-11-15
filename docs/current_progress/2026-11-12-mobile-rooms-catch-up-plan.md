---
title: "Mobile rooms catch-up plan"
status: "active"
created: 2026-11-12
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [gurudevi-mobile, rooms, community, library, profile, plan]
source: "https://claude.ai/artifact/S9VpTLGx5eJkzoB7puHcCr"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/S9VpTLGx5eJkzoB7puHcCr so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. Library, Community and Profile on the floor engine merged as PR #153. `ROOM_PLANS` named here was later replaced by the AppCatalog (see `docs/decisions/2026-11-14-appcatalog-is-the-one-list.md`).

# Mobile rooms catch-up plan

Nov 12, 2026 · @Neev

## The short answer

You are not off track. Layouts and components are the floor; rooms are what stands on the floor; the world is what the floor is made of. All three are one system, so they move together. This plan keeps them in one order: the floor engine decides where things go, the world kit decides how they look, and each room only supplies its pieces. Ground looks (the "this room or every room?" choice and the web bugs) are handled in the thread **Fix world ground and floor looks**; this plan uses its result on mobile instead of building a second one.

## What mobile has today, room by room

Audited on the parity branch (PR #151, commit e73d3859).

| Room | Mobile today | Web today | Gap |
| --- | --- | --- | --- |
| Shell | World header, rooms bar, room button, You sheet, one world floor at the root (WorldStage) | Same ideas, separate code | Small. Mobile is ahead here. |
| Self | Real screen (SelfFloor): greeting, pinned practices, practice cards | SelfFloor with about 36 pieces | Not on the floor engine yet; no Self plan in ROOM\_PLANS |
| Work room | WorkFloor on the floor engine, but only behind a dev switch; pieces are plain cards that open nothing | Many floors (classroom, gradebook, timetable, school, tuition, guardian, events, plan) | Pieces need destinations; switch it on by default |
| Community | Placeholder: "Community is being rebuilt" | Feed, group chat, messages, announcements, school forest | Whole room |
| Library | Placeholder | Shelves, reader, map, video, collections, tools, contribute, curator | Whole room |
| Profile | Placeholder (You sheet covers a little) | ProfileFloor (very large) and security | Whole room |
| Notifications, Settings | Thin wrappers over shared screens | Own floors | Need to wear the world |
| Ground per room | One world ground for every room | Each room has its own appearance (live, image, wallpaper) | Needs the shared rule below |

## Why mobile is so empty

On 6 Nov the commit "Arrive journey on the v1 API" removed 8 Community screens, 15 Library screens and 6 Profile screens, because they called old server code that was retired. The new server (sanctuary-api) only answers identity and authority so far. Every domain module (community, library, journey/profile, wellbeing) is still a skeleton. Web still works because it uses the old client and sample data.

So the rooms cannot simply be copied back. Each one needs a small data port: one interface per domain, a sample-data adapter now, and a v1 adapter when that server module opens. The screens do not change when the data source does.

## The ground rule (from your message)

1. One world is shared by the whole app, and every room's floor follows it by default.
2. When someone changes a room's floor, we ask: only this room, or every room?
3. A custom floor stays inside the same world (its live scene, a still picture, plain, or an image), and still passes the world's readability checks.
4. Mobile reads the same saved choice as web (the workspace appearance in core), so a change on one device shows on the other.

The ground thread builds the model and the web fixes. This thread wires it into the mobile floor and adds the "this room or every room?" sheet on the phone.

## Order of work

Each step is additive, so nothing on the phone breaks while the next room arrives.

1. **Room plans.** Add Self, Community, Library and Profile plans to ROOM\_PLANS, with floor snapshots for phone, tall phone and tablet. Everything after this places pieces through the engine.
2. **Data ports.** Library, Community and Profile ports in their packages, with sample adapters (the same samples web shows).
3. **Library room.** Read-mostly, so it is the safest first room: shelves, collections, open a resource, search.
4. **Community room.** Feed, groups and announcements first; chat and messages after, since they need realtime.
5. **Profile room.** Who you are, your bonds, achievements, security; the You sheet links into it.
6. **Self and Work on the engine.** Self moves onto its plan; Work pieces get destinations and the dev switch flips to on.
7. **Ground on mobile.** Read each room's ground from the shared model and add the phone sheet. Starts as soon as the ground thread's model lands.
8. **Later, own passes.** Library tools (scanner, OCR, PDF editor, spreadsheet) need heavy native parts; drag and drop; School Atlas.

## Defaults I am choosing (change any time)

- Phones get the same pieces as web, but fewer at once: the engine folds the lowest-weight pieces into a "more" row on small screens.
- Low tier phones (Android 9/10, 2 GB) get still pictures and no card motion; verger decides, as everywhere else.
- Rooms that have no data yet show the world's empty state with a clear sentence, never a blank screen.
- Sinhala and Tamil words stay English until you give the words.
