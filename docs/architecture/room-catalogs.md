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
| SanctuaryFeature for a whole room | `useRoomPresentation(features)` in `logic/registry/useDomainFeature.ts` |
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

## Not done yet

- **The web has no SanctuaryFeature context.** The web does not fill the auth, Cedar or entitlement stores that SanctuaryFeature reads. The web floor therefore treats every catalog feature as available, until those stores are filled on the web.
- **Workforce is hidden on the web.** The catalog marks Workforce as `development`, so the web no longer lists it. Its page still exists.
- **The phone's work floor is still opt-in.** It is switched on with `EXPO_PUBLIC_WORK_FLOOR=1`, and most Workspace features have no phone screen yet.
