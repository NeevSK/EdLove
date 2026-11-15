---
title: "Sanctuary lists and terms: the AppCatalog is the one list"
status: "accepted"
created: 2026-11-14
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [decision, appcatalog, sanctuary-feature, floor, rooms]
source: "https://claude.ai/artifact/Md3ELVJZDmXvjcrogbuSRm"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/Md3ELVJZDmXvjcrogbuSRm so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. Decided by Neev on 14 Nov 2026. The implementation reference is `docs/architecture/room-catalogs.md` on the #151 branch.

## Decided 14 Nov: the AppCatalog is the one list

Neev chose the proposal below. What is now done on the branch:

- Each catalog entry carries its roles, its floor place (group, shape, urgency, attention), its time lens, icon and routes.
- The web's 18 Workspace features moved into the catalog. The web's Workspace screens read them from there.
- The web registers the same catalogs as the phone. The phone registers Community, Library, Classroom and Admin again.
- The floor engine reads the catalog. Each room keeps only its zones and groups.
- One floor per platform, called RoomFloor.
- Removed: room plans, the Work pieces and their sample desks, and the web's own Workspace list.
- Kept: Self's 23 single features as the contents of the seven Self entries, and each platform's "how to draw it".
- Still open: the web has no SanctuaryFeature context yet, so the web floor shows every catalog feature. Workforce is in development in the catalog, so the web no longer lists it. The phone's work floor stays opt-in.

The repo doc is docs/architecture/room-catalogs.md.

# Sanctuary lists and terms: what came new

Nov 14, 2026 · @Neev

## Your model (the words we keep)

- **Sanctuary**: the whole app.
- **Tab**: opens a **room** (Self, Workspace, Community, Library, Profile). The tab can be called anything; the room is what matters.
- **Floor**: what a room shows.
- **World**: every visual follows it.
- **Feature catalog**: the feature list for each tab. **SanctuaryFeature** checks a feature against it (capability, citizenship, plan, flag, web or phone). A feature that is not in the list does not work.
- **Canvas layout**: the arrangement of the features (the furniture) and each feature's shape.

## What the registries and catalogs do today

| List | Since | What it does | Used by |
| --- | --- | --- | --- |
| **AppCatalog** with one registry per package (SELF\_REGISTRY 14, COMMUNITY\_REGISTRY 4, LIBRARY\_REGISTRY 3, CLASSROOM\_REGISTRY 2, ADMIN\_REGISTRY 3, plus AI, Form builder, Workforce) | Mar to May 2026 | **This is your feature catalog per tab.** Each entry says which tab it belongs to, what it needs (capability, citizenship, plan, flag), whether web and phone support it, its lifecycle, the roles it is for, and its default zone and order. `useDomainFeature(id)` reads the entry and asks SanctuaryFeature. A missing entry throws an error. | Phone only. On 6 Nov (commit 308aa4f35) Community, Library, Classroom and Admin were taken out, so the phone catalog now has only Self, AI, Form builder and Workforce. **The web registers no catalog at all.** |
| Self `FEATURE_CATALOG` | 29 Aug | A second, richer Self list: roles, insights, and the time lens from this week. Overlaps SELF\_REGISTRY. | Self on web and phone |
| Web `BROWSER_SELF_FEATURES` | 20 Sep | How the web draws each Self feature (which component). It says how to draw, not what exists. | Web Self |
| Web `WORKSPACE_FEATURES` | 20 Oct | A web-only Workspace list with a role lens. | Web Workspace |
| Admin capability registries (principal, founder, guardian) and `PRINCIPAL_FEATURE_REGISTRY` | Mar | Admin tools per role. | Admin screens |
| Furniture lists in each web floor file | Oct | Labels for the Floor Studio. Mostly not tied to anything on the page. | Web Floor Studio |
| Core `workspaceCatalog` (other branch, `web-stack-astro-vite`) | 13 Nov | Workspace features per capacity; deletes the web `WORKSPACE_FEATURES`. | That branch only |
| Core `ROOM_PLANS` ("room plan", by me) | 12 Nov | A per-role list of features plus where they sit. **Duplicates the catalog.** | Phone Work floor and the four branches below |

## New terms since 8 Nov, and what to do with each

