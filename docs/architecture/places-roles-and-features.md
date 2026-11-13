---
title: "Places, roles and features"
status: "active"
created: 2026-11-13
updated: 2026-11-13
author: "Claude, with Neev"
tags: [navigation, roles, features, catalog, workspace, self]
---

# Places, roles and features

How a person's role becomes what they see, on every platform. This is the shared model for web,
mobile and any other channel; code follows it, and where code says something else the code is
wrong. The owner set it on 13 Nov 2026.

## Words

One name per idea. The retired names on the right still appear in code and older docs; read them
as the canonical word and rename when the code is touched.

| Word | Meaning | Retired names for the same idea |
| --- | --- | --- |
| **Place** | One of the five tabs: Self, Workspace, Community, Library, Profile | tab, domain (when it means a tab), surface |
| **Floor** | The screen a place opens to | page, dashboard, overview, hub |
| **Feature** | Something a person can open on a floor: a practice, a tool, a view | capability (when it means a thing to open), task type, tool, practice item |
| **Catalog** | The list of a place's features, one per place | registry, manifest, feature registry, AppCatalog section |
| **Role** | The kind of person a floor or feature is for: student, teacher, principal, guardian, ... | persona, perspective, lens, view role, capacity family |
| **Capacity** | What a bond records the person as (`CapacitySchema`): `assistantPrincipal`, `parent`, ... Many capacities map to one role | — |
| **Capability** | What the person may do now, decided by the server for the active bond and carried in the signed authority snapshot | permission, right |

## The rules

1. **People only see what navigation offers.** Tabs, a floor's catalog, quick access, the task strip
   and deep links show only features the person has. Nothing on screen says "this is not for you",
   and there is no control to look at another role's features.
2. **The active bond decides the role.** The person chose a capacity at onboarding; each bond
   carries one. Changing role means changing bond (the scope switcher), never a setting on a page.
   In Explore, choosing a persona is the same act: it happens once on entry, and changing it is a
   deliberate switch like changing bond.
3. **Workspace is a floor per role.** A teacher's Workspace and a principal's Workspace are
   different floors with different feature sets; there is no common Workspace screen that filters
   itself. `/workspace` opens the floor of the active role. A feature belongs to the Workspace
   floors of the roles it is for.
4. **Every other place is one floor for everyone.** Self, Community, Library and Profile look the
   same for every role; the features on them differ by role.
5. **A feature says which roles it is for, as a yes or no per role.** That is product curation:
   *is this feature related to this role?* It is not a score and not an order.
6. **A feature also says which capability it needs.** That is security: *may this person, through
   this bond, do it now?* The server decides (Cedar) and the client reads the answer from the
   snapshot. The client may hide what is not allowed; it never grants.
7. **A feature is offered when both hold:** related to the person's role, and the capability is
   granted. Otherwise it is absent from navigation.
8. **The catalog does not place features.** Where a feature sits on a floor (zone, order, pinned)
   belongs to the person's layout, not to the catalog. The catalog lists features; the person
   arranges them.
9. **A link to a feature the person does not have opens their own floor of that place.** A teacher
   following a link to a principal tool lands on their Workspace, as mobile does. No error page.
10. **Every platform reads the same catalogs.** Catalogs live in shared packages (`@repo/core` or
    the owning domain package); an app only says which features it can render.

## What each piece is in code

| Piece | Home | Today |
| --- | --- | --- |
| Role and capacity → role | `@repo/core` | Three separate maps that disagree (see open questions) |
| Self catalog | `@repo/self` `FEATURE_CATALOG` | Exists; role relevance is a weight per role (being replaced by yes/no) |
| Workspace catalog, a feature set per role | `@repo/core` (to add) | Mobile resolves the role's floor (`resolveWorkspaceRoute`); the web has its own `WORKSPACE_FEATURES` with a role lens, which goes |
| Community and Library catalogs | owning packages (to add when they have role-wise features) | Single floors |
| Capability decision | `@repo/core` `sanctuaryFeature`, `resolveFeaturePresentation` | Mobile uses it; the web does not |
| Capabilities | the signed authority snapshot (`authority.refreshSnapshot`) | The web uses a legacy bootstrap call and a client-side role-to-capability shim |
| Rendering | each app's renderer for a place (`browserFeatureRegistry`, `SelfFeatureRenderer`) | Exists for Self |

## Order of work

1. This document.
2. Self: role weights become yes/no roles; the weight sorting and the web's "universal feature"
   heuristic go. Today every weight above zero shows the feature, so each such role becomes "related"
   and nothing appears or disappears; the owner then curates the lists.
3. Role vocabulary in `@repo/core`: `Role` and one `roleOf(capacity)`, once the open questions are
   answered; every scattered map reads it.
4. Workspace catalog in `@repo/core`: each role's floor and its features, each with its roles and
   capability. Mobile's `resolveWorkspaceRoute` and the web's Workspace floor both read it; the web's
   role lens, its all/common views and `WORKSPACE_FEATURES` go.
5. The web reads capabilities from the signed snapshot (Explore: the sample school issues one for
   the chosen persona) and decides through `sanctuaryFeature`; the legacy bootstrap call, the Self
   shim and the route-level audience gates go.
6. Navigation (tabs, catalog, quick access, task strip) and deep links are built from resolved
   features only, on both apps.
7. Community and Library get catalogs when they gain role-wise features.

## Open questions for the owner

- **Which capacities share a role**, that is, a Workspace floor. Today:
  - `gradeHead` and `sectionHead`: mobile gives each its own Workspace floor; Self treats both as
    principal.
  - `developer` and `systemEngineer`: Self treats `developer` as admin; mobile has no Workspace floor
    for either.
  - `coFounder` and `director`: counted as stewards for founder command, but no Workspace floor.
  - `librarian` (Self: teacher), `nurse` (no mapping) and `member` (Self: student).
- **Placement defaults.** The Self catalog also carries `defaultZone` and `defaultOrder`. Under rule 8
  these are placement; they either become the starting layout for a new person or leave the catalog.
