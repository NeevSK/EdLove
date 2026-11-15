# Room catalogs: one feature list per room

Decided by Neev on 14 Nov 2026. This replaces the room plans (`ROOM_PLANS`) and the web's own Workspace list.

## The words

- **Sanctuary**: the whole app.
- **Room**: what a tab opens (Self, Workspace, Community, Library, Profile).
- **Floor**: what a room opens to. Its furniture is arranged by the floor engine.
- **World**: every visual follows it.
- **Feature**: something a person opens on a floor (furniture).
- **Catalog**: the room's feature list. There is one per room, and it lives in the AppCatalog.
- **SanctuaryFeature**: decides whether a person may have a feature. If a feature is not in the catalog, it does not work.
- **Canvas layout**: the arrangement of the features plus the shape of each one.

## Where things live

| What | Where |
|---|---|
| Entry type | `packages/core/src/logic/registry/domainEntry.ts` (`DomainEntry`, `FeatureFloor`) |
| Room catalogs | each package's `constants/*Registry.ts` (Self, Classroom, Community, Library, Admin, AI, Form Builder, Workforce) |
| Assembled AppCatalog | phone `apps/gurudevi-mobile/src/boot/registerAppCatalog.ts`, web `apps/gurudevi-web/lib/appCatalog.ts` (same registries) |
| Zones and groups of each room's floor | `packages/core/src/logic/floor/rooms.ts` (`ROOM_FLOORS`) |
| A room for one role | `roomCatalogOf(catalog, room, capacity, platform)` |
| SanctuaryFeature for a whole room | phone: `useRoomPresentation(features)` in `logic/registry/useDomainFeature.ts`; web: `resolveRoomPresentation` in `apps/gurudevi-web/lib/sanctuary/roomAccess.ts` |
| SanctuaryFeature's gates, as one plain function | `evaluateFeatureFor(person, action, subject, requirement)` in `logic/permissions/personAccess.ts` |
| What an entry asks of SanctuaryFeature | `requirementOf` and `roomPresentationOf` in `logic/registry/featureRequirement.ts` |
| The floor on each platform | phone `src/components/floor/RoomFloor.tsx`, web `app/(sanctuary)/components/RoomFloor.tsx`; both use `layoutRoomFloor` |

## What an entry says

These fields already existed: identity, the platforms it supports, its state, the gates SanctuaryFeature checks (citizenship, capability, entitlement, flag), the tab (`tabDomain`), `defaultZone` and `defaultOrder`.

These were added on 14 Nov:

- `roles`: which roles see it (teacher, student, principal, guardian, or an exact capacity). If `roles` is missing, every role sees it. A `common` feature is offered to every role.
- `floor`: where it starts on the floor.
  - `group`: which group it sits in.
  - `shape`: the kit component that draws it (row, card, rail, list, grid).
  - `urgency`: now, later or any time.
  - Attention hints: `task`, `lit`, `needsAttention` and `weight`.
- `time`: the time lens. This covers which of review, current and plan it supports, its home mode, and the rule for past records.
- `icon`, `routes.web`, `routes.mobile`, `capabilityId`.

Only entries that have a `floor` are furniture. Other entries, such as a room shell or a dashboard, stay in the catalog for SanctuaryFeature, but the floor engine does not lay them out.

## Rules

- Add a feature by adding a catalog entry. Never add a list beside the catalog.
- A screen asks the catalog what exists, and it asks SanctuaryFeature whether the person may have it. The person's saved layout moves, hides and pins features. The world and the verger set the floor's character.
- Each platform keeps only how it draws a feature. For example, the web's Self drawing map stays in `self/browserFeatureRegistry.ts`.
- Self's 23 single features (`packages/self/src/features/featureCatalog.ts`) are the contents of the seven Self catalog entries. Each Self entry is one piece of furniture.

## Web or phone: said once

- **Room features:** an entry's `webSupport` and `mobileSupport` are the only answer to "can this platform open it". SanctuaryFeature and the floors both read them.
- **Features that run a declared capability:** when an entry names a `capabilityId`, the capability manifest (`logic/registry/capabilityManifest.ts`) says where it runs. The entry spreads `...platformSupportOf(id)` instead of restating it, and `registerDomains` refuses an entry that restates it differently. The manifest's `practice.platforms` is a different question: where the practice mode works.
- **Self's single features:** each platform declares what it can run from its own renderers: the web from `BROWSER_SELF_FEATURES`, the phone from `NATIVE_SELF_DELIVERY` (the components `SelfFeatureRenderer` has). Nothing is assumed by default.
- `channelAffordance` covers only channels beyond the two apps (WhatsApp, MCP). Its own web and phone flags were removed.

