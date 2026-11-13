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
| **Capacity** | What a bond records the person as (`CapacitySchema`): teacher, principal, `sectionHead`, `parent`, founder, developer, ... This is the role: every capacity has its own Workspace floor | role, persona, perspective, lens, view role, capacity family |
| **Capability** | What the person may do now, decided by the server for the active bond and carried in the signed authority snapshot | permission, right |

## The rules

1. **People only see what navigation offers.** Tabs, a floor's catalog, quick access, the task strip
   and deep links show only features the person has. Nothing on screen says "this is not for you",
   and there is no control to look at another role's features.
2. **The active bond decides the capacity.** The person chose a capacity at onboarding; each bond
   carries one. Changing capacity means changing bond (the scope switcher), never a setting on a page.
   In Explore, choosing a persona is the same act: it happens once on entry, and changing it is a
   deliberate switch like changing bond.
3. **Workspace is a floor per capacity.** Every capacity has its own Workspace floor, developers
   and section heads included: a teacher's and a principal's are different floors with different
   feature sets, and there is no common Workspace screen that filters itself. `/workspace` opens the
   floor of the active capacity. Two capacities may start with alike floors; they are still two.
   Priority (owner, 13 Nov): founder, principal and teacher first; then student, guardian, section
   head and grade head.
4. **Every other place is one floor for everyone.** Self, Community, Library and Profile look the
   same for every capacity; the features on them differ by capacity.
5. **A feature says who it is for, as a yes or no.** On Workspace, a floor lists its features; on
   the other places, a feature lists who it is for. That is product curation: *is this feature for
   this person?* It is not a score and not an order. (Every Self feature is for everyone for now;
   the owner curates later.)
6. **A feature also says which capability it needs.** That is security: *may this person, through
   this bond, do it now?* The server decides (Cedar) and the client reads the answer from the
   snapshot. The client may hide what is not allowed; it never grants.
7. **A feature is offered when both hold:** for the person's capacity, and the capability is
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
| Capacity | `@repo/core` `CapacitySchema` | The role itself; `capacityNamed` reads account and preview spellings alike |
| Self catalog | `@repo/self` `FEATURE_CATALOG` | Exists; role relevance is a weight per role (being replaced by yes/no) |
| Workspace catalog: features, and a floor per capacity | `@repo/core/logic/places/workspaceCatalog` (`WORKSPACE_FLOORS` does not compile without a floor for every capacity) | The web reads it (`workspaceFeatureRegistry` holds only the web route of each feature; `FloorGate` sends a link to another floor's feature to the person's own Workspace). Mobile still resolves its floor screen in `resolveWorkspaceRoute` |
| Community and Library catalogs | owning packages (to add when they have role-wise features) | Single floors |
| Capability decision | `@repo/core` `sanctuaryFeature`, `resolveFeaturePresentation` | Mobile uses it; the web does not |
| Capabilities | the signed authority snapshot (`authority.refreshSnapshot`) | The web uses a legacy bootstrap call and a client-side role-to-capability shim |
| Rendering | each app's renderer for a place (`browserFeatureRegistry`, `SelfFeatureRenderer`) | Exists for Self |

## Order of work

1. This document. *Done 13 Nov.*
2. Self: role weights became yes/no relevance; the weight sorting and the web's "universal feature"
   heuristic are gone. *Done 13 Nov.*
3. Workspace catalog in `@repo/core` with a floor per capacity. The web's Workspace floor, route
   tabs, quick access and command palette read it; the role lens, its all/common views, the
   web-only role lists and the route-level audience gates are gone. *Done 13 Nov.*
4. Mobile reads the Workspace catalog: `resolveWorkspaceRoute` and its floor screens per capacity.
5. The web reads capabilities from the signed snapshot (Explore: the sample school issues one for
   the chosen persona) and decides through `sanctuaryFeature`; the legacy bootstrap call and the Self
   shim go. Interim client rules left until then: who may edit the school profile
   (`spa/routes/_app/workspace/school.tsx`).
6. Each capacity's own Workspace screen: today teachers have one (`TeacherWorkspaceFloor`) and every
   other capacity shares the generic floor showing its own features. A capacity gets its screen in
   the web's floor-screen map without touching the catalog.
7. Community and Library get catalogs when they gain capacity-wise features.

## Open questions for the owner

- **Placement defaults.** The Self catalog also carries `defaultZone` and `defaultOrder`. Under rule 8
  these are placement; they either become the starting layout for a new person or leave the catalog.
- **What each floor holds** is product content: the floors were seeded on 13 Nov from what each
  capacity saw on the web (founders, co-founders and directors also have founder command;
  developers and founders the labs). Section heads, grade heads and the other capacities start with
  the teacher's tools until their own sets are decided.