| New term or file | Branch | What it is | Proposal |
| --- | --- | --- | --- |
| room plan, `ROOM_PLANS`, `roomPlanOf`, `roomFloorInput`, `layoutRoomFloor` | g4vy3a, uw3vk5, taffz6, fkn0id | Second feature list | **Prune.** The arrangement reads the AppCatalog plus the canvas layout. |
| area, piece (`AreaInput`, `PieceInput`) | g4vy3a | Engine words | Rename to your older words: area → **zone**, piece → **feature**. Group stays (the canvas already has group order). |
| `RoomFrame`, `RoomFloorBody`, `WorkFloor`, `RoomFloor`, `RoomPage`, `PageFrame`, `PieceFrame` | g4vy3a, uw3vk5 | Seven names for "the floor of a room" | **Prune to one floor per platform**, called the floor. |
| Work "pieces" (teacher, principal, student, guardian) | g4vy3a | Feature screens made inside the layout work | Park until the catalog decides them. |
| "place" (doc `places-roles-and-features.md`) | web-stack-astro-vite | Renames room to place | **Your call.** Your world model doc says room. |
| `definePort` with sample adapters | uw3vk5 | Sample data for phone rooms | Route through the existing sandbox layer. |
| "frame", "page" (for floor) | messages | My words | Stop using. |
| floor settings: "every room" or "just this room" | g4vy3a | Density and reorder follow the world unless one room is set | Keep. |
| time lens on features | g4vy3a | Past, present and future per feature | Keep, and move it onto the catalog entries. |
| `FloorView` and its patterns (web and phone kit) | g4vy3a | Draws an arrangement | Keep, as kit drawing only. |

## Order

1. Agree the words above.
2. Put Community, Library, Classroom and Admin back in the AppCatalog, and register it on the web too.
3. Web features go through `useDomainFeature` and SanctuaryFeature, as on the phone.
4. Fold the other lists into the catalog (Self `FEATURE_CATALOG`, web `WORKSPACE_FEATURES`, admin registries, `workspaceCatalog`), each with your yes.
5. Prune `ROOM_PLANS` and the extra floor names; the arrangement reads catalog plus canvas layout.
6. Tell the threads on uw3vk5 and web-stack-astro-vite, so nobody keeps building on room plans.

## What room plans hold besides the feature list

Checked field by field on 14 Nov against every other list.

| In room plans | What it means | Also lives in | Overlap or unique |
| --- | --- | --- | --- |
| Which features each room has, per role (46) | the furniture of a room | AppCatalog, Self feature catalog (23), web Workspace list (18), astro Workspace floors | Overlap. Self uses the catalog's own names. Workspace matches only 3 (attendance, timetable, events) and Community matches none (catalog has hearth, circles, messages, trust): I made up names there. |
| Role to list (tutor and marker see teacher's) | who sees which list | catalog targetPersonas, web roles, astro Workspace floors | Overlap, four copies |
| Zones (Today, Work, School, Ahead) | the big parts of the floor | Self catalog zone (today, private, shared), web category | Overlap, different names |
| Groups with a job (act, browse, glance, track) | how a cluster behaves | nowhere else | Unique |
| Shape of each feature (row, card, rail, list) | your "shape of the feature" | web Self list says how to draw each one on web | Mostly unique |
| Time now, later, anytime | how urgent today | nowhere else | Unique. This is not your past/present/future lens. |
| Attention hints (task, lit, needs attention, role weight) | what lights up | Self catalog role weights and time of day | Partly overlap |
| Default order | first placement | every list | Overlap |

## Where past, present and future live

The time lens (review the past, act now, plan ahead, and whether the past is sealed, append only or editable) is in core logic/registry/timeProfile.ts. It is set on all 23 Self catalog features and all 18 web Workspace features. It is not on the AppCatalog and not in room plans.

## A correction

The four rooms did not fall off the AppCatalog by accident. The 6 Nov change "Arrive journey on the v1 API" removed the old Community, Library, Classroom and Admin screens on mobile, and their catalog entries went with them. Putting entries back goes together with rebuilding those rooms.

## One open detail: how big is one feature

AppCatalog entries are bundles (Self "Inner Pulse" holds daily pulse, mood lotus and wisdom seeds). The Self catalog lists the 23 single features. Default I propose: one piece of furniture is one AppCatalog entry, and its bundle shows inside it. Easy to change later.

## Proposal: one list per room

The AppCatalog stays the one list, because SanctuaryFeature already reads it. Each entry gets an optional floor part (zone, group, shape, order, attention hints) and the time lens. Each room keeps its few zones and groups beside its catalog. Then everything reads that one list:

- SanctuaryFeature, as today.
- The floor engine, instead of room plans.
- Web Self and Workspace, instead of their own lists. The web keeps only how it draws each feature.
- The phone floor.

Folded in and then removed, each with your yes: room plans, the web Workspace list, the extra fields of the Self catalog, and the astro branch Workspace catalog.

## Steps

1. Add the floor part and time lens to the catalog entry type. Nothing changes on screen.
2. Fill them for Self and Workspace from what already exists, using the catalog's names.
3. The floor engine reads the catalog. Room plans go unused.
4. The web registers the catalog and goes through SanctuaryFeature.
5. Community, Library, Classroom and Admin entries come back as each room is rebuilt.
6. Remove leftovers with your yes, and tell the other branches.