## A room's screens

Each tab opens one room, and each room has exactly one main screen: Overview (Self, Workspace), the whole shelf (Library), and so on. The floor and layout work drives only that main screen. There are never two main screens for one tab. Every other screen of the room is a catalog feature with a web route under the room (`/library/map`, `/community/forest`, `/workspace/plan`; the school's `/admin/...` screens are Workspace screens) and opens on the same room floor as Overview:

- **Web.** `SanctuaryShell` sees that the path is a room's screen (`roomScreenOf`) and draws the page inside the room's `SanctuaryFloorCanvas`: the same world ground and the same reception bar, which reads "Room · Screen". The room's strip (`RoomRouteTabs`, the one strip for every room) shows Overview first, then every screen opened in the room, with the one on show focused. A screen opened from Overview is added to that strip, and choosing it on Overview's strip goes to its address. Overview and the screens share one task list per room.
- **One overview for every role.** A room's main screen is drawn for the role that is on (the role switch swaps it). A role's own parts are catalog entries with that role, drawn on the main screen, never a separate dashboard. The principal's parts are `principal-pulse`, `principal-brief`, `principal-curriculum` and `principal-leaves` (web drawings in `admin/principal/principalParts.tsx`, placed by `WorkspaceFloor`'s `ROLE_PART_DRAWINGS`). The old Principal Command Center page stays on disk but is no longer offered on the web.
- **Community's main screen has three main tabs: Feed, Groups and Messages.** The chosen one is on the floor (Feed first), on the web (`CommunityFeedFloor`) and on the phone (`CommunityRoom`, which shows only the chosen tab's catalog features). Notices sit under Feed, and other groups to join sit under Groups.
- **Phone.** Overview is `RoomFront` (the room floor). The other screens are stack screens under the room's tab, most of them drawn with `RoomPage` on the world's ground.

## Not done yet

- **Screens on the web still carry their own "Back to …" link and, in some places, their own background.** The room's strip already offers Overview, so these links repeat it. Removing them, and letting each screen sit directly on the floor, is the next step for each screen.
- **Detail screens that are not catalog features** (a book in the reader, a chat, a collection) draw on the room floor, but they add no task of their own to the strip.
- **Library, Community and Self also switch screens inside Overview** (Library's catalog, Community's sections, Self's practices), through the same strip. Those stay as they are.

- **The web has no entitlement source.** On the web, SanctuaryFeature runs on the server: it uses the server-checked entry (account, bond, capacity, citizenship) and the permission snapshot that the API signs (`authority.refreshSnapshot`), and it checks the signature. There is no entitlement source yet, on the web or through the v1 API. So every web account counts as FREE, and a paid feature shows as needing an upgrade. If the snapshot is missing or does not check, protected features wait ("loading") rather than open.
- **The web rooms and the catalog (14 Nov).** Every web room now reads its features from the catalog and gets SanctuaryFeature's decision from the server (`resolveRoomPresentation`):
  - Workspace: its feature list and quick access.
  - Community: the sections (feed, groups, messages) and quick access. The web's own drawing words stay in `CommunityFeedFloor`.
  - Library: the overview shelves are laid out by the room floor (`RoomFloor`). Each catalog feature has a drawing in `LibraryFloor`, and "See all" opens a group.
  - Self: the practices come from the Self entries offered to the person's own role. Each single practice belongs to the entry named by its `domain`. The Self overview keeps its own layout for now; moving it onto the room floor is the next step.
- **Self has two maps from a practice to its entry.** One is each practice's `domain`, which the web uses. The other is each entry's `presentation.featureIds`. The two disagree: `breath_guide`, `energy_forecast` and `wind_down_ritual` are in no `featureIds` list, `reframe` is listed but has no practice, and three practices are listed under two entries. One of the two maps should go.
- **Features with no screen on a platform say so.** Trust Network and School shelf have `webSupport: false` because the web has no drawing for them. School Forest is a web-only Community entry.
- **The web asks for a fresh snapshot on every Workspace load.** That is one API call and one row upsert per load. It should be cached for each bond until shortly before it expires.
- **Workforce is hidden on the web.** The catalog marks Workforce as `development`, so the web no longer lists it. Its page still exists.
- **Most Workspace features have no phone screen yet.** The phone's Workspace main screen is now always the room floor (the `EXPO_PUBLIC_WORK_FLOOR` switch is gone), so those features show without opening anything.
